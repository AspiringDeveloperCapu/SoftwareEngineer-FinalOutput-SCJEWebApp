import React, { useEffect, useState } from "react";
import Drawer from "../components/Drawer";

interface EventItem {
  id: number;
  title: string;
  date: string;
  description: string;
}

export default function Events() {
  const [events, setEvents] = useState<EventItem[]>([]);
  
  useEffect(() => {
    fetch("http://localhost:4000/api/events")
      .then(res => res.json())
      .then(data => setEvents(data))
      .catch(err => console.error("Error fetching events", err));
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <div className="app-container">
      <Drawer />
      <main className="main-content">
        <header className="navbar">
          <div className="nav-title">Events & Announcements</div>
          <button className="login-btn" onClick={handleLogout}>Logout</button>
        </header>
        
        <div className="dashboard-body">
          <h2>All Events</h2>
          <div className="content-grid" style={{ marginTop: "20px" }}>
            {events.length > 0 ? (
              events.map((evt) => (
                <section key={evt.id} className="card">
                  <h3>{evt.title} <small style={{ color: "#7f8c8d", fontSize: "0.8rem", float: "right" }}>{evt.date}</small></h3>
                  <p style={{ marginTop: "10px" }}>{evt.description}</p>
                </section>
              ))
            ) : (
              <p>Loading events...</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
