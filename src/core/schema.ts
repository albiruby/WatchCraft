import { z } from "zod";

export const CANVAS_SIZE = 390;

const hexColor = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, "Warna harus berformat #RRGGBB");

const elementBase = {
  id: z.string().min(1).max(48),
  x: z.number().min(-200).max(600),
  y: z.number().min(-200).max(600),
  visible: z.boolean().default(true),
  locked: z.boolean().default(false),
};

export const TEXT_METRICS = [
  "label",
  "time",
  "date",
  "battery",
  "steps",
  "heartRate",
  "calories",
  "distance",
  "notifications",
  "weather",
] as const;

export const textElementSchema = z.object({
  ...elementBase,
  type: z.literal("text"),
  metric: z.enum(TEXT_METRICS).default("label"),
  text: z.string().max(40).default(""),
  size: z.number().min(8).max(180).default(32),
  family: z.enum(["sans", "mono", "digits"]).default("mono"),
  weight: z.enum(["regular", "medium", "bold"]).default("medium"),
  color: hexColor.default("#F2F5F9"),
  align: z.enum(["left", "center", "right"]).default("center"),
  tracking: z.number().min(-2).max(8).default(0),
});

export const shapeElementSchema = z.object({
  ...elementBase,
  type: z.literal("shape"),
  shape: z.enum(["rect", "circle"]).default("rect"),
  w: z.number().min(1).max(CANVAS_SIZE),
  h: z.number().min(1).max(CANVAS_SIZE),
  radius: z.number().min(0).max(195).default(0),
  fill: hexColor.default("#141922"),
  stroke: hexColor.nullable().default(null),
  strokeWidth: z.number().min(0).max(16).default(0),
});

export const arcElementSchema = z.object({
  ...elementBase,
  type: z.literal("arc"),
  w: z.number().min(20).max(CANVAS_SIZE),
  h: z.number().min(20).max(CANVAS_SIZE),
  width: z.number().min(1).max(24).default(6),
  track: hexColor.default("#1A2030"),
  color: hexColor.default("#FF7A1A"),
  startAngle: z.number().min(-360).max(360).default(-90),
  sweep: z.number().min(1).max(360).default(270),
  metric: z.enum(["battery", "steps", "heartRate"]).default("battery"),
  max: z.number().min(1).max(100000).default(100),
  cap: z.enum(["butt", "round"]).default("round"),
});

export const elementSchema = z.discriminatedUnion("type", [
  textElementSchema,
  shapeElementSchema,
  arcElementSchema,
]);

export const designSchema = z.object({
  version: z.literal(1),
  id: z.string().min(1).max(64),
  name: z.string().min(1).max(60),
  device: z.literal("fr165").default("fr165"),
  background: hexColor.default("#000000"),
  elements: z.array(elementSchema).max(40).default([]),
  updatedAt: z.string(),
});

export type Design = z.infer<typeof designSchema>;
export type DesignElement = z.infer<typeof elementSchema>;
export type TextElement = z.infer<typeof textElementSchema>;
export type ShapeElement = z.infer<typeof shapeElementSchema>;
export type ArcElement = z.infer<typeof arcElementSchema>;

export function parseDesign(input: unknown): Design {
  return designSchema.parse(input);
}

export function safeParseDesign(
  input: unknown
): { ok: true; design: Design } | { ok: false; message: string } {
  const result = designSchema.safeParse(input);
  if (result.success) return { ok: true, design: result.data };
  const first = result.error.issues[0];
  return {
    ok: false,
    message: first
      ? first.path.length > 0
        ? `${first.path.join(".")}: ${first.message}`
        : first.message
      : "Data desain tidak valid",
  };
}

export function elementTitle(el: DesignElement): string {
  if (el.type === "text") {
    if (el.metric === "label") return el.text || "Text";
    return {
      time: "Time",
      date: "Date",
      battery: "Battery",
      steps: "Steps",
      heartRate: "Heart rate",
      calories: "Calories",
      distance: "Distance",
      notifications: "Notifications",
      weather: "Weather",
    }[el.metric];
  }
  if (el.type === "arc") {
    return { battery: "Battery arc", steps: "Steps arc", heartRate: "Heart rate arc" }[el.metric];
  }
  return el.shape === "circle" ? "Circle" : "Rectangle";
}
