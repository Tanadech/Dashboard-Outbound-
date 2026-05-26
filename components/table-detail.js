/* ─── Toggle sort column/direction and re-render ─── */
function sdSort(col) {
  dtSort.dir = dtSort.col === col ? (dtSort.dir === 'asc' ? 'desc' : 'asc') : 'asc';
  dtSort.col = col;
  pages.dt = 1;
  renderDT();
}

function renderDT() {
  const q = (document.getElementById('sDT') || {}).value || '';
  let data = [...filtered].filter(r => {
    const haystack = (r.docNo + r.branch + r.warehouse + r.cause + r.jobType).toLowerCase();
    return !q || haystack.includes(q.toLowerCase());
  });

  const { col, dir } = dtSort;
  data.sort((a, b) => {
    const va = a[col], vb = b[col];
    if (typeof va === 'number') return dir === 'asc' ? va - vb : vb - va;
    return dir === 'asc'
      ? String(va).localeCompare(String(vb), 'th')
      : String(vb).localeCompare(String(va), 'th');
  });

  /* Update sort indicators on column headers */
  const colOrder = ['docNo', 'warehouse', 'branch', 'jobType', 'shortage', 'overage', 'total'];
  document.querySelectorAll('#tDetail th').forEach(th => {
    th.classList.remove('sort-asc', 'sort-desc');
    const colName = colOrder[th.cellIndex];
    if (colName && colName === dtSort.col) {
      th.classList.add(dtSort.dir === 'asc' ? 'sort-asc' : 'sort-desc');
    }
  });

  document.getElementById('infoDT').textContent = `แสดง ${data.length.toLocaleString()} รายการ`;

  paginate('bDT', 'pgDT', data, pages.dt, p => { pages.dt = p; renderDT(); }, r => {
    const isR008 = r.shortage > 0 || r.overage > 0;
    let totalBadgeCls = 'bp-gray';
    if (r.shortage > 0 && r.overage > 0) totalBadgeCls = 'bp-purple';
    else if (r.shortage > 0)              totalBadgeCls = 'bp-red';
    else if (r.overage > 0)              totalBadgeCls = 'bp-blue';

    return `
    <tr>
      <td>${r.docNo}</td>
      <td><span class="bp bp-orange">${r.warehouse}</span></td>
      <td>${r.branch}</td>
      <td>${r.jobType}</td>
      <td class="num">${r.shortage > 0 ? `<span class="bp bp-red">${r.shortage.toLocaleString()}</span>` : '0'}</td>
      <td class="num">${r.overage  > 0 ? `<span class="bp bp-blue">${r.overage.toLocaleString()}</span>` : '0'}</td>
      <td class="num">${r.total    > 0 ? `<span class="bp ${totalBadgeCls}">${r.total.toLocaleString()}</span>` : '0'}</td>
      <td>${r.cause}</td>
      <td>${isR008 ? '<span class="bp bp-red">R008</span>' : '<span class="bp bp-green">ปกติ</span>'}</td>
    </tr>`;
  });
}
