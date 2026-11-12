# PRD — Yayasan Motivator Qur'an Content Operations

**Status:** Pembaruan Invite-Only, Manajemen Tim & RBAC · **Versi:** 0.3 · **Sumber kebenaran:** dokumen ini bersama `UI_GUIDELINE.md` dan `IMPLEMENTATION_PLAN.md`.

## 1. Ringkasan produk
Yayasan Motivator Qur'an Content Operations adalah aplikasi web internal untuk mengelola perencanaan, kalender, alur produksi, tugas, aset, notifikasi, serta evaluasi konten digital dalam satu ruang kerja dinamis berbasis peran (*Role-Based Access Control* / RBAC) dengan mekanisme **Invite-Only / Pre-Registered Email**. Rilis tahap ini berupa front-end Vite dengan data dummy dan simulasi sesi/autentikasi lokal (`state`/`localStorage`); belum mencakup backend, database, integrasi platform, atau pengiriman email/notifikasi sungguhan.

## 2. Tujuan
- Memberi visibilitas cepat terhadap volume konten, status produksi, publikasi, keterlambatan, dan tugas mendesak.
- Menyatukan kalender produksi dan publikasi dengan pipeline yang konsisten.
- Memperjelas pemilik tugas, tenggat, review, revisi, persetujuan, serta tata kelola akses anggota berbasis undangan (*invite-only*).
- Menyediakan gambaran evaluasi per periode, platform, dan anggota tim.

## 3. Pengguna dan peran (RBAC — 3 Peran Inti)
Tidak ada pemisahan antara Admin dan Ketua Tim: **Ketua Tim** adalah **Super Admin** tunggal. Peran pengguna **tidak dipilih manual saat Sign In maupun Aktivasi Akun**, melainkan ditentukan oleh Ketua Tim saat mendaftarkan email anggota:

1. **Ketua Tim (Super Admin):**
   - Kendali penuh atas seluruh sistem, kalender konten, dan ringkasan dashboard.
   - Akses eksklusif ke menu **Manajemen Tim** untuk mendaftarkan email anggota baru (`Copywriter` atau `Editor`, status awal *Menunggu Aktivasi*), mengubah role, serta menghapus anggota.
   - Pembuatan kartu ide konten baru, penentuan tautan bahan mentah (*raw footage*), dan penugasan (*assign*) kepada anggota tim.
   - Peninjauan hasil (*review*) dan *approval* akhir konten.
   - Akses penuh ke halaman **Laporan** (*reporting*).
2. **Copywriter:**
   - Fokus pada produksi teks/naskah.
   - Hanya melihat daftar tugas konten yang membutuhkan penyusunan naskah/caption.
   - Dapat mengisi dan mengedit kolom **Script** & **Caption**, serta mengubah status tugas menjadi **"Siap Edit"**.
   - Menu **Manajemen Tim** dan **Laporan** disembunyikan serta dibatasi aksesnya di UI.
3. **Editor:**
   - Fokus pada produksi visual/video.
   - Hanya melihat daftar tugas konten berstatus **"Siap Edit"** lengkap dengan tautan *raw footage* (Google Drive) serta naskah/caption dari Copywriter.
   - Dapat menempelkan tautan hasil editan (*output* URL) dan mengubah status menjadi **"Menunggu Review"**.
   - Menu **Manajemen Tim** dan **Laporan** disembunyikan serta dibatasi aksesnya di UI.

Pada tahap prototipe front-end, autentikasi, aktivasi akun, dan pergantian peran tetap merupakan simulasi UI (`state`/`localStorage`), bukan kontrol keamanan server nyata.

