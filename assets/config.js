
/*
 * NSA WAWM frontend configuration.
 * Public endpoint only. Never put gateway secrets here.
 */
window.NSA_CONFIG = Object.assign({
  apiUrl: "https://nsa-wawm-api.nsa-wawm.workers.dev/",
  homeUrl: "./index.html",
  loginUrl: "./login.html",
  personnelUrl: "./personnel.html",
  otpUrl: "./otp.html",
  successUrl: "./success.html",
  cameraUrl: "https://nsawawm.github.io/camera-test/"
}, window.NSA_CONFIG || {});
