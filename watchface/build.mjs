import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const appData = process.env.APPDATA ?? join(homedir(), "AppData", "Roaming");

function fail(message) {
  console.error(`\n[watchface] ${message}\n`);
  process.exit(1);
}

function readSdk() {
  const config = join(appData, "Garmin", "ConnectIQ", "current-sdk.cfg");
  if (!existsSync(config)) {
    fail(
      `current-sdk.cfg tidak ditemukan di ${config}. Buka SDK Manager dan pasang Connect IQ SDK.`
    );
  }
  const sdk = readFileSync(config, "utf8").trim();
  if (!sdk || !existsSync(sdk)) {
    fail(`Path SDK di current-sdk.cfg tidak valid: "${sdk}"`);
  }
  return sdk;
}

function resolveJava() {
  const fromHome = process.env.JAVA_HOME
    ? join(process.env.JAVA_HOME, "bin", process.platform === "win32" ? "java.exe" : "java")
    : null;
  if (fromHome && existsSync(fromHome)) return fromHome;
  return "java";
}

const device = process.argv.includes("--device")
  ? process.argv[process.argv.indexOf("--device") + 1]
  : "fr165";

const sdk = readSdk();
const jar = join(sdk, "bin", "monkeybrains.jar");
if (!existsSync(jar)) fail(`monkeybrains.jar tidak ditemukan di ${jar}`);

const key =
  process.env.WATCHCRAFT_DEV_KEY ??
  join(homedir(), ".Garmin", "ConnectIQ", "developer_key.der");
if (!existsSync(key)) {
  fail(
    `Developer key tidak ditemukan di ${key}. Buat lewat VS Code "Monkey C: Generate a Developer Key" atau set WATCHCRAFT_DEV_KEY.`
  );
}

const outDir = join(root, "bin");
mkdirSync(outDir, { recursive: true });
const output = join(outDir, `watchcraft-${device}.prg`);

console.log(`[watchface] SDK      : ${sdk}`);
console.log(`[watchface] Perangkat: ${device}`);
console.log(`[watchface] Output   : ${output}`);

execFileSync(process.execPath, [join(root, "make-icon.mjs")], { stdio: "inherit" });

const java = resolveJava();
const args = [
  "-cp",
  jar,
  "com.garmin.monkeybrains.Monkeybrains",
  "-f",
  "monkey.jungle",
  "-d",
  device,
  "-o",
  output,
  "-y",
  key,
];

const result = spawnSync(java, args, {
  cwd: resolve(root),
  stdio: "inherit",
});

if (result.error) {
  fail(`Gagal menjalankan java: ${result.error.message}`);
}
if (result.status !== 0) {
  fail(`Kompilasi gagal dengan kode ${result.status}.`);
}

console.log(`\n[watchface] BUILD OK -> ${output}`);
