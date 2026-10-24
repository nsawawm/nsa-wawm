(function () {
  "use strict";

  function apiUrl() {
    return window.NSA_CONFIG && String(window.NSA_CONFIG.apiUrl || "").trim();
  }

  async function post(body) {
    const endpoint = apiUrl();
    if (!endpoint) {
      throw new Error("The HTTPS API gateway is not configured. Set apiUrl in assets/config.js.");
    }
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    let result;
    try { result = await response.json(); }
    catch (_) { throw new Error("The API gateway returned an unreadable response."); }
    if (!response.ok) {
      throw new Error(result && result.message ? result.message : "The API request failed.");
    }
    return result;
  }

  function runner(handlers) {
    const state = Object.assign({ success: null, failure: null, userObject: null }, handlers || {});
    return new Proxy({}, {
      get: function (_target, property) {
        if (property === "withSuccessHandler") {
          return function (callback) {
            return runner(Object.assign({}, state, { success: callback }));
          };
        }
        if (property === "withFailureHandler") {
          return function (callback) {
            return runner(Object.assign({}, state, { failure: callback }));
          };
        }
        if (property === "withUserObject") {
          return function (value) {
            return runner(Object.assign({}, state, { userObject: value }));
          };
        }
        if (property === "then") return undefined;

        return function () {
          const args = Array.prototype.slice.call(arguments);
          post({ action: "invoke", method: String(property), args: args })
            .then(function (value) {
              if (typeof state.success === "function") state.success(value, state.userObject);
            })
            .catch(function (error) {
              if (typeof state.failure === "function") state.failure(error, state.userObject);
              else console.error("[NSA API]", property, error);
            });
        };
      }
    });
  }

  function readLocation() {
    const parameters = {};
    new URLSearchParams(window.location.search).forEach(function (value, key) {
      parameters[key] = value;
    });
    return { parameter: parameters, hash: window.location.hash || "" };
  }

  window.google = window.google || {};
  window.google.script = window.google.script || {};
  window.google.script.run = runner({});
  window.google.script.url = {
    getLocation: function (callback) {
      if (typeof callback === "function") callback(readLocation());
    }
  };

  // A small explicit helper for new GitHub pages using action/payload requests.
  window.NSA_API = {
    request: function (action, payload) {
      return post({ action: action, payload: payload || {} });
    },
    invoke: function (method, args) {
      return post({ action: "invoke", method: method, args: args || [] });
    }
  };
})();
