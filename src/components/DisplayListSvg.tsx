import type { MetricData } from "@/core/data";
import { buildDisplayList, type DisplayCommand } from "@/core/renderer";
import type { Design } from "@/core/schema";
import { FONT_STACK, FONT_WEIGHT, arcPath } from "@/core/svg";
import { cn } from "@/lib/cn";

function CommandView({ command }: { command: DisplayCommand }) {
  if (command.kind === "rect") {
    return (
      <rect
        x={command.x}
        y={command.y}
        width={command.w}
        height={command.h}
        rx={command.radius}
        fill={command.fill}
        stroke={command.stroke ?? undefined}
        strokeWidth={command.stroke ? command.strokeWidth : undefined}
      />
    );
  }

  if (command.kind === "circle") {
    return (
      <circle
        cx={command.cx}
        cy={command.cy}
        r={command.r}
        fill={command.fill}
        stroke={command.stroke ?? undefined}
        strokeWidth={command.stroke ? command.strokeWidth : undefined}
      />
    );
  }

  if (command.kind === "arc") {
    return (
      <path
        d={arcPath(command.cx, command.cy, command.r, command.start, command.sweep)}
        fill="none"
        stroke={command.color}
        strokeWidth={command.width}
        strokeLinecap={command.cap}
      />
    );
  }

  return (
    <text
      x={command.x}
      y={command.y}
      fill={command.color}
      fontFamily={FONT_STACK[command.family]}
      fontSize={command.size}
      fontWeight={FONT_WEIGHT[command.weight]}
      textAnchor={
        command.align === "center" ? "middle" : command.align === "right" ? "end" : "start"
      }
      dominantBaseline="central"
      letterSpacing={command.tracking}
    >
      {command.text}
    </text>
  );
}

export function DisplayListSvg({
  design,
  data,
  className,
  label,
}: {
  design: Design;
  data: MetricData;
  className?: string;
  label?: string;
}) {
  const list = buildDisplayList(design, data);

  return (
    <svg
      viewBox={`0 0 ${list.width} ${list.height}`}
      className={cn("block h-full w-full", className)}
      role="img"
      aria-label={label ?? `Preview ${design.name}`}
    >
      <rect width={list.width} height={list.height} fill={list.background} />
      {list.commands.map((command) => (
        <CommandView key={command.key} command={command} />
      ))}
    </svg>
  );
}
