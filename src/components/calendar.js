/**
 * Kalender Konten — StudioFlow Fase 2 & QA Fase 4
 * Tampilan bulanan/mingguan/harian · Filter platform, kategori, status
 * Jadwal produksi & publikasi · Penanda jadwal berdekatan/terlambat
 */

import { calendarItems } from '../data/mockData.js';
import { openNewContentModal } from './contentModal.js';
import { escapeHtml } from '../utils/helpers.js';

// State lokal per sesi (tidak persist)
let calState = {
  view: 'monthly',       // 'monthly' | 'weekly' | 'daily'
  filterPlatform: 'Semua',
  filterCategory: 'Semua',
  filterStatus: 'Semua',
  focusDate: new Date(2026, 9, 16),
};

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

function formatWeekLabel(base) {
  const end = new Date(base.getFullYear(), base.getMonth(), base.getDate() + 6);
  if (base.getMonth() === end.getMonth() && base.getFullYear() === end.getFullYear()) {
    return `Pekan ${base.getDate()}–${end.getDate()} ${base.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`;
  }
  const startPart = base.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  const endPart   = end.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  return `Pekan ${startPart} – ${endPart}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-render: kartu konten mini di kalender
// ─────────────────────────────────────────────────────────────────────────────

function calCard(item) {
  const isLate = item.status === 'Terlambat';
  return `
    <button
      type="button"
      class="cal-event ${item.statusClass}"
      data-cal-id="${escapeHtml(item.id)}"
      title="${escapeHtml(item.title)} · ${escapeHtml(item.platform)} · ${escapeHtml(item.status)}"
      aria-label="${escapeHtml(item.title)}, ${escapeHtml(item.platform)}, status ${escapeHtml(item.status)}"
    >
      <span class="cal-event-dot" aria-hidden="true"></span>
      <span class="cal-event-text">${isLate ? '⚑ ' : ''}${escapeHtml(item.title)}</span>
    </button>
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
  for (let i = 0; i < firstDay; i++) {
    cells += `<div class="cal-cell empty"></div>`;
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const dayItems = itemsOnDate(items, dateStr);
    const isToday = isTodayStr(dateStr);
    const isDense = dayItems.length >= 2;
    const hasLate = dayItems.some(i => i.status === 'Terlambat');
    const events = dayItems.slice(0, 2).map(calCard).join('');
    const more = dayItems.length > 2 ? `<div class="cal-more">+${dayItems.length - 2} lagi</div>` : '';

    cells += `
      <div class="cal-cell ${isToday ? 'today' : ''} ${hasLate ? 'has-late' : ''}">
        <div class="cal-cell-top">
          <span class="cal-date-num ${isToday ? 'today-badge' : ''}">${d}</span>
          ${isDense ? `<span class="cal-dense-badge" title="Jadwal berdekatan (${dayItems.length} item)">${dayItems.length} jadwal</span>` : ''}
        </div>
        ${events}${more}
      </div>
    `;
  }

  return `
    <div class="cal-month-header">
      <button type="button" class="cal-nav-btn" id="cal-prev" aria-label="Bulan sebelumnya">←</button>
      <div style="text-align:center;">
        <strong>${monthName}</strong>
        <div style="font-size:10px;color:var(--color-ink-muted);font-weight:500;">Referensi hari ini (demo): 16 Okt 2026</div>
      </div>
      <button type="button" class="cal-nav-btn" id="cal-next" aria-label="Bulan berikutnya">→</button>
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
          ${dayItems.length >= 2 ? `<span class="cal-dense-badge">${dayItems.length} jadwal</span>` : ''}
        </div>
        <div class="cal-week-body">${events}</div>
      </div>
    `;
  }

  return `
    <div class="cal-month-header">
      <button type="button" class="cal-nav-btn" id="cal-prev" aria-label="Pekan sebelumnya">←</button>
      <strong>${formatWeekLabel(base)}</strong>
      <button type="button" class="cal-nav-btn" id="cal-next" aria-label="Pekan berikutnya">→</button>
    </div>
    <div class="cal-grid-week">${cols}</div>
  `;
}

// ─────────────────────────────────────────────────────────────────────────────
// Tampilan Harian (Menampilkan Jadwal Produksi & Publikasi)
// ─────────────────────────────────────────────────────────────────────────────

