"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { BezelDial } from "@/components/BezelDial";
import { DisplayListSvg } from "@/components/DisplayListSvg";
import { Search } from "@/components/icons";
import { Badge, Button } from "@/components/ui";
import { TEMPLATES, cloneDesign, type Template } from "@/core/templates";
import { cn } from "@/lib/cn";
import { createId, saveDesign } from "@/lib/storage";
import { useLiveData } from "@/lib/useLiveData";

type Kind = "all" | "analog" | "watchface" | "datafield";

const FILTERS: Array<[Kind, string]> = [
  ["all", "Semua"],
  ["analog", "Analog"],
  ["watchface", "Watch face"],
  ["datafield", "Data field"],
];

function matches(template: Template, kind: Kind, needle: string): boolean {
  if (kind === "analog" && !template.tags.includes("analog")) return false;
  if ((kind === "watchface" || kind === "datafield") && template.design.kind !== kind) return false;
  if (!needle) return true;
  return [template.name, template.description, ...template.tags]
    .join(" ")
    .toLowerCase()
    .includes(needle);
}

export default function TemplatesPage() {
  const router = useRouter();
  const data = useLiveData();
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<Kind>("all");
  const [selectedId, setSelectedId] = useState(TEMPLATES[0].id);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return TEMPLATES.filter((template) => matches(template, kind, needle));
  }, [query, kind]);

  const selected =
    filtered.find((template) => template.id === selectedId) ?? filtered[0] ?? null;
  const index = selected ? filtered.indexOf(selected) : -1;

  function step(delta: number) {
    if (filtered.length === 0) return;
    const next = filtered[(index + delta + filtered.length) % filtered.length];
    setSelectedId(next.id);
  }

  function openInEditor(template: Template) {
    const id = createId();
    saveDesign(cloneDesign(template.design, template.name, id));
    router.push(`/studio/${id}`);
  }

  return (
    <AppShell>
      {/* Spotlight: satu template besar dan hidup, sisanya katalog di bawah. */}
      <section
        aria-label="Template terpilih"
        className="grid items-center gap-8 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:gap-14"
      >
        <div className="mx-auto w-full max-w-[420px]">
          {selected ? (
            <BezelDial>
              <DisplayListSvg design={selected.design} data={data} label={`Pratinjau live ${selected.name}`} />
            </BezelDial>
          ) : (
            <BezelDial live={false}>
              <div className="grid h-full place-items-center p-10 text-center text-[13px] text-white/70">
                Tidak ada template yang cocok.
              </div>
            </BezelDial>
          )}
        </div>

        <div className="min-w-0">
          <p className="mono text-[13px] text-muted">
            {index >= 0 ? String(index + 1).padStart(2, "0") : "00"}
            <span className="text-faint"> / {String(filtered.length).padStart(2, "0")}</span>
          </p>
          <h1
            className="mt-2 font-display font-semibold leading-[0.9] tracking-[-0.035em]"
            style={{ fontSize: "clamp(48px, 8vw, 104px)" }}
          >
            {selected?.name ?? "Kosong"}
          </h1>
          {selected ? (
            <>
              <p className="mt-4 max-w-[48ch] text-[15px] leading-relaxed text-muted">
                {selected.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                <Badge tone="accent">{selected.design.kind === "datafield" ? "Data field" : "Watch face"}</Badge>
                {selected.tags.map((tag) => (
                  <Badge key={tag}>{tag}</Badge>
                ))}
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-2">
                <Button variant="primary" onClick={() => openInEditor(selected)}>
                  Buka {selected.name} di editor
                </Button>
                <Button variant="secondary" onClick={() => step(-1)} aria-label="Template sebelumnya">
                  Sebelumnya
                </Button>
                <Button variant="secondary" onClick={() => step(1)} aria-label="Template berikutnya">
                  Berikutnya
                </Button>
              </div>
              <p className="mt-4 text-[12px] text-faint">
                Pratinjau memakai jam perangkat ini dan data simulasi.
              </p>
            </>
          ) : null}
        </div>
      </section>

      <section className="mt-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <fieldset className="flex flex-wrap gap-1.5">
            <legend className="sr-only">Filter template</legend>
            {FILTERS.map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setKind(value)}
                aria-pressed={kind === value}
                className={cn(
                  "h-9 rounded-md border px-3 text-[13px] font-medium transition-colors",
                  kind === value
                    ? "border-accent/60 bg-accent/10 text-ink"
                    : "border-line bg-raised text-muted hover:text-ink"
                )}
              >
                {label}
              </button>
            ))}
          </fieldset>
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

        {filtered.length === 0 ? (
          <div className="mt-6 rounded-lg border border-dashed border-line-strong bg-panel px-5 py-10 text-center">
            <p className="text-sm text-muted">
              Tidak ada template yang cocok dengan &ldquo;{query}&rdquo;.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setKind("all");
              }}
              className="mt-3 text-[13px] font-medium text-accent hover:underline"
            >
              Hapus filter
            </button>
          </div>
        ) : (
          <ul className="mt-6 grid grid-cols-2 gap-x-5 gap-y-7 sm:grid-cols-3 lg:grid-cols-6">
            {filtered.map((template) => {
              const active = template.id === selected?.id;
              return (
                <li key={template.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(template.id)}
                    aria-pressed={active}
                    className="group block w-full rounded-lg text-left"
                  >
                    <BezelDial
                      live={active}
                      className={cn(
                        "rounded-full transition-[transform,opacity] duration-150",
                        active ? "scale-[1.02]" : "opacity-80 group-hover:opacity-100"
                      )}
                    >
                      <DisplayListSvg design={template.design} data={data} label={`Template ${template.name}`} />
                    </BezelDial>
                    <span
                      className={cn(
                        "mt-3 block text-[14px] font-medium",
                        active ? "text-accent" : "group-hover:text-ink"
                      )}
                    >
                      {template.name}
                    </span>
                    <span className="mono block text-[11px] text-faint">
                      {template.design.kind === "datafield" ? "data field" : template.tags[0]}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </AppShell>
  );
}
