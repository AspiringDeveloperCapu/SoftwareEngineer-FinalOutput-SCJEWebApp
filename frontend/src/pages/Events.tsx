import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Drawer from "../components/Drawer";
import Navbar from "../components/Navbar";

interface EventItem {
  id: number;
  title: string;
  date: string;
  description: string;
  location: string;
  type: string;
}

export default function Events() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:4000/api/events")
      .then(res => res.json())
      .then(data => setEvents(data))
      .catch(err => console.error("Error fetching events", err));
  }, []);

  const typeColors: Record<string, string> = {
    seminar: "#0B3D63",
    sports: "#C9A227",
    academic: "#8C1D40",
    social: "#2e7d32"
  };

  return (
    <div className="app-container">
      <Drawer />
      <main className="main-content">
        <Navbar />

        <div className="dashboard-body">
          <h2 style={{ color: "#0B3D63", marginBottom: "24px" }}>Events & Announcements</h2>
          <div className="content-grid">
            {events.length > 0 ? (
              events.map((evt) => (
                <section
                  key={evt.id}
                  className="card"
                  style={{ cursor: "pointer", transition: "box-shadow 0.2s" }}
                  onClick={() => navigate(`/events/${evt.id}`)}
                  onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)")}
                  onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.02)")}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <span style={{
                      backgroundColor: typeColors[evt.type] || "#666",
                      color: "white", padding: "2px 12px", borderRadius: "99px",
                      fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase"
                    }}>
                      {evt.type}
                    </span>
                    <span style={{ color: "#888", fontSize: "0.8rem" }}>{evt.date}</span>
                  </div>
                  <h3 style={{ marginBottom: "8px" }}>{evt.title}</h3>
                  <p style={{ color: "#666", lineHeight: "1.5", fontSize: "0.9rem" }}>{evt.description.substring(0, 100)}...</p>
                  <p style={{ color: "#0B3D63", fontSize: "0.8rem", marginTop: "8px" }}>📍 {evt.location}</p>
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
