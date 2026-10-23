/**
 * Alur Produksi (Pipeline) — StudioFlow Fase 2
 * 8 tahap produksi konten · Ubah stage via dropdown/tombol · Filter platform
 */

import { pipelineStages, pipelineItems } from '../data/mockData.js';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// Render kartu konten pipeline
// ─────────────────────────────────────────────────────────────────────────────

function renderPipelineCard(item) {
  const prev = prevStage(item.stage);
  const next = nextStage(item.stage);

  return `
    <div class="pip-card" data-pip-id="${item.id}" tabindex="0">
      <div class="pip-card-header">
        <span class="platform-chip ${platformColor(item.platform)}">${item.platform}</span>
        <span class="pip-cat">${item.category}</span>
      </div>
      <div class="pip-card-title">${item.title}</div>
      <div class="pip-card-footer">
        <span class="assignee-chip">
          <span class="mini-avatar">${item.initials}</span>
          <span>${item.owner.split(' ')[0]}</span>
        </span>
        <span class="pip-pub-date">↗ ${item.pubDate}</span>
      </div>
      <div class="pip-card-controls">
        ${prev ? `<button class="pip-move-btn prev" data-pip-id="${item.id}" data-pip-dir="prev" title="Kembalikan ke ${stageOf(prev)?.label}" aria-label="Pindah ke tahap sebelumnya">←</button>` : '<span></span>'}
        ${next ? `<button class="pip-move-btn next" data-pip-id="${item.id}" data-pip-dir="next" title="Maju ke ${stageOf(next)?.label}" aria-label="Pindah ke tahap berikutnya">→</button>` : '<span></span>'}
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
  const items = pipelineItems; // mutable array dari mockData

  return `
    <div class="page-heading">
      <div>
        <div class="eyebrow">WORKSPACE / ALUR PRODUKSI</div>
        <h1>Alur Produksi</h1>
        <p>Status pengerjaan konten dalam 8 tahap produksi · Gunakan tombol ← → untuk memindahkan tahap</p>
      </div>
      <button class="btn-primary" id="btn-pip-new"><span>＋</span> Tambah Item (Demo)</button>
    </div>

    <!-- Stats bar -->
    ${renderPipelineStats(items)}

    <!-- Pipeline board -->
    <div class="pip-board-wrapper">
      <div class="pip-board" id="pip-board" aria-label="Board alur produksi konten">
        ${pipelineStages.map(stage => renderStageColumn(stage, items)).join('')}
      </div>
    </div>

    <div class="demo-banner" style="margin-top:24px;">
      <span class="demo-banner-icon">✳</span>
      <div class="demo-banner-content">
        <strong>Alur Produksi — Fase 2</strong>
        <p>Perpindahan tahap bekerja pada sesi UI (data dummy lokal). Tidak ada persistensi backend.</p>
      </div>
      <span class="demo-badge">FASE 2</span>
    </div>
  `;
}

// ─────────────────────────────────────────────────────────────────────────────
// Event binding
// ─────────────────────────────────────────────────────────────────────────────

export function attachPipelineEvents(renderApp, showToast) {
  // Tombol pindah stage
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

  // Tambah item (demo)
  document.querySelector('#btn-pip-new')?.addEventListener('click', () => {
    showToast('Tambah item pipeline: simulasi UI saja. Backend diperlukan untuk persistensi.');
  });
}
