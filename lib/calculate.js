/* ─── Return top N items sorted descending by key ─── */
function topN(arr, key, n) {
  return [...arr].sort((a, b) => b[key] - a[key]).slice(0, n);
}

/* ─── Aggregate records by warehouse ─── */
function aggWH(data) {
  const m = {};
  data.forEach(r => {
    const wh = r.warehouse;
    if (!m[wh]) m[wh] = { warehouse: wh, totalDocs: new Set(), r008Docs: new Set(), sh: 0, ov: 0, tot: 0 };
    m[wh].totalDocs.add(r.docNo);
    if (r.shortage > 0 || r.overage > 0) m[wh].r008Docs.add(r.docNo);
    m[wh].sh  += r.shortage;
    m[wh].ov  += r.overage;
    m[wh].tot += r.total;
  });

  const arr = Object.values(m).map(v => ({
    warehouse:     v.warehouse,
    totalDocCount: v.totalDocs.size,
    r008DocCount:  v.r008Docs.size,
    shortageTotal: v.sh,
    overageTotal:  v.ov,
    issueTotal:    v.tot
  }));

  const whOrder = name => {
    if (/ไม่ระบุ/.test(name)) return 999;
    // Normalize: remove spaces, uppercase, sort comma-parts for consistent key
    const key = name.replace(/\s+/g, '').toUpperCase().split(',').sort().join(',');
    const map = { 'WH1': 1, 'WH2': 2, 'WH3': 3, 'WH1,WH2': 4, 'WH2,WH3': 5, 'WH1,WH3': 6 };
    return map[key] !== undefined ? map[key] : 500;
  };
  arr.sort((a, b) => whOrder(a.warehouse) - whOrder(b.warehouse));

  arr.forEach(v => {
    v.percentage = v.totalDocCount > 0
      ? (v.r008DocCount / v.totalDocCount * 100).toFixed(1) : '0.0';
    const rb = riskBadge(v.percentage);
    v.riskLabel = rb.label;
    v.riskCls   = rb.cls;
  });
  return arr;
}

/* ─── Aggregate docs by date × warehouse for timeline chart ─── */
function aggWHTime(data) {
  const byDate = {};

  data.forEach(r => {
    if (!r.queueDate) return;
    const d   = r.queueDate;
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const wh  = r.warehouse;
    if (!byDate[key])       byDate[key] = {};
    if (!byDate[key][wh])   byDate[key][wh] = { total: new Set(), r008: new Set() };
    byDate[key][wh].total.add(r.docNo);
    if (r.shortage > 0 || r.overage > 0) byDate[key][wh].r008.add(r.docNo);
  });

  const dates = Object.keys(byDate).sort();
  const whSet = new Set(data.filter(r => r.queueDate).map(r => r.warehouse));
  const whList = [...whSet].sort();

  const totalSeries = whList.map(wh => ({
    name: `${wh} (ปกติ)`,
    type: 'bar',
    data: dates.map(dt => (byDate[dt][wh]?.total.size || 0) - (byDate[dt][wh]?.r008.size || 0)),
  }));
  const issueSeries = whList.map(wh => ({
    name: `${wh} (เสียหาย)`,
    type: 'line',
    data: dates.map(dt => byDate[dt][wh]?.r008.size || 0),
  }));

  return { dates, series: [...totalSeries, ...issueSeries], whList };
}

/* ─── Aggregate records by branch ─── */
function aggBR(data) {
  const m = {};
  data.forEach(r => {
    if (!m[r.branch]) m[r.branch] = {
      branch: r.branch, totalDocs: new Set(), r008Docs: new Set(),
      whMap: {}, jtMap: {}, sh: 0, ov: 0, tot: 0
    };
    const b = m[r.branch];
    b.totalDocs.add(r.docNo);
    if (r.shortage > 0 || r.overage > 0) b.r008Docs.add(r.docNo);
    b.whMap[r.warehouse] = (b.whMap[r.warehouse] || 0) + 1;
    b.jtMap[r.jobType] = (b.jtMap[r.jobType] || 0) + 1;
    b.sh  += r.shortage;
    b.ov  += r.overage;
    b.tot += r.total;
  });

  const arr = Object.values(m).map(v => {
    const topJT  = Object.entries(v.jtMap).sort((a, b) => b[1] - a[1])[0] || [''];
    const topJTs = Object.entries(v.jtMap).sort((a, b) => b[1] - a[1]).slice(0, 3);
    const whs    = [...new Set(Object.keys(v.whMap))].join(', ');
    return {
      branch:        v.branch,
      totalDocCount: v.totalDocs.size,
      r008DocCount:  v.r008Docs.size,
      warehouses:    whs,
      topJobType:    topJT[0],
      topJobTypes:   topJTs,
      shortageTotal: v.sh,
      overageTotal:  v.ov,
      issueTotal:    v.tot
    };
  });

  arr.forEach(v => {
    v.percentage = v.totalDocCount > 0
      ? (v.r008DocCount / v.totalDocCount * 100).toFixed(1) : '0.0';
    const rb = riskBadge(v.percentage);
    v.riskLabel = rb.label;
    v.riskCls   = rb.cls;
  });
  arr.sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage));
  arr.forEach((v, i) => { v.rank = i + 1; });
  return arr;
}

