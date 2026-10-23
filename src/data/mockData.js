/**
 * Dummy Data Terpusat - StudioFlow Content Operations
 * Sesuai SOT (PRD.md, UI_GUIDELINE.md, IMPLEMENTATION_PLAN.md)
 * Hanya untuk kebutuhan simulasi UI front-end (tanpa backend / API)
 */

export const currentUser = {
  name: 'Farah Aulia',
  role: 'Administrator',
  avatar: 'FA',
  workspace: 'Tim Kreatif SGQ'
};

export const statsOverview = {
  planned: { value: 48, delta: '+12.8%', label: 'Konten direncanakan', kind: 'lavender', icon: '▤' },
  inProduction: { value: 16, delta: '+4.2%', label: 'Dalam produksi', kind: 'sage', icon: '◷' },
  completed: { value: 24, delta: '+8.6%', label: 'Selesai & tayang', kind: 'sand', icon: '✓' },
  overdue: { value: 8, delta: '-2.1%', label: 'Terlambat', kind: 'rose', icon: '⚑' }
};

export const upcomingSchedules = [
  { id: 'sch-1', title: 'Tips belajar efektif', platform: 'Instagram', category: 'Edukasi', date: '10 OKT', time: '10.00', color: 'sage' },
  { id: 'sch-2', title: 'Program unggulan SGQ', platform: 'TikTok', category: 'Informasi', date: '10 OKT', time: '13.30', color: 'lavender' },
  { id: 'sch-3', title: 'Weekend class teaser', platform: 'Instagram', category: 'Promosi', date: '11 OKT', time: '16.00', color: 'sand' },
  { id: 'sch-4', title: 'Di balik layar tim', platform: 'YouTube', category: 'Hiburan', date: '12 OKT', time: '19.00', color: 'sage' }
];

export const priorityTasks = [
  { id: 'tsk-1', title: 'Finalisasi carousel edukasi', assignee: 'Nadia Putri', initials: 'NP', deadline: 'Hari ini', status: 'Dalam proses', statusClass: 'st-progress' },
  { id: 'tsk-2', title: 'Revisi video program baru', assignee: 'Raka Pratama', initials: 'RP', deadline: 'Hari ini', status: 'Revisi', statusClass: 'st-revision' },
  { id: 'tsk-3', title: 'Caption promo weekend', assignee: 'Dimas Akbar', initials: 'DA', deadline: 'Kemarin', status: 'Terlambat', statusClass: 'st-late', isOverdue: true },
  { id: 'tsk-4', title: 'Review konten mingguan', assignee: 'Farah Aulia', initials: 'FA', deadline: '11 Okt', status: 'Menunggu', statusClass: 'st-wait' }
];

export const recentActivities = [
  { id: 'act-1', user: 'Nadia Putri', initials: 'NP', action: 'mengunggah desain baru', target: 'Carousel edukasi', time: '12 menit lalu', avatarClass: 'av-sage' },
  { id: 'act-2', user: 'Raka Pratama', initials: 'RP', action: 'mengirim revisi', target: 'Video program baru', time: '38 menit lalu', avatarClass: 'av-lav' },
  { id: 'act-3', user: 'Farah Aulia', initials: 'FA', action: 'menyetujui caption', target: 'Konten informasi', time: '1 jam lalu', avatarClass: 'av-sand' }
];

