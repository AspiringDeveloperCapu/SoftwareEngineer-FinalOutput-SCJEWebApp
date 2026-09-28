# Architecture Overview for SCJE Web Application

## 1. Project Background
This project is a migration of the **SCJE/BSISM Student System** from a planned Flutter mobile application to a modern, fully-featured web application.

## 2. Technology Stack
- **Frontend**: React, TypeScript, Vite, React Router. (Styled closely to the original Flutter app's Material 3 theme).
- **PWA**: `vite-plugin-pwa` (Workbox `generateSW`) for the manifest, app-shell precache and offline data cache.
- **Backend**: Node.js, Express, jsonwebtoken (JWT).
- **Database**: Mock JSON (representing MIS Office data) designed to be easily swappable to PostgreSQL or MySQL in the future.

## 3. User Roles & Access Control
The system is built to accommodate three main types of users:
1. **Admin / Staff** (e.g., Sir Yalung, Deans)
2. **Instructors**
3. **Students**

### Routing & Department Logic
Access to features is strictly gated based on the user's department:
- **SCJE & ISM Students (e.g., Criminology):** Granted full access to the Main Dashboard, Instructors, Schedules, and Grades.
- **Out-of-Department / Guests:** Routed immediately to a restricted **View-Only Mode**. They are locked out of the dashboard and can only view Upcoming/Recent Events and Announcements.

## 4. System Workflows

### Authentication & First-Time Registration Flow
1. User enters Email and Password.
2. The system checks the database (MIS data).
3. **First-Time Login**: If the user is logging in for the first time, they are intercepted and forced to register their profile. The required fields are:
   - Picture
   - Full Name
   - Birthday
   - Course / Section
   - Gender
4. Once completed, the session is updated and they are routed based on their department.

## 5. UI Architecture

### Drawer (Sidebar)
The drawer dynamically renders based on the session data. It includes:
- **User Info**: Picture, Name, Birthday, and Course/Department.
- **Menu Items**: Dashboard, Instructors, Schedule, Achievement/Grades, Events/Announcement.

### Main Dashboard Body
- **Dashboard Hero**: Includes a "Pin option" for critical alerts or featured news.
- **News / Announcement Section**
- **Specific Feature Cards**: Quick access to Schedules, Grades, and Instructors.

### Navigation Bar
- Features the **"Administration"** dropdown. When clicked, it fetches and displays a list of current Faculty Members and Officers.

## 6. PWA & Offline Strategy

The frontend is an installable progressive web app that keeps working without a
connection once it has been opened online.

- **Manifest** (`frontend/vite.config.ts`): name *SCJE Student Hub*, `#0B3D63`
  theme/background, `standalone` display, and the same four icons the Flutter
  build ships (`frontend/public/icons/`, including the maskable pair).
  `index.html` carries a matching `theme-color`, so the installed window chrome
  and the browser tab agree.
- **App-shell precache**: Workbox precaches `index.html`, the hashed JS/CSS and
  the icons, and serves `index.html` for any navigation. That is what makes a
  deep link such as `/events/5` render offline instead of showing a browser
  error page.
- **Data cache**: every `GET /api/…` is routed **NetworkFirst** with a 5 second
  timeout - fresh data when the network answers, the last successful response
  when it does not. The pattern matches any origin, so the API keeps its own
  port; `cors()` on the backend is what lets the worker read those bodies.
  Only `200` responses are stored, so a 401 or an error body is never replayed
  as if it were data, and entries expire after 7 days / 60 URLs. Writes are
  deliberately not intercepted: offline editing is out of scope for the
  prototype.
- **First visit**: registration happens on `window.load`, so the very first
  page's fetches would already be gone by the time the worker takes control.
  `main.tsx` reloads once per session when the worker first claims the page -
  that reload is what actually fills the data cache.
- **Honesty about stale data**: `OfflineBanner` listens to `online`/`offline`
  and shows a gold strip while disconnected, so a cached grade list cannot be
  mistaken for a live one.
- **Dev vs. demo**: `npm run dev` registers the worker and serves the manifest
  (so the app installs from the dev server), but precaches nothing - that
  worker only answers `/` and leaves everything else to Vite, which keeps HMR
  intact. Offline rendering is a build artifact, so it is demonstrated from
  `npm run build` + `npm run preview` (port 4173).

## 7. Future Extensibility
- **MIS API Integration**: The `mockData.js` file is abstracted so that it can be directly replaced by live `fetch` calls to the actual school MIS Office database.
