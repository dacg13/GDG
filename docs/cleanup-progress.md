# GDG Cleanup Progress (Steps 9–15)
- [x] Step 9 — Resolve the Unexplained TypeScript Downgrade
  - Reverted typescript to ^7.0.2 in package.json; npm install, next build, and test suite all clean with no errors.
- [x] Step 10 — Add Explicit Firestore Composite Index Configuration
  - Created firestore.indexes.json for formData (Email ASC, Department ASC) and linked it in firebase.json.
- [ ] Step 11 — Shared serializeApplicant Helper
- [ ] Step 12 — Shared "Own-Email" Authorization Helper
- [ ] Step 13 — Move the Hardcoded Submission Deadline to an Environment Variable
- [ ] Step 14 — Consistent Error Response Shape Across All Routes
- [ ] Step 15 — Clarify Department Display-Name Mapping in the Email Endpoint
