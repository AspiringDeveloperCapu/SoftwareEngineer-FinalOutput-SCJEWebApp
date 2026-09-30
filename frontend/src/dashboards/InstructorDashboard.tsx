import { API_BASE } from "../api";
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import PinnedHero, { PinSummary } from "../components/PinnedHero";
import ItemImage from "../components/ItemImage";
import { getSession, Session } from "../access";

interface ClassItem {
  day: string;
  time: string;
  subject: string;
  room: string;
  instructor: string;
  student: string;
  section: string;
}

interface EventItem {
  id: number;
  title: string;
  date: string;
  image?: string;
}

interface InstructorSummary {
  role: "instructor";
  classesHandled: number;
  subjects: number;
  studentsTaught: number;
  upcomingClasses: ClassItem[];
  unreadNotifications: number;
  recentEvents: EventItem[];
  pins?: PinSummary[];
}

export default function InstructorDashboard() {
  const [user, setUser] = useState<Session | null>(null);
  const [summary, setSummary] = useState<InstructorSummary | null>(null);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      window.location.href = "/";
      return;
    }
    setUser(session);

    const token = localStorage.getItem("token");
    if (token) {
      fetch(`${API_BASE}/api/dashboard/summary`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setSummary(data))
        .catch(err => console.error(err));
    }
  }, []);

  if (!user) return null;

  return (
    <div className="app-container">
      <main className="main-content">
        <Navbar />

        <div className="dashboard-body">
          <PinnedHero
            user={user}
            subtitle={`${user.department} Department — Teaching load and events`}
            pins={summary?.pins}
            fallbackBadge={{ text: "👨‍🏫 Instructor", background: "var(--accent-solid)", color: "var(--on-brand)" }}
          />

          {summary && (
            <div className="content-grid" style={{ gridTemplateColumns: "1fr 1fr 1fr", marginBottom: "24px" }}>
              <div className="card" style={{ textAlign: "center" }}>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "4px" }}>Classes Handled</p>
                <h2 style={{ color: "var(--heading)", fontSize: "2rem", margin: 0 }}>{summary.classesHandled}</h2>
              </div>
              <div className="card" style={{ textAlign: "center" }}>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "4px" }}>Subjects</p>
                <h2 style={{ color: "var(--gold)", fontSize: "2rem", margin: 0 }}>{summary.subjects}</h2>
              </div>
              <div className="card" style={{ textAlign: "center" }}>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "4px" }}>Students Taught</p>
                <h2 style={{ color: "var(--accent)", fontSize: "2rem", margin: 0 }}>{summary.studentsTaught}</h2>
              </div>
            </div>
          )}

          <div className="content-grid">
            <section className="card">
              <h3>My Classes</h3>
              {summary && summary.upcomingClasses.length > 0 ? (
                <ul style={{ listStyle: "none", padding: 0, marginTop: "12px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  {summary.upcomingClasses.map((cls, i) => (
                    <li key={i} style={{ padding: "12px", backgroundColor: "var(--surface-alt)", borderRadius: "8px" }}>
                      <strong style={{ color: "var(--heading)" }}>{cls.subject}</strong>
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--accent)", marginLeft: "8px" }}>
                        {cls.section}
                      </span>
                      <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: "4px 0 0 0" }}>
                        {cls.day} · {cls.time} · {cls.room}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: "var(--text-muted)", marginTop: "12px" }}>No classes assigned yet.</p>
              )}
            </section>

            <section className="card">
              <h3>Recent Events</h3>
              {summary && summary.recentEvents.length > 0 ? (
                <ul style={{ listStyle: "none", padding: 0, marginTop: "12px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  {summary.recentEvents.map(evt => (
                    <li key={evt.id} style={{ padding: "12px", backgroundColor: "var(--surface-alt)", borderRadius: "8px", display: "flex", gap: "10px", alignItems: "flex-start" }}>
                      {evt.image && <ItemImage src={evt.image} alt="" kind="event" height={44} className="media--mini" />}
                      <div style={{ minWidth: 0 }}>
                        <strong style={{ color: "var(--accent)" }}>{evt.title}</strong>
                        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: "4px 0 0 0" }}>{evt.date}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: "var(--text-muted)", marginTop: "12px" }}>No recent events.</p>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
