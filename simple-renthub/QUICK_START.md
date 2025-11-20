# 🚀 Quick Start Guide

Get RentHub running in 3 simple steps!

## Step 1: Install Dependencies

Open your terminal and run:

```bash
cd simple-renthub
npm install
```

This installs Express and Express-Session - the only two packages we need!

## Step 2: Start the Server

```bash
npm start
```

You should see:
```
🚀 RentHub Server running on http://0.0.0.0:5000
📱 Access the application in your browser

🔑 Demo Accounts:
   User: john_user / password123
   Industry: acme_industry / password123
```

## Step 3: Open in Browser

Click on the URL or open your browser to:
```
http://localhost:5000
```

## 🎉 You're Ready!

### Try These Things:

1. **Login as a User:**
   - Username: `john_user`
   - Password: `password123`
   - Browse equipment
   - Rent something
   - View your rentals

2. **Login as an Industry:**
   - Username: `acme_industry`
   - Password: `password123`
   - View your equipment
   - Add new equipment
   - See rental statistics

3. **Register New Account:**
   - Click "Register" tab
   - Create your own account
   - Choose User or Industry role

## 📁 File Structure Explained

```
simple-renthub/
├── server.js          ← The backend (Node.js + Express)
├── package.json       ← Dependencies list
├── README.md          ← Full documentation
└── public/            ← Everything the browser sees
    ├── css/
    │   └── style.css  ← All the styling
    ├── js/
    │   ├── login.js   ← Login page logic
    │   └── dashboard.js ← Dashboard logic
    ├── images/        ← All images
    └── pages/
        ├── login.html    ← Login page
        └── dashboard.html ← Main app
```

## 💡 Tips

- **Making Changes?** Just refresh the browser for CSS/JS/HTML changes
- **Changed server.js?** Stop the server (Ctrl+C) and run `npm start` again
- **Lost?** Check README.md for detailed explanations
- **Errors?** Check browser console (Press F12)

## 🎓 Learning Path

1. **Start with HTML** - Look at `login.html` to see the page structure
2. **Check CSS** - Open `style.css` to see how things are styled
3. **Explore JavaScript** - Look at `login.js` to see how login works
4. **Understand Backend** - Read `server.js` to see how data is handled

## 🆘 Common Issues

**Port already in use?**
```javascript
// In server.js, change the port:
const PORT = 3000; // or any other number
```

**Images not showing?**
- Make sure you're in the `simple-renthub` folder
- Check that `public/images/` exists

**Can't login?**
- Use the demo accounts shown above
- Check browser console for errors

## 🎨 Customization Ideas

**Change Colors:**
1. Open `public/css/style.css`
2. Find `#667eea` (the main blue color)
3. Replace with your favorite color!

**Add Features:**
- Edit `server.js` to add new routes
- Update HTML files to add new pages
- Modify JavaScript to add new functionality

---

**Need Help?** Read the full README.md for detailed explanations! 🚀
