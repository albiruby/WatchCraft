"use client";

import { Plus } from "@/components/icons";
import {
  arcElementSchema,
  shapeElementSchema,
  textElementSchema,
  type DesignElement,
} from "@/core/schema";
import { useEditor } from "@/stores/editor";

function uid(kind: string): string {
  return `e-${kind}-${Math.random().toString(36).slice(2, 7)}`;
}

type Item = { key: string; label: string; hint: string; make: () => DesignElement };

const GROUPS: Array<{ title: string; items: Item[] }> = [
  {
    title: "Metrik",
    items: [
      {
        key: "time",
        label: "Waktu",
        hint: "Jam besar",
        make: () =>
          textElementSchema.parse({
            id: uid("time"),
            type: "text",
            x: 195,
            y: 195,
            metric: "time",
            size: 64,
            family: "digits",
            weight: "bold",
          }),
      },
      {
        key: "date",
        label: "Tanggal",
        hint: "Hari dan tanggal",
        make: () =>
          textElementSchema.parse({
            id: uid("date"),
            type: "text",
            x: 195,
            y: 250,
            metric: "date",
            size: 15,
            color: "#98A2B3",
          }),
      },
      {
        key: "steps",
        label: "Langkah",
        hint: "Jumlah langkah",
        make: () =>
          textElementSchema.parse({
            id: uid("steps"),
            type: "text",
            x: 195,
            y: 290,
            metric: "steps",
            size: 20,
          }),
      },
      {
        key: "hr",
        label: "Detak",
        hint: "Heart rate",
        make: () =>
          textElementSchema.parse({
            id: uid("hr"),
            type: "text",
            x: 195,
            y: 140,
            metric: "heartRate",
            size: 22,
          }),
      },
      {
        key: "battery",
        label: "Baterai",
        hint: "Persentase",
        make: () =>
          textElementSchema.parse({
            id: uid("battery"),
            type: "text",
            x: 195,
            y: 118,
            metric: "battery",
            size: 18,
          }),
      },
      {
        key: "calories",
        label: "Kalori",
        hint: "Total kalori",
        make: () =>
          textElementSchema.parse({
            id: uid("calories"),
            type: "text",
            x: 195,
            y: 150,
            metric: "calories",
            size: 18,
          }),
      },
      {
        key: "distance",
        label: "Jarak",
        hint: "Kilometer",
        make: () =>
          textElementSchema.parse({
            id: uid("distance"),
            type: "text",
            x: 195,
            y: 260,
            metric: "distance",
            size: 18,
          }),
      },
      {
        key: "notifications",
        label: "Notif",
        hint: "Jumlah pesan",
        make: () =>
          textElementSchema.parse({
            id: uid("notifications"),
            type: "text",
            x: 195,
            y: 110,
            metric: "notifications",
            size: 14,
          }),
      },
      {
        key: "weather",
        label: "Suhu",
        hint: "Cuaca",
        make: () =>
          textElementSchema.parse({
            id: uid("weather"),
            type: "text",
            x: 195,
            y: 300,
            metric: "weather",
            size: 18,
          }),
      },
      {
        key: "floors",
        label: "Lantai",
        hint: "Floors climbed",
        make: () =>
          textElementSchema.parse({
            id: uid("floors"),
            type: "text",
            x: 195,
            y: 280,
            metric: "floors",
            size: 16,
          }),
      },
      {
        key: "active",
        label: "Aktif",
        hint: "Active minutes",
        make: () =>
          textElementSchema.parse({
            id: uid("active"),
            type: "text",
            x: 195,
            y: 310,
            metric: "activeMinutes",
            size: 16,
          }),
      },
      {
        key: "stress",
        label: "Stress",
        hint: "Level stress",
        make: () =>
          textElementSchema.parse({
            id: uid("stress"),
            type: "text",
            x: 120,
            y: 150,
            metric: "stress",
            size: 24,
          }),
      },
      {
        key: "body",
        label: "Body batt",
        hint: "Body battery",
        make: () =>
          textElementSchema.parse({
            id: uid("body"),
            type: "text",
            x: 270,
            y: 150,
            metric: "bodyBattery",
            size: 24,
          }),
      },
      {
        key: "vo2max",
        label: "VO2",
        hint: "VO2 max",
        make: () =>
          textElementSchema.parse({
            id: uid("vo2max"),
            type: "text",
            x: 195,
            y: 330,
            metric: "vo2max",
            size: 18,
          }),
      },
      {
        key: "altitude",
        label: "Altitud",
        hint: "Ketinggian",
        make: () =>
          textElementSchema.parse({
            id: uid("altitude"),
            type: "text",
            x: 195,
            y: 90,
            metric: "altitude",
            size: 14,
          }),
      },
      {
        key: "pace",
        label: "Pace",
        hint: "Menit per km",
        make: () =>
          textElementSchema.parse({
            id: uid("pace"),
            type: "text",
            x: 195,
            y: 175,
            metric: "pace",
            size: 44,
            family: "digits",
            weight: "bold",
          }),
      },
      {
        key: "timer",
        label: "Timer",
        hint: "Waktu lari",
        make: () =>
          textElementSchema.parse({
            id: uid("timer"),
            type: "text",
            x: 195,
            y: 265,
            metric: "timer",
            size: 24,
          }),
      },
      {
        key: "cadence",
        label: "Cadence",
        hint: "Langkah per menit",
        make: () =>
          textElementSchema.parse({
            id: uid("cadence"),
            type: "text",
            x: 195,
            y: 320,
            metric: "cadence",
            size: 16,
            color: "#8A93A3",
          }),
      },
      {
        key: "speed",
        label: "Kecepatan",
        hint: "KM per jam",
        make: () =>
          textElementSchema.parse({
            id: uid("speed"),
            type: "text",
            x: 195,
            y: 120,
            metric: "speed",
            size: 16,
          }),
      },
      {
        key: "lap",
        label: "Lap",
        hint: "Lap ke berapa",
        make: () =>
          textElementSchema.parse({
            id: uid("lap"),
            type: "text",
            x: 195,
            y: 90,
            metric: "lap",
            size: 12,
            tracking: 2,
            color: "#FF7A1A",
          }),
      },
    ],
  },
  {
    title: "Teks",
    items: [
      {
        key: "label",
        label: "Label",
        hint: "Teks bebas",
        make: () =>
          textElementSchema.parse({
            id: uid("label"),
            type: "text",
            x: 195,
            y: 110,
            metric: "label",
            text: "LABEL",
            size: 11,
            tracking: 2,
            color: "#98A2B3",
          }),
      },
    ],
  },
  {
    title: "Bentuk",
    items: [
      {
        key: "rect",
        label: "Kotak",
        hint: "Garis pemisah",
        make: () =>
          shapeElementSchema.parse({
            id: uid("rect"),
            type: "shape",
            shape: "rect",
            x: 145,
            y: 145,
            w: 100,
            h: 100,
            radius: 8,
            fill: "#171E28",
          }),
      },
      {
        key: "circle",
        label: "Lingkaran",
        hint: "Bidang bulat",
        make: () =>
          shapeElementSchema.parse({
            id: uid("circle"),
            type: "shape",
            shape: "circle",
            x: 145,
            y: 145,
            w: 100,
            h: 100,
            fill: "#171E28",
          }),
      },
      {
        key: "arc",
        label: "Busur",
        hint: "Progress ring",
        make: () =>
          arcElementSchema.parse({
            id: uid("arc"),
            type: "arc",
            x: 45,
            y: 45,
            w: 300,
            h: 300,
            width: 4,
            metric: "battery",
            sweep: 360,
          }),
      },
    ],
  },
];

