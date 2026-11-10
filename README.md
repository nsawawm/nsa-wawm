# NSA WAWM DRS Complete Agency & Geospatial Upgrade v1.3

This package extends the existing DRS application with integrated User Agency Management. Existing registration, OTP, personnel, batch, allowance, evaluation, certification, reporting, communications, and administrative modules are retained.

## Agency-management additions

- Discovers unique posting destinations from `MASTER_PERSONNEL` and creates pending agency records for completion.
- Maintains a User Agency register with company code, name, branches, region, district, email, telephone, address, GPS, industry, paying status, company type, ownership, category, approval status, and registration date.
- Stores head/contact person information, institutional motivation, accommodation, feeding, extra allowances, amenities, other benefits, and agency image URLs.
- Counts official postings from `MASTER_PERSONNEL`; counts accepted registrations by matching NSS numbers against `REGISTERED_PERSONNEL`.
- Allows the Secretariat to complete and approve agency profiles and activate agency accounts.
- Adds the `AGENCY SECRETARIAT` role and a scoped agency portal.
- Allows agency secretariats to manage their profile, maintain supervisors, assign supervisors only to personnel officially posted to their agency, and request personnel by future service batch.
- Allows communications to agency heads, supervisors, and registered personnel by email/SMS, with individual WhatsApp click-to-chat links.
- Adds agency and assigned-supervisor contact information to the administrative personnel profile.
- Adds an OTP-verified personnel self-service page (`agency-info.html`) that reveals only the person's own official posting institution and assigned supervisor.

## Authoritative rules

1. `MASTER_PERSONNEL` remains the source of truth for official postings.
2. Agency users cannot change official posting destinations.
3. The Secretariat activates agency portal accounts.
4. Agency Secretariat accounts manage their own agency and can assign supervisors only to personnel whose current master posting matches that agency.
5. Personnel requests are limited to active batches with a valid future service start date.
6. The agency information shown in the administrative personnel profile is sourced from the linked agency registry.

## Deployment

1. Back up the live Google Spreadsheet and current deployed Apps Script project.
2. Replace the Apps Script `Code.gs` with the supplied `Code.gs`.
3. Run `setupNSA_WAWM()` once from the Apps Script editor as an authorised administrator. This creates the four agency sheets and preserves existing sheet data.
4. Deploy a new version of the Apps Script web app using the existing deployment identity and permissions.
5. Replace the deployed Cloudflare Worker source with `worker.js` (also supplied under `cloudflare-worker/worker.js`).
6. Keep the existing Worker secrets and environment variables: `ALLOWED_ORIGINS`, `APPS_SCRIPT_EXEC_URL`, and `GATEWAY_SHARED_SECRET`.
7. Publish the complete static site files, including `agency-management.html`, `admin.html`, `personnel-profile.html`, `assets/auth.js`, and all existing assets, to the same GitHub Pages deployment.
8. Sign in as an ADMIN, open **User Agencies**, and select **Sync new agencies from master personnel**.
9. Complete the agency profiles and set their status to **Approved**. Activate each agency account from the Secretariat portal.
10. Personnel can use the **View my posting institution information** link and verify with an OTP sent to the contact information in MASTER_PERSONNEL.\n11. The agency head receives the generated temporary password by email when email delivery is configured. The Secretariat should communicate the temporary password through an approved secure channel. Use the existing administrator password-reset function when a credential change is required.

## Agency sheets

- `USER_AGENCIES`
- `AGENCY_SUPERVISORS`
- `AGENCY_ASSIGNMENTS`
- `AGENCY_REQUESTS`
- `AGENCY_AUDIT`

The setup routine creates missing sheets and appends missing headers. It does not delete or overwrite existing data.

## Operational notes

- Email and SMS delivery depend on the existing DRS email and SMS configuration and quotas.
- WhatsApp is implemented as individual click-to-chat links. The user must open WhatsApp and send each prepared message; automated WhatsApp delivery is not claimed.
- GPS is stored as an editable text field, for example `WY-3315-9571`. This package does not geocode addresses or verify GPS coordinates.
- Image URLs are stored as line-separated HTTPS/HTTP URLs. Use trusted, access-controlled image hosting.
- Agency account activation creates a `USERS` entry with role `AGENCY SECRETARIAT`. Agency users sign in through the existing login page.
- Existing production deployment, spreadsheet permissions, mail quotas, SMS provider configuration, and Worker secrets must be verified by the system owner before live deployment.


## Geospatial Personnel Monitoring (v1.2)

The integrated Leaflet module adds:
- One map marker per agency, not one marker per person.
- Live current/upcoming/completed service classification using service start/end dates.
- Filters for region, district, industry, category, ownership, paying status, batch, allowance type and service year.
- Agency panels with current personnel names, registration numbers, batches, allowance types and available photo URLs.
- Agency coordinate storage with verification metadata.
- Browser GPS capture for physical monitoring visits.
- Remote monitoring records without GPS requirement.
- Monitoring visit records, attendance figures, welfare/supervision checks, corrective actions and follow-up status.

