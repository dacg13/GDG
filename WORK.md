# GDG Recruitment Portal — Work Report

**Baseline commit:** `3013c55` (Initial commit)
**Final commit:** `0af5630`
**Total change:** 54 files touched, ~23,100 lines added, ~1,800 removed (verified via `git diff 3013c55 HEAD --stat`)

This document explains, in plain terms, what was wrong with the original project and what was actually done about it — verified against the real Git history, not against plans that were written but never merged.

---

## 1. What this project is

A recruitment/application portal for a student development club (Next.js 14 + Firebase). Applicants sign in, apply to up to two departments, and track their status. Admins review applications and shortlist candidates. The original task asked for UI/UX improvements, client- and server-side optimization, and — with the highest weight — finding and fixing a hidden backend bug related to **response storage and identification**.

---

## 2. The headline fix: applicant data had no real access control

This is the most important thing in this report and the thing most worth understanding well.

**The problem, in the original commit:** three places in the app read or changed applicant data with **no check on who was asking**:
- `GET /api/admin/applicants` returned every applicant's name, email, registration number, phone, and answers to anyone who called it — no login required.
- `PATCH /api/shortlist/[id]` let anyone flip any applicant's shortlisted status, by anyone, for any application ID.
- The admin page itself (`app/(pages)/admin/page.jsx`) fetched all applicant data on the server **before** checking whether the visitor was even logged in. In Next.js, that data gets sent to the browser as part of the page load regardless of what the page then decides to *show* — so the "admin-only" check in the UI was happening after the data had already left the server.

On top of that, `firestore.rules` was set to `allow read, write: if true` — meaning even if every one of those app-level checks had been perfect, the database itself was open to anyone who found the project.

**Why this matches the "response storage and identification" bug the task described:** applicant *responses* (the stored form submissions) could be *identified* and pulled by anyone, and mutated by anyone, because nothing in the storage or retrieval path checked identity.

**The fix (commits `7199df9`, `b0306b3`, `9bdedf3`, `882dc84`):**
- Every one of those routes now calls `auth.api.getSession()` first and checks `session.user.role === "admin"` before touching any data. No session → `401`. Logged in but not an admin → `403`.
- The admin page now checks the session **before** it queries Firestore, so unauthorized visitors never receive the data at all.
- `firestore.rules` now denies all direct read/write (`allow read, write: if false`) — the app talks to Firestore only through the server, which is how it was always supposed to work.
- The email-sending endpoint got the same treatment, plus a check that recipients are real applicants (so it can't be used to email random addresses).
- A rate limiter (`lib/rateLimit.js`) was added on top of the above, so even a valid logged-in session can't hammer these endpoints.

**Result:** applicant data is now only reachable by an authenticated admin, at every layer — the API, the page, and the database rules.

---

## 3. Other security and data-integrity fixes

**Duplicate applications under load (commit `9bdedf3`).** The original submit logic checked "has this person already applied?" and *then* wrote the new application — two requests arriving at nearly the same time could both pass the check and both write, creating duplicate applications. It's now wrapped in a Firestore transaction with a deterministic document ID (`userId_department`), so a duplicate write is impossible even under real concurrency, not just unlikely.

**Weak identity (same commit).** Applications were only linked to a user by their raw email string. Every new application now also stores a stable `userId` from the session, alongside the existing email — old records aren't touched or migrated, they just don't have the extra field.

**A missing data field (commit `a5e6982`).** The admin table and CSV export had a "Preference" column, but nothing in the actual submit flow ever collected or saved it — the column was always blank. It's now captured (which of the two chosen departments is the applicant's first choice) and saved with the application.

**Repeated code around auth checks (commits `b666d64`, `a549c5b`).** The same "check the session, check the role" logic was copy-pasted into several routes. It's now one shared function (`lib/authorize.js`, `lib/ownDataAuth.js`) that every route calls — so a future route can't accidentally forget the check the way the original ones did.

**A dependency version that silently broke installs (commits `aa168b6`, `2d2622b`).** An early change bumped `typescript` to a version that conflicts with another required package. This was caught by actually running `npm install` fresh, not just reading the code — the fix pins it back to a version that installs cleanly, and this repo verifies that a plain `npm install` succeeds with no errors.

---

## 4. UI/UX redesign — "Concourse"

The original UI worked but had no real visual identity — plain forms, a bare admin table, and, worth noting honestly, two components (`FormComp.jsx`'s validation check and `DataTable.jsx`'s integrity check) that ran large, pointless loops on every render for no visible reason, plus table rows keyed with `Math.random()`, which broke React's ability to reuse DOM elements between renders.

