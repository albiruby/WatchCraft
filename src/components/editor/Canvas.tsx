"use client";

import { useRef } from "react";

import { DeviceFrame, FRAME } from "@/components/DeviceFrame";
import { DisplayListSvg } from "@/components/DisplayListSvg";
import { SIMULATED_DATA } from "@/core/data";
import { elementBounds } from "@/core/renderer";
import type { DesignElement } from "@/core/schema";
import { useEditor } from "@/stores/editor";

const GRID_STEPS = Array.from({ length: 12 }, (_, i) => (i + 1) * 30);

function GridOverlay() {
  return (
    <g>
      {GRID_STEPS.map((value) => (
        <line
          key={`v-${value}`}
          x1={value}
          y1={0}
          x2={value}
          y2={390}
          stroke="rgba(255,255,255,0.09)"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
      ))}
      {GRID_STEPS.map((value) => (
        <line
          key={`h-${value}`}
          x1={0}
          y1={value}
          x2={390}
          y2={value}
          stroke="rgba(255,255,255,0.09)"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
      ))}
      <line
        x1={195}
        y1={0}
        x2={195}
        y2={390}
        stroke="rgba(255,122,26,0.28)"
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
      />
      <line
        x1={0}
        y1={195}
        x2={390}
        y2={195}
        stroke="rgba(255,122,26,0.28)"
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
      />
      <circle
        cx={195}
        cy={195}
        r={183}
        fill="none"
        stroke="rgba(255,255,255,0.16)"
        strokeDasharray="4 6"
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
      />
    </g>
  );
}

function SelectionHandles({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  const size = 7;
  const points = [
    [x, y],
    [x + w, y],
    [x, y + h],
    [x + w, y + h],
  ];

  return (
    <g>
      {points.map(([cx, cy]) => (
        <rect
          key={`${cx}-${cy}`}
          x={cx - size / 2}
          y={cy - size / 2}
          width={size}
          height={size}
          fill="#FF7A1A"
          stroke="#0B0F14"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </g>
  );
}

export function Canvas({ zoom, showGrid }: { zoom: number; showGrid: boolean }) {
  const design = useEditor((state) => state.design);
  const selectedId = useEditor((state) => state.selectedId);
  const select = useEditor((state) => state.select);
  const update = useEditor((state) => state.update);
  const begin = useEditor((state) => state.begin);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const drag = useRef<{
    id: string;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

  function startDrag(event: React.PointerEvent<SVGRectElement>, element: DesignElement) {
    event.stopPropagation();
    select(element.id);
    if (element.locked) return;

    begin();
    drag.current = {
      id: element.id,
      startX: event.clientX,
      startY: event.clientY,
      originX: element.x,
      originY: element.y,
    };
    svgRef.current?.setPointerCapture(event.pointerId);
  }

  function handleMove(event: React.PointerEvent<SVGSVGElement>) {
    const current = drag.current;
    const svg = svgRef.current;
    if (!current || !svg) return;

    const rect = svg.getBoundingClientRect();
    const scale = 390 / rect.width;
    let x = current.originX + (event.clientX - current.startX) * scale;
    let y = current.originY + (event.clientY - current.startY) * scale;

    if (Math.abs(x - 195) <= 3) x = 195;
    if (Math.abs(y - 195) <= 3) y = 195;

    update(current.id, {
      x: Math.round(x * 10) / 10,
      y: Math.round(y * 10) / 10,
    });
  }

  function endDrag(event: React.PointerEvent<SVGSVGElement>) {
    if (drag.current) {
      drag.current = null;
      if (svgRef.current?.hasPointerCapture(event.pointerId)) {
        svgRef.current.releasePointerCapture(event.pointerId);
      }
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        style={{ width: FRAME.width * zoom, height: FRAME.height * zoom }}
        className="shrink-0"
      >
        <div style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}>
          <DeviceFrame>
            <div className="absolute inset-0">
              <DisplayListSvg design={design} data={SIMULATED_DATA} />
            </div>

            <svg
              ref={svgRef}
              viewBox="0 0 390 390"
              className="absolute inset-0 h-full w-full"
              style={{ touchAction: "none" }}
              onPointerDown={() => select(null)}
              onPointerMove={handleMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
            >
              <title>Kanvas editor WATCHCRAFT</title>
              {showGrid ? <GridOverlay /> : null}

              {[...design.elements].reverse().map((element) => {
                const bounds = elementBounds(element, SIMULATED_DATA);
                const selected = element.id === selectedId;
                return (
                  <g key={element.id}>
                    <rect
                      x={bounds.x}
                      y={bounds.y}
                      width={bounds.w}
                      height={bounds.h}
                      fill={selected ? "rgba(255,122,26,0.08)" : "transparent"}
                      stroke={selected ? "#FF7A1A" : "transparent"}
                      strokeWidth={1}
                      strokeDasharray={selected ? "3 3" : undefined}
                      vectorEffect="non-scaling-stroke"
                      style={{ cursor: element.locked ? "default" : "move" }}
                      onPointerDown={(event) => startDrag(event, element)}
                    />
                    {selected ? (
                      <>
                        <SelectionHandles
                          x={bounds.x}
                          y={bounds.y}
                          w={bounds.w}
                          h={bounds.h}
                        />
                        {element.type === "text" ? (
                          <circle
                            cx={element.x}
                            cy={element.y}
                            r={2.5}
                            fill="#FF7A1A"
                            stroke="#0B0F14"
                            strokeWidth={1}
                            vectorEffect="non-scaling-stroke"
                          />
                        ) : null}
                      </>
                    ) : null}
                  </g>
                );
              })}
            </svg>

            {design.elements.length === 0 ? (
              <div className="pointer-events-none absolute inset-0 grid place-items-center">
                <p className="mono max-w-[22ch] text-center text-[10px] uppercase tracking-[0.16em] text-white/40">
                  Kanvas kosong. Tambah elemen dari panel kiri.
                </p>
              </div>
            ) : null}
          </DeviceFrame>
        </div>
      </div>

      <p className="mono text-[9px] uppercase tracking-[0.18em] text-faint">
        Preview data simulasi
      </p>
    </div>
  );
}
