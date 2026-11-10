# Upgrade Notes: v1.3 to v1.3.3

1. Back up the currently deployed Apps Script project and frontend files.
2. Deploy the updated DRS files from this package to the existing project. Retain the existing Script Properties, spreadsheet IDs, API configuration and production data.
3. Replace the existing GitHub Pages `camera-test/index.html` with the package's `camera-test/index.html`.
4. Clear/refresh the browser cache on the test phone and grant camera permission.
5. Run all six acceptance tests in README.md before production use.

No database migration is required by these frontend workflow corrections. No existing data sheets should be deleted or recreated.


## v1.3.3 QR reliability update
- Added parsing for malformed relative QR payloads such as `undefined/home/verification?...`; NSS number, service type, month, year and identifier are extracted without navigating to the malformed URL.
- Added a parallel native BarcodeDetector scan against the live high-resolution camera frame where the browser supports it. The existing html5-qrcode scanner remains the fallback.
- Increased the QR scan region to 97% of the available viewfinder and improved scan feedback.
