import React, { useEffect, useState } from "react";
import Drawer from "../components/Drawer";
import Navbar from "../components/Navbar";
import { getSession } from "../access";

interface GradeItem {
  code: string;
  description: string;
  units: number;
  midterm: number;
  finals: number;
  grade: number;
}

interface StudentGrades {
  id: number;
  name: string;
  program: string;
  section: string;
  grades: GradeItem[];
  gpa: string;
  totalUnits: number;
}

type GradesPayload =
  | { scope: "own"; grades: GradeItem[] }
  | { scope: "department" | "all"; students: StudentGrades[] };

export default function GradesPage() {
  const [payload, setPayload] = useState<GradesPayload | null>(null);
  const role = getSession()?.role || "student";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { window.location.href = '/'; return; }

    fetch("http://localhost:4000/api/grades", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setPayload(data))
      .catch(err => console.error(err));
  }, []);

  const own = payload && payload.scope === "own" ? payload.grades : null;
  const students = payload && payload.scope !== "own" ? payload.students : null;

  const totalUnits = own ? own.reduce((sum, g) => sum + g.units, 0) : 0;
  const gpa = own && own.length > 0
    ? (own.reduce((sum, g) => sum + g.grade, 0) / own.length).toFixed(2)
    : "N/A";

  const classAverage = students && students.length > 0
    ? (
        students
          .map(s => parseFloat(s.gpa))
          .filter(v => !isNaN(v))
          .reduce((sum, v) => sum + v, 0) / students.filter(s => !isNaN(parseFloat(s.gpa))).length
      ).toFixed(2)
    : "N/A";

  const title = role === "admin" ? "Grades — All Students" : "Grades — Department";

  return (
    <div className="app-container">
      <Drawer />
      <main className="main-content">
        <Navbar />
        <div className="dashboard-body">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <h2 style={{ color: "var(--heading)", margin: 0 }}>
              {own !== null ? "Achievements / Grades" : title}
            </h2>
            <div style={{ display: "flex", gap: "16px" }}>
              {own !== null ? (
                <>
                  <div className="card" style={{ padding: "12px 24px", textAlign: "center", margin: 0 }}>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: 0 }}>GPA</p>
                    <strong style={{ color: "var(--gold)", fontSize: "1.25rem" }}>{gpa}</strong>
                  </div>
                  <div className="card" style={{ padding: "12px 24px", textAlign: "center", margin: 0 }}>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: 0 }}>Total Units</p>
                    <strong style={{ color: "var(--heading)", fontSize: "1.25rem" }}>{totalUnits}</strong>
                  </div>
                </>
              ) : (
                <>
                  <div className="card" style={{ padding: "12px 24px", textAlign: "center", margin: 0 }}>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: 0 }}>Students</p>
                    <strong style={{ color: "var(--heading)", fontSize: "1.25rem" }}>{students?.length ?? 0}</strong>
                  </div>
                  <div className="card" style={{ padding: "12px 24px", textAlign: "center", margin: 0 }}>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: 0 }}>Average GPA</p>
                    <strong style={{ color: "var(--gold)", fontSize: "1.25rem" }}>{classAverage}</strong>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="card">
            {own !== null ? (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--border)", textAlign: "left" }}>
                    <th style={{ padding: "12px", color: "var(--text)", fontSize: "0.85rem" }}>Code</th>
                    <th style={{ padding: "12px", color: "var(--text)", fontSize: "0.85rem" }}>Description</th>
                    <th style={{ padding: "12px", color: "var(--text)", fontSize: "0.85rem", textAlign: "center" }}>Units</th>
                    <th style={{ padding: "12px", color: "var(--text)", fontSize: "0.85rem", textAlign: "center" }}>Midterm</th>
                    <th style={{ padding: "12px", color: "var(--text)", fontSize: "0.85rem", textAlign: "center" }}>Finals</th>
                    <th style={{ padding: "12px", color: "var(--text)", fontSize: "0.85rem", textAlign: "center" }}>Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {own.map((g, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "12px", fontWeight: 600, color: "var(--heading)" }}>{g.code}</td>
                      <td style={{ padding: "12px", color: "var(--text-dim)" }}>{g.description}</td>
                      <td style={{ padding: "12px", textAlign: "center" }}>{g.units}</td>
                      <td style={{ padding: "12px", textAlign: "center" }}>{g.midterm}</td>
                      <td style={{ padding: "12px", textAlign: "center" }}>{g.finals}</td>
                      <td style={{ padding: "12px", textAlign: "center", fontWeight: 700, color: g.grade <= 1.5 ? "var(--success)" : g.grade <= 2.0 ? "var(--gold)" : "var(--accent)" }}>{g.grade.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--border)", textAlign: "left" }}>
                    <th style={{ padding: "12px", color: "var(--text)", fontSize: "0.85rem" }}>Student</th>
                    <th style={{ padding: "12px", color: "var(--text)", fontSize: "0.85rem" }}>Program</th>
                    <th style={{ padding: "12px", color: "var(--text)", fontSize: "0.85rem", textAlign: "center" }}>Subjects</th>
                    <th style={{ padding: "12px", color: "var(--text)", fontSize: "0.85rem", textAlign: "center" }}>Units</th>
                    <th style={{ padding: "12px", color: "var(--text)", fontSize: "0.85rem", textAlign: "center" }}>GPA</th>
                  </tr>
                </thead>
                <tbody>
                  {students?.map(s => (
                    <tr key={s.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "12px", fontWeight: 600, color: "var(--heading)" }}>
                        {s.name}
                        <span style={{ color: "var(--text-faint)", fontWeight: 400, fontSize: "0.8rem", marginLeft: "8px" }}>{s.section}</span>
                      </td>
                      <td style={{ padding: "12px", color: "var(--text-dim)" }}>{s.program}</td>
                      <td style={{ padding: "12px", textAlign: "center" }}>{s.grades.length}</td>
                      <td style={{ padding: "12px", textAlign: "center" }}>{s.totalUnits}</td>
                      <td style={{ padding: "12px", textAlign: "center", fontWeight: 700, color: "var(--gold)" }}>{s.grades.length > 0 ? s.gpa : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {own !== null && own.length === 0 && (
              <p style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)" }}>No grades available.</p>
            )}
            {students !== null && students.length === 0 && (
              <p style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)" }}>No students in your department.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
