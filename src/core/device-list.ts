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

function labelFromId(id: string): string {
  const families: Array<[RegExp, string]> = [
    [/^fenix/, "Fenix "],
    [/^fr/, "Forerunner "],
    [/^vivoactive/, "Vivoactive "],
    [/^venu/, "Venu "],
    [/^epix/, "Epix "],
    [/^enduro/, "Enduro "],
    [/^instinct/, "Instinct "],
    [/^descent/, "Descent "],
    [/^approach/, "Approach "],
    [/^marq/, "MARQ "],
    [/^lily/, "Lily "],
    [/^edge/, "Edge "],
    [/^d2/, "D2 "],
  ];

  let out = id;
  for (const [pattern, prefix] of families) {
    if (pattern.test(id)) {
      out = prefix + id.replace(pattern, "");
      break;
    }
  }

  return out
    .replace(/(\d)([a-z])/g, "$1 $2")
    .replace(/([a-z])(\d)/g, "$1 $2")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export const DEVICES = (catalog as DeviceInfo[]).map((device) => ({
  ...device,
  name: labelFromId(device.id),
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
