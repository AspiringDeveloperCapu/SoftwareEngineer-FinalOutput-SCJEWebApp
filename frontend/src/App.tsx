import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Events from "./pages/Events";
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
        
        {/* Placeholders for other routes */}
        <Route path="/instructors" element={<Navigate to="/dashboard" />} />
        <Route path="/schedule" element={<Navigate to="/dashboard" />} />
        <Route path="/grades" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
