// Dashboard JavaScript
let currentUser = null;
let currentCategory = 'all';
let selectedItem = null;

document.addEventListener('DOMContentLoaded', async function() {
  // Check authentication
  await checkAuth();
  
  // Set up event listeners
  document.getElementById('logoutBtn').addEventListener('click', logout);
  document.getElementById('searchInput').addEventListener('input', debounce(handleSearch, 300));
  
  // Filter buttons
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      filterBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      currentCategory = this.getAttribute('data-category');
      loadItems();
    });
  });
  
  // Modal close buttons
  const closeBtns = document.querySelectorAll('.close');
  closeBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      this.closest('.modal').style.display = 'none';
    });
  });
  
  // Close modals when clicking outside
  window.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
      e.target.style.display = 'none';
    }
  });
  
  // Rental days change
  document.getElementById('rentalDays').addEventListener('input', updateTotalPrice);
  
  // Rental confirmation
  document.getElementById('confirmRentalBtn').addEventListener('click', confirmRental);
  
  // Add item button
  const addItemBtn = document.getElementById('addItemBtn');
  if (addItemBtn) {
    addItemBtn.addEventListener('click', function() {
      document.getElementById('addItemModal').style.display = 'block';
    });
  }
  
  // Add item form
  document.getElementById('addItemForm').addEventListener('submit', addItem);
});

async function checkAuth() {
  try {
    const response = await fetch('/api/me');
    if (response.ok) {
      currentUser = await response.json();
      document.getElementById('userWelcome').textContent = `Welcome, ${currentUser.username}!`;
      
      if (currentUser.role === 'user') {
        document.getElementById('userDashboard').style.display = 'block';
        document.getElementById('industryDashboard').style.display = 'none';
        loadItems();
        loadUserRentals();
      } else {
        document.getElementById('userDashboard').style.display = 'none';
        document.getElementById('industryDashboard').style.display = 'block';
        loadIndustryStats();
        loadIndustryItems();
        loadIndustryRentals();
      }
    } else {
      window.location.href = '/';
    }
  } catch (error) {
    window.location.href = '/';
  }
}

async function logout() {
  try {
    await fetch('/api/logout', { method: 'POST' });
    window.location.href = '/';
  } catch (error) {
    console.error('Logout error:', error);
  }
}

async function loadItems() {
  try {
    const category = currentCategory === 'all' ? '' : currentCategory;
    const search = document.getElementById('searchInput').value;
    
    const url = `/api/items?category=${category}&search=${search}`;
    const response = await fetch(url);
    const items = await response.json();
    
    const grid = document.getElementById('itemsGrid');
    grid.innerHTML = '';
    
    if (items.length === 0) {
      grid.innerHTML = '<p style="color: white; text-align: center; grid-column: 1/-1;">No items found.</p>';
      return;
    }
    
    items.forEach(item => {
      const card = createItemCard(item);
      grid.appendChild(card);
    });
  } catch (error) {
    console.error('Error loading items:', error);
  }
}

function createItemCard(item) {
  const card = document.createElement('div');
  card.className = 'item-card';
  card.onclick = () => openRentalModal(item);
  
  const healthClass = item.healthScore >= 90 ? 'excellent' : 'good';
  
  card.innerHTML = `
    <img src="${item.imageUrl}" alt="${item.name}" onerror="this.src='/images/generated_images/IRB_1600_robot_main_body_763c8594.png'">
    <div class="item-card-content">
      <span class="item-category">${item.category}</span>
      <h3>${item.name}</h3>
      <p>${item.description.substring(0, 100)}...</p>
      <div class="item-price">$${item.pricePerDay}<span style="font-size: 14px; font-weight: normal;">/day</span></div>
      <div class="item-info">
        <span class="item-available">Available: ${item.available}</span>
        <span class="health-score ${healthClass}">⭐ ${item.healthScore}/100</span>
      </div>
      <button class="btn btn-rent" onclick="event.stopPropagation(); openRentalModal(${JSON.stringify(item).replace(/"/g, '&quot;')})">Rent Now</button>
    </div>
  `;
  
  return card;
}

function openRentalModal(item) {
  if (typeof item === 'string') {
    item = JSON.parse(item.replace(/&quot;/g, '"'));
  }
  selectedItem = item;
  
  document.getElementById('modalItemName').textContent = item.name;
  document.getElementById('modalItemImage').src = item.imageUrl;
  document.getElementById('modalItemDescription').textContent = item.description;
  document.getElementById('modalItemPrice').textContent = item.pricePerDay;
  document.getElementById('modalItemAvailable').textContent = item.available;
  document.getElementById('rentalDays').value = 1;
  
  updateTotalPrice();
  document.getElementById('rentalModal').style.display = 'block';
}

function updateTotalPrice() {
  if (!selectedItem) return;
  const days = parseInt(document.getElementById('rentalDays').value) || 1;
  const total = selectedItem.pricePerDay * days;
  document.getElementById('totalPrice').textContent = total.toFixed(2);
}

