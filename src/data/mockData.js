/**
 * Dummy Data Terpusat, Simulasi Auth RBAC & State Lokal (localStorage)
 * Yayasan Motivator Qur'an Content Operations
 * Sesuai SOT (PRD.md v0.3, UI_GUIDELINE.md, IMPLEMENTATION_PLAN.md Fase 5)
 * Catatan: Simulasi front-end murni (state/localStorage); bukan autentikasi/penyimpanan server nyata.
 */

import { formatShortDateId, formatScheduleTileDate } from '../utils/helpers.js';

export const ROLES = {
  KETUA_TIM: 'Ketua Tim',
  COPYWRITER: 'Copywriter',
  EDITOR: 'Editor',
};

export const availableRoles = [
  ROLES.KETUA_TIM,
  ROLES.COPYWRITER,
  ROLES.EDITOR,
];

export const INVITABLE_ROLES = [
  ROLES.COPYWRITER,
  ROLES.EDITOR,
];

export const MEMBER_STATUSES = {
  PENDING: 'Menunggu Aktivasi',
  ACTIVE: 'Aktif',
  INACTIVE: 'Tidak aktif',
};

export const ROLE_META = {
  [ROLES.KETUA_TIM]: {
    label: 'Ketua Tim (Super Admin)',
    shortLabel: 'Ketua Tim',
    summary: 'Akses penuh kalender, buat ide, assign tim, approval akhir, anggota & laporan.',
    pillClass: 'role-admin',
  },
  [ROLES.COPYWRITER]: {
    label: 'Copywriter',
    shortLabel: 'Copywriter',
    summary: 'Produksi script & caption, kirim tugas ke status "Siap Edit".',
    pillClass: 'role-creative',
  },
  [ROLES.EDITOR]: {
    label: 'Editor',
    shortLabel: 'Editor',
    summary: 'Proses item "Siap Edit" (raw footage + naskah), tempel output & kirim "Menunggu Review".',
    pillClass: 'role-reviewer',
  },
};

export const ROLE_PERMISSIONS = {
  [ROLES.KETUA_TIM]: {
    allowedRoutes: [
      'Overview',
      'Kalender konten',
      'Alur produksi',
      'Manajemen tugas',
      'Aset & file',
      'Notifikasi',
      'Diskusi Tim',
      'Laporan',
      'Manajemen Tim',
      'Dokumen SOT',
    ],
    canCreateContent: true,
    canAssign: true,
    canApprove: true,
    canManageUsers: true,
    canViewReports: true,
    canEditScript: true,
    canEditOutput: true,
  },
  [ROLES.COPYWRITER]: {
    allowedRoutes: [
      'Overview',
      'Kalender konten',
      'Alur produksi',
      'Manajemen tugas',
      'Aset & file',
      'Notifikasi',
      'Diskusi Tim',
      'Dokumen SOT',
    ],
    canCreateContent: false,
    canAssign: false,
    canApprove: false,
    canManageUsers: false,
    canViewReports: false,
    canEditScript: true,
    canEditOutput: false,
  },
  [ROLES.EDITOR]: {
    allowedRoutes: [
      'Overview',
      'Kalender konten',
      'Alur produksi',
      'Manajemen tugas',
      'Aset & file',
      'Notifikasi',
      'Diskusi Tim',
      'Dokumen SOT',
    ],
    canCreateContent: false,
    canAssign: false,
    canApprove: false,
    canManageUsers: false,
    canViewReports: false,
    canEditScript: false,
    canEditOutput: true,
  },
};

export function getRolePermissions(role) {
  return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS[ROLES.COPYWRITER];
}

export function canAccessRoute(role, route) {
  const perms = getRolePermissions(role);
  return perms.allowedRoutes.includes(route);
}

// ─────────────────────────────────────────────────────────────────────────────
// Status & Stage Canonicals (Terhubung lintas Kalender, Pipeline & Tugas)
// ─────────────────────────────────────────────────────────────────────────────

export const WORKFLOW_STATUSES = [
  'Ide',
  'Perlu Naskah',
  'Revisi Naskah',
  'Siap Edit',
  'Menunggu Review',
  'Siap Tayang',
  'Dipublikasikan',
];

export const STATUS_TO_META = {
  'Ide':              { stage: 'ide',       statusClass: 'st-idea' },
  'Perlu Naskah':     { stage: 'naskah',    statusClass: 'st-script' },
  'Revisi Naskah':    { stage: 'revisi',    statusClass: 'st-revision' },
  'Siap Edit':        { stage: 'siap-edit', statusClass: 'st-ready-edit' },
  'Menunggu Review':  { stage: 'review',    statusClass: 'st-wait-review' },
  'Siap Tayang':      { stage: 'siap',      statusClass: 'st-ready' },
  'Dipublikasikan':   { stage: 'published', statusClass: 'st-published' },
};

export const STAGE_TO_STATUS = {
  'ide':       'Ide',
  'naskah':    'Perlu Naskah',
  'revisi':    'Revisi Naskah',
  'siap-edit': 'Siap Edit',
  'review':    'Menunggu Review',
  'siap':      'Siap Tayang',
  'published': 'Dipublikasikan',
};

export const pipelineStages = [
  { id: 'ide',       label: 'Ide / Perencanaan', icon: '💡' },
  { id: 'naskah',    label: 'Perlu Naskah',      icon: '✍️' },
  { id: 'siap-edit', label: 'Siap Edit',         icon: '🎬' },
  { id: 'review',    label: 'Menunggu Review',   icon: '👁' },
  { id: 'revisi',    label: 'Revisi Naskah',     icon: '🔄' },
  { id: 'siap',      label: 'Siap Tayang',       icon: '🚀' },
  { id: 'published', label: 'Dipublikasikan',    icon: '📡' },
];

export function isCopywriterQueueItem(item) {
  return ['Ide', 'Perlu Naskah', 'Revisi Naskah'].includes(item.status);
}

export function isEditorQueueItem(item) {
  return item.status === 'Siap Edit';
}

export function isKetuaReviewItem(item) {
  return item.status === 'Menunggu Review';
}

// ─────────────────────────────────────────────────────────────────────────────
// Akun Demo Terdaftar & Data Tim (Simulasi)
// ─────────────────────────────────────────────────────────────────────────────

const INITIAL_USERS = [
  {
    id: 'u-01',
    name: 'Helza',
    initials: 'HZ',
    email: 'ketua@tim.com',
    demoPassword: 'ketua123',
    role: ROLES.KETUA_TIM,
    status: 'Aktif',
    joined: 'Jan 2025',
    avatarClass: 'av-sand',
    isPrimaryDemo: true,
  },
  {
    id: 'u-02',
    name: 'Nadia Putri',
    initials: 'NP',
    email: 'copywriter@tim.com',
    demoPassword: 'copy123',
    role: ROLES.COPYWRITER,
    status: 'Aktif',
    joined: 'Feb 2025',
    avatarClass: 'av-sage',
    isPrimaryDemo: true,
  },
  {
    id: 'u-03',
    name: 'Raka Pratama',
    initials: 'RP',
    email: 'editor@tim.com',
    demoPassword: 'editor123',
    role: ROLES.EDITOR,
    status: 'Aktif',
    joined: 'Feb 2025',
    avatarClass: 'av-lav',
    isPrimaryDemo: true,
  },
  {
    id: 'u-04',
    name: 'Dimas Akbar',
    initials: 'DA',
    email: 'dimas@ymq.demo',
    demoPassword: 'demo123',
    role: ROLES.COPYWRITER,
    status: 'Aktif',
    joined: 'Apr 2025',
    avatarClass: 'av-taupe',
    isPrimaryDemo: false,
  },
  {
    id: 'u-05',
    name: 'Siti Rahayu',
    initials: 'SR',
    email: 'siti@ymq.demo',
    demoPassword: 'demo123',
    role: ROLES.EDITOR,
    status: 'Aktif',
    joined: 'Jun 2025',
    avatarClass: 'av-sage',
    isPrimaryDemo: false,
  },
];

export const demoCredentialsGuide = [
  { email: 'ketua@tim.com',      password: 'ketua123',  role: ROLES.KETUA_TIM,  name: 'Helza',        badge: 'Super Admin' },
  { email: 'copywriter@tim.com', password: 'copy123',   role: ROLES.COPYWRITER, name: 'Nadia Putri',  badge: 'Teks & Naskah' },
  { email: 'editor@tim.com',     password: 'editor123', role: ROLES.EDITOR,     name: 'Raka Pratama', badge: 'Visual & Video' },
];

