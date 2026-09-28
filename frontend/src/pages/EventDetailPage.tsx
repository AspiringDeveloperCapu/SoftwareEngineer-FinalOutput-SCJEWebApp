import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Drawer from "../components/Drawer";
import Navbar from "../components/Navbar";
import { getSession } from "../access";

interface EventDetail {
  id: number;
  title: string;
  date: string;
  description: string;
  location: string;
  type: string;
  status: string;
  pinned: boolean;
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
    seminar: "var(--brand)",
    sports: "var(--gold)",
    academic: "var(--accent-solid)",
    social: "var(--success-solid)"
  };

  if (!event) return <div className="app-container">{getSession() && <Drawer />}<main className="main-content"><Navbar /><div className="dashboard-body"><p>Loading...</p></div></main></div>;

  return (
    <div className="app-container">
      {getSession() && <Drawer />}
      <main className="main-content">
        <Navbar />
        <div className="dashboard-body">
          <button onClick={() => navigate("/events")} style={{ background: "none", border: "none", color: "var(--heading)", cursor: "pointer", fontWeight: 600, fontSize: "0.9rem", marginBottom: "24px", padding: 0 }}>
            ← Back to Events
          </button>

          <div className="card" style={{ padding: "32px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", gap: "12px", flexWrap: "wrap" }}>
              <h1 style={{ color: "var(--text)", fontSize: "1.5rem", margin: 0, flex: 1 }}>{event.title}</h1>
              <span style={{ display: "flex", gap: "8px", flexShrink: 0, flexWrap: "wrap" }}>
                {event.pinned && (
                  <span style={{ backgroundColor: "var(--gold)", color: "var(--on-gold)", padding: "4px 14px", borderRadius: "99px", fontSize: "0.8rem", fontWeight: 700 }}>
                    📌 PINNED
                  </span>
                )}
                {event.status === "cancelled" && (
                  <span style={{ backgroundColor: "var(--danger)", color: "white", padding: "4px 14px", borderRadius: "99px", fontSize: "0.8rem", fontWeight: 700 }}>
                    CANCELLED
                  </span>
                )}
                {event.date < new Date().toISOString().slice(0, 10) && (
                  <span style={{ backgroundColor: "var(--surface-2)", color: "var(--text-muted)", padding: "4px 14px", borderRadius: "99px", fontSize: "0.8rem", fontWeight: 700 }}>
                    FINISHED
                  </span>
                )}
                <span style={{
                  backgroundColor: typeColors[event.type] || "var(--brand)",
                  color: "white", padding: "4px 16px", borderRadius: "99px",
                  fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase"
                }}>
                  {event.type}
                </span>
              </span>
            </div>

            <div style={{ display: "flex", gap: "24px", marginBottom: "24px", color: "var(--text-muted)" }}>
              <p>📅 {event.date}</p>
              <p>📍 {event.location}</p>
            </div>

            <p style={{ color: "var(--text-dim)", lineHeight: 1.7, fontSize: "1rem" }}>{event.description}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