export const sotDocs = {
  PRD: {
    id: 'PRD',
    filename: 'PRD.md',
    title: 'Product Requirements Document',
    version: 'v0.1',
    status: 'Draft SOT',
    subtitle: 'Tujuan produk, pengguna, 8 area fitur, alur kerja, dan kriteria penerimaan.',
    bullets: [
      '8 area fitur: Dashboard, Kalender, Pipeline, Tugas, Pengguna, Aset, Notifikasi, Laporan.',
      '5 peran pengguna: Admin, Koordinator, Tim Kreatif, Reviewer, Publikasi.',
      'Alur produksi: Ide → Naskah → Desain/Video → Editing → Review → Approval → Tayang.',
      'Rilis awal murni front-end Vite dengan data dummy terpusat.'
    ]
  },
  UI: {
    id: 'UI',
    filename: 'UI_GUIDELINE.md',
    title: 'UI Guideline — Design System',
    version: 'v0.1',
    status: 'Draft SOT',
    subtitle: 'Arah visual, design tokens, komponen UI, interaksi, dan aksesibilitas.',
    bullets: [
      'Palet pastel silver, abu-abu lembut, taupe, sage, dan lavender.',
      'Canvas #F4F2EE, Surface #FFFFFF, Elevated #FAF9F7, Ink #252723.',
      'Radius 18-22px (kartu), 10-12px (kontrol), 999px (pill).',
      'Status selalu memakai teks dan indikator warna, kontras dan aksesibel.'
    ]
  },
  PLAN: {
    id: 'PLAN',
    filename: 'IMPLEMENTATION_PLAN.md',
    title: 'Implementation Plan',
    version: 'v0.1',
    status: 'Draft SOT',
    subtitle: 'Rencana eksekusi bertahap (Fase 0 hingga 4) dengan approval gate wajib.',
    bullets: [
      'Fase 0 — Persetujuan SOT',
      'Fase 1 — Fondasi front-end (Shell, Layout, Navigasi, Tokens, Dashboard, Dummy Store)',
      'Fase 2 — Halaman operasional (Kalender, Pipeline, Tugas)',
      'Fase 3 — Workspace pendukung (Pengguna, Aset, Notifikasi, Laporan)',
      'Fase 4 — QA visual dan handoff'
    ]
  }
};

export const navigationItems = [
  { id: 'Overview', label: 'Overview', icon: '◫', category: 'main', phase: 1 },
  { id: 'Kalender konten', label: 'Kalender konten', icon: '▦', category: 'main', phase: 2 },
  { id: 'Alur produksi', label: 'Alur produksi', icon: '⇄', category: 'main', phase: 2 },
  { id: 'Manajemen tugas', label: 'Manajemen tugas', icon: '☷', category: 'main', phase: 2 },
  { id: 'Aset & file', label: 'Aset & file', icon: '▧', category: 'main', phase: 3 },
  { id: 'Notifikasi', label: 'Notifikasi', icon: '♧', category: 'main', badge: '3', phase: 3 },
  { id: 'Laporan', label: 'Laporan', icon: '▥', category: 'main', phase: 3 },
  { id: 'Pengguna & akses', label: 'Pengguna & akses', icon: '♙', category: 'main', phase: 3 },
  { id: 'Dokumen SOT', label: 'Dokumen SOT', icon: '✳', category: 'sot', phase: 1 }
];

// ─────────────────────────────────────────
// FASE 2 — Halaman Operasional
// ─────────────────────────────────────────

