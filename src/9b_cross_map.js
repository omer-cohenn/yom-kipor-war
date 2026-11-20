/* ================= chapter 5's ground: the crossing, the village and the mosque =================
   Built in local metres (x east, z south) round CR.o - the canal at x 70..170, the roller bridge's axis at z -40, the pontoon bridge at z 70,
   the sweet-water canal at x -130 - and laid into the game as one group (ROOT). The same code as the walk-through test page
   (tools/cross_test_tpl.html): the ground of soil and sand under scanned detail, the dirt roads, the wheat fields with their scanned fences,
   the eucalyptus rows (trees of scanned branches), the mango and citrus orchards (pictures of their trees, baked here once), both bridges
   (each segment a piece of its own, to push the roller bridge out and to break the pontoons), the concrete bridge on the tanks' axis, and
   the village - a T of soft mud houses, the writing on their walls, the cover along its streets, and the mosque at the head of the T, walked
   in on both floors. What walking, bullets and eyes meet goes to the game as colliders, floors and cover points (the end of crMapBuild). */
const CRM = { ready: null, built: false };
function crMapBuild() {
  const ROOT = new THREE.Group(); ROOT.position.set(CR.o.x, 0, CR.o.z); scene.add(ROOT); const ox = CR.o.x, oz = CR.o.z, CAML = new THREE.Vector3();
  // the test page's own noise and lot (the layout comes out exactly as it was walked there)
  const rng = (s) => () => ((s = Math.imul(s ^ (s >>> 15), 1 | s) + 0x6d2b79f5 | 0, ((s ^ (s >>> 13)) >>> 0) / 4294967296));
  const hash = (x, y) => { let h = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  const vn = (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi, sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy); const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1); return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy; };
  const fbm = (x, y) => vn(x, y) * 0.5 + vn(x * 2.1, y * 2.1) * 0.3 + vn(x * 4.3, y * 4.3) * 0.2;
  const WIND = { value: 0 };
  const windSway = (amp, from, span) => `{ vec3 io = (instanceMatrix * vec4(0.0,0.0,0.0,1.0)).xyz; float hh = clamp((position.y - ${from.toFixed(2)}) / ${span.toFixed(2)}, 0.0, 1.0); hh *= hh; float ph = uWind * 1.7 + io.x * 0.11 + io.z * 0.083; float g = sin(ph) * 0.65 + sin(ph * 2.3 + io.z * 0.4) * 0.35 + 0.35; transformed.x += g * ${amp.toFixed(3)} * hh; transformed.z += sin(ph * 1.3 + 1.7) * ${(amp * 0.45).toFixed(3)} * hh; }`;
  const texReady = (t) => new Promise((ok) => (t.image && t.image.complete && t.image.naturalWidth ? ok() : t.image.addEventListener('load', ok, { once: true })));
  /* ================= the layout (metres; x east, z south). The Suez canal runs north-south at x 70..170; the west bank: the rampart, the
     fields between dirt roads, the sweet-water canal at x -130 and the orchards beyond it ================= */
  const CAN0 = 70, CAN1 = 170, RAMP = 52, SWC = -130, RB_Z = -40, PB_Z = 70, SB_Z = -100;   // SB_Z: the concrete bridge over the sweet-water canal, on the tanks' axis
  const X0 = -260, X1 = 280, Z0 = -190, Z1 = 210;
  function height(x, z) {
    let h = 1.5 + 0.35 * (fbm(x / 60, z / 60) - 0.5);
    // the Suez canal: steep revetted banks down to the water at 0, deep in the middle
    const dc = Math.max(CAN0 - x, x - CAN1); if (dc < 0) h = lerp(-4.5, 0.2, smooth(-14, 0, dc)); else h = lerp(0.9, h, smooth(0, 9, dc));
    // the rampart on the west bank (a gap at each bridge) and the higher sand of the east bank
    const gap = Math.min(Math.abs(z - RB_Z), Math.abs(z - PB_Z)), rw = Math.exp(-(((x - RAMP) / 6.5) ** 2)) * smooth(9, 16, gap); h += 6 * rw;
    if (x > CAN1) h += 1.2 * smooth(CAN1 + 8, CAN1 + 40, x) + 0.8 * fbm(x / 30, z / 30);
    // the sweet-water canal: 14 m of water between low mud banks
    const ds = Math.abs(x - SWC); h = lerp(h, -1.5, smooth(9, 4, ds)) + 0.35 * Math.exp(-(((ds - 9) / 1.6) ** 2));
    return h;
  }
  // the roads: [points, width]
  const ROADS = [
    { p: [[CAN0 - 6, RB_Z], [RAMP, RB_Z], [20, RB_Z], [-40, RB_Z], [-92, RB_Z]], w: 5.5 },
    { p: [[-90, SB_Z], [-121, SB_Z]], w: 5.5 },
    { p: [[-90, -108], [-90, 28]], w: 5 },
    { p: [[-139, SB_Z], [-260, SB_Z]], w: 5.5, trees: 1 },
    { p: [[CAN0 - 14, PB_Z], [RAMP, PB_Z], [30, PB_Z + 2], [10, PB_Z + 30], [-10, 160], [-12, 210]], w: 5 },
    { p: [[-118, -190], [-118, 210]], w: 3.2, trees: 2 },          // the towpath east of the sweet-water canal
    { p: [[-142, -190], [-142, 210]], w: 3.2, trees: 2 },            // and west of it
    { p: [[-118, 120], [-40, 120], [10, 118]], w: 3.5 },               // a field road east-west
    { p: [[-40, 64], [40, 64]], w: 3.5 }, { p: [[40, 64], [40, -30], [36, -38]], w: 3.5 },   // the jeeps' track: between the fields and along the foot of the rampart, to the village
    { p: [[-40, -190], [-40, -66]], w: 3.5 }, { p: [[-40, -8], [-40, 120]], w: 3.5 },             // and north-south
    { p: [[CAN1 + 6, RB_Z], [210, RB_Z], [280, RB_Z - 10]], w: 5.5 }, { p: [[CAN1 + 14, PB_Z], [220, PB_Z + 4], [280, PB_Z + 20]], w: 5 },
  ];
  // the fields (to be filled with wheat in part 2) between the roads, each with its gate
  const PLOTS = [];
  { const r = rng(5); const cells = [[-112, -46, -186, -114], [-34, 40, -186, RB_Z - 26], [-112, -46, 34, 114], [-34, 32, RB_Z + 28, 60], [-112, -46, 126, 206]];
    for (const [x0, x1, z0, z1] of cells) { const nz = Math.max(1, Math.round((z1 - z0) / 70)); for (let k = 0; k < nz; k++) { const a = lerp(z0, z1, k / nz), b = lerp(z0, z1, (k + 1) / nz); PLOTS.push({ x0, x1, z0: a + (k ? 1.5 : 0), z1: b - (k < nz - 1 ? 1.5 : 0), gate: Math.floor(r() * 4) }); } } }
  const ORCH = [{ x0: -255, x1: -150, z0: -186, z1: SB_Z - 8, kind: 1 }, { x0: -255, x1: -150, z0: SB_Z + 8, z1: 70, kind: 2 }, { x0: -255, x1: -150, z0: 80, z1: 206, kind: 1 }];
  // ---------- painted steel, rusting: the bridges' skin (one canvas: olive paint worn, rust running down from edges and bolts, scuffs) ----------
  function steelTex(seed, base = [84, 90, 66]) {
    const S = 512, c = document.createElement('canvas'); c.width = c.height = S; const x = c.getContext('2d'), r = rng(seed);
    x.fillStyle = `rgb(${base})`; x.fillRect(0, 0, S, S);
    for (let i = 0; i < 2200; i++) { const v = (r() - 0.5) * 26; x.fillStyle = `rgba(${base[0] + v},${base[1] + v},${base[2] + v * 0.8},0.35)`; x.fillRect(r() * S, r() * S, 2 + r() * 14, 2 + r() * 6); }
    for (let i = 0; i < 140; i++) { const px = r() * S, py = r() * S, len = 20 + r() * 120, w = 1 + r() * 5; const g = x.createLinearGradient(px, py, px, py + len); g.addColorStop(0, `rgba(${120 + r() * 30},${62 + r() * 20},${30 + r() * 10},${0.35 + r() * 0.4})`); g.addColorStop(1, 'rgba(110,60,30,0)'); x.fillStyle = g; x.fillRect(px, py, w, len); }
    for (let i = 0; i < 40; i++) { x.fillStyle = `rgba(${150 + r() * 40},${84 + r() * 20},${40},${0.5 + r() * 0.4})`; x.beginPath(); x.ellipse(r() * S, r() * S, 2 + r() * 14, 2 + r() * 9, r() * 3, 0, 7); x.fill(); }
    for (let i = 0; i < 90; i++) { x.strokeStyle = `rgba(180,175,160,${0.15 + r() * 0.3})`; x.lineWidth = 0.6 + r(); x.beginPath(); const px = r() * S, py = r() * S; x.moveTo(px, py); x.lineTo(px + (r() - 0.5) * 60, py + (r() - 0.5) * 12); x.stroke(); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = ANISO; return t;
  }
  function treadTex() {   // the deck: steel tread plate, its raised bars in a herringbone, worn bright where the tracks run
    const S = 256, c = document.createElement('canvas'); c.width = c.height = S; const x = c.getContext('2d'), r = rng(31); x.fillStyle = '#6b6c5e'; x.fillRect(0, 0, S, S);
    for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) { x.save(); x.translate(i * 16 + 8, j * 16 + 8); x.rotate((i + j) % 2 ? 0.78 : -0.78); x.fillStyle = 'rgba(150,150,138,0.85)'; x.fillRect(-5, -1.3, 10, 2.6); x.fillStyle = 'rgba(40,40,34,0.6)'; x.fillRect(-5, 1.3, 10, 1); x.restore(); }
    for (let i = 0; i < 260; i++) { x.fillStyle = `rgba(${110 + r() * 40},${64 + r() * 20},34,${0.15 + r() * 0.3})`; x.fillRect(r() * S, r() * S, 2 + r() * 10, 2 + r() * 10); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = ANISO; return t;
  }
  const STEEL = new THREE.MeshStandardMaterial({ map: steelTex(3), roughness: 0.72, metalness: 0.35 }), STEEL2 = new THREE.MeshStandardMaterial({ map: steelTex(9, [70, 74, 58]), roughness: 0.75, metalness: 0.3 });
  const TREAD = new THREE.MeshStandardMaterial({ map: treadTex(), roughness: 0.6, metalness: 0.45 }), DARK = new THREE.MeshStandardMaterial({ color: 0x2c2d27, roughness: 0.6, metalness: 0.5 });
  const ROPE = new THREE.MeshStandardMaterial({ color: 0x8a7a5a, roughness: 1 });
  const add = (o, cast = true) => { o.traverse((m) => { if (m.isMesh) { m.castShadow = cast && SHADOWS; m.receiveShadow = SHADOWS; } }); ROOT.add(o); return o; };
  const instOf = (geo, mat, mats4, cast = true) => { const im = new THREE.InstancedMesh(geo, mat, mats4.length); mats4.forEach((M, i) => im.setMatrixAt(i, M)); im.computeBoundingSphere(); return add(im, cast); };
  const M4 = (x, y, z, ry = 0, sx = 1, sy = 1, sz = 1, rx = 0, rz = 0) => new THREE.Matrix4().compose(V3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), V3(sx, sy, sz));
  const boxUV = (w, h, d, k = 1) => { const g = new THREE.BoxGeometry(w, h, d); const uv = g.attributes.uv, n = g.attributes.normal, p = g.attributes.position; for (let i = 0; i < uv.count; i++) { const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i)); const u = ax > 0.5 ? p.getZ(i) : p.getX(i), v = ay > 0.5 ? p.getZ(i) : p.getY(i); uv.setXY(i, u / (3 * k), v / (3 * k)); } return g; };

  /* ---------- the roller bridge: steel floats, each a roller 2.5 m across on its axle, two box girders tying them, the tread deck over them. Every
     segment is its own piece, so the bridge can lie on the east bank and be pushed out across the water (RB.pose); deployed it floats with
     the rollers half under and climbs onto both banks over its own rollers ---------- */
  const DECK_Y = (x) => { if (x < CAN0 - 4 || x > CAN1 + 4) return null; const land = Math.max(height(x, RB_Z), 0.6) + 1.55; return x < CAN0 + 4 || x > CAN1 - 4 ? Math.max(1.95, land) : 1.95; };
  const SEG = 6.25, NSEG = Math.ceil((CAN1 - CAN0 + 8) / SEG);
  const RB = { segs: [], n: NSEG, SEG, len: NSEG * SEG, tip: CAN0 - 4 };
  { const T = (g, x = 0, y = 0, z = 0, rx = 0) => { if (rx) g.rotateX(rx); g.translate(x, y, z); if (!g.index) g = g.toNonIndexed(); return g; };
    const rg = new THREE.CylinderGeometry(1.25, 1.25, 4.5, LITE ? 24 : 40, 1, true); { const uv = rg.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 2.6, uv.getY(i) * 1.5); }
    const gSteel = T(rg, 0, -1.45, 0, Math.PI / 2), l2 = [], ld = [];
    for (const s of [-1, 1]) { l2.push(T(new THREE.CylinderGeometry(1.33, 1.33, 0.22, LITE ? 24 : 40), 0, -1.45, s * 2.35, Math.PI / 2), T(boxUV(SEG - 0.15, 0.62, 0.32), 0, -0.35, s * 2.62));
      ld.push(T(new THREE.CylinderGeometry(0.38, 0.38, 0.22, 16), 0, -1.45, s * 2.47, Math.PI / 2), T(boxUV(0.6, 0.35, 0.5), SEG / 2, -0.62, s * 2.62), T(new THREE.TorusGeometry(0.16, 0.05, 6, 12), SEG / 2 - 0.2, -0.55, s * 2.85)); }
    const dg = new THREE.BoxGeometry(SEG - 0.05, 0.24, 5.0); { const uv = dg.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 2.4, uv.getY(i) * 2); } dg.translate(0, -0.12, 0);
    const gS2 = mergeGeometries(l2), gD = mergeGeometries(ld);
    for (let k = 0; k < NSEG; k++) { const g = new THREE.Group(); for (const [geo, mat] of [[gSteel, STEEL], [gS2, STEEL2], [gD, DARK], [dg, TREAD]]) g.add(new THREE.Mesh(geo, mat)); add(g); RB.segs.push(g); }
    // the bow: the pusher's frame and the orange marker boards
    RB.bow = new THREE.Group(); for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3.6, 6), DARK); p.position.set(0, 1.6, s * 2.3); RB.bow.add(p); const b = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.6, 1.0), new THREE.MeshStandardMaterial({ color: 0xe8641e, roughness: 0.6 })); b.position.set(0, 3.1, s * 2.8); RB.bow.add(b); } add(RB.bow); }
  // the deck's height at x for a bridge whose west end is at tip: floating on the water, or up on the bank on its rollers
  const rbSegY = (cx) => { if (cx > CAN0 + 4 && cx < CAN1 - 4) return 1.95; return Math.max(1.95, Math.max(height(cx, RB_Z), 0.6) + 1.55); };
  RB.pose = (br, t = 0) => { const tip = lerp(CAN1 + 6, CAN0 - 4, clamp(br, 0, 1)), ys = []; RB.tip = tip;
    for (let k = 0; k < NSEG; k++) { const cx = tip + (k + 0.5) * SEG, y = rbSegY(cx), wet = cx > CAN0 + 4 && cx < CAN1 - 4; ys.push(y); RB.segs[k].position.set(cx, y + (wet ? Math.sin(t * 1.4 + k) * 0.04 : 0), RB_Z); }
    for (let k = 0; k < NSEG; k++) { const a = ys[k - 1] ?? ys[k], b = ys[k + 1] ?? ys[k]; RB.segs[k].rotation.set(0, 0, Math.atan2(b - a, 2 * SEG)); }
    RB.bow.position.set(tip + 0.1, ys[0], RB_Z); RB.bow.visible = br < 1; RB.tail = tip + NSEG * SEG; };
  RB.pose(1);

  /* ---------- the pontoon bridge: uniflote pontoons, their bows raked, a ribbed deck over them, stanchions and a hand rope; each pontoon its
     own piece (the bomb breaks the bridge: PB.segs) ---------- */
  const PB_DECK = 1.05, PB = { segs: [] };
  { const hull = (() => { const s = new THREE.Shape(); s.moveTo(-3.9, 0.45); s.lineTo(3.9, 0.45); s.lineTo(3.9, -0.15); s.lineTo(3.4, -0.45); s.lineTo(-3.4, -0.45); s.lineTo(-3.9, -0.15); s.closePath();
      const g = new THREE.ExtrudeGeometry(s, { depth: 6.0, bevelEnabled: false }).translate(0, PB_DECK - 0.6, -3.0); const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / 3, uv.getY(i) / 3); return g; })();
    const PM = new THREE.MeshStandardMaterial({ map: steelTex(17, [92, 98, 76]), roughness: 0.7, metalness: 0.3 });
    const dg = new THREE.BoxGeometry(7.92, 0.14, 4.4); { const uv = dg.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 3, uv.getY(i) * 1.6); } dg.translate(0, PB_DECK, 0);
    const dk = []; for (let k = -3; k <= 3; k += 1.5) dk.push(new THREE.BoxGeometry(0.08, 0.06, 4.4).translate(k, PB_DECK + 0.075, 0));
    for (const s of [-1, 1]) { for (const k of [-3.2, 0, 3.2]) dk.push(new THREE.CylinderGeometry(0.035, 0.04, 1.1, 6).toNonIndexed().translate(k, PB_DECK + 0.55, s * 2.15)); dk.push(new THREE.CylinderGeometry(0.11, 0.13, 0.3, 10).toNonIndexed().translate(-3.5, PB_DECK + 0.1, s * 2.75)); }
    const gD = mergeGeometries(dk.map((g) => (g.index ? g.toNonIndexed() : g))), rp = [];
    for (const s of [-1, 1]) for (const hgt of [1.05, 0.65]) rp.push(new THREE.CylinderGeometry(0.018, 0.018, 8, 5).rotateZ(Math.PI / 2).translate(0, PB_DECK + hgt, s * 2.15));
    const gR = mergeGeometries(rp);
    for (let x = CAN0 - 2; x <= CAN1 + 2; x += 8) { const g = new THREE.Group(); for (const [geo, mat] of [[hull, PM], [dg, TREAD], [gD, DARK], [gR, ROPE]]) g.add(new THREE.Mesh(geo, mat)); g.position.set(x, 0, PB_Z); add(g); PB.segs.push({ g, x }); }
    for (const [x, s] of [[CAN0 - 9, 1], [CAN1 + 9, -1]]) { const g = new THREE.BoxGeometry(10, 0.22, 4.4); const m = add(new THREE.Mesh(g, TREAD)); const yb = Math.max(height(x, PB_Z), 0.9); m.position.set(x, (yb + PB_DECK) / 2 + 0.05, PB_Z); m.rotation.z = s * Math.atan2(yb - PB_DECK, 10) * -1; } }
  PB.reset = () => { for (const s of PB.segs) { s.g.position.set(s.x, 0, PB_Z); s.g.rotation.set(0, 0, 0); s.g.visible = true; } };

  /* ---------- writing on the walls: what an Egyptian village has painted on it - the hajj's house with the Kaaba and "a pilgrimage accepted",
     God's names, a grocer's board, slogans of the war sprayed in black and red, house numbers. One sheet of sixteen, each a quarter as tall
     as it is wide; a decal is a quad laid a few centimetres off the wall ---------- */
  const AR = (() => { const c = document.createElement('canvas'); c.width = 1024; c.height = 1024; const g = c.getContext('2d'), r = rng(808), F = '"Noto Naskh Arabic","Amiri","Geeza Pro","Traditional Arabic","Arial"';
    const cell = (i, fn) => { g.save(); g.translate((i % 2) * 512, Math.floor(i / 2) * 128); g.beginPath(); g.rect(0, 0, 512, 128); g.clip(); fn(); g.restore(); };
    const text = (t, col, px, x = 256, y = 66, o = {}) => { g.font = `${o.w || 'bold'} ${px}px ${F}`; g.direction = 'rtl'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = col; g.globalAlpha = o.a ?? 0.9;
      if (o.spray) { g.shadowColor = col; g.shadowBlur = 5; for (let k = 0; k < 3; k++) g.fillText(t, x + (r() - 0.5) * 2, y + (r() - 0.5) * 2); g.shadowBlur = 0; g.strokeStyle = col; g.lineWidth = 2; for (let k = 0; k < 7; k++) { const dx = x + (r() - 0.5) * 300, dy = y + 18; g.globalAlpha = 0.55; g.beginPath(); g.moveTo(dx, dy); g.lineTo(dx, dy + 12 + r() * 30); g.stroke(); } }
      else g.fillText(t, x, y); g.globalAlpha = 1; };
    // wear: the plaster showing through in flecks
    const worn = (n = 260) => { g.globalCompositeOperation = 'destination-out'; for (let i = 0; i < n; i++) { g.globalAlpha = 0.3 + r() * 0.6; g.beginPath(); g.ellipse(r() * 512, r() * 128, 1 + r() * 7, 1 + r() * 4, r() * 3, 0, 7); g.fill(); } g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; };
    const panel = (col, x0 = 20, x1 = 492) => { g.fillStyle = col; g.globalAlpha = 0.92; g.fillRect(x0, 14, x1 - x0, 100); g.globalAlpha = 1; };
    const kaaba = (x, y, s) => { g.fillStyle = '#1b1a18'; g.fillRect(x - s / 2, y - s / 2, s, s); g.fillStyle = '#c99a32'; g.fillRect(x - s / 2, y - s / 4, s, s / 9); g.fillStyle = '#2a2622'; g.fillRect(x - s / 2 + s * 0.68, y - s / 2 + s * 0.08, s * 0.32, s * 0.92); };
    const camel = (x, y, s, col) => { g.strokeStyle = col; g.lineWidth = 4; g.beginPath(); g.moveTo(x - s, y); g.lineTo(x - s, y - s * 0.5); g.quadraticCurveTo(x - s * 0.6, y - s * 1.2, x - s * 0.2, y - s * 0.6); g.quadraticCurveTo(x + s * 0.2, y - s * 1.1, x + s * 0.5, y - s * 0.6); g.lineTo(x + s * 0.9, y - s * 1.1); g.lineTo(x + s * 1.1, y - s * 1.0); g.moveTo(x + s * 0.5, y - s * 0.6); g.lineTo(x + s * 0.5, y); g.moveTo(x - s * 0.6, y - s * 0.5); g.lineTo(x - s * 0.6, y); g.moveTo(x + s * 0.1, y - s * 0.5); g.lineTo(x + s * 0.1, y); g.stroke(); };
    cell(0, () => { kaaba(70, 64, 70); camel(440, 100, 34, '#2f5d8a'); text('حج مبرور وذنب مغفور', '#2f5d8a', 46, 262, 64); worn(); });                 // the hajj's house
    cell(1, () => { text('الله أكبر', '#1c1a18', 78, 256, 62, { spray: 1 }); });
    cell(2, () => { text('تحيا مصر', '#1c1a18', 74, 256, 62, { spray: 1 }); });
    cell(3, () => { text('النصر لنا', '#8a1f1a', 74, 256, 62, { spray: 1 }); });
    cell(4, () => { panel('#3f6f5a'); text('بقالة الأمل', '#f1e6c8', 64); worn(180); });                                                        // the grocer's board
    cell(5, () => { text('ما شاء الله', '#2a6a8a', 70, 256, 64); worn(200); });
    cell(6, () => { panel('#f3efe4', 60, 452); g.strokeStyle = '#2b6b3c'; g.lineWidth = 5; g.strokeRect(68, 22, 376, 84); text('مسجد النور', '#2b6b3c', 66); worn(90); });   // the mosque's plaque
    cell(7, () => { text('لا إله إلا الله', '#f3efe4', 58, 256, 64, { a: 0.95 }); worn(80); });
    cell(8, () => { text('الحاج محمد عبد الله', '#3a4f7a', 54, 256, 64); kaaba(36, 64, 38); worn(220); });
    cell(9, () => { text('يا رب', '#2a6a8a', 80, 256, 62); worn(200); });
    cell(10, () => { text('١٤', '#1c1a18', 84, 120, 64, { a: 0.8 }); text('٢٧', '#1c1a18', 84, 390, 64, { a: 0.8 }); });                       // house numbers
    cell(11, () => { text('الموت لإسرائيل', '#1c1a18', 60, 256, 62, { spray: 1 }); });
    cell(12, () => { panel('#7a5a3a'); text('ورشة الحداد', '#efe2c0', 58); worn(160); });                                                    // a smithy
    cell(13, () => { text('بسم الله الرحمن الرحيم', '#2b6b3c', 44, 256, 64); worn(160); });
    cell(14, () => { text('عبرنا', '#1c1a18', 82, 256, 62, { spray: 1 }); });
    cell(15, () => { text('٦ أكتوبر', '#8a1f1a', 72, 256, 62, { spray: 1 }); });
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = ANISO; return t; })();
  const AR_MAT = new THREE.MeshStandardMaterial({ map: AR, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3, roughness: 0.95 });
  const DECALS = [];
  // a decal centred at s along the face, its centre at height yc, w metres wide; ry the face's turn; cell 0-15
  function decal(at, s, yc, w, ry, cell, out = 0.07) { const [x, z] = at(s, out), g = new THREE.PlaneGeometry(w, w / 4), uv = g.attributes.uv, u0 = (cell % 2) * 0.5, v0 = 1 - (Math.floor(cell / 2) + 1) * 0.125;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, u0 + uv.getX(i) * 0.5, v0 + uv.getY(i) * 0.125); g.rotateY(ry); g.translate(x, yc, z); DECALS.push(g); }

  /* ================= part 2: the village, a T. The main street (the stem) runs from the roller bridge west along the road; at its end the
     cross street (the bar) runs north and south, and at the head of the T, facing straight down the stem, the mosque. The flank goes off the
     street into a narrow alley, then west along a lane between two rows of houses to the south arm and the mosque's side door. Houses are
     closed (mud plaster over brick, flat roofs and their clutter); the mosque is walked in: its hall, its stair, the upper floor, the MG room.
     WALLS are what walking bumps into (with the heights they stand between); SURF the floors and stairs it stands on ================= */
  const V = { stem: [30, -76], bar: -90, barZ: [-108, 28], LZ: -19, mosque: { x: -104, z: RB_Z, w: 17, d: 19 } };
  const WALLS = [], SURF = [], HOUSES = [], PROPS = [];
  const wallBox = (x0, x1, z0, z1, y0 = -9, y1 = 40) => WALLS.push({ x0: Math.min(x0, x1), x1: Math.max(x0, x1), z0: Math.min(z0, z1), z1: Math.max(z0, z1), y0, y1 });
  // ---- the materials: mud plaster laid by world position (so every wall gets its own piece of the scan), damp and darker at the foot ----
  function plasterMat(tint, nScale) { const m = new THREE.MeshStandardMaterial({ map: mdlTex('cross/mud/map'), normalMap: mdlTex('cross/mud/nmap', false), normalScale: new THREE.Vector2(nScale, nScale), vertexColors: true, color: tint, roughness: 0.96 });
    m.onBeforeCompile = (sh) => { sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWp; varying vec3 vWn;').replace('#include <uv_vertex>', '#include <uv_vertex>\nvWp = (modelMatrix * vec4(position, 1.0)).xyz; vWn = normalize(mat3(modelMatrix) * normal);');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vWp; varying vec3 vWn;')
        .replace('#include <map_fragment>', 'vec2 wuv = abs(vWn.x) > 0.5 ? vWp.zy : abs(vWn.z) > 0.5 ? vWp.xy : vWp.xz; wuv /= 2.4; { vec3 c = texture2D(map, wuv).rgb; float l = dot(c, vec3(0.3, 0.59, 0.11)); diffuseColor.rgb *= mix(vec3(l), c, 0.5) * 1.32; } diffuseColor.rgb *= mix(0.72, 1.0, smoothstep(1.3, 2.2, vWp.y));')
        .replace('#include <normal_fragment_maps>', 'vec3 mapN = texture2D(normalMap, (abs(vWn.x) > 0.5 ? vWp.zy : abs(vWn.z) > 0.5 ? vWp.xy : vWp.xz) / 2.4).xyz * 2.0 - 1.0; mapN.xy *= normalScale; normal = normalize(tbn * mapN);'); };
    m.customProgramCacheKey = () => 'plaster' + nScale; return m; }
  function woodTex(seed, paint) { const W = 128, H = 256, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d'), r = rng(seed);
    x.fillStyle = paint; x.fillRect(0, 0, W, H); for (let i = 0; i < W; i += 21) { x.fillStyle = 'rgba(30,20,10,0.55)'; x.fillRect(i, 0, 2, H); }
    for (let i = 0; i < 500; i++) { x.fillStyle = r() < 0.5 ? `rgba(120,90,60,${0.2 + r() * 0.5})` : `rgba(255,255,255,${0.05 + r() * 0.12})`; x.fillRect(r() * W, r() * H, 1 + r() * 6, 1 + r() * 18); }
    for (let i = 0; i < 18; i++) { x.fillStyle = 'rgba(110,80,50,0.8)'; x.beginPath(); x.ellipse(r() * W, r() * H, 3 + r() * 12, 4 + r() * 20, 0, 0, 7); x.fill(); }
    x.fillStyle = 'rgba(40,30,20,0.6)'; x.fillRect(0, H * 0.3, W, 4); x.fillRect(0, H * 0.72, W, 4);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = ANISO; return t; }
  const MUD = plasterMat(0xffffff, 0.9), LIME = plasterMat(0xf6f2ea, 0.45);
  const WOOD = [['#4f7f8c', 3], ['#3f6f5a', 5], ['#7a5a3a', 7], ['#5e7fa0', 9]].map(([p, s]) => new THREE.MeshStandardMaterial({ map: woodTex(s, p), roughness: 0.9 }));
  const DARKIN = new THREE.MeshStandardMaterial({ color: 0x1d1813, roughness: 1 }), STRAW = new THREE.MeshStandardMaterial({ color: 0xb59a5c, roughness: 1 }), STALK = new THREE.MeshStandardMaterial({ color: 0x5c4a34, roughness: 1 }), CLAY = new THREE.MeshStandardMaterial({ color: 0xa8673f, roughness: 0.9 }), FROND = new THREE.MeshStandardMaterial({ color: 0x8a7a4e, roughness: 1, side: THREE.DoubleSide });
  const GEO = { mud: [], lime: [], dark: [], straw: [], stalk: [], clay: [], frond: [], wood: [[], [], [], []] };
  const bx = (list, w, h, d, x, y, z, ry = 0, col) => { const g = new THREE.BoxGeometry(w, h, d); if (ry) g.rotateY(ry); g.translate(x, y, z); if (col) { const c = new Float32Array(g.attributes.position.count * 3); for (let i = 0; i < c.length; i += 3) c.set(col, i); g.setAttribute('color', new THREE.BufferAttribute(c, 3)); } list.push(g); return g; };
  const jar = (() => { const pts = [[0, 0], [0.16, 0.02], [0.24, 0.2], [0.22, 0.42], [0.1, 0.55], [0.11, 0.62]].map(([a, b]) => new THREE.Vector2(a, b)); return new THREE.LatheGeometry(pts, 10); })();

  /* ---- a house: its body (one or two floors, the upper set back), the parapet round its roof, its door and shutters on the street side, a
     bench by the door, a palm-frond shade, stairs up the side, and what lies on the roof: bundles of cotton stalks, straw, jars, now and then
     a dovecote ---- */
  /* a soft mud box: walls lean in as they rise, corners and the top edge are rounded off, the faces bulge and sag a little, its top line
     wanders. Base at y, centred on x, z */
  function softBox(w, h, d, x, y, z, tint, o = {}) { const S = 0.42, g = new THREE.BoxGeometry(w, h, d, Math.max(2, Math.round(w / S)), Math.max(2, Math.round(h / S)), Math.max(2, Math.round(d / S))), p = g.attributes.position, R = o.round ?? 0.32, bat = o.batter ?? 0.035, sd = (o.seed ?? 0) * 3.7;
    for (let i = 0; i < p.count; i++) { let px = p.getX(i), py = p.getY(i) + h / 2, pz = p.getZ(i); const t = py / h;
      // round the vertical edges
      const ex = w / 2 - R, ez = d / 2 - R, ax = Math.abs(px), az = Math.abs(pz); if (ax > ex && az > ez) { const dx = ax - ex, dz = az - ez, L = Math.hypot(dx, dz) || 1; px = Math.sign(px) * (ex + dx * R / L * Math.min(1, L / R) ** 0.2); pz = Math.sign(pz) * (ez + dz * R / L * Math.min(1, L / R) ** 0.2); }
      // round the top edge and let the top wander
      const edge = Math.min(w / 2 - Math.abs(px), d / 2 - Math.abs(pz)); if (py > h - 0.3 && edge < 0.3) py -= (0.3 - edge) * 0.45 * ((py - (h - 0.3)) / 0.3);
      if (py > h - 0.05) py += (vn((x + px) * 0.35 + sd, (z + pz) * 0.35) - 0.5) * (o.wob ?? 0.22);
      // the lean, and the bulges of hand-laid mud
      const k = 1 - bat * t; px *= k; pz *= k; const b = (vn((x + px) * 0.6 + sd, py * 0.6 + (z + pz) * 0.6) - 0.5) * 0.09 * Math.min(1, py / 0.4);
      if (Math.abs(Math.abs(px) - w * k / 2) < 0.05) px += Math.sign(px) * b; if (Math.abs(Math.abs(pz) - d * k / 2) < 0.05) pz += Math.sign(pz) * b;
      p.setXYZ(i, px, py, pz); }
    g.translate(x, y, z); g.computeVertexNormals(); const c = new Float32Array(p.count * 3); for (let i = 0; i < c.length; i += 3) c.set(tint, i); g.setAttribute('color', new THREE.BufferAttribute(c, 3)); GEO.mud.push(g); return g; }
  /* a window set deep in the mud: its dark inside, a wooden frame, two shutters (open flat to the wall, half open or shut), sometimes bars */
  function windowAt(at, s, yb, ww, wh, ry, wl, tint, r) { const [wx, wz] = at(s, -0.18); bx(GEO.dark, ww, wh, 0.4, wx, yb + wh / 2, wz, ry);
    const fr = [at(s, 0.02)]; const [fx, fz] = fr[0]; for (const [a, b, c2, e] of [[ww + 0.16, 0.08, 0, wh / 2 + 0.04], [ww + 0.16, 0.08, 0, -wh / 2 - 0.04], [0.08, wh, -ww / 2 - 0.04, 0], [0.08, wh, ww / 2 + 0.04, 0]]) { const [qx, qz] = at(s + c2, 0.03); bx(wl, a, b, 0.08, qx, yb + wh / 2 + e, qz, ry); }
    const mode = r(); for (const k of [-1, 1]) { const sw = ww / 2; if (mode < 0.25) { const [qx, qz] = at(s + k * sw / 2, 0.05); bx(wl, sw - 0.02, wh - 0.04, 0.04, qx, yb + wh / 2, qz, ry); continue; }
        const open = mode < 0.6 ? Math.PI * 0.5 : Math.PI * 0.92, hx = s + k * (ww / 2 + 0.04), [hx0, hz0] = at(hx, 0.06), g = new THREE.BoxGeometry(sw, wh - 0.04, 0.04); g.translate(-k * sw / 2, 0, 0); g.rotateY(k * -open); if (ry) g.rotateY(ry); g.translate(hx0, yb + wh / 2, hz0); wl.push(g); }
    if (r() < 0.4) for (let b = -2; b <= 2; b++) { const [qx, qz] = at(s + b * ww / 5.5, -0.08); const g = new THREE.CylinderGeometry(0.012, 0.012, wh, 4); g.translate(qx, yb + wh / 2, qz); GEO.dark.push(g); }
    const [sx0, sz0] = at(s, 0.08); bx(GEO.mud, ww + 0.3, 0.1, 0.22, sx0, yb - 0.05, sz0, ry, tint); }
  function house(H, r) {
    const { x, z, w, d, face } = H, y = height(x, z) - 0.3, tint = [[1, 0.97, 0.92], [0.95, 0.88, 0.78], [1.02, 0.95, 0.86], [0.9, 0.86, 0.8], [1.04, 1.0, 0.95]][Math.floor(r() * 5)], h1 = 3.3 + r() * 0.9, seed = r() * 100;
    softBox(w, h1 + 0.3, d, x, y, z, tint, { seed, wob: 0.12 }); wallBox(x - w / 2, x + w / 2, z - d / 2, z + d / 2, -9, y + h1 + 0.3); HOUSES.push(H);
    const top = y + h1 + 0.3, two = H.two;
    // the parapet: soft, its height stepping, a gap here and there for the rain
    const pw = 0.3; for (const [ww, dd, xx, zz] of [[w, pw, x, z - d / 2 + pw / 2], [w, pw, x, z + d / 2 - pw / 2], [pw, d - 2 * pw, x - w / 2 + pw / 2, z], [pw, d - 2 * pw, x + w / 2 - pw / 2, z]]) softBox(ww, 0.55 + r() * 0.35, dd, xx, top - 0.05, zz, tint, { seed: seed + xx, round: 0.1, batter: 0, wob: 0.3 }), wallBox(xx - ww / 2, xx + ww / 2, zz - dd / 2, zz + dd / 2, top - 0.1, top + 0.6);
    let up = null; if (two) { const w2 = w * (0.45 + r() * 0.2), d2 = d * (0.5 + r() * 0.2), ox = (r() - 0.5) * (w - w2) * 0.8, oz = (r() - 0.5) * (d - d2) * 0.8; up = { x: x + ox, z: z + oz, w: w2, d: d2 }; softBox(w2, 2.9, d2, x + ox, top - 0.05, z + oz, tint, { seed: seed + 7, wob: 0.18 }); wallBox(x + ox - w2 / 2, x + ox + w2 / 2, z + oz - d2 / 2, z + oz + d2 / 2, top - 0.2, top + 2.85);
      for (const [ww, dd, xx, zz] of [[w2, pw, x + ox, z + oz - d2 / 2 + pw / 2], [w2, pw, x + ox, z + oz + d2 / 2 - pw / 2]]) softBox(ww, 0.5, dd, xx, top + 2.8, zz, tint, { seed: seed + zz, round: 0.1, batter: 0, wob: 0.25 }); }
    // the street face
    const n = { '+z': [0, 1], '-z': [0, -1], '+x': [1, 0], '-x': [-1, 0] }[face], along = n[0] ? [0, 1] : [1, 0], half = n[0] ? d / 2 : w / 2, depth = (n[0] ? w / 2 : d / 2) * (1 - 0.035 * 0.3);
    const at = (s, out) => [x + along[0] * s + n[0] * (depth + out), z + along[1] * s + n[1] * (depth + out)], ry = n[0] ? Math.PI / 2 : 0, wl = GEO.wood[Math.floor(r() * 4)];
    // the door: deep in the wall, low and narrow, a heavy lintel of palm wood over it, a step
    const ds = (r() - 0.5) * (half - 1.8) * 1.2, dw = 0.95 + r() * 0.2, dh = 1.95 + r() * 0.2, [dx, dz] = at(ds, -0.2); bx(GEO.dark, dw + 0.1, dh, 0.5, dx, y + 0.3 + dh / 2, dz, ry);
    const [dx2, dz2] = at(ds, -0.12); if (r() < 0.75) bx(wl, dw, dh - 0.05, 0.06, dx2, y + 0.3 + dh / 2, dz2, ry); else { const [hx, hz] = at(ds - dw / 2, -0.12), g = new THREE.BoxGeometry(dw, dh - 0.05, 0.06); g.translate(dw / 2, 0, 0); g.rotateY(-1.1 * (n[1] ? n[1] : -n[0])); if (ry) g.rotateY(ry); g.translate(hx, y + 0.3 + dh / 2, hz); wl.push(g); }
    const [lx, lz] = at(ds, 0.05); { const g = new THREE.CylinderGeometry(0.11, 0.12, dw + 0.7, 7); g.rotateZ(Math.PI / 2); if (ry) g.rotateY(ry); g.translate(lx, y + 0.3 + dh + 0.12, lz); GEO.wood[2].push(g); }
    const [sx1, sz1] = at(ds, 0.2); bx(GEO.mud, dw + 0.5, 0.18, 0.45, sx1, y + 0.39, sz1, ry, tint);
    if (r() < 0.6) { const s = ds + (ds > 0 ? -1.6 : 1.6), [bx0, bz0] = at(s, 0.28); softBox(1.6, 0.48, 0.5, bx0, y + 0.28, bz0, tint, { seed: seed + 3, round: 0.12, batter: 0.05, wob: 0.03 }); }
    Object.assign(H, { y, top, n, half, depth, at, ds, dw, dh, up });
    // what is painted on it (its own lot, so the rows come out as they were)
    { const rd = rng(Math.round(x * 31 + z * 17) + 99), ra = Math.atan2(n[0], n[1]), q = rd(), sd = clamp(ds > 0 ? ds - dw / 2 - 1.3 : ds + dw / 2 + 1.3, -half + 1.2, half - 1.2), hw = h1 + 0.3;
      if (q < 0.16 && half > 3) decal(at, sd, y + hw - 0.75, 2.4, ra, rd() < 0.5 ? 0 : 8);
      else if (q < 0.27) decal(at, ds, y + 0.3 + dh + 0.55, 1.9, ra, rd() < 0.6 ? 4 : 12, 0.12);
      else if (q < 0.55) decal(at, sd, y + 1.15 + rd() * 0.3, 2.0 + rd() * 0.6, ra, [1, 2, 3, 11, 14, 15][Math.floor(rd() * 6)]);
      else if (q < 0.68) decal(at, ds, y + 0.3 + dh + 0.42, 1.5, ra, [5, 9, 13][Math.floor(rd() * 3)], 0.1);
      if (rd() < 0.25) decal(at, ds + (ds > 0 ? -1 : 1) * (dw / 2 + 0.45), y + 2.05, 0.8, ra, 10); }
    // the windows: small, square, high; the upper floor's smaller still
    const nw = half > 4.5 ? 2 : 1; for (let i = 0; i < nw; i++) { const s = nw === 1 ? (ds > 0 ? -half * 0.5 : half * 0.5) : (i ? 1 : -1) * half * 0.62; if (Math.abs(s - ds) < 1.5) continue; const ww = 0.62 + r() * 0.16; windowAt(at, s, y + 1.75 + r() * 0.15, ww, ww * (1.15 + r() * 0.2), ry, wl, tint, r); }
    if (up) { const fn = n[0] ? up.x + n[0] * up.w / 2 : up.z + n[1] * up.d / 2, own = n[0] ? x + n[0] * w / 2 : z + n[1] * d / 2; if (Math.abs(fn - own) < 0.6) { const c = n[0] ? up.z - z : up.x - x; windowAt(at, c, top + 0.95, 0.55, 0.7, ry, wl, tint, r); } }
    if (r() < 0.35) { const [ax, az] = at(ds, 1.1); const g = new THREE.BoxGeometry(2.6, 0.08, 2.0); g.rotateX(0.12 * (n[1] || 0)); g.rotateZ(-0.12 * (n[0] || 0)); if (ry) g.rotateY(ry); g.translate(ax, y + 2.65, az); GEO.frond.push(g); for (const k of [-1.2, 1.2]) { const [px, pz] = at(ds + k, 1.95); const g2 = new THREE.CylinderGeometry(0.06, 0.07, 2.5, 6); g2.translate(px, y + 1.55, pz); wl.push(g2); } }
    // a few palm beams poking out under the roof, as the roofs here are laid
    for (let i = 0, nbm = 2 + Math.floor(r() * 3); i < nbm; i++) { const s = (r() - 0.5) * half * 1.7, [px, pz] = at(s, 0.18), g = new THREE.CylinderGeometry(0.07, 0.08, 0.5, 6); g.rotateX(Math.PI / 2); if (ry) g.rotateY(ry); g.translate(px, top - 0.2, pz); GEO.wood[2].push(g); }
    // roof clutter
    const nb = Math.floor(r() * 4); for (let i = 0; i < nb; i++) { const g = new THREE.CylinderGeometry(0.35, 0.35, 1.4 + r(), 7); g.rotateZ(Math.PI / 2); g.rotateY(r() * 3); g.translate(x + (r() - 0.5) * (w - 1.5), top + 0.35, z + (r() - 0.5) * (d - 1.5)); GEO.stalk.push(g); }
    if (r() < 0.5) { const g = new THREE.SphereGeometry(1 + r() * 0.6, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2); g.scale(1, 0.6, 1); g.translate(x + (r() - 0.5) * (w - 3), top, z + (r() - 0.5) * (d - 3)); GEO.straw.push(g); }
    for (let i = 0, nj = Math.floor(r() * 3); i < nj; i++) { const g = jar.clone(); g.translate(x + (r() - 0.5) * (w - 1), top, z + (r() - 0.5) * (d - 1)); GEO.clay.push(g); }
    if (!two && r() < 0.15) { const g = new THREE.CylinderGeometry(0.9, 1.5, 3.4, 14, 6); g.translate(x + (r() - 0.5) * (w - 3.5), top + 1.7, z + (r() - 0.5) * (d - 3.5)); const c = new Float32Array(g.attributes.position.count * 3); for (let i = 0; i < c.length; i += 3) c.set(tint, i); g.setAttribute('color', new THREE.BufferAttribute(c, 3)); GEO.mud.push(g); }
  }
  // ---- the rows: a gap is [centre, width]; houses stop exactly at its edges. `face` is the side toward the street; `deep` forces a depth ----
  { const r = rng(91);
    const row = (along, a0, a1, side, gaps, depth, opt = {}) => { let a = a0; while (a > a1 + 3) { let w = 6 + r() * 5; const G = gaps.find(([g, gw]) => a - w < g + gw / 2 && a > g - gw / 2); if (G) { if (a <= G[0] + G[1] / 2 + 0.01) { a = G[0] - G[1] / 2; continue; } w = a - (G[0] + G[1] / 2); if (w < 3.5) { a = G[0] - G[1] / 2; continue; } }
        w = Math.min(w, a - a1); if (w < 3) break; const deep = opt.deep && opt.deep(a - w / 2), d = deep || depth[0] + r() * (depth[1] - depth[0]), base = opt.base ?? (along === 'x' ? RB_Z : V.bar), off = opt.off ?? 4.2;
        const H = along === 'x' ? { x: a - w / 2, z: base + side * (off + d / 2), w, d, face: side > 0 ? '-z' : '+z' } : { x: base + side * (off + d / 2), z: a - w / 2, w: d, d: w, face: side > 0 ? '-x' : '+x' };
        H.two = r() < 0.35; house(H, r); a -= w + (r() < 0.2 ? 0.6 + r() * 1.2 : 0.05); } };
    const laneN = V.LZ - 1.1, laneS = V.LZ + 1.1, toLane = (cx) => (cx < -22 ? laneN - (RB_Z + 4.2) : 0);
    row('x', V.stem[0], V.stem[1], -1, [[-8, 3], [-40, 3.5]], [8, 13]);                                   // the stem, north side
    row('x', V.stem[0], V.stem[1], 1, [[5, 2.6], [-40, 2.2]], [8, 13], { deep: toLane });                  // the stem, south side (west of x -28 its backs make the lane's north side)
    row('x', -22, V.stem[1], 1, [], [8, 10], { base: laneS, off: 0 });
    { const x = -21.6, z = V.LZ; bx(GEO.mud, 0.5, 3.6, laneS - laneN + 0.6, x, height(x, z) + 1.5, z, 0, [0.95, 0.9, 0.82]); wallBox(x - 0.25, x + 0.25, laneN - 0.3, laneS + 0.3); }                                     // the lane's south side, its doors on the lane
    row('z', V.barZ[1], RB_Z + 6, 1, [[V.LZ, 2.4]], [7, 10]); row('z', RB_Z - 6, V.barZ[0], 1, [[-80, 3]], [7, 10]);   // the bar's east side, south and north arms
    row('z', V.barZ[1], RB_Z + 14, -1, [], [7, 9]); row('z', RB_Z - 14, V.barZ[0], -1, [[SB_Z, 7]], [7, 9]);         // the bar's west side, on either side of the mosque
    // the street's cover, staggered along the stem and the bar so there is always something within a short run: carts, a burnt-out truck,
    // oil drums, crates, sacks of grain, heaps of bricks and rubble, straw bales, a fallen palm trunk, a low mud wall, a trough
    const cart = mdlGeo('cart', LITE ? 1 : 0), cm = mdlMats('cart'), carts = [];
    const solid = (x, z, hw, hd, h = 1.2) => wallBox(x - hw, x + hw, z - hd, z + hd, -9, height(x, z) + h);
    const put = { cart: (x, z, a) => { carts.push(M4(x, height(x, z), z, a)); solid(x, z, 0.8, 1.1, 1.0); },
      drums: (x, z) => { for (let k = 0; k < 4; k++) { const g = new THREE.CylinderGeometry(0.29, 0.29, 0.88, 12); g.translate(x + (k % 2) * 0.62, height(x, z) + 0.44, z + Math.floor(k / 2) * 0.62); GEO.wood[k % 2 ? 0 : 3].push(g); } solid(x + 0.3, z + 0.3, 0.7, 0.7, 0.9); },
      crates: (x, z) => { for (let k = 0; k < 5; k++) bx(GEO.wood[2], 0.8, 0.6, 0.6, x + (k % 3) * 0.82, height(x, z) + 0.3 + Math.floor(k / 3) * 0.6, z, (k % 2) * 0.1); solid(x + 0.8, z, 1.3, 0.4, 1.2); },
      sacks: (x, z) => { for (let k = 0; k < 9; k++) { const g = new THREE.SphereGeometry(0.42, 8, 6); g.scale(1.25, 0.55, 0.8); g.translate(x + (k % 4) * 0.82 + (Math.floor(k / 4) % 2) * 0.4, height(x, z) + 0.22 + Math.floor(k / 4) * 0.4, z); GEO.straw.push(g); } solid(x + 1.3, z, 1.8, 0.45, 1.0); },
      bricks: (x, z) => { for (let i = 0; i < 40; i++) bx(GEO.mud, 0.4, 0.2, 0.2, x + (i % 6) * 0.42, height(x, z) + 0.1 + Math.floor(i / 12) * 0.2, z + (Math.floor(i / 6) % 2) * 0.22, 0, [0.85, 0.66, 0.5]); solid(x + 1.1, z + 0.1, 1.35, 0.3, 0.8); },
      rubble: (x, z) => { const r = rng(Math.round(x * 13 - z)); for (let i = 0; i < 16; i++) softBox(0.5 + r() * 0.8, 0.3 + r() * 0.5, 0.4 + r() * 0.7, x + (r() - 0.5) * 2.4, height(x, z) - 0.1, z + (r() - 0.5) * 1.2, [0.95, 0.88, 0.78], { seed: i, round: 0.15, wob: 0.1 }); solid(x, z, 1.3, 0.7, 0.9); },
      bales: (x, z) => { for (let k = 0; k < 6; k++) bx(GEO.straw, 1.0, 0.5, 0.5, x + (k % 3) * 1.02, height(x, z) + 0.25 + Math.floor(k / 3) * 0.5, z, 0); solid(x + 1, z, 1.6, 0.3, 1.0); },
      palm: (x, z, a) => { const g = new THREE.CylinderGeometry(0.28, 0.34, 7, 9); g.rotateZ(Math.PI / 2); g.rotateY(a); g.translate(x, height(x, z) + 0.3, z); GEO.wood[2].push(g); solid(x, z, Math.abs(Math.cos(a)) * 3.5 + 0.35, Math.abs(Math.sin(a)) * 3.5 + 0.35, 0.6); },
      wall: (x, z, a) => { softBox(Math.abs(Math.cos(a)) * 3 + 0.5, 1.15, Math.abs(Math.sin(a)) * 3 + 0.5, x, height(x, z) - 0.1, z, [0.95, 0.9, 0.8], { round: 0.15, wob: 0.15 }); solid(x, z, Math.abs(Math.cos(a)) * 1.5 + 0.25, Math.abs(Math.sin(a)) * 1.5 + 0.25, 1.1); },
      trough: (x, z) => { bx(GEO.lime, 2.2, 0.6, 0.7, x, height(x, z) + 0.3, z, 0, [0.75, 0.74, 0.7]); solid(x, z, 1.1, 0.35, 0.6); },
      truck: (x, z, a) => { const T = new THREE.Group(), bm = new THREE.MeshStandardMaterial({ map: steelTex(41, [52, 46, 40]), roughness: 0.9, metalness: 0.3 }), blk = new THREE.MeshStandardMaterial({ color: 0x1b1916, roughness: 1 });
        const P = (w, h, d, px, py, pz, m = bm) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(px, py, pz); T.add(o); };
        P(1.9, 0.9, 1.9, 1.7, 1.1, 0); P(1.9, 0.95, 1.4, 1.75, 1.95, 0); P(0.05, 0.6, 1.3, 2.7, 2.0, 0, blk); P(3.4, 0.12, 2.1, -0.95, 1.05, 0); P(3.4, 0.6, 0.08, -0.95, 1.4, 1.02); P(3.4, 0.6, 0.08, -0.95, 1.4, -1.02); P(0.08, 0.6, 2.1, -2.62, 1.4, 0);
        for (const [wx, wz] of [[1.7, 1], [1.7, -1], [-1.6, 1], [-1.6, -1]]) { const wh = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.28, 12).rotateX(Math.PI / 2), blk); wh.position.set(wx, 0.42, wz); T.add(wh); }
        T.rotation.set(0, a, 0.05); T.position.set(x, height(x, z) - 0.1, z); add(T); solid(x, z, 2.9 * Math.abs(Math.cos(a)) + 1.1 * Math.abs(Math.sin(a)), 2.9 * Math.abs(Math.sin(a)) + 1.1 * Math.abs(Math.cos(a)), 2.3); } };
    // along the stem (south side +, north side -; the passage stays open down its middle) and both arms of the bar
    for (const [k, x, s, a] of [['bricks', 24, 1], ['drums', 14, -1], ['cart', 6, 1, 0.3], ['sacks', -3, -1], ['wall', -12, 1, 0], ['truck', -22, -1, 0.15], ['crates', -31, 1], ['rubble', -36, -1], ['bales', -47, 1], ['palm', -55, -1, 0.1], ['cart', -62, 1, -0.4], ['drums', -70, -1], ['trough', -74, 1]])
      { const z = RB_Z + s * 3.0; put[k](x, z, a || 0); PROPS.push({ k, x, z, s, along: 'x' }); }
    for (const [k, z, s, a] of [['sacks', -62, 1], ['cart', -76, -1, 1.5], ['rubble', -90, 1], ['wall', -12, 1, Math.PI / 2], ['bales', 2, -1], ['drums', 14, 1]]) { const x = V.bar + s * 3.2 + (k === 'sacks' || k === 'bales' ? -1 : 0); put[k](x, z, a || 0); PROPS.push({ k, x, z, s, along: 'z' }); }
    for (const p of cart) instOf(p.g, cm[p.m], carts);

  }

  /* ---- the mosque: walls 0.6 m thick with their doors and windows cut, a hall of columns and carpet below, a stair up the west wall to the
     upper floor, and on it, behind a partition, the room over the front door with the MG at its wide window. The dome on its drum, the
     minaret at the north-west corner, the courtyard wall behind. Every piece of wall is something walking bumps into ---- */
  const MQ = (() => {
    const M = V.mosque, t = 0.6, y0 = height(M.x, M.z) + 0.05, F2 = y0 + 4.8, RF = F2 + 4.4, X0 = M.x - M.w / 2, X1 = M.x + M.w / 2, Z0 = M.z - M.d / 2, Z1 = M.z + M.d / 2;
    const L = GEO.lime, wall = (xa, xb, za, zb, ya, yb) => { const w = Math.abs(xb - xa), d = Math.abs(zb - za), h = yb - ya; if (w < 0.01 || d < 0.01 || h < 0.01) return; bx(L, w, h, d, (xa + xb) / 2, (ya + yb) / 2, (za + zb) / 2, 0, [1, 1, 1]); wallBox(xa, xb, za, zb, ya, yb); };
    // a wall along x (at z = zc) or z (at x = xc) from a to b, between heights ya and yb, with openings [centre, width, sill, top]
    const run = (axis, c, a, b, ya, yb, holes) => { const hs = holes.slice().sort((p, q) => p[0] - q[0]); let s = a; const seg = (p, q, y1, y2) => axis === 'x' ? wall(p, q, c - t / 2, c + t / 2, y1, y2) : wall(c - t / 2, c + t / 2, p, q, y1, y2);
      for (const [hc, hw, sill, top] of hs) { seg(s, hc - hw / 2, ya, yb); if (sill > ya) seg(hc - hw / 2, hc + hw / 2, ya, sill); if (top < yb) seg(hc - hw / 2, hc + hw / 2, top, yb); s = hc + hw / 2; } seg(s, b, ya, yb); };
    const f = y0, u = F2 + 0.3;
    // ground floor: the main door on the front (east), the side doors north and south, high windows
    run('z', X1 - t / 2, Z0, Z1, f, F2 + 0.3, [[M.z, 2.4, f, f + 3.2], [M.z - 5.6, 1.1, f + 1.8, f + 3.1], [M.z + 5.6, 1.1, f + 1.8, f + 3.1]]);
    run('z', X0 + t / 2, Z0, Z1, f, F2 + 0.3, [[M.z + 3, 1.0, f + 2.0, f + 3.2]]);
    run('x', Z1 - t / 2, X0, X1, f, F2 + 0.3, [[M.x - 3, 1.4, f, f + 2.4], [M.x + 3.5, 1.0, f + 2.0, f + 3.2]]);
    run('x', Z0 + t / 2, X0, X1, f, F2 + 0.3, [[M.x - 3, 1.4, f, f + 2.4], [M.x + 3.5, 1.0, f + 2.0, f + 3.2]]);
    // upper floor: the MG window over the door, arched windows
    run('z', X1 - t / 2, Z0, Z1, u, RF, [[M.z, 3.4, u + 0.95, u + 2.3], [M.z - 5.6, 1.1, u + 1.0, u + 2.3], [M.z + 5.6, 1.1, u + 1.0, u + 2.3]]);
    run('z', X0 + t / 2, Z0, Z1, u, RF, [[M.z + 4, 1.0, u + 1.0, u + 2.3]]);
    for (const zc of [Z1 - t / 2, Z0 + t / 2]) run('x', zc, X0, X1, u, RF, [[M.x - 4, 1.0, u + 1.0, u + 2.3], [M.x + 1, 1.0, u + 1.0, u + 2.3], [M.x + 5.5, 1.0, u + 1.0, u + 2.3]]);
    // the floors: the hall's, the upper slab (open over the stair), the roof
    const SX0 = X0 + t, SX1 = SX0 + 1.8, SZ0 = M.z + 3.5, SZ1 = Z0 + t + 0.4;   // the stair: along the west wall, climbing north from z SZ0 to SZ1
    bx(GEO.lime, M.w - 2 * t, 0.1, M.d - 2 * t, M.x, f + 0.05, M.z, 0, [0.82, 0.8, 0.76]);
    const slab = (xa, xb, za, zb) => { bx(GEO.lime, xb - xa, 0.3, zb - za, (xa + xb) / 2, F2 + 0.15, (za + zb) / 2, 0, [0.95, 0.94, 0.9]); SURF.push({ x0: xa, x1: xb, z0: za, z1: zb, y: () => F2 + 0.3 }); };
    slab(SX1, X1 - t, Z0 + t, Z1 - t); slab(SX0, SX1, Z0 + t, SZ1); slab(SX0, SX1, SZ0, Z1 - t);
    bx(GEO.lime, M.w + 0.3, 0.35, M.d + 0.3, M.x, RF + 0.17, M.z, 0, [0.96, 0.95, 0.92]);
    for (const [w, d, x, z] of [[M.w + 0.4, 0.3, M.x, Z0 - 0.05], [M.w + 0.4, 0.3, M.x, Z1 + 0.05], [0.3, M.d + 0.4, X0 - 0.05, M.z], [0.3, M.d + 0.4, X1 + 0.05, M.z]]) bx(GEO.lime, w, 0.9, d, x, RF + 0.75, z, 0, [1, 1, 1]);
    SURF.push({ x0: X0 + t, x1: X1 - t, z0: Z0 + t, z1: Z1 - t, y: () => f + 0.1 });
    // the stair itself, its steps and a rail; walking climbs it
    const nst = 22; for (let k = 0; k < nst; k++) { const z1 = lerp(SZ0, SZ1, k / nst), z2 = lerp(SZ0, SZ1, (k + 1) / nst), yy = lerp(f + 0.1, F2 + 0.3, (k + 1) / nst); bx(GEO.lime, SX1 - SX0, yy - f, Math.abs(z2 - z1), (SX0 + SX1) / 2, (yy + f) / 2, (z1 + z2) / 2, 0, [0.9, 0.88, 0.84]); }
    SURF.push({ x0: SX0, x1: SX1, z0: SZ1, z1: SZ0, y: (x, z) => lerp(f + 0.1, F2 + 0.3, clamp((SZ0 - z) / (SZ0 - SZ1), 0, 1)), ramp: [SZ0, SZ1, f + 0.1, F2 + 0.3] });
    bx(GEO.wood[2], 0.06, 0.06, SZ0 - SZ1, SX1 + 0.05, (f + F2) / 2 + 1.0, (SZ0 + SZ1) / 2); wallBox(SX1, SX1 + 0.12, SZ1 + 1.2, SZ0, f, F2 - 0.4);
    // the hall: two rows of columns, the carpet, the mihrab and the minbar on the south wall
    for (const cx of [M.x - 2.5, M.x + 2.5]) for (const cz of [M.z - 5, M.z, M.z + 5]) { bx(GEO.lime, 0.55, F2 - f, 0.55, cx, (f + F2) / 2, cz, 0, [0.97, 0.96, 0.93]); wallBox(cx - 0.28, cx + 0.28, cz - 0.28, cz + 0.28, f, F2); }
    { const c = document.createElement('canvas'); c.width = 256; c.height = 512; const g = c.getContext('2d'), r = rng(3); g.fillStyle = '#7a2a22'; g.fillRect(0, 0, 256, 512); for (let j = 0; j < 8; j++) { g.strokeStyle = '#c89a4a'; g.lineWidth = 4; g.strokeRect(10, 10 + j * 62, 236, 56); g.fillStyle = '#2e4a5a'; g.beginPath(); g.moveTo(128, 18 + j * 62); g.lineTo(150, 38 + j * 62); g.lineTo(128, 60 + j * 62); g.lineTo(106, 38 + j * 62); g.fill(); }
      for (let i = 0; i < 1500; i++) { g.fillStyle = `rgba(0,0,0,${r() * 0.15})`; g.fillRect(r() * 256, r() * 512, 2, 2); } const t2 = new THREE.CanvasTexture(c); t2.colorSpace = THREE.SRGBColorSpace;
      const cm = add(new THREE.Mesh(new THREE.PlaneGeometry(M.w - 4, M.d - 3).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ map: t2, roughness: 1 })), false); cm.position.set(M.x + 0.8, f + 0.12, M.z + 0.5); }
    bx(GEO.dark, 1.6, 2.6, 0.3, M.x + 2, f + 1.4, Z1 - t - 0.05); bx(GEO.wood[2], 1.0, 2.2, 2.6, M.x + 4.5, f + 1.1, Z1 - t - 1.4); wallBox(M.x + 4, M.x + 5, Z1 - t - 2.7, Z1 - t, f, f + 2.2);
    // upstairs: the partition round the MG room at the front (its door facing the stair's side), the MG on its tripod in the window, sandbags
    const PX = M.x + 3.2, RZ0 = M.z - 4.5, RZ1 = M.z + 4.5;
    run('z', PX, RZ0, RZ1, u, RF, [[M.z - 2.6, 1.1, u, u + 2.2]]); run('x', RZ0, PX, X1 - t, u, RF, []); run('x', RZ1, PX, X1 - t, u, RF, []);
    const sbM = new THREE.MeshStandardMaterial({ color: 0xa99a73, roughness: 1 }); for (let k = -3; k <= 3; k++) { const s = add(new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.32, 0.5), sbM)); s.position.set(X1 - 0.35, u + 1.1, M.z + k * 0.5); s.rotation.y = (k % 2) * 0.1; }
    const MG = new THREE.Group(), mgM = new THREE.MeshStandardMaterial({ color: 0x2a2b26, roughness: 0.55, metalness: 0.6 }); MG.add(new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.16, 0.14), mgM)); const br = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.9, 8).rotateZ(Math.PI / 2), mgM); br.position.x = 0.8; MG.add(br);
    const bt = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.14, 0.1), new THREE.MeshStandardMaterial({ color: 0x5a3a20, roughness: 0.8 })); bt.position.x = -0.5; MG.add(bt); for (const a of [0, 2.1, 4.2]) { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 1.0, 5), mgM); l.position.set(0.15 + Math.cos(a) * 0.25, -0.42, Math.sin(a) * 0.25); l.rotation.set(Math.sin(a) * 0.35, 0, -Math.cos(a) * 0.35); MG.add(l); }
    MG.position.set(X1 - 1.1, u + 1.35, M.z); add(MG); wallBox(X1 - 1.5, X1 - 0.6, M.z - 0.4, M.z + 0.4, u, u + 1.4);
    // the dome on its drum, the minaret, the courtyard wall
    const drum = add(new THREE.Mesh(new THREE.CylinderGeometry(4.6, 4.6, 1.4, 32), LIME)); drum.position.set(M.x - 1.2, RF + 1.0, M.z); { const c = new Float32Array(drum.geometry.attributes.position.count * 3).fill(1); drum.geometry.setAttribute('color', new THREE.BufferAttribute(c, 3)); }
    const dk = 9.2 / 1.64, dg = mdlGeo('dome')[0], dm = add(new THREE.Mesh(dg.g, mdlMats('dome', { color: 0xf2ece0 }, 'mq')[dg.m])); dm.scale.set(dk, dk * 0.95, dk); dm.position.set(M.x - 1.2, RF + 1.7, M.z);
    const mx = X0 - 1.2, mz = Z0 - 1.2; for (const [r0, r1, h, yy] of [[1.35, 1.45, 3.5, RF - 1.75], [1.1, 1.25, 14, RF + 7], [1.75, 1.6, 0.45, RF + 14.2], [0.85, 0.95, 3.2, RF + 16]]) { const g = new THREE.CylinderGeometry(r0, r1, h, 16); g.translate(mx, yy, mz); const c = new Float32Array(g.attributes.position.count * 3).fill(1); g.setAttribute('color', new THREE.BufferAttribute(c, 3)); GEO.lime.push(g); }
    { const g = new THREE.CylinderGeometry(1.4, 1.5, F2 - y0, 16); g.translate(mx, (F2 + y0) / 2, mz); const c = new Float32Array(g.attributes.position.count * 3).fill(1); g.setAttribute('color', new THREE.BufferAttribute(c, 3)); GEO.lime.push(g); wallBox(mx - 1.5, mx + 1.5, mz - 1.5, mz + 1.5); }
    const cap = add(new THREE.Mesh(new THREE.ConeGeometry(1.0, 3.2, 16), new THREE.MeshStandardMaterial({ color: 0x8f9a8a, roughness: 0.6, metalness: 0.3 }))); cap.position.set(mx, RF + 19.2, mz);
    for (const [xa, xb, za, zb] of [[X0 - 7, X0 - 6.5, Z0 + 2, Z1], [X0 - 7, X0, Z1 + 1.5, Z1 + 2]]) { bx(GEO.mud, xb - xa, 2.4, zb - za, (xa + xb) / 2, y0 + 1.1, (za + zb) / 2, 0, [0.95, 0.9, 0.82]); wallBox(xa, xb, za, zb); }
    // the green door and the shutters of the front, the side doors
    bx(GEO.wood[1], 0.08, 3.1, 2.3, X1 + 0.02, f + 1.55, M.z); for (const zc of [Z1, Z0]) bx(GEO.wood[0], 1.3, 2.3, 0.06, M.x - 3 + 0.9, f + 1.15, zc + (zc > M.z ? 0.35 : -0.35), 0.9);
    // the plaque over the front door and the testimony over the MG window
    { const at = (s, out) => [X1 + out, M.z - s]; decal(at, 0, f + 3.85, 3.4, Math.PI / 2, 6, 0.06); decal(at, 0, u + 3.0, 4.2, Math.PI / 2, 7, 0.06); decal(at, 0, f + 4.6, 3.6, Math.PI / 2, 13, 0.06); }
    return { M, y0, f, u, F2, RF, X0, X1, Z0, Z1, t, PX, SX0, SX1, SZ0, SZ1, mgObj: MG, mg: [X1 - 1.6, M.z], door: [M.x - 3, Z1] };
  })();
  // ---- everything above built into one mesh per material ----
  for (const [k, mat] of [['mud', MUD], ['lime', LIME], ['dark', DARKIN], ['straw', STRAW], ['stalk', STALK], ['clay', CLAY], ['frond', FROND]]) {
    const list = GEO[k]; if (!list.length) continue; for (const g of list) { if (!g.attributes.color) { const c = new Float32Array(g.attributes.position.count * 3).fill(1); g.setAttribute('color', new THREE.BufferAttribute(c, 3)); } if (g.index) continue; }
    const geo = mergeGeometries(list.map((g) => g.index ? g : g), false); if (k !== 'mud' && k !== 'lime') mat.vertexColors = false; add(new THREE.Mesh(geo, mat)); }
  GEO.wood.forEach((list, i) => { if (list.length) add(new THREE.Mesh(mergeGeometries(list.map((g) => { g.deleteAttribute('color'); return g; })), WOOD[i])); });
  if (DECALS.length) add(new THREE.Mesh(mergeGeometries(DECALS), AR_MAT), false);
  // the little concrete bridge over the sweet-water canal
  { const CM = new THREE.MeshStandardMaterial({ color: 0xa8a294, roughness: 0.95 }); const b = add(new THREE.Mesh(boxUV(22, 0.5, 7), CM)); b.position.set(SWC, 1.75, SB_Z); for (const s of [-1, 1]) { const w = add(new THREE.Mesh(boxUV(22, 0.7, 0.3), CM)); w.position.set(SWC, 2.3, SB_Z + s * 3.35); } }
  const BRIDGES = (x, z) => { if (Math.abs(z - RB_Z) < 2.5) { const y = DECK_Y(x); if (y != null) return y; } if (Math.abs(z - PB_Z) < 2.2 && x > CAN0 - 4 && x < CAN1 + 4) return PB_DECK + 0.07; if (Math.abs(z - SB_Z) < 3.3 && Math.abs(x - SWC) < 11) return 2.0; return null; };
  // ---------- the dirt roads: two ruts, tyre marks, sand blown to their edges ----------
  function dirtTex() { const W = 256, H = 512, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d'), r = rng(77);
    const g = x.createLinearGradient(0, 0, W, 0); g.addColorStop(0, 'rgba(176,154,118,0)'); g.addColorStop(0.12, 'rgba(176,154,118,1)'); g.addColorStop(0.88, 'rgba(176,154,118,1)'); g.addColorStop(1, 'rgba(176,154,118,0)'); x.fillStyle = g; x.fillRect(0, 0, W, H);
    for (let i = 0; i < 3000; i++) { const px = W * (0.1 + 0.8 * r()), v = (r() - 0.5) * 40; x.fillStyle = `rgba(${150 + v},${130 + v},${98 + v},0.35)`; x.fillRect(px, r() * H, 1 + r() * 4, 1 + r() * 4); }
    for (const cx of [0.3, 0.7]) { for (let y = 0; y < H; y += 2) { x.fillStyle = `rgba(108,92,68,${0.35 + 0.2 * Math.sin(y * 0.3)})`; x.fillRect(W * cx - 12 + Math.sin(y * 0.05) * 3, y, 24, 2); } for (let y = 0; y < H; y += 6) { x.fillStyle = 'rgba(80,66,48,0.35)'; x.fillRect(W * cx - 10, y, 20, 2); } }
    x.fillStyle = 'rgba(190,170,130,0.5)'; for (let i = 0; i < 400; i++) x.fillRect(W * (0.42 + 0.16 * r()), r() * H, 2, 2);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = THREE.ClampToEdgeWrapping; t.wrapT = THREE.RepeatWrapping; t.anisotropy = ANISO; return t; }
  const DIRT = new THREE.MeshStandardMaterial({ map: dirtTex(), transparent: true, roughness: 1, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
  function densify(pts, step) { const out = []; for (let i = 0; i < pts.length - 1; i++) { const [ax, az] = pts[i], [bx, bz] = pts[i + 1], L = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.ceil(L / step)); for (let k = 0; k < n; k++) out.push([lerp(ax, bx, k / n), lerp(az, bz, k / n)]); } out.push(pts[pts.length - 1]); return out; }
  for (const R of ROADS) { const d = densify(R.p, 2), pos = [], uv = [], idx = []; let acc = 0;
    for (let i = 0; i < d.length; i++) { const a = d[Math.max(0, i - 1)], b = d[Math.min(d.length - 1, i + 1)], dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz) || 1, nx = -dz / L, nz = dx / L; if (i) acc += Math.hypot(d[i][0] - d[i - 1][0], d[i][1] - d[i - 1][1]);
      for (const s of [0, 1]) { const o = (s - 0.5) * R.w * 1.12, x = d[i][0] + nx * o, z = d[i][1] + nz * o; pos.push(x, (BRIDGES(x, z) ?? height(x, z)) + 0.05, z); uv.push(s, acc / (R.w * 2.2)); }
      if (i) { const k = (i - 1) * 2; idx.push(k, k + 2, k + 1, k + 1, k + 2, k + 3); } }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); const m = new THREE.Mesh(g, DIRT); m.receiveShadow = true; m.renderOrder = 1; ROOT.add(m); }

  /* ---------- the fences round the fields: the scanned wooden fence, a section every 1.66 m, a gap for the gate; the scan near you, a
     plain post and two rails further off ---------- */
  const FENCE = [], FCH = 30;
  { const sec = 1.66, put = (ax, az, bx, bz, gate) => { const L = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.round(L / sec)), sx = L / (n * sec), ry = Math.atan2(-(bz - az), bx - ax), g0 = gate ? n / 2 - 2 : -9, r = rng(Math.round(ax * 7 + az * 13));
      for (let k = 0; k < n; k++) { if (k >= g0 && k < g0 + 3) continue; const t = k / n, x = lerp(ax, bx, t), z = lerp(az, bz, t), lean = (r() - 0.5) * 0.05; FENCE.push(M4(x, height(x, z) - 0.05, z, ry, sx, 0.95 + r() * 0.1, 1, lean, 0)); } };
    for (const P of PLOTS) { const e = [[P.x0, P.z0, P.x1, P.z0], [P.x1, P.z0, P.x1, P.z1], [P.x1, P.z1, P.x0, P.z1], [P.x0, P.z1, P.x0, P.z0]]; e.forEach((q, i) => put(q[0] + (q[2] > q[0] ? 1 : q[2] < q[0] ? -1 : 0) * 0, q[1], q[2], q[3], i === P.gate)); }
    for (const O of ORCH) put(O.x1, O.z0, O.x1, O.z1, true); }
  const fenceChunks = (() => { const groups = new Map(), p = V3(); for (const M of FENCE) { p.setFromMatrixPosition(M); const k = Math.floor(p.x / FCH) + ',' + Math.floor(p.z / FCH); if (!groups.has(k)) groups.set(k, { x: 0, z: 0, l: [] }); const g = groups.get(k); g.x += p.x; g.z += p.z; g.l.push(M); }
    const mats = mdlMats('fence'), farG = mergeGeometries([new THREE.BoxGeometry(0.1, 1.15, 0.1).translate(0, 0.575, 0), new THREE.BoxGeometry(1.66, 0.09, 0.04).translate(0.83, 0.95, 0), new THREE.BoxGeometry(1.66, 0.09, 0.04).translate(0.83, 0.5, 0)]), farM = new THREE.MeshStandardMaterial({ color: 0x8a7a64, roughness: 0.95 }), out = [];
    for (const g of groups.values()) { const c = { x: g.x / g.l.length, z: g.z / g.l.length, hi: [], lo: [] }; for (const part of mdlGeo('fence', LITE ? 1 : 0)) c.hi.push(instOf(part.g, mats[part.m], g.l)); c.lo.push(instOf(farG, farM, g.l, false)); out.push(c); } return out; })();
  function fenceLod() { const cp = CAML; for (const c of fenceChunks) { const h = Math.hypot(cp.x - c.x, cp.z - c.z) < (LITE ? 40 : 70); if (c.h === h) continue; c.h = h; for (const m of c.hi) m.visible = h; for (const m of c.lo) m.visible = !h; } }

  /* ================= the trees, as pictures only. Each kind is built once from the scanned branches (Desert Acacia: four cut branches on
     one sheet) on a trunk of its own, photographed from eight sides into one sheet, and drawn as a picture that turns to face you, the side
     it shows chosen by where you stand ================= */
  const KINDS = [
    { name: 'eucalyptus', H: 19, W: 11, rowH: 1.5, trunkH: 9, trunkR: 0.27, bark: 0xd8cdb8, cards: 420, crown: [0, 12.5, 0], cr: [4.2, 6.2, 4.2], size: [1.6, 2.6], tint: [0.62, 0.78, 0.55] },
    { name: 'mango', H: 10.5, W: 11, rowH: 1, trunkH: 1.9, trunkR: 0.3, bark: 0x4f4232, cards: 820, crown: [0, 5.4, 0], cr: [4.8, 3.9, 4.8], size: [1.7, 2.6], tint: [0.42, 0.6, 0.34] },
    { name: 'citrus', H: 4.6, W: 4.6, rowH: 1, trunkH: 0.9, trunkR: 0.11, bark: 0x55493a, cards: 330, crown: [0, 2.3, 0], cr: [1.95, 1.8, 1.95], size: [0.75, 1.05], tint: [0.5, 0.66, 0.4], fruit: 70 },
  ];
  /* bark, painted: eucalyptus smooth and pale, shedding in patches of grey, cream and olive with long vertical streaks; mango and citrus dark
     and furrowed. The same picture, greyed, is its bump. */
  function barkTex(kind) { const W = 256, H = 512, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d'), r = rng(kind === 'eucalyptus' ? 11 : 23);
    if (kind === 'eucalyptus') { x.fillStyle = '#d9d1bf'; x.fillRect(0, 0, W, H);
      for (let i = 0; i < 70; i++) { const px = r() * W, py = r() * H, w = 14 + r() * 60, h = 30 + r() * 160, col = ['#b9b29c', '#9c9a86', '#c8bb9a', '#8f957a', '#e4dccb', '#a69476'][Math.floor(r() * 6)]; x.fillStyle = col; x.globalAlpha = 0.55 + r() * 0.4; for (const dx of [0, -W, W]) { x.beginPath(); x.ellipse(px + dx, py, w / 2, h / 2, 0, 0, 7); x.fill(); } }
      x.globalAlpha = 1; for (let i = 0; i < 260; i++) { x.strokeStyle = `rgba(${90 + r() * 60},${86 + r() * 50},${70 + r() * 40},${0.12 + r() * 0.25})`; x.lineWidth = 0.6 + r() * 1.6; const px = r() * W; x.beginPath(); x.moveTo(px, r() * H); x.lineTo(px + (r() - 0.5) * 6, r() * H); x.stroke(); }
      for (let i = 0; i < 30; i++) { x.strokeStyle = 'rgba(120,96,70,0.5)'; x.lineWidth = 1; const px = r() * W, py = r() * H; x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + 8, py + 12, px + (r() - 0.5) * 20, py + 30); x.stroke(); } }
    else { x.fillStyle = kind === 'mango' ? '#4a3d2f' : '#57493a'; x.fillRect(0, 0, W, H);
      for (let i = 0; i < 38; i++) { let px = r() * W; x.strokeStyle = 'rgba(22,16,10,0.75)'; x.lineWidth = 2 + r() * 4; x.beginPath(); x.moveTo(px, 0); for (let y = 0; y <= H; y += 16) { px += (r() - 0.5) * 8; x.lineTo(px, y); } x.stroke(); }
      for (let i = 0; i < 900; i++) { x.fillStyle = r() < 0.5 ? `rgba(120,104,84,${0.2 + r() * 0.3})` : `rgba(30,24,16,${0.2 + r() * 0.3})`; x.fillRect(r() * W, r() * H, 3 + r() * 10, 2 + r() * 5); }
      for (let i = 0; i < 25; i++) { x.fillStyle = `rgba(${110 + r() * 40},${120 + r() * 30},80,0.35)`; x.beginPath(); x.ellipse(r() * W, r() * H, 6 + r() * 16, 4 + r() * 10, 0, 0, 7); x.fill(); } }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = ANISO;
    const b = document.createElement('canvas'); b.width = W; b.height = H; const bx = b.getContext('2d'); bx.filter = 'grayscale(1) contrast(1.4)'; bx.drawImage(c, 0, 0); const bt = new THREE.CanvasTexture(b); bt.wrapS = bt.wrapT = THREE.RepeatWrapping; return { map: t, bump: bt }; }
  const BARK = {};
  const VAR = 2, AZ = 8, FW = LITE ? 192 : 384;
  function buildTree(K, seed) {
    const r = rng(seed), grp = new THREE.Group(), lean = (r() - 0.5) * 0.12;
    // the trunk and a few limbs out into the crown
    const bark = new THREE.MeshStandardMaterial({ map: mdlTex('cross/bark/map'), bumpMap: mdlTex('cross/bark/bump', false), bumpScale: 1.4, roughness: 0.95, vertexColors: true, color: new THREE.Color().setRGB(0.66, 0.64, 0.6) }); const limbs = [];
    const th = K.trunkH + K.cr[1] * 0.5, tg = new THREE.CylinderGeometry(K.trunkR * 0.38, K.trunkR, th + 0.35, 20, Math.max(8, Math.round(th / 0.3))).translate(0, -0.175, 0); { const uv = tg.attributes.uv, p = tg.attributes.position; for (let i = 0; i < uv.count; i++) { uv.setXY(i, uv.getX(i) * Math.max(1, Math.round(K.trunkR * 6.28 / 0.7)), uv.getY(i) * th / 1.25); const a = Math.atan2(p.getZ(i), p.getX(i)), yb = p.getY(i) + th / 2, fl = Math.max(0, 1 - (yb + 0.35) / 1.0), lobe = Math.pow(Math.max(0, Math.cos(a * 5 + seed)), 2); const k = 1 + 0.07 * Math.sin(a * 3 + p.getY(i) * 0.7) + 0.04 * Math.sin(a * 7) + fl * fl * (0.55 + 0.9 * lobe); p.setX(i, p.getX(i) * k + Math.sin((p.getY(i) / th + 0.5) * 2.4 + seed) * 0.16 * (p.getY(i) / th + 0.5)); p.setZ(i, p.getZ(i) * k + Math.sin((p.getY(i) / th + 0.5) * 1.7 + seed * 0.7) * 0.12 * (p.getY(i) / th + 0.5)); } }
    { const p = tg.attributes.position, c = new Float32Array(p.count * 3); for (let i = 0; i < p.count; i++) { const t = smooth(-0.35, 0.75, p.getY(i) + th / 2); c.set([lerp(0.55, 1, t), lerp(0.46, 1, t), lerp(0.36, 1, t)], i * 3); } tg.setAttribute('color', new THREE.BufferAttribute(c, 3)); }
    limbs.push(tg.translate(0, th / 2, 0).rotateZ(lean));
    const nl = K.name === 'eucalyptus' ? 5 : 6; for (let i = 0; i < nl; i++) { const a = r() * 6.28, L = K.cr[0] * (0.6 + r() * 0.4), g = new THREE.CylinderGeometry(K.trunkR * 0.18, K.trunkR * 0.45, L, 8); { const uv = g.attributes.uv; for (let k = 0; k < uv.count; k++) uv.setXY(k, uv.getX(k), uv.getY(k) * L / 1.25); } g.translate(0, L / 2, 0); g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 3).fill(1), 3)); g.rotateZ(0.6 + r() * 0.5); g.rotateY(a); g.translate(0, K.trunkH * (0.85 + r() * 0.3), 0); limbs.push(g); }
    grp.add(new THREE.Mesh(mergeGeometries(limbs), bark));
    // the leaves: cards cut from the branch sheet, their stems toward the inside of the crown, more of them on the outside
    const cards = [], q = new THREE.Quaternion(), up = V3(0, 1, 0);
    for (let i = 0; i < K.cards; i++) { const u = r() * 2 - 1, th = r() * 6.28, rr = Math.pow(r(), 0.35), s = Math.sqrt(1 - u * u); let d = V3(s * Math.cos(th), u, s * Math.sin(th));
      if (K.name === 'eucalyptus') { d.y = u * 1.2; d.x *= 0.8 + 0.6 * vn(i * 0.3, 1); }
      const p = V3(K.crown[0] + d.x * K.cr[0] * rr, K.crown[1] + d.y * K.cr[1] * rr, K.crown[2] + d.z * K.cr[2] * rr); p.x += lean * (p.y); if (p.y < K.trunkH * 0.9) continue;
      const out = V3(p.x, (p.y - K.crown[1]) * 0.6 + 0.5, p.z).normalize(), sz = lerp(K.size[0], K.size[1], r()), quad = Math.floor(r() * 4);
      const g = new THREE.PlaneGeometry(sz, sz).translate(0, sz * 0.42, 0); const uv = g.attributes.uv; for (let k = 0; k < uv.count; k++) uv.setXY(k, (quad % 2) * 0.5 + uv.getX(k) * 0.5, (quad > 1 ? 0 : 0.5) + uv.getY(k) * 0.5);
      q.setFromUnitVectors(up, out.lerp(V3(0, 1, 0), K.name === 'eucalyptus' ? 0.15 : 0.35).normalize()); g.applyQuaternion(new THREE.Quaternion().setFromAxisAngle(up, r() * 6.28).premultiply(q)); g.translate(p.x - out.x * sz * 0.25, p.y - out.y * sz * 0.25, p.z - out.z * sz * 0.25); cards.push(g); }
    const lm = new THREE.MeshStandardMaterial({ map: mdlTex('cross/branch/map'), alphaMap: mdlTex('cross/branch/alpha', false), alphaTest: 0.45, side: THREE.DoubleSide, roughness: 0.85, color: new THREE.Color().setRGB(...K.tint) });
    grp.add(new THREE.Mesh(mergeGeometries(cards), lm));
    if (K.fruit) { const fm = new THREE.MeshStandardMaterial({ color: 0xe0901c, roughness: 0.6 }), fr = []; for (let i = 0; i < K.fruit; i++) { const th = r() * 6.28, u = r() * 1.6 - 0.8, s = Math.sqrt(1 - u * u); fr.push(new THREE.SphereGeometry(0.06, 6, 5).translate(K.crown[0] + s * Math.cos(th) * K.cr[0] * 0.95, K.crown[1] + u * K.cr[1] * 0.9, K.crown[2] + s * Math.sin(th) * K.cr[2] * 0.95)); } grp.add(new THREE.Mesh(mergeGeometries(fr), fm)); }
    return grp;
  }
  // the sheet: a row per kind and variant (its height in frames by the kind's shape), eight frames along each row
  const ROWS = []; { let y = 0; for (let k = 1; k < KINDS.length; k++) for (let v = 0; v < VAR; v++) { const h = Math.round(FW * KINDS[k].H / KINDS[k].W); ROWS.push({ k, v, y, h }); y += h; } }
  const ATH = ROWS.reduce((a, r) => a + r.h, 0), ATW = FW * AZ;
  const atlas = new THREE.WebGLRenderTarget(ATW, ATH, { generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter, magFilter: THREE.LinearFilter, anisotropy: ANISO });
  async function bakeTrees() {
    await Promise.all([texReady(mdlTex('cross/branch/map')), texReady(mdlTex('cross/branch/alpha', false)), texReady(mdlTex('cross/bark/map')), texReady(mdlTex('cross/bark/bump', false))]);
    const bs = new THREE.Scene(); bs.add(new THREE.HemisphereLight(0xe8eef4, 0x6a5a40, 1.15)); const key = new THREE.DirectionalLight(0xfff2dc, 1.6); key.position.set(0.3, 1, 0.2); bs.add(key);
    const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 200), tm = renderer.toneMapping, cc0 = renderer.getClearColor(new THREE.Color()), ca0 = renderer.getClearAlpha(), rt0 = renderer.getRenderTarget(); renderer.toneMapping = THREE.NoToneMapping;
    renderer.setRenderTarget(atlas); renderer.setClearColor(0x55603e, 0); renderer.clear(); atlas.scissorTest = true;
    for (const R of ROWS) { const K = KINDS[R.k], t = buildTree(K, 1000 + R.k * 31 + R.v * 7); bs.add(t);
      cam.left = -K.W / 2; cam.right = K.W / 2; cam.bottom = -K.H / 2; cam.top = K.H / 2; cam.updateProjectionMatrix();
      for (let a = 0; a < AZ; a++) { const th = a / AZ * Math.PI * 2, el = 0.1; cam.position.set(Math.sin(th) * Math.cos(el) * 60, K.H / 2 + 60 * Math.sin(el), Math.cos(th) * Math.cos(el) * 60); cam.lookAt(0, K.H / 2, 0);
        atlas.viewport.set(a * FW, R.y, FW, R.h); atlas.scissor.set(a * FW, R.y, FW, R.h); renderer.setRenderTarget(atlas); renderer.render(bs, cam); }
      bs.remove(t); t.traverse((m) => { if (m.isMesh) { m.geometry.dispose(); m.material.dispose(); } }); }
    atlas.scissorTest = false; atlas.viewport.set(0, 0, ATW, ATH); renderer.setRenderTarget(rt0); renderer.setClearColor(cc0, ca0); renderer.toneMapping = tm;
  }
  // a picture that turns to you about its own vertical axis, showing the side of the tree that faces you
  function treeMat(depth) {
    const m = depth ? new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: atlas.texture, alphaTest: 0.5 }) : new THREE.MeshStandardMaterial({ map: atlas.texture, alphaTest: 0.5, roughness: 0.9, side: THREE.DoubleSide });
    m.onBeforeCompile = (sh) => { sh.uniforms.uWind = WIND; sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute vec3 aRow; attribute float aYaw; uniform float uWind; vec3 bbW; vec2 bbUv;')
        .replace('#include <begin_vertex>', `vec3 c0 = (modelMatrix * instanceMatrix * vec4(0.0,0.0,0.0,1.0)).xyz; float sx = length(instanceMatrix[0].xyz), sy = length(instanceMatrix[1].xyz);
          vec3 tc = cameraPosition - c0; tc.y = 0.0; tc = normalize(tc + vec3(1e-4, 0.0, 0.0)); vec3 rt = vec3(tc.z, 0.0, -tc.x);
          bbW = c0 + rt * position.x * sx + vec3(0.0, 1.0, 0.0) * position.y * sy; { float ph = uWind * 1.3 + c0.x * 0.07 + c0.z * 0.05; bbW.xz += vec2(sin(ph), sin(ph * 1.27 + 1.0) * 0.5) * 0.22 * position.y * position.y * sy / 10.0; }
          float ang = atan(tc.x, tc.z) - aYaw; float fr = mod(floor(ang / 6.2831853 * ${AZ}.0 + 0.5), ${AZ}.0);
          bbUv = vec2((fr + uv.x) / ${AZ}.0, aRow.x + uv.y * aRow.y);
          vec3 transformed = vec3(0.0);`)
        .replace('#include <project_vertex>', 'vec4 mvPosition = viewMatrix * vec4(bbW, 1.0); gl_Position = projectionMatrix * mvPosition;')
        .replace('#include <worldpos_vertex>', 'vec4 worldPosition = vec4(bbW, 1.0);')
        .replace('#include <beginnormal_vertex>', 'vec3 objectNormal = vec3(0.0, 1.0, 0.0);');
      sh.vertexShader = sh.vertexShader.replace(/void main\(\) \{/, 'void main() {').replace('#include <uv_vertex>', '#include <uv_vertex>');
      sh.vertexShader = sh.vertexShader.replace('#include <fog_vertex>', '#include <fog_vertex>\n#ifdef USE_MAP\nvMapUv = bbUv;\n#endif');
      if (depth) sh.vertexShader = sh.vertexShader.replace('#include <clipping_planes_vertex>', '#include <clipping_planes_vertex>\n#ifdef USE_MAP\nvMapUv = bbUv;\n#endif');
    };
    m.customProgramCacheKey = () => 'tree' + (depth ? 'd' : '');
    return m;
  }
  const EUC = [];
  function plantTrees() {
    const list = []; const r = rng(42);
    const put = (x, z, k, s = 1) => list.push([x, z, k, Math.floor(r() * VAR), s * (0.85 + r() * 0.3), r() * 6.28]);
    // eucalyptus rows: both sides of the road from the bridges and along both banks of the sweet-water canal, a gap here and there
    for (const R of ROADS) if (R.trees) { const d = densify(R.p, 1); for (let i = 0; i < d.length - 1; i += R.trees === 2 ? 11 : 9) { const [ax, az] = d[i], [bx, bz] = d[Math.min(d.length - 1, i + 1)], L = Math.hypot(bx - ax, bz - az) || 1, nx = -(bz - az) / L, nz = (bx - ax) / L;
      for (const s of R.trees === 2 ? [R.p[0][0] < SWC ? -1 : 1] : [-1, 1]) { if (r() < 0.12) continue; const x = ax + nx * s * (R.w * 0.5 + 1.8), z = az + nz * s * (R.w * 0.5 + 1.8); if (x > RAMP - 12) continue; if (Math.abs(x - SWC) < 9 && Math.abs(z - SB_Z) < 6) continue; EUC.push([x, z, 0.85 + r() * 0.3, r() * 6.28, Math.floor(r() * 3)]); } } }
    // the orchards: mango (rows of 9 m) and citrus (rows of 5 m), planted in their grid
    for (const O of ORCH) { const sp = O.kind === 1 ? 7 : 4.8; for (let x = O.x0 + sp / 2; x < O.x1; x += sp) for (let z = O.z0 + sp / 2; z < O.z1; z += sp) { if (r() < 0.04) continue; put(x + (r() - 0.5) * 0.8, z + (r() - 0.5) * 0.8, O.kind); } }
    const geo = new THREE.PlaneGeometry(1, 1).translate(0, 0.5, 0); geo.setAttribute('aRow', new THREE.InstancedBufferAttribute(new Float32Array(list.length * 3), 3)); geo.setAttribute('aYaw', new THREE.InstancedBufferAttribute(new Float32Array(list.length), 1));
    const im = new THREE.InstancedMesh(geo, treeMat(false), list.length); im.customDepthMaterial = treeMat(true); const aR = geo.attributes.aRow, aY = geo.attributes.aYaw;
    list.forEach(([x, z, k, v, s, yaw], i) => { const K = KINDS[k], R = ROWS.find((q) => q.k === k && q.v === v); im.setMatrixAt(i, M4(x, height(x, z) - 0.1, z, 0, K.W * s, K.H * s, 1)); aR.setXYZ(i, R.y / ATH, R.h / ATH, 0); aY.setX(i, yaw); });
    im.frustumCulled = false; im.castShadow = SHADOWS; im.receiveShadow = SHADOWS; ROOT.add(im);
    // the eucalyptus: the trees themselves, three of them built and each planted many times; the leaves move in the wind above the trunk
    const K = KINDS[0];
    for (let v = 0; v < 3; v++) { const mine = EUC.filter((e) => e[4] === v); if (!mine.length) continue; const t = buildTree(K, 500 + v * 13), mats = mine.map(([x, z, s, ry]) => M4(x, height(x, z) - 0.15, z, ry, s, s, s));
      t.children.forEach((c, ci) => { const ms = c.material; if (ci === 1) { ms.onBeforeCompile = (sh) => { sh.uniforms.uWind = WIND; sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nuniform float uWind;').replace('#include <begin_vertex>', '#include <begin_vertex>\n' + windSway(0.55, K.trunkH * 0.8, K.H - K.trunkH)); }; ms.customProgramCacheKey = () => 'eucLeaf';
          const dm = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, alphaMap: ms.alphaMap, alphaTest: 0.45 }); dm.onBeforeCompile = ms.onBeforeCompile; dm.customProgramCacheKey = () => 'eucLeafD'; const im2 = instOf(c.geometry, ms, mats); im2.customDepthMaterial = dm; }
        else instOf(c.geometry, ms, mats); }); }
    { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'), g = x.createRadialGradient(64, 64, 4, 64, 64, 64); g.addColorStop(0, 'rgba(0,0,0,0.62)'); g.addColorStop(0.35, 'rgba(0,0,0,0.38)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128);
      const am = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3, fog: true }), ms = [];
      for (const [x0, z0, s] of EUC) ms.push(M4(x0, height(x0, z0) + 0.04, z0, 0, 3.2 * s, 1, 3.2 * s));
      for (const [x0, z0, k, v, s] of list) ms.push(M4(x0, height(x0, z0) + 0.04, z0, 0, (k === 1 ? 5.5 : 2.6) * s, 1, (k === 1 ? 5.5 : 2.6) * s));
      const ao = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), am, ms.length); ms.forEach((M, i) => ao.setMatrixAt(i, M)); ao.computeBoundingSphere(); ao.renderOrder = 2; ROOT.add(ao); }
    return list.length + EUC.length;
  }
  /* ---------- the green: clumps of grass, blade by blade, wherever the ground is not road, field, bridge or water; laid in 20 m tiles and
     drawn only near you (on the far ground the green is the ground's own colour) ---------- */
  const inPlotXZ = (x, z, pad = 0) => PLOTS.some((P) => x > P.x0 - pad && x < P.x1 + pad && z > P.z0 - pad && z < P.z1 + pad);
  const TILES = [];
  function tileLayer(geo, mat, per, ok, scl, near) { const r = rng(Math.round(per * 977) + TILES.length), T = 20;
    for (let tx = X0; tx < X1; tx += T) for (let tz = Z0; tz < Z1; tz += T) { const ms = [], n = Math.round(T * T * per);
      for (let i = 0; i < n; i++) { const x = tx + r() * T, z = tz + r() * T; if (!ok(x, z)) continue; const s = scl(r); ms.push(M4(x, height(x, z) - 0.03, z, r() * 6.28, s[0], s[1], s[0])); }
      if (!ms.length) continue; const im = new THREE.InstancedMesh(geo, mat, ms.length); ms.forEach((M, i) => im.setMatrixAt(i, M)); im.computeBoundingSphere(); im.receiveShadow = true; im.castShadow = false; im.visible = false; ROOT.add(im); TILES.push({ im, x: tx + T / 2, z: tz + T / 2, near }); } }
  { // the wheat: crossed pictures of the scanned clumps (eight of them on the sheet), thick in every field, its heads moving in the wind
    const parts = []; for (let k = 0; k < 8; k++) { const col = k % 4, row = k < 4 ? 1 : 0; for (const ry of [0, Math.PI / 2]) { const g = new THREE.PlaneGeometry(0.62, 0.95).translate(0, 0.475, 0); const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, (col + uv.getX(i)) * 0.25, (row + uv.getY(i)) * 0.5); g.rotateY(ry); parts.push(g); } }
    const geos = [0, 1, 2, 3, 4, 5, 6, 7].map((k) => mergeGeometries([parts[k * 2], parts[k * 2 + 1]]));
    const wm = new THREE.MeshStandardMaterial({ map: mdlTex('cross/wheat/map'), alphaMap: mdlTex('cross/wheat/alpha', false), alphaTest: 0.3, alphaToCoverage: true, side: THREE.DoubleSide, roughness: 0.85, color: new THREE.Color().setRGB(1.0, 0.93, 0.66) });
    wm.onBeforeCompile = (sh) => { sh.uniforms.uWind = WIND; sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nuniform float uWind;').replace('#include <beginnormal_vertex>', 'vec3 objectNormal = vec3(0.0, 1.0, 0.0);').replace('#include <begin_vertex>', '#include <begin_vertex>\n' + windSway(0.16, 0.1, 0.85)); }; wm.customProgramCacheKey = () => 'wheat';
    for (const g of geos) tileLayer(g, wm, (LITE ? 2.6 : 6.5) / 8, (x, z) => inPlotXZ(x, z, -0.6), (r) => { const s = 1.05 + r() * 0.5; return [s, s * (0.9 + r() * 0.35)]; }, LITE ? 90 : 180);
  }
  function tilesLod() { const cp = CAML; for (const t of TILES) { const d = Math.hypot(cp.x - t.x, cp.z - t.z), v = d < t.near; if (t.im.visible !== v) t.im.visible = v; if (v && t.mid) { const g = d < t.fullR ? t.full : t.mid; if (t.im.geometry !== g) t.im.geometry = g; } } }

  // ---------- the bits around: a few hay stacks, a cart, poles ----------
  { const HM = new THREE.MeshStandardMaterial({ color: 0xc8b070, roughness: 1 }); for (const [x, z] of [[-60, -100], [-75, 90], [10, -120]]) { const y = height(x, z); add(new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.6, 1.8, 14), HM)).position.set(x, y + 0.9, z); add(new THREE.Mesh(new THREE.ConeGeometry(1.5, 1.0, 14), HM)).position.set(x, y + 2.3, z); } }

  /* ---------- the ground: the game's grid out to the horizon, coloured and shaded as on the test page (soil on the west bank, sand on the
     rampart and the east bank, damp at the water) ---------- */
  const inPlotG = (x, z) => PLOTS.some((P) => x > P.x0 - 0.5 && x < P.x1 + 0.5 && z > P.z0 - 0.5 && z < P.z1 + 0.5);
  const GR = makeGround({ x0: ox + X0 - 30, x1: ox + X1 + 30, z0: oz + Z0 - 30, z1: oz + Z1 + 30, step: 2, h: (x, z) => height(x - ox, z - oz) });
  { const g = GR.mesh.geometry, p = g.attributes.position, col = g.attributes.color, soil = new Float32Array(p.count), c = new THREE.Color();
    for (let i = 0; i < p.count; i++) { const x = p.getX(i) - ox, z = p.getZ(i) - oz, y = p.getY(i), n = fbm(x / 25, z / 25), sandy = Math.max(smooth(RAMP - 12, RAMP + 4, x), smooth(0.2, -2, y)), wet = smooth(1.0, 0.0, y) * (1 - smooth(-3, 0, y)), inPlot = inPlotG(x, z);
      let r = inPlot ? lerp(0.6, 0.52, n) : lerp(0.56, 0.47, n), gg = inPlot ? lerp(0.52, 0.44, n) : lerp(0.47, 0.39, n), b = inPlot ? lerp(0.3, 0.24, n) : lerp(0.34, 0.27, n);
      r = lerp(r, lerp(0.86, 0.78, n), sandy); gg = lerp(gg, lerp(0.76, 0.68, n), sandy); b = lerp(b, lerp(0.57, 0.5, n), sandy); r = lerp(r, 0.42, wet * 0.6); gg = lerp(gg, 0.38, wet * 0.6); b = lerp(b, 0.3, wet * 0.6);
      c.setRGB(r, gg, b, THREE.SRGBColorSpace); col.setXYZ(i, c.r, c.g, c.b); soil[i] = 1 - sandy; }
    col.needsUpdate = true; g.setAttribute('aSoil', new THREE.BufferAttribute(soil, 1));
    const dS = mdlTex('cross/soil/det', false), dA = mdlTex('cross/sand/det', false), nS = mdlTex('cross/soil/nmap', false), nA = mdlTex('cross/sand/nmap', false);
    const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.97, normalMap: LITE ? null : nS, normalScale: new THREE.Vector2(0.45, 0.45) });
    m.onBeforeCompile = (sh) => { Object.assign(sh.uniforms, { dS: { value: dS }, dA: { value: dA }, nA: { value: nA } });
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute float aSoil; varying float vSoil; varying vec2 vW;').replace('#include <uv_vertex>', '#include <uv_vertex>\nvSoil = aSoil; vW = (modelMatrix * vec4(position,1.0)).xz;' + (LITE ? '' : ' vNormalMapUv = vW / 3.0;'));
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform sampler2D dS, dA, nA; varying float vSoil; varying vec2 vW;')
        .replace('#include <color_fragment>', '#include <color_fragment>\n{ vec3 a = texture2D(dS, vW / 3.0).rgb, b = texture2D(dA, vW / 4.0).rgb, f = texture2D(dA, vW / 37.0).rgb; diffuseColor.rgb *= mix(vec3(1.0), mix(b, a, vSoil) * 2.0, 0.55) * mix(vec3(1.0), f * 2.0, 0.3); }');
      if (!LITE) sh.fragmentShader = sh.fragmentShader.replace('#include <normal_fragment_maps>', 'vec3 mapN = mix(texture2D(nA, vNormalMapUv * 0.75).xyz, texture2D(normalMap, vNormalMapUv).xyz, vSoil) * 2.0 - 1.0; mapN.xy *= normalScale; normal = normalize(tbn * mapN);'); };
    m.customProgramCacheKey = () => 'crGround' + (LITE ? 'L' : ''); GR.mesh.material = m; GR.mesh.receiveShadow = SHADOWS; }
  GROUND = GR;
  /* ---------- into the game: what stops a man, a round or an eye (WALLS), what he stands on (SURF), where he takes cover ---------- */
  for (const B of WALLS) addCollider(ox + (B.x0 + B.x1) / 2, oz + (B.z0 + B.z1) / 2, Math.max(0.05, (B.x1 - B.x0) / 2), Math.max(0.05, (B.z1 - B.z0) / 2), 0, B.y1, B.y0);
  for (const S of SURF) { if (S.ramp) addRamp(ox + S.x0, ox + S.x1, oz + S.z0, oz + S.z1, 'z', oz + S.ramp[0], oz + S.ramp[1], S.ramp[2], S.ramp[3]); else addFloor(ox + S.x0, ox + S.x1, oz + S.z0, oz + S.z1, S.y()); }
  addFloor(ox + SWC - 11, ox + SWC + 11, oz + SB_Z - 3.3, oz + SB_Z + 3.3, 2.0);
  for (const s of [-1, 1]) addCollider(ox + SWC, oz + SB_Z + s * 3.35, 11, 0.15, 0, 2.65, 1.5);
  for (const H of HOUSES) coverBox(ox + H.x, oz + H.z, H.w / 2, H.d / 2, 0, 2.2);
  for (const p of PROPS) coverBox(ox + p.x + (p.along === 'x' ? 0.8 : 0), oz + p.z, p.along === 'x' ? 1.3 : 0.7, p.along === 'x' ? 0.6 : 1.2, 0, 1.0);
  onLayer1(ROOT);
  // the trees: photographed once the scanned branches have arrived, then planted
  CRM.ready = bakeTrees().then(() => { plantTrees(); onLayer1(ROOT); dimEnv(ROOT); }).catch((e) => console.error('trees', e));
  let lodT = 0;
  Object.assign(CRM, { built: true, ROOT, ground: GR, height, V, MQ, HOUSES, PROPS, ROADS, PLOTS, ORCH, RB, PB, PB_DECK, DECK_Y, BRIDGES, CAN0, CAN1, RAMP, SWC, RB_Z, PB_Z, SB_Z, X0, X1, Z0, Z1,
    upd(dt) { WIND.value += dt; CAML.set(camera.position.x - ox, camera.position.y, camera.position.z - oz); if ((lodT -= dt) <= 0) { lodT = 0.2; fenceLod(); tilesLod(); } } });
}
