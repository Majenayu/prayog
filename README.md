# RentHub - Industrial Equipment Rental Marketplace

**RentHub** is a comprehensive full-stack web application designed to revolutionize the industrial equipment rental industry. Built with modern web technologies, it provides a seamless marketplace where industrial businesses can list their equipment for rent, while contractors and other users can easily browse, rent, and manage industrial machinery and tools.

---

## 🌟 Key Features

### For Industry Users (Equipment Owners)
- **Equipment Listing Management**: Add, update, and manage industrial equipment inventory
- **Part-Based Rental System**: List individual machine parts and attachments separately
- **AI-Powered Health Reports**: Generate automated equipment condition assessments using computer vision
- **AI Appraisal System**: Get intelligent market valuations for equipment
- **Rental Dashboard**: Track all active rentals and revenue analytics
- **Repair Request Management**: Receive and manage repair requests from renters
- **Exchange Marketplace**: Create equipment exchange offers (item-for-item or item-for-cash)

### For Regular Users (Renters)
- **Equipment Browsing**: Browse available industrial equipment with detailed specifications
- **Shopping Cart System**: Add multiple items to cart with customizable rental duration
- **Machine Parts Rental**: Rent specific parts/attachments instead of entire machines
- **Rental History**: Track current and past rentals
- **Repair Requests**: Submit repair requests for rented equipment
- **Exchange Marketplace**: Browse and respond to equipment exchange offers

### AI-Powered Features
- **Visual Inspection Analysis**: Upload equipment photos for automated condition assessment
- **Market Valuation**: AI-driven appraisal system considering condition, age, and market demand
- **Defect Detection**: Computer vision analysis to identify wear, damage, and defects
- **Maintenance Recommendations**: AI-generated maintenance schedules and life expectancy estimates

---

## 🏗️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** - Lightning-fast build tool and dev server
- **Wouter** - Minimalist routing solution
- **TanStack Query (React Query v5)** - Powerful data fetching and state management
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn UI** - Beautifully designed component library
- **Framer Motion** - Production-ready animation library
- **React Hook Form** - Performant form validation
- **Zod** - TypeScript-first schema validation

### Backend
- **Node.js 20** with Express.js
- **TypeScript** - Type-safe development
- **PostgreSQL** - Robust relational database (Neon serverless)
- **Drizzle ORM** - Type-safe database toolkit
- **Passport.js** - Authentication middleware
- **Express Session** - Session management
- **Bcrypt** - Password hashing

### AI & Cloud Services
- **OpenAI GPT-4 Vision** - Image analysis and condition assessment
- **Cloudinary** - Image hosting and management
- **Multer** - File upload handling

### Development Tools
- **TSX** - TypeScript execution engine
- **ESBuild** - Fast JavaScript bundler
- **Drizzle Kit** - Database migration toolkit

---

## 📊 Database Schema

### Core Tables

#### Users
- Stores user accounts with role-based access (industry/user)
- Includes company information for industry accounts
- Encrypted password storage with bcrypt

#### Items (Equipment)
- Equipment listings with detailed specifications
- Support for parent-child relationships (main machine → parts)
- Image storage via Cloudinary
- Availability tracking and quantity management
- Purchase date and warranty information

#### Rentals
- Tracks rental transactions
- Duration-based pricing calculation
- Status management (active, completed, cancelled)

#### Carts & Cart Items
- Shopping cart functionality
- Supports multiple items with variable rental durations
- Price snapshot for historical accuracy

#### Machine Parts
- Blueprint/template for machine parts
- Visual diagram positioning (x/y coordinates)
- Health scoring (0-100)

#### Item Parts
- Instance-specific parts linked to individual machines
- Real-time health and availability tracking
- Position mapping for visual diagrams

#### Health Reports
- Comprehensive condition assessments
- Visual inspection, functional testing, wear analysis
- Maintenance history tracking
- Life expectancy estimates

#### Appraisals
- AI-driven market valuations
- Condition and age factor calculations
- ML confidence scoring
- Image analysis results

#### Exchanges
- Equipment exchange marketplace
- Support for item-for-item, item-for-cash, or hybrid exchanges
- Status tracking (pending, accepted, rejected, completed)

