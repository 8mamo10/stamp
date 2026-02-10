/**
 * Main entry point for web app
 * Handles all HTTP requests (GET and POST)
 */

// Configuration - Set via Script Properties
// Go to Project Settings (gear icon) → Script Properties → Add property
// Key: SPREADSHEET_ID, Value: your_spreadsheet_id
function getSpreadsheetId() {
  const scriptProperties = PropertiesService.getScriptProperties();
  const spreadsheetId = scriptProperties.getProperty('SPREADSHEET_ID');

  if (!spreadsheetId) {
    throw new Error('SPREADSHEET_ID not configured. Go to Project Settings → Script Properties and add SPREADSHEET_ID');
  }

  return spreadsheetId;
}

const SPREADSHEET_ID = getSpreadsheetId();

/**
 * Handle GET requests
 */
function doGet(e) {
  const path = e.parameter.path;
  const token = e.parameter.token;
  const page = e.parameter.page;

  // Simple test endpoint
  if (path === "test") {
    return jsonResponse({ success: true, message: "API is working!", timestamp: new Date().toISOString() });
  }

  // Serve HTML pages
  if (!path || page) {
    const htmlPage = page || "index";
    try {
      return HtmlService.createTemplateFromFile(htmlPage)
        .evaluate()
        .setTitle("Stamp Card")
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    } catch (error) {
      Logger.log("Error loading HTML: " + error.message);
      return HtmlService.createHtmlOutput("<h1>Page not found</h1>");
    }
  }

  // Verify authentication for protected endpoints
  const user = verifyToken(token);

  try {
    switch (path) {
      case "customer/cards":
        if (!user || user.role !== "customer") {
          return jsonResponse({ error: "Unauthorized" }, 401);
        }
        return jsonResponse(getCustomerCards(user.userId));

      case "customer/rewards":
        if (!user || user.role !== "customer") {
          return jsonResponse({ error: "Unauthorized" }, 401);
        }
        return jsonResponse(getCustomerRewards(user.userId));

      case "store/analytics":
        if (!user || (user.role !== "staff" && user.role !== "admin")) {
          return jsonResponse({ error: "Unauthorized" }, 401);
        }
        return jsonResponse(getStoreAnalytics(user.storeId));

      case "admin/stores":
        if (!user || user.role !== "admin") {
          return jsonResponse({ error: "Unauthorized" }, 401);
        }
        return jsonResponse(getAllStores());

      case "admin/analytics":
        if (!user || user.role !== "admin") {
          return jsonResponse({ error: "Unauthorized" }, 401);
        }
        return jsonResponse(getSystemAnalytics());

      default:
        return jsonResponse({ error: "Not found" }, 404);
    }
  } catch (error) {
    Logger.log("Error in doGet: " + error.message);
    return jsonResponse({ error: error.message }, 500);
  }
}

/**
 * Handle POST requests
 */
function doPost(e) {
  const path = e.parameter.path;

  // Parse request data with error handling
  let data;
  try {
    data = e.postData && e.postData.contents
      ? JSON.parse(e.postData.contents)
      : {};
  } catch (parseError) {
    Logger.log("Error parsing POST data: " + parseError.message);
    return jsonResponse({ success: false, error: "Invalid JSON data" }, 400);
  }

  const token = data.token || e.parameter.token;

  try {
    // Test POST endpoint
    if (path === "test") {
      Logger.log("Test POST received with data: " + JSON.stringify(data));
      return jsonResponse({ success: true, message: "POST is working!", data: data });
    }

    switch (path) {
      case "auth/register":
        return jsonResponse(registerUser(data));

      case "auth/login":
        Logger.log("Login attempt for: " + (data.email || data.phone));
        const loginResult = login(data);
        Logger.log("Login successful for: " + loginResult.user.email);
        return jsonResponse(loginResult);

      case "staff/issueStamp":
        const staff = verifyToken(token);
        if (!staff || staff.role !== "staff") {
          return jsonResponse({ error: "Unauthorized" }, 401);
        }
        return jsonResponse(issueStamp(data, staff));

      case "staff/createCard":
        const staffUser = verifyToken(token);
        if (!staffUser || staffUser.role !== "staff") {
          return jsonResponse({ error: "Unauthorized" }, 401);
        }
        return jsonResponse(createStampCard(data, staffUser));

      case "customer/redeemReward":
        const customer = verifyToken(token);
        if (!customer || customer.role !== "customer") {
          return jsonResponse({ error: "Unauthorized" }, 401);
        }
        return jsonResponse(markRewardForRedemption(data, customer));

      case "staff/confirmRedemption":
        const confirmStaff = verifyToken(token);
        if (!confirmStaff || confirmStaff.role !== "staff") {
          return jsonResponse({ error: "Unauthorized" }, 401);
        }
        return jsonResponse(confirmRewardRedemption(data, confirmStaff));

      case "admin/createStore":
        const admin = verifyToken(token);
        if (!admin || admin.role !== "admin") {
          return jsonResponse({ error: "Unauthorized" }, 401);
        }
        return jsonResponse(createStore(data, admin));

      case "admin/updateStore":
        const updateAdmin = verifyToken(token);
        if (!updateAdmin || updateAdmin.role !== "admin") {
          return jsonResponse({ error: "Unauthorized" }, 401);
        }
        return jsonResponse(updateStore(data, updateAdmin));

      default:
        return jsonResponse({ error: "Not found" }, 404);
    }
  } catch (error) {
    Logger.log("Error in doPost: " + error.message);
    return jsonResponse({ error: error.message }, 500);
  }
}

/**
 * Helper function to return JSON response
 */
function jsonResponse(data, statusCode = 200) {
  const output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

/**
 * Generate UUID
 */
function generateUUID() {
  return Utilities.getUuid();
}

/**
 * Get current timestamp in ISO format
 */
function getCurrentTimestamp() {
  return new Date().toISOString();
}

/**
 * Include other HTML files (for templating)
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Get the web app URL for API calls
 * This function is called from the HTML template to inject the correct URL
 */
function getWebAppUrl() {
  return ScriptApp.getService().getUrl();
}
