Chart.register(ChartDataLabels);

/* ─── Global Chart.js font defaults ─── */
Chart.defaults.font.family = 'Sarabun';
Chart.defaults.font.size   = 14;
Chart.defaults.plugins.tooltip.titleFont = { family: 'Sarabun', size: 14, weight: 'bold' };
Chart.defaults.plugins.tooltip.bodyFont  = { family: 'Sarabun', size: 14 };
Chart.defaults.plugins.tooltip.padding   = 10;

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
      font: { family: 'Sarabun', size: 13, weight: '600' },
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
      font: { family: 'Sarabun', size: 12, weight: '700' },
      color: '#fff',
      display: ctx => (ctx.dataset.data[ctx.dataIndex] || 0) > 0
    };
  }

  if (isHorizontal) {
    return {
      anchor: 'end', align: 'right', offset: 6,
      formatter: v => v > 0 ? v.toLocaleString() : null,
      font: { family: 'Sarabun', size: 13, weight: '600' },
      color: '#495057',
      display: ctx => (ctx.dataset.data[ctx.dataIndex] || 0) > 0
    };
  }

  return {
    anchor: 'end', align: 'top', offset: 4,
    formatter: v => v > 0 ? v.toLocaleString() : null,
    font: { family: 'Sarabun', size: 13, weight: '600' },
    color: '#495057',
    clamp: true,
    display: ctx => (ctx.dataset.data[ctx.dataIndex] || 0) > 0
  };
}

/* ─── Create or replace an ApexCharts radialBar on a div element ─── */
function mkRadial(id, labels, values) {
  const el = document.getElementById(id);
  if (!el) return;
  if (charts[id] && charts[id].destroy) { charts[id].destroy(); }
  delete charts[id];
  if (!values.length) return;

  const maxShow = Math.min(labels.length, 8);
  const lbls    = labels.slice(0, maxShow);
  const vals    = values.slice(0, maxShow);
  const total   = vals.reduce((a, b) => a + b, 0);
  const pcts    = vals.map(v => total > 0 ? +(v / total * 100).toFixed(1) : 0);

  charts[id] = new ApexCharts(el, {
    series: pcts,
    chart: {
      type: 'radialBar',
      height: '100%',
      fontFamily: 'Sarabun, sans-serif',
      toolbar: { show: false },
      animations: { enabled: true, speed: 600 },
    },
    plotOptions: {
      radialBar: {
        offsetY: 0,
        startAngle: 0,
        endAngle: 270,
        hollow: { margin: 5, size: '28%', background: 'transparent' },
        track: { background: '#e9ecef', strokeWidth: '90%', margin: 4 },
        dataLabels: { name: { show: false }, value: { show: false } },
        barLabels: {
          enabled: true,
          useSeriesColors: true,
          offsetX: -8,
          fontSize: '13px',
          fontFamily: 'Sarabun, sans-serif',
          fontWeight: 600,
          formatter: (name, opts) =>
            `${name}: ${vals[opts.seriesIndex].toLocaleString()}`,
        },
      },
    },
    colors: COLORS.slice(0, maxShow),
    labels: lbls,
    tooltip: {
      y: {
        formatter: (_, { seriesIndex }) =>
          `${vals[seriesIndex].toLocaleString()} (${pcts[seriesIndex]}%)`,
      },
    },
  });
  charts[id].render();
}

