# GAS Deployment Instructions

## Overview
The application is now configured to serve HTML files directly from Google Apps Script (GAS), eliminating CORS issues.

## Files to Upload to GAS

Upload all files from the `/gas/` directory to your GAS project:

### Script Files (.gs)
- Code.gs
- Auth.gs
- Database.gs
- StampService.gs
- RewardService.gs
- StoreService.gs

### HTML Files (.html)
- index.html (Customer app)
- staff.html (Staff portal)
- admin.html (Admin panel)
- styles.css.html (CSS included in HTML files)
- api.js.html (API client)
- app.js.html (Customer app logic)
- staff.js.html (Staff portal logic)
- admin.js.html (Admin panel logic)
- qr.js.html (QR code utilities)

## Deployment Steps

1. **Open Your GAS Project**
   - Go to https://script.google.com
   - Open your existing project or create a new one

2. **Upload All Files**
   - Delete existing files if updating
   - Copy content from each `.gs` file to corresponding GAS script files
   - For HTML files (including `.html` extensions like `api.js.html`):
     - Click "+" next to "Files"
     - Select "HTML"
     - Name it exactly as shown above (including `.js` or `.css` before `.html`)
     - Paste the content

3. **Update Configuration**
   - In `Code.gs`, update the `SPREADSHEET_ID` constant with your Google Sheet ID

4. **Deploy as Web App**
   - Click "Deploy" → "New deployment"
   - Click gear icon → "Web app"
   - Settings:
     - **Execute as**: Me
     - **Who has access**: Anyone
   - Click "Deploy"
   - Copy the web app URL

5. **Access the Application**
   - **Customer App**: `https://script.google.com/.../exec`
   - **Staff Portal**: `https://script.google.com/.../exec?page=staff`
   - **Admin Panel**: `https://script.google.com/.../exec?page=admin`

## How It Works

- The `doGet()` function serves HTML files when accessed without a `path` parameter
- CSS and JS are included inline using GAS template syntax `<?!= include('filename'); ?>`
- API requests use the same domain, so no CORS issues occur
- The `API_URL` is automatically set to the current page URL

## Testing

After deployment:
1. Access the admin panel: `YOUR_GAS_URL?page=admin`
2. Login with your admin credentials (see QUICKSTART.md)
3. Verify no CORS errors in the browser console

## Troubleshooting

**If you see "Page not found":**
- Ensure all HTML files are uploaded with correct names
- Check that the `include()` function exists in Code.gs

**If API calls fail:**
- Check browser console for errors
- Verify the spreadsheet ID is correct in Code.gs
- Ensure web app is deployed with "Anyone" access
