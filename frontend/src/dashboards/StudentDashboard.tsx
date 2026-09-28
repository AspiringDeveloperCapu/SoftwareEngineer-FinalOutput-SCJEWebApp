import React, { useEffect, useState } from "react";
import Drawer from "../components/Drawer";
import Navbar from "../components/Navbar";
import PinnedHero, { PinSummary } from "../components/PinnedHero";
import { getSession, Session } from "../access";

interface ScheduleItem {
  day: string;
  time: string;
  subject: string;
  room: string;
  instructor: string;
}

interface EventItem {
  id: number;
  title: string;
  date: string;
}

export interface StudentSummary {
  role: "student";
  totalSubjects: number;
  gpa: string;
  upcomingClasses: ScheduleItem[];
  unreadNotifications: number;
  recentEvents: EventItem[];
  pin?: PinSummary | null;
}

export default function StudentDashboard() {
  const [user, setUser] = useState<Session | null>(null);
  const [summary, setSummary] = useState<StudentSummary | null>(null);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      window.location.href = "/";
      return;
    }
    setUser(session);

    const token = localStorage.getItem("token");
    if (token) {
      fetch("http://localhost:4000/api/dashboard/summary", {
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
      <Drawer />
      <main className="main-content">
        <Navbar />

        <div className="dashboard-body">
          {/* Hero: shows the admin's pinned announcement/event when there is one */}
          <PinnedHero
            user={user}
            subtitle={`${user.department} — ${user.course}${user.section ? ` / ${user.section}` : ""}`}
            pin={summary?.pin}
            fallbackBadge={{ text: "🎓 Student", background: "var(--accent-solid)", color: "var(--on-brand)" }}
          />

          {/* Stats Cards */}
          {summary && (
            <div className="content-grid" style={{ gridTemplateColumns: "1fr 1fr 1fr", marginBottom: "24px" }}>
              <div className="card" style={{ textAlign: "center" }}>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "4px" }}>Enrolled Subjects</p>
                <h2 style={{ color: "var(--heading)", fontSize: "2rem", margin: 0 }}>{summary.totalSubjects}</h2>
              </div>
              <div className="card" style={{ textAlign: "center" }}>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "4px" }}>Current GPA</p>
                <h2 style={{ color: "var(--gold)", fontSize: "2rem", margin: 0 }}>{summary.gpa}</h2>
              </div>
              <div className="card" style={{ textAlign: "center" }}>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "4px" }}>Notifications</p>
                <h2 style={{ color: "var(--accent)", fontSize: "2rem", margin: 0 }}>{summary.unreadNotifications}</h2>
              </div>
            </div>
          )}

          {/* Bottom Grid */}
          <div className="content-grid">
            {/* Upcoming Classes */}
            <section className="card">
              <h3>Upcoming Classes</h3>
              {summary && summary.upcomingClasses.length > 0 ? (
                <ul style={{ listStyle: "none", padding: 0, marginTop: "12px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  {summary.upcomingClasses.map((cls, i) => (
                    <li key={i} style={{ padding: "12px", backgroundColor: "var(--surface-alt)", borderRadius: "8px" }}>
                      <strong style={{ color: "var(--heading)" }}>{cls.subject}</strong>
                      <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: "4px 0 0 0" }}>
                        {cls.day} · {cls.time} · {cls.room}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: "var(--text-muted)", marginTop: "12px" }}>No upcoming classes.</p>
              )}
            </section>

            {/* Recent Events */}
            <section className="card">
              <h3>Recent Events</h3>
              {summary && summary.recentEvents.length > 0 ? (
                <ul style={{ listStyle: "none", padding: 0, marginTop: "12px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  {summary.recentEvents.map(evt => (
                    <li key={evt.id} style={{ padding: "12px", backgroundColor: "var(--surface-alt)", borderRadius: "8px" }}>
                      <strong style={{ color: "var(--accent)" }}>{evt.title}</strong>
                      <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: "4px 0 0 0" }}>{evt.date}</p>
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
