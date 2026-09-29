# SCJE / BSISM Student System (Web App)

This repository contains the web-based version of the SCJE/BSISM Student System (BSISM — Bachelor of Science in Industrial Security Management, a four-year Philippine degree focused on asset protection, risk reduction, and safety operations), migrated from the original Flutter application design. It serves Admin/Staff, Instructors, and Students.

## Features & Implementation

Based on the original system requirements, this web app implements:

*   **First-Time Login Registration**: Intercepts new users and securely collects their Picture, Full Name, Birthday, Course/Section, and Gender before allowing access.
*   **Role-Based Access Control**: a strict hierarchy — **admin > instructor > student > view-only** — read from one table in `frontend/src/access.ts` that decides each role's dashboard, header navigation links and which routes it may open.
    *   **Students**: their own dashboard (enrolled subjects, GPA, upcoming classes), personal grades and schedule.
    *   **Instructors**: a teaching dashboard (classes handled, subjects, students taught), the classes they teach in the schedule, and grades for their department.
    *   **Admins**: a fully functional back office — **account management** (create, edit and delete accounts, assign student/instructor/admin roles, with the last-administrator account protected from deletion or demotion), **announcements** (publish, edit, set start/end times, attach a picture by upload or link, pin — any number can stay pinned and the pinned set stacks in the dashboard intro band), **events** (drafts, published/cancelled status, start/end times, pictures, pinning, and Latest/Upcoming/Finished filters where finished events stay on file as records), **faculty CRUD**, and a **record hub** per account for recording grades and managing schedule rows. Their dashboard opens on student/faculty/event counts with shortcuts to all of it.
    *   **View-only**: the **landing page at `/`** — lists events, hosts the **inline Sign in form** (`#signin`), and needs no account (`/view-only` is an alias; `/login` redirects to `/`; no demo account signs in as view-only).
*   **Route guards**: pages check the session before rendering — a student who types `/students` is bounced back to their own dashboard, a signed-in session opening `/` goes to its own dashboard, and a session with an unrecognized role never renders a dashboard.
*   **Header navigation (no sidebar)**: the signed-in navbar carries the full menu — Dashboard, Instructors, Schedule, Grades, Events (plus Accounts, Announcements, Manage Events, Manage Faculty for admins), the **Administration** dropdown (faculty & officers, open to every visitor), theme toggle, notifications, and an account menu with the role badge (STUDENT / INSTRUCTOR / ADMINISTRATOR). Below 1100px the links collapse into a burger sheet.
*   **Introduction-style dashboards**: the landing page and every signed-in dashboard open like an introduction page — eyebrow (`SCJE Student Hub · Introduction`), welcome copy and a decorative gradient art panel, with the pinned **Hero** beneath it (greets the user; stacks every pinned announcement/event — badge `📌 N Pinned` — with fallback stats), News/Announcements, and shortcuts.
*   **Pictures on events & announcements**: the manage forms attach a picture two ways — a file upload (downscaled client-side, stored as a data URL) or a pasted image link. Feed cards, dashboard pins and the event detail page display it; items without one fall back to a branded gradient **placeholder tile** instead of a broken image.
*   **Weekly timetable schedule**: `/schedule` lays every class out on a weekly grid — day columns (Mon–Fri plus any extra days) against time rows, overlapping classes packed side by side, colour-coded subject blocks, a search box and a **section filter**, today's column highlighted with a live **NOW** line, and a fallback list for rows whose times cannot be parsed. Scope follows the role: students see their own classes ("Class Schedule"), instructors the classes they teach ("My Teaching Schedule"), admins the whole school ("School Schedule") and can add, edit or delete a class **right on the grid — section-scoped**, so one edit updates every student in that section through the existing per-student schedule API.
*   **Installable PWA**: A web app manifest (same name and icons as the Flutter app, `#380711` theme) lets Chrome/Edge install it to the taskbar or home screen.
*   **Offline support**: The service worker precaches the app shell and stores the last successful response of every `GET /api/…`, so deep links and content still load with no connection. A gold strip at the bottom says so, so saved data is never mistaken for fresh data.
*   **Gradient + glass theme**: purple-red identity (`--grad-primary`, page-level gradient washes via `--bg-image`) with **frosted-glass text cards** (`--card-glass` + `backdrop-filter`) in both themes; Navy, Crimson and Gold remain the accent tokens from the Flutter app.
*   **Dark mode**: One token palette (`:root` light / `[data-theme="dark"]` dark) in `index.css`, so every screen switches at once — light gets a soft lilac/blush wash with white glass cards, dark gets the red-purple gradient with darker frosted cards. The moon/sun button in the navbar is applied before the first paint, follows the OS preference when you have not chosen, and is remembered in `localStorage`.

