

/**

 * NSA WAWM API Gateway

 *

 * Architecture:

 * GitHub Pages -> Cloudflare Worker -> Google Apps Script

 *

 * Required Cloudflare settings:

 * ALLOWED_ORIGINS

 * APPS_SCRIPT_EXEC_URL

 * GATEWAY_SHARED_SECRET

 *

 * Never place GATEWAY_SHARED_SECRET in frontend code.

 */

// ============================================================

// 1. EXPLICITLY ALLOWED DIRECT API ACTIONS

// ============================================================

const PUBLIC_ACTIONS = new Set([

  "loginSystemUser",

  "validateSession",

  "logoutSystemUser",

  "openRegistrationPortal",

  "sendRegistrationOTP",

  "createRegistrationHandoff",

  "exchangeRegistrationHandoff",

  "getRegistrationContact",

  "confirmRegistrationOTP",

  "confirmEvaluationOTP",

  "resendOTP",

  "loadRegistrationForm",

  "getEvaluationPrecheck",

  "captureEvaluationSubmission",

  "recordEvaluationLateDecision",

  "approveLateRegistration",

  "getPersonnelPhotoDataUrl",

  "getPersonnelProfile",

  "uploadPersonnelPhoto",

  "submitRegistrationForm",

  "getRegistrationReceipt"

]);

// ============================================================

// 2. EXPLICITLY ALLOWED METHODS FOR THE EXISTING API BRIDGE

//

// These must match the method names in nsaApiInvoke\_()

// in the Apps Script backend.

// ============================================================

const PUBLIC_INVOKE_METHODS = new Set([

  "getApplicationUrl",

  "loginSystemUser",

  "validateSession",

  "logoutSystemUser",

  "openRegistrationPortal",

  "sendRegistrationOTP",

  "createRegistrationHandoff",

  "exchangeRegistrationHandoff",

  "getRegistrationContact",

  "confirmRegistrationOTP",

  "confirmEvaluationOTP",

  "resendOTP",

  "loadRegistrationForm",

  "getEvaluationPrecheck",

  "captureEvaluationSubmission",

  "recordEvaluationLateDecision",

  "approveLateRegistration",

  "getPersonnelPhotoDataUrl",

  "getPersonnelProfile",

  "getAuditLogs",

  "getBrandingSettings",

  "getAdminDashboardAnalytics",

  "getAllowanceStatistics",

  "createBatch",

  "getBatchManagementData",

  "toggleBatchStatus",

  "getActiveBatches",

  "generateCertificationRegister",

  "getCertificationSummary",

  "getCommunicationCampaignHistory",

  "getCommunicationsConfig",

  "previewCommunicationCampaign",

  "processCommunicationCampaignBatch",

  "retryFailedCommunicationCampaign",

  "startCommunicationCampaign",

  "getEvaluationCalendars",

  "getEvaluationDashboardData",

  "getEvaluationFilters",

  "importMasterPersonnel",

  "previewMasterImport",

  "getPersonnelManagementData",

  "getAdminSettings",

  "getDocumentList",

  "saveGeneralSettings",

  "updateEmailConfiguration",

  "updateSMSConfiguration",

  "uploadOfficialDocument",

  "deleteOfficialDocument",

  "addSystemUser",

  "getSystemUsers",

  "resetSystemUserPassword",

  "toggleUserStatus",
  "syncAgenciesFromMaster",
  "getAgencyManagementData",
  "saveAgencyProfile",
  "activateAgencyAccount",
  "getAgencyPortalData",
  "saveAgencyPortalProfile",
  "saveAgencySupervisor",
  "assignAgencySupervisor",
  "createAgencyPersonnelRequest",
  "reviewAgencyPersonnelRequest",
  "getAgencyInformationForPersonnel",
  "sendAgencyCommunication",
  "sendAgencyInfoOTP",
  "confirmAgencyInfoOTP",
  "getAgencyInfoWithAccess",
  "getGeospatialDashboardData",
  "saveAgencyGeolocation",
  "saveMonitoringVisit",
  "getAgencyMonitoringHistory",
  "getGeospatialFilterOptions"

]);

