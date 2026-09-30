import { API_BASE } from "../api";
import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import RoleBadge from "./RoleBadge";
import { clearSession, getSession, linksFor, NavItem, Session, VIEW_ONLY_LINKS } from "../access";

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

type Menu = "admin" | "notifs" | "user" | "nav" | null;

/**
 * The header is the whole navigation now - the sidebar is retired. Links come
 * from `linksFor(role)` in access.ts, so the bar can never disagree with the
 * route guard about what a role may open.
 *
 * Left: brand. Center: role-aware links (a compact sheet below 1100px).
 * Right: Administration (faculty & officers, open to every visitor),
 * notifications, theme toggle and the account menu - or Sign In for a guest.
 */
export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const headerRef = useRef<HTMLElement | null>(null);

  const [user, setUser] = useState<Session | null>(null);
  const [menu, setMenu] = useState<Menu>(null);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    setUser(getSession());
    setMenu(null);
  }, [location.pathname]);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${API_BASE}/api/notifications`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setNotifications(Array.isArray(data) ? data : []))
      .catch(() => setNotifications([]));
  }, [user]);

  // Menus close on anything outside the bar, and on Escape.
  useEffect(() => {
    if (!menu) return;
    const onDown = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) setMenu(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenu(null);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menu]);

  const openAdmin = () => {
    setMenu(menu === "admin" ? null : "admin");
    if (menu !== "admin" && faculty.length === 0) {
      fetch(`${API_BASE}/api/faculty`)
        .then(res => res.json())
        .then(data => setFaculty(Array.isArray(data) ? data : []))
        .catch(() => setFaculty([]));
    }
  };

  const toggle = (next: Menu) => setMenu(menu === next ? null : next);

  const logout = () => {
    clearSession(); // keeps the stored theme preference
    setMenu(null);
    window.location.href = "/";
  };

  /**
   * Sign-in lives on the main dashboard now. From anywhere else this lands on
   * the landing page and hands focus to the inline form.
   */
  const goToSignIn = () => {
    setMenu(null);
    const onLanding = location.pathname === "/" || location.pathname === "/view-only";
    if (!onLanding) {
      navigate("/#signin");
      return;
    }
    document.getElementById("signin")?.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => {
      document.querySelector<HTMLInputElement>("#signin input")?.focus();
    }, 350);
  };

  const links: NavItem[] = user ? linksFor(user.role) : VIEW_ONLY_LINKS;
  const baseCount = user && user.role === "admin" ? linksFor("student").length : links.length;

  const isActive = (to: string) =>
    to === "/" ? location.pathname === "/" : location.pathname === to || location.pathname.startsWith(`${to}/`);

  const renderLink = (link: NavItem) => (
    <Link
      key={link.to}
      to={link.to}
      className={`nav-link${isActive(link.to) ? " active" : ""}`}
      onClick={() => setMenu(null)}
    >
      {link.label}
    </Link>
  );

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="navbar" ref={headerRef}>
      <Link to={user ? "/dashboard" : "/"} className="nav-brand">
        <span className="nav-mark">
          <img src="/icons/SCJE-logo.jpg" alt="" />
        </span>
        <span className="nav-title">SCJE Student Hub</span>
      </Link>

      {/* Center: the link row */}
      <nav className="nav-links" aria-label="Main">
        {links.map((link, i) => (
          <React.Fragment key={link.to}>
            {i === baseCount && baseCount < links.length ? <span className="nav-divider" /> : null}
            {renderLink(link)}
          </React.Fragment>
        ))}
      </nav>

      {/* Center: compact menu button, shown once the row can no longer fit */}
      <button
        className="nav-btn nav-burger"
        onClick={() => toggle("nav")}
        aria-label="Menu"
        aria-expanded={menu === "nav"}
      >
        ☰
      </button>

      <div className="nav-actions">
        {/* Administration: faculty & officers, open to every visitor */}
        <div className="nav-menu-wrap">
          <button
            className="nav-btn"
            onClick={openAdmin}
            aria-expanded={menu === "admin"}
            style={{ background: menu === "admin" ? "var(--glass-strong)" : undefined }}
          >
            <span className="nav-admin-label">Administration</span> ▾
          </button>
          {menu === "admin" && (
            <div className="nav-menu">
              <div className="nav-menu-title">
                <span>Faculty &amp; Officers</span>
                {user && (
                  <Link
                    to="/instructors"
                    onClick={() => setMenu(null)}
                    style={{ color: "var(--heading)", fontSize: "0.75rem", textDecoration: "none" }}
                  >
                    View All →
                  </Link>
                )}
              </div>
              {faculty.length > 0 ? (
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                  {faculty.slice(0, 6).map(f => (
                    <li key={f.id} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span className="nav-avatar">{f.name.charAt(0)}</span>
                      <span style={{ minWidth: 0 }}>
                        <strong style={{ color: "var(--text)", fontSize: "0.85rem", display: "block" }}>{f.name}</strong>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          {f.position} · {f.department}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Loading…</p>
              )}
              {!user && (
                <p className="nav-menu-meta">Sign in to open the full directory.</p>
              )}
            </div>
          )}
        </div>

        {/* Notifications */}
        {user && (
          <div className="nav-menu-wrap">
            <button className="nav-btn" onClick={() => toggle("notifs")} aria-label="Notifications" aria-expanded={menu === "notifs"}>
              🔔
              {unreadCount > 0 && <span className="nav-badge">{unreadCount}</span>}
            </button>
            {menu === "notifs" && (
              <div className="nav-menu">
                <div className="nav-menu-title">Notifications</div>
                {notifications.length > 0 ? (
                  <div>
                    {notifications.map(n => (
                      <div key={n.id} className="nav-notif" style={{ borderLeftColor: n.read ? "var(--border-strong)" : "var(--accent)" }}>
                        <strong style={{ color: "var(--text)", fontSize: "0.85rem" }}>{n.title}</strong>
                        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: "2px 0 0" }}>{n.message}</p>
                        <p style={{ fontSize: "0.7rem", color: "var(--text-faint)", margin: "4px 0 0" }}>{n.date}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No notifications.</p>
                )}
              </div>
            )}
          </div>
        )}

        <ThemeToggle />

        {/* Account */}
        {user ? (
          <div className="nav-menu-wrap">
            <button className="nav-user" onClick={() => toggle("user")} aria-expanded={menu === "user"}>
              {user.picture ? (
                <img src={user.picture} alt="" className="nav-avatar" />
              ) : (
                <span className="nav-avatar">{user.name.charAt(0)}</span>
              )}
              <span className="nav-user-name">{user.name.split(" ")[0]}</span> ▾
            </button>
            {menu === "user" && (
              <div className="nav-menu" style={{ minWidth: 260 }}>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  {user.picture ? (
                    <img src={user.picture} alt="" className="nav-avatar" style={{ width: 44, height: 44 }} />
                  ) : (
                    <span className="nav-avatar" style={{ width: 44, height: 44, fontSize: "1rem" }}>
                      {user.name.charAt(0)}
                    </span>
                  )}
                  <div style={{ minWidth: 0 }}>
                    <strong style={{ color: "var(--text)", fontSize: "0.95rem", display: "block" }}>{user.name}</strong>
                    <RoleBadge role={user.role} />
                  </div>
                </div>
                <p className="nav-menu-meta" style={{ borderTop: "none", marginTop: 4, padding: "6px 10px 0" }}>
                  {user.email}
                  <br />
                  {user.course ? `${user.course}${user.section ? ` · ${user.section}` : ""}` : user.department}
                </p>
                <Link to="/profile" className="nav-menu-link" onClick={() => setMenu(null)}>
                  👤 Profile
                </Link>
                <button className="nav-menu-link danger" onClick={logout}>
                  🚪 Sign out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button className="login-btn" onClick={goToSignIn} style={{ padding: "9px 18px" }}>
            Sign In
          </button>
        )}
      </div>

      {/* Compact sheet for narrow screens */}
      {menu === "nav" && (
        <div className="nav-sheet">
          {links.map(renderLink)}
          {user && (
            <>
              <span className="nav-divider" style={{ display: "block", width: "auto", height: 1, margin: "8px 0" }} />
              <Link to="/profile" className="nav-link" onClick={() => setMenu(null)}>
                👤 Profile
              </Link>
              <button className="nav-link" onClick={logout} style={{ textAlign: "left", background: "none", border: "none", cursor: "pointer" }}>
                🚪 Sign out
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
}
