import { cn } from "@/lib/cn";

type Tone = "neutral" | "accent" | "ok";

const TONES: Record<Tone, string> = {
  neutral: "border-line text-muted",
  accent: "border-accent/40 text-accent",
  ok: "border-ok/40 text-ok",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "mono inline-flex h-5 items-center rounded border px-1.5 text-[10px] uppercase tracking-[0.14em]",
        TONES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