## 4. Ruang lingkup fitur
1. **Halaman Autentikasi Invite-Only (`Sign In` & `Aktivasi Akun`):**
   - Tersedia dua tab: **Sign In (Masuk)** dan **Aktivasi Akun (Pengguna Baru)**.
   - **Sign In (Masuk):** meminta **Email** (`autocomplete` standar browser) dan **Kata Sandi** tanpa dropdown role. Hanya akun berstatus **Aktif** yang dapat masuk; peran terdeteksi otomatis sesuai ketetapan Ketua Tim.
   - **Aktivasi Akun (Pengguna Baru):** hanya meminta **Email**, **Nama Lengkap**, dan **Buat Kata Sandi Baru** (tanpa dropdown role). Sistem memvalidasi apakah email sudah didaftarkan Ketua Tim dengan status **Menunggu Aktivasi**:
     - Jika cocok: simpan Nama Lengkap & Kata Sandi, ubah status ke **Aktif**, tampilkan notifikasi sukses, dan arahkan otomatis ke tab **Sign In**.
     - Jika belum didaftarkan Ketua Tim: tampilkan pesan error *"Email belum terdaftar. Hubungi Ketua Tim untuk mendapatkan akses."*
   - Tiga akun bawaan aktif (`ketua@tim.com`, `copywriter@tim.com`, `editor@tim.com`) dipertahankan di `localStorage` untuk pengujian cepat, ditambah tombol **Logout** dan **Quick Switch Role** sementara di topbar.
2. **Arsitektur Satu Dashboard Dinamis (RBAC Conditional UI):**
   - Satu kerangka *shell* aplikasi Vite yang merender menu sidebar, kartu/daftar tugas, kolom form (`script`, `caption`, tautan *raw footage* Google Drive, tautan *output* editan), dan tombol aksi secara kondisional berdasarkan `currentUser.role`.
3. **Dashboard:** Ringkasan indikator konten dan tugas prioritas yang menyesuaikan hak akses peran aktif.
4. **Kalender digital:** Tampilan bulanan/mingguan/harian; jadwal produksi dan publikasi; kategori edukasi, promosi, informasi, hiburan; filter platform, kategori, status; penanda jadwal berdekatan/terlambat. Pembuatan ide baru dikelola Ketua Tim.
5. **Pipeline produksi:** Alur ide/perencanaan → perlu naskah (Copywriter) → **"Siap Edit"** → editing visual/video (Editor) → **"Menunggu Review"** → *approval* hasil akhir & penjadwalan publikasi (Ketua Tim).
6. **Tugas:** Daftar tugas kontekstual per peran (`Copywriter` melihat tugas naskah/caption & tombol *Siap Edit*; `Editor` melihat tugas *Siap Edit*, raw footage Google Drive, naskah Copywriter, input tautan *output*, & tombol *Menunggu Review*; `Ketua Tim` mengelola penugasan & *approval*).
7. **Manajemen Tim (khusus Ketua Tim):**
   - Menu hanya tampil saat login sebagai **Ketua Tim**.
   - Form tambah anggota baru (**Email Anggota** dan **Pilihan Tugas/Role**: `Copywriter` atau `Editor`) yang menyimpan entri berstatus **Menunggu Aktivasi**.
   - Tabel daftar anggota beserta status (`Menunggu Aktivasi` / `Aktif`), aksi **Ubah Role**, **Hapus Anggota**, serta matriks hak akses 3 peran inti.
8. **Aset:** Daftar berkas dummy, tautan *raw footage* Google Drive, dan tautan hasil editan (*output*). Unggahan file langsung ke server/cloud tetap di luar lingkup.
9. **Notifikasi:** Daftar pengingat tenggat, tugas baru, status *Siap Edit*, *Menunggu Review*, aktivasi anggota, dan keputusan *approval*. Email/push nyata menunggu backend.
10. **Laporan (khusus Ketua Tim):** Jumlah per status/periode/platform, ketepatan waktu, produktivitas anggota; menu disembunyikan bagi Copywriter dan Editor. Tombol ekspor tetap simulasi UI.

