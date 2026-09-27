import React from "react";
import Drawer from "../components/Drawer";

export default function Events() {
  return (
    <div className="app-container">
      <Drawer />
      <main className="main-content">
        <header className="navbar">
          <div className="nav-title">Events & Announcements</div>
          <button className="login-btn" onClick={() => window.location.href = '/'}>Logout</button>
        </header>
        
        <div className="dashboard-body">
          <h2>All Events</h2>
          <div className="content-grid" style={{ marginTop: "20px" }}>
            <section className="card">
              <h3>Intramurals 2026</h3>
              <p>Coming up next month! Prepare your teams.</p>
            </section>
            <section className="card">
              <h3>Criminology Seminar</h3>
              <p>Guest speaker event in the main hall.</p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
