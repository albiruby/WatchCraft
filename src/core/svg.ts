import type { MetricData } from "./data";
import { buildDisplayList, type DisplayCommand } from "./renderer";
import type { Design } from "./schema";

export const FONT_STACK: Record<string, string> = {
  sans: "'Inter', ui-sans-serif, system-ui, sans-serif",
  mono: "'Red Hat Display', ui-sans-serif, system-ui, sans-serif",
  digits: "'Red Hat Display', ui-sans-serif, system-ui, sans-serif",
};

export const FONT_WEIGHT: Record<string, number> = {
  regular: 400,
  medium: 500,
  bold: 700,
};

const round = (value: number) => Math.round(value * 100) / 100;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function arcPath(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  sweepDeg: number
): string {
  const rad = (deg: number) => (deg * Math.PI) / 180;
  const start = {
    x: cx + r * Math.cos(rad(startDeg)),
    y: cy + r * Math.sin(rad(startDeg)),
  };
  const end = {
    x: cx + r * Math.cos(rad(startDeg + sweepDeg)),
    y: cy + r * Math.sin(rad(startDeg + sweepDeg)),
  };
  const large = Math.abs(sweepDeg) > 180 ? 1 : 0;
  const direction = sweepDeg >= 0 ? 1 : 0;

  return `M ${round(start.x)} ${round(start.y)} A ${round(r)} ${round(r)} 0 ${large} ${direction} ${round(end.x)} ${round(end.y)}`;
}

function commandToSvg(command: DisplayCommand): string {
  if (command.kind === "rect") {
    const stroke = command.stroke
      ? ` stroke="${command.stroke}" stroke-width="${command.strokeWidth}"`
      : "";
    return `<rect x="${round(command.x)}" y="${round(command.y)}" width="${round(command.w)}" height="${round(command.h)}" rx="${round(command.radius)}" fill="${command.fill}"${stroke} />`;
  }

  if (command.kind === "circle") {
    const stroke = command.stroke
      ? ` stroke="${command.stroke}" stroke-width="${command.strokeWidth}"`
      : "";
    return `<circle cx="${round(command.cx)}" cy="${round(command.cy)}" r="${round(command.r)}" fill="${command.fill}"${stroke} />`;
  }

  if (command.kind === "arc") {
    return `<path d="${arcPath(command.cx, command.cy, command.r, command.start, command.sweep)}" fill="none" stroke="${command.color}" stroke-width="${command.width}" stroke-linecap="${command.cap}" />`;
  }

  const anchor =
    command.align === "center" ? "middle" : command.align === "right" ? "end" : "start";

  return `<text x="${round(command.x)}" y="${round(command.y)}" fill="${command.color}" font-family="${FONT_STACK[command.family]}" font-size="${round(command.size)}" font-weight="${FONT_WEIGHT[command.weight]}" text-anchor="${anchor}" dominant-baseline="central" letter-spacing="${round(command.tracking)}">${escapeXml(command.text)}</text>`;
}

export function buildStandaloneSvg(
  design: Design,
  data: MetricData,
  options: { size?: number; background?: boolean } = {}
): string {
  const list = buildDisplayList(design, data);
  const size = options.size ?? list.width;
  const background =
    options.background === false
      ? ""
      : `<rect x="0" y="0" width="${list.width}" height="${list.height}" fill="${list.background}" />`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${list.width} ${list.height}" width="${size}" height="${size}" role="img">${background}${list.commands.map(commandToSvg).join("")}</svg>`;
}

export function toSvgDataUri(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
