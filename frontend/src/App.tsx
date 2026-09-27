import React from "react";
import "./index.css";

function App() {
  return (
    <div className="app-container">
      {/* Drawer */}
      <aside className="drawer">
        <div className="user-info">
          <div className="avatar-placeholder"></div>
          <h2>Student Name</h2>
          <p>SCJE Department</p>
        </div>
        <nav className="menu">
          <ul>
            <li>Dashboard</li>
            <li>Instructors</li>
            <li>Schedule</li>
            <li>Grades</li>
            <li>Events / Announcements</li>
          </ul>
        </nav>
      </aside>
      
      {/* Main Content */}
      <main className="main-content">
        <header className="navbar">
          <div className="nav-title">Administration</div>
          <button className="login-btn">Login</button>
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

export default App;
