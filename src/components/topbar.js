import { currentUser, notificationsData } from '../data/mockData.js';
import { escapeHtml } from '../utils/helpers.js';

export function renderTopbar(currentRoute, globalSearchQuery = '') {
  const unreadCount = notificationsData.filter(n => !n.read).length;

  return `
    <header class="topbar">
      <div class="topbar-left">
        <button class="mobile-nav-toggle" id="mobile-toggle" aria-label="Buka/tutup menu navigasi">
          ☰
        </button>
        <div class="breadcrumb" aria-label="Breadcrumb navigasi">
          Workspace <span>/</span> <b>${escapeHtml(currentRoute)}</b>
        </div>
      </div>

      <div class="topbar-right">
        <div class="topbar-search-wrap">
          <label class="topbar-search">
            <span aria-hidden="true">⌕</span>
            <input
              id="global-search"
              type="search"
              value="${escapeHtml(globalSearchQuery)}"
              placeholder="Cari konten, tugas, SOT..."
              aria-label="Pencarian global"
              autocomplete="off"
            />
            <kbd aria-label="Pintasan keyboard Command K">⌘ K</kbd>
          </label>
          <div id="global-search-results" class="global-search-results" role="region" aria-label="Hasil pencarian cepat"></div>
        </div>

        <button class="icon-button" data-route="Notifikasi" aria-label="Lihat notifikasi${unreadCount > 0 ? ` (${unreadCount} belum dibaca)` : ''}">
          ♧
          ${unreadCount > 0 ? '<span class="badge-dot" aria-hidden="true"></span>' : ''}
        </button>

        <button class="role-badge-pill" data-route="Pengguna & akses" title="Simulasi peran aktif — klik untuk ubah peran di Pengguna & Akses" aria-label="Peran aktif: ${escapeHtml(currentUser.role)} (simulasi)">
          ${escapeHtml(currentUser.role)} <span style="font-size:9px;opacity:0.65;margin-left:4px;font-weight:700;">DEMO</span>
        </button>
      </div>
    </header>
  `;
}
