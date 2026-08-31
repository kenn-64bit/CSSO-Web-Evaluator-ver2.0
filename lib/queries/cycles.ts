import { createClient } from "@/lib/supabase/server";

export interface Cycle {
  id: string;
  name: string;
  opensAt: string;
  closesAt: string;
  isActive: boolean;
}

export async function getActiveCycle(): Promise<Cycle | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("evaluation_cycles")
    .select("id, name, opens_at, closes_at, is_active")
    .eq("is_active", true)
    .maybeSingle();

  if (!data) return null;
  return {
    id: data.id,
    name: data.name,
    opensAt: data.opens_at,
    closesAt: data.closes_at,
    isActive: data.is_active,
  };
}

export async function listCycles(): Promise<Cycle[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("evaluation_cycles")
    .select("id, name, opens_at, closes_at, is_active")
    .order("opens_at", { ascending: false });

  return (data ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    opensAt: c.opens_at,
    closesAt: c.closes_at,
    isActive: c.is_active,
  }));
}
