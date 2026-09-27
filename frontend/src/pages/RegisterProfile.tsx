import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function RegisterProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  
  const [picture, setPicture] = useState("");
  const [fullName, setFullName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [course, setCourse] = useState("");
  const [section, setSection] = useState("");
  const [gender, setGender] = useState("Male");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const u = JSON.parse(storedUser);
      setUser(u);
      setFullName(u.name || "");
      setCourse(u.course || "");
    } else {
      navigate("/");
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:4000/api/auth/register-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, picture, fullName, birthday, course, section, gender })
      });
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/dashboard");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const inputStyle = { padding: "12px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.1)" };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "#F6F8FA", padding: "20px" }}>
      <div style={{ backgroundColor: "white", padding: "32px", borderRadius: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", maxWidth: "500px", width: "100%" }}>
        <h2 style={{ color: "#0B3D63", marginBottom: "8px" }}>Complete Your Profile</h2>
        <p style={{ color: "#8C1D40", marginBottom: "24px", fontSize: "0.9rem" }}>Please fill in these details for your first-time login.</p>
        
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <input type="url" placeholder="Picture URL (optional)" value={picture} onChange={(e)=>setPicture(e.target.value)} style={inputStyle} />
          <input type="text" placeholder="Full Name" value={fullName} onChange={(e)=>setFullName(e.target.value)} style={inputStyle} required />
          
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label style={{ fontSize: "0.85rem", color: "#06263D", marginBottom: "4px" }}>Birthday</label>
            <input type="date" value={birthday} onChange={(e)=>setBirthday(e.target.value)} style={inputStyle} required />
          </div>

          <div style={{ display: "flex", gap: "16px" }}>
            <input type="text" placeholder="Course (e.g. BS Crim)" value={course} onChange={(e)=>setCourse(e.target.value)} style={{...inputStyle, flex: 1}} required />
            <input type="text" placeholder="Section (e.g. 1A)" value={section} onChange={(e)=>setSection(e.target.value)} style={{...inputStyle, flex: 1}} required />
          </div>

          <select value={gender} onChange={(e)=>setGender(e.target.value)} style={inputStyle}>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          <button type="submit" className="login-btn" style={{ marginTop: "16px" }}>Save & Continue</button>
        </form>
      </div>
    </div>
  );
}
