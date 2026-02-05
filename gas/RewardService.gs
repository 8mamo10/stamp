/**
 * Reward generation and redemption logic
 */

/**
 * Create a reward when card is completed
 */
function createReward(customerCard, customerId, storeId) {
  const rewardId = generateUUID();
  const rewardCode = generateRewardCode();

  const reward = {
    rewardId: rewardId,
    customerCardId: customerCard.customerCardId,
    customerId: customerId,
    storeId: storeId,
    rewardCode: rewardCode,
    status: 'available',
    createdAt: getCurrentTimestamp(),
    redeemedAt: ''
  };

  insertRow('Rewards', reward);
  return reward;
}

/**
 * Generate unique reward code
 */
function generateRewardCode() {
  // Generate a 8-character alphanumeric code
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Get customer rewards
 */
function getCustomerRewards(customerId) {
  const rewards = findRows('Rewards', { customerId: customerId });

  const result = rewards.map(reward => {
    const customerCard = findRow('CustomerCards', { customerCardId: reward.customerCardId });
    const stampCard = customerCard ? findRow('StampCards', { cardId: customerCard.cardId }) : null;
    const store = findRow('Stores', { storeId: reward.storeId });

    return {
      rewardId: reward.rewardId,
      storeName: store ? store.storeName : 'Unknown',
      rewardDescription: stampCard ? stampCard.rewardDescription : 'Reward',
      rewardCode: reward.rewardCode,
      status: reward.status,
      createdAt: reward.createdAt,
      redeemedAt: reward.redeemedAt
    };
  });

  return { success: true, rewards: result };
}

/**
 * Customer marks reward as ready for redemption (shows QR to staff)
 * This just returns the reward info for display
 */
function markRewardForRedemption(data, customer) {
  const { rewardId } = data;

  const reward = findRow('Rewards', { rewardId: rewardId });
  if (!reward) {
    throw new Error('Reward not found');
  }

  if (reward.customerId !== customer.userId) {
    throw new Error('Unauthorized');
  }

  if (reward.status === 'redeemed') {
    throw new Error('Reward already redeemed');
  }

  const customerCard = findRow('CustomerCards', { customerCardId: reward.customerCardId });
  const stampCard = customerCard ? findRow('StampCards', { cardId: customerCard.cardId }) : null;
  const store = findRow('Stores', { storeId: reward.storeId });

  return {
    success: true,
    reward: {
      rewardId: reward.rewardId,
      rewardCode: reward.rewardCode,
      storeName: store ? store.storeName : 'Unknown',
      rewardDescription: stampCard ? stampCard.rewardDescription : 'Reward',
      status: reward.status
    }
  };
}

/**
 * Staff confirms reward redemption
 */
function confirmRewardRedemption(data, staffUser) {
  const { rewardCode } = data;

  // Find reward by code
  const reward = findRow('Rewards', { rewardCode: rewardCode, storeId: staffUser.storeId });
  if (!reward) {
    throw new Error('Invalid reward code');
  }

  if (reward.status === 'redeemed') {
    throw new Error('Reward already redeemed');
  }

  // Update reward status
  updateRow('Rewards',
    { rewardId: reward.rewardId },
    {
      status: 'redeemed',
      redeemedAt: getCurrentTimestamp()
    }
  );

  // Update customer card status
  updateRow('CustomerCards',
    { customerCardId: reward.customerCardId },
    { status: 'redeemed' }
  );

  // Record transaction
  const transactionId = generateUUID();
  insertRow('Transactions', {
    transactionId: transactionId,
    customerCardId: reward.customerCardId,
    customerId: reward.customerId,
    storeId: staffUser.storeId,
    staffId: staffUser.userId,
    type: 'redemption',
    purchaseAmount: 0,
    timestamp: getCurrentTimestamp()
  });

  const customerCard = findRow('CustomerCards', { customerCardId: reward.customerCardId });
  const stampCard = customerCard ? findRow('StampCards', { cardId: customerCard.cardId }) : null;

  return {
    success: true,
    message: 'Reward redeemed successfully',
    rewardDescription: stampCard ? stampCard.rewardDescription : 'Reward'
  };
}

/**
 * Get reward by code (for staff verification)
 */
function getRewardByCode(rewardCode, storeId) {
  const reward = findRow('Rewards', { rewardCode: rewardCode, storeId: storeId });
  if (!reward) {
    return { success: false, message: 'Invalid reward code' };
  }

  const customerCard = findRow('CustomerCards', { customerCardId: reward.customerCardId });
  const stampCard = customerCard ? findRow('StampCards', { cardId: customerCard.cardId }) : null;
  const customer = findRow('Users', { userId: reward.customerId });

  return {
    success: true,
    reward: {
      rewardId: reward.rewardId,
      rewardCode: reward.rewardCode,
      customerName: customer ? (customer.email || customer.phone) : 'Unknown',
      rewardDescription: stampCard ? stampCard.rewardDescription : 'Reward',
      status: reward.status,
      createdAt: reward.createdAt
    }
  };
}
