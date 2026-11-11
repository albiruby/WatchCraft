import { designSchema, type Design } from "./schema";

const STAMP = "2026-11-11T00:00:00.000Z";

export type Template = {
  id: string;
  name: string;
  description: string;
  tags: string[];
  design: Design;
};

function build(input: unknown): Design {
  return designSchema.parse(input);
}

const monoField = build({
  version: 1,
  id: "tpl-mono-field",
  name: "Mono Field",
  updatedAt: STAMP,
  elements: [
    { id: "e-date", type: "text", x: 195, y: 112, metric: "date", size: 13, color: "#7C8698" },
    {
      id: "e-ring",
      type: "arc",
      x: 55,
      y: 55,
      w: 280,
      h: 280,
      width: 3,
      track: "#1B2230",
      color: "#FF7A1A",
      metric: "battery",
      sweep: 360,
    },
    { id: "e-time", type: "text", x: 195, y: 190, metric: "time", size: 74, family: "digits", weight: "bold" },
    { id: "e-batt-label", type: "text", x: 195, y: 292, metric: "label", text: "BATTERY", size: 10, tracking: 3, color: "#6B7484" },
    { id: "e-steps", type: "text", x: 195, y: 322, metric: "steps", size: 18, color: "#F5F7FA" },
  ],
});

const terminal = build({
  version: 1,
  id: "tpl-terminal",
  name: "Terminal",
  updatedAt: STAMP,
  elements: [
    { id: "e-brand", type: "text", x: 64, y: 92, metric: "label", text: "WATCHCRAFT", size: 10, align: "left", tracking: 3, color: "#FF7A1A" },
    { id: "e-time", type: "text", x: 64, y: 168, metric: "time", size: 62, family: "digits", weight: "bold", align: "left" },
    { id: "e-date", type: "text", x: 64, y: 214, metric: "date", size: 13, align: "left", color: "#7C8698" },
    { id: "e-rule", type: "shape", x: 64, y: 246, w: 262, h: 1, fill: "#232B38" },
    { id: "e-steps", type: "text", x: 64, y: 282, metric: "steps", size: 18, align: "left" },
    { id: "e-steps-label", type: "text", x: 64, y: 306, metric: "label", text: "STEPS", size: 9, align: "left", tracking: 2, color: "#6B7484" },
    { id: "e-hr", type: "text", x: 326, y: 282, metric: "heartRate", size: 18, align: "right" },
    { id: "e-hr-label", type: "text", x: 326, y: 306, metric: "label", text: "HEART", size: 9, align: "right", tracking: 2, color: "#6B7484" },
  ],
});

const arcGuard = build({
  version: 1,
  id: "tpl-arc-guard",
  name: "Arc Guard",
  updatedAt: STAMP,
  elements: [
    {
      id: "e-battery-arc",
      type: "arc",
      x: 38,
      y: 38,
      w: 314,
      h: 314,
      width: 7,
      track: "#161C27",
      color: "#FF7A1A",
      metric: "battery",
      startAngle: 120,
      sweep: 300,
    },
    {
      id: "e-steps-arc",
      type: "arc",
      x: 58,
      y: 58,
      w: 274,
      h: 274,
      width: 2,
      track: "#232B38",
      color: "#3D4A60",
      metric: "steps",
      max: 10000,
      sweep: 360,
    },
    { id: "e-time", type: "text", x: 195, y: 178, metric: "time", size: 56, family: "digits", weight: "bold" },
    { id: "e-date", type: "text", x: 195, y: 226, metric: "date", size: 11, color: "#8A93A3" },
    { id: "e-steps-label", type: "text", x: 195, y: 258, metric: "label", text: "STEPS", size: 9, tracking: 3, color: "#6B7484" },
    { id: "e-steps", type: "text", x: 195, y: 286, metric: "steps", size: 15 },
  ],
});

