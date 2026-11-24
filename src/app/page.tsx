"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { BezelDial } from "@/components/BezelDial";
import { DisplayListSvg } from "@/components/DisplayListSvg";
import { Readout } from "@/components/Readout";
import { SimulatorControls, SimulatorWatch, useSimulation } from "@/components/SimulatorPanel";
import { WatchFaceThumbnail } from "@/components/WatchFaceThumbnail";
import { ArrowLeft, Grid, Plus } from "@/components/icons";
import { Badge, Button, Card, CardHeader } from "@/components/ui";
import { groupDigits } from "@/core/data";
import { DEFAULT_DEVICE_ID, DEVICES, apiVersion, getDevice } from "@/core/device-list";
import type { Design } from "@/core/schema";
import { TEMPLATES, cloneDesign, createBlankDesign } from "@/core/templates";
import { readDevicePref, writeDevicePref } from "@/lib/clock";
import { createId, listDesigns, saveDesign } from "@/lib/storage";

export default function DashboardPage() {
  const router = useRouter();
  const sim = useSimulation();
  const [designs, setDesigns] = useState<Design[]>([]);
  const [ready, setReady] = useState(false);
  const [deviceId, setDeviceId] = useState(DEFAULT_DEVICE_ID);

  useEffect(() => {
    setDesigns(listDesigns());
    setReady(true);
    const saved = readDevicePref(DEFAULT_DEVICE_ID);
    if (DEVICES.some((device) => device.id === saved)) setDeviceId(saved);
  }, []);

  function chooseDevice(id: string) {
    setDeviceId(id);
    writeDevicePref(id);
  }

  const device = getDevice(deviceId);

  function open(design: Design) {
    saveDesign(design);
    router.push(`/studio/${design.id}`);
  }

  const featured = TEMPLATES[0];
  const previewDesign =
    designs[0] && designs[0].elements.length >= 2 ? designs[0] : featured.design;
  const [hh, mm] = sim.data.time.split(":");
  const ss = String(sim.data.second).padStart(2, "0");

  return (
    <AppShell>
      {/* Kokpit: jam hidup adalah fokus. Kiri pembacaan besar, kanan perangkat. */}
      <section className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,400px)] lg:gap-12">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted">
            <span className="font-serif text-[22px] italic leading-none text-ink">{device.name}</span>
            <span>{previewDesign.name}</span>
            <Badge tone="accent">Data simulasi</Badge>
          </p>

          <h1 className="sr-only">Studio WATCHCRAFT</h1>
          <p
            className="mt-4 font-display font-semibold tabular-nums leading-[0.82] tracking-[-0.045em] text-ink"
            style={{ fontSize: "clamp(84px, 15vw, 188px)" }}
          >
            {hh}
            <span className="text-faint">:</span>
            {mm}
            <span className="ml-2 align-top text-[0.26em] tracking-normal text-accent">{ss}</span>
          </p>
          <p className="mono mt-3 text-[13px] tracking-[0.08em] text-muted">
            {sim.data.date} / {sim.aod ? "ALWAYS-ON" : sim.live ? "LIVE" : "BEKU"}
          </p>

          <dl className="mt-8 grid grid-cols-3 gap-4 sm:gap-6">
            <Readout label="Detak" value={Math.round(sim.data.heartRate)} unit="bpm" />
            <Readout label="Baterai" value={Math.round(sim.data.battery)} unit="%" />
            <Readout label="Langkah" value={groupDigits(sim.data.steps)} />
          </dl>

          <div className="mt-8 flex flex-wrap items-center gap-2">
            <Button variant="primary" onClick={() => open(createBlankDesign("Untitled", createId()))}>
              <Plus size={16} />
              Watch face baru
            </Button>
            <Button
              variant="secondary"
              onClick={() => open(createBlankDesign("Untitled field", createId(), "datafield"))}
            >
              <Grid size={15} />
              Data field
            </Button>
            <label className="sr-only" htmlFor="device-select">
              Pilih model jam
            </label>
            <select
              id="device-select"
              value={deviceId}
              onChange={(event) => chooseDevice(event.target.value)}
              className="h-9 max-w-[230px] rounded-md border border-line bg-panel px-2 text-[13px] text-ink"
            >
              {DEVICES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} / {item.width}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="min-w-0">
          <SimulatorWatch design={previewDesign} device={device} sim={sim} maxWidth={390} />
        </div>
      </section>

      {/* Panel kontrol lebar di kiri, bukti native dan spesifikasi di kanan. */}
      <section className="mt-14 grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader title="Panel kontrol simulator" meta="Mengubah jam di atas" />
          <div className="p-4">
            <SimulatorControls sim={sim} kind={previewDesign.kind} />
          </div>
        </Card>

        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader title="Spesifikasi" meta={device.id} />
            <dl className="grid grid-cols-2 gap-x-5 gap-y-4 p-4">
              <Readout size="sm" label="Layar" value={`${device.width} x ${device.height}`} unit={device.display} />
              <Readout size="sm" label="API" value={apiVersion(device)} />
              <Readout size="sm" label="Memori watch face" value={Math.round(device.watchFaceMemory / 1024)} unit="KB" />
              <Readout size="sm" label="Keluarga" value={device.family} />
            </dl>
          </Card>

          <Card className="flex flex-1 flex-col overflow-hidden">
            <CardHeader title="Native render" action={<Badge tone="ok">Terverifikasi</Badge>} />
            <div className="grid flex-1 grid-cols-[110px_1fr] items-center gap-4 p-4">
              <div className="overflow-hidden rounded-md bg-white">
                <Image
                  src="/native/fr165-chronograph.png"
                  alt="Template Chronograph dirender oleh interpreter native di Connect IQ Simulator Forerunner 165"
                  width={660}
                  height={755}
                  style={{ width: "100%", height: "auto" }}
                />
              </div>
              <p className="text-[12px] leading-relaxed text-muted">
                Chronograph dari <span className="mono text-ink">.prg</span> asli di Connect IQ
                Simulator. Detak 80 BPM dan baterai 50% berasal dari sensor simulator.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Rail template: semua dial berdetak bersama jam simulator. */}
      <section className="mt-14">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-[26px] font-semibold tracking-tight">Mulai dari template</h2>
          <Link href="/templates" className="text-[13px] text-muted transition-colors hover:text-ink">
            Semua {TEMPLATES.length} template
          </Link>
        </div>
        <ul className="scroll-slim -mx-4 mt-5 flex snap-x gap-5 overflow-x-auto px-4 pb-3">
          {TEMPLATES.filter((t) => t.design.kind === "watchface").map((template) => (
            <li key={template.id} className="w-[176px] shrink-0 snap-start">
              <button
                type="button"
                onClick={() => open(cloneDesign(template.design, template.name, createId()))}
                className="group block w-full rounded-lg text-left"
                aria-label={`Buka template ${template.name} di editor`}
              >
                <BezelDial live={sim.live} className="transition-transform duration-150 group-hover:scale-[1.03]">
                  <DisplayListSvg design={template.design} data={sim.data} label={`Template ${template.name}`} />
                </BezelDial>
                <span className="mt-3 block text-[14px] font-medium group-hover:text-accent">
                  {template.name}
                </span>
                <span className="mono block text-[11px] text-faint">{template.tags.join(" / ")}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-[26px] font-semibold tracking-tight">Desain terakhir</h2>
            <p className="mt-1 text-[13px] text-muted">Tersimpan lokal di browser ini.</p>
          </div>
          <Link
            href="/library"
            className="inline-flex items-center gap-1.5 text-[13px] text-muted transition-colors hover:text-ink"
          >
            Buka library
            <ArrowLeft size={14} className="rotate-180" />
          </Link>
        </div>

        <div className="mt-5">
          {!ready ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-busy="true">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-56 animate-pulse rounded-lg border border-line bg-panel" />
              ))}
            </div>
          ) : designs.length === 0 ? (
            <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed border-line-strong bg-panel px-5 py-8">
              <p className="max-w-[46ch] text-sm text-muted">
                Belum ada desain tersimpan. Buka satu template dari rail di atas, atau mulai
                dari watch face kosong.
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => open(createBlankDesign("Untitled", createId()))}
              >
                <Plus size={14} />
                Watch face baru
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {designs.slice(0, 8).map((design) => (
                <Link key={design.id} href={`/studio/${design.id}`} className="group">
                  <Card className="overflow-hidden transition-colors group-hover:border-line-strong">
                    <div className="p-3">
                      <WatchFaceThumbnail design={design} data={sim.data} />
                    </div>
                    <div className="flex items-center justify-between gap-2 border-t border-line px-3.5 py-2.5">
                      <span className="truncate text-[13px] font-medium">{design.name}</span>
                      <span className="mono text-[11px] text-faint">{design.elements.length} el</span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
}
