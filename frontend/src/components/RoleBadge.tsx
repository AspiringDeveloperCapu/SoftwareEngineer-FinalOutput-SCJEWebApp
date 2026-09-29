import React from "react";

export type RoleName = "admin" | "instructor" | "student";

/** Colour pairing per role - used by the header account menu and the Accounts table. */
export const ROLE_STYLE: Record<string, { background: string; color: string }> = {
  admin: { background: "var(--gold)", color: "var(--on-gold)" },
  instructor: { background: "var(--accent-solid)", color: "var(--on-brand)" },
  student: { background: "var(--on-brand)", color: "var(--brand-strong)" }
};

export const ROLE_LABEL: Record<RoleName, string> = {
  student: "Student",
  instructor: "Instructor",
  admin: "Administrator"
};

export default function RoleBadge({ role }: { role: RoleName }) {
  const style = ROLE_STYLE[role] || ROLE_STYLE.student;
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 10px",
        borderRadius: "99px",
        fontSize: "0.7rem",
        fontWeight: 800,
        letterSpacing: "0.6px",
        backgroundColor: style.background,
        border: "1px solid var(--border-strong)",
        color: style.color,
        whiteSpace: "nowrap"
      }}
    >
      {(ROLE_LABEL[role] || role).toUpperCase()}
    </span>
  );
}
