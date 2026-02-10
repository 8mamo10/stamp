# Stamp Card Web Service

A digital stamp card system for stores, built as a PWA and deployed entirely on Google Apps Script.

## Features

- **For Customers**: Collect stamps, track progress, redeem rewards via QR codes
- **For Store Staff**: Issue stamps by scanning QR or entering customer info, manage store settings
- **For Admins**: Manage multiple stores and view analytics

## Tech Stack

- Frontend: HTML/CSS/JavaScript PWA
- Backend: Google Apps Script
- Database: Google Sheets
- Deployment: All-in-one on Google Apps Script (no external hosting needed)

## Quick Start

See **[QUICKSTART.md](QUICKSTART.md)** for step-by-step setup instructions (15 minutes).

## Setup Overview

1. Create a Google Sheets database with required sheets
2. Create a Google Apps Script project
3. Upload all files from `/gas` folder (includes both backend and frontend)
4. Update `SPREADSHEET_ID` in Code.gs
5. Deploy as web app with "Anyone" access
6. Access via:
   - Customer: `https://script.google.com/.../exec`
   - Staff: `https://script.google.com/.../exec?page=staff`
   - Admin: `https://script.google.com/.../exec?page=admin`

## Key Benefits

- **No CORS issues**: Frontend and backend served from same domain
- **No external hosting**: Everything runs on Google's infrastructure
- **Free tier**: Suitable for small to medium-sized stores
- **HTTPS by default**: Secure and works with QR code scanning on mobile

## Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - Get started in 15 minutes
- **[gas/DEPLOYMENT.md](gas/DEPLOYMENT.md)** - Detailed deployment instructions
- **[DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)** - Database structure
- **[CLAUDE.md](CLAUDE.md)** - Architecture and development guide

## License

MIT
