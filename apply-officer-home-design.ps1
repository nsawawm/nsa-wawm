# NSA WAWM Officer Home Design Patch - corrected PowerShell version
# Run this from the github-pages folder that contains index.html.

$ErrorActionPreference = "Stop"

if (-not (Test-Path ".\index.html")) {
    throw "index.html was not found. Open PowerShell in the github-pages folder first."
}

$p = Join-Path (Get-Location) "index.html"
$backup = Join-Path (Get-Location) "index.html.backup-before-officer-home-redesign"

# Preserve the current file before making any change.
Copy-Item -LiteralPath $p -Destination $backup -Force
Write-Host "Backup created: $backup"

# Read the complete HTML.
$text = Get-Content -LiteralPath $p -Raw -Encoding UTF8

$bodyStart = $text.IndexOf("<body>")
if ($bodyStart -lt 0) { throw "Could not locate <body> in index.html" }

$scriptStart = $text.IndexOf("<script", $bodyStart)
if ($scriptStart -lt 0) { throw "Could not locate the existing application <script> block after <body>" }

# Preserve the existing JavaScript exactly from the first script after <body> onward.
$scriptTail = $text.Substring($scriptStart)
$scriptTail = [regex]::Replace($scriptTail, '\s*</body>\s*</html>\s*$', '', [System.Text.RegularExpressions.RegexOptions]::Singleline)

# Use the local logo instead of the old remote logo URL.
$text = $text.Replace("https://lh3.googleusercontent.com/d/10gIO9KpoqufMr8xWVh6ZfOBgDRU-KUN3", "./assets/my_logo.png")

$targetStyle = @'
:root {
  --nsa-green: #006b3f;
  --nsa-deep: #004d2c;
  --nsa-bright: #28c96b;
  --nsa-gold: #ffdc00;
  --nsa-white: #fff;
  --nsa-ink: #123b2c;
  --nsa-muted: #5c6878;
  --nsa-line: #dce8e2;
}
* { box-sizing: border-box; }
html { min-height: 100%; }
body {
  min-height: 100vh;
  min-height: 100svh;
  margin: 0;
  overflow-x: hidden;
  font-family: Roboto, "Segoe UI", Arial, sans-serif;
  color: #18352a;
  background:
    linear-gradient(135deg, transparent 0 53%, rgba(40,201,107,.88) 53% 66%, transparent 66%),
    linear-gradient(135deg, #005b36 0%, #007747 52%, #005a35 100%);
}
button, input, select { font: inherit; }
button { cursor: pointer; }
button:disabled { cursor: wait; opacity: .7; }

.officer-page {
  display: flex;
  flex-direction: column !important;
  width: 100%;
  min-height: 100vh;
  min-height: 100svh;
  margin: 0 !important;
  padding: 22px 22px 0 !important;
  background: transparent !important;
}
.officer-header {
  position: relative;
  z-index: 1;
  width: min(1120px, 100%);
  margin: 0 auto;
  overflow: hidden;
  border-radius: 16px 16px 0 0;
  color: #fff;
  background: var(--nsa-bright);
  box-shadow: 0 8px 22px rgba(0,30,18,.12);
}
.officer-header::before,
.officer-header::after {
  content: "";
  position: absolute;
  z-index: 0;
  border: 1px solid rgba(255,255,255,.13);
  border-radius: 50%;
  pointer-events: none;
}
.officer-header::before {
  width: 290px;
  height: 290px;
  top: -190px;
  left: -145px;
  box-shadow: 0 0 0 26px rgba(255,255,255,.035), 0 0 0 54px rgba(255,255,255,.025);
}
.officer-header::after {
  width: 230px;
  height: 230px;
  right: -150px;
  bottom: -175px;
  box-shadow: 0 0 0 28px rgba(255,255,255,.035);
}
.header-inner {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  min-height: 132px;
  padding: 22px 28px;
}
.brand-identity {
  display: flex;
  align-items: center;
  gap: 18px;
  min-width: 0;
}
.officer-logo {
  display: block;
  flex: 0 0 auto;
  width: 74px !important;
  height: 74px !important;
  margin: 0 !important;
  padding: 5px;
  object-fit: contain !important;
  background: #fff;
  border-radius: 5px;
  box-shadow: 0 3px 8px rgba(0,0,0,.08);
}
.brand-copy { min-width: 0; }
.brand-kicker {
  margin: 0 0 6px !important;
  color: rgba(255,255,255,.94) !important;
  font-size: 10px;
  font-weight: 850;
  letter-spacing: 1.7px;
  line-height: 1.35;
  text-transform: uppercase;
}
.officer-brand-title,
.officer-header h1.title {
  margin: 0 !important;
  color: #fff !important;
  font-size: clamp(23px, 2.5vw, 31px) !important;
  font-weight: 850 !important;
  letter-spacing: -.45px;
  line-height: 1.15 !important;
}
.brand-description {
  margin: 7px 0 0 !important;
  color: rgba(255,255,255,.94) !important;
  font-size: 12px !important;
  line-height: 1.45 !important;
}
.header-user {
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
  max-width: 260px;
}
#loggedOfficer {
  max-width: 100%;
  margin: 0 !important;
  padding: 7px 12px;
  border: 1px solid rgba(255,255,255,.46);
  border-radius: 999px;
  color: #fff !important;
  font-size: 11px !important;
  line-height: 1.35 !important;
  overflow-wrap: anywhere;
  text-align: right;
}
#loggedOfficer:empty { display: none; }
#loggedOfficer strong { color: var(--nsa-gold); }
.officer-logout {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 36px;
  padding: 8px 15px !important;
  border: 1px solid rgba(255,255,255,.62) !important;
  border-radius: 999px !important;
  background: rgba(0,0,0,.08) !important;
  color: #fff !important;
  box-shadow: none !important;
  font-size: 10px !important;
  font-weight: 850 !important;
  letter-spacing: .5px;
}
.officer-logout:hover { background: rgba(0,0,0,.18) !important; }
.officer-logout:focus-visible,
.qr-card button:focus-visible,
.continue-btn:focus-visible {
  outline: 3px solid var(--nsa-gold);
  outline-offset: 3px;
}