const split = build({
  version: 1,
  id: "tpl-split",
  name: "Split",
  updatedAt: STAMP,
  elements: [
    { id: "e-label", type: "text", x: 195, y: 92, metric: "label", text: "TIME", size: 9, tracking: 3, color: "#6B7484" },
    { id: "e-time", type: "text", x: 195, y: 140, metric: "time", size: 54, family: "digits", weight: "bold" },
    { id: "e-rule", type: "shape", x: 155, y: 182, w: 80, h: 1, fill: "#FF7A1A" },
    { id: "e-date", type: "text", x: 195, y: 212, metric: "date", size: 12, color: "#8A93A3" },
    { id: "e-hr", type: "text", x: 195, y: 268, metric: "heartRate", size: 38, family: "digits" },
    { id: "e-hr-label", type: "text", x: 195, y: 302, metric: "label", text: "HEART RATE", size: 9, tracking: 2, color: "#6B7484" },
  ],
});

const pulse = build({
  version: 1,
  id: "tpl-pulse",
  name: "Pulse",
  updatedAt: STAMP,
  elements: [
    {
      id: "e-battery-arc",
      type: "arc",
      x: 145,
      y: 58,
      w: 100,
      h: 100,
      width: 3,
      track: "#1B2230",
      color: "#FF7A1A",
      metric: "battery",
      sweep: 360,
    },
    { id: "e-hr", type: "text", x: 195, y: 180, metric: "heartRate", size: 66, family: "digits", weight: "bold", color: "#FF7A1A" },
    { id: "e-label", type: "text", x: 195, y: 230, metric: "label", text: "BPM", size: 10, tracking: 3, color: "#8A93A3" },
    { id: "e-time", type: "text", x: 195, y: 300, metric: "time", size: 26 },
    { id: "e-date", type: "text", x: 195, y: 330, metric: "date", size: 10, color: "#6B7484" },
  ],
});

const quiet = build({
  version: 1,
  id: "tpl-quiet",
  name: "Quiet",
  updatedAt: STAMP,
  elements: [
    {
      id: "e-arc",
      type: "arc",
      x: 25,
      y: 25,
      w: 340,
      h: 340,
      width: 2,
      track: "#1A2029",
      color: "#FF7A1A",
      metric: "battery",
      startAngle: -120,
      sweep: 60,
    },
    { id: "e-time", type: "text", x: 195, y: 196, metric: "time", size: 92, family: "digits", weight: "bold" },
    { id: "e-date", type: "text", x: 195, y: 268, metric: "date", size: 11, tracking: 2, color: "#6B7484" },
  ],
});

const cadence = build({
  version: 1,
  id: "tpl-cadence",
  name: "Cadence",
  updatedAt: STAMP,
  elements: [
    { id: "e-steps-label", type: "text", x: 195, y: 120, metric: "label", text: "STEPS", size: 10, tracking: 3, color: "#6B7484" },
    {
      id: "e-arc",
      type: "arc",
      x: 55,
      y: 45,
      w: 300,
      h: 300,
      width: 3,
      track: "#1A2029",
      color: "#FF7A1A",
      metric: "steps",
      max: 10000,
      startAngle: 130,
      sweep: 280,
    },
    { id: "e-steps", type: "text", x: 195, y: 178, metric: "steps", size: 54, family: "digits", weight: "bold" },
    { id: "e-time", type: "text", x: 195, y: 300, metric: "time", size: 26 },
    { id: "e-date", type: "text", x: 195, y: 330, metric: "date", size: 10, color: "#6B7484" },
  ],
});

const ledger = build({
  version: 1,
  id: "tpl-ledger",
  name: "Ledger",
  updatedAt: STAMP,
  elements: [
    { id: "e-time", type: "text", x: 195, y: 108, metric: "time", size: 58, family: "digits", weight: "bold" },
    { id: "e-date", type: "text", x: 195, y: 156, metric: "date", size: 12, color: "#8A93A3" },
    { id: "e-rule-1", type: "shape", x: 70, y: 186, w: 250, h: 1, fill: "#232B38" },
    { id: "e-cal-label", type: "text", x: 120, y: 212, metric: "label", text: "CAL", size: 9, tracking: 2, color: "#6B7484" },
    { id: "e-cal", type: "text", x: 120, y: 236, metric: "calories", size: 16 },
    { id: "e-km-label", type: "text", x: 270, y: 212, metric: "label", text: "KM", size: 9, tracking: 2, color: "#6B7484" },
    { id: "e-km", type: "text", x: 270, y: 236, metric: "distance", size: 16 },
    { id: "e-rule-2", type: "shape", x: 70, y: 262, w: 250, h: 1, fill: "#232B38" },
    { id: "e-floor-label", type: "text", x: 120, y: 288, metric: "label", text: "FLR", size: 9, tracking: 2, color: "#6B7484" },
    { id: "e-floor", type: "text", x: 120, y: 312, metric: "floors", size: 16 },
    { id: "e-active-label", type: "text", x: 270, y: 288, metric: "label", text: "ACTIVE", size: 9, tracking: 2, color: "#6B7484" },
    { id: "e-active", type: "text", x: 270, y: 312, metric: "activeMinutes", size: 16 },
  ],
});

