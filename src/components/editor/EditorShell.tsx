"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Check, Grid, X } from "@/components/icons";
import { Badge } from "@/components/ui";
import { designSchema, elementTitle } from "@/core/schema";
import { useNow } from "@/lib/clock";
import { cn } from "@/lib/cn";
import { saveDesign } from "@/lib/storage";
import { useEditor } from "@/stores/editor";
import { Canvas } from "./Canvas";
import { FRAME } from "@/components/DeviceFrame";
import { CommandPalette } from "./CommandPalette";
import { ComponentLibrary } from "./ComponentLibrary";
import { Inspector } from "./Inspector";
import { LayersPanel } from "./LayersPanel";
import { Toolbar } from "./Toolbar";

function ToolToggle({
  label,
  title,
  pressed,
  onToggle,
  children,
}: {
  label: string;
  title: string;
  pressed: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={pressed}
      title={title}
      className={cn(
        "flex h-7 items-center gap-1.5 rounded border px-2.5 text-[11px] font-medium transition-colors",
        pressed
          ? "border-accent/50 bg-accent/10 text-ink"
          : "border-line bg-raised text-muted hover:text-ink"
      )}
    >
      {children}
      {label}
    </button>
  );
}

export function EditorShell() {
  const design = useEditor((state) => state.design);
  const selectedId = useEditor((state) => state.selectedId);
  const selectedIds = useEditor((state) => state.selectedIds);

  const [zoom, setZoom] = useState(0.9);
  const [showGrid, setShowGrid] = useState(true);
  // Live: jarum dan angka berjalan dengan jam perangkat. AOD: hanya elemen always-on.
  const [live, setLive] = useState(false);
  const [aod, setAod] = useState(false);
  const now = useNow(live);
  const [snap, setSnap] = useState(1);
  const [saved, setSaved] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    function applyFit() {
      const availableHeight = window.innerHeight - 204;
      const availableWidth = window.innerWidth - 236 - 320 - 64;
      const ratio = Math.min(availableHeight / FRAME.height, availableWidth / FRAME.width);
      const next = Math.min(1, Math.max(0.45, Math.floor(ratio * 20) / 20));
      setZoom(next);
    }

    applyFit();
    window.addEventListener("resize", applyFit);
    return () => window.removeEventListener("resize", applyFit);
  }, []);

  useEffect(() => {
    saveDesign(design);
    setSaved(true);
    const timer = window.setTimeout(() => setSaved(false), 1200);
    return () => window.clearTimeout(timer);
  }, [design]);

  useEffect(() => {
    document.title = `${design.name} / WATCHCRAFT`;
  }, [design.name]);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 1023px)");
    const update = () => setBlocked(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const mod = event.metaKey || event.ctrlKey;
      const key = event.key.toLowerCase();

      if (mod && key === "k") {
        event.preventDefault();
        setPaletteOpen((value) => !value);
        return;
      }

      if (paletteOpen && event.key === "Escape") {
        setPaletteOpen(false);
        return;
      }

      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;

      const store = useEditor.getState();

      if (mod && key === "z") {
        event.preventDefault();
        if (event.shiftKey) store.redo();
        else store.undo();
        return;
      }

      if (mod && key === "d") {
        event.preventDefault();
        store.duplicateSelected();
        return;
      }

      if (mod && key === "a") {
        event.preventDefault();
        store.selectMany(store.design.elements.map((element) => element.id));
        return;
      }

      if (event.key === "Escape") {
        store.select(null);
        return;
      }

      if (store.selectedIds.length === 0) return;

      const step = event.shiftKey ? 10 : 1;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        store.nudgeSelected(-step, 0);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        store.nudgeSelected(step, 0);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        store.nudgeSelected(0, -step);
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        store.nudgeSelected(0, step);
      } else if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        store.removeSelected();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [paletteOpen]);

  const selected = selectedId
    ? design.elements.find((element) => element.id === selectedId) ?? null
    : null;
  const valid = designSchema.safeParse(design).success;

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-page">
      <Toolbar saved={saved} onOpenPalette={() => setPaletteOpen(true)} />

      <div className="flex min-h-0 flex-1">
        <aside className="scroll-slim hidden w-[236px] shrink-0 overflow-y-auto border-r border-line bg-panel lg:block">
          <ComponentLibrary />
        </aside>

        <main className="flex min-w-0 flex-1 flex-col">
          <div className="flex h-10 shrink-0 items-center justify-between gap-3 border-b border-line px-3">
            <div className="flex items-center gap-2">
              <span className="mono text-[10px] uppercase tracking-[0.14em] text-faint">
                390 x 390
              </span>
              <span className="h-4 w-px bg-line" />
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => setZoom((value) => Math.max(0.65, Math.round((value - 0.05) * 100) / 100))}
                  aria-label="Perkecil"
                  className="grid size-6 place-items-center rounded text-muted hover:bg-raised hover:text-ink"
                >
                  <span aria-hidden="true">-</span>
                </button>
                <span className="mono w-10 text-center text-[10px] text-muted">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoom((value) => Math.min(1.1, Math.round((value + 0.05) * 100) / 100))}
                  aria-label="Perbesar"
                  className="grid size-6 place-items-center rounded text-muted hover:bg-raised hover:text-ink"
                >
                  <span aria-hidden="true">+</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ToolToggle
                label="Live"
                title="Jalankan jam: jarum dan angka mengikuti waktu perangkat"
                pressed={live}
                onToggle={() => setLive((value) => !value)}
              >
                <span
                  aria-hidden="true"
                  className={cn("size-1.5 rounded-full", live ? "bg-accent" : "bg-faint")}
                />
              </ToolToggle>
              <ToolToggle
                label="AOD"
                title="Pratinjau mode always-on: hanya elemen bertanda AOD"
                pressed={aod}
                onToggle={() => setAod((value) => !value)}
              />
              <span className="h-4 w-px bg-line" />
              <ToolToggle
                label="Grid"
                title="Tampilkan grid"
                pressed={showGrid}
                onToggle={() => setShowGrid((value) => !value)}
              >
                <Grid size={12} />
              </ToolToggle>
              <label className="flex items-center gap-1.5 text-[10px] text-muted">
                Snap
                <select
                  value={snap}
                  onChange={(event) => setSnap(Number(event.target.value))}
                  aria-label="Snap grid"
                  className="h-6 rounded border border-line bg-raised px-1 mono text-[10px] text-ink outline-none"
                >
                  <option value={0}>Off</option>
                  <option value={1}>1 px</option>
                  <option value={5}>5 px</option>
                  <option value={10}>10 px</option>
                </select>
              </label>
              <Badge tone="accent">Data simulasi</Badge>
            </div>
          </div>

          <div className="scroll-slim flex min-h-0 flex-1 items-center justify-center overflow-auto bg-page p-6">
            <Canvas zoom={zoom} showGrid={showGrid} snap={snap} live={live} aod={aod} />
          </div>

          <footer className="flex h-8 shrink-0 items-center justify-between gap-3 border-t border-line px-3">
            <span className="mono text-[9px] uppercase tracking-[0.12em] text-faint">
              {design.elements.length} elemen /{" "}
              {selectedIds.length > 1
                ? `${selectedIds.length} dipilih`
                : selected
                  ? elementTitle(selected)
                  : "tanpa pilihan"}
            </span>
            {now ? (
              <span className="mono text-[11px] text-accent">{now.toLocaleTimeString("en-GB")}</span>
            ) : aod ? (
              <span className="mono text-[9px] uppercase tracking-[0.12em] text-faint">Always-on</span>
            ) : null}
            <span
              className={cn(
                "mono flex items-center gap-1 text-[9px] uppercase tracking-[0.12em]",
                valid ? "text-faint" : "text-danger"
              )}
            >
              {valid ? <Check size={11} /> : <X size={11} />}
              {valid ? "Skema valid" : "Skema bermasalah"}
            </span>
          </footer>
        </main>

        <aside className="hidden w-[320px] shrink-0 flex-col border-l border-line bg-panel md:flex">
          <LayersPanel />
          <Inspector />
        </aside>
      </div>

      {blocked ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-page p-6">
          <div className="w-full max-w-sm rounded-lg border border-line bg-panel p-6">
            <Badge tone="accent">Layar terlalu kecil</Badge>
            <h2 className="mt-3 text-lg font-medium tracking-tight">
              Editor butuh lebar minimal 1024 px
            </h2>
            <p className="mt-2 text-[13px] leading-relaxed text-muted">
              Kanvas, layer, dan inspector butuh ruang berdampingan. Buka di layar
              yang lebih lebar untuk melanjutkan.
            </p>
            <Link
              href="/library"
              className="mt-5 inline-flex h-9 items-center rounded-md bg-accent px-3.5 text-sm font-medium text-accent-ink"
            >
              Kembali ke library
            </Link>
          </div>
        </div>
      ) : null}

      {paletteOpen ? (
        <CommandPalette onClose={() => setPaletteOpen(false)} />
      ) : null}
    </div>
  );
}
