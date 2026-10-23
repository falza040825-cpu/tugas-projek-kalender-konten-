import { currentUser, navigationItems, notificationsData } from '../data/mockData.js';

export function renderSidebar(currentRoute) {
  const mainItems = navigationItems.filter(item => item.category === 'main');
  const sotItem   = navigationItems.find(item => item.category === 'sot');

  return `
    <aside class="sidebar" id="sidebar" aria-label="Navigasi utama">
      <div class="brand">
        <div class="brand-mark">s.</div>
        <div class="brand-info">
          <strong>studioflow</strong>
          <small>CONTENT OPERATIONS</small>
        </div>
      </div>

      <div class="sidebar-section-label">WORKSPACE</div>
      <div class="workspace-select">
        <span class="workspace-dot"></span>
        <span>${currentUser.workspace}</span>
        <span class="chevron">⌄</span>
      </div>

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
              class="nav-item ${currentRoute === item.id ? 'active' : ''}"
              data-route="${item.id}"
              aria-label="Navigasi ke ${item.label}"
              aria-current="${currentRoute === item.id ? 'page' : 'false'}"
            >
              <span class="nav-icon" aria-hidden="true">${item.icon}</span>
              <span>${item.label}</span>
              ${badge ? `<span class="nav-badge" aria-label="${badge} item baru">${badge}</span>` : ''}
            </button>
          `;
          }).join('')}
      </nav>

      <div class="sidebar-bottom">
        ${sotItem ? `
          <div class="sidebar-section-label" style="margin-top:16px;">DOKUMEN SOT</div>
          <nav class="nav-menu" aria-label="Dokumen SOT">
            <button
              class="nav-item ${currentRoute === sotItem.id ? 'active' : ''}"
              data-route="${sotItem.id}"
              aria-label="Navigasi ke ${sotItem.label}"
              aria-current="${currentRoute === sotItem.id ? 'page' : 'false'}"
            >
              <span class="nav-icon" aria-hidden="true">${sotItem.icon}</span>
              <span>${sotItem.label}</span>
            </button>
          </nav>
        ` : ''}

        <div class="user-profile" style="margin-top:16px;">
          <div class="user-avatar" aria-hidden="true">${currentUser.avatar}</div>
          <div class="user-info">
            <strong>${currentUser.name}</strong>
            <small>${currentUser.role}</small>
          </div>
          <span class="dots" aria-hidden="true">• • •</span>
        </div>
      </div>
    </aside>
  `;
}
