"use client";

import { useEffect, useRef, useState } from "react";

import { Search } from "@/components/icons";
import {
  arcElementSchema,
  shapeElementSchema,
  textElementSchema,
  type DesignElement,
} from "@/core/schema";
import { cn } from "@/lib/cn";
import { useEditor } from "@/stores/editor";

type Command = {
  id: string;
  label: string;
  hint: string;
  run: () => void;
};

function uid(kind: string): string {
  return `e-${kind}-${Math.random().toString(36).slice(2, 7)}`;
}

function makeText(
  metric:
    | "time"
    | "date"
    | "battery"
    | "steps"
    | "heartRate"
    | "calories"
    | "distance"
    | "notifications"
    | "weather"
    | "floors"
    | "activeMinutes"
    | "stress"
    | "bodyBattery"
    | "vo2max"
    | "altitude"
    | "label",
  overrides: Record<string, unknown> = {}
): DesignElement {
  return textElementSchema.parse({
    id: uid(metric),
    type: "text",
    x: 195,
    y: 195,
    metric,
    ...overrides,
  });
}

function makeShape(shape: "rect" | "circle"): DesignElement {
  return shapeElementSchema.parse({
    id: uid(shape),
    type: "shape",
    shape,
    x: 145,
    y: 145,
    w: 100,
    h: 100,
    radius: shape === "rect" ? 8 : 0,
    fill: "#171E28",
  });
}

function makeArc(): DesignElement {
  return arcElementSchema.parse({
    id: uid("arc"),
    type: "arc",
    x: 45,
    y: 45,
    w: 300,
    h: 300,
    width: 4,
    metric: "battery",
    sweep: 360,
  });
}

