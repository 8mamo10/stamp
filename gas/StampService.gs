/**
 * Stamp card and stamp issuance logic
 */

/**
 * Create a new stamp card template for a store
 */
function createStampCard(data, staffUser) {
  const { cardName, stampsRequired, rewardDescription, ruleType, ruleValue } = data;

  // Validate input
  if (!cardName || !stampsRequired || !rewardDescription) {
    throw new Error('Missing required fields');
  }

  if (ruleType !== 'visit' && ruleType !== 'amount') {
    throw new Error('Invalid rule type. Must be "visit" or "amount"');
  }

  const cardId = generateUUID();
  const card = {
    cardId: cardId,
    storeId: staffUser.storeId,
    cardName: cardName,
    stampsRequired: parseInt(stampsRequired),
    rewardDescription: rewardDescription,
    ruleType: ruleType,
    ruleValue: parseFloat(ruleValue) || 0,
    createdAt: getCurrentTimestamp(),
    isActive: true
  };

  insertRow('StampCards', card);

  return {
    success: true,
    card: card
  };
}

/**
 * Get active stamp card for a store
 */
function getActiveStampCard(storeId) {
  const cards = findRows('StampCards', { storeId: storeId, isActive: 'TRUE' });
  return cards.length > 0 ? cards[0] : null;
}

/**
 * Get or create customer card for a store
 */
function getOrCreateCustomerCard(customerId, storeId) {
  // Check if customer already has an active card for this store
  let customerCard = findRow('CustomerCards', {
    customerId: customerId,
    storeId: storeId,
    status: 'active'
  });

  if (customerCard) {
    return customerCard;
  }

  // Get active stamp card template
  const stampCard = getActiveStampCard(storeId);
  if (!stampCard) {
    throw new Error('No active stamp card found for this store');
  }

  // Create new customer card
  const customerCardId = generateUUID();
  customerCard = {
    customerCardId: customerCardId,
    customerId: customerId,
    cardId: stampCard.cardId,
    storeId: storeId,
    currentStamps: 0,
    status: 'active',
    createdAt: getCurrentTimestamp(),
    completedAt: ''
  };

  insertRow('CustomerCards', customerCard);
  return customerCard;
}

/**
 * Issue a stamp to a customer
 */
function issueStamp(data, staffUser) {
  const { customerIdentifier, purchaseAmount } = data;

  // Find customer
  const customer = getUserByIdentifier(customerIdentifier);
  if (!customer) {
    throw new Error('Customer not found');
  }

  if (customer.role !== 'customer') {
    throw new Error('User is not a customer');
  }

  // Get or create customer card
  const customerCard = getOrCreateCustomerCard(customer.userId, staffUser.storeId);

  // Get stamp card template
  const stampCard = findRow('StampCards', { cardId: customerCard.cardId });
  if (!stampCard) {
    throw new Error('Stamp card template not found');
  }

  // Check if purchase meets requirements
  if (stampCard.ruleType === 'amount') {
    const amount = parseFloat(purchaseAmount) || 0;
    if (amount < parseFloat(stampCard.ruleValue)) {
      throw new Error(`Purchase amount must be at least ${stampCard.ruleValue}`);
    }
  }

  // Add stamp
  const newStampCount = parseInt(customerCard.currentStamps) + 1;
  const isCompleted = newStampCount >= parseInt(stampCard.stampsRequired);

  // Update customer card
  updateRow('CustomerCards',
    { customerCardId: customerCard.customerCardId },
    {
      currentStamps: newStampCount,
      status: isCompleted ? 'completed' : 'active',
      completedAt: isCompleted ? getCurrentTimestamp() : ''
    }
  );

  // Record transaction
  const transactionId = generateUUID();
  insertRow('Transactions', {
    transactionId: transactionId,
    customerCardId: customerCard.customerCardId,
    customerId: customer.userId,
    storeId: staffUser.storeId,
    staffId: staffUser.userId,
    type: 'stamp',
    purchaseAmount: parseFloat(purchaseAmount) || 0,
    timestamp: getCurrentTimestamp()
  });

  // If card is completed, create reward
  if (isCompleted) {
    createReward(customerCard, customer.userId, staffUser.storeId);
  }

  return {
    success: true,
    stampAdded: true,
    currentStamps: newStampCount,
    totalRequired: parseInt(stampCard.stampsRequired),
    completed: isCompleted,
    message: isCompleted
      ? 'Card completed! Reward is now available.'
      : `Stamp added! ${newStampCount}/${stampCard.stampsRequired} stamps collected.`
  };
}

/**
 * Get customer cards
 */
function getCustomerCards(customerId) {
  const customerCards = findRows('CustomerCards', { customerId: customerId });

  const result = customerCards.map(customerCard => {
    const stampCard = findRow('StampCards', { cardId: customerCard.cardId });
    const store = findRow('Stores', { storeId: customerCard.storeId });

    return {
      customerCardId: customerCard.customerCardId,
      storeName: store ? store.storeName : 'Unknown',
      cardName: stampCard ? stampCard.cardName : 'Unknown',
      currentStamps: customerCard.currentStamps,
      stampsRequired: stampCard ? stampCard.stampsRequired : 0,
      rewardDescription: stampCard ? stampCard.rewardDescription : '',
      status: customerCard.status,
      createdAt: customerCard.createdAt,
      completedAt: customerCard.completedAt
    };
  });

  return { success: true, cards: result };
}

/**
 * Update stamp card template
 */
function updateStampCard(cardId, updates, staffUser) {
  const card = findRow('StampCards', { cardId: cardId });
  if (!card) {
    throw new Error('Card not found');
  }

  if (card.storeId !== staffUser.storeId && staffUser.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  updateRow('StampCards', { cardId: cardId }, updates);

  return { success: true, message: 'Card updated successfully' };
}