export const calendarItems = [
  { id: 'cal-01', title: 'Tips belajar efektif', platform: 'Instagram', category: 'Edukasi', status: 'Siap tayang', statusClass: 'st-ready', prodDate: '2026-10-08', pubDate: '2026-10-10', owner: 'Nadia Putri', initials: 'NP' },
  { id: 'cal-02', title: 'Program unggulan SGQ', platform: 'TikTok', category: 'Informasi', status: 'Dalam proses', statusClass: 'st-progress', prodDate: '2026-10-09', pubDate: '2026-10-10', owner: 'Raka Pratama', initials: 'RP' },
  { id: 'cal-03', title: 'Weekend class teaser', platform: 'Instagram', category: 'Promosi', status: 'Review', statusClass: 'st-review', prodDate: '2026-10-09', pubDate: '2026-10-11', owner: 'Dimas Akbar', initials: 'DA' },
  { id: 'cal-04', title: 'Di balik layar tim', platform: 'YouTube', category: 'Hiburan', status: 'Dipublikasikan', statusClass: 'st-published', prodDate: '2026-10-06', pubDate: '2026-10-12', owner: 'Farah Aulia', initials: 'FA' },
  { id: 'cal-05', title: 'Cara mengatasi burnout', platform: 'Instagram', category: 'Edukasi', status: 'Terlambat', statusClass: 'st-late', prodDate: '2026-10-07', pubDate: '2026-10-13', owner: 'Nadia Putri', initials: 'NP' },
  { id: 'cal-06', title: 'Testimoni alumni batch 12', platform: 'YouTube', category: 'Informasi', status: 'Naskah', statusClass: 'st-script', prodDate: '2026-10-12', pubDate: '2026-10-15', owner: 'Raka Pratama', initials: 'RP' },
  { id: 'cal-07', title: 'Flash sale program baru', platform: 'TikTok', category: 'Promosi', status: 'Ide', statusClass: 'st-idea', prodDate: '2026-10-14', pubDate: '2026-10-17', owner: 'Dimas Akbar', initials: 'DA' },
  { id: 'cal-08', title: 'Story challenge bersama', platform: 'Instagram', category: 'Hiburan', status: 'Siap tayang', statusClass: 'st-ready', prodDate: '2026-10-13', pubDate: '2026-10-18', owner: 'Farah Aulia', initials: 'FA' },
  { id: 'cal-09', title: 'Kuis interaktif edukasi', platform: 'Instagram', category: 'Edukasi', status: 'Dalam proses', statusClass: 'st-progress', prodDate: '2026-10-14', pubDate: '2026-10-19', owner: 'Nadia Putri', initials: 'NP' },
  { id: 'cal-10', title: 'Behind the scene produksi', platform: 'YouTube', category: 'Hiburan', status: 'Review', statusClass: 'st-review', prodDate: '2026-10-15', pubDate: '2026-10-21', owner: 'Raka Pratama', initials: 'RP' },
  { id: 'cal-11', title: 'Promo akhir bulan', platform: 'TikTok', category: 'Promosi', status: 'Dipublikasikan', statusClass: 'st-published', prodDate: '2026-10-05', pubDate: '2026-10-08', owner: 'Dimas Akbar', initials: 'DA' },
  { id: 'cal-12', title: 'Update kurikulum 2027', platform: 'Instagram', category: 'Informasi', status: 'Naskah', statusClass: 'st-script', prodDate: '2026-10-16', pubDate: '2026-10-22', owner: 'Farah Aulia', initials: 'FA' },
];

export const pipelineStages = [
  { id: 'ide', label: 'Ide / Perencanaan', icon: '💡' },
  { id: 'naskah', label: 'Naskah / Caption', icon: '✍️' },
  { id: 'desain', label: 'Desain / Video', icon: '🎨' },
  { id: 'editing', label: 'Editing', icon: '✂️' },
  { id: 'review', label: 'Review / Revisi', icon: '👁' },
  { id: 'approval', label: 'Persetujuan', icon: '✅' },
  { id: 'siap', label: 'Siap Tayang', icon: '🚀' },
  { id: 'published', label: 'Dipublikasikan', icon: '📡' },
];

