import {
  getCurrentUser,
  notificationsData,
  availableRoles,
  ROLES,
} from '../data/mockData.js';
import { escapeHtml } from '../utils/helpers.js';

export function renderTopbar(currentRoute, globalSearchQuery = '') {
  const user = getCurrentUser();
  const role = user?.role || 'Copywriter';
  const unreadCount = notificationsData.filter(n => !n.read).length;
  const isKetua = role === ROLES.KETUA_TIM;

  return `
    <header class="topbar">
      <div class="topbar-left">
        <button type="button" class="mobile-nav-toggle" id="mobile-toggle" aria-label="Buka/tutup menu navigasi">
          ☰
        </button>
        <div class="breadcrumb" aria-label="Breadcrumb navigasi">
          Workspace <span>/</span> <b>${escapeHtml(currentRoute)}</b>
        </div>
      </div>

      <div class="topbar-right">
        <div class="quick-switch-wrap" role="group" aria-label="Quick Switch Role sementara untuk pengujian">
          <span class="quick-switch-label">Switch (Demo):</span>
          <div class="quick-switch-pills">
            ${availableRoles.map(r => `
              <button
                type="button"
                class="quick-switch-pill ${role === r ? 'active' : ''}"
                data-quick-role="${escapeHtml(r)}"
                aria-pressed="${role === r ? 'true' : 'false'}"
                title="Ganti cepat ke tampilan peran ${escapeHtml(r)}"
              >
                ${escapeHtml(r)}
              </button>
            `).join('')}
          </div>
        </div>

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

        <button type="button" class="icon-button" data-route="Notifikasi" aria-label="Lihat notifikasi${unreadCount > 0 ? ` (${unreadCount} belum dibaca)` : ''}">
          ♧
          ${unreadCount > 0 ? '<span class="badge-dot" aria-hidden="true"></span>' : ''}
        </button>

        ${isKetua ? `
          <button
            type="button"
            class="role-badge-pill"
            data-route="Manajemen Tim"
            title="Kelola anggota tim & hak akses"
            aria-label="Peran aktif: ${escapeHtml(role)} — buka Manajemen Tim"
          >
            ${escapeHtml(role)} <span class="role-demo-tag">SUPER ADMIN</span>
          </button>
        ` : `
          <span
            class="role-badge-pill role-badge-static"
            title="Peran aktif terdeteksi dari akun login (simulasi)"
            aria-label="Peran aktif: ${escapeHtml(role)}"
          >
            ${escapeHtml(role)}
          </span>
        `}

        <button type="button" class="btn-secondary btn-logout-topbar" id="btn-logout" aria-label="Keluar dari sesi login">
          Keluar
        </button>
      </div>
    </header>
  `;
}
