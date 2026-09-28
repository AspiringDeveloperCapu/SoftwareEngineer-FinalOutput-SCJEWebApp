export type Role = "student" | "instructor" | "admin";

export interface Session {
  id: number;
  email: string;
  name: string;
  role: Role;
  department: string;
  course?: string;
  section?: string;
  year?: string;
  picture?: string;
  birthday?: string;
  gender?: string;
  isFirstTimeLogin?: boolean;
}

export interface NavItem {
  to: string;
  label: string;
  icon: string;
}

const ROLES: Role[] = ["student", "instructor", "admin"];

/**
 * The hierarchy, in one table: admin > instructor > student. Every full-access
 * role sees the same base navigation (the data behind it changes), and the admin
 * tier adds the back office. Nothing else in the app may hard-code a role check -
 * this file is the only place that knows who can do what.
 */
const BASE_LINKS: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: "🏠" },
  { to: "/instructors", label: "Instructors", icon: "👨‍🏫" },
  { to: "/schedule", label: "Schedule", icon: "📅" },
  { to: "/grades", label: "Grades", icon: "🎓" },
  { to: "/events", label: "Events", icon: "📢" }
];

const ADMIN_LINKS: NavItem[] = [
  { to: "/students", label: "Students", icon: "🧑‍🎓" },
  { to: "/manage-events", label: "Manage Events", icon: "🗓️" },
  { to: "/manage-faculty", label: "Manage Faculty", icon: "🗂️" }
];

export const VIEW_ONLY_LINKS: NavItem[] = [{ to: "/events", label: "Events", icon: "📢" }];

export const linksFor = (role: Role): NavItem[] =>
  role === "admin" ? [...BASE_LINKS, ...ADMIN_LINKS] : BASE_LINKS;

/** Routes that only exist for a signed-in, full-access account. */
export const FULL_ACCESS_ROLES: Role[] = ROLES;

export const isAdmin = (role: Role) => role === "admin";

export function getSession(): Session | null {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !ROLES.includes(parsed.role)) return null;
    return parsed as Session;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
}
