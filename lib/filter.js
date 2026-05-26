/* ─── Populate all dropdown filters from rawData ─── */
function populateFilters() {
  const WH = [...new Set(rawData.flatMap(r => r.warehouse.split(',').map(w => w.trim())))].sort();
  const BR = [...new Set(rawData.map(r => r.branch))].sort();
  const JT = [...new Set(rawData.map(r => r.jobType))].sort();
  const CA = [...new Set(rawData.map(r => r.cause))].sort();
  fillSel('fWH', WH);
  fillSel('fBR', BR);
  fillSel('fJT', JT);
  fillSel('fCA', CA);
}

/* ─── Rebuild a <select> options list, preserving current selection ─── */
function fillSel(id, items) {
  const sel = document.getElementById(id);
  const cur = sel.value;
  sel.innerHTML = '<option value="">ทั้งหมด</option>';
  items.forEach(item => {
    const o = document.createElement('option');
    o.value = item;
    o.textContent = item;
    sel.appendChild(o);
  });
  if (items.includes(cur)) sel.value = cur;
}

/* ─── Filter rawData by all active filter controls, then re-render ─── */
function applyFilters() {
  const fw     = document.getElementById('fWH').value;
  const fb     = document.getElementById('fBR').value;
  const fj     = document.getElementById('fJT').value;
  const fc     = document.getElementById('fCA').value;
  const fs     = document.getElementById('fSearch').value.toLowerCase().trim();
  const fdFrom = document.getElementById('fDateFrom')?.value;
  const fdTo   = document.getElementById('fDateTo')?.value;
  const dateFrom = fdFrom ? new Date(fdFrom)             : null;
  const dateTo   = fdTo   ? new Date(fdTo + 'T23:59:59') : null;

  filtered = rawData.filter(r => {
    const whs = r.warehouse.split(',').map(w => w.trim());
    if (fw && !whs.includes(fw))           return false;
    if (fb && r.branch  !== fb)            return false;
    if (fj && r.jobType !== fj)            return false;
    if (fc && r.cause   !== fc)            return false;
    if (fs && !(r.docNo + r.branch + r.warehouse + r.cause).toLowerCase().includes(fs)) return false;
    if (dateFrom && r.queueDate && r.queueDate < dateFrom) return false;
    if (dateTo   && r.queueDate && r.queueDate > dateTo)   return false;
    return true;
  });

  pages = { wh: 1, br: 1, jt: 1, ca: 1, rec: 1, dt: 1 };
  renderAll();
}

/* ─── Clear all filter controls and re-render ─── */
function resetFilters() {
  ['fWH', 'fBR', 'fJT', 'fCA'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('fSearch').value = '';
  const dFrom = document.getElementById('fDateFrom');
  const dTo   = document.getElementById('fDateTo');
  if (dFrom) dFrom.value = '';
  if (dTo)   dTo.value   = '';
  document.querySelectorAll('.btn-qf').forEach(b => b.classList.remove('active'));
  applyFilters();
}

/* ─── Set date range from a named preset, then apply filters ─── */
function setQuickDate(type, btn) {
  const now   = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const fmt   = d => d.toISOString().slice(0, 10);
  let from, to;

  if (type === 'today') {
    from = to = today;
  } else if (type === '7d') {
    from = new Date(today);
    from.setDate(from.getDate() - 6);
    to = today;
  } else if (type === 'month') {
    from = new Date(now.getFullYear(), now.getMonth(), 1);
    to   = today;
  } else if (type === 'prevmonth') {
    from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    to   = new Date(now.getFullYear(), now.getMonth(), 0);
  } else if (type === 'year') {
    from = new Date(now.getFullYear(), 0, 1);
    to   = today;
  } else {
    resetFilters();
    return;
  }

  document.getElementById('fDateFrom').value = fmt(from);
  document.getElementById('fDateTo').value   = fmt(to);
  document.querySelectorAll('.btn-qf').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  applyFilters();
}
