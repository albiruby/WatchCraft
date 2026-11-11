export type DeviceProfile = {
  id: "fr165";
  name: string;
  width: number;
  height: number;
  screen: string;
  api: string;
  watchFaceMemory: number;
  code: string;
};

export const FR165: DeviceProfile = {
  id: "fr165",
  name: "Forerunner 165",
  width: 390,
  height: 390,
  screen: "AMOLED 390x390, 16 bpp",
  api: "5.2.0",
  watchFaceMemory: 131072,
  code: "fr165",
};

export const DEVICES: Record<DeviceProfile["id"], DeviceProfile> = {
  fr165: FR165,
};

export const DEFAULT_DEVICE = FR165;
