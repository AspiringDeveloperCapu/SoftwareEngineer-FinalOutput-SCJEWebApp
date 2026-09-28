# From the Flutter app: what it has, and what we can reuse

The companion Flutter project (`../scje_system`) is a full-featured build of the
same product: go_router + Riverpod + Material 3, mock/REST data sources behind
repositories, **148 passing tests** and its own `architecture.md` (15 sections,
including the complete API contract in §9). This file is the inventory of what it
does and a feature-by-feature read of what the web app can take from it.

Roles in the Flutter app: **admin → instructor → student → guest (view-only)** —
the same hierarchy the web dashboards are being built around.

---

## 1. What the Flutter app contains

### Screens (every route)

| Route | Screen | Source |
|---|---|---|
| `/` | Splash — restores the session, then redirects | `lib/app/router.dart` |
| `/login` | Login | `lib/features/auth/presentation/pages/login_page.dart` |
| `/register` | First-time profile wizard | `.../auth/presentation/pages/register_profile_page.dart` |
| `/home` | **HomeShell** — role-aware tabs: Home · Events · Schedule · Grades · Administration | `lib/features/dashboard/presentation/pages/home_shell.dart` |
| `/view-only` | **ViewOnlyShell** — events + announcements only | `.../dashboard/presentation/pages/view_only_shell.dart` |
| — | Dashboard (hero pin, news, quick actions) + user drawer | `.../dashboard/presentation/pages/dashboard_page.dart`, `.../widgets/user_drawer.dart` |
| — | Announcements feed · detail (likes, comment thread, share) | `.../announcements/presentation/pages/{feed_page,announcement_detail_page}.dart` |
| — | Events list · detail · **form (create/edit)** · **manage (admin)** | `.../events/presentation/pages/{events_page,event_detail_page,event_form_page,manage_events_page}.dart` |
| — | Schedule (weekly timetable) · Grades | `.../schedule/presentation/pages/schedule_page.dart`, `.../grades/presentation/pages/grades_page.dart` |
| — | Administration directory · **Manage Faculty + form (admin)** | `.../faculty/presentation/pages/{administration_page,manage_faculty_page,faculty_form_page}.dart` |
| — | **Student roster · student detail (admin)** | `.../students/presentation/pages/{students_page,student_detail_page}.dart` |
| — | Notifications centre (unread badge) | `.../notifications/presentation/pages/notifications_page.dart` |
| — | Profile · Edit profile · Forgot password | `.../auth/presentation/pages/{profile_page,edit_profile_page,forgot_password_page}.dart` |

### Who may do what (the access rule we're copying)

| Capability | view-only | student | instructor | admin |
|---|---|---|---|---|
| Events + announcements | ✅ | ✅ | ✅ | ✅ |
| Dashboard, schedule, grades, notifications, profile | — | ✅ | ✅ | ✅ |
| Faculty directory | — | ✅ | ✅ | ✅ |
| Event create/edit/delete | — | — | — | ✅ |
| Instructor create/edit/delete | — | — | — | ✅ |
| Student roster + student detail | — | — | — | ✅ |

Enforced in one place — `resolveAccessLevel` in
`lib/features/auth/presentation/providers/auth_provider.dart`
(`isAdminProvider`, `hasFullAccessProvider`) with a route redirect to
`/view-only` in `lib/app/router.dart`. `test/admin_ui_test.dart` asserts the
gating ("who gets the back office", "the roster").

### Data layer

- **Endpoints** — one file, `lib/core/network/api_endpoints.dart`: auth,
  `/users/me/profile`, `/events`, `/announcements[/{id}][/comments][/like]`,
  `/schedules`, `/grades`, `/notifications`, `/faculty`, `/officers`,
  `/admin/events`, `/admin/faculty`, `/admin/users`. Full verb/payload contract
  in `architecture.md` §9.1–§9.7.
- **Mock ↔ REST swap** is a one-line change in `lib/app/providers.dart`; every
  feature has `mock_*` and `rest_*` data sources behind one repository, and
  repositories wrap calls in `guard()` → `Result<T>`/`Failure` (typed field
  errors, status-code mapping) — `lib/core/error/*`.
- **Seed data** — `lib/mock/mock_content.dart`: demo accounts, a generated
  student roster, announcements (+comments), events, faculty, officers, weekly
  schedule and grades.
- **Validation** — shared rules and messages in `lib/core/utils/validators.dart`.

### Cross-cutting behaviour worth knowing about

- **Search + filter widgets**, reused on 8 screens: `AppSearchField`
  (debounced), `AppFilterBar<T>` (typed chip row), `ListSearch.matching`
  (device-side matching, unit-tested).
