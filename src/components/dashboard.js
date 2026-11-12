import {
  statsOverview,
  upcomingSchedules,
  taskItems,
  recentActivities,
  getCurrentUser,
  ROLES,
  isCopywriterQueueItem,
  isEditorQueueItem,
  isKetuaReviewItem,
  resetDemoWorkspace,
} from '../data/mockData.js';
import { openContentWorkflowModal } from './contentModal.js';
import { escapeHtml, formatShortDateId } from '../utils/helpers.js';

function getTodayLabel() {
  const now = new Date();
  return now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase();
}

function getRoleDashboardConfig(role) {
  const cwQueue = taskItems.filter(isCopywriterQueueItem);
  const edQueue = taskItems.filter(isEditorQueueItem);
  const ketuaReview = taskItems.filter(isKetuaReviewItem);
  const readyOrDone = taskItems.filter(t => ['Siap Tayang', 'Dipublikasikan'].includes(t.status));

  if (role === ROLES.COPYWRITER) {
    return {
      subtitle: 'Fokus produksi naskah & caption: isi script/caption pada antrean tugas lalu tandai sebagai "Siap Edit".',
      ctaHtml: `<button type="button" class="btn-primary" data-route="Manajemen tugas">✍️ Buka Antrean Naskah (${cwQueue.length})</button>`,
      cards: [
        { label: 'Antrean Perlu Naskah', value: cwQueue.length, kind: 'lavender', icon: '✍️', note: 'Ide, Naskah & Revisi', deltaClass: 'positive' },
        { label: 'Revisi Naskah',        value: cwQueue.filter(i => i.status === 'Revisi Naskah').length, kind: 'rose', icon: '🔄', note: 'Butuh penyesuaian', deltaClass: 'negative' },
        { label: 'Sudah Siap Edit',      value: edQueue.length, kind: 'sage', icon: '🎬', note: 'Sedang di antrean Editor', deltaClass: 'positive' },
        { label: 'Menunggu Review / Tayang', value: ketuaReview.length + readyOrDone.length, kind: 'sand', icon: '✓', note: 'Tahap lanjut', deltaClass: 'positive' },
      ],
      attentionTitle: 'Antrean naskah kamu',
      attentionSub: 'Konten yang membutuhkan penyusunan script & caption sebelum masuk "Siap Edit"',
      attentionRows: cwQueue.slice(0, 5),
      rowActionLabel: 'Tulis Naskah',
    };
  }

  if (role === ROLES.EDITOR) {
    const highEd = edQueue.filter(i => i.priority === 'Tinggi').length;
    return {
      subtitle: 'Fokus produksi visual/video: kerjakan item berstatus "Siap Edit" (raw footage Drive + naskah) lalu kirim "Menunggu Review".',
      ctaHtml: `<button type="button" class="btn-primary" data-route="Manajemen tugas">🎬 Buka Antrean Siap Edit (${edQueue.length})</button>`,
      cards: [
        { label: 'Antrean Siap Edit', value: edQueue.length, kind: 'sage', icon: '🎬', note: 'Siap diproses Editor', deltaClass: 'positive' },
        { label: 'Prioritas Tinggi',  value: highEd, kind: 'rose', icon: '⚑', note: 'Deadline terdekat', deltaClass: 'negative' },
        { label: 'Menunggu Review',   value: ketuaReview.length, kind: 'lavender', icon: '👁', note: 'Menunggu approval Ketua Tim', deltaClass: 'positive' },
        { label: 'Siap / Tayang',     value: readyOrDone.length, kind: 'sand', icon: '✓', note: 'Sudah disetujui', deltaClass: 'positive' },
      ],
      attentionTitle: 'Antrean "Siap Edit"',
      attentionSub: 'Klik item untuk melihat tautan Raw Footage Google Drive, naskah Copywriter, dan input Output URL',
      attentionRows: edQueue.slice(0, 5),
      rowActionLabel: 'Proses Edit',
    };
  }

  // Ketua Tim (Super Admin)
  const attentionKetua = [
    ...ketuaReview,
    ...taskItems.filter(t => !isKetuaReviewItem(t) && !['Siap Tayang', 'Dipublikasikan'].includes(t.status)),
  ].slice(0, 5);

  return {
    subtitle: 'Akses penuh Ketua Tim: kelola kalender, penugasan anggota, review & approval akhir, serta laporan.',
    ctaHtml: `<button type="button" class="btn-primary" id="btn-demo-new"><span>＋</span> Buat Konten / Ide</button>`,
    cards: [
      { label: statsOverview.planned.label, value: statsOverview.planned.value, kind: 'lavender', icon: '▤', note: 'Terjadwal di workspace', deltaClass: 'positive' },
      { label: 'Menunggu Review',           value: ketuaReview.length, kind: 'rose', icon: '👁', note: 'Menunggu approval kamu', deltaClass: 'negative' },
      { label: 'Antrean Siap Edit',         value: edQueue.length, kind: 'sage', icon: '🎬', note: 'Di antrean Editor', deltaClass: 'positive' },
      { label: statsOverview.completed.label, value: statsOverview.completed.value, kind: 'sand', icon: '✓', note: 'Sudah disetujui', deltaClass: 'positive' },
    ],
    attentionTitle: 'Perlu perhatian kamu (Review & Aktif)',
    attentionSub: 'Prioritas approval "Menunggu Review" serta pantauan progres tim',
    attentionRows: attentionKetua,
    rowActionLabel: 'Kelola',
  };
}

