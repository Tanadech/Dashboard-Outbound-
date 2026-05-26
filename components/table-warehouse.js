function renderWH() {
  const q    = (document.getElementById('sWH') || {}).value || '';
  const data = aggWH(filtered).filter(r => r.warehouse.toLowerCase().includes(q.toLowerCase()));
  document.getElementById('infoWH').textContent = `แสดง ${data.length} คลัง`;

  paginate('bWH', 'pgWH', data, pages.wh, p => { pages.wh = p; renderWH(); }, r => `
    <tr style="cursor:pointer" onclick="openWHModal('${r.warehouse}')">
      <td><strong>${r.warehouse}</strong></td>
      <td class="num">${r.totalDocCount.toLocaleString()}</td>
      <td class="num"><span class="bp bp-red">${r.r008DocCount.toLocaleString()}</span></td>
      <td class="num"><span class="bp bp-orange">${r.shortageTotal.toLocaleString()}</span></td>
      <td class="num"><span class="bp bp-blue">${r.overageTotal.toLocaleString()}</span></td>
      <td class="num"><strong>${r.issueTotal.toLocaleString()}</strong></td>
      <td class="num">${r.percentage}%</td>
      <td><span class="bp ${r.riskCls}">${r.riskLabel}</span></td>
    </tr>`);
}

function openWHModal(wh) {
  const docs = {};
  filtered.filter(r => r.warehouse === wh).forEach(r => {
    if (!docs[r.docNo]) docs[r.docNo] = { docNo: r.docNo, sh: 0, ov: 0 };
    docs[r.docNo].sh += r.shortage;
    docs[r.docNo].ov += r.overage;
  });
  const rows = Object.values(docs).sort((a, b) => a.docNo.localeCompare(b.docNo, 'th'));

  document.getElementById('whModalTitle').textContent = `📋 เอกสารคลัง ${wh}`;
  document.getElementById('whModalInfo').textContent  = `${rows.length.toLocaleString()} เอกสาร`;
  document.getElementById('whModalBody').innerHTML = rows.map(d => `
    <tr>
      <td>${d.docNo}</td>
      <td class="num">${d.sh > 0 ? `<span class="bp bp-red">${d.sh.toLocaleString()}</span>` : '—'}</td>
      <td class="num">${d.ov > 0 ? `<span class="bp bp-blue">${d.ov.toLocaleString()}</span>` : '—'}</td>
    </tr>`).join('');

  document.getElementById('whModal').style.display = 'flex';
}

function closeWHModal(e) {
  if (!e || e.target === document.getElementById('whModal')) {
    document.getElementById('whModal').style.display = 'none';
  }
}
