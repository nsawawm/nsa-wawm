# NSA WAWM Personnel Management System

This archive contains the NSA WAWM static frontend, shared assets, and the Google Apps Script backend source.

The frontend uses the HTTPS Cloudflare Worker endpoint configured in `assets/config.js`. Do not place API credentials or secrets in that public file.

## Updated in this package

### Administration dashboard
- Daily registration trend for the last 30 days.
- Monthly registration trend for the last 12 months.
- Yearly registration trend for the last five years.
- Historical monthly evaluation submissions and pending counts for the last 12 periods, using the system's existing eligibility rules.
- Selected-month compliance with eligible, submitted, pending and compliance-rate figures.
- Current annual compliance with eligible, submitted, pending and compliance-rate figures.
- Annual evaluation submission trend by service-year period.
- Recent registration, monthly evaluation and annual evaluation lists include personnel names, NSS numbers and relevant dates/periods.
- Dashboard filters let an administrator choose daily/monthly/yearly trend granularity and the month/year used for monthly compliance.

### Communications and email
- Official NSA email wrapper with the configured logo, institution name, system name and reply-to address.
- Plain-text and HTML email bodies are handled separately, with unsafe embedded content stripped from HTML messages.
- Email sends check the remaining Apps Script daily recipient quota.
- Campaign batches pause without marking remaining messages as failed when the daily email quota is exhausted. The campaign remains resumable from Campaign History.
- SMS messages are no longer silently truncated to 160 characters. The preview still flags messages above 160 characters as an informational warning because the SMS provider may segment them and apply additional charges.

### Registration receipt
- Print layout is configured for an 80 mm thermal receipt roll.
- The printed receipt includes the NSA logo, registration number, personnel identity, NSS number, allowance category, secretariat and print timestamp.
- Select an 80 mm receipt-roll paper size in the browser print dialog where the printer driver provides that option.

### Browser tab branding and personnel lists
- Added the NSA logo as the favicon to the active HTML pages that did not already have one.
- Shared administrative table rendering automatically adds a personnel-name column when the returned records contain a recognised name field.
- Master-import preview now displays a combined personnel name.

## Deployment sequence

1. Back up the current GitHub Pages files and Apps Script project before replacing anything.
2. Deploy the updated `Code.gs` source to the Apps Script backend that the API gateway invokes. The same updated source is also retained as `Code.gs.txt`.
3. Deploy the updated root HTML files and the `assets/` directory to the existing GitHub Pages site. Keep the existing `assets/config.js` API URL unless the gateway endpoint has changed.
4. Confirm that the Cloudflare Worker forwards the `getAdminDashboardAnalytics` method and its optional second `filters` argument to the backend. The Worker source was not included in the supplied archive, so its internal routing and allow-list could not be inspected here.
5. Re-authorise the Apps Script mail scope if Google requests it. Check the configured email sender name, reply-to address and logo URL under System Settings.
6. Test registration, receipt retrieval, monthly and annual evaluation submission, administrator login, dashboard filters, email campaign preview, a one-recipient email test and an SMS longer than 160 characters before operational rollout.

## Dashboard metric definitions and limitations

- Historical monthly pending totals use the same active, subvented-personnel and service-date eligibility checks as the existing monthly compliance function.
- The selected-month compliance figures use the existing `getMonthlyCompliance(month, year, {})` calculation.
- Current annual compliance uses the current `Service Year` stored for each registered person, consistent with the existing annual compliance function.
- The annual historical chart reports submitted annual evaluations by recorded service-year period. It does not invent historical eligible denominators where the personnel register does not preserve historical rosters.
- Email quota availability is read dynamically from `MailApp.getRemainingDailyQuota()`. Google account type and Apps Script quota policy determine the actual allowance.

## Validation performed

- JavaScript syntax checks passed for the updated Apps Script backend.
- Inline JavaScript syntax checks passed for all HTML pages in the archive after correcting an orphaned code fragment in `annual-evaluation-leave.html`.
- Static inspection only. Live workflows could not be exercised because the supplied archive does not contain the production Cloudflare Worker source, connected Google Sheet data, or deployment credentials.
