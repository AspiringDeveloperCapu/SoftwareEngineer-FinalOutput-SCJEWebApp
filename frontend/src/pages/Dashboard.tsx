import React, { useEffect, useState } from "react";
import Drawer from "../components/Drawer";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      window.location.href = '/';
    }
  }, []);

  if (!user) return null;

  return (
    <div className="app-container">
      <Drawer />
      <main className="main-content">
        <Navbar />
        
        <div className="dashboard-body">
          {/* Pinned Dashboard Hero */}
          <section className="hero" style={{ position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: "16px", right: "16px", backgroundColor: "#8C1D40", color: "white", padding: "4px 12px", borderRadius: "99px", fontSize: "0.8rem", fontWeight: "bold" }}>
              📌 Pinned
            </div>
            <h1>Welcome to the {user.department} Portal, {user.name}</h1>
            <p style={{ color: "#666", fontSize: "1.1rem", marginTop: "8px" }}>Important: Final exams schedule has been released. Please check your schedule tab.</p>
          </section>
          
          <div className="content-grid">
            <section className="card">
              <h3>News / Announcements</h3>
              <p style={{ marginBottom: "12px", paddingBottom: "12px", borderBottom: "1px solid #eee" }}>
                <strong>Library Hours Extended</strong><br/>
                <span style={{ fontSize: "0.9rem", color: "#666" }}>Open until 8PM for the midterms week.</span>
              </p>
              <p>
                <strong>New Criminology Lab Equipment</strong><br/>
                <span style={{ fontSize: "0.9rem", color: "#666" }}>Forensics lab is now fully equipped.</span>
              </p>
            </section>
            
            <section className="card">
              <h3>Quick Actions</h3>
              <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px" }}>
                <li><button style={{ width: "100%", padding: "12px", background: "#F6F8FA", border: "1px solid #ddd", borderRadius: "8px", color: "#0B3D63", fontWeight: 600, cursor: "pointer", textAlign: "left" }}>📅 View Schedule</button></li>
                <li><button style={{ width: "100%", padding: "12px", background: "#F6F8FA", border: "1px solid #ddd", borderRadius: "8px", color: "#0B3D63", fontWeight: 600, cursor: "pointer", textAlign: "left" }}>🎓 Check Grades</button></li>
                <li><button style={{ width: "100%", padding: "12px", background: "#F6F8FA", border: "1px solid #ddd", borderRadius: "8px", color: "#0B3D63", fontWeight: 600, cursor: "pointer", textAlign: "left" }}>✉️ Contact Instructors</button></li>
              </ul>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
