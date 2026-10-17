/* ---------- the new soldiers (a test, beside the old ones) ----------
   The figure from chars.html - a real head, hands and eyes, the airborne soldier's uniform, belt and boots - skinned to the game rig's own
   joints (4e_soldier_data.js, made by tools build_game.py), so every pose and animation of the old figure moves it: the stride, the aim,
   the crouch, the grip on the rifle, the falls. It is the near soldier only: a man close enough to see (NS_D, by the quality) wears it,
   further off he is the old figure - far too small there to tell, and a hundred of these would be too much for the machine.
   The Israelis in olive with the M1, the Egyptians in khaki camouflage and the Syrians in forest camouflage under a Soviet-pattern helmet,
   moustached and dark-haired. Off in the Chinese Farm (its men in pits wear our uniforms - the old figure does that) and by the setting. */
const NEWSOL = {
  on: (() => { let v = null; try { v = localStorage.getItem('yk73.sol'); } catch (e) {} return v !== 'old'; })(),   /* on unless the player chose the old ones */
  geo: null, mats: null, camo: {},
};
const NS_BONES = ['hips', 'torso', 'sR', 'eR', 'sL', 'eL', 'hR', 'kR', 'hL', 'kL', 'headP'];
const NS_GROUPS = ['uniform', 'webbing', 'boots', 'head', 'hands', 'eyes', 'm1', 'm1fit', 'sov'];
function nsGeometry() {
  if (NEWSOL.geo) return NEWSOL.geo;
  const H = SOLDIER_DATA.hdr, raw = atob(SOLDIER_DATA.bin), u8 = new Uint8Array(raw.length); for (let i = 0; i < raw.length; i++) u8[i] = raw.charCodeAt(i);
  const buf = u8.buffer; let nv = 0, ni = 0; for (const g of H.groups) { nv += g.v; ni += g.i; }
  const pos = new Float32Array(nv * 3), nrm = new Int8Array(nv * 3), uv = new Float32Array(nv * 2), si = new Uint8Array(nv * 4), sw = new Uint8Array(nv * 4), idx = new Uint32Array(ni), geo = new THREE.BufferGeometry();
  let v0 = 0, i0 = 0;
  H.groups.forEach((g, gi) => {
    const q = new Int16Array(buf, g.pos, g.v * 3); for (let k = 0; k < g.v * 3; k++) pos[v0 * 3 + k] = H.min[k % 3] + ((q[k] + 32768) / 65535) * H.span[k % 3];
    nrm.set(new Int8Array(buf, g.nrm, g.v * 3), v0 * 3); uv.set(new Float32Array(buf, g.uv, g.v * 2), v0 * 2); si.set(new Uint8Array(buf, g.si, g.v * 4), v0 * 4); sw.set(new Uint8Array(buf, g.sw, g.v * 4), v0 * 4);
    const ix = new Uint16Array(buf, g.idx, g.i); for (let k = 0; k < g.i; k++) idx[i0 + k] = ix[k] + v0;
    geo.addGroup(i0, g.i, NS_GROUPS.indexOf(g.name)); v0 += g.v; i0 += g.i;
  });
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(nrm, 3, true)); geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  geo.setAttribute('skinIndex', new THREE.BufferAttribute(si, 4)); geo.setAttribute('skinWeight', new THREE.BufferAttribute(sw, 4, true)); geo.setIndex(new THREE.BufferAttribute(idx, 1));
  geo.boundingSphere = new THREE.Sphere(V3(0, -0.1, 0), 1.5);
  // the lighter levels (tools/chars/ns_lod.py): the same vertices, skin and all, with fewer triangles - a third, then an eighth
  NEWSOL.geos = [geo];
  if (H.groups[0].idx1 !== undefined) for (const L of [1, 2]) {
    let n = 0; for (const g of H.groups) n += g['i' + L];
    const ix2 = new Uint32Array(n), g2 = new THREE.BufferGeometry(); let vv = 0, ii = 0;
    for (const g of H.groups) { const ix = new Uint16Array(buf, g['idx' + L], g['i' + L]); for (let k = 0; k < ix.length; k++) ix2[ii + k] = ix[k] + vv; g2.addGroup(ii, ix.length, NS_GROUPS.indexOf(g.name)); vv += g.v; ii += ix.length; }
    for (const k of ['position', 'normal', 'uv', 'skinIndex', 'skinWeight']) g2.setAttribute(k, geo.attributes[k]);
    g2.setIndex(new THREE.BufferAttribute(ix2, 1)); g2.boundingSphere = geo.boundingSphere; NEWSOL.geos.push(g2);
  }
  return (NEWSOL.geo = geo);
}
/* the cloth: blotches of each colour where a tileable noise field passes its threshold - stretched sideways for the Egyptian brush strokes,
   round for the Syrian forest pattern - and the weave over it; the same recipe as chars.html */
