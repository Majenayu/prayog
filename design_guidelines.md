# Design Guidelines: Futuristic Rental Marketplace Platform

## Design Approach

**Selected Approach:** Hybrid - Modern marketplace (Swiggy/Zomato) + Futuristic UI aesthetics
**Key References:** Dribbble's futuristic UI trends, Linear's clean interfaces, modern fintech dashboards
**Design Principles:** High contrast, bold typography, generous spacing, card-based layouts, smooth interactions

## Typography System

**Font Families:**
- Primary: 'Inter' or 'Poppins' (Google Fonts) - clean, modern sans-serif
- Accent: 'Orbitron' or 'Rajdhani' (Google Fonts) - for futuristic headings and numbers

**Type Scale:**
- Hero Headlines: text-5xl lg:text-7xl font-bold
- Section Headings: text-3xl lg:text-4xl font-semibold
- Card Titles: text-xl font-semibold
- Body Text: text-base
- Metadata/Labels: text-sm font-medium
- Captions: text-xs

## Layout System

**Spacing Primitives:** Use Tailwind units of 4, 6, 8, 12, 16 (p-4, m-6, gap-8, py-12, px-16)
**Container Widths:** max-w-7xl for main content, max-w-sm for modals/cards
**Grid Systems:** 
- Mobile: Single column (grid-cols-1)
- Tablet: 2 columns (md:grid-cols-2)
- Desktop: 3-4 columns for item grids (lg:grid-cols-3 xl:grid-cols-4)

## Page-Specific Layouts

### Login/Registration Pages
- Split-screen layout: Left side features animated gradient panel with brand messaging, right side contains form
- Forms: max-w-md centered, generous padding (p-8)
- Tab switcher for User/Industry login at the top
- Social proof element: "Join 1000+ users" with animated counter

### Main Dashboard (Marketplace)
- Top Navigation: Fixed header with logo, search bar (prominent, w-full max-w-2xl), cart icon, profile dropdown
- Filter Sidebar: Desktop left sidebar (w-64), mobile bottom sheet with categories, price range, availability filters
- Item Grid: Masonry-style or uniform grid with 3-4 columns on desktop, 2 on tablet, 1 on mobile
- Each Card: Image (aspect-ratio-square), title, price (large, accent font), availability badge, quantity indicator, "Rent Now" button

### Industry Dashboard (Add Items)
- Header Stats Bar: 4-column grid showing Total Items, Active Rentals, Revenue, Ratings with large accent numbers
- Action Button: Prominent "Add New Item" floating action button (bottom-right on mobile, top-right on desktop)
- Quick Stats Cards: 2x2 grid on desktop, stacked on mobile
- Recent Activity Timeline: Chronological list with icons and status badges

### Add Item Form (Industry)
- Full-page modal or dedicated page
- Photo Upload Zone: Large drag-drop area with image preview thumbnails in a grid below
- Form Layout: 2-column on desktop (left: details, right: pricing/availability), stacked on mobile
- Input Groups: Generous spacing (space-y-6), floating labels, helper text below inputs

### Inventory Management Page
- Table View: Desktop uses data table with sticky header, mobile uses card list
- Columns: Item Photo (thumbnail), Name, Category, Status Badge, Quantity, Actions (edit/delete icons)
- Search & Filter Bar: Sticky top bar with search input and status filter dropdown
- Pagination: Bottom center with page numbers and prev/next buttons

### Revenue Analytics Dashboard
- Top KPI Cards: 3-column grid (Total Revenue, This Month, Growth %) with large accent numbers and trend indicators
- Charts Section: 2-column layout - left: line chart (revenue over time), right: pie chart (revenue by category)
- Transaction Table: Below charts, showing recent transactions with item, renter, amount, date, status
- Export Button: Top-right with icon

## Component Library

### Cards
- Base: Rounded corners (rounded-xl), shadow (shadow-lg), padding (p-6)
- Glassmorphism variant: Semi-transparent with backdrop-blur-md
- Hover state: transform scale-105 transition

### Buttons
- Primary: Full width on mobile, auto on desktop, height (h-12), rounded (rounded-lg), font-semibold
- Secondary: Outlined variant with border-2
- Icon Buttons: Square (w-12 h-12), rounded-lg, centered icon

### Input Fields
- Height: h-12, rounded-lg, padding (px-4)
- Focus: Ring effect (focus:ring-2)
- Labels: Above input with text-sm font-medium, mb-2

### Status Badges
- Available: Green pill (rounded-full, px-3, py-1, text-xs font-semibold)
- On Rent: Yellow/orange variant
- Unavailable: Gray variant

### Navigation
- Desktop: Horizontal top nav with links, search, and profile
- Mobile: Bottom tab bar with 4-5 icons (Home, Search, Add, Orders, Profile)

### Modals/Overlays
- Centered with backdrop (backdrop-blur-sm)
- Max width (max-w-2xl), padding (p-8), rounded (rounded-2xl)
- Close button: Top-right absolute positioned

## Mobile-Specific Considerations

- Touch Targets: Minimum 44px (h-11) for all interactive elements
- Bottom Navigation: Fixed bottom bar (h-16) with 5 evenly spaced icons
- Pull-to-Refresh: Visual indicator at top
- Swipe Gestures: Card swipe for quick actions in lists
- Safe Areas: Account for notches with safe-area-inset padding

## Animations

Use sparingly and purposefully:
- Page Transitions: Fade in/out
- Card Entrance: Stagger effect (delay-100, delay-200, delay-300)
- Loading States: Skeleton screens with shimmer effect
- Micro-interactions: Button scale on press, badge pulse for new items

## Images

**Hero Image:** Not applicable - this is a dashboard application, no marketing hero needed

**Item Photos:**
- Aspect ratio: Square (1:1) for consistency
- Minimum size: 400x400px
- Placement: Top of each item card, rounded corners (rounded-t-xl)
- Fallback: Placeholder with icon if no image uploaded

**Industry Profile Photos:**
- Circular avatars (w-12 h-12 rounded-full)
- Placement: Top navigation and industry inventory pages

**Empty States:**
- Illustrative graphics (from Undraw or similar) for empty inventory, no transactions
- Centered with message text below

## Accessibility

- High contrast text-to-background ratios throughout
- Consistent focus indicators (ring-2) on all interactive elements
- ARIA labels for icon-only buttons
- Form validation messages clearly visible below inputs
- Skip navigation link for keyboard users