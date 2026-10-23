/**
 * Manajemen Tugas — StudioFlow Fase 2
 * Tabel tugas dengan filter prioritas/status/assignee · Modal buat tugas baru (demo)
 */

import { taskItems, teamMembers } from '../data/mockData.js';

// State filter lokal
let taskState = {
  filterStatus:   'Semua',
  filterPriority: 'Semua',
  filterAssignee: 'Semua',
  searchQuery:    '',
};

const STATUSES_TASK  = ['Semua', 'Belum mulai', 'Dalam proses', 'Revisi', 'Menunggu', 'Terlambat', 'Selesai'];
const PRIORITIES     = ['Semua', 'Tinggi', 'Normal'];
const ASSIGNEES      = ['Semua', ...teamMembers.map(m => m.name)];

const STATUS_CLASS_MAP = {
  'Belum mulai': 'st-idea',
  'Dalam proses': 'st-progress',
  'Revisi':       'st-revision',
  'Menunggu':     'st-wait',
  'Terlambat':    'st-late',
  'Selesai':      'st-done',
};

// ─────────────────────────────────────────────────────────────────────────────
// Filter helpers
// ─────────────────────────────────────────────────────────────────────────────

function applyTaskFilters(items) {
  return items.filter(item => {
    const okS = taskState.filterStatus   === 'Semua' || item.status   === taskState.filterStatus;
    const okP = taskState.filterPriority === 'Semua' || item.priority === taskState.filterPriority;
    const okA = taskState.filterAssignee === 'Semua' || item.assignee === taskState.filterAssignee;
    const okQ = !taskState.searchQuery   || item.title.toLowerCase().includes(taskState.searchQuery) || item.project.toLowerCase().includes(taskState.searchQuery);
    return okS && okP && okA && okQ;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Render tabel tugas
// ─────────────────────────────────────────────────────────────────────────────

function priorityBadge(p) {
  const cls = p === 'Tinggi' ? 'prio-high' : 'prio-normal';
  return `<span class="priority-badge ${cls}">${p}</span>`;
}

function formatDeadline(dateStr) {
  // "2026-10-10" → "10 Okt"
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

function renderTaskTable(items) {
  if (items.length === 0) {
    return `<div class="cal-empty-state">Tidak ada tugas yang cocok dengan filter aktif.</div>`;
  }
  return `
    <div class="task-table full-task-table">
      <div class="table-head full-task-head">
        <span>TUGAS</span>
        <span>PROYEK / PLATFORM</span>
        <span>PENANGGUNG JAWAB</span>
        <span>DEADLINE</span>
        <span>PRIORITAS</span>
        <span>STATUS</span>
        <span>AKSI</span>
      </div>
      ${items.map(item => `
        <div class="task-row full-task-row ${item.isOverdue ? 'row-overdue' : ''}">
          <div class="task-name">
            <span class="task-check ${item.isOverdue ? 'overdue' : ''}">${item.isOverdue ? '!' : '✓'}</span>
            <div>
              <strong>${item.title}</strong>
              ${item.notes ? `<div class="task-note">${item.notes}</div>` : ''}
            </div>
          </div>
          <div>
            <div class="cl-muted" style="font-size:11px;">${item.project}</div>
            <span class="platform-chip plat-${item.platform.toLowerCase()}" style="font-size:10px;margin-top:4px;">${item.platform}</span>
          </div>
          <div class="assignee">
            <span class="mini-avatar">${item.initials}</span>
            <span class="cl-muted">${item.assignee}</span>
          </div>
          <div class="deadline ${item.isOverdue ? 'late' : ''}">${formatDeadline(item.deadline)}</div>
          <div>${priorityBadge(item.priority)}</div>
          <div>
            <select class="status-select" data-task-id="${item.id}" aria-label="Ubah status tugas ${item.title}">
              ${STATUSES_TASK.filter(s => s !== 'Semua').map(s =>
                `<option value="${s}" ${s === item.status ? 'selected' : ''}>${s}</option>`
              ).join('')}
            </select>
          </div>
          <div>
            <button class="btn-secondary task-detail-btn" style="padding:6px 10px;font-size:11px;" data-task-id="${item.id}" aria-label="Detail tugas ${item.title}">Detail</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// ─────────────────────────────────────────────────────────────────────────────
// Render filter bar
// ─────────────────────────────────────────────────────────────────────────────

function filterSelect(id, values, active, label) {
  return `
    <div class="filter-select-group">
      <label class="filter-label" for="${id}">${label}</label>
      <select class="task-filter-select" id="${id}" data-filter-id="${id}">
        ${values.map(v => `<option value="${v}" ${v === active ? 'selected' : ''}>${v}</option>`).join('')}
      </select>
    </div>
  `;
}

// ─────────────────────────────────────────────────────────────────────────────
// Statistik ringkasan tugas
// ─────────────────────────────────────────────────────────────────────────────

function renderTaskStats() {
  const total    = taskItems.length;
  const overdue  = taskItems.filter(t => t.isOverdue).length;
  const done     = taskItems.filter(t => t.status === 'Selesai').length;
  const high     = taskItems.filter(t => t.priority === 'Tinggi' && t.status !== 'Selesai').length;

  return `
    <div class="pip-stats" style="margin-bottom:20px;">
      <div class="pip-stat-item">
        <span class="pip-stat-val">${total}</span>
        <span class="pip-stat-label">Total tugas</span>
      </div>
      <div class="pip-stat-divider"></div>
      <div class="pip-stat-item">
        <span class="pip-stat-val" style="color:var(--color-blush-ink)">${overdue}</span>
        <span class="pip-stat-label">Terlambat</span>
      </div>
      <div class="pip-stat-divider"></div>
      <div class="pip-stat-item">
        <span class="pip-stat-val" style="color:var(--color-sand-ink)">${high}</span>
        <span class="pip-stat-label">Prioritas tinggi</span>
      </div>
      <div class="pip-stat-divider"></div>
      <div class="pip-stat-item">
        <span class="pip-stat-val" style="color:var(--color-sage-ink)">${done}</span>
        <span class="pip-stat-label">Selesai</span>
      </div>
    </div>
  `;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main render
// ─────────────────────────────────────────────────────────────────────────────

export function renderTasks() {
  const filtered = applyTaskFilters(taskItems);
  const activeCount = [
    taskState.filterStatus !== 'Semua',
    taskState.filterPriority !== 'Semua',
    taskState.filterAssignee !== 'Semua',
    !!taskState.searchQuery,
  ].filter(Boolean).length;

  return `
    <div class="page-heading">
      <div>
        <div class="eyebrow">WORKSPACE / MANAJEMEN TUGAS</div>
        <h1>Manajemen Tugas</h1>
        <p>Kelola tugas tim, penanggung jawab, deadline, dan status pengerjaan</p>
      </div>
      <button class="btn-primary" id="btn-task-new"><span>＋</span> Tugas Baru (Demo)</button>
    </div>

    ${renderTaskStats()}

    <!-- Filter & Search -->
    <div class="panel" style="margin-bottom:20px; padding: 16px 20px;">
      <div class="task-filter-bar">
        <div class="task-search-wrap">
          <span class="search-icon">🔍</span>
          <input
            type="text"
            id="task-search"
            class="task-search-input"
            placeholder="Cari judul atau proyek..."
            value="${taskState.searchQuery}"
            aria-label="Cari tugas"
          />
        </div>
        ${filterSelect('tf-status',   STATUSES_TASK,  taskState.filterStatus,   'Status')}
        ${filterSelect('tf-priority', PRIORITIES,     taskState.filterPriority, 'Prioritas')}
        ${filterSelect('tf-assignee', ASSIGNEES,      taskState.filterAssignee, 'Penanggungjawab')}
        ${activeCount > 0 ? `<button class="btn-secondary" id="task-clear-filters" style="align-self:flex-end;">Hapus filter</button>` : ''}
      </div>
      <div style="font-size:11px;color:var(--color-ink-muted);margin-top:10px;">
        Menampilkan ${filtered.length} dari ${taskItems.length} tugas
      </div>
    </div>

    <!-- Task Table -->
    <div class="panel" style="margin-bottom:20px; padding: 0 0 8px;">
      ${renderTaskTable(filtered)}
    </div>

    <div class="demo-banner">
      <span class="demo-banner-icon">✳</span>
      <div class="demo-banner-content">
        <strong>Manajemen Tugas — Fase 2</strong>
        <p>Perubahan status dan filter bekerja pada sesi UI lokal. Tambah dan edit tugas memerlukan backend di masa mendatang.</p>
      </div>
      <span class="demo-badge">FASE 2</span>
    </div>
  `;
}

// ─────────────────────────────────────────────────────────────────────────────
// Modal buat tugas baru
// ─────────────────────────────────────────────────────────────────────────────

function openNewTaskModal(renderApp, showToast) {
  const modalContainer = document.querySelector('#modal-container');
  if (!modalContainer) return;

  modalContainer.innerHTML = `
    <div style="position:fixed;inset:0;background:rgba(37,39,35,0.5);backdrop-filter:blur(4px);z-index:50;display:grid;place-items:center;padding:16px;">
      <div class="panel" style="width:min(520px,100%);position:relative;">
        <button id="close-modal" style="position:absolute;right:16px;top:16px;font-size:20px;color:var(--color-ink-muted);" aria-label="Tutup modal">✕</button>
        <span class="eyebrow">DEMO SIMULASI FORM</span>
        <h2 style="font-size:20px;margin:6px 0 4px;">Buat Tugas Baru</h2>
        <p style="font-size:12px;color:var(--color-ink-secondary);margin-bottom:20px;">
          Simulasi UI. Penyimpanan nyata memerlukan backend.
        </p>
        <form id="new-task-form" style="display:flex;flex-direction:column;gap:14px;">
          <div>
            <label style="font-size:11px;font-weight:700;color:var(--color-ink-secondary);display:block;margin-bottom:6px;" for="nt-title">Judul Tugas</label>
            <input id="nt-title" required placeholder="Contoh: Review naskah promo" style="width:100%;height:38px;border:1px solid var(--color-border);border-radius:var(--radius-control);padding:0 12px;font-size:12px;"/>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <div>
              <label style="font-size:11px;font-weight:700;color:var(--color-ink-secondary);display:block;margin-bottom:6px;" for="nt-assignee">Penanggungjawab</label>
              <select id="nt-assignee" style="width:100%;height:38px;border:1px solid var(--color-border);border-radius:var(--radius-control);padding:0 10px;font-size:12px;">
                ${teamMembers.map(m => `<option>${m.name}</option>`).join('')}
              </select>
            </div>
            <div>
              <label style="font-size:11px;font-weight:700;color:var(--color-ink-secondary);display:block;margin-bottom:6px;" for="nt-priority">Prioritas</label>
              <select id="nt-priority" style="width:100%;height:38px;border:1px solid var(--color-border);border-radius:var(--radius-control);padding:0 10px;font-size:12px;">
                <option>Normal</option>
                <option>Tinggi</option>
              </select>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <div>
              <label style="font-size:11px;font-weight:700;color:var(--color-ink-secondary);display:block;margin-bottom:6px;" for="nt-deadline">Deadline</label>
              <input id="nt-deadline" type="date" value="2026-10-20" style="width:100%;height:38px;border:1px solid var(--color-border);border-radius:var(--radius-control);padding:0 12px;font-size:12px;"/>
            </div>
            <div>
              <label style="font-size:11px;font-weight:700;color:var(--color-ink-secondary);display:block;margin-bottom:6px;" for="nt-status">Status Awal</label>
              <select id="nt-status" style="width:100%;height:38px;border:1px solid var(--color-border);border-radius:var(--radius-control);padding:0 10px;font-size:12px;">
                ${STATUSES_TASK.filter(s => s !== 'Semua').map(s => `<option>${s}</option>`).join('')}
              </select>
            </div>
          </div>
          <div>
            <label style="font-size:11px;font-weight:700;color:var(--color-ink-secondary);display:block;margin-bottom:6px;" for="nt-notes">Instruksi / Catatan</label>
            <textarea id="nt-notes" placeholder="Catatan tambahan..." rows="2" style="width:100%;border:1px solid var(--color-border);border-radius:var(--radius-control);padding:8px 12px;font-size:12px;resize:vertical;"></textarea>
          </div>
          <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:10px;padding-top:14px;border-top:1px solid var(--color-border);">
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
  document.querySelector('#new-task-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const title    = document.querySelector('#nt-title').value.trim() || 'Tugas baru';
    const assignee = document.querySelector('#nt-assignee').value;
    const priority = document.querySelector('#nt-priority').value;
    const deadline = document.querySelector('#nt-deadline').value;
    const status   = document.querySelector('#nt-status').value;
    const notes    = document.querySelector('#nt-notes').value.trim();

    const memberMap = { 'Farah Aulia': 'FA', 'Nadia Putri': 'NP', 'Raka Pratama': 'RP', 'Dimas Akbar': 'DA' };
    const newTask = {
      id: `task-${Date.now()}`,
      title,
      project: 'Tugas Baru (Demo)',
      platform: 'Instagram',
      assignee,
      initials: memberMap[assignee] || 'UN',
      deadline,
      priority,
      status,
      statusClass: STATUS_CLASS_MAP[status] || 'st-idea',
      notes,
    };
    taskItems.unshift(newTask);
    closeModal();
    showToast(`Tugas "${title}" ditambahkan untuk sesi ini.`);
    renderApp();
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Event binding
// ─────────────────────────────────────────────────────────────────────────────

export function attachTaskEvents(renderApp, showToast) {
  // Buat tugas baru
  document.querySelector('#btn-task-new')?.addEventListener('click', () => {
    openNewTaskModal(renderApp, showToast);
  });

  // Filter selects
  document.querySelectorAll('.task-filter-select').forEach(sel => {
    sel.addEventListener('change', () => {
      const id  = sel.dataset.filterId;
      const val = sel.value;
      if (id === 'tf-status')   taskState.filterStatus   = val;
      if (id === 'tf-priority') taskState.filterPriority = val;
      if (id === 'tf-assignee') taskState.filterAssignee = val;
      renderApp();
    });
  });

  // Search
  document.querySelector('#task-search')?.addEventListener('input', (e) => {
    taskState.searchQuery = e.target.value.toLowerCase().trim();
    renderApp();
  });

  // Clear filters
  document.querySelector('#task-clear-filters')?.addEventListener('click', () => {
    taskState.filterStatus   = 'Semua';
    taskState.filterPriority = 'Semua';
    taskState.filterAssignee = 'Semua';
    taskState.searchQuery    = '';
    renderApp();
  });

  // Ubah status inline
  document.querySelectorAll('.status-select').forEach(sel => {
    sel.addEventListener('change', () => {
      const taskId = sel.dataset.taskId;
      const item   = taskItems.find(t => t.id === taskId);
      if (!item) return;
      const oldStatus = item.status;
      item.status      = sel.value;
      item.statusClass = STATUS_CLASS_MAP[sel.value] || 'st-idea';
      item.isOverdue   = sel.value === 'Terlambat';
      showToast(`"${item.title}": ${oldStatus} → ${item.status}`);
      renderApp();
    });
  });

  // Detail button (demo feedback)
  document.querySelectorAll('.task-detail-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const taskId = btn.dataset.taskId;
      const item   = taskItems.find(t => t.id === taskId);
      if (!item) return;
      showToast(`Detail: ${item.title} · ${item.assignee} · ${item.status}`);
    });
  });
}
