
/* =====================================================================================
   CHAPTER 2 · SUEZ CITY, 24 OCTOBER 1973
   A tank column drives into the city along the main avenue. At the Arbaeen junction the
   tank is hit, the crew bails out with the paratroopers, takes the corner building floor
   by floor and holds it until dark.  (local coordinates: +x east, -z north, origin = CITY centre)
   ===================================================================================== */
const SZ_GUN = [-59, -19.6, 0.82];   // the anti-tank gun in its pit at the mouth of the north street: x, z (local), heading of the barrel
const SZ = { built: false, objs: [], mezObjs: [], covers: [], slots: [], foot: [], blocks: [], tb: null, stage: 0, t: 0, cp: 0, wave: 0, holdT: 0, msgs: {}, groups: [] };
const LX = (x) => CITY.cx + x, LZ = (z) => CITY.cz + z, CHH = CITY.h, FLH = 4.25;   // a storey: rooms a third higher than they were, so the fight indoors has air over it
const SZ_MIN = 10 * 60 + 40;

/* ---------- textures ---------- */
function facadeTile(seed, plaster, shut, ground) {
  const W = 256, H = 128, c = canvas(W * 2, H * 2), g = c.getContext('2d'), r = rng(seed); g.scale(2, 2);
  g.fillStyle = plaster; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 900; i++) { g.fillStyle = r() < 0.5 ? 'rgba(80,66,48,0.10)' : 'rgba(255,250,235,0.10)'; g.fillRect(r() * W, r() * H, 2 + r() * 6, 1 + r() * 4); }
  if (ground) {
    // shop front: rolling steel shutters, a painted sign band
    g.fillStyle = 'rgba(60,50,40,0.5)'; g.fillRect(0, 16, W, 18);
    const signs = ['بقالة', 'مخبز', 'صيدلية', 'ترزي', 'مقهى', 'حلاق'];
    g.fillStyle = r() < 0.5 ? '#2f5d4a' : '#7a2e22'; g.fillRect(14, 18, W - 28, 14);
    g.fillStyle = '#efe6cf'; g.font = 'bold 12px Arial'; g.textAlign = 'center'; g.direction = 'rtl'; g.fillText(signs[Math.floor(r() * signs.length)], W / 2, 29);
    for (const x0 of [12, 132]) {
      g.fillStyle = '#6d6a62'; g.fillRect(x0, 38, 112, 86); g.fillStyle = 'rgba(30,28,24,0.45)'; for (let y = 40; y < 124; y += 5) g.fillRect(x0, y, 112, 1.5);
      if (r() < 0.35) { g.fillStyle = '#141210'; g.fillRect(x0 + 6, 70, 100, 54); }
    }
    g.fillStyle = 'rgba(40,34,28,0.55)'; g.fillRect(0, H - 6, W, 6);
  } else {
    g.fillStyle = 'rgba(120,104,84,0.35)'; g.fillRect(0, H - 9, W, 5);
    for (const x0 of [34, 162]) {
      const w = 60, h = 78, y0 = 22, k = r();
      g.fillStyle = 'rgba(70,58,44,0.35)'; g.fillRect(x0 - 5, y0 - 5, w + 10, h + 8);
      g.fillStyle = '#16130f'; g.fillRect(x0, y0, w, h);
      if (k < 0.55) { g.fillStyle = shut; g.fillRect(x0, y0, w * 0.48, h); g.fillRect(x0 + w * 0.52, y0, w * 0.48, h); g.fillStyle = 'rgba(0,0,0,0.3)'; for (let y = y0 + 3; y < y0 + h; y += 5) { g.fillRect(x0, y, w * 0.48, 1.5); g.fillRect(x0 + w * 0.52, y, w * 0.48, 1.5); } if (k < 0.25) { g.fillStyle = '#16130f'; g.fillRect(x0 + w * 0.52, y0, w * 0.48, h); } }
      else if (k < 0.75) { g.fillStyle = 'rgba(140,160,170,0.25)'; g.fillRect(x0 + 4, y0 + 4, w * 0.4, h * 0.45); }
      g.fillStyle = 'rgba(30,26,20,0.5)'; g.fillRect(x0 - 6, y0 + h + 2, w + 12, 5);
      const st = g.createLinearGradient(0, y0 + h, 0, H); st.addColorStop(0, 'rgba(70,60,46,0.3)'); st.addColorStop(1, 'rgba(70,60,46,0)'); g.fillStyle = st; g.fillRect(x0 + 8, y0 + h + 6, w - 16, H - y0 - h);
    }
  }
  if (r() < 0.5) { g.fillStyle = 'rgba(20,18,14,0.5)'; for (let i = 0; i < 18; i++) { const x = r() * W, y = r() * H; g.beginPath(); g.arc(x, y, 1 + r() * 2.5, 0, 6.28); g.fill(); } }
  facadeWeather(g, W, H, r, ground, plaster);
  const t = tex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
// what twenty-five years of sun, rain and neglect do to a plastered wall
function facadeWeather(g, W, H, r, ground, plaster) {
  g.lineCap = 'round';
  // fine plaster grain and hairline cracks
  for (let i = 0; i < 1400; i++) { g.fillStyle = r() < 0.5 ? 'rgba(60,50,38,0.07)' : 'rgba(255,252,240,0.08)'; g.fillRect(r() * W, r() * H, 0.6 + r() * 1.6, 0.6 + r() * 1.2); }
  for (let k = 0; k < 2 + Math.floor(r() * 3); k++) { let x = r() * W, y = r() * H * 0.6; g.strokeStyle = `rgba(40,34,26,${0.25 + r() * 0.3})`; g.lineWidth = 0.5 + r() * 0.5; g.beginPath(); g.moveTo(x, y); for (let j = 0; j < 7; j++) { x += (r() - 0.5) * 9; y += 4 + r() * 9; g.lineTo(x, y); } g.stroke(); }
  // flaked patches show the grey render and a little brick underneath
  for (let k = 0; k < (r() < 0.5 ? 1 : 2); k++) { const x = r() * W, y = H * (0.45 + r() * 0.45), w = 8 + r() * 22, h = 5 + r() * 12; g.fillStyle = 'rgba(150,140,124,0.9)'; g.beginPath(); for (let a = 0; a < 6.3; a += 0.7) g.lineTo(x + Math.cos(a) * w * (0.7 + r() * 0.4), y + Math.sin(a) * h * (0.7 + r() * 0.4)); g.closePath(); g.fill(); if (r() < 0.5) { g.fillStyle = 'rgba(140,84,60,0.75)'; for (let yy = y - h * 0.4; yy < y + h * 0.4; yy += 3) for (let xx = x - w * 0.5; xx < x + w * 0.5; xx += 6) g.fillRect(xx + ((yy / 3) | 0) % 2 * 3, yy, 5, 2); } }
  // damp and rust streaks running down from the sills and the roof line, soot above the shop fronts
  for (let k = 0; k < 3 + Math.floor(r() * 4); k++) { const x = r() * W, y0 = ground ? 34 + r() * 20 : 18 + r() * 60, len = 10 + r() * 40, st = g.createLinearGradient(0, y0, 0, y0 + len); const col = r() < 0.4 ? '120,70,40' : '70,62,50'; st.addColorStop(0, `rgba(${col},0.35)`); st.addColorStop(1, `rgba(${col},0)`); g.fillStyle = st; g.fillRect(x, y0, 1.5 + r() * 2.5, len); }
  { const st = g.createLinearGradient(0, 0, 0, 14); st.addColorStop(0, 'rgba(50,44,36,0.45)'); st.addColorStop(1, 'rgba(50,44,36,0)'); g.fillStyle = st; g.fillRect(0, 0, W, 14); }
  { const st = g.createLinearGradient(0, H - 16, 0, H); st.addColorStop(0, 'rgba(90,76,58,0)'); st.addColorStop(1, 'rgba(90,76,58,0.55)'); g.fillStyle = st; g.fillRect(0, H - 16, W, 16); }
  if (!ground) {
    // an air conditioner on a bracket, dripping; a drainpipe; a telephone wire
    if (r() < 0.55) { const x = r() < 0.5 ? 100 : 228, y = 30 + r() * 30; g.fillStyle = '#cfcac0'; g.fillRect(x, y, 22, 14); g.fillStyle = 'rgba(0,0,0,0.35)'; for (let yy = y + 2; yy < y + 13; yy += 2.5) g.fillRect(x + 2, yy, 18, 1); g.fillStyle = '#3a3836'; g.fillRect(x - 2, y + 14, 26, 2); g.fillRect(x + 1, y + 16, 2, 8); g.fillRect(x + 19, y + 16, 2, 8); const st = g.createLinearGradient(0, y + 16, 0, y + 70); st.addColorStop(0, 'rgba(60,66,60,0.45)'); st.addColorStop(1, 'rgba(60,66,60,0)'); g.fillStyle = st; g.fillRect(x + 6, y + 16, 10, 54); }
    if (r() < 0.5) { const x = r() < 0.5 ? 4 : W - 10; g.fillStyle = '#7d7568'; g.fillRect(x, 0, 4, H); g.fillStyle = 'rgba(0,0,0,0.3)'; g.fillRect(x + 3, 0, 1, H); g.fillStyle = '#6a6256'; for (const yy of [20, 70]) g.fillRect(x - 1.5, yy, 7, 4); }
    if (r() < 0.6) { g.strokeStyle = 'rgba(20,18,16,0.8)'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(0, 8 + r() * 8); g.quadraticCurveTo(W / 2, 20 + r() * 10, W, 8 + r() * 8); g.stroke(); }
  } else if (r() < 0.6) {
    // posters and a scrawl by the shop door
    for (let k = 0; k < 1 + Math.floor(r() * 2); k++) { const x = 20 + r() * (W - 60), y = 44 + r() * 30; g.fillStyle = ['#c9b68a', '#b23a2e', '#2d5a86'][Math.floor(r() * 3)]; g.fillRect(x, y, 10 + r() * 8, 13 + r() * 8); g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(x + 2, y + 2, 5, 2); g.fillRect(x + 2, y + 6, 8, 1.5); }
  }
}
function plasterTex(seed, base) {
  const W = 256, c = canvas(W, W), g = c.getContext('2d'), r = rng(seed); g.fillStyle = base; g.fillRect(0, 0, W, W);
  for (let i = 0; i < 2600; i++) { g.fillStyle = r() < 0.5 ? 'rgba(70,58,44,0.04)' : 'rgba(255,250,235,0.05)'; g.fillRect(r() * W, r() * W, 2 + r() * 6, 1 + r() * 4); }
  tileBlotches(g, W, r, 14, 12, 48, 'rgba(90,76,58,0.07)', 'rgba(255,255,255,0.06)', 0.6); g.lineCap = 'round';
  for (let k = 0; k < 3; k++) { let x = r() * W, y = r() * W; g.strokeStyle = `rgba(50,42,32,${0.2 + r() * 0.25})`; g.lineWidth = 0.6 + r() * 0.6; g.beginPath(); g.moveTo(x, y); for (let j = 0; j < 6; j++) { x += (r() - 0.5) * 14; y += 5 + r() * 12; g.lineTo(x, y); } g.stroke(); }
  for (let k = 0; k < 2; k++) { const x = r() * W, y = r() * W, w = 10 + r() * 24, h = 6 + r() * 14; g.fillStyle = 'rgba(150,140,124,0.3)'; g.beginPath(); for (let a = 0; a < 6.3; a += 0.8) g.lineTo(x + Math.cos(a) * w * (0.7 + r() * 0.4), y + Math.sin(a) * h * (0.7 + r() * 0.4)); g.closePath(); g.fill(); }
  const t = tex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}

/* ---------- building blocks: facade boxes merged per material ---------- */
function boxUV(x0, x1, y0, y1, z0, z1, tw, th) {
  const g = new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0); g.translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
  const uv = g.attributes.uv, n = g.attributes.normal;
  for (let i = 0; i < uv.count; i++) {
    const nx = Math.abs(n.getX(i)), ny = Math.abs(n.getY(i)), u = uv.getX(i), v = uv.getY(i);
    const w = nx > 0.5 ? (z1 - z0) : (x1 - x0), h = ny > 0.5 ? (z1 - z0) : (y1 - y0);
    uv.setXY(i, u * w / tw, v * h / th);
  }
  return g;
}
// the shade a wall carries: darker where it meets the pavement and under the slab or parapet above it (baked into the vertex colours)
function aoBox(g, y0, y1, bottomK, topK) {
  const p = g.attributes.position, col = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) { const y = p.getY(i), k = lerp(bottomK, 1, smooth(y0, y0 + 1.4, y)) * lerp(1, topK, smooth(y1 - 0.9, y1, y)); col[i * 3] = k; col[i * 3 + 1] = k; col[i * 3 + 2] = k; }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3)); return g;
}
function cityBuilding(b, mats, lists) {
  // b: {x0,x1,z0,z1,fl (floors), v (variant), solid}
  const X0 = LX(b.x0), X1 = LX(b.x1), Z0 = LZ(b.z0), Z1 = LZ(b.z1), top = CHH + b.fl * FLH;
  lists.ground[b.v % lists.ground.length].push(aoBox(boxUV(X0, X1, CHH - 0.3, CHH + FLH, Z0, Z1, 7, FLH + 0.3), CHH - 0.3, CHH + FLH, 0.62, 0.88));
  if (b.fl > 1) lists.upper[b.v % lists.upper.length].push(aoBox(boxUV(X0, X1, CHH + FLH, top, Z0, Z1, 7, FLH), CHH + FLH, top, 0.9, 0.84));
  // roof: parapet, water tank, stair hut, antenna
  const rr = rng(Math.round(b.x0 * 13 + b.z0 * 7) >>> 0), par = lists.roof;
  for (const [a0, a1, c0, c1] of [[X0, X1, Z0, Z0 + 0.25], [X0, X1, Z1 - 0.25, Z1], [X0, X0 + 0.25, Z0, Z1], [X1 - 0.25, X1, Z0, Z1]]) par.push([boxUV(a0, a1, top, top + 0.9, c0, c1, 4, 1), 0xcfc3a8]);
  if (rr() < 0.7) { const tx = lerp(X0 + 2, X1 - 2, rr()), tz = lerp(Z0 + 2, Z1 - 2, rr()); par.push([new THREE.CylinderGeometry(0.8, 0.8, 1.4, 12).translate(tx, top + 1.6, tz), 0x8b8a84]); for (const s of [-1, 1]) par.push([new THREE.BoxGeometry(0.1, 0.9, 0.1).translate(tx + s * 0.5, top + 0.45, tz), 0x4a4640]); }
  if (rr() < 0.6) { const hx = lerp(X0 + 2.2, X1 - 2.2, rr()), hz = lerp(Z0 + 2.2, Z1 - 2.2, rr()); par.push([boxUV(hx - 1.3, hx + 1.3, top, top + 2.3, hz - 1.4, hz + 1.4, 3, 2.3), 0xd8ccb2]); }
  if (rr() < 0.5) par.push([new THREE.CylinderGeometry(0.03, 0.03, 4, 5).translate(lerp(X0 + 1, X1 - 1, rr()), top + 2, lerp(Z0 + 1, Z1 - 1, rr())), 0x2a2a28]);
  if (b.solid !== false) { addCollider((X0 + X1) / 2, (Z0 + Z1) / 2, (X1 - X0) / 2, (Z1 - Z0) / 2, 0, top + 0.9); SZ.blocks.push([X0, X1, Z0, Z1, top]); }
}
/* window centres along a building's street face (they match the facade texture: two windows per 7 m tile) */
function faceInfo(b) {
  const [fx, fz] = b.face, horiz = fz !== 0, fc = horiz ? (fz > 0 ? b.z1 : b.z0) : (fx > 0 ? b.x1 : b.x0);
  const lo = horiz ? b.x0 : b.z0, hi = horiz ? b.x1 : b.z1, org = horiz ? (fz > 0 ? b.x0 : b.x1) : (fx > 0 ? b.z1 : b.z0), dir = horiz ? (fz > 0 ? 1 : -1) : (fx > 0 ? -1 : 1);
  const at = (offs) => { const out = []; for (let k = 0; k < 40; k++) for (const o of offs) { const a = org + dir * (7 * k + o); if (a > lo + 0.9 && a < hi - 0.9) out.push(a); } return out.sort((p, q) => p - q); };
  const P = (a, out) => (horiz ? [LX(a), LZ(fc) + fz * out] : [LX(fc) + fx * out, LZ(a)]);
  return { fx, fz, horiz, fc, lo, hi, wins: at([1.75, 5.25]), shops: at([1.86, 5.14]), P, rot: horiz ? 0 : Math.PI / 2, face: Math.atan2(fx, fz), span: hi - lo, mid: (lo + hi) / 2 };
}
function railTex() {
  const c = canvas(128, 128), g = c.getContext('2d'); g.clearRect(0, 0, 128, 128); g.fillStyle = '#fff';
  g.fillRect(0, 2, 128, 7); g.fillRect(0, 118, 128, 6); g.fillRect(0, 70, 128, 3);
  for (let x = 4; x < 128; x += 11) g.fillRect(x, 6, 3, 116);
  for (let x = 10; x < 128; x += 22) { g.beginPath(); g.arc(x, 72, 8, Math.PI, 0); g.lineWidth = 2.5; g.strokeStyle = '#fff'; g.stroke(); }
  const t = tex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
function stripeTex(a, b) { const c = canvas(64, 64), g = c.getContext('2d'); for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? b : a; g.fillRect(i * 8, 0, 8, 64); } g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(0, 56, 64, 8); const t = tex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; }
function planeAt(w, h, x, y, z, ry, rx = 0, uw = 1, uh = 1) { const g = new THREE.PlaneGeometry(w, h); const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w / uw, uv.getY(i) * h / uh); if (rx) g.rotateX(rx); g.rotateY(ry); g.translate(x, y, z); return g; }
const CLOTHC = [0xd9d4c8, 0x8a2f2a, 0x2f4f7a, 0xc9a24a, 0x6b7f4f, 0xe8e2d6, 0x7a4f7a, 0x3a6b6b];
function balconyRun(F, a, w, y, D, rr, laundry) {
  const [x, z] = F.P(a, 0.55); D.trim.push([G.box(w, 0.15, 1.1), 0xc3b8a4, M4(x, y - 0.02, z, 0, F.rot, 0)]);
  D.trim.push([G.box(w, 0.06, 0.06), 0x2c2b28, M4(...F.P(a, 1.08).flatMap((v, i) => (i ? [y + 1.0, v] : [v])), 0, F.rot, 0)]);
  const [rx, rz] = F.P(a, 1.08); D.rail.push(planeAt(w, 1.0, rx, y + 0.5, rz, F.face, 0, 1.1, 1));
  for (const s of [-1, 1]) { const [sx, sz] = F.P(a + s * w / 2, 0.54); D.rail.push(planeAt(1.08, 1.0, sx, y + 0.5, sz, F.face + Math.PI / 2, 0, 1.1, 1)); }
  if (laundry || rr() < 0.3) { const n = 2 + Math.floor(rr() * 4); for (let i = 0; i < n; i++) { const o = (i - (n - 1) / 2) * Math.min(0.7, w / n); const [cx, cz] = F.P(a + o, 1.12); D.cloth.push([planeAt(0.5 + rr() * 0.3, 0.55 + rr() * 0.4, cx, y + 0.72, cz, F.face), CLOTHC[Math.floor(rr() * CLOTHC.length)]]); } }
  if (rr() < 0.35) for (let i = 0; i < 2; i++) { const [px, pz] = F.P(a + (i ? 0.7 : -0.7) * w / 2.4, 0.85); D.trim.push([G.cyl(0.13, 0.1, 0.28, 8), 0x8a4a2c, M4(px, y + 0.2, pz)], [G.sph(0.2, 8, 6), 0x4f6b35, M4(px, y + 0.45, pz)]); }
}
function decorate(b, D, rr, lists) {
  const F = faceInfo(b), trimC = [0xe9e2d0, 0xd9cdb4, 0xb9a98a, 0xe2d8c2][b.v % 4], top = CHH + b.fl * FLH;
  for (let f = 1; f <= b.fl; f++) { const y = CHH + f * FLH, last = f === b.fl, [x, z] = F.P(F.mid, last ? 0.17 : 0.06); D.trim.push([G.box(F.span + (last ? 0.45 : 0.08), last ? 0.4 : 0.13, last ? 0.38 : 0.13), trimC, M4(x, y - (last ? 0.06 : 0.02), z, 0, F.rot, 0)]); }
  for (let f = 1; f < b.fl; f++) for (const a of F.wins) {
    const y = CHH + f * FLH, [x, z] = F.P(a, 0.09); D.trim.push([G.box(1.95, 0.09, 0.2), trimC, M4(x, y + 0.64, z, 0, F.rot, 0)]);
    if (b.style === 1) { const [x2, z2] = F.P(a, 0.12); D.trim.push([G.box(2.15, 0.18, 0.26), trimC, M4(x2, y + 2.78, z2, 0, F.rot, 0)], [G.box(1.5, 0.1, 0.16), trimC, M4(x2, y + 2.95, z2, 0, F.rot, 0)]); }
  }
  if (b.style === 1) for (const a of [F.lo + 0.32, F.hi - 0.32]) { const [x, z] = F.P(a, 0.07); D.trim.push([G.box(0.6, b.fl * FLH - 0.2, 0.15), trimC, M4(x, CHH + b.fl * FLH / 2, z, 0, F.rot, 0)]); }
  if (b.style === 2) { for (let f = 1; f < b.fl; f++) balconyRun(F, F.mid, F.span - 0.7, CHH + f * FLH, D, rr, rr() < 0.5); }
  else for (let f = 1; f < b.fl; f++) for (let i = 0; i < F.wins.length; i += 2) if (rr() < 0.35) balconyRun(F, (F.wins[i] + (F.wins[i + 1] ?? F.wins[i])) / 2, F.wins[i + 1] ? 5.0 : 2.4, CHH + f * FLH, D, rr, false);
  // canvas awnings over the shops
  for (const a of F.shops) if (rr() < 0.6) {
    const k = Math.floor(rr() * D.awn.length), [x, z] = F.P(a, 0.72); const g = new THREE.BoxGeometry(2.9, 0.03, 1.5); const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 3, uv.getY(i));
    g.rotateX(-0.36); g.rotateY(F.face + Math.PI); g.translate(x, CHH + 2.18, z); D.awn[k].push(g);
    const [vx, vz] = F.P(a, 1.43); D.awn[k].push(planeAt(2.9, 0.28, vx, CHH + 1.82, vz, F.face, 0, 0.35, 1));
  }
  // rooftop life: TV antennas, pigeon coops, laundry lines, a room on the roof
  const R2 = lists.roof, X0 = LX(b.x0), X1 = LX(b.x1), Z0 = LZ(b.z0), Z1 = LZ(b.z1), rx = () => lerp(X0 + 1.5, X1 - 1.5, rr()), rz = () => lerp(Z0 + 1.5, Z1 - 1.5, rr());
  for (let i = 0; i < 1 + Math.floor(rr() * 2); i++) { const ax = rx(), az = rz(); R2.push([G.cyl(0.025, 0.025, 3.2, 5), 0x2a2a28, M4(ax, top + 1.6, az)]); for (let j = 0; j < 3; j++) R2.push([G.box(1.3 - j * 0.3, 0.025, 0.025), 0x2a2a28, M4(ax, top + 2.4 + j * 0.35, az, 0, rr() * 3, 0)]); }
  if (rr() < 0.3) { const cx = rx(), cz = rz(); R2.push([G.box(1.8, 1.5, 1.6), 0x8a6b48, M4(cx, top + 1.55, cz)], [G.box(2.0, 0.08, 1.8), 0x6a5038, M4(cx, top + 2.35, cz)]); for (const [ox, oz] of [[-0.8, -0.7], [0.8, -0.7], [-0.8, 0.7], [0.8, 0.7]]) R2.push([G.box(0.07, 0.8, 0.07), 0x5a4430, M4(cx + ox, top + 0.4, cz + oz)]); for (let j = 0; j < 4; j++) R2.push([G.box(1.82, 0.04, 0.03), 0x3a2c1e, M4(cx, top + 1.0 + j * 0.35, cz + 0.81)]); }
  if (rr() < 0.55) { const a0 = rx(), z0 = rz(), len = 3 + rr() * 3; R2.push([G.box(len, 0.012, 0.012), 0x1a1a1a, M4(a0, top + 1.7, z0)]); for (const s of [-1, 1]) R2.push([G.box(0.05, 1.7, 0.05), 0x4a4a46, M4(a0 + s * len / 2, top + 0.85, z0)]); for (let j = 0; j < 4; j++) D.cloth.push([planeAt(0.55, 0.7, a0 - len / 2 + 0.5 + j * (len - 1) / 3, top + 1.33, z0, rr() * 0.4), CLOTHC[Math.floor(rr() * CLOTHC.length)]]); }
  if (b.fl >= 3 && rr() < 0.3) { const w = F.span * 0.45, [x, z] = F.P(F.mid, -3.2); const g = boxUV(x - (F.horiz ? w / 2 : 1.6), x + (F.horiz ? w / 2 : 1.6), top, top + 2.8, z - (F.horiz ? 1.6 : w / 2), z + (F.horiz ? 1.6 : w / 2), 7, FLH); lists.upper[(b.v + 1) % lists.upper.length].push(aoBox(g, top, top + 2.8, 0.9, 0.86)); R2.push([G.box(F.horiz ? w + 0.3 : 3.5, 0.25, F.horiz ? 3.5 : w + 0.3), trimC, M4(x, top + 2.9, z)]); }
}
function balcony(x, z, nx, nz, y, list) {
  const tx = -nz, tz = nx, rot = Math.atan2(nx, nz), w = 2.6;
  list.push([new THREE.BoxGeometry(w, 0.16, 1.0).rotateY(rot).translate(x + nx * 0.5, y, z + nz * 0.5), 0xbdb3a0]);
  list.push([new THREE.BoxGeometry(w, 0.05, 0.05).rotateY(rot).translate(x + nx * 0.98, y + 0.95, z + nz * 0.98), 0x2a2a28]);
  for (let a = -w / 2; a <= w / 2 + 0.01; a += 0.22) list.push([new THREE.BoxGeometry(0.025, 0.9, 0.025).translate(x + nx * 0.98 + tx * a, y + 0.5, z + nz * 0.98 + tz * a), 0x2a2a28]);
  for (const s of [-1, 1]) list.push([new THREE.BoxGeometry(0.05, 0.95, 1.0).rotateY(rot).translate(x + tx * s * w / 2 + nx * 0.5, y + 0.5, z + tz * s * w / 2 + nz * 0.5), 0x2a2a28]);
}

/* ---------- vehicles and street props ---------- */
const CAR_GEO = (burnt) => build([
  [G.box(1.75, 0.55, 4.2), burnt ? 0x6a4630 : 0x7d6d4f, M4(0, 0.6, 0)], [G.box(1.6, 0.5, 2.1), burnt ? 0x553726 : 0x6b5d44, M4(0, 1.12, -0.2)],   // burnt: the paint gone to rust, not black
  [G.box(1.5, 0.42, 0.06), burnt ? 0x0d0c0b : 0x23292c, M4(0, 1.12, 0.86, -0.5, 0, 0)], [G.box(1.5, 0.4, 0.06), burnt ? 0x0d0c0b : 0x23292c, M4(0, 1.12, -1.26, 0.4, 0, 0)],
  ...[[-0.8, 1.3], [0.8, 1.3], [-0.8, -1.3], [0.8, -1.3]].map(([x, z]) => [G.cyl(0.34, 0.34, 0.24, 12), 0x161616, M4(x, burnt ? 0.22 : 0.34, z, 0, 0, Math.PI / 2)]),
]);
const BUS_GEO = build([[G.box(2.5, 2.4, 10.5), 0x3a332c, M4(0, 1.6, 0)], [G.box(2.45, 0.9, 10.3), 0x141210, M4(0, 2.15, 0)], ...[-3.8, 3.4].flatMap((z) => [-1.15, 1.15].map((x) => [G.cyl(0.5, 0.5, 0.3, 12), 0x111111, M4(x, 0.4, z, 0, 0, Math.PI / 2)]))]);
const KIOSK_GEO = build([[G.box(2.2, 2.3, 1.8), 0x6f8a6a, M4(0, 1.15, 0)], [G.box(2.6, 0.15, 2.2), 0x4f5f4a, M4(0, 2.4, 0)], [G.box(1.6, 1.0, 0.06), 0x161412, M4(0, 1.35, 0.92)]]);
function addProp(geo, x, z, rot, coll, h = 1.5, col = MAT.vc) {
  // the burnt bus is the modelled wreck where its data is there: its own size for the collider
  if (geo === BUS_GEO && mdlHas('w_bus')) { const b = mdlBox('w_bus'), m = mdlLOD('w_bus', mdlMats('w_bus', { color: 0x9a8a7a }, 'burnt'), LITE ? [0, 25, 80] : [0, 45, 130]); m.position.set(LX(x), CHH - 0.03, LZ(z)); m.rotation.y = rot; scene.add(SH(onLayer1(m))); SZ.objs.push(m); addCollider(LX(x), LZ(z), b[0] / 2, b[2] / 2, rot, CHH + b[1]); return m; }
  const m = new THREE.Mesh(geo, col); m.position.set(LX(x), CHH, LZ(z)); m.rotation.y = rot; scene.add(SH(onLayer1(m))); SZ.objs.push(m);
  if (coll) { addCollider(LX(x), LZ(z), coll[0], coll[1], rot, CHH + h); }
  return m;
}
function coverAround(x, z, hx, hz, rot, h) { const k0 = COVER.length; coverBox(LX(x), LZ(z), hx, hz, rot, h); for (let i = k0; i < COVER.length; i++) { COVER[i].y = CHH; SZ.covers.push(COVER[i]); } }

