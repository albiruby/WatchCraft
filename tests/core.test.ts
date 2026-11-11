import { describe, expect, it } from "vitest";

import { SIMULATED_DATA, groupDigits, metricText } from "@/core/data";
import { buildDisplayList } from "@/core/renderer";
import { designSchema, parseDesign, safeParseDesign } from "@/core/schema";
import { buildStandaloneSvg } from "@/core/svg";
import { TEMPLATES, cloneDesign, createBlankDesign, getTemplate } from "@/core/templates";

function mustGetTemplate(id: string) {
  const found = getTemplate(id);
  if (!found) throw new Error(`Template ${id} tidak ditemukan`);
  return found;
}

describe("design schema", () => {
  it("applies defaults to a minimal design", () => {
    const design = createBlankDesign("Test", "d-test");
    expect(design.device).toBe("fr165");
    expect(design.background).toBe("#000000");
    expect(design.elements).toHaveLength(1);
    expect(design.elements[0].visible).toBe(true);
  });

  it("rejects invalid colors", () => {
    const result = safeParseDesign({
      version: 1,
      id: "x",
      name: "X",
      updatedAt: "2026-01-01T00:00:00.000Z",
      elements: [
        { id: "a", type: "text", x: 10, y: 10, metric: "time", color: "red", size: 20, family: "mono", weight: "bold", align: "center", tracking: 0 },
      ],
    });
    expect(result.ok).toBe(false);
  });

  it("rejects an unknown element type", () => {
    expect(() =>
      parseDesign({
        version: 1,
        id: "x",
        name: "X",
        updatedAt: "2026-01-01T00:00:00.000Z",
        elements: [{ id: "a", type: "image", x: 0, y: 0 }],
      })
    ).toThrow();
  });

  it("rejects more than 40 elements", () => {
    const elements = Array.from({ length: 41 }, (_, i) => ({
      id: `e-${i}`,
      type: "shape" as const,
      x: 0,
      y: 0,
      w: 10,
      h: 10,
    }));
    expect(
      designSchema.safeParse({
        version: 1,
        id: "x",
        name: "X",
        updatedAt: "2026-01-01T00:00:00.000Z",
        elements,
      }).success
    ).toBe(false);
  });
});

describe("metric text", () => {
  it("formats numbers without locale drift", () => {
    expect(groupDigits(6420)).toBe("6,420");
    expect(groupDigits(999)).toBe("999");
  });

  it("renders each metric", () => {
    const base = { id: "t", type: "text" as const, x: 0, y: 0, size: 20, family: "mono" as const, weight: "medium" as const, color: "#FFFFFF", align: "center" as const, tracking: 0, visible: true, locked: false };
    expect(metricText({ ...base, metric: "time", text: "" }, SIMULATED_DATA)).toBe("10:09");
    expect(metricText({ ...base, metric: "battery", text: "" }, SIMULATED_DATA)).toBe("78%");
    expect(metricText({ ...base, metric: "steps", text: "" }, SIMULATED_DATA)).toBe("6,420");
    expect(metricText({ ...base, metric: "heartRate", text: "" }, SIMULATED_DATA)).toBe("62 BPM");
  });
});

describe("renderer", () => {
  it("builds commands for every visible element", () => {
    const design = createBlankDesign("Test", "d-test");
    const list = buildDisplayList(design, SIMULATED_DATA);
    expect(list.width).toBe(390);
    expect(list.commands).toHaveLength(1);
    expect(list.commands[0].kind).toBe("text");
  });

  it("skips hidden elements", () => {
    const design = createBlankDesign("Test", "d-test");
    design.elements[0].visible = false;
    expect(buildDisplayList(design, SIMULATED_DATA).commands).toHaveLength(0);
  });

  it("draws track and value for each arc", () => {
    const template = mustGetTemplate("tpl-mono-field");
    const list = buildDisplayList(template.design, SIMULATED_DATA);
    const arcs = list.commands.filter((c) => c.kind === "arc");
    expect(arcs).toHaveLength(2);
  });

  it("clamps arc progress between track and full sweep", () => {
    const template = mustGetTemplate("tpl-mono-field");
    const list = buildDisplayList(template.design, { ...SIMULATED_DATA, battery: 0 });
    const arcs = list.commands.filter((c) => c.kind === "arc");
    expect(arcs[1].kind === "arc" && arcs[1].sweep).toBeCloseTo(0.01, 5);
  });
});

describe("templates", () => {
  it("parses every template and keeps element ids unique", () => {
    for (const template of TEMPLATES) {
      const ids = template.design.elements.map((el) => el.id);
      expect(new Set(ids).size).toBe(ids.length);
      expect(template.design.name.length).toBeGreaterThan(0);
    }
  });

  it("clones with a new id", () => {
    const source = TEMPLATES[0].design;
    const copy = cloneDesign(source, "Copy", "d-copy");
    expect(copy.id).toBe("d-copy");
    expect(copy.elements).toEqual(source.elements);
    expect(copy).not.toBe(source);
  });

  it("produces standalone svg with background and text", () => {
    const template = mustGetTemplate("tpl-mono-field");
    const svg = buildStandaloneSvg(template.design, SIMULATED_DATA);
    expect(svg.startsWith("<svg")).toBe(true);
    expect(svg).toContain('viewBox="0 0 390 390"');
    expect(svg).toContain("10:09");
    expect(svg).toContain("#FF7A1A");
  });
});
