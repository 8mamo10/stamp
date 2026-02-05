/**
 * Authentication and user management
 */

/**
 * Hash password using SHA-256
 */
function hashPassword(password) {
  const rawHash = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    password,
    Utilities.Charset.UTF_8
  );
  return rawHash.map(byte => {
    const v = (byte < 0) ? 256 + byte : byte;
    return ('0' + v.toString(16)).slice(-2);
  }).join('');
}

/**
 * Generate authentication token
 */
function generateToken(user) {
  const tokenData = {
    userId: user.userId,
    email: user.email,
    role: user.role,
    storeId: user.storeId,
    timestamp: new Date().getTime()
  };
  return Utilities.base64Encode(JSON.stringify(tokenData));
}

/**
 * Verify authentication token
 */
function verifyToken(token) {
  if (!token) return null;

  try {
    const decoded = Utilities.newBlob(Utilities.base64Decode(token)).getDataAsString();
    const tokenData = JSON.parse(decoded);

    // Check if token is not too old (24 hours)
    const tokenAge = new Date().getTime() - tokenData.timestamp;
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    if (tokenAge > maxAge) {
      return null;
    }

    return tokenData;
  } catch (error) {
    Logger.log('Token verification error: ' + error.message);
    return null;
  }
}

/**
 * Register new user
 */
function registerUser(data) {
  const { email, phone, password, role } = data;

  // Validate input
  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }

  if (!email && !phone) {
    throw new Error('Email or phone number is required');
  }

  // Check if user already exists
  const existingUser = email
    ? findRow('Users', { email: email })
    : findRow('Users', { phone: phone });

  if (existingUser) {
    throw new Error('User already exists');
  }

  // Create user
  const userId = generateUUID();
  const passwordHash = hashPassword(password);

  const user = {
    userId: userId,
    email: email || '',
    phone: phone || '',
    passwordHash: passwordHash,
    role: role || 'customer',
    storeId: '',
    createdAt: getCurrentTimestamp()
  };

  insertRow('Users', user);

  // Generate token
  const token = generateToken(user);

  return {
    success: true,
    token: token,
    user: {
      userId: user.userId,
      email: user.email,
      phone: user.phone,
      role: user.role
    }
  };
}

/**
 * Login user
 */
function login(data) {
  const { email, phone, password } = data;

  if (!password) {
    throw new Error('Password is required');
  }

  if (!email && !phone) {
    throw new Error('Email or phone number is required');
  }

  // Find user
  const user = email
    ? findRow('Users', { email: email })
    : findRow('Users', { phone: phone });

  if (!user) {
    throw new Error('Invalid credentials');
  }

  // Verify password
  const passwordHash = hashPassword(password);
  if (passwordHash !== user.passwordHash) {
    throw new Error('Invalid credentials');
  }

  // Generate token
  const token = generateToken(user);

  return {
    success: true,
    token: token,
    user: {
      userId: user.userId,
      email: user.email,
      phone: user.phone,
      role: user.role,
      storeId: user.storeId
    }
  };
}

/**
 * Create staff user for a store
 */
function createStaffUser(email, phone, password, storeId, createdBy) {
  // Only admins can create staff
  if (createdBy.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  const userId = generateUUID();
  const passwordHash = hashPassword(password);

  const user = {
    userId: userId,
    email: email || '',
    phone: phone || '',
    passwordHash: passwordHash,
    role: 'staff',
    storeId: storeId,
    createdAt: getCurrentTimestamp()
  };

  insertRow('Users', user);

  return {
    success: true,
    user: {
      userId: user.userId,
      email: user.email,
      phone: user.phone,
      role: user.role,
      storeId: user.storeId
    }
  };
}

/**
 * Get user by ID or email/phone
 */
function getUserByIdentifier(identifier) {
  // Try to find by userId first
  let user = findRow('Users', { userId: identifier });
  if (user) return user;

  // Try email
  user = findRow('Users', { email: identifier });
  if (user) return user;

  // Try phone
  user = findRow('Users', { phone: identifier });
  if (user) return user;

  return null;
}
