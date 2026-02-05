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
- **Frontend**: Plain HTML/CSS/JavaScript PWA
- **Authentication**: Email/Phone + Password

## Project Structure

```
/gas/
  Code.gs           - Main GAS entry point (doGet, doPost)
  Auth.gs           - Authentication logic
  Database.gs       - Google Sheets CRUD operations
  StampService.gs   - Stamp issuance and card logic
  RewardService.gs  - Reward generation and redemption

/public/
  index.html        - Customer app
  staff.html        - Store staff app
  admin.html        - Admin panel
  /css/
    styles.css      - Global styles
  /js/
    app.js          - Customer app logic
    staff.js        - Staff app logic
    admin.js        - Admin panel logic
    api.js          - API client
    qr.js           - QR code generation/scanning

  manifest.json     - PWA manifest
  sw.js             - Service worker
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

## Development Commands

Since this is a GAS project, development workflow:

1. **Local Development**: Edit files locally, then copy to GAS editor
2. **Testing**: Use GAS web app preview URL
3. **Deployment**: Deploy as web app from GAS editor

## Key Features

- Customer QR code generation for easy scanning
- Store staff can scan customer QR or enter email/phone
- Automatic reward creation when stamp card completes
- One active card per customer per store
- Configurable stamp rules (visit-based or purchase amount threshold)
- Mobile-first responsive design
- PWA support for "add to home screen"

## API Endpoints (GAS)

All requests to GAS web app use doPost/doGet:

- POST /api/auth/register
- POST /api/auth/login
- GET /api/customer/cards
- POST /api/staff/issueStamp
- POST /api/staff/redeemReward
- GET /api/store/analytics
- POST /api/admin/createStore
- GET /api/admin/stores
