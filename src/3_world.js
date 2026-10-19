
/* ================= detail textures ================= */
function tileBlotches(g, n, r, count, rmin, rmax, colDark, colLight, pDark) {
  for (let i = 0; i < count; i++) {
    const x = r() * n, y = r() * n, rad = rmin + r() * (rmax - rmin), dark = r() < pDark;
    for (const ox of [-n, 0, n]) for (const oy of [-n, 0, n]) {
      const cx = x + ox, cy = y + oy; if (cx + rad < 0 || cx - rad > n || cy + rad < 0 || cy - rad > n) continue;
      const gr = g.createRadialGradient(cx, cy, 0, cx, cy, rad); gr.addColorStop(0, dark ? colDark : colLight); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(cx - rad, cy - rad, rad * 2, rad * 2);
    }
  }
}
/* the buildings' textures at twice the resolution: the same drawing, scaled up (hiCanvas), and over it a grain only the finer canvas can hold */
function hiCanvas(W, H = W, k = 2) { const c = canvas(W * k, H * k), g = c.getContext('2d'); g.scale(k, k); return [c, g]; }
function fineGrain(g, c, r, n, dark, light) { g.setTransform(1, 0, 0, 1, 0, 0); for (let i = 0; i < n; i++) { g.fillStyle = r() < 0.5 ? dark : light; g.fillRect(r() * c.width, r() * c.height, 1, 1); } }
function grimeTex() {
  const n = 256, [c, g] = hiCanvas(n), r = rng(301);
  g.fillStyle = '#eeeeec'; g.fillRect(0, 0, n, n);
  tileBlotches(g, n, r, 70, 10, 46, 'rgba(110,100,86,0.24)', 'rgba(255,255,255,0.32)', 0.6);
  for (let i = 0; i < 90; i++) { const x = r() * n, y = r() * n, h = 10 + r() * 60, w = 1 + r() * 2; g.fillStyle = `rgba(95,84,70,${0.05 + r() * 0.12})`; g.fillRect(x, y, w, h); if (y + h > n) g.fillRect(x, y - n, w, h); }
  for (let i = 0; i < 3200; i++) { g.fillStyle = r() < 0.5 ? `rgba(70,62,52,${0.1 + r() * 0.25})` : `rgba(255,255,255,${0.1 + r() * 0.2})`; g.fillRect(r() * n, r() * n, 1, 1); }
  fineGrain(g, c, r, 9000, 'rgba(70,62,52,0.16)', 'rgba(255,255,255,0.14)');
  const t = tex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
function fabricTex() {
  const n = 128, c = canvas(n), g = c.getContext('2d'), img = g.createImageData(n, n), r = rng(41);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { const w = ((x + (y >> 1)) % 4 < 2 ? 7 : -7) + ((y + (x >> 1)) % 4 < 2 ? 5 : -5); const v = clamp(228 + w + (r() - 0.5) * 16, 0, 255); const i = (y * n + x) * 4; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
  g.putImageData(img, 0, 0); tileBlotches(g, n, r, 16, 8, 30, 'rgba(90,80,60,0.2)', 'rgba(255,255,255,0.12)', 0.7);
  const t = tex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 3); return t;
}
function burlapTex() {
  const n = 256, c = canvas(n), g = c.getContext('2d'), img = g.createImageData(n, n), r = rng(52);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const cell = ((x >> 2) + (y >> 2)) & 1; const ph = cell ? Math.sin((x & 3) / 4 * Math.PI) : Math.sin((y & 3) / 4 * Math.PI);
    const v = clamp(196 + 40 * ph + (r() - 0.5) * 40, 0, 255); const i = (y * n + x) * 4; img.data[i] = v; img.data[i + 1] = v * 0.95; img.data[i + 2] = v * 0.84; img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  tileBlotches(g, n, r, 26, 12, 50, 'rgba(96,82,60,0.3)', 'rgba(236,224,196,0.28)', 0.55);
  g.fillStyle = 'rgba(70,60,44,0.55)'; g.fillRect(0, 0, 3, n); g.fillRect(n / 2 - 1, 0, 2, n);
  const t = tex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
function facadeTex() {
  const W = 512, H = 512, [c, g] = hiCanvas(W, H), r = rng(63), pk = (a) => a[Math.floor(r() * a.length)];
  g.fillStyle = '#ece7dc'; g.fillRect(0, 0, W, H);
  tileBlotches(g, W, r, 40, 20, 90, 'rgba(150,138,118,0.22)', 'rgba(255,255,255,0.2)', 0.7);
  const top = 46, bottom = 30, rows = 3, cols = 4, fh = (H - top - bottom) / rows, cw = W / cols;
  g.fillStyle = 'rgba(90,80,68,0.35)'; g.fillRect(0, top - 7, W, 7);
  for (let row = 1; row < rows; row++) { g.fillStyle = 'rgba(130,118,100,0.35)'; g.fillRect(0, top + row * fh - 4, W, 6); }
  for (let row = 0; row < rows; row++) for (let col = 0; col < cols; col++) {
    const x = col * cw + cw * 0.22, y = top + row * fh + fh * 0.18, w = cw * 0.56, h = fh * 0.58; const k = r();
    const st = g.createLinearGradient(0, y + h, 0, y + h + fh * 0.5); st.addColorStop(0, 'rgba(110,98,82,0.35)'); st.addColorStop(1, 'rgba(110,98,82,0)'); g.fillStyle = st; g.fillRect(x + w * 0.2, y + h, w * 0.6, fh * 0.5);
    g.fillStyle = '#bcb4a5'; g.fillRect(x - 6, y - 6, w + 12, h + 10);
    if (k < 0.42) { g.fillStyle = pk(['#5d6b52', '#4b5f6e', '#6b5440', '#7a7a6c', '#46604f']); g.fillRect(x, y, w, h); g.fillStyle = 'rgba(0,0,0,0.28)'; for (let q = 4; q < h; q += 7) g.fillRect(x, y + q, w, 2); g.fillRect(x + w / 2 - 1, y, 2, h); }
    else if (k < 0.86) { g.fillStyle = '#20262a'; g.fillRect(x, y, w, h); g.fillStyle = 'rgba(170,190,200,0.22)'; g.fillRect(x + 4, y + 4, w * 0.38, h * 0.5); g.fillStyle = '#a39c8c'; g.fillRect(x + w / 2 - 2, y, 4, h); g.fillRect(x, y + h * 0.45, w, 3); }
    else { g.fillStyle = '#0d0d0d'; g.fillRect(x, y, w, h); const sg = g.createLinearGradient(0, y, 0, y - fh * 0.6); sg.addColorStop(0, 'rgba(20,18,16,0.7)'); sg.addColorStop(1, 'rgba(20,18,16,0)'); g.fillStyle = sg; g.fillRect(x - 10, y - fh * 0.6, w + 20, fh * 0.6); }
    g.fillStyle = '#d8d1c2'; g.fillRect(x - 9, y + h + 3, w + 18, 6);
    if (row === 1 && r() < 0.4) { g.fillStyle = '#b0a898'; g.fillRect(x - 14, y + h + 8, w + 28, 8); g.fillStyle = 'rgba(40,36,30,0.6)'; for (let q = 0; q < w + 28; q += 6) g.fillRect(x - 14 + q, y + h - 12, 2, 20); }
  }
  for (let i = 0; i < 2500; i++) { g.fillStyle = r() < 0.5 ? 'rgba(90,80,66,0.18)' : 'rgba(255,255,255,0.2)'; g.fillRect(r() * W, r() * H, 1 + r() * 2, 1 + r() * 2); }
  g.fillStyle = 'rgba(80,70,58,0.35)'; g.fillRect(0, H - bottom, W, bottom);
  fineGrain(g, c, r, 26000, 'rgba(90,80,66,0.12)', 'rgba(255,255,255,0.12)');
  return tex(c);
}
function woodTex() {
  const n = 256, [c, g] = hiCanvas(n), r = rng(88);
  g.fillStyle = '#7b5334'; g.fillRect(0, 0, n, n);
  for (let i = 0; i < 70; i++) { const y0 = r() * n, a = 2 + r() * 6, f = 0.01 + r() * 0.03, ph = r() * 6; g.strokeStyle = r() < 0.6 ? `rgba(58,36,20,${0.25 + r() * 0.35})` : `rgba(170,120,78,${0.2 + r() * 0.3})`; g.lineWidth = 0.6 + r() * 1.8; g.beginPath(); for (let x = 0; x <= n; x += 4) { const y = y0 + Math.sin(x * f + ph) * a; x ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
  tileBlotches(g, n, r, 12, 10, 40, 'rgba(40,24,12,0.25)', 'rgba(200,150,100,0.15)', 0.6);
  fineGrain(g, c, r, 7000, 'rgba(40,24,12,0.16)', 'rgba(210,160,110,0.1)');
  const t = tex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
function netTex() {
  const n = 256, c = canvas(n), g = c.getContext('2d'), r = rng(95);
  g.strokeStyle = 'rgba(44,42,34,1)'; g.lineWidth = 1.6;
  for (let k = -n; k < 2 * n; k += 14) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k + n, n); g.stroke(); g.beginPath(); g.moveTo(k + n, 0); g.lineTo(k, n); g.stroke(); }
  const cols = ['#6b6a45', '#7d7350', '#5a5a3a', '#8a7d58', '#4e5236', '#9a8a60', '#a8966a'];
  for (let i = 0; i < 620; i++) {
    const x = r() * n, y = r() * n, s = 4 + r() * 10, a = r() * 6.28; g.fillStyle = cols[Math.floor(r() * cols.length)];
    for (const ox of [-n, 0, n]) for (const oy of [-n, 0, n]) { if (x + ox < -20 || x + ox > n + 20 || y + oy < -20 || y + oy > n + 20) continue; g.beginPath(); for (let k = 0; k < 5; k++) { const aa = a + k * 1.256, rr = s * (0.5 + r() * 0.6); const px = x + ox + Math.cos(aa) * rr, py = y + oy + Math.sin(aa) * rr * 0.6; k ? g.lineTo(px, py) : g.moveTo(px, py); } g.closePath(); g.fill(); }
  }
  const t = tex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2.2, 2.2); return t;
}
function shrubTex() {
  const n = 128, c = canvas(n), g = c.getContext('2d'), r = rng(33); g.lineCap = 'round';
  const branch = (x, y, a, len, w, depth) => {
    const x2 = x + Math.sin(a) * len, y2 = y - Math.cos(a) * len; g.strokeStyle = `rgb(${96 + depth * 9},${84 + depth * 7},${64 + depth * 4})`; g.lineWidth = w; g.beginPath(); g.moveTo(x, y); g.lineTo(x2, y2); g.stroke();
    if (depth < 4) { const nb = 2 + (r() < 0.5 ? 1 : 0); for (let k = 0; k < nb; k++) branch(x2, y2, a + (r() - 0.5) * 1.4, len * (0.62 + r() * 0.2), w * 0.68, depth + 1); }
    else for (let k = 0; k < 3; k++) { g.fillStyle = r() < 0.5 ? 'rgba(122,120,82,0.95)' : 'rgba(150,136,98,0.95)'; g.beginPath(); g.arc(x2 + (r() - 0.5) * 5, y2 + (r() - 0.5) * 5, 1.4 + r() * 2.2, 0, 6.283); g.fill(); }
  };
  for (let k = 0; k < 6; k++) branch(n / 2 + (r() - 0.5) * 14, n - 2, (r() - 0.5) * 1.5, n * 0.2, 3.2, 0);
  return tex(c);
}
function frondTex() {
  const W = 256, H = 64, c = canvas(W, H), g = c.getContext('2d'), r = rng(17); g.lineCap = 'round';
  for (let x = 8; x < W - 4; x += 3.2) {
    const L = 28 * Math.sin(Math.PI * Math.min(1, x / W * 1.15)) + 2; const col = r() < 0.2 ? '#9a8a55' : r() < 0.5 ? '#56683a' : '#687a45';
    g.strokeStyle = col; g.lineWidth = 1.8;
    for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(x, 32); g.lineTo(x + 9, 32 + sd * L); g.stroke(); }
  }
  g.strokeStyle = '#6b5a38'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, 32); g.lineTo(W, 32); g.stroke();
  return tex(c);
}
function scorchTex() {
  const n = 256, c = canvas(n), g = c.getContext('2d'), r = rng(71);
  for (let i = 0; i < 26; i++) { const a = r() * 6.283, d = n * (0.28 + r() * 0.12); const x = n / 2 + Math.cos(a) * d, y = n / 2 + Math.sin(a) * d, rad = 10 + r() * 24; const gr = g.createRadialGradient(x, y, 0, x, y, rad); gr.addColorStop(0, 'rgba(214,196,160,0.45)'); gr.addColorStop(1, 'rgba(214,196,160,0)'); g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2); }
  for (let i = 0; i < 130; i++) { const a = r() * 6.283, d = Math.pow(r(), 1.6) * n * 0.34; const x = n / 2 + Math.cos(a) * d, y = n / 2 + Math.sin(a) * d, rad = 6 + r() * 26; const al = 0.4 * (1 - d / (n * 0.38)); const gr = g.createRadialGradient(x, y, 0, x, y, rad); gr.addColorStop(0, `rgba(30,26,22,${al})`); gr.addColorStop(1, 'rgba(30,26,22,0)'); g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2); }
  g.lineCap = 'round';
  for (let i = 0; i < 46; i++) { const a = r() * 6.283, l = n * (0.18 + r() * 0.26); g.strokeStyle = `rgba(36,30,24,${0.12 + r() * 0.22})`; g.lineWidth = 1 + r() * 3.5; g.beginPath(); g.moveTo(n / 2 + Math.cos(a) * 12, n / 2 + Math.sin(a) * 12); g.lineTo(n / 2 + Math.cos(a) * l, n / 2 + Math.sin(a) * l); g.stroke(); }
  const gr = g.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n * 0.12); gr.addColorStop(0, 'rgba(18,15,12,0.75)'); gr.addColorStop(1, 'rgba(18,15,12,0)'); g.fillStyle = gr; g.fillRect(0, 0, n, n);
  return tex(c);
}
function bumpOf(t) { const b = t.clone(); b.colorSpace = THREE.NoColorSpace; b.needsUpdate = true; return b; }

/* ================= shared materials & helpers ================= */
const TX = { grime: grimeTex(), fabric: fabricTex(), burlap: burlapTex(), gabion: gabionTex(), stone: stoneTopTex(), wood: woodTex(), net: netTex(), micro: microTex() };
TX.micro.repeat.set(3, 3);
const MAT = {
  vc: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.8, metalness: 0.08, map: TX.grime }),
  vcMetal: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.46, metalness: 0.55, map: TX.grime }),
  cloth: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.93, metalness: 0, map: TX.fabric, bumpMap: bumpOf(TX.fabric), bumpScale: 0.35 }),
  gabion: new THREE.MeshStandardMaterial({ map: TX.gabion, bumpMap: bumpOf(TX.gabion), bumpScale: 4, roughness: 0.95 }),
  bag: mdlHas('sandbag0') ? new THREE.MeshStandardMaterial({ map: mdlTex('bag/col'), normalMap: LITE ? null : mdlTex('bag/nrm', false), normalScale: new THREE.Vector2(0.9, 0.9), roughness: 0.96 })   /* the sandbag's own burlap (4f_data_bag.js) */
    : new THREE.MeshStandardMaterial({ map: TX.burlap, bumpMap: bumpOf(TX.burlap), bumpScale: 2.2, roughness: 1 }),
  roofStone: new THREE.MeshStandardMaterial({ map: TX.stone, bumpMap: bumpOf(TX.stone), bumpScale: 3, roughness: 1 }),
  sand: new THREE.MeshStandardMaterial({ color: 0xcdbb95, roughness: 1, map: TX.micro }),
  dark: new THREE.MeshStandardMaterial({ color: 0x0d0b0a, roughness: 1 }),
  wood: new THREE.MeshStandardMaterial({ color: 0xb09a86, roughness: 0.9, map: TX.wood }),
  metal: new THREE.MeshStandardMaterial({ color: 0x4a4944, roughness: 0.55, metalness: 0.6, map: TX.grime }),
  rust: new THREE.MeshStandardMaterial({ color: 0x5b3b27, roughness: 0.8, metalness: 0.4, map: TX.grime }),
  wire: new THREE.MeshStandardMaterial({ color: 0x55514b, roughness: 0.5, metalness: 0.6 }),
  wall: (() => { const t = facadeTex(); return new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95, map: t, bumpMap: bumpOf(t), bumpScale: LITE ? 1 : 1.8 }); })(),
  tile: new THREE.MeshStandardMaterial({ color: 0x8e5540, roughness: 0.9 }),
  concrete: new THREE.MeshStandardMaterial({ color: 0xa39d90, roughness: 0.95, map: TX.grime }),
  rock: new THREE.MeshStandardMaterial({ color: 0x8c8375, roughness: 1, flatShading: true, map: TX.grime }),
  drum: new THREE.MeshStandardMaterial({ color: 0x46503f, roughness: 0.7, metalness: 0.3, map: TX.grime }),
  ammo: new THREE.MeshStandardMaterial({ color: 0x4b5536, roughness: 0.8, map: TX.grime }),
  canvasOD: new THREE.MeshStandardMaterial({ color: 0x57583e, roughness: 1, side: THREE.DoubleSide, map: TX.fabric }),
  net: new THREE.MeshStandardMaterial({ map: TX.net, alphaTest: 0.45, side: THREE.DoubleSide, roughness: 1 }),
  shrub: new THREE.MeshStandardMaterial({ map: shrubTex(), alphaTest: 0.42, side: THREE.DoubleSide, roughness: 1 }),
  frond: new THREE.MeshStandardMaterial({ map: frondTex(), alphaTest: 0.4, side: THREE.DoubleSide, roughness: 0.9 }),
  pebble: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95, flatShading: true }),
  jet: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.34, metalness: 0.72, map: TX.grime, side: THREE.DoubleSide }),
};
const GEO = { box: new THREE.BoxGeometry(1, 1, 1), boxUp: new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0), cyl: new THREE.CylinderGeometry(1, 1, 1, 14).translate(0, 0.5, 0) };
GEO.bldg = (() => { const g = new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0); const uv = g.attributes.uv; for (let i = 8; i < 16; i++) uv.setXY(i, 0.3 + (i % 2) * 0.4, 0.975); return g; })();
function M4(x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) { return new THREE.Matrix4().compose(V3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), V3(sx, sy, sz)); }
// a part's colour: one hex, or a function of the vertex position (so a tube can be lighter on top, a rock darker in its hollows)
function colored(geo, hex) { const g = geo, p = g.attributes.position, n = p.count, a = new Float32Array(n * 3), c = new THREE.Color(); const fn = typeof hex === 'function'; if (!fn) c.setHex(hex); for (let i = 0; i < n; i++) { if (fn) c.setHex(hex(p.getX(i), p.getY(i), p.getZ(i))); a[i * 3] = c.r; a[i * 3 + 1] = c.g; a[i * 3 + 2] = c.b; } g.setAttribute('color', new THREE.BufferAttribute(a, 3)); return g; }
function build(parts) {
  const list = parts.map(([g, hex, m]) => { let gg = g.clone(); if (m) gg.applyMatrix4(m); if (!gg.index) gg.setIndex([...Array(gg.attributes.position.count).keys()]); if (!gg.attributes.uv) gg.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(gg.attributes.position.count * 2), 2)); if (hex !== null || !gg.attributes.color) colored(gg, hex ?? 0xffffff); for (const k of Object.keys(gg.attributes)) if (!['position', 'normal', 'uv', 'color'].includes(k)) gg.deleteAttribute(k); return gg; });
  return mergeGeometries(list, false);
}
const G = {
  box: (x, y, z) => new THREE.BoxGeometry(x, y, z),
  cyl: (rt, rb, h, s = 10, open = false) => new THREE.CylinderGeometry(rt, rb, h, s, 1, open),
  sph: (r, w = 10, h = 8, ps = 0, pl = Math.PI * 2, ts = 0, tl = Math.PI) => new THREE.SphereGeometry(r, w, h, ps, pl, ts, tl),
  cap: (r, l, c = 4, s = 8) => new THREE.CapsuleGeometry(r, l, c, s),
  tor: (r, t, rs = 6, ts = 16, arc = Math.PI * 2) => new THREE.TorusGeometry(r, t, rs, ts, arc),
  cone: (r, h, s = 10) => new THREE.ConeGeometry(r, h, s),
  ext: (pts, depth) => { const sh = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y))); return new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: false }); },
};
function SH(o, cast = true, recv = true) { if (!SHADOWS) return o; o.traverse((m) => { if (m.isMesh) { m.castShadow = cast; m.receiveShadow = recv; } }); return o; }
const COLLIDERS = [], CGRID = new Map(), CG = 6;
const cgk = (i, j) => i * 10007 + j;
function addCollider(x, z, hx, hz, rot, top, bot = -1e9) {
  const k = { x, z, hx, hz, c: Math.cos(rot), s: Math.sin(rot), top, bot }; COLLIDERS.push(k); const r = Math.hypot(hx, hz) + 0.6;
  for (let i = Math.floor((x - r) / CG); i <= Math.floor((x + r) / CG); i++) for (let j = Math.floor((z - r) / CG); j <= Math.floor((z + r) / CG); j++) { let a = CGRID.get(cgk(i, j)); if (!a) CGRID.set(cgk(i, j), (a = [])); a.push(k); }
  return k;
}
/* open furniture - a table, a bench, a bed: a man cannot walk through it, but a round goes under its top and between its legs. So two boxes:
   the whole of it for walking (not for bullets or eyes), and only its top for bullets and eyes */
function addOpenCollider(x, z, hx, hz, rot, top, bot, slab = 0.07) {
  const k = addCollider(x, z, hx, hz, rot, top, bot); k.noShot = true;
  const t = addCollider(x, z, hx, hz, rot, top, top - slab); t.noMove = true; return k;
}
const OPEN_FURN = /table|bench|chair|stool|bed|cot/;
function blocked(x, z, r, feet) {
  const a = CGRID.get(cgk(Math.floor(x / CG), Math.floor(z / CG))); if (!a) return false;
  for (const k of a) {
    if (k.noMove || k.top < feet + 0.45 || k.bot > feet + 1.5) continue;
    const dx = x - k.x, dz = z - k.z; const lx = dx * k.c - dz * k.s, lz = dx * k.s + dz * k.c;
    if (Math.abs(lx) < k.hx + r && Math.abs(lz) < k.hz + r) return true;
  }
  return false;
}
/* bullets and eyes are stopped by walls, bunkers, huts, sandbags and vehicles */
function segBoxT(k, ax, ay, az, bx, by, bz) {
  const lax = (ax - k.x) * k.c - (az - k.z) * k.s, laz = (ax - k.x) * k.s + (az - k.z) * k.c, lbx = (bx - k.x) * k.c - (bz - k.z) * k.s, lbz = (bx - k.x) * k.s + (bz - k.z) * k.c;
  let t0 = 0, t1 = 1; const dx = lbx - lax, dz = lbz - laz;
  if (Math.abs(dx) < 1e-9) { if (lax < -k.hx || lax > k.hx) return -1; } else { let u0 = (-k.hx - lax) / dx, u1 = (k.hx - lax) / dx; if (u0 > u1) [u0, u1] = [u1, u0]; t0 = Math.max(t0, u0); t1 = Math.min(t1, u1); if (t0 > t1) return -1; }
  if (Math.abs(dz) < 1e-9) { if (laz < -k.hz || laz > k.hz) return -1; } else { let u0 = (-k.hz - laz) / dz, u1 = (k.hz - laz) / dz; if (u0 > u1) [u0, u1] = [u1, u0]; t0 = Math.max(t0, u0); t1 = Math.min(t1, u1); if (t0 > t1) return -1; }
  const y0 = ay + (by - ay) * t0, y1 = ay + (by - ay) * t1; if (Math.min(y0, y1) >= k.top - 0.02 || Math.max(y0, y1) <= k.bot + 0.02) return -1;
  if (y0 < k.top) return t0; return t0 + (t1 - t0) * (y0 - k.top) / ((y0 - y1) || 1e-6);
}
let SEG_K = null;   // the box the last segHitT struck (for the mark a round leaves on it)
function segHitT(ax, ay, az, bx, by, bz, skipNear = 0) {
  const dx = bx - ax, dz = bz - az, L = Math.hypot(dx, dz), n = Math.max(1, Math.ceil(L / (CG * 0.8))); const seen = new Set(); let best = 2; SEG_K = null;
  for (let st = 0; st <= n; st++) {
    const t = st / n; if (best < t - 0.2) break; const ci = Math.floor((ax + dx * t) / CG), cj = Math.floor((az + dz * t) / CG); const a = CGRID.get(cgk(ci, cj)); if (!a) continue;
    for (const k of a) { if (seen.has(k) || k.noShot) continue; seen.add(k); const h = segBoxT(k, ax, ay, az, bx, by, bz); if (h >= 0 && h < best && h * L > skipNear) { best = h; SEG_K = k; } }
  }
  return best <= 1 ? best : -1;
}
const losW = (ax, ay, az, bx, by, bz) => los(ax, ay, az, bx, by, bz) && segHitT(ax, ay, az, bx, by, bz, 0.7) < 0;
/* cover points: positions next to walls and structures, with the direction they protect from */
const COVER = [];
function addCover(x, z, nx, nz, h) { if (groundAt(x, z) < 0.3) return; COVER.push({ x, z, nx, nz, h, by: null }); }
function coverBox(x, z, hx, hz, rot, h) {
  const c = Math.cos(rot), s = Math.sin(rot), L = (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
  for (const [ax, az] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const ext = ax ? hz : hx, n = Math.max(1, Math.round(ext / 2.4));
    for (let k = 0; k < n; k++) {
      const t = n === 1 ? 0 : (k / (n - 1) - 0.5) * 2 * Math.max(0, ext - 0.6);
      const lx = ax ? ax * (hx + 0.85) : t, lz = az ? az * (hz + 0.85) : t; const [px, pz] = L(lx, lz);
      const wx = ax * c + az * s, wz = -ax * s + az * c; addCover(px, pz, -wx, -wz, h);
    }
  }
}
/* instanced batches for gabions, sandbags, rails, jerrycans and crates */
const BATCH = { gab: [], bag: [], rail: [], jerry: [], crate: [] };
function gabionRow(x, z, rot, n, rows, y0) {
  const c = Math.cos(rot), s = Math.sin(rot);
  for (let r = 0; r < rows; r++) for (let i = 0; i < n; i++) { const o = i - (n - 1) / 2; const px = x + c * o, pz = z - s * o; BATCH.gab.push([px, (y0 ?? groundAt(px, pz) - 0.35) + r + 0.5, pz, rot]); }
}
const BAG_LH = 0.21;   // a layer of sandbags (the bags a size larger than they were, the walls a little higher)
function bagWall(pts, layers, baseY = null, collide = true) {
  if (collide && layers >= 3) for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1], dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz); if (L < 0.2) continue; const mx = (a[0] + b[0]) / 2, mz = (a[1] + b[1]) / 2;
    const top = (baseY ?? groundAt(mx, mz) - 0.05) + layers * BAG_LH + 0.05; addCollider(mx, mz, L / 2 + 0.12, 0.22, Math.atan2(-dz, dx), top);
    if (layers >= 4 && L > 1.1) { const nx = -dz / L, nz = dx / L, ns = Math.max(1, Math.round(L / 2.6)); for (let k = 0; k < ns; k++) { const t = (k + 0.5) / ns, px = a[0] + dx * t, pz = a[1] + dz * t; addCover(px + nx * 0.75, pz + nz * 0.75, -nx, -nz, layers * BAG_LH); addCover(px - nx * 0.75, pz - nz * 0.75, nx, nz, layers * BAG_LH); } }
  }
  const d = densify(pts, 0.56);
  for (let i = 0; i < d.length - 1; i++) {
    const a = d[i], b = d[i + 1]; const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz) || 1; const mx = (a[0] + b[0]) / 2, mz = (a[1] + b[1]) / 2; const rot = Math.atan2(-dz, dx);
    const y0 = baseY ?? groundAt(mx, mz) - 0.05;
    for (let l = 0; l < layers; l++) { const off = l % 2 ? 0.14 : -0.14; BATCH.bag.push([mx + dx / L * off, y0 + 0.11 + l * BAG_LH, mz + dz / L * off, rot]); }
  }
}
/* the sandbag: the downloaded bag (4f_data_bag.js) - a filled bag, its tied ends narrower, flat where it lies - in three patches of its burlap,
   packed in the frame of the old pillow shape so every wall keeps its size; without the data the pillow */
const BAG_GEOS = [];
function bagGeos() { if (!BAG_GEOS.length) { if (mdlHas('sandbag0')) for (let k = 0; k < 3; k++) BAG_GEOS.push(mdlGeo('sandbag' + k, QUAL === 'low' ? 1 : 0)[0].g);   /* the round one everywhere but on low: the light one is faceted */ else BAG_GEOS.push(pillowGeo()); } return BAG_GEOS; }
/* many bags at once: one instanced mesh for each patch, the bags dealt among them; each a little turned (j), every other one end for end, its
   own shade (the new bags all but white over their burlap, a few dusty, a few darker with damp) */
