# PRD

Produk: WATCHCRAFT, studio watch face berbasis web untuk Garmin Forerunner 165.

## Masalah

Membuat watch face Garmin butuh Monkey C, SDK, developer key, dan siklus build yang lambat. Desainer dan pengguna power tidak punya tempat untuk mencoba komposisi dengan cepat sebelum menyentuh kode native.

## Pengguna

1. **Desainer watch face.** Ingin menyusun tipografi, busur, dan data tanpa menulis Monkey C.
2. **Pengguna power Forerunner 165.** Ingin watch face sendiri tanpa mempelajari SDK.

Keduanya memakai desktop. Editor bukan pengalaman mobile.

## Nilai utama

Satu desain, dua renderer. Geometri yang terlihat di browser adalah geometri yang digambar di layar jam. Preview memakai data simulasi, jam memakai data nyata.

## Alur utama

1. Buka dashboard, pilih template atau kanvas kosong.
2. Susun elemen di kanvas 390 x 390: waktu, tanggal, baterai, langkah, detak, label, kotak, lingkaran, busur.
3. Ubah properti di inspector. Setiap perubahan masuk riwayat undo.
4. Cek preview di device frame Forerunner 165 dengan label data simulasi.
5. Export SVG untuk review visual, export JSON sebagai sumber build native.
6. Build `.prg` di mesin lokal, pasang ke jam sekali. Perubahan desain berikutnya lewat mekanisme sync yang belum final.

## Kebutuhan fungsional

| ID | Kebutuhan | Status |
| --- | --- | --- |
| FR1 | Template siap pakai yang bisa dikloning | Selesai |
| FR2 | Kanvas 390 x 390 dengan grid dan snap tengah | Selesai |
| FR3 | Tambah, pilih, geser, duplikat, hapus elemen | Selesai |
| FR4 | Layer: urutan, visibilitas, kunci | Selesai |
| FR5 | Inspector per tipe elemen | Selesai |
| FR6 | Undo dan redo minimal 50 langkah | Selesai |
| FR7 | Simpan otomatis ke localStorage | Selesai |
| FR8 | Import dan export JSON tervalidasi schema | Selesai |
| FR9 | Export SVG dari display list | Selesai |
| FR10 | Build `.prg` untuk fr165 | Selesai |
| FR11 | Render native yang cocok dengan preview | Sebagian, template Quiet |
| FR12 | Sinkronisasi desain tanpa install ulang | Belum, menunggu spike |
| FR13 | Akun dan penyimpanan cloud | Belum |
| FR14 | Panel simulator di dashboard: jam 12/24, bahasa, baterai, langkah, detak, sleep mode | Selesai |
| FR15 | Bukti render native dari Connect IQ Simulator | Selesai |
| FR16 | Multi-select, align, dan distribute | Selesai |
| FR17 | Smart guides saat drag | Selesai |
| FR18 | Command palette dan export PNG | Selesai |

## Kebutuhan non-fungsional

- Editor hanya aktif pada viewport 1024 px ke atas. Di bawah itu tampil gate yang menjelaskan kenapa.
- Kedua tema, gelap dan terang, wajib lolos kontras WCAG AA untuk teks dan kontrol.
- Preview selalu menampilkan label "Data simulasi".
- Tidak ada request runtime ke pihak ketiga. Font di-host lewat `next/font`, ikon berupa SVG inline.
- Build produksi tidak boleh bergantung pada data acak agar tidak ada hydration mismatch.
- Watch face harus muat di 128 KB memori dan hanya memakai API level 5.2.0.

## Di luar cakupan versi ini

- Publikasi watch face ke Connect IQ Store.
- Editor untuk perangkat selain Forerunner 165.
- Animasi watch face, gambar bitmap, dan font kustom.
- Sinkronisasi otomatis dari browser ke jam.

## Arah jangka panjang

Kalau pondasi ini stabil, dua hal berikut dibuka:

1. **Open source.** Seluruh kode, schema, dan pipeline build dirilis dengan lisensi yang jelas. Syaratnya: tidak ada kredensial, developer key, atau aset berhak cipta di repo, dan dokumentasi cukup untuk orang lain menjalankan build. Catatan aset: body jam di `public/frames/` berasal dari tangkapan layar simulator Garmin, jadi sebelum rilis publik aset itu harus diganti dengan gambar berlisensi atau dibuat sendiri.
2. **Semua model Garmin.** Forerunner, Fenix, Venu, Vivoactive, Edge, dan seterusnya. Syarat teknisnya:
   - Profil perangkat berisi resolusi, bentuk layar, memori, API level, dan font yang tersedia.
   - Kanvas tidak lagi hard-coded 390 x 390.
   - Kapabilitas per tipe perangkat (watch face, data field, widget) dipisah.
   - Uji render per keluarga perangkat, bukan hanya satu jam.
   - Batas memori dan jumlah elemen dihitung dari profil, bukan konstanta.

Versi ini sengaja fokus ke satu perangkat supaya parity bisa dibuktikan dulu. Multi-device tanpa parity hanya menambah permukaan bug.

## Kriteria sukses

1. Pengguna bisa membuat desain dari nol dan menyimpannya tanpa menyentuh kode.
2. Desain yang sama bisa dibangun menjadi `.prg` dan tampil di Forerunner 165 dengan selisih posisi maksimal 2 px dibanding preview.
3. `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`, dan `pnpm watchface` hijau di mesin bersih.
4. Tidak ada elemen UI yang mengklaim fitur yang belum ada.

## Risiko

| Risiko | Dampak | Mitigasi |
| --- | --- | --- |
| Mekanisme sync tidak didukung | Janji "tanpa install ulang" gagal | Spike sebelum membangun UI sync |
| Perbedaan metrik font web dan native | Parity meleset | Uji visual di simulator, toleransi 2 px, dokumentasikan |
| Batas memori 128 KB | Watch face gagal load | Jaga jumlah elemen, hindari bitmap besar |
| localStorage hilang | Desain pengguna hilang | Export JSON sebagai cadangan, cloud ditunda |
