import type { MetricData } from "./data";

export type SimulationSettings = {
  hour24: boolean;
  language: "en" | "id";
  battery: number;
  steps: number;
  heartRate: number;
  activityTracking: boolean;
  sleepMode: boolean;
};

export const DEFAULT_SIMULATION: SimulationSettings = {
  hour24: true,
  language: "en",
  battery: 78,
  steps: 6420,
  heartRate: 62,
  activityTracking: true,
  sleepMode: false,
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

export function buildSimulationData(settings: SimulationSettings): MetricData {
  const hour = settings.hour24
    ? `${BASE_HOUR}`
    : `${BASE_HOUR % 12 === 0 ? 12 : BASE_HOUR % 12}`;
  const minute = String(BASE_MINUTE).padStart(2, "0");
  const weekday = WEEKDAYS[settings.language][SIMULATED_DAY];

  return {
    time: `${hour}:${minute}`,
    date: `${weekday} 11`,
    battery: clamp(settings.battery, 0, 100),
    steps: settings.activityTracking ? Math.max(0, settings.steps) : 0,
    heartRate: clamp(settings.heartRate, 30, 220),
    calories: 1480,
    distance: 7.42,
    notifications: 3,
    weather: 27,
  };
}
