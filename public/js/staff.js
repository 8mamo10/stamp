/**
 * Staff App Logic
 */

let currentScanner = null;

// DOM Elements
const authScreen = document.getElementById('auth-screen');
const appScreen = document.getElementById('app-screen');
const issueView = document.getElementById('issue-view');
const redeemView = document.getElementById('redeem-view');
const analyticsView = document.getElementById('analytics-view');
const settingsView = document.getElementById('settings-view');

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
    if (user.role === 'staff') {
      showApp();
      loadRecentActivity();
    } else {
      alert('This portal is for store staff only');
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

  // Issue stamp
  document.getElementById('scan-qr-btn').addEventListener('click', startQRScanner);
  document.getElementById('manual-entry-btn').addEventListener('click', showManualEntry);
  document.getElementById('stop-scan-btn').addEventListener('click', stopScanner);
  document.getElementById('cancel-manual-btn').addEventListener('click', hideManualEntry);
  document.getElementById('issueStampForm').addEventListener('submit', handleIssueStamp);

  // Redeem
  document.getElementById('scan-reward-qr-btn').addEventListener('click', startRewardScanner);
  document.getElementById('manual-code-btn').addEventListener('click', showManualCode);
  document.getElementById('stop-reward-scan-btn').addEventListener('click', stopRewardScanner);
  document.getElementById('cancel-code-btn').addEventListener('click', hideManualCode);
  document.getElementById('redeemForm').addEventListener('submit', handleRedeem);

  // Settings
  document.getElementById('cardSettingsForm').addEventListener('submit', handleCreateCard);
  document.getElementById('rule-type').addEventListener('change', toggleRuleValue);
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

    if (response.success && response.user.role === 'staff') {
      AuthAPI.saveAuth(response.token, response.user);
      showApp();
      loadRecentActivity();
    } else if (response.success && response.user.role !== 'staff') {
      alert('This portal is for store staff only');
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
  issueView.classList.add('hidden');
  redeemView.classList.add('hidden');
  analyticsView.classList.add('hidden');
  settingsView.classList.add('hidden');

  // Stop any active scanners
  stopScanner();
  stopRewardScanner();

  // Show selected view
  if (view === 'issue') {
    issueView.classList.remove('hidden');
    loadRecentActivity();
  } else if (view === 'redeem') {
    redeemView.classList.remove('hidden');
  } else if (view === 'analytics') {
    analyticsView.classList.remove('hidden');
    loadAnalytics();
  } else if (view === 'settings') {
    settingsView.classList.remove('hidden');
  }
}

/**
 * Start QR scanner for customer ID
 */
function startQRScanner() {
  document.getElementById('scanner-container').classList.remove('hidden');
  document.getElementById('manual-entry').classList.add('hidden');

  currentScanner = initQRScanner('qr-scanner', onCustomerQRScanned, onScanError);
}

/**
 * Stop scanner
 */
function stopScanner() {
  if (currentScanner) {
    stopQRScanner(currentScanner);
    currentScanner = null;
  }
  document.getElementById('scanner-container').classList.add('hidden');
}

/**
 * Handle customer QR scan
 */
function onCustomerQRScanned(decodedText) {
  const qrData = parseQRData(decodedText);

  if (qrData && qrData.type === 'customer') {
    stopScanner();
    // Auto-fill and submit
    processStampIssuance(qrData.userId, 0);
  } else {
    showIssueResult('Invalid QR code', 'error');
  }
}

/**
 * Show manual entry
 */
function showManualEntry() {
  document.getElementById('manual-entry').classList.remove('hidden');
  document.getElementById('scanner-container').classList.add('hidden');
}

/**
 * Hide manual entry
 */
function hideManualEntry() {
  document.getElementById('manual-entry').classList.add('hidden');
  document.getElementById('issueStampForm').reset();
}

/**
 * Handle issue stamp
 */
async function handleIssueStamp(e) {
  e.preventDefault();

  const customerIdentifier = document.getElementById('customer-identifier').value.trim();
  const purchaseAmount = parseFloat(document.getElementById('purchase-amount').value) || 0;

  await processStampIssuance(customerIdentifier, purchaseAmount);
}

/**
 * Process stamp issuance
 */
async function processStampIssuance(customerIdentifier, purchaseAmount) {
  try {
    showIssueResult('Processing...', 'info');
    const response = await StaffAPI.issueStamp(customerIdentifier, purchaseAmount);

    if (response.success) {
      showIssueResult(response.message, 'success');
      document.getElementById('issueStampForm').reset();
      hideManualEntry();
      loadRecentActivity();
    }
  } catch (error) {
    showIssueResult(error.message || 'Failed to issue stamp', 'error');
  }
}

/**
 * Show issue result
 */
function showIssueResult(message, type) {
  const resultDiv = document.getElementById('issue-result');
  resultDiv.innerHTML = `<div class="message message-${type}">${message}</div>`;
}

/**
 * Start reward QR scanner
 */
function startRewardScanner() {
  document.getElementById('reward-scanner-container').classList.remove('hidden');
  document.getElementById('manual-code-entry').classList.add('hidden');

  currentScanner = initQRScanner('reward-qr-scanner', onRewardQRScanned, onScanError);
}

/**
 * Stop reward scanner
 */
function stopRewardScanner() {
  if (currentScanner) {
    stopQRScanner(currentScanner);
    currentScanner = null;
  }
  document.getElementById('reward-scanner-container').classList.add('hidden');
}

/**
 * Handle reward QR scan
 */
function onRewardQRScanned(decodedText) {
  const qrData = parseQRData(decodedText);

  if (qrData && qrData.type === 'reward') {
    stopRewardScanner();
    processRedemption(qrData.rewardCode);
  } else {
    showRedeemResult('Invalid reward QR code', 'error');
  }
}

/**
 * Show manual code entry
 */
function showManualCode() {
  document.getElementById('manual-code-entry').classList.remove('hidden');
  document.getElementById('reward-scanner-container').classList.add('hidden');
}

/**
 * Hide manual code entry
 */
function hideManualCode() {
  document.getElementById('manual-code-entry').classList.add('hidden');
  document.getElementById('redeemForm').reset();
}

/**
 * Handle redeem
 */
async function handleRedeem(e) {
  e.preventDefault();

  const rewardCode = document.getElementById('reward-code').value.trim().toUpperCase();
  await processRedemption(rewardCode);
}

/**
 * Process redemption
 */
async function processRedemption(rewardCode) {
  try {
    showRedeemResult('Processing...', 'info');
    const response = await StaffAPI.confirmRedemption(rewardCode);

    if (response.success) {
      showRedeemResult(`✓ ${response.message}`, 'success');
      document.getElementById('redeemForm').reset();
      hideManualCode();
    }
  } catch (error) {
    showRedeemResult(error.message || 'Redemption failed', 'error');
  }
}

/**
 * Show redeem result
 */
function showRedeemResult(message, type) {
  const resultDiv = document.getElementById('redeem-result');
  resultDiv.innerHTML = `<div class="message message-${type}">${message}</div>`;
}

/**
 * Scan error handler
 */
function onScanError(error) {
  // Ignore scan errors (they happen frequently while scanning)
}

/**
 * Load recent activity
 */
async function loadRecentActivity() {
  const activityDiv = document.getElementById('recent-activity');
  activityDiv.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

  try {
    const response = await StaffAPI.getAnalytics();

    if (response.success && response.analytics.recentTransactions.length > 0) {
      activityDiv.innerHTML = response.analytics.recentTransactions.map(t => `
        <div style="padding: 10px 0; border-bottom: 1px solid var(--border-color);">
          <div style="display: flex; justify-content: space-between;">
            <span>${t.customerName}</span>
            <span class="badge badge-${t.type === 'stamp' ? 'success' : 'warning'}">
              ${t.type}
            </span>
          </div>
          <div style="font-size: 0.9rem; color: #666; margin-top: 5px;">
            ${t.type === 'stamp' ? `Amount: $${t.purchaseAmount}` : 'Reward redeemed'} •
            ${new Date(t.timestamp).toLocaleString()}
          </div>
        </div>
      `).join('');
    } else {
      activityDiv.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">No recent activity</p>';
    }
  } catch (error) {
    activityDiv.innerHTML = `<div class="message message-error">${error.message}</div>`;
  }
}

/**
 * Load analytics
 */
async function loadAnalytics() {
  const analyticsContent = document.getElementById('analytics-content');
  analyticsContent.innerHTML = '<div class="loading"><div class="spinner"></div>Loading analytics...</div>';

  try {
    const response = await StaffAPI.getAnalytics();

    if (response.success) {
      const a = response.analytics;
      analyticsContent.innerHTML = `
        <div class="card">
          <h2 class="card-title">Overview</h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px;">
            <div style="text-align: center; padding: 15px; background: var(--bg-color); border-radius: 8px;">
              <div style="font-size: 2rem; font-weight: 600; color: var(--primary-color);">${a.totalCustomers}</div>
              <div style="color: #666;">Total Customers</div>
            </div>
            <div style="text-align: center; padding: 15px; background: var(--bg-color); border-radius: 8px;">
              <div style="font-size: 2rem; font-weight: 600; color: var(--primary-color);">${a.activeCards}</div>
              <div style="color: #666;">Active Cards</div>
            </div>
            <div style="text-align: center; padding: 15px; background: var(--bg-color); border-radius: 8px;">
              <div style="font-size: 2rem; font-weight: 600; color: var(--secondary-color);">${a.totalStampsIssued}</div>
              <div style="color: #666;">Stamps Issued</div>
            </div>
            <div style="text-align: center; padding: 15px; background: var(--bg-color); border-radius: 8px;">
              <div style="font-size: 2rem; font-weight: 600; color: var(--secondary-color);">${a.totalRedemptions}</div>
              <div style="color: #666;">Redemptions</div>
            </div>
          </div>
        </div>

        <div class="card">
          <h2 class="card-title">Cards & Rewards</h2>
          <div style="margin-top: 15px;">
            <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--border-color);">
              <span>Completed Cards</span>
              <strong>${a.completedCards}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--border-color);">
              <span>Redeemed Cards</span>
              <strong>${a.redeemedCards}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--border-color);">
              <span>Available Rewards</span>
              <strong>${a.availableRewards}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 10px 0;">
              <span>Redemption Rate</span>
              <strong>${a.redemptionRate}%</strong>
            </div>
          </div>
        </div>

        <div class="card">
          <h2 class="card-title">Revenue</h2>
          <div style="text-align: center; padding: 20px;">
            <div style="font-size: 2.5rem; font-weight: 600; color: var(--primary-color);">
              $${a.totalRevenue.toFixed(2)}
            </div>
            <div style="color: #666; margin-top: 10px;">Total from stamp transactions</div>
          </div>
        </div>
      `;
    }
  } catch (error) {
    analyticsContent.innerHTML = `<div class="message message-error">Error loading analytics: ${error.message}</div>`;
  }
}

/**
 * Handle create card
 */
async function handleCreateCard(e) {
  e.preventDefault();

  const cardName = document.getElementById('card-name').value;
  const stampsRequired = document.getElementById('stamps-required').value;
  const rewardDescription = document.getElementById('reward-description').value;
  const ruleType = document.getElementById('rule-type').value;
  const ruleValue = document.getElementById('rule-value').value;

  try {
    const response = await StaffAPI.createCard(cardName, stampsRequired, rewardDescription, ruleType, ruleValue);

    if (response.success) {
      alert('Stamp card created successfully!');
      document.getElementById('cardSettingsForm').reset();
    }
  } catch (error) {
    alert(error.message || 'Failed to create card');
  }
}

/**
 * Toggle rule value field
 */
function toggleRuleValue() {
  const ruleType = document.getElementById('rule-type').value;
  const ruleValueGroup = document.getElementById('rule-value-group');

  if (ruleType === 'amount') {
    ruleValueGroup.style.display = 'block';
  } else {
    ruleValueGroup.style.display = 'none';
  }
}
