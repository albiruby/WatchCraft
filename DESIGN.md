# DESIGN

Arah visual WATCHCRAFT untuk agent dan kontributor. Detail token dan komponen ada di `docs/DESIGN-SYSTEM.md`.

> Catatan jujur: arah di file ini ditulis oleh Claude atas permintaan pemilik proyek, bukan oleh desainer. Arah buatan AI cenderung jatuh ke selera default. Kalau ada keputusan yang terasa generik, ganti di sini lebih dulu, baru di kode.

## Identitas

Studio kerja untuk orang yang membuat watch face Garmin. Bahasa visualnya instrumen jam: skala, tick, jarum, angka tabular. Bukan landing page, bukan dashboard SaaS.

## Kepribadian

Presisi, tenang, sedikit nakal di satu titik: jarum detik oranye.

## Dial

`Dial: ENERGY 3 / RHYTHM 3 / MOTION 2`

- ENERGY 3: kokpit instrumen. Setiap halaman punya satu pembacaan raksasa (waktu, nama template, judul halaman) dan satu jam hidup sebagai fokus.
- RHYTHM 3: komposisi berbeda per halaman. Dashboard: pembacaan kiri, perangkat kanan, panel kontrol lebar, rail dial. Templates: spotlight lalu katalog dial. Library: angka nyata dan desain terakhir di dial.
- MOTION 2: yang bergerak hanya yang memang berjalan di jam nyata: jarum, detik, data live. Semua berdetak dari satu jam global (`src/lib/clock.ts`). Tanpa animasi masuk atau scroll reveal.

## Motif identitas

Skala 60 tick dengan satu tick oranye untuk detik sekarang. Bentuk lurusnya `SecondsRule` di header, bentuk melingkarnya `BezelDial` di sekeliling setiap pratinjau jam. Motif yang sama muncul di bezel template analog dan jarum detik native.

Angka dibaca seperti instrumen lewat `Readout`: label kecil, garis tick di atas, angka tabular Red Hat Display.

## Palet

Netral gelap dan terang dari `globals.css`, satu aksen oranye (`--accent`). Oranye hanya untuk: aksi utama, seleksi, fokus, detik berjalan. Tidak ada warna inti lain.

## Tipografi

- Inter untuk UI: rapat dan terbaca di panel padat.
- Red Hat Display untuk judul: geometris seperti angka di dial.
- Instrument Serif italic satu kali per halaman untuk nama perangkat: kontras editorial yang membuat judul terasa milik WATCHCRAFT.

## Tema

Tanpa pilihan tersimpan, tema mengikuti preferensi sistem. Toggle wajib bekerja di dua mode. Kanvas jam selalu hitam karena itu warna layar AMOLED.
