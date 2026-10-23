/**
 * Aset & File — StudioFlow Fase 3
 * Daftar aset dummy dengan filter tipe, grid/list toggle, tautan placeholder
 */

import { assetsData } from '../data/mockData.js';

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
        <span class="asset-type-icon">${TYPE_ICONS[item.type] || '📁'}</span>
        <div>
          <strong>${item.name}</strong>
          <div class="asset-project-label">${item.project}</div>
        </div>
      </div>
      <div><span class="asset-tag ${TYPE_CLASSES[item.tag] || ''}">${item.tag}</span></div>
      <div class="cl-muted">${item.size}</div>
      <div class="assignee">
        <span class="mini-avatar">${item.initials}</span>
        <span class="cl-muted">${item.uploader}</span>
      </div>
      <div class="cl-muted">${item.date}</div>
      <div style="display:flex;gap:6px;">
        <button class="btn-secondary asset-link-btn" style="padding:5px 10px;font-size:11px;" data-ast-id="${item.id}" aria-label="Buka ${item.name}">
          Buka ↗
        </button>
      </div>
    </div>
  `;
}

function renderAssetGridCard(item) {
  return `
    <div class="asset-grid-card">
      <div class="asset-grid-icon">${TYPE_ICONS[item.type] || '📁'}</div>
      <div class="asset-grid-name">${item.name}</div>
      <div class="asset-grid-meta">
        <span class="asset-tag ${TYPE_CLASSES[item.tag] || ''}">${item.tag}</span>
        <span class="cl-muted" style="font-size:10px;">${item.size}</span>
      </div>
      <div class="asset-grid-footer">
        <span class="assignee">
          <span class="mini-avatar" style="width:20px;height:20px;font-size:9px;">${item.initials}</span>
          <span class="cl-muted" style="font-size:10px;">${item.uploader.split(' ')[0]}</span>
        </span>
        <button class="btn-secondary asset-link-btn" style="padding:4px 8px;font-size:10px;" data-ast-id="${item.id}" aria-label="Buka ${item.name}">↗</button>
      </div>
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
        <p>Daftar berkas dummy terkait konten · ${filtered.length} dari ${total} aset · Unggahan nyata di luar lingkup Fase 3</p>
      </div>
      <button class="btn-primary" id="btn-asset-upload"><span>＋</span> Unggah (Demo)</button>
    </div>

    <!-- Filter & Controls -->
    <div class="panel" style="margin-bottom:20px;padding:16px 20px;">
      <div class="asset-filter-bar">
        <div class="task-search-wrap" style="max-width:280px;">
          <span class="search-icon">🔍</span>
          <input
            type="text"
            id="asset-search"
            class="task-search-input"
            placeholder="Cari nama file atau proyek..."
            value="${assetState.searchQuery}"
            aria-label="Cari aset"
          />
        </div>
        <div class="filter-pills" id="asset-type-filter">
          ${TYPES.map(t => `
            <button class="filter-pill ${t === assetState.filterType ? 'active' : ''}"
              data-asset-filter="${t}" aria-label="Filter ${t}">
              ${t !== 'Semua' ? TYPE_ICONS[t] + ' ' : ''}${t}
            </button>
          `).join('')}
        </div>
        <div class="view-toggle-group" style="margin-left:auto;" role="group" aria-label="Mode tampilan">
          <button class="view-toggle-btn ${assetState.viewMode === 'list' ? 'active' : ''}" id="asset-view-list" data-asset-view="list" aria-label="Tampilan daftar">≡ Daftar</button>
          <button class="view-toggle-btn ${assetState.viewMode === 'grid' ? 'active' : ''}" id="asset-view-grid" data-asset-view="grid" aria-label="Tampilan grid">⊞ Grid</button>
        </div>
      </div>
    </div>

    <!-- Asset Display -->
    <div class="panel" style="margin-bottom:20px; ${assetState.viewMode === 'list' ? 'padding:0 0 8px;' : 'padding:20px;'}">
      ${assetState.viewMode === 'list'
        ? `
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
        `
        : `
          <div class="asset-grid">
            ${filtered.length > 0
              ? filtered.map(renderAssetGridCard).join('')
              : '<div class="cal-empty-state">Tidak ada aset yang cocok.</div>'
            }
          </div>
        `
      }
    </div>

    <div class="demo-banner">
      <span class="demo-banner-icon">✳</span>
      <div class="demo-banner-content">
        <strong>Aset & File — Fase 3</strong>
        <p>Semua berkas adalah data dummy. Tautan "Buka ↗" adalah placeholder. Unggahan nyata memerlukan storage backend.</p>
      </div>
      <span class="demo-badge">FASE 3</span>
    </div>
  `;
}

export function attachAssetsEvents(renderApp, showToast) {
  // Filter tipe
  document.querySelectorAll('[data-asset-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      assetState.filterType = btn.dataset.assetFilter;
      renderApp();
    });
  });

  // View mode toggle
  document.querySelectorAll('[data-asset-view]').forEach(btn => {
    btn.addEventListener('click', () => {
      assetState.viewMode = btn.dataset.assetView;
      renderApp();
    });
  });

  // Search
  document.querySelector('#asset-search')?.addEventListener('input', e => {
    assetState.searchQuery = e.target.value.toLowerCase().trim();
    renderApp();
  });

  // Open link (demo feedback)
  document.querySelectorAll('.asset-link-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id   = btn.dataset.astId;
      const item = assetsData.find(a => a.id === id);
      if (!item) return;
      showToast(`"${item.name}" — tautan placeholder. Akses file nyata memerlukan storage backend.`);
    });
  });

  // Upload demo
  document.querySelector('#btn-asset-upload')?.addEventListener('click', () => {
    showToast('Unggah file: simulasi UI saja. Penyimpanan nyata memerlukan backend storage.');
  });
}
