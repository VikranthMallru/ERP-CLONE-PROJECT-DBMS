# ERP Clone Project — Hosting Report

## Architecture Overview

```
┌──────────────┐     ┌──────────────────┐     ┌─────────────────────────┐
│  EIMS        │────▶│  EIMS Backend    │────▶│                         │
│  Frontend    │     │  (Render)        │     │   Supabase PostgreSQL   │
│  (Vercel)    │     │  Node.js/Express │     │   (Cloud Database)      │
└──────────────┘     └──────────────────┘     │                         │
                                                │  35 Tables + 1 Auto    │
┌──────────────┐     ┌──────────────────┐     │  21 Views               │
│  Bank        │────▶│  Bank Backend    │────▶│  19 Triggers            │
│  Frontend    │     │  (Render)        │     │  35 Functions           │
│  (Vercel)    │     │  Node.js/Express │     │                         │
└──────────────┘     └──────────────────┘     └─────────────────────────┘
```

## Live URLs

| Service | Platform | URL |
|---------|----------|-----|
| EIMS Frontend | Vercel | https://eims-frontend-sand.vercel.app |
| Bank Frontend | Vercel | https://bank-frontend-seven.vercel.app |
| EIMS Backend | Render | https://eims-backend-83ds.onrender.com |
| Bank Backend | Render | https://bank-backend-lf04.onrender.com |
| Database | Supabase | Project `faevzoqhmkyjxnjvgnpr` (Tokyo region) |
| Source Code | GitHub | https://github.com/VikranthMallru/ERP-CLONE-PROJECT-DBMS |

---

## Platform Selection & Reasoning

| Platform | Role | Why Chosen |
|----------|------|------------|
| **Supabase** | PostgreSQL Database | Free tier, managed PostgreSQL, SQL Editor for admin, built-in auth infra |
| **Render** | Backend Hosting | Free tier for web services, auto-deploy from GitHub, supports Node.js |
| **Vercel** | Frontend Hosting | Free tier for React apps, instant deploys from GitHub, global CDN |
| **GitHub** | Source Control | Central repo, triggers auto-deploys on both Render and Vercel |

---

## Step-by-Step Hosting Process

### 1. Database Setup (Supabase)

**Created unified schema** — Combined EIMS (31 tables) + Bank (4 tables) into a single `supabase_schema.sql`:
- Users, Departments, Discipline, Students, Faculty, Faculty_Advisor
- Courses, Prerequisites, Course_Offerings, Course_Allotted, Course_Registration
- Attendance, Grades, Feedback, Results, Backlogs
- Rooms, Scheduled_class, booked_class
- Leave_Requests, On_Leave
- Fee_Payment, Fee_Remission_Application, Balance
- Exams, Exam_Seating, Supplementary_exams
- System_Config, CDC, CDC_Eligible_Departments, CDC_Applications
- Customers, Accounts, Transactions, Transfers (Bank)

**Created extras script** (`supabase_extras.sql`) — 21 views, 19 triggers, 35 functions/procedures, constraints, and indexes.

**Schema fixes applied:**
- `Leave_Requests.request_id` changed to SERIAL (auto-increment)
- `booked_class.booking_date` column added with default `CURRENT_DATE`
- Bank tables completely rewritten (Customers with SERIAL PK + password, Accounts with SERIAL, Transactions with `transaction_type`, Transfers with proper FKs)
- `transactions.type` renamed to `transaction_type` (reserved word conflict)

### 2. Backend Deployment (Render)

**EIMS Backend:**
- Platform: Render Web Service (Free tier)
- Build Command: `npm install`
- Start Command: `node app.js`
- Root Directory: `eims-backend`
- Auto-deploy: Connected to GitHub `main` branch

**Bank Backend:**
- Platform: Render Web Service (Free tier)
- Build Command: `npm install`
- Start Command: `node bank-app.js`
- Root Directory: `eims-backend` (shares same folder)
- Auto-deploy: Connected to GitHub `main` branch

**Environment Variables (both backends):**

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | `postgresql://postgres.faevzoqhmkyjxnjvgnpr:...@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres` |
| `BANK_FRONTEND_URL` | `https://bank-frontend-seven.vercel.app` |
| `EIMS_BACKEND_URL` | `https://eims-backend-83ds.onrender.com` |
| `NODE_ENV` | `production` |

### 3. Frontend Deployment (Vercel)

**EIMS Frontend:**
- Framework: Create React App
- Root Directory: `eims-frontend`
- Auto-deploy: Connected to GitHub `main` branch

**Bank Frontend:**
- Framework: Create React App
- Root Directory: `bank-frontend`
- Auto-deploy: Connected to GitHub `main` branch

**Environment Variables:**