#### Repair Requests
- Equipment repair tracking
- Urgency levels (low, medium, high, critical)
- Cost estimation and tracking
- Status management

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20 or higher
- PostgreSQL database (or use Replit's built-in PostgreSQL)
- Cloudinary account (for image uploads)
- OpenAI API key (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd renthub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=postgresql://user:password@host:port/database
   SESSION_SECRET=your-session-secret-key
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   OPENAI_API_KEY=your-openai-api-key
   NODE_ENV=development
   ```

4. **Initialize the database**
   ```bash
   npm run db:push
   ```

5. **Seed sample data** (optional but recommended)
   ```bash
   tsx server/seed.ts
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5000`

---

## 📦 Sample Data

The seed script creates comprehensive sample data including:

### Users
- **3 Industry Accounts**:
  - `acme_industrial` (ACME Industrial Equipment) - password: `industry123`
  - `techforge_mfg` (TechForge Manufacturing) - password: `industry123`
  - `acme_robotics` (ACME Robotics) - password: `password123`

- **2 Regular User Accounts**:
  - `john_builder` - password: `user123`
  - `sarah_contractor` - password: `user123`

### Featured Equipment: ABB IRB 1600 Industrial Robot System

**ACME Robotics** lists a complete IRB 1600 robotic system with interchangeable end effectors:

#### Main Machine
- **ABB IRB 1600 Industrial Robot**
  - 6-axis robotic arm with exceptional precision
  - Payload capacity: 10kg
  - Reach: 1.45m
  - Rental: $450/day
  - Purchase date: June 20, 2021
  - Warranty until: June 20, 2026

#### End Effector Parts (All compatible with IRB 1600)

1. **Welding Torch Attachment** (top-left position)
   - Professional-grade TIG/MIG compatible
   - Precision nozzle control
   - Rental: $220/day
   - Quantity available: 2

2. **Precision Cutting Tool Assembly** (top-right position)
   - Advanced blade mechanism
   - Adjustable cutting depth and angle
   - Rental: $195/day
   - Quantity available: 2

3. **Electromagnetic Gripper System** (middle-left position)
   - Heavy-duty magnetic handling
   - Quick-release mechanism
   - Rental: $175/day
   - Quantity available: 2

4. **Industrial Vacuum Gripper Assembly** (middle-right position)
   - Multi-suction cup system
   - Adjustable pressure control
   - Compatible with glass, plastic, metal sheets
   - Rental: $165/day
   - Quantity available: 3

### Additional Equipment
- CNC Milling Machine
- Hydraulic Press (50 Ton)
- Welding Robot Arm
- Laser Cutting Machine

### Sample Data Includes
- 9 Total equipment items
- 6 Machine parts blueprints
- 4 Detailed health reports
- 3 AI appraisals
- 2 Exchange offers
- 1 Active rental

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Items (Equipment)
- `GET /api/items` - Get all items
- `GET /api/items/my-items` - Get industry's items
- `GET /api/items/:id` - Get item by ID
- `POST /api/items` - Create new item (industry only)
- `PATCH /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item
- `GET /api/items/:id/parts` - Get item's parts

### Rentals
- `GET /api/rentals/my-rentals` - Get user's rentals
- `POST /api/rentals` - Create new rental
- `PATCH /api/rentals/:id/complete` - Complete rental

### Cart
- `GET /api/cart` - Get current cart
- `POST /api/cart/items` - Add item to cart
- `PATCH /api/cart/items/:id` - Update cart item
- `DELETE /api/cart/items/:id` - Remove cart item
- `POST /api/cart/checkout` - Checkout cart

### Machine Parts
- `GET /api/machine-parts/types` - Get all machine types
- `GET /api/machine-parts/:machineType` - Get parts by machine type
- `POST /api/machine-parts` - Create machine part blueprint
- `PATCH /api/machine-parts/:id/position` - Update part position

### Item Parts
- `GET /api/item-parts/:itemId` - Get parts for specific item
- `POST /api/item-parts` - Create item part
- `PATCH /api/item-parts/:id` - Update item part
- `DELETE /api/item-parts/:id` - Delete item part

### AI Features
- `POST /api/ai/health-report` - Generate AI health report (requires image)
- `POST /api/ai/appraisal` - Generate AI appraisal (requires image)

### Exchanges
- `GET /api/exchanges/my-exchanges` - Get user's exchanges
- `POST /api/exchanges` - Create exchange offer
- `PATCH /api/exchanges/:id` - Update exchange status

### Repair Requests
- `GET /api/repairs/my-requests` - Get user's repair requests
- `POST /api/repairs` - Create repair request
- `PATCH /api/repairs/:id` - Update repair request

---

## 🎨 UI Components

Built with Shadcn UI component library:
- Buttons, Cards, Dialogs, Forms
- Dropdowns, Selects, Tabs
- Accordions, Tooltips, Toasts
- Avatars, Badges, Progress bars
- Navigation menus, Sidebars
- And many more...

---

## 🔐 Security Features

- Bcrypt password hashing
- Session-based authentication
- Role-based access control (RBAC)
- SQL injection prevention (Drizzle ORM)
- XSS protection
- CSRF protection via session management
- Secure file uploads with validation

---

## 🌐 Deployment

### Production Build
```bash
npm run build
```

### Start Production Server
```bash
npm run start
```

### Environment Variables for Production
Ensure all environment variables are set:
- `NODE_ENV=production`
- `DATABASE_URL` - Production database URL
- `SESSION_SECRET` - Strong secret for sessions
- Cloudinary credentials
- OpenAI API key

---

## 📁 Project Structure

```
renthub/
├── client/                 # Frontend React application
│   └── src/
│       ├── components/     # Reusable UI components
│       │   └── ui/        # Shadcn UI components
│       ├── pages/         # Page components
│       ├── lib/           # Utilities and configurations
│       ├── hooks/         # Custom React hooks
│       └── App.tsx        # Main app component
├── server/                # Backend Express application
│   ├── db.ts             # Database connection
│   ├── storage.ts        # Data access layer
│   ├── routes.ts         # API routes
│   ├── openai-service.ts # AI integration
│   ├── seed.ts           # Database seeding script
│   └── index.ts          # Server entry point
├── shared/               # Shared code between client/server
│   └── schema.ts         # Database schema & types
├── attached_assets/      # Static assets
│   └── generated_images/ # AI-generated equipment images
├── package.json          # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── tailwind.config.ts   # Tailwind CSS configuration
├── vite.config.ts       # Vite configuration
└── drizzle.config.ts    # Drizzle ORM configuration
```

---

## 🧪 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Type checking
npm run check

# Push database schema changes
npm run db:push

# Seed database with sample data
tsx server/seed.ts
```

---

## 🤖 AI Features in Detail

### Health Report Generation
1. Upload equipment image
2. AI analyzes visual condition
3. Generates comprehensive report:
   - Overall condition score (0-100)
   - Visual inspection notes
   - Functional test results
   - Wear and tear assessment
   - Detected defects list
   - Estimated life remaining
   - Maintenance recommendations

### Equipment Appraisal
1. Upload equipment image
2. AI analyzes condition, age, and market factors
3. Provides:
   - Estimated market value
   - Condition factor (0.00-1.00)
   - Age depreciation factor
   - Market demand assessment
   - ML confidence score
   - Detailed notes and recommendations

---

## 👥 User Roles

### Industry User
- List equipment and parts
- Manage inventory
- View rental analytics
- Process repair requests
- Create exchange offers
- Generate AI health reports

### Regular User
- Browse equipment
- Rent equipment/parts
- Manage rental history
- Submit repair requests
- Request AI appraisals
- Respond to exchange offers

---

## 📸 Generated Equipment Images

The application includes AI-generated images for the IRB 1600 system:
- Main robot: `irb_1600_industrial_robot.png`
- Welding torch: `welding_torch_tool.png`
- Cutting tool: `cutting_tool_attachment.png`
- Magnetic gripper: `magnetic_gripper.png`
- Vacuum gripper: `vacuum_gripper_assembly.png`

Located in: `attached_assets/generated_images/`

---

## 🔄 Migration from Replit Agent

This project has been successfully migrated from Replit Agent to the standard Replit environment. All features are fully functional:

- ✅ Node.js 20 runtime installed
- ✅ All npm dependencies installed
- ✅ Database schema pushed to PostgreSQL
- ✅ Workflow configured (`npm run dev`)
- ✅ Deployment configuration set up
- ✅ Sample data with IRB 1600 robot system

---

## 📝 License

MIT License - Feel free to use this project for learning or commercial purposes.

---

## 🙏 Acknowledgments

- **Shadcn UI** for the beautiful component library
- **OpenAI** for GPT-4 Vision API
- **Cloudinary** for image hosting
- **Neon** for serverless PostgreSQL
- **Replit** for the development platform

---

## 📞 Support

For issues, questions, or contributions, please refer to the project repository or contact the development team.

---

**Built with ❤️ for the industrial equipment rental industry**
