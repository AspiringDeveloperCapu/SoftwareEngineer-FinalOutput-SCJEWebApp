import React, { useEffect, useState } from "react";
import Drawer from "../components/Drawer";
import Navbar from "../components/Navbar";

interface ScheduleItem {
  day: string;
  time: string;
  subject: string;
  room: string;
  instructor: string;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);

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
    Monday: "#0B3D63",
    Tuesday: "#8C1D40",
    Wednesday: "#C9A227",
    Thursday: "#0B3D63",
    Friday: "#8C1D40"
  };

  return (
    <div className="app-container">
      <Drawer />
      <main className="main-content">
        <Navbar />
        <div className="dashboard-body">
          <h2 style={{ color: "#0B3D63", marginBottom: "24px" }}>Class Schedule</h2>

          {DAYS.map(day => {
            const classes = schedule.filter(s => s.day === day);
            if (classes.length === 0) return null;

            return (
              <div key={day} style={{ marginBottom: "24px" }}>
                <h3 style={{ color: dayColors[day] || "#06263D", marginBottom: "12px", fontSize: "1.1rem" }}>
                  {day}
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {classes.map((cls, i) => (
                    <div key={i} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px" }}>
                      <div>
                        <strong style={{ color: "#0B3D63", fontSize: "1rem" }}>{cls.subject}</strong>
                        <p style={{ color: "#666", fontSize: "0.85rem", margin: "4px 0 0 0" }}>{cls.instructor}</p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ color: "#06263D", fontWeight: 600, fontSize: "0.9rem", margin: 0 }}>{cls.time}</p>
                        <p style={{ color: "#888", fontSize: "0.8rem", margin: "2px 0 0 0" }}>{cls.room}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {schedule.length === 0 && (
            <div className="card" style={{ padding: "48px", textAlign: "center" }}>
              <p style={{ color: "#666" }}>No schedule available.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
