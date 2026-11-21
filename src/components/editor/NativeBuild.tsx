"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui";
import { DEFAULT_DEVICE_ID, DEVICES } from "@/core/device-list";
import { useEditor } from "@/stores/editor";

type BuildState =
  | { status: "idle" }
  | { status: "building"; startedAt: number }
  | { status: "done"; seconds: number; output: string; simulator: string | null; log: string }
  | { status: "error"; message: string; log?: string };

const DEVICE_KEY = "watchcraft:device";

// Perangkat yang terdaftar di watchface/manifest.xml. Build ke perangkat lain akan ditolak compiler.
const NATIVE_TARGETS = [
  "fr165",
  "fr265",
  "fr965",
  "fr57042mm",
  "fr57047mm",
  "fr970",
  "fenix847mm",
  "fenix8solar47mm",
  "fenix8solar51mm",
  "fenixe",
  "venu3",
  "venu441mm",
  "venu445mm",
  "vivoactive6",
  "enduro3",
  "fr255s",
  "fr255sm",
];

const TARGETS = DEVICES.filter((device) => NATIVE_TARGETS.includes(device.id));

function Hammer({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function NativeBuild() {
  const design = useEditor((state) => state.design);
  const [open, setOpen] = useState(false);
  const [device, setDevice] = useState(DEFAULT_DEVICE_ID);
  const [run, setRun] = useState(true);
  const [state, setState] = useState<BuildState>({ status: "idle" });
  const [elapsed, setElapsed] = useState(0);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(DEVICE_KEY);
      if (saved && NATIVE_TARGETS.includes(saved)) setDevice(saved);
    } catch {
      // Pakai perangkat default.
    }
  }, []);

  useEffect(() => {
    if (state.status !== "building") return;
    const timer = window.setInterval(
      () => setElapsed(Math.round((Date.now() - state.startedAt) / 1000)),
      250
    );
    return () => window.clearInterval(timer);
  }, [state]);

  useEffect(() => {
    if (!open) return;
    dialogRef.current?.querySelector<HTMLElement>("select, button")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [open]);

  const isDataField = design.kind === "datafield";

  async function build() {
    setElapsed(0);
    setState({ status: "building", startedAt: Date.now() });
    try {
      const response = await fetch("/api/native", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ design, device, run }),
      });
      const body = (await response.json()) as {
        ok: boolean;
        message?: string;
        log?: string;
        seconds?: number;
        output?: string;
        simulator?: string | null;
      };
      if (!response.ok || !body.ok) {
        setState({ status: "error", message: body.message ?? "Build gagal.", log: body.log });
        return;
      }
      setState({
        status: "done",
        seconds: body.seconds ?? 0,
        output: body.output ?? "",
        simulator: body.simulator ?? null,
        log: body.log ?? "",
      });
    } catch {
      setState({
        status: "error",
        message: "Server dev tidak menjawab. Pastikan pnpm dev berjalan di mesin ini.",
      });
    }
  }

  return (
    <>
      <Button
        ref={triggerRef}
        variant="primary"
        size="sm"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <Hammer />
        <span className="hidden sm:inline">Build ke jam</span>
        <span className="sm:hidden">Build</span>
      </Button>

      {open ? (
        <div className="fixed inset-0 z-[70] flex items-start justify-end p-3 pt-16">
          <button
            type="button"
            aria-label="Tutup panel build"
            onClick={() => setOpen(false)}
            className="absolute inset-0 cursor-default bg-black/40"
          />
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="native-build-title"
            className="relative w-full max-w-sm overflow-hidden rounded-lg border border-line bg-panel"
          >
            <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
              <h2 id="native-build-title" className="text-[14px] font-semibold">
                Build ke jam
              </h2>
              <span className="mono text-[11px] text-faint">.prg</span>
            </header>

            <div className="space-y-3 px-4 py-4">
              {isDataField ? (
                <p className="text-[13px] leading-relaxed text-muted">
                  Build native saat ini hanya untuk watch face. Data field masih memakai
                  layout tetap di folder <span className="mono text-ink">datafield/</span>.
                </p>
              ) : (
                <>
                  <p className="text-[13px] leading-relaxed text-muted">
                    Desain ini dikompilasi jadi Monkey C dan dibangun dengan SDK di
                    mesin ini. Jarum, tick, busur, dan teks digambar ulang oleh
                    interpreter native dengan data sensor asli.
                  </p>
                  <label className="block">
                    <span className="text-[12px] text-muted">Perangkat</span>
                    <select
                      value={device}
                      onChange={(event) => setDevice(event.target.value)}
                      className="mt-1 h-9 w-full rounded-md border border-line bg-raised px-2 text-[13px] text-ink"
                    >
                      {TARGETS.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name} / {item.width} x {item.height}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex items-center gap-2 text-[13px] text-muted">
                    <input
                      type="checkbox"
                      checked={run}
                      onChange={(event) => setRun(event.target.checked)}
                      className="size-4 accent-[var(--accent)]"
                    />
                    Jalankan di Connect IQ Simulator
                  </label>
                </>
              )}

              <div aria-live="polite" className="min-h-5">
                {state.status === "building" ? (
                  <p className="text-[13px] text-ink">
                    Mengompilasi untuk {device}
                    <span className="mono text-muted"> {elapsed} dtk</span>
                  </p>
                ) : null}
                {state.status === "done" ? (
                  <div className="rounded-md border border-ok/40 px-3 py-2.5">
                    <p className="text-[13px] font-medium text-ok">
                      Build selesai dalam {state.seconds} dtk
                    </p>
                    <p className="mono mt-1 break-all text-[11px] text-muted">{state.output}</p>
                    {state.simulator ? (
                      <p className="mt-1 text-[12px] text-muted">{state.simulator}</p>
                    ) : null}
                  </div>
                ) : null}
                {state.status === "error" ? (
                  <div className="rounded-md border border-danger/50 px-3 py-2.5">
                    <p className="text-[13px] font-medium text-danger">{state.message}</p>
                    {state.log ? (
                      <pre className="scroll-slim mono mt-2 max-h-40 overflow-auto whitespace-pre-wrap text-[10px] leading-relaxed text-muted">
                        {state.log}
                      </pre>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>

            <footer className="flex justify-end gap-2 border-t border-line px-4 py-3">
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
                Tutup
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={build}
                disabled={isDataField || state.status === "building"}
              >
                {state.status === "building" ? "Membangun" : "Bangun .prg"}
              </Button>
            </footer>
          </div>
        </div>
      ) : null}
    </>
  );
}
