function renderBR() {
  const q    = (document.getElementById('sBR') || {}).value || '';
  const data = aggBR(filtered).filter(r => r.branch.toLowerCase().includes(q.toLowerCase()));
  document.getElementById('infoBR').textContent = `แสดง ${data.length} สาขา`;

  paginate('bBR', 'pgBR', data, pages.br, p => { pages.br = p; renderBR(); }, r => {
    const rankCls = r.rank === 1 ? 'r1' : r.rank === 2 ? 'r2' : r.rank === 3 ? 'r3' : 'rn';
    return `
    <tr>
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
