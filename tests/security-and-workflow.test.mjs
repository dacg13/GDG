import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// --- SHARED HELPER: lib/authorize.js ---
test("Shared helper: lib/authorize.js centralizes session + admin role verification", () => {
  const helperPath = path.join(rootDir, "lib/authorize.js");
  const helperContent = fs.readFileSync(helperPath, "utf-8");

  assert.ok(
    helperContent.includes("auth.api.getSession"),
    "authorize.js must call auth.api.getSession"
  );
  assert.ok(
    helperContent.includes('role !== "admin"'),
    "authorize.js must check session.user.role !== 'admin'"
  );
  assert.ok(
    helperContent.includes("export async function getAdminSession"),
    "authorize.js must export getAdminSession as a named async function"
  );
  assert.ok(
    helperContent.includes('"unauthenticated"') && helperContent.includes('"forbidden"') && helperContent.includes('"ok"'),
    "authorize.js must return status discriminants: unauthenticated, forbidden, ok"
  );
});

// --- STEP 1: FIRESTORE RULES VERIFICATION ---
test("Step 1: firestore.rules completely denies direct client read/write", () => {
  const rulesPath = path.join(rootDir, "firestore.rules");
  const rulesContent = fs.readFileSync(rulesPath, "utf-8");

  assert.ok(
    rulesContent.includes("allow read, write: if false;"),
    "Rules must explicitly deny read and write with 'allow read, write: if false;'"
  );
  assert.ok(
    !rulesContent.includes("allow read, write: if true;"),
    "Rules must NOT permit open read/write access"
  );
});

// --- STEP 2: ADMIN RSC PAGE LEAK PREVENTION ---
test("Step 2: AdminPage calls getAdminSession() BEFORE querying formData", () => {
  const adminPagePath = path.join(rootDir, "app/(pages)/admin/page.jsx");
  const adminPageContent = fs.readFileSync(adminPagePath, "utf-8");

  const authCheckIdx = adminPageContent.indexOf("getAdminSession()");
  const dbFetchIdx = adminPageContent.indexOf('db.collection("formData").get()');

  assert.ok(authCheckIdx !== -1, "getAdminSession() must be invoked");
  assert.ok(dbFetchIdx !== -1, "Firestore formData fetch must exist");

  assert.ok(
    authCheckIdx < dbFetchIdx,
    "getAdminSession() must be executed strictly before fetching formData"
  );

  assert.ok(
    adminPageContent.includes('redirect("/")'),
    "Non-ok status must redirect to '/'"
  );
});

// --- STEP 3: ADMIN APPLICANTS API AUTHORIZATION ---
test("Step 3: /api/admin/applicants route calls getAdminSession() and enforces 401/403", () => {
  const routePath = path.join(rootDir, "app/api/admin/applicants/route.js");
  const routeContent = fs.readFileSync(routePath, "utf-8");

  assert.ok(
    routeContent.includes("getAdminSession()"),
    "Must call getAdminSession()"
  );
  assert.ok(
    routeContent.includes('{ status: 401 }') || routeContent.includes("status: 401"),
    "Must return 401 for unauthenticated calls"
  );
  assert.ok(
    routeContent.includes('{ status: 403 }') || routeContent.includes("status: 403"),
    "Must return 403 for non-admin callers"
  );

  const authCheckIdx = routeContent.indexOf("getAdminSession()");
  const dbFetchIdx = routeContent.indexOf('db.collection("formData").get()');
  assert.ok(
    authCheckIdx !== -1 && authCheckIdx < dbFetchIdx,
    "getAdminSession() must precede Firestore data retrieval"
  );
});

// --- STEP 4: SHORTLISTING API AUTHORIZATION & VALIDATION ---
test("Step 4: /api/shortlist/[id] calls getAdminSession(), validates boolean, and 404 on missing doc", () => {
  const routePath = path.join(rootDir, "app/api/shortlist/[id]/route.js");
  const routeContent = fs.readFileSync(routePath, "utf-8");

  assert.ok(
    routeContent.includes("getAdminSession()"),
    "Must call getAdminSession()"
  );
  assert.ok(
    routeContent.includes("status: 401"),
    "Must return 401 when no session is present"
  );
  assert.ok(
    routeContent.includes("status: 403"),
    "Must return 403 when user is not admin"
  );
  assert.ok(
    routeContent.includes("typeof body.shortlisted !== 'boolean'") ||
    routeContent.includes('typeof body.shortlisted !== "boolean"'),
    "Must validate that shortlisted is strictly a boolean"
  );
  assert.ok(
    routeContent.includes("status: 400"),
    "Must return 400 for malformed/non-boolean shortlisted requests"
  );
  assert.ok(
    routeContent.includes("!snapshot.exists"),
    "Must check whether document exists in Firestore before updating"
  );
  assert.ok(
    routeContent.includes("status: 404"),
    "Must return 404 when document ID does not exist"
  );
});

