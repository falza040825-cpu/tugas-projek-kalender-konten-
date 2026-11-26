/**
 * Yayasan Motivator Qur'an - Entry Point & Dynamic RBAC Application Shell Handler
 */

import './styles/tokens.css';
import './styles/layout.css';
import './styles/components.css';

import {
  calendarItems,
  pipelineItems,
  taskItems,
  assetsData,
  sotDocs,
  navigationItems,
  ROLES,
  getCurrentUser,
  canAccessRoute,
  quickSwitchRole,
  logoutCurrentUser,
  isCopywriterQueueItem,
  isEditorQueueItem,
} from './data/mockData.js';
import { escapeHtml } from './utils/helpers.js';
import { renderLogin, attachLoginEvents, resetAuthUiState } from './components/login.js';
import { renderSidebar } from './components/sidebar.js';
import { renderTopbar } from './components/topbar.js';
import { renderDashboard, attachDashboardEvents } from './components/dashboard.js';
import { renderPlaceholder } from './components/placeholder.js';
import { renderDocsView } from './components/docsView.js';
import { renderCalendar, attachCalendarEvents } from './components/calendar.js';
import { renderPipeline, attachPipelineEvents } from './components/pipeline.js';
import { renderTasks, attachTaskEvents } from './components/tasks.js';
import { renderUsers, attachUsersEvents } from './components/users.js';
import { renderAssets, attachAssetsEvents } from './components/assets.js';
import { renderNotifications, attachNotificationsEvents } from './components/notifications.js';
import { renderReports, attachReportsEvents } from './components/reports.js';
import { openNewContentModal } from './components/contentModal.js';

