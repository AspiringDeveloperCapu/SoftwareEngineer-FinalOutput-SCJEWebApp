import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import { getSession } from "../access";
import {
  ClassRow,
  DAY_ORDER,
  parseRange,
  formatRange,
  formatMinutes,
  packOverlaps,
  subjectStyle,
  normSection
} from "../schedule";

interface RosterStudent {
  id: number;
  name: string;
  section: string;
}

interface FormState {
  mode: "add" | "edit";
  orig?: ClassRow;
  day: string;
  start: string;
  end: string;
  subject: string;
  room: string;
  instructor: string;
  section: string;
}

const WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const PX_PER_MIN = 1.2;

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`
});

const toTimeInput = (min: number) =>
  `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

const fromTimeInput = (value: string) => {
  const [h, m] = value.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};

/**
 * The schedule as a real weekly timetable: days across the top, time down the
 * side, and every class placed at its actual time slot with overlaps sharing
 * the column width. Today's column is highlighted and a live line marks the
 * current time. Admins edit the section's timetable directly on the grid -
 * one change writes to every student in that section, because the timetable
 * belongs to the section, not to an individual.
 */
export default function SchedulePage() {
  const session = getSession();
  const role = session?.role || "student";

  const [rows, setRows] = useState<ClassRow[]>([]);
  const [roster, setRoster] = useState<RosterStudent[]>([]);
  const [query, setQuery] = useState("");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [form, setForm] = useState<FormState | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [now, setNow] = useState(() => new Date());

  const load = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/";
      return;
    }
    fetch("http://localhost:4000/api/schedule", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setRows(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));

    if (role === "admin") {
      fetch("http://localhost:4000/api/admin/users", { headers: authHeaders() })
        .then(res => res.json())
        .then(data => {
          const all = Array.isArray(data) ? data : [];
          setRoster(all.filter((u: { role?: string }) => u.role === "student"));
        })
        .catch(err => console.error(err));
    }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const title = role === "admin"
    ? "School Schedule"
    : role === "instructor"
      ? "My Teaching Schedule"
      : "Class Schedule";

  // Sections come from the roster for admins (they target edits there) and
  // from the visible rows for everyone else.
  const sectionOptions = useMemo(() => {
    const source = role === "admin" ? roster.map(s => s.section) : rows.map(r => r.section || "");
    const uniq = [...new Set(source.map(normSection).filter(Boolean))];
    return uniq.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [roster, rows, role]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(r => {
      if (sectionFilter !== "all" && normSection(r.section) !== sectionFilter) return false;
      if (!q) return true;
      return [r.subject, r.room, r.instructor, r.student, r.section, r.day]
        .some(v => (v || "").toLowerCase().includes(q));
    });
  }, [rows, query, sectionFilter]);

  const parsed = useMemo(
    () =>
      visible
        .map(row => {
          const range = parseRange(row.time);
          return range ? { row, start: range[0], end: range[1] } : null;
        })
        .filter((x): x is { row: ClassRow; start: number; end: number } => x !== null),
    [visible]
  );
  const unparsed = useMemo(() => visible.filter(r => !parseRange(r.time)), [visible]);

  // Whole-hour bounds so the hour lines in the columns line up with the
  // labels in the gutter; always at least 8AM-6P M of visible grid.
  const range = useMemo(() => {
    if (parsed.length === 0) return { start: 8 * 60, end: 18 * 60 };
    const min = Math.floor(Math.min(...parsed.map(p => p.start)) / 60) * 60;
    const max = Math.ceil(Math.max(...parsed.map(p => p.end)) / 60) * 60;
    return { start: Math.min(min, 8 * 60), end: Math.max(max, 18 * 60) };
  }, [parsed]);

  const days = useMemo(() => {
    const extras = DAY_ORDER.filter(d => !WEEK.includes(d) && rows.some(r => r.day === d));
    return [...WEEK, ...extras];
  }, [rows]);

  const byDay = useMemo(() => {
    const map = new Map<string, Array<{ row: ClassRow; start: number; end: number; col: number; cols: number }>>();
    for (const day of days) {
      const dayItems = parsed.filter(p => p.row.day === day);
      map.set(
        day,
        packOverlaps(dayItems).map(x => ({ ...x.item, col: x.col, cols: x.cols }))
      );
    }
    return map;
  }, [days, parsed]);

  const hours: number[] = [];
  for (let m = Math.ceil(range.start / 60) * 60; m <= range.end; m += 60) hours.push(m);

  const todayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][now.getDay()];
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const nowVisible = nowMin >= range.start && nowMin <= range.end;
  const totalH = (range.end - range.start) * PX_PER_MIN;
  const hourPx = 60 * PX_PER_MIN;

  const openAdd = () => {
    setFormError(null);
    setForm({
      mode: "add",
      day: "Monday",
      start: "07:30",
      end: "08:30",
      subject: "",
      room: "",
      instructor: "",
      section: sectionFilter !== "all" ? sectionFilter : sectionOptions[0] || ""
    });
  };

  const openEdit = (row: ClassRow) => {
    const range = parseRange(row.time);
    setFormError(null);
    setForm({
      mode: "edit",
      orig: row,
      day: row.day,
      start: range ? toTimeInput(range[0]) : "",
      end: range ? toTimeInput(range[1]) : "",
      subject: row.subject,
      room: row.room,
      instructor: row.instructor,
      section: normSection(row.section)
    });
  };

  // One row on the grid = one class in the section, so both save and delete
  // walk every student of that section and apply the change to their copy.
  const targetsFor = (section: string, orig?: ClassRow) => {
    const bySection = section ? roster.filter(s => normSection(s.section) === section) : [];
    if (bySection.length > 0) return bySection;
    return orig?.student ? roster.filter(s => s.name === orig.student) : [];
  };

  const findIndex = (list: ClassRow[], orig: ClassRow) =>
    list.findIndex(
      r => r.day === orig.day && r.time === orig.time && r.subject === orig.subject && r.room === orig.room
    );

  const submitForm = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!form) return;
    setFormError(null);

    const subject = form.subject.trim();
    if (!subject) { setFormError("Subject is required."); return; }
    if (!form.start || !form.end) { setFormError("Start and end times are required."); return; }
    const start = fromTimeInput(form.start);
    const end = fromTimeInput(form.end);
    if (end <= start) { setFormError("End time must be after start time."); return; }

    const section = form.mode === "add" ? form.section : normSection(form.section || form.orig?.section);
    const targets = targetsFor(section, form.orig);
    if (targets.length === 0) { setFormError("No students in that section yet."); return; }

    const time = formatRange(start, end);
    const payload = JSON.stringify({
      day: form.day,
      time,
      subject,
      room: form.room.trim(),
      instructor: form.instructor.trim()
    });

    setSaving(true);
    try {
      if (form.mode === "add") {
        for (const target of targets) {
          const res = await fetch(`http://localhost:4000/api/admin/users/${target.id}/schedule`, {
            method: "POST",
            headers: authHeaders(),
            body: payload
          });
          if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            setFormError(body.message || "Could not add the class.");
            return;
          }
        }
      } else {
        const orig = form.orig!;
        for (const target of targets) {
          const detail = await fetch(`http://localhost:4000/api/admin/users/${target.id}`, {
            headers: authHeaders()
          }).then(r => r.json());
          const list: ClassRow[] = detail?.schedule || [];
          const idx = findIndex(list, orig);
          if (idx === -1) continue;
          const res = await fetch(`http://localhost:4000/api/admin/users/${target.id}/schedule/${idx}`, {
            method: "PUT",
            headers: authHeaders(),
            body: payload
          });
          if (!res.ok) {
            setFormError("Could not save the changes.");
            return;
          }
        }
      }
      load();
      setForm(null);
    } catch {
      setFormError("Could not reach the server.");
    } finally {
      setSaving(false);
    }
  };

  const removeRow = async (row: ClassRow) => {
    if (!window.confirm(`Remove “${row.subject}” (${row.time}) from this section's timetable?`)) return;
    const targets = targetsFor(normSection(row.section), row);
    for (const target of targets) {
      const detail = await fetch(`http://localhost:4000/api/admin/users/${target.id}`, {
        headers: authHeaders()
      }).then(r => r.json());
      const list: ClassRow[] = detail?.schedule || [];
      const idx = findIndex(list, row);
      if (idx === -1) continue;
      await fetch(`http://localhost:4000/api/admin/users/${target.id}/schedule/${idx}`, {
        method: "DELETE",
        headers: authHeaders()
      });
    }
    load();
  };

  const field: React.CSSProperties = {
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid var(--border-strong)",
    backgroundColor: "var(--surface)",
    color: "var(--text)",
    fontSize: "0.95rem"
  };

  const isAdmin = role === "admin";

  return (
    <div className="app-container">
      <main className="main-content">
        <Navbar />
        <div className="dashboard-body">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", gap: "12px", flexWrap: "wrap" }}>
            <div>
              <h2 style={{ color: "var(--heading)", margin: 0 }}>{title}</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: "4px 0 0" }}>
                {isAdmin
                  ? "The weekly timetable per section - edit a class right on the grid."
                  : role === "instructor"
                    ? "The classes you teach, laid out on the weekly grid."
                    : "Your classes for the week, laid out on the weekly grid."}
              </p>
            </div>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>{visible.length} classes</span>
              {isAdmin && !form && (
                <button className="login-btn" onClick={openAdd} style={{ padding: "10px 18px" }}>+ Add class</button>
              )}
            </div>
          </div>

          <div className="sched-controls">
            <input
              className="search-box"
              placeholder="Search subject, room, instructor…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{ marginBottom: 0 }}
            />
            {sectionOptions.length > 0 && (
              <select
                className="sched-select"
                value={sectionFilter}
                onChange={e => setSectionFilter(e.target.value)}
                aria-label="Filter by section"
              >
                <option value="all">All sections</option>
                {sectionOptions.map(s => (
                  <option key={s} value={s}>Section {s}</option>
                ))}
              </select>
            )}
          </div>

          {form && (
            <form onSubmit={submitForm} className="card" style={{ marginBottom: "24px", display: "grid", gap: "12px" }}>
              <h3 style={{ margin: 0 }}>
                {form.mode === "add" ? "Add a class to a section" : "Edit class"}
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px" }}>
                <label style={{ display: "grid", gap: "4px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  Day
                  <select value={form.day} onChange={e => setForm({ ...form, day: e.target.value })} style={field}>
                    {DAY_ORDER.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </label>
                <label style={{ display: "grid", gap: "4px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  Start time
                  <input required type="time" value={form.start} onChange={e => setForm({ ...form, start: e.target.value })} style={field} />
                </label>
                <label style={{ display: "grid", gap: "4px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  End time
                  <input required type="time" value={form.end} onChange={e => setForm({ ...form, end: e.target.value })} style={field} />
                </label>
                <label style={{ display: "grid", gap: "4px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  Section
                  {form.mode === "add" ? (
                    <select required value={form.section} onChange={e => setForm({ ...form, section: e.target.value })} style={field}>
                      {sectionOptions.length === 0 && <option value="">No sections yet</option>}
                      {sectionOptions.map(s => (
                        <option key={s} value={s}>
                          {s} ({roster.filter(r => normSection(r.section) === s).length} student{roster.filter(r => normSection(r.section) === s).length === 1 ? "" : "s"})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input value={form.section} disabled style={{ ...field, opacity: 0.7 }} />
                  )}
                </label>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
                <label style={{ display: "grid", gap: "4px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  Subject
                  <input required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} style={field} />
                </label>
                <label style={{ display: "grid", gap: "4px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  Room
                  <input value={form.room} onChange={e => setForm({ ...form, room: e.target.value })} style={field} />
                </label>
                <label style={{ display: "grid", gap: "4px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  Instructor
                  <input value={form.instructor} onChange={e => setForm({ ...form, instructor: e.target.value })} style={field} />
                </label>
              </div>

              {formError && <p style={{ color: "var(--danger)", margin: 0, fontSize: "0.9rem" }}>{formError}</p>}

              <div style={{ display: "flex", gap: "8px" }}>
                <button type="submit" className="login-btn" style={{ padding: "10px 18px" }} disabled={saving}>
                  {saving ? "Saving…" : form.mode === "add" ? "Add to timetable" : "Save changes"}
                </button>
                <button
                  type="button"
                  onClick={() => { setForm(null); setFormError(null); }}
                  style={{ padding: "10px 18px", borderRadius: "8px", border: "1px solid var(--border-strong)", backgroundColor: "var(--surface)", color: "var(--text)", cursor: "pointer", fontWeight: 600 }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {visible.length === 0 ? (
            <div className="card" style={{ padding: "48px", textAlign: "center" }}>
              <p style={{ color: "var(--text-muted)" }}>
                {rows.length === 0 ? "No schedule available." : "No classes match your search or filter."}
              </p>
            </div>
          ) : (
            <>
              <div className="sched-wrap">
                <div
                  className="sched-grid"
                  style={{ gridTemplateColumns: `64px repeat(${days.length}, minmax(150px, 1fr))` }}
                >
                  <div />
                  {days.map(d => (
                    <div key={d} className={`sched-day-head${d === todayName ? " is-today" : ""}`}>
                      {d.slice(0, 3).toUpperCase()}
                      {d === todayName && <small>TODAY</small>}
                    </div>
                  ))}

                  <div className="sched-gutter" style={{ height: totalH }}>
                    {hours.map(h => (
                      <span key={h} className="sched-hour" style={{ top: (h - range.start) * PX_PER_MIN }}>
                        {formatMinutes(h)}
                      </span>
                    ))}
                    {nowVisible && (
                      <span className="sched-now-pill" style={{ top: (nowMin - range.start) * PX_PER_MIN }}>
                        {formatMinutes(nowMin)}
                      </span>
                    )}
                  </div>

                  {days.map(day => {
                    const items = byDay.get(day) || [];
                    const isToday = day === todayName;
                    return (
                      <div
                        key={day}
                        className={`sched-col${isToday ? " is-today" : ""}`}
                        style={{
                          height: totalH,
                          backgroundImage: `repeating-linear-gradient(to bottom, transparent 0 ${hourPx - 1}px, var(--hairline) ${hourPx - 1}px ${hourPx}px)`
                        }}
                      >
                        {items.map((it, i) => {
                          const isNow = isToday && nowMin >= it.start && nowMin < it.end;
                          const top = (it.start - range.start) * PX_PER_MIN;
                          const height = Math.max((it.end - it.start) * PX_PER_MIN, 32);
                          return (
                            <div
                              key={`${it.row.day}-${it.row.subject}-${it.row.time}-${i}`}
                              className={`tt-block${isAdmin ? " is-editable" : ""}${isNow ? " is-now" : ""}`}
                              style={{
                                ...subjectStyle(it.row.subject),
                                top,
                                height,
                                left: `calc(${(it.col * 100) / it.cols}% + 2px)`,
                                width: `calc(${100 / it.cols}% - 4px)`
                              }}
                              onClick={isAdmin ? () => openEdit(it.row) : undefined}
                              title={`${it.row.subject} · ${it.row.time}${it.row.room ? ` · ${it.row.room}` : ""}`}
                            >
                              <div className="tt-subject">{it.row.subject}</div>
                              <div className="tt-meta">
                                {it.row.room}
                                {it.row.instructor ? ` · ${it.row.instructor}` : ""}
                              </div>
                              {(it.row.section || it.row.student) && height >= 64 && (
                                <div className="tt-chip">
                                  {[it.row.section, role !== "student" ? it.row.student : ""].filter(Boolean).join(" · ")}
                                </div>
                              )}
                              {isNow && <span className="tt-now-chip">NOW</span>}
                              {isAdmin && (
                                <div className="tt-actions">
                                  <button
                                    type="button"
                                    className="tt-act"
                                    title="Edit class"
                                    onClick={e => { e.stopPropagation(); openEdit(it.row); }}
                                  >
                                    ✎
                                  </button>
                                  <button
                                    type="button"
                                    className="tt-act"
                                    title="Remove from timetable"
                                    onClick={e => { e.stopPropagation(); removeRow(it.row); }}
                                  >
                                    ✕
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                        {isToday && nowVisible && (
                          <div className="sched-now-line" style={{ top: (nowMin - range.start) * PX_PER_MIN }} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {unparsed.length > 0 && (
                <section style={{ marginTop: "20px" }}>
                  <h3 style={{ color: "var(--heading)", fontSize: "1rem", marginBottom: "10px" }}>
                    Time not recognized ({unparsed.length})
                  </h3>
                  <div style={{ display: "grid", gap: "8px" }}>
                    {unparsed.map((r, i) => (
                      <div key={i} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", padding: "12px 16px" }}>
                        <div style={{ minWidth: 0 }}>
                          <strong style={{ color: "var(--heading)" }}>{r.subject}</strong>
                          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: "4px 0 0" }}>
                            {r.day} · {r.time || "no time set"} · {r.room}
                            {r.instructor ? ` · ${r.instructor}` : ""}
                          </p>
                        </div>
                        {isAdmin && (
                          <div style={{ display: "flex", gap: "12px", flexShrink: 0 }}>
                            <button onClick={() => openEdit(r)} style={{ background: "none", border: "none", color: "var(--heading)", fontWeight: 700, cursor: "pointer", fontSize: "0.85rem" }}>
                              Edit
                            </button>
                            <button onClick={() => removeRow(r)} style={{ background: "none", border: "none", color: "var(--danger)", fontWeight: 700, cursor: "pointer", fontSize: "0.85rem" }}>
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