function bagInst(list, rr, j, wall = false) {
  const gs = bagGeos(), n = gs.length, grp = new THREE.Group(), mm = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), col = new THREE.Color(), byV = gs.map(() => []);
  for (const b of list) byV[n > 1 ? Math.floor(rr() * n) % n : 0].push(b);
  gs.forEach((g, v) => { const L = byV[v]; if (!L.length) return; const m = new THREE.InstancedMesh(g, MAT.bag, L.length);
    L.forEach(([x, y, z, r], i) => { const flip = n > 1 && rr() < 0.5 ? Math.PI : 0, tl = n > 1 ? (wall ? 0.02 : 0.07) : 0;   /* laid by hand: a little askew, each filled a little more or less */
      e.set((rr() - 0.5) * tl, r + flip + (rr() - 0.5) * j, (rr() - 0.5) * tl, 'YXZ'); m.setMatrixAt(i, mm.compose(V3(x, y, z), q.setFromEuler(e), n > 1 ? (wall ? V3(0.63 + rr() * 0.03, 0.225 + rr() * 0.015, 0.37 + rr() * 0.02) : V3(0.6 + rr() * 0.06, 0.205 + rr() * 0.035, 0.34 + rr() * 0.045)) : V3(0.6 + rr() * 0.05, 0.22, 0.36)));   /* a built wall: bags laid square and tight, each pressed flat by the ones above */
      const t = rr(), w = rr(); if (n > 1) { const k = w < 0.18 ? 1.12 : w > 0.88 ? 0.78 : 0.9 + t * 0.14; col.setRGB(lin(k * (w < 0.18 ? 1.0 : 1)), lin(k * (w < 0.18 ? 0.97 : 0.98)), lin(k * (w < 0.18 ? 0.88 : 0.95))); } else { const g2 = rr() * 0.06; col.setRGB(lin(0.6 + t * 0.12 - g2), lin(0.55 + t * 0.1 - g2 * 0.5), lin(0.44 + t * 0.08)); }
      m.setColorAt(i, col); });
    grp.add(m); });
  return SH(onLayer1(grp));
}
function pillowGeo() {
  const g = new THREE.SphereGeometry(0.5, LITE ? 10 : 16, LITE ? 6 : 10).scale(1.1, 1.1, 1.1); const p = g.attributes.position; const f = (v, e) => Math.sign(v) * Math.pow(Math.abs(v), e);
  for (let i = 0; i < p.count; i++) { let x = p.getX(i) * 2, y = p.getY(i) * 2, z = p.getZ(i) * 2; const px = f(x, 0.32), pz = f(z, 0.5); const py = f(y, 0.62) * (1 - 0.22 * px * px); p.setXYZ(i, px * 0.5, py * 0.5, pz * 0.5); }
  g.computeVertexNormals(); return g;
}
const JERRY_GEO = build([[G.box(0.17, 0.46, 0.34), 0xffffff, M4(0, 0.23, 0)], [G.box(0.18, 0.03, 0.1), 0xdddddd, M4(0, 0.47, 0.09)], [G.cyl(0.025, 0.025, 0.05, 6), 0xbbbbbb, M4(0, 0.48, -0.1)]]);
const CRATE_GEO = build([[G.box(1.0, 0.44, 0.52), 0xffffff, M4(0, 0.22, 0)], [G.box(1.02, 0.06, 0.54), 0xd8d8d8, M4(0, 0.36, 0)], [G.box(0.06, 0.46, 0.54), 0xd8d8d8, M4(0.4, 0.23, 0)], [G.box(0.06, 0.46, 0.54), 0xd8d8d8, M4(-0.4, 0.23, 0)], [G.box(0.12, 0.03, 0.04), 0x777777, M4(0, 0.1, 0.27)]]);
/* ---------- the downloaded props (4f_data_props.js): jerrycans, crates, oil drums and Czech hedgehogs ----------
   Each stands where the old box-built shape stood, with the same matrix (the models are packed in the old shapes' frames: on y = 0,
   centred, the same size). A set of copies is a group of two instanced meshes: the full model for the copies near the camera and the
   light one for the rest. They are sorted again whenever the camera has moved three metres or the lens has zoomed, just before the frame
   is drawn, so the copies, their counts and their shadows always agree; nothing is drawn for a level with no copies. The chapters show
   and hide the group (it is the scene's child), the meshes inside it are this code's. Without the model data the old shapes are drawn. */
const PROPS_LOD = { sets: [], near: { high: 30, med: 22, low: 14 }[QUAL] || 22, c: new THREE.Color() };
// a set: the model's name, a list of matrices, and (or null) a hex tint for each copy, multiplied into the model's own paint
function propSet(name, mats4, tints = null, cast = true) {
  if (!mdlHas(name) || !mats4.length) return null;
  const n = mats4.length, ms = mdlMats(name), g = new THREE.Group(), c = PROPS_LOD.c;
  const S = { M: mats4, P: mats4.map((M) => V3().setFromMatrixPosition(M)), T: tints, lv: [], at: V3(1e9, 0, 0), k: 0, g };
  for (let L = 0; L < 2; L++) S.lv.push(mdlGeo(name, L).map((p) => {
    const im = new THREE.InstancedMesh(p.g, ms[p.m], n); mats4.forEach((M, i) => { im.setMatrixAt(i, M); if (tints) im.setColorAt(i, c.setHex(tints[i])); });
    im.computeBoundingSphere(); g.add(SH(im, cast, true)); return im;   // the sphere round every copy, kept as the counts change
  }));
  scene.add(onLayer1(g)); PROPS_LOD.sets.push(S); propSort(S); return S;
}
// the copies nearer than PROPS_LOD.near (by what the eye sees: closer through a sight) to the full model, the others to the light one
function propSort(S) {
  const cam = camera.position, k = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) / 0.7265, r = PROPS_LOD.near / Math.max(0.05, k), r2 = r * r, c = PROPS_LOD.c, [A, B] = S.lv;
  let a = 0, b = 0;
  for (let i = 0; i < S.M.length; i++) { const near = S.P[i].distanceToSquared(cam) < r2, j = near ? a++ : b++; for (const im of near ? A : B) { im.setMatrixAt(j, S.M[i]); if (S.T) im.setColorAt(j, c.setHex(S.T[i])); } }
  for (const im of A) { im.count = a; im.visible = a > 0; im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true; }
  for (const im of B) { im.count = b; im.visible = b > 0; im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true; }
  S.at.copy(cam); S.k = k;
}
function propsLodTick() {
  if (!PROPS_LOD.sets.length) return; const cam = camera.position, k = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) / 0.7265;
  for (const S of PROPS_LOD.sets) if (S.g.visible && (S.at.distanceToSquared(cam) > 9 || Math.abs(S.k - k) > 0.08 * S.k)) propSort(S);
}
{ const prev = scene.onBeforeRender; scene.onBeforeRender = function (...a) { prev.apply(this, a); propsLodTick(); }; }   /* before the frame's buffers go to the graphics card */
// a matrix from a position and a turn about the vertical, as the batches and the old single meshes placed their props
const propM = (x, y, z, ry) => new THREE.Matrix4().compose(V3(x, y, z), new THREE.Quaternion().setFromAxisAngle(V3(0, 1, 0), ry), V3(1, 1, 1));
// the old drums' paint (a vertex colour over the grime map) as a tint of the packed drum's neutral paint: a little lighter, so it reads the same
const DRUM_TINT = { 0x2f4a3a: 0x5a6e4c, 0x6b3a26: 0x8a5a40, 0x3d4652: 0x5a6672, 0x7a6a3a: 0x8f8058, 0x46503f: 0x66705a };
const drumTint = (h) => DRUM_TINT[h] ?? h;
function propPile(kind, x, z, n, spread = 0.6, stack = 1) {
  const r = rng(Math.round(x * 31 + z * 17) >>> 0);
  for (let i = 0; i < n; i++) { const lvl = stack > 1 ? i % stack : 0, col = stack > 1 ? Math.floor(i / stack) : i; const px = x + (col % 3) * spread + (r() - 0.5) * 0.08, pz = z + Math.floor(col / 3) * spread * 0.9 + (r() - 0.5) * 0.08; BATCH[kind].push([px, groundAt(px, pz) + lvl * (kind === 'crate' ? 0.44 : 0.47), pz, (r() - 0.5) * 0.3 + (kind === 'crate' ? 0.1 : 0)]); }
}
function flushBatches() {
  const q = new THREE.Quaternion(), mm = new THREE.Matrix4(), up = V3(0, 1, 0), one = V3(1, 1, 1), col = new THREE.Color(), rr = rng(66);
  const gm = new THREE.InstancedMesh(GEO.box, MAT.gabion, BATCH.gab.length);
  BATCH.gab.forEach(([x, y, z, r], i) => gm.setMatrixAt(i, mm.compose(V3(x, y, z), q.setFromAxisAngle(up, r), one)));
  scene.add(SH(onLayer1(gm)));
  scene.add(bagInst(BATCH.bag, rr, 0.15));
  const rg = new THREE.InstancedMesh(new THREE.BoxGeometry(0.1, 0.14, 0.5), MAT.rust, BATCH.rail.length);
  BATCH.rail.forEach(([x, y, z, r], i) => rg.setMatrixAt(i, mm.compose(V3(x, y, z), q.setFromAxisAngle(up, r), one)));
  scene.add(SH(onLayer1(rg)));
  // the jerrycans and the crates: the packed models where their data is there (most in their own paint, some dusty or faded), else the old shapes
  if (mdlHas('jerry') && BATCH.jerry.length) propSet('jerry', BATCH.jerry.map(([x, y, z, r]) => propM(x, y, z, r)), BATCH.jerry.map(() => (rr() < 0.7 ? 0xffffff : 0xd9c9a8)));
  else {
    const jm = new THREE.InstancedMesh(JERRY_GEO, MAT.vc, Math.max(1, BATCH.jerry.length));
    BATCH.jerry.forEach(([x, y, z, r], i) => { jm.setMatrixAt(i, mm.compose(V3(x, y, z), q.setFromAxisAngle(up, r), one)); col.set(rr() < 0.7 ? 0x55603f : 0x6b5a3a); jm.setColorAt(i, col); });
    jm.count = BATCH.jerry.length; scene.add(SH(onLayer1(jm)));
  }
  if (mdlHas('crate') && BATCH.crate.length) propSet('crate', BATCH.crate.map(([x, y, z, r]) => propM(x, y, z, r)), BATCH.crate.map(() => (rr() < 0.6 ? 0xffffff : 0xe0d4b8)));
  else {
    const cm = new THREE.InstancedMesh(CRATE_GEO, MAT.vc, Math.max(1, BATCH.crate.length));
    BATCH.crate.forEach(([x, y, z, r], i) => { cm.setMatrixAt(i, mm.compose(V3(x, y, z), q.setFromAxisAngle(up, r), one)); col.set(rr() < 0.6 ? 0x5b6440 : 0x7a6a4a); cm.setColorAt(i, col); });
    cm.count = BATCH.crate.length; scene.add(SH(onLayer1(cm)));
  }
}

/* ================= bunkers & structures ================= */
function sign(text, kind, x, y, z, rot, w = 1.5) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, w * 0.3125), new THREE.MeshStandardMaterial({ map: signTex(text, kind), roughness: 0.8, emissive: kind === 'aid' ? 0x2a0806 : 0x000000 }));
  m.position.set(x, y, z); m.rotation.y = rot; scene.add(onLayer1(m)); return m;
}
const DOORS = {}, BUNKERS = [];
function bunker(id, label, x, z, w, d, rot, kind = 'plain') {
  const g0 = groundAt(x, z), c = Math.cos(rot), s = Math.sin(rot);
  const L = (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
  const nx = Math.round(w), nz = Math.round(d);
  for (let i = 0; i < nx; i++) for (const side of [-1, 1]) {
    const lx = -w / 2 + 0.5 + i, lz = side * (d / 2 - 0.5);
    if (side === 1 && Math.abs(lx) < 1.1) continue;
    const [px, pz] = L(lx, lz); for (let r = 0; r < 2; r++) BATCH.gab.push([px, g0 - 0.35 + r + 0.5, pz, rot]);
  }
  for (let i = 1; i < nz - 1; i++) for (const side of [-1, 1]) { const [px, pz] = L(side * (w / 2 - 0.5), -d / 2 + 0.5 + i); for (let r = 0; r < 2; r++) BATCH.gab.push([px, g0 - 0.35 + r + 0.5, pz, rot + Math.PI / 2]); }
  const grp = new THREE.Group();
  const roofG = new THREE.BoxGeometry(w + 0.8, 0.55, d + 0.8); const uv = roofG.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * (w + 0.8) / 3, uv.getY(i) * (d + 0.8) / 3);
  const roof = new THREE.Mesh(roofG, MAT.roofStone); roof.position.set(x, g0 + 1.92, z); roof.rotation.y = rot; grp.add(roof);
  const heap = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 10, 0, Math.PI * 2, 0, Math.PI / 2), MAT.sand); heap.scale.set(w * 0.42, 0.9, d * 0.38); heap.position.set(x, g0 + 2.15, z); heap.rotation.y = rot; grp.add(heap);
  for (let i = 0; i < Math.floor(w / 0.55); i++) for (const side of [-1, 1]) { const [px, pz] = L(-w / 2 + 0.3 + i * 0.55, side * (d / 2 + 0.45)); BATCH.rail.push([px, g0 + 1.72, pz, rot]); }
  const [dx, dz] = L(0, d / 2 - 0.3); const door = new THREE.Mesh(GEO.box, MAT.dark); door.scale.set(1.6, 1.75, 0.8); door.position.set(dx, g0 + 0.5, dz); door.rotation.y = rot; grp.add(door);
  for (const sx of [-0.95, 0.95]) { const [fx, fz] = L(sx, d / 2 + 0.05); const post = new THREE.Mesh(GEO.box, MAT.wood); post.scale.set(0.16, 1.9, 0.16); post.position.set(fx, g0 + 0.6, fz); post.rotation.y = rot; grp.add(post); }
  { const [lx, lz] = L(0, d / 2 + 0.05); const lintel = new THREE.Mesh(GEO.box, MAT.wood); lintel.scale.set(2.5, 0.2, 0.26); lintel.position.set(lx, g0 + 1.58, lz); lintel.rotation.y = rot; grp.add(lintel); }
  { const [cx2, cz2] = L(0, d / 2 - 0.9); const curtain = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.5, 1, 4), MAT.canvasOD); curtain.position.set(cx2, g0 + 0.72, cz2); curtain.rotation.y = rot; grp.add(curtain); }
  scene.add(SH(onLayer1(grp)));
  const wingA = [L(-1.3, d / 2 + 0.2), L(-1.5, d / 2 + 3.2)], wingB = [L(1.3, d / 2 + 0.2), L(1.5, d / 2 + 3.2)];
  bagWall(wingA, 5); bagWall(wingB, 5);
  bagWall([L(-w / 2 + 0.2, d / 2 + 0.25), L(-1.5, d / 2 + 0.25)], 2, g0 + 2.2, false); bagWall([L(1.5, d / 2 + 0.25), L(w / 2 - 0.2, d / 2 + 0.25)], 2, g0 + 2.2, false);
  const [sx2, sz2] = L(0, d / 2 + 0.47); sign(label, kind, sx2, g0 + 1.72, sz2, rot);
  { const [jx, jz] = L(w / 2 - 0.9, d / 2 + 0.9); propPile('jerry', jx, jz, 2 + Math.floor(Math.abs(Math.sin(x * 3.1)) * 3), 0.24); }
  addCollider(x, z, w / 2 + 0.4, d / 2 + 0.4, rot, g0 + 2.4); coverBox(x, z, w / 2 + 0.4, d / 2 + 0.4, rot, 2.4); BUNKERS.push([L(-w / 2, -d / 2), L(w / 2, -d / 2), L(w / 2, d / 2), L(-w / 2, d / 2)]);
  const [ex, ez] = L(0, d / 2 + 2.4); DOORS[id] = { x: ex, z: ez, rot, label };
}
function waterTower(x, z) {
  const g0 = groundAt(x, z), h = 6.5, grp = new THREE.Group();
  for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { const leg = new THREE.Mesh(G.cyl(0.07, 0.1, h, 6), MAT.metal); leg.position.set(a * 1.1, h / 2, b * 1.1); leg.rotation.set(-b * 0.05, 0, a * 0.05); grp.add(leg); }
  for (const y of [2, 4.2]) for (const r of [0, Math.PI / 2]) { const br = new THREE.Mesh(G.box(2.3, 0.06, 0.06), MAT.metal); br.position.set(0, y, 0); br.rotation.y = r; grp.add(br); }
  for (const y of [1.1, 3.1, 5.3]) for (const r of [Math.PI / 4, -Math.PI / 4]) { const br = new THREE.Mesh(G.box(3.0, 0.04, 0.04), MAT.metal); br.position.set(0, y, 0); br.rotation.set(0, r, 0.6); grp.add(br); }
  const tank = new THREE.Mesh(G.cyl(1.5, 1.5, 2.2, 22), new THREE.MeshStandardMaterial({ color: 0x59604a, roughness: 0.7, metalness: 0.4, map: TX.grime })); tank.position.y = h + 1.1; grp.add(tank);
  const lid = new THREE.Mesh(G.cone(1.6, 0.5, 22), MAT.metal); lid.position.y = h + 2.45; grp.add(lid);
  const ladder = new THREE.Mesh(G.box(0.4, h + 2, 0.05), MAT.metal); ladder.position.set(1.25, (h + 2) / 2, 0); ladder.rotation.z = 0.05; grp.add(ladder);
  grp.position.set(x, g0, z); scene.add(SH(onLayer1(grp))); addCollider(x, z, 1.3, 1.3, 0, g0 + 9);
}
function mast(x, z, h = 14) {
  const g = new THREE.Group(); const y = groundAt(x, z);
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.1, h, 6).translate(0, h / 2, 0), MAT.metal));
  const lm = new THREE.LineBasicMaterial({ color: 0x2c2a27, transparent: true, opacity: 0.7 });
  for (let k = 0; k < 3; k++) { const a = k * 2.094 + 0.4; g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([V3(0, h * 0.92, 0), V3(Math.cos(a) * h * 0.42, 0, Math.sin(a) * h * 0.42)]), lm)); }
  g.position.set(x, y, z); scene.add(SH(onLayer1(g)));
}
const FLAGS = [];
function flag(x, z, kind, h = 8, rot = 0) {
  const g = new THREE.Group(); g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, h, 6).translate(0, h / 2, 0), MAT.metal));
  const geo = new THREE.PlaneGeometry(2.2, 1.5, 10, 1); geo.translate(1.1, 0, 0);
  const cloth = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: flagTex(kind), side: THREE.DoubleSide, roughness: 0.9 }));
  cloth.position.set(0, h - 0.8, 0); g.add(cloth); g.position.set(x, groundAt(x, z), z); g.rotation.y = rot; scene.add(SH(onLayer1(g)));
  FLAGS.push({ geo, base: geo.attributes.position.array.slice() });
  return g;
}
function waveFlags(t) {
  for (const f of FLAGS) { const p = f.geo.attributes.position; for (let i = 0; i < p.count; i++) { const bx = f.base[i * 3]; p.setZ(i, Math.sin(bx * 2.2 - t * 5) * 0.12 * bx / 2.2); } p.needsUpdate = true; }
}
function camoNet(cx, cz, w, d, h, rot, poles = true) {
  const geo = new THREE.PlaneGeometry(w, d, 18, 12).rotateX(-Math.PI / 2); const p = geo.attributes.position; const c = Math.cos(rot), s = Math.sin(rot), r = rng(Math.round(Math.abs(cx * 7 + cz * 13)) + 3);
  for (let i = 0; i < p.count; i++) {
    const lx = p.getX(i), lz = p.getZ(i); const u = Math.abs(lx) / (w / 2), v = Math.abs(lz) / (d / 2); const e = Math.max(u, v);
    const sag = 0.18 * Math.sin(u * Math.PI * 2) * Math.sin(v * Math.PI * 2);
    const top = h * (1 - smooth(0.42, 1.0, e) * 0.9) - Math.abs(sag) + (r() - 0.5) * 0.1;
    const wx = cx + lx * c + lz * s, wz = cz - lx * s + lz * c; p.setXYZ(i, wx, groundAt(wx, wz) + Math.max(0.12, top), wz);
  }
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, MAT.net); scene.add(SH(onLayer1(m)));
  if (poles) for (const [a, b] of [[-0.42, -0.42], [0.42, -0.42], [0.42, 0.42], [-0.42, 0.42]]) { const lx = a * w, lz = b * d; const px = cx + lx * c + lz * s, pz = cz - lx * s + lz * c; const pole = new THREE.Mesh(G.cyl(0.04, 0.05, h, 6), MAT.wood); pole.position.set(px, groundAt(px, pz) + h / 2 - 0.1, pz); scene.add(SH(onLayer1(pole))); }
}
function shadeArea(x, z, rot) {
  const grp = new THREE.Group(); const g0 = groundAt(x, z);
  const top = new THREE.Mesh(G.box(2.4, 0.06, 0.9), MAT.wood); top.position.set(0, 0.76, 0); grp.add(top);
  for (const [a, b] of [[-1.05, -0.35], [1.05, -0.35], [1.05, 0.35], [-1.05, 0.35]]) { const leg = new THREE.Mesh(G.box(0.07, 0.74, 0.07), MAT.wood); leg.position.set(a, 0.37, b); grp.add(leg); }
  for (const sd of [-1, 1]) { const bench = new THREE.Mesh(G.box(2.2, 0.05, 0.3), MAT.wood); bench.position.set(0, 0.44, sd * 0.85); grp.add(bench); for (const a of [-0.95, 0.95]) { const l = new THREE.Mesh(G.box(0.06, 0.42, 0.26), MAT.wood); l.position.set(a, 0.21, sd * 0.85); grp.add(l); } }
  const cup = build([[G.cyl(0.04, 0.035, 0.09, 8), 0xe8e2d6], [G.cyl(0.05, 0.05, 0.012, 10), 0xe8e2d6, M4(0.3, -0.04, 0.1)]]); for (let i = 0; i < 3; i++) { const m = new THREE.Mesh(cup, MAT.vc); m.position.set(-0.6 + i * 0.5, 0.84, (i % 2) * 0.15 - 0.05); grp.add(m); }
  const kettle = new THREE.Mesh(build([[G.cyl(0.09, 0.11, 0.16, 12), 0x8a8a84], [G.cyl(0.015, 0.02, 0.12, 6), 0x8a8a84, M4(0.11, 0.04, 0, 0, 0, -0.9)]]), MAT.vcMetal); kettle.position.set(0.7, 0.87, 0.1); grp.add(kettle);
  grp.position.set(x, g0, z); grp.rotation.y = rot; scene.add(SH(onLayer1(grp)));
  camoNet(x, z, 5.4, 4.0, 2.45, rot); addCollider(x, z, 1.3, 1.0, rot, g0 + 0.8);
}

/* ================= vehicles ================= */
function tankParts(P) {
  const { T, TD, TK, WH, RB, GM, GL } = P; const parts = [
    [G.box(6.1, 0.75, 2.3), TD, M4(0, 0.95, 0)],
    [G.box(4.8, 0.36, 3.2), T, M4(-0.55, 1.42, 0)], [G.box(1.7, 0.36, 3.2), T, M4(2.55, 1.2, 0, 0, 0, -0.5)],
    [G.box(1.9, 0.08, 2.6), TD, M4(-2.1, 1.63, 0)], ...[0, 1, 2, 3, 4, 5].map((i) => [G.box(0.05, 0.04, 2.4), RB, M4(-2.85 + i * 0.28, 1.68, 0)]),
    [G.box(0.34, 0.28, 0.34), GM, M4(3.18, 1.38, -1.0)], [G.box(0.34, 0.28, 0.34), GM, M4(3.18, 1.38, 1.0)], [G.box(0.02, 0.18, 0.2), GL, M4(3.36, 1.4, -1.0)], [G.box(0.02, 0.18, 0.2), GL, M4(3.36, 1.4, 1.0)],
    [G.cyl(0.3, 0.32, 0.12, 12), TD, M4(1.85, 1.64, 0.7)],
    [G.sph(1.6, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), T, M4(0.1, 1.6, 0, 0, 0, 0, 1.3, 0.56, 1.0)],
    [G.cyl(1.58, 1.62, 0.16, 24), TD, M4(0.1, 1.64, 0, 0, 0, 0, 1.27, 1, 0.98)],
    [G.box(1.3, 0.55, 2.0), T, M4(-1.75, 1.95, 0)], [G.box(1.2, 0.05, 2.3), GM, M4(-2.35, 2.32, 0)], ...[-1, 1].map((sd) => [G.box(1.2, 0.3, 0.05), GM, M4(-2.35, 2.45, sd * 1.12)]),
    [G.cyl(0.2, 0.2, 1.8, 10), 0x5b5a3e, M4(-2.2, 2.52, 0, Math.PI / 2, 0, 0)],
    [G.box(0.56, 0.64, 1.06), TD, M4(2.05, 2.0, 0)],
    [G.cyl(0.085, 0.1, 4.1, 14), GM, M4(4.3, 2.02, 0, 0, 0, Math.PI / 2)], ...[4.95, 5.2].map((x) => [G.cyl(0.106, 0.106, 0.07, 14), P.RG ?? 0xdcd6c4, M4(x, 2.02, 0, 0, 0, Math.PI / 2)]),   // the battalion's two white rings on the gun [G.cyl(0.15, 0.15, 0.55, 14), GM, M4(4.4, 2.02, 0, 0, 0, Math.PI / 2)], [G.cyl(0.11, 0.11, 0.25, 12), RB, M4(6.35, 2.02, 0, 0, 0, Math.PI / 2)],
    [G.box(0.56, 0.48, 0.62), TD, M4(2.0, 2.6, 0)], [G.box(0.04, 0.4, 0.52), GL, M4(2.29, 2.6, 0)],
    [G.cyl(0.45, 0.5, 0.42, 16), T, M4(-0.55, 2.42, -0.5)], [G.sph(0.42, 16, 6, 0, Math.PI * 2, 0, Math.PI / 2), TD, M4(-0.55, 2.63, -0.5, 0, 0, 0, 1, 0.45, 1)],
    [G.cyl(0.03, 0.03, 1.3, 8), RB, M4(0.05, 2.74, -0.5, 0, 0, Math.PI / 2)], [G.box(0.26, 0.18, 0.14), RB, M4(-0.45, 2.74, -0.5)], [G.box(0.2, 0.14, 0.12), 0x4a5236, M4(-0.4, 2.62, -0.28)],
    [G.cyl(0.32, 0.32, 0.07, 14), TD, M4(-0.5, 2.5, 0.65)],
    [G.box(0.36, 0.34, 0.2), 0x5a6048, M4(-0.9, 2.1, 1.36)], [G.box(0.36, 0.34, 0.2), 0x5a6048, M4(-0.45, 2.1, 1.38)],
  ];
  for (const sd of [-1, 1]) parts.push(
    [G.box(5.9, 0.16, 0.66), TK, M4(0, 0.12, sd * 1.58)], [G.box(5.6, 0.07, 0.66), TK, M4(-0.1, 1.02, sd * 1.58)],
    [G.cyl(0.44, 0.44, 0.66, 16), TK, M4(3.0, 0.56, sd * 1.58, Math.PI / 2, 0, 0)], [G.cyl(0.44, 0.44, 0.66, 16), TK, M4(-3.05, 0.6, sd * 1.58, Math.PI / 2, 0, 0)],
    [G.cyl(0.46, 0.46, 0.08, 12), GM, M4(-3.05, 0.6, sd * 1.92, Math.PI / 2, 0, 0)], [G.cyl(0.4, 0.4, 0.08, 12), WH, M4(3.0, 0.56, sd * 1.92, Math.PI / 2, 0, 0)],
    ...[-2.25, -1.35, -0.45, 0.45, 1.35, 2.25].flatMap((wx) => [[G.cyl(0.34, 0.34, 0.22, 16), WH, M4(wx, 0.4, sd * 1.8, Math.PI / 2, 0, 0)], [G.cyl(0.13, 0.13, 0.24, 8), GM, M4(wx, 0.4, sd * 1.84, Math.PI / 2, 0, 0)], [G.cyl(0.34, 0.34, 0.2, 16), WH, M4(wx, 0.4, sd * 1.38, Math.PI / 2, 0, 0)]]),
    ...[-1.4, 0, 1.4].map((wx) => [G.cyl(0.1, 0.1, 0.3, 8), WH, M4(wx, 0.93, sd * 1.6, Math.PI / 2, 0, 0)]),
    [G.box(6.7, 0.06, 0.9), T, M4(0, 1.12, sd * 1.6)], [G.box(1.3, 0.42, 0.5), TD, M4(-1.3, 1.36, sd * 1.72)], [G.box(1.0, 0.42, 0.5), TD, M4(1.2, 1.36, sd * 1.72)],
    [G.cyl(0.012, 0.018, 2.6, 5), RB, M4(-1.9, 3.55, sd * 0.8, sd * 0.08, 0, 0)],
  );
  return parts;
}
const TANK_GEO = build(tankParts({ T: 0x8d8a72, TD: 0x7c7862, TK: 0x2a2821, WH: 0x4b483e, RB: 0x1d1c19, GM: 0x5d5b4e, GL: 0xc4ccd0 }));
const TANK_BURNT = build(tankParts({ T: 0x2d2a26, TD: 0x252320, TK: 0x1a1917, WH: 0x2a2724, RB: 0x121110, GM: 0x2a2826, GL: 0x1a1a1a, RG: 0x2a2826 }));
function placeTank(x, z, bearing, geo = TANK_GEO) {
  const burnt = geo === TANK_BURNT; if (burnt) geo = TANK_GEO;
  const mdl = geo === TANK_GEO && typeof VEH_DATA !== 'undefined' && VEH_DATA.magach, m = mdl ? vehModel('magach', 'f').g : new THREE.Mesh(geo, MAT.vc); if (geo === TANK_GEO && !mdl) tankMarks(m, TANK_GEO); m.position.set(x, groundAt(x, z), z); m.rotation.y = -THREE.MathUtils.degToRad(bearing) + Math.PI / 2; scene.add(SH(onLayer1(m)));
  addCollider(x, z, 3.4, 1.9, m.rotation.y, groundAt(x, z) + 2.4); coverBox(x, z, 3.4, 1.9, m.rotation.y, 2.2);
  if (mdl) { m.userData.vl.crew = !burnt; m.userData.vl.dead = burnt; }   // a tank in its place has its commander in the hatch
  if (burnt) { const r = rng(Math.round(x * 7 + z * 3) >>> 0); wreckTilt(m, r); wreckFire(m, mdl ? VEH_FIRE.magach : VEH_FIRE.tank, 1.6); }
  return m;
}
const HT_GEO = build([
  [G.box(4.4, 1.45, 2.2), 0x6e6c52, M4(-0.6, 1.3, 0)], [G.box(1.8, 1.0, 1.9), 0x6e6c52, M4(2.4, 1.05, 0)], [G.box(0.2, 0.9, 2.0), 0x44443a, M4(3.35, 0.95, 0)],
  [G.box(3.4, 0.8, 2.3), 0x26241f, M4(-1.1, 0.42, 0)], ...[-1, 1].flatMap((sd) => [[G.cyl(0.45, 0.45, 0.3, 14), 0x26241f, M4(2.3, 0.45, sd * 0.95, Math.PI / 2, 0, 0)], [G.cyl(0.2, 0.2, 0.32, 8), 0x55533f, M4(2.3, 0.45, sd * 0.97, Math.PI / 2, 0, 0)], ...[-2.4, -1.6, -0.8, 0].map((wx) => [G.cyl(0.26, 0.26, 0.2, 10), 0x3a3830, M4(wx, 0.36, sd * 1.18, Math.PI / 2, 0, 0)])]),
  [G.box(0.08, 0.5, 2.2), 0x55533f, M4(1.6, 2.0, 0)], [G.box(0.9, 0.06, 2.24), 0x5d5b45, M4(-0.6, 2.04, 0)],
  [G.cyl(0.03, 0.03, 1.1, 8), 0x1d1d1d, M4(1.9, 2.35, -0.6, 0, 0, Math.PI / 2)], [G.box(0.22, 0.16, 0.12), 0x1d1d1d, M4(1.3, 2.35, -0.6)], [G.cyl(0.04, 0.05, 0.5, 6), 0x33322c, M4(1.25, 2.05, -0.6)],
  [G.box(0.5, 0.3, 0.3), 0x55603f, M4(-2.2, 1.7, 1.15)],
]);
function halftrack(x, z, bearing) { const m = new THREE.Mesh(HT_GEO, MAT.vc); m.position.set(x, groundAt(x, z), z); m.rotation.y = -THREE.MathUtils.degToRad(bearing) + Math.PI / 2; scene.add(SH(onLayer1(m))); addCollider(x, z, 3.0, 1.2, m.rotation.y, groundAt(x, z) + 2.0); coverBox(x, z, 3.0, 1.2, m.rotation.y, 2.0); return m; }
const JEEP_GEO = build([
  [G.box(2.9, 0.5, 1.42), 0x656448, M4(-0.1, 0.82, 0)], [G.box(1.05, 0.3, 1.2), 0x656448, M4(0.95, 1.2, 0)], [G.box(0.06, 0.34, 1.0), 0x2a2a24, M4(1.5, 1.12, 0)],
  [G.box(0.04, 0.46, 1.3), 0x3a3a30, M4(0.35, 1.3, 0, 0, 0, -0.2)], [G.box(0.03, 0.38, 1.2), 0x8aa0a8, M4(0.36, 1.3, 0, 0, 0, -0.2)],
  ...[-1, 1].flatMap((sd) => [[G.box(0.9, 0.08, 0.3), 0x5b5a40, M4(1.05, 1.05, sd * 0.72)], [G.box(0.5, 0.35, 0.42), 0x4e4d38, M4(-0.35, 1.25, sd * 0.3)], [G.box(0.1, 0.42, 0.42), 0x4e4d38, M4(-0.62, 1.5, sd * 0.3)]]),
  ...[[1.05, 1], [1.05, -1], [-1.05, 1], [-1.05, -1]].flatMap(([wx, sd]) => [[G.cyl(0.36, 0.36, 0.24, 16), 0x1f1e1b, M4(wx, 0.36, sd * 0.72, Math.PI / 2, 0, 0)], [G.cyl(0.18, 0.18, 0.26, 10), 0x55543e, M4(wx, 0.36, sd * 0.73, Math.PI / 2, 0, 0)]]),
  [G.cyl(0.34, 0.34, 0.2, 16), 0x1f1e1b, M4(-1.66, 1.0, 0, 0, 0, Math.PI / 2)], [G.box(0.35, 0.45, 0.2), 0x55603f, M4(-1.55, 1.05, 0.5)],
  [G.cyl(0.012, 0.012, 2.2, 5), 0x1d1d1d, M4(-1.4, 2.1, -0.6, 0.12, 0, 0)],
]);
/* the jeeps are drawn at the size of the real thing beside a man: a third larger than the first model, with every seat and mount scaled with them */
const JK = 1.3; JEEP_GEO.scale(JK, JK, JK);
function jeep(x, z, rot) { const m = typeof VEH_DATA !== 'undefined' && VEH_DATA.jeep ? vehModel('jeep', 'f').g : new THREE.Mesh(JEEP_GEO, MAT.vc); m.position.set(x, groundAt(x, z), z); m.rotation.y = rot; scene.add(SH(onLayer1(m))); addCollider(x, z, 1.6 * JK, 0.8 * JK, rot, groundAt(x, z) + 1.6 * JK); coverBox(x, z, 1.6 * JK, 0.8 * JK, rot, 1.5 * JK); }

