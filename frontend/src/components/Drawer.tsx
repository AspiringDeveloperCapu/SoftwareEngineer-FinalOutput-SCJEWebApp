import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getSession, linksFor, NavItem, Session, VIEW_ONLY_LINKS } from "../access";

export const ROLE_STYLE: Record<string, { background: string; color: string }> = {
  admin: { background: "var(--gold)", color: "var(--on-gold)" },
  instructor: { background: "var(--accent-solid)", color: "var(--on-brand)" },
  student: { background: "var(--on-brand)", color: "var(--brand-strong)" }
};

export default function Drawer() {
  const [user, setUser] = useState<Session | null>(null);
  const location = useLocation();

  useEffect(() => {
    setUser(getSession());
  }, [location.pathname]);

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

  const links: NavItem[] = user ? linksFor(user.role) : VIEW_ONLY_LINKS;

  return (
    <aside className="drawer">
      {/* User Info */}
      <Link to={user ? "/profile" : "/events"} style={{ textDecoration: "none", color: "white" }}>
        <div className="user-info" style={{ cursor: "pointer", transition: "background 0.2s" }}>
          {user?.picture ? (
            <img src={user.picture} alt="Profile" style={{ width: "80px", height: "80px", borderRadius: "50%", objectFit: "cover", margin: "0 auto 12px", display: "block", border: "2px solid var(--gold)" }} />
          ) : (
            <div className="avatar-placeholder"></div>
          )}

          <h2 style={{ fontSize: "1.1rem" }}>{user ? user.name : "View Only"}</h2>
          <p style={{ fontWeight: 600, color: "var(--gold)" }}>{user ? user.department : "Visiting"}</p>

          {user && (
            <span
              className="role-badge"
              style={{
                display: "inline-block",
                marginTop: "8px",
                padding: "2px 10px",
                borderRadius: "99px",
                fontSize: "0.7rem",
                fontWeight: 800,
                letterSpacing: "0.6px",
                backgroundColor: (ROLE_STYLE[user.role] || ROLE_STYLE.student).background,
                color: (ROLE_STYLE[user.role] || ROLE_STYLE.student).color
              }}
            >
              {user.role.toUpperCase()}
            </span>
          )}

          {user?.course && <p style={{ fontSize: "0.8rem", marginTop: "4px", opacity: 0.8 }}>{user.course}</p>}
          {user?.birthday && <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", marginTop: "4px" }}>Born: {user.birthday}</p>}
        </div>
      </Link>

      {/* Navigation */}
      <nav style={{ flex: 1 }}>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {links.map(link => (
            <li key={link.to}>
              <Link to={link.to} style={linkStyle(link.to)}>
                {link.icon} {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div style={{ padding: "16px 24px", borderTop: "1px solid rgba(255,255,255,0.1)", fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>
        SCJE Student Hub v1.0
      </div>
    </aside>
  );
}
