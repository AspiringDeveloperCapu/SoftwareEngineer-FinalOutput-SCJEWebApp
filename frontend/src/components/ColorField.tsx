import React from "react";
import { SCHEDULE_SWATCHES, isHexColor, subjectStyle } from "../schedule";

interface ColorFieldProps {
  label: string;
  subject: string;
  value: string;
  onChange: (value: string) => void;
}

/**
 * Colour picker for schedule blocks: an "auto" swatch (the colour the subject
 * hashes to), a row of preset hues, and a native custom colour input. Used by
 * both schedule editors - the weekly grid form and the record hub's class form.
 */
export default function ColorField({ label, subject, value, onChange }: ColorFieldProps) {
  const hex = value.toLowerCase();
  const isPreset = SCHEDULE_SWATCHES.includes(hex);
  const customChosen = isHexColor(value) && !isPreset;

  return (
    <span className="sched-color-field">
      <span className="sched-color-label">{label}</span>
      <span className="sched-swatches" role="group" aria-label={label}>
        <button
          type="button"
          className={`sched-swatch${value ? "" : " is-on"}`}
          style={subjectStyle(subject || "?")}
          onClick={() => onChange("")}
          title="Auto - colour chosen by subject"
          aria-pressed={!value}
        >
          A
        </button>
        {SCHEDULE_SWATCHES.map(swatch => (
          <button
            key={swatch}
            type="button"
            className={`sched-swatch${hex === swatch ? " is-on" : ""}`}
            style={{ background: swatch }}
            onClick={() => onChange(swatch)}
            title={swatch}
            aria-label={`Colour ${swatch}`}
            aria-pressed={hex === swatch}
          />
        ))}
        <label
          className={`sched-swatch sched-custom${customChosen ? " is-on" : ""}`}
          title="Pick a custom colour"
          style={customChosen ? { background: value } : undefined}
        >
          <input
            type="color"
            value={isHexColor(value) ? value : "#8A3FFC"}
            onChange={e => onChange(e.target.value)}
            aria-label="Custom colour"
          />
        </label>
        <span className="sched-color-hex">{value || "auto"}</span>
      </span>
    </span>
  );
}
