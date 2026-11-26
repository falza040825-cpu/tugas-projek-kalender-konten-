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
  return now.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function getRoleDashboardConfig(role) {
  const cwQueue = taskItems.filter(isCopywriterQueueItem);
  const edQueue = taskItems.filter(isEditorQueueItem);
  const ketuaReview = taskItems.filter(isKetuaReviewItem);
  const readyOrDone = taskItems.filter(t => ['Siap Tayang', 'Dipublikasikan'].includes(t.status));

  if (role === ROLES.COPYWRITER) {
    return {
      subtitle: 'Fokus produksi naskah & caption — isi script/caption pada antrean lalu kirim ke status "Siap Edit".',
      ctaHtml: `<button type="button" class="v7-cta-primary" data-route="Manajemen tugas">✍️ Buka Antrean Naskah (${cwQueue.length})</button>`,
      cards: [
        { label: 'Antrean Perlu Naskah', value: cwQueue.length, icon: '✍️', note: 'Ide, Naskah & Revisi', tone: 'amber' },
        { label: 'Revisi Naskah', value: cwQueue.filter(i => i.status === 'Revisi Naskah').length, icon: '🔄', note: 'Butuh penyesuaian', tone: 'amber' },
        { label: 'Sudah Siap Edit', value: edQueue.length, icon: '🎬', note: 'Lanjut ke antrean Editor', tone: 'emerald' },
        { label: 'Menunggu Review / Tayang', value: ketuaReview.length + readyOrDone.length, icon: '✓', note: 'Progres tahap akhir', tone: 'emerald' },
      ],
      attentionTitle: 'Antrean Naskah Kamu',
      attentionSub: 'Konten yang perlu penyusunan script & caption',
      attentionRows: cwQueue.slice(0, 4),
      rowActionLabel: 'Tulis',
    };
  }

  if (role === ROLES.EDITOR) {
    const highEd = edQueue.filter(i => i.priority === 'Tinggi').length;
    return {
      subtitle: 'Fokus produksi visual/video — proses item "Siap Edit" (raw footage Drive + naskah) lalu kirim "Menunggu Review".',
      ctaHtml: `<button type="button" class="v7-cta-primary" data-route="Manajemen tugas">🎬 Buka Antrean Siap Edit (${edQueue.length})</button>`,
      cards: [
        { label: 'Antrean Siap Edit', value: edQueue.length, icon: '🎬', note: 'Siap diproses Editor', tone: 'emerald' },
        { label: 'Prioritas Tinggi', value: highEd, icon: '⚑', note: 'Deadline terdekat', tone: 'amber' },
        { label: 'Menunggu Review', value: ketuaReview.length, icon: '👁', note: 'Menunggu approval Ketua', tone: 'amber' },
        { label: 'Siap / Tayang', value: readyOrDone.length, icon: '✓', note: 'Sudah disetujui tayang', tone: 'emerald' },
      ],
      attentionTitle: 'Antrean "Siap Edit"',
      attentionSub: 'Raw footage Google Drive & naskah siap diedit',
      attentionRows: edQueue.slice(0, 4),
      rowActionLabel: 'Edit',
    };
  }

  // Ketua Tim (Super Admin)
  const attentionKetua = [
    ...ketuaReview,
    ...taskItems.filter(t => !isKetuaReviewItem(t) && !['Siap Tayang', 'Dipublikasikan'].includes(t.status)),
  ].slice(0, 4);

  return {
    subtitle: 'Kendali penuh kalender konten, penugasan tim, approval hasil akhir, dan analitik produksi.',
    ctaHtml: `<button type="button" class="v7-cta-primary" id="btn-demo-new"><span>＋</span> Buat Konten / Ide</button>`,
    cards: [
      { label: 'Total konten aktif', value: taskItems.length || statsOverview.planned.value, icon: '▤', note: '+3 konten minggu ini', tone: 'emerald' },
      { label: 'Menunggu Review', value: ketuaReview.length, icon: '👁', note: 'Perlu approval segera', tone: 'amber' },
      { label: 'Antrean Siap Edit', value: edQueue.length, icon: '🎬', note: 'Sedang diproses Editor', tone: 'emerald' },
      { label: 'Siap / Tayang', value: readyOrDone.length || statsOverview.completed.value, icon: '✓', note: 'Lolos kurasi & publikasi', tone: 'emerald' },
    ],
    attentionTitle: 'Perlu Perhatian & Review',
    attentionSub: 'Prioritas approval "Menunggu Review" & tugas aktif',
    attentionRows: attentionKetua,
    rowActionLabel: 'Kelola',
  };
}

