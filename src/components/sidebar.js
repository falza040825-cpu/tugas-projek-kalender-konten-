import {
  getCurrentUser,
  navigationItems,
  notificationsData,
  taskItems,
  canAccessRoute,
  isCopywriterQueueItem,
  isEditorQueueItem,
  ROLES,
} from '../data/mockData.js';
import { escapeHtml } from '../utils/helpers.js';

export function renderSidebar(currentRoute, isCollapsed = false) {
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
  const userAvatar = user?.avatar || 'SF';

  const unreadCount = notificationsData.filter(n => !n.read).length;

  let pendingTasksCount = 0;
  if (role === ROLES.COPYWRITER) {
    pendingTasksCount = taskItems.filter(isCopywriterQueueItem).length;
  } else if (role === ROLES.EDITOR) {
    pendingTasksCount = taskItems.filter(isEditorQueueItem).length;
  } else {
    pendingTasksCount = taskItems.filter(t => !['Siap Tayang', 'Dipublikasikan'].includes(t.status)).length;
  }

  return `
    <aside
      class="sidebar ${isCollapsed ? 'collapsed' : ''}"
      id="sidebar"
      aria-label="Navigasi utama"
      data-collapsed="${isCollapsed ? 'true' : 'false'}"
    >
      <!-- Glass Ambient Glow Reflection -->
      <div class="glass-ambient-glow" aria-hidden="true"></div>

      <!-- Header: Logo, Brand & Circular Toggle Button -->
      <div class="glass-header">
        <div class="brand">
          <div class="brand-mark" aria-hidden="true">SF</div>
          <div class="brand-info">
            <strong>StudioFlow</strong>
            <small>${escapeHtml(workspaceName)}</small>
          </div>
        </div>

        <button
          type="button"
          class="glass-toggle-btn"
          id="btn-sidebar-toggle"
          title="${isCollapsed ? 'Perluas sidebar (⌘B)' : 'Ciutkan sidebar (⌘B)'}"
          aria-label="${isCollapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}"
        >
          <span class="toggle-icon" aria-hidden="true">${isCollapsed ? '›' : '‹'}</span>
          <span class="sidebar-tooltip" role="tooltip">${isCollapsed ? 'Expand ⌘B' : 'Collapse ⌘B'}</span>
        </button>
      </div>

      <!-- In-Sidebar Glassy Search Pill (Expanded & Collapsed) -->
      <div class="sidebar-search-wrap">
        <button
          type="button"
          class="sidebar-search-pill"
          id="btn-sidebar-search"
          title="Pencarian cepat (⌘K)"
          aria-label="Buka pencarian global"
        >
          <span class="sidebar-search-icon" aria-hidden="true">⌕</span>
          <span class="sidebar-search-text">Cari menu, tugas...</span>
          <kbd class="sidebar-search-kbd" aria-hidden="true">⌘K</kbd>
          <span class="sidebar-tooltip" role="tooltip">Cari ⌘K</span>
        </button>
      </div>

      <!-- Navigation Menu -->
      <div class="sidebar-scroll-area">
        <div class="sidebar-section-label">MENU UTAMA</div>
        <nav class="nav-menu" aria-label="Menu utama">
          ${mainItems.map(item => {
            let badge = item.badge;
            if (item.id === 'Notifikasi') {
              badge = unreadCount > 0 ? String(unreadCount) : null;
            } else if (item.id === 'Manajemen tugas' && pendingTasksCount > 0) {
              badge = String(pendingTasksCount);
            }

            const isActive = currentRoute === item.id;
            return `
              <button
                type="button"
                class="nav-item ${isActive ? 'active' : ''}"
                data-route="${escapeHtml(item.id)}"
                title="${escapeHtml(item.label)}${badge ? ` (${badge})` : ''}"
                aria-label="Navigasi ke ${escapeHtml(item.label)}"
                aria-current="${isActive ? 'page' : 'false'}"
              >
                <span class="nav-icon-wrap">
                  <span class="nav-icon" aria-hidden="true">${item.icon}</span>
                  ${badge ? `<span class="nav-dot-badge" aria-label="${escapeHtml(badge)} item"></span>` : ''}
                </span>
                <span class="nav-label">${escapeHtml(item.label)}</span>
                ${badge ? `<span class="nav-badge" aria-label="${escapeHtml(badge)} item">${escapeHtml(badge)}</span>` : ''}
                <span class="sidebar-tooltip" role="tooltip">${escapeHtml(item.label)}${badge ? ` (${badge})` : ''}</span>
              </button>
            `;
          }).join('')}
        </nav>

        <!-- Divider line -->
        <div class="sidebar-divider" aria-hidden="true"></div>

        ${sotItem ? `
          <div class="sidebar-section-label">DOKUMEN SOT</div>
          <nav class="nav-menu" aria-label="Dokumen SOT">
            <button
              type="button"
              class="nav-item ${currentRoute === sotItem.id ? 'active' : ''}"
              data-route="${escapeHtml(sotItem.id)}"
              title="${escapeHtml(sotItem.label)}"
              aria-label="Navigasi ke ${escapeHtml(sotItem.label)}"
              aria-current="${currentRoute === sotItem.id ? 'page' : 'false'}"
            >
              <span class="nav-icon-wrap">
                <span class="nav-icon" aria-hidden="true">${sotItem.icon}</span>
              </span>
              <span class="nav-label">${escapeHtml(sotItem.label)}</span>
              <span class="sidebar-tooltip" role="tooltip">${escapeHtml(sotItem.label)}</span>
            </button>
          </nav>
        ` : ''}

        <!-- Glassy Workspace Status Summary Card -->
        <div class="sidebar-promo-card">
          <div class="promo-top-row">
            <span class="promo-badge">StudioFlow RBAC</span>
            <span class="promo-dot-live" title="Status Aktif"></span>
          </div>
          <strong class="promo-title">Ruang Kerja YMQ</strong>
          <p class="promo-desc">Simulasi multi-peran &amp; alur produksi konten terintegrasi.</p>
          <button type="button" class="promo-btn" data-route="Dokumen SOT">
            Lihat Panduan SOT →
          </button>
        </div>
      </div>

      <!-- Bottom: User Profile & Logout -->
      <div class="sidebar-bottom">
        <div class="user-profile">
          <div class="user-avatar-wrap">
            <div class="user-avatar" aria-hidden="true">${escapeHtml(userAvatar)}</div>
            <span class="avatar-status-dot" title="Online"></span>
          </div>
          <div class="user-info">
            <strong>${escapeHtml(userName)}</strong>
            <small>${escapeHtml(role)}</small>
          </div>
          <button
            type="button"
            id="btn-sidebar-logout"
            class="sidebar-logout-btn"
            title="Keluar / Ganti Akun"
            aria-label="Keluar atau ganti akun"
          >
            ⏻
            <span class="sidebar-tooltip" role="tooltip">Keluar</span>
          </button>
        </div>
      </div>
    </aside>
  `;
}
