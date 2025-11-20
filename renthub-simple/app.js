// ========== RENTHUB - COMPLETE FRONTEND APPLICATION ==========
// This single file handles all frontend functionality for the entire application

// ========== GLOBAL STATE ==========
let currentUser = null;
let currentPage = window.location.pathname.split('/').pop() || 'index.html';

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', function() {
  initializePage();
});

function initializePage() {
  if (currentPage === 'index.html' || currentPage === '') {
    initLoginPage();
  } else {
    checkAuthAndInit();
  }
}

// ========== LOGIN PAGE ==========
function initLoginPage() {
  const tabs = document.querySelectorAll('.tab');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const roleSelect = document.getElementById('regRole');
  const companyNameGroup = document.getElementById('companyNameGroup');
  
  if (tabs) {
    tabs.forEach(tab => {
      tab.addEventListener('click', function() {
        tabs.forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        const tabName = this.getAttribute('data-tab');
        if (tabName === 'login') {
          loginForm.classList.remove('hidden');
          registerForm.classList.add('hidden');
        } else {
          loginForm.classList.add('hidden');
          registerForm.classList.remove('hidden');
        }
      });
    });
  }
  
  if (roleSelect) {
    roleSelect.addEventListener('change', function() {
      if (this.value === 'industry') {
        companyNameGroup.style.display = 'block';
        document.getElementById('regCompany').required = true;
      } else {
        companyNameGroup.style.display = 'none';
        document.getElementById('regCompany').required = false;
      }
    });
  }
  
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;
  
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    if (data.success) {
      showMessage('Login successful! Redirecting...', 'success');
      setTimeout(() => window.location.href = 'dashboard.html', 1000);
    } else {
      showMessage(data.message || 'Login failed', 'error');
    }
  } catch (error) {
    showMessage('An error occurred. Please try again.', 'error');
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const username = document.getElementById('regUsername').value;
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPassword').value;
  const role = document.getElementById('regRole').value;
  const companyName = document.getElementById('regCompany').value;
  
  try {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, role, companyName: role === 'industry' ? companyName : null })
    });
    
    const data = await response.json();
    if (data.success) {
      showMessage('Registration successful! Please login.', 'success');
      setTimeout(() => {
        document.querySelector('.tab[data-tab="login"]').click();
        document.getElementById('registerForm').reset();
      }, 1500);
    } else {
      showMessage(data.message || 'Registration failed', 'error');
    }
  } catch (error) {
    showMessage('An error occurred. Please try again.', 'error');
  }
}

// ========== DASHBOARD PAGE ==========
async function checkAuthAndInit() {
  try {
    const response = await fetch('/api/me');
    if (response.ok) {
      currentUser = await response.json();
      initAuthenticatedPage();
    } else {
      window.location.href = '/';
    }
  } catch (error) {
    window.location.href = '/';
  }
}

function initAuthenticatedPage() {
  const userWelcome = document.getElementById('userWelcome');
  if (userWelcome) {
    userWelcome.textContent = `Welcome, ${currentUser.username}!`;
  }
  
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
  
  if (currentPage === 'dashboard.html') {
    initDashboard();
  } else if (currentPage === 'appraisal.html') {
    initAppraisalPage();
  } else if (currentPage === 'health-report.html') {
    initHealthReportPage();
  } else if (currentPage === 'machine-parts.html') {
    initMachinePartsPage();
  } else if (currentPage === 'exchange.html') {
    initExchangePage();
  }
}

async function handleLogout() {
  try {
    await fetch('/api/logout', { method: 'POST' });
    window.location.href = '/';
  } catch (error) {
    console.error('Logout error:', error);
  }
}

function initDashboard() {
  if (currentUser.role === 'user') {
    document.getElementById('userDashboard').style.display = 'block';
    document.getElementById('industryDashboard').style.display = 'none';
    initUserDashboard();
  } else {
    document.getElementById('userDashboard').style.display = 'none';
    document.getElementById('industryDashboard').style.display = 'block';
    initIndustryDashboard();
  }
}

