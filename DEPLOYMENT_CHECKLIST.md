# Deployment Checklist

Use this checklist to ensure proper deployment of the Stamp Card system.

## Pre-Deployment

### Google Sheets Setup
- [ ] Created new Google Spreadsheet
- [ ] Created all 6 required sheets (Users, Stores, StampCards, CustomerCards, Transactions, Rewards)
- [ ] Added column headers to each sheet
- [ ] Copied Spreadsheet ID from URL
- [ ] Verified all sheet names are exactly correct (case-sensitive)

### Google Apps Script Setup
- [ ] Created new Apps Script project
- [ ] Copied all 6 .gs files (Code, Auth, Database, StampService, RewardService, StoreService)
- [ ] Updated SPREADSHEET_ID in Code.gs
- [ ] Saved all files
- [ ] Deployed as Web App
- [ ] Set "Execute as" to "Me"
- [ ] Set "Who has access" to "Anyone"
- [ ] Copied Web App URL
- [ ] Authorized access and granted permissions

### Frontend Setup
- [ ] Updated API_URL in /public/js/api.js with Web App URL
- [ ] Created icons (icon-192.png and icon-512.png) - Optional
- [ ] Tested all HTML files open correctly
- [ ] Verified all CSS and JS files are linked properly
- [ ] Chose hosting solution (GitHub Pages, Netlify, etc.)
- [ ] Deployed frontend files

### Admin Account
- [ ] Created admin user in Users sheet OR
- [ ] Created admin via temporary script function
- [ ] Verified admin can login to admin.html
- [ ] Deleted temporary admin creation function (if used)

## Testing

### Backend Testing
- [ ] Apps Script execution logs show no errors
- [ ] Can access Web App URL without errors
- [ ] API returns proper JSON responses
- [ ] Authentication endpoint works
- [ ] Database operations work (checked in Sheets)

### Frontend Testing
- [ ] All pages load without console errors
- [ ] API requests work (check Network tab)
- [ ] Can register new user
- [ ] Can login with credentials
- [ ] Logout works properly
- [ ] No CORS errors

### Customer App Testing
- [ ] Registration works
- [ ] Login works
- [ ] Can view cards (empty state shows correctly)
- [ ] Can view rewards (empty state shows correctly)
- [ ] QR code generation works
- [ ] Bottom navigation works
- [ ] Mobile responsive layout works

### Staff Portal Testing
- [ ] Staff login works
- [ ] Can create stamp card in Settings
- [ ] Can issue stamp manually
- [ ] QR scanner works (requires HTTPS)
- [ ] Can view analytics
- [ ] Recent activity updates
- [ ] Can redeem rewards
- [ ] All tabs accessible

### Admin Panel Testing
- [ ] Admin login works
- [ ] Can create new store
- [ ] Can create store with staff credentials
- [ ] Can view all stores
- [ ] Can view system analytics
- [ ] Store list updates after creation

### End-to-End Testing
- [ ] Admin creates store
- [ ] Staff logs in and creates stamp card
- [ ] Customer registers
- [ ] Customer shows QR to staff
- [ ] Staff scans QR and issues stamp
- [ ] Customer sees stamp added
- [ ] Complete full card
- [ ] Reward automatically generated
- [ ] Customer can view reward
- [ ] Staff can redeem reward
- [ ] Transaction appears in analytics

## Security Checklist

- [ ] Admin password is strong
- [ ] Test staff passwords are strong
- [ ] No sensitive data in console logs
- [ ] HTTPS enabled for production
- [ ] Camera permissions work for QR scanner
- [ ] Token expiration works (test after 24 hours)
- [ ] Role-based access enforced (customer can't access staff portal)

## Performance Checklist

- [ ] Page load time is acceptable
- [ ] API response time is acceptable
- [ ] QR code generation is fast
- [ ] Images optimized (if any)
- [ ] Service worker caches properly
- [ ] No memory leaks (test in DevTools)

## Mobile Testing

- [ ] Tested on iPhone Safari
- [ ] Tested on Android Chrome
- [ ] Touch interactions work
- [ ] QR scanner works on mobile
- [ ] Forms are mobile-friendly
- [ ] Navigation is thumb-friendly
- [ ] PWA can be installed ("Add to Home Screen")
- [ ] Offline mode works (service worker)

## PWA Checklist

- [ ] manifest.json is accessible
- [ ] Service worker registers successfully
- [ ] Icons specified in manifest
- [ ] App is installable
- [ ] Works offline (cached resources)
- [ ] Theme color shows in mobile browser
- [ ] Standalone mode works

## Documentation

- [ ] README.md is up to date
- [ ] DEPLOYMENT.md has correct instructions
- [ ] QUICKSTART.md is accurate
- [ ] DATABASE_SCHEMA.md matches actual schema
- [ ] CLAUDE.md reflects final architecture
- [ ] API endpoints documented
- [ ] Code comments are clear

## Production Readiness

### Must Have
- [ ] All core features working
- [ ] No critical bugs
- [ ] Authentication working
- [ ] Data persists correctly
- [ ] Error handling in place
- [ ] User feedback for actions

### Should Have
- [ ] Analytics working
- [ ] QR code scanning working
- [ ] Mobile responsive
- [ ] PWA installable
- [ ] Loading states shown
- [ ] Error messages helpful

### Nice to Have
- [ ] Custom branding/colors
- [ ] Custom icons
- [ ] Custom domain
- [ ] Email notifications
- [ ] Advanced analytics

## Go-Live Checklist

- [ ] Backup Google Spreadsheet
- [ ] Document admin credentials securely
- [ ] Create user guide for staff
- [ ] Create user guide for customers
- [ ] Test with real store data
- [ ] Have rollback plan ready
- [ ] Monitor Apps Script logs
- [ ] Check for errors in first 24 hours
- [ ] Gather user feedback
- [ ] Plan for iterations

## Post-Deployment

### Day 1
- [ ] Monitor for errors
- [ ] Check Apps Script execution logs
- [ ] Verify data is being saved
- [ ] Test with first real customers
- [ ] Address any immediate issues

### Week 1
- [ ] Gather staff feedback
- [ ] Gather customer feedback
- [ ] Check analytics data
- [ ] Optimize if needed
- [ ] Document any issues

### Month 1
- [ ] Review usage patterns
- [ ] Analyze redemption rates
- [ ] Check system performance
- [ ] Plan improvements
- [ ] Consider scaling if needed

## Troubleshooting Quick Checks

If something doesn't work:

1. **Check Apps Script Logs**
   - Go to Apps Script → View → Executions
   - Look for errors

2. **Check Browser Console**
   - Open DevTools (F12)
   - Check Console tab for errors
   - Check Network tab for failed requests

3. **Verify Configuration**
   - SPREADSHEET_ID is correct
   - API_URL is correct
   - Sheet names match exactly
   - Column headers match exactly

4. **Check Permissions**
   - Apps Script has Sheets access
   - Camera permissions granted (for QR)
   - Web App is set to "Anyone"

5. **Common Fixes**
   - Clear browser cache
   - Redeploy Apps Script
   - Check for typos in code
   - Verify data format in Sheets

## Success Criteria

✅ System is live and accessible
✅ All three portals working (customer, staff, admin)
✅ At least one complete flow tested end-to-end
✅ No critical errors in logs
✅ Users can successfully complete tasks
✅ Data persists correctly in Sheets
✅ Mobile experience is smooth

---

**Ready to deploy?** Check off all items in each section before going live!
