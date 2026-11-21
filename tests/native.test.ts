import { describe, expect, it } from "vitest";

import { TEMPLATES } from "@/core/templates";
import { designToMonkeyC, encodeDesign, TEXT_METRICS } from "../watchface/compile-design.mjs";
import { TEXT_METRICS as SCHEMA_METRICS } from "@/core/schema";

describe("native design compiler", () => {
  it("keeps metric ids in the same order as the schema", () => {
    expect([...TEXT_METRICS].sort()).toEqual([...SCHEMA_METRICS].sort());
    expect(TEXT_METRICS[0]).toBe("label");
  });

  it("encodes every template without unknown element types", () => {
    for (const template of TEMPLATES) {
      const encoded = encodeDesign(template.design);
      const visible = template.design.elements.filter((el) => el.visible).length;
      expect(encoded.rows).toHaveLength(visible);
      for (const row of encoded.rows) {
        for (const value of row) expect(Number.isInteger(value)).toBe(true);
      }
    }
  });

  it("moves free text into the string table and escapes quotes", () => {
    const design = {
      version: 1,
      name: "Q",
      background: "#000000",
      elements: [{ type: "text", x: 10, y: 10, metric: "label", text: 'SAY "HI"', aod: true }],
    };
    const encoded = encodeDesign(design);
    expect(encoded.rows[0][1]).toBe(1);
    expect(encoded.rows[0][10]).toBe(0);
    expect(designToMonkeyC(design)).toContain('"SAY \\"HI\\""');
  });

  it("rejects input that is not a design", () => {
    expect(() => encodeDesign({ version: 2, elements: [] })).toThrow();
  });
});
