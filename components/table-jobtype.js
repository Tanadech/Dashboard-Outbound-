function renderJT() {
  const q    = (document.getElementById('sJT') || {}).value || '';
  const data = aggJT(filtered).filter(r => r.jobType.toLowerCase().includes(q.toLowerCase()));
  document.getElementById('infoJT').textContent = `แสดง ${data.length} ประเภท`;

  paginate('bJT', 'pgJT', data, pages.jt, p => { pages.jt = p; renderJT(); }, r => `
    <tr>
      <td>${r.jobType}</td>
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
