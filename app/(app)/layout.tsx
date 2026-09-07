import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { homeForRole } from "@/lib/auth/roles";
import { SignOutButton } from "@/components/SignOutButton";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="min-h-screen">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <nav className="flex items-center gap-4 text-sm">
            <Link href={homeForRole(user.role)} className="font-semibold">
              Evaluator
            </Link>
            <Link href="/forms" className="text-neutral-600 hover:text-neutral-900">
              My Forms
            </Link>
            {user.role === "officer" ? (
              <Link
                href="/officer/results"
                className="text-neutral-600 hover:text-neutral-900"
              >
                My Results
              </Link>
            ) : null}
            {user.role === "admin" ? (
              <>
                <Link
                  href="/admin/results"
                  className="text-neutral-600 hover:text-neutral-900"
                >
                  All Results
                </Link>
                <Link
                  href="/admin/forms"
                  className="text-neutral-600 hover:text-neutral-900"
                >
                  Forms
                </Link>
                <Link
                  href="/admin/roster"
                  className="text-neutral-600 hover:text-neutral-900"
                >
                  Roster
                </Link>
                <Link
                  href="/admin/cycles"
                  className="text-neutral-600 hover:text-neutral-900"
                >
                  Cycles
                </Link>
              </>
            ) : null}
          </nav>
          <div className="flex items-center gap-3 text-sm text-neutral-500">
            <span className="hidden sm:inline">
              {user.email} · {user.role}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
