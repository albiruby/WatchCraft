# Contributing

Terima kasih sudah mampir. Repo ini masih alpha, jadi perubahan besar sebaiknya dibahas dulu lewat issue.

## Sebelum mulai

- Node 24 dan pnpm 10.
- Java 21 hanya diperlukan kalau mengubah watch face native.
- Semua perintah dijalankan dari root repo.

```bash
pnpm install
pnpm dev
```

## Gate wajib

Pull request hanya diterima kalau semua ini hijau:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Untuk perubahan native, tambahkan:

```bash
pnpm watchface
```

Build native butuh Connect IQ SDK di Windows dan developer key di `%USERPROFILE%\.Garmin\ConnectIQ\developer_key.der`.

## Aturan perubahan

1. Schema adalah kontrak. Kalau menambah properti desain, update `src/core/schema.ts`, renderer, dan dokumentasi `docs/SCHEMA.md`.
2. Jangan menambah kontrol yang tidak mengubah hasil render. Setiap tombol harus bekerja.
3. Preview memakai data simulasi dan labelnya harus tetap terlihat.
4. Tanpa em dash di teks UI.
5. Jangan commit developer key, file `.prg`, atau kredensial.

## Struktur commit

Pesan commit memakai bentuk `feat:`, `fix:`, `docs:`, `test:`, atau `chore:`.

## Issue

Sertakan langkah reproduksi, perilaku yang diharapkan, dan screenshot kalau menyangkut tampilan.