function buildStatusDonutData() {
  const total = Math.max(taskItems.length, 1);
  const countReview = taskItems.filter(t => ['Menunggu Review', 'Revisi Naskah'].includes(t.status)).length;
  const countScript = taskItems.filter(t => ['Ide', 'Perlu Naskah'].includes(t.status)).length;
  const countReady = taskItems.filter(t => ['Siap Tayang', 'Dipublikasikan'].includes(t.status)).length;
  const countEdit = taskItems.filter(t => t.status === 'Siap Edit').length;

  const segments = [
    { label: 'Review & Revisi', count: countReview, color: '#F59E0B', pct: Math.round((countReview / total) * 100) },
    { label: 'Ide & Naskah', count: countScript, color: '#FB7185', pct: Math.round((countScript / total) * 100) },
    { label: 'Siap / Tayang', count: countReady, color: '#34D399', pct: Math.round((countReady / total) * 100) },
    { label: 'Siap Edit', count: countEdit, color: '#38BDF8', pct: Math.round((countEdit / total) * 100) },
  ];

  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  let offsetAcc = 0;

  const arcs = segments.map(seg => {
    const ratio = seg.count / total;
    const dashLen = Math.max(ratio * circumference - (seg.count > 0 ? 4 : 0), 0);
    const dashOffset = -offsetAcc;
    offsetAcc += ratio * circumference;
    return {
      ...seg,
      dashLen: dashLen.toFixed(2),
      dashGap: (circumference - dashLen).toFixed(2),
      dashOffset: dashOffset.toFixed(2),
    };
  });

  return { total: taskItems.length, radius, circumference, arcs };
}