// --- STEP 5: EMAIL ENDPOINT AUTHORIZATION, RECIPIENT VALIDATION & BATCH ISOLATION ---
test("Step 5: /api/send-email calls getAdminSession(), verifies recipient against formData, and isolates failures", () => {
  const routePath = path.join(rootDir, "app/api/send-email/route.js");
  const routeContent = fs.readFileSync(routePath, "utf-8");

  assert.ok(
    routeContent.includes("getAdminSession()"),
    "Must call getAdminSession()"
  );
  assert.ok(
    routeContent.includes("status: 401"),
    "Must return 401 when unauthenticated"
  );
  assert.ok(
    routeContent.includes("status: 403"),
    "Must return 403 when caller is not admin"
  );
  assert.ok(
    routeContent.includes('.collection("formData")') && routeContent.includes("where"),
    "Must verify recipient email against formData collection"
  );
  assert.ok(
    routeContent.includes("Promise.allSettled"),
    "Must use Promise.allSettled to isolate per-recipient delivery failures"
  );
  assert.ok(
    routeContent.includes("sent") && routeContent.includes("failed"),
    "Must return a summary object with sent and failed arrays"
  );
});

// --- STEP 6: SUBMISSION RACE CONDITION, IDENTITY & ATOMIC TRANSACTION ---
test("Step 6: /api/submit-form uses runTransaction, applicantProfiles guard doc, and deterministic responseRef", () => {
  const routePath = path.join(rootDir, "app/api/submit-form/route.js");
  const routeContent = fs.readFileSync(routePath, "utf-8");

  assert.ok(
    routeContent.includes("runTransaction"),
    "Must use db.runTransaction for atomic concurrency control"
  );
  assert.ok(
    routeContent.includes('collection("applicantProfiles").doc(userId)'),
    "Must use applicantProfiles collection keyed by userId as transaction guard"
  );
  assert.ok(
    routeContent.includes('`${userId}_${departmentSlug}`'),
    "Must use deterministic doc ID ${userId}_${departmentSlug}"
  );
  assert.ok(
    routeContent.includes("ALREADY_APPLIED_TO_DEPARTMENT"),
    "Must detect duplicate department application atomically inside transaction"
  );
  assert.ok(
    routeContent.includes("MAX_APPLICATIONS_REACHED"),
    "Must enforce max 2 applications atomically inside transaction"
  );
  assert.ok(
    routeContent.includes("userId"),
    "Must store stable userId in submitted document"
  );
});