function initUserDashboard() {
  loadItems();
  loadUserRentals();
  
  document.getElementById('searchInput').addEventListener('input', debounce(loadItems, 300));
  
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      filterBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      loadItems();
    });
  });
  
  setupModals();
}

function initIndustryDashboard() {
  loadIndustryStats();
  loadIndustryItems();
  loadIndustryRentals();
  
  document.getElementById('addItemBtn').addEventListener('click', () => {
    document.getElementById('addItemModal').style.display = 'block';
  });
  
  document.getElementById('addItemForm').addEventListener('submit', handleAddItem);
  setupModals();
}

async function loadItems() {
  const category = document.querySelector('.filter-btn.active')?.getAttribute('data-category') || 'all';
  const search = document.getElementById('searchInput')?.value || '';
  
  try {
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
    <img src="${item.imageUrl}" alt="${item.name}" onerror="this.src='/images/IRB_1600_robot_main_body_763c8594.png'">
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
  
  document.getElementById('modalItemName').textContent = item.name;
  document.getElementById('modalItemImage').src = item.imageUrl;
  document.getElementById('modalItemDescription').textContent = item.description;
  document.getElementById('modalItemPrice').textContent = item.pricePerDay;
  document.getElementById('modalItemAvailable').textContent = item.available;
  document.getElementById('rentalDays').value = 1;
  
  updateRentalTotal(item.pricePerDay);
  
  const confirmBtn = document.getElementById('confirmRentalBtn');
  confirmBtn.onclick = () => confirmRental(item.id, item.pricePerDay);
  
  document.getElementById('rentalDays').oninput = (e) => updateRentalTotal(item.pricePerDay);
  
  document.getElementById('rentalModal').style.display = 'block';
}

function updateRentalTotal(pricePerDay) {
  const days = parseInt(document.getElementById('rentalDays').value) || 1;
  document.getElementById('totalPrice').textContent = (pricePerDay * days).toFixed(2);
}

async function confirmRental(itemId, pricePerDay) {
  const days = parseInt(document.getElementById('rentalDays').value);
  
  try {
    const response = await fetch('/api/rentals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, days })
    });
    
    const data = await response.json();
    if (response.ok) {
      alert('Rental confirmed! Check your rentals below.');
      document.getElementById('rentalModal').style.display = 'none';
      loadItems();
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

async function handleAddItem(e) {
  e.preventDefault();
  
  const formData = {
    name: document.getElementById('itemName').value,
    category: document.getElementById('itemCategory').value,
    machineType: document.getElementById('itemMachineType').value,
    description: document.getElementById('itemDescription').value,
    pricePerDay: document.getElementById('itemPrice').value,
    quantity: document.getElementById('itemQuantity').value
  };
  
  try {
    const response = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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

// ========== AI APPRAISAL PAGE ==========
function initAppraisalPage() {
  loadAppraisalItems();
  loadAppraisals();
  
  document.getElementById('appraisalForm').addEventListener('submit', handleAppraisal);
  
  const uploadArea = document.getElementById('appraisalUploadArea');
  const fileInput = document.getElementById('appraisalImage');
  
  uploadArea.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', handleImagePreview);
}

async function loadAppraisalItems() {
  try {
    const response = await fetch('/api/items');
    const items = await response.json();
    
    const select = document.getElementById('appraisalItem');
    select.innerHTML = '<option value="">Select equipment...</option>';
    items.forEach(item => {
      select.innerHTML += `<option value="${item.id}">${item.name} - ${item.industryName}</option>`;
    });
  } catch (error) {
    console.error('Error loading items:', error);
  }
}

function handleImagePreview(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(event) {
      const preview = document.getElementById('appraisalPreview');
      preview.src = event.target.result;
      preview.style.display = 'block';
    };
    reader.readAsDataURL(file);
  }
}

async function handleAppraisal(e) {
  e.preventDefault();
  
  const itemId = document.getElementById('appraisalItem').value;
  const fileInput = document.getElementById('appraisalImage');
  
  const formData = new FormData();
  formData.append('itemId', itemId);
  if (fileInput.files[0]) {
    formData.append('image', fileInput.files[0]);
  }
  
  try {
    const response = await fetch('/api/ai/appraisal', {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    if (response.ok) {
      displayAppraisalResults(data);
      loadAppraisals();
    } else {
      alert(data.message || 'Failed to generate appraisal');
    }
  } catch (error) {
    alert('An error occurred: ' + error.message);
  }
}

function displayAppraisalResults(data) {
  document.getElementById('estimatedValue').textContent = '$' + data.estimatedValue;
  document.getElementById('conditionScore').textContent = data.conditionScore + '/100';
  document.getElementById('marketDemand').textContent = data.marketDemand.toUpperCase();
  document.getElementById('mlConfidence').textContent = (data.mlConfidence * 100).toFixed(0) + '%';
  document.getElementById('aiNotes').textContent = data.notes;
  
  document.getElementById('appraisalResults').style.display = 'block';
}

async function loadAppraisals() {
  try {
    const response = await fetch('/api/appraisals');
    const appraisals = await response.json();
    
    const list = document.getElementById('appraisalsList');
    if (appraisals.length === 0) {
      list.innerHTML = '<p>No appraisals yet.</p>';
      return;
    }
    
    list.innerHTML = '';
    appraisals.forEach(appraisal => {
      const card = document.createElement('div');
      card.className = 'appraisal-result mt-20';
      card.innerHTML = `
        <h4>${appraisal.itemName}</h4>
        <p><strong>Estimated Value:</strong> $${appraisal.estimatedValue}</p>
        <p><strong>Condition Score:</strong> ${appraisal.conditionScore}/100</p>
        <p><strong>Market Demand:</strong> ${appraisal.marketDemand}</p>
        <p><strong>Appraised By:</strong> ${appraisal.appraisedBy}</p>
        <p><small>${new Date(appraisal.createdAt).toLocaleString()}</small></p>
      `;
      list.appendChild(card);
    });
  } catch (error) {
    console.error('Error loading appraisals:', error);
  }
}

// ========== HEALTH REPORT PAGE ==========
function initHealthReportPage() {
  loadHealthItems();
  loadHealthReports();
  
  document.getElementById('healthReportForm').addEventListener('submit', handleHealthReport);
  
  const uploadArea = document.getElementById('healthUploadArea');
  const fileInput = document.getElementById('healthImage');
  
  uploadArea.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', handleHealthImagePreview);
}

async function loadHealthItems() {
  try {
    const response = await fetch('/api/items');
    const items = await response.json();
    
    const select = document.getElementById('healthItem');
    select.innerHTML = '<option value="">Select equipment...</option>';
    items.forEach(item => {
      select.innerHTML += `<option value="${item.id}">${item.name} - ${item.industryName}</option>`;
    });
  } catch (error) {
    console.error('Error loading items:', error);
  }
}

function handleHealthImagePreview(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(event) {
      const preview = document.getElementById('healthPreview');
      preview.src = event.target.result;
      preview.style.display = 'block';
    };
    reader.readAsDataURL(file);
  }
}

async function handleHealthReport(e) {
  e.preventDefault();
  
  const itemId = document.getElementById('healthItem').value;
  const fileInput = document.getElementById('healthImage');
  
  const formData = new FormData();
  formData.append('itemId', itemId);
  if (fileInput.files[0]) {
    formData.append('image', fileInput.files[0]);
  }
  
  try {
    const response = await fetch('/api/ai/health-report', {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    if (response.ok) {
      displayHealthResults(data);
      loadHealthReports();
    } else {
      alert(data.message || 'Failed to generate health report');
    }
  } catch (error) {
    alert('An error occurred: ' + error.message);
  }
}

function displayHealthResults(data) {
  document.getElementById('overallCondition').textContent = data.overallCondition.toUpperCase();
  document.getElementById('healthConditionScore').textContent = data.conditionScore + '/100';
  document.getElementById('lifeRemaining').textContent = data.estimatedLifeRemaining;
  document.getElementById('visualInspection').textContent = data.visualInspection;
  document.getElementById('functionalTest').textContent = data.functionalTest;
  document.getElementById('wearAndTear').textContent = data.wearAndTear;
  
  document.getElementById('healthResults').style.display = 'block';
}

async function loadHealthReports() {
  try {
    const response = await fetch('/api/health-reports');
    const reports = await response.json();
    
    const list = document.getElementById('healthReportsList');
    if (reports.length === 0) {
      list.innerHTML = '<p>No health reports yet.</p>';
      return;
    }
    
    list.innerHTML = '';
    reports.forEach(report => {
      const card = document.createElement('div');
      card.className = 'appraisal-result mt-20';
      card.innerHTML = `
        <h4>${report.itemName}</h4>
        <p><strong>Overall Condition:</strong> ${report.overallCondition}</p>
        <p><strong>Condition Score:</strong> ${report.conditionScore}/100</p>
        <p><strong>Life Remaining:</strong> ${report.estimatedLifeRemaining}</p>
        <p><strong>Inspected By:</strong> ${report.inspectedBy}</p>
        <p><small>${new Date(report.createdAt).toLocaleString()}</small></p>
      `;
      list.appendChild(card);
    });
  } catch (error) {
    console.error('Error loading health reports:', error);
  }
}

// ========== MACHINE PARTS PAGE ==========
function initMachinePartsPage() {
  loadPartsItems();
  
  if (currentUser.role === 'industry') {
    document.getElementById('industryPartsSection').style.display = 'block';
    document.getElementById('addPartForm').addEventListener('submit', handleAddPart);
  }
  
  document.getElementById('partsItem').addEventListener('change', loadMachineParts);
}

async function loadPartsItems() {
  try {
    const response = await fetch('/api/items');
    const items = await response.json();
    
    const select = document.getElementById('partsItem');
    select.innerHTML = '<option value="">Select equipment...</option>';
    items.forEach(item => {
      select.innerHTML += `<option value="${item.id}">${item.name} - ${item.industryName}</option>`;
    });
  } catch (error) {
    console.error('Error loading items:', error);
  }
}

async function loadMachineParts() {
  const itemId = document.getElementById('partsItem').value;
  if (!itemId) return;
  
  try {
    const itemResponse = await fetch(`/api/items/${itemId}`);
    const item = await itemResponse.json();
    
    document.getElementById('machineImage').src = item.imageUrl;
    
    const partsResponse = await fetch(`/api/machine-parts/${itemId}`);
    const parts = await partsResponse.json();
    
    const markersContainer = document.getElementById('partsMarkers');
    markersContainer.innerHTML = '';
    
    parts.forEach((part, index) => {
      const marker = document.createElement('div');
      marker.className = 'part-marker';
      marker.style.left = part.position.x + '%';
      marker.style.top = part.position.y + '%';
      marker.textContent = index + 1;
      
      const info = document.createElement('div');
      info.className = 'part-info';
      info.textContent = `${part.partName} (${part.partNumber})`;
      marker.appendChild(info);
      
      markersContainer.appendChild(marker);
    });
  } catch (error) {
    console.error('Error loading machine parts:', error);
  }
}

async function handleAddPart(e) {
  e.preventDefault();
  
  const itemId = document.getElementById('partsItem').value;
  const partName = document.getElementById('partName').value;
  const partNumber = document.getElementById('partNumber').value;
  
  try {
    const response = await fetch('/api/machine-parts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, partName, partNumber, position: { x: 50, y: 50 } })
    });
    
    if (response.ok) {
      alert('Part added successfully!');
      document.getElementById('addPartForm').reset();
      loadMachineParts();
    } else {
      alert('Failed to add part');
    }
  } catch (error) {
    alert('An error occurred');
  }
}

// ========== EXCHANGE MARKETPLACE PAGE ==========
function initExchangePage() {
  loadExchanges();
  
  document.getElementById('createExchangeBtn').addEventListener('click', () => {
    loadExchangeItems();
    document.getElementById('createExchangeModal').style.display = 'block';
  });
  
  document.getElementById('createExchangeForm').addEventListener('submit', handleCreateExchange);
  setupModals();
}

async function loadExchangeItems() {
  try {
    const response = await fetch('/api/items');
    const items = await response.json();
    
    const offeredSelect = document.getElementById('offeredItem');
    const requestedSelect = document.getElementById('requestedItem');
    
    offeredSelect.innerHTML = '<option value="">Select item to offer...</option>';
    requestedSelect.innerHTML = '<option value="">Select item you want...</option>';
    
    items.forEach(item => {
      offeredSelect.innerHTML += `<option value="${item.id}">${item.name} - ${item.industryName}</option>`;
      requestedSelect.innerHTML += `<option value="${item.id}">${item.name} - ${item.industryName}</option>`;
    });
  } catch (error) {
    console.error('Error loading items:', error);
  }
}

async function loadExchanges() {
  try {
    const response = await fetch('/api/exchanges');
    const exchanges = await response.json();
    
    const list = document.getElementById('exchangesList');
    if (exchanges.length === 0) {
      list.innerHTML = '<p>No exchange offers yet.</p>';
      return;
    }
    
    list.innerHTML = '';
    exchanges.forEach(exchange => {
      const card = document.createElement('div');
      card.className = 'exchange-card';
      card.innerHTML = `
        <div class="exchange-items">
          <div class="exchange-item">
            <img src="${exchange.offeredItemImage}" alt="${exchange.offeredItemName}">
            <h4>${exchange.offeredItemName}</h4>
            <p>Offered by: ${exchange.offererName}</p>
          </div>
          <div class="exchange-arrow">⇄</div>
          <div class="exchange-item">
            <img src="${exchange.requestedItemImage}" alt="${exchange.requestedItemName}">
            <h4>${exchange.requestedItemName}</h4>
          </div>
        </div>
        <p><strong>Type:</strong> ${exchange.exchangeType}</p>
        ${exchange.additionalPayment > 0 ? `<p><strong>Additional Payment:</strong> $${exchange.additionalPayment}</p>` : ''}
        <p><strong>Notes:</strong> ${exchange.notes || 'None'}</p>
        <p><strong>Status:</strong> <span class="status-badge status-${exchange.status}">${exchange.status}</span></p>
        <p><small>${new Date(exchange.createdAt).toLocaleString()}</small></p>
      `;
      list.appendChild(card);
    });
  } catch (error) {
    console.error('Error loading exchanges:', error);
  }
}

async function handleCreateExchange(e) {
  e.preventDefault();
  
  const formData = {
    offeredItemId: document.getElementById('offeredItem').value,
    requestedItemId: document.getElementById('requestedItem').value,
    exchangeType: document.getElementById('exchangeType').value,
    additionalPayment: document.getElementById('additionalPayment').value,
    notes: document.getElementById('exchangeNotes').value
  };
  
  try {
    const response = await fetch('/api/exchanges', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    if (response.ok) {
      alert('Exchange offer created successfully!');
      document.getElementById('createExchangeModal').style.display = 'none';
      document.getElementById('createExchangeForm').reset();
      loadExchanges();
    } else {
      alert('Failed to create exchange offer');
    }
  } catch (error) {
    alert('An error occurred');
  }
}

// ========== UTILITY FUNCTIONS ==========
function setupModals() {
  const modals = document.querySelectorAll('.modal');
  const closeBtns = document.querySelectorAll('.close');
  
  closeBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      this.closest('.modal').style.display = 'none';
    });
  });
  
  window.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
      e.target.style.display = 'none';
    }
  });
}

function showMessage(text, type) {
  const messageDiv = document.getElementById('message');
  if (!messageDiv) return;
  
  messageDiv.textContent = text;
  messageDiv.className = 'message ' + type;
  
  setTimeout(() => {
    messageDiv.className = 'message';
  }, 5000);
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
