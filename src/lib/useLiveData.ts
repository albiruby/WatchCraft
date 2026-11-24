"use client";

import { SIMULATED_DATA, type MetricData } from "@/core/data";
import { DEFAULT_SIMULATION, buildSimulationData, clockFromDate } from "@/core/simulation";
import { useNow } from "./clock";

// Data simulasi default dengan jam yang berjalan. Sebelum hydration selesai
// (atau kalau dimatikan) memakai data tetap, sama dengan HTML dari server.
export function useLiveData(enabled = true): MetricData {
  const now = useNow(enabled);
  return now ? buildSimulationData(DEFAULT_SIMULATION, clockFromDate(now)) : SIMULATED_DATA;
}
