import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Events from "./pages/Events";
import EventDetailPage from "./pages/EventDetailPage";
import FacultyPage from "./pages/FacultyPage";
import SchedulePage from "./pages/SchedulePage";
import GradesPage from "./pages/GradesPage";
import ProfilePage from "./pages/ProfilePage";
import RegisterProfile from "./pages/RegisterProfile";
import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register-profile" element={<RegisterProfile />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetailPage />} />
        <Route path="/instructors" element={<FacultyPage />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/grades" element={<GradesPage />} />
        <Route path="/profile" element={<ProfilePage />} />

        {/* Deep links are the whole point of the shell being precached, so an
            unknown one lands on the dashboard rather than a blank page. */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
