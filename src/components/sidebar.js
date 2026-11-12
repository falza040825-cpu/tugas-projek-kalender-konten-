import {
  getCurrentUser,
  navigationItems,
  notificationsData,
  canAccessRoute,
} from '../data/mockData.js';
import { escapeHtml } from '../utils/helpers.js';

export function renderSidebar(currentRoute) {
  const user = getCurrentUser();
  const role = user?.role || 'Copywriter';
  const mainItems = navigationItems.filter(
    item => item.category === 'main' && canAccessRoute(role, item.id)
  );
  const sotItem = navigationItems.find(
    item => item.category === 'sot' && canAccessRoute(role, item.id)
  );

  const workspaceName = user?.workspace || 'Tim Kreatif YMQ';
  const userName = user?.name || 'Pengguna';
  const userAvatar = user?.avatar || 'MQ';

  return `
    <aside class="sidebar" id="sidebar" aria-label="Navigasi utama">
      <div class="brand">
        <div class="brand-mark">MQ</div>
        <div class="brand-info">
          <strong>Yayasan Motivator Qur'an</strong>
          <small>CONTENT OPERATIONS</small>
        </div>
      </div>

      <div class="sidebar-section-label">WORKSPACE</div>
      <button type="button" class="workspace-select" id="btn-workspace-select" aria-label="Workspace aktif: ${escapeHtml(workspaceName)} (mode demo)" style="width:100%;">
        <span class="workspace-dot"></span>
        <span>${escapeHtml(workspaceName)}</span>
        <span class="chevron">⌄</span>
      </button>

      <div class="sidebar-section-label">MENU UTAMA</div>
      <nav class="nav-menu" aria-label="Menu utama">
        ${mainItems.map(item => {
          let badge = item.badge;
          if (item.id === 'Notifikasi') {
            const unread = notificationsData.filter(n => !n.read).length;
            badge = unread > 0 ? String(unread) : null;
          }
          return `
            <button
              type="button"
              class="nav-item ${currentRoute === item.id ? 'active' : ''}"
              data-route="${escapeHtml(item.id)}"
              aria-label="Navigasi ke ${escapeHtml(item.label)}"
              aria-current="${currentRoute === item.id ? 'page' : 'false'}"
            >
              <span class="nav-icon" aria-hidden="true">${item.icon}</span>
              <span>${escapeHtml(item.label)}</span>
              ${badge ? `<span class="nav-badge" aria-label="${escapeHtml(badge)} item baru">${escapeHtml(badge)}</span>` : ''}
            </button>
          `;
        }).join('')}
      </nav>

      <div class="sidebar-bottom">
        ${sotItem ? `
          <div class="sidebar-section-label" style="margin-top:16px;">DOKUMEN SOT</div>
          <nav class="nav-menu" aria-label="Dokumen SOT">
            <button
              type="button"
              class="nav-item ${currentRoute === sotItem.id ? 'active' : ''}"
              data-route="${escapeHtml(sotItem.id)}"
              aria-label="Navigasi ke ${escapeHtml(sotItem.label)}"
              aria-current="${currentRoute === sotItem.id ? 'page' : 'false'}"
            >
              <span class="nav-icon" aria-hidden="true">${sotItem.icon}</span>
              <span>${escapeHtml(sotItem.label)}</span>
            </button>
          </nav>
        ` : ''}

        <div class="user-profile" style="margin-top:16px;">
          <div class="user-avatar" aria-hidden="true">${escapeHtml(userAvatar)}</div>
          <div class="user-info">
            <strong>${escapeHtml(userName)}</strong>
            <small>${escapeHtml(role)} (Simulasi)</small>
          </div>
          <button
            type="button"
            id="btn-sidebar-logout"
            class="sidebar-logout-btn"
            title="Keluar dari akun simulasi"
            aria-label="Keluar"
          >
            ⏻
          </button>
        </div>
      </div>
    </aside>
  `;
}
