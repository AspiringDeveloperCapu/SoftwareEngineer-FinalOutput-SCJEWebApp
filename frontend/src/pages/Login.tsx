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

      // Store in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redirect based on viewOnly status
      if (data.user.viewOnly) {
        navigate("/events");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError("Failed to connect to the server. Is the backend running?");
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#f4f7f6" }}>
      <div style={{ padding: "40px", backgroundColor: "white", borderRadius: "8px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", width: "100%", maxWidth: "400px" }}>
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>SCJE / BSISM Login</h2>
        
        {/* Helper info for prototype */}
        <div style={{ marginBottom: "20px", fontSize: "0.85rem", backgroundColor: "#e8f4f8", padding: "10px", borderRadius: "4px" }}>
          <strong>Prototype Logins (password: password123):</strong><br />
          - student_scje@chcc.edu.ph (Full Access)<br />
          - guest@chcc.edu.ph (View Only)
        </div>

        {error && <p style={{ color: "red", fontSize: "0.9rem", marginBottom: "15px" }}>{error}</p>}
        
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <input 
            type="email" 
            placeholder="Email (e.g. student_scje@chcc.edu.ph)" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
            required
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
            required
          />
          <button type="submit" className="login-btn" style={{ padding: "12px", fontSize: "16px" }}>Login</button>
        </form>
      </div>
    </div>
  );
}
