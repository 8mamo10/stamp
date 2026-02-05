/**
 * Admin App Logic
 */

// DOM Elements
const authScreen = document.getElementById('auth-screen');
const appScreen = document.getElementById('app-screen');
const storesView = document.getElementById('stores-view');
const analyticsView = document.getElementById('analytics-view');
const addStoreForm = document.getElementById('add-store-form');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  setupEventListeners();
});

/**
 * Check authentication
 */
function checkAuth() {
  if (AuthAPI.isLoggedIn()) {
    const user = AuthAPI.getUser();
    if (user.role === 'admin') {
      showApp();
      loadStores();
    } else {
      alert('This portal is for administrators only');
      AuthAPI.logout();
      showAuth();
    }
  } else {
    showAuth();
  }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Auth
  document.getElementById('loginForm').addEventListener('submit', handleLogin);
  document.getElementById('logout-btn').addEventListener('click', handleLogout);

  // Navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      switchView(item.dataset.view);
    });
  });

  // Store management
  document.getElementById('add-store-btn').addEventListener('click', showAddStoreForm);
  document.getElementById('cancel-add-store').addEventListener('click', hideAddStoreForm);
  document.getElementById('createStoreForm').addEventListener('submit', handleCreateStore);
}

/**
 * Handle login
 */
async function handleLogin(e) {
  e.preventDefault();

  const identifier = document.getElementById('login-identifier').value.trim();
  const password = document.getElementById('login-password').value;

  const isEmail = identifier.includes('@');
  const email = isEmail ? identifier : '';
  const phone = isEmail ? '' : identifier;

  try {
    const response = await AuthAPI.login(email, phone, password);

    if (response.success && response.user.role === 'admin') {
      AuthAPI.saveAuth(response.token, response.user);
      showApp();
      loadStores();
    } else if (response.success && response.user.role !== 'admin') {
      alert('This portal is for administrators only');
    }
  } catch (error) {
    alert(error.message || 'Login failed');
  }
}

/**
 * Handle logout
 */
function handleLogout() {
  if (confirm('Are you sure you want to logout?')) {
    AuthAPI.logout();
    showAuth();
  }
}

/**
 * Show/hide screens
 */
function showAuth() {
  authScreen.classList.remove('hidden');
  appScreen.classList.add('hidden');
}

function showApp() {
  authScreen.classList.add('hidden');
  appScreen.classList.remove('hidden');
}

/**
 * Switch view
 */
function switchView(view) {
  // Update nav
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.view === view);
  });

  // Hide all views
  storesView.classList.add('hidden');
  analyticsView.classList.add('hidden');

  // Show selected view
  if (view === 'stores') {
    storesView.classList.remove('hidden');
    loadStores();
  } else if (view === 'analytics') {
    analyticsView.classList.remove('hidden');
    loadAnalytics();
  }
}

/**
 * Load stores
 */
async function loadStores() {
  const storesList = document.getElementById('stores-list');
  storesList.innerHTML = '<div class="loading"><div class="spinner"></div>Loading stores...</div>';

  try {
    const response = await AdminAPI.getStores();

    if (response.success && response.stores.length > 0) {
      storesList.innerHTML = response.stores.map(store => renderStore(store)).join('');
    } else {
      storesList.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No stores yet</p>';
    }
  } catch (error) {
    storesList.innerHTML = `<div class="message message-error">Error loading stores: ${error.message}</div>`;
  }
}

/**
 * Render store
 */
function renderStore(store) {
  const statusBadge = store.isActive === 'TRUE'
    ? '<span class="badge badge-success">Active</span>'
    : '<span class="badge badge-secondary">Inactive</span>';

  return `
    <div style="padding: 15px; border: 1px solid var(--border-color); border-radius: 8px; margin-bottom: 10px;">
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
        <div>
          <h3 style="font-size: 1.1rem; font-weight: 600;">${store.storeName}</h3>
          <p style="font-size: 0.9rem; color: #666; margin-top: 5px;">
            Owner: ${store.ownerEmail || store.ownerPhone || 'Not assigned'}
          </p>
        </div>
        ${statusBadge}
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.9rem;">
        <div>
          <span style="color: #666;">Active Cards:</span>
          <strong>${store.activeCards}</strong>
        </div>
        <div>
          <span style="color: #666;">Completed:</span>
          <strong>${store.completedCards}</strong>
        </div>
      </div>

      <div style="font-size: 0.85rem; color: #999; margin-top: 10px;">
        Created: ${new Date(store.createdAt).toLocaleDateString()}
      </div>
    </div>
  `;
}