### Additional sheets
`AGENCY_GEOLOCATION`, `MONITORING_VISITS`, `MONITORING_ACTIONS`, and `AGENCY_PHOTOS` are created additively by `setupNSA_WAWM()`. Existing rows and columns are preserved.

### Geospatial deployment
1. Deploy the updated Apps Script backend and Worker allowlist.
2. Publish `geospatial-monitoring.html` and the updated `admin.html`.
3. Open **Geospatial Monitoring** from the Admin navigation.
4. Allow browser location permission when capturing field GPS.
5. For map tiles, the page currently uses OpenStreetMap's standard tile endpoint. For production/high-volume use, configure a tile provider whose usage terms and capacity meet operational requirements.
6. Coordinates must be captured or entered and checked. A GhanaPostGPS digital address is retained as an address string and is not automatically treated as latitude/longitude.
7. Only administrator and super-administrator sessions can access the GIS and monitoring APIs.

### Current service definition
- `UPCOMING`: service start date is after Ghana-local today.
- `ACTIVE`: service start date is on/before today and service end date is on/after today.
- `COMPLETED`: service end date is before Ghana-local today.
- `DATE_REVIEW`: one or both service dates are unavailable or invalid.

The map defaults to current active personnel. Historical and upcoming counts remain separately visible.


## v1.3 complete agency data architecture and admin integration

### Canonical agency and operational tables
The additive setup now provisions the complete proposed table set: `USER_AGENCIES`, `AGENCY_CONTACTS`, `AGENCY_BRANCHES`, `AGENCY_SUPPORT`, `AGENCY_PHOTOS`, `AGENCY_REQUESTS`, `AGENCY_REQUEST_DETAILS`, `POSTING_RECORDS`, `POSTING_ACCEPTANCE`, `SUPERVISORS`, `SUPERVISOR_ASSIGNMENTS`, `SUPERVISOR_EVALUATIONS`, `AGENCY_INSPECTIONS`, `AGENCY_COMPLAINTS`, `AGENCY_COMMUNICATIONS`, `AGENCY_USERS`, and `AGENCY_AUDIT_LOG`. Additional operational tables include `AGENCY_BENEFITS_HISTORY`, `AGENCY_GEOLOCATION_HISTORY`, `PERSONNEL_REPORTING`, `PERSONNEL_ATTENDANCE`, `AGENCY_VISIT_EVIDENCE`, `AGENCY_ACTION_TRACKER`, `AGENCY_DOCUMENTS`, and `AGENCY_NOTIFICATION_LOG`.

Legacy tables remain in place for compatibility (`AGENCY_SUPERVISORS`, `AGENCY_ASSIGNMENTS`, `AGENCY_AUDIT`, `MONITORING_VISITS`, `MONITORING_ACTIONS`, and `AGENCY_GEOLOCATION`). The setup routine adds missing sheets/headers and migrates existing supervisor, assignment and primary-head contact data into the canonical registers without deleting the legacy records.

### Agency file import
The User Agencies page accepts CSV and Excel `.xlsx`/`.xls` files. The first worksheet is read. Column mapping recognises Company Code, Name/Company Name, Branches, Region, District, Email, Phone Number, Address, GPS, Industry, Paying Status, Company Type, Company Ownership, Category, Status and Date Registered. Existing agencies are matched first by Company Code, then by normalised agency name. Non-empty uploaded values update matching records; blank values do not erase existing values. New agency accounts remain inactive pending Secretariat activation. Imports are limited to 5,000 rows per request and use a script lock to prevent concurrent write collisions.

### Admin navigation
The User Agencies and Geospatial Monitoring sidebar actions now open their pages inside the authenticated Admin shell using an embedded module frame. The normal admin header and sidebar remain available. The router also has explicit routes for both modules.

### Important data-governance note
`MASTER_PERSONNEL` remains the authoritative source for official posting destinations. The new canonical posting, acceptance, attendance, complaint, inspection and evaluation sheets provide the database structures for operational workflows. The existing live workflows continue to use the compatibility tables where applicable. Do not treat a blank canonical table as evidence that no historical event occurred; migrate or reconcile historical records before relying on those new registers for formal reporting. Acceptance must be recorded explicitly; registration alone must not be treated as proof that personnel reported to an agency.

### Setup and deployment
1. Back up the production spreadsheet and current Apps Script project.
2. Replace `Code.gs` with this package version.
3. Run `setupNSA_WAWM()` once under an authorised administrator account. It provisions missing tables and adds missing headers; it does not delete existing rows.
4. Deploy a new Apps Script version and update the Cloudflare Worker source from `cloudflare-worker/worker.js` if the Worker copy differs.
5. Publish the complete frontend and assets to the existing static hosting location.
6. Sign in as ADMIN, open User Agencies inside the admin shell, and test CSV/XLSX import with a small file before importing the full agency register.
7. Verify agency counts, duplicate handling, permissions, geolocation capture and monitoring records against the production spreadsheet before wider rollout.

### Validation
JavaScript syntax checks and ZIP integrity checks are run on the generated release. Live Google Sheets, Apps Script deployment, Worker secrets, external tile services and real user-role access cannot be verified from this build environment and must be tested in the deployment environment.