export function renderDashboard() {
  const user = getCurrentUser();
  const role = user?.role || ROLES.COPYWRITER;
  const firstName = (user?.name || 'Tim').split(' ')[0];
  const todayLabel = getTodayLabel();
  const cfg = getRoleDashboardConfig(role);

  return `
    <div class="page-heading">
      <div>
        <div class="eyebrow">
          ${todayLabel} · PERAN: ${escapeHtml(role.toUpperCase())} <span class="live-dot" title="Status Sesi Aktif"></span>
        </div>
        <h1>Selamat datang, ${escapeHtml(firstName)} ✳</h1>
        <p>${escapeHtml(cfg.subtitle)}</p>
      </div>
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
        ${cfg.ctaHtml}
      </div>
    </div>

    <!-- Stats Cards Grid -->
    <section class="stats-grid">
      ${cfg.cards.map(c => `
        <article class="stat-card">
          <div class="stat-top">
            <span>${escapeHtml(c.label)}</span>
            <span class="stat-icon ${c.kind}">${c.icon}</span>
          </div>
          <div class="stat-value">${c.value}</div>
          <div class="stat-foot">
            <span class="stat-delta ${c.deltaClass}">${escapeHtml(c.note)}</span>
          </div>
        </article>
      `).join('')}
    </section>

    <!-- Top Grid: Chart & Upcoming Schedule -->
    <section class="dashboard-grid-top">
      <article class="panel">
        <div class="panel-head">
          <div>
            <h2>Ikhtisar produksi konten</h2>
            <p>Distribusi status pengerjaan sepanjang periode berjalan</p>
          </div>
          <button type="button" class="btn-secondary" id="btn-chart-period" aria-label="Pilih periode laporan (simulasi)">Oktober 2026 ⌄</button>
        </div>

        <div class="chart-container">
          <div class="chart-header">
            <div>
              <strong>${statsOverview.planned.value} <small style="font-size: 12px; font-weight: normal; color: var(--color-ink-muted);">konten aktif</small></strong>
            </div>
            <div class="chart-legend">
              <span><i class="lg-done"></i>Selesai</span>
              <span><i class="lg-doing"></i>Dalam proses</span>
              <span><i class="lg-todo"></i>Belum mulai</span>
            </div>
          </div>

          <div class="bar-chart" aria-label="Grafik dummy produksi">
            ${[24, 32, 27, 42, 35, 46, 38, 31, 44, 36, 49, 41].map((val, idx) => `
              <div class="bar-col">
                <div class="bar-segment done" style="height: ${val * 0.5}%"></div>
                <div class="bar-segment doing" style="height: ${val * 0.3}%"></div>
                <div class="bar-segment todo" style="height: ${val * 0.2}%"></div>
                <div class="bar-label">${idx * 2 + 1}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </article>

      <article class="panel">
        <div class="panel-head">
          <div>
            <h2>Jadwal terdekat</h2>
            <p>Konten yang akan segera tayang</p>
          </div>
          <button type="button" class="btn-secondary" data-route="Kalender konten">
            Kalender ↗
          </button>
        </div>

        <div class="schedule-list">
          ${upcomingSchedules.map(sch => `
            <div class="schedule-item">
              <div class="date-tile ${sch.color}">
                <b>${escapeHtml(sch.date.split(' ')[0])}</b>
                <small>${escapeHtml(sch.date.split(' ')[1] || '')}</small>
              </div>
              <div class="schedule-info">
                <strong>${escapeHtml(sch.title)}</strong>
                <span>${escapeHtml(sch.platform)} · ${escapeHtml(sch.category)}</span>
              </div>
              <div class="schedule-time">${escapeHtml(sch.time)}</div>
            </div>
          `).join('')}
        </div>
      </article>
    </section>

    <!-- Bottom Grid: Priority Tasks & Recent Activity -->
    <section class="dashboard-grid-bottom">
      <article class="panel">
        <div class="panel-head">
          <div>
            <h2>${escapeHtml(cfg.attentionTitle)}</h2>
            <p>${escapeHtml(cfg.attentionSub)}</p>
          </div>
          <button type="button" class="btn-secondary" data-route="Manajemen tugas">
            Semua tugas ↗
          </button>
        </div>

        ${cfg.attentionRows.length === 0 ? `
          <div class="cal-empty-state" style="padding:28px 12px;">
            Tidak ada antrean tertunda untuk peran <strong>${escapeHtml(role)}</strong> saat ini.
          </div>
        ` : `
          <div class="task-table">
            <div class="table-head">
              <span>TUGAS</span>
              <span>PENANGGUNG JAWAB</span>
              <span>DEADLINE</span>
              <span>STATUS / AKSI</span>
            </div>
            ${cfg.attentionRows.map(task => `
              <div class="task-row">
                <div class="task-name">
                  <span class="task-check ${task.isOverdue ? 'overdue' : ''}">
                    ${task.isOverdue ? '!' : '✓'}
                  </span>
                  <div style="min-width:0;">
                    <strong>${escapeHtml(task.title)}</strong>
                    <div class="task-note">${escapeHtml(task.platform)} · ${escapeHtml(task.category)}</div>
                  </div>
                </div>
                <div class="assignee">
                  <span class="mini-avatar">${escapeHtml(task.initials)}</span>
                  <span>${escapeHtml(task.assignee)}</span>
                </div>
                <div class="deadline ${task.isOverdue ? 'late' : ''}">
                  ${escapeHtml(formatShortDateId(task.deadline))}
                </div>
                <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                  <span class="status-pill ${task.statusClass}">${escapeHtml(task.status)}</span>
                  <button type="button" class="btn-secondary dash-wf-btn" data-wf-id="${escapeHtml(task.id)}" style="padding:4px 8px;font-size:10px;">
                    ${escapeHtml(cfg.rowActionLabel)}
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </article>

      <article class="panel">
        <div class="panel-head">
          <div>
            <h2>Aktivitas terbaru</h2>
            <p>Update pengerjaan lintas peran di sesi lokal</p>
          </div>
          <span style="font-size: 11px; color: var(--color-ink-muted);">Simulasi</span>
        </div>

        <div class="activity-list">
          ${recentActivities.map(act => `
            <div class="activity-item">
              <div class="activity-avatar ${act.avatarClass}">${escapeHtml(act.initials)}</div>
              <div class="activity-text">
                <p><strong>${escapeHtml(act.user)}</strong> ${escapeHtml(act.action)}</p>
                <small>${escapeHtml(act.target)} · ${escapeHtml(act.time)}</small>
              </div>
            </div>
          `).join('')}
        </div>
      </article>
    </section>

    <!-- Demo Banner Notice -->
    <div class="demo-banner">
      <span class="demo-banner-icon">✳</span>
      <div class="demo-banner-content">
        <strong>Mode Pratinjau RBAC — state/localStorage Lokal</strong>
        <p>Alur lintas peran (Ketua Tim → Copywriter → Editor → Approval) tersimpan lokal di browser. Tidak menggunakan backend nyata.</p>
      </div>
      <div style="display:flex;gap:8px;align-items:center;margin-left:auto;flex-wrap:wrap;">
        <button type="button" class="btn-secondary" id="btn-reset-workspace-demo" style="padding:5px 10px;font-size:11px;">
          Reset Data Demo
        </button>
        <span class="demo-badge">PRATINJAU</span>
      </div>
    </div>
  `;
}

export function attachDashboardEvents(renderApp, showToast) {
  document.querySelectorAll('.dash-wf-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      openContentWorkflowModal(btn.dataset.wfId, renderApp, showToast);
    });
  });

  document.querySelector('#btn-reset-workspace-demo')?.addEventListener('click', () => {
    resetDemoWorkspace(true);
    showToast('Data konten & alur kerja lokal direset ke kondisi awal demo.');
    renderApp();
  });
}
