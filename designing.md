# designing.md — Concourse Design System
### GDG Recruitment Portal — Implementation-Ready Design Specification
**Status:** Locked creative direction. Ready for implementation. No code has been written yet.

---

## LOCKED CREATIVE DIRECTION

**Design System Name:** **Concourse**

**Core Visual Metaphor:** Applying to the club is booking and taking a journey through an airport concourse. The landing page is the terminal. Authentication is check-in. Choosing a department is choosing a destination. The application form is the boarding process. Submission issues a stamped ticket. The applicant's status page is their personal departure board. The admin dashboard is the control tower — the same building, a different room, built for a different job.

**Product Personality (7 traits):**
1. **Purposeful** — every element earns its place, the way every sign in a real terminal exists to answer one specific question.
2. **Confident** — declarative typography and layout; nothing hedges or apologizes for itself.
3. **Ceremonial** — a small number of moments (submission, shortlisting) are treated as genuine occasions, not toast notifications.
4. **Precise** — aligned grids, monospace data fields, exact numbers — echoing both airline operations and developer craft.
5. **Warm** — stamped, tactile, ink-and-paper details keep the system from reading as cold or purely transactional.
6. **Efficient (admin register)** — the control-tower view is fast, dense, and decisive; ceremony is an applicant-side luxury, not an admin-side one.
7. **Optimistic** — the tone throughout is "you're going somewhere good," never bureaucratic or anxious.

---

# SECTION 1 — DESIGN PHILOSOPHY

**What the design is trying to achieve.** Replace the generic "apply now" SaaS-dashboard pattern with one coherent, structural metaphor that does real work at every step — the boarding-pass/ticket object is simultaneously the card system, the progress indicator, and the status system, so consistency is structural, not just a shared color palette.

**What emotions it should create.** For applicants: curiosity on arrival, confidence while filling out the form, genuine small delight at submission, and calm clarity while waiting. For admins: control, speed, and focus — efficiency is this audience's version of delight.

**Why the metaphor fits a student recruitment portal.** Every actual flow in this product — pick a track, submit an application, wait, find out — already has a one-to-one equivalent in the travel/ticketing world, so the metaphor isn't decorative skin, it's a structural translation of the product's real information architecture. It's also inherently exciting ("you're going somewhere") in a way a plain form never can be, without resorting to childish illustration.

**How applicant-facing and admin-facing experiences differ.** Applicant-facing pages are slower, warmer, more spacious, and spend the system's "ceremony budget" (Section 8) freely. Admin-facing pages are denser, faster, quieter, and spend almost none of that budget — the same ticket-stub object exists there, but flattened into a scannable table row rather than a full ceremonial card.

**How they remain one system.** Both registers share the exact same design tokens (Section 3), the same two typefaces, the same ticket-stub silhouette as the base object for any "record" (an application, a table row), and the same status-badge language. The difference is tempo and density, never vocabulary.

---

# SECTION 2 — STRICT ANTI-AI-SLOP RULES

These are enforceable constraints, not taste statements. Antigravity must check the actual implementation against every rule below before considering any page complete.

