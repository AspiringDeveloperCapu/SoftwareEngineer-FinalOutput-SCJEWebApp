import React, { useEffect, useState } from "react";
import Drawer from "../components/Drawer";
import Navbar from "../components/Navbar";

interface GradeItem {
  code: string;
  description: string;
  units: number;
  midterm: number;
  finals: number;
  grade: number;
}

export default function GradesPage() {
  const [grades, setGrades] = useState<GradeItem[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { window.location.href = '/'; return; }

    fetch("http://localhost:4000/api/grades", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setGrades(data))
      .catch(err => console.error(err));
  }, []);

  const totalUnits = grades.reduce((sum, g) => sum + g.units, 0);
  const gpa = grades.length > 0
    ? (grades.reduce((sum, g) => sum + g.grade, 0) / grades.length).toFixed(2)
    : "N/A";

  return (
    <div className="app-container">
      <Drawer />
      <main className="main-content">
        <Navbar />
        <div className="dashboard-body">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <h2 style={{ color: "#0B3D63", margin: 0 }}>Achievements / Grades</h2>
            <div style={{ display: "flex", gap: "16px" }}>
              <div className="card" style={{ padding: "12px 24px", textAlign: "center", margin: 0 }}>
                <p style={{ fontSize: "0.75rem", color: "#666", margin: 0 }}>GPA</p>
                <strong style={{ color: "#C9A227", fontSize: "1.25rem" }}>{gpa}</strong>
              </div>
              <div className="card" style={{ padding: "12px 24px", textAlign: "center", margin: 0 }}>
                <p style={{ fontSize: "0.75rem", color: "#666", margin: 0 }}>Total Units</p>
                <strong style={{ color: "#0B3D63", fontSize: "1.25rem" }}>{totalUnits}</strong>
              </div>
            </div>
          </div>

          <div className="card">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #eee", textAlign: "left" }}>
                  <th style={{ padding: "12px", color: "#06263D", fontSize: "0.85rem" }}>Code</th>
                  <th style={{ padding: "12px", color: "#06263D", fontSize: "0.85rem" }}>Description</th>
                  <th style={{ padding: "12px", color: "#06263D", fontSize: "0.85rem", textAlign: "center" }}>Units</th>
                  <th style={{ padding: "12px", color: "#06263D", fontSize: "0.85rem", textAlign: "center" }}>Midterm</th>
                  <th style={{ padding: "12px", color: "#06263D", fontSize: "0.85rem", textAlign: "center" }}>Finals</th>
                  <th style={{ padding: "12px", color: "#06263D", fontSize: "0.85rem", textAlign: "center" }}>Grade</th>
                </tr>
              </thead>
              <tbody>
                {grades.map((g, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <td style={{ padding: "12px", fontWeight: 600, color: "#0B3D63" }}>{g.code}</td>
                    <td style={{ padding: "12px", color: "#333" }}>{g.description}</td>
                    <td style={{ padding: "12px", textAlign: "center" }}>{g.units}</td>
                    <td style={{ padding: "12px", textAlign: "center" }}>{g.midterm}</td>
                    <td style={{ padding: "12px", textAlign: "center" }}>{g.finals}</td>
                    <td style={{ padding: "12px", textAlign: "center", fontWeight: 700, color: g.grade <= 1.5 ? "#2e7d32" : g.grade <= 2.0 ? "#C9A227" : "#8C1D40" }}>{g.grade.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {grades.length === 0 && <p style={{ padding: "24px", textAlign: "center", color: "#666" }}>No grades available.</p>}
          </div>
        </div>
      </main>
    </div>
  );
}