export const rolesMatrix = [
  { role: ROLES.KETUA_TIM,  dashboard: true, kalender: true, pipeline: true, tugas: true, aset: true, notifikasi: true, laporan: true,  tim: true  },
  { role: ROLES.COPYWRITER, dashboard: true, kalender: true, pipeline: true, tugas: true, aset: true, notifikasi: true, laporan: false, tim: false },
  { role: ROLES.EDITOR,     dashboard: true, kalender: true, pipeline: true, tugas: true, aset: true, notifikasi: true, laporan: false, tim: false },
];

// ─────────────────────────────────────────────────────────────────────────────
// Konten Operasional Terpadu (Linked across Dashboard, Kalender, Pipeline, Tugas)
// ─────────────────────────────────────────────────────────────────────────────

const INITIAL_CONTENT_ITEMS = [
  {
    id: 'cnt-01',
    title: 'Flash sale kelas tahsin batch baru',
    platform: 'TikTok',
    category: 'Promosi',
    status: 'Ide',
    prodDate: '2026-10-16',
    pubDate: '2026-10-20',
    deadline: '2026-10-18',
    priority: 'Tinggi',
    owner: 'Helza',
    assigneeCopywriter: 'Nadia Putri',
    assigneeEditor: 'Raka Pratama',
    script: '',
    caption: '',
    rawFootageUrl: 'https://drive.google.com/drive/folders/demo-ymq-flashsale-tahsin',
    outputUrl: '',
    notes: 'Buat hook 3 detik pertama yang menarik untuk calon santri baru.',
    isOverdue: false,
  },
  {
    id: 'cnt-02',
    title: 'Update kurikulum 2027 Yayasan Motivator Qur\'an',
    platform: 'Instagram',
    category: 'Informasi',
    status: 'Perlu Naskah',
    prodDate: '2026-10-15',
    pubDate: '2026-10-22',
    deadline: '2026-10-17',
    priority: 'Tinggi',
    owner: 'Helza',
    assigneeCopywriter: 'Nadia Putri',
    assigneeEditor: 'Raka Pratama',
    script: 'Draft pembuka: Alhamdulillah, Yayasan Motivator Qur\'an resmi meluncurkan penyempurnaan kurikulum 2027.',
    caption: '',
    rawFootageUrl: 'https://drive.google.com/drive/folders/demo-ymq-kurikulum-2027',
    outputUrl: '',
    notes: 'Lengkapi script carousel 6 slide dan caption ajakan daftar.',
    isOverdue: false,
  },
  {
    id: 'cnt-03',
    title: 'Testimoni alumni batch 12',
    platform: 'YouTube',
    category: 'Informasi',
    status: 'Perlu Naskah',
    prodDate: '2026-10-14',
    pubDate: '2026-10-19',
    deadline: '2026-10-16',
    priority: 'Normal',
    owner: 'Helza',
    assigneeCopywriter: 'Nadia Putri',
    assigneeEditor: 'Raka Pratama',
    script: '',
    caption: '',
    rawFootageUrl: 'https://drive.google.com/drive/folders/demo-ymq-testimoni-b12',
    outputUrl: '',
    notes: 'Susun poin kutipan terbaik dari wawancara alumni.',
    isOverdue: false,
  },
  {
    id: 'cnt-04',
    title: 'Cara menjaga istiqomah menghafal',
    platform: 'Instagram',
    category: 'Edukasi',
    status: 'Revisi Naskah',
    prodDate: '2026-10-12',
    pubDate: '2026-10-17',
    deadline: '2026-10-16',
    priority: 'Tinggi',
    owner: 'Helza',
    assigneeCopywriter: 'Nadia Putri',
    assigneeEditor: 'Raka Pratama',
    script: 'Slide 1: Lelah menjaga murojaah? Slide 2: Mulai dari 10 menit konsisten bakda subuh.',
    caption: 'Menjaga hafalan butuh strategi hati dan rutinitas yang realistis. #MotivatorQuran',
    rawFootageUrl: 'https://drive.google.com/drive/folders/demo-ymq-istiqomah-raw',
    outputUrl: '',
    notes: 'Revisi Ketua Tim: Tambahkan kutipan QS. Al-Qamar: 17 pada slide penutup.',
    isOverdue: true,
  },
  {
    id: 'cnt-05',
    title: 'Kuis interaktif tajwid praktis',
    platform: 'Instagram',
    category: 'Edukasi',
    status: 'Siap Edit',
    prodDate: '2026-10-14',
    pubDate: '2026-10-19',
    deadline: '2026-10-17',
    priority: 'Normal',
    owner: 'Helza',
    assigneeCopywriter: 'Nadia Putri',
    assigneeEditor: 'Raka Pratama',
    script: '[00:00-00:05] Host: Bisa tebak hukum bacaan ikhfa di ayat ini? [00:05-00:25] Tampilkan potongan ayat + hitung mundur 5 detik.',
    caption: 'Uji pemahaman tajwidmu hari ini bersama tim pengajar Yayasan Motivator Qur\'an! Tulis jawabanmu di komentar.',
    rawFootageUrl: 'https://drive.google.com/drive/folders/demo-ymq-kuis-tajwid-raw',
    outputUrl: '',
    notes: 'Gunakan overlay teks gold & crimson sesuai template resmi.',
    isOverdue: false,
  },
  {
    id: 'cnt-06',
    title: 'Weekend class teaser bersama santri',
    platform: 'Instagram',
    category: 'Promosi',
    status: 'Siap Edit',
    prodDate: '2026-10-13',
    pubDate: '2026-10-18',
    deadline: '2026-10-16',
    priority: 'Tinggi',
    owner: 'Helza',
    assigneeCopywriter: 'Nadia Putri',
    assigneeEditor: 'Raka Pratama',
    script: 'Opening: B-roll kelas tahsin pagi. VO: Akhir pekan lebih tenang dan bermakna dengan bimbingan tahsin bersanad.',
    caption: 'Akhir pekan penuh berkah! Yuk gabung Weekend Class Yayasan Motivator Qur\'an bulan ini. Klik tautan di bio.',
    rawFootageUrl: 'https://drive.google.com/drive/folders/demo-ymq-weekend-teaser-raw',
    outputUrl: '',
    notes: 'Sertakan musik latar akustik lembut tanpa vokal.',
    isOverdue: true,
  },
  {
    id: 'cnt-07',
    title: 'Program unggulan bimbingan Qur\'an',
    platform: 'TikTok',
    category: 'Informasi',
    status: 'Siap Edit',
    prodDate: '2026-10-11',
    pubDate: '2026-10-16',
    deadline: '2026-10-16',
    priority: 'Tinggi',
    owner: 'Helza',
    assigneeCopywriter: 'Dimas Akbar',
    assigneeEditor: 'Raka Pratama',
    script: 'Scene 1: 3 program unggulan Yayasan Motivator Qur\'an. Scene 2: Jadwal fleksibel online & offline.',
    caption: 'Kenali program bimbingan Al-Qur\'an untuk anak, remaja, hingga dewasa di Yayasan Motivator Qur\'an.',
    rawFootageUrl: 'https://drive.google.com/drive/folders/demo-ymq-program-unggulan-raw',
    outputUrl: '',
    notes: 'Prioritas tayang pekan ini — segera tempel link final.',
    isOverdue: false,
  },
  {
    id: 'cnt-08',
    title: 'Behind the scene persiapan kajian akbar',
    platform: 'YouTube',
    category: 'Hiburan',
    status: 'Menunggu Review',
    prodDate: '2026-10-10',
    pubDate: '2026-10-21',
    deadline: '2026-10-16',
    priority: 'Normal',
    owner: 'Helza',
    assigneeCopywriter: 'Nadia Putri',
    assigneeEditor: 'Raka Pratama',
    script: 'Vlog persiapan tim acara, soundcheck ustadz, dan ramah tamah panitia kajian bulanan.',
    caption: 'Intip keseruan balik layar persiapan Kajian Akbar Yayasan Motivator Qur\'an bersama tim kreatif!',
    rawFootageUrl: 'https://drive.google.com/drive/folders/demo-ymq-bts-kajian-raw',
    outputUrl: 'https://drive.google.com/file/d/demo-ymq-bts-kajian-final-v1/view',
    notes: 'Menunggu persetujuan akhir Ketua Tim sebelum dijadwalkan tayang.',
    isOverdue: false,
  },
  {
    id: 'cnt-09',
    title: 'Refleksi pagi tadabbur Al-Mulk',
    platform: 'TikTok',
    category: 'Edukasi',
    status: 'Menunggu Review',
    prodDate: '2026-10-10',
    pubDate: '2026-10-17',
    deadline: '2026-10-16',
    priority: 'Tinggi',
    owner: 'Helza',
    assigneeCopywriter: 'Nadia Putri',
    assigneeEditor: 'Siti Rahayu',
    script: 'Tadabbur QS. Al-Mulk ayat 1-2: pengingat keikhlasan amal setiap pagi.',
    caption: 'Awali pagi dengan tadabbur dan murojaah ringan. Semoga Allah berkahi langkah kita hari ini.',
    rawFootageUrl: 'https://drive.google.com/drive/folders/demo-ymq-almulk-raw',
    outputUrl: 'https://drive.google.com/file/d/demo-ymq-almulk-final-v2/view',
    notes: 'Audio & subtitle sudah disesuaikan oleh Editor.',
    isOverdue: false,
  },
  {
    id: 'cnt-10',
    title: 'Tips menghafal efektif bagi pekerja',
    platform: 'Instagram',
    category: 'Edukasi',
    status: 'Siap Tayang',
    prodDate: '2026-10-08',
    pubDate: '2026-10-10',
    deadline: '2026-10-10',
    priority: 'Normal',
    owner: 'Helza',
    assigneeCopywriter: 'Nadia Putri',
    assigneeEditor: 'Raka Pratama',
    script: 'Gunakan metode 15 menit sebelum berangkat kerja dengan target 3 ayat per hari.',
    caption: 'Sibuk bekerja bukan penghalang dekat dengan Al-Qur\'an. Simpan tips ini untuk jadwal harianmu!',
    rawFootageUrl: 'https://drive.google.com/drive/folders/demo-ymq-tips-pekerja-raw',
    outputUrl: 'https://drive.google.com/file/d/demo-ymq-tips-pekerja-final/view',
    notes: 'Disetujui Ketua Tim — siap publikasi terjadwal.',
    isOverdue: false,
  },
  {
    id: 'cnt-11',
    title: 'Story challenge sambung ayat',
    platform: 'Instagram',
    category: 'Hiburan',
    status: 'Siap Tayang',
    prodDate: '2026-10-13',
    pubDate: '2026-10-18',
    deadline: '2026-10-17',
    priority: 'Normal',
    owner: 'Helza',
    assigneeCopywriter: 'Dimas Akbar',
    assigneeEditor: 'Raka Pratama',
    script: 'Format tanya jawab santai sambung ayat bersama asatidz muda di studio Yayasan Motivator Qur\'an.',
    caption: 'Berapa ayat yang berhasil kamu sambung dengan benar? Share ke teman pengajianmu!',
    rawFootageUrl: 'https://drive.google.com/drive/folders/demo-ymq-sambung-ayat-raw',
    outputUrl: 'https://drive.google.com/file/d/demo-ymq-sambung-ayat-final/view',
    notes: 'Approved.',
    isOverdue: false,
  },
  {
    id: 'cnt-12',
    title: 'Di balik layar tim pengajar',
    platform: 'YouTube',
    category: 'Hiburan',
    status: 'Dipublikasikan',
    prodDate: '2026-10-06',
    pubDate: '2026-10-12',
    deadline: '2026-10-12',
    priority: 'Normal',
    owner: 'Helza',
    assigneeCopywriter: 'Nadia Putri',
    assigneeEditor: 'Raka Pratama',
    script: 'Profil singkat keseharian pengajar tahfidz dan persiapan materi kelas daring.',
    caption: 'Mengenal lebih dekat para pengajar Yayasan Motivator Qur\'an. Tonton selengkapnya di YouTube resmi kami.',
    rawFootageUrl: 'https://drive.google.com/drive/folders/demo-ymq-tim-pengajar-raw',
    outputUrl: 'https://drive.google.com/file/d/demo-ymq-tim-pengajar-published/view',
    notes: 'Sudah tayang sesuai jadwal.',
    isOverdue: false,
  },
];

