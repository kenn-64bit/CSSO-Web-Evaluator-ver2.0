import { requireRole } from "@/lib/auth/session";
import { RoleHome } from "@/components/RoleHome";

export default async function PresidentHome() {
  await requireRole("president");
  // O-2 default: president-targeted forms have results_visible_to_evaluatee = false;
  // no results dashboard. President still completes a self-evaluation (shown in
  // My Forms) which feeds the admin compilation.
  return (
    <RoleHome
      heading="President"
      intro="Complete your self-evaluation and any evaluation forms assigned to you."
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
