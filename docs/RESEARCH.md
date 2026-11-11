# RESEARCH

Riset kompetitor dan benchmark fitur, 11 November 2026.

## Pertanyaan

Apakah sudah ada editor watch face berbasis web, open source, yang setara WATCHCRAFT? Kalau ada, fitur apa yang layak diadopsi?

## Temuan

Pencarian GitHub untuk `watch face editor`, `watchface designer`, `garmin watchface`, dan `connect iq watchface`.

| Proyek | Platform | Bentuk | Fitur menonjol | Bintang |
| --- | --- | --- | --- | --- |
| EasyFace | Xiaomi | Desktop Windows | Compiler, emulator, unpack watch face, database online | 773 |
| MiBand 5/6 editor | Mi Band | Web HTML | Editor ringan, arsip | 289 |
| Amazfit ZeppOS editor | Amazfit | Desktop C# | GUI editor, banyak model | 86 |
| WCMF | CMF by Nothing | Web React | BLE flashing, multi-device, AOD, font dot-matrix, export BIN/PNG/JSON, context menu | 13 |
| FaceMaker | Facer / Wear OS | Web | Desain watch face untuk Facer | 8 |
| AsteroidOS playground | AsteroidOS | Web QML | Editor watch face berbasis QML | 2 |
| Watchy designer | Watchy e-ink | Web | Desain e-ink | 0 |
| Garmin watch face repos | Garmin | Monkey C | Kode watch face manual, bukan editor | 46 sampai 91 |

## Kesimpulan

Tidak ada editor web open source untuk Garmin Connect IQ. Ekosistem Garmin didominasi watch face yang ditulis manual dalam Monkey C. Alat visual yang matang justru ada di platform lain, dan Garmin punya Face-It yang tertutup.

Artinya WATCHCRAFT menempati celah yang cukup jelas: editor visual, schema terbuka, dan pipeline native Monkey C.

## Fitur yang diadopsi

Diambil dari WCMF dan EasyFace, disesuaikan dengan batasan Garmin:

| Fitur | Status | Catatan |
| --- | --- | --- |
| Multi-select dengan shift klik | Selesai | Di kanvas dan panel layer |
| Align dan distribute | Selesai | Rata ke kanvas, distribusi horizontal dan vertikal |
| Smart guides saat drag | Selesai | Snap ke tengah kanvas dan tepi elemen lain |
| Command palette | Selesai | Ctrl+K, 29 aksi |
| Metrik tambahan | Selesai | Kalori, jarak, notifikasi, suhu |
| Export PNG | Selesai | 780 x 780, dari display list yang sama |
| Context menu kanvas | Belum | Kandidat berikutnya |
| AOD preview | Belum | Menunggu renderer native |
| Live clock | Belum | Preview sekarang statis |
| Multi-device | Belum | Butuh profil perangkat |
| Version snapshot | Belum | Kandidat berikutnya |

## Yang tidak diadopsi

- **BLE flashing.** Garmin memakai kabel atau Connect IQ Store, bukan BLE langsung dari browser.
- **Format biner milik vendor.** Setiap platform punya format sendiri. Garmin memakai `.prg` yang dibangun SDK.
- **Font dot-matrix bawaan.** Garmin punya font sistem sendiri, dan custom font butuh resource terpisah.

## Catatan lisensi

Body jam di `public/frames/` berasal dari tangkapan layar simulator Garmin. Untuk rilis open source, aset ini harus diganti dengan gambar berlisensi atau dibuat sendiri.
