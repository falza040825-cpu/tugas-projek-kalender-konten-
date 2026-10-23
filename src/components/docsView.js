import { sotDocs } from '../data/mockData.js';

export function renderDocsView(activeDocKey = 'PRD') {
  const currentDoc = sotDocs[activeDocKey] || sotDocs.PRD;

  return `
    <div class="page-heading">
      <div>
        <div class="eyebrow">GOVERNANCE / SOURCE OF TRUTH</div>
        <h1>Dokumen Acuan SOT</h1>
        <p>Tiga dokumen acuan tunggal proyek sesuai kontrak kerja <code>AGENTS.md</code>.</p>
      </div>
      <button class="btn-secondary" data-route="Overview">
        ← Kembali ke Overview
      </button>
    </div>

    <div style="display: grid; grid-template-columns: 280px 1fr; gap: 20px; align-items: start;">
      <!-- SOT Select List -->
      <div class="panel" style="padding: 0; overflow: hidden;">
        <div style="padding: 18px 20px 12px; border-bottom: 1px solid var(--color-border);">
          <h3 style="font-size: 14px; margin: 0;">Dokumen Acuan</h3>
          <span style="font-size: 10px; color: var(--color-ink-muted);">Versi 0.1 · Draft SOT</span>
        </div>

        <div>
          ${Object.values(sotDocs).map(doc => `
            <button 
              class="sot-doc-item ${doc.id === activeDocKey ? 'selected' : ''}" 
              data-doc-key="${doc.id}"
              style="
                width: 100%;
                text-align: left;
                padding: 16px 20px;
                border: 0;
                border-bottom: 1px solid var(--color-border-subtle);
                background: ${doc.id === activeDocKey ? 'var(--color-surface-subtle)' : 'transparent'};
                border-left: 3px solid ${doc.id === activeDocKey ? 'var(--color-sage-ink)' : 'transparent'};
                cursor: pointer;
              "
            >
              <strong style="display: block; font-size: 13px; color: var(--color-ink); margin-bottom: 4px;">
                ${doc.title}
              </strong>
              <small style="display: block; font-size: 11px; color: var(--color-ink-muted);">
                <code>docs/${doc.filename}</code>
              </small>
            </button>
          `).join('')}
        </div>
      </div>

      <!-- SOT Preview Body -->
      <div class="panel">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid var(--color-border);">
          <div>
            <span class="eyebrow">${currentDoc.filename}</span>
            <h2 style="font-size: 20px; margin: 4px 0 6px;">${currentDoc.title}</h2>
            <p style="font-size: 12px; color: var(--color-ink-secondary); margin: 0;">${currentDoc.subtitle}</p>
          </div>
          <span class="role-badge-pill">${currentDoc.status}</span>
        </div>

        <div style="background-color: var(--color-surface-subtle); border: 1px solid var(--color-border); border-radius: var(--radius-control); padding: 16px; margin-bottom: 20px;">
          <strong style="font-size: 12px; color: var(--color-ink); display: block; margin-bottom: 8px;">
            Poin Inti Dokumen SOT:
          </strong>
          <ul style="padding-left: 20px; font-size: 12px; color: var(--color-ink-secondary); line-height: 1.8;">
            ${currentDoc.bullets.map(b => `<li>${b}</li>`).join('')}
          </ul>
        </div>

        <div style="font-size: 12px; color: var(--color-ink-muted); line-height: 1.6;">
          <p>📌 Dokumentasi lengkap tersimpan dalam folder <code>docs/${currentDoc.filename}</code> pada repositori proyek.</p>
        </div>
      </div>
    </div>
  `;
}