.officer-main {
  width: min(1120px, 100%);
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  margin: 0 auto !important;
  padding: 0 0 26px !important;
}
.officer-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  width: 100%;
  margin: 0 auto !important;
  padding: 0 !important;
  overflow: hidden;
  border: 0 !important;
  border-radius: 0 0 16px 16px !important;
  background: #fff !important;
  box-shadow: 0 18px 42px rgba(0,30,18,.18);
}
.qr-panel,
.manual-panel {
  min-width: 0;
  padding: clamp(24px, 3vw, 38px);
}
.qr-panel {
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: #f7fbf8;
}
.panel-eyebrow {
  display: block;
  margin: 0 0 8px;
  color: #087044;
  font-size: 10px;
  font-weight: 850;
  letter-spacing: 1.7px;
  line-height: 1.4;
  text-transform: uppercase;
}
.panel-heading {
  margin: 0;
  color: var(--nsa-ink);
  font-size: clamp(22px, 2.5vw, 30px);
  font-weight: 850;
  letter-spacing: -.4px;
  line-height: 1.15;
}
.panel-description {
  margin: 10px 0 22px;
  color: #596b61;
  font-size: 13px;
  line-height: 1.6;
}
.qr-card {
  display: grid;
  grid-template-columns: 64px minmax(0,1fr);
  grid-template-rows: auto auto auto;
  align-items: center;
  column-gap: 14px;
  row-gap: 4px;
  width: 100%;
  margin: 0 !important;
  padding: 18px !important;
  border: 1px solid #dcebe3 !important;
  border-radius: 16px !important;
  background: #fff !important;
  box-shadow: 0 8px 22px rgba(15,72,45,.06) !important;
}
.qr-image-circle {
  grid-column: 1;
  grid-row: 1 / 3;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  overflow: hidden;
  border-radius: 50%;
  background: #e3f7ec;
}
.qr-image-circle img {
  display: block;
  width: 72%;
  height: 72%;
  object-fit: contain;
}
.qr-card h3 {
  grid-column: 2;
  grid-row: 1;
  margin: 0 !important;
  color: var(--nsa-ink) !important;
  text-align: left;
  font-size: 18px !important;
  font-weight: 850 !important;
  letter-spacing: -.2px;
  line-height: 1.2;
}
.qr-card p {
  grid-column: 2;
  grid-row: 2;
  align-self: start;
  margin: 3px 0 0 !important;
  padding: 0 !important;
  color: #5b6b63 !important;
  text-align: left;
  font-size: 11px !important;
  line-height: 1.45;
}
.qr-card button {
  grid-column: 1 / -1;
  grid-row: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  min-height: 47px;
  margin: 13px 0 0 !important;
  padding: 10px 14px;
  border: 0 !important;
  border-radius: 999px !important;
  background: var(--nsa-green) !important;
  color: #fff !important;
  box-shadow: 0 4px 0 rgba(0,35,20,.08) !important;
  font-size: 12px !important;
  font-weight: 900 !important;
  letter-spacing: .55px;
}
.qr-card button:hover { background: var(--nsa-deep) !important; }
.button-arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  flex: 0 0 24px;
  border-radius: 50%;
  background: var(--nsa-gold);
  color: var(--nsa-deep);
  font-size: 17px;
  line-height: 1;
}
.qr-helper {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  margin-top: 15px;
  color: #65766d;
  font-size: 11px;
  line-height: 1.5;
}
.qr-helper-mark {
  display: inline-flex;
  flex: 0 0 18px;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #e3f7ec;
  color: #087044;
  font-size: 11px;
  font-weight: 900;
}

