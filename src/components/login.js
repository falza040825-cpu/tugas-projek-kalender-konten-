/**
 * Halaman Autentikasi 2 Tab — Yayasan Motivator Qur'an Content Operations
 * Tab 1: Sign In (Masuk) — Email & Kata Sandi (deteksi peran otomatis).
 * Tab 2: Aktivasi Akun (Pengguna Baru) — Mekanisme Invite-Only / Pre-Registered Email oleh Ketua Tim.
 * Catatan: Simulasi front-end (state / localStorage), bukan autentikasi server nyata.
 */

import {
  demoCredentialsGuide,
  loginWithCredentials,
  activateInvitedAccount,
  resetDemoWorkspace,
} from '../data/mockData.js';
import { escapeHtml } from '../utils/helpers.js';

let authUiState = {
  activeTab: 'signin', // 'signin' | 'activate'
  prefillEmail: '',
  successBanner: '',
};

export function resetAuthUiState() {
  authUiState = {
    activeTab: 'signin',
    prefillEmail: '',
    successBanner: '',
  };
}

export function renderLogin(tabOverride = null) {
  if (tabOverride === 'signin' || tabOverride === 'activate') {
    authUiState.activeTab = tabOverride;
  }
  const isSignIn = authUiState.activeTab !== 'activate';

  return `
    <div class="login-shell">
      <div class="login-card">
        <div class="login-brand-header">
          <div class="brand-mark login-brand-mark" aria-hidden="true">MQ</div>
          <div>
            <span class="login-eyebrow">YAYASAN MOTIVATOR QUR'AN</span>
            <h1>Content Operations</h1>
          </div>
          <span class="demo-badge">INVITE-ONLY · RBAC</span>
        </div>

        <div class="auth-tabs" role="tablist" aria-label="Pilih mode autentikasi">
          <button
            type="button"
            id="tab-signin"
            role="tab"
            class="auth-tab-btn ${isSignIn ? 'active' : ''}"
            data-auth-tab="signin"
            aria-selected="${isSignIn ? 'true' : 'false'}"
            aria-controls="panel-signin"
          >
            Sign In (Masuk)
          </button>
          <button
            type="button"
            id="tab-activate"
            role="tab"
            class="auth-tab-btn ${!isSignIn ? 'active' : ''}"
            data-auth-tab="activate"
            aria-selected="${!isSignIn ? 'true' : 'false'}"
            aria-controls="panel-activate"
          >
            Aktivasi Akun (Pengguna Baru)
          </button>
        </div>

        ${isSignIn ? `
          <div id="panel-signin" role="tabpanel" aria-labelledby="tab-signin">
            <p class="login-subtitle">
              Masuk dengan <strong>Email</strong> dan <strong>Kata Sandi</strong> akun berstatus <em>Aktif</em>. Peran Anda (<em>Ketua Tim</em>, <em>Copywriter</em>, atau <em>Editor</em>) terdeteksi otomatis.
            </p>

            ${authUiState.successBanner ? `
              <div id="login-success" class="login-success-alert" role="status">
                ✓ ${escapeHtml(authUiState.successBanner)}
              </div>
            ` : ''}

            <div id="login-error" class="login-error-alert" role="alert" style="display:none;"></div>

            <form id="login-form" novalidate class="login-form">
              <div>
                <label class="form-label" for="login-email">Email</label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  class="form-control"
                  value="${escapeHtml(authUiState.prefillEmail)}"
                  placeholder="Contoh: ketua@tim.com"
                  autocomplete="email"
                  required
                />
              </div>

              <div>
                <label class="form-label" for="login-password">Kata Sandi</label>
                <div class="login-password-wrap">
                  <input
                    id="login-password"
                    name="password"
                    type="password"
                    class="form-control"
                    placeholder="Masukkan kata sandi"
                    autocomplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    id="toggle-password-vis"
                    class="login-vis-btn"
                    aria-label="Tampilkan atau sembunyikan kata sandi"
                    aria-pressed="false"
                  >
                    Lihat
                  </button>
                </div>
              </div>

              <button type="submit" class="btn-primary login-submit-btn" id="btn-login-submit">
                Masuk ke Ruang Kerja →
              </button>
            </form>

            <p class="login-helper-hint">
              Baru didaftarkan oleh Ketua Tim? <button type="button" class="login-inline-link" data-auth-tab="activate">Aktifkan akun Anda di sini →</button>
            </p>

            <div class="login-demo-box">
              <div class="login-demo-head">
                <strong>Akun Bawaan Aktif (Pengujian Cepat)</strong>
                <span>Klik "Isi form" lalu tekan Masuk</span>
              </div>

              <div class="login-demo-list">
                ${demoCredentialsGuide.map(acc => `
                  <div class="login-demo-item">
                    <div class="login-demo-meta">
                      <div class="login-demo-title">
                        <strong>${escapeHtml(acc.role)}</strong>
                        <span class="login-demo-subbadge">${escapeHtml(acc.badge)}</span>
                      </div>
                      <div class="login-demo-cred">
                        <code>${escapeHtml(acc.email)}</code> · Kata sandi: <code>${escapeHtml(acc.password)}</code>
                      </div>
                    </div>
                    <button
                      type="button"
                      class="btn-secondary login-autofill-btn"
                      data-demo-email="${escapeHtml(acc.email)}"
                      data-demo-password="${escapeHtml(acc.password)}"
                    >
                      Isi form
                    </button>
                  </div>
                `).join('')}
              </div>

              <div class="login-demo-footer">
                <span class="login-disclaimer">
                  Simulasi sesi & data tim di <code>state/localStorage</code>. Tidak terhubung ke server/database nyata.
                </span>
                <button type="button" id="btn-login-reset-demo" class="login-reset-link">
                  Reset data dummy
                </button>
              </div>
            </div>
          </div>
        ` : `
          <div id="panel-activate" role="tabpanel" aria-labelledby="tab-activate">
            <p class="login-subtitle">
              Khusus anggota baru yang emailnya telah didaftarkan oleh <strong>Ketua Tim</strong>. Lengkapi nama lengkap dan buat kata sandi baru untuk mengaktifkan akses.
            </p>

            <div id="activate-error" class="login-error-alert" role="alert" style="display:none;"></div>

            <form id="activate-form" novalidate class="login-form">
              <div>
                <label class="form-label" for="act-email">Email Terdaftar</label>
                <input
                  id="act-email"
                  name="email"
                  type="email"
                  class="form-control"
                  placeholder="Email yang didaftarkan Ketua Tim"
                  autocomplete="email"
                  required
                />
              </div>

              <div>
                <label class="form-label" for="act-name">Nama Lengkap</label>
                <input
                  id="act-name"
                  name="name"
                  type="text"
                  class="form-control"
                  placeholder="Contoh: Ahmad Fauzi"
                  autocomplete="name"
                  required
                />
              </div>

              <div>
                <label class="form-label" for="act-password">Buat Kata Sandi Baru</label>
                <div class="login-password-wrap">
                  <input
                    id="act-password"
                    name="new-password"
                    type="password"
                    class="form-control"
                    placeholder="Minimal 6 karakter"
                    autocomplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    id="toggle-act-password-vis"
                    class="login-vis-btn"
                    aria-label="Tampilkan atau sembunyikan kata sandi baru"
                    aria-pressed="false"
                  >
                    Lihat
                  </button>
                </div>
              </div>

              <div class="auth-role-notice">
                <span>ℹ</span>
                <span>Tugas/role (<strong>Copywriter</strong> atau <strong>Editor</strong>) otomatis mengikuti penugasan Ketua Tim.</span>
              </div>

              <button type="submit" class="btn-gold login-submit-btn" id="btn-activate-submit">
                Aktivasi Akun →
              </button>
            </form>

            <p class="login-helper-hint">
              Sudah memiliki akun aktif? <button type="button" class="login-inline-link" data-auth-tab="signin">Kembali ke Sign In (Masuk)</button>
            </p>
          </div>
        `}
      </div>
    </div>
  `;
}

