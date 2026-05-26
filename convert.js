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

try {
  const wb   = XLSX.readFile(excelPath);
  const ws   = wb.Sheets[wb.SheetNames[0]];
  const json = XLSX.utils.sheet_to_json(ws, { defval: '' });

  const outDir  = path.join(__dirname, 'data');
  const outFile = path.join(outDir, 'data.json');

  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
  fs.writeFileSync(outFile, JSON.stringify(json));

  const size = (fs.statSync(outFile).size / 1024).toFixed(1);
  console.log('✅  แปลงสำเร็จ: ' + json.length + ' รายการ (' + size + ' KB)');
  console.log('📄  บันทึกที่: data/data.json');
} catch (err) {
  console.error('❌  เกิดข้อผิดพลาด: ' + err.message);
  process.exit(1);
}
