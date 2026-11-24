"use client";

import { useSyncExternalStore } from "react";

// Satu interval untuk seluruh aplikasi. Semua jam, jarum, dan skala detik berlangganan ke sini
// supaya berdetak serempak dan tidak ada puluhan setInterval di halaman yang sama.
type Listener = () => void;

const listeners = new Set<Listener>();
let current = 0;
let timer: number | null = null;

function align() {
  current = Math.floor(Date.now() / 1000) * 1000;
  for (const listener of listeners) listener();
  // Selaraskan ke batas detik berikutnya, bukan sekadar +1000 ms, supaya tidak melantur.
  timer = window.setTimeout(align, 1000 - (Date.now() % 1000) + 5);
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  if (timer === null) align();
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer !== null) {
      window.clearTimeout(timer);
      timer = null;
    }
  };
}

// Null di server dan saat hydration pertama, supaya HTML server tidak memuat waktu.
export function useNow(enabled = true): Date | null {
  const value = useSyncExternalStore(
    enabled ? subscribe : noopSubscribe,
    () => (enabled ? current : 0),
    () => 0
  );
  return value === 0 ? null : new Date(value);
}

function noopSubscribe() {
  return () => {};
}

const DEVICE_KEY = "watchcraft:device";

export function readDevicePref(fallback: string): string {
  try {
    return window.localStorage.getItem(DEVICE_KEY) ?? fallback;
  } catch {
    return fallback;
  }
}

export function writeDevicePref(id: string) {
  try {
    window.localStorage.setItem(DEVICE_KEY, id);
  } catch {
    // Pilihan hanya berlaku untuk sesi ini.
  }
}