export function CommandPalette({ onClose }: { onClose: () => void }) {
  const state = useEditor();
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const hasSelection = state.selectedIds.length > 0;

  const commands: Command[] = [
    { id: "add-time", label: "Tambah waktu", hint: "Metrik", run: () => state.add(makeText("time", { size: 64, family: "digits", weight: "bold" })) },
    { id: "add-date", label: "Tambah tanggal", hint: "Metrik", run: () => state.add(makeText("date", { y: 250, size: 15, color: "#98A2B3" })) },
    { id: "add-battery", label: "Tambah baterai", hint: "Metrik", run: () => state.add(makeText("battery", { y: 118, size: 18 })) },
    { id: "add-steps", label: "Tambah langkah", hint: "Metrik", run: () => state.add(makeText("steps", { y: 290, size: 20 })) },
    { id: "add-hr", label: "Tambah detak jantung", hint: "Metrik", run: () => state.add(makeText("heartRate", { y: 140, size: 22 })) },
    { id: "add-calories", label: "Tambah kalori", hint: "Metrik", run: () => state.add(makeText("calories", { y: 150, size: 18 })) },
    { id: "add-distance", label: "Tambah jarak", hint: "Metrik", run: () => state.add(makeText("distance", { y: 260, size: 18 })) },
    { id: "add-notifications", label: "Tambah notifikasi", hint: "Metrik", run: () => state.add(makeText("notifications", { y: 110, size: 14 })) },
    { id: "add-weather", label: "Tambah suhu", hint: "Metrik", run: () => state.add(makeText("weather", { y: 300, size: 18 })) },
    { id: "add-floors", label: "Tambah lantai", hint: "Metrik", run: () => state.add(makeText("floors", { y: 280, size: 16 })) },
    { id: "add-active", label: "Tambah active minutes", hint: "Metrik", run: () => state.add(makeText("activeMinutes", { y: 310, size: 16 })) },
    { id: "add-stress", label: "Tambah stress", hint: "Metrik", run: () => state.add(makeText("stress", { x: 120, y: 150, size: 24 })) },
    { id: "add-body", label: "Tambah body battery", hint: "Metrik", run: () => state.add(makeText("bodyBattery", { x: 270, y: 150, size: 24 })) },
    { id: "add-vo2max", label: "Tambah VO2 max", hint: "Metrik", run: () => state.add(makeText("vo2max", { y: 330, size: 18 })) },
    { id: "add-altitude", label: "Tambah altitude", hint: "Metrik", run: () => state.add(makeText("altitude", { y: 90, size: 14 })) },
    { id: "add-label", label: "Tambah teks bebas", hint: "Teks", run: () => state.add(makeText("label", { text: "LABEL", size: 11, tracking: 2, color: "#98A2B3" })) },
    { id: "add-rect", label: "Tambah kotak", hint: "Bentuk", run: () => state.add(makeShape("rect")) },
    { id: "add-circle", label: "Tambah lingkaran", hint: "Bentuk", run: () => state.add(makeShape("circle")) },
    { id: "add-arc", label: "Tambah busur", hint: "Bentuk", run: () => state.add(makeArc()) },
    { id: "undo", label: "Undo", hint: "Riwayat", run: state.undo },
    { id: "redo", label: "Redo", hint: "Riwayat", run: state.redo },
    { id: "duplicate", label: "Duplikat pilihan", hint: "Edit", run: state.duplicateSelected },
    { id: "delete", label: "Hapus pilihan", hint: "Edit", run: state.removeSelected },
    { id: "select-all", label: "Pilih semua elemen", hint: "Seleksi", run: () => state.selectMany(state.design.elements.map((el) => el.id)) },
    { id: "deselect", label: "Batalkan pilihan", hint: "Seleksi", run: () => state.select(null) },
    { id: "align-left", label: "Rata kiri ke kanvas", hint: "Rata", run: () => state.align("left") },
    { id: "align-hcenter", label: "Rata tengah horizontal", hint: "Rata", run: () => state.align("hcenter") },
    { id: "align-right", label: "Rata kanan ke kanvas", hint: "Rata", run: () => state.align("right") },
    { id: "align-top", label: "Rata atas ke kanvas", hint: "Rata", run: () => state.align("top") },
    { id: "align-vcenter", label: "Rata tengah vertikal", hint: "Rata", run: () => state.align("vcenter") },
    { id: "align-bottom", label: "Rata bawah ke kanvas", hint: "Rata", run: () => state.align("bottom") },
    { id: "dist-h", label: "Distribusi horizontal", hint: "Rata", run: () => state.distribute("horizontal") },
    { id: "dist-v", label: "Distribusi vertikal", hint: "Rata", run: () => state.distribute("vertical") },
    { id: "front", label: "Bawa ke depan", hint: "Layer", run: () => state.selectedId && state.bringToFront(state.selectedId) },
    { id: "back", label: "Kirim ke belakang", hint: "Layer", run: () => state.selectedId && state.sendToBack(state.selectedId) },
  ];

  const needle = query.trim().toLowerCase();
  const filtered = commands.filter((command) =>
    `${command.label} ${command.hint}`.toLowerCase().includes(needle)
  );
  const active = filtered[Math.min(index, Math.max(0, filtered.length - 1))];

  function run(command: Command | undefined) {
    if (!command) return;
    command.run();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-[12vh]">
      <button
        type="button"
        aria-label="Tutup command palette"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/55"
      />
      <div
        className="relative w-full max-w-xl overflow-hidden rounded-lg border border-line bg-panel shadow-2xl"
        role="dialog"
        aria-label="Command palette"
      >
        <div className="flex items-center gap-2 border-b border-line px-3">
          <Search size={15} className="text-faint" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setIndex(0);
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setIndex((value) => Math.min(filtered.length - 1, value + 1));
              } else if (event.key === "ArrowUp") {
                event.preventDefault();
                setIndex((value) => Math.max(0, value - 1));
              } else if (event.key === "Enter") {
                event.preventDefault();
                run(active);
              } else if (event.key === "Escape") {
                event.preventDefault();
                onClose();
              }
            }}
            placeholder="Cari aksi, metrik, atau align"
            className="h-12 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-faint"
            aria-label="Cari perintah"
          />
          <kbd className="mono rounded border border-line bg-raised px-1.5 py-0.5 text-[9px] text-faint">
            Esc
          </kbd>
        </div>

        <div className="scroll-slim max-h-[340px] overflow-y-auto p-1.5">
          {filtered.length === 0 ? (
            <p className="px-3 py-6 text-center text-[12px] text-faint">
              Tidak ada perintah yang cocok.
            </p>
          ) : (
            filtered.map((command, position) => (
              <button
                key={command.id}
                type="button"
                onMouseEnter={() => setIndex(position)}
                onClick={() => run(command)}
                disabled={
                  !hasSelection &&
                  ["duplicate", "delete", "align-left", "align-hcenter", "align-right", "align-top", "align-vcenter", "align-bottom", "dist-h", "dist-v", "front", "back"].includes(command.id)
                }
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded px-2.5 py-2 text-left text-[12px] transition-colors disabled:opacity-35",
                  position === index ? "bg-accent/12 text-ink" : "text-muted hover:bg-raised"
                )}
              >
                <span>{command.label}</span>
                <span className="mono text-[9px] uppercase tracking-[0.12em] text-faint">
                  {command.hint}
                </span>
              </button>
            ))
          )}
        </div>

        <div className="mono flex items-center justify-between border-t border-line px-3 py-2 text-[9px] uppercase tracking-[0.12em] text-faint">
          <span>Panah untuk navigasi / Enter untuk jalankan</span>
          <span>{filtered.length} aksi</span>
        </div>
      </div>
    </div>
  );
}