.manual-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--nsa-green);
  color: #fff;
}
.manual-content {
  width: 100%;
  max-width: 430px;
  margin: auto;
}
.manual-panel .panel-eyebrow { color: #bdebd1; }
.manual-panel .panel-heading { color: #fff; }
.manual-panel .panel-description {
  margin-bottom: 21px;
  color: rgba(255,255,255,.82);
}
.visually-hidden {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0,0,0,0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}
#service,
#nss,
.monthly-period-fields {
  display: block;
  width: 100% !important;
  min-width: 0;
  min-height: 47px;
  margin: 0 0 12px !important;
  padding: 0 15px !important;
  border: 1.4px solid rgba(255,255,255,.92) !important;
  border-radius: 12px !important;
  outline: none;
  background: rgba(255,255,255,.98) !important;
  color: #163d2d !important;
  box-shadow: none !important;
  font-size: 13px !important;
  transition: border-color .15s ease, box-shadow .15s ease;
}
#service { appearance: auto; }
#service option,
.monthly-period-fields select option {
  color: #123b2c;
  background: #fff;
}
#service:focus,
#nss:focus,
.monthly-period-fields select:focus {
  border-color: var(--nsa-gold) !important;
  box-shadow: 0 0 0 3px rgba(255,220,0,.18) !important;
}
#nss::placeholder { color: #718278; opacity: 1; }
.monthly-period-fields {
  height: auto;
  min-height: 0;
  padding: 14px !important;
  border-color: rgba(255,255,255,.32) !important;
  border-radius: 13px !important;
  background: rgba(0,0,0,.09) !important;
  color: #fff !important;
  font-size: 12px !important;
}
.monthly-period-fields label {
  display: block;
  margin: 0 0 6px;
  color: rgba(255,255,255,.95);
  font-size: 12px;
  font-weight: 750;
}
.monthly-period-fields select {
  display: block;
  width: 100%;
  min-height: 40px;
  margin: 0 0 11px;
  padding: 7px 10px;
  border: 1px solid #dce5ed;
  border-radius: 9px;
  background: #fff;
  color: #123b2c;
  font-size: 13px;
}
.monthly-period-fields select:last-child { margin-bottom: 0; }
.continue-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 11px;
  width: 100% !important;
  min-height: 48px;
  margin: 5px auto 0 !important;
  padding: 10px 16px;
  border: 0 !important;
  border-radius: 999px !important;
  background: var(--nsa-gold) !important;
  color: #073f2d !important;
  box-shadow: 0 4px 0 rgba(0,35,20,.1) !important;
  font-size: 12px !important;
  font-weight: 900 !important;
  letter-spacing: .8px;
}
.continue-btn:hover { background: #ffe84b !important; }
#message {
  width: 100% !important;
  min-height: 0;
  margin: 10px auto 0 !important;
  color: #fff;
  text-align: center;
  overflow-wrap: anywhere;
  font-size: 11px;
  line-height: 1.45;
}

/* Keep the shared footer include in normal page flow; it must not overlay the controls. */
#officerHome > footer,
#officerHome > .footer,
#officerHome > .app-footer,
#officerHome footer,
#officerHome .footer,
#officerHome .app-footer {
  position: static !important;
  inset: auto !important;
  transform: none !important;
  width: min(1120px, 100%);
  flex: 0 0 auto;
  margin: auto auto 0 !important;
  padding: 13px 0 14px;
  border-top: 1px solid rgba(255,255,255,.55);
  color: rgba(255,255,255,.8);
  font-size: 11px;
}
#officerHome footer a { color: inherit; }

