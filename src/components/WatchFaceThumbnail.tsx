import { SIMULATED_DATA } from "@/core/data";
import type { Design } from "@/core/schema";
import { cn } from "@/lib/cn";
import { DisplayListSvg } from "./DisplayListSvg";

export function WatchFaceThumbnail({
  design,
  className,
  label,
}: {
  design: Design;
  className?: string;
  label?: string;
}) {
  return (
    <div
      className={cn(
        "relative aspect-square overflow-hidden rounded-md bg-black ring-1 ring-line",
        className
      )}
    >
      <DisplayListSvg design={design} data={SIMULATED_DATA} label={label} />
    </div>
  );
}
