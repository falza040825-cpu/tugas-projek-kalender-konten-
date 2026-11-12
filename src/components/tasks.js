/**
 * Manajemen Tugas / Antrean Konten RBAC — Yayasan Motivator Qur'an Fase 5
 * Adaptif per peran (Ketua Tim, Copywriter, Editor) dengan data terhubung lokal
 */

import {
  ROLES,
  WORKFLOW_STATUSES,
  STATUS_TO_META,
  taskItems,
  teamMembers,
  getCurrentUser,
  getRolePermissions,
  isCopywriterQueueItem,
  isEditorQueueItem,
  isKetuaReviewItem,
  updateContentByKetua,
} from '../data/mockData.js';
import { openNewContentModal, openContentWorkflowModal } from './contentModal.js';
import { escapeHtml, formatShortDateId, isValidHttpUrl, normalizePlatformClass } from '../utils/helpers.js';

let taskState = {
  filterStatus: 'Semua',
  filterPriority: 'Semua',
  filterAssignee: 'Semua',
  searchQuery: '',
};

const PRIORITIES = ['Semua', 'Tinggi', 'Normal'];
const COPYWRITER_STATUSES = ['Semua', 'Ide', 'Perlu Naskah', 'Revisi Naskah'];

function getRoleBaseItems(role) {
  if (role === ROLES.COPYWRITER) return taskItems.filter(isCopywriterQueueItem);
  if (role === ROLES.EDITOR) return taskItems.filter(isEditorQueueItem);
  return taskItems;
}

function getAvailableStatusFilters(role) {
  if (role === ROLES.COPYWRITER) return COPYWRITER_STATUSES;
  if (role === ROLES.EDITOR) return ['Siap Edit'];
  return ['Semua', ...WORKFLOW_STATUSES];
}

function applyTaskFilters(role) {
  const base = getRoleBaseItems(role);
  const validStatuses = getAvailableStatusFilters(role);
  const effectiveStatus = validStatuses.includes(taskState.filterStatus)
    ? taskState.filterStatus
    : validStatuses[0];

  return base.filter(item => {
    const okS = effectiveStatus === 'Semua' || item.status === effectiveStatus;
    const okP = taskState.filterPriority === 'Semua' || item.priority === taskState.filterPriority;
    const okA = role !== ROLES.KETUA_TIM || taskState.filterAssignee === 'Semua' || item.assignee === taskState.filterAssignee;
    const okQ = !taskState.searchQuery ||
      item.title.toLowerCase().includes(taskState.searchQuery) ||
      item.project.toLowerCase().includes(taskState.searchQuery) ||
      (item.notes || '').toLowerCase().includes(taskState.searchQuery);
    return okS && okP && okA && okQ;
  });
}

function activeFilterCount(role) {
  const validStatuses = getAvailableStatusFilters(role);
  const effectiveStatus = validStatuses.includes(taskState.filterStatus)
    ? taskState.filterStatus
    : validStatuses[0];

  return [
    role !== ROLES.EDITOR && effectiveStatus !== 'Semua',
    taskState.filterPriority !== 'Semua',
    role === ROLES.KETUA_TIM && taskState.filterAssignee !== 'Semua',
    !!taskState.searchQuery,
  ].filter(Boolean).length;
}

function priorityBadge(p) {
  const cls = p === 'Tinggi' ? 'prio-high' : 'prio-normal';
  return `<span class="priority-badge ${cls}">${escapeHtml(p)}</span>`;
}

function roleCueHtml(item, role) {
  if (role === ROLES.COPYWRITER) {
    const hasScript = Boolean(item.script && item.script.trim());
    const hasCaption = Boolean(item.caption && item.caption.trim());
    return `
      <div class="task-role-meta">
        <span>Script: <strong>${hasScript ? 'Terisi' : 'Kosong'}</strong></span>
        <span>·</span>
        <span>Caption: <strong>${hasCaption ? 'Terisi' : 'Kosong'}</strong></span>
      </div>
    `;
  }
  if (role === ROLES.EDITOR) {
    const hasRaw = isValidHttpUrl(item.rawFootageUrl);
    return `
      <div class="task-role-meta">
        <span>${hasRaw ? '📁 Raw Footage Drive tersedia' : '📁 Belum ada link Drive'}</span>
        <span>·</span>
        <span>${item.script ? '✍️ Naskah siap' : '✍️ Tanpa naskah'}</span>
      </div>
    `;
  }
  return '';
}

