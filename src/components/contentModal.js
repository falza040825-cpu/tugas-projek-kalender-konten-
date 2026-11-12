/**
 * Modal Unified & Role-Adaptive Workflow — Yayasan Motivator Qur'an
 * - openNewContentModal: Khusus Ketua Tim (buat ide/konten baru, raw footage Drive, assign tim)
 * - openContentWorkflowModal: Adaptif per peran (Ketua Tim approval/assign, Copywriter script/caption -> Siap Edit, Editor raw footage/naskah + output URL -> Menunggu Review)
 */

import {
  ROLES,
  STATUS_TO_META,
  WORKFLOW_STATUSES,
  pipelineStages,
  usersData,
  contentItems,
  getCurrentUser,
  getRolePermissions,
  isCopywriterQueueItem,
  isEditorQueueItem,
  createContentItem,
  updateCopywriterWork,
  submitEditorWork,
  reviewByKetuaTim,
  updateContentByKetua,
} from '../data/mockData.js';
import {
  escapeHtml,
  isValidHttpUrl,
  normalizePlatformClass,
} from '../utils/helpers.js';

function getMembersByRole(role) {
  return usersData.filter(u => u.status === 'Aktif' && u.role === role);
}

function copyToClipboard(text, showToast, label = 'Tautan') {
  if (!text) return;
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(
      () => showToast(`${label} disalin ke clipboard (simulasi lokal).`),
      () => showToast(`${label} siap disalin: ${text}`)
    );
  } else {
    showToast(`${label}: ${text}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Modal Buat Konten / Ide Baru (Khusus Ketua Tim)
// ─────────────────────────────────────────────────────────────────────────────

export function openNewContentModal(renderApp, showToast, defaultDate = '2026-10-20') {
  const user = getCurrentUser();
  const perms = getRolePermissions(user?.role);
  if (!perms.canCreateContent) {
    showToast('Akses dibatasi: hanya Ketua Tim yang dapat membuat kartu ide konten baru.');
    return;
  }

  const modalContainer = document.querySelector('#modal-container');
  if (!modalContainer) return;

  const copywriters = getMembersByRole(ROLES.COPYWRITER);
  const editors = getMembersByRole(ROLES.EDITOR);
  const allActive = usersData.filter(u => u.status === 'Aktif');
  const cwOptions = copywriters.length > 0 ? copywriters : allActive;
  const edOptions = editors.length > 0 ? editors : allActive;

  modalContainer.innerHTML = `
    <div class="modal-backdrop" id="content-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="content-modal-title">
      <div class="panel modal-card" style="width:min(560px,100%);">
        <button type="button" class="modal-close-btn" id="close-modal" aria-label="Tutup modal">✕</button>
        <span class="eyebrow">KETUA TIM · KARTU IDE & PENUGASAN</span>
        <h2 id="content-modal-title" style="font-size: 20px; margin: 6px 0 6px;">Buat Konten / Tugas Baru</h2>
        <p style="font-size: 12px; color: var(--color-ink-secondary); margin-bottom: 18px;">
          Item baru otomatis sinkron ke Kalender, Pipeline, Manajemen Tugas, dan antrean anggota (simulasi lokal).
        </p>

        <form id="demo-content-form" novalidate style="display: flex; flex-direction: column; gap: 14px;">
          <div>
            <label class="form-label" for="nc-title">Judul Konten *</label>
            <input id="nc-title" class="form-control" placeholder="Contoh: Keutamaan Tadabbur Pagi" />
            <div id="nc-title-error" class="form-error" role="alert" style="display:none;"></div>
          </div>

          <div class="form-grid-2">
            <div>
              <label class="form-label" for="nc-platform">Platform</label>
              <select id="nc-platform" class="form-control">
                <option value="Instagram">Instagram</option>
                <option value="TikTok">TikTok</option>
                <option value="YouTube">YouTube</option>
              </select>
            </div>
            <div>
              <label class="form-label" for="nc-category">Kategori</label>
              <select id="nc-category" class="form-control">
                <option value="Edukasi">Edukasi</option>
                <option value="Promosi">Promosi</option>
                <option value="Informasi">Informasi</option>
                <option value="Hiburan">Hiburan</option>
              </select>
            </div>
          </div>

          <div class="form-grid-2">
            <div>
              <label class="form-label" for="nc-prod-date">Tanggal Produksi</label>
              <input id="nc-prod-date" type="date" class="form-control" value="2026-10-16" />
            </div>
            <div>
              <label class="form-label" for="nc-pub-date">Tanggal Publikasi *</label>
              <input id="nc-pub-date" type="date" class="form-control" value="${escapeHtml(defaultDate)}" />
              <div id="nc-date-error" class="form-error" role="alert" style="display:none;"></div>
            </div>
          </div>

          <div class="form-grid-2">
            <div>
              <label class="form-label" for="nc-assign-cw">Assign Copywriter</label>
              <select id="nc-assign-cw" class="form-control">
                ${cwOptions.map(m => `<option value="${escapeHtml(m.name)}">${escapeHtml(m.name)} (${escapeHtml(m.role)})</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="form-label" for="nc-assign-ed">Assign Editor</label>
              <select id="nc-assign-ed" class="form-control">
                ${edOptions.map(m => `<option value="${escapeHtml(m.name)}">${escapeHtml(m.name)} (${escapeHtml(m.role)})</option>`).join('')}
              </select>
            </div>
          </div>

          <div class="form-grid-2">
            <div>
              <label class="form-label" for="nc-stage">Status / Tahap Awal</label>
              <select id="nc-stage" class="form-control">
                <option value="naskah" selected>Perlu Naskah (Antrean Copywriter)</option>
                <option value="ide">Ide / Perencanaan (Antrean Copywriter)</option>
                <option value="siap-edit">Siap Edit (Langsung ke Antrean Editor)</option>
                ${pipelineStages.filter(s => !['naskah', 'ide', 'siap-edit'].includes(s.id)).map(s => `<option value="${escapeHtml(s.id)}">${escapeHtml(s.label)}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="form-label" for="nc-priority">Prioritas</label>
              <select id="nc-priority" class="form-control">
                <option value="Normal">Normal</option>
                <option value="Tinggi">Tinggi</option>
              </select>
            </div>
          </div>

          <div>
            <label class="form-label" for="nc-raw-url">Tautan Raw Footage (Google Drive, opsional)</label>
            <input id="nc-raw-url" type="url" class="form-control" placeholder="https://drive.google.com/drive/folders/..." />
            <div id="nc-url-error" class="form-error" role="alert" style="display:none;"></div>
          </div>

          <div>
            <label class="form-label" for="nc-notes">Brief / Arahan Konten</label>
            <textarea id="nc-notes" class="form-control form-textarea" rows="2" placeholder="Catatan pesan utama, CTA, atau referensi..."></textarea>
          </div>

          <div class="modal-footer">
            <button type="button" id="cancel-modal" class="btn-secondary">Batal</button>
            <button type="submit" class="btn-primary">Buat & Tugaskan (Simulasi)</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const titleInput = document.querySelector('#nc-title');
  titleInput?.focus();

  const onKeyDown = (e) => { if (e.key === 'Escape') closeModal(); };
  const closeModal = () => {
    document.removeEventListener('keydown', onKeyDown);
    modalContainer.innerHTML = '';
  };

  document.addEventListener('keydown', onKeyDown);
  document.querySelector('#close-modal')?.addEventListener('click', closeModal);
  document.querySelector('#cancel-modal')?.addEventListener('click', closeModal);
  document.querySelector('#content-modal-backdrop')?.addEventListener('click', (e) => {
    if (e.target.id === 'content-modal-backdrop') closeModal();
  });

  document.querySelector('#demo-content-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const titleEl = document.querySelector('#nc-title');
    const titleErr = document.querySelector('#nc-title-error');
    const dateErr = document.querySelector('#nc-date-error');
    const urlErr = document.querySelector('#nc-url-error');

    const title = titleEl?.value.trim() || '';
    const platform = document.querySelector('#nc-platform')?.value || 'Instagram';
    const category = document.querySelector('#nc-category')?.value || 'Edukasi';
    const prodDate = document.querySelector('#nc-prod-date')?.value || '2026-10-16';
    const pubDate = document.querySelector('#nc-pub-date')?.value || '';
    const assigneeCopywriter = document.querySelector('#nc-assign-cw')?.value || 'Nadia Putri';
    const assigneeEditor = document.querySelector('#nc-assign-ed')?.value || 'Raka Pratama';
    const stage = document.querySelector('#nc-stage')?.value || 'naskah';
    const priority = document.querySelector('#nc-priority')?.value || 'Normal';
    const rawFootageUrl = document.querySelector('#nc-raw-url')?.value.trim() || '';
    const notes = document.querySelector('#nc-notes')?.value.trim() || '';

    let hasError = false;
    if (!title) {
      titleErr.textContent = 'Judul konten wajib diisi.';
      titleErr.style.display = 'block';
      titleEl?.focus();
      hasError = true;
    } else {
      titleErr.style.display = 'none';
    }

    if (!pubDate) {
      dateErr.textContent = 'Tanggal publikasi wajib dipilih.';
      dateErr.style.display = 'block';
      hasError = true;
    } else if (prodDate && pubDate < prodDate) {
      dateErr.textContent = 'Tanggal publikasi tidak boleh sebelum tanggal produksi.';
      dateErr.style.display = 'block';
      hasError = true;
    } else {
      dateErr.style.display = 'none';
    }

    if (rawFootageUrl && !isValidHttpUrl(rawFootageUrl)) {
      urlErr.textContent = 'Tautan Google Drive harus diawali https:// atau http://.';
      urlErr.style.display = 'block';
      hasError = true;
    } else {
      urlErr.style.display = 'none';
    }

    if (hasError) return;

    const created = createContentItem({
      title,
      platform,
      category,
      prodDate,
      pubDate,
      deadline: pubDate,
      priority,
      assigneeCopywriter,
      assigneeEditor,
      rawFootageUrl,
      notes,
      stage,
    });

    closeModal();
    showToast(`"${created.title}" ditambahkan (${created.status}) dan tersinkron di localStorage.`);
    renderApp();
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Modal Ruang Kerja Konten Adaptif Berdasarkan Peran
// ─────────────────────────────────────────────────────────────────────────────

export function openContentWorkflowModal(itemId, renderApp, showToast) {
  const modalContainer = document.querySelector('#modal-container');
  const item = contentItems.find(c => c.id === itemId);
  const user = getCurrentUser();
  if (!modalContainer || !item || !user) return;

  const role = user.role;
  const statusMeta = STATUS_TO_META[item.status] || STATUS_TO_META['Ide'];
  const statusClass = item.isOverdue ? 'st-late' : statusMeta.statusClass;
  const platClass = normalizePlatformClass(item.platform);
  const hasRawDrive = isValidHttpUrl(item.rawFootageUrl);
  const hasOutputUrl = isValidHttpUrl(item.outputUrl);

  let bodyHtml = '';

  if (role === ROLES.COPYWRITER) {
    const canSubmitEdit = isCopywriterQueueItem(item);
    bodyHtml = `
      <div class="wf-brief-box">
        <div class="wf-section-label">ARAHAN KETUA TIM & RAW FOOTAGE</div>
        <p class="wf-brief-note">${item.notes ? escapeHtml(item.notes) : 'Belum ada catatan tambahan dari Ketua Tim.'}</p>
        ${hasRawDrive ? `
          <div class="wf-link-inline">
            <span>📁 Raw Footage tersedia:</span>
            <a href="${escapeHtml(item.rawFootageUrl)}" target="_blank" rel="noopener noreferrer" class="wf-ext-link">Buka Google Drive (Demo) ↗</a>
          </div>
        ` : `<div class="wf-muted-hint">Raw Footage Google Drive belum dilampirkan.</div>`}
      </div>

      <form id="wf-copywriter-form" novalidate class="wf-form-stack">
        <div>
          <label class="form-label" for="wf-script">Script / Naskah Konten *</label>
          <textarea id="wf-script" class="form-control form-textarea" rows="4" placeholder="Tulis hook, isi utama, dan CTA naskah di sini...">${escapeHtml(item.script || '')}</textarea>
        </div>

        <div>
          <label class="form-label" for="wf-caption">Caption Publikasi *</label>
          <textarea id="wf-caption" class="form-control form-textarea" rows="3" placeholder="Tulis caption lengkap beserta tagar yang relevan...">${escapeHtml(item.caption || '')}</textarea>
        </div>

        <div id="wf-cw-error" class="form-error" role="alert" style="display:none;"></div>

        <div class="modal-footer wf-footer-between">
          <button type="button" id="close-wf-cancel" class="btn-secondary">Tutup</button>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button type="button" id="btn-cw-draft" class="btn-secondary">Simpan Draft</button>
            ${canSubmitEdit ? `
              <button type="submit" id="btn-cw-ready" class="btn-primary">
                ✓ Tandai "Siap Edit"
              </button>
            ` : `
              <span class="filter-summary-chip">Status saat ini: ${escapeHtml(item.status)}</span>
            `}
          </div>
        </div>
      </form>
    `;
  } else if (role === ROLES.EDITOR) {
    const canSubmitReview = isEditorQueueItem(item);
    bodyHtml = `
      <div class="wf-resource-card">
        <div class="wf-section-label">1. TAUTAN RAW FOOTAGE (GOOGLE DRIVE)</div>
        ${hasRawDrive ? `
          <div class="wf-link-box">
            <div class="wf-link-url">${escapeHtml(item.rawFootageUrl)}</div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px;">
              <a href="${escapeHtml(item.rawFootageUrl)}" target="_blank" rel="noopener noreferrer" class="btn-secondary wf-link-btn">
                Buka Google Drive (Demo) ↗
              </a>
              <button type="button" id="btn-copy-raw" class="btn-secondary wf-link-btn">Salin Link</button>
            </div>
          </div>
        ` : `<div class="wf-muted-hint">Belum ada tautan raw footage dari Ketua Tim.</div>`}
      </div>

      <div class="wf-resource-card">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:6px;">
          <div class="wf-section-label" style="margin-bottom:0;">2. NASKAH & CAPTION DARI COPYWRITER (${escapeHtml(item.assigneeCopywriter || 'Copywriter')})</div>
          <button type="button" id="btn-copy-script" class="btn-secondary" style="padding:4px 10px;font-size:10px;">Salin Teks</button>
        </div>
        <div class="wf-readonly-text">
          <strong>Script:</strong>
          <p>${item.script ? escapeHtml(item.script) : '<em>Belum diisi Copywriter.</em>'}</p>
          <strong>Caption:</strong>
          <p>${item.caption ? escapeHtml(item.caption) : '<em>Belum diisi Copywriter.</em>'}</p>
        </div>
        ${item.notes ? `<div class="wf-note-inline"><strong>Catatan:</strong> ${escapeHtml(item.notes)}</div>` : ''}
      </div>

      <form id="wf-editor-form" novalidate class="wf-form-stack">
        <div>
          <label class="form-label" for="wf-output-url">3. Tautan Hasil Editan (Output URL) *</label>
          <input
            id="wf-output-url"
            type="url"
            class="form-control"
            value="${escapeHtml(item.outputUrl || '')}"
            placeholder="Tempel link Google Drive / Frame.io / YouTube Unlisted hasil edit..."
            ${canSubmitReview ? '' : 'readonly'}
          />
          <div id="wf-output-error" class="form-error" role="alert" style="display:none;"></div>
        </div>

        <div class="modal-footer wf-footer-between">
          <button type="button" id="close-wf-cancel" class="btn-secondary">Tutup</button>
          ${canSubmitReview ? `
            <button type="submit" id="btn-ed-submit" class="btn-primary">
              ✓ Kirim ke "Menunggu Review"
            </button>
          ` : `
            <span class="filter-summary-chip">Hanya item "Siap Edit" yang dapat dikirim</span>
          `}
        </div>
      </form>
    `;
  } else {
    // KETUA TIM (Super Admin)
    const allCw = getMembersByRole(ROLES.COPYWRITER);
    const allEd = getMembersByRole(ROLES.EDITOR);
    const activeAll = usersData.filter(u => u.status === 'Aktif');
    const cwList = allCw.length > 0 ? allCw : activeAll;
    const edList = allEd.length > 0 ? allEd : activeAll;
    const isReviewPending = item.status === 'Menunggu Review';

    bodyHtml = `
      ${isReviewPending ? `
        <div class="wf-approval-banner">
          <div class="wf-section-label" style="color:var(--color-red-dark);">PERSETUJUAN AKHIR KETUA TIM (MENUNGGU REVIEW)</div>
          <p style="font-size:12px;color:var(--color-ink-secondary);margin:4px 0 10px;">
            Periksa tautan hasil editan dari <strong>${escapeHtml(item.assigneeEditor)}</strong> dan naskah dari <strong>${escapeHtml(item.assigneeCopywriter)}</strong> lalu pilih keputusan:
          </p>
          ${hasOutputUrl ? `
            <div class="wf-link-box" style="margin-bottom:10px;background:var(--color-surface);">
              <span class="filter-label">OUTPUT HASIL EDITAN</span>
              <div class="wf-link-url">${escapeHtml(item.outputUrl)}</div>
              <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px;">
                <a href="${escapeHtml(item.outputUrl)}" target="_blank" rel="noopener noreferrer" class="btn-secondary wf-link-btn">Buka Tautan Output ↗</a>
                <button type="button" id="btn-copy-output" class="btn-secondary wf-link-btn">Salin Link Output</button>
              </div>
            </div>
          ` : `<div class="wf-muted-hint" style="margin-bottom:10px;">Belum ada output URL.</div>`}

          <div style="margin-bottom:10px;">
            <label class="form-label" for="wf-rev-note">Catatan Review / Revisi (opsional jika disetujui, dianjurkan jika revisi)</label>
            <input id="wf-rev-note" class="form-control" placeholder="Contoh: Opening sudah bagus, atau perbaiki subtitle menit 0:12" />
          </div>

          <div class="wf-approval-actions">
            <button type="button" class="btn-primary" id="btn-approve-ready">✓ Setujui → Siap Tayang</button>
            <button type="button" class="btn-gold" id="btn-approve-publish">📡 Setujui & Publikasikan</button>
            <button type="button" class="btn-secondary" id="btn-rev-editor">🔄 Revisi ke Editor</button>
            <button type="button" class="btn-secondary" id="btn-rev-cw">🔄 Revisi Naskah (Copywriter)</button>
          </div>
        </div>
      ` : ''}

      <div class="wf-resource-card">
        <div class="wf-section-label">RINGKASAN NASKAH & TAUTAN</div>
        <div class="wf-readonly-text">
          <strong>Script:</strong>
          <p>${item.script ? escapeHtml(item.script) : '<em>Belum ada naskah.</em>'}</p>
          <strong>Caption:</strong>
          <p>${item.caption ? escapeHtml(item.caption) : '<em>Belum ada caption.</em>'}</p>
          <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:6px;">
            <span>Raw Footage: ${hasRawDrive ? `<a href="${escapeHtml(item.rawFootageUrl)}" target="_blank" rel="noopener noreferrer" class="wf-ext-link">Buka Drive ↗</a>` : '<em>Belum ada</em>'}</span>
            <span>Output: ${hasOutputUrl ? `<a href="${escapeHtml(item.outputUrl)}" target="_blank" rel="noopener noreferrer" class="wf-ext-link">Buka Output ↗</a>` : '<em>Belum ada</em>'}</span>
          </div>
        </div>
      </div>

      <form id="wf-ketua-form" novalidate class="wf-form-stack">
        <div class="form-grid-2">
          <div>
            <label class="form-label" for="wk-title">Judul Konten *</label>
            <input id="wk-title" class="form-control" value="${escapeHtml(item.title)}" />
          </div>
          <div>
            <label class="form-label" for="wk-status">Status Alur</label>
            <select id="wk-status" class="form-control">
              ${WORKFLOW_STATUSES.map(s => `<option value="${escapeHtml(s)}" ${s === item.status ? 'selected' : ''}>${escapeHtml(s)}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="form-grid-2">
          <div>
            <label class="form-label" for="wk-cw">Assign Copywriter</label>
            <select id="wk-cw" class="form-control">
              ${cwList.map(m => `<option value="${escapeHtml(m.name)}" ${m.name === item.assigneeCopywriter ? 'selected' : ''}>${escapeHtml(m.name)}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="form-label" for="wk-ed">Assign Editor</label>
            <select id="wk-ed" class="form-control">
              ${edList.map(m => `<option value="${escapeHtml(m.name)}" ${m.name === item.assigneeEditor ? 'selected' : ''}>${escapeHtml(m.name)}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="form-grid-2">
          <div>
            <label class="form-label" for="wk-deadline">Deadline</label>
            <input id="wk-deadline" type="date" class="form-control" value="${escapeHtml(item.deadline || item.pubDate)}" />
          </div>
          <div>
            <label class="form-label" for="wk-priority">Prioritas</label>
            <select id="wk-priority" class="form-control">
              <option value="Normal" ${item.priority === 'Normal' ? 'selected' : ''}>Normal</option>
              <option value="Tinggi" ${item.priority === 'Tinggi' ? 'selected' : ''}>Tinggi</option>
            </select>
          </div>
        </div>

        <div>
          <label class="form-label" for="wk-raw-url">Tautan Raw Footage (Google Drive)</label>
          <input id="wk-raw-url" type="url" class="form-control" value="${escapeHtml(item.rawFootageUrl || '')}" placeholder="https://drive.google.com/drive/folders/..." />
        </div>

        <div>
          <label class="form-label" for="wk-notes">Instruksi / Catatan</label>
          <textarea id="wk-notes" class="form-control form-textarea" rows="2">${escapeHtml(item.notes || '')}</textarea>
        </div>

        <div id="wf-ketua-error" class="form-error" role="alert" style="display:none;"></div>

        <div class="modal-footer wf-footer-between">
          <button type="button" id="close-wf-cancel" class="btn-secondary">Tutup</button>
          <button type="submit" class="btn-primary">Simpan Pengaturan Konten</button>
        </div>
      </form>
    `;
  }

  modalContainer.innerHTML = `
    <div class="modal-backdrop" id="wf-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="wf-modal-title">
      <div class="panel modal-card" style="width:min(620px,100%);">
        <button type="button" class="modal-close-btn" id="close-wf-modal" aria-label="Tutup modal">✕</button>
        <span class="eyebrow">ALUR KERJA · ${escapeHtml(role.toUpperCase())}</span>
        <h2 id="wf-modal-title" style="font-size:19px;margin:6px 0 10px;">${escapeHtml(item.title)}</h2>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;">
          <span class="platform-chip ${platClass}">${escapeHtml(item.platform)}</span>
          <span class="status-pill ${statusClass}">${item.isOverdue ? '⚑ ' : ''}${escapeHtml(item.status)}</span>
          <span class="filter-summary-chip">${escapeHtml(item.category)} · Tayang ${escapeHtml(item.pubDate)}</span>
        </div>
        ${bodyHtml}
      </div>
    </div>
  `;

  const onKeyDown = (e) => { if (e.key === 'Escape') closeModal(); };
  const closeModal = () => {
    document.removeEventListener('keydown', onKeyDown);
    modalContainer.innerHTML = '';
  };

  document.addEventListener('keydown', onKeyDown);
  document.querySelector('#close-wf-modal')?.addEventListener('click', closeModal);
  document.querySelector('#close-wf-cancel')?.addEventListener('click', closeModal);
  document.querySelector('#wf-modal-backdrop')?.addEventListener('click', (e) => {
    if (e.target.id === 'wf-modal-backdrop') closeModal();
  });

  // Copywriter bindings
  if (role === ROLES.COPYWRITER) {
    const scriptEl = document.querySelector('#wf-script');
    const captionEl = document.querySelector('#wf-caption');
    const errEl = document.querySelector('#wf-cw-error');
    scriptEl?.focus();

    document.querySelector('#btn-cw-draft')?.addEventListener('click', () => {
      updateCopywriterWork({
        id: item.id,
        script: scriptEl?.value || '',
        caption: captionEl?.value || '',
        markReadyEdit: false,
      });
      closeModal();
      showToast(`Draft naskah "${item.title}" disimpan ke sesi lokal.`);
      renderApp();
    });

    document.querySelector('#wf-copywriter-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const sVal = scriptEl?.value.trim() || '';
      const cVal = captionEl?.value.trim() || '';
      if (!sVal || !cVal) {
        if (errEl) {
          errEl.textContent = 'Isi Script dan Caption terlebih dahulu sebelum menandai "Siap Edit".';
          errEl.style.display = 'block';
        }
        (!sVal ? scriptEl : captionEl)?.focus();
        return;
      }
      updateCopywriterWork({
        id: item.id,
        script: sVal,
        caption: cVal,
        markReadyEdit: true,
      });
      closeModal();
      showToast(`"${item.title}" ditandai "Siap Edit" dan otomatis masuk antrean Editor!`);
      renderApp();
    });
  }

  // Editor bindings
  if (role === ROLES.EDITOR) {
    const outEl = document.querySelector('#wf-output-url');
    const errEl = document.querySelector('#wf-output-error');
    outEl?.focus();

    document.querySelector('#btn-copy-raw')?.addEventListener('click', () => {
      copyToClipboard(item.rawFootageUrl, showToast, 'Link Raw Footage Drive');
    });

    document.querySelector('#btn-copy-script')?.addEventListener('click', () => {
      const combined = `SCRIPT:\n${item.script || '-'}\n\nCAPTION:\n${item.caption || '-'}`;
      copyToClipboard(combined, showToast, 'Script & Caption');
    });

    document.querySelector('#wf-editor-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const urlVal = outEl?.value.trim() || '';
      if (!isValidHttpUrl(urlVal)) {
        if (errEl) {
          errEl.textContent = 'Tempel tautan hasil editan yang valid (diawali https:// atau http://).';
          errEl.style.display = 'block';
        }
        outEl?.focus();
        return;
      }
      submitEditorWork({ id: item.id, outputUrl: urlVal });
      closeModal();
      showToast(`Output "${item.title}" dikirim ke "Menunggu Review" untuk persetujuan Ketua Tim!`);
      renderApp();
    });
  }

  // Ketua Tim bindings
  if (role === ROLES.KETUA_TIM) {
    document.querySelector('#btn-copy-output')?.addEventListener('click', () => {
      copyToClipboard(item.outputUrl, showToast, 'Link Output');
    });

    document.querySelector('#btn-approve-ready')?.addEventListener('click', () => {
      reviewByKetuaTim({ id: item.id, decision: 'approve_ready' });
      closeModal();
      showToast(`"${item.title}" disetujui Ketua Tim → Siap Tayang!`);
      renderApp();
    });

    document.querySelector('#btn-approve-publish')?.addEventListener('click', () => {
      reviewByKetuaTim({ id: item.id, decision: 'approve_publish' });
      closeModal();
      showToast(`"${item.title}" disetujui & ditandai Dipublikasikan!`);
      renderApp();
    });

    document.querySelector('#btn-rev-editor')?.addEventListener('click', () => {
      const note = document.querySelector('#wf-rev-note')?.value || '';
      reviewByKetuaTim({ id: item.id, decision: 'request_revision', revisionTarget: 'editor', revisionNotes: note });
      closeModal();
      showToast(`"${item.title}" dikembalikan ke antrean "Siap Edit" Editor dengan catatan revisi.`);
      renderApp();
    });

    document.querySelector('#btn-rev-cw')?.addEventListener('click', () => {
      const note = document.querySelector('#wf-rev-note')?.value || '';
      reviewByKetuaTim({ id: item.id, decision: 'request_revision', revisionTarget: 'copywriter', revisionNotes: note });
      closeModal();
      showToast(`"${item.title}" dikembalikan ke Copywriter sebagai "Revisi Naskah".`);
      renderApp();
    });

    document.querySelector('#wf-ketua-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const titleEl = document.querySelector('#wk-title');
      const errEl = document.querySelector('#wf-ketua-error');
      const title = titleEl?.value.trim() || '';
      const rawFootageUrl = document.querySelector('#wk-raw-url')?.value.trim() || '';

      if (!title) {
        if (errEl) {
          errEl.textContent = 'Judul konten wajib diisi.';
          errEl.style.display = 'block';
        }
        titleEl?.focus();
        return;
      }
      if (rawFootageUrl && !isValidHttpUrl(rawFootageUrl)) {
        if (errEl) {
          errEl.textContent = 'Tautan Raw Footage harus diawali https:// atau http://.';
          errEl.style.display = 'block';
        }
        return;
      }

      updateContentByKetua({
        id: item.id,
        title,
        status: document.querySelector('#wk-status')?.value || item.status,
        assigneeCopywriter: document.querySelector('#wk-cw')?.value || item.assigneeCopywriter,
        assigneeEditor: document.querySelector('#wk-ed')?.value || item.assigneeEditor,
        deadline: document.querySelector('#wk-deadline')?.value || item.deadline,
        priority: document.querySelector('#wk-priority')?.value || item.priority,
        rawFootageUrl,
        notes: document.querySelector('#wk-notes')?.value || '',
      });
      closeModal();
      showToast(`Pengaturan "${title}" diperbarui.`);
      renderApp();
    });
  }
}
