/* ─── Shared KPI card HTML builder ─── */
function buildKpiCard(c) {
  const valStyle = c.fs
    ? `font-size:${c.fs};line-height:1.7`
    : c.ml ? 'font-size:15px;line-height:1.8' : '';
  return `
    <div class="kpi-card ${c.c}" data-ico="${c.ico}">
      <div class="kpi-label">${c.label}</div>
      <div class="kpi-value" style="${valStyle}">${c.val}</div>
      <div class="kpi-sub">${c.sub}</div>
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

  document.getElementById('overviewSub').textContent =
    `รายการ ${filtered.length.toLocaleString()} รายการ | เอกสารทั้งหมด ${totalAllDocs.size.toLocaleString()} ใบ | เอกสารขาดเกิน ${r008Set.size.toLocaleString()} ใบ`;

  /* Overview KPIs */
  document.getElementById('kpiMain').innerHTML = [
    { c: 'c-blue',   ico: '📄', label: 'จำนวนเอกสารทั้งหมด',              val: totalAllDocs.size.toLocaleString(), sub: 'เอกสาร (ไม่ซ้ำ)' },
    { c: 'c-red',    ico: '🔴', label: 'จำนวนเอกสารขาดเกิน',                 val: r008Set.size.toLocaleString(),      sub: 'เอกสารที่มีขาด/เกิน' },
    { c: 'c-orange', ico: '📉', label: 'ขาด / เกิน รวม',
      val: `📉 ขาด : ${sh.toLocaleString()} ชิ้น<br>📈 เกิน : ${ov.toLocaleString()} ชิ้น`,
      sub: 'จำนวนชิ้นรวมทั้งหมด', fs: '20px' },
    { c: 'c-purple', ico: '⚠️', label: 'จำนวนสินค้าขาดเกินทั้งหมด',       val: tot.toLocaleString(),               sub: 'ชิ้น' },
    { c: 'c-amber',  ico: '🏭', label: 'เอกสารตามคลัง',                    val: whDocLines,                         sub: 'จำนวนเอกสารทั้งหมดต่อคลัง', ml: true },
    { c: 'c-green',  ico: '🏆', label: 'คลังที่มีเอกสาร สูงสุด',                   val: tWH.warehouse,                      sub: `เอกสารขาดเกิน ${tWH.r008DocCount.toLocaleString()} ใบ` },
    { c: 'c-amber',  ico: '🏪', label: 'สาขาที่มีเอกสาร สูงสุด',                   val: short(tBR.branch, 18),              sub: `เอกสารขาดเกิน ${tBR.r008DocCount.toLocaleString()} ใบ` },
    { c: 'c-purple', ico: '🔧', label: 'ประเภทงานที่มีเอกสาร สูงสุด',             val: tJT.jobType,                        sub: `เอกสารขาดเกิน ${tJT.r008DocCount.toLocaleString()} ใบ` }
  ].map(buildKpiCard).join('');

  /* Warehouse KPIs */
  document.getElementById('kpiWH').innerHTML = [
    { c: 'c-red',    ico: '📉', label: 'คลังขาดสูงสุด',       val: topN(wh, 'shortageTotal', 1)[0]?.warehouse || '-', sub: `ขาด ${(topN(wh, 'shortageTotal', 1)[0]?.shortageTotal || 0).toLocaleString()} ชิ้น` },
    { c: 'c-blue',   ico: '📈', label: 'คลังเกินสูงสุด',       val: topN(wh, 'overageTotal',  1)[0]?.warehouse || '-', sub: `เกิน ${(topN(wh, 'overageTotal', 1)[0]?.overageTotal || 0).toLocaleString()} ชิ้น` },
    { c: 'c-purple', ico: '⚠️', label: 'คลังปัญหารวมสูงสุด',  val: wh[0]?.warehouse || '-',                            sub: `ปัญหา ${(wh[0]?.issueTotal || 0).toLocaleString()} ชิ้น` }
  ].map(buildKpiCard).join('');

  /* Job Type KPIs */
  const jtByR008 = [...jt].sort((a, b) => b.r008DocCount - a.r008DocCount);
  document.getElementById('kpiJT').innerHTML = [
    { c: 'c-blue',   ico: '🔧', label: 'ประเภทงานทั้งหมด',              val: jt.length,                                                               sub: 'ประเภท' },
    { c: 'c-purple', ico: '🏆', label: 'ประเภทงานเอกสารขาดเกินสาขา สูงสุด',   val: jtByR008[0]?.jobType || '-',                                               sub: `${(jtByR008[0]?.r008DocCount || 0).toLocaleString()} ใบ` },
    { c: 'c-red',    ico: '📉', label: 'ขาดสูงสุดในประเภทงาน',           val: (topN(jt, 'shortageTotal', 1)[0]?.shortageTotal || 0).toLocaleString(),    sub: topN(jt, 'shortageTotal', 1)[0]?.jobType || '-' },
    { c: 'c-orange', ico: '📈', label: 'เกินสูงสุดในประเภทงาน',           val: (topN(jt, 'overageTotal',  1)[0]?.overageTotal  || 0).toLocaleString(),   sub: topN(jt, 'overageTotal',  1)[0]?.jobType || '-' }
  ].map(buildKpiCard).join('');

  /* Recorder KPIs */
  const rec    = aggREC(filtered);
  const tREC   = rec[0] || { recorder: '-', r008DocCount: 0 };
  const tRECS  = [...rec].sort((a, b) => b.shortageTotal - a.shortageTotal)[0] || { recorder: '-', shortageTotal: 0 };
  const tRECO  = [...rec].sort((a, b) => b.overageTotal  - a.overageTotal)[0]  || { recorder: '-', overageTotal:  0 };
  const tRECT  = [...rec].sort((a, b) => b.issueTotal    - a.issueTotal)[0]    || { recorder: '-', issueTotal:    0 };
  const avgR008 = rec.length > 0
    ? (rec.reduce((s, r) => s + r.r008DocCount, 0) / rec.length).toFixed(1) : '0';

  document.getElementById('kpiREC').innerHTML = [
    { c: 'c-red',    ico: '🏆', label: 'ผู้บันทึกที่มีเอกสารขาดเกินสาขา สูงสุด',  val: short(tREC.recorder,  20), sub: `เอกสารขาดเกินสาขา ${tREC.r008DocCount.toLocaleString()} ใบ` },
    { c: 'c-orange', ico: '📉', label: 'ผู้บันทึกที่มีจำนวนขาดสูงสุด',       val: short(tRECS.recorder, 20), sub: `ขาด ${(tRECS.shortageTotal || 0).toLocaleString()} ชิ้น` },
    { c: 'c-teal',   ico: '📈', label: 'ผู้บันทึกที่มีจำนวนเกินสูงสุด',       val: short(tRECO.recorder, 20), sub: `เกิน ${(tRECO.overageTotal || 0).toLocaleString()} ชิ้น` },
    { c: 'c-purple', ico: '⚠️', label: 'ผู้บันทึกที่มีปัญหารวมสูงสุด',        val: short(tRECT.recorder, 20), sub: `ปัญหา ${(tRECT.issueTotal || 0).toLocaleString()} ชิ้น` },
    { c: 'c-blue',   ico: '📊', label: 'ค่าเฉลี่ยขาดเกินสาขา ต่อผู้บันทึก',         val: avgR008,                   sub: 'เอกสาร/คน' }
  ].map(buildKpiCard).join('');
}
