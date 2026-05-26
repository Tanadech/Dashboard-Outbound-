/* ─── Export current filtered data as UTF-8 CSV ─── */
function exportCSV() {
  if (!filtered.length) { alert('ไม่มีข้อมูล'); return; }

  const headers = ['เลขที่เอกสาร', 'คลังสินค้า', 'สาขา', 'ประเภทงาน', 'จำนวนขาด', 'จำนวนเกิน', 'จำนวนปัญหารวม', 'สาเหตุขาดเกินสาขา'];
  const rows    = filtered.map(r => [r.docNo, r.warehouse, r.branch, r.jobType, r.shortage, r.overage, r.total, r.cause]);

  const csv = '﻿' + [headers, ...rows]
    .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const a  = document.createElement('a');
  a.href   = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  a.download = `ขาดเกินสาขา_Export_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
}
