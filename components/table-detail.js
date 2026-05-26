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
    <tr style="cursor:pointer" onclick="openDTModal('${r.docNo.replace(/'/g, "\\'")}')">
      <td>${r.docNo}</td>
      <td><span class="bp bp-orange">${r.warehouse}</span></td>
      <td>${r.branch}</td>
      <td>${r.jobType}</td>
      <td class="num">${r.shortage > 0 ? `<span class="bp bp-red">${r.shortage.toLocaleString()}</span>` : '0'}</td>
      <td class="num">${r.overage  > 0 ? `<span class="bp bp-blue">${r.overage.toLocaleString()}</span>` : '0'}</td>
      <td class="num">${r.total    > 0 ? `<span class="bp ${totalBadgeCls}">${r.total.toLocaleString()}</span>` : '0'}</td>
      <td>${r.cause}</td>
      <td>${isR008 ? '<span class="bp bp-red">ขาดเกิน</span>' : '<span class="bp bp-green">ปกติ</span>'}</td>
    </tr>`;
  });
}

function openDTModal(docNo) {
  const rows = filtered.filter(r => r.docNo === docNo);
  const totalSh = rows.reduce((s, r) => s + r.shortage, 0);
  const totalOv = rows.reduce((s, r) => s + r.overage,  0);
  const dateStr = fmtDate(rows.find(r => r.queueDate)?.queueDate || null);

  document.getElementById('dtModalTitle').textContent = `📋 เลขที่เอกสาร: ${docNo}`;
  document.getElementById('dtModalSummary').innerHTML =
    `<span class="bp bp-gray">📅 ${dateStr}</span> &nbsp;` +
    `<span class="bp bp-red">ขาด ${totalSh.toLocaleString()} ชิ้น</span> &nbsp;` +
    `<span class="bp bp-blue">เกิน ${totalOv.toLocaleString()} ชิ้น</span> &nbsp;` +
    `<span class="row-info">${rows.length} รายการ</span>`;

  document.getElementById('dtModalBody').innerHTML = rows.map(r => {
    const isR008 = r.shortage > 0 || r.overage > 0;
    return `
    <tr>
      <td><span class="bp bp-orange">${r.warehouse}</span></td>
      <td>${r.branch}</td>
      <td>${r.jobType}</td>
      <td class="num">${r.shortage > 0 ? `<span class="bp bp-red">${r.shortage.toLocaleString()}</span>` : '—'}</td>
      <td class="num">${r.overage  > 0 ? `<span class="bp bp-blue">${r.overage.toLocaleString()}</span>` : '—'}</td>
      <td>${r.recorder || '—'}</td>
      <td>${r.cause}</td>
      <td>${isR008 ? '<span class="bp bp-red">ขาดเกิน</span>' : '<span class="bp bp-green">ปกติ</span>'}</td>
    </tr>`;
  }).join('');

  document.getElementById('dtModal').style.display = 'flex';
}

function closeDTModal(e) {
  if (!e || e.target === document.getElementById('dtModal')) {
    document.getElementById('dtModal').style.display = 'none';
  }
}
