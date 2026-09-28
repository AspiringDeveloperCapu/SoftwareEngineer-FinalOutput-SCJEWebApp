import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Drawer() {
  const [user, setUser] = useState<any>(null);
  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const linkStyle = (path: string): React.CSSProperties => ({
    color: "white",
    textDecoration: "none",
    display: "block",
    width: "100%",
    padding: "14px 24px",
    backgroundColor: isActive(path) ? "var(--brand-strong)" : "transparent",
    borderLeft: isActive(path) ? "3px solid var(--gold)" : "3px solid transparent",
    fontWeight: isActive(path) ? 700 : 500,
    transition: "all 0.2s",
    fontSize: "0.95rem"
  });

  return (
    <aside className="drawer">
      {/* User Info */}
      <Link to="/profile" style={{ textDecoration: "none", color: "white" }}>
        <div className="user-info" style={{ cursor: "pointer", transition: "background 0.2s" }}>
          {user?.picture ? (
            <img src={user.picture} alt="Profile" style={{ width: "80px", height: "80px", borderRadius: "50%", objectFit: "cover", margin: "0 auto 12px", display: "block", border: "2px solid var(--gold)" }} />
          ) : (
            <div className="avatar-placeholder"></div>
          )}

          <h2 style={{ fontSize: "1.1rem" }}>{user ? user.name : "Student Name"}</h2>
          <p style={{ fontWeight: 600, color: "var(--gold)" }}>{user ? user.department : "Department"}</p>

          {user?.course && <p style={{ fontSize: "0.8rem", marginTop: "4px", opacity: 0.8 }}>{user.course}</p>}
          {user?.birthday && <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", marginTop: "4px" }}>Born: {user.birthday}</p>}
        </div>
      </Link>

      {/* Navigation */}
      <nav style={{ flex: 1 }}>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {user && !user.viewOnly && (
            <>
              <li><Link to="/dashboard" style={linkStyle("/dashboard")}>🏠 Dashboard</Link></li>
              <li><Link to="/instructors" style={linkStyle("/instructors")}>👨‍🏫 Instructors</Link></li>
              <li><Link to="/schedule" style={linkStyle("/schedule")}>📅 Schedule</Link></li>
              <li><Link to="/grades" style={linkStyle("/grades")}>🎓 Grades</Link></li>
            </>
          )}
          <li><Link to="/events" style={linkStyle("/events")}>📢 Events</Link></li>
        </ul>
      </nav>

      {/* Footer */}
      <div style={{ padding: "16px 24px", borderTop: "1px solid rgba(255,255,255,0.1)", fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>
        SCJE Student Hub v1.0
      </div>
    </aside>
  );
}
