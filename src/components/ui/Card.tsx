import type { HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-lg border border-line bg-panel", className)}
      {...props}
    />
  );
}

export function CardHeader({
  title,
  meta,
  action,
}: {
  title: string;
  meta?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex h-11 items-center justify-between gap-3 border-b border-line px-4">
      <div className="flex items-baseline gap-2.5">
        <h2 className="text-[13px] font-medium tracking-wide">{title}</h2>
        {meta ? (
          <span className="text-[11px] text-faint">{meta}</span>
        ) : null}
      </div>
      {action}
    </div>
  );
}