| Service | Variable | Value |
|---------|----------|-------|
| EIMS Frontend | `REACT_APP_API_URL` | `https://eims-backend-83ds.onrender.com` |
| EIMS Frontend | `REACT_APP_BANK_URL` | `https://bank-frontend-seven.vercel.app` |
| EIMS Frontend | `CI` | `false` |
| Bank Frontend | `REACT_APP_API_URL` | `https://bank-backend-lf04.onrender.com` |
| Bank Frontend | `REACT_APP_EIMS_URL` | `https://eims-frontend-sand.vercel.app` |
| Bank Frontend | `CI` | `false` |

### 4. GitHub Setup

- Repository: `VikranthMallru/ERP-CLONE-PROJECT-DBMS`
- Branch: `main`
- `.gitignore`: Added `ERP-clone-main-new.zip` to avoid 156MB push block
- Auto-deploy pipeline: `git push origin main` → triggers Render + Vercel builds automatically

---

## Issues Encountered & Resolved

| # | Issue | Root Cause | Fix |
|---|-------|-----------|-----|
| 1 | Render backend couldn't connect to Supabase | IPv6 — Render free tier only supports IPv4 | Switched from direct connection URL to **Session Pooler URL** (IPv4 compatible) |
| 2 | Vercel build failing | `CI=true` treats ESLint warnings as errors | Added `CI=false` environment variable |
| 3 | Git push 403 error | PAT token lacked `repo` scope | Regenerated GitHub PAT with correct permissions |
| 4 | Git push blocked by large file | 156MB zip file tracked in git | Removed from git, added to `.gitignore` |
| 5 | Profile update 500 error | Empty strings for `department_id` (INT FK) caused PostgreSQL cast error | Applied `\|\| null` coalescing for all FK fields |
| 6 | `transactions.type` column conflict | `type` is a PostgreSQL reserved word | Renamed to `transaction_type` throughout schema and backend |
| 7 | Render start command wrong | User typed `npm app.js` | Changed to `node app.js` |

---

## New Features Added During Hosting

After initial deployment, 19 new features were merged from a newer codebase version:

### Frontend (10 new components)

| Component | Description |
|-----------|-------------|
| `Results.js` | Student results page — CGPA card + grades grouped by semester |
| `StudentAttendance.js` | Attendance dashboard with per-course breakdown |
| `FacultyProfile.js` | Faculty profile view/edit form |
| `FacultySchedule.js` | Weekly timetable grid for faculty |
| `CourseApprovals.js` | Faculty course registration approval interface |
| `AdminSQLConsole.js` | Full SQL query console with history, CSV export, security checks |
| `AdminDashboard.js` | Admin page wrapping the SQL console |
| `Signup.js` (rewritten) | Role-based signup with conditional student/faculty profile fields |
| `Dashboard.js` (updated) | Added Attendance + Results tabs for students |
| `FacultyDashboard.js` (updated) | Added Profile + Schedule tabs + logout |

### Backend (15+ new/updated endpoints)

**New endpoints:**
- `GET/POST /faculty/profile` — Faculty profile management
- `GET /faculty/buildings` — List available buildings
- `POST /faculty/book-class` — Schedule a class in a room
- `GET /faculty/:id/schedule` — Faculty weekly schedule
- `POST /admin/declare-results` — Declare results (updates CGPA)
- `GET /admin/system-config` — System configuration
- `POST /admin/run-query` — Admin SQL console (with security: role check, DDL blocking, 100-row limit, 5s timeout, query logging)
- `GET /student/:id/results` — Student CGPA + credits
- `GET /student/:id/grades` — All grades with course info

**Updated endpoints:**
- `/signup` — Accepts full student/faculty profile fields
- `/faculty/approve` — Enhanced logging, trigger verification
- `/faculty/mark-attendance` — Supports both array and direct ID formats
- `/faculty/:id/courses` — Added `capacity` field
- `/faculty/:id/current-courses` — Added enrolled student count
- `/faculty/:id/leave-requests` — Direct JOIN instead of view
- `/faculty/available-slots` — Rewritten to query Rooms by building
- `/faculty/book-rooms` — Simplified single-booking insert
- `/faculty/:id/bookings` — Rich JOIN with course and room info
- `/faculty/course/:id/feedbacks` — Added input validation, richer response

### Auto-created Table
- `Admin_Query_Logs` — Created automatically on backend startup via `CREATE TABLE IF NOT EXISTS`

---

## Database Verification

A comprehensive test suite (`supabase_test.sql`) with 20 tests verifies:
- 36 tables present (35 schema + 1 auto-created)
- 21 views present
- 19+ triggers present
- 35+ functions present
- Column-level checks (SERIAL keys, renamed columns, FK columns)
- Insert/delete smoke tests for both EIMS and Bank
- Key trigger and function existence
- Foreign key constraint count

**Result: All 20 tests pass ✅**

---

## Deployment Workflow

For any future changes:

```
1. Edit code locally
2. git add -A && git commit -m "description"
3. git push origin main
4. Auto-deploys trigger on Render (~2-5 min) and Vercel (~1-2 min)
5. Verify at live URLs
```

No manual redeploy needed — everything is CI/CD via GitHub.
