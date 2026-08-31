"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

// All three call SECURITY DEFINER RPCs that re-check role === 'admin' in the
// database (0013), so a stale session cannot drive them.

export async function setCycleActive(cycleId: string, makeActive: boolean) {
  await requireRole("admin");
  const supabase = await createClient();
  await supabase.rpc("set_active_cycle", {
    target_cycle: cycleId,
    make_active: makeActive,
  });
  revalidatePath("/admin/cycles");
}

export async function regenerateAliases(cycleId: string) {
  await requireRole("admin");
  const supabase = await createClient();
  await supabase.rpc("regenerate_aliases", { target_cycle: cycleId });
  revalidatePath("/admin/cycles");
}

export async function refreshScores() {
  await requireRole("admin");
  const supabase = await createClient();
  await supabase.rpc("refresh_submission_scores");
  revalidatePath("/admin/results");
}
