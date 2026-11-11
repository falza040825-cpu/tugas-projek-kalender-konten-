/**
 * Manajemen Tugas — StudioFlow Fase 2 & QA Fase 4
 * Tabel tugas dengan filter prioritas/status/assignee · Modal buat & edit tugas (demo)
 */

import { taskItems, teamMembers } from '../data/mockData.js';
import { escapeHtml, formatShortDateId } from '../utils/helpers.js';

let taskState = {
  filterStatus:   'Semua',
  filterPriority: 'Semua',
  filterAssignee: 'Semua',
  searchQuery:    '',
};

const STATUSES_TASK  = ['Semua', 'Belum mulai', 'Dalam proses', 'Revisi', 'Menunggu', 'Terlambat', 'Selesai'];
const PRIORITIES     = ['Semua', 'Tinggi', 'Normal'];
const ASSIGNEES      = ['Semua', ...teamMembers.map(m => m.name)];
const PLATFORMS_LIST = ['Instagram', 'TikTok', 'YouTube'];

const STATUS_CLASS_MAP = {
  'Belum mulai':  'st-idea',
  'Dalam proses': 'st-progress',
  'Revisi':       'st-revision',
  'Menunggu':     'st-wait',
  'Terlambat':    'st-late',
  'Selesai':      'st-done',
};

function applyTaskFilters(items) {
  return items.filter(item => {
    const okS = taskState.filterStatus   === 'Semua' || item.status   === taskState.filterStatus;
    const okP = taskState.filterPriority === 'Semua' || item.priority === taskState.filterPriority;
    const okA = taskState.filterAssignee === 'Semua' || item.assignee === taskState.filterAssignee;
    const okQ = !taskState.searchQuery ||
      item.title.toLowerCase().includes(taskState.searchQuery) ||
      item.project.toLowerCase().includes(taskState.searchQuery);
    return okS && okP && okA && okQ;
  });
}

function activeFilterCount() {
  return [
    taskState.filterStatus !== 'Semua',
    taskState.filterPriority !== 'Semua',
    taskState.filterAssignee !== 'Semua',
    !!taskState.searchQuery,
  ].filter(Boolean).length;
}