/* ================= weapons (world) ================= */
const MAG_GEO = build([
  [G.box(0.075, 0.1, 0.42), 0x1f1f1f, M4(0, 0, 0)], [G.box(0.07, 0.035, 0.26), 0x2a2a2a, M4(0, 0.065, -0.02)],
  [G.cyl(0.014, 0.014, 0.6, 8), 0x161616, M4(0, 0.012, 0.5, Math.PI / 2, 0, 0)], [G.cyl(0.022, 0.022, 0.09, 8), 0x161616, M4(0, 0.012, 0.83, Math.PI / 2, 0, 0)],
  [G.cyl(0.024, 0.024, 0.08, 8), 0x2a2a2a, M4(0, 0.012, 0.33, Math.PI / 2, 0, 0)], [G.tor(0.07, 0.009, 4, 10, Math.PI), 0x2a2a2a, M4(0, 0.06, 0.34, 0, Math.PI / 2, 0)],
  [G.box(0.05, 0.1, 0.28), 0x2b2b2b, M4(0, -0.03, -0.34)], [G.box(0.052, 0.13, 0.04), 0x2b2b2b, M4(0, -0.05, -0.47)],
  [G.box(0.035, 0.1, 0.045), 0x262626, M4(0, -0.09, -0.12, 0.3, 0, 0)], [G.box(0.01, 0.045, 0.01), 0x1a1a1a, M4(0, 0.06, 0.78)],
  [G.box(0.012, 0.03, 0.012), 0x1a1a1a, M4(0, 0.09, -0.14)],
  ...[-1, 1].map((sd) => [G.cyl(0.009, 0.009, 0.36, 5), 0x222222, M4(sd * 0.09, -0.15, 0.62, 0.3, 0, sd * 0.35)]),
]);
/* the MAG at the firing posts, in detail: seen from just behind it, it fills the lower part of the gunner's view. The receiver with its
   ribs and rivets, the feed cover hinged at the front with the rear sight leaf, the cocking handle on the left; the barrel with its
   collar, the carrying handle and the slotted flash hider; the gas cylinder and regulator under it, the front sight on its tall post,
   the bipod folded back; the wooden stock and pistol grip of the IDF's guns of the time. Local to the gun: x left, y up, z forward */
const MAG_HI_GEO = (() => {
  const S = 0x2c2d2b, D = 0x222321, K = 0x181817, W = 0x6a4527, WD = 0x553719, Z = Math.PI / 2, p = [];
  p.push([G.box(0.062, 0.084, 0.33), S, M4(0, 0, 0)], [G.box(0.07, 0.03, 0.2), D, M4(0, 0.056, 0.015)], [G.cyl(0.008, 0.008, 0.074, 10), K, M4(0, 0.06, 0.118, 0, 0, Z)]);
  for (const sd of [-1, 1]) { p.push([G.box(0.005, 0.012, 0.3), D, M4(sd * 0.0335, -0.012, 0)], [G.box(0.005, 0.008, 0.3), D, M4(sd * 0.0335, 0.03, 0)]);
    for (let i = 0; i < 6; i++) p.push([G.cyl(0.0042, 0.0042, 0.004, 8), K, M4(sd * 0.0335, 0.012, -0.13 + i * 0.052, 0, 0, Z)]); }
  p.push([G.box(0.036, 0.008, 0.03), D, M4(0, 0.075, -0.06)], [G.box(0.028, 0.045, 0.004), K, M4(0, 0.1, -0.06, -0.25, 0, 0)], [G.box(0.006, 0.012, 0.006), K, M4(0, 0.124, -0.066)]);   // the rear sight leaf, raised
  p.push([G.box(0.016, 0.02, 0.05), K, M4(0.04, 0.005, 0.07)], [G.cyl(0.009, 0.009, 0.03, 8), K, M4(0.06, 0.005, 0.08, 0, 0, Z)]);   // the cocking handle
  p.push([G.box(0.03, 0.012, 0.07), D, M4(0.045, 0.028, 0.03)]);   // the feed tray where the belt comes in
  p.push([G.cyl(0.024, 0.024, 0.05, 16), D, M4(0, 0.012, 0.19, Z, 0, 0)], [G.cyl(0.0135, 0.0135, 0.56, 16), K, M4(0, 0.012, 0.47, Z, 0, 0)]);   // the barrel and its collar
  p.push([G.cyl(0.019, 0.017, 0.075, 12, true), K, M4(0, 0.012, 0.785, Z, 0, 0)], [G.cyl(0.015, 0.015, 0.075, 12), K, M4(0, 0.012, 0.785, Z, 0, 0)]);   // the flash hider
  for (let i = 0; i < 5; i++) { const a = i * 1.2566; p.push([G.box(0.004, 0.004, 0.05), 0x0c0c0c, M4(Math.cos(a) * 0.0185, 0.012 + Math.sin(a) * 0.0185, 0.79)]); }   // its slots
  p.push([G.cyl(0.011, 0.011, 0.38, 12), D, M4(0, -0.026, 0.36, Z, 0, 0)], [G.box(0.03, 0.05, 0.04), S, M4(0, -0.008, 0.56)], [G.cyl(0.008, 0.008, 0.04, 8), K, M4(0.02, -0.02, 0.56, 0, 0, Z)]);   // the gas cylinder and regulator
  p.push([G.box(0.012, 0.055, 0.016), S, M4(0, 0.045, 0.69)], [G.box(0.004, 0.018, 0.004), K, M4(0, 0.08, 0.69)]);   // the front sight on its post
  p.push([G.tor(0.055, 0.008, 6, 14, Math.PI), S, M4(0.0, 0.012, 0.3, 0, -Z, Z)], [G.box(0.02, 0.012, 0.03), D, M4(0, 0.03, 0.3)]);   // the carrying handle, folded to the left
  for (const sd of [-1, 1]) p.push([G.cyl(0.0055, 0.0055, 0.32, 8), D, M4(sd * 0.016, -0.045, 0.39, Z, 0, 0)], [G.box(0.012, 0.02, 0.022), K, M4(sd * 0.016, -0.05, 0.225)]);   // the bipod folded back
  p.push([G.box(0.034, 0.105, 0.046), W, M4(0, -0.085, -0.095, 0.32, 0, 0)], [G.tor(0.03, 0.004, 5, 10, Math.PI), K, M4(0, -0.055, -0.04, 0, Z, Z)], [G.box(0.005, 0.025, 0.006), K, M4(0, -0.055, -0.045)]);   // grip, guard, trigger
  p.push([G.ext([[0, 0.033], [-0.3, 0.048], [-0.3, -0.095], [-0.14, -0.05], [0, -0.034]], 0.044), W, M4(0.022, 0, -0.165, 0, -Z, 0)], [G.box(0.046, 0.15, 0.012), K, M4(0, -0.023, -0.472)], [G.box(0.04, 0.03, 0.06), WD, M4(0, -0.06, -0.32)]);   // the stock, its butt plate
  return build(p).scale(1.3, 1.25, 1.0);   // a heavy, solid gun: fuller in the receiver and the barrel
})();
/* the belt: a run of cartridges in their links hanging from the feed tray on the gun's left side. It feeds one link per shot, and once fewer than
   BELT_N rounds are left its tail comes up off the ground round by round until the last one goes in. Local to the gun: x left, y up, z forward */
const BELT_N = 20, BELT_STEP = 0.024;
const BELT_LINK = build([[G.cyl(0.0052, 0.0052, 0.046, 6), 0xc49a42, M4(0, 0, 0.006, Math.PI / 2, 0, 0)], [G.cone(0.0045, 0.014, 6), 0xb08040, M4(0, 0, 0.036, Math.PI / 2, 0, 0)], [G.box(0.016, 0.009, 0.02), 0x2a2a26, M4(0, 0, -0.008)]]);
function beltAt(s, out) { const t = Math.max(0, s) / (BELT_N * BELT_STEP); out[0] = 0.044 + 0.2 * t; out[1] = 0.012 + 0.025 * Math.sin(Math.min(1, t) * Math.PI) - 0.17 * Math.pow(t, 1.6); out[2] = -0.02 - 0.12 * t; return out; }   /* out to the left and back toward the gunner, sagging: in his sight below the gun */
const _bm = new THREE.Matrix4(), _bq = new THREE.Quaternion(), _be = new THREE.Euler(), _bp = V3(), _bs = V3(1, 1, 1), _ba = [0, 0, 0], _bb = [0, 0, 0];
function beltPose(mag) {
  const B = mag.beltM; if (!B) return; const left = mag.cap === undefined ? BELT_N : Math.min(BELT_N, mag.belt), f = mag.feedT || 0;
  for (let i = 0; i < BELT_N; i++) { const s = (i + f) * BELT_STEP; beltAt(s, _ba); beltAt(s + 0.01, _bb); const ang = Math.atan2(_bb[1] - _ba[1], _bb[0] - _ba[0]);
    _be.set(0, 0, ang); _bm.compose(_bp.set(_ba[0], _ba[1], _ba[2]), _bq.setFromEuler(_be), i < left ? _bs.set(1, 1, 1) : _bs.set(0.0001, 0.0001, 0.0001)); B.setMatrixAt(i, _bm); }
  B.instanceMatrix.needsUpdate = true;
}
const AMMOBOX_GEO = build([[G.box(0.3, 0.2, 0.12), 0x4b5536, M4(0, 0.1, 0)], [G.box(0.06, 0.02, 0.1), 0x2a2d20, M4(0, 0.21, 0)]]);
const FAL_W = build([
  [G.box(0.045, 0.1, 0.2), 0x3b2a1d, M4(0, -0.02, -0.3)], [G.box(0.05, 0.075, 0.32), 0x242424, M4(0, 0, -0.04)], [G.box(0.055, 0.06, 0.2), 0x2d2620, M4(0, -0.005, 0.2)],
  [G.cyl(0.011, 0.011, 0.3, 6), 0x161616, M4(0, 0.01, 0.43, Math.PI / 2, 0, 0)], [G.cyl(0.016, 0.016, 0.06, 6), 0x161616, M4(0, 0.01, 0.6, Math.PI / 2, 0, 0)],
  [G.box(0.03, 0.14, 0.07), 0x1c1c1c, M4(0, -0.1, 0.02, 0.12, 0, 0)], [G.box(0.035, 0.09, 0.04), 0x2a1f18, M4(0, -0.07, -0.13, -0.35, 0, 0)], [G.box(0.012, 0.02, 0.1), 0x1c1c1c, M4(0.02, 0.05, 0.02)],
]);
/* the enemy's rifle and launcher from the asset pipeline (4f_data_props.js): an AKMS with its stock swung out and an RPG-7 with a round in
   it, packed in the frames of the box-built guns they replace - muzzle along +z, the pistol grip, the handguard and the launcher's grips
   where theirs were, about the same length - so every pose, grip on the weapon and dropped gun holds. A soldier's gun is one mesh: the
   model is one geometry for each level of detail, and its material rides on the geometry (userData.wmat), so whatever puts the geometry
   on a gun mesh gives it its look as well (gunGeo); userData.lods holds both levels and is shared by them. Without the data: the old gun. */
function wpnModel(name, old) {
  if (!mdlHas(name)) return old;
  const u = { wmat: mdlMats(name)[0], lods: MDL_DATA[name].lods.map((_, L) => mdlGeo(name, L)[0].g) };
  for (const g of u.lods) g.userData = u;
  return u.lods[0];
}
// a gun's geometry onto a mesh, at the level of detail of its soldier's figure (0 near, 1 and 2 farther), with the model's own material
function gunGeo(m, geo, lod = 0) { const u = geo.userData; m.geometry = u.lods ? u.lods[Math.min(lod, u.lods.length - 1)] : geo; m.material = u.wmat || MAT.vcMetal; }
const AK_W = wpnModel('akms', build([
  [G.box(0.04, 0.09, 0.2), 0x6b4424, M4(0, -0.03, -0.29, 0.12, 0, 0)], [G.box(0.05, 0.07, 0.3), 0x1d1d1d, M4(0, 0, -0.03)], [G.box(0.05, 0.055, 0.18), 0x6b4424, M4(0, -0.005, 0.2)],
  [G.cyl(0.01, 0.01, 0.34, 6), 0x151515, M4(0, 0.008, 0.42, Math.PI / 2, 0, 0)], [G.cyl(0.012, 0.012, 0.2, 6), 0x1d1d1d, M4(0, 0.042, 0.2, Math.PI / 2, 0, 0)],
  [G.box(0.03, 0.1, 0.06), 0x2a2a2a, M4(0, -0.08, 0.04, 0.25, 0, 0)], [G.box(0.03, 0.08, 0.055), 0x2a2a2a, M4(0, -0.155, 0.075, 0.55, 0, 0)], [G.box(0.034, 0.085, 0.04), 0x3b2a1a, M4(0, -0.07, -0.12, -0.3, 0, 0)],
]));
const SMG_W = build([
  [G.box(0.045, 0.07, 0.24), 0x1d1d1d, M4(0, 0, -0.02)], [G.cyl(0.011, 0.011, 0.2, 6), 0x151515, M4(0, 0.01, 0.2, Math.PI / 2, 0, 0)], [G.cyl(0.02, 0.02, 0.14, 8, true), 0x2a2a2a, M4(0, 0.012, 0.16, Math.PI / 2, 0, 0)],
  [G.cyl(0.055, 0.055, 0.04, 14), 0x2a2a2a, M4(0, -0.08, 0.02, 0, 0, Math.PI / 2)], [G.box(0.03, 0.09, 0.05), 0x3b2a1a, M4(0, -0.07, -0.1, -0.3, 0, 0)],
  [G.box(0.012, 0.012, 0.2), 0x2a2a2a, M4(-0.02, 0.02, -0.22)], [G.box(0.012, 0.012, 0.2), 0x2a2a2a, M4(0.02, 0.02, -0.22)], [G.box(0.05, 0.05, 0.012), 0x2a2a2a, M4(0, 0.0, -0.32)],
]);
const LMG_W = build([
  [G.box(0.04, 0.09, 0.2), 0x6b4424, M4(0, -0.03, -0.3, 0.12, 0, 0)], [G.box(0.05, 0.08, 0.34), 0x1d1d1d, M4(0, 0, -0.02)], [G.box(0.05, 0.055, 0.2), 0x6b4424, M4(0, -0.005, 0.22)],
  [G.cyl(0.011, 0.011, 0.46, 6), 0x151515, M4(0, 0.01, 0.5, Math.PI / 2, 0, 0)], [G.cyl(0.013, 0.013, 0.26, 6), 0x1d1d1d, M4(0, 0.045, 0.22, Math.PI / 2, 0, 0)],
  [G.cyl(0.07, 0.07, 0.05, 14), 0x2a2a2a, M4(0, -0.09, 0.0, 0, 0, Math.PI / 2)], [G.box(0.034, 0.085, 0.04), 0x3b2a1a, M4(0, -0.07, -0.13, -0.35, 0, 0)],
  ...[-1, 1].map((sd) => [G.cyl(0.006, 0.006, 0.26, 5), 0x2a2a2a, M4(sd * 0.05, -0.1, 0.58, 0, 0, sd * 0.4)]),
]);
const SVD_W = build([
  [G.box(0.04, 0.06, 0.22), 0x6b4424, M4(0, -0.01, -0.3)], [G.box(0.03, 0.08, 0.1), 0x6b4424, M4(0, -0.06, -0.16, -0.3, 0, 0)], [G.box(0.045, 0.07, 0.3), 0x1d1d1d, M4(0, 0, -0.03)], [G.box(0.044, 0.05, 0.22), 0x6b4424, M4(0, -0.005, 0.22)],
  [G.cyl(0.009, 0.009, 0.52, 6), 0x151515, M4(0, 0.012, 0.56, Math.PI / 2, 0, 0)], [G.cyl(0.012, 0.012, 0.06, 6), 0x1d1d1d, M4(0, 0.012, 0.82, Math.PI / 2, 0, 0)],
  [G.cyl(0.02, 0.02, 0.22, 10), 0x1a1a1a, M4(0, 0.075, 0.02, Math.PI / 2, 0, 0)], [G.cyl(0.026, 0.02, 0.05, 10), 0x1a1a1a, M4(0, 0.075, 0.15, Math.PI / 2, 0, 0)], [G.box(0.03, 0.04, 0.05), 0x2a2a2a, M4(0, 0.045, 0.02)],
  [G.box(0.03, 0.09, 0.045), 0x2a2a2a, M4(0, -0.075, 0.05, 0.2, 0, 0)],
]);
const RPG_W = wpnModel('rpg7', build([
  [G.cyl(0.035, 0.035, 0.95, 10), 0x4d5040, M4(0, 0.02, 0.05, Math.PI / 2, 0, 0)], [G.cone(0.045, 0.28, 10), 0x5a5f4a, M4(0, 0.02, 0.72, Math.PI / 2, 0, 0)], [G.cyl(0.045, 0.03, 0.12, 10), 0x5a5f4a, M4(0, 0.02, 0.55, Math.PI / 2, 0, 0)],
  [G.box(0.03, 0.09, 0.04), 0x3a2a1a, M4(0, -0.06, -0.05, -0.2, 0, 0)], [G.box(0.03, 0.09, 0.04), 0x3a2a1a, M4(0, -0.06, 0.15, -0.2, 0, 0)],
]));
/* the 106 mm recoilless rifle of survival mode: a long tube with the spotting rifle on top, breech and venturi behind, sight and hand wheels on the left; on a tripod */
const RCL_GEO = build([
  [G.cyl(0.085, 0.085, 3.4, 14), 0x4d5240, M4(0, 0.08, 0.7, Math.PI / 2, 0, 0)], [G.cyl(0.1, 0.1, 0.14, 14), 0x3a3d32, M4(0, 0.08, 2.35, Math.PI / 2, 0, 0)],
  [G.cyl(0.155, 0.13, 0.55, 14), 0x4d5240, M4(0, 0.08, -1.2, Math.PI / 2, 0, 0)], [G.box(0.24, 0.3, 0.2), 0x33362b, M4(0, 0.08, -1.5)], [G.cyl(0.2, 0.12, 0.3, 14), 0x2a2a26, M4(0, 0.08, -1.74, Math.PI / 2, 0, 0)],
  [G.box(0.3, 0.18, 0.4), 0x3a3d32, M4(0, -0.06, 0.05)], [G.cyl(0.045, 0.045, 0.3, 8), 0x3a3d32, M4(0, -0.25, 0.05)],
  [G.cyl(0.028, 0.028, 1.5, 8), 0x1f1f1c, M4(0, 0.21, 0.5, Math.PI / 2, 0, 0)], [G.box(0.05, 0.1, 0.14), 0x1f1f1c, M4(0, 0.15, -0.1)],
  [G.box(0.1, 0.16, 0.2), 0x1f1f1c, M4(-0.2, 0.14, 0.2)], [G.cyl(0.11, 0.11, 0.02, 16), 0x2a2a26, M4(-0.3, -0.02, -0.4, 0, 0, Math.PI / 2)], [G.cyl(0.11, 0.11, 0.02, 16), 0x2a2a26, M4(-0.3, -0.02, -0.1, 0, 0, Math.PI / 2)],
]);
const RCL_LEGS = build([0, 1, 2].map((k) => {
  const a = k * 2.094 + 0.5, bx = Math.sin(a) * 0.66, bz = Math.cos(a) * 0.66, dir = V3(-bx, 1.08, -bz), L = dir.length(); dir.normalize();
  return [G.cyl(0.03, 0.03, L, 6), 0x3a3d32, new THREE.Matrix4().compose(V3(bx / 2, 0.54, bz / 2), new THREE.Quaternion().setFromUnitVectors(V3(0, 1, 0), dir), V3(1, 1, 1))];
}).concat([[G.cyl(0.07, 0.07, 0.18, 10), 0x2a2a26, M4(0, 1.0, 0)], [G.box(0.5, 0.04, 0.06), 0x3a3d32, M4(0, 0.5, 0.33)]]));

/* ================= firing posts ================= */
const POSTS = [];
// magBearing: where the gun itself points, when it is not where the bay faces (the survival guns at the corners look along the shore)
function post(id, name, x, z, bearing, hasMag, magBearing = bearing) {
  const g0 = groundAt(x, z), b = THREE.MathUtils.degToRad(bearing), mb = THREE.MathUtils.degToRad(magBearing);
  const fx = Math.sin(b), fz = -Math.cos(b), mfx = Math.sin(mb), mfz = -Math.cos(mb);
  const arc = []; for (let a = -90; a <= 90; a += 15) { const r = THREE.MathUtils.degToRad(bearing + a); arc.push([x + Math.sin(r) * 1.7, z - Math.cos(r) * 1.7]); }
  bagWall(arc, 5, g0 - 0.05);
  { const [k0, d0] = trK(x, z); if (d0 < 3.4) for (const s of [0, arc.length - 1]) { const ae = arc[s]; let best = null; for (let k = Math.max(0, k0 - 7); k <= Math.min(TR.pts.length - 1, k0 + 7); k++) { const w = [TR.pts[k][0] + TR.out[k][0] * TW, TR.pts[k][1] + TR.out[k][1] * TW]; if (Math.hypot(w[0] - x, w[1] - z) < 2.3) continue; if (!best || Math.hypot(w[0] - ae[0], w[1] - ae[1]) < Math.hypot(best[0] - ae[0], best[1] - ae[1])) best = w; } if (best) bagWall([ae, best], 6, g0 - 0.1); } }
  const P = { id, name, x, z, g: g0, bearing, fx, fz, mag: null, occupant: null, stand: hasMag ? [x - mfx * 0.2, z - mfz * 0.2] : [x - fx * 0.2, z - fz * 0.2] };
  if (hasMag) {
    // hasMag: true = a MAG; 'heavy' = the Browning .50 on its tripod, a bigger gun with a bigger box; 'surv' = a MAG that is only there in survival mode
    const heavy = hasMag === 'heavy', pivot = new THREE.Group(); pivot.position.set(x + mfx * 1.05, g0 + (heavy ? 1.12 : 1.05), z + mfz * 1.05); pivot.rotation.order = 'YXZ'; pivot.rotation.y = Math.PI - mb;
    const gun = new THREE.Mesh(MAG_HI_GEO, MAT.vcMetal); gun.position.z = heavy ? -0.2 : -0.12; if (heavy) gun.scale.set(1.45, 1.45, 1.5); pivot.add(gun);
    const beltM = new THREE.InstancedMesh(BELT_LINK, MAT.vcMetal, BELT_N); beltM.frustumCulled = false; gun.add(beltM); scene.add(SH(onLayer1(pivot)));
    if (heavy && typeof VEH_DATA !== 'undefined' && VEH_DATA.m2hi) { gun.geometry = new THREE.BufferGeometry(); beltM.visible = false; const m2 = new THREE.Mesh(vehGeo('m2hi', 0, 'body', 'f'), MAT.gunHi); m2.rotation.y = -Math.PI / 2; m2.position.set(0, -0.16, -0.05); pivot.add(SH(onLayer1(m2))); }   // the Browning: the modelled .50, its own belt and box
    const box = new THREE.Mesh(AMMOBOX_GEO, MAT.vc); box.position.set(x - mfx * 0.2 + mfz * 0.9, g0 + 0.02, z - mfz * 0.2 - mfx * 0.9); box.rotation.y = -mb; if (heavy) box.scale.set(1.3, 1.3, 1.3); scene.add(SH(onLayer1(box)));
    if (heavy) { for (let i = 0; i < 3; i++) { const bx = new THREE.Mesh(AMMOBOX_GEO, MAT.vc); bx.scale.set(1.3, 1.3, 1.3); bx.position.set(x - fx * 0.5 - fz * (0.6 + i * 0.42), g0 + 0.02, z - fz * 0.5 + fx * (0.6 + i * 0.42)); bx.rotation.y = -b + 0.2 * i; scene.add(SH(onLayer1(bx))); } }
    const mag = { pivot, yaw0: Math.PI - mb, yaw: Math.PI - mb, pitch: 0, belt: heavy ? 110 : 200, cap: heavy ? 110 : 200, reload: 0, heat: 0, heavy, beltM, feedT: 0 }; beltPose(mag);
    if (hasMag === 'surv') { P.magS = mag; pivot.visible = false; box.visible = false; mag.box = box; } else P.mag = mag;
  } else {
    for (let i = 0; i < 2; i++) { const bx = new THREE.Mesh(AMMOBOX_GEO, MAT.vc); bx.position.set(x - fx * 0.3 + (i - 0.5) * 0.5 * fz, g0 + 0.02, z - fz * 0.3 - (i - 0.5) * 0.5 * fx); scene.add(SH(onLayer1(bx))); }
  }
  POSTS.push(P); return P;
}
/* a recoilless-gun bay: a wider sandbag horseshoe than an MG post, shell crates at the back, the gun on its tripod 1.5 m out so the tube clears the bags.
   The bay is part of the strongpoint; the gun itself is only shown (and only manned) in survival mode */
