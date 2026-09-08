# GDG Recruitment Portal — Concourse

A full-stack recruitment portal built for **Google Developer Groups (GDG)** on campus, designed with the **Concourse** design system — a travel-terminal–themed UI inspired by airport concourses, boarding passes, and departure boards.

Built with **Next.js 14** (App Router), **Firebase/Firestore**, **better-auth**, and **Tailwind CSS**.

---

## ✨ Features

### Applicant Experience
- **Terminal Landing Page** — Fraunces display typography with split-flap departure board animation showcasing departments
- **Check-In Authentication** — Google OAuth and email/password sign-in via `better-auth`, styled as a ticket-stub check-in counter
- **Destination Posters** — Department selection with tap-to-swap priority (1st/2nd choice), curated accent color rotation, real-time slot tracking
- **Boarding Pass Application** — Multi-step form with perforated progress strip, directional slide transitions, localStorage draft persistence, and pre-submit review
- **Ceremonial Boarding Ticket** — Full-screen success composition with ink-stamp animation, registration code, and next-steps timeline
- **Personal Departure Board** — View submitted applications with status badges, timestamps, and expandable read-only responses

### Admin Control Tower
- **Dedicated Left-Rail Navigation** — Collapsible 72px/220px admin sidebar, separate from applicant navigation
- **Summary Tiles** — Real-time metric cards (Total Applicants, Under Review, Shortlisted) in JetBrains Mono
- **Dense Data Table** — 56px row height, zebra striping, sticky header, inline shortlist toggle, applicant dossier drawer
- **Bulk Email Dispatch** — Rich text email composer (TipTap) with safety confirmation modal, powered by Nodemailer
- **CSV Export** — One-click export of filtered applicant data

### Design System
- **Typography**: Fraunces (display), Hanken Grotesk (body), JetBrains Mono (data/mono)
- **Color Palette**: Warm paper cream (`#FAF6EC`), airline navy (`#10233D`), amber accent (`#F2A93B`), ink stamp red (`#8B2E2E`)
- **Anti-AI-Slop**: No purple gradients, no glassmorphism, no stock photos, no Inter — every design choice is intentional

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14.2 (App Router) |
| **Language** | JavaScript (JSX) |
| **Styling** | Tailwind CSS 3.4 + CSS custom properties |
| **Authentication** | better-auth 1.6 + Google OAuth |
| **Database** | Firebase Cloud Firestore (via firebase-admin) |
| **Email** | Nodemailer + Gmail App Password |
| **Rich Text Editor** | TipTap (admin email composer) |
| **UI Primitives** | Radix UI (Dialog, Select, Dropdown, etc.) |
| **Form Handling** | React Hook Form + Zod validation |
| **Animations** | Framer Motion |
| **Icons** | Lucide React + Material Symbols SVG |

---

## 📁 Project Structure

```
├── app/
│   ├── layout.js                    # Root layout (fonts, providers, toaster)
│   ├── page.jsx                     # Landing page (Terminal)
│   ├── globals.css                  # Concourse design tokens & utilities
│   ├── loading.jsx                  # Global loading state
│   ├── _error.js                    # Error boundary
│   ├── auth/
│   │   ├── signin/page.jsx          # Check-In Counter (sign-in)
│   │   └── signout/                 # Sign-out flow
│   ├── (pages)/
│   │   ├── departments/page.jsx     # Destination Posters (department selection)
│   │   ├── join/[...joinIds]/       # Boarding Pass (application form)
│   │   ├── status/page.jsx          # Personal Departure Board
│   │   └── admin/page.jsx           # Control Tower (admin dashboard)
│   └── api/
│       ├── auth/[...all]/           # better-auth API handler
│       ├── submit-form/             # Application submission
│       ├── check-applications/      # Check user's submitted departments
│       ├── check-department-submission/ # Check specific department submission
│       ├── get-submissions/         # Fetch user's submissions
│       ├── admin/applicants/        # Admin: fetch all applicants
│       ├── shortlist/[id]/          # Admin: toggle shortlist status
│       └── send-email/              # Admin: bulk email dispatch
├── components/
│   ├── NavBar.jsx                   # Applicant navigation (boarding-pass chip)
│   ├── AdminNav.jsx                 # Admin left-rail navigation
│   ├── AdminContent.jsx             # Admin dashboard container
│   ├── Hero.jsx                     # Terminal landing hero section
│   ├── Footer.jsx                   # Site footer
│   ├── FormComp.jsx                 # Multi-step application form
│   ├── DataTable.jsx                # Admin data table (react-table)
│   ├── MailComposer.jsx             # Rich text email composer (TipTap)
│   ├── SubmissionsProvider.jsx      # Global submissions context
│   ├── FilterDepartment.jsx         # Department filter (admin)
│   ├── FilterShortlisted.jsx        # Shortlist filter (admin)
│   ├── PaginationComp.jsx           # Table pagination
│   ├── CheckBoxComp.jsx             # Table row selection checkbox
│   ├── Card.jsx                     # Department card component
│   ├── GDGLoader.jsx                # Loading spinner
│   └── ui/                          # Design system primitives
│       ├── TicketStub.jsx           # Ticket-stub card container
│       ├── DestinationCard.jsx      # Department poster card
│       ├── SummaryTile.jsx          # Admin metric tile
│       ├── StatusBadge.jsx          # Application status badge
│       ├── EmptyState.jsx           # Empty state placeholder
│       ├── Modal.jsx                # Confirmation modal
│       ├── button.jsx, input.jsx, textarea.jsx  # Form primitives
│       └── (radix wrappers)         # dialog, select, dropdown-menu, etc.
├── constants/
│   └── index.js                     # Department data, form questions, admin list
├── lib/
│   ├── auth.js                      # better-auth server config
│   ├── auth-client.js               # better-auth client wrapper
│   ├── authorize.js                 # Admin session authorization
│   ├── db.ts                        # Firestore connection (firebase-admin)
│   ├── ownDataAuth.js               # User data access authorization
│   ├── rateLimit.js                 # API rate limiting
│   └── utils.js                     # Utility functions (cn)
├── tests/
│   └── security-and-workflow.test.mjs  # Security & workflow tests

├── tailwind.config.js               # Concourse tokens in Tailwind
├── next.config.mjs                  # Next.js configuration
├── firebase.json                    # Firebase hosting & rules config
├── firestore.rules                  # Firestore security rules
├── firestore.indexes.json           # Firestore indexes
└── designing.md                     # Concourse design system specification
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** or **bun**
- A **Firebase** project with Firestore enabled
- A **Google Cloud OAuth** client (for Google sign-in)

### 1. Clone & Install

```bash
git clone <repository-url>
cd recruitment-portal
npm install
```

### 2. Configure Environment

Copy the example environment file and fill in your credentials:

```bash
cp .env.example .env.local
```

Required variables:

| Variable | Description |
|---|---|
| `FIREBASE_PROJECT_ID` | Firebase project ID |
| `FIREBASE_CLIENT_EMAIL` | Firebase Admin SDK service account email |
| `FIREBASE_PRIVATE_KEY` | Firebase Admin SDK private key |
| `NEXT_PUBLIC_FIREBASE_*` | Firebase client SDK config (6 variables) |
| `BETTER_AUTH_SECRET` | Random 32-character secret for session signing |
| `BETTER_AUTH_URL` | Application URL (`http://localhost:3000` for dev) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |

