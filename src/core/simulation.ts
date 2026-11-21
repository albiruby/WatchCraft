import type { MetricData } from "./data";

export type SimulationSettings = {
  hour24: boolean;
  language: "en" | "id";
  battery: number;
  steps: number;
  heartRate: number;
  activityTracking: boolean;
  sleepMode: boolean;
  // Jam berjalan mengikuti waktu perangkat, detak dan langkah bergerak pelan.
  live: boolean;
  calories: number;
  distance: number;
  notifications: number;
  weather: number;
  pace: number;
  timer: number;
  cadence: number;
  lap: number;
};

export const DEFAULT_SIMULATION: SimulationSettings = {
  hour24: true,
  language: "en",
  battery: 78,
  steps: 6420,
  heartRate: 62,
  activityTracking: true,
  sleepMode: false,
  live: true,
  calories: 1480,
  distance: 7.42,
  notifications: 3,
  weather: 27,
  pace: 5.42,
  timer: 1845,
  cadence: 172,
  lap: 2,
};

const WEEKDAYS: Record<SimulationSettings["language"], string[]> = {
  en: ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"],
  id: ["MIN", "SEN", "SEL", "RAB", "KAM", "JUM", "SAB"],
};

const BASE_HOUR = 15;
const BASE_MINUTE = 9;
const SIMULATED_DAY = 3;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export type SimulationClock = {
  hour: number;
  minute: number;
  second: number;
  weekday: number;
  day: number;
};

const FIXED_CLOCK: SimulationClock = {
  hour: BASE_HOUR,
  minute: BASE_MINUTE,
  second: 30,
  weekday: SIMULATED_DAY,
  day: 11,
};

export function clockFromDate(date: Date): SimulationClock {
  return {
    hour: date.getHours(),
    minute: date.getMinutes(),
    second: date.getSeconds(),
    weekday: date.getDay(),
    day: date.getDate(),
  };
}

// Variasi halus untuk mode live. Deterministik: detik yang sama, nilai yang sama.
export function liveDrift(settings: SimulationSettings, elapsedSeconds: number) {
  const t = Math.max(0, elapsedSeconds);
  return {
    heartRate: Math.round(settings.heartRate + Math.sin(t / 7) * 4 + Math.sin(t / 2.3) * 1.5),
    steps: settings.steps + Math.floor(t * 1.6),
  };
}

export function buildSimulationData(
  settings: SimulationSettings,
  clock: SimulationClock = FIXED_CLOCK
): MetricData {
  const hour = settings.hour24
    ? `${clock.hour}`
    : `${clock.hour % 12 === 0 ? 12 : clock.hour % 12}`;
  const minute = String(clock.minute).padStart(2, "0");
  const weekday = WEEKDAYS[settings.language][clock.weekday];

  return {
    time: `${hour}:${minute}`,
    hour: clock.hour,
    minute: clock.minute,
    second: clock.second,
    date: `${weekday} ${clock.day}`,
    battery: clamp(settings.battery, 0, 100),
    steps: settings.activityTracking ? Math.max(0, settings.steps) : 0,
    heartRate: clamp(settings.heartRate, 30, 220),
    calories: Math.max(0, settings.calories),
    distance: Math.max(0, settings.distance),
    notifications: Math.max(0, settings.notifications),
    weather: clamp(settings.weather, -40, 60),
    floors: 12,
    activeMinutes: 47,
    stress: 28,
    bodyBattery: 64,
    vo2max: 48,
    altitude: 142,
    timer: Math.max(0, settings.timer),
    pace: Math.max(0, settings.pace),
    speed: settings.pace > 0 ? 60 / settings.pace : 0,
    cadence: Math.max(0, settings.cadence),
    lap: Math.max(1, settings.lap),
  };
}
