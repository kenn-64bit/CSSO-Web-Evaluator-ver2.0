import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AppRole } from "@/types/database";

export interface RosterEntry {
  id: string;
  email: string;
  fullName: string;
  role: AppRole;
  department: string | null;
  isActive: boolean;
}

// Read-only roster view for admins (spec §7: edits happen in Supabase Studio).
// Caller MUST have passed requireRole('admin').
export async function getRoster(): Promise<RosterEntry[]> {
  const db = createAdminClient();
  const { data } = await db
    .from("roster")
    .select("id, email, full_name, role, department, is_active")
    .order("full_name", { ascending: true });

  return (data ?? []).map((r) => ({
    id: r.id,
    email: r.email,
    fullName: r.full_name,
    role: r.role,
    department: r.department,
    isActive: r.is_active,
  }));
}
