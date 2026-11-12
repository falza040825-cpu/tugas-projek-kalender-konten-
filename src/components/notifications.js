/**
 * Notifikasi — Yayasan Motivator Qur'an (Terhubung dengan alur lintas peran & localStorage)
 */

import {
  notificationsData,
  getCurrentUser,
  canAccessRoute,
  saveWorkspaceState,
} from '../data/mockData.js';
import { escapeHtml } from '../utils/helpers.js';

const TYPE_STYLES = {
  deadline: { bg: 'ntf-deadline', label: 'Deadline' },
  revision: { bg: 'ntf-revision', label: 'Revisi' },
  task:     { bg: 'ntf-task',     label: 'Tugas' },
  publish:  { bg: 'ntf-publish',  label: 'Publikasi' },
  approval: { bg: 'ntf-approval', label: 'Persetujuan' },
};

function unreadCount() {
  return notificationsData.filter(n => !n.read).length;
}

function renderNotifItem(notif, role) {
  const style = TYPE_STYLES[notif.type] || TYPE_STYLES.task;
  const targetRoute = canAccessRoute(role, notif.route) ? notif.route : 'Manajemen tugas';

  return `
    <div class="notif-item ${notif.read ? 'notif-read' : 'notif-unread'}" data-notif-id="${escapeHtml(notif.id)}">
      <div class="notif-icon-wrap ${style.bg}">
        <span class="notif-icon" aria-hidden="true">${notif.icon}</span>
      </div>
      <div class="notif-body">
        <div class="notif-header">
          <strong class="notif-title">${escapeHtml(notif.title)}</strong>
          <span class="notif-type-badge ${style.bg}">${escapeHtml(style.label)}</span>
          <span class="notif-time">${escapeHtml(notif.time)}</span>
        </div>
        <p class="notif-text">${escapeHtml(notif.body)}</p>
        <div class="notif-actions">
          <button type="button" class="btn-secondary notif-goto-btn" data-notif-id="${escapeHtml(notif.id)}" data-route="${escapeHtml(targetRoute)}"
            style="padding:5px 10px;font-size:11px;" aria-label="Buka halaman terkait ${escapeHtml(notif.title)}">
            Lihat → ${escapeHtml(targetRoute)}
          </button>
          ${!notif.read ? `<button type="button" class="notif-read-btn" data-notif-id="${escapeHtml(notif.id)}" style="font-size:11px;color:var(--color-ink-muted);padding:5px 0;" aria-label="Tandai dibaca">Tandai dibaca</button>` : ''}
        </div>
      </div>
      ${!notif.read ? '<span class="notif-unread-dot" aria-label="Belum dibaca"></span>' : ''}
    </div>
  `;
}

export function renderNotifications() {
  const role = getCurrentUser()?.role || 'Copywriter';
  const unread = unreadCount();
  const total  = notificationsData.length;

  return `
    <div class="page-heading">
      <div>
        <div class="eyebrow">WORKSPACE / NOTIFIKASI</div>
        <h1>Notifikasi</h1>
        <p>${unread > 0 ? `${unread} belum dibaca` : 'Semua sudah dibaca'} · ${total} total · Update alur kerja lokal</p>
      </div>
      <div style="display:flex;gap:10px;">
        ${unread > 0 ? `<button type="button" class="btn-secondary" id="btn-read-all">Tandai semua dibaca</button>` : ''}
      </div>
    </div>

    <!-- Stats -->
    <div class="pip-stats" style="margin-bottom:20px;">
      <div class="pip-stat-item">
        <span class="pip-stat-val">${total}</span>
        <span class="pip-stat-label">Total notifikasi</span>
      </div>
      <div class="pip-stat-divider"></div>
      <div class="pip-stat-item">
        <span class="pip-stat-val" style="color:var(--color-blush-ink)">${unread}</span>
        <span class="pip-stat-label">Belum dibaca</span>
      </div>
      <div class="pip-stat-divider"></div>
      <div class="pip-stat-item">
        <span class="pip-stat-val">${notificationsData.filter(n => n.type === 'deadline').length}</span>
        <span class="pip-stat-label">Deadline</span>
      </div>
      <div class="pip-stat-divider"></div>
      <div class="pip-stat-item">
        <span class="pip-stat-val">${notificationsData.filter(n => n.type === 'revision').length}</span>
        <span class="pip-stat-label">Revisi</span>
      </div>
    </div>

    <!-- Notification List -->
    <div class="panel" style="margin-bottom:20px;padding:0;">
      ${notificationsData.length > 0
        ? `<div class="notif-list" id="notif-list">${notificationsData.map(n => renderNotifItem(n, role)).join('')}</div>`
        : '<div class="cal-empty-state" style="padding:48px;">Tidak ada notifikasi saat ini.</div>'
      }
    </div>

    <div class="demo-banner">
      <span class="demo-banner-icon">✳</span>
      <div class="demo-banner-content">
        <strong>Notifikasi — Simulasi Lokal</strong>
        <p>Notifikasi otomatis bertambah ketika Copywriter mengirim Siap Edit, Editor mengirim Menunggu Review, atau Ketua Tim melakukan approval.</p>
      </div>
      <span class="demo-badge">SIMULASI</span>
    </div>
  `;
}

export function attachNotificationsEvents(renderApp, showToast) {
  document.querySelectorAll('.notif-read-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.notifId;
      const notif = notificationsData.find(n => n.id === id);
      if (notif) {
        notif.read = true;
        saveWorkspaceState();
        renderApp();
      }
    });
  });

  document.querySelector('#btn-read-all')?.addEventListener('click', () => {
    notificationsData.forEach(n => { n.read = true; });
    saveWorkspaceState();
    showToast('Semua notifikasi ditandai sudah dibaca.');
    renderApp();
  });

  document.querySelectorAll('.notif-goto-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.notifId;
      const notif = notificationsData.find(n => n.id === id);
      if (notif) {
        notif.read = true;
        saveWorkspaceState();
      }
      const route = btn.dataset.route;
      document.dispatchEvent(new CustomEvent('ymq:navigate', { detail: { route } }));
    });
  });
}
