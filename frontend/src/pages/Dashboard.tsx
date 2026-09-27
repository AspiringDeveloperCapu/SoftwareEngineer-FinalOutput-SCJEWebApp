import React, { useEffect, useState } from "react";
import Drawer from "../components/Drawer";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      // Not logged in, redirect to login
      window.location.href = '/';
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  if (!user) return null;

  return (
    <div className="app-container">
      <Drawer />
      <main className="main-content">
        <header className="navbar">
          <div className="nav-title">Administration</div>
          <button className="login-btn" onClick={handleLogout}>Logout</button>
        </header>
        
        <div className="dashboard-body">
          <section className="hero">
            <h1>Welcome to the {user.department} Portal, {user.name}</h1>
            <p>Your one-stop system for events, schedules, and more.</p>
          </section>
          
          <div className="content-grid">
            <section className="card">
              <h3>Latest Announcements</h3>
              <p>No new announcements.</p>
            </section>
            <section className="card">
              <h3>Upcoming Events</h3>
              <p>Check the events tab for more details.</p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
