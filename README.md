# Stamp Card Web Service

A digital stamp card system for stores, built as a PWA and deployed on Google Apps Script.

## Features

- **For Customers**: Collect stamps, track progress, redeem rewards via QR codes
- **For Store Staff**: Issue stamps by scanning QR or entering customer info, manage store settings
- **For Admins**: Manage multiple stores and view analytics

## Tech Stack

- Frontend: HTML/CSS/JavaScript PWA
- Backend: Google Apps Script
- Database: Google Sheets

## Setup

1. Create a new Google Sheets spreadsheet
2. Set up the required sheets (see CLAUDE.md for schema)
3. Create a new Google Apps Script project
4. Copy code from `/gas` folder to GAS editor
5. Deploy as web app
6. Update API endpoint in frontend code
7. Host frontend files or serve from GAS

## Project Structure

See CLAUDE.md for detailed architecture and development guide.

## License

MIT
