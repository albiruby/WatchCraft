"use client";

import { useNow } from "@/lib/clock";
import { cn } from "@/lib/cn";

// Versi melingkar dari motif SecondsRule: layar jam bulat dikelilingi bezel 60 tick,
// tick oranye adalah detik sekarang.
export function BezelDial({
  children,
  className,
  live = true,
}: {
  children: React.ReactNode;
  className?: string;
  live?: boolean;
}) {
  const now = useNow(live);
  const second = now ? now.getSeconds() : null;

  return (
    <div className={cn("relative aspect-square", className)}>
      <svg viewBox="0 0 200 200" aria-hidden="true" className="absolute inset-0 h-full w-full">
        {Array.from({ length: 60 }, (_, i) => {
          const major = i % 5 === 0;
          const active = second === i;
          const rad = (i * 6 * Math.PI) / 180;
          const outer = 99;
          const inner = active ? 89 : major ? 92 : 95;
          const r = (value: number) => Math.round(value * 100) / 100;
          return (
            <line
              // biome-ignore lint/suspicious/noArrayIndexKey: posisi tick tetap, indeks adalah identitasnya.
              key={i}
              x1={r(100 + Math.sin(rad) * outer)}
              y1={r(100 - Math.cos(rad) * outer)}
              x2={r(100 + Math.sin(rad) * inner)}
              y2={r(100 - Math.cos(rad) * inner)}
              stroke={active ? "var(--accent)" : major ? "var(--ink)" : "var(--line-strong)"}
              strokeWidth={active ? 1.6 : major ? 1.2 : 0.7}
              strokeLinecap="round"
            />
          );
        })}
      </svg>
      <div className="absolute inset-[8.5%] overflow-hidden rounded-full bg-black ring-1 ring-line">
        {children}
      </div>
    </div>
  );
}
