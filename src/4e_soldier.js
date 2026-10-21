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
    if (g.name === 'm1' || g.name === 'm1fit' || g.name === 'sov') nsHelmetUp(pos, nrm, v0, g.v);   // worn as they wore it in 1973: up off the brow
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
/* the helmet sat high in 1973 - pushed back off the brow, the face open under it: raised 2 cm and tipped back 10 degrees about the head */
const NS_HU = { a: -0.17, py: 0.7, pz: 0.02, dy: 0.02 };
function nsHelmetUp(pos, nrm, v0, n) {
  const c = Math.cos(NS_HU.a), s = Math.sin(NS_HU.a);
  for (let k = v0; k < v0 + n; k++) { const y = pos[k * 3 + 1] - NS_HU.py, z = pos[k * 3 + 2] - NS_HU.pz; pos[k * 3 + 1] = NS_HU.py + y * c - z * s + NS_HU.dy; pos[k * 3 + 2] = NS_HU.pz + y * s + z * c;
    const ny = nrm[k * 3 + 1], nz = nrm[k * 3 + 2]; nrm[k * 3 + 1] = Math.round(ny * c - nz * s); nrm[k * 3 + 2] = Math.round(ny * s + nz * c); }
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
function nsNet() {   /* the IDF's M1 in 1973: a cover of sun-bleached burlap - coarse open-woven jute, a thread every 3 mm with the dark of
     the steel showing between - under a net of pale cord, knotted at the crossings, a cell about 5 cm; all of it tiling */
  const N = 512, P = 8, c = canvas(N), g = c.getContext('2d'), r = rng(73), img = g.createImageData(N, N), D = img.data, n = N / P;
  const wW = Array.from({ length: n }, () => 4.6 + r() * 2.2), wH = Array.from({ length: n }, () => 4.6 + r() * 2.2);   // jute: no two threads alike
  const tW = Array.from({ length: n }, () => 0.86 + r() * 0.24), tH = Array.from({ length: n }, () => 0.86 + r() * 0.24);
  const slub = Array.from({ length: n * n }, () => 0.9 + r() * 0.2), base = [190, 154, 112], hole = [66, 54, 40];
  const fade = (x, y) => 1 + 0.07 * Math.sin((x / N) * 6.2832 * 2 + 1.3) * Math.cos((y / N) * 6.2832 * 3) + 0.05 * Math.sin((x / N + y / N) * 6.2832 * 5 + 0.7);   // sun and dust, unevenly
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const i = (x / P) | 0, j = (y / P) | 0, fx = x % P, fy = y % P, warp = fx < wW[i], weft = fy < wH[j], k = (y * N + x) * 4;
    let col = hole, sh = 1;
    if (warp || weft) { const top = warp && weft ? (((i + j) & 1) ? 'w' : 'f') : (warp ? 'w' : 'f');
      sh = top === 'w' ? tW[i] * (0.78 + 0.3 * Math.sin(Math.PI * (fx + 0.5) / wW[i])) : tH[j] * (0.78 + 0.3 * Math.sin(Math.PI * (fy + 0.5) / wH[j]));
      if (warp && weft) sh *= 1.06; else sh *= 0.9;   // a thread lies higher where it crosses over
      sh *= slub[j * n + i] * fade(x, y); col = base; }
    else if (r() < 0.25) { col = base; sh = 0.55; }   // stray fibres across the holes
    D[k] = Math.min(255, col[0] * sh); D[k + 1] = Math.min(255, col[1] * sh); D[k + 2] = Math.min(255, col[2] * sh); D[k + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  // the net: a diamond lattice of knots, each jittered (the same jitter round the tile's edge), cords sagging a little between them
  const NX = 4, NY = 8, jx = [], jy = []; for (let q = 0; q < NX * NY; q++) { jx.push((r() - 0.5) * 18); jy.push((r() - 0.5) * 14); }
  const node = (i, j) => { const ii = ((i % NX) + NX) % NX, jj = ((j % NY) + NY) % NY; return [i * 128 + (((j % 2) + 2) % 2) * 64 + jx[jj * NX + ii], j * 64 + jy[jj * NX + ii]]; };
  const cords = []; for (let j = 0; j < NY; j++) for (let i = -1; i <= NX; i++) { const a = node(i, j), odd = j & 1; cords.push([a, node(i - 1 + odd, j + 1)], [a, node(i + odd, j + 1)]); }
  const pass = (w, col, dx, dy, dash) => { g.lineWidth = w; g.strokeStyle = col; g.setLineDash(dash || []); g.lineCap = 'round';
    for (const [a, b] of cords) for (const ox of [-N, 0, N]) for (const oy of [-N, 0, N]) { const mx = (a[0] + b[0]) / 2 + 3, my = (a[1] + b[1]) / 2 + 4;
      g.beginPath(); g.moveTo(a[0] + ox + dx, a[1] + oy + dy); g.quadraticCurveTo(mx + ox + dx, my + oy + dy, b[0] + ox + dx, b[1] + oy + dy); g.stroke(); } };
  pass(6.5, 'rgba(38,30,20,0.3)', 1.6, 2.2); pass(4.2, '#c8b08c'); pass(4.2, 'rgba(140,118,86,0.5)', 0, 0, [2.5, 3]); pass(1.3, 'rgba(240,226,196,0.6)', -0.8, -0.8);   // shadow, cord, its twist, the light on it
  g.setLineDash([]); for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) { const [x, y] = node(i, j); for (const ox of [-N, 0, N]) for (const oy of [-N, 0, N]) {
    g.fillStyle = 'rgba(38,30,20,0.5)'; g.beginPath(); g.arc(x + ox + 1.5, y + oy + 2, 6, 0, 6.2832); g.fill();
    g.fillStyle = '#bea684'; g.beginPath(); g.arc(x + ox, y + oy, 5, 0, 6.2832); g.fill(); g.fillStyle = 'rgba(230,212,178,0.5)'; g.beginPath(); g.arc(x + ox - 1.2, y + oy - 1.4, 2, 0, 6.2832); g.fill(); } }
  const t = tex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = ANISO; return t;
}
const NS_BAND = `{ vec3 o = vBindP - vec3(0.0, ${NS_HU.py.toFixed(3)} + ${NS_HU.dy.toFixed(3)}, ${NS_HU.pz.toFixed(3)}); float ca = cos(${(-NS_HU.a).toFixed(3)}), sa = sin(${(-NS_HU.a).toFixed(3)}); float oy = o.y * ca - o.z * sa + ${NS_HU.py.toFixed(3)};
  float hb = fract(sin(dot(floor(vBindP * 140.0), vec3(12.9898, 78.233, 37.719))) * 43758.5453);
  float band = smoothstep(0.682, 0.687, oy) * (1.0 - smoothstep(0.733, 0.738, oy));   /* a band of inner tube round the cover, to tuck brush into */
  float mot = 0.82 + 0.3 * (0.5 + 0.5 * sin(vBindP.x * 57.0 + vBindP.z * 31.0 + sin(vBindP.y * 90.0) * 2.0)) + 0.12 * hb;
  vec3 rub = vec3(0.11, 0.096, 0.082) * mot;   /* warm, to stand against the sky's blue in its shade */   /* dull grey rubber, worn */
  float dust = smoothstep(0.35, 0.95, 0.5 + 0.5 * sin(vBindP.x * 83.0 - vBindP.z * 47.0 + oy * 160.0)) * (0.6 + 0.4 * hb);
  rub = mix(rub, vec3(0.3, 0.24, 0.16), 0.22 * dust);   /* the desert's dust on it */
  float lip = band * (1.0 - smoothstep(0.0, 0.0025, min(oy - 0.687, 0.733 - oy)));
  diffuseColor.rgb = mix(diffuseColor.rgb, rub * (1.0 - 0.35 * lip), band);
  float bunch = (smoothstep(0.672, 0.682, oy) * (1.0 - smoothstep(0.682, 0.686, oy)) + smoothstep(0.734, 0.738, oy) * (1.0 - smoothstep(0.738, 0.75, oy))) * (1.0 - band);
  diffuseColor.rgb *= 1.0 - 0.28 * bunch;   /* the burlap gathered tight at the band's edges */
  float rim = 1.0 - smoothstep(0.646, 0.664, oy);   /* the frayed edge of the burlap, folded in under the rim */
  diffuseColor.rgb *= mix(1.0, 0.72 + 0.5 * hb, rim * 0.8);
  nsBandK = band; }`;
/* the enemy's helmet, the Soviet steel one, three ways (read in the helmet's own frame, before it was tipped back):
   the Egyptians' mostly under a cloth cover cut from their camouflage, four panels sewn over the crown and gathered under the rim on a
   drawstring; some bare, painted sand, under a net of dark string; the Syrians' painted olive, chipped to the steel */
const NS_HLOC = `vec3 ho = vBindP - vec3(0.0, ${NS_HU.py.toFixed(3)} + ${NS_HU.dy.toFixed(3)}, ${NS_HU.pz.toFixed(3)}); float hca = cos(${(-NS_HU.a).toFixed(3)}), hsa = sin(${(-NS_HU.a).toFixed(3)});
  vec3 hp = vec3(ho.x, ho.y * hca - ho.z * hsa + ${NS_HU.py.toFixed(3)}, ho.y * hsa + ho.z * hca + ${NS_HU.pz.toFixed(3)}); vec3 hq = hp - vec3(0.0, 0.66, 0.032); float hth = atan(hq.x, hq.z);`;
const NS_COVER = `{ ${NS_HLOC}
  float crown = smoothstep(0.7, 0.74, hp.y), seam = max(1.0 - smoothstep(0.0012, 0.0032, abs(hq.x)), 1.0 - smoothstep(0.0012, 0.0032, abs(hq.z))) * crown;
  diffuseColor.rgb *= 1.0 - 0.32 * seam; nsFH += seam * 0.0013;
  float rim = 1.0 - smoothstep(0.652, 0.69, hp.y), gath = sin(hth * 41.0 + sin(hth * 7.0) * 2.0);
  nsFH += rim * gath * 0.002; diffuseColor.rgb *= 1.0 - 0.2 * rim * (0.5 + 0.5 * gath) - 0.12 * (1.0 - smoothstep(0.646, 0.656, hp.y)); }`;
const NS_SOVNET = `{ ${NS_HLOC}
  float w = hth / 6.2832 * 22.0, vv = hp.y / 0.034, fw = fwidth(w + vv);
  float cord = (1.0 - smoothstep(0.04, 0.09, min(abs(fract(w + vv) - 0.5), abs(fract(w - vv) - 0.5)))) * (1.0 - smoothstep(0.12, 0.35, fw));
  float knot = (1.0 - smoothstep(0.05, 0.12, length(vec2(fract(w + vv) - 0.5, fract(w - vv) - 0.5)) - 0.0)) * (1.0 - smoothstep(0.12, 0.35, fw));
  float wear = 0.5 + 0.5 * sin(hp.x * 97.0 + sin(hp.y * 140.0) * 1.7) * sin(hp.z * 113.0 + hp.y * 61.0);
  diffuseColor.rgb *= 0.9 + 0.2 * wear; diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.05, 0.045, 0.034), max(cord, knot) * 0.92 + 0.1 * smoothstep(0.12, 0.35, fw)); }`;
const NS_CHIP = `{ ${NS_HLOC}
  float n = sin(hp.x * 91.0 + sin(hp.y * 133.0) * 1.6) * sin(hp.z * 107.0 + hp.y * 71.0) + 0.5 * sin(hp.x * 233.0 - hp.z * 181.0 + hp.y * 157.0);
  float chip = smoothstep(0.95, 1.05, n) + 0.6 * (1.0 - smoothstep(0.646, 0.652, hp.y));   /* the paint worn off, the rim most */
  diffuseColor.rgb = mix(diffuseColor.rgb * (0.92 + 0.08 * n), vec3(0.055, 0.05, 0.043), clamp(chip, 0.0, 1.0));
  diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.3, 0.26, 0.19), 0.18 * smoothstep(0.76, 0.82, hp.y)); }`;
function nsHelmetMat(net) {
  const m = nsBindPaint(new THREE.MeshStandardMaterial({ map: net, roughness: 0.96, metalness: 0 }), NS_BAND, 'band'), prev = m.onBeforeCompile;
  m.onBeforeCompile = (sh, r) => { prev(sh, r); sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nfloat nsBandK = 0.0;')
    .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = mix(roughnessFactor, 0.8, nsBandK);')
    .replace('#include <aomap_fragment>', '#include <aomap_fragment>\nreflectedLight.indirectSpecular *= 0.35;'); };   /* jute and old rubber: dull, not the sky's blue */
  return m;
}
function nsImage(url) { const t = new THREE.TextureLoader().load(url); t.flipY = false; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = ANISO; return t; }
/* the waist: the figure's cloth is one piece from the collar to the boots, so the paint draws where the shirt ends and the trousers begin -
   the trousers a shade darker, a dark seam where the shirt is tucked in, the shirt a little bunched above it - and the web belt gets a woven
   look and its buckle at the front. Read from the figure's own (bind) position: hips at y 0, the front +z */
const NS_WAIST = `{ float yb = vBindP.y;
  float pants = 1.0 - smoothstep(0.082, 0.098, yb);
  diffuseColor.rgb = mix(diffuseColor.rgb, mix(diffuseColor.rgb, vec3(dot(diffuseColor.rgb, vec3(0.3, 0.55, 0.15))), 0.28) * 0.86, pants);   /* the trousers washed greyer than the shirt */
  float seam = smoothstep(0.072, 0.086, yb) * (1.0 - smoothstep(0.092, 0.106, yb));
  diffuseColor.rgb *= 1.0 - 0.5 * seam;
  diffuseColor.rgb *= 1.0 + 0.07 * smoothstep(0.1, 0.112, yb) * (1.0 - smoothstep(0.125, 0.17, yb)); }`;
/* the shirt's pockets (two on the chest, flapped and buttoned) and the trousers' side pockets, as seams and flaps on the cloth; both sides */
const NS_POCKETS = `{ vec3 b = vBindP; float ax = abs(b.x), fr = smoothstep(0.02, 0.07, b.z);
  float px = smoothstep(0.045, 0.05, ax) * (1.0 - smoothstep(0.14, 0.145, ax)), py = smoothstep(0.355, 0.36, b.y) * (1.0 - smoothstep(0.45, 0.455, b.y)), pk = px * py * fr;
  float edge = pk * (1.0 - smoothstep(0.0, 0.004, min(min(ax - 0.05, 0.14 - ax), min(b.y - 0.36, 0.45 - b.y))));
  float flap = pk * smoothstep(0.418, 0.422, b.y), flapEdge = pk * (1.0 - smoothstep(0.0, 0.003, abs(b.y - 0.42)));
  diffuseColor.rgb *= 1.0 - 0.35 * edge - 0.4 * flapEdge + 0.05 * flap; nsFH += pk * 0.0008 + flap * 0.0012;
  if (pk > 0.0) nsButton(vec2(ax - 0.095, b.y - 0.428), diffuseColor.rgb);
  float tl = smoothstep(0.1, 0.12, ax) * (1.0 - smoothstep(0.2, 0.21, ax)) * smoothstep(-0.3, -0.295, b.y) * (1.0 - smoothstep(-0.13, -0.125, b.y)) * smoothstep(-0.05, 0.0, b.z * sign(b.x) + 0.02);
  float tle = tl * (1.0 - smoothstep(0.0, 0.004, min(min(b.y + 0.295, -0.13 - b.y), min(ax - 0.12, 0.2 - ax))));
  diffuseColor.rgb *= 1.0 - 0.3 * tle - 0.3 * tl * (1.0 - smoothstep(0.0, 0.003, abs(b.y + 0.165))); }`;
/* the drill shirt's front, as on the IDF's Madei Bet (and the Egyptians' too): the opening's overlap, stitched, its buttons of olive plastic
   down to the belt; and on each shoulder an epaulette, stitched round, buttoned at the collar end. top: where the buttons stop (ours open at the neck) */
const NS_MADEI = (top) => `{ vec3 b = vBindP; float ax = abs(b.x), fr = smoothstep(0.1, 0.15, b.z) * (1.0 - smoothstep(0.3, 0.35, ax));
  float pl = fr * smoothstep(0.1, 0.11, b.y) * (1.0 - smoothstep(${(top + 0.02).toFixed(3)}, ${(top + 0.026).toFixed(3)}, b.y));
  float pe = pl * (1.0 - smoothstep(0.0012, 0.0028, abs(b.x - 0.009))), ps = pl * (1.0 - smoothstep(0.0006, 0.0014, abs(b.x + 0.012))) * step(0.45, fract(b.y * 240.0));
  diffuseColor.rgb *= 1.0 - 0.32 * pe - 0.2 * ps; nsFH += pl * 0.0013 * smoothstep(-0.032, -0.022, b.x) * (1.0 - smoothstep(0.007, 0.011, b.x));
  float bj = floor((b.y - 0.235) / 0.07 + 0.5), byc = 0.235 + bj * 0.07;
  if (pl > 0.0 && bj >= 0.0 && byc < ${top.toFixed(3)}) nsButton(vec2(b.x + 0.002, b.y - byc), diffuseColor.rgb);
  float ez = abs(b.z - 0.014), ep = smoothstep(0.088, 0.094, ax) * (1.0 - smoothstep(0.194, 0.2, ax)) * (1.0 - smoothstep(0.019, 0.022, ez)) * smoothstep(0.5, 0.52, b.y);
  float epe = ep * (1.0 - smoothstep(0.0, 0.0035, min(min(ax - 0.094, 0.194 - ax), 0.019 - ez)));
  diffuseColor.rgb *= 1.0 + 0.05 * ep - 0.32 * epe; nsFH += ep * 0.0015;
  if (ep > 0.0) nsButton(vec2(ax - 0.106, b.z - 0.014), diffuseColor.rgb); }`;
/* our men as they looked: the shirt open at the neck - a V of sunburnt chest, hair on it, the collar's edges turned back - and the sleeves
   rolled up above the forearm; the skin is skin, so the cloth's creases leave it */
const NS_OPEN_F = `{ vec3 b = vBindP; float ax = abs(b.x);
  float vw = (b.y - 0.47) * 0.62, vee = smoothstep(0.47, 0.49, b.y) * (1.0 - smoothstep(vw - 0.004, vw, ax)) * smoothstep(0.0, 0.04, b.z);
  float lap = smoothstep(0.47, 0.49, b.y) * (1.0 - smoothstep(0.0, 0.012, abs(ax - vw - 0.006))) * smoothstep(0.0, 0.04, b.z) * (1.0 - vee);
  float roll = smoothstep(0.555, 0.56, ax) * (1.0 - smoothstep(0.1, 0.16, abs(b.y - 0.477))), cuff = smoothstep(0.525, 0.53, ax) * (1.0 - smoothstep(0.555, 0.56, ax)) * (1.0 - smoothstep(0.1, 0.16, abs(b.y - 0.477)));
  float skin = max(vee, roll);
  float hair = vee * smoothstep(0.7, 0.9, fract(sin(dot(floor(vec2(b.x * 700.0 + sin(b.y * 900.0) * 0.6, b.y * 260.0)), vec2(12.9898, 78.233))) * 43758.5453)) * (1.0 - smoothstep(0.55, 0.6, b.y));
  vec3 sk = vec3(0.52, 0.31, 0.2) * (0.9 + 0.2 * nsWN(b * 70.0));
  diffuseColor.rgb = mix(diffuseColor.rgb, sk, skin); diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.09, 0.06, 0.04), hair * 0.45);
  diffuseColor.rgb *= 1.0 + 0.12 * cuff - 0.25 * lap; nsFH *= 1.0 - skin; }`;
/* the web belt: pale canvas, and at the front its buckle - two plates of dull brass that hook together, each a frame round a window of
   the web - and along the lower edge the eyelets, brass rings, every 3 cm, for the pouches and the canteen */
const NS_BELT = `{ vec3 bp = vBindP; float ax = abs(bp.x), fr = smoothstep(0.12, 0.16, bp.z), by = bp.y - 0.153;
  float hm = fract(sin(dot(floor(bp.xy * 900.0), vec2(12.9898, 78.233))) * 43758.5453);
  float plate = (1.0 - smoothstep(0.033, 0.036, ax)) * (1.0 - smoothstep(0.024, 0.027, abs(by))) * fr * smoothstep(0.0012, 0.0026, ax);
  float win = smoothstep(0.009, 0.011, ax) * (1.0 - smoothstep(0.025, 0.027, ax)) * (1.0 - smoothstep(0.015, 0.017, abs(by)));
  float frame = plate * (1.0 - win);
  vec3 brass = vec3(0.3, 0.24, 0.12) * (0.8 + 0.4 * hm);
  diffuseColor.rgb = mix(diffuseColor.rgb, brass, frame); diffuseColor.rgb *= 1.0 - 0.3 * plate * win;
  float ang = atan(bp.x, bp.z) * 0.19 / 0.03, ey = length(vec2((fract(ang) - 0.5) * 0.03, bp.y - 0.124));
  float eye = (1.0 - smoothstep(0.003, 0.0042, ey)) * (1.0 - fr * (1.0 - smoothstep(0.045, 0.05, ax))), hole = 1.0 - smoothstep(0.0014, 0.0021, ey);
  diffuseColor.rgb = mix(diffuseColor.rgb, brass * 0.9, eye); diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.03, 0.028, 0.024), eye * hole);
  nsMetal = max(frame, eye * (1.0 - hole)) * 0.85; }`;
function nsBeltMat(m, side) {
  nsBindPaint(m, NS_BELT, 'belt' + side); const prev = m.onBeforeCompile, key = m.customProgramCacheKey();
  m.onBeforeCompile = (sh, r) => { prev.call(m, sh, r); sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nfloat nsMetal = 0.0;')
    .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = mix(roughnessFactor, 0.42, nsMetal);')
    .replace('#include <metalnessmap_fragment>', '#include <metalnessmap_fragment>\nmetalnessFactor = mix(metalnessFactor, 0.75, nsMetal);'); };
  m.customProgramCacheKey = () => key + 'm'; return m;
}
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
float nsCr(float x) { return 0.55 - abs(sin(x)); }   /* a crease: a sharp fold line between broad rounded tops */
float nsFold(vec3 b) {
  float fw = length(fwidth(b)), fine = 1.0 - smoothstep(0.003, 0.009, fw), mid = 1.0 - smoothstep(0.006, 0.02, fw), ax = abs(b.x), h = 0.0;
  float arm = smoothstep(0.2, 0.26, ax) * (1.0 - smoothstep(0.1, 0.16, abs(b.y - 0.477)));
  float var = 0.35 + 0.95 * nsWN(b * 11.0 + 3.7);   // folds of uneven depth: some deep, some barely there
  float e = (ax - 0.46) / 0.075; h += arm * exp(-e * e) * nsCr(ax * 115.0 + (b.y + b.z) * 30.0 + nsWN(b * 30.0) * 5.0) * 0.004 * var;
  float c = (ax - 0.665) / 0.045; h += arm * exp(-c * c) * nsCr(ax * 140.0 + (b.y - b.z) * 35.0 + nsWN(b * 44.0) * 4.5) * 0.0022 * var;
  float sh = smoothstep(0.07, 0.13, ax) * (1.0 - smoothstep(0.23, 0.3, ax)) * smoothstep(0.3, 0.38, b.y) * (1.0 - smoothstep(0.46, 0.52, b.y));
  h += sh * nsCr((ax * 0.85 - b.y) * 75.0 + nsWN(b * 30.0) * 2.2) * 0.0026 * var;
  float leg = (1.0 - smoothstep(0.17, 0.22, ax)) * (1.0 - smoothstep(-0.02, 0.02, b.y));
  float k = (b.y + 0.42) / 0.075; h += leg * exp(-k * k) * nsCr(b.y * 110.0 + (b.x + b.z) * 28.0 + nsWN(b * 32.0) * 5.0) * 0.0036 * var;
  float bl = (b.y + 0.755) / 0.05; h += leg * exp(-bl * bl) * nsCr(b.y * 140.0 + b.z * 30.0 + nsWN(b * 40.0) * 4.5) * 0.0036 * var;
  float w = smoothstep(0.155, 0.175, b.y) * (1.0 - smoothstep(0.24, 0.3, b.y)) * (1.0 - smoothstep(0.2, 0.25, ax));
  h += w * nsCr(atan(b.x, b.z) * 12.0 + nsWN(b * 25.0) * 3.0) * 0.0028 * var;
  float hp = smoothstep(-0.2, -0.06, b.y) * (1.0 - smoothstep(-0.04, 0.04, b.y)) * (1.0 - smoothstep(0.15, 0.2, ax));
  h += hp * nsCr((ax * 1.3 + b.y) * 65.0 + nsWN(b * 33.0) * 2.0) * 0.002 * var;
  h *= mid;
  h += ((nsWN(b * 34.0) - 0.5) * 0.004 + (nsWN(b * 95.0) - 0.5) * 0.0013) * fine;
  return h;
}
vec3 nsPerturb(vec3 sp, vec3 sn, vec2 dH, float fd) { vec3 sx = dFdx(sp), sy = dFdy(sp), r1 = cross(sy, sn), r2 = cross(sn, sx); float det = dot(sx, r1) * fd; vec3 g = sign(det) * (dH.x * r1 + dH.y * r2); return normalize(abs(det) * sn - g); }
float nsFH = 0.0;
/* a shirt button: a disc of dull olive-brown plastic 14 mm across, its rim raised, four thread holes; it stands off the cloth */
void nsButton(vec2 d, inout vec3 col) { float r = length(d), disc = 1.0 - smoothstep(0.0056, 0.0071, r); if (disc <= 0.0) return;
  float rimr = smoothstep(0.0036, 0.0047, r) * (1.0 - smoothstep(0.0052, 0.0062, r)), holes = 1.0 - smoothstep(0.0005, 0.0009, length(abs(d) - vec2(0.0016)));
  vec3 pl = vec3(0.07, 0.058, 0.036) * (1.0 + 0.7 * rimr - 0.6 * holes);
  col = mix(col, pl, disc); nsFH += disc * (0.0012 + 0.0007 * rimr); }`;
function nsWrinkle(m, tag) {   // after nsBindPaint (it declares vBindP)
  const prev = m.onBeforeCompile, key = m.customProgramCacheKey ? m.customProgramCacheKey() : '';
  m.onBeforeCompile = (sh, r) => { if (prev) prev.call(m, sh, r);
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\n' + NS_WRK_FN)
      .replace('#include <map_fragment>', '#include <map_fragment>\nnsFH = nsFold(vBindP) * 1.5; diffuseColor.rgb *= 1.0 - 0.2 * smoothstep(0.0, 0.006, -nsFH) + 0.05 * smoothstep(0.0, 0.006, nsFH);')
      .replace('#include <normal_fragment_maps>', '#include <normal_fragment_maps>\nnormal = nsPerturb(-vViewPosition, normal, vec2(dFdx(nsFH), dFdy(nsFH)) * 1.4, faceDirection);')
      .replace('#include <aomap_fragment>', '#include <aomap_fragment>\nreflectedLight.indirectSpecular *= 0.45;');   /* cotton drill has little sheen: less of the sky's blue in it */ };
  m.customProgramCacheKey = () => key + '|wrk' + tag; return m;
}
// woven web: a fine basket weave and the stitched edge of each strap, pale so the material colour is the colour
function nsWebTex() {
  const W = 64, c = canvas(W, W), g = c.getContext('2d'); g.fillStyle = '#d8d4c8'; g.fillRect(0, 0, W, W);
  for (let y = 0; y < W; y += 2) for (let x = 0; x < W; x += 2) { g.fillStyle = ((x + y) >> 1) & 1 ? 'rgba(60,56,44,0.22)' : 'rgba(255,255,250,0.12)'; g.fillRect(x, y, 2, 1); }
  for (const y of [3, W - 4]) { g.fillStyle = 'rgba(40,36,28,0.35)'; g.fillRect(0, y, W, 1); for (let x = 0; x < W; x += 4) { g.fillStyle = 'rgba(40,36,28,0.5)'; g.fillRect(x, y + 1, 2, 1); } }
  const t = tex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 3); return t;
}
/* ---------- the faces: one head, many men ----------
   Each face is the head's own photograph with a man's own colouring and features over it: his skin a shade darker or fairer, a moustache, a
   beard or days of stubble, heavier brows, the lines of a reservist in his forties; and the face itself moved a few millimetres - a bigger
   nose, a wider jaw, a longer chin, fuller cheeks - in the head's own (bind) frame, before the skin follows the bones. Read in that frame:
   the chin at y .565, the lips .607-.627, the nose's tip .65 (z .153), the eyes .67-.70, the brows .705-.72, the front +z */
const NS_MORPH_FN = `uniform vec4 uMorph, uMorph2;   /* nose, jaw, chin, cheeks | face width, brow ridge, lips, face length */
vec3 nsMorph(vec3 p) {
  vec3 d = vec3(0.0); float fr = smoothstep(-0.02, 0.06, p.z);
  vec3 nt = p - vec3(0.0, 0.655, 0.128); float wn = exp(-dot(nt * vec3(26.0, 24.0, 22.0), nt * vec3(26.0, 24.0, 22.0))) * step(0.1, p.z);
  d += vec3(nt.x * 0.9, -0.004, max(nt.z, 0.0) * 1.3 + 0.004) * wn * uMorph.x;
  float wj = (1.0 - smoothstep(0.6, 0.655, p.y)) * smoothstep(0.53, 0.565, p.y) * fr; d.x += p.x * 0.3 * uMorph.y * wj;
  float wc = (1.0 - smoothstep(0.58, 0.615, p.y)) * smoothstep(0.06, 0.11, p.z) * (1.0 - smoothstep(0.025, 0.055, abs(p.x))); d += vec3(0.0, -0.012, 0.01) * uMorph.z * wc;
  float wk = exp(-pow((p.y - 0.642) / 0.024, 2.0)) * smoothstep(0.026, 0.055, abs(p.x)) * (1.0 - smoothstep(0.078, 0.095, abs(p.x))) * smoothstep(0.0, 0.07, p.z); d += vec3(sign(p.x) * 0.009, 0.0, 0.006) * uMorph.w * wk;
  float wf = smoothstep(0.55, 0.58, p.y) * (1.0 - smoothstep(0.7, 0.74, p.y)) * smoothstep(-0.04, 0.04, p.z); d.x += p.x * 0.09 * uMorph2.x * wf;
  float wb = exp(-pow((p.y - 0.712) / 0.012, 2.0)) * (1.0 - smoothstep(0.05, 0.07, abs(p.x))) * smoothstep(0.08, 0.11, p.z); d.z += 0.006 * uMorph2.y * wb;
  float wl = exp(-pow((p.y - 0.617) / 0.009, 2.0)) * (1.0 - smoothstep(0.02, 0.032, abs(p.x))) * smoothstep(0.1, 0.125, p.z); d += vec3(p.x * 0.15, (p.y - 0.617) * 0.35, 0.004) * uMorph2.z * wl;
  float wy = (1.0 - smoothstep(0.62, 0.66, p.y)) * smoothstep(0.5, 0.56, p.y) * fr; d.y -= 0.012 * uMorph2.w * wy * clamp((0.66 - p.y) / 0.1, 0.0, 1.0);
  return d;
}`;
const NS_FACE = `{ vec3 b = vBindP; float ax = abs(b.x), front = smoothstep(0.07, 0.11, b.z);
  diffuseColor.rgb *= uSkin;
  float hn = fract(sin(dot(floor(b * vec3(1500.0, 650.0, 1500.0)), vec3(12.9898, 78.233, 45.164))) * 43758.5453);
  float lips = (1.0 - smoothstep(0.021, 0.028, ax)) * smoothstep(0.606, 0.61, b.y) * (1.0 - smoothstep(0.624, 0.628, b.y)) * front;
  float line = 0.627 + max(ax - 0.028, 0.0) * 0.55;   /* the beard's edge on the cheek, rising to the ear */
  float beard = (1.0 - smoothstep(line - 0.004, line + 0.004, b.y)) * smoothstep(0.548, 0.566, b.y) * smoothstep(-0.035, 0.035, b.z) * (1.0 - lips);
  float must = (1.0 - smoothstep(0.034 + (0.636 - b.y) * 0.5, 0.041 + (0.636 - b.y) * 0.5, ax)) * smoothstep(0.626, 0.629, b.y) * (1.0 - smoothstep(0.64, 0.645, b.y)) * front;
  float brow = smoothstep(0.011, 0.016, ax) * (1.0 - smoothstep(0.05, 0.057, ax)) * smoothstep(0.704, 0.707, b.y - (ax - 0.03) * (ax - 0.03) * -6.0) * (1.0 - smoothstep(0.715, 0.719, b.y - (ax - 0.03) * (ax - 0.03) * -6.0)) * smoothstep(0.09, 0.11, b.z);
  nsHairK = clamp(uHair.x * must * (0.7 + 0.5 * hn) + uHair.y * beard * (0.5 + 0.5 * hn) + uHair.z * beard * step(0.5, hn) * 0.65 + uHair.w * brow * (0.55 + 0.45 * hn), 0.0, 1.0);
  diffuseColor.rgb = mix(diffuseColor.rgb, uHairC * (0.75 + 0.5 * hn), nsHairK);
  float fore = smoothstep(0.725, 0.73, b.y) * (1.0 - smoothstep(0.758, 0.764, b.y)) * (1.0 - smoothstep(0.038, 0.052, ax)) * front;
  float lines = fore * smoothstep(0.8, 1.0, sin(b.y * 1050.0 + sin(b.x * 70.0) * 1.5));
  float crow = smoothstep(0.052, 0.057, ax) * (1.0 - smoothstep(0.07, 0.076, ax)) * smoothstep(0.674, 0.678, b.y) * (1.0 - smoothstep(0.698, 0.702, b.y)) * smoothstep(0.8, 1.0, sin((b.y + ax * 0.7) * 1000.0));
  float bags = smoothstep(0.012, 0.02, ax) * (1.0 - smoothstep(0.05, 0.058, ax)) * exp(-pow((b.y - 0.668) / 0.006, 2.0)) * front;
  diffuseColor.rgb *= 1.0 - uAge * (0.28 * (lines + crow) + 0.12 * bags);
  /* the depths of the face a shade darker, as light falls into them: the eye sockets and under the brows, the folds from the nose to the
     mouth, under the nose and the lower lip, the sides of the nose, under the chin */
  float eye = exp(-pow((ax - 0.034) / 0.024, 2.0) - pow((b.y - 0.688) / 0.016, 2.0)) * front;
  float ubrow = smoothstep(0.014, 0.02, ax) * (1.0 - smoothstep(0.05, 0.058, ax)) * exp(-pow((b.y - 0.703) / 0.004, 2.0)) * front;
  vec2 q = vec2(ax, b.y) - vec2(0.021, 0.641), sd = vec2(0.011, -0.028); float hq = clamp(dot(q, sd) / dot(sd, sd), 0.0, 1.0); float nl = (1.0 - smoothstep(0.0015, 0.005, length(q - sd * hq))) * front;
  float subn = (1.0 - smoothstep(0.012, 0.02, ax)) * exp(-pow((b.y - 0.634) / 0.003, 2.0)) * front, ulip = (1.0 - smoothstep(0.018, 0.026, ax)) * exp(-pow((b.y - 0.603) / 0.003, 2.0)) * front;
  float under = 1.0 - smoothstep(0.555, 0.578, b.y), nside = smoothstep(0.009, 0.014, ax) * (1.0 - smoothstep(0.02, 0.026, ax)) * smoothstep(0.636, 0.645, b.y) * (1.0 - smoothstep(0.672, 0.68, b.y)) * front;
  nsAO = clamp(0.36 * eye + 0.3 * ubrow + 0.32 * nl + 0.3 * subn + 0.25 * ulip + 0.28 * under + 0.15 * nside, 0.0, 0.6) * 0.4; diffuseColor.rgb *= 1.0 - nsAO; }`;
/* who they are: [skin, [moustache, beard, stubble, brows], hair colour, [nose, jaw, chin, cheeks], age]. Ours: the base face, a Mizrahi
   moustache, a freckled redhead, a reservist in his forties, a bearded boy; theirs (over the Egyptian head, moustached already): the base,
   a black Sudanese, a fair man unshaven, a thin conscript, a greying sergeant with a beard */
const NS_FACES = {   /* [skin, [moustache, beard, stubble, brows], hair colour, [nose, jaw, chin, cheeks], age, [face width, brow ridge, lips, face length]] */
  f: [[[1, 1, 1], [0, 0, 0, 0], [0.03, 0.022, 0.016], [0, 0, 0, 0], 0, [0, 0, 0, 0]],
      [[0.82, 0.72, 0.62], [1.0, 0, 0.3, 0.9], [0.022, 0.017, 0.013], [1.0, 0.4, 0, 0], 0.15, [0.5, 0.6, 0.6, 0]],
      [[1.1, 1.0, 0.95], [0, 0, 0.6, 0.6], [0.3, 0.1, 0.03], [-0.6, -0.6, 0.9, -0.4], 0, [-0.6, 0, -0.4, 0.8]],
      [[0.95, 0.86, 0.78], [0.5, 0, 1.0, 0.6], [0.1, 0.095, 0.09], [0.4, 1.0, -0.4, 1.0], 1.0, [0.8, 0.4, 0, -0.4]],
      [[0.9, 0.82, 0.74], [0.8, 1.0, 0, 0.5], [0.028, 0.02, 0.014], [0.3, 0.2, 0.4, -0.6], 0, [-0.3, 0.8, 0.3, 0.4]]],
  e: [[[1, 1, 1], [0, 0, 0, 0], [0.02, 0.016, 0.012], [0, 0, 0, 0], 0, [0, 0, 0, 0]],
      [[0.12, 0.1, 0.1], [0, 0, 0.4, 0.6], [0.012, 0.01, 0.008], [0.9, 0.6, -0.2, 0.2], 0.1, [0.6, 0.5, 1.0, -0.2]],   // a Sudanese - Sudan sent troops to the canal
      [[1.08, 1.0, 0.94], [0, 0, 1.0, 0.9], [0.03, 0.022, 0.016], [-0.3, 0.8, -0.5, 0.5], 0.2, [0.4, 0.2, -0.2, -0.5]],
      [[0.85, 0.77, 0.7], [0, 0, 0.3, 0.4], [0.02, 0.016, 0.012], [0.5, -0.9, 0.8, -1.0], 0, [-0.8, 0.3, -0.3, 1.0]],
      [[0.8, 0.71, 0.64], [1.0, 0.9, 0, 1.0], [0.12, 0.115, 0.11], [0.6, 0.7, 0, 0.8], 1.0, [0.7, 0.7, 0.2, 0]]],
};
const NS_FACE_K = 0.2;   /* the features are moved only a fifth of the way: men who differ, not caricatures */
function nsFaceMat(m, V) {   // m: a skin material over the head's photograph
  nsBindPaint(m, NS_FACE, 'face'); const prev = m.onBeforeCompile, key = m.customProgramCacheKey();
  const U = { uSkin: { value: new THREE.Vector3(...V[0]) }, uHair: { value: new THREE.Vector4(...V[1]) }, uHairC: { value: new THREE.Vector3(...V[2]) }, uMorph: { value: new THREE.Vector4(...V[3]).multiplyScalar(NS_FACE_K) }, uAge: { value: V[4] * 0.5 }, uMorph2: { value: new THREE.Vector4(...V[5]).multiplyScalar(NS_FACE_K) } };
  m.onBeforeCompile = (sh, r) => { prev.call(m, sh, r); Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\n' + NS_MORPH_FN).replace('#include <begin_vertex>', '#include <begin_vertex>\ntransformed += nsMorph(position);');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform vec3 uSkin; uniform vec4 uHair; uniform vec3 uHairC; uniform float uAge; float nsHairK = 0.0, nsAO = 0.0;')
      .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\ntotalEmissiveRadiance *= uSkin * (1.0 - 0.9 * nsHairK) * (1.0 - nsAO);'); };
  m.customProgramCacheKey = () => key + '|fv'; return m;
}
function nsMaterials() {
  if (NEWSOL.mats) return NEWSOL.mats;
  const T = SOLDIER_DATA.tex, std = (o) => new THREE.MeshStandardMaterial(Object.assign({ roughness: 0.9, metalness: 0 }, o));
  const cloth = (side, map, color) => { const m = rimMat(side === 'e' ? 0xff4020 : 0x5f9cff, side === 'e' ? 0 : 0.12); m.vertexColors = false; m.map = map; m.bumpMap = null; m.color.set(color); m.roughness = 0.95; m.customProgramCacheKey = () => 'nsRim' + side; return m; };
  const uniF = nsCamo({ seed: 3, base: 0xac926a, layers: [[0xb49b72, 0.6, 3, 4], [0xa38a63, 0.62, 5, 6]] });   // the IDF's olive drill as the photographs of 1973 show it: khaki-olive, faded unevenly by the sun
  NEWSOL.camo.eg = nsCamo(NS_CAMO.eg);
  const head = nsImage(T.head), headAr = nsImage(T.headAr || T.head), hands = nsImage(T.hands), eyes = nsImage(T.eyes), net = nsNet();
  const hidden = new THREE.MeshBasicMaterial({ visible: false });
  const skin = (map, tint) => std({ map, roughness: 0.6, color: tint, emissive: 0x1a120c, emissiveMap: map });   // a little light of their own: the face shows under the helmet's shadow
  const web = nsWebTex(), belt = (side, color) => nsBeltMat(cloth(side, web, color), side), waist = (m, side) => nsWrinkle(nsBindPaint(m, NS_WAIST + NS_POCKETS + NS_MADEI(side === 'f' ? 0.45 : 0.5) + (side === 'f' ? NS_OPEN_F : ''), 'waist' + side), side);
  const f = [waist(cloth('f', uniF, 0xffffff), 'f'), belt('f', 0xf2dcb0), std({ color: 0x4a2c1c, roughness: 0.55 }), skin(head, 0xffffff), skin(hands, 0xffffff), std({ map: eyes, roughness: 0.15 }),
    nsHelmetMat(net), std({ color: 0x8a7856, roughness: 0.9 }), hidden];   // the chinstraps and liner in tan web
  const cov = NEWSOL.camo.eg.clone(); cov.repeat.set(0.5, 0.5); cov.needsUpdate = true;
  NEWSOL.helm = { cover: nsWrinkle(nsBindPaint(std({ map: cov, roughness: 0.96 }), NS_COVER, 'cover'), 'cv'), net: nsBindPaint(std({ color: 0xa8956c, roughness: 0.72 }), NS_SOVNET, 'sovnet'), sy: nsBindPaint(std({ color: 0x55553b, roughness: 0.62 }), NS_CHIP, 'chip') };
  const e = [waist(cloth('e', NEWSOL.camo.eg, 0xffffff), 'e'), belt('e', 0x5e4c32), std({ color: 0x1d1b19, roughness: 0.55 }), skin(headAr, 0xf0d5ba), skin(hands, 0xf0d5ba), std({ map: eyes, roughness: 0.15 }),
    hidden, hidden, NEWSOL.helm.cover];
  const e2 = e.slice(); e2[8] = NEWSOL.helm.net;   // one man in three bare-helmeted under a net
  // a set of the materials for each face: only the head and the hands differ (the hands take the face's skin)
  const tintOf = (hex, V) => (V ? new THREE.Color(hex).multiply(new THREE.Color(V[0][0], V[0][1], V[0][2])) : new THREE.Color(hex));
  const faces = (base, side, hmap) => NS_FACES[side].map((V, i) => { const a = i ? base.slice() : base, t0 = side === 'e' ? 0xf0d5ba : 0xffffff;
    a[3] = nsFaceMat(skin(hmap, tintOf(t0, V)), V); a[4] = skin(hands, tintOf(t0, V)); a[3].userData.face = V; a[4].userData.face = V; return a; });
  const fv = faces(f, 'f', head), ev = faces(e, 'e', headAr), e2v = ev.map((a) => { const b = a.slice(); b[8] = NEWSOL.helm.net; return b; });
  NEWSOL.mats = { f, e, e2, fv, ev, e2v }; nsUniformFor(MODE); return NEWSOL.mats;
}
/* the enemy's uniform with the chapter: the Syrians on the Hermon in their forest pattern, the Egyptians everywhere else in khaki */
function nsUniformFor(mode) {
  if (!NEWSOL.mats) return; const sy = mode === 'hermon', E = NEWSOL.mats.e;
  if (sy && !NEWSOL.camo.sy) NEWSOL.camo.sy = nsCamo(NS_CAMO.sy);
  E[0].map = sy ? NEWSOL.camo.sy : NEWSOL.camo.eg; E[1].color.set(sy ? 0x3c3f2a : 0x5e4c32);
  const Hm = NEWSOL.helm, M = NEWSOL.mats;
  for (const [list, net] of [[M.ev, false], [M.e2v, true]]) for (const a of list) {   /* every face: the Syrians a shade fairer; their helmets painted */
    const V = a[3].userData.face; a[3].color.set(sy ? 0xf2dac2 : 0xf0d5ba); if (V) a[3].color.multiply(new THREE.Color(V[0][0], V[0][1], V[0][2])); a[4].color.copy(a[3].color); a[8] = sy ? Hm.sy : net ? Hm.net : Hm.cover; }
  for (const m of [E[0], E[1]]) m.needsUpdate = true;
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
  NEWSOL.n = (NEWSOL.n || 0) + 1; const M = nsMaterials(), fi = (NEWSOL.n * 3 + (NEWSOL.n >> 2)) % 5;   /* his face, and (theirs) one in three bare-helmeted */
  const m = new THREE.SkinnedMesh(nsGeometry(), R.side === 'e' ? (NEWSOL.n % 3 === 0 ? M.e2v : M.ev)[fi] : M.fv[fi]); R.hips.add(m); m.boundingSphere = new THREE.Sphere(V3(0, -0.15, 0), 1.5);
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
const NS_D = { high: PHONE ? 70 : 100, med: 55, low: 32 }[QUAL], NS_MAX = { high: PHONE ? 22 : 36, med: 18, low: 10 }[QUAL];
// in a film every man the camera can make out wears it (the user: no old figures in the films): further, and many more at once
const NS_DC = NS_D * 1.6, NS_MAXC = { high: PHONE ? 60 : 90, med: 45, low: 24 }[QUAL];   // and never more than NS_MAX at once: the nearest (a crowded rampart is many men)
// the figure's level of detail by that same distance: whole near, a third of its triangles past NS_L[0], an eighth past NS_L[1]
const NS_L = { high: PHONE ? [14, 34] : [22, 50], med: [16, 34], low: [10, 24] }[QUAL];   // whole near - every crease, as the showroom shows them - lighter where the detail is too small to see
const NSB = { t: -1, allow: new Set(), cand: [] };
function nsCine() { try { return CINE.on; } catch (e) { return false; } }   // (CINE is defined further on; men are set up before it)
function nsDecide(u) {
  const R = u.rig; if (!R) return; const far = camera.position.distanceTo(u.pos), eff = far * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) / 0.7265 / (u.vs || 1);
  if (NSB.t !== GAME.t) {   // a new frame: last frame's near men ranked, those wearing it already a little ahead (no flicker), the dead behind the living
    NSB.cand.sort((a, b) => a.nsRank - b.nsRank); NSB.allow = new Set(NSB.cand.slice(0, nsCine() ? NS_MAXC : NS_MAX)); NSB.cand.length = 0; NSB.t = GAME.t;
  }
  const nd = nsCine() ? NS_DC : NS_D, near = NEWSOL.on && MODE !== 'farm' && eff < (R.nsOn ? nd * 1.12 : nd);
  if (near) { u.nsRank = eff * (R.nsOn ? 0.85 : 1) * (u.alive ? 1 : 1.6); NSB.cand.push(u); }
  const w = near && NSB.allow.has(u); if (w !== !!R.nsOn) nsShow(R, w);
  if (w && R.ns && NEWSOL.geos && NEWSOL.geos.length > 1) {
    const cur = R.nsLod ?? 0, h = cur === 0 ? 1.1 : 0.92, l = eff < NS_L[0] * (cur === 0 ? h : 1) ? 0 : eff < NS_L[1] * (cur <= 1 ? 1.08 : 0.94) ? 1 : 2;   /* a little hysteresis: no flicker on the line */
    if (l !== cur) { R.nsLod = l; R.ns.geometry = NEWSOL.geos[Math.min(l, NEWSOL.geos.length - 1)]; R.ns.castShadow = SHADOWS && l < (PHONE ? 1 : 2); }   /* the farthest cast no shadow */
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

