# Public Directory - Development Source Files

This directory contains the original source files for local development and reference.

## Important Notes

- **These files are NOT used for deployment**
- All deployment files are in the `/gas/` directory
- This directory can be deleted if you only need the deployed version
- Keep this directory if you want to:
  - Develop locally before copying to `/gas/`
  - Host the frontend separately (not recommended due to CORS issues)
  - Have clean source files without GAS-specific modifications

## Files in this Directory

- `index.html`, `staff.html`, `admin.html` - Original HTML files
- `/css/styles.css` - Original CSS (copied to `/gas/styles.css.html`)
- `/js/api.js` - Original API client (copied to `/gas/api.js.html`)
- `/js/app.js`, `staff.js`, `admin.js`, `qr.js` - Original JS files
- `manifest.json`, `sw.js` - PWA files (not functional in GAS deployment)

## Deployment

For deployment instructions, see `/gas/DEPLOYMENT.md`
