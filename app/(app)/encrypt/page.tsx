import { requireRole } from "@/lib/auth/session";
import { RoleHome } from "@/components/RoleHome";

export default async function EncryptHome() {
  await requireRole("encrypt");
  return (
    <RoleHome
      heading="Encrypt"
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
