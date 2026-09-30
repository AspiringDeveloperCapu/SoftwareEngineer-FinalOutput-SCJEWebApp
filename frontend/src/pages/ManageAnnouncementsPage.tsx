import { API_BASE } from "../api";
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import ItemImage from "../components/ItemImage";
import { fileToImageSrc, isImageUrl } from "../image";
import { formatWhen } from "../format";

interface Announcement {
  id: number;
  title: string;
  body: string;
  author: string;
  date: string;
  time?: string;
  endTime?: string;
  category: string;
  pinned: boolean;
  image?: string;
}

const EMPTY = { title: "", body: "", category: "announcement", pinned: false, time: "", endTime: "", image: "" };

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
  const [urlInput, setUrlInput] = useState("");
  const [imageError, setImageError] = useState<string | null>(null);

  const load = () =>
    fetch(`${API_BASE}/api/announcements`)
      .then(res => res.json())
      .then(data => setAnnouncements(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));

  useEffect(() => { load(); }, []);

  const startNew = () => { setForm(EMPTY); setUrlInput(""); setImageError(null); setEditing(true); setError(null); };
  const startEdit = (a: Announcement) => {
    setForm({
      id: a.id, title: a.title, body: a.body, category: a.category, pinned: a.pinned,
      time: a.time || "", endTime: a.endTime || "", image: a.image || ""
    });
    setUrlInput(a.image && !a.image.startsWith("data:") ? a.image : "");
    setImageError(null);
    setEditing(true);
    setError(null);
  };
  const cancel = () => { setForm(EMPTY); setUrlInput(""); setImageError(null); setEditing(false); setError(null); };

  const pickFile = async (file: File | undefined) => {
    if (!file) return;
    setImageError(null);
    try {
      const src = await fileToImageSrc(file);
      setUrlInput("");
      setForm(prev => ({ ...prev, image: src }));
    } catch (err) {
      setImageError(err instanceof Error ? err.message : "Could not read that image.");
    }
  };

  const changeUrl = (value: string) => {
    setUrlInput(value);
    const trimmed = value.trim();
    if (trimmed === "") {
      setForm(prev => ({ ...prev, image: "" }));
      setImageError(null);
    } else if (isImageUrl(trimmed)) {
      setForm(prev => ({ ...prev, image: trimmed }));
      setImageError(null);
    } else {
      setImageError("Link must be an image URL (https://…) or will be rejected on save.");
    }
  };

  const removeImage = () => { setForm(prev => ({ ...prev, image: "" })); setUrlInput(""); setImageError(null); };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setError(null);
    if (urlInput.trim() !== "" && !isImageUrl(urlInput.trim())) {
      setImageError("The picture link is not a valid image URL.");
      return;
    }
    const url = form.id
      ? `${API_BASE}/api/announcements/${form.id}`
      : `${API_BASE}/api/announcements`;
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
    const res = await fetch(`${API_BASE}/api/announcements/${a.id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ pinned: !a.pinned })
    });
    if (res.ok) await load();
  };

  const remove = async (a: Announcement) => {
    if (!window.confirm(`Delete “${a.title}”?`)) return;
    const res = await fetch(`${API_BASE}/api/announcements/${a.id}`, {
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
                Published to the Events page and the dashboard hero. Any number can stay pinned.
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
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <label style={{ display: "grid", gap: "4px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  Start time
                  <input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} style={field} />
                </label>
                <label style={{ display: "grid", gap: "4px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  End time
                  <input type="time" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} style={field} />
                </label>
              </div>
              <label style={{ display: "grid", gap: "4px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                Body
                <textarea required rows={4} value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} style={{ ...field, resize: "vertical" }} />
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: "12px", alignItems: "start" }}>
                <div>
                  <ItemImage src={form.image} alt="Picture preview" kind="announcement" height={100} />
                </div>
                <div style={{ display: "grid", gap: "8px", minWidth: 0 }}>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    Picture — upload a file or paste an image link. Items without one use the placeholder tile.
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => pickFile(e.target.files?.[0])}
                    style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}
                  />
                  <input
                    type="url"
                    placeholder="https://…/poster.jpg"
                    value={urlInput}
                    onChange={e => changeUrl(e.target.value)}
                    style={{ ...field, fontSize: "0.9rem" }}
                  />
                  <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                    {form.image && (
                      <button type="button" onClick={removeImage} style={{ background: "none", border: "none", color: "var(--danger)", fontWeight: 700, cursor: "pointer", fontSize: "0.85rem", padding: 0 }}>
                        Remove picture
                      </button>
                    )}
                    {imageError && <span style={{ color: "var(--danger)", fontSize: "0.8rem" }}>{imageError}</span>}
                  </div>
                </div>
              </div>

              <label style={{ display: "flex", gap: "8px", alignItems: "center", fontSize: "0.9rem", color: "var(--text)", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={form.pinned}
                  onChange={e => setForm({ ...form, pinned: e.target.checked })}
                  style={{ width: "18px", height: "18px", accentColor: "var(--brand)" }}
                />
                Pin to the dashboard hero
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
                <ItemImage src={a.image} alt={a.title} kind="announcement" height={72} className="media--row" />
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
                    {formatWhen(a.date, a.time, a.endTime)} · {a.author}
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
