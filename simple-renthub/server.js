// Simple RentHub Server
// A rental marketplace platform for industrial equipment

const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Session configuration
app.use(session({
  secret: 'renthub-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// In-memory data storage (simple database replacement)
const users = [
  { id: 1, username: 'john_user', password: 'password123', role: 'user', email: 'john@example.com' },
  { id: 2, username: 'acme_industry', password: 'password123', role: 'industry', email: 'acme@example.com', companyName: 'ACME Industrial' }
];

const items = [
  {
    id: 1,
    name: 'CNC Milling Machine',
    category: 'Machinery',
    description: 'High-precision CNC milling machine for industrial use',
    pricePerDay: 250,
    quantity: 2,
    available: 2,
    imageUrl: '/images/generated_images/Cutting_tool_robot_part_0711d221.png',
    industryId: 2,
    industryName: 'ACME Industrial',
    healthScore: 92
  },
  {
    id: 2,
    name: 'Welding Robot Arm',
    category: 'Automation',
    description: 'Industrial welding robot with 6-axis movement',
    pricePerDay: 320,
    quantity: 1,
    available: 1,
    imageUrl: '/images/generated_images/Welding_torch_robot_part_8d09dbdf.png',
    industryId: 2,
    industryName: 'ACME Industrial',
    healthScore: 88
  },
  {
    id: 3,
    name: 'Vacuum Gripper System',
    category: 'Components',
    description: 'Vacuum gripper for automated picking systems',
    pricePerDay: 150,
    quantity: 3,
    available: 3,
    imageUrl: '/images/generated_images/Vacuum_gripper_robot_part_6c59963c.png',
    industryId: 2,
    industryName: 'ACME Industrial',
    healthScore: 95
  },
  {
    id: 4,
    name: 'Magnetic Gripper',
    category: 'Components',
    description: 'Powerful magnetic gripper for metal parts',
    pricePerDay: 120,
    quantity: 2,
    available: 2,
    imageUrl: '/images/generated_images/Magnetic_gripper_robot_part_33f8af0b.png',
    industryId: 2,
    industryName: 'ACME Industrial',
    healthScore: 90
  }
];

const rentals = [];
let rentalIdCounter = 1;

// Authentication middleware
function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    next();
  } else {
    res.status(401).json({ message: 'Please login first' });
  }
}

// Role-based middleware
function requireRole(role) {
  return (req, res, next) => {
    if (req.session && req.session.userRole === role) {
      next();
    } else {
      res.status(403).json({ message: 'Access denied' });
    }
  };
}

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages', 'login.html'));
});

// Authentication routes
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
  
  // Check if username already exists
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

// Items routes
app.get('/api/items', (req, res) => {
  const { category, search } = req.query;
  let filteredItems = [...items];
  
  if (category && category !== 'all') {
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
  const { name, category, description, pricePerDay, quantity } = req.body;
  const user = users.find(u => u.id === req.session.userId);
  
  const newItem = {
    id: items.length + 1,
    name,
    category,
    description,
    pricePerDay: parseFloat(pricePerDay),
    quantity: parseInt(quantity),
    available: parseInt(quantity),
    imageUrl: '/images/generated_images/IRB_1600_robot_main_body_763c8594.png', // Default image
    industryId: user.id,
    industryName: user.companyName,
    healthScore: 100
  };
  
  items.push(newItem);
  res.json(newItem);
});

// Rentals routes
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
    id: rentalIdCounter++,
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
  
  // Decrease available quantity
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

// Categories endpoint
app.get('/api/categories', (req, res) => {
  const categories = ['All', 'Machinery', 'Automation', 'Components', 'Tools'];
  res.json(categories);
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 RentHub Server running on http://0.0.0.0:${PORT}`);
  console.log(`📱 Access the application in your browser`);
  console.log(`\n🔑 Demo Accounts:`);
  console.log(`   User: john_user / password123`);
  console.log(`   Industry: acme_industry / password123`);
});