/* ─── ApexCharts radar with multiple series ─── */
function mkRadarMulti(id, labels, seriesArr) {
  const el = document.getElementById(id);
  if (!el) return;
  if (charts[id] && charts[id].destroy) { charts[id].destroy(); }
  delete charts[id];
  if (!labels.length) return;

  charts[id] = new ApexCharts(el, {
    series: seriesArr,
    chart: {
      type: 'radar',
      height: '100%',
      fontFamily: 'Sarabun, sans-serif',
      toolbar: { show: false },
      animations: { enabled: true, speed: 600 },
    },
    dataLabels: { enabled: true, style: { fontSize: '11px', fontFamily: 'Sarabun, sans-serif' } },
    plotOptions: {
      radar: {
        size: 110,
        polygons: {
          strokeColors: '#e9e9e9',
          fill: { colors: ['#f8f8f8', '#fff'] },
        },
      },
    },
    colors: [COLORS[0], COLORS[2]],
    markers: { size: 3, strokeWidth: 2 },
    tooltip: { y: { formatter: val => val.toLocaleString() + ' ใบ' } },
    xaxis: {
      categories: labels,
      labels: { style: { fontFamily: 'Sarabun, sans-serif', fontSize: '11px' } },
    },
    yaxis: {
      labels: { formatter: (val, i) => i % 2 === 0 ? val.toLocaleString() : '' },
    },
    legend: {
      position: 'top',
      fontFamily: 'Sarabun, sans-serif',
      fontSize: '12px',
    },
  });
  charts[id].render();
}

/* ─── ApexCharts clean horizontal bar chart ─── */
function mkBarH(id, labels, seriesArr, colors = COLORS) {
  const el = document.getElementById(id);
  if (!el) return;
  if (charts[id] && charts[id].destroy) { charts[id].destroy(); }
  delete charts[id];
  if (!labels.length) return;

  charts[id] = new ApexCharts(el, {
    series: seriesArr,
    chart: {
      type: 'bar',
      height: '100%',
      fontFamily: 'Sarabun, sans-serif',
      toolbar: { show: false },
      animations: { enabled: true, speed: 600 },
    },
    plotOptions: {
      bar: { horizontal: true, borderRadius: 2, barHeight: '65%' },
    },
    dataLabels: { enabled: false },
    colors: colors.slice(0, seriesArr.length),
    xaxis: {
      categories: labels,
      labels: { style: { fontFamily: 'Sarabun, sans-serif', fontSize: '12px' } },
    },
    yaxis: {
      labels: { style: { fontFamily: 'Sarabun, sans-serif', fontSize: '12px' } },
    },
    grid: { borderColor: '#f1f1f1', strokeDashArray: 4 },
    legend: { fontFamily: 'Sarabun, sans-serif', fontSize: '12px' },
    tooltip: { y: { formatter: val => val.toLocaleString() + ' ใบ' } },
  });
  charts[id].render();
}

/* ─── RadialBar showing problem rate: r008DocCount / totalDocCount × 100% ─── */
function mkRadialRate(id, labels, r008Counts, totalCounts) {
  const el = document.getElementById(id);
  if (!el) return;
  if (charts[id] && charts[id].destroy) { charts[id].destroy(); }
  delete charts[id];
  if (!labels.length) return;

  const maxShow = Math.min(labels.length, 8);
  const lbls  = labels.slice(0, maxShow);
  const r008  = r008Counts.slice(0, maxShow);
  const tots  = totalCounts.slice(0, maxShow);
  const pcts  = tots.map((t, i) => t > 0 ? +(r008[i] / t * 100).toFixed(1) : 0);

  charts[id] = new ApexCharts(el, {
    series: pcts,
    chart: {
      type: 'radialBar',
      height: '100%',
      fontFamily: 'Sarabun, sans-serif',
      toolbar: { show: false },
      animations: { enabled: true, speed: 600 },
    },
    plotOptions: {
      radialBar: {
        offsetY: 0,
        startAngle: 0,
        endAngle: 270,
        hollow: { margin: 5, size: '28%', background: 'transparent' },
        track: { background: '#e9ecef', strokeWidth: '90%', margin: 4 },
        dataLabels: { name: { show: false }, value: { show: false } },
        barLabels: {
          enabled: true,
          useSeriesColors: true,
          offsetX: -8,
          fontSize: '13px',
          fontFamily: 'Sarabun, sans-serif',
          fontWeight: 600,
          formatter: (name, opts) =>
            `${name}: ${pcts[opts.seriesIndex]}%`,
        },
      },
    },
    colors: COLORS.slice(0, maxShow),
    labels: lbls,
    tooltip: {
      y: {
        formatter: (_, { seriesIndex }) =>
          `${r008[seriesIndex].toLocaleString()} / ${tots[seriesIndex].toLocaleString()} ใบ (${pcts[seriesIndex]}%)`,
      },
    },
  });
  charts[id].render();
}

