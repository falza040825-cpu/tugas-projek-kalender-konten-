/**
 * Modal Unified: Buat Konten Baru (Simulasi Sesi Lokal)
 * Digunakan oleh Dashboard, Kalender Konten, dan Alur Produksi
 */

import {
  calendarItems,
  pipelineItems,
  pipelineStages,
  upcomingSchedules,
  recentActivities,
  statsOverview,
  teamMembers,
  currentUser,
} from '../data/mockData.js';
import { escapeHtml, formatShortDateId, formatScheduleTileDate } from '../utils/helpers.js';

const STAGE_TO_CAL_STATUS = {
  ide:       { status: 'Ide',          statusClass: 'st-idea' },
  naskah:    { status: 'Naskah',       statusClass: 'st-script' },
  desain:    { status: 'Dalam proses', statusClass: 'st-progress' },
  editing:   { status: 'Dalam proses', statusClass: 'st-progress' },
  review:    { status: 'Review',       statusClass: 'st-review' },
  approval:  { status: 'Review',       statusClass: 'st-review' },
  siap:      { status: 'Siap tayang',  statusClass: 'st-ready' },
  published: { status: 'Dipublikasikan', statusClass: 'st-published' },
};

const PLATFORM_TILE_COLOR = {
  Instagram: 'sage',
  TikTok: 'lavender',
  YouTube: 'sand',
};

export function openNewContentModal(renderApp, showToast, defaultDate = '2026-10-20') {
  const modalContainer = document.querySelector('#modal-container');
  if (!modalContainer) return;

  modalContainer.innerHTML = `
    <div class="modal-backdrop" id="content-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="content-modal-title">
      <div class="panel modal-card">
        <button type="button" class="modal-close-btn" id="close-modal" aria-label="Tutup modal">✕</button>
        <span class="eyebrow">SIMULASI FORM LOKAL</span>
        <h2 id="content-modal-title" style="font-size: 20px; margin: 6px 0 6px;">Buat Konten Baru</h2>
        <p style="font-size: 12px; color: var(--color-ink-secondary); margin-bottom: 18px;">
          Item baru akan ditambahkan ke data sesi lokal (Kalender, Pipeline, dan Overview). Tidak tersimpan ke server.
        </p>

        <form id="demo-content-form" novalidate style="display: flex; flex-direction: column; gap: 14px;">
          <div>
            <label class="form-label" for="nc-title">Judul Konten *</label>
            <input id="nc-title" class="form-control" placeholder="Contoh: 5 Tips Belajar Produktif" />
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
              <label class="form-label" for="nc-owner">Pemilik / PJ</label>
              <select id="nc-owner" class="form-control">
                ${teamMembers.map(m => `<option value="${escapeHtml(m.name)}">${escapeHtml(m.name)}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="form-label" for="nc-stage">Tahap Awal Pipeline</label>
              <select id="nc-stage" class="form-control">
                ${pipelineStages.map(s => `<option value="${escapeHtml(s.id)}">${escapeHtml(s.label)}</option>`).join('')}
              </select>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" id="cancel-modal" class="btn-secondary">Batal</button>
            <button type="submit" class="btn-primary">Simpan (Simulasi)</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const titleInput = document.querySelector('#nc-title');
  titleInput?.focus();

  const onKeyDown = (e) => {
    if (e.key === 'Escape') closeModal();
  };

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

    const title = titleEl.value.trim();
    const platform = document.querySelector('#nc-platform').value;
    const category = document.querySelector('#nc-category').value;
    const prodDate = document.querySelector('#nc-prod-date').value || '2026-10-16';
    const pubDate = document.querySelector('#nc-pub-date').value;
    const owner = document.querySelector('#nc-owner').value;
    const stage = document.querySelector('#nc-stage').value;

    let hasError = false;
    if (!title) {
      titleErr.textContent = 'Judul konten wajib diisi.';
      titleErr.style.display = 'block';
      titleEl.focus();
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

    if (hasError) return;

    const member = teamMembers.find(m => m.name === owner) || { name: owner, initials: 'SF' };
    const statusInfo = STAGE_TO_CAL_STATUS[stage] || STAGE_TO_CAL_STATUS.ide;
    const stamp = Date.now();

    calendarItems.unshift({
      id: `cal-${stamp}`,
      title,
      platform,
      category,
      status: statusInfo.status,
      statusClass: statusInfo.statusClass,
      prodDate,
      pubDate,
      owner: member.name,
      initials: member.initials,
    });

    pipelineItems.unshift({
      id: `pip-${stamp}`,
      title,
      platform,
      category,
      stage,
      owner: member.name,
      initials: member.initials,
      pubDate: formatShortDateId(pubDate),
    });

    upcomingSchedules.unshift({
      id: `sch-${stamp}`,
      title,
      platform,
      category,
      date: formatScheduleTileDate(pubDate),
      time: '10.00',
      color: PLATFORM_TILE_COLOR[platform] || 'sage',
    });
    if (upcomingSchedules.length > 5) upcomingSchedules.pop();

    recentActivities.unshift({
      id: `act-${stamp}`,
      user: currentUser.name,
      initials: currentUser.avatar,
      action: 'menambahkan item konten (simulasi)',
      target: title,
      time: 'Baru saja',
      avatarClass: 'av-sage',
    });
    if (recentActivities.length > 5) recentActivities.pop();

    statsOverview.planned.value += 1;

    closeModal();
    showToast(`Konten "${title}" ditambahkan untuk sesi ini (data dummy lokal).`);
    renderApp();
  });
}

