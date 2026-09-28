import React, { useEffect, useState } from "react";
import Drawer from "../components/Drawer";
import Navbar from "../components/Navbar";
import { getSession } from "../access";

interface ScheduleItem {
  day: string;
  time: string;
  subject: string;
  room: string;
  instructor: string;
  student?: string;
  section?: string;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const role = getSession()?.role || "student";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { window.location.href = '/'; return; }

    fetch("http://localhost:4000/api/schedule", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setSchedule(data))
      .catch(err => console.error(err));
  }, []);

  const dayColors: Record<string, string> = {
    Monday: "var(--heading)",
    Tuesday: "var(--accent)",
    Wednesday: "var(--gold)",
    Thursday: "var(--heading)",
    Friday: "var(--accent)"
  };

  const title = role === "admin"
    ? "School Schedule"
    : role === "instructor"
      ? "My Teaching Schedule"
      : "Class Schedule";

  const showStudent = role !== "student";

  return (
    <div className="app-container">
      <Drawer />
      <main className="main-content">
        <Navbar />
        <div className="dashboard-body">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "24px" }}>
            <h2 style={{ color: "var(--heading)", margin: 0 }}>{title}</h2>
            <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>{schedule.length} classes</span>
          </div>

          {DAYS.map(day => {
            const classes = schedule.filter(s => s.day === day);
            if (classes.length === 0) return null;

            return (
              <div key={day} style={{ marginBottom: "24px" }}>
                <h3 style={{ color: dayColors[day] || "var(--text)", marginBottom: "12px", fontSize: "1.1rem" }}>
                  {day}
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {classes.map((cls, i) => (
                    <div key={i} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px" }}>
                      <div>
                        <strong style={{ color: "var(--heading)", fontSize: "1rem" }}>{cls.subject}</strong>
                        {showStudent && cls.student && (
                          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--accent)", marginLeft: "8px" }}>
                            {cls.student} {cls.section ? `· ${cls.section}` : ""}
                          </span>
                        )}
                        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: "4px 0 0 0" }}>{cls.instructor}</p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ color: "var(--text)", fontWeight: 600, fontSize: "0.9rem", margin: 0 }}>{cls.time}</p>
                        <p style={{ color: "var(--text-faint)", fontSize: "0.8rem", margin: "2px 0 0 0" }}>{cls.room}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {schedule.length === 0 && (
            <div className="card" style={{ padding: "48px", textAlign: "center" }}>
              <p style={{ color: "var(--text-muted)" }}>No schedule available.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
