import { metricNumber, metricText, type MetricData } from "./data";
import type {
  ArcElement,
  Design,
  DesignElement,
  HandsElement,
  ShapeElement,
  TextElement,
  TicksElement,
} from "./schema";

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
      kind: "line";
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      width: number;
      color: string;
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

// Sudut 0 di arah jam 12, searah jarum jam. Native memakai rumus yang sama.
export function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  // Dibulatkan supaya hasil trigonometri server dan browser identik (tanpa hydration mismatch).
  const round = (value: number) => Math.round(value * 100) / 100;
  return { x: round(cx + Math.sin(rad) * r), y: round(cy - Math.cos(rad) * r) };
}

function ticksCommands(el: TicksElement): DisplayCommand[] {
  const cx = el.x + el.w / 2;
  const cy = el.y + el.h / 2;
  const outer = Math.min(el.w, el.h) / 2;
  const out: DisplayCommand[] = [];

  for (let i = 0; i < el.count; i += 1) {
    const major = i % el.majorEvery === 0;
    const deg = (i * 360) / el.count;
    const len = major ? el.majorLength : el.length;
    const width = major ? el.majorWidth : el.width;
    const a = polar(cx, cy, outer - width / 2, deg);
    const b = polar(cx, cy, Math.max(0, outer - len), deg);
    out.push({
      kind: "line",
      x1: a.x,
      y1: a.y,
      x2: b.x,
      y2: b.y,
      width,
      color: major ? el.majorColor : el.color,
    });
  }

  return out;
}

export function handAngles(data: MetricData) {
  return {
    hour: ((data.hour % 12) + data.minute / 60) * 30,
    minute: (data.minute + data.second / 60) * 6,
    second: data.second * 6,
  };
}

function handsCommands(el: HandsElement, data: MetricData, aod: boolean): DisplayCommand[] {
  const cx = el.x + el.w / 2;
  const cy = el.y + el.h / 2;
  const radius = Math.min(el.w, el.h) / 2;
  const angles = handAngles(data);
  const hand = (deg: number, lengthPct: number, width: number, color: string): DisplayCommand => {
    const tail = polar(cx, cy, radius * 0.1, deg + 180);
    const tip = polar(cx, cy, (radius * lengthPct) / 100, deg);
    return { kind: "line", x1: tail.x, y1: tail.y, x2: tip.x, y2: tip.y, width, color };
  };

  const out: DisplayCommand[] = [
    hand(angles.hour, el.hourLength, el.hourWidth, el.hourColor),
    hand(angles.minute, el.minuteLength, el.minuteWidth, el.minuteColor),
  ];
  // Jarum detik tidak digambar di mode always-on: jam hanya update tiap menit.
  if (el.secondWidth > 0 && !aod) {
    out.push(hand(angles.second, el.secondLength, el.secondWidth, el.secondColor));
  }
  if (el.hub > 0) {
    out.push({
      kind: "circle",
      cx,
      cy,
      r: el.hub,
      fill: el.hubColor,
      stroke: null,
      strokeWidth: 0,
    });
  }
  return out;
}

function elementCommands(el: DesignElement, data: MetricData, aod: boolean): DisplayCommand[] {
  if (el.type === "text") return textCommands(el, data);
  if (el.type === "arc") return arcCommands(el, data);
  if (el.type === "ticks") return ticksCommands(el);
  if (el.type === "hands") return handsCommands(el, data, aod);
  return [shapeCommand(el)];
}

export type Bounds = { x: number; y: number; w: number; h: number };

export function elementBounds(el: DesignElement, data: MetricData): Bounds {
  if (el.type !== "text") {
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

export type RenderOptions = {
  // Mode always-on: hanya elemen bertanda aod yang digambar, latar selalu hitam.
  aod?: boolean;
};

export function buildDisplayList(
  design: Design,
  data: MetricData,
  options: RenderOptions = {}
): DisplayList {
  const aod = options.aod ?? false;
  const commands = design.elements
    .filter((el) => el.visible && (!aod || el.aod))
    .flatMap((el) => elementCommands(el, data, aod))
    .map((command, key) => ({ ...command, key }));

  return {
    width: 390,
    height: 390,
    background: aod ? "#000000" : design.background,
    commands,
  };
}