#duplicateModal {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: none;
  align-items: center;
  justify-content: center;
  padding: 18px;
  background: rgba(0,30,18,.72);
}
#duplicateModal .duplicate-card {
  width: min(520px, 100%);
  max-height: calc(100dvh - 36px);
  overflow: auto;
  padding: 24px;
  border: 1px solid #d9ebe6;
  border-radius: 18px;
  background: #fff;
  color: #17372b;
  box-shadow: 0 20px 60px rgba(0,0,0,.25);
}
#duplicateModal h2 { margin-top: 0; color: #8b4d00; font-size: 20px; }
#duplicateDetails {
  padding: 12px;
  border-radius: 10px;
  background: #f1f7f4;
  white-space: pre-line;
  overflow-wrap: anywhere;
  font-size: 13px;
  line-height: 1.6;
}
#duplicateModal .duplicate-modal-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 18px;
}
#duplicateModal .duplicate-modal-actions button {
  min-height: 42px;
  padding: 10px 14px;
  border: 0;
  border-radius: 10px;
  background: var(--nsa-green);
  color: #fff;
  font-size: 12px;
  font-weight: 800;
}
#duplicateModal #duplicateHomeButton { background: #e8f1ed; color: var(--nsa-green); }
#duplicateModal .duplicate-modal-actions button:focus-visible {
  outline: 3px solid var(--nsa-gold);
  outline-offset: 2px;
}

@media (max-width: 760px) {
  .officer-page {
    min-height: 100vh;
    min-height: 100svh;
    padding: 12px 12px 0 !important;
  }
  .officer-header { border-radius: 13px 13px 0 0; }
  .header-inner {
    align-items: flex-start;
    gap: 12px;
    min-height: 0;
    padding: 16px;
  }
  .brand-identity { align-items: flex-start; gap: 11px; padding-right: 0; }
  .officer-logo {
    width: 52px !important;
    height: 52px !important;
    padding: 4px;
  }
  .brand-kicker { margin-bottom: 5px !important; font-size: 8px; letter-spacing: 1px; }
  .officer-header h1.title { font-size: clamp(17px, 4.7vw, 23px) !important; line-height: 1.12 !important; }
  .brand-description { margin-top: 5px !important; font-size: 10px !important; line-height: 1.35 !important; }
  .header-user {
    align-items: flex-end;
    gap: 7px;
    max-width: 125px;
  }
  #loggedOfficer { padding: 5px 7px; font-size: 9px !important; text-align: right; }
  .officer-logout { min-height: 30px; padding: 6px 9px !important; font-size: 9px !important; }
  .officer-main {
    display: block;
    padding-bottom: 18px !important;
  }
  .officer-card {
    grid-template-columns: minmax(0,1fr);
    grid-template-rows: auto auto;
    border-radius: 0 0 13px 13px !important;
  }
  .qr-panel, .manual-panel { padding: 22px 18px; }
  .panel-heading { font-size: 23px; }
  .panel-description { margin: 8px 0 16px; font-size: 12px; }
  .qr-card { grid-template-columns: 54px minmax(0,1fr); gap: 3px 12px; padding: 14px !important; }
  .qr-image-circle { width: 54px; height: 54px; }
  .qr-card h3 { font-size: 16px !important; }
  .qr-card p { font-size: 10px !important; }
  .qr-card button { min-height: 43px; margin-top: 10px !important; font-size: 11px !important; }
  .manual-panel .panel-description { margin-bottom: 16px; }
  #service, #nss { min-height: 46px; margin-bottom: 10px !important; font-size: 13px !important; }
  .continue-btn { min-height: 46px; }
  #officerHome > footer,
  #officerHome > .footer,
  #officerHome > .app-footer,
  #officerHome footer,
  #officerHome .footer,
  #officerHome .app-footer {
    width: 100%;
    padding: 11px 0 13px;
    font-size: 10px;
    overflow-wrap: anywhere;
  }
}
@media (max-width: 420px) {
  .officer-page { padding: 8px 8px 0 !important; }
  .header-inner { padding: 13px 11px; gap: 8px; }
  .brand-identity { gap: 8px; }
  .officer-logo { width: 43px !important; height: 43px !important; }
  .brand-kicker { font-size: 7px; letter-spacing: .7px; }
  .officer-header h1.title { font-size: 17px !important; }
  .brand-description { max-width: 215px; font-size: 9px !important; }
  .header-user { max-width: 96px; }
  #loggedOfficer { font-size: 8px !important; padding: 4px 6px; }
  .officer-logout { min-height: 27px; padding: 5px 7px !important; font-size: 8px !important; }
  .qr-panel, .manual-panel { padding: 19px 13px; }
  .panel-heading { font-size: 21px; }
  .qr-card { grid-template-columns: 45px minmax(0,1fr); gap: 3px 9px; padding: 11px !important; }
  .qr-image-circle { width: 45px; height: 45px; }
  .qr-card h3 { font-size: 15px !important; }
  .qr-card p { font-size: 9px !important; }
  #duplicateModal .duplicate-card { padding: 18px; }
  #duplicateModal .duplicate-modal-actions { justify-content: stretch; }
  #duplicateModal .duplicate-modal-actions button { flex: 1 1 100%; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { transition: none !important; }
}
'@