/* ---------- street dressing: barricades, drums, blocks, wrecks, burning tyres, poles and wires, stalls, signs, craters ---------- */
function cityDressing(rr) {
  const parts = [], wood = [], k0 = COVER.length;
  const coverHere = () => { for (let i = k0; i < COVER.length; i++) if (!SZ.covers.includes(COVER[i])) { COVER[i].y = CHH; SZ.covers.push(COVER[i]); } };
  const bag = (pts, layers) => bagWall(pts.map(([x, z]) => [LX(x), LZ(z)]), layers, CHH - 0.05, true);
  // chicanes of sandbags across the north lane; the tank lane (z 2..6) stays open
  bag([[143, -8.4], [138, -1.2]], 5); bag([[79, -0.8], [75, -8.4]], 4); bag([[12, -8.4], [10, -2.5], [6, -2.2]], 4); bag([[-30, 17], [-30, 21.5]], 5); bag([[-46, -27], [-42, -26]], 4);
  // oil-drum barricades
  // the packed drum where its data is there (3_world.js propSet: dl its matrices, standing on its base where the old cylinder was centred, dt its tints)
  const dl = mdlHas('drum') ? [] : null, dt = [], half = new THREE.Matrix4().makeTranslation(0, -0.44, 0);
  const drums = (x0, z0, x1, z1) => { const L = Math.hypot(x1 - x0, z1 - z0), n = Math.max(2, Math.round(L / 0.62)); for (let i = 0; i < n; i++) { const u = i / (n - 1), x = LX(lerp(x0, x1, u)), z = LZ(lerp(z0, z1, u));
      const lie = rr() < 0.18, col = [0x2f4a3a, 0x6b3a26, 0x3d4652, 0x7a6a3a][Math.floor(rr() * 4)], M = lie ? M4(x, CHH + 0.29, z, Math.PI / 2, rr() * 3, 0) : M4(x, CHH + 0.44, z), top = rr() < 0.25 && !lie;
      if (dl) { dl.push(M.multiply(half)); dt.push(drumTint(col)); if (top) { dl.push(M4(x, CHH + 1.32, z).multiply(half)); dt.push(drumTint(0x2f4a3a)); } }
      else { parts.push([G.cyl(0.29, 0.29, 0.88, 12), col, M]); if (top) parts.push([G.cyl(0.29, 0.29, 0.88, 12), 0x2f4a3a, M4(x, CHH + 1.32, z)]); } }
    const mx = (x0 + x1) / 2, mz = (z0 + z1) / 2; addCollider(LX(mx), LZ(mz), L / 2 + 0.3, 0.35, Math.atan2(-(z1 - z0), x1 - x0), CHH + 0.9); coverBox(LX(mx), LZ(mz), L / 2 + 0.3, 0.35, Math.atan2(-(z1 - z0), x1 - x0), 0.9); };
  drums(96, -7.6, 92.5, -1.5); drums(-34, 11.5, -34, 16); drums(-84, -5.5, -84, 5.5); drums(160, 9.2, 165, 9.2); drums(-62, 48, -55, 47);
  if (dl) propSet('drum', dl, dt);
  // concrete anti-tank blocks
  const blocks = (pts) => { for (const [x, z, r] of pts) { parts.push([G.box(1.15, 1.0, 1.15), 0xa39b8c, M4(LX(x), CHH + 0.5, LZ(z), 0, r, 0)], [G.box(0.85, 0.12, 0.85), 0x958e80, M4(LX(x), CHH + 1.06, LZ(z), 0, r, 0)]); addCollider(LX(x), LZ(z), 0.62, 0.62, r, CHH + 1.1); coverBox(LX(x), LZ(z), 0.62, 0.62, r, 1.05); } };
  blocks([[40, -7.4, 0.2], [42, -4.2, 0.5], [-64, -48, 0.3], [-59.5, -49, 0.7], [-53, -47.5, 0.1], [-63, 50, 0.4], [-56, 51.5, 0.8], [-52.5, 49, 0.2], [120, 9.2, 0.6]]);
  // wrecks: a burnt truck, a car on its side, a burning car
  { const truck = build([[G.box(2.3, 2.0, 2.0), 0x221d19, M4(0, 1.5, 2.6)], [G.box(2.4, 0.3, 5.4), 0x1d1915, M4(0, 1.0, -1.1)], [G.box(0.08, 0.9, 5.2), 0x2a231d, M4(1.15, 1.6, -1.1)], [G.box(0.08, 0.9, 5.2), 0x2a231d, M4(-1.15, 1.6, -1.1)], ...[[-1.0, 2.6], [1.0, 2.6], [-1.0, -2.4], [1.0, -2.4]].map(([x, z]) => [G.cyl(0.48, 0.48, 0.35, 12), 0x0f0f0f, M4(x, 0.42, z, 0, 0, Math.PI / 2)])]);
    // the burnt-out army trucks are the modelled jeeps now: in their paint, broken, and burning
    const wreck = (x, z, r) => { if (typeof VEH_DATA === 'undefined' || !VEH_DATA.jeep) { addProp(truck, x, z, r, [1.25, 3.9], 2.4); coverAround(x, z, 1.25, 3.9, r, 2.2); return; }
      const rec = vehModel('jeep', 'e'); vehDamage(rec, true); rec.dead = true; const m = rec.g; m.position.set(LX(x), CHH, LZ(z)); m.rotation.y = r - Math.PI / 2; scene.add(SH(onLayer1(m))); SZ.objs.push(m);
      addCollider(LX(x), LZ(z), 0.95, 2.05, r, CHH + 2.0); coverAround(x, z, 0.95, 2.05, r, 1.9); wreckFire(m, VEH_FIRE.jeep, 0.9); };
    wreck(183, -4.6, Math.PI / 2 + 0.15); smokeColumn(LX(183), LZ(-4.6), 5, true);
    // the positions of the straw through the square, one for each bound and facing its front: a burnt truck short of the monument (west), another at the
    // mouth of the west street (west), and a sandbag wall on the west side facing the north street and the corner building (north)
    for (const [x, z, r] of [[-55.5, 14.5, 0.06], [-68.5, 6.0, -0.05]]) wreck(x, z, r); }
  bag([[-76.5, -6.5], [-69.5, -6.5]], 6);
  { const m = addProp(CAR_GEO(true), 148, 9.0, 0.2, [1.0, 2.2], 1.8); m.rotation.z = Math.PI / 2; m.position.y = CHH + 0.85; coverAround(148, 9.0, 1.0, 2.2, 0.2, 1.7); }
  { const m = addProp(CAR_GEO(true), -70, 16, 2.5, [0.95, 2.15], 1.4); smokeColumn(LX(-70), LZ(16), 4, true); coverAround(-70, 16, 0.95, 2.15, 2.5, 1.3); }
  // burning tyres in the street
  for (const [x, z] of [[70, -2.5], [-4, -7]]) { for (let i = 0; i < 7; i++) parts.push([G.tor(0.36, 0.13, 6, 12), 0x141414, M4(LX(x) + (rr() - 0.5) * 1.2, CHH + 0.13 + Math.floor(i / 3) * 0.24, LZ(z) + (rr() - 0.5) * 1.2, Math.PI / 2, 0, rr())]); smokeColumn(LX(x), LZ(z), 3, true); }
  // power poles along the south pavement with wires sagging between them and across the avenue
  const wires = []; let prev = null;
  for (let x = -26; x < 240; x += 34) { const px = LX(x), pz = LZ(10.2); parts.push([G.cyl(0.11, 0.16, 9.5, 8), 0x5a4a36, M4(px, CHH + 4.75, pz)], [G.box(1.8, 0.12, 0.12), 0x4a3a2a, M4(px, CHH + 9.0, pz)]); const tip = V3(px, CHH + 9.0, pz);
    if (prev) for (const o of [-0.8, 0.8]) { const a = prev.clone().add(V3(0, 0, o)), b = tip.clone().add(V3(0, 0, o)), m = a.clone().lerp(b, 0.5); m.y -= 0.9; wires.push(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(a, m, b), 10, 0.012, 3)); }
    if (rr() < 0.6) { const b = V3(px + rr() * 4 - 2, CHH + 7.2, LZ(-11)), m = tip.clone().lerp(b, 0.5); m.y -= 1.4; wires.push(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(tip, m, b), 12, 0.012, 3)); }
    prev = tip; }
  if (wires.length) scene.add(onLayer1(new THREE.Mesh(mergeGeometries(wires, false), MAT.dark)));
  // market stalls, a bus stop, a fallen lamp post, street signs, posters
  const stall = (x, z, r, k) => { const c = [0x7a3a2a, 0x2f5a4a, 0x8a7a3a][k]; for (const [ox, oz] of [[-1.3, -0.8], [1.3, -0.8], [-1.3, 0.8], [1.3, 0.8]]) wood.push([G.box(0.07, 2.2, 0.07), 0x5a4430, M4(ox, 1.1, oz)]); wood.push([G.box(2.9, 0.06, 1.9), c, M4(0, 2.25, 0, 0.12, 0, 0)], [G.box(2.6, 0.75, 1.3), 0x6b5038, M4(0, 0.38, 0)]);
    for (let i = 0; i < 9; i++) wood.push([G.sph(0.12, 6, 5), [0xc8502a, 0xe0b030, 0x5a8a30][i % 3], M4(-1 + (i % 5) * 0.5, 0.86, -0.3 + Math.floor(i / 5) * 0.5)]);
    const g = build(wood.splice(0)); const m = new THREE.Mesh(g, MAT.vc); m.position.set(LX(x), CHH, LZ(z)); m.rotation.y = r; scene.add(SH(onLayer1(m))); addCollider(LX(x), LZ(z), 1.4, 0.9, r, CHH + 0.8); };
  stall(22, 9.7, 0, 0); stall(106, -9.7, Math.PI, 1); stall(-40, 21.5, 0.1, 2); stall(212, -9.7, Math.PI, 2);
  parts.push([G.box(3.6, 0.08, 1.6), 0x3a4a3a, M4(LX(204), CHH + 2.5, LZ(9.9))], [G.box(0.08, 2.5, 0.08), 0x2a2a28, M4(LX(202.4), CHH + 1.25, LZ(10.5))], [G.box(0.08, 2.5, 0.08), 0x2a2a28, M4(LX(205.6), CHH + 1.25, LZ(10.5))], [G.box(3.4, 0.45, 0.4), 0x6b5a40, M4(LX(204), CHH + 0.45, LZ(10.4))]);
  parts.push([G.cyl(0.08, 0.1, 7, 6), 0x4a4a46, M4(LX(35), CHH + 0.25, LZ(-9.2), 0, 0, Math.PI / 2 - 0.08)]);
  const signTx = (t) => { const c = canvas(256, 96), g = c.getContext('2d'); g.fillStyle = '#1f4e8a'; g.fillRect(0, 0, 256, 96); g.strokeStyle = '#e8eef4'; g.lineWidth = 6; g.strokeRect(6, 6, 244, 84); g.fillStyle = '#f2f4f6'; g.font = 'bold 34px Arial'; g.textAlign = 'center'; g.direction = 'rtl'; g.fillText(t, 128, 60); return tex(c); };
  for (const [x, z, t, r] of [[-35, -10.5, 'شارع الأربعين', 0], [-35, 10.5, 'شارع الأربعين', Math.PI], [97, -10.6, 'شارع الجيش', 0], [-51, -23.2, 'ميدان الأربعين', 0]]) {
    parts.push([G.cyl(0.04, 0.04, 2.8, 6), 0x3a3a38, M4(LX(x), CHH + 1.4, LZ(z))]); const m = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.42), new THREE.MeshStandardMaterial({ map: signTx(t), side: THREE.DoubleSide, roughness: 0.6 })); m.position.set(LX(x), CHH + 2.6, LZ(z)); m.rotation.y = r; scene.add(onLayer1(m)); }
  const posterTx = (seed) => { const c = canvas(128, 176), g = c.getContext('2d'), r = rng(seed); g.fillStyle = ['#d8c79a', '#c9d6c2', '#e3c2a8'][seed % 3]; g.fillRect(0, 0, 128, 176); g.fillStyle = ['#8a2a22', '#1f4e3a', '#2a2a2a'][seed % 3]; g.fillRect(8, 8, 112, 60); g.fillStyle = '#f4ecd8'; g.font = 'bold 22px Arial'; g.textAlign = 'center'; g.direction = 'rtl'; g.fillText(['مصر', 'العبور', 'النصر'][seed % 3], 64, 46); g.fillStyle = '#2a2420'; for (let i = 0; i < 6; i++) g.fillRect(14, 84 + i * 13, 100 * (0.5 + r() * 0.5), 5); g.fillStyle = 'rgba(80,60,40,0.25)'; g.fillRect(0, 150, 128, 26); return tex(c); };
  for (const [x, z, r, sd] of [[30, -11.05, 0, 1], [33, -11.05, 0, 2], [88, 11.05, Math.PI, 3], [-50.5, -24.05, 0, 4], [150, -11.05, 0, 5]]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.25), new THREE.MeshStandardMaterial({ map: posterTx(sd), roughness: 0.9 })); m.position.set(LX(x), CHH + 1.7, LZ(z) + (r ? -0.01 : 0.01)); m.rotation.y = r; scene.add(onLayer1(m)); }
  // shell craters and scorch on the asphalt
  { const sm = new THREE.MeshStandardMaterial({ map: scorchTex(), transparent: true, depthWrite: false, roughness: 1 }); for (const [x, z, s] of [[130, -3, 3.2], [55, 1.5, 2.6], [14, -1.5, 3.0], [-48, -12, 3.4], [-62, 14, 2.8], [190, 3, 2.4], [-72, -4, 2.6]]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(s, s), sm); m.rotation.x = -Math.PI / 2; m.rotation.z = rr() * 6; m.position.set(LX(x), CHH + 0.04, LZ(z)); m.renderOrder = 1; scene.add(onLayer1(m)); } }
  // concertina wire across the alley mouths
  { const coil = new THREE.TorusGeometry(0.45, 0.02, 4, 12), ws = []; for (const [x, z0, z1] of [[98.5, -12, -19], [130.5, 12, 19], [62.5, 12, 19], [160.5, -12, -19], [198.5, 12, 19]]) for (let z = z0; Math.abs(z - z1) > 0.3; z += Math.sign(z1 - z0) * 0.55) ws.push(coil.clone().rotateY(Math.PI / 2).translate(LX(x), CHH + 0.45, LZ(z)));
    scene.add(SH(onLayer1(new THREE.Mesh(mergeGeometries(ws, false), MAT.wire)), true, false)); }
  // an Egyptian anti-tank gun dug in at the mouth of the north street, aimed across the square at the end of the avenue
  { const gun = build([[G.box(0.5, 0.5, 1.1), 0x4a5038, M4(0, 0.85, 0)], [G.cyl(0.06, 0.07, 2.6, 10), 0x3a3e30, M4(0, 1.0, 1.6, Math.PI / 2, 0, 0)], [G.box(1.3, 0.9, 0.06), 0x4f5640, M4(0, 1.1, 0.35)], ...[-1, 1].map((sd) => [G.cyl(0.42, 0.42, 0.12, 12), 0x1a1a1a, M4(sd * 0.75, 0.42, 0, 0, 0, Math.PI / 2)]), ...[-1, 1].map((sd) => [G.box(0.08, 0.08, 2.2), 0x3a3e30, M4(sd * 0.35, 0.3, -1.2, 0, sd * 0.25, 0)])]);
    addProp(gun, SZ_GUN[0], SZ_GUN[1], SZ_GUN[2], [0.8, 1.3], 1.4); }
  // the square is one route now (the straw): the south street is shut by a burnt-out bus and concrete blocks, with two sandbagged positions in front of it facing the square
  { addProp(BUS_GEO, -58.6, 31, Math.PI / 2 + 0.04, [1.3, 5.3], 3.0); for (const [x, z, r] of [[-52.6, 30.9, 0.3], [-51.1, 30.3, 0.8]]) { parts.push([G.box(1.15, 1.0, 1.15), 0xa39b8c, M4(LX(x), CHH + 0.5, LZ(z), 0, r, 0)]); addCollider(LX(x), LZ(z), 0.62, 0.62, r, CHH + 1.1); }
    smokeColumn(LX(-60), LZ(31), 3, true); }
  if (parts.length) { const m = new THREE.Mesh(build(parts), MAT.vc); scene.add(SH(onLayer1(m))); }
  coverHere();
}

/* ---------- the M48 Patton ("Magach") ---------- */
const TANK = { g: null, turret: null, gun: null, hp: 100, s: 0, speed: 0, path: [], stops: [], stopI: 0, wait: 0, alive: true, burning: false, mg: 0, gunT: 0, recoil: 0, wheels: [], trackTex: null, fireT: 0, toW: (x, z) => [LX(x), LZ(z)], vmax: 4.2, driveOn: false, hdV: null };
function tankModel() {
  if (typeof VEH_DATA !== 'undefined' && VEH_DATA.magach) return tankModelM();
  const SG = 0x8b8770, DK = 0x5d5a4a, BK = 0x1c1b18, ME = 0x3c3b36;
  const tt = (() => { const c = canvas(64, 64), g = c.getContext('2d'); g.fillStyle = '#1f1e1b'; g.fillRect(0, 0, 64, 64); g.fillStyle = '#3a3833'; for (let y = 0; y < 64; y += 8) g.fillRect(0, y, 64, 5); g.fillStyle = '#4d4a44'; for (let y = 0; y < 64; y += 8) g.fillRect(28, y + 1, 8, 3); const t = tex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1, 14); return t; })();
  TANK.trackTex = tt;
  const root = new THREE.Group(), hullM = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.78, metalness: 0.25, map: TX.grime });
  const hullG = build([
    [G.ext([[-3.25, 0.55], [3.05, 0.55], [3.5, 1.0], [2.55, 1.58], [-3.05, 1.62], [-3.35, 1.15]], 2.5), SG, M4(1.25, 0, 0, 0, -Math.PI / 2, 0)],
    ...[-1, 1].map((s) => [G.box(0.82, 0.08, 6.95), SG, M4(s * 1.62, 1.22, 0.05)]),
    ...[-1, 1].map((s) => [G.box(0.7, 0.42, 1.5), DK, M4(s * 1.6, 1.47, -1.6)]), [G.box(0.45, 0.5, 0.7), DK, M4(1.55, 1.5, 0.6)],
    ...[-1, 1].map((s) => [G.box(0.32, 0.22, 0.18), 0xd8d0b0, M4(s * 1.05, 1.32, 3.18)]),
    [G.box(1.6, 0.35, 0.5), ME, M4(0, 1.2, -3.3)], ...[-0.45, 0.45].map((x) => [G.cyl(0.13, 0.13, 0.4, 10), BK, M4(x, 1.2, -3.55, Math.PI / 2, 0, 0)]),
    ...[-1, 1].map((s) => [G.box(0.38, 0.5, 0.26), 0x55573f, M4(s * 1.55, 1.52, -2.9)]),
  ]);
  const hull = new THREE.Mesh(hullG, hullM); root.add(hull);
  const trackM = new THREE.MeshStandardMaterial({ map: tt, roughness: 0.9, metalness: 0.3, color: 0xffffff });
  for (const s of [-1, 1]) {
    const tr = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.08, 6.7), trackM); tr.position.set(s * 1.55, 0.04, 0.05); root.add(tr);
    const tt2 = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.06, 6.0), trackM); tt2.position.set(s * 1.55, 1.12, 0.05); root.add(tt2);
    const wg = build([[G.cyl(0.33, 0.33, 0.6, 16), BK, M4(0, 0, 0, 0, 0, Math.PI / 2)], [G.cyl(0.2, 0.2, 0.64, 10), 0x55534a, M4(0, 0, 0, 0, 0, Math.PI / 2)]]);
    for (const z of [-2.35, -1.45, -0.55, 0.35, 1.25, 2.15]) { const w = new THREE.Mesh(wg, MAT.vc); w.position.set(s * 1.55, 0.36, z); root.add(w); TANK.wheels.push(w); }
    for (const z of [-3.05, 2.95]) { const w = new THREE.Mesh(wg, MAT.vc); w.position.set(s * 1.55, 0.62, z); w.scale.setScalar(0.85); root.add(w); TANK.wheels.push(w); }
    for (const z of [-1.8, 0, 1.8]) { const w = new THREE.Mesh(wg, MAT.vc); w.position.set(s * 1.55, 1.0, z); w.scale.setScalar(0.35); root.add(w); }
    const sk = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.62, 6.0), hullM); sk.position.set(s * 1.92, 0.95, 0.1); root.add(sk); colored(sk.geometry, SG);
  }
  const tur = new THREE.Group(); tur.position.set(0, 1.62, -0.25); root.add(tur);
  const turG = build([
    [G.sph(1.0, 26, 14, 0, Math.PI * 2, 0, Math.PI * 0.5), SG, M4(0, 0, 0, 0, 0, 0, 1.3, 0.62, 1.55)],
    [G.cyl(1.3, 1.36, 0.12, 26), DK, M4(0, 0.04, 0)],
    [G.box(1.1, 0.7, 0.45), SG, M4(0, 0.33, 1.42)], [G.box(0.42, 0.42, 0.42), 0x9a9680, M4(0.5, 0.82, 1.4)], [G.cyl(0.18, 0.18, 0.06, 14), 0xc8c4a8, M4(0.5, 0.82, 1.62, Math.PI / 2, 0, 0)],
    [G.box(2.2, 0.08, 1.0), ME, M4(0, 0.35, -1.75)], ...[-0.95, 0, 0.95].map((x) => [G.box(0.05, 0.5, 1.0), ME, M4(x, 0.55, -1.75)]), [G.box(2.2, 0.06, 0.06), ME, M4(0, 0.8, -2.25)],
    ...[-0.6, -0.15, 0.3].map((x) => [G.box(0.18, 0.45, 0.33), 0x4a5236, M4(x, 0.62, -1.75)]), [G.box(0.6, 0.35, 0.5), 0x5a5a44, M4(0.75, 0.55, -1.7)],
    [G.cyl(0.42, 0.45, 0.42, 18), DK, M4(-0.55, 0.78, -0.3)], ...[0, 1, 2, 3, 4, 5].map((i) => [G.box(0.12, 0.08, 0.05), 0x1b2a2e, M4(-0.55 + Math.sin(i * 1.047) * 0.42, 0.82, -0.3 + Math.cos(i * 1.047) * 0.42, 0, i * 1.047, 0)]),
    [G.cyl(0.32, 0.32, 0.08, 14), DK, M4(0.6, 0.66, -0.4)],
    ...[-1, 1].map((s) => [G.box(0.04, 0.55, 0.4), 0xe9e4d4, M4(s * 1.24, 0.25, 0.1, 0, 0, s * 0.25)]),
    [G.cyl(0.015, 0.015, 2.8, 5), 0x1b1b1b, M4(-1.0, 1.9, -1.3)], [G.cyl(0.015, 0.015, 2.4, 5), 0x1b1b1b, M4(1.0, 1.7, -1.3)],
  ]);
  { const tm = new THREE.Mesh(turG, hullM); tur.add(tm); tankMarks(tm, turG, [{ o: [4, 0.32, -0.75], d: [-1, 0, 0], w: 1.0, h: 0.4 }, { o: [-4, 0.32, -0.75], d: [1, 0, 0], w: 1.0, h: 0.4 }], 'mtank'); }   // the chevron and tactical sign on the turret
  const gun = new THREE.Group(); gun.position.set(0, 0.36, 1.55); tur.add(gun);
  gun.add(new THREE.Mesh(build([[G.cyl(0.075, 0.09, 4.6, 14), DK, M4(0, 0, 2.3, Math.PI / 2, 0, 0)], [G.cyl(0.13, 0.13, 0.45, 14), DK, M4(0, 0, 2.6, Math.PI / 2, 0, 0)], [G.box(0.42, 0.13, 0.28), ME, M4(0, 0, 4.66)], [G.cyl(0.095, 0.095, 0.3, 12), DK, M4(0, 0, 0.1, Math.PI / 2, 0, 0)]]), hullM));
  gun.add(new THREE.Mesh(build([3.0, 3.25].map((z) => [G.cyl(0.093, 0.093, 0.07, 14), 0xdcd6c4, M4(0, 0, z, Math.PI / 2, 0, 0)])), MAT.vc));   // the two white rings on the gun
  const mg = new THREE.Group(); mg.position.set(-0.55, 1.05, -0.3); tur.add(mg);
  mg.add(new THREE.Mesh(build([[G.box(0.14, 0.17, 0.75), 0x2a2a28, M4(0, 0, 0.1)], [G.cyl(0.024, 0.024, 1.1, 8), 0x161616, M4(0, 0.02, 0.98, Math.PI / 2, 0, 0)], [G.cyl(0.05, 0.05, 0.6, 10), 0x2a2a28, M4(0, 0.02, 0.7, Math.PI / 2, 0, 0)], [G.box(0.22, 0.2, 0.3), 0x48502f, M4(0.2, -0.06, 0.05)], [G.box(0.03, 0.22, 0.22), 0x2a2a28, M4(0, -0.18, -0.25)]]), MAT.vc));
  SH(root); onLayer1(root); scene.add(root); root.visible = false; SZ.objs.push(root);
  TANK.g = root; TANK.turret = tur; TANK.gun = gun; TANK.mgM = mg;
  // fire on the engine deck once hit
  TANK.fireS = []; for (let i = 0; i < 3; i++) { const f = new THREE.Sprite(new THREE.SpriteMaterial({ map: FXT.fire, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, color: HDC })); f.visible = false; root.add(f); TANK.fireS.push(f); }
}
function tankAt(s) {
  const P0 = TANK.path; let acc = 0;
  for (let i = 0; i < P0.length - 1; i++) { const a = P0[i], b = P0[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]); if (acc + L >= s) { const u = (s - acc) / L; return [lerp(a[0], b[0], u), lerp(a[1], b[1], u), Math.atan2(b[0] - a[0], b[1] - a[1])]; } acc += L; }
  const a = P0[P0.length - 2], b = P0[P0.length - 1]; return [b[0], b[1], Math.atan2(b[0] - a[0], b[1] - a[1])];
}
/* the drivable tank built on the modelled Magach: the model sits in the root turned so its nose is the root's +Z (the frame the
   driving and gunnery code works in); the gun and the commander's .50 are hung in frames of that code's convention (barrel along
   +Z, elevation about X), on the trunnions and the pintle. The wheels and tracks turn by themselves (vehAnim) */
function tankModelM() {
  const root = new THREE.Group(); TANK.trackTex = new THREE.Texture(); TANK.wheels = [];
  const r = vehModel('magach', 'f'); r.g.rotation.y = -Math.PI / 2; root.add(r.g); TANK.rec = r; const tur = r.tur;
  const ya = new THREE.Group(); ya.rotation.y = Math.PI / 2; ya.position.set(r.gun.position.x - 1.55, r.gun.position.y, r.gun.position.z); tur.add(ya);
  const gun = new THREE.Group(); gun.position.z = 1.55; ya.add(gun); r.gun.removeFromParent(); r.gun.position.set(0, 0, 0); r.gun.rotation.set(0, -Math.PI / 2, 0); gun.add(r.gun);
  const ma = new THREE.Group(); ma.rotation.y = Math.PI / 2; ma.position.copy(r.cmg.position); tur.add(ma);
  const mg = new THREE.Group(); mg.rotation.order = 'YXZ'; ma.add(mg); r.cmg.removeFromParent(); r.cmg.position.set(0, 0, 0); r.cmg.rotation.set(0, -Math.PI / 2, 0); mg.add(r.cmg);
  if (VEH_DATA.m2hi) { r.cmg.userData.mesh.geometry = vehGeo('m2hi', 0, 'body', 'f'); r.cmg.userData.mesh.material = MAT.gunHi; r.cmgHi = true; }   // his own gun in full detail: he stands right behind it
  SH(root); onLayer1(root); scene.add(root); root.visible = false; SZ.objs.push(root);
  Object.assign(TANK, { g: root, turret: tur, gun, mgM: mg, gunL: 5.35, mgTip: r.cmg.userData.tip, mgY: 0.1,
    head: (crouch) => crouch ? V3(-0.42, 0.88, 0.55) : V3(-0.52, 1.88, 0.55) });   // the commander in his cupola: standing in the hatch behind the .50, or down at the vision blocks
  TANK.fireS = []; for (let i = 0; i < 3; i++) { const f = new THREE.Sprite(new THREE.SpriteMaterial({ map: FXT.fire, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, color: HDC })); f.visible = false; root.add(f); TANK.fireS.push(f); }
}
function tankTurretWorld(out = V3()) { TANK.turret.updateMatrixWorld(); return TANK.turret.getWorldPosition(out); }
function tankHeadPos(out = V3()) { TANK.g.updateMatrixWorld();
  // standing in the hatch on the Magach: behind the .50 and a little to its left, turning round with it, so the gun sits low and to the right of the view
  if (TANK.rec && !P.crouch && TANK.mgM) { const y = TANK.mgM.rotation.y, D = 1.05, S = 0.24; return out.set(S * Math.cos(y) - D * Math.sin(y), 0.8, -S * Math.sin(y) - D * Math.cos(y)).applyMatrix4(TANK.mgM.parent.matrixWorld); }
  // down in the turret: he looks out through the vision block that faces the way he looks, at the cupola's rim
  if (TANK.rec && P.crouch && TANK.mgM) { const y = TANK.mgM.rotation.y; return out.set(-0.42 + 0.54 * Math.cos(y), 0.84, 0.55 - 0.54 * Math.sin(y)).applyMatrix4(TANK.turret.matrixWorld); }
  return (TANK.head ? out.copy(TANK.head(P.crouch)) : out.set(-0.55, P.crouch ? 0.55 : 1.45, -0.3)).applyMatrix4(TANK.turret.matrixWorld); }
