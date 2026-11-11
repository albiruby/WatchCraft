"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui";
import { cloneDesign, getTemplate } from "@/core/templates";
import { createId, loadDesign, saveDesign } from "@/lib/storage";
import { useEditor } from "@/stores/editor";
import { EditorShell } from "./EditorShell";

export function StudioClient({ id }: { id: string }) {
  const router = useRouter();
  const load = useEditor((state) => state.load);
  const [status, setStatus] = useState<"loading" | "ready" | "missing">("loading");

  useEffect(() => {
    const stored = loadDesign(id);
    if (stored) {
      load(stored);
      setStatus("ready");
      return;
    }

    const template = getTemplate(id);
    if (template) {
      const newId = createId();
      const design = cloneDesign(template.design, template.name, newId);
      saveDesign(design);
      router.replace(`/studio/${newId}`);
      return;
    }

    setStatus("missing");
  }, [id, load, router]);

  if (status === "loading") {
    return (
      <div className="grid h-dvh place-items-center">
        <span className="mono text-[10px] uppercase tracking-[0.16em] text-faint">
          Memuat desain
        </span>
      </div>
    );
  }

  if (status === "missing") {
    return (
      <div className="grid h-dvh place-items-center p-6">
        <div className="w-full max-w-sm rounded-lg border border-line bg-panel p-6">
          <Badge tone="accent">Tidak ditemukan</Badge>
          <h1 className="mt-3 text-lg font-medium tracking-tight">
            Desain tidak ada di browser ini
          </h1>
          <p className="mt-2 text-[13px] leading-relaxed text-muted">
            Data lokal bisa hilang kalau penyimpanan situs dibersihkan. Import
            file JSON yang pernah lo export untuk membukanya lagi.
          </p>
          <div className="mt-5 flex gap-2">
            <Link
              href="/library"
              className="inline-flex h-9 items-center rounded-md bg-accent px-3.5 text-sm font-medium text-accent-ink"
            >
              Ke library
            </Link>
            <Link
              href="/templates"
              className="inline-flex h-9 items-center rounded-md border border-line bg-raised px-3.5 text-sm font-medium"
            >
              Template
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <EditorShell />;
}
