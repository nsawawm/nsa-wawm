(function () {
  "use strict";
  const ROLE_ACCESS = {
    "ADMIN": ["ADMIN", "SUPER ADMIN"],
    "SUPER ADMIN": ["SUPER ADMIN"],
    "NSA OFFICER": ["NSA OFFICER", "ADMIN", "SUPER ADMIN"],
    "EVALUATION OFFICER": ["EVALUATION OFFICER", "ADMIN", "SUPER ADMIN"],
    "DATA ENTRY": ["DATA ENTRY", "ADMIN", "SUPER ADMIN"]
  };

  window.requireLogin = function (requiredRole, callback, deniedCallback) {
    window.requireAnyRole([requiredRole], callback, deniedCallback);
  };

  window.requireAnyRole = function (roles, callback, deniedCallback) {
    const token = typeof getUserSession === "function" ? getUserSession() : "";
    if (!token) {
      if (typeof deniedCallback === "function") deniedCallback(new Error("No active user session."));
      window.redirectLogin();
      return;
    }
    google.script.run
      .withFailureHandler(function (error) {
        if (typeof deniedCallback === "function") deniedCallback(error);
        if (typeof clearUserSession === "function") clearUserSession();
        window.redirectLogin();
      })
      .withSuccessHandler(function (session) {
        if (!session || session.valid !== true) {
          if (typeof deniedCallback === "function") deniedCallback(new Error("Session is invalid or expired."));
          if (typeof clearUserSession === "function") clearUserSession();
          window.redirectLogin();
          return;
        }
        const role = String(session.role || "").trim().toUpperCase();
        const allowed = (roles || []).some(function (required) {
          const normal = String(required || "").trim().toUpperCase();
          const permitted = ROLE_ACCESS[normal] || [normal];
          return permitted.indexOf(role) >= 0;
        });
        if (allowed) {
          if (typeof saveUserRole === "function") saveUserRole(role);
          if (typeof callback === "function") callback(session);
          return;
        }
        if (typeof deniedCallback === "function") deniedCallback(new Error("You do not have permission to access this page."));
        if (typeof notify === "function") notify("You do not have permission to access this page.", "error");
        setTimeout(window.redirectLogin, 900);
      })
      .validateSession(token);
  };

  window.redirectLogin = function () {
    if (typeof clearUserSession === "function") clearUserSession();
    window.openPage("login");
  };

  window.openDashboard = function (role) {
    const normal = String(role || "").trim().toUpperCase();
    const page = normal === "SUPER ADMIN" || normal === "ADMIN"
      ? "admin"
      : normal === "DATA ENTRY" ? "master-import" : "home";
    window.openPage(page);
  };

  window.logout = function () {
    const token = typeof getUserSession === "function" ? getUserSession() : "";
    if (typeof clearUserSession === "function") clearUserSession();
    if (!token) {
      window.redirectLogin();
      return;
    }
    google.script.run
      .withFailureHandler(function (error) {
        console.error("[NSA AUTH] Logout request failed:", error);
        window.redirectLogin();
      })
      .withSuccessHandler(function () {
        window.redirectLogin();
      })
      .logoutSystemUser(token);
  };
})();