function gunPost(id, name, x, z, bearing) {
  const g0 = groundAt(x, z), b = THREE.MathUtils.degToRad(bearing), fx = Math.sin(b), fz = -Math.cos(b), R = 2.3;
  // the sandbag arc round the bay, but never across the trench behind it: the trench stays open past every gun
  const arc = []; for (let a = -100; a <= 100.1; a += 12.5) { const r = THREE.MathUtils.degToRad(bearing + a), px = x + Math.sin(r) * R, pz = z - Math.cos(r) * R; if (trK(px, pz)[1] > TW + 0.55) arc.push([px, pz]); }
  if (arc.length > 1) bagWall(arc, 5, g0 - 0.05);
  { const [k0, d0] = trK(x, z); if (d0 < 4 && arc.length > 1) for (const s of [0, arc.length - 1]) { const ae = arc[s]; let best = null; for (let k = Math.max(0, k0 - 8); k <= Math.min(TR.pts.length - 1, k0 + 8); k++) { const w = [TR.pts[k][0] + TR.out[k][0] * TW, TR.pts[k][1] + TR.out[k][1] * TW]; if (Math.hypot(w[0] - x, w[1] - z) < R + 0.5) continue; if (!best || Math.hypot(w[0] - ae[0], w[1] - ae[1]) < Math.hypot(best[0] - ae[0], best[1] - ae[1])) best = w; } if (best) bagWall([ae, best], 6, g0 - 0.1); } }
  // the gun stands on a raised firing platform of timber and sandbags at the rampart's crest, so it shoots over the crest up and down the shore as well as across
  // the canal. A low step on the trench side lets a man climb it in two strides
  const [kk] = trK(x, z), oo = TR.out[kk], tp = TR.pts[kk], H = 0.84, gx = x + oo[0] * 0.9, gz = z + oo[1] * 0.9, lat = [-oo[1], oo[0]], along = Math.abs(oo[0]) > Math.abs(oo[1]);
  { const plat = new THREE.Mesh(build([[G.box(2.6, H, 2.6), 0x6f5a3a, M4(0, H / 2, 0)], [G.box(2.75, 0.12, 2.75), 0x5a4830, M4(0, H - 0.06, 0)], ...[-1, 1].flatMap((sd) => [[G.box(2.7, 0.22, 0.42), 0xb7a47c, M4(0, 0.11, sd * 1.5)], [G.box(0.42, 0.22, 2.7), 0xb7a47c, M4(sd * 1.5, 0.11, 0)], [G.box(2.7, 0.22, 0.42), 0xb7a47c, M4(0, 0.33, sd * 1.5)], [G.box(0.42, 0.22, 2.7), 0xb7a47c, M4(sd * 1.5, 0.33, 0)]])]), MAT.vc); plat.position.set(gx, g0, gz); scene.add(SH(onLayer1(plat)));
    // the body of the platform blocks, except its trench-side strip, where a timber stair climbs onto it from the trench
    addCollider(gx + oo[0] * 0.15, gz + oo[1] * 0.15, along ? 1.2 : 1.35, along ? 1.35 : 1.2, 0, g0 + H, g0 - 0.1); addFloor(gx - 1.35, gx + 1.35, gz - 1.35, gz + 1.35, g0 + H);
    const d0 = 0.7, d1 = 2.15, a0 = tp[0] * 0 + (along ? tp[0] + oo[0] * d0 : tp[1] + oo[1] * d0), a1 = along ? tp[0] + oo[0] * d1 : tp[1] + oo[1] * d1, y0 = groundAt(tp[0] + oo[0] * d0, tp[1] + oo[1] * d0), y1 = g0 + H;
    const rx0 = Math.min(tp[0] + oo[0] * d0, tp[0] + oo[0] * d1) - (along ? 0 : 0.7), rx1 = Math.max(tp[0] + oo[0] * d0, tp[0] + oo[0] * d1) + (along ? 0 : 0.7), rz0 = Math.min(tp[1] + oo[1] * d0, tp[1] + oo[1] * d1) - (along ? 0.7 : 0), rz1 = Math.max(tp[1] + oo[1] * d0, tp[1] + oo[1] * d1) + (along ? 0.7 : 0);
    addRamp(rx0, rx1, rz0, rz1, along ? 'x' : 'z', a0, a1, y0, y1);
    const treads = []; for (let i = 0; i < 5; i++) { const u = (i + 0.5) / 5, d = lerp(d0, d1, u), yy = lerp(y0, y1, u); treads.push([G.box(along ? 0.3 : 1.3, 0.08, along ? 1.3 : 0.3), 0x7a6340, M4(oo[0] * d, yy - g0 - 0.04, oo[1] * d)], [G.box(along ? 0.3 : 1.3, Math.max(0.1, yy - y0), along ? 1.3 : 0.3), 0x5a4830, M4(oo[0] * d, (yy - g0 + (y0 - g0)) / 2 - 0.05, oo[1] * d)]); }
    const st = new THREE.Mesh(build(treads), MAT.vc); st.position.set(tp[0], g0, tp[1]); scene.add(SH(onLayer1(st))); }
  const pivot = new THREE.Group(); pivot.position.set(gx, g0 + H + 1.08, gz); pivot.rotation.order = 'YXZ'; pivot.rotation.y = Math.PI - b; pivot.add(new THREE.Mesh(RCL_GEO, MAT.vcMetal)); pivot.userData.dyn = true; pivot.visible = false; scene.add(SH(onLayer1(pivot)));
  const legs = new THREE.Mesh(RCL_LEGS, MAT.vcMetal); legs.position.set(gx, g0 + H, gz); legs.rotation.y = Math.PI - b; legs.userData.dyn = true; legs.visible = false; scene.add(SH(onLayer1(legs)));
  for (const sd of [-1, 1]) { const cx = x + lat[0] * sd * 1.95 + oo[0] * 0.3, cz = z + lat[1] * sd * 1.95 + oo[1] * 0.3; if (mdlHas('crate')) { BATCH.crate.push([cx, g0, cz, -b + sd * 0.25]); continue; }   // with the packed crates (flushBatches)
    const c = new THREE.Mesh(CRATE_GEO, MAT.vc); c.position.set(cx, g0, cz); c.rotation.y = -b + sd * 0.25; scene.add(SH(onLayer1(c))); }
  for (let i = 0; i < 3; i++) { const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.05, 0.9, 10).rotateZ(Math.PI / 2), MAT.rust); sh.position.set(gx + lat[0] * 0.9, g0 + H + 0.06, gz + lat[1] * 0.9 + (i - 1) * 0.14); sh.rotation.y = -b + (i - 1) * 0.06; scene.add(SH(onLayer1(sh))); }
  const P = { id, name, x, z, g: g0 + H, bearing, fx, fz, occupant: null, stand: [gx - oo[0] * 0.4, gz - oo[1] * 0.4], survOnly: true, legs, mag: { pivot, yaw0: Math.PI - b, yaw: Math.PI - b, pitch: 0, belt: 1, reload: 0, heat: 0, big: true } };
  POSTS.push(P); SURV.guns.push(P); return P;
}

/* ================= fences, rocks, smoke ================= */
function outwardRing(poly, d, inward = false) {
  return poly.map((p, i) => {
    const a = poly[(i - 1 + poly.length) % poly.length], b = poly[(i + 1) % poly.length];
    let nx = -(b[1] - a[1]), nz = b[0] - a[0]; const l = Math.hypot(nx, nz) || 1; nx /= l; nz /= l;
    let q = [p[0] + nx * d, p[1] + nz * d]; if (inPoly(q[0], q[1], poly) !== inward) q = [p[0] - nx * d, p[1] - nz * d]; return q;
  });
}
const WIRE_PTS = [];   // the wire round the stronghold, point by point: the attackers hurdle it (5_game.js wireCross)
function concertina() {
  let ring = outwardRing(MAOZ, 14); ring = [...ring, ring[0]];
  const d = densify(ring, 0.55).map(([x, z]) => [Math.max(x, tongueWestX(z) + 2.5), z]).filter(([x, z]) => !(x < -40 && z > -150 && z < 150) && Math.hypot(x - GATE_N[0], z - GATE_N[1] - 14) > 8 && Math.hypot(x - GATE_S[0], z - GATE_S[1] + 14) > 8 && SAP_LIST.every((sp) => distPolyline(x, z, sp) > 1.8));   /* cut where the Egyptians' saps run under it */
  WIRE_PTS.length = 0; WIRE_PTS.push(...d);
  const geo = new THREE.TorusGeometry(0.46, 0.022, 4, LITE ? 8 : 14); const count = d.length * (LITE ? 1 : 2);
  const inst = new THREE.InstancedMesh(geo, MAT.wire, count); const r = rng(9); const q = new THREE.Quaternion(), tilt = new THREE.Quaternion(), Z = V3(0, 0, 1), t = V3(), mm = new THREE.Matrix4(), one = V3(1, 1, 1);
  let k = 0;
  for (let i = 0; i < d.length; i++) {
    const a = d[Math.max(0, i - 1)], b = d[Math.min(d.length - 1, i + 1)]; t.set(b[0] - a[0], 0, b[1] - a[1]).normalize();
    q.setFromUnitVectors(Z, t); tilt.setFromAxisAngle(t, (r() - .5) * 0.5); q.premultiply(tilt);
    const g = groundAt(d[i][0], d[i][1]);
    inst.setMatrixAt(k++, mm.compose(V3(d[i][0], g + 0.44, d[i][1]), q, one));
    if (!LITE) inst.setMatrixAt(k++, mm.compose(V3(d[i][0] + t.z * 0.9, groundAt(d[i][0] + t.z * 0.9, d[i][1] - t.x * 0.9) + 0.44, d[i][1] - t.x * 0.9), q, one));
  }
  scene.add(SH(onLayer1(inst), true, false));
  const pg = new THREE.InstancedMesh(new THREE.BoxGeometry(0.05, 1.1, 0.05), MAT.rust, Math.ceil(d.length / 6)); let n = 0;
  for (let i = 0; i < d.length; i += 6) { const g = groundAt(d[i][0], d[i][1]); pg.setMatrixAt(n++, mm.compose(V3(d[i][0], g + 0.45, d[i][1]), q.identity(), one)); }
  pg.count = n; scene.add(SH(onLayer1(pg)));
}
/* the scrub north and south of the stronghold: a carpet of dry bushes a metre high, thick, right up to the wire - the Egyptians' saps run out
   of it, and a man crouching in one is not seen until he comes up at our parapet */
function egyScrub() {
  const ring = outwardRing(MAOZ, 14), loop = [...ring, ring[0]], n = LITE ? 1100 : 2800, items = [];
  for (const [sd, seed] of [[-1, 811], [1, 812]]) {
    const road = sd < 0 ? ROAD_ACCESS : ROAD_SOUTH, ok = (x, z) => sd * z > 92 && !inPoly(x, z, ring) && distPolyline(x, z, loop) < 32 && distPolyline(x, z, road) > 5 && SAP_LIST.every((sp) => distPolyline(x, z, sp) > 1.6) && groundAt(x, z) > 0.3;
    items.push(...scatterIn(n, -68, 30, sd < 0 ? -142 : 90, sd < 0 ? -90 : 142, seed, ok, (x, z, r) => [x, z, 0.85 + r() * 0.45, r() * 6, dryBush(r), -0.05, 0.85 + r() * 0.3]));
  }
  instScatter(BUSH_G, items.filter((_, i) => i % 3), undefined, !LITE); instScatter(BUSH_TWIG_G, items.filter((_, i) => !(i % 3)), undefined, !LITE);
}
function riprap() {
  const rocks = [], rk = rng(55), mm = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  for (const edge of [TONGUE_WL, TONGUE_E]) for (const p of densify(edge, 3.2)) { if (p[1] < -520) continue; rocks.push([p[0] + (rk() - .5) * 3, p[1] + (rk() - .5) * 3, 0.6 + rk() * 1.1]); }
  const ri = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1, LITE ? 0 : 1), MAT.rock, rocks.length);
  rocks.forEach(([x, z, s], i) => { q.setFromEuler(e.set(rk() * 3, rk() * 3, rk() * 3)); ri.setMatrixAt(i, mm.compose(V3(x, Math.max(groundAt(x, z), -0.25) + s * 0.15, z), q, V3(s, s * 0.7, s))); });
  scene.add(SH(ri, true, true));
}
/* daylight smoke columns: burning positions across the front after the air strike */
const FAR_SMOKE = []; let SMOKE_T = null;
/* a vehicle knocked out: still in its own paint, but broken - down on a burst tyre or a broken track, the gun or the turret askew -
   and burning: flames licking out of the engine and the crew's seats, and a thick column of black smoke going up and leaning off
   with the wind. Each wreck has its own sprites (made on its first frame), so the battle's shared smoke is not used up by it; only
   the wrecks near the camera smoke in full */
const WRECKS = [], WIND = V3(0.8, 0, 0.45).normalize();
const VEH_FIRE = { jeep: [[1.45, 1.15, 0.05], [-0.15, 1.05, 0.25], [-1.25, 0.95, -0.25]], tank: [[-2.3, 1.55, 0.3], [-1.6, 1.6, -0.5], [0.2, 2.35, 0.25]], t55: [[-2.3, 1.5, 0.3], [-1.5, 1.5, -0.4], [0.3, 2.2, 0.2]], truck: [[2.3, 1.6, 0], [-0.8, 1.9, 0.3]], btr: [[-1.8, 1.5, 0], [0.6, 1.6, 0]], atgun: [[0.2, 1.0, 0]] };
VEH_FIRE.magach = VEH_FIRE.t55;
function wreckFire(obj, pts, k = 1) { const w = { obj, pts: pts.map((p) => V3(p[0], p[1], p[2])), k, fl: null, sm: null, on: true, ph: Math.random() * 9 }; WRECKS.push(w); return w; }
/* the fire: tongues of flame that rise from each burning point, swell and narrow and die as others are born under them, yellow-white at
   the root going orange and red; a steady bright core at each point; a glow over the whole wreck; sparks carried up and off with the
   wind; and the light of it on the hull and the sand (the nearest wreck only). Far off only the cores and the glow are drawn */
let FLAME_T = null;
function flameTex() {
  const w = 64, h = 128, c = canvas(w, h), g = c.getContext('2d'), r = rng(57);
  for (let i = 0; i < 11; i++) {
    const x = w / 2 + (r() - 0.5) * 16, y = h * (0.6 + r() * 0.16), rw = w * (0.16 + r() * 0.16), sy = 1.6 + r() * 1.4;
    g.save(); g.translate(x, y); g.scale(1, sy); const gr = g.createRadialGradient(0, rw * 0.25, 0, 0, 0, rw);
    gr.addColorStop(0, 'rgba(255,250,228,0.75)'); gr.addColorStop(0.35, 'rgba(255,196,92,0.5)'); gr.addColorStop(0.7, 'rgba(236,98,24,0.22)'); gr.addColorStop(1, 'rgba(200,40,0,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(0, 0, rw, 0, 7); g.fill(); g.restore();
  }
  return tex(c);
}
LIGHTS.wreck = new THREE.PointLight(0xff7a30, 0, 0, 2); if (!LITE) scene.add(LIGHTS.wreck);
const _FY = new THREE.Color(0.95, 0.66, 0.3), _FO = new THREE.Color(0.82, 0.36, 0.08), _FR = new THREE.Color(0.42, 0.09, 0.02), _fc = new THREE.Color(), _wq = V3();
function _wreckInit(w) {
  if (!SMOKE_T) SMOKE_T = puffTex(); if (!FLAME_T) FLAME_T = flameTex(); w.fl = []; w.tg = []; w.em = []; w.sm = []; w.wp = w.pts.map(() => V3());
  const add = (map, col, op = 1, solid = false) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map, blending: solid ? THREE.NormalBlending : THREE.AdditiveBlending, transparent: true, depthWrite: false, color: col, opacity: op, toneMapped: false })); s.visible = false; s.userData.dyn = true; scene.add(onLayer1(s)); return s; };
  for (let i = 0; i < w.pts.length; i++) w.fl.push(add(FXT.fire, new THREE.Color(HDRK * 0.42, HDRK * 0.3, HDRK * 0.18)));   // the cores: a dull red heat, not a lamp
  w.glow = add(FXT.glow, new THREE.Color(HDRK * 0.3, HDRK * 0.18, HDRK * 0.08), 0.08);
  const nt = w.pts.length * (LITE ? 3 : 5); for (let i = 0; i < nt; i++) { const q = { s: add(FLAME_T, new THREE.Color(), 1, true), t: 0, life: 0, p: i % w.pts.length }; _tongue(q, w); q.t = Math.random() * q.life; w.tg.push(q); }
  for (let i = 0; i < (LITE ? 2 : 6); i++) { const q = { s: add(FXT.flare, new THREE.Color(HDRK * 0.7, HDRK * 0.32, HDRK * 0.08)), t: Math.random() * 2, life: 0, p: i % w.pts.length }; q.life = 0; w.em.push(q); }
  const n = LITE ? 16 : 34; for (let i = 0; i < n; i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: SMOKE_T, transparent: true, depthWrite: false, color: 0x1a1816, opacity: 0 })); sp.visible = false; scene.add(onLayer1(sp)); w.sm.push({ sp, t: (i / n) * 8, o: V3(), r: (Math.random() - 0.5) * 0.3 }); }
}
function _tongue(q, w) { const k = w.k; q.t = 0; q.life = 0.45 + Math.random() * 0.35; q.p = (Math.random() * w.pts.length) | 0; q.ox = (Math.random() - 0.5) * 0.6 * k; q.oz = (Math.random() - 0.5) * 0.6 * k; q.vy = (1.0 + Math.random() * 0.8) * Math.sqrt(k); q.w0 = (0.5 + Math.random() * 0.4) * k; q.h0 = q.w0 * (1.6 + Math.random() * 0.6); q.s.material.rotation = (Math.random() - 0.5) * 0.25; }
const _shown = (o) => { for (let q = o; q; q = q.parent) if (!q.visible) return false; return o.parent ? true : false; }, _wp = V3(), _dc = new THREE.Color(0x121110), _gc = new THREE.Color(0x77716a);
function wreckUpd(dt) {
  const cam = camera.position; let near = 0, lit = null;
  const order = WRECKS.filter((w) => w.on && _shown(w.obj)); for (const w of order) { w.obj.getWorldPosition(_wp); w.d = _wp.distanceTo(cam); } order.sort((a, b) => a.d - b.d);
  if (order.length && order[0].d < 90) lit = order[0];
  for (const w of WRECKS) {
    const live = w.on && _shown(w.obj); if (!live && !w.fl) continue; if (!w.fl) _wreckInit(w);
    const full = live && w.d < 700 && near++ < 10, close = live && w.d < 260 && near <= 10, vis = live && w.d < 900;   // the ten nearest smoke and burn in full
    for (const f of w.fl) f.visible = vis; w.glow.visible = vis; for (const q of w.tg) q.s.visible = close; for (const q of w.em) q.s.visible = close;
    if (!live) { for (const q of w.sm) q.sp.visible = false; continue; }
    w.ph += dt; const k = w.k; w.obj.updateMatrixWorld(); for (let i = 0; i < w.pts.length; i++) w.obj.localToWorld(w.wp[i].copy(w.pts[i]));
    const fk = 0.85 + 0.15 * Math.sin(w.ph * 13) * Math.sin(w.ph * 5.3 + 1);   // the whole fire breathes
    w.fl.forEach((f, i) => { const p = w.wp[i], a = Math.sin(w.ph * 9 + i * 2) * 0.5 + Math.sin(w.ph * 23 + i) * 0.3; f.position.set(p.x, p.y + 0.35 * k, p.z); f.scale.set(k * 0.95 * (1 + 0.2 * a), k * 1.25 * (1 + 0.25 * a), 1); f.material.opacity = 0.5 + 0.12 * a; });
    _wq.set(0, 0, 0); for (const p of w.wp) _wq.add(p); _wq.multiplyScalar(1 / w.wp.length); w.glow.position.set(_wq.x, _wq.y + 0.9 * k, _wq.z); w.glow.scale.setScalar(k * 4.5 * fk); w.glow.material.opacity = 0.1 * fk;
    if (close) {
      for (const q of w.tg) { q.t += dt; if (q.t >= q.life) _tongue(q, w); const u = q.t / q.life, p = w.wp[q.p], lean = u * u * 0.6 * k;
        q.s.position.set(p.x + q.ox + WIND.x * lean, p.y + 0.15 * k + q.vy * q.t, p.z + q.oz + WIND.z * lean); const gr = Math.min(1, u * 5);
        q.s.scale.set(q.w0 * gr * (1 - 0.55 * u), q.h0 * gr * (0.7 + 0.5 * u), 1);
        if (u < 0.45) _fc.copy(_FY).lerp(_FO, u / 0.45); else _fc.copy(_FO).lerp(_FR, (u - 0.45) / 0.55); q.s.material.color.copy(_fc); q.s.material.opacity = 0.72 * Math.pow(1 - u, 0.8) * Math.min(1, u * 8); }   // in daylight a flame is a solid orange, not a glow
      for (const q of w.em) { q.t += dt; if (q.t >= q.life) { q.t = 0; q.life = 1.2 + Math.random() * 1.6; q.p = (Math.random() * w.pts.length) | 0; q.vx = (Math.random() - 0.5) * 1.6; q.vz = (Math.random() - 0.5) * 1.6; q.vy = 3 + Math.random() * 3.5; q.o = w.wp[q.p].clone(); }
        const t = q.t, u = t / q.life; q.s.position.set(q.o.x + (q.vx + WIND.x * 1.8) * t, q.o.y + 0.5 * k + q.vy * t - 0.6 * t * t, q.o.z + (q.vz + WIND.z * 1.8) * t); q.s.scale.setScalar(0.06 * (1 - u * 0.6)); q.s.material.opacity = (1 - u) * (0.45 + 0.3 * Math.sin(t * 40 + q.vx * 9)); }
    }
    if (w === lit) { LIGHTS.wreck.position.set(_wq.x, _wq.y + 1.6 * k, _wq.z); LIGHTS.wreck.intensity = 2200 * k * fk; }
    const L = 8;
    for (const q of w.sm) {
      if (!full) { q.sp.visible = false; continue; }
      q.t += dt; if (q.t >= L || q.o.lengthSq() === 0) { q.t = q.t >= L ? q.t - L : q.t; q.o.copy(w.wp[(Math.random() * w.wp.length) | 0]); q.r = (Math.random() - 0.5) * 0.3; }
      const t = q.t, u = t / L, rise = 2.0 * t + 0.14 * t * t, lean = 0.2 * t * t * k;
      q.sp.visible = true; q.sp.position.set(q.o.x + WIND.x * lean + Math.sin(t * 1.3 + q.r * 9) * 0.3, q.o.y + 0.9 * k + rise * k, q.o.z + WIND.z * lean + Math.cos(t * 1.1 + q.r * 7) * 0.3);
      q.sp.scale.setScalar(k * (1.15 + t * 1.45)); q.sp.material.rotation += q.r * dt; q.sp.material.opacity = 0.92 * Math.min(1, t * 2.4) * Math.pow(1 - u, 1.25); q.sp.material.color.copy(_dc).lerp(_gc, u * 0.8);
    }
  }
  if (!lit) LIGHTS.wreck.intensity = 0;
}
/* a wreck placed with the scene: the vehicle in its paint, set down a little crooked, and on fire */
function wreckTilt(m, r) { m.rotation.order = 'YXZ'; m.rotation.x = (r() - 0.5) * 0.09; m.rotation.z = (r() - 0.5) * 0.11; m.position.y -= 0.06 + r() * 0.1; }
function smokeColumn(x, z, s, fire = false) {
  if (!SMOKE_T) SMOKE_T = puffTex();
  const base = Math.max(groundAt(x, z), 0), n = LITE ? 5 : 8, col = { parts: [], x, z, s, t: 0, ph: Math.random() * 6 };
  for (let i = 0; i < n; i++) {
    const u = i / (n - 1); const c = new THREE.Color().lerpColors(new THREE.Color(0x24211e), new THREE.Color(0x8c877e), u * 0.85);
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: SMOKE_T, transparent: true, depthWrite: false, color: c, opacity: lerp(0.95, 0.4, u) }));
    const h = s * (0.35 + i * 0.62), drift = u * u * s * 1.6;
    sp.position.set(x + drift * 0.35, base + h, z + drift); sp.scale.setScalar(s * (0.7 + u * 1.9)); sp.material.rotation = Math.random() * 6; scene.add(sp);
    col.parts.push({ sp, s0: s * (0.7 + u * 1.9), rs: (Math.random() - 0.5) * 0.08 });
  }
  if (fire) { const f = new THREE.Sprite(new THREE.SpriteMaterial({ map: radialTex([[0, 'rgba(255,220,150,1)'], [0.35, 'rgba(255,140,50,.7)'], [1, 'rgba(200,60,10,0)']]), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, toneMapped: false, color: new THREE.Color(HDRK, HDRK, HDRK) })); f.position.set(x, base + s * 0.12, z); f.scale.setScalar(s * 0.5); scene.add(f); col.fire = f; }
  FAR_SMOKE.push(col); return col;
}
function updFarSmoke(dt, time) {
  for (const c of FAR_SMOKE) {
    c.t += dt; const grow = Math.min(1, c.t / 12 + 0.25);
    c.parts.forEach((p, i) => { p.sp.material.rotation += p.rs * dt; p.sp.scale.setScalar(p.s0 * grow * (0.94 + 0.06 * Math.sin(time * 0.7 + i + c.ph))); });
    if (c.fire) c.fire.scale.setScalar(c.s * 0.5 * (0.85 + 0.15 * Math.sin(time * 5 + c.ph)));
  }
}
function farFires() {
  for (const [x, z, s, f] of [[-2350, -2700, 70, 1], [-1900, -3300, 55, 0], [-760 + PTDX, 120, 26, 1], [-980 + PTDX, -420, 34, 0], [520, -3000, 60, 1], [1300, -5200, 110, 0], [-2900, -2100, 80, 0], [640, -960, 40, 1], [1500, -1500, 70, 0], [-480 + PTDX, -120, 24, 1], [-620 + PTDX, 60, 32, 1], [nearX(-380), -300, 20, 1]]) smokeColumn(x, z, s, !!f);
}

/* ================= towns across the canal ================= */
function instBoxes(list) {
  const im = new THREE.InstancedMesh(GEO.bldg, MAT.wall, list.length); const mm = new THREE.Matrix4(), q = new THREE.Quaternion(), c = new THREE.Color(), up = V3(0, 1, 0);
  list.forEach((b, i) => { q.setFromAxisAngle(up, b.rot || 0); mm.compose(V3(b.x, groundAt(b.x, b.z) - 0.3, b.z), q, V3(b.w, b.h, b.d)); im.setMatrixAt(i, mm); c.setRGB(lin(b.c[0]), lin(b.c[1]), lin(b.c[2])); im.setColorAt(i, c); });
  scene.add(im); return im;
}
function palms(list) {
  const H = 9, trunk = new THREE.CylinderGeometry(0.16, 0.27, H, 8, 6).translate(0, H / 2, 0); { const p = trunk.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i); p.setX(i, p.getX(i) + Math.pow(y / H, 2) * 0.7); } trunk.computeVertexNormals(); }
  const tg = build([[trunk, 0x8a7a64], [G.sph(0.4, 8, 6), 0x6b5a3a, M4(0.7, H, 0)]]);
  const fr = []; for (let k = 0; k < 10; k++) { const g = new THREE.PlaneGeometry(3.6, 1.05, 8, 1).translate(1.8, 0, 0).rotateX(-Math.PI / 2); const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const t = p.getX(i) / 3.6; p.setY(i, t * 0.9 - t * t * 2.1); } g.rotateZ(k < 5 ? 0.25 : -0.05); g.rotateY(k * 0.628 + (k % 2) * 0.2); g.translate(0.7, H, 0); fr.push(g); }
  const fg = mergeGeometries(fr, false);
  const ti = new THREE.InstancedMesh(tg, MAT.vc, list.length), fi = new THREE.InstancedMesh(fg, MAT.frond, list.length), mm = new THREE.Matrix4(), q = new THREE.Quaternion(), up = V3(0, 1, 0);
  list.forEach(([x, z, s, r], i) => { mm.compose(V3(x, groundAt(x, z) - 0.2, z), q.setFromAxisAngle(up, r), V3(s, s, s)); ti.setMatrixAt(i, mm); fi.setMatrixAt(i, mm); });
  scene.add(ti, fi);
}
/* prickly pear - the sabra - in clumps round a village: the hedge of yards from the Nile to the Galilee. A cut-out photograph on two crossed
   cards (4f_data_sabra.js), alpha-tested, lit as if it faced up like the other plant cards; it casts no shadow (a card's would be a
   rectangle). list: [x, z, scale, turn] */
let SABRA_MAT = null;
function sabras(list) {
  if (!list.length) return;
  if (!SABRA_MAT) { const t = new THREE.TextureLoader().load(SABRA_PNG); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = ANISO; SABRA_MAT = new THREE.MeshStandardMaterial({ map: t, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.82, metalness: 0 }); }
  const W = 2.5, H = W * 193 / 320, g = mergeGeometries([0, Math.PI / 2].map((a) => new THREE.PlaneGeometry(W, H).translate(0, H / 2 - 0.06, 0).rotateY(a)), false);
  { const n = g.attributes.normal; for (let i = 0; i < n.count; i++) n.setXYZ(i, 0, 1, 0); }
  const m = new THREE.InstancedMesh(g, SABRA_MAT, list.length), mm = new THREE.Matrix4(), q = new THREE.Quaternion(), up = V3(0, 1, 0);
  list.forEach(([x, z, s, r], i) => m.setMatrixAt(i, mm.compose(V3(x, groundAt(x, z), z), q.setFromAxisAngle(up, r), V3(s, s * (0.85 + 0.3 * ((i * 0.618) % 1)), s))));
  m.receiveShadow = true; scene.add(onLayer1(m)); return m;
}
/* the relief of a real dissected desert plateau (DESERT_DEM, 4f_data_desert.js) for the mountains seen across a plain: demAt(x, z) in metres
   over its 4.9 by 2.4 km tile, repeated mirrored so the tiles meet, bilinear. Eroded wadis and buttes that noise alone does not make */
let DEM_A = null;
function demAt(x, z) {
  const D = DESERT_DEM; if (!DEM_A) { const b = atob(D.b64), a = new Uint16Array(b.length >> 1); for (let i = 0; i < a.length; i++) a[i] = b.charCodeAt(2 * i) | (b.charCodeAt(2 * i + 1) << 8); DEM_A = a; }
  let u = x / D.X, v = z / D.Z; u -= 2 * Math.floor(u / 2); if (u > 1) u = 2 - u; v -= 2 * Math.floor(v / 2); if (v > 1) v = 2 - v;
  const fx = u * (D.W - 1), fz = v * (D.H - 1), i = Math.min(D.W - 2, Math.floor(fx)), j = Math.min(D.H - 2, Math.floor(fz)), tx = fx - i, tz = fz - j, A = DEM_A, W = D.W, k = j * W + i;
  return ((A[k] * (1 - tx) + A[k + 1] * tx) * (1 - tz) + (A[k + W] * (1 - tx) + A[k + W + 1] * tx) * tz) / 65535 * D.top;
}
/* ---------- the desert's plants, from the desert scene the player sent (4f_data_desert.js) ----------
   Cut-out cards on two crossed quads (agaves, a column cactus, a flowering hedgehog cactus, a dead saguaro's bones, the sabra), lit as if
   they faced up like the other plant cards and casting no shadow (a card's would be a rectangle); the saguaro itself in 3D, six shapes
   skinned with the scene's ribbed tile and its normal map; a hawk perched on a few of them and two more circling high over the chapter.
   All placed once from fixed seeds - the same in every game - off the roads, the tracks and the positions; a cactus is no cover and
   stops nothing, so none has a collider */