const INITIAL_ACTIVITIES = [
  { id: 'act-1', user: 'Nadia Putri',  initials: 'NP', action: 'mengirim naskah ke Siap Edit',      target: 'Kuis interaktif tajwid praktis',         time: '12 menit lalu', avatarClass: 'av-sage' },
  { id: 'act-2', user: 'Raka Pratama', initials: 'RP', action: 'menempelkan output ke Menunggu Review', target: 'Behind the scene persiapan kajian akbar', time: '38 menit lalu', avatarClass: 'av-lav' },
  { id: 'act-3', user: 'Helza',        initials: 'HZ', action: 'menyetujui konten untuk tayang',   target: 'Tips menghafal efektif bagi pekerja',    time: '1 jam lalu',    avatarClass: 'av-sand' },
];

const INITIAL_NOTIFICATIONS = [
  { id: 'ntf-01', type: 'deadline', icon: '⏰', title: 'Deadline hari ini',           body: 'Weekend class teaser bersama santri berstatus Siap Edit membutuhkan hasil editan.', time: '08.00', read: false, route: 'Manajemen tugas' },
  { id: 'ntf-02', type: 'revision', icon: '🔄', title: 'Revisi Naskah diminta',      body: 'Helza meminta revisi naskah pada "Cara menjaga istiqomah menghafal" — tambah kutipan ayat.', time: '09.15', read: false, route: 'Manajemen tugas' },
  { id: 'ntf-03', type: 'task',     icon: '🎬', title: 'Siap Edit untuk Editor',     body: 'Nadia Putri menandai "Kuis interaktif tajwid praktis" sebagai Siap Edit.', time: '09.30', read: false, route: 'Manajemen tugas' },
  { id: 'ntf-04', type: 'approval', icon: '👁', title: 'Menunggu Review Ketua Tim', body: 'Raka Pratama mengirim link output "Behind the scene persiapan kajian akbar".', time: '10.15', read: false, route: 'Manajemen tugas' },
  { id: 'ntf-05', type: 'publish',  icon: '📡', title: 'Konten siap tayang',         body: '"Tips menghafal efektif bagi pekerja" disetujui oleh Helza.', time: '11.30', read: true,  route: 'Kalender konten' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Mutable Exported Live Arrays / Objects
// ─────────────────────────────────────────────────────────────────────────────

function deepClone(data) {
  return JSON.parse(JSON.stringify(data));
}

function initialsFromName(name) {
  const parts = String(name || 'MQ').trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function getStageAssignee(item) {
  if (['Ide', 'Perlu Naskah', 'Revisi Naskah'].includes(item.status)) {
    return item.assigneeCopywriter || 'Nadia Putri';
  }
  if (item.status === 'Siap Edit') {
    return item.assigneeEditor || 'Raka Pratama';
  }
  return item.owner || 'Helza';
}

export let usersData = deepClone(INITIAL_USERS);
export let contentItems = deepClone(INITIAL_CONTENT_ITEMS);
export let calendarItems = [];
export let pipelineItems = [];
export let taskItems = [];
export let upcomingSchedules = [];
export let priorityTasks = [];
export let recentActivities = deepClone(INITIAL_ACTIVITIES);
export let notificationsData = deepClone(INITIAL_NOTIFICATIONS);
export let teamMembers = [];

export const statsOverview = {
  planned:      { value: 0, delta: '+12.8%', label: 'Total konten aktif', kind: 'lavender', icon: '▤' },
  inProduction: { value: 0, delta: '+4.2%',  label: 'Dalam produksi',     kind: 'sage',     icon: '◷' },
  completed:    { value: 0, delta: '+8.6%',  label: 'Siap / tayang',      kind: 'sand',     icon: '✓' },
  overdue:      { value: 0, delta: '-2.1%',  label: 'Perlu perhatian',    kind: 'rose',     icon: '⚑' },
};

export let currentUser = null;

function replaceArrayInPlace(target, nextItems) {
  target.length = 0;
  nextItems.forEach(item => target.push(item));
}

export function syncDerivedArrays() {
  const mappedTeam = usersData
    .filter(u => u.status === 'Aktif')
    .map(u => ({ name: u.name, initials: u.initials, role: u.role, email: u.email }));
  replaceArrayInPlace(teamMembers, mappedTeam);

  const cal = contentItems.map(item => {
    const meta = STATUS_TO_META[item.status] || STATUS_TO_META['Ide'];
    return {
      id: item.id,
      title: item.title,
      platform: item.platform,
      category: item.category,
      status: item.status,
      statusClass: item.isOverdue ? 'st-late' : meta.statusClass,
      stage: meta.stage,
      prodDate: item.prodDate,
      pubDate: item.pubDate,
      deadline: item.deadline,
      priority: item.priority,
      owner: item.owner,
      initials: initialsFromName(item.owner),
      assigneeCopywriter: item.assigneeCopywriter,
      assigneeEditor: item.assigneeEditor,
      script: item.script || '',
      caption: item.caption || '',
      rawFootageUrl: item.rawFootageUrl || '',
      outputUrl: item.outputUrl || '',
      notes: item.notes || '',
      isOverdue: Boolean(item.isOverdue),
    };
  });
  replaceArrayInPlace(calendarItems, cal);

  const pip = contentItems.map(item => {
    const meta = STATUS_TO_META[item.status] || STATUS_TO_META['Ide'];
    const stageAssignee = getStageAssignee(item);
    return {
      id: item.id,
      title: item.title,
      platform: item.platform,
      category: item.category,
      status: item.status,
      statusClass: item.isOverdue ? 'st-late' : meta.statusClass,
      stage: meta.stage,
      owner: stageAssignee,
      initials: initialsFromName(stageAssignee),
      assigneeCopywriter: item.assigneeCopywriter,
      assigneeEditor: item.assigneeEditor,
      pubDate: formatShortDateId(item.pubDate),
      rawPubDate: item.pubDate,
      prodDate: item.prodDate,
      script: item.script || '',
      caption: item.caption || '',
      rawFootageUrl: item.rawFootageUrl || '',
      outputUrl: item.outputUrl || '',
      notes: item.notes || '',
      priority: item.priority,
      isOverdue: Boolean(item.isOverdue),
    };
  });
  replaceArrayInPlace(pipelineItems, pip);

  const tsk = contentItems.map(item => {
    const meta = STATUS_TO_META[item.status] || STATUS_TO_META['Ide'];
    const assignee = getStageAssignee(item);
    return {
      id: item.id,
      title: item.title,
      project: `${item.category} · ${item.platform}`,
      category: item.category,
      platform: item.platform,
      assignee,
      initials: initialsFromName(assignee),
      owner: item.owner,
      assigneeCopywriter: item.assigneeCopywriter,
      assigneeEditor: item.assigneeEditor,
      deadline: item.deadline || item.pubDate,
      prodDate: item.prodDate,
      pubDate: item.pubDate,
      priority: item.priority || 'Normal',
      status: item.status,
      statusClass: item.isOverdue ? 'st-late' : meta.statusClass,
      stage: meta.stage,
      script: item.script || '',
      caption: item.caption || '',
      rawFootageUrl: item.rawFootageUrl || '',
      outputUrl: item.outputUrl || '',
      notes: item.notes || '',
      isOverdue: Boolean(item.isOverdue),
    };
  });
  replaceArrayInPlace(taskItems, tsk);

  const platColor = { Instagram: 'sage', TikTok: 'lavender', YouTube: 'sand' };
  const sch = contentItems
    .filter(item => item.status !== 'Dipublikasikan')
    .slice(0, 4)
    .map(item => ({
      id: `sch-${item.id}`,
      contentId: item.id,
      title: item.title,
      platform: item.platform,
      category: item.category,
      date: formatScheduleTileDate(item.pubDate),
      time: '10.00',
      color: platColor[item.platform] || 'sage',
    }));
  replaceArrayInPlace(upcomingSchedules, sch);

  const prio = tsk
    .filter(t => t.status !== 'Dipublikasikan' && t.status !== 'Siap Tayang')
    .slice(0, 6);
  replaceArrayInPlace(priorityTasks, prio);

  statsOverview.planned.value = contentItems.length;
  statsOverview.inProduction.value = contentItems.filter(i =>
    ['Ide', 'Perlu Naskah', 'Revisi Naskah', 'Siap Edit', 'Menunggu Review'].includes(i.status)
  ).length;
  statsOverview.completed.value = contentItems.filter(i =>
    ['Siap Tayang', 'Dipublikasikan'].includes(i.status)
  ).length;
  statsOverview.overdue.value = contentItems.filter(i => Boolean(i.isOverdue) || i.status === 'Revisi Naskah').length;
}

// ─────────────────────────────────────────────────────────────────────────────
// Safe localStorage Adapter (Aman di Browser & Node Test)
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_SESSION_KEY = 'ymq_rbac_session_v1';
const STORAGE_DATA_KEY    = 'ymq_rbac_workspace_v3';
const STORAGE_CHAT_KEY    = 'ymq_team_chat_v1';

// ─────────────────────────────────────────────────────────────────────────────
// Diskusi Tim & Channel Chat Internal (Simulasi localStorage)
// ─────────────────────────────────────────────────────────────────────────────

export const chatChannels = [
  {
    id: 'umum-tim',
    name: '#umum-tim',
    title: 'Koordinasi Harian Tim',
    description: 'Sinkronisasi jadwal tayang, prioritas mingguan, dan pengumuman operasional tim kreatif.',
  },
  {
    id: 'ide-konten',
    name: '#ide-konten',
    title: 'Brainstorming & Naskah',
    description: 'Diskusi ide hook, sudut pandang dakwah, riset tren TikTok/IG/YouTube, dan copywriting.',
  },
  {
    id: 'revisi-editing',
    name: '#revisi-editing',
    title: 'Produksi & Revisi Editing',
    description: 'Catatan potongan video, audio, teks layar, dan konfirmasi hasil final sebelum approval.',
  },
];

const INITIAL_CHAT_MESSAGES = [
  {
    id: 'msg-01',
    channelId: 'umum-tim',
    senderId: 'u-01',
    senderName: 'Helza',
    senderEmail: 'ketua@tim.com',
    senderInitials: 'HZ',
    senderRole: ROLES.KETUA_TIM,
    senderAvatarClass: 'av-sand',
    text: 'Assalamu\'alaikum tim! Reminder target minggu ini: konten "Update kurikulum 2027" dan "Weekend class teaser" kita kunci sebelum Jumat jam 16.00 ya.',
    timestamp: '09:05',
    readByEmails: ['ketua@tim.com', 'copywriter@tim.com', 'editor@tim.com'],
  },
  {
    id: 'msg-02',
    channelId: 'umum-tim',
    senderId: 'u-02',
    senderName: 'Nadia Putri',
    senderEmail: 'copywriter@tim.com',
    senderInitials: 'NP',
    senderRole: ROLES.COPYWRITER,
    senderAvatarClass: 'av-sage',
    text: 'Wa\'alaikumussalam Kak Helza! Siap, draft 6 slide carousel Kurikulum 2027 sedang saya finalisasi caption-nya. Siang ini langsung saya pindahkan ke status Siap Edit.',
    timestamp: '09:12',
    readByEmails: ['copywriter@tim.com', 'ketua@tim.com'],
  },
  {
    id: 'msg-03',
    channelId: 'umum-tim',
    senderId: 'u-03',
    senderName: 'Raka Pratama',
    senderEmail: 'editor@tim.com',
    senderInitials: 'RP',
    senderRole: ROLES.EDITOR,
    senderAvatarClass: 'av-lav',
    text: 'Siap mantap! Raw footage Weekend Class juga sudah saya rapikan di folder Drive. Begitu naskah Nadia masuk antrean Siap Edit, langsung saya gas potong.',
    timestamp: '09:18',
    readByEmails: ['editor@tim.com'],
  },
  {
    id: 'msg-04',
    channelId: 'ide-konten',
    senderId: 'u-02',
    senderName: 'Nadia Putri',
    senderEmail: 'copywriter@tim.com',
    senderInitials: 'NP',
    senderRole: ROLES.COPYWRITER,
    senderAvatarClass: 'av-sage',
    text: 'Untuk "Flash sale kelas tahsin batch baru" di TikTok, gimana kalau 3 detik pertama pakai hook pertanyaan: "Sering ragu panjang-pendek mad pas baca Al-Qur\'an?"',
    timestamp: '10:02',
    readByEmails: ['copywriter@tim.com', 'ketua@tim.com'],
  },
  {
    id: 'msg-05',
    channelId: 'ide-konten',
    senderId: 'u-01',
    senderName: 'Helza',
    senderEmail: 'ketua@tim.com',
    senderInitials: 'HZ',
    senderRole: ROLES.KETUA_TIM,
    senderAvatarClass: 'av-sand',
    text: 'Hook-nya sangat relevan dan hangat! Tambahkan 1 kutipan testimoni singkat alumni batch 12 di pertengahan biar kepercayaan calon santri makin kuat.',
    timestamp: '10:09',
    readByEmails: ['ketua@tim.com'],
  },
  {
    id: 'msg-06',
    channelId: 'ide-konten',
    senderId: 'u-03',
    senderName: 'Raka Pratama',
    senderEmail: 'editor@tim.com',
    senderInitials: 'RP',
    senderRole: ROLES.EDITOR,
    senderAvatarClass: 'av-lav',
    text: 'Setuju banget! Nanti di bagian hook saya kasih kinetic typography warna gold + BGM akustik biar feel-nya clean dan modern.',
    timestamp: '10:15',
    readByEmails: ['editor@tim.com'],
  },
  {
    id: 'msg-07',
    channelId: 'revisi-editing',
    senderId: 'u-03',
    senderName: 'Raka Pratama',
    senderEmail: 'editor@tim.com',
    senderInitials: 'RP',
    senderRole: ROLES.EDITOR,
    senderAvatarClass: 'av-lav',
    text: 'Halo Kak Helza & Nadia, cut pertama "Weekend class teaser bersama santri" sudah saya tempel tautan preview-nya. Boleh dicek pacing transisi detik 0:15–0:25 ya.',
    timestamp: '10:34',
    readByEmails: ['editor@tim.com', 'ketua@tim.com'],
  },
  {
    id: 'msg-08',
    channelId: 'revisi-editing',
    senderId: 'u-01',
    senderName: 'Helza',
    senderEmail: 'ketua@tim.com',
    senderInitials: 'HZ',
    senderRole: ROLES.KETUA_TIM,
    senderAvatarClass: 'av-sand',
    text: 'Sudah saya tonton Raka, visualnya keren! Minta tolong naikkan volume vokal narator +3dB di detik 0:18 dan perjelas subtitle CTA di akhir ya.',
    timestamp: '10:41',
    readByEmails: ['ketua@tim.com'],
  },
  {
    id: 'msg-09',
    channelId: 'revisi-editing',
    senderId: 'u-02',
    senderName: 'Nadia Putri',
    senderEmail: 'copywriter@tim.com',
    senderInitials: 'NP',
    senderRole: ROLES.COPYWRITER,
    senderAvatarClass: 'av-sage',
    text: 'Untuk teks CTA penutupnya bisa pakai: "Daftar kelas weekend sekarang — link di bio!" biar ringkas dan langsung terbaca.',
    timestamp: '10:47',
    readByEmails: ['copywriter@tim.com'],
  },
];

export let chatMessages = deepClone(INITIAL_CHAT_MESSAGES);

function formatNowClock() {
  try {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  } catch {
    return 'Baru saja';
  }
}

export function saveChatState() {
  const storage = getSafeStorage();
  if (!storage) return;
  try {
    storage.setItem(STORAGE_CHAT_KEY, JSON.stringify({
      v: 1,
      messages: chatMessages,
    }));
  } catch {
    // Abaikan kuota penuh pada mode demo
  }
}

export function getChatMessagesByChannel(channelId) {
  return chatMessages.filter(m => m.channelId === channelId);
}

export function getUnreadChatCount(userEmail = null, channelId = null) {
  const email = String(userEmail || currentUser?.email || '').trim().toLowerCase();
  if (!email) return 0;
  return chatMessages.filter(m => {
    if (channelId && m.channelId !== channelId) return false;
    const readers = Array.isArray(m.readByEmails) ? m.readByEmails : [];
    return !readers.includes(email);
  }).length;
}

export function markChannelAsRead(channelId, userEmail = null) {
  const email = String(userEmail || currentUser?.email || '').trim().toLowerCase();
  if (!email || !channelId) return false;
  let changed = false;
  chatMessages.forEach(m => {
    if (m.channelId !== channelId) return;
    if (!Array.isArray(m.readByEmails)) m.readByEmails = [];
    if (!m.readByEmails.includes(email)) {
      m.readByEmails.push(email);
      changed = true;
    }
  });
  if (changed) saveChatState();
  return changed;
}

export function sendChatMessage({ channelId, text }) {
  const user = getCurrentUser();
  const cleanText = String(text || '').trim();
  const validChannel = chatChannels.some(c => c.id === channelId) ? channelId : chatChannels[0].id;
  if (!user || !cleanText) return null;

  const email = String(user.email || '').trim().toLowerCase();
  const newMsg = {
    id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    channelId: validChannel,
    senderId: user.id || 'u-active',
    senderName: user.name || 'Anggota Tim',
    senderEmail: email,
    senderInitials: user.avatar || initialsFromName(user.name),
    senderRole: user.role || ROLES.COPYWRITER,
    senderAvatarClass: user.avatarClass || 'av-sand',
    text: cleanText,
    timestamp: formatNowClock(),
    readByEmails: [email],
  };

  chatMessages.push(newMsg);
  saveChatState();
  return newMsg;
}

function getSafeStorage() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
    if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
      return globalThis.localStorage;
    }
  } catch {
    return null;
  }
  return null;
}

