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
    if (/^WH\d/i.test(name))    return parseInt(name.match(/\d+/)[0]); // WH1=1, WH2=2, WH3=3
    if (/SUM/i.test(name))      return 900;
    if (/โรงงาน/i.test(name))   return 950;
    if (/ไม่ระบุ/.test(name))   return 999;
    return 500;
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
