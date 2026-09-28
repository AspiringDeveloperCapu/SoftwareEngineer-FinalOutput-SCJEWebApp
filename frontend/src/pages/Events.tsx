import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Drawer from "../components/Drawer";
import Navbar from "../components/Navbar";
import { getSession } from "../access";

interface EventItem {
  id: number;
  title: string;
  date: string;
  description: string;
  location: string;
  type: string;
  status: string;
  pinned: boolean;
}

interface Announcement {
  id: number;
  title: string;
  body: string;
  author: string;
  date: string;
  category: string;
  pinned: boolean;
}

type Filter = "latest" | "upcoming" | "finished";

const today = () => new Date().toISOString().slice(0, 10);

export default function Events() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [filter, setFilter] = useState<Filter>("latest");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:4000/api/events")
      .then(res => res.json())
      .then(data => setEvents(data))
      .catch(err => console.error("Error fetching events", err));
    fetch("http://localhost:4000/api/announcements")
      .then(res => res.json())
      .then(data => setAnnouncements(Array.isArray(data) ? data : []))
      .catch(err => console.error("Error fetching announcements", err));
  }, []);

  const typeColors: Record<string, string> = {
    seminar: "var(--brand)",
    sports: "var(--gold)",
    academic: "var(--accent-solid)",
    social: "var(--success-solid)"
  };

  const categoryColors: Record<string, string> = {
    academic: "var(--accent-solid)",
    reminder: "var(--gold)",
    event: "var(--success-solid)",
    announcement: "var(--brand)"
  };

  // Finished events stay on file, they just move behind their own filter.
  const visible = events
    .filter(e => {
      if (filter === "upcoming") return e.date >= today();
      if (filter === "finished") return e.date < today();
      return true;
    })
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      if (filter === "finished") return b.date.localeCompare(a.date);
      return a.date.localeCompare(b.date);
    });

  const chips: { key: Filter; label: string }[] = [
    { key: "latest", label: "Latest" },
    { key: "upcoming", label: "Upcoming" },
    { key: "finished", label: "Finished" }
  ];

  const chipStyle = (active: boolean): React.CSSProperties => ({
    padding: "8px 16px",
    borderRadius: "99px",
    border: active ? "none" : "1px solid var(--border-strong)",
    backgroundColor: active ? "var(--brand)" : "var(--surface)",
    color: active ? "var(--on-brand)" : "var(--text)",
    fontWeight: 600,
    fontSize: "0.85rem",
    cursor: "pointer"
  });

  return (
    <div className="app-container">
      {/* A visitor (view-only) browses with no sidebar; the drawer belongs to a session */}
      {getSession() && <Drawer />}
      <main className="main-content">
        <Navbar />

        <div className="dashboard-body">
          <h2 style={{ color: "var(--heading)", marginBottom: "24px" }}>Events & Announcements</h2>

          {announcements.length > 0 && (
            <>
              <h3 style={{ color: "var(--heading)", marginBottom: "16px" }}>Announcements</h3>
              <div className="content-grid" style={{ marginBottom: "32px" }}>
                {[...announcements]
                  .sort((a, b) => Number(b.pinned) - Number(a.pinned))
                  .map(a => (
                    <section
                      key={a.id}
                      className="card"
                      style={a.pinned ? { border: "2px solid var(--gold)" } : undefined}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", gap: "8px", flexWrap: "wrap" }}>
                        <span style={{
                          backgroundColor: categoryColors[a.category] || "var(--brand)",
                          color: "white", padding: "2px 12px", borderRadius: "99px",
                          fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase"
                        }}>
                          {a.category}
                        </span>
                        {a.pinned && (
                          <span style={{
                            backgroundColor: "var(--gold)", color: "var(--on-gold)",
                            padding: "2px 12px", borderRadius: "99px",
                            fontSize: "0.75rem", fontWeight: 700
                          }}>
                            📌 PINNED
                          </span>
                        )}
                      </div>
                      <h3 style={{ marginBottom: "8px" }}>{a.title}</h3>
                      <p style={{ color: "var(--text-muted)", lineHeight: "1.5", fontSize: "0.9rem" }}>{a.body}</p>
                      <p style={{ color: "var(--text-faint)", fontSize: "0.78rem", marginTop: "8px" }}>{a.date} · {a.author}</p>
                    </section>
                  ))}
              </div>
            </>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap", marginBottom: "16px" }}>
            <h3 style={{ color: "var(--heading)", margin: 0 }}>Events</h3>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {chips.map(c => (
                <button key={c.key} onClick={() => setFilter(c.key)} style={chipStyle(filter === c.key)}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="content-grid">
            {visible.length > 0 ? (
              visible.map((evt) => {
                const finished = evt.date < today();
                return (
                  <section
                    key={evt.id}
                    className="card"
                    style={{
                      cursor: "pointer",
                      transition: "box-shadow 0.2s",
                      opacity: finished && filter === "finished" ? 0.85 : 1,
                      border: evt.pinned ? "2px solid var(--gold)" : undefined
                    }}
                    onClick={() => navigate(`/events/${evt.id}`)}
                    onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)")}
                    onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.02)")}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", gap: "8px", flexWrap: "wrap" }}>
                      <span style={{
                        backgroundColor: typeColors[evt.type] || "var(--brand)",
                        color: "white", padding: "2px 12px", borderRadius: "99px",
                        fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase"
                      }}>
                        {evt.type}
                      </span>
                      <span style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        {evt.pinned && (
                          <span style={{ backgroundColor: "var(--gold)", color: "var(--on-gold)", padding: "2px 10px", borderRadius: "99px", fontSize: "0.7rem", fontWeight: 700 }}>
                            📌 PINNED
                          </span>
                        )}
                        {evt.status === "cancelled" && (
                          <span style={{ backgroundColor: "var(--danger)", color: "white", padding: "2px 10px", borderRadius: "99px", fontSize: "0.7rem", fontWeight: 700 }}>
                            CANCELLED
                          </span>
                        )}
                        {finished && (
                          <span style={{ backgroundColor: "var(--surface-2)", color: "var(--text-muted)", padding: "2px 10px", borderRadius: "99px", fontSize: "0.7rem", fontWeight: 700 }}>
                            FINISHED
                          </span>
                        )}
                      </span>
                    </div>
                    <h3 style={{ marginBottom: "8px" }}>{evt.title}</h3>
                    <p style={{ color: "var(--text-muted)", lineHeight: "1.5", fontSize: "0.9rem" }}>
                      {evt.description.substring(0, 100)}...
                    </p>
                    <p style={{ color: "var(--heading)", fontSize: "0.8rem", marginTop: "8px" }}>📍 {evt.location}</p>
                  </section>
                );
              })
            ) : (
              <p style={{ color: "var(--text-muted)" }}>
                No {filter === "upcoming" ? "upcoming" : "finished"} events yet — finished ones stay on file under Finished.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