// ============================================================

// 3. JSON RESPONSE HELPER

// ============================================================

function jsonResponse(data, status, headers = {}) {

  return new Response(JSON.stringify(data), {

    status,

    headers: {

      "Content-Type": "application/json; charset=utf-8",

      "Cache-Control": "no-store",

      "X-Content-Type-Options": "nosniff",

      ...headers

    }

  });

}

// ============================================================

// 4. WORKER ENTRY POINT

// ============================================================

export default {

  async fetch(request, env) {

// --------------------------------------------------------

// A. CONFIGURE ALLOWED ORIGINS

// --------------------------------------------------------

    const origin = request.headers.get("Origin") || "";

    const allowedOrigins = String(

      env.ALLOWED_ORIGINS || "https\://nsawawm.github.io"

    )

      .split(",")

      .map(value => value.trim())

      .filter(Boolean);

    const originAllowed = allowedOrigins.includes(origin);

    const corsHeaders = {

      "Access-Control-Allow-Origin": originAllowed

        ? origin

        : "null",

      "Access-Control-Allow-Methods": "POST, OPTIONS",

      "Access-Control-Allow-Headers": "Content-Type",

      "Access-Control-Max-Age": "86400",

      "Vary": "Origin"

    };

// --------------------------------------------------------

// B. HANDLE CORS PREFLIGHT

// --------------------------------------------------------

    if (request.method === "OPTIONS") {

      if (!originAllowed) {

        return new Response("Origin not allowed", {

          status: 403,

          headers: corsHeaders

        });

      }

      const requestedMethod = String(

        request.headers.get("Access-Control-Request-Method") || ""

      ).toUpperCase();

      const requestedHeaders = String(

        request.headers.get("Access-Control-Request-Headers") || ""

      )

        .toLowerCase()

        .split(",")

        .map(value => value.trim())

        .filter(Boolean);

      if (

        requestedMethod &&

        requestedMethod !== "POST"

      ) {

        return new Response("Method not allowed", {

          status: 405,

          headers: corsHeaders

        });

      }

      const unsupportedHeaders = requestedHeaders.filter(

        value => value !== "content-type"

      );

      if (unsupportedHeaders.length > 0) {

        return new Response("Request header not allowed", {

          status: 403,

          headers: corsHeaders

        });

      }

      return new Response(null, {

        status: 204,

        headers: corsHeaders

      });

    }

// --------------------------------------------------------

// C. REJECT UNAUTHORIZED ORIGINS

// --------------------------------------------------------

    if (!originAllowed) {

      return jsonResponse(

        {

          status: "ERROR",

          message: "Origin not allowed."

        },

        403,

        corsHeaders

      );

    }

// --------------------------------------------------------

// D. ACCEPT POST ONLY

// --------------------------------------------------------

    if (request.method !== "POST") {

      return jsonResponse(

        {

          status: "ERROR",

          message: "Use POST for API requests."

        },

        405,

        corsHeaders

      );

    }

// --------------------------------------------------------

// E. VERIFY WORKER CONFIGURATION

// --------------------------------------------------------

    if (!env.APPS_SCRIPT_EXEC_URL) {

      return jsonResponse(

        {

          status: "ERROR",

          message: "Apps Script URL is not configured."

        },

        500,

        corsHeaders

      );

    }

    if (!env.GATEWAY_SHARED_SECRET) {

      return jsonResponse(

        {

          status: "ERROR",

          message: "Gateway authentication is not configured."

        },

        500,

        corsHeaders

      );

    }

// --------------------------------------------------------

// F. PARSE REQUEST JSON

// --------------------------------------------------------

    const contentType = String(request.headers.get("Content-Type") || "").toLowerCase();
    if (!contentType.includes("application/json")) {
      return jsonResponse(
        { status: "ERROR", message: "Content-Type must be application/json." },
        415,
        corsHeaders
      );
    }

    let body;

    try {
      const rawBody = await request.text();
      if (new TextEncoder().encode(rawBody).length > 8388608) {
        return jsonResponse(
          { status: "ERROR", message: "Request body exceeds the 8 MB gateway limit." },
          413,
          corsHeaders
        );
      }
      body = JSON.parse(rawBody);
    } catch (_) {

      return jsonResponse(

        {

          status: "ERROR",

          message: "Invalid JSON request."

        },

        400,

        corsHeaders

      );

    }

    if (

      !body ||

      typeof body !== "object" ||

      Array.isArray(body)

    ) {

      return jsonResponse(

        {

          status: "ERROR",

          message: "The request body must be a JSON object."

        },

        400,

        corsHeaders

      );

    }

// --------------------------------------------------------

// G. VALIDATE REQUEST ACTION

// --------------------------------------------------------

    const action = String(body.action || "").trim();

    if (!action) {

      return jsonResponse(

        {

          status: "ERROR",

          message: "API action is missing."

        },

        400,

        corsHeaders

      );

    }

// --------------------------------------------------------

// H. VALIDATE THE EXISTING GENERIC BRIDGE

//

// "invoke" is allowed only for specifically approved

// methods. Arbitrary Apps Script methods remain blocked.

// --------------------------------------------------------

    if (action === "invoke") {

      const method = String(body.method || "").trim();

      if (!PUBLIC_INVOKE_METHODS.has(method)) {

        return jsonResponse(

          {

            status: "ERROR",

            message: "This API method is not available."

          },

          403,

          corsHeaders

        );

      }

      if (

        body.args !== undefined &&

        !Array.isArray(body.args)

      ) {

        return jsonResponse(

          {

            status: "ERROR",

            message: "Invalid method arguments."

          },

          400,

          corsHeaders

        );

      }

    } else if (!PUBLIC_ACTIONS.has(action)) {

// Unknown direct actions are never forwarded.

      return jsonResponse(

        {

          status: "ERROR",

          message: "This API action is not available."

        },

        403,

        corsHeaders

      );

    }

// --------------------------------------------------------

// I. PREPARE UPSTREAM REQUEST

//

// Overwrite any client-supplied gatewaySecret.

// Only the Worker supplies the configured secret.

// --------------------------------------------------------

    const upstreamBody = {

      ...body,

      gatewaySecret: env.GATEWAY_SHARED_SECRET

    };

// --------------------------------------------------------

// J. CALL GOOGLE APPS SCRIPT

// --------------------------------------------------------

    try {

      const upstream = await fetch(

        env.APPS_SCRIPT_EXEC_URL,

        {

          method: "POST",

          headers: {

            "Content-Type": "application/json",

            "X-NSA-Gateway-Secret": env.GATEWAY_SHARED_SECRET

          },

          body: JSON.stringify(upstreamBody),

          redirect: "follow"

        }

      );

// Read the upstream response.

      const responseText = await upstream.text();

// Apps Script should return JSON.

      let result;

      try {

        result = JSON.parse(responseText);

      } catch (_) {

        return jsonResponse(

          {

            status: "ERROR",

            message: "Apps Script returned an invalid response."

          },

          502,

          corsHeaders

        );

      }

// Return the parsed result with CORS headers.

// Apps Script commonly returns HTTP 200 even when

// its JSON result contains status: "ERROR".

      if (!upstream.ok) {

        return jsonResponse(

          {

            status: "ERROR",

            message: "The Apps Script backend returned an HTTP error.",

            upstreamStatus: upstream.status

          },

          502,

          corsHeaders

        );

      }

      return jsonResponse(

        result,

        200,

        corsHeaders

      );

    } catch (_) {

// Do not expose internal URLs, secrets or stack traces.

      return jsonResponse(

        {

          status: "ERROR",

          message: "Could not reach the Apps Script backend."

        },

        502,

        corsHeaders

      );

    }

  }

};