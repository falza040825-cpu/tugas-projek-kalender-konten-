# UI Guideline — StudioFlow

**Status:** Diselaraskan ke tema **Merah · Gold · Putih** sesuai persetujuan pengguna. Jangan memperluas scope fitur/backend tanpa approval.

## 1. Arah visual
SaaS operasional konten modern dengan dominasi **Merah Marun/Crimson & Gold** di atas permukaan **Putih / Warm Off-White** yang bersih, kontras tinggi, dan profesional. Sidebar gelap merah marun memberi jangkar navigasi, sedangkan area kerja putih gading menjaga tabel, kalender, dan kartu tetap ringan serta mudah dipindai tanpa neon atau kepadatan berlebihan.

## 2. Design tokens
- Canvas: `#FAF6F4`; surface: `#FFFFFF`; elevated: `#FFFBF8`; subtle: `#FDF4F2`.
- Ink: `#2A1215`; secondary: `#6B4A4D`; muted: `#826063`; border: `#EAD8D5`.
- Primary Red: `#B91C1C` (crimson), dark `#88131D`, mid `#DC2626`, bg `#FEF2F2`, ink `#991B1B`.
- Gold: `#C99312`, dark `#926806`, mid `#F5B82E`, light `#FEF3C7`, bg `#FFFBEB`, ink `#784F05`.
- Aksen semantik: Gold hangat (`#FDE68A` / `#784F05`), Merah lembut (`#FECACA` / `#991B1B`), Champagne gold (`#FCD34D` / `#6E4704`), Merah urgensi (`#FCA5A5` / `#7F1D1D`), Emas-perunggu (`#E7D3B8` / `#6E4E2E`).
- Radius: kartu `20px`; panel `18px`; kontrol `11px`; badge `8px`; pill `999px`.
- Spacing: basis `4px`; area utama `28–32px`; antar kartu `16–20px`.
- Typography: `'Inter'` / system sans-serif, hirarki jelas; heading ringkas, body `14px`.

## 3. Kerangka aplikasi
- Sidebar kiri (`#4A0D12` → `#7F1D1D`): brand mark gold, pemilih workspace simulasi, menu utama & badge gold, kartu SOT, profil dan role simulasi.
- Topbar: breadcrumb/judul halaman, pencarian cepat (`Cmd/Ctrl + K`), tombol notifikasi + badge dot gold, badge role simulasi gold, tombol toggle drawer mobile.
- Konten: grid responsif dengan kartu statistik, grafik batang Merah/Gold, jadwal terdekat, aktivitas, tabel/kanvan.
- Navigasi aktif menggunakan latar merah transparan dengan garis batas kiri gold (`--color-gold-mid`).

## 4. Komponen
- **Stat card:** label, angka besar, delta/catatan pendek, ikon sederhana.
- **Status pill:** label status + latar pastel; warna selalu disertai teks.
- **Task row:** judul, platform/proyek, assignee, deadline, prioritas.
- **Content card:** judul, kategori, kanal, tanggal produksi/publikasi, status.
- **Filter:** kontrol ringkas, clear state, nilai aktif terlihat.
- **Document preview:** daftar tiga dokumen SOT, panel preview dengan judul, versi, status approval.
- **Dialog/form:** label eksplisit, validasi inline, tombol batal dan simpan.

## 5. Interaksi prototipe
- Sidebar mengganti halaman tanpa reload.
- Toggle kalender hari/minggu/bulan mengubah mode tampilan.
- Filter mencari/menyaring dummy content.
- Tombol tambah membuka modal demo; simpan menambah item lokal sementara.
- Kontrol status pipeline mengubah status pada sesi UI.
- Tombol ekspor/notifikasi menampilkan feedback demo dan tidak mengklaim operasi backend.
- Dokumen SOT dapat dipilih untuk melihat ringkasan isi; dokumen lengkap tersedia di folder `docs/`.

## 6. Responsif dan aksesibilitas
- Desktop: sidebar tetap dan dashboard multi-kolom.
- Tablet: sidebar ringkas; kartu 2 kolom.
- Mobile: sidebar menjadi drawer/menu, tabel menjadi list, kontrol kalender dapat digulir.
- Fokus keyboard terlihat, elemen interaktif punya nama yang bermakna, target sentuh nyaman, dan status memakai teks.

## 7. Do / Don't
**Do:** ruang kosong, batas halus, hierarki kuat, status yang konsisten, dummy badge yang jelas.

**Don't:** efek blur berat, animasi mengganggu, chart dekoratif tanpa makna, data palsu yang disebut real-time, atau komponen baru di luar PRD.
