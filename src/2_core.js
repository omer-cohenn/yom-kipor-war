import * as THREE from 'three';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { Water } from 'three/addons/objects/Water.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { Sky } from 'three/addons/objects/Sky.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';

const QS = new URLSearchParams(location.search);
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const TOUCH = matchMedia('(pointer: coarse)').matches;
/* graphics quality: high / medium / low, chosen in the settings (kept between visits) or ?q= in the address; left unset, a phone or a
   small machine starts at medium and anything else at high. Medium and low keep everything the light mode always trimmed; low also
   draws at a lower resolution, with a coarser sea and soldiers in less detail. QLOD: the distances (m) at which a soldier steps down
   to the next level of detail - near men in full, far ones in a few hundred triangles */
const LITE0 = !QS.has('full') && (QS.has('lite') || TOUCH || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || Math.min(screen.width, screen.height) < 700 || (navigator.deviceMemory && navigator.deviceMemory <= 4));
// high everywhere unless the player picks less (phones too: the frame governor in 5_game.js keeps them smooth); a choice saved before this
// version (the old key) is not carried over, so every phone starts at the full picture
const QUAL = (() => { let q = QS.get('q'); if (!q) try { q = localStorage.getItem('yk73.q2'); } catch (e) {} return ['high', 'med', 'low'].includes(q) ? q : 'high'; })();
const PHONE = LITE0;   // a phone or tablet: the soldiers in full, the map and its objects lighter (below)
// LITE: the lighter map and objects - fewer plants and stones, a coarser ground and sea, smaller effect pools. On medium and low, and on a
// phone at high too: there the soldiers stay in full detail (they follow QUAL, not LITE), the ground keeps its textures and the sun its shadows
const LITE = QUAL !== 'high' || PHONE;
const SHADOWS = QUAL !== 'low' && !QS.has('noshadow');   // the sun's shadows on medium too (a smaller map): a phone draws them well enough, and the frame governor in 5_game.js takes the resolution down first if not
const QLOD = { high: [48, 144], med: [27, 90], low: [0, 45] }[QUAL];
const FAR = LITE ? 11000 : 30000;
const HDRK = LITE ? 1 : 2.4;
const $C = new Map(), $ = (s) => { let e = $C.get(s); if (!e || !e.isConnected) { e = document.querySelector(s); if (e) $C.set(s, e); } return e; };   /* the page's elements, looked up once (the HUD asks for them every frame) */
const V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

/* ================= math ================= */
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (e0, e1, x) => { const t = clamp((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); };
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
function rng(seed) { return function () { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const PERM = new Uint8Array(512);
{ const r = rng(5734); const p = [...Array(256).keys()]; for (let i = 255; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; } for (let i = 0; i < 512; i++) PERM[i] = p[i & 255]; }
function grad(h, x, y) { switch (h & 7) { case 0: return x + y; case 1: return -x + y; case 2: return x - y; case 3: return -x - y; case 4: return x; case 5: return -x; case 6: return y; default: return -y; } }
function noise(x, y) {
  const fx = Math.floor(x), fy = Math.floor(y); const X = fx & 255, Y = fy & 255; x -= fx; y -= fy;
  const u = x * x * x * (x * (x * 6 - 15) + 10), v = y * y * y * (y * (y * 6 - 15) + 10);
  const a = PERM[X] + Y, b = PERM[X + 1] + Y;
  return lerp(lerp(grad(PERM[a], x, y), grad(PERM[b], x - 1, y), u), lerp(grad(PERM[a + 1], x, y - 1), grad(PERM[b + 1], x - 1, y - 1), u), v);
}
function fbm(x, y, o = 4) { let s = 0, a = 0.5, f = 1; for (let i = 0; i < o; i++) { s += a * noise(x * f + i * 17.3, y * f - i * 9.1); f *= 2.02; a *= 0.5; } return s; }
function distPolyline(x, z, pts, closed = false) {
  let d = 1e12; const n = pts.length, m = closed ? n : n - 1;
  for (let k = 0; k < m; k++) {
    const a = pts[k], b = pts[(k + 1) % n]; const ex = b[0] - a[0], ez = b[1] - a[1]; const l2 = ex * ex + ez * ez;
    let t = l2 ? ((x - a[0]) * ex + (z - a[1]) * ez) / l2 : 0; t = t < 0 ? 0 : t > 1 ? 1 : t;
    const qx = a[0] + t * ex - x, qz = a[1] + t * ez - z; const dd = qx * qx + qz * qz; if (dd < d) d = dd;
  }
  return Math.sqrt(d);
}
function inPoly(x, z, poly) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], zi = poly[i][1], xj = poly[j][0], zj = poly[j][1];
    if (((zi > z) !== (zj > z)) && (x < (xj - xi) * (z - zi) / (zj - zi) + xi)) c = !c;
  }
  return c;
}
function bbox(p) { let a = 1e9, b = 1e9, c = -1e9, d = -1e9; for (const q of p) { a = Math.min(a, q[0]); b = Math.min(b, q[1]); c = Math.max(c, q[0]); d = Math.max(d, q[1]); } return [a, b, c, d]; }
function sdPoly(x, z, poly, bb) {
  if (bb) { const dx = Math.max(bb[0] - x, 0, x - bb[2]), dz = Math.max(bb[1] - z, 0, z - bb[3]); const o = Math.hypot(dx, dz); if (o > 600) return o; }
  let d = 1e12, inside = false; const n = poly.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = poly[i][0], zi = poly[i][1], xj = poly[j][0], zj = poly[j][1];
    const ex = xi - xj, ez = zi - zj; const l2 = ex * ex + ez * ez;
    let t = l2 ? ((x - xj) * ex + (z - zj) * ez) / l2 : 0; t = t < 0 ? 0 : t > 1 ? 1 : t;
    const qx = xj + t * ex - x, qz = zj + t * ez - z; const dd = qx * qx + qz * qz; if (dd < d) d = dd;
    if (((zi > z) !== (zj > z)) && (x < (xj - xi) * (z - zi) / (zj - zi) + xi)) inside = !inside;
  }
  d = Math.sqrt(d); return inside ? -d : d;
}
// a road bends instead of turning on a point: a Catmull-Rom curve through the waypoints, sampled every few metres
function smoothPath(pts, step = 3) {
  if (pts.length < 3) return pts.slice(); const out = [], P = (i) => pts[clamp(i, 0, pts.length - 1)];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2), L = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]), n = Math.max(2, Math.ceil(L / step));
    for (let k = 0; k < n; k++) { const t = k / n, t2 = t * t, t3 = t2 * t; out.push([0, 1].map((a) => 0.5 * (2 * p1[a] + (-p0[a] + p2[a]) * t + (2 * p0[a] - 5 * p1[a] + 4 * p2[a] - p3[a]) * t2 + (-p0[a] + 3 * p1[a] - 3 * p2[a] + p3[a]) * t3))); }
  }
  out.push(pts[pts.length - 1].slice()); return out;
}
function densify(pts, step) {
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1]; const L = Math.hypot(b[0] - a[0], b[1] - a[1]); const n = Math.max(1, Math.ceil(L / step));
    for (let k = 0; k < n; k++) out.push([lerp(a[0], b[0], k / n), lerp(a[1], b[1], k / n)]);
  }
  out.push(pts[pts.length - 1]); return out;
}
function offsetLine(pts, d) {
  return pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    let dx = b[0] - a[0], dz = b[1] - a[1]; const l = Math.hypot(dx, dz) || 1; dx /= l; dz /= l;
    return [p[0] + dz * d, p[1] - dx * d];
  });
}
const lin = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
const dirFrom = (azDeg, elDeg) => { const az = THREE.MathUtils.degToRad(azDeg), el = THREE.MathUtils.degToRad(elDeg); return new THREE.Vector3(Math.sin(az) * Math.cos(el), Math.sin(el), -Math.cos(az) * Math.cos(el)); };
const wrapPi = (a) => { while (a > Math.PI) a -= Math.PI * 2; while (a < -Math.PI) a += Math.PI * 2; return a; };
const bearingOf = (dx, dz) => (THREE.MathUtils.radToDeg(Math.atan2(dx, -dz)) + 360) % 360;

/* ================= geography (meters; +x east, −z north; origin = centre of the stronghold) ================= */
const MAP = { x0: -3200, x1: 3200, z0: -4300, z1: 2100 };
const MW = MAP.x1 - MAP.x0, MH = MAP.z1 - MAP.z0;
const EAST_BANK = [[2800, -40000], [1900, -9000], [1350, -6000], [930, -4400], [810, -3800], [650, -3200], [470, -2500], [270, -1800], [50, -1200], [-110, -760], [-140, -600]];
/* the canal in front of the stronghold is drawn about half its real width (some 200 m of water instead of 400): the far bank, the quays and the
   houses of Port Tewfik stand that much nearer, close enough to see the men in the boats. PTDX moves the whole Port Tewfik peninsula east;
   nearX maps a point on the old, wide water to the narrowed one */
const PTDX = 200;
const nearX = (x) => (x < -500 ? x + PTDX : x > -110 ? x : -110 + (x + 110) * (1 - PTDX / 390));
const WEST_BANK = [[2380, -40000], [1680, -9000], [1130, -6000], [710, -4400], [590, -3800], [430, -3200], [250, -2500], [50, -1800], [-170, -1200], [-360, -760], [-470 + PTDX, -520]];
const EB_NEAR = EAST_BANK.slice(2), WB_NEAR = WEST_BANK.slice(2);
const SINAI = [...EAST_BANK, [90, -590], [300, -650], [600, -700], [900, -690], [1200, -630], [1500, -510], [1750, -320], [1860, -20], [1920, 300], [2010, 600], [2300, 900], [2700, 1300], [3300, 1700], [6000, 4500], [12000, 14000], [20000, 40000], [40000, 40000], [40000, -40000]];
const TONGUE0 = [[-60, -800], [-120, -560], [-104, -300], [-92, -100], [-90, 100], [-74, 300], [-48, 600], [-32, 900], [-22, 1070], [0, 1115], [22, 1070], [30, 900], [44, 600], [68, 300], [92, 100], [98, -100], [98, -300], [92, -560], [130, -800]];
const TONGUE_W0 = [[-120, -560], [-104, -300], [-92, -100], [-90, 100], [-74, 300]];
/* the killing ground: in front of the stronghold the waterline lies well out from the rampart - a broad open beach the men from the boats
   must cross under the guns before they reach the foot of the sand wall. The stronghold itself (crestX, the trench, the posts) stays where it was */