function nsCamo(c) {
  const N = QUAL === 'low' ? 512 : 1024, cv = canvas(N), ctx = cv.getContext('2d'), img = ctx.createImageData(N, N), D = img.data;
  let st = c.seed >>> 0; const rnd = () => { st = (st + 0x6d2b79f5) >>> 0; let t = st; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const field = (px, py) => {
    const oct = [1, 2, 4].map((m) => { const W = px * m, Hh = py * m, g = new Float32Array(W * Hh).map(rnd); return { W, H: Hh, g, a: 1 / m }; });
    return (u, v) => { let s = 0, n = 0; for (const o of oct) { const x = u * o.W, y = v * o.H, x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0, sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
      const i = (yy, xx) => o.g[((yy % o.H) * o.W) + (xx % o.W)], a = i(y0, x0), b = i(y0, x0 + 1), d0 = i(y0 + 1, x0), e = i(y0 + 1, x0 + 1);
      s += (a + (b - a) * sx + (d0 - a) * sy + (a - b - d0 + e) * sx * sy) * o.a; n += o.a; } return s / n; };
  };
  const rgb = (h) => [(h >> 16) & 255, (h >> 8) & 255, h & 255], base = rgb(c.base), L = c.layers.map(([col, thr, px, py]) => ({ col: rgb(col), thr, f: field(px, py) })), grain = field(64, 64);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    let col = base; const u = x / N, v = y / N; for (const l of L) if (l.f(u, v) > l.thr) col = l.col;
    const w = 0.93 + 0.05 * (((x >> 1) + (y >> 1)) & 1) + 0.06 * (grain(u, v) - 0.5), k = (y * N + x) * 4;
    D[k] = col[0] * w; D[k + 1] = col[1] * w; D[k + 2] = col[2] * w; D[k + 3] = 255;
  }
  ctx.putImageData(img, 0, 0); const t = tex(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(0.55, 0.55); return t;
}
const NS_CAMO = { eg: { seed: 7, base: 0xb5a072, layers: [[0x8c7148, 0.55, 4, 10], [0x6c6946, 0.63, 5, 12], [0xcbb98b, 0.68, 8, 18]] },
  sy: { seed: 31, base: 0x5f6a43, layers: [[0x37462b, 0.52, 5, 6], [0x5b4630, 0.6, 6, 7], [0x20261b, 0.69, 9, 10]] } };
function nsNet() {   // the M1's net: knotted cord in diamonds over the olive paint
  const N = 256, c = canvas(N), g = c.getContext('2d'); g.fillStyle = '#5a5c3e'; g.fillRect(0, 0, N, N);
  for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(${Math.random() < 0.5 ? '40,42,28' : '110,108,84'},0.12)`; g.fillRect(Math.random() * N, Math.random() * N, 2 + Math.random() * 8, 1 + Math.random() * 2); }
  g.strokeStyle = 'rgba(38,36,24,0.9)'; g.lineWidth = 2.4; for (let k = -N; k < 2 * N; k += 32) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k + N, N); g.stroke(); g.beginPath(); g.moveTo(k, N); g.lineTo(k + N, 0); g.stroke(); }
  const t = tex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
function nsImage(url) { const t = new THREE.TextureLoader().load(url); t.flipY = false; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = ANISO; return t; }
/* the waist: the figure's cloth is one piece from the collar to the boots, so the paint draws where the shirt ends and the trousers begin -
   the trousers a shade darker, a dark seam where the shirt is tucked in, the shirt a little bunched above it - and the web belt gets a woven
   look and its buckle at the front. Read from the figure's own (bind) position: hips at y 0, the front +z */
const NS_WAIST = `{ float yb = vBindP.y;
  float pants = 1.0 - smoothstep(0.082, 0.098, yb);
  diffuseColor.rgb *= mix(vec3(1.0), vec3(0.83, 0.85, 0.83), pants);
  float seam = smoothstep(0.072, 0.086, yb) * (1.0 - smoothstep(0.092, 0.106, yb));
  diffuseColor.rgb *= 1.0 - 0.5 * seam;
  diffuseColor.rgb *= 1.0 + 0.07 * smoothstep(0.1, 0.112, yb) * (1.0 - smoothstep(0.125, 0.17, yb)); }`;
const NS_BELT = `{ vec3 bp = vBindP;
  float buckle = (1.0 - smoothstep(0.022, 0.03, abs(bp.x))) * (1.0 - smoothstep(0.016, 0.024, abs(bp.y - 0.152))) * smoothstep(0.12, 0.16, bp.z);
  diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.62, 0.6, 0.55), buckle * 0.85); }`;
function nsBindPaint(m, glsl, tag) {
  const prev = m.onBeforeCompile, key = m.customProgramCacheKey ? m.customProgramCacheKey() : '';
  m.onBeforeCompile = (sh, r) => {
    if (prev) prev.call(m, sh, r);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vBindP;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvBindP = position;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vBindP;').replace('#include <map_fragment>', '#include <map_fragment>\n' + glsl);
  };
  m.customProgramCacheKey = () => key + '|' + tag; return m;
}
/* the creases of the drill: folds where a uniform folds - rings round the sleeve at the elbow and bunched at the cuff, from the armpit across
   chest and back, rings round the trouser leg at the knee and over the boots, the shirt bunched above the belt, creases at the hip - and the
   cloth's own crumple everywhere. A height read from the figure's bind position (so the folds go where the joints are, whatever the pose),
   turned into the shading normal through the screen derivatives (Mikkelsen's bump, unscaled: millimetres of cloth as millimetres), the
   hollows a shade darker; the fine ones fade where they would be smaller than a pixel. On every new soldier, ours and theirs */
const NS_WRK_FN = `float nsWH(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
float nsWN(vec3 p) { vec3 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(nsWH(i), nsWH(i + vec3(1.0, 0.0, 0.0)), f.x), mix(nsWH(i + vec3(0.0, 1.0, 0.0)), nsWH(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
             mix(mix(nsWH(i + vec3(0.0, 0.0, 1.0)), nsWH(i + vec3(1.0, 0.0, 1.0)), f.x), mix(nsWH(i + vec3(0.0, 1.0, 1.0)), nsWH(i + vec3(1.0, 1.0, 1.0)), f.x), f.y), f.z); }
float nsFold(vec3 b) {
  float fw = length(fwidth(b)), fine = 1.0 - smoothstep(0.003, 0.009, fw), mid = 1.0 - smoothstep(0.006, 0.02, fw), ax = abs(b.x), h = 0.0;
  float arm = smoothstep(0.2, 0.26, ax) * (1.0 - smoothstep(0.1, 0.16, abs(b.y - 0.477)));
  float var = 0.35 + 0.95 * nsWN(b * 11.0 + 3.7);   // folds of uneven depth: some deep, some barely there
  float e = (ax - 0.46) / 0.075; h += arm * exp(-e * e) * sin(ax * 230.0 + (b.y + b.z) * 60.0 + nsWN(b * 30.0) * 5.0) * 0.0045 * var;
  float c = (ax - 0.665) / 0.045; h += arm * exp(-c * c) * sin(ax * 280.0 + (b.y - b.z) * 70.0 + nsWN(b * 44.0) * 4.5) * 0.0024 * var;
  float sh = smoothstep(0.07, 0.13, ax) * (1.0 - smoothstep(0.23, 0.3, ax)) * smoothstep(0.3, 0.38, b.y) * (1.0 - smoothstep(0.46, 0.52, b.y));
  h += sh * sin((ax * 0.85 - b.y) * 150.0 + nsWN(b * 30.0) * 2.2) * 0.003;
  float leg = (1.0 - smoothstep(0.17, 0.22, ax)) * (1.0 - smoothstep(-0.02, 0.02, b.y));
  float k = (b.y + 0.42) / 0.075; h += leg * exp(-k * k) * sin(b.y * 220.0 + (b.x + b.z) * 55.0 + nsWN(b * 32.0) * 5.0) * 0.0045 * var;
  float bl = (b.y + 0.755) / 0.05; h += leg * exp(-bl * bl) * sin(b.y * 280.0 + b.z * 60.0 + nsWN(b * 40.0) * 4.5) * 0.0042 * var;
  float w = smoothstep(0.155, 0.175, b.y) * (1.0 - smoothstep(0.24, 0.3, b.y)) * (1.0 - smoothstep(0.2, 0.25, ax));
  h += w * sin(atan(b.x, b.z) * 24.0 + nsWN(b * 25.0) * 3.0) * 0.0032;
  float hp = smoothstep(-0.2, -0.06, b.y) * (1.0 - smoothstep(-0.04, 0.04, b.y)) * (1.0 - smoothstep(0.15, 0.2, ax));
  h += hp * sin((ax * 1.3 + b.y) * 130.0 + nsWN(b * 33.0) * 2.0) * 0.0022;
  h *= mid;
  h += ((nsWN(b * 34.0) - 0.5) * 0.004 + (nsWN(b * 95.0) - 0.5) * 0.0013) * fine;
  return h;
}
vec3 nsPerturb(vec3 sp, vec3 sn, vec2 dH, float fd) { vec3 sx = dFdx(sp), sy = dFdy(sp), r1 = cross(sy, sn), r2 = cross(sn, sx); float det = dot(sx, r1) * fd; vec3 g = sign(det) * (dH.x * r1 + dH.y * r2); return normalize(abs(det) * sn - g); }
float nsFH = 0.0;`;
function nsWrinkle(m, tag) {   // after nsBindPaint (it declares vBindP)
  const prev = m.onBeforeCompile, key = m.customProgramCacheKey ? m.customProgramCacheKey() : '';
  m.onBeforeCompile = (sh, r) => { if (prev) prev.call(m, sh, r);
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\n' + NS_WRK_FN)
      .replace('#include <map_fragment>', '#include <map_fragment>\nnsFH = nsFold(vBindP) * 1.5; diffuseColor.rgb *= 1.0 - 0.3 * smoothstep(0.0, 0.006, -nsFH) + 0.06 * smoothstep(0.0, 0.006, nsFH);')
      .replace('#include <normal_fragment_maps>', '#include <normal_fragment_maps>\nnormal = nsPerturb(-vViewPosition, normal, vec2(dFdx(nsFH), dFdy(nsFH)) * 1.8, faceDirection);'); };
  m.customProgramCacheKey = () => key + '|wrk' + tag; return m;
}
// woven web: a fine basket weave and the stitched edge of each strap, pale so the material colour is the colour
function nsWebTex() {
  const W = 64, c = canvas(W, W), g = c.getContext('2d'); g.fillStyle = '#d8d4c8'; g.fillRect(0, 0, W, W);
  for (let y = 0; y < W; y += 2) for (let x = 0; x < W; x += 2) { g.fillStyle = ((x + y) >> 1) & 1 ? 'rgba(60,56,44,0.22)' : 'rgba(255,255,250,0.12)'; g.fillRect(x, y, 2, 1); }
  for (const y of [3, W - 4]) { g.fillStyle = 'rgba(40,36,28,0.35)'; g.fillRect(0, y, W, 1); for (let x = 0; x < W; x += 4) { g.fillStyle = 'rgba(40,36,28,0.5)'; g.fillRect(x, y + 1, 2, 1); } }
  const t = tex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 3); return t;
}
function nsMaterials() {
  if (NEWSOL.mats) return NEWSOL.mats;
  const T = SOLDIER_DATA.tex, std = (o) => new THREE.MeshStandardMaterial(Object.assign({ roughness: 0.9, metalness: 0 }, o));
  const cloth = (side, map, color) => { const m = rimMat(side === 'e' ? 0xff4020 : 0x5f9cff, side === 'e' ? 0 : 0.22); m.vertexColors = false; m.map = map; m.bumpMap = null; m.color.set(color); m.roughness = 0.95; m.customProgramCacheKey = () => 'nsRim' + side; return m; };
  const uniF = nsCamo({ seed: 3, base: 0x5f5a3a, layers: [] });   // the IDF's plain olive drill
  NEWSOL.camo.eg = nsCamo(NS_CAMO.eg);
  const head = nsImage(T.head), headAr = nsImage(T.headAr || T.head), hands = nsImage(T.hands), eyes = nsImage(T.eyes), net = nsNet();
  const hidden = new THREE.MeshBasicMaterial({ visible: false });
  const skin = (map, tint) => std({ map, roughness: 0.6, color: tint });
  const web = nsWebTex(), belt = (side, color) => nsBindPaint(cloth(side, web, color), NS_BELT, 'belt' + side), waist = (m, side) => nsWrinkle(nsBindPaint(m, NS_WAIST, 'waist' + side), side);
  const f = [waist(cloth('f', uniF, 0xffffff), 'f'), belt('f', 0x8a8458), std({ color: 0x4a2c1c, roughness: 0.55 }), skin(head, 0xffffff), skin(hands, 0xffffff), std({ map: eyes, roughness: 0.15 }),
    std({ map: net, roughness: 0.8 }), std({ color: 0x3a3a2a, roughness: 0.85 }), hidden];
  const e = [waist(cloth('e', NEWSOL.camo.eg, 0xffffff), 'e'), belt('e', 0x5e4c32), std({ color: 0x1d1b19, roughness: 0.55 }), skin(headAr, 0xf0d5ba), skin(hands, 0xf0d5ba), std({ map: eyes, roughness: 0.15 }),
    hidden, hidden, std({ color: 0x7a7150, roughness: 0.6 })];
  NEWSOL.mats = { f, e }; nsUniformFor(MODE); return NEWSOL.mats;
}
/* the enemy's uniform with the chapter: the Syrians on the Hermon in their forest pattern, the Egyptians everywhere else in khaki */
function nsUniformFor(mode) {
  if (!NEWSOL.mats) return; const sy = mode === 'hermon', E = NEWSOL.mats.e;
  if (sy && !NEWSOL.camo.sy) NEWSOL.camo.sy = nsCamo(NS_CAMO.sy);
  E[0].map = sy ? NEWSOL.camo.sy : NEWSOL.camo.eg; E[1].color.set(sy ? 0x3c3f2a : 0x5e4c32); E[8].color.set(sy ? 0x434a30 : 0x7a7150); E[3].color.set(sy ? 0xf2dac2 : 0xf0d5ba); E[4].color.copy(E[3].color);
  for (const m of [E[0], E[1], E[8]]) m.needsUpdate = true;
}
{ const _uf = uniformFor; uniformFor = function (mode) { _uf(mode); nsUniformFor(mode); nsRefresh(); }; }   /* reassigns the declaration in 4_actors.js (one module) */
/* the joints where this figure's are: its shoulders, hips, knees and head pivot (the old figure's are kept, and come back with it) */
function nsJoints(R, on) {
  const J = SOLDIER_DATA.hdr.joints;
  if (!R.nsOld) R.nsOld = { sR: R.sR.position.clone(), sL: R.sL.position.clone(), eR: R.eR.position.clone(), eL: R.eL.position.clone(), hR: R.hR.position.clone(), hL: R.hL.position.clone(), kR: R.kR.position.clone(), kL: R.kL.position.clone(), headP: R.headP.position.clone(), hs: R.headP.scale.x };
  if (on) { R.sR.position.fromArray(J.sR); R.sL.position.fromArray(J.sL); R.eR.position.set(0, -J.eLen, 0); R.eL.position.set(0, -J.eLen, 0); R.hR.position.fromArray(J.hR); R.hL.position.fromArray(J.hL); R.kR.position.fromArray(J.kR); R.kL.position.fromArray(J.kL); R.headP.position.fromArray(J.headP); R.headP.scale.setScalar(1); }
  else { const O = R.nsOld; for (const k of ['sR', 'sL', 'eR', 'eL', 'hR', 'hL', 'kR', 'kL', 'headP']) R[k].position.copy(O[k]); R.headP.scale.setScalar(O.hs); }
}
const _nsZ = V3(0, 0, 1);
function nsAttach(R) {
  nsJoints(R, true);
  // bound in the figure's own stance: the rig at rest with both arms raised level
  const J = NS_BONES.map((k) => R[k]), save = J.map((o) => [o.quaternion.clone(), o.scale.clone()]);
  for (const o of J) { o.quaternion.identity(); o.scale.setScalar(1); }
  R.sR.quaternion.setFromAxisAngle(_nsZ, -Math.PI / 2); R.sL.quaternion.setFromAxisAngle(_nsZ, Math.PI / 2);
  R.root.updateMatrixWorld(true);
  const bones = J.map((o) => { const b = new THREE.Bone(); o.add(b); return b; });
  const m = new THREE.SkinnedMesh(nsGeometry(), nsMaterials()[R.side === 'e' ? 'e' : 'f']); R.hips.add(m); m.boundingSphere = new THREE.Sphere(V3(0, -0.15, 0), 1.5);
  R.root.updateMatrixWorld(true); m.bind(new THREE.Skeleton(bones)); SH(m, true, false); onLayer1(m);
  J.forEach((o, i) => { o.quaternion.copy(save[i][0]); o.scale.copy(save[i][1]); }); R.root.updateMatrixWorld(true);
  R.ns = m;
}
function nsShow(R, on) {
  if (on && !R.ns) nsAttach(R);
  R.nsOn = on; nsJoints(R, on);
  if (R.ns) R.ns.visible = on;
  R.mBody.visible = R.uni.visible = R.head.visible = R.helmet.visible = !on; for (const m of R.mBoot) m.visible = !on;
  for (const c of R.headP.children) if (c.isMesh && c !== R.head && c !== R.helmet) c.visible = !on;   // the old head's skin
}
/* who wears it: a man nearer than NS_D (by what the eye sees: closer through a sight, and the far enemies drawn larger count as far),
   its own distance - not the old figure's levels of detail, which on medium and low quality never reach the finest */
const NS_D = { high: 42, med: 24, low: 12 }[QUAL], NS_MAX = { high: 20, med: 11, low: 6 }[QUAL];   // and never more than NS_MAX at once: the nearest
// the figure's level of detail by that same distance: whole near, a third of its triangles past NS_L[0], an eighth past NS_L[1]
const NS_L = { high: [32, 60], med: [18, 38], low: [11, 26] }[QUAL];   // whole near, as the showroom shows them
const NSB = { t: -1, allow: new Set(), cand: [] };
function nsDecide(u) {
  const R = u.rig; if (!R) return; const far = camera.position.distanceTo(u.pos), eff = far * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) / 0.7265 / (u.vs || 1);
  if (NSB.t !== GAME.t) {   // a new frame: last frame's near men ranked, those wearing it already a little ahead (no flicker), the dead behind the living
    NSB.cand.sort((a, b) => a.nsRank - b.nsRank); NSB.allow = new Set(NSB.cand.slice(0, NS_MAX)); NSB.cand.length = 0; NSB.t = GAME.t;
  }
  const near = NEWSOL.on && MODE !== 'farm' && eff < (R.nsOn ? NS_D * 1.12 : NS_D);
  if (near) { u.nsRank = eff * (R.nsOn ? 0.85 : 1) * (u.alive ? 1 : 1.6); NSB.cand.push(u); }
  const w = near && NSB.allow.has(u); if (w !== !!R.nsOn) nsShow(R, w);
  if (w && R.ns && NEWSOL.geos && NEWSOL.geos.length > 1) {
    const cur = R.nsLod ?? 0, h = cur === 0 ? 1.1 : 0.92, l = eff < NS_L[0] * (cur === 0 ? h : 1) ? 0 : eff < NS_L[1] * (cur <= 1 ? 1.08 : 0.94) ? 1 : 2;   /* a little hysteresis: no flicker on the line */
    if (l !== cur) { R.nsLod = l; R.ns.geometry = NEWSOL.geos[Math.min(l, NEWSOL.geos.length - 1)]; R.ns.castShadow = SHADOWS && l < 2; }   /* the farthest cast no shadow */
  }
}
{ const _sync = Unit.prototype.sync; Unit.prototype.sync = function () { _sync.call(this); nsDecide(this); }; }
/* the setting changed (or the chapter): every soldier dresses again at once */
function nsRefresh() { let fr = []; try { fr = FRIENDS.map((f) => f.unit); } catch (e) {} const all = [...UNITS.enemies, ...UNITS.friends, ...fr]; NSB.t = -1; NSB.cand.length = 0; for (let k = 0; k < 2; k++) { NSB.t = -2 - k; for (const u of all) if (u && u.rig && u.rig.root.visible) nsDecide(u); } }   /* twice: the first pass ranks, the second dresses */
/* the setting: new soldiers (a test) or the old ones; kept in the browser */
function setSoldiers(v, live) {
  NEWSOL.on = v === 'new'; for (const x of document.querySelectorAll('#sol button')) x.setAttribute('aria-pressed', String(x.dataset.sol === v));
  if (!live) return; try { localStorage.setItem('yk73.sol', v); } catch (e) {} nsRefresh();
}
{ const el = $('#sol'); if (el) el.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b && b.dataset.sol) setSoldiers(b.dataset.sol, true); }); setSoldiers(NEWSOL.on ? 'new' : 'old', false); }

