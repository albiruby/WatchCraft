"use client";

import { ArrowDown, ArrowUp, Copy, Eye, EyeOff, Lock, Trash, Unlock } from "@/components/icons";
import { elementTitle } from "@/core/schema";
import { cn } from "@/lib/cn";
import { useEditor } from "@/stores/editor";

export function LayersPanel() {
  const design = useEditor((state) => state.design);
  const selectedId = useEditor((state) => state.selectedId);
  const select = useEditor((state) => state.select);
  const toggleVisible = useEditor((state) => state.toggleVisible);
  const toggleLocked = useEditor((state) => state.toggleLocked);
  const reorder = useEditor((state) => state.reorder);
  const duplicate = useEditor((state) => state.duplicate);
  const remove = useEditor((state) => state.remove);

  const ordered = [...design.elements].reverse();

  return (
    <div className="flex min-h-[160px] max-h-[44%] shrink-0 flex-col border-b border-line">
      <header className="flex h-11 shrink-0 items-center justify-between border-b border-line px-3.5">
        <h2 className="text-[13px] font-medium">Layer</h2>
        <span className="mono text-[9px] uppercase tracking-[0.14em] text-faint">
          {design.elements.length} elemen
        </span>
      </header>

      <div className="scroll-slim flex-1 overflow-y-auto p-1.5">
        {ordered.length === 0 ? (
          <p className="px-2 py-3 text-[12px] text-faint">Belum ada elemen.</p>
        ) : (
          ordered.map((element) => {
            const selected = element.id === selectedId;
            return (
              <div
                key={element.id}
                className={cn(
                  "group flex h-8 items-center gap-0.5 rounded px-1 transition-colors",
                  selected ? "bg-accent/10" : "hover:bg-raised"
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
                  onClick={() => select(element.id)}
                  className={cn(
                    "flex-1 truncate text-left text-[12px]",
                    selected ? "text-ink" : element.visible ? "text-muted" : "text-faint line-through"
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
                    element.locked ? "opacity-100" : "opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                  )}
                >
                  {element.locked ? <Lock size={12} /> : <Unlock size={12} />}
                </button>
              </div>
            );
          })
        )}
      </div>

      <div className="flex shrink-0 items-center gap-0.5 border-t border-line px-1.5 py-1.5">
        {(
          [
            ["Naikkan layer", ArrowUp, () => selectedId && reorder(selectedId, "up"), !selectedId],
            ["Turunkan layer", ArrowDown, () => selectedId && reorder(selectedId, "down"), !selectedId],
            ["Duplikat", Copy, () => selectedId && duplicate(selectedId), !selectedId],
            ["Hapus", Trash, () => selectedId && remove(selectedId), !selectedId],
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
  );
}
