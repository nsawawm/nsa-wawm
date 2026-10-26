(function () {
  "use strict";
  function parsePayload(raw) {
    const text = String(raw || "").trim();
    if (!text) return {};
    try {
      const parsed = new URL(text);
      const p = parsed.searchParams;
      return {
        nssNumber: p.get("nssNumber") || p.get("nss") || p.get("NSS") || "",
        type: p.get("type") || p.get("service") || "",
        month: p.get("month") || "",
        year: p.get("year") || "",
        identifier: p.get("identifier") || ""
      };
    } catch (_) {}
    try {
      const data = JSON.parse(text);
      if (data && typeof data === "object") return data;
    } catch (_) {}
    // A plain NSS number is accepted as a prefill only; the user must confirm.
    if (/^[A-Za-z0-9-]{6,30}$/.test(text)) return { nssNumber: text };
    return {};
  }

  window.processQR = function (raw) {
    const data = parsePayload(raw);
    const nss = String(data.nssNumber || data.nss || "").trim();
    if (!nss) {
      if (typeof notify === "function") notify("The QR code did not contain a recognised NSS number or portal link.", "error");
      return;
    }
    const input = document.getElementById("nss");
    const service = document.getElementById("service");
    if (input) input.value = nss;
    const type = String(data.type || "").toLowerCase();
    if (service && (type === "monthly" || type === "annual" || type === "registration")) {
      service.value = type;
      if (typeof handleServiceChange === "function") handleServiceChange();
    }
    if (type === "monthly") {
      const month = document.getElementById("evaluationMonth");
      const year = document.getElementById("evaluationYear");
      if (month && data.month) month.value = String(data.month);
      if (year && data.year) year.value = String(data.year);
    }
    if (typeof notify === "function") {
      notify("QR code read. Confirm the personnel number and service, then select CONTINUE.", "success");
    }
  };
})();