function updTank(dt) {
  if (!TANK.g || !TANK.g.visible) return;
  TANK.gunT = Math.max(0, TANK.gunT - dt); TANK.mg -= dt; TANK.recoil = Math.max(0, TANK.recoil - dt * 3);
  if (TANK.free) {
    // the player drives: throttle forwards and back, the hull turns on its tracks; the turret keeps following the commander's eyes
    if (TANK.alive) { const want = TANK.thr * (TANK.thr > 0 ? TANK.vmax : TANK.vmax * 0.55); TANK.speed += clamp(want - TANK.speed, -dt * 4.5, dt * 2.4); TANK.hd += TANK.turn * dt * (0.5 + 0.3 * (1 - Math.min(1, Math.abs(TANK.speed) / TANK.vmax)));
      const nx = TANK.fx + Math.sin(TANK.hd) * TANK.speed * dt, nz = TANK.fz + Math.cos(TANK.hd) * TANK.speed * dt, b = TANK.bounds; const inB = !b || (nx > b[0] && nx < b[1] && nz > b[2] && nz < b[3]);
      if (inB && !blocked(nx, nz, 1.6, groundAt(nx, nz))) { TANK.fx = nx; TANK.fz = nz; } else TANK.speed *= 0.3; } else TANK.speed = 0;
  } else if (TANK.alive && TANK.goal !== undefined && TANK.goal !== null) {
    // free driving to a point on the path, forwards or in reverse (the tank keeps facing the way the path points): used for hull-down positions
    const d = TANK.goal - TANK.s, want = Math.sign(d) * Math.min(TANK.vmax, Math.sqrt(2 * 1.4 * Math.abs(d))); TANK.speed += clamp(want - TANK.speed, -dt * 3, dt * 3); TANK.s += TANK.speed * dt; if (Math.abs(d) < 0.06) { TANK.s = TANK.goal; TANK.speed = 0; }
  } else if (TANK.alive && (MODE === 'suez' ? SZ.stage <= 1 : TANK.driveOn)) {
    const st = TANK.stops[TANK.stopI]; let vmax = TANK.vmax;
    if (st !== undefined) { const d = st - TANK.s; if (d <= 0.05) { vmax = 0; TANK.holdAt = st; } else vmax = Math.min(vmax, Math.sqrt(2 * 1.1 * d)); }
    TANK.speed += clamp(vmax - TANK.speed, -dt * 2.5, dt * 1.2); TANK.s += TANK.speed * dt; if (st !== undefined && TANK.s > st) TANK.s = st;
  } else TANK.speed = 0;
  let wx, wz, hd0; if (TANK.free) { wx = TANK.fx; wz = TANK.fz; hd0 = TANK.hd; TANK.hdV = hd0; } else { const [x, z, h0] = tankAt(TANK.s); [wx, wz] = TANK.toW(x, z); hd0 = h0; } if (TANK.hdV === null) TANK.hdV = hd0; TANK.hdV += wrapPi(hd0 - TANK.hdV) * Math.min(1, dt * 1.6); const hd = TANK.hdV;
  const gy = groundAt(wx, wz), fx = Math.sin(hd), fz = Math.cos(hd), pf = groundAt(wx + fx * 3, wz + fz * 3), pb = groundAt(wx - fx * 3, wz - fz * 3), pl = groundAt(wx + fz * 1.6, wz - fx * 1.6), pr = groundAt(wx - fz * 1.6, wz + fx * 1.6);
  TANK.g.position.set(wx, (gy + (pf + pb) / 2) / 2, wz); TANK.g.rotation.set(-Math.atan2(pf - pb, 6) * 0.9, hd, Math.atan2(pl - pr, 3.2) * 0.9, 'YXZ'); TANK.g.position.y += Math.sin(GAME.t * 9) * 0.008 * (TANK.speed > 0.1 ? 1 : 0.3);
  for (const w of TANK.wheels) w.rotation.x -= TANK.speed * dt / 0.33; TANK.trackTex.offset.y -= TANK.speed * dt / 6.7 * 14 * 0.3;
  { const st = TANK.trl || (TANK.trl = { sp: 0 }), acc = (TANK.speed - st.sp) / Math.max(dt, 1e-3); st.sp = TANK.speed; if (TANK.alive && !TANK.rec) vehTrail(vehMat(TANK.g), TRAIL.mtank, TANK.speed, acc, dt, st); }   // dust from under the tracks, diesel smoke from the exhausts
  if (P.mode === 'tank') {
    // the turret follows where the commander looks, at hydraulic traverse speed
    const want = wrapPi(P.yaw + Math.PI - hd), cur = TANK.turret.rotation.y; TANK.turret.rotation.y = cur + clamp(wrapPi(want - cur), -0.9 * dt, 0.9 * dt);
    TANK.gun.rotation.x = clamp(-P.pitch, -0.36, 0.12) - TANK.recoil * 0.08; TANK.gun.position.z = 1.55 - TANK.recoil * 0.35;
    TANK.mgM.rotation.set(-P.pitch, wrapPi(P.yaw + Math.PI - hd - TANK.turret.rotation.y), 0);
  }
  if (TANK.burning) { TANK.fireT += dt; TANK.fireS.forEach((f, i) => { f.visible = true; f.position.set(rand(-0.6, 0.6), 1.9 + i * 0.5 + Math.sin(GAME.t * 7 + i) * 0.2, -2.2 + rand(-0.3, 0.3)); f.scale.setScalar(1.6 + i * 0.6 + Math.sin(GAME.t * 11 + i) * 0.3); });
    if (Math.random() < dt * 5) { const s = FX.smoke.get(); s.life = 6; s.s.position.set(TANK.g.position.x + rand(-1, 1), gy + 3, TANK.g.position.z + rand(-1, 1)); s.s.material.color.set(0x1a1816); s.upd = (q, u, dt2) => { q.s.position.y += 3 * dt2; q.s.scale.setScalar(2 + u * 9); q.s.material.opacity = 0.75 * (1 - u); }; }
    LIGHTS.fire.position.set(TANK.g.position.x, gy + 3, TANK.g.position.z); LIGHTS.fire.intensity = 22000 * (0.8 + 0.2 * Math.sin(GAME.t * 13)); }
}
function tankHit(p, big = false, dmg = null) {
  fxExplosion(p, big ? 1.4 : camera.position.distanceTo(p) < 4.5 ? 0.4 : 0.9); sndBoom(p, big ? 1.4 : 0.9); FX.shake = Math.max(FX.shake, big ? 1.1 : 0.6);
  if (!TANK.alive || GOD()) return; TANK.hp -= dmg ?? (big ? 60 : 11); if (P.mode === 'tank' && !P.crouch) hurtPlayer(rand(4, 9), p, true);
  radio('נהג', TANK.hp > 50 ? pick(['פגיעה בצד! ממשיכים!', 'אר־פי־ג׳י! לא חדר!']) : pick(['עוד פגיעה! המנוע מתחמם!', 'הטנק לא יחזיק עוד הרבה!']), 2.2);
  if (TANK.hp <= 0 && MODE !== 'suez') { TANK.hp = 0; TANK.alive = false; TANK.burning = true; endGame(false, 'tank'); }
  else if (TANK.hp <= 0 && SZ.stage <= 1) { if (SZ.stage === 1) bailOut(); else { TANK.alive = false; TANK.burning = true; endGame(false, 'tank'); } }
}
// aim help: of everything inside the cone around the crosshair, the nearest target wins (a far one only when nothing is close)
function aimPick(o, d, cone, veh = true) {
  const v = V3(), cand = [];
  for (const e of UNITS.enemies) { if (!e.alive || !e.rig.root.visible || e.stance === 'down' || e.fall >= 0 || (e.stance === 'hide' && !e.sz)) continue; const c = e.chest(); v.subVectors(c, o); const L = v.length(); if (L > 480 || L < 1.5) continue; const a = Math.acos(clamp(v.dot(d) / L, -1, 1)); if (a < cone) cand.push([a / cone + L / 140 + (e.stance === 'hide' ? 0.6 : 0), c]); }
  // the men in the boats: each seat still alive is a target (the gun in the Mezach is fired at boats more than at anything else)
  for (const bt of BOATS) { if (bt.dead || !bt.g.visible || bt.state !== 'cross') continue; for (let i = 0; i < bt.seats.length; i++) { const st = bt.seats[i]; if (!st.alive || st.gone) continue; const c = bt.seatWorld(i).add(V3(0, 0.75, 0)); v.subVectors(c, o); const L = v.length(); if (L > 480 || L < 1.5) continue; const a = Math.acos(clamp(v.dot(d) / L, -1, 1)); if (a < cone) cand.push([a / cone + L / 140 + (st.rower ? 0.15 : 0), c]); } }
  if (veh) for (const vh of VEH) { if (!vh.alive || vh.side !== 'e' || !vh.g.visible) continue; const c = vh.g.position.clone(); c.y += vh.half[1] * 0.6; v.subVectors(c, o); const L = v.length(); if (L > 1400) continue; const a = Math.acos(clamp(v.dot(d) / L, -1, 1)); if (a < cone * 1.5) cand.push([a / (cone * 1.5) + L / 400, c]); }
  cand.sort((a, b) => a[0] - b[0]);
  for (let i = 0; i < Math.min(4, cand.length); i++) { const c = cand[i][1]; if (losW(o.x, o.y, o.z, c.x, c.y + 0.1, c.z)) return c; }
  return null;
}
function aimAssist(o, d, maxAng, veh = true) { const c = aimPick(o, d, maxAng, veh); return c ? c.clone().sub(o).normalize() : d; }
// the sight itself drifts onto that target while firing or aiming, so a burst stays on the man
const AIMM = { t: 0, c: null };
function aimMagnet(dt) {
  if (CINE.on || !P.alive || GAME.state !== 'play') return; const tank = P.mode === 'tank', firing = INPUT.fire, ads = P.ads > 0.5;
  if (!(firing || ads) || (P.mode !== 'tank' && P.mode !== 'mag' && P.mode !== 'rifle') || (tank && P.crouch && !ads)) { AIMM.c = null; return; } const rmg = !!(P.ride && P.ride.mg);
  AIMM.t -= dt; const o = camera.position, d = camForward(V3());
  if (AIMM.t <= 0) { AIMM.t = 0.12; const cone = tank ? (ads ? 0.06 : 0.16) : P.mode === 'mag' || rmg ? 0.14 : (ads ? 0.07 : 0.1) * (TOUCH ? 1.4 : 1); AIMM.c = aimPick(o, d, cone, tank || (P.mode === 'mag' && P.post && P.post.mag && P.post.mag.big)); }
  if (!AIMM.c) return; const v = AIMM.c.clone().sub(o), ty = Math.atan2(-v.x, -v.z), tp = Math.atan2(v.y, Math.hypot(v.x, v.z));
  const k = 1 - Math.exp(-dt * (firing ? (TOUCH ? 9 : 6.5) : 3.5)); P.yaw += wrapPi(ty - P.yaw) * k; P.pitch += (tp - P.pitch) * k;
}
function tankMG() {
  if (P.crouch || TANK.mg > 0) return; TANK.mg = 0.105; STATS.shots = (STATS.shots || 0) + 1;
  let d = aimAssist(camera.position, camForward(V3()), P.ads > 0.5 ? 0.05 : 0.1); const sp = 0.006; d.x += rand(-sp, sp); d.y += rand(-sp, sp); d.z += rand(-sp, sp); d.normalize();
  const from = TANK.mgM.localToWorld(V3(0, TANK.mgY ?? 0.02, TANK.mgTip ?? 1.55)); const hit = castShot(camera.position.clone(), d, 700, 'f');
  fxMuzzle(from, true); sndShot('mag'); if (Math.random() < 0.4) fxTracer(from, hit.p, false); FX.shake = Math.max(FX.shake, 0.1); P.pitch += 0.003; P.yaw += rand(-0.003, 0.003);
  applyHit(hit, 140);
}
function tankMainGun() {
  if (TANK.gunT > 0 || !TANK.alive) { sndClick(800, 0.15); return; }
  TANK.gunT = 4.0; TANK.recoil = 1; const from = TANK.gun.localToWorld(V3(0, 0, TANK.gunL ?? 4.8)), d = V3(0, 0, 1).transformDirection(TANK.gun.matrixWorld);
  const o = camera.position.clone(), dir = aimAssist(o, camForward(V3()), 0.12);
  const hit = castShot(o, dir, MODE === 'armor' ? 1400 : 900, 'f');
  fxMuzzle(from, true); fxExplosion(from, 0.5); sndBoom(from, 1.3); FX.shake = Math.max(FX.shake, 0.9);
  for (let i = 0; i < 8; i++) fxDust(V3(TANK.g.position.x + rand(-3, 3), TANK.g.position.y + 0.4, TANK.g.position.z + rand(-3, 3)));
  // a high-explosive shell: it wipes out a whole position (everyone within 8 m, behind cover or not), throws the sandbags and pins down the windows around it
  explode(hit.p, 2.3, 10.5, 0, 'shell'); if (hit.kind === 'enemy') killEnemy(hit.u, false); bagBurst(hit.p, 9); for (let i = 0; i < 6; i++) { const s = FX.smoke.get(); s.life = 4 + Math.random() * 2; s.s.position.copy(hit.p).add(V3(rand(-3, 3), rand(0.5, 2.5), rand(-3, 3))); s.s.material.color.set(0x9a8e78); s.upd = (q, u) => { q.s.scale.setScalar(3 + u * 9); q.s.material.opacity = 0.75 * (1 - u); }; } if (hit.kind === 'veh' && hit.v.alive) vehHit(hit.v, 100, hit.p); else for (const v of VEH) if (v.alive && v.side === 'e' && v.g.position.distanceTo(hit.p) < 4.5) vehHit(v, v.armor > 0 ? 100 : 55, hit.p);
  feed('פגז נורה · טוען', '');
}
/* commander's view: head out of the cupola, or ducked behind the vision blocks; gunner's sight on aim */
function tankCamera(dt) {
  const hd = TANK.g.rotation.y;
  if (P.ads > 0.5) { TANK.gun.updateMatrixWorld(); const gp = TANK.gun.localToWorld(V3(0.55, 0.32, 0.4)); camera.position.copy(gp); }
  else { const hp = tankHeadPos(); camera.position.copy(hp); }
  P.pos.set(camera.position.x, camera.position.y - 1.65, camera.position.z); P.pitch = clamp(P.pitch, -0.55, 1.2);
  const sh = FX.shake; FX.shake = Math.max(0, FX.shake - dt * 1.8);
  camera.rotation.set(P.pitch + (sh ? rand(-sh, sh) * 0.03 : 0), P.yaw + (sh ? rand(-sh, sh) * 0.02 : 0), 0, 'YXZ');
  const fov = P.ads > 0.5 ? 13 : P.crouch ? 55 : 70; if (Math.abs(camera.fov - fov) > 0.05) { camera.fov = fov; camera.updateProjectionMatrix(); }
  vm.visible = false; $('#tsight').classList.toggle('on', P.ads > 0.5);
}
function bailOut() {
  if (SZ.stage !== 1 || SZ.bailed) return; SZ.bailed = true; TANK.alive = false; TANK.burning = true; TANK.hp = 0;
  const f = $('#fade'); f.style.transition = 'none'; f.style.opacity = '1'; P.crouch = false; P.mode = 'rifle'; P.ads = 0; INPUT.tAds = false; $('#tads').classList.remove('on');
  const hd = TANK.g.rotation.y, px = TANK.g.position.x + Math.cos(hd) * 2.6 - Math.sin(hd) * 1.0, pz = TANK.g.position.z - Math.sin(hd) * 2.6 - Math.cos(hd) * 1.0;
  P.pos.set(px, hAt(px, pz), pz); P.vy = 0; P.hp = Math.min(P.hp, 70); vm.visible = true; $('#tsight').classList.remove('on');
  requestAnimationFrame(() => requestAnimationFrame(() => { f.style.transition = 'opacity 1.4s'; f.style.opacity = '0'; }));
  radio('מ״פ', 'הטנק בוער! צאו ממנו! כולם לבניין הפינה!', 4); szStage(2);
}

/* ---------- the corner building: three floors, a stairwell, real windows and doors ---------- */
const TB = { x0: -82, x1: -66, z0: -38, z1: -24, sx1: -77.4, sz1: -29.3, lane: -79.7, door: [-77.3, -75.3], floors: 3, fN: -36.4, fS: -30.9 };
function rugTex(seed, a, b) { const c = canvas(128, 192), g = c.getContext('2d'), r = rng(seed); g.fillStyle = a; g.fillRect(0, 0, 128, 192); g.strokeStyle = b; g.lineWidth = 6; g.strokeRect(8, 8, 112, 176); g.lineWidth = 2; g.strokeRect(18, 18, 92, 156); for (let i = 0; i < 7; i++) { g.save(); g.translate(64, 30 + i * 22); g.rotate(Math.PI / 4); g.strokeRect(-7, -7, 14, 14); g.restore(); } g.fillStyle = 'rgba(0,0,0,0.12)'; for (let i = 0; i < 400; i++) g.fillRect(r() * 128, r() * 192, 2, 2); return tex(c); }
function pictureTex(seed) { const c = canvas(96, 72), g = c.getContext('2d'), r = rng(seed); g.fillStyle = '#5a3a22'; g.fillRect(0, 0, 96, 72); const sky = g.createLinearGradient(0, 8, 0, 64); sky.addColorStop(0, ['#9cc0d8', '#e0b878', '#a8b8a0'][seed % 3]); sky.addColorStop(1, '#e8dcc0'); g.fillStyle = sky; g.fillRect(7, 7, 82, 58); g.fillStyle = ['#5a7a4a', '#8a6a3a', '#4a5a6a'][seed % 3]; g.beginPath(); g.moveTo(7, 65); for (let x = 7; x <= 89; x += 8) g.lineTo(x, 40 + r() * 18); g.lineTo(89, 65); g.fill(); return tex(c); }
function buildCornerBuilding() {
  const X = LX, Z = LZ, wallC = 0xd9ccb0, inC = [0xb9c4b0, 0xd2c2a4, 0xaab8bd], T = 0.3, parts = [], slabParts = [], FY = (i) => CHH + i * FLH, N = TB.fN, S = TB.fS;
  const wall = (x0, x1, z0, z1, y0, y1, c) => { parts.push([boxUV(X(x0), X(x1), y0, y1, Z(z0), Z(z1), 3, 3), c]); addCollider(X((x0 + x1) / 2), Z((z0 + z1) / 2), Math.abs(x1 - x0) / 2, Math.abs(z1 - z0) / 2, 0, y1, y0); };
  const wallLine = (axis, c0, a0, a1, y0, ops, col) => {
    let cur = a0; const H = FLH; const seg = (s0, s1, yb, yt) => { if (s1 - s0 < 0.02 || yt - yb < 0.02) return; if (axis === 'x') wall(s0, s1, c0 - T / 2, c0 + T / 2, yb, yt, col); else wall(c0 - T / 2, c0 + T / 2, s0, s1, yb, yt, col); };
    for (const [o0, o1, sill, head] of ops.sort((a, b) => a[0] - b[0])) { seg(cur, o0, y0, y0 + H); seg(o0, o1, y0, y0 + sill); seg(o0, o1, y0 + head, y0 + H); cur = o1; }
    seg(cur, a1, y0, y0 + H);
  };
  const win = (c) => [c - 0.65, c + 0.65, 0.95, 2.75], door = (a, b) => [a, b, 0, 2.6];
  for (let f = 0; f < 3; f++) {
    const y = FY(f), c = inC[f];
    wallLine('x', TB.z1, TB.x0, TB.x1, y, f === 0 ? [door(TB.door[0], TB.door[1]), win(-71), win(-68.3)] : [win(-80.5), win(-75.5), win(-71), win(-68.3)], wallC);
    wallLine('x', TB.z0, TB.x0, TB.x1, y, [win(-75), win(-70)], wallC);
    wallLine('z', TB.x1, TB.z0, TB.z1, y, [win(-34.5), win(-27.2)], wallC);
    wallLine('z', TB.x0, TB.z0, TB.z1, y, [win(-26.8)], wallC);
    // stairwell: east wall with the floor-1 door at the north landing; south wall with doors on the ground floor (lane A) and floor 2 (lane B)
    wallLine('z', TB.sx1, TB.z0 + T / 2, TB.sz1, y, f === 1 ? [door(-37.8, -36.5)] : [], c);
    wallLine('x', TB.sz1, TB.x0 + T / 2, TB.sx1, y, f === 0 ? [door(-81.6, -79.95)] : f === 2 ? [door(-79.5, -77.65)] : [], c);
    // rooms: a partition between the west and east rooms, and walls between the rooms and the hall along the street
    wallLine('z', -71.6, TB.z0 + T / 2, TB.sz1, y, [door(-35.5, -33.8)], c);
    wallLine('x', TB.sz1, TB.sx1, -71.6, y, [door(-74.6, -72.8)], c);
    wallLine('x', TB.sz1, -71.6, TB.x1 - T / 2, y, [door(-70.2, -68.4)], c);
  }
  const RY = FY(3);
  for (const [a, b, cc, d] of [[TB.x0, TB.x1, TB.z1 - 0.15, TB.z1 + 0.15], [TB.x0, TB.x1, TB.z0 - 0.15, TB.z0 + 0.15], [TB.x0 - 0.15, TB.x0 + 0.15, TB.z0, TB.z1], [TB.x1 - 0.15, TB.x1 + 0.15, TB.z0, TB.z1]]) wall(a, b, cc, d, RY, RY + 1.0, wallC);
  wallLine('z', TB.sx1, TB.z0 + T / 2, TB.sz1, RY, [door(-37.8, -36.5)], wallC); wallLine('x', TB.sz1, TB.x0 + T / 2, TB.sx1, RY, [], wallC);
  parts.push([boxUV(X(TB.x0), X(TB.sx1 + 0.15), RY + FLH - 0.2, RY + FLH, Z(TB.z0), Z(TB.sz1 + 0.15), 3, 3), 0xb7ab92]);
  const slab = (x0, x1, z0, z1, y) => { addFloor(X(Math.min(x0, x1)), X(Math.max(x0, x1)), Z(Math.min(z0, z1)), Z(Math.max(z0, z1)), y); slabParts.push(boxUV(X(x0), X(x1), y - 0.22, y, Z(z0), Z(z1), 3, 3)); addCollider(X((x0 + x1) / 2), Z((z0 + z1) / 2), Math.abs(x1 - x0) / 2, Math.abs(z1 - z0) / 2, 0, y, y - 0.22); };
  for (let f = 1; f <= 3; f++) { const y = FY(f); slab(TB.sx1, TB.x1, TB.z0, TB.z1, y); slab(TB.x0, TB.sx1, TB.sz1, TB.z1, y); }
  slab(TB.x0, TB.sx1, TB.z0, N, FY(1)); slab(TB.x0, TB.sx1, S, TB.sz1, FY(2)); slab(TB.x0, TB.sx1, TB.z0, N, FY(3));
  slabParts.push(boxUV(X(TB.x0), X(TB.x1), CHH - 0.3, CHH + 0.02, Z(TB.z0), Z(TB.z1), 3, 3));
  // stairs: generous landings at both ends of the shaft, flights between them
  const flight = (x0, x1, zA, zB, yA, yB) => {
    addRamp(X(x0), X(x1), Z(Math.min(zA, zB)), Z(Math.max(zA, zB)), 'z', Z(zA), Z(zB), yA, yB);
    const n = 15; for (let i = 0; i < n; i++) { const u0 = i / n, u1 = (i + 1) / n, za = lerp(zA, zB, u0), zb = lerp(zA, zB, u1), yy = lerp(yA, yB, u1); parts.push([boxUV(X(x0), X(x1), yy - 0.2, yy, Z(Math.min(za, zb)), Z(Math.max(za, zb)), 3, 3), 0x8e877a]); }
  };
  flight(TB.x0 + T / 2, TB.lane - 0.1, S, N, FY(0), FY(1)); flight(TB.lane + 0.1, TB.sx1 - T / 2, N, S, FY(1), FY(2)); flight(TB.x0 + T / 2, TB.lane - 0.1, S, N, FY(2), FY(3));
  wall(TB.lane - 0.06, TB.lane + 0.06, N, S, CHH, FY(3) + 1, 0x6e675c);
  // furniture: an apartment block the Egyptians turned into a strongpoint. Every big piece blocks and gives cover. The pieces are the models of the
  // furniture pack (src/4f_data_furn.js); the sandbags, the ceiling lamps, the mirrors, the curtains, the rugs and the pictures are drawn here
  const furn = [], rr = rng(55), soft = [], pics = [], FM = {};
  const deco = (g, c) => furn.push([g, c]);
  // the outside, dressed like the blocks round the square: a band at every floor, a cornice under the parapet, a plinth, and every window
  // framed, with a sill and a pair of open wooden shutters folded back against the wall
  { const out = (axis, c0, sg, a0, a1, y0, y1, d0, d1, col, list = parts) => { const f0 = c0 + sg * (T / 2 + d0), f1 = c0 + sg * (T / 2 + d1), lo = Math.min(f0, f1), hi = Math.max(f0, f1);
      list.push([axis === 'x' ? boxUV(X(a0), X(a1), y0, y1, Z(lo), Z(hi), 3, 3) : boxUV(X(lo), X(hi), y0, y1, Z(a0), Z(a1), 3, 3), col]); };
    const FACES = [['x', TB.z1, 1, TB.x0, TB.x1, (f) => (f === 0 ? [-71, -68.3] : [-80.5, -75.5, -71, -68.3])], ['x', TB.z0, -1, TB.x0, TB.x1, () => [-75, -70]], ['z', TB.x1, 1, TB.z0, TB.z1, () => [-34.5, -27.2]], ['z', TB.x0, -1, TB.z0, TB.z1, () => [-26.8]]];
    const BAND = 0xc6b898, TRIM = 0xe4dac4, SHUT = [0x5e4630, 0x4f5f49, 0x6b5238, 0x55606a], sr = rng(73);
    for (const [ax, c0, sg, a0, a1, wins] of FACES) {
      const e = ax === 'x' ? T / 2 + 0.14 : 0, b0 = a0 - e, b1 = a1 + e;
      for (let f = 1; f <= 3; f++) out(ax, c0, sg, b0, b1, FY(f) - 0.12, FY(f) + 0.16, 0, 0.12, BAND);
      out(ax, c0, sg, b0 - (ax === 'x' ? 0.06 : 0), b1 + (ax === 'x' ? 0.06 : 0), RY + 0.84, RY + 1.06, 0, 0.18, BAND);
      if (ax === 'x' && sg > 0) { out(ax, c0, sg, b0, TB.door[0] - 0.12, CHH, CHH + 0.8, 0, 0.05, 0xa89a80); out(ax, c0, sg, TB.door[1] + 0.12, b1, CHH, CHH + 0.8, 0, 0.05, 0xa89a80);
        out(ax, c0, sg, TB.door[0] - 0.14, TB.door[1] + 0.14, CHH + 2.6, CHH + 2.8, 0, 0.1, TRIM); for (const d of [TB.door[0] - 0.14, TB.door[1]]) out(ax, c0, sg, d, d + 0.14, CHH, CHH + 2.6, 0, 0.08, TRIM); }
      else out(ax, c0, sg, b0, b1, CHH, CHH + 0.8, 0, 0.05, 0xa89a80);
      for (let f = 0; f < 3; f++) { const y = FY(f); for (const c of wins(f)) {
        out(ax, c0, sg, c - 0.78, c + 0.78, y + 0.88, y + 0.95, 0, 0.15, TRIM); out(ax, c0, sg, c - 0.78, c + 0.78, y + 2.75, y + 2.92, 0, 0.08, TRIM);
        out(ax, c0, sg, c - 0.78, c - 0.65, y + 0.95, y + 2.75, 0, 0.07, TRIM); out(ax, c0, sg, c + 0.65, c + 0.78, y + 0.95, y + 2.75, 0, 0.07, TRIM);
        const sc = SHUT[Math.floor(sr() * SHUT.length)];
        for (const [s0, s1] of [[c - 1.28, c - 0.8], [c + 0.8, c + 1.28]]) { out(ax, c0, sg, s0, s1, y + 1.0, y + 2.7, 0.01, 0.045, sc, furn);
          for (let k = 0; k < 7; k++) { const yy = y + 1.1 + k * 0.22; out(ax, c0, sg, s0 + 0.05, s1 - 0.05, yy, yy + 0.06, 0.045, 0.07, sc, furn); } } } }
    }
  }
  const B = (x, y, z, w, h, d, c) => deco(new THREE.BoxGeometry(w, h, d).translate(X(x), y, Z(z)), c);
  // a solid piece: it blocks up to its top and, with cover, gives cover points round it that belong to its floor
  const solid = (x, z, hx, hz, rot, y, h, f, cover) => { addCollider(X(x), Z(z), hx, hz, rot, y + h, y - 0.1); if (!cover) return; const k0 = COVER.length; coverBox(X(x), Z(z), hx, hz, rot, h); for (let i = k0; i < COVER.length; i++) { COVER[i].y = FY(f); COVER[i].floor = f; SZ.covers.push(COVER[i]); } };
  // a model: x, z in the plan, on floor f (y0 over it), turned ry (0: its front to the street). block 1: it blocks, sized from the model's own box;
  // 2: and gives cover. Each copy is an instance, all of a model drawn at once at the end. Returns the height of its top (0 when the build lacks it)
  const fm = (name, x, z, f, ry = 0, block = 0, y0 = 0) => {
    if (!mdlHas(name)) return 0; const b = mdlBox(name), y = FY(f) + y0;
    (FM[name] = FM[name] || []).push(M4(X(x), y, Z(z), 0, ry, 0));
    if (block) solid(x, z, b[0] / 2, b[2] / 2, ry, y, b[1], f, block > 1);
    return y0 + b[1];
  };
  // a pile: layers of the long weapons crates two side by side, then ammunition boxes on top, each a little askew. It blocks; returns its height
  const crates = (x, z, f, ry, layers, boxes, block = 1) => {
    if (!mdlHas('f_crate_long') || !mdlHas('f_crate_wood')) return 0; const L = mdlBox('f_crate_long'), A = mdlBox('f_crate_wood'), s = Math.sin(ry), c = Math.cos(ry); let h = 0;
    for (let l = 0; l < layers; l++, h += L[1]) for (const o of [-0.5, 0.5]) fm('f_crate_long', x + s * o * L[2], z + c * o * L[2], f, ry + (rr() - 0.5) * 0.05, 0, h);
    for (let k = 0; k < boxes; k++, h += A[1]) fm('f_crate_wood', x, z, f, ry + (rr() - 0.5) * 0.16, 0, h);
    if (block) solid(x, z, (layers ? L[0] : A[0]) / 2, (layers ? 2 * L[2] : A[2]) / 2, ry, FY(f), h, f, block > 1);
    return h;
  };
  const rug = (x, z, f, w, d, k) => soft.push([new THREE.PlaneGeometry(w, d).rotateX(-Math.PI / 2).translate(X(x), FY(f) + 0.015, Z(z)), k]);
  const pic = (x, z, f, ry, k) => pics.push([new THREE.PlaneGeometry(0.9, 0.68).rotateY(ry).translate(X(x), FY(f) + 1.65, Z(z)), k]);
  const curtain = (x, z, f, ry, c) => { for (const s of [-1, 1]) deco(new THREE.PlaneGeometry(0.5, 1.75).rotateY(ry).translate(X(x) + Math.cos(ry) * s * 0.8, FY(f) + 1.45, Z(z) - Math.sin(ry) * s * 0.8), c); };
  const bags = (x0, z0, x1, z1, f, layers) => { const y = FY(f), L = Math.hypot(x1 - x0, z1 - z0), n = Math.max(2, Math.round(L / 0.55)); for (let l = 0; l < layers; l++) for (let i = 0; i < n; i++) { const u = (i + (l % 2) * 0.5) / n; if (u > 1) continue; B(lerp(x0, x1, u), y + 0.1 + l * 0.19, lerp(z0, z1, u), Math.abs(x1 - x0) > Math.abs(z1 - z0) ? 0.56 : 0.34, 0.2, Math.abs(x1 - x0) > Math.abs(z1 - z0) ? 0.34 : 0.56, 0xb7a47c); } addCollider(X((x0 + x1) / 2), Z((z0 + z1) / 2), Math.abs(x1 - x0) / 2 + 0.2, Math.abs(z1 - z0) / 2 + 0.2, 0, y + layers * 0.19, y - 0.1); };
  const TS = 0, TN = Math.PI, TE = Math.PI / 2, TW = -Math.PI / 2;   // the turn that faces a model's front south (to the street), north, east or west
  // Furniture stands against the walls and leaves every door, every window and the middle of each room free: the squad has to move in here
  // ground floor: the coffee house. The counter on the north wall (east of the window) and the shelf of bottles beside it on the partition, the stove in the corner, a bench and two tables by the east wall, a table by the street wall, a bench by the west wall and the shelf with the radio in the south-east corner
  fm('f_desk', -73.3, -37.51, 0, TS, 2); fm('f_lamp_k', -72.85, -37.62, 0, TS, 0, 0.76); fm('f_shelf', -71.9, -36.95, 0, TW, 2); fm('f_oven', -76.85, -37.58, 0, TS, 2);
  fm('f_bench_metal', -68.5, -37.71, 0, TS, 2);
  for (const tz of [-36.6, -31.2]) { fm('f_table_metal', -66.49, tz, 0, TW, 2); fm('f_chair', -67.25, tz, 0, TE); } fm('f_chair', -66.6, -30.25, 0, TN);
  fm('f_table_metal', -73.3, -24.49, 0, TS, 2); fm('f_chair', -73.75, -25.3, 0, TS); fm('f_chair', -72.85, -25.3, 0, TS); fm('f_bench_metal', -81.71, -25.0, 0, TE, 2);
  fm('f_shelf', -66.3, -25.0, 0, TW, 2); fm('f_radio_set', -66.32, -25.15, 0, TW, 0, 1.13);
  // first floor: the family flat. The sofa against the stairwell wall, the bookcase on the north wall, the bed and the wardrobe in the east room, the writing desk against the partition, the dining table and the dressing table in the hall, the stove, the worktop and the pantry shelf along the hall wall
  fm('f_sofa', -76.83, -34.4, 1, TE, 2); fm('f_shelf', -72.9, -37.705, 1, TS, 2); rug(-74.6, -34.0, 1, 2.6, 2.2, 0);
  pic(-72.0, -37.83, 1, 0, 0); pic(-71.75, -32.0, 1, -Math.PI / 2, 1); curtain(-75.0, -37.82, 1, 0, 0x7a2a2a); curtain(-70.0, -37.82, 1, 0, 0x2a4a6a);
  fm('f_bed_wood', -67.6, -36.85, 1, TS, 2); fm('f_wardrobe', -66.46, -31.6, 1, TW, 2); rug(-68.8, -33.0, 1, 1.8, 1.4, 1); curtain(-66.2, -34.5, 1, -Math.PI / 2, 0x2a4a6a);
  fm('f_desk', -71.41, -36.9, 1, TE, 2); fm('f_chair', -70.65, -36.9, 1, TW); fm('f_lamp_desk', -71.6, -37.3, 1, TE, 0, 0.76); fm('f_radio_set', -71.62, -36.55, 1, TE, 0, 0.76); B(-71.43, FY(1) + 1.35, -36.9, 0.02, 0.7, 1.0, 0xc8d0d8);
  fm('f_table_wood', -73.3, -24.55, 1, TS, 2); fm('f_chair', -73.85, -25.4, 1, TS); fm('f_chair', -72.75, -25.4, 1, TS); fm('f_lamp_k', -72.7, -24.4, 1, TS, 0, 0.76);
  fm('f_desk', -81.51, -25.0, 1, TE, 2); B(-81.83, FY(1) + 1.45, -25.0, 0.02, 0.7, 1.1, 0xc8d0d8);
  fm('f_oven', -72.3, -28.89, 1, TS, 2); fm('f_table_metal', -71.25, -28.81, 1, TS, 2); fm('f_shelf', -66.9, -29.005, 1, TS, 2);
  pic(-72.0, -24.17, 1, Math.PI, 2); curtain(-71.0, -24.18, 1, Math.PI, 0xc8b070);
  // second floor: the Egyptian command post. Sandbags under the fighting windows, the map table against the stairwell wall, the radio desk on the north wall, the clerk's desk and the filing cabinet by the east wall, the mattresses along the partition, the crates
  bags(-76.0, -37.2, -74.0, -37.2, 2, 3); bags(-71.0, -37.2, -69.0, -37.2, 2, 3); bags(-66.5, -35.5, -66.5, -33.5, 2, 3); bags(-81.5, -27.8, -81.5, -25.8, 2, 3); bags(-72.0, -24.5, -70.0, -24.5, 2, 3); bags(-81.5, -24.5, -79.5, -24.5, 2, 3);
  fm('f_table_wood', -76.3, -33.5, 2, TS, 2); soft.push([new THREE.PlaneGeometry(1.4, 0.7).rotateX(-Math.PI / 2).translate(X(-76.3), FY(2) + 0.77, Z(-33.5)), 2]); fm('f_chair_fold', -76.0, -34.25, 2, TS);
  fm('f_desk', -72.8, -37.51, 2, TS, 2); fm('f_chair_fold', -72.8, -36.75, 2, TN);
  fm('f_desk', -66.49, -31.0, 2, TW, 2); fm('f_chair_fold', -67.3, -31.0, 2, TE); fm('f_typewriter', -66.5, -31.2, 2, TW, 0, 0.76); fm('f_lamp_desk', -66.35, -30.55, 2, TW, 0, 0.76); fm('f_cabinet', -66.51, -37.5, 2, TW, 2);
  for (const mx of [-71.05, -70.2]) fm('f_mattress', mx, -32.4, 2, TS);
  crates(-76.75, -30.05, 2, TS, 0, 4); const cpB = crates(-67.2, -28.75, 2, TS, 2, 0); fm('f_typewriter', -67.2, -28.75, 2, TS, 0, cpB);
  fm('f_cabinet', -81.49, -28.85, 2, TE, 2); fm('f_bench_metal', -66.85, -24.29, 2, TS, 2); B(-76.0, FY(2) + 1.5, -29.17, 1.6, 1.0, 0.05, 0x1e2a22);
  // the roof: a sandbag position and the water tanks
  bags(-74, -24.6, -70, -24.6, 3, 4); bags(-66.6, -30, -66.6, -27, 3, 4); B(-70.0, FY(3) + 0.9, -34.5, 1.6, 1.8, 1.6, 0x8b8a84);
  // ceiling lamps and a few dropped things
  for (let f = 0; f < 3; f++) for (const [x, z] of [[-75, -34], [-69, -34], [-74, -26.8], [-68.5, -26.8]]) { B(x, FY(f + 1) - 0.45, z, 0.02, 0.6, 0.02, 0x2a2a28); deco(new THREE.SphereGeometry(0.13, 8, 6).translate(X(x), FY(f + 1) - 0.8, Z(z)), 0xfff2c8); }
  // the small things: on every table, counter and crate, and on the walls - the coffee house below, the family above, the command post over them
  PROPS.reg.suez = (m) => SZ.objs.push(m); szProps(FY);
  const mat = (() => { const t = plasterTex(71, '#efe8da'); return new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, map: t, bumpMap: bumpOf(t), bumpScale: 0.3 }); })();
  const mk = (list, m2 = mat) => { const g = build(list.map(([gg, c]) => [gg, c])); const m = new THREE.Mesh(g, m2); scene.add(SH(onLayer1(m))); SZ.objs.push(m); };
  mk(parts); mk(furn, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85, map: TX.grime, side: THREE.DoubleSide })); { const m = new THREE.Mesh(build(slabParts.map((g) => [g, 0x9c9384])), mat); scene.add(SH(onLayer1(m))); SZ.objs.push(m); }
  // the furniture models: all the copies of each in one draw (the lighter level of detail in the light setting); only the bigger pieces cast shadows
  for (const n in FM) for (const m of mdlInst(n, LITE ? 1 : 0, FM[n], null, Math.max(...mdlBox(n)) > 0.6)) SZ.objs.push(m);
  const rugs = [rugTex(1, '#7a2a22', '#d8b878'), rugTex(2, '#2a3a5a', '#c8a868'), new THREE.CanvasTexture((() => { const c = canvas(128, 64), g = c.getContext('2d'); g.fillStyle = '#d8ccaa'; g.fillRect(0, 0, 128, 64); g.strokeStyle = '#6a4a2a'; for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(10 + i * 12, 6); g.bezierCurveTo(30 + i * 9, 30, 4 + i * 13, 40, 20 + i * 11, 60); g.stroke(); } g.fillStyle = '#8a2a22'; g.fillRect(70, 20, 6, 6); g.fillRect(40, 38, 6, 6); return c; })())];
  for (const [g, k] of soft) { const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: rugs[k], roughness: 1 })); scene.add(onLayer1(m)); SZ.objs.push(m); m.receiveShadow = !LITE; }
  for (const [g, k] of pics) { const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: pictureTex(k), roughness: 0.7 })); scene.add(onLayer1(m)); SZ.objs.push(m); }
  const sg = sign('عمارة الأربعين', 'plain', X(-76.3), CHH + 2.9, Z(TB.z1) + 0.2, 0, 1.4); SZ.objs.push(sg);
  szAidBuild(FY);
  SZ.tb = TB;
  // keep only room covers that stand on open floor inside the rooms (not in walls, furniture, the stair shaft or outside)
  for (let i = SZ.covers.length - 1; i >= 0; i--) { const c = SZ.covers[i]; if (c.floor === undefined) continue; const lx = c.x - CITY.cx, lz = c.z - CITY.cz;
    const bad = lx < TB.x0 + 0.5 || lx > TB.x1 - 0.5 || lz < TB.z0 + 0.5 || lz > TB.z1 - 0.5 || (lx < TB.sx1 + 0.45 && lz < TB.sz1 + 0.3) || blocked(c.x, c.z, 0.3, c.y); if (bad) SZ.covers.splice(i, 1); }
}
/* the improvised aid post of the last stages: the living room of the first floor. Mattresses on the floor for the wounded, stretchers against the
   wall, the medic's crates, a drip stand, a sheet with a red cross out of the window and a sign on each door. Hidden until the building is ours */
