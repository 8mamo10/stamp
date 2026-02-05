# Quick Start Guide

Get your Stamp Card system up and running in 15 minutes!

## Overview

This system has three main components:
1. **Google Sheets** - Database
2. **Google Apps Script** - Backend API
3. **Web Frontend** - Customer, Staff, and Admin interfaces

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
4. Copy the Spreadsheet ID from the URL

### 2. Backend Setup (5 minutes)

1. Open [Google Apps Script](https://script.google.com)
2. Create new project
3. Copy all `.gs` files from `/gas` folder to the project
4. Update `SPREADSHEET_ID` in `Code.gs` with your ID
5. Deploy → New deployment → Web app → Deploy
6. Copy the Web App URL

### 3. Frontend Setup (3 minutes)

1. Update `API_URL` in `/public/js/api.js` with your Web App URL
2. Host the `/public` folder (use GitHub Pages, Netlify, or any hosting)

### 4. Create Admin Account (2 minutes)

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
1. Open `admin.html`
2. Login with: `admin@example.com` / `admin123`
3. Create your first store

### Setup Store
1. Admin creates store with staff credentials
2. Staff logs into `staff.html`
3. Staff creates stamp card in Settings tab

### Test Customer Flow
1. Open `index.html`
2. Register as customer
3. Show QR code to staff (or staff can enter email manually)
4. Staff issues stamps
5. Customer views progress
6. When complete, customer shows reward QR to staff

## Folder Structure

```
/gas/               - Google Apps Script files
  Code.gs           - Main API entry point
  Auth.gs           - Authentication
  Database.gs       - Database operations
  StampService.gs   - Stamp logic
  RewardService.gs  - Reward logic
  StoreService.gs   - Store management

/public/            - Frontend files
  index.html        - Customer app
  staff.html        - Staff portal
  admin.html        - Admin panel
  /css/
    styles.css      - Styling
  /js/
    api.js          - API client
    app.js          - Customer logic
    staff.js        - Staff logic
    admin.js        - Admin logic
    qr.js           - QR code utilities
```

## Common URLs

After deployment, you'll have:
- Customer App: `https://your-domain.com/index.html`
- Staff Portal: `https://your-domain.com/staff.html`
- Admin Panel: `https://your-domain.com/admin.html`

## Tips

1. **Testing locally**: You can open HTML files directly in browser, but QR scanner needs HTTPS
2. **Mobile testing**: Use ngrok or similar to test on mobile devices
3. **Icons**: Add `icon-192.png` and `icon-512.png` for PWA installation
4. **Customization**: Edit colors in `styles.css` (see `:root` section)

## Need Help?

- Read `DEPLOYMENT.md` for detailed instructions
- Check `DATABASE_SCHEMA.md` for database structure
- Review `CLAUDE.md` for architecture overview
- Inspect browser console for errors
- Check Apps Script logs (View → Executions)

## What's Next?

Once you have the basic system running:
1. Customize branding and colors
2. Add your store logo
3. Create actual store accounts
4. Train staff on using the system
5. Share customer app with your customers
6. Monitor analytics in staff/admin panels
