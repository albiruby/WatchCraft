"use client";

import { useEffect, useState } from "react";

import { DeviceFrame } from "@/components/DeviceFrame";
import { FRAMES, type FrameSpec } from "@/core/frames";
import { DisplayListSvg } from "@/components/DisplayListSvg";
import { Badge, Button, Card, CardHeader } from "@/components/ui";
import type { Design } from "@/core/schema";
import {
  DEFAULT_SIMULATION,
  buildSimulationData,
  type SimulationSettings,
} from "@/core/simulation";
import { cn } from "@/lib/cn";

const STORAGE_KEY = "watchcraft:simulation";

function loadSettings(): SimulationSettings {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SIMULATION;
    const parsed = JSON.parse(raw) as Partial<SimulationSettings>;
    return { ...DEFAULT_SIMULATION, ...parsed };
  } catch {
    return DEFAULT_SIMULATION;
  }
}

function Choice<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
}) {
  return (
    <div>
      <p className="text-[11px] text-muted">{label}</p>
      <div className="mt-1.5 flex overflow-hidden rounded border border-line">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={value === option.value}
            className={cn(
              "h-7 flex-1 px-2 text-[11px] font-medium transition-colors",
              value === option.value
                ? "bg-accent/15 text-ink"
                : "bg-raised text-muted hover:text-ink"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  suffix: string;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[11px] text-muted">{label}</span>
        <span className="mono text-[11px] text-ink">
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-2 h-1 w-full cursor-pointer"
        aria-label={label}
      />
    </div>
  );
}

function MiniNumber({
  label,
  value,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="text-[10px] text-faint">{label}</span>
      <input
        type="number"
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value) || 0)}
        className="mt-1 h-7 w-full rounded border border-line bg-raised px-2 mono text-[11px] text-ink outline-none focus:border-line-strong"
      />
    </label>
  );
}

function Switch({  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 rounded border border-line bg-raised px-2.5 py-2 text-left transition-colors hover:border-line-strong"
    >
      <span className="text-[11px] text-muted">{label}</span>
      <span
        className={cn(
          "relative h-4 w-7 shrink-0 rounded-full border transition-colors",
          checked ? "border-accent/60 bg-accent/30" : "border-line-strong bg-panel"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-2.5 rounded-full transition-all",
            checked ? "left-3.5 bg-accent" : "left-0.5 bg-faint"
          )}
        />
      </span>
    </button>
  );
}

