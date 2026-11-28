/**
 * Manajemen Tim — Khusus Ketua Tim (Super Admin) · Yayasan Motivator Qur'an Fase 5
 * Invite-Only / Pre-Registered Email (Tambah Anggota, Ubah Role, Hapus Anggota, Status Menunggu Aktivasi / Aktif)
 * Catatan: Simulasi front-end (state/localStorage), bukan kontrol akses server nyata.
 */

import {
  ROLES,
  INVITABLE_ROLES,
  MEMBER_STATUSES,
  usersData,
  rolesMatrix,
  availableRoles,
  getCurrentUser,
  quickSwitchRole,
  inviteTeamMember,
  updateMemberRoleAndStatus,
  removeTeamMember,
} from '../data/mockData.js';
import { escapeHtml } from '../utils/helpers.js';

const AREA_LABELS = {
  dashboard: 'Dashboard',
  kalender: 'Kalender',
  pipeline: 'Pipeline',
  tugas: 'Tugas',
  aset: 'Aset',
  notifikasi: 'Notifikasi',
  laporan: 'Laporan',
  tim: 'Manajemen Tim',
};

const ROLE_COLORS = {
  [ROLES.KETUA_TIM]: 'role-admin',
  [ROLES.COPYWRITER]: 'role-creative',
  [ROLES.EDITOR]: 'role-reviewer',
};

function getStatusPillClass(status) {
  if (status === MEMBER_STATUSES.ACTIVE) return 'st-ready';
  if (status === MEMBER_STATUSES.PENDING) return 'st-pending';
  return 'st-idea';
}

function renderRoleSimulator(currentRole) {
  return `
    <div class="panel" style="margin-bottom:20px;padding:16px 20px;">
      <div class="filter-row" style="align-items:center;justify-content:space-between;">
        <div class="filter-group">
          <span class="filter-label">Quick Switch Role Pengujian (Sesi Lokal)</span>
          <div class="filter-pills" role="group" aria-label="Pilih peran simulasi">
            ${availableRoles.map(role => `
              <button
                type="button"
                class="filter-pill ${currentRole === role ? 'active' : ''}"
                data-sim-role="${escapeHtml(role)}"
                aria-pressed="${currentRole === role ? 'true' : 'false'}"
              >
                ${escapeHtml(role)}
              </button>
            `).join('')}
          </div>
        </div>
        <span class="filter-summary-chip">Aktif: ${escapeHtml(currentRole)} · Simulasi</span>
      </div>
    </div>
  `;
}

function renderInviteMemberPanel() {
  return `
    <div class="panel" style="margin-bottom:20px;">
      <div class="panel-head">
        <div>
          <h2>Daftarkan Anggota Baru (Invite-Only)</h2>
          <p>Daftarkan email & tugas anggota sebelum mereka mengaktifkan akun melalui tab <strong>Aktivasi Akun</strong> di halaman login.</p>
        </div>
        <span class="demo-badge">PRE-REGISTER</span>
      </div>

      <div id="inv-error" class="login-error-alert" role="alert" style="display:none;margin-bottom:12px;"></div>

      <form id="invite-member-form" novalidate class="team-invite-form">
        <div class="team-invite-grid">
          <div>
            <label class="form-label" for="inv-email">Email Anggota *</label>
            <input
              id="inv-email"
              name="email"
              type="email"
              class="form-control"
              placeholder="Contoh: anggota@tim.com"
              autocomplete="email"
              required
            />
          </div>

          <div>
            <label class="form-label" for="inv-role">Tugas / Role *</label>
            <select id="inv-role" name="role" class="form-control">
              ${INVITABLE_ROLES.map(r => `<option value="${escapeHtml(r)}">${escapeHtml(r)}</option>`).join('')}
            </select>
          </div>

          <div class="team-invite-submit-wrap">
            <button type="submit" class="btn-primary" id="btn-invite-submit" style="width:100%;justify-content:center;height:38px;">
              <span>＋</span> Daftarkan Anggota
            </button>
          </div>
        </div>
        <p class="team-invite-note">
          ℹ Anggota baru otomatis tercatat berstatus <strong>Menunggu Aktivasi</strong> dan dapat langsung melengkapi Nama Lengkap &amp; Kata Sandi pada tab <em>Aktivasi Akun (Pengguna Baru)</em>.
        </p>
      </form>
    </div>
  `;
}

