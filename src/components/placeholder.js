import { navigationItems } from '../data/mockData.js';

export function renderPlaceholder(routeId) {
  const item = navigationItems.find(n => n.id === routeId) || {
    label: routeId,
    phase: 2
  };

  const phaseText = item.phase === 2 
    ? 'Fase 2 (Halaman Operasional)' 
    : 'Fase 3 (Workspace Pendukung)';

  return `
    <div class="page-heading">
      <div>
        <div class="eyebrow">WORKSPACE / ${routeId.toUpperCase()}</div>
        <h1>${item.label}</h1>
        <p>Area halaman operasional sesuai kontrak kerja SOT.</p>
      </div>
      <button class="btn-secondary" data-route="Overview">
        ← Kembali ke Overview
      </button>
    </div>

    <div class="placeholder-container">
      <div class="placeholder-badge">
        <span>✳</span> Terjadwal pada ${phaseText}
      </div>
      <h2>Halaman ${item.label} Siap Dikerjakan</h2>
      <p>
        Berdasarkan <code>IMPLEMENTATION_PLAN.md</code> dan kontrak kerja <code>AGENTS.md</code>, 
        halaman operasional ini berada pada <strong>${phaseText}</strong> dan akan diimplementasikan 
        setelah <strong>Fase 1 (Fondasi front-end)</strong> secara resmi disetujui pengguna.
      </p>

      <div class="placeholder-actions">
        <button class="btn-primary" data-route="Overview">
          Lihat Dashboard Fase 1
        </button>
        <button class="btn-secondary" data-route="Dokumen SOT">
          Periksa SOT & Implementation Plan
        </button>
      </div>
    </div>
  `;
}
