"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { WatchFaceThumbnail } from "@/components/WatchFaceThumbnail";
import { Copy, Download, Plus, Trash } from "@/components/icons";
import { Badge, Button, Card } from "@/components/ui";
import { safeParseDesign, type Design } from "@/core/schema";
import { cloneDesign, createBlankDesign } from "@/core/templates";
import { createId, deleteDesign, listDesigns, saveDesign } from "@/lib/storage";

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Tanpa tanggal";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function LibraryPage() {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function refresh() {
    setDesigns(listDesigns());
  }

  useEffect(() => {
    setDesigns(listDesigns());
    setReady(true);
  }, []);

  function handleDelete(design: Design) {
    const confirmed = window.confirm(`Hapus "${design.name}" dari browser ini?`);
    if (!confirmed) return;
    deleteDesign(design.id);
    refresh();
    setMessage(`"${design.name}" dihapus.`);
  }

  function handleDuplicate(design: Design) {
    const id = createId();
    saveDesign(cloneDesign(design, `${design.name} copy`, id));
    refresh();
    setMessage("Salinan dibuat.");
  }

  function handleNew() {
    const id = createId();
    saveDesign(createBlankDesign("Untitled", id));
    refresh();
    setMessage("Desain baru dibuat. Buka dari daftar.");
  }

  async function handleImport(file: File) {
    try {
      const text = await file.text();
      const parsed = safeParseDesign(JSON.parse(text));
      if (!parsed.ok) {
        setMessage(`Import gagal: ${parsed.message}`);
        return;
      }
      const id = createId();
      const design = { ...parsed.design, id, updatedAt: new Date().toISOString() };
      saveDesign(design);
      refresh();
      setMessage(`"${design.name}" diimpor.`);
    } catch {
      setMessage("Import gagal: file bukan JSON yang valid.");
    }
  }

  return (
    <AppShell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Desain tersimpan</h1>
          <p className="mt-2 max-w-[58ch] text-sm leading-relaxed text-muted">
            Semua desain disimpan di browser ini. Export JSON untuk memindahkannya,
            atau import file yang sudah ada.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handleImport(file);
              event.target.value = "";
            }}
          />
          <Button variant="secondary" onClick={() => fileRef.current?.click()}>
            <Download size={15} />
            Import JSON
          </Button>
          <Button variant="primary" onClick={handleNew}>
            <Plus size={15} />
            Desain baru
          </Button>
        </div>
      </div>

      {message ? (
        <div
          role="status"
          className="mt-5 flex items-center justify-between gap-3 rounded-md border border-line bg-panel px-3.5 py-2.5 text-[13px]"
        >
          <span className="text-muted">{message}</span>
          <button
            type="button"
            onClick={() => setMessage(null)}
            className="mono text-[10px] uppercase tracking-[0.14em] text-faint hover:text-ink"
          >
            Tutup
          </button>
        </div>
      ) : null}

      {!ready ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-lg border border-line bg-panel" />
          ))}
        </div>
      ) : designs.length === 0 ? (
        <div className="mt-6 flex flex-col items-start gap-3 rounded-lg border border-dashed border-line-strong bg-panel px-5 py-10">
          <Badge>Kosong</Badge>
          <p className="max-w-[50ch] text-sm leading-relaxed text-muted">
            Belum ada desain tersimpan. Mulai dari kanvas kosong, ambil template,
            atau import file JSON yang pernah lo export.
          </p>
          <div className="flex gap-2">
            <Button variant="primary" size="sm" onClick={handleNew}>
              <Plus size={14} />
              Desain baru
            </Button>
            <Link
              href="/templates"
              className="inline-flex h-8 items-center rounded-md border border-line bg-raised px-3 text-[13px] font-medium"
            >
              Lihat template
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {designs.map((design) => (
            <Card key={design.id} className="overflow-hidden">
              <Link href={`/studio/${design.id}`} className="block p-3" aria-label={`Buka ${design.name}`}>
                <WatchFaceThumbnail design={design} />
              </Link>
              <div className="border-t border-line px-3.5 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link
                      href={`/studio/${design.id}`}
                      className="block truncate text-[13px] font-medium hover:text-accent"
                    >
                      {design.name}
                    </Link>
                    <p className="mono mt-1 text-[10px] uppercase tracking-[0.12em] text-faint">
                      {design.kind === "datafield" ? "FIELD" : "FR165"} /{" "}
                      {formatDate(design.updatedAt)} / {design.elements.length} elemen
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => handleDuplicate(design)}
                      aria-label={`Duplikat ${design.name}`}
                      title="Duplikat"
                      className="grid size-7 place-items-center rounded text-faint transition-colors hover:bg-raised hover:text-ink"
                    >
                      <Copy size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(design)}
                      aria-label={`Hapus ${design.name}`}
                      title="Hapus"
                      className="grid size-7 place-items-center rounded text-faint transition-colors hover:bg-danger/10 hover:text-danger"
                    >
                      <Trash size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
