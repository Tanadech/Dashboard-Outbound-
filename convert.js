const XLSX = require('xlsx');
const fs   = require('fs');
const path = require('path');

/* ── กำหนด path ไฟล์ Excel ที่นี่ (หรือส่งเป็น argument: node convert.js "C:\path\to\file.xlsx") ── */
const DEFAULT_EXCEL_PATH = process.env.EXCEL_PATH || '';

const excelPath = process.argv[2] || DEFAULT_EXCEL_PATH;

if (!excelPath) {
  console.error('❌  ระบุ path ไฟล์ Excel ด้วย:');
  console.error('    node convert.js "C:\\path\\to\\file.xlsx"');
  process.exit(1);
}

if (!fs.existsSync(excelPath)) {
  console.error('❌  ไม่พบไฟล์: ' + excelPath);
  process.exit(1);
}

console.log('📂 อ่านไฟล์: ' + excelPath);

/* Return the first header that matches any of the regex patterns (case-insensitive) */
function fcol(headers, pats) {
  for (const p of pats) {
    const re = new RegExp(p, 'i');
    const found = headers.find(h => re.test(h));
    if (found) return found;
  }
  return null;
}

try {
  const wb   = XLSX.readFile(excelPath);
  const ws   = wb.Sheets[wb.SheetNames[0]];
  const json = XLSX.utils.sheet_to_json(ws, { defval: '' });

  if (!json.length) {
    console.error('❌  ไม่พบข้อมูลในไฟล์');
    process.exit(1);
  }

  const H = Object.keys(json[0]);

  /* Keep only the columns used by normalizeData — same patterns as normalize.js fcol calls */
  const keep = [
    fcol(H, ['เลขที่เอกสาร', 'doc.?no', 'document.?no']),
    fcol(H, ['ประตูT2', 'ประตู.?T2', 'T2$', 'gate.?2']),
    fcol(H, ['ประตูT3', 'ประตู.?T3', 'T3$', 'gate.?3']),
    fcol(H, ['ชื่อสาขา', 'สาขา', 'branch']),
    fcol(H, ['ประเภทงาน', 'job.?type', 'jobtype']),
    fcol(H, ['จำนวนขาด', 'shortage', 'ขาด']),
    fcol(H, ['จำนวนเกิน', 'overage', 'เกิน']),
    fcol(H, ['สาเหตุ.*R008', 'R008.*สาเหตุ', 'สาเหตุของ', 'สาเหตุ']),
    fcol(H, ['วันที่คิวงาน', 'คิวงาน', 'queue.*date', 'date.*queue', 'วันที่เอกสาร', 'วันที่จ่าย', 'วันที่บันทึก', 'วันที่ส่ง', 'วันที่', 'date']),
    fcol(H, ['ผู้บันทึก.*T3', 'T3.*ผู้บันทึก', 'ผู้บันทึก']),
  ].filter(Boolean);

  console.log('📋  ใช้ ' + keep.length + ' คอลัมน์จาก ' + H.length + ' คอลัมน์');

  const slim = json.map(r => {
    const out = {};
    keep.forEach(c => { out[c] = r[c]; });
    return out;
  });

  const outDir  = path.join(__dirname, 'data');
  const outFile = path.join(outDir, 'data.json');

  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
  fs.writeFileSync(outFile, JSON.stringify(slim));

  const size = (fs.statSync(outFile).size / 1024).toFixed(1);
  console.log('✅  แปลงสำเร็จ: ' + slim.length + ' รายการ (' + size + ' KB)');
  console.log('📄  บันทึกที่: data/data.json');
} catch (err) {
  console.error('❌  เกิดข้อผิดพลาด: ' + err.message);
  process.exit(1);
}
