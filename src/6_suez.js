
/* =====================================================================================
   CHAPTER 2 · SUEZ CITY, 24 OCTOBER 1973
   A tank column drives into the city along the main avenue. At the Arbaeen junction the
   tank is hit, the crew bails out with the paratroopers, takes the corner building floor
   by floor and holds it until dark.  (local coordinates: +x east, -z north, origin = CITY centre)
   ===================================================================================== */
const SZ_GUN = [-58, -27.6, 0.725];   // the anti-tank gun in its pit at the mouth of the north street, in their line across it: x, z (local), heading of the barrel (at the end of the avenue)
const SZ = { built: false, objs: [], mezObjs: [], covers: [], slots: [], foot: [], blocks: [], tb: null, stage: 0, t: 0, cp: 0, wave: 0, holdT: 0, msgs: {}, groups: [] };
const LX = (x) => CITY.cx + x, LZ = (z) => CITY.cz + z, CHH = CITY.h, FLH = 4.25;   // a storey: rooms a third higher than they were, so the fight indoors has air over it
const SZ_MIN = 10 * 60 + 40;

/* ---------- textures ---------- */
function facadeTile(seed, plaster, shut, ground, plain = false) {
  const W = 256, H = 128, c = canvas(W * 2, H * 2), g = c.getContext('2d'), r = rng(seed); g.scale(2, 2);
  if (plain === 'res') return szFacadeRes(g, c, W, H, r, plaster, shut);
  if (plain) return szFacadePlain(g, c, W, H, r, plaster);
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
/* the faces that carry real frames and shutters: the same plaster, but the windows painted only as openings - the dark room behind a casement
   of two glazed leaves - with no painted shutters or sills, since the 3D ones stand round them (szWinGeo, the shutter panels) */
function szFacadePlain(g, c, W, H, r, plaster) {
  g.fillStyle = plaster; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 900; i++) { g.fillStyle = r() < 0.5 ? 'rgba(80,66,48,0.10)' : 'rgba(255,250,235,0.10)'; g.fillRect(r() * W, r() * H, 2 + r() * 6, 1 + r() * 4); }
  for (const x0 of [34, 162]) {
    const w = 60, h = 78, y0 = 22, k = r(), gr = g.createLinearGradient(0, y0, 0, y0 + h); gr.addColorStop(0, '#0d0b09'); gr.addColorStop(1, '#241e18'); g.fillStyle = gr; g.fillRect(x0, y0, w, h);
    if (k < 0.8) { g.strokeStyle = '#4e4032'; g.lineWidth = 2.4; g.strokeRect(x0 + 2, y0 + 2, w - 4, h - 4); g.beginPath(); g.moveTo(x0 + w / 2, y0 + 2); g.lineTo(x0 + w / 2, y0 + h - 2); g.moveTo(x0 + 2, y0 + h * 0.28); g.lineTo(x0 + w - 2, y0 + h * 0.28); g.stroke();
      g.fillStyle = 'rgba(160,178,186,0.16)'; g.fillRect(x0 + 5, y0 + h * 0.28 + 3, w / 2 - 8, h * 0.62); if (k < 0.5) g.fillRect(x0 + w / 2 + 3, y0 + h * 0.28 + 3, w / 2 - 8, h * 0.62); }
    const st = g.createLinearGradient(0, y0 + h, 0, H); st.addColorStop(0, 'rgba(70,60,46,0.3)'); st.addColorStop(1, 'rgba(70,60,46,0)'); g.fillStyle = st; g.fillRect(x0 + 8, y0 + h + 4, w - 16, H - y0 - h);
  }
  facadeWeather(g, W, H, r, false, plaster);
  const t = tex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
// the ground floor of a house on an alley: no shops - a stone plinth, two small windows behind iron bars, a plank door
function szFacadeRes(g, c, W, H, r, plaster, shut) {
  g.fillStyle = plaster; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 900; i++) { g.fillStyle = r() < 0.5 ? 'rgba(80,66,48,0.10)' : 'rgba(255,250,235,0.10)'; g.fillRect(r() * W, r() * H, 2 + r() * 6, 1 + r() * 4); }
  g.fillStyle = 'rgba(120,108,90,0.75)'; g.fillRect(0, H - 22, W, 22); g.fillStyle = 'rgba(60,52,42,0.4)'; for (let x = 0; x < W; x += 18) g.fillRect(x, H - 22, 1.5, 22); g.fillRect(0, H - 22, W, 1.5);
  for (const x0 of [26, 96]) { g.fillStyle = 'rgba(70,58,44,0.35)'; g.fillRect(x0 - 4, 48, 48, 50); g.fillStyle = '#14110e'; g.fillRect(x0, 52, 40, 42); g.fillStyle = '#2c2a26'; for (let x = x0 + 4; x < x0 + 40; x += 6) g.fillRect(x, 52, 1.6, 42); g.fillRect(x0, 64, 40, 1.6); g.fillRect(x0, 80, 40, 1.6); g.fillStyle = 'rgba(30,26,20,0.5)'; g.fillRect(x0 - 5, 94, 50, 4); }
  { const x0 = 170, w = 50; g.fillStyle = 'rgba(70,58,44,0.4)'; g.fillRect(x0 - 6, 50, w + 12, H - 50); g.fillStyle = shut; g.fillRect(x0, 56, w, H - 56); g.fillStyle = 'rgba(0,0,0,0.28)'; for (let x = x0 + 5; x < x0 + w; x += 8) g.fillRect(x, 56, 1.5, H - 56); g.fillRect(x0 + w / 2 - 0.8, 56, 1.6, H - 56); g.fillStyle = '#c8b070'; g.fillRect(x0 + w / 2 + 4, 92, 3, 3); }
  facadeWeather(g, W, H, r, true, plaster);
  const t = tex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
// louvred wooden shutters: slats in light and shade inside a stile frame (white: tinted per copy)
function szLouverTex() {
  const c = canvas(64, 192), g = c.getContext('2d'); g.fillStyle = '#d8d8d8'; g.fillRect(0, 0, 64, 192);
  for (let y = 10; y < 182; y += 7) { g.fillStyle = '#9a9a9a'; g.fillRect(6, y, 52, 3); g.fillStyle = '#f2f2f2'; g.fillRect(6, y + 3, 52, 1.5); }
  g.strokeStyle = '#8a8a8a'; g.lineWidth = 5; g.strokeRect(3, 3, 58, 186); g.fillStyle = '#b8b8b8'; g.fillRect(6, 92, 52, 6);
  const t = tex(c); return t;
}
// a flat city roof: cement screed in panels, tar along the cracks and seams, stains where the tanks drip
function szRoofTex() {
  const W = 256, c = canvas(W), g = c.getContext('2d'), r = rng(919); g.fillStyle = '#b4ab9a'; g.fillRect(0, 0, W, W);
  tileBlotches(g, W, r, 40, 10, 60, 'rgba(90,82,70,0.16)', 'rgba(240,234,220,0.14)', 0.6);
  g.strokeStyle = 'rgba(40,36,32,0.55)'; g.lineWidth = 2; for (let k = 0; k <= W; k += 64) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k, W); g.moveTo(0, k); g.lineTo(W, k); g.stroke(); }
  g.lineCap = 'round'; for (let k = 0; k < 9; k++) { let x = r() * W, y = r() * W; g.strokeStyle = `rgba(30,28,26,${0.3 + r() * 0.4})`; g.lineWidth = 1 + r() * 2; g.beginPath(); g.moveTo(x, y); for (let j = 0; j < 6; j++) { x += (r() - 0.5) * 30; y += (r() - 0.5) * 30; g.lineTo(x, y); } g.stroke(); }
  for (let k = 0; k < 5; k++) { const gr = g.createRadialGradient(0, 0, 0, 0, 0, 30); gr.addColorStop(0, 'rgba(60,56,48,0.3)'); gr.addColorStop(1, 'rgba(60,56,48,0)'); g.save(); g.translate(r() * W, r() * W); g.fillStyle = gr; g.fillRect(-30, -30, 60, 60); g.restore(); }
  const t = tex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
// a shell hole in a facade (alpha): the broken plaster round it, the brick showing, the dark room inside, soot sprayed out from it
function szHoleTex() {
  const S = 128, c = canvas(S), g = c.getContext('2d'), r = rng(311); g.clearRect(0, 0, S, S);
  const blob = (R, j) => { g.beginPath(); for (let a = 0; a <= 6.3; a += 0.35) { const k = R * (1 - j + r() * j * 2); g.lineTo(64 + Math.cos(a) * k, 64 + Math.sin(a) * k); } g.closePath(); };
  { const gr = g.createRadialGradient(64, 64, 10, 64, 64, 62); gr.addColorStop(0, 'rgba(20,16,12,0.85)'); gr.addColorStop(1, 'rgba(20,16,12,0)'); g.fillStyle = gr; g.fillRect(0, 0, S, S); }
  g.fillStyle = 'rgba(150,140,124,1)'; blob(40, 0.3); g.fill(); g.fillStyle = 'rgba(132,76,52,1)'; blob(31, 0.3); g.fill();
  g.fillStyle = 'rgba(70,40,28,0.9)'; for (let y = 34; y < 96; y += 6) for (let x = 30; x < 98; x += 12) if (Math.hypot(x - 64, y - 64) < 30) g.fillRect(x + ((y / 6) | 0) % 2 * 6, y, 1.5, 6);
  g.fillStyle = 'rgba(8,6,5,1)'; blob(21, 0.35); g.fill();
  const t = tex(c); return t;
}
// soot licked up a wall from a window that burned
function szSootTex() {
  const c = canvas(64, 128), g = c.getContext('2d'), gr = g.createLinearGradient(0, 128, 0, 0); gr.addColorStop(0, 'rgba(14,12,10,0.85)'); gr.addColorStop(0.55, 'rgba(14,12,10,0.4)'); gr.addColorStop(1, 'rgba(14,12,10,0)');
  g.fillStyle = gr; g.beginPath(); g.moveTo(8, 128); g.quadraticCurveTo(0, 50, 22, 0); g.lineTo(44, 0); g.quadraticCurveTo(64, 50, 56, 128); g.closePath(); g.fill(); return tex(c);
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

/* ---------- building blocks: the walls in the facade material (a dressed face in a plain one, under real frames and shutters), the roof in its
   own, and round every block the plaster work of a Suez apartment house of the fifties: a plinth, a band at each floor, a cornice, a coped parapet ---------- */
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
// a facade box without its top and bottom faces (the roof is laid in its own material); faces: the sides kept (0 +x, 1 -x, 4 +z, 5 -z: BoxGeometry's order)
function szWallBox(x0, x1, y0, y1, z0, z1, tw, th, faces = [0, 1, 4, 5]) { const g = boxUV(x0, x1, y0, y1, z0, z1, tw, th), ix = g.index.array, keep = []; for (const f of faces) for (let k = 0; k < 6; k++) keep.push(ix[f * 6 + k]); g.setIndex(keep); g.clearGroups(); return g; }
// the shade a wall carries: darker where it meets the pavement and under the slab or parapet above it (baked into the vertex colours)
function aoBox(g, y0, y1, bottomK, topK) {
  const p = g.attributes.position, col = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) { const y = p.getY(i), k = lerp(bottomK, 1, smooth(y0, y0 + 1.4, y)) * lerp(1, topK, smooth(y1 - 0.9, y1, y)); col[i * 3] = k; col[i * 3 + 1] = k; col[i * 3 + 2] = k; }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3)); return g;
}
const SZ_FACE_IX = (f) => (f[0] > 0 ? 0 : f[0] < 0 ? 1 : f[1] > 0 ? 4 : 5);
const szFaces = (b) => (b.f2 ? [b.face, b.f2] : [b.face]);
// the plasters of the facade tiles (as hex, for the parapets), the trims, and the paints of the shutters
const SZ_PL = [0xe8dcc0, 0xd8bf8c, 0xe6c9b8, 0xcdd2c6, 0xece4d2, 0xc9b27e], SZ_TRIM = [0xe9e2d0, 0xd9cdb4, 0xb9a98a, 0xe2d8c2], SZ_SHUT = [0x3f6b4e, 0x5b4630, 0x3d5b6b, 0x6d6248, 0x2f4f3a, 0x6b3a2a, 0x7a7466, 0x4a5a6a];
function szRoofPlane(X0, X1, Z0, Z1, y) { const g = new THREE.PlaneGeometry(X1 - X0, Z1 - Z0); g.rotateX(-Math.PI / 2); g.translate((X0 + X1) / 2, y, (Z0 + Z1) / 2); const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) * (X1 - X0) + X0) / 6, (uv.getY(i) * (Z1 - Z0) + Z0) / 6); return g; }
/* the shell of a block: the roof, the parapet with its coping, the cornice and its lip under it, a band at each floor line and the plinth. The bands are
   slabs a little larger than the block, so only their edge shows. rich: the whole set; a far block keeps the roof, the parapet and the cornice */
function szShell(X0, X1, Z0, Z1, top, fl, pl, trim, L, rich, par = true) {
  L.roofTop.push(szRoofPlane(X0, X1, Z0, Z1, top + 0.012));
  const T = 0.25, P = top + 0.9, ring = (y0, y1, o, c) => L.trim.push([boxUV(X0 - o, X1 + o, y0, y1, Z0 - o, Z1 + o, 3, 1), c]);
  if (par) for (const [a0, a1, c0, c1] of [[X0, X1, Z0, Z0 + T], [X0, X1, Z1 - T, Z1], [X0, X0 + T, Z0 + T, Z1 - T], [X1 - T, X1, Z0 + T, Z1 - T]]) L.trim.push([boxUV(a0, a1, top, P, c0, c1, 3, 1), pl]);
  ring(top - 0.42, top - 0.12, 0.15, trim); ring(top - 0.12, top, 0.27, trim);
  if (!rich) return;
  const o = 0.05; if (par) for (const [a0, a1, c0, c1] of [[X0 - o, X1 + o, Z0 - o, Z0 + T + o], [X0 - o, X1 + o, Z1 - T - o, Z1 + o], [X0 - o, X0 + T + o, Z0 + T + o, Z1 - T - o], [X1 - T - o, X1 + o, Z0 + T + o, Z1 - T - o]]) L.trim.push([boxUV(a0, a1, P, P + 0.08, c0, c1, 3, 1), trim]);
  for (let f = 1; f < fl; f++) ring(CHH + f * FLH - 0.09, CHH + f * FLH + 0.09, 0.07, trim);
  if (fl) ring(CHH - 0.3, CHH + 0.55, 0.035, 0xa89a80);
}
// what stands on a Suez roof: water tanks on steel stands, the stair hut with its door, the TV aerials. full: a street house (more of everything)
function szRoofLife(X0, X1, Z0, Z1, top, rr, R2, full) {
  if (X1 - X0 < 4 || Z1 - Z0 < 4) return;
  const rx = () => lerp(X0 + 1.4, X1 - 1.4, rr()), rz = () => lerp(Z0 + 1.4, Z1 - 1.4, rr()), nT = (full ? 1 : 0) + Math.floor(rr() * (full ? 3 : 2));
  for (let i = 0; i < nT; i++) { const x = rx(), z = rz(), r = 0.5 + rr() * 0.3, h = 1.0 + rr() * 0.5, c = [0x8b8a84, 0x6e6a60, 0x9c9a92, 0x5e5044][Math.floor(rr() * 4)], y0 = top + 0.9;
    R2.push([G.cyl(r, r, h, full && !LITE ? 12 : 8), c, M4(x, y0 + h / 2, z)], [G.cyl(r * 0.3, r * 0.3, 0.12, 8), c, M4(x, y0 + h + 0.06, z)], [G.box(r * 2 + 0.12, 0.07, r * 2 + 0.12), 0x3e3a34, M4(x, y0 - 0.02, z)], [G.cyl(0.03, 0.03, 0.9 + h * 0.5, 5), 0x4a4640, M4(x + r + 0.05, top + 0.45 + h * 0.25, z)]);
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) R2.push([G.box(0.06, 0.9, 0.06), 0x3e3a34, M4(x + sx * r * 0.8, top + 0.45, z + sz * r * 0.8)]); }
  if (X1 - X0 > 6 && Z1 - Z0 > 6 && rr() < (full ? 0.7 : 0.45)) { const hx = lerp(X0 + 2.2, X1 - 2.2, rr()), hz = lerp(Z0 + 2.2, Z1 - 2.2, rr()); R2.push([boxUV(hx - 1.3, hx + 1.3, top, top + 2.4, hz - 1.4, hz + 1.4, 3, 2.4), 0xd2c6ac], [G.box(2.9, 0.12, 3.1), 0xb8ac94, M4(hx, top + 2.46, hz)], [G.box(0.9, 1.95, 0.06), 0x4a3a2a, M4(hx, top + 0.98, hz + 1.42)]); }
  if (rr() < (full ? 0.75 : 0.4)) { const ax = rx(), az = rz(); R2.push([G.cyl(0.025, 0.025, 3.2, 5), 0x2a2a28, M4(ax, top + 1.6, az)]); for (let j = 0; j < 3; j++) R2.push([G.box(1.3 - j * 0.3, 0.025, 0.025), 0x2a2a28, M4(ax, top + 2.4 + j * 0.35, az, 0, rr() * 3, 0)]); }
}
function cityBuilding(b, lists) {
  // b: {x0, x1, z0, z1, fl (floors), v (plaster), face, f2 (a second dressed face), solid}
  const X0 = LX(b.x0), X1 = LX(b.x1), Z0 = LZ(b.z0), Z1 = LZ(b.z1), top = CHH + b.fl * FLH, v = b.v % 6, dec = szFaces(b).map(SZ_FACE_IX), pl = [0, 1, 4, 5].filter((f) => !dec.includes(f));
  // the faces on an alley have houses' ground floors, the others shops
  const al = (b.alley || []).map((fi) => SZ_FACE_IX(szFaces(b)[fi])), sh = [0, 1, 4, 5].filter((f) => !al.includes(f));
  lists.ground[v].push(aoBox(szWallBox(X0, X1, CHH - 0.3, CHH + FLH, Z0, Z1, 7, FLH + 0.3, sh), CHH - 0.3, CHH + FLH, 0.62, 0.88)); if (al.length) lists.groundR[v].push(aoBox(szWallBox(X0, X1, CHH - 0.3, CHH + FLH, Z0, Z1, 7, FLH + 0.3, al), CHH - 0.3, CHH + FLH, 0.62, 0.88));
  if (b.fl > 1) { if (pl.length) lists.upper[v].push(aoBox(szWallBox(X0, X1, CHH + FLH, top, Z0, Z1, 7, FLH, pl), CHH + FLH, top, 0.9, 0.84)); lists.upperD[v].push(aoBox(szWallBox(X0, X1, CHH + FLH, top, Z0, Z1, 7, FLH, dec), CHH + FLH, top, 0.9, 0.84)); }
  szShell(X0, X1, Z0, Z1, top, b.fl, SZ_PL[v], SZ_TRIM[b.v % 4], lists, true, !b.ruin);
  if (!b.ruin) szRoofLife(X0, X1, Z0, Z1, top, rng(Math.round(b.x0 * 13 + b.z0 * 7) >>> 0), lists.roof, true);
  if (b.solid !== false) { addCollider((X0 + X1) / 2, (Z0 + Z1) / 2, (X1 - X0) / 2, (Z1 - Z0) / 2, 0, top + 0.9); SZ.blocks.push([X0, X1, Z0, Z1, top]); }
}
/* window centres along a building's face (they match the facade texture: two windows per 7 m tile) */
function faceInfo(b, face = b.face) {
  const [fx, fz] = face, horiz = fz !== 0, fc = horiz ? (fz > 0 ? b.z1 : b.z0) : (fx > 0 ? b.x1 : b.x0);
  const lo = horiz ? b.x0 : b.z0, hi = horiz ? b.x1 : b.z1, org = horiz ? (fz > 0 ? b.x0 : b.x1) : (fx > 0 ? b.z1 : b.z0), dir = horiz ? (fz > 0 ? 1 : -1) : (fx > 0 ? -1 : 1);
  const at = (offs) => { const out = []; for (let k = 0; k < 40; k++) for (const o of offs) { const a = org + dir * (7 * k + o); if (a > lo + 0.9 && a < hi - 0.9) out.push(a); } return out.sort((p, q) => p - q); };
  const P = (a, out) => (horiz ? [LX(a), LZ(fc) + fz * out] : [LX(fc) + fx * out, LZ(a)]);
  return { fx, fz, horiz, fc, lo, hi, org, dir, wins: at([1.75, 5.25]), shops: at([1.86, 5.14]), P, rot: horiz ? 0 : Math.PI / 2, face: Math.atan2(fx, fz), span: hi - lo, mid: (lo + hi) / 2 };
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
/* a window: a moulded frame round the painted opening, the sill on two corbels, and over it (kind) nothing more, a little cornice on brackets, or a
   pediment. Drawn as instances (one mesh per kind for the whole city) at the sill's middle on the wall, turned to face out */
const SZW = { w: 1.64, h: 2.59, y: 0.93 };   // the painted opening of every window tile: its width and height, and its sill above the floor
function szWinGeo(kind) {
  const w = SZW.w, h = SZW.h, C = 0xffffff;
  const P = [[G.box(0.13, h + 0.13, 0.09), C, M4(-(w / 2 + 0.065), h / 2, 0.045)], [G.box(0.13, h + 0.13, 0.09), C, M4(w / 2 + 0.065, h / 2, 0.045)], [G.box(w + 0.26, 0.13, 0.09), C, M4(0, h + 0.065, 0.045)],
    [G.box(w + 0.42, 0.08, 0.22), C, M4(0, -0.04, 0.11)], [G.box(0.12, 0.15, 0.13), C, M4(-w / 2 + 0.06, -0.155, 0.065)], [G.box(0.12, 0.15, 0.13), C, M4(w / 2 - 0.06, -0.155, 0.065)]];
  if (kind === 1) P.push([G.box(w + 0.62, 0.1, 0.27), C, M4(0, h + 0.21, 0.135)], [G.box(w + 0.42, 0.09, 0.18), C, M4(0, h + 0.3, 0.09)], [G.box(0.14, 0.24, 0.16), C, M4(-(w / 2 + 0.2), h + 0.04, 0.08)], [G.box(0.14, 0.24, 0.16), C, M4(w / 2 + 0.2, h + 0.04, 0.08)]);
  if (kind === 2) { const half = (w + 0.6) / 2, L = half / Math.cos(0.3); for (const s of [-1, 1]) P.push([G.box(L, 0.11, 0.22), C, M4(s * half / 2, h + 0.2 + Math.tan(0.3) * half / 2, 0.11, 0, 0, -s * 0.3)]); P.push([G.box(w + 0.64, 0.09, 0.24), C, M4(0, h + 0.17, 0.12)]); }
  return build(P);
}
// one shutter leaf on a window frame: lx, lz in the window's frame, turned ry about its upright
function szPanel(D, Mw, lx, lz, ry, c) { D.sh.push([Mw.clone().multiply(M4(lx, SZW.h / 2, lz, 0, ry, 0)), c]); }
function szInst(geo, mat, list, cast = true) {
  const m = new THREE.InstancedMesh(geo, mat, list.length), c = new THREE.Color();
  list.forEach(([M, col], i) => { m.setMatrixAt(i, M); m.setColorAt(i, c.setHex(col)); });
  m.instanceMatrix.needsUpdate = true; m.instanceColor.needsUpdate = true; m.computeBoundingSphere(); scene.add(SH(onLayer1(m), cast)); return m;
}
// the doorway of the house: a stone surround, plaster either side of a double wooden door with a fanlight over it, a step (over one painted shop front)
function szEntrance(D, F, a, trimC, pl) {
  const [x, z] = F.P(a, 0), M0 = M4(x, CHH, z, 0, F.face, 0), B = (w, h, d, lx, ly, lz, c) => D.trim.push([G.box(w, h, d), c, M0.clone().multiply(M4(lx, ly, lz))]);
  B(1.5, 2.95, 0.03, 0, 1.47, 0.015, 0x1c1814); for (const s of [-1, 1]) B(0.84, 3.05, 0.05, s * 1.17, 1.52, 0.04, pl);
  B(0.7, 2.3, 0.06, -0.36, 1.15, 0.05, 0x5a3e26); B(0.7, 2.3, 0.06, 0.36, 1.15, 0.05, 0x5a3e26); B(1.4, 0.5, 0.04, 0, 2.58, 0.04, 0x2a2622);
  B(0.3, 3.1, 0.16, -0.9, 1.55, 0.08, trimC); B(0.3, 3.1, 0.16, 0.9, 1.55, 0.08, trimC); B(2.1, 0.32, 0.2, 0, 3.12, 0.1, trimC); B(2.4, 0.15, 0.6, 0, 0.075, 0.3, 0xa39b8c);
}
function decorate(b, D, rr, lists) {
  const trimC = SZ_TRIM[b.v % 4], pl = SZ_PL[b.v % 6], top = CHH + b.fl * FLH, wk = b.style === 1 ? 1 : b.style === 2 ? 0 : rr() < 0.4 ? 2 : 0, shc = SZ_SHUT[(b.v * 3 + Math.floor(rr() * 3)) % SZ_SHUT.length];
  szFaces(b).forEach((face, fi) => {
    const F = faceInfo(b, face);
    // every window framed, most with their shutters - folded back, closed, one of each, or one swinging - and a few burnt out, the soot up the wall over them
    for (let f = 1; f < b.fl; f++) for (const a of F.wins) {
      const [x, z] = F.P(a, 0), y = CHH + f * FLH + SZW.y, Mw = M4(x, y, z, 0, F.face, 0), fort = !!(b.fortSet && b.fortSet.has(fi + ':' + f + ':' + a.toFixed(2)));
      D.win[wk].push([Mw, trimC]);
      const s = fort ? (rr() < 0.6 ? 0 : 0.95) : rr(), c = rr() < 0.75 ? shc : SZ_SHUT[Math.floor(rr() * SZ_SHUT.length)];
      if (s < 0.34) { szPanel(D, Mw, -1.35, 0.03, 0, c); szPanel(D, Mw, 1.35, 0.03, 0, c); }
      else if (s < 0.56) { szPanel(D, Mw, -0.41, 0.025, 0, c); szPanel(D, Mw, 0.41, 0.025, 0, c); }
      else if (s < 0.72) { szPanel(D, Mw, -1.35, 0.03, 0, c); szPanel(D, Mw, 0.41, 0.025, 0, c); }
      else if (s < 0.85) { const al = Math.PI * (0.45 + rr() * 0.2); szPanel(D, Mw, -0.82 + 0.39 * Math.cos(al), 0.03 + 0.39 * Math.sin(al), -al, c); szPanel(D, Mw, 1.35, 0.03, 0, c); }
      else if (!fort && rr() < 0.45) { const [sx, sz] = F.P(a, 0.03); D.soot.push(planeAt(1.8, 2.8, sx, y + SZW.h + 1.15, sz, F.face)); }
    }
    if (b.style === 1) for (const a of [F.lo + 0.32, F.hi - 0.32]) { const [x, z] = F.P(a, 0.07); D.trim.push([G.box(0.6, b.fl * FLH - 0.2, 0.15), trimC, M4(x, CHH + b.fl * FLH / 2, z, 0, F.rot, 0)]); }
    // the classical houses carry their cornice on a row of small brackets
    if (b.style === 1 && !b.ruin) for (let a = F.lo + 0.7; a < F.hi - 0.6; a += 0.9) { const [x, z] = F.P(a, 0.1); D.trim.push([G.box(0.13, 0.24, 0.2), trimC, M4(x, top - 0.55, z, 0, F.rot, 0)]); }
    if (b.style === 2) { for (let f = 1; f < b.fl; f++) balconyRun(F, F.mid, F.span - 0.7, CHH + f * FLH, D, rr, rr() < 0.5); }
    else for (let f = 1; f < b.fl; f++) for (let i = 0; i < F.wins.length; i += 2) if (rr() < 0.3 && !(b.fortSet && b.fortSet.has(fi + ':' + f + ':' + F.wins[i].toFixed(2)))) balconyRun(F, (F.wins[i] + (F.wins[i + 1] ?? F.wins[i])) / 2, F.wins[i + 1] ? 5.0 : 2.4, CHH + f * FLH, D, rr, false);
    // the shop fronts: pilasters between them and a cornice over their signs, the doorway of the house in the middle, canvas awnings over the rest (none on an alley: houses there)
    if (!(b.alley && b.alley.includes(fi))) {
    for (let k = 0; k < 40; k++) { const a = F.org + F.dir * 3.5 * k; if (a < F.lo - 0.1 || a > F.hi + 0.1) break; if (a < F.lo + 0.2 || a > F.hi - 0.2) continue; const [x, z] = F.P(a, 0.05); D.trim.push([G.box(0.42, FLH - 0.15, 0.1), trimC, M4(x, CHH - 0.3 + (FLH - 0.15) / 2, z, 0, F.rot, 0)]); }
    { const [x, z] = F.P(F.mid, 0.09); D.trim.push([G.box(F.span + 0.1, 0.16, 0.18), trimC, M4(x, CHH + 3.86, z, 0, F.rot, 0)]); }
    const ent = F.shops.length && fi === 0 ? F.shops.reduce((p, q) => (Math.abs(q - F.mid) < Math.abs(p - F.mid) ? q : p)) : null;
    for (const a of F.shops) {
      if (a === ent) { szEntrance(D, F, a, trimC, pl); continue; }
      // now and then a sign hung out over the pavement on a bracket, read from along the street
      if (fi === 0 && !(b.alley && b.alley.includes(fi)) && rr() < 0.22) { const [x, z] = F.P(a - F.dir * 1.2, 0.62), k = Math.floor(rr() * D.blade.length); D.blade[k].push(new THREE.BoxGeometry(0.07, 0.62, 1.0).rotateY(F.face).translate(x, CHH + 3.45, z)); const [bx, bz] = F.P(a - F.dir * 1.2, 0.5); D.trim.push([G.box(0.04, 0.04, 1.0), 0x2a2a28, M4(bx, CHH + 3.8, bz, 0, F.face, 0)]); }
      if (rr() < (b.alley && b.alley.includes(fi) ? 0.12 : 0.55)) { const k = Math.floor(rr() * D.awn.length), [x, z] = F.P(a, 0.72); const g = new THREE.BoxGeometry(2.9, 0.03, 1.5); const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 3, uv.getY(i));
        g.rotateX(-0.36); g.rotateY(F.face + Math.PI); g.translate(x, CHH + 2.86, z); D.awn[k].push(g); const [vx, vz] = F.P(a, 1.43); D.awn[k].push(planeAt(2.9, 0.28, vx, CHH + 2.5, vz, F.face, 0, 0.35, 1)); }
    } }
    // a shell hole or two between the windows, the plaster and brick of it on the pavement below
    if (b.fl > 1 && rr() < 0.32) { const n = 1 + (rr() < 0.3 ? 1 : 0); for (let j = 0; j < n; j++) { const f = 1 + Math.floor(rr() * (b.fl - 1)), k = Math.floor(rr() * Math.max(1, F.span / 7)), a = F.org + F.dir * (7 * k + 3.5);
      if (a > F.lo + 1.4 && a < F.hi - 1.4) { const s = 1.3 + rr() * 1.3, [x, z] = F.P(a, 0.025); D.holes.push(planeAt(s, s, x, CHH + f * FLH + 2.15, z, F.face)); const [rx, rz] = F.P(a, 1.1); D.rub.push([rx, rz, s]); } } }
  });
  // rooftop life over the street face: pigeon coops, washing lines, a room on the roof
  const F = faceInfo(b), R2 = lists.roof, X0 = LX(b.x0), X1 = LX(b.x1), Z0 = LZ(b.z0), Z1 = LZ(b.z1), rx = () => lerp(X0 + 1.5, X1 - 1.5, rr()), rz = () => lerp(Z0 + 1.5, Z1 - 1.5, rr());
  if (b.ruin || X1 - X0 < 5 || Z1 - Z0 < 5) return;
  if (rr() < 0.3) { const cx = rx(), cz = rz(); R2.push([G.box(1.8, 1.5, 1.6), 0x8a6b48, M4(cx, top + 1.55, cz)], [G.box(2.0, 0.08, 1.8), 0x6a5038, M4(cx, top + 2.35, cz)]); for (const [ox, oz] of [[-0.8, -0.7], [0.8, -0.7], [-0.8, 0.7], [0.8, 0.7]]) R2.push([G.box(0.07, 0.8, 0.07), 0x5a4430, M4(cx + ox, top + 0.4, cz + oz)]); for (let j = 0; j < 4; j++) R2.push([G.box(1.82, 0.04, 0.03), 0x3a2c1e, M4(cx, top + 1.0 + j * 0.35, cz + 0.81)]); }
  if (rr() < 0.55) { const a0 = rx(), z0 = rz(), len = 3 + rr() * 3; R2.push([G.box(len, 0.012, 0.012), 0x1a1a1a, M4(a0, top + 1.7, z0)]); for (const s of [-1, 1]) R2.push([G.box(0.05, 1.7, 0.05), 0x4a4a46, M4(a0 + s * len / 2, top + 0.85, z0)]); for (let j = 0; j < 4; j++) D.cloth.push([planeAt(0.55, 0.7, a0 - len / 2 + 0.5 + j * (len - 1) / 3, top + 1.33, z0, rr() * 0.4), CLOTHC[Math.floor(rr() * CLOTHC.length)]]); }
  if (b.fl >= 3 && rr() < 0.3) { const w = F.span * 0.45, [x, z] = F.P(F.mid, -3.2); const g = boxUV(x - (F.horiz ? w / 2 : 1.6), x + (F.horiz ? w / 2 : 1.6), top, top + 2.8, z - (F.horiz ? 1.6 : w / 2), z + (F.horiz ? 1.6 : w / 2), 7, FLH); lists.upper[(b.v + 1) % lists.upper.length].push(aoBox(g, top, top + 2.8, 0.9, 0.86)); R2.push([G.box(F.horiz ? w + 0.3 : 3.5, 0.25, F.horiz ? 3.5 : w + 0.3), trimC, M4(x, top + 2.9, z)]); }
}
/* a house whose top floor was shot away on one side: the walls of that floor stand in broken stubs along the edge, the rubble of it on the slab */
function szRuinTop(b, lists, rr, rub) {
  const X0 = LX(b.x0), X1 = LX(b.x1), Z0 = LZ(b.z0), Z1 = LZ(b.z1), top = CHH + b.fl * FLH, T = 0.3;
  for (const [a0, a1, c0, c1, alongX] of [[X0, X1, Z0, Z0 + T, 1], [X0, X1, Z1 - T, Z1, 1], [X0, X0 + T, Z0, Z1, 0], [X1 - T, X1, Z0, Z1, 0]]) {
    const L = alongX ? a1 - a0 : c1 - c0; let s = 0; while (s < L) { const w = 0.6 + rr() * 1.6, h = rr() < 0.3 ? 0.1 : 0.4 + rr() * 2.6; const e = Math.min(L, s + w);
      lists.trim.push([alongX ? boxUV(a0 + s, a0 + e, top, top + h, c0, c1, 3, 3) : boxUV(a0, a1, top, top + h, c0 + s, c0 + e, 3, 3), SZ_PL[b.v % 6]]); s = e; } }
  for (let i = 0; i < 26; i++) rub.push([new THREE.DodecahedronGeometry(0.3 + rr() * 0.6, 0).translate(lerp(X0 + 1, X1 - 1, rr()), top + 0.2, lerp(Z0 + 1, Z1 - 1, rr())), rr() < 0.5 ? 0xb9ad94 : 0x8d8473]);
}

