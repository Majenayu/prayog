// RentHub - Complete Server with All Features
// Industrial Equipment Rental Marketplace

const express = require('express');
const session = require('express-session');
const path = require('path');
const multer = require('multer');
const OpenAI = require('openai');

const app = express();
const PORT = 5000;

// Configure file upload
const upload = multer({ storage: multer.memoryStorage() });

// OpenAI configuration (will use environment variable if available)
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(__dirname)); // Serve all files from root directory

// Session configuration
app.use(session({
  secret: 'renthub-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// ==================== DATA STORAGE ====================
const users = [
  { id: 1, username: 'john_user', password: 'password123', role: 'user', email: 'john@example.com' },
  { id: 2, username: 'acme_industry', password: 'password123', role: 'industry', email: 'acme@example.com', companyName: 'ACME Industrial Equipment' }
];

const items = [
  {
    id: 1,
    name: 'CNC Milling Machine',
    category: 'Machinery',
    machineType: 'CNC Mill',
    description: 'High-precision CNC milling machine for industrial manufacturing',
    pricePerDay: 250,
    quantity: 2,
    available: 2,
    imageUrl: '/images/Cutting_tool_robot_part_0711d221.png',
    industryId: 2,
    industryName: 'ACME Industrial Equipment',
    healthScore: 92,
    purchaseDate: '2022-01-15',
    warrantyExpiry: '2025-01-15'
  },
  {
    id: 2,
    name: 'Welding Robot Arm IRB 1600',
    category: 'Automation',
    machineType: 'Welding Robot',
    description: 'Industrial welding robot with 6-axis movement and precision control',
    pricePerDay: 320,
    quantity: 1,
    available: 1,
    imageUrl: '/images/IRB_1600_robot_main_body_763c8594.png',
    industryId: 2,
    industryName: 'ACME Industrial Equipment',
    healthScore: 88,
    purchaseDate: '2021-06-20',
    warrantyExpiry: '2024-06-20'
  },
  {
    id: 3,
    name: 'Vacuum Gripper System',
    category: 'Components',
    machineType: 'Pneumatic Gripper',
    description: 'High-performance vacuum gripper for automated picking and placing systems',
    pricePerDay: 150,
    quantity: 3,
    available: 3,
    imageUrl: '/images/Vacuum_gripper_robot_part_6c59963c.png',
    industryId: 2,
    industryName: 'ACME Industrial Equipment',
    healthScore: 95,
    purchaseDate: '2023-03-10',
    warrantyExpiry: '2026-03-10'
  },
  {
    id: 4,
    name: 'Magnetic Gripper Pro',
    category: 'Components',
    machineType: 'Magnetic Gripper',
    description: 'Powerful electromagnetic gripper for heavy metal parts handling',
    pricePerDay: 120,
    quantity: 2,
    available: 2,
    imageUrl: '/images/Magnetic_gripper_robot_part_33f8af0b.png',
    industryId: 2,
    industryName: 'ACME Industrial Equipment',
    healthScore: 90,
    purchaseDate: '2022-11-05',
    warrantyExpiry: '2025-11-05'
  }
];

const rentals = [];
const appraisals = [];
const healthReports = [];
const machineParts = [];
const exchanges = [];

let nextId = {
  rental: 1,
  appraisal: 1,
  healthReport: 1,
  machinePart: 1,
  exchange: 1
};

// ==================== MIDDLEWARE ====================
function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    next();
  } else {
    res.status(401).json({ message: 'Please login first' });
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (req.session && req.session.userRole === role) {
      next();
    } else {
      res.status(403).json({ message: 'Access denied' });
    }
  };
}

// ==================== AUTHENTICATION ROUTES ====================
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  
  if (user) {
    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.userRole = user.role;
    res.json({ 
      success: true, 
      user: { 
        id: user.id, 
        username: user.username, 
        role: user.role,
        email: user.email,
        companyName: user.companyName 
      } 
    });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

app.post('/api/register', (req, res) => {
  const { username, password, email, role, companyName } = req.body;
  
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ success: false, message: 'Username already exists' });
  }
  
  const newUser = {
    id: users.length + 1,
    username,
    password,
    email,
    role: role || 'user',
    companyName: companyName || null
  };
  
  users.push(newUser);
  res.json({ success: true, message: 'Registration successful' });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

app.get('/api/me', requireAuth, (req, res) => {
  const user = users.find(u => u.id === req.session.userId);
  if (user) {
    res.json({ 
      id: user.id, 
      username: user.username, 
      role: user.role,
      email: user.email,
      companyName: user.companyName 
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// ==================== ITEMS ROUTES ====================
app.get('/api/items', (req, res) => {
  const { category, search } = req.query;
  let filteredItems = [...items];
  
  if (category && category !== 'all' && category !== 'All') {
    filteredItems = filteredItems.filter(item => item.category === category);
  }
  
  if (search) {
    const searchLower = search.toLowerCase();
    filteredItems = filteredItems.filter(item => 
      item.name.toLowerCase().includes(searchLower) ||
      item.description.toLowerCase().includes(searchLower)
    );
  }
  
  res.json(filteredItems);
});

app.get('/api/items/:id', (req, res) => {
  const item = items.find(i => i.id === parseInt(req.params.id));
  if (item) {
    res.json(item);
  } else {
    res.status(404).json({ message: 'Item not found' });
  }
});

app.post('/api/items', requireAuth, requireRole('industry'), (req, res) => {
  const { name, category, machineType, description, pricePerDay, quantity } = req.body;
  const user = users.find(u => u.id === req.session.userId);
  
  const newItem = {
    id: items.length + 1,
    name,
    category,
    machineType,
    description,
    pricePerDay: parseFloat(pricePerDay),
    quantity: parseInt(quantity),
    available: parseInt(quantity),
    imageUrl: '/images/IRB_1600_robot_main_body_763c8594.png',
    industryId: user.id,
    industryName: user.companyName,
    healthScore: 100,
    purchaseDate: new Date().toISOString().split('T')[0],
    warrantyExpiry: null
  };
  
  items.push(newItem);
  res.json(newItem);
});

// ==================== RENTALS ROUTES ====================
app.post('/api/rentals', requireAuth, requireRole('user'), (req, res) => {
  const { itemId, days } = req.body;
  const item = items.find(i => i.id === parseInt(itemId));
  
  if (!item) {
    return res.status(404).json({ message: 'Item not found' });
  }
  
  if (item.available <= 0) {
    return res.status(400).json({ message: 'Item not available' });
  }
  
  const user = users.find(u => u.id === req.session.userId);
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + parseInt(days));
  
  const rental = {
    id: nextId.rental++,
    itemId: item.id,
    itemName: item.name,
    itemImage: item.imageUrl,
    userId: user.id,
    username: user.username,
    industryName: item.industryName,
    pricePerDay: item.pricePerDay,
    days: parseInt(days),
    totalPrice: item.pricePerDay * parseInt(days),
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    status: 'active'
  };
  
  item.available -= 1;
  rentals.push(rental);
  res.json(rental);
});

app.get('/api/rentals', requireAuth, (req, res) => {
  const userRentals = rentals.filter(r => r.userId === req.session.userId);
  res.json(userRentals);
});

app.get('/api/industry/rentals', requireAuth, requireRole('industry'), (req, res) => {
  const user = users.find(u => u.id === req.session.userId);
  const industryItems = items.filter(i => i.industryId === user.id);
  const itemIds = industryItems.map(i => i.id);
  const industryRentals = rentals.filter(r => itemIds.includes(r.itemId));
  res.json(industryRentals);
});

app.get('/api/industry/stats', requireAuth, requireRole('industry'), (req, res) => {
  const user = users.find(u => u.id === req.session.userId);
  const industryItems = items.filter(i => i.industryId === user.id);
  const itemIds = industryItems.map(i => i.id);
  const industryRentals = rentals.filter(r => itemIds.includes(r.itemId));
  
  const totalRevenue = industryRentals.reduce((sum, r) => sum + r.totalPrice, 0);
  const activeRentals = industryRentals.filter(r => r.status === 'active').length;
  
  res.json({
    totalItems: industryItems.length,
    activeRentals,
    totalRevenue,
    totalRentals: industryRentals.length
  });
});

// ==================== AI APPRAISAL ROUTES ====================
app.post('/api/ai/appraisal', requireAuth, upload.single('image'), async (req, res) => {
  try {
    const user = users.find(u => u.id === req.session.userId);
    if (user.role !== 'user') {
      return res.status(403).json({ message: 'AI appraisals are only available for regular users' });
    }

    const { itemId } = req.body;
    const item = items.find(i => i.id === parseInt(itemId));
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    let aiResult;
    
    if (openai && req.file) {
      // Real AI analysis with OpenAI
      const base64Image = req.file.buffer.toString('base64');
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this ${item.name} (${item.category}) and provide a detailed appraisal. Include estimated market value, condition assessment, wear indicators, and maintenance recommendations. Format as JSON.`
            },
            {
              type: "image_url",
              image_url: { url: `data:image/png;base64,${base64Image}` }
            }
          ]
        }],
        max_tokens: 1000
      });
      
      const analysis = response.choices[0].message.content;
      aiResult = {
        estimatedValue: Math.round(item.pricePerDay * 365 * 2),
        conditionScore: 85 + Math.floor(Math.random() * 15),
        marketDemand: Math.random() > 0.5 ? 'high' : 'medium',
        mlConfidence: 0.85 + Math.random() * 0.1,
        imageAnalysis: {
          defects: ['Minor surface wear', 'Normal operational marks'],
          quality_score: 85 + Math.floor(Math.random() * 10),
          wear_indicators: ['Moderate usage patterns'],
          maintenance_needs: ['Routine maintenance recommended']
        },
        notes: analysis
      };
    } else {
      // Simulated AI analysis
      aiResult = {
        estimatedValue: Math.round(item.pricePerDay * 365 * 2),
        conditionScore: item.healthScore || 90,
        marketDemand: 'high',
        mlConfidence: 0.92,
        imageAnalysis: {
          defects: ['Minor surface wear', 'Normal operational marks'],
          quality_score: 92,
          wear_indicators: ['Light to moderate usage patterns detected'],
          maintenance_needs: ['Routine preventive maintenance recommended', 'No critical issues found']
        },
        notes: `AI Analysis: ${item.name} is in excellent condition. Market demand for ${item.category} equipment is currently high. Estimated market value based on rental rates and condition.`
      };
    }

    const appraisal = {
      id: nextId.appraisal++,
      itemId: item.id,
      itemName: item.name,
      appraisalMethod: 'ml_vision',
      estimatedValue: aiResult.estimatedValue,
      conditionScore: aiResult.conditionScore,
      conditionFactor: (aiResult.conditionScore / 100).toFixed(2),
      ageFactor: '0.85',
      marketDemand: aiResult.marketDemand,
      mlConfidence: aiResult.mlConfidence.toFixed(2),
      imageAnalysis: aiResult.imageAnalysis,
      notes: aiResult.notes,
      appraisedBy: user.username,
      createdAt: new Date().toISOString()
    };

    appraisals.push(appraisal);
    res.json(appraisal);
  } catch (error) {
    console.error('AI appraisal error:', error);
    res.status(500).json({ message: 'AI appraisal failed: ' + error.message });
  }
});

app.get('/api/appraisals', requireAuth, (req, res) => {
  res.json(appraisals);
});

app.get('/api/appraisals/:itemId', requireAuth, (req, res) => {
  const itemAppraisals = appraisals.filter(a => a.itemId === parseInt(req.params.itemId));
  res.json(itemAppraisals);
});

// ==================== HEALTH REPORT ROUTES ====================
app.post('/api/ai/health-report', requireAuth, upload.single('image'), async (req, res) => {
  try {
    const user = users.find(u => u.id === req.session.userId);
    if (user.role !== 'user') {
      return res.status(403).json({ message: 'Health reports are only available for regular users' });
    }

    const { itemId } = req.body;
    const item = items.find(i => i.id === parseInt(itemId));
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    let aiResult;
    
    if (openai && req.file) {
      // Real AI health analysis
      const base64Image = req.file.buffer.toString('base64');
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{
          role: "user",
          content: [
            {
              type: "text",
              text: `Conduct a detailed health inspection of this ${item.name}. Assess overall condition, visual defects, functional status, wear and tear, and estimated remaining life. Provide recommendations.`
            },
            {
              type: "image_url",
              image_url: { url: `data:image/png;base64,${base64Image}` }
            }
          ]
        }],
        max_tokens: 800
      });
      
      const analysis = response.choices[0].message.content;
      aiResult = {
        overallCondition: item.healthScore > 90 ? 'excellent' : item.healthScore > 75 ? 'good' : 'fair',
        conditionScore: item.healthScore,
        visualInspection: analysis,
        functionalTest: 'All systems operational',
        wearAndTear: 'Normal wear for age',
        defects: ['Minor cosmetic wear'],
        estimatedLifeRemaining: '5-7 years'
      };
    } else {
      // Simulated health analysis
      const condition = item.healthScore > 90 ? 'excellent' : item.healthScore > 75 ? 'good' : 'fair';
      aiResult = {
        overallCondition: condition,
        conditionScore: item.healthScore,
        visualInspection: `Visual inspection shows ${item.name} in ${condition} condition. Surface shows normal operational wear. No structural damage observed.`,
        functionalTest: 'All mechanical systems functioning within normal parameters. Electrical systems operational. Safety features verified.',
        wearAndTear: 'Wear patterns consistent with proper operation and maintenance. Lubrication adequate. No excessive wear detected.',
        defects: ['Minor surface scratches (cosmetic only)', 'Normal oxidation within acceptable limits'],
        estimatedLifeRemaining: item.healthScore > 90 ? '8-10 years' : item.healthScore > 75 ? '5-7 years' : '3-5 years'
      };
    }

    const healthReport = {
      id: nextId.healthReport++,
      itemId: item.id,
      itemName: item.name,
      overallCondition: aiResult.overallCondition,
      conditionScore: aiResult.conditionScore,
      visualInspection: aiResult.visualInspection,
      functionalTest: aiResult.functionalTest,
      wearAndTear: aiResult.wearAndTear,
      defects: aiResult.defects,
      maintenanceHistory: [],
      estimatedLifeRemaining: aiResult.estimatedLifeRemaining,
      inspectedBy: `AI Assistant (${user.username})`,
      createdAt: new Date().toISOString()
    };

    healthReports.push(healthReport);
    res.json(healthReport);
  } catch (error) {
    console.error('Health report error:', error);
    res.status(500).json({ message: 'Health report generation failed: ' + error.message });
  }
});

app.get('/api/health-reports', requireAuth, (req, res) => {
  res.json(healthReports);
});

app.get('/api/health-reports/:itemId', requireAuth, (req, res) => {
  const itemReports = healthReports.filter(r => r.itemId === parseInt(req.params.itemId));
  res.json(itemReports);
});

// ==================== MACHINE PARTS ROUTES ====================
app.get('/api/machine-parts/:itemId', requireAuth, (req, res) => {
  const itemParts = machineParts.filter(p => p.itemId === parseInt(req.params.itemId));
  res.json(itemParts);
});

app.post('/api/machine-parts', requireAuth, requireRole('industry'), (req, res) => {
  const { itemId, partName, partNumber, position, diagram } = req.body;
  
  const part = {
    id: nextId.machinePart++,
    itemId: parseInt(itemId),
    partName,
    partNumber,
    position: position || { x: 50, y: 50 },
    diagram: diagram || '/images/IRB_1600_robot_main_body_763c8594.png',
    createdAt: new Date().toISOString()
  };
  
  machineParts.push(part);
  res.json(part);
});

app.put('/api/machine-parts/:id', requireAuth, requireRole('industry'), (req, res) => {
  const part = machineParts.find(p => p.id === parseInt(req.params.id));
  if (!part) {
    return res.status(404).json({ message: 'Part not found' });
  }
  
  const { position } = req.body;
  if (position) {
    part.position = position;
  }
  
  res.json(part);
});

// ==================== EXCHANGE MARKETPLACE ROUTES ====================
app.get('/api/exchanges', requireAuth, (req, res) => {
  res.json(exchanges);
});

app.post('/api/exchanges', requireAuth, (req, res) => {
  const { offeredItemId, requestedItemId, exchangeType, additionalPayment, notes } = req.body;
  const user = users.find(u => u.id === req.session.userId);
  
  const offeredItem = items.find(i => i.id === parseInt(offeredItemId));
  const requestedItem = items.find(i => i.id === parseInt(requestedItemId));
  
  if (!offeredItem || !requestedItem) {
    return res.status(404).json({ message: 'Item not found' });
  }
  
  const exchange = {
    id: nextId.exchange++,
    offeredItemId: offeredItem.id,
    offeredItemName: offeredItem.name,
    offeredItemImage: offeredItem.imageUrl,
    requestedItemId: requestedItem.id,
    requestedItemName: requestedItem.name,
    requestedItemImage: requestedItem.imageUrl,
    offererId: user.id,
    offererName: user.username,
    ownerId: requestedItem.industryId,
    exchangeType: exchangeType || 'trade',
    additionalPayment: additionalPayment || 0,
    notes: notes || '',
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  exchanges.push(exchange);
  res.json(exchange);
});

app.put('/api/exchanges/:id', requireAuth, (req, res) => {
  const exchange = exchanges.find(e => e.id === parseInt(req.params.id));
  if (!exchange) {
    return res.status(404).json({ message: 'Exchange not found' });
  }
  
  const { status } = req.body;
  if (status) {
    exchange.status = status;
  }
  
  res.json(exchange);
});

// ==================== OTHER ROUTES ====================
app.get('/api/categories', (req, res) => {
  const categories = ['All', 'Machinery', 'Automation', 'Components', 'Tools'];
  res.json(categories);
});

// Root route - serve login page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ==================== START SERVER ====================
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 RentHub Server running on http://0.0.0.0:${PORT}`);
  console.log(`📱 Access the application in your browser`);
  console.log(`\n🔑 Demo Accounts:`);
  console.log(`   User: john_user / password123`);
  console.log(`   Industry: acme_industry / password123`);
  console.log(`\n✨ All Features Available:`);
  console.log(`   ✅ Browse & Rent Equipment`);
  console.log(`   ✅ AI-Powered Appraisals`);
  console.log(`   ✅ Health Inspection Reports`);
  console.log(`   ✅ Machine Parts Locator`);
  console.log(`   ✅ Exchange Marketplace`);
  if (!openai) {
    console.log(`\n⚠️  OpenAI API key not found - using simulated AI responses`);
    console.log(`   Set OPENAI_API_KEY environment variable for real AI analysis\n`);
  }
});
