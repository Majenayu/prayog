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
- PostgreSQL database (Neon serverless)
- Drizzle ORM for type-safe database queries and schema management
- WebSocket connection pooling via @neondatabase/serverless

**Schema Design**
- **Users Table**: Stores user credentials, role (user/industry), and company info
- **Items Table**: Equipment listings with pricing, availability tracking, purchase/warranty dates
- **Rentals Table**: Rental transactions with dates, quantities, amounts, and status
- **Machine Parts Table**: Reference data for machine part locations and diagrams
- **Health Reports Table**: Condition assessments with scores, inspections, and maintenance history
- **Appraisals Table**: Market valuations with ML vision analysis, demand assessment, and pricing recommendations
- **Exchanges Table**: Equipment exchange/trade offers between users

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

**Environment Variables Required**
- DATABASE_URL: PostgreSQL connection string
- CLOUDINARY_CLOUD_NAME: Cloudinary account identifier
- CLOUDINARY_API_KEY: Cloudinary API authentication
- CLOUDINARY_API_SECRET: Cloudinary API secret
- SESSION_SECRET: Express session encryption key (defaults to 'rental-marketplace-secret')