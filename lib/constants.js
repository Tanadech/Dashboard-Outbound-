/* ─── Chart palette (12 colors, cycled by index) ─── */
const COLORS = [
  '#3b5bdb', '#2f9e44', '#e8590c', '#7048e8',
  '#c92a2a', '#0c8599', '#f59f00', '#d6336c',
  '#74c0fc', '#a9e34b', '#f783ac', '#63e6be'
];

/* ─── Rows per paginated table page ─── */
const PS = 50;

/* ─── Add transparency suffix to a hex color ─── */
const alpha = c => c + 'bb';

/* ─── Application state ─── */
let rawData = [];
let filtered = [];
let charts   = {};
let pages    = { wh: 1, br: 1, jt: 1, ca: 1, rec: 1, dt: 1 };
let dtSort   = { col: 'docNo', dir: 'asc' };
