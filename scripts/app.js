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

const RAW_URL = 'https://raw.githubusercontent.com/Tanadech/Dashboard-Outbound-/main/data/data.json';

/* ─── Auto-fetch data/data.json from GitHub Pages on page load ─── */
async function autoLoadData() {
  loading(true);
  let json;
  try {
    let res = await fetch('./data/data.json');
    if (!res.ok) res = await fetch(RAW_URL);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    json = await res.json();
    if (!Array.isArray(json) || json.length === 0) throw new Error('ไม่มีข้อมูล');
  } catch (err) {
    loading(false);
    document.getElementById('kpiMain').innerHTML = `
      <div class="empty" style="grid-column:1/-1">
        <div class="e-ico">📂</div>
        <h3>ยังไม่มีข้อมูล</h3>
        <p>กรุณารัน <strong>update-data.bat</strong> เพื่อแปลงไฟล์ Excel ก่อน<br>
           หรือกดปุ่ม <strong>"นำเข้าไฟล์"</strong> เพื่ออัปโหลดด้วยตนเอง</p>
      </div>`;
    return;
  }
  processData(json);
  const lbl = document.getElementById('fileStatusLabel');
  lbl.textContent = '✅ โหลดข้อมูลอัตโนมัติ — ' + new Date().toLocaleTimeString('th-TH');
  lbl.className = 'ok';
}

/* ─── Render only the active section's table ─── */
function renderActiveTable(hash) {
  const h = hash || location.hash || '#sec-overview';
  if      (h === '#sec-warehouse') renderWH();
  else if (h === '#sec-branch')    renderBR();
  else if (h === '#sec-jobtype')   renderJT();
  else if (h === '#sec-cause')     renderCA();
  else if (h === '#sec-recorder')  renderREC();
  else if (h === '#sec-detail')    renderDT();
}

/* ─── Re-render KPI + active section only; other sections render on demand via showPage ─── */
function renderAll() {
  renderKPI();
  renderActiveTable();
  if (typeof showPage === 'function') showPage(location.hash || '#sec-overview');
}

/* ─── Auto-load data on page open ─── */
document.addEventListener('DOMContentLoaded', () => {
  if (typeof showPage === 'function') showPage(location.hash || '#sec-overview');
  autoLoadData();
});
