/**
 * Alur Produksi (Pipeline) — Yayasan Motivator Qur'an (RBAC Conditional UI)
 * 7 tahap produksi terpadu · Ketua Tim kontrol penuh; Copywriter fokus Naskah → Siap Edit; Editor fokus Siap Edit → Menunggu Review
 */

import {
  ROLES,
  pipelineStages,
  pipelineItems,
  getCurrentUser,
  getRolePermissions,
  movePipelineStageByRole,
} from '../data/mockData.js';
import { openNewContentModal, openContentWorkflowModal } from './contentModal.js';
import { escapeHtml, isValidHttpUrl, normalizePlatformClass } from '../utils/helpers.js';

let pipelineState = {
  filterPlatform: 'Semua',
};

const PLATFORMS = ['Semua', 'Instagram', 'TikTok', 'YouTube'];
const STAGE_IDS = pipelineStages.map(s => s.id);

function getVisibleStagesForRole(role) {
  if (role === ROLES.COPYWRITER) {
    return pipelineStages.filter(s => ['ide', 'naskah', 'revisi'].includes(s.id));
  }
  if (role === ROLES.EDITOR) {
    return pipelineStages.filter(s => s.id === 'siap-edit');
  }
  return pipelineStages;
}

function stageOf(id) {
  return pipelineStages.find(s => s.id === id);
}

function prevStage(stageId) {
  const idx = STAGE_IDS.indexOf(stageId);
  return idx > 0 ? STAGE_IDS[idx - 1] : null;
}

function nextStage(stageId) {
  const idx = STAGE_IDS.indexOf(stageId);
  return idx < STAGE_IDS.length - 1 ? STAGE_IDS[idx + 1] : null;
}

function applyPlatformFilter(items) {
  if (pipelineState.filterPlatform === 'Semua') return items;
  return items.filter(i => i.platform === pipelineState.filterPlatform);
}

function renderPipelineCard(item, role) {
  const isKetua = role === ROLES.KETUA_TIM;
  const prev = isKetua ? prevStage(item.stage) : null;
  const next = isKetua ? nextStage(item.stage) : null;
  const hasRaw = isValidHttpUrl(item.rawFootageUrl);

  const actionLabel = role === ROLES.COPYWRITER
    ? 'Tulis Naskah'
    : role === ROLES.EDITOR
      ? 'Input Output'
      : (item.stage === 'review' ? 'Review' : 'Kelola');

  return `
    <div class="pip-card" data-pip-id="${escapeHtml(item.id)}">
      <div class="pip-card-header">
        <span class="platform-chip ${normalizePlatformClass(item.platform)}">${escapeHtml(item.platform)}</span>
        <span class="pip-cat">${escapeHtml(item.category)}</span>
      </div>
      <div class="pip-card-title">${escapeHtml(item.title)}</div>

      ${role === ROLES.EDITOR ? `
        <div class="pip-role-hints">
          <span>${hasRaw ? '📁 Raw Drive siap' : '📁 Belum ada Drive'}</span>
          <span>·</span>
          <span>${item.script ? '✍️ Naskah tersedia' : 'Naskah kosong'}</span>
        </div>
      ` : ''}

      <div class="pip-card-footer">
        <span class="assignee-chip">
          <span class="mini-avatar">${escapeHtml(item.initials)}</span>
          <span>${escapeHtml(item.owner.split(' ')[0])}</span>
        </span>
        <span class="pip-pub-date">↗ ${escapeHtml(item.pubDate)}</span>
      </div>

      <div class="pip-card-controls">
        ${isKetua ? `
          <div style="display:flex;gap:4px;">
            ${prev ? `<button type="button" class="pip-move-btn prev" data-pip-id="${escapeHtml(item.id)}" data-pip-dir="prev" title="Kembalikan ke ${escapeHtml(stageOf(prev)?.label)}" aria-label="Pindah ${escapeHtml(item.title)} ke tahap sebelumnya">←</button>` : ''}
            ${next ? `<button type="button" class="pip-move-btn next" data-pip-id="${escapeHtml(item.id)}" data-pip-dir="next" title="Maju ke ${escapeHtml(stageOf(next)?.label)}" aria-label="Pindah ${escapeHtml(item.title)} ke tahap berikutnya">→</button>` : ''}
          </div>
        ` : '<span></span>'}
        <button type="button" class="btn-secondary pip-open-btn" data-wf-id="${escapeHtml(item.id)}" style="padding:4px 9px;font-size:10px;">
          ${escapeHtml(actionLabel)}
        </button>
      </div>
    </div>
  `;
}

function renderStageColumn(stage, items, role) {
  const stageItems = items.filter(i => i.stage === stage.id);
  return `
    <div class="pip-col ${role === ROLES.EDITOR ? 'pip-col-wide' : ''}" data-stage="${stage.id}">
      <div class="pip-col-head">
        <span class="pip-stage-icon" aria-hidden="true">${stage.icon}</span>
        <span class="pip-stage-label">${stage.label}</span>
        <span class="pip-count-badge">${stageItems.length}</span>
      </div>
      <div class="pip-col-body">
        ${stageItems.length > 0
          ? stageItems.map(i => renderPipelineCard(i, role)).join('')
          : '<div class="pip-empty">Tidak ada item pada tahap ini</div>'
        }
      </div>
    </div>
  `;
}

