import { API_BASE } from "../api";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [picture, setPicture] = useState("");
  const [birthday, setBirthday] = useState("");
  const [gender, setGender] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const u = JSON.parse(storedUser);
      setUser(u);
      setName(u.name || "");
      setPicture(u.picture || "");
      setBirthday(u.birthday || "");
      setGender(u.gender || "");
    } else {
      navigate("/");
    }
  }, [navigate]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/api/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, picture, birthday, gender })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return null;

  const inputStyle: React.CSSProperties = {
    padding: "12px 16px", borderRadius: "12px",
    border: "1px solid var(--border-strong)", fontSize: "1rem",
    outlineColor: "var(--heading)", width: "100%",
    backgroundColor: "var(--surface)", color: "var(--text)"
  };

  return (
    <div className="app-container">
      <main className="main-content">
        <Navbar />
        <div className="dashboard-body">
          <h2 style={{ color: "var(--heading)", marginBottom: "24px" }}>My Profile</h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px" }}>
            {/* Profile Card */}
            <div className="card" style={{ padding: "24px", textAlign: "center" }}>
              {user.picture ? (
                <img src={user.picture} alt="Profile" style={{ width: "120px", height: "120px", borderRadius: "50%", objectFit: "cover", border: "3px solid var(--gold)", margin: "0 auto 16px" }} />
              ) : (
                <div style={{ width: "120px", height: "120px", borderRadius: "50%", background: "linear-gradient(135deg, var(--brand), var(--accent-solid))", margin: "0 auto 16px", display: "flex", justifyContent: "center", alignItems: "center", color: "white", fontSize: "3rem", fontWeight: 800 }}>
                  {user.name?.charAt(0) || "?"}
                </div>
              )}
              <h3 style={{ color: "var(--text)", marginBottom: "4px" }}>{user.name}</h3>
              <p style={{ color: "var(--accent)", fontWeight: 600, fontSize: "0.9rem" }}>{user.role?.toUpperCase()}</p>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "8px" }}>{user.department} — {user.course}</p>
              {user.birthday && <p style={{ color: "var(--text-faint)", fontSize: "0.8rem", marginTop: "4px" }}>Born: {user.birthday}</p>}
            </div>

            {/* Edit Form */}
            <div className="card" style={{ padding: "24px" }}>
              <h3 style={{ color: "var(--text)", marginBottom: "20px" }}>Edit Profile</h3>

              {saved && (
                <div style={{ backgroundColor: "var(--success-bg)", padding: "12px", borderRadius: "12px", marginBottom: "16px", color: "var(--success)", fontWeight: 600, fontSize: "0.9rem" }}>
                  ✅ Profile saved successfully!
                </div>
              )}

              <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ fontSize: "0.85rem", color: "var(--text)", fontWeight: 600, marginBottom: "4px", display: "block" }}>Full Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} required />
                </div>
                <div>
                  <label style={{ fontSize: "0.85rem", color: "var(--text)", fontWeight: 600, marginBottom: "4px", display: "block" }}>Picture URL</label>
                  <input type="url" value={picture} onChange={(e) => setPicture(e.target.value)} style={inputStyle} placeholder="https://..." />
                </div>
                <div>
                  <label style={{ fontSize: "0.85rem", color: "var(--text)", fontWeight: 600, marginBottom: "4px", display: "block" }}>Birthday</label>
                  <input type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: "0.85rem", color: "var(--text)", fontWeight: 600, marginBottom: "4px", display: "block" }}>Gender</label>
                  <select value={gender} onChange={(e) => setGender(e.target.value)} style={inputStyle}>
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <button type="submit" className="login-btn" style={{ marginTop: "8px" }}>Save Changes</button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
