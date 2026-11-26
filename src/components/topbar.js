import {
  getCurrentUser,
  notificationsData,
  availableRoles,
  ROLES,
} from '../data/mockData.js';
import { escapeHtml } from '../utils/helpers.js';

export function renderTopbar(currentRoute, globalSearchQuery = '', ambientDeep = false) {
  const user = getCurrentUser();
  const role = user?.role || 'Copywriter';
  const firstName = (user?.name || 'Tim').split(' ')[0];
  const unreadCount = notificationsData.filter(n => !n.read).length;
  const isKetua = role === ROLES.KETUA_TIM;
  const isOverview = currentRoute === 'Overview';

  return `
    <header class="topbar v7-topbar">
      <div class="topbar-left">
        <button type="button" class="mobile-nav-toggle v7-pill-icon" id="mobile-toggle" aria-label="Buka/tutup menu navigasi">
          ☰
        </button>

        <div class="v7-greeting-block">
          <div class="v7-greeting-row">
            <h2 class="v7-greeting-title">Halo, ${escapeHtml(firstName)}! <span aria-hidden="true">👋</span></h2>
            ${!isOverview ? `<span class="v7-route-chip">${escapeHtml(currentRoute)}</span>` : ''}
          </div>
          <div class="v7-greeting-sub">
            <span class="v7-live-dot" aria-hidden="true"></span>
            <span>${escapeHtml(role)} · Ruang Kerja Aktif Tim Kreatif YMQ</span>
          </div>
        </div>
      </div>

      <div class="topbar-right">
        <div class="quick-switch-wrap v7-glass-capsule" role="group" aria-label="Quick Switch Role sementara untuk pengujian">
          <span class="quick-switch-label">Switch:</span>
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
          <label class="topbar-search v7-search-pill">
            <span class="v7-search-ic" aria-hidden="true">⌕</span>
            <input
              id="global-search"
              type="search"
              value="${escapeHtml(globalSearchQuery)}"
              placeholder="Cari konten, tugas..."
              aria-label="Pencarian global"
              autocomplete="off"
            />
            <kbd aria-label="Pintasan keyboard Command K">⌘K</kbd>
          </label>
          <div id="global-search-results" class="global-search-results" role="region" aria-label="Hasil pencarian cepat"></div>
        </div>

        <button
          type="button"
          id="btn-ambient-toggle"
          class="icon-button v7-pill-icon"
          title="${ambientDeep ? 'Mode Kaca Hangat (Spatial Warm)' : 'Mode Fokus Gelap (Spatial Deep)'}"
          aria-label="Ganti nuansa latar spatial"
          aria-pressed="${ambientDeep ? 'true' : 'false'}"
        >
          ${ambientDeep ? '☀' : '◐'}
        </button>

        <button
          type="button"
          class="icon-button v7-pill-icon"
          data-route="Notifikasi"
          title="Notifikasi (${unreadCount} belum dibaca)"
          aria-label="Lihat notifikasi${unreadCount > 0 ? ` (${unreadCount} belum dibaca)` : ''}"
        >
          <span aria-hidden="true">🔔</span>
          ${unreadCount > 0 ? '<span class="badge-dot v7-orange-dot" aria-hidden="true"></span>' : ''}
        </button>

        ${isKetua ? `
          <button
            type="button"
            class="role-badge-pill v7-role-pill"
            data-route="Manajemen Tim"
            title="Kelola anggota tim & hak akses"
            aria-label="Peran aktif: ${escapeHtml(role)} — buka Manajemen Tim"
          >
            ${escapeHtml(role)} <span class="role-demo-tag">SUPER ADMIN</span>
          </button>
        ` : `
          <span
            class="role-badge-pill role-badge-static v7-role-pill"
            title="Peran aktif terdeteksi dari akun login (simulasi)"
            aria-label="Peran aktif: ${escapeHtml(role)}"
          >
            ${escapeHtml(role)}
          </span>
        `}

        <button type="button" class="btn-secondary btn-logout-topbar v7-logout-pill" id="btn-logout" aria-label="Keluar dari sesi login">
          Keluar
        </button>
      </div>
    </header>
  `;
}
