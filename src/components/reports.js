/**
 * Laporan — StudioFlow Fase 3 & QA Fase 4
 * Ringkasan statistik per status, platform, anggota tim, dan periode bulanan
 * Tombol ekspor: feedback simulasi saja, tidak menghasilkan file server-side
 */

import {
  reportPlatformData,
  reportMemberData,
  reportPeriodData,
  pipelineStages,
  pipelineItems,
  calendarItems,
} from '../data/mockData.js';
import { escapeHtml } from '../utils/helpers.js';

function progressBar(value, max, colorClass) {
  const safeMax = max > 0 ? max : 1;
  const pct = Math.min(100, Math.round((value / safeMax) * 100));
  return `
    <div class="report-bar-wrap">
      <div class="report-bar-track">
        <div class="report-bar-fill ${colorClass}" style="width:${pct}%" aria-valuenow="${value}" aria-valuemax="${safeMax}" role="progressbar" aria-label="${value} dari ${safeMax}"></div>
      </div>
      <span class="report-bar-val">${value}</span>
    </div>
  `;
}

function rateRing(rate) {
  const deg = Math.round((rate / 100) * 360);
  return `
    <div class="rate-ring" style="--ring-deg:${deg}deg;" title="Ketepatan waktu: ${rate}%">
      <span class="rate-ring-val">${rate}%</span>
    </div>
  `;
}

function renderSummaryCards() {
  const totalPlanned = reportPlatformData.reduce((s, r) => s + r.planned, 0);
  const totalDone    = reportPlatformData.reduce((s, r) => s + r.done, 0);
  const totalLate    = reportPlatformData.reduce((s, r) => s + r.late, 0);
  const avgRate      = Math.round(reportPlatformData.reduce((s, r) => s + r.rate, 0) / reportPlatformData.length);

  const cards = [
    { label: 'Total konten direncanakan', value: totalPlanned, kind: 'lavender', icon: '▤', delta: '+12.8%' },
    { label: 'Konten selesai & tayang',   value: totalDone,    kind: 'sage',     icon: '✓', delta: '+8.6%' },
    { label: 'Konten terlambat',          value: totalLate,    kind: 'rose',     icon: '⚑', delta: '-2.1%' },
    { label: 'Ketepatan waktu rata-rata', value: `${avgRate}%`, kind: 'sand',    icon: '◷', delta: '' },
  ];

  return `
    <div class="stats-grid" style="margin-bottom:24px;">
      ${cards.map(c => `
        <article class="stat-card">
          <div class="stat-top">
            <span>${c.label}</span>
            <span class="stat-icon ${c.kind}">${c.icon}</span>
          </div>
          <div class="stat-value">${c.value}</div>
          <div class="stat-foot">
            ${c.delta ? `<span class="stat-delta ${c.delta.startsWith('+') ? 'positive' : 'negative'}">${c.delta}</span><span class="stat-muted">vs bulan lalu</span>` : '<span class="stat-muted">Oktober 2026</span>'}
          </div>
        </article>
      `).join('')}
    </div>
  `;
}

function renderStatusBreakdown() {
  const stageCounts = pipelineStages.map(stage => ({
    label: stage.label,
    icon: stage.icon,
    count: pipelineItems.filter(i => i.stage === stage.id).length,
  }));
  const lateCount = calendarItems.filter(i => i.status === 'Terlambat').length;
  const maxCount = Math.max(1, ...stageCounts.map(s => s.count), lateCount);

  return `
    <div class="panel" style="margin-bottom:20px;">
      <div class="panel-head">
        <div>
          <h2>Jumlah Konten per Status</h2>
          <p>Distribusi tahap produksi dari data sesi aktif (${pipelineItems.length} item pipeline · ${lateCount} item kalender terlambat)</p>
        </div>
        <button type="button" class="btn-secondary" id="btn-export-status" aria-label="Ekspor laporan status">Ekspor (Demo)</button>
      </div>
      <div class="report-status-grid">
        ${stageCounts.map(s => `
          <div class="report-status-card">
            <div class="report-status-top">
              <span>${s.icon} ${escapeHtml(s.label)}</span>
              <strong>${s.count}</strong>
            </div>
            ${progressBar(s.count, maxCount, 'bar-lavender')}
          </div>
        `).join('')}
        <div class="report-status-card">
          <div class="report-status-top">
            <span>⚑ Terlambat (Kalender)</span>
            <strong style="color:var(--color-blush-ink);">${lateCount}</strong>
          </div>
          ${progressBar(lateCount, maxCount, 'bar-blush')}
        </div>
      </div>
    </div>
  `;
}

