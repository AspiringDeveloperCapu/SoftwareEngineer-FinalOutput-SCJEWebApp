import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const DEMO_ACCOUNTS = [
  { label: "Student (existing)", email: "ism@chcc.edu.ph" },
  { label: "First-Time Student", email: "crim@chcc.edu.ph" },
  { label: "Instructor", email: "instructor@chcc.edu.ph" },
  { label: "Administrator", email: "admin@chcc.edu.ph" }
];

/**
 * The sign-in form. It used to own a page of its own; it now lives inside the
 * main dashboard (id="signin"), which is what the header's Sign In button
 * scrolls to. First-time users are still sent to /register-profile first.
 */
export default function LoginForm() {
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

      navigate(data.user.isFirstTimeLogin ? "/register-profile" : "/dashboard");
    } catch {
      setErrorMessage("Failed to connect to the server. Is the backend running?");
      setIsSubmitting(false);
    }
  };

  const fill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("password123");
    setErrorMessage(null);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "13px 14px",
    borderRadius: "12px",
    border: "1px solid var(--border-strong)",
    outlineColor: "var(--heading)",
    color: "var(--text)",
    fontSize: "0.95rem"
  };

  return (
    <form
      id="signin"
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        padding: "20px",
        borderRadius: "16px",
        border: "1px solid var(--glass-border)",
        background: "var(--glass-strong)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)"
      }}
    >
      <div>
        <h2 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--text)", margin: 0 }}>Sign in</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginTop: "4px" }}>
          Use your SCJE student or staff account.
        </p>
      </div>

      <div style={{ position: "relative" }}>
        <span style={{ position: "absolute", left: "14px", top: "13px", fontSize: "18px", color: "var(--text-muted)" }}>@</span>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => { setEmail(e.target.value); setErrorMessage(null); }}
          style={{ ...inputStyle, paddingLeft: "42px" }}
          required
        />
      </div>

      <div style={{ position: "relative" }}>
        <span style={{ position: "absolute", left: "14px", top: "13px", fontSize: "16px", color: "var(--text-muted)" }}>🔒</span>
        <input
          type={obscure ? "password" : "text"}
          placeholder="Password"
          value={password}
          onChange={e => { setPassword(e.target.value); setErrorMessage(null); }}
          style={{ ...inputStyle, paddingLeft: "42px", paddingRight: "44px" }}
          required
        />
        <button
          type="button"
          onClick={() => setObscure(!obscure)}
          aria-label={obscure ? "Show password" : "Hide password"}
          style={{ position: "absolute", right: "8px", top: "8px", background: "none", border: "none", cursor: "pointer", fontSize: "16px", color: "var(--text-muted)", padding: "4px" }}
        >
          {obscure ? "👁️" : "🙈"}
        </button>
      </div>

      {errorMessage && (
        <div style={{ backgroundColor: "var(--danger-bg)", padding: "10px 12px", borderRadius: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ color: "var(--danger)" }}>⚠️</span>
          <span style={{ color: "var(--danger)", fontSize: "13px", fontWeight: 600 }}>{errorMessage}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="login-btn"
        style={{ padding: "14px", fontSize: "15px", opacity: isSubmitting ? 0.7 : 1 }}
      >
        {isSubmitting ? "Signing in..." : "Sign in ➔"}
      </button>

      <div style={{ borderTop: "1px solid var(--hairline)", paddingTop: "12px" }}>
        <p style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.6px" }}>
          🧪 Demo accounts — tap to fill
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
          {DEMO_ACCOUNTS.map(acc => (
            <button
              key={acc.email}
              type="button"
              onClick={() => fill(acc.email)}
              style={{
                padding: "7px 9px",
                borderRadius: "9px",
                border: "1px solid var(--border-strong)",
                background: email === acc.email ? "var(--grad-primary)" : "transparent",
                color: email === acc.email ? "var(--on-primary)" : "var(--text)",
                cursor: "pointer",
                fontSize: "0.75rem",
                fontWeight: 700,
                textAlign: "left"
              }}
            >
              {acc.label}
              <span style={{ display: "block", fontWeight: 500, fontSize: "0.7rem", opacity: 0.75, overflow: "hidden", textOverflow: "ellipsis" }}>
                {acc.email}
              </span>
            </button>
          ))}
        </div>
        <p style={{ color: "var(--text-faint)", fontSize: "0.75rem", marginTop: "10px" }}>
          Password for all demo accounts: <strong>password123</strong> · Trouble signing in? Contact the SCJE office.
        </p>
      </div>
    </form>
  );
}
