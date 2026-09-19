# CorresBuddy

> **Empowering Generational Knowledge Transfer Across Academic Cohorts**

CorresBuddy is an institutional academic mentorship and resource-sharing platform. It preserves institutional knowledge across graduating classes by pairing every student with their **Corres** — the senior who occupied their exact seat (same roll number, preceding batch) in the exact same academic program.

---

## Table of Contents

1. [The Corres Concept](#the-corres-concept)
2. [Color Palette & Branding](#color-palette--branding)
3. [Tech Stack](#tech-stack)
4. [Architecture Overview](#architecture-overview)
5. [Prerequisites](#prerequisites)
6. [Setup & Installation](#setup--installation)
7. [Environment Variables](#environment-variables)
8. [Database Setup & Seeding](#database-setup--seeding)
9. [Running Development Servers](#running-development-servers)
10. [Default Test Accounts](#default-test-accounts)
11. [Email Configuration & Fallback](#email-configuration--fallback)
12. [Institutional Email Validation](#institutional-email-validation)
13. [Corres Assignment Engine](#corres-assignment-engine)
14. [API Endpoints Summary](#api-endpoints-summary)
15. [Key Features Walkthrough](#key-features-walkthrough)
16. [Security & Role Management](#security--role-management)
17. [Contributing Guidelines](#contributing-guidelines)

---

## The Corres Concept

What one generation learns in college should not be lost when it graduates. Traditional campus knowledge (which electives to choose, how professors grade, previous-year question papers, interview experiences, lab manuals) is routinely lost every academic year.

**CorresBuddy solves this through Generational Pairing:**
- **Same Roll Number Match**: Student \(N\) in Batch 2026 is automatically paired with Senior \(N\) in Batch 2025.
- **Top Performer Fallback**: If no senior exists with the exact roll number, the platform automatically pairs the student with a top-performing senior from the preceding batch.
- **Lineage Chain**: Students can trace their lineage back through generations (2026 → 2025 → 2024 → 2023).

---

## Color Palette & Branding

CorresBuddy adheres to an institutional, high-contrast palette:

| Color Role | Hex Code | Purpose |
| :--- | :--- | :--- |
| **Navy Blue** | `#002147` | Primary brand color, headers, primary buttons, sidebar background |
| **Yellow** | `#FFC400` | Notification badges, flame streaks, active navigation highlights |
| **White** | `#FFFFFF` | Backgrounds, surface cards, elevated containers |
| **Black** | `#000000` | Primary typography, headers, high-contrast text |
| **Blue Gray** | `#546970` | Secondary typography, borders, metadata, inactive icons |

- **Official Brand Name**: `CorresBuddy` (strictly CamelCase, no spaces).

---

## Tech Stack

### Frontend
- **Framework**: React 18 with Vite
- **Routing**: `react-router-dom` v6 (URL persistence, native browser history)
- **Styling**: Tailwind CSS + Custom CSS Variables
- **Icons**: Custom SVG system (`Icon.jsx`, `CommonUI.jsx`)
- **Real-Time**: Socket.io Client

### Backend
- **Runtime**: Node.js (Express.js)
- **Database ORM**: Prisma ORM with SQLite (Development) / PostgreSQL (Production)
- **Authentication**: JWT (JSON Web Tokens) with HTTP headers & `bcryptjs`
- **Email Service**: `nodemailer` (SMTP transport with safe dev fallback logging)
- **File Uploads**: `multer` with secure local disk storage & streaming download endpoints

---

## Architecture Overview

```
 ┌─────────────────────────────────────────────────────────────┐
 │                      Client (React + Vite)                  │
 │   - URL Routing (/dashboard, /resources, /qa, /admin/*)    │
 │   - Auth Token & Session State (localStorage)               │
 │   - Socket.io Client for real-time notifications & chat     │
 └──────────────────────────────┬──────────────────────────────┘
                                │ HTTP / REST & WebSockets
                                ▼
 ┌─────────────────────────────────────────────────────────────┐
 │                   Express.js Application                    │
 │  ┌───────────────────────────────────────────────────────┐  │
 │  │ API Routers (/api/v1/auth, /resources, /qa, /corres)  │  │
 │  └───────────────────────────┬───────────────────────────┘  │
 │                              ▼                              │
 │  ┌───────────────────────────────────────────────────────┐  │
 │  │ Controllers & Business Services                       │  │
 │  │ - emailParser (Strict domain & academic data)        │  │
 │  │ - email.service (Welcome & Login alert emails)        │  │
 │  │ - assignment.service (Deterministic roll pairing)     │  │
 │  └───────────────────────────┬───────────────────────────┘  │
 │                              ▼                              │
 │  ┌───────────────────────────────────────────────────────┐  │
 │  │ Prisma ORM Client                                      │  │
 │  └───────────────────────────┬───────────────────────────┘  │
 └──────────────────────────────┼──────────────────────────────┘
                                ▼
 ┌─────────────────────────────────────────────────────────────┐
 │            Database (dev.db / SQLite or PostgreSQL)         │
 └─────────────────────────────────────────────────────────────┘
```

---

## Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Operating System**: Windows, macOS, or Linux

---

## Setup & Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd corresbuddy
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
```
Run Prisma migrations and seed the database:
```bash
npx prisma db push --schema=prisma/schema.sqlite.prisma
node prisma/seed.js
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

---

## Environment Variables

The backend configuration is managed via `backend/.env`. A template is provided in `backend/.env.example`:

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `PORT` | `5000` | Port for the Express server |
| `NODE_ENV` | `development` | Environment mode (`development` or `production`) |
| `DATABASE_URL` | `file:./dev.db` | Prisma SQLite database connection URL |
| `JWT_SECRET` | `super-secret-key-change-in-production` | Secret key used to sign and verify JWTs |
| `JWT_EXPIRES_IN` | `7d` | Lifetime of authentication tokens |
| `FRONTEND_URL` | `http://localhost:5173` | Allowed CORS origin for frontend requests |
| `UPLOAD_DIR` | `./uploads` | Local directory for storing uploaded resource files |
| `ALLOW_TEST_EMAILS` | `true` | When `true`, enables `@celestia-trichy.me` testing accounts |
| `TEST_PASSWORD` | `Temp@1234` | Default password for seeded testing accounts |
| `EMAIL_HOST` | `smtp.gmail.com` | SMTP host for sending emails |
| `EMAIL_PORT` | `587` | SMTP port (587 for TLS, 465 for SSL) |
| `EMAIL_USER` | `""` | SMTP authentication username / email |
| `EMAIL_PASSWORD` | `""` | SMTP app-specific password |
| `EMAIL_FROM` | `"CorresBuddy <no-reply@corresbuddy.edu>"` | Outgoing sender display header |

---

## Database Setup & Seeding

The project uses Prisma ORM with SQLite for zero-configuration local development.

To reset and seed the database:
```bash
cd backend
npx prisma db push --schema=prisma/schema.sqlite.prisma
node prisma/seed.js
```

The seed script creates:
1. Batches 2024, 2025, and 2026.
2. Verified student, senior, and administrator accounts.
3. Active Corres pairings and historical lineages.
4. Curated academic resources, questions, answers, and sample chats.

---

## Running Development Servers

### Start the Backend Server:
```bash
cd backend
npm run dev
# Server starts at http://localhost:5000
```

### Start the Frontend Application:
```bash
cd frontend
npm run dev
# Application starts at http://localhost:5173
```

---

## Default Test Accounts

Use these accounts to explore all three roles. Password for all accounts is: `Temp@1234`

| Email | Role | Academic Cohort | Roll Number |
| :--- | :--- | :--- | :--- |
| `admin@celestia-trichy.me` | **Admin** | Campus Administrator | N/A |
| `26mca0010@celestia-trichy.me` | **Student** | Batch 2026 (MCA) | 10 |
| `25mca0010@celestia-trichy.me` | **Senior** | Batch 2025 (MCA) | 10 |
| `24mca0010@celestia-trichy.me` | **Senior/Alumni** | Batch 2024 (MCA) | 10 |

---

## Email Configuration & Fallback

CorresBuddy dispatches two critical emails:
1. **Welcome Email**: Sent upon registration with their Corres assignment details.
2. **Login Security Alert**: Sent upon every login with timestamp, IP address, and browser details.

### Fallback Behavior:
If SMTP credentials (`EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASSWORD`) are not provided, the email service operates in **Safe Fallback Mode**:
- Emails are logged cleanly to the backend console.
- No network requests fail.
- User registration and login proceed without interruption.

---

## Institutional Email Validation

To ensure platform integrity, CorresBuddy enforces strict email domain validation:

- **Accepted Production Domains**:
  - `@nitt.edu` (National Institute of Technology, Trichy)
  - `@vit.ac.in` (Vellore Institute of Technology)
- **Accepted Development Domain**:
  - `@celestia-trichy.me` (Allowed only when `ALLOW_TEST_EMAILS=true` or in development mode)
- **Strictly Disallowed**:
  - `@gmail.com` and all other consumer email providers are strictly rejected at both frontend and backend validation layers.

### Automated Academic Profile Extraction:
- `26mca0010@celestia-trichy.me` → Batch: `2026`, Program: `MCA`, Roll: `10`
- `106122001@nitt.edu` → Batch: `2022`, Program: `B.Tech`, Branch: `CSE`, Roll: `1`
- `2022bce0001@vit.ac.in` → Batch: `2022`, Program: `B.Tech`, Branch: `CSE`, Roll: `1`

---

## Corres Assignment Engine

When a new student registers:
1. The engine checks the student's `program`, `branch`, and `rollNumber`.
2. It looks for a senior in batch `student.batchYear - 1` with the exact same `rollNumber`.
3. If found, a `SAME_ROLL` pairing is created.
4. If no exact match exists, the engine falls back to the senior with the highest contribution score (`FALLBACK_TOP_PERFORMER`).

---

## API Endpoints Summary

### Authentication (`/api/v1/auth`)
- `POST /register` — Register a new student with email domain validation and Corres matching.
- `POST /login` — Authenticate user, issue JWT, and dispatch security login alert.
- `GET /me` — Retrieve current authenticated user profile.

### Resources (`/api/v1/resources`)
- `GET /` — List resources with category filtering and search.
- `POST /` — Upload a new resource and metadata.
- `GET /:id` — Get resource metadata by ID.
- `GET /:id/file` — Stream and download the actual resource file (`Content-Disposition: attachment`).
- `GET /saved` — Retrieve bookmarks for current user.
- `POST /:id/save` — Bookmark or unbookmark a resource.

### Questions & Answers (`/api/v1/qa`)
- `GET /` — List community questions.
- `POST /` — Post a new question.
- `GET /:id` — Get question details and answers.
- `POST /:id/answers` — Post an answer to a question.
- `POST /answers/:ansId/accept` — Mark an answer as accepted.

### Corres & Lineage (`/api/v1/corres`)
- `GET /my` — Retrieve assigned Corres senior details.
- `GET /lineage` — Trace historical lineage back across batches.

### Administration (`/api/v1/admin`)
- `GET /stats` — Campus platform analytics.
- `GET /users` — List and filter all registered users.
- `POST /assignments/run` — Manually trigger the Corres assignment engine for unmatched students.

---

## Key Features Walkthrough

1. **TopBar Flame Streak (`🔥`)**:
   - Displays current contribution streak.
   - Click the flame badge to open the interactive LeetCode/Duolingo style Activity Calendar highlighting active days in yellow (`#FFC400`).
2. **True File Downloads**:
   - Resource download buttons stream directly from `/api/v1/resources/:id/file`.
   - Browser saves the file with its original filename without navigating away or opening blank tabs.
3. **URL Persistence & Navigation**:
   - Refreshing any route (e.g. `/resources/res-1` or `/qa/q-1`) keeps the user on that exact view.
   - Back buttons (`← Back`) preserve form inputs and navigation history.
4. **Scroll Controls**:
   - Floating buttons in the bottom right provide smooth scrolling to top and bottom.
5. **Role-Based Security**:
   - Production routes strictly guard administrator and senior privileges.
   - Sidebar role switcher is visible only in development mode for preview testing.

---

## Contributing Guidelines

1. Fork the repository and create a feature branch (`git checkout -b feature/improvement`).
2. Adhere strictly to the institutional color palette (`#002147`, `#FFC400`, `#FFFFFF`, `#000000`, `#546970`).
3. Ensure all tests pass and `npm run build` compiles cleanly.
4. Never commit `.env` or SQLite `.db` files.
5. Submit a descriptive Pull Request.

---

© 2026 **CorresBuddy**. All rights reserved.

