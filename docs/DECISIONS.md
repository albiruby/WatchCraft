# DECISIONS

Catatan keputusan teknis WATCHCRAFT. Semua keputusan di sini mengikat sampai ada alasan tertulis untuk mengubahnya.

## Kenapa dibangun ulang

Versi pertama dihapus total pada 11 November 2026. Alasannya bukan bug tunggal, tapi beban struktur: satu monorepo dengan 7 package untuk sekitar 1.400 baris kode bersama, build lewat turbo, dan 8 dokumen spec sepanjang 2.000 baris. Untuk satu aplikasi dan satu perangkat target, lapisan itu menambah jarak antara ide dan hasil.

Versi baru memakai satu aplikasi, satu schema, satu renderer, dan satu folder native.

## Stack

| Area | Pilihan | Alasan |
| --- | --- | --- |
| Framework | Next.js 16, App Router | Butuh route, API, dan auth untuk distribusi publik nanti |
| Bahasa | TypeScript 7 | Type safety di schema dan renderer |
| UI | React 19 | Server component untuk halaman statis, client untuk editor |
| Styling | Tailwind CSS 4 | Utility untuk layout, token CSS untuk warna dan tipografi |
| Schema | Zod 4 | Satu sumber untuk validasi dan tipe TypeScript |
| State | Zustand 5 | Cukup untuk satu dokumen editor, tanpa boilerplate |
| Lint | Biome 2 | Tidak terikat versi TypeScript, satu binary |
| Test | Vitest 5 | Cepat, tanpa konfigurasi berat |
| Native | Monkey C, Connect IQ SDK 9.3.0 | Satu-satunya cara render watch face native |
| Package manager | pnpm 10 | Sudah dipakai di mesin ini |

## Keputusan arsitektur

**Satu aplikasi, bukan monorepo.** Semua kode bersama ada di `src/core`. Kalau nanti ada konsumen kedua yang benar-benar terpisah, baru dipecah.

**Schema adalah kontrak.** `src/core/schema.ts` mendefinisikan desain. Tidak ada properti yang boleh dipakai editor kalau renderer native belum bisa menggambarnya.

**Display list jadi batas renderer.** Schema diubah menjadi daftar perintah gambar (`rect`, `circle`, `arc`, `text`). Web merender display list ke SVG, native merender display list yang sama ke `Graphics.Dc`. Tidak ada logika desain di komponen UI.

**Data simulasi, bukan data palsu.** Preview memakai satu set data tetap dan selalu menampilkan label "Data simulasi". Tidak ada angka acak dan tidak ada klaim sensor nyata.

**Penyimpanan lokal dulu.** Desain disimpan di `localStorage` dengan prefix `watchcraft:design:`. Supabase dan auth ditunda sampai alur editor stabil.

**Body jam memakai foto asli.** Device frame memakai tangkapan layar Connect IQ Simulator yang layarnya dilubangi, bukan ilustrasi. Alasannya: bentuk case, tombol, dan label bezel harus sama dengan perangkat nyata. Asset ada di `public/frames/fr165-body.png` dan bisa diganti per perangkat nanti.

**Simulator di dashboard hanya mengekspos kontrol yang benar-benar mengubah render.** Jam 12/24, bahasa, baterai, langkah, detak, dan sleep mode. Menu simulator lain seperti sensor, audio, dan BLE tidak ditampilkan karena tidak memengaruhi watch face.

**Native menerima layout dari sumber yang sama.** Fase ini memakai konstanta di `watchface/source/WatchCraftView.mc` yang mencerminkan template "Quiet". Fase berikutnya membaca design JSON lewat properties atau `makeWebRequest`, setelah spike membuktikannya.

## Batasan yang disengaja

- Tidak ada rotasi, opacity, gradient, image, atau blur di schema. Semuanya belum tentu bisa dirender native dengan hasil setara.
- Tidak ada drag bebas di luar kanvas. Posisi elemen dibatasi -200 sampai 600, dan kanvas 390 x 390.
- Tidak ada akun, cloud sync, atau publikasi template di versi ini.
- Tidak ada animasi dekoratif. Motion hanya untuk umpan balik 120 sampai 240 ms.
- Tanpa em dash di teks UI. Pakai koma, titik dua, atau tanda kurung.

## Arah jangka panjang

Dua arah yang sengaja disiapkan, bukan dikerjakan sekarang:

1. **Open source.** Kode, schema, dan pipeline build bisa dirilis publik setelah tidak ada kredensial di repo dan dokumentasi build cukup.
2. **Multi-device.** Semua model Garmin. Butuh registry profil perangkat (resolusi, memori, API, font), kanvas dinamis, dan uji parity per keluarga perangkat. Detail ada di `docs/PRD.md`.

## Yang berubah dari versi pertama

| Hal | Versi lama | Versi ini |
| --- | --- | --- |
| Struktur | 7 package + turbo | 1 app + `src/core` |
| Lint | ESLint + typescript-eslint | Biome |
| Ikon | Phosphor | SVG inline, 18 ikon |
| Docs | 8 file, sekitar 2.000 baris | 4 file, ringkas |
| Template | JSON di `public/`, dibaca runtime | Objek TypeScript, tervalidasi saat build |
| Native | `apps/garmin` di workspace | `watchface/` berdiri sendiri |
