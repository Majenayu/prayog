# RentHub Mock Data Guide

This document explains all the sample data available in the application to help you understand how it works.

## 🏭 Industry Users (Companies)

These are businesses that list equipment for rent.

### Industry User 1: ACME Industrial Equipment
- **Username:** `acme_industrial`
- **Email:** `contact@acmeindustrial.com`
- **Password:** `industry123`
- **Company Name:** ACME Industrial Equipment
- **Role:** industry

### Industry User 2: TechForge Manufacturing
- **Username:** `techforge_mfg`
- **Email:** `sales@techforge.com`
- **Password:** `industry123`
- **Company Name:** TechForge Manufacturing
- **Role:** industry

---

## 👤 Regular Users (Renters)

These are individual users who can rent equipment.

### User 1: John Builder
- **Username:** `john_builder`
- **Email:** `john@example.com`
- **Password:** `user123`
- **Role:** user

### User 2: Sarah Contractor
- **Username:** `sarah_contractor`
- **Email:** `sarah@example.com`
- **Password:** `user123`
- **Role:** user

---

## 🏗️ Equipment Items

### Equipment from ACME Industrial:

#### 1. CNC Milling Machine
- **Category:** Machinery
- **Price per Day:** $250.00
- **Quantity Available:** 2 units
- **Machine Type:** CNC Machine
- **Purchase Date:** March 15, 2022
- **Warranty Expires:** March 15, 2025
- **Condition Score:** 92/100 (Excellent)
- **Estimated Value:** $42,000
- **Description:** High-precision CNC milling machine with 3-axis control. Perfect for metalworking and prototyping.
- **Health Status:** 
  - Minimal wear on guide rails
  - All axes move smoothly
  - Minor cosmetic scratch on side panel
  - Estimated Life: 8-10 years with regular maintenance

#### 2. Hydraulic Press 50 Ton
- **Category:** Machinery
- **Price per Day:** $180.00
- **Quantity Available:** 1 unit
- **Machine Type:** Hydraulic Press
- **Purchase Date:** June 20, 2021
- **Warranty Expires:** June 20, 2024
- **Condition Score:** 78/100 (Good)
- **Estimated Value:** $28,500
- **Description:** Industrial hydraulic press with 50-ton capacity. Ideal for metal forming and stamping operations.
- **Health Status:**
  - Minor surface rust on base plate
  - Cylinder seals at 70% life
  - Seal replacement recommended within 12 months
  - Estimated Life: 5-7 years

### Equipment from TechForge Manufacturing:

#### 3. Welding Robot Arm
- **Category:** Automation
- **Price per Day:** $320.00
- **Quantity Available:** 1 unit
- **Machine Type:** Robotic Welder
- **Purchase Date:** January 10, 2023
- **Warranty Expires:** January 10, 2026
- **Condition Score:** 95/100 (Excellent)
- **Estimated Value:** $65,000
- **Description:** Automated robotic welding arm with precision control. Reduces manual labor and improves quality.
- **Health Status:**
  - Like new condition
  - Low operating hours
  - No defects found
  - Estimated Life: 15+ years

#### 4. Laser Cutting Machine
- **Category:** Cutting Equipment
- **Price per Day:** $275.00
- **Quantity Available:** 1 unit
- **Machine Type:** Laser Cutter
- **Purchase Date:** September 5, 2022
- **Warranty Expires:** September 5, 2025
- **Description:** CO2 laser cutter for precise metal and plastic cutting. Computerized control system included.

---

## 🔧 Machine Parts

The system includes detailed part information for maintenance:

### CNC Machine Parts:
1. **Spindle Motor** (CNC-SM-2000) - Located in top center, inside protective housing
2. **Linear Guide Rails** (CNC-LGR-X) - Located at bottom front, running left to right
3. **Tool Changer** (CNC-TC-12) - Located on right side of machine head

### Hydraulic Press Parts:
1. **Hydraulic Cylinder** (HP-HC-50) - Located at center top, vertical orientation
2. **Pressure Gauge** (HP-PG-5000) - Located on front panel, top right corner
3. **Safety Release Valve** (HP-SRV-50) - Located on left side, mid-height

---

## 🔄 Exchange Offers

### Active Exchange 1: Item-for-Item Trade
- **Offered:** CNC Milling Machine (by ACME Industrial)
- **Requested:** Laser Cutting Machine (from TechForge)
- **Type:** Equipment swap
- **Status:** Pending
- **Notes:** Looking to exchange CNC machine for laser cutter. Both machines in excellent condition.

### Active Exchange 2: Cash Sale
- **Offered:** Hydraulic Press 50 Ton (by ACME Industrial)
- **Requested:** Cash payment
- **Asking Price:** $28,000
- **Type:** Direct sale
- **Status:** Pending
- **Notes:** Selling hydraulic press. Recent maintenance completed. Ready for immediate use.

---

## 📋 Active Rentals

### Rental 1
- **Equipment:** CNC Milling Machine
- **Renter:** John Builder
- **Owner:** ACME Industrial Equipment
- **Duration:** 30 days
- **Total Cost:** $7,500
- **Status:** Active

---

## 🔍 How to Use This Data

### To Log In as an Industry User:
1. Go to the login page
2. Click "Industry" tab
3. Use username: `acme_industrial` or `techforge_mfg`
4. Password: `industry123`

### To Log In as a Regular User:
1. Go to the login page
2. Click "User" tab
3. Use username: `john_builder` or `sarah_contractor`
4. Password: `user123`

### Industry Dashboard Features:
- List new equipment for rent
- View your equipment inventory
- Manage rentals
- View health reports and appraisals
- Handle exchange offers
- Track revenue

### User Dashboard Features:
- Browse available equipment
- Rent equipment by the day
- View rental history
- Request equipment repairs
- View equipment health reports
- See estimated values

---

## 📊 Key Features Demonstrated

1. **AI-Powered Appraisals** - Each item has machine learning-based valuation
2. **Health Reports** - Detailed condition assessments with maintenance history
3. **Equipment Exchange** - P2P marketplace for swapping or selling equipment
4. **Part Tracking** - Detailed machine part information for maintenance
5. **Rental Management** - Complete rental lifecycle tracking
6. **Multi-Role System** - Separate experiences for equipment owners vs. renters

---

## 🌱 Seeding the Database

To populate the database with this mock data:

```bash
npm run db:seed
```

This will create all the users, equipment, health reports, appraisals, and exchanges listed above.
