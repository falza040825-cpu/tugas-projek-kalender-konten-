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