# Remove a previous copy of this patch style, if the script is run more than once.
$text = [regex]::Replace(
    $text,
    '\s*<style id="officer-home-target-style">.*?</style>',
    '',
    [System.Text.RegularExpressions.RegexOptions]::Singleline
)

$styleBlock = "`r`n<style id='officer-home-target-style'>`r`n" + $targetStyle + "`r`n</style>`r`n"
$headClose = $text.IndexOf("</head>")
if ($headClose -lt 0) { throw "Could not locate </head> in index.html" }
$text = $text.Substring(0, $headClose) + $styleBlock + $text.Substring($headClose)

$targetBody = @'
<div id="officerHome" class="officer-page" style="display:none;">
  <header class="officer-header" aria-labelledby="homeTitle">
    <div class="header-inner">
      <div class="brand-identity">
        <img
          src="./assets/my_logo.png"
          class="officer-logo"
          alt="National Service Authority logo"
        >
        <div class="brand-copy">
          <p class="brand-kicker">National Service Authority</p>
          <h1 class="title" id="homeTitle">NSA Personnel Registration</h1>
          <p class="brand-description">Wassa Amenfi West Municipal Secretariat Â· Officer Portal</p>
        </div>
      </div>
      <div class="header-user">
        <p id="loggedOfficer" aria-live="polite"></p>
        <button onclick="logout()" class="officer-logout" type="button" aria-label="Log out of the officer portal">â‡¥ &nbsp; LOGOUT</button>
      </div>
    </div>
  </header>

  <main class="officer-main">
    <div class="officer-card">
      <section class="qr-panel" aria-labelledby="qrPanelHeading">
        <span class="panel-eyebrow">Quick action</span>
        <h2 class="panel-heading" id="qrPanelHeading">Scan an official QR code</h2>
        <p class="panel-description">Use your camera to open registration or evaluation directly from an official NSA QR code.</p>

        <section class="qr-card" aria-labelledby="qrCardHeading">
          <div class="qr-image-circle">
            <img
              id="qrScanIllustration"
              alt="QR code scanning illustration"
              src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='none' stroke='%23006b43' stroke-width='5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M15 35V18a3 3 0 0 1 3-3h17M65 15h17a3 3 0 0 1 3 3v17M85 65v17a3 3 0 0 1-3 3H65M35 85H18a3 3 0 0 1-3-3V65'/%3E%3Cpath d='M27 27h16v16H27zM57 27h16v16H57zM27 57h16v16H27zM57 57h5v5h-5zM68 57h5v16h-5zM57 68h5v5h-5z'/%3E%3Cpath d='M47 50h6M50 47v6'/%3E%3C/svg%3E"
            >
          </div>
          <h3 id="qrCardHeading">Scan QR Code</h3>
          <p>Scan an official NSA registration or evaluation QR code.</p>
          <button onclick="openQRScanner()" type="button">
            <span>OPEN CAMERA</span>
            <span class="button-arrow" aria-hidden="true">â†’</span>
          </button>
        </section>

        <div class="qr-helper">
          <span class="qr-helper-mark" aria-hidden="true">i</span>
          <span>Keep the complete QR code inside the camera frame. The portal will route you to the appropriate workflow after scanning.</span>
        </div>
      </section>

      <section class="manual-panel" aria-labelledby="manualPanelHeading">
        <div class="manual-content">
          <span class="panel-eyebrow">Manual entry</span>
          <h2 class="panel-heading" id="manualPanelHeading">Enter details manually</h2>
          <p class="panel-description">Choose a service and enter the personnel NSS number to continue.</p>

          <label for="service" class="visually-hidden">Select service</label>
          <select id="service" onchange="handleServiceChange()" aria-label="Select service">
            <option value="registration">Registration</option>
            <option value="monthly">Monthly Evaluation Submission</option>
            <option value="annual">Annual Evaluation Submission</option>
          </select>

          <label for="nss" class="visually-hidden">NSS Number</label>
          <input id="nss" placeholder="Enter NSS Number" autocomplete="off" aria-label="Enter NSS Number">

          <div id="monthlyPeriodFields" class="monthly-period-fields" style="display:none;">
            <label for="evaluationMonth">Evaluation Month</label>
            <select id="evaluationMonth" style="width:100%;margin-bottom:10px;">
              <option value="1">January</option><option value="2">February</option>
              <option value="3">March</option><option value="4">April</option>
              <option value="5">May</option><option value="6">June</option>
              <option value="7">July</option><option value="8">August</option>
              <option value="9">September</option><option value="10">October</option>
              <option value="11">November</option><option value="12">December</option>
            </select>
            <label for="evaluationYear">Evaluation Year</label>
            <select id="evaluationYear" style="width:100%;"></select>
          </div>

          <button onclick="continuePortal()" class="continue-btn" type="button">
            <span>CONTINUE</span>
            <span class="button-arrow" aria-hidden="true">â†’</span>
          </button>
          <div id="message" role="status" aria-live="polite"></div>
        </div>
      </section>
    </div>
  </main>

  <footer class="admin-footer"><div class="admin-footer-inner"><div class="admin-footer-brand"><strong>NSA Personnel Management System</strong><div>Wassa Amenfi West Municipal Secretariat</div></div><div>Secure personnel administration Â· Â© <span id="footerYear">2026</span> NSA WAWM</div></div></footer>