/* ─── Aggregate records by job type ─── */
function aggJT(data) {
  const m = {};
  data.forEach(r => {
    if (!m[r.jobType]) m[r.jobType] = {
      jobType: r.jobType, totalDocs: new Set(), r008Docs: new Set(),
      whMap: {}, brMap: {}, sh: 0, ov: 0, tot: 0
    };
    const v = m[r.jobType];
    v.totalDocs.add(r.docNo);
    if (r.shortage > 0 || r.overage > 0) v.r008Docs.add(r.docNo);
    v.whMap[r.warehouse] = (v.whMap[r.warehouse] || 0) + 1;
    v.brMap[r.branch] = (v.brMap[r.branch] || 0) + 1;
    v.sh  += r.shortage;
    v.ov  += r.overage;
    v.tot += r.total;
  });

  const arr = Object.values(m).map(v => {
    const tWH = Object.entries(v.whMap).sort((a, b) => b[1] - a[1])[0] || [''];
    const tBR = Object.entries(v.brMap).sort((a, b) => b[1] - a[1])[0] || [''];
    return {
      jobType:       v.jobType,
      totalDocCount: v.totalDocs.size,
      r008DocCount:  v.r008Docs.size,
      shortageTotal: v.sh,
      overageTotal:  v.ov,
      issueTotal:    v.tot,
      topWarehouse:  tWH[0],
      topBranch:     tBR[0]
    };
  });

  arr.sort((a, b) => b.r008DocCount - a.r008DocCount);
  arr.forEach(v => {
    v.percentage = v.totalDocCount > 0
      ? (v.r008DocCount / v.totalDocCount * 100).toFixed(1) : '0.0';
    const rb = riskBadge(v.percentage);
    v.riskLabel = rb.label;
    v.riskCls   = rb.cls;
  });
  return arr;
}

/* ─── Aggregate records by R008 cause ─── */
function aggCA(data) {
  const m = {};
  data.forEach(r => {
    if (!m[r.cause]) m[r.cause] = {
      cause: r.cause, totalDocs: new Set(), r008Docs: new Set(),
      whMap: {}, brMap: {}, jtMap: {}, sh: 0, ov: 0, tot: 0
    };
    const v = m[r.cause];
    v.totalDocs.add(r.docNo);
    if (r.shortage > 0 || r.overage > 0) v.r008Docs.add(r.docNo);
    v.whMap[r.warehouse] = (v.whMap[r.warehouse] || 0) + 1;
    v.brMap[r.branch]  = (v.brMap[r.branch]  || 0) + 1;
    v.jtMap[r.jobType] = (v.jtMap[r.jobType] || 0) + 1;
    v.sh  += r.shortage;
    v.ov  += r.overage;
    v.tot += r.total;
  });

  const arr = Object.values(m).map(v => {
    const tWH = Object.entries(v.whMap).sort((a, b) => b[1] - a[1])[0] || [''];
    const tBR = Object.entries(v.brMap).sort((a, b) => b[1] - a[1])[0] || [''];
    const tJT = Object.entries(v.jtMap).sort((a, b) => b[1] - a[1])[0] || [''];
    return {
      cause:         v.cause,
      totalDocCount: v.totalDocs.size,
      r008DocCount:  v.r008Docs.size,
      shortageTotal: v.sh,
      overageTotal:  v.ov,
      issueTotal:    v.tot,
      topWarehouse:  tWH[0],
      topBranch:     tBR[0],
      topJobType:    tJT[0]
    };
  });

  arr.sort((a, b) => b.r008DocCount - a.r008DocCount);
  arr.forEach(v => {
    v.percentage = v.totalDocCount > 0
      ? (v.r008DocCount / v.totalDocCount * 100).toFixed(1) : '0.0';
    const rb = riskBadge(v.percentage);
    v.riskLabel = rb.label;
    v.riskCls   = rb.cls;
  });
  return arr;
}

/* ─── Aggregate records by recorder ─── */
function aggREC(data) {
  const m = {};
  data.forEach(r => {
    const rec = r.recorder || 'ไม่ระบุผู้บันทึก';
    if (!m[rec]) m[rec] = {
      recorder: rec, totalDocs: new Set(), r008Docs: new Set(),
      whMap: {}, brMap: {}, jtMap: {}, sh: 0, ov: 0, tot: 0
    };
    const v = m[rec];
    v.totalDocs.add(r.docNo);
    if (r.shortage > 0 || r.overage > 0) v.r008Docs.add(r.docNo);
    v.whMap[r.warehouse] = (v.whMap[r.warehouse] || 0) + 1;
    v.brMap[r.branch]  = (v.brMap[r.branch]  || 0) + 1;
    v.jtMap[r.jobType] = (v.jtMap[r.jobType] || 0) + 1;
    v.sh  += r.shortage;
    v.ov  += r.overage;
    v.tot += r.total;
  });

  const arr = Object.values(m).map(v => {
    const tWH = Object.entries(v.whMap).sort((a, b) => b[1] - a[1])[0] || [''];
    const tBR = Object.entries(v.brMap).sort((a, b) => b[1] - a[1])[0] || [''];
    const tJT = Object.entries(v.jtMap).sort((a, b) => b[1] - a[1])[0] || [''];
    return {
      recorder:      v.recorder,
      totalDocCount: v.totalDocs.size,
      r008DocCount:  v.r008Docs.size,
      shortageTotal: v.sh,
      overageTotal:  v.ov,
      issueTotal:    v.tot,
      topWarehouse:  tWH[0],
      topBranch:     tBR[0],
      topJobType:    tJT[0]
    };
  });

  arr.sort((a, b) => b.r008DocCount - a.r008DocCount);
  arr.forEach(v => {
    v.percentage = v.totalDocCount > 0
      ? (v.r008DocCount / v.totalDocCount * 100).toFixed(1) : '0.0';
    const rb = riskBadge(v.percentage);
    v.riskLabel = rb.label;
    v.riskCls   = rb.cls;
  });
  return arr;
}
