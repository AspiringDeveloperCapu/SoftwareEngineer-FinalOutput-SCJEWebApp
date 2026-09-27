import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:4000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.user.isFirstTimeLogin) {
        navigate("/register-profile");
      } else if (data.user.viewOnly) {
        navigate("/events");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError("Failed to connect to the server. Is the backend running?");
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#F6F8FA" }}>
      <div style={{ padding: "32px", backgroundColor: "white", borderRadius: "16px", border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", width: "100%", maxWidth: "400px" }}>
        <h2 style={{ textAlign: "center", marginBottom: "24px", color: "#0B3D63", fontWeight: 700 }}>SCJE / BSISM Login</h2>
        
        <div style={{ marginBottom: "24px", fontSize: "0.85rem", backgroundColor: "#F6F8FA", padding: "16px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.05)" }}>
          <strong style={{ color: "#06263D" }}>Prototype Logins (password: password123):</strong><br />
          <span style={{ color: "#8C1D40" }}>- crim@chcc.edu.ph (1st Time Login)</span><br />
          <span style={{ color: "#0B3D63" }}>- ism@chcc.edu.ph (Standard Login)</span><br />
          <span style={{ color: "#C9A227" }}>- guest@chcc.edu.ph (View Only)</span>
        </div>

        {error && <p style={{ color: "#8C1D40", fontSize: "0.9rem", marginBottom: "16px", textAlign: "center" }}>{error}</p>}
        
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <input 
            type="email" 
            placeholder="Email (e.g. crim@chcc.edu.ph)" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ padding: "16px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.1)", outlineColor: "#0B3D63", backgroundColor: "#F6F8FA" }}
            required
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: "16px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.1)", outlineColor: "#0B3D63", backgroundColor: "#F6F8FA" }}
            required
          />
          <button type="submit" className="login-btn" style={{ padding: "16px", fontSize: "16px", marginTop: "8px" }}>Login</button>
        </form>
      </div>
    </div>
  );
}
