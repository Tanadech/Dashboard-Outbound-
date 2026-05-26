function renderREC() {
  const q    = (document.getElementById('sREC') || {}).value || '';
  const data = aggREC(filtered).filter(r => r.recorder.toLowerCase().includes(q.toLowerCase()));
  document.getElementById('infoREC').textContent = `แสดง ${data.length} คน`;

  paginate('bREC', 'pgREC', data, pages.rec, p => { pages.rec = p; renderREC(); }, r => `
    <tr>
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
