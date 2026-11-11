/**
 * Aset & File — StudioFlow Fase 3 & QA Fase 4
 * Daftar aset dummy dengan filter tipe, grid/list toggle, tautan placeholder
 */

import { assetsData } from '../data/mockData.js';
import { escapeHtml } from '../utils/helpers.js';

const TYPES = ['Semua', 'Desain', 'Video', 'Gambar', 'Dokumen', 'Audio'];

let assetState = {
  filterType: 'Semua',
  viewMode: 'list', // 'list' | 'grid'
  searchQuery: '',
};

const TYPE_ICONS = {
  'Desain':   '🎨',
  'Video':    '🎬',
  'Gambar':   '🖼',
  'Dokumen':  '📄',
  'Audio':    '🎵',
};

const TYPE_CLASSES = {
  'Desain':   'tag-desain',
  'Video':    'tag-video',
  'Gambar':   'tag-gambar',
  'Dokumen':  'tag-dokumen',
  'Audio':    'tag-audio',
};

function applyAssetFilters(items) {
  return items.filter(item => {
    const okT = assetState.filterType === 'Semua' || item.type === assetState.filterType;
    const okQ = !assetState.searchQuery ||
      item.name.toLowerCase().includes(assetState.searchQuery) ||
      item.project.toLowerCase().includes(assetState.searchQuery);
    return okT && okQ;
  });
}

function renderAssetListRow(item) {
  return `
    <div class="asset-list-row">
      <div class="asset-name-cell">
        <span class="asset-type-icon" aria-hidden="true">${TYPE_ICONS[item.type] || '📁'}</span>
        <div style="min-width:0;">
          <strong>${escapeHtml(item.name)}</strong>
          <div class="asset-project-label">${escapeHtml(item.project)}</div>
        </div>
      </div>
      <div class="asset-col-type"><span class="asset-tag ${TYPE_CLASSES[item.tag] || ''}">${escapeHtml(item.tag)}</span></div>
      <div class="cl-muted asset-col-size">${escapeHtml(item.size)}</div>
      <div class="assignee asset-col-uploader">
        <span class="mini-avatar">${escapeHtml(item.initials)}</span>
        <span class="cl-muted">${escapeHtml(item.uploader)}</span>
      </div>
      <div class="cl-muted asset-col-date">${escapeHtml(item.date)}</div>
      <div class="asset-col-action" style="display:flex;gap:6px;">
        <button type="button" class="btn-secondary asset-link-btn" style="padding:5px 10px;font-size:11px;" data-ast-id="${escapeHtml(item.id)}" aria-label="Buka ${escapeHtml(item.name)}">
          Buka ↗
        </button>
      </div>
    </div>
  `;
}

function renderAssetGridCard(item) {
  return `
    <div class="asset-grid-card">
      <div class="asset-grid-icon" aria-hidden="true">${TYPE_ICONS[item.type] || '📁'}</div>
      <div class="asset-grid-name">${escapeHtml(item.name)}</div>
      <div class="asset-project-label" style="margin-top:0;">${escapeHtml(item.project)}</div>
      <div class="asset-grid-meta">
        <span class="asset-tag ${TYPE_CLASSES[item.tag] || ''}">${escapeHtml(item.tag)}</span>
        <span class="cl-muted" style="font-size:10px;">${escapeHtml(item.size)}</span>
      </div>
      <div class="asset-grid-footer">
        <span class="assignee">
          <span class="mini-avatar" style="width:20px;height:20px;font-size:9px;">${escapeHtml(item.initials)}</span>
          <span class="cl-muted" style="font-size:10px;">${escapeHtml(item.uploader.split(' ')[0])}</span>
        </span>
        <button type="button" class="btn-secondary asset-link-btn" style="padding:4px 8px;font-size:10px;" data-ast-id="${escapeHtml(item.id)}" aria-label="Buka ${escapeHtml(item.name)}">↗</button>
      </div>
    </div>
  `;
}

function renderAssetDisplay(filtered) {
  if (assetState.viewMode === 'list') {
    return `
      <div class="asset-list-head">
        <span>NAMA FILE</span>
        <span>TIPE</span>
        <span>UKURAN</span>
        <span>DIUNGGAH OLEH</span>
        <span>TANGGAL</span>
        <span>AKSI</span>
      </div>
      ${filtered.length > 0
        ? filtered.map(renderAssetListRow).join('')
        : '<div class="cal-empty-state">Tidak ada aset yang cocok.</div>'
      }
    `;
  }
  return `
    <div class="asset-grid">
      ${filtered.length > 0
        ? filtered.map(renderAssetGridCard).join('')
        : '<div class="cal-empty-state">Tidak ada aset yang cocok.</div>'
      }
    </div>
  `;
}

