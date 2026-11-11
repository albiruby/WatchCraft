"use client";

import { useState } from "react";

import { ArrowDown, ArrowUp, Copy, Eye, EyeOff, Lock, Trash, Unlock } from "@/components/icons";
import { elementTitle } from "@/core/schema";
import { cn } from "@/lib/cn";
import { useEditor } from "@/stores/editor";

export function LayersPanel() {
  const design = useEditor((state) => state.design);
  const selectedId = useEditor((state) => state.selectedId);
  const selectedIds = useEditor((state) => state.selectedIds);
  const select = useEditor((state) => state.select);
  const toggleSelect = useEditor((state) => state.toggleSelect);
  const toggleVisible = useEditor((state) => state.toggleVisible);
  const toggleLocked = useEditor((state) => state.toggleLocked);
  const reorder = useEditor((state) => state.reorder);
  const duplicateSelected = useEditor((state) => state.duplicateSelected);
  const removeSelected = useEditor((state) => state.removeSelected);

  const ordered = [...design.elements].reverse();
  const hasSelection = selectedIds.length > 0;
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const filtered = needle
    ? ordered.filter((element) => elementTitle(element).toLowerCase().includes(needle))
    : ordered;

  return (
    <div className="flex min-h-[160px] max-h-[46%] shrink-0 flex-col border-b border-line">
      <header className="flex h-11 shrink-0 items-center justify-between border-b border-line px-3.5">
        <h2 className="text-[13px] font-medium">Layer</h2>
        <span className="mono text-[9px] uppercase tracking-[0.14em] text-faint">
          {selectedIds.length > 0
            ? `${selectedIds.length} / ${design.elements.length}`
            : `${design.elements.length} elemen`}
        </span>
      </header>

      <div className="shrink-0 border-b border-line px-1.5 py-1.5">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Cari layer"
          aria-label="Cari layer"
          className="h-7 w-full rounded border border-line bg-raised px-2 text-[11px] text-ink outline-none placeholder:text-faint focus:border-line-strong"
        />
      </div>

      <div className="scroll-slim flex-1 overflow-y-auto p-1.5">
        {filtered.length === 0 ? (
          <p className="px-2 py-3 text-[12px] text-faint">
            {ordered.length === 0 ? "Belum ada elemen." : "Tidak ada layer yang cocok."}
          </p>
        ) : (
          filtered.map((element) => {
            const selected = selectedIds.includes(element.id);
            const primary = element.id === selectedId;
            return (
              <div
                key={element.id}
                className={cn(
                  "group flex h-8 items-center gap-0.5 rounded px-1 transition-colors",
                  primary
                    ? "bg-accent/15"
                    : selected
                      ? "bg-accent/10"
                      : "hover:bg-raised"
                )}
              >
                <button
                  type="button"
                  onClick={() => toggleVisible(element.id)}
                  aria-label={`${element.visible ? "Sembunyikan" : "Tampilkan"} ${elementTitle(element)}`}
                  title={element.visible ? "Sembunyikan" : "Tampilkan"}
                  className="grid size-6 shrink-0 place-items-center rounded text-faint transition-colors hover:text-ink"
                >
                  {element.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                </button>

                <button
                  type="button"
                  onClick={(event) => {
                    if (event.shiftKey) toggleSelect(element.id);
                    else select(element.id);
                  }}
                  title="Shift klik untuk pilih banyak"
                  className={cn(
                    "flex-1 truncate text-left text-[12px]",
                    selected
                      ? "text-ink"
                      : element.visible
                        ? "text-muted"
                        : "text-faint line-through"
                  )}
                >
                  {elementTitle(element)}
                </button>

                <button
                  type="button"
                  onClick={() => toggleLocked(element.id)}
                  aria-label={`${element.locked ? "Buka kunci" : "Kunci"} ${elementTitle(element)}`}
                  title={element.locked ? "Buka kunci" : "Kunci"}
                  className={cn(
                    "grid size-6 shrink-0 place-items-center rounded text-faint transition-colors hover:text-ink",
                    element.locked
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                  )}
                >
                  {element.locked ? <Lock size={12} /> : <Unlock size={12} />}
                </button>
              </div>
            );
          })
        )}
      </div>

      <div className="flex shrink-0 items-center justify-between border-t border-line px-1.5 py-1.5">
        <span className="mono px-1 text-[9px] uppercase tracking-[0.1em] text-faint">
          Shift klik
        </span>
        <div className="flex items-center gap-0.5">
          {(
            [
              ["Naikkan layer", ArrowUp, () => selectedId && reorder(selectedId, "up"), !hasSelection],
              ["Turunkan layer", ArrowDown, () => selectedId && reorder(selectedId, "down"), !hasSelection],
              ["Duplikat", Copy, duplicateSelected, !hasSelection],
              ["Hapus", Trash, removeSelected, !hasSelection],
            ] as const
          ).map(([label, Icon, action, disabled]) => (
            <button
              key={label}
              type="button"
              onClick={action}
              disabled={disabled}
              aria-label={label}
              title={label}
              className="grid size-7 place-items-center rounded text-muted transition-colors hover:bg-raised hover:text-ink disabled:opacity-35 disabled:hover:bg-transparent"
            >
              <Icon size={14} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
