"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/cn";

// Motif identitas WATCHCRAFT: skala 60 tick seperti bezel jam, dibentangkan lurus.
// Tick oranye adalah detik sekarang, sama dengan jarum detik di template analog.
export function SecondsRule({ className }: { className?: string }) {
  const [second, setSecond] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setSecond(new Date().getSeconds());
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <svg
      viewBox="0 0 600 8"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={cn("block h-2 w-full", className)}
    >
      {Array.from({ length: 60 }, (_, i) => {
        const x = 5 + i * 10;
        const major = i % 5 === 0;
        const active = second === i;
        return (
          <line
            // biome-ignore lint/suspicious/noArrayIndexKey: posisi tick tetap, indeks adalah identitasnya.
            key={i}
            x1={x}
            x2={x}
            y1={active ? 0 : major ? 2 : 5}
            y2={8}
            stroke={active ? "var(--accent)" : major ? "var(--line-strong)" : "var(--line)"}
            strokeWidth={active ? 2 : 1}
            vectorEffect="non-scaling-stroke"
          />
        );
      })}
    </svg>
  );
}

export function LiveClock({ className }: { className?: string }) {
  const [now, setNow] = useState<string | null>(null);

  useEffect(() => {
    const tick = () =>
      setNow(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <time className={cn("mono text-[11px] text-muted", className)} suppressHydrationWarning>
      {now ?? "--:--"}
    </time>
  );
}