const SHORE_WIDE = 17;
const shoreWid = (z) => SHORE_WIDE * smooth(-440, -250, z) * (1 - smooth(250, 430, z));
const TONGUE_WL0 = TONGUE0.slice(1, 10), TONGUE_WL = densify(TONGUE_WL0, 18).map(([x, z]) => [x - shoreWid(z), z]);
const TONGUE = [TONGUE0[0], ...TONGUE_WL, ...TONGUE0.slice(10)];
const TONGUE_E = TONGUE0.slice(9, 18);
const EGYPT = [...WEST_BANK, ...[[-500, -200], [-505, 200], [-515, 410], [-560, 462], [-660, 470], [-820, 440], [-1000, 380], [-1100, 300], [-1125, 0], [-1085, -300], [-990, -560]].map(([x, z]) => [x + PTDX, z]), [-1300, -900], [-1700, -1300], [-2100, -1650], [-2600, -1900], [-3300, -2000], [-6000, -1500], [-9000, 0], [-11000, 6000], [-14000, 20000], [-18000, 40000], [-40000, 40000], [-40000, -40000]];
const BASIN = [[-900, -250], [-720, -250], [-720, -70], [-900, -70]].map(([x, z]) => [x + PTDX, z]);
const LAGOON = [[92, -560], [300, -640], [600, -690], [900, -680], [1200, -620], [1500, -500], [1740, -320], [1850, -20], [1900, 300], [1980, 600], [1100, 880], [400, 1150], [30, 1110], [44, 600], [68, 300], [98, -100]];
const PT_ZONE = [[-500, -560], [-500, 410], [-560, 455], [-820, 430], [-1100, 290], [-1120, 0], [-1080, -300], [-990, -560]].map(([x, z]) => [x + PTDX, z]);
const MAOZ = [[-60, -86], [0, -98], [46, -84], [64, -24], [60, 38], [38, 82], [-4, 94], [-58, 84], [-77, 30], [-79, -30]];
const YARD = MAOZ.map((p) => [p[0] * 0.86, p[1] * 0.86]);
const GATE_N = [0, -98], GATE_S = [-4, 94];
const PINKO = [330, -980];
const BB = { tongue: bbox(TONGUE), tongue0: bbox(TONGUE0), basin: bbox(BASIN) };
const ROAD_LEXICON = offsetLine(EB_NEAR, 110);
const ROAD_ACCESS = [[0, -760], [38, -600], [52, -420], [50, -250], [35, -150], [8, -112], [0, -98]];
const ROAD_SOUTH = [[-4, 94], [4, 120], [12, 200], [20, 320], [18, 600], [8, 900], [2, 1030]];
const ROAD_PGISHA = [[0, -760], [250, -1150], [700, -1330], [1400, -1450], [2200, -1520], [3300, -1600]];
const ROAD_EGY = offsetLine(WB_NEAR, -115);
function lineX(L, z, dflt = -90) { for (let i = 0; i < L.length - 1; i++) { const a = L[i], b = L[i + 1]; if (z >= a[1] && z <= b[1]) return lerp(a[0], b[0], (z - a[1]) / (b[1] - a[1])); } return dflt; }
const tongueWestX = (z) => lineX(TONGUE_WL, z);      // the waterline on the canal side of the tongue
const tongueWestX0 = (z) => lineX(TONGUE_WL0, z);    // where it was before the beach was widened: the rampart and the stronghold are built off this line
const crestX = (z) => tongueWestX0(z) + 11;
let TRENCH_LINES = null, DUGS = null, DUG_ON = true;
function trenchCut(x, z) {
  if (!TRENCH_LINES || x < -100 || x > 70 || z < -108 || z > 104) return 0;
  let d = 9;
  for (const t of TRENCH_LINES) { if (x < t.bb[0] - 3 || x > t.bb[2] + 3 || z < t.bb[1] - 3 || z > t.bb[3] + 3) continue; d = Math.min(d, distPolyline(x, z, t.pts)); }
  return 1.05 * (1 - smooth(1.3, 2.4, d));
}
/* the Egyptians' own trenches (saps), dug in the night out of the scrub north and south of the stronghold to just under our parapet: two on
   each side, each from a few metres beyond the wire (in among the bushes) to the foot of the parapet of our trench, a little crooked; a metre
   deep, the spoil thrown up along both lips, the floor rising at the end where they climb out at our trench */
const SAPS = { n: [[[-24.5, -113.5], [-28.5, -106], [-25.5, -99], [-27.3, -92.15]], [[-51, -109], [-47, -102], [-49.8, -95.5], [-48.7, -88.05]]],
  s: [[[-24.5, 111], [-28.5, 103.5], [-25.6, 96], [-27.3, 89.25]], [[-47.5, 107], [-43.5, 100], [-46, 93], [-44.7, 86.25]]] };
const SAP_LIST = [...SAPS.n, ...SAPS.s];
/* the way to each northern sap's head across the open ground (the scrub begins some forty metres out from our trench): where its men wait in the
   bushes, and two lines of cover between (rocks and short sandbag walls) they bound from one to the next */
const SAP_APPR = [
  { sap: SAPS.n[0], spawn: [-23, -137], st: [[[-27, -126], [-21, -125.5], [-31.5, -127]], [[-25, -119.5], [-29.5, -120], [-20.5, -119]]] },
  { sap: SAPS.n[1], spawn: [-53, -133], st: [[[-49, -122], [-55, -121.5], [-44.5, -122.5]], [[-51, -115.5], [-46.5, -116], [-55.5, -115]]] },
];
function sapCut(x, z) {
  if (x < -59 || x > -16 || Math.abs(z) < 82 || Math.abs(z) > 120) return 0;
  let best = 0;
  for (const s of SAP_LIST) { const d = distPolyline(x, z, s); if (d > 4) continue; const s0 = s[0], e = s[s.length - 1], ramp = smooth(0.4, 4.5, Math.hypot(x - s0[0], z - s0[1])), fin = 1 - 0.45 * (1 - smooth(0.4, 2.4, Math.hypot(x - e[0], z - e[1])));
    const v = (-1.05 * (1 - smooth(0.9, 2.0, d)) * fin + 0.38 * Math.exp(-(((d - 2.75) / 0.7) ** 2))) * ramp; if (Math.abs(v) > Math.abs(best)) best = v; }
  return best;
}
function bankX(line, z) { for (let i = 0; i < line.length - 1; i++) { const a = line[i], b = line[i + 1]; if (z >= a[1] && z <= b[1]) return lerp(a[0], b[0], (z - a[1]) / (b[1] - a[1])); } return line[line.length - 1][0]; }

