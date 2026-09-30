import { API_BASE } from "../api";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import PinnedHero, { PinSummary } from "../components/PinnedHero";
import ItemImage from "../components/ItemImage";
import { getSession, Session } from "../access";

interface FacultyItem {
  id: number;
  name: string;
  position: string;
  department: string;
}

interface EventItem {
  id: number;
  title: string;
  date: string;
  image?: string;
}

interface AdminSummary {
  role: "admin";
  totalStudents: number;
  totalFaculty: number;
  totalEvents: number;
  unreadNotifications: number;
  recentEvents: EventItem[];
  faculty: FacultyItem[];
  pins?: PinSummary[];
}

export default function AdminDashboard() {
  const [user, setUser] = useState<Session | null>(null);
  const [summary, setSummary] = useState<AdminSummary | null>(null);

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

  const actions = [
    { to: "/students", icon: "🧑‍🎓", label: "Accounts", note: "Create, edit, assign roles" },
    { to: "/manage-announcements", icon: "📣", label: "Announcements", note: "Publish and pin" },
    { to: "/manage-events", icon: "🗓️", label: "Manage Events", note: "Drafts, status, pinning" },
    { to: "/manage-faculty", icon: "🗂️", label: "Manage Faculty", note: "Instructors and staff" }
  ];

  return (
    <div className="app-container">
      <main className="main-content">
        <Navbar />

        <div className="dashboard-body">
          <PinnedHero
            user={user}
            subtitle={`${user.department} — MIS Office · Full access to the back office`}
            pins={summary?.pins}
            fallbackBadge={{ text: "⚙️ Administrator", background: "var(--gold)", color: "var(--on-gold)" }}
          />

          {summary && (
            <div className="content-grid" style={{ gridTemplateColumns: "1fr 1fr 1fr", marginBottom: "24px" }}>
              <div className="card" style={{ textAlign: "center" }}>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "4px" }}>Students</p>
                <h2 style={{ color: "var(--heading)", fontSize: "2rem", margin: 0 }}>{summary.totalStudents}</h2>
              </div>
              <div className="card" style={{ textAlign: "center" }}>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "4px" }}>Faculty Members</p>
                <h2 style={{ color: "var(--gold)", fontSize: "2rem", margin: 0 }}>{summary.totalFaculty}</h2>
              </div>
              <div className="card" style={{ textAlign: "center" }}>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "4px" }}>Events</p>
                <h2 style={{ color: "var(--accent)", fontSize: "2rem", margin: 0 }}>{summary.totalEvents}</h2>
              </div>
            </div>
          )}

          {/* Back office shortcuts - only the admin tier has these */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "24px" }}>
            {actions.map(action => (
              <Link key={action.to} to={action.to} style={{ textDecoration: "none" }}>
                <div className="card" style={{ display: "flex", alignItems: "center", gap: "12px", transition: "transform 0.15s" }}>
                  <span style={{ fontSize: "1.6rem" }}>{action.icon}</span>
                  <div>
                    <strong style={{ color: "var(--heading)", display: "block" }}>{action.label}</strong>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{action.note}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="content-grid">
            <section className="card">
              <h3>Faculty Snapshot</h3>
              {summary && summary.faculty.length > 0 ? (
                <ul style={{ listStyle: "none", padding: 0, marginTop: "12px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  {summary.faculty.map(f => (
                    <li key={f.id} style={{ padding: "12px", backgroundColor: "var(--surface-alt)", borderRadius: "8px" }}>
                      <strong style={{ color: "var(--heading)" }}>{f.name}</strong>
                      <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: "4px 0 0 0" }}>
                        {f.position} · {f.department}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: "var(--text-muted)", marginTop: "12px" }}>No faculty records.</p>
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