const beacon = build({
  version: 1,
  id: "tpl-beacon",
  name: "Beacon",
  updatedAt: STAMP,
  elements: [
    {
      id: "e-arc",
      type: "arc",
      x: 35,
      y: 35,
      w: 320,
      h: 320,
      width: 8,
      track: "#1A2029",
      color: "#FF7A1A",
      metric: "battery",
      startAngle: 120,
      sweep: 300,
    },
    { id: "e-battery", type: "text", x: 195, y: 160, metric: "battery", size: 72, family: "digits", weight: "bold" },
    { id: "e-label", type: "text", x: 195, y: 222, metric: "label", text: "BATTERY", size: 10, tracking: 3, color: "#8A93A3" },
    { id: "e-time", type: "text", x: 195, y: 308, metric: "time", size: 22 },
    { id: "e-date", type: "text", x: 195, y: 336, metric: "date", size: 10, color: "#6B7484" },
  ],
});

const orbit = build({
  version: 1,
  id: "tpl-orbit",
  name: "Orbit",
  updatedAt: STAMP,
  elements: [
    {
      id: "e-battery",
      type: "arc",
      x: 30,
      y: 30,
      w: 330,
      h: 330,
      width: 4,
      track: "#1A2029",
      color: "#FF7A1A",
      metric: "battery",
      startAngle: 105,
      sweep: 330,
    },
    {
      id: "e-steps",
      type: "arc",
      x: 60,
      y: 60,
      w: 270,
      h: 270,
      width: 3,
      track: "#161C27",
      color: "#5A6B85",
      metric: "steps",
      max: 10000,
      startAngle: 105,
      sweep: 330,
    },
    {
      id: "e-hr",
      type: "arc",
      x: 90,
      y: 90,
      w: 210,
      h: 210,
      width: 2,
      track: "#141A24",
      color: "#FF7A1A",
      metric: "heartRate",
      max: 200,
      startAngle: 105,
      sweep: 330,
    },
    { id: "e-time", type: "text", x: 195, y: 195, metric: "time", size: 46, family: "digits", weight: "bold" },
    { id: "e-date", type: "text", x: 195, y: 238, metric: "date", size: 10, color: "#8A93A3" },
  ],
});

const horizon = build({
  version: 1,
  id: "tpl-horizon",
  name: "Horizon",
  updatedAt: STAMP,
  elements: [
    { id: "e-alt-label", type: "text", x: 195, y: 82, metric: "label", text: "ALT", size: 9, tracking: 3, color: "#6B7484" },
    { id: "e-alt", type: "text", x: 195, y: 104, metric: "altitude", size: 13, color: "#FF7A1A" },
    { id: "e-time", type: "text", x: 195, y: 200, metric: "time", size: 84, family: "digits", weight: "bold" },
    { id: "e-date", type: "text", x: 195, y: 272, metric: "date", size: 10, tracking: 2, color: "#6B7484" },
  ],
});

const focus = build({  version: 1,
  id: "tpl-focus",
  name: "Focus",
  updatedAt: STAMP,
  elements: [
    {
      id: "e-hr-arc",
      type: "arc",
      x: 70,
      y: 70,
      w: 250,
      h: 250,
      width: 6,
      track: "#1A2029",
      color: "#FF7A1A",
      metric: "heartRate",
      max: 200,
      startAngle: 120,
      sweep: 300,
    },
    { id: "e-hr", type: "text", x: 195, y: 192, metric: "heartRate", size: 56, family: "digits", weight: "bold", color: "#FF7A1A" },
    { id: "e-label", type: "text", x: 195, y: 236, metric: "label", text: "BPM", size: 9, tracking: 3, color: "#8A93A3" },
    { id: "e-time", type: "text", x: 195, y: 306, metric: "time", size: 24 },
    { id: "e-date", type: "text", x: 195, y: 334, metric: "date", size: 10, color: "#6B7484" },
  ],
});