/* ================= terrain function ================= */
const COL = [0, 0, 0];
const PAL = {
  sandL: [0.86, 0.80, 0.68], sandD: [0.77, 0.70, 0.57], sandR: [0.81, 0.70, 0.56], fresh: [0.92, 0.88, 0.78], wet: [0.57, 0.53, 0.46],
  sab: [0.89, 0.87, 0.81], sabD: [0.71, 0.67, 0.59], mud: [0.37, 0.33, 0.26], algae: [0.33, 0.37, 0.26], urban: [0.76, 0.74, 0.69],
  rock: [0.62, 0.52, 0.43], yard: [0.66, 0.60, 0.50], deep: [0.20, 0.25, 0.26],
};
function mix3(a, b, t) { COL[0] = a[0] + (b[0] - a[0]) * t; COL[1] = a[1] + (b[1] - a[1]) * t; COL[2] = a[2] + (b[2] - a[2]) * t; }
function mixIn(b, t) { COL[0] += (b[0] - COL[0]) * t; COL[1] += (b[1] - COL[1]) * t; COL[2] += (b[2] - COL[2]) * t; }
function israeliRampart(x, z) {
  if (z > -540) return 0;
  const d = distPolyline(x, z, EB_NEAR);
  return 14 * Math.exp(-(((d - 26) / 12) ** 2)) * smooth(-540, -640, z);
}
/* chapter 2: the streets of Suez are flat ground; the play area is levelled, the rest of the city stays as the skyline */
let MODE = 'mezach';
/* chapters, in the order of the days: the Mezach, the Purkan rescue, the armour battle, the Chinese Farm, the crossing, the Hermon, Suez city, the encirclement. All but the first are "field" chapters */
const FIELDM = () => MODE !== 'mezach';
const GOD = () => MODE === 'range' || MODE === 'prologue';   // the test range: nothing there hurts the player, his men or his vehicles
const CHAP = {}; const CH = () => CHAP[MODE];
const CH_ORDER = ['mezach', 'rescue', 'armor', 'farm', 'cross', 'hermon', 'suez', 'army'];
const CH_INFO = {
  mezach: { n: 1, name: 'המעוז האחרון', sub: '6 באוקטובר 1973 · ארבעים ושניים לוחמים, מאה מטר של סוללה, וכל הארמיה השלישית מולם' },
  rescue: { n: 2, name: 'לחלץ את פורקן', sub: '9 באוקטובר 1973 · טנקים וג׳יפים פורצים מערבה להוציא את לוחמי המעוז' },
  armor: { n: 3, name: 'המתקפה נשברת', sub: '14 באוקטובר 1973 · הבוקר שבו מאות טנקים מצריים עולים על הרכסים — ונעצרים' },
  farm: { n: 4, name: 'החווה הסינית', sub: '15–17 באוקטובר 1973 · צומת, תעלות השקיה, חילוץ פצועים — וגשר דוברות שנוגע באפריקה' },
  cross: { n: 5, name: 'גשר הצליחה', sub: '18–19 באוקטובר 1973 · דוברות, ג׳יפים בשדות, כפר שמחזיקים בו — וגשר הגלילים נדחף אל המים' },
  hermon: { n: 6, name: 'עיני המדינה', sub: '22 באוקטובר 1973 · גולני עולים עם שחר להחזיר את המוצב שנפל ביום הראשון' },
  suez: { n: 7, name: 'המלכודת בסואץ', sub: '24 באוקטובר 1973 · טור שנכנס לעיר, בניין אחד, פצועים, ושיירה שחייבת להגיע' },
  army: { n: 8, name: 'הטבעת נסגרת', sub: '24 באוקטובר 1973 · הכביש לקהיר נחתך, והארמיה השלישית נשארת בלי דרך הביתה' },
};
const WORLD = { base: [] };
let FDT = 1 / 60;   // the length of the frame being simulated, for the eased animation
const SURV = { on: false, guns: [], best: 0, wave: 0, state: 'break', t: 0, breakLen: 10, score: 0, bonus: 0, air: 0, airGiven: 0, cleared: 0, dirs: [], acc: 1, order: ['w', 'n', 's'], strike: null, jetT: 30, artT: 10 };
let GROUND = null;   // a chapter's own terrain (chapters 2, 3 and 5 are fought on their own maps)
const CITY = { cx: -1700, cz: -2150, x0: -1700 - 270, x1: -1700 + 270, z0: -2150 - 270, z1: -2150 + 270, h: 2.0, m: 26 };
function cityW(x, z) { const dx = Math.max(CITY.x0 - x, 0, x - CITY.x1), dz = Math.max(CITY.z0 - z, 0, z - CITY.z1); const d = Math.hypot(dx, dz); return d <= 0 ? 1 : 1 - smooth(0, CITY.m, d); }
function terrainAt(x, z) {
  const w = cityW(x, z); if (w <= 0) return terrainAt0(x, z);
  if (w >= 1) { mix3(PAL.urban, PAL.sandD, 0.25 + 0.25 * noise(x / 40, z / 40)); return CITY.h - 0.04; }
  const h = terrainAt0(x, z), c0 = [COL[0], COL[1], COL[2]]; mix3(PAL.urban, PAL.sandD, 0.35); for (let i = 0; i < 3; i++) COL[i] = lerp(c0[i], COL[i], w); return lerp(h, CITY.h - 0.04, w);
}
function terrainAt0(x, z) {
  const sS = sdPoly(x, z, SINAI), sT = sdPoly(x, z, TONGUE, BB.tongue), sE = sdPoly(x, z, EGYPT);
  let s = Math.min(sS, sT, sE);
  const sB = sdPoly(x, z, BASIN, BB.basin); if (-sB > s) s = -sB;
  if (s > 0) {
    let h;
    if (inPoly(x, z, LAGOON)) {
      h = -0.5 + 0.95 * fbm(x / 160, z / 160, 4) + 0.3 * (1 - smooth(0, 160, s)) - smooth(650, 1100, z) * 2.5;
      mix3(PAL.mud, PAL.algae, smooth(-0.2, 0.3, noise(x / 90, z / 90)));
      if (h < -0.05) mixIn(PAL.deep, 0.3);
    } else { h = -1.2 - Math.min(s, 500) * 0.025; mix3(PAL.wet, PAL.deep, smooth(0, 40, s)); }
    return lerp(0.35, h, smooth(0, 14, s));
  }
  const inl = -s;
  const region = sT < 0 ? 1 : sS < 0 ? 0 : 2;
  let h = 0.45 + 1.7 * smooth(0, 45, inl), feat = 0;
  if (region === 0) {
    const amp = 0.4 + 3.4 * smooth(250, 2800, inl);
    const d1 = fbm(x / 520, z / 520, 4), d2 = 1 - Math.abs(noise(x / 140 + d1, z / 190));
    h += amp * (0.55 + d1) + d2 * d2 * amp * 0.35;
    h += smooth(2500, 28000, inl) * 55 + smooth(1500, 20000, inl) * fbm(x / 4200, z / 4200, 3) * 45;
    mix3(PAL.sandL, PAL.sandD, smooth(-0.35, 0.45, fbm(x / 300, z / 300, 3)));
    mixIn(PAL.sandR, 0.35 * smooth(0.1, 0.5, noise(x / 900, z / 900)));
    const ex = (x - 880) / 650, ez = (z + 830) / 170;
    const e = Math.sqrt(ex * ex + ez * ez) + 0.3 * fbm(x / 260, z / 260, 3);
    const sab = 1 - smooth(0.78, 1.0, e);
    if (sab > 0) { h = lerp(h, 0.55 + 0.12 * noise(x / 50, z / 50), sab); const t = smooth(-0.3, 0.3, fbm(x / 70, z / 70, 3)); mixIn([lerp(PAL.sab[0], PAL.sabD[0], t), lerp(PAL.sab[1], PAL.sabD[1], t), lerp(PAL.sab[2], PAL.sabD[2], t)], sab); }
    feat = Math.max(feat, israeliRampart(x, z));
    { const d = Math.hypot(x - PINKO[0], z - PINKO[1]); if (d < 170) feat = Math.max(feat, 12 * (1 - smooth(20, 135, d + 10 * noise(x / 30, z / 30)))); }
    h += feat; mixIn(PAL.fresh, smooth(1.5, 8, feat) * 0.6);
  } else if (region === 1) {
    const in0 = -sdPoly(x, z, TONGUE0, BB.tongue0);   // depth inside the old shoreline: the new beach in front of it is a low, gently rising strand
    h = 0.45 + 0.35 * smooth(0, 14, inl) + 1.65 * smooth(0, 22, in0) + 0.12 * noise(x / 18, z / 18);
    mix3(PAL.sandL, PAL.sandD, smooth(-0.35, 0.45, fbm(x / 120, z / 120, 3)));
    if (z > -620 && z < 340) { const d = in0 > 0 ? distPolyline(x, z, TONGUE_W0) : -distPolyline(x, z, TONGUE_W0); feat = Math.max(feat, 7 * Math.exp(-(((d - 11) / 6) ** 2)) * smooth(330, 220, z) * smooth(-620, -540, z)); }
    feat = Math.max(feat, israeliRampart(x, z));
    if (Math.abs(x) < 140 && Math.abs(z) < 160) {
      const d = distPolyline(x, z, MAOZ, true);
      const g = smooth(5, 14, Math.hypot(x - GATE_N[0], z - GATE_N[1])) * smooth(5, 14, Math.hypot(x - GATE_S[0], z - GATE_S[1]));
      feat = Math.max(feat, 4.6 * (1 - smooth(2.0, 8.5, d)) * g);
      if (inPoly(x, z, MAOZ)) { const y = smooth(0, 7, d); mixIn(PAL.yard, 0.75 * y); h = lerp(h, 2.7, y); }
    }
    h += feat; mixIn(PAL.fresh, smooth(1.2, 6, feat) * 0.5);
    const cut = trenchCut(x, z); if (cut > 0) { h -= cut; mixIn(PAL.sandD, cut * 0.4); }
    { const sc = sapCut(x, z); if (sc) { h += sc; mixIn(PAL.sandD, Math.min(1, Math.abs(sc)) * 0.45); } }   // the Egyptians' saps
    if (DUGS && DUG_ON) h = dugCut(x, z, h);
  } else {
    h = 0.45 + 2.2 * smooth(0, 40, inl) + 0.35 * fbm(x / 350, z / 350, 3);
    const urb = Math.max(1 - smooth(1500, 4200, Math.hypot(x + 2700, z + 3100)), 1 - smooth(500, 900, Math.hypot(x + 800 - PTDX, z)));
    mix3(PAL.sandL, PAL.sandD, smooth(-0.3, 0.4, fbm(x / 260, z / 260, 3)));
    mixIn(PAL.urban, urb * 0.8);
    if (z < -640) { const d = distPolyline(x, z, WB_NEAR); feat = Math.max(feat, 20 * Math.exp(-(((d - 48) / 17) ** 2)) * smooth(-640, -900, z)); }
    if (x < -6500) {
      const ax = (x + 16500) / 7000, az = (z - 2500) / 12000; const e = Math.sqrt(ax * ax + az * az);
      if (e < 1.3) { const m = 1 - smooth(0.55, 1.15, e + 0.25 * fbm(x / 3000, z / 3000, 2)); const ridge = 1 - Math.abs(noise(x / 2600, z / 2600)); const mh = m * (380 + 420 * ridge * ridge + 110 * fbm(x / 1200, z / 1200, 3)); h += mh; mixIn(PAL.rock, smooth(20, 200, mh)); }
    }
    h += feat; mixIn(PAL.fresh, smooth(2, 10, feat) * 0.5);
  }
  mixIn(PAL.wet, 1 - smooth(2, 22, inl));
  return h;
}

/* ================= renderer / scene / cameras ================= */
const stage = $('#stage');
const renderer = new THREE.WebGLRenderer({ antialias: QUAL !== 'low' && !QS.has('noaa'), powerPreference: LITE ? 'default' : 'high-performance', logarithmicDepthBuffer: !LITE });
renderer.setPixelRatio(QUAL === 'low' ? 1 : Math.min(window.devicePixelRatio || 1, QUAL === 'high' ? (PHONE ? 2 : 3) : 2));   // a phone: two device pixels to one
renderer.domElement.addEventListener('webglcontextlost', (e) => { e.preventDefault(); const l = $('#loading'); l.classList.remove('done'); $('#loadMsg').textContent = 'הזיכרון הגרפי של המכשיר נגמר והמשחק נעצר. סגרו לשוניות ואפליקציות אחרות ורעננו, או שחקו במחשב.'; });
renderer.setSize(stage.clientWidth, stage.clientHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.5;
renderer.shadowMap.enabled = SHADOWS; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.autoClear = false;
stage.appendChild(renderer.domElement);
const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(stage.clientWidth, stage.clientHeight);
labelRenderer.domElement.id = 'labels';
$('#app').insertBefore(labelRenderer.domElement, $('#vignette'));
const ANISO = renderer.capabilities.getMaxAnisotropy();

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0xbac5cc, 0.00013);
const camera = new THREE.PerspectiveCamera(72, stage.clientWidth / stage.clientHeight, LITE ? 0.15 : 0.05, LITE ? 13000 : 40000);
camera.layers.enable(1);
camera.rotation.order = 'YXZ';
const vmScene = new THREE.Scene();
const vmCamera = new THREE.PerspectiveCamera(55, stage.clientWidth / stage.clientHeight, 0.01, 10);
function onLayer1(o) { o.traverse((m) => m.layers.set(1)); return o; }