const SZ_AID = { x0: -77.4, x1: -71.6, z0: -38, z1: -29.3, c: [-74.8, -33.6], door: [-76.6, -37.1], hall: [-73.7, -28.8] };
const SZ_WOUNDED = [['יענקל׳ה', -73.0, -36.5], ['דני', -73.0, -34.8], ['מנחם', -73.0, -33.1], ['עופר', -75.0, -32.4], ['יורם', -75.0, -30.7]];   // friends 10-14, lying with their heads to the east wall
const SZ_MEDIC = ['החובש', -76.6, -31.5];   // friend 15, on his feet between the wounded and the door
const SZ_RAID = [[-76.3, -22.5, 0], [-76.3, -25.5, 0], [-80.8, -28.6, 0], [-80.8, -31.3, 0], [-80.8, -37.1, 1], [-76.6, -37.1, 1], [-75.0, -34.2, 1]];   // the way up the stairs and through the door of the aid post
function szInAid(x, z) { const lx = x - CITY.cx, lz = z - CITY.cz; return lx > SZ_AID.x0 && lx < SZ_AID.x1 && lz > SZ_AID.z0 && lz < SZ_AID.z1; }
function szAidBuild(FY) {
  const g = new THREE.Group(), y = FY(1), X = LX, Z = LZ, parts = [];
  const bx = (x, yy, z, w, h, d, c, ry = 0) => parts.push([new THREE.BoxGeometry(w, h, d).rotateY(ry).translate(X(x), yy, Z(z)), c]);
  // the mattresses of the furniture pack, each with its pillow and blanket, the pillow to the east wall (none when the build lacks the model)
  if (mdlHas('f_mattress')) for (const m of mdlInst('f_mattress', LITE ? 1 : 0, SZ_WOUNDED.map(([, x, z]) => M4(X(x), y, Z(z), 0, -Math.PI / 2, 0)), null, false)) g.add(m);
  for (const [x, z] of [[-71.9, -37.0], [-71.9, -36.1]]) { for (const dz of [-0.22, 0.22]) bx(x, y + 0.98, z + dz, 0.07, 1.96, 0.07, 0x6b4a30); bx(x, y + 0.98, z, 0.04, 1.88, 0.4, 0x4f5a3c); }
  for (const [x, z, r] of [[-76.7, -30.0, 0.2], [-76.2, -29.75, -0.3]]) { bx(x, y + 0.2, z, 0.62, 0.4, 0.42, 0x5d6a4a, r); bx(x, y + 0.405, z, 0.3, 0.012, 0.3, 0xefece4, r); bx(x, y + 0.414, z, 0.2, 0.012, 0.06, 0xb4231a, r); bx(x, y + 0.414, z, 0.06, 0.012, 0.2, 0xb4231a, r); }
  for (const [x, z] of [[-73.9, -37.2], [-74.1, -31.55]]) { bx(x, y + 0.9, z, 0.03, 1.8, 0.03, 0x8a8a84); bx(x, y + 0.03, z, 0.4, 0.06, 0.4, 0x6a6a64); bx(x, y + 1.62, z, 0.12, 0.22, 0.05, 0xdfe6e4); }
  { const m = new THREE.Mesh(build(parts), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9, map: TX.grime })); g.add(SH(onLayer1(m))); }
  { const c = canvas(64, 64), q = c.getContext('2d'); q.fillStyle = '#efece4'; q.fillRect(0, 0, 64, 64); q.fillStyle = '#b4231a'; q.fillRect(24, 8, 16, 48); q.fillRect(8, 24, 48, 16); const m = new THREE.Mesh(new THREE.PlaneGeometry(1.25, 0.95), new THREE.MeshStandardMaterial({ map: tex(c), roughness: 0.95, side: THREE.DoubleSide })); m.position.set(X(-75.5), y + 0.42, Z(TB.z1) + 0.19); g.add(onLayer1(m)); }
  g.add(sign('תאג״ד', 'aid', X(-72.1), y + 2.0, Z(TB.sz1) + 0.17, 0, 0.9)); g.add(sign('תאג״ד', 'aid', X(TB.sx1) - 0.17, y + 2.0, Z(-35.9), -Math.PI / 2, 0.9));
  g.visible = false; g.userData.dyn = true; scene.add(g); SZ.objs.push(g); SZ.aidG = g;
}
function szProps(FY) {
  const P = (kind, x, z, y, rot = 0, floor) => propAdd('suez', kind, LX(x), y, LZ(z), rot, floor), On = (kinds, x, z, y, w, d, seed, floor) => propsOn('suez', kinds, LX(x), LZ(z), y, w, d, 0, seed, floor);
  const W = (kind, x, y, z, ry, seed, side = 'e') => propWall('suez', kind, LX(x), y, LZ(z), ry, seed, side);
  const S = Math.PI / 2, N = -Math.PI / 2, E = 0, Wf = Math.PI;   // the way each wall faces into a room: from the west wall (+x), east wall (-x), south wall (+z), north wall (-z)
  // the tops of the furniture models (src/4f_data_furn.js): tables, desks and metal tables 0.76, the stove 0.9, the boards of the shelf 0.21, 0.67 and 1.13,
  // the metal bench 0.39, the filing cabinet 1.3, the bed 0.5, the sofa's seat 0.42, the mattress 0.12; a pile of crates as high as its crates
  const pile = (n, k) => (mdlHas(n) ? mdlBox(n)[1] * k : 0);
  { const y = FY(0);   // the coffee house: finjans and glasses on the counter, bottles on the shelf beside it, the pots on the stove, backgammon by the tables, sacks along the stairwell wall
    On(['kettle', 'cups', 'glasses', 'teapot', 'ashtray', 'cigs'], -73.45, -37.5, y + 0.76, 0.9, 0.45, 41, y);
    On(['bottles', 'cans', 'jug', 'books', 'bottle', 'tin'], -71.9, -36.95, y + 0.68, 0.2, 1.3, 55, y); On(['bottles', 'cans', 'jug', 'vase'], -71.9, -36.95, y + 1.14, 0.2, 1.3, 56, y);
    P('pot', -76.75, -37.45, y + 0.9, 0, y); P('kettle', -76.95, -37.68, y + 0.9, 0.3, y); P('bucket', -76.0, -37.5, y); P('primus', -76.9, -36.5, y, 0.4);
    P('sack', -76.85, -35.4, y, 0.3); P('sack', -76.9, -34.75, y, 1.4); P('sack', -76.3, -35.1, y, 2.2); P('sack', -76.9, -33.6, y, 0.8); P('crateS', -76.85, -32.6, y, 0.1); P('cans', -76.85, -32.6, y + 0.33, 0, y); P('basket', -76.8, -31.6, y); P('jug', -76.6, -31.0, y, 0.2);
    On(['glasses', 'backgammon', 'ashtray'], -66.49, -36.6, y + 0.76, 0.5, 1.0, 43, y); On(['cups', 'cards', 'cigs'], -66.49, -31.2, y + 0.76, 0.5, 1.0, 44, y); On(['teapot', 'cups', 'glasses', 'ashtray'], -73.3, -24.49, y + 0.76, 1.05, 0.5, 45, y);
    P('nargila', -67.6, -35.9, y, 0.3); P('nargila', -67.5, -31.9, y, 1.2); P('nargila', -72.35, -25.5, y, 0.6); P('helmet', -68.75, -37.71, y + 0.39, 0.4, y); P('pack', -68.15, -37.7, y + 0.39, 1.5, y);
    P('crateS', -78.2, -28.85, y, 0.2); P('cans', -78.2, -28.85, y + 0.33, 0, y); P('basket', -78.9, -28.9, y); P('basket', -77.8, -28.75, y, 0.6); P('tin', -79.3, -28.8, y, 0.4); P('jerry', -67.4, -28.9, y, 0.2); P('bucket', -66.5, -28.9, y);
    P('vase', -66.3, -24.55, y + 1.13, 0, y); P('frame', -66.3, -25.6, y + 1.13, 0.2, y); P('books', -66.3, -25.2, y + 0.68, 0.1, y); P('nargila', -81.3, -25.9, y, 0.3); P('cups', -81.7, -25.0, y + 0.39, 0, y);
    W('portrait', -78.8, y + 1.75, -24.19, Wf, 2, 'e'); W('clock', -72.0, y + 2.1, -37.83, E); W('calendar', -71.78, y + 1.6, -31.5, N, 1); W('mirror', -77.23, y + 1.6, -34.0, S); W('clock', -76.0, y + 2.1, -29.13, E); W('calendar', -66.42, y + 1.7, -30.5, N, 2);
  }
  { const y = FY(1);   // the flat: the salon with its books and its tray, the bedroom, the kitchen along the hall with its pots
    P('books', -76.55, -35.0, y + 0.42, 0.2, y); P('cigs', -76.55, -33.8, y + 0.42, 0, y);
    for (const [yy, ks, sd] of [[0.21, ['books', 'books', 'frame'], 65], [0.67, ['radio', 'vase', 'books'], 69.5], [1.13, ['books', 'tclock', 'frame'], 74]]) On(ks, -72.9, -37.705, y + yy + 0.01, 1.3, 0.2, sd, y);
    P('books', -67.15, -36.2, y + 0.5, 0.4, y); P('boots', -68.7, -35.6, y, 0.5);
    On(['frame', 'cups', 'cigs', 'vase'], -71.25, -36.95, y + 0.76, 0.25, 0.4, 64, y);
    On(['plates', 'pot', 'basket', 'cups', 'bottle', 'glasses', 'fruit'], -73.45, -24.55, y + 0.76, 1.1, 0.6, 52, y);
    P('pan', -72.25, -28.95, y + 0.9, 0.3, y); On(['kettle', 'plates', 'cans', 'jug', 'cups', 'bottles', 'teapot'], -71.4, -28.81, y + 0.76, 0.85, 0.5, 53, y); P('primus', -70.85, -28.8, y + 0.76, 0, y); P('basket', -66.9, -29.0, y + 1.13, 0.3, y); On(['cans', 'tin', 'bottles', 'jug'], -66.9, -29.0, y + 0.68, 1.3, 0.2, 54, y);
    On(['plates', 'teapot', 'vase', 'glasses', 'basket'], -81.45, -25.0, y + 0.76, 0.45, 1.1, 65, y);
    P('bucket', -70.3, -28.6, y); P('sack', -69.9, -28.5, y, 0.4); P('jerry', -67.2, -28.55, y, 0.3); P('tin', -67.55, -28.5, y, 0.2); P('bottles', -73.3, -25.25, y, 0, y);
    W('clock', -69.65, y + 2.05, -24.19, Wf); W('calendar', -66.42, y + 1.9, -25.6, N, 2); W('mirror', -76.5, y + 1.6, -37.83, E); W('calendar', -71.78, y + 1.5, -32.0, N, 1); W('portrait', -78.0, y + 1.8, -24.19, Wf, 6, 'e'); W('mirror', -77.23, y + 1.6, -32.5, S);
  }
  { const y = FY(2);   // the command post: the map table under its lamp, the big sets with their handsets, helmets and packs by the mattresses
    On(['papers', 'maptube', 'phone', 'binocs', 'lamp', 'cups', 'ashtray', 'cigs', 'headset'], -76.3, -33.5, y + 0.77, 1.4, 0.65, 61, y); P('thermos', -76.95, -33.25, y + 0.76, 0, y); P('books', -75.65, -33.25, y + 0.76, 0.2, y);
    On(['radioBig', 'headset', 'papers'], -72.85, -37.55, y + 0.76, 1.0, 0.45, 68, y); P('phone', -72.35, -37.3, y + 0.76, 0.8, y);
    On(['papers', 'phone', 'cups', 'cigs'], -66.72, -31.0, y + 0.76, 0.18, 1.1, 69, y); P('papers', -66.5, -37.55, y + 1.3, 0.3, y); P('books', -66.5, -37.35, y + 1.3, 0.1, y);
    P('boots', -69.45, -33.3, y, 0.3); P('pack', -69.5, -32.0, y, 1.2); P('helmet', -69.45, -32.7, y, 0.5); P('canteen', -69.55, -31.4, y); P('cards', -70.95, -32.2, y + 0.12, 0.3, y); P('cigs', -69.6, -31.9, y, 0, y);
    P('ammo', -76.75, -30.05, y + pile('f_crate_wood', 4), 0.1, y); P('helmet', -76.45, -29.95, y + pile('f_crate_wood', 4), 0.8, y); P('lamp', -67.65, -28.8, y + pile('f_crate_long', 2), 0, y); P('papers', -66.85, -28.6, y + pile('f_crate_long', 2), 0.5, y);
    P('jerry', -76.9, -35.8, y, 0.2); P('jerry', -76.85, -36.3, y, -0.3); P('ammo', -76.9, -31.6, y, 0.2); P('ammo', -76.9, -31.6, y + 0.22, 0.4, y); P('helmet', -66.6, -24.3, y + 0.39, 0.3, y); P('pack', -67.2, -24.3, y + 0.39, 1.1, y);
    P('primus', -80.6, -28.8, y, 0); P('kettle', -80.6, -28.8, y + 0.27, 0.3, y); P('cups', -80.1, -28.7, y, 0, y); P('papers', -81.45, -28.85, y + 1.3, 0.5, y); P('canteen', -79.7, -28.8, y);
    W('map', -71.42, y + 1.65, -32.0, S, 7, 'e'); W('portrait', -77.0, y + 1.8, -24.19, Wf, 4, 'e'); W('clock', -68.3, y + 2.1, -37.83, E); W('calendar', -66.42, y + 1.8, -25.3, N, 1); W('map', -80.6, y + 1.6, -29.13, E, 8, 'e');
  }
}
const tbFloor = (y) => Math.round((y - CHH) / FLH);
function inTB(x, z, pad = 0) { return x > LX(TB.x0) - pad && x < LX(TB.x1) + pad && z > LZ(TB.z0) - pad && z < LZ(TB.z1) + pad; }

/* ---------- fortified windows: the Egyptians sandbagged a few windows on each face (more round the square) - a concrete ledge out from the
   wall and a U of sandbags on it. The man in it stands to fire over the bags and drops behind them for cover, and the bags stop bullets ---------- */
function sandbagTex() {
  const W = 256, H = 220, c = canvas(W, H), g = c.getContext('2d'), r = rng(77), rows = 5, bh = H / rows;
  g.fillStyle = '#5a4c34'; g.fillRect(0, 0, W, H);
  const rr = (x, y, w, h, k) => { g.beginPath(); g.moveTo(x + k, y); g.lineTo(x + w - k, y); g.quadraticCurveTo(x + w, y, x + w, y + k); g.lineTo(x + w, y + h - k); g.quadraticCurveTo(x + w, y + h, x + w - k, y + h); g.lineTo(x + k, y + h); g.quadraticCurveTo(x, y + h, x, y + h - k); g.lineTo(x, y + k); g.quadraticCurveTo(x, y, x + k, y); g.closePath(); };
  for (let j = 0; j < rows; j++) for (let i = -1; i < 3; i++) {
    const x = i * 128 + (j % 2 ? 64 : 0) + 3, y = j * bh + 2, w = 122, h = bh - 4, tone = 0.88 + r() * 0.2;
    const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, `rgb(${202 * tone | 0},${184 * tone | 0},${140 * tone | 0})`); gr.addColorStop(0.5, `rgb(${170 * tone | 0},${150 * tone | 0},${108 * tone | 0})`); gr.addColorStop(1, `rgb(${112 * tone | 0},${96 * tone | 0},${66 * tone | 0})`);
    g.fillStyle = gr; rr(x, y, w, h, h * 0.45); g.fill();
    g.strokeStyle = 'rgba(70,56,36,.55)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x + w - 14, y + 4); g.lineTo(x + w - 14, y + h - 4); g.stroke();
    for (let k = 0; k < 60; k++) { g.fillStyle = r() < 0.5 ? 'rgba(60,48,30,.18)' : 'rgba(255,245,220,.12)'; g.fillRect(x + r() * w, y + r() * h, 2, 1); }
  }
  const t = tex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
