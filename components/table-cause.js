let caModalData = [];

function renderCA() {
  const q    = (document.getElementById('sCA') || {}).value || '';
  const data = aggCA(filtered).filter(r => r.cause.toLowerCase().includes(q.toLowerCase()));
  document.getElementById('infoCA').textContent = `แสดง ${data.length} สาเหตุ`;

  paginate('bCA', 'pgCA', data, pages.ca, p => { pages.ca = p; renderCA(); }, r => `
    <tr style="cursor:pointer" onclick="openCAModal('${r.cause.replace(/'/g, "\\'")}')">
      <td>${r.cause}</td>
      <td class="num">${r.totalDocCount.toLocaleString()}</td>
      <td class="num"><span class="bp bp-red">${r.r008DocCount.toLocaleString()}</span></td>
      <td class="num"><span class="bp bp-orange">${r.shortageTotal.toLocaleString()}</span></td>
      <td class="num"><span class="bp bp-blue">${r.overageTotal.toLocaleString()}</span></td>
      <td class="num"><strong>${r.issueTotal.toLocaleString()}</strong></td>
      <td>${r.topWarehouse || '-'}</td>
      <td>${short(r.topBranch || '-', 20)}</td>
      <td>${r.topJobType || '-'}</td>
      <td><span class="bp ${r.riskCls}">${r.riskLabel}</span></td>
    </tr>`);
}

function openCAModal(ca) {
  const docs = {};
  filtered
    .filter(r => r.cause === ca && (r.shortage > 0 || r.overage > 0))
    .forEach(r => {
      if (!docs[r.docNo]) docs[r.docNo] = { docNo: r.docNo, sh: 0, ov: 0, warehouses: new Set(), branches: new Set(), jobTypes: new Set(), recorders: new Set() };
      docs[r.docNo].sh += r.shortage;
      docs[r.docNo].ov += r.overage;
      if (r.warehouse) docs[r.docNo].warehouses.add(r.warehouse);
      if (r.branch)    docs[r.docNo].branches.add(r.branch);
      if (r.jobType)   docs[r.docNo].jobTypes.add(r.jobType);
      if (r.recorder)  docs[r.docNo].recorders.add(r.recorder);
    });

  caModalData = Object.values(docs).map(d => ({
    docNo:     d.docNo,
    sh:        d.sh,
    ov:        d.ov,
    warehouse: [...d.warehouses].join(', '),
    branch:    [...d.branches].join(', '),
    jobType:   [...d.jobTypes].join(', '),
    recorder:  [...d.recorders].join(', ')
  })).sort((a, b) => a.docNo.localeCompare(b.docNo, 'th'));

  document.getElementById('caModalTitle').textContent = `📋 เอกสารสาเหตุ: ${ca}`;
  const s = document.getElementById('caModalSearch');
  if (s) s.value = '';
  renderCAModalRows();
  document.getElementById('caModal').style.display = 'flex';
}

function renderCAModalRows() {
  const q = (document.getElementById('caModalSearch') || {}).value || '';
  const rows = q ? caModalData.filter(d => d.docNo.toLowerCase().includes(q.toLowerCase())) : caModalData;
  document.getElementById('caModalInfo').textContent = `${rows.length.toLocaleString()} เอกสาร`;
  document.getElementById('caModalBody').innerHTML = rows.map(d => `
    <tr>
      <td>${d.docNo}</td>
      <td>${d.warehouse}</td>
      <td>${d.branch}</td>
      <td>${d.jobType}</td>
      <td class="num">${d.sh > 0 ? `<span class="bp bp-red">${d.sh.toLocaleString()}</span>` : '—'}</td>
      <td class="num">${d.ov > 0 ? `<span class="bp bp-blue">${d.ov.toLocaleString()}</span>` : '—'}</td>
      <td>${d.recorder || '—'}</td>
    </tr>`).join('');
}

function closeCAModal(e) {
  if (!e || e.target === document.getElementById('caModal')) {
    document.getElementById('caModal').style.display = 'none';
  }
}
