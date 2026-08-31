import Link from "next/link";
import { Card } from "@/components/ui/Card";

interface Shortcut {
  href: string;
  label: string;
  description: string;
}

export function RoleHome({
  heading,
  intro,
  shortcuts,
}: {
  heading: string;
  intro: string;
  shortcuts: Shortcut[];
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900">{heading}</h1>
        <p className="mt-1 text-sm text-neutral-600">{intro}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {shortcuts.map((s) => (
          <Link key={s.href} href={s.href} className="block">
            <Card className="transition-colors hover:border-brand">
              <div className="text-sm font-semibold text-neutral-900">
                {s.label}
              </div>
              <p className="mt-1 text-sm text-neutral-600">{s.description}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
