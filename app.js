// Global state
let currentUser = null;

// Check if user is logged in
async function checkAuth() {
    try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
            currentUser = await response.json();
            return true;
        }
        return false;
    } catch (error) {
        return false;
    }
}

// Login page functionality
if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
    const loginForm = document.getElementById('loginForm');
    const tabs = document.querySelectorAll('.tab');
    
    // Check if already logged in
    checkAuth().then(isLoggedIn => {
        if (isLoggedIn) {
            window.location.href = '/dashboard.html';
        }
    });
    
    // Tab switching
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });
    
    // Login form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            
            if (response.ok) {
                window.location.href = '/dashboard.html';
            } else {
                const error = await response.json();
                showError(error.message || 'Login failed');
            }
        } catch (error) {
            showError('Network error. Please try again.');
        }
    });
}

// Dashboard page functionality
if (window.location.pathname === '/dashboard.html') {
    // Check authentication
    checkAuth().then(async isLoggedIn => {
        if (!isLoggedIn) {
            window.location.href = '/';
            return;
        }
        
        // Update user info
        document.getElementById('userInfo').textContent = `Welcome, ${currentUser.username}`;
        
        // Load items
        await loadItems();
    });
}

// Load items from API
async function loadItems() {
    try {
        const response = await fetch('/api/items');
        if (response.ok) {
            const items = await response.json();
            displayItems(items);
        } else {
            showError('Failed to load items');
        }
    } catch (error) {
        showError('Network error. Please try again.');
    }
}

// Display items in grid
function displayItems(items) {
    const itemsList = document.getElementById('itemsList');
    
    if (items.length === 0) {
        itemsList.innerHTML = '<p>No equipment available at the moment.</p>';
        return;
    }
    
    itemsList.innerHTML = items.map(item => `
        <div class="item-card">
            <img src="${item.imageUrl}" alt="${item.name}">
            <div class="item-info">
                <h3>${item.name}</h3>
                <p>${item.description.substring(0, 100)}...</p>
                <p><strong>Category:</strong> ${item.category}</p>
                <p><strong>Available:</strong> ${item.availableQuantity} / ${item.quantity}</p>
                <div class="item-price">$${item.pricePerDay}/day</div>
            </div>
        </div>
    `).join('');
}

// Logout function
async function logout() {
    try {
        await fetch('/api/auth/logout', { method: 'POST' });
        window.location.href = '/';
    } catch (error) {
        window.location.href = '/';
    }
}

// Show error message
function showError(message) {
    const existingError = document.querySelector('.error');
    if (existingError) existingError.remove();
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    errorDiv.textContent = message;
    
    const form = document.getElementById('loginForm');
    if (form) {
        form.parentNode.insertBefore(errorDiv, form);
        setTimeout(() => errorDiv.remove(), 5000);
    }
}
