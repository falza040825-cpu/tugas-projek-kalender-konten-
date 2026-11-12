/**
 * Kalender Konten — Yayasan Motivator Qur'an (RBAC Conditional UI)
 * Tampilan bulanan/mingguan/harian · Filter platform, kategori, status
 * Ketua Tim melihat seluruh jadwal & tombol buat baru; Copywriter & Editor terfilter sesuai peran.
 */

import {
  ROLES,
  WORKFLOW_STATUSES,
  calendarItems,
  getCurrentUser,
  getRolePermissions,
  isCopywriterQueueItem,
  isEditorQueueItem,
} from '../data/mockData.js';
import { openNewContentModal, openContentWorkflowModal } from './contentModal.js';
import { escapeHtml } from '../utils/helpers.js';

let calState = {
  view: 'monthly',
  filterPlatform: 'Semua',
  filterCategory: 'Semua',
  filterStatus: 'Semua',
  focusDate: new Date(2026, 9, 16),
};

const PLATFORMS  = ['Semua', 'Instagram', 'TikTok', 'YouTube'];
const CATEGORIES = ['Semua', 'Edukasi', 'Promosi', 'Informasi', 'Hiburan'];
const COPYWRITER_STATUSES = ['Semua', 'Ide', 'Perlu Naskah', 'Revisi Naskah'];

function getRoleCalendarBase(role) {
  if (role === ROLES.COPYWRITER) return calendarItems.filter(isCopywriterQueueItem);
  if (role === ROLES.EDITOR) return calendarItems.filter(isEditorQueueItem);
  return calendarItems;
}

function getAvailableStatuses(role) {
  if (role === ROLES.COPYWRITER) return COPYWRITER_STATUSES;
  if (role === ROLES.EDITOR) return ['Siap Edit'];
  return ['Semua', ...WORKFLOW_STATUSES];
}

