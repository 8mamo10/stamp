/**
 * Client-facing API functions
 * These functions are called via google.script.run from the frontend
 */

/**
 * Authentication - Register
 */
function clientRegister(email, phone, password, role) {
  try {
    return registerUser({ email, phone, password, role });
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Authentication - Login
 */
function clientLogin(email, phone, password) {
  try {
    return login({ email, phone, password });
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Customer - Get Cards
 */
function clientGetCustomerCards(token) {
  try {
    const user = verifyToken(token);
    if (!user || user.role !== 'customer') {
      return { success: false, error: 'Unauthorized' };
    }
    return getCustomerCards(user.userId);
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Customer - Get Rewards
 */
function clientGetCustomerRewards(token) {
  try {
    const user = verifyToken(token);
    if (!user || user.role !== 'customer') {
      return { success: false, error: 'Unauthorized' };
    }
    return getCustomerRewards(user.userId);
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Customer - Redeem Reward
 */
function clientRedeemReward(token, rewardId) {
  try {
    const user = verifyToken(token);
    if (!user || user.role !== 'customer') {
      return { success: false, error: 'Unauthorized' };
    }
    return markRewardForRedemption({ rewardId }, user);
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Staff - Issue Stamp
 */
function clientIssueStamp(token, customerIdentifier, purchaseAmount) {
  try {
    const staff = verifyToken(token);
    if (!staff || staff.role !== 'staff') {
      return { success: false, error: 'Unauthorized' };
    }
    return issueStamp({ customerIdentifier, purchaseAmount }, staff);
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Staff - Create Card
 */
function clientCreateCard(token, cardName, stampsRequired, rewardDescription, ruleType, ruleValue) {
  try {
    const staff = verifyToken(token);
    if (!staff || staff.role !== 'staff') {
      return { success: false, error: 'Unauthorized' };
    }
    return createStampCard({ cardName, stampsRequired, rewardDescription, ruleType, ruleValue }, staff);
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Staff - Confirm Redemption
 */
function clientConfirmRedemption(token, rewardCode) {
  try {
    const staff = verifyToken(token);
    if (!staff || staff.role !== 'staff') {
      return { success: false, error: 'Unauthorized' };
    }
    return confirmRewardRedemption({ rewardCode }, staff);
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Staff/Admin - Get Store Analytics
 */
function clientGetStoreAnalytics(token) {
  try {
    const user = verifyToken(token);
    if (!user || (user.role !== 'staff' && user.role !== 'admin')) {
      return { success: false, error: 'Unauthorized' };
    }
    return getStoreAnalytics(user.storeId);
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Admin - Create Store
 */
function clientCreateStore(token, storeName, ownerEmail, ownerPhone, ownerPassword) {
  try {
    const admin = verifyToken(token);
    if (!admin || admin.role !== 'admin') {
      return { success: false, error: 'Unauthorized' };
    }
    return createStore({ storeName, ownerEmail, ownerPhone, ownerPassword }, admin);
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Admin - Update Store
 */
function clientUpdateStore(token, storeId, updates) {
  try {
    const admin = verifyToken(token);
    if (!admin || admin.role !== 'admin') {
      return { success: false, error: 'Unauthorized' };
    }
    return updateStore({ storeId, updates }, admin);
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Admin - Get All Stores
 */
function clientGetAllStores(token) {
  try {
    const admin = verifyToken(token);
    if (!admin || admin.role !== 'admin') {
      return { success: false, error: 'Unauthorized' };
    }
    return getAllStores();
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Admin - Get System Analytics
 */
function clientGetSystemAnalytics(token) {
  try {
    const admin = verifyToken(token);
    if (!admin || admin.role !== 'admin') {
      return { success: false, error: 'Unauthorized' };
    }
    return getSystemAnalytics();
  } catch (error) {
    return { success: false, error: error.message };
  }
}
