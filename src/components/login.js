/**
 * Halaman Autentikasi Interactive Desk Lamp — StudioFlow · Tim Kreatif YMQ
 * - Interaksi lampu meja arsitek: tarik/klik tali sakelar untuk menyalakan & memunculkan form.
 * - Klik kap lampu saat menyala untuk mengganti 5 warna cahaya secara dinamis.
 * - Efek suara mekanis & dengung listrik halus via Web Audio API (aman dengan fallback).
 * - Mempertahankan 2 Tab: Sign In (Masuk) & Aktivasi Akun (Invite-Only) + Quick Demo Login.
 * Catatan: Simulasi front-end (state / localStorage), bukan autentikasi server nyata.
 */

import {
  demoCredentialsGuide,
  loginWithCredentials,
  activateInvitedAccount,
  resetDemoWorkspace,
} from '../data/mockData.js';
import { escapeHtml } from '../utils/helpers.js';

const LAMP_THEMES = [
  { id: 'amber', name: 'Warm Amber', hex: '#F5A623', rgb: '245, 166, 35', ink: '#1A1205' },
  { id: 'cyan', name: 'Electric Cyan', hex: '#00D2FF', rgb: '0, 210, 255', ink: '#041820' },
  { id: 'rose', name: 'Neon Rose', hex: '#FF4D8D', rgb: '255, 77, 141', ink: '#FFFFFF' },
  { id: 'emerald', name: 'Emerald Green', hex: '#10B981', rgb: '16, 185, 129', ink: '#041C14' },
  { id: 'white', name: 'Studio White', hex: '#F8FAFC', rgb: '248, 250, 252', ink: '#121316' },
];

let authUiState = {
  activeTab: 'signin', // 'signin' | 'activate'
  prefillEmail: '',
  successBanner: '',
  lampOn: false,
  themeIndex: 0,
};

let sharedAudioCtx = null;

function getAudioContextSafe() {
  try {
    if (typeof window === 'undefined') return null;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    if (!sharedAudioCtx) {
      sharedAudioCtx = new AudioCtx();
    }
    if (sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume().catch(() => {});
    }
    return sharedAudioCtx;
  } catch {
    return null;
  }
}

/**
 * Efek suara klik sakelar mekanis + dengung listrik ringan (Web Audio API).
 * Aman dengan fallback senyap jika browser memblokir audio.
 */
function playLampSwitchSound(turningOn) {
  try {
    const ctx = getAudioContextSafe();
    if (!ctx) return;

    const now = ctx.currentTime;

    // 1. Klik mekanis pendek (filtered noise burst)
    const bufferSize = Math.floor(ctx.sampleRate * 0.025);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i += 1) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.28));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(turningOn ? 2400 : 1650, now);
    filter.Q.setValueAtTime(1.8, now);

    const clickGain = ctx.createGain();
    clickGain.gain.setValueAtTime(0.24, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.024);

    noise.connect(filter);
    filter.connect(clickGain);
    clickGain.connect(ctx.destination);
    noise.start(now);

    // 2. Ketukan pegas logam ringan
    const snapOsc = ctx.createOscillator();
    const snapGain = ctx.createGain();
    snapOsc.type = 'triangle';
    snapOsc.frequency.setValueAtTime(turningOn ? 620 : 420, now);
    snapOsc.frequency.exponentialRampToValueAtTime(turningOn ? 210 : 130, now + 0.032);

    snapGain.gain.setValueAtTime(0.11, now);
    snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.034);

    snapOsc.connect(snapGain);
    snapGain.connect(ctx.destination);
    snapOsc.start(now);
    snapOsc.stop(now + 0.036);

    // 3. Dengung listrik hangat singkat saat lampu menyala
    if (turningOn) {
      const humOsc = ctx.createOscillator();
      const humHarmonic = ctx.createOscillator();
      const humGain = ctx.createGain();

      humOsc.type = 'sine';
      humOsc.frequency.setValueAtTime(60, now + 0.015);
      humHarmonic.type = 'triangle';
      humHarmonic.frequency.setValueAtTime(120, now + 0.015);

      humGain.gain.setValueAtTime(0.0001, now + 0.015);
      humGain.gain.linearRampToValueAtTime(0.028, now + 0.08);
      humGain.gain.exponentialRampToValueAtTime(0.0008, now + 0.48);

      humOsc.connect(humGain);
      humHarmonic.connect(humGain);
      humGain.connect(ctx.destination);

      humOsc.start(now + 0.015);
      humHarmonic.start(now + 0.015);
      humOsc.stop(now + 0.5);
      humHarmonic.stop(now + 0.5);
    }
  } catch {
    // Fallback aman bila AudioContext tidak tersedia / diblokir
  }
}

