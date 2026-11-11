"use client";

import { useEffect, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { Check, Moon, Sun } from "@/components/icons";
import { Badge, Button, Card, CardHeader } from "@/components/ui";
import { FR165 } from "@/core/devices";
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

const SPECS: Array<[string, string]> = [
  ["Perangkat", FR165.name],
  ["Kode produk", FR165.code],
  ["Layar", FR165.screen],
  ["API level", FR165.api],
  ["Memori watch face", `${Math.round(FR165.watchFaceMemory / 1024)} KB`],
];

export default function SettingsPage() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    setTheme(current === "light" ? "light" : "dark");
  }, []);

  function applyTheme(next: "dark" | "light") {
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      window.localStorage.setItem("watchcraft-theme", next);
    } catch {
      // Preferensi hanya berlaku untuk sesi ini.
    }
  }

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
        <p className="mono text-[10px] uppercase tracking-[0.2em] text-accent">
          Settings
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Pengaturan studio</h1>
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
              Mode gelap jadi default karena kanvas jam selalu terang. Mode terang
              tetap tersedia dan memakai token kontras yang sama.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {(
                [
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
          <CardHeader title="Perangkat target" meta="FR165" action={<Badge tone="accent">Aktif</Badge>} />
          <dl className="divide-y divide-line">
            {SPECS.map(([label, value]) => (
              <div key={label} className="flex items-baseline justify-between gap-4 px-4 py-2.5">
                <dt className="text-[13px] text-muted">{label}</dt>
                <dd className="mono text-[12px] text-ink">{value}</dd>
              </div>
            ))}
          </dl>
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
                WATCHCRAFT adalah studio watch face untuk Garmin Forerunner 165.
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
