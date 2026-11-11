import { metricNumber, metricText, type MetricData } from "./data";
import type { ArcElement, Design, DesignElement, ShapeElement, TextElement } from "./schema";

export type TextFamily = "sans" | "mono" | "digits";
export type TextWeight = "regular" | "medium" | "bold";
export type TextAlign = "left" | "center" | "right";

export type DisplayCommand =
  | {
      kind: "rect";
      x: number;
      y: number;
      w: number;
      h: number;
      radius: number;
      fill: string;
      stroke: string | null;
      strokeWidth: number;
    }
  | {
      kind: "circle";
      cx: number;
      cy: number;
      r: number;
      fill: string;
      stroke: string | null;
      strokeWidth: number;
    }
  | {
      kind: "arc";
      cx: number;
      cy: number;
      r: number;
      start: number;
      sweep: number;
      width: number;
      color: string;
      cap: "butt" | "round";
    }
  | {
      kind: "text";
      x: number;
      y: number;
      text: string;
      size: number;
      family: TextFamily;
      weight: TextWeight;
      color: string;
      align: TextAlign;
      tracking: number;
    };

export type DisplayList = {
  width: number;
  height: number;
  background: string;
  commands: Array<DisplayCommand & { key: number }>;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

function textCommands(el: TextElement, data: MetricData): DisplayCommand[] {
  const lines = metricText(el, data).split("\n");
  const lineHeight = el.size * 1.2;
  const total = lineHeight * lines.length;

  return lines.map((line, index) => ({
    kind: "text" as const,
    x: el.x,
    y: el.y - total / 2 + lineHeight * (index + 0.5),
    text: line,
    size: el.size,
    family: el.family,
    weight: el.weight,
    color: el.color,
    align: el.align,
    tracking: el.tracking,
  }));
}

function shapeCommand(el: ShapeElement): DisplayCommand {
  if (el.shape === "circle") {
    return {
      kind: "circle",
      cx: el.x + el.w / 2,
      cy: el.y + el.h / 2,
      r: Math.min(el.w, el.h) / 2 - el.strokeWidth / 2,
      fill: el.fill,
      stroke: el.stroke,
      strokeWidth: el.strokeWidth,
    };
  }

  return {
    kind: "rect",
    x: el.x,
    y: el.y,
    w: el.w,
    h: el.h,
    radius: el.radius,
    fill: el.fill,
    stroke: el.stroke,
    strokeWidth: el.strokeWidth,
  };
}

function arcCommands(el: ArcElement, data: MetricData): DisplayCommand[] {
  const size = Math.min(el.w, el.h);
  const radius = size / 2 - el.width / 2;
  const cx = el.x + el.w / 2;
  const cy = el.y + el.h / 2;
  const ratio = clamp(metricNumber(el, data) / el.max, 0, 1);

  return [
    {
      kind: "arc",
      cx,
      cy,
      r: radius,
      start: el.startAngle,
      sweep: el.sweep,
      width: el.width,
      color: el.track,
      cap: el.cap,
    },
    {
      kind: "arc",
      cx,
      cy,
      r: radius,
      start: el.startAngle,
      sweep: Math.max(0.01, el.sweep * ratio),
      width: el.width,
      color: el.color,
      cap: el.cap,
    },
  ];
}

function elementCommands(el: DesignElement, data: MetricData): DisplayCommand[] {
  if (el.type === "text") return textCommands(el, data);
  if (el.type === "arc") return arcCommands(el, data);
  return [shapeCommand(el)];
}

export type Bounds = { x: number; y: number; w: number; h: number };

export function elementBounds(el: DesignElement, data: MetricData): Bounds {
  if (el.type === "shape" || el.type === "arc") {
    return { x: el.x, y: el.y, w: el.w, h: el.h };
  }

  const lines = metricText(el, data).split("\n");
  const longest = Math.max(1, ...lines.map((line) => line.length));
  const factor = el.family === "mono" || el.family === "digits" ? 0.62 : 0.55;
  const w = Math.max(
    24,
    longest * el.size * factor + Math.max(0, longest - 1) * el.tracking
  );
  const h = el.size * 1.2 * lines.length;
  const x =
    el.align === "left" ? el.x : el.align === "right" ? el.x - w : el.x - w / 2;

  return { x, y: el.y - h / 2, w, h };
}

export function buildDisplayList(design: Design, data: MetricData): DisplayList {
  const commands = design.elements
    .filter((el) => el.visible)
    .flatMap((el) => elementCommands(el, data))
    .map((command, key) => ({ ...command, key }));

  return {
    width: 390,
    height: 390,
    background: design.background,
    commands,
  };
}
