import Image from "next/image";

import { DEFAULT_FRAME, type FrameSpec } from "@/core/frames";

export const FRAME = DEFAULT_FRAME;

export function DeviceFrame({
  children,
  frame = DEFAULT_FRAME,
}: {
  children: React.ReactNode;
  frame?: FrameSpec;
}) {
  return (
    <div
      className="relative select-none"
      style={{ width: frame.width, height: frame.height }}
    >
      <Image
        src={`/frames/${frame.id}.png`}
        alt=""
        width={frame.width}
        height={frame.height}
        draggable={false}
        priority
        className="pointer-events-none absolute inset-0 h-full w-full"
      />

      <div
        className="absolute overflow-hidden rounded-full bg-black"
        style={{
          left: frame.hole.left,
          top: frame.hole.top,
          width: frame.hole.size,
          height: frame.hole.size,
        }}
      >
        {children}
        <div
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            boxShadow:
              "inset 0 0 0 1px rgba(255, 255, 255, 0.05), inset 0 8px 18px rgba(0, 0, 0, 0.35)",
          }}
        />
      </div>
    </div>
  );
}
