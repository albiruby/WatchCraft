# DESIGN-SYSTEM

Sistem visual WATCHCRAFT. Sumber implementasi: `src/app/globals.css`.

## Arah

Studio profesional, bukan landing page. Tenang, presisi, lapang. Chrome gelap mengelilingi kanvas jam yang terang. Setiap keputusan visual harus bisa dijelaskan dalam satu baris.

## Warna

Token didefinisikan sebagai CSS variable, lalu dipetakan ke Tailwind lewat `@theme inline`. Default gelap, terang lewat `[data-theme="light"]`.

| Token | Gelap | Terang | Pemakaian |
| --- | --- | --- | --- |
| `--page` | `#0B0F14` | `#F3F4F6` | Latar halaman |
| `--panel` | `#11161D` | `#FFFFFF` | Panel, kartu |
| `--raised` | `#171E28` | `#F9FAFB` | Kontrol, tombol sekunder |
| `--line` | `#232C39` | `#DCE0E6` | Garis dan border |
| `--line-strong` | `#334052` | `#C3C9D2` | Border hover, pemisah tegas |
| `--ink` | `#E9EEF5` | `#11161D` | Teks utama |
| `--muted` | `#98A2B3` | `#55606F` | Teks sekunder |
| `--faint` | `#7C8698` | `#5F6875` | Label teknis |
| `--accent` | `#FF7A1A` | `#B93D0A` | Aksi utama, seleksi, fokus |
| `--accent-ink` | `#140A02` | `#FFFFFF` | Teks di atas aksen |
| `--dot` | `#1D2531` | `#DFE3E9` | Titik workspace |
| `--ok` | `#2E9E6B` | `#157A4B` | Status sukses |
| `--warn` | `#E0A100` | `#8A5A00` | Peringatan |
| `--danger` | `#F0616D` | `#B4232E` | Hapus, error |

Aturan aksen: oranye hanya untuk aksi utama, seleksi elemen, fokus keyboard, dan status sinkronisasi. Bukan dekorasi.

Nilai teks di kedua tema sudah dipilih agar lolos WCAG AA pada permukaan masing-masing. Setiap perubahan warna wajib diuji ulang.

## Tipografi

| Peran | Font | Alasan |
| --- | --- | --- |
| UI dan body | Inter | Netral, rapat, terbaca di chrome padat |
| Heading dan judul | Red Hat Display | Geometris, tegas, tetap terasa alat kerja |
| Aksen display | Instrument Serif italic | Kontras editorial untuk satu baris besar |

Dimuat lewat `next/font`, self-hosted, tanpa request runtime.

Angka teknis memakai Inter dengan `font-variant-numeric: tabular-nums`, bukan font mono terpisah. Kelas `.mono` di kode adalah utility angka tabular, bukan keluarga font lain.

Skala:

| Nama | Ukuran | Pemakaian |
| --- | --- | --- |
| Display | 34 sampai 42 px | Judul dashboard |
| Title | 24 px | Judul halaman |
| Body | 15 px | Paragraf utama |
| UI | 13 px | Label, tombol, navigasi |
| Small | 12 px | Inspector, teks rapat |
| Mono label | 9 sampai 10 px | Label teknis, tracking 0.14 sampai 0.2 em |

Angka teknis selalu memakai kelas `.mono` dan `tabular-nums`.

## Spasi dan bentuk

- Grid dasar 4 px. Jarak umum: 8, 12, 16, 24, 32, 48.
- Radius: 4 px untuk kontrol kecil, 6 px untuk tombol, 8 px untuk kartu, penuh untuk lingkaran.
- Border selalu 1 px. Tidak ada bayangan pada UI. Bayangan hanya pada device frame.
- Lebar panel editor: komponen 236 px, inspector 320 px.

## Komponen

**Button**

| Variant | Latar | Teks | Pemakaian |
| --- | --- | --- | --- |
| primary | accent | accent-ink | Satu aksi utama per area |
| secondary | raised | ink | Aksi pendukung |
| ghost | transparan | muted | Aksi dalam baris padat |
| danger | transparan | danger | Hapus |

Tinggi 36 px, kecil 32 px. Fokus memakai outline aksen 2 px.

**Card.** Panel dengan border dan radius 8 px. Header 44 px dengan judul 13 px dan meta mono 10 px.

**Badge.** Tinggi 20 px, mono 10 px, uppercase, tracking 0.14 em. Tone netral, aksen, atau sukses.

**Field.** Label 12 px di kiri, kontrol lebar 112 px di kanan. Input 28 px, mono 11 px.

## Gerak

- Hover dan fokus: 120 sampai 160 ms.
- Panel dan seleksi: 160 sampai 240 ms.
- Tidak ada animasi masuk, parallax, atau reveal saat scroll.
- `prefers-reduced-motion` mematikan transisi.

## Device frame

Forerunner 165 memakai body asli hasil tangkapan layar Connect IQ Simulator, bukan ilustrasi SVG.

- Asset: `public/frames/fr165-body.png`, 440 x 784 px.
- Latar putih dihapus, area layar dilubangi dengan alpha 0.
- Lubang layar: lingkaran 344 px di posisi (48, 228).
- Kanvas desain digambar di dalam lubang itu, jadi yang terlihat adalah layar jam yang benar-benar bisa diubah.
- Ujung strap di-fade 9 persen di atas dan bawah agar tidak terlihat terpotong.
- Kanvas jam selalu hitam murni karena itu warna layar perangkat.
- Render native asli disimpan di `public/native/fr165-quiet.png` dan ditampilkan di dashboard sebagai bukti, bukan mockup.

## Aksesibilitas

1. Semua tombol ikon punya `aria-label`.
2. Fokus keyboard terlihat di semua kontrol.
3. Segmented control memakai `fieldset` dan `legend`.
4. Kontras teks minimal 4.5:1, kontrol dan border minimal 3:1.
5. Tema terang wajib diuji di semua halaman, termasuk editor.
6. Informasi status tidak hanya dibawa warna, selalu ada teks atau ikon.

## Keputusan anti-slop

- Dashboard adalah meja kerja, bukan landing page. Tidak ada hero pemasaran, tidak ada angka dekoratif.
- Tidak ada eyebrow uppercase di judul halaman. Label uppercase hanya dipakai untuk status dan field teknis di editor.
- CTA menyebut tindakan: Watch face, Data field, Buka editor.
- Satu aksen oranye. Tanpa gradient dekoratif, glow, atau glassmorphism.
- Instrument Serif hanya satu aksen di judul studio, bukan dicampur ke headline lain.
- Grid template seragam karena itu katalog, bukan feature grid pemasaran.
- Latar titik di editor punya alasan: itu area kerja kanvas, bukan tekstur dekoratif.

## Larangan

- Em dash di teks UI.
- Gradient dekoratif, glassmorphism, glow, noise texture.
- Bento grid sebagai layout default.
- Statistik atau angka tanpa sumber nyata.
- Ikon sparkle, magic, robot, orb.
- Kursor kustom.
