import Image from "next/image";

export const FRAME = {
  width: 440,
  height: 784,
  hole: { left: 48, top: 228, size: 344 },
} as const;

export function DeviceFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative select-none"
      style={{ width: FRAME.width, height: FRAME.height }}
    >
      {/* Body diambil dari tangkapan layar Connect IQ Simulator, layar sudah dilubangi. */}
      <Image
        src="/frames/fr165-body.png"
        alt=""
        width={FRAME.width}
        height={FRAME.height}
        draggable={false}
        priority
        className="pointer-events-none absolute inset-0 h-full w-full"
      />

      <div
        className="absolute overflow-hidden rounded-full bg-black"
        style={{
          left: FRAME.hole.left,
          top: FRAME.hole.top,
          width: FRAME.hole.size,
          height: FRAME.hole.size,
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
