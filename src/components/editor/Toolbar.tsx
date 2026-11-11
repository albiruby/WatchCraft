"use client";

import Link from "next/link";

import { ArrowLeft, Check, Download, Redo, Undo } from "@/components/icons";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Badge, Button } from "@/components/ui";
import { SIMULATED_DATA } from "@/core/data";
import { buildStandaloneSvg } from "@/core/svg";
import { useCanRedo, useCanUndo, useEditor } from "@/stores/editor";

function slug(name: string): string {
  const base = name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || "watchcraft";
}

function download(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function Toolbar({ saved }: { saved: boolean }) {
  const design = useEditor((state) => state.design);
  const rename = useEditor((state) => state.rename);
  const undo = useEditor((state) => state.undo);
  const redo = useEditor((state) => state.redo);
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();

  function exportJson() {
    download(
      `${slug(design.name)}.watchface.json`,
      JSON.stringify(design, null, 2),
      "application/json"
    );
  }

  function exportSvg() {
    download(
      `${slug(design.name)}.svg`,
      buildStandaloneSvg(design, SIMULATED_DATA),
      "image/svg+xml"
    );
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-line bg-panel px-2.5">
      <div className="flex min-w-0 items-center gap-1.5">
        <Link
          href="/library"
          aria-label="Kembali ke library"
          title="Kembali ke library"
          className="grid size-9 shrink-0 place-items-center rounded-md text-muted transition-colors hover:bg-raised hover:text-ink"
        >
          <ArrowLeft size={16} />
        </Link>
        <span className="mono hidden select-none px-1 text-[10px] text-faint sm:block">/</span>
        <label className="sr-only" htmlFor="design-name">
          Nama desain
        </label>
        <input
          id="design-name"
          value={design.name}
          onChange={(event) => rename(event.target.value)}
          className="h-8 w-36 min-w-0 truncate rounded border border-transparent bg-transparent px-2 text-[13px] font-medium outline-none transition-colors hover:border-line focus:border-line-strong sm:w-52"
        />
        <Badge className="hidden md:inline-flex">FR165</Badge>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <span className="mono mr-1 hidden items-center gap-1.5 text-[9px] uppercase tracking-[0.14em] text-faint lg:flex">
          {saved ? (
            <>
              <Check size={12} className="text-ok" />
              Tersimpan
            </>
          ) : (
            "Menyimpan"
          )}
        </span>

        <ThemeToggle />

        <div className="flex items-center rounded-md border border-line">
          <button
            type="button"
            onClick={undo}
            disabled={!canUndo}
            aria-label="Undo"
            title="Undo (Ctrl+Z)"
            className="grid size-8 place-items-center rounded-l text-muted transition-colors hover:bg-raised hover:text-ink disabled:opacity-35"
          >
            <Undo size={15} />
          </button>
          <span className="h-5 w-px bg-line" />
          <button
            type="button"
            onClick={redo}
            disabled={!canRedo}
            aria-label="Redo"
            title="Redo (Ctrl+Shift+Z)"
            className="grid size-8 place-items-center rounded-r text-muted transition-colors hover:bg-raised hover:text-ink disabled:opacity-35"
          >
            <Redo size={15} />
          </button>
        </div>

        <Button variant="secondary" size="sm" onClick={exportJson} className="hidden sm:inline-flex">
          <Download size={14} />
          JSON
        </Button>
        <Button variant="primary" size="sm" onClick={exportSvg}>
          <Download size={14} />
          <span className="hidden sm:inline">Export SVG</span>
          <span className="sm:hidden">SVG</span>
        </Button>
      </div>
    </header>
  );
}