export let pipelineItems = [
  { id: 'pip-01', title: 'Flash sale program baru', platform: 'TikTok', category: 'Promosi', stage: 'ide', owner: 'Dimas Akbar', initials: 'DA', pubDate: '17 Okt' },
  { id: 'pip-02', title: 'Update kurikulum 2027', platform: 'Instagram', category: 'Informasi', stage: 'naskah', owner: 'Farah Aulia', initials: 'FA', pubDate: '22 Okt' },
  { id: 'pip-03', title: 'Testimoni alumni batch 12', platform: 'YouTube', category: 'Informasi', stage: 'naskah', owner: 'Raka Pratama', initials: 'RP', pubDate: '15 Okt' },
  { id: 'pip-04', title: 'Kuis interaktif edukasi', platform: 'Instagram', category: 'Edukasi', stage: 'desain', owner: 'Nadia Putri', initials: 'NP', pubDate: '19 Okt' },
  { id: 'pip-05', title: 'Weekend class teaser', platform: 'Instagram', category: 'Promosi', stage: 'editing', owner: 'Dimas Akbar', initials: 'DA', pubDate: '11 Okt' },
  { id: 'pip-06', title: 'Behind the scene produksi', platform: 'YouTube', category: 'Hiburan', stage: 'review', owner: 'Raka Pratama', initials: 'RP', pubDate: '21 Okt' },
  { id: 'pip-07', title: 'Program unggulan SGQ', platform: 'TikTok', category: 'Informasi', stage: 'review', owner: 'Raka Pratama', initials: 'RP', pubDate: '10 Okt' },
  { id: 'pip-08', title: 'Cara mengatasi burnout', platform: 'Instagram', category: 'Edukasi', stage: 'approval', owner: 'Nadia Putri', initials: 'NP', pubDate: '13 Okt' },
  { id: 'pip-09', title: 'Tips belajar efektif', platform: 'Instagram', category: 'Edukasi', stage: 'siap', owner: 'Nadia Putri', initials: 'NP', pubDate: '10 Okt' },
  { id: 'pip-10', title: 'Story challenge bersama', platform: 'Instagram', category: 'Hiburan', stage: 'siap', owner: 'Farah Aulia', initials: 'FA', pubDate: '18 Okt' },
  { id: 'pip-11', title: 'Promo akhir bulan', platform: 'TikTok', category: 'Promosi', stage: 'published', owner: 'Dimas Akbar', initials: 'DA', pubDate: '8 Okt' },
  { id: 'pip-12', title: 'Di balik layar tim', platform: 'YouTube', category: 'Hiburan', stage: 'published', owner: 'Farah Aulia', initials: 'FA', pubDate: '12 Okt' },
];

export let taskItems = [
  { id: 'task-01', title: 'Finalisasi carousel edukasi', project: 'Kuis interaktif edukasi', platform: 'Instagram', assignee: 'Nadia Putri', initials: 'NP', deadline: '2026-10-10', priority: 'Tinggi', status: 'Dalam proses', statusClass: 'st-progress', notes: 'Selesaikan sebelum review hari ini.' },
  { id: 'task-02', title: 'Revisi video program baru', project: 'Program unggulan SGQ', platform: 'TikTok', assignee: 'Raka Pratama', initials: 'RP', deadline: '2026-10-10', priority: 'Tinggi', status: 'Revisi', statusClass: 'st-revision', notes: 'Perbaiki segmen opening 0-5 detik.' },
  { id: 'task-03', title: 'Caption promo weekend', project: 'Weekend class teaser', platform: 'Instagram', assignee: 'Dimas Akbar', initials: 'DA', deadline: '2026-10-09', priority: 'Tinggi', status: 'Terlambat', statusClass: 'st-late', notes: 'Sudah terlambat 1 hari.', isOverdue: true },
  { id: 'task-04', title: 'Review konten mingguan', project: 'Di balik layar tim', platform: 'YouTube', assignee: 'Farah Aulia', initials: 'FA', deadline: '2026-10-11', priority: 'Normal', status: 'Menunggu', statusClass: 'st-wait', notes: '' },
  { id: 'task-05', title: 'Unggah aset desain banner', project: 'Flash sale program baru', platform: 'TikTok', assignee: 'Dimas Akbar', initials: 'DA', deadline: '2026-10-14', priority: 'Normal', status: 'Belum mulai', statusClass: 'st-idea', notes: 'Gunakan template terbaru.' },
  { id: 'task-06', title: 'Naskah testimoni alumni', project: 'Testimoni alumni batch 12', platform: 'YouTube', assignee: 'Raka Pratama', initials: 'RP', deadline: '2026-10-13', priority: 'Normal', status: 'Dalam proses', statusClass: 'st-progress', notes: '' },
  { id: 'task-07', title: 'Approval konten akhir bulan', project: 'Promo akhir bulan', platform: 'TikTok', assignee: 'Farah Aulia', initials: 'FA', deadline: '2026-10-07', priority: 'Tinggi', status: 'Selesai', statusClass: 'st-done', notes: '' },
  { id: 'task-08', title: 'Desain thumbnail YouTube', project: 'Behind the scene produksi', platform: 'YouTube', assignee: 'Nadia Putri', initials: 'NP', deadline: '2026-10-16', priority: 'Normal', status: 'Dalam proses', statusClass: 'st-progress', notes: 'Referensi di folder Aset/Thumbnails.' },
];