function renderTaskTable(items, role) {
  if (items.length === 0) {
    if (role === ROLES.COPYWRITER && !taskState.searchQuery && taskState.filterPriority === 'Semua') {
      return `
        <div class="cal-empty-state">
          Semua tugas naskah & caption telah selesai dan masuk antrean <strong>Siap Edit</strong> Editor!
        </div>
      `;
    }
    if (role === ROLES.EDITOR && !taskState.searchQuery && taskState.filterPriority === 'Semua') {
      return `
        <div class="cal-empty-state">
          Belum ada tugas baru berstatus <strong>"Siap Edit"</strong> saat ini. Tugas yang ditandai "Siap Edit" oleh Copywriter akan otomatis tampil di sini.
        </div>
      `;
    }
    return `<div class="cal-empty-state">Tidak ada tugas yang cocok dengan filter aktif.</div>`;
  }

  return `
    <div class="task-table full-task-table">
      <div class="table-head full-task-head">
        <span>KONTEN / TUGAS</span>
        <span>PLATFORM & KATEGORI</span>
        <span>PENANGGUNG JAWAB</span>
        <span>DEADLINE</span>
        <span>PRIORITAS</span>
        <span>STATUS</span>
        <span>AKSI</span>
      </div>
      ${items.map(item => {
        const isKetua = role === ROLES.KETUA_TIM;
        const actionLabel = role === ROLES.COPYWRITER
          ? 'Tulis Naskah'
          : role === ROLES.EDITOR
            ? 'Proses Edit'
            : (item.status === 'Menunggu Review' ? 'Review & Approve' : 'Kelola');
        const btnClass = (item.status === 'Menunggu Review' && isKetua) || role !== ROLES.KETUA_TIM
          ? 'btn-primary'
          : 'btn-secondary';

        return `
        <div class="task-row full-task-row ${item.isOverdue ? 'row-overdue' : ''}">
          <div class="task-name">
            <span class="task-check ${item.isOverdue ? 'overdue' : ''}" aria-hidden="true">${item.isOverdue ? '!' : '✓'}</span>
            <div style="min-width:0;">
              <strong>${escapeHtml(item.title)}</strong>
              ${item.notes ? `<div class="task-note">${escapeHtml(item.notes)}</div>` : ''}
              ${roleCueHtml(item, role)}
            </div>
          </div>
          <div class="task-col-project">
            <span class="platform-chip ${normalizePlatformClass(item.platform)}" style="font-size:10px;">${escapeHtml(item.platform)}</span>
            <div class="cl-muted" style="font-size:11px;margin-top:3px;">${escapeHtml(item.category)}</div>
          </div>
          <div class="assignee task-col-assignee">
            <span class="mini-avatar">${escapeHtml(item.initials)}</span>
            <div>
              <div class="cl-muted">${escapeHtml(item.assignee)}</div>
              <div style="font-size:10px;color:var(--color-ink-muted);">CW: ${escapeHtml(item.assigneeCopywriter.split(' ')[0])} · ED: ${escapeHtml(item.assigneeEditor.split(' ')[0])}</div>
            </div>
          </div>
          <div class="deadline task-col-deadline ${item.isOverdue ? 'late' : ''}">${escapeHtml(formatShortDateId(item.deadline))}</div>
          <div class="task-col-priority">${priorityBadge(item.priority)}</div>
          <div class="task-col-status">
            ${isKetua ? `
              <select class="status-select" data-task-id="${escapeHtml(item.id)}" aria-label="Ubah status ${escapeHtml(item.title)}">
                ${WORKFLOW_STATUSES.map(s =>
                  `<option value="${escapeHtml(s)}" ${s === item.status ? 'selected' : ''}>${escapeHtml(s)}</option>`
                ).join('')}
              </select>
            ` : `
              <span class="status-pill ${item.statusClass}">${escapeHtml(item.status)}</span>
            `}
          </div>
          <div class="task-col-action">
            <button
              type="button"
              class="${btnClass} task-detail-btn"
              style="padding:6px 11px;font-size:11px;"
              data-task-id="${escapeHtml(item.id)}"
              aria-label="${escapeHtml(actionLabel)} ${escapeHtml(item.title)}"
            >
              ${escapeHtml(actionLabel)}
            </button>
          </div>
        </div>
      `;
      }).join('')}
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

function renderTaskStats(role, baseItems) {
  const totalInWorkspace = taskItems.length;
  const siapEditCount = taskItems.filter(isEditorQueueItem).length;
  const reviewCount = taskItems.filter(isKetuaReviewItem).length;
  const doneCount = taskItems.filter(t => ['Siap Tayang', 'Dipublikasikan'].includes(t.status)).length;
  const highCount = baseItems.filter(t => t.priority === 'Tinggi').length;

  if (role === ROLES.COPYWRITER) {
    return `
      <div class="pip-stats" id="task-stats-bar" style="margin-bottom:20px;">
        <div class="pip-stat-item">
          <span class="pip-stat-val">${baseItems.length}</span>
          <span class="pip-stat-label">Antrean naskah</span>
        </div>
        <div class="pip-stat-divider"></div>
        <div class="pip-stat-item">
          <span class="pip-stat-val" style="color:var(--color-blush-ink)">${baseItems.filter(i => i.status === 'Revisi Naskah').length}</span>
          <span class="pip-stat-label">Revisi naskah</span>
        </div>
        <div class="pip-stat-divider"></div>
        <div class="pip-stat-item">
          <span class="pip-stat-val" style="color:var(--color-sand-ink)">${highCount}</span>
          <span class="pip-stat-label">Prioritas tinggi</span>
        </div>
        <div class="pip-stat-divider"></div>
        <div class="pip-stat-item">
          <span class="pip-stat-val" style="color:var(--color-sage-ink)">${siapEditCount}</span>
          <span class="pip-stat-label">Sudah Siap Edit (Editor)</span>
        </div>
      </div>
    `;
  }

  if (role === ROLES.EDITOR) {
    return `
      <div class="pip-stats" id="task-stats-bar" style="margin-bottom:20px;">
        <div class="pip-stat-item">
          <span class="pip-stat-val">${baseItems.length}</span>
          <span class="pip-stat-label">Antrean "Siap Edit"</span>
        </div>
        <div class="pip-stat-divider"></div>
        <div class="pip-stat-item">
          <span class="pip-stat-val" style="color:var(--color-blush-ink)">${highCount}</span>
          <span class="pip-stat-label">Prioritas tinggi</span>
        </div>
        <div class="pip-stat-divider"></div>
        <div class="pip-stat-item">
          <span class="pip-stat-val" style="color:var(--color-sand-ink)">${reviewCount}</span>
          <span class="pip-stat-label">Menunggu Review Ketua</span>
        </div>
        <div class="pip-stat-divider"></div>
        <div class="pip-stat-item">
          <span class="pip-stat-val" style="color:var(--color-sage-ink)">${doneCount}</span>
          <span class="pip-stat-label">Disetujui / Tayang</span>
        </div>
      </div>
    `;
  }

  return `
    <div class="pip-stats" id="task-stats-bar" style="margin-bottom:20px;">
      <div class="pip-stat-item">
        <span class="pip-stat-val">${totalInWorkspace}</span>
        <span class="pip-stat-label">Total konten/tugas</span>
      </div>
      <div class="pip-stat-divider"></div>
      <div class="pip-stat-item">
        <span class="pip-stat-val" style="color:var(--color-blush-ink)">${reviewCount}</span>
        <span class="pip-stat-label">Menunggu Review</span>
      </div>
      <div class="pip-stat-divider"></div>
      <div class="pip-stat-item">
        <span class="pip-stat-val" style="color:var(--color-sand-ink)">${siapEditCount}</span>
        <span class="pip-stat-label">Siap Edit (Editor)</span>
      </div>
      <div class="pip-stat-divider"></div>
      <div class="pip-stat-item">
        <span class="pip-stat-val" style="color:var(--color-sage-ink)">${doneCount}</span>
        <span class="pip-stat-label">Siap / Tayang</span>
      </div>
    </div>
  `;
}

export function renderTasks() {
  const user = getCurrentUser();
  const role = user?.role || ROLES.COPYWRITER;
  const perms = getRolePermissions(role);
  const baseItems = getRoleBaseItems(role);
  const filtered = applyTaskFilters(role);
  const activeCount = activeFilterCount(role);
  const statusOptions = getAvailableStatusFilters(role);
  const activeStatus = statusOptions.includes(taskState.filterStatus) ? taskState.filterStatus : statusOptions[0];
  const assigneesList = ['Semua', ...teamMembers.map(m => m.name)];

  const subtitle = role === ROLES.COPYWRITER
    ? 'Daftar khusus tugas konten yang membutuhkan script & caption (Copywriter)'
    : role === ROLES.EDITOR
      ? 'Daftar khusus tugas berstatus "Siap Edit" lengkap dengan raw footage Google Drive & naskah Copywriter'
      : 'Kelola seluruh konten, penugasan Copywriter/Editor, serta review & approval hasil akhir';

  return `
    <div class="page-heading">
      <div>
        <div class="eyebrow">WORKSPACE / MANAJEMEN TUGAS (${escapeHtml(role.toUpperCase())})</div>
        <h1>${role === ROLES.COPYWRITER ? 'Antrean Naskah Copywriter' : role === ROLES.EDITOR ? 'Antrean Siap Edit (Editor)' : 'Manajemen Tugas & Approval'}</h1>
        <p>${escapeHtml(subtitle)}</p>
      </div>
      ${perms.canCreateContent ? `
        <button type="button" class="btn-primary" id="btn-task-new"><span>＋</span> Buat Konten / Tugas</button>
      ` : `
        <span class="filter-summary-chip">Filter Peran Aktif: ${escapeHtml(role)}</span>
      `}
    </div>

    ${renderTaskStats(role, baseItems)}

    <!-- Filter & Search -->
    <div class="panel" style="margin-bottom:20px; padding: 16px 20px;">
      <div class="task-filter-bar">
        <div class="task-search-wrap">
          <span class="search-icon" aria-hidden="true">🔍</span>
          <input
            type="text"
            id="task-search"
            class="task-search-input"
            placeholder="Cari judul konten atau catatan..."
            value="${escapeHtml(taskState.searchQuery)}"
            aria-label="Cari tugas"
          />
        </div>
        ${role !== ROLES.EDITOR ? filterSelect('tf-status', statusOptions, activeStatus, 'Status') : ''}
        ${filterSelect('tf-priority', PRIORITIES, taskState.filterPriority, 'Prioritas')}
        ${role === ROLES.KETUA_TIM ? filterSelect('tf-assignee', assigneesList, taskState.filterAssignee, 'Penanggungjawab') : ''}
        <span id="task-clear-wrap" style="align-self:flex-end;">
          ${activeCount > 0 ? `<button type="button" class="btn-secondary" id="task-clear-filters">Hapus filter</button>` : ''}
        </span>
      </div>
      <div id="task-count-info" style="font-size:11px;color:var(--color-ink-muted);margin-top:10px;">
        Menampilkan ${filtered.length} dari ${baseItems.length} item pada antrean ${escapeHtml(role)}
      </div>
    </div>

    <!-- Task Table -->
    <div class="panel" id="task-list-panel" style="margin-bottom:20px; padding: 0 0 8px;">
      ${renderTaskTable(filtered, role)}
    </div>

    <div class="demo-banner">
      <span class="demo-banner-icon">✳</span>
      <div class="demo-banner-content">
        <strong>Alur Tugas Lintas Peran — Simulasi Lokal</strong>
        <p>Copywriter mengisi naskah → "Siap Edit" → tampil otomatis di Editor → tempel output URL → "Menunggu Review" → Approval Ketua Tim.</p>
      </div>
      <span class="demo-badge">SIMULASI</span>
    </div>
  `;
}

// ─────────────────────────────────────────────────────────────────────────────
// Event binding
// ─────────────────────────────────────────────────────────────────────────────

function attachTaskRowEvents(renderApp, showToast, role) {
  if (role === ROLES.KETUA_TIM) {
    document.querySelectorAll('.status-select').forEach(sel => {
      sel.addEventListener('change', () => {
        const taskId = sel.dataset.taskId;
        const item = taskItems.find(t => t.id === taskId);
        if (!item) return;
        const oldStatus = item.status;
        if (!STATUS_TO_META[sel.value]) return;
        updateContentByKetua({
          id: taskId,
          status: sel.value,
          isOverdue: false,
        });
        showToast(`"${item.title}": ${oldStatus} → ${sel.value}`);
        renderApp();
      });
    });
  }

  document.querySelectorAll('.task-detail-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      openContentWorkflowModal(btn.dataset.taskId, renderApp, showToast);
    });
  });
}

function updateTaskListOnly(renderApp, showToast, role) {
  const baseItems = getRoleBaseItems(role);
  const filtered = applyTaskFilters(role);
  const panelEl = document.querySelector('#task-list-panel');
  const countEl = document.querySelector('#task-count-info');
  const clearWrap = document.querySelector('#task-clear-wrap');

  if (panelEl) panelEl.innerHTML = renderTaskTable(filtered, role);
  if (countEl) countEl.textContent = `Menampilkan ${filtered.length} dari ${baseItems.length} item pada antrean ${role}`;
  if (clearWrap) {
    const activeCount = activeFilterCount(role);
    clearWrap.innerHTML = activeCount > 0
      ? `<button type="button" class="btn-secondary" id="task-clear-filters">Hapus filter</button>`
      : '';
    document.querySelector('#task-clear-filters')?.addEventListener('click', () => {
      taskState.filterStatus = 'Semua';
      taskState.filterPriority = 'Semua';
      taskState.filterAssignee = 'Semua';
      taskState.searchQuery = '';
      renderApp();
    });
  }
  attachTaskRowEvents(renderApp, showToast, role);
}

export function attachTaskEvents(renderApp, showToast) {
  const role = getCurrentUser()?.role || ROLES.COPYWRITER;

  document.querySelector('#btn-task-new')?.addEventListener('click', () => {
    openNewContentModal(renderApp, showToast);
  });

  document.querySelectorAll('.task-filter-select').forEach(sel => {
    sel.addEventListener('change', () => {
      const id = sel.dataset.filterId;
      const val = sel.value;
      if (id === 'tf-status') taskState.filterStatus = val;
      if (id === 'tf-priority') taskState.filterPriority = val;
      if (id === 'tf-assignee') taskState.filterAssignee = val;
      renderApp();
    });
  });

  document.querySelector('#task-search')?.addEventListener('input', (e) => {
    taskState.searchQuery = e.target.value.toLowerCase().trim();
    updateTaskListOnly(renderApp, showToast, role);
  });

  document.querySelector('#task-clear-filters')?.addEventListener('click', () => {
    taskState.filterStatus = 'Semua';
    taskState.filterPriority = 'Semua';
    taskState.filterAssignee = 'Semua';
    taskState.searchQuery = '';
    renderApp();
  });

  attachTaskRowEvents(renderApp, showToast, role);
}
