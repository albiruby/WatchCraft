"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { BezelDial } from "@/components/BezelDial";
import { DisplayListSvg } from "@/components/DisplayListSvg";
import { Readout } from "@/components/Readout";
import { WatchFaceThumbnail } from "@/components/WatchFaceThumbnail";
import { Copy, Download, Plus, Trash } from "@/components/icons";
import { Badge, Button, Card } from "@/components/ui";
import { safeParseDesign, type Design } from "@/core/schema";
import { cloneDesign, createBlankDesign } from "@/core/templates";
import { createId, deleteDesign, listDesigns, saveDesign } from "@/lib/storage";
import { useLiveData } from "@/lib/useLiveData";

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Tanpa tanggal";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function sinceLabel(iso: string): string {
  const time = new Date(iso).getTime();
  if (Number.isNaN(time)) return "-";
  const minutes = Math.max(0, Math.round((Date.now() - time) / 60000));
  if (minutes < 1) return "baru saja";
  if (minutes < 60) return `${minutes} mnt`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours} jam`;
  return `${Math.round(hours / 24)} hari`;
}

export default function LibraryPage() {
  const data = useLiveData();
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

  const latest = designs[0] ?? null;
  const watchfaces = designs.filter((design) => design.kind === "watchface").length;

  return (
    <AppShell>
      {/* Kokpit library: angka nyata dari localStorage, desain terakhir hidup di dial. */}
      <section className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,340px)] lg:gap-14">
        <div className="min-w-0">
          <h1
            className="font-display font-semibold leading-[0.9] tracking-[-0.035em]"
            style={{ fontSize: "clamp(48px, 8vw, 104px)" }}
          >
            Library
          </h1>
          <p className="mt-3 max-w-[56ch] text-[15px] leading-relaxed text-muted">
            Semua desain disimpan di browser ini. Export JSON untuk memindahkannya,
            atau import file yang sudah ada.
          </p>
          <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
            <Readout label="Desain" value={ready ? designs.length : "-"} />
            <Readout label="Watch face" value={ready ? watchfaces : "-"} />
            <Readout label="Data field" value={ready ? designs.length - watchfaces : "-"} />
            <Readout label="Terakhir diubah" value={latest ? sinceLabel(latest.updatedAt) : "-"} />
          </dl>
        </div>
        <div className="mx-auto w-full max-w-[340px]">
          {latest ? (
            <Link href={`/studio/${latest.id}`} className="group block" aria-label={`Buka ${latest.name}, desain terakhir`}>
              <BezelDial>
                <DisplayListSvg design={latest} data={data} label={`Pratinjau live ${latest.name}`} />
              </BezelDial>
              <span className="mt-3 block text-center text-[14px] font-medium group-hover:text-accent">
                {latest.name}
              </span>
            </Link>
          ) : (
            <BezelDial live={false}>
              <div className="grid h-full place-items-center p-10 text-center text-[13px] text-white/70">
                Belum ada desain
              </div>
            </BezelDial>
          )}
        </div>
      </section>

      <div className="mt-12 flex flex-wrap items-end justify-between gap-4">
        <h2 className="font-display text-[26px] font-semibold tracking-tight">Semua desain</h2>
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
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {designs.map((design) => (
            <Card key={design.id} className="overflow-hidden">
              <Link href={`/studio/${design.id}`} className="block p-3" aria-label={`Buka ${design.name}`}>
                <WatchFaceThumbnail design={design} data={data} />
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
                    <p className="mono mt-1 text-[11px] text-faint">
                      {design.kind === "datafield" ? "data field" : "watch face"} /{" "}
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