function renderPlatformReport() {
  const maxPlanned = Math.max(...reportPlatformData.map(r => r.planned));
  return `
    <div class="panel" style="margin-bottom:20px;">
      <div class="panel-head">
        <div>
          <h2>Performa per Platform</h2>
          <p>Jumlah konten direncanakan, selesai, dan terlambat per platform</p>
        </div>
        <button type="button" class="btn-secondary" id="btn-export-platform" aria-label="Ekspor laporan platform">Ekspor (Demo)</button>
      </div>
      <div class="report-platform-table">
        <div class="report-table-head">
          <span>PLATFORM</span>
          <span>DIRENCANAKAN</span>
          <span>SELESAI</span>
          <span>TERLAMBAT</span>
          <span>KETEPATAN WAKTU</span>
        </div>
        ${reportPlatformData.map(row => `
          <div class="report-table-row">
            <div class="report-cell-primary">
              <span class="platform-chip plat-${row.platform.toLowerCase()}">${escapeHtml(row.platform)}</span>
            </div>
            <div data-label="Direncanakan">${progressBar(row.planned, maxPlanned, 'bar-lavender')}</div>
            <div data-label="Selesai">${progressBar(row.done, row.planned, 'bar-sage')}</div>
            <div data-label="Terlambat">${progressBar(row.late, row.planned, 'bar-blush')}</div>
            <div data-label="Ketepatan">${rateRing(row.rate)}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderMemberReport() {
  const maxDone = Math.max(...reportMemberData.map(m => m.done));
  return `
    <div class="panel" style="margin-bottom:20px;">
      <div class="panel-head">
        <div>
          <h2>Produktivitas Anggota Tim</h2>
          <p>Jumlah konten selesai, ketepatan waktu, dan rate per anggota</p>
        </div>
        <button type="button" class="btn-secondary" id="btn-export-member" aria-label="Ekspor laporan anggota">Ekspor (Demo)</button>
      </div>
      <div class="report-platform-table">
        <div class="report-table-head">
          <span>ANGGOTA</span>
          <span>SELESAI</span>
          <span>TEPAT WAKTU</span>
          <span>TERLAMBAT</span>
          <span>KETEPATAN WAKTU</span>
        </div>
        ${reportMemberData.map(row => `
          <div class="report-table-row">
            <div class="user-cell report-cell-primary">
              <div class="activity-avatar ${row.avatarClass}" style="width:28px;height:28px;font-size:10px;">${escapeHtml(row.initials)}</div>
              <strong style="font-size:12px;">${escapeHtml(row.name)}</strong>
            </div>
            <div data-label="Selesai">${progressBar(row.done, maxDone, 'bar-lavender')}</div>
            <div data-label="Tepat waktu">${progressBar(row.ontime, row.done, 'bar-sage')}</div>
            <div data-label="Terlambat">${progressBar(row.late, row.done, 'bar-blush')}</div>
            <div data-label="Ketepatan">${rateRing(row.rate)}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderPeriodReport() {
  const maxTotal = Math.max(...reportPeriodData.map(r => r.total));
  return `
    <div class="panel" style="margin-bottom:20px;">
      <div class="panel-head">
        <div>
          <h2>Tren per Periode</h2>
          <p>Perbandingan target vs realisasi selesai per bulan</p>
        </div>
        <button type="button" class="btn-secondary" id="btn-export-period" aria-label="Ekspor laporan periode">Ekspor (Demo)</button>
      </div>
      <div class="period-chart-wrap">
        <div class="period-legend">
          <span><i class="lg-target" aria-hidden="true"></i> Target</span>
          <span><i class="lg-done-bar" aria-hidden="true"></i> Selesai</span>
        </div>
        ${reportPeriodData.map(row => {
          const totalPct = Math.round((row.total / maxTotal) * 100);
          const doneRelPct = row.total > 0 ? Math.round((row.done / row.total) * 100) : 0;
          return `
            <div class="period-col">
              <div class="period-bar-group">
                <div class="period-bar-bg" style="height:${totalPct}%;" title="Target ${row.period}: ${row.total} konten">
                  <div class="period-bar-done" style="height:${doneRelPct}%;" title="${row.done} selesai dari ${row.total} (${doneRelPct}%)"></div>
                </div>
              </div>
              <div class="period-label">${escapeHtml(row.period)}</div>
              <div class="period-sub">${row.done}/${row.total} · ${doneRelPct}%</div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

export function renderReports() {
  return `
    <div class="page-heading">
      <div>
        <div class="eyebrow">WORKSPACE / LAPORAN</div>
        <h1>Laporan</h1>
        <p>Ringkasan performa konten per status, platform, anggota tim, dan periode · Oktober 2026</p>
      </div>
      <button type="button" class="btn-primary" id="btn-export-all" aria-label="Ekspor semua laporan">Ekspor Semua (Demo)</button>
    </div>

    ${renderSummaryCards()}
    ${renderStatusBreakdown()}
    ${renderPlatformReport()}
    ${renderMemberReport()}
    ${renderPeriodReport()}

    <div class="demo-banner">
      <span class="demo-banner-icon">✳</span>
      <div class="demo-banner-content">
        <strong>Laporan — Simulasi Lokal</strong>
        <p>Semua angka adalah data dummy. Tombol ekspor memberikan feedback simulasi dan tidak menghasilkan file server-side.</p>
      </div>
      <span class="demo-badge">SIMULASI</span>
    </div>
  `;
}

export function attachReportsEvents(renderApp, showToast) {
  const exportMsg = 'Ekspor laporan: simulasi UI. Generasi file (PDF/CSV) memerlukan backend server-side.';

  ['#btn-export-all', '#btn-export-status', '#btn-export-platform', '#btn-export-member', '#btn-export-period'].forEach(sel => {
    document.querySelector(sel)?.addEventListener('click', () => showToast(exportMsg));
  });
}
