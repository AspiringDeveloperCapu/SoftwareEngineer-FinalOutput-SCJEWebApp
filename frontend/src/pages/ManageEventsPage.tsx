import React, { useEffect, useState } from "react";
import Drawer from "../components/Drawer";
import Navbar from "../components/Navbar";

interface EventItem {
  id: number;
  title: string;
  date: string;
  description: string;
  location: string;
  type: string;
}

const EMPTY = { title: "", date: "", description: "", location: "", type: "event" };

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`
});

export default function ManageEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [form, setForm] = useState<typeof EMPTY & { id?: number }>(EMPTY);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () =>
    fetch("http://localhost:4000/api/events")
      .then(res => res.json())
      .then(data => setEvents(data))
      .catch(err => console.error(err));

  useEffect(() => { load(); }, []);

  const startNew = () => { setForm(EMPTY); setEditing(true); setError(null); };
  const startEdit = (e: EventItem) => { setForm(e); setEditing(true); setError(null); };
  const cancel = () => { setForm(EMPTY); setEditing(false); setError(null); };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setError(null);
    const url = form.id ? `http://localhost:4000/api/events/${form.id}` : "http://localhost:4000/api/events";
    try {
      const res = await fetch(url, {
        method: form.id ? "PUT" : "POST",
        headers: authHeaders(),
        body: JSON.stringify(form)
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.message || "Could not save the event.");
        return;
      }
      await load();
      cancel();
    } catch {
      setError("Could not reach the server.");
    }
  };

  const remove = async (e: EventItem) => {
    if (!window.confirm(`Delete “${e.title}”?`)) return;
    const res = await fetch(`http://localhost:4000/api/events/${e.id}`, {
      method: "DELETE",
      headers: authHeaders()
    });
    if (res.ok) load();
  };

  const field = { padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--border-strong)", backgroundColor: "var(--surface)", color: "var(--text)", fontSize: "0.95rem" };

  return (
    <div className="app-container">
      <Drawer />
      <main className="main-content">
        <Navbar />
        <div className="dashboard-body">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", gap: "12px", flexWrap: "wrap" }}>
            <h2 style={{ color: "var(--heading)", margin: 0 }}>Manage Events</h2>
            {!editing && (
              <button className="login-btn" onClick={startNew} style={{ padding: "10px 18px" }}>+ New Event</button>
            )}
          </div>

          {editing && (
            <form onSubmit={submit} className="card" style={{ marginBottom: "24px", display: "grid", gap: "12px" }}>
              <h3 style={{ margin: 0 }}>{form.id ? "Edit event" : "New event"}</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <label style={{ display: "grid", gap: "4px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  Title
                  <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={field} />
                </label>
                <label style={{ display: "grid", gap: "4px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  Date
                  <input required type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} style={field} />
                </label>
                <label style={{ display: "grid", gap: "4px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  Location
                  <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} style={field} />
                </label>
                <label style={{ display: "grid", gap: "4px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  Type
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={field}>
                    <option value="seminar">seminar</option>
                    <option value="sports">sports</option>
                    <option value="academic">academic</option>
                    <option value="social">social</option>
                    <option value="event">event</option>
                  </select>
                </label>
              </div>
              <label style={{ display: "grid", gap: "4px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                Description
                <textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ ...field, resize: "vertical" }} />
              </label>

              {error && <p style={{ color: "var(--danger)", margin: 0, fontSize: "0.9rem" }}>{error}</p>}

              <div style={{ display: "flex", gap: "8px" }}>
                <button type="submit" className="login-btn" style={{ padding: "10px 18px" }}>
                  {form.id ? "Save changes" : "Create event"}
                </button>
                <button type="button" onClick={cancel} style={{ padding: "10px 18px", borderRadius: "8px", border: "1px solid var(--border-strong)", backgroundColor: "var(--surface)", color: "var(--text)", cursor: "pointer", fontWeight: 600 }}>
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="card" style={{ padding: 0 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border)", textAlign: "left" }}>
                  <th style={{ padding: "12px", color: "var(--text)", fontSize: "0.85rem" }}>Event</th>
                  <th style={{ padding: "12px", color: "var(--text)", fontSize: "0.85rem" }}>Date</th>
                  <th style={{ padding: "12px", color: "var(--text)", fontSize: "0.85rem" }}>Location</th>
                  <th style={{ padding: "12px", color: "var(--text)", fontSize: "0.85rem" }}>Type</th>
                  <th style={{ padding: "12px", color: "var(--text)", fontSize: "0.85rem", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map(e => (
                  <tr key={e.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "12px", fontWeight: 600, color: "var(--heading)" }}>{e.title}</td>
                    <td style={{ padding: "12px", color: "var(--text-dim)" }}>{e.date}</td>
                    <td style={{ padding: "12px", color: "var(--text-dim)" }}>{e.location}</td>
                    <td style={{ padding: "12px" }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, padding: "3px 10px", borderRadius: "99px", backgroundColor: "var(--surface-2)", color: "var(--text)" }}>
                        {e.type}
                      </span>
                    </td>
                    <td style={{ padding: "12px", textAlign: "right", whiteSpace: "nowrap" }}>
                      <button onClick={() => startEdit(e)} style={{ background: "none", border: "none", color: "var(--heading)", fontWeight: 700, cursor: "pointer", fontSize: "0.85rem" }}>
                        Edit
                      </button>
                      <button onClick={() => remove(e)} style={{ background: "none", border: "none", color: "var(--danger)", fontWeight: 700, cursor: "pointer", fontSize: "0.85rem", marginLeft: "12px" }}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {events.length === 0 && (
              <p style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)" }}>No events yet.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