let state = {
  currentRoute: 'Overview',
  activeDocKey: 'PRD',
  sidebarOpen: false,
  sidebarCollapsed: (function() {
    try {
      return localStorage.getItem('ymq_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  })(),
  ambientDeep: (function() {
    try {
      return localStorage.getItem('ymq_ambient_deep') === 'true';
    } catch {
      return false;
    }
  })(),
  globalSearchQuery: '',
};

let toastTimer = null;
const appContainer = document.querySelector('#app');

function showToast(message) {
  const toastEl = document.querySelector('#toast');
  if (!toastEl) return;
  if (toastTimer) clearTimeout(toastTimer);
  toastEl.textContent = message;
  toastEl.classList.add('show');
  toastTimer = setTimeout(() => {
    toastEl.classList.remove('show');
  }, 3000);
}

function navigateTo(targetRoute, extraDocKey = null) {
  const user = getCurrentUser();
  if (!user) return;

  const normalizedRoute = targetRoute === 'Pengguna & akses' ? 'Manajemen Tim' : targetRoute;

  if (!canAccessRoute(user.role, normalizedRoute)) {
    state.currentRoute = 'Overview';
    state.sidebarOpen = false;
    renderApp();
    showToast(`Akses ditolak: menu "${normalizedRoute}" khusus untuk Ketua Tim.`);
    return;
  }

  if (extraDocKey) state.activeDocKey = extraDocKey;
  state.currentRoute = normalizedRoute;
  state.sidebarOpen = false;
  renderApp();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderApp() {
  const user = getCurrentUser();

  // Gerbang Autentikasi Simulasi: tampilkan 2-Tab Login / Aktivasi jika belum login
  if (!user) {
    appContainer.innerHTML = `
      ${renderLogin()}
      <div id="toast" class="toast-notification" role="status" aria-live="polite"></div>
      <div id="modal-container"></div>
    `;
    const rerenderLogin = (focusSelector = null) => {
      renderApp();
      if (focusSelector) {
        document.querySelector(focusSelector)?.focus();
      }
    };
    attachLoginEvents((loggedUser) => {
      state.currentRoute = 'Overview';
      state.globalSearchQuery = '';
      state.sidebarOpen = false;
      renderApp();
      showToast(`Selamat datang, ${loggedUser.name} · Peran terdeteksi: ${loggedUser.role}`);
    }, showToast, rerenderLogin);
    return;
  }

  // Guard Route RBAC: pastikan rute saat ini diizinkan untuk peran aktif
  if (!canAccessRoute(user.role, state.currentRoute)) {
    state.currentRoute = 'Overview';
  }

  let contentHtml = '';
  if (state.currentRoute === 'Overview') {
    contentHtml = renderDashboard();
  } else if (state.currentRoute === 'Dokumen SOT') {
    contentHtml = renderDocsView(state.activeDocKey);
  } else if (state.currentRoute === 'Kalender konten') {
    contentHtml = renderCalendar();
  } else if (state.currentRoute === 'Alur produksi') {
    contentHtml = renderPipeline();
  } else if (state.currentRoute === 'Manajemen tugas') {
    contentHtml = renderTasks();
  } else if (state.currentRoute === 'Manajemen Tim') {
    contentHtml = renderUsers();
  } else if (state.currentRoute === 'Aset & file') {
    contentHtml = renderAssets();
  } else if (state.currentRoute === 'Notifikasi') {
    contentHtml = renderNotifications();
  } else if (state.currentRoute === 'Laporan') {
    contentHtml = renderReports();
  } else {
    contentHtml = renderPlaceholder(state.currentRoute);
  }

  const baseUrl = (import.meta.env && import.meta.env.BASE_URL) ? import.meta.env.BASE_URL : './';
  const studioBgUrl = `${baseUrl}studio-bg.jpg`;

  appContainer.innerHTML = `
    <div class="app-shell ${state.ambientDeep ? 'ambient-deep' : ''}" style="background-image: url('${studioBgUrl}');">
      ${renderSidebar(state.currentRoute, state.sidebarCollapsed)}
      <div id="sidebar-backdrop" style="display:none;position:fixed;inset:0;background:rgba(15,14,13,0.6);backdrop-filter:blur(6px);z-index:15;" aria-hidden="true"></div>
      <main class="main-area" id="main-content">
        ${renderTopbar(state.currentRoute, state.globalSearchQuery, state.ambientDeep)}
        <div class="page-content spatial-enter" id="page-content" data-route-view="${escapeHtml(state.currentRoute)}">
          ${contentHtml}
        </div>
      </main>
    </div>
    <div id="toast" class="toast-notification" role="status" aria-live="polite"></div>
    <div id="modal-container"></div>
  `;

  const sidebarEl = document.querySelector('#sidebar');
  const backdropEl = document.querySelector('#sidebar-backdrop');
  if (sidebarEl && state.sidebarOpen) {
    sidebarEl.classList.add('open');
    if (backdropEl) backdropEl.style.display = 'block';
  }

  attachEventListeners();

  if (state.currentRoute === 'Overview') {
    attachDashboardEvents(renderApp, showToast);
  } else if (state.currentRoute === 'Kalender konten') {
    attachCalendarEvents(renderApp, showToast);
  } else if (state.currentRoute === 'Alur produksi') {
    attachPipelineEvents(renderApp, showToast);
  } else if (state.currentRoute === 'Manajemen tugas') {
    attachTaskEvents(renderApp, showToast);
  } else if (state.currentRoute === 'Manajemen Tim') {
    attachUsersEvents(renderApp, showToast);
  } else if (state.currentRoute === 'Aset & file') {
    attachAssetsEvents(renderApp, showToast);
  } else if (state.currentRoute === 'Notifikasi') {
    attachNotificationsEvents(renderApp, showToast);
  } else if (state.currentRoute === 'Laporan') {
    attachReportsEvents(renderApp, showToast);
  }
}

function isItemVisibleForRole(item, role) {
  if (role === ROLES.COPYWRITER) return isCopywriterQueueItem(item);
  if (role === ROLES.EDITOR) return isEditorQueueItem(item);
  return true;
}

function findGlobalResults(query) {
  const user = getCurrentUser();
  if (!query || !user) return [];
  const role = user.role;
  const q = query.toLowerCase();
  const results = [];

  taskItems.forEach(t => {
    if (!isItemVisibleForRole(t, role)) return;
    if (t.title.toLowerCase().includes(q) || t.project.toLowerCase().includes(q) || t.assignee.toLowerCase().includes(q)) {
      results.push({ type: 'Tugas', title: t.title, meta: `${t.assignee} · ${t.status}`, route: 'Manajemen tugas' });
    }
  });

  calendarItems.forEach(c => {
    if (!isItemVisibleForRole(c, role)) return;
    if ((c.title.toLowerCase().includes(q) || c.platform.toLowerCase().includes(q) || c.category.toLowerCase().includes(q)) &&
        !results.some(r => r.title === c.title && r.type === 'Tugas')) {
      results.push({ type: 'Kalender', title: c.title, meta: `${c.platform} · ${c.pubDate}`, route: 'Kalender konten' });
    }
  });

  pipelineItems.forEach(p => {
    if (!isItemVisibleForRole(p, role)) return;
    if (p.title.toLowerCase().includes(q) && !results.some(r => r.title === p.title)) {
      results.push({ type: 'Pipeline', title: p.title, meta: `${p.platform} · ${p.status}`, route: 'Alur produksi' });
    }
  });

  assetsData.forEach(a => {
    if (a.name.toLowerCase().includes(q) || a.project.toLowerCase().includes(q)) {
      results.push({ type: 'Aset', title: a.name, meta: `${a.type} · ${a.size}`, route: 'Aset & file' });
    }
  });

  Object.values(sotDocs).forEach(doc => {
    if (doc.title.toLowerCase().includes(q) || doc.filename.toLowerCase().includes(q) || doc.subtitle.toLowerCase().includes(q)) {
      results.push({ type: 'Dokumen SOT', title: doc.title, meta: doc.filename, route: 'Dokumen SOT', docKey: doc.id });
    }
  });

  navigationItems.forEach(nav => {
    if (canAccessRoute(role, nav.id) && nav.label.toLowerCase().includes(q)) {
      results.push({ type: 'Halaman', title: nav.label, meta: 'Navigasi menu', route: nav.id });
    }
  });

  return results.filter(r => canAccessRoute(role, r.route)).slice(0, 7);
}

function updateGlobalSearchDropdown(query) {
  const resultsEl = document.querySelector('#global-search-results');
  if (!resultsEl) return;

  const trimmed = query.trim();
  if (!trimmed) {
    resultsEl.innerHTML = '';
    resultsEl.classList.remove('open');
    return;
  }

  const matches = findGlobalResults(trimmed);
  if (matches.length === 0) {
    resultsEl.innerHTML = `<div class="global-search-empty">Tidak ditemukan hasil yang sesuai hak akses untuk "${escapeHtml(trimmed)}".</div>`;
    resultsEl.classList.add('open');
    return;
  }

  resultsEl.innerHTML = matches.map((m, idx) => `
    <button type="button" class="global-search-item" data-gs-idx="${idx}">
      <span class="global-search-tag">${escapeHtml(m.type)}</span>
      <span class="global-search-text">
        <strong>${escapeHtml(m.title)}</strong>
        <small>${escapeHtml(m.meta)}</small>
      </span>
    </button>
  `).join('');
  resultsEl.classList.add('open');

  resultsEl.querySelectorAll('.global-search-item').forEach((btn, i) => {
    btn.addEventListener('click', () => {
      const target = matches[i];
      if (!target) return;
      state.globalSearchQuery = '';
      navigateTo(target.route, target.docKey || null);
    });
  });
}

function handleLogout() {
  logoutCurrentUser();
  resetAuthUiState();
  state.currentRoute = 'Overview';
  state.globalSearchQuery = '';
  state.sidebarOpen = false;
  renderApp();
  showToast('Anda keluar dari sesi simulasi. Silakan masuk kembali.');
}

function attachEventListeners() {
  // Sidebar Expand / Collapse Toggle (Glassy Dock)
  const toggleCollapse = () => {
    state.sidebarCollapsed = !state.sidebarCollapsed;
    try {
      localStorage.setItem('ymq_sidebar_collapsed', String(state.sidebarCollapsed));
    } catch {}

    const sidebarEl = document.querySelector('#sidebar');
    if (sidebarEl) {
      sidebarEl.classList.toggle('collapsed', state.sidebarCollapsed);
      sidebarEl.setAttribute('data-collapsed', String(state.sidebarCollapsed));

      const toggleIcon = sidebarEl.querySelector('.toggle-icon');
      if (toggleIcon) toggleIcon.textContent = state.sidebarCollapsed ? '›' : '‹';

      const toggleBtn = sidebarEl.querySelector('#btn-sidebar-toggle');
      if (toggleBtn) {
        toggleBtn.title = state.sidebarCollapsed ? 'Perluas sidebar (⌘B)' : 'Ciutkan sidebar (⌘B)';
        toggleBtn.setAttribute('aria-label', state.sidebarCollapsed ? 'Perluas sidebar' : 'Ciutkan sidebar');
        const tt = toggleBtn.querySelector('.sidebar-tooltip');
        if (tt) tt.textContent = state.sidebarCollapsed ? 'Expand ⌘B' : 'Collapse ⌘B';
      }
    } else {
      renderApp();
    }
  };

  document.querySelector('#btn-sidebar-toggle')?.addEventListener('click', toggleCollapse);
  document.querySelector('#btn-sidebar-collapse')?.addEventListener('click', toggleCollapse);
  document.querySelector('#btn-sidebar-expand')?.addEventListener('click', toggleCollapse);

  // In-Sidebar Search Trigger
  const triggerGlobalSearch = () => {
    const searchInput = document.querySelector('#global-search');
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
  };
  document.querySelector('#btn-sidebar-search')?.addEventListener('click', triggerGlobalSearch);
  document.querySelector('#btn-sidebar-search-icon')?.addEventListener('click', triggerGlobalSearch);

  document.querySelector('#btn-workspace-select')?.addEventListener('click', () => {
    showToast('Workspace aktif: Tim Kreatif YMQ (prototipe lokal).');
  });

  document.querySelector('#btn-chart-period')?.addEventListener('click', () =>
    showToast('Pilih periode: simulasi UI. Grafik historis memerlukan backend.')
  );

  // Quick Switch Role Sementara (Topbar)
  document.querySelectorAll('[data-quick-role]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetRole = btn.dataset.quickRole;
      const previousRoute = state.currentRoute;
      const nextUser = quickSwitchRole(targetRole);
      if (!nextUser) return;

      const blocked = !canAccessRoute(nextUser.role, previousRoute);
      if (blocked) state.currentRoute = 'Overview';
      state.sidebarOpen = false;
      renderApp();

      if (blocked) {
        showToast(`Switch ke ${nextUser.role} (${nextUser.name}) — dialihkan ke Overview karena "${previousRoute}" khusus Ketua Tim.`);
      } else {
        showToast(`Quick Switch (Demo): aktif sebagai ${nextUser.name} · ${nextUser.role}`);
      }
    });
  });

  // Logout Topbar & Sidebar
  document.querySelector('#btn-logout')?.addEventListener('click', handleLogout);
  document.querySelector('#btn-sidebar-logout')?.addEventListener('click', handleLogout);

  // Spatial Ambient Mode Toggle (Topbar)
  document.querySelector('#btn-ambient-toggle')?.addEventListener('click', () => {
    state.ambientDeep = !state.ambientDeep;
    try {
      localStorage.setItem('ymq_ambient_deep', String(state.ambientDeep));
    } catch {}
    const shell = document.querySelector('.app-shell');
    const btn = document.querySelector('#btn-ambient-toggle');
    if (shell) shell.classList.toggle('ambient-deep', state.ambientDeep);
    if (btn) {
      btn.textContent = state.ambientDeep ? '☀' : '◐';
      btn.setAttribute('aria-pressed', String(state.ambientDeep));
      btn.title = state.ambientDeep ? 'Mode Kaca Hangat (Spatial Warm)' : 'Mode Fokus Gelap (Spatial Deep)';
    }
    showToast(state.ambientDeep ? 'Mode Spatial Deep aktif (fokus gelap).' : 'Mode Spatial Warm aktif (ruangan hangat).');
  });

  // Mobile Nav Toggle
  const toggleBtn = document.querySelector('#mobile-toggle');
  const sidebarEl = document.querySelector('#sidebar');
  if (toggleBtn && sidebarEl) {
    toggleBtn.addEventListener('click', () => {
      state.sidebarOpen = !state.sidebarOpen;
      sidebarEl.classList.toggle('open', state.sidebarOpen);
      const bd = document.querySelector('#sidebar-backdrop');
      if (bd) bd.style.display = state.sidebarOpen ? 'block' : 'none';
    });
  }

  const backdrop = document.querySelector('#sidebar-backdrop');
  if (backdrop) {
    backdrop.addEventListener('click', () => {
      state.sidebarOpen = false;
      sidebarEl?.classList.remove('open');
      backdrop.style.display = 'none';
    });
  }

  // Route Navigation Clicks (dengan guard RBAC)
  document.querySelectorAll('[data-route]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      navigateTo(btn.dataset.route);
    });
  });

  // SOT Document Selectors
  document.querySelectorAll('[data-doc-key]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      state.activeDocKey = btn.dataset.docKey;
      renderApp();
    });
  });

  // Global Search
  const searchInput = document.querySelector('#global-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.globalSearchQuery = e.target.value;
      updateGlobalSearchDropdown(state.globalSearchQuery);
    });
    searchInput.addEventListener('focus', () => {
      if (state.globalSearchQuery.trim()) {
        updateGlobalSearchDropdown(state.globalSearchQuery);
      }
    });
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        state.globalSearchQuery = '';
        searchInput.value = '';
        updateGlobalSearchDropdown('');
        searchInput.blur();
      }
    });
  }

  // Dashboard New Content Modal Action (Khusus Ketua Tim)
  document.querySelector('#btn-demo-new')?.addEventListener('click', () => {
    openNewContentModal(renderApp, showToast);
  });
}