async function confirmRental() {
  if (!selectedItem) return;
  
  const days = parseInt(document.getElementById('rentalDays').value);
  
  try {
    const response = await fetch('/api/rentals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        itemId: selectedItem.id,
        days: days
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      alert('Rental confirmed! Check your rentals below.');
      document.getElementById('rentalModal').style.display = 'none';
      loadItems(); // Refresh items to update availability
      loadUserRentals();
    } else {
      alert(data.message || 'Failed to create rental');
    }
  } catch (error) {
    alert('An error occurred. Please try again.');
  }
}

async function loadUserRentals() {
  try {
    const response = await fetch('/api/rentals');
    const rentals = await response.json();
    
    const container = document.getElementById('rentalsTable');
    
    if (rentals.length === 0) {
      container.innerHTML = '<p>No rentals yet.</p>';
      return;
    }
    
    let html = `
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Industry</th>
            <th>Days</th>
            <th>Total Price</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    rentals.forEach(rental => {
      html += `
        <tr>
          <td>${rental.itemName}</td>
          <td>${rental.industryName}</td>
          <td>${rental.days}</td>
          <td>$${rental.totalPrice}</td>
          <td>${new Date(rental.startDate).toLocaleDateString()}</td>
          <td>${new Date(rental.endDate).toLocaleDateString()}</td>
          <td><span class="status-badge status-${rental.status}">${rental.status}</span></td>
        </tr>
      `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
  } catch (error) {
    console.error('Error loading rentals:', error);
  }
}

// Industry functions
async function loadIndustryStats() {
  try {
    const response = await fetch('/api/industry/stats');
    const stats = await response.json();
    
    document.getElementById('totalItems').textContent = stats.totalItems;
    document.getElementById('activeRentals').textContent = stats.activeRentals;
    document.getElementById('totalRevenue').textContent = '$' + stats.totalRevenue.toFixed(2);
    document.getElementById('totalRentals').textContent = stats.totalRentals;
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

async function loadIndustryItems() {
  try {
    const response = await fetch('/api/items');
    const allItems = await response.json();
    
    // Filter items for current industry
    const items = allItems.filter(item => item.industryId === currentUser.id);
    
    const grid = document.getElementById('industryItemsGrid');
    grid.innerHTML = '';
    
    if (items.length === 0) {
      grid.innerHTML = '<p>No equipment listed yet. Click "Add Equipment" to start.</p>';
      return;
    }
    
    items.forEach(item => {
      const card = createIndustryItemCard(item);
      grid.appendChild(card);
    });
  } catch (error) {
    console.error('Error loading items:', error);
  }
}

function createIndustryItemCard(item) {
  const card = document.createElement('div');
  card.className = 'item-card';
  
  card.innerHTML = `
    <img src="${item.imageUrl}" alt="${item.name}">
    <div class="item-card-content">
      <span class="item-category">${item.category}</span>
      <h3>${item.name}</h3>
      <p>${item.description}</p>
      <div class="item-price">$${item.pricePerDay}<span style="font-size: 14px; font-weight: normal;">/day</span></div>
      <div class="item-info">
        <span class="item-available">Total: ${item.quantity} | Available: ${item.available}</span>
        <span class="health-score excellent">⭐ ${item.healthScore}/100</span>
      </div>
    </div>
  `;
  
  return card;
}

async function loadIndustryRentals() {
  try {
    const response = await fetch('/api/industry/rentals');
    const rentals = await response.json();
    
    const container = document.getElementById('industryRentalsTable');
    
    if (rentals.length === 0) {
      container.innerHTML = '<p>No rentals yet.</p>';
      return;
    }
    
    let html = `
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Rented By</th>
            <th>Days</th>
            <th>Revenue</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    rentals.forEach(rental => {
      html += `
        <tr>
          <td>${rental.itemName}</td>
          <td>${rental.username}</td>
          <td>${rental.days}</td>
          <td>$${rental.totalPrice}</td>
          <td>${new Date(rental.startDate).toLocaleDateString()}</td>
          <td>${new Date(rental.endDate).toLocaleDateString()}</td>
          <td><span class="status-badge status-${rental.status}">${rental.status}</span></td>
        </tr>
      `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
  } catch (error) {
    console.error('Error loading rentals:', error);
  }
}

async function addItem(e) {
  e.preventDefault();
  
  const formData = {
    name: document.getElementById('itemName').value,
    category: document.getElementById('itemCategory').value,
    description: document.getElementById('itemDescription').value,
    pricePerDay: document.getElementById('itemPrice').value,
    quantity: document.getElementById('itemQuantity').value
  };
  
  try {
    const response = await fetch('/api/items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });
    
    if (response.ok) {
      alert('Equipment added successfully!');
      document.getElementById('addItemModal').style.display = 'none';
      document.getElementById('addItemForm').reset();
      loadIndustryItems();
      loadIndustryStats();
    } else {
      const data = await response.json();
      alert(data.message || 'Failed to add equipment');
    }
  } catch (error) {
    alert('An error occurred. Please try again.');
  }
}

function handleSearch() {
  loadItems();
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
