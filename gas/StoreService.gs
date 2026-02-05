/**
 * Store management and analytics
 */

/**
 * Create a new store
 */
function createStore(data, admin) {
  const { storeName, ownerEmail, ownerPhone, ownerPassword } = data;

  if (!storeName) {
    throw new Error('Store name is required');
  }

  const storeId = generateUUID();
  const store = {
    storeId: storeId,
    storeName: storeName,
    ownerUserId: '',
    createdAt: getCurrentTimestamp(),
    isActive: true
  };

  insertRow('Stores', store);

  // Create owner/staff user if credentials provided
  if ((ownerEmail || ownerPhone) && ownerPassword) {
    const ownerUserId = generateUUID();
    const passwordHash = hashPassword(ownerPassword);

    const owner = {
      userId: ownerUserId,
      email: ownerEmail || '',
      phone: ownerPhone || '',
      passwordHash: passwordHash,
      role: 'staff',
      storeId: storeId,
      createdAt: getCurrentTimestamp()
    };

    insertRow('Users', owner);

    // Update store with owner ID
    updateRow('Stores', { storeId: storeId }, { ownerUserId: ownerUserId });
  }

  return {
    success: true,
    store: {
      storeId: storeId,
      storeName: storeName
    }
  };
}

/**
 * Update store
 */
function updateStore(data, admin) {
  const { storeId, updates } = data;

  const store = findRow('Stores', { storeId: storeId });
  if (!store) {
    throw new Error('Store not found');
  }

  updateRow('Stores', { storeId: storeId }, updates);

  return { success: true, message: 'Store updated successfully' };
}

/**
 * Get all stores
 */
function getAllStores() {
  const stores = getSheetData('Stores');

  const result = stores.map(store => {
    const owner = store.ownerUserId ? findRow('Users', { userId: store.ownerUserId }) : null;
    const activeCards = countRows('CustomerCards', { storeId: store.storeId, status: 'active' });
    const completedCards = countRows('CustomerCards', { storeId: store.storeId, status: 'completed' });

    return {
      storeId: store.storeId,
      storeName: store.storeName,
      ownerEmail: owner ? owner.email : '',
      ownerPhone: owner ? owner.phone : '',
      activeCards: activeCards,
      completedCards: completedCards,
      isActive: store.isActive,
      createdAt: store.createdAt
    };
  });

  return { success: true, stores: result };
}

/**
 * Get store analytics
 */
function getStoreAnalytics(storeId) {
  // Get all customer cards for this store
  const allCards = findRows('CustomerCards', { storeId: storeId });
  const activeCards = allCards.filter(c => c.status === 'active').length;
  const completedCards = allCards.filter(c => c.status === 'completed').length;
  const redeemedCards = allCards.filter(c => c.status === 'redeemed').length;

  // Get transactions
  const allTransactions = findRows('Transactions', { storeId: storeId });
  const stampTransactions = allTransactions.filter(t => t.type === 'stamp');
  const redemptionTransactions = allTransactions.filter(t => t.type === 'redemption');

  // Calculate total revenue (from purchase amounts)
  const totalRevenue = stampTransactions.reduce((sum, t) => {
    return sum + (parseFloat(t.purchaseAmount) || 0);
  }, 0);

  // Get unique customers
  const uniqueCustomers = new Set(allCards.map(c => c.customerId)).size;

  // Get rewards
  const rewards = findRows('Rewards', { storeId: storeId });
  const availableRewards = rewards.filter(r => r.status === 'available').length;
  const redeemedRewards = rewards.filter(r => r.status === 'redeemed').length;

  // Recent transactions (last 10)
  const recentTransactions = allTransactions
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 10)
    .map(t => {
      const customer = findRow('Users', { userId: t.customerId });
      const staff = findRow('Users', { userId: t.staffId });
      return {
        type: t.type,
        customerName: customer ? (customer.email || customer.phone) : 'Unknown',
        staffName: staff ? (staff.email || staff.phone) : 'Unknown',
        purchaseAmount: t.purchaseAmount,
        timestamp: t.timestamp
      };
    });

  return {
    success: true,
    analytics: {
      totalCustomers: uniqueCustomers,
      activeCards: activeCards,
      completedCards: completedCards,
      redeemedCards: redeemedCards,
      totalStampsIssued: stampTransactions.length,
      totalRedemptions: redemptionTransactions.length,
      availableRewards: availableRewards,
      redeemedRewards: redeemedRewards,
      totalRevenue: totalRevenue,
      redemptionRate: completedCards > 0 ? ((redeemedCards / (completedCards + redeemedCards)) * 100).toFixed(1) : 0,
      recentTransactions: recentTransactions
    }
  };
}

/**
 * Get system-wide analytics (admin only)
 */
function getSystemAnalytics() {
  const allStores = getSheetData('Stores');
  const allCustomers = findRows('Users', { role: 'customer' });
  const allCards = getSheetData('CustomerCards');
  const allTransactions = getSheetData('Transactions');
  const allRewards = getSheetData('Rewards');

  const activeStores = allStores.filter(s => s.isActive === 'TRUE').length;
  const totalStamps = allTransactions.filter(t => t.type === 'stamp').length;
  const totalRedemptions = allTransactions.filter(t => t.type === 'redemption').length;

  return {
    success: true,
    analytics: {
      totalStores: allStores.length,
      activeStores: activeStores,
      totalCustomers: allCustomers.length,
      totalCards: allCards.length,
      totalStampsIssued: totalStamps,
      totalRedemptions: totalRedemptions,
      totalRewards: allRewards.length
    }
  };
}
