import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { homeForRole } from "@/lib/auth/roles";

// Spec §7: reads the role and redirects to that role's home route.
export default async function DashboardPage() {
  const user = await requireUser();
  redirect(homeForRole(user.role));
}