/* ---------- street props. No car, bus or lorry in this city: the only vehicles in it are the tanks and the jeeps (theirs burnt out in the street) ---------- */
const KIOSK_GEO = build([[G.box(2.2, 2.3, 1.8), 0x6f8a6a, M4(0, 1.15, 0)], [G.box(2.6, 0.15, 2.2), 0x4f5f4a, M4(0, 2.4, 0)], [G.box(1.6, 1.0, 0.06), 0x161412, M4(0, 1.35, 0.92)]]);
function addProp(geo, x, z, rot, coll, h = 1.5, col = MAT.vc) {
  const m = new THREE.Mesh(geo, col); m.position.set(LX(x), CHH, LZ(z)); m.rotation.y = rot; scene.add(SH(onLayer1(m))); SZ.objs.push(m);
  if (coll) { addCollider(LX(x), LZ(z), coll[0], coll[1], rot, CHH + h); }
  return m;
}
function coverAround(x, z, hx, hz, rot, h) { const k0 = COVER.length; coverBox(LX(x), LZ(z), hx, hz, rot, h); for (let i = k0; i < COVER.length; i++) { COVER[i].y = CHH; SZ.covers.push(COVER[i]); } }
// an Egyptian jeep shot up in the street: the modelled jeep in their paint, broken, and burning (fire) - cover for whoever is behind it
function szWreck(x, z, r, fire = true) {
  let m; if (typeof VEH_DATA !== 'undefined' && VEH_DATA.jeep) { const rec = vehModel('jeep', 'e'); vehDamage(rec, true); rec.dead = true; m = rec.g; m.position.set(LX(x), CHH, LZ(z)); m.rotation.y = r - Math.PI / 2; scene.add(SH(onLayer1(m))); SZ.objs.push(m); if (fire) wreckFire(m, VEH_FIRE.jeep, 0.9); }
  else m = addProp(JEEP_GEO, x, z, r - Math.PI / 2, null);
  addCollider(LX(x), LZ(z), 0.95, 2.05, r, CHH + 2.0); coverAround(x, z, 0.95, 2.05, r, 1.9); return m;
}
// a line no man walks over - its top is 1.4 m, beyond the highest jump - that bullets still pass above (a barricade, a sandbag wall, the wire on it)
function szBar(x0, z0, x1, z1, hw = 0.35, h = 1.4) { const L = Math.hypot(x1 - x0, z1 - z0); return addCollider(LX((x0 + x1) / 2), LZ((z0 + z1) / 2), L / 2 + 0.15, hw, Math.atan2(-(z1 - z0), x1 - x0), CHH + h); }
// concertina wire along a line: coils side by side, seen edge-on from the side
function szWire(ws, x0, z0, x1, z1, y = 0.45) { const dx = x1 - x0, dz = z1 - z0, L = Math.hypot(dx, dz), n = Math.max(2, Math.round(L / 0.55)), a = Math.atan2(dz, -dx); for (let i = 0; i <= n; i++) ws.push(SZ.coil.clone().rotateY(a).translate(LX(x0 + dx * i / n), CHH + y, LZ(z0 + dz * i / n))); }
// a fighting position on the ground: he crouches behind the cover in front of him (n points over it, at his enemy) and rises at it to fire
function szGSlot(x, z, nx, nz, y = CHH) { const L = Math.hypot(nx, nz) || 1; nx /= L; nz /= L; const X = LX(x), Z = LZ(z); return { x: X, z: Z, y, nx, nz, f: 0, b: null, used: false, ground: true, p: [X + nx * 0.25, Z + nz * 0.25], h: [X - nx * 0.15, Z - nz * 0.15] }; }
function szRubble(list, x, z, n, s, rr, y = CHH) { for (let i = 0; i < n; i++) { const k = rr(), sz = (0.25 + rr() * 0.5) * s, g = k < 0.65 ? new THREE.DodecahedronGeometry(sz, 0) : new THREE.BoxGeometry(sz * 2.2, sz * 0.5, sz * 1.4).rotateY(rr() * 3).rotateZ((rr() - 0.5) * 0.6); list.push([g.translate(LX(x + (rr() - 0.5) * 2.6 * s), y + sz * 0.35, LZ(z + (rr() - 0.5) * 2.6 * s)), [0xb9ad94, 0x8d8473, 0xa89c84, 0x9a5a40][Math.floor(rr() * 4)]]); } }

/* ---------- the dressing of the streets and the square: barricades, drums, blocks, wrecks, burning tyres, poles and wires, stalls, signs, craters; the
   alleys of the flanking route with everything that blocks them where they must not be walked, and the Egyptian positions along them ---------- */
