NSA WAWM registration UI correction

Source basis: NSA_WAWM_GitHub_Migration_Package_API_Corrected.zip.
The original personnel/success pages were restored from that backup before UI-only changes.

Changes:
1. Header logo path standardized to ./assets/my_logo.png to match the officer home page.
2. Personnel section icons replaced with inline SVG icons so they do not depend on Unicode glyphs or page encoding.
3. Decorative arrows/check/download/print symbols in the four registration pages use HTML entities.
4. Registration and OTP receive the same favicon path.

Place the existing my_logo.png from the GitHub site in assets/my_logo.png. No backend/API logic was changed by this UI correction.
