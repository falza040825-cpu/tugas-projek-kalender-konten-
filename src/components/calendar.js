/**
 * Kalender Konten — StudioFlow Fase 2
 * Tampilan bulanan/mingguan/harian · Filter platform, kategori, status
 */

import { calendarItems } from '../data/mockData.js';

// State lokal per sesi (tidak persist)
let calState = {
  view: 'monthly',       // 'monthly' | 'weekly' | 'daily'
  filterPlatform: 'Semua',
  filterCategory: 'Semua',
  filterStatus: 'Semua',
  focusDate: new Date('2026-10-16'),
};

// Semua nilai unik untuk filter
const PLATFORMS  = ['Semua', 'Instagram', 'TikTok', 'YouTube'];
const CATEGORIES = ['Semua', 'Edukasi', 'Promosi', 'Informasi', 'Hiburan'];
const STATUSES   = ['Semua', 'Ide', 'Naskah', 'Dalam proses', 'Review', 'Revisi', 'Siap tayang', 'Dipublikasikan', 'Terlambat'];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function applyFilters(items) {
  return items.filter(item => {
    const okP = calState.filterPlatform === 'Semua' || item.platform === calState.filterPlatform;
    const okC = calState.filterCategory === 'Semua' || item.category === calState.filterCategory;
    const okS = calState.filterStatus   === 'Semua' || item.status   === calState.filterStatus;
    return okP && okC && okS;
  });
}

function itemsOnDate(items, dateStr) {
  return items.filter(i => i.pubDate === dateStr);
}