function cityDressing(rr) {
  const parts = [], wood = [], k0 = COVER.length, ws = [], rub = [];
  const coverHere = () => { for (let i = k0; i < COVER.length; i++) if (!SZ.covers.includes(COVER[i])) { COVER[i].y = CHH; SZ.covers.push(COVER[i]); } };
  const bag = (pts, layers) => bagWall(pts.map(([x, z]) => [LX(x), LZ(z)]), layers, CHH - 0.05, true);
  // chicanes of sandbags across the north lane of the avenue; the tank lane (z 2..6) stays open
  bag([[143, -8.4], [138, -1.2]], 5); bag([[79, -0.8], [75, -8.4]], 4); bag([[12, -8.4], [10, -2.5], [6, -2.2]], 4);
  // oil-drum barricades: the packed drum where its data is there (3_world.js propSet: dl its matrices, standing on its base where the old cylinder was centred, dt its tints)
  const dl = mdlHas('drum') ? [] : null, dt = [], half = new THREE.Matrix4().makeTranslation(0, -0.44, 0);
  const drum = (x, z, col, lie, top, r = rr() * 3) => { const M = lie ? M4(x, CHH + 0.29, z, Math.PI / 2, r, 0) : M4(x, CHH + 0.44, z, 0, r, 0);
    if (dl) { dl.push(M.multiply(half)); dt.push(drumTint(col)); if (top) { dl.push(M4(x, CHH + 1.32, z).multiply(half)); dt.push(drumTint(0x2f4a3a)); } }
    else { parts.push([G.cyl(0.29, 0.29, 0.88, 12), col, M]); if (top) parts.push([G.cyl(0.29, 0.29, 0.88, 12), 0x2f4a3a, M4(x, CHH + 1.32, z)]); } };
  const DC = [0x2f4a3a, 0x6b3a26, 0x3d4652, 0x7a6a3a];
  const drums = (x0, z0, x1, z1, block = true) => { const L = Math.hypot(x1 - x0, z1 - z0), n = Math.max(2, Math.round(L / 0.62)); for (let i = 0; i < n; i++) { const u = i / (n - 1); drum(LX(lerp(x0, x1, u)), LZ(lerp(z0, z1, u)), DC[Math.floor(rr() * 4)], rr() < 0.18, rr() < 0.25); }
    const mx = (x0 + x1) / 2, mz = (z0 + z1) / 2; if (block) { addCollider(LX(mx), LZ(mz), L / 2 + 0.3, 0.35, Math.atan2(-(z1 - z0), x1 - x0), CHH + 0.9); coverBox(LX(mx), LZ(mz), L / 2 + 0.3, 0.35, Math.atan2(-(z1 - z0), x1 - x0), 0.9); } };
  drums(96, -7.6, 92.5, -1.5); drums(160, 9.2, 165, 9.2);
  // concrete anti-tank blocks
  const blocks = (pts) => { for (const [x, z, r] of pts) { parts.push([G.box(1.15, 1.0, 1.15), 0xa39b8c, M4(LX(x), CHH + 0.5, LZ(z), 0, r, 0)], [G.box(0.85, 0.12, 0.85), 0x958e80, M4(LX(x), CHH + 1.06, LZ(z), 0, r, 0)]); addCollider(LX(x), LZ(z), 0.62, 0.62, r, CHH + 1.1); coverBox(LX(x), LZ(z), 0.62, 0.62, r, 1.05); } };
  blocks([[40, -7.4, 0.2], [42, -4.2, 0.5], [-64.8, -64, 0.3], [-51.2, -65, 0.7], [-64.9, 52, 0.4], [-51.1, 50.5, 0.8], [120, 9.2, 0.6], [-48.4, 3.2, 0.3], [-46.9, 2.6, 0.9], [64, -5, 0.4], [-8, -5.5, 0.2], [170, -6, 0.7], [171.3, -4.9, 0.2]]);
  // the wrecks: burnt-out Egyptian jeeps along the avenue (where the shot-up cars stood) and in the square - every one of them cover
  szWreck(183, -4.6, Math.PI / 2 + 0.15); smokeColumn(LX(183), LZ(-4.6), 5, true); szWreck(118, -5.5, 0.12, false); szWreck(30, -6, 0.3, false);
  szWreck(-52, 13, 0.4); szWreck(-79, 7.5, -0.3, false); smokeColumn(LX(-52), LZ(13), 4, true);
  // burning tyres in the street
  for (const [x, z] of [[70, -2.5], [-4, -7]]) { for (let i = 0; i < 7; i++) parts.push([G.tor(0.36, 0.13, 6, 12), 0x141414, M4(LX(x) + (rr() - 0.5) * 1.2, CHH + 0.13 + Math.floor(i / 3) * 0.24, LZ(z) + (rr() - 0.5) * 1.2, Math.PI / 2, 0, rr())]); smokeColumn(LX(x), LZ(z), 3, true); }
  // power poles along the south pavement with wires sagging between them and across the avenue
  const wires = []; let prev = null;
  for (let x = -26; x < 240; x += 34) { const px = LX(x), pz = LZ(10.2); parts.push([G.cyl(0.11, 0.16, 9.5, 8), 0x5a4a36, M4(px, CHH + 4.75, pz)], [G.box(1.8, 0.12, 0.12), 0x4a3a2a, M4(px, CHH + 9.0, pz)]); const tip = V3(px, CHH + 9.0, pz);
    if (prev) for (const o of [-0.8, 0.8]) { const a = prev.clone().add(V3(0, 0, o)), b = tip.clone().add(V3(0, 0, o)), m = a.clone().lerp(b, 0.5); m.y -= 0.9; wires.push(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(a, m, b), 10, 0.012, 3)); }
    if (rr() < 0.6) { const b = V3(px + rr() * 4 - 2, CHH + 7.2, LZ(-11)), m = tip.clone().lerp(b, 0.5); m.y -= 1.4; wires.push(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(tip, m, b), 12, 0.012, 3)); }
    prev = tip; }
  // the wires strung across the alleys, from wall to wall, sagging
  const span = (x0, z0, x1, z1, y, sag) => { const a = V3(LX(x0), y, LZ(z0)), b = V3(LX(x1), y, LZ(z1)), m = a.clone().lerp(b, 0.5); m.y -= sag; wires.push(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(a, m, b), 8, 0.012, 3)); };
  for (const z of [-13.5, -19, -23.5, -30.5]) span(-32, z, -27.5, z + 1.5, CHH + 7.5 + rr(), 0.6); for (const x of [-35, -41, -46.5]) span(x, -32, x - 1.2, -36.5, CHH + 7.8 + rr(), 0.5);
  if (wires.length) scene.add(onLayer1(new THREE.Mesh(mergeGeometries(wires, false), MAT.dark)));
  // market stalls, a bus stop, a fallen lamp post, street signs, posters
  const stall = (x, z, r, k) => { const c = [0x7a3a2a, 0x2f5a4a, 0x8a7a3a][k]; for (const [ox, oz] of [[-1.3, -0.8], [1.3, -0.8], [-1.3, 0.8], [1.3, 0.8]]) wood.push([G.box(0.07, 2.2, 0.07), 0x5a4430, M4(ox, 1.1, oz)]); wood.push([G.box(2.9, 0.06, 1.9), c, M4(0, 2.25, 0, 0.12, 0, 0)], [G.box(2.6, 0.75, 1.3), 0x6b5038, M4(0, 0.38, 0)]);
    for (let i = 0; i < 9; i++) wood.push([G.sph(0.12, 6, 5), [0xc8502a, 0xe0b030, 0x5a8a30][i % 3], M4(-1 + (i % 5) * 0.5, 0.86, -0.3 + Math.floor(i / 5) * 0.5)]);
    const g = build(wood.splice(0)); const m = new THREE.Mesh(g, MAT.vc); m.position.set(LX(x), CHH, LZ(z)); m.rotation.y = r; scene.add(SH(onLayer1(m))); addCollider(LX(x), LZ(z), 1.4, 0.9, r, CHH + 0.8); };
  stall(22, 9.7, 0, 0); stall(106, -9.7, Math.PI, 1); stall(-40, 21.5, 0.1, 2); stall(212, -9.7, Math.PI, 2);
  parts.push([G.box(3.6, 0.08, 1.6), 0x3a4a3a, M4(LX(204), CHH + 2.5, LZ(9.9))], [G.box(0.08, 2.5, 0.08), 0x2a2a28, M4(LX(202.4), CHH + 1.25, LZ(10.5))], [G.box(0.08, 2.5, 0.08), 0x2a2a28, M4(LX(205.6), CHH + 1.25, LZ(10.5))], [G.box(3.4, 0.45, 0.4), 0x6b5a40, M4(LX(204), CHH + 0.45, LZ(10.4))]);
  parts.push([G.cyl(0.08, 0.1, 7, 6), 0x4a4a46, M4(LX(35), CHH + 0.25, LZ(-9.2), 0, 0, Math.PI / 2 - 0.08)]);
  // benches, bollards and street cabinets round the square and along the avenue
  for (const [x, z, r] of [[-44, -21.6, 0], [-80.5, 21.6, Math.PI], [-46, 21.6, Math.PI], [52, 9.6, Math.PI], [140, -9.6, 0], [88, 9.6, Math.PI]]) { const c = Math.cos(r), s = Math.sin(r); parts.push([G.box(1.8, 0.06, 0.45), 0x6b5038, M4(LX(x), CHH + 0.45, LZ(z), 0, r, 0)], [G.box(1.8, 0.4, 0.05), 0x6b5038, M4(LX(x) + s * 0.22, CHH + 0.75, LZ(z) + c * 0.22, 0, r, 0)]); for (const o of [-0.8, 0.8]) parts.push([G.box(0.06, 0.45, 0.4), 0x2a2a28, M4(LX(x) + c * o, CHH + 0.22, LZ(z) - s * o, 0, r, 0)]); }
  for (let x = -82; x <= -38; x += 4) for (const z of [-22.3, 22.3]) if (Math.abs(x + 58) > 9) parts.push([G.cyl(0.11, 0.13, 0.85, 8), 0x8a8478, M4(LX(x), CHH + 0.42, LZ(z))]);
  for (const [x, z] of [[-35.5, -11.6], [0, 11.6], [100, -11.6], [176, 11.6]]) parts.push([G.box(0.8, 1.3, 0.45), 0x5a6a5e, M4(LX(x), CHH + 0.65, LZ(z))], [G.box(0.84, 0.06, 0.5), 0x4a564c, M4(LX(x), CHH + 1.33, LZ(z))]);
  const signTx = (t) => { const c = canvas(256, 96), g = c.getContext('2d'); g.fillStyle = '#1f4e8a'; g.fillRect(0, 0, 256, 96); g.strokeStyle = '#e8eef4'; g.lineWidth = 6; g.strokeRect(6, 6, 244, 84); g.fillStyle = '#f2f4f6'; g.font = 'bold 34px Arial'; g.textAlign = 'center'; g.direction = 'rtl'; g.fillText(t, 128, 60); return tex(c); };
  for (const [x, z, t, r] of [[-35, 10.5, 'شارع الأربعين', Math.PI], [97, -10.6, 'شارع الجيش', 0], [-49, -23.2, 'ميدان الأربعين', 0], [-31.6, -10.6, 'حارة السوق', 0]]) {
    parts.push([G.cyl(0.04, 0.04, 2.8, 6), 0x3a3a38, M4(LX(x), CHH + 1.4, LZ(z))]); const m = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.42), new THREE.MeshStandardMaterial({ map: signTx(t), side: THREE.DoubleSide, roughness: 0.6 })); m.position.set(LX(x), CHH + 2.6, LZ(z)); m.rotation.y = r; scene.add(onLayer1(m)); }
  const posterTx = (seed) => { const c = canvas(128, 176), g = c.getContext('2d'), r = rng(seed); g.fillStyle = ['#d8c79a', '#c9d6c2', '#e3c2a8'][seed % 3]; g.fillRect(0, 0, 128, 176); g.fillStyle = ['#8a2a22', '#1f4e3a', '#2a2a2a'][seed % 3]; g.fillRect(8, 8, 112, 60); g.fillStyle = '#f4ecd8'; g.font = 'bold 22px Arial'; g.textAlign = 'center'; g.direction = 'rtl'; g.fillText(['مصر', 'العبور', 'النصر'][seed % 3], 64, 46); g.fillStyle = '#2a2420'; for (let i = 0; i < 6; i++) g.fillRect(14, 84 + i * 13, 100 * (0.5 + r() * 0.5), 5); g.fillStyle = 'rgba(80,60,40,0.25)'; g.fillRect(0, 150, 128, 26); return tex(c); };
  for (const [x, z, r, sd] of [[30, -11.05, 0, 1], [33, -11.05, 0, 2], [88, 11.05, Math.PI, 3], [150, -11.05, 0, 5], [-31.95, -17.5, Math.PI / 2, 6], [-27.55, -22, -Math.PI / 2, 7], [-43, -31.95, 0, 8]]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.25), new THREE.MeshStandardMaterial({ map: posterTx(sd), roughness: 0.9 })); const n = V3(Math.sin(r), 0, Math.cos(r)); m.position.set(LX(x) + n.x * 0.02, CHH + 1.7, LZ(z) + n.z * 0.02); m.rotation.y = r; scene.add(onLayer1(m)); }
  // shell craters and scorch on the asphalt
  { const sm = new THREE.MeshStandardMaterial({ map: scorchTex(), transparent: true, depthWrite: false, roughness: 1 }); for (const [x, z, s] of [[130, -3, 3.2], [55, 1.5, 2.6], [14, -1.5, 3.0], [-48, -12, 3.4], [-62, 14, 2.8], [190, 3, 2.4], [-72, -4, 2.6], [-29.5, -17, 1.8], [-40, -34, 2.0], [-57, -36, 2.6]]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(s, s), sm); m.rotation.x = -Math.PI / 2; m.rotation.z = rr() * 6; m.position.set(LX(x), CHH + 0.04, LZ(z)); m.renderOrder = 1; scene.add(onLayer1(m)); } }
  // concertina wire across the alley mouths off the avenue
  for (const [x, z0, z1] of [[98.5, -12, -19], [130.5, 12, 19], [62.5, 12, 19], [160.5, -12, -19], [198.5, 12, 19]]) { szWire(ws, x, z0, x, z1); szBar(x, z0, x, z1); }
  // an Egyptian anti-tank gun dug in at the mouth of the north street, behind the square, aimed across it at the end of the avenue (it is the gun that stops the tank)
  { const gun = build([[G.box(0.5, 0.5, 1.1), 0x4a5038, M4(0, 0.85, 0)], [G.cyl(0.06, 0.07, 2.6, 10), 0x3a3e30, M4(0, 1.0, 1.6, Math.PI / 2, 0, 0)], [G.box(1.3, 0.9, 0.06), 0x4f5640, M4(0, 1.1, 0.35)], ...[-1, 1].map((sd) => [G.cyl(0.42, 0.42, 0.12, 12), 0x1a1a1a, M4(sd * 0.75, 0.42, 0, 0, 0, Math.PI / 2)]), ...[-1, 1].map((sd) => [G.box(0.08, 0.08, 2.2), 0x3a3e30, M4(sd * 0.35, 0.3, -1.2, 0, sd * 0.25, 0)])]);
    addProp(gun, SZ_GUN[0], SZ_GUN[1], SZ_GUN[2], [0.8, 1.3], 1.4); const arc = []; for (let t = 1.3; t <= 4.25; t += 0.25) arc.push([SZ_GUN[0] + Math.sin(t) * 2.1, SZ_GUN[1] - Math.cos(t) * 2.1]); bag(arc, 5); }
  /* ---- the barricades that make the route one: nobody walks past any of them ---- */
  // across the mouth of the square, where the avenue ends: concrete blocks, a burnt jeep, hedgehogs and wire. The tank halts at it, and from here on the square is a killing ground
  { const x = -36.4; blocks([[x, -10.3, 0.1], [x, -8.9, 0.6], [x, 1.8, 0.3], [x, 3.3, 0.8], [x, 9.6, 0.2]]); szWreck(x - 0.4, -2.6, Math.PI / 2 + 0.25, false); smokeColumn(LX(x - 0.4), LZ(-2.6), 2.5, false); szWire(ws, x + 0.9, -11, x + 0.9, 11); szBar(x + 0.2, -11.2, x + 0.2, 11.2, 0.95);
    if (mdlHas('hedgehog')) { const hm = []; for (const z of [5.3, 7.4, -6.6]) hm.push(M4(LX(x), CHH, LZ(z), 0, rr() * 3, 0)); for (const m of mdlInst('hedgehog', LITE ? 1 : 0, hm)) SZ.objs.push(m); } bag([[x - 0.4, 6.0], [x - 0.4, 8.6]], 5); }
  // across the north street at the mouth of the square: their sandbag line facing the square (the gun pit is in it); the men behind it have their backs to the alley we come out of
  bag([[-65.8, -26.3], [-60.4, -26.3]], 6); bag([[-55.6, -26.3], [-50.2, -26.3]], 6); szWire(ws, -66, -26.3, -50, -26.3, 1.55); szBar(-66, -26.3, -50, -26.3, 0.5);
  // further up the north street: their line facing south, which the counterattack comes to
  bag([[-65.8, -46.2], [-50.2, -46.2]], 6); szWire(ws, -66, -46.2, -50, -46.2, 1.55); szBar(-66, -46.2, -50, -46.2, 0.5);
  // in the square, the cover the attackers of the last stages run to: a sandbag wall on the west side, a sandbagged position by the west street
  bag([[-82, -6.5], [-75, -6.5]], 5); { const arc = []; for (let t = -1.2; t <= 1.21; t += 0.3) arc.push([-79 + Math.sin(t) * 1.7, 16 - Math.cos(t) * 1.7]); bag(arc, 4); }
  // the light well behind the corner building is walled off from the street
  parts.push([boxUV(LX(-66.3), LX(-66), CHH, CHH + 3.2, LZ(-39.6), LZ(-37.9), 3, 3), 0xc8bda4]); addCollider(LX(-66.15), LZ(-38.75), 0.15, 0.85, 0, CHH + 3.2);
  /* ---- the flanking route: the alley north off the avenue (N1) and the one west from it to the north street (BA1) ---- */
  // the Egyptian positions along it, each facing back down the alley at whoever comes: sandbags across part of it, crates and drums
  bag([[-31.8, -25.0], [-30.1, -25.0]], 4); bag([[-31.4, -35.2], [-28.4, -35.2]], 4); bag([[-49.2, -36.4], [-49.2, -35.4]], 5);
  if (mdlHas('f_crate_long') && mdlHas('f_crate_wood')) { const cm = [], cw = []; for (const [x, z, n, r] of [[-28.3, -27.6, 2, 0.1], [-42.5, -35.7, 3, Math.PI / 2], [-30.9, -14.6, 2, 0.4], [-52.2, -39.6, 2, Math.PI / 2 + 0.1]]) { for (let l = 0; l < n; l++) for (const o of [-0.15, 0.15]) cm.push(M4(LX(x) + Math.sin(r) * o, CHH + l * 0.26, LZ(z) + Math.cos(r) * o, 0, r + (rr() - 0.5) * 0.08, 0)); cw.push(M4(LX(x), CHH + n * 0.26, LZ(z), 0, r + 0.2, 0)); addCollider(LX(x), LZ(z), 0.62, 0.32, r, CHH + n * 0.26 + 0.23); coverBox(LX(x), LZ(z), 0.62, 0.32, r, n * 0.26 + 0.23); }
    for (const m of mdlInst('f_crate_long', LITE ? 1 : 0, cm)) SZ.objs.push(m); for (const m of mdlInst('f_crate_wood', LITE ? 1 : 0, cw)) SZ.objs.push(m); }
  drums(-42.5, -32.6, -42.5, -33.3); drums(-49.1, -32.3, -49.1, -33.1);
  for (const [x, z] of [[-31.4, -18.2], [-28.0, -31.6], [-37.2, -32.5], [-46.5, -36.0]]) drum(LX(x), LZ(z), DC[Math.floor(rr() * 4)], false, false);
  // a shot-up jeep of theirs nosed into the east side of the alley, and the rubble of a balcony that came down
  szWreck(-28.6, -20.4, 0.06, false); szRubble(rub, -31.0, -29.5, 14, 0.7, rr); szRubble(rub, -39, -36.0, 10, 0.6, rr); szRubble(rub, -45.5, -32.4, 8, 0.5, rr);
  // washing strung across the alleys between the balconies, with what was hung out on the last morning
  { const cl = []; for (const [x0, z0, x1, z1, y] of [[-32, -15.5, -27.5, -16.0, 7.0], [-32, -27.8, -27.5, -27.2, 7.4], [-37.0, -32, -36.4, -36.5, 7.2], [-44.0, -32, -44.6, -36.5, 7.0]]) { const n = 4; for (let i = 0; i < n; i++) { const u = (i + 0.7) / (n + 0.4), x = lerp(x0, x1, u), z = lerp(z0, z1, u); cl.push([planeAt(0.5 + rr() * 0.3, 0.6 + rr() * 0.4, LX(x), CHH + y - 0.45 - Math.sin(u * Math.PI) * 0.35, LZ(z), Math.atan2(x1 - x0, z1 - z0) + Math.PI / 2), CLOTHC[Math.floor(rr() * CLOTHC.length)]]); } const L = Math.hypot(x1 - x0, z1 - z0); parts.push([G.box(L, 0.014, 0.014), 0x1a1a1a, M4(LX((x0 + x1) / 2), CHH + y - 0.2, LZ((z0 + z1) / 2), 0, Math.atan2(-(z1 - z0), x1 - x0), 0)]); }
    if (cl.length) { const m = new THREE.Mesh(build(cl), new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, roughness: 1, map: TX.fabric })); scene.add(onLayer1(m)); SZ.objs.push(m); } }
  // lamps on brackets over the doors, and the doors themselves with their steps
  for (const [x, z, r] of [[-31.95, -19.5, Math.PI / 2], [-27.55, -16.5, -Math.PI / 2], [-27.55, -31.5, -Math.PI / 2], [-40.5, -32.05, 0], [-46.0, -36.45, Math.PI], [-35.0, -36.45, Math.PI]]) { const s = Math.sin(r), c = Math.cos(r), X = LX(x), Z = LZ(z);
    parts.push([G.box(0.06, 0.06, 0.5), 0x2a2a28, M4(X + s * 0.25, CHH + 3.3, Z + c * 0.25, 0, r, 0)], [G.cyl(0.11, 0.07, 0.18, 8), 0x3a3a36, M4(X + s * 0.5, CHH + 3.2, Z + c * 0.5)]);
    parts.push([G.box(1.3, 2.3, 0.08), 0x4e3a28, M4(X + s * 0.04, CHH + 1.15, Z + c * 0.04, 0, r, 0)], [G.box(1.6, 0.18, 0.12), 0xd8ccb2, M4(X + s * 0.06, CHH + 2.4, Z + c * 0.06, 0, r, 0)], [G.box(1.5, 0.14, 0.45), 0xa39b8c, M4(X + s * 0.22, CHH + 0.07, Z + c * 0.22, 0, r, 0)]); }
  SZ.ws = ws; SZ.rub = rub;
  if (dl) propSet('drum', dl, dt);
  if (parts.length) { const m = new THREE.Mesh(build(parts), MAT.vc); scene.add(SH(onLayer1(m))); }
  coverHere();
}
/* the wreck of the platoon's second tank (2ג), hit at the junction behind us, across the avenue with the rubble of a balcony and the wire either side
   of it: from the moment the crew bails out the way back is shut. Not there while the tank still drives (stages 0-1) */
function szBuildAve() {
  const g = new THREE.Group(), cols = [], rr = rng(77), rubP = [];
  if (typeof VEH_DATA !== 'undefined' && VEH_DATA.magach) { const r = vehModel('magach', 'f'); r.g.position.set(LX(-19.5), CHH, LZ(1.2)); r.g.rotation.y = 0.85 - Math.PI / 2; r.g.userData.vl.dead = true; wreckTilt(r.g, rr); g.add(r.g); }
  else { const m = new THREE.Mesh(TANK_GEO, MAT_BURNT); m.position.set(LX(-19.5), CHH, LZ(1.2)); m.rotation.y = 0.85 - Math.PI / 2; g.add(m); }
  cols.push(addCollider(LX(-19.5), LZ(1.2), 1.9, 3.5, 0.85, CHH + 2.4), szBar(-19.3, -11.2, -19.3, -1.0, 1.6, 1.6), szBar(-19.6, 4.0, -19.6, 11.2, 0.6));
  szRubble(rubP, -19.3, -8.5, 34, 1.15, rr); szRubble(rubP, -19.5, -3.5, 14, 0.8, rr);
  const ws = []; szWire(ws, -19.6, 4.2, -19.6, 11.0); if (ws.length) g.add(new THREE.Mesh(mergeGeometries(ws, false), MAT.wire));
  g.add(new THREE.Mesh(build(rubP), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, flatShading: true, map: TX.grime })));
  if (mdlHas('hedgehog')) for (const z of [6.2, 9.0]) { const h = mdlMesh('hedgehog', LITE ? 1 : 0); h.position.set(LX(-20.4), CHH, LZ(z)); h.rotation.y = z; g.add(h); }
  // it burnt out at the junction: smoke, no flames - a fire's light this close would outshine the afternoon
  smokeColumn(LX(-19.5), LZ(1.2), 3, false);
  SH(onLayer1(g)); g.visible = false; g.userData.dyn = true; scene.add(g); SZ.objs.push(g);
  SZ.ave = { g, cols, tops: cols.map((k) => k.top) }; szAveOn(false);
}
function szAveOn(on) { const A = SZ.ave; if (!A) return; A.g.visible = on; A.cols.forEach((k, i) => { k.top = on ? A.tops[i] : -1e4; }); if (SZ.aveW) SZ.aveW.on = on; }

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
    LIGHTS.fire.position.set(TANK.g.position.x, gy + 3, TANK.g.position.z); LIGHTS.fire.intensity = (MODE === 'suez' && SZ.stage >= 2 ? 90 : 22000) * (0.8 + 0.2 * Math.sin(GAME.t * 13)); }   // on foot in daylight, beside it: a glow, not a second sun
}
function tankHit(p, big = false, dmg = null, from = null) {   // from: where the shot came from (the shooter), for the hit-direction mark
  fxExplosion(p, big ? 1.4 : camera.position.distanceTo(p) < 4.5 ? 0.4 : 0.9); sndBoom(p, big ? 1.4 : 0.9); FX.shake = Math.max(FX.shake, big ? 1.1 : 0.6);
  if (!TANK.alive || GOD()) return; TANK.hp -= dmg ?? (big ? 60 : 11); if (P.mode === 'tank' && !P.crouch) hurtPlayer(rand(4, 9), from || p, true);
  else if (P.mode === 'tank' && P.alive && GAME.state === 'play' && !CINE.on) { $('#flashHit').style.opacity = '0.5'; showDmgDir(from || p); }   // down in the turret he is not hurt, but he still sees the hit and where it came from
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
  const o = camera.position.clone(), dir = (MODE === 'armor' && amLockShot()) || aimAssist(o, camForward(V3()), 0.12);   // the tank battle: the shell goes to the tank the sight is locked on
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
  else { const hp = tankHeadPos(), k = P.crouch ? 0 : 1 - P.ads * 2; tpvCam(hp, k); }   // a touch of third person: just behind and above the commander's helmet, head out of the hatch (ducked, he looks through the vision blocks)
  tpvBody(P.ads < 0.25 && !P.crouch && !CINE.on, tankHeadPos());
  { const hp = P.ads > 0.5 ? camera.position : tankHeadPos(); P.pos.set(hp.x, hp.y - 1.65, hp.z); } P.pitch = clamp(P.pitch, -0.55, 1.2);   // the player is at the cupola, wherever the eye is
  const sh = FX.shake; FX.shake = Math.max(0, FX.shake - dt * 1.8);
  camera.rotation.set(P.pitch + (sh ? rand(-sh, sh) * 0.03 : 0), P.yaw + (sh ? rand(-sh, sh) * 0.02 : 0), 0, 'YXZ');
  const fov = P.ads > 0.5 ? 13 : P.crouch ? 55 : 70; if (Math.abs(camera.fov - fov) > 0.05) { camera.fov = fov; camera.updateProjectionMatrix(); }
  vm.visible = false; $('#tsight').classList.toggle('on', P.ads > 0.5);
}
function bailOut() {
  if (SZ.stage !== 1 || SZ.bailed) return; SZ.bailed = true; TANK.alive = false; TANK.burning = true; TANK.hp = 0;
  const f = $('#fade'); f.style.transition = 'none'; f.style.opacity = '1'; P.crouch = false; P.mode = 'rifle'; P.ads = 0; INPUT.tAds = false; $('#tads').classList.remove('on');
  // the crew runs from the burning tank to the mouth of the alley while the screen is dark: that is where the flank starts
  const [ax, az, ah] = SZ_START[2], px = LX(ax), pz = LZ(az); P.pos.set(px, hAt(px, pz), pz); P.vy = 0; P.yaw = -THREE.MathUtils.degToRad(ah); P.pitch = 0; P.hp = Math.min(P.hp, 70); vm.visible = true; $('#tsight').classList.remove('on');
  requestAnimationFrame(() => requestAnimationFrame(() => { f.style.transition = 'opacity 1.4s'; f.style.opacity = '0'; }));
  radio('מ״פ', 'הטנק בוער! צאו ממנו! 2ג נפגע מאחורינו, הדרך חזרה חסומה. כולם לסמטה!', 4); szStage(2);
}