export const teamMembers = [
  { name: 'Farah Aulia', initials: 'FA' },
  { name: 'Nadia Putri', initials: 'NP' },
  { name: 'Raka Pratama', initials: 'RP' },
  { name: 'Dimas Akbar', initials: 'DA' },
];

// ─────────────────────────────────────────
// FASE 3 — Workspace Pendukung
// ─────────────────────────────────────────

/** Pengguna & Akses */
export const usersData = [
  { id: 'u-01', name: 'Farah Aulia', initials: 'FA', email: 'farah@sgq.demo', role: 'Admin', status: 'Aktif', joined: 'Jan 2025', avatarClass: 'av-sand' },
  { id: 'u-02', name: 'Nadia Putri', initials: 'NP', email: 'nadia@sgq.demo', role: 'Tim Kreatif', status: 'Aktif', joined: 'Mar 2025', avatarClass: 'av-sage' },
  { id: 'u-03', name: 'Raka Pratama', initials: 'RP', email: 'raka@sgq.demo', role: 'Koordinator', status: 'Aktif', joined: 'Feb 2025', avatarClass: 'av-lav' },
  { id: 'u-04', name: 'Dimas Akbar', initials: 'DA', email: 'dimas@sgq.demo', role: 'Tim Kreatif', status: 'Aktif', joined: 'Apr 2025', avatarClass: 'av-taupe' },
  { id: 'u-05', name: 'Siti Rahayu', initials: 'SR', email: 'siti@sgq.demo', role: 'Reviewer', status: 'Aktif', joined: 'Jun 2025', avatarClass: 'av-sage' },
  { id: 'u-06', name: 'Bagas Wicaksono', initials: 'BW', email: 'bagas@sgq.demo', role: 'Publikasi', status: 'Tidak aktif', joined: 'Aug 2025', avatarClass: 'av-lav' },
];

export const rolesMatrix = [
  { role: 'Admin',        dashboard: true,  kalender: true,  pipeline: true,  tugas: true,  aset: true,  notifikasi: true,  laporan: true,  pengguna: true  },
  { role: 'Koordinator',  dashboard: true,  kalender: true,  pipeline: true,  tugas: true,  aset: true,  notifikasi: true,  laporan: true,  pengguna: false },
  { role: 'Tim Kreatif',  dashboard: true,  kalender: true,  pipeline: true,  tugas: true,  aset: true,  notifikasi: true,  laporan: false, pengguna: false },
  { role: 'Reviewer',     dashboard: true,  kalender: true,  pipeline: false, tugas: false, aset: true,  notifikasi: true,  laporan: false, pengguna: false },
  { role: 'Publikasi',    dashboard: true,  kalender: true,  pipeline: false, tugas: false, aset: false, notifikasi: true,  laporan: false, pengguna: false },
];

/** Aset & File */
export const assetsData = [
  { id: 'ast-01', name: 'Carousel Edukasi v3.psd', type: 'Desain', size: '4.2 MB', project: 'Kuis interaktif edukasi', uploader: 'Nadia Putri', initials: 'NP', date: '14 Okt 2026', url: '#', tag: 'Desain' },
  { id: 'ast-02', name: 'Video Program Baru_raw.mp4', type: 'Video', size: '312 MB', project: 'Program unggulan SGQ', uploader: 'Raka Pratama', initials: 'RP', date: '13 Okt 2026', url: '#', tag: 'Video' },
  { id: 'ast-03', name: 'Caption Weekend Class.docx', type: 'Dokumen', size: '38 KB', project: 'Weekend class teaser', uploader: 'Dimas Akbar', initials: 'DA', date: '10 Okt 2026', url: '#', tag: 'Dokumen' },
  { id: 'ast-04', name: 'Thumbnail_BTS.png', type: 'Gambar', size: '980 KB', project: 'Behind the scene produksi', uploader: 'Nadia Putri', initials: 'NP', date: '15 Okt 2026', url: '#', tag: 'Gambar' },
  { id: 'ast-05', name: 'Naskah Testimoni Alumni.docx', type: 'Dokumen', size: '52 KB', project: 'Testimoni alumni batch 12', uploader: 'Raka Pratama', initials: 'RP', date: '12 Okt 2026', url: '#', tag: 'Dokumen' },
  { id: 'ast-06', name: 'Logo_SGQ_2026.ai', type: 'Desain', size: '1.8 MB', project: '—', uploader: 'Farah Aulia', initials: 'FA', date: '1 Sep 2026', url: '#', tag: 'Desain' },
  { id: 'ast-07', name: 'Flash Sale Banner.png', type: 'Gambar', size: '2.1 MB', project: 'Flash sale program baru', uploader: 'Dimas Akbar', initials: 'DA', date: '16 Okt 2026', url: '#', tag: 'Gambar' },
  { id: 'ast-08', name: 'BGM Promo Oktober.mp3', type: 'Audio', size: '8.4 MB', project: 'Promo akhir bulan', uploader: 'Raka Pratama', initials: 'RP', date: '5 Okt 2026', url: '#', tag: 'Audio' },
];