- **Theme**: Material 3, navy seed, **light + dark**
  (`lib/app/theme/{app_theme,app_colors}.dart`).
- **Session**: JWT + refresh interceptor, 401 handling, session-expiry dialog
  (`lib/core/network/auth_interceptor.dart`, `lib/app/session_expiry.dart`).
- **Responsive**: 900 px wide layout; overflow-safety is asserted by tests
  (`test/responsive_layout_test.dart`, 4 widths × 5 tabs).
- **Tests**: 148 across 15 files — admin CRUD, REST layer (refresh, upload,
  error mapping), access rule, entity logic, announcements, responsive layout.
  Harness: `test/support/{harness.dart,test_server.dart}`.

---

## 2. What we can use for the web app

### Take now (feeds the role-dashboard work)

| Flutter piece | Web today | Why / how |
|---|---|---|
| The access rule (`resolveAccessLevel`, `isAdminProvider`) | scattered `user.viewOnly` checks | Becomes one `src/access.ts` table: role → dashboard + sidebar links + route guards. Same single-authority shape, ported as data instead of a provider. |
| `view_only_shell.dart` | nothing | Structure for `ViewOnlyDashboard` (hero + events/announcements list, no stats, no drawer links beyond Events). |
| `role_badge.dart` + `user_drawer.dart` | no role shown | Gold role pill (ADMIN / INSTRUCTOR / STUDENT) at the top of the drawer — makes the hierarchy visible. |
| `home_shell.dart` tab set | loose routes | Confirms the sidebar should be Events/Schedule/Grades/Instructors/Dashboard for every full-access role, with the data changing per tier. |
| Student roster (`students_page`, `student_detail_page`, `students_provider`) | nothing | The admin's "highest power" screen: search everyone, open a record with their grades + timetable. Backend: reuse `/admin/users` from §9.6. |
| Admin CRUD (`manage_events_page` + `event_form_page`, `manage_faculty_page` + `faculty_form_page`) | nothing | Admin-only writes give the top tier something only it can do. Endpoints already specified: `POST/PUT/DELETE /admin/events`, `/admin/faculty`. |

### Take next (largest gaps, already designed once)

| Flutter piece | Web today | Why / how |
|---|---|---|
| **Announcements module** (feed, pinned hero, likes, comment thread, share-to-clipboard, detail) | absent — Events doubles as the news feed | This is the Flutter app's biggest feature. Its pinned announcement is exactly the dashboard hero pin; `announcement_share_service.dart` builds share text client-side (no endpoint needed). |
| Notifications centre page | navbar dropdown only | Full page + unread badge; backend contract in §9.5. |
| Search/filter widgets | only department chips on `FacultyPage` | Small, high-polish port: a debounced search + chip row on Events, Grades, Schedule. |
| Validation messages (`validators.dart`) | ad-hoc inline strings | Reuse the wording so both apps speak the same language (same reason the event title message was aligned before). |
| API contract (`architecture.md` §9) | ~12 endpoints | The ready-made spec for growing the Express backend — including `PATCH /admin/users/{id}/role` for role assignment. |
| Seed data (`mock_content.dart`) | 4 users / 4 events / 5 faculty | Roster, announcements, comments and officers to copy into `backend/src/mockData.js` so the roster and feeds aren't empty. |
| Session refresh + expiry dialog | 2 h token, no refresh | Worth copying when auth matures; not needed for the demo. |
| Test patterns (`admin_ui_test.dart`, `rest_layer_test.dart`) | none (CDP scripts only) | The gating tests map straight onto Vitest tests for `access.ts` and the login flow. |

### Skip (Flutter-specific, no web equivalent)

Riverpod/DI graph (`lib/app/providers.dart`), go_router, Dio + interceptors,
platform-channel shims (`app_multipart_file*`, `app_local_image/*`), widgets and
`setState`/`build()` patterns, `.dart` test harness. The React equivalents are
already in place (React Router, `fetch`, Vite, CDP verification).

---

## 3. Where this fits the current plan

The pending work (role dashboards, guest removal, "Account not recognized")
maps onto Flutter code as: **`resolveAccessLevel` → `access.ts`**,
**`view_only_shell` → `ViewOnlyDashboard`**, **`role_badge` → drawer pill**,
**`mock_content.roster()` → backend seed**. Everything in "Take now" is either a
direct port or a data copy; nothing in it needs a new design decision.

Docs to keep in sync: `../scje_system/architecture.md` (§5 access rule, §9 API
contract, §13 shipped/deferred), and this repo's `README.md` /
`architecture.md`.