function renderUsersTable(currentUser) {
  const currentEmail = (currentUser?.email || '').toLowerCase();

  return `
    <div class="table-scroll-wrap">
      <div class="users-table">
        <div class="users-table-head">
          <span>ANGGOTA</span>
          <span>EMAIL TERDAFTAR</span>
          <span>TUGAS / ROLE</span>
          <span>BERGABUNG</span>
          <span>STATUS</span>
          <span>AKSI</span>
        </div>
        ${usersData.map(u => {
          const isSelf = u.email.toLowerCase() === currentEmail;
          const isPending = u.status === MEMBER_STATUSES.PENDING;
          const displayName = isPending && (!u.name || u.isPendingName)
            ? 'Belum Aktivasi Akun'
            : u.name;

          return `
            <div class="users-table-row" data-member-email="${escapeHtml(u.email)}">
              <div class="user-cell user-col-name">
                <div class="activity-avatar ${u.avatarClass || 'av-sand'}">${escapeHtml(u.initials)}</div>
                <div style="min-width:0;">
                  <strong style="${isPending ? 'color:var(--color-ink-secondary);font-style:italic;' : ''}">${escapeHtml(displayName)}</strong>
                  ${isSelf ? `<span class="user-self-tag">Anda</span>` : ''}
                  <div class="user-mobile-email cl-muted">${escapeHtml(u.email)}</div>
                </div>
              </div>
              <div class="cl-muted user-col-email"><code>${escapeHtml(u.email)}</code></div>
              <div class="user-col-role">
                <span class="role-pill ${ROLE_COLORS[u.role] || ''}">${escapeHtml(u.role)}</span>
              </div>
              <div class="cl-muted user-col-joined">${escapeHtml(u.joined)}</div>
              <div class="user-col-status">
                <span class="status-pill ${getStatusPillClass(u.status)}">${escapeHtml(u.status)}</span>
              </div>
              <div class="user-col-action team-row-actions">
                <button
                  type="button"
                  class="btn-secondary user-edit-btn"
                  data-uid="${escapeHtml(u.id)}"
                  aria-label="Ubah role ${escapeHtml(u.email)}"
                >
                  Ubah Role
                </button>
                <button
                  type="button"
                  class="btn-secondary btn-danger-outline user-delete-btn"
                  data-del-uid="${escapeHtml(u.id)}"
                  ${isSelf ? 'disabled title="Akun Ketua Tim yang sedang login tidak dapat dihapus"' : ''}
                  aria-label="Hapus anggota ${escapeHtml(u.email)}"
                >
                  Hapus
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function renderRolesMatrix(currentRole) {
  const areas = Object.keys(AREA_LABELS);
  return `
    <div class="table-scroll-wrap">
      <div class="roles-matrix">
        <div class="matrix-head">
          <div class="matrix-role-col">PERAN</div>
          ${areas.map(a => `<div class="matrix-area-col">${AREA_LABELS[a]}</div>`).join('')}
        </div>
        ${rolesMatrix.map(row => {
      const isCurrent = row.role === currentRole;
      return `
            <div class="matrix-row ${isCurrent ? 'matrix-row-active' : ''}">
              <div class="matrix-role-cell">
                <span class="role-pill ${ROLE_COLORS[row.role] || ''}">${escapeHtml(row.role)}</span>
                ${isCurrent ? '<div style="font-size:9px;font-weight:700;color:var(--color-red);margin-top:2px;">AKTIF (SIMULASI)</div>' : ''}
              </div>
              ${areas.map(a => `
                <div class="matrix-cell ${row[a] ? 'allowed' : 'denied'}">
                  <span class="matrix-icon" title="${row[a] ? 'Diizinkan' : 'Disembunyikan / Dibatasi'}">
                    ${row[a] ? '✓' : '—'}
                  </span>
                </div>
              `).join('')}
            </div>
          `;
    }).join('')}
      </div>
    </div>
  `;
}

function openEditRoleModal(user, currentUser, renderApp, showToast) {
  const modalContainer = document.querySelector('#modal-container');
  if (!modalContainer || !user) return;
  const isSelfKetua = currentUser && user.email.toLowerCase() === currentUser.email.toLowerCase();
  const hasPassword = Boolean(user.demoPassword);

  const statusOptions = hasPassword
    ? [MEMBER_STATUSES.ACTIVE, MEMBER_STATUSES.INACTIVE]
    : [MEMBER_STATUSES.PENDING, MEMBER_STATUSES.INACTIVE];

  modalContainer.innerHTML = `
    <div class="modal-backdrop" id="role-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="role-modal-title">
      <div class="panel modal-card" style="width:min(440px,100%);">
        <button type="button" class="modal-close-btn" id="close-role-modal" aria-label="Tutup modal">✕</button>
        <span class="eyebrow">MANAJEMEN TIM · UBAH ROLE</span>
        <h2 id="role-modal-title" style="font-size:19px;margin:6px 0 4px;">Ubah Role: ${escapeHtml(user.status === MEMBER_STATUSES.PENDING ? user.email : user.name)}</h2>
        <p style="font-size:12px;color:var(--color-ink-secondary);margin-bottom:16px;">
          <code>${escapeHtml(user.email)}</code> · Perubahan tersimpan di <code>localStorage</code> untuk sesi simulasi.
        </p>
        <form id="edit-role-form" style="display:flex;flex-direction:column;gap:14px;">
          <div>
            <label class="form-label" for="er-role">Tugas / Role</label>
            <select id="er-role" class="form-control" ${isSelfKetua ? 'disabled' : ''}>
              ${availableRoles.map(r => `<option value="${escapeHtml(r)}" ${r === user.role ? 'selected' : ''}>${escapeHtml(r)}</option>`).join('')}
            </select>
            ${isSelfKetua ? `<div style="font-size:10px;color:var(--color-ink-muted);margin-top:4px;">Role Ketua Tim yang sedang aktif login tidak dapat diturunkan sendiri.</div>` : ''}
          </div>
          <div>
            <label class="form-label" for="er-status">Status Akun</label>
            <select id="er-status" class="form-control" ${isSelfKetua ? 'disabled' : ''}>
              ${statusOptions.map(st => `<option value="${escapeHtml(st)}" ${user.status === st ? 'selected' : ''}>${escapeHtml(st)}</option>`).join('')}
            </select>
            ${isSelfKetua ? `<div style="font-size:10px;color:var(--color-ink-muted);margin-top:4px;">Akun Ketua Tim yang sedang login tidak dapat dinonaktifkan sendiri.</div>` : ''}
            ${!hasPassword && !isSelfKetua ? `<div style="font-size:10px;color:var(--color-ink-muted);margin-top:4px;">Status otomatis menjadi <strong>Aktif</strong> setelah anggota menyelesaikan tab <em>Aktivasi Akun</em>.</div>` : ''}
          </div>
          <div class="modal-footer">
            <button type="button" class="btn-secondary" id="cancel-role-modal">Batal</button>
            <button type="submit" class="btn-primary">Simpan Perubahan</button>
          </div>
        </form>
      </div>
    </div>
  `;

  (isSelfKetua ? document.querySelector('#cancel-role-modal') : document.querySelector('#er-role'))?.focus();
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
    const newRole = isSelfKetua ? user.role : document.querySelector('#er-role').value;
    const newStatus = isSelfKetua ? MEMBER_STATUSES.ACTIVE : document.querySelector('#er-status').value;
    updateMemberRoleAndStatus(user.id, newRole, newStatus);
    close();
    showToast(`Role untuk "${user.email}" diperbarui menjadi ${newRole} (${newStatus}).`);
    renderApp();
  });
}

