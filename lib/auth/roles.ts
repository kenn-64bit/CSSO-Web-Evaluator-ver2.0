import type { AppRole } from "@/types/database";

// Spec §3: roles are a LOOKUP, not a hierarchy. There is deliberately no
// ordering here and no `role >= X` anywhere in the codebase.
export const APP_ROLES = [
  "encrypt",
  "officer",
  "executive",
  "president",
  "admin",
] as const satisfies readonly AppRole[];

// Where each role lands after login (spec §4 step 5, §7).
export const ROLE_HOME: Record<AppRole, string> = {
  encrypt: "/encrypt",
  officer: "/officer",
  executive: "/executive",
  president: "/president",
  admin: "/admin",
};

export function isAppRole(value: unknown): value is AppRole {
  return typeof value === "string" && (APP_ROLES as readonly string[]).includes(value);
}

export function homeForRole(role: AppRole): string {
  return ROLE_HOME[role];
}
