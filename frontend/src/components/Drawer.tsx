import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Drawer() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <aside className="drawer">
      <div className="user-info">
        {user?.picture ? (
          <img src={user.picture} alt="Profile" style={{ width: "80px", height: "80px", borderRadius: "50%", objectFit: "cover", margin: "0 auto 12px", display: "block", border: "2px solid #C9A227" }} />
        ) : (
          <div className="avatar-placeholder"></div>
        )}
        
        <h2>{user ? user.name : "Student Name"}</h2>
        <p style={{ fontWeight: 600, color: "#C9A227" }}>{user ? user.department : "SCJE Department"}</p>
        
        {user?.course && <p style={{ fontSize: "0.8rem", marginTop: "4px" }}>{user.course}</p>}
        {user?.birthday && <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", marginTop: "4px" }}>Born: {user.birthday}</p>}
      </div>
      <nav className="menu">
        <ul>
          {user && !user.viewOnly && (
            <>
              <li><Link to="/dashboard" style={{color: 'white', textDecoration: 'none'}}>Dashboard</Link></li>
              <li><Link to="/instructors" style={{color: 'white', textDecoration: 'none'}}>Instructors</Link></li>
              <li><Link to="/schedule" style={{color: 'white', textDecoration: 'none'}}>Schedule</Link></li>
              <li><Link to="/grades" style={{color: 'white', textDecoration: 'none'}}>Achievements / Grades</Link></li>
            </>
          )}
          <li><Link to="/events" style={{color: 'white', textDecoration: 'none'}}>Events / Announcements</Link></li>
        </ul>
      </nav>
    </aside>
  );
}
