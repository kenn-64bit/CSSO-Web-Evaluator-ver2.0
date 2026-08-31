import type { FormQuestion, ScaleOption } from "@/lib/queries/forms";
import { LikertScale } from "./LikertScale";

export function QuestionRenderer({
  question,
  scaleOptions,
}: {
  question: FormQuestion;
  scaleOptions: ScaleOption[];
}) {
  const name = `q:${question.id}`;

  return (
    <div className="border-b border-neutral-100 py-4 last:border-b-0">
      <label className="text-sm font-medium text-neutral-800" htmlFor={name}>
        {question.prompt}
        {question.isRequired ? (
          <span className="ml-1 text-red-500">*</span>
        ) : null}
      </label>

      {question.kind === "likert" || question.kind === "scale" ? (
        <LikertScale
          name={name}
          options={scaleOptions}
          required={question.isRequired}
        />
      ) : (
        <textarea
          id={name}
          name={name}
          required={question.isRequired}
          rows={3}
          className="mt-2 w-full rounded-md border border-neutral-300 p-2 text-sm focus:border-brand focus:outline-none"
        />
      )}
    </div>
  );
}
