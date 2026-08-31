import { requireRole } from "@/lib/auth/session";
import { getAllResults } from "@/lib/queries/adminResults";
import { Table, Th, Td } from "@/components/ui/Table";
import { Card } from "@/components/ui/Card";

export const metadata = { title: "All Results · Evaluator" };

export default async function AdminResultsPage() {
  await requireRole("admin");
  const rows = await getAllResults();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900">All Results</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Every submission, full text, real identities. {rows.length} total.
        </p>
      </div>

      {rows.length === 0 ? (
        <Card>
          <p className="text-sm text-neutral-600">No submissions yet.</p>
        </Card>
      ) : (
        <Table
          head={
            <>
              <Th>Form</Th>
              <Th>Evaluator</Th>
              <Th>Evaluatee</Th>
              <Th>Score</Th>
              <Th>Answers</Th>
            </>
          }
        >
          {rows.map((r) => (
            <tr key={r.submissionId}>
              <Td>
                <div className="font-medium">{r.formTitle}</div>
                <div className="text-xs text-neutral-500">{r.formCode}</div>
              </Td>
              <Td>
                <div>{r.evaluatorName}</div>
                <div className="text-xs text-neutral-500">{r.evaluatorEmail}</div>
              </Td>
              <Td>{r.evaluateeName}</Td>
              <Td>{r.totalSum === null ? "—" : r.totalSum}</Td>
              <Td>
                <ul className="space-y-1">
                  {r.answers.map((a, i) => (
                    <li key={i} className="text-xs">
                      <span className="text-neutral-500">{a.prompt}: </span>
                      <span className="text-neutral-800">
                        {a.valueText ?? a.valueNumeric ?? "—"}
                      </span>
                    </li>
                  ))}
                </ul>
              </Td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