/* ─── Create or replace an ApexCharts radar (polygon fill) on a div element ─── */
function mkRadar(id, labels, values) {
  const el = document.getElementById(id);
  if (!el) return;
  if (charts[id] && charts[id].destroy) { charts[id].destroy(); }
  delete charts[id];
  if (!values.length) return;

  charts[id] = new ApexCharts(el, {
    series: [{ name: 'เอกสารขาดเกินสาขา', data: values }],
    chart: {
      type: 'radar',
      height: '100%',
      fontFamily: 'Sarabun, sans-serif',
      toolbar: { show: false },
      animations: { enabled: true, speed: 600 },
    },
    dataLabels: { enabled: true, style: { fontSize: '12px', fontFamily: 'Sarabun, sans-serif' } },
    plotOptions: {
      radar: {
        size: 120,
        polygons: {
          strokeColors: '#e9e9e9',
          fill: { colors: ['#f8f8f8', '#fff'] },
        },
      },
    },
    colors: ['#FF4560'],
    markers: { size: 4, colors: ['#fff'], strokeColor: '#FF4560', strokeWidth: 2 },
    tooltip: { y: { formatter: val => val.toLocaleString() } },
    xaxis: {
      categories: labels,
      labels: { style: { fontFamily: 'Sarabun, sans-serif', fontSize: '12px' } },
    },
    yaxis: {
      labels: { formatter: (val, i) => i % 2 === 0 ? val.toLocaleString() : '' },
    },
  });
  charts[id].render();
}

