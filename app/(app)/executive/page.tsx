import { requireRole } from "@/lib/auth/session";
import { RoleHome } from "@/components/RoleHome";

export default async function ExecutiveHome() {
  await requireRole("executive");
  // O-2 default: executives have forms to fill out but no results dashboard.
  return (
    <RoleHome
      heading="Executive"
      intro="Complete the evaluation forms assigned to you for the active cycle."
      shortcuts={[
        {
          href: "/forms",
          label: "My Forms",
          description: "Pending evaluations you need to fill out.",
        },
      ]}
    />
  );
}
