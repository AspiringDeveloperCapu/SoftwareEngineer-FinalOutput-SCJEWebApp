import React, { useEffect, useState } from "react";
import Drawer from "../components/Drawer";
import Navbar from "../components/Navbar";

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

interface DashboardSummary {
  totalSubjects: number;
  gpa: string;
  upcomingClasses: ScheduleItem[];
  unreadNotifications: number;
  recentEvents: EventItem[];
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      window.location.href = '/';
      return;
    }

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
          {/* Pinned Hero */}
          <section className="hero" style={{ position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: "16px", right: "16px", backgroundColor: "#8C1D40", color: "white", padding: "4px 12px", borderRadius: "99px", fontSize: "0.8rem", fontWeight: "bold" }}>
              📌 Pinned
            </div>
            <h1 style={{ fontSize: "1.5rem" }}>Welcome, {user.name}!</h1>
            <p style={{ color: "#666", fontSize: "1rem", marginTop: "8px" }}>
              {user.department} — {user.course} {user.section ? `/ ${user.section}` : ""}
            </p>
          </section>

          {/* Stats Cards */}
          {summary && (
            <div className="content-grid" style={{ gridTemplateColumns: "1fr 1fr 1fr", marginBottom: "24px" }}>
              <div className="card" style={{ textAlign: "center" }}>
                <p style={{ color: "#666", fontSize: "0.85rem", marginBottom: "4px" }}>Enrolled Subjects</p>
                <h2 style={{ color: "#0B3D63", fontSize: "2rem", margin: 0 }}>{summary.totalSubjects}</h2>
              </div>
              <div className="card" style={{ textAlign: "center" }}>
                <p style={{ color: "#666", fontSize: "0.85rem", marginBottom: "4px" }}>Current GPA</p>
                <h2 style={{ color: "#C9A227", fontSize: "2rem", margin: 0 }}>{summary.gpa}</h2>
              </div>
              <div className="card" style={{ textAlign: "center" }}>
                <p style={{ color: "#666", fontSize: "0.85rem", marginBottom: "4px" }}>Notifications</p>
                <h2 style={{ color: "#8C1D40", fontSize: "2rem", margin: 0 }}>{summary.unreadNotifications}</h2>
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
                    <li key={i} style={{ padding: "12px", backgroundColor: "#F6F8FA", borderRadius: "8px" }}>
                      <strong style={{ color: "#0B3D63" }}>{cls.subject}</strong>
                      <p style={{ fontSize: "0.85rem", color: "#666", margin: "4px 0 0 0" }}>
                        {cls.day} · {cls.time} · {cls.room}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: "#666", marginTop: "12px" }}>No upcoming classes.</p>
              )}
            </section>

            {/* Recent Events */}
            <section className="card">
              <h3>Recent Events</h3>
              {summary && summary.recentEvents.length > 0 ? (
                <ul style={{ listStyle: "none", padding: 0, marginTop: "12px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  {summary.recentEvents.map(evt => (
                    <li key={evt.id} style={{ padding: "12px", backgroundColor: "#F6F8FA", borderRadius: "8px" }}>
                      <strong style={{ color: "#8C1D40" }}>{evt.title}</strong>
                      <p style={{ fontSize: "0.85rem", color: "#666", margin: "4px 0 0 0" }}>{evt.date}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: "#666", marginTop: "12px" }}>No recent events.</p>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
