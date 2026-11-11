/**
 * Pengguna & Akses — StudioFlow Fase 3 & QA Fase 4
 * Daftar pengguna dummy + simulasi pergantian peran + matriks kemampuan konseptual
 */

import { usersData, rolesMatrix, currentUser, availableRoles } from '../data/mockData.js';
import { escapeHtml } from '../utils/helpers.js';

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

function renderRoleSimulator() {
  return `
    <div class="panel" style="margin-bottom:20px;padding:16px 20px;">
      <div class="filter-row" style="align-items:center;justify-content:space-between;">
        <div class="filter-group">
          <span class="filter-label">Simulasi Peran Aktif (Tampilan UI Saja)</span>
          <div class="filter-pills" role="group" aria-label="Pilih peran simulasi">
            ${availableRoles.map(role => `
              <button
                type="button"
                class="filter-pill ${currentUser.role === role ? 'active' : ''}"
                data-sim-role="${escapeHtml(role)}"
                aria-pressed="${currentUser.role === role ? 'true' : 'false'}"
              >
                ${escapeHtml(role)}
              </button>
            `).join('')}
          </div>
        </div>
        <span class="filter-summary-chip">Aktif: ${escapeHtml(currentUser.role)} · Simulasi</span>
      </div>
    </div>
  `;
}

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
          <div class="user-cell user-col-name">
            <div class="activity-avatar ${u.avatarClass}">${escapeHtml(u.initials)}</div>
            <div>
              <strong>${escapeHtml(u.name)}</strong>
              <div class="user-mobile-email cl-muted">${escapeHtml(u.email)}</div>
            </div>
          </div>
          <div class="cl-muted user-col-email">${escapeHtml(u.email)}</div>
          <div class="user-col-role">
            <span class="role-pill ${ROLE_COLORS[u.role] || ''}">${escapeHtml(u.role)}</span>
          </div>
          <div class="cl-muted user-col-joined">${escapeHtml(u.joined)}</div>
          <div class="user-col-status">
            <span class="status-pill ${u.status === 'Aktif' ? 'st-ready' : 'st-idea'}">${escapeHtml(u.status)}</span>
          </div>
          <div class="user-col-action" style="display:flex;gap:6px;">
            <button type="button" class="btn-secondary user-edit-btn" style="padding:5px 10px;font-size:11px;" data-uid="${escapeHtml(u.id)}" aria-label="Edit peran ${escapeHtml(u.name)}">Edit peran</button>
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
      ${rolesMatrix.map(row => {
        const isCurrent = row.role === currentUser.role;
        return `
          <div class="matrix-row ${isCurrent ? 'matrix-row-active' : ''}">
            <div class="matrix-role-cell">
              <span class="role-pill ${ROLE_COLORS[row.role] || ''}">${escapeHtml(row.role)}</span>
              ${isCurrent ? '<div style="font-size:9px;font-weight:700;color:var(--color-red);margin-top:2px;">AKTIF (SIMULASI)</div>' : ''}
            </div>
            ${areas.map(a => `
              <div class="matrix-cell ${row[a] ? 'allowed' : 'denied'}">
                <span class="matrix-icon" title="${row[a] ? 'Diizinkan' : 'Tidak diizinkan'}">
                  ${row[a] ? '✓' : '—'}
                </span>
              </div>
            `).join('')}
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function openEditRoleModal(user, renderApp, showToast) {
  const modalContainer = document.querySelector('#modal-container');
  if (!modalContainer || !user) return;

  modalContainer.innerHTML = `
    <div class="modal-backdrop" id="role-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="role-modal-title">
      <div class="panel modal-card" style="width:min(420px,100%);">
        <button type="button" class="modal-close-btn" id="close-role-modal" aria-label="Tutup modal">✕</button>
        <span class="eyebrow">SIMULASI HAK AKSES</span>
        <h2 id="role-modal-title" style="font-size:19px;margin:6px 0 4px;">Edit Peran: ${escapeHtml(user.name)}</h2>
        <p style="font-size:12px;color:var(--color-ink-secondary);margin-bottom:16px;">
          Perubahan hanya simulasi tampilan di sesi ini, bukan kontrol keamanan nyata.
        </p>
        <form id="edit-role-form" style="display:flex;flex-direction:column;gap:14px;">
          <div>
            <label class="form-label" for="er-role">Peran</label>
            <select id="er-role" class="form-control">
              ${availableRoles.map(r => `<option value="${escapeHtml(r)}" ${r === user.role ? 'selected' : ''}>${escapeHtml(r)}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="form-label" for="er-status">Status</label>
            <select id="er-status" class="form-control">
              <option value="Aktif" ${user.status === 'Aktif' ? 'selected' : ''}>Aktif</option>
              <option value="Tidak aktif" ${user.status !== 'Aktif' ? 'selected' : ''}>Tidak aktif</option>
            </select>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn-secondary" id="cancel-role-modal">Batal</button>
            <button type="submit" class="btn-primary">Simpan (Simulasi)</button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.querySelector('#er-role')?.focus();
  const onKeyDown = (e) => { if (e.key === 'Escape') close(); };
  const close = () => {
    document.removeEventListener('keydown', onKeyDown);
    modalContainer.innerHTML = '';
  };

  document.addEventListener('keydown', onKeyDown);
  document.querySelector('#close-role-modal')?.addEventListener('click', close);
  document.querySelector('#cancel-role-modal')?.addEventListener('click', close);
  document.querySelector('#role-modal-backdrop')?.addEventListener('click', (e) => {
    if (e.target.id === 'role-modal-backdrop') close();
  });

  document.querySelector('#edit-role-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    user.role = document.querySelector('#er-role').value;
    user.status = document.querySelector('#er-status').value;
    if (user.name === currentUser.name) {
      currentUser.role = user.role;
    }
    close();
    showToast(`Peran "${user.name}" disimulasikan menjadi ${user.role} (${user.status}).`);
    renderApp();
  });
}

export function renderUsers() {
  const active   = usersData.filter(u => u.status === 'Aktif').length;
  const inactive = usersData.filter(u => u.status !== 'Aktif').length;

  return `
    <div class="page-heading">
      <div>
        <div class="eyebrow">WORKSPACE / PENGGUNA & AKSES</div>
        <h1>Pengguna & Akses</h1>
        <p>Daftar anggota tim, simulasi peran, dan matriks kemampuan konseptual (bukan kontrol keamanan nyata)</p>
      </div>
      <button type="button" class="btn-primary" id="btn-user-invite"><span>＋</span> Undang Pengguna (Demo)</button>
    </div>

    ${renderRoleSimulator()}

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
        <strong>Pengguna & Akses — Simulasi Lokal</strong>
        <p>Semua pengguna, email, dan pergantian peran adalah simulasi tampilan. Autentikasi dan kontrol akses nyata memerlukan backend.</p>
      </div>
      <span class="demo-badge">SIMULASI</span>
    </div>
  `;
}

export function attachUsersEvents(renderApp, showToast) {
  document.querySelectorAll('[data-sim-role]').forEach(btn => {
    btn.addEventListener('click', () => {
      currentUser.role = btn.dataset.simRole;
      showToast(`Simulasi tampilan peran aktif diubah ke "${currentUser.role}".`);
      renderApp();
    });
  });

  document.querySelector('#btn-user-invite')?.addEventListener('click', () => {
    showToast('Undang pengguna: simulasi UI saja. Fungsi email memerlukan backend.');
  });

  document.querySelectorAll('.user-edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const uid  = btn.dataset.uid;
      const user = usersData.find(u => u.id === uid);
      if (!user) return;
      openEditRoleModal(user, renderApp, showToast);
    });
  });
}
