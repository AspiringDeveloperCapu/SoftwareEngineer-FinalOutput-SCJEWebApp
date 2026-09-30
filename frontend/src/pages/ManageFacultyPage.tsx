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

const EMPTY = { name: "", position: "", department: "SCJE", specialization: "", email: "" };

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`
});

export default function ManageFacultyPage() {
  const [faculty, setFaculty] = useState<FacultyMember[]>([]);
  const [form, setForm] = useState<typeof EMPTY & { id?: number }>(EMPTY);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () =>
    fetch(`${API_BASE}/api/faculty`)
      .then(res => res.json())
      .then(data => setFaculty(data))
      .catch(err => console.error(err));

  useEffect(() => { load(); }, []);

  const startNew = () => { setForm(EMPTY); setEditing(true); setError(null); };
  const startEdit = (f: FacultyMember) => { setForm(f); setEditing(true); setError(null); };
  const cancel = () => { setForm(EMPTY); setEditing(false); setError(null); };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setError(null);
    const url = form.id ? `${API_BASE}/api/faculty/${form.id}` : `${API_BASE}/api/faculty`;
    try {
      const res = await fetch(url, {
        method: form.id ? "PUT" : "POST",
        headers: authHeaders(),
        body: JSON.stringify(form)
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.message || "Could not save the faculty member.");
        return;
      }
      await load();
      cancel();
    } catch {
      setError("Could not reach the server.");
    }
  };

  const remove = async (f: FacultyMember) => {
    if (!window.confirm(`Delete “${f.name}”?`)) return;
    const res = await fetch(`${API_BASE}/api/faculty/${f.id}`, {
      method: "DELETE",
      headers: authHeaders()
    });
    if (res.ok) load();
  };

  const field = { padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--border-strong)", backgroundColor: "var(--surface)", color: "var(--text)", fontSize: "0.95rem" };

  return (
    <div className="app-container">
      <main className="main-content">
        <Navbar />
        <div className="dashboard-body">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", gap: "12px", flexWrap: "wrap" }}>
            <h2 style={{ color: "var(--heading)", margin: 0 }}>Manage Faculty</h2>
            {!editing && (
              <button className="login-btn" onClick={startNew} style={{ padding: "10px 18px" }}>+ Add Member</button>
            )}
          </div>

          {editing && (
            <form onSubmit={submit} className="card" style={{ marginBottom: "24px", display: "grid", gap: "12px" }}>
              <h3 style={{ margin: 0 }}>{form.id ? "Edit faculty member" : "New faculty member"}</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <label style={{ display: "grid", gap: "4px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  Name
                  <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={field} />
                </label>
                <label style={{ display: "grid", gap: "4px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  Position
                  <input value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} style={field} />
                </label>
                <label style={{ display: "grid", gap: "4px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  Department
                  <select value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} style={field}>
                    <option value="SCJE">SCJE</option>
                    <option value="ISM">ISM</option>
                  </select>
                </label>
                <label style={{ display: "grid", gap: "4px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  Email
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={field} />
                </label>
              </div>
              <label style={{ display: "grid", gap: "4px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                Specialization
                <input value={form.specialization} onChange={e => setForm({ ...form, specialization: e.target.value })} style={field} />
              </label>

              {error && <p style={{ color: "var(--danger)", margin: 0, fontSize: "0.9rem" }}>{error}</p>}

              <div style={{ display: "flex", gap: "8px" }}>
                <button type="submit" className="login-btn" style={{ padding: "10px 18px" }}>
                  {form.id ? "Save changes" : "Add member"}
                </button>
                <button type="button" onClick={cancel} style={{ padding: "10px 18px", borderRadius: "8px", border: "1px solid var(--border-strong)", backgroundColor: "var(--surface)", color: "var(--text)", cursor: "pointer", fontWeight: 600 }}>
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            {faculty.map(f => (
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
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <strong style={{ color: "var(--text)", fontSize: "1rem" }}>{f.name}</strong>
                    <p style={{ color: "var(--accent)", fontSize: "0.85rem", fontWeight: 600, margin: "2px 0" }}>{f.position}</p>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", margin: 0 }}>{f.specialization} · {f.department}</p>
                    <p style={{ color: "var(--heading)", fontSize: "0.8rem", margin: "4px 0 0 0" }}>{f.email}</p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <button onClick={() => startEdit(f)} style={{ background: "none", border: "none", color: "var(--heading)", fontWeight: 700, cursor: "pointer", fontSize: "0.85rem" }}>
                      Edit
                    </button>
                    <button onClick={() => remove(f)} style={{ background: "none", border: "none", color: "var(--danger)", fontWeight: 700, cursor: "pointer", fontSize: "0.85rem" }}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {faculty.length === 0 && (
            <div className="card" style={{ padding: "48px", textAlign: "center" }}>
              <p style={{ color: "var(--text-muted)" }}>No faculty members yet.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
