/**
 * Pengguna & Akses — StudioFlow Fase 3
 * Daftar pengguna dummy + matriks kemampuan per peran (simulasi, bukan kontrol keamanan nyata)
 */

import { usersData, rolesMatrix } from '../data/mockData.js';

const AREA_LABELS = {
  dashboard: 'Dashboard',
  kalender: 'Kalender',
  pipeline: 'Pipeline',
  tugas: 'Tugas',
  aset: 'Aset',
  notifikasi: 'Notifikasi',
  laporan: 'Laporan',
  pengguna: 'Pengguna',
};

const ROLE_COLORS = {
  'Admin':       'role-admin',
  'Koordinator': 'role-coord',
  'Tim Kreatif': 'role-creative',
  'Reviewer':    'role-reviewer',
  'Publikasi':   'role-pub',
};

function renderUsersTable() {
  return `
    <div class="users-table">
      <div class="users-table-head">
        <span>PENGGUNA</span>
        <span>EMAIL (DEMO)</span>
        <span>PERAN</span>
        <span>BERGABUNG</span>
        <span>STATUS</span>
        <span>AKSI</span>
      </div>
      ${usersData.map(u => `
        <div class="users-table-row">
          <div class="user-cell">
            <div class="activity-avatar ${u.avatarClass}">${u.initials}</div>
            <strong>${u.name}</strong>
          </div>
          <div class="cl-muted">${u.email}</div>
          <div>
            <span class="role-pill ${ROLE_COLORS[u.role] || ''}">${u.role}</span>
          </div>
          <div class="cl-muted">${u.joined}</div>
          <div>
            <span class="status-pill ${u.status === 'Aktif' ? 'st-ready' : 'st-idea'}">${u.status}</span>
          </div>
          <div style="display:flex;gap:6px;">
            <button class="btn-secondary user-edit-btn" style="padding:5px 10px;font-size:11px;" data-uid="${u.id}" aria-label="Edit peran ${u.name}">Edit peran</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderRolesMatrix() {
  const areas = Object.keys(AREA_LABELS);
  return `
    <div class="roles-matrix">
      <div class="matrix-head">
        <div class="matrix-role-col">PERAN</div>
        ${areas.map(a => `<div class="matrix-area-col">${AREA_LABELS[a]}</div>`).join('')}
      </div>
      ${rolesMatrix.map(row => `
        <div class="matrix-row">
          <div class="matrix-role-cell">
            <span class="role-pill ${ROLE_COLORS[row.role] || ''}">${row.role}</span>
          </div>
          ${areas.map(a => `
            <div class="matrix-cell ${row[a] ? 'allowed' : 'denied'}">
              <span class="matrix-icon" title="${row[a] ? 'Diizinkan' : 'Tidak diizinkan'}">
                ${row[a] ? '✓' : '—'}
              </span>
            </div>
          `).join('')}
        </div>
      `).join('')}
    </div>
  `;
}

export function renderUsers() {
  const active   = usersData.filter(u => u.status === 'Aktif').length;
  const inactive = usersData.filter(u => u.status !== 'Aktif').length;

  return `
    <div class="page-heading">
      <div>
        <div class="eyebrow">WORKSPACE / PENGGUNA & AKSES</div>
        <h1>Pengguna & Akses</h1>
        <p>Daftar anggota tim dan matriks kemampuan per peran (simulasi — bukan kontrol keamanan nyata)</p>
      </div>
      <button class="btn-primary" id="btn-user-invite"><span>＋</span> Undang Pengguna (Demo)</button>
    </div>

    <!-- Stats -->
    <div class="pip-stats" style="margin-bottom:20px;">
      <div class="pip-stat-item">
        <span class="pip-stat-val">${usersData.length}</span>
        <span class="pip-stat-label">Total pengguna</span>
      </div>
      <div class="pip-stat-divider"></div>
      <div class="pip-stat-item">
        <span class="pip-stat-val" style="color:var(--color-sage-ink)">${active}</span>
        <span class="pip-stat-label">Aktif</span>
      </div>
      <div class="pip-stat-divider"></div>
      <div class="pip-stat-item">
        <span class="pip-stat-val" style="color:var(--color-ink-muted)">${inactive}</span>
        <span class="pip-stat-label">Tidak aktif</span>
      </div>
      <div class="pip-stat-divider"></div>
      <div class="pip-stat-item">
        <span class="pip-stat-val">${rolesMatrix.length}</span>
        <span class="pip-stat-label">Peran tersedia</span>
      </div>
    </div>

    <!-- Users Table -->
    <div class="panel" style="margin-bottom:20px;padding:0 0 8px;">
      <div class="panel-head" style="padding:18px 20px 0;">
        <div>
          <h2>Daftar Pengguna</h2>
          <p>Data simulasi · Email diakhiri @sgq.demo · Tidak ada akun nyata</p>
        </div>
        <span class="demo-badge">DATA DUMMY</span>
      </div>
      ${renderUsersTable()}
    </div>

    <!-- Roles Matrix -->
    <div class="panel" style="margin-bottom:20px;">
      <div class="panel-head">
        <div>
          <h2>Matriks Kemampuan Peran</h2>
          <p>Gambaran konseptual hak akses per area fitur · Implementasi keamanan nyata menunggu backend</p>
        </div>
        <span class="demo-badge">KONSEPTUAL</span>
      </div>
      ${renderRolesMatrix()}
    </div>

    <div class="demo-banner">
      <span class="demo-banner-icon">✳</span>
      <div class="demo-banner-content">
        <strong>Pengguna & Akses — Fase 3</strong>
        <p>Semua pengguna, email, dan hak akses adalah data simulasi. Autentikasi dan kontrol akses nyata memerlukan backend yang belum disetujui.</p>
      </div>
      <span class="demo-badge">FASE 3</span>
    </div>
  `;
}

export function attachUsersEvents(renderApp, showToast) {
  document.querySelector('#btn-user-invite')?.addEventListener('click', () => {
    showToast('Undang pengguna: simulasi UI saja. Fungsi email memerlukan backend.');
  });

  document.querySelectorAll('.user-edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const uid  = btn.dataset.uid;
      const user = usersData.find(u => u.id === uid);
      if (!user) return;
      showToast(`Edit peran "${user.name}": simulasi — perubahan peran nyata memerlukan backend.`);
    });
  });
}
