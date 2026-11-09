# Cloudflare Worker deployment

Replace the existing Worker script with `worker.js`. Preserve the existing Worker environment variables/secrets `ALLOWED_ORIGINS`, `APPS_SCRIPT_EXEC_URL`, and `GATEWAY_SHARED_SECRET`. Never expose `GATEWAY_SHARED_SECRET` in browser code or GitHub Pages.

The Worker retains the original explicit direct-action and invoke-method allowlists, origin validation, POST-only policy, gateway-secret injection and Apps Script forwarding. It additionally requires `application/json` and rejects request bodies larger than 8 MB.