export function saveWorkspaceState() {
  const storage = getSafeStorage();
  if (!storage) return;
  try {
    storage.setItem(STORAGE_DATA_KEY, JSON.stringify({
      v: 3,
      contentItems,
      usersData,
      notificationsData,
      recentActivities,
    }));
  } catch {
    // Abaikan kuota penuh pada mode demo
  }
}

function saveSessionState(userObj) {
  const storage = getSafeStorage();
  if (!storage) return;
  try {
    if (!userObj) {
      storage.removeItem(STORAGE_SESSION_KEY);
    } else {
      storage.setItem(STORAGE_SESSION_KEY, JSON.stringify({
        email: userObj.email,
        role: userObj.role,
      }));
    }
  } catch {
    // Abaikan error penyimpanan lokal
  }
}

function buildSessionUser(userRecord) {
  if (!userRecord) return null;
  const meta = ROLE_META[userRecord.role] || ROLE_META[ROLES.COPYWRITER];
  return {
    id: userRecord.id,
    name: userRecord.name,
    email: userRecord.email,
    role: userRecord.role,
    roleLabel: meta.label,
    avatar: userRecord.initials,
    avatarClass: userRecord.avatarClass || 'av-sand',
    workspace: 'Tim Kreatif YMQ',
    isAuthenticated: true,
  };
}

