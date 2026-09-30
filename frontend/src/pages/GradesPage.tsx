import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { getSession } from "../access";
import { buildCsv, mapGradesTable } from "../rosterCsv";

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

const secondaryBtn: React.CSSProperties = {
  padding: "9px 14px",
  borderRadius: "8px",
  border: "1px solid var(--border-strong)",
  backgroundColor: "var(--surface)",
  color: "var(--text)",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: "0.88rem"
};

const auth = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`
});

export default function GradesPage() {
  const [payload, setPayload] = useState<GradesPayload | null>(null);
  const [csvMsg, setCsvMsg] = useState<string | null>(null);
  const role = getSession()?.role || "student";

  const load = () => {
    const token = localStorage.getItem("token");
    if (!token) { window.location.href = '/'; return; }

    fetch("http://localhost:4000/api/grades", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setPayload(data))
      .catch(err => console.error(err));
  };

  useEffect(() => { load(); }, []);

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

  const exportGradesCsv = () => {
    let csv: string;
    if (own) {
      csv = buildCsv(
        ["code", "description", "units", "midterm", "finals", "grade"],
        own.map(g => [g.code, g.description, g.units, g.midterm, g.finals, g.grade])
      );
    } else {
      csv = buildCsv(
        ["id", "student", "section", "program", "code", "description", "units", "midterm", "finals", "grade"],
        (students || []).flatMap(s =>
          s.grades.map(g => [s.id, s.name, s.section, s.program, g.code, g.description, g.units, g.midterm, g.finals, g.grade])
        )
      );
    }
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "scje-grades.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importGradesCsv = async (file: File) => {
    setCsvMsg(null);
    const text = await file.text();
    const { rows: mapped, errors } = mapGradesTable(text);
    let added = 0;
    let updated = 0;

    let roster: { id: number; name: string; email: string }[] = [];
    try {
      const data = await fetch("http://localhost:4000/api/admin/users", { headers: auth() }).then(r => r.json());
      if (Array.isArray(data)) roster = data;
    } catch {
      // no roster — name-only matching below
    }

    for (const r of mapped) {
      const target =
        (r.email ? roster.find(a => a.email.toLowerCase() === r.email!.toLowerCase()) : undefined) ||
        (r.id ? roster.find(a => String(a.id) === r.id) : undefined) ||
        (r.student ? roster.find(a => a.name.toLowerCase() === r.student!.toLowerCase()) : undefined);
      if (!target) {
        errors.push(`No account matches "${r.email || r.student || r.id}" (${r.code}).`);
        continue;
      }
      try {
        const detail = await fetch(`http://localhost:4000/api/admin/users/${target.id}`, { headers: auth() }).then(res => res.json());
        const list: GradeItem[] = detail?.grades || [];
        const idx = list.findIndex(g => g.code === r.code);
        const payload = {
          code: r.code,
          description: r.description,
          units: r.units,
          midterm: r.midterm,
          finals: r.finals,
          grade: r.grade
        };
        const res = await fetch(
          idx >= 0
            ? `http://localhost:4000/api/admin/users/${target.id}/grades/${idx}`
            : `http://localhost:4000/api/admin/users/${target.id}/grades`,
          { method: idx >= 0 ? "PUT" : "POST", headers: auth(), body: JSON.stringify(payload) }
        );
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          errors.push(`${target.name} ${r.code}: ${data.message || "could not save"}.`);
          continue;
        }
        if (idx >= 0) updated++;
        else added++;
      } catch {
        errors.push(`${r.code}: could not reach the server.`);
      }
    }

    const parts = [`Imported ${added + updated} row${added + updated === 1 ? "" : "s"}`];
    const bits: string[] = [];
    if (added) bits.push(`added ${added}`);
    if (updated) bits.push(`updated ${updated}`);
    if (bits.length) parts.push(bits.join(", "));
    if (errors.length > 0) parts.push(`skipped ${errors.length} (${errors.slice(0, 2).join(" / ")})`);
    setCsvMsg(parts.join(" — "));
    if (added + updated > 0) load();
  };

  return (
    <div className="app-container">
      <main className="main-content">
        <Navbar />
        <div className="dashboard-body">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <h2 style={{ color: "var(--heading)", margin: 0 }}>
              {own !== null ? "Achievements / Grades" : title}
            </h2>
            <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
              <button type="button" onClick={exportGradesCsv} disabled={!payload} style={secondaryBtn}>Export CSV</button>
              {role === "admin" && own === null && (
                <label style={{ ...secondaryBtn, display: "inline-flex", alignItems: "center" }}>
                  Import CSV
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    hidden
                    onChange={e => {
                      const file = e.target.files?.[0];
                      e.target.value = "";
                      if (file) importGradesCsv(file);
                    }}
                  />
                </label>
              )}
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
          </div>

          {csvMsg && (
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: "0 0 12px" }}>{csvMsg}</p>
          )}

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
