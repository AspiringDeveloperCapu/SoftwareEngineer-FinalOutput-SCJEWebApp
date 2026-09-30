import { API_BASE } from "../api";
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

interface FacultyMember {
  id: number;
  name: string;
  position: string;
  department: string;
  specialization: string;
  email: string;
}

export default function FacultyPage() {
  const [faculty, setFaculty] = useState<FacultyMember[]>([]);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    fetch(`${API_BASE}/api/faculty`)
      .then(res => res.json())
      .then(data => setFaculty(data))
      .catch(err => console.error(err));
  }, []);

  const departments = ["All", ...Array.from(new Set(faculty.map(f => f.department)))];
  const filtered = filter === "All" ? faculty : faculty.filter(f => f.department === filter);

  return (
    <div className="app-container">
      <main className="main-content">
        <Navbar />
        <div className="dashboard-body">
          <h2 style={{ color: "var(--heading)", marginBottom: "16px" }}>Faculty Members & Officers</h2>

          {/* Department Filter */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
            {departments.map(dept => (
              <button
                key={dept}
                onClick={() => setFilter(dept)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "99px",
                  border: filter === dept ? "none" : "1px solid var(--border-strong)",
                  backgroundColor: filter === dept ? "var(--brand)" : "var(--surface)",
                  color: filter === dept ? "var(--on-brand)" : "var(--text)",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                {dept}
              </button>
            ))}
          </div>

          {/* Faculty Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            {filtered.map(f => (
              <div key={f.id} className="card" style={{ padding: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{
                    width: "48px", height: "48px", borderRadius: "50%",
                    background: "linear-gradient(135deg, var(--brand), var(--accent-solid))",
                    display: "flex", justifyContent: "center", alignItems: "center",
                    color: "white", fontWeight: 800, fontSize: "1.1rem", flexShrink: 0
                  }}>
                    {f.name.charAt(0)}
                  </div>
                  <div>
                    <strong style={{ color: "var(--text)", fontSize: "1rem" }}>{f.name}</strong>
                    <p style={{ color: "var(--accent)", fontSize: "0.85rem", fontWeight: 600, margin: "2px 0" }}>{f.position}</p>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", margin: 0 }}>{f.specialization} · {f.department}</p>
                    <p style={{ color: "var(--heading)", fontSize: "0.8rem", margin: "4px 0 0 0" }}>{f.email}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="card" style={{ padding: "48px", textAlign: "center" }}>
              <p style={{ color: "var(--text-muted)" }}>No faculty members found.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
