import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getSession } from "../access";

interface EventItem {
  id: number;
  title: string;
  date: string;
  description: string;
  location: string;
  type: string;
}

/**
 * The landing page: the bottom of the hierarchy - events only, no statistics
 * and no sidebar - shown before anyone signs in, so the app has content on
 * first load. A signed-in account never sees it; it is bounced to its own
 * dashboard instead.
 */
export default function ViewOnlyDashboard() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (getSession()) {
      navigate("/dashboard", { replace: true });
      return;
    }
    fetch("http://localhost:4000/api/events")
      .then(res => res.json())
      .then(data => setEvents(data))
      .catch(err => console.error(err));
  }, [navigate]);

  return (
    <div className="app-container">
      <main className="main-content">
        <Navbar />

        <div className="dashboard-body">
          <section className="hero" style={{ position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: "16px", right: "16px", backgroundColor: "var(--surface-2)", color: "var(--text)", padding: "4px 12px", borderRadius: "99px", fontSize: "0.8rem", fontWeight: "bold" }}>
              👁 View Only
            </div>
            <h1 style={{ fontSize: "1.5rem" }}>SCJE Events</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "1rem", marginTop: "8px" }}>
              Announcements and upcoming events — everything else requires an account.
            </p>
            <div style={{ display: "flex", gap: "12px", marginTop: "16px", flexWrap: "wrap" }}>
              <button className="login-btn" onClick={() => navigate("/login")} style={{ padding: "10px 20px" }}>
                Sign in →
              </button>
              <button
                onClick={() => navigate("/events")}
                style={{ padding: "10px 20px", borderRadius: "12px", border: "1px solid var(--border-strong)", backgroundColor: "var(--surface)", color: "var(--text)", cursor: "pointer", fontWeight: 700 }}
              >
                Browse all events
              </button>
            </div>
          </section>

          <section className="card">
            <h3>Upcoming & Recent Events</h3>
            {events.length > 0 ? (
              <ul style={{ listStyle: "none", padding: 0, marginTop: "12px", display: "flex", flexDirection: "column", gap: "12px" }}>
                {events.map(evt => (
                  <li key={evt.id} style={{ padding: "16px", backgroundColor: "var(--surface-alt)", borderRadius: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                      <strong style={{ color: "var(--heading)" }}>{evt.title}</strong>
                      <span style={{ color: "var(--text-faint)", fontSize: "0.85rem", whiteSpace: "nowrap" }}>{evt.date}</span>
                    </div>
                    <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", margin: "6px 0 0 0" }}>{evt.description}</p>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-faint)", margin: "6px 0 0 0" }}>
                      📍 {evt.location} · {evt.type}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: "var(--text-muted)", marginTop: "12px" }}>No events posted.</p>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
