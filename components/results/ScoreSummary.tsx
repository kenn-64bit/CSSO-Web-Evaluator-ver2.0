import { Card } from "@/components/ui/Card";

export function ScoreSummary({
  count,
  average,
}: {
  count: number;
  average: number | null;
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card title="Responses">
        <div className="text-2xl font-semibold text-neutral-900">{count}</div>
      </Card>
      <Card title="Average total score">
        <div className="text-2xl font-semibold text-neutral-900">
          {average === null ? "—" : average.toFixed(1)}
        </div>
      </Card>
    </div>
  );
}