/* ─── ApexCharts vertical bar with gradient fill and rounded corners ─── */
function mkBarGradient(id, labels, values, seriesName = 'เอกสารขาดเกินสาขา', color = COLORS[3]) {
  const el = document.getElementById(id);
  if (!el) return;
  if (charts[id] && charts[id].destroy) { charts[id].destroy(); }
  delete charts[id];
  if (!values.length) return;

  const maxIdx = values.indexOf(Math.max(...values));

  charts[id] = new ApexCharts(el, {
    series: [{ name: seriesName, data: values }],
    annotations: {
      points: [{
        x: labels[maxIdx],
        seriesIndex: 0,
        label: {
          borderColor: color,
          offsetY: 0,
          style: { color: '#fff', background: color, fontFamily: 'Sarabun, sans-serif', fontSize: '11px' },
          text: `สูงสุด: ${values[maxIdx].toLocaleString()} ใบ`,
        },
      }],
    },
    chart: {
      type: 'bar',
      height: '100%',
      fontFamily: 'Sarabun, sans-serif',
      toolbar: { show: false },
      animations: { enabled: true, speed: 600 },
    },
    plotOptions: { bar: { borderRadius: 8, columnWidth: '55%' } },
    dataLabels: {
      enabled: true,
      offsetY: -6,
      style: { fontSize: '11px', fontFamily: 'Sarabun, sans-serif', fontWeight: '700', colors: ['#444'] },
      formatter: val => val > 0 ? val.toLocaleString() : '',
    },
    stroke: { width: 0 },
    grid: { row: { colors: ['#fff', '#f2f2f2'] } },
    xaxis: {
      categories: labels,
      tickPlacement: 'on',
      labels: { rotate: -45, style: { fontFamily: 'Sarabun, sans-serif', fontSize: '11px' } },
    },
    yaxis: {
      title: { text: 'เอกสารขาดเกิน (ใบ)', style: { fontFamily: 'Sarabun, sans-serif', fontSize: '11px' } },
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'light', type: 'horizontal', shadeIntensity: 0.25,
        inverseColors: true, opacityFrom: 0.85, opacityTo: 0.85, stops: [50, 0, 100],
      },
    },
    colors: [color],
    tooltip: { y: { formatter: val => val.toLocaleString() + ' ใบ' } },
  });
  charts[id].render();
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
      layout: { padding: { top: isHorizontal || isDoughnut ? 6 : 28, right: isHorizontal ? 70 : 6, bottom: 4 } },
      plugins: {
        legend: {
          position: isDoughnut ? 'right' : 'top',
          labels: { font: { family: 'Sarabun', size: 14 }, boxWidth: 13, padding: 12 }
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
  mkBarH('cOvWHBar', wh.map(d => d.warehouse), [
    { name: 'เอกสารทั้งหมด',     data: wh.map(d => d.totalDocCount) },
    { name: 'เอกสารขาดเกินสาขา', data: wh.map(d => d.r008DocCount)  },
  ], ['#3b5bdb', '#e8590c']);

  mkRadial('cOvWHDonut', wh.slice(0, 8).map(d => d.warehouse), wh.slice(0, 8).map(d => d.r008DocCount));

  mkBarGradient('cOvBrTop', brR008Top10.map(d => short(d.branch, 14)), brR008Top10.map(d => d.r008DocCount), 'เอกสารขาดเกินสาขา', '#0c8599');

  mkBarGradient('cOvJTDonut', jt.slice(0, 6).map(d => d.jobType), jt.slice(0, 6).map(d => d.r008DocCount), 'เอกสารขาดเกิน', '#f59f00');

  const ca5R008 = topN(ca, 'r008DocCount', 5);
  mkRadar('cOvCauseBar', ca5R008.map(d => short(d.cause, 20)), ca5R008.map(d => d.r008DocCount));

  /* ── Warehouse ── */
  mkChart('cWHBar', 'bar', wh.map(d => d.warehouse),
    [barDS('จำนวนขาด', wh.map(d => d.shortageTotal), 2),
     barDS('จำนวนเกิน', wh.map(d => d.overageTotal),  0)],
    { scales: scBoth });

  mkRadial('cWHDonut', wh.map(d => d.warehouse), wh.map(d => d.issueTotal));


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
            font: { family: 'Sarabun', size: 13 },
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
                `เอกสารขาดเกินสาขา: ${b.r008DocCount.toLocaleString()} ใบ`,
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
  mkRadial('cJTDonut', jt.map(d => d.jobType), jt.map(d => d.issueTotal));

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

  mkRadial('cCADonut', caTop10.map(d => short(d.cause, 20)), caTop10.map(d => d.issueTotal));

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
            `เอกสารขาดเกินสาขา: ${v.r008DocCount.toLocaleString()} ใบ`,
            `จำนวนขาด: ${v.shortageTotal.toLocaleString()} ชิ้น`,
            `จำนวนเกิน: ${v.overageTotal.toLocaleString()} ชิ้น`,
            `ปัญหารวม: ${v.issueTotal.toLocaleString()} ชิ้น`,
            `สัดส่วน: ${v.percentage}%`];
        }
      }
    }
  });

  mkChart('cRECTop', 'bar', recT10.map(d => short(d.recorder, 20)),
    [barDS('เอกสารขาดเกินสาขา', recT10.map(d => d.r008DocCount), 3)],
    { indexAxis: 'y', scales: { x: { beginAtZero: true } }, plugins: recTooltip(recT10) });

  mkChart('cRECShort', 'bar', recS10.map(d => short(d.recorder, 20)),
    [barDS('จำนวนขาด', recS10.map(d => d.shortageTotal), 2)],
    { indexAxis: 'y', scales: { x: { beginAtZero: true } }, plugins: recTooltip(recS10) });

  mkChart('cRECOver', 'bar', recO10.map(d => short(d.recorder, 20)),
    [barDS('จำนวนเกิน', recO10.map(d => d.overageTotal), 0)],
    { indexAxis: 'y', scales: { x: { beginAtZero: true } }, plugins: recTooltip(recO10) });

  mkRadial('cRECDonut', recT10.map(d => short(d.recorder, 18)), recT10.map(d => d.r008DocCount));

  mkChart('cRECStacked', 'bar', recI10.map(d => short(d.recorder, 20)),
    [barDS('จำนวนขาด', recI10.map(d => d.shortageTotal), 2),
     barDS('จำนวนเกิน', recI10.map(d => d.overageTotal),  0)],
    { scales: { x: { stacked: true, beginAtZero: true }, y: { stacked: true, beginAtZero: true } }, plugins: recTooltip(recI10) });
}