function renderWarmAreaChart() {
  const points = [
    { label: '1 Okt', val: 28 },
    { label: '4 Okt', val: 42 },
    { label: '7 Okt', val: 36 },
    { label: '10 Okt', val: 58 },
    { label: '13 Okt', val: 51 },
    { label: '16 Okt', val: 74 },
    { label: '19 Okt', val: 66 },
    { label: '22 Okt', val: 84 },
    { label: '25 Okt', val: 78 },
    { label: '28 Okt', val: 92 },
  ];

  const w = 440;
  const h = 175;
  const padX = 18;
  const padTop = 16;
  const padBottom = 26;
  const chartW = w - padX * 2;
  const chartH = h - padTop - padBottom;

  const coords = points.map((p, i) => {
    const x = padX + (i / (points.length - 1)) * chartW;
    const y = padTop + chartH - (p.val / 100) * chartH;
    return { ...p, x: Number(x.toFixed(1)), y: Number(y.toFixed(1)) };
  });

  const linePath = coords
    .map((pt, i) => {
      if (i === 0) return `M ${pt.x} ${pt.y}`;
      const prev = coords[i - 1];
      const cx = ((prev.x + pt.x) / 2).toFixed(1);
      return `C ${cx} ${prev.y}, ${cx} ${pt.y}, ${pt.x} ${pt.y}`;
    })
    .join(' ');

  const baseY = padTop + chartH;
  const areaPath = `${linePath} L ${coords[coords.length - 1].x} ${baseY} L ${coords[0].x} ${baseY} Z`;

  return `
    <div class="v7-chart-wrap" aria-label="Grafik progres produksi konten per periode">
      <svg class="v7-area-svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" role="img" aria-label="Tren produksi konten Oktober 2026">
        <defs>
          <linearGradient id="v7WarmStroke" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#F59E0B" />
            <stop offset="55%" stop-color="#FDE68A" />
            <stop offset="100%" stop-color="#FFFFFF" />
          </linearGradient>
          <linearGradient id="v7WarmArea" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="rgba(245, 158, 11, 0.42)" />
            <stop offset="55%" stop-color="rgba(253, 230, 138, 0.14)" />
            <stop offset="100%" stop-color="rgba(255, 255, 255, 0)" />
          </linearGradient>
          <linearGradient id="v7BarGlow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="rgba(253, 230, 138, 0.34)" />
            <stop offset="100%" stop-color="rgba(245, 158, 11, 0.04)" />
          </linearGradient>
          <filter id="v7LineGlow" x="-10%" y="-25%" width="120%" height="150%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <!-- Thin transparent gridlines -->
        ${[0, 0.25, 0.5, 0.75, 1].map(step => {
          const gy = (padTop + step * chartH).toFixed(1);
          return `<line x1="${padX}" y1="${gy}" x2="${w - padX}" y2="${gy}" stroke="rgba(255, 255, 255, 0.08)" stroke-width="1" />`;
        }).join('')}

        <!-- Subtle glowing vertical bars under points -->
        ${coords.map(pt => `
          <rect
            x="${(pt.x - 6).toFixed(1)}"
            y="${pt.y}"
            width="12"
            height="${(baseY - pt.y).toFixed(1)}"
            rx="5"
            fill="url(#v7BarGlow)"
          />
        `).join('')}

        <!-- Warm Area Fill -->
        <path d="${areaPath}" fill="url(#v7WarmArea)" />

        <!-- Luminous Warm Gradient Line -->
        <path
          d="${linePath}"
          fill="none"
          stroke="url(#v7WarmStroke)"
          stroke-width="2.6"
          stroke-linecap="round"
          filter="url(#v7LineGlow)"
        />

        <!-- Interactive Glow Nodes -->
        ${coords.map((pt, idx) => `
          <g class="v7-chart-node">
            <circle cx="${pt.x}" cy="${pt.y}" r="4" fill="${idx === coords.length - 1 ? '#FFFFFF' : '#F59E0B'}" stroke="rgba(24,22,20,0.9)" stroke-width="1.5" />
            ${idx % 2 === 0 || idx === coords.length - 1
              ? `<text x="${pt.x}" y="${h - 6}" text-anchor="middle" fill="rgba(255,255,255,0.52)" font-size="9.5" font-weight="600">${pt.label}</text>`
              : ''}
          </g>
        `).join('')}
      </svg>
    </div>
  `;
}

