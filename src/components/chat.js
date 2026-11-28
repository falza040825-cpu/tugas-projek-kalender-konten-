/**
 * Modul Kolom Chat & Diskusi Tim (Full Page + Floating Mini-Chat Widget)
 * - Terintegrasi otomatis dengan user & role aktif (Ketua Tim, Copywriter, Editor)
 * - Riwayat tersimpan di localStorage (simulasi front-end, bukan server realtime nyata)
 */

import {
  chatChannels,
  getChatMessagesByChannel,
  getUnreadChatCount,
  markChannelAsRead,
  sendChatMessage,
  getCurrentUser,
  teamMembers,
  ROLES,
} from '../data/mockData.js';
import { escapeHtml } from '../utils/helpers.js';

const chatUiState = {
  activeChannelId: 'umum-tim',
  floatingOpen: false,
};

export function resetChatUiState() {
  chatUiState.activeChannelId = 'umum-tim';
  chatUiState.floatingOpen = false;
}

function getActiveChannel() {
  return chatChannels.find(c => c.id === chatUiState.activeChannelId) || chatChannels[0];
}

function getRoleBadgeClass(role) {
  if (role === ROLES.KETUA_TIM) return 'chat-role-ketua';
  if (role === ROLES.COPYWRITER) return 'chat-role-copywriter';
  if (role === ROLES.EDITOR) return 'chat-role-editor';
  return 'chat-role-default';
}

function scrollFeedToBottom(feedEl) {
  if (!feedEl) return;
  feedEl.scrollTop = feedEl.scrollHeight;
  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(() => {
      feedEl.scrollTop = feedEl.scrollHeight;
    });
  }
}

