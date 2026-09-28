# SCJE / BSISM Student System (Web App)

This repository contains the web-based version of the SCJE/BSISM Student System, migrated from the original Flutter application design. It serves Admin/Staff, Instructors, and Students.

## Features & Implementation

Based on the original system requirements, this web app implements:

*   **First-Time Login Registration**: Intercepts new users and securely collects their Picture, Full Name, Birthday, Course/Section, and Gender before allowing access.
*   **Role-Based Access Control**:
    *   **SCJE / ISM Students (Crim)**: Full access to the Main Dashboard, Schedules, Grades, and Instructors.
    *   **Non-Department Students**: Restricted to a "View-Only" mode where they can only see Upcoming/Recent Events.
*   **Dynamic Dashboard**:
    *   **Drawer**: Displays exact user info (Picture, Name, Birthday).
    *   **Body**: Features a pinned Hero section, News/Announcements, and shortcuts.
*   **Administration Navbar**: A dedicated Navigation Bar menu that displays Faculty Members and Officers when clicked.
*   **Installable PWA**: A web app manifest (same name, icon and `#0B3D63` theme as the Flutter app) lets Chrome/Edge install it to the taskbar or home screen.
*   **Offline support**: The service worker precaches the app shell and stores the last successful response of every `GET /api/…`, so deep links and content still load with no connection. A gold strip at the bottom says so, so saved data is never mistaken for fresh data.
*   **Flutter-Inspired Theme**: Matches the original `scje_system` mobile app styling (Navy, Crimson, Gold, Material 3 borders).
*   **Dark mode**: One token palette (`:root` light / `[data-theme="dark"]` dark) in `index.css`, so every screen switches at once. The moon/sun button in the navbar — and on the login screen — is applied before the first paint, follows the OS preference when you have not chosen, and is remembered in `localStorage`.

> **`FLUTTER-REVIEW.md`** — full inventory of the companion Flutter app (`../scje_system`) and a feature-by-feature read of what this web app can reuse from it.

## Project Structure
```text
scje-web-app/
├─ architecture.md          # Detailed system architecture and logic rules
├─ frontend/                # React SPA (Vite + TypeScript)
│   ├─ vite.config.ts       # PWA: manifest, precache, offline API cache
│   ├─ public/icons/        # PWA icons (shared with the Flutter build)
│   └─ src/
│       ├─ components/      # Drawer.tsx, Navbar.tsx, OfflineBanner.tsx
│       ├─ pages/           # Login, Dashboard, RegisterProfile, Events, EventDetail,
│       │                    # Faculty, Schedule, Grades, Profile
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

Use the following credentials in the login screen (password for all is `password123`). They are designed to test the specific routing logic of the system:

1. **First-Time Criminology Student (Full Access + Registration Test)**
   - **Email:** `crim@chcc.edu.ph`
   - *Behavior:* Triggers the First-Time Registration screen, then grants full dashboard access.
   
2. **Existing ISM Student (Full Access)**
   - **Email:** `ism@chcc.edu.ph`
   - *Behavior:* Bypasses registration and goes straight to the full dashboard, with a completed profile (picture, birthday, gender) already on file.

3. **Guest / Other Department (View-Only Test)**
   - **Email:** `guest@chcc.edu.ph`
   - *Behavior:* Locked out of the dashboard; can only view the Events & Announcements page.

4. **Administrator (MIS Office)**
   - **Email:** `admin@chcc.edu.ph`
   - *Behavior:* Full access as the shared MIS office account — name renders as "Admin" in the drawer and navbar.