The redesign (commit `c15a915`, and the fixes/restore in `0af5630`) replaced this with one consistent visual system built around a single idea: **applying to the club is a journey, and the design borrows the language of a boarding pass** — departments are "destinations," the application form has a boarding-pass-style progress strip, submission produces a stamped ticket, and the status page reads like a personal departure board.

What actually changed, concretely:
- **New shared components** (`components/ui/`): `TicketStub`, `StatusBadge`, `DestinationCard`, `SummaryTile`, `EmptyState`, `Modal` — reusable pieces used across the landing page, department selection, the form, the status page, and the admin dashboard, so the same visual language shows up everywhere instead of every page inventing its own look.
- **New typography and color system** in `app/globals.css` and `tailwind.config.js` — a warm, paper-toned palette and three purpose-built fonts (a serif for headings, a plain sans for body text, a monospace for codes/IDs), replacing the generic default.
- **A new status page** (`app/(pages)/status/page.jsx`) so applicants can see where each of their applications stands, with a real empty state for "you haven't applied yet."
- **The pointless render-blocking loops were deleted**, and table/list keys now use stable IDs instead of `Math.random()`.
- Every loading, empty, and error state was given real design instead of a blank screen or a generic spinner.

---

## 5. Admin dashboard

The admin table (`components/DataTable.jsx`, `components/AdminContent.jsx`) keeps its existing library (`react-table` v7) and logic, but got:
- A dedicated, denser admin navigation (`components/AdminNav.jsx`) separate from the applicant-facing nav.
- Three summary tiles (total / under review / shortlisted) at the top, in the same plain, data-first style as the rest of the admin view — no decoration, since the goal here is fast scanning, not visual flair.
- Row-hover quick actions for shortlisting instead of requiring a separate page or modal for a simple toggle.
- A slide-over drawer for reviewing a full application without losing your place in the filtered table.

The admin experience intentionally looks and feels calmer and denser than the applicant-facing pages — same fonts and colors, but almost none of the applicant side's decorative touches, because an admin reviewing fifty applications needs speed, not atmosphere.

---

## 6. Motion

Animation uses the two libraries already in the project (Framer Motion and GSAP) — nothing new was added. Most transitions (button presses, card hovers, section changes in the form) are short CSS or Framer Motion transitions. GSAP is used only for the one animation complex enough to need it: the multi-step "ticket stamp" sequence on successful submission. Every animation respects `prefers-reduced-motion` — this is checked explicitly in `app/globals.css`, which defines a reduced-motion override block that turns transform-based animations into instant state changes.

---

## 7. Before vs. after

| Area | Before | After |
|---|---|---|
| Admin data access | Anyone could call the admin API with no login | Requires a real admin session, checked server-side |
| Shortlisting | Anyone could shortlist any applicant | Admin-only, with request validation |
| Firestore | Open to direct read/write from anywhere | Locked down; only the server can access it |
| Duplicate applications | Possible under concurrent requests | Prevented with a transaction and a deterministic ID |
| Applicant identity | Email string only | Email plus a stable user ID |
| "Preference" field | Column existed, never actually saved | Captured and stored on submit |
| Request limits | None | Rate-limited on submission and email endpoints |
| Visual design | Plain, no consistent identity | One consistent "Concourse" design system across every page |
| Loading/empty/error states | Mostly blank or default | Designed for every major page |
| Admin table performance | `Math.random()` keys broke re-rendering | Stable keys |
| Dead code | An entire unused data-access layer (`lib/actions/`, `lib/modals/`) | Removed |

---

## 8. Verification actually performed

- **`npm install`** — runs clean, no errors (this specifically re-confirms the dependency-version fix in Section 3 holds).
- **`node --test tests/security-and-workflow.test.mjs`** — **17/17 pass.** This suite checks the security fixes, the transaction logic, and several of the cleanup items by reading the actual source files and by simulating the submission logic against a mock database.
- **`npm run build`** — could not be completed in this environment because it needs to fetch fonts from Google Fonts and this sandbox has no network access to that domain. This is an environment limitation, not a code error — worth running once in a normal environment with internet access before treating the build as verified.
- **`npm run lint`** — ESLint isn't configured yet in this project (running it prompts for first-time setup); it was not run.

No performance numbers are claimed anywhere in this report — none were benchmarked. The performance-related claims above (fewer wasted renders, deleted CPU-burning loops) are architectural facts, verified by reading the code, not measured.

---

