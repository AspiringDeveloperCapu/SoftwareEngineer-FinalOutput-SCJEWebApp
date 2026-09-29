import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Events from "./pages/Events";
import EventDetailPage from "./pages/EventDetailPage";
import FacultyPage from "./pages/FacultyPage";
import SchedulePage from "./pages/SchedulePage";
import GradesPage from "./pages/GradesPage";
import ProfilePage from "./pages/ProfilePage";
import RegisterProfile from "./pages/RegisterProfile";
import StudentsPage from "./pages/StudentsPage";
import ManageAnnouncementsPage from "./pages/ManageAnnouncementsPage";
import ManageEventsPage from "./pages/ManageEventsPage";
import ManageFacultyPage from "./pages/ManageFacultyPage";
import ViewOnlyDashboard from "./dashboards/ViewOnlyDashboard";
import Protected from "./components/Protected";
import { FULL_ACCESS_ROLES } from "./access";
import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public: the view-only dashboard is the landing page AND the main
            dashboard - it carries the sign-in form, so events, announcements
            and login all live on one scrollable screen. /login stays as a
            fallback redirect so old links and bookmarks keep working. */}
        <Route path="/" element={<ViewOnlyDashboard />} />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetailPage />} />
        <Route path="/view-only" element={<ViewOnlyDashboard />} />

        {/* Every signed-in role: student, instructor, admin */}
        <Route path="/register-profile" element={<Protected roles={FULL_ACCESS_ROLES}><RegisterProfile /></Protected>} />
        <Route path="/dashboard" element={<Protected roles={FULL_ACCESS_ROLES}><Dashboard /></Protected>} />
        <Route path="/instructors" element={<Protected roles={FULL_ACCESS_ROLES}><FacultyPage /></Protected>} />
        <Route path="/schedule" element={<Protected roles={FULL_ACCESS_ROLES}><SchedulePage /></Protected>} />
        <Route path="/grades" element={<Protected roles={FULL_ACCESS_ROLES}><GradesPage /></Protected>} />
        <Route path="/profile" element={<Protected roles={FULL_ACCESS_ROLES}><ProfilePage /></Protected>} />

        {/* The back office: admin tier only */}
        <Route path="/students" element={<Protected roles={["admin"]}><StudentsPage /></Protected>} />
        <Route path="/manage-announcements" element={<Protected roles={["admin"]}><ManageAnnouncementsPage /></Protected>} />
        <Route path="/manage-events" element={<Protected roles={["admin"]}><ManageEventsPage /></Protected>} />
        <Route path="/manage-faculty" element={<Protected roles={["admin"]}><ManageFacultyPage /></Protected>} />

        {/* Deep links are the whole point of the shell being precached, so an
            unknown one lands on the dashboard rather than a blank page. */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
