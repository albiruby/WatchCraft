# DESIGN

Arah visual WATCHCRAFT untuk agent dan kontributor. Detail token dan komponen ada di `docs/DESIGN-SYSTEM.md`.

> Catatan jujur: arah di file ini ditulis oleh Claude atas permintaan pemilik proyek, bukan oleh desainer. Arah buatan AI cenderung jatuh ke selera default. Kalau ada keputusan yang terasa generik, ganti di sini lebih dulu, baru di kode.

## Identitas

Studio kerja untuk orang yang membuat watch face Garmin. Bahasa visualnya instrumen jam: skala, tick, jarum, angka tabular. Bukan landing page, bukan dashboard SaaS.

## Kepribadian

Presisi, tenang, sedikit nakal di satu titik: jarum detik oranye.

## Dial

`Dial: ENERGY 2 / RHYTHM 2 / MOTION 2`

- ENERGY 2: chrome tenang, satu aksen oranye, jam di tengah selalu jadi fokus.
- RHYTHM 2: halaman konsisten, dengan dua jeda yang disengaja (simulator besar di dashboard, editor tiga panel).
- MOTION 2: yang bergerak hanya yang memang berjalan di jam nyata: jarum detik, skala detik di header, data live simulator. Tanpa animasi masuk atau scroll reveal.

## Motif identitas

Skala 60 tick dengan satu tick oranye untuk detik sekarang (`SecondsRule`). Motif yang sama muncul di bezel template analog, di header aplikasi, dan di jarum detik native.

## Palet

Netral gelap dan terang dari `globals.css`, satu aksen oranye (`--accent`). Oranye hanya untuk: aksi utama, seleksi, fokus, detik berjalan. Tidak ada warna inti lain.

## Tipografi

- Inter untuk UI: rapat dan terbaca di panel padat.
- Red Hat Display untuk judul: geometris seperti angka di dial.
- Instrument Serif italic satu kali per halaman untuk nama perangkat: kontras editorial yang membuat judul terasa milik WATCHCRAFT.

## Tema

Tanpa pilihan tersimpan, tema mengikuti preferensi sistem. Toggle wajib bekerja di dua mode. Kanvas jam selalu hitam karena itu warna layar AMOLED.