1. **No purple, blue-to-purple, or purple-to-cyan gradient anywhere**, on any background, button, heading, or border. This system has exactly one approved gradient use (Section 3, reserved for the departure-board flip effect only) and it is warm-toned, never purple.
2. **Inter is banned as a typeface anywhere in this product.** Use only the three fonts named in Section 3.
3. **No glassmorphism** — no frosted/blurred translucent panels, anywhere, in any component.
4. **No floating abstract gradient "blobs"** as background decoration.
5. **No single oversized centered icon sitting alone above a heading** as a default section pattern.
6. **No uniform border-radius applied reflexively to every container.** Every radius value used must be traceable to the specific philosophy in Section 3.6 — a ticket stub, a button, an input, and a badge are never allowed to share the same radius value by accident.
7. **Shadows are the exception, not the rule.** Cards use a 1px hairline border as their default elevation technique (Section 3.7). The two defined shadow levels are reserved only for genuinely floating elements (dropdowns, modals, toasts) — never applied to a static card sitting in the page flow.
8. **No dark-mode-by-default.** This system is light, warm-neutral by default. (A dark admin-only "night ops" mode may be considered later as an opt-in preference, never as the default.)
9. **Status is never color-only.** Every status state (Section 5.4) always pairs a color with an icon and a text label.
10. **No stock photography** of any kind — people, laptops, generic office scenes. Illustration, if used at all, is limited to simple line-icon iconography consistent with the ticket/terminal motif.
11. **No decorative motion.** Every animation in this product must be traceable to a specific line in Section 7 with a stated purpose. If an animation can't state the one thing it communicates, remove it.
12. **No generic marketing copy patterns** ("Supercharge your...", "Unleash...", "Transform your..."). Copy should read like a real club member wrote it.
13. **The admin dashboard's decorative budget is close to zero.** One instance of the ticket-stub motif per row is the ceiling — no icon-plus-shadow treatment on every metric tile.
14. **Every loading, empty, and error state must be explicitly designed** (Section 6 covers each page's states) — never left as framework/browser default.
15. **A screenshot of any page in this product, with the club's name cropped out, should not be mistakable for a generic recruitment SaaS product.** If it is, that page has failed this brief.

---

# SECTION 3 — DESIGN TOKENS

## 3.1 Colors

| Token | Value | Where it's allowed |
|---|---|---|
| `color-bg` | `#FAF6EC` (warm paper cream) | Page background, applicant-facing surfaces. Never pure white. |
| `color-bg-admin` | `#F5F4EF` (cooler, denser paper) | Admin dashboard background only — same family, slightly quieter, to shift tempo without breaking the system. |
| `color-surface` | `#FFFDF7` | Card/ticket-stub fill, modal fill, input fill. |
| `color-ink` | `#1A1A16` (warm near-black) | Primary text, primary icons. Never pure `#000000`. |
| `color-ink-muted` | `#6B6558` | Secondary text, placeholder text, disabled labels, the "Closed / Not Selected" status. |
| `color-primary` | `#10233D` (airline ink-navy) | Primary buttons, nav, headings, the dominant brand color. |
| `color-primary-hover` | `#0B1A2E` | Primary button hover/active only — never used as a standalone fill elsewhere. |
| `color-accent` | `#F2A93B` (departure-board amber) | The single accent: current-step indicators, active states, the "in motion" signal, hover underlines. Used sparingly — never as a large fill area. |
| `color-stamp` | `#8B2E2E` (oxide ink-red) | Reserved exclusively for the ticket-stamp motif (Section 8) at submission and milestone moments. Never used for errors or destructive actions. |
| `color-border` | `#E3DDCE` | Hairline borders on cards, inputs, table rows, dividers. |
| `color-success` | `#2F7D4F` | Shortlisted status, success toasts, positive confirmations. |
| `color-warning` | `#D98E1F` | Under Review status, non-blocking warnings. |
| `color-error` | `#B23A2E` | Form validation errors, failed requests, destructive-action confirmation. Distinct from `color-stamp` — never reused for the stamp motif, and never used for the "Closed" status (which uses `color-ink-muted` instead, out of respect for applicants who weren't selected). |

**Rule:** `color-error` (bright brick-red, for real problems) and `color-ink-muted` (quiet grey-brown, for a dignified "not selected" outcome) must never be swapped. A rejection is not an error.

## 3.2 Typography

| Role | Font | Why |
|---|---|---|
| Display / Headings | **Fraunces** (variable serif) | Carries the "editorial warmth" the research identified as the current, deliberate reaction against sterile AI-generated sans-only interfaces. Its soft ball terminals and real optical personality make large ticket-style numerals and hero text feel designed, not templated. |
| Body / UI | **Hanken Grotesk** (variable sans) | A quiet, highly legible workhorse with more warmth than Inter's clinical neutrality, specifically chosen because Inter is banned system-wide (Section 2.2). Handles forms, buttons, and body copy without competing with Fraunces. |
| Data / Codes | **JetBrains Mono** | Used specifically for anything that is "system-generated data" in the ticket metaphor: registration numbers, ticket/application codes, timestamps. Doubles as a quiet nod to the audience being developers. |

**Weights used:** Fraunces 600 (headings), Fraunces 900 (hero numerals/display only, used sparingly); Hanken Grotesk 400 (body), 500 (UI labels, buttons), 700 (emphasis); JetBrains Mono 400 (data), 500 (emphasized codes).

**Type scale (desktop / mobile):**

| Token | Desktop | Mobile | Line height | Font |
|---|---|---|---|---|
| `text-display-xl` | 64px | 40px | 1.05 | Fraunces 900 |
| `text-display-l` | 48px | 32px | 1.1 | Fraunces 600 |
| `text-h1` | 36px | 28px | 1.15 | Fraunces 600 |
| `text-h2` | 28px | 22px | 1.2 | Fraunces 600 |
| `text-h3` | 22px | 19px | 1.3 | Hanken Grotesk 700 |
| `text-body-l` | 18px | 16px | 1.6 | Hanken Grotesk 400 |
| `text-body` | 16px | 15px | 1.6 | Hanken Grotesk 400 |
| `text-small` | 14px | 13px | 1.5 | Hanken Grotesk 500 |
| `text-mono` | 14px | 13px | 1.4 | JetBrains Mono 400 |
| `text-mono-emphasis` | 16px | 14px | 1.4 | JetBrains Mono 500 |

## 3.3 Spacing scale (4px base unit)

`space-1: 4px · space-2: 8px · space-3: 12px · space-4: 16px · space-6: 24px · space-8: 32px · space-12: 48px · space-16: 64px · space-24: 96px`

Use `space-24` between major landing-page sections (desktop), `space-12` on mobile. Use `space-4`–`space-6` for internal card padding. Never use an arbitrary spacing value outside this scale.

## 3.4 Border radius philosophy

Radius is assigned by *object family*, never applied as a blanket default:

| Token | Value | Used for |
|---|---|---|
| `radius-sharp` | 2px | Ticket-stub card body edges — deliberately close to sharp, evoking printed card stock, not a soft app card. |
| `radius-input` | 4px | Form inputs, text areas, select triggers. |
| `radius-button` | 6px | All buttons — crisp, not pill-shaped, not fully sharp. |
| `radius-panel` | 8px | Modals and drawers (top corners only on drawers). |
| `radius-pill` | 999px | **Reserved exclusively for status badges** — the one intentional pill shape in the system, because it echoes a real luggage tag / boarding tag. |

The ticket-stub card additionally uses a **notch cut**, not a radius: a repeating small semicircle cutout pattern along the stub's perforation line (achievable with a repeating radial-gradient mask or an SVG mask), visually separating the "info" half from the "stub" half of every ticket-shaped card.

## 3.5 Shadows

Only two levels exist, and both are reserved for genuinely floating elements — never a static in-flow card.

| Token | Value | Used for |
|---|---|---|
| `shadow-float` | `0 4px 16px rgba(26,26,22,0.10)` | Dropdown menus, popovers, toasts. |
| `shadow-modal` | `0 12px 40px rgba(26,26,22,0.18)` | Modals and drawers only. |

## 3.6 Borders

`border-hairline: 1px solid var(--color-border)` is the **default elevation technique** for every static card, table row, and input — used instead of a shadow, per the "tactile precision over soft blur" direction. Borders are omitted only inside the admin table body between rows of the same visual group, where a subtle background-tint zebra pattern is used instead (Section 5.6).

---

# SECTION 4 — LAYOUT SYSTEM

- **Desktop max content width:** 1200px, centered, with the landing hero and department-selection sections allowed to run full-bleed behind the constrained content column for visual weight.
- **Grid:** 12-column grid, 24px gutter on desktop, 16px gutter on tablet/mobile.
- **Page gutters (outer margin):** 64px desktop, 32px tablet, 16px mobile.
- **Breakpoints:** mobile `<640px`, tablet `640–1024px`, desktop `>1024px`.
- **Section spacing:** `space-24` (96px) between major landing-page sections on desktop, `space-12` (48px) on mobile.
- **Mobile layout rules:** the form and status pages collapse to a strict single column; the ticket-stub card's notch/perforation detail is preserved at all breakpoints (it's the signature element and must never be simplified away on mobile); the admin table converts to a stacked ticket-stub-per-applicant card list below the tablet breakpoint rather than a horizontally-scrolling table.
- **Tablet behavior:** department-selection cards go from a 3-column grid (desktop) to 2-column; the admin table remains a true table down to the tablet breakpoint, then converts per the mobile rule above.

---

# SECTION 5 — COMPONENT DESIGN SYSTEM

## 5.1 Buttons

All buttons: `radius-button` (6px), `text-small` (14px) label in Hanken Grotesk 500, uppercase tracking of 0.02em, height 44px (touch-friendly), horizontal padding `space-6`.

| Variant | Fill | Border | Hover | Active | Focus |
|---|---|---|---|---|---|
| **Primary** | `color-primary` fill, white text | none | `color-primary-hover` fill, 150ms ease | scale 0.98, 100ms | 2px `color-accent` outline, 2px offset |
| **Secondary** | `color-surface` fill, `color-primary` text | 1px `color-primary` border | fill shifts to `color-bg`, border stays | scale 0.98 | 2px `color-accent` outline |
| **Ghost** | transparent | none | `color-bg` fill fades in, 150ms | scale 0.98 | 2px `color-accent` outline |
| **Destructive** | transparent, `color-error` text | 1px `color-error` border | `color-error` fill at 8% opacity | scale 0.98 | 2px `color-error` outline |
| **Loading** | same as its base variant, label replaced by a small ticket-punch spinner (a rotating perforation-dot motif, not a generic spinner) | — | disabled interaction | — | — |
| **Disabled** | `color-border` fill, `color-ink-muted` text | none | no hover response | no active response | not focusable |

## 5.2 Inputs

Height 48px, `radius-input` (4px), `text-body` (16px), 1px `color-border` border, `color-surface` fill, label positioned above the field (persistent, never placeholder-only) in `text-small`.

| State | Treatment |
|---|---|
| Default | 1px `color-border`, `color-ink` text |
| Focus | border shifts to 2px `color-primary`, no glow/shadow |
| Error | border shifts to 2px `color-error`, an inline error message in `text-small` `color-error` appears below with a small warning icon — never color alone |
| Success | border shifts to 2px `color-success`, small checkmark icon appears at the input's trailing edge (used for real-time validation, e.g., a correctly formatted registration number) |
| Disabled | `color-bg` fill, `color-ink-muted` text, no border color change on interaction |

## 5.3 Cards — four distinct types, never one generic card

1. **Ticket-Stub Card** (the signature element) — used for: a department/destination, a submitted application, an admin's row-expanded applicant view. `radius-sharp` body + perforation-notch divider (Section 3.4), 1px `border-hairline`, `color-surface` fill. Left/main section holds the primary content; right "stub" section (roughly 30% width, separated by the perforation) holds a monospace code, a status badge, or a key data point.
2. **Destination Poster Card** — used only for department selection. Full-bleed image/color-block top two-thirds, `text-h3` department name plus a one-line description in the bottom third, one accent color per department drawn from a small curated rotation (never more than 4 accent colors active in the same grid).
3. **Admin Summary Tile** — used sparingly (max 3–4 at the top of the admin dashboard) for aggregate counts (total applicants, shortlisted, pending). Flat `color-surface` fill, 1px border, a large `text-h1` number in JetBrains Mono, a `text-small` label beneath. No icon, no shadow, no gradient — deliberately the quietest card type in the system.
4. **Empty-State Card** — a dashed 1px border (the only dashed-border use in the system), centered icon (line-style, ticket/terminal-consistent) plus one line of copy plus, where relevant, one action button. Used for "no applications yet," "no results match your filters," etc.

## 5.4 Badges and Status

Status is always `radius-pill` shape, `text-small`, icon + label + color together:

| Status | Color | Icon | Label |
|---|---|---|---|
| Submitted | `color-ink-muted` at 12% bg, `color-ink` text | a ticket icon | "Submitted" |
| Under Review | `color-warning` at 12% bg, `color-warning` text | a clock icon | "Under Review" |
| Shortlisted | `color-success` at 12% bg, `color-success` text | a check icon | "Shortlisted" |
| Closed / Not Selected | `color-ink-muted` at 12% bg, `color-ink-muted` text | a flag/finish icon (never an X) | "Applications Closed" |

## 5.5 Navigation

**Applicant navigation:** no traditional top navbar. A persistent, small top-right "boarding-pass chip" shows the applicant's own current status at a glance (acts as both wayfinding and a status reminder) and expands into a simple dropdown with Home / My Application / Sign out. On the landing page pre-authentication, a minimal wordmark + single "Sign in" ghost button in the top bar is sufficient.

**Admin navigation:** a slim, always-visible left rail (72px collapsed / 220px expanded on hover or pin), `color-bg-admin` fill, containing only: Applicants, Filters/Saved Views, and Sign out. No decorative icons beyond simple line icons per item.

## 5.6 Tables (Admin)

Row height 56px, `text-body` for primary columns, `text-mono` for IDs/registration numbers/timestamps. Zebra striping using a 3%-opacity `color-primary` tint on alternate rows instead of borders between every row (a full border-hairline only appears at the header and the table's outer edge). Row hover reveals right-aligned quick actions (view, shortlist toggle) that are otherwise invisible — no persistent action-icon clutter per row. Sticky header on scroll. Column sort indicated by a small arrow in JetBrains Mono weight 500, never a color change alone.

## 5.7 Modals and Drawers

**Modal** (centered, `shadow-modal`, `radius-panel`): used for a single, focused decision — confirming a shortlist action, confirming a destructive action. Never used to display a full applicant's answers.
**Drawer** (slides from the right, full height, `shadow-modal`, `radius-panel` on the leading top/bottom corners only): used for the expanded applicant-review view in the admin table — enough space to read full answers without leaving the table's filtered context behind.

## 5.8 Toasts and Feedback

Bottom-center on mobile, bottom-right on desktop. `radius-input` (4px, deliberately sharper than a pill — toasts are informational, not statusful), `shadow-float`, auto-dismiss at 4s with a manual close. Success toasts get a small `color-success` left-edge accent bar (4px), errors a `color-error` left-edge accent bar — color is always paired with an icon inside the toast, never the edge bar alone.

---

# SECTION 6 — PAGE-BY-PAGE DESIGN BLUEPRINT

## Landing Page

**Purpose:** First impression; convert a curious visitor into an applicant.
**User goal:** Understand what this club is, what departments exist, and how to start.
**Layout:** NOT a centered SaaS hero. A full-bleed "terminal departures board" hero: large Fraunces `text-display-xl` headline set left-aligned against a `color-primary` band (not a gradient), with a live-feeling mini departure-board strip beneath it listing the actual departments as if they were flights ("NOW BOARDING: Web Development," etc.) in JetBrains Mono — this single element does more identity work than any stock illustration could.
**Components:** Hero band, department Destination Poster Cards (Section 5.3.2) in a 3-column grid, a short "why join" section using `text-body-l`, a simple footer.
**Visual hierarchy:** Headline → departure-board strip → department posters → CTA to sign in/apply.
**Interactions:** Department posters lift very slightly (2px translate, 150ms) on hover, revealing a "View destination" label.
**Motion:** The departure-board strip's department names do a brief flip-tile animation on page load only (once, not looping) — this is the landing page's one signature motion moment.
**Mobile behavior:** Hero band stacks, departure-board strip becomes a horizontally swipeable row, poster grid becomes single-column.
**Empty/loading/error states:** If department data fails to load, the departure-board strip shows a single calm row: "Schedule temporarily unavailable — please refresh," styled consistently with the mono aesthetic rather than a generic error banner.

## Authentication

**Purpose:** Sign in/sign up without breaking the terminal metaphor.
**User goal:** Get through check-in quickly.
**Layout:** A "check-in counter" framing — a centered Ticket-Stub Card containing the auth form itself, on the same warm `color-bg`, not a separate stark white modal.
**Components:** Google OAuth primary button (Section 5.1 Primary variant), email/password Secondary path below a simple divider, standard Input components.
**Visual hierarchy:** Google sign-in first and visually dominant (matches actual usage), email/password secondary.
**Interactions:** Standard input focus/error states (Section 5.2).
**Motion:** Card arrives with a short 200ms ease-out fade/rise on page load; no other motion.
**Mobile behavior:** Card goes full-width with standard page gutters.
**Empty/loading/error states:** Auth failure shows an inline error banner above the form (not a toast, since the user needs to act on it immediately) using `color-error` per the token system.

## Application Experience

**Purpose:** The strongest part of the redesign — the actual "boarding process."
**User goal:** Complete a multi-part application confidently, without anxiety about losing progress.
**Form structure:** Single-column, one logical section per screen (About You → Department Selection → Department-Specific Questions per chosen department → Review).
**Progress system:** The signature element *is* the progress indicator — a horizontal boarding-pass strip at the top shows each section as a perforated segment; the current segment is filled with `color-accent`, completed segments show a small stamp icon, upcoming segments are outlined only.
**Section transitions:** A short horizontal slide (250ms ease) matching the direction of travel (forward = slide left, back = slide right), never a hard cut, never a generic fade.
**Question presentation:** One clear question at a time within a section where reasonable; grouped, related fields (name/registration number) may share a row on desktop only, collapsing to stacked on mobile, per the form-UX research.
**Validation:** Real-time, inline, using the Input error/success states (Section 5.2) — never only on submit.
**Department preference selection:** Reuses the Destination Poster Card pattern from the landing page for consistency; if applying to two departments, a simple drag-to-reorder or tap-to-set "1st choice / 2nd choice" ribbon appears on the chosen posters (this is also where the `Pref` data point gets captured going forward).
**Save/progress behavior:** Autosave on every section completion (not every keystroke) with a small, quiet "Saved" mono-text confirmation near the progress strip — no modal, no toast, just a quiet confirmation consistent with the calm-precision personality.
**Completion feedback:** A review screen styled as a boarding-pass preview of the applicant's own submission before the final "Submit" action — reinforcing the metaphor and giving a last real chance to check answers.
**Mobile behavior:** Progress strip compresses to a "Section 2 of 4" mono-text label with a thin filled bar beneath it rather than the full segmented strip (which needs more horizontal room), but keeps the same color logic.
**Empty/loading/error states:** A failed submission shows an inline error state on the review screen (not a silent failure) with a clear retry action; a session-expired state redirects back to Authentication with a clear, non-alarming explanation.

## Submission Success

**Purpose:** The single highest-leverage emotional moment in the product.
**User goal:** Feel confident the application went through and know what happens next.
**Layout:** Full-screen (not a modal) — a large, centered stamped ticket showing the applicant's chosen department(s), a JetBrains Mono application code, and the submission date.
**Components:** The Ticket-Stub Card at its largest, most ceremonial size; a clear "What happens next" mono-styled mini-timeline beneath it (Submitted → Under Review → Decision); a single Secondary button back to the status page.
**Visual hierarchy:** The stamp animation is the unambiguous focal point before anything else on the page.
**Interactions:** None required beyond the one exit button — this page should not compete for attention with itself.
**Motion:** The signature moment (Section 8) — a stamp visibly lands on the ticket (scale-in + a quick settle, ~400ms, ease-out with a slight overshoot-then-settle, not a bounce), followed by the ticket itself settling into place. This is the single most "designed" animation in the entire product and should get the most craft attention.
**Mobile behavior:** Same layout, scaled down proportionally; stamp animation preserved exactly (this moment must not be simplified away on mobile).
**Empty/loading/error states:** Not applicable — this page only renders on confirmed success.

## Applicant Status

**Purpose:** A personal departure board — calm, clear, informative.
**User goal:** Know exactly where their application stands without anxiety.
**Layout:** A single, prominent Ticket-Stub Card per application (one per department applied to, if two), each showing its current Status Badge (Section 5.4) prominently in the stub half.
**Components:** Status Badge, a small mono-styled "last updated" timestamp, an expandable "view your answers" section (read-only, using the same section layout as the form itself for consistency).
**Visual hierarchy:** Status badge is the first thing read; department name second; supporting detail last.
**Interactions:** Expand/collapse for viewing submitted answers.
**Motion:** If a status changes while the applicant is viewing the page (rare, but possible via realtime data), the badge performs the departure-board "flip" transition rather than an abrupt swap.
**Mobile behavior:** Cards stack full-width; no information is hidden, only reflowed.
**Empty/loading/error states:** Before any submission exists, an Empty-State Card (Section 5.3.4) reads "No applications yet" with a direct link back to department selection; a data-fetch failure shows a calm inline retry message, never a blank screen.

## Admin Dashboard

**Purpose:** Efficient, accurate review and shortlisting — the "control tower."
**User goal:** Scan, filter, and decide on applicants quickly.
**Information hierarchy:** A slim row of 3 Admin Summary Tiles (Section 5.3.3) at the very top (Total / Under Review / Shortlisted counts) — nothing more decorative above the table. The table itself dominates the viewport immediately below.
**Filters:** A single-line filter bar (department, status, search-by-name/email) directly above the table, using compact Input/Select components — no separate filter sidebar or modal for common filters.
**Search:** Instant client-side filtering as the admin types, with the result count updating live in mono type next to the search field.
**Applicant review flow:** Clicking a row opens the Drawer (Section 5.7) with the full application rendered as a read-only version of the applicant's own form layout, for visual consistency across the whole product.
**Shortlisting interactions:** A single toggle-style action available both inline on row-hover and inside the drawer — never requiring a separate confirmation modal for this specific action (low-risk, reversible), while destructive/irreversible actions do use the Modal.
**Data density:** High, deliberately — the admin register earns density that the applicant register never should (Section 1).
**Mobile behavior:** Table converts to a stacked list of compact Ticket-Stub Cards (Section 5.3.1), one per applicant, with status badge and quick actions visible without opening the row.
**Empty/loading/error states:** Skeleton-screen table rows (not a spinner) while loading; a designed Empty-State Card for "no applicants match these filters" distinct from "no applicants at all."

---

# SECTION 7 — MOTION SYSTEM

## 7.1 Principles
- Motion explains a state change; it never exists purely to be noticed.
- Motion should feel fast and confident — quick eases, no bounce, no elastic overshoot except the one deliberate stamp-settle moment (Section 8).
- Every animation must pass this test before shipping: *can you state, in one sentence, what it communicates to the user?* If not, remove it.
- `prefers-reduced-motion` must be respected everywhere — all animation reduces to an instant state change (opacity/position snap, no transform animation) when the user has that preference set.

## 7.2 Exact motion types

| Type | Duration | Easing | Trigger | Purpose |
|---|---|---|---|---|
| Button hover/press | 100–150ms | ease-out | pointer hover / active | Immediate tactile feedback |
| Standard UI transition (input focus, badge appear) | 200–300ms | ease-in-out | state change | Smooth, non-jarring state communication |
| Section/page transition (form steps) | 250ms | ease-in-out, directional slide | step forward/back | Communicates position in a sequence |
| Card hover lift (destination poster) | 150ms | ease-out | pointer hover | Signals interactivity without noise |
| Progress movement (boarding strip fill) | 300ms | ease-in-out | section completed | Visualizes concrete progress |
| Departure-board flip (status/data change) | 350–500ms per tile | ease-in, staggered per character/tile | page load (landing) or live status change | The system's signature "something updated" moment |
| Loading state (skeleton) | continuous subtle shimmer, 1.5s loop | linear | data fetch in progress | Shows structure is coming, reduces perceived wait |
| Success state (submission stamp) | ~400ms | ease-out with a single controlled overshoot-then-settle | successful form submission | The system's single highest-ceremony moment (Section 8) |
| Modal/drawer transition | 250ms | ease-out (modal: scale+fade; drawer: slide) | open/close | Spatial continuity between trigger and content |

## 7.3 Performance discipline
Only `transform` and `opacity` are animated for anything triggered frequently (hover, scroll) — never `width`, `height`, `top`, or `left`, to avoid layout thrashing (Section 10 expands on this).

---

# SECTION 8 — SIGNATURE INTERACTIONS

Five memorable, realistic-to-build interactions, each doing structural (not decorative) work:

1. **The Departure-Board Flip.** Any place a value visibly changes (a status update, the landing page's department list on load) animates using a split-flap/flip-tile transition rather than a plain fade or swap. This is the system's most recognizable, ownable motion signature.
2. **The Boarding-Pass Progress Strip.** The application form's progress indicator is a literal segmented ticket strip that fills and stamps itself as sections complete, replacing a generic progress bar with the product's own object language.
3. **The Submission Stamp.** At the moment of submission, an ink-stamp visibly lands on the applicant's ticket (Section 6, Submission Success) — the single highest-craft animation in the product, deliberately rare so it stays special.
4. **The Ticket-Stub as Universal Record.** The same notched ticket-stub silhouette represents a department, a submitted application, a status card, and (flattened) an admin table row — one object, four contexts, reinforcing system coherence every time a user encounters it.
5. **The Quiet Autosave Confirmation.** A small, monospace "Saved · 2:41 PM"-style confirmation that appears near the progress strip after each form section — understated on purpose, communicating precision and reliability rather than calling attention to itself.

No interaction here requires 3D, WebGL, or exotic tooling — all five are achievable with standard CSS transforms, transitions, and conventional component state.

---

# SECTION 9 — ACCESSIBILITY REQUIREMENTS

- **Keyboard navigation:** Every interactive element (buttons, form fields, table rows, drawer/modal triggers) reachable and operable via Tab/Shift+Tab and Enter/Space; admin table rows navigable with arrow keys, Enter to expand into the drawer.
- **Focus states:** The 2px `color-accent` (or `color-error` for destructive controls) outline defined in Section 5.1/5.2 is never removed or hidden — no `outline: none` without a compliant custom replacement.
- **Reduced motion:** `prefers-reduced-motion: reduce` disables all transform-based animation system-wide (Section 7.1) — including the departure-board flip and the submission stamp, which fall back to an instant state change.
- **Contrast:** All text/background pairs in Section 3.1 must meet WCAG AA (4.5:1 for body text, 3:1 for large text) — verify `color-accent` and `color-warning` specifically against `color-bg`, since warm ambers are the most likely tokens to need a darker text-pairing variant for small text.
- **Screen reader labels:** Status badges include a visually-hidden text equivalent beyond the icon+label already shown; the departure-board flip animation's final state is what's exposed to assistive tech (not the intermediate flip frames); icon-only buttons (row quick-actions) always carry an `aria-label`.
- **Form accessibility:** Every input has a persistent, programmatically associated `<label>` (never placeholder-only labeling); error messages are associated via `aria-describedby` and announced via a live region on submit.
- **Error messaging:** Always plain-language and specific ("Registration number must be 9 digits," not "Invalid input") — consistent with the "warm, precise" personality, not just an accessibility checkbox.

---

# SECTION 10 — PERFORMANCE RULES

- **Animation performance:** Only animate `transform` and `opacity` for any interaction that can repeat frequently (hover states, scroll-triggered reveals, the flip-tile effect) — GPU-composited properties only, never `width`/`height`/`top`/`left`/`margin`.
- **Avoiding layout thrashing:** The boarding-pass progress strip and departure-board flip must be built so segment/tile size is fixed before animation starts (no animating a property that triggers reflow); batch any DOM reads before writes if implemented with direct DOM manipulation.
- **Lazy loading:** Department Destination Poster images (if any imagery is used) lazy-load below the fold; the admin drawer's full applicant content only renders when opened, not pre-rendered for every row.
- **Reduced motion:** As stated in Section 9 — this is also a performance win, since it removes the most GPU-intensive animations (the flip effect) for users who've opted out.
- **General rule:** No animation, however small, ships if it measurably drops interaction responsiveness on a mid-range mobile device — visual craft never outranks a responsive interface in this system.

---

# SECTION 11 — IMPLEMENTATION PRIORITY

## Phase A — Core Visual Identity
- Install and wire up the three typefaces (Fraunces, Hanken Grotesk, JetBrains Mono); remove Inter entirely.
- Implement the full token set (Section 3: colors, spacing, radius, shadows, borders) as CSS variables/Tailwind theme config.
- Build the base Button and Input components (Section 5.1–5.2) and the Ticket-Stub Card shell (Section 5.3.1, including the perforation-notch mask) — this is the foundational object everything else builds on.

## Phase B — Highest-Impact Applicant Experience
- Landing page (departure-board hero, Destination Poster Cards).
- Authentication page (check-in counter framing).
- Application form (boarding-pass progress strip, section transitions, validation states, autosave confirmation).
- Submission Success page (the stamp moment).
- Applicant Status page.

## Phase C — Admin Experience
- Admin Summary Tiles and table (Section 5.6), filters, search.
- Applicant review Drawer.
- Shortlisting interaction and its Modal (for any destructive-only actions).
- Mobile stacked-card fallback for the admin table.

## Phase D — Motion and Polish
- The departure-board flip animation (landing page load + live status changes).
- The full submission-stamp animation craft pass.
- Skeleton loading states across admin and status pages.
- Full accessibility and reduced-motion pass across every page built in Phases A–C.
- Empty/error state final polish for every page listed in Section 6.

---

# SECTION 12 — ANTIGRAVITY IMPLEMENTATION INSTRUCTIONS

- Inspect the existing component architecture (`components/`, existing form and table logic) before rewriting anything — reuse existing state management, data-fetching, and routing logic. This is a **visual and interaction redesign**, not a rebuild.
- Preserve all existing functionality and backend/API behavior exactly. Do not change business logic, validation rules, Firestore queries, authentication flow, or any API route while doing UI work — if a visual change seems to require a logic change, stop and flag it rather than making the change silently.
- Reuse the existing component architecture where sensible — extend `components/FormComp.jsx`, `components/DataTable.jsx`, etc. in place rather than creating a parallel set of components unless a genuinely new component (e.g., the Ticket-Stub Card) has no reasonable existing equivalent.
- Do not introduce unnecessary dependencies. Fraunces, Hanken Grotesk, and JetBrains Mono are available via standard font-loading (Google Fonts or self-hosted) — no new animation library is required; standard CSS transitions/transforms (or the project's existing animation tooling, if any) are sufficient for every motion spec in Section 7.
- Implement incrementally, following the phase order in Section 11 — do not attempt Phases A through D in a single pass.
- Check both desktop and mobile after every major change — every component and page spec in this document includes explicit mobile behavior; treat it as required, not optional.
- Do not invent visual styles, colors, fonts, or motion patterns outside this design system. If a situation arises that this document doesn't cover, default to the closest existing token/pattern rather than introducing a new one, and flag the gap for review.
- Do not fall back to generic AI design defaults under any circumstances — re-check new work against Section 2's rules before considering any component or page complete.
- Follow the design tokens (Section 3) and motion rules (Section 7) exactly — treat the specific values in this document (hex codes, px values, durations, easings) as fixed specification, not suggestions.

---

# FINAL QUALITY CHECK

- **Fun:** Yes — the departure-board flip, the submission stamp, and the "now boarding" framing are genuinely playful without needing cartoon illustration.
- **Premium:** Yes — airline/ticketing visual language carries inherent polish associations; the restrained shadow/border discipline and the serif-plus-mono typography pairing read as considered, not templated.
- **Product-specific:** Yes — the metaphor was chosen specifically because it maps one-to-one onto this product's real flows (departments as destinations, applications as tickets); it would need real rework to fit a different kind of product.
- **Usable:** Yes — every creative decision was checked against real UX research (Section 1 of the research report): real-time validation, save/resume, accessible status states, skeleton loading, and a table system built for fast scanning were treated as non-negotiable foundations, with the metaphor built on top of them, never instead of them.
- **Coherent:** Yes — one object (the ticket-stub) and one motion signature (the flip) recur across landing, form, success, status, and admin, at different densities but never a different visual language.
- **Non-generic:** Yes — every item on the Section 2 checklist directly targets a specifically documented AI-generated-interface tell (purple gradients, Inter, glassmorphism, decorative shadows, color-only status, uniform radii) rather than a vague "make it not look like AI" instruction.
- **Implementable:** Yes — no 3D, no WebGL, no exotic dependencies; every component and motion spec is buildable with standard CSS/React patterns inside the existing Next.js architecture, phased to avoid a single overwhelming rewrite.
