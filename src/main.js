/**
 * StudioFlow - Entry Point & Application Shell Handler
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
} from './data/mockData.js';
import { escapeHtml } from './utils/helpers.js';
import { renderSidebar } from './components/sidebar.js';
import { renderTopbar } from './components/topbar.js';
import { renderDashboard } from './components/dashboard.js';
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

// Application State
let state = {
  currentRoute: 'Overview',
  activeDocKey: 'PRD',
  sidebarOpen: false,
  globalSearchQuery: '',
};

let toastTimer = null;
const appContainer = document.querySelector('#app');

function renderApp() {
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
  } else if (state.currentRoute === 'Pengguna & akses') {
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

  appContainer.innerHTML = `
    <div class="app-shell">
      ${renderSidebar(state.currentRoute)}
      <div id="sidebar-backdrop" style="display:none;position:fixed;inset:0;background:rgba(74,13,18,0.45);z-index:15;" aria-hidden="true"></div>
      <main class="main-area">
        ${renderTopbar(state.currentRoute, state.globalSearchQuery)}
        <div class="page-content" id="page-content">
          ${contentHtml}
        </div>
      </main>
    </div>
    <div id="toast" class="toast-notification" role="status" aria-live="polite"></div>
    <div id="modal-container"></div>
  `;

  // Restore sidebar responsive state if opened
  const sidebarEl = document.querySelector('#sidebar');
  const backdropEl = document.querySelector('#sidebar-backdrop');
  if (sidebarEl && state.sidebarOpen) {
    sidebarEl.classList.add('open');
    if (backdropEl) backdropEl.style.display = 'block';
  }

  attachEventListeners();

  // Route-specific event bindings
  if (state.currentRoute === 'Kalender konten') {
    attachCalendarEvents(renderApp, showToast);
  } else if (state.currentRoute === 'Alur produksi') {
    attachPipelineEvents(renderApp, showToast);
  } else if (state.currentRoute === 'Manajemen tugas') {
    attachTaskEvents(renderApp, showToast);
  } else if (state.currentRoute === 'Pengguna & akses') {
    attachUsersEvents(renderApp, showToast);
  } else if (state.currentRoute === 'Aset & file') {
    attachAssetsEvents(renderApp, showToast);
  } else if (state.currentRoute === 'Notifikasi') {
    attachNotificationsEvents(renderApp, showToast);
  } else if (state.currentRoute === 'Laporan') {
    attachReportsEvents(renderApp, showToast);
  }
}

function showToast(message) {
  const toastEl = document.querySelector('#toast');
  if (!toastEl) return;
  if (toastTimer) clearTimeout(toastTimer);
  toastEl.textContent = message;
  toastEl.classList.add('show');
  toastTimer = setTimeout(() => {
    toastEl.classList.remove('show');
  }, 2800);
}

function findGlobalResults(query) {
  if (!query) return [];
  const q = query.toLowerCase();
  const results = [];

  calendarItems.forEach(c => {
    if (c.title.toLowerCase().includes(q) || c.platform.toLowerCase().includes(q) || c.category.toLowerCase().includes(q)) {
      results.push({ type: 'Kalender', title: c.title, meta: `${c.platform} · ${c.pubDate}`, route: 'Kalender konten' });
    }
  });

  taskItems.forEach(t => {
    if (t.title.toLowerCase().includes(q) || t.project.toLowerCase().includes(q) || t.assignee.toLowerCase().includes(q)) {
      results.push({ type: 'Tugas', title: t.title, meta: `${t.assignee} · ${t.status}`, route: 'Manajemen tugas' });
    }
  });

  pipelineItems.forEach(p => {
    if (p.title.toLowerCase().includes(q) && !results.some(r => r.title === p.title && r.type === 'Kalender')) {
      results.push({ type: 'Pipeline', title: p.title, meta: `${p.platform} · ${p.stage}`, route: 'Alur produksi' });
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
    if (nav.label.toLowerCase().includes(q)) {
      results.push({ type: 'Halaman', title: nav.label, meta: 'Navigasi menu', route: nav.id });
    }
  });

  return results.slice(0, 7);
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
    resultsEl.innerHTML = `<div class="global-search-empty">Tidak ditemukan hasil untuk "${escapeHtml(trimmed)}".</div>`;
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
      if (target.docKey) state.activeDocKey = target.docKey;
      state.currentRoute = target.route;
      state.sidebarOpen = false;
      renderApp();
    });
  });
}

function attachEventListeners() {
  // Workspace demo button
  document.querySelector('#btn-workspace-select')?.addEventListener('click', () => {
    showToast('Workspace aktif: Tim Kreatif SGQ (prototipe mendukung 1 workspace lokal).');
  });

  // Demo period picker
  const btnChartPeriod = document.querySelector('#btn-chart-period');
  if (btnChartPeriod) {
    btnChartPeriod.addEventListener('click', () =>
      showToast('Pilih periode: simulasi UI. Grafik per bulan memerlukan backend dan data historis.')
    );
  }

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

  // Mobile backdrop close sidebar
  const backdrop = document.querySelector('#sidebar-backdrop');
  if (backdrop) {
    backdrop.addEventListener('click', () => {
      state.sidebarOpen = false;
      sidebarEl?.classList.remove('open');
      backdrop.style.display = 'none';
    });
  }

  // Route Navigation Clicks
  document.querySelectorAll('[data-route]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const targetRoute = btn.dataset.route;
      state.currentRoute = targetRoute;
      state.sidebarOpen = false;
      renderApp();
      window.scrollTo({ top: 0, behavior: 'smooth' });
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

  // Global Search Input + Live Quick Results
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

  // Dashboard New Content Modal Action
  const btnDemoNew = document.querySelector('#btn-demo-new');
  if (btnDemoNew) {
    btnDemoNew.addEventListener('click', () => {
      openNewContentModal(renderApp, showToast);
    });
  }
}

// Global keyboard shortcut Cmd+K / Ctrl+K & outside click close search dropdown
document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    const searchInput = document.querySelector('#global-search');
    if (searchInput) {
      e.preventDefault();
      searchInput.focus();
      searchInput.select();
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

// Add Toast Style dynamically
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
  }
  .toast-notification.show {
    opacity: 1;
    transform: translateY(0);
  }
`;
document.head.appendChild(toastStyle);

// Custom navigation event (used by Notifications & Calendar detail modal)
document.addEventListener('studioflow:navigate', (e) => {
  const route = e.detail?.route;
  if (route) {
    state.currentRoute = route;
    state.sidebarOpen  = false;
    renderApp();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
});

// Initial App Render
renderApp();
