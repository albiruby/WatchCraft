import { handsElementSchema, ticksElementSchema, type DesignElement } from "./schema";

export function uid(kind: string): string {
  return `e-${kind}-${Math.random().toString(36).slice(2, 7)}`;
}

export function makeMinuteTicks(): DesignElement {
  return ticksElementSchema.parse({
    id: uid("ticks"),
    type: "ticks",
    x: 10,
    y: 10,
    w: 370,
    h: 370,
    count: 60,
    majorEvery: 5,
    aod: true,
  });
}

export function makeHourTicks(): DesignElement {
  return ticksElementSchema.parse({
    id: uid("ticks"),
    type: "ticks",
    x: 10,
    y: 10,
    w: 370,
    h: 370,
    count: 12,
    majorEvery: 3,
    length: 14,
    majorLength: 30,
    width: 4,
    majorWidth: 8,
    color: "#7C8698",
    aod: true,
  });
}

export function makeHands(): DesignElement {
  return handsElementSchema.parse({
    id: uid("hands"),
    type: "hands",
    x: 20,
    y: 20,
    w: 350,
    h: 350,
    aod: true,
  });
}
