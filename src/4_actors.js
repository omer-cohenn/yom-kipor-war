
/* ================= soldier rigs: smooth turned body parts, real proportions, period kit ================= */
function lathe(prof, segs = 16, sx = 1, sz = 1) { const g = new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(r, y)), segs); g.scale(sx, 1, sz); g.computeVertexNormals(); return g; }
function bootGeo() {
  const sh = [[0.07, -0.47], [-0.15, -0.47], [-0.185, -0.455], [-0.175, -0.42], [-0.11, -0.392], [-0.045, -0.372], [0.05, -0.36], [0.08, -0.39], [0.08, -0.45]];
  const g = G.ext(sh, 0.1); g.rotateY(Math.PI / 2); g.translate(-0.05, 0, 0); g.computeVertexNormals(); return g;
}
function rigGeos(side) {
  const F = side === 'f';
  // IDF 1973: olive "aleph" fatigues, sleeves rolled, US M1 helmet with net; Egyptian: sand-khaki drill, green helmet, chest rig
  const U = F ? 0x5d5c3e : 0x86744c, TR = F ? 0x55583a : 0x74663f, W = F ? 0x51543a : 0x5e5640, H = F ? 0x4f5638 : 0x46543b;
  const S = F ? 0xb08566 : 0x8e6446, SD = 0x2c2119, B = F ? 0x4a2c1c : 0x2a2420, MT = 0x3a3a36, CAN = 0x343a2a;
  // the neck, the nose and the ears are turned parts; the face itself is painted on the head (see faceTex)
  const head = [];
  const skin = build([
    [G.cyl(0.05, 0.057, 0.1, 12), S, M4(0, 0.535, 0.005)],
    ...[-1, 1].map((sd) => [G.sph(0.024, 10, 8), S, M4(sd * 0.09, 0.638, -0.004, 0, 0, sd * 0.15, 0.36, 1.05, 0.7)]),
  ]);
  // the helmet is its own shell (see helmetGeo/helmetTex): a steel pot with a cloth cover and a net, or a Soviet-pattern dome, sitting on the liner above the brows
  const helmet = [];
  const gear = F
    ? [
      [lathe([[0.168, -0.022], [0.172, 0.0], [0.168, 0.022]], 22, 1.1, 0.8), W, M4(0, 0.075, 0)],
      ...[-1, 1].map((sd) => [G.box(0.1, 0.12, 0.055), W, M4(sd * 0.1, 0.1, 0.135)]), ...[-1, 1].map((sd) => [G.box(0.104, 0.03, 0.06), W, M4(sd * 0.1, 0.165, 0.137)]),
      ...[-1, 1].map((sd) => [G.box(0.04, 0.46, 0.014), W, M4(sd * 0.1, 0.3, 0.13, -0.1, 0, sd * -0.05)]), ...[-1, 1].map((sd) => [G.box(0.04, 0.46, 0.014), W, M4(sd * 0.09, 0.3, -0.13, 0.1, 0, sd * 0.1)]),
      [G.cyl(0.05, 0.05, 0.3, 12), 0x3e3a2a, M4(0, 0.545, -0.19, 0, 0, Math.PI / 2)],   // the blanket roll, strapped on top of the bag
      [G.cyl(0.062, 0.062, 0.17, 14), CAN, M4(0.19, 0.03, -0.07)], [G.cyl(0.018, 0.018, 0.03, 6), MT, M4(0.19, 0.13, -0.07)],
      [G.box(0.11, 0.15, 0.05), W, M4(-0.18, 0.02, -0.1, 0, 0.5, 0)],
    ]
    : [
      [lathe([[0.168, -0.02], [0.171, 0.0], [0.168, 0.02]], 22, 1.1, 0.8), W, M4(0, 0.075, 0)],
      [G.box(0.29, 0.16, 0.07), W, M4(0, 0.27, 0.16)], ...[-0.095, 0, 0.095].map((x) => [G.box(0.08, 0.125, 0.05), W, M4(x, 0.3, 0.2)]),
      ...[-1, 1].map((sd) => [G.box(0.036, 0.36, 0.014), W, M4(sd * 0.1, 0.39, 0.1, -0.35, 0, sd * 0.1)]), ...[-1, 1].map((sd) => [G.box(0.036, 0.42, 0.014), W, M4(sd * 0.1, 0.3, -0.13, 0.08, 0, sd * 0.14)]),
      [G.cyl(0.058, 0.058, 0.16, 14), CAN, M4(-0.19, 0.03, -0.07)],
    ];
  // the shirt and trousers themselves are the modelled body (see RIGGEO's levels below): here only what is strapped on and over them
  const bodyParts = [...gear, ...head, ...helmet];
  const handG = [[G.sph(0.046, 12, 10), S, M4(0, -0.292, 0.006, 0, 0, 0, 0.72, 1.12, 0.52)], [G.cap(0.015, 0.04, 3, 8), S, M4(0.03, -0.278, 0.026, 0.4, 0, 0.5)], [G.cap(0.02, 0.055, 3, 8), S, M4(0, -0.33, 0.024, 0, 0, Math.PI / 2, 1, 1, 0.8)]];
  return {
    bodyParts, B, W, U, TR, F, handG, skin: skin.translate(0, -0.645, -0.006), skinCol: S, head: (() => { const g = G.sph(0.1, 26, 20); g.applyMatrix4(M4(0, 0, 0, 0, 0, 0, 0.9, 1.1, 0.98)); return g; })(),
    upper: build([[G.sph(0.067, 14, 10), U, M4(0, 0, 0, 0, 0, 0, 1, 0.9, 0.95)], [lathe([[0.0, 0.01], [0.06, -0.01], [0.058, -0.07], [0.052, -0.18], [0.047, -0.27], [0.0, -0.29]], 14), U, M4()],
      ...(F ? [[G.tor(0.05, 0.016, 6, 14), U, M4(0, -0.245, 0, Math.PI / 2, 0, 0)]] : [])]),
    fore: build([[G.sph(0.047, 12, 8), F ? S : U, M4()], [lathe([[0.0, 0.01], [0.046, -0.005], [0.045, -0.08], [0.037, -0.2], [0.032, -0.25], [0.0, -0.26]], 14), F ? S : U, M4()], ...(F ? [] : [[G.tor(0.035, 0.009, 5, 12), U, M4(0, -0.235, 0, Math.PI / 2, 0, 0)]]), ...handG]),
    thigh: build([[G.sph(0.088, 14, 10), TR, M4(0, 0, 0, 0, 0, 0, 1, 0.8, 1)], [lathe([[0.0, 0.03], [0.088, 0.0], [0.092, -0.09], [0.082, -0.25], [0.068, -0.41], [0.0, -0.46]], 14), TR, M4()], [G.box(0.05, 0.12, 0.1), TR, M4(0.08, -0.22, 0.01)], [G.box(0.055, 0.025, 0.105), TR, M4(0.082, -0.16, 0.01)]]),
    shinParts: [[G.sph(0.068, 12, 10), TR, M4()], [lathe([[0.0, 0.02], [0.066, 0.0], [0.064, -0.1], [0.056, -0.24], [0.06, -0.3], [0.0, -0.33]], 14), TR, M4()],
      [G.tor(0.054, 0.012, 5, 14), TR, M4(0, -0.3, 0, Math.PI / 2, 0, 0)]],
  };
}
/* the helmet shell: a turned profile (dome, flare, rolled rim, a little of the inside), oval in plan, with the chin strap hanging from the rim */
function helmetGeo(side) {
  const F = side === 'f', y0 = F ? 0.764 : 0.778;
  const prof = F ? [[0, 0.082], [0.045, 0.079], [0.085, 0.066], [0.11, 0.042], [0.122, 0.012], [0.126, -0.02], [0.128, -0.045], [0.134, -0.06], [0.145, -0.07], [0.151, -0.078], [0.146, -0.084], [0.13, -0.078], [0.122, -0.064], [0.118, -0.04], [0.114, 0.0], [0.104, 0.034], [0.078, 0.058], [0.04, 0.07], [0, 0.072]]
    : [[0, 0.084], [0.048, 0.079], [0.086, 0.063], [0.108, 0.034], [0.119, 0.0], [0.123, -0.03], [0.125, -0.058], [0.132, -0.074], [0.138, -0.084], [0.131, -0.09], [0.119, -0.082], [0.113, -0.06], [0.111, -0.02], [0.105, 0.02], [0.08, 0.054], [0.043, 0.071], [0, 0.075]];
  const shell = new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(r, y)), 36); shell.scale(1, 1, F ? 1.1 : 1.05); shell.computeVertexNormals(); shell.translate(0, y0, 0.004);
  const strap = (sd) => { const g = new THREE.BoxGeometry(0.011, 0.07, 0.003); g.translate(0, -0.035, 0); g.applyMatrix4(M4(sd * (F ? 0.108 : 0.104), y0 - 0.074, 0.012, 0.12, 0, sd * 0.5)); return g; };
  const buckle = new THREE.BoxGeometry(0.014, 0.01, 0.005).translate(0.075, y0 - 0.136, 0.03);
  const g = mergeGeometries([shell, strap(-1), strap(1), buckle].map((q) => { if (!q.attributes.uv) q.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(q.attributes.position.count * 2), 2)); return q; }), false);
  return g;
}
/* the helmets' paint, one canvas each, laid out the way helmGeo maps it: v 0..0.6 the outside from the crown down to the rim, 0.6..0.62
   the rolled edge, below that the inside (the liner and its webbing). A second canvas carries the relief: the cords of the net, the band,
   the weave of the hessian stand proud.
   IDF (side f): the M1 shell in olive drab, under a big-mesh net of dark cord - over the bare paint (0), over a hessian cover (1), or with
   rags of hessian tucked under the band (2); the band itself a strip cut from a truck's inner tube, the way the men held their nets on.
   Egyptian (side e): the Czechoslovak vz.53 in dark green - chipped and dusty (0), or under a fine net (1). */