function renderPipelineStats(allFilteredItems, role) {
  const siapEdit = allFilteredItems.filter(i => i.stage === 'siap-edit').length;
  const review = allFilteredItems.filter(i => i.stage === 'review').length;
  const naskah = allFilteredItems.filter(i => ['ide', 'naskah', 'revisi'].includes(i.stage)).length;
  const publishedOrReady = allFilteredItems.filter(i => ['siap', 'published'].includes(i.stage)).length;

  return `
    <div class="pip-stats">
      <div class="pip-stat-item">
        <span class="pip-stat-val">${naskah}</span>
        <span class="pip-stat-label">Antrean Copywriter</span>
      </div>
      <div class="pip-stat-divider"></div>
      <div class="pip-stat-item">
        <span class="pip-stat-val" style="color:var(--color-sand-ink)">${siapEdit}</span>
        <span class="pip-stat-label">Siap Edit (Editor)</span>
      </div>
      <div class="pip-stat-divider"></div>
      <div class="pip-stat-item">
        <span class="pip-stat-val" style="color:var(--color-lavender-ink)">${review}</span>
        <span class="pip-stat-label">Menunggu Review</span>
      </div>
      <div class="pip-stat-divider"></div>
      <div class="pip-stat-item">
        <span class="pip-stat-val" style="color:var(--color-sage-ink)">${role === ROLES.KETUA_TIM ? publishedOrReady : allFilteredItems.length}</span>
        <span class="pip-stat-label">${role === ROLES.KETUA_TIM ? 'Siap / Tayang' : 'Total konten platform'}</span>
      </div>
    </div>
  `;
}

export function renderPipeline() {
  const user = getCurrentUser();
  const role = user?.role || ROLES.COPYWRITER;
  const perms = getRolePermissions(role);
  const items = applyPlatformFilter(pipelineItems);
  const visibleStages = getVisibleStagesForRole(role);
  const visibleCount = items.filter(i => visibleStages.some(s => s.id === i.stage)).length;

  const roleDesc = role === ROLES.COPYWRITER
    ? 'Board terfokus tahap Copywriter (Ide, Perlu Naskah, Revisi). Tandai "Siap Edit" agar otomatis berpindah ke Editor.'
    : role === ROLES.EDITOR
      ? 'Antrean visual khusus status "Siap Edit". Klik "Input Output" untuk menempel tautan hasil edit & kirim ke "Menunggu Review".'
      : 'Papan penuh 7 tahap alur produksi · Ketua Tim dapat memindahkan tahap atau membuka kartu untuk review & approval';

  return `
    <div class="page-heading">
      <div>
        <div class="eyebrow">WORKSPACE / ALUR PRODUKSI (${escapeHtml(role.toUpperCase())})</div>
        <h1>Alur Produksi</h1>
        <p>${escapeHtml(roleDesc)}</p>
      </div>
      ${perms.canCreateContent ? `
        <button type="button" class="btn-primary" id="btn-pip-new"><span>＋</span> Tambah Item</button>
      ` : `
        <span class="filter-summary-chip">Board Peran: ${escapeHtml(role)}</span>
      `}
    </div>

    ${renderPipelineStats(items, role)}

    <!-- Platform Filter -->
    <div class="panel" style="margin-bottom:20px; padding:14px 20px;">
      <div class="filter-row" style="align-items:center;justify-content:space-between;">
        <div class="filter-group">
          <span class="filter-label">Filter Platform</span>
          <div class="filter-pills">
            ${PLATFORMS.map(p => `
              <button type="button" class="filter-pill ${p === pipelineState.filterPlatform ? 'active' : ''}" data-pip-platform="${p}">
                ${p}
              </button>
            `).join('')}
          </div>
        </div>
        <span class="filter-summary-chip">Menampilkan ${visibleCount} konten pada kolom ${escapeHtml(role)}</span>
      </div>
    </div>

    <!-- Pipeline board -->
    <div class="pip-board-wrapper">
      <div class="pip-board" id="pip-board" aria-label="Board alur produksi konten">
        ${visibleStages.map(stage => renderStageColumn(stage, items, role)).join('')}
      </div>
    </div>

    <div class="demo-banner" style="margin-top:24px;">
      <span class="demo-banner-icon">✳</span>
      <div class="demo-banner-content">
        <strong>Alur Produksi Terhubung — Simulasi Lokal</strong>
        <p>Perpindahan tahap dari Copywriter → "Siap Edit" → "Menunggu Review" → Approval Ketua Tim tersinkron langsung di Kalender & Manajemen Tugas.</p>
      </div>
      <span class="demo-badge">SIMULASI</span>
    </div>
  `;
}

export function attachPipelineEvents(renderApp, showToast) {
  const role = getCurrentUser()?.role || ROLES.COPYWRITER;

  document.querySelectorAll('[data-pip-platform]').forEach(btn => {
    btn.addEventListener('click', () => {
      pipelineState.filterPlatform = btn.dataset.pipPlatform;
      renderApp();
    });
  });

  if (role === ROLES.KETUA_TIM) {
    document.querySelectorAll('.pip-move-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const pipId  = btn.dataset.pipId;
        const dir    = btn.dataset.pipDir;
        const item   = pipelineItems.find(i => i.id === pipId);
        if (!item) return;

        const newStage = dir === 'next' ? nextStage(item.stage) : prevStage(item.stage);
        if (!newStage) return;

        const oldLabel = stageOf(item.stage)?.label;
        const newLabel = stageOf(newStage)?.label;
        movePipelineStageByRole(pipId, newStage);
        showToast(`"${item.title}" dipindahkan: ${oldLabel} → ${newLabel}`);
        renderApp();
      });
    });
  }

  document.querySelectorAll('.pip-open-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      openContentWorkflowModal(btn.dataset.wfId, renderApp, showToast);
    });
  });

  document.querySelector('#btn-pip-new')?.addEventListener('click', () => {
    openNewContentModal(renderApp, showToast);
  });
}