export function renderDashboard() {
  const user = getCurrentUser();
  const role = user?.role || ROLES.COPYWRITER;
  const todayLabel = getTodayLabel();
  const cfg = getRoleDashboardConfig(role);
  const donut = buildStatusDonutData();

  return `
    <div class="v7-dashboard">
      <!-- Compact Spatial Intro & Primary CTA Strip -->
      <div class="v7-intro-strip v7-stagger v7-stagger-1">
        <div class="v7-intro-copy">
          <span class="v7-date-pill">${escapeHtml(todayLabel)}</span>
          <p class="v7-intro-sub">${escapeHtml(cfg.subtitle)}</p>
        </div>
        <div class="v7-intro-actions">
          ${cfg.ctaHtml}
        </div>
      </div>

      <!-- 1. 4-Column Frosted Glass Stat Cards -->
      <section class="v7-stats-grid" aria-label="Ringkasan metrik konten">
        ${cfg.cards.map((c, idx) => `
          <article class="v7-glass-card v7-stat-card v7-stagger v7-stagger-${idx + 1}">
            <div class="v7-stat-top">
              <span class="v7-stat-label">${escapeHtml(c.label)}</span>
              <span class="v7-stat-icon" aria-hidden="true">${c.icon}</span>
            </div>
            <div class="v7-stat-value">${c.value}</div>
            <div class="v7-stat-foot">
              <span class="v7-stat-note tone-${c.tone}">● ${escapeHtml(c.note)}</span>
            </div>
          </article>
        `).join('')}
      </section>

      <!-- 2. Middle 3-Column Bento Grid: Area/Bar Chart + Priority Review + Donut Chart -->
      <section class="v7-bento-middle" aria-label="Analitik dan prioritas produksi">
        <!-- Left Card: Warm Area/Bar Chart -->
        <article class="v7-glass-card v7-bento-panel v7-stagger v7-stagger-5">
          <div class="v7-panel-head">
            <div>
              <h2>Produksi Konten</h2>
              <p>Tren progres penyelesaian periode berjalan</p>
            </div>
            <button type="button" class="v7-mini-pill" id="btn-chart-period" aria-label="Pilih periode laporan (simulasi)">
              Oktober 2026 ⌄
            </button>
          </div>

          <div class="v7-chart-meta">
            <div class="v7-chart-kpi">
              <strong>${donut.total}</strong>
              <span>konten aktif · <em class="tone-emerald">+24% ritme</em></span>
            </div>
            <div class="v7-chart-tags">
              <span><i style="background:#F59E0B;"></i>Progres</span>
              <span><i style="background:#FFFFFF;"></i>Target</span>
            </div>
          </div>

          ${renderWarmAreaChart()}
        </article>

        <!-- Center Card: Highlight & Perlu Perhatian / Review -->
        <article class="v7-glass-card v7-bento-panel v7-stagger v7-stagger-6">
          <div class="v7-panel-head">
            <div>
              <h2>${escapeHtml(cfg.attentionTitle)}</h2>
              <p>${escapeHtml(cfg.attentionSub)}</p>
            </div>
            <button type="button" class="v7-mini-pill" data-route="Manajemen tugas">
              Semua ↗
            </button>
          </div>

          ${cfg.attentionRows.length === 0 ? `
            <div class="v7-empty-box">
              Tidak ada antrean tertunda untuk peran <strong>${escapeHtml(role)}</strong> saat ini.
            </div>
          ` : `
            <div class="v7-priority-list">
              ${cfg.attentionRows.map(task => `
                <div class="v7-priority-row">
                  <div class="v7-priority-info">
                    <div class="v7-priority-title-line">
                      <span class="v7-dot-indicator ${task.isOverdue ? 'is-urgent' : ''}" aria-hidden="true"></span>
                      <strong>${escapeHtml(task.title)}</strong>
                    </div>
                    <div class="v7-priority-meta">
                      <span>${escapeHtml(task.platform)}</span>
                      <span>·</span>
                      <span>${escapeHtml(task.assignee)}</span>
                      <span>·</span>
                      <span class="${task.isOverdue ? 'tone-amber' : ''}">${escapeHtml(formatShortDateId(task.deadline))}</span>
                    </div>
                  </div>
                  <div class="v7-priority-actions">
                    <span class="v7-status-chip">${escapeHtml(task.status)}</span>
                    <button
                      type="button"
                      class="v7-action-pill dash-wf-btn"
                      data-wf-id="${escapeHtml(task.id)}"
                    >
                      ${escapeHtml(cfg.rowActionLabel)}
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </article>

        <!-- Right Card: Multi-Color Glowing Donut Chart -->
        <article class="v7-glass-card v7-bento-panel v7-stagger v7-stagger-7">
          <div class="v7-panel-head">
            <div>
              <h2>Distribusi Status</h2>
              <p>Komposisi seluruh konten aktif</p>
            </div>
            <button type="button" class="v7-mini-pill" data-route="Alur produksi">
              Alur ↗
            </button>
          </div>

          <div class="v7-donut-layout">
            <div class="v7-donut-ring-wrap" aria-label="Donut chart distribusi ${donut.total} konten aktif">
              <svg class="v7-donut-svg" viewBox="0 0 156 156">
                <defs>
                  <filter id="v7DonutGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2.4" result="g" />
                    <feMerge>
                      <feMergeNode in="g" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <circle
                  cx="78"
                  cy="78"
                  r="${donut.radius}"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.08)"
                  stroke-width="14"
                />
                ${donut.arcs.map(arc => arc.count > 0 ? `
                  <circle
                    cx="78"
                    cy="78"
                    r="${donut.radius}"
                    fill="none"
                    stroke="${arc.color}"
                    stroke-width="14"
                    stroke-linecap="round"
                    stroke-dasharray="${arc.dashLen} ${arc.dashGap}"
                    stroke-dashoffset="${arc.dashOffset}"
                    transform="rotate(-90 78 78)"
                    filter="url(#v7DonutGlow)"
                  />
                ` : '').join('')}
              </svg>
              <div class="v7-donut-center">
                <strong>${donut.total}</strong>
                <span>Konten Aktif</span>
              </div>
            </div>

            <div class="v7-donut-legend">
              ${donut.arcs.map(arc => `
                <div class="v7-legend-item">
                  <span class="v7-legend-dot" style="background:${arc.color};box-shadow:0 0 10px ${arc.color};"></span>
                  <span class="v7-legend-name">${escapeHtml(arc.label)}</span>
                  <strong class="v7-legend-count">${arc.count}</strong>
                  <small class="v7-legend-pct">${arc.pct}%</small>
                </div>
              `).join('')}
            </div>
          </div>
        </article>
      </section>

      <!-- 3. Bottom 2-Column Bento: Jadwal Terdekat & Aktivitas Terbaru -->
      <section class="v7-bento-bottom" aria-label="Jadwal dan aktivitas terbaru">
        <article class="v7-glass-card v7-bento-panel v7-stagger v7-stagger-8">
          <div class="v7-panel-head">
            <div>
              <h2>Jadwal Terdekat</h2>
              <p>Agenda konten yang segera tayang di kanal publikasi</p>
            </div>
            <button type="button" class="v7-mini-pill" data-route="Kalender konten">
              Kalender ↗
            </button>
          </div>

          <div class="v7-schedule-list">
            ${upcomingSchedules.map(sch => `
              <div class="v7-list-row v7-schedule-row">
                <div class="v7-date-badge">
                  <b>${escapeHtml(sch.date.split(' ')[0])}</b>
                  <small>${escapeHtml(sch.date.split(' ')[1] || '')}</small>
                </div>
                <div class="v7-row-body">
                  <strong>${escapeHtml(sch.title)}</strong>
                  <span>${escapeHtml(sch.platform)} · ${escapeHtml(sch.category)}</span>
                </div>
                <span class="v7-time-pill">${escapeHtml(sch.time)}</span>
              </div>
            `).join('')}
          </div>
        </article>

        <article class="v7-glass-card v7-bento-panel v7-stagger v7-stagger-9">
          <div class="v7-panel-head">
            <div>
              <h2>Aktivitas Terbaru</h2>
              <p>Pembaruan lintas peran di ruang kerja lokal</p>
            </div>
            <span class="v7-sim-tag">Simulasi</span>
          </div>

          <div class="v7-activity-list">
            ${recentActivities.map(act => `
              <div class="v7-list-row v7-activity-row">
                <div class="v7-act-avatar">${escapeHtml(act.initials)}</div>
                <div class="v7-row-body">
                  <p><strong>${escapeHtml(act.user)}</strong> ${escapeHtml(act.action)}</p>
                  <span>${escapeHtml(act.target)} · ${escapeHtml(act.time)}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </article>
      </section>

      <!-- Subtle Glass RBAC Simulation Footer -->
      <div class="v7-glass-card v7-demo-footer v7-stagger v7-stagger-9">
        <div class="v7-demo-info">
          <span class="v7-demo-star" aria-hidden="true">✳</span>
          <div>
            <strong>Mode Pratinjau RBAC — state/localStorage Lokal</strong>
            <p>Alur lintas peran (Ketua Tim → Copywriter → Editor → Approval) tersimpan lokal di browser tanpa backend nyata.</p>
          </div>
        </div>
        <div class="v7-demo-actions">
          <button type="button" class="v7-mini-pill" id="btn-reset-workspace-demo">
            Reset Data Demo
          </button>
          <span class="v7-preview-pill">PRATINJAU</span>
        </div>
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