function priorityBadge(p) {
  const cls = p === 'Tinggi' ? 'prio-high' : 'prio-normal';
  return `<span class="priority-badge ${cls}">${escapeHtml(p)}</span>`;
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
            <span class="task-check ${item.isOverdue ? 'overdue' : ''}" aria-hidden="true">${item.isOverdue ? '!' : '✓'}</span>
            <div style="min-width:0;">
              <strong>${escapeHtml(item.title)}</strong>
              ${item.notes ? `<div class="task-note">${escapeHtml(item.notes)}</div>` : ''}
            </div>
          </div>
          <div class="task-col-project">
            <div class="cl-muted" style="font-size:11px;">${escapeHtml(item.project)}</div>
            <span class="platform-chip plat-${item.platform.toLowerCase()}" style="font-size:10px;margin-top:4px;">${escapeHtml(item.platform)}</span>
          </div>
          <div class="assignee task-col-assignee">
            <span class="mini-avatar">${escapeHtml(item.initials)}</span>
            <span class="cl-muted">${escapeHtml(item.assignee)}</span>
          </div>
          <div class="deadline task-col-deadline ${item.isOverdue ? 'late' : ''}">${escapeHtml(formatShortDateId(item.deadline))}</div>
          <div class="task-col-priority">${priorityBadge(item.priority)}</div>
          <div class="task-col-status">
            <select class="status-select" data-task-id="${escapeHtml(item.id)}" aria-label="Ubah status tugas ${escapeHtml(item.title)}">
              ${STATUSES_TASK.filter(s => s !== 'Semua').map(s =>
                `<option value="${escapeHtml(s)}" ${s === item.status ? 'selected' : ''}>${escapeHtml(s)}</option>`
              ).join('')}
            </select>
          </div>
          <div class="task-col-action">
            <button type="button" class="btn-secondary task-detail-btn" style="padding:6px 10px;font-size:11px;" data-task-id="${escapeHtml(item.id)}" aria-label="Detail dan edit tugas ${escapeHtml(item.title)}">Detail</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function filterSelect(id, values, active, label) {
  return `
    <div class="filter-select-group">
      <label class="filter-label" for="${id}">${label}</label>
      <select class="task-filter-select" id="${id}" data-filter-id="${id}">
        ${values.map(v => `<option value="${escapeHtml(v)}" ${v === active ? 'selected' : ''}>${escapeHtml(v)}</option>`).join('')}
      </select>
    </div>
  `;
}

function renderTaskStats() {
  const total    = taskItems.length;
  const overdue  = taskItems.filter(t => t.isOverdue).length;
  const done     = taskItems.filter(t => t.status === 'Selesai').length;
  const high     = taskItems.filter(t => t.priority === 'Tinggi' && t.status !== 'Selesai').length;

  return `
    <div class="pip-stats" id="task-stats-bar" style="margin-bottom:20px;">
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

export function renderTasks() {
  const filtered = applyTaskFilters(taskItems);
  const activeCount = activeFilterCount();

  return `
    <div class="page-heading">
      <div>
        <div class="eyebrow">WORKSPACE / MANAJEMEN TUGAS</div>
        <h1>Manajemen Tugas</h1>
        <p>Kelola tugas tim, penanggung jawab, deadline, dan status pengerjaan</p>
      </div>
      <button type="button" class="btn-primary" id="btn-task-new"><span>＋</span> Tugas Baru (Demo)</button>
    </div>

    ${renderTaskStats()}

    <!-- Filter & Search -->
    <div class="panel" style="margin-bottom:20px; padding: 16px 20px;">
      <div class="task-filter-bar">
        <div class="task-search-wrap">
          <span class="search-icon" aria-hidden="true">🔍</span>
          <input
            type="text"
            id="task-search"
            class="task-search-input"
            placeholder="Cari judul atau proyek..."
            value="${escapeHtml(taskState.searchQuery)}"
            aria-label="Cari tugas"
          />
        </div>
        ${filterSelect('tf-status',   STATUSES_TASK,  taskState.filterStatus,   'Status')}
        ${filterSelect('tf-priority', PRIORITIES,     taskState.filterPriority, 'Prioritas')}
        ${filterSelect('tf-assignee', ASSIGNEES,      taskState.filterAssignee, 'Penanggungjawab')}
        <span id="task-clear-wrap" style="align-self:flex-end;">
          ${activeCount > 0 ? `<button type="button" class="btn-secondary" id="task-clear-filters">Hapus filter</button>` : ''}
        </span>
      </div>
      <div id="task-count-info" style="font-size:11px;color:var(--color-ink-muted);margin-top:10px;">
        Menampilkan ${filtered.length} dari ${taskItems.length} tugas
      </div>
    </div>

    <!-- Task Table -->
    <div class="panel" id="task-list-panel" style="margin-bottom:20px; padding: 0 0 8px;">
      ${renderTaskTable(filtered)}
    </div>

    <div class="demo-banner">
      <span class="demo-banner-icon">✳</span>
      <div class="demo-banner-content">
        <strong>Manajemen Tugas — Simulasi Lokal</strong>
        <p>Buat, edit, ubah status, dan filter tugas bekerja pada sesi UI lokal (data dummy). Persistensi permanen memerlukan backend.</p>
      </div>
      <span class="demo-badge">SIMULASI</span>
    </div>
  `;
}

// ─────────────────────────────────────────────────────────────────────────────
// Modal Buat / Edit Tugas (Demo)
// ─────────────────────────────────────────────────────────────────────────────

function openTaskModal(renderApp, showToast, existingTask = null) {
  const modalContainer = document.querySelector('#modal-container');
  if (!modalContainer) return;

  const isEdit = Boolean(existingTask);
  const current = existingTask || {
    title: '',
    project: 'Konten Baru (Demo)',
    platform: 'Instagram',
    assignee: teamMembers[0]?.name || 'Farah Aulia',
    priority: 'Normal',
    deadline: '2026-10-20',
    status: 'Belum mulai',
    notes: '',
  };

  modalContainer.innerHTML = `
    <div class="modal-backdrop" id="task-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="task-modal-title">
      <div class="panel modal-card" style="width:min(540px,100%);">
        <button type="button" class="modal-close-btn" id="close-modal" aria-label="Tutup modal">✕</button>
        <span class="eyebrow">SIMULASI FORM LOKAL</span>
        <h2 id="task-modal-title" style="font-size:20px;margin:6px 0 4px;">${isEdit ? 'Detail & Edit Tugas' : 'Buat Tugas Baru'}</h2>
        <p style="font-size:12px;color:var(--color-ink-secondary);margin-bottom:18px;">
          Perubahan berlaku pada sesi UI ini saja. Penyimpanan permanen memerlukan backend.
        </p>

        <form id="task-modal-form" novalidate style="display:flex;flex-direction:column;gap:14px;">
          <div>
            <label class="form-label" for="nt-title">Judul Tugas *</label>
            <input id="nt-title" class="form-control" value="${escapeHtml(current.title)}" placeholder="Contoh: Review naskah promo" />
            <div id="nt-title-error" class="form-error" role="alert" style="display:none;"></div>
          </div>

          <div class="form-grid-2">
            <div>
              <label class="form-label" for="nt-project">Proyek / Konten Terkait</label>
              <input id="nt-project" class="form-control" value="${escapeHtml(current.project)}" placeholder="Nama konten terkait" />
            </div>
            <div>
              <label class="form-label" for="nt-platform">Platform</label>
              <select id="nt-platform" class="form-control">
                ${PLATFORMS_LIST.map(p => `<option value="${p}" ${p === current.platform ? 'selected' : ''}>${p}</option>`).join('')}
              </select>
            </div>
          </div>

          <div class="form-grid-2">
            <div>
              <label class="form-label" for="nt-assignee">Penanggungjawab</label>
              <select id="nt-assignee" class="form-control">
                ${teamMembers.map(m => `<option value="${escapeHtml(m.name)}" ${m.name === current.assignee ? 'selected' : ''}>${escapeHtml(m.name)}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="form-label" for="nt-priority">Prioritas</label>
              <select id="nt-priority" class="form-control">
                <option value="Normal" ${current.priority === 'Normal' ? 'selected' : ''}>Normal</option>
                <option value="Tinggi" ${current.priority === 'Tinggi' ? 'selected' : ''}>Tinggi</option>
              </select>
            </div>
          </div>

          <div class="form-grid-2">
            <div>
              <label class="form-label" for="nt-deadline">Deadline</label>
              <input id="nt-deadline" type="date" class="form-control" value="${escapeHtml(current.deadline)}" />
            </div>
            <div>
              <label class="form-label" for="nt-status">Status</label>
              <select id="nt-status" class="form-control">
                ${STATUSES_TASK.filter(s => s !== 'Semua').map(s => `<option value="${escapeHtml(s)}" ${s === current.status ? 'selected' : ''}>${escapeHtml(s)}</option>`).join('')}
              </select>
            </div>
          </div>

          <div>
            <label class="form-label" for="nt-notes">Instruksi / Catatan</label>
            <textarea id="nt-notes" class="form-control" style="height:auto;padding:8px 12px;resize:vertical;" placeholder="Catatan tambahan..." rows="3">${escapeHtml(current.notes)}</textarea>
          </div>

          <div class="modal-footer">
            <button type="button" id="cancel-modal" class="btn-secondary">Batal</button>
            <button type="submit" class="btn-primary">${isEdit ? 'Simpan Perubahan (Simulasi)' : 'Simpan (Simulasi)'}</button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.querySelector('#nt-title')?.focus();

  const onKeyDown = (e) => { if (e.key === 'Escape') closeModal(); };
  const closeModal = () => {
    document.removeEventListener('keydown', onKeyDown);
    modalContainer.innerHTML = '';
  };

  document.addEventListener('keydown', onKeyDown);
  document.querySelector('#close-modal')?.addEventListener('click', closeModal);
  document.querySelector('#cancel-modal')?.addEventListener('click', closeModal);
  document.querySelector('#task-modal-backdrop')?.addEventListener('click', (e) => {
    if (e.target.id === 'task-modal-backdrop') closeModal();
  });

  document.querySelector('#task-modal-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const titleEl  = document.querySelector('#nt-title');
    const titleErr = document.querySelector('#nt-title-error');
    const title    = titleEl.value.trim();

    if (!title) {
      titleErr.textContent = 'Judul tugas wajib diisi.';
      titleErr.style.display = 'block';
      titleEl.focus();
      return;
    }
    titleErr.style.display = 'none';

    const project  = document.querySelector('#nt-project').value.trim() || 'Umum';
    const platform = document.querySelector('#nt-platform').value;
    const assignee = document.querySelector('#nt-assignee').value;
    const priority = document.querySelector('#nt-priority').value;
    const deadline = document.querySelector('#nt-deadline').value || '2026-10-20';
    const status   = document.querySelector('#nt-status').value;
    const notes    = document.querySelector('#nt-notes').value.trim();

    const member = teamMembers.find(m => m.name === assignee);
    const initials = member ? member.initials : 'SF';

    if (isEdit && existingTask) {
      existingTask.title       = title;
      existingTask.project     = project;
      existingTask.platform    = platform;
      existingTask.assignee    = assignee;
      existingTask.initials    = initials;
      existingTask.deadline    = deadline;
      existingTask.priority    = priority;
      existingTask.status      = status;
      existingTask.statusClass = STATUS_CLASS_MAP[status] || 'st-idea';
      existingTask.notes       = notes;
      existingTask.isOverdue   = status === 'Terlambat';
      closeModal();
      showToast(`Tugas "${title}" diperbarui untuk sesi ini.`);
    } else {
      taskItems.unshift({
        id: `task-${Date.now()}`,
        title,
        project,
        platform,
        assignee,
        initials,
        deadline,
        priority,
        status,
        statusClass: STATUS_CLASS_MAP[status] || 'st-idea',
        notes,
        isOverdue: status === 'Terlambat',
      });
      closeModal();
      showToast(`Tugas "${title}" ditambahkan untuk sesi ini.`);
    }
    renderApp();
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Event binding
// ─────────────────────────────────────────────────────────────────────────────

function attachTaskRowEvents(renderApp, showToast) {
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

  document.querySelectorAll('.task-detail-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const taskId = btn.dataset.taskId;
      const item   = taskItems.find(t => t.id === taskId);
      if (!item) return;
      openTaskModal(renderApp, showToast, item);
    });
  });
}

function updateTaskListOnly(renderApp, showToast) {
  const filtered = applyTaskFilters(taskItems);
  const panelEl = document.querySelector('#task-list-panel');
  const countEl = document.querySelector('#task-count-info');
  const clearWrap = document.querySelector('#task-clear-wrap');

  if (panelEl) panelEl.innerHTML = renderTaskTable(filtered);
  if (countEl) countEl.textContent = `Menampilkan ${filtered.length} dari ${taskItems.length} tugas`;
  if (clearWrap) {
    const activeCount = activeFilterCount();
    clearWrap.innerHTML = activeCount > 0
      ? `<button type="button" class="btn-secondary" id="task-clear-filters">Hapus filter</button>`
      : '';
    document.querySelector('#task-clear-filters')?.addEventListener('click', () => {
      taskState.filterStatus   = 'Semua';
      taskState.filterPriority = 'Semua';
      taskState.filterAssignee = 'Semua';
      taskState.searchQuery    = '';
      renderApp();
    });
  }
  attachTaskRowEvents(renderApp, showToast);
}

export function attachTaskEvents(renderApp, showToast) {
  document.querySelector('#btn-task-new')?.addEventListener('click', () => {
    openTaskModal(renderApp, showToast, null);
  });

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

  document.querySelector('#task-search')?.addEventListener('input', (e) => {
    taskState.searchQuery = e.target.value.toLowerCase().trim();
    updateTaskListOnly(renderApp, showToast);
  });

  document.querySelector('#task-clear-filters')?.addEventListener('click', () => {
    taskState.filterStatus   = 'Semua';
    taskState.filterPriority = 'Semua';
    taskState.filterAssignee = 'Semua';
    taskState.searchQuery    = '';
    renderApp();
  });

  attachTaskRowEvents(renderApp, showToast);
}
