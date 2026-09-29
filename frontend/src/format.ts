/**
 * Small display helpers. Events carry `date` (YYYY-MM-DD) and now `time` /
 * `endTime` (HH:MM, the value an <input type="time"> produces), so every
 * screen formats them the same way.
 */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "14:05" → "2:05 PM". Returns the input untouched if it is not a clock time. */
export function formatTime(hhmm?: string): string | null {
  if (!hhmm) return null;
  const [hRaw, mRaw] = hhmm.split(":");
  const h = Number(hRaw);
  if (!Number.isFinite(h)) return hhmm;
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${mRaw || "00"} ${suffix}`;
}

/** "2026-10-15" → "Oct 15, 2026". */
export function formatDate(iso?: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

/** "8:00 AM – 11:00 AM", or a single time, or null when nothing is set. */
export function formatTimeRange(time?: string, endTime?: string): string | null {
  const start = formatTime(time);
  const end = formatTime(endTime);
  if (start && end) return `${start} – ${end}`;
  return start || end || null;
}

/** "Oct 15, 2026 · 8:00 AM – 11:00 AM" — the full "when" line for an event. */
export function formatWhen(date?: string, time?: string, endTime?: string): string {
  const day = formatDate(date);
  const range = formatTimeRange(time, endTime);
  if (day && range) return `${day} · ${range}`;
  return day || range || "";
}

/** Sorts by date first, then by start time, so a same-day order is stable. */
export function byWhen(a: { date?: string; time?: string }, b: { date?: string; time?: string }): number {
  const byDate = (a.date || "").localeCompare(b.date || "");
  if (byDate !== 0) return byDate;
  return (a.time || "").localeCompare(b.time || "");
}