function szFortWindows(B, nAve) {
  const fr = rng(4173), bags = [], slabs = [];
  B.forEach((b, bi) => {
    const [fx, fz] = b.face, horiz = fz !== 0, fc = horiz ? (fz > 0 ? b.z1 : b.z0) : (fx > 0 ? b.x1 : b.x0), a0 = horiz ? b.x0 : b.z0, a1 = horiz ? b.x1 : b.z1, FI = faceInfo(b), sq = bi >= nAve;
    const tx = horiz ? 1 : 0, tz = horiz ? 0 : 1;
    for (let f = 1; f < Math.min(b.fl, 4); f++) {
      const ws = FI.wins.filter(() => fr() < (sq ? 0.5 : 0.36)); if (!ws.length && FI.wins.length && fr() < 0.7) ws.push(FI.wins[Math.floor(fr() * FI.wins.length)]);
      for (const a of ws) {
        const X = LX(horiz ? a : fc), Z = LZ(horiz ? fc : a), y = CHH + f * FLH, W = (al, out) => [X + tx * al + fx * out, Z + tz * al + fz * out];
        const ab = (al0, al1, o0, o1, y0, y1, tw, th) => { const [ax, az] = W(al0, o0), [bx, bz] = W(al1, o1); return boxUV(Math.min(ax, bx), Math.max(ax, bx), y0, y1, Math.min(az, bz), Math.max(az, bz), tw, th); };
        const col = (al, out, ha, ho, top, bot) => { const [cx, cz] = W(al, out); addCollider(cx, cz, horiz ? ha : ho, horiz ? ho : ha, 0, top, bot); };
        slabs.push([ab(-1.25, 1.25, 0, 1.18, y - 0.17, y + 0.01, 3, 3), 0xc9bea6]);
        bags.push(ab(-1.14, 1.14, 0.74, 1.14, y, y + 0.95, 1.1, 0.95)); for (const sd of [-1, 1]) bags.push(ab(sd * 0.8, sd * 1.14, 0.12, 0.74, y, y + 0.95, 1.1, 0.95));
        col(0, 0.94, 1.14, 0.2, y + 0.95, y - 0.25); for (const sd of [-1, 1]) col(sd * 0.97, 0.43, 0.17, 0.31, y + 0.95, y - 0.25);
        const s = { x: X, z: Z, y, nx: fx, nz: fz, f, b, used: false, fort: true }; s.p = W(0, 0.5); s.h = W(0, 0.42); SZ.slots.push(s);
      }
    }
    // the roof: behind the parapet (0.9 m), standing to fire over it, crouching behind it
    for (let a = a0 + 2; a < a1 - 1.5; a += 5) { const px = horiz ? a : fc, pz = horiz ? fc : a; const s = { x: LX(px), z: LZ(pz), y: CHH + b.fl * FLH, nx: fx, nz: fz, f: b.fl, b, roof: true, used: false }; s.p = [s.x - fx * 0.62, s.z - fz * 0.62]; s.h = [s.x - fx * 0.8, s.z - fz * 0.8]; SZ.slots.push(s); }
  });
  if (slabs.length) { const m = new THREE.Mesh(build(slabs), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9, map: TX.grime })); scene.add(SH(onLayer1(m))); }
  if (bags.length) { const t = sandbagTex(); const m = new THREE.Mesh(mergeGeometries(bags, false), new THREE.MeshStandardMaterial({ map: t, bumpMap: t, bumpScale: LITE ? 0.8 : 1.6, roughness: 0.97 })); scene.add(SH(onLayer1(m))); }
}

/* ---------- the city ---------- */
function buildSuez() {
  if (SZ.built) return; SZ.built = true; const k0 = scene.children.length;
  const PL = ['#e8dcc0', '#d8bf8c', '#e6c9b8', '#cdd2c6', '#ece4d2', '#c9b27e'], SH_ = ['#3f6b4e', '#5b4630', '#3d5b6b', '#6d6248', '#2f4f3a', '#6b3a2a'];
  const lists = { ground: [], upper: [], roof: [] }, gMats = [], uMats = [];
  const wallMat = (t) => new THREE.MeshStandardMaterial({ map: t, bumpMap: bumpOf(t), bumpScale: LITE ? 0.8 : 1.4, roughness: 0.93, vertexColors: true });
  for (let i = 0; i < 6; i++) { gMats.push(wallMat(facadeTile(300 + i, PL[(i + 3) % 6], SH_[i], true))); uMats.push(wallMat(facadeTile(400 + i, PL[i], SH_[(i + 1) % 6], false))); lists.ground.push([]); lists.upper.push([]); }
  const B = [], rr = rng(1973);
  const lotRow = (xA, xB, zIn, zOut, side, gaps) => { let x = xA; while (x < xB - 6) { const w = Math.min(xB - x, 12 + rr() * 9); if (gaps.some(([g0, g1]) => x < g1 && x + w > g0)) { x += 4; continue; } const d = 12 + rr() * 5; B.push({ x0: x, x1: x + w, z0: side < 0 ? zIn - d : zIn, z1: side < 0 ? zIn : zIn + d, fl: 2 + Math.floor(rr() * 5), v: Math.floor(rr() * 6), face: side < 0 ? [0, 1] : [0, -1] }); x += w + (rr() < 0.25 ? 5 : 0.2); } };
  // the avenue (Sharia el-Arbaeen) from the east entrance to the square
  lotRow(-36, 240, -11, 0, -1, [[96, 101], [158, 163]]); lotRow(-36, 240, 11, 0, 1, [[60, 65], [128, 133], [196, 201]]); const nAve = B.length;
  // around the square: north side (west of the cross street is our building), south side, west side
  B.push({ x0: -50, x1: -36, z0: -40, z1: -24, fl: 4, v: 1, face: [0, 1] }); B.push({ x0: -50, x1: -36, z0: 24, z1: 40, fl: 3, v: 2, face: [0, -1] }); B.push({ x0: -84, x1: -66, z0: 24, z1: 40, fl: 4, v: 3, face: [0, -1] });
  B.push({ x0: -98, x1: -82, z0: -24, z1: -9, fl: 3, v: 0, face: [1, 0] }); B.push({ x0: -98, x1: -82, z0: 9, z1: 24, fl: 5, v: 2, face: [1, 0] });
  // the cross street, north and south of the square
  for (const [z0, z1] of [[-100, -82], [-80, -60], [-58, -40], [40, 58], [60, 80], [82, 100]]) { B.push({ x0: -84, x1: -66, z0, z1, fl: 2 + Math.floor(rr() * 3), v: Math.floor(rr() * 4), face: [1, 0] }); B.push({ x0: -50, x1: -32, z0, z1, fl: 2 + Math.floor(rr() * 3), v: Math.floor(rr() * 4), face: [-1, 0] }); }
  // the rest of the city fills every block behind the streets, so no alley or gap looks out onto empty ground
  { const occ = (x0, x1, z0, z1) => B.some((b) => x0 < b.x1 + 2.5 && x1 > b.x0 - 2.5 && z0 < b.z1 + 2.5 && z1 > b.z0 - 2.5) || (x1 > -112 && x0 < 252 && z0 < 12 && z1 > -12) || (x1 > -100 && x0 < -30 && z0 < 42 && z1 > -42) || (x1 > -70 && x0 < -46 && z0 < 120 && z1 > -120) || (x1 > -88 && x0 < -60 && z0 < -18 && z1 > -44);
    for (let x = -262; x < 262; x += 24) for (let z = -262; z < 262; z += 24) { const w = 14 + rr() * 8, d = 14 + rr() * 8, x0 = x + rr() * 3, z0 = z + rr() * 3; if (occ(x0, x0 + w, z0, z0 + d)) continue; const fl = 2 + Math.floor(rr() * 4), v = Math.floor(rr() * 6), top = CHH + fl * FLH;
      lists.upper[v].push(aoBox(boxUV(LX(x0), LX(x0 + w), CHH - 0.3, top, LZ(z0), LZ(z0 + d), 7, FLH), CHH - 0.3, top, 0.66, 0.86)); lists.roof.push([boxUV(LX(x0) - 0.1, LX(x0 + w) + 0.1, top, top + 0.7, LZ(z0) - 0.1, LZ(z0 + d) + 0.1, 4, 1), 0xcfc3a8]);
      if (rr() < 0.5) lists.roof.push([new THREE.CylinderGeometry(0.7, 0.7, 1.3, 10).translate(LX(x0 + w * rr()), top + 1.2, LZ(z0 + d * rr())), 0x8b8a84]);
      addCollider(LX(x0 + w / 2), LZ(z0 + d / 2), w / 2, d / 2, 0, top + 0.7); SZ.blocks.push([LX(x0), LX(x0 + w), LZ(z0), LZ(z0 + d), top]); } }
  const D = { trim: [], rail: [], cloth: [], awn: [[], [], []] }, sv = rr;
  for (const b of B) { b.style = rr() < 0.3 ? 2 : rr() < 0.55 ? 1 : 0; cityBuilding(b, null, lists); decorate(b, D, rr, lists); }
  for (let i = 0; i < 6; i++) { if (lists.ground[i].length) { const m = new THREE.Mesh(mergeGeometries(lists.ground[i], false), gMats[i]); scene.add(SH(onLayer1(m))); } if (lists.upper[i].length) { const m = new THREE.Mesh(mergeGeometries(lists.upper[i], false), uMats[i]); scene.add(SH(onLayer1(m))); } }
  { const m = new THREE.Mesh(build(lists.roof), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9, map: TX.grime })); scene.add(SH(onLayer1(m))); }
  { const m = new THREE.Mesh(build(D.trim), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.88, map: TX.grime })); scene.add(SH(onLayer1(m))); }
  if (D.rail.length) { const rt = railTex(); const m = new THREE.Mesh(mergeGeometries(D.rail, false), new THREE.MeshStandardMaterial({ map: rt, alphaTest: 0.5, side: THREE.DoubleSide, color: 0x2e2c28, roughness: 0.6, metalness: 0.4 })); scene.add(SH(onLayer1(m))); }
  if (D.cloth.length) { const m = new THREE.Mesh(build(D.cloth), new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, roughness: 1, map: TX.fabric })); scene.add(SH(onLayer1(m))); }
  [['#2f6a4a', '#e9e2d0'], ['#9a2f26', '#ece4d4'], ['#2c4f7a', '#e6e0d0']].forEach(([a, c], i) => { if (!D.awn[i].length) return; const m = new THREE.Mesh(mergeGeometries(D.awn[i].map((g) => g.toNonIndexed()), false), new THREE.MeshStandardMaterial({ map: stripeTex(a, c), side: THREE.DoubleSide, roughness: 0.95 })); scene.add(SH(onLayer1(m))); });
  // where the defenders fight from: only the windows they have sandbagged (a ledge out from the wall with bags round its edge) and the roofs.
  // A man stands to fire over the bags or the parapet and crouches behind them to take cover - nobody ducks back into a wall
  szFortWindows(B, nAve);
  const BAGS = [], svBag = BATCH.bag; BATCH.bag = BAGS;
  buildCornerBuilding();
  // streets: asphalt for the avenue, the square and the cross street; kerbs and pavements
  const road = (x0, x1, z0, z1, y = 0.02) => { const g = new THREE.PlaneGeometry(x1 - x0, z1 - z0); g.rotateX(-Math.PI / 2); g.translate(LX((x0 + x1) / 2), CHH + y, LZ((z0 + z1) / 2)); const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * (x1 - x0) / 9, uv.getY(i) * (z1 - z0) / 9); colored(g, 0xffffff); const m = new THREE.Mesh(g, MAT.asphalt); m.receiveShadow = !LITE; scene.add(onLayer1(m)); };
  road(-36, 245, -8, 8); road(-84, -36, -24, 24); road(-66, -50, -105, -24); road(-66, -50, 24, 105); road(-110, -84, -8, 8);
  const kerb = []; const kb = (x0, x1, z0, z1) => kerb.push([boxUV(LX(x0), LX(x1), CHH, CHH + 0.16, LZ(z0), LZ(z1), 2, 2), 0xbdb6a6]);
  kb(-36, 245, -11, -8); kb(-36, 245, 8, 11); kb(-84, -66, -24, -22.5); kb(-50, -36, -24, -22.5); kb(-84, -66, 22.5, 24); kb(-50, -36, 22.5, 24); kb(-84, -82.5, -24, -8); kb(-84, -82.5, 8, 24);
  { const m = new THREE.Mesh(build(kerb), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, map: TX.grime })); m.receiveShadow = !LITE; scene.add(onLayer1(m)); }
  // the roundabout: a low wall, palms and a small monument
  { const ring = []; for (let a = 0; a < 6.28; a += 0.2) ring.push([LX(-58 + Math.cos(a) * 6), LZ(Math.sin(a) * 6)]); bagWall([...ring, ring[0]], 2, CHH, false);
    const mo = new THREE.Mesh(build([[G.box(1.6, 1.0, 1.6), 0xcfc4ac, M4(0, 0.5, 0)], [G.box(0.7, 5.2, 0.7), 0xd8cdb4, M4(0, 3.6, 0)], [G.cone(0.5, 1.0, 4), 0xc4b89c, M4(0, 6.7, 0, 0, Math.PI / 4, 0)]]), MAT.vc); mo.position.set(LX(-58), CHH, LZ(0)); scene.add(SH(onLayer1(mo))); addCollider(LX(-58), LZ(0), 0.8, 0.8, 0, CHH + 6); coverAround(-58, 0, 0.8, 0.8, 0, 1.6); }
  palms([[LX(-61), LZ(-3), 0.9, 1], [LX(-55), LZ(3), 1.0, 2], [LX(-60), LZ(4), 0.8, 4], ...[...Array(10)].map((_, i) => [LX(10 + i * 22), LZ(i % 2 ? 9.6 : -9.6), 0.85 + rr() * 0.3, rr() * 6])]);
  // vehicles, kiosks, rubble: the street is a battlefield and every wreck is cover
  const cars = [[118, -5.5, 0.12, 1], [64, -5, 3.0, 0], [30, -6, 0.3, 1], [-8, -5.5, 2.9, 0], [-45, 15, 1.4, 1], [-72, -14, 0.3, 1], [-52, -44, 0.15, 1], [-57, 45, 1.5, 0], [170, -6, 3.1, 1], [-40, -17, 2.7, 0], [-30, 19, 1.7, 1]];
  const cg = [CAR_GEO(false), CAR_GEO(true)];
  for (const [x, z, r, b] of cars) { addProp(cg[b], x, z, r, [0.95, 2.15], 1.4); coverAround(x, z, 0.95, 2.15, r, 1.3); }
  addProp(BUS_GEO, -92, 0, 0.15, [1.3, 5.3], 3.0); addProp(KIOSK_GEO, -42, -12, 0.4, [1.15, 0.95], 2.3); coverAround(-42, -12, 1.15, 0.95, 0.4, 2.2);
  addProp(KIOSK_GEO, 40, 9.8, Math.PI, [1.15, 0.95], 2.3);
  const rub = []; const pile = (x, z, n, s) => { for (let i = 0; i < n; i++) rub.push([new THREE.DodecahedronGeometry(0.3 + rr() * 0.5 * s, 0).translate(LX(x + (rr() - 0.5) * 3 * s), CHH + 0.2 * s, LZ(z + (rr() - 0.5) * 3 * s)), rr() < 0.5 ? 0xb9ad94 : 0x8d8473]); };
  for (const [x, z, n, s, cx, cz] of [[-58, -100, 30, 1.6, 9, 2], [-58, 100, 30, 1.6, 9, 2], [-100, 0, 18, 1.2, 1.5, 9], [99, -10, 8, 1, 2.5, 1.5], [160, 12, 8, 1, 2.5, 1.5], [62, 12.5, 8, 1, 2.5, 1.5]]) { pile(x, z, n, s); addCollider(LX(x), LZ(z), cx, cz, 0, CHH + 1.6); }
  { const m = new THREE.Mesh(build(rub), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, flatShading: true, map: TX.grime })); scene.add(SH(onLayer1(m))); }
  // sandbagged Egyptian positions on the corners
  for (const [x, z, r] of [[SZ_GUN[0], SZ_GUN[1], 2.32], [SZ_GUN[0], SZ_GUN[1], -2.25], [-80, 20, -0.6], [52, -10, 0.1], [-54.2, 27.4, 0], [-61.8, 27.4, 0], [-84, -30, -1.2]]) { const arc = []; for (let a = -70; a <= 70; a += 20) { const t = THREE.MathUtils.degToRad(a) + r; arc.push([LX(x) + Math.sin(t) * 1.6, LZ(z) - Math.cos(t) * 1.6]); } bagWall(arc, 4, CHH - 0.05); const k = COVER.length; for (let i = Math.max(0, k - 12); i < k; i++) if (!SZ.covers.includes(COVER[i])) { COVER[i].y = CHH; SZ.covers.push(COVER[i]); } }
  // lamp posts and power lines along the avenue, a minaret on the skyline, smoke over the city
  const lp = []; for (let x = -30; x < 240; x += 26) for (const s of [-1, 1]) lp.push([new THREE.CylinderGeometry(0.07, 0.1, 7, 6).translate(LX(x), CHH + 3.5, LZ(s * 9.4)), 0x4a4a46], [new THREE.BoxGeometry(0.1, 0.1, 1.6).translate(LX(x), CHH + 7, LZ(s * 8.7)), 0x4a4a46]);
  { const m = new THREE.Mesh(build(lp), MAT.vc); scene.add(SH(onLayer1(m))); }
  { const mi = new THREE.Mesh(build([[G.cyl(1.4, 1.7, 22, 10), 0xe6dccb, M4(0, 11, 0)], [G.cyl(2.1, 2.1, 0.5, 12), 0xd2c6b0, M4(0, 17, 0)], [G.cyl(1.0, 1.1, 6, 10), 0xe6dccb, M4(0, 25, 0)], [G.cone(1.1, 3, 10), 0x6b8a6a, M4(0, 29.5, 0)]]), MAT.vc); mi.position.set(LX(-160), CHH, LZ(-70)); scene.add(SH(onLayer1(mi)));
    const dome = new THREE.Mesh(new THREE.SphereGeometry(7, 20, 10, 0, 6.28, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xcfc3a6, roughness: 0.8 })); dome.position.set(LX(-175), CHH + 8, LZ(-82)); scene.add(dome);
    const base = new THREE.Mesh(new THREE.BoxGeometry(20, 8, 20), new THREE.MeshStandardMaterial({ color: 0xe0d4bc, roughness: 0.9, map: TX.grime })); base.position.set(LX(-175), CHH + 4, LZ(-82)); scene.add(base); }
  for (const [x, z, s, f] of [[-130, -160, 22, 1], [80, -120, 16, 0], [-60, 180, 18, 1], [210, 60, 14, 0]]) smokeColumn(LX(x), LZ(z), s, f);
  cityDressing(rr);
  BATCH.bag = svBag; if (BAGS.length) scene.add(bagMesh(BAGS));
  flag(LX(-90), LZ(-24.5), 'eg', 7, 0);
  tankModel();
  SZ.lead = addVeh({ mode: 'suez', side: 'f', kind: 'tank', geo: TANK_GEO, half: [3.4, 2.6, 1.9], guns: true, follow: { s: () => TANK.s + 30, lat: -4.5 } });
  // the M3 half-track of the paratroopers, parked behind the tank's final position
  { const ht = build([[G.box(2.2, 1.3, 5.8), 0x6b6a52, M4(0, 1.25, 0)], [G.box(2.0, 0.9, 1.6), 0x5d5c47, M4(0, 1.3, 3.3)], ...[-1, 1].map((s) => [G.box(0.5, 0.75, 3.4), 0x1e1d1a, M4(s * 0.95, 0.38, -1.0)]), ...[-1, 1].map((s) => [G.cyl(0.42, 0.42, 0.3, 12), 0x151515, M4(s * 0.95, 0.42, 3.4, 0, 0, Math.PI / 2)])]);
    SZ.ht = addProp(ht, -24, 13, Math.PI / 2 + 0.2, [1.1, 2.9], 2.2); SZ.ht.visible = false; coverAround(-24, 13, 1.1, 2.9, Math.PI / 2 + 0.2, 2.0); }
  // the rescue convoy of the last stage: a tank and two half-tracks, out of sight until they are called
  SZ.conv = [['tank', TANK_GEO, [3.4, 2.6, 1.9], 14, 'הטנק המוביל'], ['jeep', HT_GEO, [3.0, 2.2, 1.2], 22, 'הזחל״ם הראשון'], ['jeep', HT_GEO, [3.0, 2.2, 1.2], 22, 'הזחל״ם השני']].map(([kind, geo, half, rpgHit, name]) => { const v = addVeh({ mode: 'suez', side: 'f', kind, geo, half, guns: true, vmax: 8, rpgHit, name }); v.g.visible = false; return v; });
  for (let i = k0; i < scene.children.length; i++) if (!SZ.objs.includes(scene.children[i])) SZ.objs.push(scene.children[i]);
  SZ.cityCovers = SZ.covers; SZ.citySlots = SZ.slots; dimEnv(scene);
}

/* ---------- director ---------- */
const SZ_STAGES = [
  { title: 'הטור נכנס לעיר', sub: 'עשר וארבעים בבוקר. הטור נכנס לשדרה הראשית של סואץ, והעיר שקטה מדי. בחלונות ועל הגגות כבר מחכים צוותי הבזוקה — ולכם יש שנייה אחת לכל אחד מהם.', goal: 'תורידו את הבזוקות בחלונות ועל הגגות לפני שהן יורות. מקלע 0.5 (אש), תותח (רימון)' },
  { title: 'הצומת', sub: 'בצומת אל־ארבעין נסגר המארב: אש משני הצדדים, מכל הקומות. מי שמפרק אותו ראשון — מפרק את הטור, או ניצל ממנו.', goal: 'פרקו את המארב בצומת לפני שהוא מפרק את הטור' },
  { title: 'ברגל, ממחסה למחסה', sub: 'הטנק בוער. יוצאים ברגל אל הכיכר, מכונית שרופה אחרי מכונית שרופה, אל האנדרטה שבמרכזה. הצנחנים צמודים אליכם, ודרום הכיכר צריך להיות נקי.', goal: 'ממחסה למחסה עד האנדרטה, ונקו את דרום הכיכר' },
  { title: 'התותח בפתח הרחוב', sub: 'מהאנדרטה ממשיכים מערבה ואז צפונה, לאורך הצד המערבי של הכיכר. מהרחוב המערבי יורים עליכם, ובפתח הרחוב הצפוני חפור תותח נ״ט. בסוף הדרך עומד בניין הפינה. זה הבית שבו נחזיק.', goal: 'נקו את פתח הרחוב המערבי, חסלו את צוות התותח, ופרצו לבניין הפינה' },
  { title: 'קומה אחרי קומה', sub: 'בניין מגורים שהמצרים הפכו למעוז: בית קפה בקומת הקרקע, דירה של משפחה מעליו, וחמ״ל בקומה השנייה. רימון, פריצה, הבא — עד הגג.', goal: 'חדר אחרי חדר, רימון לפני כל דלת, עד הגג' },
  { title: 'התאג״ד', sub: 'הבניין בידינו, והפצועים שוכבים על מזרנים בחדר הפנימי של הקומה הראשונה. זה התאג״ד שלנו עכשיו. המצרים יעלו במדרגות ישר אליו, ושיירת החילוץ עוד רחוקה.', goal: 'שמרו על דלת התאג״ד: שום מצרי לא מגיע לפצועים עד שהשיירה כאן' },
  { title: 'השיירה', sub: 'מהשדרה נשמעים השרשראות: טנק ושני זחל״מים נכנסים לכיכר. מהחלונות שמסביב כבר יורים עליהם בבזוקות. אם השיירה לא מגיעה לדלת, אף פצוע לא יוצא מכאן.', goal: 'חסלו את הבזוקות בחלונות שמסביב לכיכר, ואז מעמיסים את הפצועים' },
];
const SZ_START = [null, null, [-41, 10, 229], [-59.5, 10.5, 293], [-76.3, -21.6, 0], [-75.5, -27.0, 180], [-75.5, -27.0, 180]];
/* the straw through the junction: from the burning tank south-west to the wrecks, west to the monument, on west to the mouth of the west street, then
   north along the west side to the door of the corner building. The route only turns, it never doubles back, and each bound has one front ahead */
const SZ_LANE2 = [[-30, 5.5], [-48, 16], [-59, 9.5]], SZ_LANE3 = [[-48, 13], [-59, 9], [-72, 5], [-73, -9], [-75.6, -25.2]], SZ_LANE_HW = 11;
const szWinIn = (s, x0, x1, nx, nz, z0 = -1e9, z1 = 1e9) => { const lx = s.x - CITY.cx, lz = s.z - CITY.cz; return s.nx === nx && s.nz === nz && lx >= x0 && lx <= x1 && lz >= z0 && lz <= z1; };
/* the windows of a bound: men in the sandbagged windows in front of it, counted with the bound */
function szGateWin(filter, tag, nRpg, nRifle) { for (let i = 0; i < nRpg + nRifle; i++) { const e = szSpawnSlot(i < nRpg ? 'rpg' : 'rifle', filter); if (e) { e.sq = tag; e.cyc = rand(0.3, 1.6); } } }
const SZ_CONV_PATH = [[180, 4], [-20, 4], [-34, -4], [-48, -8], [-62, -16], [-70, -19.5], [-82, -20]];
const SZ_STREET = {
  a1: [[160.5, -26, [[160.5, -12], [166, -7.5]]], [161, -28, [[160.5, -12], [155, -8]]], [130.5, 26, [[130.5, 12], [136, 9.5]], 'rpg', 1.5], [131, 28, [[130.5, 12], [126, 9.5]], 'rifle', 2]],
  a2: [[98.5, -26, [[98.5, -12], [94, -8.5]]], [99, -28, [[98.5, -12], [101, -8]], 'rpg', 1], [62.5, 26, [[62.5, 12], [66, 9.5]]], [63, 28, [[62.5, 12], [58, 9.6]], 'rifle', 1.5], [64, 30, [[62.5, 12], [70, 9.6]], 'rifle', 2.5]],
  a3: [[16, -9.8, [[13, -6.5]]], [20, -10, [[11, -4.5]]], [8, -9.6, [[7, -4]], 'rpg'], [4, 9.8, [[4, 9.6]]], [-2, 9.8, [[-2, 9.6]], 'rifle'], [-8, -9.8, [[-6, -7.5]]]],
  j: [[-58, -62, [[-58, -30], [-52, -20]]], [-60, -64, [[-60, -30], [-66, -18]], 'rpg', 1], [-56, -66, [[-56, -30], [-46, -19]], 'rifle', 2], [-58, 62, [[-58, 30], [-50, 17]]], [-60, 64, [[-60, 30], [-66, 18]], 'rifle', 1.5], [-86, -3, [[-85, -2]]], [-86, 3, [[-85, 2.5]], 'rpg']],
};
const SZ_FRIENDS = [['אבנר', [-30, 5]], ['יגאל', [-38, 15.5]], ['מוטקה', [-46, 18]], ['אורי', [-28, 16]], ['ציון', [-33, 9]], ['רמי', [-41, 13]], ['שאול', [-50.5, 6]], ['גדי', [-36, -3]], ['חיים', [-48.5, 8]], ['אלי', [-38, -1.5]]];
const SZ_POST4 = [[-70.5, -20.6, 0, -1], [-46.5, -18.5, -0.6, -0.8], [-68.4, -20.4, 0, -1], [-48.6, -18.2, -0.6, -0.8]], SZ_NF = 6;
function szSpawnSlot(kind, filter) {
  const c = SZ.slots.filter((s) => !s.used && filter(s)); if (!c.length) return null;
  const s = c[Math.floor(Math.random() * c.length)]; const e = spawnEnemy(s.h[0], s.h[1], kind, null, null); if (!e) return null;
  s.used = true; e.sz = 'win'; e.slot = s; e.state = 'sz'; e.pos.set(s.h[0], s.y, s.h[1]); e.cyc = rand(0.5, 2.5); e.peek = false; e.aimT = 0; e.rpgAim = 0; e.rpgCd = rand(7, 13); e.heading = Math.atan2(s.nx, s.nz); e.sync(); return e;
}
function szSpawnRoom(f, x, z) { const e = spawnEnemy(LX(x), LZ(z), Math.random() < 0.15 ? 'rpg' : Math.random() < 0.5 ? 'smg' : 'rifle', null, null); if (!e) return null; e.pos.y = CHH + f * FLH; e.sz = 'room'; e.state = 'sz'; e.floor = f; e.cov = null; e.patience = 0; e.cyc = rand(0.5, 1.5); e.peek = false; e.meleeCd = 0.5; return e; }
function szSpawnStreet(x, z, path, kind = 'rifle', climb = false) { const e = spawnEnemy(LX(x), LZ(z), varyKind(kind, x, z), null, null); if (!e) return null; e.sz = 'street'; e.state = 'sz'; e.path = path.map(([a, b]) => [LX(a), LZ(b)]); e.pi = 0; e.cov = null; e.patience = 0; e.climb = climb; e.cyc = 1; e.peek = false; e.meleeCd = 0.5; e.rpgCd = rand(7, 13); return e; }
function szAmbush(xMin, xMax, nRpg, nRifle, sides = [1, -1]) {
  const f = (s) => { const lx = s.x - CITY.cx; return lx > xMin && lx < xMax && (sides.includes(Math.sign(s.nz)) || s.nz === 0) && Math.abs(s.z - CITY.cz) < 45; };
  for (let i = 0; i < nRpg; i++) szSpawnSlot('rpg', f); for (let i = 0; i < nRifle; i++) szSpawnSlot('rifle', f);
}
function szAlive(pred = () => true) { let n = 0; for (const e of UNITS.enemies) if (e.alive && e.sz && pred(e)) n++; return n; }
function szSetFriends(stage) {
  // friends 0-5 follow the player through the square and into the building; 6-9 give covering fire from the street
  if (SZ.fresh || stage === 2 || stage === 5) resetTrail();
  const fw = [-Math.sin(P.yaw), -Math.cos(P.yaw)];
  FRIENDS.forEach((f, i) => {
    const u = f.unit; if (i >= SZ_FRIENDS.length || stage < 2) { if (stage >= 5 && i >= 10 && i <= 15) return; f.state = 'bunker'; u.rig.root.visible = false; u.tag.visible = false; f.marker.visible = false; return; }
    const follow = i < SZ_NF && stage <= 4;
    if (!SZ.fresh && (['wounded', 'stable', 'saved', 'kia', 'carried'].includes(f.state) || (follow && f.state === 'follow'))) return;
    const [name, [x, z]] = SZ_FRIENDS[i]; f.name = name; let px = LX(x), pz = LZ(z), py; let fx = -1, fz = -0.4;
    if (stage >= 5 && i < 6) { const spots = [[-80.5, -24.7, 1, 0, 1], [-71.0, -24.7, 1, 0, 1], [-66.7, -27.2, 2, 1, 0], [-70.0, -36.4, 2, 0, -1], [-68.3, -24.7, 2, 0, 1], [-81.3, -26.8, 1, -1, 0]]; const sp = spots[i]; px = LX(sp[0]); pz = LZ(sp[1]); py = CHH + sp[2] * FLH; fx = sp[3]; fz = sp[4]; }
    else if (follow) { const back = 2.2 + i * 1.4, side = i % 2 ? 0.9 : -0.9; px = P.pos.x - fw[0] * back - fw[1] * side; pz = P.pos.z - fw[1] * back + fw[0] * side; py = P.pos.y; if (blocked(px, pz, 0.35, py)) { px = P.pos.x - fw[0] * 1.2; pz = P.pos.z - fw[1] * 1.2; } fx = fw[0]; fz = fw[1]; }
    else if (stage >= 4) { const sp = SZ_POST4[(i - SZ_NF) % 4]; px = LX(sp[0]); pz = LZ(sp[1]); fx = sp[2]; fz = sp[3]; }
    u.rig.gun.visible = true; f.post = { id: 'SZ' + i, name: 'צנחנים', x: px, z: pz, fx, fz, mag: null, occupant: f, stand: [px, pz] }; f.state = follow ? 'follow' : 'post'; f.fi = i; f.ti = 0; f.stuck = 0; f.bleed = 0; f.target = null; f.marker.visible = false;
    u.alive = true; u.fall = -1; u.stance = 'stand'; u.place(px, pz, py === undefined ? undefined : py + 0.2); u.heading = Math.atan2(fx, fz); u.rig.root.visible = true; u.sync();
  });
}
// the followers walk the player's own footsteps (a breadcrumb trail), so they take the same doors and stairs
function szOnScreen(x, y, z) { const v = V3(x, y, z).project(camera); if (v.z > 1 || Math.abs(v.x) > 1.15 || Math.abs(v.y) > 1.15) return false; const c = camera.position; return losW(c.x, c.y, c.z, x, y, z); }
/* the squad fights beside the player, not in a file behind him: each man has a slot in a loose line abreast of the direction of advance
   (ahead of him and out to the sides) and runs for it straight when the way is clear, or along the player's own footsteps (doors, stairs)
   when it is not. In his slot he stands and fights; he only shifts when the player has moved on. */