/* ================= textures ================= */
function canvas(n, m = n) { const c = document.createElement('canvas'); c.width = n; c.height = m; return c; }
function tex(c, srgb = true) { const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = ANISO; return t; }
function sandBumpTex() {
  const n = 256, c = canvas(n), g = c.getContext('2d'), img = g.createImageData(n, n), r = rng(11);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const u = x / n, v = y / n;
    const w = Math.sin(2 * Math.PI * (u * 5 + 0.35 * Math.sin(2 * Math.PI * v * 2) + 0.15 * Math.sin(2 * Math.PI * (v * 3 + u))));
    const val = clamp(128 + 22 * w + (r() - 0.5) * 70, 0, 255); const i = (y * n + x) * 4;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = val; img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  const t = tex(c, false); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(MW / 9, MH / 9); return t;
}
function waterNormalTex() {
  const n = 256, c = canvas(n), g = c.getContext('2d'), img = g.createImageData(n, n), r = rng(3);
  const waves = [[3, 1, .9], [-2, 4, .7], [5, -3, .5], [1, 7, .35], [8, 2, .25], [-6, -7, .2], [11, -4, .12], [-3, 13, .1], [14, 9, .07]].map((w) => [...w, r() * 6.283]);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const u = x / n, v = y / n; let du = 0, dv = 0;
    for (const [kx, kz, a, ph] of waves) { const cph = Math.cos(6.283 * (kx * u + kz * v) + ph) * a * 6.283; du += cph * kx; dv += cph * kz; }
    let nx = -du * 0.02, ny = -dv * 0.02, nz = 1; const l = Math.hypot(nx, ny, nz); nx /= l; ny /= l; nz /= l;
    const i = (y * n + x) * 4; img.data[i] = (nx * 0.5 + 0.5) * 255; img.data[i + 1] = (ny * 0.5 + 0.5) * 255; img.data[i + 2] = (nz * 0.5 + 0.5) * 255; img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
function railsTex() {
  const c = canvas(256), g = c.getContext('2d'), r = rng(8);
  g.fillStyle = '#8d8474'; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 2600; i++) { g.fillStyle = `rgba(${r() < .5 ? 60 : 190},${r() < .5 ? 55 : 175},${r() < .5 ? 50 : 150},${.25 + r() * .3})`; g.fillRect(r() * 256, r() * 256, 2 + r() * 3, 2 + r() * 3); }
  for (let y = 4; y < 256; y += 16) { g.fillStyle = '#3f3226'; g.fillRect(0, y, 256, 5); g.fillStyle = '#76583f'; g.fillRect(0, y + 1, 256, 1); }
  for (let i = 0; i < 16; i++) { g.fillStyle = `rgba(204,183,140,${.45 + r() * .35})`; g.beginPath(); g.ellipse(r() * 256, r() * 256, 12 + r() * 40, 6 + r() * 16, r() * 3, 0, 6.283); g.fill(); }
  const t = tex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
function gabionTex() {
  const c = canvas(256), g = c.getContext('2d'), r = rng(12);
  g.fillStyle = '#5c564c'; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 360; i++) {
    const x = r() * 256, y = r() * 256, rad = 7 + r() * 13, sh = 105 + r() * 75;
    const gr = g.createRadialGradient(x - rad * .3, y - rad * .3, 1, x, y, rad);
    gr.addColorStop(0, `rgb(${sh + 30},${sh + 22},${sh + 8})`); gr.addColorStop(1, `rgb(${sh - 35},${sh - 38},${sh - 44})`);
    g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, rad, rad * (0.6 + r() * 0.4), r() * 3, 0, 6.283); g.fill();
  }
  g.strokeStyle = 'rgba(38,38,36,.9)'; g.lineWidth = 1.6;
  for (let k = -256; k < 512; k += 28) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k + 256, 256); g.stroke(); g.beginPath(); g.moveTo(k + 256, 0); g.lineTo(k, 256); g.stroke(); }
  g.strokeStyle = 'rgba(28,28,26,.95)'; g.lineWidth = 6; g.strokeRect(3, 3, 250, 250);
  return tex(c);
}
function stoneTopTex() {
  const c = canvas(256), g = c.getContext('2d'), r = rng(19);
  g.fillStyle = '#9a8f7c'; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 900; i++) { const s = 90 + r() * 90; g.fillStyle = `rgb(${s + 20},${s + 12},${s})`; g.beginPath(); g.ellipse(r() * 256, r() * 256, 3 + r() * 7, 2 + r() * 5, r() * 3, 0, 6.283); g.fill(); }
  for (let i = 0; i < 10; i++) { g.fillStyle = 'rgba(206,188,150,.55)'; g.beginPath(); g.ellipse(r() * 256, r() * 256, 20 + r() * 50, 10 + r() * 20, r() * 3, 0, 6.283); g.fill(); }
  const t = tex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
function signTex(text, kind = 'plain') {
  const c = canvas(512, 160), g = c.getContext('2d');
  g.fillStyle = kind === 'aid' ? '#f1efe8' : '#2f3326'; g.fillRect(0, 0, 512, 160);
  g.strokeStyle = kind === 'aid' ? '#9a1b14' : '#c8bf9f'; g.lineWidth = 8; g.strokeRect(6, 6, 500, 148);
  g.fillStyle = kind === 'aid' ? '#9a1b14' : '#efe7cf';
  g.font = '700 74px "IBM Plex Sans Hebrew", Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.direction = 'rtl';
  if (kind === 'aid') {
    const cx = 420, cy = 80, R = 46; g.fillStyle = '#c3221a';
    for (const rot of [0, Math.PI]) { g.beginPath(); for (let k = 0; k < 3; k++) { const a = rot - Math.PI / 2 + k * 2.094; const px = cx + R * Math.cos(a), py = cy + R * Math.sin(a); k ? g.lineTo(px, py) : g.moveTo(px, py); } g.closePath(); g.fill(); }
    g.fillStyle = '#9a1b14'; g.fillText(text, 200, 84);
  } else g.fillText(text, 256, 84);
  return tex(c);
}
function radialTex(stops, n = 128) {
  const c = canvas(n), g = c.getContext('2d'); const gr = g.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2);
  for (const [o, col] of stops) gr.addColorStop(o, col); g.fillStyle = gr; g.fillRect(0, 0, n, n); return tex(c);
}
/* gun and shell flashes: drawn flame tongues (3-5 uneven prongs, like the gas leaving a flash hider), thin sparks and a turbulent hot core,
   with ragged edges; several seeded variants so no two shots look alike. A side-view cone for a shot seen across, and a cauliflower fireball */
