export type FrameSpec = {
  id: "fr165" | "fr265" | "fr255s";
  label: string;
  width: number;
  height: number;
  hole: { left: number; top: number; size: number };
};

export const FRAMES: Record<FrameSpec["id"], FrameSpec> = {
  fr165: {
    id: "fr165",
    label: "Forerunner 165",
    width: 440,
    height: 784,
    hole: { left: 48, top: 228, size: 344 },
  },
  fr265: {
    id: "fr265",
    label: "Forerunner 265",
    width: 600,
    height: 742,
    hole: { left: 80, top: 188, size: 440 },
  },
  fr255s: {
    id: "fr255s",
    label: "Forerunner 255s",
    width: 409,
    height: 576,
    hole: { left: 76, top: 150, size: 271 },
  },
};

export const DEFAULT_FRAME = FRAMES.fr165;