/* ---------- the corner building: three floors, a stairwell, real windows and doors ---------- */
const TB = { x0: -82, x1: -66, z0: -38, z1: -24, sx1: -77.4, sz1: -29.3, lane: -79.7, door: [-77.3, -75.3], ed: [-35.3, -33.7], floors: 3, fN: -36.4, fS: -30.9 };
function rugTex(seed, a, b) { const c = canvas(128, 192), g = c.getContext('2d'), r = rng(seed); g.fillStyle = a; g.fillRect(0, 0, 128, 192); g.strokeStyle = b; g.lineWidth = 6; g.strokeRect(8, 8, 112, 176); g.lineWidth = 2; g.strokeRect(18, 18, 92, 156); for (let i = 0; i < 7; i++) { g.save(); g.translate(64, 30 + i * 22); g.rotate(Math.PI / 4); g.strokeRect(-7, -7, 14, 14); g.restore(); } g.fillStyle = 'rgba(0,0,0,0.12)'; for (let i = 0; i < 400; i++) g.fillRect(r() * 128, r() * 192, 2, 2); return tex(c); }
function pictureTex(seed) { const c = canvas(96, 72), g = c.getContext('2d'), r = rng(seed); g.fillStyle = '#5a3a22'; g.fillRect(0, 0, 96, 72); const sky = g.createLinearGradient(0, 8, 0, 64); sky.addColorStop(0, ['#9cc0d8', '#e0b878', '#a8b8a0'][seed % 3]); sky.addColorStop(1, '#e8dcc0'); g.fillStyle = sky; g.fillRect(7, 7, 82, 58); g.fillStyle = ['#5a7a4a', '#8a6a3a', '#4a5a6a'][seed % 3]; g.beginPath(); g.moveTo(7, 65); for (let x = 7; x <= 89; x += 8) g.lineTo(x, 40 + r() * 18); g.lineTo(89, 65); g.fill(); return tex(c); }
function buildCornerBuilding() {
  const X = LX, Z = LZ, wallC = 0xd9ccb0, inC = [0xb9c4b0, 0xd2c2a4, 0xaab8bd], T = 0.3, parts = [], slabParts = [], FY = (i) => CHH + i * FLH, N = TB.fN, S = TB.fS;
  const wall = (x0, x1, z0, z1, y0, y1, c) => { parts.push([boxUV(X(x0), X(x1), y0, y1, Z(z0), Z(z1), 3, 3), c]); addCollider(X((x0 + x1) / 2), Z((z0 + z1) / 2), Math.abs(x1 - x0) / 2, Math.abs(z1 - z0) / 2, 0, y1, y0); };
  const wallLine = (axis, c0, a0, a1, y0, ops, col) => {
    let cur = a0; const H = FLH; const seg = (s0, s1, yb, yt) => { if (s1 - s0 < 0.02 || yt - yb < 0.02) return; if (axis === 'x') wall(s0, s1, c0 - T / 2, c0 + T / 2, yb, yt, col); else wall(c0 - T / 2, c0 + T / 2, s0, s1, yb, yt, col); };
    // a window gets a thin bar across it at 1.36-1.40 m: no jump clears it, so nobody leaves the building by a window, and it stops only the shots that pass through those 4 cm
    const bar = (s0, s1) => (axis === 'x' ? addCollider(X((s0 + s1) / 2), Z(c0), (s1 - s0) / 2, T / 2 + 0.08, 0, y0 + 1.40, y0 + 1.36) : addCollider(X(c0), Z((s0 + s1) / 2), T / 2 + 0.08, (s1 - s0) / 2, 0, y0 + 1.40, y0 + 1.36));
    for (const [o0, o1, sill, head] of ops.sort((a, b) => a[0] - b[0])) { seg(cur, o0, y0, y0 + H); seg(o0, o1, y0, y0 + sill); seg(o0, o1, y0 + head, y0 + H); if (sill > 0) bar(o0, o1); cur = o1; }
    seg(cur, a1, y0, y0 + H);
  };
  const win = (c) => [c - 0.65, c + 0.65, 0.95, 2.75], door = (a, b) => [a, b, 0, 2.6];
  for (let f = 0; f < 3; f++) {
    const y = FY(f), c = inC[f];
    wallLine('x', TB.z1, TB.x0, TB.x1, y, f === 0 ? [door(TB.door[0], TB.door[1]), win(-71), win(-68.3)] : [win(-80.5), win(-75.5), win(-71), win(-68.3)], wallC);
    wallLine('x', TB.z0, TB.x0, TB.x1, y, [win(-75), win(-70)], wallC);
    wallLine('z', TB.x1, TB.z0, TB.z1, y, f === 0 ? [door(TB.ed[0], TB.ed[1]), win(-27.2)] : [win(-34.5), win(-27.2)], wallC);   // the side door on the north street, where the flank comes in
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
  for (const [a, b, cc, d] of [[TB.x0, TB.x1, TB.z1 - 0.15, TB.z1 + 0.15], [TB.x0, TB.x1, TB.z0 - 0.15, TB.z0 + 0.15], [TB.x0 - 0.15, TB.x0 + 0.15, TB.z0, TB.z1], [TB.x1 - 0.15, TB.x1 + 0.15, TB.z0, TB.z1]]) { wall(a, b, cc, d, RY, RY + 1.0, wallC); addCollider(X((a + b) / 2), Z((cc + d) / 2), Math.abs(b - a) / 2, Math.abs(d - cc) / 2, 0, RY + 1.40, RY + 1.36); }   // nobody jumps the parapet either
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
    const FACES = [['x', TB.z1, 1, TB.x0, TB.x1, (f) => (f === 0 ? [-71, -68.3] : [-80.5, -75.5, -71, -68.3])], ['x', TB.z0, -1, TB.x0, TB.x1, () => [-75, -70]], ['z', TB.x1, 1, TB.z0, TB.z1, (f) => (f === 0 ? [-27.2] : [-34.5, -27.2])], ['z', TB.x0, -1, TB.z0, TB.z1, () => [-26.8]]];
    const BAND = 0xc6b898, TRIM = 0xe4dac4, SHUT = [0x5e4630, 0x4f5f49, 0x6b5238, 0x55606a], sr = rng(73);
    for (const [ax, c0, sg, a0, a1, wins] of FACES) {
      const e = ax === 'x' ? T / 2 + 0.14 : 0, b0 = a0 - e, b1 = a1 + e;
      for (let f = 1; f <= 3; f++) out(ax, c0, sg, b0, b1, FY(f) - 0.12, FY(f) + 0.16, 0, 0.12, BAND);
      out(ax, c0, sg, b0 - (ax === 'x' ? 0.06 : 0), b1 + (ax === 'x' ? 0.06 : 0), RY + 0.84, RY + 1.06, 0, 0.18, BAND);
      if (ax === 'x' && sg > 0) { out(ax, c0, sg, b0, TB.door[0] - 0.12, CHH, CHH + 0.8, 0, 0.05, 0xa89a80); out(ax, c0, sg, TB.door[1] + 0.12, b1, CHH, CHH + 0.8, 0, 0.05, 0xa89a80);
        out(ax, c0, sg, TB.door[0] - 0.14, TB.door[1] + 0.14, CHH + 2.6, CHH + 2.8, 0, 0.1, TRIM); for (const d of [TB.door[0] - 0.14, TB.door[1]]) out(ax, c0, sg, d, d + 0.14, CHH, CHH + 2.6, 0, 0.08, TRIM); }
      else if (ax === 'z' && sg > 0) { out(ax, c0, sg, b0, TB.ed[0] - 0.12, CHH, CHH + 0.8, 0, 0.05, 0xa89a80); out(ax, c0, sg, TB.ed[1] + 0.12, b1, CHH, CHH + 0.8, 0, 0.05, 0xa89a80);
        out(ax, c0, sg, TB.ed[0] - 0.14, TB.ed[1] + 0.14, CHH + 2.6, CHH + 2.8, 0, 0.1, TRIM); for (const d of [TB.ed[0] - 0.14, TB.ed[1]]) out(ax, c0, sg, d, d + 0.14, CHH, CHH + 2.6, 0, 0.08, TRIM); }
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
  const solid = (x, z, hx, hz, rot, y, h, f, cover, open = false) => { if (open) addOpenCollider(X(x), Z(z), hx, hz, rot, y + h, y - 0.1); else addCollider(X(x), Z(z), hx, hz, rot, y + h, y - 0.1); if (!cover) return; const k0 = COVER.length; coverBox(X(x), Z(z), hx, hz, rot, h); for (let i = k0; i < COVER.length; i++) { COVER[i].y = FY(f); COVER[i].floor = f; SZ.covers.push(COVER[i]); } };
  // a model: x, z in the plan, on floor f (y0 over it), turned ry (0: its front to the street). block 1: it blocks, sized from the model's own box;
  // 2: and gives cover. Each copy is an instance, all of a model drawn at once at the end. Returns the height of its top (0 when the build lacks it)
  const fm = (name, x, z, f, ry = 0, block = 0, y0 = 0) => {
    if (!mdlHas(name)) return 0; const b = mdlBox(name), y = FY(f) + y0;
    (FM[name] = FM[name] || []).push(M4(X(x), y, Z(z), 0, ry, 0));
    if (block) solid(x, z, b[0] / 2, b[2] / 2, ry, y, b[1], f, block > 1, OPEN_FURN.test(name));
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
  bags(-74, -24.6, -70, -24.6, 3, 4); bags(-66.6, -30, -66.6, -27, 3, 4); B(-70.0, FY(3) + 0.9, -34.5, 1.6, 1.8, 1.6, 0x8b8a84); solid(-70.0, -34.5, 0.8, 0.8, 0, FY(3), 1.8, 3, true);
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
  for (const [g, k] of soft) { const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: rugs[k], roughness: 1 })); scene.add(onLayer1(m)); SZ.objs.push(m); m.receiveShadow = SHADOWS; }
  for (const [g, k] of pics) { const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: pictureTex(k), roughness: 0.7 })); scene.add(onLayer1(m)); SZ.objs.push(m); }
  const sg = sign('عمارة الأربعين', 'plain', X(-76.3), CHH + 2.9, Z(TB.z1) + 0.2, 0, 1.4); SZ.objs.push(sg);
  szAidBuild(FY); szDoorsBuild(FY);
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
/* ---------- the doors of the corner building: shut until the fight comes to them, so the building is taken in one order only (szCqUpd). A door is a
   leaf on its hinge and a collider in its doorway, which stops men and bullets while it is shut; a barricade (sandbags and furniture across the
   foot of a flight) is the same with no hinge. id: [axis of its wall ('x': along x at z = c, 'z': along z at x = c), c, a0, a1, floor, the way it swings] */
const SZ_DOORS = { E: ['z', -66, -35.3, -33.7, 0, -1], P0: ['z', -71.6, -35.5, -33.8, 0, -1], W0: ['x', -29.3, -74.6, -72.8, 0, -1], S0: ['x', -29.3, -81.6, -79.95, 0, 1], A0: ['x', -29.3, -70.2, -68.4, 0, 1], FD: ['x', -24, -77.3, -75.3, 0, 1],
  F1: ['z', -77.4, -37.8, -36.5, 1, 1], P1: ['z', -71.6, -35.5, -33.8, 1, 1], A1: ['x', -29.3, -70.2, -68.4, 1, -1], W1: ['x', -29.3, -74.6, -72.8, 1, 1],
  S2: ['x', -29.3, -79.5, -77.65, 2, -1], W2: ['x', -29.3, -74.6, -72.8, 2, 1], P2: ['z', -71.6, -35.5, -33.8, 2, 1], A2: ['x', -29.3, -70.2, -68.4, 2, -1], RD: ['z', -77.4, -37.8, -36.5, 3, 1] };
const SZ_BARR = { SB: [-79.7, -77.4, -36.45, -35.65, 1], SA: [-82, -79.7, -31.65, -30.85, 2] };   // the foot of the flight to floor 2 (at floor 1), and of the flight to the roof (at floor 2)
const SZD = {};
function szDoorsBuild(FY) {
  const wm = new THREE.MeshStandardMaterial({ color: 0x7a5636, roughness: 0.8, map: TX.wood });
  for (const id in SZ_DOORS) {
    const [ax, c, a0, a1, f, sw] = SZ_DOORS[id], y = FY(f), w = a1 - a0, piv = new THREE.Group(), leaf = new THREE.Mesh(new THREE.BoxGeometry(w - 0.06, 2.52, 0.06), wm);
    leaf.position.set(w / 2, 1.27, 0); piv.add(leaf); leaf.add(new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.12), MAT.metal).translateX(w / 2 - 0.16));
    const base = ax === 'x' ? 0 : -Math.PI / 2; if (ax === 'x') piv.position.set(LX(a0), y, LZ(c)); else piv.position.set(LX(c), y, LZ(a0)); piv.rotation.y = base;
    const col = ax === 'x' ? addCollider(LX((a0 + a1) / 2), LZ(c), w / 2, 0.22, 0, y + 2.62, y - 0.1) : addCollider(LX(c), LZ((a0 + a1) / 2), 0.22, w / 2, 0, y + 2.62, y - 0.1);
    scene.add(SH(onLayer1(piv))); SZ.objs.push(piv); SZD[id] = { piv, col, top: col.top, base, sw, open: false, x: ax === 'x' ? (a0 + a1) / 2 : c, z: ax === 'x' ? c : (a0 + a1) / 2, f };
  }
  for (const id in SZ_BARR) {
    const [x0, x1, z0, z1, f] = SZ_BARR[id], y = FY(f), g = new THREE.Group(), parts = [], rr = rng(id.charCodeAt(1));
    for (let l = 0; l < 7; l++) for (let i = 0; i < 4; i++) { const u = (i + (l % 2) * 0.5 + 0.25) / 4; if (u > 1) continue; parts.push([G.box(0.56, 0.2, 0.34), 0xb7a47c, M4(LX(lerp(x0, x1, u)), y + 0.1 + l * 0.2, LZ((z0 + z1) / 2 + (rr() - 0.5) * 0.12), 0, (rr() - 0.5) * 0.2, 0)]); }
    parts.push([G.box(0.6, 1.9, 0.5), 0x5a4030, M4(LX((x0 + x1) / 2), y + 0.25, LZ(z0 - 0.1), Math.PI / 2 - 0.2, 0.3, 0)], [G.box(0.45, 0.05, 0.45), 0x6b5038, M4(LX(x0 + 0.4), y + 1.55, LZ(z1), 0.4, 0.5, 0.2)]);
    g.add(new THREE.Mesh(build(parts), MAT.vc)); const col = addCollider(LX((x0 + x1) / 2), LZ((z0 + z1) / 2), (x1 - x0) / 2, (z1 - z0) / 2, 0, y + 2.0, y - 0.1);
    g.userData.dyn = true; scene.add(SH(onLayer1(g))); SZ.objs.push(g); SZD[id] = { piv: g, col, top: col.top, bar: true, open: false, x: (x0 + x1) / 2, z: (z0 + z1) / 2, f };
  }
}
function szDoor(id, open) { const d = SZD[id]; if (!d || d.open === open) return; d.open = open; d.col.top = open ? -1e4 : d.top; if (d.bar) d.piv.visible = !open; else d.piv.rotation.y = d.base + (open ? d.sw * 1.48 : 0); }
// the doors as each stage begins: all shut before the building is entered; in the fight for it only the side door is open; in its defence all open but the
// barricade to the floors above (the defence is fought from the first floor) and the doors to the street and to the stairwell below, which open only for
// an Egyptian in them (szAutoDoor) - so the player stays on the first floor while the raiders can still get at the wounded
const SZ_AUTO = ['S0', 'FD', 'E'];
function szDoorsStage(i) { for (const id in SZD) szDoor(id, i >= 5 ? !['A0', 'SB', ...SZ_AUTO].includes(id) : i === 4 ? id === 'E' : false); }
function szAutoDoor(dt) {
  for (const id of SZ_AUTO) { const d = SZD[id]; if (!d) continue; const x = LX(d.x), z = LZ(d.z); let near = false;
    for (const e of UNITS.enemies) if (e.alive && e.sz && Math.abs(e.pos.y - CHH) < 1.6 && Math.hypot(e.pos.x - x, e.pos.z - z) < 2.8) { near = true; break; }
    if (near) { if (!d.open) { szDoor(id, true); sndBoom(V3(x, CHH + 1.2, z), 0.25); } d.autoT = 1.5; continue; }
    d.autoT = (d.autoT || 0) - dt; if (d.open && d.autoT <= 0 && Math.hypot(P.pos.x - x, P.pos.z - z) > 1.4) szDoor(id, false); }
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
function szFortWindows(B) {
  const bags = [], slabs = [];
  B.forEach((b) => {
    const faces = szFaces(b);
    for (const [fi, f, a, open] of b.fortL) {
      const [fx, fz] = faces[fi], horiz = fz !== 0, fc = faceInfo(b, faces[fi]).fc, tx = horiz ? 1 : 0, tz = horiz ? 0 : 1;
      const X = LX(horiz ? a : fc), Z = LZ(horiz ? fc : a), y = CHH + f * FLH, W = (al, out) => [X + tx * al + fx * out, Z + tz * al + fz * out];
      const ab = (al0, al1, o0, o1, y0, y1, tw, th) => { const [ax, az] = W(al0, o0), [bx, bz] = W(al1, o1); return boxUV(Math.min(ax, bx), Math.max(ax, bx), y0, y1, Math.min(az, bz), Math.max(az, bz), tw, th); };
      const col = (al, out, ha, ho, top, bot) => { const [cx, cz] = W(al, out); addCollider(cx, cz, horiz ? ha : ho, horiz ? ho : ha, 0, top, bot); };
      // over a narrow alley a window has no sandbags (from the alley below they would hide him completely): a bare ledge, and he leans out of the window to fire
      if (open) { slabs.push([ab(-1.1, 1.1, 0, 0.62, y - 0.15, y + 0.01, 3, 3), 0xc9bea6]); const s = { x: X, z: Z, y, nx: fx, nz: fz, f, b, used: false, open: true }; s.p = W(0, 0.42); s.h = W(0, 0.2); SZ.slots.push(s); continue; }
      slabs.push([ab(-1.25, 1.25, 0, 1.18, y - 0.17, y + 0.01, 3, 3), 0xc9bea6]);
      bags.push(ab(-1.14, 1.14, 0.74, 1.14, y, y + 0.95, 1.1, 0.95)); for (const sd of [-1, 1]) bags.push(ab(sd * 0.8, sd * 1.14, 0.12, 0.74, y, y + 0.95, 1.1, 0.95));
      col(0, 0.94, 1.14, 0.2, y + 0.95, y - 0.25); for (const sd of [-1, 1]) col(sd * 0.97, 0.43, 0.17, 0.31, y + 0.95, y - 0.25);
      const s = { x: X, z: Z, y, nx: fx, nz: fz, f, b, used: false, fort: true }; s.p = W(0, 0.5); s.h = W(0, 0.42); SZ.slots.push(s);
    }
    // the roof: behind the parapet (0.9 m), standing to fire over it, crouching behind it
    if (b.ruin) return; const [fx, fz] = b.face, horiz = fz !== 0, fc = faceInfo(b).fc, a0 = horiz ? b.x0 : b.z0, a1 = horiz ? b.x1 : b.z1;
    for (let a = a0 + 2; a < a1 - 1.5; a += 5) { const px = horiz ? a : fc, pz = horiz ? fc : a; const s = { x: LX(px), z: LZ(pz), y: CHH + b.fl * FLH, nx: fx, nz: fz, f: b.fl, b, roof: true, used: false }; s.p = [s.x - fx * 0.62, s.z - fz * 0.62]; s.h = [s.x - fx * 0.8, s.z - fz * 0.8]; SZ.slots.push(s); }
  });
  if (slabs.length) { const m = new THREE.Mesh(build(slabs), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9, map: TX.grime })); scene.add(SH(onLayer1(m))); }
  if (bags.length) { const t = sandbagTex(); const m = new THREE.Mesh(mergeGeometries(bags, false), new THREE.MeshStandardMaterial({ map: t, bumpMap: t, bumpScale: LITE ? 0.8 : 1.6, roughness: 0.97 })); scene.add(SH(onLayer1(m))); }
}
// the fortified window nearest a point of the plan on floor f (the scripted encounters name their windows by place)
function szSlot(lx, lz, f) { let best = null, bd = 2.5; for (const s of SZ.citySlots || SZ.slots) { if (s.roof || s.ground || s.f !== f) continue; const d = Math.hypot(s.x - LX(lx), s.z - LZ(lz)); if (d < bd) { bd = d; best = s; } } return best; }

/* ---------- the city ---------- */
/* the square and the quarter round it (local). forts: the windows the Egyptians hold, [face (0 face, 1 f2), floor, window index, 'o': open - a bare ledge over an alley]; a block
   without the list gets its fortified windows by lot. The flanking route runs through the quarter: the alley N1 north off the avenue
   (x -32..-27.5) and the alley BA1 west from it to the north street (z -36.5..-32); every other way out of them is a wall */
