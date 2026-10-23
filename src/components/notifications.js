/**
 * Notifikasi — StudioFlow Fase 3
 * Daftar pengingat: deadline, revisi, tugas baru, approval, publikasi mendekati
 * Tandai dibaca, tandai semua dibaca — semua lokal sesi
 */

import { notificationsData } from '../data/mockData.js';

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

function renderNotifItem(notif) {
  const style = TYPE_STYLES[notif.type] || TYPE_STYLES.task;
  return `
    <div class="notif-item ${notif.read ? 'notif-read' : 'notif-unread'}" data-notif-id="${notif.id}">
      <div class="notif-icon-wrap ${style.bg}">
        <span class="notif-icon" aria-hidden="true">${notif.icon}</span>
      </div>
      <div class="notif-body">
        <div class="notif-header">
          <strong class="notif-title">${notif.title}</strong>
          <span class="notif-type-badge ${style.bg}">${style.label}</span>
          <span class="notif-time">${notif.time}</span>
        </div>
        <p class="notif-text">${notif.body}</p>
        <div class="notif-actions">
          <button class="btn-secondary notif-goto-btn" data-notif-id="${notif.id}" data-route="${notif.route}"
            style="padding:5px 10px;font-size:11px;" aria-label="Buka halaman terkait ${notif.title}">
            Lihat → ${notif.route}
          </button>
          ${!notif.read ? `<button class="notif-read-btn" data-notif-id="${notif.id}" style="font-size:11px;color:var(--color-ink-muted);padding:5px 0;" aria-label="Tandai dibaca">Tandai dibaca</button>` : ''}
        </div>
      </div>
      ${!notif.read ? '<span class="notif-unread-dot" aria-label="Belum dibaca"></span>' : ''}
    </div>
  `;
}

export function renderNotifications() {
  const unread = unreadCount();
  const total  = notificationsData.length;

  return `
    <div class="page-heading">
      <div>
        <div class="eyebrow">WORKSPACE / NOTIFIKASI</div>
        <h1>Notifikasi</h1>
        <p>${unread > 0 ? `${unread} belum dibaca` : 'Semua sudah dibaca'} · ${total} total · Simulasi pengingat lokal</p>
      </div>
      <div style="display:flex;gap:10px;">
        ${unread > 0 ? `<button class="btn-secondary" id="btn-read-all">Tandai semua dibaca</button>` : ''}
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
        ? `<div class="notif-list" id="notif-list">${notificationsData.map(renderNotifItem).join('')}</div>`
        : '<div class="cal-empty-state" style="padding:48px;">Tidak ada notifikasi saat ini.</div>'
      }
    </div>

    <div class="demo-banner">
      <span class="demo-banner-icon">✳</span>
      <div class="demo-banner-content">
        <strong>Notifikasi — Fase 3</strong>
        <p>Notifikasi adalah simulasi lokal. Email dan push notification nyata memerlukan backend yang belum disetujui.</p>
      </div>
      <span class="demo-badge">FASE 3</span>
    </div>
  `;
}

export function attachNotificationsEvents(renderApp, showToast) {
  // Tandai satu dibaca
  document.querySelectorAll('.notif-read-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.notifId;
      const notif = notificationsData.find(n => n.id === id);
      if (notif) { notif.read = true; renderApp(); }
    });
  });

  // Tandai semua dibaca
  document.querySelector('#btn-read-all')?.addEventListener('click', () => {
    notificationsData.forEach(n => { n.read = true; });
    showToast('Semua notifikasi ditandai sudah dibaca.');
    renderApp();
  });

  // Navigasi ke halaman terkait
  document.querySelectorAll('.notif-goto-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.notifId;
      const notif = notificationsData.find(n => n.id === id);
      if (notif) { notif.read = true; }
      // Trigger navigation via data-route
      const route = btn.dataset.route;
      const routeEvent = new CustomEvent('studioflow:navigate', { detail: { route } });
      document.dispatchEvent(routeEvent);
    });
  });
}
