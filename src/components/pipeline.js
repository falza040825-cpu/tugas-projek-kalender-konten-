/**
 * Alur Produksi (Pipeline) — StudioFlow Fase 2 & QA Fase 4
 * 8 tahap produksi konten · Ubah stage via tombol · Filter platform · Tambah item lokal
 */

import { pipelineStages, pipelineItems } from '../data/mockData.js';
import { openNewContentModal } from './contentModal.js';
import { escapeHtml } from '../utils/helpers.js';

let pipelineState = {
  filterPlatform: 'Semua',
};

const PLATFORMS = ['Semua', 'Instagram', 'TikTok', 'YouTube'];
const STAGE_IDS = pipelineStages.map(s => s.id);

function stageOf(id) {
  return pipelineStages.find(s => s.id === id);
}

function platformColor(p) {
  if (p === 'Instagram') return 'plat-instagram';
  if (p === 'TikTok')    return 'plat-tiktok';
  if (p === 'YouTube')   return 'plat-youtube';
  return '';
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

// ─────────────────────────────────────────────────────────────────────────────
// Render kartu konten pipeline
// ─────────────────────────────────────────────────────────────────────────────

function renderPipelineCard(item) {
  const prev = prevStage(item.stage);
  const next = nextStage(item.stage);

  return `
    <div class="pip-card" data-pip-id="${escapeHtml(item.id)}" tabindex="0">
      <div class="pip-card-header">
        <span class="platform-chip ${platformColor(item.platform)}">${escapeHtml(item.platform)}</span>
        <span class="pip-cat">${escapeHtml(item.category)}</span>
      </div>
      <div class="pip-card-title">${escapeHtml(item.title)}</div>
      <div class="pip-card-footer">
        <span class="assignee-chip">
          <span class="mini-avatar">${escapeHtml(item.initials)}</span>
          <span>${escapeHtml(item.owner.split(' ')[0])}</span>
        </span>
        <span class="pip-pub-date">↗ ${escapeHtml(item.pubDate)}</span>
      </div>
      <div class="pip-card-controls">
        ${prev ? `<button type="button" class="pip-move-btn prev" data-pip-id="${escapeHtml(item.id)}" data-pip-dir="prev" title="Kembalikan ke ${escapeHtml(stageOf(prev)?.label)}" aria-label="Pindah ${escapeHtml(item.title)} ke tahap sebelumnya">←</button>` : '<span></span>'}
        ${next ? `<button type="button" class="pip-move-btn next" data-pip-id="${escapeHtml(item.id)}" data-pip-dir="next" title="Maju ke ${escapeHtml(stageOf(next)?.label)}" aria-label="Pindah ${escapeHtml(item.title)} ke tahap berikutnya">→</button>` : '<span></span>'}
      </div>
    </div>
  `;
}

// ─────────────────────────────────────────────────────────────────────────────
// Render kolom satu stage
// ─────────────────────────────────────────────────────────────────────────────

function renderStageColumn(stage, items) {
  const stageItems = items.filter(i => i.stage === stage.id);
  return `
    <div class="pip-col" data-stage="${stage.id}">
      <div class="pip-col-head">
        <span class="pip-stage-icon" aria-hidden="true">${stage.icon}</span>
        <span class="pip-stage-label">${stage.label}</span>
        <span class="pip-count-badge">${stageItems.length}</span>
      </div>
      <div class="pip-col-body">
        ${stageItems.length > 0
          ? stageItems.map(renderPipelineCard).join('')
          : '<div class="pip-empty">Tidak ada item</div>'
        }
      </div>
    </div>
  `;
}

// ─────────────────────────────────────────────────────────────────────────────
// Ringkasan statistik pipeline
// ─────────────────────────────────────────────────────────────────────────────

function renderPipelineStats(items) {
  const total      = items.length;
  const published  = items.filter(i => i.stage === 'published').length;
  const inProgress = items.filter(i => !['published', 'siap', 'ide'].includes(i.stage)).length;
  const ready      = items.filter(i => i.stage === 'siap').length;

  return `
    <div class="pip-stats">
      <div class="pip-stat-item">
        <span class="pip-stat-val">${total}</span>
        <span class="pip-stat-label">Total item</span>
      </div>
      <div class="pip-stat-divider"></div>
      <div class="pip-stat-item">
        <span class="pip-stat-val" style="color:var(--color-sage-ink)">${published}</span>
        <span class="pip-stat-label">Dipublikasikan</span>
      </div>
      <div class="pip-stat-divider"></div>
      <div class="pip-stat-item">
        <span class="pip-stat-val" style="color:var(--color-lavender-ink)">${ready}</span>
        <span class="pip-stat-label">Siap tayang</span>
      </div>
      <div class="pip-stat-divider"></div>
      <div class="pip-stat-item">
        <span class="pip-stat-val" style="color:var(--color-sand-ink)">${inProgress}</span>
        <span class="pip-stat-label">Dalam proses</span>
      </div>
    </div>
  `;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main render
// ─────────────────────────────────────────────────────────────────────────────

export function renderPipeline() {
  const items = applyPlatformFilter(pipelineItems);

  return `
    <div class="page-heading">
      <div>
        <div class="eyebrow">WORKSPACE / ALUR PRODUKSI</div>
        <h1>Alur Produksi</h1>
        <p>Status pengerjaan konten dalam 8 tahap produksi · Gunakan tombol ← → untuk memindahkan tahap</p>
      </div>
      <button type="button" class="btn-primary" id="btn-pip-new"><span>＋</span> Tambah Item (Demo)</button>
    </div>

    <!-- Stats bar -->
    ${renderPipelineStats(items)}

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
        <span class="filter-summary-chip">Menampilkan ${items.length} dari ${pipelineItems.length} konten</span>
      </div>
    </div>

    <!-- Pipeline board -->
    <div class="pip-board-wrapper">
      <div class="pip-board" id="pip-board" aria-label="Board alur produksi konten">
        ${pipelineStages.map(stage => renderStageColumn(stage, items)).join('')}
      </div>
    </div>

    <div class="demo-banner" style="margin-top:24px;">
      <span class="demo-banner-icon">✳</span>
      <div class="demo-banner-content">
        <strong>Alur Produksi — Simulasi Lokal</strong>
        <p>Perpindahan tahap dan penambahan item bekerja pada sesi UI (data dummy lokal). Tidak ada persistensi backend.</p>
      </div>
      <span class="demo-badge">SIMULASI</span>
    </div>
  `;
}

// ─────────────────────────────────────────────────────────────────────────────
// Event binding
// ─────────────────────────────────────────────────────────────────────────────

export function attachPipelineEvents(renderApp, showToast) {
  document.querySelectorAll('[data-pip-platform]').forEach(btn => {
    btn.addEventListener('click', () => {
      pipelineState.filterPlatform = btn.dataset.pipPlatform;
      renderApp();
    });
  });

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
      item.stage = newStage;
      showToast(`"${item.title}" dipindahkan: ${oldLabel} → ${newLabel}`);
      renderApp();
    });
  });

  document.querySelector('#btn-pip-new')?.addEventListener('click', () => {
    openNewContentModal(renderApp, showToast);
  });
}
