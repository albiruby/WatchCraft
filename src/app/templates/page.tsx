"use client";

import { useMemo, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { TemplateCard } from "@/components/TemplateCard";
import { Search } from "@/components/icons";
import { TEMPLATES } from "@/core/templates";

export default function TemplatesPage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return TEMPLATES;
    return TEMPLATES.filter((template) =>
      [template.name, template.description, ...template.tags]
        .join(" ")
        .toLowerCase()
        .includes(needle)
    );
  }, [query]);

  return (
    <AppShell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mono text-[10px] uppercase tracking-[0.2em] text-accent">
            Template
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            Titik awal, bukan hasil akhir
          </h1>
          <p className="mt-2 max-w-[58ch] text-sm leading-relaxed text-muted">
            Setiap template adalah desain sah yang bisa langsung dibuka di editor.
            Semua propertinya bisa diganti, tidak ada yang terkunci.
          </p>
        </div>
        <label className="flex h-9 w-full items-center gap-2 rounded-md border border-line bg-panel px-3 text-muted focus-within:border-line-strong sm:w-64">
          <Search size={15} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari template atau tag"
            className="w-full bg-transparent text-[13px] text-ink outline-none placeholder:text-faint"
            aria-label="Cari template"
          />
        </label>
      </div>

      <p className="mono mt-6 text-[10px] uppercase tracking-[0.16em] text-faint">
        {filtered.length} dari {TEMPLATES.length} template
      </p>

      {filtered.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed border-line-strong bg-panel px-5 py-10 text-center">
          <p className="text-sm text-muted">
            Tidak ada template yang cocok dengan &ldquo;{query}&rdquo;.
          </p>
          <button
            type="button"
            onClick={() => setQuery("")}
            className="mt-3 text-[13px] font-medium text-accent hover:underline"
          >
            Hapus pencarian
          </button>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      )}
    </AppShell>
  );
}