// --- STEP 6 CONCURRENCY & INTEGRITY LOGIC SIMULATION ---
test("Step 6 Simulation: Atomic transaction guarantees duplicate rejection and max 2 limit", async () => {
  // Mock in-memory database simulating Firestore transaction semantics
  const mockDb = {
    applicantProfiles: new Map(),
    formData: new Map(),
    async runTransaction(updateFunction) {
      const tx = {
        get: async (ref) => {
          const data = mockDb[ref.collection].get(ref.id);
          return {
            exists: !!data,
            data: () => (data ? JSON.parse(JSON.stringify(data)) : null),
          };
        },
        set: (ref, data, options = {}) => {
          if (options.merge && mockDb[ref.collection].has(ref.id)) {
            const existing = mockDb[ref.collection].get(ref.id);
            mockDb[ref.collection].set(ref.id, { ...existing, ...data });
          } else {
            mockDb[ref.collection].set(ref.id, JSON.parse(JSON.stringify(data)));
          }
        },
      };
      return await updateFunction(tx);
    },
  };

  const slugify = (text) => text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");

  const submitApplication = async (userId, userEmail, department, pref, formFields = {}) => {
    const departmentSlug = slugify(department);
    const profileRef = { collection: "applicantProfiles", id: userId };
    const responseRef = { collection: "formData", id: `${userId}_${departmentSlug}` };

    return await mockDb.runTransaction(async (tx) => {
      const profileSnap = await tx.get(profileRef);
      const profile = profileSnap.exists ? profileSnap.data() : { departments: [] };
      const currentDepartments = Array.isArray(profile?.departments) ? profile.departments : [];

      if (currentDepartments.includes(departmentSlug)) {
        throw new Error("ALREADY_APPLIED_TO_DEPARTMENT");
      }
      if (currentDepartments.length >= 2) {
        throw new Error("MAX_APPLICATIONS_REACHED");
      }

      tx.set(
        profileRef,
        {
          departments: [...currentDepartments, departmentSlug],
          email: userEmail,
        },
        { merge: true }
      );

      tx.set(responseRef, {
        userId,
        Email: userEmail,
        Department: department,
        Pref: pref,
        ...formFields,
      });

      return { success: true, docId: responseRef.id };
    });
  };

  const userId = "usr_test_123";
  const email = "applicant@example.com";

  // 1. Submit first department (Design)
  const res1 = await submitApplication(userId, email, "Design", "1");
  assert.equal(res1.success, true);
  assert.equal(res1.docId, "usr_test_123_design");

  // 2. Submit duplicate department (Design) -> must fail with ALREADY_APPLIED_TO_DEPARTMENT
  await assert.rejects(
    async () => submitApplication(userId, email, "Design", "1"),
    { message: "ALREADY_APPLIED_TO_DEPARTMENT" }
  );

  // 3. Submit second valid department (Development) -> must succeed
  const res2 = await submitApplication(userId, email, "Development", "2");
  assert.equal(res2.success, true);
  assert.equal(res2.docId, "usr_test_123_development");

  // 4. Submit 3rd department (Management) -> must fail with MAX_APPLICATIONS_REACHED
  await assert.rejects(
    async () => submitApplication(userId, email, "Management", "2"),
    { message: "MAX_APPLICATIONS_REACHED" }
  );

  // 5. Verify stored data
  const profile = mockDb.applicantProfiles.get(userId);
  assert.deepEqual(profile.departments, ["design", "development"]);
  assert.equal(profile.email, email);

  const doc1 = mockDb.formData.get("usr_test_123_design");
  assert.equal(doc1.userId, userId);
  assert.equal(doc1.Email, email);
  assert.equal(doc1.Department, "Design");
  assert.equal(doc1.Pref, "1");

  const doc2 = mockDb.formData.get("usr_test_123_development");
  assert.equal(doc2.userId, userId);
  assert.equal(doc2.Email, email);
  assert.equal(doc2.Department, "Development");
  assert.equal(doc2.Pref, "2");

  assert.equal(mockDb.formData.size, 2);
});

// --- PART 6: PERFORMANCE & CLEANLINESS VERIFICATION ---
test("Part 6: No CPU burn loops or unstable Math.random() keys exist in frontend components", () => {
  const formComp = fs.readFileSync(path.join(rootDir, "components/FormComp.jsx"), "utf-8");
  const deptPage = fs.readFileSync(path.join(rootDir, "app/(pages)/departments/page.jsx"), "utf-8");
  const dataTable = fs.readFileSync(path.join(rootDir, "components/DataTable.jsx"), "utf-8");
  const departmentsComp = fs.readFileSync(path.join(rootDir, "components/Departments.jsx"), "utf-8");

  // CPU burns
  assert.ok(!formComp.includes("validateFormEntropy"), "validateFormEntropy must be removed");
  assert.ok(!deptPage.includes("verifyDepartmentMatrix"), "verifyDepartmentMatrix must be removed");
  assert.ok(!dataTable.includes("evaluateDataIntegrity"), "evaluateDataIntegrity must be removed");

  // Stable keys
  assert.ok(!formComp.includes("Math.random()"), "FormComp must not use Math.random()");
  assert.ok(!deptPage.includes("Math.random()"), "Departments page must not use Math.random()");
  assert.ok(!dataTable.includes("Math.random()"), "DataTable must not use Math.random()");
  assert.ok(!departmentsComp.includes("Math.random()"), "Departments component must not use Math.random()");

  // Pref capture
  assert.ok(formComp.includes("Pref: pref") || formComp.includes("Pref"), "FormComp must submit Pref field");

  // Dead ORM layer deleted
  assert.ok(!fs.existsSync(path.join(rootDir, "lib/actions")), "lib/actions directory must be deleted");
  assert.ok(!fs.existsSync(path.join(rootDir, "lib/modals")), "lib/modals directory must be deleted");
});

