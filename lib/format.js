/* ─── Parse a numeric string, treat non-numeric as 0 ─── */
function toN(v) {
  const n = parseFloat(String(v || '').replace(/,/g, ''));
  return isNaN(n) ? 0 : Math.abs(n);
}

/* ─── Truncate a string to n chars with ellipsis ─── */
function short(s, n = 18) {
  return s && s.length > n ? s.slice(0, n) + '…' : s || '';
}

/* ─── Map a percentage to a risk level badge descriptor ─── */
function riskBadge(pct) {
  const p = parseFloat(pct);
  if (p > 10) return { cls: 'bp-risk-vh', label: 'สูงมาก' };
  if (p > 6)  return { cls: 'bp-risk-h',  label: 'สูง' };
  if (p > 4)  return { cls: 'bp-risk-m',  label: 'ปานกลาง' };
  if (p > 3)  return { cls: 'bp-risk-w',  label: 'เฝ้าระวัง' };
  return        { cls: 'bp-risk-l',  label: 'ดีเยี่ยม' };
}
