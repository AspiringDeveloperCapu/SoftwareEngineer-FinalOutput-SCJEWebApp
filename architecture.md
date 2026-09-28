# Architecture Overview for SCJE Web Application

## 1. Project Background
This project is a migration of the **SCJE/BSISM Student System** from a planned Flutter mobile application to a modern, fully-featured web application.

## 2. Technology Stack
- **Frontend**: React, TypeScript, Vite, React Router. (Styled closely to the original Flutter app's Material 3 theme).
- **PWA**: `vite-plugin-pwa` (Workbox `generateSW`) for the manifest, app-shell precache and offline data cache.
- **Backend**: Node.js, Express, jsonwebtoken (JWT).
- **Database**: Mock JSON (representing MIS Office data) designed to be easily swappable to PostgreSQL or MySQL in the future.

## 3. User Roles & Access Control
A strict hierarchy, highest to lowest:

1. **Admin** — one shared account for the MIS office, not a personal one.
2. **Instructor**
3. **Student**
4. **View-only** — a restricted session with events only; no demo account signs in as view-only.

### The capability table
`frontend/src/access.ts` is the single authority: it maps every role to its
dashboard and sidebar links, and `components/Protected.tsx` uses the same roles
to gate routes. Nothing else in the app hard-codes a role check.

| Capability | view-only | student | instructor | admin |
|---|---|---|---|---|
| Events + announcements feed (`/events`, `/events/:id`) | ✅ | ✅ | ✅ | ✅ |
| Dashboard, Instructors, Schedule, Grades, Profile | — | ✅ | ✅ | ✅ |
| Grades scope | — | own record | department | every student |
| Schedule scope | — | own classes | classes they teach | school-wide |
| Dashboard stats | events only | subjects / GPA | classes handled | students / faculty / events |
| Accounts (`/students`): create, edit, delete, assign roles | — | — | — | ✅ |
| Record hub: record grade rows, manage schedule rows | — | — | — | ✅ |
| Announcements (`/manage-announcements`): publish and pin | — | — | — | ✅ |
| Manage events: drafts, status, pinning, finished records | — | — | — | ✅ |
| Manage faculty | — | — | — | ✅ |

**Admin safety rails.** Deleting or demoting the *last remaining
administrator* returns `409`, so the demo can never lock itself out of the back
office (the UI disables those controls too). Deleting an account is a hard
delete: its grades and schedule rows go with it. Role changes are stored in the
JWT, so they take effect on the account's next sign-in.

**Event model.** Every event carries `status` (`draft` | `published` |
`cancelled`) and a `pinned` flag. Drafts are invisible outside `/manage-events`
(the public feed and `GET /api/events/:id` treat them as missing). One event at
a time can be pinned — pinning one clears the rest — and the public feed offers
**Latest / Upcoming / Finished** filters; finished events are never deleted,
they simply move behind the Finished filter as records.

**Announcements.** Admin-authored, visible to everyone on the Events page. The
single pinned announcement (or, if none, the pinned event) is served on the
dashboard summary as `pin`, which `PinnedHero` renders on all three dashboards.

**Department logic** still applies inside the hierarchy: an instructor's grades
and schedule are scoped to their department (`SCJE` / `ISM`), and the classes
they see are matched by name against the timetable.

**Unrecognized accounts** never get in: an unknown email or password returns
`401 { "message": "Account not recognized." }` — the same wording for both, so
the API doesn't reveal which addresses exist — and nothing is written to
`localStorage`. A session whose role the table doesn't recognise is discarded on
read (`getSession()` returns `null`), which lands the user back on the login
screen rather than on a dashboard.

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
4. Once completed, the session is updated and they land on the dashboard their role maps to.

## 5. UI Architecture

### Drawer (Sidebar)
The drawer reads the session and renders from `linksFor(role)` — it never
hard-codes who sees what. It includes:
- **User Info**: Picture, Name, a **role badge** (gold `ADMIN`, crimson
  `INSTRUCTOR`, white `STUDENT`) and Course/Department.
- **Menu Items**: students and instructors get Dashboard, Instructors, Schedule,
  Grades, Events; the admin tier adds Accounts, Announcements, Manage Events and
  Manage Faculty; a session-less (view-only) visitor gets Events alone.

### Main Dashboard Body
One route (`/dashboard`), four screens — `pages/Dashboard.tsx` is a dispatcher
that picks by role. All three full-access dashboards share `PinnedHero`, which
greets the user and, when the admin has pinned something, shows that pin
(announcement first, else the pinned event) and links to the feed:
- **Student** (`dashboards/StudentDashboard.tsx`): hero, enrolled
  subjects / GPA / notifications, upcoming classes, recent events.
- **Instructor** (`InstructorDashboard.tsx`): classes handled, subjects, students
  taught, then *My Classes* and recent events.
- **Admin** (`AdminDashboard.tsx`): students / faculty / events counts, four
  back-office shortcuts (Accounts, Announcements, Manage Events, Manage
  Faculty), a faculty snapshot and recent events.
- **View-only** (`ViewOnlyDashboard.tsx`, `/view-only`): hero plus the full event
  list — no statistics, no academic pages.

### Back office screens
- **Accounts** (`/students`, `StudentsPage.tsx`): every account with a role badge
  and role/program filter chips, a create form, and a **record hub** per account —
  edit fields (including role assignment), delete, plus inline add/edit/delete for
  grade rows and schedule rows.
- **Manage Announcements** (`/manage-announcements`): publish, edit, delete and
  pin (single-pin enforced by the API).
- **Manage Events** (`/manage-events`): full list including drafts, status
  select (draft/published/cancelled), status filter chips, pin star per row.
- **Manage Faculty** (`/manage-faculty`): instructor/staff directory CRUD.

### Navigation Bar
- Features the **"Administration"** dropdown. When clicked, it fetches and displays a list of current Faculty Members and Officers.
- Hosts the **theme toggle** (`ThemeToggle`), alongside the notifications bell and logout.

### Theming (Light / Dark)
- `index.css` defines **one palette** as CSS custom properties: `:root` holds the
  light values, `[data-theme="dark"]` on `<html>` overrides them. Components only
  ever reference a token by role (`--text`, `--heading`, `--surface`, `--card`,
  `--brand`, `--gold`, `--on-gold`, …), never a raw hex — which is why one
  attribute flip re-skins every screen, including inline styles on JSX.
- `theme.ts` reads the stored choice, falls back to `prefers-color-scheme`, and
  `main.tsx` applies it **before React renders**, so there is no light flash on
  first paint. `setTheme()` writes both `localStorage` and the attribute.
- `--on-gold` stays `#06263D` in both themes: gold is the brand accent used for
  buttons, banners and badges, so its label is always the dark navy (a fixed
  pairing instead of a token that flips and turns unreadable).

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
