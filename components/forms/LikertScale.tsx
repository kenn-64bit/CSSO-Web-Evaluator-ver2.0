import type { ScaleOption } from "@/lib/queries/forms";

// A likert question renders its form's shared rating scale. The submitted value
// is the option_key (stored in answers.value_text) — the weight is resolved
// server-side at score time, never sent from the client.
export function LikertScale({
  name,
  options,
  required,
}: {
  name: string;
  options: ScaleOption[];
  required: boolean;
}) {
  return (
    <fieldset className="mt-2 flex flex-wrap gap-2">
      {options.map((o) => (
        <label
          key={o.optionKey}
          className="flex cursor-pointer items-center gap-1.5 rounded-md border border-neutral-300 px-3 py-1.5 text-sm has-[:checked]:border-brand has-[:checked]:bg-brand-muted"
        >
          <input
            type="radio"
            name={name}
            value={o.optionKey}
            required={required}
            className="accent-brand"
          />
          {o.optionKey === "N_O" ? "N/O" : o.optionKey}
        </label>
      ))}
    </fieldset>
  );
}
