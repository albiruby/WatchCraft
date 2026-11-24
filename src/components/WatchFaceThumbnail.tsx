import { SIMULATED_DATA, type MetricData } from "@/core/data";
import type { Design } from "@/core/schema";
import { cn } from "@/lib/cn";
import { DisplayListSvg } from "./DisplayListSvg";

export function WatchFaceThumbnail({
  design,
  className,
  label,
  data = SIMULATED_DATA,
}: {
  design: Design;
  className?: string;
  label?: string;
  data?: MetricData;
}) {
  return (
    <div
      className={cn(
        "relative aspect-square overflow-hidden rounded-md bg-black ring-1 ring-line",
        className
      )}
    >
      <DisplayListSvg design={design} data={data} label={label} />
    </div>
  );
}
