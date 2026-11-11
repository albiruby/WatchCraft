"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { createBlankDesign } from "@/core/templates";
import { cn } from "@/lib/cn";
import { createId, saveDesign } from "@/lib/storage";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "./ui/Button";
import { Plus } from "./icons";

const NAV = [
  { href: "/", label: "Designs" },
  { href: "/templates", label: "Templates" },
  { href: "/library", label: "Library" },
  { href: "/settings", label: "Settings" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLinks({ vertical = false }: { vertical?: boolean }) {
  const pathname = usePathname();

  return (
    <>
      {NAV.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative flex h-11 items-center px-3 text-[13px] font-medium transition-colors",
              active ? "text-ink" : "text-muted hover:text-ink",
              !vertical && "h-14"
            )}
          >
            {item.label}
            <span
              className={cn(
                "absolute inset-x-2 bottom-0 h-px transition-colors",
                active ? "bg-accent" : "bg-transparent"
              )}
            />
          </Link>
        );
      })}
    </>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  function handleNewDesign() {
    const id = createId();
    const design = createBlankDesign("Untitled", id);
    saveDesign(design);
    router.push(`/studio/${id}`);
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 border-b border-line bg-page">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5" aria-label="WATCHCRAFT, ke halaman designs">
            <span className="grid size-8 place-items-center rounded-md border border-line bg-raised">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="8" stroke="var(--line-strong)" strokeWidth="2" />
                <path d="M12 4a8 8 0 0 1 6.9 12" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
                <circle cx="12" cy="12" r="2.4" fill="var(--accent)" />
              </svg>
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-display text-[13px] font-bold tracking-[0.16em]">WATCHCRAFT</span>
              <span className="mono mt-1 text-[9px] uppercase tracking-[0.18em] text-faint">
                FR165 studio
              </span>
            </span>
          </Link>

          <nav className="hidden h-14 items-stretch md:flex" aria-label="Navigasi utama">
            <NavLinks />
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="primary" size="sm" onClick={handleNewDesign}>
              <Plus size={15} />
              <span className="hidden sm:inline">Watch face</span>
              <span className="sm:hidden">Baru</span>
            </Button>
          </div>
        </div>

        <div className="border-t border-line md:hidden">
          <nav
            className="scroll-slim mx-auto flex max-w-6xl overflow-x-auto px-2"
            aria-label="Navigasi utama"
          >
            <NavLinks vertical />
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        {children}
      </main>

      <footer className="border-t border-line">
        <div className="mono mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-[10px] text-faint sm:px-6">
          <span>WATCHCRAFT / Forerunner 165</span>
          <span>Data lokal</span>
        </div>
      </footer>
    </div>
  );
}
