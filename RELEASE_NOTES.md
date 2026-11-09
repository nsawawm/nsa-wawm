# NSA WAWM DRS v1.3 Release Notes

- Added all 17 requested canonical agency-management sheets and 8 supporting operational tables.
- Added additive migration of legacy agency head contacts, supervisors and supervisor assignments.
- Added locked CSV/XLSX agency register import with Company Code/name matching and non-destructive blank-cell handling.
- Fixed User Agencies and Geospatial Monitoring sidebar navigation so each module opens inside the Admin interface shell.
- Added explicit router entries for both modules.
- Preserved existing DRS pages, legacy agency sheets and official posting authority in MASTER_PERSONNEL.

This release provisions the full data architecture. Some newly provisioned operational registers are schema-ready and require further workflow rollout/data reconciliation before being used as the sole source for formal reporting.


## v1.3.1 - QR scanner and evaluation workflow corrections

- Registration QR scan now starts the same `continuePortal()` verification and OTP workflow used by manual NSS entry.
- Improved QR scanner camera selection and capture configuration, including rear-camera preference, 1920×1080 ideal resolution, QR-only decoding, a larger scan box and increased scan frequency.
- Monthly OCR capture-code return now triggers automatic submission after successful server eligibility validation. Existing safeguards for invalid codes, duplicate submissions, late approval, and expired sessions remain active.
- Included the revised camera-test source and deployment instructions.
- No agency-management, geospatial, personnel, batch, allowance, reporting, authentication, or official posting authority modules were removed or replaced.
