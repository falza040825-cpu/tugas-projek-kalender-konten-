/**
 * Halaman Autentikasi Interactive Desktop Setup — StudioFlow · Tim Kreatif YMQ
 * - Panggung ruangan gelap minimalis dengan meja kerja kayu hangat di bagian bawah.
 * - Kiri: Lampu meja arsitek berlengan dua (SVG) dengan tali sakelar (klik/tarik) & 5 tema warna cahaya.
 * - Tengah-Kanan: Laptop 3D CSS yang otomatis terbuka setelah lampu dinyalakan (jeda 250ms).
 * - Layar Laptop Split-Screen 50:50: Kolom Kiri Gelap (#18191C) Form + Quick Demo Login,
 *   Kolom Kanan Terang (#FAF8F5) Panel Pesan Editorial Dinamis (Sign In vs Aktivasi Akun).
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
  laptopOpen: false,
  screenAwake: false,
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
 * Efek suara klik mekanis tali sakelar & dengung listrik ringan (Web Audio API).
 * Aman dengan fallback senyap bila browser memblokir autoplay audio.
 */
function playLampSwitchSound(turningOn) {
  try {
    const ctx = getAudioContextSafe();
    if (!ctx) return;

    const now = ctx.currentTime;

    // 1. Klik sakelar mekanis
    const bufferSize = Math.floor(ctx.sampleRate * 0.024);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i += 1) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.26));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(turningOn ? 2500 : 1600, now);
    filter.Q.setValueAtTime(1.8, now);

    const clickGain = ctx.createGain();
    clickGain.gain.setValueAtTime(0.24, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.023);

    noise.connect(filter);
    filter.connect(clickGain);
    clickGain.connect(ctx.destination);
    noise.start(now);

    // 2. Ketukan pegas logam pendek
    const snapOsc = ctx.createOscillator();
    const snapGain = ctx.createGain();
    snapOsc.type = 'triangle';
    snapOsc.frequency.setValueAtTime(turningOn ? 640 : 410, now);
    snapOsc.frequency.exponentialRampToValueAtTime(turningOn ? 220 : 120, now + 0.032);

    snapGain.gain.setValueAtTime(0.11, now);
    snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.034);

    snapOsc.connect(snapGain);
    snapGain.connect(ctx.destination);
    snapOsc.start(now);
    snapOsc.stop(now + 0.036);

    // 3. Dengung listrik hangat ringan saat lampu menyala
    if (turningOn) {
      const humOsc = ctx.createOscillator();
      const humHarmonic = ctx.createOscillator();
      const humGain = ctx.createGain();

      humOsc.type = 'sine';
      humOsc.frequency.setValueAtTime(60, now + 0.015);
      humHarmonic.type = 'triangle';
      humHarmonic.frequency.setValueAtTime(120, now + 0.015);

      humGain.gain.setValueAtTime(0.0001, now + 0.015);
      humGain.gain.linearRampToValueAtTime(0.026, now + 0.08);
      humGain.gain.exponentialRampToValueAtTime(0.0008, now + 0.45);

      humOsc.connect(humGain);
      humHarmonic.connect(humGain);
      humGain.connect(ctx.destination);

      humOsc.start(now + 0.015);
      humHarmonic.start(now + 0.015);
      humOsc.stop(now + 0.48);
      humHarmonic.stop(now + 0.48);
    }
  } catch {
    // Fallback aman bila audio tidak didukung / diblokir
  }
}