export function attachLoginEvents(onLoginSuccess, showToast, rerenderLogin) {
  const switchTab = (nextTab, focusSelector = null) => {
    authUiState.activeTab = nextTab;
    if (nextTab === 'activate') {
      authUiState.successBanner = '';
    }
    if (typeof rerenderLogin === 'function') {
      rerenderLogin(focusSelector);
    }
  };

  document.querySelectorAll('[data-auth-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.dataset.authTab;
      if (!targetTab) return;
      switchTab(targetTab, targetTab === 'activate' ? '#act-email' : '#login-email');
    });
  });

  if (authUiState.activeTab !== 'activate') {
    const form = document.querySelector('#login-form');
    const emailEl = document.querySelector('#login-email');
    const passEl = document.querySelector('#login-password');
    const errEl = document.querySelector('#login-error');
    const toggleBtn = document.querySelector('#toggle-password-vis');

    if (authUiState.prefillEmail && passEl) {
      passEl.focus();
    } else {
      emailEl?.focus();
    }

    toggleBtn?.addEventListener('click', () => {
      if (!passEl) return;
      const isHidden = passEl.type === 'password';
      passEl.type = isHidden ? 'text' : 'password';
      toggleBtn.textContent = isHidden ? 'Tutup' : 'Lihat';
      toggleBtn.setAttribute('aria-pressed', String(isHidden));
    });

    document.querySelectorAll('.login-autofill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (emailEl) emailEl.value = btn.dataset.demoEmail || '';
        if (passEl) passEl.value = btn.dataset.demoPassword || '';
        if (errEl) errEl.style.display = 'none';
        document.querySelector('#btn-login-submit')?.focus();
      });
    });

    document.querySelector('#btn-login-reset-demo')?.addEventListener('click', () => {
      resetDemoWorkspace(false);
      resetAuthUiState();
      if (typeof rerenderLogin === 'function') {
        rerenderLogin('#login-email');
      }
      showToast('Data tim, akun bawaan, & sesi lokal berhasil direset.');
    });

    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const res = loginWithCredentials(emailEl?.value || '', passEl?.value || '');
      if (!res.ok) {
        if (errEl) {
          errEl.textContent = res.error;
          errEl.style.display = 'block';
        }
        if (!emailEl?.value.trim()) {
          emailEl?.focus();
        } else {
          passEl?.focus();
        }
        return;
      }

      if (errEl) errEl.style.display = 'none';
      resetAuthUiState();
      onLoginSuccess(res.user);
    });
  } else {
    const actForm = document.querySelector('#activate-form');
    const actEmailEl = document.querySelector('#act-email');
    const actNameEl = document.querySelector('#act-name');
    const actPassEl = document.querySelector('#act-password');
    const actErrEl = document.querySelector('#activate-error');
    const actToggleBtn = document.querySelector('#toggle-act-password-vis');

    actEmailEl?.focus();

    actToggleBtn?.addEventListener('click', () => {
      if (!actPassEl) return;
      const isHidden = actPassEl.type === 'password';
      actPassEl.type = isHidden ? 'text' : 'password';
      actToggleBtn.textContent = isHidden ? 'Tutup' : 'Lihat';
      actToggleBtn.setAttribute('aria-pressed', String(isHidden));
    });

    actForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const res = activateInvitedAccount({
        email: actEmailEl?.value || '',
        fullName: actNameEl?.value || '',
        password: actPassEl?.value || '',
      });

      if (!res.ok) {
        if (actErrEl) {
          actErrEl.textContent = res.error;
          actErrEl.style.display = 'block';
        }
        if (!actEmailEl?.value.trim() || res.error.includes('Email')) {
          actEmailEl?.focus();
        } else if (!actNameEl?.value.trim() || res.error.includes('Nama')) {
          actNameEl?.focus();
        } else {
          actPassEl?.focus();
        }
        return;
      }

      if (actErrEl) actErrEl.style.display = 'none';
      authUiState.activeTab = 'signin';
      authUiState.prefillEmail = res.user.email;
      authUiState.successBanner = `Aktivasi berhasil! Akun "${res.user.name}" aktif sebagai ${res.user.role}. Silakan Sign In.`;
      showToast(`Aktivasi sukses! ${res.user.name} aktif sebagai ${res.user.role}. Silakan masuk.`);

      if (typeof rerenderLogin === 'function') {
        rerenderLogin('#login-password');
      }
    });
  }
}
