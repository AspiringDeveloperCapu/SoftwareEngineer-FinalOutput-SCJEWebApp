import React, { useEffect, useState } from "react";
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

/**
 * The bottom of the hierarchy: events and announcements only, no statistics and
 * no academic pages in the drawer. No demo account signs in as view-only today -
 * the route exists so a restricted session always has somewhere honest to land.
 */
export default function ViewOnlyDashboard() {
  const [events, setEvents] = useState<EventItem[]>([]);

  useEffect(() => {
    fetch("http://localhost:4000/api/events")
      .then(res => res.json())
      .then(data => setEvents(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="app-container">
      <Drawer />
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
