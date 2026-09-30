import { API_BASE } from "../api";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import LoginForm from "../components/LoginForm";
import ItemImage from "../components/ItemImage";
import { getSession } from "../access";
import { formatWhen, byWhen } from "../format";

interface EventItem {
  id: number;
  title: string;
  date: string;
  time?: string;
  endTime?: string;
  description: string;
  location: string;
  type: string;
  status: string;
  pinned: boolean;
  image?: string;
}

interface Announcement {
  id: number;
  title: string;
  body: string;
  author: string;
  date: string;
  time?: string;
  endTime?: string;
  category: string;
  pinned: boolean;
  image?: string;
}

type Filter = "latest" | "upcoming" | "finished";

const today = () => new Date().toISOString().slice(0, 10);

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

/**
 * The main dashboard and the landing page in one: it opens with the hero and
 * the sign-in card, then everything else - announcements and the event feed -
 * sits below it, scrollable, so a visitor can browse without an account.
 * A signed-in session is bounced to its own dashboard instead.
 */
export default function ViewOnlyDashboard() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [filter, setFilter] = useState<Filter>("latest");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (getSession()) {
      navigate("/dashboard", { replace: true });
      return;
    }
    fetch(`${API_BASE}/api/events`)
      .then(res => res.json())
      .then(data => setEvents(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
    fetch(`${API_BASE}/api/announcements`)
      .then(res => res.json())
      .then(data => setAnnouncements(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
  }, [navigate]);

  // Arriving from the header's Sign In button (/​#signin) lands on the form.
  useEffect(() => {
    if (location.hash === "#signin") {
      document.getElementById("signin")?.scrollIntoView({ block: "center" });
    }
  }, [location.hash]);

  // Finished events stay on file, they just move behind their own filter.
  const visible = events
    .filter(e => {
      if (filter === "upcoming") return e.date >= today();
      if (filter === "finished") return e.date < today();
      return true;
    })
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      if (filter === "finished") return byWhen(b, a);
      return byWhen(a, b);
    });

  const chips: { key: Filter; label: string }[] = [
    { key: "latest", label: "Latest" },
    { key: "upcoming", label: "Upcoming" },
    { key: "finished", label: "Finished" }
  ];

  const chipStyle = (active: boolean): React.CSSProperties => ({
    padding: "8px 16px",
    borderRadius: "99px",
    border: active ? "none" : "1px solid var(--glass-border)",
    background: active ? "var(--grad-primary)" : "var(--glass)",
    color: active ? "var(--on-primary)" : "var(--text)",
    fontWeight: 600,
    fontSize: "0.85rem",
    cursor: "pointer"
  });

  return (
    <div className="app-container">
      <main className="main-content">
        <Navbar />

        <div className="dashboard-body">
          {/* Hero + inline sign-in, side by side on wide screens */}
          <section className="hero" style={{ overflow: "hidden" }}>
            <div className="hero-grid">
              <div style={{ position: "relative" }}>
                <span style={{
                  position: "absolute", top: "-6px", right: "0",
                  backgroundColor: "var(--surface-2)", color: "var(--text)",
                  padding: "4px 12px", borderRadius: "99px", fontSize: "0.8rem", fontWeight: "bold"
                }}>
                  👁 View Only
                </span>

                <span className="intro-eyebrow">SCJE Student Hub · Introduction</span>
                <h1 style={{ fontSize: "1.7rem", marginTop: "4px" }}>Welcome to the SCJE Student Hub</h1>
                <p style={{ color: "var(--text-muted)", fontSize: "1rem", marginTop: "8px", lineHeight: 1.6 }}>
                  One place for campus life at SCJE — events, announcements, grades and schedules for
                  BSCRIM and BSISM students, instructors and staff. Everything below is open to browse;
                  sign in to reach your classes, records and grades.
                </p>

                <div style={{ display: "flex", gap: "12px", marginTop: "16px", flexWrap: "wrap" }}>
                  <button
                    onClick={() => document.getElementById("signin")?.scrollIntoView({ behavior: "smooth", block: "center" })}
                    className="login-btn"
                    style={{ padding: "10px 20px" }}
                  >
                    Sign in →
                  </button>
                  <button
                    onClick={() => navigate("/events")}
                    style={{ padding: "10px 20px", borderRadius: "12px", border: "1px solid var(--border-strong)", backgroundColor: "var(--surface)", color: "var(--text)", cursor: "pointer", fontWeight: 700 }}
                  >
                    Browse all events
                  </button>
                </div>

                <div className="intro-art intro-art--banner" aria-hidden="true">
                  <img className="intro-art-logo" src="/icons/SCJE-logo.jpg" alt="" />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "12px", marginTop: "20px" }}>
                  <div className="card" style={{ padding: "12px", borderRadius: "12px", textAlign: "center" }}>
                    <strong style={{ color: "var(--heading)", fontSize: "1.3rem", display: "block" }}>{events.length}</strong>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>Events on file</span>
                  </div>
                  <div className="card" style={{ padding: "12px", borderRadius: "12px", textAlign: "center" }}>
                    <strong style={{ color: "var(--accent)", fontSize: "1.3rem", display: "block" }}>{announcements.length}</strong>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>Announcements</span>
                  </div>
                  <div className="card" style={{ padding: "12px", borderRadius: "12px", textAlign: "center" }}>
                    <strong style={{ color: "var(--gold)", fontSize: "1.3rem", display: "block" }}>
                      {events.filter(e => e.date >= today()).length}
                    </strong>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>Upcoming</span>
                  </div>
                </div>
              </div>

              <LoginForm />
            </div>
          </section>

          {/* Announcements */}
          <section id="announcements" style={{ marginBottom: "32px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "12px", marginBottom: "16px" }}>
              <h3 style={{ color: "var(--heading)", margin: 0 }}>Announcements</h3>
              <span style={{ color: "var(--text-faint)", fontSize: "0.85rem" }}>{announcements.length} posted</span>
            </div>

            {announcements.length > 0 ? (
              <div className="content-grid">
                {[...announcements]
                  .sort((a, b) => Number(b.pinned) - Number(a.pinned))
                  .map(a => (
                    <section key={a.id} className="card" style={a.pinned ? { border: "2px solid var(--gold)" } : undefined}>
                      <ItemImage src={a.image} alt={a.title} kind="announcement" height={140} />
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "12px 0", gap: "8px", flexWrap: "wrap" }}>
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
                            padding: "2px 12px", borderRadius: "99px", fontSize: "0.75rem", fontWeight: 700
                          }}>
                            📌 PINNED
                          </span>
                        )}
                      </div>
                      <h3 style={{ marginBottom: "8px" }}>{a.title}</h3>
                      <p style={{ color: "var(--text-muted)", lineHeight: "1.5", fontSize: "0.9rem" }}>{a.body}</p>
                      <p style={{ color: "var(--text-faint)", fontSize: "0.78rem", marginTop: "8px" }}>{formatWhen(a.date, a.time, a.endTime)} · {a.author}</p>
                    </section>
                  ))}
              </div>
            ) : (
              <div className="card">
                <p style={{ color: "var(--text-muted)" }}>No announcements posted yet.</p>
              </div>
            )}
          </section>

          {/* Events */}
          <section id="events">
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
                visible.map(evt => {
                  const finished = evt.date < today();
                  const when = formatWhen(evt.date, evt.time, evt.endTime);
                  return (
                    <section
                      key={evt.id}
                      className="card"
                      style={{
                        cursor: "pointer",
                        border: evt.pinned ? "2px solid var(--gold)" : undefined,
                        opacity: finished ? 0.88 : 1
                      }}
                      onClick={() => navigate(`/events/${evt.id}`)}
                    >
                      <ItemImage src={evt.image} alt={evt.title} kind="event" height={140} />
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "12px 0", gap: "8px", flexWrap: "wrap" }}>
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
                        {evt.description.substring(0, 110)}…
                      </p>
                      <p style={{ color: "var(--heading)", fontSize: "0.82rem", marginTop: "10px" }}>
                        📅 {when}
                      </p>
                      <p style={{ color: "var(--text-faint)", fontSize: "0.8rem", marginTop: "4px" }}>
                        📍 {evt.location} · {evt.type}
                      </p>
                    </section>
                  );
                })
              ) : (
                <div className="card" style={{ gridColumn: "1 / -1" }}>
                  <p style={{ color: "var(--text-muted)" }}>
                    No {filter === "upcoming" ? "upcoming" : "finished"} events yet — finished ones stay on file under Finished.
                  </p>
                </div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
              <button
                onClick={() => navigate("/events")}
                style={{ padding: "10px 22px", borderRadius: "12px", border: "1px solid var(--border-strong)", backgroundColor: "var(--surface)", color: "var(--heading)", cursor: "pointer", fontWeight: 700 }}
              >
                Browse all events →
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