/** Notifikasi */
export let notificationsData = [
  { id: 'ntf-01', type: 'deadline', icon: '⏰', title: 'Deadline hari ini', body: 'Finalisasi carousel edukasi jatuh tempo pukul 17.00 WIB.', time: '08.00', read: false, route: 'Manajemen tugas' },
  { id: 'ntf-02', type: 'revision', icon: '🔄', title: 'Revisi diminta', body: 'Siti Rahayu meminta revisi pada “Video Program Baru” — perbaiki opening.', time: '09.15', read: false, route: 'Alur produksi' },
  { id: 'ntf-03', type: 'task', icon: '📋', title: 'Tugas baru ditetapkan', body: 'Kamu ditugaskan untuk mengerjakan Caption promo weekend.', time: '09.30', read: false, route: 'Manajemen tugas' },
  { id: 'ntf-04', type: 'publish', icon: '📡', title: 'Konten segera tayang', body: '“Tips belajar efektif” dijadwalkan tayang 10 Okt di Instagram.', time: '10.00', read: true, route: 'Kalender konten' },
  { id: 'ntf-05', type: 'approval', icon: '✅', title: 'Konten disetujui', body: '“Promo akhir bulan” telah disetujui oleh Farah Aulia.', time: '11.30', read: true, route: 'Alur produksi' },
  { id: 'ntf-06', type: 'deadline', icon: '⏰', title: 'Terlambat: Caption promo weekend', body: 'Konten ini sudah melewati deadline 1 hari. Segera selesaikan.', time: '13.00', read: false, route: 'Manajemen tugas' },
  { id: 'ntf-07', type: 'task', icon: '📋', title: 'Update tugas', body: 'Desain thumbnail YouTube telah diperbarui oleh Nadia Putri.', time: '14.22', read: true, route: 'Manajemen tugas' },
];

/** Laporan */
export const reportPlatformData = [
  { platform: 'Instagram', planned: 22, done: 14, late: 3, rate: 64 },
  { platform: 'TikTok',    planned: 14, done:  8, late: 2, rate: 57 },
  { platform: 'YouTube',   planned: 12, done:  6, late: 1, rate: 50 },
];

export const reportMemberData = [
  { name: 'Nadia Putri',    initials: 'NP', avatarClass: 'av-sage',  done: 10, ontime: 9,  late: 1, rate: 90 },
  { name: 'Raka Pratama',   initials: 'RP', avatarClass: 'av-lav',   done:  9, ontime: 7,  late: 2, rate: 78 },
  { name: 'Dimas Akbar',    initials: 'DA', avatarClass: 'av-taupe', done:  7, ontime: 5,  late: 2, rate: 71 },
  { name: 'Farah Aulia',    initials: 'FA', avatarClass: 'av-sand',  done:  5, ontime: 5,  late: 0, rate: 100 },
];

export const reportPeriodData = [
  { period: 'Jul 2026', total: 36, done: 28 },
  { period: 'Agu 2026', total: 40, done: 32 },
  { period: 'Sep 2026', total: 44, done: 30 },
  { period: 'Okt 2026', total: 48, done: 28 },
];