function openDeleteMemberModal(user, renderApp, showToast) {
  const modalContainer = document.querySelector('#modal-container');
  if (!modalContainer || !user) return;

  modalContainer.innerHTML = `
    <div class="modal-backdrop" id="delete-member-backdrop" role="dialog" aria-modal="true" aria-labelledby="delete-member-title">
      <div class="panel modal-card" style="width:min(420px,100%);">
        <button type="button" class="modal-close-btn" id="close-delete-modal" aria-label="Tutup modal">✕</button>
        <span class="eyebrow" style="color:var(--color-red-ink);">KONFIRMASI HAPUS ANGGOTA</span>
        <h2 id="delete-member-title" style="font-size:19px;margin:6px 0 8px;">Hapus Akses Anggota?</h2>
        <p style="font-size:12px;color:var(--color-ink-secondary);line-height:1.55;margin-bottom:14px;">
          Anggota ini akan dihapus dari daftar tim (<code>localStorage</code>) dan tidak dapat Sign In maupun Aktivasi Akun kecuali didaftarkan ulang oleh Ketua Tim.
        </p>

        <div class="detail-kv-grid" style="margin-bottom:16px;">
          <div>
            <span class="filter-label">EMAIL</span>
            <strong><code>${escapeHtml(user.email)}</code></strong>
          </div>
          <div>
            <span class="filter-label">ROLE &amp; STATUS</span>
            <strong>${escapeHtml(user.role)} · ${escapeHtml(user.status)}</strong>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn-secondary" id="cancel-delete-modal">Batal</button>
          <button type="button" class="btn-primary" id="confirm-delete-member">Hapus Anggota</button>
        </div>
      </div>
    </div>
  `;

  document.querySelector('#cancel-delete-modal')?.focus();
  const onKeyDown = (e) => { if (e.key === 'Escape') close(); };
  const close = () => {
    document.removeEventListener('keydown', onKeyDown);
    modalContainer.innerHTML = '';
  };

  document.addEventListener('keydown', onKeyDown);
  document.querySelector('#close-delete-modal')?.addEventListener('click', close);
  document.querySelector('#cancel-delete-modal')?.addEventListener('click', close);
  document.querySelector('#delete-member-backdrop')?.addEventListener('click', (e) => {
    if (e.target.id === 'delete-member-backdrop') close();
  });

  document.querySelector('#confirm-delete-member')?.addEventListener('click', () => {
    const res = removeTeamMember(user.id);
    close();
    if (!res.ok) {
      showToast(res.error || 'Gagal menghapus anggota.');
      return;
    }
    showToast(`Anggota "${user.email}" berhasil dihapus dari Manajemen Tim.`);
    renderApp();
  });
}