function helmetTex(side, vr = 0) {
  const W = 512, H = 256, c = canvas(W, H), g = c.getContext('2d'), cb = canvas(W, H), gb = cb.getContext('2d'), r = rng((side === 'f' ? 4401 : 4409) + vr * 31), F = side === 'f';
  const RIM = 0.6 * H, IN = 0.62 * H, rgb = (k, a = 1) => `rgba(${k[0] | 0},${k[1] | 0},${k[2] | 0},${a})`;
  gb.fillStyle = '#808080'; gb.fillRect(0, 0, W, H);
  const hessian = F && vr === 1, paint = F ? [104, 104, 76] : [70, 84, 56], base = hessian ? [146, 122, 82] : paint;
  g.fillStyle = rgb(base); g.fillRect(0, 0, W, RIM);
  if (hessian) {   // the weave: rows and columns of coarse jute, darker in the folds, the seams of the cover running up to the crown
    for (let y = 0; y < RIM; y += 2.2) for (let x = (y / 2.2 | 0) % 2 ? 0 : 1.1; x < W; x += 2.2) { const k = 0.8 + r() * 0.4; g.fillStyle = rgb([base[0] * k, base[1] * k, base[2] * k], 0.8); g.fillRect(x, y, 1.6, 1.2); gb.fillStyle = `rgba(200,200,200,${0.3 + r() * 0.3})`; gb.fillRect(x, y, 1.6, 1.2); }
    for (let i = 0; i < 70; i++) { const x = r() * W, y = r() * RIM, w = 10 + r() * 40; const gr = g.createLinearGradient(x, y - 3, x, y + 3); gr.addColorStop(0, 'rgba(60,46,26,0)'); gr.addColorStop(0.5, 'rgba(60,46,26,0.35)'); gr.addColorStop(1, 'rgba(60,46,26,0)'); g.fillStyle = gr; g.fillRect(x, y - 3, w, 6); }
    g.strokeStyle = 'rgba(70,54,32,0.6)'; g.lineWidth = 1.5; for (let u = 0; u < W; u += 128) { g.beginPath(); g.moveTo(u + 30, 0); g.lineTo(u + 22, RIM); g.stroke(); }
  } else {   // paint: brush marks, a mottle, chips down to the steel, sand settled in the low places
    for (let i = 0; i < 2400; i++) { const k = 0.84 + r() * 0.3; g.fillStyle = rgb([base[0] * k, base[1] * k, base[2] * k], 0.1 + r() * 0.25); g.fillRect(r() * W, r() * RIM, 2 + r() * 10, 1 + r() * 3); }
    for (let i = 0; i < 260; i++) { g.strokeStyle = `rgba(${r() < 0.5 ? '34,38,24' : '120,118,86'},${0.08 + r() * 0.16})`; g.lineWidth = 1 + r() * 2; const x = r() * W, y = r() * RIM; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 50, y + (r() - 0.5) * 8); g.stroke(); }
    for (let i = 0; i < (F ? 24 : 40); i++) { const x = r() * W, y = 10 + r() * (RIM - 14), rx = 0.7 + r() * 1.8, ry = 0.5 + r() * 1.1; g.fillStyle = 'rgba(70,52,34,0.5)'; g.beginPath(); g.ellipse(x + 0.6, y + 0.6, rx + 1, ry + 0.8, 0, 0, 6.283); g.fill(); g.fillStyle = 'rgba(108,104,90,0.85)'; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, 6.283); g.fill(); gb.fillStyle = 'rgba(40,40,40,0.8)'; gb.beginPath(); gb.ellipse(x, y, rx, ry, 0, 0, 6.283); gb.fill(); }
    for (let i = 0; i < (F ? 900 : 1800); i++) { g.fillStyle = `rgba(${170 + r() * 30 | 0},${150 + r() * 24 | 0},${112 + r() * 20 | 0},${0.06 + r() * 0.14})`; g.fillRect(r() * W, RIM * (0.2 + 0.8 * Math.sqrt(r())), 1 + r() * 3, 1); }
    if (!F) for (const u of [0.25, 0.5, 0.75]) { const x = u * W, y = RIM * 0.62; g.fillStyle = 'rgba(40,46,30,0.9)'; g.beginPath(); g.arc(x, y, 3, 0, 6.283); g.fill(); g.fillStyle = 'rgba(120,130,100,0.6)'; g.beginPath(); g.arc(x - 0.8, y - 0.8, 1.2, 0, 6.283); g.fill(); gb.fillStyle = '#e0e0e0'; gb.beginPath(); gb.arc(x, y, 3, 0, 6.283); gb.fill(); }   // the liner rivets of the vz.53
  }
  // the net: knotted cord in diamonds, a little slack and uneven; big mesh for ours, fine for theirs
  if (F || vr === 1) {
    const step = F ? 12 : 13, lw = F ? 1.3 : 1.2, cord = F ? [178, 166, 128] : [62, 64, 44];
    const line = (x0, dir) => { g.beginPath(); gb.beginPath(); let x = x0, y = -4; g.moveTo(x, y); gb.moveTo(x, y); while (y < RIM + 2) { y += 6; x += dir * 6 + (r() - 0.5) * 1.4; g.lineTo(x, y); gb.lineTo(x, y); } g.stroke(); gb.stroke(); };
    for (const dir of [1, -1]) for (let k = -16; k < W / step + 16; k++) { if (F) { g.strokeStyle = 'rgba(30,30,20,0.35)'; g.lineWidth = lw; g.save(); g.translate(0.8, 0.9); line(k * step, dir); g.restore(); } g.strokeStyle = rgb(cord, 0.95); g.lineWidth = lw; gb.strokeStyle = '#f0f0f0'; gb.lineWidth = lw + 0.5; line(k * step, dir); }
    if (F) for (let k = -16; k < W / step + 16; k++) for (let j = 0; j * step / 2 < RIM; j++) { const x = k * step + (j % 2) * step / 2, y = j * step / 2; g.fillStyle = rgb([cord[0] * 0.92, cord[1] * 0.92, cord[2] * 0.92]); g.beginPath(); g.arc(x, y, 1.3, 0, 6.283); g.fill(); gb.fillStyle = '#ffffff'; gb.beginPath(); gb.arc(x, y, 1.5, 0, 6.283); gb.fill(); }
  }
  // the band from an inner tube round the middle, holding the net; rags of hessian tucked under it on some
  if (F) {
    const y0 = 0.355 * H, bh = 13;
    if (vr === 3) for (let i = 0; i < 26; i++) { const x = r() * W, w = 7 + r() * 12, top = y0 - 6 - r() * 26, bot = y0 + bh + 8 + r() * 30; g.fillStyle = r() < 0.6 ? `rgba(${140 + r() * 30 | 0},${116 + r() * 20 | 0},${76 + r() * 16 | 0},0.95)` : `rgba(${80 + r() * 20 | 0},${84 + r() * 16 | 0},${54 + r() * 10 | 0},0.95)`; g.beginPath(); g.moveTo(x, top); g.lineTo(x + w, top + r() * 4); g.lineTo(x + w * (0.6 + r() * 0.5), bot); g.lineTo(x + w * 0.2 * r(), bot - r() * 6); g.closePath(); g.fill(); gb.fillStyle = '#c8c8c8'; gb.fillRect(x, top, w, bot - top); g.strokeStyle = 'rgba(70,54,32,0.4)'; g.lineWidth = 0.6; for (let k = 0; k < 5; k++) { const xx = x + r() * w; g.beginPath(); g.moveTo(xx, top); g.lineTo(xx + (r() - 0.5) * 3, bot); g.stroke(); } }
    if (vr !== 2) { g.fillStyle = 'rgb(176,168,140)'; g.fillRect(0, y0 + bh - 1, W, 6); gb.fillStyle = '#e8e8e8'; gb.fillRect(0, y0 + bh - 1, W, 6); }   // a pale second band under the dark one
    g.fillStyle = vr === 2 ? 'rgb(150,142,116)' : 'rgb(30,30,26)'; g.beginPath(); g.moveTo(0, y0); for (let x = 0; x <= W; x += 8) g.lineTo(x, y0 + (r() - 0.5) * 1.2); for (let x = W; x >= 0; x -= 8) g.lineTo(x, y0 + bh + (r() - 0.5) * 1.6); g.closePath(); g.fill();
    for (let i = 0; i < 160; i++) { g.fillStyle = `rgba(${r() < 0.5 ? '70,70,66' : '10,10,10'},${0.2 + r() * 0.3})`; g.fillRect(r() * W, y0 + 1 + r() * (bh - 2), 3 + r() * 10, 0.8); }
    g.fillStyle = 'rgba(120,118,110,0.35)'; g.fillRect(0, y0 + 2, W, 1.2); gb.fillStyle = '#ffffff'; gb.fillRect(0, y0 - 1, W, bh + 2);
  }
  // the edge: the rolled rim, worn to the metal
  g.fillStyle = F ? 'rgb(64,64,46)' : 'rgb(54,60,42)'; g.fillRect(0, RIM, W, IN - RIM); for (let i = 0; i < 90; i++) { g.fillStyle = 'rgba(150,146,132,0.7)'; g.fillRect(r() * W, RIM + r() * (IN - RIM), 2 + r() * 6, 1); }
  // the inside: the liner, its webbing cradle and sweatband
  g.fillStyle = F ? 'rgb(66,62,42)' : 'rgb(58,60,42)'; g.fillRect(0, IN, W, H - IN); g.fillStyle = F ? 'rgb(96,86,58)' : 'rgb(86,70,48)'; g.fillRect(0, IN + 4, W, 9);
  g.strokeStyle = 'rgba(120,110,80,0.6)'; g.lineWidth = 6; for (let u = 0; u < W; u += 85) { g.beginPath(); g.moveTo(u, IN + 14); g.lineTo(u + 20, H); g.stroke(); }
  for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(0,0,0,${r() * 0.25})`; g.fillRect(r() * W, IN + r() * (H - IN), 3, 2); }
  g.fillStyle = F ? 'rgb(176,160,120)' : 'rgb(92,64,40)'; g.fillRect(0, H - 8, W, 8);   // the chin strap: khaki webbing, or the vz.53's leather
  const t = tex(c); t.wrapS = THREE.RepeatWrapping; const b = tex(cb, false); b.wrapS = THREE.RepeatWrapping; return { map: t, bump: b };
}
const RIGGEO = { f: rigGeos('f'), e: rigGeos('e') };
/* each side's soldier in three levels of detail (QLOD chooses by distance): the body with the bag on its back, the shin with its boot,
   and the helmet - the kit's shell, reshaped to the period, with the chin straps and buckle of the old one */
/* the helmets as they were in 1973, built as a shell around the head (in the head's own units: the skull is 0.087 across the side,
   0.104 to the crown).
   Ours: the M1 steel pot - the high round dome, the rim low over the ears at the sides, a short visor in front and a lip behind, the
   whole rim flaring out a little; the chin straps hang loose from their loops.
   Theirs: the Czechoslovak vz.53 of the Egyptian army, a copy of the Soviet SSh-40 - a deeper, rounder bowl, its rim nearly level all
   round with a small even flare, strapped under the chin.
   rim: the rim's height round the head, a + b cos(th) + c cos(2 th) (th = 0 in front); fl: how far the brim flares, front / side / back. */
const HELM_SPEC = {
  f: { ax: 0.104, azf: 0.116, azb: 0.12, ay: 0.126, y0: -0.008, rim: [-0.00425, 0.0265, 0.00575], fl: [0.009, 0.004, 0.007], fs: 0.72, band: [0.59, 0.69] },
  e: { ax: 0.103, azf: 0.114, azb: 0.118, ay: 0.13, y0: -0.012, rim: [-0.006, 0.024, 0.008], fl: [0.007, 0.006, 0.008], fs: 0.6, band: null },
};
const HELM_SEG = [[48, 18], [28, 11], [14, 6]];
function helmGeo(side, lod) {
  const S = HELM_SPEC[side], [NA, NT] = HELM_SEG[lod], TH = 0.0042, pos = [], uv = [], idx = [];
  const yRim = (th) => S.rim[0] + S.rim[1] * Math.cos(th) + S.rim[2] * Math.cos(2 * th);
  const flare = (th) => { const c = Math.cos(th); return S.fl[1] + (S.fl[0] - S.fl[1]) * Math.max(0, c) ** 2 + (S.fl[2] - S.fl[1]) * Math.max(0, -c) ** 2; };
  // a point of the shell: th round the head (0 = the front), t from the crown (0) to the rim (1); inner = the inside face, TH in from the outside
  const P = (th, t, inner) => {
    const yr = yRim(th), phR = Math.acos(clamp((yr - S.y0) / S.ay, -1, 1)), ph = t * phR, sn = Math.sin(ph), az = Math.cos(th) > 0 ? S.azf : S.azb;
    let x = S.ax * sn * Math.sin(th), z = az * sn * Math.cos(th), y = S.y0 + S.ay * Math.cos(ph);
    const nx = x / (S.ax * S.ax), ny = (y - S.y0) / (S.ay * S.ay), nz = z / (az * az), nl = Math.hypot(nx, ny, nz) || 1, h = Math.hypot(x, z);
    let out = flare(th) * smooth(S.fs, 1, t) ** 2;   // the brim turns out over the last part of the wall
    if (S.band && !inner) out += 0.0024 * smooth(S.band[0], S.band[0] + 0.02, t) * (1 - smooth(S.band[1] - 0.02, S.band[1], t));   // the rubber band stands proud
    if (h > 1e-6) { x += x / h * out; z += z / h * out; }
    if (inner) { x -= nx / nl * TH; y -= ny / nl * TH; z -= nz / nl * TH; }
    return [x, y, z];
  };
  const tOf = (i) => Math.pow(i / NT, 0.9), ring = (t, inner) => { const k0 = pos.length / 3; for (let j = 0; j <= NA; j++) { const th = -Math.PI + (j / NA) * 2 * Math.PI; pos.push(...P(th, t, inner)); } return k0; };
  const strip = (k0, k1, flip) => { for (let j = 0; j < NA; j++) { const a = k0 + j, b = a + 1, c = k1 + j, d = c + 1; if (flip) idx.push(a, b, c, b, d, c); else idx.push(a, c, b, b, c, d); } };
  const uvRow = (v) => { for (let j = 0; j <= NA; j++) uv.push(j / NA, 1 - v); };   // the canvas is drawn top-down
  // the outside, crown to rim
  const outer = []; for (let i = 0; i <= NT; i++) { outer.push(ring(tOf(i), false)); uvRow(0.6 * tOf(i)); } for (let i = 0; i < NT; i++) strip(outer[i], outer[i + 1], false);
  // the rolled edge: a bead a little out and down from the rim, then up onto the inside
  const rimO = outer[NT], bead = pos.length / 3; for (let j = 0; j <= NA; j++) { const th = -Math.PI + (j / NA) * 2 * Math.PI, [x, y, z] = P(th, 1, false), [xi, yi, zi] = P(th, 1, true), h = Math.hypot(x, z) || 1; pos.push((x + xi) / 2 + x / h * 0.0012, (y + yi) / 2 - 0.0022, (z + zi) / 2 + z / h * 0.0012); } uvRow(0.61);
  const rimI = ring(1, true); uvRow(0.62); strip(rimO, bead, false); strip(bead, rimI, false);
  // the inside, rim back up to the crown, facing in
  const inner = [rimI]; for (let i = NT - 1; i >= 0; i--) { inner.push(ring(tOf(i), true)); uvRow(0.62 + 0.38 * (1 - tOf(i))); } for (let i = 0; i < NT; i++) strip(inner[i], inner[i + 1], false);
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
  { const n = g.attributes.normal; for (let r0 = 0; r0 < pos.length / 3; r0 += NA + 1) { const a = r0, b = r0 + NA; const x = n.getX(a) + n.getX(b), y = n.getY(a) + n.getY(b), z = n.getZ(a) + n.getZ(b), l = Math.hypot(x, y, z) || 1; n.setXYZ(a, x / l, y / l, z / l); n.setXYZ(b, x / l, y / l, z / l); } }   // no seam down the back
  const parts = [g];
  if (lod < 2) {   // the chin straps on their loops at the sides of the rim: loose and hanging for ours, buckled under the chin for theirs
    const strap = (a, b, w = 0.0105) => { const d = b.clone().sub(a), q = new THREE.BoxGeometry(w, d.length(), 0.0026); q.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(V3(0, 1, 0), d.normalize())); q.translate((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2); return q; };
    for (const sd of [-1, 1]) { const th = sd * 1.42, [x, y, z] = P(th, 1, false), loop = V3(x * 0.96, y + 0.004, z);
      if (side === 'f') { const top = V3(x * 0.86, y + 0.006, z + 0.004), chin = V3(sd * 0.03, -0.11, 0.048); parts.push(strap(top, chin, 0.012)); if (sd > 0) parts.push(new THREE.BoxGeometry(0.015, 0.011, 0.005).translate((top.x * 0.4 + chin.x * 0.6), (top.y * 0.4 + chin.y * 0.6), (top.z * 0.4 + chin.z * 0.6))); else parts.push(strap(V3(-0.03, -0.11, 0.048), V3(0.03, -0.11, 0.048), 0.012)); }
      else { const chin = V3(sd * 0.04, -0.104, 0.052); parts.push(strap(V3(x * 0.9, y + 0.004, z), chin, 0.0085)); if (sd > 0) parts.push(new THREE.BoxGeometry(0.012, 0.008, 0.004).translate((x * 0.9 + chin.x) / 2, (y + chin.y) / 2, (z + chin.z) / 2)); } }
  }
  for (const q of parts.slice(1)) { const u = q.attributes.uv; for (let i = 0; i < u.count; i++) u.setXY(i, 0.5, 0.015); }   // the straps: the webbing (or leather) painted along the bottom of the map   // the straps take the webbing's colour from the inside of the map
  return mergeGeometries(parts.map((q) => (q.index ? q.toNonIndexed() : q)), false);
}
/* the uniform is one continuous skin over the whole skeleton (see uniGeo below), so a soldier bends at the shoulder, elbow, hip and knee
   without a seam; here per level of detail: what is strapped on (webbing, bag), the boots, and the helmet */
for (const side of ['f', 'e']) { const R = RIGGEO[side];
  R.lod = [0, 1, 2].map((l) => ({
    body: build([...R.bodyParts, [assetGeo('bag', l, R.W), null]]),
    boot: build([[assetGeo('boot', l, R.B), null]]),    helmet: helmGeo(side, l),
  }));
  R.body = R.lod[0].body; R.helmet = R.lod[0].helmet; }

/* ---------- the uniform: one continuous skin over the skeleton ----------
   Shirt and trousers are a single skinned mesh bound to the rig's own joints (hips, chest, shoulders, elbows, hips, knees), so the same poses
   and animations bend it smoothly at every joint, like the arms of the man holding the rifle. The chest is the modelled one; the arms and
   legs are turned tubes with muscle under the cloth - the deltoid, the bicep, the elbow, the forearm; the buttock, the thigh, the knee, the
   calf - creases at the elbow and knee, a cargo pocket on the thigh, the trousers bloused over the boots. The Israelis' sleeves are rolled
   above the elbow, the forearm bare; the hands are part of the same skin */
const UNI_BONES = ['hips', 'torso', 'sR', 'eR', 'sL', 'eL', 'hR', 'kR', 'hL', 'kL'];
const UNI_SEG = [[20, 30, 22, 36], [12, 15, 14, 18], [8, 8, 9, 9]];   // per level: arm round, arm along, leg round, leg along
function uniTube(y0, y1, nA, nL, radius, mirror) {   // a tube from y0 down to y1 (joint frame), radius(y, a) -> [rx, rz, dx, dz]
  const pos = [], uv = [], idx = [];
  for (let j = 0; j <= nL; j++) { const y = y0 + (y1 - y0) * j / nL; let circ = 0;
    for (let i = 0; i <= nA; i++) { const a = i / nA * Math.PI * 2, [rx, rz, dx, dz] = radius(y, a); circ = Math.PI * (rx + rz); pos.push(mirror * (Math.sin(a) * rx + dx), y, Math.cos(a) * rz + dz); uv.push(i / nA * circ / 0.4, -y / 0.4); } }
  for (let j = 0; j < nL; j++) for (let i = 0; i < nA; i++) { const a = j * (nA + 1) + i, b = a + nA + 1; if (mirror > 0) idx.push(a, b, a + 1, a + 1, b, b + 1); else idx.push(a, a + 1, b, a + 1, b + 1, b); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
  { const n = g.attributes.normal; for (let j = 0; j <= nL; j++) { const a = j * (nA + 1), b = a + nA, x = n.getX(a) + n.getX(b), y = n.getY(a) + n.getY(b), z = n.getZ(a) + n.getZ(b), l = Math.hypot(x, y, z) || 1; n.setXYZ(a, x / l, y / l, z / l); n.setXYZ(b, x / l, y / l, z / l); } }
  return g;
}
function uniSkin(g, fn, tint, off) {   // colour, bone indices and weights per vertex; fn(y) -> [[bone, w], ...] in the part's own frame; then into the hips' frame
  const p = g.attributes.position, n = p.count, si = new Uint16Array(n * 4), sw = new Float32Array(n * 4), col = new Float32Array(n * 3), c = new THREE.Color(tint), sh = g.attributes.color;
  for (let i = 0; i < n; i++) { const ws = fn(p.getY(i)); ws.forEach(([b, w], k) => { si[i * 4 + k] = b; sw[i * 4 + k] = w; }); const k = sh ? sh.getX(i) : 1; col[i * 3] = c.r * k; col[i * 3 + 1] = c.g * k; col[i * 3 + 2] = c.b * k; }
  g.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(si, 4)); g.setAttribute('skinWeight', new THREE.Float32BufferAttribute(sw, 4)); g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.translate(off[0], off[1], off[2]); for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'uv', 'color', 'skinIndex', 'skinWeight'].includes(k)) g.deleteAttribute(k);
  return g;
}
function uniGeo(side, l) {
  const R = RIGGEO[side], F = side === 'f', [aA, aL, lA, lL] = UNI_SEG[l], ga = (x, sg) => Math.exp(-(x * x) / (2 * sg * sg)), sm = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const ip = (y, P) => { if (y >= P[0][0]) return P[0][1]; for (let k = 1; k < P.length; k++) if (y >= P[k][0]) { const t = (y - P[k - 1][0]) / (P[k][0] - P[k - 1][0]); return P[k - 1][1] + (P[k][1] - P[k - 1][1]) * (t * t * (3 - 2 * t)); } return P[P.length - 1][1]; };
  const shirt = 0xffffff, trousers = 0xeeeee4, cloth = [], skin = [];
  // the chest and the hips: the modelled torso; below the belt it moves with the hips, above with the chest
  for (const [nm, tint] of [['torso', shirt], ['pelvis', trousers]]) { const g = assetGeo(nm, l, 0xffffff).clone(); const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 0.55, uv.getY(i) * 0.55);
    { const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i); p.setX(i, p.getX(i) * (1 - 0.13 * sm(0.28, 0.46, y))); p.setZ(i, p.getZ(i) * (1 - 0.06 * sm(0.3, 0.46, y))); } g.computeVertexNormals(); }   // narrower over the shoulders than the model's heavy deltoids
    cloth.push(uniSkin(g, (y) => { const w = sm(-0.02, 0.1, y); return [[0, 1 - w], [1, w]]; }, tint, [0, 0, 0])); }
  // the arms: shoulder at the top of the tube, elbow 0.28 down, wrist 0.54
  const ARM = [[0.035, 0.05], [0.0, 0.066], [-0.06, 0.062], [-0.15, 0.056], [-0.24, 0.05], [-0.285, 0.045], [-0.36, 0.045], [-0.46, 0.036], [-0.535, 0.03]];
  for (const [sd, bs, be, x] of [[-1, 2, 3, -0.205], [1, 4, 5, 0.205]]) {
    const wf = (y) => { const wt = sm(-0.07, 0.0, y), we = sm(-0.24, -0.32, y); return [[1, wt], [bs, Math.max(0, 1 - wt - we)], [be, we]]; };
    const sleeve = (y, a) => { const r = ip(y, ARM) + 0.004 + 0.0025 * Math.sin(6 * a + y * 70) * ga(y + 0.22, 0.05) + (F ? 0.011 * ga(y + 0.236, 0.011) : 0.004 * ga(y + 0.5, 0.012)); return [r * 0.94, r, 0, 0.004]; };
    const yc = F ? -0.248 : -0.535;   // where the cloth ends: the rolled sleeve, or the cuff at the wrist
    cloth.push(uniSkin(uniTube(0.035, yc, aA, Math.max(4, Math.round(aL * (0.035 - yc) / 0.57)), sleeve, sd), wf, shirt, [x, 0.45, 0]));
    if (F) skin.push(uniSkin(uniTube(-0.236, -0.535, Math.max(6, aA - 4), Math.max(3, Math.round(aL * 0.5)), (y, a) => { const r = ip(y, ARM) - 0.004; return [r * 0.92, r, 0, 0.004]; }, sd), wf, 0xffffff, [x, 0.45, 0]));
    const hand = build(R.handG.map(([g, c, m]) => [g, c, m])).clone(); hand.translate(0, -0.28, 0);
    skin.push(uniSkin(hand, () => [[be, 1]], 0xffffff, [x, 0.45, 0]));
  }
  // the legs: hip joint at the top, knee 0.45 down, the boot from 0.81
  const LEG = [[0.05, 0.075], [0.0, 0.088], [-0.1, 0.085], [-0.25, 0.075], [-0.4, 0.062], [-0.45, 0.058], [-0.55, 0.06], [-0.7, 0.052], [-0.775, 0.057], [-0.82, 0.05]];
  for (const [sd, bh, bk, x] of [[-1, 6, 7, -0.1], [1, 8, 9, 0.1]]) {
    const wf = (y) => { const wh = sm(-0.09, 0.0, y), wk = sm(-0.41, -0.49, y); return [[0, wh], [bh, Math.max(0, 1 - wh - wk)], [bk, wk]]; };
    const leg = (y, a) => { let r = ip(y, LEG) + 0.003 * Math.sin(7 * a + y * 40) * ga(y + 0.47, 0.03) + 0.0025 * Math.sin(9 * a) * ga(y + 0.78, 0.02);
      const back = Math.cos(a) < 0 ? 1 + 0.09 * ga(y + 0.04, 0.06) * -Math.cos(a) : 1;
      const out = Math.max(0, Math.sin(a)) ** 6, pocket = 0.013 * out * sm(-0.36, -0.33, y) * sm(-0.16, -0.19, y);   // the cargo pocket, on the outside of the thigh
      return [r + pocket, r * back, 0, 0.004]; };
    cloth.push(uniSkin(uniTube(0.05, -0.82, lA, lL, leg, sd), wf, trousers, [x, -0.02, 0]));
  }
  const parts = [...cloth, ...skin], g = mergeGeometries(parts, false); let nc = 0; for (const c of cloth) nc += c.index.count;
  g.clearGroups(); g.addGroup(0, nc, 0); g.addGroup(nc, g.index.count - nc, 1);
  g.boundingSphere = new THREE.Sphere(V3(0, 0, 0), 1.25); return g;
}
for (const side of ['f', 'e']) for (let l = 0; l < 3; l++) RIGGEO[side].lod[l].uni = uniGeo(side, l);
MAT.helmet = {}; MAT.helmets = {}; for (const side of ['f', 'e']) { MAT.helmets[side] = (side === 'f' ? [0, 1, 2] : [0, 1]).map((vr) => { const t = helmetTex(side, vr), cloth = side === 'f' || vr === 1; return new THREE.MeshStandardMaterial({ map: t.map, bumpMap: t.bump, bumpScale: cloth ? 1.2 : 0.5, roughness: cloth ? 0.93 : 0.62, metalness: cloth ? 0 : 0.2 }); }); MAT.helmet[side] = MAT.helmets[side][0]; }
/* a face, painted: the front of the head sits at u = 0.25 of the sphere. Skin with a little blood under it, brows, eyes that look ahead,
   the shadow of a nose, a mouth, and what makes one man different from the next: a moustache or a beard, grey at the temples, the lines of
   an older face, a scar. Six of each side. */
const FACES = {
  f: [
    { sk: [205, 160, 125], hair: '#2a1f16', fh: 'stubble', brow: [3.4, 0.004], iris: '#4a3220' },
    { sk: [190, 142, 108], hair: '#1a1511', fh: 'mo', brow: [4.2, 0.012], iris: '#3a2616', side: true },
    { sk: [222, 178, 140], hair: '#4a3421', fh: 'light', brow: [2.8, -0.006], iris: '#4a6a6e' },
    { sk: [176, 126, 92], hair: '#120f0d', fh: 'beard', brow: [4.6, 0.01], iris: '#2e1d12', uni: true },
    { sk: [198, 150, 116], hair: '#2a2420', fh: 'moThin', brow: [3.2, 0.0], iris: '#4a3220', age: 1, grey: 0.6 },
    { sk: [214, 166, 128], hair: '#5a3a22', fh: 'goatee', brow: [3.0, -0.01], iris: '#5a7a60', scar: true },
    { sk: [218, 168, 134], hair: '#7a3a1c', fh: 'moStub', brow: [3.0, 0.004], iris: '#5a7a60' },
    { sk: [182, 134, 98], hair: '#16110d', fh: 'moBig', brow: [4.6, 0.012], iris: '#2e1d12', side: true },
  ],
  e: [
    { sk: [160, 112, 78], hair: '#161210', fh: 'moBig', brow: [4.4, 0.01], iris: '#2e1d12' },
    { sk: [142, 96, 66], hair: '#100d0b', fh: 'none', brow: [5.0, 0.014], iris: '#241610', uni: true },
    { sk: [178, 128, 92], hair: '#231a14', fh: 'moStub', brow: [3.6, 0.0], iris: '#3a2616', side: true },
    { sk: [150, 104, 72], hair: '#120f0d', fh: 'bigbeard', brow: [4.2, 0.008], iris: '#2e1d12' },
    { sk: [168, 120, 86], hair: '#2a2622', fh: 'moBig', brow: [3.8, 0.0], iris: '#3a2616', age: 1, grey: 0.7 },
    { sk: [186, 138, 100], hair: '#1a1410', fh: 'goatee', brow: [3.4, -0.008], iris: '#4a3a24', scar: true },
  ],
};
/* the head: a sphere's mesh, so the painted face keeps its place on it, sculpted into a head - the brow ridge, the eye sockets, a real nose
   with its wings, cheekbones and the hollows under them, lips, a chin, the jaw narrowing under the cheeks, the back of the skull. A
   moustache or a beard stands a few millimetres proud of the skin, each face its own. Three levels of detail */
const HEAD_SEG = [[60, 44], [34, 25], [20, 14]];
function headGeo(side, v, lod) {
  const fh = FACES[side][v].fh, [ws, hs] = HEAD_SEG[lod], g = new THREE.SphereGeometry(0.1, ws, hs), p = g.attributes.position, uv = g.attributes.uv, n = V3();
  const ga = (x, sg) => Math.exp(-(x * x) / (2 * sg * sg)), sm = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const beard = fh === 'beard' || fh === 'bigbeard', bigB = fh === 'bigbeard', mo = /mo|beard|goatee/.test(fh), moBig = fh === 'moBig' || bigB;
  for (let i = 0; i < p.count; i++) {
    n.fromBufferAttribute(p, i).normalize(); let u = uv.getX(i) - 0.25; u -= Math.round(u); const vv = uv.getY(i), au = Math.abs(u);
    // the skull: longer front to back than across, fuller behind, a little flatter on top
    let x = n.x * 0.087, y = n.y * 0.11 * (1 - 0.06 * sm(0.75, 1, n.y)), z = n.z * (n.z < 0 ? 0.104 : 0.097);
    // the face is a flatter plane than the skull: the cheeks come forward less than a ball would round them away
    const face = sm(0.16, 0.27, vv) * (1 - sm(0.6, 0.72, vv)) * (1 - sm(0.17, 0.26, au));
    if (n.z > 0) z = z * (1 - 0.1 * face) + 0.009 * face * (1 - sm(0.0, 0.2, au));
    // the jaw: narrowing under the cheekbones to the chin, the corner of the jaw, and in under it onto the neck
    const jw = sm(0.38, 0.2, vv); x *= 1 - 0.2 * jw * (beard ? 0.6 : 1); if (n.z < 0.3) { const under = sm(0.27, 0.12, vv) * sm(0.05, 0.14, au); x *= 1 - 0.15 * under; z *= 1 - 0.18 * under; }
    let dr = 0.006 * ga(vv - 0.567, 0.017) * ga(u, 0.105);                                  // the brow ridge
    dr -= 0.009 * ga(au - 0.064, 0.027) * ga(vv - 0.497, 0.022);                             // the eye sockets
    const np = vv > 0.428 ? sm(0.552, 0.428, vv) : sm(0.395, 0.428, vv), nw = 0.018 + 0.011 * sm(0.53, 0.42, vv);
    dr += 0.0095 * Math.pow(np, 1.5) * ga(u, nw) + 0.0028 * ga(u, 0.017) * ga(vv - 0.428, 0.014);   // a nose, not a beak   // the nose: the bridge, the tip
    dr += 0.003 * ga(au - 0.024, 0.01) * ga(vv - 0.414, 0.012);                            // its wings
    dr += 0.005 * ga(au - 0.104, 0.032) * ga(vv - 0.462, 0.03) - 0.0035 * ga(au - 0.088, 0.028) * ga(vv - 0.375, 0.035);   // cheekbones, the hollow under
    dr += 0.004 * ga(u, 0.042) * ga(vv - 0.338, 0.012) + 0.0045 * ga(u, 0.04) * ga(vv - 0.309, 0.012) - 0.002 * ga(u, 0.05) * ga(vv - 0.323, 0.006);   // the lips and the line between
    dr -= 0.0022 * ga(u, 0.05) * ga(vv - 0.285, 0.01);                                       // the fold under the lower lip
    dr += 0.011 * ga(u, 0.045) * ga(vv - 0.24, 0.03);                                        // the chin
    if (mo) dr += (moBig ? 0.0045 : 0.003) * ga(u, moBig ? 0.07 : 0.05) * ga(vv - 0.362, 0.014);
    if (beard) { const lim = 0.31 + 0.85 * au, m = sm(0.26, 0.17, au) * sm(0.04, 0.13, vv) * sm(lim + 0.03, lim - 0.09, vv) * (1 - ga(u, 0.045) * ga(vv - 0.315, 0.028)); dr += (bigB ? 0.008 : 0.003) * m + (bigB ? 0.008 : 0) * ga(u, 0.08) * sm(0.3, 0.15, vv); }
    if (fh === 'goatee') dr += 0.0035 * ga(u, 0.04) * ga(vv - 0.24, 0.045);
    dr *= n.z > -0.2 ? 1 : 0;
    p.setXYZ(i, x + n.x * dr * 1.35, y + n.y * dr * 1.35, z + n.z * dr * 1.35);   // deep enough to catch the light
  }
  g.computeVertexNormals();
  // the seam down the side of the head: its two copies of each vertex share one normal, so no line shows
  { const nr = g.attributes.normal; for (let j = 0; j <= hs; j++) { const a = j * (ws + 1), b = a + ws, x = nr.getX(a) + nr.getX(b), y = nr.getY(a) + nr.getY(b), z = nr.getZ(a) + nr.getZ(b), l = Math.hypot(x, y, z) || 1; nr.setXYZ(a, x / l, y / l, z / l); nr.setXYZ(b, x / l, y / l, z / l); } }
  g.computeBoundingSphere(); return g;
}
const HEADS = { f: FACES.f.map((_, v) => [0, 1, 2].map((l) => headGeo('f', v, l))), e: FACES.e.map((_, v) => [0, 1, 2].map((l) => headGeo('e', v, l))) };
/* days in the field: dust and dried sweat ground into the skin, soot from the guns and the burning vehicles smeared across the forehead
   and cheeks where a sleeve wiped it, darker in the creases, the eyes left a little cleaner, and clean tracks where the sweat ran down.
   Multiplied over the painted face, so the features stay and only get dirtier. */
function faceGrime(g, r, X, Y, W, amt) {
  g.save(); g.beginPath(); g.rect(0, 0, W, W); for (const sd of [-1, 1]) g.ellipse(X(sd * 0.064), Y(0.5), 8.4, 3.8, 0, 0, 6.283); g.clip('evenodd');   // not on the whites of the eyes
  g.globalCompositeOperation = 'multiply';
  const blob = (u, v, rx, ry, rot, rgb, a) => { g.save(); g.translate(X(u), Y(v)); g.rotate(rot); g.scale(1, ry / rx); const gr = g.createRadialGradient(0, 0, 0, 0, 0, rx); gr.addColorStop(0, `rgba(${rgb},${a})`); gr.addColorStop(0.45, `rgba(${rgb},${a * 0.65})`); gr.addColorStop(1, `rgba(${rgb},0)`); g.fillStyle = gr; g.fillRect(-rx, -rx, rx * 2, rx * 2); g.restore(); };
  // a film of dust over the whole head - face, jaw, ears, neck - so nowhere does clean skin meet dirty in a line
  g.fillStyle = `rgba(172,152,130,${0.62 * amt})`; g.fillRect(0, 0, W, W);
  // uneven: big soft patches all round, darker along the jaw and under the chin where it is never wiped
  for (let i = 0; i < 46; i++) blob(-0.25 + r(), 0.06 + r() * 0.62, 10 + r() * 26, 6 + r() * 16, r() * 3, r() < 0.55 ? '118,98,80' : '100,94,88', (0.22 + r() * 0.3) * amt);
  { const gr = g.createLinearGradient(0, Y(0.32), 0, Y(0.06)); gr.addColorStop(0, 'rgba(116,100,84,0)'); gr.addColorStop(1, `rgba(116,100,84,${0.6 * amt})`); g.fillStyle = gr; g.fillRect(0, Y(0.32), W, Y(0.06) - Y(0.32)); }
  // soot from the guns and the burning vehicles: soft grey-black smudges, drawn out the way a sleeve drags it across
  const soot = (u, v, len, wid, rot, a) => { for (let k = 0; k < 3; k++) blob(u + (r() - 0.5) * 0.012, v + (r() - 0.5) * 0.012, len * (1 - k * 0.24), wid * (1 - k * 0.26), rot + (r() - 0.5) * 0.15, '58,53,50', a * (0.4 + 0.18 * k)); };
  const ns = 4 + Math.floor(r() * 3 + amt * 2);
  for (let i = 0; i < ns; i++) {
    const t = r(), sd = r() < 0.5 ? -1 : 1, a = (0.5 + r() * 0.4) * amt;
    if (t < 0.28) soot((r() - 0.5) * 0.12, 0.575 + r() * 0.05, 13 + r() * 12, 4 + r() * 4, (r() - 0.5) * 0.5, a);   // across the forehead
    else if (t < 0.68) soot(sd * (0.09 + r() * 0.06), 0.4 + r() * 0.08, 12 + r() * 10, 4.5 + r() * 5, sd * (0.45 + r() * 0.6), a);   // over the cheekbone toward the ear
    else if (t < 0.86) soot(sd * (0.05 + r() * 0.05), 0.26 + r() * 0.05, 10 + r() * 8, 4 + r() * 3, sd * 0.9, a);   // along the jaw
    else soot(sd * 0.11, 0.56, 8 + r() * 6, 4 + r() * 3, sd * 1.2, a);   // the temple
  }
  // the creases hold it: round the nostrils, the folds to the mouth, the corners of the eyes, the hairline
  for (const sd of [-1, 1]) { blob(sd * 0.022, 0.41, 5, 4, 0, '84,74,64', 0.45 * amt); blob(sd * 0.105, 0.5, 6, 4, 0, '84,74,66', 0.35 * amt); blob(sd * 0.026, 0.49, 5, 3.5, 0, '88,78,70', 0.3 * amt); for (let k = 0; k < 4; k++) blob(sd * (0.04 + k * 0.009), 0.395 - k * 0.025, 4, 2.2, sd * 1.1, '90,80,70', 0.3 * amt); }
  for (let u = -0.18; u <= 0.18; u += 0.03) blob(u, 0.625 + 0.05 * Math.exp(-Math.pow(u / 0.14, 2)), 8, 5, 0, '96,86,76', 0.28 * amt);
  // grit: a fine, faint speckle of dirt and powder
  for (let i = 0; i < 7000 * amt; i++) { const u = -0.25 + r(), v = 0.05 + r() * 0.64; g.fillStyle = r() < 0.7 ? `rgba(92,78,64,${0.07 + r() * 0.15})` : `rgba(52,46,42,${0.08 + r() * 0.16})`; g.fillRect(X(u), Y(v), 0.5, 0.5); }
  // light dust settled over the top of it, and the cleaner tracks where the sweat ran down
  g.globalCompositeOperation = 'source-over';
  for (let i = 0; i < 2200 * amt; i++) { const u = -0.25 + r(), v = 0.08 + r() * 0.6; g.fillStyle = `rgba(200,178,142,${0.05 + r() * 0.12})`; g.fillRect(X(u), Y(v), 0.5, 0.5); }
  g.globalCompositeOperation = 'screen'; g.lineCap = 'round';
  for (let i = 0; i < 3 + amt * 3; i++) { const sd = r() < 0.5 ? -1 : 1, u = sd * (0.04 + r() * 0.13), v0 = 0.6 - r() * 0.15, len = 0.08 + r() * 0.14; g.strokeStyle = `rgba(56,46,36,${0.18 + r() * 0.14})`; g.lineWidth = 1.2 + r() * 1.4; g.beginPath(); g.moveTo(X(u), Y(v0)); let x = X(u); for (let y = Y(v0); y < Y(v0 - len); y += 3) { x += (r() - 0.5) * 1.4; g.lineTo(x, y); } g.stroke(); }
  g.restore();
}
/* the same dirt for the rest of the bare skin - the neck, the forearms, the hands: a dusty film with darker patches and grit, tiled */
function skinGrimeTex() {
  const n = 256, c = canvas(n), g = c.getContext('2d'), r = rng(4711); g.fillStyle = 'rgb(214,198,180)'; g.fillRect(0, 0, n, n); g.globalCompositeOperation = 'multiply';
  for (let i = 0; i < 70; i++) { const x = r() * n, y = r() * n, rad = 8 + r() * 40, a = 0.15 + r() * 0.3, col = r() < 0.55 ? '120,100,82' : '96,90,86'; for (const ox of [-n, 0, n]) for (const oy of [-n, 0, n]) { const gr = g.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, rad); gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(1, `rgba(${col},0)`); g.fillStyle = gr; g.fillRect(x + ox - rad, y + oy - rad, rad * 2, rad * 2); } }
  for (let i = 0; i < 9000; i++) { g.fillStyle = r() < 0.7 ? `rgba(92,78,64,${0.08 + r() * 0.16})` : `rgba(52,46,42,${0.1 + r() * 0.18})`; g.fillRect(r() * n, r() * n, 1, 1); }
  g.globalCompositeOperation = 'source-over'; for (let i = 0; i < 2500; i++) { g.fillStyle = `rgba(206,184,148,${0.06 + r() * 0.12})`; g.fillRect(r() * n, r() * n, 1, 1); }
  const t = tex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2, 2); return t;
}
function faceDraw(c, side, v, shut = false) {
  const W = 256, SS = 2, g = c.getContext('2d'), r = rng(900 + v * 17 + (side === 'f' ? 0 : 5)), D = FACES[side][v], sk = D.sk; g.setTransform(SS, 0, 0, SS, 0, 0);
  const col = (k, a = 1) => `rgba(${Math.round(sk[0] * k)},${Math.round(sk[1] * k)},${Math.round(sk[2] * k)},${a})`;
  const X = (u) => (u + 0.25) * W, Y = (v) => (1 - v) * W;   // u: around the head from the centre of the face; v: up the head
  const hairC = (a = 1) => { const h = new THREE.Color(D.hair); if (D.grey) h.lerp(new THREE.Color(0x9a948c), D.grey * (0.35 + r() * 0.5)); return `rgba(${h.r * 255 | 0},${h.g * 255 | 0},${h.b * 255 | 0},${a})`; };
  const fh = D.fh, hasMo = /mo|beard|goatee/.test(fh), beard = fh === 'beard' || fh === 'bigbeard', stub = fh === 'stubble' || fh === 'light' || fh === 'moStub' || fh === 'goatee';
  g.fillStyle = col(1); g.fillRect(0, 0, W, W);
  // modelling: lighter brow and cheekbones, darker under the jaw and toward the sides of the face
  { const gr = g.createLinearGradient(0, Y(0.62), 0, Y(0.2)); gr.addColorStop(0, col(1.04)); gr.addColorStop(0.55, col(0.98)); gr.addColorStop(1, col(0.8)); g.fillStyle = gr; g.fillRect(0, 0, W, W); }
  for (const sd of [-1, 1]) { const gr = g.createLinearGradient(X(sd * 0.07), 0, X(sd * 0.24), 0); gr.addColorStop(0, col(1, 0)); gr.addColorStop(1, col(0.88, 0.35)); g.fillStyle = gr; g.fillRect(Math.min(X(sd * 0.07), X(sd * 0.24)), 0, Math.abs(X(sd * 0.24) - X(sd * 0.07)), W); }
  for (let i = 0; i < 1600; i++) { g.fillStyle = r() < 0.5 ? col(0.9, 0.12) : col(1.1, 0.1); g.fillRect(r() * W, r() * W, 1 + r() * 2, 1 + r() * 2); }
  for (let i = 0; i < 5000; i++) { g.fillStyle = r() < 0.6 ? col(0.78, 0.18) : col(1.16, 0.14); g.fillRect(r() * W, r() * W, 0.55, 0.55); }   // pores
  for (const sd of [-1, 1]) { const gr = g.createRadialGradient(X(sd * 0.1), Y(0.45), 1, X(sd * 0.1), Y(0.45), 16); gr.addColorStop(0, col(1.1, 0.35)); gr.addColorStop(1, col(1.1, 0)); g.fillStyle = gr; g.fillRect(0, 0, W, W); }   // the cheekbones catch the light
  for (const sd of [-1, 1]) { const gr = g.createRadialGradient(X(sd * 0.065), Y(0.41), 2, X(sd * 0.065), Y(0.41), 24); gr.addColorStop(0, 'rgba(190,80,70,0.16)'); gr.addColorStop(1, 'rgba(190,80,70,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, W); }
  // an older face: lines across the forehead, folds from the nose to the corners of the mouth, crow's feet, shadow under the eyes
  if (D.age) {
    g.strokeStyle = col(0.72, 0.55); g.lineWidth = 1.3; for (const vv of [0.6, 0.585]) { g.beginPath(); g.moveTo(X(-0.1), Y(vv)); g.quadraticCurveTo(X(0), Y(vv + 0.012), X(0.1), Y(vv)); g.stroke(); }
    for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(X(sd * 0.03), Y(0.41)); g.quadraticCurveTo(X(sd * 0.075), Y(0.37), X(sd * 0.065), Y(0.31)); g.stroke(); for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(X(sd * 0.1), Y(0.5 + (k - 1) * 0.004)); g.lineTo(X(sd * 0.125), Y(0.5 + (k - 1) * 0.02)); g.stroke(); } }
    g.fillStyle = col(0.82, 0.35); for (const sd of [-1, 1]) { g.beginPath(); g.ellipse(X(sd * 0.064), Y(0.47), 12, 4, 0, 0, 6.283); g.fill(); }
  }
  // hair, cropped short, from the hairline round the back of the head; the helmet hides most of it. Grey creeps in at the temples of the older men
  g.fillStyle = D.hair; g.beginPath(); g.moveTo(0, 0); g.lineTo(W, 0); g.lineTo(W, Y(0.63)); for (let u = 0.75; u >= -0.25; u -= 0.02) { const f = Math.exp(-Math.pow(u / 0.14, 2)); g.lineTo(X(u), Y(0.63 + 0.07 * f + (r() - 0.5) * 0.006)); } g.lineTo(0, Y(0.63)); g.closePath(); g.fill();
  g.lineWidth = 0.6; for (let i = 0; i < 700; i++) { const x = r() * W, y = Y(0.635) + (r() - 0.5) * 4, u = x / W - 0.25, dx = (u > 0 ? 1 : -1) * (0.4 + r() * 1.0) * Math.min(1, Math.abs(u) * 3); g.strokeStyle = r() < 0.4 ? col(1, 0.5) : D.hair; g.beginPath(); g.moveTo(x, y - 1.5); g.lineTo(x + dx, y + 1.5 + r() * 2.5); g.stroke(); }   // the hairline: a cropped edge, a few short strands over the brow
  { const vb = (u) => { const t = clamp((Math.abs(u - 0.5) - 0.0) / 0.33, 0, 1); return 0.29 + 0.27 * t * t * (3 - 2 * t); };   // the nape low at the back, rising to the top of the ear
    g.fillStyle = D.hair; for (const sh of [0, -W]) { g.beginPath(); g.moveTo(0.42 * W + sh, Y(0.66)); for (let x = 0.42 * W; x <= 1.08 * W; x += 2) g.lineTo(x + sh, Y(vb(x / W - 0.25) + (r() - 0.5) * 0.008)); g.lineTo(1.08 * W + sh, Y(0.66)); g.closePath(); g.fill(); }
    g.lineWidth = 0.6; for (let i = 0; i < 900; i++) { const x = 0.42 * W + r() * 0.66 * W, y = Y(vb(x / W - 0.25)) + (r() - 0.5) * 3; g.strokeStyle = r() < 0.5 ? col(0.95, 0.5) : D.hair; g.beginPath(); g.moveTo(x % W, y - 2); g.lineTo(x % W + (r() - 0.5), y + 1.5 + r() * 2); g.stroke(); } }
  if (D.grey) for (let i = 0; i < 900; i++) { const u = (r() - 0.5) * 1.0, vv = 0.62 + r() * 0.3; if (Math.abs(u) < 0.12 && vv < 0.72) continue; g.fillStyle = `rgba(190,186,180,${0.25 + r() * 0.5 * D.grey})`; g.fillRect(X(u), Y(vv), 1, 2); }
  if (D.side) for (const sd of [-1, 1]) { g.fillStyle = hairC(0.85); g.beginPath(); g.moveTo(X(sd * 0.165), Y(0.64)); g.lineTo(X(sd * 0.205), Y(0.64)); g.lineTo(X(sd * 0.198), Y(0.5)); g.lineTo(X(sd * 0.178), Y(0.52)); g.closePath(); g.fill(); for (let i = 0; i < 60; i++) { g.fillStyle = r() < 0.5 ? hairC(0.7) : col(0.9, 0.5); g.fillRect(X(sd * (0.17 + r() * 0.03)), Y(0.5 + r() * 0.13), 1, 1.5); } }
  // brows: thick or fine, level or knitted, and on some one dark bar across
  const brow = side === 'f' ? '#2a1d15' : '#17110e'; g.strokeStyle = brow; g.lineWidth = D.brow[0] + 1.4; g.lineCap = 'round';
  for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(X(sd * 0.024), Y(0.545 - D.brow[1])); g.quadraticCurveTo(X(sd * 0.064), Y(0.561), X(sd * 0.104), Y(0.548 + D.brow[1])); g.stroke(); }
  if (D.uni) { g.lineWidth = D.brow[0] * 0.6; g.beginPath(); g.moveTo(X(-0.03), Y(0.55)); g.lineTo(X(0.03), Y(0.55)); g.stroke(); }
  // eyes: the socket shadow, the white, the iris and pupil, the lids
  for (const sd of [-1, 1]) {
    const ex = X(sd * 0.064), ey = Y(0.5);
    g.fillStyle = col(0.8, 0.55); g.beginPath(); g.ellipse(ex, ey - 1, 13, 7, 0, 0, 6.283); g.fill();
    g.fillStyle = col(0.84, 0.35); g.beginPath(); g.ellipse(ex, ey + 4.2, 8, 2.3, 0, 0, 6.283); g.fill();   // a shadow under the eye
    g.fillStyle = '#e2dace'; g.beginPath(); g.ellipse(ex, ey, 7.6, 3.2, 0, 0, 6.283); g.fill();
    g.fillStyle = D.iris; g.beginPath(); g.arc(ex + sd * 0.4, ey + 0.2, 2.9, 0, 6.283); g.fill();
    g.strokeStyle = 'rgba(255,240,200,0.22)'; g.lineWidth = 0.45; for (let k = 0; k < 12; k++) { const a = k / 12 * 6.283; g.beginPath(); g.moveTo(ex + sd * 0.4 + Math.cos(a) * 1.5, ey + 0.2 + Math.sin(a) * 1.5); g.lineTo(ex + sd * 0.4 + Math.cos(a) * 2.6, ey + 0.2 + Math.sin(a) * 2.6); g.stroke(); }
    g.strokeStyle = 'rgba(10,8,6,0.7)'; g.lineWidth = 0.7; g.beginPath(); g.arc(ex + sd * 0.4, ey + 0.2, 2.85, 0, 6.283); g.stroke();
    g.fillStyle = '#0d0a08'; g.beginPath(); g.arc(ex + sd * 0.4, ey + 0.2, 1.35, 0, 6.283); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.7)'; g.beginPath(); g.arc(ex - 1 + sd * 0.4, ey - 0.8, 0.65, 0, 6.283); g.fill();
    g.fillStyle = col(0.9); g.beginPath(); g.ellipse(ex, ey - 2.6, 8.4, 2.4, 0, Math.PI, 6.283); g.fill();   // the upper lid comes down over the top of the iris
    g.strokeStyle = '#22160e'; g.lineWidth = 2.1; g.beginPath(); g.ellipse(ex, ey - 0.4, 7.8, 2.9, 0, Math.PI, 6.283); g.stroke();
    g.strokeStyle = col(0.68, 0.8); g.lineWidth = 1.0; g.beginPath(); g.ellipse(ex, ey, 7.6, 3.2, 0, 0, Math.PI); g.stroke();
    g.strokeStyle = col(0.7, 0.55); g.lineWidth = 0.9; g.beginPath(); g.ellipse(ex, ey - 2.4, 8.6, 4.6, 0, Math.PI * 1.08, Math.PI * 1.92); g.stroke();   // the crease of the lid
    g.fillStyle = col(1.1, 0.45); g.beginPath(); g.ellipse(ex, ey - 6.2, 7, 1.3, 0, 0, 6.283); g.fill();   // the lid catches light under the brow
    if (shut) { // the blink: the lid comes down over all of it, a dark lash line along the closed edge
      g.fillStyle = col(0.94); g.beginPath(); g.ellipse(ex, ey - 0.5, 8.6, 4.4, 0, 0, 6.283); g.fill(); g.fillStyle = col(0.86, 0.5); g.beginPath(); g.ellipse(ex, ey - 2, 7.8, 2.6, 0, 0, 6.283); g.fill();
      g.strokeStyle = '#24170f'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(ex - 7.8, ey - 0.5); g.quadraticCurveTo(ex, ey + 2.6, ex + 7.8, ey - 0.5); g.stroke(); }
  }
  // the nose: a highlight down the bridge, shadow on the far side, nostrils
  { const gr = g.createLinearGradient(X(-0.032), 0, X(0.032), 0); gr.addColorStop(0, col(0.84, 0.6)); gr.addColorStop(0.45, col(1.1, 0.55)); gr.addColorStop(1, col(0.82, 0.65)); g.fillStyle = gr; g.fillRect(X(-0.032), Y(0.52), X(0.032) - X(-0.032), Y(0.405) - Y(0.52));
    g.fillStyle = col(0.66, 0.85); for (const sd of [-1, 1]) { g.beginPath(); g.ellipse(X(sd * 0.02), Y(0.405), 3.4, 2, 0, 0, 6.283); g.fill(); } g.fillStyle = col(0.9, 0.5); g.beginPath(); g.ellipse(X(0), Y(0.42), 7, 3.4, 0, 0, 6.283); g.fill(); }
  g.strokeStyle = col(0.8, 0.32); g.lineWidth = 1.1; for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(X(sd * 0.032), Y(0.41)); g.quadraticCurveTo(X(sd * 0.072), Y(0.372), X(sd * 0.064), Y(0.315)); g.stroke(); }
  if (fh === 'mo' || fh === 'moThin' || fh === 'moBig' || fh === 'none') for (let i = 0; i < 700; i++) { const u = (r() - 0.5) * 0.34, vv = 0.19 + r() * 0.2; if (Math.abs(u) < 0.07 && vv > 0.345) continue; g.fillStyle = `rgba(30,22,16,${0.06 + r() * 0.12})`; g.fillRect(X(u), Y(vv), 1, 1); }
  // a scar across the cheekbone
  if (D.scar) { g.strokeStyle = col(1.18, 0.8); g.lineWidth = 1.6; g.beginPath(); g.moveTo(X(0.09), Y(0.46)); g.lineTo(X(0.125), Y(0.36)); g.stroke(); g.strokeStyle = col(0.78, 0.6); g.lineWidth = 0.8; g.beginPath(); g.moveTo(X(0.094), Y(0.46)); g.lineTo(X(0.129), Y(0.36)); g.stroke(); }
  // beards: a full beard down the jaw to the chin (short and trimmed, or thick and wild), or a goatee round the mouth
  const strands = (n, inside, len = 2.5) => { for (let i = 0; i < n; i++) { const u = (r() - 0.5) * 0.52, vv = 0.1 + r() * 0.42; if (!inside(u, vv)) continue; g.fillStyle = r() < 0.72 ? hairC(0.55 + r() * 0.4) : col(0.75, 0.4); g.fillRect(X(u), Y(vv), 1, 1 + r() * len); } };
  if (beard) {
    // a band along the jaw from ear to ear, up to the mouth corners and the lower cheek; thicker and lower on the wild one
    const big = fh === 'bigbeard', ex = big ? 0.02 : 0, jawV = (a) => (big ? 0.11 : 0.15) + Math.pow(Math.min(1, a / (0.2 + ex)), 1.6) * (0.48 - (big ? 0.11 : 0.15)), inV = (a) => (a < 0.075 ? (big ? 0.3 : 0.27) : Math.min(0.47, (big ? 0.3 : 0.27) + Math.pow((a - 0.075) / 0.085, 1.2) * 0.2));
    const jaw = (u, vv) => { const a = Math.abs(u); if (a > 0.21 + ex) return false; if (vv > 0.345 && a < 0.075) return false; return vv > jawV(a) - 0.01 && vv < inV(a); };
    g.fillStyle = hairC(big ? 0.72 : 0.4); g.beginPath(); g.moveTo(X(-0.2 - ex), Y(0.48)); g.lineTo(X(-0.19 - ex), Y(0.3)); g.quadraticCurveTo(X(-0.13), Y(jawV(0.02)), X(0), Y(jawV(0))); g.quadraticCurveTo(X(0.13), Y(jawV(0.02)), X(0.19 + ex), Y(0.3)); g.lineTo(X(0.2 + ex), Y(0.48));
    g.lineTo(X(0.145), Y(0.47)); g.quadraticCurveTo(X(0.12), Y(0.37), X(0.085), Y(inV(0.085))); g.lineTo(X(0.07), Y(0.29)); g.quadraticCurveTo(X(0), Y(inV(0) - 0.01), X(-0.07), Y(0.29)); g.lineTo(X(-0.085), Y(inV(0.085))); g.quadraticCurveTo(X(-0.12), Y(0.37), X(-0.145), Y(0.47)); g.closePath(); g.fill();
    strands(big ? 2400 : 1500, jaw, big ? 3.5 : 2.2);
  } else if (fh === 'goatee') { g.fillStyle = hairC(0.7); g.beginPath(); g.ellipse(X(0), Y(0.235), 12, 13, 0, 0, 6.283); g.fill(); strands(500, (u, vv) => Math.abs(u) < 0.05 && vv > 0.17 && vv < 0.3, 2); }
  // moustaches: a thin line, the usual brush, or the big one with its drooping ends
  if (hasMo) {
    const big = fh === 'moBig' || fh === 'bigbeard', thin = fh === 'moThin', w = big ? 19 : thin ? 12 : 14, h = big ? 4.6 : thin ? 2.2 : 3.4;
    g.fillStyle = hairC(0.95); g.beginPath(); g.ellipse(X(0), Y(0.362), w, h, 0, 0, 6.283); g.fill();
    if (big) for (const sd of [-1, 1]) { g.beginPath(); g.ellipse(X(sd * 0.066), Y(0.348), 5, 7, sd * 0.5, 0, 6.283); g.fill(); }
    for (let i = 0; i < (big ? 220 : 110); i++) { g.fillStyle = r() < 0.6 ? hairC(0.8) : col(0.9, 0.5); g.fillRect(X(0) - w + r() * 2 * w, Y(0.368) - h + r() * 2 * h, 1, 1.5 + r() * (big ? 2 : 1)); }
  }
  if (stub) for (let i = 0; i < (fh === 'light' ? 500 : 1100); i++) { const u = (r() - 0.5) * 0.36, vv = 0.2 + r() * 0.2; if (Math.abs(u) < 0.07 && vv > 0.345) continue; g.fillStyle = `rgba(30,22,16,${0.1 + r() * 0.18})`; g.fillRect(X(u), Y(vv), 1, 1); }
  // the mouth
  g.fillStyle = `rgba(${sk[0] * 0.76 | 0},${sk[1] * 0.56 | 0},${sk[2] * 0.52 | 0},0.42)`; g.beginPath(); g.moveTo(X(-0.052), Y(0.322)); g.quadraticCurveTo(X(0), Y(0.343), X(0.052), Y(0.322)); g.quadraticCurveTo(X(0), Y(0.298), X(-0.052), Y(0.322)); g.fill();
  g.strokeStyle = col(0.55); g.lineWidth = 1.8; g.beginPath(); g.moveTo(X(-0.052), Y(0.322)); g.quadraticCurveTo(X(0), Y(0.312), X(0.052), Y(0.322)); g.stroke();
  g.fillStyle = col(1.18, 0.35); g.beginPath(); g.ellipse(X(0), Y(0.306), 4.5, 1.2, 0, 0, 6.283); g.fill(); g.strokeStyle = col(0.9, 0.45); g.lineWidth = 0.6; for (let k = -3; k <= 3; k++) { g.beginPath(); g.moveTo(X(k * 0.012), Y(0.33)); g.lineTo(X(k * 0.013), Y(0.3)); g.stroke(); }   // the lips: a sheen on the lower lip, the creases
  g.strokeStyle = col(0.86, 0.5); g.lineWidth = 0.8; g.beginPath(); g.moveTo(X(-0.008), Y(0.385)); g.lineTo(X(-0.006), Y(0.35)); g.moveTo(X(0.008), Y(0.385)); g.lineTo(X(0.006), Y(0.35)); g.stroke();   // the philtrum
  g.fillStyle = col(1.16, 0.5); g.beginPath(); g.ellipse(X(0.004), Y(0.43), 2.4, 1.6, 0, 0, 6.283); g.fill();   // the tip of the nose
  if (!beard) { g.fillStyle = col(1.08, 0.45); g.beginPath(); g.ellipse(X(0), Y(0.285), 6, 1.8, 0, 0, 6.283); g.fill(); }
  // chin and jaw shadow, then the texture
  { const gr = g.createLinearGradient(0, Y(0.27), 0, Y(0.16)); gr.addColorStop(0, col(1, 0)); gr.addColorStop(1, col(0.72, 0.7)); g.fillStyle = gr; g.fillRect(0, Y(0.27), W, Y(0.16) - Y(0.27)); }
  const amt = 0.85 + r() * 0.5; faceGrime(g, r, X, Y, W, amt);
  g.setTransform(1, 0, 0, 1, 0, 0); return amt;
}
/* the blink, and the dead: the same face with the lids down - the painted open face copied, the closed lids drawn over the eyes, and on the
   lids, outside the whites, the film of dust the rest of the face has */
function faceShutDraw(c, src, side, v, amt) {
  const W = 256, SS = 2, g = c.getContext('2d'), sk = FACES[side][v].sk, X = (u) => (u + 0.25) * W, Y = (vv) => (1 - vv) * W;
  const col = (k, a = 1) => `rgba(${Math.round(sk[0] * k)},${Math.round(sk[1] * k)},${Math.round(sk[2] * k)},${a})`;
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'copy'; g.drawImage(src, 0, 0); g.globalCompositeOperation = 'source-over'; g.setTransform(SS, 0, 0, SS, 0, 0); g.lineCap = 'round';
  for (const sd of [-1, 1]) {
    const ex = X(sd * 0.064), ey = Y(0.5);
    g.fillStyle = col(0.94); g.beginPath(); g.ellipse(ex, ey - 0.5, 8.6, 4.4, 0, 0, 6.283); g.fill(); g.fillStyle = col(0.86, 0.5); g.beginPath(); g.ellipse(ex, ey - 2, 7.8, 2.6, 0, 0, 6.283); g.fill();
    g.strokeStyle = '#24170f'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(ex - 7.8, ey - 0.5); g.quadraticCurveTo(ex, ey + 2.6, ex + 7.8, ey - 0.5); g.stroke();
    g.save(); g.beginPath(); g.ellipse(ex, ey - 0.5, 8.6, 4.4, 0, 0, 6.283); g.ellipse(ex, ey, 8.4, 3.8, 0, 0, 6.283); g.clip('evenodd'); g.globalCompositeOperation = 'multiply'; g.fillStyle = `rgba(172,152,130,${0.62 * amt})`; g.fillRect(ex - 10, ey - 6, 20, 12); g.restore();
  }
  g.setTransform(1, 0, 0, 1, 0, 0);
}
{ const gt = skinGrimeTex(); MAT.skin = { f: new THREE.MeshStandardMaterial({ color: RIGGEO.f.skinCol, roughness: 0.78, map: gt }), e: new THREE.MeshStandardMaterial({ color: RIGGEO.e.skinCol, roughness: 0.78, map: gt }) }; }
/* the faces are painted off the start-up path. Each begins as a plain skin tone at full size (so the painted one later goes into the same
   texture, with no new shader), and is painted while the player is in the menu, a face at a time, or at the latest while a mission loads.
   The painted brows, lashes, stubble and pores give the skin a little relief through the bump map, which shares the picture */
const FACEQ = [];
function faceSlot(side, v) {
  const sk = FACES[side][v].sk, mk = () => { const c = canvas(512), g = c.getContext('2d'); g.fillStyle = `rgb(${sk[0]},${sk[1]},${sk[2]})`; g.fillRect(0, 0, 512, 512); const t = tex(c); return { c, t, b: bumpOf(t) }; };
  const o = mk(), s = mk(), mat = (x) => new THREE.MeshStandardMaterial({ map: x.t, bumpMap: x.b, bumpScale: 0.55, roughness: 0.66 }); FACEQ.push({ side, v, o, s }); return [mat(o), mat(s)];
}
function facePaint(q) { const amt = faceDraw(q.o.c, q.side, q.v); faceShutDraw(q.s.c, q.o.c, q.side, q.v, amt); for (const x of [q.o, q.s]) { x.t.needsUpdate = true; x.b.needsUpdate = true; } }
function facesNow() { while (FACEQ.length) facePaint(FACEQ.shift()); }   // all that are left, at once: for a start that cannot wait
async function facesPaint(cb) { const n = FACEQ.length || 1; let k = 0; while (FACEQ.length) { const t0 = performance.now(); while (FACEQ.length && performance.now() - t0 < 45) { facePaint(FACEQ.shift()); k++; } cb(k / n); await LD.tick(); } }
// in the menu: one face every quarter second, never while the player is touching, scrolling or typing (a face takes a moment on a phone)
const FACEIDLE = { last: 0 };
for (const ev of ['pointerdown', 'pointermove', 'wheel', 'keydown', 'touchmove', 'scroll']) addEventListener(ev, () => { FACEIDLE.last = performance.now(); }, { passive: true, capture: true });
function facesIdle() { if (!FACEQ.length) return; if (!LD.busy && !document.hidden && performance.now() - FACEIDLE.last > 800) facePaint(FACEQ.shift()); setTimeout(facesIdle, 250); }
{ const F = { f: FACES.f.map((_, v) => faceSlot('f', v)), e: FACES.e.map((_, v) => faceSlot('e', v)) }; MAT.faces = { f: F.f.map((x) => x[0]), e: F.e.map((x) => x[0]) }; MAT.facesShut = { f: F.f.map((x) => x[1]), e: F.e.map((x) => x[1]) }; }
/* soldiers stand out: slightly larger, with a coloured rim light (red enemies, blue friends) and a marker over the head */
const US = 1.14;
function rimMat(hex, k) {
  const m = MAT.cloth.clone(); const col = new THREE.Color(hex).multiplyScalar(k);
  m.onBeforeCompile = (sh) => { sh.uniforms.uRim = { value: col }; sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform vec3 uRim;').replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n  { float rr = 1.0 - clamp(abs(dot(normalize(vNormal), normalize(vViewPosition))), 0.0, 1.0); totalEmissiveRadiance += uRim * rr * rr * rr * rr; }'); };
  m.customProgramCacheKey = () => 'rim' + hex; m.userData.rim = col; m.userData.rimHex = hex; return m;
}
function setRim(m, k) { m.userData.rim.setHex(m.userData.rimHex).multiplyScalar(k); }
MAT.clothE = rimMat(0xff4020, 0); MAT.clothF = rimMat(0x5f9cff, 0.22);   // no red outline on the enemy: the mark over his head is enough
/* the uniform's cloth, close up: mottled - irregular patches in three shades of the side's colour at two sizes, flecks, a twill weave, wear
   and grime - tiling, about 40 cm a repeat; the weave and the patches' edges also give the light a little relief */
function camoTex(side) {
  const F = side === 'f', N = QUAL === 'low' ? 256 : QUAL === 'med' ? 512 : 1024, c = canvas(N), g = c.getContext('2d'), r = rng(F ? 4321 : 8765), bc = canvas(N), b = bc.getContext('2d');
  const pal = F ? ['#62644a', '#4c5136', '#767255', '#3c4129', '#58603e'] : ['#a38d60', '#8a7347', '#b8a372', '#6d5e3e', '#9b8a5a'];
  g.fillStyle = pal[0]; g.fillRect(0, 0, N, N); b.fillStyle = '#808080'; b.fillRect(0, 0, N, N);
  const blob = (x, y, rad, col, alpha, ctxs) => { const k = 9 + (r() * 6 | 0), pts = []; for (let i = 0; i < k; i++) { const a = i / k * 6.283, rr = rad * (0.55 + r() * 0.75); pts.push([Math.cos(a) * rr * (1.3 + r() * 0.4), Math.sin(a) * rr * (0.8 + r() * 0.3)]); }
    const rot = r() * 6.283; for (const dx of [-N, 0, N]) for (const dy of [-N, 0, N]) for (const [ctx, cc, aa] of ctxs) { ctx.save(); ctx.translate(x + dx, y + dy); ctx.rotate(rot); ctx.globalAlpha = aa; ctx.fillStyle = cc; ctx.beginPath(); pts.forEach(([px, py], i) => { const [qx, qy] = pts[(i + 1) % k]; i ? 0 : ctx.moveTo((px + qx) / 2, (py + qy) / 2); ctx.quadraticCurveTo(qx, qy, (qx + pts[(i + 2) % k][0]) / 2, (qy + pts[(i + 2) % k][1]) / 2); }); ctx.closePath(); ctx.fill(); ctx.restore(); } };
  for (let i = 0; i < 26; i++) blob(r() * N, r() * N, N * (0.07 + r() * 0.07), pal[1], 0.85, [[g, pal[1], 0.85], [b, '#767676', 0.5]]);
  for (let i = 0; i < 34; i++) blob(r() * N, r() * N, N * (0.04 + r() * 0.05), pal[2], 0.8, [[g, pal[2], 0.8], [b, '#8a8a8a', 0.5]]);
  for (let i = 0; i < 40; i++) blob(r() * N, r() * N, N * (0.02 + r() * 0.03), pal[4], 0.7, [[g, pal[4], 0.7]]);
  for (let i = 0; i < 160; i++) blob(r() * N, r() * N, N * (0.004 + r() * 0.01), pal[3], 0.75, [[g, pal[3], 0.75]]);   // flecks
  g.globalAlpha = 1; b.globalAlpha = 1;
  // the twill: fine diagonal ribs, lighter and darker; the same ribs in the relief
  const step = Math.max(2, N / 256); for (let k = -N; k < N * 2; k += step) { const dark = (k / step) % 2 < 1; g.strokeStyle = dark ? 'rgba(20,22,12,0.10)' : 'rgba(255,250,230,0.06)'; g.lineWidth = step * 0.5; g.beginPath(); g.moveTo(k, 0); g.lineTo(k + N, N); g.stroke(); b.strokeStyle = dark ? 'rgba(40,40,40,0.35)' : 'rgba(200,200,200,0.3)'; b.lineWidth = step * 0.5; b.beginPath(); b.moveTo(k, 0); b.lineTo(k + N, N); b.stroke(); }
  for (let i = 0; i < N * 6; i++) { g.fillStyle = r() < 0.5 ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,240,0.05)'; g.fillRect(r() * N, r() * N, 1 + r() * step, 1 + r() * step); }   // slubs in the yarn
  for (let i = 0; i < 18; i++) { const x = r() * N, y = r() * N, rr = N * (0.05 + r() * 0.12), gr = g.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, r() < 0.55 ? 'rgba(40,32,18,0.16)' : 'rgba(240,230,200,0.12)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - rr, y - rr, rr * 2, rr * 2); }   // dust, sweat, the sun's fading
  const t = tex(c), bt = tex(bc, false); for (const q of [t, bt]) { q.wrapS = q.wrapT = THREE.RepeatWrapping; }
  return { map: t, bump: bt };
}
MAT.uni = {};
for (const [side, hex, k] of [['f', 0x5f9cff, 0.22], ['e', 0xff4020, 0]]) { const m = rimMat(hex, k), t = camoTex(side); m.map = t.map; m.bumpMap = t.bump; m.bumpScale = 0.9; m.roughness = 0.96; m.customProgramCacheKey = () => 'rimU' + hex; MAT.uni[side] = m; }
MAT.uni.e.color = MAT.clothE.color;   // the chapters tint the enemy's uniform through the cloth colour
// the Syrians on the Hermon: not the Egyptians' sand blotches but their own - khaki-olive drill with short dark vertical 'lizard' stripes
function camoTexSy() {
  const N = QUAL === 'low' ? 256 : QUAL === 'med' ? 512 : 1024, c = canvas(N), g = c.getContext('2d'), bc = canvas(N), b = bc.getContext('2d'), r = rng(9131);
  g.fillStyle = '#7d7a55'; g.fillRect(0, 0, N, N); b.fillStyle = '#808080'; b.fillRect(0, 0, N, N);
  for (let i = 0; i < 60; i++) { const x = r() * N, y = r() * N, rr = N * (0.05 + r() * 0.08); g.globalAlpha = 0.35; g.fillStyle = r() < 0.5 ? '#6d6c48' : '#8b8762'; g.beginPath(); g.ellipse(x, y, rr * 1.4, rr, r() * 3, 0, 7); g.fill(); }
  g.globalAlpha = 1; for (let i = 0; i < N * 1.6; i++) { const x = r() * N, y = r() * N, h = N * (0.015 + r() * 0.04), w = Math.max(1, N * 0.004 * (0.6 + r())); const col = r() < 0.55 ? '#3e3a26' : '#4a5232'; for (const dy of [-N, 0, N]) { g.fillStyle = col; g.fillRect(x, y + dy, w, h); b.fillStyle = '#707070'; b.fillRect(x, y + dy, w, h); } }
  const step = Math.max(2, N / 256); for (let k = -N; k < N * 2; k += step) { g.strokeStyle = (k / step) % 2 < 1 ? 'rgba(20,22,12,0.09)' : 'rgba(255,250,230,0.05)'; g.lineWidth = step * 0.5; g.beginPath(); g.moveTo(k, 0); g.lineTo(k + N, N); g.stroke(); }
  const t = tex(c), bt = tex(bc, false); for (const q of [t, bt]) { q.wrapS = q.wrapT = THREE.RepeatWrapping; } return { map: t, bump: bt };
}
const UNI_E = { eg: { map: MAT.uni.e.map, bump: MAT.uni.e.bumpMap }, sy: null };
function uniformFor(mode) { const k = mode === 'hermon' ? 'sy' : 'eg'; if (k === 'sy' && !UNI_E.sy) UNI_E.sy = camoTexSy(); MAT.uni.e.map = UNI_E[k].map; MAT.uni.e.bumpMap = UNI_E[k].bump; }

function tagTex(fill) { const c = canvas(64), g = c.getContext('2d'); g.beginPath(); g.moveTo(17, 18); g.lineTo(47, 18); g.lineTo(32, 46); g.closePath(); g.lineJoin = 'round'; g.lineWidth = 3.5; g.strokeStyle = 'rgba(0,0,0,.6)'; g.stroke(); g.fillStyle = fill; g.fill(); return tex(c); }   // a slim marker, thin dark edge
const TAGM = { fire: new THREE.SpriteMaterial({ map: tagTex('#ffffff'), color: new THREE.Color(1, 0.55, 0.3), sizeAttenuation: false, transparent: true, depthWrite: false, depthTest: false, fog: false }), dim: new THREE.SpriteMaterial({ map: tagTex('#ff4a3a'), sizeAttenuation: false, transparent: true, opacity: 0.4, depthWrite: false, fog: false }), rpg: new THREE.SpriteMaterial({ map: tagTex('#ffd23a'), sizeAttenuation: false, transparent: true, depthWrite: false, depthTest: false, fog: false }), e: new THREE.SpriteMaterial({ map: tagTex('#ff4a3a'), sizeAttenuation: false, transparent: true, depthWrite: false, fog: false }), f: new THREE.SpriteMaterial({ map: tagTex('#6fa8ff'), sizeAttenuation: false, transparent: true, depthWrite: false, depthTest: false, fog: false }) };
const SEATED = build([
  [G.cap(0.15, 0.22, 4, 10), 0x9f8b5f, M4(0, 0.56, 0, 0, 0, 0, 1.1, 1, 0.8)], [G.box(0.34, 0.2, 0.26), 0x6a6142, M4(0, 0.55, 0)], [G.box(0.28, 0.14, 0.07), 0x5a5238, M4(0, 0.55, 0.16)], ...[-0.08, 0.08].map((x) => [G.box(0.07, 0.11, 0.05), 0x5a5238, M4(x, 0.56, 0.18)]),
  [G.box(0.26, 0.12, 0.22), 0x4b4a36, M4(0, 0.52, -0.2)],
  [G.sph(0.095, 12, 10), 0x9a6f4f, M4(0, 0.9, 0.02, 0, 0, 0, 0.9, 1.05, 1)], [G.sph(0.13, 14, 7, 0, Math.PI * 2, 0, Math.PI * 0.52), 0x4a5840, M4(0, 0.92, 0, 0, 0, 0, 1, 1, 1.06)], [G.cyl(0.133, 0.15, 0.04, 16, true), 0x4a5840, M4(0, 0.9, 0)],
  [G.cap(0.075, 0.3, 4, 8), 0x907e56, M4(-0.09, 0.28, 0.2, Math.PI / 2, 0, 0)], [G.cap(0.075, 0.3, 4, 8), 0x907e56, M4(0.09, 0.28, 0.2, Math.PI / 2, 0, 0)], ...[-0.09, 0.09].map((x) => [G.box(0.11, 0.06, 0.2), 0x2a2420, M4(x, 0.08, 0.4)]),
  [G.cap(0.05, 0.2, 4, 8), 0x9f8b5f, M4(-0.18, 0.62, 0.12, -1.1, 0, 0.2)], [G.cap(0.05, 0.2, 4, 8), 0x9f8b5f, M4(0.18, 0.62, 0.12, -1.1, 0, -0.2)],
  [G.box(0.05, 0.07, 0.7), 0x1d1d1d, M4(0.05, 0.62, 0.25, -0.9, 0.2, 0)], [G.box(0.03, 0.14, 0.06), 0x5a3a24, M4(0.05, 0.6, 0.0, -0.9, 0.2, 0)],
]);
/* two-bone arm IK: both hands sit on the weapon (pistol grip and handguard) in every two-handed pose */
const IKV = { t: V3(), h: V3(), e: V3(), p: V3(), c: V3(), q1: new THREE.Quaternion(), q2: new THREE.Quaternion(), down: V3(0, -1, 0) };
const GRIPS = { rifle: [V3(0, -0.075, 0.03), V3(0, -0.04, 0.22)], fal: [V3(0, -0.085, -0.04), V3(0, -0.04, 0.235)], rpg: [V3(0, -0.07, -0.05), V3(0, -0.07, 0.17)], smg: [V3(0, -0.075, -0.06), V3(0, -0.05, 0.1)], lmg: [V3(0, -0.075, 0.03), V3(0, -0.03, 0.3)], sniper: [V3(0, -0.07, 0.0), V3(0, -0.035, 0.28)] };
const WGEO = { get rifle() { return AK_W; }, get smg() { return SMG_W; }, get lmg() { return LMG_W; }, get sniper() { return SVD_W; }, get rpg() { return RPG_W; } };
const WKIND = (kind) => (kind === 'rpg' ? 'rpg' : kind === 'smg' ? 'smg' : kind === 'lmg' ? 'lmg' : kind === 'sniper' ? 'sniper' : 'rifle');
const POLE_R = V3(-0.75, -0.55, -0.2).normalize(), POLE_L = V3(0.35, -1, 0.05).normalize();
function ikArm(sh, el, target, pole) {
  const L1 = 0.28, L2 = 0.29, t = IKV.t.subVectors(target, sh.position); const d = clamp(t.length(), 0.1, L1 + L2 - 0.004); t.normalize();
  const bend = Math.PI - Math.acos(clamp((L1 * L1 + L2 * L2 - d * d) / (2 * L1 * L2), -1, 1)); el.rotation.set(-bend, 0, 0);
  const h = IKV.h.set(0, -L1 - L2 * Math.cos(bend), L2 * Math.sin(bend)).normalize(); IKV.q1.setFromUnitVectors(h, t);
  const e = IKV.e.copy(IKV.down).applyQuaternion(IKV.q1); e.addScaledVector(t, -t.dot(e)); const pp = IKV.p.copy(pole).addScaledVector(t, -t.dot(pole));
  const ang = Math.atan2(IKV.c.crossVectors(e, pp).dot(t), e.dot(pp)); IKV.q2.setFromAxisAngle(t, ang); sh.quaternion.multiplyQuaternions(IKV.q2, IKV.q1);
}
const _gq = V3(), _gl = V3(), _qt = new THREE.Quaternion(), _eu = new THREE.Euler();
/* Every pose is written as a set of joint targets; the limbs then ease toward them frame by frame, so a soldier who drops to a crouch
   or rises to run flows through the change instead of snapping. A unit that has just been placed snaps once, so it never slides in. */
class Rig {
  constructor(side, wgeo) {
    const g = RIGGEO[side];
    this.root = new THREE.Group(); this.root.rotation.order = 'YXZ'; /* turn to the heading first, then lie down or fall: a man falls the way he faces */ this.hips = new THREE.Group(); this.hips.position.y = 0.93; this.root.add(this.hips);
    this.torso = new THREE.Group(); this.hips.add(this.torso); const CM = side === 'e' ? MAT.clothE : MAT.clothF; this.mBody = new THREE.Mesh(g.body, CM); this.torso.add(this.mBody); this.mShin = []; this.lod = 0;
    this.side = side; this.faceV = Math.floor(Math.random() * MAT.faces[side].length); this.headP = new THREE.Group(); this.headP.position.set(0, 0.645, 0.006); this.headP.scale.setScalar(1.1); this.torso.add(this.headP);
    this.head = new THREE.Mesh(HEADS[side][this.faceV][0], MAT.faces[side][this.faceV]); this.headP.add(this.head); this.headP.add(new THREE.Mesh(g.skin, MAT.skin[side])); this.helmet = new THREE.Mesh(g.helmet, MAT.helmets[side][Math.floor(Math.random() * MAT.helmets[side].length)]); this.headP.add(this.helmet);
    this.breath = Math.random() * 6; this.blinkT = rand(1, 5); this.shut = false; this.deadOpen = Math.random() < 0.35;
    const arm = (x) => { const s = new THREE.Group(); s.position.set(x, 0.45, 0); const e = new THREE.Group(); e.position.y = -0.28; s.add(e); this.torso.add(s); return [s, e]; };
    [this.sR, this.eR] = arm(-0.205); [this.sL, this.eL] = arm(0.205);
    this.mBoot = []; const leg = (x) => { const h = new THREE.Group(); h.position.set(x, -0.02, 0); const k = new THREE.Group(); k.position.y = -0.45; const bm = new THREE.Mesh(g.lod[0].boot, CM); this.mBoot.push(bm); k.add(bm); h.add(k); this.hips.add(h); return [h, k]; };
    [this.hR, this.kR] = leg(-0.1); [this.hL, this.kL] = leg(0.1);
    // the uniform: bones on the joints, bound in this rest pose (before the soldier is scaled or posed)
    const bones = UNI_BONES.map((k) => { const b = new THREE.Bone(); this[k].add(b); return b; });
    this.uni = new THREE.SkinnedMesh(g.lod[0].uni, [MAT.uni[side], MAT.skin[side]]); this.hips.add(this.uni); this.root.updateMatrixWorld(true); this.uni.bind(new THREE.Skeleton(bones)); this.uni.boundingSphere = new THREE.Sphere(V3(0, -0.15, 0), 1.45);   // fixed: three.js would measure it once, in whatever pose the man was in then, and later cull the uniform off a man still on screen
    this.gun = new THREE.Mesh(wgeo, MAT.vcMetal); gunGeo(this.gun, wgeo, 0); this.torso.add(this.gun);   // gunGeo: a packed weapon brings its own material (3_world.js)
    SH(this.root, true, false); onLayer1(this.root); this.root.scale.setScalar(US); this.root.visible = false; scene.add(this.root);
    // the eased state and the target it chases: numbers for the hinges, quaternions for the shoulders
    this.T = { rootX: 0, hipsY: 0.93, hipsX: 0, hipsZ: 0, hipsYaw: 0, torsoX: 0, torsoY: 0, torsoZ: 0, legs: [0, 0, 0, 0], gun: [0, 0, 0, 0, 0, 0], arms: null, ik: true };
    this.C = { rootX: 0, hipsY: 0.93, hipsX: 0, hipsZ: 0, hipsYaw: 0, torsoX: 0, torsoY: 0, torsoZ: 0, legs: [0, 0, 0, 0], gun: [0, 0, 0, 0, 0, 0], eR: 0, eL: 0, qR: new THREE.Quaternion(), qL: new THREE.Quaternion() };
    this.snapNext = true; this.kind = ''; this.blendT = 0;
  }
  ikHands() {
    const w = this.wkind || 'rifle', g = this.gun, [gr, hg] = GRIPS[w === 'rifle' && this.side === 'f' ? 'fal' : w];   /* our FAL: its pistol grip a little behind, its handguard at the left hand */
    _gq.copy(gr).applyQuaternion(g.quaternion).add(g.position); ikArm(this.sR, this.eR, _gq, POLE_R);
    _gl.copy(hg).applyQuaternion(g.quaternion).add(g.position); ikArm(this.sL, this.eL, _gl, POLE_L);
  }
  setLOD(l) { if (l === this.lod) return; this.lod = l; const L = RIGGEO[this.side].lod[l]; this.mBody.geometry = L.body; this.uni.geometry = L.uni; for (const m of this.mBoot) m.geometry = L.boot; this.helmet.geometry = L.helmet; this.head.geometry = HEADS[this.side][this.faceV][l]; gunGeo(this.gun, this.gun.geometry, l); }
  legs(a, b, c, d) { const L = this.T.legs; L[0] = a; L[1] = b; L[2] = c; L[3] = d; }
  arms(sr, er, sl, el, srz = 0.3, slz = -0.5) { this.T.arms = [sr, er, sl, el, srz, slz]; this.T.ik = false; }
  gunAt(px, py, pz, rx, ry, rz) { const G = this.T.gun; G[0] = px; G[1] = py; G[2] = pz; G[3] = rx; G[4] = ry; G[5] = rz; }
  pose(kind, t, pitch = 0) {
    const R = this, T = R.T; T.rootX = 0; T.hipsY = 0.93; T.hipsX = 0; T.hipsZ = 0; T.hipsYaw = 0; T.torsoX = 0; T.torsoY = 0; T.torsoZ = 0; T.arms = null; T.ik = true;
    if (kind === 'run' || kind === 'walk') {
      // the stride: legs swing, the pelvis rolls and yaws with them, the shoulders turn against the hips, the whole body leans into the run
      const sp = kind === 'run' ? 1 : 0.55, sw = Math.sin(t) * 0.78 * sp, c2 = Math.cos(t * 2);
      R.legs(-sw, 0.15 + Math.max(0, Math.sin(t + 1.6)) * 1.15 * sp, sw, 0.15 + Math.max(0, Math.sin(t + 1.6 + Math.PI)) * 1.15 * sp);
      T.hipsY = 0.9 + Math.abs(Math.cos(t)) * 0.05 * sp; T.hipsX = Math.sin(t) * 0.022 * sp; T.hipsZ = Math.sin(t) * 0.07 * sp; T.hipsYaw = -Math.sin(t) * 0.1 * sp;
      T.torsoX = 0.22 * sp - c2 * 0.02 * sp; T.torsoY = Math.sin(t) * 0.2 * sp; T.torsoZ = -Math.sin(t) * 0.04 * sp;
      R.gunAt(0.02, 0.3, 0.27, -0.45 + c2 * 0.03 * sp, 0.62, 0.2);
    } else if (kind === 'aim' || kind === 'crouch') {
      if (kind === 'crouch') { T.hipsY = 0.55; R.legs(-1.35, 1.45, -0.2, 1.95); T.torsoX = 0.12; }
      else R.legs(-0.12, 0.12, 0.16, 0.1);
      T.torsoX += -pitch * 0.7 + Math.sin(t * 0.9) * 0.008; T.torsoY = 0.18;
      if (R.wkind === 'rpg') R.gunAt(-0.15, 0.53, 0.02, -pitch * 0.3, -0.18, 0); else R.gunAt(-0.1, 0.45 + Math.sin(t * 1.1) * 0.004, 0.4, -pitch * 0.3, -0.2, 0);
    } else if (kind === 'hide') {
      T.hipsY = 0.42; R.legs(-1.75, 2.15, -0.7, 2.3); T.torsoX = 0.6 + Math.sin(t * 1.4) * 0.015; R.gunAt(0.0, 0.24, 0.24, -1.15, 0.25, 0);
    } else if (kind === 'idle') {
      // standing easy: weight shifts slowly from foot to foot, the chest rises with the breath
      const b = Math.sin(t * 0.8), w = Math.sin(t * 0.31);
      R.legs(-0.05 + w * 0.03, 0.05 + Math.max(0, w) * 0.06, 0.05 - w * 0.03, 0.05 + Math.max(0, -w) * 0.06); T.hipsX = w * 0.025; T.hipsZ = w * 0.03; T.torsoX = 0.03 + b * 0.02; T.torsoZ = -w * 0.03; T.torsoY = w * 0.05;
      R.gunAt(-0.03, 0.24 + b * 0.004, 0.25, 0.55, 0.4, 0);
    } else if (kind === 'prone') {
      T.rootX = -Math.PI / 2; R.legs(0.05, 0.1, -0.05, 0.25 + Math.sin(t * 1.3) * 0.1);
      R.arms(-0.2 + Math.sin(t * 2) * 0.15, -0.6, -2.4 + Math.sin(t * 1.7) * 0.3, -0.5, 0.2, -0.2); R.gunAt(0.3, 0.1, -0.4, 0, 0.8, 1.4);
    } else if (kind === 'throw') {
      R.legs(-0.3, 0.2, 0.3, 0.1); T.torsoX = -0.1 + t * 0.4; T.torsoY = -0.2 + t * 0.35; R.arms(-2.6 + t * 2.5, -0.4, -0.8, -0.8, 0.2, -0.4); R.gunAt(0.05, 0.25, 0.2, -0.9, 0.4, 0);
    }
    R.apply(kind);
  }
  fallPose(f, dir, kind = 'knees') {
    // six ways to go down, each in phases: the hit, the legs giving way, the fall, the impact and a slow settling; dir +1 ends on the back, -1 on the face
    const T = this.T, ph = (a, b) => clamp((f - a) / (b - a), 0, 1), ei = (x) => x * x * (0.6 + 0.4 * x), eo = (x) => 1 - (1 - x) * (1 - x), ss = (x) => x * x * (3 - 2 * x);
    const bounce = (t0, a) => (f > t0 ? Math.sin((f - t0) * 20) * Math.exp(-(f - t0) * 8) * a : 0), flat = -dir * Math.PI / 2;
    T.rootX = 0; T.hipsY = 0.93; T.hipsX = 0; T.hipsZ = 0; T.hipsYaw = 0; T.torsoX = 0; T.torsoY = 0; T.torsoZ = 0;
    if (kind === 'back') {
      // thrown back by a round in the chest: the back arches, the arms fly up, a step back that never lands, and he goes down flat
      const j = eo(ph(0, 0.12)), fl = ei(ph(0.1, 0.56)), st = ss(ph(0.56, 0.95));
      T.rootX = -Math.PI / 2 * fl; T.torsoX = -0.5 * j * (1 - fl) + 0.3 * fl * (1 - st) + 0.04 * st; T.torsoY = 0.1 * j; T.hipsY = 0.93 - 0.05 * fl + bounce(0.56, 0.07);
      this.legs(0.35 * j - 0.5 * fl + 0.35 * st, 0.25 * j + 0.7 * fl - 0.45 * st, -0.25 * j - 0.3 * fl + 0.2 * st, 0.5 * j + 0.5 * fl - 0.35 * st);
      this.arms(-2.1 * j + 1.5 * st, -0.5 * j + 0.1 * st, -2.3 * j + 1.9 * st, -0.5 * j + 0.1 * st, 0.4 + 0.5 * j + 0.5 * st, -0.5 - 0.5 * j - 0.5 * st);
      this.gunAt(0.05 + fl * 0.3, 0.25 - fl * 0.1, 0.2, -0.9 + fl * 1.2, 0.4, fl * 1.1);
    } else if (kind === 'spin') {
      // hit in the shoulder: he spins half a turn on his heels clutching it, and goes down on his back and side
      const tw = ss(ph(0, 0.4)), fl = ei(ph(0.38, 0.84)), st = ss(ph(0.84, 1.3)), sg = Math.sin(f * 16);
      T.rootX = -Math.PI / 2 * 0.95 * fl; T.torsoY = -0.9 * tw * (1 - fl); T.torsoZ = 0.35 * tw * (1 - fl) + 0.1 * fl; T.torsoX = 0.15 * tw + 0.2 * fl * (1 - st); T.hipsZ = 0.3 * fl * (1 - st * 0.5); T.hipsY = 0.93 - 0.08 * tw - 0.04 * fl + bounce(0.84, 0.06);
      this.legs(-0.45 * tw * sg - 0.6 * fl + 0.35 * st, 0.5 * tw + 1.1 * fl - 0.7 * st, 0.4 * tw * sg + 0.1 * fl, 0.3 * tw + 0.5 * fl - 0.2 * st);
      this.arms(-0.8 * tw + 0.2 * st, -1.9 * tw + 0.3 * st, -1.3 * tw + 1.0 * st, -0.4 * tw + 0.1 * st, 0.3 - 0.4 * tw, -0.5 - 1.0 * tw - 0.3 * st);
      this.gunAt(0.1 + fl * 0.3, 0.25, 0.2 - fl * 0.2, -0.9 + fl * 1.1, 0.4 + tw * 0.6, fl * 0.8);
    } else if (kind === 'crumple' || kind === 'head') {
      // the legs simply give way (at once after a head shot): he sits down on his heels, slumps, and after a beat keels over sideways into a heap
      const H = kind === 'head', hd = H ? eo(ph(0, 0.08)) * (1 - ph(0.08, 0.3)) : 0, dn = ss(ph(H ? 0.05 : 0.02, H ? 0.34 : 0.32)), sl = ss(ph(0.28, 0.55)), fl = ei(ph(H ? 0.32 : 0.5, H ? 0.76 : 0.95)), st = ss(ph(H ? 0.76 : 0.95, H ? 1.05 : 1.3));
      T.rootX = flat * 0.88 * fl; T.hipsY = 0.93 - 0.63 * dn + bounce(H ? 0.76 : 0.95, 0.05); T.hipsZ = dir * 0.45 * fl; T.hipsYaw = dir * 0.3 * fl;
      T.torsoX = -0.35 * hd + 0.5 * dn + 0.4 * sl - 0.4 * fl * (dir > 0 ? 1 : 0) + 0.1 * st; T.torsoZ = dir * (0.3 * sl - 0.1 * st); T.torsoY = dir * 0.4 * fl;
      this.legs(-0.3 * dn - 0.2 * fl, 2.3 * dn - 0.6 * fl, -0.5 * dn + 0.3 * fl, 2.4 * dn - 1.0 * fl);
      this.arms(0.1 * dn - 0.5 * fl + 0.2 * st, -0.3 * dn - 1.2 * fl + 0.6 * st, 0.1 * dn - 0.9 * fl, -0.3 * dn - 0.5 * fl, 0.3 + 0.2 * dn + 0.6 * fl, -0.4 - 0.2 * dn - 0.4 * fl);
      this.gunAt(0.05 + dn * 0.1, 0.25 - dn * 0.1, 0.2 - dn * 0.3, -0.9 + dn * 0.6 + fl * 0.5, 0.4 + dn * 0.5, dn * 0.6);
    } else if (kind === 'stumble') {
      // hit while running: he folds over his stomach, staggers on a few steps, pitches forward and skids on his face
      const h = eo(ph(0, 0.1)), sg = Math.sin(f * 17), fl = ei(ph(0.42, 0.86)), st = ss(ph(0.86, 1.35)), run = 1 - ph(0.35, 0.5);
      T.rootX = Math.PI / 2 * fl; T.torsoX = 0.6 * h * (1 - fl) + 0.1 * fl; T.hipsY = 0.93 - 0.08 * h + bounce(0.86, 0.06); T.hipsZ = sg * 0.08 * run; T.hipsYaw = -sg * 0.1 * run; T.torsoY = sg * 0.15 * run;
      this.legs(sg * 0.65 * run - 0.3 * fl, 0.55 * run + 0.8 * fl - 0.5 * st, -sg * 0.65 * run - 0.2 * fl, 0.55 * run + 0.6 * fl - 0.4 * st);
      this.arms(-0.7 * h * (1 - fl) - 2.0 * fl + 0.3 * st, -2.0 * h * (1 - fl) - 0.5 * fl - 0.8 * st, -0.7 * h * (1 - fl) - 2.2 * fl, -2.0 * h * (1 - fl) - 0.4 * fl - 1.0 * st, 0.15 + 0.5 * fl, -0.15 - 0.6 * fl);
      this.gunAt(0.05, 0.2 - h * 0.1, 0.1, -0.9 + h * 0.4, 0.4, 0);
    } else {
      // the classic: a round in the body, the knees fold, a moment on his knees swaying, then he goes over and lies still after a bounce
      const j = eo(ph(0, 0.12)) * (1 - ph(0.12, 0.4)), kn = ss(ph(0.06, 0.36)), sw = Math.sin(f * 7) * (1 - ph(0.5, 0.75)), fl = ei(ph(0.52, 0.95)), st = ss(ph(0.95, 1.25)), up = dir < 0 ? 1 : 0;
      T.rootX = flat * fl; T.hipsY = 0.93 - 0.42 * kn + bounce(0.95, 0.07); T.torsoX = -0.3 * j + 0.3 * kn + 0.1 * sw - 0.3 * fl * (dir > 0 ? 1 : -0.3) + 0.05 * st; T.torsoZ = sw * 0.15 * kn; T.torsoY = -0.2 * j * dir + 0.2 * fl * dir;
      this.legs(0.05 * kn - 0.3 * fl + 0.1 * st, 2.0 * kn - 0.6 * fl - 0.2 * st, -0.1 * kn + 0.15 * fl, 2.1 * kn - 1.0 * fl - 0.2 * st);
      // on the face the arms end up by the head, on the back out to the sides
      this.arms(-0.5 * j - 0.3 * kn - 1.2 * fl - 0.9 * up * st + 0.6 * (1 - up) * st, -0.6 * j - 0.4 * kn + 0.2 * fl - 0.8 * up * st, -0.4 * j - 0.3 * kn - 1.6 * fl - 0.7 * up * st + 0.9 * (1 - up) * st, -0.5 * j - 0.3 * kn - 0.6 * up * st, 0.4 + 0.6 * fl + 0.5 * (1 - up) * st, -0.6 - 0.5 * fl - 0.6 * (1 - up) * st);
      this.gunAt(0.05 + fl * 0.15, 0.25 - kn * 0.15, 0.2, -0.9 + kn * 0.5 + fl * 0.5, 0.4, fl * 0.6);
    }
    this.apply('fall');
  }
  apply(kind) {
    const R = this, T = R.T, C = R.C;
    if (kind !== R.kind) { R.blendT = kind === 'fall' ? 0.05 : 0.22; R.kind = kind; }
    R.blendT = Math.max(0, R.blendT - FDT);
    const k = R.snapNext || REDUCED ? 1 : 1 - Math.exp(-FDT * (R.blendT > 0 ? 11 : 26)); R.snapNext = false;
    const mv = (a, b) => a + (b - a) * k;
    C.rootX = mv(C.rootX, T.rootX); C.hipsY = mv(C.hipsY, T.hipsY); C.hipsX = mv(C.hipsX, T.hipsX); C.hipsZ = mv(C.hipsZ, T.hipsZ); C.hipsYaw = mv(C.hipsYaw, T.hipsYaw);
    C.torsoX = mv(C.torsoX, T.torsoX); C.torsoY = mv(C.torsoY, T.torsoY); C.torsoZ = mv(C.torsoZ, T.torsoZ);
    for (let i = 0; i < 4; i++) C.legs[i] = mv(C.legs[i], T.legs[i]); for (let i = 0; i < 6; i++) C.gun[i] = mv(C.gun[i], T.gun[i]);
    R.root.rotation.x = C.rootX; R.hips.position.set(C.hipsX, C.hipsY, 0); R.hips.rotation.set(0, C.hipsYaw, C.hipsZ); R.torso.rotation.set(C.torsoX, C.torsoY, C.torsoZ);
    R.hL.rotation.set(C.legs[0], 0, 0); R.kL.rotation.set(C.legs[1], 0, 0); R.hR.rotation.set(C.legs[2], 0, 0); R.kR.rotation.set(C.legs[3], 0, 0);
    R.gun.position.set(C.gun[0], C.gun[1], C.gun[2]); R.gun.rotation.set(C.gun[3], C.gun[4], C.gun[5]);
    // the arms: either both hands on the weapon (solved from the eased gun) or a free pose; the shoulders ease as rotations
    if (T.ik) { R.ikHands(); }
    else { const A = T.arms; R.sR.rotation.set(A[0], 0, A[4]); R.eR.rotation.set(A[1], 0, 0); R.sL.rotation.set(A[2], 0, A[5]); R.eL.rotation.set(A[3], 0, 0); }
    if (k < 1) { R.sR.quaternion.copy(C.qR.slerp(R.sR.quaternion, k)); R.sL.quaternion.copy(C.qL.slerp(R.sL.quaternion, k)); R.eR.rotation.x = C.eR = mv(C.eR, R.eR.rotation.x); R.eL.rotation.x = C.eL = mv(C.eL, R.eL.rotation.x); }
    else { C.qR.copy(R.sR.quaternion); C.qL.copy(R.sL.quaternion); C.eR = R.eR.rotation.x; C.eL = R.eL.rotation.x; }
    R.life(kind);
  }
  /* what a living body does on its own: the chest rises and falls, the head looks about a little (less with a rifle at the shoulder), the eyes blink */
  life(kind) {
    const R = this; R.breath += FDT; if (REDUCED) return;
    const quick = kind === 'run' ? 2.8 : kind === 'walk' ? 1.9 : 1.25, b = 0.011 * Math.sin(R.breath * quick) * (kind === 'fall' ? 0.3 : 1); R.torso.scale.set(1 + b * 0.4, 1 + b, 1 + b * 0.8);
    if (kind === 'fall') { R.headP.rotation.set(0.12, 0, 0.1); if (!R.shut && !R.deadOpen && R.blendT <= 0) { R.shut = true; R.head.material = MAT.facesShut[R.side][R.faceV]; } return; }
    const calm = kind === 'idle' ? 1 : kind === 'walk' ? 0.8 : kind === 'aim' || kind === 'crouch' || kind === 'hide' || kind === 'prone' ? 0.25 : 0.45, t = R.breath;
    R.headP.rotation.set((0.045 * Math.sin(t * 0.7 + 1) + 0.015 * Math.sin(t * 2.3)) * calm, (0.16 * Math.sin(t * 0.41) + 0.07 * Math.sin(t * 1.13 + 2)) * calm, 0.035 * Math.sin(t * 0.53 + 0.7) * calm);
    R.blinkT -= FDT; if (R.blinkT <= 0) { R.shut = !R.shut; R.head.material = R.shut ? MAT.facesShut[R.side][R.faceV] : MAT.faces[R.side][R.faceV]; R.blinkT = R.shut ? 0.11 : (Math.random() < 0.2 ? 0.25 : rand(2.2, 6.5)); }
  }
}

/* the deaths: how long each takes, and when the hands open and the rifle falls */
const FALLS = { knees: { dur: 1.25, drop: 0.14 }, back: { dur: 1.0, drop: 0.08 }, spin: { dur: 1.3, drop: 0.2, spin: 1 }, crumple: { dur: 1.3, drop: 0.2 }, head: { dur: 1.05, drop: 0.06 }, stumble: { dur: 1.35, drop: 0.3, walk: 1 } };
/* a dead man's rifle lies beside him */
const DROPS = { pool: [], i: 0 };
function dropGun(u) {
  const R = u.rig; if (!R.gun.visible) return; R.gun.visible = false;
  let m = DROPS.pool[DROPS.i]; if (!m) { m = new THREE.Mesh(R.gun.geometry, MAT.vcMetal); SH(m, true, false); onLayer1(m); scene.add(m); DROPS.pool[DROPS.i] = m; } DROPS.i = (DROPS.i + 1) % 28;
  gunGeo(m, R.gun.geometry, 0); m.visible = true; m.scale.setScalar(US * 1.1);
  const a = u.heading + rand(-1, 1), dd = rand(0.3, 0.7), x = u.pos.x + Math.sin(a) * dd, z = u.pos.z + Math.cos(a) * dd;
  m.position.set(x, u.pos.y + 0.05, z); m.rotation.set(0, rand(0, 6.28), (Math.random() < 0.5 ? 1 : -1) * rand(1.3, 1.7));
}
function dropsClear() { for (const m of DROPS.pool) m.visible = false; }

/* ================= units ================= */
const UNITS = { enemies: [], friends: [] };
class Unit {
  constructor(side, kind) { this.side = side; this.kind = kind; this.rig = new Rig(side, side === 'f' ? FAL_W : WGEO[WKIND(kind)]); this.rig.wkind = side === 'f' ? 'rifle' : WKIND(kind); this.tag = new THREE.Sprite(TAGM[side]); this.tag.center.set(0.5, 0); this.tag.scale.setScalar(side === 'f' ? 0.028 : 0.032); this.tag.visible = false; this.tag.renderOrder = 5; onLayer1(this.tag); scene.add(this.tag); this.pos = V3(); this.vs = 1; this.heading = 0; this.alive = false; this.stance = 'stand'; this.anim = Math.random() * 6; this.fall = -1; this.fallDir = 1; }
  setKind(kind) { this.kind = kind; this.rig.wkind = this.side === 'f' ? 'rifle' : WKIND(kind); gunGeo(this.rig.gun, this.side === 'f' ? FAL_W : WGEO[WKIND(kind)], this.rig.lod); }
  place(x, z, y) { this.pos.set(x, y === undefined ? groundAt(x, z) : hAt(x, z, y), z); this.snapHd = true; this.rig.snapNext = true; }
  sync() {
    this.rig.root.position.copy(this.pos); if (this.fall >= 0) this.rig.root.position.y += 0.12 * clamp(this.fall / 0.55, 0, 1);
    if (this.snapHd || this.hdV === undefined || REDUCED) { this.hdV = this.heading; this.snapHd = false; } else this.hdV += wrapPi(this.heading - this.hdV) * (1 - Math.exp(-FDT * 12));
    this.rig.root.rotation.y = this.hdV;
    const far = camera.position.distanceTo(this.pos), hid = this.stance === 'hide' && this.side === 'e' && MODE !== 'mezach';
    { const eff = far * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) / 0.7265 / (this.vs || 1), lv = this.rig.lod; let want = eff < QLOD[0] ? 0 : eff < QLOD[1] ? 1 : 2;
      if (want < lv && eff > QLOD[want] * 0.9) want = lv; this.rig.setLOD(want); }
    // far enemies are drawn larger (by how small they would look through the current lens), so a soldier always reads as a soldier
    if (this.side === 'e') { const want = CINE.on || (this.sz === 'win' && this.stance === 'hide') /* a man ducked behind bags or a parapet stays his real size, so they hide him */ ? 1 : clamp(0.03 * far * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2), 1, 2.1); this.vs += (want - this.vs) * 0.25; this.rig.root.scale.setScalar(US * this.vs); }
    const show = this.rig.root.visible && this.alive && this.stance !== 'down' && (this.stance !== 'hide' || hid) && this.fall < 0; this.tag.visible = show && !CINE.on && !this.noTag && (this.side === 'f' || far > 12);
    if (this.tag.visible) { this.tag.position.set(this.pos.x, this.pos.y + (this.stance === 'crouch' ? 1.55 : 2.2) * US * this.vs, this.pos.z);
      if (this.side === 'e') { const aim = (this.rpgAim > 0.1 && this.peek) || !!this.guide, fired = GAME.t - (this.shotT ?? -9) < (MODE === 'suez' ? 2.6 : 1.3), field = MODE !== 'mezach', big = field && P.mode === 'tank', base = big ? 0.04 : field ? 0.032 : 0.026;
        this.tag.material = aim ? TAGM.rpg : fired ? TAGM.fire : hid ? TAGM.dim : this.kind === 'rpg' && field ? TAGM.rpg : TAGM.e;
        this.tag.scale.setScalar(aim ? base * 1.35 + 0.014 * Math.sin(GAME.t * 14) : fired ? base * 1.3 : this.kind === 'rpg' && field ? base * 1.15 : base); } }
  }
  face(x, z) { this.heading = Math.atan2(x - this.pos.x, z - this.pos.z); }
  eye() { return V3(this.pos.x, this.pos.y + (this.stance === 'hide' ? 0.78 : this.stance === 'crouch' ? 1.02 : 1.62) * US, this.pos.z); }
  chest() { return V3(this.pos.x, this.pos.y + (this.stance === 'hide' ? 0.58 : this.stance === 'crouch' ? 0.75 : 1.22) * US * this.vs, this.pos.z); }
  capsule() {
    if (this.stance === 'down') { const bx = -Math.sin(this.heading) * 1.5 * this.fallDir, bz = -Math.cos(this.heading) * 1.5 * this.fallDir; return [V3(this.pos.x, this.pos.y + 0.25, this.pos.z), V3(this.pos.x + bx, this.pos.y + 0.25, this.pos.z + bz), 0.3]; }
    return [V3(this.pos.x, this.pos.y + 0.25, this.pos.z), V3(this.pos.x, this.pos.y + (this.stance === 'hide' ? 0.76 : this.stance === 'crouch' ? 1.02 : 1.6) * US * this.vs, this.pos.z), 0.3 * this.vs];
  }
  muzzle() { const c = this.chest(); return V3(c.x + Math.sin(this.heading) * 0.8, c.y + 0.15, c.z + Math.cos(this.heading) * 0.8); }
}
for (let i = 0; i < (LITE ? 60 : 96); i++) UNITS.enemies.push(new Unit('e', 'rifle'));

/* ================= boats ================= */
/* the wooden assault boat of the crossing: a double-ended whaleboat painted white, a dark rubbing strake under the gunwale and antifouling below
   the waterline, thwarts and floorboards inside; three pairs of oars, soldiers packed between the rowers, a flag at the bow of some.
   Local units (the group is scaled by BOAT_S): bow at +x, the waterline at y = 0 */
const BOAT_L = 2.75, BOAT_B = 0.68;
const boatW = (u) => BOAT_B * Math.pow(Math.max(0, 1 - u * u), 0.55);          // half-breadth at the gunwale
const boatG = (u) => 0.36 + 0.24 * Math.pow(Math.abs(u), 3.2);                    // the sheer, rising toward stem and stern
const boatK = (u) => -0.3 * (1 - 0.3 * u * u);                                    // the keel line
function boatShell(kw, kg, kk, inner) {
  const NU = 34, NV = 9, pos = [], uv = [], idx = [];
  for (let i = 0; i <= NU; i++) { const t = -1 + 2 * i / NU, u = Math.sign(t) * (1 - Math.cos(Math.abs(t) * Math.PI / 2)) * 0.5 + t * 0.5, x = u * BOAT_L, w = boatW(u) * kw, yg = boatG(u) + kg, yk = boatK(u) + kk;
    for (let sd = -1; sd <= 1; sd += 2) for (let j = 0; j <= NV; j++) { const th = j / NV * Math.PI / 2; pos.push(x, yk + (yg - yk) * (1 - Math.cos(th)), sd * w * Math.sin(th)); uv.push(x * 0.9, j / NV); } }
  const row = 2 * (NV + 1);
  for (let i = 0; i < NU; i++) for (let sd = 0; sd < 2; sd++) for (let j = 0; j < NV; j++) { const a = i * row + sd * (NV + 1) + j, b = a + 1, c = a + row, d = c + 1; const flip = (sd === 1) !== inner; if (flip) idx.push(a, c, b, b, c, d); else idx.push(a, b, c, b, d, c); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return g;
}
// the strip that closes the top edge between the outer planking and the inner lining
function boatRim() {
  const NU = 40, pos = [], idx = [];
  for (let i = 0; i <= NU; i++) { const u = -1 + 2 * i / NU, x = u * BOAT_L * 0.995, w = boatW(u), y = boatG(u); for (const sd of [-1, 1]) pos.push(x, y + 0.012, sd * w, x, y + 0.012, sd * w * 0.9); }
  for (let i = 0; i < NU; i++) for (let k = 0; k < 2; k++) { const a = i * 4 + k * 2, b = a + 1, c = a + 4, d = c + 1; idx.push(a, b, c, b, d, c, a, c, b, b, c, d); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return g;
}
const BOAT_GEO = (() => {
  const paint = (x, y) => { const u = x / BOAT_L, yg = boatG(u); return y > yg - 0.07 ? 0x3a3f36 : y < 0.015 ? 0x6b3426 : 0xe9e4d6; };
  const parts = [[boatShell(1, 0, 0, false), paint], [boatShell(0.9, -0.03, 0.05, true), (x, y) => (y < -0.05 ? 0x7a5e40 : 0xd9d2c0)], [boatRim(), 0x4a3c2c]];
  // floorboards, thwarts, the stem and stern posts, oarlocks
  for (let k = -5; k <= 5; k++) parts.push([G.box(0.14, 0.03, 0.62 * Math.max(0.3, 1 - Math.abs(k) / 6.5)), 0x8a6a46, M4(k * 0.42, 0.0, 0)]);
  for (const x of [-1.95, -1.3, -0.65, 0, 0.65, 1.3, 1.95]) { const w = boatW(x / BOAT_L) * 0.88; parts.push([G.box(0.16, 0.035, w * 2), 0x9a7a52, M4(x, 0.19, 0)]); }
  for (const sd of [-1, 1]) parts.push([G.box(0.07, 0.62, 0.07), 0x4a3c2c, M4(sd * BOAT_L * 0.985, 0.2, 0, 0, 0, sd * 0.32)]);
  for (const x of [-1.3, 0, 1.3]) for (const sd of [-1, 1]) parts.push([G.box(0.04, 0.09, 0.04), 0x2a2a28, M4(x, boatG(x / BOAT_L) + 0.05, sd * boatW(x / BOAT_L))]);
  return build(parts);
})();
MAT.boatWood = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.82, metalness: 0, map: TX.grime });
// an oar: the handle inboard of the oarlock (z < 0), the loom out over the water, the blade at the end; pivot at the oarlock
const OAR_GEO = build([[G.cyl(0.022, 0.022, 0.42, 6), 0x6a4e34, M4(0, 0, -0.32, Math.PI / 2, 0, 0)], [G.cyl(0.026, 0.02, 1.85, 6), 0xb79b6c, M4(0, 0, 0.82, Math.PI / 2, 0, 0)], [G.box(0.015, 0.11, 0.48), 0xc7ab78, M4(0, 0, 1.92)]]);
// a rower: the seated soldier without his rifle, both arms out on the oar handle
const SEATED_ROW = build([
  [G.cap(0.15, 0.22, 4, 10), 0x9f8b5f, M4(0, 0.56, 0, 0, 0, 0, 1.1, 1, 0.8)], [G.box(0.34, 0.2, 0.26), 0x6a6142, M4(0, 0.55, 0)], [G.box(0.26, 0.12, 0.22), 0x4b4a36, M4(0, 0.52, -0.2)],
  [G.sph(0.095, 12, 10), 0x9a6f4f, M4(0, 0.9, 0.02, 0, 0, 0, 0.9, 1.05, 1)], [G.sph(0.13, 14, 7, 0, Math.PI * 2, 0, Math.PI * 0.52), 0x4a5840, M4(0, 0.92, 0, 0, 0, 0, 1, 1, 1.06)], [G.cyl(0.133, 0.15, 0.04, 16, true), 0x4a5840, M4(0, 0.9, 0)],
  [G.cap(0.075, 0.3, 4, 8), 0x907e56, M4(-0.09, 0.28, 0.2, Math.PI / 2, 0, 0)], [G.cap(0.075, 0.3, 4, 8), 0x907e56, M4(0.09, 0.28, 0.2, Math.PI / 2, 0, 0)], ...[-0.09, 0.09].map((x) => [G.box(0.11, 0.06, 0.2), 0x2a2420, M4(x, 0.08, 0.4)]),
  [G.cap(0.05, 0.3, 4, 8), 0x9f8b5f, M4(-0.15, 0.66, 0.2, -1.35, 0, 0.12)], [G.cap(0.05, 0.3, 4, 8), 0x9f8b5f, M4(0.15, 0.66, 0.2, -1.35, 0, -0.12)], ...[-0.13, 0.13].map((x) => [G.sph(0.05, 8, 6), 0x9a6f4f, M4(x, 0.68, 0.43)]),
]);
let BOAT_FLAG = null;
function boatFlag() {
  if (BOAT_FLAG) return BOAT_FLAG;
  const geo = new THREE.PlaneGeometry(0.62, 0.42, 8, 1); geo.translate(0.31, 0, 0); FLAGS.push({ geo, base: geo.attributes.position.array.slice() });
  BOAT_FLAG = { geo, mat: new THREE.MeshStandardMaterial({ map: flagTex('eg'), side: THREE.DoubleSide, roughness: 0.9 }) }; return BOAT_FLAG;
}
const BOATS = [], BOAT_S = 1.55;
// the fighters' places (filled in this order), then the rowers'
const SEATS = [[-1.95, -0.36], [-1.95, 0.36], [-0.65, -0.36], [-0.65, 0.36], [0.65, -0.36], [0.65, 0.36], [1.95, -0.3], [1.95, 0.3], [-2.35, 0], [2.35, 0]];
const ROW_SEATS = [[-1.3, -0.24], [-1.3, 0.24], [0, -0.24], [0, 0.24], [1.3, -0.24], [1.3, 0.24]];
class Boat {
  constructor(from, to, n, speed, delay, nr = LITE ? 4 : 6) {
    this.g = new THREE.Group(); this.hull = new THREE.Mesh(BOAT_GEO, MAT.boatWood); this.g.add(this.hull); SH(this.hull, true, false);
    this.from = from; this.to = to; this.speed = speed; this.t = -delay; this.hp = 240; this.state = 'wait'; this.g.scale.setScalar(BOAT_S);
    this.len = Math.hypot(to[0] - from[0], to[1] - from[1]); this.heading = Math.atan2(to[0] - from[0], to[1] - from[1]); this.ph = Math.random() * 6.28;
    this.seats = [];
    // the soldiers, facing the bow with their rifles
    for (let i = 0; i < n && i < SEATS.length; i++) { const m = new THREE.Mesh(SEATED, MAT.clothE); m.position.set(SEATS[i][0], 0.02, SEATS[i][1]); m.rotation.y = Math.PI / 2; m.scale.setScalar(US / BOAT_S); this.g.add(m); this.seats.push({ m, alive: true, kind: 'rifle', sp: SEATS[i] }); }
    // the rowers face the stern, each with his oar over his own side
    for (let i = 0; i < nr; i++) { const [x, z] = ROW_SEATS[nr <= 4 ? i + 2 : i], m = new THREE.Mesh(SEATED_ROW, MAT.clothE); m.position.set(x, 0.02, z); m.rotation.order = 'YXZ'; m.rotation.y = -Math.PI / 2; m.scale.setScalar(US / BOAT_S); this.g.add(m);
      const sd = Math.sign(z), oar = new THREE.Group(); oar.position.set(x, boatG(x / BOAT_L) + 0.07, sd * boatW(x / BOAT_L)); oar.rotation.order = 'YXZ'; const om = new THREE.Mesh(OAR_GEO, MAT.vc); om.rotation.y = sd < 0 ? Math.PI : 0; oar.add(om); this.g.add(oar);
      this.seats.push({ m, alive: true, kind: 'rifle', sp: [x, z], rower: true, oar, sd }); }
    if (Math.random() < 0.34) { const F = boatFlag(), pole = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, 1.3, 5).translate(0, 0.65, 0), MAT.wood || MAT.vc); pole.position.set(BOAT_L * 0.9, boatG(0.9), 0); const fl = new THREE.Mesh(F.geo, F.mat); fl.position.set(0, 1.12, 0); pole.add(fl); this.g.add(pole); this.flag = pole; }
    // far off, the boat is drawn as one piece - hull, men and oars baked together, as the scenery's boats are - instead of some twenty: the canal can be full of boats
    this.lod = new THREE.Mesh(FLOT_GEO, MAT.boatWood); this.lod.visible = false; this.g.add(this.lod); this.lodOn = false; this.intact = true;
    this.g.rotation.order = 'YXZ'; this.g.rotation.y = this.heading - Math.PI / 2; this.g.position.set(from[0], 0, from[1]); this.g.visible = false;
    onLayer1(this.g); this.hull.layers.enableAll(); scene.add(this.g); BOATS.push(this);
  }
  setLod(on) {
    if (on === this.lodOn) return; this.lodOn = on; this.lod.visible = on; this.hull.visible = !on;
    for (const q of this.seats) { q.m.visible = !on && q.alive && !q.gone && !(q.rower && this.filmHide); if (q.oar) q.oar.visible = !on && !q.gone && !this.filmHide; }
  }
  seatWorld(i, out = V3()) { const s = this.seats[i].sp; out.set(s[0], 0.02, s[1]).applyMatrix4(this.g.matrixWorld); return out; }
  aliveCount() { return this.seats.filter((s) => s.alive).length; }
  // the stroke: blades swing aft through the water and come back feathered above it; the rowers lean into it. A dead man's oar trails
  row(dt, rate = 2.5, splash = true) {
    const ph0 = this.ph, ph = (this.ph += dt * rate), c0 = Math.cos(ph0), c1 = Math.cos(ph), sw = 0.4 * Math.sin(ph), near = splash && camera.position.distanceTo(this.g.position) < 160;
    for (const s of this.seats) { if (!s.rower) continue;
      if (!s.alive) { s.oar.rotation.set(-0.05 * s.sd, -0.35 * s.sd, 0); continue; }
      const dip = 0.19 - 0.09 * clamp(c1 * 3, -1, 1); s.oar.rotation.set(dip * s.sd, -sw * s.sd, 0); s.m.rotation.x = -0.2 * Math.sin(ph);
      if (near && c0 > 0 && c1 <= 0) { const b = s.oar.localToWorld(V3(0, 0, 2.0 * s.sd)); b.y = 0.12; fxDust(b, true); } }
  }
  dispose() { scene.remove(this.g); this.dead = true; }
}

/* the rest of the crossing: the canal north and south of the stronghold full of the same white boats, rowing over from the Port Tewfik quays
   to the bank on either side of us. Scenery only (one instanced mesh: hull, men and oars baked together) - the fight is the boats that come at us */
// the far boats' men: the seated soldier in a handful of boxes (they are a hundred metres off and more)
const FLOT_FIG = build([[G.box(0.3, 0.4, 0.24), 0x9f8b5f, M4(0, 0.56, 0)], [G.box(0.26, 0.12, 0.2), 0x4b4a36, M4(0, 0.52, -0.18)], [G.sph(0.095, 6, 4), 0x9a6f4f, M4(0, 0.88, 0.02)], [G.sph(0.13, 7, 3, 0, Math.PI * 2, 0, Math.PI * 0.52), 0x4a5840, M4(0, 0.92, 0)],
  [G.box(0.24, 0.12, 0.42), 0x907e56, M4(0, 0.3, 0.18)], [G.box(0.36, 0.09, 0.09), 0x9f8b5f, M4(0, 0.64, 0.22)], [G.box(0.04, 0.06, 0.66), 0x1d1d1d, M4(0.06, 0.66, 0.24, -0.9, 0, 0)]]);
const FLOT_ROW = build([[G.box(0.3, 0.4, 0.24), 0x9f8b5f, M4(0, 0.56, 0)], [G.box(0.26, 0.12, 0.2), 0x4b4a36, M4(0, 0.52, -0.18)], [G.sph(0.095, 6, 4), 0x9a6f4f, M4(0, 0.88, 0.02)], [G.sph(0.13, 7, 3, 0, Math.PI * 2, 0, Math.PI * 0.52), 0x4a5840, M4(0, 0.92, 0)],
  [G.box(0.24, 0.12, 0.42), 0x907e56, M4(0, 0.3, 0.18)], ...[-0.15, 0.15].map((x) => [G.box(0.08, 0.08, 0.34), 0x9f8b5f, M4(x, 0.66, 0.24)])]);
const FLOT_OAR = build([[G.box(0.04, 0.04, 2.3), 0xb79b6c, M4(0, 0, 0.75)], [G.box(0.015, 0.11, 0.48), 0xc7ab78, M4(0, 0, 1.92)]]);
const FLOT_GEO = (() => {
  const s = US / BOAT_S, list = [BOAT_GEO.clone()], m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  const add = (geo, x, y, z, rx, ry, rz, sc) => { e.set(rx, ry, rz, 'YXZ'); m.compose(V3(x, y, z), q.setFromEuler(e), V3(sc, sc, sc)); list.push(geo.clone().applyMatrix4(m)); };
  for (let i = 0; i < 8; i++) add(FLOT_FIG, SEATS[i][0], 0.02, SEATS[i][1], 0, Math.PI / 2, 0, s);
  for (const [x, z] of ROW_SEATS) { const sd = Math.sign(z); add(FLOT_ROW, x, 0.02, z, -0.12, -Math.PI / 2, 0, s);
    const o = new THREE.Matrix4().compose(V3(x, boatG(x / BOAT_L) + 0.07, sd * boatW(x / BOAT_L)), new THREE.Quaternion().setFromEuler(new THREE.Euler(0.16 * sd, -0.15 * sd, 0, 'YXZ')), V3(1, 1, 1));
    const oy = new THREE.Matrix4().makeRotationY(sd < 0 ? Math.PI : 0); list.push(FLOT_OAR.clone().applyMatrix4(o.multiply(oy))); }
  return mergeGeometries(list, false);
})();
const FLOT = { mesh: null, b: [], on: false };
function flotBuild() {
  if (FLOT.mesh) return; const n = LITE ? 18 : 40;
  FLOT.mesh = new THREE.InstancedMesh(FLOT_GEO, MAT.boatWood, n); FLOT.mesh.frustumCulled = false; FLOT.mesh.count = 0; FLOT.mesh.layers.enableAll(); scene.add(FLOT.mesh);
  for (let i = 0; i < n; i++) FLOT.b.push({ st: 'off', t: 0, ph: Math.random() * 6.28 });
}
/* a lane: off the Port Tewfik quay to the bank of the tongue, north (z -560..-170) or south (z 170..470) of the stronghold */
function flotLaunch(b, i, first) {
  const north = i % 2 === 0, z1 = north ? rand(-540, -175) : rand(175, 460), z0 = clamp(z1 * rand(0.25, 0.75), -480, 380), x0 = -492 + PTDX + rand(0, 8), x1 = tongueWestX(z1) - 4.5;
  b.from = [x0, z0]; b.to = [x1, z1]; b.len = Math.hypot(x1 - x0, z1 - z0); b.hd = Math.atan2(x1 - x0, z1 - z0); b.sp = rand(1.5, 2.2);
  b.t = first ? rand(0, 0.85) * b.len / b.sp : -rand(0, 14); b.st = 'cross';
}
const _fm = new THREE.Matrix4(), _fq = new THREE.Quaternion(), _fe = new THREE.Euler(0, 0, 0, 'YXZ'), _fp = V3(), _fs = V3(BOAT_S, BOAT_S, BOAT_S);
function flotUpd(dt, want) {
  if (want && !FLOT.mesh) flotBuild(); if (!FLOT.mesh) return;
  if (want && !FLOT.on) { FLOT.on = true; FLOT.b.forEach((b, i) => flotLaunch(b, i, true)); }
  if (!want) FLOT.on = false;
  let n = 0; const T = GAME.t;
  for (let i = 0; i < FLOT.b.length; i++) { const b = FLOT.b[i]; if (b.st === 'off') continue; b.t += dt;
    let x, z, y = 0.03 + Math.sin(T * 1.4 + b.ph) * 0.05, rx = Math.sin(T * 1.1 + b.ph) * 0.04, rz = 0.02 + Math.sin(T * 2.4 + b.ph) * 0.015;
    if (b.st === 'cross') { if (b.t < 0) continue; const u = Math.min(1, b.t * b.sp / b.len); x = lerp(b.from[0], b.to[0], u); z = lerp(b.from[1], b.to[1], u); if (u >= 1) { b.st = 'beach'; b.t = 0; } }
    else { x = b.to[0]; z = b.to[1]; y = 0.03 - Math.max(0, b.t - 30) * 0.15; rz = 0.08; rx = 0.05;   // run up on the bank, the men gone over the side; later it is pulled out of sight
      if (b.t > 34) { if (FLOT.on) flotLaunch(b, i, false); else { b.st = 'off'; continue; } } }
    _fe.set(rx, b.hd - Math.PI / 2, rz); _fm.compose(_fp.set(x, y, z), _fq.setFromEuler(_fe), _fs); FLOT.mesh.setMatrixAt(n++, _fm);
  }
  FLOT.mesh.count = n; FLOT.mesh.instanceMatrix.needsUpdate = true; FLOT.mesh.visible = n > 0;
}
function flotReset() { if (!FLOT.mesh) return; FLOT.on = false; for (const b of FLOT.b) b.st = 'off'; FLOT.mesh.count = 0; FLOT.mesh.visible = false; }

/* ================= aircraft ================= */
const JET_GEO = (() => {
  const C = 0xa3a8a6, D = 0x7a8180, K = 0x26292b, GL = 0x3e5566;
  const wR = G.ext([[2.2, 0], [-2.8, 3.8], [-3.5, 3.8], [-3.7, 0]], 0.1).rotateX(Math.PI / 2), wL = G.ext([[2.2, 0], [-3.7, 0], [-3.5, -3.8], [-2.8, -3.8]], 0.1).rotateX(Math.PI / 2);
  const hR = G.ext([[-4.3, 0], [-5.5, 1.6], [-6.0, 1.6], [-6.0, 0]], 0.07).rotateX(Math.PI / 2), hL = G.ext([[-4.3, 0], [-6.0, 0], [-6.0, -1.6], [-5.5, -1.6]], 0.07).rotateX(Math.PI / 2);
  const fin = G.ext([[-3.1, 0], [-5.4, 2.5], [-6.1, 2.5], [-6.0, 0]], 0.09).translate(0, 0, -0.045);
  return build([
    [G.cyl(0.52, 0.64, 11, 16), C, M4(0, 0, 0, 0, 0, -Math.PI / 2)], [G.cyl(0.64, 0.6, 0.6, 16), K, M4(-5.8, 0, 0, 0, 0, -Math.PI / 2)],
    [G.cyl(0.52, 0.52, 0.3, 16, true), D, M4(5.65, 0, 0, 0, 0, -Math.PI / 2)], [G.cone(0.3, 1.1, 14), K, M4(6.1, 0, 0, 0, 0, -Math.PI / 2)],
    [G.sph(0.42, 14, 8), GL, M4(3.2, 0.48, 0, 0, 0, 0, 2.3, 0.85, 0.85)], [G.box(4.2, 0.3, 0.26), D, M4(0.4, 0.55, 0)],
    [wR, C, M4(0, -0.12, 0.3)], [wL, C, M4(0, -0.12, -0.3)], [hR, D, M4(0, 0.05, 0.3)], [hL, D, M4(0, 0.05, -0.3)], [fin, D, M4(0, 0.4, 0)],
    [G.box(1.6, 0.35, 0.3), K, M4(0.2, -0.62, 0)], ...[-1, 1].map((sd) => [G.cyl(0.14, 0.14, 1.6, 8), 0x5c6a5a, M4(-0.4, -0.45, sd * 1.9, 0, 0, Math.PI / 2)]),
  ]);
})();
const JETS = [];
function spawnJets(delay = 0) {
  for (let i = 0; i < 2; i++) {
    const m = new THREE.Mesh(JET_GEO, MAT.jet); SH(m, true, false); m.visible = false; scene.add(m);
    const y = 62 + i * 18, z0 = -30 + i * 60; const from = V3(-1250 - i * 110, y, z0 - 260), to = V3(3600, y + 70, z0 + 620);
    const dx = to.x - from.x, dz = to.z - from.z; m.rotation.set(0, Math.atan2(-dz, dx), 0); m.rotateX(i ? 0.25 : -0.2);
    JETS.push({ m, from, to, t: -delay - i * 0.35, dur: from.distanceTo(to) / 150, i, heard: false });
  }
}
function updJets(dt) {
  for (const j of [...JETS]) {
    j.t += dt * 0.6; if (j.t < 0) continue; const u = j.t / j.dur; j.m.visible = true;
    if (u >= 1) { scene.remove(j.m); JETS.splice(JETS.indexOf(j), 1); continue; }
    j.m.position.lerpVectors(j.from, j.to, u);
    if (!j.heard && j.i === 0) { j.heard = true; const cx = (0 - j.from.x) / (j.to.x - j.from.x); sndJet(Math.max(0.5, cx * j.dur - j.t)); }
  }
}

/* ================= effects ================= */
const HDC = new THREE.Color(HDRK, HDRK, HDRK);
const FXT = {
  flash: flashStarTex(), glow: radialTex([[0, 'rgba(255,248,220,1)'], [0.2, 'rgba(255,200,110,.9)'], [0.6, 'rgba(255,110,30,.35)'], [1, 'rgba(255,80,0,0)']]),
  fire: radialTex([[0, 'rgba(255,240,190,1)'], [0.3, 'rgba(255,170,60,.9)'], [0.7, 'rgba(230,80,20,.35)'], [1, 'rgba(200,40,0,0)']]),
  puff: puffTex(), flare: radialTex([[0, 'rgba(255,255,245,1)'], [0.12, 'rgba(255,250,220,.95)'], [0.4, 'rgba(255,230,170,.25)'], [1, 'rgba(255,220,150,0)']]),
};
class SpritePool {
  constructor(n, map, additive, color = 0xffffff, layer1 = false) {
    this.items = []; for (let i = 0; i < n; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map, transparent: true, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending, toneMapped: !additive, color, fog: !additive })); s.visible = false; if (layer1) s.layers.set(1); scene.add(s); this.items.push({ s, t: 99, life: 1, upd: null }); }
  }
  get() { let b = this.items[0]; for (const q of this.items) if (q.t / q.life > b.t / b.life) b = q; b.t = 0; b.s.visible = true; b.s.material.rotation = Math.random() * 6.28; return b; }
  update(dt) { for (const q of this.items) { if (!q.s.visible) continue; q.t += dt; if (q.t >= q.life) { q.s.visible = false; continue; } q.upd && q.upd(q, q.t / q.life, dt); } }
  clear() { for (const q of this.items) { q.s.visible = false; q.t = 99; } }
}
const FX = {
  flashes: new SpritePool(28, FXT.flash, true, HDC), glows: new SpritePool(18, FXT.glow, true, HDC), smoke: new SpritePool(LITE ? 70 : 130, FXT.puff, false, 0x5c5a55), dust: new SpritePool(LITE ? 70 : 160, FXT.puff, false, 0xb5a585, true), fire: new SpritePool(26, FXT.fire, true, HDC),
  trail: new SpritePool(LITE ? 120 : 340, FXT.puff, false, 0xb5a585, true), exh: new SpritePool(LITE ? 50 : 130, FXT.puff, false, 0x45433f, true),   // the dust behind moving vehicles and their exhaust
  tracers: [], shake: 0,
};
{
  const tg = new THREE.BoxGeometry(0.06, 0.06, 1).translate(0, 0, -0.5);
  for (let i = 0; i < 70; i++) { const m = new THREE.Mesh(tg, new THREE.MeshBasicMaterial({ color: 0xff5a36, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, fog: false })); m.visible = false; m.frustumCulled = false; scene.add(m); FX.tracers.push({ m, a: V3(), b: V3(), d: 0, t: 0, len: 0, on: false }); }
}
function fxMuzzle(p, big = false) { const q = FX.flashes.get(); q.life = 0.06; q.s.position.copy(p); q.s.scale.setScalar(big ? 1.2 : 0.8); q.upd = null; }
function fxTracer(a, b, green) {
  let tr = FX.tracers.find((q) => !q.on); if (!tr) return; tr.on = true; tr.a.copy(a); tr.b.copy(b); tr.len = a.distanceTo(b); tr.t = 0;
  tr.m.material.color.set(green ? 0x6dff6a : 0xff5a36).multiplyScalar(HDRK * 1.3); tr.m.visible = true; tr.m.scale.set(1, 1, Math.min(14, tr.len));
  tr.m.position.copy(a); tr.m.lookAt(b);
}
function updateTracers(dt) {
  for (const tr of FX.tracers) { if (!tr.on) continue; tr.t += dt * 850; if (tr.t > tr.len + 14) { tr.on = false; tr.m.visible = false; continue; } const u = Math.min(tr.t, tr.len) / Math.max(tr.len, 0.01); tr.m.position.lerpVectors(tr.a, tr.b, u); tr.m.scale.z = Math.max(0.01, Math.min(14, tr.len * u, tr.len - Math.max(0, tr.t - tr.len)));
    // a round that passes through the camera itself would paint a wedge across the whole screen: it is not drawn for that instant
    const L = tr.m.scale.z, hx = tr.m.position.x, hy = tr.m.position.y, hz = tr.m.position.z, il = 1 / Math.max(tr.len, 0.01), dx = (tr.a.x - tr.b.x) * il, dy = (tr.a.y - tr.b.y) * il, dz = (tr.a.z - tr.b.z) * il, cx = camera.position.x - hx, cy = camera.position.y - hy, cz = camera.position.z - hz, k = clamp(cx * dx + cy * dy + cz * dz, 0, L);
    tr.m.visible = (cx - dx * k) ** 2 + (cy - dy * k) ** 2 + (cz - dz * k) ** 2 > 4; }
}
function fxDust(p, water = false) {
  const q = FX.dust.get(); q.life = 0.9; q.s.position.copy(p); q.s.material.color.set(water ? 0xd4dde2 : 0xa8966f); const s0 = water ? 0.6 : 0.35;
  q.upd = (q, u) => { q.s.scale.setScalar(s0 + u * (water ? 1.6 : 1.3)); q.s.position.y += 0.012; q.s.material.opacity = 0.8 * (1 - u); };
}
function fxExplosion(p, size = 1) {
  const land = groundAt(p.x, p.z) > 0.05;
  const f = FX.glows.get(); f.life = 0.3; f.s.position.set(p.x, p.y + 1.4 * size, p.z); f.upd = (q, u) => { q.s.scale.setScalar((13 - 9 * u) * size); q.s.material.opacity = 1 - u; };
  const fl = FX.flashes.get(); fl.life = 0.08; fl.s.position.set(p.x, p.y + 0.8 * size, p.z); fl.s.scale.setScalar(7 * size); fl.upd = null;
  for (let i = 0; i < (LITE ? 4 : 8); i++) {
    const d = FX.dust.get(); d.life = 2.4 + Math.random() * 2; const ox = rand(-1.3, 1.3) * size, oz = rand(-1.3, 1.3) * size, vy = rand(5, 12) * size * (land ? 1 : 1.5), sx = rand(-0.9, 0.9);
    d.s.position.set(p.x + ox, p.y + 0.6, p.z + oz); d.s.material.color.set(land ? (i % 2 ? 0x9d8a68 : 0x7d6b51) : 0xe2e8ea);
    d.upd = (q, u, dt) => { q.s.position.y += vy * dt * Math.pow(1 - u, 2.2); q.s.position.x += sx * dt; q.s.scale.setScalar((1.5 + u * 7.5) * size); q.s.material.opacity = 0.92 * (1 - u) * Math.min(1, u * 14 + 0.25); };
  }
  for (let i = 0; i < 3; i++) { const s = FX.smoke.get(); s.life = 5 + Math.random() * 3; const ox = rand(-1.5, 1.5) * size, oz = rand(-1.5, 1.5) * size, vy = rand(1.5, 3.5); s.s.position.set(p.x + ox, p.y + 1.5 * size, p.z + oz); s.s.material.color.set(i ? 0x5e5850 : 0x35312d); s.upd = (q, u, dt) => { q.s.position.y += vy * dt * (1 - u); q.s.position.x += 0.8 * dt; q.s.scale.setScalar((2.5 + u * 11) * size); q.s.material.opacity = 0.62 * (1 - u) * Math.min(1, u * 10); }; }
  for (let i = 0; i < (LITE ? 4 : 8); i++) { const d = FX.dust.get(); d.life = 1.3; const vx = rand(-7, 7), vz = rand(-7, 7); let vy = rand(8, 17); d.s.position.set(p.x, p.y + 0.5, p.z); d.s.material.color.set(land ? 0x5a4c3a : 0xdfe6e8); d.upd = (q, u, dt) => { vy -= 20 * dt; q.s.position.x += vx * dt; q.s.position.z += vz * dt; q.s.position.y += vy * dt; q.s.scale.setScalar(0.5 + u * 1.4); q.s.material.opacity = 0.95 * (1 - u); }; }
  LIGHTS.boom.position.set(p.x, p.y + 3, p.z); LIGHTS.boom.intensity = 24000 * size; FX.boomT = 0;
  if (land && size >= 0.7) addScorch(p, 3.4 * size + Math.random() * 1.2);
}
const FLARES = [];
function spawnFlare(x = rand(-380, -60), z = rand(-260, 260), y = rand(260, 320), life = 32, scale = 26, glow = 1) {
  const light = FLARES.length % 2 ? LIGHTS.flareB : LIGHTS.flareA;
  const old = FLARES.find((f) => f.light === light); if (old) { old.s.visible = false; scene.remove(old.s); FLARES.splice(FLARES.indexOf(old), 1); }
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: FXT.flare, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, fog: false, toneMapped: false })); s.scale.setScalar(scale); scene.add(s);
  const f = { s, light, x, z, y, t: 0, life, glow, vx: rand(-1.5, 1.5), vz: rand(-1, 1) };
  FLARES.push(f); return f;
}
function updateFlares(dt) {
  let fl = 0;
  for (const f of [...FLARES]) {
    f.t += dt; f.y -= 4.2 * dt; f.x += f.vx * dt; f.z += f.vz * dt;
    const k = f.t < 1.5 ? f.t / 1.5 : f.t > f.life - 4 ? Math.max(0, (f.life - f.t) / 4) : 1;
    const flick = 0.85 + 0.15 * Math.sin(f.t * 23) * Math.sin(f.t * 7.3);
    f.s.position.set(f.x, f.y, f.z); f.light.position.set(f.x, f.y, f.z); f.light.intensity = 9e5 * (f.glow ?? 1) * k * flick * Math.pow(Math.max(f.y, 60) / 280, 2); f.s.material.opacity = k; fl = Math.max(fl, k);
    if (f.t > f.life || f.y < 20) { f.s.visible = false; scene.remove(f.s); f.light.intensity = 0; FLARES.splice(FLARES.indexOf(f), 1); }
  }
  vmFlare.intensity = fl * 1.2;
}
const DRUMFIRE = { on: false, t: 0 };
function updateDrumFire(dt, time) {
  if (!DRUMFIRE.on) { LIGHTS.fire.intensity = 0; return; }
  DRUMFIRE.t += dt; const grow = Math.min(1, DRUMFIRE.t / 3);
  LIGHTS.fire.intensity = grow * 40000 * (0.8 + 0.2 * Math.sin(time * 11) * Math.sin(time * 4.1));
  if (Math.random() < dt * 14) { const q = FX.fire.get(); q.life = 0.9 + Math.random() * 0.6; const x = 10 + rand(0, 4), z = 103 + rand(0, 3.5), y = groundAt(x, z) + 0.8; q.s.position.set(x, y, z); const sc = rand(2.5, 5) * grow; q.upd = (q, u, dt2) => { q.s.position.y += 2.8 * dt2; q.s.scale.setScalar(sc * (1 - u * 0.5)); q.s.material.opacity = (1 - u); }; }
  if (Math.random() < dt * 6) { const s = FX.smoke.get(); s.life = 7; s.s.position.set(rand(10, 14), groundAt(12, 104) + 5, rand(103, 106)); s.s.material.color.set(0x1d1b19); s.upd = (q, u, dt2) => { q.s.position.y += 5 * dt2; q.s.position.x += 1.5 * dt2; q.s.scale.setScalar(4 + u * 20); q.s.material.opacity = 0.85 * (1 - u) * Math.min(1, u * 8); }; }
}

/* ================= projectiles ================= */
const PROJ = [];
const GREN_GEO = build([[G.sph(0.045, 10, 8), 0x3f4633, M4(0, 0, 0, 0, 0, 0, 1, 1.25, 1)], [G.box(0.02, 0.04, 0.02), 0x777777, M4(0, 0.06, 0)], [G.box(0.012, 0.07, 0.02), 0x777777, M4(0.03, 0.03, 0, 0, 0, -0.3)]]);
const ROCKET_GEO = build([[G.cone(0.045, 0.25, 8), 0x5a5f4a, M4(0, 0, 0.12, Math.PI / 2, 0, 0)], [G.cyl(0.02, 0.02, 0.35, 6), 0x3a3a33, M4(0, 0, -0.15, Math.PI / 2, 0, 0)]]);
function throwGrenade(from, vel, owner) {
  const m = new THREE.Mesh(GREN_GEO, MAT.vc); m.position.copy(from); onLayer1(m); scene.add(m);
  const p = { type: 'gren', m, v: vel.clone(), fuse: owner === 'player' ? 3.0 : 2.6, owner };
  if (owner !== 'player') { const el = document.createElement('div'); el.className = 'mk'; el.innerHTML = '<span style="color:#ff6f5e;font-size:18px;font-weight:700">⚠</span><small>רימון</small>'; p.marker = new CSS2DObject(el); p.marker.center.set(0.5, 1); scene.add(p.marker); }
  PROJ.push(p);
}
function fireRocket(from, to, owner) {
  const m = new THREE.Mesh(ROCKET_GEO, MAT.vc); m.position.copy(from); m.lookAt(to); onLayer1(m); scene.add(m);
  const dir = to.clone().sub(from).normalize();
  PROJ.push({ type: 'rocket', m, v: dir.multiplyScalar(115), owner, life: 3.5, target: to.clone() });
}