/**
 * Efek suara ketukan halus saat mengganti warna cahaya pada kap lampu.
 */
function playColorTickSound() {
  try {
    const ctx = getAudioContextSafe();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.055);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.075);
  } catch {
    // Fallback senyap
  }
}

export function resetAuthUiState() {
  authUiState = {
    activeTab: 'signin',
    prefillEmail: '',
    successBanner: '',
    lampOn: false,
    themeIndex: 0,
  };
}

function getCurrentTheme() {
  return LAMP_THEMES[authUiState.themeIndex % LAMP_THEMES.length] || LAMP_THEMES[0];
}

export function renderLogin(tabOverride = null) {
  if (tabOverride === 'signin' || tabOverride === 'activate') {
    authUiState.activeTab = tabOverride;
  }
  const isSignIn = authUiState.activeTab !== 'activate';
  const theme = getCurrentTheme();
  const isOn = authUiState.lampOn;

  return `
    <div
      id="login-lamp-stage"
      class="login-lamp-stage ${isOn ? 'is-lit' : 'is-dark'}"
      style="--lamp-color: ${theme.hex}; --lamp-rgb: ${theme.rgb}; --lamp-ink: ${theme.ink};"
      data-lamp-on="${isOn ? 'true' : 'false'}"
      data-lamp-theme="${escapeHtml(theme.id)}"
    >
      <!-- Studio Floor & Ambient Room Lighting -->
      <div class="lamp-room-ambient" aria-hidden="true"></div>
      <div class="lamp-floor-plane" aria-hidden="true"></div>

      <div class="lamp-split-container">
        <!-- LEFT STAGE: Interactive Architect Desk Lamp -->
        <div class="lamp-visual-col">
          <div class="lamp-assembly">
            <!-- Diagonal Spotlight Cone -->
            <div class="lamp-spotlight-cone" aria-hidden="true"></div>
            <div class="lamp-spotlight-core" aria-hidden="true"></div>

            <!-- Architect Dual-Arm Desk Lamp SVG -->
            <svg
              class="desk-lamp-svg"
              viewBox="0 0 360 430"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="Lampu meja studio interaktif"
            >
              <defs>
                <linearGradient id="lampMetalDark" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#3A3F4B" />
                  <stop offset="50%" stop-color="#22252D" />
                  <stop offset="100%" stop-color="#15171C" />
                </linearGradient>
                <linearGradient id="lampMetalRod" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stop-color="#4B5263" />
                  <stop offset="50%" stop-color="#2B2F3A" />
                  <stop offset="100%" stop-color="#191B22" />
                </linearGradient>
                <linearGradient id="lampShadeBody" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#3E4452" />
                  <stop offset="45%" stop-color="#252933" />
                  <stop offset="100%" stop-color="#14161B" />
                </linearGradient>
                <linearGradient id="lampBaseTop" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#363B47" />
                  <stop offset="100%" stop-color="#181A20" />
                </linearGradient>
                <radialGradient id="bulbGlowGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.98" />
                  <stop offset="45%" stop-color="var(--lamp-color)" stop-opacity="0.92" />
                  <stop offset="100%" stop-color="var(--lamp-color)" stop-opacity="0" />
                </radialGradient>
                <filter id="bulbBlur" x="-60%" y="-60%" width="220%" height="220%">
                  <feGaussianBlur stdDeviation="10" />
                </filter>
              </defs>

              <!-- Desk Contact Shadow & Light Pool -->
              <ellipse cx="122" cy="398" rx="92" ry="13" fill="rgba(0,0,0,0.62)" />
              <ellipse class="lamp-desk-pool" cx="252" cy="396" rx="108" ry="16" />

              <!-- Weighted Desk Base -->
              <path
                d="M52 390 C52 379 74 373 118 373 C162 373 184 379 184 390 L186 396 C186 400 156 403 118 403 C80 403 50 400 50 396 Z"
                fill="url(#lampBaseTop)"
                stroke="rgba(255,255,255,0.12)"
                stroke-width="1"
              />
              <!-- Base Collar Stem -->
              <rect x="105" y="352" width="26" height="24" rx="6" fill="url(#lampMetalDark)" stroke="rgba(255,255,255,0.12)" stroke-width="1" />
              <circle cx="118" cy="360" r="5" fill="#111318" stroke="rgba(255,255,255,0.22)" stroke-width="1.2" />

              <!-- Lower Articulated Dual Arm -->
              <line x1="112" y1="358" x2="64" y2="226" stroke="url(#lampMetalRod)" stroke-width="7" stroke-linecap="round" />
              <line x1="124" y1="354" x2="76" y2="222" stroke="url(#lampMetalRod)" stroke-width="4.5" stroke-linecap="round" />
              <!-- Lower Spring Detail -->
              <line x1="101" y1="326" x2="77" y2="260" stroke="rgba(255,255,255,0.2)" stroke-width="2" stroke-dasharray="3 3" />

              <!-- Upper Articulated Dual Arm -->
              <line x1="68" y1="222" x2="188" y2="112" stroke="url(#lampMetalRod)" stroke-width="7" stroke-linecap="round" />
              <line x1="76" y1="230" x2="196" y2="120" stroke="url(#lampMetalRod)" stroke-width="4.5" stroke-linecap="round" />
              <!-- Upper Tension Detail -->
              <line x1="106" y1="194" x2="154" y2="150" stroke="rgba(255,255,255,0.2)" stroke-width="2" stroke-dasharray="3 3" />

              <!-- Elbow Joint -->
              <circle cx="70" cy="225" r="13" fill="url(#lampMetalDark)" stroke="rgba(255,255,255,0.18)" stroke-width="1.4" />
              <circle cx="70" cy="225" r="5" fill="#14161B" stroke="rgba(255,255,255,0.28)" stroke-width="1.2" />

              <!-- Pull Cord Assembly (Interactive Click & Drag) -->
              <g
                id="lamp-cord-btn"
                class="lamp-cord-group"
                role="button"
                tabindex="0"
                aria-pressed="${isOn ? 'true' : 'false'}"
                aria-label="${isOn ? 'Tarik tali untuk mematikan lampu' : 'Tarik tali untuk menyalakan lampu'}"
              >
                <!-- Large invisible hit area for effortless click/drag -->
                <rect x="206" y="160" width="48" height="158" fill="transparent" />
                <!-- Cord String (top tucked inside shade so pull stays connected) -->
                <line
                  class="lamp-cord-line"
                  x1="230"
                  y1="158"
                  x2="230"
                  y2="288"
                  stroke="#9CA3AF"
                  stroke-width="2.2"
                  stroke-linecap="round"
                />
                <!-- Small Knot Ring -->
                <circle cx="230" cy="285" r="3" fill="#CBD5E1" />
                <!-- Pull Bead (Bandul Bulat) -->
                <circle
                  class="lamp-cord-bead-halo"
                  cx="230"
                  cy="296"
                  r="15"
                />
                <circle
                  class="lamp-cord-bead"
                  cx="230"
                  cy="296"
                  r="9.5"
                />
                <circle cx="227" cy="292.5" r="2.6" fill="rgba(255,255,255,0.65)" />
              </g>

              <!-- Head Swivel Joint -->
              <circle cx="192" cy="116" r="11" fill="url(#lampMetalDark)" stroke="rgba(255,255,255,0.2)" stroke-width="1.3" />
              <circle cx="192" cy="116" r="4.2" fill="#121419" />

              <!-- Lamp Shade (Clickable when ON to cycle light color) -->
              <g
                id="lamp-shade-btn"
                class="lamp-shade-group"
                role="button"
                tabindex="0"
                aria-label="Klik kap lampu untuk mengganti warna cahaya (${escapeHtml(theme.name)})"
              >
                <!-- Glowing Halo behind Bulb when ON -->
                <circle class="lamp-bulb-halo" cx="250" cy="176" r="34" fill="url(#bulbGlowGrad)" filter="url(#bulbBlur)" />

                <!-- Shade Back Neck Cap -->
                <g transform="rotate(36 196 118)">
                  <rect x="184" y="102" width="30" height="32" rx="10" fill="url(#lampMetalDark)" stroke="rgba(255,255,255,0.16)" stroke-width="1.2" />
                  <!-- Ventilation Slots -->
                  <line x1="193" y1="110" x2="202" y2="110" stroke="rgba(255,255,255,0.2)" stroke-width="1.6" stroke-linecap="round" />
                  <line x1="193" y1="117" x2="202" y2="117" stroke="rgba(255,255,255,0.2)" stroke-width="1.6" stroke-linecap="round" />

                  <!-- Main Architect Conical Shade -->
                  <path
                    d="M210 100 C236 96 274 74 288 70 L288 166 C274 162 236 140 210 136 Z"
                    fill="url(#lampShadeBody)"
                    stroke="rgba(255,255,255,0.2)"
                    stroke-width="1.3"
                  />
                  <!-- Top Specular Highlight on Shade -->
                  <path
                    d="M218 104 C240 99 266 85 280 79"
                    stroke="rgba(255,255,255,0.24)"
                    stroke-width="2"
                    stroke-linecap="round"
                  />

                  <!-- Inner Shade Opening Ellipse -->
                  <ellipse
                    class="lamp-shade-mouth"
                    cx="288"
                    cy="118"
                    rx="14"
                    ry="48"
                  />

                  <!-- Light Bulb inside Shade -->
                  <ellipse
                    class="lamp-bulb-glass"
                    cx="278"
                    cy="118"
                    rx="15"
                    ry="17"
                  />
                  <circle class="lamp-bulb-core" cx="280" cy="118" r="7" />

                  <!-- Rim Accent Line -->
                  <ellipse
                    class="lamp-shade-rim"
                    cx="288"
                    cy="118"
                    rx="14"
                    ry="48"
                    fill="none"
                    stroke-width="2"
                  />
                </g>
              </g>
            </svg>

            <!-- Hint Badge when Lamp is OFF (next to pull cord bead) -->
            <button
              type="button"
              id="lamp-pull-hint-btn"
              class="lamp-pull-hint"
              aria-label="Tarik tali untuk menyalakan lampu"
            >
              <span class="lamp-hint-dot" aria-hidden="true"></span>
              <span>Tarik tali untuk menyalakan</span>
            </button>

            <!-- Color Theme Indicator Pill when Lamp is ON -->
            <button
              type="button"
              id="lamp-color-pill-btn"
              class="lamp-color-pill"
              title="Klik kap lampu atau tombol ini untuk mengganti warna cahaya"
              aria-label="Warna cahaya aktif: ${escapeHtml(theme.name)}. Klik untuk ganti warna."
            >
              <span class="lamp-color-swatch" aria-hidden="true"></span>
              <span id="lamp-color-name">${escapeHtml(theme.name)}</span>
              <span class="lamp-color-tip">· Klik kap ganti warna</span>
            </button>
          </div>
        </div>

        <!-- RIGHT STAGE: Glassmorphism Login Card -->
        <div class="lamp-card-col">
          <div class="login-card lamp-login-card" aria-hidden="${isOn ? 'false' : 'true'}">
            <div class="lamp-card-top-glow" aria-hidden="true"></div>

            <div class="lamp-card-head">
              <div class="lamp-studio-badge">
                <span class="lamp-badge-dot" aria-hidden="true"></span>
                <span>STUDIOFLOW • TIM KREATIF YMQ</span>
              </div>
              <h1 class="lamp-card-title">Selamat Datang</h1>
              <p class="lamp-card-subtitle">
                ${isSignIn
                  ? 'Masuk ke ruang kerja operasional konten dengan akun aktif Anda.'
                  : 'Aktivasi akun invite-only untuk anggota baru yang didaftarkan Ketua Tim.'}
              </p>
            </div>

            <div class="auth-tabs lamp-auth-tabs" role="tablist" aria-label="Pilih mode autentikasi">
              <button
                type="button"
                id="tab-signin"
                role="tab"
                class="auth-tab-btn ${isSignIn ? 'active' : ''}"
                data-auth-tab="signin"
                aria-selected="${isSignIn ? 'true' : 'false'}"
                aria-controls="panel-signin"
              >
                Sign In
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
                Aktivasi Akun
              </button>
            </div>

            ${isSignIn ? `
              <div id="panel-signin" role="tabpanel" aria-labelledby="tab-signin">
                ${authUiState.successBanner ? `
                  <div id="login-success" class="login-success-alert lamp-alert-success" role="status">
                    ✓ ${escapeHtml(authUiState.successBanner)}
                  </div>
                ` : ''}

                <div id="login-error" class="login-error-alert lamp-alert-error" role="alert" style="display:none;"></div>

                <form id="login-form" novalidate class="login-form lamp-form">
                  <div class="lamp-field">
                    <label class="form-label lamp-label" for="login-email">Email</label>
                    <input
                      id="login-email"
                      name="email"
                      type="email"
                      class="form-control lamp-input"
                      value="${escapeHtml(authUiState.prefillEmail)}"
                      placeholder="ketua@tim.com"
                      autocomplete="email"
                      required
                    />
                  </div>

                  <div class="lamp-field">
                    <label class="form-label lamp-label" for="login-password">Kata Sandi</label>
                    <div class="login-password-wrap">
                      <input
                        id="login-password"
                        name="password"
                        type="password"
                        class="form-control lamp-input"
                        placeholder="Masukkan kata sandi"
                        autocomplete="current-password"
                        required
                      />
                      <button
                        type="button"
                        id="toggle-password-vis"
                        class="login-vis-btn lamp-vis-btn"
                        aria-label="Tampilkan atau sembunyikan kata sandi"
                        aria-pressed="false"
                      >
                        Lihat
                      </button>
                    </div>
                  </div>

                  <button type="submit" class="lamp-submit-btn login-submit-btn" id="btn-login-submit">
                    Sign In ke StudioFlow →
                  </button>
                </form>

                <p class="login-helper-hint lamp-helper-hint">
                  Baru didaftarkan Ketua Tim?
                  <button type="button" class="login-inline-link lamp-inline-link" data-auth-tab="activate">
                    Aktivasi akun di sini
                  </button>
                </p>

                <!-- Quick Demo Login Section -->
                <div class="login-demo-box lamp-demo-box">
                  <div class="login-demo-head lamp-demo-head">
                    <strong>Quick Demo Login</strong>
                    <span>Klik peran untuk isi otomatis</span>
                  </div>

                  <div class="lamp-demo-grid">
                    ${demoCredentialsGuide.map(acc => `
                      <button
                        type="button"
                        class="lamp-demo-chip login-autofill-btn"
                        data-demo-email="${escapeHtml(acc.email)}"
                        data-demo-password="${escapeHtml(acc.password)}"
                        title="${escapeHtml(acc.email)} · ${escapeHtml(acc.password)}"
                      >
                        <span class="lamp-chip-role">${escapeHtml(acc.role)}</span>
                        <span class="lamp-chip-email">${escapeHtml(acc.email)}</span>
                      </button>
                    `).join('')}
                  </div>

                  <div class="login-demo-footer lamp-demo-footer">
                    <span class="login-disclaimer lamp-disclaimer">
                      Simulasi lokal <code>localStorage</code> · Bukan auth server nyata
                    </span>
                    <button type="button" id="btn-login-reset-demo" class="login-reset-link lamp-reset-link">
                      Reset dummy
                    </button>
                  </div>
                </div>
              </div>
            ` : `
              <div id="panel-activate" role="tabpanel" aria-labelledby="tab-activate">
                <div id="activate-error" class="login-error-alert lamp-alert-error" role="alert" style="display:none;"></div>

                <form id="activate-form" novalidate class="login-form lamp-form">
                  <div class="lamp-field">
                    <label class="form-label lamp-label" for="act-email">Email Terdaftar</label>
                    <input
                      id="act-email"
                      name="email"
                      type="email"
                      class="form-control lamp-input"
                      placeholder="Email yang didaftarkan Ketua Tim"
                      autocomplete="email"
                      required
                    />
                  </div>

                  <div class="lamp-field">
                    <label class="form-label lamp-label" for="act-name">Nama Lengkap</label>
                    <input
                      id="act-name"
                      name="name"
                      type="text"
                      class="form-control lamp-input"
                      placeholder="Contoh: Ahmad Fauzi"
                      autocomplete="name"
                      required
                    />
                  </div>

                  <div class="lamp-field">
                    <label class="form-label lamp-label" for="act-password">Buat Kata Sandi Baru</label>
                    <div class="login-password-wrap">
                      <input
                        id="act-password"
                        name="new-password"
                        type="password"
                        class="form-control lamp-input"
                        placeholder="Minimal 6 karakter"
                        autocomplete="new-password"
                        required
                      />
                      <button
                        type="button"
                        id="toggle-act-password-vis"
                        class="login-vis-btn lamp-vis-btn"
                        aria-label="Tampilkan atau sembunyikan kata sandi baru"
                        aria-pressed="false"
                      >
                        Lihat
                      </button>
                    </div>
                  </div>

                  <div class="auth-role-notice lamp-role-notice">
                    <span>ℹ</span>
                    <span>Role (<strong>Copywriter</strong> / <strong>Editor</strong>) otomatis mengikuti penugasan Ketua Tim.</span>
                  </div>

                  <button type="submit" class="lamp-submit-btn login-submit-btn" id="btn-activate-submit">
                    Aktivasi Akun →
                  </button>
                </form>

                <p class="login-helper-hint lamp-helper-hint">
                  Sudah punya akun aktif?
                  <button type="button" class="login-inline-link lamp-inline-link" data-auth-tab="signin">
                    Kembali ke Sign In
                  </button>
                </p>
              </div>
            `}
          </div>
        </div>
      </div>
    </div>
  `;
}

