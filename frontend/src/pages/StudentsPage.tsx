import React, { useEffect, useState } from "react";
import { ROLE_STYLE } from "../components/RoleBadge";
import Navbar from "../components/Navbar";

interface Account {
  id: number;
  name: string;
  email: string;
  role: "student" | "instructor" | "admin";
  department: string;
  course: string;
  section: string;
  year: string;
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

interface AccountDetail {
  student: Account;
  grades: GradeItem[];
  schedule: ScheduleItem[];
}

interface AccountFormState {
  id?: number;
  name: string;
  email: string;
  password: string;
  role: Account["role"];
  department: string;
  course: string;
  section: string;
  year: string;
}

const EMPTY_ACCOUNT: AccountFormState = {
  name: "",
  email: "",
  password: "",
  role: "student",
  department: "SCJE",
  course: "",
  section: "",
  year: ""
};

const EMPTY_GRADE = { code: "", description: "", units: 3, midterm: 0, finals: 0, grade: 2.0 };
const EMPTY_CLASS = { day: "Monday", time: "", subject: "", room: "", instructor: "" };

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const ROLE_LABEL: Record<Account["role"], string> = {
  student: "Student",
  instructor: "Instructor",
  admin: "Administrator"
};

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`
});

const field: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: "8px",
  border: "1px solid var(--border-strong)",
  backgroundColor: "var(--surface)",
  color: "var(--text)",
  fontSize: "0.95rem"
};

const label: React.CSSProperties = {
  display: "grid",
  gap: "4px",
  fontSize: "0.85rem",
  color: "var(--text-muted)"
};

const RoleBadge = ({ role }: { role: Account["role"] }) => (
  <span
    style={{
      display: "inline-block",
      padding: "2px 10px",
      borderRadius: "99px",
      fontSize: "0.7rem",
      fontWeight: 800,
      letterSpacing: "0.5px",
      backgroundColor: (ROLE_STYLE[role] || ROLE_STYLE.student).background,
      border: "1px solid var(--border-strong)",
      color: (ROLE_STYLE[role] || ROLE_STYLE.student).color
    }}
  >
    {ROLE_LABEL[role].toUpperCase()}
  </span>
);

export default function StudentsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"All" | Account["role"]>("All");
  const [program, setProgram] = useState("All");
  const [detail, setDetail] = useState<AccountDetail | null>(null);
  const [accountForm, setAccountForm] = useState<AccountFormState | null>(null);
  const [gradeForm, setGradeForm] = useState<typeof EMPTY_GRADE & { index?: number } | null>(null);
  const [classForm, setClassForm] = useState<typeof EMPTY_CLASS & { index?: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadAccounts = () =>
    fetch("http://localhost:4000/api/admin/users", { headers: authHeaders() })
      .then(res => res.json())
      .then(data => setAccounts(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));

  const loadDetail = (id: number) =>
    fetch(`http://localhost:4000/api/admin/users/${id}`, { headers: authHeaders() })
      .then(res => res.json())
      .then(data => setDetail(data))
      .catch(err => console.error(err));

  useEffect(() => { loadAccounts(); }, []);

  const adminTotal = accounts.filter(a => a.role === "admin").length;
  // The demo must never delete or demote its own last way into the back office.
  const isLastAdmin = (acc?: Account | null) => !!acc && acc.role === "admin" && adminTotal <= 1;

  const programs = ["All", ...Array.from(new Set(accounts.filter(a => a.course).map(a => a.course)))];
  const filtered = accounts.filter(a => {
    const q = query.toLowerCase();
    const matchesQuery =
      a.name.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      a.section.toLowerCase().includes(q);
    const matchesRole = roleFilter === "All" || a.role === roleFilter;
    const matchesProgram = program === "All" || a.course === program;
    return matchesQuery && matchesRole && matchesProgram;
  });

  const openDetail = (id: number) => {
    setError(null);
    setAccountForm(null);
    setGradeForm(null);
    setClassForm(null);
    loadDetail(id);
  };

