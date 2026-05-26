function renderWH() {
  const q    = (document.getElementById('sWH') || {}).value || '';
  const data = aggWH(filtered).filter(r => r.warehouse.toLowerCase().includes(q.toLowerCase()));
  document.getElementById('infoWH').textContent = `แสดง ${data.length} คลัง`;

  paginate('bWH', 'pgWH', data, pages.wh, p => { pages.wh = p; renderWH(); }, r => `
    <tr>
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
