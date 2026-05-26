/* ─── Find the first header matching any pattern in pats ─── */
function fcol(headers, pats) {
  for (const p of pats) {
    const re = new RegExp(p, 'i');
    const found = headers.find(h => re.test(h));
    if (found) return found;
  }
  return null;
}

/* ─── Extract WH codes from T2/T3 gate columns ─── */
function normalizeWarehouse(t2, t3) {
  const extract = v => {
    if (!v || !String(v).trim()) return null;
    const m = String(v).trim().match(/WH\d+/i);
    return m ? m[0].toUpperCase() : null;
  };
  const w2 = extract(t2);
  const w3 = extract(t3);
  if (!w2 && !w3) return 'ไม่ระบุคลัง';
  if (!w2) return w3;
  if (!w3) return w2;
  if (w2 === w3) return w2;
  return w2 + ', ' + w3;
}

/* ─── Parse Thai/Excel/ISO date values to Date objects ─── */
function parseThaiDate(v) {
  if (v === null || v === undefined || v === '') return null;

  if (typeof v === 'number') {
    const d = new Date(Math.round((v - 25569) * 86400 * 1000));
    return isNaN(d.getTime()) ? null : d;
  }

  const s = String(v).trim();
  if (!s) return null;

  if (/^\d{4}-\d{1,2}-\d{1,2}/.test(s)) {
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  }

  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (m) {
    const d = new Date(parseInt(m[3]), parseInt(m[2]) - 1, parseInt(m[1]));
    return isNaN(d.getTime()) ? null : d;
  }

  const d2 = new Date(s);
  return isNaN(d2.getTime()) ? null : d2;
}

/* ─── Map raw Excel/CSV rows to canonical record shape ─── */
function normalizeData(json) {
  if (!json || !json.length) return [];

  const H = Object.keys(json[0]);
  const cDoc  = fcol(H, ['เลขที่เอกสาร', 'doc.?no', 'document.?no']);
  const cT2   = fcol(H, ['ประตูT2', 'ประตู.?T2', 'T2$', 'gate.?2']);
  const cT3   = fcol(H, ['ประตูT3', 'ประตู.?T3', 'T3$', 'gate.?3']);
  const cBr   = fcol(H, ['ชื่อสาขา', 'สาขา', 'branch']);
  const cJT   = fcol(H, ['ประเภทงาน', 'job.?type', 'jobtype']);
  const cSh   = fcol(H, ['จำนวนขาด', 'shortage', 'ขาด']);
  const cOv   = fcol(H, ['จำนวนเกิน', 'overage', 'เกิน']);
  const cCa   = fcol(H, ['สาเหตุ.*R008', 'R008.*สาเหตุ', 'สาเหตุของ', 'สาเหตุ']);
  const cDate = fcol(H, ['วันที่คิวงาน', 'คิวงาน', 'queue.*date', 'date.*queue', 'วันที่']);
  const cRec  = fcol(H, ['ผู้บันทึก.*T3', 'T3.*ผู้บันทึก', 'ผู้บันทึก']);

  return json.map(r => {
    const sh = toN(cSh ? r[cSh] : 0);
    const ov = toN(cOv ? r[cOv] : 0);
    return {
      docNo:     cDoc  ? String(r[cDoc]  || '').trim() : '',
      warehouse: normalizeWarehouse(cT2 ? r[cT2] : '', cT3 ? r[cT3] : ''),
      branch:    cBr   ? (String(r[cBr]  || '').trim() || 'ไม่ระบุสาขา')       : 'ไม่ระบุสาขา',
      jobType:   cJT   ? (String(r[cJT]  || '').trim() || 'ไม่ระบุประเภทงาน')  : 'ไม่ระบุประเภทงาน',
      shortage: sh,
      overage:  ov,
      total:    sh + ov,
      cause:     cCa   ? (String(r[cCa]  || '').trim() || 'ไม่ระบุสาเหตุ')      : 'ไม่ระบุสาเหตุ',
      queueDate: cDate ? parseThaiDate(r[cDate]) : null,
      recorder:  cRec  ? (String(r[cRec] || '').trim() || 'ไม่ระบุผู้บันทึก')   : 'ไม่ระบุผู้บันทึก'
    };
  }).filter(r => r.docNo !== '');
}