export function attachLoginEvents(onLoginSuccess, showToast, rerenderLogin) {
  const stageEl = document.querySelector('#login-lamp-stage');
  const cordEl = document.querySelector('#lamp-cord-btn');
  const shadeEl = document.querySelector('#lamp-shade-btn');
  const hintBtn = document.querySelector('#lamp-pull-hint-btn');
  const colorPillBtn = document.querySelector('#lamp-color-pill-btn');
  const cardEl = document.querySelector('.lamp-login-card');

  const applyThemeToStage = () => {
    const theme = getCurrentTheme();
    if (!stageEl) return;
    stageEl.style.setProperty('--lamp-color', theme.hex);
    stageEl.style.setProperty('--lamp-rgb', theme.rgb);
    stageEl.style.setProperty('--lamp-ink', theme.ink);
    stageEl.setAttribute('data-lamp-theme', theme.id);

    const nameEl = document.querySelector('#lamp-color-name');
    if (nameEl) nameEl.textContent = theme.name;
    shadeEl?.setAttribute('aria-label', `Klik kap lampu untuk mengganti warna cahaya (${theme.name})`);
    colorPillBtn?.setAttribute('aria-label', `Warna cahaya aktif: ${theme.name}. Klik untuk ganti warna.`);
  };

  let pullResetTimer = null;

  const triggerPullAnimationAndToggle = (fromDrag = false) => {
    authUiState.lampOn = !authUiState.lampOn;
    const isNowOn = authUiState.lampOn;

    playLampSwitchSound(isNowOn);

    if (stageEl) {
      stageEl.classList.toggle('is-lit', isNowOn);
      stageEl.classList.toggle('is-dark', !isNowOn);
      stageEl.setAttribute('data-lamp-on', String(isNowOn));
    }
    if (cardEl) {
      cardEl.setAttribute('aria-hidden', String(!isNowOn));
    }
    if (cordEl) {
      cordEl.setAttribute('aria-pressed', String(isNowOn));
      cordEl.setAttribute(
        'aria-label',
        isNowOn ? 'Tarik tali untuk mematikan lampu' : 'Tarik tali untuk menyalakan lampu'
      );

      if (!fromDrag) {
        cordEl.classList.remove('is-springing');
        cordEl.style.setProperty('--cord-pull', '28px');
        if (pullResetTimer) clearTimeout(pullResetTimer);
        pullResetTimer = setTimeout(() => {
          cordEl.classList.add('is-springing');
          cordEl.style.setProperty('--cord-pull', '0px');
        }, 115);
      }
    }

    if (isNowOn) {
      setTimeout(() => {
        if (!authUiState.lampOn) return;
        const focusTarget =
          authUiState.activeTab === 'activate'
            ? document.querySelector('#act-email')
            : authUiState.prefillEmail
              ? document.querySelector('#login-password')
              : document.querySelector('#login-email');
        focusTarget?.focus();
      }, 240);
    }
  };

  const cycleLampTheme = () => {
    if (!authUiState.lampOn) {
      triggerPullAnimationAndToggle(false);
      return;
    }
    authUiState.themeIndex = (authUiState.themeIndex + 1) % LAMP_THEMES.length;
    applyThemeToStage();
    playColorTickSound();
  };

  // Interactive Pull Cord: supports BOTH direct click AND downward pointer drag!
  if (cordEl) {
    let dragging = false;
    let startY = 0;
    let maxDelta = 0;

    cordEl.addEventListener('pointerdown', (e) => {
      dragging = true;
      startY = e.clientY;
      maxDelta = 0;
      cordEl.classList.remove('is-springing');
      try {
        cordEl.setPointerCapture(e.pointerId);
      } catch {}
    });

    cordEl.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dy = Math.max(0, Math.min(44, e.clientY - startY));
      maxDelta = Math.max(maxDelta, dy);
      cordEl.style.setProperty('--cord-pull', `${dy}px`);
    });

    const endDrag = (e) => {
      if (!dragging) return;
      dragging = false;
      try {
        cordEl.releasePointerCapture(e.pointerId);
      } catch {}

      cordEl.classList.add('is-springing');
      cordEl.style.setProperty('--cord-pull', '0px');

      if (maxDelta >= 14) {
        triggerPullAnimationAndToggle(true);
      } else {
        // Click tap without dragging
        triggerPullAnimationAndToggle(false);
      }
    };

    cordEl.addEventListener('pointerup', endDrag);
    cordEl.addEventListener('pointercancel', () => {
      if (!dragging) return;
      dragging = false;
      cordEl.classList.add('is-springing');
      cordEl.style.setProperty('--cord-pull', '0px');
    });

    cordEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        triggerPullAnimationAndToggle(false);
      }
    });
  }

  // Clicking hint badge also pulls the cord
  hintBtn?.addEventListener('click', () => {
    triggerPullAnimationAndToggle(false);
  });

  // Clicking lamp shade or color pill switches color when ON
  shadeEl?.addEventListener('click', cycleLampTheme);
  shadeEl?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      cycleLampTheme();
    }
  });
  colorPillBtn?.addEventListener('click', cycleLampTheme);

  const switchTab = (nextTab, focusSelector = null) => {
    authUiState.activeTab = nextTab;
    authUiState.lampOn = true;
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

    if (authUiState.lampOn) {
      if (authUiState.prefillEmail && passEl) {
        passEl.focus();
      } else {
        emailEl?.focus();
      }
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
      const keepTheme = authUiState.themeIndex;
      resetAuthUiState();
      authUiState.lampOn = true;
      authUiState.themeIndex = keepTheme;
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

    if (authUiState.lampOn) {
      actEmailEl?.focus();
    }

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
      authUiState.lampOn = true;
      authUiState.prefillEmail = res.user.email;
      authUiState.successBanner = `Aktivasi berhasil! Akun "${res.user.name}" aktif sebagai ${res.user.role}. Silakan Sign In.`;
      showToast(`Aktivasi sukses! ${res.user.name} aktif sebagai ${res.user.role}. Silakan masuk.`);

      if (typeof rerenderLogin === 'function') {
        rerenderLogin('#login-password');
      }
    });
  }
}
