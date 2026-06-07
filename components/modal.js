(function () {
  /* ── Section metadata ── */
  const SECTIONS = {
    'sec-warehouse': { title: '🏭 วิเคราะห์คลังสินค้า', ids: ['mWHBar','mWHRate','mWHDonut','mWHTimeline'] },
    'sec-branch':    { title: '🏪 วิเคราะห์สาขา',         ids: ['mBrTop','mBrBar'] },
    'sec-recorder':  { title: '👤 วิเคราะห์ผู้บันทึก',    ids: ['mRECTop','mRECBar'] },
    'sec-jobtype':   { title: '🧾 วิเคราะห์ประเภทงาน',     ids: ['mJTTop','mJTBar'] },
    'sec-cause':     { title: '⚠️ วิเคราะห์สาเหตุขาดเกิน', ids: ['mCATop','mCABar'] },
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

    // double-rAF + 80ms to let layout fully settle before chart measure
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        setTimeout(function () { renderModalCharts(sectionId); }, 80);
      });
    });
  };

  /* ── Close via overlay backdrop click ── */
  window.closeDrillModal = function (e) {
    if (e && e.target.id !== 'drillModal') return;
    _close();
  };

  /* ── Close via button ── */
  window.closeDrillModalBtn = function () { _close(); };

  /* ── Navigate to full section ── */
  window.goToDrillSection = function () {
    const s = _section;
    _close();
    if (s) {
      const hash = '#' + s;
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

  /* ─────────────────────────────────────────
     HTML builders for each section popup
  ───────────────────────────────────────── */
  function buildBody(sectionId) {
    if (sectionId === 'sec-warehouse') return bodyWH();
    if (sectionId === 'sec-branch')    return bodyBR();
    if (sectionId === 'sec-recorder')  return bodyREC();
    if (sectionId === 'sec-jobtype')   return bodyJT();
    if (sectionId === 'sec-cause')     return bodyCA();
    return '';
  }

  function chart2col(cards) {
    return '<div class="dm-charts">' + cards.join('') + '</div>';
  }
  function chartCard(id, title) {
    return '<div class="dm-chart-card"><h3>' + title + '</h3><div class="dm-chart-box"><div id="' + id + '"></div></div></div>';
  }

  function bodyWH() {
    return chart2col([
        chartCard('mWHBar',  '📊 ขาด / เกิน (ชิ้น) แยกตามคลัง'),
        chartCard('mWHRate', '📈 % เอกสารขาดเกิน ต่อเอกสารทั้งหมด'),
      ]) +
      chart2col([
        chartCard('mWHDonut', '🍩 สัดส่วนเอกสารขาดเกินตามคลัง'),
        '<div class="dm-chart-card"><h3>📅 เปรียบเทียบรายเดือน (เอกสารทั้งหมด / ขาด / เกิน)</h3>' +
          '<div class="dm-chart-box" id="mWHTimelineBox"><div id="mWHTimeline"></div></div></div>',
      ]) +
      tblWH();
  }

  function bodyBR() {
    return chart2col([
        chartCard('mBrTop', '🏪 Top 10 สาขาที่มีปัญหาสูงสุด (ใบ)'),
        chartCard('mBrBar', '📊 ขาด / เกิน (ชิ้น) Top 10 สาขา'),
      ]) +
      tblBR();
  }

  function bodyREC() {
    return chart2col([
        chartCard('mRECTop', '👤 Top 10 ผู้บันทึกที่มีปัญหา (ใบ)'),
        chartCard('mRECBar', '📊 ขาด / เกิน (ชิ้น) Top 10 ผู้บันทึก'),
      ]) +
      tblREC();
  }

  function bodyJT() {
    return chart2col([
        chartCard('mJTTop', '🧾 ปัญหารวมตามประเภทงาน'),
        chartCard('mJTBar', '📊 ขาด / เกิน แยกตามประเภทงาน'),
      ]) +
      tblJT();
  }

  function bodyCA() {
    return chart2col([
        chartCard('mCATop', '⚠️ Top 10 สาเหตุปัญหา (ชิ้น)'),
        chartCard('mCABar', '📊 ขาด / เกิน แยกตามสาเหตุ'),
      ]) +
      tblCA();
  }

  /* ─────────────────────────────────────────
     Table builders — rows clickable → detail popup
  ───────────────────────────────────────── */
  function esc(s) { return String(s || '').replace(/'/g, "\\'"); }

  function tblWH() {
    const rows = aggWH(filtered).map(function (v) {
      return '<tr style="cursor:pointer" onclick="openWHModal(\'' + esc(v.warehouse) + '\')">' +
        '<td>' + v.warehouse + '</td>' +
        '<td class="num">' + v.totalDocCount.toLocaleString() + '</td>' +
        '<td class="num">' + v.r008DocCount.toLocaleString() + '</td>' +
        '<td class="num">' + v.shortageTotal.toLocaleString() + '</td>' +
        '<td class="num">' + v.overageTotal.toLocaleString() + '</td>' +
        '<td class="num">' + v.percentage + '%</td>' +
        '<td><span class="bp ' + v.riskCls + '">' + v.riskLabel + '</span></td>' +
        '</tr>';
    }).join('');
    return '<div class="dm-tbl-card"><h3>📋 สรุปจำนวนขาด/เกิน แยกตามคลังสินค้า <span class="dm-tbl-hint">คลิกแถวเพื่อดูเอกสาร</span></h3>' +
      '<table><thead><tr><th>คลัง</th><th class="num">เอกสารทั้งหมด</th><th class="num">ขาดเกิน (ใบ)</th>' +
      '<th class="num">จำนวนขาด</th><th class="num">จำนวนเกิน</th><th class="num">%</th><th>ความเสี่ยง</th>' +
      '</tr></thead><tbody>' + rows + '</tbody></table></div>';
  }

  function tblBR() {
    const top = topN(aggBR(filtered), 'r008DocCount', 15);
    const rows = top.map(function (v, i) {
      return '<tr style="cursor:pointer" onclick="openBRModal(\'' + esc(v.branch) + '\')">' +
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
    return '<div class="dm-tbl-card"><h3>📋 สรุปจำนวนขาด/เกิน แยกตามสาขา <span class="dm-tbl-hint">คลิกแถวเพื่อดูเอกสาร</span></h3>' +
      '<table><thead><tr><th>#</th><th>สาขา</th><th class="num">เอกสารทั้งหมด</th><th class="num">ขาดเกิน (ใบ)</th>' +
      '<th class="num">จำนวนขาด</th><th class="num">จำนวนเกิน</th><th class="num">%</th><th>ความเสี่ยง</th>' +
      '</tr></thead><tbody>' + rows + '</tbody></table></div>';
  }

  function tblREC() {
    const top = topN(aggREC(filtered), 'r008DocCount', 15);
    const rows = top.map(function (v, i) {
      return '<tr style="cursor:pointer" onclick="openRECModal(\'' + esc(v.recorder) + '\')">' +
        '<td>' + (i + 1) + '</td>' +
        '<td>' + v.recorder + '</td>' +
        '<td class="num">' + v.totalDocCount.toLocaleString() + '</td>' +
        '<td class="num">' + v.r008DocCount.toLocaleString() + '</td>' +
        '<td class="num">' + v.shortageTotal.toLocaleString() + '</td>' +
        '<td class="num">' + v.overageTotal.toLocaleString() + '</td>' +
        '<td class="num">' + v.percentage + '%</td>' +
        '</tr>';
    }).join('');
    return '<div class="dm-tbl-card"><h3>📋 สรุปผู้บันทึก <span class="dm-tbl-hint">คลิกแถวเพื่อดูเอกสาร</span></h3>' +
      '<table><thead><tr><th>#</th><th>ผู้บันทึก</th><th class="num">เอกสารทั้งหมด</th><th class="num">ขาดเกิน (ใบ)</th>' +
      '<th class="num">จำนวนขาด</th><th class="num">จำนวนเกิน</th><th class="num">%</th>' +
      '</tr></thead><tbody>' + rows + '</tbody></table></div>';
  }

  function tblJT() {
    const jt = aggJT(filtered);
    const rows = jt.map(function (v, i) {
      return '<tr style="cursor:pointer" onclick="openJTModal(\'' + esc(v.jobType) + '\')">' +
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
    return '<div class="dm-tbl-card"><h3>📋 สรุปตามประเภทงาน <span class="dm-tbl-hint">คลิกแถวเพื่อดูเอกสาร</span></h3>' +
      '<table><thead><tr><th>#</th><th>ประเภทงาน</th><th class="num">เอกสารทั้งหมด</th><th class="num">ขาดเกิน (ใบ)</th>' +
      '<th class="num">จำนวนขาด</th><th class="num">จำนวนเกิน</th><th class="num">%</th><th>ความเสี่ยง</th>' +
      '</tr></thead><tbody>' + rows + '</tbody></table></div>';
  }

  function tblCA() {
    const ca = aggCA(filtered).slice(0, 15);
    const rows = ca.map(function (v, i) {
      return '<tr style="cursor:pointer" onclick="openCAModal(\'' + esc(v.cause) + '\')">' +
        '<td>' + (i + 1) + '</td>' +
        '<td>' + v.cause + '</td>' +
        '<td class="num">' + v.totalDocCount.toLocaleString() + '</td>' +
        '<td class="num">' + v.r008DocCount.toLocaleString() + '</td>' +
        '<td class="num">' + v.shortageTotal.toLocaleString() + '</td>' +
        '<td class="num">' + v.overageTotal.toLocaleString() + '</td>' +
        '<td class="num">' + v.percentage + '%</td>' +
        '</tr>';
    }).join('');
    return '<div class="dm-tbl-card"><h3>📋 สรุปตามสาเหตุขาดเกิน <span class="dm-tbl-hint">คลิกแถวเพื่อดูเอกสาร</span></h3>' +
      '<table><thead><tr><th>#</th><th>สาเหตุ</th><th class="num">เอกสารทั้งหมด</th><th class="num">ขาดเกิน (ใบ)</th>' +
      '<th class="num">จำนวนขาด</th><th class="num">จำนวนเกิน</th><th class="num">%</th>' +
      '</tr></thead><tbody>' + rows + '</tbody></table></div>';
  }

  /* ─────────────────────────────────────────
     Chart renders — ApexCharts only for reliability
  ───────────────────────────────────────── */
  function renderModalCharts(sectionId) {
    if (!filtered || !filtered.length) return;

    if (sectionId === 'sec-warehouse') {
      const wh = aggWH(filtered);
      mkBarH('mWHBar',
        wh.map(function (d) { return d.warehouse; }),
        [{ name: 'จำนวนขาด', data: wh.map(function (d) { return d.shortageTotal; }) },
         { name: 'จำนวนเกิน', data: wh.map(function (d) { return d.overageTotal;  }) }],
        ['#e8590c', '#3b5bdb']);
      mkBarH('mWHRate',
        wh.map(function (d) { return d.warehouse; }),
        [{ name: '% เอกสารขาดเกิน', data: wh.map(function (d) { return parseFloat(d.percentage); }) }],
        ['#c92a2a'], '%');
      mkRadial('mWHDonut',
        wh.map(function (d) { return d.warehouse; }),
        wh.map(function (d) { return d.r008DocCount; }));
      const monthly = aggMonthly(filtered);
      if (monthly.months.length > 0) {
        mkMonthlyBar('mWHTimeline', monthly.months, monthly.series);
      } else {
        const box = document.getElementById('mWHTimelineBox');
        if (box) box.innerHTML =
          '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:#adb5bd;font-size:12px;gap:6px">' +
          '<span style="font-size:28px">📅</span>ไม่มีข้อมูลวันที่</div>';
      }
    }

    else if (sectionId === 'sec-branch') {
      const br        = aggBR(filtered);
      const brR10     = topN(br, 'r008DocCount', 10);
      const brTop10   = topN(br, 'issueTotal',   10);
      mkBarGradient('mBrTop',
        brR10.map(function (d) { return short(d.branch, 16); }),
        brR10.map(function (d) { return d.r008DocCount; }),
        'เอกสารขาดเกิน (ใบ)', '#0c8599');
      mkBarH('mBrBar',
        brTop10.map(function (d) { return short(d.branch, 16); }),
        [{ name: 'จำนวนขาด', data: brTop10.map(function (d) { return d.shortageTotal; }) },
         { name: 'จำนวนเกิน', data: brTop10.map(function (d) { return d.overageTotal;  }) }],
        ['#e8590c', '#3b5bdb']);
    }

    else if (sectionId === 'sec-recorder') {
      const rec   = aggREC(filtered);
      const recT10 = topN(rec, 'r008DocCount', 10);
      const recI10 = topN(rec, 'issueTotal',   10);
      mkBarGradient('mRECTop',
        recT10.map(function (d) { return short(d.recorder, 16); }),
        recT10.map(function (d) { return d.r008DocCount; }),
        'เอกสารขาดเกิน (ใบ)', '#7048e8');
      mkBarH('mRECBar',
        recI10.map(function (d) { return short(d.recorder, 16); }),
        [{ name: 'จำนวนขาด', data: recI10.map(function (d) { return d.shortageTotal; }) },
         { name: 'จำนวนเกิน', data: recI10.map(function (d) { return d.overageTotal;  }) }],
        ['#e8590c', '#3b5bdb']);
    }

    else if (sectionId === 'sec-jobtype') {
      const jt = aggJT(filtered);
      mkBarH('mJTTop',
        jt.map(function (d) { return d.jobType; }),
        [{ name: 'ปัญหารวม', data: jt.map(function (d) { return d.issueTotal; }) }],
        ['#2f9e44']);
      mkBarH('mJTBar',
        jt.map(function (d) { return d.jobType; }),
        [{ name: 'จำนวนขาด', data: jt.map(function (d) { return d.shortageTotal; }) },
         { name: 'จำนวนเกิน', data: jt.map(function (d) { return d.overageTotal;  }) }],
        ['#e8590c', '#3b5bdb']);
    }

    else if (sectionId === 'sec-cause') {
      const ca      = aggCA(filtered);
      const caTop10 = topN(ca, 'issueTotal', 10);
      mkBarH('mCATop',
        caTop10.map(function (d) { return short(d.cause, 20); }),
        [{ name: 'ปัญหารวม (ชิ้น)', data: caTop10.map(function (d) { return d.issueTotal; }) }],
        ['#f59f00']);
      mkBarH('mCABar',
        caTop10.map(function (d) { return short(d.cause, 20); }),
        [{ name: 'จำนวนขาด', data: caTop10.map(function (d) { return d.shortageTotal; }) },
         { name: 'จำนวนเกิน', data: caTop10.map(function (d) { return d.overageTotal;  }) }],
        ['#e8590c', '#3b5bdb']);
    }
  }
})();
