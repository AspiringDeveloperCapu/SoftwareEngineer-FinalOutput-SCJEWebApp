import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

interface Announcement {
  id: number;
  title: string;
  body: string;
  author: string;
  date: string;
  category: string;
  pinned: boolean;
}

const EMPTY = { title: "", body: "", category: "announcement", pinned: false };

const CATEGORIES = ["announcement", "academic", "reminder", "event"];

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

export default function ManageAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [form, setForm] = useState<typeof EMPTY & { id?: number }>(EMPTY);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () =>
    fetch("http://localhost:4000/api/announcements")
      .then(res => res.json())
      .then(data => setAnnouncements(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));

  useEffect(() => { load(); }, []);

  const startNew = () => { setForm(EMPTY); setEditing(true); setError(null); };
  const startEdit = (a: Announcement) => {
    setForm({ id: a.id, title: a.title, body: a.body, category: a.category, pinned: a.pinned });
    setEditing(true);
    setError(null);
  };
  const cancel = () => { setForm(EMPTY); setEditing(false); setError(null); };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setError(null);
    const url = form.id
      ? `http://localhost:4000/api/announcements/${form.id}`
      : "http://localhost:4000/api/announcements";
    try {
      const res = await fetch(url, {
        method: form.id ? "PUT" : "POST",
        headers: authHeaders(),
        body: JSON.stringify(form)
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.message || "Could not save the announcement.");
        return;
      }
      await load();
      cancel();
    } catch {
      setError("Could not reach the server.");
    }
  };

  const togglePin = async (a: Announcement) => {
    const res = await fetch(`http://localhost:4000/api/announcements/${a.id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ pinned: !a.pinned })
    });
    if (res.ok) await load();
  };

  const remove = async (a: Announcement) => {
    if (!window.confirm(`Delete “${a.title}”?`)) return;
    const res = await fetch(`http://localhost:4000/api/announcements/${a.id}`, {
      method: "DELETE",
      headers: authHeaders()
    });
    if (res.ok) await load();
  };

  return (
    <div className="app-container">
      <main className="main-content">
        <Navbar />
        <div className="dashboard-body">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", gap: "12px", flexWrap: "wrap" }}>
            <div>
              <h2 style={{ color: "var(--heading)", margin: 0 }}>Manage Announcements</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: "4px 0 0" }}>
                Published to the Events page and the dashboard hero. Only one can be pinned.
              </p>
            </div>
            {!editing && (
              <button className="login-btn" onClick={startNew} style={{ padding: "10px 18px" }}>+ New Announcement</button>
            )}
          </div>

          {editing && (
            <form onSubmit={submit} className="card" style={{ marginBottom: "24px", display: "grid", gap: "12px" }}>
              <h3 style={{ margin: 0 }}>{form.id ? "Edit announcement" : "New announcement"}</h3>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "12px" }}>
                <label style={{ display: "grid", gap: "4px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  Title
                  <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={field} />
                </label>
                <label style={{ display: "grid", gap: "4px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  Category
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={field}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </label>
              </div>
              <label style={{ display: "grid", gap: "4px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                Body
                <textarea required rows={4} value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} style={{ ...field, resize: "vertical" }} />
              </label>
              <label style={{ display: "flex", gap: "8px", alignItems: "center", fontSize: "0.9rem", color: "var(--text)", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={form.pinned}
                  onChange={e => setForm({ ...form, pinned: e.target.checked })}
                  style={{ width: "18px", height: "18px", accentColor: "var(--brand)" }}
                />
                Pin to the dashboard hero (replaces the current pin)
              </label>

              {error && <p style={{ color: "var(--danger)", margin: 0, fontSize: "0.9rem" }}>{error}</p>}

              <div style={{ display: "flex", gap: "8px" }}>
                <button type="submit" className="login-btn" style={{ padding: "10px 18px" }}>
                  {form.id ? "Save changes" : "Publish"}
                </button>
                <button type="button" onClick={cancel} style={{ padding: "10px 18px", borderRadius: "8px", border: "1px solid var(--border-strong)", backgroundColor: "var(--surface)", color: "var(--text)", cursor: "pointer", fontWeight: 600 }}>
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {announcements.map(a => (
              <section key={a.id} className="card" style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                    <strong style={{ color: "var(--heading)", fontSize: "1.05rem" }}>{a.title}</strong>
                    <span style={{ fontSize: "0.72rem", fontWeight: 700, padding: "3px 10px", borderRadius: "99px", backgroundColor: "var(--surface-2)", color: "var(--text)", textTransform: "uppercase" }}>
                      {a.category}
                    </span>
                    {a.pinned && (
                      <span style={{ fontSize: "0.72rem", fontWeight: 700, padding: "3px 10px", borderRadius: "99px", backgroundColor: "var(--gold)", color: "var(--on-gold)" }}>
                        📌 PINNED
                      </span>
                    )}
                  </div>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: "8px 0 0", lineHeight: 1.5 }}>{a.body}</p>
                  <p style={{ color: "var(--text-faint)", fontSize: "0.78rem", margin: "8px 0 0" }}>
                    {a.date} · {a.author}
                  </p>
                </div>
                <div style={{ display: "flex", gap: "10px", flexShrink: 0 }}>
                  <button
                    onClick={() => togglePin(a)}
                    title={a.pinned ? "Unpin" : "Pin to dashboard"}
                    style={{
                      padding: "6px 12px", borderRadius: "8px",
                      border: a.pinned ? "none" : "1px solid var(--border-strong)",
                      backgroundColor: a.pinned ? "var(--gold)" : "var(--surface)",
                      color: a.pinned ? "var(--on-gold)" : "var(--text)",
                      cursor: "pointer", fontWeight: 700, fontSize: "0.85rem"
                    }}
                  >
                    {a.pinned ? "Pinned" : "Pin"}
                  </button>
                  <button onClick={() => startEdit(a)} style={{ background: "none", border: "none", color: "var(--heading)", fontWeight: 700, cursor: "pointer", fontSize: "0.85rem" }}>
                    Edit
                  </button>
                  <button onClick={() => remove(a)} style={{ background: "none", border: "none", color: "var(--danger)", fontWeight: 700, cursor: "pointer", fontSize: "0.85rem" }}>
                    Delete
                  </button>
                </div>
              </section>
            ))}
            {announcements.length === 0 && (
              <p style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)" }} className="card">
                No announcements yet.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
