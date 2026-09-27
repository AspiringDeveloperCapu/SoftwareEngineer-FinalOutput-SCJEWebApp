import React from "react";
import Drawer from "../components/Drawer";

export default function Dashboard() {
  return (
    <div className="app-container">
      <Drawer />
      <main className="main-content">
        <header className="navbar">
          <div className="nav-title">Administration</div>
          <button className="login-btn" onClick={() => window.location.href = '/'}>Logout</button>
        </header>
        
        <div className="dashboard-body">
          <section className="hero">
            <h1>Welcome to the SCJE / BSISM Portal</h1>
            <p>Your one-stop system for events, schedules, and more.</p>
          </section>
          
          <div className="content-grid">
            <section className="card">
              <h3>Latest Announcements</h3>
              <p>No new announcements.</p>
            </section>
            <section className="card">
              <h3>Upcoming Events</h3>
              <p>No upcoming events.</p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