const FSLOTS = [[-3.6, 2.2], [3.6, 2.2], [-7.0, 1.0], [7.0, 1.0], [-10.2, -0.6], [10.2, -0.6], [-5.2, -3.2], [5.2, -3.2], [-8.6, -4.6], [8.6, -4.6], [0, -4.4], [-12.6, -2.4], [12.6, -2.4]];
function fSlotOf(f) {
  if (colMode()) return colSlot(f);
  const s = FSLOTS[f.fi % FSLOTS.length], inside = inTB(P.pos.x, P.pos.z, 1);
  // inside the building the line closes up tight round the player; in the field it closes up rather than step out of the lane
  const d = SZ.fdir ?? P.yaw + Math.PI, fx = Math.sin(d), fz = Math.cos(d), rx = Math.cos(d), rz = -Math.sin(d);
  for (const k of inside ? [0.3, 0.18] : [1, 0.6, 0.3, 0.15]) { const x = P.pos.x + fx * s[1] * k + rx * s[0] * k, z = P.pos.z + fz * s[1] * k + rz * s[0] * k; if (groundAt(x, z) > -0.3 && !blocked(x, z, 0.35, P.pos.y) && Math.abs(hAt(x, z, P.pos.y) - P.pos.y) < 1.6 && laneBad(x, z) <= 0) return [x, z]; }
  const b = 1.6 + (f.fi % 4) * 0.9; return [P.pos.x - fx * b, P.pos.z - fz * b];
}
/* in a trench (a lane only a few metres wide) the squad fights in a column: each man walks the player's own footsteps a couple of metres behind
   the one ahead of him, staggered from side to side where the trench is wide enough, so the file never leaves the trench or climbs its walls */
const colMode = () => FIELDM() && MODE !== 'suez' && !!LANE.pts && LANE.hw <= 7;
function colRank(f) { if (SZ.colT !== GAME.t) { SZ.colT = GAME.t; SZ.colR = new Map(); FRIENDS.filter((o) => o.state === 'follow').sort((a, b) => a.fi - b.fi).forEach((o, i) => SZ.colR.set(o, i)); } return SZ.colR.get(f) ?? f.fi; }
function colSlot(f) {
  const r = colRank(f), want = 2.3 + r * 2.1, tr = SZ.trail || [], lat = (r % 2 ? 1 : -1) * Math.min(0.75, LANE.hw * 0.3);
  let acc = 0, px = P.pos.x, pz = P.pos.z;
  for (let i = tr.length - 1; i >= 0; i--) {
    const w = tr[i], L = Math.hypot(w[0] - px, w[1] - pz);
    if (acc + L >= want && L > 1e-3) { const t = (want - acc) / L, x = lerp(px, w[0], t), z = lerp(pz, w[1], t), dx = px - w[0], dz = pz - w[1], ox = x - dz / L * lat, oz = z + dx / L * lat;
      if (!blocked(ox, oz, 0.35, w[2]) && Math.abs(hAt(ox, oz, w[2]) - w[2]) < 0.6 && laneBad(ox, oz) <= 0) return [ox, oz]; return [x, z]; }
    acc += L; px = w[0]; pz = w[1];
  }
  // the player has not walked that far yet: behind him along the way he is going, or his first footstep
  const d = SZ.fdir ?? P.yaw + Math.PI, bx = P.pos.x - Math.sin(d) * want, bz = P.pos.z - Math.cos(d) * want;
  if (!blocked(bx, bz, 0.35, P.pos.y) && Math.abs(hAt(bx, bz, P.pos.y) - P.pos.y) < 1.0 && laneBad(bx, bz) <= 0) return [bx, bz];
  return tr.length ? [tr[0][0], tr[0][1]] : [P.pos.x - Math.sin(d) * 1.6, P.pos.z - Math.cos(d) * 1.6];
}
function clearRun(ax, az, bx, bz, y) { const L = Math.hypot(bx - ax, bz - az), n = Math.ceil(L / 0.9); let yy = y; for (let i = 1; i <= n; i++) { const t = i / n, x = ax + (bx - ax) * t, z = az + (bz - az) * t; if (blocked(x, z, 0.3, yy)) return false; const h = hAt(x, z, yy); if (Math.abs(h - yy) > 1.3) return false; yy = h; } return true; }
/* a man following the player never steps out of the lane of the moment (steer refuses the step), and the column closes up like the inside of a building */
function szFollow(f, dt) { const u = f.unit; u.laneLock = FIELDM() && !!LANE.pts && !CINE.on; const r = szFollow0(f, dt); u.laneLock = false; return r; }
function szFollow0(f, dt) {
  const u = f.unit, tr = SZ.trail; if (!tr || !tr.length) return false;
  const dP = Math.hypot(P.pos.x - u.pos.x, P.pos.z - u.pos.z) + Math.abs(P.pos.y - u.pos.y) * 2, goal = SZ.trailN - 1;
  if (f.ti < SZ.trailBase) f.ti = SZ.trailBase;
  // far behind or stuck: he catches up off screen along the trail
  if ((dP > 34 || f.stuck > 1.5) && goal >= SZ.trailBase) { const w = tr[Math.max(SZ.trailBase, goal - 4) - SZ.trailBase]; if (!szOnScreen(w[0], w[2] + 1, w[1]) && !szOnScreen(u.pos.x, u.pos.y + 1, u.pos.z)) { u.place(w[0], w[1], w[2] + 0.2); f.ti = goal; f.stuck = 0; f.prog = null; } }
  const [sx, sz] = fSlotOf(f), ds = Math.hypot(sx - u.pos.x, sz - u.pos.z), dPl = Math.hypot(P.pos.x - u.pos.x, P.pos.z - u.pos.z);
  const sameF = Math.abs(P.pos.y - u.pos.y) < 1.6, col = colMode(), indoor = inTB(P.pos.x, P.pos.z, 1) || inTB(u.pos.x, u.pos.z, 1), tight = indoor || col;
  f.seeT = (f.seeT || 0) - dt; if (f.seeT <= 0) { f.seeT = 0.3; f.seeP = sameF && losW(u.pos.x, u.pos.y + 1.5, u.pos.z, P.pos.x, P.pos.y + 1.5, P.pos.z); }
  // nobody stands on the player: a man closer than two metres steps away first
  if (dPl < 2.0 && !CINE.on) { const ax = (u.pos.x - P.pos.x) / (dPl || 1), az = (u.pos.z - P.pos.z) / (dPl || 1); steer(u, u.pos.x + ax * 2.5, u.pos.z + az * 2.5, 3.2, dt); u.anim += dt * 7; u.stance = 'stand'; u.rig.pose('walk', u.anim); f.moving = true; f.holdP = null; return true; }
  const settle = () => { f.moving = false; f.prog = null; const d = SZ.fdir ?? P.yaw + Math.PI; f.post.fx = Math.sin(d); f.post.fz = Math.cos(d); u.heading = d; f.scanCd = 0; f.holdP = [P.pos.x, P.pos.z]; f.post.stand = [u.pos.x, u.pos.z]; return false; };
  // a man who got wedged (a doorway, a table, a friend in the way) takes the spot he is on and fights from it; he tries again when the player has walked on
  if (f.wedged) { if (Math.hypot(P.pos.x - f.wedged[0], P.pos.z - f.wedged[1]) > 4 || !sameF || GAME.t > f.wedged[2]) { f.wedged = null; f.stuck = 0; } else { f.post.stand = [u.pos.x, u.pos.z]; return false; } }
  // a man in position stays in it and fights: looking round does not move the squad, only the player walking on does
  if (!f.moving) {
    const pm = f.holdP ? Math.hypot(P.pos.x - f.holdP[0], P.pos.z - f.holdP[1]) : 99;
    if (ds < 1.0 || (pm < (tight ? 3.5 : 5.5) && sameF && dPl < (col ? 22 : indoor ? 9 : 16))) { f.stuck = 0; if (!f.holdP) return settle(); f.post.stand = [u.pos.x, u.pos.z]; return false; }
  }
  // on the move he stops at his slot, or indoors as soon as he is beside the player and can see him (in a column only at his place in the file)
  if (f.moving && (ds < 1.0 || (indoor && !col && sameF && dPl < 3.6 && f.seeP) || (!tight && ds < 1.8 && dPl < 14))) { f.stuck = 0; return settle(); }
  const x0 = u.pos.x, z0 = u.pos.z; if (!f.moving) f.prog = null; f.moving = true; f.holdP = null;
  f.dirT = (f.dirT || 0) - dt; if (f.dirT <= 0 || f.dirOk === undefined) { f.dirT = 0.35; f.dirOk = dP < 26 && sameF && clearRun(u.pos.x, u.pos.z, sx, sz, u.pos.y);
    // off the direct line he takes the furthest footstep of the player's that he can run to in a straight line (never through a wall)
    if (!f.dirOk) for (let i = goal; i >= Math.max(SZ.trailBase, f.ti - 10); i--) { const w = tr[i - SZ.trailBase]; if (w && Math.abs(w[2] - u.pos.y) < 1.0 && clearRun(u.pos.x, u.pos.z, w[0], w[1], u.pos.y)) { f.ti = i; break; } } }
  // he runs hard when he has fallen behind his slot, and jogs the last metres; on the trail he keeps to his own side of it, so the squad never files (indoors he keeps to the trail itself: the doors)
  if (f.dirOk) { steer(u, sx, sz, ds > 3 ? 6.4 : 4.4, dt); f.ti = Math.max(f.ti, goal - 2); }
  else { const w = tr[Math.min(f.ti, goal) - SZ.trailBase]; if (!w) return false; const d = SZ.fdir ?? P.yaw + Math.PI, lat = col || inTB(u.pos.x, u.pos.z, 2) || inTB(w[0], w[1], 2) ? 0 : FSLOTS[f.fi % FSLOTS.length][0] * 0.45; if (steer(u, w[0] + Math.cos(d) * lat, w[1] - Math.sin(d) * lat, dP > 9 ? 6.4 : 4.4, dt) < 1.2) f.ti = Math.min(f.ti + 1, goal); }
  const mv = Math.hypot(u.pos.x - x0, u.pos.z - z0); f.stuck = mv < dt * 0.8 ? f.stuck + dt : Math.max(0, f.stuck - dt * 2);
  // no running on the spot: a man who has not got anywhere in two seconds (blocked, or circling a slot he cannot reach) stops where he is and fights from there
  if (!f.prog || Math.hypot(u.pos.x - f.prog[0], u.pos.z - f.prog[1]) > 1.5) f.prog = [u.pos.x, u.pos.z, GAME.t];
  else if (GAME.t - f.prog[2] > 2.0 && sameF && dPl < 12) { f.wedged = [P.pos.x, P.pos.z, GAME.t + 5]; return settle(); }
  if (f.stuck > 0.5 && szOnScreen(u.pos.x, u.pos.y + 1, u.pos.z) && sameF && dPl < 12) { f.wedged = [P.pos.x, P.pos.z, GAME.t + 4]; return settle(); }
  u.stance = 'stand'; if (f.stuck > 0.35) u.rig.pose('idle', u.anim); else { u.anim += dt * 9; u.rig.pose('run', u.anim); } f.post.stand = [u.pos.x, u.pos.z]; return true;
}
function szSquad(list, tag, gate) {
  // every man on the list leads a fire team: a runner brings two more behind him, a man in position has a second beside him
  list.forEach(([x, z, path, kind, delay], li) => {
    const n = path.length > 1 || delay ? 3 : li % 2 ? 2 : 1;
    for (let j = 0; j < n; j++) { const ox = j ? rand(-1.6, 1.6) : 0, oz = j ? rand(-1.6, 1.6) : 0, go = () => { const e = szSpawnStreet(x + ox, z + oz, j ? path.map(([a, b]) => [a + ox * 0.6, b + oz * 0.6]) : path, j && kind === 'rpg' ? 'rifle' : kind || 'rifle'); if (e) e.sq = tag; }; const dl = (delay || 0) + j * 0.7; if (dl) DIRQ.push({ at: GAME.t + dl, spawn: true, gate, fn: go }); else go(); }
  });
}
function szStage(i, restore = false) {
  SZ.stage = i; SZ.t = 0; SZ.cp = i; SZ.msgs = {}; CP.scene = i; CP.stats = { ...STATS }; GATE.on = false; snapRequest('stage');
  const S = SZ_STAGES[i]; toast(`שלב ${i + 1} מתוך ${SZ_STAGES.length} · ${S.title}`, S.sub); feed(`שלב ${i + 1}: ${S.title}`);
  if (i >= 2) { P.reserve = Math.max(P.reserve, 160); P.gren = Math.max(P.gren, diff.gren0); }
  szSetFriends(i); SZ.fresh = false; if (SZ.ht) SZ.ht.visible = i >= 2;
  if (i === 0) { radio('מג״ד', 'כל התחנות, כאן מג״ד. נכנסים לסואץ בטור. מפקדי טנקים, ראש בחוץ, עיניים לחלונות.', 5); TANK.stops = [80, 150, 210]; TANK.stopI = 0; TANK.holdAt = null; SZ.stopT = 0; }
  if (i === 1) { radio('מג״ד', 'הצומת לפניכם. כל מה שזז בחלונות, אש!', 3.5); SZ.junction = false; }
  if (i === 2) {
    // on foot only the bound in front fights: whatever was left of the ambush on the tank goes while the crew bails out (the screen is black then)
    for (const e of UNITS.enemies) if (e.alive && e.sz) { e.alive = false; e.rig.root.visible = false; e.tag.visible = false; if (e.slot) { e.slot.used = false; e.slot = null; } }
    for (let k = DIRQ.length - 1; k >= 0; k--) if (DIRQ[k].spawn) DIRQ.splice(k, 1);
    // the straw, first half: from the burning tank to the wrecks on the south side (front: south), then west to the monument (front: west).
    // Each bound's men stand in front of it - in positions, behind wrecks, in the sandbagged windows ahead - and the next opens only when it is clear
    const segs = [
      [[-54.2, 27.4, [[-54.2, 27.4]]], [-61.8, 27.4, [[-61.8, 27.4]], 'rpg'], [-50.8, 25.8, [[-50.8, 25.8]]], [-65, 36, [[-65, 29], [-60, 25.5]], 'rifle', 3], [-65, 38, [[-65, 29], [-55.5, 25]], 'rifle', 5.5], [-65, 40, [[-65, 29], [-63, 22]], 'rpg', 8]],
      [[-78, 19, [[-77, 18]]], [-81, 13, [[-80, 12.5]]], [-69, 19.5, [[-68.5, 19.5]], 'rpg'], [-66.5, 4, [[-66.5, 4]]], [-90, 7.4, [[-84, 7.4], [-79, 8.5]], 'rifle', 2], [-90, -7.4, [[-84, -7.4], [-79, -4]], 'rifle', 3.5], [-90, 7.6, [[-84, 7.6], [-80, 11]], 'rifle', 6]],
    ];
    const W = [(s) => szWinIn(s, -50, -36, 0, -1, 23, 25), (s) => szWinIn(s, -84, -66, 0, -1, 23, 25) || szWinIn(s, -83, -81, 1, 0, 9, 24)];
    gateStart([[P.pos.x, P.pos.z], [LX(-48), LZ(16)], [LX(-59), LZ(9.5)]], (k) => { szSquad(segs[k], 'g' + k, k); szGateWin(W[k], 'g' + k, 1, 2); }, () => { feed('דרום הכיכר נקי', 'good'); szStage(3); }, 'מחסה', 6.5, [SZ_LANE_HW, SZ_LANE2.map(([x, z]) => [LX(x), LZ(z)]), 3]);
    hint('sz-gate', 'מתקדמים <b>ממחסה למחסה</b> בציר אחד: חסלו את המצרים מול המחסה הבא (העמדות המומלצות מסומנות בירוק), ואז הוא יסומן ב־◆. הצנחנים צמודים אליכם.', 8);
    radio('מ״פ צנחנים', 'אבנר, יגאל, מוטקה, אורי, אחריי! קודם להריסות בדרום, משם לאנדרטה. אש על העמדות מול האוטובוס!', 4.5);
  }
  if (i === 3) {
    // the straw, second half: west to the mouth of the west street (front: west), north past the burnt car to the gun pit (front: north), and the
    // counterattack down the north street while the player makes for the door (front: north)
    const [gx, gz] = SZ_GUN;
    const segs = [
      [[-86, 3, [[-85.6, 2.5]], 'rpg'], [-86, -3, [[-85.6, -2]]], [-86.5, 0, [[-86.2, 0.2]]], [-96, 7.4, [[-90, 7.4], [-84, 7.6], [-79, 9]], 'rifle', 2], [-96, -7.4, [[-90, -7.4], [-84, -7.4], [-78, -6]], 'rifle', 4]],
      [[-72, -16.8, [[-72, -16.8]]], [-79.5, -19.5, [[-79.5, -19.5]]], [gx - 0.9, gz - 1.6, [[gx - 0.9, gz - 1.6]]], [gx - 1.7, gz - 0.8, [[gx - 1.7, gz - 0.8]], 'rpg'], [gx + 0.8, gz - 1.3, [[gx + 0.8, gz - 1.3]]], [-60, -70, [[-61, -40], [-63, -26]], 'rifle', 3]],
      [[-74.5, -18, [[-74.5, -18]]], [-58, -84, [[-58, -50], [-60, -32], [-62, -24]], 'rifle', 1.5], [-60, -86, [[-60, -50], [-63, -30], [-68, -23]], 'rpg', 3], [-56, -88, [[-56, -50], [-57, -30], [-60, -23]], 'rifle', 5]],
    ];
    const W = [(s) => szWinIn(s, -83, -81, 1, 0, -24, -9) || szWinIn(s, -83, -81, 1, 0, 9, 24), (s) => szWinIn(s, -50, -36, 0, 1, -25, -23), (s) => szWinIn(s, -67, -65, 1, 0, -60, -40) || szWinIn(s, -51, -49, -1, 0, -60, -40)];
    gateStart([[P.pos.x, P.pos.z], [LX(-72), LZ(5)], [LX(-73), LZ(-9)], [LX(-74), LZ(-21)]], (k) => { szSquad(segs[k], 'g' + k, k); szGateWin(W[k], 'g' + k, k === 2 ? 0 : 1, 2); },
      () => { LANE.s1 = 1e9; feed('הכיכר נקייה', 'good'); radio('מ״פ צנחנים', 'נקי! כולם לבניין הפינה, נכנסים!', 3); }, 'מחסה', 6.5, [SZ_LANE_HW, SZ_LANE3.map(([x, z]) => [LX(x), LZ(z)]), 3]);
    radio('מ״פ צנחנים', 'ממשיכים מערבה ואז צפונה, לאורך הקיר המערבי. יש להם תותח נגד־טנקים בבור בפתח הרחוב הצפוני. שאול, גדי, חפו עלינו!', 5);
  }
  if (i < 2 || i >= 4) laneOff();   // the straw runs through the square only; the tank and the building have walls of their own
  if (i === 4) { for (const [f, x, z] of [[0, -79.5, -27.5], [0, -76.5, -34.2], [0, -70.3, -35.2], [0, -67.6, -28.3], [1, -75.5, -31.4], [1, -69.6, -32.0], [1, -78.6, -26.4], [1, -70.6, -26.9], [2, -76.5, -31.6], [2, -76.4, -35.6], [2, -68.6, -34.3], [2, -75.6, -26.6], [2, -68.6, -26.2], [3, -72.0, -27.2], [3, -68.2, -33.0], [3, -75.8, -33.4]]) szSpawnRoom(f, x, z); radio('צנחנים', 'נכנסים איתך! אתה ראשון, אנחנו צמודים מאחור. רימון לכל חדר.', 4.5); }
  if (i >= 5) szAidSetup();
  if (i === 5) { SZ.wave = 0; SZ.holdT = 150; SZ.nextWave = 3; radio('מ״פ צנחנים', 'הבניין בידינו. הפצועים בחדר הפנימי בקומה הראשונה - זה התאג״ד שלנו עכשיו. שיירת חילוץ בדרך אלינו. מחזיקים עד שהיא כאן, ואף מצרי לא עולה במדרגות.', 6); }
  if (i === 6) { szConvStart(); radio('שיירה', 'כאן שיירת החילוץ. נכנסים לשדרה הראשית מהמזרח, שני זחל״מים וטנק. עוד שתי דקות אצלכם - תכינו את הפצועים.', 5); DIRQ.push({ at: GAME.t + 5.5, fn: () => radio('מ״פ צנחנים', 'כולם לחלונות שפונים לכיכר, או לגג! כשהשיירה תיכנס לכיכר הבזוקות מסביב יפתחו עליה - אנחנו מכסים אותה מלמעלה.', 5) }); }
}
/* the aid post: five wounded on the mattresses and the medic on his feet. Set once when the building is taken, and again from a checkpoint */
function szAidSetup() {
  if (SZ.aidG) SZ.aidG.visible = true;
  SZ_WOUNDED.forEach(([name, x, z], i) => { const f = FRIENDS[10 + i], u = f.unit; if (!SZ.fresh && f.aid && f.state !== 'bunker') return;
    f.name = name; f.aid = true; f.aidDead = false; f.bed = null; f.post = null; f.target = null; f.bleed = 0; f.marker.visible = false; f.state = 'saved';
    u.alive = true; u.fall = 1; u.stance = 'down'; u.place(LX(x), LZ(z), CHH + FLH + 0.2); u.heading = -Math.PI / 2; u.rig.root.visible = true; u.rig.gun.visible = false; u.rig.pose('prone', 0); u.sync(); });
  { const f = FRIENDS[15], u = f.unit, [name, x, z] = SZ_MEDIC; if (SZ.fresh || f.state === 'bunker' || !f.aid) {
    const px = LX(x), pz = LZ(z), fx = -0.25, fz = -0.97; f.name = name; f.aid = true; f.post = { id: 'SZmed', name: 'תאג״ד', x: px, z: pz, fx, fz, mag: null, occupant: f, stand: [px, pz] };
    f.state = 'post'; f.fi = 15; f.bleed = 0; f.target = null; f.marker.visible = false; u.alive = true; u.fall = -1; u.stance = 'stand'; u.place(px, pz, CHH + FLH + 0.2); u.heading = Math.atan2(fx, fz); u.rig.root.visible = true; u.sync(); } }
  SZ.raidT = 0; SZ.raidWarn = false; SZ.inMsg = false;
}
const szWoundedLeft = () => FRIENDS.slice(10, 15).filter((f) => f.aid && f.state === 'saved').length;
/* a raider in the aid post shoots one of the wounded every few seconds, until the player gets to him */
function szShootWounded(e) {
  const alive = FRIENDS.slice(10, 15).filter((f) => f.aid && f.state === 'saved'); if (!alive.length) return;
  const f = pick(alive), u = f.unit; f.state = 'kia'; f.aidDead = true; u.alive = false; STATS.kia++;
  if (e) { e.face(u.pos.x, u.pos.z); const from = e.muzzle(); fxMuzzle(from, false); sndShot('ak', from); fxTracer(from, u.chest(), true); }
  feed(`${f.name} נורה בתאג״ד!`, 'bad'); radio('החובש', pick(['הם יורים בפצועים! תעזרו לנו!', 'הם בתוך התאג״ד! מהר!']), 2.6);
  if (!szWoundedLeft()) endGame(false, 'aid');
}
function szRaidUpd(dt) {
  const inB = szAlive((e) => e.raid && inTB(e.pos.x, e.pos.z, 0.3));
  if (inB && !SZ.inMsg) { SZ.inMsg = true; radio('צנחנים', pick(['הם בתוך הבניין! חדר המדרגות!', 'מצרים בקומת הקרקע, הם עולים!']), 2.8); } else if (!inB) SZ.inMsg = false;
  let raider = null; for (const e of UNITS.enemies) if (e.alive && e.raid && Math.abs(e.pos.y - (CHH + FLH)) < 1.6 && szInAid(e.pos.x, e.pos.z)) { raider = e; break; }
  if (!raider) { SZ.raidT = Math.min(SZ.raidT, 1.5); SZ.raidWarn = false; return; }
  SZ.raidT += dt; if (SZ.raidT > 0.6 && !SZ.raidWarn) { SZ.raidWarn = true; radio('החובש', 'הם בתאג״ד!! הם בפתח!', 2.2); }
  if (SZ.raidT > 4.5) { SZ.raidT = 0.6; szShootWounded(raider); }
}
/* the convoy: along the avenue, a halt at the mouth of the square while the bazookas in the windows fire at it, then up to the door */
function szConvStart() {
  const path = SZ_CONV_PATH.map(([x, z]) => [LX(x), LZ(z)]), L = pathLen(path), s0 = pathLen(path.slice(0, 3));
  Object.assign(SZ, { convS0: s0, convL: L, convAt: null, cv: false, cvDone: false, filmed: false, convMsgT: 0 });
  SZ.conv.forEach((v, i) => { vehRevive(v); v.path = path; v.s = -i * 9; v.stop = s0 - i * 8; v.stopEnd = L - i * 8; v.ended = false; v.hdV = null; v.hpSeen = 100; v.onDead = () => szConvDead(v); const [x, z, hd] = pathAt(path, 0); vehPose(v, x - Math.sin(hd) * i * 9, z - Math.cos(hd) * i * 9, hd); v.g.visible = true; });
}
function szConvDead(v) {
  radio('שיירה', `${v.name} נפגע ובוער!`, 3); feed(`${v.name} הושמד`, 'bad');
  if (!SZ.conv[1].alive && !SZ.conv[2].alive) endGame(false, 'conv');
}
function szCvAmbush() {
  const f = (s) => { const lx = s.x - CITY.cx, lz = s.z - CITY.cz; return lx > -100 && lx < -34 && Math.abs(lz) < 42 && !(lz < -22 && lx < -64) && !(lz < 0 && lx > -52); };   // the blocks round the square that our windows look at
  const tag = (e) => { if (e) { e.sq = 'cv'; e.rpgCd = rand(4, 12); e.cyc = rand(0.3, 1.5); } };
  for (let i = 0; i < 4; i++) tag(szSpawnSlot('rpg', f)); for (let i = 0; i < 6; i++) tag(szSpawnSlot('rifle', f));
}
function szRideUpd() { for (const f of FRIENDS) { const v = f.bed; if (!v || !f.aid || !f.bedAt) continue; const p = v.g.localToWorld(V3(f.bedAt[0], 2.1, f.bedAt[1])); f.unit.pos.set(p.x, p.y, p.z); f.unit.heading = v.hdV + Math.PI; } }
function szConvUpd(dt) {
  if (SZ.filmed) { szRideUpd(); return; }
  const C = SZ.conv; if (!C) return; const sMax = Math.max(...C.filter((v) => v.alive).map((v) => v.s), -1e9);
  for (const v of C) { if (v.alive && v.hp < v.hpSeen - 1) { v.hpSeen = v.hp; if (GAME.t > SZ.convMsgT) { SZ.convMsgT = GAME.t + 4; radio('שיירה', pick(['בזוקה פגעה בזחל״ם! תורידו אותם מהחלונות!', 'אנחנו חוטפים כאן! הבזוקות בבניינים מסביב לכיכר!']), 2.8); } } }
  // the ambush: the bazooka crews round the square open up on the halted convoy, and they are the objective until the last of them is down. The last wave (raiders for the aid post) comes in behind them
  if (!SZ.cv && sMax > SZ.convS0 - 70) { SZ.cv = true; szCvAmbush(); radio('שיירה', 'כאן שיירת החילוץ, אנחנו בכניסה לכיכר. חוטפים בזוקות מהבניינים מסביב, לא יכולים להתקדם! תורידו אותם!', 5); hint('sz-cv', `השיירה תקועה בכניסה לכיכר. צוותי הבזוקה בחלונות שמסביב לכיכר (◆ על הקרוב): מהחלונות הדרומיים ומהגג יש אליהם קו ראייה. ${K('Q')} כוונת.`, 9); DIRQ.push({ at: GAME.t + 8, spawn: true, fn: () => szWave(3) }); }
  if (SZ.cv && !SZ.cvDone && szAlive((e) => e.sq === 'cv' && e.kind === 'rpg') === 0) { SZ.cvDone = true; for (const v of C) v.stop = v.stopEnd; feed('הבזוקות מול השיירה חוסלו', 'good'); radio('שיירה', 'הדרך פנויה, ממשיכים אליכם! תכינו את הפצועים למטה!', 4); hint('sz-cv2', 'השיירה בדרך לדלת. עכשיו שמרו על המדרגות ועל דלת התאג״ד: אף מצרי לא עולה עד שהפצועים למטה.', 7); }
  if (!SZ.convAt && SZ.cvDone && C.some((v) => v.alive && v.s >= v.stopEnd - 14)) { SZ.convAt = GAME.t; radio('שיירה', 'אנחנו בדלת! מורידים את הפצועים, מהר!', 3); }
  if (SZ.convAt && !SZ.filmed && szAlive((e) => inTB(e.pos.x, e.pos.z, 0.3)) === 0) szConvoyFilm();
}
function szWave(n) {
  // every path keeps to the streets: the cross street (x -66..-50), the square (x -84..-36, z -24..24), the avenue and the west street (z -8..8)
  const W = [
    [[-58, -95, [[-58, -60], [-54, -42], [-57, -27]], 'rifle'], [-60, -96, [[-61, -60], [-62, -42], [-63, -26]], 'rpg'], [-56, -97, [[-57, -58], [-58, -40], [-62, -26], [-70, -21]], 'rifle', true], [-59, -98, [[-60, -56], [-60, -36]], 'rifle']],
    [[-96, 4, [[-90, 6.5], [-81, 12], [-77, 18]], 'rifle'], [-96, -3, [[-88, -6.5], [-80, -10], [-76, -19]], 'rifle', true], [-96, 0, [[-88, -6], [-86, 3]], 'rpg'], [-58, 98, [[-61, 60], [-62, 44], [-58, 30], [-54, 26]], 'rifle'], [-60, 99, [[-61, 60], [-62, 40], [-64, 27]], 'rifle']],
    [[-58, -96, [[-58, -60], [-55, -40], [-52, -27]], 'rpg'], [-60, -97, [[-60, -58], [-62, -40], [-66, -21], [-74, -21]], 'rifle', true], [-57, 97, [[-57, 58], [-52, 40], [-52, 26]], 'rifle'], [-96, 3, [[-90, 6.5], [-81, 10], [-78, 17]], 'rifle'], [-96, -2, [[-88, -6.5], [-81, -9], [-79, -20]], 'rifle', true], [-61, 98, [[-62, 58], [-64, 38], [-62, 27]], 'rpg']],
    [[-58, -96, [[-58, -60], [-55, -40], [-60, -27], [-70, -21]], 'rifle', true], [-96, 2, [[-88, -6.5], [-81, -8], [-78, -19]], 'smg', true], [-57, 98, [[-57, 58], [-52, 40], [-52, 26]], 'rpg'], [-60, -98, [[-60, -56], [-60, -36]], 'rifle']],
  ][n];
  if (!W) return; radio('צנחנים', pick(n === 3 ? ['הם רואים את השיירה - הם מנסים להגיע לפצועים לפניה!', 'עוד גל, הפעם ישר לדלת שלנו! תשמרו על המדרגות!'] : ['הם באים מהרחוב הצפוני!', 'עוד גל! מכל הכיוונים!', 'הם נכנסים לבניין מלמטה! תשמרו על המדרגות!']), 3.5);
  W.forEach(([x, z, p, k, c], i) => { for (let j = 0; j < 3; j++) { const ox = j ? rand(-1.5, 1.5) : 0, oz = j ? rand(-1.5, 1.5) : 0; DIRQ.push({ at: GAME.t + i * 1.4 + j * 0.6, spawn: true, fn: () => szSpawnStreet(x + ox, z + oz, j ? p.map(([a, b]) => [a + ox * 0.5, b + oz * 0.5]) : p, j && k === 'rpg' ? 'rifle' : k, !!c) }); } });
  if (n === 1) szAmbush(-100, -30, 1, 4);
}
function updSuez(dt) {
  SZ.t += dt; if (Math.floor(SZ.t * 2) !== Math.floor((SZ.t - dt) * 2)) szEnemyCleanup(); for (let i = DIRQ.length - 1; i >= 0; i--) if (DIRQ[i] && GAME.t >= DIRQ[i].at) { const q = DIRQ.splice(i, 1)[0]; q.fn(); }
  const tx = TANK.g ? TANK.s : 0;
  if (SZ.stage === 0) {
    for (const [s, xMin, xMax, r, n, key] of [[25, 120, 186, 3, 9, 'a1'], [100, 50, 118, 3, 12, 'a2'], [165, -12, 50, 4, 12, 'a3']]) if (tx > s && !SZ.msgs[key]) { SZ.msgs[key] = true; szAmbush(xMin, xMax, r, n); szSquad(SZ_STREET[key], 0); radio('תותחן', pick(['בזוקה בחלון מימין!', 'אר־פי־ג׳י על הגג!', 'תנועה בחלונות, משני הצדדים!', 'חי״ר ברחוב, יוצאים מהסמטה!']), 2.6); }
    if (SZ.msgs.a1 && !SZ.leadHit && SZ.lead && SZ.lead.alive && tx > 42) { SZ.leadHit = true; szLeadFilm(); }
    // the tank halts at each ambush and moves on only when the street ahead is clear
    const st = TANK.stops[TANK.stopI]; if (st !== undefined && TANK.holdAt === st) { SZ.stopT += dt; const sx = LX(tankAt(st)[0]); const inWin = (e) => e.sz === 'win' && e.pos.x < sx + 30 && e.pos.x > sx - 80, left = fieldLeft(inWin); if (holdDone(left, SZ.stopT)) { fieldDespawn(inWin); TANK.stopI++; TANK.holdAt = null; SZ.stopT = 0; radio('נהג', 'נקי. ממשיך בתנועה.', 2); if (TANK.stopI >= TANK.stops.length) szStage(1); } }
  } else if (SZ.stage === 1) {
    if (!SZ.junction) { SZ.junction = true; TANK.stops = [272]; TANK.stopI = 0; TANK.holdAt = null; szAmbush(-100, -25, 4, 14); szSquad(SZ_STREET.j, 0); }
    if (TANK.holdAt != null && !SZ.bigHit) { SZ.hitT = (SZ.hitT || 0) + dt; if (SZ.hitT > 9) { SZ.bigHit = true; const p = tankTurretWorld(); tankHit(p.add(V3(rand(-1, 1), 0.5, rand(-1, 1))), true); radio('נהג', 'פגיעה ישירה! הטנק בוער!', 2.5); DIRQ.push({ at: GAME.t + 2.2, fn: bailOut }); } }
  } else if (SZ.stage === 2) {
    gateUpd(dt); if (inTB(P.pos.x, P.pos.z, -0.2)) szStage(4);
  } else if (SZ.stage === 3) {
    gateUpd(dt); if (inTB(P.pos.x, P.pos.z, -0.2)) szStage(4);
  } else if (SZ.stage === 4) {
    if (szAlive((e) => e.sz === 'room') === 0 && SZ.t > 3) { SZ.clearT = (SZ.clearT || 0) + dt; if (SZ.clearT > 2) { SZ.clearT = 0; feed('הבניין נקי', 'good'); szStage(5); } }
  } else if (SZ.stage === 5) {
    SZ.holdT -= dt; SZ.nextWave -= dt; if (SZ.nextWave <= 0 && SZ.wave < 3) { szWave(SZ.wave); SZ.wave++; SZ.nextWave = 42; }
    szRaidUpd(dt); if (SZ.holdT <= 0) { szStage(6); return; }
  } else if (SZ.stage === 6) {
    szRaidUpd(dt); szConvUpd(dt);
  }
  // the breadcrumb trail the followers walk
  if (SZ.stage >= 2 && SZ.stage <= 4 && P.alive && SZ.trail) updTrail(dt);
  szClarity(dt);
}
function szTimeOfDay() { const base = SZ_MIN - START_MIN; return SZ.stage === 5 ? lerp(16 * 60 + 35 - START_MIN, 17 * 60 + 22 - START_MIN, clamp(1 - SZ.holdT / 150, 0, 1)) : SZ.stage === 6 ? lerp(17 * 60 + 22 - START_MIN, 17 * 60 + 40 - START_MIN, clamp(SZ.t / 180, 0, 1)) : base + GAME.t / 6; }