export function renderUsers() {
  const currentUser = getCurrentUser();
  const currentRole = currentUser?.role || ROLES.KETUA_TIM;

  if (currentRole !== ROLES.KETUA_TIM) {
    return `
      <div class="placeholder-container">
        <span class="placeholder-badge">AKSES DIBATASI (RBAC SIMULASI)</span>
        <h2>Halaman Khusus Ketua Tim</h2>
        <p>Menu <strong>Manajemen Tim</strong> hanya tersedia untuk <strong>Ketua Tim</strong> sebagai Super Admin.</p>
        <div class="placeholder-actions">
          <button type="button" class="btn-primary" data-route="Overview">← Kembali ke Overview</button>
        </div>
      </div>
    `;
  }

  const activeCount = usersData.filter(u => u.status === MEMBER_STATUSES.ACTIVE).length;
  const pendingCount = usersData.filter(u => u.status === MEMBER_STATUSES.PENDING).length;

  return `
    <div class="page-heading">
      <div>
        <div class="eyebrow">WORKSPACE / MANAJEMEN TIM (KHUSUS KETUA TIM)</div>
        <h1>Manajemen Tim</h1>
        <p>Pendaftaran anggota berbasis <strong>Invite-Only</strong>, penugasan role (Copywriter / Editor), status aktivasi, dan matriks hak akses</p>
      </div>
    </div>

    ${renderRoleSimulator(currentRole)}

    <!-- Stats -->
    <div class="pip-stats" style="margin-bottom:20px;">
      <div class="pip-stat-item">
        <span class="pip-stat-val">${usersData.length}</span>
        <span class="pip-stat-label">Total anggota tim</span>
      </div>
      <div class="pip-stat-divider"></div>
      <div class="pip-stat-item">
        <span class="pip-stat-val" style="color:var(--color-gold-ink)">${activeCount}</span>
        <span class="pip-stat-label">Aktif</span>
      </div>
      <div class="pip-stat-divider"></div>
      <div class="pip-stat-item">
        <span class="pip-stat-val" style="color:var(--color-red-ink)">${pendingCount}</span>
        <span class="pip-stat-label">Menunggu Aktivasi</span>
      </div>
      <div class="pip-stat-divider"></div>
      <div class="pip-stat-item">
        <span class="pip-stat-val">${rolesMatrix.length}</span>
        <span class="pip-stat-label">Peran inti RBAC</span>
      </div>
    </div>

    <!-- Invite Form -->
    ${renderInviteMemberPanel()}

    <!-- Team Table -->
    <div class="panel" style="margin-bottom:20px;padding:0 0 8px;">
      <div class="panel-head" style="padding:18px 20px 0;">
        <div>
          <h2>Daftar Anggota Tim</h2>
          <p>Hanya akun berstatus <strong>Aktif</strong> yang dapat masuk · Akun <strong>Menunggu Aktivasi</strong> perlu aktivasi mandiri via tab Aktivasi Akun</p>
        </div>
        <span class="demo-badge">DATA TIM LOKAL</span>
      </div>
      ${renderUsersTable(currentUser)}
    </div>

    <!-- Roles Matrix -->
    <div class="panel" style="margin-bottom:20px;">
      <div class="panel-head">
        <div>
          <h2>Matriks Kemampuan 3 Peran Inti</h2>
          <p>Ringkasan visibilitas menu & aksi antarmuka per peran · Keamanan server-side menunggu backend</p>
        </div>
        <span class="demo-badge">RBAC MATRIX</span>
      </div>
      ${renderRolesMatrix(currentRole)}
    </div>

    <div class="demo-banner">
      <span class="demo-banner-icon">✳</span>
      <div class="demo-banner-content">
        <strong>Manajemen Tim Invite-Only — Simulasi Lokal</strong>
        <p>Semua pendaftaran email, aktivasi akun, perubahan role, dan penghapusan anggota tersimpan di <code>localStorage</code>. Pengiriman email undangan otomatis memerlukan backend.</p>
      </div>
      <span class="demo-badge">SIMULASI</span>
    </div>
  `;
}

