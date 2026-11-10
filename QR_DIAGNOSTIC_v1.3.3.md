# QR reliability diagnostic: v1.3.3

## Finding from the supplied October 2026 monthly QR photograph

The QR symbol is decodable from the supplied photograph. The decoded payload is a relative route with a malformed prefix (`undefined/home/verification`) followed by query parameters. The payload includes an NSS number, `type=monthly`, a month, a year and an identifier.

The previous `assets/qr-router.js` attempted `new URL(payload)` without a base URL. That throws for a relative/malformed route. It then attempted JSON parsing and plain-NSS matching, neither of which applies to this payload. As a result, a QR can be optically decoded but still be rejected by the portal as unrecognised.

## v1.3.3 changes

- Parse query parameters from absolute URLs, relative paths and malformed relative routes without navigating to the supplied route.
- Extract `nssNumber`, service type, month, year and identifier.
- Retain the existing `continuePortal()` flow so QR entry follows the same verification/OTP and service prechecks as manual entry.
- Run the browser-native `BarcodeDetector` in parallel against the live camera video when supported. Keep html5-qrcode as the cross-browser decoder.
- Increase the scan region to 97% of the available viewfinder and improve the on-screen scan instructions.

## Limits

The supplied photograph proves that the QR payload can be decoded by an independent decoder. It does not prove that every target phone/browser supports `BarcodeDetector`, autofocus controls or the requested camera resolution. Live-device testing remains necessary.
