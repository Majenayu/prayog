// Login page JavaScript
document.addEventListener('DOMContentLoaded', function() {
  // Tab switching
  const tabs = document.querySelectorAll('.tab');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const roleSelect = document.getElementById('regRole');
  const companyNameGroup = document.getElementById('companyNameGroup');
  
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
  
  // Show/hide company name field based on role
  roleSelect.addEventListener('change', function() {
    if (this.value === 'industry') {
      companyNameGroup.style.display = 'block';
      document.getElementById('regCompany').required = true;
    } else {
      companyNameGroup.style.display = 'none';
      document.getElementById('regCompany').required = false;
    }
  });
  
  // Login form submission
  loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      
      if (data.success) {
        showMessage('Login successful! Redirecting...', 'success');
        setTimeout(() => {
          window.location.href = '/pages/dashboard.html';
        }, 1000);
      } else {
        showMessage(data.message || 'Login failed', 'error');
      }
    } catch (error) {
      showMessage('An error occurred. Please try again.', 'error');
    }
  });
  
  // Register form submission
  registerForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const role = document.getElementById('regRole').value;
    const companyName = document.getElementById('regCompany').value;
    
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          username, 
          email, 
          password, 
          role,
          companyName: role === 'industry' ? companyName : null
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        showMessage('Registration successful! Please login.', 'success');
        setTimeout(() => {
          // Switch to login tab
          tabs[0].click();
          registerForm.reset();
        }, 1500);
      } else {
        showMessage(data.message || 'Registration failed', 'error');
      }
    } catch (error) {
      showMessage('An error occurred. Please try again.', 'error');
    }
  });
  
  function showMessage(text, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = text;
    messageDiv.className = 'message ' + type;
    
    setTimeout(() => {
      messageDiv.className = 'message';
    }, 5000);
  }
});
