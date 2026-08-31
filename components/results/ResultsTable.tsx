import { Table, Th, Td } from "@/components/ui/Table";
import { AliasBadge } from "./AliasBadge";
import type { OfficerResultRow } from "@/lib/queries/officerResults";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function ResultsTable({ rows }: { rows: OfficerResultRow[] }) {
  return (
    <Table
      head={
        <>
          <Th>Evaluator</Th>
          <Th>Total score</Th>
          <Th>Submitted</Th>
        </>
      }
    >
      {rows.map((r) => (
        <tr key={r.submissionId}>
          <Td>
            <AliasBadge alias={r.evaluatorAlias} />
          </Td>
          <Td>{r.totalSum === null ? "—" : r.totalSum}</Td>
          <Td>{formatDate(r.submittedAt)}</Td>
        </tr>
      ))}
    </Table>
  );
}
