import type { ArcElement, TextElement } from "./schema";

export type MetricData = {
  time: string;
  date: string;
  battery: number;
  steps: number;
  heartRate: number;
  calories: number;
};

export const SIMULATED_DATA: MetricData = {
  time: "10:09",
  date: "WED 11",
  battery: 78,
  steps: 6420,
  heartRate: 62,
  calories: 1480,
};

export function groupDigits(value: number): string {
  return String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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
    default:
      return "";
  }
}
