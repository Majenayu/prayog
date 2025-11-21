# RentHub - Rental Marketplace Platform

## Overview

RentHub is a futuristic rental marketplace platform that connects industrial equipment providers with users who need to rent machinery and equipment. The platform features two distinct user roles: regular users who browse and rent items, and industry users who list equipment and manage their rental business. The application includes advanced features like AI-powered machine appraisals, health inspection reports, machine parts locators, and an exchange marketplace.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Tooling**
- React with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management and API data caching

**UI Component System**
- shadcn/ui component library built on Radix UI primitives
- Tailwind CSS for styling with custom design system
- Class Variance Authority (CVA) for component variant management
- Design follows a hybrid approach combining modern marketplace UX (Swiggy/Zomato patterns) with futuristic UI aesthetics
- Typography system uses 'Poppins'/'Inter' for primary text and 'Orbitron'/'Rajdhani' for futuristic accents
- Responsive grid layouts: single column (mobile), 2 columns (tablet), 3-4 columns (desktop)

**State Management Pattern**
- React Query handles all server state with optimistic updates and cache invalidation
- React Context for global auth state
- Local component state for UI-specific concerns
- Session-based authentication with userId stored in express-session

### Backend Architecture

**Framework & Server**
- Express.js server with TypeScript
- Session-based authentication using express-session with httpOnly cookies
- bcrypt for password hashing
- Custom middleware for request logging and JSON parsing

**API Design Pattern**
- RESTful API endpoints organized by resource type
- All routes return JSON responses
- Consistent error handling with HTTP status codes
- File uploads handled through multer with in-memory storage

**Authentication & Authorization**
- Role-based access control (RBAC) with two roles: 'user' and 'industry'
- Session data includes userId for authenticated requests
- Protected routes verify session existence
- Separate dashboards and API endpoints based on user role

**Request Flow**
1. Client makes authenticated request with session cookie
2. Express session middleware validates and attaches session data
3. Route handlers access userId from req.session
4. Business logic executes with role-based permissions
5. Response returns JSON data or appropriate error codes

### Data Storage

**Database**
- **MongoDB** (Primary): Mongoose ODM with cloud-hosted database via MongoDB Atlas
  - Configured via MONGODB_URI environment variable
  - Seeded with admin user and expert contacts on startup
  - Connection handled in server/mongodb.ts
- **PostgreSQL** (Fallback): Neon serverless with Drizzle ORM
  - Used for backward compatibility with existing storage layer
  - Full migration to MongoDB in progress

**MongoDB Collections**
- **Users**: Admin and user credentials (admin: ayusha/ayusha)
- **ExpertContacts**: 5 mechanical experts + 1 customer support with GPS coordinates (Lat: 12.335627, Lon: 76.619692)
- **Products**: Common equipment catalog
- **IndustryProducts**: Industry-specific equipment listings
- **Items**: Legacy equipment listings
- **Rentals**: Rental transactions
- **HealthReports**: Equipment condition assessments
- **Appraisals**: Market valuations
- **Exchanges**: Equipment trade offers
- **Notifications**: User notifications

**Schema Design**
- **Users Collection**: username, email, password (bcrypt), role, companyName
- **ExpertContacts Collection**: name, role, expertise, phone, email, avatarUrl
- **Items/Products Collection**: Equipment with pricing, availability, purchase/warranty dates
- **Rentals Collection**: Transactions with dates, amounts, and status
- **Health Reports Collection**: Condition scores, inspections, maintenance history
- **Appraisals Collection**: Market valuations with ML vision analysis
- **Exchanges Collection**: Equipment exchange proposals

**Data Relationships**
- Items belong to industry users (foreign key: industryId)
- Rentals link users and items with quantity tracking
- Health reports and appraisals reference specific items
- Exchanges connect two items for trade proposals

**Quantity Management Pattern**
- Items track both total quantity and available quantity
- Rentals decrement available quantity on creation
- Status automatically updates based on availability (available/on_rent/unavailable)

### External Dependencies

**Cloud Services**
- **Cloudinary**: Image storage and CDN for equipment photos
  - Used for uploading item images during creation
  - Stores public URLs and public IDs for image management
  - Folder-based organization (rental-items, etc.)

**Database**
- **Neon Serverless PostgreSQL**: Production database with WebSocket support
  - Connection pooling via @neondatabase/serverless
  - Accessed through DATABASE_URL environment variable

**Development Tools**
- **Replit-specific plugins**: Runtime error overlay, cartographer, dev banner (development only)

**Session Storage**
- In-memory session store (development)
- Should be replaced with connect-pg-simple or Redis for production persistence

**AI Services**
- **OpenAI GPT-5**: Primary AI service for equipment appraisals and health reports
- **OpenRouter (Claude 3.5 Sonnet)**: Automatic fallback for low credits/quota exceeded
- Fallback logic implemented in server/openai-service.ts
- Handles vision analysis for equipment condition assessment

**Environment Variables Required**
- MONGODB_URI: MongoDB Atlas connection string
- DATABASE_URL: PostgreSQL connection string (fallback)
- CLOUDINARY_CLOUD_NAME: Cloudinary account identifier
- CLOUDINARY_API_KEY: Cloudinary API authentication
- CLOUDINARY_API_SECRET: Cloudinary API secret
- OPENAI_API_KEY: OpenAI API key for GPT-5 access
- OPENROUTER_API_KEY: OpenRouter API key for Claude 3.5 Sonnet fallback
- GRASSHOPPER_API_KEY: Grasshopper API for SMS/call features
- CONTACT_EMAIL: Customer support email
- CONTACT_PHONE: Customer support phone
- SESSION_SECRET: Express session encryption key (defaults to 'rental-marketplace-secret')