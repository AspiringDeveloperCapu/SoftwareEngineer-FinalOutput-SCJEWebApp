import React, { useEffect, useState } from "react";
import Drawer from "../components/Drawer";
import Navbar from "../components/Navbar";

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

  return (
    <div className="app-container">
      <Drawer />
      <main className="main-content">
        <Navbar />
        
        <div className="dashboard-body">
          <h2 style={{ color: "#0B3D63" }}>All Events & Announcements</h2>
          <div className="content-grid" style={{ marginTop: "24px" }}>
            {events.length > 0 ? (
              events.map((evt) => (
                <section key={evt.id} className="card">
                  <h3>{evt.title} <small style={{ color: "#06263D", fontSize: "0.8rem", float: "right", fontWeight: 400 }}>{evt.date}</small></h3>
                  <p style={{ marginTop: "12px", color: "#333", lineHeight: "1.5" }}>{evt.description}</p>
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
