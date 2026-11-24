"use client";

import { useEffect, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { Check, Moon, Sun } from "@/components/icons";
import { Badge, Button, Card, CardHeader } from "@/components/ui";
import { Readout } from "@/components/Readout";
import { DEFAULT_DEVICE_ID, DEVICES, apiVersion, getDevice } from "@/core/device-list";
import { readDevicePref, writeDevicePref } from "@/lib/clock";
import { cn } from "@/lib/cn";
import { clearDesigns } from "@/lib/storage";

const SHORTCUTS: Array<[string, string]> = [
  ["Panah", "Geser elemen 1 px"],
  ["Shift + panah", "Geser elemen 10 px"],
  ["Ctrl/Cmd + Z", "Undo"],
  ["Ctrl/Cmd + Shift + Z", "Redo"],
  ["Delete / Backspace", "Hapus elemen terpilih"],
  ["Esc", "Batalkan pilihan"],
];

type ThemeChoice = "system" | "dark" | "light";

function systemTheme(): "dark" | "light" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export default function SettingsPage() {
  const [theme, setTheme] = useState<ThemeChoice>("system");
  const [note, setNote] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState(DEFAULT_DEVICE_ID);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("watchcraft-theme");
      setTheme(stored === "dark" || stored === "light" ? stored : "system");
    } catch {
      setTheme("system");
    }
    const saved = readDevicePref(DEFAULT_DEVICE_ID);
    if (DEVICES.some((device) => device.id === saved)) setDeviceId(saved);
  }, []);

  function applyTheme(next: ThemeChoice) {
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next === "system" ? systemTheme() : next);
    try {
      if (next === "system") window.localStorage.removeItem("watchcraft-theme");
      else window.localStorage.setItem("watchcraft-theme", next);
    } catch {
      // Preferensi hanya berlaku untuk sesi ini.
    }
  }

  function chooseDevice(id: string) {
    setDeviceId(id);
    writeDevicePref(id);
  }

  const device = getDevice(deviceId);

  function handleClear() {
    const confirmed = window.confirm(
      "Hapus semua desain yang tersimpan di browser ini? Tindakan ini tidak bisa dibatalkan."
    );
    if (!confirmed) return;
    clearDesigns();
    setNote("Semua desain lokal dihapus.");
  }

  return (
    <AppShell>
      <div>
        <h1
          className="font-display font-semibold leading-[0.9] tracking-[-0.035em]"
          style={{ fontSize: "clamp(48px, 8vw, 104px)" }}
        >
          Pengaturan
        </h1>
      </div>

      {note ? (
        <div role="status" className="mt-5 rounded-md border border-line bg-panel px-3.5 py-2.5 text-[13px] text-muted">
          {note}
        </div>
      ) : null}

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Tampilan" meta="Tema" />
          <div className="p-4">
            <p className="text-[13px] leading-relaxed text-muted">
              Tanpa pilihan, tema mengikuti sistem. Kanvas jam selalu hitam di dua tema
              karena itu warna layar AMOLED.
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {(
                [
                  ["system", "Sistem", Check],
                  ["dark", "Gelap", Moon],
                  ["light", "Terang", Sun],
                ] as const
              ).map(([value, label, Icon]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => applyTheme(value)}
                  aria-pressed={theme === value}
                  className={cn(
                    "flex items-center justify-between rounded-md border px-3 py-2.5 text-[13px] transition-colors",
                    theme === value
                      ? "border-accent/60 bg-accent/10 text-ink"
                      : "border-line bg-raised text-muted hover:border-line-strong"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <Icon size={15} />
                    {label}
                  </span>
                  {theme === value ? <Check size={14} className="text-accent" /> : null}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Perangkat target" meta={device.id} action={<Badge tone="accent">Aktif</Badge>} />
          <div className="p-4">
            <label className="block">
              <span className="text-[12px] text-muted">Dipakai di dashboard dan Build ke jam</span>
              <select
                value={deviceId}
                onChange={(event) => chooseDevice(event.target.value)}
                className="mt-1.5 h-9 w-full rounded-md border border-line bg-raised px-2 text-[13px] text-ink"
              >
                {DEVICES.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} / {item.width} x {item.height}
                  </option>
                ))}
              </select>
            </label>
            <dl className="mt-5 grid grid-cols-2 gap-x-5 gap-y-4">
              <Readout size="sm" label="Layar" value={`${device.width} x ${device.height}`} unit={device.display} />
              <Readout size="sm" label="API" value={apiVersion(device)} />
              <Readout size="sm" label="Memori watch face" value={Math.round(device.watchFaceMemory / 1024)} unit="KB" />
              <Readout size="sm" label="Keluarga" value={device.family} />
            </dl>
          </div>
        </Card>

        <Card>
          <CardHeader title="Shortcut editor" meta="Keyboard" />
          <dl className="divide-y divide-line">
            {SHORTCUTS.map(([keys, action]) => (
              <div key={keys} className="flex items-center justify-between gap-4 px-4 py-2.5">
                <dt className="mono text-[11px] text-ink">{keys}</dt>
                <dd className="text-[12px] text-muted">{action}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader title="Data lokal" meta="Browser" />
            <div className="p-4">
              <p className="text-[13px] leading-relaxed text-muted">
                Desain disimpan di localStorage browser ini, bukan di server. Kalau
                data situs dibersihkan, desain ikut hilang. Export JSON sebagai
                cadangan.
              </p>
              <Button variant="danger" size="sm" className="mt-4" onClick={handleClear}>
                Hapus semua desain lokal
              </Button>
            </div>
          </Card>

          <Card>
            <CardHeader title="Tentang" meta="v0.1.0" />
            <div className="space-y-2 p-4 text-[13px] leading-relaxed text-muted">
              <p>
                WATCHCRAFT adalah studio watch face untuk jam Garmin Connect IQ.
                Preview web memakai data simulasi dengan label yang selalu terlihat.
              </p>
              <p className="mono text-[10px] uppercase tracking-[0.14em] text-faint">
                Next.js / React / Zod / Zustand / Monkey C
              </p>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
