import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

import { DEVICES } from "@/core/device-list";
import { safeParseDesign } from "@/core/schema";

// Jembatan editor ke pipeline native di mesin ini. Hanya untuk `pnpm dev` lokal:
// route ini menjalankan compiler Java dan simulator, jadi tidak boleh terbuka di production.

const ROOT = process.cwd();
const WATCHFACE = join(ROOT, "watchface");
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

let busy = false;

function json(status: number, body: Record<string, unknown>) {
  return Response.json(body, { status });
}

function isLocal(request: Request): boolean {
  const host = new URL(request.url).hostname;
  return LOCAL_HOSTS.has(host);
}

function runBuild(designPath: string, device: string): Promise<{ code: number; log: string }> {
  return new Promise((resolve) => {
    const child = spawn(
      process.execPath,
      [join(WATCHFACE, "build.mjs"), "--design", designPath, "--device", device],
      { cwd: ROOT, windowsHide: true }
    );
    let log = "";
    child.stdout.on("data", (chunk) => {
      log += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      log += chunk.toString();
    });
    child.on("close", (code) => resolve({ code: code ?? 1, log }));
    child.on("error", (error) => resolve({ code: 1, log: `${log}\n${error.message}` }));
  });
}

function sdkPath(): string | null {
  const appData = process.env.APPDATA ?? join(homedir(), "AppData", "Roaming");
  const config = join(appData, "Garmin", "ConnectIQ", "current-sdk.cfg");
  if (!existsSync(config)) return null;
  const sdk = readFileSync(config, "utf8").trim();
  return sdk && existsSync(sdk) ? sdk : null;
}

function simulatorRunning(): boolean {
  const result = spawnSync("tasklist", ["/FI", "IMAGENAME eq simulator.exe", "/NH"], {
    encoding: "utf8",
    windowsHide: true,
  });
  return result.stdout.toLowerCase().includes("simulator.exe");
}

// Simulator dan monkeydo dilepas sebagai proses terpisah: request selesai tanpa menunggu jam menyala.
function launchInSimulator(prg: string, device: string): string {
  const sdk = sdkPath();
  if (!sdk) return "SDK tidak ditemukan, simulator tidak dijalankan.";
  if (!simulatorRunning()) {
    spawn(join(sdk, "bin", "simulator.exe"), [], { detached: true, stdio: "ignore" }).unref();
  }
  const monkeydo = join(sdk, "bin", "monkeydo.bat");
  // Jeda singkat supaya simulator yang baru dibuka sempat menerima koneksi.
  const script = `timeout /t 4 /nobreak >nul & "${monkeydo}" "${prg}" ${device}`;
  spawn("cmd.exe", ["/d", "/s", "/c", script], {
    detached: true,
    stdio: "ignore",
    windowsHide: true,
    windowsVerbatimArguments: true,
  }).unref();
  return `Dimuat ke simulator ${device}.`;
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return json(403, { ok: false, message: "Build native hanya tersedia di pnpm dev lokal." });
  }
  if (!isLocal(request)) {
    return json(403, { ok: false, message: "Build native hanya menerima request dari localhost." });
  }
  if (busy) {
    return json(409, { ok: false, message: "Build lain masih berjalan. Tunggu sampai selesai." });
  }

  let body: { design?: unknown; device?: unknown; run?: unknown };
  try {
    body = await request.json();
  } catch {
    return json(400, { ok: false, message: "Body harus JSON." });
  }

  const parsed = safeParseDesign(body.design);
  if (!parsed.ok) {
    return json(400, { ok: false, message: `Desain tidak valid: ${parsed.message}` });
  }
  if (parsed.design.kind !== "watchface") {
    return json(400, { ok: false, message: "Build native saat ini hanya untuk watch face." });
  }

  const device = typeof body.device === "string" ? body.device : "fr165";
  if (!/^[a-z0-9]+$/.test(device) || !DEVICES.some((item) => item.id === device)) {
    return json(400, { ok: false, message: `Perangkat tidak dikenal: ${device}` });
  }

  busy = true;
  try {
    const dir = join(WATCHFACE, "designs", "web");
    mkdirSync(dir, { recursive: true });
    const designPath = join(dir, "latest.json");
    writeFileSync(designPath, `${JSON.stringify(parsed.design, null, 2)}\n`);

    const started = Date.now();
    const result = await runBuild(designPath, device);
    const seconds = Math.round((Date.now() - started) / 100) / 10;
    const log = result.log.trim().split(/\r?\n/).slice(-40).join("\n");

    if (result.code !== 0) {
      return json(500, { ok: false, message: "Kompilasi gagal.", log, seconds });
    }

    const prg = join(WATCHFACE, "bin", `watchcraft-${device}.prg`);
    const simulator =
      body.run === true
        ? process.platform === "win32"
          ? launchInSimulator(prg, device)
          : "Peluncuran simulator otomatis baru tersedia di Windows."
        : null;

    return json(200, { ok: true, output: prg, device, seconds, log, simulator });
  } finally {
    busy = false;
  }
}
