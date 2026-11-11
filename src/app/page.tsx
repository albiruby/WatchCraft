"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/components/AppShell";
import { SimulatorPanel } from "@/components/SimulatorPanel";
import { TemplateCard } from "@/components/TemplateCard";
import { WatchFaceThumbnail } from "@/components/WatchFaceThumbnail";
import { ArrowLeft, Grid, Plus, Watch } from "@/components/icons";
import { Badge, Button, Card, CardHeader } from "@/components/ui";
import { FR165 } from "@/core/devices";
import type { Design } from "@/core/schema";
import { TEMPLATES, createBlankDesign } from "@/core/templates";
import { createId, listDesigns, saveDesign } from "@/lib/storage";

export default function DashboardPage() {
  const router = useRouter();
  const [designs, setDesigns] = useState<Design[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setDesigns(listDesigns());
    setReady(true);
  }, []);

  function newDesign() {
    const id = createId();
    saveDesign(createBlankDesign("Untitled", id));
    router.push(`/studio/${id}`);
  }

  const featured = TEMPLATES[0];
  const previewDesign =
    designs[0] && designs[0].elements.length >= 2 ? designs[0] : featured.design;

  return (
    <AppShell>
      <section className="grid items-start gap-8 lg:grid-cols-[1.35fr_1fr]">
        <div>
          <p className="mono text-[10px] uppercase tracking-[0.2em] text-accent">
            Watch face studio
          </p>
          <h1 className="mt-3 max-w-[17ch] text-[34px] leading-[1.08] font-semibold tracking-tight sm:text-[42px]">
            Rancang di browser. Render di jam.
          </h1>
          <p className="mt-4 max-w-[54ch] text-[15px] leading-relaxed text-muted">
            Editor kanvas 390 x 390 dengan preview data simulasi. Desain yang sama
            dibaca oleh renderer native Monkey C di Forerunner 165, jadi yang lo
            lihat di sini adalah geometri yang benar-benar digambar di layar jam.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-2.5">
            <Button variant="primary" onClick={newDesign}>
              <Plus size={16} />
              Mulai desain baru
            </Button>
            <Link
              href="/templates"
              className="inline-flex h-9 items-center gap-2 rounded-md border border-line bg-raised px-3.5 text-sm font-medium text-ink transition-colors hover:border-line-strong"
            >
              <Grid size={15} />
              Lihat template
            </Link>
          </div>
          <dl className="mt-8 grid max-w-md grid-cols-3 gap-3">
            {[
              ["Kanvas", "390 x 390"],
              ["Perangkat", "FR165"],
              ["Render", "Native"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-md border border-line bg-panel px-3 py-2.5">
                <dt className="mono text-[9px] uppercase tracking-[0.16em] text-faint">
                  {label}
                </dt>
                <dd className="mono mt-1 text-[13px]">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <div className="flex items-center gap-2">
              <Watch size={15} className="text-muted" />
              <span className="text-[13px] font-medium">{FR165.name}</span>
            </div>
            <Badge tone="accent">Target</Badge>
          </div>
          <div className="p-4">
            <WatchFaceThumbnail design={featured.design} label="Contoh watch face" />
          </div>
          <dl className="grid grid-cols-2 gap-px border-t border-line bg-line">
            {[
              ["Layar", "390 x 390 AMOLED"],
              ["API level", FR165.api],
              ["Memori watch face", "128 KB"],
              ["Warna", "16 bpp"],
            ].map(([label, value]) => (
              <div key={label} className="bg-panel px-4 py-3">
                <dt className="mono text-[9px] uppercase tracking-[0.14em] text-faint">
                  {label}
                </dt>
                <dd className="mt-1 text-[13px]">{value}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </section>

      <section className="mt-12">
        <div className="max-w-[64ch]">
          <p className="mono text-[10px] uppercase tracking-[0.2em] text-accent">
            Simulator
          </p>
          <h2 className="mt-2 text-lg font-medium tracking-tight">
            Coba di Forerunner 165
          </h2>
          <p className="mt-1 text-[13px] leading-relaxed text-muted">
            Ubah data simulasi, kanvas langsung ikut. Kartu kanan adalah tangkapan
            layar asli dari Connect IQ Simulator, bukan mockup.
          </p>
        </div>
        <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_300px]">
          <SimulatorPanel design={previewDesign} />
          <Card className="flex flex-col overflow-hidden">
            <CardHeader
              title="Native render"
              action={<Badge tone="ok">Terverifikasi</Badge>}
            />
            <div className="flex flex-1 items-center justify-center bg-[#E9EBEE] px-4 py-5">
              <Image
                src="/native/fr165-quiet.png"
                alt="Watch face WATCHCRAFT dirender di simulator Connect IQ Forerunner 165"
                width={440}
                height={784}
                style={{ width: "100%", maxWidth: 240, height: "auto" }}
              />
            </div>
            <div className="border-t border-line p-4">
              <p className="text-[12px] leading-relaxed text-muted">
                Layout Quiet dijalankan dari file <span className="mono text-ink">.prg</span>{" "}
                yang sama dengan hasil <span className="mono text-ink">pnpm watchface</span>.
                Jam 15:25, baterai 62%.
              </p>
            </div>
          </Card>
        </div>
      </section>

      <section className="mt-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-medium tracking-tight">Desain terakhir</h2>
            <p className="mt-1 text-[13px] text-muted">
              Tersimpan lokal di browser ini.
            </p>
          </div>
          <Link
            href="/library"
            className="inline-flex items-center gap-1.5 text-[13px] text-muted transition-colors hover:text-ink"
          >
            Buka library
            <ArrowLeft size={14} className="rotate-180" />
          </Link>
        </div>

        <div className="mt-4">
          {!ready ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-56 animate-pulse rounded-lg border border-line bg-panel" />
              ))}
            </div>
          ) : designs.length === 0 ? (
            <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed border-line-strong bg-panel px-5 py-8">
              <span className="mono text-[10px] uppercase tracking-[0.16em] text-faint">
                Kosong
              </span>
              <p className="max-w-[46ch] text-sm text-muted">
                Belum ada desain yang tersimpan. Mulai dari kanvas kosong atau ambil
                satu template sebagai titik awal.
              </p>
              <div className="flex gap-2">
                <Button variant="primary" size="sm" onClick={newDesign}>
                  <Plus size={14} />
                  Desain baru
                </Button>
                <Link
                  href="/templates"
                  className="inline-flex h-8 items-center rounded-md border border-line bg-raised px-3 text-[13px] font-medium text-ink"
                >
                  Template
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {designs.slice(0, 6).map((design) => (
                <Link key={design.id} href={`/studio/${design.id}`} className="group">
                  <Card className="overflow-hidden transition-colors group-hover:border-line-strong">
                    <div className="p-3">
                      <WatchFaceThumbnail design={design} />
                    </div>
                    <div className="flex items-center justify-between gap-2 border-t border-line px-3.5 py-2.5">
                      <span className="truncate text-[13px] font-medium">{design.name}</span>
                      <span className="mono text-[10px] text-faint">
                        {design.elements.length} el
                      </span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mt-12">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-lg font-medium tracking-tight">Mulai dari template</h2>
          <Link
            href="/templates"
            className="text-[13px] text-muted transition-colors hover:text-ink"
          >
            Semua template
          </Link>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TEMPLATES.slice(1, 4).map((template) => (
            <TemplateCard key={template.id} template={template} compact />
          ))}
        </div>
      </section>
    </AppShell>
  );
}