/* ---------- enemy behaviour in the city ---------- */
function szRpgTarget(e) {
  if (CH() && CH().rpgTarget) { const t = CH().rpgTarget(e); if (t) return t; }
  // a panicking crew (the hill at Purkan) puts its rockets into the sand a few metres from the tank: fire and shaking, not a kill
  if (e.rpgMiss && P.mode === 'tank' && TANK.alive) { const p = tankTurretWorld(), a = rand(0, 6.283), r = rand(7.5, 11); return p.add(V3(Math.sin(a) * r, rand(-2.2, -1.2), Math.cos(a) * r)); }
  if (P.mode === 'tank' && TANK.alive) { const p = tankTurretWorld(); return p.add(V3(rand(-2.6, 2.6), rand(-0.6, 1.4), rand(-2.6, 2.6))); }
  if (SZ.stage === 6 && SZ.conv && !SZ.filmed) { const mz = e.muzzle(); let best = null, bd = 170; for (const v of SZ.conv) { if (!v.alive || !v.g.visible) continue; const c = v.g.position.clone().add(V3(0, 1.4, 0)), d = mz.distanceTo(c); if (d < bd && losW(mz.x, mz.y, mz.z, c.x, c.y, c.z)) { bd = d; best = c; } } if (best) return best.add(V3(rand(-1.8, 1.8), rand(-0.4, 0.5), rand(-1.8, 1.8))); }
  if (e.target && e.target.player) return e.target.p.clone().add(V3(rand(-2.2, 2.2), rand(-0.4, 1.0), rand(-2.2, 2.2)));
  return null;
}
/* a cover point protects from the side its normal points to: the player must stand in front of it, beyond the wall or the sandbags */
function szCovFaces(c, th) { if (!P.alive) return true; const tx = P.pos.x - c.x, tz = P.pos.z - c.z, d = Math.hypot(tx, tz); return d > 3 && (tx * c.nx + tz * c.nz) / d > th; }
/* choosing cover: only a place that puts something between him and the player, that he can run to in a straight line; a man who storms takes the
   next one closer to the player, a man who holds the best one near him at about the range he is at. Tall cover - a wall, a doorway - is preferred */
function szPickCover(e, mode, dE) {
  let best = null, bs = 1e9; const R = mode === 'storm' ? 22 : 16, pp = P.pos;
  for (const c of SZ.covers || []) {
    if (c.floor !== undefined || (c.by && c.by !== e)) continue;
    const de = Math.hypot(c.x - e.pos.x, c.z - e.pos.z); if (de > R) continue;
    let sc = de;
    if (P.alive) { const tx = pp.x - c.x, tz = pp.z - c.z, dc = Math.hypot(tx, tz); if (dc < 4.5 || (tx * c.nx + tz * c.nz) / dc < 0.45) continue;
      if (mode === 'storm') { if (dc > dE - 2.5) continue; sc = de * 0.8 + dc * 0.5; } else sc = de + Math.abs(dc - dE) * 0.15;
      sc -= (c.h > 1.5 ? 1.5 : 0) + (c.door ? 1 : 0); }
    if (sc - 1.5 >= bs) continue;
    const cy = c.y ?? e.pos.y; if (segHitT(e.pos.x, e.pos.y + 1.0, e.pos.z, c.x, cy + 1.0, c.z, 0.3) >= 0) continue;
    sc += Math.random() * 1.5; if (sc < bs) { bs = sc; best = c; }
  }
  return best || (mode === 'storm' ? szPickCover(e, 'hold', dE) : null);
}
function suezEnemyStep(e, dt, shoot, aimPitch) {
  if (e.dormant && dormantStep(e, dt)) return;
  if (e.sz === 'win') {
    const s = e.slot; e.cyc -= dt; const aimed = aimedAt(e);
    if (e.guide) { e.peek = true; e.stance = 'crouch'; e.pos.x += (s.p[0] - e.pos.x) * 0.2; e.pos.z += (s.p[1] - e.pos.z) * 0.2; e.pos.y = s.y; const tp = e.guide.tgt ? e.guide.tgt() : tankTurretWorld(); e.face(tp.x, tp.z); e.rig.pose('crouch', e.anim, 0.05); return; }
    // a chapter may offer the Sagger crews another target (the rescue: Shaul's loaded tank); the missile then kills or damages that vehicle
    if (e.atgm && e.peek && e.rpgCd <= 0 && CH() && CH().atgmTarget) { const fn = CH().atgmTarget(e); if (fn) { const tp = fn(), mz = e.muzzle(); if (mz.distanceTo(tp) < 900 && losW(mz.x, mz.y + 0.3, mz.z, tp.x, tp.y, tp.z)) { e.face(tp.x, tp.z); const q = fireAtgm(e, fn); q.vt = true; e.rpgCd = rand(28, 38); return; } } }
    if (e.atgm && e.peek && e.rpgCd <= 0 && P.mode === 'tank' && TANK.alive) { const tp = tankTurretWorld(), mz = e.muzzle(); if (mz.distanceTo(tp) < (MODE === 'armor' ? 1000 : 330) && losW(mz.x, mz.y + 0.3, mz.z, tp.x, tp.y, tp.z)) { e.face(tp.x, tp.z); fireAtgm(e); e.rpgCd = rand(28, 38); return; } }
    if (e.peek && aimed) { e.aimT += dt; if (e.aimT > (P.mode === 'tank' ? 1.4 : 0.8) && e.kind !== 'rpg') e.cyc = Math.min(e.cyc, 0); } else e.aimT = 0;
    if (e.cyc <= 0) { e.peek = !e.peek; if (e.peek && aimed && Math.random() < 0.6) e.peek = false; e.cyc = e.peek ? (e.kind === 'rpg' ? 2.6 : rand(1.8, 2.8)) : rand(1.2, 2.4); if (e.peek) { e.scanCd = 0; e.burst = 0; e.fireCd = rand(0.3, 0.6); e.rpgAim = 0; } }
    const tg = e.peek ? s.p : s.h, k = 1 - Math.exp(-dt * 7); e.pos.x += (tg[0] - e.pos.x) * k; e.pos.z += (tg[1] - e.pos.z) * k; e.pos.y = s.y;
    if (e.peek) {
      e.stance = 'stand';
      if (e.kind === 'rpg') {
        const tp = szRpgTarget(e);
        const mz = e.muzzle(); if (tp && e.rpgCd <= 0 && losW(mz.x, mz.y, mz.z, tp.x, tp.y, tp.z)) { e.face(tp.x, tp.z); if (e.rpgAim === 0) szRpgCall(e); e.rpgAim += dt; if (e.rpgAim > 2.4) { const from = e.muzzle(); fireRocket(from, tp, 'e'); if (MODE === 'suez' && (P.mode === 'tank' || tp.distanceTo(P.pos) < 8)) szFireAt(e, from); fxMuzzle(from, true); sndShot('ak', from); sndBoom(from, 0.3); e.rpgCd = rand(16, 24); e.cyc = 0.4; } }
        else if (e.target) e.face(e.target.p.x, e.target.p.z);
        e.rig.pose('aim', e.anim, aimPitch());
      } else { if (e.target) shoot(); else e.heading = Math.atan2(s.nx, s.nz); e.rig.pose('aim', e.anim, aimPitch()); }
    } else { e.stance = 'hide'; e.heading = Math.atan2(s.nx, s.nz); e.rig.pose('hide', e.anim); }
    return;
  }
  const dP = Math.hypot(P.pos.x - e.pos.x, P.pos.z - e.pos.z), sameFloor = Math.abs(P.pos.y - e.pos.y) < 1.6, seesP = !!(e.target && e.target.player);
  e.meleeCd -= dt; e.patience = (e.patience || 0) + dt;
  const assault = () => {
    if (dP < 1.75 && e.meleeCd <= 0) { e.meleeCd = 1.3; e.face(P.pos.x, P.pos.z); e.throwT = 0.5; hurtPlayer(diff.dmg[1], e.chest()); return; }
    e.anim += dt * 9; if (dP > 1.4) steer(e, P.pos.x, P.pos.z, dP > 8 ? 4.6 : 3.2, dt); e.face(P.pos.x, P.pos.z); e.stance = 'stand';
    e.fireCd -= dt; if (seesP && e.fireCd <= 0) { if (e.burst <= 0) e.burst = wBurst(e); e.burst--; e.fireCd = e.burst > 0 ? wGap(e) : wPause(e, 0.3); enemyFire(e); } e.rig.pose(dP > 8 ? 'run' : 'aim', e.anim, aimPitch());
  };
  if (e.sz === 'room') {
    // defenders hold their cover until the player comes onto their floor; then they fight it out
    if (P.alive && sameFloor && (dP < 3.5 || (playerBusy() && dP < 9 && seesP) || (e.patience > 14 && dP < (e.raid ? 7 : 14) && !aimedAt(e)))) { e.cov = null; assault(); return; }
    if (!e.cov) { let best = null, bd = 1e9; for (const c of SZ.covers) { if (c.floor !== e.floor || (c.by && c.by !== e) || (e.raid && !szInAid(c.x, c.z))) continue; const d = Math.hypot(c.x - e.pos.x, c.z - e.pos.z) + (sameFloor ? 0.3 * Math.hypot(c.x - P.pos.x, c.z - P.pos.z) : 0); if (d < bd) { bd = d; best = c; } } if (best) { best.by = e; e.cov = best; e.coverT = 1e9; e.cyc = rand(0.5, 1.2); e.peek = false; } }
    if (e.cov) { const d = Math.hypot(e.cov.x - e.pos.x, e.cov.z - e.pos.z); if (d > 0.5 && !e.inCov) { e.anim += dt * 9; steer(e, e.cov.x, e.cov.z, 3.5, dt); e.rig.pose('run', e.anim); return; } e.inCov = true; if (!sameFloor) { e.stance = 'hide'; e.rig.pose('hide', e.anim); return; } coverCycle(e, dt, e.cov, shoot, aimPitch); return; }
    e.stance = 'crouch'; if (e.target) shoot(); e.rig.pose('crouch', e.anim, aimPitch()); return;
  }
  if (e.sz === 'street') {
    if (P.alive && sameFloor && dP < 4) { assault(); return; }
    // seen on the way in: he stops following the route and fights from cover from here on - forward to the next cover toward the player, or holding
    if (e.pi < e.path.length && !e.hunter && !e.wild && !e.climb && seesP && dP < awareR() && !CINE.on) { e.pi = e.path.length; e.cov = null; e.inCov = false; }
    if (e.pi < e.path.length) { const w = e.path[e.pi], x0 = e.pos.x, z0 = e.pos.z; e.anim += dt * 9.5; e.stance = 'stand'; if (steer(e, w[0], w[1], 4.6, dt) < 0.9) e.pi++; e.stuckT = Math.hypot(e.pos.x - x0, e.pos.z - z0) < dt * 0.5 ? (e.stuckT || 0) + dt : 0; if (e.stuckT > 2.5) { e.stuckT = 0; e.pi++; } e.rig.pose('run', e.anim); if (seesP && Math.random() < dt * 0.4) { e.face(P.pos.x, P.pos.z); enemyFire(e); } return; }
    if (e.climb) { e.sz = 'climb'; e.raid = SZ.stage >= 5; e.cpath = (e.raid ? SZ_RAID : [[-76.3, -22.5, 0], [-76.3, -25.5, 0], [-80.8, -28.6, 0], [-80.8, -31.3, 0], [-80.8, -37.1, 1], [-78.6, -37.1, 1], [-78.6, -30.6, 2], [-78.6, -28.4, 2]]).map(([x, z, f]) => [LX(x), LZ(z), f]); e.ci = 0; return; }
    if (e.kind === 'rpg' && e.rpgCd <= 0 && e.target) { const tp = szRpgTarget(e), mz = e.muzzle(); if (tp && (e.rpgMiss || losW(mz.x, mz.y, mz.z, tp.x, tp.y, tp.z))) { e.face(tp.x, tp.z); e.peek = true; e.stance = 'stand'; if (e.rpgAim === 0) szRpgCall(e); e.rpgAim += dt; e.rig.pose('aim', e.anim, 0); if (e.rpgAim > (e.wild ? 1.2 : 2.2)) { const from = e.muzzle(); fireRocket(from, tp, 'e'); if (MODE === 'suez' && (P.mode === 'tank' || tp.distanceTo(P.pos) < 8)) szFireAt(e, from); fxMuzzle(from, true); sndShot('ak', from); sndBoom(from, 0.3); e.rpgCd = e.wild ? rand(5, 9) : rand(16, 24); e.rpgAim = 0; e.peek = false; } return; } }
    // men firing wild stand in the open and shoot from the hip: no cover, no crouching
    if (e.wild) { e.stance = 'stand'; if (e.target) shoot(); e.rig.pose('aim', e.anim, aimPitch()); return; }
    // each man fights one of two ways: he storms (cover to cover, always closer, the last metres at a run) or he holds (the best cover in reach, kept while it still covers him)
    if (!e.tac) e.tac = e.kind === 'rpg' || e.kind === 'lmg' || e.kind === 'sniper' || Math.random() > diff.storm ? 'hold' : 'storm';
    if (e.tac === 'storm' && P.alive && sameFloor && dP < 7.5 && seesP) { if (e.cov) { e.cov.by = null; e.cov = null; } assault(); return; }
    // the cover is judged against where the player is now: once he is beside it or behind it, it covers nothing and the man moves
    e.covChk = (e.covChk || 0) - dt;
    if (e.cov && e.covChk <= 0) { e.covChk = 0.5; if (!szCovFaces(e.cov, 0.1)) { e.cov.by = null; e.cov = null; e.inCov = false; } }
    e.noCovT = (e.noCovT || 0) - dt;
    if ((!e.cov || (e.inCov && e.coverT <= 0)) && e.noCovT <= 0) {
      const old = e.cov, nc = szPickCover(e, e.tac, dP);
      if (nc && nc !== old) { if (old) old.by = null; nc.by = e; e.cov = nc; e.inCov = false; e.cyc = rand(0.4, 1.0); e.peek = false; e.covRunT = 0; }
      if (!nc && !old) e.noCovT = 1.5;
      if (e.cov) e.coverT = e.tac === 'storm' ? rand(2.8, 5) : rand(6, 10);
    }
    if (e.cov) { const d = Math.hypot(e.cov.x - e.pos.x, e.cov.z - e.pos.z);
      if (d > 0.5 && !e.inCov) { e.covRunT = (e.covRunT || 0) + dt; if (e.covRunT > 7) { e.cov.by = null; e.cov = null; e.noCovT = 2; return; } e.anim += dt * 9.5; steer(e, e.cov.x, e.cov.z, e.tac === 'storm' ? 4.8 : 4.2, dt); e.rig.pose('run', e.anim); if (seesP && Math.random() < dt * 0.6) { e.face(P.pos.x, P.pos.z); enemyFire(e); } return; }
      e.inCov = true; coverCycle(e, dt, e.cov, shoot, aimPitch); return; }
    // no cover within reach: a man who storms comes on in short rushes, down on a knee to fire between them; a man who holds kneels where he is
    if (e.tac === 'storm' && P.alive && seesP && dP > 7.5) {
      e.rushTm = (e.rushTm ?? rand(0.3, 1.2)) - dt;
      if (e.rushTm <= 0) { e.rushRun = !e.rushRun; e.rushTm = e.rushRun ? rand(1.8, 3.2) : rand(1.3, 2.4); e.rushSide = rand(-0.55, 0.55); if (!e.rushRun) { e.fireCd = Math.min(e.fireCd, 0.3); e.burst = 0; } }
      if (e.rushRun) { const a = Math.atan2(P.pos.x - e.pos.x, P.pos.z - e.pos.z) + e.rushSide; e.anim += dt * 9.5; e.stance = 'stand'; steer(e, e.pos.x + Math.sin(a) * 5, e.pos.z + Math.cos(a) * 5, 4.6, dt); e.rig.pose('run', e.anim); return; }
    }
    e.stance = 'crouch'; if (e.target) shoot(); e.rig.pose('crouch', e.anim, aimPitch()); return;
  }
  if (e.sz === 'climb') {
    // up the stairwell toward the player's floor
    const pf = tbFloor(P.pos.y), ef = tbFloor(e.pos.y);
    if (P.alive && sameFloor && (dP < 9 || ef === pf)) { assault(); return; }
    const w = e.cpath[e.ci]; if (!w) { e.sz = 'room'; e.floor = ef; e.cov = null; return; }
    const x0 = e.pos.x, z0 = e.pos.z; e.anim += dt * 9.5; e.stance = 'stand'; if (steer(e, w[0], w[1], 3.8, dt) < 0.7) e.ci++; e.stuckT = Math.hypot(e.pos.x - x0, e.pos.z - z0) < dt * 0.5 ? (e.stuckT || 0) + dt : 0; if (e.stuckT > 3) { e.stuckT = 0; e.ci++; } e.rig.pose('run', e.anim); return;
  }
}
function szRpgCall(e, what = 'בזוקה') {
  if (P.mode !== 'tank' || GAME.t < (SZ.rpgCallT || 0)) return; SZ.rpgCallT = GAME.t + 3.5;
  const fwd = Math.atan2(-Math.sin(P.yaw), -Math.cos(P.yaw)), a = Math.atan2(e.pos.x - P.pos.x, e.pos.z - P.pos.z); let h = Math.round(-wrapPi(a - fwd) / (Math.PI / 6)); h = ((h % 12) + 12) % 12 || 12;
  radio('תותחן', `${what}! שעה ${h}${e.slot ? (e.slot.roof ? ', על הגג' : e.slot.f ? `, קומה ${e.slot.f}` : '') : MODE === 'suez' ? ', ברחוב' : ''}!`, 2.2);
}
function szEnemyCleanup() { for (const e of UNITS.enemies) if (e.sz && e.slot && !e.alive) { e.slot.used = false; e.slot = null; } }

/* ---------- in the city it has to be plain where the fire comes from and where to take cover ----------
   every shot at the player throws an amber arc on the edge of the screen toward the man who fired it, he keeps an orange mark for a few seconds
   and pings on the small map; a chip says whether the player is exposed to them or covered; and in the square the best cover in the current bound
   (the side of a wreck or a sandbag wall that faces the bound's enemies) is marked with a green shield and a ring on the ground */
