import type { ReactNode } from "react";

export function Card({
  title,
  children,
  className = "",
}: {
  title?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-lg border border-neutral-200 bg-white p-5 shadow-sm ${className}`}
    >
      {title ? (
        <h2 className="mb-3 text-sm font-semibold text-neutral-700">{title}</h2>
      ) : null}
      {children}
    </div>
  );
}