function applyFilters(items, role) {
  const validStatuses = getAvailableStatuses(role);
  const activeStatus = validStatuses.includes(calState.filterStatus) ? calState.filterStatus : validStatuses[0];

  return items.filter(item => {
    const okP = calState.filterPlatform === 'Semua' || item.platform === calState.filterPlatform;
    const okC = calState.filterCategory === 'Semua' || item.category === calState.filterCategory;
    const okS = activeStatus === 'Semua' || item.status === activeStatus;
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
  return dateStr === '2026-10-16';
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

function calCard(item) {
  return `
    <button
      type="button"
      class="cal-event ${item.statusClass}"
      data-cal-id="${escapeHtml(item.id)}"
      title="${escapeHtml(item.title)} · ${escapeHtml(item.platform)} · ${escapeHtml(item.status)}"
      aria-label="${escapeHtml(item.title)}, ${escapeHtml(item.platform)}, status ${escapeHtml(item.status)}"
    >
      <span class="cal-event-dot" aria-hidden="true"></span>
      <span class="cal-event-text">${item.isOverdue ? '⚑ ' : ''}${escapeHtml(item.title)}</span>
    </button>
  `;
}

function renderMonthly(items) {
  const year  = calState.focusDate.getFullYear();
  const month = calState.focusDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
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
    const hasLate = dayItems.some(i => i.isOverdue);
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

function renderWeekly(items) {
  const base = new Date(calState.focusDate);
  const dow = base.getDay() === 0 ? 6 : base.getDay() - 1;
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
              <span class="status-pill ${item.statusClass}">${item.isOverdue ? '⚑ ' : ''}${escapeHtml(item.status)}</span>
              <span class="assignee-chip">
                <span class="mini-avatar">${escapeHtml(item.initials)}</span> ${escapeHtml(item.owner)}
              </span>
              <button type="button" class="btn-secondary cal-detail-trigger" data-cal-id="${escapeHtml(item.id)}" style="margin-left:auto;padding:4px 10px;font-size:11px;">Buka</button>
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

function renderContentList(items, role) {
  if (items.length === 0) {
    return `<div class="cal-empty-state">Tidak ada konten pada antrean <strong>${escapeHtml(role)}</strong> yang cocok dengan filter aktif.</div>`;
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
        <span>AKSI</span>
      </div>
      ${items.map(item => `
        <div class="content-list-row">
          <div class="content-list-title">${escapeHtml(item.title)}</div>
          <div><span class="platform-chip plat-${item.platform.toLowerCase()}">${escapeHtml(item.platform)}</span></div>
          <div class="cl-muted" data-label="Kategori">${escapeHtml(item.category)}</div>
          <div class="cl-muted" data-label="Produksi">${escapeHtml(item.prodDate)}</div>
          <div class="cl-muted ${item.isOverdue ? 'cl-late' : ''}" data-label="Tayang">${escapeHtml(item.pubDate)}</div>
          <div><span class="status-pill ${item.statusClass}">${item.isOverdue ? '⚑ ' : ''}${escapeHtml(item.status)}</span></div>
          <div>
            <button type="button" class="btn-secondary" data-cal-id="${escapeHtml(item.id)}" style="padding:4px 10px;font-size:11px;">
              ${role === ROLES.COPYWRITER ? 'Naskah' : role === ROLES.EDITOR ? 'Edit' : 'Detail'}
            </button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function filterBtn(id, values, active, label) {
  return `
    <div class="filter-group">
      <span class="filter-label">${label}</span>
      <div class="filter-pills" id="${id}">
        ${values.map(v => `
          <button type="button" class="filter-pill ${v === active ? 'active' : ''}" data-filter-group="${id}" data-filter-val="${escapeHtml(v)}">
            ${escapeHtml(v)}
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

export function renderCalendar() {
  const user = getCurrentUser();
  const role = user?.role || ROLES.COPYWRITER;
  const perms = getRolePermissions(role);
  const roleItems = getRoleCalendarBase(role);
  const filtered = applyFilters(roleItems, role);
  const availableStatuses = getAvailableStatuses(role);
  const activeStatus = availableStatuses.includes(calState.filterStatus) ? calState.filterStatus : availableStatuses[0];

  let viewContent = '';
  if (calState.view === 'monthly') viewContent = renderMonthly(filtered);
  else if (calState.view === 'weekly') viewContent = renderWeekly(filtered);
  else viewContent = renderDaily(filtered);

  const activeFiltersCount = [
    calState.filterPlatform !== 'Semua',
    calState.filterCategory !== 'Semua',
    role !== ROLES.EDITOR && activeStatus !== 'Semua',
  ].filter(Boolean).length;

  const scopeDesc = role === ROLES.COPYWRITER
    ? `Antrean jadwal naskah Copywriter · ${filtered.length} dari ${roleItems.length} item`
    : role === ROLES.EDITOR
      ? `Jadwal khusus item "Siap Edit" Editor · ${filtered.length} dari ${roleItems.length} item`
      : `Seluruh jadwal produksi & publikasi tim · ${filtered.length} dari ${roleItems.length} item`;

  return `
    <div class="page-heading">
      <div>
        <div class="eyebrow">WORKSPACE / KALENDER KONTEN (${escapeHtml(role.toUpperCase())})</div>
        <h1>Kalender Konten</h1>
        <p>${escapeHtml(scopeDesc)}</p>
      </div>
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
        ${activeFiltersCount > 0 ? `<button type="button" class="btn-secondary" id="cal-clear-filters">Hapus filter (${activeFiltersCount})</button>` : ''}
        ${perms.canCreateContent ? `
          <button type="button" class="btn-primary" id="btn-cal-new"><span>＋</span> Konten Baru</button>
        ` : `
          <span class="filter-summary-chip">Tampilan Peran: ${escapeHtml(role)}</span>
        `}
      </div>
    </div>

    <!-- View Toggle -->
    <div class="cal-view-toggle-bar">
      <div class="view-toggle-group" role="group" aria-label="Pilih tampilan kalender">
        <button type="button" class="view-toggle-btn ${calState.view === 'monthly' ? 'active' : ''}" id="cal-view-monthly" data-cal-view="monthly">Bulanan</button>
        <button type="button" class="view-toggle-btn ${calState.view === 'weekly'  ? 'active' : ''}" id="cal-view-weekly"  data-cal-view="weekly">Mingguan</button>
        <button type="button" class="view-toggle-btn ${calState.view === 'daily'   ? 'active' : ''}" id="cal-view-daily"   data-cal-view="daily">Harian</button>
      </div>
      <span class="filter-summary-chip" style="${activeFiltersCount === 0 ? 'opacity:0.75' : ''}">
        ${activeFiltersCount > 0 ? `${activeFiltersCount} filter aktif` : (role === ROLES.KETUA_TIM ? 'Tampil semua status' : `Fokus: ${role}`)}
      </span>
    </div>

    <!-- Filter Row -->
    <div class="panel" style="margin-bottom:20px; padding: 16px 20px;">
      <div class="filter-row">
        ${filterBtn('cal-filter-platform', PLATFORMS,  calState.filterPlatform, 'Platform')}
        ${filterBtn('cal-filter-category', CATEGORIES, calState.filterCategory, 'Kategori')}
        ${role !== ROLES.EDITOR ? filterBtn('cal-filter-status', availableStatuses, activeStatus, 'Status') : ''}
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
          <h2>Daftar Konten (${escapeHtml(role)})</h2>
          <p>Klik tombol aksi pada item untuk membuka ruang kerja sesuai peran aktif</p>
        </div>
        <span class="demo-badge">${filtered.length} ITEM</span>
      </div>
      ${renderContentList(filtered, role)}
    </div>

    <div class="demo-banner">
      <span class="demo-banner-icon">✳</span>
      <div class="demo-banner-content">
        <strong>Kalender Konten RBAC — Simulasi Lokal</strong>
        <p>Pembuatan kartu ide konten baru dikhususkan bagi Ketua Tim. Copywriter dan Editor melihat item relevan sesuai alur tugas masing-masing.</p>
      </div>
      <span class="demo-badge">SIMULASI</span>
    </div>
  `;
}

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
      openContentWorkflowModal(el.dataset.calId, renderApp, showToast);
    });
  });

  document.querySelector('#btn-cal-new')?.addEventListener('click', () => {
    openNewContentModal(renderApp, showToast, formatDateStr(calState.focusDate));
  });
}
