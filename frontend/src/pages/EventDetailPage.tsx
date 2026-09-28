import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Drawer from "../components/Drawer";
import Navbar from "../components/Navbar";

interface EventDetail {
  id: number;
  title: string;
  date: string;
  description: string;
  location: string;
  type: string;
}

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventDetail | null>(null);

  useEffect(() => {
    fetch(`http://localhost:4000/api/events/${id}`)
      .then(res => res.json())
      .then(data => setEvent(data))
      .catch(err => console.error(err));
  }, [id]);

  const typeColors: Record<string, string> = {
    seminar: "#0B3D63",
    sports: "#C9A227",
    academic: "#8C1D40",
    social: "#2e7d32"
  };

  if (!event) return <div className="app-container"><Drawer /><main className="main-content"><Navbar /><div className="dashboard-body"><p>Loading...</p></div></main></div>;

  return (
    <div className="app-container">
      <Drawer />
      <main className="main-content">
        <Navbar />
        <div className="dashboard-body">
          <button onClick={() => navigate("/events")} style={{ background: "none", border: "none", color: "#0B3D63", cursor: "pointer", fontWeight: 600, fontSize: "0.9rem", marginBottom: "24px", padding: 0 }}>
            ← Back to Events
          </button>

          <div className="card" style={{ padding: "32px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
              <h1 style={{ color: "#06263D", fontSize: "1.5rem", margin: 0, flex: 1 }}>{event.title}</h1>
              <span style={{
                backgroundColor: typeColors[event.type] || "#666",
                color: "white", padding: "4px 16px", borderRadius: "99px",
                fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", flexShrink: 0
              }}>
                {event.type}
              </span>
            </div>

            <div style={{ display: "flex", gap: "24px", marginBottom: "24px", color: "#666" }}>
              <p>📅 {event.date}</p>
              <p>📍 {event.location}</p>
            </div>

            <p style={{ color: "#333", lineHeight: 1.7, fontSize: "1rem" }}>{event.description}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
