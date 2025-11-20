# 🏗️ RentHub - Simple Version

A simplified rental marketplace platform for industrial equipment. This version uses plain HTML, CSS, and JavaScript to make it easy to understand and learn from.

## 📁 Project Structure

```
simple-renthub/
├── server.js                  # Main server file (Express backend)
├── package.json              # Dependencies
├── README.md                 # This file
└── public/                   # Frontend files
    ├── css/
    │   └── style.css        # All styles
    ├── js/
    │   ├── login.js         # Login page logic
    │   └── dashboard.js     # Dashboard page logic
    ├── images/
    │   └── generated_images/ # Robot parts images
    └── pages/
        ├── login.html       # Login/Register page
        └── dashboard.html   # Main dashboard
```

## 🚀 What is RentHub?

RentHub is like **Swiggy/Zomato but for industrial equipment**. Instead of restaurants listing food, industries list equipment for rent!

### How it Works

1. **Industries** (like restaurants) list their equipment with photos, prices, and descriptions
2. **Users** (like customers) browse and rent equipment they need
3. The platform handles the rentals, tracking, and payments

## 🎯 Features

### For Users (Customers):
- ✅ Browse all available equipment
- ✅ Search and filter by category
- ✅ View equipment details and prices
- ✅ Rent equipment for specific days
- ✅ Track active rentals
- ✅ See health scores of equipment

### For Industries (Equipment Owners):
- ✅ List equipment with details
- ✅ Set rental prices
- ✅ Track inventory
- ✅ Monitor active rentals
- ✅ View revenue statistics
- ✅ Manage equipment availability

## 📖 Understanding the Code

### 1. Server.js - The Backend

This is the heart of the application. It's a Node.js server using Express.

**Key Parts:**

```javascript
// In-memory data storage (like a simple database)
const users = [...]      // Stores user accounts
const items = [...]      // Stores equipment items
const rentals = [...]    // Stores rental transactions

// Routes - These handle different requests
app.post('/api/login', ...)     // Login users
app.get('/api/items', ...)      // Get all equipment
app.post('/api/rentals', ...)   // Create a rental
```

**How it works:**
1. When you visit the website, the server sends HTML files
2. When you click buttons, JavaScript sends requests to these routes
3. The server processes the request and sends back data
4. JavaScript updates the page with the new data

### 2. HTML Pages

**login.html** - First page you see
- Login form
- Register form
- Tab switching between them

**dashboard.html** - Main application page
- Shows different views for Users vs Industries
- Equipment grid
- Rental tables
- Statistics cards

### 3. CSS (style.css)

All the styling in one file:
- `.item-card` - Equipment cards
- `.btn-primary` - Blue buttons
- `.modal` - Popup windows
- Responsive design for mobile

### 4. JavaScript Files

**login.js:**
```javascript
// Handles login form submission
loginForm.addEventListener('submit', async function(e) {
  // Prevent page reload
  e.preventDefault();
  
  // Send login request to server
  const response = await fetch('/api/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
  
  // If successful, go to dashboard
  if (data.success) {
    window.location.href = '/pages/dashboard.html';
  }
});
```

**dashboard.js:**
```javascript
// Load equipment from server
async function loadItems() {
  const response = await fetch('/api/items');
  const items = await response.json();
  
  // Create cards for each item
  items.forEach(item => {
    const card = createItemCard(item);
    grid.appendChild(card);
  });
}
```

## 🔧 How to Run

1. **Install Dependencies:**
   ```bash
   cd simple-renthub
   npm install
   ```

2. **Start the Server:**
   ```bash
   npm start
   ```

3. **Open in Browser:**
   - Go to `http://localhost:5000`

## 👥 Demo Accounts

### User Account (Renter)
- Username: `john_user`
- Password: `password123`

### Industry Account (Equipment Owner)
- Username: `acme_industry`
- Password: `password123`

## 🎓 Learning Guide

### For Beginners

