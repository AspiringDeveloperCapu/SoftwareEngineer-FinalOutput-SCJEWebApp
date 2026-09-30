// CSV helpers for the MIS data sets: student/staff accounts (the roster) and
// grades. Same tolerant style as scheduleCsv — headers are matched loosely
// because the file we eventually receive may spell columns differently.
import { parseCsv, buildCsv } from "./scheduleCsv";

export { parseCsv, buildCsv };

const key = (s: string) => s.toLowerCase().replace(/[^a-z]/g, "");

const num = (raw: string) => {
  const s = String(raw).replace(/[^0-9.-]/g, "");
  // Number("") and Number(".") are 0 — treat "no digits at all" as missing.
  if (s === "" || s === "-" || s === ".") return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
};

// ---------------------------------------------------------------------------
// Accounts (roster)

export interface AccountRow {
  id?: string;
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  department?: string;
  course?: string;
  section?: string;
  year?: string;
}

const ACCOUNT_ALIASES: Record<string, string[]> = {
  id: ["id", "studentid", "studentno", "studentnumber", "no", "number", "lrn"],
  name: ["name", "studentname", "fullname", "learner"],
  email: ["email", "mail", "schoolemail", "studentemail"],
  password: ["password", "pass", "pw"],
  role: ["role", "type", "usertype", "position"],
  department: ["department", "dept"],
  course: ["course", "program", "programcourse"],
  section: ["section", "sec", "group"],
  year: ["year", "yearlevel", "level"]
};

const ACCOUNT_POSITIONAL = ["id", "name", "email", "role", "course", "section", "year", "department", "password"];

const normRole = (raw: string): string => {
  const t = key(raw);
  if (t.startsWith("admin")) return "admin";
  if (t.startsWith("teach") || t.startsWith("instruct") || t === "faculty" || t.startsWith("prof")) return "instructor";
  return "student";
};

// MIS sheets spell programs every which way; collapse the known ones to the
// two strings the app uses, pass anything else through untouched.
const normProgram = (raw: string): string => {
  const t = key(raw);
  if (!t) return "";
  if (t.includes("crim")) return "BS Criminology";
  if (t.includes("security") || t.includes("ism")) return "BS Industrial Security Management";
  return raw.trim();
};

interface Detected {
  cols: Record<string, number>;
  hasHeader: boolean;
}

const detect = (header: string[], aliases: Record<string, string[]>): Detected => {
  const cols: Record<string, number> = {};
  let matched = 0;
  for (const field of Object.keys(aliases)) {
    const idx = header.findIndex(h => aliases[field].includes(h));
    cols[field] = idx;
    if (idx >= 0) matched++;
  }
  return { cols, hasHeader: matched >= 2 };
};

export interface MappedRows<T> {
  rows: T[];
  errors: string[];
}

// A whole roster table in, importable rows out. A row needs some way to
// identify the account: an email, an id, or a name (optionally + section).
export function mapAccountsTable(text: string): MappedRows<AccountRow> {
  const table = parseCsv(text);
  const errors: string[] = [];
  if (table.length === 0) return { rows: [], errors: ["The file is empty."] };

  const { cols, hasHeader } = detect(table[0].map(key), ACCOUNT_ALIASES);
  const body = hasHeader ? table.slice(1) : table;
  const rows: AccountRow[] = [];

  body.forEach((cells, i) => {
    const line = hasHeader ? i + 2 : i + 1;
    const get = (field: string) => {
      const idx = hasHeader ? cols[field] : ACCOUNT_POSITIONAL.indexOf(field);
      return idx >= 0 && idx < cells.length ? (cells[idx] || "").trim() : "";
    };
    const role = get("role");
    const row: AccountRow = {
      id: get("id"),
      name: get("name"),
      email: get("email"),
      password: get("password"),
      role: role ? normRole(role) : undefined,
      department: get("department"),
      course: normProgram(get("course")),
      section: get("section"),
      year: get("year")
    };
    if (!row.name && !row.email && !row.id) {
      errors.push(`Row ${line}: needs a name, email or id.`);
      return;
    }
    rows.push(row);
  });

  if (hasHeader && cols.name < 0 && cols.email < 0 && cols.id < 0) {
    errors.unshift("No name/email/id column found — check the file's headers.");
  }
  return { rows, errors };
}

// ---------------------------------------------------------------------------
// Grades

export interface GradeRow {
  id?: string;
  student?: string;
  email?: string;
  code: string;
  description: string;
  units: number;
  midterm: number;
  finals: number;
  grade: number;
}

const GRADE_ALIASES: Record<string, string[]> = {
  id: ["id", "studentid", "studentno", "studentnumber"],
  student: ["student", "name", "studentname", "learner"],
  email: ["email", "mail", "schoolemail", "studentemail"],
  code: ["code", "coursecode", "subjectcode", "subject", "course"],
  description: ["description", "coursename", "subjectname", "descriptive"],
  units: ["units", "unit", "credits"],
  midterm: ["midterm", "midtermgrade", "mid", "prelim", "prelimgrade"],
  finals: ["finals", "finalsgrade", "final"],
  grade: ["grade", "finalgrade", "generalaverage", "gwa", "average"]
};

const GRADE_POSITIONAL = ["student", "email", "code", "description", "units", "midterm", "finals", "grade"];

// A grades table in: every row must say whose record it is (student, email or
// id), which course it belongs to (code), and the numeric grade.
export function mapGradesTable(text: string): MappedRows<GradeRow> {
  const table = parseCsv(text);
  const errors: string[] = [];
  if (table.length === 0) return { rows: [], errors: ["The file is empty."] };

  const { cols, hasHeader } = detect(table[0].map(key), GRADE_ALIASES);
  const body = hasHeader ? table.slice(1) : table;
  const rows: GradeRow[] = [];

  body.forEach((cells, i) => {
    const line = hasHeader ? i + 2 : i + 1;
    const get = (field: string) => {
      const idx = hasHeader ? cols[field] : GRADE_POSITIONAL.indexOf(field);
      return idx >= 0 && idx < cells.length ? (cells[idx] || "").trim() : "";
    };
    const row: GradeRow = {
      id: get("id"),
      student: get("student"),
      email: get("email"),
      code: get("code"),
      description: get("description"),
      units: num(get("units")) ?? 3,
      midterm: num(get("midterm")) ?? 0,
      finals: num(get("finals")) ?? 0,
      grade: num(get("grade")) ?? NaN
    };
    if (!row.code) { errors.push(`Row ${line}: no course code.`); return; }
    if (!Number.isFinite(row.grade)) { errors.push(`Row ${line}: grade is not a number.`); return; }
    if (!row.student && !row.email && !row.id) {
      errors.push(`Row ${line}: needs a student, email or id.`);
      return;
    }
    rows.push(row);
  });

  if (hasHeader && cols.student < 0 && cols.email < 0 && cols.id < 0 && cols.code >= 0) {
    errors.unshift("No student column found — check the file's headers.");
  }
  return { rows, errors };
}