export function ComponentLibrary() {
  const add = useEditor((state) => state.add);

  return (
    <div>
      <header className="flex h-11 items-center justify-between border-b border-line px-3.5">
        <h2 className="text-[13px] font-medium">Komponen</h2>
        <span className="text-[11px] text-faint">Klik untuk tambah</span>
      </header>

      {GROUPS.map((group) => (
        <div key={group.title} className="border-b border-line px-2.5 py-3">
          <h3 className="px-1 pb-2 text-[11px] text-faint">
            {group.title}
          </h3>
          <div className="grid grid-cols-2 gap-1.5">
            {group.items.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => add(item.make())}
                title={item.hint}
                className="group flex items-center justify-between gap-1 rounded border border-line bg-raised px-2 py-1.5 text-left transition-colors hover:border-line-strong hover:text-ink"
              >
                <span className="truncate text-[12px] text-muted group-hover:text-ink">
                  {item.label}
                </span>
                <Plus size={12} className="shrink-0 text-faint group-hover:text-accent" />
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="px-3.5 py-3">
        <p className="text-[11px] leading-relaxed text-faint">
          Semua elemen memakai koordinat kanvas 390 x 390 dan hanya properti
          yang bisa digambar oleh renderer native.
        </p>
      </div>
    </div>
  );
}