function renderMessageListMarkup(channelId, compact = false) {
  const user = getCurrentUser();
  const activeEmail = String(user?.email || '').trim().toLowerCase();
  const messages = getChatMessagesByChannel(channelId);

  if (messages.length === 0) {
    return `
      <div class="chat-empty-state">
        <strong>Belum ada pesan di channel ini</strong>
        <p>Mulai percakapan sebagai ${escapeHtml(user?.name || 'Anggota Tim')} (${escapeHtml(user?.role || '')}).</p>
      </div>
    `;
  }

  return messages.map(msg => {
    const isOwn = String(msg.senderEmail || '').trim().toLowerCase() === activeEmail;
    const roleCls = getRoleBadgeClass(msg.senderRole);
    const avCls = msg.senderAvatarClass || 'av-sand';

    return `
      <article class="chat-msg-row ${isOwn ? 'is-own' : 'is-other'} ${compact ? 'is-compact' : ''}" data-msg-id="${escapeHtml(msg.id)}">
        <div class="chat-avatar ${escapeHtml(avCls)}" aria-hidden="true">${escapeHtml(msg.senderInitials || 'TM')}</div>
        <div class="chat-bubble-wrap">
          <div class="chat-msg-meta">
            <strong class="chat-sender-name">${escapeHtml(msg.senderName)}${isOwn ? ' (Anda)' : ''}</strong>
            <span class="chat-role-badge ${roleCls}">${escapeHtml(msg.senderRole)}</span>
            <time class="chat-msg-time">${escapeHtml(msg.timestamp || '')}</time>
          </div>
          <div class="chat-bubble">
            <p>${escapeHtml(msg.text)}</p>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

export function syncChatUnreadBadges() {
  if (typeof document === 'undefined') return;
  const user = getCurrentUser();
  if (!user) return;

  const totalUnread = getUnreadChatCount(user.email);

  // Perbarui badge pada menu Sidebar "Diskusi Tim"
  const sidebarBtn = document.querySelector('#sidebar [data-route="Diskusi Tim"]');
  if (sidebarBtn) {
    const existingBadge = sidebarBtn.querySelector('.nav-badge');
    const existingDot = sidebarBtn.querySelector('.nav-dot-badge');
    const tooltipEl = sidebarBtn.querySelector('.sidebar-tooltip');
    const iconWrap = sidebarBtn.querySelector('.nav-icon-wrap');

    if (totalUnread > 0) {
      if (existingBadge) {
        existingBadge.textContent = String(totalUnread);
      } else {
        const badgeSpan = document.createElement('span');
        badgeSpan.className = 'nav-badge';
        badgeSpan.setAttribute('aria-label', `${totalUnread} pesan belum dibaca`);
        badgeSpan.textContent = String(totalUnread);
        if (tooltipEl) {
          sidebarBtn.insertBefore(badgeSpan, tooltipEl);
        } else {
          sidebarBtn.appendChild(badgeSpan);
        }
      }
      if (!existingDot && iconWrap) {
        const dotSpan = document.createElement('span');
        dotSpan.className = 'nav-dot-badge';
        dotSpan.setAttribute('aria-label', `${totalUnread} pesan belum dibaca`);
        iconWrap.appendChild(dotSpan);
      }
      sidebarBtn.title = `Diskusi Tim (${totalUnread})`;
      if (tooltipEl) tooltipEl.textContent = `Diskusi Tim (${totalUnread})`;
    } else {
      existingBadge?.remove();
      existingDot?.remove();
      sidebarBtn.title = 'Diskusi Tim';
      if (tooltipEl) tooltipEl.textContent = 'Diskusi Tim';
    }
  }

  // Perbarui badge pada tombol Floating Chat Bubble
  const floatBadge = document.querySelector('#floating-chat-badge');
  if (floatBadge) {
    if (totalUnread > 0) {
      floatBadge.textContent = totalUnread > 99 ? '99+' : String(totalUnread);
      floatBadge.style.display = 'inline-flex';
    } else {
      floatBadge.textContent = '';
      floatBadge.style.display = 'none';
    }
  }

  // Perbarui badge per channel di halaman penuh maupun mini-chat
  document.querySelectorAll('[data-chat-ch-badge]').forEach(el => {
    const chId = el.getAttribute('data-chat-ch-badge');
    const count = getUnreadChatCount(user.email, chId);
    if (count > 0) {
      el.textContent = String(count);
      el.style.display = 'inline-flex';
    } else {
      el.textContent = '';
      el.style.display = 'none';
    }
  });
}

/**
 * Halaman Penuh: Diskusi Tim (Menu Sidebar "Diskusi Tim")
 */
export function renderChatPage() {
  const user = getCurrentUser();
  const activeChannel = getActiveChannel();
  const channelMessages = getChatMessagesByChannel(activeChannel.id);
  const activeEmail = String(user?.email || '').trim().toLowerCase();
  const activeRoleCls = getRoleBadgeClass(user?.role);

  return `
    <div class="chat-page-root">
      <div class="page-header">
        <div>
          <span class="page-eyebrow">WORKSPACE / DISKUSI TIM</span>
          <h1 class="page-title">Diskusi Tim</h1>
          <p class="page-sub">
            Ruang koordinasi internal lintas peran — aktif sebagai
            <strong>${escapeHtml(user?.name || 'Pengguna')}</strong>
            <span class="chat-role-badge ${activeRoleCls}">${escapeHtml(user?.role || '')}</span>.
            Gunakan tombol <strong>Quick Switch</strong> di bar atas untuk simulasi balas antar peran.
          </p>
        </div>
        <div class="chat-header-meta-pill">
          <span class="chat-live-dot" aria-hidden="true"></span>
          <span>Riwayat tersimpan lokal (<code>localStorage</code>)</span>
        </div>
      </div>

      <section class="chat-workspace-grid" aria-label="Ruang Diskusi Tim">
        <!-- LEFT PANEL: Daftar Channel & Anggota Aktif -->
        <aside class="chat-channel-panel" aria-label="Daftar channel diskusi">
          <div class="chat-panel-head">
            <span class="chat-panel-kicker">CHANNEL DISKUSI</span>
            <span class="chat-channel-count">${chatChannels.length} topik</span>
          </div>

          <div class="chat-channel-list" role="tablist" aria-label="Pilih topik diskusi">
            ${chatChannels.map(ch => {
              const isSelected = ch.id === activeChannel.id;
              const unread = getUnreadChatCount(user?.email, ch.id);
              const totalInCh = getChatMessagesByChannel(ch.id).length;
              return `
                <button
                  type="button"
                  role="tab"
                  class="chat-channel-btn ${isSelected ? 'active' : ''}"
                  data-chat-channel="${escapeHtml(ch.id)}"
                  aria-selected="${isSelected ? 'true' : 'false'}"
                >
                  <div class="chat-channel-row-top">
                    <span class="chat-channel-name">${escapeHtml(ch.name)}</span>
                    <span
                      class="chat-unread-pill"
                      data-chat-ch-badge="${escapeHtml(ch.id)}"
                      style="display:${unread > 0 ? 'inline-flex' : 'none'};"
                    >${unread > 0 ? unread : ''}</span>
                  </div>
                  <span class="chat-channel-desc">${escapeHtml(ch.title)} · ${totalInCh} pesan</span>
                </button>
              `;
            }).join('')}
          </div>

          <div class="chat-roster-section">
            <span class="chat-panel-kicker">ANGGOTA TIM AKTIF</span>
            <ul class="chat-roster-list">
              ${teamMembers.slice(0, 5).map(m => {
                const isMe = String(m.email || '').trim().toLowerCase() === activeEmail;
                return `
                  <li class="chat-roster-item ${isMe ? 'is-me' : ''}">
                    <span class="chat-roster-av" aria-hidden="true">${escapeHtml(m.initials)}</span>
                    <div class="chat-roster-info">
                      <strong>${escapeHtml(m.name)}${isMe ? ' · Anda' : ''}</strong>
                      <small>${escapeHtml(m.role)}</small>
                    </div>
                    <span class="chat-online-dot" title="Aktif"></span>
                  </li>
                `;
              }).join('')}
            </ul>
          </div>
        </aside>

        <!-- RIGHT PANEL: Area Percakapan Aktif -->
        <div class="chat-thread-panel">
          <header class="chat-thread-header">
            <div class="chat-thread-title-wrap">
              <div class="chat-thread-title-row">
                <h2 id="chat-page-ch-name">${escapeHtml(activeChannel.name)}</h2>
                <span class="chat-msg-count-pill" id="chat-page-ch-count">${channelMessages.length} pesan</span>
              </div>
              <p id="chat-page-ch-desc">${escapeHtml(activeChannel.description)}</p>
            </div>
            <div class="chat-active-sender-chip" title="Identitas pengirim saat ini">
              <span class="chat-sender-chip-av">${escapeHtml(user?.avatar || 'SF')}</span>
              <div>
                <small>Mengirim sebagai</small>
                <strong>${escapeHtml(user?.name || 'Pengguna')} · ${escapeHtml(user?.role || '')}</strong>
              </div>
            </div>
          </header>

          <div
            id="chat-page-messages"
            class="chat-messages-feed"
            role="log"
            aria-live="polite"
            aria-label="Riwayat pesan ${escapeHtml(activeChannel.name)}"
          >
            ${renderMessageListMarkup(activeChannel.id, false)}
          </div>

          <form id="chat-page-form" class="chat-composer" autocomplete="off">
            <input
              id="chat-page-input"
              type="text"
              class="chat-composer-input"
              placeholder="Tulis pesan sebagai ${escapeHtml(user?.name || 'Anggota')} (${escapeHtml(user?.role || '')}) di ${escapeHtml(activeChannel.name)}..."
              aria-label="Tulis pesan diskusi tim"
              maxlength="600"
            />
            <button type="submit" id="chat-page-send" class="chat-send-btn">
              <span>Kirim</span>
              <span aria-hidden="true">↗</span>
            </button>
          </form>
        </div>
      </section>
    </div>
  `;
}

export function attachChatPageEvents(rerenderApp, showToast) {
  const user = getCurrentUser();
  const feedEl = document.querySelector('#chat-page-messages');
  const formEl = document.querySelector('#chat-page-form');
  const inputEl = document.querySelector('#chat-page-input');
  const chNameEl = document.querySelector('#chat-page-ch-name');
  const chDescEl = document.querySelector('#chat-page-ch-desc');
  const chCountEl = document.querySelector('#chat-page-ch-count');

  const activeChannel = getActiveChannel();
  if (user) {
    markChannelAsRead(activeChannel.id, user.email);
    syncChatUnreadBadges();
  }
  scrollFeedToBottom(feedEl);

  const refreshChannelView = () => {
    const ch = getActiveChannel();
    const curUser = getCurrentUser();
    if (curUser) {
      markChannelAsRead(ch.id, curUser.email);
    }

    if (chNameEl) chNameEl.textContent = ch.name;
    if (chDescEl) chDescEl.textContent = ch.description;
    if (chCountEl) {
      chCountEl.textContent = `${getChatMessagesByChannel(ch.id).length} pesan`;
    }
    if (feedEl) {
      feedEl.innerHTML = renderMessageListMarkup(ch.id, false);
      feedEl.setAttribute('aria-label', `Riwayat pesan ${ch.name}`);
      scrollFeedToBottom(feedEl);
    }
    if (inputEl && curUser) {
      inputEl.placeholder = `Tulis pesan sebagai ${curUser.name} (${curUser.role}) di ${ch.name}...`;
    }

    // Perbarui state aktif & hitungan pesan di daftar channel kiri
    document.querySelectorAll('.chat-channel-btn[data-chat-channel]').forEach(btn => {
      const chId = btn.dataset.chatChannel;
      const isSel = chId === ch.id;
      btn.classList.toggle('active', isSel);
      btn.setAttribute('aria-selected', String(isSel));
      const channelObj = chatChannels.find(c => c.id === chId);
      const descEl = btn.querySelector('.chat-channel-desc');
      if (channelObj && descEl) {
        descEl.textContent = `${channelObj.title} · ${getChatMessagesByChannel(chId).length} pesan`;
      }
    });

    syncChatUnreadBadges();
  };

  document.querySelectorAll('.chat-channel-btn[data-chat-channel]').forEach(btn => {
    btn.addEventListener('click', () => {
      const nextId = btn.dataset.chatChannel;
      if (!nextId) return;
      chatUiState.activeChannelId = nextId;
      refreshChannelView();
      inputEl?.focus();
    });
  });

  formEl?.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = inputEl?.value?.trim() || '';
    if (!text) return;

    const sent = sendChatMessage({
      channelId: chatUiState.activeChannelId,
      text,
    });

    if (sent) {
      if (inputEl) inputEl.value = '';
      refreshChannelView();
      inputEl?.focus();
    } else if (typeof showToast === 'function') {
      showToast('Gagal mengirim pesan: pastikan sesi pengguna aktif.');
    }
  });
}

/**
 * Floating Chat Bubble & Mini-Chat Popover (Pojok Kanan Bawah, z-index: 45)
 */
export function renderFloatingChatWidget(currentRoute) {
  const user = getCurrentUser();
  if (!user || currentRoute === 'Diskusi Tim') return '';

  const activeChannel = getActiveChannel();
  const totalUnread = getUnreadChatCount(user.email);
  const isOpen = chatUiState.floatingOpen;
  const roleCls = getRoleBadgeClass(user.role);

  return `
    <div class="floating-chat-root ${isOpen ? 'is-open' : ''}" id="floating-chat-root">
      <!-- Mini-Chat Glass Popover -->
      <section
        id="floating-chat-panel"
        class="floating-chat-panel"
        aria-label="Jendela mini-chat diskusi tim"
        aria-hidden="${isOpen ? 'false' : 'true'}"
      >
        <header class="floating-chat-head">
          <div class="floating-chat-title">
            <div class="floating-chat-title-row">
              <strong>Diskusi Tim</strong>
              <span class="chat-role-badge ${roleCls}">${escapeHtml(user.role)}</span>
            </div>
            <small>Aktif: ${escapeHtml(user.name)} · ${escapeHtml(activeChannel.name)}</small>
          </div>
          <div class="floating-chat-head-actions">
            <button
              type="button"
              id="btn-floating-chat-expand"
              class="floating-chat-icon-btn"
              title="Buka halaman penuh Diskusi Tim"
              aria-label="Buka halaman penuh Diskusi Tim"
            >
              ⤢
            </button>
            <button
              type="button"
              id="btn-floating-chat-close"
              class="floating-chat-icon-btn"
              title="Tutup jendela chat"
              aria-label="Tutup jendela chat"
            >
              ×
            </button>
          </div>
        </header>

        <div class="floating-chat-tabs" role="tablist" aria-label="Pilih channel mini-chat">
          ${chatChannels.map(ch => {
            const isSel = ch.id === activeChannel.id;
            const unread = getUnreadChatCount(user.email, ch.id);
            return `
              <button
                type="button"
                role="tab"
                class="floating-chat-tab ${isSel ? 'active' : ''}"
                data-float-channel="${escapeHtml(ch.id)}"
                aria-selected="${isSel ? 'true' : 'false'}"
              >
                <span>${escapeHtml(ch.name)}</span>
                <span
                  class="chat-unread-pill is-mini"
                  data-chat-ch-badge="${escapeHtml(ch.id)}"
                  style="display:${unread > 0 ? 'inline-flex' : 'none'};"
                >${unread > 0 ? unread : ''}</span>
              </button>
            `;
          }).join('')}
        </div>

        <div
          id="floating-chat-messages"
          class="chat-messages-feed is-compact"
          role="log"
          aria-live="polite"
        >
          ${renderMessageListMarkup(activeChannel.id, true)}
        </div>

        <form id="floating-chat-form" class="chat-composer is-compact" autocomplete="off">
          <input
            id="floating-chat-input"
            type="text"
            class="chat-composer-input"
            placeholder="Balas sebagai ${escapeHtml(user.name)} (${escapeHtml(user.role)})..."
            aria-label="Tulis pesan cepat"
            maxlength="600"
          />
          <button type="submit" id="floating-chat-send" class="chat-send-btn is-compact" aria-label="Kirim pesan">
            ↗
          </button>
        </form>
      </section>

      <!-- Floating Glass Pill Trigger Button (Pojok Kanan Bawah) -->
      <button
        type="button"
        id="btn-floating-chat"
        class="floating-chat-trigger"
        aria-expanded="${isOpen ? 'true' : 'false'}"
        aria-controls="floating-chat-panel"
        aria-label="Buka atau tutup mini-chat Diskusi Tim"
      >
        <span class="floating-chat-trigger-icon" aria-hidden="true">💬</span>
        <span class="floating-chat-trigger-label">Diskusi Tim</span>
        <span
          id="floating-chat-badge"
          class="floating-chat-badge"
          style="display:${totalUnread > 0 ? 'inline-flex' : 'none'};"
        >${totalUnread > 0 ? (totalUnread > 99 ? '99+' : totalUnread) : ''}</span>
      </button>
    </div>
  `;
}

export function attachFloatingChatEvents(navigateTo, showToast) {
  const rootEl = document.querySelector('#floating-chat-root');
  if (!rootEl) return;

  const triggerBtn = document.querySelector('#btn-floating-chat');
  const closeBtn = document.querySelector('#btn-floating-chat-close');
  const expandBtn = document.querySelector('#btn-floating-chat-expand');
  const panelEl = document.querySelector('#floating-chat-panel');
  const feedEl = document.querySelector('#floating-chat-messages');
  const formEl = document.querySelector('#floating-chat-form');
  const inputEl = document.querySelector('#floating-chat-input');
  const subLabel = rootEl.querySelector('.floating-chat-title small');

  const refreshMiniFeed = () => {
    const ch = getActiveChannel();
    const curUser = getCurrentUser();
    if (chatUiState.floatingOpen && curUser) {
      markChannelAsRead(ch.id, curUser.email);
    }

    if (subLabel && curUser) {
      subLabel.textContent = `Aktif: ${curUser.name} · ${ch.name}`;
    }
    if (feedEl) {
      feedEl.innerHTML = renderMessageListMarkup(ch.id, true);
      scrollFeedToBottom(feedEl);
    }
    rootEl.querySelectorAll('.floating-chat-tab[data-float-channel]').forEach(tab => {
      const isSel = tab.dataset.floatChannel === ch.id;
      tab.classList.toggle('active', isSel);
      tab.setAttribute('aria-selected', String(isSel));
    });

    syncChatUnreadBadges();
  };

  const setOpenState = (nextOpen) => {
    chatUiState.floatingOpen = Boolean(nextOpen);
    rootEl.classList.toggle('is-open', chatUiState.floatingOpen);
    triggerBtn?.setAttribute('aria-expanded', String(chatUiState.floatingOpen));
    panelEl?.setAttribute('aria-hidden', String(!chatUiState.floatingOpen));

    if (chatUiState.floatingOpen) {
      refreshMiniFeed();
      setTimeout(() => inputEl?.focus(), 60);
    }
  };

  if (chatUiState.floatingOpen) {
    refreshMiniFeed();
  }

  triggerBtn?.addEventListener('click', () => {
    setOpenState(!chatUiState.floatingOpen);
  });

  closeBtn?.addEventListener('click', () => {
    setOpenState(false);
  });

  expandBtn?.addEventListener('click', () => {
    chatUiState.floatingOpen = false;
    if (typeof navigateTo === 'function') {
      navigateTo('Diskusi Tim');
    }
  });

  rootEl.querySelectorAll('.floating-chat-tab[data-float-channel]').forEach(tab => {
    tab.addEventListener('click', () => {
      const chId = tab.dataset.floatChannel;
      if (!chId) return;
      chatUiState.activeChannelId = chId;
      refreshMiniFeed();
      inputEl?.focus();
    });
  });

  formEl?.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = inputEl?.value?.trim() || '';
    if (!text) return;

    const sent = sendChatMessage({
      channelId: chatUiState.activeChannelId,
      text,
    });

    if (sent) {
      if (inputEl) inputEl.value = '';
      refreshMiniFeed();
      inputEl?.focus();
    } else if (typeof showToast === 'function') {
      showToast('Gagal mengirim pesan: pastikan sesi pengguna aktif.');
    }
  });
}