Optional variables:

| Variable | Description |
|---|---|
| `EMAIL_USERNAME` | Gmail address for email dispatch |
| `EMAIL_PASSWORD` | Gmail app password |
| `SUBMISSION_DEADLINE` | ISO 8601 deadline for applications |
| `FIRESTORE_EMULATOR_HOST` | Local Firestore emulator address |

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Build for Production

```bash
npm run build
npm start
```

---

## 🗺️ Route Map

| Route | Type | Description |
|---|---|---|
| `/` | Static | Terminal landing page |
| `/auth/signin` | Static | Check-in counter (authentication) |
| `/auth/signout` | Static | Sign-out flow |
| `/departments` | Static | Destination posters (department selection) |
| `/join/[...joinIds]` | Dynamic | Boarding pass (application form) |
| `/status` | Static | Personal departure board (submission status) |
| `/admin` | Dynamic | Control tower (admin dashboard) |

---

## 🔌 API Routes

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/auth/[...all]` | ALL | — | better-auth handler (sign-in, sign-up, session) |
| `/api/submit-form` | POST | User | Submit application for a department |
| `/api/check-applications` | GET | User | Check which departments user has submitted to |
| `/api/check-department-submission` | GET | User | Check if a specific department was submitted |
| `/api/get-submissions` | GET | User | Fetch user's full submission data |
| `/api/admin/applicants` | GET | Admin | Fetch all applicants |
| `/api/shortlist/[id]` | PATCH | Admin | Toggle shortlist status |
| `/api/send-email` | POST | Admin | Send bulk invitation emails |

---

## 🛡️ Security

- **Authentication**: All sensitive routes require a valid `better-auth` session
- **Admin Authorization**: Admin routes check against a hardcoded admin list in `constants/index.js`
- **Rate Limiting**: API routes are rate-limited via `lib/rateLimit.js`
- **Firestore Rules**: Database access is controlled by `firestore.rules`
- **CSRF Protection**: better-auth provides built-in CSRF protection via `Origin` header validation
- **Input Validation**: All form submissions are validated with Zod schemas

---

## 📜 Scripts

| Script | Command | Description |
|---|---|---|
| `dev` | `npm run dev` | Start development server |
| `build` | `npm run build` | Create production build |
| `start` | `npm start` | Start production server |
| `lint` | `npm run lint` | Run ESLint |
| `clean` | `npm run clean` | Remove `.next` build cache |

---

## 🧪 Testing

```bash
node --test tests/security-and-workflow.test.mjs
```

Runs security and workflow integration tests covering authentication, authorization, form submission, and admin operations.

---

## 📐 Design System Reference

The full Concourse design specification is documented in [`designing.md`](designing.md), covering:

- **Typography Scale** — Display, heading, body, small, and mono type styles
- **Color Tokens** — Warm paper, airline navy, amber accent, ink stamp, and semantic colors
- **Radius Hierarchy** — Sharp (2px), Input (4px), Button (6px), Panel (8px), Pill (999px)
- **Shadow System** — Float and Modal elevation only (hairline borders as default)
- **Component Specifications** — Ticket stubs, destination cards, summary tiles, status badges
- **Anti-AI-Slop Checklist** — 15 rules ensuring authentic, intentional design

---

## 📄 License

This project is private and proprietary.
