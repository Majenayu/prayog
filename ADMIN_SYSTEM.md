# Admin QR Order Management System

## Overview
The RentHub admin system provides secure order management with immutable QR code generation for tracking rental transactions across all companies.

## Features

### 1. Admin Authentication
- **Secure Login**: Admin credentials protected with bcrypt password hashing
- **Role-Based Access Control**: Only users with admin role can access admin features
- **Session Management**: Express session-based authentication

### 2. Admin Dashboard
- **View All Orders**: See rental orders from all companies and users
- **Search Functionality**: Search by order ID, item name, user name, or company name
- **Order Details**: View complete rental information including:
  - Customer details
  - Company/industry information
  - Equipment specifications and images
  - Rental duration and pricing
  - Current status

### 3. QR Code Generation
- **Comprehensive Data**: Each QR code contains:
  - Rental order ID
  - User information (name, ID)
  - Industry/company details
  - Equipment details (name, image URL)
  - Rental period (start date, end date, duration)
  - Pricing (per day rate, total amount)
  - Health report (if available):
    - Overall condition
    - Condition score
    - Visual inspection results
    - Functional test results
    - Wear and tear assessment
- **Immutability Guarantee**: Once generated, QR code data cannot be modified
  - Protected by database unique constraint
  - Concurrent request handling prevents race conditions
  - Multiple generation attempts return original immutable data
- **Downloadable**: QR codes can be downloaded as PNG images

### 4. Public QR Viewer
- **Accessible URL**: `/qr/:rentalId`
- **No Authentication Required**: Anyone with QR code can view order details
- **Comprehensive Display**: Shows all embedded order information
- **Immutability Notice**: Clearly indicates data cannot be changed

## Admin Credentials

**Username**: `ayusha`  
**Password**: `ayusha`

> **Security Note**: These credentials are securely hashed using bcrypt before storage.

## Getting Started

### 1. Seed Admin User
Make a POST request to create the admin user:
```bash
curl -X POST http://localhost:5000/api/admin/seed
```

### 2. Admin Login
Navigate to `/admin-login` and enter credentials:
- Username: `ayusha`
- Password: `ayusha`

### 3. Access Admin Dashboard
After login, you'll be redirected to `/admin-orders` where you can:
- View all rental orders
- Search and filter orders
- Generate QR codes

### 4. Generate QR Codes
1. Click "Generate QR" button next to any order
2. QR code appears in a dialog
3. Click "Download QR Code" to save as PNG
4. Share QR code with stakeholders

### 5. View QR Code Data
Scan the QR code or visit `/qr/:rentalId` to see:
- Complete order details
- Health report information
- Immutable data notice

## API Endpoints

### Admin Routes
- `POST /api/admin/seed` - Create admin user (run once)
- `GET /api/admin/orders` - Get all rental orders (admin only)
- `POST /api/admin/generate-qr/:rentalId` - Generate immutable QR code (admin only)

### Public Routes
- `GET /api/qr/:rentalId` - Get QR code data for public viewing

## Security Features

1. **Password Hashing**: Admin password hashed with bcrypt (10 rounds)
2. **Role-Based Access**: Admin routes protected by role verification
3. **Session Management**: Secure session cookies with httpOnly flag
4. **Data Immutability**: QR codes cannot be altered after generation
5. **Unique Constraints**: Database ensures one QR per rental order

## Technical Implementation

### Immutability Architecture
1. **Database Constraint**: `rentalId` has unique constraint in `rental_qr_codes` table
2. **Race Condition Handling**: 
   - Storage method catches unique constraint violations (PostgreSQL error 23505)
   - Returns existing record when concurrent insert is detected
   - Ensures first payload is always authoritative
3. **API Layer Check**: Endpoint verifies existing QR before generation
4. **Frontend Feedback**: Different messages for new vs existing QR codes

### Data Flow
```
Admin → Generate QR Request
  ↓
Check for existing QR (API layer)
  ↓ (if exists)
Return existing QR (immutable)
  ↓ (if not exists)
Fetch order details + health report
  ↓
Generate QR code image
  ↓
Insert to database (with unique constraint)
  ↓ (on constraint violation)
Fetch and return first-inserted record
  ↓
Return QR code to admin
```

## Testing Immutability

To verify QR code immutability:
1. Generate QR code for an order
2. Note the QR data content
3. Attempt to regenerate QR for same order
4. Verify returned data matches original
5. Check toast message indicates "QR Code Retrieved" (not "Generated")

## Troubleshooting

**Issue**: Cannot login as admin  
**Solution**: Run the seed endpoint first: `POST /api/admin/seed`

**Issue**: QR generation fails  
**Solution**: Ensure rental order exists and has valid data

**Issue**: Public viewer shows no data  
**Solution**: Verify QR code was generated successfully for that rental

## Future Enhancements

Potential improvements:
- Analytics dashboard for QR code scans
- Bulk QR code generation
- QR code expiration/versioning
- Audit trail for QR access
- PDF reports with embedded QR codes
