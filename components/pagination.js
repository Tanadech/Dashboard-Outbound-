/* ─── Build an array of page numbers with ellipsis markers ─── */
function pgRange(cur, tot) {
  if (tot <= 7) return Array.from({ length: tot }, (_, i) => i + 1);
  const r = [1];
  if (cur > 3) r.push('…');
  for (let i = Math.max(2, cur - 1); i <= Math.min(tot - 1, cur + 1); i++) r.push(i);
  if (cur < tot - 2) r.push('…');
  r.push(tot);
  return r;
}

/* ─── Render a page of rows and the pagination controls ─── */
function paginate(bodyId, pgId, data, curPage, onPage, rowFn) {
  const total      = data.length;
  const totalPages = Math.max(1, Math.ceil(total / PS));
  const p          = Math.min(curPage, totalPages);
  const start      = (p - 1) * PS;
  const end        = Math.min(start + PS, total);

  const body = document.getElementById(bodyId);
  if (!body) return;
  body.innerHTML = total === 0
    ? `<tr><td colspan="20" style="text-align:center;padding:28px;color:#868e96;">ไม่พบข้อมูล</td></tr>`
    : data.slice(start, end).map(rowFn).join('');

  const pg = document.getElementById(pgId);
  if (!pg) return;

  const onPageStr = onPage.toString();
  let html = `<span class="pg-info">${(start + 1).toLocaleString()}–${end.toLocaleString()} / ${total.toLocaleString()}</span>`;
  html += `<button onclick="(${onPageStr})(${Math.max(1, p - 1)})" ${p <= 1 ? 'disabled' : ''}>‹</button>`;

  pgRange(p, totalPages).forEach(x => {
    if (x === '…') html += `<span style="padding:0 4px">…</span>`;
    else html += `<button class="${x === p ? 'cur' : ''}" onclick="(${onPageStr})(${x})">${x}</button>`;
  });

  html += `<button onclick="(${onPageStr})(${Math.min(totalPages, p + 1)})" ${p >= totalPages ? 'disabled' : ''}>›</button>`;
  pg.innerHTML = html;
}