function renderDaily(items) {
  const dateStr = formatDateStr(calState.focusDate);
  const pubItems  = items.filter(i => i.pubDate === dateStr).map(i => ({ ...i, slotType: 'Publikasi' }));
  const prodItems = items.filter(i => i.prodDate === dateStr && i.pubDate !== dateStr).map(i => ({ ...i, slotType: 'Produksi' }));
  const dayItems  = [...pubItems, ...prodItems];
  const dateLabel = calState.focusDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const rows = dayItems.length > 0
    ? dayItems.map(item => `
        <div class="cal-daily-row">
          <div class="cal-daily-time">${item.slotType}</div>
          <div class="cal-daily-card">
            <div class="cal-daily-platform">${escapeHtml(item.platform)} · ${escapeHtml(item.category)}</div>
            <strong>${escapeHtml(item.title)}</strong>
            <div class="cal-daily-meta">
              <span class="status-pill ${item.statusClass}">${item.status === 'Terlambat' ? '⚑ ' : ''}${escapeHtml(item.status)}</span>
              <span class="assignee-chip">
                <span class="mini-avatar">${escapeHtml(item.initials)}</span> ${escapeHtml(item.owner)}
              </span>
              <button type="button" class="btn-secondary cal-detail-trigger" data-cal-id="${escapeHtml(item.id)}" style="margin-left:auto;padding:4px 10px;font-size:11px;">Detail</button>
            </div>
          </div>
        </div>
      `).join('')
    : `<div class="cal-empty-state">Tidak ada jadwal produksi atau publikasi pada hari ini.</div>`;

  return `
    <div class="cal-month-header">
      <button type="button" class="cal-nav-btn" id="cal-prev" aria-label="Hari sebelumnya">←</button>
      <strong>${dateLabel}</strong>
      <button type="button" class="cal-nav-btn" id="cal-next" aria-label="Hari berikutnya">→</button>
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
          <div class="content-list-title">${escapeHtml(item.title)}</div>
          <div><span class="platform-chip plat-${item.platform.toLowerCase()}">${escapeHtml(item.platform)}</span></div>
          <div class="cl-muted" data-label="Kategori">${escapeHtml(item.category)}</div>
          <div class="cl-muted" data-label="Produksi">${escapeHtml(item.prodDate)}</div>
          <div class="cl-muted ${item.status === 'Terlambat' ? 'cl-late' : ''}" data-label="Tayang">${escapeHtml(item.pubDate)}</div>
          <div><span class="status-pill ${item.statusClass}">${item.status === 'Terlambat' ? '⚑ ' : ''}${escapeHtml(item.status)}</span></div>
          <div class="assignee">
            <span class="mini-avatar">${escapeHtml(item.initials)}</span>
            <span class="cl-muted">${escapeHtml(item.owner)}</span>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// ─────────────────────────────────────────────────────────────────────────────
// Modal Detail Item Kalender
// ─────────────────────────────────────────────────────────────────────────────

function openCalendarDetailModal(item) {
  const modalContainer = document.querySelector('#modal-container');
  if (!modalContainer || !item) return;

  modalContainer.innerHTML = `
    <div class="modal-backdrop" id="cal-detail-backdrop" role="dialog" aria-modal="true" aria-labelledby="cal-detail-title">
      <div class="panel modal-card" style="width:min(460px,100%);">
        <button type="button" class="modal-close-btn" id="close-cal-detail" aria-label="Tutup detail">✕</button>
        <span class="eyebrow">DETAIL JADWAL KONTEN</span>
        <h2 id="cal-detail-title" style="font-size:19px;margin:6px 0 12px;">${escapeHtml(item.title)}</h2>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;">
          <span class="platform-chip plat-${item.platform.toLowerCase()}">${escapeHtml(item.platform)}</span>
          <span class="status-pill ${item.statusClass}">${item.status === 'Terlambat' ? '⚑ ' : ''}${escapeHtml(item.status)}</span>
          <span class="filter-summary-chip">${escapeHtml(item.category)}</span>
        </div>
        <div class="detail-kv-grid">
          <div><span class="filter-label">TGL PRODUKSI</span><strong>${escapeHtml(item.prodDate)}</strong></div>
          <div><span class="filter-label">TGL PUBLIKASI</span><strong>${escapeHtml(item.pubDate)}</strong></div>
          <div><span class="filter-label">PEMILIK</span><strong>${escapeHtml(item.owner)}</strong></div>
          <div><span class="filter-label">KETERANGAN</span><strong>Data dummy sesi</strong></div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-secondary" id="goto-pipeline-btn">Lihat Alur Produksi ↗</button>
          <button type="button" class="btn-primary" id="ok-cal-detail">Tutup</button>
        </div>
      </div>
    </div>
  `;

  const onKeyDown = (e) => { if (e.key === 'Escape') close(); };
  const close = () => {
    document.removeEventListener('keydown', onKeyDown);
    modalContainer.innerHTML = '';
  };

  document.addEventListener('keydown', onKeyDown);
  document.querySelector('#close-cal-detail')?.addEventListener('click', close);
  document.querySelector('#ok-cal-detail')?.addEventListener('click', close);
  document.querySelector('#cal-detail-backdrop')?.addEventListener('click', (e) => {
    if (e.target.id === 'cal-detail-backdrop') close();
  });
  document.querySelector('#goto-pipeline-btn')?.addEventListener('click', () => {
    close();
    document.dispatchEvent(new CustomEvent('studioflow:navigate', { detail: { route: 'Alur produksi' } }));
  });
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
          <button type="button" class="filter-pill ${v === active ? 'active' : ''}" data-filter-group="${id}" data-filter-val="${v}">
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
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
        ${activeFiltersCount > 0 ? `<button type="button" class="btn-secondary" id="cal-clear-filters">Hapus filter (${activeFiltersCount})</button>` : ''}
        <button type="button" class="btn-primary" id="btn-cal-new"><span>＋</span> Konten Baru (Demo)</button>
      </div>
    </div>

    <!-- View Toggle -->
    <div class="cal-view-toggle-bar">
      <div class="view-toggle-group" role="group" aria-label="Pilih tampilan kalender">
        <button type="button" class="view-toggle-btn ${calState.view === 'monthly' ? 'active' : ''}" id="cal-view-monthly" data-cal-view="monthly">Bulanan</button>
        <button type="button" class="view-toggle-btn ${calState.view === 'weekly'  ? 'active' : ''}" id="cal-view-weekly"  data-cal-view="weekly">Mingguan</button>
        <button type="button" class="view-toggle-btn ${calState.view === 'daily'   ? 'active' : ''}" id="cal-view-daily"   data-cal-view="daily">Harian</button>
      </div>
      <span class="filter-summary-chip" style="${activeFiltersCount === 0 ? 'opacity:0.65' : ''}">
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
          <p>Ringkasan semua item yang sesuai filter aktif · Penanda padat tampil jika ≥2 jadwal di tanggal sama</p>
        </div>
        <span class="demo-badge">DATA DUMMY</span>
      </div>
      ${renderContentList(filtered)}
    </div>

    <div class="demo-banner">
      <span class="demo-banner-icon">✳</span>
      <div class="demo-banner-content">
        <strong>Kalender Konten — Simulasi Lokal</strong>
        <p>Filter, tampilan bulanan/mingguan/harian, dan penambahan item bekerja pada data dummy sesi lokal. Tidak ada koneksi backend.</p>
      </div>
      <span class="demo-badge">SIMULASI</span>
    </div>
  `;
}

// ─────────────────────────────────────────────────────────────────────────────
// Event binding
// ─────────────────────────────────────────────────────────────────────────────

export function attachCalendarEvents(renderApp, showToast) {
  document.querySelectorAll('[data-cal-view]').forEach(btn => {
    btn.addEventListener('click', () => {
      calState.view = btn.dataset.calView;
      renderApp();
    });
  });

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

  document.querySelector('#cal-clear-filters')?.addEventListener('click', () => {
    calState.filterPlatform = 'Semua';
    calState.filterCategory = 'Semua';
    calState.filterStatus   = 'Semua';
    renderApp();
  });

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

  document.querySelectorAll('[data-cal-id]').forEach(el => {
    el.addEventListener('click', () => {
      const item = calendarItems.find(i => i.id === el.dataset.calId);
      if (item) openCalendarDetailModal(item);
    });
  });

  document.querySelector('#btn-cal-new')?.addEventListener('click', () => {
    openNewContentModal(renderApp, showToast, formatDateStr(calState.focusDate));
  });
}
