/*
 * NSA WAWM frontend configuration.
 * Set apiUrl to the deployed Cloudflare Worker endpoint, e.g.
 * https://nsa-wawm-api.<your-subdomain>.workers.dev/api
 * Do not put Apps Script URLs, passwords, API keys or secrets in this file.
 */
window.NSA_CONFIG = Object.assign({
  apiUrl: "https://nsa-wawm-api.nsa-wawm.workers.dev",
  homeUrl: "./index.html",
  loginUrl: "./login.html",
  personnelUrl: "./personnel.html",
  otpUrl: "./otp.html",
  successUrl: "./success.html",
  cameraUrl: "https://nsawawm.github.io/camera-test/"
}, window.NSA_CONFIG || {});

