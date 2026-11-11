import { safeParseDesign, type Design } from "@/core/schema";

const PREFIX = "watchcraft:design:";

function hasStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function saveDesign(design: Design): void {
  if (!hasStorage()) return;
  try {
    const stamped: Design = { ...design, updatedAt: new Date().toISOString() };
    window.localStorage.setItem(PREFIX + design.id, JSON.stringify(stamped));
  } catch {
    // Storage penuh atau diblokir, desain tetap hidup di memori.
  }
}

export function loadDesign(id: string): Design | null {
  if (!hasStorage()) return null;
  try {
    const raw = window.localStorage.getItem(PREFIX + id);
    if (!raw) return null;
    const result = safeParseDesign(JSON.parse(raw));
    return result.ok ? result.design : null;
  } catch {
    return null;
  }
}

export function listDesigns(): Design[] {
  if (!hasStorage()) return [];
  const designs: Design[] = [];
  try {
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i);
      if (!key?.startsWith(PREFIX)) continue;
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;
      const result = safeParseDesign(JSON.parse(raw));
      if (result.ok) designs.push(result.design);
    }
  } catch {
    return designs;
  }
  return designs.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function deleteDesign(id: string): void {
  if (!hasStorage()) return;
  window.localStorage.removeItem(PREFIX + id);
}

export function clearDesigns(): void {
  if (!hasStorage()) return;
  const keys: string[] = [];
  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i);
    if (key?.startsWith(PREFIX)) keys.push(key);
  }
  keys.forEach((key) => {
    window.localStorage.removeItem(key);
  });
}

export function createId(prefix = "d"): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}
