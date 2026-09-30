// Shared maths for the weekly timetable: parsing the stored "7:30 AM - 9:00 AM"
// strings, formatting them back, packing overlapping classes into side-by-side
// columns, and giving every subject a stable colour.

export interface ClassRow {
  day: string;
  time: string;
  subject: string;
  room: string;
  instructor: string;
  color?: string;
  student?: string;
  section?: string;
}

export const DAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const toMinutes = (raw: string, meridiem?: string) => {
  const [hRaw, mRaw] = raw.split(":");
  let h = parseInt(hRaw, 10);
  const m = parseInt((mRaw || "0").slice(0, 2), 10);
  const mer = (meridiem || "").toUpperCase();
  if (mer === "PM" && h < 12) h += 12;
  if (mer === "AM" && h === 12) h = 0;
  if (!mer && h < 7) h += 12; // "1:00" in a schedule means the afternoon
  return h * 60 + m;
};

// "7:30 AM - 9:00 AM", "13:00-14:30", "9:00 AM to 10:30 AM" → [start, end].
// Returns null for anything unparseable so the page can fall back instead of
// placing a block at a nonsense position.
export function parseRange(time: string): [number, number] | null {
  const match = time.match(
    /(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?)\s*(?:-|–|—|to)\s*(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?)/
  );
  if (!match) return null;
  const num = (part: string) => {
    const m = part.trim().match(/^(\d{1,2}:\d{2})\s*(AM|PM|am|pm)?$/);
    if (!m) return null;
    return toMinutes(m[1], m[2]);
  };
  const start = num(match[1]);
  const end = num(match[2]);
  if (start === null || end === null || end <= start) return null;
  return [start, end];
}

export function formatMinutes(min: number): string {
  const h24 = Math.floor(min / 60);
  const m = min % 60;
  const mer = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${mer}`;
}

export function formatRange(start: number, end: number): string {
  return `${formatMinutes(start)} - ${formatMinutes(end)}`;
}

// Greedy column packing: classes that overlap share the row's width, everyone
// else takes the full column. Returns each item's 0-based column and the total
// columns its overlap group needs.
export function packOverlaps<T extends { start: number; end: number }>(
  items: T[]
): Array<{ item: T; col: number; cols: number }> {
  const sorted = [...items].sort((a, b) => a.start - b.start || b.end - a.end);
  const placed: Array<{ item: T; col: number }> = [];
  const groups: Array<Array<{ item: T; col: number }>> = [];

  let group: Array<{ item: T; col: number }> = [];
  let groupEnd = -1;
  const flush = () => {
    if (group.length) groups.push(group);
    group = [];
    groupEnd = -1;
  };

  for (const item of sorted) {
    if (item.start >= groupEnd && group.length) flush();
    const used = new Set(group.filter(g => g.item.end > item.start).map(g => g.col));
    let col = 0;
    while (used.has(col)) col++;
    group.push({ item, col });
    groupEnd = Math.max(groupEnd, item.end);
    placed.push({ item, col });
  }
  flush();

  const colsOf = new Map<T, number>();
  for (const g of groups) {
    const cols = Math.max(...g.map(x => x.col)) + 1;
    for (const x of g) colsOf.set(x.item, cols);
  }
  return placed.map(({ item, col }) => ({ item, col, cols: colsOf.get(item) || 1 }));
}

const PALETTE = [
  { bg: "var(--accent-solid)", fg: "#ffffff" },
  { bg: "var(--gold)", fg: "var(--on-gold)" },
  { bg: "var(--brand)", fg: "var(--on-brand)" },
  { bg: "var(--success-solid)", fg: "#ffffff" }
];

export function subjectStyle(subject: string): React.CSSProperties {
  let hash = 0;
  for (let i = 0; i < subject.length; i++) hash = (hash * 31 + subject.charCodeAt(i)) >>> 0;
  const c = PALETTE[hash % PALETTE.length];
  return { backgroundColor: c.bg, color: c.fg };
}

// Swatches offered in the schedule colour pickers (identity-adjacent hues).
export const SCHEDULE_SWATCHES = [
  "#E11D48",
  "#FF3D6E",
  "#8A3FFC",
  "#6D28D9",
  "#F97316",
  "#F59E0B",
  "#10B981",
  "#0EA5E9"
];

export const isHexColor = (value?: string) => /^#[0-9a-fA-F]{6}$/.test(value || "");

// Black or white text, whichever contrasts better with the chosen colour.
export function readableFg(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const lin = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const l = 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
  return l < 0.18 ? "#ffffff" : "#0B0B0D";
}

// A class block's colours: the picked colour when the row has one, otherwise
// the stable colour the subject hashes to.
export function classStyle(row: Pick<ClassRow, "subject" | "color">): React.CSSProperties {
  if (row.color && isHexColor(row.color)) {
    return { backgroundColor: row.color, color: readableFg(row.color) };
  }
  return subjectStyle(row.subject);
}

// "1-A" and "1A" are the same section spelled two ways in the roster.
export const normSection = (section?: string) => (section || "").replace(/-/g, "").trim().toUpperCase();