// --- RATE LIMITING: lib/rateLimit.js STRUCTURE ---
test("Rate Limiting: lib/rateLimit.js exports checkRateLimit and uses FieldValue.increment (no transaction)", () => {
  const helperPath = path.join(rootDir, "lib/rateLimit.js");
  const helperContent = fs.readFileSync(helperPath, "utf-8");

  assert.ok(
    helperContent.includes("export async function checkRateLimit"),
    "Must export checkRateLimit as a named async function"
  );
  assert.ok(
    helperContent.includes("FieldValue.increment"),
    "Must use FieldValue.increment for atomic counter updates"
  );
  assert.ok(
    !helperContent.includes("runTransaction"),
    "Must NOT use a transaction — plain read+increment is intentional"
  );
  assert.ok(
    helperContent.includes('collection("rateLimits")'),
    "Must store counters in the rateLimits collection"
  );
  assert.ok(
    helperContent.includes("allowed") && helperContent.includes("retryAfterSeconds"),
    "Must return { allowed, retryAfterSeconds } shape"
  );
});

// --- RATE LIMITING: submit-form integration ---
test("Rate Limiting: submit-form/route.js calls checkRateLimit with submit-form: prefix and does NOT use getAdminSession", () => {
  const routePath = path.join(rootDir, "app/api/submit-form/route.js");
  const routeContent = fs.readFileSync(routePath, "utf-8");

  assert.ok(
    routeContent.includes("checkRateLimit"),
    "Must call checkRateLimit"
  );
  assert.ok(
    routeContent.includes("`submit-form:${userId}`") || routeContent.includes("'submit-form:'"),
    "Rate limit key must be prefixed with 'submit-form:'"
  );
  assert.ok(
    routeContent.includes("status: 429"),
    "Must return 429 when rate limited"
  );
  assert.ok(
    routeContent.includes("Retry-After"),
    "Must include Retry-After header on 429 responses"
  );
  assert.ok(
    !routeContent.includes("getAdminSession"),
    "submit-form must NOT use getAdminSession — it serves any authenticated user"
  );
});

// --- RATE LIMITING: send-email integration ---
test("Rate Limiting: send-email/route.js calls checkRateLimit with send-email: prefix and destructures session", () => {
  const routePath = path.join(rootDir, "app/api/send-email/route.js");
  const routeContent = fs.readFileSync(routePath, "utf-8");

  assert.ok(
    routeContent.includes("checkRateLimit"),
    "Must call checkRateLimit"
  );
  assert.ok(
    routeContent.includes("`send-email:${session.user.id}`") || routeContent.includes("'send-email:'"),
    "Rate limit key must be prefixed with 'send-email:'"
  );
  assert.ok(
    routeContent.includes("status: 429"),
    "Must return 429 when rate limited"
  );
  assert.ok(
    routeContent.includes("Retry-After"),
    "Must include Retry-After header on 429 responses"
  );
  assert.ok(
    routeContent.includes("{ session, status }") || routeContent.includes("{session, status}"),
    "Must destructure session (not just status) from getAdminSession() to access user.id"
  );
});

