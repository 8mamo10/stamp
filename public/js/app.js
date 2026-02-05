/**
 * Customer App Logic
 */

// DOM Elements
const authScreen = document.getElementById('auth-screen');
const appScreen = document.getElementById('app-screen');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const cardsView = document.getElementById('cards-view');
const rewardsView = document.getElementById('rewards-view');
const qrView = document.getElementById('qr-view');
const rewardModal = document.getElementById('reward-modal');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  setupEventListeners();
  registerServiceWorker();
});

/**
 * Register service worker for PWA
 */
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('Service Worker registered:', registration);
      })
      .catch((error) => {
        console.log('Service Worker registration failed:', error);
      });
  }
}

/**
 * Check if user is authenticated
 */
function checkAuth() {
  if (AuthAPI.isLoggedIn()) {
    showApp();
    loadCards();
  } else {
    showAuth();
  }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Auth forms
  document.getElementById('loginForm').addEventListener('submit', handleLogin);
  document.getElementById('registerForm').addEventListener('submit', handleRegister);
  document.getElementById('show-register').addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
  });
  document.getElementById('show-login').addEventListener('click', (e) => {
    e.preventDefault();
    registerForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
  });

  // App actions
  document.getElementById('logout-btn').addEventListener('click', handleLogout);
  document.getElementById('show-qr-btn').addEventListener('click', showCustomerQR);
  document.getElementById('close-qr-btn').addEventListener('click', () => {
    qrView.classList.add('hidden');
    cardsView.classList.remove('hidden');
  });
  document.getElementById('close-reward-modal').addEventListener('click', () => {
    rewardModal.classList.add('hidden');
  });

  // Bottom navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const view = item.dataset.view;
      switchView(view);
    });
  });
}

/**
 * Handle login
 */
async function handleLogin(e) {
  e.preventDefault();

  const identifier = document.getElementById('login-identifier').value.trim();
  const password = document.getElementById('login-password').value;

  // Determine if identifier is email or phone
  const isEmail = identifier.includes('@');
  const email = isEmail ? identifier : '';
  const phone = isEmail ? '' : identifier;

  try {
    showMessage('Logging in...', 'info');
    const response = await AuthAPI.login(email, phone, password);

    if (response.success) {
      AuthAPI.saveAuth(response.token, response.user);
      showMessage('Login successful!', 'success');
      setTimeout(() => {
        showApp();
        loadCards();
      }, 500);
    }
  } catch (error) {
    showMessage(error.message || 'Login failed', 'error');
  }
}

/**
 * Handle registration
 */