export function hydrateFromStorage() {
  const storage = getSafeStorage();
  if (storage) {
    try {
      const rawData = storage.getItem(STORAGE_DATA_KEY);
      if (rawData) {
        const parsed = JSON.parse(rawData);
        if (parsed && parsed.v === 3) {
          if (Array.isArray(parsed.contentItems)) {
            replaceArrayInPlace(contentItems, parsed.contentItems);
          }
          if (Array.isArray(parsed.usersData)) {
            replaceArrayInPlace(usersData, parsed.usersData);
          }
          if (Array.isArray(parsed.notificationsData)) {
            replaceArrayInPlace(notificationsData, parsed.notificationsData);
          }
          if (Array.isArray(parsed.recentActivities)) {
            replaceArrayInPlace(recentActivities, parsed.recentActivities);
          }
        }
      }

      const rawChat = storage.getItem(STORAGE_CHAT_KEY);
      if (rawChat) {
        const parsedChat = JSON.parse(rawChat);
        if (parsedChat && parsedChat.v === 1 && Array.isArray(parsedChat.messages) && parsedChat.messages.length > 0) {
          replaceArrayInPlace(chatMessages, parsedChat.messages);
        }
      }

      const rawSession = storage.getItem(STORAGE_SESSION_KEY);
      if (rawSession) {
        const sess = JSON.parse(rawSession);
        const found = usersData.find(u => u.email.toLowerCase() === String(sess?.email || '').toLowerCase());
        if (found && found.status === 'Aktif') {
          currentUser = buildSessionUser(found);
        } else {
          currentUser = null;
          storage.removeItem(STORAGE_SESSION_KEY);
        }
      } else {
        currentUser = null;
      }
    } catch {
      currentUser = null;
    }
  }
  syncDerivedArrays();
}

export function getCurrentUser() {
  return currentUser;
}

