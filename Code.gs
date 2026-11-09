/**
 * NSA Wassa Amenfi West Municipal Secretariat — consolidated Code.gs
 * Reconstructed from the supplied Code.gs parts. Duplicate declarations have been reconciled.
 * Review/fix pass: evaluation approval consistency, schema-aware writes, and legacy-row handling.
 */
const SYSTEM_NAME = "NSA Personnel Management System";
const SYSTEM_VERSION = "1.0.0";
const SESSION_DURATION = 8;
const ANNUAL_REMINDER_MONTHS_BEFORE = 2;
const ANNUAL_REMINDER_MONTHS_AFTER = 2;
const DATABASE_ID = "19hGT9kTFFSk7zAY1xSpDh7Di8qDbYhCMCrb4bloQO1k";
/* ===== getDatabase ===== */
function getDatabase() {
    return SpreadsheetApp
        .openById(DATABASE_ID);
}
/* ===== API-only doGet ===== */
function doGet(e) {
    // This test deployment is API-only. Do not serve legacy Apps Script HTML
    // pages from the public web-app URL. Browser clients must use the
    // Cloudflare Worker, which forwards authenticated POST requests to doPost.
    return ContentService
        .createTextOutput(JSON.stringify({
            status: "ERROR",
            message: "This endpoint is API-only. Send API requests through the authorized gateway."
        }))
        .setMimeType(ContentService.MimeType.JSON);
}
/* ===== include ===== */
function include(filename) {
    return HtmlService
        .createHtmlOutputFromFile(filename)
        .getContent();
}
/* ===== setupNSA_WAWM ===== */
function setupNSA_WAWM() {
    createDatabaseStructure_();
    ensureAgencySheets_();
    migrateAgencyLegacyRecords_();
    createSystemFolders_();
    createDefaultAllowanceTypes_();
    createDefaultRoles_();
    createSystemSettings_();
    createEvaluationTriggers();
    return {
        status: "SUCCESS",
        message: "NSA WAWM system initialized successfully."
    };
}
/* ===== getApplicationURL ===== */
function getApplicationURL() {
    return ScriptApp
        .getService()
        .getUrl();
}
/* ===== getCurrentUser ===== */
function getCurrentUser() {
    return Session
        .getActiveUser()
        .getEmail();
}
/* ===== getSystemInformation ===== */
function getSystemInformation(token) {
    requireAdminSession_(token, ["ADMIN"]);
    const stored = String(getSystemSetting_("SYSTEM_NAME") || ""); const system = (!stored || stored === "NSA Wassa Amenfi West Municipal Secretariat") ? SYSTEM_NAME : stored; return { system: system, version: SYSTEM_VERSION, url: getApplicationURL(), database: getDatabase().getName(), user: Session.getActiveUser().getEmail() };
}
/* ===== createDatabaseStructure_ ===== */
function createDatabaseStructure_() {
    const ss = getDatabase();
    const structures = {
        "MASTER_PERSONNEL": [
            "Student ID",
            "NSS Number",
            "Other Names",
            "Last Name",
            "Institution",
            "Batch",
            "Course",
            "Phone Number",
            "Email",
            "GhanaPay Number",
            "Gender",
            "Age",
            "First Choice Region",
            "Company Posted To",
            "Allowance Type",
            "Region Posted To",
            "District Posted To",
            "Residential Region",
            "Residential District",
            "Enrollment Status",
            "Date Registered",
            "Residential Address",
            "Currently Employed",
            "Employer Company",
            "Employer Name",
            "Employer Name Other",
            "Registration Status",
            "Service Start Date",
            "Service End Date",
            "Service Year",
            "Service Status"
        ],
        "REGISTERED_PERSONNEL": [
            "Registration Number",
            "NSS Number",
            "Full Name",
            "Institution",
            "Course",
            "Batch",
            "Allowance Type",
            "Phone Number",
            "Email",
            "GhanaPay Number",
            "Residential Address",
            "Residential Region",
            "Residential District",
            "Currently Employed",
            "Employer Company",
            "Employer Name",
            "Photo URL",
            "Photo File ID",
            "Date Registered",
            "Status",
            "Service Start Date",
            "Service End Date",
            "Service Year",
            "Service Status",
            "Last Evaluation Status",
            "WhatsApp Number",
            "Next Of Kin Name",
            "Next Of Kin Relation",
            "Next Of Kin Phone",
            "Gender",
            "Age",
            "Company Posted To",
            "District Posted To"
        ],
        "USERS": [
            "User ID",
            "Name",
            "Email",
            "Password",
            "Role",
            "Status",
            "Created Date"
        ],
        "USER_SESSIONS": [
            "Token",
            "User Email",
            "Role",
            "Created Date",
            "Expiry Date",
            "Status"
        ],
        "OTP_LOG": [
            "ID",
            "Token",
            "NSS Number",
            "Purpose",
            "OTP",
            "Created Date",
            "Expiry Date",
            "Status"
        ],
        "BATCH_SETTINGS": [
            "Batch ID",
            "Batch Name",
            "Start Date",
            "End Date",
            "Status"
        ],
        "REMINDER_LOG": [
            "ID",
            "NSS Number",
            "Reminder Type",
            "Month",
            "Year",
            "Channel",
            "Date Sent",
            "Status",
            "Evaluation Type",
            "Period",
            "Reminder Date",
            "Sent Date"
        ],
        "LATE_REGISTRATION_APPROVALS": [
            "ID",
            "NSS Number",
            "Type",
            "Month",
            "Year",
            "Requested Date",
            "Approved By",
            "Approved Date",
            "Status"
        ],
        "ALLOWANCE_TYPES": [
            "ID",
            "Allowance Type",
            "Status"
        ],
        "MONTHLY_EVALUATION_CALENDAR": [
            "Calendar ID",
            "Batch",
            "Month",
            "Year",
            "Start Date",
            "End Date",
            "Created By",
            "Status"
        ],
        "ANNUAL_EVALUATION_SETTINGS": [
            "ID",
            "Batch",
            "Service Year",
            "First Month",
            "First Start Date",
            "First End Date",
            "Second Start Date",
            "Second End Date",
            "Third Start Date",
            "Third End Date",
            "Created By",
            "Status"
        ],
        "ANNUAL_EVALUATION_CALENDAR": [
            "ID",
            "Batch",
            "Service Year",
            "Evaluation Year",
            "First Start Date",
            "First End Date",
            "Second Start Date",
            "Second End Date",
            "Third Start Date",
            "Third End Date",
            "Created By",
            "Status"
        ],
        "QR_SCAN_LOG": [
            "ID",
            "NSS Number",
            "QR Type",
            "Identifier",
            "Month",
            "Year",
            "Scanned By",
            "Scan Date"
        ],
        "MONTHLY_EVALUATIONS": [
            "ID",
            "NSS Number",
            "Registration Number",
            "Batch",
            "Month",
            "Year",
            "Deadline Date",
            "Submitted Date",
            "Captured By",
            "Late Flag",
            "Service Status",
            "Status",
            "Capture Code"
        ],
        "ANNUAL_EVALUATIONS": [
            "ID",
            "NSS Number",
            "Registration Number",
            "Allowance Type",
            "Batch",
            "Evaluation Period",
            "Deadline Date",
            "Submitted Date",
            "Captured By",
            "Late Flag",
            "Service Status",
            "Status"
        ],
        "EVALUATION_APPROVALS": [
            "Approval ID",
            "NSS Number",
            "Evaluation Type",
            "Period",
            "Reason",
            "Decision",
            "Approved By",
            "Approval Date"
        ],
        "SERVICE_HISTORY": [
            "ID",
            "NSS Number",
            "Batch",
            "Service Start Date",
            "Service End Date",
            "Previous Status",
            "New Status",
            "Changed By",
            "Changed Date",
            "Status"
        ],
        "EVALUATION_STATUS": [
            "ID",
            "NSS Number",
            "Evaluation Type",
            "Period",
            "Status",
            "Flag",
            "Remarks",
            "Updated By",
            "Updated Date"
        ],
        "REPORT_EXPORT_LOG": [
            "ID",
            "Report Type",
            "Generated By",
            "Filters Used",
            "Generated Date",
            "File URL"
        ],
        "NOTIFICATION_LOG": [
            "ID",
            "NSS Number",
            "Notification Type",
            "Channel",
            "Recipient",
            "Subject",
            "Message",
            "Date Sent",
            "Status"
        ],
        "EVALUATION_AUDIT": [
            "ID",
            "NSS Number",
            "Action",
            "Evaluation Type",
            "Month",
            "Year",
            "Batch",
            "Performed By",
            "Date"
        ],
        "SMS_LOG": [
            "Date",
            "Phone Number",
            "Message",
            "Response",
            "Status"
        ],
        "EMAIL_LOG": [
            "Date",
            "Email",
            "Subject",
            "Status"
        ],
        "AUDIT_LOG": [
            "Date",
            "User",
            "Action",
            "Details"
        ],
        "SYSTEM_SETTINGS": [
            "Setting",
            "Value"
        ],
        "HOLIDAYS": [
            "ID",
            "Holiday Date",
            "Description",
            "Status"
        ],
        "OFFICIAL_DOCUMENTS": [
            "ID",
            "Document Name",
            "Description",
            "File URL",
            "File ID",
            "Uploaded Date"
        ]
    };
    Object.keys(structures)
        .forEach(function (sheetName) {
        let sheet = ss.getSheetByName(sheetName);
        /*
        =================================
        CREATE NEW SHEET
        =================================
        */
        if (!sheet) {
            sheet =
                ss.insertSheet(sheetName);
            sheet
                .getRange(1, 1, 1, structures[sheetName].length)
                .setValues([
                structures[sheetName]
            ]);
            return;
        }
        /*
        =================================
        UPDATE EXISTING SHEET
        
        ONLY ADD MISSING HEADERS
        
        DO NOT DELETE ANYTHING
        
        =================================
        */
        const lastColumn = sheet.getLastColumn();
        let existingHeaders = [];
        if (lastColumn > 0) {
            existingHeaders =
                sheet
                    .getRange(1, 1, 1, lastColumn)
                    .getValues()[0];
        }
        structures[sheetName]
            .forEach(function (header) {
            if (existingHeaders.indexOf(header)
                ===
                    -1) {
                sheet
                    .getRange(1, sheet.getLastColumn() + 1)
                    .setValue(header);
            }
        });
    });
}
/* ===== createSystemFolders_ ===== */
function createSystemFolders_() {
    const rootName = "NSA_WAWM_SYSTEM";
    let root;
    const existing = DriveApp
        .getFoldersByName(rootName);
    if (existing.hasNext()) {
        root =
            existing.next();
    }
    else {
        root =
            DriveApp
                .createFolder(rootName);
    }
    const folders = [
        "Personnel Photos",
        "Generated Registers",
        "Official Documents",
        "Backups"
    ];
    folders.forEach(function (name) {
        const check = root
            .getFoldersByName(name);
        if (!check.hasNext()) {
            root
                .createFolder(name);
        }
    });
}
/* ===== createDefaultAllowanceTypes_ ===== */
function createDefaultAllowanceTypes_() {
    const sheet = getDatabase()
        .getSheetByName("ALLOWANCE_TYPES");
    const existing = sheet
        .getDataRange()
        .getValues();
    const types = [
        "Subvented",
        "Study Leave",
        "Non-Subvented",
        "MOH Sponsored"
    ];
    types.forEach(function (type) {
        let found = false;
        existing.forEach(function (row) {
            if (row[1] === type) {
                found = true;
            }
        });
        if (!found) {
            sheet.appendRow([
                Utilities.getUuid(),
                type,
                "ACTIVE"
            ]);
        }
    });
}
/* ===== createDefaultRoles_ ===== */
function createDefaultRoles_() {
    const sheet = getDatabase()
        .getSheetByName("USERS");
    if (sheet.getLastRow() === 1) {
        sheet.appendRow([
            Utilities.getUuid(),
            "System Administrator",
            Session
                .getActiveUser()
                .getEmail(),
            "CHANGE_PASSWORD",
            "SUPER ADMIN",
            "ACTIVE",
            new Date()
        ]);
    }
}
/* ===== createSystemSettings_ ===== */
function createSystemSettings_() {
    const sheet = getDatabase()
        .getSheetByName("SYSTEM_SETTINGS");
    const existing = sheet
        .getDataRange()
        .getValues();
    const settings = {
        "SYSTEM_NAME": SYSTEM_NAME,
        "SYSTEM_VERSION": SYSTEM_VERSION,
        "INSTITUTION_NAME": "Wassa Amenfi West Municipal Secretariat",
        "SUPPORT_EMAIL": "",
        "SUPPORT_PHONE": "",
        "LOGO_URL": "https://lh3.googleusercontent.com/d/10gIO9KpoqufMr8xWVh6ZfOBgDRU-KUN3",
        "EMAIL_SENDER_NAME": "NSA WAWM",
        "EMAIL_ADDRESS": "",
        "SMS_API_KEY": "",
        "SMS_USERNAME": "",
        "SMS_PASSWORD": "",
        "SMS_PROVIDER": "SMSONLINE",
        "SMS_API_URL": "",
        "SMS_USERNAME": "",
        "SMS_PASSWORD": "",
        "SMS_SENDER_ID": "NSS ASANCO",
        "EMAIL_SENDER": "NSA WAWM",
        "EVALUATION_OTP_REQUIRED": "NO",
        "MONTHLY_REMINDER_START": "15",
        "MONTHLY_REMINDER_END": "20"
    };
    Object.keys(settings)
        .forEach(function (key) {
        let found = false;
        for (let i = 1; i < existing.length; i++) {
            if (existing[i][0] === key) {
                found = true;
                break;
            }
        }
        if (!found) {
            sheet.appendRow([
                key,
                settings[key]
            ]);
        }
    });
}
/* ===== createUserSession ===== */
function createUserSession(user) {
    const token = Utilities
        .getUuid();
    const expiry = new Date();
    expiry.setHours(expiry.getHours()
        +
            SESSION_DURATION);
    const sheet = getDatabase()
        .getSheetByName("USER_SESSIONS");
    sheet.appendRow([
        token,
        user.email,
        user.role,
        new Date(),
        expiry,
        "ACTIVE"
    ]);
    return token;
}
/* ===== validateSession ===== */
function validateSession(token) {
    token = String(token || "").trim();
    if (!token) return { valid: false, message: "No session token" };
    const db = getDatabase();
    const sheet = db.getSheetByName("USER_SESSIONS");
    if (!sheet || sheet.getLastRow() < 2) return { valid: false, message: "Invalid session" };
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
        if (String(data[i][0] || "") !== token) continue;
        const status = String(data[i][5] || "").trim().toUpperCase();
        if (status !== "ACTIVE") return { valid: false, message: "Session is no longer active" };
        const expiry = new Date(data[i][4]);
        if (isNaN(expiry.getTime()) || expiry <= new Date()) {
            sheet.getRange(i + 1, 6).setValue("EXPIRED");
            return { valid: false, message: "Session expired" };
        }
        const email = String(data[i][1] || "").trim().toLowerCase();
        const usersSheet = db.getSheetByName("USERS");
        if (!usersSheet || usersSheet.getLastRow() < 2) {
            sheet.getRange(i + 1, 6).setValue("REVOKED");
            return { valid: false, message: "User account is unavailable" };
        }
        const users = usersSheet.getDataRange().getValues();
        let user = null;
        for (let j = 1; j < users.length; j++) if (String(users[j][2] || "").trim().toLowerCase() === email) { user = users[j]; break; }
        if (!user || String(user[5] || "").trim().toUpperCase() !== "ACTIVE") {
            sheet.getRange(i + 1, 6).setValue("REVOKED");
            return { valid: false, message: "User account is inactive" };
        }
        return { valid: true, email: String(user[2] || data[i][1] || ""), role: String(user[4] || data[i][2] || "").trim().toUpperCase() };
    }
    return { valid: false, message: "Invalid session" };
}
/* ===== loginSystemUser ===== */
function loginSystemUser(email, password) {
    const sheet = getDatabase().getSheetByName("USERS");
    if (!sheet || sheet.getLastRow() < 2) return { status: "ERROR", message: "Invalid login details" };
    const data = sheet.getDataRange().getValues();
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const suppliedPassword = String(password || "");
    if (!normalizedEmail || !suppliedPassword) return { status: "ERROR", message: "Enter your email and password." };
    for (let i = 1; i < data.length; i++) {
        const storedEmail = String(data[i][2] || "").trim().toLowerCase();
        const storedCredential = String(data[i][3] || "");
        const status = String(data[i][5] || "").trim().toUpperCase();
        if (storedEmail !== normalizedEmail || status !== "ACTIVE") continue;
        let passwordMatches = false;
        if (storedCredential.indexOf("sha256$") === 0) {
            passwordMatches = verifyUserPassword_(suppliedPassword, storedCredential);
        } else {
            // One-time compatibility for existing plaintext credentials: migrate after a successful login.
            passwordMatches = storedCredential === suppliedPassword;
            if (passwordMatches) sheet.getRange(i + 1, 4).setValue(hashUserPassword_(suppliedPassword));
        }
        if (!passwordMatches) break;
        const user = { email: data[i][2], role: String(data[i][4] || "").trim().toUpperCase() };
        const token = createUserSession(user);
        writeAuditLog_(normalizedEmail, "LOGIN", "User login successful");
        return { status: "SUCCESS", token: token, role: user.role, name: String(data[i][1] || "") };
    }
    return { status: "ERROR", message: "Invalid login details" };
}
/* ===== logoutSystemUser ===== */
function logoutSystemUser(token) {
    const sheet = getDatabase()
        .getSheetByName("USER_SESSIONS");
    const data = sheet
        .getDataRange()
        .getValues();
    for (let i = 1; i < data.length; i++) {
        if (data[i][0]
            ===
                token) {
            sheet
                .getRange(i + 1, 6)
                .setValue("LOGGED OUT");
            writeAuditLog_(data[i][1], "LOGOUT", "User logout");
            break;
        }
    }
    return {
        status: "SUCCESS"
    };
}
/* ===== checkPermission ===== */
function checkPermission(token, requiredRole) {
    const session = validateSession(token);
    if (!session.valid) {
        return {
            allowed: false,
            message: "Unauthorized"
        };
    }
    const role = session.role;
    /*
    
    SUPER ADMIN HAS FULL ACCESS
    
    */
    if (role === "SUPER ADMIN") {
        return {
            allowed: true
        };
    }
    if (role === requiredRole) {
        return {
            allowed: true
        };
    }
    return {
        allowed: false,
        message: "Access denied"
    };
}
/* ===== writeAuditLog_ ===== */
function writeAuditLog_(user, action, details) {
    const sheet = getDatabase()
        .getSheetByName("AUDIT_LOG");
    sheet.appendRow([
        new Date(),
        user,
        action,
        details
    ]);
}
/* ===== cleanExpiredSessions ===== */
function cleanExpiredSessions() {
    const sheet = getDatabase()
        .getSheetByName("USER_SESSIONS");
    const data = sheet
        .getDataRange()
        .getValues();
    for (let i = data.length - 1; i > 0; i--) {
        if (new Date(data[i][4])
            <
                new Date()) {
            sheet
                .getRange(i + 1, 6)
                .setValue("EXPIRED");
        }
    }
}
/* ===== openRegistrationPortal ===== */
function openRegistrationPortal(nssNumber) {
    const normalizedNss = String(nssNumber || "").trim().toUpperCase();

    if (!normalizedNss) {
        return {
            status: "ERROR",
            code: "MISSING_NSS",
            message: "Enter a valid NSS number to begin registration."
        };
    }

    // Registration eligibility is established from MASTER_PERSONNEL.
    const master = findMasterPersonnel_(normalizedNss);

    if (!master) {
        return {
            status: "ERROR",
            code: "PERSONNEL_NOT_FOUND_IN_DISTRICT",
            message: "Personnel was not found in the district's master personnel records. Please verify the NSS number. If it is correct, contact the NSA Wassa Amenfi West Municipal Secretariat for assistance."
        };
    }

    // Do not create a second registration for an already-registered person.
    const existing = findRegisteredPersonnel_(normalizedNss);

    if (existing) {
        return {
            status: "ERROR",
            code: "ALREADY_REGISTERED",
            message: "This personnel is already registered in the NSA WAWM Personnel Management System. Please use the evaluation or personnel-update process as appropriate."
        };
    }

    const token = Utilities.getUuid();

    CacheService
        .getScriptCache()
        .put("REG_" + token, JSON.stringify(master), 1800);

    return {
        status: "SUCCESS",
        token: token,
        personnel: {
            fullName: (master["Other Names"] || "") + " " + (master["Last Name"] || ""),
            nssNumber: master["NSS Number"] || normalizedNss,
            institution: master["Institution"] || "",
            course: master["Course"] || "",
            posting: master["Company Posted To"] || "",
            district: master["District Posted To"] || ""
        }
    };
}
/* ===== confirmRegistrationOTP ===== */
function confirmRegistrationOTP(token, otp) {
    token =
        String(token || "").trim();
    otp =
        String(otp || "").trim();
    if (!token) {
        return {
            status: "ERROR",
            message: "Verification token missing."
        };
    }
    if (!otp) {
        return {
            status: "ERROR",
            message: "Enter the OTP."
        };
    }
    /*
     * Verify the OTP.
     */
    const result = verifyOTP_(token, otp, "REGISTRATION");
    if (result.status !== "SUCCESS") {
        return result;
    }
    /*
     * Recover the original
     * registration session.
     */
    const cache = CacheService
        .getScriptCache();
    const registrationRecord = cache.get("REG_" + token);
    if (!registrationRecord) {
        return {
            status: "ERROR",
            message: "Registration session expired. Please start again."
        };
    }
    /*
     * THIS IS THE MISSING STEP.
     *
     * The personnel page will use
     * this verified session.
     */
    cache.put("VERIFIED_" + token, registrationRecord, 1800);
    return {
        status: "SUCCESS",
        token: token,
        verified: true,
        message: "Verification successful."
    };
}
/* ===== confirmOTP ===== */
function confirmOTP(token, otp, purpose) {
    purpose =
        String(purpose || "REGISTRATION")
            .trim()
            .toUpperCase();
    return verifyOTP_(token, otp, purpose);
}
/* ===== getRegistrationSession_ ===== */
function getRegistrationSession_(token) {
    token =
        String(token || "").trim();
    if (!token) {
        return null;
    }
    const cache = CacheService
        .getScriptCache();
    const record = cache.get("REG_" + token);
    if (!record) {
        return null;
    }
    const master = JSON.parse(record);
    return {
        token: token,
        nssNumber: master["NSS Number"],
        master: master
    };
}
/* ===== saveEvaluationSession ===== */
function saveEvaluationSession(token) {
    sessionStorage.setItem(EVAL_SESSION, token);
}
/* ===== getEvaluationSession ===== */
function getEvaluationSession() {
    return sessionStorage.getItem(EVAL_SESSION);
}
/* ===== clearEvaluationSession ===== */
function clearEvaluationSession() {
    sessionStorage.removeItem(EVAL_SESSION);
}
/* ===== findMasterPersonnel_ ===== */
function findMasterPersonnel_(nss) {
    const sheet = getDatabase().getSheetByName("MASTER_PERSONNEL");
    if (!sheet) {
        return null;
    }

    const data = sheet.getDataRange().getValues();
    if (data.length < 2) {
        return null;
    }

    const headers = data[0];
    const normalizeHeader = function(value) {
        return String(value || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
    };

    // Prefer the named NSS column; retain column B as a compatibility fallback.
    let nssColumn = headers.findIndex(function(header) {
        return ["nssnumber", "nss", "nationalservicenumber"].indexOf(normalizeHeader(header)) !== -1;
    });
    if (nssColumn < 0) {
        nssColumn = 1;
    }

    const targetNss = String(nss || "").trim().toUpperCase();

    for (let i = 1; i < data.length; i++) {
        const storedNss = String(data[i][nssColumn] || "").trim().toUpperCase();

        if (storedNss === targetNss) {
            const person = {};
            headers.forEach(function(header, index) {
                person[String(header || "").trim()] = data[i][index];
            });
            return person;
        }
    }

    return null;
}
/* ===== findRegisteredPersonnel_ ===== */
function findRegisteredPersonnel_(nss) {
    const sheet = getDatabase().getSheetByName("REGISTERED_PERSONNEL");
    if (!sheet) {
        return null;
    }

    const data = sheet.getDataRange().getValues();
    if (data.length < 2) {
        return null;
    }

    const headers = data[0];
    const normalizeHeader = function(value) {
        return String(value || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
    };

    let nssColumn = headers.findIndex(function(header) {
        return ["nssnumber", "nss", "nationalservicenumber"].indexOf(normalizeHeader(header)) !== -1;
    });
    if (nssColumn < 0) {
        nssColumn = 1;
    }

    const targetNss = String(nss || "").trim().toUpperCase();

    for (let i = 1; i < data.length; i++) {
        const storedNss = String(data[i][nssColumn] || "").trim().toUpperCase();

        if (storedNss === targetNss) {
            return getRowObject_("REGISTERED_PERSONNEL", data[i]);
        }
    }

    return null;
}
/* ===== sendRegistrationOTP ===== */
function sendRegistrationOTP(token) {
    token =
        String(token || "").trim();
    if (!token) {
        return {
            status: "ERROR",
            message: "Registration session missing."
        };
    }
    const session = getRegistrationSession_(token);
    if (!session) {
        return {
            status: "ERROR",
            message: "Registration session expired. Please start again."
        };
    }
    const result = sendOTP_({
        nssNumber: session.nssNumber,
        purpose: "REGISTRATION",
        token: token,
        forceNew: false
    });
    if (!result) {
        return {
            status: "ERROR",
            message: "Unable to generate OTP."
        };
    }
    return {
        status: "SUCCESS",
        token: token,
        message: "OTP sent successfully."
    };
}
/* ===== resendOTP ===== */
function resendOTP(token, purpose) {
    token = String(token || "").trim();
    purpose = String(purpose || "REGISTRATION").trim().toUpperCase();

    if (!token) {
        return { status: "ERROR", message: "Verification session missing. Please start again." };
    }

    if (purpose === "REGISTRATION") {
        const session = getRegistrationSession_(token);
        if (!session) {
            return { status: "ERROR", message: "Registration session expired. Please start again." };
        }

        // A resend must invalidate the previous active code and deliver a new one.
        const result = sendOTP_({
            nssNumber: session.nssNumber,
            purpose: "REGISTRATION",
            token: token,
            forceNew: true
        });
        if (!result || result.status !== "SUCCESS") {
            return { status: "ERROR", message: result && result.message ? result.message : "Unable to send a new verification code." };
        }
        return { status: "SUCCESS", token: token, message: "A new verification code has been sent." };
    }

    if (purpose === "EVALUATION") {
        const session = getOTPTokenData_(token);
        if (!session || String(session.purpose || "").trim().toUpperCase() !== "EVALUATION") {
            return { status: "ERROR", message: "Evaluation verification session expired. Please start again." };
        }

        const result = sendOTP_({
            nssNumber: session.nssNumber,
            purpose: "EVALUATION",
            token: token,
            forceNew: true
        });
        if (!result || result.status !== "SUCCESS") {
            return { status: "ERROR", message: result && result.message ? result.message : "Unable to send a new verification code." };
        }
        return { status: "SUCCESS", token: token, message: "A new verification code has been sent." };
    }

    return { status: "ERROR", message: "Unsupported verification purpose." };
}
/* ===== loadRegistrationForm ===== */
function loadRegistrationForm(token) {
    const cache = CacheService
        .getScriptCache();
    const record = cache.get("VERIFIED_" + token);
    if (!record) {
        return {
            status: "ERROR",
            message: "Verification required"
        };
    }
    const master = JSON.parse(record);
    /*
    Create display fields
    */
    master["Place of Posting"] =
        master["Company Posted To"] || "";
    master["Posting District"] =
        master["District Posted To"] || "";
    return {
        status: "SUCCESS",
        formData: {
            master: master
        }
    };
}
/* ===== submitRegistrationForm ===== */

/**
 * NASPA REGISTRATION NUMBER GENERATOR
 *
 * Format:
 * BATCH PREFIX-ALLOWANCE PREFIX-SEQUENCE-YEAR
 *
 * Examples:
 * GEN-SUB-001-26
 * NRS1-MOH-002-26
 * NRS2-SL-001-26
 * TCH-NS-001-26
 *
 * Sequence is shared across allowance types within
 * the same batch and academic year.
 */


/**
 * 1. Generate the batch prefix.
 * Academic year is removed before matching the batch.
 */
function getBatchRegistrationPrefix_(batch) {

    const batchText = String(batch || "")
        .trim()
        .toUpperCase();

    const yearPattern = /\b20\d{2}\s*\/\s*(?:20)?\d{2}\b/g;

    const batchKey = batchText
        .replace(yearPattern, "")
        .replace(/\s+/g, " ")
        .trim();

    const batchPrefixes = {
        "GENERAL ENROLMENT": "GEN",
        "NURSING ENROLMENT EVENT BATCH 1": "NRS1",
        "NURSING ENROLMENT EVENT BATCH 2": "NRS2",
        "TEACHERS ENROLMENT EVENT": "TCH"
    };

    const prefix = batchPrefixes[batchKey];

    if (!prefix) {
        throw new Error(
            "Registration prefix has not been configured for batch: " +
            batchText
        );
    }

    const yearMatch = batchText.match(
        /\b(20\d{2})\s*\/\s*(?:20)?\d{2}\b/
    );

    if (!yearMatch) {
        throw new Error(
            "Academic year could not be identified from batch: " +
            batchText
        );
    }

    return {
        prefix: prefix,
        year: yearMatch[1].slice(-2),
        batch: batchText
    };
}


/**
 * 2. Generate registration number while the script lock
 * is already held.
 *
 * IMPORTANT:
 * This function must only be called from a process
 * that already holds the script lock.
 */
function generateRegistrationNumberLocked_(allowance, batch) {

    const batchInfo = getBatchRegistrationPrefix_(batch);

    const allowancePrefixes = {
        "SUBVENTED": "SUB",
        "STUDY LEAVE": "SL",
        "NON-SUBVENTED": "NS",
        "MOH SPONSORED": "MOH"
    };

    const allowanceKey = String(allowance || "")
        .trim()
        .toUpperCase();

    const allowancePrefix =
        allowancePrefixes[allowanceKey] || "GEN";

    const sheet = getDatabase()
        .getSheetByName("REGISTERED_PERSONNEL");

    if (!sheet) {
        throw new Error(
            "REGISTERED_PERSONNEL sheet was not found."
        );
    }

    const lastRow = sheet.getLastRow();
    const lastColumn = sheet.getLastColumn();

    if (lastColumn < 1) {
        throw new Error(
            "REGISTERED_PERSONNEL has no columns."
        );
    }

    const headers = sheet
        .getRange(1, 1, 1, lastColumn)
        .getDisplayValues()[0];

    const batchCol = headers.findIndex(function(h) {
        return String(h || "").trim().toLowerCase() === "batch";
    });

    const regCol = headers.findIndex(function(h) {
        return String(h || "").trim().toLowerCase() === "registration number";
    });

    if (batchCol < 0 || regCol < 0) {
        throw new Error(
            "REGISTERED_PERSONNEL must contain Registration Number and Batch headers."
        );
    }

    const rows = lastRow >= 2
        ? sheet.getRange(
            2, 1, lastRow - 1, lastColumn
        ).getDisplayValues()
        : [];

    let highest = 0;

    // Global uniqueness check.
    const allRegistrationNumbers = new Set();

    // Match any allowance prefix within this batch and year.
    const sequencePattern = new RegExp(
        "^" +
        batchInfo.prefix +
        "-[A-Z]+-(\\d+)-" +
        batchInfo.year +
        "$"
    );

    rows.forEach(function(row) {

        const rowBatch = String(row[batchCol] || "")
            .trim()
            .toUpperCase();

        const rowReg = String(row[regCol] || "")
            .trim()
            .toUpperCase();

        if (!rowReg) return;

        // Record every registration number globally.
        allRegistrationNumbers.add(rowReg);

        // Sequence is counted only within this batch
        // and academic year.
        if (rowBatch !== batchInfo.batch) return;

        const match = rowReg.match(sequencePattern);

        if (match) {
            highest = Math.max(
                highest,
                Number(match[1])
            );
        }

    });

    let next = highest + 1;

    let candidate =
        batchInfo.prefix + "-" +
        allowancePrefix + "-" +
        Utilities.formatString("%03d", next) +
        "-" + batchInfo.year;

    // Never return a registration number already
    // present anywhere in REGISTERED_PERSONNEL.

    while (allRegistrationNumbers.has(candidate)) {

        next++;

        candidate =
            batchInfo.prefix + "-" +
            allowancePrefix + "-" +
            Utilities.formatString("%03d", next) +
            "-" + batchInfo.year;
    }

    return candidate;
}


/**
 * 3. Public registration number generator.
 *
 * Acquires its own lock when called independently.
 */
function generateRegistrationNumber_(allowance, batch) {

    const lock = LockService.getScriptLock();

    if (!lock.tryLock(30000)) {
        throw new Error(
            "Another registration is being processed. Please try again."
        );
    }

    try {

        return generateRegistrationNumberLocked_(
            allowance,
            batch
        );

    } finally {

        lock.releaseLock();

    }
}


/**
 * 4. Submit registration form.
 *
 * The lock covers:
 * - Duplicate NSS verification.
 * - Registration number generation.
 * - Personnel record insertion.
 *
 * This prevents simultaneous administrators from
 * receiving the same registration number.
 */
function submitRegistrationForm(token, data) {

    const cache = CacheService.getScriptCache();

    const record = cache.get("VERIFIED_" + token);

    if (!record) {
        return {
            status: "ERROR",
            message: "Registration session expired."
        };
    }

    const master = JSON.parse(record);

    const fullName =
        (master["Other Names"] || "") +
        " " +
        (master["Last Name"] || "");

    const phone =
        data.phone ||
        master["Phone Number"] ||
        "";

    const email =
        data.email ||
        master["Email"] ||
        "";

    const lock = LockService.getScriptLock();

    if (!lock.tryLock(30000)) {
        return {
            status: "ERROR",
            message: "Another registration is being processed. Please try again."
        };
    }

    let registrationNumber;
    let saved = false;

    try {

        // Check for duplicate NSS while holding the lock.
        const duplicate = findRegisteredPersonnel_(
            master["NSS Number"]
        );

        if (duplicate) {
            return {
                status: "ERROR",
                message: "Personnel already registered."
            };
        }

        // Generate the registration number under
        // the same lock used for saving the record.
        registrationNumber = generateRegistrationNumberLocked_(
            master["Allowance Type"],
            master["Batch"]
        );

        const serviceDates = getBatchServiceDates_(
            master["Batch"]
        );

        const sheet = getDatabase()
            .getSheetByName("REGISTERED_PERSONNEL");

        if (!sheet) {
            throw new Error(
                "REGISTERED_PERSONNEL sheet was not found."
            );
        }

        if (!serviceDates.startDate || !serviceDates.endDate) {
            console.log(
                "Batch service dates not found for:",
                master["Batch"]
            );
        }

        // Save personnel record.
        sheet.appendRow([

            registrationNumber,
            master["NSS Number"],
            fullName,
            master["Institution"],
            master["Course"],
            master["Batch"],
            master["Allowance Type"],
            phone,
            email,
            master["GhanaPay Number"],
            data.residentialAddress,
            "",
            "",
            "",
            data.employerCompany,
            data.employerName,
            data.photoUrl,
            data.photoFileId,
            new Date(),
            "ACTIVE",
            serviceDates.startDate,
            serviceDates.endDate,
            getServiceYear_(serviceDates.startDate),
            "NOT STARTED",
            "NOT SUBMITTED",
            data.whatsapp,
            data.nextOfKinName,
            data.nextOfKinRelation,
            data.nextOfKinPhone,
            master["Gender"],
            master["Age"],
            master["Company Posted To"],
            master["District Posted To"],
            data.regionalVerificationDate || "",
            "NOT SUBMITTED",
            "NOT SUBMITTED",
            "PENDING",
            data.dateOfBirth || ""

        ]);

        saved = true;

    } catch (error) {

        console.error(
            "Registration submission failed:",
            error
        );

        return {
            status: "ERROR",
            message: error.message || "Registration could not be completed."
        };

    } finally {

        lock.releaseLock();

    }

    // The personnel record has been saved.
    // Perform notifications and audit logging after
    // releasing the registration lock.

    if (saved) {

        try {

            sendRegistrationConfirmation_({
                name: fullName,
                email: email,
                phone: phone
            });

        } catch (emailError) {

            console.error(
                "Registration confirmation failed:",
                emailError
            );

        }

        try {

            writeAuditLog_(
                master["NSS Number"],
                "REGISTRATION_COMPLETED",
                registrationNumber
            );

        } catch (auditError) {

            console.error(
                "Registration audit logging failed:",
                auditError
            );

        }

        return {
            status: "SUCCESS",
            registrationNumber: registrationNumber
        };
    }

    return {
        status: "ERROR",
        message: "Registration could not be completed."
    };
}


/* ===== getRegistrationReceipt ===== */
function getRegistrationReceipt(registrationNumber) {
    const sheet = getDatabase()
        .getSheetByName("REGISTERED_PERSONNEL");
    const data = sheet
        .getDataRange()
        .getValues();
    for (let i = 1; i < data.length; i++) {
        if (data[i][0]
            ===
                registrationNumber) {
            return {
                status: "SUCCESS",
                receipt: {
                    registrationNumber: data[i][0],
                    nss: data[i][1],
                    name: data[i][2],
                    allowance: data[i][6]
                }
            };
        }
    }
    return {
        status: "ERROR",
        message: "Receipt not found"
    };
}
/* ===== savePersonnelPhoto_ ===== */
function savePersonnelPhoto_(nssNumber, base64Image) {
    try {
        const folder = getPersonnelPhotoFolder_();
        const content = base64Image.split(",")[1];
        const bytes = Utilities
            .base64Decode(content);
        const blob = Utilities
            .newBlob(bytes, "image/jpeg", nssNumber + ".jpg");
        const file = folder
            .createFile(blob);
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        return {
            url: file.getUrl(),
            id: file.getId()
        };
    }
    catch (error) {
        throw new Error("Photo upload failed: "
            +
                error.message);
    }
}
/* ===== getPersonnelPhotoFolder_ ===== */
function getPersonnelPhotoFolder_() {
    const rootSearch = DriveApp
        .getFoldersByName("NSA_WAWM_SYSTEM");
    let root;
    if (rootSearch.hasNext()) {
        root = rootSearch.next();
    }
    else {
        root =
            DriveApp.createFolder("NSA_WAWM_SYSTEM");
    }
    const photoFolders = root.getFoldersByName("Personnel Photos");
    if (photoFolders.hasNext()) {
        return photoFolders.next();
    }
    return root.createFolder("Personnel Photos");
}
/* ===== updateSMSConfiguration ===== */
function updateSMSConfiguration(data, token) {
    const session = requireAdminSession_(token, ["ADMIN"]);
    data = data || {};
    const apiUrl = String(data.apiUrl || "").trim();
    const username = String(data.username || "").trim();
    const password = String(data.password || "");
    const sender = String(data.sender || "").trim();
    if (apiUrl && !/^https:\/\//i.test(apiUrl)) return { status: "ERROR", message: "SMS API URL must use HTTPS." };
    if (apiUrl) upsertSystemSetting_("SMS_API_URL", apiUrl);
    upsertSystemSetting_("SMS_USERNAME", username);
    upsertSystemSetting_("SMS_SENDER_ID", sender || "NSA WAWM");
    if (password) {
        PropertiesService.getScriptProperties().setProperty("NSA_SMS_API_KEY", password);
        upsertSystemSetting_("SMS_PASSWORD", "");
        upsertSystemSetting_("SMS_API_KEY", "");
    }
    writeAuditLog_(session.email, "SMS_SETTINGS_UPDATED", "SMS configuration updated");
    return { status: "SUCCESS", message: "SMS configuration saved." };
}
/* ===== getSystemSetting_ ===== */
function getSystemSetting_(name) {
    const sheet = getDatabase().getSheetByName("SYSTEM_SETTINGS");
    if (!sheet || sheet.getLastRow() < 2) return "";
    const rows = sheet.getDataRange().getValues();
    let result = "";
    for (let i = 1; i < rows.length; i++) if (String(rows[i][0] || "").trim() === String(name || "").trim()) result = rows[i][1];
    return result;
}
/* ===== sendSMSOnline_ ===== */
function sendSMSOnline_(phone, message) {
    const apiKey = getSmsApiKey_();
    const sender = getSystemSetting_("SMS_SENDER_ID");
    const apiUrl = getSystemSetting_("SMS_API_URL");
    const number = normalizePhone_(phone);
    /*
    ========================================================
    VALIDATE PHONE
    ========================================================
    */
    if (!number) {
        logSMS_(phone || "", message, "INVALID PHONE", "FAILED");
        return false;
    }
    /*
    ========================================================
    VALIDATE API KEY
    ========================================================
    */
    if (!apiKey) {
        logSMS_(number, message, "SMS API KEY NOT CONFIGURED", "FAILED");
        return false;
    }
    /*
    ========================================================
    VALIDATE API URL
    ========================================================
    */
    if (!apiUrl) {
        logSMS_(number, message, "SMS API URL NOT CONFIGURED", "FAILED");
        return false;
    }
    const payload = {
        key: apiKey,
        text: String(message || "").trim(),
        type: 0,
        sender: sender || "NSA WAWM",
        to: number
    };
    try {
        const response = UrlFetchApp.fetch(apiUrl, {
            method: "post",
            payload: payload,
            contentType: "application/x-www-form-urlencoded",
            muteHttpExceptions: true
        });
        const code = response.getResponseCode();
        const body = response.getContentText();
        /*
        ======================================================
        IMPORTANT
    
        HTTP 200 does NOT automatically mean SMS succeeded.
    
        Some SMS providers return HTTP 200 while their
        response body says INVALID PHONE, insufficient
        balance, authentication failure, etc.
        ======================================================
        */
        const bodyUpper = String(body || "")
            .toUpperCase();
        const providerFailure = bodyUpper.includes("INVALID PHONE") ||
            bodyUpper.includes("INVALID NUMBER") ||
            bodyUpper.includes("PHONE INVALID") ||
            bodyUpper.includes("ERROR") ||
            bodyUpper.includes("FAILED") ||
            bodyUpper.includes("FAILURE") ||
            bodyUpper.includes("REJECTED") ||
            bodyUpper.includes("NOT SENT");
        const success = code >= 200 &&
            code < 300 &&
            !providerFailure;
        logSMS_(number, message, body, success
            ? "SENT"
            : "FAILED");
        return success;
    }
    catch (error) {
        logSMS_(number, message, error.message, "FAILED");
        return false;
    }
}
/* ===== normalizePhone_ ===== */
function normalizePhone_(value) {
    let phone = String(value || "")
        .trim()
        .replace(/[^0-9]/g, "");
    if (!phone) {
        return "";
    }
    // Ghana international format:
    // 233241234567 → 0241234567
    if (phone.startsWith("233") &&
        phone.length === 12) {
        return "0" + phone.substring(3);
    }
    // Ghana local format:
    // 241234567 → 0241234567
    if (phone.length === 9 &&
        /^[2-9]/.test(phone)) {
        return "0" + phone;
    }
    // Already Ghana local format:
    // 0241234567
    if (phone.length === 10 &&
        phone.startsWith("0")) {
        return phone;
    }
    return "";
}
/* ===== logSMS_ ===== */
function logSMS_(phone, message, response, status) {
    const sheet = getDatabase()
        .getSheetByName("SMS_LOG");
    if (!sheet) {
        return;
    }
    sheet.appendRow([
        new Date(),
        phone || "",
        message || "",
        response || "",
        status || "FAILED"
    ]);
}
/* ===== updateEmailConfiguration ===== */
function updateEmailConfiguration(data, token) {
    const session = requireAdminSession_(token, ["ADMIN"]);
    data = data || {};
    const name = String(data.name || "").trim();
    const email = String(data.email || "").trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { status: "ERROR", message: "Enter a valid email address." };
    if (name) {
        upsertSystemSetting_("EMAIL_SENDER_NAME", name);
        upsertSystemSetting_("EMAIL_SENDER", name);
    }
    if (email) upsertSystemSetting_("EMAIL_ADDRESS", email);
    writeAuditLog_(session.email, "EMAIL_SETTINGS_UPDATED", "Email settings updated");
    return { status: "SUCCESS", message: "Email settings saved." };
}
/* ===== sendEmail_ ===== */
function sendEmail_(recipient, subject, message) {
    const email = String(recipient || "").trim();
    if (!email) return false;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        try { logEmail_(email, subject, "INVALID EMAIL"); } catch (e) {}
        return false;
    }

    // Google enforces a daily recipient quota. Never attempt a send when
    // no quota remains; campaign delivery rows stay pending for resumption.
    let remaining = null;
    try { remaining = MailApp.getRemainingDailyQuota(); }
    catch (quotaReadError) {
        console.error("Could not read daily email quota", quotaReadError);
    }
    if (remaining !== null && remaining <= 0) {
        try { logEmail_(email, subject, "DEFERRED: DAILY EMAIL QUOTA EXHAUSTED"); } catch (e) {}
        return false;
    }

    const sender = getSystemSetting_("EMAIL_SENDER") || "NSA WAWM";
    const senderEmail = getSystemSetting_("EMAIL_ADDRESS");
    const raw = String(message == null ? "" : message);
    const looksLikeHtml = /<\s*(p|div|table|h[1-6]|ul|ol|li|br|strong|b|a|img)\b/i.test(raw);
    const content = looksLikeHtml
        ? raw
        : escapeEmailHtml_(raw).replace(/\r?\n/g, "<br>");
    const logoUrl = "https://nsawawm.github.io/assets/my_logo.png";
    const html = `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background:#f3f6f4;margin:0;padding:20px 8px;font-family:Arial,Helvetica,sans-serif;color:#26352d;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:#ffffff;border:1px solid #e3e9e5;border-radius:8px;overflow:hidden;">
<tr><td align="center" style="background:#006b3f;padding:17px 20px;">
<img src="${logoUrl}" width="48" height="48" alt="NSA WAWM" style="display:block;width:48px;height:48px;object-fit:contain;background:#ffffff;border:0;border-radius:6px;padding:3px;margin:0 auto 8px;">
<div style="font-size:16px;line-height:1.3;font-weight:bold;color:#ffffff;">NSA Wassa Amenfi West Municipal Secretariat</div>
<div style="font-size:11px;line-height:1.4;color:#e8f3ed;margin-top:4px;">Personnel Management System</div>
</td></tr>
<tr><td style="padding:21px 22px;font-size:14px;line-height:1.5;color:#303b35;">${content}</td></tr>
<tr><td align="center" style="background:#f3f7f4;border-top:1px solid #e5ebe7;padding:11px 16px;font-size:11px;line-height:1.4;color:#66736b;">Official communication from NSA WAWM Municipal Secretariat</td></tr>
</table>
</td></tr></table>`;

    try {
        const options = { to: email, subject: String(subject || "NSA WAWM Notification"), htmlBody: html, name: sender };
        if (senderEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(senderEmail)) options.replyTo = senderEmail;
        MailApp.sendEmail(options);
        try { logEmail_(email, subject, "SENT"); } catch (e) {}
        return true;
    } catch (error) {
        const detail = String(error && error.message ? error.message : error);
        try { logEmail_(email, subject, detail); } catch (e) {}
        console.error("EMAIL SEND ERROR", detail);
        return false;
    }
}

function escapeEmailHtml_(value) {
    return String(value == null ? "" : value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

/* ===== sendEvaluationSubmissionConfirmation_ ===== */
function sendEvaluationSubmissionConfirmation_(personnel, data, evaluationType) {
    const recipient = personnel["Email"];
    if (!recipient) {
        return false;
    }
    let subject = "NSA WAWM Evaluation Submission Confirmation";
    let message = "";
    if (evaluationType === "MONTHLY") {
        const months = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December"
        ];
        message =
            `

<p>Dear ${escapeEmailHtml_(personnel["Full Name"])},</p>

<p>

Your Monthly Evaluation has been successfully submitted.</p>
<p><b>Details:</b></p>
<p><b>NSS Number:</b>${escapeEmailHtml_(personnel["NSS Number"])}</p>
<p><b>Evaluation Period:</b>${months[Number(data.month) - 1]} / ${data.year}</p>
<p><b>Submission Date:</b>${new Date().toLocaleDateString()}</p>
<p>Thank you.</p>

<p>NSA WAWM</p>

`;
    }
    if (evaluationType === "ANNUAL") {
        message =
            `

<p>Dear ${escapeEmailHtml_(personnel["Full Name"])},</p>
<p>

Your Annual Evaluation has been successfully submitted.</p>
<p><b>Details:</b></p>
<p><b>NSS Number:</b>${escapeEmailHtml_(personnel["NSS Number"])}</p>
<p><b>Evaluation Period:</b>${data.period || "Annual Evaluation"}</p>
<p><b>Submission Date:</b>${new Date().toLocaleDateString()}</p>
<p>Thank you.</p>
<p>NSA WAWM</p>

`;
    }
    sendEmail_(recipient, subject, message);
}
/* ===== logEmail_ ===== */
function logEmail_(email, subject, status) {
    const sheet = getDatabase()
        .getSheetByName("EMAIL_LOG");
    if (!sheet) {
        return;
    }
    sheet.appendRow([
        new Date(),
        email || "",
        subject || "",
        status || "FAILED"
    ]);
}
/* ===== sendRegistrationConfirmation_ ===== */
function sendRegistrationConfirmation_(person) {
    const message = `

<p>

Dear ${escapeEmailHtml_(person.name)},

</p>


<p>

Your registration with NSA Wassa Amenfi West Municipal Secretariat has been completed successfully.

</p>


<p>

Please keep your registration details safe.

</p>


`;
    sendEmail_(person.email, "NSA Registration Confirmation", message);
    sendSMSOnline_(person.phone, "NSA WAWM: Your registration has been completed successfully.");
}
/* ===== createEvaluationTriggers ===== */
function createEvaluationTriggers() {
    /*
    ========================================================
    REMOVE OLD EVALUATION REMINDER TRIGGERS
    ========================================================
    */
    const triggers = ScriptApp.getProjectTriggers();
    triggers.forEach(function (trigger) {
        const handler = trigger.getHandlerFunction();
        if (handler === "sendEvaluationReminders" ||
            handler === "runEvaluationReminders") {
            ScriptApp.deleteTrigger(trigger);
        }
    });
    /*
    ========================================================
    CREATE ONE DAILY REMINDER TRIGGER
    ========================================================
    
    Runs approximately between 4:00 AM and 5:00 AM
    in the Google Apps Script project timezone.
    
    The reminder engine itself decides whether today
    is a valid working/reminder day.
    ========================================================
    */
    ScriptApp
        .newTrigger("runEvaluationReminders")
        .timeBased()
        .atHour(4)
        .everyDays(1)
        .create();
}
/* ===== getPendingMonthlyEvaluations_ ===== */
function getPendingMonthlyEvaluations_(filters) {
    filters = filters || {};
    const batchFilter = String(filters.batch || "").trim();
    const allowanceFilter = String(filters.allowance || "").trim();
    const personnelSheet = getDatabase().getSheetByName("REGISTERED_PERSONNEL");
    const evaluationSheet = getDatabase().getSheetByName("MONTHLY_EVALUATIONS");
    if (!personnelSheet || !evaluationSheet)
        throw new Error("Required monthly evaluation sheets were not found.");
    const personnelData = personnelSheet.getDataRange().getValues();
    const evaluationData = evaluationSheet.getDataRange().getValues();
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();
    // This calculation reads policy and holiday data. Do it once, not once
    // for every personnel record.
    const evaluationWindow = getEvaluationMonthWindow_(currentMonth, currentYear);
    const submitted = {};
    for (let i = 1; i < evaluationData.length; i++) {
        const row = getRowObject_("MONTHLY_EVALUATIONS", evaluationData[i]);
        const period = getMonthlySubmissionPeriodFromRow_(row);
        if (period.month === currentMonth && period.year === currentYear && reminderRowIsSubmitted_(row))
            submitted[String(row["NSS Number"] || "").trim().toUpperCase()] = true;
    }
    const pending = [];
    for (let i = 1; i < personnelData.length; i++) {
        const personnel = getRowObject_("REGISTERED_PERSONNEL", personnelData[i]);
        if (String(personnel["Allowance Type"] || "").trim().toUpperCase() !== "SUBVENTED")
            continue;
        if (batchFilter && String(personnel["Batch"] || "") !== batchFilter)
            continue;
        if (allowanceFilter && String(personnel["Allowance Type"] || "") !== allowanceFilter)
            continue;
        if (getServiceStatus_(personnel) !== "ACTIVE")
            continue;
        const nss = String(personnel["NSS Number"] || "").trim().toUpperCase();
        if (!nss || submitted[nss])
            continue;
        if (!isEvaluationMonthAllowed_(personnel, currentMonth, currentYear, evaluationWindow))
            continue;
        pending.push({ nss: nss, name: personnel["Full Name"], allowance: personnel["Allowance Type"], batch: personnel["Batch"] });
    }
    return pending;
}
/* ===== getPendingAnnualEvaluations_ ===== */
function getPendingAnnualEvaluations_(filters) {
    filters = filters || {};
    const batchFilter = String(filters.batch || "").trim();
    const allowanceFilter = String(filters.allowance || "").trim();
    const personnelSheet = getDatabase().getSheetByName("REGISTERED_PERSONNEL");
    const annualSheet = getDatabase().getSheetByName("ANNUAL_EVALUATIONS");
    if (!personnelSheet || !annualSheet)
        throw new Error("Required annual evaluation sheets were not found.");

    const personnelData = personnelSheet.getDataRange().getValues();
    const annualData = annualSheet.getDataRange().getValues();
    const submitted = Object.create(null);

    for (let i = 1; i < annualData.length; i++) {
        const row = getRowObject_("ANNUAL_EVALUATIONS", annualData[i]);
        if (!reminderRowIsSubmitted_(row)) continue;
        const nss = String(row["NSS Number"] || "").trim().toUpperCase();
        const period = normalizeEvaluationApprovalPeriodForFix_("ANNUAL", getAnnualEvaluationPeriodFromSubmissionRow_(row));
        if (nss && period) submitted[nss + "-" + period] = true;
    }

    const pending = [];
    for (let i = 1; i < personnelData.length; i++) {
        const personnel = getRowObject_("REGISTERED_PERSONNEL", personnelData[i]);
        if (batchFilter && String(personnel["Batch"] || "") !== batchFilter) continue;
        if (allowanceFilter && String(personnel["Allowance Type"] || "") !== allowanceFilter) continue;

        const serviceStatus = getServiceStatus_(personnel);
        if (serviceStatus !== "ACTIVE" && serviceStatus !== "COMPLETED") continue;

        // getServiceStatus_ has already validated both service dates. The
        // annual period resolver returns Service Year after the same checks,
        // but also rereads BATCH_SETTINGS and SYSTEM_SETTINGS for each row.
        // Those reads are unnecessary here because only the period key is used.
        const serviceYear = String(personnel["Service Year"] || "").trim();
        if (!serviceYear) continue;
        const serviceStart = new Date(personnel["Service Start Date"]);
        const serviceEnd = new Date(personnel["Service End Date"]);
        if (isNaN(serviceStart.getTime()) || isNaN(serviceEnd.getTime()) || serviceEnd < serviceStart) continue;

        const nss = String(personnel["NSS Number"] || "").trim().toUpperCase();
        if (!nss) continue;
        const periodKey = nss + "-" + normalizeEvaluationApprovalPeriodForFix_("ANNUAL", serviceYear);
        if (submitted[periodKey]) continue;
        pending.push({ nss: personnel["NSS Number"], name: personnel["Full Name"], allowance: personnel["Allowance Type"], batch: personnel["Batch"], period: serviceYear });
    }
    return pending;
}
/* ===== generateMonthlyEvaluationQRData ===== */
function generateMonthlyEvaluationQRData(nss, month, year) {
    return getApplicationURL()
        + "?page=home"
        + "&nssNumber="
        + encodeURIComponent(nss)
        + "&type=monthly"
        + "&month="
        + encodeURIComponent(month)
        + "&year="
        + encodeURIComponent(year);
}
/* ===== generateAnnualEvaluationQRData ===== */
function generateAnnualEvaluationQRData(nss) {
    return getApplicationURL()
        + "?page=home"
        + "&nssNumber="
        + encodeURIComponent(nss)
        + "&type=annual";
}
/* ===== runEvaluationReminders ===== */
function runEvaluationReminders() {
    const today = new Date();
    // Evaluations retain the existing working-day rule.
    if (!isWorkingDay_(today)) {
        return;
    }
    sendMonthlyEvaluationReminders_();
    sendAnnualEvaluationReminders_();
}
/* ===== sendEvaluationReminders ===== */
function sendEvaluationReminders() {
    // Convenient manual run: evaluations follow the working-day rule;
    // birthdays remain independent of working days.
    runEvaluationReminders();
    sendBirthdayGreetings();
}
/* ===== getPersonnelPhone_ ===== */
function getPersonnelPhone_(nss) {
    const person = findRegisteredPersonnel_(nss);
    if (!person) {
        return "";
    }
    return String(person["Phone Number"] || "").trim();
}
/* ===== getPersonnelEmail_ ===== */
function getPersonnelEmail_(nss) {
    const person = findRegisteredPersonnel_(nss);
    if (!person) {
        return "";
    }
    return String(person["Email"] || "").trim();
}
/* ===== getDashboardSummary ===== */
function getDashboardSummary() {
    const master = getDatabase()
        .getSheetByName("MASTER_PERSONNEL");
    const registered = getDatabase()
        .getSheetByName("REGISTERED_PERSONNEL");
    const monthly = getPendingMonthlyEvaluations_();
    const annual = getPendingAnnualEvaluations_();
    const totalMaster = Math.max(master.getLastRow() - 1, 0);
    const totalRegistered = Math.max(registered.getLastRow() - 1, 0);
    let rate = 0;
    if (totalMaster > 0) {
        rate =
            Math.round((totalRegistered
                /
                    totalMaster)
                *
                    100);
    }
    return {
        personnel: {
            master: totalMaster,
            registered: totalRegistered,
            registrationRate: rate
        },
        evaluation: {
            monthlyPending: monthly.length,
            annualPending: annual.length
        }
    };
}
/* ===== getRegisteredPersonnel_ ===== */
function getRegisteredPersonnel_() {
    return getSheetObjects_("REGISTERED_PERSONNEL");
}
/* ===== searchPersonnelAdvanced_ ===== */
function searchPersonnelAdvanced_(query) {
    const personnel = getRegisteredPersonnel_();
    if (!query) {
        return personnel;
    }
    query =
        String(query)
            .toLowerCase();
    return personnel.filter(function (p) {
        return (String(p["NSS Number"])
            .toLowerCase()
            .includes(query)
            ||
                String(p["Full Name"])
                    .toLowerCase()
                    .includes(query)
            ||
                String(p["Registration Number"])
                    .toLowerCase()
                    .includes(query));
    });
}
/* ===== getActiveBatches ===== */
function getActiveBatches() {
    const sheet = getDatabase().getSheetByName("BATCH_SETTINGS");
    if (!sheet || sheet.getLastRow() < 2) return [];
    const values = sheet.getDataRange().getValues();
    return values.slice(1).filter(function (row) { return String(row[4] || "").trim().toUpperCase() === "ACTIVE"; }).map(function (row) {
        return { id: String(row[0] || ""), name: String(row[1] || ""), startDate: formatDate_(row[2]), endDate: formatDate_(row[3]) };
    });
}
/* ===== getAllowanceStatistics_ ===== */
function getAllowanceStatistics_() {
    const result = {};
    getRegisteredPersonnel_().forEach(function (p) { const type = String(p["Allowance Type"] || "Unknown"); result[type] = (result[type] || 0) + 1; });
    return result;
}
/* ===== importMasterPersonnel ===== */
function importMasterPersonnel(rows, token) {
    const session = requireAdminSession_(token, ["DATA ENTRY", "ADMIN"]);
    if (!Array.isArray(rows) || !rows.length) return { status: "ERROR", message: "No valid rows are ready to import." };
    const lock = LockService.getScriptLock();
    let locked = false;
    try {
        lock.waitLock(10000); locked = true;
        const sheet = getDatabase().getSheetByName("MASTER_PERSONNEL");
        if (!sheet) throw new Error("MASTER_PERSONNEL sheet was not found.");
        const headers = getSheetHeaders_("MASTER_PERSONNEL");
        const nssIndex = headers.findIndex(function (h) { return normalizeImportHeader_(h) === "nssnumber"; });
        if (nssIndex < 0) throw new Error("MASTER_PERSONNEL is missing the NSS Number column.");
        const existing = new Set();
        if (sheet.getLastRow() >= 2) sheet.getRange(2, nssIndex + 1, sheet.getLastRow() - 1, 1).getDisplayValues().forEach(function (r) { const v = String(r[0] || "").trim().toUpperCase(); if (v) existing.add(v); });
        const seen = new Set();
        const accepted = [];
        let skipped = 0;
        rows.forEach(function (row) {
            if (!Array.isArray(row) || row.length !== headers.length) { skipped++; return; }
            const nss = String(row[nssIndex] || "").trim().toUpperCase();
            if (!nss || existing.has(nss) || seen.has(nss)) { skipped++; return; }
            seen.add(nss); accepted.push(row.map(sanitizeImportedCell_));
        });
        if (!accepted.length) return { status: "ERROR", message: "No new valid personnel records remain. The master list may already contain these NSS numbers.", imported: 0, skipped: skipped };
        sheet.getRange(sheet.getLastRow() + 1, 1, accepted.length, headers.length).setValues(accepted);
        SpreadsheetApp.flush();
        writeAuditLog_(session.email, "MASTER_IMPORT", accepted.length + " records imported; " + skipped + " skipped");
        return { status: "SUCCESS", message: accepted.length + " personnel records imported successfully.", imported: accepted.length, skipped: skipped };
    } catch (error) {
        return { status: "ERROR", message: String(error.message || error) };
    } finally { if (locked && lock.hasLock()) lock.releaseLock(); }
}
/* ===== previewMasterImport ===== */
function previewMasterImport(rows, token) {
    requireAdminSession_(token, ["DATA ENTRY", "ADMIN"]);
    if (!Array.isArray(rows) || rows.length < 2 || !Array.isArray(rows[0])) return { status: "ERROR", message: "The file must contain a header row and at least one data row." };
    const headers = getSheetHeaders_("MASTER_PERSONNEL");
    const incomingHeaders = rows[0].map(function (v) { return normalizeImportHeader_(v); });
    const aliases = { "NSS Number": ["nssnumber", "nss", "nationalservicenumber", "nationalservicenoss"], "Other Names": ["othernames", "firstname", "givenname"], "Last Name": ["lastname", "surname", "familyname"], "Student ID": ["studentid", "id"] };
    function sourceIndex(targetHeader) {
        const target = normalizeImportHeader_(targetHeader);
        const accepted = [target].concat((aliases[targetHeader] || []).map(normalizeImportHeader_));
        return incomingHeaders.findIndex(function (h) { return accepted.indexOf(h) >= 0; });
    }
    const nssIndex = sourceIndex("NSS Number");
    if (nssIndex < 0) return { status: "ERROR", message: "The file must include an NSS Number column." };
    const sheet = getDatabase().getSheetByName("MASTER_PERSONNEL");
    const existing = new Set();
    if (sheet && sheet.getLastRow() >= 2) {
        const db = sheet.getDataRange().getValues();
        const nssCol = db[0].findIndex(function (h) { return normalizeImportHeader_(h) === "nssnumber"; });
        if (nssCol >= 0) db.slice(1).forEach(function (r) { const v = String(r[nssCol] || "").trim().toUpperCase(); if (v) existing.add(v); });
    }
    const seen = new Set();
    const readyRows = [];
    const issues = [];
    let nonEmpty = 0;
    for (let i = 1; i < rows.length; i++) {
        const sourceRow = rows[i];
        if (!sourceRow || sourceRow.every(function (v) { return String(v == null ? "" : v).trim() === ""; })) continue;
        nonEmpty++;
        const nss = String(sourceRow[nssIndex] == null ? "" : sourceRow[nssIndex]).trim().toUpperCase();
        if (!nss) { issues.push({ row: i + 1, nss: "", reason: "NSS Number is missing." }); continue; }
        if (existing.has(nss)) { issues.push({ row: i + 1, nss: nss, reason: "NSS Number already exists in the master list." }); continue; }
        if (seen.has(nss)) { issues.push({ row: i + 1, nss: nss, reason: "Duplicate NSS Number in this file." }); continue; }
        seen.add(nss);
        const mapped = {};
        headers.forEach(function (header) {
            const idx = sourceIndex(header);
            let value = idx >= 0 ? sourceRow[idx] : "";
            if (value instanceof Date && !isNaN(value.getTime())) value = Utilities.formatDate(value, Session.getScriptTimeZone(), "yyyy-MM-dd");
            mapped[header] = value == null ? "" : value;
        });
        readyRows.push(headers.map(function (h) { return sanitizeImportedCell_(mapped[h]); }));
    }
    return { status: "SUCCESS", headers: headers, totalRows: nonEmpty, readyCount: readyRows.length, issueCount: issues.length, preview: readyRows.slice(0, 12).map(function (r) { const obj = {}; headers.forEach(function (h, i) { obj[h] = r[i]; }); return obj; }), readyRows: readyRows, issues: issues.slice(0, 100) };
}
/* ===== getCertificationSummary ===== */
function getCertificationSummary(batch, token) {
    requireAdminSession_(token, ["ADMIN"]);
    const selectedBatch = String(batch || "").trim();
    const personnel = getRegisteredPersonnel_().filter(function (p) { return !selectedBatch || String(p["Batch"] || "") === selectedBatch; });
    let eligible = 0;
    personnel.forEach(function (p) { if (getAnnualStatus_(p["NSS Number"]) === "SUBMITTED") eligible++; });
    return { total: personnel.length, eligible: eligible, pending: personnel.length - eligible, batch: selectedBatch || "ALL" };
}
/* ===== getAnnualStatus_ ===== */
function getAnnualStatus_(nss) {
    const sheet = getDatabase().getSheetByName("ANNUAL_EVALUATIONS");
    if (!sheet || sheet.getLastRow() < 2) return "PENDING";
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
        const row = getRowObject_("ANNUAL_EVALUATIONS", data[i]);
        if (String(row["NSS Number"] || "").trim().toUpperCase() === String(nss || "").trim().toUpperCase() && String(row["Status"] || "").trim().toUpperCase() === "SUBMITTED") return "SUBMITTED";
    }
    return "PENDING";
}
/* ===== getDocumentList ===== */
function getDocumentList(token) {
    requireAdminSession_(token, ["ADMIN"]);
    const sheet = getDatabase().getSheetByName("OFFICIAL_DOCUMENTS");
    if (!sheet || sheet.getLastRow() < 2) return [];
    return sheet.getDataRange().getValues().slice(1).filter(function (row) { return row[0]; }).map(function (row) {
        return { id: String(row[0] || ""), name: String(row[1] || ""), description: String(row[2] || ""), url: String(row[3] || ""), file: String(row[1] || ""), date: row[5] instanceof Date ? Utilities.formatDate(row[5], Session.getScriptTimeZone(), "dd/MM/yyyy") : String(row[5] || "") };
    });
}
/* ===== getReportFolder_ ===== */
function getReportFolder_() {
    const folders = DriveApp
        .getFoldersByName("Generated Registers");
    if (folders.hasNext()) {
        return folders.next();
    }
    return DriveApp
        .createFolder("Generated Registers");
}
/* ===== generatePersonnelReport ===== */
function generatePersonnelReport(token) {
    const session = requireAdminSession_(token, ["ADMIN"]);
    const data = getRegisteredPersonnel_();
    const doc = DocumentApp.create("NSA WAWM Personnel Register - " + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HHmm"));
    const body = doc.getBody();
    body.appendParagraph(getSystemSetting_("INSTITUTION_NAME") || "Wassa Amenfi West Municipal Secretariat").setHeading(DocumentApp.ParagraphHeading.HEADING1);
    body.appendParagraph("Personnel Register").setHeading(DocumentApp.ParagraphHeading.HEADING2);
    body.appendParagraph("Generated: " + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm"));
    const tableRows = [["Registration Number", "Full Name", "NSS Number", "Allowance", "Batch"]];
    data.forEach(function (p) { tableRows.push([String(p["Registration Number"] || ""), String(p["Full Name"] || ""), String(p["NSS Number"] || ""), String(p["Allowance Type"] || ""), String(p["Batch"] || "")]); });
    body.appendTable(tableRows);
    doc.saveAndClose();
    const file = DriveApp.getFileById(doc.getId());
    getReportFolder_().addFile(file); DriveApp.getRootFolder().removeFile(file);
    logReportExport_(session.email, "PERSONNEL", file.getUrl());
    return { status: "SUCCESS", url: file.getUrl(), message: "Personnel report generated." };
}
/* ===== generateAllowanceReport ===== */
function generateAllowanceReport(token) {
    const session = requireAdminSession_(token, ["ADMIN"]);
    const stats = getAllowanceStatistics_();
    const doc = DocumentApp.create("NSA WAWM Allowance Report - " + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HHmm"));
    const body = doc.getBody();
    body.appendParagraph(getSystemSetting_("INSTITUTION_NAME") || "Wassa Amenfi West Municipal Secretariat").setHeading(DocumentApp.ParagraphHeading.HEADING1);
    body.appendParagraph("Allowance Category Report").setHeading(DocumentApp.ParagraphHeading.HEADING2);
    const rows = [["Allowance Category", "Personnel Count"]];
    Object.keys(stats).sort().forEach(function (type) { rows.push([type, String(stats[type])]); });
    body.appendTable(rows); body.appendParagraph("Generated: " + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm"));
    doc.saveAndClose();
    const file = DriveApp.getFileById(doc.getId()); getReportFolder_().addFile(file); DriveApp.getRootFolder().removeFile(file);
    logReportExport_(session.email, "ALLOWANCE", file.getUrl());
    return { status: "SUCCESS", url: file.getUrl(), message: "Allowance report generated." };
}
/* ===== generateEvaluationReport ===== */
function generateEvaluationReport(token) {
    const session = requireAdminSession_(token, ["ADMIN"]);
    const monthly = getPendingMonthlyEvaluations_({});
    const annual = getPendingAnnualEvaluations_({});
    const doc = DocumentApp.create("NSA WAWM Evaluation Status Report - " + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HHmm"));
    const body = doc.getBody();
    body.appendParagraph(getSystemSetting_("INSTITUTION_NAME") || "Wassa Amenfi West Municipal Secretariat").setHeading(DocumentApp.ParagraphHeading.HEADING1);
    body.appendParagraph("Evaluation Status Report").setHeading(DocumentApp.ParagraphHeading.HEADING2);
    body.appendParagraph("Monthly Pending Evaluations").setHeading(DocumentApp.ParagraphHeading.HEADING3);
    const monthlyRows = [["NSS Number", "Name", "Allowance", "Batch"]];
    monthly.forEach(function (p) { monthlyRows.push([String(p.nss || ""), String(p.name || ""), String(p.allowance || ""), String(p.batch || "")]); });
    body.appendTable(monthlyRows);
    body.appendParagraph("Annual Pending Evaluations").setHeading(DocumentApp.ParagraphHeading.HEADING3);
    const annualRows = [["NSS Number", "Name", "Allowance", "Batch"]];
    annual.forEach(function (p) { annualRows.push([String(p.nss || ""), String(p.name || ""), String(p.allowance || ""), String(p.batch || "")]); });
    body.appendTable(annualRows);
    body.appendParagraph("Generated: " + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm"));
    doc.saveAndClose(); const file = DriveApp.getFileById(doc.getId()); getReportFolder_().addFile(file); DriveApp.getRootFolder().removeFile(file);
    logReportExport_(session.email, "EVALUATION", file.getUrl());
    return { status: "SUCCESS", url: file.getUrl(), message: "Evaluation report generated." };
}
/* ===== generateCertificationRegister ===== */
function generateCertificationRegister(batch, token) {
    const session = requireAdminSession_(token, ["ADMIN"]);
    const selectedBatch = String(batch || "").trim();
    const personnel = getRegisteredPersonnel_().filter(function (p) { return !selectedBatch || String(p["Batch"] || "") === selectedBatch; });
    const doc = DocumentApp.create("NSA WAWM Certification Register - " + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HHmm"));
    const body = doc.getBody();
    body.appendParagraph(getSystemSetting_("INSTITUTION_NAME") || "Wassa Amenfi West Municipal Secretariat").setHeading(DocumentApp.ParagraphHeading.HEADING1);
    body.appendParagraph("Certification Register" + (selectedBatch ? " — " + selectedBatch : " — All Batches")).setHeading(DocumentApp.ParagraphHeading.HEADING2);
    const rows = [["Registration Number", "Full Name", "NSS Number", "Allowance", "Batch", "Annual Evaluation", "Certification Status"]];
    personnel.forEach(function (p) {
        const annualStatus = getAnnualStatus_(p["NSS Number"]);
        rows.push([String(p["Registration Number"] || ""), String(p["Full Name"] || ""), String(p["NSS Number"] || ""), String(p["Allowance Type"] || ""), String(p["Batch"] || ""), annualStatus, annualStatus === "SUBMITTED" ? "ELIGIBLE" : "PENDING"]);
    });
    body.appendTable(rows); body.appendParagraph("Generated: " + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm"));
    doc.saveAndClose(); const file = DriveApp.getFileById(doc.getId()); getReportFolder_().addFile(file); DriveApp.getRootFolder().removeFile(file);
    logReportExport_(session.email, "CERTIFICATION", file.getUrl());
    return { status: "SUCCESS", url: file.getUrl(), message: "Certification register generated for " + personnel.length + " personnel records." };
}
/* ===== saveDocumentRecord ===== */
function saveDocumentRecord(data) {
    const sheet = getDatabase()
        .getSheetByName("DOCUMENTS");
    sheet.appendRow([
        Utilities.getUuid(),
        data.name,
        data.url,
        new Date()
    ]);
    return {
        status: "SUCCESS"
    };
}
/* ===== backupSystem ===== */
function backupSystem() {
    const ss = getDatabase();
    const folder = DriveApp
        .getFoldersByName("Backups");
    let backupFolder;
    if (folder.hasNext()) {
        backupFolder =
            folder.next();
    }
    else {
        backupFolder =
            DriveApp
                .createFolder("Backups");
    }
    const file = DriveApp
        .getFileById(ss.getId());
    file.makeCopy("NSA_WAWM_Backup_"
        +
            new Date(), backupFolder);
    return {
        status: "SUCCESS",
        message: "Backup completed successfully."
    };
}
/* ===== systemHealthCheck ===== */
function systemHealthCheck() {
    const requiredSheets = [
        "MASTER_PERSONNEL",
        "REGISTERED_PERSONNEL",
        "USERS",
        "USER_SESSIONS",
        "OTP_LOG",
        "BATCH_SETTINGS",
        "ALLOWANCE_TYPES",
        "MONTHLY_EVALUATIONS",
        "ANNUAL_EVALUATIONS",
        "REMINDER_LOG",
        "SMS_LOG",
        "EMAIL_LOG",
        "AUDIT_LOG",
        "SYSTEM_SETTINGS",
        "DOCUMENTS"
    ];
    const ss = getDatabase();
    let result = [];
    requiredSheets.forEach(function (sheetName) {
        result.push({
            sheet: sheetName,
            exists: ss.getSheetByName(sheetName) !== null
        });
    });
    return {
        system: SYSTEM_NAME,
        version: SYSTEM_VERSION,
        database: ss.getName(),
        checks: result
    };
}
/* ===== checkDuplicateNSS ===== */
function checkDuplicateNSS(nss) {
    const registered = findRegisteredPersonnel_(nss);
    if (registered) {
        return {
            duplicate: true,
            message: "NSS number already registered"
        };
    }
    return {
        duplicate: false
    };
}
/* ===== generateID_ ===== */
function generateID_(prefix) {
    return prefix
        +
            "-"
        +
            Utilities
                .formatDate(new Date(), Session
                .getScriptTimeZone(), "yyyyMMddHHmmss")
        +
            "-"
        +
            Math.floor(Math.random() * 1000);
}
/* ===== formatDate_ ===== */
function formatDate_(date) {
    if (!date) {
        return "";
    }
    return Utilities
        .formatDate(new Date(date), Session
        .getScriptTimeZone(), "dd/MM/yyyy");
}
/* ===== safeValue_ ===== */
function safeValue_(value) {
    if (value === null ||
        value === undefined) {
        return "";
    }
    return value;
}
/* ===== findMasterPhone_ ===== */
function findMasterPhone_(nss) {
    const person = findMasterPersonnel_(nss);
    if (person) {
        return person["Phone Number"] || "";
    }
    return "";
}
/* ===== createBatch ===== */
function createBatch(data, token) {
    const session = requireAdminSession_(token, ["ADMIN"]);
    data = data || {};
    const name = String(data.name || "").trim();
    const startDate = parseAdminDate_(data.startDate);
    const endDate = parseAdminDate_(data.endDate);
    if (!name || !startDate || !endDate) return { status: "ERROR", message: "Enter a batch name and valid start and end dates." };
    if (endDate < startDate) return { status: "ERROR", message: "End date cannot be before start date." };
    const sheet = getDatabase().getSheetByName("BATCH_SETTINGS");
    const rows = sheet.getDataRange().getValues();
    const duplicate = rows.slice(1).some(function (r) { return String(r[1] || "").trim().toLowerCase() === name.toLowerCase(); });
    if (duplicate) return { status: "ERROR", message: "A batch with this name already exists." };
    sheet.appendRow([generateID_("BATCH"), name, startDate, endDate, "ACTIVE"]);
    writeAuditLog_(session.email, "BATCH_CREATED", name);
    return { status: "SUCCESS", message: "Batch created successfully." };
}
/* ===== addSystemUser ===== */
function addSystemUser(data, token) {
    const session = requireAdminSession_(token, ["SUPER ADMIN"]);
    data = data || {};
    const name = String(data.name || "").trim();
    const email = String(data.email || "").trim().toLowerCase();
    const password = String(data.password || "");
    const role = String(data.role || "").trim().toUpperCase();
    const allowedRoles = ["SUPER ADMIN", "ADMIN", "NSA OFFICER", "EVALUATION OFFICER", "DATA ENTRY"];
    if (!name || !email || !password) return { status: "ERROR", message: "Name, email and password are required." };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { status: "ERROR", message: "Enter a valid email address." };
    if (password.length < 12) return { status: "ERROR", message: "Password must contain at least 12 characters." };
    if (allowedRoles.indexOf(role) < 0) return { status: "ERROR", message: "Select a valid system role." };
    const sheet = getDatabase().getSheetByName("USERS");
    if (!sheet) throw new Error("USERS sheet was not found.");
    const rows = sheet.getDataRange().getValues();
    if (rows.slice(1).some(function (row) { return String(row[2] || "").trim().toLowerCase() === email; })) {
        return { status: "ERROR", message: "A user with this email address already exists." };
    }
    sheet.appendRow([generateID_("USR"), name, email, hashUserPassword_(password), role, "ACTIVE", new Date()]);
    writeAuditLog_(session.email, "USER_CREATED", email + " / " + role);
    return { status: "SUCCESS", message: "System user created successfully." };
}
/* ===== toggleUserStatus ===== */
function toggleUserStatus(id, token) {
    const session = requireAdminSession_(token, ["SUPER ADMIN"]);
    const sheet = getDatabase().getSheetByName("USERS");
    const data = sheet.getDataRange().getValues();
    let targetIndex = -1;
    for (let i = 1; i < data.length; i++) if (String(data[i][0]) === String(id)) { targetIndex = i; break; }
    if (targetIndex < 0) return { status: "ERROR", message: "User not found." };
    const row = data[targetIndex];
    const targetEmail = String(row[2] || "").trim().toLowerCase();
    const currentStatus = String(row[5] || "").trim().toUpperCase();
    const role = String(row[4] || "").trim().toUpperCase();
    if (targetEmail === String(session.email || "").trim().toLowerCase() && currentStatus === "ACTIVE") {
        return { status: "ERROR", message: "You cannot deactivate your own account." };
    }
    if (role === "SUPER ADMIN" && currentStatus === "ACTIVE") {
        const activeSuperAdmins = data.slice(1).filter(function (r) {
            return String(r[4] || "").trim().toUpperCase() === "SUPER ADMIN" && String(r[5] || "").trim().toUpperCase() === "ACTIVE";
        }).length;
        if (activeSuperAdmins <= 1) return { status: "ERROR", message: "The last active Super Admin account cannot be deactivated." };
    }
    const nextStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    sheet.getRange(targetIndex + 1, 6).setValue(nextStatus);
    if (nextStatus === "INACTIVE") {
        const sessionsSheet = getDatabase().getSheetByName("USER_SESSIONS");
        if (sessionsSheet && sessionsSheet.getLastRow() > 1) {
            const sessions = sessionsSheet.getDataRange().getValues();
            for (let j = 1; j < sessions.length; j++) if (String(sessions[j][1] || "").trim().toLowerCase() === targetEmail && String(sessions[j][5] || "").trim().toUpperCase() === "ACTIVE") sessionsSheet.getRange(j + 1, 6).setValue("REVOKED");
        }
    }
    writeAuditLog_(session.email, "USER_STATUS_CHANGED", targetEmail + " / " + nextStatus);
    return { status: "SUCCESS", statusValue: nextStatus, message: "User status changed to " + nextStatus + "." };
}
/* ===== getAuditLogs ===== */
function getAuditLogs(token) {
    requireAdminSession_(token, ["ADMIN"]);
    const sheet = getDatabase().getSheetByName("AUDIT_LOG");
    if (!sheet || sheet.getLastRow() < 2) return [];
    return sheet.getDataRange().getValues().slice(1).reverse().map(function (row) {
        return { date: row[0] instanceof Date ? Utilities.formatDate(row[0], Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm:ss") : String(row[0] || ""), user: String(row[1] || ""), action: String(row[2] || ""), details: String(row[3] || "") };
    });
}
/* ===== cleanExpiredOTP ===== */
function cleanExpiredOTP() {
    const sheet = getDatabase()
        .getSheetByName("OTP_LOG");
    const data = sheet
        .getDataRange()
        .getValues();
    for (let i = 1; i < data.length; i++) {
        if (new Date(data[i][4])
            <
                new Date()) {
            sheet
                .getRange(i + 1, 7)
                .setValue("EXPIRED");
        }
    }
}
/* ===== verifyProductionReady ===== */
function verifyProductionReady() {
    const health = systemHealthCheck();
    let failed = [];
    health.checks.forEach(function (item) {
        if (!item.exists) {
            failed.push(item.sheet);
        }
    });
    if (failed.length > 0) {
        return {
            status: "ERROR",
            missing: failed
        };
    }
    return {
        status: "READY",
        message: "NSA WAWM system is ready for deployment."
    };
}
/* ===== getPersonnelProfile ===== */
function getPersonnelProfile(nss, token) {
    requireAdminSession_(token, ["ADMIN"]);
    const person = findRegisteredPersonnel_(String(nss || "").trim());
    if (!person) return { status: "ERROR", message: "Personnel not found" };
    const agencyInfo = getAgencyInformationForPersonnel(nss, token);
    person["_Agency Information"] = agencyInfo && agencyInfo.agency ? agencyInfo.agency : null;
    person["_Assigned Supervisor"] = agencyInfo && agencyInfo.supervisor ? agencyInfo.supervisor : null;
    return { status: "SUCCESS", data: serialiseAdminValue_(person) };
}
/* ===== uploadPersonnelPhoto ===== */
function uploadPersonnelPhoto(photoData) {
    try {
        const result = savePersonnelPhoto_(photoData.nssNumber, photoData.base64);
        return {
            status: "SUCCESS",
            fileId: result.id,
            url: result.url
        };
    }
    catch (error) {
        return {
            status: "ERROR",
            message: error.message
        };
    }
}
/* ===== getSystemUsers ===== */
function getSystemUsers(token) {
    requireAdminSession_(token, ["SUPER ADMIN"]);
    const sheet = getDatabase().getSheetByName("USERS");
    const data = sheet.getDataRange().getValues();
    return data.slice(1).filter(function (row) { return row.some(function (v) { return v !== "" && v !== null; }); }).map(function (row) {
        return { id: String(row[0] || ""), name: String(row[1] || ""), email: String(row[2] || ""), role: String(row[4] || ""), status: String(row[5] || ""), createdDate: row[6] instanceof Date ? Utilities.formatDate(row[6], Session.getScriptTimeZone(), "dd/MM/yyyy") : String(row[6] || "") };
    });
}
/* ===== processVerificationQR ===== */
function processVerificationQR(data) {
    const nss = data.nssNumber;
    const type = data.type;
    if (!nss) {
        return {
            status: "ERROR",
            message: "NSS Number missing"
        };
    }
    if (type === "monthly") {
        return {
            status: "MONTHLY",
            nss: nss,
            month: data.month,
            year: data.year
        };
    }
    if (type === "annual") {
        return {
            status: "ANNUAL",
            nss: nss
        };
    }
    return {
        status: "REGISTRATION",
        nss: nss
    };
}
/* ===== submitMonthlyConfirmation ===== */
function submitMonthlyConfirmation(data) {
    data = data || {};
    return captureEvaluationSubmission({
        nssNumber: data.nssNumber || data.nss,
        type: "MONTHLY",
        month: data.month,
        year: data.year,
        captureCode: data.captureCode,
        source: data.source || "QR SUBMISSION",
        updateExisting: data.updateExisting,
        sessionToken: data.sessionToken || data.token
    });
}
/* ===== submitAnnualConfirmation ===== */
function submitAnnualConfirmation(data) {
    data = data || {};
    return captureEvaluationSubmission({
        nssNumber: data.nssNumber || data.nss,
        type: "ANNUAL",
        source: data.source || "QR SUBMISSION",
        updateExisting: data.updateExisting,
        sessionToken: data.sessionToken || data.token
    });
}
/* ===== sendEvaluationEmail_ ===== */
function sendEvaluationEmail_(data) {
    try {
        MailApp.sendEmail({
            to: data.email,
            subject: data.subject,
            htmlBody: data.message
        });
        logNotification_({
            nss: data.nss,
            type: data.type,
            channel: "EMAIL",
            recipient: data.email,
            subject: data.subject,
            message: data.message,
            status: "SENT"
        });
        return true;
    }
    catch (error) {
        logNotification_({
            nss: data.nss,
            type: data.type,
            channel: "EMAIL",
            recipient: data.email,
            subject: data.subject,
            message: error.message,
            status: "FAILED"
        });
        return false;
    }
}
/* ===== sendEvaluationSMS_ ===== */
function sendEvaluationSMS_(data) {
    try {
        sendSMSOnline_(data.phone, data.message);
        logNotification_({
            nss: data.nss,
            type: data.type,
            channel: "SMS",
            recipient: data.phone,
            subject: "",
            message: data.message,
            status: "SENT"
        });
        return true;
    }
    catch (error) {
        logNotification_({
            nss: data.nss,
            type: data.type,
            channel: "SMS",
            recipient: data.phone,
            subject: "",
            message: error.message,
            status: "FAILED"
        });
        return false;
    }
}
/* ===== getPersonnelByNSS ===== */
function getPersonnelByNSS(nss) {
    const person = findRegisteredPersonnel_(nss);
    if (!person) {
        return {
            status: "ERROR",
            message: "Personnel not found"
        };
    }
    return {
        status: "SUCCESS",
        personnel: {
            name: person.name,
            nss: person.nss,
            institution: person.institution,
            allowanceType: person.allowanceType,
            batch: person.batch
        }
    };
}
/* ===== getPersonnelEvaluationStatus ===== */
function getPersonnelEvaluationStatus(nss) {
    const db = getDatabase();
    const monthly = db
        .getSheetByName("MONTHLY_EVALUATIONS")
        .getDataRange()
        .getValues();
    const annual = db
        .getSheetByName("ANNUAL_EVALUATIONS")
        .getDataRange()
        .getValues();
    let monthlyCount = 0;
    let annualCount = 0;
    for (let i = 1; i < monthly.length; i++) {
        if (String(monthly[i][1]) === String(nss)) {
            monthlyCount++;
        }
    }
    for (let i = 1; i < annual.length; i++) {
        if (String(annual[i][1]) === String(nss)) {
            annualCount++;
        }
    }
    return {
        monthly: monthlyCount > 0
            ?
                "Submitted"
            :
                "Pending",
        annual: annualCount > 0
            ?
                "Submitted"
            :
                "Pending"
    };
}
/* ===== generateOTP_ ===== */
function generateOTP_() {
    return Math.floor(100000 +
        Math.random() * 900000).toString();
}
/* ===== getActiveOTPRecord_ ===== */
function getActiveOTPRecord_(token, purpose) {
    const sheet = getDatabase()
        .getSheetByName("OTP_LOG");
    if (!sheet) {
        return null;
    }
    const data = sheet
        .getDataRange()
        .getValues();
    const cleanToken = String(token || "").trim();
    const cleanPurpose = String(purpose || "")
        .trim()
        .toUpperCase();
    const now = new Date();
    for (let i = data.length - 1; i >= 1; i--) {
        const rowToken = String(data[i][1] || "").trim();
        const rowPurpose = String(data[i][3] || "")
            .trim()
            .toUpperCase();
        const status = String(data[i][7] || "")
            .trim()
            .toUpperCase();
        const expiry = new Date(data[i][6]);
        if (rowToken === cleanToken &&
            rowPurpose === cleanPurpose &&
            status === "ACTIVE" &&
            expiry > now) {
            return {
                row: i + 1,
                token: rowToken,
                nssNumber: data[i][2],
                purpose: rowPurpose,
                otp: String(data[i][4]),
                created: data[i][5],
                expiry: expiry,
                reused: true
            };
        }
    }
    return null;
}
/* ===== createOTPRecord_ ===== */
function createOTPRecord_(data) {
    const ss = getDatabase();
    const sheet = ss.getSheetByName("OTP_LOG");
    if (!sheet) {
        throw new Error("OTP_LOG sheet not found.");
    }
    const token = String(data.token ||
        Utilities.getUuid()).trim();
    const purpose = String(data.purpose || "")
        .trim()
        .toUpperCase();
    const existing = findActiveOTP_(token, purpose);
    /*
     * Same registration session already
     * has an active OTP.
     *
     * Do not create another one.
     */
    if (existing &&
        data.forceNew !== true) {
        existing.reused = true;
        return existing;
    }
    /*
     * If this is a genuine resend,
     * invalidate the previous OTP.
     */
    if (data.forceNew === true) {
        const values = sheet
            .getDataRange()
            .getValues();
        for (let i = 1; i < values.length; i++) {
            const rowToken = String(values[i][1] || "").trim();
            const rowPurpose = String(values[i][3] || "")
                .trim()
                .toUpperCase();
            const status = String(values[i][7] || "")
                .trim()
                .toUpperCase();
            if (rowToken === token &&
                rowPurpose === purpose &&
                status === "ACTIVE") {
                sheet
                    .getRange(i + 1, 8)
                    .setValue("USED");
            }
        }
    }
    const otp = generateOTP_();
    const now = new Date();
    const expiry = new Date(now.getTime() +
        10 * 60 * 1000);
    sheet.appendRow([
        new Date().getTime(),
        token,
        data.nssNumber,
        purpose,
        otp,
        now,
        expiry,
        "ACTIVE"
    ]);
    return {
        token: token,
        nssNumber: data.nssNumber,
        purpose: purpose,
        otp: otp,
        created: now,
        expiry: expiry,
        reused: false
    };
}
/* ===== sendOTP_ ===== */
function sendOTP_(data) {
    const personnel = getPersonnelByNSS_(data.nssNumber);
    if (!personnel) {
        return {
            status: "ERROR",
            message: "Personnel record not found."
        };
    }
    const otpRecord = createOTPRecord_({
        nssNumber: data.nssNumber,
        purpose: data.purpose,
        token: data.token,
        forceNew: data.forceNew === true
    });
    /*
     * Existing active OTP.
     * Do NOT send another one.
     */
    if (otpRecord.reused) {
        return {
            status: "SUCCESS",
            token: otpRecord.token,
            alreadySent: true,
            message: "Verification code already sent. Please enter the code received."
        };
    }
    const message = `Your Municipal Registrtion verification code is ${otpRecord.otp}. It expires in 10 minutes.`;
    let delivered = false;
    /*
     * SMS
     */
    if (personnel.phone) {
        try {
            sendSMSOnline_(personnel.phone, message);
            delivered = true;
        }
        catch (error) {
            console.error("OTP SMS ERROR", error);
        }
    }
    /*
   * EMAIL
   */
    if (personnel.email) {
        try {
            const otpEmail = `

<p>
Dear ${escapeEmailHtml_(personnel.name)},
</p>


<p>
Your registration with 
<strong>
NSA Wassa Amenfi West Municipal Secretariat
</strong>
requires verification.
</p>


<p>
Please use the verification code below:
</p>



<div style="
background:#f4f6f8;
padding:20px;
text-align:center;
border-radius:10px;
">

<h1 style="
color:#006b3f;
letter-spacing:6px;
">
${otpRecord.otp}
</h1>

</div>

<p>
This code will expire after 
<strong>10 minutes</strong>.
</p>

<p>
If this verification code request is not made by you or on your behalf, please ignore this message.
</p>

<p>
Thank you.
</p>

<p>
<strong>
NSA Wassa Amenfi West Municipal Secretariat
</strong>
</p>


`;
            sendEmail_(personnel.email, "NSA WAWM Secretariat", otpEmail);
            delivered = true;
        }
        catch (error) {
            console.error("OTP EMAIL ERROR", error);
        }
    }
    if (!delivered) {
        return {
            status: "ERROR",
            message: "The verification code could not be delivered."
        };
    }
    return {
        status: "SUCCESS",
        token: otpRecord.token,
        alreadySent: false
    };
}
/* ===== verifyOTP_ ===== */
function verifyOTP_(token, otp, purpose) {
    const sheet = getDatabase()
        .getSheetByName("OTP_LOG");
    if (!sheet) {
        return {
            status: "ERROR",
            message: "OTP_LOG sheet not found."
        };
    }
    const data = sheet
        .getDataRange()
        .getValues();
    const cleanToken = String(token || "").trim();
    const cleanOTP = String(otp || "").trim();
    const cleanPurpose = String(purpose || "")
        .trim()
        .toUpperCase();
    for (let i = data.length - 1; i >= 1; i--) {
        const rowToken = String(data[i][1] || "").trim();
        const rowPurpose = String(data[i][3] || "")
            .trim()
            .toUpperCase();
        const rowOTP = String(data[i][4] || "").trim();
        const status = String(data[i][7] || "")
            .trim()
            .toUpperCase();
        if (rowToken === cleanToken
            &&
                rowPurpose === cleanPurpose
            &&
                rowOTP === cleanOTP
            &&
                status === "ACTIVE") {
            const expiry = new Date(data[i][6]);
            if (new Date() > expiry) {
                sheet
                    .getRange(i + 1, 8)
                    .setValue("EXPIRED");
                return {
                    status: "ERROR",
                    message: "OTP expired"
                };
            }
            sheet
                .getRange(i + 1, 8)
                .setValue("USED");
            return {
                status: "SUCCESS",
                nssNumber: data[i][2],
                purpose: data[i][3]
            };
        }
    }
    return {
        status: "ERROR",
        message: "Invalid OTP"
    };
}

/* ===== sendEvaluationOTP ===== */
function sendEvaluationOTP(data) {
    return sendOTP_({
        nssNumber: data.nssNumber,
        purpose: "EVALUATION"
    });
}
/* ===== confirmEvaluationOTP ===== */
function confirmEvaluationOTP(token, otp) {
    return verifyOTP_(token, otp, "EVALUATION");
}
/* ===== getApplicationUrl ===== */
function getApplicationUrl() {
    return ScriptApp.getService().getUrl();
}
/* ===== getAdminDashboardAnalytics ===== */
/**
 * Operational dashboard aggregates. Historical monthly eligibility follows the
 * same active/subvented and service-date rules used by getMonthlyCompliance().
 * Historical annual charts report submitted records only; current annual
 * pending/compliance is calculated separately from the current Service Year.
 */
function getAdminDashboardOperationalData_(registered, filters) {
    filters = filters || {};
    const tz = Session.getScriptTimeZone() || "Africa/Accra";
    const now = new Date();
    const granularity = String(filters.granularity || "MONTH").toUpperCase();
    const mode = ["DAY", "MONTH", "YEAR"].indexOf(granularity) >= 0 ? granularity : "MONTH";
    const monthSelected = Math.max(1, Math.min(12, Number(filters.month || (now.getMonth() + 1))));
    const yearSelected = Math.max(2000, Math.min(2100, Number(filters.year || now.getFullYear())));

    function dateKey(date, format) {
        return Utilities.formatDate(date, tz, format);
    }
    function parseDate(value) {
        try { return parseAdminDate_(value); } catch (e) { return null; }
    }
    function nameOf(person) {
        return String(person["Full Name"] || person["Name"] || person["Personnel Name"] || "").trim();
    }
    function nssOf(person) {
        return String(person["NSS Number"] || person["NSS"] || "").trim().toUpperCase();
    }
    function submissionDate(row) {
        return parseDate(row["Submission Date"] || row["Submitted At"] || row["Timestamp"] || row["Date Submitted"] || row["Created At"]);
    }
    function sheetRows(sheetName) {
        const sheet = getDatabase().getSheetByName(sheetName);
        if (!sheet || sheet.getLastRow() < 2) return [];
        const values = sheet.getDataRange().getValues();
        const rows = [];
        for (let i = 1; i < values.length; i++) rows.push(getRowObject_(sheetName, values[i]));
        return rows;
    }

    const people = (registered || []).filter(function(p) { return nssOf(p); });
    const personByNss = Object.create(null);
    people.forEach(function(p) { personByNss[nssOf(p)] = p; });

    // Registrations: daily (30 days), monthly (12 months), or yearly (5 years).
    const registrationLabels = [];
    const registrationCounts = Object.create(null);
    let registrationFormat, registrationStart, registrationCount;
    if (mode === "DAY") {
        registrationFormat = "yyyy-MM-dd"; registrationCount = 30;
        registrationStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
    } else if (mode === "YEAR") {
        registrationFormat = "yyyy"; registrationCount = 5;
        registrationStart = new Date(now.getFullYear() - 4, 0, 1);
    } else {
        registrationFormat = "yyyy-MM"; registrationCount = 12;
        registrationStart = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    }
    for (let i = 0; i < registrationCount; i++) {
        const d = mode === "DAY"
            ? new Date(registrationStart.getFullYear(), registrationStart.getMonth(), registrationStart.getDate() + i)
            : mode === "YEAR"
                ? new Date(registrationStart.getFullYear() + i, 0, 1)
                : new Date(registrationStart.getFullYear(), registrationStart.getMonth() + i, 1);
        const key = dateKey(d, registrationFormat);
        registrationLabels.push(key);
        registrationCounts[key] = 0;
    }
    people.forEach(function(p) {
        const d = parseDate(p["Date Registered"]);
        if (!d) return;
        const key = dateKey(d, registrationFormat);
        if (Object.prototype.hasOwnProperty.call(registrationCounts, key)) registrationCounts[key]++;
    });
    const registrationTrend = {
        labels: registrationLabels.map(function(k) {
            if (mode === "DAY") return k.substring(5);
            if (mode === "MONTH") {
                const parts = k.split("-");
                return Utilities.formatDate(new Date(Number(parts[0]), Number(parts[1]) - 1, 1), tz, "MMM yy");
            }
            return k;
        }),
        datasets: [{ label: "Personnel registered", data: registrationLabels.map(function(k) { return registrationCounts[k]; }) }]
    };

    // Historical monthly status: use the same eligibility rule as the live compliance page.
    const monthlyRows = sheetRows("MONTHLY_EVALUATIONS");
    const monthlySubmitted = Object.create(null);
    monthlyRows.forEach(function(row) {
        if (!reminderRowIsSubmitted_(row)) return;
        const nss = String(row["NSS Number"] || "").trim().toUpperCase();
        const period = getMonthlySubmissionPeriodFromRow_(row);
        if (!nss || !period.month || !period.year) return;
        monthlySubmitted[nss + "|" + Number(period.year) + "|" + Number(period.month)] = true;
    });
    const monthlyLabels = [];
    const monthlyDone = [];
    const monthlyPending = [];
    const monthlyTotal = [];
    for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const m = d.getMonth() + 1, y = d.getFullYear();
        let total = 0, done = 0;
        let windowInfo = null;
        try { windowInfo = getEvaluationMonthWindow_(m, y); } catch (e) {}
        people.forEach(function(p) {
            if (String(p["Allowance Type"] || "").trim().toUpperCase() !== "SUBVENTED") return;
            if (getServiceStatus_(p) !== "ACTIVE") return;
            const nss = nssOf(p);
            if (!nss) return;
            let allowed = false;
            try { allowed = isEvaluationMonthAllowed_(p, m, y, windowInfo); } catch (e) {}
            if (!allowed) return;
            total++;
            if (monthlySubmitted[nss + "|" + y + "|" + m]) done++;
        });
        monthlyLabels.push(dateKey(d, "MMM yy"));
        monthlyDone.push(done);
        monthlyPending.push(Math.max(0, total - done));
        monthlyTotal.push(total);
    }

    // Annual submissions by service-year period, deduplicated by personnel and period.
    const annualRows = sheetRows("ANNUAL_EVALUATIONS");
    const annualCounts = Object.create(null);
    const annualSeen = Object.create(null);
    annualRows.forEach(function(row) {
        if (!reminderRowIsSubmitted_(row)) return;
        const nss = String(row["NSS Number"] || "").trim().toUpperCase();
        const periodRaw = String(getAnnualEvaluationPeriodFromSubmissionRow_(row) || "").trim();
        if (!nss || !periodRaw) return;
        const period = normalizeEvaluationApprovalPeriodForFix_("ANNUAL", periodRaw) || periodRaw;
        const key = nss + "|" + period.toUpperCase();
        if (annualSeen[key]) return;
        annualSeen[key] = true;
        annualCounts[period] = (annualCounts[period] || 0) + 1;
    });
    const annualPeriods = Object.keys(annualCounts).sort(function(a,b) {
        const ay = Number((a.match(/\d{4}/) || ["0"])[0]);
        const by = Number((b.match(/\d{4}/) || ["0"])[0]);
        return ay - by || a.localeCompare(b, undefined, {numeric:true});
    }).slice(-6);

    // Selected-period compliance cards and batch breakdowns.
    let selectedMonthly = { overall: { total: 0, submitted: 0, pending: 0, compliance: 0 }, batches: {} };
    let selectedAnnual = { overall: { total: 0, submitted: 0, pending: 0, compliance: 0 }, batches: {} };
    try { selectedMonthly = getMonthlyCompliance(monthSelected, yearSelected, {}); } catch (e) { Logger.log("Dashboard selected monthly compliance: " + e.message); }
    try { selectedAnnual = getAnnualCompliance({}); } catch (e) { Logger.log("Dashboard selected annual compliance: " + e.message); }

    // Recent personnel and evaluation records, with names resolved from the personnel register.
    let registeredInSelectedMonth = 0, registeredInSelectedYear = 0;
    const recentRegistrations = people.map(function(p) {
        const registeredDate = parseDate(p["Date Registered"]);
        if (registeredDate && registeredDate.getFullYear() === yearSelected) {
            registeredInSelectedYear++;
            if (registeredDate.getMonth() + 1 === monthSelected) registeredInSelectedMonth++;
        }
        return { name: nameOf(p), nss: nssOf(p), batch: String(p["Batch"] || ""), allowance: String(p["Allowance Type"] || ""), date: registeredDate ? dateKey(registeredDate, "yyyy-MM-dd") : String(p["Date Registered"] || "") };
    }).sort(function(a,b) { return String(b.date).localeCompare(String(a.date)); }).slice(0, 10);

    function recentSubmissions(rows, type) {
        const list = [];
        const seen = Object.create(null);
        rows.forEach(function(row) {
            if (!reminderRowIsSubmitted_(row)) return;
            const nss = String(row["NSS Number"] || "").trim().toUpperCase();
            const person = personByNss[nss];
            if (!person) return;
            let period = "";
            if (type === "MONTHLY") {
                const p = getMonthlySubmissionPeriodFromRow_(row);
                period = p.month && p.year ? Utilities.formatDate(new Date(Number(p.year), Number(p.month)-1, 1), tz, "MMM yyyy") : "";
            } else {
                period = String(getAnnualEvaluationPeriodFromSubmissionRow_(row) || "");
            }
            const submittedAt = submissionDate(row);
            const key = nss + "|" + period;
            if (seen[key]) return;
            seen[key] = true;
            list.push({ name: nameOf(person), nss: nss, batch: String(person["Batch"] || ""), period: period, date: submittedAt ? dateKey(submittedAt, "yyyy-MM-dd HH:mm") : "" });
        });
        return list.sort(function(a,b) { return String(b.date).localeCompare(String(a.date)); }).slice(0, 10);
    }

    return {
        granularity: mode,
        selectedMonth: monthSelected,
        selectedYear: yearSelected,
        registeredInSelectedMonth: registeredInSelectedMonth,
        registeredInSelectedYear: registeredInSelectedYear,
        registrationTrend: registrationTrend,
        monthlyEvaluationTrend: { labels: monthlyLabels, datasets: [
            { label: "Submitted", data: monthlyDone },
            { label: "Pending", data: monthlyPending }
        ], totals: monthlyTotal },
        annualEvaluationTrend: { labels: annualPeriods, datasets: [
            { label: "Submitted annual evaluations", data: annualPeriods.map(function(p) { return annualCounts[p] || 0; }) }
        ] },
        selectedMonthlyCompliance: selectedMonthly,
        selectedAnnualCompliance: selectedAnnual,
        recentRegistrations: recentRegistrations,
        recentMonthlySubmissions: recentSubmissions(monthlyRows, "MONTHLY"),
        recentAnnualSubmissions: recentSubmissions(annualRows, "ANNUAL")
    };
}

function getAdminDashboardAnalytics(token, filters) {
    filters = filters || {};
    requireAdminSession_(token, ["ADMIN"]);
    const db = getDatabase();
    const masterSheet = db.getSheetByName("MASTER_PERSONNEL");
    if (!masterSheet) throw new Error("MASTER_PERSONNEL sheet was not found.");

    let masterCount = 0;
    const masterLastRow = masterSheet.getLastRow();
    if (masterLastRow > 1 && masterSheet.getLastColumn() > 0) {
        const masterHeaders = masterSheet.getRange(1, 1, 1, masterSheet.getLastColumn()).getDisplayValues()[0].map(function (h) { return String(h || "").trim(); });
        const nssIndex = masterHeaders.indexOf("NSS Number");
        if (nssIndex >= 0) {
            masterCount = masterSheet.getRange(2, nssIndex + 1, masterLastRow - 1, 1).getDisplayValues().reduce(function (count, row) {
                return count + (String(row[0] || "").trim() ? 1 : 0);
            }, 0);
        } else {
            masterCount = masterLastRow - 1;
        }
    }

    const registered = getRegisteredPersonnel_();
    const registeredWithNss = registered.filter(function (p) { return String(p["NSS Number"] || "").trim() !== ""; });
    const allowance = Object.create(null), batches = Object.create(null), year = Object.create(null), month = Object.create(null);
    registered.forEach(function (p) {
        const type = String(p["Allowance Type"] || "Unknown").trim() || "Unknown";
        const batch = String(p["Batch"] || "Unassigned").trim() || "Unassigned";
        allowance[type] = (allowance[type] || 0) + 1;
        batches[batch] = (batches[batch] || 0) + 1;
        const date = parseAdminDate_(p["Date Registered"]);
        if (date) {
            const y = String(date.getFullYear());
            const m = Utilities.formatDate(date, Session.getScriptTimeZone() || "Africa/Accra", "MMM yyyy");
            year[y] = (year[y] || 0) + 1;
            month[m] = (month[m] || 0) + 1;
        }
    });

    let users = 0;
    const usersSheet = db.getSheetByName("USERS");
    if (usersSheet && usersSheet.getLastRow() > 1 && usersSheet.getLastColumn() > 0) {
        const userHeaders = usersSheet.getRange(1, 1, 1, usersSheet.getLastColumn()).getDisplayValues()[0].map(function (h) { return String(h || "").trim(); });
        const statusIndex = userHeaders.indexOf("Status");
        if (statusIndex >= 0) {
            users = usersSheet.getRange(2, statusIndex + 1, usersSheet.getLastRow() - 1, 1).getDisplayValues().filter(function (row) {
                return String(row[0] || "").trim().toUpperCase() === "ACTIVE";
            }).length;
        }
    }

    const operational = getAdminDashboardOperationalData_(registered, filters);
    let monthlyPending = 0, annualPending = 0;
    try { monthlyPending = getPendingMonthlyEvaluations_({}).length; }
    catch (e) { Logger.log("Dashboard monthly pending error: " + e.message); }
    try { annualPending = getPendingAnnualEvaluations_({}).length; }
    catch (e) { Logger.log("Dashboard annual pending error: " + e.message); }

    return {
        totalPersonnel: masterCount,
        registered: registeredWithNss.length,
        rate: masterCount ? Math.round(registeredWithNss.length / masterCount * 100) : 0,
        allowance: allowance,
        batches: batches,
        batch: batches,
        year: year,
        month: month,
        registration: year,
        registrationTrend: operational.registrationTrend,
        monthlyEvaluationTrend: operational.monthlyEvaluationTrend,
        annualEvaluationTrend: operational.annualEvaluationTrend,
        operational: operational,
        monthlyPending: monthlyPending,
        annualPending: annualPending,
        users: users
    };
}


function getAdminDashboardTrends_(registered) {
    const peopleByNss = Object.create(null);
    const registrationCounts = Object.create(null);
    const registrationYears = Object.create(null);
    const monthlyCounts = Object.create(null);
    const monthlyYears = Object.create(null);
    const monthlySeen = Object.create(null);
    const annualCounts = Object.create(null);
    const annualYears = Object.create(null);
    const annualSeen = Object.create(null);

    (registered || []).forEach(function (p) {
        const nss = String(p["NSS Number"] || "").trim().toUpperCase();
        if (nss && !peopleByNss[nss]) peopleByNss[nss] = p;
        const date = parseAdminDate_(p["Date Registered"]);
        if (!date) return;
        const year = String(date.getFullYear());
        const batch = String(p["Batch"] || "Unassigned").trim() || "Unassigned";
        const allowance = String(p["Allowance Type"] || "Unknown").trim() || "Unknown";
        const series = batch + " — " + allowance;
        registrationYears[year] = true;
        if (!registrationCounts[series]) registrationCounts[series] = Object.create(null);
        registrationCounts[series][year] = (registrationCounts[series][year] || 0) + 1;
    });

    function readEvaluationSheet_(sheetName) {
        const sheet = getDatabase().getSheetByName(sheetName);
        if (!sheet || sheet.getLastRow() < 2) return [];
        const values = sheet.getDataRange().getValues();
        const result = [];
        for (let i = 1; i < values.length; i++) result.push(getRowObject_(sheetName, values[i]));
        return result;
    }

    readEvaluationSheet_("MONTHLY_EVALUATIONS").forEach(function (row) {
        if (!reminderRowIsSubmitted_(row)) return;
        const nss = String(row["NSS Number"] || "").trim().toUpperCase();
        const person = peopleByNss[nss];
        if (!nss || !person) return;
        const period = getMonthlySubmissionPeriodFromRow_(row);
        const year = String(period.year || "").trim();
        const month = String(period.month || "").trim();
        if (!/^\d{4}$/.test(year) || !month) return;
        const uniqueKey = nss + "|" + year + "|" + month;
        if (monthlySeen[uniqueKey]) return;
        monthlySeen[uniqueKey] = true;
        const batch = String(person["Batch"] || "Unassigned").trim() || "Unassigned";
        monthlyYears[year] = true;
        if (!monthlyCounts[batch]) monthlyCounts[batch] = Object.create(null);
        monthlyCounts[batch][year] = (monthlyCounts[batch][year] || 0) + 1;
    });

    readEvaluationSheet_("ANNUAL_EVALUATIONS").forEach(function (row) {
        if (!reminderRowIsSubmitted_(row)) return;
        const nss = String(row["NSS Number"] || "").trim().toUpperCase();
        const person = peopleByNss[nss];
        if (!nss || !person) return;
        const period = String(getAnnualEvaluationPeriodFromSubmissionRow_(row) || "").trim();
        if (!period) return;
        const normalPeriod = normalizeEvaluationApprovalPeriodForFix_("ANNUAL", period) || period;
        const uniqueKey = nss + "|" + normalPeriod.toUpperCase();
        if (annualSeen[uniqueKey]) return;
        annualSeen[uniqueKey] = true;
        const batch = String(person["Batch"] || "Unassigned").trim() || "Unassigned";
        annualYears[period] = true;
        if (!annualCounts[batch]) annualCounts[batch] = Object.create(null);
        annualCounts[batch][period] = (annualCounts[batch][period] || 0) + 1;
    });

    function orderedYears(map, annualMode) {
        return Object.keys(map).sort(function (a, b) {
            const ay = Number((String(a).match(/\d{4}/) || ["0"])[0]);
            const by = Number((String(b).match(/\d{4}/) || ["0"])[0]);
            if (ay !== by) return ay - by;
            return String(a).localeCompare(String(b), undefined, { numeric: true });
        });
    }
    function toDatasets(counts, labels) {
        return Object.keys(counts).sort().map(function (series) {
            return { label: series, data: labels.map(function (label) { return Number(counts[series][label] || 0); }) };
        });
    }
    const registrationLabels = orderedYears(registrationYears, false);
    const monthlyLabels = orderedYears(monthlyYears, false);
    const annualLabels = orderedYears(annualYears, true);
    return {
        registration: { labels: registrationLabels, datasets: toDatasets(registrationCounts, registrationLabels) },
        monthly: { labels: monthlyLabels, datasets: toDatasets(monthlyCounts, monthlyLabels) },
        annual: { labels: annualLabels, datasets: toDatasets(annualCounts, annualLabels) }
    };
}
function saveGeneralSettings(data, token) {
    const session = requireAdminSession_(token, ["ADMIN"]);
    data = data || {};
    const map = {
        SYSTEM_NAME: String(data.systemName || "").trim(),
        INSTITUTION_NAME: String(data.institution || "").trim(),
        SUPPORT_EMAIL: String(data.supportEmail || "").trim(),
        SUPPORT_PHONE: String(data.supportPhone || "").trim(),
        LOGO_URL: String(data.logoUrl || "").trim()
    };
    if (map.SUPPORT_EMAIL && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(map.SUPPORT_EMAIL)) return { status: "ERROR", message: "Enter a valid support email address." };
    if (map.LOGO_URL && !/^https:\/\//i.test(map.LOGO_URL)) return { status: "ERROR", message: "Logo URL must use HTTPS." };
    Object.keys(map).forEach(function (key) { if (map[key] !== "") upsertSystemSetting_(key, map[key]); });
    writeAuditLog_(session.email, "GENERAL_SETTINGS_UPDATED", "System branding and support details updated");
    return { status: "SUCCESS", message: "General settings saved." };
}
/* ===== uploadOfficialDocument ===== */
function uploadOfficialDocument(data, token) {
    const session = requireAdminSession_(token, ["ADMIN"]);
    data = data || {};
    const name = String(data.name || "").trim().replace(/[\\/:*?"<>|]/g, "-");
    const description = String(data.description || "").trim();
    const mimeType = String(data.mimeType || "").toLowerCase();
    const allowedTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv", "image/png", "image/jpeg"];
    const fileData = String(data.file || "");
    if (!name || !fileData || fileData.indexOf("base64,") < 0) return { status: "ERROR", message: "Choose a document to upload." };
    if (allowedTypes.indexOf(mimeType) < 0) return { status: "ERROR", message: "Unsupported document type." };
    const encoded = fileData.split("base64,").pop();
    const bytes = Utilities.base64Decode(encoded);
    if (bytes.length > 10 * 1024 * 1024) return { status: "ERROR", message: "Documents must be 10 MB or smaller." };
    const folderName = "NSA_WAWM_DOCUMENTS";
    const folders = DriveApp.getFoldersByName(folderName);
    const folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);
    const blob = Utilities.newBlob(bytes, mimeType, name);
    const file = folder.createFile(blob);
    const sheet = getDatabase().getSheetByName("OFFICIAL_DOCUMENTS");
    sheet.appendRow([Utilities.getUuid(), name, description, file.getUrl(), file.getId(), new Date()]);
    writeAuditLog_(session.email, "DOCUMENT_UPLOADED", name);
    return { status: "SUCCESS", message: "Document uploaded successfully.", id: file.getId() };
}
/* ===== deleteOfficialDocument ===== */
function deleteOfficialDocument(id, token) {
    const session = requireAdminSession_(token, ["ADMIN"]);
    const sheet = getDatabase().getSheetByName("OFFICIAL_DOCUMENTS");
    if (!sheet) return { status: "ERROR", message: "Document register was not found." };
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]) !== String(id)) continue;
        const fileId = String(data[i][4] || "");
        if (fileId) DriveApp.getFileById(fileId).setTrashed(true);
        const name = String(data[i][1] || "");
        sheet.deleteRow(i + 1);
        writeAuditLog_(session.email, "DOCUMENT_DELETED", name);
        return { status: "SUCCESS", message: "Document deleted." };
    }
    return { status: "ERROR", message: "Document not found." };
}
/* ===== getAllowanceAnalytics ===== */
function getAllowanceAnalytics(token) {
    requireAdminSession_(token, ["ADMIN"]);
    return getAllowanceStatistics_();
}
/* ===== getBatchAnalytics ===== */
function getBatchAnalytics(token) {
    requireAdminSession_(token, ["ADMIN"]);
    const result = {};
    getRegisteredPersonnel_().forEach(function (p) { const batch = String(p["Batch"] || "Unassigned"); result[batch] = (result[batch] || 0) + 1; });
    return result;
}
/* ===== getRegistrationTrend ===== */
function getRegistrationTrend(token) {
    requireAdminSession_(token, ["ADMIN"]);
    const result = {};
    getRegisteredPersonnel_().forEach(function (p) { const date = parseAdminDate_(p["Date Registered"]); if (date) { const key = String(date.getFullYear()); result[key] = (result[key] || 0) + 1; } });
    return result;
}
/* ===== initializeSystem ===== */
function initializeSystem() {
    // Use the same canonical schema and setup path as the primary initializer.
    return setupNSA_WAWM();
}
/* ===== saveMonthlyEvaluationCalendar ===== */
function saveMonthlyEvaluationCalendar(data, token) {
    const session = requireAdminSession_(token, ["ADMIN"]);
    data = data || {};
    const batch = String(data.batch || "").trim();
    const month = Number(data.month);
    const year = Number(data.year);
    const start = parseAdminDate_(data.startDate);
    const end = parseAdminDate_(data.endDate);
    if (!batch || !Number.isInteger(month) || month < 1 || month > 12 || !Number.isInteger(year) || year < 2000 || year > 2100 || !start || !end) return { status: "ERROR", message: "Complete all monthly calendar fields with valid values." };
    if (end < start) return { status: "ERROR", message: "End date cannot be before start date." };
    const sheet = getDatabase().getSheetByName("MONTHLY_EVALUATION_CALENDAR");
    const values = sheet.getDataRange().getValues();
    let target = -1;
    for (let i = 1; i < values.length; i++) if (String(values[i][1] || "").trim().toLowerCase() === batch.toLowerCase() && Number(values[i][2]) === month && Number(values[i][3]) === year && String(values[i][7] || "ACTIVE").toUpperCase() === "ACTIVE") { target = i + 1; break; }
    const row = [target > 0 ? values[target - 1][0] : Utilities.getUuid(), batch, month, year, start, end, session.email, "ACTIVE"];
    if (target > 0) sheet.getRange(target, 1, 1, row.length).setValues([row]); else sheet.appendRow(row);
    writeAuditLog_(session.email, target > 0 ? "MONTHLY_CALENDAR_UPDATED" : "MONTHLY_CALENDAR_CREATED", batch + " / " + month + "/" + year);
    return { status: "SUCCESS", message: target > 0 ? "Monthly evaluation calendar updated." : "Monthly evaluation calendar saved." };
}
/* ===== saveAnnualEvaluationCalendar ===== */
function saveAnnualEvaluationCalendar(data, token) {
    const session = requireAdminSession_(token, ["ADMIN"]);
    data = data || {};
    const batch = String(data.batch || "").trim();
    const serviceYear = String(data.serviceYear || "").trim();
    const firstStart = parseAdminDate_(data.firstStart);
    const firstEnd = parseAdminDate_(data.firstEnd);
    const secondStart = parseAdminDate_(data.secondStart);
    const secondEnd = parseAdminDate_(data.secondEnd);
    const thirdStart = parseAdminDate_(data.thirdStart);
    const thirdEnd = parseAdminDate_(data.thirdEnd);
    if (!batch || !serviceYear || !firstStart || !firstEnd || !secondStart || !secondEnd || !thirdStart || !thirdEnd) return { status: "ERROR", message: "Complete all annual calendar fields with valid values." };
    if (firstEnd < firstStart || secondEnd < secondStart || thirdEnd < thirdStart) return { status: "ERROR", message: "Each evaluation window must end on or after its start date." };
    if (secondStart < firstEnd || thirdStart < secondEnd) return { status: "ERROR", message: "Annual evaluation windows must not overlap and must be in chronological order." };
    const sheet = ensureAnnualEvaluationCalendarSheet_();
    const values = sheet.getDataRange().getValues();
    let target = -1;
    for (let i = 1; i < values.length; i++) if (String(values[i][1] || "").trim().toLowerCase() === batch.toLowerCase() && String(values[i][2] || "").trim().toLowerCase() === serviceYear.toLowerCase() && String(values[i][11] || "ACTIVE").toUpperCase() === "ACTIVE") { target = i + 1; break; }
    const evaluationYear = firstStart.getFullYear();
    const row = [target > 0 ? values[target - 1][0] : Utilities.getUuid(), batch, serviceYear, evaluationYear, firstStart, firstEnd, secondStart, secondEnd, thirdStart, thirdEnd, session.email, "ACTIVE"];
    if (target > 0) sheet.getRange(target, 1, 1, row.length).setValues([row]); else sheet.appendRow(row);
    writeAuditLog_(session.email, target > 0 ? "ANNUAL_CALENDAR_UPDATED" : "ANNUAL_CALENDAR_CREATED", batch + " / " + serviceYear);
    return { status: "SUCCESS", message: target > 0 ? "Annual evaluation calendar updated." : "Annual evaluation calendar saved." };
}
/* ===== getEvaluationCalendars ===== */
function getEvaluationCalendars(token) {
    requireAdminSession_(token, ["ADMIN"]);
    const result = [];
    const db = getDatabase();
    const monthlySheet = db.getSheetByName("MONTHLY_EVALUATION_CALENDAR");
    if (monthlySheet && monthlySheet.getLastRow() >= 2) {
        const rows = monthlySheet.getDataRange().getValues();
        for (let i = 1; i < rows.length; i++) result.push({ id: String(rows[i][0] || ""), type: "Monthly", batch: String(rows[i][1] || ""), period: String(rows[i][2] || "") + " / " + String(rows[i][3] || ""), startDate: formatDate_(rows[i][4]), endDate: formatDate_(rows[i][5]), status: String(rows[i][7] || "ACTIVE") });
    }
    const annualSheet = ensureAnnualEvaluationCalendarSheet_();
    if (annualSheet.getLastRow() >= 2) {
        const rows = annualSheet.getDataRange().getValues();
        for (let i = 1; i < rows.length; i++) result.push({ id: String(rows[i][0] || ""), type: "Annual", batch: String(rows[i][1] || ""), period: String(rows[i][2] || ""), startDate: formatDate_(rows[i][4]), endDate: formatDate_(rows[i][9]), status: String(rows[i][11] || "ACTIVE") });
    }
    return result;
}
/* ===== getVerificationDetails ===== */
function getVerificationDetails(data) {
    if (!data ||
        !data.nssNumber) {
        return {
            status: "ERROR",
            message: "NSS Number missing"
        };
    }
    const personnel = findRegisteredPersonnel_(data.nssNumber);
    if (!personnel) {
        return {
            status: "ERROR",
            message: "Personnel is not registered"
        };
    }
    const today = new Date();
    const response = {
        status: "SUCCESS",
        personnel: {
            name: personnel["Full Name"],
            nss: personnel["NSS Number"],
            institution: personnel["Institution"],
            batch: personnel["Batch"],
            allowance: personnel["Allowance Type"],
            dateRegistered: personnel["Date Registered"],
            serviceStart: personnel["Service Start Date"],
            serviceEnd: personnel["Service End Date"],
            serviceStatus: getServiceStatus_(personnel)
        },
        evaluation: {
            type: data.type,
            month: data.month,
            year: data.year,
            period: "",
            status: "",
            message: "",
            deadline: "",
            submittedDate: "",
            capturedBy: ""
        },
        canSubmit: false,
        approvalRequired: false,
        alreadySubmitted: false,
        requiresCaptureCode: false
    };
    /*
    =====================================
    MONTHLY EVALUATION
    =====================================
    */
    if (String(data.type || "").trim().toLowerCase() === "monthly") {
        const month = Number(data.month);
        const year = Number(data.year);
        const periodCheck = validateMonthlyEvaluationPeriod_(personnel, month, year);
        if (!periodCheck.valid) {
            response.evaluation.status = "NOT_ALLOWED";
            response.evaluation.message =
                periodCheck.message;
            return response;
        }
        const deadline = getMonthlyDeadline_(month, year);
        response.evaluation.period =
            deadline.monthName
                +
                    " "
                +
                    year;
        response.evaluation.deadline =
            deadline.endText;
        /*
        CHECK SERVICE PERIOD
        */
        if (!isEvaluationMonthAllowed_(personnel, month, year)) {
            response.evaluation.status =
                "NOT_ALLOWED";
            response.evaluation.message =
                "This evaluation month is outside the official service period.";
            return response;
        }
        /*
        CHECK EXISTING SUBMISSION
        */
        const existingMonthly = checkMonthlySubmission_(data.nssNumber, month, year);
        if (existingMonthly.found) {
            response.evaluation.status =
                "SUBMITTED";
            response.evaluation.message =
                "This monthly evaluation has already been submitted.";
            response.evaluation.submittedDate =
                existingMonthly.submittedDate;
            response.evaluation.capturedBy =
                existingMonthly.capturedBy;
            response.evaluation.captureCode =
                existingMonthly.captureCode;
            response.alreadySubmitted = true;
            return response;
        }
        /* LATE EVALUATION APPROVAL CHECK */
        const eligibilityDate = getEvaluationEligibilityDate_(personnel);
        if (!eligibilityDate) {
            response.evaluation.status = "ERROR";
            response.evaluation.message = "Personnel eligibility date could not be determined.";
            return response;
        }
        const lateRegistration = isAfterCalendarDateForEvaluationFix_(eligibilityDate, deadline.endDate);
        const lateSubmission = isAfterCalendarDateForEvaluationFix_(today, deadline.endDate);
        if (lateRegistration || lateSubmission) {
            let approval;
            try {
                approval = getEvaluationApprovalDecision_(data.nssNumber, "MONTHLY", month + "/" + year);
            }
            catch (approvalError) {
                response.evaluation.status = "ERROR";
                response.evaluation.message = String(approvalError.message || approvalError);
                return response;
            }
            response.approvalDecision = approval.decision || "";
            if (response.approvalDecision === "REJECTED") {
                response.evaluation.status = "NOT_ALLOWED";
                response.evaluation.message = "Late evaluation submission was rejected by the officer.";
                response.approvalRequired = false;
                return response;
            }
            if (response.approvalDecision !== "APPROVED") {
                response.evaluation.status = "APPROVAL_REQUIRED";
                response.evaluation.message = "Officer approval is required before this late monthly evaluation can be submitted.";
                response.approvalRequired = true;
                return response;
            }
        }
        if (!isAfterCalendarDateForEvaluationFix_(today, deadline.endDate)) {
            response.evaluation.status =
                "AVAILABLE";
            response.evaluation.message =
                "Monthly evaluation is available.";
            response.canSubmit = true;
            response.requiresCaptureCode = true;
        }
        else {
            response.evaluation.status =
                "LATE";
            response.evaluation.message =
                "Deadline passed. Submission will be recorded as late.";
            response.canSubmit = true;
            response.requiresCaptureCode = true;
        }
    }
    /*
    =====================================
    ANNUAL EVALUATION
    =====================================
    */
    if (String(data.type).toLowerCase()
        === "annual") {
        const period = getAnnualEvaluationPeriod_(personnel, today);
        if (!period) {
            response.evaluation.status =
                "ERROR";
            response.evaluation.message =
                "Annual evaluation period not configured for this batch.";
            return response;
        }
        response.evaluation.period =
            period.period;
        /*
        CHECK EXISTING ANNUAL SUBMISSION
        */
        const existingAnnual = checkAnnualSubmission_(data.nssNumber, period.period);
        if (existingAnnual.found) {
            response.evaluation.status =
                "SUBMITTED";
            response.evaluation.message =
                "This annual evaluation has already been submitted.";
            response.evaluation.submittedDate =
                existingAnnual.submittedDate;
            response.evaluation.capturedBy =
                existingAnnual.capturedBy;
            response.alreadySubmitted = true;
            return response;
        }
        const serviceEndDate = new Date(period.serviceEndDate);
        const endOfServiceDay = new Date(serviceEndDate.getFullYear(), serviceEndDate.getMonth(), serviceEndDate.getDate(), 23, 59, 59, 999);
        response.evaluation.deadline = formatDate_(serviceEndDate);
        if (today <= endOfServiceDay) {
            response.evaluation.status = "AVAILABLE";
            response.evaluation.message = "Annual evaluation is available.";
            response.canSubmit = true;
        }
        else {
            let approval;
            try {
                approval = getEvaluationApprovalDecision_(data.nssNumber, "ANNUAL", period.period);
            }
            catch (approvalError) {
                response.evaluation.status = "ERROR";
                response.evaluation.message = String(approvalError.message || approvalError);
                return response;
            }
            response.approvalDecision = approval.decision || "";
            if (response.approvalDecision === "REJECTED") {
                response.evaluation.status = "NOT_ALLOWED";
                response.evaluation.message = "Late annual evaluation submission was rejected by the officer.";
                return response;
            }
            if (response.approvalDecision !== "APPROVED") {
                response.evaluation.status = "APPROVAL_REQUIRED";
                response.evaluation.message = "Officer approval is required before this late annual evaluation can be submitted.";
                response.approvalRequired = true;
                return response;
            }
            response.evaluation.status = "LATE";
            response.evaluation.message = "Late annual evaluation approved. Submission is allowed.";
            response.canSubmit = true;
        }
    }
    return response;
}
/* ===== getAnnualEvaluationCalendar_ ===== */
function getAnnualEvaluationCalendar_(batch) {
    const sheet = ensureAnnualEvaluationCalendarSheet_();
    const data = sheet.getDataRange().getValues();
    for (let i = data.length - 1; i >= 1; i--) {
        if (String(data[i][1] || "").trim().toLowerCase() === String(batch || "").trim().toLowerCase() && String(data[i][11] || "ACTIVE").toUpperCase() === "ACTIVE") {
            return { serviceYear: data[i][2], evaluationYear: data[i][3], firstStart: data[i][4], firstEnd: data[i][5], secondStart: data[i][6], secondEnd: data[i][7], thirdStart: data[i][8], thirdEnd: data[i][9] };
        }
    }
    return null;
}
/* ===== getMonthlyDeadline_ ===== */
function getMonthlyDeadline_(month, year) {
    let monthNumber;
    /*
    ========================================================
    ACCEPT:
  
    September
    September 2026
    9
    09
    ========================================================
    */
    if (typeof month === "number") {
        monthNumber = month - 1;
    }
    else if (!isNaN(month)) {
        monthNumber =
            Number(month) - 1;
    }
    else {
        monthNumber =
            new Date(Date.parse(month + " 1, " + year)).getMonth();
    }
    const numericYear = Number(year);
    /*
    ========================================================
    ORIGINAL CALENDAR WINDOW
  
    15TH - 20TH
    ========================================================
    */
    const originalStart = new Date(numericYear, monthNumber, 15);
    const originalEnd = new Date(numericYear, monthNumber, 20);
    /*
    ========================================================
    FIND FIRST WORKING DAY
    FROM 15TH THROUGH 20TH
    ========================================================
    */
    let startDate = null;
    for (let d = new Date(originalStart); d <= originalEnd; d.setDate(d.getDate() + 1)) {
        if (isWorkingDay_(d)) {
            startDate =
                new Date(d);
            break;
        }
    }
    /*
    ========================================================
    FIND LAST WORKING DAY
    FROM 20TH BACK TO 15TH
    ========================================================
    */
    let endDate = null;
    for (let d = new Date(originalEnd); d >= originalStart; d.setDate(d.getDate() - 1)) {
        if (isWorkingDay_(d)) {
            endDate =
                new Date(d);
            break;
        }
    }
    /*
    ========================================================
    NO WORKING DAY IN THE ENTIRE WINDOW
  
    Example:
  
    15th - 20th are all weekends/holidays.
  
    Therefore:
  
    - No opening reminder
    - No daily reminder
    - No day-before reminder
    - No deadline reminder
    ========================================================
    */
    if (!startDate ||
        !endDate) {
        return {
            month: month,
            year: numericYear,
            hasWorkingDay: false,
            startDate: null,
            endDate: null,
            dayBeforeDeadline: null,
            startText: "",
            endText: "",
            dayBeforeDeadlineText: "",
            isOpeningDay: false,
            isDayBeforeDeadline: false,
            isDeadline: false,
            isReminderDay: false,
            reminderType: null
        };
    }
    /*
  ========================================================
  FIND WORKING DAY IMMEDIATELY BEFORE DEADLINE
  
  IMPORTANT:
  
  Start from the calendar day BEFORE endDate.
  
  This ensures the deadline itself can NEVER be
  classified as DAY_BEFORE_DEADLINE.
  ========================================================
  */
    let dayBeforeDeadline = null;
    const dayBeforeCandidate = new Date(endDate);
    dayBeforeCandidate.setDate(dayBeforeCandidate.getDate() - 1);
    for (let d = new Date(dayBeforeCandidate); d >= startDate; d.setDate(d.getDate() - 1)) {
        if (isWorkingDay_(d)) {
            dayBeforeDeadline =
                new Date(d);
            break;
        }
    }
    /*
    ========================================================
    NORMALISE TODAY TO CALENDAR DATE
  
    This prevents the 6:00 AM trigger from causing
    deadline-day comparisons to fail because endDate
    is stored at midnight.
    ========================================================
    */
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    /*
    ========================================================
    NORMALISE WINDOW DATES
    ========================================================
    */
    const windowStart = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const windowEnd = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
    /*
    ========================================================
    CHECK WHETHER TODAY IS A WORKING DAY IN THE WINDOW
    ========================================================
    */
    const todayIsWorkingDay = isWorkingDay_(today);
    const withinWindow = todayIsWorkingDay &&
        today >= windowStart &&
        today <= windowEnd;
    /*
    ========================================================
    IDENTIFY SPECIAL DAYS
    ========================================================
    */
    const isOpeningDay = withinWindow &&
        isSameDate_(today, windowStart);
    const isDeadline = withinWindow &&
        isSameDate_(today, windowEnd);
    const isDayBeforeDeadline = withinWindow &&
        dayBeforeDeadline &&
        isSameDate_(today, dayBeforeDeadline);
    /*
    ========================================================
    DETERMINE REMINDER TYPE
  
    PRIORITY:
  
    1. DEADLINE
    2. DAY_BEFORE_DEADLINE
    3. OPENING
    4. DAILY
    ========================================================
    */
    let reminderType = null;
    if (isDeadline) {
        reminderType =
            "DEADLINE";
    }
    else if (isDayBeforeDeadline) {
        reminderType =
            "DAY_BEFORE_DEADLINE";
    }
    else if (isOpeningDay) {
        reminderType =
            "OPENING";
    }
    else if (withinWindow) {
        reminderType =
            "DAILY";
    }
    /*
    ========================================================
    RETURN COMPLETE MONTHLY EVALUATION WINDOW
    ========================================================
    */
    return {
        month: month,
        year: numericYear,
        hasWorkingDay: true,
        startDate: startDate,
        endDate: endDate,
        dayBeforeDeadline: dayBeforeDeadline,
        startText: formatDate_(startDate),
        endText: formatDate_(endDate),
        dayBeforeDeadlineText: dayBeforeDeadline
            ? formatDate_(dayBeforeDeadline)
            : "",
        isOpeningDay: isOpeningDay,
        isDayBeforeDeadline: isDayBeforeDeadline,
        isDeadline: isDeadline,
        isReminderDay: withinWindow,
        reminderType: reminderType
    };
}
/* ===== moveBackwardToWorkingDay_ ===== */
function moveBackwardToWorkingDay_(date) {
    let result = new Date(date);
    while (!isWorkingDay_(result)) {
        result.setDate(result.getDate() - 1);
    }
    return result;
}
/* ===== isEvaluationMonthAllowed_ ===== */
function isEvaluationMonthAllowed_(personnel, month, year, precomputedWindow) {
    /*
    ==============================
    SERVICE PERIOD CHECK
    ==============================
    */
    const start = new Date(personnel["Service Start Date"]);
    const end = new Date(personnel["Service End Date"]);
    if (isNaN(start.getTime())
        ||
            isNaN(end.getTime())) {
        return false;
    }
    const target = new Date(year, month - 1, 1);
    if (target <
        new Date(start.getFullYear(), start.getMonth(), 1)) {
        return false;
    }
    /*
    ==============================
    LAST ALLOWED MONTH
    PERSONNEL DOES NOT SUBMIT
    IN FINAL MONTH OF SERVICE
    ==============================
    */
    const finalAllowed = new Date(end.getFullYear(), end.getMonth() - 1, 1);
    if (target >
        finalAllowed) {
        return false;
    }
    /*
    ==============================
    REGISTRATION / VERIFICATION CHECK
    ==============================
    */
    let eligibilityDate = null;
    /*
    Regional verification takes priority
    */
    if (personnel["Regional Verification Date"]) {
        const verification = new Date(personnel["Regional Verification Date"]);
        if (!isNaN(verification.getTime())) {
            eligibilityDate = verification;
        }
    }
    /*
    Fallback to district registration date
    */
    if (!eligibilityDate
        &&
            personnel["Date Registered"]) {
        const registered = new Date(personnel["Date Registered"]);
        if (!isNaN(registered.getTime())) {
            eligibilityDate = registered;
        }
    }
    if (eligibilityDate) {
        const window = precomputedWindow === undefined
            ? getEvaluationMonthWindow_(month, year)
            : precomputedWindow;
        if (window
            &&
                eligibilityDate >
                    window.deadline) {
            return false;
        }
    }
    return true;
}
/* ===== getAnnualEvaluationEligibilityWindow_ ===== */
function getAnnualEvaluationEligibilityWindow_(serviceEndDate) {
    const policy = getEvaluationPolicySettings_();
    const end = new Date(serviceEndDate);
    if (isNaN(end)) {
        return null;
    }
    const start = new Date(end);
    start.setMonth(start.getMonth()
        -
            policy.annualPreMonths);
    const close = new Date(end);
    close.setMonth(close.getMonth()
        +
            policy.annualPostMonths);
    return {
        startDate: start,
        endDate: close
    };
}
/* ===== isEvaluationWorkingDay_ ===== */
function isEvaluationWorkingDay_(date) {
    const day = date.getDay();
    if (day === 0 ||
        day === 6) {
        return false;
    }
    const holidaySheet = getDatabase()
        .getSheetByName("HOLIDAYS");
    if (!holidaySheet) {
        return true;
    }
    const holidays = holidaySheet
        .getDataRange()
        .getValues();
    for (let i = 1; i < holidays.length; i++) {
        const holiday = new Date(holidays[i][1]);
        if (holiday.toDateString()
            ===
                date.toDateString()) {
            return false;
        }
    }
    return true;
}
/* ===== approveLateRegistration ===== */
function approveLateRegistration(data) {
    if (!data || !(data.nss || data.nssNumber) || !data.type || !data.decision || data.month == null || data.year == null)
        return { status: "ERROR", message: "Missing approval information." };
    const session = validateSession(String(data.sessionToken || data.token || "").trim());
    if (!session || !session.valid)
        return { status: "ERROR", message: "Your officer session is invalid or expired." };
    const role = String(session.role || "").trim().toUpperCase();
    if (["SUPER ADMIN", "ADMIN", "NSA OFFICER", "EVALUATION OFFICER"].indexOf(role) === -1)
        return { status: "ERROR", message: "You are not authorised to approve or reject late registration requests." };
    const nss = String(data.nss || data.nssNumber).trim();
    const type = String(data.type).trim().toUpperCase();
    const decision = String(data.decision).trim().toUpperCase();
    if (type !== "MONTHLY" && type !== "ANNUAL")
        return { status: "ERROR", message: "Invalid evaluation type." };
    if (decision !== "APPROVED" && decision !== "REJECTED")
        return { status: "ERROR", message: "Invalid approval decision." };
    const period = normalizeEvaluationApprovalPeriodForFix_(type, String(data.month) + "/" + String(data.year));
    const sheet = getDatabase().getSheetByName("EVALUATION_APPROVALS");
    if (!sheet || sheet.getLastRow() < 2)
        return { status: "ERROR", message: "No pending late-registration approval request was found." };
    const values = sheet.getDataRange().getValues();
    const columns = evaluationApprovalHeaderMapForFix_(values[0] || []);
    const missing = ["nss", "type", "period", "reason", "decision", "by", "date"].filter(function (key) { return columns[key] < 0; });
    if (missing.length)
        return { status: "ERROR", message: "EVALUATION_APPROVALS is missing required headers: " + missing.join(", ") };
    let targetRow = null;
    for (let i = values.length - 1; i >= 1; i--) {
        const row = values[i];
        if (String(row[columns.nss] || "").trim().toUpperCase() !== nss.toUpperCase())
            continue;
        if (String(row[columns.type] || "").trim().toUpperCase() !== type)
            continue;
        if (normalizeEvaluationApprovalPeriodForFix_(type, row[columns.period]) !== period)
            continue;
        if (!isLateRegistrationApprovalReason_(row[columns.reason]))
            continue;
        if (String(row[columns.decision] || "").trim().toUpperCase() === "PENDING") {
            targetRow = i + 1;
            break;
        }
    }
    if (!targetRow)
        return { status: "ERROR", message: "No pending late-registration approval request was found for this personnel and period." };
    sheet.getRange(targetRow, columns.decision + 1).setValue(decision);
    sheet.getRange(targetRow, columns.by + 1).setValue(session.email || session.userEmail || "");
    sheet.getRange(targetRow, columns.date + 1).setValue(new Date());
    SpreadsheetApp.flush();
    try {
        writeAuditLog_(session.email || session.userEmail || "", "LATE_REGISTRATION_" + decision, nss + " / " + type + " / " + period);
    }
    catch (auditError) {
        console.error("Late-registration audit log failed:", auditError);
    }
    return { status: "SUCCESS", decision: decision, message: "Late registration " + decision.toLowerCase() + "." };
}
/* ===== checkLateRegistrationApproval_ ===== */
function checkLateRegistrationApproval_(nss, type, month, year) {
    return getLateRegistrationDecision_(nss, type, month, year) === "APPROVED";
}
/* ===== getLateRegistrationDecision_ ===== */
function getLateRegistrationDecision_(nss, type, month, year) {
    const sheet = getDatabase().getSheetByName("EVALUATION_APPROVALS");
    if (!sheet || sheet.getLastRow() < 2)
        return "";
    const data = sheet.getDataRange().getValues();
    const columns = evaluationApprovalHeaderMapForFix_(data[0] || []);
    if (columns.nss < 0 || columns.type < 0 || columns.period < 0 || columns.reason < 0 || columns.decision < 0)
        return "";
    const targetNss = String(nss || "").trim().toUpperCase();
    const targetType = String(type || "").trim().toUpperCase();
    const targetPeriod = normalizeEvaluationApprovalPeriodForFix_(targetType, String(month) + "/" + String(year));
    let decision = "";
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (String(row[columns.nss] || "").trim().toUpperCase() !== targetNss)
            continue;
        if (String(row[columns.type] || "").trim().toUpperCase() !== targetType)
            continue;
        if (normalizeEvaluationApprovalPeriodForFix_(targetType, row[columns.period]) !== targetPeriod)
            continue;
        if (!isLateRegistrationApprovalReason_(row[columns.reason]))
            continue;
        decision = String(row[columns.decision] || "").trim().toUpperCase();
    }
    return decision;
}
/* ===== checkMonthlySubmission_ ===== */
function checkMonthlySubmission_(nss, month, year) {
    const sheet = getDatabase().getSheetByName("MONTHLY_EVALUATIONS");
    if (!sheet)
        throw new Error("MONTHLY_EVALUATIONS sheet was not found.");
    const lastRow = sheet.getLastRow();
    const lastColumn = sheet.getLastColumn();
    if (lastRow < 2 || lastColumn < 1)
        return { found: false };
    const headers = sheet.getRange(1, 1, 1, lastColumn).getDisplayValues()[0];
    const nssCol = findEvaluationHeaderIndex_(headers, ["NSS Number", "NSS"]);
    const monthCol = findEvaluationHeaderIndex_(headers, ["Month", "Evaluation Month"]);
    const yearCol = findEvaluationHeaderIndex_(headers, ["Year", "Evaluation Year"]);
    const idCol = findEvaluationHeaderIndex_(headers, ["ID", "Evaluation ID"]);
    const deadlineCol = findEvaluationHeaderIndex_(headers, ["Deadline Date", "Submission Deadline"]);
    const submittedCol = findEvaluationHeaderIndex_(headers, ["Submitted Date", "Submission Date"]);
    const capturedByCol = findEvaluationHeaderIndex_(headers, ["Captured By", "Submitted By", "Officer"]);
    if (nssCol < 0 || monthCol < 0 || yearCol < 0)
        throw new Error("MONTHLY_EVALUATIONS is missing one or more required headers: NSS Number, Month, Year.");
    const rows = sheet.getRange(2, 1, lastRow - 1, lastColumn).getValues();
    const targetNss = String(nss || "").trim().toUpperCase();
    const targetMonth = Number(month);
    const targetYear = Number(year);
    for (let i = 0; i < rows.length; i++) {
        const row = getRowObject_("MONTHLY_EVALUATIONS", rows[i]);
        if (String(row["NSS Number"] || "").trim().toUpperCase() !== targetNss)
            continue;
        const period = getMonthlySubmissionPeriodFromRow_(row);
        if (period.month === targetMonth && period.year === targetYear) {
            return {
                found: true,
                id: idCol >= 0 ? String(rows[i][idCol] || "").trim() : "",
                submittedDate: period.legacySimpleRow && yearCol >= 0 ? rows[i][yearCol] : (submittedCol >= 0 ? rows[i][submittedCol] : ""),
                capturedBy: period.legacySimpleRow && deadlineCol >= 0 ? rows[i][deadlineCol] : (capturedByCol >= 0 ? rows[i][capturedByCol] : ""),
                captureCode: String(row["Capture Code"] || ""),
                rowNumber: i + 2,
                legacy: period.legacySimpleRow
            };
        }
    }
    return { found: false };
}
/* ===== checkAnnualSubmission_ ===== */
function checkAnnualSubmission_(nss, serviceYear) {
    const sheet = getDatabase().getSheetByName("ANNUAL_EVALUATIONS");
    if (!sheet)
        throw new Error("ANNUAL_EVALUATIONS sheet was not found.");
    const lastRow = sheet.getLastRow();
    const lastColumn = sheet.getLastColumn();
    if (lastRow < 2 || lastColumn < 1)
        return { found: false };
    const headers = sheet.getRange(1, 1, 1, lastColumn).getDisplayValues()[0];
    const nssCol = findEvaluationHeaderIndex_(headers, ["NSS Number", "NSS"]);
    const periodCol = findEvaluationHeaderIndex_(headers, ["Evaluation Period", "Service Year"]);
    const deadlineCol = findEvaluationHeaderIndex_(headers, ["Deadline Date", "Submission Deadline"]);
    const submittedCol = findEvaluationHeaderIndex_(headers, ["Submitted Date", "Submission Date"]);
    const capturedByCol = findEvaluationHeaderIndex_(headers, ["Captured By", "Submitted By", "Officer"]);
    const idCol = findEvaluationHeaderIndex_(headers, ["ID", "Evaluation ID"]);
    if (nssCol < 0 || periodCol < 0)
        throw new Error("ANNUAL_EVALUATIONS is missing one or more required headers: NSS Number, Evaluation Period.");
    const rows = sheet.getRange(2, 1, lastRow - 1, lastColumn).getValues();
    const targetNss = String(nss || "").trim().toUpperCase();
    const targetPeriod = normalizeEvaluationApprovalPeriodForFix_("ANNUAL", serviceYear);
    for (let i = 0; i < rows.length; i++) {
        const row = getRowObject_("ANNUAL_EVALUATIONS", rows[i]);
        if (String(row["NSS Number"] || "").trim().toUpperCase() !== targetNss)
            continue;
        const rowPeriod = normalizeEvaluationApprovalPeriodForFix_("ANNUAL", getAnnualEvaluationPeriodFromSubmissionRow_(row));
        const legacy = String(row["Submitted Date"] || "").trim().toUpperCase() === "SUBMITTED" &&
            ((row["Evaluation Period"] instanceof Date) || (row["Service Year"] instanceof Date)) &&
            String(row["Captured By"] || "").trim() !== "" &&
            normalizeEvaluationApprovalPeriodForFix_("ANNUAL", row["Captured By"]) === targetPeriod;
        if (rowPeriod === targetPeriod || legacy) {
            return {
                found: true,
                id: idCol >= 0 ? String(rows[i][idCol] || "").trim() : "",
                submittedDate: legacy ? (row["Evaluation Period"] || row["Service Year"]) : (submittedCol >= 0 ? rows[i][submittedCol] : ""),
                capturedBy: legacy ? (deadlineCol >= 0 ? rows[i][deadlineCol] : "") : (capturedByCol >= 0 ? rows[i][capturedByCol] : ""),
                rowNumber: i + 2,
                legacy: legacy
            };
        }
    }
    return { found: false };
}
/* ===== calculateAnnualPeriod_ ===== */
function calculateAnnualPeriod_(setting, today) {
    const firstStart = new Date(setting["First Start Date"]);
    const firstEnd = new Date(setting["First End Date"]);
    const secondStart = setting["Second Start Date"]
        ?
            new Date(setting["Second Start Date"])
        :
            new Date(firstStart.getFullYear(), firstStart.getMonth() + 1, 15);
    const secondEnd = setting["Second End Date"]
        ?
            new Date(setting["Second End Date"])
        :
            new Date(firstStart.getFullYear(), firstStart.getMonth() + 1, 20);
    const thirdStart = setting["Third Start Date"]
        ?
            new Date(setting["Third Start Date"])
        :
            new Date(firstStart.getFullYear(), firstStart.getMonth() + 2, 15);
    const thirdEnd = setting["Third End Date"]
        ?
            new Date(setting["Third End Date"])
        :
            new Date(firstStart.getFullYear(), firstStart.getMonth() + 2, 20);
    const periods = [
        {
            period: 1,
            start: firstStart,
            end: firstEnd
        },
        {
            period: 2,
            start: secondStart,
            end: secondEnd
        },
        {
            period: 3,
            start: thirdStart,
            end: thirdEnd
        }
    ];
    for (let i = 0; i < periods.length; i++) {
        if (today >= periods[i].start
            &&
                today <= periods[i].end) {
            return periods[i];
        }
    }
    /*
    
    Allow late submission after final deadline
    
    */
    const last = periods[periods.length - 1];
    if (today > last.end) {
        return last;
    }
    return null;
}
/* ===== sendMonthlyEvaluationReminders_ ===== */
function sendMonthlyEvaluationReminders_() {
    const today = new Date();
    const timezone = Session.getScriptTimeZone();
    const month = Number(Utilities.formatDate(today, timezone, "M"));
    const year = Number(Utilities.formatDate(today, timezone, "yyyy"));
    const period = month + "/" + year;
    const periodText = Utilities.formatDate(today, timezone, "MMMM, yyyy");
    const windowInfo = getMonthlyDeadline_(month, year);
    if (!windowInfo || !windowInfo.hasWorkingDay || !windowInfo.isReminderDay) {
        return;
    }
    const pending = getPendingMonthlyEvaluations_();
    if (!pending.length) {
        return;
    }
    const reminderType = windowInfo.reminderType;
    if (!reminderType) {
        return;
    }
    pending.forEach(function (personnel) {
        const nss = personnel.nss;
        if (hasReminderBeenSent_(nss, "MONTHLY", period, today, reminderType)) {
            return;
        }
        const email = getPersonnelEmail_(nss);
        const phone = getPersonnelPhone_(nss);
        // A valid email address is enough to send email even if there is no phone.
        if (!email && !phone) {
            return;
        }
        let message;
        if (reminderType === "OPENING") {
            message =
                `Dear ${escapeEmailHtml_(personnel.name)},

    Your monthly evaluation for ${periodText} is now OPEN.

    Please print, endorse and submit your evaluation now. The submission window closes on ${windowInfo.endText}.

    NSA Wassa Amenfi West Municipal Secretariat`;
        }
        else if (reminderType === "DAILY") {
            message =
                `Dear ${escapeEmailHtml_(personnel.name)},

    Your monthly evaluation for ${periodText} is still pending.

    Please submit your evaluation now. The deadline is ${windowInfo.endText}.

    NSA Wassa Amenfi West Municipal Secretariat`;
        }
        else if (reminderType === "DAY_BEFORE_DEADLINE") {
            message =
                `Dear ${escapeEmailHtml_(personnel.name)},

    FINAL REMINDER: Your monthly evaluation for ${periodText} is still pending.

    Please submit your evaluation now. The deadline is ${windowInfo.endText}.

    NSA Wassa Amenfi West Municipal Secretariat`;
        }
        else if (reminderType === "DEADLINE") {
            message =
                `Dear ${escapeEmailHtml_(personnel.name)},

    FINAL DAY: Your monthly evaluation for ${periodText} is still pending.

    Please submit your evaluation TODAY. Today, ${windowInfo.endText}, is the deadline.

    NSA Wassa Amenfi West Municipal Secretariat`;
        }
        else {
            message =
                `Dear ${escapeEmailHtml_(personnel.name)},

    Your monthly evaluation for ${periodText} is still pending.

    Please submit your evaluation now. The deadline is ${windowInfo.endText}.

    NSA Wassa Amenfi West Municipal Secretariat`;
        }
        let emailResult = false;
        let smsResult = false;
        if (email) {
            emailResult = sendEmail_(email, "NSA WAWM Monthly Evaluation Reminder", message);
        }
        if (phone) {
            smsResult = sendSMSOnline_(phone, message);
        }
        // Log only successful channels. This log is the same-day duplicate guard.
        logReminder_(nss, reminderType, period, emailResult, smsResult, today, "MONTHLY");
    });
}
/* ===== getPreviousWorkingDayWithinWindow_ ===== */
function getPreviousWorkingDayWithinWindow_(deadlineDate, startDate) {
    if (!deadlineDate ||
        !startDate) {
        return null;
    }
    let date = new Date(deadlineDate);
    /*
    Start from the calendar day immediately
    before the deadline.
    */
    date.setDate(date.getDate() - 1);
    const startOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    while (date >= startOnly) {
        if (isWorkingDay_(date)) {
            return new Date(date.getFullYear(), date.getMonth(), date.getDate());
        }
        date.setDate(date.getDate() - 1);
    }
    /*
    There is no separate working day before
    the deadline.
    */
    return null;
}
/* ===== sendAnnualEvaluationReminders_ ===== */
function sendAnnualEvaluationReminders_() {
    const today = new Date();
    const personnelSheet = getDatabase().getSheetByName("REGISTERED_PERSONNEL");
    if (!personnelSheet) {
        throw new Error("REGISTERED_PERSONNEL sheet was not found.");
    }
    const data = personnelSheet.getDataRange().getValues();
    const submittedKeys = getSubmittedAnnualEvaluationKeys_();
    for (let i = 1; i < data.length; i++) {
        const personnel = getRowObject_("REGISTERED_PERSONNEL", data[i]);
        const nss = String(personnel["NSS Number"] || "").trim();
        if (!nss) {
            continue;
        }
        const periodInfo = getAnnualEvaluationPeriod_(personnel, today);
        if (!periodInfo || !periodInfo.period) {
            continue;
        }
        if (!periodInfo.withinReminderPeriod || !periodInfo.isReminderDay) {
            continue;
        }
        const period = String(periodInfo.period);
        const normalizedPeriod = reminderNormalizeAnnualPeriod_(period);
        const key = nss.toUpperCase() + "|" + normalizedPeriod;
        const lastAnnual = reminderNormalizeAnnualPeriod_(personnel["Last Annual Evaluation"]);
        // Check both ANNUAL_EVALUATIONS and REGISTERED_PERSONNEL tracking.
        if (submittedKeys.has(key) ||
            (lastAnnual && lastAnnual === normalizedPeriod)) {
            continue;
        }
        const reminderType = periodInfo.reminderType;
        if (!reminderType) {
            continue;
        }
        // Correct argument order and values; do not use undefined variables.
        if (hasReminderBeenSent_(nss, "ANNUAL", period, today, reminderType)) {
            continue;
        }
        const email = getPersonnelEmail_(nss);
        const phone = getPersonnelPhone_(nss);
        if (!email && !phone) {
            continue;
        }
        const name = personnel["Full Name"] || "NSA Personnel";
        let message;
        if (reminderType === "OPENING") {
            message =
                `Dear ${name},

    Your annual evaluation for Service Year ${period} is now OPEN.

    Please submit your annual evaluation now. Automated reminders will continue through ${periodInfo.endText}.

    NSA Wassa Amenfi West Municipal Secretariat`;
        }
        else if (reminderType === "DAY_BEFORE_DEADLINE") {
            const closingDate = periodInfo.monthlyWindow && periodInfo.monthlyWindow.endText
                ? periodInfo.monthlyWindow.endText
                : periodInfo.endText;
            message =
                `Dear ${name},

    FINAL REMINDER: Your annual evaluation for Service Year ${period} is still pending.

    Please submit your evaluation now. The current reminder window closes tomorrow, ${closingDate}.

    NSA Wassa Amenfi West Municipal Secretariat`;
        }
        else if (reminderType === "DEADLINE") {
            const closingDate = periodInfo.monthlyWindow && periodInfo.monthlyWindow.endText
                ? periodInfo.monthlyWindow.endText
                : periodInfo.endText;
            message =
                `Dear ${name},

    FINAL DAY: Your annual evaluation for Service Year ${period} is still pending.

    Please submit your evaluation TODAY. Today, ${closingDate}, is the final day of this reminder window.

    NSA Wassa Amenfi West Municipal Secretariat`;
        }
        else {
            const closingDate = periodInfo.monthlyWindow && periodInfo.monthlyWindow.endText
                ? periodInfo.monthlyWindow.endText
                : periodInfo.endText;
            message =
                `Dear ${name},

    Your annual evaluation for Service Year ${period} is still pending.

    Please submit your evaluation now. The current reminder window closes on ${closingDate}.

    NSA Wassa Amenfi West Municipal Secretariat`;
        }
        let emailResult = false;
        let smsResult = false;
        if (email) {
            emailResult = sendEmail_(email, "NSA WAWM Annual Evaluation Reminder", message);
        }
        if (phone) {
            smsResult = sendSMSOnline_(phone, message);
        }
        logReminder_(nss, reminderType, period, emailResult, smsResult, today, "ANNUAL");
    }
}
/* ===== sendPersonnelReminder_ ===== */
function sendPersonnelReminder_(personnel, type, period) {
    const nss = personnel[1];
    const name = personnel[2];
    const phone = personnel[7];
    const email = personnel[8];
    const message = `

Dear ${name},

Your ${type.toLowerCase()} evaluation for ${period} is pending.

Please complete the evaluation submission before the deadline.

NSA Wassa Amenfi West Municipal Secretariat

`;
    let emailResult = false;
    let smsResult = false;
    if (email) {
        emailResult =
            sendEmail_(email, "NSA Evaluation Reminder", message);
    }
    if (phone) {
        smsResult =
            sendSMSOnline_(phone, message);
    }
    logReminder_(nss, type, period, emailResult, smsResult, new Date());
}
/* ===== hasReminderBeenSent_ ===== */
function hasReminderBeenSent_(nss, evaluationType, period, reminderDate, reminderType) {
    const sheet = getDatabase().getSheetByName("REMINDER_LOG");
    if (!sheet) {
        return false;
    }
    const data = sheet.getDataRange().getValues();
    if (data.length < 2) {
        return false;
    }
    const timezone = Session.getScriptTimeZone();
    const checkDate = Utilities.formatDate(reminderDate instanceof Date ? reminderDate : new Date(reminderDate), timezone, "yyyy-MM-dd");
    const targetNss = String(nss || "").trim().toUpperCase();
    const targetReminderType = String(reminderType || "").trim().toUpperCase();
    const targetEvaluationType = String(evaluationType || "").trim().toUpperCase();
    const targetPeriod = String(period || "").trim();
    // REMINDER_LOG columns:
    // B NSS, C Reminder Type, H Status, I Evaluation Type,
    // J Period, K Reminder Date.
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (!row[10]) {
            continue;
        }
        const rawDate = row[10] instanceof Date ? row[10] : new Date(row[10]);
        if (isNaN(rawDate.getTime())) {
            continue;
        }
        const loggedDate = Utilities.formatDate(rawDate, timezone, "yyyy-MM-dd");
        const loggedNss = String(row[1] || "").trim().toUpperCase();
        const loggedReminderType = String(row[2] || "").trim().toUpperCase();
        const loggedStatus = String(row[7] || "").trim().toUpperCase();
        const loggedEvaluationType = String(row[8] || "").trim().toUpperCase();
        const loggedPeriod = String(row[9] || "").trim();
        if (loggedNss === targetNss &&
            loggedReminderType === targetReminderType &&
            loggedEvaluationType === targetEvaluationType &&
            loggedPeriod === targetPeriod &&
            loggedDate === checkDate &&
            (loggedStatus === "SENT" || loggedStatus === "SUCCESS")) {
            return true;
        }
    }
    return false;
}
/* ===== logReminder_ ===== */
function logReminder_(nss, reminderType, period, emailSent, smsSent, reminderDate, evaluationType) {
    const database = getDatabase();
    const sheet = database.getSheetByName("REMINDER_LOG");
    if (!sheet) {
        console.error("REMINDER_LOG sheet was not found. " +
            "Notification could not be recorded.");
        return false;
    }
    const now = new Date();
    /*
     * BACKWARD COMPATIBILITY
     *
     * The old two-argument version was:
     * logReminder_(nss, type)
     *
     * Preserve its SMS logging behaviour for any
     * remaining legacy callers.
     */
    if (arguments.length <= 2) {
        period = (now.getMonth() + 1) + "/" + now.getFullYear();
        emailSent = false;
        smsSent = true;
        reminderDate = now;
        evaluationType = "";
    }
    const nssNumber = String(nss || "").trim();
    const type = String(reminderType || "").trim().toUpperCase();
    const evalType = String(evaluationType || "").trim().toUpperCase();
    const periodText = String(period === null || period === undefined
        ? ""
        : period).trim();
    const validReminderDate = Object.prototype.toString.call(reminderDate) ===
        "[object Date]" &&
        !isNaN(reminderDate.getTime());
    const reminderDateValue = validReminderDate
        ? reminderDate
        : now;
    /*
     * Monthly reminders use Month and Year columns.
     * Annual and birthday reminders leave them blank.
     */
    let month = "";
    let year = "";
    if (evalType === "MONTHLY") {
        const match = periodText.match(/^(\d{1,2})\/(\d{4})$/);
        if (match) {
            month = Number(match[1]);
            year = Number(match[2]);
        }
    }
    else if (!evalType &&
        arguments.length <= 2) {
        /*
         * Preserve the legacy logger's month/year values.
         */
        month = now.getMonth() + 1;
        year = now.getFullYear();
    }
    const sentDate = new Date();
    let recorded = false;
    /*
     * RECORD EMAIL ONLY WHEN ITS SEND OPERATION
     * REPORTS SUCCESS.
     */
    if (emailSent) {
        sheet.appendRow([
            Utilities.getUuid(),
            nssNumber,
            type,
            month,
            year,
            "EMAIL",
            sentDate,
            "SENT",
            evalType,
            periodText,
            reminderDateValue,
            sentDate
        ]);
        recorded = true;
    }
    /*
     * RECORD SMS ONLY WHEN ITS SEND OPERATION
     * REPORTS SUCCESS.
     */
    if (smsSent) {
        sheet.appendRow([
            Utilities.getUuid(),
            nssNumber,
            type,
            month,
            year,
            "SMS",
            sentDate,
            "SENT",
            evalType,
            periodText,
            reminderDateValue,
            sentDate
        ]);
        recorded = true;
    }
    return recorded;
}
/* ===== isWorkingDay_ ===== */
function isWorkingDay_(date) {
    const day = date.getDay();
    /*
    0 = Sunday
    6 = Saturday
    */
    if (day === 0 ||
        day === 6) {
        return false;
    }
    const sheet = getDatabase()
        .getSheetByName("HOLIDAYS");
    if (!sheet) {
        return true;
    }
    const holidays = sheet
        .getDataRange()
        .getValues();
    for (let i = 1; i < holidays.length; i++) {
        const holidayDate = new Date(holidays[i][1]);
        if (holidayDate.toDateString()
            ===
                date.toDateString()) {
            return false;
        }
    }
    return true;
}
/* ===== createLateRegistrationRequest_ ===== */
function createLateRegistrationRequest_(data) {
    const sheet = getDatabase()
        .getSheetByName("LATE_REGISTRATION_APPROVALS");
    const records = sheet
        .getDataRange()
        .getValues();
    for (let i = 1; i < records.length; i++) {
        if (String(records[i][1]) === String(data.nssNumber)
            &&
                String(records[i][2]).toLowerCase()
                    ===
                        String(data.type).toLowerCase()
            &&
                String(records[i][3])
                    ===
                        String(data.month)
            &&
                String(records[i][4])
                    ===
                        String(data.year)
            &&
                records[i][8] === "PENDING") {
            return;
        }
    }
    sheet.appendRow([
        Utilities.getUuid(),
        data.nssNumber,
        String(data.type).toUpperCase(),
        data.month || "",
        data.year || "",
        new Date(),
        "",
        "",
        "PENDING"
    ]);
}
/* ===== getLateSubmissions_ ===== */
function getLateSubmissions_(filters) {
    filters = filters || {};
    const batchFilter = String(filters.batch || "").trim();
    const allowanceFilter = String(filters.allowance || "").trim();
    const typeFilter = String(filters.type || "ALL").trim().toUpperCase();
    const result = [];
    const legacyDeadlineCache = Object.create(null);
    const personnelSheet = getDatabase().getSheetByName("REGISTERED_PERSONNEL");
    const personnelMap = {};
    if (personnelSheet && personnelSheet.getLastRow() > 1) {
        const personnelData = personnelSheet.getDataRange().getValues();
        for (let i = 1; i < personnelData.length; i++) {
            const person = getRowObject_("REGISTERED_PERSONNEL", personnelData[i]);
            personnelMap[String(person["NSS Number"] || "").trim().toUpperCase()] = person;
        }
    }
    const monthlySheet = getDatabase().getSheetByName("MONTHLY_EVALUATIONS");
    if (typeFilter !== "ANNUAL" && monthlySheet && monthlySheet.getLastRow() > 1) {
        const data = monthlySheet.getDataRange().getValues();
        for (let i = 1; i < data.length; i++) {
            const row = getRowObject_("MONTHLY_EVALUATIONS", data[i]);
            if (!reminderRowIsSubmitted_(row))
                continue;
            const person = personnelMap[String(row["NSS Number"] || "").trim().toUpperCase()];
            if (!person)
                continue;
            if (batchFilter && String(person["Batch"] || "") !== batchFilter)
                continue;
            if (allowanceFilter && String(person["Allowance Type"] || "") !== allowanceFilter)
                continue;
            const period = getMonthlySubmissionPeriodFromRow_(row);
            let lateFlag = String(row["Late Flag"] || "").trim().toUpperCase();
            if (!lateFlag && period.legacySimpleRow && row["Year"] instanceof Date) {
                const deadlineKey = String(period.month) + "/" + String(period.year);
                if (!Object.prototype.hasOwnProperty.call(legacyDeadlineCache, deadlineKey)) {
                    legacyDeadlineCache[deadlineKey] = getMonthlyDeadline_(period.month, period.year);
                }
                const deadline = legacyDeadlineCache[deadlineKey];
                if (deadline && deadline.endDate && isAfterCalendarDateForEvaluationFix_(row["Year"], deadline.endDate)) lateFlag = "LATE";
            }
            if (lateFlag !== "LATE")
                continue;
            result.push({
                type: "MONTHLY", nss: row["NSS Number"], registration: row["Registration Number"], batch: person["Batch"],
                period: period.month + "/" + period.year, captureCode: row["Capture Code"] || "",
                submittedDate: period.legacySimpleRow ? row["Year"] : row["Submitted Date"],
                capturedBy: period.legacySimpleRow ? row["Deadline Date"] : row["Captured By"],
                serviceStatus: row["Service Status"], allowance: person["Allowance Type"]
            });
        }
    }
    const annualSheet = getDatabase().getSheetByName("ANNUAL_EVALUATIONS");
    if (typeFilter !== "MONTHLY" && annualSheet && annualSheet.getLastRow() > 1) {
        const data = annualSheet.getDataRange().getValues();
        for (let i = 1; i < data.length; i++) {
            const row = getRowObject_("ANNUAL_EVALUATIONS", data[i]);
            if (!reminderRowIsSubmitted_(row))
                continue;
            const legacyAnnual = String(row["Submitted Date"] || "").trim().toUpperCase() === "SUBMITTED" && (row["Evaluation Period"] instanceof Date || row["Service Year"] instanceof Date) && String(row["Captured By"] || "").trim() !== "";
            const person = personnelMap[String(row["NSS Number"] || "").trim().toUpperCase()];
            if (!person)
                continue;
            if (batchFilter && String(person["Batch"] || "") !== batchFilter)
                continue;
            if (allowanceFilter && String(person["Allowance Type"] || "") !== allowanceFilter)
                continue;
            let lateFlag = String(row["Late Flag"] || "").trim().toUpperCase();
            if (legacyAnnual) {
                const legacyLateFlag = String(row["Service Status"] || "").trim().toUpperCase();
                if (["LATE", "ON TIME"].indexOf(legacyLateFlag) !== -1)
                    lateFlag = legacyLateFlag;
            }
            if (lateFlag !== "LATE")
                continue;
            result.push({
                type: "ANNUAL", nss: row["NSS Number"], registration: row["Registration Number"], batch: person["Batch"],
                period: getAnnualEvaluationPeriodFromSubmissionRow_(row),
                submittedDate: legacyAnnual ? (row["Evaluation Period"] || row["Service Year"]) : row["Submitted Date"],
                capturedBy: legacyAnnual ? row["Deadline Date"] : row["Captured By"],
                serviceStatus: legacyAnnual ? row["Status"] : row["Service Status"], allowance: person["Allowance Type"]
            });
        }
    }
    return result;
}
/* ===== getMonthlyCompliance ===== */
function getMonthlyCompliance(month, year, filters) {
    filters = filters || {};
    const batchFilter = String(filters.batch || "").trim();
    const allowanceFilter = String(filters.allowance || "").trim();
    const personnelSheet = getDatabase().getSheetByName("REGISTERED_PERSONNEL");
    const evaluationSheet = getDatabase().getSheetByName("MONTHLY_EVALUATIONS");
    if (!personnelSheet || !evaluationSheet)
        throw new Error("Required monthly compliance sheets were not found.");
    const personnelData = personnelSheet.getDataRange().getValues();
    const evaluationData = evaluationSheet.getDataRange().getValues();
    const submitted = Object.create(null);
    for (let i = 1; i < evaluationData.length; i++) {
        const row = getRowObject_("MONTHLY_EVALUATIONS", evaluationData[i]);
        const period = getMonthlySubmissionPeriodFromRow_(row);
        const nss = String(row["NSS Number"] || "").trim().toUpperCase();
        if (nss && period.month === Number(month) && period.year === Number(year) && reminderRowIsSubmitted_(row)) submitted[nss] = true;
    }
    const evaluationWindow = getEvaluationMonthWindow_(Number(month), Number(year));
    const batches = Object.create(null);
    let total = 0;
    let completed = 0;
    for (let i = 1; i < personnelData.length; i++) {
        const personnel = getRowObject_("REGISTERED_PERSONNEL", personnelData[i]);
        if (String(personnel["Allowance Type"] || "").trim().toUpperCase() !== "SUBVENTED") continue;
        if (batchFilter && String(personnel["Batch"] || "") !== batchFilter) continue;
        if (allowanceFilter && String(personnel["Allowance Type"] || "") !== allowanceFilter) continue;
        if (getServiceStatus_(personnel) !== "ACTIVE") continue;
        const nss = String(personnel["NSS Number"] || "").trim().toUpperCase();
        if (!nss || !isEvaluationMonthAllowed_(personnel, Number(month), Number(year), evaluationWindow)) continue;
        const batch = String(personnel["Batch"] || "Unassigned").trim() || "Unassigned";
        if (!batches[batch]) batches[batch] = { total: 0, submitted: 0 };
        batches[batch].total++;
        total++;
        if (submitted[nss]) { batches[batch].submitted++; completed++; }
    }
    Object.keys(batches).forEach(function (batch) {
        const item = batches[batch];
        item.pending = item.total - item.submitted;
        item.compliance = item.total ? Math.round(item.submitted / item.total * 100) : 0;
    });
    return { month: month, year: year, overall: { total: total, submitted: completed, pending: total - completed, compliance: total ? Math.round(completed / total * 100) : 0 }, batches: batches };
}
/* ===== getAnnualCompliance ===== */
function getAnnualCompliance(filters) {
    filters = filters || {};
    const batchFilter = String(filters.batch || "").trim();
    const allowanceFilter = String(filters.allowance || "").trim();
    const personnelSheet = getDatabase().getSheetByName("REGISTERED_PERSONNEL");
    const annualSheet = getDatabase().getSheetByName("ANNUAL_EVALUATIONS");
    if (!personnelSheet || !annualSheet)
        throw new Error("Required annual evaluation sheets were not found.");
    const personnelData = personnelSheet.getDataRange().getValues();
    const annualData = annualSheet.getDataRange().getValues();
    const submitted = {};
    for (let i = 1; i < annualData.length; i++) {
        const row = getRowObject_("ANNUAL_EVALUATIONS", annualData[i]);
        if (!reminderRowIsSubmitted_(row))
            continue;
        const nss = String(row["NSS Number"] || "").trim().toUpperCase();
        const period = normalizeEvaluationApprovalPeriodForFix_("ANNUAL", getAnnualEvaluationPeriodFromSubmissionRow_(row));
        if (nss && period)
            submitted[nss + "-" + period] = true;
    }
    const batches = {};
    let total = 0;
    let done = 0;
    for (let i = 1; i < personnelData.length; i++) {
        const personnel = getRowObject_("REGISTERED_PERSONNEL", personnelData[i]);
        if (batchFilter && String(personnel["Batch"] || "") !== batchFilter)
            continue;
        if (allowanceFilter && String(personnel["Allowance Type"] || "") !== allowanceFilter)
            continue;
        const serviceStatus = getServiceStatus_(personnel);
        if (serviceStatus !== "ACTIVE" && serviceStatus !== "COMPLETED")
            continue;
        // Service Year is the canonical annual evaluation period in REGISTERED_PERSONNEL.
        // Do not call getAnnualEvaluationPeriod_ per person here: that helper may reread
        // BATCH_SETTINGS and SYSTEM_SETTINGS for every record with incomplete dates.
        const periodValue = String(personnel["Service Year"] || "").trim();
        const nss = String(personnel["NSS Number"] || "").trim().toUpperCase();
        if (!nss || !periodValue) continue;
        const key = nss + "-" + normalizeEvaluationApprovalPeriodForFix_("ANNUAL", periodValue);
        const batch = String(personnel["Batch"] || "Unassigned").trim() || "Unassigned";
        if (!batches[batch])
            batches[batch] = { total: 0, submitted: 0 };
        batches[batch].total++;
        total++;
        if (submitted[key]) {
            batches[batch].submitted++;
            done++;
        }
    }
    Object.keys(batches).forEach(function (batch) {
        const item = batches[batch];
        item.pending = item.total - item.submitted;
        item.compliance = item.total ? Math.round(item.submitted / item.total * 100) : 0;
    });
    return { overall: { total: total, submitted: done, pending: total - done, compliance: total ? Math.round(done / total * 100) : 0 }, batches: batches };
}
/* ===== getMonthlyBatchPerformance ===== */
function getMonthlyBatchPerformance(filters) {
    filters = filters || {};
    const monthly = getMonthlyCompliance(new Date().getMonth() + 1, new Date().getFullYear(), filters);
    const result = [];
    Object.keys(monthly.batches)
        .forEach(function (batch) {
        const item = monthly.batches[batch];
        result.push({
            batch: batch,
            total: item.total,
            submitted: item.submitted,
            pending: item.pending,
            compliance: item.compliance
        });
    });
    return result;
}
/* ===== getAnnualBatchPerformance ===== */
function getAnnualBatchPerformance(filters) {
    filters = filters || {};
    const annual = getAnnualCompliance(filters);
    const result = [];
    Object.keys(annual.batches)
        .forEach(function (batch) {
        const item = annual.batches[batch];
        result.push({
            batch: batch,
            total: item.total,
            submitted: item.submitted,
            pending: item.pending,
            compliance: item.compliance
        });
    });
    return result;
}
/* ===== getServiceStatus_ ===== */
function getServiceStatus_(personnel) {
    if (!personnel) {
        return "";
    }
    const today = new Date();
    const startValue = personnel["Service Start Date"];
    const endValue = personnel["Service End Date"];
    if (!startValue ||
        !endValue) {
        return "INCOMPLETE";
    }
    const start = new Date(startValue);
    const end = new Date(endValue);
    if (isNaN(start.getTime())
        ||
            isNaN(end.getTime())) {
        return "INCOMPLETE";
    }
    if (today >= start &&
        today <= end) {
        return "ACTIVE";
    }
    if (today > end) {
        return "COMPLETED";
    }
    if (today < start) {
        return "NOT_STARTED";
    }
    return "UNKNOWN";
}
/* ===== getLateRegistrationApprovals_ ===== */
function getLateRegistrationApprovals_() {
    const approvalSheet = getDatabase().getSheetByName("EVALUATION_APPROVALS");
    if (!approvalSheet || approvalSheet.getLastRow() < 2)
        return [];
    const personnelSheet = getDatabase().getSheetByName("REGISTERED_PERSONNEL");
    const personnelMap = {};
    if (personnelSheet && personnelSheet.getLastRow() > 1) {
        const personnelData = personnelSheet.getDataRange().getValues();
        for (let i = 1; i < personnelData.length; i++) {
            const person = getRowObject_("REGISTERED_PERSONNEL", personnelData[i]);
            personnelMap[String(person["NSS Number"] || "").trim().toUpperCase()] = person;
        }
    }
    const data = approvalSheet.getDataRange().getValues();
    const result = [];
    for (let i = 1; i < data.length; i++) {
        const row = getRowObject_("EVALUATION_APPROVALS", data[i]);
        if (String(row["Decision"] || "").trim().toUpperCase() !== "PENDING")
            continue;
        if (!isLateRegistrationApprovalReason_(row["Reason"]))
            continue;
        const person = personnelMap[String(row["NSS Number"] || "").trim().toUpperCase()];
        result.push({ nss: row["NSS Number"], name: person ? person["Full Name"] : "Unknown", type: row["Evaluation Type"], period: row["Period"], reason: row["Reason"], status: row["Decision"], requestedDate: row["Approval Date"], approvedBy: row["Approved By"] || "" });
    }
    return result;
}
/* ===== getEvaluationDashboardData ===== */
function getEvaluationDashboardData(filters, token) {
    requireAdminSession_(token, ["ADMIN", "EVALUATION OFFICER"]);
    filters = filters || {};
    const typeFilter = String(filters.type || "ALL").toUpperCase();
    const today = new Date();
    let monthlyCompliance = { overall: { total: 0, compliance: 0, submitted: 0, pending: 0 }, batches: {} };
    let annualCompliance = { overall: { total: 0, compliance: 0, submitted: 0, pending: 0 }, batches: {} };
    try {
        if (typeFilter !== "ANNUAL") monthlyCompliance = getMonthlyCompliance(today.getMonth() + 1, today.getFullYear(), filters);
    } catch (e) { Logger.log("Monthly compliance error: " + e.message); }
    try {
        if (typeFilter !== "MONTHLY") annualCompliance = getAnnualCompliance(filters);
    } catch (e) { Logger.log("Annual compliance error: " + e.message); }

    // Compliance aggregates already contain the pending totals. Reuse them instead
    // of running both pending engines and then recalculating the same compliance data.
    const monthlyPending = typeFilter === "ANNUAL" ? 0 : Number(monthlyCompliance.overall.pending || 0);
    const annualPending = typeFilter === "MONTHLY" ? 0 : Number(annualCompliance.overall.pending || 0);
    let lateSubmissions = [];
    let lateApprovals = [];
    try { lateSubmissions = typeFilter === "ALL" ? getLateSubmissions_(filters) : getLateSubmissions_(Object.assign({}, filters, { type: typeFilter })); }
    catch (e) { Logger.log("Late submissions error: " + e.message); }
    try { lateApprovals = getLateRegistrationApprovals_(); }
    catch (e) { Logger.log("Late approvals error: " + e.message); }

    function batchRows(compliance) {
        return Object.keys(compliance.batches || {}).sort().map(function (batch) {
            const item = compliance.batches[batch];
            return { batch: batch, total: item.total || 0, submitted: item.submitted || 0, pending: item.pending || 0, compliance: item.compliance || 0 };
        });
    }
    return serialiseAdminValue_({
        summary: { monthlyPending: monthlyPending, annualPending: annualPending, lateSubmissions: lateSubmissions.length, approvals: lateApprovals.length },
        monthlyPending: [], annualPending: [], lateSubmissions: lateSubmissions, lateApprovals: lateApprovals,
        monthlyCompliance: monthlyCompliance, annualCompliance: annualCompliance,
        monthlyBatchPerformance: typeFilter === "ANNUAL" ? [] : batchRows(monthlyCompliance),
        annualBatchPerformance: typeFilter === "MONTHLY" ? [] : batchRows(annualCompliance)
    });
}
function writeEvaluationAudit_(data) {
    const sheet = getDatabase()
        .getSheetByName("EVALUATION_AUDIT");
    sheet.appendRow([
        Utilities.getUuid(),
        data.nss || "",
        data.action || "",
        data.type || "",
        data.month || "",
        data.year || "",
        data.batch || "",
        Session
            .getActiveUser()
            .getEmail(),
        new Date()
    ]);
}
/* ===== validateMonthlyEvaluationPeriod_ ===== */
function validateMonthlyEvaluationPeriod_(personnel, month, year) {
    const startDate = new Date(personnel["Service Start Date"]);
    const endDate = new Date(personnel["Service End Date"]);
    if (isNaN(startDate.getTime())
        ||
            isNaN(endDate.getTime())) {
        return {
            valid: false,
            message: "Personnel service period is not properly configured."
        };
    }
    const evaluationDate = new Date(year, month - 1, 1);
    if (evaluationDate <
        new Date(startDate.getFullYear(), startDate.getMonth(), 1)) {
        return {
            valid: false,
            message: "This monthly evaluation is before the official service start date."
        };
    }
    if (evaluationDate >
        new Date(endDate.getFullYear(), endDate.getMonth(), 1)) {
        return {
            valid: false,
            message: "This monthly evaluation is after the official service period."
        };
    }
    return {
        valid: true
    };
}
/* ===== logQRScan_ ===== */
function logQRScan_(data) {
    const sheet = getDatabase()
        .getSheetByName("QR_SCAN_LOG");
    sheet.appendRow([
        Utilities.getUuid(),
        data.nssNumber,
        data.type || "REGISTRATION",
        data.identifier || "",
        data.month || "",
        data.year || "",
        Session
            .getActiveUser()
            .getEmail(),
        new Date()
    ]);
}
/* ===== getEvaluationFilters ===== */
function getEvaluationFilters(token) {
    requireAdminSession_(token, ["ADMIN", "EVALUATION OFFICER"]);
    const batches = getActiveBatches().map(function (b) { return String(b.name || ""); });
    const allowances = Object.keys(getAllowanceStatistics_()).sort();
    return { batches: batches, allowances: allowances };
}
/* ===== getColumnIndex_ ===== */
function getColumnIndex_(sheetName, headerName) {
    const sheet = getDatabase()
        .getSheetByName(sheetName);
    const headers = sheet
        .getRange(1, 1, 1, sheet.getLastColumn())
        .getValues()[0];
    const index = headers.indexOf(headerName);
    if (index === -1) {
        throw new Error(headerName +
            " not found in " +
            sheetName);
    }
    return index;
}
/* ===== getHeaderMap_ ===== */
function getHeaderMap_(sheetName) {
    // Header lookups are repeated for every row by getRowObject_().
    // Cache them for this server execution to avoid a Spreadsheet service
    // call per row. Apps Script starts a fresh global scope per execution.
    const cache = getHeaderMap_._cache || (getHeaderMap_._cache = Object.create(null));
    if (cache[sheetName]) return cache[sheetName];
    const sheet = getDatabase().getSheetByName(sheetName);
    if (!sheet || sheet.getLastColumn() < 1) {
        throw new Error("Sheet " + sheetName + " was not found or has no headers.");
    }
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const map = Object.create(null);
    headers.forEach(function (header, index) {
        const key = String(header == null ? "" : header).trim();
        if (key) map[key] = index;
    });
    cache[sheetName] = map;
    return map;
}
/* ===== getRowObject_ ===== */
function getRowObject_(sheetName, row) {
    const map = getHeaderMap_(sheetName);
    let obj = {};
    Object.keys(map)
        .forEach(function (key) {
        obj[key] = row[map[key]];
    });
    return obj;
}
/* ===== getApprovalHistory ===== */
function getApprovalHistory(token) {
    requireAdminSession_(token, ["ADMIN"]);
    const sheet = getDatabase().getSheetByName("EVALUATION_APPROVALS");
    if (!sheet || sheet.getLastRow() < 2) return [];
    const data = sheet.getDataRange().getValues();
    const result = [];
    for (let i = 1; i < data.length; i++) {
        const row = getRowObject_("EVALUATION_APPROVALS", data[i]);
        if (String(row["Decision"] || "").trim().toUpperCase() === "PENDING") continue;
        result.push({ nss: row["NSS Number"], type: row["Evaluation Type"], period: row["Period"], reason: row["Reason"], decision: row["Decision"], approvedBy: row["Approved By"], approvalDate: row["Approval Date"] });
    }
    return serialiseAdminValue_(result);
}
/* ===== createLateRegistrationApproval_ ===== */
function createLateRegistrationApproval_(data) {
    const sheet = getDatabase().getSheetByName("EVALUATION_APPROVALS");
    if (!sheet)
        return false;
    const period = normalizeEvaluationApprovalPeriodForFix_(String(data.type || "").toUpperCase(), String(data.month) + "/" + String(data.year));
    if (checkPendingApproval_(data.nssNumber, data.type, data.month, data.year))
        return true;
    const row = {
        "Approval ID": Utilities.getUuid(),
        "NSS Number": data.nssNumber,
        "Evaluation Type": String(data.type).toUpperCase(),
        "Period": period,
        "Reason": "Personnel registered after evaluation deadline",
        "Decision": "PENDING",
        "Approved By": "",
        "Approval Date": ""
    };
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
    const aliases = {
        "Approval ID": ["Approval ID", "ID"], "NSS Number": ["NSS Number", "NSS"],
        "Evaluation Type": ["Evaluation Type", "Type"], "Period": ["Period", "Evaluation Period"],
        "Reason": ["Reason", "Request Type"], "Decision": ["Decision", "Approval Decision"],
        "Approved By": ["Approved By", "Decided By", "Officer"], "Approval Date": ["Approval Date", "Decision Date", "Date Approved"]
    };
    const values = new Array(headers.length).fill("");
    Object.keys(row).forEach(function (field) {
        const index = findEvaluationHeaderIndex_(headers, aliases[field]);
        if (index >= 0)
            values[index] = row[field];
    });
    sheet.appendRow(values);
    return true;
}
/* ===== checkPendingApproval_ ===== */
function checkPendingApproval_(nss, type, month, year) {
    const sheet = getDatabase().getSheetByName("EVALUATION_APPROVALS");
    if (!sheet || sheet.getLastRow() < 2)
        return false;
    const data = sheet.getDataRange().getValues();
    const columns = evaluationApprovalHeaderMapForFix_(data[0] || []);
    if (columns.nss < 0 || columns.type < 0 || columns.period < 0 || columns.reason < 0 || columns.decision < 0)
        return false;
    const targetNss = String(nss || "").trim().toUpperCase();
    const targetType = String(type || "").trim().toUpperCase();
    const targetPeriod = normalizeEvaluationApprovalPeriodForFix_(targetType, String(month) + "/" + String(year));
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (String(row[columns.nss] || "").trim().toUpperCase() !== targetNss)
            continue;
        if (String(row[columns.type] || "").trim().toUpperCase() !== targetType)
            continue;
        if (normalizeEvaluationApprovalPeriodForFix_(targetType, row[columns.period]) !== targetPeriod)
            continue;
        if (!isLateRegistrationApprovalReason_(row[columns.reason]))
            continue;
        if (String(row[columns.decision] || "").trim().toUpperCase() === "PENDING")
            return true;
    }
    return false;
}
/* ===== getLateRegistrationApprovalStatus_ ===== */
function getLateRegistrationApprovalStatus_(nss, type, month, year) {
    const sheet = getDatabase().getSheetByName("EVALUATION_APPROVALS");
    if (!sheet || sheet.getLastRow() < 2)
        return { status: "NONE" };
    const data = sheet.getDataRange().getValues();
    const columns = evaluationApprovalHeaderMapForFix_(data[0] || []);
    if (columns.nss < 0 || columns.type < 0 || columns.period < 0 || columns.reason < 0 || columns.decision < 0)
        return { status: "NONE" };
    const targetNss = String(nss || "").trim().toUpperCase();
    const targetType = String(type || "").trim().toUpperCase();
    const targetPeriod = normalizeEvaluationApprovalPeriodForFix_(targetType, String(month) + "/" + String(year));
    let result = { status: "NONE" };
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (String(row[columns.nss] || "").trim().toUpperCase() !== targetNss)
            continue;
        if (String(row[columns.type] || "").trim().toUpperCase() !== targetType)
            continue;
        if (normalizeEvaluationApprovalPeriodForFix_(targetType, row[columns.period]) !== targetPeriod)
            continue;
        if (!isLateRegistrationApprovalReason_(row[columns.reason]))
            continue;
        result = { status: String(row[columns.decision] || "").trim().toUpperCase() || "NONE", approvedBy: columns.by >= 0 ? row[columns.by] || "" : "", approvalDate: columns.date >= 0 ? row[columns.date] || "" : "", reason: row[columns.reason] || "" };
    }
    return result;
}
/* ===== getPersonnelByNSS_ ===== */
function getPersonnelByNSS_(nssNumber) {
    if (!nssNumber) {
        return null;
    }
    const master = findMasterPersonnel_(String(nssNumber).trim());
    if (!master) {
        return null;
    }
    const fullName = (String(master["Other Names"] || "").trim()
        + " "
        + String(master["Last Name"] || "").trim()).trim();
    /*
     * Accept the possible column names used
     * in the personnel master.
     */
    const phone = master["Phone"] ||
        master["Phone Number"] ||
        master["Mobile"] ||
        master["Mobile Number"] ||
        master["Telephone"] ||
        master["Contact Number"] ||
        "";
    const email = master["Email"] ||
        master["Email Address"] ||
        master["Email Address "] ||
        "";
    return {
        nssNumber: String(master["NSS Number"] || nssNumber).trim(),
        name: fullName || "NSA Personnel",
        phone: String(phone).trim(),
        email: String(email).trim(),
        master: master
    };
}
/* ===== getOTPTokenData_ ===== */
function getOTPTokenData_(token) {
    if (!token) {
        return null;
    }
    const sheet = getDatabase()
        .getSheetByName("OTP_LOG");
    if (!sheet) {
        return null;
    }
    const data = sheet
        .getDataRange()
        .getValues();
    /*
     * Search from newest to oldest.
     */
    for (let i = data.length - 1; i >= 1; i--) {
        if (String(data[i][1]) ===
            String(token)) {
            return {
                token: data[i][1],
                nssNumber: data[i][2],
                purpose: data[i][3],
                otp: data[i][4],
                created: data[i][5],
                expiry: data[i][6],
                status: data[i][7]
            };
        }
    }
    return null;
}
/* ===== findActiveOTP_ ===== */
function findActiveOTP_(token, purpose) {
    const sheet = getDatabase()
        .getSheetByName("OTP_LOG");
    if (!sheet) {
        return null;
    }
    const data = sheet
        .getDataRange()
        .getValues();
    const now = new Date();
    for (let i = data.length - 1; i >= 1; i--) {
        const rowToken = String(data[i][1] || "").trim();
        const rowPurpose = String(data[i][3] || "")
            .trim()
            .toUpperCase();
        const status = String(data[i][7] || "")
            .trim()
            .toUpperCase();
        const expiry = new Date(data[i][6]);
        if (rowToken ===
            String(token).trim()
            &&
                rowPurpose ===
                    String(purpose)
                        .trim()
                        .toUpperCase()
            &&
                status === "ACTIVE"
            &&
                expiry > now) {
            return {
                token: rowToken,
                nssNumber: data[i][2],
                purpose: rowPurpose,
                otp: String(data[i][4]),
                created: data[i][5],
                expiry: expiry,
                reused: true
            };
        }
    }
    return null;
}
/* ===== getBatchServiceDates_ ===== */
function getBatchServiceDates_(batchName) {
    const sheet = getDatabase()
        .getSheetByName("BATCH_SETTINGS");
    if (!sheet) {
        return {
            startDate: "",
            endDate: ""
        };
    }
    const data = sheet
        .getDataRange()
        .getValues();
    const headers = data[0];
    const batchIndex = headers.indexOf("Batch Name");
    const startIndex = headers.indexOf("Start Date");
    const endIndex = headers.indexOf("End Date");
    for (let i = 1; i < data.length; i++) {
        if (String(data[i][batchIndex])
            ===
                String(batchName)) {
            return {
                startDate: data[i][startIndex],
                endDate: data[i][endIndex]
            };
        }
    }
    return {
        startDate: "",
        endDate: ""
    };
}
/* ===== isAnnualEvaluationWindowOpen_ ===== */
function isAnnualEvaluationWindowOpen_(personnel) {
    const today = new Date();
    const serviceEnd = new Date(personnel["Service End Date"]);
    if (isNaN(serviceEnd)) {
        return false;
    }
    // two months before service end
    const windowStart = new Date(serviceEnd);
    windowStart.setMonth(windowStart.getMonth() - 2);
    // two months after service end
    const windowEnd = new Date(serviceEnd);
    windowEnd.setMonth(windowEnd.getMonth() + 2);
    return (today >= windowStart &&
        today <= windowEnd);
}
/* ===== getEvaluationPolicySettings_ ===== */
function getEvaluationPolicySettings_() {
    return {
        annualPreMonths: Number(getSystemSetting_("ANNUAL_EVALUATION_PRE_MONTHS")
            || 2),
        annualPostMonths: Number(getSystemSetting_("ANNUAL_EVALUATION_POST_MONTHS")
            || 2),
        startDay: Number(getSystemSetting_("EVALUATION_WINDOW_START_DAY")
            || 15),
        endDay: Number(getSystemSetting_("EVALUATION_WINDOW_END_DAY")
            || 20)
    };
}
/* ===== getEvaluationMonthWindow_ ===== */
function getEvaluationMonthWindow_(month, year) {
    const policy = getEvaluationPolicySettings_();
    let start = new Date(year, month - 1, policy.startDay);
    let end = new Date(year, month - 1, policy.endDay);
    let workingDays = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        if (isEvaluationWorkingDay_(d)) {
            workingDays.push(new Date(d));
        }
    }
    if (workingDays.length === 0) {
        return null;
    }
    return {
        opening: workingDays[0],
        finalWarning: workingDays.length > 1
            ?
                workingDays[workingDays.length - 2]
            :
                workingDays[0],
        deadline: workingDays[workingDays.length - 1],
        workingDays: workingDays
    };
}
/* ===== repairRegisteredPersonnelServiceDates_ ===== */
function repairRegisteredPersonnelServiceDates_() {
    const sheet = getDatabase()
        .getSheetByName("REGISTERED_PERSONNEL");
    const data = sheet
        .getDataRange()
        .getValues();
    const headers = data[0];
    const batchIndex = headers.indexOf("Batch");
    const startIndex = headers.indexOf("Service Start Date");
    const endIndex = headers.indexOf("Service End Date");
    const yearIndex = headers.indexOf("Service Year");
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const batch = row[batchIndex];
        if (!batch) {
            continue;
        }
        const dates = getBatchServiceDates_(batch);
        if (dates.startDate &&
            (!row[startIndex] ||
                !row[endIndex] ||
                !row[yearIndex])) {
            sheet
                .getRange(i + 1, startIndex + 1)
                .setValue(dates.startDate);
            sheet
                .getRange(i + 1, endIndex + 1)
                .setValue(dates.endDate);
            sheet
                .getRange(i + 1, yearIndex + 1)
                .setValue(getServiceYear_(dates.startDate));
        }
    }
    return "Service dates repaired successfully";
}
/* ===== getServiceYear_ ===== */
function getServiceYear_(startDate) {
    const d = new Date(startDate);
    const year = d.getFullYear();
    return (year
        +
            "/"
        +
            (year + 1)
        +
            " NSS Service Year");
}
/* ===== initializeEvaluationTrackingFields_ ===== */
function initializeEvaluationTrackingFields_() {
    const sheet = getDatabase()
        .getSheetByName("REGISTERED_PERSONNEL");
    const data = sheet.getDataRange()
        .getValues();
    const headers = data[0];
    const monthlyIndex = headers.indexOf("Last Monthly Evaluation");
    const annualIndex = headers.indexOf("Last Annual Evaluation");
    const complianceIndex = headers.indexOf("Evaluation Compliance Status");
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (row[monthlyIndex] === "") {
            sheet
                .getRange(i + 1, monthlyIndex + 1)
                .setValue("NOT SUBMITTED");
        }
        if (row[annualIndex] === "") {
            sheet
                .getRange(i + 1, annualIndex + 1)
                .setValue("NOT SUBMITTED");
        }
        if (row[complianceIndex] === "") {
            sheet
                .getRange(i + 1, complianceIndex + 1)
                .setValue("PENDING");
        }
    }
    return "Evaluation tracking fields initialized";
}
/* ===== updateEvaluationTracking_ ===== */
function updateEvaluationTracking_(nss, type, period) {
    const sheet = getDatabase()
        .getSheetByName("REGISTERED_PERSONNEL");
    const data = sheet.getDataRange()
        .getValues();
    const headers = data[0];
    const nssIndex = headers.indexOf("NSS Number");
    const monthlyIndex = headers.indexOf("Last Monthly Evaluation");
    const annualIndex = headers.indexOf("Last Annual Evaluation");
    const complianceIndex = headers.indexOf("Evaluation Compliance Status");
    for (let i = 1; i < data.length; i++) {
        if (String(data[i][nssIndex])
            ===
                String(nss)) {
            if (type === "MONTHLY") {
                sheet
                    .getRange(i + 1, monthlyIndex + 1)
                    .setValue(period);
            }
            if (type === "ANNUAL") {
                sheet
                    .getRange(i + 1, annualIndex + 1)
                    .setValue(period);
            }
            sheet
                .getRange(i + 1, complianceIndex + 1)
                .setValue("COMPLIANT");
            break;
        }
    }
}
/* ===== getPersonnelEligibilityDate_ ===== */
function getPersonnelEligibilityDate_(personnel) {
    /*
    ========================================================
    DISTRICT REGISTRATION DATE
    ========================================================
  
    Date Registered means the date the personnel
    registered at the District/Municipal Office.
  
    This is deliberately NOT the same as the
    Regional Verification Date.
    ========================================================
    */
    if (!personnel) {
        return null;
    }
    const registeredDate = new Date(personnel["Date Registered"]);
    if (isNaN(registeredDate.getTime())) {
        return null;
    }
    return registeredDate;
}
/* ===== isMonthlyEvaluationAllowed_ ===== */
function isMonthlyEvaluationAllowed_(personnel, month, year) {
    /*
    ========================================================
    MONTHLY EVALUATION IS ONLY FOR SUBVENTED PERSONNEL
    ========================================================
    */
    if (String(personnel["Allowance Type"])
        .trim()
        .toLowerCase()
        !==
            "subvented") {
        return false;
    }
    /*
    ========================================================
    DISTRICT REGISTRATION DATE
    ========================================================
    */
    const eligibility = getPersonnelEligibilityDate_(personnel);
    if (!eligibility) {
        return false;
    }
    /*
    ========================================================
    GET THE EVALUATION WINDOW
    ========================================================
    */
    const window = getEvaluationMonthWindow_(month, year);
    if (!window) {
        return false;
    }
    /*
    ========================================================
    PERSONNEL MUST HAVE REGISTERED BEFORE THE DEADLINE
    ========================================================
    
    This prevents a person who registered after the
    monthly deadline from being treated as normally
    pending for that already-closed month.
  
    Example:
    Registration = 25 March
    March deadline = 20 March
  
    March is therefore NOT a normal pending evaluation.
    ========================================================
    */
    if (eligibility >
        window.deadline) {
        return false;
    }
    /*
    ========================================================
    SERVICE PERIOD + REGIONAL VERIFICATION
    ========================================================
    */
    return isEvaluationMonthAllowed_(personnel, month, year);
}
/* ===== isSameDate_ ===== */
function isSameDate_(a, b) {
    return (a.getFullYear() === b.getFullYear()
        &&
            a.getMonth() === b.getMonth()
        &&
            a.getDate() === b.getDate());
}
/* ===== getAnnualEvaluationReminderWindow_ ===== */
function getAnnualEvaluationReminderWindow_(personnel, period, today) {
    /*
    ========================================================
    ANNUAL REMINDER CONFIGURATION
  
    Reminders begin:
    2 months before Service End Date
  
    Reminders continue:
    2 months after Service End Date
  
    Therefore, the reminder campaign covers
    5 calendar months in total, including the
    service-end month.
    ========================================================
    */
    const MONTHS_BEFORE = 2;
    const MONTHS_AFTER = 2;
    /*
    ========================================================
    GET SERVICE END DATE
    ========================================================
    */
    const serviceEnd = new Date(personnel["Service End Date"]);
    if (isNaN(serviceEnd.getTime())) {
        return null;
    }
    /*
    ========================================================
    GET PERSONNEL ELIGIBILITY DATE
  
    This uses the existing eligibility logic we already
    established for registration/verification.
  
    We do NOT replace Date Registered with Regional
    Verification Date here.
  
    The existing getPersonnelEligibilityDate_() remains
    the authority for determining when the personnel
    becomes eligible.
    ========================================================
    */
    const eligibility = getPersonnelEligibilityDate_(personnel);
    /*
    If an eligibility date exists and today is before it,
    no reminder should be sent yet.
    */
    if (eligibility &&
        !isNaN(new Date(eligibility).getTime()) &&
        today < new Date(eligibility)) {
        return null;
    }
    /*
    ========================================================
    NORMALISE SERVICE END DATE TO FIRST DAY OF MONTH
    ========================================================
    */
    const serviceEndMonth = new Date(serviceEnd.getFullYear(), serviceEnd.getMonth(), 1);
    /*
    ========================================================
    ANNUAL REMINDER CAMPAIGN START MONTH
    ========================================================
    */
    const reminderStartMonth = new Date(serviceEndMonth.getFullYear(), serviceEndMonth.getMonth()
        - MONTHS_BEFORE, 1);
    /*
    ========================================================
    ANNUAL REMINDER CAMPAIGN END MONTH
    ========================================================
    */
    const reminderEndMonth = new Date(serviceEndMonth.getFullYear(), serviceEndMonth.getMonth()
        + MONTHS_AFTER, 1);
    /*
    ========================================================
    CURRENT MONTH
    ========================================================
    */
    const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    /*
    ========================================================
    CHECK WHETHER CURRENT MONTH IS WITHIN
    ANNUAL REMINDER CAMPAIGN
    ========================================================
    */
    if (currentMonth < reminderStartMonth ||
        currentMonth > reminderEndMonth) {
        return null;
    }
    /*
    ========================================================
    GET THE 15TH–20TH WORKING-DAY WINDOW
  
    We deliberately reuse getMonthlyDeadline_().
  
    This guarantees that annual reminders follow exactly
    the same working-day and public-holiday rules as
    monthly reminders.
    ========================================================
    */
    const monthlyWindow = getMonthlyDeadline_(today.getMonth() + 1, today.getFullYear());
    if (!monthlyWindow ||
        !monthlyWindow.hasWorkingDay) {
        return null;
    }
    /*
    ========================================================
    PERSONNEL ELIGIBILITY VS THIS MONTH'S WINDOW
  
    If the personnel only became eligible after this
    month's final reminder day, there is no reason to
    send a reminder for this month.
  
    If eligibility occurred between the opening and
    deadline, reminders can begin from the next
    appropriate working day.
    ========================================================
    */
    if (eligibility) {
        const eligibilityDate = new Date(eligibility);
        if (!isNaN(eligibilityDate.getTime()) &&
            eligibilityDate >
                monthlyWindow.endDate) {
            return null;
        }
    }
    /*
    ========================================================
    TODAY MUST BE A WORKING REMINDER DAY
  
    getMonthlyDeadline_() already determines:
  
    OPENING
    DAILY
    DAY_BEFORE_DEADLINE
    DEADLINE
    ========================================================
    */
    if (!monthlyWindow.isReminderDay) {
        return {
            hasWorkingDay: true,
            isReminderDay: false,
            reminderType: null,
            startDate: monthlyWindow.startDate,
            endDate: monthlyWindow.endDate,
            startText: monthlyWindow.startText,
            endText: monthlyWindow.endText,
            dayBeforeDeadline: monthlyWindow.dayBeforeDeadline,
            dayBeforeDeadlineText: monthlyWindow.dayBeforeDeadlineText,
            reminderStartMonth: reminderStartMonth,
            reminderEndMonth: reminderEndMonth,
            serviceEndDate: serviceEnd,
            period: period
                ? period.period
                : ""
        };
    }
    /*
    ========================================================
    RETURN ACTIVE ANNUAL REMINDER WINDOW
    ========================================================
    */
    return {
        hasWorkingDay: true,
        isReminderDay: true,
        reminderType: monthlyWindow.reminderType,
        /*
        15–20 working-day window for THIS month
        */
        startDate: monthlyWindow.startDate,
        endDate: monthlyWindow.endDate,
        startText: monthlyWindow.startText,
        endText: monthlyWindow.endText,
        dayBeforeDeadline: monthlyWindow.dayBeforeDeadline,
        dayBeforeDeadlineText: monthlyWindow.dayBeforeDeadlineText,
        /*
        Annual campaign boundaries
        */
        reminderStartMonth: reminderStartMonth,
        reminderEndMonth: reminderEndMonth,
        serviceEndDate: serviceEnd,
        /*
        Annual evaluation period
        */
        period: period
            ? period.period
            : ""
    };
}
/* ===== getAnnualEvaluationPeriod_ ===== */
function getAnnualEvaluationPeriod_(personnel, today) {
    if (!personnel)
        return null;
    const batch = String(personnel["Batch"] || personnel.batch || "").trim();
    const serviceYear = String(personnel["Service Year"] || personnel.serviceYear || "").trim();
    if (!serviceYear)
        return null;
    function parseDate(value) {
        if (value instanceof Date && !isNaN(value.getTime()))
            return new Date(value.getTime());
        if (value === null || value === undefined || String(value).trim() === "")
            return null;
        const date = new Date(value);
        return isNaN(date.getTime()) ? null : date;
    }
    function normalizeDate(value) {
        const date = parseDate(value);
        return date ? new Date(date.getFullYear(), date.getMonth(), date.getDate()) : null;
    }
    let serviceStartDate = normalizeDate(personnel["Service Start Date"] || personnel.serviceStartDate);
    let serviceEndDate = normalizeDate(personnel["Service End Date"] || personnel.serviceEndDate);
    if (!serviceStartDate || !serviceEndDate) {
        const batchSheet = getDatabase().getSheetByName("BATCH_SETTINGS");
        if (batchSheet && batchSheet.getLastRow() >= 2 && batchSheet.getLastColumn() >= 3) {
            const lastColumn = batchSheet.getLastColumn();
            const headers = batchSheet.getRange(1, 1, 1, lastColumn).getDisplayValues()[0];
            const idCol = findEvaluationHeaderIndex_(headers, ["Batch ID", "ID"]);
            let nameCol = findEvaluationHeaderIndex_(headers, ["Batch Name", "Batch"]);
            let startCol = findEvaluationHeaderIndex_(headers, ["Start Date", "Service Start Date"]);
            let endCol = findEvaluationHeaderIndex_(headers, ["End Date", "Service End Date"]);
            if (nameCol < 0)
                nameCol = 0;
            if (startCol < 0)
                startCol = headers.length >= 5 ? 2 : 1;
            if (endCol < 0)
                endCol = headers.length >= 5 ? 3 : 2;
            const data = batchSheet.getRange(2, 1, batchSheet.getLastRow() - 1, lastColumn).getValues();
            const targetBatch = batch.toUpperCase();
            for (let i = 0; i < data.length; i++) {
                const row = data[i];
                const id = idCol >= 0 ? String(row[idCol] || "").trim().toUpperCase() : "";
                const name = nameCol >= 0 ? String(row[nameCol] || "").trim().toUpperCase() : "";
                if (targetBatch && targetBatch !== id && targetBatch !== name)
                    continue;
                if (!serviceStartDate)
                    serviceStartDate = normalizeDate(row[startCol]);
                if (!serviceEndDate)
                    serviceEndDate = normalizeDate(row[endCol]);
                if (serviceStartDate && serviceEndDate)
                    break;
            }
        }
    }
    if (!serviceStartDate || !serviceEndDate || serviceEndDate < serviceStartDate)
        return null;
    const monthsBefore = Number(getSystemSetting_("ANNUAL_EVALUATION_PRE_MONTHS") || ANNUAL_REMINDER_MONTHS_BEFORE || 2);
    const monthsAfter = Number(getSystemSetting_("ANNUAL_EVALUATION_POST_MONTHS") || ANNUAL_REMINDER_MONTHS_AFTER || 2);
    const reminderStartDate = new Date(serviceEndDate.getFullYear(), serviceEndDate.getMonth() - monthsBefore, 1);
    const reminderEndDate = new Date(serviceEndDate.getFullYear(), serviceEndDate.getMonth() + monthsAfter + 1, 0);
    const rawToday = parseDate(today) || new Date();
    const currentDate = new Date(rawToday.getFullYear(), rawToday.getMonth(), rawToday.getDate());
    const withinReminderPeriod = currentDate >= reminderStartDate && currentDate <= reminderEndDate;
    let monthlyWindow = null;
    if (withinReminderPeriod)
        monthlyWindow = getMonthlyDeadline_(currentDate.getMonth() + 1, currentDate.getFullYear());
    const isReminderDay = Boolean(monthlyWindow && monthlyWindow.hasWorkingDay && monthlyWindow.isReminderDay);
    return {
        period: serviceYear,
        serviceYear: serviceYear,
        batch: batch,
        serviceStartDate: serviceStartDate,
        serviceEndDate: serviceEndDate,
        submissionDeadline: serviceEndDate,
        reminderStartDate: reminderStartDate,
        reminderEndDate: reminderEndDate,
        startDate: reminderStartDate,
        endDate: reminderEndDate,
        startText: formatDate_(reminderStartDate),
        endText: formatDate_(reminderEndDate),
        withinReminderPeriod: withinReminderPeriod,
        isReminderDay: isReminderDay,
        reminderType: isReminderDay ? monthlyWindow.reminderType : null,
        monthlyWindow: monthlyWindow
    };
}

/* ===== getEvaluationPrecheck ===== */
function getEvaluationPrecheck(data) {
    if (!data || !data.nssNumber || !data.type) {
        return {
            status: "ERROR",
            code: "MISSING_DATA",
            message: "Missing evaluation information."
        };
    }
    const nss = String(data.nssNumber).trim();
    const type = String(data.type).trim().toUpperCase();
    if (!nss) {
        return {
            status: "ERROR",
            code: "MISSING_NSS",
            message: "NSS Number is required."
        };
    }
    if (type !== "MONTHLY" && type !== "ANNUAL") {
        return {
            status: "ERROR",
            code: "INVALID_TYPE",
            message: "Invalid evaluation type."
        };
    }
    const updateExistingRequested = data.updateExisting === true ||
        ["1", "true", "yes"].indexOf(String(data.updateExisting || "").trim().toLowerCase()) !== -1;
    const sessionToken = String(data.sessionToken || "").trim();
    const session = validateSession(sessionToken);
    if (!session || !session.valid) {
        return {
            status: "ERROR",
            code: "UNAUTHORIZED",
            message: "Your officer session is invalid or expired."
        };
    }
    const allowedRoles = ["SUPER ADMIN", "ADMIN", "NSA OFFICER"];
    if (allowedRoles.indexOf(String(session.role || "").trim().toUpperCase()) === -1) {
        return {
            status: "ERROR",
            code: "UNAUTHORIZED",
            message: "You are not authorised to process evaluations."
        };
    }
    const personnel = findRegisteredPersonnel_(nss);

    if (!personnel) {
        // If absent from REGISTERED_PERSONNEL, check whether the district's
        // master list recognises the NSS number. This distinguishes an
        // unregistered district personnel record from an unknown person.
        const masterPersonnel = findMasterPersonnel_(nss);

        if (masterPersonnel) {
            return {
                status: "ERROR",
                code: "PERSONNEL_IN_DISTRICT_NOT_REGISTERED",
                message: "This personnel is listed in the district's master personnel records but has not completed registration in the NSA WAWM Personnel Management System. Complete registration before submitting an evaluation."
            };
        }

        return {
            status: "ERROR",
            code: "PERSONNEL_NOT_FOUND_IN_DISTRICT",
            message: "Personnel was not found in the district's master personnel records. Please verify the NSS number. If it is correct, contact the NSA Wassa Amenfi West Municipal Secretariat for assistance."
        };
    }
    const registrationStatus = String(personnel["Status"] || "").trim().toUpperCase();
    if (registrationStatus && registrationStatus !== "ACTIVE") {
        return {
            status: "ERROR",
            code: "INACTIVE",
            message: "This personnel record is not active."
        };
    }
    const response = {
        status: "SUCCESS",
        canOpenEvaluation: false,
        canSubmit: false,
        alreadySubmitted: false,
        updateExisting: false,
        late: false,
        lateSubmission: false,
        lateRegistration: false,
        requiresLateApproval: false,
        approvalDecision: "",
        approvalId: "",
        existingSubmission: null,
        personnel: {
            name: String(personnel["Full Name"] || ""),
            nss: String(personnel["NSS Number"] || nss),
            batch: String(personnel["Batch"] || ""),
            companyPostedTo: String(personnel["Place of Posting"] ||
                personnel["Company Posted To"] ||
                personnel["Employer Company"] || ""),
            allowance: String(personnel["Allowance Type"] || ""),
            serviceYear: String(personnel["Service Year"] || "")
        },
        evaluation: {
            type: type,
            month: "",
            year: "",
            period: "",
            status: "",
            message: "",
            deadline: "",
            opening: "",
            lateReason: ""
        }
    };
    const today = new Date();
    function formatExistingSubmission_(existing) {
        let submittedDate = existing && existing.submittedDate ? existing.submittedDate : "";
        if (submittedDate instanceof Date && !isNaN(submittedDate.getTime())) {
            submittedDate = Utilities.formatDate(submittedDate, Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm:ss");
        }
        return {
            submittedDate: String(submittedDate || ""),
            capturedBy: String(existing && existing.capturedBy || ""),
            rowNumber: existing && existing.rowNumber ? existing.rowNumber : null
        };
    }
    if (type === "MONTHLY") {
        const allowance = String(personnel["Allowance Type"] || "").trim().toUpperCase();
        if (allowance !== "SUBVENTED") {
            response.status = "ERROR";
            response.code = "NOT_ELIGIBLE";
            response.message = "Monthly evaluation is only applicable to Subvented personnel.";
            return response;
        }
        const month = Number(data.month);
        const year = Number(data.year);
        if (!Number.isInteger(month) || month < 1 || month > 12) {
            response.status = "ERROR";
            response.code = "INVALID_MONTH";
            response.message = "Please select a valid evaluation month.";
            return response;
        }
        if (!Number.isInteger(year) || year < 2000 || year > 2100) {
            response.status = "ERROR";
            response.code = "INVALID_YEAR";
            response.message = "Please select a valid evaluation year.";
            return response;
        }
        const currentMonth = today.getMonth() + 1;
        const currentYear = today.getFullYear();
        if (year > currentYear || (year === currentYear && month > currentMonth)) {
            response.status = "ERROR";
            response.code = "FUTURE_PERIOD";
            response.message = "A future monthly evaluation cannot be submitted.";
            return response;
        }
        const periodCheck = validateMonthlyEvaluationPeriod_(personnel, month, year);
        if (!periodCheck.valid) {
            response.status = "ERROR";
            response.code = "OUTSIDE_SERVICE_PERIOD";
            response.message = periodCheck.message;
            return response;
        }
        const deadline = getMonthlyDeadline_(month, year);
        if (!deadline || !deadline.hasWorkingDay) {
            response.status = "ERROR";
            response.code = "NO_WORKING_DAY";
            response.message = "No valid working day exists in the monthly evaluation window.";
            return response;
        }
        response.personnel.serviceYear = String(personnel["Service Year"] || "");
        response.evaluation.month = month;
        response.evaluation.year = year;
        response.evaluation.period = formatEvaluationMonthName_(month) + " " + year;
        response.evaluation.deadline = formatDate_(deadline.endDate);
        response.evaluation.opening = formatDate_(deadline.startDate);
        const existing = checkMonthlySubmission_(nss, month, year);
        if (updateExistingRequested && !(existing && existing.found)) {
            response.status = "ERROR";
            response.code = "NO_EXISTING_SUBMISSION";
            response.message = "No existing monthly submission was found to update. Return to Home and try again.";
            return response;
        }
        if (existing && existing.found) {
            response.alreadySubmitted = true;
            response.evaluation.status = "SUBMITTED";
            response.evaluation.message = "This monthly evaluation has already been submitted.";
            response.existingSubmission = formatExistingSubmission_(existing);
            response.evaluation.submittedDate = response.existingSubmission.submittedDate;
            response.evaluation.capturedBy = response.existingSubmission.capturedBy;
            if (!updateExistingRequested) {
                return response;
            }
            response.updateExisting = true;
        }
        const eligibilityDate = getEvaluationEligibilityDate_(personnel);
        if (!eligibilityDate) {
            response.status = "ERROR";
            response.code = "ELIGIBILITY_DATE_MISSING";
            response.message = "Personnel eligibility date could not be determined.";
            return response;
        }
        response.lateRegistration = isAfterCalendarDateForEvaluationFix_(eligibilityDate, deadline.endDate);
        response.lateSubmission = isAfterCalendarDateForEvaluationFix_(today, deadline.endDate);
        response.late = response.lateRegistration || response.lateSubmission;
        const reasons = [];
        if (response.lateSubmission)
            reasons.push("The monthly evaluation deadline has passed.");
        if (response.lateRegistration)
            reasons.push("The personnel became eligible after the monthly deadline.");
        response.evaluation.lateReason = reasons.join(" ");
        const periodKey = month + "/" + year;
        if (response.late) {
            let approval;
            try {
                approval = getEvaluationApprovalDecision_(nss, "MONTHLY", periodKey);
            }
            catch (approvalError) {
                response.status = "ERROR";
                response.code = "APPROVAL_CONFIGURATION";
                response.message = String(approvalError.message || approvalError);
                return response;
            }
            response.approvalDecision = approval.decision || "";
            response.approvalId = approval.id || "";
            if (response.approvalDecision === "REJECTED") {
                response.evaluation.status = "REJECTED";
                response.evaluation.message = "Late evaluation submission was rejected by the officer.";
                response.canOpenEvaluation = true;
                response.canSubmit = false;
                return response;
            }
            if (response.approvalDecision !== "APPROVED") {
                response.evaluation.status = "LATE";
                response.evaluation.message = response.evaluation.lateReason + " Officer approval is required before submission.";
                response.requiresLateApproval = true;
                response.canOpenEvaluation = true;
                response.canSubmit = false;
                return response;
            }
            response.evaluation.status = "APPROVED_LATE";
            response.evaluation.message = updateExistingRequested
                ? "Late update approved. You may continue."
                : "Late submission approved. You may continue.";
            response.canOpenEvaluation = true;
            response.canSubmit = true;
            return response;
        }
        const openingDate = new Date(deadline.startDate.getFullYear(), deadline.startDate.getMonth(), deadline.startDate.getDate());
        const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        if (todayDate < openingDate) {
            response.status = "ERROR";
            response.code = "NOT_OPEN";
            response.message = "The monthly evaluation submission window has not opened yet.";
            return response;
        }
        response.evaluation.status = updateExistingRequested ? "UPDATE_EXISTING" : "ELIGIBLE";
        response.evaluation.message = updateExistingRequested
            ? "The existing monthly submission is ready to be updated."
            : "Eligible for submission.";
        response.canOpenEvaluation = true;
        response.canSubmit = true;
        return response;
    }
    // ANNUAL EVALUATION
    const annualPeriodInfo = getAnnualEvaluationPeriod_(personnel, today);
    const serviceStart = annualPeriodInfo
        ? new Date(annualPeriodInfo.serviceStartDate)
        : new Date(personnel["Service Start Date"]);
    const serviceEnd = annualPeriodInfo
        ? new Date(annualPeriodInfo.serviceEndDate)
        : new Date(personnel["Service End Date"]);
    const serviceYear = String((annualPeriodInfo && annualPeriodInfo.serviceYear) || personnel["Service Year"] || "").trim();
    if (!serviceYear || isNaN(serviceStart.getTime()) || isNaN(serviceEnd.getTime())) {
        response.status = "ERROR";
        response.code = "SERVICE_CONFIGURATION";
        response.message = "Personnel service year or service dates are not properly configured.";
        return response;
    }
    response.personnel.serviceYear = serviceYear;
    response.evaluation.period = serviceYear;
    const existingAnnual = checkAnnualSubmission_(nss, serviceYear);
    if (updateExistingRequested && !(existingAnnual && existingAnnual.found)) {
        response.status = "ERROR";
        response.code = "NO_EXISTING_SUBMISSION";
        response.message = "No existing annual submission was found to update. Return to Home and try again.";
        return response;
    }
    if (existingAnnual && existingAnnual.found) {
        response.alreadySubmitted = true;
        response.evaluation.status = "SUBMITTED";
        response.evaluation.message = "This annual evaluation has already been submitted.";
        response.existingSubmission = formatExistingSubmission_(existingAnnual);
        response.evaluation.submittedDate = response.existingSubmission.submittedDate;
        response.evaluation.capturedBy = response.existingSubmission.capturedBy;
        if (!updateExistingRequested) {
            return response;
        }
        response.updateExisting = true;
    }
    const endOfServiceDay = new Date(serviceEnd.getFullYear(), serviceEnd.getMonth(), serviceEnd.getDate(), 23, 59, 59, 999);
    if (today < new Date(serviceStart.getFullYear(), serviceStart.getMonth(), serviceStart.getDate())) {
        response.status = "ERROR";
        response.code = "SERVICE_NOT_STARTED";
        response.message = "The personnel service period has not started.";
        return response;
    }
    response.lateSubmission = today > endOfServiceDay;
    response.late = response.lateSubmission;
    response.evaluation.deadline = formatDate_(serviceEnd);
    if (response.late) {
        let approval;
        try {
            approval = getEvaluationApprovalDecision_(nss, "ANNUAL", serviceYear);
        }
        catch (approvalError) {
            response.status = "ERROR";
            response.code = "APPROVAL_CONFIGURATION";
            response.message = String(approvalError.message || approvalError);
            return response;
        }
        response.approvalDecision = approval.decision || "";
        response.approvalId = approval.id || "";
        if (response.approvalDecision === "REJECTED") {
            response.evaluation.status = "REJECTED";
            response.evaluation.message = "Late annual evaluation submission was rejected by the officer.";
            response.canOpenEvaluation = true;
            response.canSubmit = false;
            return response;
        }
        if (response.approvalDecision !== "APPROVED") {
            response.evaluation.status = "LATE";
            response.evaluation.message = "The annual evaluation deadline has passed. Officer approval is required before submission.";
            response.requiresLateApproval = true;
            response.canOpenEvaluation = true;
            response.canSubmit = false;
            return response;
        }
        response.evaluation.status = "APPROVED_LATE";
        response.evaluation.message = updateExistingRequested
            ? "Late update approved. You may continue."
            : "Late annual submission approved. You may continue.";
        response.canOpenEvaluation = true;
        response.canSubmit = true;
        return response;
    }
    response.evaluation.status = updateExistingRequested ? "UPDATE_EXISTING" : "ELIGIBLE";
    response.evaluation.message = updateExistingRequested
        ? "The existing annual submission is ready to be updated."
        : "Eligible for submission.";
    response.canOpenEvaluation = true;
    response.canSubmit = true;
    return response;
}
/* ===== formatEvaluationMonthName_ ===== */
function formatEvaluationMonthName_(month) {
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    return months[Number(month) - 1] || "";
}
/* ===== getEvaluationEligibilityDate_ ===== */
function getEvaluationEligibilityDate_(personnel) {
    if (!personnel) {
        return null;
    }
    const verificationDate = personnel["Regional Verification Date"]
        ? new Date(personnel["Regional Verification Date"])
        : null;
    if (verificationDate &&
        !isNaN(verificationDate.getTime())) {
        return verificationDate;
    }
    return getPersonnelEligibilityDate_(personnel);
}
function isLateEvaluationApprovalTimestampValid_(nss, type, period, approvalDate) {
    const decisionDate = approvalDate instanceof Date ? new Date(approvalDate.getTime()) : new Date(approvalDate);
    if (isNaN(decisionDate.getTime()))
        return false;
    const personnel = findRegisteredPersonnel_(String(nss || "").trim());
    if (!personnel)
        return false;
    const evaluationType = String(type || "").trim().toUpperCase();
    if (evaluationType === "MONTHLY") {
        const canonical = normalizeEvaluationApprovalPeriodForFix_("MONTHLY", period);
        const match = canonical.match(/^(\d{1,2})\/(\d{4})$/);
        if (!match)
            return false;
        const deadline = getMonthlyDeadline_(Number(match[1]), Number(match[2]));
        return Boolean(deadline && deadline.endDate && isAfterCalendarDateForEvaluationFix_(decisionDate, deadline.endDate));
    }
    if (evaluationType === "ANNUAL") {
        const periodInfo = getAnnualEvaluationPeriod_(personnel, decisionDate);
        if (!periodInfo || !periodInfo.serviceEndDate)
            return false;
        if (normalizeEvaluationApprovalPeriodForFix_("ANNUAL", period) !== normalizeEvaluationApprovalPeriodForFix_("ANNUAL", periodInfo.serviceYear))
            return false;
        return isAfterCalendarDateForEvaluationFix_(decisionDate, periodInfo.serviceEndDate);
    }
    return false;
}
/* ===== getEvaluationApprovalDecision_ ===== */
function getEvaluationApprovalDecision_(nss, type, period) {
    const sheet = getDatabase().getSheetByName("EVALUATION_APPROVALS");
    if (!sheet || sheet.getLastRow() < 2)
        return { decision: "", id: "", rowNumber: null };
    const values = sheet.getDataRange().getValues();
    const columns = evaluationApprovalHeaderMapForFix_(values[0] || []);
    const missing = ["nss", "type", "period", "reason", "decision", "date"].filter(function (key) { return columns[key] < 0; });
    if (missing.length)
        throw new Error("EVALUATION_APPROVALS is missing required headers: " + missing.join(", "));
    const targetNss = String(nss || "").trim().toUpperCase();
    const targetType = String(type || "").trim().toUpperCase();
    const targetPeriod = normalizeEvaluationApprovalPeriodForFix_(targetType, period);
    let latestNonFinal = null;
    let latestFinal = null;
    for (let i = 1; i < values.length; i++) {
        const row = values[i];
        const rowNss = String(row[columns.nss] || "").trim().toUpperCase();
        const rowType = String(row[columns.type] || "").trim().toUpperCase();
        const rowPeriod = normalizeEvaluationApprovalPeriodForFix_(rowType, row[columns.period]);
        if (rowNss !== targetNss || rowType !== targetType || rowPeriod !== targetPeriod)
            continue;
        if (!isLateEvaluationApprovalReason_(row[columns.reason]))
            continue;
        const result = {
            decision: String(row[columns.decision] || "").trim().toUpperCase(),
            id: columns.id >= 0 ? String(row[columns.id] || "").trim() : "",
            rowNumber: i + 1
        };
        if (result.decision === "APPROVED" || result.decision === "REJECTED") {
            if (isLateEvaluationApprovalTimestampValid_(nss, type, period, row[columns.date]))
                latestFinal = result;
        }
        else {
            latestNonFinal = result;
        }
    }
    return latestFinal || latestNonFinal || { decision: "", id: "", rowNumber: null };
}
/* ===== recordEvaluationLateDecision ===== */
function recordEvaluationLateDecision(data) {
    if (!data || !data.nssNumber || !data.type || !data.period || !data.decision)
        return { status: "ERROR", message: "Missing late evaluation approval information." };
    const session = validateSession(String(data.sessionToken || "").trim());
    if (!session || !session.valid)
        return { status: "ERROR", message: "Your officer session is invalid or expired." };
    const role = String(session.role || "").trim().toUpperCase();
    if (["SUPER ADMIN", "ADMIN", "NSA OFFICER", "EVALUATION OFFICER"].indexOf(role) === -1)
        return { status: "ERROR", message: "You are not authorised to approve or reject late evaluation submissions." };
    const nss = String(data.nssNumber).trim();
    const type = String(data.type).trim().toUpperCase();
    const decision = String(data.decision).trim().toUpperCase();
    if (type !== "MONTHLY" && type !== "ANNUAL")
        return { status: "ERROR", message: "Invalid evaluation type." };
    if (decision !== "APPROVED" && decision !== "REJECTED")
        return { status: "ERROR", message: "Invalid approval decision." };
    const personnel = findRegisteredPersonnel_(nss);
    if (!personnel)
        return { status: "ERROR", message: "Personnel record not found." };
    const registrationStatus = String(personnel["Status"] || "").trim().toUpperCase();
    if (registrationStatus && registrationStatus !== "ACTIVE") {
        return { status: "ERROR", message: "This personnel record is not active." };
    }
    let canonicalPeriod = "";
    let isLate = false;
    try {
        if (type === "MONTHLY") {
            canonicalPeriod = normalizeEvaluationApprovalPeriodForFix_(type, data.period);
            const match = canonicalPeriod.match(/^(\d{1,2})\/(\d{4})$/);
            if (!match)
                return { status: "ERROR", message: "Invalid monthly evaluation period. Use month/year, for example 10/2026." };
            const month = Number(match[1]);
            const year = Number(match[2]);
            if (month < 1 || month > 12 || year < 2000 || year > 2100)
                return { status: "ERROR", message: "Invalid monthly evaluation period." };
            if (String(personnel["Allowance Type"] || "").trim().toUpperCase() !== "SUBVENTED")
                return { status: "ERROR", message: "Monthly evaluation is only applicable to Subvented personnel." };
            const periodCheck = validateMonthlyEvaluationPeriod_(personnel, month, year);
            if (!periodCheck || periodCheck.valid !== true)
                return { status: "ERROR", message: periodCheck && periodCheck.message ? periodCheck.message : "This monthly evaluation is outside the service period." };
            const deadline = getMonthlyDeadline_(month, year);
            if (!deadline || !deadline.endDate)
                return { status: "ERROR", message: "Monthly evaluation deadline could not be determined." };
            const eligibilityDate = getEvaluationEligibilityDate_(personnel);
            if (!eligibilityDate)
                return { status: "ERROR", message: "Personnel eligibility date could not be determined." };
            isLate = isAfterCalendarDateForEvaluationFix_(new Date(), deadline.endDate) || isAfterCalendarDateForEvaluationFix_(eligibilityDate, deadline.endDate);
        }
        else {
            const periodInfo = getAnnualEvaluationPeriod_(personnel, new Date());
            if (!periodInfo || !periodInfo.serviceEndDate) {
                return { status: "ERROR", message: "Annual evaluation service dates are not properly configured." };
            }
            const serviceYear = String(periodInfo.serviceYear || "").trim();
            canonicalPeriod = normalizeEvaluationApprovalPeriodForFix_(type, data.period);
            if (!serviceYear || canonicalPeriod !== normalizeEvaluationApprovalPeriodForFix_(type, serviceYear))
                return { status: "ERROR", message: "The annual approval period does not match the personnel's Service Year." };
            isLate = isAfterCalendarDateForEvaluationFix_(new Date(), periodInfo.serviceEndDate);
            canonicalPeriod = serviceYear;
        }
    }
    catch (validationError) {
        return { status: "ERROR", message: String(validationError.message || validationError) };
    }
    if (!isLate)
        return { status: "ERROR", message: "A late-evaluation decision can only be recorded after the relevant deadline or late-registration condition has been met." };
    const sheet = getDatabase().getSheetByName("EVALUATION_APPROVALS");
    if (!sheet)
        return { status: "ERROR", message: "EVALUATION_APPROVALS sheet was not found." };
    const lock = LockService.getScriptLock();
    let lockHeld = false;
    try {
        lock.waitLock(10000);
        lockHeld = true;
        const values = sheet.getDataRange().getValues();
        if (!values.length || !values[0] || !values[0].length)
            return { status: "ERROR", message: "EVALUATION_APPROVALS has no header row." };
        const columns = evaluationApprovalHeaderMapForFix_(values[0]);
        const required = ["id", "nss", "type", "period", "reason", "decision", "by", "date"];
        const missing = required.filter(function (key) { return columns[key] < 0; });
        if (missing.length)
            return { status: "ERROR", message: "EVALUATION_APPROVALS is missing required headers: " + missing.join(", ") };
        const targetNss = nss.toUpperCase();
        const targetPeriod = normalizeEvaluationApprovalPeriodForFix_(type, canonicalPeriod);
        const matchingRows = [];
        let latestFinal = null;
        for (let i = 1; i < values.length; i++) {
            const row = values[i];
            if (String(row[columns.nss] || "").trim().toUpperCase() !== targetNss)
                continue;
            if (String(row[columns.type] || "").trim().toUpperCase() !== type)
                continue;
            if (normalizeEvaluationApprovalPeriodForFix_(type, row[columns.period]) !== targetPeriod)
                continue;
            if (!isLateEvaluationApprovalReason_(row[columns.reason]))
                continue;
            const match = { rowNumber: i + 1, decision: String(row[columns.decision] || "").trim().toUpperCase(), id: String(row[columns.id] || "").trim() };
            matchingRows.push(match);
            if ((match.decision === "APPROVED" || match.decision === "REJECTED") &&
                isLateEvaluationApprovalTimestampValid_(nss, type, canonicalPeriod, row[columns.date]))
                latestFinal = match;
        }
        if (latestFinal)
            return { status: "SUCCESS", decision: latestFinal.decision, approvalId: latestFinal.id, message: "A final late-submission decision has already been recorded as " + latestFinal.decision + "." };
        const approvalId = (matchingRows.length && matchingRows[matchingRows.length - 1].id) || Utilities.getUuid();
        const targetRow = matchingRows.length ? matchingRows[matchingRows.length - 1].rowNumber : null;
        const rowValues = {
            "Approval ID": approvalId,
            "NSS Number": nss,
            "Evaluation Type": type,
            "Period": canonicalPeriod,
            "Reason": "LATE_EVALUATION_SUBMISSION",
            "Decision": decision,
            "Approved By": session.email || session.userEmail || "",
            "Approval Date": new Date()
        };
        const aliases = {
            "Approval ID": ["Approval ID", "ID"],
            "NSS Number": ["NSS Number", "NSS"],
            "Evaluation Type": ["Evaluation Type", "Type"],
            "Period": ["Period", "Evaluation Period"],
            "Reason": ["Reason", "Request Type"],
            "Decision": ["Decision", "Approval Decision"],
            "Approved By": ["Approved By", "Decided By", "Officer"],
            "Approval Date": ["Approval Date", "Decision Date", "Date Approved"]
        };
        const row = targetRow ? sheet.getRange(targetRow, 1, 1, sheet.getLastColumn()).getValues()[0] : new Array(sheet.getLastColumn()).fill("");
        Object.keys(rowValues).forEach(function (field) {
            const index = findEvaluationHeaderIndex_(values[0], aliases[field]);
            if (index >= 0)
                row[index] = rowValues[field];
        });
        if (targetRow)
            sheet.getRange(targetRow, 1, 1, row.length).setValues([row]);
        else
            sheet.appendRow(row);
        SpreadsheetApp.flush();
        try {
            writeAuditLog_(session.email || session.userEmail || "", "LATE_EVALUATION_" + decision, nss + " / " + type + " / " + canonicalPeriod);
        }
        catch (auditError) {
            console.error("Late evaluation decision audit log failed:", auditError);
        }
        return { status: "SUCCESS", decision: decision, approvalId: approvalId, message: decision === "APPROVED" ? "Late evaluation submission approved." : "Late evaluation submission rejected." };
    }
    catch (error) {
        console.error("recordEvaluationLateDecision error:", error);
        return { status: "ERROR", message: "Unable to record the late evaluation decision. " + String(error.message || error) };
    }
    finally {
        if (lockHeld && lock.hasLock())
            lock.releaseLock();
    }
}
/* ===== captureEvaluationSubmission ===== */
function captureEvaluationSubmission(data) {
    if (!data || !data.nssNumber || !data.type) {
        return {
            status: "ERROR",
            message: "Missing evaluation information."
        };
    }
    const type = String(data.type).trim().toUpperCase();
    const nss = String(data.nssNumber).trim();
    const token = String(data.sessionToken || "").trim();
    if (type !== "MONTHLY" && type !== "ANNUAL") {
        return {
            status: "ERROR",
            message: "Invalid evaluation type."
        };
    }
    const updateExistingRequested = data.updateExisting === true ||
        ["1", "true", "yes"].indexOf(String(data.updateExisting || "")
            .trim()
            .toLowerCase()) !== -1;
    // Preserve the existing officer authentication mechanism.
    const session = validateSession(token);
    if (!session || !session.valid) {
        return {
            status: "ERROR",
            message: "Your officer session is invalid or expired. Please sign in again."
        };
    }
    const allowedRoles = [
        "SUPER ADMIN",
        "ADMIN",
        "NSA OFFICER"
    ];
    if (allowedRoles.indexOf(String(session.role || "").trim().toUpperCase()) === -1) {
        return {
            status: "ERROR",
            message: "You are not authorised to submit evaluations."
        };
    }
    const lock = LockService.getScriptLock();
    let lockHeld = false;
    let recordSaved = false;
    const warnings = [];
    try {
        lock.waitLock(10000);
        lockHeld = true;
        const personnel = findRegisteredPersonnel_(nss);
        if (!personnel) {
            return {
                status: "ERROR",
                message: "Personnel record not found."
            };
        }
        const registrationStatus = String(personnel["Status"] || "").trim().toUpperCase();
        if (registrationStatus && registrationStatus !== "ACTIVE") {
            return { status: "ERROR", message: "This personnel record is not active." };
        }
        const submittedDate = new Date();
        const officer = session.email ||
            session.userEmail ||
            "OFFICER PORTAL";
        const serviceStatus = getServiceStatus_(personnel);
        let lateFlag = "ON TIME";
        let periodText = "";
        let month = null;
        let year = null;
        let serviceYear = "";
        let captureCode = "";
        let recordId = Utilities.getUuid();
        // =====================================================
        // MONTHLY EVALUATION
        // =====================================================
        if (type === "MONTHLY") {
            const allowanceType = String(personnel["Allowance Type"] || "").trim().toUpperCase();
            if (allowanceType !== "SUBVENTED") {
                return {
                    status: "ERROR",
                    message: "Monthly evaluation is only applicable to Subvented personnel."
                };
            }
            month = Number(data.month);
            year = Number(data.year);
            if (!Number.isInteger(month) ||
                month < 1 ||
                month > 12) {
                return {
                    status: "ERROR",
                    message: "Please select a valid evaluation month."
                };
            }
            if (!Number.isInteger(year) ||
                year < 2000 ||
                year > 2100) {
                return {
                    status: "ERROR",
                    message: "Please select a valid evaluation year."
                };
            }
            const now = new Date();
            if (year > now.getFullYear() ||
                (year === now.getFullYear() &&
                    month > now.getMonth() + 1)) {
                return {
                    status: "ERROR",
                    message: "A future monthly evaluation cannot be submitted."
                };
            }
            // Use the same service-period eligibility validator as getEvaluationPrecheck().
            // This keeps the page precheck and the final save decision consistent.
            const periodCheck = validateMonthlyEvaluationPeriod_(personnel, month, year);
            if (!periodCheck || periodCheck.valid !== true) {
                return {
                    status: "ERROR",
                    code: "OUTSIDE_SERVICE_PERIOD",
                    message: periodCheck && periodCheck.message
                        ? periodCheck.message
                        : "This monthly evaluation is not applicable to the personnel for the selected month."
                };
            }
            const deadline = getMonthlyDeadline_(month, year);
            if (!deadline || !deadline.endDate) {
                return {
                    status: "ERROR",
                    message: "Monthly evaluation deadline could not be determined."
                };
            }
            // Check for an existing monthly submission while holding the script lock.
            const existing = checkMonthlySubmission_(nss, month, year);
            if (existing && existing.found && existing.id)
                recordId = String(existing.id);
            const updatingExisting = Boolean(existing &&
                existing.found &&
                updateExistingRequested);
            if (updateExistingRequested && !updatingExisting) {
                return {
                    status: "ERROR",
                    message: "The existing monthly submission could not be found. " +
                        "Refresh the page and try again."
                };
            }
            if (existing && existing.found && !updateExistingRequested) {
                return {
                    status: "ERROR",
                    code: "DUPLICATE_SUBMISSION",
                    message: "Monthly evaluation for " +
                        formatEvaluationMonthName_(month) +
                        " " + year +
                        " has already been submitted."
                };
            }
            // Use the same eligibility date and approval record as the precheck.
            // Compare calendar dates, not timestamps, so the deadline date remains valid
            // for the entire day. Late registration and late submission share the
            // EVALUATION_APPROVALS decision used by getEvaluationPrecheck().
            const eligibilityDate = getEvaluationEligibilityDate_(personnel);
            if (!eligibilityDate) {
                return {
                    status: "ERROR",
                    message: "Personnel eligibility date could not be determined."
                };
            }
            const lateRegistration = isAfterCalendarDateForEvaluationFix_(eligibilityDate, deadline.endDate);
            const lateSubmission = isAfterCalendarDateForEvaluationFix_(submittedDate, deadline.endDate);
            if (lateRegistration || lateSubmission) {
                const approval = getEvaluationApprovalDecision_(nss, "MONTHLY", month + "/" + year);
                if (approval.decision === "REJECTED") {
                    return {
                        status: "ERROR",
                        code: "LATE_EVALUATION_REJECTED",
                        message: "Late evaluation submission was rejected by the officer."
                    };
                }
                if (approval.decision !== "APPROVED") {
                    return {
                        status: "ERROR",
                        code: "LATE_EVALUATION_APPROVAL_REQUIRED",
                        message: "Officer approval is required before this late monthly evaluation can be submitted."
                    };
                }
            }
            // Duplicate detection has already been completed above under the script lock.
            // Require and retain the six-character office code.
            captureCode = String(data.captureCode || "")
                .trim()
                .toUpperCase();
            if (!/^[A-Z0-9]{6}$/.test(captureCode)) {
                return {
                    status: "ERROR",
                    message: "Enter or scan the valid six-character office capture code."
                };
            }
            const sheet = getDatabase().getSheetByName("MONTHLY_EVALUATIONS");
            if (!sheet) {
                return {
                    status: "ERROR",
                    message: "MONTHLY_EVALUATIONS sheet was not found."
                };
            }
            if (lateRegistration || lateSubmission) {
                lateFlag = "LATE";
            }
            periodText = formatEvaluationMonthName_(month) + " " + year;
            /*
             * Existing column order:
             * ID, NSS Number, Registration Number, Batch,
             * Month, Year, Deadline Date, Submitted Date,
             * Captured By, Late Flag, Service Status, Status,
             * Capture Code.
             */
            const monthlyRecord = {
                "ID": recordId,
                "NSS Number": personnel["NSS Number"],
                "Registration Number": personnel["Registration Number"],
                "Batch": personnel["Batch"],
                "Month": month,
                "Year": year,
                "Deadline Date": deadline.endDate,
                "Submitted Date": submittedDate,
                "Captured By": officer,
                "Late Flag": lateFlag,
                "Service Status": serviceStatus,
                "Status": "SUBMITTED",
                "Capture Code": captureCode
            };
            writeEvaluationRecordByHeaders_(sheet, monthlyRecord, updatingExisting ? existing.rowNumber : null);
            recordSaved = true;
            // Keep tracking and audit updates without falsely
            // reporting that the saved evaluation was not recorded.
            try {
                updateEvaluationTracking_(nss, "MONTHLY", month + "/" + year);
            }
            catch (e) {
                warnings.push("Evaluation tracking update failed.");
                console.error("Monthly tracking update:", e);
            }
            try {
                writeAuditLog_(officer, updatingExisting
                    ? "EVALUATION_UPDATED"
                    : "EVALUATION_SUBMITTED", nss + " / MONTHLY / " + month + "/" + year);
                writeEvaluationAudit_({
                    nss: nss,
                    action: updatingExisting ? "UPDATED" : "SUBMITTED",
                    type: "MONTHLY",
                    month: month,
                    year: year,
                    batch: personnel["Batch"],
                    serviceYear: personnel["Service Year"] || "",
                    source: data.source || "PORTAL"
                });
            }
            catch (e) {
                warnings.push("Audit logging requires review.");
                console.error("Monthly evaluation audit:", e);
            }
        }
        // =====================================================
        // ANNUAL EVALUATION
        // =====================================================
        else {
            // Annual period is derived from the existing service
            // period helper, not from the monthly calendar.
            const period = getAnnualEvaluationPeriod_(personnel, new Date());
            if (!period) {
                return {
                    status: "ERROR",
                    message: "Annual evaluation period could not be determined for this personnel."
                };
            }
            serviceYear = String(period.serviceYear || "").trim();
            if (!serviceYear) {
                return {
                    status: "ERROR",
                    message: "Personnel Service Year is missing. Annual evaluation cannot be submitted."
                };
            }
            const existing = checkAnnualSubmission_(nss, serviceYear);
            if (existing && existing.found && existing.id)
                recordId = String(existing.id);
            const updatingExisting = Boolean(existing &&
                existing.found &&
                updateExistingRequested);
            if (updateExistingRequested && !updatingExisting) {
                return {
                    status: "ERROR",
                    message: "The existing annual submission could not be found. " +
                        "Refresh the page and try again."
                };
            }
            if (existing && existing.found && !updateExistingRequested) {
                return {
                    status: "ERROR",
                    code: "DUPLICATE_SUBMISSION",
                    message: "Annual evaluation for Service Year " +
                        serviceYear +
                        " has already been submitted."
                };
            }
            const serviceEndDate = new Date(period.serviceEndDate);
            if (isNaN(serviceEndDate.getTime())) {
                return {
                    status: "ERROR",
                    message: "Annual Service End Date could not be determined."
                };
            }
            const annualDeadline = new Date(serviceEndDate.getFullYear(), serviceEndDate.getMonth(), serviceEndDate.getDate());
            const annualLate = isAfterCalendarDateForEvaluationFix_(submittedDate, annualDeadline);
            if (annualLate) {
                lateFlag = "LATE";
                let approval;
                try {
                    approval = getEvaluationApprovalDecision_(nss, "ANNUAL", serviceYear);
                }
                catch (approvalError) {
                    return { status: "ERROR", code: "APPROVAL_CONFIGURATION", message: String(approvalError.message || approvalError) };
                }
                if (approval.decision === "REJECTED") {
                    return { status: "ERROR", code: "LATE_EVALUATION_REJECTED", message: "Late annual evaluation submission was rejected by the officer." };
                }
                if (approval.decision !== "APPROVED") {
                    return { status: "ERROR", code: "LATE_EVALUATION_APPROVAL_REQUIRED", message: "Officer approval is required before this late annual evaluation can be submitted." };
                }
            }
            const sheet = getDatabase().getSheetByName("ANNUAL_EVALUATIONS");
            if (!sheet) {
                return {
                    status: "ERROR",
                    message: "ANNUAL_EVALUATIONS sheet was not found."
                };
            }
            periodText = serviceYear;
            /*
             * Existing annual column order:
             * ID, NSS Number, Registration Number, Allowance Type,
             * Batch, Submitted Date, Captured By, Status,
             * Evaluation Period, Deadline Date, Late Flag,
             * Service Status.
             *
             * Annual evaluation does not require a capture code.
             */
            const annualRecord = {
                "ID": recordId,
                "NSS Number": personnel["NSS Number"],
                "Registration Number": personnel["Registration Number"],
                "Allowance Type": personnel["Allowance Type"],
                "Batch": personnel["Batch"],
                "Evaluation Period": serviceYear,
                "Deadline Date": annualDeadline,
                "Submitted Date": submittedDate,
                "Captured By": officer,
                "Late Flag": lateFlag,
                "Service Status": serviceStatus,
                "Status": "SUBMITTED"
            };
            writeEvaluationRecordByHeaders_(sheet, annualRecord, updatingExisting ? existing.rowNumber : null);
            recordSaved = true;
            try {
                updateEvaluationTracking_(nss, "ANNUAL", serviceYear);
            }
            catch (e) {
                warnings.push("Evaluation tracking update failed.");
                console.error("Annual tracking update:", e);
            }
            try {
                writeAuditLog_(officer, updatingExisting
                    ? "EVALUATION_UPDATED"
                    : "EVALUATION_SUBMITTED", nss + " / ANNUAL / " + serviceYear);
                writeEvaluationAudit_({
                    nss: nss,
                    action: updatingExisting ? "UPDATED" : "SUBMITTED",
                    type: "ANNUAL",
                    batch: personnel["Batch"],
                    serviceYear: serviceYear,
                    source: data.source || "PORTAL"
                });
            }
            catch (e) {
                warnings.push("Audit logging requires review.");
                console.error("Annual evaluation audit:", e);
            }
        }
        SpreadsheetApp.flush();
        // Release the database lock before attempting network
        // notifications, which may take longer than a sheet write.
        if (lockHeld) {
            lock.releaseLock();
            lockHeld = false;
        }
        // =====================================================
        // EMAIL CONFIRMATION
        // =====================================================
        try {
            const confirmationData = type === "MONTHLY"
                ? {
                    month: month,
                    year: year,
                    period: periodText
                }
                : {
                    period: serviceYear
                };
            sendEvaluationSubmissionConfirmation_(personnel, confirmationData, type);
        }
        catch (e) {
            warnings.push("Email confirmation could not be sent.");
            console.error("Evaluation confirmation email:", e);
        }
        // =====================================================
        // SMS CONFIRMATION
        // =====================================================
        try {
            if (personnel["Phone Number"]) {
                const message = type === "MONTHLY"
                    ? (updateExistingRequested
                        ? "NSA WAWM: Your " + periodText + " monthly evaluation has been updated successfully."
                        : "NSA WAWM: Your " + periodText + " monthly evaluation has been received successfully.")
                    : (updateExistingRequested
                        ? "NSA WAWM: Your annual evaluation for Service Year " + serviceYear + " has been updated successfully."
                        : "NSA WAWM: Your annual evaluation for Service Year " + serviceYear + " has been received successfully.");
                sendEvaluationSMS_({
                    nss: nss,
                    type: type + "_CONFIRMATION",
                    phone: personnel["Phone Number"],
                    message: message
                });
            }
        }
        catch (e) {
            warnings.push("SMS confirmation could not be sent.");
            console.error("Evaluation confirmation SMS:", e);
        }
        return {
            status: "SUCCESS",
            message: updateExistingRequested
                ? (type === "MONTHLY"
                    ? "Monthly evaluation for " + periodText +
                        " updated successfully."
                    : "Annual evaluation for Service Year " +
                        serviceYear + " updated successfully.")
                : (type === "MONTHLY"
                    ? "Monthly evaluation for " + periodText +
                        " recorded successfully."
                    : "Annual evaluation for Service Year " +
                        serviceYear + " recorded successfully."),
            referenceId: recordId,
            period: periodText,
            updated: updateExistingRequested,
            warnings: warnings
        };
    }
    catch (error) {
        console.error("CAPTURE EVALUATION SUBMISSION ERROR:", error);
        // If the sheet row was already written, do not tell the
        // officer that the evaluation was not recorded.
        if (recordSaved) {
            return {
                status: "SUCCESS",
                message: "The evaluation was recorded, but a follow-up operation requires review.",
                referenceId: recordId,
                warnings: [String(error.message || error)]
            };
        }
        return {
            status: "ERROR",
            message: "The evaluation could not be recorded. " +
                String(error.message || error)
        };
    }
    finally {
        if (lockHeld && lock.hasLock()) {
            lock.releaseLock();
        }
    }
}
/* ===== testOneReminder ===== */
function testOneReminder(nssNumber, confirmSend) {
    const nss = String(nssNumber || "").trim();
    if (!nss) {
        return { status: "ERROR", message: "Supply an NSS number. No notification was sent." };
    }
    const person = findRegisteredPersonnel_(nss);
    if (!person)
        return { status: "ERROR", message: "Personnel record not found. No notification was sent." };
    const name = String(person["Full Name"] || "").trim();
    const phone = String(person["Phone Number"] || person["Phone"] || "").trim();
    const email = String(person["Email"] || "").trim();
    const message = "Dear " + (name || "NSA Personnel") + ",\n\n" +
        "This is a test notification from the NSA Wassa Amenfi West Municipal Secretariat.\n\n" +
        "Your monthly evaluation reminder notification system is being tested. Please disregard this message.\n\n" +
        "NSA Wassa Amenfi West Municipal Secretariat";
    if (confirmSend !== true) {
        Logger.log("Reminder test preview prepared for NSS " + nss + ". No email or SMS was sent.");
        return { status: "PREVIEW", message: "Preview prepared. No notification was sent. To send a real test, explicitly run testOneReminder('NSS_NUMBER', true)." };
    }
    let emailResult = false;
    let smsResult = false;
    if (email)
        emailResult = sendEmail_(email, "NSA WAWM Test Evaluation Reminder", message);
    if (phone)
        smsResult = sendSMSOnline_(phone, message);
    return { status: "SUCCESS", emailSent: Boolean(emailResult), smsSent: Boolean(smsResult) };
}
/* ===== sendBirthdayGreetings ===== */
function sendBirthdayGreetings() {
    const lock = LockService.getScriptLock();
    if (!lock.tryLock(30000)) {
        console.log("Birthday engine skipped: another execution is running.");
        return;
    }
    try {
        const today = new Date();
        const todayKey = birthdayFormatDateKey_(today);
        const currentYear = Number(todayKey.substring(0, 4));
        const currentMonth = Number(todayKey.substring(5, 7));
        const currentDay = Number(todayKey.substring(8, 10));
        const sheet = getDatabase()
            .getSheetByName("REGISTERED_PERSONNEL");
        if (!sheet) {
            console.error("REGISTERED_PERSONNEL sheet was not found.");
            return;
        }
        const data = sheet.getDataRange().getValues();
        if (data.length < 2) {
            return;
        }
        const currentYearIsLeapYear = isLeapYear_(currentYear);
        for (let i = 1; i < data.length; i++) {
            try {
                const personnel = getRowObject_("REGISTERED_PERSONNEL", data[i]);
                const nss = String(personnel["NSS Number"] || "").trim();
                if (!nss) {
                    continue;
                }
                const name = String(personnel["Full Name"] || "").trim();
                /* ================================================
                   CHECK SERVICE STATUS
                   ================================================ */
                const serviceStatus = String((typeof getServiceStatus_ === "function"
                    ? getServiceStatus_(personnel)
                    : personnel["Service Status"]) || "").trim().toUpperCase();
                if (serviceStatus &&
                    serviceStatus !== "ACTIVE") {
                    continue;
                }
                const serviceStart = birthdayParseDateOnly_(personnel["Service Start Date"]);
                const serviceEnd = birthdayParseDateOnly_(personnel["Service End Date"]);
                /*
                 * Do not send before service begins.
                 */
                if (serviceStart &&
                    todayKey < serviceStart.key) {
                    continue;
                }
                /*
                 * Do not send after service ends.
                 */
                if (serviceEnd &&
                    todayKey > serviceEnd.key) {
                    continue;
                }
                /*
                 * If neither service dates nor an active status
                 * establishes eligibility, do not send.
                 */
                if (!serviceStart &&
                    !serviceEnd &&
                    serviceStatus !== "ACTIVE") {
                    console.warn("Birthday skipped: service eligibility cannot " +
                        "be established for NSS " + nss);
                    continue;
                }
                /* ================================================
                   IDENTIFY SERVICE PERIOD
                   ================================================ */
                const servicePeriodKey = birthdayGetServicePeriodKey_(personnel, serviceStart, serviceEnd);
                if (!servicePeriodKey) {
                    console.warn("Birthday skipped: no reliable service-period " +
                        "identifier for NSS " + nss);
                    continue;
                }
                /* ================================================
                   READ DATE OF BIRTH
                   ================================================ */
                const birthday = getBirthdayParts_(personnel["Date of Birth"]);
                if (!birthday) {
                    continue;
                }
                /* ================================================
                   CHECK TODAY'S BIRTHDAY
                   ================================================ */
                let isBirthday = birthday.month === currentMonth &&
                    birthday.day === currentDay;
                /*
                 * For 29 February birthdays, use 28 February
                 * in non-leap years.
                 */
                if (birthday.month === 2 &&
                    birthday.day === 29 &&
                    !currentYearIsLeapYear &&
                    currentMonth === 2 &&
                    currentDay === 28) {
                    isBirthday = true;
                }
                if (!isBirthday) {
                    continue;
                }
                const birthdayPeriod = Utilities.formatString("%02d-%02d", birthday.month, birthday.day);
                /*
                 * Include the service period in the reminder-log
                 * period so another birthday in a different
                 * service period can be treated independently.
                 */
                const reminderPeriod = "BIRTHDAY=" + birthdayPeriod +
                    "|SERVICE=" + servicePeriodKey;
                /* ================================================
                   CHECK DELIVERY HISTORY
        
                   Email and SMS are checked independently.
                   A successful email will not be sent again
                   merely because SMS delivery failed.
                   ================================================ */
                const delivery = birthdayGetDeliveryStatus_(nss, reminderPeriod, birthdayPeriod, todayKey);
                if (delivery.emailSent &&
                    delivery.smsSent) {
                    continue;
                }
                /* ================================================
                   CONTACT DETAILS
                   ================================================ */
                const email = String(personnel["Email"] || "").trim();
                const phone = String(getPersonnelPhone_(nss) || "").trim();
                if ((!email || delivery.emailSent) &&
                    (!phone || delivery.smsSent)) {
                    continue;
                }
                /* ================================================
                   EMAIL CONTENT
                   ================================================ */
                const emailMessage = `
<div style="font-family:Arial,sans-serif;font-size:14px;
line-height:1.6;color:#222;max-width:600px;">
  <p>Dear ${birthdayEscapeHTML_(name || "NSA Personnel")},</p>
  <p><strong>Happy Birthday!</strong></p>
  <p>
    The NSA Wassa Amenfi West Municipal Secretariat
    wishes you a wonderful birthday.
  </p>
  <p>
    May the year ahead bring you good health,
    happiness, personal growth and continued success
    in your service.
  </p>
  <p>Enjoy your special day.</p>
  <p>
    <strong>
      NSA Wassa Amenfi West Municipal Secretariat
    </strong>
  </p>
</div>`;
                /* ================================================
                   SMS CONTENT
                   ================================================ */
                const smsMessage = "Happy Birthday, " +
                    (name || "NSA Personnel") +
                    "! The NSA Wassa Amenfi West Municipal " +
                    "Secretariat wishes you good health, happiness " +
                    "and continued success. Enjoy your special day!";
                /* ================================================
                   SEND EMAIL IF NOT ALREADY SENT
                   ================================================ */
                let emailResult = false;
                if (email && !delivery.emailSent) {
                    try {
                        emailResult = !!sendEmail_(email, "Happy Birthday from NSA Wassa Amenfi West Municipal Secretariat", emailMessage);
                    }
                    catch (emailError) {
                        console.error("Birthday email failed for " + nss + ": " +
                            emailError.message);
                    }
                }
                /* ================================================
                   SEND SMS IF NOT ALREADY SENT
                   ================================================ */
                let smsResult = false;
                if (phone && !delivery.smsSent) {
                    try {
                        smsResult = !!sendSMSOnline_(phone, smsMessage);
                    }
                    catch (smsError) {
                        console.error("Birthday SMS failed for " + nss + ": " +
                            smsError.message);
                    }
                }
                /* ================================================
                   LOG SUCCESSFUL CHANNELS
        
                   The logger records each successful channel
                   separately, using the same service-period key.
                   ================================================ */
                if (emailResult || smsResult) {
                    logReminder_(nss, "BIRTHDAY", reminderPeriod, emailResult, smsResult, today, "BIRTHDAY");
                }
            }
            catch (personnelError) {
                console.error("Birthday processing failed for row " +
                    (i + 1) + ": " +
                    personnelError.message);
            }
        }
    }
    finally {
        lock.releaseLock();
    }
}
/* ===== birthdayGetServicePeriodKey_ ===== */
function birthdayGetServicePeriodKey_(personnel, serviceStart, serviceEnd) {
    /*
     * Use both service dates when available.
     */
    if (serviceStart && serviceEnd) {
        return ("START=" + serviceStart.key +
            ";END=" + serviceEnd.key);
    }
    /*
     * Fall back to the recorded service year when
     * one or both service dates are unavailable.
     */
    const serviceYear = String(personnel["Service Year"] || "").trim();
    if (serviceYear) {
        return "SERVICE_YEAR=" + serviceYear;
    }
    /*
     * Last fallback: use whichever service date exists.
     */
    if (serviceStart || serviceEnd) {
        return ("START=" + (serviceStart ? serviceStart.key : "UNKNOWN") +
            ";END=" + (serviceEnd ? serviceEnd.key : "UNKNOWN"));
    }
    /*
     * Registration date is a final fallback, not a
     * substitute for maintaining proper service dates.
     */
    const registrationDate = birthdayParseDateOnly_(personnel["Date Registered"]);
    if (registrationDate) {
        return "REGISTERED=" + registrationDate.key;
    }
    return "";
}
/* ===== birthdayGetDeliveryStatus_ ===== */
function birthdayGetDeliveryStatus_(nss, reminderPeriod, birthdayPeriod, todayKey) {
    const result = {
        emailSent: false,
        smsSent: false
    };
    const sheet = getDatabase()
        .getSheetByName("REMINDER_LOG");
    if (!sheet || sheet.getLastRow() < 2) {
        return result;
    }
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const normalize = function (value) {
        return String(value || "")
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "");
    };
    const findColumn = function (names) {
        const accepted = names.map(normalize);
        return headers.findIndex(function (header) {
            return accepted.indexOf(normalize(header)) !== -1;
        });
    };
    const nssCol = findColumn(["NSS Number", "NSS"]);
    const typeCol = findColumn(["Reminder Type"]);
    const channelCol = findColumn(["Channel"]);
    const dateCol = findColumn(["Date Sent", "Sent Date"]);
    const statusCol = findColumn(["Status"]);
    const evalCol = findColumn(["Evaluation Type"]);
    const periodCol = findColumn(["Period"]);
    if (nssCol < 0 ||
        typeCol < 0 ||
        channelCol < 0 ||
        statusCol < 0) {
        console.error("REMINDER_LOG is missing required columns " +
            "for birthday duplicate checking.");
        return result;
    }
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const rowNss = String(row[nssCol] || "").trim().toUpperCase();
        if (rowNss !== String(nss).trim().toUpperCase()) {
            continue;
        }
        const reminderType = String(row[typeCol] || "").trim().toUpperCase();
        const channel = String(row[channelCol] || "").trim().toUpperCase();
        const status = String(row[statusCol] || "").trim().toUpperCase();
        if (reminderType !== "BIRTHDAY" ||
            (status !== "SENT" && status !== "SUCCESS") ||
            (channel !== "EMAIL" && channel !== "SMS")) {
            continue;
        }
        const loggedPeriod = periodCol >= 0
            ? String(row[periodCol] || "").trim()
            : "";
        const loggedEvaluationType = evalCol >= 0
            ? String(row[evalCol] || "").trim().toUpperCase()
            : "";
        const dateValue = dateCol >= 0
            ? row[dateCol]
            : "";
        const loggedDate = birthdayParseDateOnly_(dateValue);
        const loggedDateKey = loggedDate
            ? loggedDate.key
            : "";
        /*
         * A matching service-period record prevents
         * another greeting during that service period.
         */
        const sameServicePeriod = loggedEvaluationType === "BIRTHDAY" &&
            loggedPeriod === reminderPeriod;
        /*
         * Backward compatibility with earlier birthday
         * logs: prevent another send on the same day.
         */
        const sameDayLegacyRecord = loggedDateKey === todayKey &&
            (!loggedPeriod ||
                !loggedEvaluationType ||
                (loggedEvaluationType === "BIRTHDAY" &&
                    loggedPeriod === birthdayPeriod));
        if (!sameServicePeriod &&
            !sameDayLegacyRecord) {
            continue;
        }
        if (channel === "EMAIL") {
            result.emailSent = true;
        }
        if (channel === "SMS") {
            result.smsSent = true;
        }
        if (result.emailSent && result.smsSent) {
            break;
        }
    }
    return result;
}
/* ===== isLeapYear_ ===== */
function isLeapYear_(year) {
    return (year % 4 === 0 &&
        (year % 100 !== 0 ||
            year % 400 === 0));
}
/* ===== getBirthdayParts_ ===== */
function getBirthdayParts_(value) {
    const parsed = birthdayParseDateOnly_(value);
    if (!parsed) {
        return null;
    }
    return {
        year: parsed.year,
        month: parsed.month,
        day: parsed.day
    };
}
/* ===== birthdayParseDateOnly_ ===== */
function birthdayParseDateOnly_(value) {
    if (value === null ||
        value === undefined ||
        value === "") {
        return null;
    }
    let year;
    let month;
    let day;
    const timeZone = Session.getScriptTimeZone();
    /*
     * Native Google Sheets date.
     */
    if (Object.prototype.toString.call(value) ===
        "[object Date]") {
        if (isNaN(value.getTime())) {
            return null;
        }
        const formatted = Utilities.formatDate(value, timeZone, "yyyy-MM-dd");
        const match = formatted.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (!match) {
            return null;
        }
        year = Number(match[1]);
        month = Number(match[2]);
        day = Number(match[3]);
    }
    else {
        const text = String(value).trim();
        /*
         * ISO format: YYYY-MM-DD.
         */
        let match = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
        if (match) {
            year = Number(match[1]);
            month = Number(match[2]);
            day = Number(match[3]);
        }
        else {
            /*
             * Slash-separated dates:
             * resolve unambiguous DD/MM/YYYY or MM/DD/YYYY.
             */
            match = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
            if (match) {
                const first = Number(match[1]);
                const second = Number(match[2]);
                year = Number(match[3]);
                if (first > 12 && second <= 12) {
                    day = first;
                    month = second;
                }
                else if (second > 12 && first <= 12) {
                    month = first;
                    day = second;
                }
                else {
                    /*
                     * Ambiguous slash dates are parsed using
                     * the JavaScript Date parser. Prefer native
                     * Google Sheets Date objects for DOB fields.
                     */
                    const parsed = new Date(text);
                    if (isNaN(parsed.getTime())) {
                        return null;
                    }
                    const formatted = Utilities.formatDate(parsed, timeZone, "yyyy-MM-dd");
                    const parts = formatted.split("-");
                    year = Number(parts[0]);
                    month = Number(parts[1]);
                    day = Number(parts[2]);
                }
            }
            else {
                /*
                 * Fallback for other recognised date strings.
                 */
                const parsed = new Date(text);
                if (isNaN(parsed.getTime())) {
                    return null;
                }
                const formatted = Utilities.formatDate(parsed, timeZone, "yyyy-MM-dd");
                const parts = formatted.split("-");
                year = Number(parts[0]);
                month = Number(parts[1]);
                day = Number(parts[2]);
            }
        }
    }
    /*
     * Validate the actual calendar date.
     */
    if (!year ||
        month < 1 ||
        month > 12 ||
        day < 1 ||
        day > new Date(year, month, 0).getDate()) {
        return null;
    }
    return {
        year: year,
        month: month,
        day: day,
        key: Utilities.formatString("%04d-%02d-%02d", year, month, day)
    };
}
/* ===== birthdayFormatDateKey_ ===== */
function birthdayFormatDateKey_(value) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), "yyyy-MM-dd");
}
/* ===== birthdayEscapeHTML_ ===== */
function birthdayEscapeHTML_(value) {
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
/* ===== reminderNormalizeStatus_ ===== */
function reminderNormalizeStatus_(value) {
    return String(value || "").trim().toUpperCase();
}
/* ===== reminderRowIsSubmitted_ ===== */
function reminderRowIsSubmitted_(row) {
    if (!row)
        return false;
    const status = String(row["Status"] || "").trim().toUpperCase();
    const serviceStatus = String(row["Service Status"] || "").trim().toUpperCase();
    if (status === "SUBMITTED" || serviceStatus === "SUBMITTED")
        return true;
    const submittedCell = String(row["Submitted Date"] || "").trim().toUpperCase();
    const legacyAnnual = submittedCell === "SUBMITTED" && row["Evaluation Period"] instanceof Date && String(row["Captured By"] || "").trim() !== "";
    const legacyMonthly = submittedCell === "SUBMITTED" && row["Year"] instanceof Date && Number(row["Batch"]) >= 1 && Number(row["Batch"]) <= 12 && Number(row["Month"]) >= 2000 && Number(row["Month"]) <= 2100;
    return legacyAnnual || legacyMonthly;
}
/* ===== reminderNormalizeMonthYear_ ===== */
function reminderNormalizeMonthYear_(value) {
    if (value instanceof Date && !isNaN(value.getTime())) {
        return (value.getMonth() + 1) + "/" + value.getFullYear();
    }
    const text = String(value === null || value === undefined ? "" : value).trim();
    if (!text) {
        return "";
    }
    // Accept M/YYYY, MM/YYYY, M-YYYY, YYYY/M and YYYY-MM.
    let match = text.match(/^(\d{1,2})\s*[\/.-]\s*(\d{4})$/);
    if (match) {
        return Number(match[1]) + "/" + Number(match[2]);
    }
    match = text.match(/^(\d{4})\s*[\/.-]\s*(\d{1,2})$/);
    if (match) {
        return Number(match[2]) + "/" + Number(match[1]);
    }
    // Also accept readable values such as "October 2026".
    const parsed = new Date(text);
    if (!isNaN(parsed.getTime())) {
        return (parsed.getMonth() + 1) + "/" + parsed.getFullYear();
    }
    return "";
}
/* ===== reminderNormalizeAnnualPeriod_ ===== */
function reminderNormalizeAnnualPeriod_(value) {
    if (value === null || value === undefined) {
        return "";
    }
    return String(value)
        .trim()
        .replace(/\s+/g, "")
        .replace(/[‐‑‒–—-]/g, "/")
        .toUpperCase();
}
/* ===== getSubmittedMonthlyEvaluationKeys_ ===== */
function getSubmittedMonthlyEvaluationKeys_() {
    const sheet = getDatabase().getSheetByName("MONTHLY_EVALUATIONS");
    if (!sheet)
        throw new Error("MONTHLY_EVALUATIONS sheet was not found.");
    const data = sheet.getDataRange().getValues();
    const keys = new Set();
    for (let i = 1; i < data.length; i++) {
        const row = getRowObject_("MONTHLY_EVALUATIONS", data[i]);
        if (!reminderRowIsSubmitted_(row))
            continue;
        const nss = String(row["NSS Number"] || "").trim().toUpperCase();
        const period = getMonthlySubmissionPeriodFromRow_(row);
        if (nss && period.month >= 1 && period.month <= 12 && period.year >= 2000)
            keys.add(nss + "|" + period.month + "|" + period.year);
    }
    return keys;
}
/* ===== getSubmittedAnnualEvaluationKeys_ ===== */
function getSubmittedAnnualEvaluationKeys_() {
    const sheet = getDatabase().getSheetByName("ANNUAL_EVALUATIONS");
    if (!sheet)
        throw new Error("ANNUAL_EVALUATIONS sheet was not found.");
    const data = sheet.getDataRange().getValues();
    const keys = new Set();
    for (let i = 1; i < data.length; i++) {
        const row = getRowObject_("ANNUAL_EVALUATIONS", data[i]);
        if (!reminderRowIsSubmitted_(row))
            continue;
        const nss = String(row["NSS Number"] || "").trim().toUpperCase();
        const period = normalizeEvaluationApprovalPeriodForFix_("ANNUAL", getAnnualEvaluationPeriodFromSubmissionRow_(row));
        if (nss && period)
            keys.add(nss + "|" + period);
    }
    return keys;
}


/* =========================================================
   ENROLMENT STATUS REMINDERS
   Sends reminders every other working day (weekdays only,
   with isWorkingDay_ used for the project's working-day rule).

   Status 1: Posted - Regional Acceptance Approved
     - Master record exists but personnel is not registered.
     - Ask the person to report to the district office to register.

   Status 2: Posted - Awaiting Acceptance
     - Ask the person to complete regional validation and then
       district registration.

   Office contact numbers can be stored in SYSTEM_SETTINGS as:
     OFFICE_PHONE_1
     OFFICE_PHONE_2
   ========================================================= */

function runEnrollmentStatusReminders() {
    const today = new Date();
    if (typeof isWorkingDay_ === "function" && !isWorkingDay_(today)) {
        return { status: "SKIPPED", reason: "Not a working day." };
    }

    const props = PropertiesService.getScriptProperties();
    const tz = Session.getScriptTimeZone() || "Africa/Accra";
    const todayKey = Utilities.formatDate(today, tz, "yyyy-MM-dd");
    const lastRunKey = props.getProperty("ENROLMENT_REMINDER_LAST_RUN") || "";

    // Time-driven triggers can fire more than once; never process twice on one date.
    if (lastRunKey === todayKey) {
        return { status: "SKIPPED", reason: "Already processed today." };
    }

    const workdayCount = Number(props.getProperty("ENROLMENT_REMINDER_WORKDAY_COUNT") || "0") + 1;
    props.setProperty("ENROLMENT_REMINDER_LAST_RUN", todayKey);
    props.setProperty("ENROLMENT_REMINDER_WORKDAY_COUNT", String(workdayCount));

    // Send on alternating working days. The first eligible working day sends.
    if (workdayCount % 2 === 0) {
        return {
            status: "SKIPPED",
            reason: "Alternate working day; no reminder scheduled today.",
            workingDayCount: workdayCount
        };
    }

    return sendEnrollmentStatusReminders_();
}

function sendEnrollmentStatusReminders_() {
    const db = getDatabase();
    const masterSheet = db.getSheetByName("MASTER_PERSONNEL");
    const registeredSheet = db.getSheetByName("REGISTERED_PERSONNEL");
    if (!masterSheet) throw new Error('MASTER_PERSONNEL sheet was not found.');
    if (!registeredSheet) throw new Error('REGISTERED_PERSONNEL sheet was not found.');

    const masterData = masterSheet.getDataRange().getValues();
    const registeredData = registeredSheet.getDataRange().getValues();
    if (masterData.length < 2) {
        return { status: "SUCCESS", eligible: 0, emailsSent: 0, smsSent: 0 };
    }

    const masterHeaders = masterData[0].map(function(h) { return String(h || "").trim(); });
    const registeredHeaders = registeredData.length ? registeredData[0].map(function(h) {
        return String(h || "").trim();
    }) : [];

    function idx(headers, aliases, sheetName) {
        const wanted = aliases.map(function(x) {
            return String(x).toLowerCase().replace(/[^a-z0-9]/g, "");
        });
        const found = headers.findIndex(function(h) {
            return wanted.indexOf(String(h).toLowerCase().replace(/[^a-z0-9]/g, "")) !== -1;
        });
        if (found < 0) throw new Error("Missing column in " + sheetName + ": " + aliases.join(" / "));
        return found;
    }
    function nssKey(value) {
        return String(value || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    }
    function rowObj(headers, row) {
        const obj = {};
        headers.forEach(function(h, i) { obj[h] = row[i]; });
        return obj;
    }
    function setting(name) {
        try { return String(getSystemSetting_(name) || "").trim(); }
        catch (e) { return ""; }
    }
    function fitSms(text) {
        text = String(text || "").replace(/\s+/g, " ").trim();
        return text.length <= 160 ? text : text.substring(0, 157).trimEnd() + "...";
    }

    const mNss = idx(masterHeaders, ["NSS Number", "NSS"], "MASTER_PERSONNEL");
    const mStatus = idx(masterHeaders, ["Enrollment Status", "Enrolment Status"], "MASTER_PERSONNEL");
    const mName = masterHeaders.findIndex(function(h) {
        return ["full name", "personnel name"].indexOf(String(h || "").trim().toLowerCase()) !== -1;
    });
    const mOtherNames = masterHeaders.findIndex(function(h) { return h.toLowerCase() === "other names"; });
    const mLastName = masterHeaders.findIndex(function(h) { return h.toLowerCase() === "last name"; });
    const mEmail = masterHeaders.findIndex(function(h) { return h.toLowerCase() === "email"; });
    const mPhone = masterHeaders.findIndex(function(h) { return h.toLowerCase() === "phone number"; });
    const rNss = registeredHeaders.length ? idx(registeredHeaders, ["NSS Number", "NSS"], "REGISTERED_PERSONNEL") : -1;

    const registered = new Set();
    for (let i = 1; i < registeredData.length; i++) {
        const key = nssKey(registeredData[i][rNss]);
        if (key) registered.add(key);
    }

    const logSheet = db.getSheetByName("ENROLLMENT_REMINDER_LOG") ||
        db.insertSheet("ENROLLMENT_REMINDER_LOG");
    if (logSheet.getLastRow() === 0) {
        logSheet.appendRow(["Date", "NSS Number", "Enrollment Status", "Channel", "Recipient", "Status", "Details"]);
    }

    const todayKey = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || "Africa/Accra", "yyyy-MM-dd");
    const existingLogs = logSheet.getDataRange().getValues();
    const alreadyLogged = new Set();
    for (let i = 1; i < existingLogs.length; i++) {
        const dateKey = existingLogs[i][0] instanceof Date
            ? Utilities.formatDate(existingLogs[i][0], Session.getScriptTimeZone() || "Africa/Accra", "yyyy-MM-dd")
            : String(existingLogs[i][0] || "").trim();
        if (dateKey === todayKey) {
            alreadyLogged.add(nssKey(existingLogs[i][1]) + "|" +
                String(existingLogs[i][2] || "").trim() + "|" +
                String(existingLogs[i][3] || "").trim().toUpperCase());
        }
    }

    const officeNumbers = [setting("OFFICE_PHONE_1"), setting("OFFICE_PHONE_2")]
        .filter(Boolean).join(" / ");
    const contactLine = officeNumbers
        ? " If you need help, contact the office: " + officeNumbers + "."
        : " If you encounter difficulties, contact the district office using its official contact numbers.";

    let eligible = 0, emailsSent = 0, smsSent = 0;
    const statuses = {
        "POSTED - REGIONAL ACCEPTANCE APPROVED": {
            subject: "Action Required: Complete Your District Registration",
            email: function(name) {
                return '<p>Dear ' + escapeHtmlForReminder_(name) + ',</p>' +
                    '<p>Our records indicate that your enrolment status is <strong>Posted - Regional Acceptance Approved</strong>, which means you have gone for Regional validation but your district registration has not yet been completed.</p>' +
                    '<p>Please report to the NSA Wassa Amenfi West Municipal Secretariat to complete your district registration. Completing this process will help ensure that your personnel record and subsequent service administration are properly maintained.</p>' +
                    '<p>If you have already registered, please contact the office so that your record can be checked and updated.</p>' +
                    '<p>Yours faithfully,<br><strong>NSA Wassa Amenfi West Municipal Secretariat</strong></p>';
            },
            sms: function(name) {
                return fitSms("Dear " + name + ", Please report to NSA WAWM Secretariat to complete your District registration.");
            }
        },
        "POSTED - AWAITING ACCEPTANCE": {
            subject: "Action Required: Regional Validation and District Registration",
            email: function(name) {
                return '<p>Dear ' + escapeHtmlForReminder_(name) + ',</p>' +
                    '<p>Your enrolment status is <strong>Posted - Awaiting Acceptance</strong>, which means you have not gone for Regional Validation yet. Please take steps to complete your regional validation.</p>' +
                    '<p>After regional validation is completed, report to the NSA Wassa Amenfi West Municipal Secretariat to complete your district registration. Both steps are important for the completion of your personnel record.</p>' +
                    '<p>If you encounter any difficulties, please contact the office using its official contact numbers for assistance.</p>' +
                    '<p>Yours faithfully,<br><strong>NSA Wassa Amenfi West Municipal Secretariat</strong></p>';
            },
            sms: function(name) {
                const contact = officeNumbers ? " Help: " + officeNumbers + "." : " Contact district office if there are issues.";
                return fitSms("Dear " + name + ", complete regional validation, then district registration at NSA WAWM." + contact);
            }
        }
    };

    for (let i = 1; i < masterData.length; i++) {
        const row = masterData[i];
        const key = nssKey(row[mNss]);
        if (!key || registered.has(key)) continue;

        const status = String(row[mStatus] || "").trim().toUpperCase();
        const template = statuses[status];
        if (!template) continue;

        const name = (mName >= 0 && String(row[mName] || "").trim()) ||
            [mOtherNames >= 0 ? row[mOtherNames] : "", mLastName >= 0 ? row[mLastName] : ""]
                .map(function(v) { return String(v || "").trim(); }).filter(Boolean).join(" ") ||
            "NSS Personnel";
        const email = mEmail >= 0 ? String(row[mEmail] || "").trim() : "";
        const phone = mPhone >= 0 ? String(row[mPhone] || "").trim() : "";
        eligible++;

        if (email && !alreadyLogged.has(key + "|" + status + "|EMAIL")) {
            let sent = false, details = "";
            try {
                sent = sendEmail_(email, template.subject, template.email(name));
                details = sent ? "Email send accepted by configured mail service." : "Email function returned false.";
            } catch (e) { details = String(e.message || e); }
            logSheet.appendRow([new Date(), row[mNss], status, "EMAIL", email, sent ? "SENT" : "FAILED", details]);
            if (sent) emailsSent++;
        }

        if (phone && !alreadyLogged.has(key + "|" + status + "|SMS")) {
            const sms = template.sms(name);
            let sent = false, details = "";
            try {
                sent = sendSMSOnline_(phone, sms);
                details = "Characters: " + sms.length + ". " +
                    (sent ? "SMS send accepted by configured SMS service." : "SMS function returned false.");
            } catch (e) { details = String(e.message || e); }
            logSheet.appendRow([new Date(), row[mNss], status, "SMS", phone, sent ? "SENT" : "FAILED", details]);
            if (sent) smsSent++;
        }
    }

    return {
        status: "SUCCESS",
        eligible: eligible,
        emailsSent: emailsSent,
        smsSent: smsSent,
        logSheet: "ENROLLMENT_REMINDER_LOG"
    };
}

function escapeHtmlForReminder_(value) {
    return String(value == null ? "" : value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

/* =========================================================
   LEGACY / ALREADY-SERVING PERSONNEL IMPORT
   Cut-off: the batch Start Date must be earlier than
   5 October 2026. BATCH_SETTINGS is the authoritative
   source for batch start/end dates.

   Use previewExistingServingPersonnelBeforeCutoff() first.
   Only run importExistingServingPersonnelBeforeCutoff() after
   reviewing the preview and confirming the eligible list.

   addExistingServingPersonnel(payload) remains available for
   a single manually supplied record from an eligible batch.
   ========================================================= */

function parseLegacyPersonnelDate_(value) {
    if (value === null || value === undefined || value === "") return null;

    if (Object.prototype.toString.call(value) === "[object Date]") {
        return isNaN(value.getTime())
            ? null
            : new Date(value.getFullYear(), value.getMonth(), value.getDate());
    }

    const text = String(value).trim();
    if (!text) return null;

    let match = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (match) {
        const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
        return date.getFullYear() === Number(match[1]) &&
            date.getMonth() === Number(match[2]) - 1 &&
            date.getDate() === Number(match[3]) ? date : null;
    }

    // Ghana-style dates are interpreted as DD/MM/YYYY or DD-MM-YYYY.
    match = text.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})$/);
    if (match) {
        const day = Number(match[1]);
        const month = Number(match[2]);
        const year = Number(match[3]);
        const date = new Date(year, month - 1, day);
        return date.getFullYear() === year &&
            date.getMonth() === month - 1 &&
            date.getDate() === day ? date : null;
    }

    const parsed = new Date(value);
    if (isNaN(parsed.getTime())) return null;
    return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

function getLegacyBatchSettingsMap_() {
    const sheet = getDatabase().getSheetByName("BATCH_SETTINGS");
    if (!sheet) throw new Error('BATCH_SETTINGS sheet was not found.');

    const values = sheet.getDataRange().getValues();
    if (!values.length) throw new Error("BATCH_SETTINGS has no header row.");

    const headers = values[0].map(function(h) { return String(h || "").trim(); });
    function column(names) {
        const wanted = names.map(function(n) {
            return String(n).toLowerCase().replace(/[^a-z0-9]/g, "");
        });
        return headers.findIndex(function(h) {
            return wanted.indexOf(String(h).toLowerCase().replace(/[^a-z0-9]/g, "")) !== -1;
        });
    }

    const nameCol = column(["Batch Name", "Batch"]);
    const startCol = column(["Start Date", "Service Start Date"]);
    const endCol = column(["End Date", "Service End Date"]);
    if (nameCol < 0 || startCol < 0) {
        throw new Error("BATCH_SETTINGS must contain Batch Name and Start Date columns.");
    }

    const map = {};
    for (let i = 1; i < values.length; i++) {
        const name = String(values[i][nameCol] || "").trim();
        if (!name) continue;
        const key = name.toUpperCase();
        if (map[key]) {
            map[key].duplicate = true;
            continue;
        }
        map[key] = {
            name: name,
            startDate: parseLegacyPersonnelDate_(values[i][startCol]),
            endDate: endCol >= 0 ? parseLegacyPersonnelDate_(values[i][endCol]) : null,
            duplicate: false
        };
    }
    return map;
}

function getLegacyPersonnelNssKey_(value) {
    return String(value || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function getLegacyPersonnelColumn_(headers, aliases) {
    const wanted = aliases.map(function(n) {
        return String(n).toLowerCase().replace(/[^a-z0-9]/g, "");
    });
    return headers.findIndex(function(h) {
        return wanted.indexOf(String(h || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "")) !== -1;
    });
}

function buildRegisteredLegacyRecord_(masterRecord, suppliedRegisteredRecord, batchInfo) {
    const m = Object.assign({}, masterRecord || {});
    const supplied = Object.assign({}, suppliedRegisteredRecord || {});
    const batch = String(m["Batch"] || supplied["Batch"] || "").trim();
    const allowance = String(m["Allowance Type"] || supplied["Allowance Type"] || "").trim();
    const startDate = batchInfo.startDate;
    const endDate = batchInfo.endDate;

    const fullName = String(
        m["Full Name"] ||
        [m["Other Names"], m["Last Name"]].map(function(v) {
            return String(v || "").trim();
        }).filter(Boolean).join(" ")
    ).trim();

    const record = {
        "Registration Number": supplied["Registration Number"] ||
            generateRegistrationNumber_(allowance, batch),
        "NSS Number": String(m["NSS Number"] || supplied["NSS Number"] || "").trim().toUpperCase(),
        "Full Name": fullName,
        "Institution": m["Institution"] || supplied["Institution"] || "",
        "Course": m["Course"] || supplied["Course"] || "",
        "Batch": batch,
        "Allowance Type": allowance,
        "Phone Number": supplied["Phone Number"] || m["Phone Number"] || "",
        "Email": supplied["Email"] || m["Email"] || "",
        "GhanaPay Number": supplied["GhanaPay Number"] || m["GhanaPay Number"] || "",
        "Residential Address": supplied["Residential Address"] || m["Residential Address"] || "",
        "Residential Region": supplied["Residential Region"] || m["Residential Region"] || "",
        "Residential District": supplied["Residential District"] || m["Residential District"] || "",
        "Currently Employed": supplied["Currently Employed"] || m["Currently Employed"] || "",
        "Employer Company": supplied["Employer Company"] || m["Employer Company"] || "",
        "Employer Name": supplied["Employer Name"] || m["Employer Name"] || m["Employer Name Other"] || "",
        "Photo URL": supplied["Photo URL"] || "",
        "Photo File ID": supplied["Photo File ID"] || "",
        "Date Registered": supplied["Date Registered"] || new Date(),
        "Status": supplied["Status"] || "ACTIVE",
        "Service Start Date": startDate,
        "Service End Date": endDate || "",
        "Service Year": supplied["Service Year"] || m["Service Year"] ||
            (startDate && typeof getServiceYear_ === "function" ? getServiceYear_(startDate) : ""),
        "Service Status": "ACTIVE",
        "Last Evaluation Status": "NOT SUBMITTED",
        "WhatsApp Number": supplied["WhatsApp Number"] || supplied["WhatsApp"] || "",
        "Next of Kin Name": supplied["Next of Kin Name"] || "",
        "Next of Kin Relationship": supplied["Next of Kin Relationship"] || supplied["Next of Kin Relation"] || "",
        "Next of Kin Phone": supplied["Next of Kin Phone"] || "",
        "Gender": m["Gender"] || supplied["Gender"] || "",
        "Age": m["Age"] || supplied["Age"] || "",
        "Company Posted To": m["Company Posted To"] || supplied["Company Posted To"] || "",
        "District": m["District Posted To"] || supplied["District"] || supplied["District Posted To"] || "",
        "District Posted To": m["District Posted To"] || supplied["District Posted To"] || "",
        "Last Monthly Evaluation": "NOT SUBMITTED",
        "Last Annual Evaluation": "NOT SUBMITTED",
        "Evaluation Compliance Status": "PENDING"
    };

    // Respect additional supplied fields that exist in the actual destination schema.
    Object.keys(supplied).forEach(function(key) {
        if (supplied[key] !== undefined && supplied[key] !== null && supplied[key] !== "") {
            record[key] = supplied[key];
        }
    });
    // Keep dates and active service status anchored to the authoritative batch record.
    record["Batch"] = batch;
    record["Service Start Date"] = startDate;
    record["Service End Date"] = endDate || "";
    record["Service Status"] = "ACTIVE";
    return record;
}

function addExistingServingPersonnel(payload) {
    if (!payload || !payload.masterRecord || !payload.registeredRecord) {
        throw new Error("Provide masterRecord and registeredRecord objects.");
    }

    const db = getDatabase();
    const masterSheet = db.getSheetByName("MASTER_PERSONNEL");
    const registeredSheet = db.getSheetByName("REGISTERED_PERSONNEL");
    if (!masterSheet || !registeredSheet) {
        throw new Error("MASTER_PERSONNEL or REGISTERED_PERSONNEL sheet was not found.");
    }

    const masterRecord = Object.assign({}, payload.masterRecord);
    const suppliedRegisteredRecord = Object.assign({}, payload.registeredRecord);
    const nss = String(masterRecord["NSS Number"] || suppliedRegisteredRecord["NSS Number"] || "")
        .trim().toUpperCase();
    const batch = String(masterRecord["Batch"] || suppliedRegisteredRecord["Batch"] || "").trim();
    if (!nss) throw new Error("NSS Number is required.");
    if (!batch) throw new Error("Batch is required.");

    const batchMap = getLegacyBatchSettingsMap_();
    const batchInfo = batchMap[batch.toUpperCase()];
    if (!batchInfo || batchInfo.duplicate || !batchInfo.startDate) {
        throw new Error("The batch must exist exactly once in BATCH_SETTINGS and have a valid Start Date.");
    }
    const cutoff = new Date(2026, 9, 5);
    if (batchInfo.startDate.getTime() >= cutoff.getTime()) {
        throw new Error("This helper is restricted to batches that started before 5 October 2026.");
    }
    if (batchInfo.endDate && batchInfo.endDate.getTime() < new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()).getTime()) {
        throw new Error("This batch's service end date has passed; it should not be imported as currently serving.");
    }

    function loadSheet(sheet) {
        const values = sheet.getDataRange().getValues();
        if (!values.length) throw new Error(sheet.getName() + " has no header row.");
        const headers = values[0].map(function(h) { return String(h || "").trim(); });
        const nssCol = getLegacyPersonnelColumn_(headers, ["NSS Number", "NSS"]);
        if (nssCol < 0) throw new Error("NSS Number column is missing in " + sheet.getName());
        const rows = [];
        for (let i = 1; i < values.length; i++) {
            if (getLegacyPersonnelNssKey_(values[i][nssCol]) === getLegacyPersonnelNssKey_(nss)) {
                rows.push({ rowNumber: i + 1, values: values[i], headers: headers });
            }
        }
        return { headers: headers, values: values, matches: rows };
    }

    const masterLoaded = loadSheet(masterSheet);
    const registeredLoaded = loadSheet(registeredSheet);
    if (registeredLoaded.matches.length) {
        throw new Error("This NSS number is already in REGISTERED_PERSONNEL. No records were changed.");
    }
    if (masterLoaded.matches.length > 1) {
        throw new Error("Multiple MASTER_PERSONNEL rows have this NSS number. Resolve the duplicate before importing.");
    }

    let mergedMaster = {};
    if (masterLoaded.matches.length === 1) {
        const existing = masterLoaded.matches[0];
        existing.headers.forEach(function(h, i) { mergedMaster[h] = existing.values[i]; });
    }
    Object.keys(masterRecord).forEach(function(key) {
        if (masterRecord[key] !== undefined && masterRecord[key] !== null && masterRecord[key] !== "") {
            mergedMaster[key] = masterRecord[key];
        }
    });
    mergedMaster["NSS Number"] = nss;
    mergedMaster["Batch"] = batch;
    mergedMaster["Service Start Date"] = batchInfo.startDate;
    mergedMaster["Service End Date"] = batchInfo.endDate || "";
    if (!mergedMaster["Service Status"]) mergedMaster["Service Status"] = "ACTIVE";

    if (masterLoaded.matches.length === 1) {
        const rowInfo = masterLoaded.matches[0];
        const row = rowInfo.values.slice();
        rowInfo.headers.forEach(function(h, i) {
            if (Object.prototype.hasOwnProperty.call(mergedMaster, h)) row[i] = mergedMaster[h];
        });
        masterSheet.getRange(rowInfo.rowNumber, 1, 1, row.length).setValues([row]);
    } else {
        const newMasterRow = masterLoaded.headers.map(function(h) {
            return Object.prototype.hasOwnProperty.call(mergedMaster, h) ? mergedMaster[h] : "";
        });
        masterSheet.appendRow(newMasterRow);
    }

    const registeredRecord = buildRegisteredLegacyRecord_(mergedMaster, suppliedRegisteredRecord, batchInfo);
    const registeredRow = registeredLoaded.headers.map(function(h) {
        return Object.prototype.hasOwnProperty.call(registeredRecord, h) ? registeredRecord[h] : "";
    });
    registeredSheet.appendRow(registeredRow);

    return {
        status: "SUCCESS",
        nssNumber: nss,
        registrationNumber: registeredRecord["Registration Number"],
        batch: batch,
        batchStartDate: batchInfo.startDate,
        masterAction: masterLoaded.matches.length ? "UPDATED_EXISTING_MASTER_RECORD" : "ADDED_MASTER_RECORD",
        registeredAction: "ADDED_REGISTERED_RECORD"
    };
}

function previewExistingServingPersonnelBeforeCutoff() {
    return getExistingServingPersonnelBeforeCutoffPreview_();
}

function getExistingServingPersonnelBeforeCutoffPreview_() {
    const db = getDatabase();
    const masterSheet = db.getSheetByName("MASTER_PERSONNEL");
    const registeredSheet = db.getSheetByName("REGISTERED_PERSONNEL");
    if (!masterSheet || !registeredSheet) {
        throw new Error("MASTER_PERSONNEL or REGISTERED_PERSONNEL sheet was not found.");
    }

    const masterData = masterSheet.getDataRange().getValues();
    const registeredData = registeredSheet.getDataRange().getValues();
    const masterHeaders = (masterData[0] || []).map(function(h) { return String(h || "").trim(); });
    const registeredHeaders = (registeredData[0] || []).map(function(h) { return String(h || "").trim(); });
    const masterNssCol = getLegacyPersonnelColumn_(masterHeaders, ["NSS Number", "NSS"]);
    const masterBatchCol = getLegacyPersonnelColumn_(masterHeaders, ["Batch"]);
    if (masterNssCol < 0 || masterBatchCol < 0) {
        throw new Error("MASTER_PERSONNEL must contain NSS Number and Batch.");
    }
    const registeredNssCol = getLegacyPersonnelColumn_(registeredHeaders, ["NSS Number", "NSS"]);
    if (registeredNssCol < 0) throw new Error("REGISTERED_PERSONNEL must contain NSS Number.");

    const registeredSet = new Set();
    for (let i = 1; i < registeredData.length; i++) {
        const key = getLegacyPersonnelNssKey_(registeredData[i][registeredNssCol]);
        if (key) registeredSet.add(key);
    }

    const batchMap = getLegacyBatchSettingsMap_();
    const cutoff = new Date(2026, 9, 5);
    const today = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
    const seenMaster = {};
    const eligible = [];
    const skipped = {
        alreadyRegistered: 0,
        missingNss: 0,
        duplicateMasterNss: 0,
        missingBatchOrStartDate: 0,
        batchStartedOnOrAfterCutoff: 0,
        serviceEnded: 0,
        inactiveStatus: 0
    };

    const masterRecords = [];
    for (let i = 1; i < masterData.length; i++) {
        const row = masterData[i];
        const obj = {};
        masterHeaders.forEach(function(h, j) { obj[h] = row[j]; });
        masterRecords.push({ rowNumber: i + 1, record: obj, nssKey: getLegacyPersonnelNssKey_(row[masterNssCol]) });
    }
    masterRecords.forEach(function(item) {
        if (!item.nssKey) { skipped.missingNss++; return; }
        seenMaster[item.nssKey] = (seenMaster[item.nssKey] || 0) + 1;
    });

    masterRecords.forEach(function(item) {
        const m = item.record;
        const nssKey = item.nssKey;
        if (!nssKey) return;
        if (seenMaster[nssKey] > 1) { skipped.duplicateMasterNss++; return; }
        if (registeredSet.has(nssKey)) { skipped.alreadyRegistered++; return; }

        const batch = String(m["Batch"] || "").trim();
        const batchInfo = batchMap[batch.toUpperCase()];
        if (!batchInfo || batchInfo.duplicate || !batchInfo.startDate) {
            skipped.missingBatchOrStartDate++;
            return;
        }
        if (batchInfo.startDate.getTime() >= cutoff.getTime()) {
            skipped.batchStartedOnOrAfterCutoff++;
            return;
        }
        if (batchInfo.endDate && batchInfo.endDate.getTime() < today.getTime()) {
            skipped.serviceEnded++;
            return;
        }

        const serviceStatus = String(m["Service Status"] || "").trim().toUpperCase();
        if (["INACTIVE", "ENDED", "COMPLETED", "TERMINATED", "WITHDRAWN", "EXPIRED"].indexOf(serviceStatus) !== -1) {
            skipped.inactiveStatus++;
            return;
        }

        eligible.push({
            masterRow: item.rowNumber,
            nssNumber: m["NSS Number"],
            name: [m["Other Names"], m["Last Name"]].map(function(v) {
                return String(v || "").trim();
            }).filter(Boolean).join(" "),
            batch: batch,
            allowanceType: m["Allowance Type"] || "",
            batchStartDate: batchInfo.startDate,
            batchEndDate: batchInfo.endDate || "",
            serviceStatus: serviceStatus || "UNSPECIFIED"
        });
    });

    return {
        status: "SUCCESS",
        cutoffExclusive: new Date(2026, 9, 5),
        eligibleCount: eligible.length,
        eligible: eligible,
        skipped: skipped,
        note: "Only missing REGISTERED_PERSONNEL records from batches whose BATCH_SETTINGS Start Date is earlier than 5 October 2026 are listed. Batches with past end dates and ambiguous duplicate NSS records are excluded."
    };
}

function importExistingServingPersonnelBeforeCutoff() {
    const preview = getExistingServingPersonnelBeforeCutoffPreview_();
    if (preview.status !== "SUCCESS") throw new Error("Unable to preview legacy personnel.");

    const db = getDatabase();
    const masterSheet = db.getSheetByName("MASTER_PERSONNEL");
    const registeredSheet = db.getSheetByName("REGISTERED_PERSONNEL");
    const masterData = masterSheet.getDataRange().getValues();
    const registeredData = registeredSheet.getDataRange().getValues();
    const masterHeaders = masterData[0].map(function(h) { return String(h || "").trim(); });
    const registeredHeaders = registeredData[0].map(function(h) { return String(h || "").trim(); });
    const masterNssCol = getLegacyPersonnelColumn_(masterHeaders, ["NSS Number", "NSS"]);
    const registeredNssCol = getLegacyPersonnelColumn_(registeredHeaders, ["NSS Number", "NSS"]);
    const batchMap = getLegacyBatchSettingsMap_();

    const registeredSet = new Set();
    for (let i = 1; i < registeredData.length; i++) {
        const key = getLegacyPersonnelNssKey_(registeredData[i][registeredNssCol]);
        if (key) registeredSet.add(key);
    }

    const eligibleKeys = new Set(preview.eligible.map(function(p) {
        return getLegacyPersonnelNssKey_(p.nssNumber);
    }));
    let imported = 0;
    const failures = [];

    for (let i = 1; i < masterData.length; i++) {
        const row = masterData[i];
        const nss = String(row[masterNssCol] || "").trim().toUpperCase();
        const key = getLegacyPersonnelNssKey_(nss);
        if (!key || !eligibleKeys.has(key) || registeredSet.has(key)) continue;

        const masterRecord = {};
        masterHeaders.forEach(function(h, j) { masterRecord[h] = row[j]; });
        const batch = String(masterRecord["Batch"] || "").trim();
        const batchInfo = batchMap[batch.toUpperCase()];
        try {
            const regRecord = buildRegisteredLegacyRecord_(masterRecord, {}, batchInfo);
            const outputRow = registeredHeaders.map(function(h) {
                return Object.prototype.hasOwnProperty.call(regRecord, h) ? regRecord[h] : "";
            });
            registeredSheet.appendRow(outputRow);
            registeredSet.add(key);
            imported++;
        } catch (error) {
            failures.push({ nssNumber: nss, error: String(error.message || error) });
        }
    }

    return {
        status: "SUCCESS",
        eligibleBeforeImport: preview.eligibleCount,
        imported: imported,
        skippedOrFailed: preview.eligibleCount - imported,
        failures: failures,
        message: "Eligible personnel already present in MASTER_PERSONNEL have been added to REGISTERED_PERSONNEL. Master records were not duplicated."
    };
}

/* =========================================================
   DAILY POSTING-DETAIL SYNCHRONISATION
   MASTER_PERSONNEL is the source of truth for:
   - Company Posted To / Place of Posting
   - District Posted To / District
   - Allowance Type

   Matching key: NSS Number.
   Only these three master-controlled fields are changed.
   Blank master values never erase registered values.
   ========================================================= */

function syncRegisteredPostingFromMaster() {
  const db = getDatabase();
  const masterSheet = db.getSheetByName("MASTER_PERSONNEL");
  const registeredSheet = db.getSheetByName("REGISTERED_PERSONNEL");

  if (!masterSheet) {
    throw new Error('Required sheet "MASTER_PERSONNEL" was not found.');
  }
  if (!registeredSheet) {
    throw new Error('Required sheet "REGISTERED_PERSONNEL" was not found.');
  }

  const masterLastRow = masterSheet.getLastRow();
  const registeredLastRow = registeredSheet.getLastRow();

  if (masterLastRow < 2 || registeredLastRow < 2) {
    const emptyResult = {
      status: "SUCCESS",
      message: "No personnel records were available to synchronise.",
      matchedPersonnel: 0,
      updatedRecords: 0,
      updatedPostingFields: 0,
      updatedDistrictFields: 0,
      updatedAllowanceFields: 0,
      skippedDuplicateMasterNss: 0,
      skippedBlankMasterFields: 0,
      unmatchedRegisteredRecords: 0
    };
    Logger.log(JSON.stringify(emptyResult));
    return emptyResult;
  }

  const masterLastColumn = masterSheet.getLastColumn();
  const registeredLastColumn = registeredSheet.getLastColumn();

  const masterHeaders = masterSheet
    .getRange(1, 1, 1, masterLastColumn)
    .getDisplayValues()[0];

  const registeredHeaders = registeredSheet
    .getRange(1, 1, 1, registeredLastColumn)
    .getDisplayValues()[0];

  function normaliseHeader_(value) {
    return String(value == null ? "" : value)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
  }

  function findHeader_(headers, aliases, sheetName) {
    const accepted = aliases.map(normaliseHeader_);
    const index = headers.findIndex(function(header) {
      return accepted.indexOf(normaliseHeader_(header)) !== -1;
    });
    if (index < 0) {
      throw new Error(
        'Could not find a required column in "' + sheetName +
        '". Accepted header names: ' + aliases.join(", ")
      );
    }
    return index;
  }

  function normaliseNss_(value) {
    return String(value == null ? "" : value)
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");
  }

  function cellText_(value) {
    return String(value == null ? "" : value).trim();
  }

  const masterNssCol = findHeader_(
    masterHeaders, ["NSS Number", "NSS"], "MASTER_PERSONNEL"
  );
  const masterPostingCol = findHeader_(
    masterHeaders,
    ["Company Posted To", "Place of Posting"],
    "MASTER_PERSONNEL"
  );
  const masterDistrictCol = findHeader_(
    masterHeaders,
    ["District Posted To", "Posting District", "District"],
    "MASTER_PERSONNEL"
  );

  const registeredNssCol = findHeader_(
    registeredHeaders, ["NSS Number", "NSS"], "REGISTERED_PERSONNEL"
  );
  const registeredPostingCol = findHeader_(
    registeredHeaders,
    ["Company Posted To", "Place of Posting"],
    "REGISTERED_PERSONNEL"
  );
  const registeredDistrictCol = findHeader_(
    registeredHeaders,
    ["District Posted To", "District", "Posting District"],
    "REGISTERED_PERSONNEL"
  );

  const masterAllowanceCol = findHeader_(
    masterHeaders, ["Allowance Type", "Allowance"], "MASTER_PERSONNEL"
  );
  const registeredAllowanceCol = findHeader_(
    registeredHeaders, ["Allowance Type", "Allowance"], "REGISTERED_PERSONNEL"
  );

  const masterRows = masterSheet
    .getRange(2, 1, masterLastRow - 1, masterLastColumn)
    .getValues();

  const registeredRows = registeredSheet
    .getRange(2, 1, registeredLastRow - 1, registeredLastColumn)
    .getValues();

  // Exclude ambiguous NSS numbers if the master sheet contains duplicates.
  const masterByNss = Object.create(null);
  const duplicateMasterNss = Object.create(null);

  masterRows.forEach(function(row) {
    const key = normaliseNss_(row[masterNssCol]);
    if (!key) return;

    if (Object.prototype.hasOwnProperty.call(masterByNss, key)) {
      duplicateMasterNss[key] = true;
    } else {
      masterByNss[key] = row;
    }
  });

  Object.keys(duplicateMasterNss).forEach(function(key) {
    delete masterByNss[key];
  });

  let matchedPersonnel = 0;
  let updatedRecords = 0;
  let updatedPostingFields = 0;
  let updatedDistrictFields = 0;
  let updatedAllowanceFields = 0;
  let skippedBlankMasterFields = 0;
  let unmatchedRegisteredRecords = 0;

  registeredRows.forEach(function(row) {
    const key = normaliseNss_(row[registeredNssCol]);
    if (!key) return;

    if (duplicateMasterNss[key]) {
      // Do not guess which master record is correct.
      return;
    }

    const masterRow = masterByNss[key];
    if (!masterRow) {
      unmatchedRegisteredRecords++;
      return;
    }

    matchedPersonnel++;
    let changedThisRecord = false;

    const masterPosting = cellText_(masterRow[masterPostingCol]);
    const currentPosting = cellText_(row[registeredPostingCol]);

    if (!masterPosting) {
      skippedBlankMasterFields++;
    } else if (currentPosting !== masterPosting) {
      row[registeredPostingCol] = masterPosting;
      updatedPostingFields++;
      changedThisRecord = true;
    }

    const masterDistrict = cellText_(masterRow[masterDistrictCol]);
    const currentDistrict = cellText_(row[registeredDistrictCol]);

    if (!masterDistrict) {
      skippedBlankMasterFields++;
    } else if (currentDistrict !== masterDistrict) {
      row[registeredDistrictCol] = masterDistrict;
      updatedDistrictFields++;
      changedThisRecord = true;
    }

    const masterAllowance = cellText_(masterRow[masterAllowanceCol]);
    const currentAllowance = cellText_(row[registeredAllowanceCol]);
    if (!masterAllowance) {
      skippedBlankMasterFields++;
    } else if (currentAllowance !== masterAllowance) {
      row[registeredAllowanceCol] = masterAllowance;
      updatedAllowanceFields++;
      changedThisRecord = true;
    }

    if (changedThisRecord) {
      updatedRecords++;
    }
  });

  // Write only the three master-controlled columns; all other registered data is untouched.
  if (updatedPostingFields > 0) {
    registeredSheet
      .getRange(2, registeredPostingCol + 1, registeredRows.length, 1)
      .setValues(registeredRows.map(function(row) {
        return [row[registeredPostingCol]];
      }));
  }

  if (updatedDistrictFields > 0) {
    registeredSheet
      .getRange(2, registeredDistrictCol + 1, registeredRows.length, 1)
      .setValues(registeredRows.map(function(row) {
        return [row[registeredDistrictCol]];
      }));
  }
  if (updatedAllowanceFields > 0) {
    registeredSheet
      .getRange(2, registeredAllowanceCol + 1, registeredRows.length, 1)
      .setValues(registeredRows.map(function(row) {
        return [row[registeredAllowanceCol]];
      }));
  }

  const result = {
    status: "SUCCESS",
    message: "Posting-detail synchronisation completed.",
    matchedPersonnel: matchedPersonnel,
    updatedRecords: updatedRecords,
    updatedPostingFields: updatedPostingFields,
    updatedDistrictFields: updatedDistrictFields,
    updatedAllowanceFields: updatedAllowanceFields,
    skippedDuplicateMasterNss: Object.keys(duplicateMasterNss).length,
    skippedBlankMasterFields: skippedBlankMasterFields,
    unmatchedRegisteredRecords: unmatchedRegisteredRecords
  };

  Logger.log(JSON.stringify(result));
  return result;
}

/* ===== installReminderTriggers ===== */
function installReminderTriggers() {
    const handlersToReplace = new Set([
        "runEvaluationReminders",
        "sendEvaluationReminders",
        "sendMonthlyEvaluationReminders_",
        "sendAnnualEvaluationReminders_",
        "sendBirthdayGreetings_",
        "sendBirthdayGreetings",
        "syncRegisteredPostingFromMaster",
        "runEnrollmentStatusReminders"
    ]);

    ScriptApp.getProjectTriggers().forEach(function(trigger) {
        if (handlersToReplace.has(trigger.getHandlerFunction())) {
            ScriptApp.deleteTrigger(trigger);
        }
    });

    const timezone = "Africa/Accra";

    [4, 12, 17].forEach(function(hour) {
        ScriptApp.newTrigger("runEvaluationReminders")
            .timeBased().atHour(hour).everyDays(1).inTimezone(timezone).create();

        ScriptApp.newTrigger("sendBirthdayGreetings")
            .timeBased().atHour(hour).everyDays(1).inTimezone(timezone).create();
    });

    ScriptApp.newTrigger("syncRegisteredPostingFromMaster")
        .timeBased().atHour(8).everyDays(1).inTimezone(timezone).create();

    // Runs Monday-Friday; the handler itself alternates working days and
    // protects against duplicate executions on the same date.
    ScriptApp.newTrigger("runEnrollmentStatusReminders")
        .timeBased().everyDays(1).atHour(9).inTimezone(timezone).create();

    Logger.log(
        "Installed evaluation/birthday triggers at approximately 4 a.m., noon and 5 p.m.; " +
        "posting sync at approximately 8 a.m.; enrolment reminders at approximately 9 a.m. " +
        "using " + timezone + "."
    );
}
/* ===== isAfterCalendarDateForEvaluationFix_ ===== */
function isAfterCalendarDateForEvaluationFix_(candidate, boundary) {
    const candidateDate = candidate instanceof Date ? candidate : new Date(candidate);
    const boundaryDate = boundary instanceof Date ? boundary : new Date(boundary);
    if (isNaN(candidateDate.getTime())) {
        throw new Error("The date being checked is invalid.");
    }
    if (isNaN(boundaryDate.getTime())) {
        throw new Error("The evaluation deadline date is invalid.");
    }
    const timeZone = Session.getScriptTimeZone() || "Africa/Accra";
    const candidateKey = Utilities.formatDate(candidateDate, timeZone, "yyyyMMdd");
    const boundaryKey = Utilities.formatDate(boundaryDate, timeZone, "yyyyMMdd");
    // Equal calendar dates are on time. A submission is late only on a later date.
    return candidateKey > boundaryKey;
}
/* ===== normalizeEvaluationApprovalPeriodForFix_ ===== */
function normalizeEvaluationApprovalPeriodForFix_(type, period) {
    const value = String(period == null ? "" : period).trim();
    const evaluationType = String(type || "").trim().toUpperCase();
    if (!value)
        return "";
    if (evaluationType === "MONTHLY") {
        if (period instanceof Date && !isNaN(period.getTime()))
            return (period.getMonth() + 1) + "/" + period.getFullYear();
        let match = value.match(/^(\d{1,2})\s*[\/.-]\s*(\d{4})$/);
        if (match && Number(match[1]) >= 1 && Number(match[1]) <= 12)
            return Number(match[1]) + "/" + match[2];
        match = value.match(/^(\d{4})\s*[\/.-]\s*(\d{1,2})$/);
        if (match && Number(match[2]) >= 1 && Number(match[2]) <= 12)
            return Number(match[2]) + "/" + match[1];
        match = value.match(/^([A-Za-z]+)[\s/-]+(\d{4})$/);
        if (match) {
            const monthNumber = normalizeEvaluationMonthNumber_(match[1]);
            if (monthNumber >= 1 && monthNumber <= 12)
                return monthNumber + "/" + match[2];
        }
        const parsed = new Date(value);
        if (!isNaN(parsed.getTime()))
            return (parsed.getMonth() + 1) + "/" + parsed.getFullYear();
        return "";
    }
    return value.replace(/[‐‑‒–—]/g, "-").replace(/\s+/g, "").toUpperCase();
}
/* ===== evaluationApprovalHeaderMapForFix_ ===== */
function evaluationApprovalHeaderMapForFix_(headers) {
    return {
        id: findEvaluationHeaderIndex_(headers, ["Approval ID", "ID"]),
        nss: findEvaluationHeaderIndex_(headers, ["NSS Number", "NSS"]),
        type: findEvaluationHeaderIndex_(headers, ["Evaluation Type", "Type"]),
        period: findEvaluationHeaderIndex_(headers, ["Period", "Evaluation Period"]),
        reason: findEvaluationHeaderIndex_(headers, ["Reason", "Request Type"]),
        decision: findEvaluationHeaderIndex_(headers, ["Decision", "Approval Decision"]),
        by: findEvaluationHeaderIndex_(headers, ["Approved By", "Decided By", "Officer"]),
        date: findEvaluationHeaderIndex_(headers, ["Approval Date", "Decision Date", "Date Approved"])
    };
}
/* ===== Added compatibility and schema helpers ===== */
function normalizeEvaluationHeader_(value) {
    return String(value == null ? "" : value).trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}
function findEvaluationHeaderIndex_(headers, names) {
    const accepted = names.map(normalizeEvaluationHeader_);
    return headers.findIndex(function (header) {
        return accepted.indexOf(normalizeEvaluationHeader_(header)) !== -1;
    });
}
function normalizeEvaluationMonthNumber_(value) {
    if (value instanceof Date && !isNaN(value.getTime()))
        return value.getMonth() + 1;
    const text = String(value == null ? "" : value).trim();
    if (/^\d{1,2}$/.test(text)) {
        const n = Number(text);
        return n >= 1 && n <= 12 ? n : NaN;
    }
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const index = months.findIndex(function (name) { return name.toLowerCase() === text.toLowerCase(); });
    return index >= 0 ? index + 1 : NaN;
}
function getMonthlySubmissionPeriodFromRow_(row) {
    let month = normalizeEvaluationMonthNumber_(row["Month"]);
    let year = Number(row["Year"]);
    const legacySimpleRow = String(row["Submitted Date"] || "").trim().toUpperCase() === "SUBMITTED" &&
        row["Year"] instanceof Date &&
        Number(row["Batch"]) >= 1 && Number(row["Batch"]) <= 12 &&
        Number(row["Month"]) >= 2000 && Number(row["Month"]) <= 2100;
    if (legacySimpleRow) {
        month = Number(row["Batch"]);
        year = Number(row["Month"]);
    }
    return { month: month, year: year, legacySimpleRow: legacySimpleRow };
}
function getAnnualEvaluationPeriodFromSubmissionRow_(row) {
    const periodCell = row["Evaluation Period"] || row["Service Year"];
    const legacyAnnualRow = String(row["Submitted Date"] || "").trim().toUpperCase() === "SUBMITTED" &&
        periodCell instanceof Date &&
        String(row["Captured By"] || "").trim() !== "";
    return legacyAnnualRow
        ? String(row["Captured By"] || "").trim()
        : String(row["Evaluation Period"] || row["Service Year"] || "").trim();
}
function writeEvaluationRecordByHeaders_(sheet, record, rowNumber) {
    if (!sheet || !record || typeof record !== "object")
        throw new Error("A valid evaluation sheet and record are required.");
    if (sheet.getLastRow() < 1 || sheet.getLastColumn() < 1)
        throw new Error(sheet.getName() + " has no header row. Run system initialization first.");
    const aliases = {
        "ID": ["ID", "Evaluation ID"],
        "NSS Number": ["NSS Number", "NSS"],
        "Registration Number": ["Registration Number", "Registration"],
        "Batch": ["Batch", "Batch Name"],
        "Month": ["Month", "Evaluation Month"],
        "Year": ["Year", "Evaluation Year"],
        "Deadline Date": ["Deadline Date", "Submission Deadline"],
        "Submitted Date": ["Submitted Date", "Submission Date"],
        "Captured By": ["Captured By", "Submitted By", "Officer"],
        "Late Flag": ["Late Flag", "Late Status"],
        "Service Status": ["Service Status"],
        "Status": ["Status", "Submission Status"],
        "Capture Code": ["Capture Code", "Office Capture Code"],
        "Allowance Type": ["Allowance Type", "Allowance"],
        "Evaluation Period": ["Evaluation Period", "Service Year"]
    };
    function getIndex(headers, field) { return findEvaluationHeaderIndex_(headers, aliases[field] || [field]); }
    let lastColumn = sheet.getLastColumn();
    let headers = sheet.getRange(1, 1, 1, lastColumn).getDisplayValues()[0];
    Object.keys(record).forEach(function (field) {
        if (getIndex(headers, field) < 0) {
            lastColumn = sheet.getLastColumn() + 1;
            sheet.getRange(1, lastColumn).setValue(field);
            headers.push(field);
        }
    });
    lastColumn = sheet.getLastColumn();
    headers = sheet.getRange(1, 1, 1, lastColumn).getDisplayValues()[0];
    const row = rowNumber ? sheet.getRange(rowNumber, 1, 1, lastColumn).getValues()[0] : new Array(lastColumn).fill("");
    Object.keys(record).forEach(function (field) {
        const index = getIndex(headers, field);
        if (index < 0)
            throw new Error("Could not locate the " + field + " column in " + sheet.getName() + ".");
        row[index] = record[field];
    });
    if (rowNumber)
        sheet.getRange(rowNumber, 1, 1, lastColumn).setValues([row]);
    else
        sheet.appendRow(row);
    return row;
}
function normalizeEvaluationApprovalReason_(reason) {
    return String(reason || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}
function isLateEvaluationApprovalReason_(reason) {
    return normalizeEvaluationApprovalReason_(reason) === "LATEEVALUATIONSUBMISSION";
}
function isLateRegistrationApprovalReason_(reason) {
    const normalized = normalizeEvaluationApprovalReason_(reason);
    return normalized.indexOf("REGISTRATION") !== -1 || normalized.indexOf("REGISTEREDAFTEREVALUATIONDEADLINE") !== -1;
}
/* ===== Notification logging and legacy trigger compatibility ===== */
function logNotification_(data) {
    try {
        if (!data || typeof data !== "object")
            return false;
        const sheet = getDatabase().getSheetByName("NOTIFICATION_LOG");
        if (!sheet)
            return false;
        writeEvaluationRecordByHeaders_(sheet, {
            "ID": Utilities.getUuid(),
            "NSS Number": data.nss || "",
            "Notification Type": data.type || "",
            "Channel": data.channel || "",
            "Recipient": data.recipient || "",
            "Subject": data.subject || "",
            "Message": data.message || "",
            "Date Sent": new Date(),
            "Status": data.status || ""
        }, null);
        return true;
    }
    catch (error) {
        console.error("Notification log write failed:", error);
        return false;
    }
}
function sendBirthdayGreetings_() {
    // Compatibility alias for any legacy time-driven trigger.
    return sendBirthdayGreetings();
}


/* =========================================================
   ADMIN OVERHAUL — SHARED SECURITY AND ADMIN API HELPERS
   ========================================================= */
function requireAdminSession_(token, allowedRoles) {
    const session = validateSession(String(token || "").trim());
    if (!session || session.valid !== true) throw new Error("Your session is invalid or expired. Please sign in again.");
    const role = String(session.role || "").trim().toUpperCase();
    const allowed = (allowedRoles || []).map(function (r) { return String(r).trim().toUpperCase(); });
    const permitted = allowed.indexOf(role) >= 0 || (role === "SUPER ADMIN" && allowed.indexOf("ADMIN") >= 0) || (role === "SUPER ADMIN" && allowed.indexOf("DATA ENTRY") >= 0) || (role === "SUPER ADMIN" && allowed.indexOf("EVALUATION OFFICER") >= 0);
    if (!permitted) throw new Error("You do not have permission to perform this operation.");
    return session;
}
function hashUserPassword_(password) {
    const salt = Utilities.getUuid().replace(/-/g, "");
    const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, salt + ":" + String(password), Utilities.Charset.UTF_8);
    const hex = digest.map(function (b) { const v = (b < 0 ? b + 256 : b).toString(16); return v.length === 1 ? "0" + v : v; }).join("");
    return "sha256$" + salt + "$" + hex;
}
function verifyUserPassword_(password, stored) {
    const parts = String(stored || "").split("$");
    if (parts.length !== 3 || parts[0] !== "sha256") return false;
    const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, parts[1] + ":" + String(password), Utilities.Charset.UTF_8);
    const hex = digest.map(function (b) { const v = (b < 0 ? b + 256 : b).toString(16); return v.length === 1 ? "0" + v : v; }).join("");
    return hex === parts[2];
}
function upsertSystemSetting_(key, value) {
    const sheet = getDatabase().getSheetByName("SYSTEM_SETTINGS");
    if (!sheet) throw new Error("SYSTEM_SETTINGS sheet was not found.");
    const rows = sheet.getDataRange().getValues();
    const matches = [];
    for (let i = 1; i < rows.length; i++) if (String(rows[i][0] || "").trim() === key) matches.push(i + 1);
    if (!matches.length) { sheet.appendRow([key, value]); return; }
    sheet.getRange(matches[0], 2).setValue(value);
    for (let i = matches.length - 1; i >= 1; i--) sheet.deleteRow(matches[i]);
}
function getSystemSettingsMap_() {
    const sheet = getDatabase().getSheetByName("SYSTEM_SETTINGS");
    const out = {};
    if (!sheet || sheet.getLastRow() < 2) return out;
    sheet.getDataRange().getValues().slice(1).forEach(function (r) { const k = String(r[0] || "").trim(); if (k) out[k] = r[1]; });
    return out;
}
function getAdminSettings(token) {
    const session = requireAdminSession_(token, ["ADMIN"]);
    const s = getSystemSettingsMap_();
    return {
        general: { systemName: (!s.SYSTEM_NAME || String(s.SYSTEM_NAME) === "NSA Wassa Amenfi West Municipal Secretariat") ? SYSTEM_NAME : s.SYSTEM_NAME, institution: s.INSTITUTION_NAME || "Wassa Amenfi West Municipal Secretariat", supportEmail: s.SUPPORT_EMAIL || "", supportPhone: s.SUPPORT_PHONE || "", logoUrl: s.LOGO_URL || "https://lh3.googleusercontent.com/d/10gIO9KpoqufMr8xWVh6ZfOBgDRU-KUN3" },
        email: { name: s.EMAIL_SENDER_NAME || s.EMAIL_SENDER || "NSA WAWM", email: s.EMAIL_ADDRESS || "" },
        sms: { apiUrl: s.SMS_API_URL || "", username: s.SMS_USERNAME || "", sender: s.SMS_SENDER_ID || "NSA WAWM", configured: Boolean(getSmsApiKey_()) },
        systemInfo: { database: getDatabase().getName(), version: SYSTEM_VERSION, url: getApplicationURL(), user: session.email || "" }
    };
}
function getBrandingSettings(token) {
    requireAdminSession_(token, ["ADMIN", "EVALUATION OFFICER", "DATA ENTRY"]);
    const s = getSystemSettingsMap_();
    return { systemName: (!s.SYSTEM_NAME || String(s.SYSTEM_NAME) === "NSA Wassa Amenfi West Municipal Secretariat") ? SYSTEM_NAME : s.SYSTEM_NAME, institution: s.INSTITUTION_NAME || "Wassa Amenfi West Municipal Secretariat", logoUrl: s.LOGO_URL || "https://lh3.googleusercontent.com/d/10gIO9KpoqufMr8xWVh6ZfOBgDRU-KUN3" };
}
function getSheetHeaders_(sheetName) {
    const sheet = getDatabase().getSheetByName(sheetName);
    if (!sheet || sheet.getLastColumn() < 1) throw new Error("Sheet " + sheetName + " was not found or has no header row.");
    return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0].map(function (h) { return String(h || "").trim(); });
}
function getSheetObjects_(sheetName) {
    const sheet = getDatabase().getSheetByName(sheetName);
    if (!sheet || sheet.getLastRow() < 2 || sheet.getLastColumn() < 1) return [];
    const values = sheet.getDataRange().getValues();
    const headers = values[0].map(function (h) { return String(h || "").trim(); });
    return values.slice(1).filter(function (row) { return row.some(function (v) { return v !== "" && v !== null; }); }).map(function (row) { const obj = {}; headers.forEach(function (h, i) { obj[h] = row[i]; }); return obj; });
}
function parseAdminDate_(value) {
    if (value instanceof Date && !isNaN(value.getTime())) return new Date(value.getFullYear(), value.getMonth(), value.getDate());
    if (value === null || value === undefined || String(value).trim() === "") return null;
    const raw = String(value).trim();
    const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    const date = iso ? new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3])) : new Date(raw);
    return isNaN(date.getTime()) ? null : new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
function normalizeImportHeader_(value) { return String(value == null ? "" : value).trim().toLowerCase().replace(/[^a-z0-9]/g, ""); }
function sanitizeImportedCell_(value) {
    if (value === null || value === undefined) return "";
    if (typeof value === "number" || typeof value === "boolean" || value instanceof Date) return value;
    const text = String(value).trim();
    return /^[=+\-@]/.test(text) ? "'" + text : text;
}
function ensureAnnualEvaluationCalendarSheet_() {
    const db = getDatabase();
    let sheet = db.getSheetByName("ANNUAL_EVALUATION_CALENDAR");
    if (!sheet) sheet = db.insertSheet("ANNUAL_EVALUATION_CALENDAR");
    if (sheet.getLastRow() === 0) sheet.appendRow(["ID", "Batch", "Service Year", "Evaluation Year", "First Start Date", "First End Date", "Second Start Date", "Second End Date", "Third Start Date", "Third End Date", "Created By", "Status"]);
    // Migrate legacy settings rows once, if the new canonical calendar is empty.
    const legacy = db.getSheetByName("ANNUAL_EVALUATION_SETTINGS");
    if (sheet.getLastRow() === 1 && legacy && legacy.getLastRow() > 1) {
        const rows = legacy.getDataRange().getValues();
        rows.slice(1).forEach(function (r) {
            if (!r[1] || !r[2]) return;
            const firstStart = parseAdminDate_(r[4]);
            if (!firstStart) return;
            sheet.appendRow([r[0] || Utilities.getUuid(), r[1], r[2], firstStart.getFullYear(), firstStart, parseAdminDate_(r[5]) || r[5], parseAdminDate_(r[6]) || r[6], parseAdminDate_(r[7]) || r[7], parseAdminDate_(r[8]) || r[8], parseAdminDate_(r[9]) || r[9], r[10] || "", r[11] || "ACTIVE"]);
        });
    }
    return sheet;
}
function getPersonnelManagementData(filters, token) {
    requireAdminSession_(token, ["ADMIN"]);
    filters = filters || {};
    const query = String(filters.query || "").trim().toLowerCase();
    const allowance = String(filters.allowance || "").trim();
    const batch = String(filters.batch || "").trim();
    const page = Math.max(1, Number(filters.page) || 1);
    const pageSize = Math.min(100, Math.max(10, Number(filters.pageSize) || 25));
    const allPersonnel = getRegisteredPersonnel_();
    const all = allPersonnel.filter(function (p) {
        if (allowance && String(p["Allowance Type"] || "") !== allowance) return false;
        if (batch && String(p["Batch"] || "") !== batch) return false;
        if (!query) return true;
        return [p["Full Name"], p["NSS Number"], p["Registration Number"], p["Institution"], p["Batch"], p["Allowance Type"]].some(function (v) { return String(v || "").toLowerCase().indexOf(query) >= 0; });
    });
    const batches = Array.from(new Set(allPersonnel.map(function (p) { return String(p["Batch"] || "").trim(); }).filter(Boolean))).sort();
    const allowances = Array.from(new Set(allPersonnel.map(function (p) { return String(p["Allowance Type"] || "").trim(); }).filter(Boolean))).sort();
    const totalPages = Math.max(1, Math.ceil(all.length / pageSize));
    const safePage = Math.min(page, totalPages);
    return { records: serialiseAdminValue_(all.slice((safePage - 1) * pageSize, safePage * pageSize)), total: all.length, page: safePage, pageSize: pageSize, totalPages: totalPages, batches: batches, allowances: allowances };
}
function getBatchManagementData(token) {
    requireAdminSession_(token, ["ADMIN"]);
    const sheet = getDatabase().getSheetByName("BATCH_SETTINGS");
    const rows = sheet.getDataRange().getValues();
    const counts = {};
    getRegisteredPersonnel_().forEach(function (p) { const b = String(p["Batch"] || ""); counts[b] = (counts[b] || 0) + 1; });
    return rows.slice(1).filter(function (r) { return r[0] || r[1]; }).map(function (r) { return { id: String(r[0] || ""), name: String(r[1] || ""), startDate: formatDate_(r[2]), endDate: formatDate_(r[3]), status: String(r[4] || "ACTIVE").toUpperCase(), personnel: counts[String(r[1] || "")] || 0 }; });
}
function toggleBatchStatus(id, token) {
    const session = requireAdminSession_(token, ["ADMIN"]);
    const sheet = getDatabase().getSheetByName("BATCH_SETTINGS");
    const rows = sheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) if (String(rows[i][0]) === String(id)) {
        const current = String(rows[i][4] || "ACTIVE").toUpperCase();
        const next = current === "ACTIVE" ? "INACTIVE" : "ACTIVE";
        sheet.getRange(i + 1, 5).setValue(next);
        writeAuditLog_(session.email, "BATCH_STATUS_CHANGED", String(rows[i][1] || "") + " / " + next);
        return { status: "SUCCESS", statusValue: next, message: "Batch status changed to " + next + "." };
    }
    return { status: "ERROR", message: "Batch not found." };
}
function resetSystemUserPassword(id, password, token) {
    const session = requireAdminSession_(token, ["SUPER ADMIN"]);
    password = String(password || "");
    if (password.length < 12) return { status: "ERROR", message: "Password must contain at least 12 characters." };
    const sheet = getDatabase().getSheetByName("USERS");
    const rows = sheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) if (String(rows[i][0]) === String(id)) {
        sheet.getRange(i + 1, 4).setValue(hashUserPassword_(password));
        writeAuditLog_(session.email, "USER_PASSWORD_RESET", String(rows[i][2] || ""));
        return { status: "SUCCESS", message: "Password reset successfully." };
    }
    return { status: "ERROR", message: "User not found." };
}
function logReportExport_(email, type, url) {
    try {
        const sheet = getDatabase().getSheetByName("REPORT_EXPORT_LOG");
        if (sheet) sheet.appendRow([Utilities.getUuid(), type, email, "", new Date(), url]);
    } catch (e) { console.error("Report export logging failed:", e); }
}

/* Public admin APIs. Data-heavy internal functions end in underscore. */
function getRegisteredPersonnel(token) { requireAdminSession_(token, ["ADMIN"]); return serialiseAdminValue_(getRegisteredPersonnel_()); }
function searchPersonnelAdvanced(query, token) { requireAdminSession_(token, ["ADMIN"]); return serialiseAdminValue_(searchPersonnelAdvanced_(query)); }
function getAllowanceStatistics(token) { requireAdminSession_(token, ["ADMIN"]); return getAllowanceStatistics_(); }
function getPendingMonthlyEvaluations(filters, token) { requireAdminSession_(token, ["ADMIN", "EVALUATION OFFICER"]); return serialiseAdminValue_(getPendingMonthlyEvaluations_(filters || {})); }
function getPendingAnnualEvaluations(filters, token) { requireAdminSession_(token, ["ADMIN", "EVALUATION OFFICER"]); return serialiseAdminValue_(getPendingAnnualEvaluations_(filters || {})); }

function getSmsApiKey_() {
    const props = PropertiesService.getScriptProperties();
    let key = props.getProperty("NSA_SMS_API_KEY");
    if (key) return key;
    key = String(getSystemSetting_("SMS_API_KEY") || getSystemSetting_("SMS_PASSWORD") || "");
    if (key) {
        props.setProperty("NSA_SMS_API_KEY", key);
        upsertSystemSetting_("SMS_API_KEY", "");
        upsertSystemSetting_("SMS_PASSWORD", "");
    }
    return key;
}

function serialiseAdminValue_(value) {
    if (value instanceof Date) return isNaN(value.getTime()) ? "" : Utilities.formatDate(value, Session.getScriptTimeZone(), "yyyy-MM-dd'T'HH:mm:ss");
    if (Array.isArray(value)) return value.map(serialiseAdminValue_);
    if (value && typeof value === "object") { const out = {}; Object.keys(value).forEach(function (key) { out[key] = serialiseAdminValue_(value[key]); }); return out; }
    return value;
}


/* =========================================================
   PERSONNEL COMMUNICATIONS MODULE
   Recipient source: REGISTERED_PERSONNEL.
   MASTER_PERSONNEL is used only as a cross-reference for
   enrolment status when that filter is selected.
   ========================================================= */
function ensureCommunicationsSheets_() {
  const db = getDatabase();
  const schemas = {
    COMMUNICATION_CAMPAIGNS: [
      "Campaign ID", "Campaign Name", "Created At", "Created By", "Status",
      "Payload JSON", "Recipient Count", "Last Updated", "Summary JSON"
    ],
    COMMUNICATION_DELIVERY_LOG: [
      "Campaign ID", "NSS Number", "Full Name", "Batch", "Allowance Type",
      "Channel", "Recipient", "Subject", "Message", "Status", "Provider Response",
      "Updated At", "Character Count"
    ]
  };
  Object.keys(schemas).forEach(function(name) {
    let sheet = db.getSheetByName(name);
    if (!sheet) sheet = db.insertSheet(name);
    const wanted = schemas[name];
    if (sheet.getLastRow() === 0 || sheet.getLastColumn() === 0) {
      sheet.getRange(1, 1, 1, wanted.length).setValues([wanted]);
      sheet.setFrozenRows(1);
      return;
    }
    const current = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0]
      .map(function(v) { return String(v || "").trim(); });
    wanted.forEach(function(header) {
      const key = communicationsNormaliseHeader_(header);
      if (!current.some(function(h) { return communicationsNormaliseHeader_(h) === key; })) {
        sheet.getRange(1, sheet.getLastColumn() + 1).setValue(header);
        current.push(header);
      }
    });
  });
}

function communicationsNormaliseHeader_(value) {
  return String(value == null ? "" : value).trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

function communicationsFindColumn_(headers, aliases) {
  const accepted = (aliases || []).map(communicationsNormaliseHeader_);
  return headers.findIndex(function(h) { return accepted.indexOf(communicationsNormaliseHeader_(h)) >= 0; });
}

function communicationsNssKey_(value) {
  return String(value == null ? "" : value).trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function communicationsDateKey_(value) {
  if (value instanceof Date && !isNaN(value.getTime())) {
    return Utilities.formatDate(value, Session.getScriptTimeZone() || "Africa/Accra", "yyyy-MM-dd");
  }
  if (value === null || value === undefined || String(value).trim() === "") return "";
  const text = String(value).trim();
  let match = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (match) return match[1] + "-" + String(match[2]).padStart(2, "0") + "-" + String(match[3]).padStart(2, "0");
  // Ghanaian spreadsheet dates are commonly displayed as DD/MM/YYYY.
  match = text.match(/^(\d{1,2})[/.](\d{1,2})[/.](\d{4})$/);
  if (match) return match[3] + "-" + String(match[2]).padStart(2, "0") + "-" + String(match[1]).padStart(2, "0");
  const parsed = new Date(text);
  if (isNaN(parsed.getTime())) return "";
  return Utilities.formatDate(parsed, Session.getScriptTimeZone() || "Africa/Accra", "yyyy-MM-dd");
}

function communicationsFormatDate_(key) {
  if (!key || !/^\d{4}-\d{2}-\d{2}$/.test(String(key))) return "";
  const parts = String(key).split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return Number(parts[2]) + " " + months[Number(parts[1]) - 1] + " " + parts[0];
}

function communicationsReadSheet_(sheetName) {
  const sheet = getDatabase().getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() < 1 || sheet.getLastColumn() < 1) {
    throw new Error('Required sheet "' + sheetName + '" was not found or has no headers.');
  }
  const values = sheet.getDataRange().getValues();
  const headers = values[0].map(function(h) { return String(h || "").trim(); });
  const rows = values.slice(1).map(function(valuesRow, index) {
    const object = {};
    headers.forEach(function(header, i) { object[header] = valuesRow[i]; });
    object.__rowNumber = index + 2;
    return object;
  }).filter(function(row) {
    return headers.some(function(header) { return row[header] !== "" && row[header] !== null; });
  });
  return { sheet: sheet, headers: headers, rows: rows, values: values };
}

function getCommunicationsConfig(token) {
  requireAdminSession_(token, ["ADMIN"]);
  const registered = communicationsReadSheet_("REGISTERED_PERSONNEL");
  const master = communicationsReadSheet_("MASTER_PERSONNEL");
  const batches = {};
  const allowances = {};
  const serviceStatuses = {};
  const registrationStatuses = {};
  const enrolmentStatuses = {};
  const genders = {};
  const genderIndex = communicationsFindColumn_(registered.headers, ["Gender", "Sex", "Gender/Sex", "Sex/Gender"]);
  registered.rows.forEach(function(p) {
    const batch = String(p["Batch"] || "").trim();
    const allowance = String(p["Allowance Type"] || "").trim();
    const service = String(p["Service Status"] || "").trim();
    const status = String(p["Status"] || "").trim();
    if (batch) batches[batch] = true;
    if (allowance) allowances[allowance] = true;
    if (service) serviceStatuses[service] = true;
    if (status) registrationStatuses[status] = true;
    const genderValue = genderIndex >= 0 ? String(p[registered.headers[genderIndex]] || "").trim() : "";
    if (genderValue) genders[genderValue] = true;
  });
  master.rows.forEach(function(p) {
    const status = String(p["Enrollment Status"] || p["Enrolment Status"] || "").trim();
    if (status) enrolmentStatuses[status] = true;
  });
  const validationIndex = communicationsFindColumn_(registered.headers, [
    "Regional Verification Date", "Regional Validation Date", "Regional Validation Completed Date", "Validation Date"
  ]);
  return serialiseAdminValue_({
    batches: Object.keys(batches).sort(),
    allowances: Object.keys(allowances).sort(),
    serviceStatuses: Object.keys(serviceStatuses).sort(),
    registrationStatuses: Object.keys(registrationStatuses).sort(),
    genders: Object.keys(genders).sort(),
    enrolmentStatuses: Object.keys(enrolmentStatuses).sort(),
    registeredCount: registered.rows.filter(function(p) { return communicationsNssKey_(p["NSS Number"] || p["NSS"]); }).length,
    validationDateHeader: validationIndex >= 0 ? registered.headers[validationIndex] : "",
    evaluationMonths: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  });
}

function communicationsBuildSubmissionSets_(type, month, year, serviceYear) {
  const result = { submitted: {}, sheetName: type === "MONTHLY" ? "MONTHLY_EVALUATIONS" : "ANNUAL_EVALUATIONS" };
  if (type === "NONE" || !type) return result;
  const source = communicationsReadSheet_(result.sheetName);
  source.rows.forEach(function(row) {
    if (typeof reminderRowIsSubmitted_ === "function" && !reminderRowIsSubmitted_(row)) return;
    const nss = communicationsNssKey_(row["NSS Number"] || row["NSS"]);
    if (!nss) return;
    if (type === "MONTHLY") {
      const period = getMonthlySubmissionPeriodFromRow_(row);
      if (Number(period.month) === Number(month) && Number(period.year) === Number(year)) result.submitted[nss] = true;
    } else {
      const period = String(getAnnualEvaluationPeriodFromSubmissionRow_(row) || "").trim().toUpperCase();
      if (period && period === String(serviceYear || "").trim().toUpperCase()) result.submitted[nss] = true;
    }
  });
  return result;
}

function communicationsCleanPayload_(payload) {
  payload = payload || {};
  const type = String(payload.evaluationType || "NONE").trim().toUpperCase();
  const status = String(payload.evaluationStatus || "ALL").trim().toUpperCase();
  const channels = Array.isArray(payload.channels) ? payload.channels.map(function(v) { return String(v || "").trim().toUpperCase(); }).filter(function(v, i, a) { return ["EMAIL", "SMS"].indexOf(v) >= 0 && a.indexOf(v) === i; }) : [];
  const clean = {
    campaignName: String(payload.campaignName || "").trim().substring(0, 150),
    sourceSheet: "REGISTERED_PERSONNEL",
    batch: String(payload.batch || "").trim(),
    allowance: String(payload.allowance || "").trim(),
    serviceStatus: String(payload.serviceStatus || "").trim(),
    registrationStatus: String(payload.registrationStatus || "").trim(),
    enrollmentStatus: String(payload.enrollmentStatus || "").trim(),
    gender: String(payload.gender || "").trim(),
    contactRequirement: String(payload.contactRequirement || "ANY").trim().toUpperCase(),
    evaluationType: type,
    evaluationStatus: status,
    month: Number(payload.month || 0),
    year: Number(payload.year || 0),
    serviceYear: String(payload.serviceYear || "").trim(),
    regionalValidationCutoff: String(payload.regionalValidationCutoff || "").trim(),
    deadline: String(payload.deadline || "").trim(),
    channels: channels,
    emailSubject: String(payload.emailSubject || "").trim().substring(0, 200),
    emailTemplate: String(payload.emailTemplate || "").trim().substring(0, 12000),
    smsTemplate: String(payload.smsTemplate || "").trim()
  };
  if (!clean.campaignName) throw new Error("Enter a campaign name.");
  if (!clean.batch) throw new Error("Select a specific batch before previewing or sending a communications campaign.");
  if (!clean.channels.length) throw new Error("Select at least one delivery channel: email, SMS, or both.");
  if (clean.channels.indexOf("EMAIL") >= 0 && (!clean.emailSubject || !clean.emailTemplate)) throw new Error("Enter both an email subject and email message.");
  if (clean.channels.indexOf("SMS") >= 0 && !clean.smsTemplate) throw new Error("Enter an SMS message.");
  if (["NONE", "MONTHLY", "ANNUAL"].indexOf(clean.evaluationType) < 0) throw new Error("Choose a valid evaluation type.");
  if (["ALL", "PENDING", "SUBMITTED"].indexOf(clean.evaluationStatus) < 0) throw new Error("Choose a valid evaluation compliance filter.");
  if (clean.evaluationType === "NONE" && clean.evaluationStatus !== "ALL") throw new Error("Choose Monthly or Annual before filtering by evaluation submission status.");
  if (clean.evaluationType !== "NONE" && clean.evaluationStatus !== "ALL") {
    if (clean.evaluationType === "MONTHLY" && (clean.month < 1 || clean.month > 12 || clean.year < 2000 || clean.year > 2100)) throw new Error("Choose a valid month and year for the monthly evaluation filter.");
    if (clean.evaluationType === "ANNUAL" && !clean.serviceYear) throw new Error("Enter the service year for the annual evaluation filter.");
  }
  if (clean.regionalValidationCutoff && !/^\d{4}-\d{2}-\d{2}$/.test(clean.regionalValidationCutoff)) throw new Error("Enter the regional validation cutoff as a valid date.");
  if (clean.deadline && !/^\d{4}-\d{2}-\d{2}$/.test(clean.deadline)) throw new Error("Enter the campaign deadline as a valid date.");
  if ((clean.emailTemplate + " " + clean.smsTemplate).indexOf("{Deadline}") >= 0 && !clean.deadline) throw new Error("Enter the amnesty deadline. The message template contains {Deadline} and must not be sent without a confirmed date.");
  if (["ANY", "HAS_EMAIL", "HAS_PHONE", "HAS_BOTH"].indexOf(clean.contactRequirement) < 0) throw new Error("Choose a valid contact availability filter.");
  return clean;
}

function communicationsBuildRecipients_(payload) {
  const registered = communicationsReadSheet_("REGISTERED_PERSONNEL");
  const requiredNss = communicationsFindColumn_(registered.headers, ["NSS Number", "NSS"]);
  const nameIndex = communicationsFindColumn_(registered.headers, ["Full Name", "Name", "Personnel Name"]);
  const batchIndex = communicationsFindColumn_(registered.headers, ["Batch", "Batch Name"]);
  if (requiredNss < 0 || nameIndex < 0 || batchIndex < 0) throw new Error("REGISTERED_PERSONNEL must contain NSS Number, Full Name and Batch headers.");
  const validationIndex = communicationsFindColumn_(registered.headers, ["Regional Verification Date", "Regional Validation Date", "Regional Validation Completed Date", "Validation Date"]);
  const genderIndex = communicationsFindColumn_(registered.headers, ["Gender", "Sex", "Gender/Sex", "Sex/Gender"]);
  if (payload.gender && genderIndex < 0) throw new Error('A gender filter was selected, but REGISTERED_PERSONNEL has no recognised Gender or Sex column.');
  if (payload.regionalValidationCutoff && validationIndex < 0) throw new Error('The registered personnel sheet does not contain a recognised regional validation date header. Expected "Regional Verification Date" or "Regional Validation Date". No recipients were selected.');

  const masterByNss = {};
  if (payload.enrollmentStatus) {
    try {
      communicationsReadSheet_("MASTER_PERSONNEL").rows.forEach(function(row) {
        const key = communicationsNssKey_(row["NSS Number"] || row["NSS"]);
        if (key && !masterByNss[key]) masterByNss[key] = row;
      });
    } catch (e) {
      throw new Error("An enrolment-status filter was selected, but MASTER_PERSONNEL could not be read.");
    }
    if (!Object.keys(masterByNss).length) throw new Error("An enrolment-status filter was selected, but no master personnel records could be matched.");
  }

  const submittedSet = payload.evaluationType !== "NONE" && payload.evaluationStatus !== "ALL"
    ? communicationsBuildSubmissionSets_(payload.evaluationType, payload.month, payload.year, payload.serviceYear).submitted
    : {};
  const counts = {
    totalRegistered: 0, afterBasicFilters: 0, missingValidationDate: 0,
    validationAfterCutoff: 0, evaluationExcluded: 0, contactFilterExcluded: 0,
    eligible: 0, missingEmail: 0, missingPhone: 0, missingSelectedChannelContact: 0
  };
  const recipients = [];
  registered.rows.forEach(function(p) {
    const nssRaw = p["NSS Number"] || p["NSS"] || "";
    const nss = communicationsNssKey_(nssRaw);
    if (!nss) return;
    counts.totalRegistered++;
    const batch = String(p["Batch"] || p["Batch Name"] || "").trim();
    const allowance = String(p["Allowance Type"] || p["Allowance"] || "").trim();
    const serviceStatus = String(p["Service Status"] || "").trim();
    const registrationStatus = String(p["Status"] || p["Registration Status"] || "").trim();
    const gender = genderIndex >= 0 ? String(p[registered.headers[genderIndex]] || "").trim() : "";
    const master = masterByNss[nss] || {};
    const enrollmentStatus = String(master["Enrollment Status"] || master["Enrolment Status"] || "").trim();
    if (payload.batch && batch.toUpperCase() !== payload.batch.toUpperCase()) return;
    if (payload.allowance && allowance.toUpperCase() !== payload.allowance.toUpperCase()) return;
    if (payload.serviceStatus && serviceStatus.toUpperCase() !== payload.serviceStatus.toUpperCase()) return;
    if (payload.registrationStatus && registrationStatus.toUpperCase() !== payload.registrationStatus.toUpperCase()) return;
    if (payload.gender && gender.toUpperCase() !== payload.gender.toUpperCase()) return;
    if (payload.enrollmentStatus && enrollmentStatus.toUpperCase() !== payload.enrollmentStatus.toUpperCase()) return;
    if (payload.evaluationType === "MONTHLY" && allowance.toLowerCase() !== "subvented") return;
    counts.afterBasicFilters++;

    const submitted = payload.evaluationType !== "NONE" && payload.evaluationStatus !== "ALL" ? Boolean(submittedSet[nss]) : null;
    if (payload.evaluationStatus === "PENDING" && submitted) { counts.evaluationExcluded++; return; }
    if (payload.evaluationStatus === "SUBMITTED" && !submitted) { counts.evaluationExcluded++; return; }

    let validationDate = "";
    if (validationIndex >= 0) validationDate = communicationsDateKey_(p[registered.headers[validationIndex]]);
    if (payload.regionalValidationCutoff) {
      if (!validationDate) { counts.missingValidationDate++; return; }
      if (validationDate > payload.regionalValidationCutoff) { counts.validationAfterCutoff++; return; }
    }

    const email = String(p["Email"] || "").trim();
    const phone = String(p["Phone Number"] || p["Phone"] || "").trim();
    if (!email) counts.missingEmail++;
    if (!phone) counts.missingPhone++;
    if (payload.contactRequirement === "HAS_EMAIL" && !email) { counts.contactFilterExcluded++; return; }
    if (payload.contactRequirement === "HAS_PHONE" && !phone) { counts.contactFilterExcluded++; return; }
    if (payload.contactRequirement === "HAS_BOTH" && (!email || !phone)) { counts.contactFilterExcluded++; return; }

    counts.eligible++;
    recipients.push({
      nss: String(nssRaw).trim(), nssKey: nss,
      name: String(p["Full Name"] || p["Name"] || "NSA Personnel").trim() || "NSA Personnel",
      registrationNumber: String(p["Registration Number"] || "").trim(),
      batch: batch, allowance: allowance, gender: gender, serviceStatus: serviceStatus,
      registrationStatus: registrationStatus, enrollmentStatus: enrollmentStatus,
      regionalValidationDate: validationDate, email: email, phone: phone,
      evaluationStatus: submitted === null ? "NOT FILTERED" : (submitted ? "SUBMITTED" : "PENDING")
    });
  });
  return { recipients: recipients, counts: counts, validationDateHeader: validationIndex >= 0 ? registered.headers[validationIndex] : "" };
}

function communicationsRenderTemplate_(template, person, payload) {
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const values = {
    Name: person.name,
    NSS: person.nss,
    Batch: person.batch,
    AllowanceType: person.allowance,
    RegistrationNumber: person.registrationNumber,
    Month: payload.evaluationType === "MONTHLY" && payload.month ? monthNames[payload.month - 1] : "",
    Year: payload.year || "",
    ServiceYear: payload.serviceYear || "",
    Deadline: communicationsFormatDate_(payload.deadline),
    RegionalValidationDate: communicationsFormatDate_(person.regionalValidationDate)
  };
  return String(template || "").replace(/\{([A-Za-z]+)\}/g, function(match, key) {
    return Object.prototype.hasOwnProperty.call(values, key) ? String(values[key] == null ? "" : values[key]) : match;
  }).replace(/\r\n/g, "\n").trim();
}

function communicationsEscapeHtml_(value) {
  return String(value == null ? "" : value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function communicationsCharacterCount_(value) {
  return Array.from(String(value || "")).length;
}

function communicationsGetSheetMap_(sheet) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0].map(function(h) { return String(h || "").trim(); });
  const map = {};
  headers.forEach(function(h, i) { map[communicationsNormaliseHeader_(h)] = i; });
  return { headers: headers, map: map };
}

function communicationsCampaignRow_(campaignId) {
  ensureCommunicationsSheets_();
  const sheet = getDatabase().getSheetByName("COMMUNICATION_CAMPAIGNS");
  const data = sheet.getDataRange().getValues();
  const headers = data[0].map(function(h) { return String(h || "").trim(); });
  for (let i = 1; i < data.length; i++) {
    const obj = {};
    headers.forEach(function(h, j) { obj[h] = data[i][j]; });
    if (String(obj["Campaign ID"] || "") === String(campaignId || "")) return { sheet: sheet, rowNumber: i + 1, data: data[i], headers: headers, object: obj };
  }
  return null;
}

function communicationsUpdateCampaign_(campaign, updates) {
  const sheet = campaign.sheet;
  const headers = campaign.headers || sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0].map(function(h) { return String(h || "").trim(); });
  const row = sheet.getRange(campaign.rowNumber, 1, 1, sheet.getLastColumn()).getValues()[0];
  Object.keys(updates).forEach(function(key) {
    const index = communicationsFindColumn_(headers, [key]);
    if (index >= 0) row[index] = updates[key];
  });
  sheet.getRange(campaign.rowNumber, 1, 1, row.length).setValues([row]);
  campaign.data = row;
  campaign.headers = headers;
  headers.forEach(function(h, i) { campaign.object[h] = row[i]; });
}

function communicationsDeliveryData_(campaignId) {
  ensureCommunicationsSheets_();
  const sheet = getDatabase().getSheetByName("COMMUNICATION_DELIVERY_LOG");
  const values = sheet.getDataRange().getValues();
  const headers = values[0].map(function(h) { return String(h || "").trim(); });
  const deliveries = [];
  for (let i = 1; i < values.length; i++) {
    const obj = {};
    headers.forEach(function(h, j) { obj[h] = values[i][j]; });
    if (String(obj["Campaign ID"] || "") === String(campaignId || "")) deliveries.push({ rowNumber: i + 1, values: values[i], object: obj, headers: headers, sheet: sheet });
  }
  return deliveries;
}

function communicationsDeliveryUpdate_(delivery, updates) {
  const row = delivery.sheet.getRange(delivery.rowNumber, 1, 1, delivery.sheet.getLastColumn()).getValues()[0];
  Object.keys(updates).forEach(function(key) {
    const index = communicationsFindColumn_(delivery.headers, [key]);
    if (index >= 0) row[index] = updates[key];
  });
  delivery.sheet.getRange(delivery.rowNumber, 1, 1, row.length).setValues([row]);
  Object.keys(updates).forEach(function(key) { delivery.object[key] = updates[key]; });
}

function previewCommunicationCampaign(payload, token) {
  const session = requireAdminSession_(token, ["ADMIN"]);
  ensureCommunicationsSheets_();
  const clean = communicationsCleanPayload_(payload);
  const built = communicationsBuildRecipients_(clean);
  if (!built.recipients.length) {
    return serialiseAdminValue_({ status: "NO_RECIPIENTS", message: "No registered personnel match all selected criteria. No campaign was created and no messages were sent.", counts: built.counts, validationDateHeader: built.validationDateHeader, recipients: [] });
  }
  const campaignId = "COM-" + Utilities.getUuid().replace(/-/g, "").substring(0, 12).toUpperCase();
  const now = new Date();
  const campaignSheet = getDatabase().getSheetByName("COMMUNICATION_CAMPAIGNS");
  const campaignHeaders = campaignSheet.getRange(1, 1, 1, campaignSheet.getLastColumn()).getDisplayValues()[0].map(function(h) { return String(h || "").trim(); });
  const campaignRecord = {
    "Campaign ID": campaignId, "Campaign Name": clean.campaignName, "Created At": now,
    "Created By": session.email || session.userEmail || "", "Status": "PREVIEWED",
    "Payload JSON": JSON.stringify(clean), "Recipient Count": built.recipients.length,
    "Last Updated": now, "Summary JSON": JSON.stringify({ counts: built.counts, channels: clean.channels })
  };
  const campaignRow = new Array(campaignHeaders.length).fill("");
  Object.keys(campaignRecord).forEach(function(key) { const idx = communicationsFindColumn_(campaignHeaders, [key]); if (idx >= 0) campaignRow[idx] = campaignRecord[key]; });
  campaignSheet.appendRow(campaignRow);

  const deliverySheet = getDatabase().getSheetByName("COMMUNICATION_DELIVERY_LOG");
  const deliveryHeaders = deliverySheet.getRange(1, 1, 1, deliverySheet.getLastColumn()).getDisplayValues()[0].map(function(h) { return String(h || "").trim(); });
  const deliveryRows = [];
  const previewRows = [];
  let overLimit = 0;
  built.recipients.forEach(function(person) {
    const emailMessage = communicationsRenderTemplate_(clean.emailTemplate, person, clean);
    const smsMessage = communicationsRenderTemplate_(clean.smsTemplate, person, clean).replace(/\s+/g, " ").trim();
    const smsLength = communicationsCharacterCount_(smsMessage);
    if (clean.channels.indexOf("SMS") >= 0 && person.phone && smsLength > 160) overLimit++;
    previewRows.push({
      nss: person.nss, name: person.name, batch: person.batch, allowance: person.allowance,
      validationDate: person.regionalValidationDate, evaluationStatus: person.evaluationStatus,
      email: person.email, phone: person.phone, smsCharacters: clean.channels.indexOf("SMS") >= 0 ? smsLength : null,
      emailPreview: clean.channels.indexOf("EMAIL") >= 0 ? emailMessage : "",
      smsPreview: clean.channels.indexOf("SMS") >= 0 ? smsMessage : ""
    });
    clean.channels.forEach(function(channel) {
      const recipient = channel === "EMAIL" ? person.email : person.phone;
      const message = channel === "EMAIL" ? emailMessage : smsMessage;
      const status = !recipient ? "NO_CONTACT" : "PENDING";
      const record = {
        "Campaign ID": campaignId, "NSS Number": person.nss, "Full Name": person.name,
        "Batch": person.batch, "Allowance Type": person.allowance, "Channel": channel,
        "Recipient": recipient, "Subject": channel === "EMAIL" ? clean.emailSubject : "",
        "Message": message, "Status": status,
        "Provider Response": status === "NO_CONTACT" ? "No contact detail available for selected channel." : "Awaiting campaign confirmation.",
        "Updated At": now, "Character Count": communicationsCharacterCount_(message)
      };
      const row = new Array(deliveryHeaders.length).fill("");
      Object.keys(record).forEach(function(key) { const idx = communicationsFindColumn_(deliveryHeaders, [key]); if (idx >= 0) row[idx] = record[key]; });
      deliveryRows.push(row);
    });
  });
  if (deliveryRows.length) deliverySheet.getRange(deliverySheet.getLastRow() + 1, 1, deliveryRows.length, deliveryHeaders.length).setValues(deliveryRows);
  try { writeAuditLog_(session.email || session.userEmail || "", "COMMUNICATION_CAMPAIGN_PREVIEWED", campaignId + " / " + clean.campaignName + " / recipients=" + built.recipients.length); } catch (e) { console.warn("Communications audit log failed", e); }
  return serialiseAdminValue_({
    status: "SUCCESS", campaignId: campaignId, campaignName: clean.campaignName,
    counts: built.counts, recipients: previewRows, channels: clean.channels,
    overLimitSmsCount: overLimit, validationDateHeader: built.validationDateHeader,
    message: "Preview created. No email or SMS has been sent. Review the exact recipients and message lengths before confirming."
  });
}

function startCommunicationCampaign(campaignId, token) {
  const session = requireAdminSession_(token, ["ADMIN"]);
  ensureCommunicationsSheets_();
  const campaign = communicationsCampaignRow_(campaignId);
  if (!campaign) throw new Error("Campaign not found. Refresh the campaign history and try again.");
  const status = String(campaign.object["Status"] || "").toUpperCase();
  if (["COMPLETED", "COMPLETED_WITH_ISSUES", "CANCELLED"].indexOf(status) >= 0) return { status: "ERROR", message: "This campaign has already finished. Use Retry failed to retry failed messages; successful messages will not be resent." };
  if (status === "PREVIEWED") {
    let payload;
    try { payload = JSON.parse(String(campaign.object["Payload JSON"] || "{}")); }
    catch (e) { throw new Error("The saved campaign configuration is unreadable. Preview a new campaign."); }
    const rebuilt = communicationsBuildRecipients_(payload);
    const current = [];
    rebuilt.recipients.forEach(function(person) {
      const emailMessage = communicationsRenderTemplate_(payload.emailTemplate, person, payload);
      const smsMessage = communicationsRenderTemplate_(payload.smsTemplate, person, payload).replace(/\s+/g, " ").trim();
      payload.channels.forEach(function(channel) {
        current.push([person.nssKey, channel, channel === "EMAIL" ? person.email : person.phone, channel === "EMAIL" ? emailMessage : smsMessage].join("|"));
      });
    });
    const saved = communicationsDeliveryData_(campaignId).map(function(d) {
      return [communicationsNssKey_(d.object["NSS Number"]), String(d.object["Channel"] || "").toUpperCase(), String(d.object["Recipient"] || ""), String(d.object["Message"] || "")].join("|");
    });
    current.sort(); saved.sort();
    if (current.length !== saved.length || current.some(function(v, i) { return v !== saved[i]; })) {
      return { status: "STALE_PREVIEW", message: "Personnel, contact details or evaluation status changed after the preview. Preview the campaign again before sending." };
    }
    const deliveries = communicationsDeliveryData_(campaignId);
    const deliverable = deliveries.filter(function(d) { return String(d.object["Status"] || "").toUpperCase() === "PENDING"; }).length;
    if (!deliverable) return { status: "ERROR", message: "No messages have a usable contact detail for the selected channels. No messages were sent." };
    communicationsUpdateCampaign_(campaign, { "Status": "SENDING", "Last Updated": new Date() });
  } else if (status === "PAUSED_QUOTA") {
    communicationsUpdateCampaign_(campaign, { "Status": "SENDING", "Last Updated": new Date() });
  } else if (status !== "SENDING") {
    return { status: "ERROR", message: "This campaign is not ready to send. Create a fresh preview." };
  }
  try { writeAuditLog_(session.email || session.userEmail || "", "COMMUNICATION_CAMPAIGN_SEND_STARTED", String(campaignId)); } catch (e) { console.warn(e); }
  return { status: "SUCCESS", campaignId: campaignId, message: "Campaign confirmed. Message batches will now be processed." };
}

function processCommunicationCampaignBatch(campaignId, token) {
  requireAdminSession_(token, ["ADMIN"]);
  ensureCommunicationsSheets_();
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) return { status: "BUSY", done: false, message: "Another campaign batch is processing. Please wait." };
  try {
    const campaign = communicationsCampaignRow_(campaignId);
    if (!campaign) throw new Error("Campaign not found.");
    if (String(campaign.object["Status"] || "").toUpperCase() !== "SENDING") throw new Error("Campaign is not in the sending state.");
    const all = communicationsDeliveryData_(campaignId);
    const pending = all.filter(function(d) { return String(d.object["Status"] || "").toUpperCase() === "PENDING"; }).slice(0, 5);
    let sentThisBatch = 0, failedThisBatch = 0, pausedForQuota = false, processed = 0;

    for (let i = 0; i < pending.length; i++) {
      const delivery = pending[i];
      const channel = String(delivery.object["Channel"] || "").toUpperCase();
      const recipient = String(delivery.object["Recipient"] || "").trim();
      const message = String(delivery.object["Message"] || "");
      const subject = String(delivery.object["Subject"] || "");
      let success = false, details = "";

      if (channel === "EMAIL") {
        let remaining = 0;
        try { remaining = MailApp.getRemainingDailyQuota(); }
        catch (quotaError) { details = "Could not read Gmail daily quota: " + quotaError.message; }
        if (remaining <= 0) {
          pausedForQuota = true;
          break; // Leave this and subsequent recipients PENDING.
        }
      }

      try {
        if (!recipient) {
          details = "No contact detail available.";
        } else if (channel === "EMAIL") {
          success = Boolean(sendEmail_(recipient, subject, communicationsEscapeHtml_(message)));
          if (!success) {
            let remainingAfter = 1;
            try { remainingAfter = MailApp.getRemainingDailyQuota(); } catch (e) {}
            if (remainingAfter <= 0) { pausedForQuota = true; break; }
            details = "Email send function returned false. Check EMAIL_LOG.";
          } else details = "Accepted by Apps Script mail service; inbox delivery is not independently confirmed.";
        } else if (channel === "SMS") {
          success = Boolean(sendSMSOnline_(recipient, message));
          details = success ? "Accepted by configured SMS provider; handset delivery depends on provider status." : "SMS send function returned false. Check SMS_LOG and provider configuration.";
        } else {
          details = "Unsupported delivery channel.";
        }
      } catch (e) {
        details = String(e && e.message ? e.message : e);
        if (/service invoked too many times|daily.*quota|email.*quota/i.test(details) && channel === "EMAIL") {
          pausedForQuota = true;
          break; // Do not mark a quota-blocked message FAILED.
        }
      }

      communicationsDeliveryUpdate_(delivery, {
        "Status": success ? "SENT" : "FAILED",
        "Provider Response": details,
        "Updated At": new Date()
      });
      processed++;
      if (success) sentThisBatch++; else failedThisBatch++;
    }

    const refreshed = communicationsDeliveryData_(campaignId);
    const count = function(status) { return refreshed.filter(function(d) { return String(d.object["Status"] || "").toUpperCase() === status; }).length; };
    const stillPending = count("PENDING"), sent = count("SENT"), failed = count("FAILED"), noContact = count("NO_CONTACT"), overLimit = count("OVER_LIMIT");

    if (pausedForQuota) {
      communicationsUpdateCampaign_(campaign, {
        "Status": "PAUSED_QUOTA",
        "Last Updated": new Date(),
        "Summary JSON": JSON.stringify({ sent: sent, failed: failed, pending: stillPending, pausedReason: "GOOGLE_DAILY_EMAIL_QUOTA" })
      });
      return { status: "PAUSED_QUOTA", done: false, processed: processed, sentThisBatch: sentThisBatch, failedThisBatch: failedThisBatch, sent: sent, failed: failed, pending: stillPending, message: "Google daily email quota is exhausted. Remaining messages are preserved as pending and can resume after quota availability returns." };
    }

    const done = stillPending === 0;
    if (done) {
      const finalStatus = failed || noContact || overLimit ? "COMPLETED_WITH_ISSUES" : "COMPLETED";
      communicationsUpdateCampaign_(campaign, { "Status": finalStatus, "Last Updated": new Date(), "Summary JSON": JSON.stringify({ sent: sent, failed: failed, noContact: noContact, overLimit: overLimit }) });
      try { writeAuditLog_(Session.getActiveUser().getEmail() || "", "COMMUNICATION_CAMPAIGN_FINISHED", campaignId + " / " + finalStatus + " / sent=" + sent + " / failed=" + failed); } catch (e) { console.warn(e); }
    } else {
      communicationsUpdateCampaign_(campaign, { "Last Updated": new Date(), "Summary JSON": JSON.stringify({ sent: sent, failed: failed, noContact: noContact, overLimit: overLimit, pending: stillPending }) });
    }
    return { status: "SUCCESS", done: done, processed: processed, sentThisBatch: sentThisBatch, failedThisBatch: failedThisBatch, sent: sent, failed: failed, noContact: noContact, overLimit: overLimit, pending: stillPending, campaignStatus: done ? (failed || noContact || overLimit ? "COMPLETED_WITH_ISSUES" : "COMPLETED") : "SENDING" };
  } finally {
    lock.releaseLock();
  }
}

function retryFailedCommunicationCampaign(campaignId, token) {
  const session = requireAdminSession_(token, ["ADMIN"]);
  ensureCommunicationsSheets_();
  const campaign = communicationsCampaignRow_(campaignId);
  if (!campaign) throw new Error("Campaign not found.");
  const status = String(campaign.object["Status"] || "").toUpperCase();
  if (status !== "COMPLETED_WITH_ISSUES") return { status: "ERROR", message: "Only a completed campaign with issues can retry failed messages." };
  const deliveries = communicationsDeliveryData_(campaignId);
  let reset = 0;
  deliveries.forEach(function(delivery) {
    if (String(delivery.object["Status"] || "").toUpperCase() === "FAILED") {
      communicationsDeliveryUpdate_(delivery, { "Status": "PENDING", "Provider Response": "Retry queued by administrator.", "Updated At": new Date() });
      reset++;
    }
  });
  if (!reset) return { status: "ERROR", message: "There are no failed messages to retry. Successful messages will never be resent by this action." };
  communicationsUpdateCampaign_(campaign, { "Status": "SENDING", "Last Updated": new Date() });
  try { writeAuditLog_(session.email || session.userEmail || "", "COMMUNICATION_CAMPAIGN_RETRY_QUEUED", campaignId + " / failed rows reset=" + reset); } catch (e) { console.warn(e); }
  return { status: "SUCCESS", reset: reset, message: reset + " failed message(s) queued for retry. Previously successful messages were left unchanged." };
}

function getCommunicationCampaignHistory(token) {
  requireAdminSession_(token, ["ADMIN"]);
  ensureCommunicationsSheets_();
  const sheet = getDatabase().getSheetByName("COMMUNICATION_CAMPAIGNS");
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = values[0].map(function(h) { return String(h || "").trim(); });
  const deliveryValues = getDatabase().getSheetByName("COMMUNICATION_DELIVERY_LOG").getDataRange().getValues();
  const dHeaders = deliveryValues[0].map(function(h) { return String(h || "").trim(); });
  const dCampaign = communicationsFindColumn_(dHeaders, ["Campaign ID"]);
  const dStatus = communicationsFindColumn_(dHeaders, ["Status"]);
  const counts = {};
  for (let i = 1; i < deliveryValues.length; i++) {
    const id = String(deliveryValues[i][dCampaign] || "");
    if (!id) continue;
    if (!counts[id]) counts[id] = { sent: 0, failed: 0, pending: 0, noContact: 0, overLimit: 0 };
    const state = String(deliveryValues[i][dStatus] || "").toUpperCase();
    if (state === "SENT") counts[id].sent++;
    else if (state === "FAILED") counts[id].failed++;
    else if (state === "PENDING") counts[id].pending++;
    else if (state === "NO_CONTACT") counts[id].noContact++;
    else if (state === "OVER_LIMIT") counts[id].overLimit++;
  }
  const result = [];
  for (let i = values.length - 1; i >= 1 && result.length < 30; i--) {
    const row = {};
    headers.forEach(function(h, j) { row[h] = values[i][j]; });
    if (!row["Campaign ID"]) continue;
    const c = counts[String(row["Campaign ID"])] || { sent: 0, failed: 0, pending: 0, noContact: 0, overLimit: 0 };
    result.push({
      id: String(row["Campaign ID"]), name: String(row["Campaign Name"] || ""),
      createdAt: row["Created At"], createdBy: String(row["Created By"] || ""),
      status: String(row["Status"] || ""), recipients: Number(row["Recipient Count"] || 0),
      sent: c.sent, failed: c.failed, pending: c.pending, noContact: c.noContact, overLimit: c.overLimit,
      lastUpdated: row["Last Updated"]
    });
  }
  return serialiseAdminValue_(result);
}

/* =========================================================
   ADMIN PERSONNEL PHOTO DELIVERY
   Returns a data URL for the registered person's Drive photo
   so the profile does not rely on a Drive preview-page URL
   being directly renderable as an <img> source.
   ========================================================= */
function getPersonnelPhotoDataUrl(nss, token) {
  requireAdminSession_(token, ["ADMIN"]);
  const person = findRegisteredPersonnel_(String(nss || "").trim());
  if (!person) return { status: "ERROR", message: "Personnel record not found." };
  let fileId = String(person["Photo File ID"] || "").trim();
  const storedUrl = String(person["Photo URL"] || "").trim();
  if (!fileId && storedUrl) {
    let match = storedUrl.match(/\/d\/([A-Za-z0-9_-]{15,})/);
    if (!match) match = storedUrl.match(/[?&]id=([A-Za-z0-9_-]{15,})/);
    if (match) fileId = match[1];
  }
  if (!fileId) {
    const directImageUrl = /^https?:\/\//i.test(storedUrl) && (/\.(?:jpe?g|png|gif|webp|bmp)(?:[?#]|$)/i.test(storedUrl) || /googleusercontent\.com/i.test(storedUrl)) && !/drive\.google\.com\/file\//i.test(storedUrl);
    if (directImageUrl) return { status: "SUCCESS", url: storedUrl };
    return { status: "NO_PHOTO", message: "No usable passport photograph URL or Drive file ID is stored for this personnel record." };
  }
  try {
    const file = DriveApp.getFileById(fileId);
    const blob = file.getBlob();
    const mime = String(blob.getContentType() || file.getMimeType() || "image/jpeg");
    if (mime.toLowerCase().indexOf("image/") !== 0) {
      return { status: "ERROR", message: "The stored personnel file is not an image." };
    }
    const bytes = blob.getBytes();
    // Keep the RPC payload moderate. Larger images use the shareable Drive image endpoint.
    if (bytes.length > 4 * 1024 * 1024) {
      return { status: "SUCCESS", url: "https://drive.google.com/thumbnail?id=" + encodeURIComponent(fileId) + "&sz=w600" };
    }
    return { status: "SUCCESS", dataUrl: "data:" + mime + ";base64," + Utilities.base64Encode(bytes) };
  } catch (error) {
    console.error("Personnel photo retrieval failed for NSS " + String(nss || "") + ": " + String(error.message || error));
    if (storedUrl && /^https?:\/\//i.test(storedUrl) && (/\.(?:jpe?g|png|gif|webp|bmp)(?:[?#]|$)/i.test(storedUrl) || /googleusercontent\.com/i.test(storedUrl)) && !/drive\.google\.com\/file\//i.test(storedUrl)) {
      return { status: "SUCCESS", url: storedUrl };
    }
    return { status: "ERROR", message: "The photograph could not be retrieved. Check the Photo File ID and Drive permissions." };
  }
}




/* =====================================================================
 * GitHub Pages JSON API bridge
 * This block is additive. Keep the existing doGet() for Apps Script
 * fallback pages. Only the allowlisted methods below can be called.
 * ===================================================================== */

const NSA_REG_HANDOFF_PREFIX = "NSA_REG_HANDOFF_";
const NSA_REG_HANDOFF_TTL_SECONDS = 120;

function createRegistrationHandoff(registrationToken) {
  const token = String(registrationToken || "").trim();
  if (!token) return { status: "ERROR", message: "Registration session is missing. Please start again." };
  const cache = CacheService.getScriptCache();
  if (!cache.get("REG_" + token) && !cache.get("VERIFIED_" + token)) {
    return { status: "ERROR", message: "Registration session expired. Please restart registration." };
  }
  const handoffCode = Utilities.getUuid().replace(/-/g, "") +
    Utilities.getUuid().replace(/-/g, "").slice(0, 16);
  cache.put(NSA_REG_HANDOFF_PREFIX + handoffCode, token, NSA_REG_HANDOFF_TTL_SECONDS);
  return { status: "SUCCESS", handoffCode: handoffCode, expiresInSeconds: NSA_REG_HANDOFF_TTL_SECONDS };
}

function exchangeRegistrationHandoff(handoffCode) {
  const code = String(handoffCode || "").trim();
  if (!/^[a-f0-9]{48}$/i.test(code)) {
    return { status: "ERROR", message: "The registration handoff is invalid or expired." };
  }
  const cache = CacheService.getScriptCache();
  const key = NSA_REG_HANDOFF_PREFIX + code;
  const token = cache.get(key);
  if (!token) return { status: "ERROR", message: "The registration handoff is invalid or expired. Please restart registration." };
  cache.remove(key);
  return { status: "SUCCESS", token: token };
}

function getRegistrationContact(token) {
  token = String(token || "").trim();

  if (!token) {
    return {
      status: "ERROR",
      message: "Registration session missing."
    };
  }

  const session = getRegistrationSession_(token);

  if (!session) {
    return {
      status: "ERROR",
      message: "Registration session expired. Please start again."
    };
  }

  const personnel = getPersonnelByNSS_(session.nssNumber);

  if (!personnel) {
    return {
      status: "ERROR",
      message: "Personnel record not found."
    };
  }

  const phone = String(personnel.phone || "").trim();
  const email = String(personnel.email || "").trim();

  return {
    status: "SUCCESS",
    delivery: {
      phone: phone,
      email: email
    }
  };
}


function maskPhone_(value) {
  const clean = String(value || "").trim();

  if (!clean) {
    return "";
  }

  if (clean.length <= 4) {
    return clean;
  }

  return clean.slice(0, 3) + "••••" + clean.slice(-2);
}


function maskEmail_(value) {
  const clean = String(value || "").trim();
  const at = clean.indexOf("@");

  if (at <= 0) {
    return "";
  }

  const local = clean.slice(0, at);
  const domain = clean.slice(at + 1);

  if (!domain) {
    return "";
  }

  let visibleLocal = local.slice(
    0,
    Math.min(2, local.length)
  );

  if (local.length > visibleLocal.length) {
    visibleLocal += "••••";
  }

  return visibleLocal + "@" + domain;
}

function requireGatewayAuthentication_(request) {
  const expected = String(
    PropertiesService
      .getScriptProperties()
      .getProperty("NSA_GATEWAY_SHARED_SECRET") || ""
  ).trim();

  if (!expected) {
    throw new Error(
      "Gateway authentication is not configured on the Apps Script backend."
    );
  }

  const supplied = String(
    request && request.gatewaySecret || ""
  ).trim();

  if (!supplied || supplied !== expected) {
    throw new Error("Unauthorized API gateway request.");
  }

  return true;
}

function doPost(e) {
  try {

    /*
     * =========================================================
     * READ REQUEST
     * =========================================================
     */

    const raw =
      e &&
      e.postData &&
      e.postData.contents
        ? e.postData.contents
        : "{}";

    const request = JSON.parse(raw);


    /*
     * =========================================================
     * GATEWAY AUTHENTICATION
     *
     * Only the Cloudflare Worker knows the shared secret.
     * GitHub Pages never receives or stores this secret.
     * =========================================================
     */

    requireGatewayAuthentication_(request);


    /*
     * =========================================================
     * API DISPATCH
     * =========================================================
     */

    let result;


    /*
     * ---------------------------------------------------------
     * GENERIC INVOKE
     *
     * The Cloudflare Worker currently blocks public access to
     * "invoke", but we retain the existing backend behaviour
     * here for trusted/internal requests.
     * ---------------------------------------------------------
     */

    if (request.action === "invoke") {

      result = nsaApiInvoke_(
        String(request.method || ""),
        Array.isArray(request.args)
          ? request.args
          : []
      );

    } else {

      const action =
        String(request.action || "");

      const payload =
        request.payload &&
        typeof request.payload === "object"
          ? request.payload
          : {};


      /*
       * -------------------------------------------------------
       * PERSONNEL PHOTO
       * -------------------------------------------------------
       */

      if (action === "uploadPersonnelPhoto") {

        result =
          uploadPersonnelPhoto(
            nsaValidateRegistrationPhotoPayload_(payload)
          );

      }


      /*
       * -------------------------------------------------------
       * REGISTRATION FORM
       * -------------------------------------------------------
       */

      else if (action === "submitRegistrationForm") {

        result =
          submitRegistrationForm(
            String(payload.token || ""),
            payload.data || {}
          );


        /*
         * Create short-lived receipt access token after
         * successful registration.
         */

        if (
          result &&
          result.status === "SUCCESS" &&
          result.registrationNumber
        ) {

          const receiptToken =
            Utilities.getUuid()
              .replace(/-/g, "") +
            Utilities.getUuid()
              .replace(/-/g, "")
              .slice(0, 16);


          CacheService
            .getScriptCache()
            .put(
              "NSA_RECEIPT_ACCESS_" + receiptToken,
              String(result.registrationNumber),
              600
            );


          result.receiptToken =
            receiptToken;
        }

      }


      /*
       * -------------------------------------------------------
       * REGISTRATION RECEIPT
       * -------------------------------------------------------
       */

      else if (action === "getRegistrationReceipt") {

        result =
          nsaGetRegistrationReceiptAuthorized_(
            String(payload.registrationNumber || ""),
            String(payload.receiptToken || "")
          );

      }


      /*
       * -------------------------------------------------------
       * NORMAL PUBLIC API ACTIONS
       * -------------------------------------------------------
       */

      else {

        const args =
          nsaApiPayloadArgs_(
            action,
            payload
          );


        if (args === null) {
          throw new Error(
            "This API action is not available."
          );
        }


        result =
          nsaApiInvoke_(
            action,
            args
          );
      }
    }


    /*
     * =========================================================
     * RETURN JSON
     * =========================================================
     */

    return ContentService
      .createTextOutput(
        JSON.stringify(
          result == null
            ? null
            : result
        )
      )
      .setMimeType(
        ContentService.MimeType.JSON
      );

  }


  /*
   * ===========================================================
   * ERROR HANDLING
   * ===========================================================
   */

  catch (error) {

    return ContentService
      .createTextOutput(
        JSON.stringify({
          status: "ERROR",
          message:
            error && error.message
              ? error.message
              : "The API request failed."
        })
      )
      .setMimeType(
        ContentService.MimeType.JSON
      );
  }
}

function nsaApiInvoke_(method, args) {
  const allowed = {
  "getApplicationUrl": getApplicationUrl,
  "loginSystemUser": loginSystemUser,
  "validateSession": validateSession,
  "logoutSystemUser": logoutSystemUser,
  "openRegistrationPortal": openRegistrationPortal,
  "sendRegistrationOTP": sendRegistrationOTP,
  "createRegistrationHandoff": createRegistrationHandoff,
  "exchangeRegistrationHandoff": exchangeRegistrationHandoff,
  "getRegistrationContact": getRegistrationContact,
  "confirmRegistrationOTP": confirmRegistrationOTP,
  "confirmEvaluationOTP": confirmEvaluationOTP,
  "resendOTP": resendOTP,
  "loadRegistrationForm": loadRegistrationForm,
  "getEvaluationPrecheck": getEvaluationPrecheck,
  "captureEvaluationSubmission": captureEvaluationSubmission,
  "recordEvaluationLateDecision": recordEvaluationLateDecision,
  "approveLateRegistration": approveLateRegistration,
  "getPersonnelPhotoDataUrl": getPersonnelPhotoDataUrl,
  "getPersonnelProfile": getPersonnelProfile,
  "getAuditLogs": getAuditLogs,
  "getBrandingSettings": getBrandingSettings,
  "getAdminDashboardAnalytics": getAdminDashboardAnalytics,
  "getAllowanceStatistics": getAllowanceStatistics,
  "createBatch": createBatch,
  "getBatchManagementData": getBatchManagementData,
  "toggleBatchStatus": toggleBatchStatus,
  "getActiveBatches": getActiveBatches,
  "generateCertificationRegister": generateCertificationRegister,
  "getCertificationSummary": getCertificationSummary,
  "getCommunicationCampaignHistory": getCommunicationCampaignHistory,
  "getCommunicationsConfig": getCommunicationsConfig,
  "previewCommunicationCampaign": previewCommunicationCampaign,
  "processCommunicationCampaignBatch": processCommunicationCampaignBatch,
  "retryFailedCommunicationCampaign": retryFailedCommunicationCampaign,
  "startCommunicationCampaign": startCommunicationCampaign,
  "getEvaluationCalendars": getEvaluationCalendars,
  "getEvaluationDashboardData": getEvaluationDashboardData,
  "getEvaluationFilters": getEvaluationFilters,
  "getPendingMonthlyEvaluations": getPendingMonthlyEvaluations,
  "getPendingAnnualEvaluations": getPendingAnnualEvaluations,
  "saveMonthlyEvaluationCalendar": saveMonthlyEvaluationCalendar,
  "saveAnnualEvaluationCalendar": saveAnnualEvaluationCalendar,
  "generatePersonnelReport": generatePersonnelReport,
  "generateAllowanceReport": generateAllowanceReport,
  "generateEvaluationReport": generateEvaluationReport,
  "importMasterPersonnel": importMasterPersonnel,
  "previewMasterImport": previewMasterImport,
  "getPersonnelManagementData": getPersonnelManagementData,
  "getAdminSettings": getAdminSettings,
  "getDocumentList": getDocumentList,
  "saveGeneralSettings": saveGeneralSettings,
  "updateEmailConfiguration": updateEmailConfiguration,
  "updateSMSConfiguration": updateSMSConfiguration,
  "uploadOfficialDocument": uploadOfficialDocument,
  "deleteOfficialDocument": deleteOfficialDocument,
  "addSystemUser": addSystemUser,
  "getSystemUsers": getSystemUsers,
  "resetSystemUserPassword": resetSystemUserPassword,
  "toggleUserStatus": toggleUserStatus,
  "syncAgenciesFromMaster": syncAgenciesFromMaster,
  "getAgencyManagementData": getAgencyManagementData,
  "importUserAgencies": importUserAgencies,
  "getAgencyOperationalRegister": getAgencyOperationalRegister,
  "saveAgencyProfile": saveAgencyProfile,
  "activateAgencyAccount": activateAgencyAccount,
  "getAgencyPortalData": getAgencyPortalData,
  "saveAgencyPortalProfile": saveAgencyPortalProfile,
  "saveAgencySupervisor": saveAgencySupervisor,
  "assignAgencySupervisor": assignAgencySupervisor,
  "createAgencyPersonnelRequest": createAgencyPersonnelRequest,
  "reviewAgencyPersonnelRequest": reviewAgencyPersonnelRequest,
  "getAgencyInformationForPersonnel": getAgencyInformationForPersonnel,
  "sendAgencyCommunication": sendAgencyCommunication,
  "sendAgencyInfoOTP": sendAgencyInfoOTP,
  "confirmAgencyInfoOTP": confirmAgencyInfoOTP,
  "getAgencyInfoWithAccess": getAgencyInfoWithAccess,
  "getGeospatialDashboardData": getGeospatialDashboardData,
  "saveAgencyGeolocation": saveAgencyGeolocation,
  "saveMonitoringVisit": saveMonitoringVisit,
  "getAgencyMonitoringHistory": getAgencyMonitoringHistory,
  "getGeospatialFilterOptions": getGeospatialFilterOptions
  };
  if (!Object.prototype.hasOwnProperty.call(allowed, method) || typeof allowed[method] !== "function") {
    throw new Error("This API method is not available.");
  }
  const result = allowed[method].apply(null, args);
  if (method === "openRegistrationPortal" && result && result.status === "SUCCESS") {
    return {
      status: "SUCCESS",
      token: result.token,
      message: "Registration session created."
    };
  }
  return result;
}


function nsaValidateRegistrationPhotoPayload_(payload) {
  const photo = payload.photoData && typeof payload.photoData === "object" ? payload.photoData : payload;
  const token = String(payload.registrationToken || payload.token || "").trim();
  if (!token) throw new Error("Registration session is missing. Please restart registration.");
  const record = CacheService.getScriptCache().get("VERIFIED_" + token);
  if (!record) throw new Error("Registration verification has expired. Please verify again.");
  const master = JSON.parse(record);
  const expectedNss = String(master["NSS Number"] || "").trim().toUpperCase();
  const photoNss = String(photo.nssNumber || "").trim().toUpperCase();
  if (!expectedNss || !photoNss || expectedNss !== photoNss) {
    throw new Error("The passport photo does not match the verified personnel record.");
  }
  if (!String(photo.base64 || "").startsWith("data:image/")) {
    throw new Error("The passport photo data is invalid.");
  }
  return {
    nssNumber: photo.nssNumber,
    base64: photo.base64,
    mimeType: photo.mimeType || "image/jpeg",
    fileName: photo.fileName || "passport.jpg"
  };
}

function nsaGetRegistrationReceiptAuthorized_(registrationNumber, receiptToken) {
  const regNo = String(registrationNumber || "").trim();
  const access = String(receiptToken || "").trim();
  if (!regNo || !access) throw new Error("A valid receipt access token is required.");
  const cache = CacheService.getScriptCache();
  const key = "NSA_RECEIPT_ACCESS_" + access;
  const allowedRegistrationNumber = cache.get(key);
  if (!allowedRegistrationNumber || allowedRegistrationNumber !== regNo) {
    throw new Error("The receipt access token is invalid or expired.");
  }
  const result = getRegistrationReceipt(regNo);
  if (result && result.status === "SUCCESS" && result.receipt) {
    cache.remove(key);
  }
  return result;
}

function nsaApiPayloadArgs_(action, payload) {
  switch (action) {
    case "loginSystemUser": return [payload.email, payload.password];
    case "openRegistrationPortal": return [payload.nssNumber || payload.nss || ""];
    case "sendRegistrationOTP": return [payload.token || payload.registrationToken || ""];
    case "createRegistrationHandoff": return [payload.registrationToken || payload.token || ""];
    case "exchangeRegistrationHandoff": return [payload.handoffCode || ""];
     case "getRegistrationContact": return [payload.token || payload.registrationToken || ""];
    case "confirmRegistrationOTP": return [payload.token || "", payload.otp || ""];
    case "confirmEvaluationOTP": return [payload.token || "", payload.otp || ""];
    case "resendOTP": return [payload.token || "", payload.purpose || "registration"];
    case "loadRegistrationForm": return [payload.token || ""];
    case "getEvaluationPrecheck": return [payload];
    case "captureEvaluationSubmission": return [payload];
    case "recordEvaluationLateDecision": return [payload];
    case "approveLateRegistration": return [payload];
    case "getPersonnelPhotoDataUrl": return [payload.nss || payload.nssNumber || "", payload.token || payload.sessionToken || ""];
    case "getPersonnelProfile": return [payload.nss || payload.nssNumber || "", payload.token || payload.sessionToken || ""];
    case "generatePersonnelReport":
    case "generateAllowanceReport":
    case "generateEvaluationReport":
      return [payload.token || payload.sessionToken || ""];
    case "getPendingMonthlyEvaluations":
    case "getPendingAnnualEvaluations": {
      const filters = payload.filters && typeof payload.filters === "object"
        ? Object.assign({}, payload.filters)
        : Object.assign({}, payload);
      delete filters.token;
      delete filters.sessionToken;
      return [filters, payload.token || payload.sessionToken || ""];
    }
    case "saveMonthlyEvaluationCalendar":
    case "saveAnnualEvaluationCalendar": {
      const data = payload.data && typeof payload.data === "object"
        ? Object.assign({}, payload.data)
        : Object.assign({}, payload);
      delete data.token;
      delete data.sessionToken;
      return [data, payload.token || payload.sessionToken || ""];
    }
    default: return null;
  }
}


/* ============================================================
 * USER AGENCY MANAGEMENT MODULE
 * NSA WAWM DRS | Integrated agency registry and portal
 * Master posting remains authoritative.
 * ============================================================ */

const AGENCY_SHEETS_ = {
  USER_AGENCIES: ["Agency ID","Company Code","Name","Branches","Region","District","Email","Phone Number","Address","GPS","Industry","Paying Status","Company Type","Company Ownership","Category","Status","Date Registered","Head Name","Head Designation","Head Phone","Head WhatsApp","Head Email","Agency Account Email","Account Status","Motivation","Accommodation","Feeding","Extra Allowance","Amenities","Other Benefits","Images","Profile Updated","Created By","Updated By"],
  AGENCY_SUPERVISORS: ["Supervisor ID","Agency ID","Name","Designation","Phone","WhatsApp","Email","Status","Created Date","Created By"],
  AGENCY_ASSIGNMENTS: ["Assignment ID","NSS Number","Agency ID","Supervisor ID","Assigned Date","Assigned By","Status","Notes"],
  AGENCY_REQUESTS: ["Request ID","Agency ID","Batch","Requested Number","Requested Date","Required By","Reason","Status","Decision Notes","Reviewed By","Reviewed Date"],
  AGENCY_AUDIT: ["Date","Actor","Agency ID","Action","Details"],
  AGENCY_GEOLOCATION: ["Agency ID","Latitude","Longitude","GPS Address","Physical Address","Location Source","Accuracy Metres","Verification Status","Verified By","Verified At","Updated At"],
  MONITORING_VISITS: ["Visit ID","Agency ID","Visit Type","Visit Date","Officer","Latitude","Longitude","GPS Accuracy Metres","Personnel Present","Personnel Expected","Attendance Rate","Supervision Status","Welfare Status","Accommodation Status","Feeding Status","Safety Status","Findings","Corrective Actions","Responsible Person","Due Date","Follow-up Status","Evidence URLs","Created At","Created By"],
  MONITORING_ACTIONS: ["Action ID","Visit ID","Agency ID","Action","Responsible Person","Due Date","Status","Closed Date","Closed By","Notes"],
  AGENCY_PHOTOS: ["Photo ID","Agency ID","Photo URL","Caption","Photo Type","Status","Uploaded At","Uploaded By"],
  AGENCY_CONTACTS: ["Contact ID","Agency ID","Name","Designation","Phone","WhatsApp","Email","Contact Type","Is Primary","Status","Created At","Updated At"],
  AGENCY_BRANCHES: ["Branch ID","Agency ID","Branch Name","Region","District","Address","GPS","Latitude","Longitude","Phone","Email","Status","Created At","Updated At"],
  AGENCY_SUPPORT: ["Support ID","Agency ID","Support Type","Description","Value","Eligibility","Effective From","Effective To","Status","Updated By","Updated At"],
  AGENCY_REQUEST_DETAILS: ["Detail ID","Request ID","Position/Role","Quantity","Qualification","Skills","Allowance Type","Notes"],
  POSTING_RECORDS: ["Posting ID","NSS Number","Agency ID","Agency Name At Posting","Batch","Posting Date","Effective Date","Posting Status","Source","Source Reference","Recorded At","Recorded By"],
  POSTING_ACCEPTANCE: ["Acceptance ID","Posting ID","NSS Number","Agency ID","Response","Response Date","Reported Date","Remarks","Evidence URL","Recorded At"],
  SUPERVISORS: ["Supervisor ID","Agency ID","Name","Designation","Phone","WhatsApp","Email","Employee Number","Status","Created At","Updated At"],
  SUPERVISOR_ASSIGNMENTS: ["Assignment ID","NSS Number","Agency ID","Supervisor ID","Start Date","End Date","Status","Assigned By","Assigned At","Notes"],
  SUPERVISOR_EVALUATIONS: ["Evaluation ID","Supervisor ID","Agency ID","Period Start","Period End","Evaluator","Score","Rating","Strengths","Areas for Improvement","Action Plan","Submitted At","Status"],
  AGENCY_INSPECTIONS: ["Inspection ID","Agency ID","Inspection Type","Inspection Date","Inspector","Latitude","Longitude","GPS Accuracy","Personnel Expected","Personnel Present","Attendance Rate","Supervision Rating","Welfare Rating","Safety Rating","Findings","Recommendations","Due Date","Status","Evidence URLs","Created At"],
  AGENCY_COMPLAINTS: ["Complaint ID","Agency ID","NSS Number","Complainant Role","Category","Priority","Subject","Description","Assigned To","Status","Resolution","Restricted","Submitted At","Updated At","Closed At"],
  AGENCY_COMMUNICATIONS: ["Communication ID","Agency ID","Audience","Channel","Subject","Message","Recipient Count","Sent Count","Failed Count","Status","Created By","Created At"],
  AGENCY_USERS: ["Agency User ID","Agency ID","Name","Email","Phone","Role","Account Status","Last Login","Created At","Created By"],
  AGENCY_AUDIT_LOG: ["Audit ID","Timestamp","Actor","Actor Role","Agency ID","Action","Entity Type","Entity ID","Details","IP/Device"],
  AGENCY_BENEFITS_HISTORY: ["History ID","Agency ID","Field","Old Value","New Value","Effective Date","Changed By","Changed At"],
  AGENCY_GEOLOCATION_HISTORY: ["Location History ID","Agency ID","Latitude","Longitude","GPS Address","Source","Accuracy Metres","Verified By","Captured At"],
  PERSONNEL_REPORTING: ["Reporting ID","NSS Number","Agency ID","Report Status","Expected Date","Actual Report Date","Confirmed By","Remarks","Evidence URL","Created At"],
  PERSONNEL_ATTENDANCE: ["Attendance ID","NSS Number","Agency ID","Supervisor ID","Attendance Date","Status","Check In","Check Out","Remarks","Recorded By","Recorded At"],
  AGENCY_VISIT_EVIDENCE: ["Evidence ID","Inspection ID","Agency ID","File URL","File Type","Caption","Uploaded By","Uploaded At"],
  AGENCY_ACTION_TRACKER: ["Action ID","Agency ID","Related Type","Related ID","Action Required","Responsible Person","Due Date","Priority","Status","Completion Notes","Created At","Closed At"],
  AGENCY_DOCUMENTS: ["Document ID","Agency ID","Document Type","Title","File URL","Issue Date","Expiry Date","Status","Uploaded By","Uploaded At"],
  AGENCY_NOTIFICATION_LOG: ["Notification ID","Agency ID","Recipient Type","Recipient","Channel","Subject","Message","Delivery Status","Provider Reference","Sent At"]
};

function ensureAgencySheets_() {
  const db = getDatabase();
  Object.keys(AGENCY_SHEETS_).forEach(function(name) {
    let sh = db.getSheetByName(name);
    if (!sh) sh = db.insertSheet(name);
    const lastCol = sh.getLastColumn();
    const current = lastCol ? sh.getRange(1,1,1,lastCol).getDisplayValues()[0] : [];
    AGENCY_SHEETS_[name].forEach(function(h) {
      if (current.indexOf(h) < 0) sh.getRange(1, sh.getLastColumn()+1).setValue(h);
    });
  });
}

function agencyHeaderMap_(sheet) {
  const headers = sheet.getRange(1,1,1,sheet.getLastColumn()).getDisplayValues()[0];
  const map = {};
  headers.forEach(function(h,i){ map[String(h).trim()] = i; });
  return map;
}
function agencyRows_(name) {
  ensureAgencySheets_();
  return getSheetObjects_(name);
}
function agencyAppend_(name, object) {
  const sh = getDatabase().getSheetByName(name);
  const map = agencyHeaderMap_(sh);
  const row = new Array(sh.getLastColumn()).fill("");
  Object.keys(object || {}).forEach(function(k){ if (map[k] !== undefined) row[map[k]] = object[k]; });
  sh.appendRow(row);
}
function agencyUpdateById_(name, idHeader, id, patch) {
  const sh = getDatabase().getSheetByName(name);
  const values = sh.getDataRange().getValues();
  const headers = values[0].map(String);
  const idCol = headers.indexOf(idHeader);
  if (idCol < 0) throw new Error("Missing identifier column in " + name);
  for (let r=1;r<values.length;r++) {
    if (String(values[r][idCol]) !== String(id)) continue;
    Object.keys(patch || {}).forEach(function(k){
      const c=headers.indexOf(k);
      if(c>=0) sh.getRange(r+1,c+1).setValue(patch[k]);
    });
    return true;
  }
  return false;
}
function agencyNormalise_(v) { return String(v == null ? "" : v).trim().toLowerCase().replace(/\s+/g," "); }
function agencyIdForName_(name) {
  const key=agencyNormalise_(name);
  const found=agencyRows_("USER_AGENCIES").filter(function(a){return agencyNormalise_(a.Name)===key;})[0];
  return found ? String(found["Agency ID"]) : "";
}
function agencyLog_(actor, agencyId, action, details) {
  agencyAppend_("AGENCY_AUDIT", {Date:new Date(),Actor:actor||"system", "Agency ID":agencyId||"",Action:action,Details:details||""});
}
function requireAgencySecretariat_(token) {
  const session=validateSession(token);
  if(!session || session.valid!==true) throw new Error("Your session is invalid or expired.");
  if(String(session.role||"").toUpperCase()!=="AGENCY SECRETARIAT") throw new Error("Agency Secretariat access is required.");
  const agency=agencyRows_("USER_AGENCIES").filter(function(a){
    return agencyNormalise_(a["Agency Account Email"])===agencyNormalise_(session.email) && String(a["Account Status"]).toUpperCase()==="ACTIVE";
  })[0];
  if(!agency) throw new Error("This account is not linked to an active agency.");
  return {session:session, agency:agency};
}
function agencySafeProfile_(a) {
  return {
    agencyId:a["Agency ID"], companyCode:a["Company Code"], name:a.Name, branches:a.Branches,
    region:a.Region,district:a.District,email:a.Email,phone:a["Phone Number"],address:a.Address,gps:a.GPS,
    industry:a.Industry,payingStatus:a["Paying Status"],companyType:a["Company Type"],
    ownership:a["Company Ownership"],category:a.Category,status:a.Status,dateRegistered:a["Date Registered"],
    head:{name:a["Head Name"],designation:a["Head Designation"],phone:a["Head Phone"],whatsapp:a["Head WhatsApp"],email:a["Head Email"]},
    motivation:a.Motivation, accommodation:a.Accommodation,feeding:a.Feeding,extraAllowance:a["Extra Allowance"],
    amenities:a.Amenities,otherBenefits:a["Other Benefits"],images:a.Images,accountStatus:a["Account Status"]
  };
}
function syncAgenciesFromMaster(token) {
  const session=requireAdminSession_(token,["ADMIN"]);
  ensureAgencySheets_();
  const master=getDatabase().getSheetByName("MASTER_PERSONNEL");
  if(!master || master.getLastRow()<2) return {status:"SUCCESS",added:0,matched:0,message:"No master personnel records found."};
  const headers=master.getRange(1,1,1,master.getLastColumn()).getDisplayValues()[0];
  const rows=master.getRange(2,1,master.getLastRow()-1,master.getLastColumn()).getValues();
  function col(aliases){ for(let i=0;i<headers.length;i++){const n=agencyNormalise_(headers[i]).replace(/[^a-z0-9]/g,"");if(aliases.indexOf(n)>=0)return i;}return -1; }
  const posting=col(["companypostedto","placeofposting"]);
  const region=col(["regionpostedto","region"]);
  const district=col(["districtpostedto","district"]);
  if(posting<0) throw new Error('MASTER_PERSONNEL must contain "Company Posted To" or "Place of Posting".');
  const known={}; agencyRows_("USER_AGENCIES").forEach(function(a){known[agencyNormalise_(a.Name)]=true;});
  const found={};
  rows.forEach(function(r){
    const name=String(r[posting]||"").trim(); if(!name)return;
    const k=agencyNormalise_(name);
    if(!found[k]) found[k]={name:name,region:region>=0?String(r[region]||""):"",district:district>=0?String(r[district]||""):""};
  });
  let added=0;
  Object.keys(found).forEach(function(k){
    if(known[k])return;
    const x=found[k], id=generateID_("AGY");
    agencyAppend_("USER_AGENCIES",{
      "Agency ID":id,"Company Code":id,"Name":x.name,Branches:1,Region:x.region,District:x.district,
      Status:"Pending Completion","Date Registered":new Date(),"Account Status":"NOT ACTIVATED",
      "Created By":session.email,"Profile Updated":"No"
    });
    added++;
  });
  agencyLog_(session.email,"","MASTER_SYNC","Added "+added+" newly identified agencies from MASTER_PERSONNEL.");
  return {status:"SUCCESS",added:added,matched:Object.keys(found).length,message:added+" new agencies added for profile completion."};
}
function getAgencyManagementData(filters, token) {
  const session=requireAdminSession_(token,["ADMIN"]);
  ensureAgencySheets_(); filters=filters||{};
  const q=agencyNormalise_(filters.search||"");
  let agencies=agencyRows_("USER_AGENCIES");
  if(q) agencies=agencies.filter(function(a){return [a.Name,a["Company Code"],a.Region,a.District,a.Email,a.Status].some(function(v){return agencyNormalise_(v).indexOf(q)>=0;});});
  const master=getSheetObjects_("MASTER_PERSONNEL"), registered=getSheetObjects_("REGISTERED_PERSONNEL");
  const supervisors=agencyRows_("AGENCY_SUPERVISORS"), assignments=agencyRows_("AGENCY_ASSIGNMENTS"), requests=agencyRows_("AGENCY_REQUESTS");
  const enriched=agencies.map(function(a){
    const nm=agencyNormalise_(a.Name), aid=String(a["Agency ID"]);
    const posted=master.filter(function(p){return agencyNormalise_(p["Company Posted To"]||p["Place of Posting"])===nm;});
    const acceptedNss={}; registered.forEach(function(p){acceptedNss[String(p["NSS Number"]||"").trim().toUpperCase()]=true;});
    const accepted=posted.filter(function(p){return !!acceptedNss[String(p["NSS Number"]||"").trim().toUpperCase()];});
    return Object.assign(agencySafeProfile_(a),{postedCount:posted.length,acceptedCount:accepted.length,
      supervisors:supervisors.filter(function(s){return String(s["Agency ID"])===aid;}).length,
      assignedCount:assignments.filter(function(x){return String(x["Agency ID"])===aid&&String(x.Status).toUpperCase()==="ACTIVE";}).length,
      requests:requests.filter(function(x){return String(x["Agency ID"])===aid;}).length});
  });
  return {status:"SUCCESS",agencies:serialiseAdminValue_(enriched),summary:{
    total:agencies.length,active:agencies.filter(function(a){return String(a["Account Status"]).toUpperCase()==="ACTIVE";}).length,
    pending:agencies.filter(function(a){return String(a.Status).toUpperCase()!=="APPROVED";}).length,
    posted:enriched.reduce(function(n,a){return n+a.postedCount;},0),accepted:enriched.reduce(function(n,a){return n+a.acceptedCount;},0)
  },requests:serialiseAdminValue_(requests),batches:getActiveBatches()};
}
function saveAgencyProfile(data, token) {
  const session=requireAdminSession_(token,["ADMIN"]); ensureAgencySheets_(); data=data||{};
  const id=String(data.agencyId||"").trim(); if(!id) throw new Error("Agency ID is required.");
  const allowed=["Company Code","Name","Branches","Region","District","Email","Phone Number","Address","GPS","Industry","Paying Status","Company Type","Company Ownership","Category","Status","Date Registered","Head Name","Head Designation","Head Phone","Head WhatsApp","Head Email","Motivation","Accommodation","Feeding","Extra Allowance","Amenities","Other Benefits","Images"];
  const patch={}; allowed.forEach(function(k){if(data[k]!==undefined)patch[k]=String(data[k]).trim();});
  if(patch.Name && agencyRows_("USER_AGENCIES").some(function(a){return String(a["Agency ID"])!==id&&agencyNormalise_(a.Name)===agencyNormalise_(patch.Name);})) throw new Error("An agency with this name already exists.");
  patch["Profile Updated"]=new Date();patch["Updated By"]=session.email;
  if(!agencyUpdateById_("USER_AGENCIES","Agency ID",id,patch)) throw new Error("Agency not found.");
  agencyLog_(session.email,id,"PROFILE_UPDATED","Agency profile updated.");
  return {status:"SUCCESS",message:"Agency profile saved."};
}
function activateAgencyAccount(agencyId, token) {
  const session=requireAdminSession_(token,["ADMIN"]); ensureAgencySheets_();
  const a=agencyRows_("USER_AGENCIES").filter(function(x){return String(x["Agency ID"])===String(agencyId);})[0];
  if(!a) throw new Error("Agency not found.");
  const email=String(a["Head Email"]||a.Email||"").trim().toLowerCase();
  const name=String(a["Head Name"]||a.Name||"").trim();
  if(!email||!/@/.test(email)) throw new Error("Complete a valid head/contact email before activation.");
  if(!String(a["Head Name"]||"").trim()) throw new Error("Complete the head/contact person's name before activation.");
  if(String(a.Status||"").toUpperCase()!=="APPROVED") throw new Error("Approve the agency profile before activating its portal account.");
  const users=getDatabase().getSheetByName("USERS"), vals=users.getDataRange().getValues();
  const exists=vals.slice(1).some(function(r){return agencyNormalise_(r[2])===agencyNormalise_(email);});
  if(exists) throw new Error("A system account already uses this email. Resolve the account conflict before activation.");
  const temp=Utilities.getUuid().replace(/-/g,"").slice(0,16)+"Aa9!";
  users.appendRow([generateID_("USR"),name,email,hashUserPassword_(temp),"AGENCY SECRETARIAT","ACTIVE",new Date()]);
  agencyUpdateById_("USER_AGENCIES","Agency ID",agencyId,{"Agency Account Email":email,"Account Status":"ACTIVE"});
  agencyLog_(session.email,agencyId,"ACCOUNT_ACTIVATED","Agency portal account activated for "+email);
  const message="Your NSA WAWM agency portal account has been activated. Login email: "+email+"\nTemporary password: "+temp+"\nPlease sign in and change your password immediately.";
  try { if(typeof sendEmail_==="function") sendEmail_(email,"NSA WAWM Agency Portal Access",message); } catch(e) { Logger.log("Agency activation email failed: "+e.message); }
  return {status:"SUCCESS",message:"Agency account activated. A temporary password was generated and emailed where email delivery is configured.",temporaryPassword:temp,email:email};
}
function getAgencyPortalData(token) {
  const ctx=requireAgencySecretariat_(token), a=ctx.agency, aid=String(a["Agency ID"]);
  const supervisors=agencyRows_("AGENCY_SUPERVISORS").filter(function(s){return String(s["Agency ID"])===aid;});
  const assignments=agencyRows_("AGENCY_ASSIGNMENTS").filter(function(x){return String(x["Agency ID"])===aid&&String(x.Status).toUpperCase()==="ACTIVE";});
  const reg=getSheetObjects_("REGISTERED_PERSONNEL"), master=getSheetObjects_("MASTER_PERSONNEL");
  const people=master.filter(function(p){return agencyNormalise_(p["Company Posted To"]||p["Place of Posting"])===agencyNormalise_(a.Name);}).map(function(p){
    const nss=String(p["NSS Number"]||"").trim();
    const accepted=reg.filter(function(r){return String(r["NSS Number"]||"").trim()===nss;})[0]||{};
    const assignment=assignments.filter(function(x){return String(x["NSS Number"])===nss;})[0]||{};
    const supervisor=supervisors.filter(function(s){return String(s["Supervisor ID"])===String(assignment["Supervisor ID"]);})[0]||{};
    return {nss:nss,name:[p["Other Names"],p["Last Name"]].filter(Boolean).join(" "),batch:p.Batch,course:p.Course,phone:accepted["Phone Number"]||p["Phone Number"],email:accepted.Email||p.Email,accepted:!!accepted["NSS Number"],supervisorId:assignment["Supervisor ID"]||"",supervisorName:supervisor.Name||"",supervisorPhone:supervisor.Phone||"",supervisorWhatsApp:supervisor.WhatsApp||"",supervisorEmail:supervisor.Email||""};
  });
  const requests=agencyRows_("AGENCY_REQUESTS").filter(function(x){return String(x["Agency ID"])===aid;});
  return {status:"SUCCESS",agency:agencySafeProfile_(a),personnel:serialiseAdminValue_(people),supervisors:serialiseAdminValue_(supervisors),requests:serialiseAdminValue_(requests),batches:serialiseAdminValue_(getActiveBatches())};
}
function saveAgencyPortalProfile(data, token) {
  const ctx=requireAgencySecretariat_(token), a=ctx.agency; data=data||{};
  const allowed=["Head Name","Head Designation","Head Phone","Head WhatsApp","Head Email","Phone Number","Email","Address","GPS","Motivation","Accommodation","Feeding","Extra Allowance","Amenities","Other Benefits","Images"];
  const patch={}; allowed.forEach(function(k){if(data[k]!==undefined)patch[k]=String(data[k]).trim();});
  patch["Profile Updated"]=new Date();patch["Updated By"]=ctx.session.email;
  agencyUpdateById_("USER_AGENCIES","Agency ID",a["Agency ID"],patch);
  agencyLog_(ctx.session.email,a["Agency ID"],"AGENCY_SELF_UPDATE","Agency profile and facilities updated.");
  return {status:"SUCCESS",message:"Agency profile updated."};
}
function saveAgencySupervisor(data, token) {
  const ctx=requireAgencySecretariat_(token), a=ctx.agency; data=data||{};
  const name=String(data.name||"").trim(),designation=String(data.designation||"").trim();
  if(!name||!designation||!String(data.phone||"").trim()) throw new Error("Supervisor name, designation and phone are required.");
  const id=String(data.supervisorId||"").trim()||generateID_("SUP");
  const record={"Supervisor ID":id,"Agency ID":a["Agency ID"],Name:name,Designation:designation,Phone:String(data.phone||""),WhatsApp:String(data.whatsapp||""),Email:String(data.email||""),Status:"ACTIVE","Created Date":new Date(),"Created By":ctx.session.email};
  const existing=agencyRows_("AGENCY_SUPERVISORS").filter(function(s){return String(s["Supervisor ID"])===id&&String(s["Agency ID"])===String(a["Agency ID"]);})[0];
  if(existing) agencyUpdateById_("AGENCY_SUPERVISORS","Supervisor ID",id,record); else agencyAppend_("AGENCY_SUPERVISORS",record);
  agencyLog_(ctx.session.email,a["Agency ID"],"SUPERVISOR_SAVED",name+" / "+designation);
  return {status:"SUCCESS",supervisorId:id,message:"Supervisor saved."};
}
function assignAgencySupervisor(nss, supervisorId, token) {
  const ctx=requireAgencySecretariat_(token), a=ctx.agency;
  const key=String(nss||"").trim(), sid=String(supervisorId||"").trim();
  if(!key||!sid) throw new Error("Select a personnel record and supervisor.");
  const master=findMasterPersonnel_(key);
  if(!master||agencyNormalise_(master["Company Posted To"]||master["Place of Posting"])!==agencyNormalise_(a.Name)) throw new Error("This personnel is not officially posted to your agency in MASTER_PERSONNEL.");
  const supervisor=agencyRows_("AGENCY_SUPERVISORS").filter(function(s){return String(s["Supervisor ID"])===sid&&String(s["Agency ID"])===String(a["Agency ID"])&&String(s.Status).toUpperCase()==="ACTIVE";})[0];
  if(!supervisor) throw new Error("The selected supervisor is not active under this agency.");
  const sh=getDatabase().getSheetByName("AGENCY_ASSIGNMENTS"), rows=sh.getDataRange().getValues(), h=rows[0].map(String);
  const nssCol=h.indexOf("NSS Number"),agencyCol=h.indexOf("Agency ID"),statusCol=h.indexOf("Status");
  for(let i=1;i<rows.length;i++) if(String(rows[i][nssCol])===key&&String(rows[i][agencyCol])===String(a["Agency ID"])&&String(rows[i][statusCol]).toUpperCase()==="ACTIVE") sh.getRange(i+1,statusCol+1).setValue("REASSIGNED");
  agencyAppend_("AGENCY_ASSIGNMENTS",{"Assignment ID":generateID_("ASN"),"NSS Number":key,"Agency ID":a["Agency ID"],"Supervisor ID":sid,"Assigned Date":new Date(),"Assigned By":ctx.session.email,Status:"ACTIVE"});
  agencyLog_(ctx.session.email,a["Agency ID"],"SUPERVISOR_ASSIGNED",key+" assigned to "+supervisor.Name);
  return {status:"SUCCESS",message:"Supervisor assigned."};
}
function createAgencyPersonnelRequest(data, token) {
  const ctx=requireAgencySecretariat_(token),a=ctx.agency;data=data||{};
  const batch=String(data.batch||"").trim(),qty=Math.floor(Number(data.quantity));
  if(!batch||!qty||qty<1||qty>5000) throw new Error("Select an eligible batch and enter a valid requested number.");
  const b=getActiveBatches().filter(function(x){return String(x.batch||x["Batch Name"]||"")===batch;})[0];
  if(!b) throw new Error("The selected batch is not active.");
  const rawStart=String(b.startDate||b["Start Date"]||"");
  const parts=rawStart.split("/");
  const start=parts.length===3?new Date(Number(parts[2]),Number(parts[1])-1,Number(parts[0])):new Date(rawStart);
  if(isNaN(start.getTime())) throw new Error("The selected batch does not have a valid service start date.");
  if(start<=new Date()) throw new Error("Requests are limited to batches whose service start date has not yet arrived.");
  const id=generateID_("REQ");
  agencyAppend_("AGENCY_REQUESTS",{"Request ID":id,"Agency ID":a["Agency ID"],Batch:batch,"Requested Number":qty,"Requested Date":new Date(),"Required By":data.requiredBy||"","Reason":String(data.reason||""),Status:"SUBMITTED"});
  agencyLog_(ctx.session.email,a["Agency ID"],"PERSONNEL_REQUEST_SUBMITTED",batch+" / "+qty);
  return {status:"SUCCESS",requestId:id,message:"Personnel request submitted for Secretariat review."};
}
function reviewAgencyPersonnelRequest(requestId,decision,notes,token) {
  const session=requireAdminSession_(token,["ADMIN"]),d=String(decision||"").toUpperCase();
  if(["APPROVED","REJECTED","FULFILLED"].indexOf(d)<0) throw new Error("Invalid request decision.");
  const ok=agencyUpdateById_("AGENCY_REQUESTS","Request ID",requestId,{Status:d,"Decision Notes":String(notes||""),"Reviewed By":session.email,"Reviewed Date":new Date()});
  if(!ok) throw new Error("Request not found.");
  agencyLog_(session.email,"","REQUEST_"+d,String(requestId)+" "+String(notes||""));
  return {status:"SUCCESS",message:"Request decision saved."};
}
function getAgencyInformationForPersonnel(nss, token) {
  // Access is restricted to a valid signed-in Secretariat/admin session in this release.
  // The personnel-facing card is returned through the authorised personnel profile workflow.
  const session=validateSession(token);
  if(!session||session.valid!==true) throw new Error("Please sign in to view agency information.");
  const role=String(session.role||"").toUpperCase();
  if(["ADMIN","SUPER ADMIN"].indexOf(role)<0) throw new Error("You are not authorised to view this personnel agency record.");
  const person=findRegisteredPersonnel_(String(nss||"").trim());
  if(!person) throw new Error("Registered personnel record not found.");
  const agency=agencyRows_("USER_AGENCIES").filter(function(a){return agencyNormalise_(a.Name)===agencyNormalise_(person["Company Posted To"]||person.Institution);})[0];
  if(!agency) return {status:"SUCCESS",agency:null,message:"Agency profile has not yet been completed."};
  const assignment=agencyRows_("AGENCY_ASSIGNMENTS").filter(function(x){return String(x["NSS Number"])===String(nss)&&String(x.Status).toUpperCase()==="ACTIVE";})[0];
  const supervisor=assignment?agencyRows_("AGENCY_SUPERVISORS").filter(function(s){return String(s["Supervisor ID"])===String(assignment["Supervisor ID"]);})[0]:null;
  const postedCount=getSheetObjects_("MASTER_PERSONNEL").filter(function(p){return agencyNormalise_(p["Company Posted To"]||p["Place of Posting"])===agencyNormalise_(agency.Name);}).length;
  const agencyInfo=agencySafeProfile_(agency);agencyInfo.postedCount=postedCount;
  return {status:"SUCCESS",agency:agencyInfo,supervisor:supervisor||null};
}


/* ============================================================
 * GEOSPATIAL PERSONNEL MONITORING MODULE
 * Uses the existing DRS spreadsheet and authoritative personnel
 * records. All service-status calculations use Ghana local date.
 * ============================================================ */
function gisToday_() {
  const tz = Session.getScriptTimeZone() || "Africa/Accra";
  return Utilities.formatDate(new Date(), tz, "yyyy-MM-dd");
}
function gisDateKey_(v) {
  if (!v) return "";
  let d = v instanceof Date ? v : new Date(v);
  if (isNaN(d.getTime())) {
    const s = String(v).trim(), m = s.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
    if (m) d = new Date(Number(m[3]), Number(m[2])-1, Number(m[1]));
  }
  if (isNaN(d.getTime())) return "";
  return Utilities.formatDate(d, Session.getScriptTimeZone() || "Africa/Accra", "yyyy-MM-dd");
}
function gisStatus_(start, end, today) {
  const s = gisDateKey_(start), e = gisDateKey_(end);
  if (!s || !e) return "DATE_REVIEW";
  if (e < today) return "COMPLETED";
  if (s > today) return "UPCOMING";
  return "ACTIVE";
}
function gisCoordinates_(agency, geo) {
  let lat = geo ? Number(geo.Latitude) : NaN, lng = geo ? Number(geo.Longitude) : NaN;
  if (!isFinite(lat) || !isFinite(lng)) {
    const raw = String((geo && geo.GPS) || agency.GPS || "").trim();
    const m = raw.match(/^\s*(-?\d+(?:\.\d+)?)\s*[,; ]\s*(-?\d+(?:\.\d+)?)\s*$/);
    if (m) { lat = Number(m[1]); lng = Number(m[2]); }
  }
  if (!isFinite(lat) || !isFinite(lng) || Math.abs(lat)>90 || Math.abs(lng)>180) return null;
  return {lat:lat,lng:lng};
}
function gisAgencyGeo_(agencyId) {
  const rows = agencyRows_("AGENCY_GEOLOCATION");
  return rows.filter(function(x){return String(x["Agency ID"])===String(agencyId);})[0] || null;
}
function gisCurrentPersonnel_() {
  const today = gisToday_();
  const master = getSheetObjects_("MASTER_PERSONNEL");
  const registered = getSheetObjects_("REGISTERED_PERSONNEL");
  const regByNss = {};
  registered.forEach(function(p){ const k=String(p["NSS Number"]||"").trim().toUpperCase(); if(k) regByNss[k]=p; });
  return master.map(function(m){
    const nss=String(m["NSS Number"]||"").trim().toUpperCase();
    if(!nss) return null;
    const reg=regByNss[nss]||{};
    const start=m["Service Start Date"]||reg["Service Start Date"]||m["Start Date"]||"";
    const end=m["Service End Date"]||reg["Service End Date"]||m["End Date"]||"";
    const status=gisStatus_(start,end,today);
    const posting=String(m["Company Posted To"]||m["Place of Posting"]||reg["Place of Posting"]||"").trim();
    if(!posting) return null;
    return {
      nss:nss,name:String(reg["Full Name"]||[m["Other Names"],m["Last Name"]].filter(Boolean).join(" ")||m["Full Name"]||"Unknown"),
      registrationNumber:String(reg["Registration Number"]||""),batch:String(m.Batch||reg.Batch||""),
      allowanceType:String(m["Allowance Type"]||reg["Allowance Type"]||""),
      serviceStartDate:gisDateKey_(start),serviceEndDate:gisDateKey_(end),serviceStatus:status,
      industry:String(m.Industry||""),phone:String(reg["Phone Number"]||m["Phone Number"]||""),
      email:String(reg.Email||m.Email||""),photoUrl:String(reg["Photo URL"]||""),
      posting:posting,accepted:!!reg["Registration Number"],district:String(m["District Posted To"]||reg["District Posted"]||"")
    };
  }).filter(Boolean);
}


function migrateAgencyLegacyRecords_(){
  ensureAgencySheets_();
  const contacts=agencyRows_("AGENCY_CONTACTS"), supervisors=agencyRows_("SUPERVISORS"), assignments=agencyRows_("SUPERVISOR_ASSIGNMENTS"), requests=agencyRows_("AGENCY_REQUESTS");
  const seenContacts={};contacts.forEach(x=>seenContacts[String(x["Agency ID"])+"|"+String(x.Email||"").toLowerCase()]=true);
  agencyRows_("USER_AGENCIES").forEach(a=>{const key=String(a["Agency ID"])+"|"+String(a["Head Email"]||"").toLowerCase();if(a["Head Name"]&&!seenContacts[key]){agencyAppend_("AGENCY_CONTACTS",{"Contact ID":"CT-"+Utilities.getUuid().slice(0,12),"Agency ID":a["Agency ID"],Name:a["Head Name"],Designation:a["Head Designation"],Phone:a["Head Phone"],WhatsApp:a["Head WhatsApp"],Email:a["Head Email"],"Contact Type":"HEAD / PRIMARY", "Is Primary":"YES",Status:"ACTIVE","Created At":new Date(),"Updated At":new Date()});seenContacts[key]=true;}});
  const supSeen={};supervisors.forEach(x=>supSeen[String(x["Supervisor ID"])]=true);
  agencyRows_("AGENCY_SUPERVISORS").forEach(x=>{if(!supSeen[String(x["Supervisor ID"])])agencyAppend_("SUPERVISORS",{"Supervisor ID":x["Supervisor ID"],"Agency ID":x["Agency ID"],Name:x.Name,Designation:x.Designation,Phone:x.Phone,WhatsApp:x.WhatsApp,Email:x.Email,Status:x.Status,"Created At":x["Created Date"],"Updated At":new Date()});});
  const asSeen={};assignments.forEach(x=>asSeen[String(x["Assignment ID"])]=true);
  agencyRows_("AGENCY_ASSIGNMENTS").forEach(x=>{if(!asSeen[String(x["Assignment ID"])])agencyAppend_("SUPERVISOR_ASSIGNMENTS",{"Assignment ID":x["Assignment ID"],"NSS Number":x["NSS Number"],"Agency ID":x["Agency ID"],"Supervisor ID":x["Supervisor ID"],"Start Date":x["Assigned Date"],Status:x.Status,"Assigned By":x["Assigned By"],"Assigned At":x["Assigned Date"],Notes:x.Notes});});
}

/* ===== Agency file import and schema inventory ===== */
function importUserAgencies(rows, token) {
  const session=requireAdminSession_(token,["ADMIN","SUPER ADMIN"]);
  if(!Array.isArray(rows)||!rows.length)throw new Error("The upload contains no agency rows.");
  if(rows.length>5000)throw new Error("Upload is limited to 5,000 agency rows per import.");
  const lock=LockService.getScriptLock();lock.waitLock(30000);
  try {
    ensureAgencySheets_();const existing=agencyRows_("USER_AGENCIES"),byCode={},byName={};
    existing.forEach(a=>{if(a["Company Code"])byCode[agencyNormalise_(a["Company Code"])]=a;if(a.Name)byName[agencyNormalise_(a.Name)]=a;});
    const aliases={"company code":"Company Code","code":"Company Code","name":"Name","company name":"Name","branches":"Branches","branch count":"Branches","region":"Region","district":"District","email":"Email","official email":"Email","phone number":"Phone Number","phone":"Phone Number","address":"Address","gps":"GPS","gps address":"GPS","industry":"Industry","paying status":"Paying Status","paying":"Paying Status","company type":"Company Type","company ownership":"Company Ownership","ownership":"Company Ownership","category":"Category","status":"Status","date registered":"Date Registered"};
    let added=0,updated=0,skipped=0;
    rows.forEach(raw=>{const obj={};Object.keys(raw||{}).forEach(k=>{const h=aliases[String(k).trim().toLowerCase()];if(h)obj[h]=raw[k];});const name=String(obj.Name||"").trim();if(!name){skipped++;return;}const code=String(obj["Company Code"]||"").trim(),old=(code&&byCode[agencyNormalise_(code)])||byName[agencyNormalise_(name)];
      if(old){const patch={};Object.keys(obj).forEach(k=>{if(String(obj[k]||"").trim()!=="")patch[k]=obj[k];});patch["Updated By"]=session.email;agencyUpdateById_("USER_AGENCIES","Agency ID",old["Agency ID"],patch);const merged=Object.assign({},old,patch);if(code)byCode[agencyNormalise_(code)]=merged;byName[agencyNormalise_(name)]=merged;updated++;}
      else{obj["Agency ID"]="AG-"+Utilities.getUuid().replace(/-/g,"").slice(0,14).toUpperCase();obj.Status=obj.Status||"Pending Completion";obj["Account Status"]="NOT ACTIVATED";obj["Date Registered"]=obj["Date Registered"]||new Date();obj["Created By"]=session.email;obj["Updated By"]=session.email;agencyAppend_("USER_AGENCIES",obj);const created=Object.assign({},obj);if(code)byCode[agencyNormalise_(code)]=created;byName[agencyNormalise_(name)]=created;added++;}
    });
    agencyLog_(session.email,"","AGENCY_FILE_IMPORT","Added "+added+", updated "+updated+", skipped "+skipped+" of "+rows.length+" rows.");return {status:"SUCCESS",total:rows.length,added,updated,skipped,message:"Agency import completed."};
  } finally {lock.releaseLock();}
}
function getAgencyOperationalRegister(token){requireAdminSession_(token,["ADMIN","SUPER ADMIN"]);ensureAgencySheets_();const counts={};Object.keys(AGENCY_SHEETS_).forEach(n=>counts[n]=Math.max(0,getDatabase().getSheetByName(n).getLastRow()-1));return {status:"SUCCESS",tables:counts,agencyCount:counts.USER_AGENCIES||0,generatedAt:new Date()};}

function getGeospatialFilterOptions(token) {
  requireAdminSession_(token, ["ADMIN","SUPER ADMIN"]);
  const agencies=agencyRows_("USER_AGENCIES"), people=gisCurrentPersonnel_();
  function unique(a){return Array.from(new Set(a.filter(function(x){return String(x||"").trim();}))).sort();}
  return {status:"SUCCESS",industries:unique(agencies.map(x=>x.Industry)),regions:unique(agencies.map(x=>x.Region)),
    districts:unique(agencies.map(x=>x.District)),categories:unique(agencies.map(x=>x.Category)),
    ownerships:unique(agencies.map(x=>x["Company Ownership"])),payingStatuses:unique(agencies.map(x=>x["Paying Status"])),
    batches:unique(people.map(x=>x.batch)),allowanceTypes:unique(people.map(x=>x.allowanceType)),
    serviceYears:unique(people.map(x=>x.serviceStartDate ? x.serviceStartDate.slice(0,4) : ""))};
}
function getGeospatialDashboardData(token, filters) {
  requireAdminSession_(token, ["ADMIN","SUPER ADMIN"]);
  ensureAgencySheets_(); filters=filters||{};
  const agencies=agencyRows_("USER_AGENCIES"), people=gisCurrentPersonnel_(), today=gisToday_();
  const norm=agencyNormalise_;
  const selected = agencies.filter(function(a){
    const checks=[["region","Region"],["district","District"],["industry","Industry"],["category","Category"],["ownership","Company Ownership"],["payingStatus","Paying Status"]];
    return checks.every(function(c){return !filters[c[0]] || norm(a[c[1]])===norm(filters[c[0]]);});
  });
  const result=selected.map(function(a){
    const aid=String(a["Agency ID"]), geo=gisAgencyGeo_(aid), coords=gisCoordinates_(a,geo);
    const list=people.filter(function(p){return norm(p.posting)===norm(a.Name);});
    const active=list.filter(p=>p.serviceStatus==="ACTIVE"), upcoming=list.filter(p=>p.serviceStatus==="UPCOMING"), completed=list.filter(p=>p.serviceStatus==="COMPLETED");
    const filtered=active.filter(function(p){
      return (!filters.batch||norm(p.batch)===norm(filters.batch)) &&
        (!filters.allowanceType||norm(p.allowanceType)===norm(filters.allowanceType)) &&
        (!filters.serviceYear||String(p.serviceStartDate).slice(0,4)===String(filters.serviceYear));
    });
    const categories={};
    filtered.forEach(function(p){const k=p.allowanceType||"Unspecified";categories[k]=(categories[k]||0)+1;});
    return {agencyId:aid,name:a.Name,companyCode:a["Company Code"],region:a.Region,district:a.District,
      industry:a.Industry,category:a.Category,ownership:a["Company Ownership"],payingStatus:a["Paying Status"],
      status:a.Status,address:a.Address,gpsAddress:a.GPS,coordinates:coords,
      locationVerification:geo?geo["Verification Status"]:"UNVERIFIED",
      activePersonnel:filtered.map(function(p){return {name:p.name,nss:p.nss,registrationNumber:p.registrationNumber,batch:p.batch,
        allowanceType:p.allowanceType,serviceStartDate:p.serviceStartDate,serviceEndDate:p.serviceEndDate,
        serviceStatus:p.serviceStatus,phone:p.phone,email:p.email,photoUrl:p.photoUrl};}),
      activeCount:filtered.length,upcomingCount:upcoming.length,completedCount:completed.length,
      totalMatched:filtered.length+upcoming.length+completed.length,allowanceBreakdown:categories,
      head:{name:a["Head Name"],designation:a["Head Designation"],phone:a["Head Phone"],whatsapp:a["Head WhatsApp"],email:a["Head Email"]},
      motivation:a.Motivation,accommodation:a.Accommodation,feeding:a.Feeding,extraAllowance:a["Extra Allowance"],
      amenities:a.Amenities,otherBenefits:a["Other Benefits"],images:String(a.Images||"").split(/\r?\n/).filter(Boolean),
      supervisorCount:agencyRows_("AGENCY_SUPERVISORS").filter(s=>String(s["Agency ID"])===aid&&String(s.Status).toUpperCase()==="ACTIVE").length};
  });
  const active=people.filter(p=>p.serviceStatus==="ACTIVE"), upcoming=people.filter(p=>p.serviceStatus==="UPCOMING"), completed=people.filter(p=>p.serviceStatus==="COMPLETED");
  const mapped=result.filter(a=>a.coordinates);
  return {status:"SUCCESS",asOf:today,summary:{agencies:result.length,mappedAgencies:mapped.length,unmappedAgencies:result.length-mapped.length,
    activePersonnel:active.length,upcomingPersonnel:upcoming.length,completedPersonnel:completed.length},
    agencies:result,unmapped:result.filter(a=>!a.coordinates).map(a=>({agencyId:a.agencyId,name:a.name,gps:a.gpsAddress}))};
}
function saveAgencyGeolocation(data, token) {
  const session=requireAdminSession_(token, ["ADMIN","SUPER ADMIN"]); ensureAgencySheets_(); data=data||{};
  const id=String(data.agencyId||"").trim(), lat=Number(data.latitude), lng=Number(data.longitude);
  if(!id) throw new Error("Agency ID is required.");
  if(!isFinite(lat)||!isFinite(lng)||Math.abs(lat)>90||Math.abs(lng)>180) throw new Error("Enter valid latitude and longitude.");
  const agency=agencyRows_("USER_AGENCIES").filter(a=>String(a["Agency ID"])===id)[0];
  if(!agency) throw new Error("Agency not found.");
  const sh=getDatabase().getSheetByName("AGENCY_GEOLOCATION"), existing=agencyRows_("AGENCY_GEOLOCATION").filter(x=>String(x["Agency ID"])===id)[0];
  const record={"Agency ID":id,Latitude:lat,Longitude:lng,"GPS Address":String(data.gpsAddress||agency.GPS||""),
    "Physical Address":String(data.physicalAddress||agency.Address||""),"Location Source":String(data.source||"MAP_PIN"),
    "Accuracy Metres":data.accuracyMetres||"","Verification Status":data.verified===true?"VERIFIED":"UNVERIFIED",
    "Verified By":data.verified===true?session.email:"","Verified At":data.verified===true?new Date():"",
    "Updated At":new Date()};
  if(existing) agencyUpdateById_("AGENCY_GEOLOCATION","Agency ID",id,record); else agencyAppend_("AGENCY_GEOLOCATION",record);
  agencyLog_(session.email,id,"GEOLOCATION_UPDATED",lat+","+lng+" / "+record["Location Source"]);
  return {status:"SUCCESS",message:"Agency coordinates saved.",coordinates:{lat:lat,lng:lng}};
}
function saveMonitoringVisit(data, token) {
  const session=requireAdminSession_(token, ["ADMIN","SUPER ADMIN"]); ensureAgencySheets_(); data=data||{};
  const agencyId=String(data.agencyId||"").trim(), visitType=String(data.visitType||"PHYSICAL").toUpperCase();
  if(!agencyId) throw new Error("Select an agency.");
  if(["PHYSICAL","REMOTE"].indexOf(visitType)<0) throw new Error("Invalid monitoring visit type.");
  const agency=agencyRows_("USER_AGENCIES").filter(a=>String(a["Agency ID"])===agencyId)[0];
  if(!agency) throw new Error("Agency not found.");
  let lat="",lng="";
  if(visitType==="PHYSICAL") {
    lat=Number(data.latitude);lng=Number(data.longitude);
    if(!isFinite(lat)||!isFinite(lng)||Math.abs(lat)>90||Math.abs(lng)>180) throw new Error("A physical visit requires valid GPS coordinates.");
  }
  const id=generateID_("VIS");
  const record={"Visit ID":id,"Agency ID":agencyId,"Visit Type":visitType,"Visit Date":data.visitDate?new Date(data.visitDate):new Date(),
    Officer:session.email,Latitude:lat,Longitude:lng,"GPS Accuracy Metres":data.accuracyMetres||"",
    "Personnel Present":Number(data.personnelPresent||0),"Personnel Expected":Number(data.personnelExpected||0),
    "Attendance Rate":Number(data.personnelExpected)>0?Number(data.personnelPresent||0)/Number(data.personnelExpected):"",
    "Supervision Status":String(data.supervisionStatus||""),"Welfare Status":String(data.welfareStatus||""),
    "Accommodation Status":String(data.accommodationStatus||""),"Feeding Status":String(data.feedingStatus||""),
    "Safety Status":String(data.safetyStatus||""),Findings:String(data.findings||""),
    "Corrective Actions":String(data.correctiveActions||""),"Responsible Person":String(data.responsiblePerson||""),
    "Due Date":data.dueDate||"","Follow-up Status":data.correctiveActions?"OPEN":"NONE",
    "Evidence URLs":Array.isArray(data.evidenceUrls)?data.evidenceUrls.join("\n"):String(data.evidenceUrls||""),
    "Created At":new Date(),"Created By":session.email};
  agencyAppend_("MONITORING_VISITS",record);
  if(data.correctiveActions) agencyAppend_("MONITORING_ACTIONS",{"Action ID":generateID_("ACT"),"Visit ID":id,"Agency ID":agencyId,
    Action:String(data.correctiveActions),"Responsible Person":record["Responsible Person"],"Due Date":record["Due Date"],Status:"OPEN",Notes:""});
  agencyLog_(session.email,agencyId,"MONITORING_"+visitType+"_RECORDED",id);
  return {status:"SUCCESS",visitId:id,message:"Monitoring visit recorded."};
}
function getAgencyMonitoringHistory(agencyId, token) {
  requireAdminSession_(token, ["ADMIN","SUPER ADMIN"]); ensureAgencySheets_();
  const id=String(agencyId||"").trim();
  return {status:"SUCCESS",visits:agencyRows_("MONITORING_VISITS").filter(x=>String(x["Agency ID"])===id)
    .sort((a,b)=>new Date(b["Visit Date"])-new Date(a["Visit Date"])).slice(0,100),
    actions:agencyRows_("MONITORING_ACTIONS").filter(x=>String(x["Agency ID"])===id)};
}

function sendAgencyCommunication(data, token) {
  data=data||{};
  const session=validateSession(token);
  if(!session||session.valid!==true) throw new Error("Your session is invalid or expired.");
  const role=String(session.role||"").toUpperCase();
  if(["ADMIN","SUPER ADMIN","AGENCY SECRETARIAT"].indexOf(role)<0) throw new Error("You are not authorised to send agency communications.");
  ensureAgencySheets_();
  let agency=null;
  if(role==="AGENCY SECRETARIAT") {
    agency=requireAgencySecretariat_(token).agency;
  } else {
    const id=String(data.agencyId||"").trim();
    if(id) agency=agencyRows_("USER_AGENCIES").filter(function(a){return String(a["Agency ID"])===id;})[0];
  }
  const targets=Array.isArray(data.targets)?data.targets:[];
  const channels=Array.isArray(data.channels)?data.channels:[];
  const message=String(data.message||"").trim(), subject=String(data.subject||"NSA WAWM Agency Notice").trim();
  if(!message) throw new Error("Enter a message before sending.");
  if(!targets.length||!channels.length) throw new Error("Select at least one recipient group and communication channel.");
  let recipients=[];
  const agencies=agency?[agency]:agencyRows_("USER_AGENCIES").filter(function(a){return String(a["Account Status"]).toUpperCase()==="ACTIVE";});
  const registered=getSheetObjects_("REGISTERED_PERSONNEL");
  agencies.forEach(function(a){
    const aid=String(a["Agency ID"]),nm=agencyNormalise_(a.Name);
    if(targets.indexOf("head")>=0) recipients.push({type:"Head/contact",name:a["Head Name"]||a.Name,email:a["Head Email"]||a.Email,phone:a["Head Phone"]||a["Phone Number"],whatsapp:a["Head WhatsApp"],agency:a.Name});
    const sups=agencyRows_("AGENCY_SUPERVISORS").filter(function(s){return String(s["Agency ID"])===aid&&String(s.Status).toUpperCase()==="ACTIVE";});
    if(targets.indexOf("supervisors")>=0) sups.forEach(function(s){recipients.push({type:"Supervisor",name:s.Name,email:s.Email,phone:s.Phone,whatsapp:s.WhatsApp,agency:a.Name});});
    if(targets.indexOf("personnel")>=0) {
      registered.filter(function(p){return agencyNormalise_(p["Company Posted To"]||p.Institution)===nm;}).forEach(function(p){
        recipients.push({type:"Personnel",name:p["Full Name"],email:p.Email,phone:p["Phone Number"],whatsapp:p["WhatsApp Number"]||p["Phone Number"],agency:a.Name});
      });
    }
  });
  const unique={}; recipients=recipients.filter(function(r){const k=agencyNormalise_(r.email||r.phone);if(!k||unique[k])return false;unique[k]=true;return true;});
  let emailSent=0,smsSent=0,failed=0; const whatsappLinks=[];
  recipients.forEach(function(r){
    let delivered=false;
    if(channels.indexOf("email")>=0&&r.email) {try{if(sendEmail_(r.email,subject,message)){emailSent++;delivered=true;}}catch(e){Logger.log(e.message);}}
    if(channels.indexOf("sms")>=0&&r.phone) {try{if(sendSMSOnline_(r.phone,message)){smsSent++;delivered=true;}}catch(e){Logger.log(e.message);}}
    if(channels.indexOf("whatsapp")>=0&&(r.whatsapp||r.phone)) whatsappLinks.push({name:r.name,role:r.type,agency:r.agency,url:"https://wa.me/"+String(r.whatsapp||r.phone).replace(/[^0-9]/g,"")+"?text="+encodeURIComponent(message)});
    if((channels.indexOf("email")>=0||channels.indexOf("sms")>=0)&&!delivered) failed++;
  });
  agencyLog_(session.email,agency?agency["Agency ID"]:"","COMMUNICATION_SENT","Targets: "+targets.join(",")+"; recipients: "+recipients.length+"; email: "+emailSent+"; SMS: "+smsSent);
  return {status:"SUCCESS",recipientCount:recipients.length,emailSent:emailSent,smsSent:smsSent,failed:failed,whatsappLinks:whatsappLinks,message:"Communication processing completed. WhatsApp messages are provided as secure click-to-chat links and require a user to send them."};
}

function sendAgencyInfoOTP(nss) {
  const key=String(nss||"").trim().toUpperCase();
  const master=findMasterPersonnel_(key);
  if(!master) return {status:"ERROR",message:"Personnel record was not found in the master list."};
  const cache=CacheService.getScriptCache(), rateKey="AGENCY_INFO_OTP_RATE_"+key.replace(/[^A-Z0-9]/g,"");
  if(cache.get(rateKey)) return {status:"ERROR",message:"A verification code was requested recently. Wait one minute before requesting another."};
  const token=Utilities.getUuid().replace(/-/g,"");
  const result=sendOTP_({nssNumber:key,purpose:"AGENCY_INFO",token:token,forceNew:true});
  if(!result||result.status!=="SUCCESS") return result||{status:"ERROR",message:"Could not send verification code."};
  cache.put(rateKey,"1",60);
  return {status:"SUCCESS",token:result.token,message:"A verification code has been sent to the contact details recorded for this personnel."};
}
function confirmAgencyInfoOTP(token, otp) {
  const verified=verifyOTP_(token,otp,"AGENCY_INFO");
  if(!verified||verified.status!=="SUCCESS") return verified||{status:"ERROR",message:"Verification failed."};
  const access=Utilities.getUuid().replace(/-/g,"")+Utilities.getUuid().replace(/-/g,"");
  CacheService.getScriptCache().put("AGENCY_INFO_ACCESS_"+access,String(verified.nssNumber),1800);
  return {status:"SUCCESS",accessToken:access,message:"Verification successful. Agency information access is available for 30 minutes."};
}
function getAgencyInfoWithAccess(accessToken) {
  const access=String(accessToken||"").trim();
  const nss=CacheService.getScriptCache().get("AGENCY_INFO_ACCESS_"+access);
  if(!nss) throw new Error("Your agency information session has expired. Verify your identity again.");
  const master=findMasterPersonnel_(nss);
  if(!master) throw new Error("Personnel record is no longer available.");
  const posting=String(master["Company Posted To"]||master["Place of Posting"]||"").trim();
  if(!posting) return {status:"SUCCESS",agency:null,message:"No official posting destination is recorded for this personnel."};
  const agency=agencyRows_("USER_AGENCIES").filter(function(a){return agencyNormalise_(a.Name)===agencyNormalise_(posting);})[0];
  if(!agency) return {status:"SUCCESS",agency:null,message:"Your posting destination has not yet completed its agency profile."};
  const assignment=agencyRows_("AGENCY_ASSIGNMENTS").filter(function(x){return String(x["NSS Number"]).toUpperCase()===String(nss).toUpperCase()&&String(x.Status).toUpperCase()==="ACTIVE";})[0];
  const supervisor=assignment?agencyRows_("AGENCY_SUPERVISORS").filter(function(s){return String(s["Supervisor ID"])===String(assignment["Supervisor ID"])&&String(s["Agency ID"])===String(agency["Agency ID"]);})[0]:null;
  const postedCount=getSheetObjects_("MASTER_PERSONNEL").filter(function(p){return agencyNormalise_(p["Company Posted To"]||p["Place of Posting"])===agencyNormalise_(posting);}).length;
  const info=agencySafeProfile_(agency);info.postedCount=postedCount;
  return {status:"SUCCESS",agency:info,supervisor:supervisor?{Name:supervisor.Name,Designation:supervisor.Designation,Phone:supervisor.Phone,WhatsApp:supervisor.WhatsApp,Email:supervisor.Email}:null};
}