const fieldPace = build({
  version: 1,
  id: "tpl-field-pace",
  name: "Pace Panel",
  kind: "datafield",
  updatedAt: STAMP,
  elements: [
    { id: "e-label", type: "text", x: 195, y: 104, metric: "label", text: "PACE", size: 11, tracking: 3, color: "#8A93A3" },
    { id: "e-pace", type: "text", x: 195, y: 190, metric: "pace", size: 72, family: "digits", weight: "bold" },
    { id: "e-rule", type: "shape", x: 85, y: 248, w: 220, h: 1, fill: "#232B38" },
    { id: "e-distance", type: "text", x: 120, y: 290, metric: "distance", size: 22 },
    { id: "e-timer", type: "text", x: 270, y: 290, metric: "timer", size: 22 },
    { id: "e-hr", type: "text", x: 195, y: 340, metric: "heartRate", size: 14, color: "#FF7A1A" },
  ],
});

const fieldStack = build({
  version: 1,
  id: "tpl-field-stack",
  name: "Run Stack",
  kind: "datafield",
  updatedAt: STAMP,
  elements: [
    { id: "e-dist-label", type: "text", x: 195, y: 84, metric: "label", text: "DISTANCE", size: 10, tracking: 3, color: "#6B7484" },
    { id: "e-distance", type: "text", x: 195, y: 128, metric: "distance", size: 40, family: "digits", weight: "bold" },
    { id: "e-rule", type: "shape", x: 70, y: 172, w: 250, h: 1, fill: "#232B38" },
    { id: "e-time-label", type: "text", x: 195, y: 206, metric: "label", text: "TIME", size: 10, tracking: 3, color: "#6B7484" },
    { id: "e-timer", type: "text", x: 195, y: 250, metric: "timer", size: 40, family: "digits" },
    { id: "e-rule-2", type: "shape", x: 70, y: 292, w: 250, h: 1, fill: "#232B38" },
    { id: "e-hr", type: "text", x: 195, y: 330, metric: "heartRate", size: 16, color: "#FF7A1A" },
  ],
});

const fieldSplit = build({
  version: 1,
  id: "tpl-field-split",
  name: "Split Field",
  kind: "datafield",
  updatedAt: STAMP,
  elements: [
    { id: "e-pace-label", type: "text", x: 118, y: 112, metric: "label", text: "PACE", size: 10, tracking: 3, color: "#6B7484" },
    { id: "e-pace", type: "text", x: 118, y: 168, metric: "pace", size: 32, family: "digits", weight: "bold" },
    { id: "e-hr-label", type: "text", x: 272, y: 112, metric: "label", text: "HEART", size: 10, tracking: 3, color: "#6B7484" },
    { id: "e-hr", type: "text", x: 272, y: 168, metric: "heartRate", size: 32, family: "digits", color: "#FF7A1A" },
    { id: "e-rule", type: "shape", x: 60, y: 222, w: 270, h: 1, fill: "#232B38" },
    { id: "e-distance", type: "text", x: 118, y: 278, metric: "distance", size: 22 },
    { id: "e-timer", type: "text", x: 272, y: 278, metric: "timer", size: 22 },
    { id: "e-cadence", type: "text", x: 195, y: 338, metric: "cadence", size: 14, color: "#8A93A3" },
  ],
});