const FLORA = { tex: {}, mats: {}, geo: {}, sag: null, sagMat: null, hawks: [] };
function floraTex(src, srgb = true) { let t = FLORA.tex[src]; if (!t) { t = FLORA.tex[src] = new THREE.TextureLoader().load(src); t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace; t.anisotropy = ANISO; } return t; }
function floraCards(k, list, h) {
  if (!list.length) return null; const C = FLORA_CARDS[k];
  if (!FLORA.mats[k]) FLORA.mats[k] = new THREE.MeshStandardMaterial({ map: floraTex(C.src), alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.85, metalness: 0 });
  if (!FLORA.geo[k]) { const w = h * C.w / C.h, g = mergeGeometries([0, Math.PI / 2].map((a) => new THREE.PlaneGeometry(w, h).translate(0, h / 2 - 0.04 * h, 0).rotateY(a)), false); const n = g.attributes.normal; for (let i = 0; i < n.count; i++) n.setXYZ(i, 0, 1, 0); FLORA.geo[k] = g; }
  const m = new THREE.InstancedMesh(FLORA.geo[k], FLORA.mats[k], list.length), mm = new THREE.Matrix4(), q = new THREE.Quaternion(), up = V3(0, 1, 0), c = new THREE.Color();
  list.forEach(([x, z, s, r, y], i) => { m.setMatrixAt(i, mm.compose(V3(x, y ?? groundAt(x, z), z), q.setFromAxisAngle(up, r), V3(s, s, s))); m.setColorAt(i, c.setScalar(0.86 + 0.24 * ((i * 0.618034) % 1))); });   // y: set when it does not stand on the ground
  m.receiveShadow = true; scene.add(onLayer1(m)); return m;
}
// the saguaros: decoded once; uv wrapped round the stem (four ribbed tiles to its girth), so the ribs run up it
function saguaroGeos() {
  if (FLORA.sag) return FLORA.sag;
  const dec = (b64) => { const b = atob(b64), a = new Uint16Array(b.length >> 1); for (let i = 0; i < a.length; i++) a[i] = b.charCodeAt(2 * i) | (b.charCodeAt(2 * i + 1) << 8); return a; };
  FLORA.sag = SAGUARO.map((o) => { const q = dec(o.p), ix = dec(o.i), n = q.length / 3, pos = new Float32Array(q.length), uv = new Float32Array(n * 2);
    for (let i = 0; i < n; i++) { for (let k = 0; k < 3; k++) pos[i * 3 + k] = o.lo[k] + q[i * 3 + k] / 65535 * (o.hi[k] - o.lo[k]); uv[i * 2] = (Math.atan2(pos[i * 3 + 2], pos[i * 3]) / (2 * Math.PI) + 0.5) * 4; uv[i * 2 + 1] = pos[i * 3 + 1] * 18; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); g.setIndex(new THREE.BufferAttribute(ix, 1)); g.computeVertexNormals(); return g; });
  const a = floraTex(SAGUARO_SKIN.a), nm = floraTex(SAGUARO_SKIN.n, false); a.wrapS = a.wrapT = nm.wrapS = nm.wrapT = THREE.RepeatWrapping;
  FLORA.sagMat = new THREE.MeshStandardMaterial({ map: a, normalMap: nm, normalScale: new THREE.Vector2(1.2, 1.2), roughness: 0.8, metalness: 0, color: 0xeef0dc });
  return FLORA.sag;
}
function saguaros(list) {   // [x, z, height, turn, shape]
  const G = saguaroGeos(), mm = new THREE.Matrix4(), q = new THREE.Quaternion(), up = V3(0, 1, 0), c = new THREE.Color();
  G.forEach((g, k) => { const it = list.filter((s) => s[4] === k); if (!it.length) return; const m = new THREE.InstancedMesh(g, FLORA.sagMat, it.length);
    it.forEach(([x, z, h, r], i) => { m.setMatrixAt(i, mm.compose(V3(x, groundAt(x, z) - 0.15, z), q.setFromAxisAngle(up, r), V3(h, h, h))); m.setColorAt(i, c.setRGB(0.9 + 0.15 * ((i * 0.618) % 1), 0.95 + 0.1 * ((i * 0.382) % 1), 0.9)); });
    SH(m, !LITE, true); scene.add(onLayer1(m)); });   // (on the lighter map they cast no shadow)
}
/* the plants of a desert chapter over a box: in clumps (where water once ran), many of them within sight of the route (near: its points),
   off ok's ground; k scales the counts (by the box's area too). A hawk sits on top of three saguaros; two more circle high over the box */
function desertFlora(x0, x1, z0, z1, seed, ok, k = 1, near = null) {
  const A = Math.abs((x1 - x0) * (z1 - z0)) / 1.4e6, n = (c) => Math.max(1, Math.round(c * k * A * (LITE ? 0.45 : 1)));
  // clump centres: some over the whole box, some along the route; round each, a handful of the kind within rad
  const clumps = (nc, per, rad, sd, size) => { const r = rng(seed * 7 + sd), cs = scatterIn(Math.ceil(nc * 0.55), x0, x1, z0, z1, seed + sd, ok, (x, z) => [x, z]); if (near) cs.push(...scatterNear(near, Math.ceil(nc * 0.45), 14, 130, seed + sd + 50, ok, (x, z) => [x, z]));
    const out = []; for (const [cx, cz] of cs) { const m = 1 + Math.floor(r() * per); for (let q = 0; q < m; q++) { const a = r() * 6.283, d = Math.sqrt(r()) * rad, x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d; if (ok(x, z)) out.push([x, z, size[0] + r() * size[1], r() * 6]); } } return out; };
  floraCards('agave', clumps(n(1300), 6, 7, 1, [0.6, 0.8]), 1.0);
  floraCards('parry', clumps(n(1000), 5, 6, 2, [0.55, 0.65]), 0.75);
  floraCards('column', clumps(n(800), 4, 5, 3, [0.6, 0.9]), 1.6);
  floraCards('hedge', clumps(n(1200), 6, 4, 4, [0.7, 0.7]), 0.45);
  floraCards('bones', clumps(n(90), 1, 1, 5, [0.8, 0.5]), 3.0);
  sabras(clumps(n(200), 3, 6, 6, [0.8, 0.6]));
  const sg = clumps(n(220), 3, 14, 7, [3.6, 5.2]).map((s, i) => [s[0], s[1], s[2], s[3], Math.floor(((i * 0.618034) % 1) * 6)]); saguaros(sg);
  // the perched hawks: on the tallest saguaros' tops (the stem's tip is at the shape's own height, one unit)
  const tall = sg.filter((s) => s[4] >= 3).sort((a, b) => b[2] - a[2]).slice(0, 3);
  floraCards('perch', tall.map(([x, z, h], i) => [x, z, 1, i * 2.1, groundAt(x, z) - 0.17 + h]), 0.55);
  { const m = FLORA_CARDS.hawk, mat = new THREE.SpriteMaterial({ map: floraTex(m.src), alphaTest: 0.5 }), r = rng(seed + 9), cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    for (let i = 0; i < 2; i++) { const s = new THREE.Sprite(mat); s.scale.set(1.25, 1.25 * m.h / m.w, 1); s.userData.dyn = true; s.userData.hawk = { cx: cx + (r() - 0.5) * 500, cz: cz + (r() - 0.5) * 300, R: 50 + r() * 50, y: 70 + r() * 50, w: (r() < 0.5 ? -1 : 1) * (0.1 + r() * 0.06), a: r() * 6.3 }; scene.add(s); FLORA.hawks.push(s); } }
}
{ const prev = scene.onBeforeRender, _v = V3(), _r = V3(); scene.onBeforeRender = function (...a) { prev.apply(this, a);
  for (const s of FLORA.hawks) { if (!s.visible) continue; const H = s.userData.hawk, t = performance.now() / 1000, an = H.a + t * H.w, gx = H.cx + Math.cos(an) * H.R, gz = H.cz + Math.sin(an) * H.R;
    s.position.set(gx, groundAt(H.cx, H.cz) + H.y + Math.sin(t * 0.3 + H.a) * 4, gz);
    _v.set(-Math.sin(an) * H.w, 0, Math.cos(an) * H.w); _r.setFromMatrixColumn(camera.matrixWorld, 0); s.scale.x = Math.abs(s.scale.x) * (_v.dot(_r) < 0 ? -1 : 1); } }; }
/* the waterfront of Port Tewfik across the canal: a continuous front of two- to five-storey houses facing the water, a second row behind it,
   a fifth of them broken by the shelling - storeys torn off, black holes in the facades - and a minaret above the roofs */
function buildWaterfront() {
  const r = rng(7341), parts = [], dark = [], T = MAT.wall.map.clone(); T.wrapS = T.wrapT = THREE.RepeatWrapping; T.needsUpdate = true;
  const TONES = [0xece6d8, 0xe2d6bc, 0xd8ccb2, 0xcfc8ba, 0xe8dcc6, 0xc9bfa8];
  const shore = (z) => { let x = -470 + PTDX; while (x > -620 + PTDX && groundAt(x, z) < 1.0) x -= 2; return x; };
  const house = (xf, z0, z1, d, fl, ruin) => {
    const g = Math.min(groundAt(xf - d / 2, (z0 + z1) / 2), groundAt(xf, z0), groundAt(xf, z1)) - 0.4, tone = pick(TONES), h = fl * 3.3 + 0.7, top = g + 0.4 + h;
    if (!ruin) { parts.push([boxUV(xf - d, xf, g, top, z0, z1, 12, 9.9), tone]); parts.push([boxUV(xf - d - 0.2, xf + 0.25, top - 0.05, top + 0.55, z0 - 0.2, z1 + 0.2, 6, 1), 0xd9d0bc]); return; }
    // a broken house: the lower storeys stand, the top is torn into ragged blocks, the facade full of holes
    const keep = Math.max(1, fl - 1 - Math.floor(r() * 2)), tk = g + 0.4 + keep * 3.3; parts.push([boxUV(xf - d, xf, g, tk, z0, z1, 12, 9.9), 0xbdb3a0]);
    let zz = z0; while (zz < z1 - 1) { const w = Math.min(z1 - zz, 2 + r() * 4.5), hh = r() < 0.35 ? 0 : (0.6 + r() * (fl - keep)) * 3.3; if (hh > 0) parts.push([boxUV(xf - d * (0.5 + r() * 0.5), xf, tk, tk + hh, zz, zz + w, 12, 9.9), 0xb5ab98]); zz += w; }
    for (let k = 0; k < 2 + Math.floor(r() * 4); k++) { const hz = lerp(z0 + 1.5, z1 - 1.5, r()), hy = g + 1.5 + r() * (tk - g - 2), s2 = 1.2 + r() * 2.6; dark.push([G.box(0.5, s2 * 0.8, s2), 0x1a1714, M4(xf + 0.05, hy, hz, 0, 0, 0, 1, 1, 1)]); }
    for (let k = 0; k < 6; k++) dark.push([G.box(0.8 + r() * 1.5, 0.4 + r() * 0.6, 0.8 + r() * 1.5), 0x9a8e78, M4(xf + 1 + r() * 4, groundAt(xf + 2, z0) + 0.2, lerp(z0, z1, r()), r(), r() * 3, r())]);
  };
  for (const [row, dx] of [[0, 0], [1, -24]]) {
    let z = -470; while (z < 395) { const w = 11 + r() * 15, gap = row ? 2 + r() * 6 : (r() < 0.25 ? 6 + r() * 8 : 1 + r() * 2.5), zc = z + w / 2, xs = shore(zc); if (xs < -600 + PTDX) { z += w + gap; continue; }
      const xf = xs - 16 - r() * 7 + dx, fl = row ? 3 + Math.floor(r() * 3) : 2 + Math.floor(r() * r() * 4); house(xf, z, z + w, 11 + r() * 9, fl, r() < 0.22); z += w + gap; }
  }
  // the minaret and the dome of the mosque by the harbour
  { const zm = 64, xm = shore(zm) - 40, g = groundAt(xm, zm); parts.push([G.cyl(1.25, 1.45, 27, 12), 0xe6dfcf, M4(xm, g + 13.5, zm)], [G.cyl(1.9, 1.9, 0.5, 14), 0xd6ccb6, M4(xm, g + 21, zm)], [G.cyl(0.95, 1.15, 4, 12), 0xe6dfcf, M4(xm, g + 29, zm)], [G.cone(1.0, 2.4, 12), 0x9aa49a, M4(xm, g + 32.2, zm)]);
    parts.push([G.sph(6.5, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), 0xdcd4c2, M4(xm - 11, g + 9, zm + 4)], [boxUV(...[xm - 20, xm - 2], g, g + 9, zm - 5, zm + 13, 12, 9.9), 0xe2d8c4]); }
  const mat = townFog(new THREE.MeshStandardMaterial({ vertexColors: true, map: T, roughness: 0.95 }), 'w'); scene.add(SH(onLayer1(new THREE.Mesh(build(parts), mat)), true, false));   /* the waterfront takes the haze too */
  if (dark.length) scene.add(onLayer1(new THREE.Mesh(build(dark), MAT.vc)));
}
/* the towns across the canal through the haze of the first day: the dust and smoke of the barrage hang over Port Tewfik and Suez. In the
   stronghold's mission their houses take the haze faster than the open desert (a heavier fog on them alone: they are silhouettes, not boxes),
   and soft banks of dust and smoke drift low in front of them and over their roofs, slowly, with the wind */
const TOWN_FOG = { value: 1 }, TOWN_SMOKE = { value: new THREE.Color(0.45, 0.44, 0.43) }, TOWN_SMOKEK = { value: 0 }, FOG_DAY_REF = new THREE.Color(0xbac5cc); let TOWN_HAZE = null;
function townFog(m, tag) {
  const prev = m.onBeforeCompile;
  m.onBeforeCompile = (sh, r) => { if (prev) prev.call(m, sh, r); sh.uniforms.uFogK = TOWN_FOG; sh.uniforms.uSmokeC = TOWN_SMOKE; sh.uniforms.uSmokeK = TOWN_SMOKEK; sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform float uFogK; uniform vec3 uSmokeC; uniform float uSmokeK;')
    .replace('#include <fog_fragment>', '#ifdef USE_FOG\n#ifdef FOG_EXP2\nfloat fogFactor = 1.0 - exp(-fogDensity * fogDensity * uFogK * uFogK * vFogDepth * vFogDepth);\n#else\nfloat fogFactor = smoothstep(fogNear, fogFar / uFogK, vFogDepth);\n#endif\ngl_FragColor.rgb = mix(gl_FragColor.rgb, mix(fogColor, uSmokeC, uSmokeK), fogFactor);\n#endif'); };
  m.customProgramCacheKey = () => 'townFog' + tag; return m;
}
function townMat() { return MAT.townWall || (MAT.townWall = townFog(MAT.wall.clone(), 'b')); }
function hazeTex() {
  const W = 256, H = 96, c = canvas(W, H), g = c.getContext('2d'), r = rng(4417);
  for (let i = 0; i < 70; i++) { const x = W * (0.12 + r() * 0.76), y = H * (0.35 + r() * 0.35), rad = H * (0.18 + r() * 0.3), gr = g.createRadialGradient(x, y, 0, x, y, rad);
    gr.addColorStop(0, `rgba(255,255,255,${0.1 + r() * 0.1})`); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.beginPath(); g.arc(x, y, rad, 0, 6.2832); g.fill(); }
  const t = tex(c); return t;
}
function townHaze() {
  /* a smoke screen, as the Egyptians laid along their bank for the crossing: grey smoke rolling low over the far edge of the water - the boats
     come out of it - billowing up over the waterfront, and the smoke of the barrage over the town behind, so that the town is all but gone */
  if (!SMOKE_T) SMOKE_T = puffTex();
  const grp = new THREE.Group(), r = rng(9203), list = [], shore = (z) => { let x = -470 + PTDX; while (x > -620 + PTDX && groundAt(x, z) < 1.0) x -= 2; return x; };
  const puff = (x, z, y, sc, op, grey) => { const c = new THREE.Color(grey, grey, grey * 0.98), m = new THREE.SpriteMaterial({ map: SMOKE_T, color: c, transparent: true, opacity: op, depthWrite: false });
    const sp = new THREE.Sprite(m); sp.scale.setScalar(sc); sp.position.set(x, y, z); m.rotation = r() * 6.28; grp.add(sp); list.push({ sp, x, z, y, sc, op, c0: c.clone(), ph: r() * 6.28, rs: (r() - 0.5) * 0.06 }); };
  const NL = LITE ? 60 : 110, NU = LITE ? 26 : 50, NT = LITE ? 22 : 40;
  for (let i = 0; i < NL; i++) { const z = -580 + (i + r()) * (1040 / NL), x = shore(z) + 10 - r() * 34; puff(x, z, Math.max(groundAt(x, z), 0) + 3 + r() * 12, 28 + r() * 26, 0.82 + r() * 0.14, 0.5 + r() * 0.12); }   // low over the water's edge
  for (let i = 0; i < NU; i++) { const z = -580 + (i + r()) * (1040 / NU), x = shore(z) - 15 - r() * 60; puff(x, z, Math.max(groundAt(x, z), 0) + 16 + r() * 22, 46 + r() * 34, 0.66 + r() * 0.2, 0.46 + r() * 0.12); }   // billowing up over the waterfront
  for (let i = 0; i < NT; i++) { const z = -600 + r() * 1080, x = -330 - r() * 520; puff(x, z, Math.max(groundAt(x, z), 0) + 22 + r() * 40, 80 + r() * 70, 0.5 + r() * 0.25, 0.4 + r() * 0.12); }   // the barrage's smoke over the town
  grp.visible = false; scene.add(grp); TOWN_HAZE = grp;
  { const prev = scene.onBeforeRender, day = (FOG_DAY_REF.r + FOG_DAY_REF.g + FOG_DAY_REF.b) || 1; let last = performance.now() / 1000;
    scene.onBeforeRender = function (...a) { prev.apply(this, a); if (!grp.visible) return; const t = performance.now() / 1000, dt = Math.min(0.1, t - last); last = t;
      const fc = scene.fog.color, k = clamp((fc.r + fc.g + fc.b) / day, 0.18, 1); TOWN_SMOKE.value.setRGB(0.45 * k, 0.44 * k, 0.43 * k);   /* the smoke darkens with the light at dusk */
      for (const q of list) { const d = Math.sin(t * 0.03 + q.ph) * 10; q.sp.position.set(q.x + WIND.x * d, q.y + Math.sin(t * 0.06 + q.ph) * 1.2, q.z + WIND.z * d); q.sp.material.rotation += q.rs * dt;
        q.sp.scale.setScalar(q.sc * (0.94 + 0.06 * Math.sin(t * 0.09 + q.ph * 3))); q.sp.material.color.copy(q.c0).multiplyScalar(k); } }; }
  for (const [x, z, sz] of [[-700 + PTDX, -260, 30], [-860 + PTDX, 300, 28], [-560 + PTDX, 330, 22]]) smokeColumn(x, z, sz, false);   // and fires smoking in the town
}
function buildTowns() {
  const r = rng(31); const WALLS = [[0.86, 0.83, 0.76], [0.82, 0.71, 0.53], [0.88, 0.80, 0.62], [0.72, 0.70, 0.66], [0.79, 0.75, 0.68]];
  const pt = [];
  for (let x = -1090 + PTDX; x <= -530 + PTDX; x += 26) for (let z = -540; z <= 420; z += 24) {
    const jx = x + (r() - .5) * 7, jz = z + (r() - .5) * 7;
    if (!inPoly(jx, jz, PT_ZONE) || inPoly(jx, jz, [[-915 + PTDX, -265], [-705 + PTDX, -265], [-705 + PTDX, -55], [-915 + PTDX, -55]]) || jx > -612 + PTDX) continue;
    if (((jx + 1100 - PTDX) % 70 + 70) % 70 < 13 || ((jz + 560) % 70 + 70) % 70 < 13 || r() < 0.28 || groundAt(jx, jz) < 0.9) continue;
    const ruined = r() < 0.2; pt.push({ x: jx, z: jz, w: 10 + r() * 8, d: 9 + r() * 6, h: ruined ? 1.8 + r() * 2.5 : 6 + r() * 5, rot: (r() - .5) * 0.06, c: ruined ? [0.5, 0.47, 0.42] : pick(WALLS) });
  }
  buildWaterfront();
  instBoxes(pt).material = townMat(); townHaze();
  const suez = [];
  for (let x = -5200; x <= -1250; x += 40) for (let z = -5600; z <= -1700; z += 40) {
    const dc = Math.hypot(x + 2700, z + 3100); if (r() > 0.85 * Math.exp(-dc / 2300)) continue;
    const jx = x + (r() - .5) * 8, jz = z + (r() - .5) * 8; if (groundAt(jx, jz) < 1.2 || (jx > CITY.x0 - 20 && jx < CITY.x1 + 20 && jz > CITY.z0 - 20 && jz < CITY.z1 + 20)) continue;
    const ruined = r() < 0.14; suez.push({ x: jx, z: jz, w: 12 + r() * 12, d: 12 + r() * 12, h: ruined ? 2 + r() * 3 : 5 + r() * r() * 16, rot: 0.31 + (r() - .5) * 0.05, c: ruined ? [0.48, 0.45, 0.4] : pick(WALLS) });
    if (suez.length > (LITE ? 450 : 1800)) break;
  }
  instBoxes(suez).material = townMat();
  const pl = [];
  for (let z = -470; z <= 380; z += LITE ? 34 : 19) { let x = -470 + PTDX; while (x > -600 + PTDX && groundAt(x, z) < 1.0) x -= 2; if (x <= -600 + PTDX) continue; pl.push([x - 5 - r() * 7, z + (r() - 0.5) * 6, 0.8 + r() * 0.45, r() * 6.28]); }
  for (let i = 0; i < (LITE ? 20 : 70); i++) { const x = -560 + PTDX - r() * 480, z = -520 + r() * 900; if (inPoly(x, z, PT_ZONE) && groundAt(x, z) > 0.9) pl.push([x, z, 0.75 + r() * 0.4, r() * 6.28]); }
  palms(pl);
  { let x = -470 + PTDX; while (x > -600 + PTDX && groundAt(x, -40) < 1.0) x -= 2; flag(x - 7, -40, 'eg', 10, 2.6); }
  for (const z of [-300, -60, 250]) { const arc = []; for (let a = 0; a <= 180; a += 30) { const t = THREE.MathUtils.degToRad(a); arc.push([-512 + PTDX + Math.sin(t) * 1.6, z - Math.cos(t) * 1.6]); } bagWall(arc, 4, null, false); }
}

/* ================= ground clutter ================= */
function scatterDetail() {
  const r = rng(808), mm = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), col = new THREE.Color(), up = V3(0, 1, 0);
  const NP = LITE ? 700 : 3200; const peb = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1, 0), MAT.pebble, NP); let k = 0;
  for (let tries = 0; tries < NP * 6 && k < NP; tries++) {
    const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 210; const x = Math.cos(a) * d - 8, z = Math.sin(a) * d * 1.25; const gy = groundAt(x, z);
    if (gy < 0.55 || blocked(x, z, 0.2, gy) || nearRoad(x, z) < 0.3) continue; const s = 0.035 + r() * r() * 0.24;
    q.setFromEuler(e.set(r() * 3, r() * 3, r() * 3)); peb.setMatrixAt(k, mm.compose(V3(x, gy + s * 0.15, z), q, V3(s, s * 0.6, s * (0.7 + r() * 0.5))));
    const t = r(); col.setRGB(lin(0.56 + t * 0.26), lin(0.5 + t * 0.23), lin(0.41 + t * 0.2)); peb.setColorAt(k, col); k++;
  }
  peb.count = k; scene.add(SH(onLayer1(peb), false, true));
  const sg = mergeGeometries([new THREE.PlaneGeometry(1, 1).translate(0, 0.5, 0), new THREE.PlaneGeometry(1, 1).translate(0, 0.5, 0).rotateY(Math.PI / 2)]);
  const NS = LITE ? 140 : 520; const sh = new THREE.InstancedMesh(sg, MAT.shrub, NS); k = 0; const ring4 = outwardRing(MAOZ, 4);
  for (let tries = 0; tries < NS * 8 && k < NS; tries++) {
    const x = -95 + r() * 200, z = -330 + r() * 700; const gy = groundAt(x, z);
    if (gy < 0.8 || inPoly(x, z, ring4) || Math.abs(x - 6) < 5 && Math.abs(z) > 90) continue;
    const s = 0.5 + r() * 0.9; sh.setMatrixAt(k, mm.compose(V3(x, gy - 0.05, z), q.setFromAxisAngle(up, r() * 3), V3(s * (0.9 + r() * 0.5), s, s))); const t = r(); col.setRGB(0.8 + t * 0.2, 0.8 + t * 0.18, 0.75 + t * 0.2); sh.setColorAt(k, col); k++;
  }
  sh.count = k; scene.add(SH(onLayer1(sh), true, false));
}
/* scorch marks left by shells */
const SCORCH = { list: [], i: 0 };
function initScorch() {
  const mat = new THREE.MeshStandardMaterial({ map: scorchTex(), transparent: true, depthWrite: false, roughness: 1 });
  for (let i = 0; i < (LITE ? 16 : 44); i++) { const g = new THREE.PlaneGeometry(1, 1, 8, 8); const m = new THREE.Mesh(g, mat); m.visible = false; m.frustumCulled = false; m.receiveShadow = SHADOWS; m.renderOrder = 1; scene.add(onLayer1(m)); SCORCH.list.push(m); }
}
function addScorch(p, size) {
  if (!SCORCH.list.length || groundAt(p.x, p.z) < 0.2) return;
  const m = SCORCH.list[SCORCH.i++ % SCORCH.list.length], pos = m.geometry.attributes.position; const a = Math.random() * 6.28, c = Math.cos(a), s = Math.sin(a);
  for (let k = 0; k < pos.count; k++) { const u = (k % 9) / 8 - 0.5, v = Math.floor(k / 9) / 8 - 0.5; const x = p.x + (u * c - v * s) * size, z = p.z + (u * s + v * c) * size; pos.setXYZ(k, x, groundAt(x, z) + 0.07, z); }
  pos.needsUpdate = true; m.geometry.computeVertexNormals(); m.visible = true;
}



