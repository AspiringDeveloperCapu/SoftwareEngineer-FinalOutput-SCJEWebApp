import React from "react";

export interface PendingImport {
  name: string;
  count: number;
  skips: number;
  run: () => Promise<void> | void;
}

// Confirmation step between "file picked" and "rows written": shows what the
// file holds (and how much of it will be skipped) with an explicit Confirm.
export default function ImportConfirm({
  pending,
  onCancel
}: {
  pending: PendingImport | null;
  onCancel: () => void;
}) {
  if (!pending) return null;
  return (
    <div
      className="card"
      style={{ padding: "12px 16px", margin: "0 0 16px", display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}
    >
      <span style={{ color: "var(--text)", fontSize: "0.9rem" }}>
        Import <strong style={{ color: "var(--heading)" }}>{pending.name}</strong>? {pending.count} row
        {pending.count === 1 ? "" : "s"} ready
        {pending.skips > 0 ? `, ${pending.skips} will be skipped` : ""}.
      </span>
      <button
        type="button"
        className="login-btn"
        style={{ padding: "8px 16px", fontSize: "0.9rem" }}
        onClick={() => {
          const run = pending.run;
          onCancel();
          void run();
        }}
      >
        Confirm import
      </button>
      <button
        type="button"
        onClick={onCancel}
        style={{
          padding: "8px 16px",
          borderRadius: "8px",
          border: "1px solid var(--border-strong)",
          backgroundColor: "var(--surface)",
          color: "var(--text)",
          cursor: "pointer",
          fontWeight: 600
        }}
      >
        Cancel
      </button>
    </div>
  );
}
