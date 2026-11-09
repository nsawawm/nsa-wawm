# Upgrade notes: v1.1 User Agency Management

## Included changes
- Added agency registry and migration-safe sheet initialisation.
- Added master-posting synchronisation for previously unseen agency destinations.
- Added Secretariat profile completion, approval and account activation.
- Added agency-specific portal and `AGENCY SECRETARIAT` role routing.
- Added agency profile self-service, supervisor directory and personnel assignments.
- Added future-batch personnel requests and Secretariat request decisions.
- Added agency communications for head contacts, supervisors and registered personnel.
- Added agency details and supervisor contacts to the administrative personnel profile.\n- Added OTP-protected personnel self-service access to their own posting institution and supervisor.
- Added agency audit records.

## Validation performed
- JavaScript syntax validation with Node.js for `Code.gs`, `worker.js`, `assets/auth.js`, and inline scripts in the new agency page and modified personnel profile.
- Static review of API method allowlists in the Cloudflare Worker and Apps Script dispatcher.
- Confirmed the new UI calls the existing API bridge and uses the current `NSA_USER_SESSION` storage key.

## Before production release
This environment cannot connect to the live Google Spreadsheet, Apps Script deployment, Cloudflare account, mail provider, or SMS provider. Therefore, live data migration, permissions, outbound delivery, and deployment cannot be executed or represented as tested here. Follow the deployment checklist in README.md and run the live acceptance tests against a backup/staging copy first.


## v1.3
Run `setupNSA_WAWM()` after replacing Code.gs. The routine additively provisions the full agency data model and migrates legacy agency head contacts, supervisors and assignments. Test agency file import with a small CSV/XLSX file. The User Agencies and Geospatial Monitoring sidebar pages now load inside the Admin shell.