const SZ_QB = [
  { x0: -50, x1: -32, z0: -32, z1: -24, fl: 4, v: 1, face: [0, 1], f2: [0, -1], forts: [[0, 1, 1], [0, 2, 3], [0, 3, 2], [1, 1, 1, 'o'], [1, 2, 0, 'o']], alley: [1] },   // the north-east corner of the square; its back on BA1
  { x0: -36, x1: -32, z0: -24, z1: -11, fl: 3, v: 4, face: [-1, 0], f2: [1, 0], forts: [[0, 1, 1], [0, 2, 0]], alley: [1] },   // a narrow house between the square and N1
  { x0: -50, x1: -36, z0: 24, z1: 40, fl: 3, v: 2, face: [0, -1] }, { x0: -84, x1: -66, z0: 24, z1: 40, fl: 4, v: 3, face: [0, -1] },   // the south side of the square
  { x0: -98, x1: -82, z0: -24, z1: -9, fl: 3, v: 0, face: [1, 0] }, { x0: -98, x1: -82, z0: 9, z1: 24, fl: 5, v: 2, face: [1, 0] },   // the west side
  { x0: -27.5, x1: -15, z0: -27, z1: -11, fl: 4, v: 2, face: [0, 1], f2: [-1, 0], forts: [[0, 1, 1], [0, 2, 0], [1, 2, 0, 'o']], alley: [1] },   // the first house of the avenue, on N1
  { x0: -27.5, x1: -15, z0: -36.5, z1: -27, fl: 3, v: 5, face: [-1, 0], forts: [[0, 1, 0, 'o']], alley: [0] },   // on N1, behind it
  { x0: -38, x1: -20, z0: -50, z1: -36.5, fl: 2, v: 0, face: [0, 1], forts: [[0, 1, 2], [0, 1, 0, 'o']], alley: [0] },   // shuts N1 at the bend
  { x0: -50, x1: -38, z0: -58, z1: -36.5, fl: 3, v: 3, face: [0, 1], f2: [-1, 0], forts: [[0, 2, 1, 'o'], [0, 1, 0, 'o'], [1, 1, 3, 'o']], alley: [0] },   // on BA1 and the north street
  { x0: -98, x1: -84, z0: -42, z1: -24, fl: 4, v: 1, face: [1, 0], forts: [] },   // west of the corner building, across the walled passage
  { x0: -84, x1: -66, z0: -60, z1: -39.5, fl: 3, v: 4, face: [1, 0], forts: [[0, 1, 3, 'o'], [0, 2, 4, 'o']] },   // across the light well from the corner building, on the north street
];
const szNearRoute = (x, z) => Math.min(Math.abs(z) + (x < -36 ? -36 - x : x > 245 ? x - 245 : 0), Math.max(0, Math.abs(x + 58) - 8) + Math.max(0, Math.abs(z) - 105), Math.max(0, -84 - x, x + 36) + Math.max(0, Math.abs(z) - 24));
function szFortPlan(B, nAve) {
  const fr = rng(4173);
  B.forEach((b, bi) => { b.fortL = []; b.fortSet = new Set();
    szFaces(b).forEach((face, fi) => { const FI = faceInfo(b, face);
      if (b.forts) { for (const [ffi, f, wi, o] of b.forts) if (ffi === fi && FI.wins[wi] !== undefined && f < b.fl) b.fortL.push([fi, f, FI.wins[wi], !!o]); }
      else if (fi === 0) for (let f = 1; f < Math.min(b.fl, 4); f++) { const ws = FI.wins.filter(() => fr() < (bi >= nAve ? 0.5 : 0.36)); if (!ws.length && FI.wins.length && fr() < 0.7) ws.push(FI.wins[Math.floor(fr() * FI.wins.length)]); for (const a of ws) b.fortL.push([fi, f, a]); } });
    for (const [fi, f, a] of b.fortL) b.fortSet.add(fi + ':' + f + ':' + a.toFixed(2)); });
}
function buildSuez() {
  if (SZ.built) return; SZ.built = true; const k0 = scene.children.length;
  const PL = ['#e8dcc0', '#d8bf8c', '#e6c9b8', '#cdd2c6', '#ece4d2', '#c9b27e'], SH_ = ['#3f6b4e', '#5b4630', '#3d5b6b', '#6d6248', '#2f4f3a', '#6b3a2a'];
  const lists = { ground: [], groundR: [], upper: [], upperD: [], roof: [], roofTop: [], trim: [] }, gMats = [], uMats = [], dMats = [], rMats = [];
  const wallMat = (t) => new THREE.MeshStandardMaterial({ map: t, bumpMap: bumpOf(t), bumpScale: LITE ? 0.8 : 1.4, roughness: 0.93, vertexColors: true });
  for (let i = 0; i < 6; i++) { gMats.push(wallMat(facadeTile(300 + i, PL[(i + 3) % 6], SH_[i], true))); uMats.push(wallMat(facadeTile(400 + i, PL[i], SH_[(i + 1) % 6], false))); dMats.push(wallMat(facadeTile(500 + i, PL[i], SH_[i], false, true))); rMats.push(wallMat(facadeTile(600 + i, PL[(i + 3) % 6], SH_[(i + 2) % 6], true, 'res'))); lists.groundR.push([]); lists.ground.push([]); lists.upper.push([]); lists.upperD.push([]); }
  const B = [], rr = rng(1973);
  const lotRow = (xA, xB, zIn, zOut, side, gaps) => { let x = xA; while (x < xB - 6) { const w = Math.min(xB - x, 12 + rr() * 9); if (gaps.some(([g0, g1]) => x < g1 && x + w > g0)) { x += 4; continue; } const d = 12 + rr() * 5; B.push({ x0: x, x1: x + w, z0: side < 0 ? zIn - d : zIn, z1: side < 0 ? zIn : zIn + d, fl: 2 + Math.floor(rr() * 5), v: Math.floor(rr() * 6), face: side < 0 ? [0, 1] : [0, -1] }); x += w + (rr() < 0.25 ? 5 : 0.2); } };
  // the avenue (Sharia el-Arbaeen) from the east entrance to the square; three of its houses lost their top floor to the shelling
  lotRow(-15, 240, -11, 0, -1, [[96, 101], [158, 163]]); lotRow(-36, 240, 11, 0, 1, [[60, 65], [128, 133], [196, 201]]); const nAve = B.length;
  for (const i of [3, 10, 17]) { const b = B[i]; if (b && b.fl >= 3) { b.fl--; b.ruin = true; } }
  for (const q of SZ_QB) B.push({ ...q });
  // the north street and the south street off the square
  for (const [z0, z1] of [[-100, -82], [-80, -62], [40, 58], [60, 80], [82, 100]]) B.push({ x0: -84, x1: -66, z0, z1, fl: 2 + Math.floor(rr() * 3), v: Math.floor(rr() * 4), face: [1, 0] });
  for (const [z0, z1] of [[-100, -82], [-80, -60], [40, 58], [60, 80], [82, 100]]) B.push({ x0: -50, x1: -32, z0, z1, fl: 2 + Math.floor(rr() * 3), v: Math.floor(rr() * 4), face: [-1, 0] });
  const D = { trim: lists.trim, rail: [], cloth: [], awn: [[], [], []], win: [[], [], []], sh: [], holes: [], soot: [], rub: [], blade: [[], [], [], []] }, rub = [];
  szFortPlan(B, nAve);
  for (const b of B) { b.style = rr() < 0.3 ? 2 : rr() < 0.55 ? 1 : 0; cityBuilding(b, lists); decorate(b, D, rr, lists); if (b.ruin) szRuinTop(b, lists, rr, rub); }
  /* the rest of the city fills every block behind the streets, so no alley or gap looks out onto empty ground: houses of two to six floors (now and
     then a taller one), a third of them with a floor or two set back on the roof, each with its parapet and cornice, its water tanks and aerials.
     A block out of sight of the streets keeps only the parapet and the cornice */
  { const occ = (x0, x1, z0, z1) => B.some((b) => x0 < b.x1 + 2.5 && x1 > b.x0 - 2.5 && z0 < b.z1 + 2.5 && z1 > b.z0 - 2.5) || (x1 > -112 && x0 < 252 && z0 < 12 && z1 > -12) || (x1 > -100 && x0 < -30 && z0 < 42 && z1 > -42) || (x1 > -70 && x0 < -46 && z0 < 120 && z1 > -120) || (x1 > -88 && x0 < -60 && z0 < -18 && z1 > -44);
    // one house of the fill: its walls, its shell, a floor or two set back on its roof now and then, its roof clutter, its collider
    const house = (x0, x1, z0, z1, fl, v, near) => { const w = x1 - x0, d = z1 - z0, top = CHH + fl * FLH, X0 = LX(x0), X1 = LX(x1), Z0 = LZ(z0), Z1 = LZ(z1);
      lists.upper[v].push(aoBox(szWallBox(X0, X1, CHH - 0.3, top, Z0, Z1, 7, FLH), CHH - 0.3, top, 0.66, 0.86)); szShell(X0, X1, Z0, Z1, top, fl, SZ_PL[v], SZ_TRIM[v % 4], lists, near && !LITE);
      let tt = top + 0.9;
      if (w > 9 && d > 9 && rr() < 0.33 && fl < 7) { const k = 1 + Math.floor(rr() * 2), sx = w * (0.45 + rr() * 0.25), sd = d * (0.45 + rr() * 0.25), ax = x0 + 1 + rr() * (w - sx - 2), az = z0 + 1 + rr() * (d - sd - 2), t2 = top + k * FLH, v2 = (v + 2) % 6, A0 = LX(ax), A1 = LX(ax + sx), C0 = LZ(az), C1 = LZ(az + sd);
        lists.upper[v2].push(aoBox(szWallBox(A0, A1, top, t2, C0, C1, 7, FLH), top, t2, 0.8, 0.86)); szShell(A0, A1, C0, C1, t2, 0, SZ_PL[v2], SZ_TRIM[v % 4], lists, false); if (near || rr() < 0.4) szRoofLife(A0, A1, C0, C1, t2, rr, lists.roof, false); tt = t2 + 0.9; }
      if (near || rr() < 0.35) szRoofLife(X0, X1, Z0, Z1, top, rr, lists.roof, false);
      addCollider((X0 + X1) / 2, (Z0 + Z1) / 2, w / 2, d / 2, 0, tt); SZ.blocks.push([X0, X1, Z0, Z1, top]); };
    for (let x = -262; x < 262; x += 24) for (let z = -262; z < 262; z += 24) {
      const w = 14 + rr() * 8, d = 14 + rr() * 8, x0 = x + rr() * 3, z0 = z + rr() * 3; if (occ(x0, x0 + w, z0, z0 + d)) continue;
      const fl = 2 + Math.floor(rr() * 4) + (rr() < 0.1 ? 2 : 0), v = Math.floor(rr() * 6), near = szNearRoute(x0 + w / 2, z0 + d / 2) < 60;
      // two out of five blocks are two houses back to back, of different heights and plasters, so the skyline steps
      if (rr() < 0.4) { const u = 0.4 + rr() * 0.2, fl2 = clamp(fl + (rr() < 0.5 ? -1 : 2), 2, 7), v2 = (v + 1 + Math.floor(rr() * 4)) % 6;
        if (w >= d) { const xm = x0 + w * u; house(x0, xm, z0, z0 + d, fl, v, near); house(xm, x0 + w, z0, z0 + d, fl2, v2, near); }
        else { const zm = z0 + d * u; house(x0, x0 + w, z0, zm, fl, v, near); house(x0, x0 + w, zm, z0 + d, fl2, v2, near); } }
      else house(x0, x0 + w, z0, z0 + d, fl, v, near); } }
  for (let i = 0; i < 6; i++) for (const [L, M] of [[lists.ground[i], gMats[i]], [lists.groundR[i], rMats[i]], [lists.upper[i], uMats[i]], [lists.upperD[i], dMats[i]]]) if (L.length) { const m = new THREE.Mesh(mergeGeometries(L, false), M); scene.add(SH(onLayer1(m))); }
  { const m = new THREE.Mesh(mergeGeometries(lists.roofTop, false), new THREE.MeshStandardMaterial({ map: szRoofTex(), roughness: 0.96 })); m.receiveShadow = SHADOWS; scene.add(onLayer1(m)); }
  { const m = new THREE.Mesh(build(lists.roof), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9, map: TX.grime })); scene.add(SH(onLayer1(m))); }
  // the windows: frames and their shutters as instances, one draw for each kind over the whole city; the shell holes and the soot as decals on the walls
  { const wm = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.86, map: TX.grime }); D.win.forEach((L, k) => { if (L.length) szInst(szWinGeo(k), wm, L); });
    if (D.sh.length) szInst(new THREE.BoxGeometry(0.78, 2.5, 0.04), new THREE.MeshStandardMaterial({ map: szLouverTex(), roughness: 0.8 }), D.sh);
    for (const [L, t] of [[D.holes, szHoleTex()], [D.soot, szSootTex()]]) if (L.length) { const m = new THREE.Mesh(mergeGeometries(L, false), new THREE.MeshStandardMaterial({ map: t, transparent: true, depthWrite: false, roughness: 1, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 })); m.renderOrder = 1; scene.add(onLayer1(m)); }
    for (const [x, z, s] of D.rub) for (let i = 0; i < 6; i++) rub.push([new THREE.DodecahedronGeometry(0.12 + rr() * 0.22 * s, 0).translate(x + (rr() - 0.5) * s * 1.4, CHH + 0.08, z + (rr() - 0.5) * s * 0.9), rr() < 0.5 ? 0xb9ad94 : 0x9a5a40]); }
  ['صيدلية', 'مكتبة', 'مطعم', 'فندق'].forEach((t, i) => { if (!D.blade[i].length) return; const c = canvas(128, 80), g = c.getContext('2d'); g.fillStyle = ['#2f5d4a', '#7a2e22', '#1f4e8a', '#8a6a2a'][i]; g.fillRect(0, 0, 128, 80); g.strokeStyle = '#e8e0cc'; g.lineWidth = 4; g.strokeRect(4, 4, 120, 72); g.fillStyle = '#f2ecdc'; g.font = 'bold 30px Arial'; g.textAlign = 'center'; g.direction = 'rtl'; g.fillText(t, 64, 52);
    const m = new THREE.Mesh(mergeGeometries(D.blade[i], false), new THREE.MeshStandardMaterial({ map: tex(c), roughness: 0.7 })); scene.add(SH(onLayer1(m))); });
  if (D.rail.length) { const rt = railTex(); const m = new THREE.Mesh(mergeGeometries(D.rail, false), new THREE.MeshStandardMaterial({ map: rt, alphaTest: 0.5, side: THREE.DoubleSide, color: 0x2e2c28, roughness: 0.6, metalness: 0.4 })); scene.add(SH(onLayer1(m))); }
  if (D.cloth.length) { const m = new THREE.Mesh(build(D.cloth), new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, roughness: 1, map: TX.fabric })); scene.add(SH(onLayer1(m))); }
  [['#2f6a4a', '#e9e2d0'], ['#9a2f26', '#ece4d4'], ['#2c4f7a', '#e6e0d0']].forEach(([a, c], i) => { if (!D.awn[i].length) return; const m = new THREE.Mesh(mergeGeometries(D.awn[i].map((g) => g.toNonIndexed()), false), new THREE.MeshStandardMaterial({ map: stripeTex(a, c), side: THREE.DoubleSide, roughness: 0.95 })); scene.add(SH(onLayer1(m))); });
  // where the defenders fight from: only the windows they have sandbagged (a ledge out from the wall with bags round its edge) and the roofs.
  // A man stands to fire over the bags or the parapet and crouches behind them to take cover - nobody ducks back into a wall
  szFortWindows(B);
  const BAGS = [], svBag = BATCH.bag; BATCH.bag = BAGS;
  buildCornerBuilding();
  // streets: asphalt for the avenue, the square, the north and south streets and the west street; the alleys of the quarter; kerbs and pavements
  const road = (x0, x1, z0, z1, y = 0.02, tint = 0xffffff) => { const g = new THREE.PlaneGeometry(x1 - x0, z1 - z0); g.rotateX(-Math.PI / 2); g.translate(LX((x0 + x1) / 2), CHH + y, LZ((z0 + z1) / 2)); const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * (x1 - x0) / 9, uv.getY(i) * (z1 - z0) / 9); colored(g, tint); const m = new THREE.Mesh(g, MAT.asphalt); m.receiveShadow = SHADOWS; scene.add(onLayer1(m)); };
  // the avenue's worn centre line and a zebra crossing short of the square
  { const ml = []; for (let x = -8; x < 240; x += 9) ml.push(planeAt(3.2, 0.14, LX(x), CHH + 0.03, LZ(0), 0, -Math.PI / 2)); for (let k = 0; k < 9; k++) ml.push(planeAt(3.2, 0.6, LX(-10.5), CHH + 0.03, LZ(-7 + k * 1.75), 0, -Math.PI / 2)); const m = new THREE.Mesh(mergeGeometries(ml, false), new THREE.MeshStandardMaterial({ color: 0xd8d2c0, roughness: 0.9, map: TX.grime, transparent: true, opacity: 0.72, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1 })); m.renderOrder = 1; scene.add(onLayer1(m)); }
  road(-36, 245, -8, 8); road(-84, -36, -24, 24); road(-66, -50, -105, -24); road(-66, -50, 24, 105); road(-110, -84, -8, 8); road(-32, -27.5, -36.5, -11, 0.025, 0xcfc6b4); road(-50, -32, -36.5, -32, 0.025, 0xcfc6b4);
  const kerb = []; const kb = (x0, x1, z0, z1) => kerb.push([boxUV(LX(x0), LX(x1), CHH, CHH + 0.16, LZ(z0), LZ(z1), 2, 2), 0xbdb6a6]);
  kb(-36, -32, -11, -8); kb(-27.5, 245, -11, -8); kb(-36, 245, 8, 11); kb(-84, -66, -24, -22.5); kb(-50, -36, -24, -22.5); kb(-84, -66, 22.5, 24); kb(-50, -36, 22.5, 24); kb(-84, -82.5, -24, -8); kb(-84, -82.5, 8, 24);
  { const m = new THREE.Mesh(build(kerb), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, map: TX.grime })); m.receiveShadow = SHADOWS; scene.add(onLayer1(m)); }
  // the roundabout: a low wall, palms and a small monument
  { const ring = []; for (let a = 0; a < 6.28; a += 0.2) ring.push([LX(-58 + Math.cos(a) * 6), LZ(Math.sin(a) * 6)]); bagWall([...ring, ring[0]], 2, CHH, false);
    const mo = new THREE.Mesh(build([[G.box(1.6, 1.0, 1.6), 0xcfc4ac, M4(0, 0.5, 0)], [G.box(0.7, 5.2, 0.7), 0xd8cdb4, M4(0, 3.6, 0)], [G.cone(0.5, 1.0, 4), 0xc4b89c, M4(0, 6.7, 0, 0, Math.PI / 4, 0)]]), MAT.vc); mo.position.set(LX(-58), CHH, LZ(0)); scene.add(SH(onLayer1(mo))); addCollider(LX(-58), LZ(0), 0.8, 0.8, 0, CHH + 6); coverAround(-58, 0, 0.8, 0.8, 0, 1.6); }
  palms([[LX(-61), LZ(-3), 0.9, 1], [LX(-55), LZ(3), 1.0, 2], [LX(-60), LZ(4), 0.8, 4], ...[...Array(10)].map((_, i) => [LX(10 + i * 22), LZ(i % 2 ? 9.6 : -9.6), 0.85 + rr() * 0.3, rr() * 6])]);
  // kiosks; rubble across the far ends of the streets
  addProp(KIOSK_GEO, -42, -12, 0.4, [1.15, 0.95], 2.3); coverAround(-42, -12, 1.15, 0.95, 0.4, 2.2); addProp(KIOSK_GEO, 40, 9.8, Math.PI, [1.15, 0.95], 2.3);
  for (const [x, z, n, s, cx, cz] of [[-58, -100, 30, 1.6, 9, 2], [-102, 0, 18, 1.2, 1.5, 9], [99, -10, 8, 1, 2.5, 1.5], [160, 12, 8, 1, 2.5, 1.5], [62, 12.5, 8, 1, 2.5, 1.5]]) { szRubble(rub, x, z, n, s, rr); addCollider(LX(x), LZ(z), cx, cz, 0, CHH + 1.6); }
  // sandbagged Egyptian positions on the corners
  for (const [x, z, r] of [[52, -10, 0.1]]) { const arc = []; for (let a = -70; a <= 70; a += 20) { const t = THREE.MathUtils.degToRad(a) + r; arc.push([LX(x) + Math.sin(t) * 1.6, LZ(z) - Math.cos(t) * 1.6]); } bagWall(arc, 4, CHH - 0.05); const k = COVER.length; for (let i = Math.max(0, k - 12); i < k; i++) if (!SZ.covers.includes(COVER[i])) { COVER[i].y = CHH; SZ.covers.push(COVER[i]); } }
  // lamp posts along the avenue, a minaret on the skyline, smoke over the city
  const lp = []; for (let x = -4; x < 240; x += 26) for (const s of [-1, 1]) lp.push([new THREE.CylinderGeometry(0.07, 0.1, 7, 6).translate(LX(x), CHH + 3.5, LZ(s * 9.4)), 0x4a4a46], [new THREE.BoxGeometry(0.1, 0.1, 1.6).translate(LX(x), CHH + 7, LZ(s * 8.7)), 0x4a4a46]);
  { const m = new THREE.Mesh(build(lp), MAT.vc); scene.add(SH(onLayer1(m))); }
  { const mi = new THREE.Mesh(build([[G.cyl(1.4, 1.7, 22, 10), 0xe6dccb, M4(0, 11, 0)], [G.cyl(2.1, 2.1, 0.5, 12), 0xd2c6b0, M4(0, 17, 0)], [G.cyl(1.0, 1.1, 6, 10), 0xe6dccb, M4(0, 25, 0)], [G.cone(1.1, 3, 10), 0x6b8a6a, M4(0, 29.5, 0)]]), MAT.vc); mi.position.set(LX(-160), CHH, LZ(-70)); scene.add(SH(onLayer1(mi)));
    const dome = new THREE.Mesh(new THREE.SphereGeometry(7, 20, 10, 0, 6.28, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xcfc3a6, roughness: 0.8 })); dome.position.set(LX(-175), CHH + 8, LZ(-82)); scene.add(dome);
    const base = new THREE.Mesh(new THREE.BoxGeometry(20, 8, 20), new THREE.MeshStandardMaterial({ color: 0xe0d4bc, roughness: 0.9, map: TX.grime })); base.position.set(LX(-175), CHH + 4, LZ(-82)); scene.add(base); }
  for (const [x, z, s, f] of [[-130, -160, 22, 1], [80, -120, 16, 0], [-60, 180, 18, 1], [210, 60, 14, 0]]) smokeColumn(LX(x), LZ(z), s, f);
  SZ.coil = new THREE.TorusGeometry(0.45, 0.02, 4, 12); cityDressing(rr);
  if (SZ.ws.length) scene.add(SH(onLayer1(new THREE.Mesh(mergeGeometries(SZ.ws, false), MAT.wire)), true, false));
  { const m = new THREE.Mesh(build([...rub, ...SZ.rub]), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, flatShading: true, map: TX.grime })); scene.add(SH(onLayer1(m))); }
  BATCH.bag = svBag; if (BAGS.length) scene.add(bagMesh(BAGS));
  flag(LX(-90), LZ(-24.5), 'eg', 7, 0);
  tankModel(); szBuildAve();
  SZ.lead = addVeh({ mode: 'suez', side: 'f', kind: 'tank', geo: TANK_GEO, half: [3.4, 2.6, 1.9], guns: true, follow: { s: () => TANK.s + 30, lat: -4.5 } });
  // the paratroopers' jeep, parked behind the tank's last halt
  if (typeof VEH_DATA !== 'undefined' && VEH_DATA.jeep) { const r = vehModel('jeep', 'f'); r.g.position.set(LX(-24.6), CHH, LZ(8.7)); r.g.rotation.y = -0.12; scene.add(SH(onLayer1(r.g))); SZ.ht = r.g; } else SZ.ht = addProp(JEEP_GEO, -24.6, 8.7, -0.12, null);
  SZ.ht.visible = false; SZ.ht.userData.dyn = true; addCollider(LX(-24.6), LZ(8.7), 0.95, 2.05, Math.PI / 2 - 0.12, CHH + 2.0); coverAround(-24.6, 8.7, 0.95, 2.05, Math.PI / 2 - 0.12, 1.9);
  // the rescue convoy of the last stage: a tank and two jeeps, out of sight until they are called
  SZ.conv = [['tank', TANK_GEO, [3.4, 2.6, 1.9], 14, 'הטנק המוביל'], ['jeep', JEEP_GEO, [2.05, 2.0, 0.95], 22, 'הג׳יפ הראשון'], ['jeep', JEEP_GEO, [2.05, 2.0, 0.95], 22, 'הג׳יפ השני']].map(([kind, geo, half, rpgHit, name]) => { const v = addVeh({ mode: 'suez', side: 'f', kind, geo, half, guns: true, vmax: 8, rpgHit, name }); v.g.visible = false; return v; });
  for (let i = k0; i < scene.children.length; i++) if (!SZ.objs.includes(scene.children[i])) SZ.objs.push(scene.children[i]);
  SZ.cityCovers = SZ.covers; SZ.citySlots = SZ.slots; dimEnv(scene);
}

/* ---------- director ---------- */
const SZ_STAGES = [
  { title: 'הטור נכנס לעיר', sub: 'עשר וארבעים בבוקר. הטור נכנס לשדרה הראשית של סואץ, והעיר שקטה מדי. בחלונות ועל הגגות כבר מחכים צוותי הבזוקה — ולכם יש שנייה אחת לכל אחד מהם.', goal: 'תורידו את הבזוקות בחלונות ועל הגגות לפני שהן יורות. מקלע 0.5 (אש), תותח (רימון)' },
  { title: 'הצומת', sub: 'בצומת אל־ארבעין נסגר המארב: אש משני הצדדים, מכל הקומות. מחסום חוסם את הכניסה לכיכר, ומאחוריו, בפתח הרחוב הצפוני, חפור תותח נ״ט.', goal: 'פרקו את המארב בצומת לפני שהוא מפרק את הטור' },
  { title: 'בסמטאות', sub: 'הטנק בוער מול המחסום, והכיכר היא שדה הריגה. לא חוצים אותה: מאגפים. צפונה בסמטת השוק שמצפון לשדרה, ואז מערבה בסמטה שמאחורי הכיכר, עד הרחוב הצפוני. כל עמדה שלהם מכוונת לאורך הסמטה, אליכם.', goal: 'קדימה בסמטה, עמדה אחרי עמדה: האויב תמיד לפניכם' },
  { title: 'התותח מאחור', sub: 'מפי הסמטה רואים את גב עמדת התותח: הצוות מכוון לשדרה, לא אליכם. חסלו אותו, הדפו את ההתקפה שיורדת מצפון ברחוב, וחצו אל הדלת הצדדית של בניין הפינה.', goal: 'חסלו את צוות התותח מאחור, הדפו את ההתקפה מצפון, ופרצו בדלת הצדדית' },
  { title: 'חדר אחרי חדר', sub: 'בית קפה בקומת הקרקע, דירה של משפחה מעליו וחמ״ל בקומה השנייה. כל הדלתות סגורות: מנקים חדר, והדלת הבאה נפתחת כשמגיעים אליה. רימון, פריצה, הבא — עד הגג.', goal: 'חדר אחרי חדר, דלת אחרי דלת, עד הגג' },
  { title: 'התאג״ד', sub: 'הבניין בידינו, והפצועים שוכבים על מזרנים בחדר הפנימי של הקומה הראשונה. מגינים עליהם מהקומה הראשונה: המצרים יבואו בגלים, מהכיכר, מהסמטה שאגפנו בה ומהרחוב המערבי — אף פעם לא מיותר משני כיוונים בבת אחת.', goal: 'הגנו מהקומה הראשונה: אף מצרי לא מגיע לפצועים' },
  { title: 'השיירה', sub: 'מהרחוב הדרומי נשמעות השרשראות: טנק ושני ג׳יפים נכנסים לכיכר. מהחלונות בדרום הכיכר כבר יורים עליהם בבזוקות. אם השיירה לא מגיעה לדלת, אף פצוע לא יוצא מכאן.', goal: 'חסלו את הבזוקות בחלונות שבדרום הכיכר, ואז מעמיסים את הפצועים' },
];
const SZ_START = [null, null, [-30.6, -8.8, 0], [-46, -34.25, 270], [-64.7, -34.5, 270], [-75.5, -27.0, 180], [-75.5, -27.0, 180]];
const SZ_TANK_END = 262;   // the tank's last halt: short of the barricade across the mouth of the square, beside the mouth of the alley
/* the flanking route, as gate points: stage 2 up the alley N1 and west along BA1 to the north street; stage 3 across the north street to the side door */
const SZ_R2 = [[-30.6, -8.8], [-29.75, -20], [-29.75, -32.8], [-39, -34.25], [-46, -34.25]], SZ_R3 = [[-46, -34.25], [-51.5, -34.3], [-58, -34.5]], SZ_R4 = [[-51.5, -34.3], [-66.5, -34.5]];
const SZ_LANE2 = SZ_R2, SZ_LANE3 = SZ_R3;   // the old names of the two routes (the test page still asks for them)
/* the encounters along it, bound by bound: every man in a fixed place, facing back down the way the player comes.
   g: a position on the ground [x, z, facing x, facing z, kind, from difficulty (0 easy), dormant]; w: a sandbagged window [x, z, floor, kind, from difficulty];
   r: a runner [x, z, path, kind, delay, from difficulty, the position he runs to and fights from] */
const SZ_ENC2 = [
  { g: [[-31.4, -25.75, 0, 1, 'rifle', 0], [-30.5, -25.75, 0, 1, 'lmg', 1], [-28.3, -28.35, 0, 1, 'rifle', 0]], w: [[-27.5, -25.25, 2, 'rifle', 0]] },
  { g: [[-30.8, -36.0, 0, 1, 'rifle', 0], [-29.2, -36.0, 0, 1, 'smg', 1]], w: [[-29.25, -36.5, 1, 'rifle', 0], [-27.5, -34.75, 1, 'rifle', 2]], r: [[-44, -34.25, [[-36, -34.25], [-33.4, -33.6]], 'rifle', 1.5, 0]] },
  { g: [[-43.4, -35.65, 1, 0, 'rifle', 0], [-43.4, -32.75, 1, 0, 'rifle', 1]], w: [[-36.25, -36.5, 1, 'rifle', 0], [-44.25, -32, 1, 'smg', 2]] },
  { g: [[-49.9, -32.95, 1, 0, 'rifle', 0], [-49.9, -35.65, 1, 0, 'rpg', 1]], w: [[-44.75, -36.5, 2, 'rifle', 0], [-47.75, -32, 2, 'rifle', 2]], r: [[-58, -40.5, [[-53.5, -35.5]], 'smg', 2, 0]] },
];
const SZ_ENC3 = [
  // the gun crew and the men of their line across the north street, all facing the square - their backs to the mouth of the alley
  { g: [[-59.7, -27.8, 0.66, 0.75, 'rifle', 0, 1], [-58.0, -29.4, 0.66, 0.75, 'rifle', 0, 1], [-59.4, -29.3, 0.66, 0.75, 'rpg', 1, 1], [-63.5, -27.25, 0, 1, 'rifle', 0, 1], [-52.5, -27.25, 0, 1, 'lmg', 1, 1]] },
  // the counterattack: out of the door of the house across the street, behind their line, to the line; and the windows over it
  { r: [[-65.3, -48.4, [[-62, -47.6]], 'rifle', 0.5, 0, [-62, -47.2, 0, 1]], [-65.3, -48.4, [[-63, -49.2], [-58, -47.6]], 'lmg', 2.2, 0, [-58, -47.2, 0, 1]], [-65.3, -48.4, [[-63, -49.4], [-54, -47.6]], 'rifle', 3.9, 1, [-54, -47.2, 0, 1]]], w: [[-66, -48.25, 1, 'rifle', 0], [-50, -45.75, 1, 'rpg', 2]] },
];
/* the corner building, taken in one order: the side door into the café's back room, its front room, the hall, the stairwell; up to the flat (its
   salon, the bedroom, the hall); up to the command post (its hall, the map room, the radio room); the roof. Each door opens when the room before it is
   clear and the player comes up to it (at: where he stands, floor). after: what opens once the room behind the door is clear - the way back and up */