export function attachUsersEvents(renderApp, showToast) {
  document.querySelectorAll('[data-sim-role]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetRole = btn.dataset.simRole;
      const nextUser = quickSwitchRole(targetRole);
      showToast(`Quick Switch aktif: masuk sebagai ${nextUser?.name || targetRole} (${targetRole}).`);
      renderApp();
    });
  });

  const inviteForm = document.querySelector('#invite-member-form');
  const invEmailEl = document.querySelector('#inv-email');
  const invRoleEl = document.querySelector('#inv-role');
  const invErrEl = document.querySelector('#inv-error');

  inviteForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const res = inviteTeamMember({
      email: invEmailEl?.value || '',
      role: invRoleEl?.value || ROLES.COPYWRITER,
    });

    if (!res.ok) {
      if (invErrEl) {
        invErrEl.textContent = res.error;
        invErrEl.style.display = 'block';
      }
      invEmailEl?.focus();
      return;
    }

    if (invErrEl) invErrEl.style.display = 'none';
    showToast(`Berhasil mendaftarkan "${res.user.email}" sebagai ${res.user.role} (Menunggu Aktivasi).`);
    renderApp();
  });

  document.querySelectorAll('.user-edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const uid = btn.dataset.uid;
      const user = usersData.find(u => u.id === uid);
      if (!user) return;
      openEditRoleModal(user, getCurrentUser(), renderApp, showToast);
    });
  });

  document.querySelectorAll('.user-delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const uid = btn.dataset.delUid;
      const user = usersData.find(u => u.id === uid);
      if (!user) return;
      openDeleteMemberModal(user, renderApp, showToast);
    });
  });
}
