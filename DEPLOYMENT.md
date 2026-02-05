# Deployment Guide

This guide will help you deploy the Stamp Card system using Google Apps Script and Google Sheets.

## Prerequisites

- Google Account
- Basic familiarity with Google Sheets and Google Apps Script

## Step 1: Set Up Google Sheets Database

1. **Create a new Google Spreadsheet**
   - Go to [Google Sheets](https://sheets.google.com)
   - Create a new blank spreadsheet
   - Name it "Stamp Card Database"

2. **Create the required sheets** (tabs at the bottom)
   - Create 6 sheets with the following exact names:
     - `Users`
     - `Stores`
     - `StampCards`
     - `CustomerCards`
     - `Transactions`
     - `Rewards`

3. **Add column headers** to each sheet (see DATABASE_SCHEMA.md for details):

   **Users sheet:**
   ```
   userId | email | phone | passwordHash | role | storeId | createdAt
   ```

   **Stores sheet:**
   ```
   storeId | storeName | ownerUserId | createdAt | isActive
   ```

   **StampCards sheet:**
   ```
   cardId | storeId | cardName | stampsRequired | rewardDescription | ruleType | ruleValue | createdAt | isActive
   ```

   **CustomerCards sheet:**
   ```
   customerCardId | customerId | cardId | storeId | currentStamps | status | createdAt | completedAt
   ```

   **Transactions sheet:**
   ```
   transactionId | customerCardId | customerId | storeId | staffId | type | purchaseAmount | timestamp
   ```

   **Rewards sheet:**
   ```
   rewardId | customerCardId | customerId | storeId | rewardCode | status | createdAt | redeemedAt
   ```

4. **Get your Spreadsheet ID**
   - Look at the URL of your spreadsheet
   - Copy the ID from the URL: `https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit`

## Step 2: Deploy Google Apps Script Backend

1. **Create a new Apps Script project**
   - Go to [Google Apps Script](https://script.google.com)
   - Click "New Project"
   - Name it "Stamp Card API"

2. **Add the script files**
   - Delete the default `Code.gs` content
   - Copy the contents of each file from `/gas` folder:
     - `Code.gs`
     - `Auth.gs`
     - `Database.gs`
     - `StampService.gs`
     - `RewardService.gs`
     - `StoreService.gs`
   - Create a new script file for each (click the + next to Files)

3. **Update the Spreadsheet ID**
   - In `Code.gs`, find the line:
     ```javascript
     const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
     ```
   - Replace `YOUR_SPREADSHEET_ID_HERE` with your actual Spreadsheet ID from Step 1

4. **Deploy as Web App**
   - Click "Deploy" → "New deployment"
   - Click the gear icon next to "Select type" → "Web app"
   - Fill in the details:
     - Description: "Stamp Card API"
     - Execute as: "Me"
     - Who has access: "Anyone"
   - Click "Deploy"
   - Copy the Web App URL (you'll need this later)
   - Click "Authorize access" and grant permissions

## Step 3: Set Up Frontend

1. **Update API URL**
   - Open `/public/js/api.js`
   - Find the line:
     ```javascript
     const API_URL = 'YOUR_GAS_WEB_APP_URL_HERE';
     ```
   - Replace with your Web App URL from Step 2

2. **Create Icons for PWA** (optional)
   - Create two PNG icons:
     - `icon-192.png` (192x192 pixels)
     - `icon-512.png` (512x512 pixels)
   - Place them in `/public/` folder
   - You can use any logo or design for your stamp card app

3. **Host the Frontend**

   **Option A: GitHub Pages (Free)**
   - Create a new GitHub repository
   - Push the `/public` folder contents to the repository
   - Go to Settings → Pages
   - Select branch and `/root` folder
   - Save and get your GitHub Pages URL

   **Option B: Google Apps Script (Simple)**
   - In your Apps Script project, add HTML files
   - Copy contents from `/public/index.html`, etc.
   - Serve using `doGet()` function

   **Option C: Any Web Hosting**
   - Upload `/public` folder to your web host
   - Ensure HTTPS is enabled for PWA features

## Step 4: Create Admin Account

1. **Manually add admin user to Sheets**
   - Open your Google Spreadsheet
   - Go to the "Users" sheet
   - Add a new row with admin credentials:
     ```
     userId: [generate a UUID, e.g., using online UUID generator]
     email: admin@example.com
     phone: (leave empty or add phone)
     passwordHash: [see below for generating]
     role: admin
     storeId: (leave empty)
     createdAt: [current date in ISO format, e.g., 2024-01-21T10:00:00Z]
     ```

2. **Generate password hash**
   - In Apps Script, go to "Extensions" → "Apps Script"
   - In the script editor, click "Run" dropdown
   - Select function to create a temporary hash function:
     ```javascript
     function generateHash() {
       const password = 'your_admin_password';
       const hash = Utilities.computeDigest(
         Utilities.DigestAlgorithm.SHA_256,
         password,
         Utilities.Charset.UTF_8
       );
       const hashString = hash.map(byte => {
         const v = (byte < 0) ? 256 + byte : byte;
         return ('0' + v.toString(16)).slice(-2);
       }).join('');
       Logger.log(hashString);
     }
     ```
   - Run the function
   - View → Logs to see the hash
   - Copy the hash to the passwordHash column

## Step 5: Test the System

1. **Login to Admin Panel**
   - Open `admin.html` in your browser
   - Login with your admin credentials
   - You should see the admin dashboard

2. **Create a Test Store**
   - In admin panel, create a new store
   - Provide store name and staff credentials
   - Note the staff login details

3. **Login to Staff Portal**
   - Open `staff.html`
   - Login with staff credentials
   - Create a stamp card in Settings

4. **Register as Customer**
   - Open `index.html`
   - Register a new customer account
   - You should see your customer dashboard

5. **Test the Flow**
   - Customer: View your QR code
   - Staff: Scan customer QR and issue a stamp
   - Customer: Check your stamp card progress
   - Complete the card and check rewards

## Troubleshooting

### Common Issues

1. **API errors or 404**
   - Check that the Web App URL is correct in `api.js`
   - Ensure the deployment is set to "Anyone" can access
   - Redeploy the Apps Script if you made changes

2. **CORS errors**
   - Apps Script should handle CORS automatically
   - If issues persist, ensure you're using the Web App URL, not the script URL

3. **Authentication not working**
   - Check passwordHash is generated correctly
   - Verify sheet names match exactly (case-sensitive)
   - Check that SPREADSHEET_ID is correct

4. **QR Scanner not working**
   - Ensure HTTPS is enabled (required for camera access)
   - Grant camera permissions in browser
   - Check that QR code libraries are loaded

5. **Data not saving**
   - Check Apps Script execution logs (View → Executions)
   - Verify sheet structure matches schema
   - Check Apps Script has permissions to access Sheets

## Security Notes

1. **Password Security**
   - Passwords are hashed using SHA-256
   - For production, consider stronger hashing (bcrypt via library)

2. **Authentication**
   - Tokens expire after 24 hours
   - Consider adding refresh token mechanism for production

3. **API Access**
   - The API is public by default
   - Add IP whitelisting or additional auth for production

4. **Data Privacy**
   - Store only necessary customer information
   - Comply with local data protection regulations
   - Consider adding terms of service and privacy policy

## Next Steps

1. Customize the UI colors and branding
2. Add email notifications for completed cards
3. Implement analytics dashboard enhancements
4. Add backup and data export features
5. Set up monitoring and error tracking

## Support

For issues or questions:
- Review the code documentation in each file
- Check DATABASE_SCHEMA.md for database structure
- Refer to CLAUDE.md for architecture overview
