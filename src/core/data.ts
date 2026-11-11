import type { ArcElement, TextElement } from "./schema";

export type MetricData = {
  time: string;
  date: string;
  battery: number;
  steps: number;
  heartRate: number;
  calories: number;
  distance: number;
  notifications: number;
  weather: number;
  floors: number;
  activeMinutes: number;
  stress: number;
  bodyBattery: number;
  vo2max: number;
  altitude: number;
  timer: number;
  pace: number;
  speed: number;
  cadence: number;
  lap: number;
};

export const SIMULATED_DATA: MetricData = {
  time: "10:09",
  date: "WED 11",
  battery: 78,
  steps: 6420,
  heartRate: 62,
  calories: 1480,
  distance: 7.42,
  notifications: 3,
  weather: 27,
  floors: 12,
  activeMinutes: 47,
  stress: 28,
  bodyBattery: 64,
  vo2max: 48,
  altitude: 142,
  timer: 1845,
  pace: 5.42,
  speed: 11.1,
  cadence: 172,
  lap: 2,
};

export function groupDigits(value: number): string {
  return String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.round(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${minutes}:${ss}`;
}

export function formatPace(minutesPerKm: number): string {
  const total = Math.max(0, Math.round(minutesPerKm * 60));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function metricNumber(el: ArcElement, data: MetricData): number {
  if (el.metric === "battery") return data.battery;
  if (el.metric === "steps") return data.steps;
  return data.heartRate;
}

export function metricText(el: TextElement, data: MetricData): string {
  switch (el.metric) {
    case "label":
      return el.text;
    case "time":
      return data.time;
    case "date":
      return data.date;
    case "battery":
      return `${Math.round(data.battery)}%`;
    case "steps":
      return groupDigits(data.steps);
    case "heartRate":
      return `${Math.round(data.heartRate)} BPM`;
    case "calories":
      return `${groupDigits(data.calories)} KCAL`;
    case "distance":
      return `${data.distance.toFixed(2)} KM`;
    case "notifications":
      return `${Math.round(data.notifications)} MSG`;
    case "weather":
      return `${Math.round(data.weather)}°C`;
    case "floors":
      return `${Math.round(data.floors)} FLR`;
    case "activeMinutes":
      return `${Math.round(data.activeMinutes)} MIN`;
    case "stress":
      return `${Math.round(data.stress)}`;
    case "bodyBattery":
      return `${Math.round(data.bodyBattery)}`;
    case "vo2max":
      return `${Math.round(data.vo2max)}`;
    case "altitude":
      return `${Math.round(data.altitude)} M`;
    case "timer":
      return formatClock(data.timer);
    case "pace":
      return `${formatPace(data.pace)} /KM`;
    case "speed":
      return `${data.speed.toFixed(1)} KM/H`;
    case "cadence":
      return `${Math.round(data.cadence)} SPM`;
    case "lap":
      return `LAP ${Math.round(data.lap)}`;
    default:
      return "";
  }
}
