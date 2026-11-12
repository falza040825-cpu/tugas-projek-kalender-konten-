# Implementation Plan — Yayasan Motivator Qur'an

**Status:** Pembaruan Fase 5.1 (Invite-Only, Aktivasi Akun & Manajemen Tim) — sedang dieksekusi sesuai instruksi eksplisit pengguna. Tidak ada fase berikutnya dijalankan tanpa persetujuan eksplisit.

## Prinsip eksekusi SOT
Hanya tiga dokumen yang menjadi sumber kebenaran produk: `PRD.md`, `UI_GUIDELINE.md`, dan `IMPLEMENTATION_PLAN.md`. `AGENTS.md` dan `PROMPT_EXECUTION.md` adalah kontrak kerja untuk agen, bukan pengganti SOT. Bila ada konflik, hentikan pekerjaan dan minta keputusan pengguna.

## Fase 0 — Persetujuan SOT *(Selesai)*
- Tampilkan preview dashboard dan preview isi ketiga dokumen.
- Kumpulkan persetujuan/perubahan pengguna.
- **Gate:** jangan mulai implementasi fase berikutnya sebelum pengguna menyatakan setuju.

## Fase 1 — Fondasi front-end *(Selesai)*
- Siapkan Vite dan struktur modul ringan.
- Tetapkan tokens, layout shell, navigasi, komponen dasar.
- Gunakan dummy data terpusat.
- **Gate:** minta approval setelah fondasi dapat dipreview.

## Fase 2 — Halaman operasional *(Selesai)*
- Dashboard, kalender, pipeline produksi, tugas.
- Implementasikan interaksi lokal pada dummy data.
- **Gate:** minta approval untuk alur utama sebelum lanjut.

## Fase 3 — Workspace pendukung *(Selesai)*
- Pengguna/peran (simulasi), aset, notifikasi, laporan.
- Pastikan seluruh area fitur dari PRD memiliki keadaan UI.
- **Gate:** minta approval sebelum polish/penutupan.

## Fase 4 — QA visual, tema Merah · Gold · Putih & handoff *(Selesai)*
- Uji navigasi, filter, mode kalender, form demo, responsif, dan konsistensi status.
- Terapkan tema Merah · Gold · Putih serta branding Yayasan Motivator Qur'an & admin Helza.
- Verifikasi build Vite dan dokumentasi.

## Fase 5 — RBAC Front-End, Invite-Only Login & Manajemen Tim *(Aktif)*
Tujuan: Menerapkan kontrol akses 3 peran inti (**Ketua Tim [Super Admin]**, **Copywriter**, **Editor**), alur pendaftaran **Invite-Only / Pre-Registered Email**, **Aktivasi Akun**, dan menu **Manajemen Tim** pada satu shell Vite (`state`/`localStorage`).

1. **Peran Ketua Tim sebagai Super Admin & Data Akun (`state`/`localStorage`):**
   - Satukan kendali sistem di bawah peran **Ketua Tim (Super Admin)** tanpa pemisahan dengan Admin.
   - Pertahankan 3 akun bawaan aktif (`ketua@tim.com`, `copywriter@tim.com`, `editor@tim.com`) di `localStorage` untuk pengujian cepat.
   - Dukungan status anggota `Menunggu Aktivasi` dan `Aktif` pada daftar tim serta sinkronisasi penugasan konten aktif.
2. **Menu Manajemen Tim (Khusus Ketua Tim):**
   - Tampilkan menu **Manajemen Tim** hanya ketika user yang masuk memiliki peran `Ketua Tim`.
   - Sediakan form pendaftaran anggota baru: input **Email Anggota** + pilihan **Tugas/Role** (`Copywriter` atau `Editor`), default status `Menunggu Aktivasi`.
   - Sediakan tabel daftar anggota beserta status (`Menunggu Aktivasi` / `Aktif`), aksi ubah role, hapus anggota (dengan konfirmasi aman & proteksi akun Ketua Tim aktif), serta matriks hak akses.
3. **Halaman Autentikasi Dua Tab (`Sign In` & `Aktivasi Akun`):**
   - **Tab Sign In (Masuk):** input **Email** (`autocomplete="email"`) dan **Kata Sandi** (`autocomplete="current-password"`) tanpa dropdown role; hanya akun berstatus `Aktif` yang dapat masuk; deteksi role otomatis sesuai data tim.
   - **Tab Aktivasi Akun (Pengguna Baru):** input **Email**, **Nama Lengkap**, dan **Buat Kata Sandi Baru** tanpa dropdown role.
   - Validasi aktivasi terhadap daftar anggota praregistrasi Ketua Tim di `localStorage`:
     - Jika cocok dan berstatus `Menunggu Aktivasi`: simpan Nama Lengkap & Kata Sandi, ubah status ke `Aktif`, tampilkan pesan sukses, dan arahkan otomatis ke tab **Sign In**.
     - Jika email belum didaftarkan Ketua Tim: tampilkan error *"Email belum terdaftar. Hubungi Ketua Tim untuk mendapatkan akses."*
4. **Satu Dashboard Dinamis & Alur Konten Terhubung:**
   - Render menu sidebar (`Manajemen Tim` dan `Laporan` disembunyikan bagi Copywriter & Editor), tombol aksi, dan daftar kartu konten secara kondisional berdasarkan `currentUser.role`.
   - Jaga tombol sementara **Quick Switch Role** di topbar & **Logout**.
   - Alur kerja terhubung: Ketua Tim buat ide + *raw footage* Drive + *assign* → Copywriter edit *script/caption* & tandai *"Siap Edit"* → muncul di antrean Editor → Editor tempel *output URL* & kirim *"Menunggu Review"* → *approval* Ketua Tim.
5. **QA & Verifikasi:**
   - Uji alur Invite-Only (tolak email tak terdaftar, tolak login sebelum aktivasi, tambah undangan oleh Ketua Tim, aktivasi akun baru, login otomatis sesuai role, ubah role, hapus anggota).
   - Verifikasi `npm run build`, responsivitas, aksesibilitas, dan konsistensi Merah · Gold · Putih.
   - **Gate:** wajib berhenti setelah implementasi & pengujian, laporkan hasil & file yang berubah, dan tunggu persetujuan eksplisit pengguna sebelum fase berikutnya.

## Batasan teknis yang disetujui untuk prototipe
- Vite + vanilla JavaScript/CSS agar ringan dan hemat token.
- Tidak menambahkan framework, library chart, database nyata, atau integrasi backend/API pihak ketiga tanpa approval.
- Simulasi login, undangan, aktivasi akun, manajemen tim, dan penyimpanan sesi RBAC sementara menggunakan data dummy serta `state`/`localStorage` front-end (bukan autentikasi keamanan produksi).
- Build target static Vite; tidak deploy tanpa instruksi eksplisit.

## Definisi selesai per fase
1. Hasil cocok dengan SOT yang disetujui.
2. Tidak ada fitur tambahan yang tidak diminta.
3. Build/test yang relevan dijalankan dan hasilnya dilaporkan apa adanya.
4. Ringkasan perubahan dan pertanyaan keputusan diberikan kepada pengguna.
5. Berhenti dan menunggu persetujuan eksplisit.