const SZ_CQB = [
  { door: 'E', at: [-65.0, -34.5, 0], room: 0 }, { door: 'P0', at: [-70.6, -34.65, 0], room: 1 }, { door: 'W0', at: [-73.7, -30.2, 0], room: 2 }, { door: 'S0', at: [-80.8, -28.4, 0], room: -1 },
  { door: 'F1', at: [-78.3, -37.15, 1], room: 3 }, { door: 'P1', at: [-72.5, -34.65, 1], room: 4 }, { door: 'A1', at: [-69.3, -30.2, 1], room: 5, after: ['W1', 'SB'] },
  { door: 'S2', at: [-78.6, -30.2, 2], room: 6 }, { door: 'W2', at: [-73.7, -28.4, 2], room: 7 }, { door: 'P2', at: [-72.5, -34.65, 2], room: 8, after: ['A2', 'SA'] },
  { door: 'RD', at: [-78.3, -37.15, 3], room: 9 },
];
// the men of each room: [x, z, kind, from difficulty] (on the roof, positions behind the sandbags: [x, z, kind, from difficulty, facing x, facing z])
const SZ_ROOMS = [
  [[-70.4, -37.0, 'rifle', 0], [-70.5, -30.3, 'smg', 0], [-68.0, -30.1, 'rifle', 2]],
  [[-76.2, -30.2, 'rifle', 0], [-74.6, -36.5, 'smg', 1], [-76.4, -33.6, 'rifle', 0]],
  [[-80.0, -25.4, 'rifle', 0], [-67.6, -25.6, 'rifle', 0], [-78.2, -27.8, 'smg', 1]],
  [[-72.4, -30.2, 'rifle', 0], [-75.2, -30.0, 'smg', 1], [-72.4, -35.6, 'rifle', 2]],
  [[-68.6, -30.2, 'rifle', 0], [-67.0, -34.4, 'smg', 1]],
  [[-80.0, -26.6, 'rifle', 0], [-76.2, -25.2, 'rifle', 0], [-67.4, -25.2, 'smg', 1]],
  [[-70.6, -25.3, 'rifle', 0], [-75.6, -25.4, 'smg', 0], [-68.4, -26.8, 'rpg', 2]],
  [[-75.4, -36.2, 'rifle', 0], [-72.4, -33.0, 'smg', 1], [-76.6, -31.8, 'rifle', 2]],
  [[-67.6, -35.6, 'rifle', 0], [-68.6, -30.4, 'smg', 1]],
  [[-72.0, -25.35, 'rifle', 0, 0, 1], [-67.35, -28.5, 'lmg', 1, 1, 0], [-68.9, -34.5, 'rifle', 0, -1, 0]],
];
/* the defence, from the first floor: the three places the attacks come from - the square (out of the south street), the alleys we came by (out of N1
   and along BA1 to the north street), the west street - and the waves: one place, then two, then the other two. A wave starts when the one before
   it is down, so at no moment do they come from more than two places. Each man runs to a fixed position facing the building (slots), or for its
   door and up the stairs to the wounded (climb, then raid: the way through the building) */