export function SimulatorPanel({ design }: { design: Design }) {
  const [settings, setSettings] = useState<SimulationSettings>(DEFAULT_SIMULATION);
  const [ready, setReady] = useState(false);
  const [frameId, setFrameId] = useState<FrameSpec["id"]>("fr165");

  useEffect(() => {
    setSettings(loadSettings());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Preferensi simulator hanya berlaku untuk sesi ini.
    }
  }, [settings, ready]);

  const data = buildSimulationData(settings);
  const patch = (next: Partial<SimulationSettings>) =>
    setSettings((current) => ({ ...current, ...next }));
  const frame = FRAMES[frameId];
  const scale = frameId === "fr265" ? 0.62 : 0.9;

  return (
    <Card className="overflow-hidden">
      <CardHeader
        title="Simulator"
        meta="Forerunner 165"
        action={<Badge tone="accent">Data simulasi</Badge>}
      />

      <div className="grid gap-6 p-4 lg:grid-cols-[400px_1fr]">
        <div className="mx-auto w-full max-w-[400px]">
          <div className="mb-2 flex justify-center gap-1">
            {Object.values(FRAMES).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFrameId(item.id)}
                aria-pressed={frameId === item.id}
                className={
                  frameId === item.id
                    ? "h-6 rounded border border-accent/50 bg-accent/10 px-2 text-[10px] text-ink"
                    : "h-6 rounded border border-line bg-raised px-2 text-[10px] text-muted hover:text-ink"
                }
              >
                {item.label.replace("Forerunner ", "FR ")}
              </button>
            ))}
          </div>
          <div
            style={{ width: frame.width * scale, height: frame.height * scale }}
            className="mx-auto"
          >
            <div style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}>
              <DeviceFrame frame={frame}>
                <div
                  className="absolute inset-0"
                  style={{ filter: settings.sleepMode ? "brightness(0.45)" : undefined }}
                >
                  <DisplayListSvg design={design} data={data} label="Preview simulator" />
                </div>
              </DeviceFrame>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="text-[11px] text-faint">
              {design.name}
            </span>
            {settings.sleepMode ? <Badge>Sleep mode</Badge> : null}
          </div>
        </div>

        <div className="grid content-start gap-3 sm:grid-cols-2">
          <div className="rounded-md border border-line bg-panel p-3">
            <Choice
              label="Time display"
              value={settings.hour24 ? "24" : "12"}
              options={[
                { value: "24", label: "24 jam" },
                { value: "12", label: "12 jam" },
              ]}
              onChange={(value) => patch({ hour24: value === "24" })}
            />
          </div>

          <div className="rounded-md border border-line bg-panel p-3">
            <Choice
              label="Language"
              value={settings.language}
              options={[
                { value: "en", label: "English" },
                { value: "id", label: "Indonesia" },
              ]}
              onChange={(value) => patch({ language: value })}
            />
          </div>

          <div className="rounded-md border border-line bg-panel p-3">
            <Slider
              label="Battery status"
              value={settings.battery}
              min={0}
              max={100}
              suffix="%"
              onChange={(value) => patch({ battery: value })}
            />
          </div>

          <div className="rounded-md border border-line bg-panel p-3">
            <Slider
              label="Heart rate"
              value={settings.heartRate}
              min={40}
              max={200}
              suffix=" bpm"
              onChange={(value) => patch({ heartRate: value })}
            />
          </div>

          <div className="rounded-md border border-line bg-panel p-3 sm:col-span-2">
            <div className="flex items-end justify-between gap-3">
              <label className="flex-1">
                <span className="text-[11px] text-muted">Steps</span>
                <input
                  type="number"
                  min={0}
                  max={100000}
                  step={100}
                  value={settings.steps}
                  onChange={(event) => patch({ steps: Number(event.target.value) || 0 })}
                  className="mt-1.5 h-7 w-full rounded border border-line bg-raised px-2 mono text-[11px] text-ink outline-none focus:border-line-strong"
                />
              </label>
              <div className="w-[150px] shrink-0">
                <Switch
                  label="Activity tracking"
                  checked={settings.activityTracking}
                  onChange={(value) => patch({ activityTracking: value })}
                />
              </div>
            </div>
          </div>

          <div className="rounded-md border border-line bg-panel p-3 sm:col-span-2">
            <p className="text-[11px] text-muted">Metrik lain</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <MiniNumber
                label="Kalori"
                value={settings.calories}
                step={10}
                onChange={(value) => patch({ calories: value })}
              />
              <MiniNumber
                label="Jarak (km)"
                value={settings.distance}
                step={0.1}
                onChange={(value) => patch({ distance: value })}
              />
              <MiniNumber
                label="Notifikasi"
                value={settings.notifications}
                onChange={(value) => patch({ notifications: value })}
              />
              <MiniNumber
                label="Suhu (C)"
                value={settings.weather}
                onChange={(value) => patch({ weather: value })}
              />
            </div>
          </div>

          <div className="rounded-md border border-line bg-panel p-3 sm:col-span-2">
            <Switch
              label="Sleep mode (redupkan layar)"
              checked={settings.sleepMode}
              onChange={(value) => patch({ sleepMode: value })}
            />
          </div>

          {design.kind === "datafield" ? (
            <div className="rounded-md border border-line bg-panel p-3 sm:col-span-2">
              <p className="text-[11px] text-muted">Run data</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <MiniNumber
                  label="Pace (min/km)"
                  value={settings.pace}
                  step={0.05}
                  onChange={(value) => patch({ pace: value })}
                />
                <MiniNumber
                  label="Timer (detik)"
                  value={settings.timer}
                  step={5}
                  onChange={(value) => patch({ timer: value })}
                />
                <MiniNumber
                  label="Cadence (spm)"
                  value={settings.cadence}
                  onChange={(value) => patch({ cadence: value })}
                />
                <MiniNumber
                  label="Lap"
                  value={settings.lap}
                  onChange={(value) => patch({ lap: value })}
                />
              </div>
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-2 sm:col-span-2">
            <p className="text-[10px] leading-relaxed text-faint">
              {design.kind === "datafield"
                ? "Data field digambar di area yang disediakan layout aktivitas. Preview ini memakai area penuh 390 x 390."
                : "Hanya kontrol yang mengubah hasil render. Menu simulator lain seperti sensor, audio, dan BLE tidak ditampilkan karena tidak memengaruhi watch face."}
            </p>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSettings(DEFAULT_SIMULATION)}
              className="shrink-0"
            >
              Reset
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
