(function () {
  "use strict";
  const ROUTES = {
    home: "index.html",
    login: "login.html",
    register: "register.html",
    otp: "otp.html",
    personnel: "personnel.html",
    success: "success.html",
    "qr-scanner": "qr-scanner.html",
    "monthly-evaluation": "monthly-evaluation.html",
    "annual-evaluation": "annual-evaluation.html",
    verification: "verification.html",
    admin: "admin.html",
    "personnel-management": "personnel-management.html",
    "master-import": "master-import.html",
    "batch-management": "batch-management.html",
    "allowance-management": "allowance-management.html",
    evaluations: "evaluations.html",
    reports: "reports.html",
    certification: "certification.html",
    users: "users.html",
    settings: "settings.html",
    "user-form": "user-form.html",
    "batch-form": "batch-form.html",
    "personnel-profile": "personnel-profile.html",
    "evaluation-calendar": "evaluation-calendar.html",
    "activity-log": "activity-log.html",
    communications: "communications.html"
  };

  window.openPage = function (page, params) {
    if (!page) {
      console.error("[NSA ROUTER] Missing page name.");
      return;
    }
    const key = String(page).trim().replace(/\.html$/i, "");
    const filename = ROUTES[key] || (key + ".html");
    const target = new URL(filename, window.location.href);
    target.search = "";
    Object.keys(params || {}).forEach(function (name) {
      const value = params[name];
      if (value !== undefined && value !== null && value !== "") {
        target.searchParams.set(name, String(value));
      }
    });
    window.location.assign(target.toString());
  };

  window.currentPage = function () {
    const queryPage = new URLSearchParams(window.location.search).get("page");
    if (queryPage) return queryPage;
    const filename = window.location.pathname.split("/").pop() || "index.html";
    const page = filename.replace(/\.html$/i, "");
    return page === "index" ? "home" : page;
  };
})();