const SZ_RAID = [[-76.3, -22.5, 0], [-76.3, -25.5, 0], [-80.8, -28.4, 0], [-80.8, -31.3, 0], [-80.8, -37.1, 1], [-76.6, -37.1, 1], [-75.0, -34.2, 1]];
const SZ_RAID_E = [[-64.5, -34.5, 0], [-67.5, -34.6, 0], [-70.8, -34.65, 0], [-74.0, -32.0, 0], [-73.7, -30.0, 0], [-73.7, -28.4, 0], [-77.5, -28.0, 0], [-80.8, -28.4, 0], [-80.8, -31.3, 0], [-80.8, -37.1, 1], [-76.6, -37.1, 1], [-75.0, -34.2, 1]];
const SZ_DEF = {
  A: { name: 'מהכיכר', spawn: [[-58, 76], [-56.5, 78], [-59.5, 78], [-57.5, 80]], path: [[-60, 30]], slots: [[-51.3, 14.4, -0.51, -0.86], [-57.2, 1.5, -0.55, -0.83], [-47.2, 4.3, -0.6, -0.8, -45.5, 15], [-40.5, -11.4, -0.94, -0.35, -43.5, 15]], climb: [[-60, 30], [-66, 12], [-71, -10], [-76.3, -22.5]], raid: SZ_RAID, kinds: ['rifle', 'lmg', 'smg', 'rifle'], pos: [-75.5, -24.9, 'חלון לכיכר'] },
  B: { name: 'מהסמטה', spawn: [[-29.75, -12.6], [-30.3, -11.6], [-29.0, -12.0]], path: [[-29.0, -14.0], [-30.9, -17.2], [-30.9, -22.6], [-28.9, -24.2], [-28.9, -25.8], [-30.6, -27.0], [-30.3, -31.2], [-33.5, -33.9], [-44, -34.35]], slots: [[-48.3, -32.95, -1, 0], [-48.3, -35.7, -1, 0], [-51.2, -39.6, -1, 0.15, -50.8, -34.6]], climb: [[-29.0, -14.0], [-30.9, -17.2], [-30.9, -22.6], [-28.9, -24.2], [-28.9, -25.8], [-30.6, -27.0], [-30.3, -31.2], [-33.5, -33.9], [-48, -34.35], [-64.5, -34.5]], raid: SZ_RAID_E, kinds: ['rifle', 'smg', 'rifle'], pos: [-66.9, -34.5, 'חלון לרחוב הצפוני'] },
  C: { name: 'מהרחוב המערבי', spawn: [[-96, 2.5], [-96, -2.5], [-97, 0]], path: [[-86, 0]], slots: [[-80.5, -5.6, 0.1, -1], [-77, -5.6, 0, -1], [-78.8, 9.7, 0.1, -1, -82, 11], [-79, 16.0, 0.1, -1, -83, 13]], climb: [[-86, 0], [-83.2, -7.6], [-80, -8.8], [-77.5, -15], [-76.3, -22.5]], raid: SZ_RAID, kinds: ['rifle', 'rifle', 'lmg', 'smg'], pos: [-80.5, -24.9, 'חלון מערבי לכיכר'] },
};
// each wave: [place, men to positions by difficulty, men for the door by difficulty, the first of them a bazooka]
const SZ_WAVES = [
  [['A', [2, 3, 3], [1, 1, 2]]],
  [['A', [1, 2, 2], [0, 0, 1], true], ['B', [2, 2, 3], [1, 1, 1]]],
  [['B', [1, 2, 2], [0, 1, 1]], ['C', [2, 3, 3], [1, 1, 2]]],
];
// the convoy comes in from the south street, halts in the square under the bazookas, then drives to the door
const SZ_CONV_PATH = [[-58, 104], [-58, 40], [-58.5, 26], [-63, 13], [-66, 0], [-70, -12], [-74.5, -19]];
const SZ_STREET = {
  a1: [[160.5, -26, [[160.5, -12], [166, -7.5]]], [161, -28, [[160.5, -12], [155, -8]]], [130.5, 26, [[130.5, 12], [136, 9.5]], 'rpg', 1.5], [131, 28, [[130.5, 12], [126, 9.5]], 'rifle', 2]],
  a2: [[98.5, -26, [[98.5, -12], [94, -8.5]]], [99, -28, [[98.5, -12], [101, -8]], 'rpg', 1], [62.5, 26, [[62.5, 12], [66, 9.5]]], [63, 28, [[62.5, 12], [58, 9.6]], 'rifle', 1.5], [64, 30, [[62.5, 12], [70, 9.6]], 'rifle', 2.5]],
  a3: [[16, -9.8, [[13, -6.5]]], [20, -10, [[11, -4.5]]], [8, -9.6, [[7, -4]], 'rpg'], [4, 9.8, [[4, 9.6]]], [-2, 9.8, [[-2, 9.6]], 'rifle'], [-8, -9.8, [[-6, -7.5]]]],
  // the junction: out of the south street and the west street into the square, and the men of their line across the north street
  j: [[-58, 62, [[-58, 30], [-50, 17]]], [-60, 64, [[-60, 30], [-62, 18]], 'rifle', 1.5], [-56, 66, [[-56, 30], [-46, 19]], 'rpg', 2], [-86, -3, [[-85, -2]]], [-86, 3, [[-85, 2.5]], 'rpg'], [-63.5, -27.4, [[-63.5, -27.4]]], [-52.5, -27.4, [[-52.5, -27.4]], 'rifle', 1]],
};
const SZ_FRIENDS = [['אבנר', [-31.2, -6.4]], ['יגאל', [-28.6, -6.6]], ['מוטקה', [-33.4, -4.6]], ['אורי', [-26.6, -4.8]], ['ציון', [-31.0, -2.0]], ['רמי', [-28.2, -1.8]], ['שאול', [-34.6, -9.3]], ['גדי', [-25.4, -9.4]], ['חיים', [-34.4, 7.5]], ['אלי', [-23.0, 6.0]]];
// the four who give covering fire, by stage: [x, z, facing x, facing z]
const SZ_COVERF = { 2: [[-34.6, -9.3, 0.4, -0.9], [-25.4, -9.4, -0.4, -0.9], [-34.4, 7.5, -0.7, -0.7], [-23.0, 6.0, -0.3, -1]], 3: [[-44.5, -33.0, -1, 0], [-44.5, -35.6, -1, 0], [-40.5, -33.2, -1, 0], [-40.5, -35.4, -1, 0]], 4: [[-61.5, -32.6, -1, 0.2], [-61.5, -36.4, -1, -0.2], [-52.5, -33.0, 0, -1], [-52.5, -36.0, 0, -1]] };
// the paratroopers' places in the defence (floor 1 and 2), and where the player fights the raiders that come up the stairs
const SZ_SPOTS5 = [[-80.5, -25.1, 2, 0, 1], [-71.0, -24.7, 1, 0, 1], [-66.7, -27.2, 1, 1, 0], [-68.3, -24.7, 2, 0, 1], [-70.0, -36.4, 2, 0, -1], [-75.5, -24.7, 2, 0, 1]], SZ_NF = 6;
const szDi = () => Math.max(0, DIFF.indexOf(diff));
// a window or roof position by lot - the lot drawn from the stage's own sequence, so the ambush is the same every time the stage is played
function szSpawnSlot(kind, filter) {
  const c = SZ.slots.filter((s) => !s.used && filter(s)); if (!c.length) return null;
  const s = c[Math.floor((SZ.rr ? SZ.rr() : 0.5) * c.length)]; const e = spawnEnemy(s.h[0], s.h[1], kind, null, null); if (!e) return null;
  szSeat(e, s); e.cyc = 0.5 + (SZ.rr ? SZ.rr() : 0.5) * 2; e.rpgCd = 7 + (SZ.rr ? SZ.rr() : 0.5) * 6; return e;
}
function szSeat(e, s) { s.used = true; e.sz = 'win'; e.slot = s; e.state = 'sz'; e.pos.set(s.h[0], s.y, s.h[1]); e.cyc = 0.8; e.peek = false; e.aimT = 0; e.rpgAim = 0; e.rpgCd = 6; e.heading = Math.atan2(s.nx, s.nz); e.guide = null; e.dormant = false; }
// a man put in a position of the script; dormant: he has not seen the player yet, and watches the way he faces (the flank comes at his back)
function szPlace(s, kind, tag, dormant = false) {
  if (!s || s.used) return null; const e = spawnEnemy(s.h[0], s.h[1], kind, null, null); if (!e) return null;
  szSeat(e, s); e.sq = tag; e.flankD = dormant; e.sync(); return e;
}
function szSpawnRoom(f, x, z, kind = 'rifle') { const e = spawnEnemy(LX(x), LZ(z), kind, null, null); if (!e) return null; e.pos.y = CHH + f * FLH; e.sz = 'room'; e.state = 'sz'; e.floor = f; e.cov = null; e.patience = 0; e.cyc = 0.8; e.peek = false; e.meleeCd = 0.5; return e; }
function szSpawnStreet(x, z, path, kind = 'rifle', climb = false) { const e = spawnEnemy(LX(x), LZ(z), varyKind(kind, x, z), null, null); if (!e) return null; e.sz = 'street'; e.state = 'sz'; e.path = path.map(([a, b]) => [LX(a), LZ(b)]); e.pi = 0; e.cov = null; e.patience = 0; e.climb = climb; e.cyc = 1; e.peek = false; e.meleeCd = 0.5; e.rpgCd = 9; e.toSlot = null; e.raidP = null; return e; }
function szAmbush(xMin, xMax, nRpg, nRifle, sides = [1, -1]) {
  const f = (s) => { const lx = s.x - CITY.cx; return lx > xMin && lx < xMax && (sides.includes(Math.sign(s.nz)) || s.nz === 0) && Math.abs(s.z - CITY.cz) < 45; };
  for (let i = 0; i < nRpg; i++) szSpawnSlot('rpg', f); for (let i = 0; i < nRifle; i++) szSpawnSlot('rifle', f);
}
function szAlive(pred = () => true) { let n = 0; for (const e of UNITS.enemies) if (e.alive && e.sz && pred(e)) n++; return n; }
// the men of one bound of the flank, all in the places the script gives them
function szEncounter(E, tag, k) {
  const di = szDi(); if (!E) return;
  for (const [x, z, nx, nz, kind, d, dorm] of E.g || []) if (di >= d) szPlace(szGSlot(x, z, nx, nz), kind, tag, !!dorm);
  for (const [x, z, f, kind, d] of E.w || []) if (di >= d) szPlace(szSlot(x, z, f), kind, tag);
  for (const [x, z, path, kind, delay, d, to] of E.r || []) if (di >= d) DIRQ.push({ at: GAME.t + delay, spawn: true, gate: k, fn: () => { const e = szSpawnStreet(x, z, path, kind); if (e) { e.sq = tag; if (to) e.toSlot = szGSlot(...to); } } });
}
function szSetFriends(stage) {
  // friends 0-5 follow the player through the alleys and into the building; 6-9 give covering fire from behind him (in the defence they are out of sight)
  if (SZ.fresh || stage === 2 || stage === 5) resetTrail();
  const fw = [-Math.sin(P.yaw), -Math.cos(P.yaw)];
  FRIENDS.forEach((f, i) => {
    const u = f.unit; if (i >= SZ_FRIENDS.length || stage < 2 || (stage >= 5 && i >= SZ_NF)) { if (stage >= 5 && i >= 10 && i <= 15) return; f.state = 'bunker'; u.rig.root.visible = false; u.tag.visible = false; f.marker.visible = false; return; }
    const follow = i < SZ_NF && stage <= 4;
    if (!SZ.fresh && (['wounded', 'stable', 'saved', 'kia', 'carried'].includes(f.state) || (follow && f.state === 'follow'))) return;
    const [name, [x, z]] = SZ_FRIENDS[i]; f.name = name; let px = LX(x), pz = LZ(z), py; let fx = 0, fz = -1;
    if (stage >= 5) { const sp = SZ_SPOTS5[i]; px = LX(sp[0]); pz = LZ(sp[1]); py = CHH + sp[2] * FLH; fx = sp[3]; fz = sp[4]; }
    else if (follow) { const back = 2.2 + i * 1.4, side = i % 2 ? 0.9 : -0.9; px = P.pos.x - fw[0] * back - fw[1] * side; pz = P.pos.z - fw[1] * back + fw[0] * side; py = P.pos.y; if (blocked(px, pz, 0.35, py)) { px = P.pos.x - fw[0] * 1.2; pz = P.pos.z - fw[1] * 1.2; } fx = fw[0]; fz = fw[1]; }
    else { const sp = SZ_COVERF[Math.min(stage, 4)][(i - SZ_NF) % 4]; px = LX(sp[0]); pz = LZ(sp[1]); fx = sp[2]; fz = sp[3]; }
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
const colMode = () => FIELDM() && (MODE !== 'suez' || SZ.stage === 2) && !!LANE.pts && LANE.hw <= 7;
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
  const sameF = Math.abs(P.pos.y - u.pos.y) < 1.6, col = colMode(), indoor = inTB(P.pos.x, P.pos.z, 1) || inTB(u.pos.x, u.pos.z, 1), tight = indoor || col;
  let [sx, sz] = fSlotOf(f);
  // in contact his place is the nearest cover to it that faces the enemy (sqfCover): he goes to ground there, not in the open
  const cv = SQF.contact && !tight && sameF ? sqfCover(f, sx, sz) : null; if (cv) { sx = cv.x; sz = cv.z; }
  const ds = Math.hypot(sx - u.pos.x, sz - u.pos.z), dPl = Math.hypot(P.pos.x - u.pos.x, P.pos.z - u.pos.z), toCov = !!cv && ds > 0.9 && ds < 7.5;
  f.seeT = (f.seeT || 0) - dt; if (f.seeT <= 0) { f.seeT = 0.3; f.seeP = sameF && losW(u.pos.x, u.pos.y + 1.5, u.pos.z, P.pos.x, P.pos.y + 1.5, P.pos.z); }
  // nobody stands on the player: a man closer than two metres steps away first
  if (dPl < 2.0 && !CINE.on) { const ax = (u.pos.x - P.pos.x) / (dPl || 1), az = (u.pos.z - P.pos.z) / (dPl || 1); steer(u, u.pos.x + ax * 2.5, u.pos.z + az * 2.5, 3.2, dt); u.anim += dt * 7; u.stance = 'stand'; u.rig.pose('walk', u.anim); f.moving = true; f.holdP = null; return true; }
  const settle = () => { f.moving = false; f.prog = null; const T = SQF.contact && SQF.threat, d = T ? Math.atan2(T.x - u.pos.x, T.z - u.pos.z) : SZ.fdir ?? P.yaw + Math.PI; f.post.fx = Math.sin(d); f.post.fz = Math.cos(d); u.heading = d; f.scanCd = 0; f.holdP = [P.pos.x, P.pos.z]; f.post.stand = [u.pos.x, u.pos.z];
    sqfTakeCover(f, cv && Math.hypot(cv.x - u.pos.x, cv.z - u.pos.z) < 1.4 ? cv : null); return false; };
  // a man who got wedged (a doorway, a table, a friend in the way) takes the spot he is on and fights from it; he tries again when the player has walked on
  if (f.wedged) { if (Math.hypot(P.pos.x - f.wedged[0], P.pos.z - f.wedged[1]) > 4 || !sameF || GAME.t > f.wedged[2]) { f.wedged = null; f.stuck = 0; } else { f.post.stand = [u.pos.x, u.pos.z]; return false; } }
  // a man in position stays in it and fights: looking round does not move the squad, only the player walking on does (or contact: to the cover beside him)
  if (!f.moving) {
    const pm = f.holdP ? Math.hypot(P.pos.x - f.holdP[0], P.pos.z - f.holdP[1]) : 99;
    if (!toCov && (ds < 1.0 || (pm < (tight ? 3.5 : 5.5) && sameF && dPl < (col ? 22 : indoor ? 9 : 16)))) { f.stuck = 0; f.wantMove = false; if (!f.holdP) return settle(); f.post.stand = [u.pos.x, u.pos.z]; return false; }
    // fire and movement: in contact his fire team waits its turn to bound forward, and covers the other one meanwhile
    if (SQF.contact && !col && sameF && dP < 24 && sqfTeam(f) !== SQF.bound && !(toCov && ds < 4.5)) { f.wantMove = true; f.stuck = 0; f.post.stand = [u.pos.x, u.pos.z]; return false; }
  }
  f.wantMove = false;
  // on the move he stops at his slot, or indoors as soon as he is beside the player and can see him (in a column only at his place in the file)
  if (f.moving && (ds < (cv ? 0.85 : 1.0) || (indoor && !col && sameF && dPl < 3.6 && f.seeP) || (!tight && !cv && ds < 1.8 && dPl < 14))) { f.stuck = 0; return settle(); }
  // the bound has passed to the other team: a man of this one still running goes to ground where he is, and covers them
  if (f.moving && SQF.contact && !col && sameF && dP < 24 && sqfTeam(f) !== SQF.bound && GAME.t - SQF.boundT > 0.5 && !(toCov && ds < 3)) { f.stuck = 0; return settle(); }
  const x0 = u.pos.x, z0 = u.pos.z; if (!f.moving) { f.prog = null; sqfTakeCover(f, null); } f.moving = true; f.holdP = null;
  const hot = SQF.contact && dP < 22 && !indoor, vF = hot ? 5.0 : 6.4, vN = hot ? 3.9 : 4.4;   /* under fire he runs bent low: a little slower */
  f.dirT = (f.dirT || 0) - dt; if (f.dirT <= 0 || f.dirOk === undefined) { f.dirT = 0.35; f.dirOk = dP < 26 && sameF && clearRun(u.pos.x, u.pos.z, sx, sz, u.pos.y);
    // off the direct line he takes the furthest footstep of the player's that he can run to in a straight line (never through a wall)
    if (!f.dirOk) for (let i = goal; i >= Math.max(SZ.trailBase, f.ti - 10); i--) { const w = tr[i - SZ.trailBase]; if (w && Math.abs(w[2] - u.pos.y) < 1.0 && clearRun(u.pos.x, u.pos.z, w[0], w[1], u.pos.y)) { f.ti = i; break; } } }
  // he runs hard when he has fallen behind his slot, and jogs the last metres; on the trail he keeps to his own side of it, so the squad never files (indoors he keeps to the trail itself: the doors)
  if (f.dirOk) { steer(u, sx, sz, ds > 3 ? vF : vN, dt); f.ti = Math.max(f.ti, goal - 2); }
  else { const w = tr[Math.min(f.ti, goal) - SZ.trailBase]; if (!w) return false; const d = SZ.fdir ?? P.yaw + Math.PI, lat = col || inTB(u.pos.x, u.pos.z, 2) || inTB(w[0], w[1], 2) ? 0 : FSLOTS[f.fi % FSLOTS.length][0] * 0.45; if (steer(u, w[0] + Math.cos(d) * lat, w[1] - Math.sin(d) * lat, dP > 9 ? vF : vN, dt) < 1.2) f.ti = Math.min(f.ti + 1, goal); }
  const mv = Math.hypot(u.pos.x - x0, u.pos.z - z0); f.stuck = mv < dt * 0.8 ? f.stuck + dt : Math.max(0, f.stuck - dt * 2);
  // no running on the spot: a man who has not got anywhere in two seconds (blocked, or circling a slot he cannot reach) stops where he is and fights from there
  if (!f.prog || Math.hypot(u.pos.x - f.prog[0], u.pos.z - f.prog[1]) > 1.5) f.prog = [u.pos.x, u.pos.z, GAME.t];
  else if (GAME.t - f.prog[2] > 2.0 && sameF && dPl < 12) { f.wedged = [P.pos.x, P.pos.z, GAME.t + 5]; return settle(); }
  if (f.stuck > 0.5 && szOnScreen(u.pos.x, u.pos.y + 1, u.pos.z) && sameF && dPl < 12) { f.wedged = [P.pos.x, P.pos.z, GAME.t + 4]; return settle(); }
  u.stance = 'stand'; if (f.stuck > 0.35) u.rig.pose(hot ? 'crouch' : 'idle', u.anim); else { u.anim += dt * (hot ? 8 : 9); u.rig.pose(hot ? 'crun' : 'run', u.anim); } f.post.stand = [u.pos.x, u.pos.z]; return true;
}
function szSquad(list, tag, gate) {
  // every man on the list leads a fire team: a runner brings two more behind him, a man in position has a second beside him (their places drawn from the stage's own sequence)
  const R = () => (SZ.rr ? SZ.rr() : 0.5);
  list.forEach(([x, z, path, kind, delay], li) => {
    const n = path.length > 1 || delay ? 3 : li % 2 ? 2 : 1;
    for (let j = 0; j < n; j++) { const ox = j ? (R() - 0.5) * 3.2 : 0, oz = j ? (R() - 0.5) * 3.2 : 0, go = () => { const e = szSpawnStreet(x + ox, z + oz, j ? path.map(([a, b]) => [a + ox * 0.6, b + oz * 0.6]) : path, j && kind === 'rpg' ? 'rifle' : kind || 'rifle'); if (e) e.sq = tag; }; const dl = (delay || 0) + j * 0.7; if (dl) DIRQ.push({ at: GAME.t + dl, spawn: true, gate, fn: go }); else go(); }
  });
}
function szClearAll() { for (const e of UNITS.enemies) if (e.alive && e.sz) { e.alive = false; e.rig.root.visible = false; e.tag.visible = false; if (e.slot) { e.slot.used = false; e.slot = null; } } for (let k = DIRQ.length - 1; k >= 0; k--) if (DIRQ[k].spawn) DIRQ.splice(k, 1); }
/* ---- the bounds of the flank: like the field chapters' gates (7_field.js gateUpd), but a bound is clear only when every man the script put in it is down,
   seen or not - they wait in fixed places round the bends, out of sight until the player is on them ---- */
const szGateLeft = () => (GATE.on ? szAlive((e) => e.sq === 'g' + GATE.i) + DIRQ.filter((q) => q.gate === GATE.i).length : 0);
function szGateUpd(dt) {
  if (!GATE.on || CINE.on) return; const i = GATE.i, n = GATE.pts.length - 1; GATE.t = (GATE.t || 0) + dt;
  if (GATE.lane && LANE.pts && GATE.ls) { const ps = laneProj(P.pos.x, P.pos.z).s, tgt = i > 0 ? GATE.ls[i - 1] : GATE.back !== undefined ? GATE.ls[0] - GATE.back : 0; LANE.s0 = Math.max(GATE.s0m ?? -1e9, Math.min(tgt, ps - 1)); GATE.s0m = LANE.s0; LANE.s1 = GATE.ls[Math.min(i + 1, n)] + 1.5; }
  const left = szGateLeft(); if (left > 0 && !(GATE.t > 100 && left <= 1)) { GATE.clear = false; return; }
  if (!GATE.clear) { GATE.clear = true; fieldDespawn((e) => e.sq === 'g' + i); if (i >= n - 1) { GATE.on = false; GATE.done(); return; } radio('מ״פ צנחנים', pick(['נקי! קדימה לעמדה הבאה!', 'העמדה נקייה. מתקדמים, אחריי!', 'קדימה! לעמדה הבאה!']), 2.2); feed(`העמדה נקייה · ${GATE.label} ${i + 2}/${n + 1}`, 'good'); }
  const [x, z, y] = GATE.pts[i + 1]; if (Math.hypot(P.pos.x - x, P.pos.z - z) < GATE.r && (y === undefined || Math.abs(P.pos.y - y) < 2.2)) { GATE.i++; GATE.clear = false; GATE.t = 0; if (GATE.i >= n) { GATE.on = false; GATE.done(); return; } feed(`${GATE.label} ${GATE.i + 1}/${n + 1}`); GATE.spawn(GATE.i); }
}
function szGateObj() {
  if (szGateLeft() > 0) { const e = szNearest((q) => q.sq === 'g' + GATE.i); return e ? [e.pos.x, e.pos.y + 2.2, e.pos.z, 'מצרי', 'foe'] : null; }
  const [x, z] = GATE.pts[GATE.i + 1]; return [x, CHH, z, 'העמדה הבאה'];
}
function szGateItem(items) { const n = GATE.pts.length - 1, left = szGateLeft(); items.push([left ? '' : 'next', left ? `${GATE.label} ${GATE.i + 1}/${n} · אויבים לפניכם: ${left}` : `העמדה נקייה · התקדמו ל${GATE.label} ${GATE.i + 2} (◆)`]); }
function szStage(i, restore = false) {
  SZ.stage = i; SZ.t = 0; SZ.cp = i; SZ.msgs = {}; CP.scene = i; CP.stats = { ...STATS }; GATE.on = false; snapRequest('stage'); SZ.rr = rng(9001 + i * 131);
  const S = SZ_STAGES[i]; toast(`שלב ${i + 1} מתוך ${SZ_STAGES.length} · ${S.title}`, S.sub); feed(`שלב ${i + 1}: ${S.title}`);
  if (i >= 2) { P.reserve = Math.max(P.reserve, 160); P.gren = Math.max(P.gren, diff.gren0); }
  szSetFriends(i); SZ.fresh = false; if (SZ.ht) SZ.ht.visible = i >= 2; szAveOn(i >= 2); szDoorsStage(i);
  if (i === 0) { radio('מג״ד', 'כל התחנות, כאן מג״ד. נכנסים לסואץ בטור. מפקדי טנקים, ראש בחוץ, עיניים לחלונות.', 5); TANK.stops = [80, 150, 210]; TANK.stopI = 0; TANK.holdAt = null; SZ.stopT = 0; }
  if (i === 1) { radio('מג״ד', 'הצומת לפניכם, ומחסום חוסם את הכניסה לכיכר. כל מה שזז בחלונות, אש!', 3.5); SZ.junction = false; }
  if (i === 2) {
    // on foot only the bound in front fights: whatever was left of the ambush on the tank goes while the crew bails out (the screen is black then)
    szClearAll();
    const R = SZ_R2.map(([x, z]) => [LX(x), LZ(z)]);
    gateStart(R, (k) => szEncounter(SZ_ENC2[k], 'g' + k, k), () => { feed('הסמטאות נקיות', 'good'); szStage(3); }, 'עמדה', 3.2, [3.0, R, 3]);
    hint('sz-gate', 'מאגפים את הכיכר <b>בסמטאות</b>: צפונה בסמטת השוק, ואז מערבה. כל עמדה שלהם מכוונת לאורך הסמטה, אליכם — חסלו אותה, והנקודה הבאה תסומן ב־◆. הצנחנים צמודים אליכם.', 8);
    radio('מ״פ צנחנים', 'הכיכר חסומה, והתותח שלהם מכסה אותה. לא חוצים! אחריי לסמטה, צפונה ואז מערבה, ונופלים עליהם מאחור.', 4.5);
  }
  if (i === 3) {
    szClearAll(); const R = SZ_R3.map(([x, z]) => [LX(x), LZ(z)]);
    gateStart(R, (k) => szEncounter(SZ_ENC3[k], 'g' + k, k), () => { feed('הרחוב נקי', 'good'); szStage(4); }, 'עמדה', 2.4, [4.5, R, 2]);
    radio('מ״פ צנחנים', 'שקט... התותח שלהם בפתח הרחוב, הם מכוונים לשדרה ולא רואים אותנו. כשאני יורה - כולם יורים. אחר כך לדלת הצדדית של הבניין.', 5);
  }
  if (i < 2 || i >= 4) laneOff();   // the lane runs through the alleys and across the street only; the tank and the building have walls of their own
  if (i === 4) laneSet(SZ_R4.map(([x, z]) => [LX(x), LZ(z)]), 4.5, 0);   // across the north street to the side door: not back into the alley
  if (i === 4) { szClearAll(); SZ.cq = 0; SZ.cqRoom = -1; SZ.cqClr = true; SZ.cqT = 0; radio('צנחנים', 'נכנסים איתך! אתה ראשון, אנחנו צמודים מאחור. כל דלת - רימון פנימה, ואז אנחנו.', 4.5); }
  if (i >= 5) { szClearAll(); szAidSetup(); szDefSlots(); }
  if (i === 5) { SZ.wave = -1; SZ.waveT = 4; SZ.srcOn = []; radio('מ״פ צנחנים', 'הבניין בידינו. הפצועים בחדר הפנימי בקומה הראשונה - זה התאג״ד שלנו. כולם לחלונות בקומה הראשונה! הם יבואו מהכיכר, מהסמטה ומהרחוב המערבי. אף מצרי לא עולה במדרגות.', 6); }
  if (i === 6) { SZ.srcOn = []; szConvStart(); radio('שיירה', 'כאן שיירת החילוץ: טנק ושני ג׳יפים. נכנסים לכיכר מהרחוב הדרומי, עוד שתי דקות אצלכם - תכינו את הפצועים.', 5); DIRQ.push({ at: GAME.t + 5.5, fn: () => radio('מ״פ צנחנים', 'כולם לחלונות שפונים לכיכר! כשהשיירה תיכנס, הבזוקות בחלונות שבדרום הכיכר יפתחו עליה - אנחנו מכסים אותה מכאן.', 5) }); }
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
  const f = alive[0], u = f.unit; f.state = 'kia'; f.aidDead = true; u.alive = false; STATS.kia++;
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
/* ---- the fight for the building: the doors open one at a time, each when the room before it is clear and the player comes up to it ---- */
function szCqUpd(dt) {
  if (SZ.cqRoom >= 0 && !SZ.cqClr) {
    if (szAlive((e) => e.cqr === SZ.cqRoom) > 0) return;
    SZ.cqClr = true; SZ.cqT = 0; const st = SZ_CQB[SZ.cq - 1]; if (st && st.after) for (const id of st.after) szDoor(id, true);
    feed(SZ.cq >= SZ_CQB.length ? 'הגג נקי' : 'החדר נקי', 'good');
    if (st && st.after) radio('צנחנים', st.after.includes('SA') ? 'הקומה נקייה! המדרגות לגג פנויות!' : 'הקומה נקייה! פינינו את המדרגות למעלה!', 2.6);
  }
  if (SZ.cq >= SZ_CQB.length) { SZ.cqT += dt; if (SZ.cqT > 2) { feed('הבניין נקי', 'good'); szStage(5); } return; }
  const st = SZ_CQB[SZ.cq], [x, z, f] = st.at;
  if (Math.hypot(P.pos.x - LX(x), P.pos.z - LZ(z)) < 2.4 && Math.abs(P.pos.y - (CHH + f * FLH)) < 1.6) {
    szDoor(st.door, true); sndBoom(V3(LX(x), CHH + f * FLH + 1.2, LZ(z)), 0.22); FX.shake = Math.max(FX.shake, 0.15); SZ.cq++; SZ.cqRoom = st.room; SZ.cqClr = st.room < 0;
    if (st.room >= 0) { const fl = st.room === 9 ? 3 : f, di = szDi(); for (const [mx, mz, k, d, nx, nz] of SZ_ROOMS[st.room]) if (di >= d) { const e = nx === undefined ? szSpawnRoom(fl, mx, mz, k) : szPlace(szGSlot(mx, mz, nx, nz, CHH + fl * FLH), k, 'room'); if (e) e.cqr = st.room; } }
  }
}
/* ---- the defence: waves from at most two of the three places at a time ---- */
function szDefSlots() { SZ.defSlots = {}; for (const k in SZ_DEF) SZ.defSlots[k] = SZ_DEF[k].slots.map(([x, z, nx, nz, vx, vz]) => Object.assign(szGSlot(x, z, nx, nz), { lx: x, lz: z, via: vx === undefined ? null : [vx, vz] })); }
function szAttack(src, nShoot, nClimb, rpg, t0) {
  const S = SZ_DEF[src], sl = SZ.defSlots[src]; for (const s of sl) s.claimed = s.used;
  for (let k = 0; k < nShoot; k++) { const s = sl.find((q) => !q.claimed); if (!s) break; s.claimed = true; const sp = S.spawn[k % S.spawn.length], kind = rpg && k === 0 ? 'rpg' : S.kinds[k % S.kinds.length];
    DIRQ.push({ at: GAME.t + t0 + k * 1.6, spawn: true, def: true, fn: () => { const e = szSpawnStreet(sp[0], sp[1], [...S.path, ...(s.via ? [s.via] : []), [s.lx, s.lz]], kind); if (e) { e.sq = 'def'; e.src = src; e.toSlot = s; } else s.claimed = false; } }); }
  for (let k = 0; k < nClimb; k++) { const sp = S.spawn[(k + 1) % S.spawn.length]; DIRQ.push({ at: GAME.t + t0 + 5 + k * 3.5, spawn: true, def: true, fn: () => { const e = szSpawnStreet(sp[0], sp[1], S.climb, k % 2 ? 'smg' : 'rifle', true); if (e) { e.sq = 'def'; e.src = src; e.raidP = S.raid; } } }); }
}
function szWave(n) {
  const W = SZ_WAVES[n], di = szDi(); if (!W) return; SZ.srcOn = W.map((g) => g[0]);
  W.forEach(([src, ns, nc, rpg], gi) => szAttack(src, ns[di], nc[di], rpg, gi * 2.5));
  const names = SZ.srcOn.map((k) => SZ_DEF[k].name).join(' ו');
  radio('צנחנים', `גל ${n + 1}! הם באים ${names}!`, 3.2); feed(`גל ${n + 1} מתוך ${SZ_WAVES.length} · ${names}`, 'bad');
}
function szDefUpd(dt) {
  if (szAlive((e) => e.sq === 'def') > 0 || DIRQ.some((q) => q.def)) { SZ.waveT = 4; return; }
  if (SZ.wave >= 0 && SZ.waveT === 4) { feed(`גל ${SZ.wave + 1} נהדף`, 'good'); SZ.srcOn = []; }
  SZ.waveT -= dt; if (SZ.waveT > 0) return;
  SZ.wave++; if (SZ.wave >= SZ_WAVES.length) { szStage(6); return; } szWave(SZ.wave); SZ.waveT = 4;
}
/* the convoy: in from the south street, a halt in the square while the bazookas in the windows on its south side fire at it, then up to the door */
function szConvStart() {
  const path = SZ_CONV_PATH.map(([x, z]) => [LX(x), LZ(z)]), L = pathLen(path), s0 = pathLen(path.slice(0, 4));
  Object.assign(SZ, { convS0: s0, convL: L, convAt: null, cv: false, cvDone: false, filmed: false, convMsgT: 0 });
  SZ.conv.forEach((v, i) => { vehRevive(v); v.path = path; v.s = -i * 9; v.stop = s0 - i * 8; v.stopEnd = L - i * 8; v.ended = false; v.hdV = null; v.hpSeen = 100; v.onDead = () => szConvDead(v); const [x, z, hd] = pathAt(path, 0); vehPose(v, x - Math.sin(hd) * i * 9, z - Math.cos(hd) * i * 9, hd); v.g.visible = true; });
}
function szConvDead(v) {
  radio('שיירה', `${v.name} נפגע ובוער!`, 3); feed(`${v.name} הושמד`, 'bad');
  if (!SZ.conv[1].alive && !SZ.conv[2].alive) endGame(false, 'conv');
}
// the bazooka crews: in the sandbagged windows and on the roofs of the two blocks on the south side of the square, facing it - the ones the
// convoy halts under. Taken in order along the face, every other one, so it is the same ambush every time
function szCvAmbush() {
  const f = (s) => { const lx = s.x - CITY.cx, lz = s.z - CITY.cz; return s.nz === -1 && Math.abs(lz - 24) < 0.5 && ((lx > -84 && lx < -66) || (lx > -50 && lx < -36)); };
  const c = SZ.slots.filter((s) => !s.used && f(s)).sort((a, b) => a.x - b.x || a.y - b.y), di = szDi(), nR = [3, 4, 4][di], nF = [1, 2, 2][di];
  const pickS = c.filter((_, i) => i % 2 === 0).concat(c.filter((_, i) => i % 2 === 1));
  pickS.slice(0, nR + nF).forEach((s, i) => { const e = szPlace(s, i < nR ? 'rpg' : 'rifle', 'cv'); if (e) { e.rpgCd = 3 + i * 2.2; e.cyc = 0.4 + (i % 3) * 0.5; } });
}
const SZ_BEDY = 1.28;   // the wounded lie across the back of a jeep, at this height in its frame
function szRideUpd() { for (const f of FRIENDS) { const v = f.bed; if (!v || !f.aid || !f.bedAt) continue; const p = v.g.localToWorld(V3(f.bedAt[0], SZ_BEDY, f.bedAt[1])); f.unit.pos.set(p.x, p.y, p.z); f.unit.heading = v.hdV + Math.PI; } }
function szConvUpd(dt) {
  if (SZ.filmed) { szRideUpd(); return; }
  const C = SZ.conv; if (!C) return; const sMax = Math.max(...C.filter((v) => v.alive).map((v) => v.s), -1e9);
  for (const v of C) { if (v.alive && v.hp < v.hpSeen - 1) { v.hpSeen = v.hp; if (GAME.t > SZ.convMsgT) { SZ.convMsgT = GAME.t + 4; radio('שיירה', pick(['בזוקה פגעה בג׳יפ! תורידו אותם מהחלונות!', 'אנחנו חוטפים כאן! הבזוקות בחלונות שבדרום הכיכר!']), 2.8); } } }
  // the ambush: the bazooka crews on the south side of the square open up on the halted convoy, and they are the objective until the last of them is down.
  // Eight seconds in, the last attack of the day comes from the west street, for the door (the square and the west: two places, never three)
  if (!SZ.cv && sMax > SZ.convS0 - 70) { SZ.cv = true; szCvAmbush(); SZ.srcOn = ['A']; radio('שיירה', 'כאן שיירת החילוץ, אנחנו בכיכר. חוטפים בזוקות מהחלונות שבדרום הכיכר, לא יכולים להתקדם! תורידו אותם!', 5); hint('sz-cv', `השיירה תקועה בכיכר. צוותי הבזוקה בחלונות ועל הגגות שבדרום הכיכר (◆ על הקרוב): מהחלונות הדרומיים של הקומה הראשונה יש אליהם קו ראייה. ${K('Q')} כוונת.`, 9);
    DIRQ.push({ at: GAME.t + 8, spawn: true, fn: () => { const di = szDi(); szAttack('C', [1, 2, 2][di], [1, 1, 2][di], false, 0); SZ.srcOn = ['A', 'C']; radio('צנחנים', 'הם באים מהרחוב המערבי, לדלת! תשמרו על המדרגות!', 3.2); } }); }
  if (SZ.cv && !SZ.cvDone && szAlive((e) => e.sq === 'cv' && e.kind === 'rpg') === 0) { SZ.cvDone = true; for (const v of C) v.stop = v.stopEnd; feed('הבזוקות מול השיירה חוסלו', 'good'); radio('שיירה', 'הדרך פנויה, ממשיכים אליכם! תכינו את הפצועים למטה!', 4); hint('sz-cv2', 'השיירה בדרך לדלת. עכשיו שמרו על המדרגות ועל דלת התאג״ד: אף מצרי לא עולה עד שהפצועים למטה.', 7); }
  if (!SZ.convAt && SZ.cvDone && C.some((v) => v.alive && v.s >= v.stopEnd - 14)) { SZ.convAt = GAME.t; radio('שיירה', 'אנחנו בדלת! מורידים את הפצועים, מהר!', 3); }
  if (SZ.convAt && !SZ.filmed && szAlive((e) => inTB(e.pos.x, e.pos.z, 0.3)) === 0) szConvoyFilm();
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
    if (!SZ.junction) { SZ.junction = true; TANK.stops = [SZ_TANK_END]; TANK.stopI = 0; TANK.holdAt = null; szAmbush(-100, -15, 4, 14); szSquad(SZ_STREET.j, 0); }
    // nine seconds at the barricade, and the anti-tank gun in the mouth of the north street finds the tank
    if (TANK.holdAt != null && !SZ.bigHit) { SZ.hitT = (SZ.hitT || 0) + dt; if (SZ.hitT > 9) { SZ.bigHit = true; const p = tankTurretWorld(), gm = V3(LX(SZ_GUN[0]) + Math.sin(SZ_GUN[2]) * 2.9, CHH + 1.0, LZ(SZ_GUN[1]) + Math.cos(SZ_GUN[2]) * 2.9); fxMuzzle(gm, true); sndBoom(gm, 1.1); fxTracer(gm, p.clone(), true); tankHit(p.add(V3(rand(-1, 1), 0.5, rand(-1, 1))), true); radio('נהג', 'פגיעה ישירה! תותח בפתח הרחוב! הטנק בוער!', 2.5); DIRQ.push({ at: GAME.t + 2.2, fn: bailOut }); } }
  } else if (SZ.stage === 2 || SZ.stage === 3) {
    szGateUpd(dt);
  } else if (SZ.stage === 4) {
    if (LANE.pts && inTB(P.pos.x, P.pos.z, -0.6)) laneOff(); szCqUpd(dt);
  } else if (SZ.stage === 5) {
    szAutoDoor(dt); szDefUpd(dt); szRaidUpd(dt);
  } else if (SZ.stage === 6) {
    szAutoDoor(dt); szRaidUpd(dt); szConvUpd(dt);
  }
  // the breadcrumb trail the followers walk
  if (SZ.stage >= 2 && SZ.stage <= 4 && P.alive && SZ.trail) updTrail(dt);
  szClarity(dt);
}
function szTimeOfDay() { const base = SZ_MIN - START_MIN; return SZ.stage === 5 ? lerp(16 * 60 + 35 - START_MIN, 17 * 60 + 22 - START_MIN, clamp((SZ.wave + 1 + (SZ.srcOn && SZ.srcOn.length ? 0.5 : 0)) / (SZ_WAVES.length + 0.5), 0, 1)) : SZ.stage === 6 ? lerp(17 * 60 + 22 - START_MIN, 17 * 60 + 40 - START_MIN, clamp(SZ.t / 180, 0, 1)) : base + GAME.t / 6; }

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
  let best = null, bs = 1e9; const R = mode === 'storm' ? 22 : mode === 'fall' ? 26 : 16, pp = P.pos;
  for (const c of SZ.covers || []) {
    if (c.floor !== undefined || (c.by && c.by !== e)) continue;
    const de = Math.hypot(c.x - e.pos.x, c.z - e.pos.z); if (de > R) continue;
    let sc = de;
    if (P.alive) { const tx = pp.x - c.x, tz = pp.z - c.z, dc = Math.hypot(tx, tz); if (dc < 4.5 || (tx * c.nx + tz * c.nz) / dc < 0.45) continue;
      if (mode === 'storm') { if (dc > dE - 2.5) continue; sc = de * 0.8 + dc * 0.5; } else if (mode === 'fall') { if (dc < dE + 6 || de > 26) continue; sc = de * 0.6 + Math.abs(dc - dE - 12) * 0.3; } else sc = de + Math.abs(dc - dE) * 0.15;
      sc -= (c.h > 1.5 ? 1.5 : 0) + (c.door ? 1 : 0); }
    if (sc - 1.5 >= bs) continue;
    const cy = c.y ?? e.pos.y; if (segHitT(e.pos.x, e.pos.y + 1.0, e.pos.z, c.x, cy + 1.0, c.z, 0.3) >= 0) continue;
    sc += (((c.x * 7.13 + c.z * 3.71) % 1) + 1) % 1 * 1.5; if (sc < bs) { bs = sc; best = c; }   // a fixed tie-break per place, not a roll: the same man takes the same cover every time
  }
  return best || (mode === 'storm' ? szPickCover(e, 'hold', dE) : null);   // (falling back finds nothing: he stays where he is)
}
function suezEnemyStep(e, dt, shoot, aimPitch) {
  if (e.dormant && dormantStep(e, dt)) return;
  if (e.sz === 'win') {
    const s = e.slot;
    // a man of the flanked line has not seen the player: he watches the square, standing at his place, and turns only when the player is close or fires
    if (e.flankD) { const dP = Math.hypot(P.pos.x - e.pos.x, P.pos.z - e.pos.z), heard = P.shotT !== undefined && GAME.t - P.shotT < 0.4 && dP < 45;
      if (P.alive && !(dP < 6.5 || heard)) { e.pos.set(s.p[0], s.y, s.p[1]); e.heading = Math.atan2(s.nx, s.nz); e.stance = 'crouch'; e.rig.pose('crouch', e.anim, 0); return; } e.flankD = false; e.cyc = 0.6; e.peek = true; }
    e.cyc -= dt; const aimed = aimedAt(e);
    if (e.guide) { e.peek = true; e.stance = 'crouch'; e.pos.x += (s.p[0] - e.pos.x) * 0.2; e.pos.z += (s.p[1] - e.pos.z) * 0.2; e.pos.y = s.y; const tp = e.guide.tgt ? e.guide.tgt() : tankTurretWorld(); e.face(tp.x, tp.z); e.rig.pose('crouch', e.anim, 0.05); return; }
    // a chapter may offer the Sagger crews another target (the rescue: Shaul's loaded tank); the missile then kills or damages that vehicle
    if (e.atgm && e.peek && e.rpgCd <= 0 && CH() && CH().atgmTarget) { const fn = CH().atgmTarget(e); if (fn) { const tp = fn(), mz = e.muzzle(); if (mz.distanceTo(tp) < 900 && losW(mz.x, mz.y + 0.3, mz.z, tp.x, tp.y, tp.z)) { e.face(tp.x, tp.z); const q = fireAtgm(e, fn); q.vt = true; e.rpgCd = rand(28, 38); return; } } }
    if (e.atgm && e.peek && e.rpgCd <= 0 && P.mode === 'tank' && TANK.alive) { const tp = tankTurretWorld(), mz = e.muzzle(); if (mz.distanceTo(tp) < (MODE === 'armor' ? 1000 : 330) && losW(mz.x, mz.y + 0.3, mz.z, tp.x, tp.y, tp.z)) { e.face(tp.x, tp.z); fireAtgm(e); e.rpgCd = rand(28, 38); return; } }
    const pin = pinned(e) && e.kind !== 'rpg' && P.mode !== 'tank'; if (pin && e.peek) { e.peek = false; e.cyc = Math.max(e.cyc, rand(0.5, 1.1)); }
    if (e.peek && aimed) { e.aimT += dt; if (e.aimT > (P.mode === 'tank' ? 1.4 : 0.8) && e.kind !== 'rpg') e.cyc = Math.min(e.cyc, 0); } else e.aimT = 0;
    if (e.cyc <= 0) { e.peek = !e.peek; if (e.peek && (pin || (aimed && Math.random() < 0.6))) e.peek = false; e.cyc = e.peek ? (e.kind === 'rpg' ? 2.6 : rand(1.2, 3.0)) : rand(0.9, 2.8); if (e.peek) { e.scanCd = 0; e.burst = 0; e.fireCd = rand(0.3, 0.6); e.rpgAim = 0; } }
    if (!e.peek && pin && tacKnows(e, 4)) { e.blindCd = (e.blindCd ?? rand(0.8, 1.6)) - dt; if (e.blindCd <= 0) { e.blindCd = rand(1.6, 3.2); tacFireAt(e, 0.1); } }
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
    if (e.pi < e.path.length && !e.hunter && !e.wild && !e.climb && !e.toSlot && seesP && dP < awareR() && !CINE.on) { e.pi = e.path.length; e.cov = null; e.inCov = false; }
    if (e.pi >= e.path.length && e.toSlot) { if (!e.toSlot.used) { szSeat(e, e.toSlot); e.toSlot = null; return; } e.toSlot = null; }
    if (e.pi < e.path.length) { const w = e.path[e.pi], x0 = e.pos.x, z0 = e.pos.z; e.anim += dt * 9.5; e.stance = 'stand'; if (steer(e, w[0], w[1], 4.6, dt) < 0.9) e.pi++; e.stuckT = Math.hypot(e.pos.x - x0, e.pos.z - z0) < dt * 0.5 ? (e.stuckT || 0) + dt : 0; if (e.stuckT > 2.5) { e.stuckT = 0; e.pi++; } e.rig.pose('run', e.anim); if (seesP && Math.random() < dt * 0.4) { e.face(P.pos.x, P.pos.z); enemyFire(e); } return; }
    if (e.climb) { e.sz = 'climb'; e.raid = SZ.stage >= 5; e.cpath = (e.raidP || SZ_RAID).map(([x, z, f]) => [LX(x), LZ(z), f]); e.ci = 0; return; }
    if (e.kind === 'rpg' && e.rpgCd <= 0 && e.target) { const tp = szRpgTarget(e), mz = e.muzzle(); if (tp && (e.rpgMiss || losW(mz.x, mz.y, mz.z, tp.x, tp.y, tp.z))) { e.face(tp.x, tp.z); e.peek = true; e.stance = 'stand'; if (e.rpgAim === 0) szRpgCall(e); e.rpgAim += dt; e.rig.pose('aim', e.anim, 0); if (e.rpgAim > (e.wild ? 1.2 : 2.2)) { const from = e.muzzle(); fireRocket(from, tp, 'e'); if (MODE === 'suez' && (P.mode === 'tank' || tp.distanceTo(P.pos) < 8)) szFireAt(e, from); fxMuzzle(from, true); sndShot('ak', from); sndBoom(from, 0.3); e.rpgCd = e.wild ? rand(5, 9) : rand(16, 24); e.rpgAim = 0; e.peek = false; } return; } }
    // men firing wild stand in the open and shoot from the hip: no cover, no crouching
    if (e.wild) { e.stance = 'stand'; if (e.target) shoot(); e.rig.pose('aim', e.anim, aimPitch()); return; }
    // each man fights one of two ways: he storms (cover to cover, always closer, the last metres at a run) or he holds (the best cover in reach, kept while it still covers him)
    if (!e.tac) e.tac = e.kind === 'rpg' || e.kind === 'lmg' || e.kind === 'sniper' || ((((e.path && e.path[0] ? e.path[0][0] * 1.37 + e.path[0][1] * 2.11 : 0) % 1) + 1) % 1) > diff.storm ? 'hold' : 'storm';   // who storms and who holds is fixed by where he comes in
    if (e.tac === 'storm' && P.alive && sameFloor && dP < 7.5 && seesP && (e.supp || 0) < 0.9) { if (e.cov) { e.cov.by = null; e.cov = null; } assault(); return; }
    const sq = sqOf(e);
    // a squad that has lost most of its men falls back once, to cover further off, and holds there
    if (sq && sq.broken && !e.fellBack && P.alive) { e.fellBack = true; e.tac = 'hold'; const fc = szPickCover(e, 'fall', dP); if (fc) { if (e.cov) e.cov.by = null; fc.by = e; e.cov = fc; e.inCov = false; e.covRunT = 0; e.coverT = rand(8, 12); e.cyc = rand(0.4, 1); e.peek = false; } }
    // the player has stayed put against this squad: its first rifleman goes round to a cover off to his side
    if (sq && !sq.broken && P.alive && PSTILL.t > tacK().flank && GAME.t - sq.flankT > 18 && tacKnows(e, 5) && !e.flanking && (e.kind === 'rifle' || e.kind === 'smg')) {
      let first = null; for (const m of sq.men) if (m.alive && sqKey(m) === sqKey(e) && m.sz === 'street' && !m.dormant && (m.kind === 'rifle' || m.kind === 'smg')) { first = m; break; }
      if (first === e) { sq.flankT = GAME.t; const fc = szPickFlank(e, sq); if (fc) { if (e.cov) e.cov.by = null; fc.by = e; e.cov = fc; e.inCov = false; e.covRunT = 0; e.flanking = true; e.coverT = rand(10, 14); e.tac = 'hold'; } } }
    // the cover is judged against where the player is now: once he is beside it or behind it, it covers nothing and the man moves
    e.covChk = (e.covChk || 0) - dt;
    if (e.cov && e.covChk <= 0) { e.covChk = 0.5; if (!szCovFaces(e.cov, 0.1)) { e.cov.by = null; e.cov = null; e.inCov = false; } }
    e.noCovT = (e.noCovT || 0) - dt;
    if (e.cov && e.inCov && e.coverT <= 0 && !sqMayMove(e)) e.coverT = rand(0.8, 1.6);   // not yet: too many of his squad are out in the open
    if ((!e.cov || (e.inCov && e.coverT <= 0)) && e.noCovT <= 0) {
      const old = e.cov, nc = szPickCover(e, e.tac, dP);
      if (nc && nc !== old) { if (old) old.by = null; nc.by = e; e.cov = nc; e.inCov = false; e.cyc = rand(0.4, 1.0); e.peek = false; e.covRunT = 0; }
      if (!nc && !old) e.noCovT = 1.5;
      if (e.cov) e.coverT = e.tac === 'storm' ? rand(2.8, 5) : rand(6, 10);
    }
    if (e.cov) { const d = Math.hypot(e.cov.x - e.pos.x, e.cov.z - e.pos.z);
      if (d > 0.5 && !e.inCov) { e.covRunT = (e.covRunT || 0) + dt; if (e.covRunT > (e.flanking ? 14 : 7)) { e.cov.by = null; e.cov = null; e.noCovT = 2; e.flanking = false; return; } e.anim += dt * 9.5; steer(e, e.cov.x, e.cov.z, e.tac === 'storm' ? 4.8 : 4.2, dt); e.rig.pose('run', e.anim); if (seesP && Math.random() < dt * 0.6) { e.face(P.pos.x, P.pos.z); enemyFire(e); } return; }
      e.inCov = true; e.flanking = false; coverCycle(e, dt, e.cov, shoot, aimPitch); return; }
    // no cover within reach: a man who storms comes on in short rushes, down on a knee to fire between them; a man who holds kneels where he is
    if (e.tac === 'storm' && P.alive && seesP && dP > 7.5 && !pinned(e)) {
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
const SZ_POSAID = [-75.0, -35.0, 'מול דלת התאג״ד'];   // where the raiders who come up the stairs are met
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
  } else if (SZ.stage === 5 || SZ.stage === 6) {
    // the window that faces each place the attack comes from now, all on the first floor; the door of the aid post once one of them is inside
    if (szAlive((e) => e.raid && inTB(e.pos.x, e.pos.z, 0.3))) out.push({ x: LX(SZ_POSAID[0]), z: LZ(SZ_POSAID[1]), y: CHH + FLH, label: SZ_POSAID[2] });
    for (const k of (SZ.srcOn && SZ.srcOn.length ? SZ.srcOn : SZ.stage === 6 ? ['A'] : [])) { const q = SZ_DEF[k].pos; if (out.length < 3) out.push({ x: LX(q[0]), z: LZ(q[1]), y: CHH + FLH, label: q[2] }); }
  }
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
  if ((SZ.stage === 2 || SZ.stage === 3) && GATE.on) return szGateObj();
  if (SZ.stage === 4) {
    if (SZ.cqRoom >= 0 && !SZ.cqClr) { const e = szNearest((q) => q.cqr === SZ.cqRoom); if (e) return [e.pos.x, e.pos.y + 1.8, e.pos.z, 'מצרי בחדר', 'foe']; }
    const st = SZ_CQB[SZ.cq]; if (!st) return null; const f = st.at[2], d = SZD[st.door], pf = tbFloor(P.pos.y);
    // the next door is a floor up: the foot of the flight that goes there from the player's floor
    if (pf < f) { const fl = [[-80.8, -30.6], [-78.6, -36.2], [-80.8, -31.2]][pf] || [-80.8, -30.6]; return [LX(fl[0]), CHH + pf * FLH, LZ(fl[1]), `מדרגות · ${f === 3 ? 'הגג' : 'קומה ' + f}`]; }
    return [LX(d.x), CHH + f * FLH + 1.2, LZ(d.z), f === 3 ? 'היציאה לגג' : st.room < 0 ? 'דלת המדרגות' : 'הדלת הבאה'];
  }
  if (SZ.stage >= 5) {
    if (szAlive((e) => e.raid && inTB(e.pos.x, e.pos.z, 0.3))) return [LX(SZ_AID.door[0]), CHH + FLH, LZ(SZ_AID.door[1]), 'דלת התאג״ד'];
    if (SZ.stage === 5) { const e = szNearest((q) => q.sq === 'def'); if (e) return [e.pos.x, e.pos.y + 1.6, e.pos.z, SZ_DEF[e.src] ? `התוקפים ${SZ_DEF[e.src].name}` : 'מצרי', 'foe']; }
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
  if (SZ.stage === 2) hint('sz-run', `הצנחנים (כחול) הולכים אחריכם בטור. כל מי שיורה עליכם מקבל סימן כתום וקשת כתומה בשולי המסך. העמדות שלהם תמיד לפניכם, לאורך הסמטה: מחסה בירוק, ירו משם, והתקדמו כשהם מתחבאים.`, 8);
  if (SZ.stage === 3) hint('sz-sq3', `צוות התותח בבור השקים בפתח הרחוב, וגבם אליכם: הם מכוונים לשדרה. ירו ראשונים, רימון (${K('G')}) לבור עובד טוב. אחר כך תגיע התקפה מצפון ברחוב, ואז לדלת הצדדית של בניין הפינה.`, 9);
  if (SZ.stage === 4) hint('sz-cqb', `כל הדלתות בבניין סגורות. מנקים חדר, ניגשים לדלת הבאה (◆) והיא נפתחת: רימון פנימה (${K('G')}), חכו לפיצוץ, והיכנסו. הצנחנים אחריכם.`, 9);
  if (SZ.stage === 5) hint('sz-hold', `מגינים מהקומה הראשונה. העמדה בחלון שפונה אל התוקפים מסומנת בירוק. מי שפורץ לבניין עולה במדרגות ישר אל התאג״ד (✚): שמרו על הדלת שלו, ורימון (${K('G')}) לכל מי שעולה.`, 9);
  if (SZ.stage === 6 && !SZ.cv && SZ.t > 2) hint('sz-conv', 'השיירה נכנסת מהרחוב הדרומי (◆). היא תיעצר בכיכר תחת אש בזוקות מהחלונות שבדרום הכיכר: תפסו עמדה בחלון שפונה לכיכר (מסומן בירוק) ותכסו אותה משם.', 9);
}
function suezItems(items) {
  const S = SZ_STAGES[SZ.stage]; items.push(['go', (S.goal || S.sub) + (OBJ.on ? ' (◆)' : '')]);
  if (SZ.stage <= 1) { items.push([TANK.hp < 40 ? 'warn' : '', `מצב הטנק: ${Math.max(0, Math.round(TANK.hp))}% · פגז: ${TANK.gunT > 0 ? `טוען ${Math.ceil(TANK.gunT)}` : 'מוכן'}`]); items.push(['', `מצרים בחלונות ובגגות: ${szAlive((e) => e.sz === 'win')} · ברחוב: ${szAlive((e) => e.sz === 'street')}`]); }
  if ((SZ.stage === 2 || SZ.stage === 3) && GATE.on) szGateItem(items);
  if (SZ.stage >= 2 && SZ.stage <= 4) { const n = FRIENDS.filter((f) => f.state === 'follow').length; items.push([n < 2 ? 'warn' : '', `צנחנים איתכם: ${n}`]); }
  if (SZ.stage === 4) { const done = SZ_CQB.slice(0, SZ.cq).filter((q) => q.room >= 0).length - (SZ.cqClr ? 0 : 1); items.push([SZ.cqClr ? 'next' : '', SZ.cqClr ? `החדר נקי · לדלת הבאה (◆) · ${done}/10` : `מנקים חדר · מצרים בו: ${szAlive((e) => e.cqr === SZ.cqRoom)} · ${done}/10`]); }
  if (SZ.stage >= 5) {
    if (SZ.stage === 5) items.push(['next', SZ.srcOn && SZ.srcOn.length ? `גל ${SZ.wave + 1} מתוך ${SZ_WAVES.length} · ${SZ.srcOn.map((k) => SZ_DEF[k].name).join(' ו')}` : `בין הגלים · ${Math.max(0, SZ.wave + 1)}/${SZ_WAVES.length} נהדפו`]);
    else if (SZ.convAt) items.push(['next', 'השיירה בדלת! נקו את הבניין מהמצרים (◆)']);
    else if (SZ.cvDone) items.push(['next', 'השיירה בדרך לדלת: שמרו על המדרגות ועל דלת התאג״ד']);
    else if (SZ.cv) { items.push(['next', 'השיירה תקועה בכניסה לכיכר']); items.push(['warn', `חסלו את הבזוקות שמסביב לכיכר (◆): ${szAlive((e) => e.sq === 'cv' && e.kind === 'rpg')}`]); }
    else items.push(['next', 'השיירה ברחוב הדרומי: תפסו עמדה בחלון שפונה לכיכר']);
    const left = szWoundedLeft(); items.push([left < SZ_WOUNDED.length ? 'warn' : 'med', `פצועים בתאג״ד: ${left} מתוך ${SZ_WOUNDED.length}`]);
    const inB = szAlive((e) => inTB(e.pos.x, e.pos.z, 0.3)); if (inB) items.push(['warn', `מצרים בתוך הבניין: ${inB}`]);
  }
}
function drawSuezMinimap(g, X, poly, dot, k) {
  g.fillStyle = 'rgba(150,140,118,.9)'; g.fillRect(0, 0, MINI.c.width, MINI.c.width);
  const rect = (x0, x1, z0, z1) => poly([[LX(x0), LZ(z0)], [LX(x1), LZ(z0)], [LX(x1), LZ(z1)], [LX(x0), LZ(z1)]]);
  g.fillStyle = 'rgba(70,70,66,.95)'; for (const r of [[-36, 245, -8, 8], [-84, -36, -24, 24], [-66, -50, -105, 105], [-110, -84, -8, 8], [-32, -27.5, -36.5, -11], [-50, -27.5, -36.5, -32]]) { rect(...r); g.fill(); }
  g.fillStyle = 'rgba(205,190,160,.95)'; for (const [x0, x1, z0, z1] of SZ.blocks) { poly([[x0, z0], [x1, z0], [x1, z1], [x0, z1]]); g.fill(); }
  rect(TB.x0, TB.x1, TB.z0, TB.z1); g.fillStyle = SZ.stage >= 2 ? '#ffcf73' : 'rgba(225,212,180,.95)'; g.fill(); g.lineWidth = 2; g.strokeStyle = '#3a2f1c'; g.stroke();
  laneMini(g, X, k);
  if (TANK.g && TANK.g.visible) { const [a, b] = X(TANK.g.position.x, TANK.g.position.z); g.save(); g.translate(a, b); g.fillStyle = TANK.alive ? '#6fa8ff' : '#ff6b5c'; g.fillRect(-6, -6, 12, 12); g.restore(); }
  if (SZ.conv) for (const v of SZ.conv) { if (!v.g.visible) continue; const [a, b] = X(v.g.position.x, v.g.position.z); g.fillStyle = v.alive ? '#6fa8ff' : 'rgba(40,36,30,.8)'; g.fillRect(a - 4, b - 4, 8, 8); }
  if (SZ.stage >= 5) { const [a, b] = X(LX(SZ_AID.c[0]), LZ(SZ_AID.c[1])); g.fillStyle = '#ff6b5c'; g.fillRect(a - 6, b - 2, 12, 4); g.fillRect(a - 2, b - 6, 4, 12); }
  for (const q of SZPOS.picks) { const [a, b] = X(q.x, q.z); g.beginPath(); g.arc(a, b, 5.5, 0, 6.283); g.fillStyle = 'rgba(147,212,141,.9)'; g.fill(); g.lineWidth = 2; g.strokeStyle = 'rgba(10,20,12,.8)'; g.stroke(); }
}

/* ---------- starting chapter 2, checkpoints ---------- */
function szShow(on) { showWorld(on ? 'suez' : 'mezach'); if (SZ.ht) SZ.ht.visible = on && SZ.stage >= 2; if (on) szAveOn(SZ.stage >= 2); for (const id in SZD) if (SZD[id].bar) SZD[id].piv.visible = on && !SZD[id].open; if (SZ.aidG) SZ.aidG.visible = on && SZ.stage >= 5; if (SZ.conv) for (const v of SZ.conv) v.g.visible = on && SZ.stage === 6 && !!v.path; }
function szResetTank(s) { Object.assign(TANK, { hp: 100, s, speed: 0, alive: true, burning: false, stopI: 0, holdAt: null, mg: 0, gunT: 0, recoil: 0, fireT: 0, hdV: null, path: [[232, 4], [-28, 4], [-44, 6]] }); if (SZ.lead) { vehRevive(SZ.lead); SZ.lead.shown = s < 100; SZ.lead.g.visible = SZ.lead.shown; if (s >= 100) SZ.lead.alive = false; } SZ.leadHit = s >= 100; for (const f of TANK.fireS) f.visible = false; LIGHTS.fire.intensity = 0; TANK.turret.rotation.y = 0; TANK.gun.rotation.x = 0; }
function szSetup(stage) {
  clearBattle(); for (const s of SZ.slots) s.used = false; for (const c of SZ.covers) c.by = null;
  Object.assign(P, { vy: 0, crouch: false, hp: 100, lastHit: -9, mag: 20, reserve: 160, gren: diff.gren0, reloadT: 0, fireCd: 0, ads: 0, recoil: 0, post: null, carrying: null, hold: 0, kick: 0, throwT: 0, ammoCd: 0 }); P.alive = true;
  SZ.bailed = stage >= 2; SZ.bigHit = stage >= 2; SZ.hitT = 0; SZ.junction = false; SZ.clearT = 0; SZ.convAt = null; SZ.cv = false; SZ.cvDone = false; SZ.filmed = false; INPUT.tAds = false; $('#tads').classList.remove('on');
  if (SZ.conv) for (const v of SZ.conv) { v.g.visible = false; v.path = null; } if (SZ.aidG) SZ.aidG.visible = stage >= 5;
  szResetTank([0, 210, SZ_TANK_END, SZ_TANK_END, SZ_TANK_END, SZ_TANK_END, SZ_TANK_END][stage]); if (stage >= 2) { TANK.alive = false; TANK.burning = true; TANK.hp = 0; }
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
/* ---------- film: the convoy at the door. The wounded go down to the jeeps, and the convoy pulls out the way it came, south ---------- */
function szConvoyFilm() {
  if (SZ.filmed) return; SZ.filmed = true; SZ.cvDone = true;
  for (const e of UNITS.enemies) if (e.alive) killEnemy(e, false); for (let i = DIRQ.length - 1; i >= 0; i--) if (DIRQ[i].spawn) DIRQ.splice(i, 1);
  const [T, H1, H2] = SZ.conv, door = V3(LX(-76.3), CHH, LZ(TB.z1)), sq = V3(LX(-60), CHH, LZ(-2));
  const lead = () => { const v = SZ.conv.find((w) => w.alive) || H1; return v.g.position.clone(); };
  // the wounded are carried down between the first and the second shot: by then they lie across the backs of the jeeps and the squad stands behind them
  const load = () => {
    const W = FRIENDS.slice(10, 15).filter((f) => f.aid && f.state === 'saved'), hts = [H1, H2].filter((v) => v.alive); if (!hts.length) hts.push(H1);
    W.forEach((f, i) => { const v = hts[i % hts.length], k = Math.floor(i / hts.length); f.bed = v; f.bedAt = [[-1.15, -0.32], [-1.15, 0.32], [0.15, 0]][k % 3]; const p = v.g.localToWorld(V3(f.bedAt[0], SZ_BEDY, f.bedAt[1])); f.unit.place(p.x, p.z); f.unit.pos.y = p.y; f.unit.heading = v.hdV + Math.PI; f.unit.sync(); });
    FRIENDS.slice(0, 6).forEach((f, i) => { if (f.state !== 'post' && f.state !== 'follow') return; const v = hts[i % hts.length], p = v.g.localToWorld(V3(-3.2 - Math.floor(i / hts.length) * 1.1, 0, (i % 2 ? 1 : -1) * 0.9)); f.state = 'post'; f.target = null; f.unit.place(p.x, p.z, CHH + 0.2); f.unit.heading = v.hdV; f.unit.stance = 'stand'; f.unit.sync(); });
    { const m = FRIENDS[15]; if (m.state === 'post') { const p = (hts[0]).g.localToWorld(V3(-2.8, 0, 1.4)); m.unit.place(p.x, p.z, CHH + 0.2); m.unit.heading = hts[0].hdV; m.unit.sync(); } }
  };
  // each vehicle leaves from where it stands, the last first: back across the square and down the south street. The wounded ride along
  const leave = () => { SZ.conv.forEach((v, i) => { if (!v.alive) return; v.path = [[v.g.position.x, v.g.position.z], ...[[-64, -6], [-61, 8], [-58.5, 24], [-58, 40], [-58, 110]].map(([x, z]) => [LX(x), LZ(z)])]; v.s = 0; v.stop = 0; v.ended = true; v.vmax = 7; DIRQ.push({ at: GAME.t + (2 - i) * 1.4, fn: () => { v.stop = undefined; } }); });
    SZ.rideT = 0; };
  playCine({ vid: 'sz_convoy',
    title: 'כיכר אל־ארבעין · 17:25',
    shots: [
      { d: 4.2, cam: camLerp(() => sq.clone().add(V3(18, 7, 2)), () => sq.clone().add(V3(8, 5, -4)), () => door.clone().add(V3(0, 1.5, 0)), () => lead().add(V3(0, 1.5, 0)), 44) },
      { d: 4.8, cam: (u) => ({ p: door.clone().add(V3(10.5 - u * 1.5, 2.8, 15)), l: H1.g.position.clone().add(V3(-0.5, 1.5, 0)), fov: 40 }) },
      { d: 6.0, cam: (u) => ({ p: V3(LX(-79 + u * 2), CHH + 2.6 + u * 1.8, LZ(-12)), l: lead().add(V3(0, 1.4, 0)), fov: 50 - u * 8 }) },
    ],
    ev: [[3.9, load], [9.2, leave]],
    caps: [[0.3, '<b>17:25.</b> שיירת החילוץ מגיעה לדלת הבניין.', 3.5], [4.3, 'הצנחנים מורידים את הפצועים מהתאג״ד ומעמיסים אותם על הג׳יפים.', 4.4], [9.4, 'הג׳יפים יוצאים דרומה. מי שנשאר בבניין ייצא בלילה ברגל, בסמטאות, עד לקווינו.', 5.2]],
    end: () => { DIRQ.push({ at: GAME.t + 0.3, fn: () => endGame(true) }); },
  });
}
function szEnd(win, why) {
  const stats = [[STATS.kills, 'אויבים נפגעו'], [SZ.stage >= 5 ? szWoundedLeft() : Math.max(0, Math.round(TANK.hp)), SZ.stage >= 5 ? 'פצועים חולצו' : 'מצב הטנק %'], [SZ.stage + 1, 'השלב שהגעתם אליו']];
  if (win) return ['הפצועים חולצו', 'הג׳יפים יצאו מהכיכר דרומה עם הפצועים. מי שנשאר בבניין יצא בלילה ברגל, בסמטאות, ועד הבוקר הגיע לקווינו. בקרב על סואץ, שעות לפני הפסקת האש, נפלו 80 לוחמים ו־120 נפצעו.', stats];
  if (why === 'tank') return ['הטנק הושמד', 'צוותי הבזוקה בחלונות מכוונים לטנק שנייה לפני שהם יורים. כשרואים אחד מציץ, מקלע 0.5 או פגז לחלון שלו, מיד.', stats];
  if (why === 'aid') return ['התאג״ד נפל', 'המצרים הגיעו לפצועים. מי שפורץ לבניין עולה במדרגות ישר אליהם: כשמישהו בפנים, עזבו את החלון ועמדו מול דלת התאג״ד, רימון לכל מי שעולה.', stats];
  if (why === 'conv') return ['השיירה הושמדה', 'צוותי הבזוקה בחלונות שבדרום הכיכר יורים על הג׳יפים. מהחלונות של הבניין יש אליהם קו ראייה: כוונת, ראש, הבא. הם מציצים לכמה שניות לפני שהם יורים.', stats];
  return ['נפגעת', 'בטנק אפשר להיכנס לצריח כשהאש כבדה. בסמטאות: עמדה אחרי עמדה, תמיד ממחסה. בבניין: הדלת נפתחת כשמגיעים אליה - רימון פנימה, ונכנסים אחרי הפיצוץ.', stats];
}
CHAP.suez = { stages: SZ_STAGES, st: () => SZ.stage, cp: () => SZ.cp, upd: updSuez, obj: suezObjective, hints: suezHints, items: suezItems, mini: drawSuezMinimap, restore: szRestore, tod: szTimeOfDay, start: startSuez, end: szEnd, tank: true };
