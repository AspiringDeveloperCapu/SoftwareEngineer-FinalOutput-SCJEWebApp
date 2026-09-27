import React, { useState } from "react";

interface Faculty {
  id: number;
  name: string;
  position: string;
  department: string;
}

export default function Navbar() {
  const [showAdmin, setShowAdmin] = useState(false);
  const [faculty, setFaculty] = useState<Faculty[]>([]);

  const handleAdminClick = async () => {
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

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <header className="navbar" style={{ position: "relative" }}>
      <div className="nav-title" style={{ color: "#0B3D63" }}>SCJE Portal</div>
      
      <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
        <button 
          onClick={handleAdminClick} 
          style={{ background: "none", border: "none", color: "#0B3D63", fontWeight: 600, cursor: "pointer", fontSize: "1rem" }}
        >
          Administration ▾
        </button>
        <button className="login-btn" onClick={handleLogout} style={{ padding: "8px 16px" }}>Logout</button>
      </div>

      {showAdmin && (
        <div style={{ 
          position: "absolute", top: "100%", right: "24px", width: "300px", 
          backgroundColor: "white", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", 
          padding: "16px", zIndex: 10, border: "1px solid rgba(0,0,0,0.05)", marginTop: "8px" 
        }}>
          <h3 style={{ color: "#8C1D40", marginBottom: "12px", borderBottom: "1px solid #eee", paddingBottom: "8px" }}>Faculty & Officers</h3>
          {faculty.length > 0 ? (
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
              {faculty.map(f => (
                <li key={f.id}>
                  <strong style={{ color: "#06263D" }}>{f.name}</strong><br/>
                  <span style={{ fontSize: "0.85rem", color: "#666" }}>{f.position} - {f.department}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>Loading...</p>
          )}
        </div>
      )}
    </header>
  );
}
