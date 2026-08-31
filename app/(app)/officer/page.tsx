import { requireRole } from "@/lib/auth/session";
import { RoleHome } from "@/components/RoleHome";

export default async function OfficerHome() {
  await requireRole("officer");
  return (
    <RoleHome
      heading="Officer"
      intro="Fill out your assigned evaluations and review aliased feedback about yourself."
      shortcuts={[
        {
          href: "/forms",
          label: "My Forms",
          description: "Pending evaluations you need to fill out.",
        },
        {
          href: "/officer/results",
          label: "My Results",
          description:
            "Feedback about you, with each evaluator shown only as a per-cycle alias.",
        },
      ]}
    />
  );
}
