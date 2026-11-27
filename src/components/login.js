/**
 * Halaman Autentikasi Interactive Desktop Setup — StudioFlow · Tim Kreatif YMQ
 * - Ruangan gelap minimalis dengan meja kerja kayu hangat di bagian bawah.
 * - Kiri: Lampu meja arsitek (SVG) dengan tali sakelar (klik/tarik) & 5 warna cahaya dinamis.
 * - Tengah-Kanan: Laptop 3D CSS yang otomatis terbuka setelah lampu dinyalakan (jeda 250ms).
 * - Layar Laptop Sliding Overlay Split-Screen (50:50):
 *   * Bawah Kiri (50%): Form Sign In + Quick Demo Login (Ketua Tim, Copywriter, Editor).
 *   * Bawah Kanan (50%): Form Aktivasi Akun (Invite-Only oleh Ketua Tim).
 *   * Atas (z-index: 10): Panel Overlay Geser gelap elegan (#18191C) dengan efek parallax slide.
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
  screenFocused: false,
  themeIndex: 0,
};

let activeKeydownCleanup = null;
let cinematicTimers = [];

export function cleanupCinematicOverlay() {
  cinematicTimers.forEach(id => clearTimeout(id));
  cinematicTimers = [];
  if (typeof document !== 'undefined') {
    document.querySelector('#cinematic-logo-overlay')?.remove();
  }
}

export function resetAuthUiState(keepOverlay = false) {
  if (typeof activeKeydownCleanup === 'function') {
    activeKeydownCleanup();
    activeKeydownCleanup = null;
  }
  if (!keepOverlay) {
    cleanupCinematicOverlay();
  }
  authUiState = {
    activeTab: 'signin',
    prefillEmail: '',
    successBanner: '',
    lampOn: false,
    laptopOpen: false,
    screenAwake: false,
    screenFocused: false,
    themeIndex: 0,
  };
}

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
    // Fallback senyap
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

function getCurrentTheme() {
  return LAMP_THEMES[authUiState.themeIndex % LAMP_THEMES.length] || LAMP_THEMES[0];
}

export function renderLogin(tabOverride = null) {
  if (tabOverride === 'signin' || tabOverride === 'activate') {
    authUiState.activeTab = tabOverride;
  }
  const isActivate = authUiState.activeTab === 'activate';
  const theme = getCurrentTheme();
  const isOn = authUiState.lampOn;
  const isOpen = authUiState.laptopOpen;
  const isAwake = authUiState.screenAwake;
  const isFocused = authUiState.screenFocused;

  return `
    <div
      id="login-lamp-stage"
      class="desk-login-stage ${isOn ? 'is-lit' : 'is-dark'} ${isOpen ? 'is-laptop-open' : ''} ${isAwake ? 'is-screen-awake' : ''} ${isFocused ? 'is-screen-focused' : ''}"
      style="--lamp-color: ${theme.hex}; --lamp-rgb: ${theme.rgb}; --lamp-ink: ${theme.ink}; --lamp-glow: rgba(${theme.rgb}, 0.36);"
      data-lamp-on="${isOn ? 'true' : 'false'}"
      data-laptop-open="${isOpen ? 'true' : 'false'}"
      data-screen-focused="${isFocused ? 'true' : 'false'}"
      data-lamp-theme="${escapeHtml(theme.id)}"
    >
      <!-- Ambient Room Wash when Lamp is ON -->
      <div class="desk-room-glow" aria-hidden="true"></div>

      <!-- Ambient Blur Backdrop behind Popped-Out Screen in Focus Mode (z-index: 40) -->
      <div id="screen-focus-backdrop" class="screen-focus-backdrop" aria-hidden="true"></div>

      <!-- Main Scene sitting directly on top of the Wooden Desk -->
      <div class="desk-scene">
        <!-- LEFT: Tall Architect Dual-Arm Desk Lamp (Overhead Front Lighting) -->
        <div class="desk-lamp-slot">
          <div class="lamp-assembly">
            <!-- Diagonal Volumetric Overhead Spotlight Cone aimed at Front Screen, Keyboard & Desk -->
            <div class="lamp-spotlight-cone" aria-hidden="true"></div>
            <div class="lamp-spotlight-core" aria-hidden="true"></div>

            <svg
              class="desk-lamp-svg"
              viewBox="0 0 340 620"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="Lampu meja arsitek interaktif"
            >
              <defs>
                <linearGradient id="lampMetalDark" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#484E5D" />
                  <stop offset="50%" stop-color="#272B35" />
                  <stop offset="100%" stop-color="#14161B" />
                </linearGradient>
                <linearGradient id="lampMetalRod" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stop-color="#5A6275" />
                  <stop offset="50%" stop-color="#2F3542" />
                  <stop offset="100%" stop-color="#1A1D24" />
                </linearGradient>
                <linearGradient id="lampShadeBody" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#4A5161" />
                  <stop offset="45%" stop-color="#292E38" />
                  <stop offset="100%" stop-color="#14161B" />
                </linearGradient>
                <linearGradient id="lampBaseTop" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#424856" />
                  <stop offset="100%" stop-color="#17191F" />
                </linearGradient>
                <radialGradient id="bulbGlowGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.98" />
                  <stop offset="45%" stop-color="var(--lamp-color)" stop-opacity="0.92" />
                  <stop offset="100%" stop-color="var(--lamp-color)" stop-opacity="0" />
                </radialGradient>
                <filter id="bulbBlur" x="-60%" y="-60%" width="220%" height="220%">
                  <feGaussianBlur stdDeviation="11" />
                </filter>
              </defs>

              <!-- Grounded Contact Shadow on Wooden Desk -->
              <ellipse cx="106" cy="596" rx="88" ry="11" fill="rgba(0,0,0,0.72)" />

              <!-- Weighted Metallic Base -->
              <path
                d="M40 584 C40 573 62 567 106 567 C150 567 172 573 172 584 L174 592 C174 597 144 600 106 600 C68 600 38 597 38 592 Z"
                fill="url(#lampBaseTop)"
                stroke="rgba(255,255,255,0.16)"
                stroke-width="1"
              />
              <!-- Base Collar Stem -->
              <rect x="93" y="544" width="26" height="26" rx="6" fill="url(#lampMetalDark)" stroke="rgba(255,255,255,0.16)" stroke-width="1" />
              <circle cx="106" cy="554" r="5" fill="#111318" stroke="rgba(255,255,255,0.24)" stroke-width="1.2" />

              <!-- Lower Articulated Dual Arm (Tall Architect Reach) -->
              <line x1="100" y1="550" x2="40" y2="338" stroke="url(#lampMetalRod)" stroke-width="7.5" stroke-linecap="round" />
              <line x1="112" y1="546" x2="52" y2="334" stroke="url(#lampMetalRod)" stroke-width="4.5" stroke-linecap="round" />
              <line x1="88" y1="504" x2="57" y2="394" stroke="rgba(255,255,255,0.22)" stroke-width="2" stroke-dasharray="3 3" />

              <!-- Upper Articulated Dual Arm (Reaching Above Open Laptop Top) -->
              <line x1="44" y1="334" x2="188" y2="66" stroke="url(#lampMetalRod)" stroke-width="7.5" stroke-linecap="round" />
              <line x1="53" y1="342" x2="197" y2="74" stroke="url(#lampMetalRod)" stroke-width="4.5" stroke-linecap="round" />
              <line x1="88" y1="276" x2="152" y2="154" stroke="rgba(255,255,255,0.22)" stroke-width="2" stroke-dasharray="3 3" />

              <!-- Elbow Joint -->
              <circle cx="46" cy="338" r="13.5" fill="url(#lampMetalDark)" stroke="rgba(255,255,255,0.2)" stroke-width="1.4" />
              <circle cx="46" cy="338" r="5.2" fill="#14161B" stroke="rgba(255,255,255,0.3)" stroke-width="1.2" />

              <!-- Interactive Pull Cord (Click & Drag, hanging comfortably beside the laptop) -->
              <g
                id="lamp-cord-btn"
                class="lamp-cord-group"
                role="button"
                tabindex="0"
                aria-pressed="${isOn ? 'true' : 'false'}"
                aria-label="${isOn ? 'Tarik tali untuk mematikan lampu dan menutup laptop' : 'Tarik tali untuk menyalakan lampu dan membuka laptop'}"
              >
                <rect x="196" y="114" width="54" height="270" fill="transparent" />
                <line
                  class="lamp-cord-line"
                  x1="222"
                  y1="118"
                  x2="222"
                  y2="348"
                  stroke="#A1A8B6"
                  stroke-width="2.2"
                  stroke-linecap="round"
                />
                <circle cx="222" cy="343" r="3" fill="#E2E8F0" />
                <circle class="lamp-cord-bead-halo" cx="222" cy="356" r="16" />
                <circle class="lamp-cord-bead" cx="222" cy="356" r="10" />
                <circle cx="218.5" cy="352" r="2.8" fill="rgba(255,255,255,0.72)" />
              </g>

              <!-- Head Swivel Joint -->
              <circle cx="192" cy="70" r="11.5" fill="url(#lampMetalDark)" stroke="rgba(255,255,255,0.24)" stroke-width="1.3" />
              <circle cx="192" cy="70" r="4.5" fill="#121419" />

              <!-- Overhead Lamp Shade Angled Down-Right onto Front of Laptop & Desk -->
              <g
                id="lamp-shade-btn"
                class="lamp-shade-group"
                role="button"
                tabindex="0"
                aria-label="Klik kap lampu untuk mengganti warna cahaya (${escapeHtml(theme.name)})"
              >
                <circle class="lamp-bulb-halo" cx="262" cy="130" r="38" fill="url(#bulbGlowGrad)" filter="url(#bulbBlur)" />
                <g transform="rotate(42 196 70)">
                  <rect x="184" y="54" width="30" height="32" rx="10" fill="url(#lampMetalDark)" stroke="rgba(255,255,255,0.18)" stroke-width="1.2" />
                  <line x1="193" y1="62" x2="202" y2="62" stroke="rgba(255,255,255,0.24)" stroke-width="1.6" stroke-linecap="round" />
                  <line x1="193" y1="69" x2="202" y2="69" stroke="rgba(255,255,255,0.24)" stroke-width="1.6" stroke-linecap="round" />

                  <path
                    d="M210 52 C236 48 274 26 288 22 L288 118 C274 114 236 92 210 88 Z"
                    fill="url(#lampShadeBody)"
                    stroke="rgba(255,255,255,0.22)"
                    stroke-width="1.3"
                  />
                  <path
                    d="M218 56 C240 51 266 37 280 31"
                    stroke="rgba(255,255,255,0.28)"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                  <ellipse class="lamp-shade-mouth" cx="288" cy="70" rx="14" ry="48" />
                  <ellipse class="lamp-bulb-glass" cx="278" cy="70" rx="15" ry="17" />
                  <circle class="lamp-bulb-core" cx="280" cy="70" r="7" />
                  <ellipse class="lamp-shade-rim" cx="288" cy="70" rx="14" ry="48" fill="none" stroke-width="2" />
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

        <!-- CENTER-RIGHT: 3D Opening CSS Laptop with Sliding Overlay Split-Screen -->
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

              <!-- Inner Bezel & Sliding Split-Screen Display -->
              <div class="laptop-lid-front">
                <div class="laptop-webcam-bar" aria-hidden="true">
                  <span class="laptop-webcam-dot"></span>
                </div>

                <div class="laptop-screen-viewport">
                  <div
                    id="laptop-sliding-container"
                    class="laptop-screen-power laptop-sliding-container ${isActivate ? 'is-activate-mode' : ''}"
                    data-auth-mode="${isActivate ? 'activate' : 'signin'}"
                  >
                    <!-- BOTTOM LAYER — LEFT 50%: Form Sign In -->
                    <section
                      id="panel-signin"
                      class="sliding-form-pane sliding-pane-signin"
                      aria-label="Form Sign In"
                      aria-hidden="${isActivate ? 'true' : 'false'}"
                    >
                      <div class="slide-brand-head">
                        <div class="sf-logo-box" aria-hidden="true">SF</div>
                        <div>
                          <span class="slide-brand-eyebrow">STUDIOFLOW · TIM KREATIF YMQ</span>
                          <h2 class="slide-form-title">Sign In</h2>
                        </div>
                      </div>

                      <div
                        id="login-success"
                        class="slide-alert-success"
                        role="status"
                        style="display:${authUiState.successBanner ? 'block' : 'none'};"
                      >
                        ${authUiState.successBanner ? `✓ ${escapeHtml(authUiState.successBanner)}` : ''}
                      </div>

                      <div id="login-error" class="slide-alert-error" role="alert" style="display:none;"></div>

                      <form id="login-form" novalidate class="slide-form">
                        <div class="slide-field">
                          <label class="slide-label" for="login-email">Email</label>
                          <input
                            id="login-email"
                            name="email"
                            type="email"
                            class="slide-input"
                            value="${escapeHtml(authUiState.prefillEmail)}"
                            placeholder="ketua@tim.com"
                            autocomplete="email"
                            required
                          />
                        </div>

                        <div class="slide-field">
                          <label class="slide-label" for="login-password">Kata Sandi</label>
                          <div class="login-password-wrap">
                            <input
                              id="login-password"
                              name="password"
                              type="password"
                              class="slide-input"
                              placeholder="Masukkan kata sandi"
                              autocomplete="current-password"
                              required
                            />
                            <button
                              type="button"
                              id="toggle-password-vis"
                              class="slide-vis-btn"
                              aria-label="Tampilkan atau sembunyikan kata sandi"
                              aria-pressed="false"
                            >
                              Lihat
                            </button>
                          </div>
                        </div>

                        <button type="submit" class="slide-submit-btn" id="btn-login-submit">
                          Masuk ke Ruang Kerja →
                        </button>
                      </form>

                      <!-- Quick Demo Login -->
                      <div class="slide-demo-box">
                        <div class="slide-demo-head">
                          <strong>Quick Demo Login</strong>
                          <button type="button" id="btn-login-reset-demo" class="slide-reset-link">
                            Reset dummy
                          </button>
                        </div>
                        <div class="slide-demo-grid">
                          ${demoCredentialsGuide.map(acc => `
                            <button
                              type="button"
                              class="slide-demo-chip login-autofill-btn"
                              data-demo-email="${escapeHtml(acc.email)}"
                              data-demo-password="${escapeHtml(acc.password)}"
                              title="${escapeHtml(acc.email)} · ${escapeHtml(acc.password)}"
                            >
                              ${escapeHtml(acc.role)}
                            </button>
                          `).join('')}
                        </div>
                      </div>

                      <button type="button" class="slide-mobile-switch" data-auth-tab="activate">
                        Belum aktif? <span>Aktivasi Akun Baru →</span>
                      </button>
                    </section>

                    <!-- BOTTOM LAYER — RIGHT 50%: Form Aktivasi Akun (Invite-Only) -->
                    <section
                      id="panel-activate"
                      class="sliding-form-pane sliding-pane-activate"
                      aria-label="Form Aktivasi Akun"
                      aria-hidden="${isActivate ? 'false' : 'true'}"
                    >
                      <div class="slide-brand-head">
                        <div class="sf-logo-box" aria-hidden="true">SF</div>
                        <div>
                          <span class="slide-brand-eyebrow">INVITE-ONLY · ANGGOTA BARU</span>
                          <h2 class="slide-form-title">Aktivasi Akun</h2>
                        </div>
                      </div>

                      <div id="activate-error" class="slide-alert-error" role="alert" style="display:none;"></div>

                      <form id="activate-form" novalidate class="slide-form">
                        <div class="slide-field">
                          <label class="slide-label" for="act-name">Nama Lengkap</label>
                          <input
                            id="act-name"
                            name="name"
                            type="text"
                            class="slide-input"
                            placeholder="Contoh: Ahmad Fauzi"
                            autocomplete="name"
                            required
                          />
                        </div>

                        <div class="slide-field">
                          <label class="slide-label" for="act-email">Email Terdaftar</label>
                          <input
                            id="act-email"
                            name="email"
                            type="email"
                            class="slide-input"
                            placeholder="Email didaftarkan Ketua Tim"
                            autocomplete="email"
                            required
                          />
                        </div>

                        <div class="slide-field">
                          <label class="slide-label" for="act-password">Buat Kata Sandi Baru</label>
                          <div class="login-password-wrap">
                            <input
                              id="act-password"
                              name="new-password"
                              type="password"
                              class="slide-input"
                              placeholder="Minimal 6 karakter"
                              autocomplete="new-password"
                              required
                            />
                            <button
                              type="button"
                              id="toggle-act-password-vis"
                              class="slide-vis-btn"
                              aria-label="Tampilkan atau sembunyikan kata sandi baru"
                              aria-pressed="false"
                            >
                              Lihat
                            </button>
                          </div>
                        </div>

                        <button type="submit" class="slide-submit-btn" id="btn-activate-submit">
                          Aktivasi Akun →
                        </button>
                      </form>

                      <p class="slide-invite-note">
                        Role (<strong>Copywriter</strong> / <strong>Editor</strong>) otomatis mengikuti undangan Ketua Tim.
                      </p>

                      <button type="button" class="slide-mobile-switch" data-auth-tab="signin">
                        Sudah punya akun aktif? <span>Sign In →</span>
                      </button>
                    </section>

                    <!-- TOP LAYER (z-index: 10): Sliding Overlay Panel (#18191C) with Parallax Track -->
                    <div class="sliding-overlay-wrap" aria-live="polite">
                      <div class="sliding-overlay-track">
                        <!-- Panel A (Left half of track — Visible when Overlay slides to LEFT in Aktivasi mode) -->
                        <div class="sliding-overlay-panel overlay-panel-left">
                          <div class="overlay-accent-line" aria-hidden="true"></div>
                          <div class="overlay-inner-copy">
                            <span class="overlay-eyebrow">ANGGOTA BARU · STUDIOFLOW</span>
                            <h1 class="overlay-heading">Salam Kenal &amp; Selamat Bergabung!</h1>
                            <p class="overlay-subtext">
                              Senang menyambutmu di ruang kerja kreatif StudioFlow. Aktifkan akunmu dan mari berkolaborasi!
                            </p>
                            <button
                              type="button"
                              id="tab-signin"
                              class="overlay-outline-btn"
                              data-auth-tab="signin"
                            >
                              Sudah Punya Akun? Sign In
                            </button>
                          </div>
                          <div class="overlay-footnote">
                            Simulasi lokal <code>state/localStorage</code> · Tim Kreatif YMQ
                          </div>
                        </div>

                        <!-- Panel B (Right half of track — Visible by Default on RIGHT in Sign In mode) -->
                        <div class="sliding-overlay-panel overlay-panel-right">
                          <div class="overlay-accent-line" aria-hidden="true"></div>
                          <div class="overlay-inner-copy">
                            <span class="overlay-eyebrow">RUANG KERJA · TIM KREATIF YMQ</span>
                            <h1 class="overlay-heading">Selamat Bekerja!</h1>
                            <p class="overlay-subtext">
                              Mari buat karya terbaik hari ini bersama tim. Setiap ide dan naskahmu membawa manfaat.
                            </p>
                            <button
                              type="button"
                              id="tab-activate"
                              class="overlay-outline-btn"
                              data-auth-tab="activate"
                            >
                              Aktivasi Akun Baru
                            </button>
                          </div>
                          <div class="overlay-footnote">
                            Simulasi lokal <code>state/localStorage</code> · Tim Kreatif YMQ
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Stage 2: Brand Splash inside Small Laptop Screen (450ms - 1100ms) -->
                    <div id="laptop-brand-splash" class="laptop-brand-splash" aria-hidden="true">
                      <div class="laptop-splash-lockup">
                        <div class="sf-logo-box splash-sf-box">SF</div>
                        <div class="splash-sf-text">
                          <strong>StudioFlow</strong>
                          <small>TIM KREATIF YMQ</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="screen-focus-exit-hint" aria-hidden="true">
                  Tekan <kbd>Enter</kbd> untuk kembali ke meja
                </div>
              </div>
            </div>

            <!-- Realistic MacBook Air/Pro Aluminum Chassis (Closed Top Lid + Open Keyboard Deck) -->
            <div class="laptop-base-chassis" aria-hidden="true">
              <!-- Dark Aluminum Closed Lid Shell (Visible when Closed, smoothly lifts away when Open) -->
              <div class="laptop-closed-lid-cap">
                <div class="laptop-closed-lid-top">
                  <span class="laptop-closed-lid-mark">SF</span>
                </div>
                <div class="laptop-closed-lid-edge">
                  <span class="laptop-closed-lid-notch"></span>
                </div>
              </div>

              <!-- Open Laptop Clutch Hinge + Forward-Tilted Keyboard Deck -->
              <div class="laptop-hinge-cylinder"></div>
              <div class="laptop-base-deck">
                <div class="laptop-deck-overhead-sheen"></div>
                <div class="laptop-deck-inner">
                  <div class="laptop-speaker-grille"></div>
                  <div class="laptop-keyboard-well">
                    <div class="laptop-kb-row kb-row-fn">
                      <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
                    </div>
                    <div class="laptop-kb-row kb-row-main">
                      <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
                    </div>
                    <div class="laptop-kb-row kb-row-main">
                      <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
                    </div>
                    <div class="laptop-kb-row kb-row-bottom">
                      <span></span><span></span><span></span><span class="kb-spacebar"></span><span></span><span></span><span></span>
                    </div>
                  </div>
                  <div class="laptop-speaker-grille"></div>
                </div>
                <div class="laptop-trackpad"></div>
              </div>

              <!-- Machined Silver Lower Chassis Front Lip (15px Realistic Thickness) -->
              <div class="laptop-base-front">
                <div class="laptop-side-port port-left"></div>
                <div class="laptop-thumb-notch"></div>
                <div class="laptop-side-port port-right"></div>
              </div>

              <!-- Thin Rubber Feet sitting flush on Wooden Desk -->
              <div class="laptop-rubber-feet">
                <span></span>
                <span></span>
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
  if (typeof activeKeydownCleanup === 'function') {
    activeKeydownCleanup();
    activeKeydownCleanup = null;
  }

  const stageEl = document.querySelector('#login-lamp-stage');
  const cordEl = document.querySelector('#lamp-cord-btn');
  const shadeEl = document.querySelector('#lamp-shade-btn');
  const hintBtn = document.querySelector('#lamp-pull-hint-btn');
  const colorPillBtn = document.querySelector('#lamp-color-pill-btn');
  const lidEl = document.querySelector('.laptop-lid-pivot');
  const focusBackdrop = document.querySelector('#screen-focus-backdrop');
  const slidingContainer = document.querySelector('#laptop-sliding-container');
  const signInPane = document.querySelector('#panel-signin');
  const activatePane = document.querySelector('#panel-activate');

  const applyThemeToStage = () => {
    const theme = getCurrentTheme();
    if (!stageEl) return;
    stageEl.style.setProperty('--lamp-color', theme.hex);
    stageEl.style.setProperty('--lamp-rgb', theme.rgb);
    stageEl.style.setProperty('--lamp-ink', theme.ink);
    stageEl.style.setProperty('--lamp-glow', `rgba(${theme.rgb}, 0.36)`);
    stageEl.setAttribute('data-lamp-theme', theme.id);

    const nameEl = document.querySelector('#lamp-color-name');
    if (nameEl) nameEl.textContent = theme.name;
    shadeEl?.setAttribute('aria-label', `Klik kap lampu untuk mengganti warna cahaya (${theme.name})`);
    colorPillBtn?.setAttribute('aria-label', `Warna cahaya aktif: ${theme.name}. Klik untuk ganti warna.`);
  };

  const enterScreenFocusMode = () => {
    if (!authUiState.screenAwake || !authUiState.laptopOpen || authUiState.screenFocused) return;
    if (!stageEl || !lidEl) return;

    try {
      const rect = lidEl.getBoundingClientRect();
      const screenRect = slidingContainer?.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0 && typeof window !== 'undefined') {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const bezelExtraH = screenRect ? Math.max(24, rect.height - screenRect.height) : 30;
        const targetW = Math.round(Math.min(880, vw * 0.92));
        const targetScreenH = Math.round(Math.min(500, Math.max(410, vh * 0.80 - bezelExtraH)));
        const targetLidH = targetScreenH + bezelExtraH;

        const currentCenterX = rect.left + rect.width / 2;
        const expandedCenterY = rect.bottom - targetLidH / 2;

        const tx = Math.round((vw / 2) - currentCenterX);
        const ty = Math.round((vh / 2 - 6) - expandedCenterY);

        stageEl.style.setProperty('--focus-width', `${targetW}px`);
        stageEl.style.setProperty('--focus-height', `${targetScreenH}px`);
        stageEl.style.setProperty('--focus-tx', `${tx}px`);
        stageEl.style.setProperty('--focus-ty', `${ty}px`);
      }
    } catch {
      stageEl.style.setProperty('--focus-width', '880px');
      stageEl.style.setProperty('--focus-height', '500px');
      stageEl.style.setProperty('--focus-tx', '0px');
      stageEl.style.setProperty('--focus-ty', '-18px');
    }

    authUiState.screenFocused = true;
    stageEl.classList.add('is-screen-focused');
    stageEl.setAttribute('data-screen-focused', 'true');
  };

  const exitScreenFocusMode = (blurActive = true) => {
    if (!authUiState.screenFocused && !stageEl?.classList.contains('is-screen-focused')) return;
    authUiState.screenFocused = false;
    stageEl?.classList.remove('is-screen-focused');
    stageEl?.setAttribute('data-screen-focused', 'false');

    if (blurActive && typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
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

  const setSlidingMode = (nextMode, focusSelector = null) => {
    const toActivate = nextMode === 'activate';
    authUiState.activeTab = toActivate ? 'activate' : 'signin';

    if (slidingContainer) {
      slidingContainer.classList.toggle('is-activate-mode', toActivate);
      slidingContainer.setAttribute('data-auth-mode', authUiState.activeTab);
    }
    if (signInPane) signInPane.setAttribute('aria-hidden', String(toActivate));
    if (activatePane) activatePane.setAttribute('aria-hidden', String(!toActivate));

    const loginErr = document.querySelector('#login-error');
    const actErr = document.querySelector('#activate-error');
    if (loginErr) loginErr.style.display = 'none';
    if (actErr) actErr.style.display = 'none';

    if (toActivate) {
      authUiState.successBanner = '';
      const succEl = document.querySelector('#login-success');
      if (succEl) succEl.style.display = 'none';
    }

    if (focusSelector && authUiState.screenAwake && authUiState.screenFocused) {
      setTimeout(() => {
        document.querySelector(focusSelector)?.focus();
      }, 420);
    }
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
      // Jeda 250ms setelah lampu menyala -> buka tutup laptop 3D
      laptopOpenTimer = setTimeout(() => {
        if (!authUiState.lampOn) return;
        authUiState.laptopOpen = true;
        stageEl?.classList.add('is-laptop-open');
        stageEl?.setAttribute('data-laptop-open', 'true');
      }, 250);

      // Nyalakan layar laptop saat tutup terbuka (biarkan tampil utuh di meja dulu; focus mode aktif saat input diklik/diketik)
      screenAwakeTimer = setTimeout(() => {
        if (!authUiState.lampOn) return;
        authUiState.screenAwake = true;
        stageEl?.classList.add('is-screen-awake');
        lidEl?.setAttribute('aria-hidden', 'false');
      }, 620);
    } else {
      exitScreenFocusMode(true);
      authUiState.screenAwake = false;
      authUiState.laptopOpen = false;
      stageEl?.classList.remove('is-screen-awake');
      stageEl?.classList.remove('is-laptop-open');
      stageEl?.setAttribute('data-laptop-open', 'false');
      lidEl?.setAttribute('aria-hidden', 'true');
    }
  };

  // ── Screen Focus Mode Triggers (focusin / input / typing keydown) & Exit on Enter ──
  slidingContainer?.addEventListener('focusin', (e) => {
    const target = e.target;
    if (target instanceof HTMLElement && target.matches('input.slide-input')) {
      enterScreenFocusMode();
    }
  });

  slidingContainer?.addEventListener('input', (e) => {
    const target = e.target;
    if (target instanceof HTMLElement && target.matches('input.slide-input')) {
      enterScreenFocusMode();
    }
  });

  focusBackdrop?.addEventListener('click', () => {
    exitScreenFocusMode(true);
  });

  const handleGlobalKeydown = (e) => {
    // Pastikan masih berada di halaman login
    if (!document.querySelector('#login-lamp-stage')) {
      if (typeof activeKeydownCleanup === 'function') {
        activeKeydownCleanup();
        activeKeydownCleanup = null;
      }
      return;
    }

    if (!authUiState.screenAwake) return;

    // Keluar dari Screen Focus Mode saat menekan Enter
    if (e.key === 'Enter' && authUiState.screenFocused) {
      const activeEl = document.activeElement;
      const inLoginForm = Boolean(activeEl?.closest?.('#login-form'));
      const inActivateForm = Boolean(activeEl?.closest?.('#activate-form'));

      const loginReady = Boolean(
        document.querySelector('#login-email')?.value?.trim() &&
        document.querySelector('#login-password')?.value?.trim()
      );
      const activateReady = Boolean(
        document.querySelector('#act-name')?.value?.trim() &&
        document.querySelector('#act-email')?.value?.trim() &&
        document.querySelector('#act-password')?.value?.trim()
      );

      // Langsung nonaktifkan mode fokus & hilangkan fokus input
      exitScreenFocusMode(true);

      if (inLoginForm && loginReady) {
        e.preventDefault();
        document.querySelector('#login-form')?.requestSubmit?.();
        return;
      }
      if (inActivateForm && activateReady) {
        e.preventDefault();
        document.querySelector('#activate-form')?.requestSubmit?.();
        return;
      }

      // Belum terisi lengkap -> cukup keluar dari mode fokus kembali ke meja
      e.preventDefault();
      return;
    }

    if (e.key === 'Escape' && authUiState.screenFocused) {
      e.preventDefault();
      exitScreenFocusMode(true);
      return;
    }

    // Pemicu otomatis saat mulai mengetik karakter apa pun ketika laptop sudah terbuka
    const isPrintableKey =
      e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey && e.key !== ' ';
    if (isPrintableKey && !authUiState.screenFocused) {
      const activeTag = document.activeElement?.tagName;
      enterScreenFocusMode();
      if (activeTag !== 'INPUT' && activeTag !== 'TEXTAREA') {
        const firstInput =
          authUiState.activeTab === 'activate'
            ? document.querySelector('#act-name')
            : document.querySelector('#login-email');
        firstInput?.focus();
      }
    }
  };

  document.addEventListener('keydown', handleGlobalKeydown);
  activeKeydownCleanup = () => {
    document.removeEventListener('keydown', handleGlobalKeydown);
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

  // Interactive Pull Cord: click & pointer drag downward
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

  hintBtn?.addEventListener('click', () => triggerPullAnimationAndToggle(false));
  shadeEl?.addEventListener('click', cycleLampTheme);
  shadeEl?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      cycleLampTheme();
    }
  });
  colorPillBtn?.addEventListener('click', cycleLampTheme);

  // Smooth Sliding Overlay Toggle Buttons (NO DOM rebuild — pure smooth 0.65s slide!)
  document.querySelectorAll('[data-auth-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.dataset.authTab;
      if (!targetTab) return;
      setSlidingMode(targetTab, targetTab === 'activate' ? '#act-name' : '#login-email');
    });
  });

  // ── Form 1: Sign In Events ──
  const loginForm = document.querySelector('#login-form');
  const emailEl = document.querySelector('#login-email');
  const passEl = document.querySelector('#login-password');
  const errEl = document.querySelector('#login-error');
  const succEl = document.querySelector('#login-success');
  const toggleBtn = document.querySelector('#toggle-password-vis');

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

  let isLoginTransitioning = false;

  const runCinematicLoginTransition = (loggedUser) => {
    if (isLoginTransitioning) return;
    isLoginTransitioning = true;

    // Bersihkan listener keyboard login selama transisi sinematik berlangsung
    if (typeof activeKeydownCleanup === 'function') {
      activeKeydownCleanup();
      activeKeydownCleanup = null;
    }

    // ── TAHAP 1 (0ms – 400ms): Keluar dari Mode Fokus (layar kembali ke ukuran normal di atas meja, blur hilang) ──
    exitScreenFocusMode(true);

    // ── TAHAP 2 (400ms – 1000ms): Logo SF StudioFlow muncul membesar halus di dalam layar laptop kecil ──
    const t2 = setTimeout(() => {
      stageEl?.classList.add('is-laptop-splash');
    }, 400);

    // ── TAHAP 3 (1000ms – 1500ms): Meja, bodi laptop & lampu memudar -> Layar penuh gelap polos #0F1114 dgn logo di tengah ──
    const t3 = setTimeout(() => {
      const splashLockup = document.querySelector('#laptop-brand-splash .laptop-splash-lockup');
      let startTop = typeof window !== 'undefined' ? window.innerHeight / 2 : 360;
      let startLeft = typeof window !== 'undefined' ? window.innerWidth / 2 : 640;

      if (splashLockup) {
        const r = splashLockup.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) {
          startLeft = r.left + r.width / 2;
          startTop = r.top + r.height / 2;
        }
      }

      stageEl?.classList.add('is-room-fading');

      // Buat overlay persisten di document.body (di luar #app agar tanpa kedipan saat renderApp() dipanggil!)
      document.querySelector('#cinematic-logo-overlay')?.remove();
      const overlay = document.createElement('div');
      overlay.id = 'cinematic-logo-overlay';
      overlay.className = 'cinematic-logo-overlay';
      overlay.setAttribute('aria-hidden', 'true');
      overlay.innerHTML = `
        <div class="cinematic-backdrop"></div>
        <div class="cinematic-floating-brand">
          <div class="sf-logo-box cinematic-sf-box">SF</div>
          <div class="cinematic-sf-text">
            <strong>StudioFlow</strong>
            <small>TIM KREATIF YMQ</small>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);

      const brandEl = overlay.querySelector('.cinematic-floating-brand');
      if (brandEl) {
        brandEl.style.left = `${startLeft.toFixed(1)}px`;
        brandEl.style.top = `${startTop.toFixed(1)}px`;
        brandEl.style.transform = 'translate(-50%, -50%) scale(1)';
      }

      // Force reflow agar transisi CSS menuju tengah layar berjalan mulus
      void overlay.offsetWidth;

      overlay.classList.add('phase-center');
      if (brandEl) {
        brandEl.style.left = '50%';
        brandEl.style.top = '50%';
        brandEl.style.transform = 'translate(-50%, -50%) scale(1.18)';
      }
    }, 1000);

    // ── TAHAP 4 (1500ms – 2150ms): Logo meluncur ke pojok kiri atas header sidebar & Dashboard terbuka ──
    const t4 = setTimeout(() => {
      resetAuthUiState(true); // pertahankan #cinematic-logo-overlay sementara meluncur ke pojok kiri atas
      onLoginSuccess(loggedUser, { cinematic: true });

      const overlay = document.querySelector('#cinematic-logo-overlay');
      const brandEl = overlay?.querySelector('.cinematic-floating-brand');

      // Ukur posisi asli logo sidebar jika tersedia, atau default top: 28px; left: 28px
      let dockLeft = 28;
      let dockTop = 28;
      const sidebarBrand = document.querySelector('#sidebar .brand');
      if (sidebarBrand) {
        const sr = sidebarBrand.getBoundingClientRect();
        if (sr.width > 0 && sr.height > 0 && sr.left >= 0) {
          dockLeft = Math.max(16, Math.round(sr.left));
          dockTop = Math.max(16, Math.round(sr.top));
        }
      }

      if (overlay && brandEl) {
        overlay.classList.add('phase-dock');
        brandEl.style.left = `${dockLeft}px`;
        brandEl.style.top = `${dockTop}px`;
        brandEl.style.transform = 'translate(0, 0) scale(0.96)';
      }
    }, 1500);

    // Selesai (2150ms): hilangkan overlay mulus setelah logo menempel di pojok kiri atas
    const t5 = setTimeout(() => {
      const overlay = document.querySelector('#cinematic-logo-overlay');
      if (overlay) {
        overlay.classList.add('phase-done');
      }
      showToast(`Selamat datang, ${loggedUser.name} · Peran terdeteksi: ${loggedUser.role}`);
    }, 2150);

    const t6 = setTimeout(() => {
      cleanupCinematicOverlay();
    }, 2400);

    cinematicTimers.push(t2, t3, t4, t5, t6);
  };

  loginForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (isLoginTransitioning) return;

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
    runCinematicLoginTransition(res.user);
  });

  // ── Form 2: Aktivasi Akun (Invite-Only) Events ──
  const actForm = document.querySelector('#activate-form');
  const actEmailEl = document.querySelector('#act-email');
  const actNameEl = document.querySelector('#act-name');
  const actPassEl = document.querySelector('#act-password');
  const actErrEl = document.querySelector('#activate-error');
  const actToggleBtn = document.querySelector('#toggle-act-password-vis');

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
    authUiState.prefillEmail = res.user.email;
    authUiState.successBanner = `Aktivasi berhasil! Akun "${res.user.name}" aktif sebagai ${res.user.role}. Silakan Sign In.`;

    if (emailEl) emailEl.value = res.user.email;
    if (passEl) passEl.value = '';
    if (actForm) actForm.reset();

    if (succEl) {
      succEl.textContent = `✓ ${authUiState.successBanner}`;
      succEl.style.display = 'block';
    }

    showToast(`Aktivasi sukses! ${res.user.name} aktif sebagai ${res.user.role}. Silakan masuk.`);

    // Geser mulus overlay kembali ke kanan agar Form Sign In muncul di kiri
    setSlidingMode('signin', '#login-password');
  });
}
