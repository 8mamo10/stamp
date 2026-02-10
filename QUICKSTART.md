# Quick Start Guide

Get your Stamp Card system up and running in 15 minutes!

## Overview

This system has two main components:
1. **Google Sheets** - Database
2. **Google Apps Script** - Backend API + Frontend (all-in-one)

Everything is served from Google Apps Script, eliminating CORS issues and simplifying deployment.

## Quick Setup (15 minutes)

### 1. Database Setup (5 minutes)

1. Open [Google Sheets](https://sheets.google.com) and create a new spreadsheet
2. Create 6 sheets with these exact names:
   - Users
   - Stores
   - StampCards
   - CustomerCards
   - Transactions
   - Rewards
3. Copy headers from `DATABASE_SCHEMA.md` to each sheet (just the first row)
4. Copy the Spreadsheet ID from the URL (it's the long string in the URL)

### 2. Apps Script Setup (8 minutes)

1. Open [Google Apps Script](https://script.google.com)
2. Create new project
3. Upload all files from `/gas` folder:
   - **Script files (.gs)**: Code.gs, Auth.gs, Database.gs, StampService.gs, RewardService.gs, StoreService.gs
   - **HTML files (.html)**: index.html, staff.html, admin.html, styles.css.html, api.js.html, app.js.html, staff.js.html, admin.js.html, qr.js.html
4. Update `SPREADSHEET_ID` in `Code.gs` with your Spreadsheet ID
5. Deploy → New deployment → Web app
   - **Execute as**: Me
   - **Who has access**: Anyone
6. Click Deploy and copy the Web App URL

### 3. Create Admin Account (2 minutes)

**Simple method - Using the registration endpoint:**

1. Open your Apps Script
2. Run this temporary function to create admin:

```javascript
function createAdmin() {
  const admin = {
    email: 'admin@example.com',
    phone: '',
    password: 'admin123', // Change this!
    role: 'admin'
  };

  const result = registerUser(admin);
  Logger.log('Admin created: ' + JSON.stringify(result));
}
```

3. Go to View → Logs to see the result
4. Delete this function after use

## First Steps

### Login to Admin Panel
1. Open your Web App URL with `?page=admin`: `https://script.google.com/.../exec?page=admin`
2. Login with: `admin@example.com` / `admin123`
3. Create your first store

### Setup Store
1. Admin creates store with staff credentials
2. Staff opens: `https://script.google.com/.../exec?page=staff`
3. Staff logs in and creates stamp card in Settings tab

### Test Customer Flow
1. Customer opens: `https://script.google.com/.../exec` (default page)
2. Register as customer
3. Show QR code to staff (or staff can enter email manually)
4. Staff issues stamps
5. Customer views progress
6. When complete, customer shows reward QR to staff

## Folder Structure

```
/gas/               - All files for Google Apps Script
  # Script Files
  Code.gs           - Main API entry point + HTML serving
  Auth.gs           - Authentication
  Database.gs       - Database operations
  StampService.gs   - Stamp logic
  RewardService.gs  - Reward logic
  StoreService.gs   - Store management and analytics

  # HTML Files (frontend)
  index.html        - Customer app
  staff.html        - Staff portal
  admin.html        - Admin panel

  # Included Resources (.html extensions required by GAS)
  styles.css.html   - CSS styling
  api.js.html       - API client
  app.js.html       - Customer logic
  staff.js.html     - Staff logic
  admin.js.html     - Admin logic
  qr.js.html        - QR code utilities
```

## Application URLs

After deployment, bookmark these URLs (replace `YOUR_WEB_APP_URL` with your actual URL):

- **Customer App**: `https://script.google.com/macros/s/.../exec`
- **Staff Portal**: `https://script.google.com/macros/s/.../exec?page=staff`
- **Admin Panel**: `https://script.google.com/macros/s/.../exec?page=admin`

## Tips

1. **Share URLs**: Give customers the main URL, staff the `?page=staff` URL
2. **Bookmarking**: Add to home screen on mobile for app-like experience
3. **Customization**: Edit colors in `styles.css.html` (see `:root` section)
4. **HTTPS**: GAS automatically provides HTTPS, so QR scanning works on mobile

## Need Help?

- Read `gas/DEPLOYMENT.md` for detailed deployment instructions
- Check `DATABASE_SCHEMA.md` for database structure
- Review `CLAUDE.md` for architecture overview
- Inspect browser console for errors
- Check Apps Script logs (Extensions → Apps Script → View → Executions)

## What's Next?

Once you have the basic system running:
1. Customize branding and colors
2. Add your store logo
3. Create actual store accounts
4. Train staff on using the system
5. Share customer app with your customers
6. Monitor analytics in staff/admin panels
