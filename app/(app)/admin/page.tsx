import { requireRole } from "@/lib/auth/session";
import { RoleHome } from "@/components/RoleHome";

export default async function AdminHome() {
  await requireRole("admin");
  return (
    <RoleHome
      heading="Administrator"
      intro="Full visibility into every submission, plus cycle and alias management."
      shortcuts={[
        {
          href: "/admin/results",
          label: "All Results",
          description: "Every submission, full text, real identities.",
        },
        {
          href: "/admin/roster",
          label: "Roster",
          description: "Read-only. Membership is edited in Supabase Studio.",
        },
        {
          href: "/admin/forms",
          label: "Forms",
          description:
            "Read-only. All form definitions, questions, and scoring weights.",
        },
        {
          href: "/admin/cycles",
          label: "Cycles",
          description: "Open or close a cycle, regenerate aliases, refresh scores.",
        },
        {
          href: "/forms",
          label: "My Forms",
          description: "Any evaluations assigned directly to you.",
        },
      ]}
    />
  );
}