function flameTongue(g, h, a, L, w, al, r) {
  g.save(); g.translate(h, h); g.rotate(a);
  const bend = (r() - 0.5) * w * 1.6, wob = (r() - 0.5) * w * 0.8, c1 = 0.8 + r() * 0.5, c2 = 0.3 + r() * 0.5, c3 = 0.8 + r() * 0.5, c4 = 0.3 + r() * 0.5;
  for (const [wk, lk, ak] of [[2.6, 1.08, 0.12], [1.6, 1, 0.32], [0.85, 0.94, 0.85]]) {
    const W = w * wk, LL = L * lk, gr = g.createLinearGradient(0, 0, LL, 0);
    gr.addColorStop(0, `rgba(255,248,222,${al * ak})`); gr.addColorStop(0.2, `rgba(255,212,125,${al * ak * 0.9})`); gr.addColorStop(0.55, `rgba(255,132,38,${al * ak * 0.5})`); gr.addColorStop(1, 'rgba(240,60,10,0)');
    g.fillStyle = gr; g.beginPath(); g.moveTo(0, -W * 0.4);
    g.bezierCurveTo(LL * 0.28, -W * c1 + wob, LL * 0.62, -W * c2 + bend * 0.6, LL, bend);
    g.bezierCurveTo(LL * 0.62, W * c4 + bend * 0.6, LL * 0.28, W * c3 + wob, 0, W * 0.4); g.closePath(); g.fill();
  }
  g.restore();
}
function flashCore(g, h, R, r) {
  for (let i = 0; i < 7; i++) { const x = h + (r() - 0.5) * R * 1.2, y = h + (r() - 0.5) * R * 1.2, rad = R * (0.4 + r() * 0.5), gr = g.createRadialGradient(x, y, 0, x, y, rad); gr.addColorStop(0, 'rgba(255,236,180,.5)'); gr.addColorStop(0.6, 'rgba(255,160,60,.22)'); gr.addColorStop(1, 'rgba(255,110,30,0)'); g.fillStyle = gr; g.fillRect(0, 0, h * 2, h * 2); }
  const gr = g.createRadialGradient(h, h, 0, h, h, R); gr.addColorStop(0, 'rgba(255,255,252,1)'); gr.addColorStop(0.45, 'rgba(255,244,200,.85)'); gr.addColorStop(1, 'rgba(255,200,110,0)'); g.fillStyle = gr; g.fillRect(0, 0, h * 2, h * 2);
}
function flashSparks(g, h, n, r, d0a, d0b, la, lb, cx = h, cy = h, aim = null) {
  g.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const a = aim == null ? r() * 6.283 : aim + (r() - 0.5) * 1.1, d0 = h * (d0a + r() * d0b), d1 = d0 + h * (la + r() * lb);
    const x0 = cx + Math.cos(a) * d0, y0 = cy + Math.sin(a) * d0, x1 = cx + Math.cos(a) * d1, y1 = cy + Math.sin(a) * d1, gr = g.createLinearGradient(x0, y0, x1, y1);
    gr.addColorStop(0, 'rgba(255,240,190,.9)'); gr.addColorStop(1, 'rgba(255,150,50,0)'); g.strokeStyle = gr; g.lineWidth = 0.8 + r() * 1.6; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
  }
}
function flashRag(g, n, r, k, cx, cy, R0, R1, st = 0.28) {
  g.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < k; i++) { const a = r() * 6.283, d = R0 + r() * (R1 - R0), x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d, rad = n * (0.02 + r() * 0.05), gr = g.createRadialGradient(x, y, 0, x, y, rad); gr.addColorStop(0, `rgba(0,0,0,${st})`); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2); }
  g.globalCompositeOperation = 'lighter';
}
function flashBurstTex(seed = 1) {
  const n = 256, h = n / 2, c = canvas(n), g = c.getContext('2d'), r = rng(seed); g.globalCompositeOperation = 'lighter';
  let gr = g.createRadialGradient(h, h, 0, h, h, h * 0.66); gr.addColorStop(0, 'rgba(255,170,70,.32)'); gr.addColorStop(0.5, 'rgba(255,110,30,.1)'); gr.addColorStop(1, 'rgba(255,80,20,0)'); g.fillStyle = gr; g.fillRect(0, 0, n, n);
  const k = 3 + Math.floor(r() * 3), a0 = r() * 6.283;
  for (let i = 0; i < k; i++) {
    const a = a0 + i * 6.283 / k + (r() - 0.5) * 0.6, L = h * (0.5 + r() * 0.46), w = h * (0.08 + r() * 0.07);
    flameTongue(g, h, a, L, w, 0.9, r);
    for (let j = 0; j < 2; j++) if (r() < 0.7) flameTongue(g, h, a + (r() - 0.5) * 0.9, L * (0.25 + r() * 0.35), w * (0.5 + r() * 0.4), 0.6, r);
  }
  for (let i = 0; i < 5; i++) flameTongue(g, h, r() * 6.283, h * (0.18 + r() * 0.2), h * (0.1 + r() * 0.08), 0.55, r);
  flashSparks(g, h, 14, r, 0.12, 0.3, 0.1, 0.38);
  flashRag(g, n, r, 50, h, h, h * 0.25, h * 0.9);
  flashCore(g, h, h * 0.2, r);
  return tex(c);
}
function flashConeTex(seed = 1) {
  const n = 256, h = n / 2, c = canvas(n), g = c.getContext('2d'), r = rng(seed); g.globalCompositeOperation = 'lighter';
  g.save(); g.translate(-h + 14, 0);
  let gr = g.createRadialGradient(h, h, 0, h, h, h * 0.5); gr.addColorStop(0, 'rgba(255,170,70,.3)'); gr.addColorStop(1, 'rgba(255,90,20,0)'); g.fillStyle = gr; g.fillRect(0, 0, n * 2, n);
  flameTongue(g, h, (r() - 0.5) * 0.06, n - 26, h * 0.2, 0.7, r);
  flameTongue(g, h, (r() - 0.5) * 0.12, n * (0.5 + r() * 0.25), h * 0.11, 0.5, r);
  for (const sd of [-1, 1]) { flameTongue(g, h, sd * (0.5 + r() * 0.35), h * (0.45 + r() * 0.35), h * 0.08, 0.75, r); if (r() < 0.6) flameTongue(g, h, sd * (0.9 + r() * 0.5), h * (0.25 + r() * 0.2), h * 0.06, 0.5, r); }
  flashSparks(g, h, 10, r, 0.15, 0.4, 0.2, 0.6, h, h, 0);
  flashRag(g, n, r, 40, h + h * 0.6, h, 0, h * 0.7, 0.2);
  flashCore(g, h, h * 0.17, r);
  g.restore(); return tex(c);
}
function fireballTex(seed = 1) {
  const n = 256, h = n / 2, c = canvas(n), g = c.getContext('2d'), r = rng(seed); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 18; i++) {
    const a = r() * 6.283, d = h * 0.3 * Math.sqrt(r()), x = h + Math.cos(a) * d, y = h + Math.sin(a) * d * 0.9, rad = h * (0.24 + r() * 0.17), gr = g.createRadialGradient(x, y, 0, x, y, rad);
    gr.addColorStop(0, 'rgba(255,232,165,.62)'); gr.addColorStop(0.45, 'rgba(255,150,50,.5)'); gr.addColorStop(0.8, 'rgba(205,62,12,.14)'); gr.addColorStop(1, 'rgba(160,40,5,0)'); g.fillStyle = gr; g.fillRect(0, 0, n, n);
  }
  flashRag(g, n, r, 60, h, h, h * 0.1, h * 0.75, 0.22);
  const gr = g.createRadialGradient(h, h, 0, h, h, h * 0.3); gr.addColorStop(0, 'rgba(255,250,225,.75)'); gr.addColorStop(1, 'rgba(255,200,100,0)'); g.fillStyle = gr; g.fillRect(0, 0, n, n);
  return tex(c);
}
function flashStarTex() { return flashBurstTex(1); }
function puffTex() {
  const n = 128, c = canvas(n), g = c.getContext('2d'), r = rng(21);
  for (let i = 0; i < 26; i++) {
    const x = n / 2 + (r() - .5) * n * .45, y = n / 2 + (r() - .5) * n * .45, rad = n * (.14 + r() * .2);
    const gr = g.createRadialGradient(x, y, 0, x, y, rad); gr.addColorStop(0, 'rgba(255,255,255,.34)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, n, n);
  }
  return tex(c);
}
function moonTex() {
  const n = 128, c = canvas(n), g = c.getContext('2d'), r = n * 0.36, cx = n / 2, cy = n / 2;
  const glow = g.createRadialGradient(cx, cy, r * .8, cx, cy, n / 2); glow.addColorStop(0, 'rgba(230,236,255,.35)'); glow.addColorStop(1, 'rgba(230,236,255,0)');
  g.fillStyle = glow; g.fillRect(0, 0, n, n);
  g.fillStyle = '#f3efe2'; g.beginPath(); g.arc(cx, cy, r, 0, 6.283); g.fill();
  const rr = rng(4); for (let i = 0; i < 9; i++) { g.fillStyle = 'rgba(150,150,140,.35)'; g.beginPath(); g.arc(cx + (rr() - .5) * r * 1.2, cy + (rr() - .5) * r * 1.2, r * (.1 + rr() * .2), 0, 6.283); g.fill(); }
  g.fillStyle = 'rgba(16,20,32,.93)'; g.beginPath(); g.arc(cx, cy, r + .5, Math.PI / 2, Math.PI * 1.5); g.ellipse(cx, cy, r * 0.32, r + .5, 0, -Math.PI / 2, Math.PI / 2, true); g.fill();
  return tex(c);
}
function flagTex(kind) {
  const c = canvas(128, 88), g = c.getContext('2d');
  if (kind === 'il') {
    g.fillStyle = '#f5f5f2'; g.fillRect(0, 0, 128, 88); g.fillStyle = '#1f47a8'; g.fillRect(0, 9, 128, 12); g.fillRect(0, 67, 128, 12);
    g.strokeStyle = '#1f47a8'; g.lineWidth = 3.4; const cx = 64, cy = 44, R = 15;
    for (const rot of [0, Math.PI]) { g.beginPath(); for (let k = 0; k < 3; k++) { const a = rot - Math.PI / 2 + k * 2.094; const px = cx + R * Math.cos(a), py = cy + R * Math.sin(a); k ? g.lineTo(px, py) : g.moveTo(px, py); } g.closePath(); g.stroke(); }
  } else {
    g.fillStyle = '#ce1126'; g.fillRect(0, 0, 128, 30); g.fillStyle = '#f7f7f7'; g.fillRect(0, 29, 128, 30); g.fillStyle = '#111'; g.fillRect(0, 58, 128, 30);
    g.fillStyle = '#c09300'; g.beginPath(); g.moveTo(64, 32); g.lineTo(72, 42); g.lineTo(68, 56); g.lineTo(60, 56); g.lineTo(56, 42); g.closePath(); g.fill();
  }
  return tex(c);
}
const DET = { x0: -215, z0: -245, w: 430 };
function microTex() {
  const n = 256, c = canvas(n), g = c.getContext('2d'), img = g.createImageData(n, n), r = rng(707);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const u = x / n, v = y / n; const w = 0.5 * Math.sin(6.283 * (u * 3 + v)) + 0.35 * Math.sin(6.283 * (-2 * u + 5 * v) + 1.3) + 0.25 * Math.sin(6.283 * (7 * u + 3 * v) + 2.1);
    const val = 200 + w * 12 + (r() - 0.5) * 46 + (r() < 0.012 ? -60 : 0); const i = (y * n + x) * 4;
    img.data[i] = clamp(val + 4, 0, 255); img.data[i + 1] = clamp(val, 0, 255); img.data[i + 2] = clamp(val - 6, 0, 255); img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0); const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = ANISO; return t;
}
function detailTex() {
  const N = LITE ? 1024 : 2048, c = canvas(N), g = c.getContext('2d'), r = rng(404);
  const m = N / DET.w, px = (x) => (x - DET.x0) * m, pz = (z) => (z - DET.z0) * m;
  g.fillStyle = 'rgb(232,232,232)'; g.fillRect(0, 0, N, N);
  for (let i = 0; i < 280; i++) { const x = r() * N, y = r() * N, rad = (3 + r() * 16) * m; const gr = g.createRadialGradient(x, y, 0, x, y, rad); const dark = r() < 0.55; gr.addColorStop(0, dark ? 'rgba(160,150,136,0.32)' : 'rgba(255,252,244,0.3)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2); }
  for (let i = 0; i < (LITE ? 22000 : 80000); i++) { const x = r() * N, y = r() * N, s = (0.03 + r() * 0.1) * m; const v = r(); g.fillStyle = v < 0.55 ? `rgba(105,94,80,${0.25 + r() * 0.4})` : `rgba(255,250,240,${0.2 + r() * 0.3})`; g.beginPath(); g.ellipse(x, y, s, s * (0.6 + r() * 0.4), r() * 3, 0, 6.283); g.fill(); }
  const line = (pts, w, col, dash) => { g.save(); g.strokeStyle = col; g.lineWidth = w * m; g.lineCap = 'round'; g.lineJoin = 'round'; if (dash) g.setLineDash(dash.map((d) => d * m)); g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(px(p[0]), pz(p[1])) : g.moveTo(px(p[0]), pz(p[1])))); g.stroke(); g.restore(); };
  const track = (pts, gauge, w, tread) => { for (const sd of [-1, 1]) { const off = offsetLine(densify(pts, 2), sd * gauge / 2); line(off, w, 'rgba(118,106,92,0.42)'); if (tread) line(off, w * 0.9, 'rgba(84,74,62,0.38)', [0.16, 0.2]); } };
  for (const cv of [[[0, -170], [2, -125], [0, -98], [4, -88], [8, -82]], [[0, -98], [-6, -70], [-12, -30], [-14, -12]], [[-4, 110], [-4, 94], [3, 86], [9, 76]], [[-4, 94], [-2, 60], [2, 30], [4, 20]], [[6, -86], [20, -60], [30, -30], [20, 0], [4, 20]]]) track(cv, 2.8, 0.62, true);
  for (const cv of [[[0, -98], [-20, -80], [-40, -58]], [[0, -98], [10, -60], [14, -24]], [[-4, 94], [-20, 70], [-30, 30], [-30, 12]]]) track(cv, 1.6, 0.26, false);
  const paths = [[[-2, -42], [-28, 8]], [[-2, -42], [26, -44]], [[-28, 8], [-70, -8]], [[-28, 8], [-70, 32]], [[-2, -42], [-62, -40]], [[10, 44], [-26, 53]], [[30, 6], [58, -8]], [[26, -44], [12, -90]], [[-2, -42], [-12, -92]], [[10, 44], [8, 86]], [[-26, 53], [-16, 88]], [[16, -18], [-2, -42]], [[30, 6], [46, 56]], [[-28, 8], [-40, 60]]];
  for (const p of paths) { const d = densify(p, 1.2).map((q) => [q[0] + (r() - .5) * 0.6, q[1] + (r() - .5) * 0.6]); line(d, 1.7, 'rgba(140,127,108,0.26)'); for (const q of densify(p, 0.55)) { if (r() < 0.45) continue; g.fillStyle = 'rgba(100,88,74,0.34)'; g.beginPath(); g.ellipse(px(q[0] + (r() - .5) * 1.3), pz(q[1] + (r() - .5) * 1.3), 0.07 * m, 0.14 * m, r() * 3, 0, 6.283); g.fill(); } }
  for (const [x, z] of [[4, 20], [-14, -12], [8, -82], [9, 76], [-40, -58], [48, 32], [14, -18]]) { const gr = g.createRadialGradient(px(x), pz(z), 0, px(x), pz(z), 3.2 * m); gr.addColorStop(0, 'rgba(58,50,42,0.55)'); gr.addColorStop(1, 'rgba(58,50,42,0)'); g.fillStyle = gr; g.fillRect(px(x) - 3.2 * m, pz(z) - 3.2 * m, 6.4 * m, 6.4 * m); }
  const t = new THREE.CanvasTexture(c); t.anisotropy = ANISO; return t;
}
function groundTex() {
  const N = LITE ? 1024 : 2048, c = canvas(N), g = c.getContext('2d');
  g.fillStyle = 'rgb(230,230,230)'; g.fillRect(0, 0, N, N);
  const m = N / MW, px = (x) => (x - MAP.x0) * m, pz = (z) => (z - MAP.z0) * m;
  const path = (pts) => { g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(px(p[0]), pz(p[1])) : g.moveTo(px(p[0]), pz(p[1])))); };
  const line = (pts, wm, col, a = 1) => { g.save(); g.globalAlpha = a; g.strokeStyle = col; g.lineWidth = Math.max(0.7, wm * m); g.lineCap = 'round'; g.lineJoin = 'round'; path(pts); g.stroke(); g.restore(); };
  const r = rng(77);
  for (let i = 0; i < (LITE ? 4000 : 14000); i++) { const l = r() < .5; g.fillStyle = l ? `rgba(255,252,245,${.05 + r() * .07})` : `rgba(170,160,145,${.05 + r() * .07})`; const s = 1 + r() * 6; g.fillRect(r() * N, r() * N, s, s); }
  line(offsetLine(EB_NEAR, 62), 9, 'rgb(252,250,246)', 0.95);
  line(densify(ROAD_SOUTH, 20), 5, 'rgb(172,162,146)');
  line(ROAD_LEXICON, 8, 'rgb(98,94,88)'); line(ROAD_PGISHA, 8, 'rgb(98,94,88)'); line(ROAD_ACCESS, 6, 'rgb(104,99,92)'); line(ROAD_EGY, 8, 'rgb(112,108,100)');
  line([[-990 + PTDX, -600], [-1300, -940], [-1700, -1340], [-2100, -1690], [-2600, -1945], [-3300, -2045]], 13, 'rgb(118,114,106)');
  g.save(); path(PT_ZONE); g.closePath(); g.clip(); g.strokeStyle = 'rgb(186,182,174)'; g.lineWidth = 8 * m;
  for (let x = -1100 + PTDX; x < -500 + PTDX; x += 70) { g.beginPath(); g.moveTo(px(x), pz(-600)); g.lineTo(px(x), pz(480)); g.stroke(); }
  for (let z = -560; z < 470; z += 70) { g.beginPath(); g.moveTo(px(-1150 + PTDX), pz(z)); g.lineTo(px(-480 + PTDX), pz(z)); g.stroke(); }
  g.restore();
  g.fillStyle = 'rgb(206,200,190)'; path(MAOZ); g.closePath(); g.fill();
  const t = tex(c); t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; return t;
}