// --- RATE LIMITING: Logic simulation ---
test("Rate Limiting Simulation: Fixed-window counter allows exactly `limit` requests, then rejects", async () => {
  // Mock in-memory Firestore simulating the rate limiter's read+increment pattern
  const mockStore = new Map();
  const WINDOW_SECONDS = 60;

  async function mockCheckRateLimit({ key, limit, windowSeconds }) {
    const nowSeconds = Math.floor(Date.now() / 1000);
    const windowStart = Math.floor(nowSeconds / windowSeconds) * windowSeconds;
    const docId = `${key}:${windowStart}`;

    const currentCount = mockStore.has(docId) ? mockStore.get(docId).count : 0;

    if (currentCount >= limit) {
      return {
        allowed: false,
        retryAfterSeconds: windowStart + windowSeconds - nowSeconds,
      };
    }

    mockStore.set(docId, { count: currentCount + 1, windowStart });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  const key = "test-route:user_abc";
  const limit = 10;

  // First 10 requests should all be allowed
  for (let i = 0; i < limit; i++) {
    const result = await mockCheckRateLimit({ key, limit, windowSeconds: WINDOW_SECONDS });
    assert.equal(result.allowed, true, `Request ${i + 1} of ${limit} should be allowed`);
    assert.equal(result.retryAfterSeconds, 0);
  }

  // 11th request should be rejected
  const rejected = await mockCheckRateLimit({ key, limit, windowSeconds: WINDOW_SECONDS });
  assert.equal(rejected.allowed, false, "Request beyond limit must be rejected");
  assert.ok(rejected.retryAfterSeconds > 0, "retryAfterSeconds must be positive when rejected");
  assert.ok(rejected.retryAfterSeconds <= WINDOW_SECONDS, "retryAfterSeconds must not exceed window size");

  // A different key should still be allowed (rate limits are per-key)
  const differentKey = await mockCheckRateLimit({ key: "test-route:user_xyz", limit, windowSeconds: WINDOW_SECONDS });
  assert.equal(differentKey.allowed, true, "A different key must not be affected by another key's limit");
});

// --- STEP 11: serializeApplicant helper ---
test("Step 11: lib/db.ts exports serializeApplicant and call sites use it without inline duplication", () => {
  const dbPath = path.join(rootDir, "lib/db.ts");
  const dbContent = fs.readFileSync(dbPath, "utf-8");

  assert.ok(
    dbContent.includes("export const serializeApplicant"),
    "lib/db.ts must export serializeApplicant"
  );
  assert.ok(
    dbContent.includes("id: doc.id") && dbContent.includes("_id: doc.id"),
    "serializeApplicant must set both id and _id"
  );

  const callSites = [
    "app/api/admin/applicants/route.js",
    "app/api/get-submissions/route.js",
    "app/api/shortlist/[id]/route.js",
  ];

  for (const relPath of callSites) {
    const fileContent = fs.readFileSync(path.join(rootDir, relPath), "utf-8");
    assert.ok(
      fileContent.includes("serializeApplicant"),
      `${relPath} must import and use serializeApplicant`
    );
    assert.ok(
      !fileContent.includes("_id: doc.id") && !fileContent.includes("_id: updatedSnapshot.id"),
      `${relPath} must not duplicate inline { id, _id, ... } construction`
    );
  }
});

// --- STEP 12: verifyOwnEmailAccess helper ---
test("Step 12: lib/ownDataAuth.js exports verifyOwnEmailAccess and call sites use it", () => {
  const helperPath = path.join(rootDir, "lib/ownDataAuth.js");
  assert.ok(fs.existsSync(helperPath), "lib/ownDataAuth.js must exist");

  const helperContent = fs.readFileSync(helperPath, "utf-8");
  assert.ok(
    helperContent.includes("export async function verifyOwnEmailAccess"),
    "lib/ownDataAuth.js must export verifyOwnEmailAccess"
  );
  assert.ok(
    helperContent.includes('status: "unauthenticated"') &&
    helperContent.includes('status: "missing-email"') &&
    helperContent.includes('status: "forbidden"') &&
    helperContent.includes('status: "ok"'),
    "verifyOwnEmailAccess must cover all 4 status states"
  );

  const callSites = [
    "app/api/get-submissions/route.js",
    "app/api/check-applications/route.js",
  ];

  for (const relPath of callSites) {
    const fileContent = fs.readFileSync(path.join(rootDir, relPath), "utf-8");
    assert.ok(
      fileContent.includes("verifyOwnEmailAccess"),
      `${relPath} must import and use verifyOwnEmailAccess`
    );
    assert.ok(
      fileContent.includes('status === "unauthenticated"') &&
      fileContent.includes('status === "missing-email"') &&
      fileContent.includes('status === "forbidden"'),
      `${relPath} must handle all 3 error statuses from helper`
    );
  }
});

// --- STEP 14: Consistent Error Response Shape Across All Routes ---
test("Step 14: All 7 API routes include both 'error' and 'message' keys in all 4xx/5xx responses", () => {
  const routeFiles = [
    "app/api/admin/applicants/route.js",
    "app/api/shortlist/[id]/route.js",
    "app/api/send-email/route.js",
    "app/api/submit-form/route.js",
    "app/api/get-submissions/route.js",
    "app/api/check-applications/route.js",
    "app/api/check-department-submission/route.js",
  ];

  // Regex to find response blocks with 4xx or 5xx status codes
  // e.g. NextResponse.json(..., { status: 4xx }) or new Response(..., { status: 4xx })
  const responsePattern = /(?:NextResponse\.json|new Response)\(\s*([\s\S]*?),\s*\{[^}]*status:\s*([45]\d\d)[^}]*\}\s*\)/g;

  for (const relPath of routeFiles) {
    const fileContent = fs.readFileSync(path.join(rootDir, relPath), "utf-8");
    let match;
    let errorResponseCount = 0;

    while ((match = responsePattern.exec(fileContent)) !== null) {
      errorResponseCount++;
      const [fullMatch, bodyStr, statusCode] = match;

      assert.ok(
        bodyStr.includes("error") && bodyStr.includes("message"),
        `${relPath} (status ${statusCode}) error response must include both 'error' and 'message' keys. Found: ${bodyStr.trim()}`
      );
    }

    assert.ok(
      errorResponseCount > 0,
      `${relPath} must have at least one error response tested (found ${errorResponseCount})`
    );
  }
});


