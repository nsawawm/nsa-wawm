# NSA WAWM operational upgrade – release notes

This release is based on the supplied current Apps Script `Code.zip`, frontend `DRS.zip`, and supplied Cloudflare Worker source.

## Included
- Consolidated NSA-branded, compact, table-based HTML email wrapper with logo; plain text messages are escaped and line breaks preserved, while existing HTML message bodies are retained.
- Quota-aware individual communication campaign delivery. Campaigns process recipient rows individually, stop when the Apps Script daily email quota is exhausted, preserve unattempted rows as `PENDING`, set campaign status to `PAUSED_QUOTA`, and allow an administrator to resume later. Successful deliveries remain `SENT` and are not resent by resume.
- Existing campaign retry continues to retry only `FAILED` rows.
- Operational dashboard with day/month/year registration trends, month-by-month monthly evaluation compliance, annual evaluation reporting, selected month/year compliance and recent named activity lists.
- NSA logo favicons across the HTML pages in the supplied frontend archive.
- 80 mm thermal receipt print styling on the registration success page, including the logo.
- Cloudflare Worker based on the supplied source, retaining explicit allowlists, origin checks and gateway secret handling, with JSON content-type enforcement and an 8 MB request-size ceiling to accommodate photo payloads.
- Corrected an orphaned JavaScript fragment in `annual-evaluation-leave.html` that prevented its inline script from parsing.

## Email quota limitation
Google's daily Apps Script email recipient quota applies whether messages are sent individually or with multiple recipients in one call. Individual delivery provides per-recipient tracking; it does not bypass the quota.

Communication campaigns pause safely at quota exhaustion and can resume. OTPs are deliberately not queued because their codes expire. Direct one-off confirmations and scheduled monthly/annual reminder functions still use the Google quota. They send individually and will fail/defer at the service boundary when the quota is exhausted; they are not magically delivered until quota reset. If those direct reminder workflows must be durably queued and automatically resumed, that requires migrating those reminder producers to a persistent reminder queue with idempotency keys and a scheduled queue worker, or using a separate email provider.

## Deployment order
1. Back up the Apps Script project and database spreadsheet.
2. Replace the backend contents with `Code.gs`, save, and deploy a new Apps Script web-app version if applicable.
3. Deploy `cloudflare-worker/worker.js` as the Cloudflare Worker. Keep `ALLOWED_ORIGINS`, `APPS_SCRIPT_EXEC_URL`, and `GATEWAY_SHARED_SECRET` configured. Do not expose the secret in frontend files.
4. Upload the HTML files and `assets/` folder to the existing GitHub Pages repository, preserving relative paths.
5. Test login, OTP, registration, receipt print, evaluation submissions, dashboard filters, campaign preview, campaign sending, quota pause/resume and campaign history.

## Validation scope
Static validation performed: Apps Script backend syntax, Cloudflare Worker syntax, inline JavaScript syntax in the supplied HTML pages, and HTML parser smoke checks. No live calls were made to the user's Google Sheets, Gmail, Apps Script deployment, GitHub Pages or Cloudflare account. Live integration tests remain a deployment step.