</div>
<div id="duplicateModal"
     role="dialog"
     aria-modal="true"
     aria-labelledby="duplicateTitle">

  <div class="duplicate-card">

    <h2 id="duplicateTitle">
      âš  Evaluation Already Submitted
    </h2>

    <p id="duplicateMessage">
      A submission already exists for this personnel member
      and evaluation period.
    </p>

    <div id="duplicateDetails"></div>

    <p>
      Do you want to update the existing record or return
      to the home page without making any changes?
    </p>

    <div class="duplicate-modal-actions">

      <button
        type="button"
        id="duplicateHomeButton"
        onclick="returnHomeFromDuplicate()">
        RETURN TO HOME
      </button>

      <button
        type="button"
        id="duplicateUpdateButton"
        onclick="updateDuplicateSubmission()">
        UPDATE EXISTING SUBMISSION
      </button>

    </div>

  </div>
</div>
'@

# Replace only the markup between <body> and the first application script.
# The existing JavaScript remains untouched.
$newBody = "<body>`r`n" + $targetBody + "`r`n`r`n" + $scriptTail + "`r`n</body>`r`n</html>`r`n"
$text = $text.Substring(0, $bodyStart) + $newBody

# UTF-8 output. Windows PowerShell 5.1 writes a UTF-8 BOM, which browsers handle normally.
Set-Content -LiteralPath $p -Value $text -Encoding UTF8

Write-Host "Officer home visual shell applied."
Write-Host "Existing application JavaScript preserved from the first <script> after <body> to the end."
Write-Host "Local logo path applied: ./assets/my_logo.png"
Write-Host "Backup: $backup"

