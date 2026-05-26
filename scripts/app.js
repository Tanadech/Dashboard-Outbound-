/* ─── Normalize raw rows and trigger a full re-render ─── */
function processData(json) {
  rawData = normalizeData(json);
  populateFilters();
  applyFilters();
  loading(false);
}

/* ─── Handle file input: parse XLSX/XLS/CSV and feed to processData ─── */
function handleFile(input) {
  const file = input.files[0];
  if (!file) return;

  loading(true);

  const ext = file.name.split('.').pop().toLowerCase();
  const lbl = document.getElementById('fileStatusLabel');
  lbl.textContent = '📄 ' + file.name + ' — ' + new Date().toLocaleTimeString('th-TH');
  lbl.className = 'ok';

  if (ext === 'csv') {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      encoding: 'UTF-8',
      complete: result => { processData(result.data); input.value = ''; },
      error: err => { alert('อ่าน CSV ไม่ได้: ' + err.message); loading(false); }
    });
  } else {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const wb   = XLSX.read(e.target.result, { type: 'array' });
        const ws   = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(ws, { defval: '' });
        processData(json);
      } catch (err) {
        alert('อ่านไฟล์ไม่ได้: ' + err.message);
        loading(false);
      }
    };
    reader.readAsArrayBuffer(file);
    input.value = '';
  }
}

/* ─── Re-render every dashboard section after data/filter change ─── */
function renderAll() {
  renderKPI();
  renderCharts();
  renderWH();
  renderBR();
  renderJT();
  renderCA();
  renderREC();
  renderDT();
}

/* ─── Show empty state on first load before any file is imported ─── */
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('kpiMain').innerHTML = `
    <div class="empty" style="grid-column:1/-1">
      <div class="e-ico">📂</div>
      <h3>ยังไม่ได้โหลดข้อมูล</h3>
      <p>กรุณากดปุ่ม <strong>"นำเข้าไฟล์"</strong> ที่มุมบนขวา<br>
         แล้วเลือกไฟล์ <strong>.xlsx / .xls / .csv</strong></p>
    </div>`;
});