export function loginWithCredentials(email, password) {
  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanPassword = String(password || '');

  if (!cleanEmail || !cleanPassword) {
    return { ok: false, error: 'Email dan kata sandi wajib diisi.' };
  }

  const matched = usersData.find(u => u.email.toLowerCase() === cleanEmail);
  if (!matched) {
    return { ok: false, error: 'Email belum terdaftar. Hubungi Ketua Tim untuk mendapatkan akses.' };
  }
  if (matched.status === MEMBER_STATUSES.PENDING) {
    return {
      ok: false,
      error: 'Akun Anda masih berstatus Menunggu Aktivasi. Silakan lengkapi nama dan kata sandi pada tab Aktivasi Akun (Pengguna Baru).',
    };
  }
  if (matched.status !== MEMBER_STATUSES.ACTIVE) {
    return { ok: false, error: `Akun "${matched.name}" sedang dinonaktifkan (simulasi).` };
  }
  if (matched.demoPassword !== cleanPassword) {
    return { ok: false, error: 'Kata sandi tidak cocok.' };
  }

  currentUser = buildSessionUser(matched);
  saveSessionState(currentUser);
  return { ok: true, user: currentUser };
}

export function logoutCurrentUser() {
  currentUser = null;
  saveSessionState(null);
}

export function quickSwitchRole(targetRole) {
  if (!availableRoles.includes(targetRole)) return null;
  const preferred =
    usersData.find(u => u.role === targetRole && u.isPrimaryDemo && u.status === 'Aktif') ||
    usersData.find(u => u.role === targetRole && u.status === 'Aktif');

  if (preferred) {
    currentUser = buildSessionUser(preferred);
  } else {
    currentUser = {
      id: 'sim-fallback',
      name: currentUser?.name || 'Penguji Demo',
      email: currentUser?.email || 'demo@tim.com',
      role: targetRole,
      roleLabel: ROLE_META[targetRole]?.label || targetRole,
      avatar: currentUser?.avatar || 'MQ',
      avatarClass: 'av-sand',
      workspace: 'Tim Kreatif YMQ',
      isAuthenticated: true,
    };
  }
  saveSessionState(currentUser);
  return currentUser;
}

