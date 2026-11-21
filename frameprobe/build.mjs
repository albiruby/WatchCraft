import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const appData = process.env.APPDATA ?? join(homedir(), "AppData", "Roaming");

function fail(message) {
  console.error(`\n[frameprobe] ${message}\n`);
  process.exit(1);
}

function readSdk() {
  const config = join(appData, "Garmin", "ConnectIQ", "current-sdk.cfg");
  if (!existsSync(config)) fail(`current-sdk.cfg tidak ditemukan di ${config}`);
  const sdk = readFileSync(config, "utf8").trim();
  if (!sdk || !existsSync(sdk)) fail(`Path SDK tidak valid: "${sdk}"`);
  return sdk;
}

const device = process.argv.includes("--device")
  ? process.argv[process.argv.indexOf("--device") + 1]
  : "fr165";

const sdk = readSdk();
const jar = join(sdk, "bin", "monkeybrains.jar");
const key =
  process.env.WATCHCRAFT_DEV_KEY ??
  join(homedir(), ".Garmin", "ConnectIQ", "developer_key.der");
if (!existsSync(key)) fail(`Developer key tidak ditemukan di ${key}`);

// Tulis daftar produk sesuai device yang diminta.
const manifestPath = join(root, "manifest.xml");
const manifest = readFileSync(manifestPath, "utf8");
const next = manifest.replace(
  /<iq:products>[\s\S]*?<\/iq:products>/,
  `<iq:products>\n      <iq:product id="${device}"/>\n    </iq:products>`
);
writeFileSync(manifestPath, next);

const outDir = join(root, "bin");
mkdirSync(outDir, { recursive: true });
const output = join(outDir, `frameprobe-${device}.prg`);

const java = process.env.JAVA_HOME
  ? join(process.env.JAVA_HOME, "bin", process.platform === "win32" ? "java.exe" : "java")
  : "java";

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

const result = spawnSync(java, args, { cwd: root, stdio: "inherit" });
if (result.error) fail(`Gagal menjalankan java: ${result.error.message}`);
if (result.status !== 0) fail(`Kompilasi gagal dengan kode ${result.status}.`);

console.log(`[frameprobe] BUILD OK -> ${output}`);
