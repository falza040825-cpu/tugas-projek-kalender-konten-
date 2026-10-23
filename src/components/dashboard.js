import { statsOverview, upcomingSchedules, priorityTasks, recentActivities, currentUser } from '../data/mockData.js';

function getTodayLabel() {
  const now = new Date();
  return now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase();
}

export function renderDashboard() {
  const todayLabel = getTodayLabel();
  return `
    <div class="page-heading">
      <div>
        <div class="eyebrow">
          ${todayLabel} <span class="live-dot" title="Status Sistem Aktif"></span>
        </div>
        <h1>Selamat datang, ${currentUser.name.split(' ')[0]} ✳</h1>
        <p>Ringkasan operasional dan status alur produksi konten tim kamu hari ini.</p>
      </div>
      <button class="btn-primary" id="btn-demo-new">
        <span>＋</span> Buat konten (Demo)
      </button>
    </div>

    <!-- Stats Cards Grid -->
    <section class="stats-grid">
      <article class="stat-card">
        <div class="stat-top">
          <span>${statsOverview.planned.label}</span>
          <span class="stat-icon ${statsOverview.planned.kind}">${statsOverview.planned.icon}</span>
        </div>
        <div class="stat-value">${statsOverview.planned.value}</div>
        <div class="stat-foot">
          <span class="stat-delta positive">${statsOverview.planned.delta}</span>
          <span class="stat-muted">vs bulan lalu</span>
        </div>
      </article>

      <article class="stat-card">
        <div class="stat-top">
          <span>${statsOverview.inProduction.label}</span>
          <span class="stat-icon ${statsOverview.inProduction.kind}">${statsOverview.inProduction.icon}</span>
        </div>
        <div class="stat-value">${statsOverview.inProduction.value}</div>
        <div class="stat-foot">
          <span class="stat-delta positive">${statsOverview.inProduction.delta}</span>
          <span class="stat-muted">vs bulan lalu</span>
        </div>
      </article>

      <article class="stat-card">
        <div class="stat-top">
          <span>${statsOverview.completed.label}</span>
          <span class="stat-icon ${statsOverview.completed.kind}">${statsOverview.completed.icon}</span>
        </div>
        <div class="stat-value">${statsOverview.completed.value}</div>
        <div class="stat-foot">
          <span class="stat-delta positive">${statsOverview.completed.delta}</span>
          <span class="stat-muted">vs bulan lalu</span>
        </div>
      </article>

      <article class="stat-card">
        <div class="stat-top">
          <span>${statsOverview.overdue.label}</span>
          <span class="stat-icon ${statsOverview.overdue.kind}">${statsOverview.overdue.icon}</span>
        </div>
        <div class="stat-value">${statsOverview.overdue.value}</div>
        <div class="stat-foot">
          <span class="stat-delta negative">${statsOverview.overdue.delta}</span>
          <span class="stat-muted">vs bulan lalu</span>
        </div>
      </article>
    </section>

    <!-- Top Grid: Chart & Upcoming Schedule -->
    <section class="dashboard-grid-top">
      <article class="panel">
        <div class="panel-head">
          <div>
            <h2>Ikhtisar produksi konten</h2>
            <p>Distribusi status pengerjaan sepanjang periode berjalan</p>
          </div>
          <button class="btn-secondary" id="btn-chart-period" aria-label="Pilih periode laporan (simulasi)">Oktober 2026 ⌄</button>
        </div>

        <div class="chart-container">
          <div class="chart-header">
            <div>
              <strong>48 <small style="font-size: 12px; font-weight: normal; color: var(--color-ink-muted);">konten total</small></strong>
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
            <p>Konten yang segera tayang di platform</p>
          </div>
          <button class="btn-secondary" data-route="Kalender konten">
            Kalender ↗
          </button>
        </div>

        <div class="schedule-list">
          ${upcomingSchedules.map(sch => `
            <div class="schedule-item">
              <div class="date-tile ${sch.color}">
                <b>${sch.date.split(' ')[0]}</b>
                <small>${sch.date.split(' ')[1]}</small>
              </div>
              <div class="schedule-info">
                <strong>${sch.title}</strong>
                <span>${sch.platform} · ${sch.category}</span>
              </div>
              <div class="schedule-time">${sch.time}</div>
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
            <h2>Perlu perhatian kamu</h2>
            <p>Tugas prioritas yang membutuhkan tindak lanjut</p>
          </div>
          <button class="btn-secondary" data-route="Manajemen tugas">
            Semua tugas ↗
          </button>
        </div>

        <div class="task-table">
          <div class="table-head">
            <span>TUGAS</span>
            <span>PENANGGUNG JAWAB</span>
            <span>DEADLINE</span>
            <span>STATUS</span>
          </div>
          ${priorityTasks.map(task => `
            <div class="task-row">
              <div class="task-name">
                <span class="task-check ${task.isOverdue ? 'overdue' : ''}">
                  ${task.isOverdue ? '!' : '✓'}
                </span>
                <strong>${task.title}</strong>
              </div>
              <div class="assignee">
                <span class="mini-avatar">${task.initials}</span>
                <span>${task.assignee}</span>
              </div>
              <div class="deadline ${task.isOverdue ? 'late' : ''}">
                ${task.deadline}
              </div>
              <div>
                <span class="status-pill ${task.statusClass}">${task.status}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </article>

      <article class="panel">
        <div class="panel-head">
          <div>
            <h2>Aktivitas terbaru</h2>
            <p>Update pengerjaan dari anggota tim</p>
          </div>
          <span style="font-size: 11px; color: var(--color-ink-muted);">Simulasi</span>
        </div>

        <div class="activity-list">
          ${recentActivities.map(act => `
            <div class="activity-item">
              <div class="activity-avatar ${act.avatarClass}">${act.initials}</div>
              <div class="activity-text">
                <p><strong>${act.user}</strong> ${act.action}</p>
                <small>${act.target} · ${act.time}</small>
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
        <strong>Mode Pratinjau — Data Dummy Terpusat</strong>
        <p>Aplikasi ini berjalan sebagai prototipe UI front-end sesuai SOT. Semua data dummy. Tanpa backend atau database nyata.</p>
      </div>
      <span class="demo-badge">PRATINJAU</span>
    </div>
  `;
}
