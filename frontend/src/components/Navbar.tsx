import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

interface Faculty {
  id: number;
  name: string;
  position: string;
  department: string;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  date: string;
  read: boolean;
}

export default function Navbar() {
  const navigate = useNavigate();
  const [showAdmin, setShowAdmin] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));

    const token = localStorage.getItem("token");
    if (token) {
      fetch("http://localhost:4000/api/notifications", {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setNotifications(data))
        .catch(err => console.error(err));
    }
  }, []);

  const handleAdminClick = async () => {
    setShowNotifs(false);
    if (!showAdmin && faculty.length === 0) {
      try {
        const res = await fetch("http://localhost:4000/api/faculty");
        const data = await res.json();
        setFaculty(data);
      } catch (err) {
        console.error(err);
      }
    }
    setShowAdmin(!showAdmin);
  };

  const handleNotifClick = () => {
    setShowAdmin(false);
    setShowNotifs(!showNotifs);
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="navbar" style={{ position: "relative" }}>
      <div className="nav-title" style={{ color: "var(--heading)" }}>
        SCJE Student Hub
      </div>

      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        {/* Theme */}
        <ThemeToggle />

        {/* Notifications Bell */}
        {user && (
          <button
            onClick={handleNotifClick}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem", position: "relative", padding: "4px 8px" }}
          >
            🔔
            {unreadCount > 0 && (
              <span style={{
                position: "absolute", top: "-2px", right: "0",
                backgroundColor: "var(--accent-solid)", color: "white",
                borderRadius: "50%", width: "18px", height: "18px",
                fontSize: "0.7rem", fontWeight: 700,
                display: "flex", justifyContent: "center", alignItems: "center"
              }}>
                {unreadCount}
              </span>
            )}
          </button>
        )}

        {/* Administration */}
        {user && (
          <button
            onClick={handleAdminClick}
            style={{ background: "none", border: "none", color: "var(--heading)", fontWeight: 600, cursor: "pointer", fontSize: "0.95rem" }}
          >
            Administration ▾
          </button>
        )}

        {/* Logout */}
        <button className="login-btn" onClick={handleLogout} style={{ padding: "8px 16px" }}>
          Logout
        </button>
      </div>

      {/* Administration Dropdown */}
      {showAdmin && (
        <div style={{
          position: "absolute", top: "100%", right: "100px", width: "320px",
          backgroundColor: "var(--surface)", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
          padding: "16px", zIndex: 10, border: "1px solid var(--border)", marginTop: "8px"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", borderBottom: "1px solid var(--border)", paddingBottom: "8px" }}>
            <h3 style={{ color: "var(--accent)", margin: 0, fontSize: "0.95rem" }}>Faculty & Officers</h3>
            <button onClick={() => navigate("/instructors")} style={{ background: "none", border: "none", color: "var(--heading)", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}>
              View All →
            </button>
          </div>
          {faculty.length > 0 ? (
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
              {faculty.slice(0, 4).map(f => (
                <li key={f.id} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{
                    width: "36px", height: "36px", borderRadius: "50%",
                    background: "linear-gradient(135deg, var(--brand), var(--accent-solid))",
                    display: "flex", justifyContent: "center", alignItems: "center",
                    color: "white", fontWeight: 700, fontSize: "0.85rem", flexShrink: 0
                  }}>
                    {f.name.charAt(0)}
                  </div>
                  <div>
                    <strong style={{ color: "var(--text)", fontSize: "0.85rem" }}>{f.name}</strong><br />
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{f.position} · {f.department}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>Loading...</p>
          )}
        </div>
      )}

      {/* Notifications Dropdown */}
      {showNotifs && (
        <div style={{
          position: "absolute", top: "100%", right: "180px", width: "320px",
          backgroundColor: "var(--surface)", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
          padding: "16px", zIndex: 10, border: "1px solid var(--border)", marginTop: "8px"
        }}>
          <h3 style={{ color: "var(--heading)", margin: "0 0 12px 0", fontSize: "0.95rem", borderBottom: "1px solid var(--border)", paddingBottom: "8px" }}>Notifications</h3>
          {notifications.length > 0 ? (
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
              {notifications.map(n => (
                <li key={n.id} style={{ padding: "8px", borderRadius: "8px", backgroundColor: n.read ? "var(--surface)" : "var(--surface-2)", borderLeft: n.read ? "3px solid transparent" : "3px solid var(--gold)" }}>
                  <strong style={{ color: "var(--text)", fontSize: "0.85rem" }}>{n.title}</strong>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: "2px 0 0 0" }}>{n.message}</p>
                  <p style={{ fontSize: "0.7rem", color: "var(--text-faint)", margin: "4px 0 0 0" }}>{n.date}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No notifications.</p>
          )}
        </div>
      )}
    </header>
  );
}
