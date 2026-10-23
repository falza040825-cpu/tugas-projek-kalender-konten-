import { currentUser } from '../data/mockData.js';

export function renderTopbar(currentRoute) {
  return `
    <header class="topbar">
      <div class="topbar-left">
        <button class="mobile-nav-toggle" id="mobile-toggle" aria-label="Buka/tutup menu navigasi">
          ☰
        </button>
        <div class="breadcrumb" aria-label="Breadcrumb navigasi">
          Workspace <span>/</span> <b>${currentRoute}</b>
        </div>
      </div>

      <div class="topbar-right">
        <label class="topbar-search">
          <span aria-hidden="true">⌕</span>
          <input id="global-search" placeholder="Cari konten, tugas, SOT..." aria-label="Pencarian global" />
          <kbd aria-label="Pintasan keyboard Command K">⌘ K</kbd>
        </label>

        <button class="icon-button" data-route="Notifikasi" aria-label="Lihat notifikasi">
          ♧
          <span class="badge-dot" aria-hidden="true"></span>
        </button>

        <button class="role-badge-pill" data-route="Pengguna &amp; akses" title="Simulasi peran aktif — klik untuk lihat Pengguna &amp; Akses" aria-label="Peran aktif: ${currentUser.role} (simulasi)">
          ${currentUser.role} <span style="font-size:9px;opacity:0.55;margin-left:4px;font-weight:600;">DEMO</span>
        </button>
      </div>
    </header>
  `;
}
