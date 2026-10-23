/**
 * Laporan — StudioFlow Fase 3
 * Ringkasan statistik per platform, anggota tim, dan periode bulanan
 * Tombol ekspor: feedback simulasi saja, tidak menghasilkan file server-side
 */

import { reportPlatformData, reportMemberData, reportPeriodData, statsOverview } from '../data/mockData.js';

// ─────────────────────────────────────────────────────────────────────────────
// Bar chart CSS (tanpa library) — reusable helper
// ─────────────────────────────────────────────────────────────────────────────

function progressBar(value, max, colorClass) {
  const pct = Math.round((value / max) * 100);
  return `
    <div class="report-bar-wrap">
      <div class="report-bar-track">
        <div class="report-bar-fill ${colorClass}" style="width:${pct}%" aria-valuenow="${value}" aria-valuemax="${max}" role="progressbar" aria-label="${value} dari ${max}"></div>
      </div>
      <span class="report-bar-val">${value}</span>
    </div>
  `;
}

function rateRing(rate) {
  // Simple CSS-based ring
  const deg = Math.round((rate / 100) * 360);
  return `
    <div class="rate-ring" style="--ring-deg:${deg}deg;" title="Ketepatan waktu: ${rate}%">
      <span class="rate-ring-val">${rate}%</span>
    </div>
  `;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sections
// ─────────────────────────────────────────────────────────────────────────────

function renderSummaryCards() {
  const totalPlanned   = reportPlatformData.reduce((s, r) => s + r.planned, 0);
  const totalDone      = reportPlatformData.reduce((s, r) => s + r.done, 0);
  const totalLate      = reportPlatformData.reduce((s, r) => s + r.late, 0);
  const avgRate        = Math.round(reportPlatformData.reduce((s, r) => s + r.rate, 0) / reportPlatformData.length);

  const cards = [
    { label: 'Total konten direncanakan', value: totalPlanned, kind: 'lavender', icon: '▤', delta: '+12.8%' },
    { label: 'Konten selesai & tayang',   value: totalDone,   kind: 'sage',     icon: '✓', delta: '+8.6%' },
    { label: 'Konten terlambat',          value: totalLate,   kind: 'rose',     icon: '⚑', delta: '-2.1%' },
    { label: 'Ketepatan waktu rata-rata', value: `${avgRate}%`, kind: 'sand',   icon: '◷', delta: '' },
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

function renderPlatformReport() {
  const maxPlanned = Math.max(...reportPlatformData.map(r => r.planned));
  return `
    <div class="panel" style="margin-bottom:20px;">
      <div class="panel-head">
        <div>
          <h2>Performa per Platform</h2>
          <p>Jumlah konten direncanakan, selesai, dan terlambat per platform</p>
        </div>
        <button class="btn-secondary" id="btn-export-platform" aria-label="Ekspor laporan platform">Ekspor (Demo)</button>
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
            <div>
              <span class="platform-chip plat-${row.platform.toLowerCase()}">${row.platform}</span>
            </div>
            <div>${progressBar(row.planned, maxPlanned, 'bar-lavender')}</div>
            <div>${progressBar(row.done, row.planned, 'bar-sage')}</div>
            <div>${progressBar(row.late, row.planned, 'bar-blush')}</div>
            <div>${rateRing(row.rate)}</div>
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
        <button class="btn-secondary" id="btn-export-member" aria-label="Ekspor laporan anggota">Ekspor (Demo)</button>
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
            <div class="user-cell">
              <div class="activity-avatar ${row.avatarClass}" style="width:28px;height:28px;font-size:10px;">${row.initials}</div>
              <strong style="font-size:12px;">${row.name}</strong>
            </div>
            <div>${progressBar(row.done, maxDone, 'bar-lavender')}</div>
            <div>${progressBar(row.ontime, row.done, 'bar-sage')}</div>
            <div>${progressBar(row.late, row.done, 'bar-blush')}</div>
            <div>${rateRing(row.rate)}</div>
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
          <p>Perbandingan target vs realisasi konten per bulan</p>
        </div>
        <button class="btn-secondary" id="btn-export-period" aria-label="Ekspor laporan periode">Ekspor (Demo)</button>
      </div>
      <div class="period-chart-wrap">
        ${reportPeriodData.map(row => {
          const donePct  = Math.round((row.done  / maxTotal) * 100);
          const totalPct = Math.round((row.total / maxTotal) * 100);
          const ratePct  = Math.round((row.done  / row.total) * 100);
          return `
            <div class="period-col">
              <div class="period-bar-group">
                <div class="period-bar-bg" style="height:${totalPct}%;">
                  <div class="period-bar-done" style="height:${donePct}%;" title="${row.done} selesai dari ${row.total}"></div>
                </div>
              </div>
              <div class="period-label">${row.period}</div>
              <div class="period-sub">${ratePct}%</div>
            </div>
          `;
        }).join('')}
        <div class="period-legend">
          <span><i class="lg-doing"></i> Target</span>
          <span><i class="lg-done"></i> Selesai</span>
        </div>
      </div>
    </div>
  `;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main render
// ─────────────────────────────────────────────────────────────────────────────

export function renderReports() {
  return `
    <div class="page-heading">
      <div>
        <div class="eyebrow">WORKSPACE / LAPORAN</div>
        <h1>Laporan</h1>
        <p>Ringkasan performa konten per platform, anggota tim, dan periode · Oktober 2026</p>
      </div>
      <button class="btn-primary" id="btn-export-all" aria-label="Ekspor semua laporan">Ekspor Semua (Demo)</button>
    </div>

    ${renderSummaryCards()}
    ${renderPlatformReport()}
    ${renderMemberReport()}
    ${renderPeriodReport()}

    <div class="demo-banner">
      <span class="demo-banner-icon">✳</span>
      <div class="demo-banner-content">
        <strong>Laporan — Fase 3</strong>
        <p>Semua angka adalah data dummy. Tombol ekspor memberikan feedback simulasi dan tidak menghasilkan file server-side.</p>
      </div>
      <span class="demo-badge">FASE 3</span>
    </div>
  `;
}

// ─────────────────────────────────────────────────────────────────────────────
// Event binding
// ─────────────────────────────────────────────────────────────────────────────

export function attachReportsEvents(renderApp, showToast) {
  const exportMsg = 'Ekspor laporan: simulasi UI. Generasi file (PDF/CSV) memerlukan backend server-side.';

  ['#btn-export-all', '#btn-export-platform', '#btn-export-member', '#btn-export-period'].forEach(sel => {
    document.querySelector(sel)?.addEventListener('click', () => showToast(exportMsg));
  });
}
