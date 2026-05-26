Chart.register(ChartDataLabels);

/* ─── Build datalabels plugin config based on chart type ─── */
function buildDL(type, isHorizontal, isDoughnut, isStacked) {
  if (isDoughnut) {
    return {
      formatter: (v, ctx) => {
        const tot = ctx.chart.data.datasets[0].data.reduce((a, b) => a + (b || 0), 0);
        if (!tot || !v) return '';
        const pct = (v / tot * 100).toFixed(1);
        return parseFloat(pct) >= 5 ? `${pct}%\n${v.toLocaleString()}` : '';
      },
      font: { family: 'Sarabun', size: 10, weight: '600' },
      color: '#fff',
      textAlign: 'center',
      display: ctx => {
        const tot = ctx.chart.data.datasets[0].data.reduce((a, b) => a + (b || 0), 0);
        return tot > 0 && (ctx.dataset.data[ctx.dataIndex] || 0) / tot * 100 >= 5;
      }
    };
  }

  if (isStacked) {
    return {
      anchor: 'center', align: 'center',
      formatter: v => v > 0 ? v.toLocaleString() : null,
      font: { family: 'Sarabun', size: 9, weight: '700' },
      color: '#fff',
      display: ctx => (ctx.dataset.data[ctx.dataIndex] || 0) > 0
    };
  }

  if (isHorizontal) {
    return {
      anchor: 'end', align: 'right', offset: 4,
      formatter: v => v > 0 ? v.toLocaleString() : null,
      font: { family: 'Sarabun', size: 10, weight: '600' },
      color: '#495057',
      display: ctx => (ctx.dataset.data[ctx.dataIndex] || 0) > 0
    };
  }

  return {
    anchor: 'end', align: 'top', offset: 2,
    formatter: v => v > 0 ? v.toLocaleString() : null,
    font: { family: 'Sarabun', size: 10, weight: '600' },
    color: '#495057',
    clamp: true,
    display: ctx => (ctx.dataset.data[ctx.dataIndex] || 0) > 0
  };
}

/* ─── Create or replace a Chart.js instance on a canvas element ─── */
function mkChart(id, type, labels, datasets, opts = {}) {
  const el = document.getElementById(id);
  if (!el) return;
  if (charts[id]) { charts[id].destroy(); delete charts[id]; }

  const isHorizontal = opts.indexAxis === 'y';
  const isDoughnut   = ['doughnut', 'pie'].includes(type);
  const isStacked    = !!(opts.scales && (
    (opts.scales.x && opts.scales.x.stacked) ||
    (opts.scales.y && opts.scales.y.stacked)
  ));
  const { plugins: extraPlugins = {}, ...restOpts } = opts;

  charts[id] = new Chart(el, {
    type,
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { top: isHorizontal || isDoughnut ? 4 : 20, right: isHorizontal ? 40 : 4 } },
      plugins: {
        legend: {
          position: isDoughnut ? 'right' : 'top',
          labels: { font: { family: 'Sarabun', size: 11 }, boxWidth: 11, padding: 8 }
        },
        datalabels: buildDL(type, isHorizontal, isDoughnut, isStacked),
        ...extraPlugins
      },
      ...restOpts
    }
  });
}

/* ─── Dataset factory: bar/line chart with a single color ─── */
function barDS(label, data, colorIndex) {
  const color = COLORS[colorIndex % COLORS.length];
  return { label, data, backgroundColor: alpha(color), borderColor: color, borderWidth: 1.5 };
}

/* ─── Dataset factory: doughnut/pie chart with full palette ─── */
function donutDS(data) {
  return [{ data, backgroundColor: COLORS, hoverOffset: 6 }];
}

