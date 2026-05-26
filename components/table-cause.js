function renderCA() {
  const q    = (document.getElementById('sCA') || {}).value || '';
  const data = aggCA(filtered).filter(r => r.cause.toLowerCase().includes(q.toLowerCase()));
  document.getElementById('infoCA').textContent = `แสดง ${data.length} สาเหตุ`;

  paginate('bCA', 'pgCA', data, pages.ca, p => { pages.ca = p; renderCA(); }, r => `
    <tr>
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