/* ================= asphalt roads, plazas and prefab huts inside the stronghold ================= */
function asphaltTex() {
  const n = 256, c = canvas(n), g = c.getContext('2d'), img = g.createImageData(n, n), r = rng(611);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { const v = 104 + (r() - 0.5) * 38 + (r() < 0.015 ? 55 : 0); const i = (y * n + x) * 4; img.data[i] = v; img.data[i + 1] = v * 0.99; img.data[i + 2] = v * 0.96; img.data[i + 3] = 255; }
  g.putImageData(img, 0, 0);
  tileBlotches(g, n, r, 34, 10, 55, 'rgba(25,25,25,0.4)', 'rgba(185,170,140,0.3)', 0.55);
  g.lineCap = 'round';
  for (let k = 0; k < 24; k++) { let x = r() * n, y = r() * n; g.strokeStyle = `rgba(15,15,15,${0.35 + r() * 0.35})`; g.lineWidth = 0.8 + r() * 1.4; g.beginPath(); g.moveTo(x, y); for (let j = 0; j < 7; j++) { x += (r() - 0.5) * 30; y += (r() - 0.5) * 30; g.lineTo(x, y); } g.stroke(); }
  for (let k = 0; k < 5; k++) { const x = r() * n, y = r() * n, w = 20 + r() * 40, h = 14 + r() * 30; g.fillStyle = `rgba(${50 + r() * 20},${50 + r() * 20},${48 + r() * 20},0.6)`; g.fillRect(x, y, w, h); }
  const t = tex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
MAT.asphalt = new THREE.MeshStandardMaterial({ map: asphaltTex(), vertexColors: true, roughness: 0.9, metalness: 0 });
const ROADS = [
  { w: 6, pts: [[0, -97], [1, -82], [2, -60], [2, -30], [-2, -5], [-6, 10], [-7, 30], [-6, 60], [-4, 94]] },
  { w: 4.6, pts: [[-60, -22], [-30, -24], [-4, -24], [22, -22], [40, -18], [58, -14]] },
  { w: 4.6, pts: [[-60, 40], [-30, 42], [-7, 42], [20, 40], [46, 46]] },
  { w: 3.6, pts: [[-4, 7], [-27, 8]] }, { w: 3.6, pts: [[-1, -4], [25, 5]] }, { w: 3.6, pts: [[20, -23], [27, -42]] },
  { w: 3.6, pts: [[-30, -24], [-30, -40], [-36, -50]] }, { w: 3.6, pts: [[20, 40], [28, 60], [26, 70]] }, { w: 3.6, pts: [[-30, 42], [-38, 58], [-43, 64]] },
];
const PLAZAS = [[-3, -68, 16, 11, 0.05], [-42, -54, 18, 15, 0.52], [26, -8, 14, 10, -0.2], [-40, 26, 12, 10, 0]];
function nearRoad(x, z) { let d = 99; for (const rd of ROADS) d = Math.min(d, distPolyline(x, z, rd.pts) - rd.w / 2); for (const [px, pz, w, h, r] of PLAZAS) { const c = Math.cos(r), sn = Math.sin(r), lx = (x - px) * c - (z - pz) * sn, lz = (x - px) * sn + (z - pz) * c; d = Math.min(d, Math.max(Math.abs(lx) - w / 2, Math.abs(lz) - h / 2)); } return d; }
function surfaceMesh(pos, uv, colr, idx) {
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setAttribute('color', new THREE.Float32BufferAttribute(colr, 3)); g.setIndex(idx); g.computeVertexNormals();
  const m = new THREE.Mesh(g, MAT.asphalt); m.receiveShadow = SHADOWS; scene.add(onLayer1(m)); return m;
}
function buildRoads() {
  const edge = (t) => { const e = Math.pow(Math.abs(t * 2 - 1), 3); return [lerp(1, 1.35, e), lerp(1, 1.22, e), lerp(1, 1.0, e)]; };
  for (const rd of ROADS) {
    const d = densify(rd.pts, 1.5), C = 6, pos = [], uv = [], col = [], idx = []; let s = 0;
    d.forEach((p, i) => {
      const a = d[Math.max(0, i - 1)], b = d[Math.min(d.length - 1, i + 1)]; let tx = b[0] - a[0], tz = b[1] - a[1]; const l = Math.hypot(tx, tz) || 1; tx /= l; tz /= l;
      if (i) s += Math.hypot(p[0] - d[i - 1][0], p[1] - d[i - 1][1]);
      for (let k = 0; k < C; k++) { const t = k / (C - 1), off = (t - 0.5) * rd.w; const x = p[0] + tz * off, z = p[1] - tx * off; pos.push(x, groundAt(x, z) + 0.06, z); uv.push(t * rd.w / 4, s / 4); col.push(...edge(t)); }
    });
    for (let i = 0; i < d.length - 1; i++) for (let k = 0; k < C - 1; k++) { const a = i * C + k, b = a + 1, c = a + C, e = c + 1; idx.push(a, c, b, b, c, e); }
    surfaceMesh(pos, uv, col, idx);
  }
  for (const [px, pz, w, h, r] of PLAZAS) {
    const nx = Math.ceil(w / 1.5), nz = Math.ceil(h / 1.5), c = Math.cos(r), sn = Math.sin(r), pos = [], uv = [], col = [], idx = [];
    for (let j = 0; j <= nz; j++) for (let i = 0; i <= nx; i++) { const lx = (i / nx - 0.5) * w, lz = (j / nz - 0.5) * h; const x = px + lx * c + lz * sn, z = pz - lx * sn + lz * c; pos.push(x, groundAt(x, z) + 0.06, z); uv.push(lx / 4, lz / 4); const e = Math.max(Math.abs(i / nx - 0.5), Math.abs(j / nz - 0.5)) * 2; col.push(...edge(0.5 + e * 0.5)); }
    for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) { const a = j * (nx + 1) + i, b = a + 1, cc = a + nx + 1, e = cc + 1; idx.push(a, cc, b, b, cc, e); }
    surfaceMesh(pos, uv, col, idx);
  }
  // kerb stones along the main road and street lamps
  const lamps = []; const main = densify(ROADS[0].pts, 16);
  main.forEach((p, i) => { if (i === 0 || i === main.length - 1) return; const sd = i % 2 ? 1 : -1; lamps.push([p[0] + sd * 4.2, p[1]]); });
  for (const p of densify(ROADS[2].pts, 18).slice(1, -1)) lamps.push([p[0], p[1] - 3.6]);
  const LAMP = build([[G.cyl(0.07, 0.1, 5.6, 8), 0x55544e, M4(0, 2.8, 0)], [G.box(1.3, 0.06, 0.06), 0x55544e, M4(0.6, 5.5, 0)], [G.box(0.5, 0.16, 0.26), 0x3a3a36, M4(1.2, 5.42, 0)], [G.box(0.42, 0.03, 0.2), 0xe8e4d6, M4(1.2, 5.33, 0)]]);
  const lm = new THREE.InstancedMesh(LAMP, MAT.vcMetal, lamps.length), mm = new THREE.Matrix4(), q = new THREE.Quaternion(), up = V3(0, 1, 0);
  lamps.forEach(([x, z], i) => lm.setMatrixAt(i, mm.compose(V3(x, groundAt(x, z), z), q.setFromAxisAngle(up, Math.atan2(-(0 - z), -x) + Math.PI), V3(1, 1, 1))));
  scene.add(SH(onLayer1(lm))); for (const [x, z] of lamps) addCollider(x, z, 0.15, 0.15, 0, groundAt(x, z) + 5);
}
function hutGeo(w, d, h, wall, roof, trim) {
  const parts = [
    ...[[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b]) => [G.box(0.35, 0.34, 0.35), 0x8f8b80, M4(a * (w / 2 - 0.25), 0.17, b * (d / 2 - 0.25))]),
    [G.box(w, h, d), wall, M4(0, 0.32 + h / 2, 0)],
    [G.box(w + 0.6, 0.07, d + 0.7), roof, M4(0, 0.32 + h + 0.14, 0, 0, 0, 0.07)],
    ...[...Array(Math.floor((d + 0.6) / 0.35)).keys()].map((i) => [G.box(w + 0.62, 0.05, 0.06), trim, M4(0, 0.32 + h + 0.19, -d / 2 - 0.3 + 0.2 + i * 0.35, 0, 0, 0.07)]),
    [G.box(0.95, 1.95, 0.06), 0x4a3a2a, M4(w * 0.22, 0.32 + 0.98, d / 2 + 0.03)], [G.box(0.07, 0.07, 0.03), 0xb8a060, M4(w * 0.22 - 0.35, 1.3, d / 2 + 0.07)],
    [G.box(1.1, 0.24, 0.7), 0x8f8b80, M4(w * 0.22, 0.12, d / 2 + 0.36)],
    [G.box(0.9, 0.7, 0.05), 0x2a3236, M4(-w * 0.2, 0.32 + h * 0.62, d / 2 + 0.03)], [G.box(1.0, 0.07, 0.07), trim, M4(-w * 0.2, 0.32 + h * 0.62 - 0.39, d / 2 + 0.05)],
    ...[-1, 1].map((sd) => [G.box(0.05, 0.6, 0.8), 0x2a3236, M4(sd * (w / 2 + 0.03), 0.32 + h * 0.62, 0)]),
    [G.box(0.5, 0.35, 0.35), 0x9a9a92, M4(w / 2 + 0.2, 0.32 + h * 0.7, -d * 0.3)],
    [G.cyl(0.02, 0.02, 1.6, 5), 0x2a2a26, M4(-w / 2 + 0.3, 0.32 + h + 0.9, -d / 2 + 0.3)],
  ];
  return build(parts);
}
const HUTS = [
  ['רס״פיה', -50, -38, 4, 7, 0.0, 0xcfc8b6, 0x8d8f86], ['מקלחות', -54, 14, 4, 6.5, 0.0, 0xb7ae96, 0x8a8b83], ['שירותים', -52, 30, 3.2, 4.2, 0.1, 0xd4cdbb, 0x8d8f86],
  ['מועדון', -48, 73, 4.5, 8, 0.5, 0x6d704f, 0x7d7f78], ['חדר קשר', 13, -38, 4, 5, 0.0, 0xcfc8b6, 0x8d8f86], ['סדנה', 42, 22, 5, 7, -0.2, 0x7a7453, 0x8a8b83],
  ['מחסן', 46, -42, 4.2, 6.5, 0.2, 0xb7ae96, 0x7d7f78], ['מזנון', 17, 64, 4, 6, Math.PI + 0.3, 0xd4cdbb, 0x8d8f86], ['ש״ג', -10, -80, 2.2, 2.2, 0, 0xd4cdbb, 0x8d8f86],
  ['ש״ג', -14, 80, 2.2, 2.2, Math.PI, 0xd4cdbb, 0x8d8f86], ['מחסן מזון', 32, -4, 3.6, 5, -1.3, 0x7a7453, 0x7d7f78], ['חדר מ״מים', -60, 4, 3.4, 5, Math.PI / 2, 0xcfc8b6, 0x8a8b83],
];
function yardPaving() {
  const n = 256, c = canvas(n), g = c.getContext('2d'), img = g.createImageData(n, n), r = rng(622);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { const v = 150 + (r() - 0.5) * 36 + (r() < 0.02 ? -45 : 0); const i = (y * n + x) * 4; img.data[i] = v * 1.03; img.data[i + 1] = v; img.data[i + 2] = v * 0.92; img.data[i + 3] = 255; }
  g.putImageData(img, 0, 0); tileBlotches(g, n, r, 30, 12, 60, 'rgba(70,64,54,0.3)', 'rgba(220,205,175,0.3)', 0.5);
  g.lineCap = 'round'; for (let k = 0; k < 16; k++) { let x = r() * n, y = r() * n; g.strokeStyle = `rgba(40,36,30,${0.3 + r() * 0.3})`; g.lineWidth = 0.8 + r(); g.beginPath(); g.moveTo(x, y); for (let j = 0; j < 6; j++) { x += (r() - 0.5) * 34; y += (r() - 0.5) * 34; g.lineTo(x, y); } g.stroke(); }
  for (let k = 0; k < 6; k++) { g.strokeStyle = 'rgba(60,54,46,0.25)'; g.lineWidth = 7; g.beginPath(); const y0 = r() * n; g.moveTo(0, y0); g.bezierCurveTo(n * 0.3, y0 + (r() - 0.5) * 80, n * 0.7, y0 + (r() - 0.5) * 80, n, y0); g.stroke(); }
  const t = tex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping;
  const mat = new THREE.MeshStandardMaterial({ map: t, vertexColors: true, roughness: 0.95 });
  const S = 2, [x0, z0, x1, z1] = bbox(YARD), nx = Math.ceil((x1 - x0) / S), nz = Math.ceil((z1 - z0) / S), pos = [], uv = [], col = [], idx = [], id = new Map();
  const vtx = (i, j) => { const k = j * (nx + 1) + i; if (id.has(k)) return id.get(k); const x = x0 + i * S, z = z0 + j * S; pos.push(x, groundAt(x, z) + 0.035, z); uv.push(x / 5, z / 5); const e = clamp(-sdPoly(x, z, YARD) / 6, 0, 1); col.push(lerp(1.15, 1, e), lerp(1.08, 1, e), lerp(0.95, 1, e)); id.set(k, pos.length / 3 - 1); return pos.length / 3 - 1; };
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
    const cx = x0 + (i + 0.5) * S, cz = z0 + (j + 0.5) * S; if (!inPoly(cx, cz, YARD) || onTrench(cx, cz) < 2.9 || groundAt(cx, cz) > 3.0) continue;
    const a = vtx(i, j), b = vtx(i + 1, j), cc = vtx(i, j + 1), d = vtx(i + 1, j + 1); idx.push(a, cc, b, b, cc, d);
  }
  const gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); gg.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); gg.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); gg.setIndex(idx); gg.computeVertexNormals();
  const m = new THREE.Mesh(gg, mat); m.receiveShadow = SHADOWS; scene.add(onLayer1(m));
}
const CONTAINERS = [[40, -58, 0.3, 0x6b6d4a], [-60, 50, 1.2, 0x7a4a32], [52, 8, 1.5, 0x55636b], [-18, 72, 0.05, 0x6b6d4a], [31, 24, Math.PI / 2, 0x7a4a32], [-56, -60, 0.8, 0x55636b]];
function buildContainers() {
  for (const [x, z, rot, colr] of CONTAINERS) {
    const parts = [[G.box(2.44, 2.5, 6.0), colr, M4(0, 1.27, 0)], ...[...Array(11).keys()].map((i) => [G.box(2.5, 2.42, 0.07), colr, M4(0, 1.27, -2.7 + i * 0.54)]), [G.box(2.3, 2.35, 0.08), 0x3f3e38, M4(0, 1.27, 3.02)], [G.box(0.05, 2.3, 0.1), 0x2a2a26, M4(0, 1.27, 3.07)], ...[-0.6, 0.6].map((dx) => [G.box(0.04, 2.3, 0.04), 0x8a8a80, M4(dx, 1.27, 3.1)])];
    const m = new THREE.Mesh(build(parts), MAT.vc); m.position.set(x, groundAt(x, z), z); m.rotation.y = rot; scene.add(SH(onLayer1(m)));
    addCollider(x, z, 1.3, 3.1, rot, groundAt(x, z) + 2.6); coverBox(x, z, 1.3, 3.1, rot, 2.6); const c = Math.cos(rot), s = Math.sin(rot), L = (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c]; BUNKERS.push([L(-1.22, -3), L(1.22, -3), L(1.22, 3), L(-1.22, 3)]);
  }
}
function buildHuts() {
  for (const [label, x, z, w, d, rot, wall, roof] of HUTS) {
    const g0 = groundAt(x, z), h = w < 3 ? 3.0 : 3.3; const m = new THREE.Mesh(hutGeo(w, d, h, wall, roof, 0x6b6c66), MAT.vc); m.position.set(x, g0, z); m.rotation.y = rot; scene.add(SH(onLayer1(m)));
    const c = Math.cos(rot), s = Math.sin(rot), L = (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
    const [sx, sz] = L(-w * 0.2, d / 2 + 0.07); sign(label, 'plain', sx, g0 + 0.32 + h * 0.62 + 0.72, sz, rot, Math.min(1.3, w * 0.4));
    addCollider(x, z, w / 2 + 0.35, d / 2 + 0.35, rot, g0 + 3.8); coverBox(x, z, w / 2 + 0.35, d / 2 + 0.35, rot, 2.8); BUNKERS.push([L(-w / 2, -d / 2), L(w / 2, -d / 2), L(w / 2, d / 2), L(-w / 2, d / 2)]);
    if (w > 3) { bagWall([L(-w / 2 - 0.5, -d / 2 + 0.3), L(-w / 2 - 0.5, d / 2 - 0.3)], 4); bagWall([L(w / 2 + 0.5, -d / 2 + 0.3), L(w / 2 + 0.5, d / 2 - 0.3)], 4); }
  }
}

/* ================= combat trenches (dug into the ramparts, lined with planks) ================= */
function pointAlong(a, b, dist) { const L = Math.hypot(b[0] - a[0], b[1] - a[1]); const t = Math.min(1, dist / L); return [lerp(a[0], b[0], t), lerp(a[1], b[1], t)]; }
TRENCH_LINES = (() => {
  const inr = outwardRing(MAOZ, 3.2, true), G1 = 5.5, west = [];
  for (let z = -76; z <= 72; z += 6) west.push([crestX(z) + 3.6, z]);
  const mk = (pts, perimeter) => ({ pts, perimeter, bb: bbox(pts) });
  const zc = -8, cx = crestX(zc) + 3.6;
  return [
    mk([pointAlong(inr[1], inr[0], G1), inr[0], ...west, inr[7], pointAlong(inr[6], inr[7], G1)], true),
    mk([pointAlong(inr[1], inr[2], G1), inr[2]], true),
    mk([pointAlong(inr[6], inr[5], G1), inr[5]], true),
    mk([[cx + 0.8, zc], [-58, -7], [-47, -6]], false),
  ];
})();
const TRENCH_CENTER = [-8, 0];
function onTrench(x, z) { let d = 99; for (const t of TRENCH_LINES) d = Math.min(d, distPolyline(x, z, t.pts)); return d; }
/* the main perimeter trench as an indexed path (1 m steps): gate north → west rampart → gate south */
const TR = (() => {
  const pts = densify(TRENCH_LINES[0].pts, 1.0), s = [0];
  for (let i = 1; i < pts.length; i++) s.push(s[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const n = pts.map((p, i) => { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)]; const dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz) || 1; return [dz / l, -dx / l]; });
  const out = pts.map((p, i) => { const [nx, nz] = n[i]; return Math.hypot(p[0] + nx * 3 - TRENCH_CENTER[0], p[1] + nz * 3 - TRENCH_CENTER[1]) > Math.hypot(p[0] - nx * 3 - TRENCH_CENTER[0], p[1] - nz * 3 - TRENCH_CENTER[1]) ? [nx, nz] : [-nx, -nz]; });
  return { pts, s, n, out, pK: 0, pD: 0 };
})();
function trK(x, z) { let best = 0, bd = 1e9; for (let i = 0; i < TR.pts.length; i++) { const d = Math.hypot(TR.pts[i][0] - x, TR.pts[i][1] - z); if (d < bd) { bd = d; best = i; } } return [best, bd]; }
const kz = (z) => trK(crestX(z) + 3.6, z)[0];
/* the three recoilless-gun bays of survival mode: on the perimeter like the MG posts, one per side, each 2.5 m out from the trench's centre line, facing out */
/* survival is fought in the "small strongpoint": the middle hundred metres of the western rampart, closed at both ends by barricades (SURV_BARR_K).
   All three guns stand on that stretch: one at its northern end swung toward the shore the northern attack comes down, one in the middle facing the canal, one at the southern end swung the other way */
const GUN_SPOTS = (() => {
  const at = (x, z, b) => { const [k] = trK(x, z), p = TR.pts[k], o = TR.out[k]; return [p[0] + o[0] * 2.5, p[1] + o[1] * 2.5, b ?? (THREE.MathUtils.radToDeg(Math.atan2(o[0], -o[1])) + 360) % 360]; };
  return [['G1', 'תותח ללא רתע · צפון', ...at(crestX(-38.5) + 3.6, -38.5, 338)], ['G2', 'תותח ללא רתע · מרכז', ...at(crestX(23) + 3.6, 23)], ['G3', 'תותח ללא רתע · דרום', ...at(crestX(40) + 3.6, 40, 206)]];   // the north and south guns face up and down the shore, the middle one the canal
})();
const TRAV = [];
/* dugouts cut into the inner wall of the trench: the aid station, the command post, the ammunition store and the quarters.
   Every one opens straight off the trench, so the whole stronghold is one dug-in system */
const DUGOUTS = [[191, 'aid', 'תאג״ד'], [129, 'cmd', 'חמ״ל'], [100, 'ammo', 'תחמושת'], [216, 'quarters', 'מגורים']].map(([k, id, label]) => {
  const p = TR.pts[k], o = TR.out[k], i = [-o[0], -o[1]], a = TR.pts[k - 2], b = TR.pts[k + 2], l = Math.hypot(b[0] - a[0], b[1] - a[1]), t = [(b[0] - a[0]) / l, (b[1] - a[1]) / l];
  const at = (u, v) => [p[0] + t[0] * u + i[0] * v, p[1] + t[1] * u + i[1] * v]; const [x, z] = at(0, 1.25 + 2.9);
  return { k, id, label, p, t, i, at, x, z, fl: null };
});
DUGS = DUGOUTS;
const dugUV = (d, x, z) => { const dx = x - d.p[0], dz = z - d.p[1]; return [dx * d.t[0] + dz * d.t[1], dx * d.i[0] + dz * d.i[1]]; };
function dugCutL(d) { if (d.cutL === undefined) { DUG_ON = false; d.cutL = terrainAt0(d.p[0], d.p[1]) - 0.25; DUG_ON = true; } return d.cutL; }
// the floor of a dugout is the floor of the trench at its door, as the player walks it (read from the built terrain)
function dugFloor(d) { if (d.fl === null) { const [x, z] = d.at(0, 0.35); d.fl = Math.max(groundAt(x, z), dugCutL(d) + 0.3); } return d.fl; }
function inDugout(x, z, pad = 0) { for (const d of DUGOUTS) { if (Math.abs(x - d.p[0]) > 9 || Math.abs(z - d.p[1]) > 9) continue; const [u, v] = dugUV(d, x, z); if (Math.abs(u) < 2.3 + pad && v > 1.35 - pad && v < 5.85 + pad) return d; } return null; }
function dugCut(x, z, h) {
  for (const d of DUGOUTS) { if (Math.abs(x - d.p[0]) > 10 || Math.abs(z - d.p[1]) > 10) continue; const [u, v] = dugUV(d, x, z); if (Math.abs(u) < 3.9 && v > 1.6 && v < 7.4) return Math.min(h, dugCutL(d)); }
  return h;
}
function sandbagWallTex() {
  const W = 512, H = 256, c = canvas(W, H), g = c.getContext('2d'), r = rng(733);
  g.fillStyle = '#2e281f'; g.fillRect(0, 0, W, H);
  const rows = 6, rh = H / rows, bl = W / 4;
  const pill = (x, y, w, h, rad) => { g.beginPath(); g.moveTo(x + rad, y); g.lineTo(x + w - rad, y); g.quadraticCurveTo(x + w, y, x + w, y + rad); g.lineTo(x + w, y + h - rad); g.quadraticCurveTo(x + w, y + h, x + w - rad, y + h); g.lineTo(x + rad, y + h); g.quadraticCurveTo(x, y + h, x, y + h - rad); g.lineTo(x, y + rad); g.quadraticCurveTo(x, y, x + rad, y); g.closePath(); };
  for (let row = 0; row < rows; row++) for (let k = -1; k <= 4; k++) {
    const x0 = k * bl + (row % 2 ? bl / 2 : 0) + 3 + (r() - 0.5) * 6, y0 = row * rh + 2 + (r() - 0.5) * 3, w = bl - 5, h = rh - 3, tone = 118 + r() * 40;
    const gr = g.createLinearGradient(0, y0, 0, y0 + h); gr.addColorStop(0, `rgb(${tone + 46},${tone + 30},${tone - 4})`); gr.addColorStop(0.35, `rgb(${tone + 20},${tone + 6},${tone - 28})`); gr.addColorStop(1, `rgb(${tone - 56},${tone - 64},${tone - 78})`);
    g.fillStyle = gr; pill(x0, y0, w, h, h * 0.42); g.fill();
    const sg = g.createLinearGradient(x0, 0, x0 + w, 0); sg.addColorStop(0, 'rgba(0,0,0,0.35)'); sg.addColorStop(0.12, 'rgba(0,0,0,0)'); sg.addColorStop(0.88, 'rgba(0,0,0,0)'); sg.addColorStop(1, 'rgba(0,0,0,0.35)'); g.fillStyle = sg; pill(x0, y0, w, h, h * 0.42); g.fill();
    g.strokeStyle = 'rgba(40,32,22,0.5)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x0 + w * 0.08, y0 + h * 0.25); g.lineTo(x0 + w * 0.14, y0 + h * 0.75); g.stroke();
  }
  g.globalAlpha = 0.09; g.strokeStyle = '#1e160c'; g.lineWidth = 1; for (let x = 0; x < W; x += 3) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); } for (let y = 0; y < H; y += 3) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); } g.globalAlpha = 1;
  for (let i = 0; i < 9000; i++) { g.fillStyle = r() < 0.5 ? 'rgba(30,24,16,0.2)' : 'rgba(255,240,205,0.1)'; g.fillRect(r() * W, r() * H, 1 + r() * 2, 1); }
  const t = tex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