async function handleRegister(e) {
  e.preventDefault();

  const email = document.getElementById('register-email').value.trim();
  const phone = document.getElementById('register-phone').value.trim();
  const password = document.getElementById('register-password').value;

  if (!email && !phone) {
    showMessage('Please provide email or phone number', 'error');
    return;
  }

  try {
    showMessage('Creating account...', 'info');
    const response = await AuthAPI.register(email, phone, password);

    if (response.success) {
      AuthAPI.saveAuth(response.token, response.user);
      showMessage('Account created successfully!', 'success');
      setTimeout(() => {
        showApp();
        loadCards();
      }, 500);
    }
  } catch (error) {
    showMessage(error.message || 'Registration failed', 'error');
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
 * Show auth screen
 */
function showAuth() {
  authScreen.classList.remove('hidden');
  appScreen.classList.add('hidden');
}

/**
 * Show app screen
 */
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
  cardsView.classList.add('hidden');
  rewardsView.classList.add('hidden');
  qrView.classList.add('hidden');

  // Show selected view
  if (view === 'cards') {
    cardsView.classList.remove('hidden');
    loadCards();
  } else if (view === 'rewards') {
    rewardsView.classList.remove('hidden');
    loadRewards();
  }
}

/**
 * Load customer cards
 */
async function loadCards() {
  const cardsList = document.getElementById('cards-list');
  cardsList.innerHTML = '<div class="loading"><div class="spinner"></div>Loading your cards...</div>';

  try {
    const response = await CustomerAPI.getCards();

    if (response.success && response.cards.length > 0) {
      cardsList.innerHTML = response.cards.map(card => renderCard(card)).join('');
    } else {
      cardsList.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🎫</div>
          <p>No stamp cards yet</p>
          <p style="font-size: 0.9rem; margin-top: 10px;">
            Visit a store and start collecting stamps!
          </p>
        </div>
      `;
    }
  } catch (error) {
    cardsList.innerHTML = `<div class="message message-error">Error loading cards: ${error.message}</div>`;
  }
}

/**
 * Render card
 */
function renderCard(card) {
  const progress = (card.currentStamps / card.stampsRequired) * 100;
  const statusBadge = card.status === 'completed'
    ? '<span class="badge badge-success">Completed!</span>'
    : card.status === 'redeemed'
    ? '<span class="badge badge-secondary">Redeemed</span>'
    : '<span class="badge badge-warning">Active</span>';

  const stamps = [];
  for (let i = 0; i < card.stampsRequired; i++) {
    stamps.push(`<div class="stamp-item ${i < card.currentStamps ? 'filled' : ''}">
      ${i < card.currentStamps ? '✓' : ''}
    </div>`);
  }

  return `
    <div class="card">
      <div class="card-header">
        <div>
          <h3 class="card-title">${card.storeName}</h3>
          <p class="card-subtitle">${card.cardName}</p>
        </div>
        ${statusBadge}
      </div>

      <div class="stamp-progress">
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${progress}%">
            ${card.currentStamps}/${card.stampsRequired}
          </div>
        </div>
        <div class="stamp-grid">
          ${stamps.join('')}
        </div>
      </div>

      ${card.status === 'completed' ? `
        <div class="message message-success">
          🎉 Reward available: ${card.rewardDescription}
        </div>
      ` : `
        <p style="color: #666; font-size: 0.9rem; margin-top: 10px;">
          Reward: ${card.rewardDescription}
        </p>
      `}
    </div>
  `;
}

/**
 * Load customer rewards
 */
async function loadRewards() {
  const rewardsList = document.getElementById('rewards-list');
  rewardsList.innerHTML = '<div class="loading"><div class="spinner"></div>Loading rewards...</div>';

  try {
    const response = await CustomerAPI.getRewards();

    if (response.success && response.rewards.length > 0) {
      rewardsList.innerHTML = response.rewards.map(reward => renderReward(reward)).join('');

      // Add click handlers
      document.querySelectorAll('.redeem-reward-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const rewardId = btn.dataset.rewardId;
          const reward = response.rewards.find(r => r.rewardId === rewardId);
          showRewardQR(reward);
        });
      });
    } else {
      rewardsList.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🎁</div>
          <p>No rewards yet</p>
          <p style="font-size: 0.9rem; margin-top: 10px;">
            Complete stamp cards to earn rewards!
          </p>
        </div>
      `;
    }
  } catch (error) {
    rewardsList.innerHTML = `<div class="message message-error">Error loading rewards: ${error.message}</div>`;
  }
}

/**
 * Render reward
 */
function renderReward(reward) {
  const statusBadge = reward.status === 'available'
    ? '<span class="badge badge-success">Available</span>'
    : '<span class="badge badge-secondary">Redeemed</span>';

  return `
    <div class="card">
      <div class="card-header">
        <div>
          <h3 class="card-title">${reward.storeName}</h3>
          <p class="card-subtitle">${reward.rewardDescription}</p>
        </div>
        ${statusBadge}
      </div>

      ${reward.status === 'available' ? `
        <button class="btn btn-primary redeem-reward-btn" data-reward-id="${reward.rewardId}">
          Show QR Code to Redeem
        </button>
      ` : `
        <p style="color: #666; font-size: 0.9rem;">
          Redeemed on ${new Date(reward.redeemedAt).toLocaleDateString()}
        </p>
      `}
    </div>
  `;
}

/**
 * Show customer QR code
 */
function showCustomerQR() {
  const user = AuthAPI.getUser();
  const qrData = generateCustomerQR(user.userId);

  cardsView.classList.add('hidden');
  rewardsView.classList.add('hidden');
  qrView.classList.remove('hidden');

  displayQR('customer-qr', qrData);
  document.getElementById('customer-id').textContent = `ID: ${user.email || user.phone}`;
}

/**
 * Show reward QR code
 */
function showRewardQR(reward) {
  const qrData = generateRewardQR(reward.rewardCode);

  document.getElementById('reward-detail').innerHTML = `
    <p><strong>Store:</strong> ${reward.storeName}</p>
    <p><strong>Reward:</strong> ${reward.rewardDescription}</p>
    <p><strong>Code:</strong> ${reward.rewardCode}</p>
  `;

  displayQR('reward-qr', qrData);
  rewardModal.classList.remove('hidden');
}

/**
 * Show message
 */
function showMessage(message, type = 'info') {
  const existing = document.querySelector('.message');
  if (existing) {
    existing.remove();
  }

  const messageEl = document.createElement('div');
  messageEl.className = `message message-${type}`;
  messageEl.textContent = message;

  const container = document.querySelector('.container');
  if (container) {
    container.insertBefore(messageEl, container.firstChild);

    setTimeout(() => {
      messageEl.remove();
    }, 5000);
  }
}