export const TEMPLATES: Template[] = [
  {
    id: "tpl-mono-field",
    name: "Mono Field",
    description: "Jam besar di tengah dengan ring baterai penuh dan langkah di bawah.",
    tags: ["digital", "ring", "seimbang"],
    design: monoField,
  },
  {
    id: "tpl-terminal",
    name: "Terminal",
    description: "Tata letak rata kiri bergaya terminal, dua metrik berdampingan.",
    tags: ["digital", "mono", "rata kiri"],
    design: terminal,
  },
  {
    id: "tpl-arc-guard",
    name: "Arc Guard",
    description: "Dua busur konsentris mengapit waktu, banyak informasi tanpa sesak.",
    tags: ["digital", "arc", "data"],
    design: arcGuard,
  },
  {
    id: "tpl-split",
    name: "Split",
    description: "Komposisi terbagi: waktu di atas, detak jantung di bawah.",
    tags: ["digital", "minimal", "simetris"],
    design: split,
  },
  {
    id: "tpl-pulse",
    name: "Pulse",
    description: "Detak jantung sebagai fokus utama, waktu sebagai pendukung.",
    tags: ["digital", "health", "aksen"],
    design: pulse,
  },
  {
    id: "tpl-quiet",
    name: "Quiet",
    description: "Angka besar, satu busur tipis, sisanya ruang kosong.",
    tags: ["digital", "minimal", "lapang"],
    design: quiet,
  },
  {
    id: "tpl-cadence",
    name: "Cadence",
    description: "Langkah jadi pusat perhatian, jam dan tanggal jadi pendukung.",
    tags: ["digital", "steps", "arc"],
    design: cadence,
  },
  {
    id: "tpl-ledger",
    name: "Ledger",
    description: "Empat metrik dalam grid rapi dengan garis pemisah tipis.",
    tags: ["digital", "data", "grid"],
    design: ledger,
  },
  {
    id: "tpl-beacon",
    name: "Beacon",
    description: "Persentase baterai besar dengan busur tebal mengelilingi.",
    tags: ["digital", "battery", "bold"],
    design: beacon,
  },
  {
    id: "tpl-orbit",
    name: "Orbit",
    description: "Tiga busur konsentris untuk baterai, langkah, dan detak.",
    tags: ["digital", "arc", "data"],
    design: orbit,
  },
  {
    id: "tpl-horizon",
    name: "Horizon",
    description: "Waktu raksasa, altitude kecil di atas, sisanya kosong.",
    tags: ["digital", "minimal", "outdoor"],
    design: horizon,
  },
  {
    id: "tpl-focus",
    name: "Focus",
    description: "Detak jantung dominan dengan busur penuh, waktu di bawah.",
    tags: ["digital", "health", "aksen"],
    design: focus,
  },
  {
    id: "tpl-field-pace",
    name: "Pace Panel",
    description: "Data field lari: pace besar, jarak dan waktu di bawah.",
    tags: ["datafield", "running", "pace"],
    design: fieldPace,
  },
  {
    id: "tpl-field-stack",
    name: "Run Stack",
    description: "Data field bertumpuk: jarak, waktu, detak jantung.",
    tags: ["datafield", "running", "stack"],
    design: fieldStack,
  },
  {
    id: "tpl-field-split",
    name: "Split Field",
    description: "Pace dan detak berdampingan, jarak dan waktu di bawah.",
    tags: ["datafield", "running", "split"],
    design: fieldSplit,
  },
];

export function getTemplate(id: string): Template | undefined {
  return TEMPLATES.find((tpl) => tpl.id === id);
}

export function createBlankDesign(
  name = "Untitled",
  id?: string,
  kind: Design["kind"] = "watchface"
): Design {
  return build({
    version: 1,
    id: id ?? `d-${Date.now()}`,
    name,
    kind,
    updatedAt: new Date().toISOString(),
    elements:
      kind === "datafield"
        ? [
            { id: "e-label", type: "text", x: 195, y: 120, metric: "label", text: "PACE", size: 12, tracking: 3, color: "#8A93A3" },
            { id: "e-pace", type: "text", x: 195, y: 195, metric: "pace", size: 68, family: "digits", weight: "bold" },
            { id: "e-distance", type: "text", x: 120, y: 290, metric: "distance", size: 22 },
            { id: "e-timer", type: "text", x: 270, y: 290, metric: "timer", size: 22 },
          ]
        : [
            { id: "e-time", type: "text", x: 195, y: 195, metric: "time", size: 64, family: "digits", weight: "bold" },
          ],
  });
}

export function cloneDesign(design: Design, name: string, id?: string): Design {
  return build({
    ...design,
    id: id ?? `d-${Date.now()}`,
    name,
    updatedAt: new Date().toISOString(),
  });
}
