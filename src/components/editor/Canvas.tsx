// biome-ignore-all lint/a11y/noStaticElementInteractions: kanvas interaktif, seleksi keyboard lewat panel layer
"use client";

import { useRef, useState } from "react";

import { DeviceFrame, FRAME } from "@/components/DeviceFrame";
import { DisplayListSvg } from "@/components/DisplayListSvg";
import { SIMULATED_DATA } from "@/core/data";
import { elementBounds, type Bounds } from "@/core/renderer";
import type { DesignElement } from "@/core/schema";
import { cn } from "@/lib/cn";
import { useEditor } from "@/stores/editor";

const GRID_STEPS = Array.from({ length: 12 }, (_, i) => (i + 1) * 30);
const SNAP_DISTANCE = 4;
const CANVAS = 390;

type Guides = { x: number | null; y: number | null };

function GridOverlay() {
  return (
    <g>
      {GRID_STEPS.map((value) => (
        <line
          key={`v-${value}`}
          x1={value}
          y1={0}
          x2={value}
          y2={CANVAS}
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
          x2={CANVAS}
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
        y2={CANVAS}
        stroke="rgba(255,122,26,0.28)"
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
      />
      <line
        x1={0}
        y1={195}
        x2={CANVAS}
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

function MenuItem({
  label,
  hint,
  danger,
  onClick,
}: {
  label: string;
  hint?: string;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between gap-3 px-3 py-1.5 text-left text-[12px] transition-colors hover:bg-raised",
        danger ? "text-danger" : "text-muted hover:text-ink"
      )}
    >
      <span>{label}</span>
      {hint ? (
        <span className="mono text-[9px] uppercase tracking-[0.1em] text-faint">{hint}</span>
      ) : null}
    </button>
  );
}

function findSnap(  edges: number[],
  targets: number[]
): { adjust: number; line: number } | null {
  let best: { adjust: number; line: number; distance: number } | null = null;

  for (const edge of edges) {
    for (const target of targets) {
      const distance = Math.abs(edge - target);
      if (distance > SNAP_DISTANCE) continue;
      if (!best || distance < best.distance) {
        best = { adjust: target - edge, line: target, distance };
      }
    }
  }

  return best ? { adjust: best.adjust, line: best.line } : null;
}

export function Canvas({
  zoom,
  showGrid,
  snap,
}: {
  zoom: number;
  showGrid: boolean;
  snap: number;
}) {
  const design = useEditor((state) => state.design);
  const selectedId = useEditor((state) => state.selectedId);
  const selectedIds = useEditor((state) => state.selectedIds);
  const select = useEditor((state) => state.select);
  const selectMany = useEditor((state) => state.selectMany);
  const toggleSelect = useEditor((state) => state.toggleSelect);
  const begin = useEditor((state) => state.begin);
  const setPositions = useEditor((state) => state.setPositions);
  const duplicate = useEditor((state) => state.duplicate);
  const remove = useEditor((state) => state.remove);
  const bringToFront = useEditor((state) => state.bringToFront);
  const sendToBack = useEditor((state) => state.sendToBack);
  const toggleLocked = useEditor((state) => state.toggleLocked);
  const toggleVisible = useEditor((state) => state.toggleVisible);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const drag = useRef<{
    ids: string[];
    startX: number;
    startY: number;
    origins: Map<string, { x: number; y: number }>;
    primaryBounds: Bounds;
  } | null>(null);
  const [guides, setGuides] = useState<Guides>({ x: null, y: null });
  const [menu, setMenu] = useState<{ x: number; y: number; id: string } | null>(null);
  const [marquee, setMarquee] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const marqueeRef = useRef<{
    startX: number;
    startY: number;
    active: boolean;
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);

  function startDrag(event: React.PointerEvent<SVGElement>, element: DesignElement) {
    event.stopPropagation();

    if (event.shiftKey) {
      event.preventDefault();
      toggleSelect(element.id);
      return;
    }

    const ids = selectedIds.includes(element.id) ? selectedIds : [element.id];
    if (!selectedIds.includes(element.id)) select(element.id);
    if (element.locked) return;

    begin();
    const origins = new Map<string, { x: number; y: number }>();
    for (const id of ids) {
      const item = design.elements.find((el) => el.id === id);
      if (item) origins.set(id, { x: item.x, y: item.y });
    }

    drag.current = {
      ids,
      startX: event.clientX,
      startY: event.clientY,
      origins,
      primaryBounds: elementBounds(element, SIMULATED_DATA),
    };
    svgRef.current?.setPointerCapture(event.pointerId);
  }

  function startMarquee(event: React.PointerEvent<SVGSVGElement>) {
    if (event.button !== 0) return;
    const svg = svgRef.current;
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const scale = CANVAS / rect.width;
    const x = (event.clientX - rect.left) * scale;
    const y = (event.clientY - rect.top) * scale;

    marqueeRef.current = {
      startX: x,
      startY: y,
      active: false,
      x,
      y,
      w: 0,
      h: 0,
    };
    setMarquee({ x, y, w: 0, h: 0 });
    svg.setPointerCapture(event.pointerId);
  }

  function handleMove(event: React.PointerEvent<SVGSVGElement>) {
    const current = drag.current;
    const svg = svgRef.current;
    if (!svg) return;

    if (marqueeRef.current) {
      const rect = svg.getBoundingClientRect();
      const scale = CANVAS / rect.width;
      const x = (event.clientX - rect.left) * scale;
      const y = (event.clientY - rect.top) * scale;
      const start = marqueeRef.current;
      const box = {
        x: Math.min(start.startX, x),
        y: Math.min(start.startY, y),
        w: Math.abs(x - start.startX),
        h: Math.abs(y - start.startY),
      };
      if (box.w > 3 || box.h > 3) start.active = true;
      Object.assign(start, box);
      setMarquee(box);
      return;
    }

    if (!current) return;

    const rect = svg.getBoundingClientRect();
    const scale = CANVAS / rect.width;
    let dx = (event.clientX - current.startX) * scale;
    let dy = (event.clientY - current.startY) * scale;

    const bounds = current.primaryBounds;
    const xTargets = [0, 195, 390];
    const yTargets = [0, 195, 390];

    for (const element of design.elements) {
      if (current.ids.includes(element.id) || !element.visible) continue;
      const other = elementBounds(element, SIMULATED_DATA);
      xTargets.push(other.x, other.x + other.w / 2, other.x + other.w);
      yTargets.push(other.y, other.y + other.h / 2, other.y + other.h);
    }

    const xEdges = [bounds.x + dx, bounds.x + bounds.w / 2 + dx, bounds.x + bounds.w + dx];
    const yEdges = [bounds.y + dy, bounds.y + bounds.h / 2 + dy, bounds.y + bounds.h + dy];

    const snapX = findSnap(xEdges, xTargets);
    const snapY = findSnap(yEdges, yTargets);

    if (snapX) dx += snapX.adjust;
    if (snapY) dy += snapY.adjust;

    const round = (value: number) =>
      snap > 0
        ? Math.round(value / snap) * snap
        : Math.round(value * 10) / 10;

    setPositions(
      current.ids.map((id) => {
        const origin = current.origins.get(id) ?? { x: 0, y: 0 };
        return {
          id,
          x: round(origin.x + dx),
          y: round(origin.y + dy),
        };
      })
    );
    setGuides({ x: snapX?.line ?? null, y: snapY?.line ?? null });
  }

  function endDrag(event: React.PointerEvent<SVGSVGElement>) {
    if (marqueeRef.current) {
      const box = marqueeRef.current;
      if (!box.active || box.w < 1 || box.h < 1) {
        select(null);
      } else {
        const hits = design.elements
          .filter((element) => element.visible && !element.locked)
          .filter((element) => {
            const bounds = elementBounds(element, SIMULATED_DATA);
            return (
              bounds.x < box.x + box.w &&
              bounds.x + bounds.w > box.x &&
              bounds.y < box.y + box.h &&
              bounds.y + bounds.h > box.y
            );
          })
          .map((element) => element.id);
        if (hits.length > 0) selectMany(hits);
        else select(null);
      }
      marqueeRef.current = null;
      setMarquee(null);
    }

    if (drag.current) {
      drag.current = null;
      setGuides({ x: null, y: null });
    }

    if (svgRef.current?.hasPointerCapture(event.pointerId)) {
      svgRef.current.releasePointerCapture(event.pointerId);
    }
  }

  const menuElement = menu
    ? design.elements.find((element) => element.id === menu.id) ?? null
    : null;

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
              viewBox={`0 0 ${CANVAS} ${CANVAS}`}
              className="absolute inset-0 h-full w-full"
              style={{ touchAction: "none" }}
              onPointerDown={startMarquee}
              onPointerMove={handleMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
            >
              <title>Kanvas editor WATCHCRAFT</title>
              {showGrid ? <GridOverlay /> : null}

              {guides.x !== null ? (
                <line
                  x1={guides.x}
                  y1={0}
                  x2={guides.x}
                  y2={CANVAS}
                  stroke="#FF7A1A"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                  vectorEffect="non-scaling-stroke"
                />
              ) : null}
              {guides.y !== null ? (
                <line
                  x1={0}
                  y1={guides.y}
                  x2={CANVAS}
                  y2={guides.y}
                  stroke="#FF7A1A"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                  vectorEffect="non-scaling-stroke"
                />
              ) : null}

              {marquee && marquee.w > 0 && marquee.h > 0 ? (
                <rect
                  x={marquee.x}
                  y={marquee.y}
                  width={marquee.w}
                  height={marquee.h}
                  fill="rgba(255,122,26,0.08)"
                  stroke="#FF7A1A"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                  vectorEffect="non-scaling-stroke"
                />
              ) : null}

              {[...design.elements].reverse().map((element) => {
                const bounds = elementBounds(element, SIMULATED_DATA);
                const selected = selectedIds.includes(element.id);
                const primary = element.id === selectedId;
                return (
                  <g key={element.id}>
                    <rect
                      x={bounds.x}
                      y={bounds.y}
                      width={bounds.w}
                      height={bounds.h}
                      fill={
                        selected && element.type !== "arc"
                          ? "rgba(255,122,26,0.08)"
                          : "transparent"
                      }
                      stroke={selected ? "#FF7A1A" : "transparent"}
                      strokeWidth={1}
                      strokeDasharray={selected ? "3 3" : undefined}
                      vectorEffect="non-scaling-stroke"
                      style={{ pointerEvents: "none" }}
                    />

                    {element.type === "arc" ? (
                      <circle
                        cx={bounds.x + bounds.w / 2}
                        cy={bounds.y + bounds.h / 2}
                        r={Math.min(bounds.w, bounds.h) / 2 - element.width / 2}
                        fill="none"
                        stroke="rgba(0,0,0,0.001)"
                        strokeWidth={element.width + 16}
                        style={{
                          pointerEvents: "stroke",
                          cursor: element.locked ? "default" : "move",
                        }}
                        onPointerDown={(event) => startDrag(event, element)}
                        onContextMenu={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          if (!selectedIds.includes(element.id)) select(element.id);
                          setMenu({ x: event.clientX, y: event.clientY, id: element.id });
                        }}
                      />
                    ) : (
                      <rect
                        x={bounds.x}
                        y={bounds.y}
                        width={bounds.w}
                        height={bounds.h}
                        fill="transparent"
                        style={{
                          pointerEvents: "all",
                          cursor: element.locked ? "default" : "move",
                        }}
                        onPointerDown={(event) => startDrag(event, element)}
                        onContextMenu={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          if (!selectedIds.includes(element.id)) select(element.id);
                          setMenu({ x: event.clientX, y: event.clientY, id: element.id });
                        }}
                      />
                    )}
                    {primary ? (
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

      <p className="text-[11px] text-faint">
        {selectedIds.length > 1
          ? `${selectedIds.length} elemen dipilih`
          : "Preview data simulasi"}
      </p>

      {menu && menuElement ? (
        <>
          <button
            type="button"
            aria-label="Tutup menu"
            onClick={() => setMenu(null)}
            className="fixed inset-0 z-40 cursor-default"
          />
          <div
            role="menu"
            className="fixed z-50 w-52 overflow-hidden rounded-md border border-line bg-panel py-1 shadow-2xl"
            style={{ left: menu.x, top: menu.y }}
          >
            <MenuItem
              label="Duplikat"
              hint="Ctrl D"
              onClick={() => {
                duplicate(menuElement.id);
                setMenu(null);
              }}
            />
            <MenuItem
              label="Hapus"
              hint="Del"
              danger
              onClick={() => {
                remove(menuElement.id);
                setMenu(null);
              }}
            />
            <div className="my-1 h-px bg-line" />
            <MenuItem
              label="Bawa ke depan"
              onClick={() => {
                bringToFront(menuElement.id);
                setMenu(null);
              }}
            />
            <MenuItem
              label="Kirim ke belakang"
              onClick={() => {
                sendToBack(menuElement.id);
                setMenu(null);
              }}
            />
            <div className="my-1 h-px bg-line" />
            <MenuItem
              label={menuElement.locked ? "Buka kunci" : "Kunci"}
              onClick={() => {
                toggleLocked(menuElement.id);
                setMenu(null);
              }}
            />
            <MenuItem
              label={menuElement.visible ? "Sembunyikan" : "Tampilkan"}
              onClick={() => {
                toggleVisible(menuElement.id);
                setMenu(null);
              }}
            />
          </div>
        </>
      ) : null}
    </div>
  );
}
