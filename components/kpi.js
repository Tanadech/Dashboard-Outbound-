/* ─── Shared KPI card HTML builder ─── */
function buildKpiCard(c) {
  const valStyle = c.fs
    ? `font-size:${c.fs};line-height:1.4`
    : c.ml ? 'font-size:12px;line-height:1.5' : '';
  return `
    <div class="kpi-card ${c.c}">
      <div class="kpi-ico">${c.ico}</div>
      <div class="kpi-body">
        <div class="kpi-label">${c.label}</div>
        <div class="kpi-value" style="${valStyle}">${c.val}</div>
        <div class="kpi-sub">${c.sub}</div>
      </div>
    </div>`;
}

/* ─── Render KPI cards for all dashboard sections ─── */
function renderKPI() {
  if (!rawData.length) {
    document.getElementById('kpiMain').innerHTML = `
      <div class="empty" style="grid-column:1/-1">
        <div class="e-ico">📂</div>
        <h3>ยังไม่ได้โหลดข้อมูล</h3>
        <p>กรุณากดปุ่ม "นำเข้าไฟล์" ด้านบนขวา แล้วเลือกไฟล์ .xlsx / .xls / .csv</p>
      </div>`;
    return;
  }

  const totalAllDocs = new Set(filtered.map(r => r.docNo));
  const r008Set      = new Set(filtered.filter(r => r.shortage > 0 || r.overage > 0).map(r => r.docNo));
  const sh  = filtered.reduce((s, r) => s + r.shortage, 0);
  const ov  = filtered.reduce((s, r) => s + r.overage,  0);
  const tot = sh + ov;

  const wh = aggWH(filtered);
  const br = aggBR(filtered);
  const jt = aggJT(filtered);

  const whDocLines = wh.map(w => `${w.warehouse} : ${w.totalDocCount.toLocaleString()}`).join('<br>');
  const tWH = [...wh].sort((a, b) => b.r008DocCount - a.r008DocCount)[0] || { warehouse: 'N/A', r008DocCount: 0 };
  const tBR = [...br].sort((a, b) => b.r008DocCount - a.r008DocCount)[0] || { branch: 'N/A', r008DocCount: 0 };
  const tJT = [...jt].sort((a, b) => b.r008DocCount - a.r008DocCount)[0] || { jobType: 'N/A', r008DocCount: 0 };

  /* Overview KPIs — แถวที่ 1: เอกสารทั้งหมด, คลังแต่ละคลัง, เอกสารขาดเกิน
                      แถวที่ 2: ขาด+เกิน รวม, ขาด, เกิน, คลัง/สาขา/ประเภทงานปัญหาสูงสุด */
  const whCards = wh.map(w => ({ c: 'c-amber', ico: '🏭', label: `คลัง ${w.warehouse}`, val: w.totalDocCount.toLocaleString(), sub: 'เอกสารทั้งหมด' }));
  document.getElementById('kpiMain').innerHTML = [
    /* แถว 1 */
    { c: 'c-blue',   ico: '📄', label: 'เอกสารทั้งหมด',           val: totalAllDocs.size.toLocaleString(), sub: 'ใบ (ไม่ซ้ำ)' },
    ...whCards,
    { c: 'c-red',    ico: '🔴', label: 'เอกสารขาดเกิน',            val: r008Set.size.toLocaleString(),      sub: 'ใบ' },
    /* แถว 2 */
    { c: 'c-purple', ico: '⚠️', label: 'ขาด+เกิน รวม',            val: tot.toLocaleString(),               sub: 'ชิ้น' },
    { c: 'c-orange', ico: '📉', label: 'จำนวนขาด',                 val: sh.toLocaleString(),                sub: 'ชิ้น' },
    { c: 'c-teal',   ico: '📈', label: 'จำนวนเกิน',                 val: ov.toLocaleString(),                sub: 'ชิ้น' },
    { c: 'c-green',  ico: '🏆', label: 'คลังปัญหาสูงสุด',          val: tWH.warehouse,                      sub: `ขาดเกิน ${tWH.r008DocCount.toLocaleString()} ใบ` },
    { c: 'c-amber',  ico: '🏪', label: 'สาขาปัญหาสูงสุด',          val: short(tBR.branch, 18),              sub: `ขาดเกิน ${tBR.r008DocCount.toLocaleString()} ใบ` },
    { c: 'c-purple', ico: '🔧', label: 'ประเภทงานปัญหาสูงสุด',     val: tJT.jobType,                        sub: `ขาดเกิน ${tJT.r008DocCount.toLocaleString()} ใบ` }
  ].map(buildKpiCard).join('');

  /* Warehouse KPIs */
  const topShWH    = topN(wh, 'shortageTotal', 1)[0] || { warehouse: '-', shortageTotal: 0 };
  const topOvWH    = topN(wh, 'overageTotal',  1)[0] || { warehouse: '-', overageTotal:  0 };
  const topIssueWH = topN(wh, 'issueTotal',    1)[0] || { warehouse: '-', issueTotal:    0 };
  document.getElementById('kpiWH').innerHTML = [
    { c: 'c-red',    ico: '📉', label: 'คลังขาดสูงสุด',      val: topShWH.warehouse,    sub: `ขาด ${topShWH.shortageTotal.toLocaleString()} ชิ้น` },
    { c: 'c-blue',   ico: '📈', label: 'คลังเกินสูงสุด',      val: topOvWH.warehouse,    sub: `เกิน ${topOvWH.overageTotal.toLocaleString()} ชิ้น` },
    { c: 'c-purple', ico: '⚠️', label: 'คลังปัญหารวมสูงสุด', val: topIssueWH.warehouse, sub: `ปัญหา ${topIssueWH.issueTotal.toLocaleString()} ชิ้น` }
  ].map(buildKpiCard).join('');

  /* Job Type KPIs */
  const jtByR008 = [...jt].sort((a, b) => b.r008DocCount - a.r008DocCount);
  document.getElementById('kpiJT').innerHTML = [
    { c: 'c-blue',   ico: '🔧', label: 'ประเภทงานทั้งหมด',              val: jt.length,                                                               sub: 'ประเภท' },
    { c: 'c-purple', ico: '🏆', label: 'ประเภทงานเอกสารขาดเกินสาขา สูงสุด',   val: jtByR008[0]?.jobType || '-',                                               sub: `${(jtByR008[0]?.r008DocCount || 0).toLocaleString()} ใบ` },
    { c: 'c-red',    ico: '📉', label: 'ขาดสูงสุดในประเภทงาน',           val: (topN(jt, 'shortageTotal', 1)[0]?.shortageTotal || 0).toLocaleString(),    sub: topN(jt, 'shortageTotal', 1)[0]?.jobType || '-' },
    { c: 'c-orange', ico: '📈', label: 'เกินสูงสุดในประเภทงาน',           val: (topN(jt, 'overageTotal',  1)[0]?.overageTotal  || 0).toLocaleString(),   sub: topN(jt, 'overageTotal',  1)[0]?.jobType || '-' }
  ].map(buildKpiCard).join('');

  /* Cause KPIs */
  const ca    = aggCA(filtered);
  const tCA   = ca[0] || { cause: '-', r008DocCount: 0 };
  const tCAsh = topN(ca, 'shortageTotal', 1)[0] || { cause: '-', shortageTotal: 0 };
  const tCAov = topN(ca, 'overageTotal',  1)[0] || { cause: '-', overageTotal:  0 };
  document.getElementById('kpiCA').innerHTML = [
    { c: 'c-blue',   ico: '⚠️', label: 'สาเหตุทั้งหมด',               val: ca.length,                                    sub: 'สาเหตุ' },
    { c: 'c-purple', ico: '🏆', label: 'สาเหตุเอกสารขาดเกิน สูงสุด',   val: short(tCA.cause, 20),                         sub: `${tCA.r008DocCount.toLocaleString()} ใบ` },
    { c: 'c-red',    ico: '📉', label: 'ขาดสูงสุดตามสาเหตุ',            val: (tCAsh.shortageTotal || 0).toLocaleString(),  sub: short(tCAsh.cause, 18) },
    { c: 'c-teal',   ico: '📈', label: 'เกินสูงสุดตามสาเหตุ',            val: (tCAov.overageTotal  || 0).toLocaleString(),  sub: short(tCAov.cause, 18) }
  ].map(buildKpiCard).join('');

  /* Recorder KPIs */
  const rec    = aggREC(filtered);
  const tREC   = rec[0] || { recorder: '-', r008DocCount: 0 };
  const tRECS  = [...rec].sort((a, b) => b.shortageTotal - a.shortageTotal)[0] || { recorder: '-', shortageTotal: 0 };
  const tRECO  = [...rec].sort((a, b) => b.overageTotal  - a.overageTotal)[0]  || { recorder: '-', overageTotal:  0 };
  const tRECT  = [...rec].sort((a, b) => b.issueTotal    - a.issueTotal)[0]    || { recorder: '-', issueTotal:    0 };
  document.getElementById('kpiREC').innerHTML = [
    { c: 'c-red',    ico: '🏆', label: 'เอกสารขาดเกินสาขา สูงสุด', val: short(tREC.recorder,  20), sub: `${tREC.r008DocCount.toLocaleString()} ใบ` },
    { c: 'c-orange', ico: '📉', label: 'ขาดสูงสุด',                 val: short(tRECS.recorder, 20), sub: `${(tRECS.shortageTotal || 0).toLocaleString()} ชิ้น` },
    { c: 'c-teal',   ico: '📈', label: 'เกินสูงสุด',                 val: short(tRECO.recorder, 20), sub: `${(tRECO.overageTotal  || 0).toLocaleString()} ชิ้น` },
    { c: 'c-purple', ico: '⚠️', label: 'ปัญหารวมสูงสุด',            val: short(tRECT.recorder, 20), sub: `${(tRECT.issueTotal    || 0).toLocaleString()} ชิ้น` }
  ].map(buildKpiCard).join('');
}
