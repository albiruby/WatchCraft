# TECHNICAL NOTES

Catatan hasil uji perangkat dan keputusan yang belum final. Diisi hanya setelah ada bukti.

## Lingkungan

| Item | Nilai |
| --- | --- |
| SDK Connect IQ | 9.3.0 (2026-10-20) |
| Perangkat | Forerunner 165, 390 x 390, API 5.2.0, 16 bpp |
| Memori watch face | 131.072 byte |
| Developer key | `%USERPROFILE%\.Garmin\ConnectIQ\developer_key.der` |
| Java | JDK 21 |

## Status uji

| Uji | Status | Tanggal | Catatan |
| --- | --- | --- | --- |
| Build `.prg` fr165 | Lolos | 2026-11-11 | `pnpm watchface` menghasilkan `watchface/bin/watchcraft-fr165.prg` |
| Simulator fr165 | Lolos | 2026-11-11 | Watch face tampil, jam, tanggal, dan busur baterai terlihat. Screenshot: `public/native/fr165-quiet.png` |
| Parity busur | Diperbaiki | 2026-11-11 | Native sebelumnya tumbuh dari sisi kanan, sekarang dari kiri seperti preview |
| Pasang ke jam fisik | Belum | | Butuh developer mode aktif |
| Parity web dan native | Sebagian | | Layout Quiet sudah cocok, toleransi 2 px belum diukur formal |
| Sync desain | Belum | | Mekanisme belum dipilih |

## Catatan simulator

- `monkeydo.bat` menahan proses selama app berjalan. Jalankan lewat job atau proses terpisah.
- Window simulator bisa muncul kecil (sekitar 199 x 34) kalau dimulai tanpa device. Tunggu window utama, baru push app.
- Body jam diambil dari screenshot simulator, latar putih dihapus, layar dilubangi, lalu dipakai sebagai device frame web.
- Screenshot native memakai jam 15:25 dan baterai 62 persen, bukan data preview web.

## Pertanyaan terbuka

1. Apakah `Properties` cukup untuk mengirim desain utuh, atau perlu `makeWebRequest`?
2. Berapa ukuran payload maksimum yang aman untuk watch face 128 KB?
3. Apakah perubahan properti memicu render ulang tanpa restart watch face?
4. Bagaimana perilaku saat jam tidak terhubung ke ponsel?
