import Link from "next/link";
import { getSession } from "@/lib/auth";
import { LogoutButton } from "./LogoutButton";

export async function AppHeader() {
  const session = await getSession();

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="text-lg font-bold tracking-tight text-brand">Qualiseed</span>
          <span className="text-sm text-muted">Farm Intelligence Portal</span>
        </Link>

        {session && (
          <nav className="flex items-center gap-4 sm:gap-6">
            {session.role === "AGENT" && (
              <Link href="/entry" className="text-sm font-medium hover:text-brand transition-colors">
                Entry
              </Link>
            )}
            {session.role === "ADMIN" && (
              <>
                <Link href="/dashboard" className="text-sm font-medium hover:text-brand transition-colors">
                  Dashboard
                </Link>
                <Link href="/dashboard/agents" className="text-sm font-medium hover:text-brand transition-colors">
                  Agents
                </Link>
                <Link href="/dashboard/settings" className="text-sm font-medium hover:text-brand transition-colors">
                  Settings
                </Link>
              </>
            )}
            <span className="hidden text-sm text-muted sm:inline">{session.name}</span>
            <LogoutButton />
          </nav>
        )}
      </div>
    </header>
  );
}
