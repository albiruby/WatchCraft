"use client";

import { useMemo, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { TemplateCard } from "@/components/TemplateCard";
import { Search } from "@/components/icons";
import { cn } from "@/lib/cn";
import { TEMPLATES } from "@/core/templates";

export default function TemplatesPage() {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<"all" | "watchface" | "datafield">("all");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const base =
      kind === "all" ? TEMPLATES : TEMPLATES.filter((template) => template.design.kind === kind);
    if (!needle) return base;
    return base.filter((template) =>
      [template.name, template.description, ...template.tags]
        .join(" ")
        .toLowerCase()
        .includes(needle)
    );
  }, [query, kind]);

  return (
    <AppShell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Template</h1>
          <p className="mt-2 max-w-[58ch] text-sm leading-relaxed text-muted">
            Ambil satu sebagai titik awal. Semua properti bisa diganti, tidak ada
            yang terkunci.
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

      <div className="mt-4 flex flex-wrap gap-1.5">
        {(
          [
            ["all", "Semua"],
            ["watchface", "Watch face"],
            ["datafield", "Data field"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setKind(value)}
            aria-pressed={kind === value}
            className={cn(
              "h-7 rounded border px-2.5 text-[11px] font-medium transition-colors",
              kind === value
                ? "border-accent/50 bg-accent/10 text-ink"
                : "border-line bg-raised text-muted hover:text-ink"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <p className="mt-6 text-[11px] text-faint">
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