/* ================= terrain mesh ================= */
function axis(min, max, foci) {
  const a = []; let v = min;
  const s0 = LITE ? 3.5 : 1.5, ga = LITE ? 0.05 : 0.022, cap = LITE ? 48 : 30, gr = LITE ? 1.3 : 1.22, ext = LITE ? 14000 : 30000;
  while (v < max - 1) { a.push(v); let d = 1e9; for (const f of foci) d = Math.min(d, Math.abs(v - f)); v += Math.min(cap, s0 + ga * d); }
  a.push(max);
  const lo = [], hi = []; let s = cap, u = min;
  while (u > -ext) { s *= gr; u -= s; lo.push(Math.max(u, -ext)); }
  s = cap; u = max; while (u < ext) { s *= gr; u += s; hi.push(Math.min(u, ext)); }
  return lo.reverse().concat(a, hi);
}
const XS = axis(MAP.x0, MAP.x1, [0, -76, -27, -48]), ZS = axis(MAP.z0, MAP.z1, [0, -88, 86, -103, 100]);   // the mesh fine along the trenches and the Egyptians' saps
const NX = XS.length, NZ = ZS.length;
const HGT = new Float32Array(NX * NZ);
function buildTerrain() {
  const pos = new Float32Array(NX * NZ * 3), col = new Float32Array(NX * NZ * 3), uv = new Float32Array(NX * NZ * 2), sk = new Float32Array(NX * NZ);
  const K = 1 / 0.787;
  for (let j = 0; j < NZ; j++) {
    const z = ZS[j];
    for (let i = 0; i < NX; i++) {
      const x = XS[i], k = j * NX + i; const h = terrainAt(x, z); HGT[k] = h; sk[k] = x > CITY.x0 - 40 && x < CITY.x1 + 40 && z > CITY.z0 - 40 && z < CITY.z1 + 40 ? 0 : 1;   // loose rippled sand, but not in the city of Suez
      pos[k * 3] = x; pos[k * 3 + 1] = h; pos[k * 3 + 2] = z;
      col[k * 3] = lin(COL[0]) * K; col[k * 3 + 1] = lin(COL[1]) * K; col[k * 3 + 2] = lin(COL[2]) * K;
      uv[k * 2] = (x - MAP.x0) / MW; uv[k * 2 + 1] = 1 - (z - MAP.z0) / MH;
    }
  }
  const idx = new Uint32Array((NX - 1) * (NZ - 1) * 6); let p = 0;
  for (let j = 0; j < NZ - 1; j++) for (let i = 0; i < NX - 1; i++) { const a = j * NX + i, b = a + 1, c = a + NX, d = c + 1; idx[p++] = a; idx[p++] = c; idx[p++] = b; idx[p++] = b; idx[p++] = c; idx[p++] = d; }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(col, 3)); geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  geo.setIndex(new THREE.BufferAttribute(idx, 1)); geo.computeVertexNormals(); geo.setAttribute('aSand', new THREE.BufferAttribute(sk, 1));
  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, map: groundTex(), bumpMap: sandBumpTex(), bumpScale: 0.3, roughness: 0.97, metalness: 0, envMapIntensity: 0.3 });
  const detT = detailTex(), micT = microTex();
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uDetail = { value: detT }; sh.uniforms.uMicro = { value: micT }; sh.uniforms.uRect = { value: new THREE.Vector4(DET.x0, DET.z0, DET.w, DET.w) };
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWPos;').replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWPos = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vWPos;\nuniform sampler2D uDetail;\nuniform sampler2D uMicro;\nuniform vec4 uRect;').replace('#include <map_fragment>', `#include <map_fragment>
    {
      vec2 duv = (vWPos.xz - uRect.xy) / uRect.zw;
      if (duv.x > 0.0 && duv.x < 1.0 && duv.y > 0.0 && duv.y < 1.0) {
        vec3 dcol = texture2D(uDetail, vec2(duv.x, 1.0 - duv.y)).rgb;
        float e = smoothstep(0.0, 0.07, duv.x) * (1.0 - smoothstep(0.93, 1.0, duv.x)) * smoothstep(0.0, 0.07, duv.y) * (1.0 - smoothstep(0.93, 1.0, duv.y));
        diffuseColor.rgb *= mix(vec3(1.0), dcol * 1.1, e);
      }
      float cd = length(vWPos - cameraPosition);
      float mf = 1.0 - smoothstep(20.0, 150.0, cd);
      vec3 mic = texture2D(uMicro, vWPos.xz / 3.3).rgb * texture2D(uMicro, vWPos.xz / 17.0 + 0.37).rgb;
      diffuseColor.rgb *= mix(vec3(1.0), mic * 1.55, mf * 0.85);
    }`);
  };
  mat.customProgramCacheKey = () => 'mezGround'; sandify(mat);   // the canal's sand: the wind's ripples and streamers too (4g_maps.js)
  const mesh = new THREE.Mesh(geo, mat); mesh.receiveShadow = true; scene.add(mesh);
}
function findIdx(arr, v) { let lo = 0, hi = arr.length - 1; if (v <= arr[0]) return 0; if (v >= arr[hi]) return hi - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (arr[m] <= v) lo = m; else hi = m; } return lo; }
function groundAt(x, z) {
  if (GROUND) return GROUND.at(x, z);
  if (x > CITY.x0 && x < CITY.x1 && z > CITY.z0 && z < CITY.z1) return CITY.h;
  const i = findIdx(XS, x), j = findIdx(ZS, z);
  const tx = clamp((x - XS[i]) / (XS[i + 1] - XS[i]), 0, 1), tz = clamp((z - ZS[j]) / (ZS[j + 1] - ZS[j]), 0, 1);
  const k = j * NX + i; return lerp(lerp(HGT[k], HGT[k + 1], tx), lerp(HGT[k + NX], HGT[k + NX + 1], tx), tz);
}
const surfAt = (x, z) => Math.max(groundAt(x, z), 0);
/* walkable floors and stairs inside buildings: hAt(x, z, y) is the highest surface at or just above the feet */
const FGRID = new Map(), FGS = 6;
function addSurf(s) { for (let i = Math.floor(s.x0 / FGS); i <= Math.floor(s.x1 / FGS); i++) for (let j = Math.floor(s.z0 / FGS); j <= Math.floor(s.z1 / FGS); j++) { const k = i * 100003 + j; let a = FGRID.get(k); if (!a) FGRID.set(k, (a = [])); a.push(s); } return s; }
function addFloor(x0, x1, z0, z1, y) { return addSurf({ x0, x1, z0, z1, y }); }
function addRamp(x0, x1, z0, z1, axis, a0, a1, y0, y1) { return addSurf({ x0, x1, z0, z1, ramp: true, axis, a0, a1, y0, y1 }); }
function surfY(s, x, z) { if (!s.ramp) return s.y; const c = s.axis === 'x' ? x : z; return s.y0 + (s.y1 - s.y0) * clamp((c - s.a0) / (s.a1 - s.a0), 0, 1); }
function hAt(x, z, y = -1e9) {
  let h = groundAt(x, z); if (y < h - 0.5) return h; const a = FGRID.get(Math.floor(x / FGS) * 100003 + Math.floor(z / FGS)); if (!a) return h;   // feet a hair under the ground (gravity's dip each frame) still count as standing on it
  for (const s of a) { if (x < s.x0 || x > s.x1 || z < s.z0 || z > s.z1) continue; const sy = surfY(s, x, z); if (sy <= y + 0.6 && sy > h) h = sy; }
  return h;
}
function los(ax, ay, az, bx, by, bz) {
  const d = Math.hypot(bx - ax, bz - az); const n = Math.max(2, Math.ceil(d / 2.5));
  for (let i = 1; i < n; i++) { const t = i / n; if (groundAt(ax + (bx - ax) * t, az + (bz - az) * t) > ay + (by - ay) * t + 0.1) return false; }
  return true;
}

