/**
 * StudioFlow - Entry Point & Application Shell Handler
 * SOT Phase 1: Fondasi front-end
 */

import './styles/tokens.css';
import './styles/layout.css';
import './styles/components.css';

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

// Application State
let state = {
  currentRoute: 'Overview',
  activeDocKey: 'PRD',
  sidebarOpen: false
};

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
      <div id="sidebar-backdrop" style="display:none;position:fixed;inset:0;background:rgba(37,39,35,0.4);z-index:15;" aria-hidden="true"></div>
      <main class="main-area">
        ${renderTopbar(state.currentRoute)}
        <div class="page-content" id="page-content">
          ${contentHtml}
        </div>
      </main>
    </div>
    <div id="toast" class="toast-notification"></div>
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

  // Phase 2 event bindings
  if (state.currentRoute === 'Kalender konten') {
    attachCalendarEvents(renderApp, showToast);
  } else if (state.currentRoute === 'Alur produksi') {
    attachPipelineEvents(renderApp, showToast);
  } else if (state.currentRoute === 'Manajemen tugas') {
    attachTaskEvents(renderApp, showToast);
  }
  // Phase 3 event bindings
  else if (state.currentRoute === 'Pengguna & akses') {
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
  toastEl.textContent = message;
  toastEl.classList.add('show');
  setTimeout(() => {
    toastEl.classList.remove('show');
  }, 2600);
}

function attachEventListeners() {
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
      // show/hide backdrop
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
      state.sidebarOpen = false; // close drawer on mobile navigate
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

  // Global Search Input Demo Filter
  const searchInput = document.querySelector('#global-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      const taskRows = document.querySelectorAll('.task-row');
      taskRows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(query) ? 'grid' : 'none';
      });
    });
  }

  // Demo New Content Modal Action
  const btnDemoNew = document.querySelector('#btn-demo-new');
  if (btnDemoNew) {
    btnDemoNew.addEventListener('click', openDemoModal);
  }
}

function openDemoModal() {
  const modalContainer = document.querySelector('#modal-container');
  if (!modalContainer) return;

  modalContainer.innerHTML = `
    <div style="position: fixed; inset: 0; background: rgba(37,39,35,0.5); backdrop-filter: blur(4px); z-index: 50; display: grid; place-items: center; padding: 16px;">
      <div class="panel" style="width: min(480px, 100%); position: relative; background: var(--color-surface); box-shadow: var(--shadow-modal);">
        <button id="close-modal" style="position: absolute; right: 16px; top: 16px; font-size: 20px; color: var(--color-ink-muted);">✕</button>
        <span class="eyebrow">DEMO SIMULASI FORM</span>
        <h2 style="font-size: 20px; margin: 6px 0 10px;">Buat Konten Baru</h2>
        <p style="font-size: 12px; color: var(--color-ink-secondary); margin-bottom: 20px;">
          Form simulasi UI untuk Fase 1. Operasi simpan nyata memerlukan backend di masa mendatang.
        </p>
        
        <form id="demo-form" style="display: flex; flex-direction: column; gap: 14px;">
          <div>
            <label style="font-size: 11px; font-weight: 700; color: var(--color-ink-secondary); display: block; margin-bottom: 6px;">Judul Konten</label>
            <input required placeholder="Contoh: 5 Tips Belajar Produktif" style="width: 100%; height: 38px; border: 1px solid var(--color-border); border-radius: var(--radius-control); padding: 0 12px; font-size: 12px;" />
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div>
              <label style="font-size: 11px; font-weight: 700; color: var(--color-ink-secondary); display: block; margin-bottom: 6px;">Platform</label>
              <select style="width: 100%; height: 38px; border: 1px solid var(--color-border); border-radius: var(--radius-control); padding: 0 10px; font-size: 12px;">
                <option>Instagram</option>
                <option>TikTok</option>
                <option>YouTube</option>
              </select>
            </div>
            <div>
              <label style="font-size: 11px; font-weight: 700; color: var(--color-ink-secondary); display: block; margin-bottom: 6px;">Kategori</label>
              <select style="width: 100%; height: 38px; border: 1px solid var(--color-border); border-radius: var(--radius-control); padding: 0 10px; font-size: 12px;">
                <option>Edukasi</option>
                <option>Promosi</option>
                <option>Informasi</option>
                <option>Hiburan</option>
              </select>
            </div>
          </div>
          <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px; padding-top: 14px; border-top: 1px solid var(--color-border);">
            <button type="button" id="cancel-modal" class="btn-secondary">Batal</button>
            <button type="submit" class="btn-primary">Simpan (Simulasi)</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const closeModal = () => { modalContainer.innerHTML = ''; };
  document.querySelector('#close-modal')?.addEventListener('click', closeModal);
  document.querySelector('#cancel-modal')?.addEventListener('click', closeModal);
  document.querySelector('#demo-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    closeModal();
    showToast('Konten simulasi berhasil dibuat untuk sesi ini.');
  });
}

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

// Custom navigation event (used by Notifications page)
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

