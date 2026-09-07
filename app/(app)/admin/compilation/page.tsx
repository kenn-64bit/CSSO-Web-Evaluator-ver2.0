import { requireRole } from "@/lib/auth/session";
import { getCompilation } from "@/lib/queries/adminCompilation";
import { Table, Th, Td } from "@/components/ui/Table";
import { Card } from "@/components/ui/Card";

export const metadata = { title: "Compilation · Evaluator" };

const fmt = (n: number | null) => (n === null ? "—" : n.toFixed(2));

export default async function AdminCompilationPage() {
  await requireRole("admin");
  const rows = await getCompilation();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900">Compilation</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Per-person results for the active cycle, under each person&rsquo;s
          codename. Category scores and the final score are on a 0–4 scale;
          the final blends self / officer / encrypt evaluations by the configured
          weights. Scores reflect the last score refresh.
        </p>
      </div>

      {rows.length === 0 ? (
        <Card>
          <p className="text-sm text-neutral-600">
            Nothing to compile yet for the active cycle.
          </p>
        </Card>
      ) : (
        <Table
          head={
            <>
              <Th>Codename</Th>
              <Th>Name</Th>
              <Th>Role</Th>
              <Th>Self</Th>
              <Th>Officer eval</Th>
              <Th>Encrypt eval</Th>
              <Th>Final</Th>
              <Th>Band</Th>
            </>
          }
        >
          {rows.map((r) => (
            <tr key={r.userId}>
              <Td>
                <span className="font-mono text-xs">{r.aliasCode}</span>
              </Td>
              <Td>{r.fullName}</Td>
              <Td>
                <span className="capitalize">{r.role}</span>
              </Td>
              <Td>{fmt(r.selfScore)}</Td>
              <Td>{fmt(r.officerScore)}</Td>
              <Td>{fmt(r.encryptScore)}</Td>
              <Td>
                <span className="font-semibold">{fmt(r.finalScore)}</span>
              </Td>
              <Td>{r.band ?? "—"}</Td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
