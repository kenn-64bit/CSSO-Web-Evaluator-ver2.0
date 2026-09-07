import type { FormQuestion, ScaleOption } from "@/lib/queries/forms";

// A form's shared rating scale, rendered as one scorecard across all its Likert
// questions. The submitted value is the option_key (stored in answers.value_text);
// the weight is resolved server-side at score time, never sent from the client.

const optionLabel = (key: string) => (key === "N_O" ? "N/O" : key);
const fieldName = (q: FormQuestion) => `q:${q.id}`;
const rowId = (q: FormQuestion) => `rating-row-${q.id}`;
const colId = (o: ScaleOption) => `rating-col-${o.optionKey}`;

export function RatingMatrix({
  questions,
  options,
}: {
  questions: FormQuestion[];
  options: ScaleOption[];
}) {
  if (questions.length === 0) return null;

  if (options.length === 0) {
    return (
      <p className="text-sm text-neutral-500">
        No rating scale is configured for this form.
      </p>
    );
  }

  return (
    <div>
      <p className="mb-3 text-xs text-neutral-500">
        Rate 1 (lowest) to 4 (highest). Choose N/O if you haven&rsquo;t observed
        it.
      </p>

      {/* Desktop: aligned matrix */}
      <div className="hidden overflow-hidden rounded-lg border border-neutral-200 md:block">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-brand-subtle">
              <th className="w-auto px-4 py-2.5" />
              {options.map((o) => (
                <th
                  key={o.optionKey}
                  id={colId(o)}
                  scope="col"
                  className="w-14 border-l border-neutral-200 px-2 py-2.5 text-center font-mono text-xs font-semibold tabular-nums text-neutral-600"
                >
                  {optionLabel(o.optionKey)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {questions.map((q) => (
              <tr key={q.id}>
                <th
                  id={rowId(q)}
                  scope="row"
                  className="px-4 py-3 text-left align-top text-sm/6 font-normal text-neutral-800"
                >
                  <span className="mr-3 font-mono tabular-nums text-neutral-400">
                    {q.orderIndex + 1}
                  </span>
                  {q.prompt}
                  {q.isRequired ? (
                    <span className="ml-1 text-red-500" aria-hidden="true">
                      *
                    </span>
                  ) : null}
                </th>
                {options.map((o) => (
                  <td
                    key={o.optionKey}
                    className="border-l border-neutral-200 p-0 text-center"
                  >
                    <label className="flex h-14 cursor-pointer items-center justify-center transition-colors motion-reduce:transition-none hover:bg-neutral-50 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-inset has-[:focus-visible]:ring-brand has-[:checked]:bg-brand-muted">
                      <input
                        type="radio"
                        name={fieldName(q)}
                        value={o.optionKey}
                        required={q.isRequired}
                        aria-labelledby={`${rowId(q)} ${colId(o)}`}
                        className="h-5 w-5 accent-brand focus:outline-none"
                      />
                    </label>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: one compact matrix card per question */}
      <div className="space-y-6 md:hidden">
        {questions.map((q) => (
          <div key={q.id}>
            <p
              id={`${rowId(q)}-m`}
              className="flex gap-2 text-sm/6 text-neutral-800"
            >
              <span className="font-mono tabular-nums text-neutral-400">
                {q.orderIndex + 1}
              </span>
              <span>
                {q.prompt}
                {q.isRequired ? (
                  <span className="ml-1 text-red-500" aria-hidden="true">
                    *
                  </span>
                ) : null}
              </span>
            </p>
            <div
              role="radiogroup"
              aria-labelledby={`${rowId(q)}-m`}
              className="mt-2 flex overflow-hidden rounded-lg border border-neutral-200"
            >
              {options.map((o) => (
                <label
                  key={o.optionKey}
                  className="flex flex-1 cursor-pointer flex-col items-center gap-2 border-l border-neutral-200 py-4 transition-colors first:border-l-0 motion-reduce:transition-none hover:bg-neutral-50 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-inset has-[:focus-visible]:ring-brand has-[:checked]:bg-brand-muted"
                >
                  <span className="font-mono text-xs tabular-nums text-neutral-500">
                    {optionLabel(o.optionKey)}
                  </span>
                  <input
                    type="radio"
                    name={fieldName(q)}
                    value={o.optionKey}
                    required={q.isRequired}
                    aria-label={o.optionKey === "N_O" ? "Not observed" : o.optionKey}
                    className="h-5 w-5 accent-brand focus:outline-none"
                  />
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
