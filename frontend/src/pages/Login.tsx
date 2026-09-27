import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [obscure, setObscure] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:4000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || "Login failed");
        setIsSubmitting(false);
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
      setErrorMessage("Failed to connect to the server. Is the backend running?");
      setIsSubmitting(false);
    }
  };

  const fillDemoAccount = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("password123");
    setErrorMessage(null);
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "#F6F8FA", padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: "440px", display: "flex", flexDirection: "column" }}>
        
        {/* Brand Section */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "32px" }}>
          <div style={{ 
            background: "linear-gradient(to bottom right, #0B3D63, #8C1D40)", 
            padding: "16px", borderRadius: "16px", marginBottom: "12px", 
            display: "flex", justifyContent: "center", alignItems: "center",
            width: "64px", height: "64px" 
          }}>
            {/* SVG Placeholder for school icon */}
            <svg fill="white" viewBox="0 0 24 24" width="32" height="32">
              <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2.12-1.15V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72l5 2.73 5-2.73v3.72z"/>
            </svg>
          </div>
          <h1 style={{ color: "#06263D", fontSize: "1.5rem", fontWeight: 800, letterSpacing: "-0.4px", margin: "0 0 2px 0" }}>
            SCJE Student Hub
          </h1>
          <p style={{ color: "#8C1D40", fontSize: "0.85rem", fontWeight: 700, letterSpacing: "1.2px", margin: 0 }}>
            BSCRIM · BSISM
          </p>
        </div>

        {/* Title Section */}
        <div style={{ marginBottom: "24px" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#06263D", marginBottom: "4px" }}>Sign in</h2>
          <p style={{ color: "#666", fontSize: "0.95rem" }}>Use your SCJE student or staff account.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Email Input */}
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: "16px", top: "16px", fontSize: "20px", color: "#666" }}>@</span>
            <input 
              type="email" 
              placeholder="Email" 
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrorMessage(null); }}
              style={{ width: "100%", padding: "16px 16px 16px 48px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.1)", outlineColor: "#0B3D63", backgroundColor: "#fff", fontSize: "1rem" }}
              required
            />
          </div>

          {/* Password Input */}
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: "16px", top: "16px", fontSize: "20px", color: "#666" }}>🔒</span>
            <input 
              type={obscure ? "password" : "text"} 
              placeholder="Password" 
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrorMessage(null); }}
              style={{ width: "100%", padding: "16px 48px 16px 48px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.1)", outlineColor: "#0B3D63", backgroundColor: "#fff", fontSize: "1rem" }}
              required
            />
            <button 
              type="button" 
              onClick={() => setObscure(!obscure)} 
              style={{ position: "absolute", right: "12px", top: "12px", background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "#666", padding: "4px" }}
            >
              {obscure ? "👁️" : "🙈"}
            </button>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div style={{ backgroundColor: "#ffebee", padding: "12px", borderRadius: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "#c62828" }}>⚠️</span>
              <span style={{ color: "#c62828", fontSize: "13px", fontWeight: 600 }}>{errorMessage}</span>
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={isSubmitting}
            style={{ 
              backgroundColor: "#C9A227", color: "#06263D", border: "none", padding: "16px", 
              borderRadius: "12px", cursor: "pointer", fontWeight: 700, fontSize: "16px", 
              marginTop: "8px", opacity: isSubmitting ? 0.7 : 1, transition: "background 0.2s" 
            }}
          >
            {isSubmitting ? "Signing in..." : "Sign in ➔"}
          </button>
        </form>

        {/* Demo Accounts Card */}
        <div style={{ marginTop: "24px", backgroundColor: "#fff", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.05)", padding: "16px" }}>
          <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#06263D", marginBottom: "4px" }}>🧪 Demo accounts</h3>
          <p style={{ fontSize: "0.8rem", color: "#666", marginBottom: "16px" }}>Tap one to fill the form</p>
          
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
            <li onClick={() => fillDemoAccount("crim@chcc.edu.ph")} style={{ padding: "8px", borderRadius: "8px", cursor: "pointer", border: "1px solid #eee", fontSize: "0.85rem" }}>
              <strong style={{ color: "#0B3D63" }}>First-Time Student</strong><br/>
              crim@chcc.edu.ph
            </li>
            <li onClick={() => fillDemoAccount("ism@chcc.edu.ph")} style={{ padding: "8px", borderRadius: "8px", cursor: "pointer", border: "1px solid #eee", fontSize: "0.85rem" }}>
              <strong style={{ color: "#0B3D63" }}>Standard Student</strong><br/>
              ism@chcc.edu.ph
            </li>
            <li onClick={() => fillDemoAccount("guest@chcc.edu.ph")} style={{ padding: "8px", borderRadius: "8px", cursor: "pointer", border: "1px solid #eee", fontSize: "0.85rem" }}>
              <strong style={{ color: "#0B3D63" }}>View Only Guest</strong><br/>
              guest@chcc.edu.ph
            </li>
          </ul>
        </div>

        {/* Footer Links */}
        <div style={{ marginTop: "24px", textAlign: "center", display: "flex", flexDirection: "column", gap: "8px" }}>
          <button style={{ background: "none", border: "none", color: "#0B3D63", cursor: "pointer", fontWeight: 600, fontSize: "0.9rem" }}>
            Forgot your password?
          </button>
          <p style={{ color: "#666", fontSize: "0.8rem" }}>Still having trouble? Contact the SCJE office.</p>
        </div>

      </div>
    </div>
  );
}
