# 📅 StudioFlow — Kalender Konten Digital

> Aplikasi web internal untuk mengelola perencanaan, kalender, alur produksi, tugas, aset, notifikasi, dan evaluasi konten digital dalam satu ruang kerja.

![Status](https://img.shields.io/badge/status-prototype-orange)
![Versi](https://img.shields.io/badge/versi-0.1.0-blue)
![Stack](https://img.shields.io/badge/stack-Vite%20%2B%20Vanilla%20JS-purple)
![Bahasa](https://img.shields.io/badge/bahasa-Indonesia-green)

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
│   ├── components/             # Komponen UI (calendar, pipeline, tasks, dst.)
│   ├── data/                   # Data dummy (mockData.js)
│   ├── styles/                 # Token CSS, layout, komponen
│   └── main.js                 # Entry point aplikasi
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

- [x] Fase 1 — Foundation & Design System
- [x] Fase 2 — Komponen UI utama
- [x] Fase 3 — Integrasi data dummy
- [ ] Fase 4 — Backend & autentikasi *(menunggu persetujuan)*
- [ ] Fase 5 — Integrasi platform & ekspor *(menunggu persetujuan)*

---

*Proyek ini dikembangkan sebagai prototipe konsep untuk kebutuhan internal tim konten digital.*
