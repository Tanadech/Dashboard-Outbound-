let brModalData = [];

function renderBR() {
  const q    = (document.getElementById('sBR') || {}).value || '';
  const data = aggBR(filtered).filter(r => r.branch.toLowerCase().includes(q.toLowerCase()));
  document.getElementById('infoBR').textContent = `แสดง ${data.length} สาขา`;

  paginate('bBR', 'pgBR', data, pages.br, p => { pages.br = p; renderBR(); }, r => {
    const rankCls = r.rank === 1 ? 'r1' : r.rank === 2 ? 'r2' : r.rank === 3 ? 'r3' : 'rn';
    return `
    <tr style="cursor:pointer" onclick="openBRModal('${r.branch.replace(/'/g, "\\'")}')">
      <td><span class="rank-badge ${rankCls}">${r.rank}</span></td>
      <td>${r.branch}</td>
      <td><span class="bp bp-blue" style="font-size:10.5px">${r.warehouses || '-'}</span></td>
      <td>${r.topJobType || '-'}</td>
      <td class="num">${r.totalDocCount.toLocaleString()}</td>
      <td class="num"><span class="bp bp-red">${r.r008DocCount.toLocaleString()}</span></td>
      <td class="num"><span class="bp bp-orange">${r.shortageTotal.toLocaleString()}</span></td>
      <td class="num"><span class="bp bp-blue">${r.overageTotal.toLocaleString()}</span></td>
      <td class="num"><strong>${r.issueTotal.toLocaleString()}</strong></td>
      <td class="num">${r.percentage}%</td>
      <td><span class="bp ${r.riskCls}">${r.riskLabel}</span></td>
    </tr>`;
  });
}

function openBRModal(br) {
  const docs = {};
  filtered
    .filter(r => r.branch === br && (r.shortage > 0 || r.overage > 0))
    .forEach(r => {
      if (!docs[r.docNo]) docs[r.docNo] = { docNo: r.docNo, sh: 0, ov: 0, warehouses: new Set(), causes: new Set() };
      docs[r.docNo].sh += r.shortage;
      docs[r.docNo].ov += r.overage;
      if (r.warehouse) docs[r.docNo].warehouses.add(r.warehouse);
      if (r.cause)     docs[r.docNo].causes.add(r.cause);
    });

  brModalData = Object.values(docs).map(d => ({
    docNo:     d.docNo,
    sh:        d.sh,
    ov:        d.ov,
    warehouse: [...d.warehouses].join(', '),
    cause:     [...d.causes].join(', ')
  })).sort((a, b) => a.docNo.localeCompare(b.docNo, 'th'));

  document.getElementById('brModalTitle').textContent = `📋 เอกสารสาขา ${br}`;
  const s = document.getElementById('brModalSearch');
  if (s) s.value = '';
  renderBRModalRows();
  document.getElementById('brModal').style.display = 'flex';
}

function renderBRModalRows() {
  const q = (document.getElementById('brModalSearch') || {}).value || '';
  const rows = q
    ? brModalData.filter(d => d.docNo.toLowerCase().includes(q.toLowerCase()))
    : brModalData;

  document.getElementById('brModalInfo').textContent = `${rows.length.toLocaleString()} เอกสาร`;
  document.getElementById('brModalBody').innerHTML = rows.map(d => `
    <tr>
      <td>${d.docNo}</td>
      <td>${d.warehouse}</td>
      <td class="num">${d.sh > 0 ? `<span class="bp bp-red">${d.sh.toLocaleString()}</span>` : '—'}</td>
      <td class="num">${d.ov > 0 ? `<span class="bp bp-blue">${d.ov.toLocaleString()}</span>` : '—'}</td>
      <td>${d.cause}</td>
    </tr>`).join('');
}

function closeBRModal(e) {
  if (!e || e.target === document.getElementById('brModal')) {
    document.getElementById('brModal').style.display = 'none';
  }
}
