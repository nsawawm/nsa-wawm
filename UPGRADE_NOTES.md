# NSA WAWM Personnel Management System – Integrated Upgrade

## Package contents
- `Code.gs`: updated Apps Script backend (authoritative replacement for the current backend file).
- Existing GitHub Pages HTML files and shared assets from the supplied `DRS.zip`.
- `admin.html`: operational dashboard with day/month/year registration trends, monthly and annual evaluation reporting, selected-period compliance and named recent activity lists.
- `success.html`: thermal receipt print styling for 80 mm printers, retaining the on-screen success page.
- `communications.html`: campaign processing now recognises quota-paused campaigns and permits resumption.
- `worker.js`: updated Cloudflare Worker source based on the supplied Worker, with JSON content-type enforcement and a 8 MB request-body limit.

## Apps Script deployment
1. Back up the current Apps Script project and linked spreadsheet.
2. Replace the existing backend source with `Code.gs` (retain any project files not included in the source archive).
3. Save and run a non-destructive administrative test first, such as loading the admin dashboard and previewing a communication campaign.
4. Deploy a new version of the Apps Script web app if the project uses a versioned deployment. Keep the same deployment access model and URL unless you intentionally change it.

## GitHub Pages deployment
1. Upload the updated HTML files and `assets/` directory, preserving their relative paths.
2. Keep the public API URL in `assets/config.js` unchanged unless the Worker URL changes.
3. Confirm the favicon loads on each active page and the success receipt prints correctly.

## Cloudflare Worker deployment
1. Replace the Worker source with `worker.js`.
2. Preserve the existing environment variables/secrets:
   - `ALLOWED_ORIGINS` (for example `https://nsawawm.github.io`)
   - `APPS_SCRIPT_EXEC_URL` (the deployed Apps Script `/exec` URL)
   - `GATEWAY_SHARED_SECRET` (Cloudflare secret; never place in GitHub Pages)
3. Deploy the Worker and test login, registration OTP, admin dashboard, communication campaign preview, and campaign processing.
4. The Worker continues to use the existing explicit action/method allowlists. Add a backend method to the allowlist only after confirming its authentication and input validation.

## Email quota behaviour
- Emails are sent individually to each recipient. This gives per-recipient logging and avoids recipient-list bulk sends.
- Individual sends do **not** bypass Google's daily recipient quota. Google counts recipients regardless of whether a message is sent alone or in a group.
- Communication campaigns are processed in small batches. If Apps Script reports no remaining daily email quota, the campaign changes to `PAUSED_QUOTA`; undelivered recipients remain `PENDING` and successful recipients remain `SENT`.
- After Google's quota becomes available again, use the campaign history's **Resume** action. It resumes pending rows without resending successful rows.
- Direct OTP, registration-confirmation and reminder emails remain subject to Google's quota. OTP emails are not silently queued because their codes expire. For guaranteed delivery beyond Google's quota, configure a separate transactional email provider.

## Validation performed
- Apps Script backend JavaScript syntax check.
- Cloudflare Worker JavaScript syntax check.
- Inline JavaScript syntax checks for HTML pages where scripts could be extracted safely.
- HTML parser smoke checks.

Live Google Sheets, Gmail, Apps Script deployment and Cloudflare requests have not been executed from this packaging environment. Complete the deployment smoke tests above before using this release operationally.