const fireEls = []; for (let i = 0; i < 6; i++) { const b = document.createElement('b'); $('#fire').appendChild(b); fireEls.push({ b, t: -9 }); }
function szFireAt(e, from) {
  e.thrT = GAME.t; if (GAME.t - (e.arcT ?? -9) < 0.7) return; e.arcT = GAME.t;
  const rel = THREE.MathUtils.radToDeg(wrapPi(Math.atan2(from.x - P.pos.x, -(from.z - P.pos.z)) + P.yaw));
  const d = fireEls.reduce((a, b) => (a.t < b.t ? a : b)); d.t = GAME.t; d.b.style.transform = `rotate(${rel.toFixed(1)}deg)`; d.b.style.transition = 'none'; d.b.style.opacity = '1';
  requestAnimationFrame(() => { d.b.style.transition = 'opacity 1.2s ease-in'; d.b.style.opacity = '0'; });
}
const SZPOS = { mk: [], ring: [], picks: [], t: 0, expT: 0, nExp: 0, nThr: 0 };
const shieldSvg = (c, fill) => `<svg viewBox="0 0 20 20" width="20" height="20"><path d="M10 1.5 L17.5 4.5 V10 C17.5 14.2 14.4 17.2 10 18.5 C5.6 17.2 2.5 14.2 2.5 10 V4.5 Z" fill="${fill ? c : 'rgba(10,20,12,.55)'}" stroke="${c}" stroke-width="2"/></svg>`;
function szPosInit() {
  if (SZPOS.mk.length) return; const rg = new THREE.RingGeometry(0.5, 0.78, 32).rotateX(-Math.PI / 2);
  for (let i = 0; i < 3; i++) {
    const el = document.createElement('div'); el.className = 'mk pos'; const mk = new CSS2DObject(el); mk.center.set(0.5, 1); mk.visible = false; mk.userData.dyn = true; scene.add(mk); SZ.objs.push(mk); SZPOS.mk.push({ mk, el, html: '' });
    const r = new THREE.Mesh(rg, new THREE.MeshBasicMaterial({ color: 0x93d48d, transparent: true, opacity: 0.6, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 })); r.renderOrder = 2; r.visible = false; r.userData.dyn = true; scene.add(onLayer1(r)); SZ.objs.push(r); SZPOS.ring.push(r);
  }
}
// the fixed positions of the last two stages: where the aid post is held from, and the windows and roof over the square
const SZ_POS5 = [[-75.0, -35.0, 1, 'מול דלת המדרגות'], [-73.7, -30.1, 1, 'דלת המסדרון']], SZ_POS6 = [[-75.5, -24.9, 1, 'חלון לכיכר'], [-72.0, -25.6, 3, 'הגג']];
function szPosPick() {
  const out = [];
  if ((SZ.stage === 2 || SZ.stage === 3) && GATE.on && LANE.pts && P.alive) {
    const tag = 'g' + GATE.i, foes = UNITS.enemies.filter((e) => e.alive && e.sq === tag); if (!foes.length) return out;
    let tx = 0, tz = 0; for (const e of foes) { tx += e.pos.x; tz += e.pos.z; } tx /= foes.length; tz /= foes.length;
    const ps = laneProj(P.pos.x, P.pos.z).s, cand = [];
    for (const c of SZ.covers || []) {
      if (c.floor !== undefined || (c.by && c.by.alive)) continue; const dP = Math.hypot(c.x - P.pos.x, c.z - P.pos.z); if (dP > 28 || laneBad(c.x, c.z) > 0) continue;
      const vx = tx - c.x, vz = tz - c.z, dv = Math.hypot(vx, vz) || 1, face = (vx * c.nx + vz * c.nz) / dv; if (face < 0.55 || dv < 7) continue;
      if (foes.some((e) => Math.hypot(e.pos.x - c.x, e.pos.z - c.z) < 5.5)) continue; const cs = laneProj(c.x, c.z).s; if (cs < ps - 2.5) continue;   /* never a step back */
      cand.push([face * 2 + (c.h > 1.5 ? 0.7 : c.h > 0.85 ? 0.3 : 0) + clamp((cs - ps) / 12, -0.3, 1) - dP / 30, c]);
    }
    // the best dozen by that measure are tested for real: how many of the bound's men (the windows too, over a car's roof) can see a man kneeling there
    cand.sort((a, b) => b[0] - a[0]); const top = cand.slice(0, 12);
    for (const t of top) { const c = t[1], cy = (c.y ?? CHH) + 1.0; let n = 0; for (const e of foes) { if (e.dormant) continue; const q = e.eye(); q.y = Math.max(q.y, e.pos.y + 1.45); if (losW(q.x, q.y, q.z, c.x, cy, c.z)) n++; } t[0] -= n * 1.6; t.n = n; }
    top.sort((a, b) => b[0] - a[0]); for (const t of top) { const c = t[1]; if (out.every((o) => Math.hypot(o.x - c.x, o.z - c.z) > 4)) out.push({ x: c.x, z: c.z, y: c.y ?? CHH, label: 'עמדה' }); if (out.length >= 2) break; }
  } else if (SZ.stage === 5 || SZ.stage === 6) for (const [x, z, f, label] of SZ.stage === 5 ? SZ_POS5 : SZ_POS6) out.push({ x: LX(x), z: LZ(z), y: CHH + f * FLH, label });
  return out;
}
function szClarity(dt) {
  szPosInit(); SZPOS.t -= dt;
  if (SZPOS.t <= 0) { SZPOS.t = 0.4; SZPOS.picks = P.mode === 'tank' || CINE.on ? [] : szPosPick(); }
  const near = (q) => Math.hypot(q.x - P.pos.x, q.z - P.pos.z) < 1.4 && Math.abs(q.y - P.pos.y) < 1.6;
  SZPOS.mk.forEach((m, i) => { const q = SZPOS.picks[i], r = SZPOS.ring[i]; if (!q) { m.mk.visible = false; r.visible = false; return; }
    const inP = near(q), html = `<i>${shieldSvg(inP ? '#effff0' : '#a8e6aa', inP)}</i>${inP ? 'במחסה' : q.label}`; if (m.html !== html) { m.el.innerHTML = html; m.html = html; } m.el.classList.toggle('in', inP);
    m.mk.position.set(q.x, q.y + 1.5, q.z); m.mk.visible = !CINE.on; r.position.set(q.x, (q.y === CHH ? CHH : q.y) + 0.05, q.z); r.visible = !CINE.on; r.material.opacity = inP ? 0.85 : 0.45 + 0.2 * Math.sin(GAME.t * 4); });
  // exposed or covered: counted against the men who fired at the player in the last four seconds
  SZPOS.expT -= dt; if (SZPOS.expT <= 0) { SZPOS.expT = 0.25; let nT = 0, nE = 0; const pe = playerEye(); pe.y -= P.crouch ? 0.3 : 0.45;
    if (P.alive && P.mode !== 'tank') for (const e of UNITS.enemies) { if (!e.alive || GAME.t - (e.thrT ?? -99) > 4) continue; nT++; const q = e.eye(); q.y = Math.max(q.y, e.pos.y + 1.45); if (losW(q.x, q.y, q.z, pe.x, pe.y, pe.z)) nE++; }
    SZPOS.nThr = nT; SZPOS.nExp = nE; }
  const el = $('#covst'), on = SZPOS.nThr > 0 && !CINE.on && P.mode !== 'tank'; el.classList.toggle('on', on);
  if (on) { const safe = SZPOS.nExp === 0, t = safe ? 'במחסה מהיורים' : `חשופים ל־${SZPOS.nExp === 1 ? 'יורה אחד' : SZPOS.nExp + ' יורים'}${SZPOS.picks.length ? ' · עמדה בירוק' : ' · למחסה!'}`; el.classList.toggle('safe', safe); const sp = el.lastElementChild; if (sp.textContent !== t) sp.textContent = t; }
}
function szClarityOff() { for (const m of SZPOS.mk) m.mk.visible = false; for (const r of SZPOS.ring) r.visible = false; SZPOS.picks = []; SZPOS.nThr = 0; $('#covst').classList.remove('on'); }

/* ---------- objective, hints, HUD, minimap ---------- */
function suezObjective() {
  if (SZ.stage <= 1) return null;
  if ((SZ.stage === 2 || SZ.stage === 3) && GATE.on) return gateObj('מצרי', 'המחסה הבא');
  if (SZ.stage === 2) return [LX(-58), CHH, LZ(4), 'האנדרטה'];
  if (SZ.stage === 3) return [LX(-76.3), CHH, LZ(-22.8), 'בניין הפינה'];
  if (SZ.stage === 4) {
    const pf = tbFloor(P.pos.y), left = [0, 1, 2, 3].map((f) => szAlive((e) => e.sz === 'room' && tbFloor(e.pos.y) === f));
    if (!inTB(P.pos.x, P.pos.z)) return [LX(-76.3), CHH, LZ(-22.8), 'בניין הפינה'];
    if (left[pf] > 0) return null;
    const nf = left.findIndex((n, f) => f > pf && n > 0); if (nf < 0) return null;
    const stair = [[-80.8, -28.9], [-78.6, -37.1], [-80.8, -30.6]][pf] || [-80.8, -28.9]; return [LX(stair[0]), CHH + pf * FLH, LZ(stair[1]), `מדרגות · קומה ${nf === 3 ? 'הגג' : nf}`];
  }
  if (SZ.stage >= 5) {
    if (szAlive((e) => e.raid && inTB(e.pos.x, e.pos.z, 0.3))) return [LX(SZ_AID.door[0]), CHH + FLH, LZ(SZ_AID.door[1]), 'דלת התאג״ד'];
    if (SZ.stage === 6 && SZ.cv && !SZ.cvDone) { const e = szNearest((e) => e.sq === 'cv' && e.kind === 'rpg'); if (e) return [e.pos.x, e.pos.y + 1.3, e.pos.z, `בזוקה מול השיירה · ${szAlive((q) => q.sq === 'cv' && q.kind === 'rpg')}`]; }
    if (SZ.stage === 6 && SZ.convAt) { const e = szNearest((e) => inTB(e.pos.x, e.pos.z, 0.3)); if (e) return [e.pos.x, e.pos.y + 1.3, e.pos.z, 'מצרי בבניין']; }
    if (SZ.stage === 6 && SZ.conv && !SZ.convAt) { const v = SZ.conv.find((w) => w.alive && w.g.visible); if (v) return [v.g.position.x, v.g.position.y + 1.2, v.g.position.z, SZ.cvDone ? 'השיירה · בדרך לדלת' : 'השיירה']; }
  }
  return null;
}
function szNearest(pred) { let best = null, bd = 1e9; for (const e of UNITS.enemies) { if (!e.alive || !e.sz || !pred(e)) continue; const d = Math.hypot(e.pos.x - P.pos.x, e.pos.z - P.pos.z); if (d < bd) { bd = d; best = e; } } return best; }
function suezHints() {
  if (SZ.stage === 0 && GAME.t > 1) hint('sz-tank', TOUCH ? `אתם מפקד הטנק, ראש מחוץ לצריח. <kbd>אש</kbd> = מקלע 0.5, <kbd>רימון</kbd> = פגז מהתותח, <kbd>כוונת</kbd> = כוונת התותחן. הכפתור הירוק מכניס אתכם לצריח.` : `אתם מפקד הטנק, ראש מחוץ לצריח. ${K('לחיצה ממושכת')} מקלע 0.5, ${K('G')} פגז: מחסל עמדה שלמה ומשמיד רכבים, לחצן ימני כוונת תותחן (זום), ${K('C')} להיכנס לצריח מפני צלפים.`, 11);
  if (SZ.stage <= 1 && szAlive((e) => e.kind === 'rpg' && e.peek) > 0) hint('sz-rpg', `<b>בזוקה בחלון!</b> סימון צהוב מהבהב = הוא מכוון לטנק. יש לכם בערך שנייה: מקלע או פגז לחלון.`, 6);
  if (SZ.stage === 2) hint('sz-run', `הצנחנים (כחול) הולכים אחריכם. כל מי שיורה עליכם מקבל סימן כתום וקשת כתומה בשולי המסך. רוצו לעמדה הירוקה, ירו משם, והתקדמו כשהם מתחבאים.`, 8);
  if (SZ.stage === 3) hint('sz-sq3', `לאורך הצד המערבי של הכיכר אל בניין הפינה. צוות התותח נגד־טנקים בבור השקים בפתח הרחוב הצפוני: רימון לתוך הבור עובד טוב יותר מירי.`, 8);
  if (SZ.stage === 4) hint('sz-cqb', `לחימה בבניין: לפני כל חדר זרקו רימון (${K('G')}), חכו לפיצוץ ואז היכנסו. הצנחנים נכנסים אחריכם. המדרגות בפינה הצפון־מערבית.`, 9);
  if (SZ.stage === 5) hint('sz-hold', `התאג״ד (✚) בחדר הפנימי של הקומה הראשונה, ליד חדר המדרגות. המצרים יעלו במדרגות ישר אליו: שמרו על הדלת מהעמדות המסומנות בירוק, ורימון (${K('G')}) לכל מי שעולה.`, 9);
  if (SZ.stage === 6 && !SZ.cv && SZ.t > 2) hint('sz-conv', 'השיירה נכנסת מהמזרח (◆). היא תיעצר בכניסה לכיכר תחת אש בזוקות מהבניינים מסביב: תפסו עמדה בחלון שפונה לכיכר (דרום) או עלו לגג - שתי העמדות מסומנות בירוק - ותכסו אותה משם.', 9);
}
function suezItems(items) {
  const S = SZ_STAGES[SZ.stage]; items.push(['go', (S.goal || S.sub) + (OBJ.on ? ' (◆)' : '')]);
  if (SZ.stage <= 1) { items.push([TANK.hp < 40 ? 'warn' : '', `מצב הטנק: ${Math.max(0, Math.round(TANK.hp))}% · פגז: ${TANK.gunT > 0 ? `טוען ${Math.ceil(TANK.gunT)}` : 'מוכן'}`]); items.push(['', `מצרים בחלונות ובגגות: ${szAlive((e) => e.sz === 'win')} · ברחוב: ${szAlive((e) => e.sz === 'street')}`]); }
  if ((SZ.stage === 2 || SZ.stage === 3) && GATE.on) gateItem(items); else if (SZ.stage === 3) items.push(['next', 'הכיכר נקייה: היכנסו לבניין הפינה (◆)']);
  if (SZ.stage >= 2 && SZ.stage <= 4) { const n = FRIENDS.filter((f) => f.state === 'follow').length; items.push([n < 2 ? 'warn' : '', `צנחנים איתכם: ${n}`]); }
  if (SZ.stage === 4) items.push(['', `מצרים בבניין: ${szAlive((e) => e.sz === 'room')}`]);
  if (SZ.stage >= 5) {
    if (SZ.stage === 5) { const s = Math.max(0, Math.ceil(SZ.holdT)); items.push(['next', `השיירה מגיעה בעוד ${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`]); }
    else if (SZ.convAt) items.push(['next', 'השיירה בדלת! נקו את הבניין מהמצרים (◆)']);
    else if (SZ.cvDone) items.push(['next', 'השיירה בדרך לדלת: שמרו על המדרגות ועל דלת התאג״ד']);
    else if (SZ.cv) { items.push(['next', 'השיירה תקועה בכניסה לכיכר']); items.push(['warn', `חסלו את הבזוקות שמסביב לכיכר (◆): ${szAlive((e) => e.sq === 'cv' && e.kind === 'rpg')}`]); }
    else items.push(['next', 'השיירה בשדרה הראשית: תפסו עמדה בחלון שפונה לכיכר או על הגג']);
    const left = szWoundedLeft(); items.push([left < SZ_WOUNDED.length ? 'warn' : 'med', `פצועים בתאג״ד: ${left} מתוך ${SZ_WOUNDED.length}`]);
    const inB = szAlive((e) => inTB(e.pos.x, e.pos.z, 0.3)); if (inB) items.push(['warn', `מצרים בתוך הבניין: ${inB}`]);
  }
}
function drawSuezMinimap(g, X, poly, dot, k) {
  g.fillStyle = 'rgba(150,140,118,.9)'; g.fillRect(0, 0, MINI.c.width, MINI.c.width);
  const rect = (x0, x1, z0, z1) => poly([[LX(x0), LZ(z0)], [LX(x1), LZ(z0)], [LX(x1), LZ(z1)], [LX(x0), LZ(z1)]]);
  g.fillStyle = 'rgba(70,70,66,.95)'; for (const r of [[-36, 245, -8, 8], [-84, -36, -24, 24], [-66, -50, -105, 105], [-110, -84, -8, 8]]) { rect(...r); g.fill(); }
  g.fillStyle = 'rgba(205,190,160,.95)'; for (const [x0, x1, z0, z1] of SZ.blocks) { poly([[x0, z0], [x1, z0], [x1, z1], [x0, z1]]); g.fill(); }
  rect(TB.x0, TB.x1, TB.z0, TB.z1); g.fillStyle = SZ.stage >= 2 ? '#ffcf73' : 'rgba(225,212,180,.95)'; g.fill(); g.lineWidth = 2; g.strokeStyle = '#3a2f1c'; g.stroke();
  laneMini(g, X, k);
  if (TANK.g && TANK.g.visible) { const [a, b] = X(TANK.g.position.x, TANK.g.position.z); g.save(); g.translate(a, b); g.fillStyle = TANK.alive ? '#6fa8ff' : '#ff6b5c'; g.fillRect(-6, -6, 12, 12); g.restore(); }
  if (SZ.conv) for (const v of SZ.conv) { if (!v.g.visible) continue; const [a, b] = X(v.g.position.x, v.g.position.z); g.fillStyle = v.alive ? '#6fa8ff' : 'rgba(40,36,30,.8)'; g.fillRect(a - 4, b - 4, 8, 8); }
  if (SZ.stage >= 5) { const [a, b] = X(LX(SZ_AID.c[0]), LZ(SZ_AID.c[1])); g.fillStyle = '#ff6b5c'; g.fillRect(a - 6, b - 2, 12, 4); g.fillRect(a - 2, b - 6, 4, 12); }
  for (const q of SZPOS.picks) { const [a, b] = X(q.x, q.z); g.beginPath(); g.arc(a, b, 5.5, 0, 6.283); g.fillStyle = 'rgba(147,212,141,.9)'; g.fill(); g.lineWidth = 2; g.strokeStyle = 'rgba(10,20,12,.8)'; g.stroke(); }
}

/* ---------- starting chapter 2, checkpoints ---------- */
function szShow(on) { showWorld(on ? 'suez' : 'mezach'); if (SZ.ht) SZ.ht.visible = on && SZ.stage >= 2; if (SZ.aidG) SZ.aidG.visible = on && SZ.stage >= 5; if (SZ.conv) for (const v of SZ.conv) v.g.visible = on && SZ.stage === 6 && !!v.path; }
function szResetTank(s) { Object.assign(TANK, { hp: 100, s, speed: 0, alive: true, burning: false, stopI: 0, holdAt: null, mg: 0, gunT: 0, recoil: 0, fireT: 0, hdV: null, path: [[232, 4], [-28, 4], [-44, 6]] }); if (SZ.lead) { vehRevive(SZ.lead); SZ.lead.shown = s < 100; SZ.lead.g.visible = SZ.lead.shown; if (s >= 100) SZ.lead.alive = false; } SZ.leadHit = s >= 100; for (const f of TANK.fireS) f.visible = false; LIGHTS.fire.intensity = 0; TANK.turret.rotation.y = 0; TANK.gun.rotation.x = 0; }
function szSetup(stage) {
  clearBattle(); for (const s of SZ.slots) s.used = false; for (const c of SZ.covers) c.by = null;
  Object.assign(P, { vy: 0, crouch: false, hp: 100, lastHit: -9, mag: 20, reserve: 160, gren: diff.gren0, reloadT: 0, fireCd: 0, ads: 0, recoil: 0, post: null, carrying: null, hold: 0, kick: 0, throwT: 0, ammoCd: 0 }); P.alive = true;
  SZ.bailed = stage >= 2; SZ.bigHit = stage >= 2; SZ.hitT = 0; SZ.junction = false; SZ.clearT = 0; SZ.convAt = null; SZ.cv = false; SZ.cvDone = false; SZ.filmed = false; INPUT.tAds = false; $('#tads').classList.remove('on');
  if (SZ.conv) for (const v of SZ.conv) { v.g.visible = false; v.path = null; } if (SZ.aidG) SZ.aidG.visible = stage >= 5;
  szResetTank([0, 210, 272, 272, 272, 272, 272][stage]); if (stage >= 2) { TANK.alive = false; TANK.burning = true; TANK.hp = 0; }
  const [x, z, hd] = tankAt(TANK.s); TANK.g.position.set(LX(x), CHH, LZ(z)); TANK.g.rotation.y = hd; TANK.g.updateMatrixWorld(true);
  if (stage <= 1) { P.mode = 'tank'; P.yaw = hd + Math.PI; P.pitch = -0.02; vm.visible = false; }
  else { P.mode = 'rifle'; vm.visible = true; $('#tsight').classList.remove('on');
    const at = SZ_START[stage]; const y = stage >= 5 ? CHH + FLH + 0.2 : undefined;
    P.pos.set(LX(at[0]), y === undefined ? CHH : hAt(LX(at[0]), LZ(at[1]), y), LZ(at[1])); P.yaw = -THREE.MathUtils.degToRad(at[2]); P.pitch = 0; }
  SZ.fresh = true; szStage(stage);
}
function startSuez() {
  ensureBase(); facesNow(); envReady(); if (!SZ.built) buildSuez();
  snapReset(); MODE = 'suez'; if (SZ.cityCovers) { SZ.covers = SZ.cityCovers; SZ.slots = SZ.citySlots; } TANK.toW = (x, z) => [LX(x), LZ(z)]; TANK.vmax = 4.2; TANK.hdV = null; P.ride = null; szShow(true); setRim(MAT.clothE, 0); $('#clockSub').textContent = '24.10.1973 · העיר סואץ'; GAME.t = 0; GAME.gCd = 0; resetTutorial(); $('#feed').innerHTML = ''; FEED.length = 0;
  Object.assign(STATS, { kills: 0, heads: 0, treated: 0, saved: 0, kia: 0, shots: 0 }); D.capture = 0;
  for (const j of STRAFE) scene.remove(j.m); STRAFE.length = 0; for (const j of JETS) scene.remove(j.m); JETS.length = 0;
  cvidPrefetch('suez'); szSetup(0); GAME.state = 'play'; $('#app').classList.add('play'); for (const m of ['#mBrief', '#mPause', '#mEnd']) $(m).hidden = true;
  initAudio(); lockPointer(); toast('24 באוקטובר 1973 · 10:40', 'העיר סואץ, שעות לפני הפסקת האש');
}
function szRestore() { const st = CP.stats; szSetup(SZ.cp); if (st) Object.assign(STATS, st); for (const k of ['sz-tank', 'sz-run', 'sz-rpg']) TUT.seen[k] = true; GAME.state = 'play'; $('#app').classList.add('play'); for (const m of ['#mBrief', '#mPause', '#mEnd']) $(m).hidden = true; initAudio(); lockPointer(); }

/* ---------- film: the lead tank of the column takes an RPG from a window. Its crew does not get out ---------- */
function szLeadFilm() {
  const L = SZ.lead, Lp = () => L.g.position.clone(), hd = L.hdV ?? -Math.PI / 2, f = V3(Math.sin(hd), 0, Math.cos(hd)), r = V3(-Math.cos(hd), 0, Math.sin(hd));
  const aim = Lp().addScaledVector(f, 9); let best = null, bd = 1e9;
  for (const sl of SZ.slots) { if (sl.used || sl.roof || sl.f < 1 || sl.f > 2 || sl.nz !== 1) continue; const d = Math.hypot(sl.x - aim.x, sl.z - aim.z); if (d < bd) { bd = d; best = sl; } }
  let g = null; if (best && bd < 30) { sl_use: { g = spawnEnemy(best.h[0], best.h[1], 'rpg', null, null); if (!g) break sl_use; best.used = true; Object.assign(g, { sz: 'win', slot: best, state: 'sz', cyc: 99, peek: true, aimT: 0, rpgAim: 0, rpgCd: 99 }); g.pos.set(best.p[0], best.y, best.p[1]); g.face(L.g.position.x, L.g.position.z); g.sync(); } }
  const G = () => (g ? g.pos.clone() : Lp().addScaledVector(f, 9).add(V3(0, 7, -8)));
  const turret = () => Lp().add(V3(0, 2.3, 0));
  playCine({ vid: 'sz_lead',
    title: 'שדרת אל־ארבעין · 10:52',
    shots: [
      { d: 2.4, cam: camLerp(() => Lp().addScaledVector(f, 17).addScaledVector(r, 3).add(V3(0, 1.0, 0)), () => Lp().addScaledVector(f, 12).addScaledVector(r, 2.5).add(V3(0, 1.3, 0)), () => Lp().add(V3(0, 1.8, 0)), () => Lp().add(V3(0, 1.8, 0)), 50) },
      { d: 2.2, slow: 0.5, cam: (u) => { const gp = G(), dir = turret().sub(gp).normalize(); return { p: gp.clone().addScaledVector(dir, -1.5).add(V3(0, 1.9 + u * 0.1, 0)).addScaledVector(r, 0.5), l: turret(), fov: 42 }; } },
      { d: 2.8, slow: 0.3, cam: camLerp(() => Lp().addScaledVector(r, -13).addScaledVector(f, -3).add(V3(0, 1.4, 0)), () => Lp().addScaledVector(r, -11).addScaledVector(f, -1).add(V3(0, 1.6, 0)), turret, turret, 46) },
      { d: 3.6, cam: (u) => ({ p: tankHeadPos(), l: Lp().add(V3(0, 1.6 + u * 0.4, 0)), fov: 52 }) },
    ],
    ev: [[3.0, () => { if (g && g.alive) { const from = g.muzzle(); fireRocket(from, turret(), 'e'); fxMuzzle(from, true); sndShot('ak', from); sndBoom(from, 0.35); } }],
      [3.85, () => { vehDestroy(L); FX.shake = 0.6; }], [9.6, () => { if (g) { g.cyc = 1.5; g.rpgCd = rand(4, 6); } }]],
    caps: [[0.2, '<b>2א:</b> נכנסים לשדרה. שקט מדי.', 2.4], [2.6, '<b>תותחן:</b> בזוקה בחלון!', 1.8], [5.4, '<b>מ״פ:</b> 2א, 2א, ענה!', 2.2], [7.5, '<b>תותחן:</b> אין תשובה. אף אחד לא יוצא מהטנק.', 3.2]],
    end: () => { if (g) { g.cyc = 1.5; g.rpgCd = rand(4, 6); } radio('מ״פ', 'הטנק של 2א נפגע. שמרו על החלונות, הוא עוד שם!', 3.5); },
  });
}
/* ---------- film: the convoy at the door. The wounded go down to the half-tracks, and the convoy pulls out east ---------- */
function szConvoyFilm() {
  if (SZ.filmed) return; SZ.filmed = true; SZ.cvDone = true;
  for (const e of UNITS.enemies) if (e.alive) killEnemy(e, false); for (let i = DIRQ.length - 1; i >= 0; i--) if (DIRQ[i].spawn) DIRQ.splice(i, 1);
  const [T, H1, H2] = SZ.conv, door = V3(LX(-76.3), CHH, LZ(TB.z1)), sq = V3(LX(-60), CHH, LZ(-2));
  const lead = () => { const v = SZ.conv.find((w) => w.alive) || H1; return v.g.position.clone(); };
  // the wounded are carried down between the first and the second shot: by then they lie on the half-tracks and the squad stands at the tailboards
  const load = () => {
    const W = FRIENDS.slice(10, 15).filter((f) => f.aid && f.state === 'saved'), hts = [H1, H2].filter((v) => v.alive); if (!hts.length) hts.push(H1);
    W.forEach((f, i) => { const v = hts[i % hts.length], k = Math.floor(i / hts.length); f.bed = v; f.bedAt = [[-1.9, -0.55], [-1.9, 0.55], [-0.1, 0]][k % 3]; const p = v.g.localToWorld(V3(f.bedAt[0], 2.1, f.bedAt[1])); f.unit.place(p.x, p.z); f.unit.pos.y = p.y; f.unit.heading = v.hdV + Math.PI; f.unit.sync(); });
    FRIENDS.slice(0, 6).forEach((f, i) => { if (f.state !== 'post' && f.state !== 'follow') return; const v = hts[i % hts.length], p = v.g.localToWorld(V3(-4.2 - Math.floor(i / hts.length) * 1.1, 0, (i % 2 ? 1 : -1) * 0.9)); f.state = 'post'; f.target = null; f.unit.place(p.x, p.z, CHH + 0.2); f.unit.heading = v.hdV; f.unit.stance = 'stand'; f.unit.sync(); });
    { const m = FRIENDS[15]; if (m.state === 'post') { const p = (hts[0]).g.localToWorld(V3(-3.6, 0, 0)); m.unit.place(p.x, p.z, CHH + 0.2); m.unit.heading = hts[0].hdV; m.unit.sync(); } }
  };
  // each vehicle leaves from where it stands, the lead first: east along the square and back up the avenue. The wounded ride along
  const leave = () => { SZ.conv.forEach((v, i) => { if (!v.alive) return; v.path = [[v.g.position.x, v.g.position.z], ...[[-62, -16], [-48, -8], [-34, -4], [-20, 4], [200, 4]].map(([x, z]) => [LX(x), LZ(z)])]; v.s = 0; v.stop = 0; v.ended = true; v.vmax = 7; DIRQ.push({ at: GAME.t + i * 1.4, fn: () => { v.stop = undefined; } }); });
    SZ.rideT = 0; };
  playCine({ vid: 'sz_convoy',
    title: 'כיכר אל־ארבעין · 17:25',
    shots: [
      { d: 4.2, cam: camLerp(() => sq.clone().add(V3(18, 7, 2)), () => sq.clone().add(V3(8, 5, -4)), () => door.clone().add(V3(0, 1.5, 0)), () => lead().add(V3(0, 1.5, 0)), 44) },
      { d: 4.8, cam: (u) => ({ p: door.clone().add(V3(10.5 - u * 1.5, 2.8, 15)), l: H1.g.position.clone().add(V3(-0.5, 1.5, 0)), fov: 40 }) },
      { d: 6.0, cam: (u) => ({ p: V3(LX(-79 + u * 2), CHH + 2.6 + u * 1.8, LZ(-12)), l: lead().add(V3(0, 1.4, 0)), fov: 50 - u * 8 }) },
    ],
    ev: [[3.9, load], [9.2, leave]],
    caps: [[0.3, '<b>17:25.</b> שיירת החילוץ מגיעה לדלת הבניין.', 3.5], [4.3, 'הצנחנים מורידים את הפצועים מהתאג״ד ומעמיסים אותם על הזחל״מים.', 4.4], [9.4, 'הזחל״מים יוצאים מזרחה. מי שנשאר בבניין ייצא בלילה ברגל, בסמטאות, עד לקווינו.', 5.2]],
    end: () => { DIRQ.push({ at: GAME.t + 0.3, fn: () => endGame(true) }); },
  });
}
function szEnd(win, why) {
  const stats = [[STATS.kills, 'אויבים נפגעו'], [SZ.stage >= 5 ? szWoundedLeft() : Math.max(0, Math.round(TANK.hp)), SZ.stage >= 5 ? 'פצועים חולצו' : 'מצב הטנק %'], [SZ.stage + 1, 'השלב שהגעתם אליו']];
  if (win) return ['הפצועים חולצו', 'הזחל״מים יצאו מהכיכר מזרחה עם הפצועים. מי שנשאר בבניין יצא בלילה ברגל, בסמטאות, ועד הבוקר הגיע לקווינו. בקרב על סואץ, שעות לפני הפסקת האש, נפלו 80 לוחמים ו־120 נפצעו.', stats];
  if (why === 'tank') return ['הטנק הושמד', 'צוותי הבזוקה בחלונות מכוונים לטנק שנייה לפני שהם יורים. כשרואים אחד מציץ, מקלע 0.5 או פגז לחלון שלו, מיד.', stats];
  if (why === 'aid') return ['התאג״ד נפל', 'המצרים הגיעו לפצועים. מי שעולה במדרגות חייב למות על המדרגות: עמדו בפתח התאג״ד מול דלת חדר המדרגות, רימון לכל מי שעולה, ושמרו גם על הדלת מהמסדרון.', stats];
  if (why === 'conv') return ['השיירה הושמדה', 'צוותי הבזוקה בחלונות מסביב לכיכר יורים על הזחל״מים. מהחלונות של הבניין יש אליהם קו ראייה: כוונת, ראש, הבא. הם מציצים לכמה שניות לפני שהם יורים.', stats];
  return ['נפגעת', 'בטנק אפשר להיכנס לצריח כשהאש כבדה. ברגל: עוברים ממחסה למחסה, ובבניין זורקים רימון לפני כל חדר ונכנסים אחרי הפיצוץ.', stats];
}
CHAP.suez = { stages: SZ_STAGES, st: () => SZ.stage, cp: () => SZ.cp, upd: updSuez, obj: suezObjective, hints: suezHints, items: suezItems, mini: drawSuezMinimap, restore: szRestore, tod: szTimeOfDay, start: startSuez, end: szEnd, tank: true };
