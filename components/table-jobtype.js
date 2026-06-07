let jtModalData = [];

function renderJT() {
  const q    = (document.getElementById('sJT') || {}).value || '';
  const data = aggJT(filtered).filter(r => r.jobType.toLowerCase().includes(q.toLowerCase()));
  document.getElementById('infoJT').textContent = `แสดง ${data.length} ประเภท`;

  paginate('bJT', 'pgJT', data, pages.jt, p => { pages.jt = p; renderJT(); }, r => `
    <tr style="cursor:pointer" onclick="openJTModal('${r.jobType.replace(/'/g, "\\'")}')">
      <td><strong>${r.jobType}</strong></td>
      <td class="num">${r.totalDocCount.toLocaleString()}</td>
      <td class="num"><span class="bp bp-red">${r.r008DocCount.toLocaleString()}</span></td>
      <td class="num"><span class="bp bp-orange">${r.shortageTotal.toLocaleString()}</span></td>
      <td class="num"><span class="bp bp-blue">${r.overageTotal.toLocaleString()}</span></td>
      <td class="num"><strong>${r.issueTotal.toLocaleString()}</strong></td>
      <td class="num">${r.percentage}%</td>
      <td>${r.topWarehouse || '-'}</td>
      <td>${short(r.topBranch || '-', 20)}</td>
      <td><span class="bp ${r.riskCls}">${r.riskLabel}</span></td>
    </tr>`);
}

function openJTModal(jt) {
  const docs = {};
  filtered
    .filter(r => r.jobType === jt && (r.shortage > 0 || r.overage > 0))
    .forEach(r => {
      if (!docs[r.docNo]) docs[r.docNo] = { docNo: r.docNo, sh: 0, ov: 0, date: r.queueDate, warehouses: new Set(), branches: new Set(), recorders: new Set(), causes: new Set() };
      docs[r.docNo].sh += r.shortage;
      docs[r.docNo].ov += r.overage;
      if (!docs[r.docNo].date && r.queueDate) docs[r.docNo].date = r.queueDate;
      if (r.warehouse) docs[r.docNo].warehouses.add(r.warehouse);
      if (r.branch)    docs[r.docNo].branches.add(r.branch);
      if (r.recorder)  docs[r.docNo].recorders.add(r.recorder);
      if (r.cause)     docs[r.docNo].causes.add(r.cause);
    });

  jtModalData = Object.values(docs).map(d => ({
    docNo:     d.docNo,
    date:      d.date,
    sh:        d.sh,
    ov:        d.ov,
    warehouse: [...d.warehouses].join(', '),
    branch:    [...d.branches].join(', '),
    recorder:  [...d.recorders].join(', '),
    cause:     [...d.causes].join(', ')
  })).sort((a, b) => a.docNo.localeCompare(b.docNo, 'th'));

  document.getElementById('jtModalTitle').textContent = `📋 เอกสารประเภทงาน: ${jt}`;
  const s = document.getElementById('jtModalSearch');
  if (s) s.value = '';
  renderJTModalRows();
  document.getElementById('jtModal').style.display = 'flex';
}

function renderJTModalRows() {
  const q = (document.getElementById('jtModalSearch') || {}).value || '';
  const rows = q ? jtModalData.filter(d => d.docNo.toLowerCase().includes(q.toLowerCase())) : jtModalData;
  document.getElementById('jtModalInfo').textContent = `${rows.length.toLocaleString()} เอกสาร`;
  document.getElementById('jtModalBody').innerHTML = rows.map(d => `
    <tr>
      <td>${d.docNo}</td>
      <td>${fmtDate(d.date)}</td>
      <td>${d.warehouse}</td>
      <td>${d.branch}</td>
      <td class="num">${d.sh > 0 ? `<span class="bp bp-red">${d.sh.toLocaleString()}</span>` : '—'}</td>
      <td class="num">${d.ov > 0 ? `<span class="bp bp-blue">${d.ov.toLocaleString()}</span>` : '—'}</td>
      <td>${d.recorder || '—'}</td>
      <td>${d.cause}</td>
    </tr>`).join('');
}

function closeJTModal(e) {
  if (!e || e.target === document.getElementById('jtModal')) {
    document.getElementById('jtModal').style.display = 'none';
  }
}