const TW = 1.25;   // half width of the trench floor (wall face to the centre line)
const ROOFS = [], BARRS = [], AIDPOST = { x: 0, z: 0, rot: 0 };
const ROOF_K = [], BARR_K = [95, 135, 177, 223, 251];
let SURV_BARR_K = [];   // the two barricades that close the small strongpoint of survival mode, filled in once the trench path exists
function bagMesh(list, wall = false) { return bagInst(list, rng(list.length * 7 + 3), wall ? 0.04 : 0.12, wall); }
function buildTrenches() {
  SURV_BARR_K = [kz(-49), kz(49)];
  const bt = sandbagWallTex(); MAT.bagWall = new THREE.MeshStandardMaterial({ map: bt, bumpMap: bumpOf(bt), bumpScale: 3, roughness: 1, side: THREE.DoubleSide });
  const pos = [], uv = [], idx = [], slats = [], mm = new THREE.Matrix4(), q = new THREE.Quaternion(), up = V3(0, 1, 0);
  const epos = [], euv = [], eidx = [], posts = [];   // the earth of the top and the outer slope; the posts that hold the planks
  const J = TRENCH_LINES[3].pts[0];
  const nearPost = (x, z, r) => POST_SPOTS.some(([px, pz]) => Math.hypot(px - x, pz - z) < r);
  ROOF_K.push(58, kz(-33), kz(-1.5), kz(17), kz(40));
  const dugDoor = (x, z) => DUGOUTS.some((d) => Math.hypot(x - d.p[0], z - d.p[1]) < 0.75);
  const isExit = (line, outer, s, len, x, z, inner = false) => s < 1.2 || s > len - 1.2 || (outer ? nearPost(x, z, 3.3) : line.perimeter && Math.hypot(x - J[0], z - J[1]) < 1.9) || (inner && dugDoor(x, z));
  const equad = (a, b, c, d, u0, u1, v0, v1, v2, v3) => { const base = epos.length / 3; epos.push(...a, ...b, ...c, ...d); euv.push(u0, v0, u1, v1, u0, v2, u1, v3); eidx.push(base, base + 1, base + 2, base + 1, base + 3, base + 2); };
  const quad = (a, b, c, d, u0, u1, v0, v1, v2, v3) => { const base = pos.length / 3; pos.push(...a, ...b, ...c, ...d); uv.push(u0, v0, u1, v1, u0, v2, u1, v3); idx.push(base, base + 1, base + 2, base + 1, base + 3, base + 2); };
  for (const line of TRENCH_LINES) {
    const pts = densify(line.pts, 0.9); const S = [0]; for (let i = 1; i < pts.length; i++) S.push(S[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); const len = S[S.length - 1];
    const N = pts.map((p, i) => { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)]; const dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz) || 1; return [dz / l, -dx / l]; });
    const mid = pts[Math.floor(pts.length / 2)], nm = N[Math.floor(pts.length / 2)];
    const outSd = Math.hypot(mid[0] + nm[0] * 3 - TRENCH_CENTER[0], mid[1] + nm[1] * 3 - TRENCH_CENTER[1]) > Math.hypot(mid[0] - nm[0] * 3 - TRENCH_CENTER[0], mid[1] - nm[1] * 3 - TRENCH_CENTER[1]) ? 1 : -1;
    for (const sd of [-1, 1]) {
      const outer = line.perimeter && sd === outSd;
      /* a solid revetment: a wall of planks held by posts, a 0.75 m wide top of earth with one layer of sandbags along it, an outer face down into the ground */
      const V = pts.map((p, i) => {
        const [nx, nz] = N[i], fl = groundAt(p[0], p[1]), o = (d) => [p[0] + nx * sd * d, p[1] + nz * sd * d];
        const [ax, az] = o(TW), [tx, tz] = o(TW + 0.18), [cx, cz] = o(TW + 0.95), [ex, ez] = o(TW + 1.15);
        const top = Math.max(fl + 1.12, groundAt(ax, az) + trenchCut(ax, az) + 0.12) + (outer ? 0.22 : 0);
        return { ax, az, tx, tz, cx, cz, ex, ez, fl, top, low: groundAt(ex, ez) - 0.12 };
      });
      for (let i = 0; i < pts.length - 1; i++) {
        const m = [(pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2]; if (isExit(line, outer, (S[i] + S[i + 1]) / 2, len, m[0], m[1], line.perimeter && sd !== outSd)) continue;
        const a = V[i], b = V[i + 1], u0 = S[i] / 2.4, u1 = S[i + 1] / 2.4;
        quad([a.ax, a.fl - 0.12, a.az], [b.ax, b.fl - 0.12, b.az], [a.tx, a.top, a.tz], [b.tx, b.top, b.tz], u0, u1, 0, 0, (a.top - a.fl + 0.12) / 1.28, (b.top - b.fl + 0.12) / 1.28);
        equad([a.tx, a.top, a.tz], [b.tx, b.top, b.tz], [a.cx, a.top - 0.05, a.cz], [b.cx, b.top - 0.05, b.cz], u0, u1, 0, 0, 0.32, 0.32);
        equad([a.cx, a.top - 0.05, a.cz], [b.cx, b.top - 0.05, b.cz], [a.ex, a.low, a.ez], [b.ex, b.low, b.ez], u0, u1, 0, 0, (a.top - a.low) / 2.4, (b.top - b.low) / 2.4);
        // a post every 2.4 m, standing against the planks
        if (Math.floor(S[i] / 2.4) !== Math.floor(S[i + 1] / 2.4)) posts.push([a.ax + N[i][0] * sd * 0.06, (a.fl - 0.12 + a.top) / 2 + 0.02, a.az + N[i][1] * sd * 0.06, Math.atan2(-(b.az - a.az), b.ax - a.ax), 0.13, a.top - a.fl + 0.16, 0.11]);
        const cx = (a.ax + b.ax) / 2 + N[i][0] * sd * 0.2, cz = (a.az + b.az) / 2 + N[i][1] * sd * 0.2, L = Math.hypot(b.ax - a.ax, b.az - a.az);
        if (!(line.perimeter && sd !== outSd && DUGOUTS.some((d) => Math.hypot(m[0] - d.p[0], m[1] - d.p[1]) < 1.35))) addCollider(cx, cz, L / 2 + 0.05, 0.2, Math.atan2(-(b.az - a.az), b.ax - a.ax), Math.max(a.top, b.top) + 0.25);
      }
      const bags = densify(line.pts, 0.56); let s0 = 0;
      bags.forEach((p, i) => {
        if (i) s0 += Math.hypot(p[0] - bags[i - 1][0], p[1] - bags[i - 1][1]); if (i === bags.length - 1) return;
        const b2 = bags[i + 1], dx = b2[0] - p[0], dz = b2[1] - p[1], l = Math.hypot(dx, dz) || 1, nx = dz / l, nz = -dx / l, rot = Math.atan2(-dz, dx);
        const mx = (p[0] + b2[0]) / 2, mz = (p[1] + b2[1]) / 2; if (isExit(line, outer, s0, len, mx, mz, line.perimeter && sd !== outSd)) return;
        const ax = mx + nx * sd * TW, az = mz + nz * sd * TW, top = Math.max(groundAt(mx, mz) + 1.12, groundAt(ax, az) + trenchCut(ax, az) + 0.12) + (outer ? 0.22 : 0);
        for (const [off, lays] of [[0.42, 1], [0.8, 1]]) for (let lay = 0; lay < lays; lay++) { const st = (lay % 2 ? 0.14 : -0.14) + (off > 0.5 ? 0.28 : 0); BATCH.bag.push([mx + nx * sd * (TW + off) + st * dx / l, top + 0.06 + lay * 0.19, mz + nz * sd * (TW + off) + st * dz / l, rot]); }
      });
    }
    const dk = densify(line.pts, 0.75); dk.forEach((p, i) => { if (i === dk.length - 1) return; const b = dk[i + 1]; slats.push([p[0], groundAt(p[0], p[1]) + 0.04, p[1], Math.atan2(-(b[1] - p[1]), b[0] - p[0]) + Math.PI / 2]); });
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
  // the planks: the Plank Fence pack's boards (2.4 m to a repeat, 1.28 m high) where its texture is there, else the farm's painted boards
  const pk = !!MDL_TEX['props/plank/map'], plk = new THREE.MeshStandardMaterial({ map: pk ? mdlTex('props/plank/map') : plankTex(), roughness: 0.95, side: THREE.DoubleSide });
  if (pk && !LITE) { plk.normalMap = mdlTex('props/plank/nmap', false); plk.normalScale.set(0.9, 0.9); }
  scene.add(SH(onLayer1(new THREE.Mesh(g, plk))));
  { const e = new THREE.BufferGeometry(); e.setAttribute('position', new THREE.Float32BufferAttribute(epos, 3)); e.setAttribute('uv', new THREE.Float32BufferAttribute(euv, 2)); e.setIndex(eidx); e.computeVertexNormals(); scene.add(SH(onLayer1(new THREE.Mesh(e, MAT.sand)))); }
  if (posts.length) { const pm = new THREE.InstancedMesh(GEO.box, MAT.wood, posts.length); posts.forEach(([x, y, z, r, sx, sy, sz], i) => pm.setMatrixAt(i, mm.compose(V3(x, y, z), q.setFromAxisAngle(up, r), V3(sx, sy, sz)))); scene.add(SH(onLayer1(pm))); }
  const sm = new THREE.InstancedMesh(new THREE.BoxGeometry(1.5, 0.05, 0.22), MAT.wood, slats.length);
  slats.forEach(([x, y, z, r], i) => sm.setMatrixAt(i, mm.compose(V3(x, y, z), q.setFromAxisAngle(up, r), V3(1, 1, 1))));
  scene.add(SH(onLayer1(sm), false, true));
  const box = (list, mat) => { if (!list.length) return; const m = new THREE.InstancedMesh(GEO.box, mat, list.length); list.forEach(([x, y, z, r, sx, sy, sz], i) => m.setMatrixAt(i, mm.compose(V3(x, y, z), q.setFromAxisAngle(up, r), V3(sx, sy, sz)))); scene.add(SH(onLayer1(m))); };
  const frame = (k) => { const p = TR.pts[k], [nx, nz] = TR.n[k]; return { p, nx, nz, tx: -nz, tz: nx, fl: groundAt(p[0], p[1]), rot: Math.atan2(nx, -nz) }; };
  /* covered sections: heavy timber and corrugated iron on raised sandbag walls, sandbags on top. Shelter from the air */
  const wood = [], iron = [];
  for (const k of ROOF_K) {
    const { p, nx, nz, tx, tz, fl } = frame(k), rot = Math.atan2(-tz, tx), W2 = TW + 0.75;
    /* the raised walls of bags stand on the earth top, clear of the planks: the plank face leans back as it rises (TW at the floor, TW + 0.18 at
       its top), so a bag only 0.3 m out had its belly through the boards - a thin pointed sliver of it showing. Where the trench is deeper than
       a layer, that layer is in the earth behind the planks and is not laid at all */
    for (const sd of [-1, 1]) for (let lay = 0; lay < 5; lay++) for (let a = -1.6; a <= 1.61; a += 0.53) { const o = a + (lay % 2 ? 0.26 : 0); if (Math.abs(o) > 1.75) continue;
      const y = fl + 1.12 + lay * 0.17, ax = p[0] + tx * o + nx * sd * TW, az = p[1] + tz * o + nz * sd * TW; if (y + 0.1 < Math.max(fl + 1.12, groundAt(ax, az) + trenchCut(ax, az) + 0.12)) continue;
      BATCH.bag.push([p[0] + tx * o + nx * sd * (TW + 0.44), y, p[1] + tz * o + nz * sd * (TW + 0.44), rot]); }
    for (let a = -1.65; a <= 1.66; a += 0.33) wood.push([p[0] + tx * a, fl + 2.02, p[1] + tz * a, rot, 0.26, 0.2, W2 * 2]);
    for (const a of [-1.85, 1.85]) wood.push([p[0] + tx * a, fl + 1.98, p[1] + tz * a, rot, 0.3, 0.34, W2 * 2 + 0.3]);
    iron.push([p[0], fl + 2.15, p[1], rot, 3.9, 0.05, W2 * 2 + 0.2]);
    for (let lay = 0; lay < 2; lay++) for (let b = -W2 + 0.3; b <= W2 - 0.29; b += 0.4) for (let a = -1.55; a <= 1.56; a += 0.62) BATCH.bag.push([p[0] + tx * (a + (lay ? 0.3 : 0)) + nx * b, fl + 2.27 + lay * 0.18, p[1] + tz * (a + (lay ? 0.3 : 0)) + nz * b, rot]);
    ROOFS.push({ x: p[0], z: p[1], tx, tz, k });
  }
  box(wood, MAT.wood); box(iron, MAT.rust);
  /* sandbag traverses inside the trench: the trench is fought from traverse to traverse */
  const kJ = trK(J[0], J[1])[0]; let lastT = -99, alt = 1;
  for (let k = 6; k < TR.pts.length - 6; k++) {
    const p = TR.pts[k]; if (k - lastT < 8 || ROOF_K.some((r) => Math.abs(r - k) < 4) || [...BARR_K, ...SURV_BARR_K].some((r) => Math.abs(r - k) < 3) || DUGOUTS.some((d) => Math.abs(d.k - k) < 5) || Math.abs(k - kJ) < 4) continue;
    lastT = k; alt = -alt; const inner = -Math.sign(TR.n[k][0] * TR.out[k][0] + TR.n[k][1] * TR.out[k][1]), side = nearPost(p[0], p[1], 4.6) ? inner : alt;
    const { nx, nz, tx, tz, fl } = frame(k), rot = Math.atan2(-tz, tx);
    for (let lay = 0; lay < 6; lay++) for (const a of [-0.2, 0.2]) for (const b of [0.6, 0.92, 1.2]) { const o = a + (lay % 2 ? 0.08 : -0.08); BATCH.bag.push([p[0] + tx * o + nx * side * b, fl + 0.1 + lay * 0.19, p[1] + tz * o + nz * side * b, rot]); }
    addCollider(p[0] + nx * side * 0.88, p[1] + nz * side * 0.88, 0.42, 0.45, rot, fl + 1.2);
    for (const dir of [1, -1]) { const qq = TR.pts[k - dir]; const node = { k: k - dir, dir, x: qq[0] + nx * side * 0.85, z: qq[1] + nz * side * 0.85, px: qq[0] - nx * side * 0.35, pz: qq[1] - nz * side * 0.35, lx: -nx * side * 0.4, lz: -nz * side * 0.4, nx: tx * dir, nz: tz * dir, h: 1.15, by: null }; TRAV.push(node); COVER.push(node); }
  }
  /* kit along the walls: ammunition, jerrycans, crates, loose sandbags, helmets, blankets, shovels; a telephone line on the inner wall */
  { const rr = rng(4711), ammo = [], helm = [], roll = [], tool = [], cable = [];
    const kitOK = (k) => !TRAV.some((c) => Math.abs(c.k + c.dir - k) < 3) && ![...BARR_K, ...SURV_BARR_K].some((b) => Math.abs(b - k) < 3) && !DUGOUTS.some((d) => Math.abs(d.k - k) < 4) && !nearPost(TR.pts[k][0], TR.pts[k][1], 3.4);
    for (let k = 3; k < TR.pts.length - 3; k += 3 + Math.floor(rr() * 4)) {
      if (!kitOK(k)) continue; const { p, nx, nz, tx, tz, fl } = frame(k), sd = rr() < 0.5 ? 1 : -1, o = TW - 0.28, x = p[0] + nx * sd * o, z = p[1] + nz * sd * o, rot = Math.atan2(-tz, tx), pick = rr();
      if (pick < 0.3) { for (let i = 0; i < 1 + Math.floor(rr() * 3); i++) ammo.push([x + tx * (i * 0.34 - 0.3), fl + (i === 2 ? 0.25 : 0), z + tz * (i * 0.34 - 0.3), rot + (rr() - 0.5) * 0.3]); }
      else if (pick < 0.45) propPile('jerry', x - tx * 0.3, z - tz * 0.3, 2 + Math.floor(rr() * 2), 0.25);
      else if (pick < 0.58) propPile('crate', x - tx * 0.4, z - tz * 0.4, 1 + Math.floor(rr() * 2), 0.5, 2);
      else if (pick < 0.72) { for (let i = 0; i < 4; i++) BATCH.bag.push([x + tx * (rr() - 0.5) * 0.9, fl + 0.07 + (i > 2 ? 0.17 : 0), z + tz * (rr() - 0.5) * 0.9, rot + (rr() - 0.5) * 0.8]); }
      else if (pick < 0.84) { helm.push([x + tx * 0.2, fl + 0.07, z + tz * 0.2, rr() * 6]); roll.push([x - tx * 0.3, fl + 0.1, z - tz * 0.3, rot]); }
      else tool.push([x, fl + 0.55, z, rot, sd * nx, sd * nz]);
    }
    for (let k = 0; k < TR.pts.length; k += 2) { const p = TR.pts[k], [nx, nz] = TR.n[k], s = -Math.sign(nx * TR.out[k][0] + nz * TR.out[k][1]) || 1, fl = groundAt(p[0], p[1]); cable.push(V3(p[0] + nx * s * (TW - 0.05), fl + 1.02 - (k % 4 ? 0.07 : 0), p[1] + nz * s * (TW - 0.05))); }
    const inst = (geo, mat, list, f) => { if (!list.length) return; const m = new THREE.InstancedMesh(geo, mat, list.length); list.forEach((it, i) => m.setMatrixAt(i, f(it))); scene.add(SH(onLayer1(m))); };
    inst(AMMOBOX_GEO, MAT.vc, ammo, ([x, y, z, r]) => mm.compose(V3(x, y, z), q.setFromAxisAngle(up, r), V3(1, 1, 1)));
    inst(new THREE.SphereGeometry(0.135, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), new THREE.MeshStandardMaterial({ color: 0x4d5436, roughness: 0.75 }), helm, ([x, y, z, r]) => mm.compose(V3(x, y - 0.06, z), q.setFromAxisAngle(up, r), V3(1, 0.95, 1.1)));
    inst(new THREE.CylinderGeometry(0.1, 0.1, 0.7, 12).rotateZ(Math.PI / 2), MAT.canvasOD, roll, ([x, y, z, r]) => mm.compose(V3(x, y, z), q.setFromAxisAngle(up, r), V3(1, 1, 1)));
    inst(new THREE.BoxGeometry(0.04, 1.05, 0.04), MAT.wood, tool, ([x, y, z, r, ax, az]) => mm.compose(V3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(az * 0.25, r, -ax * 0.25)), V3(1, 1, 1)));
    for (let i = 0; i + 1 < cable.length; i += 40) { const seg = cable.slice(i, i + 41); if (seg.length < 2) continue; scene.add(onLayer1(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(seg), seg.length * 2, 0.009, 4), MAT.dark))); }
  }
  /* barricades that close the trench at the ends of each stage; they open as the fight moves on */
  const barricade = (id, x, z, nx, nz, fl) => {
    const tx = -nz, tz = nx, rot = Math.atan2(nx, -nz) + Math.PI / 2, list = [];
    for (let lay = 0; lay < 7; lay++) for (const a of [-0.2, 0.2]) for (let b = -1.25; b <= 1.26; b += 0.5) { const o = b + (lay % 2 ? 0.25 : 0); if (Math.abs(o) > 1.4) continue; list.push([x + nx * o + tx * a, fl + 0.1 + lay * 0.19, z + nz * o + tz * a, Math.atan2(-nz, nx)]); }
    const grp = new THREE.Group(); grp.add(bagMesh(list, true));
    for (const s of [-1, 1]) { const sg = sign('אין מעבר', 'plain', x + tx * s * 0.38, fl + 1.0, z + tz * s * 0.38, Math.atan2(tx * s, tz * s), 0.9); scene.remove(sg); grp.add(sg); }
    scene.add(grp); const col = addCollider(x, z, 0.35, TW + 0.4, Math.atan2(-tz, tx), fl + 1.4);
    BARRS.push({ id, x, z, g: grp, col, top: fl + 1.4, on: true });
  };
  for (const k of BARR_K) { const { p, nx, nz, fl } = frame(k); barricade(k, p[0], p[1], nx, nz, fl); }
  // the small strongpoint of survival: barricades at the two ends of the central stretch of the west trench, closed only in that mode
  for (const [id, k] of [['SN', SURV_BARR_K[0]], ['SS', SURV_BARR_K[1]]]) { const { p, nx, nz, fl } = frame(k); barricade(id, p[0], p[1], nx, nz, fl); const B = BARRS[BARRS.length - 1]; B.surv = true; B.on = false; B.g.visible = false; B.col.top = -1e4; }
  { const cp = densify(TRENCH_LINES[3].pts, 1); const i = 4, a = cp[i - 1], b = cp[i + 1], dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz); barricade('CJ', cp[i][0], cp[i][1], dz / l, -dx / l, groundAt(cp[i][0], cp[i][1])); }
  /* permanent end caps and the forward aid post at the end of the communication trench */
  /* the trench's own ends (by the gates, and the end of the communication trench): a proper wall of bags across it, wall to wall - two bags
     thick, laid like bricks (each layer half a bag along from the one under it), seven layers to above a man's chest, square and tight */
  const cap = (p, a) => { const dx = p[0] - a[0], dz = p[1] - a[1], l = Math.hypot(dx, dz), nx = dz / l, nz = -dx / l, tx = dx / l, tz = dz / l, y0 = groundAt(p[0], p[1]), list = [];
    for (let lay = 0; lay < 7; lay++) for (const t of [-0.2, 0.2]) for (let b = -1.5; b <= 1.51; b += 0.55) { const o = b + (lay % 2 ? 0.275 : 0); if (Math.abs(o) > 1.6) continue; list.push([p[0] + nx * o + tx * t, y0 + 0.1 + lay * 0.19, p[1] + nz * o + tz * t, Math.atan2(-nz, nx)]); }
    scene.add(bagMesh(list, true)); addCollider(p[0], p[1], 1.75, 0.42, Math.atan2(-nz, nx), y0 + 1.45); };
  cap(TR.pts[0], TR.pts[2]); cap(TR.pts[TR.pts.length - 1], TR.pts[TR.pts.length - 3]);
  { const cp = densify(TRENCH_LINES[3].pts, 1), e = cp[cp.length - 1], e2 = cp[cp.length - 3]; cap(e, e2); const a = cp[cp.length - 4], dx = e[0] - a[0], dz = e[1] - a[1], l = Math.hypot(dx, dz);
    Object.assign(AIDPOST, { x: a[0], z: a[1], rot: Math.atan2(dx, dz) }); const fl = groundAt(e[0], e[1]);
    const sg = sign('נקודת פינוי', 'aid', e[0] - dx / l * 0.45, fl + 1.25, e[1] - dz / l * 0.45, Math.atan2(-dx, -dz), 1.3);
    propPile('crate', a[0] + dz / l * 0.9, a[1] - dx / l * 0.9, 2, 0.6, 2); propPile('jerry', e[0] - dz / l * 0.9 - dx / l, e[1] + dx / l * 0.9 - dz / l, 3, 0.25); }
}
/* the dugouts: timber-lined rooms under a mound of earth and sandbags, with the kit of each one inside */
const DUG_UNITS = [];
function mapTex() {
  const c = canvas(256, 192), g = c.getContext('2d'), r = rng(19); g.fillStyle = '#e6dcc0'; g.fillRect(0, 0, 256, 192);
  g.strokeStyle = 'rgba(80,110,140,.35)'; g.lineWidth = 1; for (let x = 0; x < 256; x += 16) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 192); g.stroke(); } for (let y = 0; y < 192; y += 16) { g.beginPath(); g.moveTo(0, y); g.lineTo(256, y); g.stroke(); }
  g.fillStyle = '#7fa6c4'; g.beginPath(); g.moveTo(90, 0); g.bezierCurveTo(100, 60, 80, 120, 70, 192); g.lineTo(100, 192); g.bezierCurveTo(110, 120, 128, 60, 118, 0); g.fill();
  g.strokeStyle = '#2a4a8a'; g.lineWidth = 3; g.beginPath(); g.arc(150, 110, 22, 0, 6.28); g.stroke();
  g.strokeStyle = '#b02a22'; g.lineWidth = 3; for (let i = 0; i < 5; i++) { const y = 30 + i * 30; g.beginPath(); g.moveTo(40, y); g.lineTo(72, y + 6); g.stroke(); g.beginPath(); g.moveTo(66, y + 1); g.lineTo(73, y + 6); g.lineTo(65, y + 10); g.stroke(); }
  g.fillStyle = '#222'; g.font = 'bold 13px Arial'; g.direction = 'rtl'; g.textAlign = 'center'; g.fillText('מזח', 150, 114); for (let i = 0; i < 30; i++) { g.fillStyle = 'rgba(60,50,40,.5)'; g.fillRect(r() * 256, r() * 192, 2, 2); }
  return tex(c);
}
/* what the men keep in the dugouts: the signaller's sets and maps, the medic's bottles and blankets, the quartermaster's tins, the bunks with
   their boots under them, a backgammon board on the table. All of it small, all of it loose, all of it flies when a round hits it. */
function dugProps(d, fl, V, rotT, tv, zv, sg, r) {
  const at = (u, v) => d.at(u, v), P = (kind, u, y, v, rot = 0, floor = 0) => { const [x, z] = at(u, v); return propAdd('mezach', kind, x, fl + y, z, rotT + rot, fl + floor); };
  const On = (kinds, u, v, y, w, dd, seed, floor = 0) => { const [x, z] = at(u, v); return propsOn('mezach', kinds, x, z, fl + y, w, dd, rotT, seed, fl + floor); };
  const faceV = Math.atan2(-sg * zv.x, -sg * zv.z), faceU = Math.atan2(tv.x, tv.z);   // into the room from the back wall; from the -u wall
  const W = (kind, u, y, v, ry, seed, side) => { const [x, z] = at(u, v); return propWall('mezach', kind, x, fl + y, z, ry, seed, side); };
  if (d.id === 'cmd') {
    On(['papers', 'phone', 'lamp', 'binocs', 'cups', 'ashtray', 'maptube', 'cigs'], 0, V + 4.02, 0.82, 2.0, 0.8, 31);
    P('headset', 1.45, 0.9, V + 4.2, 0.4); P('radioBig', 1.9, 0, V + 3.3, Math.PI * 0.9); P('phone', 2.05, 0.52, V + 3.3, 0.3, 0.52);
    P('primus', -2.0, 0, V + 1.7); P('kettle', -2.0, 0.27, V + 1.7, 0.6); P('crateS', -1.35, 0, V + 1.65, 0.1); P('cups', -1.45, 0.33, V + 1.6, 0, 0); P('thermos', -1.2, 0.33, V + 1.75, 0, 0);
    P('jerry', -2.1, 0, V + 2.4, 0.2); P('jerry', -2.1, 0, V + 2.85, -0.1); P('pack', 2.1, 0, V + 1.7, 1.2); P('pack', 2.1, 0, V + 2.2, 0.9); P('helmet', 0.95, 0, V + 1.5, 0.4); P('helmet', -0.6, 0.45, V + 3.2, 1.0, 0);
    P('ammo', 1.8, 0, V + 2.65); P('ammo', 1.8, 0.22, V + 2.65, 0.1, 0); P('books', 0.5, 0.45, V + 3.2, 0.3, 0); P('canteen', 1.6, 0, V + 2.2);
    W('portrait', -1.7, 1.65, V + 4.57, faceV, 3, 'f'); W('clock', 1.6, 1.95, V + 4.57, faceV); W('calendar', 2.39, 1.55, V + 2.2, faceU + Math.PI, 1);
  } else if (d.id === 'aid') {
    for (const u0 of [-2.15, 0.25]) { P('pillow', u0 + 1.65, 0.56, V + 4.15, 0.3, 0); P('blanketF', u0 + 0.8, 0.56, V + 4.15, 0.1, 0); }
    P('bottles', 1.87, 0.42, V + 1.67, 0.3, 0); P('mess', 1.87, 0.42, V + 2.17, 0.2, 0); P('cups', 1.87, 0.42, V + 2.67, 0, 0); P('bottle', 1.75, 0.42, V + 2.5, 0, 0);
    P('crateS', 0.0, 0, V + 1.95, 0.2); P('bottle', -0.1, 0.33, V + 1.9, 0, 0); P('papers', 0.12, 0.33, V + 2.02, 0.4, 0); P('lamp', -0.15, 0.33, V + 2.08, 0, 0);
    P('bucket', -2.0, 0, V + 1.6); P('jerry', -2.1, 0, V + 2.25, 0.3); P('tin', -1.5, 0, V + 1.5, 0.2); P('helmet', -0.9, 0, V + 3.3, 0.8); P('helmet', 1.4, 0, V + 3.3, -0.5); P('boots', 0.4, 0, V + 3.55, 0.2); P('pack', 2.0, 0, V + 3.3, 1.4); P('canteen', -1.7, 0, V + 3.1);
    W('calendar', 2.39, 1.55, V + 2.6, faceU + Math.PI, 2); W('mirror', 2.39, 1.5, V + 1.7, faceU + Math.PI); W('clock', -1.0, 1.95, V + 4.57, faceV);
  } else if (d.id === 'ammo') {
    P('jerry', -1.0, 0, V + 1.6, 0.1); P('jerry', -0.6, 0, V + 1.65, -0.2); P('oilcan', 0.5, 0, V + 1.6); P('helmet', 0.2, 0, V + 2.5, 1.1); P('canteen', 0.9, 0, V + 2.3);
    P('ammo', 1.0, 0, V + 2.4, 0.2); P('ammo', 1.0, 0.22, V + 2.4, 0.3, 0); P('ammo', 1.0, 0.44, V + 2.4, 0.1, 0); P('sack', -1.8, 0, V + 3.3, 0.4); P('sack', -1.2, 0, V + 3.6, 1.3); P('lamp', -2.0, 0.3, V + 1.72, 0, 0); P('cans', -2.0, 0.3, V + 2.22, 0, 0);
    P('crateS', 0.3, 0, V + 3.4, 0.5); P('blanket', 0.3, 0.33, V + 3.4, 0.5, 0); P('tin', -0.4, 0, V + 3.9, 0.2);
    W('calendar', 2.39, 1.55, V + 3.0, faceU + Math.PI, 1);
  } else if (d.id === 'quarters') {
    for (const u0 of [-2.2, 0.3]) for (const [lvl, y] of [[0, 0.59], [1, 1.54]]) { P('pillow', u0 + 1.6, y, V + 4.12, 0.2, 0); if (lvl) P('blanket', u0 + 0.6, y, V + 4.3, 0.1, 0); else P('blanketF', u0 + 0.7, y, V + 4.1, 0.2, 0); if (!lvl) P('books', u0 + 1.1, y, V + 3.85, 0.5, 0); }
    for (const u0 of [-2.2, 0.3]) { P('boots', u0 + 0.5, 0, V + 3.45, 0.2); P('pack', u0 + 1.4, 0, V + 3.4, 2.4); P('helmet', u0 + 0.95, 0, V + 3.5, 0.7); }
    On(['backgammon', 'cups', 'ashtray', 'candle', 'cigs'], 1.85, V + 1.85, 0.72, 0.7, 0.7, 33); P('thermos', 2.1, 0.72, V + 2.1, 0, 0);
    P('books', -2.2, 1.6, V + 1.68, 0.1, 0); P('canteen', -2.2, 1.6, V + 2.05, 0, 0); P('frame', -2.2, 1.6, V + 2.45, 0.2, 0); P('lamp', -2.2, 1.6, V + 2.25, 0, 0);
    P('jerry', 0.0, 0, V + 1.5, 0.2); P('bucket', -1.0, 0, V + 1.5); P('tin', -1.5, 0, V + 1.55, 0.3); P('cards', 1.6, 0.72, V + 1.6, 0.4, 0); P('radio', -0.6, 0, V + 1.55, 2.5);
    W('calendar', 2.39, 1.6, V + 3.0, faceU + Math.PI, 2); W('mirror', -2.39, 1.6, V + 2.9, faceU); W('clock', 0.0, 2.0, V + 4.57, faceV); W('portrait', -1.0, 1.7, V + 1.34, faceV + Math.PI, 5, 'f');
  }
}
function buildDugouts() {
  const wood = [], dark = [], sandp = [], iron = [], glow = [], up = V3(0, 1, 0), V = TW;
  const woodC = [0x9a7448, 0xa47e50, 0x8c6a42, 0x84623c];
  for (const d of DUGOUTS) {
    const fl = dugFloor(d), tv = V3(d.t[0], 0, d.t[1]), zv = V3().crossVectors(tv, up), sg = zv.x * d.i[0] + zv.z * d.i[1] > 0 ? 1 : -1;
    const M = new THREE.Matrix4().makeBasis(tv, up, zv).setPosition(d.p[0], 0, d.p[1]), rotT = Math.atan2(-d.t[1], d.t[0]), r = rng(d.k);
    const geo = (g, u, y, v) => g.translate(u, y, sg * v).applyMatrix4(M);
    const box = (list, u0, u1, v0, v1, y0, y1, col) => list.push([geo(new THREE.BoxGeometry(Math.abs(u1 - u0), Math.abs(y1 - y0), Math.abs(v1 - v0)), (u0 + u1) / 2, fl + (y0 + y1) / 2, (v0 + v1) / 2), col]);
    const coll = (u0, u1, v0, v1, y0, y1) => { const [x, z] = d.at((u0 + u1) / 2, (v0 + v1) / 2); addCollider(x, z, Math.abs(u1 - u0) / 2, Math.abs(v1 - v0) / 2, rotT, fl + y1, fl + y0); };
    const wall = (u0, u1, v0, v1) => { const along = Math.abs(u1 - u0) > Math.abs(v1 - v0); const n = Math.max(1, Math.round((along ? Math.abs(u1 - u0) : Math.abs(v1 - v0)) / 0.3));
      for (let j = 0; j < n; j++) { const a = j / n, b = (j + 1) / n; if (along) box(wood, lerp(u0, u1, a) + 0.01, lerp(u0, u1, b) - 0.01, v0, v1, -0.05, 2.44, woodC[Math.floor(r() * 4)]); else box(wood, u0, u1, lerp(v0, v1, a) + 0.01, lerp(v0, v1, b) - 0.01, -0.05, 2.44, woodC[Math.floor(r() * 4)]); }
      coll(u0, u1, v0, v1, -0.6, 2.45); };
    // walls: the passage through the revetment, the room behind it
    wall(-0.84, -0.72, V - 0.1, V + 1.2); wall(0.72, 0.84, V - 0.1, V + 1.2);
    wall(-2.42, -0.72, V + 1.2, V + 1.32); wall(0.72, 2.42, V + 1.2, V + 1.32); wall(-2.42, 2.42, V + 4.6, V + 4.72); wall(-2.42, -2.3, V + 1.32, V + 4.6); wall(2.3, 2.42, V + 1.32, V + 4.6);
    for (const u of [-2.3, -0.75, 0.75, 2.3]) for (const v of [V + 1.32, V + 4.6]) box(dark, u - 0.08, u + 0.08, v - 0.08, v + 0.08, -0.05, 2.4, 0x4e3824);
    box(dark, -0.95, 0.95, V + 0.0, V + 0.22, 2.26, 2.46, 0x4e3824);
    // floor boards, ceiling beams and corrugated iron
    for (let u = -2.25; u < 2.25; u += 0.32) box(wood, u, u + 0.3, V + 1.3, V + 4.6, -0.03, 0.02, 0x86684a); box(wood, -0.7, 0.7, V - 0.05, V + 1.3, -0.03, 0.02, 0x86684a);
    for (let u = -2.2; u <= 2.21; u += 0.55) box(dark, u - 0.08, u + 0.08, V + 0.05, V + 4.72, 2.28, 2.42, 0x5a4028);
    box(iron, -2.5, 2.5, V + 0.0, V + 4.8, 2.42, 2.48, 0x6a5a48);
    // the mound of earth over it, covered in sandbags, with a sandbag face toward the trench
    DUG_ON = false; let tmax = -1e9, tmin = 1e9; for (let u = -4.4; u <= 4.4; u += 1.1) for (let v = V + 0.4; v <= V + 6.6; v += 1.1) { const [x, z] = d.at(u, v); const h = terrainAt0(x, z); tmax = Math.max(tmax, h); tmin = Math.min(tmin, h); } DUG_ON = true;
    const Y = Math.max(fl + 3.0, tmax + 0.2) - fl;
    { const c4 = [d.at(-2.42, V - 0.1), d.at(2.42, V - 0.1), d.at(-2.42, V + 4.72), d.at(2.42, V + 4.72)]; addFloor(Math.min(...c4.map((q) => q[0])), Math.max(...c4.map((q) => q[0])), Math.min(...c4.map((q) => q[1])), Math.max(...c4.map((q) => q[1])), fl); }
    { const yb = Math.min(Y - 2.6, tmin - fl - 0.8), back = (Y - yb) / 0.55 + 0.5, NU = 20, NV = 22, pos = [], col = [], idx = [], c = new THREE.Color(), rn = rng(d.k + 7);
      for (let b = 0; b <= NV; b++) for (let a = 0; a <= NU; a++) { const u = -5.2 + 10.4 * a / NU, v = V + 0.05 + (4.9 + back) * Math.pow(b / NV, 1.3);
        const eu = Math.max(0, Math.abs(u) - 2.75) / 2.3, ev = Math.max(0, v - (V + 4.95)) / back, e = Math.min(1, Math.hypot(eu, ev)), k = 1 - e * e * (3 - 2 * e);
        const y = yb + (Y - yb) * k + (k > 0.05 && k < 0.98 ? (rn() - 0.5) * 0.12 : 0); const q = V3(u, fl + y, sg * v).applyMatrix4(M); pos.push(q.x, q.y, q.z);
        c.setHex(0xcdb68c).lerp(new THREE.Color(0xb09a72), rn() * 0.5); col.push(c.r, c.g, c.b); }
      for (let b = 0; b < NV; b++) for (let a = 0; a < NU; a++) { const p0 = b * (NU + 1) + a, p1 = p0 + 1, p2 = p0 + NU + 1, p3 = p2 + 1; if (sg > 0) idx.push(p0, p2, p1, p1, p2, p3); else idx.push(p0, p1, p2, p1, p3, p2); }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setIndex(idx); g.computeVertexNormals();
      const uv = []; for (let k2 = 0; k2 < pos.length / 3; k2++) uv.push(pos[k2 * 3] / 2.5, pos[k2 * 3 + 2] / 2.5); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); d.mound = g; }
    coll(-2.9, 2.9, V + 0.35, V + 5.0, 2.45, Y);
    for (let lay = 0; lay < 2; lay++) for (let u = -2.6 + (lay ? 0.27 : 0); u <= 2.6; u += 0.55) for (let v = V + 0.6; v <= V + 4.8; v += 0.4) { const [x, z] = d.at(u + (r() - 0.5) * 0.1, v); BATCH.bag.push([x, fl + Y + 0.08 + lay * 0.17, z, rotT + (r() - 0.5) * 0.15]); }
    for (let lay = 0; lay < Math.round((Y - 1.05) / 0.19); lay++) for (let u = -2.6 + (lay % 2 ? 0.27 : 0); u <= 2.6; u += 0.55) { if (Math.abs(u) < 0.95 && lay * 0.19 + 1.1 < 2.45) continue; const [x, z] = d.at(u, V + 0.3); BATCH.bag.push([x, fl + 1.1 + lay * 0.19, z, rotT]); }
    { const [x, z] = d.at(0, V - 0.25); const sgn = sign(d.label, d.id === 'aid' ? 'aid' : 'plain', x, fl + 2.42, z, Math.atan2(-d.i[0], -d.i[1]), 1.15); }
    glow.push([geo(new THREE.SphereGeometry(0.09, 10, 8), 0, 2.05, V + 2.9), 0xffe6a8]); box(dark, -0.01, 0.01, V + 2.89, V + 2.91, 2.1, 2.3, 0x222222);
    // contents
    const bx = (u0, u1, v0, v1, y0, y1, col, solid = true) => { box(dark, u0, u1, v0, v1, y0, y1, col); if (solid) coll(u0, u1, v0, v1, y0, y1); };
    if (d.id === 'aid') {
      for (const u0 of [-2.15, 0.25]) { bx(u0, u0 + 1.9, V + 3.85, V + 4.45, 0.5, 0.56, 0x6b6a4a); for (const uu of [u0 + 0.15, u0 + 1.75]) box(dark, uu - 0.04, uu + 0.04, V + 3.85, V + 4.45, 0, 0.5, 0x4a3a28); }
      for (let j = 0; j < 3; j++) { bx(1.55, 2.2, V + 1.45 + j * 0.5, V + 1.9 + j * 0.5, 0, 0.42, 0x4a5236); const [x, z] = d.at(1.86, V + 1.67 + j * 0.5); }
      box(dark, -1.25, -1.21, V + 3.4, V + 3.44, 0, 1.75, 0x9a9a9a); box(dark, -1.33, -1.13, V + 3.39, V + 3.45, 1.45, 1.7, 0xdfe6e6);
      for (let j = 0; j < 4; j++) box(dark, -2.2 + j * 0.3, -1.95 + j * 0.3, V + 1.4, V + 1.65, 0.02, 0.1, 0xe8e2d4);
      { const [x, z] = d.at(1.86, V + 1.2); sign('✚', 'aid', x, fl + 1.35, z, Math.atan2(d.i[0], d.i[1]), 0.5); }
      const pts = [[-1.2, V + 4.15, 'prone', Math.atan2(d.t[0], d.t[1])], [-0.9, V + 3.35, 'crouch', Math.atan2(d.i[0], d.i[1])], [1.4, V + 4.15, 'prone', Math.atan2(d.t[0], d.t[1])]];
      for (const [u, v, pose, hd] of pts) { const un = new Unit('f', 'rifle'); scene.remove(un.tag); const [x, z] = d.at(u, v); un.pos.set(x, fl + (pose === 'prone' ? 0.58 : 0), z); un.heading = pose === 'crouch' ? hd + Math.PI : hd; un.alive = true; un.stance = pose === 'crouch' ? 'crouch' : 'down'; un.rig.root.visible = true; if (pose === 'crouch') { un.rig.pose('idle', 0); } else { un.rig.pose(pose, 0, 0.6); un.rig.gun.visible = false; } un.rig.root.position.copy(un.pos); un.rig.root.rotation.y = un.heading; DUG_UNITS.push(un); }
      Object.assign(AIDPOST, { x: d.at(0, V + 2.55)[0], z: d.at(0, V + 2.55)[1], rot: Math.atan2(d.t[0], d.t[1]), y: fl });
    } else if (d.id === 'cmd') {
      bx(-1.0, 1.0, V + 3.6, V + 4.45, 0.74, 0.8, 0x6b4a30); for (const [uu, vv] of [[-0.9, V + 3.7], [0.9, V + 3.7], [-0.9, V + 4.35], [0.9, V + 4.35]]) box(dark, uu - 0.04, uu + 0.04, vv - 0.04, vv + 0.04, 0, 0.74, 0x4a3220);
      d.mapGeo = geo(new THREE.PlaneGeometry(1.7, 0.75).rotateX(-Math.PI / 2), 0, 0.815, V + 4.02);
      for (const [u0, col] of [[1.35, 0x4c5638], [1.9, 0x3e4630]]) { bx(u0, u0 + 0.45, V + 4.1, V + 4.5, 0.9, 1.28, col); for (let j = 0; j < 3; j++) box(dark, u0 + 0.08 + j * 0.13, u0 + 0.13 + j * 0.13, V + 4.06, V + 4.1, 1.15, 1.2, 0x1a1a1a); }
      bx(1.3, 2.3, V + 4.05, V + 4.55, 0.86, 0.9, 0x5a4128); box(dark, 2.05, 2.08, V + 4.3, V + 4.33, 1.28, 2.1, 0x222222);
      box(dark, -0.3, 0.05, V + 3.75, V + 3.95, 0.8, 0.92, 0x2a2a28); for (const uu of [-0.6, 0.5]) bx(uu - 0.2, uu + 0.2, V + 3.05, V + 3.4, 0.0, 0.45, 0x5a4128, false);
      d.wallMap = geo(new THREE.PlaneGeometry(1.4, 1.0).rotateY(Math.PI / 2 * (sg > 0 ? 1 : -1)), -2.28, 1.35, V + 2.9);
      { const un = new Unit('f', 'rifle'); scene.remove(un.tag); const [x, z] = d.at(0.1, V + 3.15); un.pos.set(x, fl, z); un.heading = Math.atan2(d.i[0], d.i[1]); un.alive = true; un.rig.root.visible = true; un.rig.pose('idle', 0); un.rig.root.position.copy(un.pos); un.rig.root.rotation.y = un.heading; DUG_UNITS.push(un); }
    } else if (d.id === 'ammo') {
      for (let j = 0; j < 4; j++) for (let h = 0; h < 3; h++) box(dark, -2.2 + j * 0.62, -1.62 + j * 0.62, V + 4.05, V + 4.55, h * 0.36, h * 0.36 + 0.34, h % 2 ? 0x4e5634 : 0x454d2e); coll(-2.2, 0.3, V + 4.05, V + 4.55, 0, 1.08);
      for (let j = 0; j < 5; j++) for (let h = 0; h < 2; h++) box(dark, 1.7, 2.2, V + 1.45 + j * 0.62, V + 2.0 + j * 0.62, h * 0.4, h * 0.4 + 0.38, 0x5a4a30); coll(1.7, 2.2, V + 1.45, V + 4.55, 0, 0.8);
      for (let j = 0; j < 4; j++) box(dark, 0.6 + j * 0.25, 0.82 + j * 0.25, V + 4.25, V + 4.55, 0, 0.47, 0x56603a);
      for (let j = 0; j < 3; j++) box(dark, -2.2, -1.75, V + 1.5 + j * 0.5, V + 1.95 + j * 0.5, 0, 0.3, 0x3d4a2c);
      d.refill = true;
    } else if (d.id === 'quarters') {
      for (const u0 of [-2.2, 0.3]) { for (const [uu, vv] of [[u0, V + 3.7], [u0 + 1.9, V + 3.7], [u0, V + 4.55], [u0 + 1.9, V + 4.55]]) box(dark, uu - 0.04, uu + 0.04, vv - 0.04, vv + 0.04, 0, 1.75, 0x4a3420);
        for (const y of [0.35, 1.3]) { box(dark, u0, u0 + 1.9, V + 3.7, V + 4.55, y, y + 0.06, 0x4a3420); box(dark, u0 + 0.05, u0 + 1.85, V + 3.75, V + 4.5, y + 0.06, y + 0.2, 0x7d7a5c); box(dark, u0 + 0.5, u0 + 1.85, V + 3.74, V + 4.51, y + 0.2, y + 0.24, [0x5a4a3a, 0x3a4a5a][Math.floor(r() * 2)]); }
        coll(u0, u0 + 1.9, V + 3.7, V + 4.55, 0, 1.6); }
      bx(1.5, 2.2, V + 1.5, V + 2.2, 0.68, 0.72, 0x6b4a30); for (const [uu, vv] of [[1.55, V + 1.55], [2.15, V + 1.55], [1.55, V + 2.15], [2.15, V + 2.15]]) box(dark, uu - 0.03, uu + 0.03, vv - 0.03, vv + 0.03, 0, 0.68, 0x4a3220);
      box(dark, 1.7, 1.95, V + 1.7, V + 1.85, 0.72, 0.86, 0x3a3a34); for (let j = 0; j < 3; j++) box(dark, -2.25, -2.15, V + 1.6 + j * 0.4, V + 1.75 + j * 0.4, 1.5, 1.6, 0x4d5436);
    }
    dugProps(d, fl, V, rotT, tv, zv, sg, r);
  }
  const mk = (list, mat) => { if (!list.length) return null; const m = new THREE.Mesh(build(list), mat); scene.add(SH(onLayer1(m))); return m; };
  mk(wood, new THREE.MeshStandardMaterial({ vertexColors: true, map: TX.wood, roughness: 0.9 })); mk(dark, MAT.vc); mk(iron, MAT.rust ? new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.7, metalness: 0.35 }) : MAT.vc);
  { const mm = new THREE.MeshStandardMaterial({ vertexColors: true, map: TX.micro, roughness: 1 }); for (const d of DUGOUTS) if (d.mound) { const m = new THREE.Mesh(d.mound, mm); scene.add(SH(onLayer1(m))); } }
  if (glow.length) scene.add(onLayer1(new THREE.Mesh(build(glow), new THREE.MeshBasicMaterial({ vertexColors: true, color: 0xffffff }))));
  const mt = mapTex(); for (const d of DUGOUTS) for (const g of [d.mapGeo, d.wallMap]) if (g) scene.add(onLayer1(new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: mt, roughness: 0.8, side: THREE.DoubleSide }))));
}
let POST_SPOTS = [];
/* ================= clutter: the yard and the approaches are a lived-in, shelled battlefield ================= */
function tankBerms(list) {
  for (const [x, z, b] of list) {
    const br = THREE.MathUtils.degToRad(b), fx = Math.sin(br), fz = -Math.cos(br), rx = Math.cos(br), rz = Math.sin(br);
    const P = (lx, lz) => [x + fx * lx + rx * lz, z + fz * lx + rz * lz];
    const pts = [P(1.8, -2.7), P(-4.3, -2.7), P(-4.3, 2.7), P(1.8, 2.7)]; bagWall(pts, 5, null, false);
    for (let k = 0; k < 3; k++) { const a = pts[k], c = pts[k + 1]; const mx = (a[0] + c[0]) / 2, mz = (a[1] + c[1]) / 2; addCollider(mx, mz, Math.hypot(c[0] - a[0], c[1] - a[1]) / 2, 0.35, Math.atan2(-(c[1] - a[1]), c[0] - a[0]), groundAt(mx, mz) + 1.0); const nx = -(c[1] - a[1]), nz = c[0] - a[0], nl = Math.hypot(nx, nz) || 1; addCover(mx + nx / nl * 0.8, mz + nz / nl * 0.8, -nx / nl, -nz / nl, 1.0); addCover(mx - nx / nl * 0.8, mz - nz / nl * 0.8, nx / nl, nz / nl, 1.0); }
  }
}
const CRATER_GEO = build([[G.tor(1.25, 0.5, 6, 20), 0xb09a74, M4(0, 0.05, 0, Math.PI / 2, 0, 0, 1, 1, 0.38)], [new THREE.CircleGeometry(1.15, 20), 0x4b4034, M4(0, 0.04, 0, -Math.PI / 2, 0, 0)]]);
const HEDGEHOG_GEO = build([[G.box(1.9, 0.12, 0.12), 0x5b3b27, M4(0, 0.62, 0, 0, 0.3, 0.62)], [G.box(1.9, 0.12, 0.12), 0x5b3b27, M4(0, 0.62, 0, 0, -0.9, -0.62)], [G.box(0.12, 1.5, 0.12), 0x4e3222, M4(0, 0.62, 0, 0.62, 0, 0)]]);
function truckParts(P) {
  const { B, D, K, C } = P; const parts = [
    [G.box(6.4, 0.3, 2.2), K, M4(0, 0.95, 0)], [G.box(1.9, 1.35, 2.2), B, M4(2.25, 1.75, 0)], [G.box(1.3, 0.9, 2.0), B, M4(3.75, 1.5, 0)], [G.box(0.06, 0.55, 1.9), 0x7f939a, M4(1.33, 2.1, 0, 0, 0, 0.12)],
    [G.box(4.1, 0.9, 2.3), D, M4(-1.2, 1.55, 0)], [new THREE.CylinderGeometry(1.15, 1.15, 4.0, 16, 1, false, 0, Math.PI), C, M4(-1.2, 2.0, 0, 0, 0, Math.PI / 2, 1, 1, 0.95)],
  ];
  for (const [wx, sd] of [[3.3, 1], [3.3, -1], [-0.6, 1], [-0.6, -1], [-2.0, 1], [-2.0, -1]]) parts.push([G.cyl(0.52, 0.52, 0.34, 16), K, M4(wx, 0.52, sd * 0.95, Math.PI / 2, 0, 0)], [G.cyl(0.24, 0.24, 0.36, 10), D, M4(wx, 0.52, sd * 0.97, Math.PI / 2, 0, 0)]);
  return parts;
}
const TRUCK_GEO = build(truckParts({ B: 0x68674a, D: 0x5d5c42, K: 0x1f1e1b, C: 0x6e6b4c }));
const TRUCK_BURNT = build(truckParts({ B: 0x2c2926, D: 0x25221f, K: 0x151412, C: 0x2a2724 }).filter((p, i) => i !== 5));
/* a vehicle standing in the scene. The tanks and trucks of the old set give way to the modelled ones: a Magach for our tank, a jeep for
   every truck and half-track (the burnt-out trucks become burnt-out jeeps: in their paint, broken, and on fire) */
