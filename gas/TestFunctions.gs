/**
 * Test functions for debugging
 * Run these from the GAS editor to verify setup
 */

/**
 * Test 1: Check if spreadsheet connection works
 */
function testSpreadsheetConnection() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    Logger.log('✓ Spreadsheet connected: ' + ss.getName());

    const sheets = ss.getSheets();
    Logger.log('✓ Found ' + sheets.length + ' sheets');

    sheets.forEach(sheet => {
      Logger.log('  - ' + sheet.getName());
    });

    return { success: true, message: 'Spreadsheet connection OK' };
  } catch (error) {
    Logger.log('✗ Error: ' + error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Test 2: Check required sheets exist
 */
function testRequiredSheets() {
  const requiredSheets = ['Users', 'Stores', 'StampCards', 'CustomerCards', 'Transactions', 'Rewards'];
  const results = [];

  requiredSheets.forEach(sheetName => {
    try {
      const sheet = getSheet(sheetName);
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      Logger.log('✓ Sheet "' + sheetName + '" exists with headers: ' + headers.join(', '));
      results.push({ sheet: sheetName, status: 'OK', headers: headers });
    } catch (error) {
      Logger.log('✗ Sheet "' + sheetName + '" error: ' + error.message);
      results.push({ sheet: sheetName, status: 'ERROR', error: error.message });
    }
  });

  return results;
}

/**
 * Test 3: Create admin user
 */
function createAdminUser() {
  try {
    const admin = {
      email: 'admin@example.com',
      phone: '',
      password: 'admin123',
      role: 'admin'
    };

    // Check if admin already exists
    const existingUser = findRow('Users', { email: admin.email });
    if (existingUser) {
      Logger.log('⚠ Admin user already exists');
      return { success: false, message: 'Admin already exists', user: existingUser };
    }

    const result = registerUser(admin);
    Logger.log('✓ Admin created successfully');
    Logger.log('  Email: admin@example.com');
    Logger.log('  Password: admin123');
    return result;
  } catch (error) {
    Logger.log('✗ Error creating admin: ' + error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Test 4: Test login function
 */
function testAdminLogin() {
  try {
    Logger.log('Testing login with:');
    Logger.log('  Email: admin@example.com');
    Logger.log('  Password: admin123');

    // First check if user exists
    const user = findRow('Users', { email: 'admin@example.com' });
    Logger.log('User found: ' + (user ? 'Yes' : 'No'));
    if (user) {
      Logger.log('  User email: ' + user.email);
      Logger.log('  User role: ' + user.role);
      Logger.log('  User passwordHash length: ' + user.passwordHash.length);

      const testHash = hashPassword('admin123');
      Logger.log('  Computed hash: ' + testHash);
      Logger.log('  Stored hash: ' + user.passwordHash);
      Logger.log('  Match: ' + (testHash === user.passwordHash));
    }

    const result = login({
      email: 'admin@example.com',
      password: 'admin123'
    });

    Logger.log('✓ Login successful');
    Logger.log('  Token: ' + result.token);
    Logger.log('  User: ' + JSON.stringify(result.user));
    return result;
  } catch (error) {
    Logger.log('✗ Login failed: ' + error.message);
    Logger.log('  Stack: ' + error.stack);
    return { success: false, error: error.message };
  }
}

/**
 * Test 5: List all users
 */
function listAllUsers() {
  try {
    const users = getSheetData('Users');
    Logger.log('✓ Found ' + users.length + ' users:');
    users.forEach(user => {
      Logger.log('  - ' + user.email + ' | ' + user.role + ' | ID: ' + user.userId);
    });
    return users;
  } catch (error) {
    Logger.log('✗ Error: ' + error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Test 6: Debug password hashing
 */
function debugPasswordHash() {
  const testPassword = 'admin123';
  const hash = hashPassword(testPassword);
  Logger.log('Password: ' + testPassword);
  Logger.log('Hash: ' + hash);

  // Check what's stored in the database
  const user = findRow('Users', { email: 'admin@example.com' });
  if (user) {
    Logger.log('Stored hash: ' + user.passwordHash);
    Logger.log('Hashes match: ' + (hash === user.passwordHash));
  } else {
    Logger.log('No admin user found');
  }

  return { computed: hash, stored: user ? user.passwordHash : null };
}

/**
 * Test 7: Fix admin password (if hash mismatch)
 */
function fixAdminPassword() {
  try {
    const user = findRow('Users', { email: 'admin@example.com' });
    if (!user) {
      Logger.log('✗ No admin user found. Run createAdminUser first.');
      return { success: false, error: 'Admin user not found' };
    }

    const newPasswordHash = hashPassword('admin123');
    updateRow('Users', { email: 'admin@example.com' }, { passwordHash: newPasswordHash });

    Logger.log('✓ Admin password reset to: admin123');
    Logger.log('  New hash: ' + newPasswordHash);
    return { success: true, message: 'Password updated' };
  } catch (error) {
    Logger.log('✗ Error: ' + error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Test 8: Set custom admin password
 * EDIT THE PASSWORD BELOW, then run this function
 */
function setAdminPassword() {
  // ⚠️ CHANGE THIS TO YOUR DESIRED PASSWORD
  const NEW_PASSWORD = 'admin123';  // <-- Change this

  try {
    const user = findRow('Users', { email: 'admin@example.com' });
    if (!user) {
      Logger.log('✗ No admin user found. Run createAdminUser first.');
      return { success: false, error: 'Admin user not found' };
    }

    const newPasswordHash = hashPassword(NEW_PASSWORD);
    updateRow('Users', { email: 'admin@example.com' }, { passwordHash: newPasswordHash });

    Logger.log('✓ Admin password updated successfully');
    Logger.log('  Email: admin@example.com');
    Logger.log('  Password: ' + NEW_PASSWORD);
    Logger.log('  Hash: ' + newPasswordHash);

    // Test the login
    Logger.log('\nTesting login with new password...');
    const loginResult = login({
      email: 'admin@example.com',
      password: NEW_PASSWORD
    });

    if (loginResult.success) {
      Logger.log('✓ Login test successful!');
    }

    return { success: true, message: 'Password updated and tested' };
  } catch (error) {
    Logger.log('✗ Error: ' + error.message);
    return { success: false, error: error.message };
  }
}
