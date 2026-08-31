// Renders the per-cycle alias an officer sees in place of an evaluator's
// identity. There is deliberately no prop for a real name / id / email here.
export function AliasBadge({ alias }: { alias: string }) {
  return (
    <span className="inline-block rounded bg-neutral-100 px-2 py-0.5 font-mono text-xs text-neutral-700">
      {alias}
    </span>
  );
}
