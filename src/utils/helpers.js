/**
 * Helper utilities ringan (tanpa dependency eksternal)
 */

export function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function parseLocalDate(dateStr) {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return new Date(dateStr);
  }
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatShortDateId(dateStr) {
  const d = parseLocalDate(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr || '—';
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

export function formatScheduleTileDate(dateStr) {
  const d = parseLocalDate(dateStr);
  if (Number.isNaN(d.getTime())) return '16 OKT';
  const day = d.getDate();
  const month = d.toLocaleDateString('id-ID', { month: 'short' }).replace('.', '').toUpperCase();
  return `${day} ${month}`;
}

export function isValidHttpUrl(value) {
  if (!value || typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!/^https?:\/\//i.test(trimmed)) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function normalizePlatformClass(platform) {
  const p = String(platform || '').toLowerCase();
  if (p === 'instagram') return 'plat-instagram';
  if (p === 'tiktok') return 'plat-tiktok';
  if (p === 'youtube') return 'plat-youtube';
  return '';
}