function formatDateStr(d) {
  const yyyy = d.getFullYear();
  const mm   = String(d.getMonth() + 1).padStart(2, '0');
  const dd   = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function isTodayStr(dateStr) {
  return dateStr === '2026-10-16'; // referensi dummy "hari ini"
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-render: kartu konten mini di kalender
// ─────────────────────────────────────────────────────────────────────────────

function calCard(item) {
  return `
    <div class="cal-event ${item.statusClass}" title="${item.title} · ${item.platform} · ${item.status}">
      <span class="cal-event-dot"></span>
      <span class="cal-event-text">${item.title}</span>
    </div>
  `;
}

// ─────────────────────────────────────────────────────────────────────────────
// Tampilan Bulanan
// ─────────────────────────────────────────────────────────────────────────────

function renderMonthly(items) {
  const year  = calState.focusDate.getFullYear();
  const month = calState.focusDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = calState.focusDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  const dayNames = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];
  const headCells = dayNames.map(d => `<div class="cal-day-name">${d}</div>`).join('');

  let cells = '';
  // kosong sebelum hari pertama
  for (let i = 0; i < firstDay; i++) {
    cells += `<div class="cal-cell empty"></div>`;
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const dayItems = itemsOnDate(items, dateStr);
    const isToday = isTodayStr(dateStr);
    const events = dayItems.slice(0, 2).map(calCard).join('');
    const more = dayItems.length > 2 ? `<div class="cal-more">+${dayItems.length - 2} lagi</div>` : '';

    cells += `
      <div class="cal-cell ${isToday ? 'today' : ''}">
        <span class="cal-date-num ${isToday ? 'today-badge' : ''}">${d}</span>
        ${events}${more}
      </div>
    `;
  }

  return `
    <div class="cal-month-header">
      <button class="cal-nav-btn" id="cal-prev" aria-label="Bulan sebelumnya">←</button>
      <strong>${monthName}</strong>
      <button class="cal-nav-btn" id="cal-next" aria-label="Bulan berikutnya">→</button>
    </div>
    <div class="cal-grid-month">
      ${headCells}
      ${cells}
    </div>
  `;
}

// ─────────────────────────────────────────────────────────────────────────────
// Tampilan Mingguan (7 hari mulai dari Senin pekan ini)
// ─────────────────────────────────────────────────────────────────────────────

function renderWeekly(items) {
  const base = new Date(calState.focusDate);
  const dow = base.getDay() === 0 ? 6 : base.getDay() - 1; // Senin=0
  base.setDate(base.getDate() - dow);

  const dayNames = ['Sen','Sel','Rab','Kam','Jum','Sab','Min'];
  let cols = '';
  for (let i = 0; i < 7; i++) {
    const d = new Date(base);
    d.setDate(d.getDate() + i);
    const dateStr = formatDateStr(d);
    const dayItems = itemsOnDate(items, dateStr);
    const isToday = isTodayStr(dateStr);
    const events = dayItems.map(calCard).join('') || `<p class="cal-empty-day">—</p>`;

    cols += `
      <div class="cal-week-col ${isToday ? 'today' : ''}">
        <div class="cal-week-head">
          <span class="cal-day-label">${dayNames[i]}</span>
          <span class="cal-date-num ${isToday ? 'today-badge' : ''}">${d.getDate()}</span>
        </div>
        <div class="cal-week-body">${events}</div>
      </div>
    `;
  }

  const weekLabel = `Pekan ${base.getDate()}–${new Date(base.getFullYear(), base.getMonth(), base.getDate() + 6).getDate()} ${base.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`;

  return `
    <div class="cal-month-header">
      <button class="cal-nav-btn" id="cal-prev" aria-label="Pekan sebelumnya">←</button>
      <strong>${weekLabel}</strong>
      <button class="cal-nav-btn" id="cal-next" aria-label="Pekan berikutnya">→</button>
    </div>
    <div class="cal-grid-week">${cols}</div>
  `;
}

// ─────────────────────────────────────────────────────────────────────────────
// Tampilan Harian
// ─────────────────────────────────────────────────────────────────────────────

function renderDaily(items) {
  const dateStr = formatDateStr(calState.focusDate);
  const dayItems = itemsOnDate(items, dateStr);
  const dateLabel = calState.focusDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const rows = dayItems.length > 0
    ? dayItems.map(item => `
        <div class="cal-daily-row">
          <div class="cal-daily-time">Tayang</div>
          <div class="cal-daily-card">
            <div class="cal-daily-platform">${item.platform} · ${item.category}</div>
            <strong>${item.title}</strong>
            <div class="cal-daily-meta">
              <span class="status-pill ${item.statusClass}">${item.status}</span>
              <span class="assignee-chip">
                <span class="mini-avatar">${item.initials}</span> ${item.owner}
              </span>
            </div>
          </div>
        </div>
      `).join('')
    : `<div class="cal-empty-state">Tidak ada konten terjadwal pada hari ini.</div>`;

  return `
    <div class="cal-month-header">
      <button class="cal-nav-btn" id="cal-prev" aria-label="Hari sebelumnya">←</button>
      <strong>${dateLabel}</strong>
      <button class="cal-nav-btn" id="cal-next" aria-label="Hari berikutnya">→</button>
    </div>
    <div class="cal-daily-list">${rows}</div>
  `;
}

// ─────────────────────────────────────────────────────────────────────────────
// Render tabel ringkasan daftar konten
// ─────────────────────────────────────────────────────────────────────────────

function renderContentList(items) {
  if (items.length === 0) {
    return `<div class="cal-empty-state">Tidak ada konten yang cocok dengan filter aktif.</div>`;
  }
  return `
    <div class="content-list-table">
      <div class="content-list-head">
        <span>JUDUL KONTEN</span>
        <span>PLATFORM</span>
        <span>KATEGORI</span>
        <span>TGL PRODUKSI</span>
        <span>TGL TAYANG</span>
        <span>STATUS</span>
        <span>PEMILIK</span>
      </div>
      ${items.map(item => `
        <div class="content-list-row">
          <div class="content-list-title">${item.title}</div>
          <div><span class="platform-chip plat-${item.platform.toLowerCase()}">${item.platform}</span></div>
          <div class="cl-muted">${item.category}</div>
          <div class="cl-muted">${item.prodDate}</div>
          <div class="cl-muted ${item.status === 'Terlambat' ? 'cl-late' : ''}">${item.pubDate}</div>
          <div><span class="status-pill ${item.statusClass}">${item.status}</span></div>
          <div class="assignee">
            <span class="mini-avatar">${item.initials}</span>
            <span class="cl-muted">${item.owner}</span>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// ─────────────────────────────────────────────────────────────────────────────
// Render filter bar
// ─────────────────────────────────────────────────────────────────────────────

function filterBtn(id, values, active, label) {
  return `
    <div class="filter-group">
      <span class="filter-label">${label}</span>
      <div class="filter-pills" id="${id}">
        ${values.map(v => `
          <button class="filter-pill ${v === active ? 'active' : ''}" data-filter-group="${id}" data-filter-val="${v}">
            ${v}
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main render
// ─────────────────────────────────────────────────────────────────────────────

export function renderCalendar() {
  const filtered = applyFilters(calendarItems);

  let viewContent = '';
  if (calState.view === 'monthly') viewContent = renderMonthly(filtered);
  else if (calState.view === 'weekly') viewContent = renderWeekly(filtered);
  else viewContent = renderDaily(filtered);

  const activeFiltersCount = [
    calState.filterPlatform !== 'Semua',
    calState.filterCategory !== 'Semua',
    calState.filterStatus !== 'Semua',
  ].filter(Boolean).length;

  return `
    <div class="page-heading">
      <div>
        <div class="eyebrow">WORKSPACE / KALENDER KONTEN</div>
        <h1>Kalender Konten</h1>
        <p>Jadwal produksi dan publikasi konten tim · ${filtered.length} dari ${calendarItems.length} item</p>
      </div>
      <div style="display:flex;gap:10px;align-items:center;">
        ${activeFiltersCount > 0 ? `<button class="btn-secondary" id="cal-clear-filters">Hapus filter (${activeFiltersCount})</button>` : ''}
        <button class="btn-primary" id="btn-cal-new"><span>＋</span> Konten Baru (Demo)</button>
      </div>
    </div>

    <!-- View Toggle -->
    <div class="cal-view-toggle-bar">
      <div class="view-toggle-group" role="group" aria-label="Pilih tampilan kalender">
        <button class="view-toggle-btn ${calState.view === 'monthly' ? 'active' : ''}" id="cal-view-monthly" data-cal-view="monthly">Bulanan</button>
        <button class="view-toggle-btn ${calState.view === 'weekly'  ? 'active' : ''}" id="cal-view-weekly"  data-cal-view="weekly">Mingguan</button>
        <button class="view-toggle-btn ${calState.view === 'daily'   ? 'active' : ''}" id="cal-view-daily"   data-cal-view="daily">Harian</button>
      </div>
      <span class="filter-summary-chip" style="${activeFiltersCount === 0 ? 'opacity:0.4' : ''}">
        ${activeFiltersCount > 0 ? `${activeFiltersCount} filter aktif` : 'Tampil semua'}
      </span>
    </div>

    <!-- Filter Row -->
    <div class="panel" style="margin-bottom:20px; padding: 16px 20px;">
      <div class="filter-row">
        ${filterBtn('cal-filter-platform', PLATFORMS,  calState.filterPlatform, 'Platform')}
        ${filterBtn('cal-filter-category', CATEGORIES, calState.filterCategory, 'Kategori')}
        ${filterBtn('cal-filter-status',   STATUSES,   calState.filterStatus,   'Status')}
      </div>
    </div>

    <!-- Calendar View -->
    <div class="panel" style="margin-bottom:20px;">
      <div id="cal-view-container">
        ${viewContent}
      </div>
    </div>

    <!-- Content List Table -->
    <div class="panel" style="margin-bottom:20px;">
      <div class="panel-head">
        <div>
          <h2>Daftar Konten</h2>
          <p>Ringkasan semua item yang sesuai filter aktif</p>
        </div>
        <span class="demo-badge">DATA DUMMY</span>
      </div>
      ${renderContentList(filtered)}
    </div>

    <div class="demo-banner">
      <span class="demo-banner-icon">✳</span>
      <div class="demo-banner-content">
        <strong>Kalender Konten — Fase 2</strong>
        <p>Filter, tampilan, dan navigasi bekerja pada data dummy lokal. Tidak ada koneksi backend.</p>
      </div>
      <span class="demo-badge">FASE 2</span>
    </div>
  `;
}

// ─────────────────────────────────────────────────────────────────────────────
// Event binding (dipanggil setelah renderApp memasang HTML ke DOM)
// ─────────────────────────────────────────────────────────────────────────────

export function attachCalendarEvents(renderApp, showToast) {
  // View toggle
  document.querySelectorAll('[data-cal-view]').forEach(btn => {
    btn.addEventListener('click', () => {
      calState.view = btn.dataset.calView;
      renderApp();
    });
  });

  // Filter pills
  document.querySelectorAll('[data-filter-group]').forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.dataset.filterGroup;
      const val   = btn.dataset.filterVal;
      if (group === 'cal-filter-platform') calState.filterPlatform = val;
      if (group === 'cal-filter-category') calState.filterCategory = val;
      if (group === 'cal-filter-status')   calState.filterStatus   = val;
      renderApp();
    });
  });

  // Clear filters
  document.querySelector('#cal-clear-filters')?.addEventListener('click', () => {
    calState.filterPlatform = 'Semua';
    calState.filterCategory = 'Semua';
    calState.filterStatus   = 'Semua';
    renderApp();
  });

  // Nav prev/next
  document.querySelector('#cal-prev')?.addEventListener('click', () => {
    const d = new Date(calState.focusDate);
    if (calState.view === 'monthly') d.setMonth(d.getMonth() - 1);
    else if (calState.view === 'weekly') d.setDate(d.getDate() - 7);
    else d.setDate(d.getDate() - 1);
    calState.focusDate = d;
    renderApp();
  });

  document.querySelector('#cal-next')?.addEventListener('click', () => {
    const d = new Date(calState.focusDate);
    if (calState.view === 'monthly') d.setMonth(d.getMonth() + 1);
    else if (calState.view === 'weekly') d.setDate(d.getDate() + 7);
    else d.setDate(d.getDate() + 1);
    calState.focusDate = d;
    renderApp();
  });

  // New content button (demo modal)
  document.querySelector('#btn-cal-new')?.addEventListener('click', () => {
    showToast('Form tambah konten: tersedia di pipeline & dashboard (simulasi).');
  });
}
