import React from "react";
import { useNavigate } from "react-router-dom";
import { Session } from "../access";
import { formatTimeRange } from "../format";
import ItemImage from "./ItemImage";

export interface PinSummary {
  type: "announcement" | "event";
  id: number;
  title: string;
  date: string;
  time?: string;
  endTime?: string;
  body?: string;
  category?: string;
  location?: string;
  image?: string;
}

interface Props {
  user: Session;
  subtitle: string;
  pins?: PinSummary[] | null;
  fallbackBadge: { text: string; background: string; color: string };
}

/**
 * The introduction band on every full-access dashboard: it opens like a
 * welcome page (eyebrow, greeting, what the hub is for), then stacks
 * everything the admin has pinned underneath - announcements first, then
 * events. The art panel gives the page its visual anchor; pins carry their
 * pictures as thumbnails when they have any. Clicking a pin (or the hero)
 * opens the feed where it lives.
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
          zIndex: 2,
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

      <div className="intro-grid">
        <div style={{ minWidth: 0 }}>
          <span className="intro-eyebrow">SCJE Student Hub · Introduction</span>
          <h1 style={{ fontSize: "1.5rem" }}>Welcome, {user.name}!</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "1rem", marginTop: "6px" }}>{subtitle}</p>

          {list.length > 0 && (
            <div className="pin-stack">
              {list.map(pin => (
                <div key={`${pin.type}-${pin.id}`} className={`pin-row${pin.image ? " pin-row--media" : ""}`}>
                  {pin.image && <ItemImage src={pin.image} alt={pin.title} kind={pin.type} height={64} />}
                  <div style={{ minWidth: 0 }}>
                    <strong style={{ color: "var(--heading)", fontSize: "1.05rem" }}>{pin.title}</strong>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: "6px 0 0", lineHeight: 1.5 }}>
                      {pin.type === "announcement"
                        ? `${(pin.body || "").slice(0, 160)}${formatTimeRange(pin.time, pin.endTime) ? ` · ⏰ ${formatTimeRange(pin.time, pin.endTime)}` : ""}`
                        : `${pin.date}${pin.location ? ` · ${pin.location}` : ""}`}
                    </p>
                    <span style={{ display: "inline-block", marginTop: "8px", color: "var(--accent)", fontWeight: 700, fontSize: "0.8rem" }}>
                      Open the feed →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="intro-art" aria-hidden="true">
          <span>🎓</span>
        </div>
      </div>
    </section>
  );
}
