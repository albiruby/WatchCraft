// Mengubah design JSON WATCHCRAFT menjadi source Monkey C.
// Native tidak mem-parse JSON di jam: semua elemen dikodekan sebagai array angka
// supaya lolos typecheck strict dan hemat memori. Teks bebas masuk tabel string terpisah.

export const TYPE = { text: 0, rect: 1, circle: 2, arc: 3, ticks: 4, hands: 5 };

// Urutan wajib sama dengan konstanta Metric di WatchCraftView.mc.
export const TEXT_METRICS = [
  "label",
  "time",
  "date",
  "battery",
  "steps",
  "heartRate",
  "calories",
  "distance",
  "notifications",
  "weather",
  "floors",
  "activeMinutes",
  "stress",
  "bodyBattery",
  "vo2max",
  "altitude",
  "timer",
  "pace",
  "speed",
  "cadence",
  "lap",
];

const ARC_METRICS = ["battery", "steps", "heartRate"];
const FAMILY = { sans: 0, mono: 1, digits: 2 };
const WEIGHT = { regular: 0, medium: 1, bold: 2 };
const ALIGN = { left: 0, center: 1, right: 2 };

const int = (value) => Math.round(Number(value) || 0);

export function hexToNumber(hex) {
  if (typeof hex !== "string" || !/^#[0-9a-fA-F]{6}$/.test(hex)) return -1;
  return Number.parseInt(hex.slice(1), 16);
}

function fail(message) {
  throw new Error(`[design] ${message}`);
}

export function encodeDesign(design) {
  if (design?.version !== 1 || !Array.isArray(design.elements)) {
    fail("Bukan design WATCHCRAFT versi 1.");
  }

  const labels = [];
  const rows = [];

  for (const el of design.elements) {
    if (el.visible === false) continue;
    const aod = el.aod ? 1 : 0;

    if (el.type === "text") {
      const metric = TEXT_METRICS.indexOf(el.metric ?? "label");
      if (metric < 0) fail(`Metrik teks tidak dikenal: ${el.metric}`);
      let label = -1;
      if (metric === 0) {
        labels.push(String(el.text ?? ""));
        label = labels.length - 1;
      }
      rows.push([
        TYPE.text,
        aod,
        int(el.x),
        int(el.y),
        metric,
        int(el.size ?? 32),
        FAMILY[el.family ?? "mono"] ?? 1,
        WEIGHT[el.weight ?? "medium"] ?? 1,
        hexToNumber(el.color ?? "#F2F5F9"),
        ALIGN[el.align ?? "center"] ?? 1,
        label,
      ]);
      continue;
    }

    if (el.type === "shape") {
      const strokeWidth = int(el.strokeWidth ?? 0);
      const stroke = el.stroke ? hexToNumber(el.stroke) : -1;
      if ((el.shape ?? "rect") === "circle") {
        const r = Math.min(el.w, el.h) / 2 - strokeWidth / 2;
        rows.push([
          TYPE.circle,
          aod,
          int(el.x + el.w / 2),
          int(el.y + el.h / 2),
          int(r),
          hexToNumber(el.fill ?? "#141922"),
          stroke,
          strokeWidth,
        ]);
      } else {
        rows.push([
          TYPE.rect,
          aod,
          int(el.x),
          int(el.y),
          Math.max(1, int(el.w)),
          Math.max(1, int(el.h)),
          int(el.radius ?? 0),
          hexToNumber(el.fill ?? "#141922"),
          stroke,
          strokeWidth,
        ]);
      }
      continue;
    }

    if (el.type === "arc") {
      const width = int(el.width ?? 6);
      const metric = ARC_METRICS.indexOf(el.metric ?? "battery");
      rows.push([
        TYPE.arc,
        aod,
        int(el.x + el.w / 2),
        int(el.y + el.h / 2),
        int(Math.min(el.w, el.h) / 2 - width / 2),
        width,
        hexToNumber(el.track ?? "#1A2030"),
        hexToNumber(el.color ?? "#FF7A1A"),
        int(el.startAngle ?? -90),
        int(el.sweep ?? 270),
        Math.max(metric , 0),
        Math.max(1, int(el.max ?? 100)),
        (el.cap ?? "round") === "round" ? 1 : 0,
      ]);
      continue;
    }

    if (el.type === "ticks") {
      rows.push([
        TYPE.ticks,
        aod,
        int(el.x + el.w / 2),
        int(el.y + el.h / 2),
        int(Math.min(el.w, el.h) / 2),
        int(el.count ?? 60),
        Math.max(1, int(el.majorEvery ?? 5)),
        int(el.length ?? 8),
        int(el.majorLength ?? 18),
        int(el.width ?? 2),
        int(el.majorWidth ?? 4),
        hexToNumber(el.color ?? "#3A4250"),
        hexToNumber(el.majorColor ?? "#F2F5F9"),
      ]);
      continue;
    }

    if (el.type === "hands") {
      rows.push([
        TYPE.hands,
        aod,
        int(el.x + el.w / 2),
        int(el.y + el.h / 2),
        int(Math.min(el.w, el.h) / 2),
        int(el.hourLength ?? 52),
        int(el.minuteLength ?? 84),
        int(el.secondLength ?? 92),
        int(el.hourWidth ?? 9),
        int(el.minuteWidth ?? 6),
        int(el.secondWidth ?? 2),
        hexToNumber(el.hourColor ?? "#F2F5F9"),
        hexToNumber(el.minuteColor ?? "#F2F5F9"),
        hexToNumber(el.secondColor ?? "#FF7A1A"),
        int(el.hub ?? 7),
        hexToNumber(el.hubColor ?? "#FF7A1A"),
      ]);
      continue;
    }

    fail(`Tipe elemen tidak dikenal: ${el.type}`);
  }

  return {
    background: hexToNumber(design.background ?? "#000000"),
    rows,
    labels,
  };
}

function monkeyString(value) {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

export function designToMonkeyC(design) {
  const { background, rows, labels } = encodeDesign(design);
  const body = rows.map((row) => `        [${row.join(", ")}]`).join(",\n");
  const strings = labels.map(monkeyString).join(", ");
  const name = String(design.name ?? "Design").replace(/[^\w .-]/g, "");

  return `// Dibuat otomatis oleh watchface/compile-design.mjs dari "${name}". Jangan diedit manual.
import Toybox.Lang;

module DesignData {
    const BACKGROUND = ${background};

    function elements() as Array<Array<Number>> {
        return [
${body}
        ] as Array<Array<Number>>;
    }

    function labels() as Array<String> {
        return [${strings}] as Array<String>;
    }
}
`;
}
