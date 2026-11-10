# NSA WAWM DRS v1.3.3

This package retains the existing NSA WAWM DRS v1.3 application and adds corrections to QR routing and monthly office capture-code handoff.

## Deployment
1. Deploy the contents of this ZIP to the existing DRS hosting location, preserving the current Apps Script project and its configured properties.
2. Deploy `Code.gs` and the HTML files to the existing Apps Script project as you normally do. Do not create a new project or replace production data.
3. Replace the GitHub Pages camera application's `camera-test/index.html` with the included `camera-test/index.html`, then commit and push. The deployed camera URL remains `https://nsawawm.github.io/camera-test/`.
4. Test registration, monthly evaluation and annual evaluation QR codes on a phone over HTTPS.
5. Test monthly capture-code scanning after confirming the monthly evaluation precheck succeeds. The scanner opens in a popup and returns the code to the monthly evaluation page using `postMessage`; the page then initiates the existing submission API call.

## Changes in v1.3.2
- QR scans on the Home page now invoke the same `continuePortal()` handler as manual NSS entry and the CONTINUE button. This preserves the existing registration OTP workflow and monthly/annual evaluation server-side prechecks.
- Monthly office capture-code scanning now uses a popup-to-opener message handoff. The fixed Apps Script return-host allowlist and same-tab redirect are no longer used for this workflow.
- A valid six-character code received from the camera is inserted into the monthly evaluation form and triggers the existing `submitEvaluation()` function automatically.
- QR scanning requests higher camera resolution, uses a larger decode region, increases scan frequency, prefers the rear camera and requests continuous focus/exposure where supported.
- The camera scanner library is pinned to html5-qrcode 2.3.8 for reproducible deployment.

## Device limitations
Actual camera resolution, autofocus, exposure controls and torch availability depend on the phone, browser and camera hardware. The browser may negotiate a lower resolution than requested.

## Security and operational notes
- The camera popup accepts messages only from the configured GitHub Pages camera origin and the exact popup window opened by the monthly evaluation page.
- The Home page retains its existing origin and popup-source checks for QR messages.
- The monthly submission continues to use the existing server-side `captureEvaluationSubmission` API and existing eligibility/session checks.
- This package does not verify live OTP delivery or production API submission. Perform the acceptance tests below before replacing the live deployment.

## Acceptance tests
1. Registration QR: scan a registration QR. Confirm the Home page automatically starts the same registration request as manual entry, sends OTP and opens the OTP page.
2. Monthly QR: scan a monthly QR. Confirm the monthly precheck runs and the monthly evaluation page opens without another CONTINUE click.
3. Annual QR: scan an annual QR. Confirm the annual precheck runs and the annual evaluation page opens without another CONTINUE click.
4. Dense QR: scan a dense/high-version QR under good light. Confirm the scanner recognises the complete payload.
5. Monthly capture code: open SCAN CODE, read a valid six-character code and select USE THIS CODE. Confirm the camera closes, the code reaches the monthly evaluation page and the existing submission request starts automatically.
6. Failed submission: use an invalid/expired code or a non-eligible evaluation. Confirm the page displays the server error and does not report success.


## v1.3.3 QR reliability update
- Added parsing for malformed relative QR payloads such as `undefined/home/verification?...`; NSS number, service type, month, year and identifier are extracted without navigating to the malformed URL.
- Added a parallel native BarcodeDetector scan against the live high-resolution camera frame where the browser supports it. The existing html5-qrcode scanner remains the fallback.
- Increased the QR scan region to 97% of the available viewfinder and improved scan feedback.