function vehicle(geo, x, z, rot, hx, hz, h, jeepOnly = false) {   // jeepOnly: a burnt-out truck is always a burnt-out jeep (no lorry wrecks)
  // about half the burnt-out trucks are the modelled wrecks of a lorry or a tanker, sooted over: their own size for the collider and the cover
  if (geo === TRUCK_BURNT && !jeepOnly && mdlHas('w_truck') && Math.random() < 0.55) {
    const nm = mdlHas('w_tanker') && Math.random() < 0.4 ? 'w_tanker' : 'w_truck', b = mdlBox(nm), g0 = groundAt(x, z), m = mdlLOD(nm, mdlMats(nm, { color: 0x8a7e74 }, 'burnt'), LITE ? [0, 22, 70] : [0, 40, 120]);
    m.position.set(x, g0 - 0.04, z); m.rotation.y = rot; scene.add(SH(onLayer1(m))); addCollider(x, z, b[0] / 2, b[2] / 2, rot, g0 + b[1]); coverBox(x, z, b[0] / 2, b[2] / 2, rot, Math.min(2.2, b[1])); return m;
  }
  const VD = typeof VEH_DATA !== 'undefined' ? VEH_DATA : {}, truck = geo === TRUCK_BURNT || geo === JEEP_GEO || geo === ETRUCK_GEO || geo === HT_GEO || (typeof OTRUCK_GEO !== 'undefined' && geo === OTRUCK_GEO);
  let rec = null; if (geo === TANK_GEO && VD.magach) rec = vehModel('magach', 'f'); else if (truck && VD.jeep) { rec = vehModel('jeep', geo === ETRUCK_GEO || (geo === TRUCK_BURNT && Math.random() < 0.6) ? 'e' : 'f'); if (geo === TRUCK_BURNT) { vehDamage(rec, true); rec.dead = true; } }
  const mdl = !!rec, m = rec ? rec.g : new THREE.Mesh(geo, MAT.vc); if (geo === TANK_GEO && !mdl) tankMarks(m, TANK_GEO);
  if (rec && truck) { hx = Math.min(hx, 2.05); hz = Math.min(hz, 0.95); h = Math.min(h, 2.0); } m.position.set(x, groundAt(x, z), z); m.rotation.y = rot; scene.add(SH(onLayer1(m))); addCollider(x, z, hx, hz, rot, groundAt(x, z) + h); coverBox(x, z, hx, hz, rot, h); if (rec && geo === TRUCK_BURNT) wreckFire(m, VEH_FIRE.jeep, 0.85); return m; }
function mortarPit(x, z) {
  const arc = []; for (let a = 20; a <= 340; a += 20) { const t = THREE.MathUtils.degToRad(a); arc.push([x + Math.cos(t) * 2.3, z + Math.sin(t) * 2.3]); } bagWall(arc, 4);
  const g0 = groundAt(x, z); const m = new THREE.Mesh(build([[G.cyl(0.28, 0.3, 0.06, 14), 0x3a3a34, M4(0, 0.03, 0)], [G.cyl(0.055, 0.06, 1.25, 12), 0x3b4031, M4(0.25, 0.55, 0, 0, 0, 0.75)], [G.cyl(0.015, 0.015, 0.9, 6), 0x2a2a26, M4(0.6, 0.4, 0.18, 0.3, 0, -0.2)], [G.cyl(0.015, 0.015, 0.9, 6), 0x2a2a26, M4(0.6, 0.4, -0.18, -0.3, 0, -0.2)]]), MAT.vcMetal);
  m.position.set(x, g0, z); m.rotation.y = -0.6; scene.add(SH(onLayer1(m))); propPile('crate', x - 1.4, z + 0.6, 3, 0.55, 2); addCollider(x, z, 0.6, 0.6, 0, g0 + 1.2);
}
function scatterInst(geo, mat, pts, sMin, sMax, seed, cast = false) {
  const r = rng(seed), im = new THREE.InstancedMesh(geo, mat, pts.length), mm = new THREE.Matrix4(), q = new THREE.Quaternion(), up = V3(0, 1, 0);
  pts.forEach(([x, z], i) => { const s = sMin + r() * (sMax - sMin); im.setMatrixAt(i, mm.compose(V3(x, groundAt(x, z) - 0.02, z), q.setFromAxisAngle(up, r() * 6.28), V3(s, s, s))); });
  scene.add(SH(onLayer1(im), cast, true)); return im;
}
function freeSpots(n, test, seed, gen) { const r = rng(seed), out = []; for (let k = 0; k < n * 30 && out.length < n; k++) { const [x, z] = gen(r); if (test(x, z)) out.push([x, z]); } return out; }
function yardClutter() {
  const inYard = (x, z) => inPoly(x, z, YARD) && !blocked(x, z, 1.8, groundAt(x, z)) && onTrench(x, z) > 3.5 && nearRoad(x, z) > 1.5 && Math.hypot(x - DOORS.aid.x, z - DOORS.aid.z) > 5;
  scatterInst(CRATER_GEO, MAT.vc, freeSpots(26, inYard, 71, (r) => [-70 + r() * 125, -85 + r() * 170]), 0.7, 1.5, 72);
  vehicle(JEEP_GEO, 29, -32, 0.35, 3.3, 1.2, 3.0);   // a jeep, not the old box-built lorry: no vehicle in the game but the tank and the jeep
  mortarPit(20, 31); mortarPit(-28, -71);
  { const mm = new THREE.Matrix4(), q = new THREE.Quaternion(); const rails = new THREE.InstancedMesh(new THREE.BoxGeometry(6, 0.14, 0.12), MAT.rust, 18); let k = 0; for (let l = 0; l < 3; l++) for (let i = 0; i < 6; i++) rails.setMatrixAt(k++, mm.compose(V3(40, groundAt(40, -10) + 0.08 + l * 0.15, -11.5 + i * 0.5 + (l % 2) * 0.2), q.setFromAxisAngle(V3(0, 1, 0), 0.05 * l), V3(1, 1, 1))); scene.add(SH(onLayer1(rails))); addCollider(40, -10, 3, 1.5, 0, groundAt(40, -10) + 0.5); }
  for (const [x, z, n] of [[-20, 12, 5], [22, 60, 4], [-50, 44, 6], [40, 51, 5], [-34, -30, 4], [30, -66, 5]]) propPile(Math.abs(x) % 2 ? 'jerry' : 'crate', x, z, n, 0.6, 2);
  const drums = freeSpots(14, inYard, 91, (r) => [-65 + r() * 115, -80 + r() * 160]);
  const q = new THREE.Quaternion(), e = new THREE.Euler(), r = rng(93), dl = [];
  for (const [x, z] of drums) for (let j = 0; j < 3; j++) { const lie = r() < 0.3; const px = x + (j % 2) * 0.62, pz = z + (j > 1 ? 0.6 : 0); dl.push(new THREE.Matrix4().compose(V3(px, groundAt(px, pz) + (lie ? 0.29 : 0), pz), q.setFromEuler(e.set(lie ? Math.PI / 2 : 0, r() * 3, 0)), V3(1, 1, 1))); }
  // the packed drum in the olive of the old ones (two shades), else the old cylinders
  if (!propSet('drum', dl, dl.map((M, i) => (i % 3 ? drumTint(0x46503f) : drumTint(0x2f4a3a))))) { const dm = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.29, 0.29, 0.88, 12).translate(0, 0.44, 0), MAT.drum, dl.length); dl.forEach((M, i) => dm.setMatrixAt(i, M)); scene.add(SH(onLayer1(dm))); }
}
function outsideClutter() {
  // the beach in front of the western rampart is bare: no obstacles, no sandbags, no shell holes - nothing to hide behind between the water and the wall
  const r = rng(517), pile = (x, z, rot, len) => { const c = Math.cos(rot), s2 = Math.sin(rot); bagWall([[x - c * len / 2, z + s2 * len / 2], [x + c * len / 2, z - s2 * len / 2]], 4); };
  for (const [x, z, rot] of [[-8, -118, 0.1], [14, -124, -0.3], [-2, -136, 0.2], [22, -150, 0.1], [2, 118, 0.2], [-12, 126, -0.2], [10, 140, 0.1], [-6, 156, 0.3], [16, 170, -0.1]]) pile(x, z, rot, 2.2);
  const approach = (x, z) => groundAt(x, z) > 0.5 && !inPoly(x, z, MAOZ) && !blocked(x, z, 1.5, groundAt(x, z));
  scatterInst(CRATER_GEO, MAT.vc, [...freeSpots(30, approach, 84, (r) => [-40 + r() * 110, -300 + r() * 180]), ...freeSpots(30, approach, 85, (r) => [-40 + r() * 100, 110 + r() * 200])], 0.8, 1.8, 86);
  vehicle(TRUCK_BURNT, 24, -186, 0.5, 3.3, 1.2, 2.6, true); vehicle(TRUCK_BURNT, 30, 250, -0.3, 3.3, 1.2, 2.6, true);   // burnt-out jeeps, never a lorry's wreck
  const poles = [...densify([[6, -110], [30, -150], [48, -250], [52, -330]], 24).map(([x, z]) => [x + 7, z]), ...densify([[4, 110], [12, 200], [20, 320]], 24).map(([x, z]) => [x + 8, z])];
  const pm = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.1, 0.13, 7, 7).translate(0, 3.5, 0), MAT.wood, poles.length), cm = new THREE.InstancedMesh(new THREE.BoxGeometry(1.4, 0.1, 0.1), MAT.wood, poles.length), mm = new THREE.Matrix4(), q = new THREE.Quaternion();
  poles.forEach(([x, z], i) => { const g = groundAt(x, z); pm.setMatrixAt(i, mm.compose(V3(x, g, z), q.identity(), V3(1, 1, 1))); cm.setMatrixAt(i, mm.compose(V3(x, g + 6.6, z), q.identity(), V3(1, 1, 1))); });
  scene.add(SH(pm), SH(cm));
  const lm = new THREE.LineBasicMaterial({ color: 0x2a2724 }); const wires = [];
  for (const sd of [-0.6, 0.6]) for (let i = 0; i < poles.length - 1; i++) { const a = poles[i], b = poles[i + 1]; if (Math.hypot(a[0] - b[0], a[1] - b[1]) > 40) continue; const ya = groundAt(a[0], a[1]) + 6.6, yb = groundAt(b[0], b[1]) + 6.6; for (let k = 0; k < 8; k++) { const t0 = k / 8, t1 = (k + 1) / 8; const sag = (t) => -Math.sin(t * Math.PI) * 0.6; wires.push(V3(lerp(a[0], b[0], t0) + sd, lerp(ya, yb, t0) + sag(t0), lerp(a[1], b[1], t0)), V3(lerp(a[0], b[0], t1) + sd, lerp(ya, yb, t1) + sag(t1), lerp(a[1], b[1], t1))); } }
  scene.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(wires), lm));
  for (const [x, z, rot] of [[-22, -112, 0.2], [26, -108, -0.3], [-24, 108, Math.PI - 0.2], [24, 104, Math.PI + 0.3], [-46, -100, 0.6], [-46, 100, Math.PI - 0.6]]) { const g = groundAt(x, z); const p = new THREE.Mesh(GEO.boxUp, MAT.wood); p.scale.set(0.08, 1.2, 0.08); p.position.set(x, g, z); scene.add(onLayer1(p)); sign('מוקשים', 'aid', x, g + 1.25, z, rot, 0.9); }
}

/* ================= the stronghold ================= */
function buildStronghold() {
  bunker('cmd', 'חמ״ל', -8, -42, 13, 8, Math.PI / 2 + 0.05);
  bunker('q1', 'מגורים א׳', 26, -50, 14, 7, 0.3);
  bunker('q2', 'מגורים ב׳', 34, 6, 14, 7, -Math.PI / 2 + 0.05);
  bunker('aid', 'מקלט רפואי', -36, 8, 12, 8, Math.PI / 2, 'aid');
  bunker('kitchen', 'מטבח', 10, 48, 12, 7, Math.PI + 0.2);
  bunker('shul', 'בית כנסת', -26, 57, 9, 6, Math.PI - 0.3);
  bunker('ammo', 'תחמושת', 14, -18, 6, 5, -Math.PI / 2);
  waterTower(46, -24);
  mast(-17, -52, 15); mast(-2, -54, 11);
  flag(-4, -68, 'il', 9, 0.4);
  vehicle(HT_GEO, -40, -58, -THREE.MathUtils.degToRad(30) + Math.PI / 2, 3.0, 1.2, 2.0); camoNet(-40, -58, 7.4, 5, 2.7, -THREE.MathUtils.degToRad(30) + Math.PI / 2);   // under the net a jeep, where the box-built half-track stood
  jeep(-25, -32, 0.7);
  const gen = new THREE.Mesh(GEO.boxUp, MAT.concrete); gen.scale.set(4, 2.3, 3); gen.position.set(48, groundAt(48, 32) - 0.1, 32); scene.add(SH(onLayer1(gen))); addCollider(48, 32, 2.1, 1.6, 0, groundAt(48, 32) + 2.2);
  placeTank(4, 20, 270); placeTank(-14, -12, 350); placeTank(8, -82, 0); placeTank(9, 76, 180);
  camoNet(4.5, 20, 9.5, 6.4, 3.4, 0, false);
  placeTank(10, -142, 20, TANK_BURNT);
  shadeArea(-18, 32, 0.2);
  { const W = (z) => crestX(z) + 1.0; POST_SPOTS = [[W(-45), -45], [W(-19), -19], [W(-8), -8], [W(4), 4], [W(30), 30], [W(62), 62], [-38, -89.4], [-12, -94.6], [12, -93.3], [34, -86.7], [-38, 86.7], [-16, 90.8], [8, 89.6], ...GUN_SPOTS.map((g) => [g[2], g[3]])]; }
  buildRoads(); buildTrenches(); buildDugouts(); yardPaving(); buildHuts(); buildContainers(); tankBerms([[4, 20, 270], [-14, -12, 350], [9, 76, 180], [8, -82, 0]]); yardClutter();
  // gates
  for (const [gx, gz] of [GATE_N, GATE_S]) {
    const g0 = groundAt(gx, gz); const grp = new THREE.Group();
    for (const s of [-1, 1]) { const p = new THREE.Mesh(GEO.boxUp, MAT.wood); p.scale.set(0.2, 1.3, 0.2); p.position.set(gx + s * 3.2, g0, gz); grp.add(p); }
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 6.6, 8).rotateZ(Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xb8b0a0, roughness: 0.7 })); bar.position.set(gx, g0 + 1.2, gz); grp.add(bar);
    for (let k = -2; k <= 2; k += 2) { const st = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.6, 8).rotateZ(Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xa32620, roughness: 0.7 })); st.position.set(gx + k * 0.75, g0 + 1.2, gz); grp.add(st); }
    scene.add(SH(onLayer1(grp)));
  }
  // fuel drums outside the south gate
  const r = rng(14), mm = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), gl = [], half = new THREE.Matrix4().makeTranslation(0, -0.44, 0);   // half: the packed drum stands on its base, the old cylinder was centred
  for (let i = 0; i < 30; i++) { const x = 10 + (i % 6) * 0.65 + (r() - .5) * .2, z = 103 + Math.floor(i / 6) * 0.65; const lie = i > 25; e.set(lie ? Math.PI / 2 : 0, r() * 3, 0); q.setFromEuler(e); gl.push(mm.compose(V3(x, groundAt(x, z) + (lie ? 1.2 : 0.44), z), q, V3(1, 1, 1)).clone()); }
  if (!propSet('drum', gl.map((M) => M.clone().multiply(half)), gl.map((M, i) => (i % 4 ? drumTint(0x46503f) : drumTint(0x7a6a3a))))) { const drums = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.29, 0.29, 0.88, 14), MAT.drum, 30); gl.forEach((M, i) => drums.setMatrixAt(i, M)); scene.add(SH(onLayer1(drums))); }
  // stretchers and crates by the aid station
  const dA = DOORS.aid;
  for (let i = 0; i < 2; i++) { const s = new THREE.Group(); const cloth = new THREE.Mesh(G.box(0.55, 0.03, 1.9), MAT.canvasOD); cloth.position.y = 0.2; s.add(cloth); for (const sx of [-0.3, 0.3]) { const pole = new THREE.Mesh(G.cyl(0.02, 0.02, 2.2, 5), MAT.wood); pole.rotation.x = Math.PI / 2; pole.position.set(sx, 0.2, 0); s.add(pole); } s.position.set(dA.x + 2.5 + i * 0.8, groundAt(dA.x + 2.5, dA.z + 3), dA.z + 3); scene.add(SH(onLayer1(s))); }
  for (const [x, z] of [[18, -12], [19, -14], [-4, -30], [30, 20], [-22, 48]]) { const ry = Math.random(); if (mdlHas('crate')) { BATCH.crate.push([x, groundAt(x, z), z, ry]); continue; }   // with the packed crates (flushBatches)
    const c = new THREE.Mesh(CRATE_GEO, MAT.vc); c.position.set(x, groundAt(x, z), z); c.rotation.y = ry; scene.add(SH(onLayer1(c))); }
  propPile('crate', 5, -15, 6, 1.05, 2); propPile('crate', 6.5, -11.5, 4, 1.05, 2); propPile('jerry', -12, -36, 6, 0.25); propPile('jerry', 1.5, 24.6, 5, 0.25); propPile('jerry', -10, -8, 4, 0.25); propPile('crate', 38, -40, 3, 1.05, 1);
  // posts on the ramparts
  const W = (z) => crestX(z) + 1.0;
  post('W1', 'עמדה מערבית 1', W(-45), -45, 300, 'surv', 2);   // in survival its gun looks north, down the shore the attacks come along
  post('W05', 'מקלע 0.5 · צפון־מערב', W(-30), -30, 302, 'heavy');
  post('W2N', 'מא״ג מערבי צפוני', W(-19), -19, 274, true);
  post('W2', 'מא״ג מערבי', W(-8), -8, 270, true);
  post('W2S', 'מא״ג מערבי דרומי', W(4), 4, 266, true);
  post('W3', 'עמדה מערבית 3', W(30), 30, 238, 'surv');
  post('W3S', 'מא״ג דרומי בפינה', W(47.5), 47.5, 200, 'surv', 178);   // survival only: the southern corner, its gun looking south along the shore
  post('W4', 'מא״ג דרום־מערבי', W(62), 62, 252, true);
  post('N1', 'עמדה צפונית', -38, -89.4, 350, false);
  post('N2', 'השער הצפוני', -12, -94.6, 0, false);
  post('N3', 'מא״ג צפוני', 12, -93.3, 5, true);
  post('N4', 'עמדה צפון־מזרחית', 34, -86.7, 20, false);
  post('E1', 'עמדה לכיוון הלגונה', 62, -8, 90, false);
  post('E2', 'עמדה מזרחית', 48, 59, 150, false);
  post('S1', 'עמדה דרום־מערבית', -38, 86.7, 190, false);
  post('S2', 'השער הדרומי', -16, 90.8, 180, false);
  post('S3', 'מא״ג דרומי', 8, 89.6, 175, true);
  for (const [id, name, x, z, b] of GUN_SPOTS) gunPost(id, name, x, z, b);
  concertina(); egyScrub(); riprap(); farFires();
  // mezach darom observation post and the armour bunker
  bagWall([[-6, 1030], [0, 1027], [6, 1030]], 5);
  bunker('darom', 'מזח דרום', 0, 1060, 8, 6, Math.PI);
  bunker('armor', 'בונקר שריון', 6, 196, 16, 9, Math.PI);
  outsideClutter(); flushBatches(); scatterDetail(); initScorch();
}