> **`FLUTTER-REVIEW.md`** — full inventory of the companion Flutter app (`../scje_system`) and a feature-by-feature read of what this web app can reuse from it.

## Project Structure
```text
scje-web-app/
├─ architecture.md          # Detailed system architecture and logic rules
├─ frontend/                # React SPA (Vite + TypeScript)
│   ├─ vite.config.ts       # PWA: manifest, precache, offline API cache
│   ├─ public/icons/        # PWA icons (shared with the Flutter build)
│   └─ src/
│       ├─ components/      # Navbar.tsx, PinnedHero.tsx, LoginForm.tsx, OfflineBanner.tsx
│       ├─ pages/           # Events, EventDetail, Manage*, Students, Faculty,
│       │                    # Schedule, Grades, Profile, RegisterProfile
│       └─ main.tsx         # reloads once when the worker first claims the page
├─ backend/                 # Express API
│   └─ src/
│       ├─ index.js         # API Routes (Auth, Events, Faculty)
│       └─ mockData.js      # Mock MIS Office Data
```

## Getting Started

You will need two terminal windows to run this full-stack application locally.

### 1. Run the Backend API
The backend provides the mock MIS data and handles JWT authentication.
```bash
cd backend
npm install
npm start
```
*Runs on `http://localhost:4000`*

### 2. Run the Frontend App
```bash
cd frontend
npm install
npm run dev
```
*Runs on `http://localhost:5173`*

### 3. Demo the PWA / offline mode

`npm run dev` already registers the service worker and serves the manifest, so the
app is installable from the dev server too (address-bar install icon, or
*Install app* in the Chrome menu). Offline rendering needs the built bundle,
because that is what gets precached:

```bash
cd frontend
npm run build
npm run preview
```
*Runs on `http://localhost:4173`*

To show offline use: open `http://localhost:4173` and let it load once so the
cache fills, then DevTools → Network → **Offline** → reload. The shell renders
from the precache, the last events/grades are still on screen, and a gold strip
appears at the bottom saying you are offline. Deep links (`/events/5`) resolve
the same way instead of showing a browser error.

---

## 🧪 Demo Login Credentials

Use the following credentials in the **Sign in section on the landing page** (password for all is `password123`) — each demo card clicks itself in. They are designed to test the specific routing logic of the system:

1. **First-Time Criminology Student (Full Access + Registration Test)**
   - **Email:** `crim@chcc.edu.ph`
   - *Behavior:* Triggers the First-Time Registration screen, then grants full dashboard access.
   
2. **Existing ISM Student (Full Access)**
   - **Email:** `ism@chcc.edu.ph`
   - *Behavior:* Bypasses registration and goes straight to the full dashboard, with a completed profile (picture, birthday, gender) already on file.

3. **Instructor (Staff)**
   - **Email:** `instructor@chcc.edu.ph`
   - *Behavior:* Lands on the instructor dashboard — the classes Prof. Mark Santos teaches, his department's grades, and no back-office links.

4. **Administrator (MIS Office)**
   - **Email:** `admin@chcc.edu.ph`
   - *Behavior:* Full access as the shared MIS office account — name renders as "Admin", the dashboard shows roster/faculty/event counts, and the header nav adds Accounts, Announcements, Manage Events and Manage Faculty.
