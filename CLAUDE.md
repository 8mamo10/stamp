# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Stamp Card Web Service** - A PWA-based digital stamp card system for stores, deployed on Google Apps Script (GAS).

### User Roles
- **Customer**: Collect stamps, view cards, redeem rewards
- **Store Staff**: Issue stamps to customers, manage store settings, view analytics
- **Admin**: Manage multiple stores and view system-wide analytics

### Technology Stack
- **Backend**: Google Apps Script (GAS)
- **Database**: Google Sheets (multi-sheet structure)
- **Frontend**: Plain HTML/CSS/JavaScript (served from GAS)
- **Authentication**: Email/Phone + Password
- **Deployment**: All-in-one on GAS (no external hosting required)

## Project Structure

```
/gas/
  # Backend Script Files
  Code.gs           - Main GAS entry point (doGet, doPost) + HTML serving
  Auth.gs           - Authentication logic
  Database.gs       - Google Sheets CRUD operations
  StampService.gs   - Stamp issuance and card logic
  RewardService.gs  - Reward generation and redemption
  StoreService.gs   - Store management and analytics

  # Frontend HTML Files
  index.html        - Customer app
  staff.html        - Store staff app
  admin.html        - Admin panel

  # Included Resources (with .html extension for GAS)
  styles.css.html   - Global styles
  api.js.html       - API client
  app.js.html       - Customer app logic
  staff.js.html     - Staff app logic
  admin.js.html     - Admin panel logic
  qr.js.html        - QR code generation/scanning

/public/
  # Original source files (for reference/development only)
  # These are NOT deployed - use /gas/ for deployment
  index.html, staff.html, admin.html
  /css/styles.css
  /js/api.js, app.js, staff.js, admin.js, qr.js
```

## Database Schema (Google Sheets)

**Sheet: Users**
- Columns: userId, email, phone, passwordHash, role (customer/staff/admin), storeId, createdAt

**Sheet: Stores**
- Columns: storeId, storeName, ownerUserId, createdAt, isActive

**Sheet: StampCards**
- Columns: cardId, storeId, cardName, stampsRequired, rewardDescription, ruleType (visit/amount), ruleValue, createdAt, isActive

**Sheet: CustomerCards**
- Columns: customerCardId, customerId, cardId, storeId, currentStamps, status (active/completed/redeemed), createdAt, completedAt

**Sheet: Transactions**
- Columns: transactionId, customerCardId, customerId, storeId, staffId, type (stamp/redemption), purchaseAmount, timestamp

**Sheet: Rewards**
- Columns: rewardId, customerCardId, customerId, storeId, rewardCode, status (available/redeemed), createdAt, redeemedAt

## Development Workflow

Since everything is deployed on GAS:

1. **Local Development**: Edit files in `/public/` directory (source files)
2. **Prepare for GAS**: Copy files to `/gas/` directory:
   - Copy `.gs` files as-is
   - Copy HTML files as-is
   - Copy CSS/JS files with `.html` extension (e.g., `api.js` → `api.js.html`)
   - Update HTML files to use `<?!= include('filename'); ?>` for CSS/JS
3. **Upload to GAS**: Copy all `/gas/` files to Google Apps Script editor
4. **Configure**: Update `SPREADSHEET_ID` in `Code.gs`
5. **Deploy**: Deploy as web app (Execute as: Me, Access: Anyone)
6. **Test**: Access via `https://script.google.com/.../exec?page=admin`

## Key Features

- Customer QR code generation for easy scanning
- Store staff can scan customer QR or enter email/phone
- Automatic reward creation when stamp card completes
- One active card per customer per store
- Configurable stamp rules (visit-based or purchase amount threshold)
- Mobile-first responsive design
- PWA support for "add to home screen"

## API Endpoints (GAS)

All requests to GAS web app use `doPost`/`doGet` with `?path=` parameter:

**Authentication (No auth required)**
- POST `?path=auth/register`
- POST `?path=auth/login`

**Customer Endpoints**
- GET `?path=customer/cards`
- GET `?path=customer/rewards`
- POST `?path=customer/redeemReward`

**Staff Endpoints**
- POST `?path=staff/issueStamp`
- POST `?path=staff/createCard`
- POST `?path=staff/confirmRedemption`
- GET `?path=store/analytics`

**Admin Endpoints**
- POST `?path=admin/createStore`
- POST `?path=admin/updateStore`
- GET `?path=admin/stores`
- GET `?path=admin/analytics`

**HTML Pages (via `?page=` parameter)**
- GET `?page=index` or `/` - Customer app
- GET `?page=staff` - Staff portal
- GET `?page=admin` - Admin panel
