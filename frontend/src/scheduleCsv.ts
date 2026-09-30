// Minimal CSV helpers for the schedule: export the timetable to a spreadsheet
// file and import one back. Header names are matched tolerantly because the
// CSV we eventually receive may spell columns differently.
import { parseRange, formatRange } from "./schedule";

// Keep times in the same "7:30 AM - 9:00 AM" shape the rest of the system
// uses; unparseable values pass through untouched (the grid shows those in
// its fallback list instead of guessing).
const normTime = (raw: string) => {
  const range = parseRange(raw);
  return range ? formatRange(range[0], range[1]) : raw;
};

export interface ImportRow {
  student?: string;
  email?: string;
  section?: string;
  day: string;
  time: string;
  subject: string;
  room?: string;
  instructor?: string;
  color?: string;
}

export interface ImportResult {
  rows: ImportRow[];
  errors: string[];
}

export function parseCsv(text: string): string[][] {
  const src = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"') {
        if (src[i + 1] === '"') { cell += '"'; i++; }
        else quoted = false;
      } else cell += ch;
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += ch;
  }
  if (cell !== "" || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter(r => r.some(c => c.trim() !== ""));
}

const cellCsv = (v: string | number) => {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function buildCsv(headers: string[], rows: Array<Array<string | number>>): string {
  return [headers, ...rows].map(r => r.map(cellCsv).join(",")).join("\r\n") + "\r\n";
}

const key = (s: string) => s.toLowerCase().replace(/[^a-z]/g, "");

const ALIASES: Record<string, string[]> = {
  student: ["student", "name", "studentname", "learner", "account"],
  email: ["email", "mail", "studentemail"],
  section: ["section", "sec"],
  day: ["day", "weekday"],
  time: ["time", "hours", "schedule"],
  start: ["start", "starttime", "from", "begin"],
  end: ["end", "endtime", "to", "finish"],
  subject: ["subject", "course", "class", "classname", "subjectname", "code"],
  room: ["room", "venue", "location", "classroom"],
  instructor: ["instructor", "teacher", "prof", "professor", "faculty"],
  color: ["color", "colour", "blockcolor"]
};

const POSITIONAL = ["student", "email", "section", "day", "time", "subject", "room", "instructor", "color"];

const normDay = (raw: string) => {
  const t = (raw || "").trim().toLowerCase();
  if (!t) return "";
  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  const hit = days.find(d => d === t || d.startsWith(t));
  if (!hit) return (raw || "").trim();
  return hit.charAt(0).toUpperCase() + hit.slice(1);
};

// A whole table in, importable rows out: header detected when at least two
// known column names appear, otherwise a fixed column order is assumed.
export function mapImportTable(text: string): ImportResult {
  const table = parseCsv(text);
  const errors: string[] = [];
  if (table.length === 0) return { rows: [], errors: ["The file is empty."] };

  const header = table[0].map(key);
  const findCol = (field: string) => header.findIndex(h => ALIASES[field].includes(h));
  const cols: Record<string, number> = {};
  let matched = 0;
  for (const field of Object.keys(ALIASES)) {
    const idx = findCol(field);
    cols[field] = idx;
    if (idx >= 0) matched++;
  }
  const hasHeader = matched >= 2;

  const col = (field: string, cells: string[], explicit?: number) => {
    const idx = explicit ?? cols[field];
    return idx >= 0 && idx < cells.length ? (cells[idx] || "").trim() : "";
  };

  const body = hasHeader ? table.slice(1) : table;
  const rows: ImportRow[] = [];

  body.forEach((cells, i) => {
    const line = hasHeader ? i + 2 : i + 1;
    const get = (field: string) =>
      hasHeader ? col(field, cells) : col(field, cells, POSITIONAL.indexOf(field));

    const start = get("start");
    const end = get("end");
    const time = normTime(get("time") || (start && end ? `${start} - ${end}` : ""));
    const row: ImportRow = {
      student: get("student"),
      email: get("email"),
      section: get("section"),
      day: normDay(get("day")),
      time,
      subject: get("subject"),
      room: get("room"),
      instructor: get("instructor"),
      color: get("color")
    };
    if (!row.day) { errors.push(`Row ${line}: no day.`); return; }
    if (!row.subject) { errors.push(`Row ${line}: no subject.`); return; }
    if (!row.time) { errors.push(`Row ${line}: no time.`); return; }
    if (!row.student && !row.email && !row.section) {
      errors.push(`Row ${line}: needs a student, email or section.`);
      return;
    }
    rows.push(row);
  });

  if (hasHeader && cols.day < 0 && cols.subject < 0) {
    errors.unshift("No day/subject column found — check the file's headers.");
  }
  return { rows, errors };
}
