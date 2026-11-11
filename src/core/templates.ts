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
];

export function getTemplate(id: string): Template | undefined {
  return TEMPLATES.find((tpl) => tpl.id === id);
}

export function createBlankDesign(name = "Untitled", id?: string): Design {
  return build({
    version: 1,
    id: id ?? `d-${Date.now()}`,
    name,
    updatedAt: new Date().toISOString(),
    elements: [
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