**Step 1: Start with HTML**
- Open `public/pages/login.html`
- See how forms are created
- Notice the `<form>`, `<input>`, and `<button>` tags

**Step 2: Look at CSS**
- Open `public/css/style.css`
- Find `.item-card` to see how equipment cards are styled
- Try changing colors or sizes

**Step 3: Understand JavaScript**
- Open `public/js/login.js`
- See how form submission is handled
- Follow the `fetch()` calls to see API requests

**Step 4: Explore the Server**
- Open `server.js`
- Find the routes (lines starting with `app.get` or `app.post`)
- See how data is stored in arrays

### Key Concepts to Learn

1. **Client-Server Model:**
   - Browser (client) sends requests
   - Server processes and responds
   - JavaScript updates the page

2. **HTTP Methods:**
   - `GET` - Retrieve data (e.g., get items)
   - `POST` - Send data (e.g., create rental)

3. **Sessions:**
   - Server remembers who you are
   - Uses cookies to track login

4. **DOM Manipulation:**
   - JavaScript changes HTML dynamically
   - Creates elements, updates content

## 🖼️ Images

All the robot part images are in:
```
public/images/generated_images/
├── Cutting_tool_robot_part_0711d221.png
├── IRB_1600_robot_main_body_763c8594.png
├── Magnetic_gripper_robot_part_33f8af0b.png
├── Vacuum_gripper_robot_part_6c59963c.png
└── Welding_torch_robot_part_8d09dbdf.png
```

## 🔄 How Data Flows

```
User clicks "Rent Now"
        ↓
JavaScript (dashboard.js) sends POST to /api/rentals
        ↓
Server (server.js) receives request
        ↓
Server checks availability
        ↓
Server creates rental, updates availability
        ↓
Server sends response back
        ↓
JavaScript updates the page
        ↓
User sees confirmation
```

## 📝 Common Tasks

### Add a New Equipment Category

1. **In server.js:**
   ```javascript
   // Add to categories endpoint
   const categories = ['All', 'Machinery', 'Automation', 'Components', 'Tools', 'YourCategory'];
   ```

2. **In dashboard.html:**
   ```html
   <button class="filter-btn" data-category="YourCategory">YourCategory</button>
   ```

### Change Colors

1. Open `public/css/style.css`
2. Find the primary color: `#667eea`
3. Replace with your color

### Add New Fields to Items

1. **In server.js - Update items array:**
   ```javascript
   const items = [
     {
       // ... existing fields
       newField: 'value'
     }
   ];
   ```

2. **In dashboard.js - Update card creation:**
   ```javascript
   card.innerHTML = `
     ...
     <p>${item.newField}</p>
   `;
   ```

## 🐛 Troubleshooting

**Problem: Server won't start**
- Make sure you ran `npm install`
- Check if port 5000 is already in use
- Try changing PORT in server.js

**Problem: Can't see images**
- Check the image path in `item.imageUrl`
- Make sure images are in `public/images/`
- Check browser console for errors

**Problem: Login doesn't work**
- Check browser console (F12)
- Verify the username and password
- Check if server is running

## 🎨 Customization Ideas

1. **Change the theme:**
   - Edit colors in `style.css`
   - Try different gradients in `body` background

2. **Add more features:**
   - Rating system
   - Reviews
   - Favorites list
   - Equipment comparison

3. **Improve styling:**
   - Add animations
   - Better mobile design
   - Image galleries

## 📚 Next Steps

1. Learn about databases (PostgreSQL, MongoDB)
2. Study modern frameworks (React, Vue)
3. Explore authentication libraries (Passport.js)
4. Learn about deployment (Heroku, AWS)

## 🤝 Contributing

This is a learning project! Feel free to:
- Add features
- Fix bugs
- Improve documentation
- Share with others

## 📄 License

MIT License - Feel free to use and modify!

---

**Happy Learning! 🚀**

If you have questions, check the code comments or experiment by changing things and seeing what happens!
