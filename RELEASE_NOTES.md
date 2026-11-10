# Release Notes: NSA WAWM DRS v1.3.3

## Corrected
- Home-page QR scans no longer stop at NSS field population. They now invoke the established manual CONTINUE workflow.
- Monthly capture-code scanner no longer validates a same-tab return URL against a hard-coded Apps Script host list. It returns the code to the opener window.
- Monthly evaluation automatically initiates the existing submission function after receiving a valid code from the camera popup.
- QR camera requests higher resolution and continuous autofocus/exposure controls where supported, with a larger decoding area for dense QR codes.

## Preserved
- Existing Apps Script backend and API calls.
- Existing registration OTP sequence.
- Existing monthly and annual evaluation eligibility prechecks.
- Existing duplicate-submission handling and late-approval controls.
- Existing passport camera and six-character OCR capture workflow.
- Existing agency, geospatial, personnel, reporting and administration modules.

## Deployment note
The updated camera source is included at `camera-test/index.html`. It must be deployed to the existing GitHub Pages camera repository as well as deploying the DRS package.


## v1.3.3 QR reliability update
- Added parsing for malformed relative QR payloads such as `undefined/home/verification?...`; NSS number, service type, month, year and identifier are extracted without navigating to the malformed URL.
- Added a parallel native BarcodeDetector scan against the live high-resolution camera frame where the browser supports it. The existing html5-qrcode scanner remains the fallback.
- Increased the QR scan region to 97% of the available viewfinder and improved scan feedback.
