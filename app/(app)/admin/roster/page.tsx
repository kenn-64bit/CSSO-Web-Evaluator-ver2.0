import { requireRole } from "@/lib/auth/session";
import { getRoster } from "@/lib/queries/roster";
import { Table, Th, Td } from "@/components/ui/Table";

export const metadata = { title: "Roster · Evaluator" };

export default async function AdminRosterPage() {
  await requireRole("admin");
  const roster = await getRoster();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900">Roster</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Read-only. Add, deactivate, or change roles in Supabase Studio — this
          view never writes.
        </p>
      </div>

      <Table
        head={
          <>
            <Th>Name</Th>
            <Th>Email</Th>
            <Th>Role</Th>
            <Th>Department</Th>
            <Th>Active</Th>
          </>
        }
      >
        {roster.map((r) => (
          <tr key={r.id}>
            <Td>{r.fullName}</Td>
            <Td>{r.email}</Td>
            <Td>{r.role}</Td>
            <Td>{r.department ?? "—"}</Td>
            <Td>{r.isActive ? "Yes" : "No"}</Td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
