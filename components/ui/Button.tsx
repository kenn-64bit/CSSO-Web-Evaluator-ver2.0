import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary";
type Size = "md" | "lg";

const styles: Record<Variant, string> = {
  primary: "bg-brand text-brand-fg hover:bg-brand-dark disabled:opacity-50",
  secondary:
    "bg-white text-neutral-800 border border-neutral-300 hover:bg-neutral-50",
};

const sizes: Record<Size, string> = {
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-3 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
}) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md font-medium transition-colors motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${sizes[size]} ${styles[variant]} ${className}`}
      {...props}
    />
  );
}