## 5. Alur utama
1. **Ketua Tim** masuk melalui **Sign In** (atau mendaftarkan anggota baru pada menu **Manajemen Tim** dengan memilih Email dan Role `Copywriter` atau `Editor` sehingga berstatus *Menunggu Aktivasi*).
2. **Anggota Baru** membuka tab **Aktivasi Akun**, mengisi Email praregistrasi, Nama Lengkap, dan Kata Sandi Baru; status berubah menjadi *Aktif* dan pengguna diarahkan ke **Sign In**.
3. **Ketua Tim** membuat kartu ide konten baru, melampirkan tautan *raw footage* (Google Drive) bila ada, dan menugaskan (*assign*) pekerjaan ke **Copywriter** / **Editor** yang aktif.
4. **Copywriter** melihat tugas yang memerlukan naskah, mengisi/mengedit kolom *script* & *caption*, lalu mengubah status menjadi **"Siap Edit"**.
5. **Editor** melihat item berstatus **"Siap Edit"** beserta tautan *raw footage* (Google Drive) dan naskah dari Copywriter, menempelkan tautan hasil editan (*output*), lalu mengubah status menjadi **"Menunggu Review"**.
6. **Ketua Tim** memeriksa konten berstatus **"Menunggu Review"** dan memberikan *approval* hasil akhir (atau meminta revisi) hingga siap/dipublikasikan, serta memantau metrik di halaman **Laporan**.

## 6. Kebutuhan kualitas
- Layout responsif desktop/tablet/mobile.
- Navigasi konsisten, fokus keyboard terlihat, label form jelas, `autocomplete` sesuai standar, kontras teks terbaca.
- Status (`Menunggu Aktivasi`, `Aktif`, `Siap Edit`, `Menunggu Review`, dll.) selalu menyertakan label teks/ikon, bukan warna saja.
- Dummy data dan simulasi `localStorage` diberi label jelas dan tidak menyiratkan autentikasi server nyata.
- Tidak ada kredensial produksi, API key, atau data pribadi nyata di repo.

## 7. Kriteria penerimaan konsep
- Seluruh fitur sesuai lingkup memiliki halaman/keadaan UI yang merespons peran `currentUser.role` pada satu dashboard dinamis.
- Ketua Tim berfungsi sebagai Super Admin tunggal; menu **Manajemen Tim** dapat menambah email praregistrasi (`Copywriter`/`Editor` → `Menunggu Aktivasi`), mengubah role, dan menghapus anggota.
- Halaman autentikasi memiliki tab **Sign In** dan **Aktivasi Akun** tanpa dropdown role; akun belum diundang ditolak dengan pesan *"Email belum terdaftar. Hubungi Ketua Tim untuk mendapatkan akses."*
- Hanya akun berstatus **Aktif** yang bisa Sign In (termasuk 3 akun bawaan `ketua@tim.com`, `copywriter@tim.com`, `editor@tim.com`), dan akun baru langsung memiliki role sesuai ketetapan Ketua Tim setelah aktivasi.
- Copywriter dan Editor tidak melihat menu **Manajemen Tim** maupun **Laporan** dan dilindungi guard rute.
- Tidak ada phase implementasi berikutnya dimulai tanpa persetujuan eksplisit pengguna.

## 8. Batasan dan asumsi
- Nama organisasi/workspace: Yayasan Motivator Qur'an.
- Bahasa UI: Indonesia.
- Zona waktu tampilan mengikuti data contoh; jadwal aktual perlu zona waktu organisasi.
- Simulasi login, undangan/aktivasi akun, manajemen tim, dan sesi RBAC front-end menggunakan data dummy serta `state`/`localStorage`.
- Belum mencakup backend, database nyata, hashing/JWT server-side, pengiriman email undangan, upload berkas langsung, analytics platform, atau ekspor server-side.
- Semua data di prototype adalah data dummy.

## 9. Pertanyaan untuk fase setelah persetujuan
- Platform target apa saja (Instagram, TikTok, YouTube, web, lainnya)?
- Apakah perlu multi-organisasi/proyek atau satu workspace?
- Apakah backend, database, dan sistem pengiriman email undangan nyata akan ditentukan pada fase arsitektur berikutnya?
