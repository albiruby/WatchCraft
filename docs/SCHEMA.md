# SCHEMA

Kontrak data WATCHCRAFT. Implementasi: `src/core/schema.ts`. Validasi memakai Zod, tipe TypeScript diturunkan dari schema yang sama.

## Root

```ts
type Design = {
  version: 1;
  id: string;          // 1..64 karakter
  name: string;        // 1..60 karakter
  device: "fr165";
  background: string;  // #RRGGBB
  elements: Element[]; // maksimal 40
  updatedAt: string;   // ISO 8601
};
```

Kanvas selalu 390 x 390 unit. Satu unit kira-kira sama dengan satu piksel di Forerunner 165.

## Elemen

Setiap elemen punya `id`, `x`, `y`, `visible`, `locked`.

- `visible` dan `locked` hanya memengaruhi editor dan display list. Native tidak menggambar elemen yang `visible = false`.
- `id` unik di dalam satu desain. Duplikasi memberi akhiran acak 4 karakter.

### Text

```ts
{
  type: "text";
  metric: "label" | "time" | "date" | "battery" | "steps" | "heartRate";
  text: string;        // dipakai saat metric = "label", maksimal 40 karakter
  size: number;        // 8..180, satuan kanvas
  family: "sans" | "mono" | "digits";
  weight: "regular" | "medium" | "bold";
  color: string;       // #RRGGBB
  align: "left" | "center" | "right";
  tracking: number;    // -2..8, jarak antarhuruf
}
```

Aturan posisi: `x` dan `y` adalah titik pusat kotak teks. `align` menentukan tepi horizontal terhadap `x`, vertikal selalu tengah.

Nilai metrik:

| Metric | Contoh output | Sumber di jam |
| --- | --- | --- |
| time | `10:09` | `System.getClockTime()` |
| date | `WED 11` | `Gregorian.info()` |
| battery | `78%` | `System.getSystemStats().battery` |
| steps | `6,420` | `ActivityMonitor`, butuh izin |
| heartRate | `62 BPM` | `SensorHistory`, butuh izin |
| calories | `1,480 KCAL` | `ActivityMonitor`, butuh izin |
| distance | `7.42 KM` | `ActivityMonitor`, butuh izin |
| notifications | `3 MSG` | `Notifications`, butuh izin |
| weather | `27°C` | `Weather`, butuh koneksi |
| floors | `12 FLR` | `ActivityMonitor`, butuh izin |
| activeMinutes | `47 MIN` | `ActivityMonitor`, butuh izin |
| stress | `28` | `SensorHistory`, butuh izin |
| bodyBattery | `64` | `SensorHistory`, butuh izin |
| vo2max | `48` | `UserProfile`, butuh izin |
| altitude | `142 M` | `SensorHistory`, butuh izin |
| label | teks bebas | konstanta |

### Shape

```ts
{
  type: "shape";
  shape: "rect" | "circle";
  w: number;           // 1..390
  h: number;           // 1..390
  radius: number;      // 0..195, hanya untuk rect
  fill: string;
  stroke: string | null;
  strokeWidth: number; // 0..16
}
```

`x`, `y` adalah sudut kiri atas kotak pembatas. Lingkaran memakai pusat kotak pembatas dengan jari-jari setengah sisi terpendek.

### Arc

```ts
{
  type: "arc";
  w: number;           // 20..390
  h: number;           // 20..390
  width: number;       // 1..24, tebal garis
  track: string;       // warna rel
  color: string;       // warna nilai
  startAngle: number;  // -360..360, derajat
  sweep: number;       // 1..360, derajat
  metric: "battery" | "steps" | "heartRate";
  max: number;         // nilai yang dianggap penuh
  cap: "butt" | "round";
}
```

Busur selalu menggambar dua perintah: rel penuh sebesar `sweep`, lalu nilai sebesar `sweep * clamp(value / max)`.

Konvensi sudut mengikuti SVG: 0 derajat di kanan, -90 di atas, bertambah searah jarum jam di layar.

## Display list

`src/core/renderer.ts` mengubah desain menjadi perintah gambar:

| Perintah | Field |
| --- | --- |
| `rect` | x, y, w, h, radius, fill, stroke, strokeWidth |
| `circle` | cx, cy, r, fill, stroke, strokeWidth |
| `arc` | cx, cy, r, start, sweep, width, color, cap |
| `text` | x, y, text, size, family, weight, color, align, tracking |

Aturan:

1. Urutan array adalah urutan gambar. Elemen terakhir digambar paling atas.
2. Elemen `visible = false` tidak masuk display list.
3. Teks multiline dipecah menjadi satu perintah per baris, jarak 1.2 kali `size`.
4. Nilai arc di-clamp ke 0..1. Nilai 0 tetap menghasilkan sweep 0.01 agar tidak menghilang dari renderer SVG.

## Pemetaan ke native

| Web | Monkey C |
| --- | --- |
| rect | `dc.fillRectangle` atau `dc.drawRectangle` |
| circle | `dc.fillCircle` atau `dc.drawCircle` |
| arc | `dc.drawArc`, konvensi berbeda: 0 derajat di jam 3, 90 di jam 12 |
| text | `dc.drawText` dengan `TEXT_JUSTIFY_*` |
| family sans/mono/digits | font resource atau `FONT_NUMBER_*` |
| tracking | belum didukung native |

Konversi sudut native: `nativeAngle = -svgAngle`. Busur atas dari -120 ke -60 menjadi 120 ke 60, digambar `ARC_COUNTER_CLOCKWISE`.

## Batas validasi

- Maksimal 40 elemen per desain.
- Warna harus `#RRGGBB`, bukan nama warna.
- Tidak ada elemen di luar tipe yang terdaftar. `type: "image"` ditolak.
- File yang tidak lolos `safeParseDesign` tidak boleh masuk penyimpanan.