/* ─── Render all charts for every dashboard section ─── */
function renderCharts() {
  const wh  = aggWH(filtered);
  const br  = aggBR(filtered);
  const jt  = aggJT(filtered);
  const ca  = aggCA(filtered);

  const brTop10     = topN(br, 'issueTotal',   10);
  const brR008Top10 = topN(br, 'r008DocCount', 10);
  const caTop10     = topN(ca, 'issueTotal',   10);
  const scBoth = { x: { beginAtZero: true }, y: { beginAtZero: true } };

  /* ── Overview ── */
  mkChart('cOvWHBar', 'bar', wh.map(d => d.warehouse),
    [barDS('เอกสารทั้งหมด', wh.map(d => d.totalDocCount), 0),
     barDS('เอกสาร R008',   wh.map(d => d.r008DocCount),  2)],
    { scales: scBoth });

  mkChart('cOvWHDonut', 'doughnut',
    wh.slice(0, 8).map(d => d.warehouse),
    donutDS(wh.slice(0, 8).map(d => d.totalDocCount)));

  mkChart('cOvBrTop', 'bar', brR008Top10.map(d => short(d.branch)),
    [barDS('เอกสาร R008', brR008Top10.map(d => d.r008DocCount), 3)],
    { indexAxis: 'y', scales: { x: { beginAtZero: true } } });

  mkChart('cOvJTDonut', 'doughnut',
    jt.slice(0, 6).map(d => d.jobType),
    donutDS(jt.slice(0, 6).map(d => d.totalDocCount)));

  const ca5R008 = topN(ca, 'r008DocCount', 5);
  mkChart('cOvCauseBar', 'bar', ca5R008.map(d => short(d.cause)),
    [barDS('เอกสาร R008', ca5R008.map(d => d.r008DocCount), 4)],
    { indexAxis: 'y', scales: { x: { beginAtZero: true } } });

  /* ── Warehouse ── */
  mkChart('cWHBar', 'bar', wh.map(d => d.warehouse),
    [barDS('จำนวนขาด', wh.map(d => d.shortageTotal), 2),
     barDS('จำนวนเกิน', wh.map(d => d.overageTotal),  0)],
    { scales: scBoth });

  mkChart('cWHDonut', 'doughnut',
    wh.map(d => d.warehouse),
    donutDS(wh.map(d => d.issueTotal)));

  const whTop10 = topN(wh, 'issueTotal', 10);
  mkChart('cWHTop', 'bar', whTop10.map(d => d.warehouse),
    [barDS('ปัญหารวม', whTop10.map(d => d.issueTotal), 0)],
    { indexAxis: 'y', scales: { x: { beginAtZero: true } } });

  /* ── Branch ── */
  mkChart('cBrTop', 'bar', brTop10.map(d => short(d.branch)),
    [barDS('ปัญหารวม', brTop10.map(d => d.issueTotal), 3)],
    { indexAxis: 'y', scales: { x: { beginAtZero: true } } });

  const brShort10 = topN(br, 'shortageTotal', 10);
  mkChart('cBrShort', 'bar', brShort10.map(d => short(d.branch)),
    [barDS('จำนวนขาด', brShort10.map(d => d.shortageTotal), 2)],
    { indexAxis: 'y', scales: { x: { beginAtZero: true } } });

  const brOver10 = topN(br, 'overageTotal', 10);
  mkChart('cBrOver', 'bar', brOver10.map(d => short(d.branch)),
    [barDS('จำนวนเกิน', brOver10.map(d => d.overageTotal), 0)],
    { indexAxis: 'y', scales: { x: { beginAtZero: true } } });

  mkChart('cBrStacked', 'bar', brTop10.map(d => short(d.branch, 16)),
    [barDS('จำนวนขาด', brTop10.map(d => d.shortageTotal), 2),
     barDS('จำนวนเกิน', brTop10.map(d => d.overageTotal),  0)],
    {
      scales: {
        x: {
          stacked: true, beginAtZero: true,
          ticks: {
            font: { family: 'Sarabun', size: 10 },
            callback: (value, index) => {
              const b = brTop10[index];
              if (!b) return value;
              return [short(b.branch, 14), `(${short(b.topJobType || '', 12)})`];
            }
          }
        },
        y: { stacked: true, beginAtZero: true }
      },
      plugins: {
        tooltip: {
          callbacks: {
            title: items => {
              const b = brTop10[items[0].dataIndex];
              return b ? b.branch : items[0].label;
            },
            label: item => `${item.dataset.label}: ${(item.parsed.y || 0).toLocaleString()} ชิ้น`,
            afterBody: items => {
              const b = brTop10[items[0].dataIndex];
              if (!b) return [];
              const lines = [
                '',
                `จำนวนขาด: ${b.shortageTotal.toLocaleString()} ชิ้น`,
                `จำนวนเกิน: ${b.overageTotal.toLocaleString()} ชิ้น`,
                `เอกสาร R008: ${b.r008DocCount.toLocaleString()} ใบ`,
                `สัดส่วน: ${b.percentage}%`,
                '',
                'Top ประเภทงาน:'
              ];
              (b.topJobTypes || []).forEach((jtItem, i) => {
                lines.push(`  ${i + 1}. ${jtItem[0]} (${jtItem[1].toLocaleString()})`);
              });
              return lines;
            }
          }
        }
      }
    });

  /* ── Job Type ── */
  mkChart('cJTDonut', 'doughnut', jt.map(d => d.jobType), donutDS(jt.map(d => d.issueTotal)));

  mkChart('cJTBar', 'bar', jt.map(d => d.jobType),
    [barDS('จำนวนขาด', jt.map(d => d.shortageTotal), 2),
     barDS('จำนวนเกิน', jt.map(d => d.overageTotal),  0)],
    { scales: scBoth });

  mkChart('cJTTop', 'bar', jt.map(d => d.jobType),
    [barDS('ปัญหารวม', jt.map(d => d.issueTotal), 1)],
    { indexAxis: 'y', scales: { x: { beginAtZero: true } } });

  /* ── Cause ── */
  mkChart('cCATop', 'bar', caTop10.map(d => short(d.cause, 22)),
    [barDS('ปัญหารวม', caTop10.map(d => d.issueTotal), 4)],
    { indexAxis: 'y', scales: { x: { beginAtZero: true } } });

  mkChart('cCADonut', 'doughnut',
    caTop10.map(d => short(d.cause)),
    donutDS(caTop10.map(d => d.issueTotal)));

  mkChart('cCAStacked', 'bar', caTop10.map(d => short(d.cause, 16)),
    [barDS('จำนวนขาด', caTop10.map(d => d.shortageTotal), 2),
     barDS('จำนวนเกิน', caTop10.map(d => d.overageTotal),  0)],
    { scales: { x: { stacked: true, beginAtZero: true }, y: { stacked: true, beginAtZero: true } } });

  /* ── Recorder ── */
  const rec     = aggREC(filtered);
  const recT10  = topN(rec, 'r008DocCount',  10);
  const recS10  = topN(rec, 'shortageTotal', 10);
  const recO10  = topN(rec, 'overageTotal',  10);
  const recI10  = topN(rec, 'issueTotal',    10);

  const recTooltip = arr => ({
    tooltip: {
      callbacks: {
        title: items => arr[items[0].dataIndex]?.recorder || items[0].label,
        afterBody: items => {
          const v = arr[items[0].dataIndex];
          if (!v) return [];
          return ['',
            `เอกสารทั้งหมด: ${v.totalDocCount.toLocaleString()} ใบ`,
            `เอกสาร R008: ${v.r008DocCount.toLocaleString()} ใบ`,
            `จำนวนขาด: ${v.shortageTotal.toLocaleString()} ชิ้น`,
            `จำนวนเกิน: ${v.overageTotal.toLocaleString()} ชิ้น`,
            `ปัญหารวม: ${v.issueTotal.toLocaleString()} ชิ้น`,
            `สัดส่วน: ${v.percentage}%`];
        }
      }
    }
  });

  mkChart('cRECTop', 'bar', recT10.map(d => short(d.recorder, 20)),
    [barDS('เอกสาร R008', recT10.map(d => d.r008DocCount), 3)],
    { indexAxis: 'y', scales: { x: { beginAtZero: true } }, plugins: recTooltip(recT10) });

  mkChart('cRECShort', 'bar', recS10.map(d => short(d.recorder, 20)),
    [barDS('จำนวนขาด', recS10.map(d => d.shortageTotal), 2)],
    { indexAxis: 'y', scales: { x: { beginAtZero: true } }, plugins: recTooltip(recS10) });

  mkChart('cRECOver', 'bar', recO10.map(d => short(d.recorder, 20)),
    [barDS('จำนวนเกิน', recO10.map(d => d.overageTotal), 0)],
    { indexAxis: 'y', scales: { x: { beginAtZero: true } }, plugins: recTooltip(recO10) });

  mkChart('cRECDonut', 'doughnut',
    recT10.map(d => short(d.recorder, 18)),
    donutDS(recT10.map(d => d.r008DocCount)));

  mkChart('cRECStacked', 'bar', recI10.map(d => short(d.recorder, 20)),
    [barDS('จำนวนขาด', recI10.map(d => d.shortageTotal), 2),
     barDS('จำนวนเกิน', recI10.map(d => d.overageTotal),  0)],
    { scales: { x: { stacked: true, beginAtZero: true }, y: { stacked: true, beginAtZero: true } }, plugins: recTooltip(recI10) });
}
