import React from "react";
import { useNavigate } from "react-router-dom";
import { Session } from "../access";

export interface PinSummary {
  type: "announcement" | "event";
  id: number;
  title: string;
  date: string;
  body?: string;
  category?: string;
  location?: string;
}

interface Props {
  user: Session;
  subtitle: string;
  pins?: PinSummary[] | null;
  fallbackBadge: { text: string; background: string; color: string };
}

/**
 * The dashboard hero for every full-access role: it greets the user and stacks
 * everything the admin has pinned - announcements first, then events. Pins are
 * independent, so any number of them can show here at once. Clicking a pin (or
 * the hero) opens the feed where it lives.
 */
export default function PinnedHero({ user, subtitle, pins, fallbackBadge }: Props) {
  const navigate = useNavigate();
  const list = pins || [];

  const badge = list.length > 0
    ? { text: `📌 ${list.length} Pinned`, background: "var(--gold)", color: "var(--on-gold)" }
    : fallbackBadge;

  return (
    <section
      className="hero"
      style={{
        position: "relative",
        overflow: "hidden",
        cursor: list.length > 0 ? "pointer" : undefined,
        borderColor: list.length > 0 ? "var(--gold)" : undefined
      }}
      onClick={list.length > 0 ? () => navigate("/events") : undefined}
    >
      <div
        style={{
          position: "absolute",
          top: "16px",
          right: "16px",
          backgroundColor: badge.background,
          color: badge.color,
          padding: "4px 12px",
          borderRadius: "99px",
          fontSize: "0.8rem",
          fontWeight: "bold"
        }}
      >
        {badge.text}
      </div>

      <h1 style={{ fontSize: "1.5rem" }}>Welcome, {user.name}!</h1>
      <p style={{ color: "var(--text-muted)", fontSize: "1rem", marginTop: "8px" }}>{subtitle}</p>

      {list.map((pin, i) => (
        <div
          key={`${pin.type}-${pin.id}`}
          style={{
            marginTop: i === 0 ? "16px" : "10px",
            padding: "14px 16px",
            borderRadius: "12px",
            backgroundColor: "var(--surface-alt)",
            border: "1px solid var(--hairline)",
            borderLeft: "4px solid var(--gold)"
          }}
        >
          <strong style={{ color: "var(--heading)", fontSize: "1.05rem" }}>{pin.title}</strong>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: "6px 0 0", lineHeight: 1.5 }}>
            {pin.type === "announcement"
              ? (pin.body || "").slice(0, 160)
              : `${pin.date}${pin.location ? ` · ${pin.location}` : ""}`}
          </p>
          <span style={{ display: "inline-block", marginTop: "8px", color: "var(--accent)", fontWeight: 700, fontSize: "0.8rem" }}>
            Open the feed →
          </span>
        </div>
      ))}
    </section>
  );
}