export function resetDemoWorkspace(keepSession = true) {
  const activeEmail = keepSession ? currentUser?.email : null;
  replaceArrayInPlace(usersData, deepClone(INITIAL_USERS));
  replaceArrayInPlace(contentItems, deepClone(INITIAL_CONTENT_ITEMS));
  replaceArrayInPlace(recentActivities, deepClone(INITIAL_ACTIVITIES));
  replaceArrayInPlace(notificationsData, deepClone(INITIAL_NOTIFICATIONS));
  replaceArrayInPlace(chatMessages, deepClone(INITIAL_CHAT_MESSAGES));
  syncDerivedArrays();
  saveWorkspaceState();
  saveChatState();

  if (activeEmail) {
    const matched = usersData.find(u => u.email.toLowerCase() === activeEmail.toLowerCase());
    currentUser = matched ? buildSessionUser(matched) : null;
    saveSessionState(currentUser);
  } else {
    currentUser = null;
    saveSessionState(null);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Mutasi Alur Kerja Terhubung Lintas Peran (Ketua Tim -> Copywriter -> Editor -> Ketua Tim)
// ─────────────────────────────────────────────────────────────────────────────

function pushActivityAndNotification({ actor, action, target, notifType, notifIcon, notifTitle, notifBody, notifRoute }) {
  const stamp = Date.now();
  recentActivities.unshift({
    id: `act-${stamp}`,
    user: actor?.name || currentUser?.name || 'Tim YMQ',
    initials: actor?.avatar || initialsFromName(actor?.name || currentUser?.name || 'MQ'),
    action,
    target,
    time: 'Baru saja',
    avatarClass: actor?.avatarClass || 'av-sand',
  });
  if (recentActivities.length > 6) recentActivities.pop();

  if (notifTitle) {
    notificationsData.unshift({
      id: `ntf-${stamp}`,
      type: notifType || 'task',
      icon: notifIcon || '📋',
      title: notifTitle,
      body: notifBody || target,
      time: 'Baru saja',
      read: false,
      route: notifRoute || 'Manajemen tugas',
    });
    if (notificationsData.length > 15) notificationsData.pop();
  }
}

export function createContentItem({
  title,
  platform = 'Instagram',
  category = 'Edukasi',
  prodDate = '2026-10-16',
  pubDate = '2026-10-20',
  deadline,
  priority = 'Normal',
  assigneeCopywriter = 'Nadia Putri',
  assigneeEditor = 'Raka Pratama',
  rawFootageUrl = '',
  notes = '',
  stage = 'naskah',
}) {
  const status = STAGE_TO_STATUS[stage] || 'Perlu Naskah';
  const id = `cnt-${Date.now()}`;
  const actor = getCurrentUser();
  const item = {
    id,
    title,
    platform,
    category,
    status,
    prodDate,
    pubDate,
    deadline: deadline || pubDate,
    priority,
    owner: actor?.name || 'Helza',
    assigneeCopywriter,
    assigneeEditor,
    script: '',
    caption: '',
    rawFootageUrl: String(rawFootageUrl || '').trim(),
    outputUrl: '',
    notes: String(notes || '').trim(),
    isOverdue: false,
  };

  contentItems.unshift(item);
  pushActivityAndNotification({
    actor,
    action: `membuat kartu konten baru (${status})`,
    target: title,
    notifType: 'task',
    notifIcon: '📋',
    notifTitle: 'Tugas konten baru dibuat',
    notifBody: `${actor?.name || 'Ketua Tim'} menugaskan "${title}" (${status}) kepada ${assigneeCopywriter} & ${assigneeEditor}.`,
    notifRoute: 'Manajemen tugas',
  });
  syncDerivedArrays();
  saveWorkspaceState();
  return item;
}

export function updateCopywriterWork({ id, script, caption, markReadyEdit = false }) {
  const item = contentItems.find(c => c.id === id);
  if (!item) return null;
  const actor = getCurrentUser();

  item.script = String(script || '').trim();
  item.caption = String(caption || '').trim();

  if (markReadyEdit) {
    item.status = 'Siap Edit';
    item.isOverdue = false;
    pushActivityAndNotification({
      actor,
      action: 'mengubah status menjadi Siap Edit',
      target: item.title,
      notifType: 'task',
      notifIcon: '🎬',
      notifTitle: 'Konten siap diedit (Editor)',
      notifBody: `${actor?.name || 'Copywriter'} menyelesaikan naskah/caption "${item.title}". Sekarang muncul di antrean Siap Edit Editor.`,
      notifRoute: 'Manajemen tugas',
    });
  } else {
    if (item.status === 'Ide') {
      item.status = 'Perlu Naskah';
    }
    pushActivityAndNotification({
      actor,
      action: 'menyimpan draft naskah & caption',
      target: item.title,
    });
  }

  syncDerivedArrays();
  saveWorkspaceState();
  return item;
}

export function submitEditorWork({ id, outputUrl }) {
  const item = contentItems.find(c => c.id === id);
  if (!item) return null;
  const actor = getCurrentUser();

  item.outputUrl = String(outputUrl || '').trim();
  item.status = 'Menunggu Review';
  item.isOverdue = false;

  pushActivityAndNotification({
    actor,
    action: 'menempelkan tautan output ke Menunggu Review',
    target: item.title,
    notifType: 'approval',
    notifIcon: '👁',
    notifTitle: 'Menunggu Review Ketua Tim',
    notifBody: `${actor?.name || 'Editor'} mengunggah hasil editan "${item.title}". Siap diperiksa dan disetujui Ketua Tim.`,
    notifRoute: 'Manajemen tugas',
  });

  syncDerivedArrays();
  saveWorkspaceState();
  return item;
}

export function reviewByKetuaTim({ id, decision, revisionTarget = 'editor', revisionNotes = '' }) {
  const item = contentItems.find(c => c.id === id);
  if (!item) return null;
  const actor = getCurrentUser();

  if (decision === 'approve_publish') {
    item.status = 'Dipublikasikan';
    item.isOverdue = false;
    pushActivityAndNotification({
      actor,
      action: 'menyetujui & mempublikasikan konten',
      target: item.title,
      notifType: 'publish',
      notifIcon: '📡',
      notifTitle: 'Konten disetujui & dipublikasikan',
      notifBody: `${actor?.name || 'Ketua Tim'} mempublikasikan "${item.title}".`,
      notifRoute: 'Kalender konten',
    });
  } else if (decision === 'approve_ready') {
    item.status = 'Siap Tayang';
    item.isOverdue = false;
    pushActivityAndNotification({
      actor,
      action: 'memberikan approval (Siap Tayang)',
      target: item.title,
      notifType: 'approval',
      notifIcon: '✅',
      notifTitle: 'Approval hasil akhir disetujui',
      notifBody: `${actor?.name || 'Ketua Tim'} menyetujui "${item.title}" untuk dijadwalkan tayang.`,
      notifRoute: 'Kalender konten',
    });
  } else if (decision === 'request_revision') {
    const cleanNote = String(revisionNotes || '').trim();
    if (cleanNote) item.notes = `Revisi Ketua Tim: ${cleanNote}`;
    if (revisionTarget === 'copywriter') {
      item.status = 'Revisi Naskah';
    } else {
      item.status = 'Siap Edit';
    }
    pushActivityAndNotification({
      actor,
      action: `meminta revisi (${revisionTarget === 'copywriter' ? 'Copywriter' : 'Editor'})`,
      target: item.title,
      notifType: 'revision',
      notifIcon: '🔄',
      notifTitle: `Revisi diminta: ${item.title}`,
      notifBody: cleanNote || `Konten dikembalikan ke antrean ${revisionTarget === 'copywriter' ? 'Copywriter' : 'Editor'}.`,
      notifRoute: 'Manajemen tugas',
    });
  }

  syncDerivedArrays();
  saveWorkspaceState();
  return item;
}

export function updateContentByKetua({
  id,
  title,
  platform,
  category,
  prodDate,
  pubDate,
  deadline,
  priority,
  assigneeCopywriter,
  assigneeEditor,
  rawFootageUrl,
  outputUrl,
  notes,
  status,
  isOverdue,
}) {
  const item = contentItems.find(c => c.id === id);
  if (!item) return null;

  if (title !== undefined) item.title = title;
  if (platform !== undefined) item.platform = platform;
  if (category !== undefined) item.category = category;
  if (prodDate !== undefined) item.prodDate = prodDate;
  if (pubDate !== undefined) item.pubDate = pubDate;
  if (deadline !== undefined) item.deadline = deadline;
  if (priority !== undefined) item.priority = priority;
  if (assigneeCopywriter !== undefined) item.assigneeCopywriter = assigneeCopywriter;
  if (assigneeEditor !== undefined) item.assigneeEditor = assigneeEditor;
  if (rawFootageUrl !== undefined) item.rawFootageUrl = String(rawFootageUrl).trim();
  if (outputUrl !== undefined) item.outputUrl = String(outputUrl).trim();
  if (notes !== undefined) item.notes = String(notes).trim();
  if (status !== undefined && STATUS_TO_META[status]) item.status = status;
  if (isOverdue !== undefined) item.isOverdue = Boolean(isOverdue);

  syncDerivedArrays();
  saveWorkspaceState();
  return item;
}

export function movePipelineStageByRole(id, nextStageId) {
  const item = contentItems.find(c => c.id === id);
  const nextStatus = STAGE_TO_STATUS[nextStageId];
  if (!item || !nextStatus) return null;
  item.status = nextStatus;
  if (nextStatus === 'Dipublikasikan' || nextStatus === 'Siap Tayang') {
    item.isOverdue = false;
  }
  syncDerivedArrays();
  saveWorkspaceState();
  return item;
}

function formatJoinMonthId() {
  try {
    return new Date().toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
  } catch {
    return 'Okt 2026';
  }
}

export function inviteTeamMember({ email, role }) {
  const cleanEmail = String(email || '').trim().toLowerCase();
  const targetRole = INVITABLE_ROLES.includes(role) ? role : '';

  if (!cleanEmail) {
    return { ok: false, error: 'Email anggota wajib diisi.' };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return { ok: false, error: 'Format email tidak valid (contoh: anggota@tim.com).' };
  }
  if (!targetRole) {
    return { ok: false, error: 'Pilih tugas/role anggota (Copywriter atau Editor).' };
  }
  if (usersData.some(u => u.email.toLowerCase() === cleanEmail)) {
    return { ok: false, error: `Email "${cleanEmail}" sudah terdaftar dalam tim.` };
  }

  const actor = getCurrentUser();
  const newMember = {
    id: `u-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: '(Menunggu Aktivasi)',
    initials: cleanEmail.slice(0, 2).toUpperCase(),
    email: cleanEmail,
    demoPassword: '',
    role: targetRole,
    status: MEMBER_STATUSES.PENDING,
    joined: 'Menunggu aktivasi',
    avatarClass: targetRole === ROLES.COPYWRITER ? 'av-sage' : 'av-lav',
    isPrimaryDemo: false,
    isPendingName: true,
  };

  usersData.push(newMember);
  pushActivityAndNotification({
    actor,
    action: `mendaftarkan akses Invite-Only (${targetRole})`,
    target: cleanEmail,
    notifType: 'task',
    notifIcon: '✉️',
    notifTitle: 'Undangan anggota baru didaftarkan',
    notifBody: `${actor?.name || 'Ketua Tim'} mendaftarkan ${cleanEmail} sebagai ${targetRole} (Menunggu Aktivasi).`,
    notifRoute: 'Manajemen Tim',
  });
  syncDerivedArrays();
  saveWorkspaceState();
  return { ok: true, user: newMember };
}

export function activateInvitedAccount({ email, fullName, password }) {
  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanName = String(fullName || '').trim();
  const cleanPassword = String(password || '');

  if (!cleanEmail) {
    return { ok: false, error: 'Email wajib diisi.' };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return { ok: false, error: 'Format email tidak valid.' };
  }

  const matched = usersData.find(u => u.email.toLowerCase() === cleanEmail);
  if (!matched) {
    return { ok: false, error: 'Email belum terdaftar. Hubungi Ketua Tim untuk mendapatkan akses.' };
  }
  if (matched.status === MEMBER_STATUSES.ACTIVE) {
    return { ok: false, error: 'Email ini sudah aktif. Silakan masuk melalui tab Sign In (Masuk).' };
  }
  if (matched.status !== MEMBER_STATUSES.PENDING) {
    return { ok: false, error: 'Akses akun ini sedang dinonaktifkan. Hubungi Ketua Tim.' };
  }

  if (!cleanName || cleanName.length < 2) {
    return { ok: false, error: 'Nama lengkap wajib diisi (minimal 2 karakter).' };
  }
  if (cleanPassword.length < 6) {
    return { ok: false, error: 'Buat kata sandi baru minimal 6 karakter.' };
  }

  matched.name = cleanName;
  matched.initials = initialsFromName(cleanName);
  matched.demoPassword = cleanPassword;
  matched.status = MEMBER_STATUSES.ACTIVE;
  matched.isPendingName = false;
  matched.joined = formatJoinMonthId();

  pushActivityAndNotification({
    actor: { name: cleanName, avatar: matched.initials, avatarClass: matched.avatarClass },
    action: `mengaktifkan akun baru (${matched.role})`,
    target: cleanEmail,
    notifType: 'approval',
    notifIcon: '✅',
    notifTitle: 'Anggota baru mengaktifkan akun',
    notifBody: `${cleanName} (${cleanEmail}) aktif sebagai ${matched.role}.`,
    notifRoute: 'Manajemen Tim',
  });
  syncDerivedArrays();
  saveWorkspaceState();
  return { ok: true, user: matched };
}

export function removeTeamMember(userId) {
  const idx = usersData.findIndex(u => u.id === userId);
  if (idx === -1) {
    return { ok: false, error: 'Anggota tidak ditemukan.' };
  }
  const target = usersData[idx];
  if (currentUser && currentUser.email.toLowerCase() === target.email.toLowerCase()) {
    return { ok: false, error: 'Akun Ketua Tim yang sedang login tidak dapat dihapus.' };
  }

  usersData.splice(idx, 1);

  const fallbackCw = usersData.find(u => u.status === MEMBER_STATUSES.ACTIVE && u.role === ROLES.COPYWRITER)?.name
    || usersData.find(u => u.status === MEMBER_STATUSES.ACTIVE)?.name
    || 'Helza';
  const fallbackEd = usersData.find(u => u.status === MEMBER_STATUSES.ACTIVE && u.role === ROLES.EDITOR)?.name
    || usersData.find(u => u.status === MEMBER_STATUSES.ACTIVE)?.name
    || 'Helza';

  contentItems.forEach(item => {
    if (item.assigneeCopywriter === target.name) item.assigneeCopywriter = fallbackCw;
    if (item.assigneeEditor === target.name) item.assigneeEditor = fallbackEd;
  });

  const actor = getCurrentUser();
  pushActivityAndNotification({
    actor,
    action: 'menghapus anggota dari tim',
    target: `${target.name} (${target.email})`,
  });
  syncDerivedArrays();
  saveWorkspaceState();
  return { ok: true, removed: target };
}

export function updateMemberRoleAndStatus(userId, newRole, newStatus) {
  const user = usersData.find(u => u.id === userId);
  if (!user) return null;
  if (availableRoles.includes(newRole)) user.role = newRole;
  if (newStatus) user.status = newStatus;

  if (currentUser && currentUser.email.toLowerCase() === user.email.toLowerCase()) {
    currentUser = buildSessionUser(user);
    saveSessionState(currentUser);
  }
  syncDerivedArrays();
  saveWorkspaceState();
  return user;
}

// ─────────────────────────────────────────────────────────────────────────────
// Dokumen SOT Ringkas & Navigasi Sidebar
// ─────────────────────────────────────────────────────────────────────────────

export const sotDocs = {
  PRD: {
    id: 'PRD',
    filename: 'PRD.md',
    title: 'Product Requirements Document',
    version: 'v0.3',
    status: 'SOT RBAC & Invite-Only',
    subtitle: 'Tujuan produk, Ketua Tim sebagai Super Admin, Invite-Only & Aktivasi Akun, dan alur konten lintas peran.',
    bullets: [
      'Auth 2 tab: Sign In (Email & Kata Sandi) dan Aktivasi Akun (Email, Nama Lengkap, Buat Kata Sandi Baru) tanpa dropdown role.',
      'Ketua Tim sebagai Super Admin penuh: kelola Manajemen Tim (invite, ubah role, hapus anggota) dan seluruh konten.',
      'Anggota baru didaftarkan Ketua Tim berstatus "Menunggu Aktivasi", lalu aktif setelah aktivasi akun.',
      'Manajemen Tim serta Laporan disembunyikan dan diblokir bagi Copywriter dan Editor.',
    ],
  },
  UI: {
    id: 'UI',
    filename: 'UI_GUIDELINE.md',
    title: 'UI Guideline — Design System',
    version: 'v0.1',
    status: 'Merah · Gold',
    subtitle: 'Arah visual, design tokens, komponen UI, interaksi, dan aksesibilitas.',
    bullets: [
      'Palet tema Merah (#B91C1C / #4A0D12), Gold (#C99312 / #F5B82E), dan Putih (#FFFFFF).',
      'Canvas #FAF6F4, Surface #FFFFFF, Elevated #FFFBF8, Ink #2A1215.',
      'Radius 18–20px (kartu/panel), 11px (kontrol), 999px (pill).',
      'Status selalu memakai teks dan indikator warna dengan kontras WCAG AA.',
    ],
  },
  PLAN: {
    id: 'PLAN',
    filename: 'IMPLEMENTATION_PLAN.md',
    title: 'Implementation Plan',
    version: 'v0.3',
    status: 'Fase 5 Aktif',
    subtitle: 'Rencana eksekusi bertahap (Fase 0–5) hingga Invite-Only RBAC dan aktivasi lokal.',
    bullets: [
      'Fase 0–4 — Persetujuan SOT, Fondasi, Operasional, Workspace Pendukung, Tema Merah · Gold (Selesai)',
      'Fase 5 — Auth 2-Tab (Sign In & Aktivasi Akun), Manajemen Tim Invite-Only & RBAC (state/localStorage)',
      'Conditional rendering sidebar, tombol aksi, antrean konten & guard rute berbasis currentUser.role',
      'Gate wajib: uji build & validasi alur Invite-Only serta lintas peran sebelum persetujuan lanjut.',
    ],
  },
};

export const navigationItems = [
  { id: 'Overview',        label: 'Overview',        icon: '◫', category: 'main', phase: 1 },
  { id: 'Kalender konten', label: 'Kalender konten', icon: '▦', category: 'main', phase: 2 },
  { id: 'Alur produksi',   label: 'Alur produksi',   icon: '⇄', category: 'main', phase: 2 },
  { id: 'Manajemen tugas', label: 'Manajemen tugas', icon: '☷', category: 'main', phase: 2 },
  { id: 'Aset & file',     label: 'Aset & file',     icon: '▧', category: 'main', phase: 3 },
  { id: 'Notifikasi',      label: 'Notifikasi',      icon: '♧', category: 'main', badge: '4', phase: 3 },
  { id: 'Diskusi Tim',     label: 'Diskusi Tim',     icon: '💬', category: 'main', phase: 5 },
  { id: 'Laporan',         label: 'Laporan',         icon: '▥', category: 'main', phase: 3 },
  { id: 'Manajemen Tim',   label: 'Manajemen Tim',   icon: '♙', category: 'main', phase: 5 },
  { id: 'Dokumen SOT',     label: 'Dokumen SOT',     icon: '✳', category: 'sot',  phase: 1 },
];

// ─────────────────────────────────────────────────────────────────────────────
// Aset Dummy & Data Statistik Laporan
// ─────────────────────────────────────────────────────────────────────────────

export const assetsData = [
  { id: 'ast-01', name: 'Template_Carousel_YMQ_v3.psd', type: 'Desain',  size: '4.2 MB', project: 'Kuis interaktif tajwid praktis', uploader: 'Nadia Putri',  initials: 'NP', date: '14 Okt 2026', url: '#', tag: 'Desain' },
  { id: 'ast-02', name: 'RawFootage_WeekendClass.mp4',  type: 'Video',   size: '312 MB', project: 'Weekend class teaser bersama santri', uploader: 'Raka Pratama', initials: 'RP', date: '13 Okt 2026', url: '#', tag: 'Video' },
  { id: 'ast-03', name: 'Brief_Kurikulum_2027.docx',    type: 'Dokumen', size: '38 KB',  project: 'Update kurikulum 2027', uploader: 'Helza',        initials: 'HZ', date: '10 Okt 2026', url: '#', tag: 'Dokumen' },
  { id: 'ast-04', name: 'Thumbnail_BTS_Kajian.png',     type: 'Gambar',  size: '980 KB', project: 'Behind the scene persiapan kajian akbar', uploader: 'Nadia Putri', initials: 'NP', date: '15 Okt 2026', url: '#', tag: 'Gambar' },
  { id: 'ast-05', name: 'Panduan_Naskah_YMQ.docx',      type: 'Dokumen', size: '52 KB',  project: 'Testimoni alumni batch 12', uploader: 'Nadia Putri',  initials: 'NP', date: '12 Okt 2026', url: '#', tag: 'Dokumen' },
  { id: 'ast-06', name: 'Logo_Yayasan_YMQ_2026.ai',     type: 'Desain',  size: '1.8 MB', project: 'Brand Guidelines YMQ', uploader: 'Helza',        initials: 'HZ', date: '1 Sep 2026',  url: '#', tag: 'Desain' },
  { id: 'ast-07', name: 'Banner_FlashSale_Tahsin.png',  type: 'Gambar',  size: '2.1 MB', project: 'Flash sale kelas tahsin batch baru', uploader: 'Dimas Akbar', initials: 'DA', date: '16 Okt 2026', url: '#', tag: 'Gambar' },
  { id: 'ast-08', name: 'BGM_Tadabbur_Akustik.mp3',     type: 'Audio',   size: '8.4 MB', project: 'Refleksi pagi tadabbur Al-Mulk', uploader: 'Raka Pratama', initials: 'RP', date: '5 Okt 2026', url: '#', tag: 'Audio' },
];

export const reportPlatformData = [
  { platform: 'Instagram', planned: 22, done: 14, late: 2, rate: 64 },
  { platform: 'TikTok',    planned: 14, done:  8, late: 1, rate: 57 },
  { platform: 'YouTube',   planned: 12, done:  6, late: 1, rate: 50 },
];

export const reportMemberData = [
  { name: 'Helza (Ketua Tim)',        initials: 'HZ', avatarClass: 'av-sand',  done:  7, ontime: 7, late: 0, rate: 100 },
  { name: 'Nadia Putri (Copywriter)', initials: 'NP', avatarClass: 'av-sage',  done: 10, ontime: 9, late: 1, rate: 90 },
  { name: 'Raka Pratama (Editor)',    initials: 'RP', avatarClass: 'av-lav',   done:  9, ontime: 7, late: 2, rate: 78 },
  { name: 'Dimas Akbar (Copywriter)', initials: 'DA', avatarClass: 'av-taupe', done:  6, ontime: 5, late: 1, rate: 83 },
];

export const reportPeriodData = [
  { period: 'Jul 2026', total: 36, done: 28 },
  { period: 'Agu 2026', total: 40, done: 32 },
  { period: 'Sep 2026', total: 44, done: 30 },
  { period: 'Okt 2026', total: 48, done: 28 },
];

// Jalankan hidrasi awal (aman di browser maupun Node ESM check)
hydrateFromStorage();
