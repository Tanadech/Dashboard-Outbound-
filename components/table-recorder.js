let recModalData = [];

function renderREC() {
  const q    = (document.getElementById('sREC') || {}).value || '';
  const data = aggREC(filtered).filter(r => r.recorder.toLowerCase().includes(q.toLowerCase()));
  document.getElementById('infoREC').textContent = `แสดง ${data.length} คน`;

  paginate('bREC', 'pgREC', data, pages.rec, p => { pages.rec = p; renderREC(); }, r => `
    <tr style="cursor:pointer" onclick="openRECModal('${r.recorder.replace(/'/g, "\\'")}')">
      <td><strong>${r.recorder}</strong></td>
      <td class="num">${r.totalDocCount.toLocaleString()}</td>
      <td class="num"><span class="bp bp-red">${r.r008DocCount.toLocaleString()}</span></td>
      <td class="num"><span class="bp bp-orange">${r.shortageTotal.toLocaleString()}</span></td>
      <td class="num"><span class="bp bp-blue">${r.overageTotal.toLocaleString()}</span></td>
      <td class="num"><strong>${r.issueTotal.toLocaleString()}</strong></td>
      <td class="num">${r.percentage}%</td>
      <td><span class="bp ${r.riskCls}">${r.riskLabel}</span></td>
      <td>${r.topWarehouse || '-'}</td>
      <td>${short(r.topBranch || '-', 20)}</td>
      <td>${r.topJobType || '-'}</td>
    </tr>`);
}

function openRECModal(rec) {
  const docs = {};
  filtered
    .filter(r => r.recorder === rec && (r.shortage > 0 || r.overage > 0))
    .forEach(r => {
      if (!docs[r.docNo]) docs[r.docNo] = { docNo: r.docNo, sh: 0, ov: 0, warehouses: new Set(), branches: new Set(), jobTypes: new Set(), causes: new Set() };
      docs[r.docNo].sh += r.shortage;
      docs[r.docNo].ov += r.overage;
      if (r.warehouse) docs[r.docNo].warehouses.add(r.warehouse);
      if (r.branch)    docs[r.docNo].branches.add(r.branch);
      if (r.jobType)   docs[r.docNo].jobTypes.add(r.jobType);
      if (r.cause)     docs[r.docNo].causes.add(r.cause);
    });

  recModalData = Object.values(docs).map(d => ({
    docNo:     d.docNo,
    sh:        d.sh,
    ov:        d.ov,
    warehouse: [...d.warehouses].join(', '),
    branch:    [...d.branches].join(', '),
    jobType:   [...d.jobTypes].join(', '),
    cause:     [...d.causes].join(', ')
  })).sort((a, b) => a.docNo.localeCompare(b.docNo, 'th'));

  document.getElementById('recModalTitle').textContent = `📋 เอกสารผู้บันทึก: ${rec}`;
  const s = document.getElementById('recModalSearch');
  if (s) s.value = '';
  renderRECModalRows();
  document.getElementById('recModal').style.display = 'flex';
}

function renderRECModalRows() {
  const q = (document.getElementById('recModalSearch') || {}).value || '';
  const rows = q ? recModalData.filter(d => d.docNo.toLowerCase().includes(q.toLowerCase())) : recModalData;
  document.getElementById('recModalInfo').textContent = `${rows.length.toLocaleString()} เอกสาร`;
  document.getElementById('recModalBody').innerHTML = rows.map(d => `
    <tr>
      <td>${d.docNo}</td>
      <td>${d.warehouse}</td>
      <td>${d.branch}</td>
      <td>${d.jobType}</td>
      <td class="num">${d.sh > 0 ? `<span class="bp bp-red">${d.sh.toLocaleString()}</span>` : '—'}</td>
      <td class="num">${d.ov > 0 ? `<span class="bp bp-blue">${d.ov.toLocaleString()}</span>` : '—'}</td>
      <td>${d.cause}</td>
    </tr>`).join('');
}

function closeRECModal(e) {
  if (!e || e.target === document.getElementById('recModal')) {
    document.getElementById('recModal').style.display = 'none';
  }
}
