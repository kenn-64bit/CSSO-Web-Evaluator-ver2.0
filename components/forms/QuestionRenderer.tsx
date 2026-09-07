import type { FormQuestion } from "@/lib/queries/forms";

// Free-text questions (`text` / `choice`). Likert/`scale` questions are rendered
// together by RatingMatrix, not here.
export function QuestionRenderer({ question }: { question: FormQuestion }) {
  const name = `q:${question.id}`;

  return (
    <div>
      <label
        htmlFor={name}
        className="text-sm font-semibold text-neutral-800"
      >
        {question.prompt}
        {question.isRequired ? (
          <span className="ml-1 text-red-500" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>
      <textarea
        id={name}
        name={name}
        required={question.isRequired}
        rows={4}
        className="mt-2 w-full rounded-lg border border-neutral-300 p-3 text-sm text-neutral-900 transition-colors motion-reduce:transition-none placeholder:text-neutral-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
      />
    </div>
  );
}