  const saveAccount = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!accountForm) return;
    setError(null);
    const url = accountForm.id
      ? `http://localhost:4000/api/admin/users/${accountForm.id}`
      : "http://localhost:4000/api/admin/users";
    try {
      const res = await fetch(url, {
        method: accountForm.id ? "PUT" : "POST",
        headers: authHeaders(),
        body: JSON.stringify(accountForm)
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.message || "Could not save the account.");
        return;
      }
      setAccountForm(null);
      await loadAccounts();
      if (detail) await loadDetail(detail.student.id);
    } catch {
      setError("Could not reach the server.");
    }
  };

  const removeAccount = async (acc: Account) => {
    if (!window.confirm(`Delete the account for “${acc.name}”? This removes their grades and schedule too.`)) return;
    setError(null);
    const res = await fetch(`http://localhost:4000/api/admin/users/${acc.id}`, {
      method: "DELETE",
      headers: authHeaders()
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.message || "Could not delete the account.");
      return;
    }
    setDetail(null);
    await loadAccounts();
  };

  const saveGrade = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!gradeForm || !detail) return;
    setError(null);
    const base = `http://localhost:4000/api/admin/users/${detail.student.id}/grades`;
    const url = gradeForm.index === undefined ? base : `${base}/${gradeForm.index}`;
    try {
      const res = await fetch(url, {
        method: gradeForm.index === undefined ? "POST" : "PUT",
        headers: authHeaders(),
        body: JSON.stringify(gradeForm)
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.message || "Could not save the grade.");
        return;
      }
      setGradeForm(null);
      await loadDetail(detail.student.id);
    } catch {
      setError("Could not reach the server.");
    }
  };

  const removeGrade = async (index: number) => {
    if (!detail) return;
    if (!window.confirm("Remove this grade row?")) return;
    const res = await fetch(`http://localhost:4000/api/admin/users/${detail.student.id}/grades/${index}`, {
      method: "DELETE",
      headers: authHeaders()
    });
    if (res.ok) await loadDetail(detail.student.id);
  };

  const saveClass = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!classForm || !detail) return;
    setError(null);
    const base = `http://localhost:4000/api/admin/users/${detail.student.id}/schedule`;
    const url = classForm.index === undefined ? base : `${base}/${classForm.index}`;
    try {
      const res = await fetch(url, {
        method: classForm.index === undefined ? "POST" : "PUT",
        headers: authHeaders(),
        body: JSON.stringify(classForm)
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.message || "Could not save the class.");
        return;
      }
      setClassForm(null);
      await loadDetail(detail.student.id);
    } catch {
      setError("Could not reach the server.");
    }
  };

  const removeClass = async (index: number) => {
    if (!detail) return;
    if (!window.confirm("Remove this class from the schedule?")) return;
    const res = await fetch(`http://localhost:4000/api/admin/users/${detail.student.id}/schedule/${index}`, {
      method: "DELETE",
      headers: authHeaders()
    });
    if (res.ok) await loadDetail(detail.student.id);
  };

  const gpaOf = (grades: GradeItem[]) =>
    grades.length > 0 ? (grades.reduce((s, g) => s + g.grade, 0) / grades.length).toFixed(2) : "—";

  const chipStyle = (active: boolean): React.CSSProperties => ({
    padding: "8px 16px",
    borderRadius: "99px",
    border: active ? "none" : "1px solid var(--border-strong)",
    backgroundColor: active ? "var(--brand)" : "var(--surface)",
    color: active ? "var(--on-brand)" : "var(--text)",
    fontWeight: 600,
    fontSize: "0.85rem",
    cursor: "pointer"
  });

  return (
    <div className="app-container">
      <main className="main-content">
        <Navbar />
        <div className="dashboard-body">
          {!detail ? (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
                <h2 style={{ color: "var(--heading)", margin: 0 }}>Accounts</h2>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                    {filtered.length} of {accounts.length} accounts
                  </span>
                  {!accountForm && (
                    <button
                      className="login-btn"
                      style={{ padding: "10px 18px" }}
                      onClick={() => { setAccountForm({ ...EMPTY_ACCOUNT }); setError(null); }}
                    >
                      + New Account
                    </button>
                  )}
                </div>
              </div>

              {accountForm && (
                <form onSubmit={saveAccount} className="card" style={{ marginBottom: "24px", display: "grid", gap: "12px" }}>
                  <h3 style={{ margin: 0 }}>{accountForm.id ? `Edit ${accountForm.name}` : "New account"}</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <label style={label}>
                      Full name
                      <input required value={accountForm.name} onChange={e => setAccountForm({ ...accountForm, name: e.target.value })} style={field} />
                    </label>
                    <label style={label}>
                      Email
                      <input required type="email" value={accountForm.email} onChange={e => setAccountForm({ ...accountForm, email: e.target.value })} style={field} />
                    </label>
                    <label style={label}>
                      {accountForm.id ? "New password (leave blank to keep)" : "Password"}
                      <input
                        required={!accountForm.id}
                        type="password"
                        value={accountForm.password}
                        onChange={e => setAccountForm({ ...accountForm, password: e.target.value })}
                        style={field}
                      />
                    </label>
                    <label style={label}>
                      Role
                      <select
                        value={accountForm.role}
                        disabled={accountForm.id !== undefined && isLastAdmin(accounts.find(a => a.id === accountForm.id))}
                        onChange={e => setAccountForm({ ...accountForm, role: e.target.value as Account["role"] })}
                        style={{ ...field, opacity: accountForm.id !== undefined && isLastAdmin(accounts.find(a => a.id === accountForm.id)) ? 0.6 : 1 }}
                      >
                        <option value="student">Student</option>
                        <option value="instructor">Instructor</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </label>
                    <label style={label}>
                      Department
                      <select value={accountForm.department} onChange={e => setAccountForm({ ...accountForm, department: e.target.value })} style={field}>
                        <option value="SCJE">SCJE</option>
                        <option value="ISM">ISM</option>
                      </select>
                    </label>
                    <label style={label}>
                      Program
                      <select
                        value={accountForm.course}
                        disabled={accountForm.role !== "student"}
                        onChange={e => setAccountForm({ ...accountForm, course: e.target.value })}
                        style={field}
                      >
                        <option value="">{accountForm.role !== "student" ? "— staff —" : "Select a program"}</option>
                        <option value="BS Criminology">BS Criminology</option>
                        <option value="BS Industrial Security Management">BS Industrial Security Management</option>
                      </select>
                    </label>
                    <label style={label}>
                      Section
                      <input
                        value={accountForm.section}
                        disabled={accountForm.role !== "student"}
                        onChange={e => setAccountForm({ ...accountForm, section: e.target.value })}
                        style={field}
                      />
                    </label>
                    <label style={label}>
                      Year
                      <input
                        value={accountForm.year}
                        disabled={accountForm.role !== "student"}
                        onChange={e => setAccountForm({ ...accountForm, year: e.target.value })}
                        style={field}
                      />
                    </label>
                  </div>

                  {error && <p style={{ color: "var(--danger)", margin: 0, fontSize: "0.9rem" }}>{error}</p>}

                  <div style={{ display: "flex", gap: "8px" }}>
                    <button type="submit" className="login-btn" style={{ padding: "10px 18px" }}>
                      {accountForm.id ? "Save changes" : "Create account"}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setAccountForm(null); setError(null); }}
                      style={{ padding: "10px 18px", borderRadius: "8px", border: "1px solid var(--border-strong)", backgroundColor: "var(--surface)", color: "var(--text)", cursor: "pointer", fontWeight: 600 }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <input
                type="search"
                placeholder="Search name, email or section…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                style={{ width: "100%", padding: "12px 16px", borderRadius: "10px", border: "1px solid var(--border-strong)", backgroundColor: "var(--surface)", color: "var(--text)", fontSize: "0.95rem", marginBottom: "16px" }}
              />

              <div style={{ display: "flex", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
                {(["All", "student", "instructor", "admin"] as const).map(r => (
                  <button key={r} onClick={() => setRoleFilter(r)} style={chipStyle(roleFilter === r)}>
                    {r === "All" ? "All roles" : ROLE_LABEL[r]}
                  </button>
                ))}
              </div>

              <div style={{ display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap" }}>
                {programs.map(p => (
                  <button key={p} onClick={() => setProgram(p)} style={chipStyle(program === p)}>
                    {p === "All" ? "All programs" : p}
                  </button>
                ))}
              </div>

              <div className="card" style={{ padding: 0 }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid var(--border)", textAlign: "left" }}>
                      <th style={{ padding: "12px", color: "var(--text)", fontSize: "0.85rem" }}>Name</th>
                      <th style={{ padding: "12px", color: "var(--text)", fontSize: "0.85rem" }}>Role</th>
                      <th style={{ padding: "12px", color: "var(--text)", fontSize: "0.85rem" }}>Program</th>
                      <th style={{ padding: "12px", color: "var(--text)", fontSize: "0.85rem" }}>Section</th>
                      <th style={{ padding: "12px", color: "var(--text)", fontSize: "0.85rem" }}>Year</th>
                      <th style={{ padding: "12px", color: "var(--text)", fontSize: "0.85rem" }}>Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(a => (
                      <tr
                        key={a.id}
                        onClick={() => openDetail(a.id)}
                        style={{ borderBottom: "1px solid var(--border)", cursor: "pointer" }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = "var(--surface-alt)")}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                      >
                        <td style={{ padding: "12px", fontWeight: 600, color: "var(--heading)" }}>{a.name}</td>
                        <td style={{ padding: "12px" }}><RoleBadge role={a.role} /></td>
                        <td style={{ padding: "12px", color: "var(--text-dim)" }}>{a.course || "—"}</td>
                        <td style={{ padding: "12px", color: "var(--text-dim)" }}>{a.section || "—"}</td>
                        <td style={{ padding: "12px", color: "var(--text-dim)" }}>{a.year || "—"}</td>
                        <td style={{ padding: "12px", color: "var(--text-muted)", fontSize: "0.85rem" }}>{a.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filtered.length === 0 && (
                  <p style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)" }}>
                    No account matches “{query}”.
                  </p>
                )}
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => { setDetail(null); setError(null); }}
                style={{ background: "none", border: "none", color: "var(--heading)", fontWeight: 700, cursor: "pointer", fontSize: "0.95rem", marginBottom: "16px", padding: 0 }}
              >
                ← Back to accounts
              </button>

              {error && <p style={{ color: "var(--danger)", margin: "0 0 16px", fontSize: "0.9rem" }}>{error}</p>}

              <div className="card" style={{ marginBottom: "24px", display: "flex", gap: "20px", alignItems: "center", flexWrap: "wrap" }}>
                <div style={{
                  width: "72px", height: "72px", borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--brand), var(--accent-solid))",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "white", fontWeight: 800, fontSize: "1.6rem", flexShrink: 0
                }}>
                  {detail.student.name.charAt(0)}
                </div>
                <div style={{ minWidth: "220px" }}>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                    <h3 style={{ margin: 0, color: "var(--heading)" }}>{detail.student.name}</h3>
                    <RoleBadge role={detail.student.role} />
                  </div>
                  <p style={{ margin: "4px 0 0", color: "var(--accent)", fontWeight: 600, fontSize: "0.9rem" }}>
                    {detail.student.role === "student"
                      ? `${detail.student.course} · Section ${detail.student.section} · Year ${detail.student.year}`
                      : `${detail.student.department} · ${ROLE_LABEL[detail.student.role]}`}
                  </p>
                  <p style={{ margin: "4px 0 0", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                    {detail.student.email}
                    {detail.student.gender ? ` · ${detail.student.gender}` : ""}
                    {detail.student.birthday ? ` · Born ${detail.student.birthday}` : ""}
                  </p>
                </div>
                <div style={{ marginLeft: "auto", display: "flex", gap: "12px", alignItems: "center" }}>
                  {detail.student.role === "student" && (
                    <div style={{ textAlign: "center" }}>
                      <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-muted)" }}>GPA</p>
                      <strong style={{ fontSize: "1.4rem", color: "var(--heading)" }}>{gpaOf(detail.grades)}</strong>
                    </div>
                  )}
                  <button
                    onClick={() => { setAccountForm({
                      id: detail.student.id,
                      name: detail.student.name,
                      email: detail.student.email,
                      password: "",
                      role: detail.student.role,
                      department: detail.student.department,
                      course: detail.student.course,
                      section: detail.student.section,
                      year: detail.student.year
                    }); setError(null); }}
                    style={{ padding: "10px 16px", borderRadius: "8px", border: "1px solid var(--border-strong)", backgroundColor: "var(--surface)", color: "var(--text)", cursor: "pointer", fontWeight: 600 }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => removeAccount(detail.student)}
                    disabled={isLastAdmin(detail.student)}
                    title={isLastAdmin(detail.student) ? "The last administrator cannot be deleted." : undefined}
                    style={{
                      padding: "10px 16px", borderRadius: "8px",
                      border: "1px solid var(--danger)",
                      backgroundColor: "transparent",
                      color: "var(--danger)",
                      cursor: isLastAdmin(detail.student) ? "not-allowed" : "pointer",
                      fontWeight: 600,
                      opacity: isLastAdmin(detail.student) ? 0.5 : 1
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {accountForm && accountForm.id === detail.student.id && (
                <form onSubmit={saveAccount} className="card" style={{ marginBottom: "24px", display: "grid", gap: "12px" }}>
                  <h3 style={{ margin: 0 }}>Edit account</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <label style={label}>
                      Full name
                      <input required value={accountForm.name} onChange={e => setAccountForm({ ...accountForm, name: e.target.value })} style={field} />
                    </label>
                    <label style={label}>
                      Email
                      <input required type="email" value={accountForm.email} onChange={e => setAccountForm({ ...accountForm, email: e.target.value })} style={field} />
                    </label>
                    <label style={label}>
                      New password (leave blank to keep)
                      <input type="password" value={accountForm.password} onChange={e => setAccountForm({ ...accountForm, password: e.target.value })} style={field} />
                    </label>
                    <label style={label}>
                      Role
                      <select
                        value={accountForm.role}
                        disabled={isLastAdmin(detail.student)}
                        onChange={e => setAccountForm({ ...accountForm, role: e.target.value as Account["role"] })}
                        style={field}
                      >
                        <option value="student">Student</option>
                        <option value="instructor">Instructor</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </label>
                    <label style={label}>
                      Department
                      <select value={accountForm.department} onChange={e => setAccountForm({ ...accountForm, department: e.target.value })} style={field}>
                        <option value="SCJE">SCJE</option>
                        <option value="ISM">ISM</option>
                      </select>
                    </label>
                    <label style={label}>
                      Program
                      <select
                        value={accountForm.course}
                        disabled={accountForm.role !== "student"}
                        onChange={e => setAccountForm({ ...accountForm, course: e.target.value })}
                        style={field}
                      >
                        <option value="">{accountForm.role !== "student" ? "— staff —" : "Select a program"}</option>
                        <option value="BS Criminology">BS Criminology</option>
                        <option value="BS Industrial Security Management">BS Industrial Security Management</option>
                      </select>
                    </label>
                    <label style={label}>
                      Section
                      <input value={accountForm.section} disabled={accountForm.role !== "student"} onChange={e => setAccountForm({ ...accountForm, section: e.target.value })} style={field} />
                    </label>
                    <label style={label}>
                      Year
                      <input value={accountForm.year} disabled={accountForm.role !== "student"} onChange={e => setAccountForm({ ...accountForm, year: e.target.value })} style={field} />
                    </label>
                  </div>
                  {isLastAdmin(detail.student) && (
                    <p style={{ color: "var(--gold)", margin: 0, fontSize: "0.85rem" }}>
                      This is the last administrator — the role stays Administrator so the back office stays reachable.
                    </p>
                  )}
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button type="submit" className="login-btn" style={{ padding: "10px 18px" }}>Save changes</button>
                    <button type="button" onClick={() => setAccountForm(null)} style={{ padding: "10px 18px", borderRadius: "8px", border: "1px solid var(--border-strong)", backgroundColor: "var(--surface)", color: "var(--text)", cursor: "pointer", fontWeight: 600 }}>
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {detail.student.role === "student" ? (
                <div className="content-grid">
                  <section className="card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h3>Grades</h3>
                      {!gradeForm && (
                        <button
                          onClick={() => { setGradeForm({ ...EMPTY_GRADE }); setError(null); }}
                          style={{ padding: "6px 14px", borderRadius: "8px", border: "1px solid var(--border-strong)", backgroundColor: "var(--surface)", color: "var(--text)", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem" }}
                        >
                          + Add row
                        </button>
                      )}
                    </div>

                    {gradeForm && (
                      <form onSubmit={saveGrade} style={{ display: "grid", gap: "8px", margin: "12px 0", padding: "12px", backgroundColor: "var(--surface-alt)", borderRadius: "8px" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "8px" }}>
                          <label style={label}>
                            Code
                            <input required value={gradeForm.code} onChange={e => setGradeForm({ ...gradeForm, code: e.target.value })} style={field} />
                          </label>
                          <label style={label}>
                            Description
                            <input required value={gradeForm.description} onChange={e => setGradeForm({ ...gradeForm, description: e.target.value })} style={field} />
                          </label>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                          <label style={label}>
                            Units
                            <input required type="number" min="0" value={gradeForm.units} onChange={e => setGradeForm({ ...gradeForm, units: Number(e.target.value) })} style={field} />
                          </label>
                          <label style={label}>
                            Midterm
                            <input required type="number" min="0" max="100" value={gradeForm.midterm} onChange={e => setGradeForm({ ...gradeForm, midterm: Number(e.target.value) })} style={field} />
                          </label>
                          <label style={label}>
                            Finals
                            <input required type="number" min="0" max="100" value={gradeForm.finals} onChange={e => setGradeForm({ ...gradeForm, finals: Number(e.target.value) })} style={field} />
                          </label>
                          <label style={label}>
                            Grade
                            <input required type="number" step="0.25" min="1" max="5" value={gradeForm.grade} onChange={e => setGradeForm({ ...gradeForm, grade: Number(e.target.value) })} style={field} />
                          </label>
                        </div>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button type="submit" className="login-btn" style={{ padding: "8px 16px", fontSize: "0.9rem" }}>
                            {gradeForm.index === undefined ? "Add grade" : "Save row"}
                          </button>
                          <button type="button" onClick={() => setGradeForm(null)} style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid var(--border-strong)", backgroundColor: "var(--surface)", color: "var(--text)", cursor: "pointer", fontWeight: 600 }}>
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}

                    {detail.grades.length > 0 ? (
                      <ul style={{ listStyle: "none", padding: 0, marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                        {detail.grades.map((g, i) => (
                          <li key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", padding: "10px 12px", backgroundColor: "var(--surface-alt)", borderRadius: "8px" }}>
                            <span style={{ minWidth: 0 }}>
                              <strong style={{ color: "var(--heading)" }}>{g.code}</strong>
                              <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginLeft: "8px" }}>{g.description}</span>
                              <span style={{ color: "var(--text-faint)", fontSize: "0.75rem", display: "block", marginTop: "2px" }}>
                                {g.units} units · Mid {g.midterm} · Final {g.finals}
                              </span>
                            </span>
                            <span style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
                              <strong style={{ color: g.grade <= 1.5 ? "var(--success)" : "var(--gold)" }}>{g.grade.toFixed(2)}</strong>
                              <button
                                onClick={() => setGradeForm({ ...g, index: i })}
                                style={{ background: "none", border: "none", color: "var(--heading)", fontWeight: 700, cursor: "pointer", fontSize: "0.8rem", padding: 0 }}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => removeGrade(i)}
                                style={{ background: "none", border: "none", color: "var(--danger)", fontWeight: 700, cursor: "pointer", fontSize: "0.8rem", padding: 0 }}
                              >
                                Delete
                              </button>
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p style={{ color: "var(--text-muted)", marginTop: "12px" }}>No grades recorded yet.</p>
                    )}
                  </section>

                  <section className="card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h3>Schedule</h3>
                      {!classForm && (
                        <button
                          onClick={() => { setClassForm({ ...EMPTY_CLASS }); setError(null); }}
                          style={{ padding: "6px 14px", borderRadius: "8px", border: "1px solid var(--border-strong)", backgroundColor: "var(--surface)", color: "var(--text)", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem" }}
                        >
                          + Add class
                        </button>
                      )}
                    </div>

                    {classForm && (
                      <form onSubmit={saveClass} style={{ display: "grid", gap: "8px", margin: "12px 0", padding: "12px", backgroundColor: "var(--surface-alt)", borderRadius: "8px" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                          <label style={label}>
                            Day
                            <select value={classForm.day} onChange={e => setClassForm({ ...classForm, day: e.target.value })} style={field}>
                              {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                          </label>
                          <label style={label}>
                            Time
                            <input required placeholder="8:00 AM - 9:30 AM" value={classForm.time} onChange={e => setClassForm({ ...classForm, time: e.target.value })} style={field} />
                          </label>
                          <label style={label}>
                            Subject
                            <input required value={classForm.subject} onChange={e => setClassForm({ ...classForm, subject: e.target.value })} style={field} />
                          </label>
                          <label style={label}>
                            Room
                            <input value={classForm.room} onChange={e => setClassForm({ ...classForm, room: e.target.value })} style={field} />
                          </label>
                        </div>
                        <label style={label}>
                          Instructor
                          <input value={classForm.instructor} onChange={e => setClassForm({ ...classForm, instructor: e.target.value })} style={field} />
                        </label>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button type="submit" className="login-btn" style={{ padding: "8px 16px", fontSize: "0.9rem" }}>
                            {classForm.index === undefined ? "Add class" : "Save class"}
                          </button>
                          <button type="button" onClick={() => setClassForm(null)} style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid var(--border-strong)", backgroundColor: "var(--surface)", color: "var(--text)", cursor: "pointer", fontWeight: 600 }}>
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}

                    {detail.schedule.length > 0 ? (
                      <ul style={{ listStyle: "none", padding: 0, marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                        {detail.schedule.map((c, i) => (
                          <li key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", padding: "10px 12px", backgroundColor: "var(--surface-alt)", borderRadius: "8px" }}>
                            <span style={{ minWidth: 0 }}>
                              <strong style={{ color: "var(--heading)" }}>{c.subject}</strong>
                              <span style={{ color: "var(--text-faint)", fontSize: "0.8rem", marginLeft: "8px" }}>{c.day}</span>
                              <p style={{ margin: "4px 0 0", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                                {c.time} · {c.room}{c.instructor ? ` · ${c.instructor}` : ""}
                              </p>
                            </span>
                            <span style={{ display: "flex", gap: "10px", flexShrink: 0 }}>
                              <button
                                onClick={() => setClassForm({ ...c, index: i })}
                                style={{ background: "none", border: "none", color: "var(--heading)", fontWeight: 700, cursor: "pointer", fontSize: "0.8rem", padding: 0 }}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => removeClass(i)}
                                style={{ background: "none", border: "none", color: "var(--danger)", fontWeight: 700, cursor: "pointer", fontSize: "0.8rem", padding: 0 }}
                              >
                                Delete
                              </button>
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p style={{ color: "var(--text-muted)", marginTop: "12px" }}>No schedule on file.</p>
                    )}
                  </section>
                </div>
              ) : (
                <section className="card">
                  <h3>Staff record</h3>
                  <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>
                    Grades and schedules belong to student accounts. Use Edit to change this account's role,
                    password or department.
                  </p>
                </section>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