document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    const searchInput = document.querySelector('#global-search');
    if (searchInput) {
      e.preventDefault();
      searchInput.focus();
      searchInput.select();
    }
  }
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
    e.preventDefault();
    const toggleBtn = document.querySelector('#btn-sidebar-toggle');
    if (toggleBtn) {
      toggleBtn.click();
    }
  }
});

document.addEventListener('click', (e) => {
  const wrap = document.querySelector('.topbar-search-wrap');
  const resultsEl = document.querySelector('#global-search-results');
  if (wrap && resultsEl && !wrap.contains(e.target)) {
    resultsEl.classList.remove('open');
  }
});

const toastStyle = document.createElement('style');
toastStyle.textContent = `
  .toast-notification {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 100;
    background-color: var(--color-ink);
    color: var(--color-surface);
    border: 1px solid rgba(201, 147, 18, 0.45);
    padding: 12px 18px;
    border-radius: var(--radius-control);
    font-size: 12px;
    font-weight: 600;
    box-shadow: var(--shadow-md);
    opacity: 0;
    transform: translateY(12px);
    pointer-events: none;
    transition: opacity 0.25s ease, transform 0.25s ease;
    max-width: min(420px, calc(100vw - 32px));
  }
  .toast-notification.show {
    opacity: 1;
    transform: translateY(0);
  }
`;
document.head.appendChild(toastStyle);

document.addEventListener('ymq:navigate', (e) => {
  const route = e.detail?.route;
  if (route) navigateTo(route);
});

renderApp();