/**
 * Show add store form
 */
function showAddStoreForm() {
  addStoreForm.classList.remove('hidden');
  document.getElementById('add-store-btn').disabled = true;
}

/**
 * Hide add store form
 */
function hideAddStoreForm() {
  addStoreForm.classList.add('hidden');
  document.getElementById('createStoreForm').reset();
  document.getElementById('add-store-btn').disabled = false;
}

/**
 * Handle create store
 */
async function handleCreateStore(e) {
  e.preventDefault();

  const storeName = document.getElementById('store-name').value.trim();
  const ownerEmail = document.getElementById('owner-email').value.trim();
  const ownerPhone = document.getElementById('owner-phone').value.trim();
  const ownerPassword = document.getElementById('owner-password').value;

  try {
    const response = await AdminAPI.createStore(storeName, ownerEmail, ownerPhone, ownerPassword);

    if (response.success) {
      alert('Store created successfully!');
      hideAddStoreForm();
      loadStores();
    }
  } catch (error) {
    alert(error.message || 'Failed to create store');
  }
}

/**
 * Load analytics
 */
async function loadAnalytics() {
  const analyticsContent = document.getElementById('analytics-content');
  analyticsContent.innerHTML = '<div class="loading"><div class="spinner"></div>Loading analytics...</div>';

  try {
    const response = await AdminAPI.getAnalytics();

    if (response.success) {
      const a = response.analytics;
      analyticsContent.innerHTML = `
        <div class="card">
          <h2 class="card-title">System Overview</h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px;">
            <div style="text-align: center; padding: 20px; background: var(--bg-color); border-radius: 8px;">
              <div style="font-size: 2.5rem; font-weight: 600; color: var(--primary-color);">${a.totalStores}</div>
              <div style="color: #666; margin-top: 5px;">Total Stores</div>
            </div>
            <div style="text-align: center; padding: 20px; background: var(--bg-color); border-radius: 8px;">
              <div style="font-size: 2.5rem; font-weight: 600; color: var(--primary-color);">${a.activeStores}</div>
              <div style="color: #666; margin-top: 5px;">Active Stores</div>
            </div>
            <div style="text-align: center; padding: 20px; background: var(--bg-color); border-radius: 8px;">
              <div style="font-size: 2.5rem; font-weight: 600; color: var(--secondary-color);">${a.totalCustomers}</div>
              <div style="color: #666; margin-top: 5px;">Total Customers</div>
            </div>
            <div style="text-align: center; padding: 20px; background: var(--bg-color); border-radius: 8px;">
              <div style="font-size: 2.5rem; font-weight: 600; color: var(--secondary-color);">${a.totalCards}</div>
              <div style="color: #666; margin-top: 5px;">Total Cards</div>
            </div>
          </div>
        </div>

        <div class="card">
          <h2 class="card-title">Activity</h2>
          <div style="margin-top: 15px;">
            <div style="display: flex; justify-content: space-between; padding: 15px 0; border-bottom: 1px solid var(--border-color);">
              <span>Total Stamps Issued</span>
              <strong style="color: var(--primary-color);">${a.totalStampsIssued}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 15px 0; border-bottom: 1px solid var(--border-color);">
              <span>Total Redemptions</span>
              <strong style="color: var(--secondary-color);">${a.totalRedemptions}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 15px 0;">
              <span>Total Rewards</span>
              <strong>${a.totalRewards}</strong>
            </div>
          </div>
        </div>
      `;
    }
  } catch (error) {
    analyticsContent.innerHTML = `<div class="message message-error">Error loading analytics: ${error.message}</div>`;
  }
}
