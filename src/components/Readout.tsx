import { cn } from "@/lib/cn";

// Pembacaan instrumen: label kecil di atas, angka tabular besar, satuan kecil.
// Garis tick di atasnya mengulang motif bezel.
export function Readout({
  label,
  value,
  unit,
  className,
  size = "md",
}: {
  label: string;
  value: React.ReactNode;
  unit?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <div className={cn("min-w-0 border-t border-line-strong pt-2", className)}>
      <dt className="text-[11px] text-muted">{label}</dt>
      <dd
        className={cn(
          "mt-1 truncate font-display tabular-nums font-semibold tracking-tight text-ink",
          size === "lg" ? "text-[34px] leading-none" : size === "md" ? "text-[22px] leading-none" : "text-[15px]"
        )}
      >
        {value}
        {unit ? <span className="ml-1 text-[11px] font-normal text-muted">{unit}</span> : null}
      </dd>
    </div>
  );
}
