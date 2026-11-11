# 📅 StudioFlow — Kalender Konten Digital

> Aplikasi web internal untuk mengelola perencanaan, kalender, alur produksi, tugas, aset, notifikasi, dan evaluasi konten digital dalam satu ruang kerja.

![Status](https://img.shields.io/badge/status-prototype-red)
![Tema](https://img.shields.io/badge/tema-Merah%20%26%20Gold-B91C1C)
![Stack](https://img.shields.io/badge/stack-Vite%20%2B%20Vanilla%20JS-C99312)
![Bahasa](https://img.shields.io/badge/bahasa-Indonesia-88131D)

---

## 📌 Tentang Proyek

**StudioFlow** adalah prototipe front-end untuk tim konten digital. Dirancang untuk memberi visibilitas cepat terhadap status produksi, publikasi, keterlambatan, dan tugas mendesak — semua dalam satu antarmuka yang bersih dan responsif.

> ⚠️ **Prototipe:** Seluruh data adalah data dummy. Tidak ada backend, autentikasi nyata, upload sungguhan, atau integrasi platform pada tahap ini.

---

## ✨ Fitur Utama

| Fitur | Deskripsi |
|---|---|
| 📊 **Dashboard** | Total direncanakan, sedang diproduksi, selesai, terlambat, tugas prioritas |
| 📅 **Kalender Konten** | Tampilan bulanan/mingguan/harian; filter platform, kategori, status |
| 🔄 **Pipeline Produksi** | 8 tahap dari ide hingga publikasi, kontrol status via UI |
| ✅ **Manajemen Tugas** | Buat/edit tugas, penanggung jawab, deadline, prioritas |
| 👥 **Pengguna & Peran** | Admin, Koordinator, Tim Kreatif, Reviewer, Publikasi |
| 📁 **Aset** | Daftar berkas dummy, tipe, konten terkait |
| 🔔 **Notifikasi** | Pengingat tenggat, tugas baru, revisi, keputusan review |
| 📈 **Laporan** | Jumlah per status/periode/platform, produktivitas anggota |

---

## 🗂️ Struktur Folder

```
sot-content-studio/
├── docs/
│   ├── PRD.md                  # Product Requirements Document
│   ├── UI_GUIDELINE.md         # Panduan desain & komponen
│   └── IMPLEMENTATION_PLAN.md  # Rencana implementasi per fase
├── src/
│   ├── components/             # Komponen UI (calendar, pipeline, tasks, contentModal, dst.)
│   ├── data/                   # Data dummy (mockData.js)
│   ├── styles/                 # Token CSS (Merah · Gold · Putih), layout, komponen
│   ├── utils/                  # Helper umum (escapeHtml, format tanggal)
│   └── main.js                 # Entry point aplikasi & pencarian global
├── index.html
├── AGENTS.md                   # Kontrak kerja agen AI
├── PROMPT_EXECUTION.md         # Log eksekusi prompt
└── package.json
```

---

## 🚀 Cara Menjalankan

### Prasyarat
- Node.js v18+
- npm

### Langkah

```bash
# Clone repository
git clone https://github.com/falza040825-cpu/tugas-projek-kalender-konten-.git
cd tugas-projek-kalender-konten-

# Install dependencies
npm install

# Jalankan dev server
npm run dev
```

Buka browser di `http://localhost:5173`

---

## 👥 Peran Pengguna

| Peran | Kemampuan |
|---|---|
| **Admin** | Seluruh data dan pengaturan pengguna |
| **Koordinator** | Perencanaan, kalender, penugasan, persetujuan alur |
| **Tim Kreatif** | Naskah, desain/video, editing, revisi, unggah aset |
| **Reviewer** | Review, komentar, persetujuan atau penolakan |
| **Publikasi** | Penjadwalan tayang, pembaruan status, tautan publikasi |

> Pergantian peran pada prototipe hanya simulasi tampilan, bukan kontrol keamanan.

---

## 🔄 Pipeline Produksi

```
Ide/Perencanaan → Naskah/Caption → Desain/Video → Editing
     → Review/Revisi → Persetujuan → Siap Publikasi → Dipublikasikan
```

---

## 📄 Dokumen SOT (Source of Truth)

- [`docs/PRD.md`](docs/PRD.md) — Kebutuhan produk dan ruang lingkup
- [`docs/UI_GUIDELINE.md`](docs/UI_GUIDELINE.md) — Panduan desain, warna, tipografi, komponen
- [`docs/IMPLEMENTATION_PLAN.md`](docs/IMPLEMENTATION_PLAN.md) — Rencana implementasi per fase
- [`AGENTS.md`](AGENTS.md) — Kontrak kerja agen AI
- [`PROMPT_EXECUTION.md`](PROMPT_EXECUTION.md) — Log eksekusi prompt

---

## 🛠️ Tech Stack

- **Vite** — Build tool & dev server
- **Vanilla JavaScript** — Logika aplikasi tanpa framework
- **Vanilla CSS** — Styling dengan design tokens

---

## 📋 Status Pengembangan

- [x] Fase 0 — Persetujuan SOT
- [x] Fase 1 — Fondasi front-end & Design System (**Merah · Gold · Putih**)
- [x] Fase 2 — Halaman operasional (Kalender, Pipeline Produksi, Manajemen Tugas)
- [x] Fase 3 — Workspace pendukung (Pengguna & Akses, Aset, Notifikasi, Laporan)
- [x] Fase 4 — QA visual, aksesibilitas, responsif & sinkronisasi dokumen prototipe
- [ ] Fase lanjutan (pasca-prototipe): Backend, autentikasi nyata, upload server, & ekspor PDF/CSV *(menunggu keputusan & persetujuan terpisah)*

---

*Proyek ini dikembangkan sebagai prototipe konsep untuk kebutuhan internal tim konten digital.*