export function renderAssets() {
  const filtered = applyAssetFilters(assetsData);
  const total    = assetsData.length;

  return `
    <div class="page-heading">
      <div>
        <div class="eyebrow">WORKSPACE / ASET & FILE</div>
        <h1>Aset & File</h1>
        <p id="asset-count-info">Daftar berkas dummy terkait konten · ${filtered.length} dari ${total} aset · Unggahan nyata di luar lingkup prototipe</p>
      </div>
      <button type="button" class="btn-primary" id="btn-asset-upload"><span>＋</span> Unggah (Demo)</button>
    </div>

    <!-- Filter & Controls -->
    <div class="panel" style="margin-bottom:20px;padding:16px 20px;">
      <div class="asset-filter-bar">
        <div class="task-search-wrap" style="max-width:280px;">
          <span class="search-icon" aria-hidden="true">🔍</span>
          <input
            type="text"
            id="asset-search"
            class="task-search-input"
            placeholder="Cari nama file atau proyek..."
            value="${escapeHtml(assetState.searchQuery)}"
            aria-label="Cari aset"
          />
        </div>
        <div class="filter-pills" id="asset-type-filter">
          ${TYPES.map(t => `
            <button type="button" class="filter-pill ${t === assetState.filterType ? 'active' : ''}"
              data-asset-filter="${t}" aria-label="Filter ${t}">
              ${t !== 'Semua' ? TYPE_ICONS[t] + ' ' : ''}${t}
            </button>
          `).join('')}
        </div>
        <div class="view-toggle-group" style="margin-left:auto;" role="group" aria-label="Mode tampilan">
          <button type="button" class="view-toggle-btn ${assetState.viewMode === 'list' ? 'active' : ''}" id="asset-view-list" data-asset-view="list" aria-label="Tampilan daftar">≡ Daftar</button>
          <button type="button" class="view-toggle-btn ${assetState.viewMode === 'grid' ? 'active' : ''}" id="asset-view-grid" data-asset-view="grid" aria-label="Tampilan grid">⊞ Grid</button>
        </div>
      </div>
    </div>

    <!-- Asset Display -->
    <div class="panel" id="asset-display-panel" style="margin-bottom:20px; ${assetState.viewMode === 'list' ? 'padding:0 0 8px;' : 'padding:20px;'}">
      ${renderAssetDisplay(filtered)}
    </div>

    <div class="demo-banner">
      <span class="demo-banner-icon">✳</span>
      <div class="demo-banner-content">
        <strong>Aset & File — Simulasi Lokal</strong>
        <p>Semua berkas adalah data dummy. Tautan "Buka ↗" adalah placeholder. Unggahan nyata memerlukan storage backend.</p>
      </div>
      <span class="demo-badge">SIMULASI</span>
    </div>
  `;
}

function attachAssetDisplayEvents(showToast) {
  document.querySelectorAll('.asset-link-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id   = btn.dataset.astId;
      const item = assetsData.find(a => a.id === id);
      if (!item) return;
      showToast(`"${item.name}" — tautan placeholder. Akses file nyata memerlukan storage backend.`);
    });
  });
}

export function attachAssetsEvents(renderApp, showToast) {
  document.querySelectorAll('[data-asset-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      assetState.filterType = btn.dataset.assetFilter;
      renderApp();
    });
  });

  document.querySelectorAll('[data-asset-view]').forEach(btn => {
    btn.addEventListener('click', () => {
      assetState.viewMode = btn.dataset.assetView;
      renderApp();
    });
  });

  document.querySelector('#asset-search')?.addEventListener('input', e => {
    assetState.searchQuery = e.target.value.toLowerCase().trim();
    const filtered = applyAssetFilters(assetsData);
    const panelEl = document.querySelector('#asset-display-panel');
    const countEl = document.querySelector('#asset-count-info');
    if (panelEl) panelEl.innerHTML = renderAssetDisplay(filtered);
    if (countEl) countEl.textContent = `Daftar berkas dummy terkait konten · ${filtered.length} dari ${assetsData.length} aset · Unggahan nyata di luar lingkup prototipe`;
    attachAssetDisplayEvents(showToast);
  });

  attachAssetDisplayEvents(showToast);

  document.querySelector('#btn-asset-upload')?.addEventListener('click', () => {
    showToast('Unggah file: simulasi UI saja. Penyimpanan nyata memerlukan backend storage.');
  });
}
