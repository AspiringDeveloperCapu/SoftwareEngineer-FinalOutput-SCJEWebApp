import React, { useEffect, useState } from "react";
import Drawer from "../components/Drawer";
import Navbar from "../components/Navbar";

interface Student {
  id: number;
  name: string;
  email: string;
  program: string;
  section: string;
  year: string;
  department: string;
  gender: string;
  birthday: string;
  picture: string;
}

interface GradeItem {
  code: string;
  description: string;
  units: number;
  midterm: number;
  finals: number;
  grade: number;
}

interface ScheduleItem {
  day: string;
  time: string;
  subject: string;
  room: string;
  instructor: string;
}

interface StudentDetail {
  student: Student;
  grades: GradeItem[];
  schedule: ScheduleItem[];
}

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`
});

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [query, setQuery] = useState("");
  const [program, setProgram] = useState("All");
  const [detail, setDetail] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("http://localhost:4000/api/admin/users", { headers: authHeaders() })
      .then(res => res.json())
      .then(data => setStudents(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
  }, []);

  const programs = ["All", ...Array.from(new Set(students.map(s => s.program)))];
  const filtered = students.filter(s => {
    const matchesQuery =
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.email.toLowerCase().includes(query.toLowerCase()) ||
      s.section.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (program === "All" || s.program === program);
  });

  const openDetail = (id: number) => {
    setLoading(true);
    fetch(`http://localhost:4000/api/admin/users/${id}`, { headers: authHeaders() })
      .then(res => res.json())
      .then(data => setDetail(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  const gpaColor = (gpa: string) => {
    const v = parseFloat(gpa);
    if (isNaN(v)) return "var(--text-muted)";
    return v <= 1.5 ? "var(--success)" : v <= 2.0 ? "var(--gold)" : "var(--accent)";
  };

  return (
    <div className="app-container">
      <Drawer />
      <main className="main-content">
        <Navbar />
        <div className="dashboard-body">
          {!detail ? (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
                <h2 style={{ color: "var(--heading)", margin: 0 }}>Student Roster</h2>
                <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>{filtered.length} of {students.length} students</span>
              </div>

              <input
                type="search"
                placeholder="Search name, email or section…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                style={{ width: "100%", padding: "12px 16px", borderRadius: "10px", border: "1px solid var(--border-strong)", backgroundColor: "var(--surface)", color: "var(--text)", fontSize: "0.95rem", marginBottom: "16px" }}
              />

              <div style={{ display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap" }}>
                {programs.map(p => (
                  <button
                    key={p}
                    onClick={() => setProgram(p)}
                    style={{
                      padding: "8px 16px", borderRadius: "99px",
                      border: program === p ? "none" : "1px solid var(--border-strong)",
                      backgroundColor: program === p ? "var(--brand)" : "var(--surface)",
                      color: program === p ? "var(--on-brand)" : "var(--text)",
                      fontWeight: 600, fontSize: "0.85rem", cursor: "pointer"
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <div className="card" style={{ padding: 0 }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid var(--border)", textAlign: "left" }}>
                      <th style={{ padding: "12px", color: "var(--text)", fontSize: "0.85rem" }}>Name</th>
                      <th style={{ padding: "12px", color: "var(--text)", fontSize: "0.85rem" }}>Program</th>
                      <th style={{ padding: "12px", color: "var(--text)", fontSize: "0.85rem" }}>Section</th>
                      <th style={{ padding: "12px", color: "var(--text)", fontSize: "0.85rem" }}>Year</th>
                      <th style={{ padding: "12px", color: "var(--text)", fontSize: "0.85rem" }}>Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(s => (
                      <tr
                        key={s.id}
                        onClick={() => openDetail(s.id)}
                        style={{ borderBottom: "1px solid var(--border)", cursor: "pointer" }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = "var(--surface-alt)")}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                      >
                        <td style={{ padding: "12px", fontWeight: 600, color: "var(--heading)" }}>{s.name}</td>
                        <td style={{ padding: "12px", color: "var(--text-dim)" }}>{s.program}</td>
                        <td style={{ padding: "12px", color: "var(--text-dim)" }}>{s.section}</td>
                        <td style={{ padding: "12px", color: "var(--text-dim)" }}>{s.year}</td>
                        <td style={{ padding: "12px", color: "var(--text-muted)", fontSize: "0.85rem" }}>{s.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filtered.length === 0 && (
                  <p style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)" }}>
                    No student matches “{query}”.
                  </p>
                )}
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => setDetail(null)}
                style={{ background: "none", border: "none", color: "var(--heading)", fontWeight: 700, cursor: "pointer", fontSize: "0.95rem", marginBottom: "16px", padding: 0 }}
              >
                ← Back to roster
              </button>

              <div className="card" style={{ marginBottom: "24px", display: "flex", gap: "20px", alignItems: "center", flexWrap: "wrap" }}>
                <div style={{
                  width: "72px", height: "72px", borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--brand), var(--accent-solid))",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "white", fontWeight: 800, fontSize: "1.6rem", flexShrink: 0
                }}>
                  {detail.student.name.charAt(0)}
                </div>
                <div>
                  <h3 style={{ margin: 0, color: "var(--heading)" }}>{detail.student.name}</h3>
                  <p style={{ margin: "4px 0 0", color: "var(--accent)", fontWeight: 600, fontSize: "0.9rem" }}>
                    {detail.student.program} · Section {detail.student.section} · Year {detail.student.year}
                  </p>
                  <p style={{ margin: "4px 0 0", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                    {detail.student.email}
                    {detail.student.gender ? ` · ${detail.student.gender}` : ""}
                    {detail.student.birthday ? ` · Born ${detail.student.birthday}` : ""}
                  </p>
                </div>
                <div style={{ marginLeft: "auto", display: "flex", gap: "12px" }}>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-muted)" }}>GPA</p>
                    <strong style={{ fontSize: "1.4rem", color: gpaColor(
                      detail.grades.length > 0
                        ? (detail.grades.reduce((s, g) => s + g.grade, 0) / detail.grades.length).toFixed(2)
                        : "N/A"
                    ) }}>
                      {detail.grades.length > 0
                        ? (detail.grades.reduce((s, g) => s + g.grade, 0) / detail.grades.length).toFixed(2)
                        : "—"}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="content-grid">
                <section className="card">
                  <h3>Grades</h3>
                  {detail.grades.length > 0 ? (
                    <ul style={{ listStyle: "none", padding: 0, marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                      {detail.grades.map((g, i) => (
                        <li key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 12px", backgroundColor: "var(--surface-alt)", borderRadius: "8px" }}>
                          <span>
                            <strong style={{ color: "var(--heading)" }}>{g.code}</strong>
                            <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginLeft: "8px" }}>{g.description}</span>
                          </span>
                          <strong style={{ color: g.grade <= 1.5 ? "var(--success)" : "var(--gold)" }}>{g.grade.toFixed(2)}</strong>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{ color: "var(--text-muted)", marginTop: "12px" }}>No grades recorded yet.</p>
                  )}
                </section>

                <section className="card">
                  <h3>Schedule</h3>
                  {detail.schedule.length > 0 ? (
                    <ul style={{ listStyle: "none", padding: 0, marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                      {detail.schedule.map((c, i) => (
                        <li key={i} style={{ padding: "10px 12px", backgroundColor: "var(--surface-alt)", borderRadius: "8px" }}>
                          <strong style={{ color: "var(--heading)" }}>{c.subject}</strong>
                          <span style={{ color: "var(--text-faint)", fontSize: "0.8rem", marginLeft: "8px" }}>{c.day}</span>
                          <p style={{ margin: "4px 0 0", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                            {c.time} · {c.room} · {c.instructor}
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{ color: "var(--text-muted)", marginTop: "12px" }}>No schedule on file.</p>
                  )}
                </section>
              </div>

              {loading && <p style={{ color: "var(--text-muted)" }}>Loading…</p>}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
