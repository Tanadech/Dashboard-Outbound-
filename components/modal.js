(function () {
  /* ── Section metadata: title + chart IDs to destroy on close ── */
  const SECTIONS = {
    'sec-warehouse': { title: '🏭 วิเคราะห์คลังสินค้า', ids: ['mWHBar','mWHRate','mWHDonut','mWHTimeline'] },
    'sec-branch':    { title: '🏪 วิเคราะห์สาขา',         ids: ['mBrTop','mBrStacked'] },
    'sec-recorder':  { title: '👤 วิเคราะห์ผู้บันทึก',    ids: ['mRECTop','mRECStacked'] },
    'sec-jobtype':   { title: '🧾 วิเคราะห์ประเภทงาน',     ids: ['mJTTop','mJTBar'] },
    'sec-cause':     { title: '⚠️ วิเคราะห์สาเหตุขาดเกิน', ids: ['mCATop','mCAStacked'] },
  };

  let _section = null;

  /* ── Open ── */
  window.openDrillModal = function (sectionId) {
    if (!filtered || !filtered.length) return;
    const meta = SECTIONS[sectionId];
    if (!meta) return;
    _section = sectionId;

    document.getElementById('drillModalTitle').textContent = meta.title;
    document.getElementById('drillModalBody').innerHTML = buildBody(sectionId);
    document.getElementById('drillModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';

    requestAnimationFrame(function () { renderModalCharts(sectionId); });
  };

  /* ── Close via overlay click ── */
  window.closeDrillModal = function (e) {
    if (e && e.target.id !== 'drillModal') return;
    _close();
  };

  /* ── Close via button ── */
  window.closeDrillModalBtn = function () { _close(); };

  /* ── Navigate to full section ── */
  window.goToDrillSection = function () {
    var s = _section;
    _close();
    if (s) {
      var hash = '#' + s;
      history.pushState(null, '', hash);
      if (typeof showPage === 'function') showPage(hash);
    }
  };

  function _close() {
    document.getElementById('drillModal').style.display = 'none';
    document.body.style.overflow = '';
    if (_section && SECTIONS[_section]) {
      SECTIONS[_section].ids.forEach(function (id) {
        if (charts[id] && charts[id].destroy) charts[id].destroy();
        delete charts[id];
      });
    }
    _section = null;
  }

  /* ── Build HTML body ── */
  function buildBody(sectionId) {
    if (sectionId === 'sec-warehouse') return bodyWH();
    if (sectionId === 'sec-branch')    return bodyBR();
    if (sectionId === 'sec-recorder')  return bodyREC();
    if (sectionId === 'sec-jobtype')   return bodyJT();
    if (sectionId === 'sec-cause')     return bodyCA();
    return '';
  }

  function bodyWH() {
    return (
      '<div class="dm-charts">' +
        '<div class="dm-chart-card"><h3>📊 ขาด / เกิน (ชิ้น) แยกตามคลัง</h3><div class="dm-chart-box"><div id="mWHBar"></div></div></div>' +
        '<div class="dm-chart-card"><h3>📈 % เอกสารขาดเกิน ต่อเอกสารทั้งหมด</h3><div class="dm-chart-box"><div id="mWHRate"></div></div></div>' +
      '</div>' +
      '<div class="dm-charts">' +
        '<div class="dm-chart-card"><h3>🍩 สัดส่วนเอกสารขาดเกินตามคลัง</h3><div class="dm-chart-box"><div id="mWHDonut"></div></div></div>' +
        '<div class="dm-chart-card"><h3>📅 Timeline (รายวัน — แสดงเมื่อมีข้อมูลวันที่)</h3><div class="dm-chart-box" id="mWHTimelineBox"><div id="mWHTimeline"></div></div></div>' +
      '</div>' +
      tblWH()
    );
  }

  function bodyBR() {
    return (
      '<div class="dm-charts">' +
        '<div class="dm-chart-card"><h3>🏪 Top 10 สาขาที่มีปัญหาสูงสุด</h3><div class="dm-chart-box"><div id="mBrTop"></div></div></div>' +
        '<div class="dm-chart-card"><h3>📊 ขาด / เกิน Top 10 สาขา</h3><div class="dm-chart-box"><div id="mBrStacked"></div></div></div>' +
      '</div>' +
      tblBR()
    );
  }

  function bodyREC() {
    return (
      '<div class="dm-charts">' +
        '<div class="dm-chart-card"><h3>👤 Top 10 ผู้บันทึกที่มีปัญหา</h3><div class="dm-chart-box"><div id="mRECTop"></div></div></div>' +
        '<div class="dm-chart-card"><h3>📊 ขาด / เกิน แยกตามผู้บันทึก</h3><div class="dm-chart-box"><div id="mRECStacked"></div></div></div>' +
      '</div>' +
      tblREC()
    );
  }

  function bodyJT() {
    return (
      '<div class="dm-charts">' +
        '<div class="dm-chart-card"><h3>🧾 ปัญหารวมตามประเภทงาน</h3><div class="dm-chart-box"><div id="mJTTop"></div></div></div>' +
        '<div class="dm-chart-card"><h3>📊 ขาด / เกิน แยกตามประเภทงาน</h3><div class="dm-chart-box"><div id="mJTBar"></div></div></div>' +
      '</div>' +
      tblJT()
    );
  }

  function bodyCA() {
    return (
      '<div class="dm-charts">' +
        '<div class="dm-chart-card"><h3>⚠️ Top 10 สาเหตุปัญหา</h3><div class="dm-chart-box"><div id="mCATop"></div></div></div>' +
        '<div class="dm-chart-card"><h3>📊 ขาด / เกิน แยกตามสาเหตุ</h3><div class="dm-chart-box"><div id="mCAStacked"></div></div></div>' +
      '</div>' +
      tblCA()
    );
  }

  /* ── Table builders ── */
  function tblWH() {
    var rows = aggWH(filtered).map(function (v) {
      return '<tr>' +
        '<td>' + v.warehouse + '</td>' +
        '<td class="num">' + v.totalDocCount.toLocaleString() + '</td>' +
        '<td class="num">' + v.r008DocCount.toLocaleString() + '</td>' +
        '<td class="num">' + v.shortageTotal.toLocaleString() + '</td>' +
        '<td class="num">' + v.overageTotal.toLocaleString() + '</td>' +
        '<td class="num">' + v.percentage + '%</td>' +
        '<td><span class="bp ' + v.riskCls + '">' + v.riskLabel + '</span></td>' +
      '</tr>';
    }).join('');
    return '<div class="dm-tbl-card"><h3>📋 สรุปตามคลังสินค้า</h3>' +
      '<table><thead><tr>' +
        '<th>คลัง</th><th class="num">เอกสารทั้งหมด</th><th class="num">ขาดเกิน (ใบ)</th>' +
        '<th class="num">จำนวนขาด</th><th class="num">จำนวนเกิน</th><th class="num">%</th><th>ความเสี่ยง</th>' +
      '</tr></thead><tbody>' + rows + '</tbody></table></div>';
  }

  function tblBR() {
    var top = topN(aggBR(filtered), 'r008DocCount', 15);
    var rows = top.map(function (v, i) {
      return '<tr>' +
        '<td>' + (i + 1) + '</td>' +
        '<td>' + v.branch + '</td>' +
        '<td class="num">' + v.totalDocCount.toLocaleString() + '</td>' +
        '<td class="num">' + v.r008DocCount.toLocaleString() + '</td>' +
        '<td class="num">' + v.shortageTotal.toLocaleString() + '</td>' +
        '<td class="num">' + v.overageTotal.toLocaleString() + '</td>' +
        '<td class="num">' + v.percentage + '%</td>' +
        '<td><span class="bp ' + v.riskCls + '">' + v.riskLabel + '</span></td>' +
      '</tr>';
    }).join('');
    return '<div class="dm-tbl-card"><h3>📋 Top 15 สาขาที่มีปัญหาสูงสุด</h3>' +
      '<table><thead><tr>' +
        '<th>#</th><th>สาขา</th><th class="num">เอกสารทั้งหมด</th><th class="num">ขาดเกิน (ใบ)</th>' +
        '<th class="num">จำนวนขาด</th><th class="num">จำนวนเกิน</th><th class="num">%</th><th>ความเสี่ยง</th>' +
      '</tr></thead><tbody>' + rows + '</tbody></table></div>';
  }

  function tblREC() {
    var top = topN(aggREC(filtered), 'r008DocCount', 15);
    var rows = top.map(function (v, i) {
      return '<tr>' +
        '<td>' + (i + 1) + '</td>' +
        '<td>' + v.recorder + '</td>' +
        '<td class="num">' + v.totalDocCount.toLocaleString() + '</td>' +
        '<td class="num">' + v.r008DocCount.toLocaleString() + '</td>' +
        '<td class="num">' + v.shortageTotal.toLocaleString() + '</td>' +
        '<td class="num">' + v.overageTotal.toLocaleString() + '</td>' +
        '<td class="num">' + v.percentage + '%</td>' +
      '</tr>';
    }).join('');
    return '<div class="dm-tbl-card"><h3>📋 Top 15 ผู้บันทึกที่มีปัญหาสูงสุด</h3>' +
      '<table><thead><tr>' +
        '<th>#</th><th>ผู้บันทึก</th><th class="num">เอกสารทั้งหมด</th><th class="num">ขาดเกิน (ใบ)</th>' +
        '<th class="num">จำนวนขาด</th><th class="num">จำนวนเกิน</th><th class="num">%</th>' +
      '</tr></thead><tbody>' + rows + '</tbody></table></div>';
  }

  function tblJT() {
    var jt = aggJT(filtered);
    var rows = jt.map(function (v, i) {
      return '<tr>' +
        '<td>' + (i + 1) + '</td>' +
        '<td>' + v.jobType + '</td>' +
        '<td class="num">' + v.totalDocCount.toLocaleString() + '</td>' +
        '<td class="num">' + v.r008DocCount.toLocaleString() + '</td>' +
        '<td class="num">' + v.shortageTotal.toLocaleString() + '</td>' +
        '<td class="num">' + v.overageTotal.toLocaleString() + '</td>' +
        '<td class="num">' + v.percentage + '%</td>' +
        '<td><span class="bp ' + v.riskCls + '">' + v.riskLabel + '</span></td>' +
      '</tr>';
    }).join('');
    return '<div class="dm-tbl-card"><h3>📋 สรุปตามประเภทงาน</h3>' +
      '<table><thead><tr>' +
        '<th>#</th><th>ประเภทงาน</th><th class="num">เอกสารทั้งหมด</th><th class="num">ขาดเกิน (ใบ)</th>' +
        '<th class="num">จำนวนขาด</th><th class="num">จำนวนเกิน</th><th class="num">%</th><th>ความเสี่ยง</th>' +
      '</tr></thead><tbody>' + rows + '</tbody></table></div>';
  }

  function tblCA() {
    var ca = aggCA(filtered).slice(0, 15);
    var rows = ca.map(function (v, i) {
      return '<tr>' +
        '<td>' + (i + 1) + '</td>' +
        '<td>' + v.cause + '</td>' +
        '<td class="num">' + v.totalDocCount.toLocaleString() + '</td>' +
        '<td class="num">' + v.r008DocCount.toLocaleString() + '</td>' +
        '<td class="num">' + v.shortageTotal.toLocaleString() + '</td>' +
        '<td class="num">' + v.overageTotal.toLocaleString() + '</td>' +
        '<td class="num">' + v.percentage + '%</td>' +
      '</tr>';
    }).join('');
    return '<div class="dm-tbl-card"><h3>📋 Top 15 สาเหตุที่พบบ่อย</h3>' +
      '<table><thead><tr>' +
        '<th>#</th><th>สาเหตุ</th><th class="num">เอกสารทั้งหมด</th><th class="num">ขาดเกิน (ใบ)</th>' +
        '<th class="num">จำนวนขาด</th><th class="num">จำนวนเกิน</th><th class="num">%</th>' +
      '</tr></thead><tbody>' + rows + '</tbody></table></div>';
  }

  /* ── Render charts into modal containers ── */
  function renderModalCharts(sectionId) {
    if (!filtered || !filtered.length) return;
    var scBoth = { x: { beginAtZero: true }, y: { beginAtZero: true } };

    if (sectionId === 'sec-warehouse') {
      var wh = aggWH(filtered);
      mkBarH('mWHBar', wh.map(function (d) { return d.warehouse; }), [
        { name: 'จำนวนขาด', data: wh.map(function (d) { return d.shortageTotal; }) },
        { name: 'จำนวนเกิน', data: wh.map(function (d) { return d.overageTotal; }) },
      ], ['#e8590c', '#3b5bdb']);
      mkBarH('mWHRate', wh.map(function (d) { return d.warehouse; }), [
        { name: '% เอกสารขาดเกิน', data: wh.map(function (d) { return parseFloat(d.percentage); }) },
      ], ['#c92a2a'], '%');
      mkRadial('mWHDonut', wh.map(function (d) { return d.warehouse; }), wh.map(function (d) { return d.r008DocCount; }));
      var whTime = aggWHTime(filtered);
      if (whTime.dates.length > 0) {
        mkWHTimeline('mWHTimeline', whTime.dates, whTime.series, whTime.whList);
      } else {
        var box = document.getElementById('mWHTimelineBox');
        if (box) box.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:#adb5bd;font-size:12px;gap:6px"><span style="font-size:28px">📅</span>ไม่มีข้อมูลวันที่คิวงาน</div>';
      }
    }

    else if (sectionId === 'sec-branch') {
      var br = aggBR(filtered);
      var brR008Top10 = topN(br, 'r008DocCount', 10);
      var brTop10     = topN(br, 'issueTotal',    10);
      mkBarGradient('mBrTop', brR008Top10.map(function (d) { return short(d.branch, 14); }),
        brR008Top10.map(function (d) { return d.r008DocCount; }), 'เอกสารขาดเกินสาขา', '#0c8599');
      mkChart('mBrStacked', 'bar', brTop10.map(function (d) { return short(d.branch, 14); }),
        [barDS('จำนวนขาด', brTop10.map(function (d) { return d.shortageTotal; }), 2),
         barDS('จำนวนเกิน', brTop10.map(function (d) { return d.overageTotal;  }), 0)],
        { scales: { x: { stacked: true, beginAtZero: true }, y: { stacked: true, beginAtZero: true } } });
    }

    else if (sectionId === 'sec-recorder') {
      var rec    = aggREC(filtered);
      var recT10 = topN(rec, 'r008DocCount', 10);
      var recI10 = topN(rec, 'issueTotal',   10);
      mkBarGradient('mRECTop', recT10.map(function (d) { return short(d.recorder, 16); }),
        recT10.map(function (d) { return d.r008DocCount; }), 'เอกสารขาดเกิน', '#7048e8');
      mkChart('mRECStacked', 'bar', recI10.map(function (d) { return short(d.recorder, 16); }),
        [barDS('จำนวนขาด', recI10.map(function (d) { return d.shortageTotal; }), 2),
         barDS('จำนวนเกิน', recI10.map(function (d) { return d.overageTotal;  }), 0)],
        { scales: { x: { stacked: true, beginAtZero: true }, y: { stacked: true, beginAtZero: true } } });
    }

    else if (sectionId === 'sec-jobtype') {
      var jt = aggJT(filtered);
      mkChart('mJTTop', 'bar', jt.map(function (d) { return d.jobType; }),
        [barDS('ปัญหารวม', jt.map(function (d) { return d.issueTotal; }), 1)],
        { indexAxis: 'y', scales: { x: { beginAtZero: true } } });
      mkChart('mJTBar', 'bar', jt.map(function (d) { return d.jobType; }),
        [barDS('จำนวนขาด', jt.map(function (d) { return d.shortageTotal; }), 2),
         barDS('จำนวนเกิน', jt.map(function (d) { return d.overageTotal;  }), 0)],
        { scales: scBoth });
    }

    else if (sectionId === 'sec-cause') {
      var ca      = aggCA(filtered);
      var caTop10 = topN(ca, 'issueTotal', 10);
      mkChart('mCATop', 'bar', caTop10.map(function (d) { return short(d.cause, 22); }),
        [barDS('ปัญหารวม', caTop10.map(function (d) { return d.issueTotal; }), 4)],
        { indexAxis: 'y', scales: { x: { beginAtZero: true } } });
      mkChart('mCAStacked', 'bar', caTop10.map(function (d) { return short(d.cause, 16); }),
        [barDS('จำนวนขาด', caTop10.map(function (d) { return d.shortageTotal; }), 2),
         barDS('จำนวนเกิน', caTop10.map(function (d) { return d.overageTotal;  }), 0)],
        { scales: { x: { stacked: true, beginAtZero: true }, y: { stacked: true, beginAtZero: true } } });
    }
  }
})();
