import catalog from "./device-catalog.json";

export type DeviceInfo = {
  id: string;
  name: string;
  width: number;
  height: number;
  display: string;
  family: string;
  api: string;
  watchFaceMemory: number;
};

function fixMojibake(value: string): string {
  try {
    const bytes = Uint8Array.from(value, (char) => char.charCodeAt(0) & 0xff);
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return value;
  }
}

function cleanName(value: string): string {
  return fixMojibake(value)
    .replace(/Â®/g, "®")
    .replace(/Â/g, "")
    .replace(/ForerunnerAr/g, "Forerunner")
    .trim();
}

export const DEVICES = (catalog as DeviceInfo[]).map((device) => ({
  ...device,
  name: cleanName(device.name),
}));

export const DEFAULT_DEVICE_ID = "fr165";

export function getDevice(id: string): DeviceInfo {
  return (
    DEVICES.find((device) => device.id === id) ??
    DEVICES.find((device) => device.id === DEFAULT_DEVICE_ID) ??
    DEVICES[0]
  );
}

export function deviceLabel(device: DeviceInfo): string {
  return `${device.name} / ${device.width} x ${device.height}`;
}

export function apiVersion(device: DeviceInfo): string {
  return device.api.replace("API level ", "");
}