/* ================= sky, sun, water ================= */
const LAT = THREE.MathUtils.degToRad(29.93), DEC = THREE.MathUtils.degToRad(-5.2);
function sunVec(minutes) {
  const H = THREE.MathUtils.degToRad((minutes - 698) * 0.25);
  const sinEl = Math.sin(LAT) * Math.sin(DEC) + Math.cos(LAT) * Math.cos(DEC) * Math.cos(H); const el = Math.asin(sinEl);
  let az = Math.acos(clamp((Math.sin(DEC) - sinEl * Math.sin(LAT)) / (Math.cos(el) * Math.cos(LAT)), -1, 1)); if (H > 0) az = Math.PI * 2 - az;
  return dirFrom(THREE.MathUtils.radToDeg(az), THREE.MathUtils.radToDeg(el));
}
const START_MIN = 13 * 60 + 55;
const sky = new Sky(); sky.scale.setScalar(FAR * 0.8); scene.add(sky);
const SKYU = sky.material.uniforms; SKYU.turbidity.value = 3.2; SKYU.rayleigh.value = 0.95; SKYU.mieCoefficient.value = 0.003; SKYU.mieDirectionalG.value = 0.8;
const envSky = new Sky(); envSky.scale.setScalar(10); const envScene = new THREE.Scene(); envScene.add(envSky);
for (const k of ['turbidity', 'rayleigh', 'mieCoefficient', 'mieDirectionalG']) envSky.material.uniforms[k].value = SKYU[k].value;
const pmrem = new THREE.PMREMGenerator(renderer); let envRT = null;
let ENV_HOLD = true;   // the reflections of the sky are made when the first mission loads (envReady), not at start-up: the menu draws no world
function envReady() { if (!ENV_HOLD) return; ENV_HOLD = false; SUN.lastEnv = -99; setTimeOfDay(0); }
/* the night sky of a real night (the rescue): a deep blue dome that fades in over the daylight sky, stars, and a moon with a halo. It is centred on the camera */
const NSKY = (() => {
  const g = new THREE.Group(); g.visible = false; const R = FAR * 0.3;
  const geo = new THREE.SphereGeometry(R, 28, 14), pos = geo.attributes.position, col = new Float32Array(pos.count * 3), z0 = new THREE.Color(0x080f22), hz = new THREE.Color(0x27375d), c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) { const y = pos.getY(i) / R; c.copy(hz).lerp(z0, smooth(-0.03, 0.7, y)); if (y < 0) c.multiplyScalar(0.8 + 0.2 * Math.max(0, 1 + y * 3)); col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const dome = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, transparent: true, opacity: 0, depthWrite: false, toneMapped: false })); dome.frustumCulled = false; dome.renderOrder = -30; g.add(dome);
  const n = LITE ? 500 : 1100, sp = new Float32Array(n * 3), sc = new Float32Array(n * 3), r = rng(1973);
  for (let i = 0; i < n; i++) { const a = r() * 6.2832, y = 0.04 + r() * 0.96, q = Math.sqrt(1 - y * y), k = 0.35 + r() * 0.65, w = r(); sp[i * 3] = Math.sin(a) * q * R * 0.98; sp[i * 3 + 1] = y * R * 0.98; sp[i * 3 + 2] = Math.cos(a) * q * R * 0.98; sc[i * 3] = k * (w < 0.15 ? 1 : 0.85); sc[i * 3 + 1] = k * 0.9; sc[i * 3 + 2] = k * (w < 0.15 ? 0.8 : 1); }
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(sp, 3)); sg.setAttribute('color', new THREE.BufferAttribute(sc, 3));
  // each star is a soft dot a few pixels wide, not a hard point: a hard point snaps between pixels as the camera moves and the whole sky twinkles
  const sc2 = document.createElement('canvas'); sc2.width = sc2.height = 32; { const x = sc2.getContext('2d'); const gr = x.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,0.85)'); gr.addColorStop(0.6, 'rgba(255,255,255,0.18)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 32, 32); }
  const st = new THREE.CanvasTexture(sc2); st.colorSpace = THREE.SRGBColorSpace;
  const stars = new THREE.Points(sg, new THREE.PointsMaterial({ size: 6, sizeAttenuation: false, map: st, vertexColors: true, transparent: true, opacity: 0, depthWrite: false, fog: false, toneMapped: false, blending: THREE.AdditiveBlending })); stars.frustumCulled = false; stars.renderOrder = -29; g.add(stars);
  const cv = document.createElement('canvas'); cv.width = cv.height = 128; const x = cv.getContext('2d'); let gr = x.createRadialGradient(64, 64, 40, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.5, 'rgba(236,240,255,0.9)'); gr.addColorStop(1, 'rgba(220,228,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 128, 128); x.fillStyle = 'rgba(190,200,230,0.35)'; for (const [mx, my, mr] of [[52, 58, 9], [76, 70, 6], [62, 80, 5], [70, 48, 4]]) { x.beginPath(); x.arc(mx, my, mr, 0, 6.3); x.fill(); }
  const mt = new THREE.CanvasTexture(cv); mt.colorSpace = THREE.SRGBColorSpace;
  const moon = new THREE.Sprite(new THREE.SpriteMaterial({ map: mt, transparent: true, opacity: 0, depthWrite: false, fog: false, toneMapped: false })); moon.scale.setScalar(R * 0.045); moon.renderOrder = -27; g.add(moon);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: null, transparent: true, opacity: 0, depthWrite: false, fog: false, toneMapped: false, blending: THREE.AdditiveBlending, color: 0x7f92c8 })); halo.scale.setScalar(R * 0.2); halo.renderOrder = -28; g.add(halo);
  scene.add(g); return { g, dome, stars, moon, halo, R };
})();
function nightSkySet(deep) {
  NSKY.g.visible = deep > 0.02; if (!NSKY.g.visible) return;
  NSKY.dome.material.opacity = deep; NSKY.stars.material.opacity = deep * 0.95; NSKY.moon.material.opacity = deep; NSKY.halo.material.opacity = deep * 0.55;
  if (!NSKY.halo.material.map && typeof FXT !== 'undefined' && FXT.flare) { NSKY.halo.material.map = FXT.flare; NSKY.halo.material.needsUpdate = true; }
  const d = MOON, R = NSKY.R * 0.97; NSKY.moon.position.set(d.x * R, d.y * R, d.z * R); NSKY.halo.position.copy(NSKY.moon.position);
}
const hemi = new THREE.HemisphereLight(0xc4d6ee, 0x9c8466, 0.42); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff0da, 3.1); scene.add(sun, sun.target);
if (SHADOWS) { sun.castShadow = true; sun.shadow.mapSize.set(LITE || PHONE ? 2048 : 3072, LITE || PHONE ? 2048 : 3072); const sc = sun.shadow.camera; sc.left = -88; sc.right = 88; sc.top = 88; sc.bottom = -88; sc.near = 1; sc.far = 900; sun.shadow.bias = -0.00025; sun.shadow.normalBias = 0.06; }
const SUN = { dir: V3(0, 1, 0), lastEnv: -99 };
/* ---- waves: three trains of swell and chop. The same sum is evaluated in GLSL (the surface is displaced) and in JS (everything that
   floats rides it), so a boat sits on the water it is drawn on. The grid is camera-centred: fine cells underfoot, growing toward the horizon. */
const WAVE = { t: 0, amp: 1, step: LITE ? 1.8 : 1.2, dirs: [[0.8, 0.6], [0.6, 0.8], [0.9536, -0.3011]], k: [0.5712, 0.8976, 1.3659], w: [2.366, 2.9659, 3.6588], a: [0.16, 0.09, 0.04] };
const _wv = { h: 0, sx: 0, sz: 0 };
function waveH(x, z, out) {
  let h = 0, sx = 0, sz = 0;
  for (let i = 0; i < 3; i++) { const d = WAVE.dirs[i], ph = (d[0] * x + d[1] * z) * WAVE.k[i] - WAVE.t * WAVE.w[i], A = WAVE.a[i] * WAVE.amp; h += A * Math.sin(ph); if (out) { const c = A * WAVE.k[i] * Math.cos(ph); sx += c * d[0]; sz += c * d[1]; } }
  if (out) { out.h = h; out.sx = sx; out.sz = sz; }
  return h;
}
/* the pitch and roll of a hull riding the waves: heights fore/aft and port/starboard of (x, z) along heading h */
function waveTilt(x, z, h, L, W, out) {
  const fx = Math.sin(h), fz = Math.cos(h);
  const hf = waveH(x + fx * L, z + fz * L), hb = waveH(x - fx * L, z - fz * L), hl = waveH(x + fz * W, z - fx * W), hr = waveH(x - fz * W, z + fx * W);
  out.h = (hf + hb + hl + hr) / 4; out.pitch = Math.atan2(hf - hb, 2 * L); out.roll = Math.atan2(hl - hr, 2 * W); return out;
}
const WAVE_GLSL = `
uniform float uWT; uniform float uWA;
vec3 waveHN(vec2 p, float t, float d) {
  vec3 r = vec3(0.0); float ph, c, f;
  f = 1.0 - smoothstep(90.0, 240.0, d); ph = dot(vec2(0.8, 0.6), p) * 0.5712 - t * 2.366; c = 0.16 * 0.5712 * cos(ph) * f; r += vec3(0.16 * sin(ph) * f, c * 0.8, c * 0.6);
  f = 1.0 - smoothstep(45.0, 130.0, d); ph = dot(vec2(0.6, 0.8), p) * 0.8976 - t * 2.9659; c = 0.09 * 0.8976 * cos(ph) * f; r += vec3(0.09 * sin(ph) * f, c * 0.6, c * 0.8);
  f = 1.0 - smoothstep(18.0, 60.0, d); ph = dot(vec2(0.9536, -0.3011), p) * 1.3659 - t * 3.6588; c = 0.04 * 1.3659 * cos(ph) * f; r += vec3(0.04 * sin(ph) * f, c * 0.9536, c * -0.3011);
  return r * uWA;
}`;
function waterGrid(s0, g1, R1, g2, R2) {
  const xs = [0]; let s = s0, x = 0; while (x < R2) { x += s; xs.push(x); s *= x < R1 ? g1 : g2; }
  const ax = [...xs.slice(1).reverse().map((v) => -v), ...xs], n = ax.length, pos = new Float32Array(n * n * 3), nrm = new Float32Array(n * n * 3), idx = []; let p = 0;
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { pos[p] = ax[i]; pos[p + 1] = ax[j]; nrm[p + 2] = 1; p += 3; }
  for (let j = 0; j < n - 1; j++) for (let i = 0; i < n - 1; i++) { const a = j * n + i, b = a + 1, c = a + n, d = c + 1; idx.push(a, b, c, b, d, c); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(nrm, 3)); geo.setIndex(idx); geo.computeBoundingSphere(); return geo;
}
let water; const WATER_U = { uWT: { value: 0 }, uWA: { value: 1 } };
if (LITE) {
  const wn = waterNormalTex(); wn.repeat.set(1100, 1100);
  const wm = new THREE.MeshStandardMaterial({ color: 0x1d4b56, roughness: 0.15, metalness: 0.35, normalMap: wn, normalScale: new THREE.Vector2(0.45, 0.45) });
  wm.onBeforeCompile = (sh) => { sh.uniforms.uWT = WATER_U.uWT; sh.uniforms.uWA = WATER_U.uWA;
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\n' + WAVE_GLSL)
      .replace('#include <beginnormal_vertex>', 'vec4 wwp = modelMatrix * vec4( position, 1.0 ); vec3 wv = waveHN( wwp.xz, uWT, distance( wwp.xz, cameraPosition.xz ) ); vec3 objectNormal = normalize( vec3( -wv.y, wv.z, 1.0 ) );')
      .replace('#include <begin_vertex>', 'vec3 transformed = vec3( position ); transformed.z += wv.x;'); };
  wm.customProgramCacheKey = () => 'wavewater';
  water = new THREE.Mesh(QUAL === 'low' ? waterGrid(2.8, 1.06, 200, 1.16, 7000) : waterGrid(1.8, 1.04, 240, 1.14, 9000), wm);   // the sea is finest under the camera and coarser outward; low quality coarser still
} else {
  water = new Water(waterGrid(1.2, 1.03, 320, 1.12, 14000), { textureWidth: 1024, textureHeight: 1024, waterNormals: waterNormalTex(), sunDirection: V3(0, 1, 0), sunColor: 0xa99d8a, waterColor: 0x14404b, distortionScale: 3.2, fog: true });
  const M = water.material; M.uniforms.size.value = 0.6; M.uniforms.uWT = WATER_U.uWT; M.uniforms.uWA = WATER_U.uWA;
  M.vertexShader = M.vertexShader.replace('varying vec4 worldPosition;', 'varying vec4 worldPosition; varying vec3 vWaveN;' + WAVE_GLSL)
    .replace(/mirrorCoord = modelMatrix[\s\S]*?modelViewMatrix \* vec4\( position, 1\.0 \);/, 'vec4 wp = modelMatrix * vec4( position, 1.0 ); vec3 wv = waveHN( wp.xz, uWT, distance( wp.xz, cameraPosition.xz ) ); wp.y += wv.x; vWaveN = vec3( -wv.y, 1.0, -wv.z );\n worldPosition = wp; mirrorCoord = textureMatrix * wp; vec4 mvPosition = viewMatrix * wp;');
  M.fragmentShader = M.fragmentShader.replace('float rf0 = 0.3;', 'float rf0 = 0.07;').replace('varying vec4 worldPosition;', 'varying vec4 worldPosition; varying vec3 vWaveN;')
    .replace('vec3 surfaceNormal = normalize( noise.xzy * vec3( 1.5, 1.0, 1.5 ) );', 'vec3 surfaceNormal = normalize( noise.xzy * vec3( 1.5, 1.0, 1.5 ) + vec3( vWaveN.x, 0.0, vWaveN.z ) * 2.4 );');
}
water.rotation.x = -Math.PI / 2; water.frustumCulled = false; scene.add(water);
function animateWater(dt) {
  WAVE.t += dt; WATER_U.uWT.value = WAVE.t; WATER_U.uWA.value = WAVE.amp;
  const s = WAVE.step; water.position.x = Math.round(camera.position.x / s) * s; water.position.z = Math.round(camera.position.z / s) * s;
  if (water.material.uniforms) water.material.uniforms.time.value += dt * 0.5; else { water.material.normalMap.offset.x += dt * 0.0035; water.material.normalMap.offset.y += dt * 0.0021; }
}
const LIGHTS = {
  flareA: new THREE.PointLight(0xfff0d0, 0, 0, 2), flareB: new THREE.PointLight(0xfff0d0, 0, 0, 2),
  fire: new THREE.PointLight(0xff8a3a, 0, 0, 2), muzzle: new THREE.PointLight(0xffc27a, 0, 0, 2), boom: new THREE.PointLight(0xffa060, 0, 0, 2),
};
for (const k of LITE ? ['fire', 'boom'] : ['fire', 'muzzle', 'boom', 'flareA', 'flareB']) scene.add(LIGHTS[k]);   // on a desktop the illumination rounds really light the ground
LIGHTS.fire.position.set(12, 8, 104);
const vmHemi = new THREE.HemisphereLight(0xc4d6ee, 0x6e5c46, 0.55); vmScene.add(vmHemi);
const vmKey = new THREE.DirectionalLight(0xfff0da, 2.3); vmScene.add(vmKey, vmKey.target);
const vmMuzzle = new THREE.PointLight(0xffc27a, 0, 3, 2); vmMuzzle.position.set(0.1, 0, -0.9); vmScene.add(vmMuzzle);
const vmFlare = new THREE.DirectionalLight(0xfff0d0, 0); vmFlare.position.set(0.3, 1, -0.2); vmScene.add(vmFlare);
const MOON = dirFrom(140, 48), FOG_DAY = new THREE.Color(0xbac5cc), FOG_NIGHT = new THREE.Color(0x52627e), HEMI_DAY = [new THREE.Color(0xc4d6ee), new THREE.Color(0x9c8466)], HEMI_NIGHT = [new THREE.Color(0xb4c6e6), new THREE.Color(0x857a64)];
const _skyV = V3(0, 1, 0), _nc = new THREE.Color();
/* the look of a real night, for the chapters that ask for one (the rescue of Purkan): a cold, bright moon, a dark blue sky, long shadows -
   dark enough to be night, bright enough that a man at two hundred metres still reads as a man. It fades into the ordinary twilight look toward dawn */