function playColorTickSound() {
  try {
    const ctx = getAudioContextSafe();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(860, now + 0.055);

    gain.gain.setValueAtTime(0.055, now);
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
    laptopOpen: false,
    screenAwake: false,
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
  const isOpen = authUiState.laptopOpen;
  const isAwake = authUiState.screenAwake;

  const editorialTitle = isSignIn
    ? 'Selamat Bekerja!'
    : 'Salam Kenal & Selamat Bergabung!';
  const editorialSub = isSignIn
    ? 'Mari buat karya terbaik hari ini bersama tim. Setiap ide dan naskahmu membawa manfaat.'
    : 'Senang menyambutmu di ruang kerja kreatif StudioFlow. Aktifkan akunmu dan mari berkolaborasi!';
  const editorialEyebrow = isSignIn
    ? 'MASUK KERJA · RUANG STUDIO'
    : 'ANGGOTA BARU · INVITE-ONLY';

  return `
    <div
      id="login-lamp-stage"
      class="desk-login-stage ${isOn ? 'is-lit' : 'is-dark'} ${isOpen ? 'is-laptop-open' : ''} ${isAwake ? 'is-screen-awake' : ''}"
      style="--lamp-color: ${theme.hex}; --lamp-rgb: ${theme.rgb}; --lamp-ink: ${theme.ink};"
      data-lamp-on="${isOn ? 'true' : 'false'}"
      data-laptop-open="${isOpen ? 'true' : 'false'}"
      data-lamp-theme="${escapeHtml(theme.id)}"
    >
      <!-- Ambient Room Wash when Lamp is ON -->
      <div class="desk-room-glow" aria-hidden="true"></div>

      <!-- Main Scene sitting directly on top of the Wooden Desk -->
      <div class="desk-scene">
        <!-- LEFT: Architect Dual-Arm Desk Lamp -->
        <div class="desk-lamp-slot">
          <div class="lamp-assembly">
            <!-- Diagonal Volumetric Spotlight Cone aimed at the Laptop -->
            <div class="lamp-spotlight-cone" aria-hidden="true"></div>
            <div class="lamp-spotlight-core" aria-hidden="true"></div>

            <svg
              class="desk-lamp-svg"
              viewBox="0 0 340 430"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="Lampu meja arsitek interaktif"
            >
              <defs>
                <linearGradient id="lampMetalDark" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#424754" />
                  <stop offset="50%" stop-color="#252932" />
                  <stop offset="100%" stop-color="#14161B" />
                </linearGradient>
                <linearGradient id="lampMetalRod" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stop-color="#52596B" />
                  <stop offset="50%" stop-color="#2D323E" />
                  <stop offset="100%" stop-color="#191C23" />
                </linearGradient>
                <linearGradient id="lampShadeBody" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#444A59" />
                  <stop offset="45%" stop-color="#272B35" />
                  <stop offset="100%" stop-color="#14161B" />
                </linearGradient>
                <linearGradient id="lampBaseTop" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#3C414E" />
                  <stop offset="100%" stop-color="#17191F" />
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

              <!-- Grounded Contact Shadow on Wooden Desk -->
              <ellipse cx="112" cy="402" rx="88" ry="11" fill="rgba(0,0,0,0.68)" />

              <!-- Weighted Metallic Base -->
              <path
                d="M46 392 C46 381 68 375 112 375 C156 375 178 381 178 392 L180 398 C180 403 150 406 112 406 C74 406 44 403 44 398 Z"
                fill="url(#lampBaseTop)"
                stroke="rgba(255,255,255,0.14)"
                stroke-width="1"
              />
              <!-- Base Collar Stem -->
              <rect x="99" y="354" width="26" height="24" rx="6" fill="url(#lampMetalDark)" stroke="rgba(255,255,255,0.14)" stroke-width="1" />
              <circle cx="112" cy="362" r="5" fill="#111318" stroke="rgba(255,255,255,0.22)" stroke-width="1.2" />

              <!-- Lower Articulated Dual Arm -->
              <line x1="106" y1="360" x2="58" y2="226" stroke="url(#lampMetalRod)" stroke-width="7" stroke-linecap="round" />
              <line x1="118" y1="356" x2="70" y2="222" stroke="url(#lampMetalRod)" stroke-width="4.5" stroke-linecap="round" />
              <line x1="95" y1="326" x2="71" y2="260" stroke="rgba(255,255,255,0.22)" stroke-width="2" stroke-dasharray="3 3" />

              <!-- Upper Articulated Dual Arm -->
              <line x1="62" y1="222" x2="180" y2="112" stroke="url(#lampMetalRod)" stroke-width="7" stroke-linecap="round" />
              <line x1="70" y1="230" x2="188" y2="120" stroke="url(#lampMetalRod)" stroke-width="4.5" stroke-linecap="round" />
              <line x1="100" y1="194" x2="146" y2="150" stroke="rgba(255,255,255,0.22)" stroke-width="2" stroke-dasharray="3 3" />

              <!-- Elbow Joint -->
              <circle cx="64" cy="225" r="13" fill="url(#lampMetalDark)" stroke="rgba(255,255,255,0.18)" stroke-width="1.4" />
              <circle cx="64" cy="225" r="5" fill="#14161B" stroke="rgba(255,255,255,0.28)" stroke-width="1.2" />

              <!-- Interactive Pull Cord (Click & Drag) -->
              <g
                id="lamp-cord-btn"
                class="lamp-cord-group"
                role="button"
                tabindex="0"
                aria-pressed="${isOn ? 'true' : 'false'}"
                aria-label="${isOn ? 'Tarik tali untuk mematikan lampu dan menutup laptop' : 'Tarik tali untuk menyalakan lampu dan membuka laptop'}"
              >
                <rect x="196" y="158" width="52" height="162" fill="transparent" />
                <line
                  class="lamp-cord-line"
                  x1="222"
                  y1="158"
                  x2="222"
                  y2="290"
                  stroke="#A1A8B6"
                  stroke-width="2.2"
                  stroke-linecap="round"
                />
                <circle cx="222" cy="286" r="3" fill="#E2E8F0" />
                <circle class="lamp-cord-bead-halo" cx="222" cy="298" r="15" />
                <circle class="lamp-cord-bead" cx="222" cy="298" r="9.5" />
                <circle cx="219" cy="294.5" r="2.6" fill="rgba(255,255,255,0.7)" />
              </g>

              <!-- Head Swivel Joint -->
              <circle cx="184" cy="116" r="11" fill="url(#lampMetalDark)" stroke="rgba(255,255,255,0.22)" stroke-width="1.3" />
              <circle cx="184" cy="116" r="4.2" fill="#121419" />

              <!-- Lamp Shade (Clickable when ON to cycle color) -->
              <g
                id="lamp-shade-btn"
                class="lamp-shade-group"
                role="button"
                tabindex="0"
                aria-label="Klik kap lampu untuk mengganti warna cahaya (${escapeHtml(theme.name)})"
              >
                <circle class="lamp-bulb-halo" cx="242" cy="174" r="34" fill="url(#bulbGlowGrad)" filter="url(#bulbBlur)" />
                <g transform="rotate(34 188 118)">
                  <rect x="176" y="102" width="30" height="32" rx="10" fill="url(#lampMetalDark)" stroke="rgba(255,255,255,0.16)" stroke-width="1.2" />
                  <line x1="185" y1="110" x2="194" y2="110" stroke="rgba(255,255,255,0.22)" stroke-width="1.6" stroke-linecap="round" />
                  <line x1="185" y1="117" x2="194" y2="117" stroke="rgba(255,255,255,0.22)" stroke-width="1.6" stroke-linecap="round" />

                  <path
                    d="M202 100 C228 96 266 74 280 70 L280 166 C266 162 228 140 202 136 Z"
                    fill="url(#lampShadeBody)"
                    stroke="rgba(255,255,255,0.2)"
                    stroke-width="1.3"
                  />
                  <path
                    d="M210 104 C232 99 258 85 272 79"
                    stroke="rgba(255,255,255,0.26)"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                  <ellipse class="lamp-shade-mouth" cx="280" cy="118" rx="14" ry="48" />
                  <ellipse class="lamp-bulb-glass" cx="270" cy="118" rx="15" ry="17" />
                  <circle class="lamp-bulb-core" cx="272" cy="118" r="7" />
                  <ellipse class="lamp-shade-rim" cx="280" cy="118" rx="14" ry="48" fill="none" stroke-width="2" />
                </g>
              </g>
            </svg>

            <!-- Hint Badge next to Pull Bead when OFF -->
            <button
              type="button"
              id="lamp-pull-hint-btn"
              class="lamp-pull-hint"
              aria-label="Tarik tali untuk menyalakan lampu"
            >
              <span class="lamp-hint-dot" aria-hidden="true"></span>
              <span>Tarik tali untuk menyalakan</span>
            </button>

            <!-- Active Color Indicator Pill when ON -->
            <button
              type="button"
              id="lamp-color-pill-btn"
              class="lamp-color-pill"
              title="Klik kap lampu atau tombol ini untuk mengganti warna cahaya"
              aria-label="Warna cahaya aktif: ${escapeHtml(theme.name)}. Klik untuk ganti warna."
            >
              <span class="lamp-color-swatch" aria-hidden="true"></span>
              <span id="lamp-color-name">${escapeHtml(theme.name)}</span>
              <span class="lamp-color-tip">· Klik kap</span>
            </button>
          </div>
        </div>

        <!-- CENTER-RIGHT: 3D Opening CSS Laptop -->
        <div class="desk-laptop-slot">
          <div class="laptop-3d-stage">
            <!-- Soft Display Ambient Glow behind Screen when Awake -->
            <div class="laptop-screen-aura" aria-hidden="true"></div>

            <!-- 3D Rotating Laptop Lid -->
            <div class="laptop-lid-pivot" aria-hidden="${isAwake ? 'false' : 'true'}">
              <!-- Outer Closed Lid Shell (visible when rotated shut) -->
              <div class="laptop-lid-back" aria-hidden="true">
                <div class="laptop-lid-emblem">SF</div>
              </div>

              <!-- Inner Bezel & Glowing Split-Screen Display -->
              <div class="laptop-lid-front">
                <div class="laptop-webcam-bar" aria-hidden="true">
                  <span class="laptop-webcam-dot"></span>
                </div>

                <div class="laptop-screen-viewport">
                  <div class="laptop-screen-power" id="laptop-screen-content">
                    <!-- 50% LEFT COLUMN: Dark Form Area (#18191C) -->
                    <div class="laptop-col-form">
                      <div class="sf-brand-row">
                        <div class="sf-logo-box" aria-hidden="true">SF</div>
                        <div class="sf-brand-text">
                          <strong>StudioFlow</strong>
                          <small>TIM KREATIF YMQ</small>
                        </div>
                      </div>

                      <div class="auth-tabs laptop-auth-tabs" role="tablist" aria-label="Pilih mode autentikasi">
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
                        <div id="panel-signin" class="laptop-panel-fade" role="tabpanel" aria-labelledby="tab-signin">
                          ${authUiState.successBanner ? `
                            <div id="login-success" class="login-success-alert lamp-alert-success" role="status">
                              ✓ ${escapeHtml(authUiState.successBanner)}
                            </div>
                          ` : ''}

                          <div id="login-error" class="login-error-alert lamp-alert-error" role="alert" style="display:none;"></div>

                          <form id="login-form" novalidate class="login-form laptop-form">
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

                          <!-- Quick Demo Login -->
                          <div class="laptop-demo-box">
                            <div class="laptop-demo-head">
                              <strong>Quick Demo Login</strong>
                              <button type="button" id="btn-login-reset-demo" class="lamp-reset-link">
                                Reset dummy
                              </button>
                            </div>
                            <div class="laptop-demo-grid">
                              ${demoCredentialsGuide.map(acc => `
                                <button
                                  type="button"
                                  class="laptop-demo-chip login-autofill-btn"
                                  data-demo-email="${escapeHtml(acc.email)}"
                                  data-demo-password="${escapeHtml(acc.password)}"
                                  title="${escapeHtml(acc.email)} · ${escapeHtml(acc.password)}"
                                >
                                  <span>${escapeHtml(acc.role)}</span>
                                </button>
                              `).join('')}
                            </div>
                          </div>
                        </div>
                      ` : `
                        <div id="panel-activate" class="laptop-panel-fade" role="tabpanel" aria-labelledby="tab-activate">
                          <div id="activate-error" class="login-error-alert lamp-alert-error" role="alert" style="display:none;"></div>

                          <form id="activate-form" novalidate class="login-form laptop-form">
                            <div class="lamp-field">
                              <label class="form-label lamp-label" for="act-email">Email Terdaftar</label>
                              <input
                                id="act-email"
                                name="email"
                                type="email"
                                class="form-control lamp-input"
                                placeholder="Email didaftarkan Ketua Tim"
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

                            <button type="submit" class="lamp-submit-btn login-submit-btn" id="btn-activate-submit">
                              Aktivasi Akun →
                            </button>
                          </form>

                          <p class="laptop-switch-hint">
                            Sudah punya akun aktif?
                            <button type="button" class="lamp-inline-link" data-auth-tab="signin">Kembali ke Sign In</button>
                          </p>
                        </div>
                      `}
                    </div>

                    <!-- 50% RIGHT COLUMN: Warm Editorial Light Panel (#FAF8F5) -->
                    <div class="laptop-col-editorial" data-editorial-mode="${isSignIn ? 'signin' : 'activate'}">
                      <div class="editorial-accent-bar" aria-hidden="true"></div>
                      <div class="editorial-content editorial-fade-slide">
                        <span class="editorial-eyebrow">${editorialEyebrow}</span>
                        <h1 class="editorial-heading">${editorialTitle}</h1>
                        <p class="editorial-subtext">${editorialSub}</p>

                        <div class="editorial-divider" aria-hidden="true"></div>

                        ${isSignIn ? `
                          <div class="editorial-footer-meta">
                            <span class="editorial-meta-label">Alur Terpadu Tim Kreatif</span>
                            <div class="editorial-role-tags">
                              <span>Ketua Tim</span>
                              <span>→</span>
                              <span>Copywriter</span>
                              <span>→</span>
                              <span>Editor</span>
                            </div>
                          </div>
                        ` : `
                          <div class="editorial-footer-meta">
                            <span class="editorial-meta-label">Akses Invite-Only</span>
                            <p class="editorial-meta-note">
                              Role tugas (<strong>Copywriter</strong> / <strong>Editor</strong>) otomatis terhubung dari undangan Ketua Tim.
                            </p>
                          </div>
                        `}
                      </div>
                      <div class="editorial-footnote">
                        Simulasi lokal <code>state/localStorage</code> · Yayasan Motivator Qur'an
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Metallic Silver / Space-Gray Laptop Base Deck & Keyboard -->
            <div class="laptop-base-chassis" aria-hidden="true">
              <div class="laptop-base-deck">
                <div class="laptop-hinge-bar"></div>
                <div class="laptop-keyboard-well">
                  <span></span><span></span><span></span><span></span><span></span><span></span>
                  <span></span><span></span><span></span><span></span><span></span><span></span>
                </div>
                <div class="laptop-trackpad"></div>
              </div>
              <div class="laptop-base-front">
                <div class="laptop-thumb-notch"></div>
              </div>
              <div class="laptop-desk-shadow"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Warm Wooden Desk Surface at Bottom -->
      <div class="wooden-desk-surface" aria-hidden="true">
        <div class="wooden-desk-light-pool"></div>
        <div class="wooden-desk-edge"></div>
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
  const lidEl = document.querySelector('.laptop-lid-pivot');

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
  let laptopOpenTimer = null;
  let screenAwakeTimer = null;

  const clearSequenceTimers = () => {
    if (laptopOpenTimer) clearTimeout(laptopOpenTimer);
    if (screenAwakeTimer) clearTimeout(screenAwakeTimer);
    laptopOpenTimer = null;
    screenAwakeTimer = null;
  };

  const triggerPullAnimationAndToggle = (fromDrag = false) => {
    clearSequenceTimers();

    authUiState.lampOn = !authUiState.lampOn;
    const isNowOn = authUiState.lampOn;

    playLampSwitchSound(isNowOn);

    if (stageEl) {
      stageEl.classList.toggle('is-lit', isNowOn);
      stageEl.classList.toggle('is-dark', !isNowOn);
      stageEl.setAttribute('data-lamp-on', String(isNowOn));
    }

    if (cordEl) {
      cordEl.setAttribute('aria-pressed', String(isNowOn));
      cordEl.setAttribute(
        'aria-label',
        isNowOn
          ? 'Tarik tali untuk mematikan lampu dan menutup laptop'
          : 'Tarik tali untuk menyalakan lampu dan membuka laptop'
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
      // Langkah 2: Setelah jeda 250ms sejak lampu menyala, buka tutup layar laptop secara 3D
      laptopOpenTimer = setTimeout(() => {
        if (!authUiState.lampOn) return;
        authUiState.laptopOpen = true;
        stageEl?.classList.add('is-laptop-open');
        stageEl?.setAttribute('data-laptop-open', 'true');
      }, 250);

      // Langkah 3: Nyalakan cahaya & isi layar laptop saat tutup mulai terbuka penuh
      screenAwakeTimer = setTimeout(() => {
        if (!authUiState.lampOn) return;
        authUiState.screenAwake = true;
        stageEl?.classList.add('is-screen-awake');
        lidEl?.setAttribute('aria-hidden', 'false');

        const focusTarget =
          authUiState.activeTab === 'activate'
            ? document.querySelector('#act-email')
            : authUiState.prefillEmail
              ? document.querySelector('#login-password')
              : document.querySelector('#login-email');
        focusTarget?.focus();
      }, 620);
    } else {
      // Saat lampu dimatikan: layar meredup lalu tutup laptop menutup kembali
      authUiState.screenAwake = false;
      authUiState.laptopOpen = false;
      stageEl?.classList.remove('is-screen-awake');
      stageEl?.classList.remove('is-laptop-open');
      stageEl?.setAttribute('data-laptop-open', 'false');
      lidEl?.setAttribute('aria-hidden', 'true');
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

  // Interactive Pull Cord: supports BOTH direct click AND downward pointer drag
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

  hintBtn?.addEventListener('click', () => {
    triggerPullAnimationAndToggle(false);
  });

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
    authUiState.laptopOpen = true;
    authUiState.screenAwake = true;
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

    if (authUiState.screenAwake) {
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
      authUiState.laptopOpen = true;
      authUiState.screenAwake = true;
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

    if (authUiState.screenAwake) {
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
      authUiState.laptopOpen = true;
      authUiState.screenAwake = true;
      authUiState.prefillEmail = res.user.email;
      authUiState.successBanner = `Aktivasi berhasil! Akun "${res.user.name}" aktif sebagai ${res.user.role}. Silakan Sign In.`;
      showToast(`Aktivasi sukses! ${res.user.name} aktif sebagai ${res.user.role}. Silakan masuk.`);

      if (typeof rerenderLogin === 'function') {
        rerenderLogin('#login-password');
      }
    });
  }
}
