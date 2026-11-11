"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/cn";
import { Moon, Sun } from "./icons";

const KEY = "watchcraft-theme";
type Theme = "dark" | "light";

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    setTheme(current === "light" ? "light" : "dark");
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      window.localStorage.setItem(KEY, next);
    } catch {
      // Preferensi tidak tersimpan, tema tetap berlaku untuk sesi ini.
    }
  }

  const label = theme === "dark" ? "Aktifkan mode terang" : "Aktifkan mode gelap";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={cn(
        "grid size-9 place-items-center rounded-md border border-line bg-raised text-muted transition-colors hover:border-line-strong hover:text-ink",
        className
      )}
    >
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