const NIGHT_LOOK = { moonI: 0.74, moonCol: 0x88a3e8, hemiI: 0.34, hemiSky: 0x4e66a8, hemiGnd: 0x2c2c3a, fog: 0x15203a, fogK: 1.5, exp: 0.57, skyY: 0.03, from: -0.34, to: -0.06, ray: 0.95, turb: 3.2, mie: 0.003 };
const SKY_DAY = { ray: 0.95, turb: 3.2, mie: 0.003 }; const SKY_HAZE = { ray: 0.22, turb: 12, mie: 0.016 }; const WATER_BASE = new THREE.Color(0x14404b), WATER_HAZE = new THREE.Color(0x32503f);
let NIGHT_DEEP = 0, FLARE_LIGHT = 0;   // FLARE_LIGHT: how much an illumination round overhead brightens the whole scene (0..1), set by the night chapter each frame
function setTimeOfDay(min) {
  // "day for night": night and dawn are a bright, cold moonlight - everything must stay readable, only the tint says it is night
  const d = sunVec(START_MIN + min), day = smooth(-0.05, 0.1, d.y), dusk = 1 - smooth(0.0, 0.16, d.y), sunI = 3.1 * smooth(-0.02, 0.12, d.y), moonI = 1.75 * dusk;
  const useSun = sunI >= moonI; SUN.dir.copy(useSun ? d : MOON); sun.intensity = Math.max(sunI, moonI, 1.2); sun.color.setHex(useSun ? 0xfff0da : 0xd6e0f4);
  hemi.intensity = lerp(0.42, 0.78, dusk); hemi.color.copy(HEMI_DAY[0]).lerp(HEMI_NIGHT[0], dusk); hemi.groundColor.copy(HEMI_DAY[1]).lerp(HEMI_NIGHT[1], dusk); scene.fog.color.copy(FOG_DAY).lerp(FOG_NIGHT, dusk); renderer.toneMappingExposure = lerp(0.5, 0.72, dusk) + 0.08 * (1 - day) * (1 - dusk);
  const N = NIGHT_LOOK, C0 = CHAP[MODE], deep = NIGHT_DEEP = C0 && C0.night && MODE !== 'mezach' ? 1 - smooth(N.from, N.to, d.y) : 0; let skyMin = 0.03;
  if (deep > 0) { sun.intensity = lerp(sun.intensity, N.moonI, deep); sun.color.lerp(_nc.setHex(N.moonCol), deep); hemi.intensity = lerp(hemi.intensity, N.hemiI, deep); hemi.color.lerp(_nc.setHex(N.hemiSky), deep); hemi.groundColor.lerp(_nc.setHex(N.hemiGnd), deep); scene.fog.color.lerp(_nc.setHex(N.fog), deep); renderer.toneMappingExposure = lerp(renderer.toneMappingExposure, N.exp, deep); skyMin = lerp(0.03, N.skyY, deep); }
  if (scene.fog.isFogExp2) scene.fog.density = 0.00013 * lerp(1, N.fogK, deep) * (MODE === 'hermon' ? 0.15 : 1);   // the Hermon's clear mountain air nightSkySet(deep);
  // the Mezach: dust and smoke over the canal at Port Tewfik - a pale sand-grey haze that softens the far bank and swallows the city behind it
  const hz = MODE === 'mezach' ? 1 - 0.6 * dusk : 0; if (hz > 0) { if (scene.fog.isFogExp2) scene.fog.density = Math.max(scene.fog.density, 0.0014 * hz); scene.fog.color.lerp(_nc.setHex(0xc4b9a0), 0.8 * hz); }
  if (water && water.material.uniforms && water.material.uniforms.waterColor) water.material.uniforms.waterColor.value.copy(WATER_BASE).lerp(WATER_HAZE, 0.65 * hz);
  // an illumination round overhead: the whole ground brightens and warms while it burns (on a phone this is all the light it gives)
  if (FLARE_LIGHT > 0) { hemi.intensity += 0.7 * FLARE_LIGHT; sun.intensity += 0.7 * FLARE_LIGHT; sun.color.lerp(_nc.setHex(0xfff0d0), 0.6 * FLARE_LIGHT); hemi.color.lerp(_nc.setHex(0xe8e0d0), 0.5 * FLARE_LIGHT); }
  if (deep > 0 || hz > 0 || SKYU.rayleigh.value !== SKY_DAY.ray) for (const [k, u] of [['ray', 'rayleigh'], ['turb', 'turbidity'], ['mie', 'mieCoefficient']]) { const v = lerp(lerp(SKY_DAY[k], N[k], deep), SKY_HAZE[k], 0.92 * hz); if (SKYU[u].value !== v) { SKYU[u].value = v; envSky.material.uniforms[u].value = v; } }
  vmKey.intensity = 1.15 / renderer.toneMappingExposure; vmHemi.intensity = 0.275 / renderer.toneMappingExposure; vmKey.color.copy(sun.color); vmHemi.color.copy(hemi.color);
  // the sky never goes black: its sun is held just above the horizon, so night is a deep, glowing blue and the reflections keep some light (a real night holds it a touch below)
  _skyV.copy(d); if (_skyV.y < skyMin) { _skyV.y = skyMin; _skyV.normalize(); }
  SKYU.sunPosition.value.copy(_skyV); envSky.material.uniforms.sunPosition.value.copy(_skyV);
  sun.position.copy(SUN.dir).multiplyScalar(400).add(sun.target.position);
  if (water.material.uniforms) water.material.uniforms.sunDirection.value.copy(d);
  if (!ENV_HOLD && Math.abs(min - SUN.lastEnv) > 8) { SUN.lastEnv = min; const old = envRT; envRT = pmrem.fromScene(envScene, 0.02, 0.1, 100); scene.environment = envRT.texture; vmScene.environment = envRT.texture; if (old) old.dispose(); }
}
const ENVK = 0.4;
function dimEnv(root) { root.traverse((o) => { const ms = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : []; for (const m of ms) if (m.isMeshStandardMaterial && !m.userData.envDone) { m.userData.envDone = true; if (m.envMapIntensity === 1) m.envMapIntensity = ENVK; } }); }
function followSun(x, z) { const sx = Math.round(x / 3) * 3, sz = Math.round(z / 3) * 3; sun.target.position.set(sx, 0, sz); sun.position.copy(SUN.dir).multiplyScalar(400).add(sun.target.position); }
const _q = new THREE.Quaternion();
function updateVmLight() { _q.copy(camera.quaternion).invert(); vmKey.position.copy(SUN.dir).applyQuaternion(_q).multiplyScalar(5); vmKey.target.position.set(0, 0, 0); }
setTimeOfDay(0);
