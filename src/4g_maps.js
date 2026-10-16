
/* ================= terrain maps made outside the code =================
   Each field chapter can have a map (tools/maps/pack_maps.py -> maps/<name>.json): heights, colour, splat weights for four ground
   materials, vegetation densities and a mask. mapsLoad fetches the chapter's own when the mission loads (with its material set and the
   vegetation cards, once); without them (an old build, no network) every chapter keeps its procedural ground. mapH puts a map under a
   chapter's height function: inside the map's box the map gives the ground and its colour, blending over edge_blend metres back to the
   procedural ground outside it, and the chapter then carves what must be exact (trenches, ramparts, canals) on top. */
const MAPS = {}, MAPSET = {}, MAPV = { kinds: null, atlas: null, mat: null };
const MAP_OF = { rescue: 'rescue', armor: 'armor', farm: 'farm', cross: 'cross', hermon: 'hermon', army: 'army', range: 'range' };
const MAP_URL = 'maps/', MAP_EDGE = 60;
async function mapFetch(url, type) {
  const r = await fetch(url, { cache: 'force-cache' }); if (!r.ok) throw new Error(url + ' ' + r.status);
  if (type === 'zjson') { if (typeof DecompressionStream === 'undefined') throw new Error('no DecompressionStream'); const b = atob((await r.json()).z), u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return new Response(new Blob([u]).stream().pipeThrough(new DecompressionStream('deflate'))).arrayBuffer(); }
  return type === 'json' ? r.json() : type === 'blob' ? r.blob() : r.arrayBuffer();
}
// heights come stored as their difference from the plane through the left, upper and upper-left samples: add the plane back
function mapUnpredict(r, W, H, hmin, hmax) {
  const h = new Uint16Array(W * H), out = new Float32Array(W * H), k = (hmax - hmin) / 65535;
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    const o = j * W + i, p = i === 0 && j === 0 ? 0 : j === 0 ? h[o - 1] : i === 0 ? h[o - W] : h[o - 1] + h[o - W] - h[o - W - 1];
    h[o] = (r[o] + p) & 65535; out[o] = hmin + h[o] * k;
  }
  return out;
}
function mapParse(buf) {
  const dv = new DataView(buf), n = dv.getUint32(0, true), hdr = JSON.parse(new TextDecoder().decode(new Uint8Array(buf, 4, n))), base = 4 + n, L = (k) => { const [o, len, t] = hdr.off[k]; return t === 'u16' ? new Uint16Array(buf, base + o, len / 2) : new Uint8Array(buf, base + o, len); };
  const M = { name: hdr.name, hdr, box: hdr.box, W: hdr.size[0], H: hdr.size[1] };
  M.h = mapUnpredict(L('h'), M.W, M.H, hdr.hmin, hdr.hmax);
  for (const k of ['c', 's', 'v', 'm']) if (hdr.off[k]) M[k] = { a: L(k), W: hdr.layers[k].size[0], H: hdr.layers[k].size[1], ch: hdr.layers[k].ch };
  if (hdr.far) { const F = hdr.far; M.far = { box: F.box, W: F.size[0], H: F.size[1], h: mapUnpredict(L('fh'), F.size[0], F.size[1], F.hmin, F.hmax), c: { a: L('fc'), W: F.csize[0], H: F.csize[1], ch: 3 } }; }
  return M;
}
// an image file's pixels (RGBA), drawn at its own size
async function mapPixels(url) {
  const bmp = await createImageBitmap(await mapFetch(url, 'blob'), { colorSpaceConversion: 'none', premultiplyAlpha: 'none' }), c = document.createElement('canvas'); c.width = bmp.width; c.height = bmp.height;
  const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(bmp, 0, 0); return { w: bmp.width, h: bmp.height, d: g.getImageData(0, 0, bmp.width, bmp.height).data };
}
/* a set's four materials as two texture arrays: albedo (with its AO) and height in alpha; normal x, y in red and green */
async function mapMaterials(set) {
  if (MAPSET[set]) return MAPSET[set];
  if (!MAPV.man) MAPV.man = await mapFetch(MAP_URL + 'mat/materials.json', 'json');
  const ms = MAPV.man[set]; if (!ms) throw new Error('no material set ' + set);
  const imgs = await Promise.all(ms.flatMap((m) => [mapPixels(`${MAP_URL}mat/${set}/${m.name}_a.jpg`), mapPixels(`${MAP_URL}mat/${set}/${m.name}_n.jpg`)]));
  const S = imgs[0].w, A = new Uint8Array(S * S * 4 * 4), N = new Uint8Array(S * S * 4 * 4);
  ms.forEach((m, i) => { const a = imgs[i * 2].d, nn = imgs[i * 2 + 1].d, o = i * S * S * 4;
    for (let p = 0; p < S * S * 4; p += 4) { A[o + p] = a[p]; A[o + p + 1] = a[p + 1]; A[o + p + 2] = a[p + 2]; A[o + p + 3] = nn[p + 2]; N[o + p] = nn[p]; N[o + p + 1] = nn[p + 1]; N[o + p + 2] = 255; N[o + p + 3] = 255; } });
  const arr = (data, srgb) => { const t = new THREE.DataArrayTexture(data, S, S, 4); t.format = THREE.RGBAFormat; t.type = THREE.UnsignedByteType; t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.minFilter = THREE.LinearMipmapLinearFilter; t.magFilter = THREE.LinearFilter; t.generateMipmaps = true; t.anisotropy = ANISO; t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace; t.needsUpdate = true; return t; };
  return (MAPSET[set] = { ms, alb: arr(A, true), nrm: arr(N, false) });
}
async function mapVegLoad() {
  if (MAPV.kinds) return;
  const v = await mapFetch(MAP_URL + 'veg.json', 'json'), t = new THREE.TextureLoader().load(MAP_URL + 'veg_atlas.png');
  t.colorSpace = THREE.SRGBColorSpace; t.flipY = false; t.anisotropy = ANISO; MAPV.atlas = t; MAPV.types = v.types;
  MAPV.kinds = {}; for (const [k, g] of Object.entries(v.kinds)) { const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(g.p, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(g.uv, 2)); geo.setIndex(g.i); geo.computeVertexNormals();
    // cards: light them as if they faced up, so both sides of a leaf take the sun the same
    const nr = geo.attributes.normal; for (let i = 0; i < nr.count; i++) nr.setXYZ(i, 0, 1, 0); MAPV.kinds[k] = geo; }
  MAPV.mat = new THREE.MeshStandardMaterial({ map: t, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.92, metalness: 0 });
}
/* the chapter's map, its materials and the vegetation cards; any failure leaves the chapter on its procedural ground */
async function mapsLoad(m) {
  const name = MAP_OF[m]; if (!name || MAPS[name] !== undefined) return;
  try {
    const M = mapParse(await mapFetch(`${MAP_URL}${name}.json?v=${MAP_VER}`, 'zjson'));
    if (M.hdr.set && (!LITE || QS.has('maptex'))) M.set = await mapMaterials(M.hdr.set);   // the textured ground: high quality (or ?maptex)
    if (M.v) await mapVegLoad();
    MAPS[name] = M;
  } catch (e) { console.warn('map', name, 'not loaded - the procedural ground stays', e); MAPS[name] = null; }
}
const MAP_VER = '20261015a';
// a layer sampled at a point of the map's box (u, v in 0..1, corner-aligned): bilinear
function mapBil(a, W, H, u, v) {
  const x = clamp(u, 0, 1) * (W - 1), y = clamp(v, 0, 1) * (H - 1), i = Math.min(W - 2, Math.floor(x)), j = Math.min(H - 2, Math.floor(y)), fx = x - i, fy = y - j, o = j * W + i;
  return (a[o] * (1 - fx) + a[o + 1] * fx) * (1 - fy) + (a[o + W] * (1 - fx) + a[o + W + 1] * fx) * fy;
}
function mapCh(L, u, v, c) {
  const x = clamp(u, 0, 1) * (L.W - 1), y = clamp(v, 0, 1) * (L.H - 1), i = Math.min(L.W - 2, Math.floor(x)), j = Math.min(L.H - 2, Math.floor(y)), fx = x - i, fy = y - j, n = L.ch, a = L.a, o = (j * L.W + i) * n;
  return ((a[o + c] * (1 - fx) + a[o + n + c] * fx) * (1 - fy) + (a[o + L.W * n + c] * (1 - fx) + a[o + L.W * n + n + c] * fx) * fy) / 255;
}
const mapUV = (M, x, z) => [(x - M.box[0]) / (M.box[1] - M.box[0]), (z - M.box[2]) / (M.box[3] - M.box[2])];
function mapHeightAt(M, x, z) { const [u, v] = mapUV(M, x, z); return mapBil(M.h, M.W, M.H, u, v); }
/* the ground of a chapter from its map: (x, z) -> height, leaving the colour in COL. Inside the box the map, blending back to fallback
   (the chapter's procedural ground) over MAP_EDGE metres at its edges; then carve(x, z, h) - the chapter's exact features - if given */
function mapH(name, fallback, carve) {
  const M = MAPS[name]; if (!M) return carve ? (x, z) => carve(x, z, fallback(x, z)) : fallback;
  const bw = M.box[1] - M.box[0], bd = M.box[3] - M.box[2];
  return (x, z) => {
    const u = (x - M.box[0]) / bw, v = (z - M.box[2]) / bd, e = Math.min(u * bw, (1 - u) * bw, v * bd, (1 - v) * bd);
    let h;
    if (e <= 0) h = fallback(x, z);
    else {
      const w = smooth(0, MAP_EDGE, e), hm = mapBil(M.h, M.W, M.H, u, v);
      let r = mapCh(M.c, u, v, 0), g = mapCh(M.c, u, v, 1), b = mapCh(M.c, u, v, 2);
      if (w < 1) { const hf = fallback(x, z); r = lerp(COL[0], r, w); g = lerp(COL[1], g, w); b = lerp(COL[2], b, w); h = lerp(hf, hm, w); } else h = hm;
      COL[0] = r; COL[1] = g; COL[2] = b;
    }
    return carve ? carve(x, z, h) : h;
  };
}

/* ---------- the ground's material: four PBR materials blended by the splat weights ----------
   Near the camera each material's own texture (two scales, to hide the repeat), blended by its height so sand settles between stones;
   the map's colour (in the vertices) keeps the hue, so far ground and near ground agree. Past ~260 m it is the colour alone */
function mapTerrainMat(M) {
  if (!M || !M.set || !M.s) return terrainMat();
  if (M.mat) return M.mat;
  const S = M.set, ms = S.ms, sp = new THREE.DataTexture(new Uint8Array(M.s.a), M.s.W, M.s.H, THREE.RGBAFormat); sp.magFilter = THREE.LinearFilter; sp.minFilter = THREE.LinearFilter; sp.needsUpdate = true;
  const v4 = (f) => new THREE.Vector4(...ms.map(f)), avg = ms.map((m) => new THREE.Vector3(...m.avg.map(lin)));
  const U = { uSplat: { value: sp }, uBox: { value: new THREE.Vector4(M.box[0], M.box[2], M.box[1] - M.box[0], M.box[3] - M.box[2]) }, uAlb: { value: S.alb }, uNrm: { value: S.nrm },
    uSize: { value: v4((m) => m.size) }, uDepth: { value: v4((m) => m.depth) }, uRough: { value: v4((m) => m.rough) }, uAvg: { value: avg }, uMicro: { value: TX.micro } };
  const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, metalness: 0, envMapIntensity: 0.3 });
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWPos; varying vec3 vWNrm;')
      .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWPos = (modelMatrix * vec4(transformed, 1.0)).xyz; vWNrm = normalize(mat3(modelMatrix) * objectNormal);');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
      precision highp sampler2DArray;
      varying vec3 vWPos; varying vec3 vWNrm; uniform sampler2D uSplat; uniform sampler2D uMicro; uniform sampler2DArray uAlb; uniform sampler2DArray uNrm;
      uniform vec4 uBox, uSize, uDepth, uRough; uniform vec3 uAvg[4];
      vec4 gB; float gNear; vec2 gN;
      vec4 tAlb(int i, vec2 p) { return texture(uAlb, vec3(p, float(i))); }`)
      .replace('#include <color_fragment>', `#include <color_fragment>
      {
        float cd = length(vWPos - cameraPosition);
        gNear = 1.0 - smoothstep(70.0, 260.0, cd);
        vec4 w = texture2D(uSplat, (vWPos.xz - uBox.xy) / uBox.zw);
        w /= max(w.x + w.y + w.z + w.w, 1e-3);
        vec3 alb = vec3(0.0); vec2 nn = vec2(0.0); vec4 hh;
        vec4 a0 = tAlb(0, vWPos.xz / uSize.x), a1 = tAlb(1, vWPos.xz / uSize.y), a2 = tAlb(2, vWPos.xz / uSize.z), a3 = tAlb(3, vWPos.xz / uSize.w);
        vec4 b0 = tAlb(0, vWPos.xz / (uSize.x * 4.7) + 0.37), b1 = tAlb(1, vWPos.xz / (uSize.y * 4.7) + 0.37), b2 = tAlb(2, vWPos.xz / (uSize.z * 4.7) + 0.37), b3 = tAlb(3, vWPos.xz / (uSize.w * 4.7) + 0.37);
        a0 = mix(a0, b0, 0.35); a1 = mix(a1, b1, 0.35); a2 = mix(a2, b2, 0.35); a3 = mix(a3, b3, 0.35);
        hh = w + vec4(a0.a, a1.a, a2.a, a3.a) * uDepth * 6.0 * step(0.002, w);
        float mx = max(max(hh.x, hh.y), max(hh.z, hh.w)) - 0.18;
        vec4 b = max(hh - mx, 0.0) * step(0.002, w); b /= max(b.x + b.y + b.z + b.w, 1e-4); gB = b;
        alb = a0.rgb * b.x + a1.rgb * b.y + a2.rgb * b.z + a3.rgb * b.w;
        vec3 av = uAvg[0] * b.x + uAvg[1] * b.y + uAvg[2] * b.z + uAvg[3] * b.w;
        diffuseColor.rgb *= mix(vec3(1.0), clamp(alb / max(av, vec3(0.02)), 0.0, 2.2), gNear);
        // the far ground is not one flat colour: broad lighter and darker patches
        vec3 p1 = texture2D(uMicro, vWPos.xz / 61.0 + 0.5).rgb, p2 = texture2D(uMicro, vWPos.xz / 230.0 + 0.13).rgb;
        diffuseColor.rgb *= mix(vec3(0.84), vec3(1.05), (p1.g * 0.55 + p2.g * 0.45) / 0.8);
      }`)
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = mix(roughnessFactor, dot(gB, uRough), gNear);')
      .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
      if (gNear > 0.0) {
        vec2 n0 = texture(uNrm, vec3(vWPos.xz / uSize.x, 0.0)).rg, n1 = texture(uNrm, vec3(vWPos.xz / uSize.y, 1.0)).rg, n2 = texture(uNrm, vec3(vWPos.xz / uSize.z, 2.0)).rg, n3 = texture(uNrm, vec3(vWPos.xz / uSize.w, 3.0)).rg;
        vec2 t = (n0 * gB.x + n1 * gB.y + n2 * gB.z + n3 * gB.w) * 2.0 - 1.0;
        vec3 nW = normalize(vWNrm), T = normalize(vec3(1.0, 0.0, 0.0) - nW * nW.x), Bt = cross(nW, T);
        vec3 pw = normalize(nW + (T * t.x + Bt * t.y) * 0.9 * gNear);
        normal = normalize((viewMatrix * vec4(pw, 0.0)).xyz);
      }`);
  };
  m.customProgramCacheKey = () => 'mapTerrain';
  return (M.mat = m);
}

/* ---------- vegetation from the map: its density layer (RGBA, one kind - or a share of kinds - per channel) ----------
   Shrubs and trees stand once over the whole box, as many as the density asks up to a cap; grass and reeds, too many for that, live in a
   patch that follows the camera: a fixed set of slots on a world-space grid round it, each kept or dropped by the density there */
const MAPVEG_CAP = { grass_dry: 0, grass_green: 0, reeds: 0, shrub_desert: LITE ? 1400 : 3600, garrigue: LITE ? 1600 : 4200, tamarisk: LITE ? 260 : 700, oak: LITE ? 160 : 420, palm: LITE ? 140 : 360 };
const MAPVEG_PATCH = { grass_dry: 1, grass_green: 1, reeds: 1 };
const MAPGRASS = { list: [], R: LITE ? 34 : 56, step: LITE ? 1.7 : 1.25 };
function mapVeg(M, at, ok) {
  if (!M || !M.v || !MAPV.kinds) return [];
  const out = [], r = rng(9173 + M.W), V = M.v, cw = (M.box[1] - M.box[0]) / (V.W - 1), cd = (M.box[3] - M.box[2]) / (V.H - 1), types = Object.fromEntries(MAPV.types.map((t) => [t.name, t]));
  const want = {}, cells = {};
  'RGBA'.split('').forEach((chn, c) => { for (const [kind, share] of (M.hdr.veg && M.hdr.veg[chn]) || []) { if (MAPVEG_PATCH[kind]) { (MAPGRASS.kinds = MAPGRASS.kinds || []).push([M, c, kind, share * M.hdr.vegMax[c]]); continue; }
    let tot = 0; for (let j = 0; j < V.H; j++) for (let i = 0; i < V.W; i++) tot += V.a[(j * V.W + i) * 4 + c] / 255 * M.hdr.vegMax[c] * share * cw * cd;
    want[kind] = { c, share, k: Math.min(1, (MAPVEG_CAP[kind] ?? 500) / Math.max(1, tot)) }; } });
  for (const [kind, W] of Object.entries(want)) {
    const geo = MAPV.kinds[kind], t = types[kind]; if (!geo || !t || W.k <= 0) continue; const mats = [], M4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), sc = V3();
    for (let j = 0; j < V.H; j++) for (let i = 0; i < V.W; i++) {
      const n = V.a[(j * V.W + i) * 4 + W.c] / 255 * M.hdr.vegMax[W.c] * W.share * cw * cd * W.k; let cnt = Math.floor(n) + (r() < n % 1 ? 1 : 0);
      while (cnt-- > 0) { const x = M.box[0] + (i + r() - 0.5) * cw, z = M.box[2] + (j + r() - 0.5) * cd; if (ok && !ok(x, z)) continue; const y = at(x, z); if (y < 0.2) continue;
        const s = 0.7 + r() * 0.6; e.set(0, r() * Math.PI * 2, 0); q.setFromEuler(e); sc.set(s, s * (0.85 + r() * 0.3), s); mats.push(M4.compose(V3(x, y - 0.05 * s, z), q, sc).clone()); }
    }
    if (!mats.length) continue;
    const im = new THREE.InstancedMesh(geo, MAPV.mat, mats.length); mats.forEach((m4, k) => im.setMatrixAt(k, m4)); im.instanceMatrix.needsUpdate = true; im.computeBoundingSphere();
    im.castShadow = !LITE && t.height_m > 1.5; im.receiveShadow = false; scene.add(onLayer1(im)); out.push(im);
  }
  mapGrassBuild(at, ok);
  return out;
}
// the grass patch: a ring of slots round the camera on a world grid, refreshed when the camera crosses a grid cell
function mapGrassBuild(at, ok) {
  if (!MAPGRASS.kinds || !MAPGRASS.kinds.length) return;
  const n = Math.ceil((2 * MAPGRASS.R / MAPGRASS.step) ** 2 * 0.8);
  for (const [M, c, kind, max] of MAPGRASS.kinds) { if (MAPGRASS.list.some((g) => g.M === M && g.kind === kind)) continue; const geo = MAPV.kinds[kind]; if (!geo) continue;
    const im = new THREE.InstancedMesh(geo, MAPV.mat, n); im.count = 0; im.frustumCulled = false; im.castShadow = false; im.userData.dyn = true; scene.add(onLayer1(im));
    MAPGRASS.list.push({ M, c, kind, max, im, at, ok, cx: 1e9, cz: 1e9 }); }
  MAPGRASS.kinds = [];
}
const _gM = new THREE.Matrix4(), _gQ = new THREE.Quaternion(), _gS = V3(), _gP = V3(), _gY = V3(0, 1, 0);
function mapGrassTick() {
  if (!MAPGRASS.list.length) return; const st = MAPGRASS.step, R = MAPGRASS.R, cam = camera.position;
  for (const G of MAPGRASS.list) {
    const vis = GROUND && G.M === MAPS[MAP_OF[MODE]]; G.im.visible = vis; if (!vis) continue;
    const cx = Math.round(cam.x / st), cz = Math.round(cam.z / st); if (Math.abs(cx - G.cx) + Math.abs(cz - G.cz) < 2) continue; G.cx = cx; G.cz = cz;
    const n0 = Math.ceil(R / st), M = G.M; let k = 0;
    for (let j = -n0; j <= n0; j++) for (let i = -n0; i <= n0; i++) {
      if (i * i + j * j > n0 * n0) continue; const gi = cx + i, gj = cz + j, hsh = Math.abs(Math.sin(gi * 127.1 + gj * 311.7) * 43758.5453) % 1, h2 = Math.abs(Math.sin(gi * 269.5 + gj * 183.3) * 24634.6345) % 1;
      const x = (gi + h2 - 0.5) * st, z = (gj + hsh - 0.5) * st, [u, v] = mapUV(M, x, z); if (u < 0 || u > 1 || v < 0 || v > 1) continue;
      const d = mapCh(M.v, u, v, G.c) * G.max * st * st * 0.28; if (hsh > d) continue;
      if (G.ok && !G.ok(x, z)) continue; const y = G.at(x, z); if (y < 0.15 || k >= G.im.instanceMatrix.count) continue;
      const s = 0.65 + h2 * 0.7; _gQ.setFromAxisAngle(_gY, hsh * 40); _gS.set(s, s * (0.8 + (hsh * 7) % 0.4), s); _gM.compose(_gP.set(x, y - 0.03, z), _gQ, _gS); G.im.setMatrixAt(k++, _gM);
    }
    G.im.count = k; G.im.instanceMatrix.needsUpdate = true;
  }
}
/* a carpet of short grass, about 20 cm, round the camera wherever a chapter asks for it (grassCarpet(mode, ok)): the ground drawn again in
   stacked shells, each keeping only the spots where a blade reaches that high - close up a field of separate blades thinning to their tips,
   further off a soft even pile, fading out at the patch's edge. ok(x, z) is 0 where there is none (roads, trenches, floors). It takes the
   scene's light and shadows like the ground under it */
const GRASS = { by: {}, cur: null, mesh: null, cx: 1e9, cz: 1e9, N: LITE ? 37 : 57, S: LITE ? 0.8 : 0.65, L: LITE ? 8 : 14, uT: { value: 0 }, uH: { value: 0.21 }, uDen: { value: 0.62 },
  uBase: { value: new THREE.Color() }, uTipA: { value: new THREE.Color() }, uTipB: { value: new THREE.Color() } };
/* the grass of each chapter's map: where (ok) and what (height in m, how sparse - the share of empty blade cells - and its colours, linear) */
const GRASS_KIND = {
  green: { h: 0.21, den: 0.62, base: [0.07, 0.12, 0.035], a: [0.3, 0.5, 0.1], b: [0.55, 0.53, 0.18] },   // a watered field, the mountain in the rains
  farm: { h: 0.2, den: 0.6, base: [0.07, 0.11, 0.035], a: [0.27, 0.44, 0.09], b: [0.5, 0.48, 0.17] },
  dry: { h: 0.2, den: 0.8, base: [0.12, 0.1, 0.05], a: [0.5, 0.47, 0.18], b: [0.7, 0.6, 0.27] },      // the desert's dry grass, straw and olive, in tufts with sand between
};
function grassCarpet(map, ok, kind = 'green') { GRASS.by[map] = { ok, k: GRASS_KIND[kind] || GRASS_KIND.green }; GRASS.cur = null; if (!GRASS.mesh) grassBuild(); }
function grassBuild() {
  const N = GRASS.N, base = new THREE.PlaneGeometry(1, 1, N - 1, N - 1); base.rotateX(-Math.PI / 2);
  const g = new THREE.InstancedBufferGeometry(); g.index = base.index; g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * N * 3), 3)); g.setAttribute('normal', base.attributes.normal);
  g.setAttribute('aMask', new THREE.BufferAttribute(new Float32Array(N * N), 1));
  const sh = new Float32Array(GRASS.L); for (let i = 0; i < GRASS.L; i++) sh[i] = (i + 1) / GRASS.L; g.setAttribute('aShell', new THREE.InstancedBufferAttribute(sh, 1)); g.instanceCount = GRASS.L;
  const mat = new THREE.MeshLambertMaterial({ color: 0xffffff });
  mat.onBeforeCompile = (sh2) => { Object.assign(sh2.uniforms, { uT: GRASS.uT, uH: GRASS.uH, uDen: GRASS.uDen, uBase: GRASS.uBase, uTipA: GRASS.uTipA, uTipB: GRASS.uTipB });
    sh2.vertexShader = 'attribute float aShell;\nattribute float aMask;\nuniform float uH;\nuniform float uT;\nvarying float vS;\nvarying float vM;\nvarying vec3 vGW;\n' + sh2.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
      transformed.y += aShell * uH;
      transformed.xz += vec2(sin(uT * 1.7 + position.x * 0.37 + position.z * 0.23), cos(uT * 1.3 + position.z * 0.31 + position.x * 0.11)) * 0.028 * aShell * aShell;
      vS = aShell; vM = aMask; vGW = transformed;`);
    sh2.fragmentShader = 'uniform float uDen;\nuniform vec3 uBase;\nuniform vec3 uTipA;\nuniform vec3 uTipB;\nvarying float vS;\nvarying float vM;\nvarying vec3 vGW;\nfloat gH(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }\n' + sh2.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
      if (vM < 0.03) discard;
      float dC = length(vGW - cameraPosition), th = 0.0, r2 = 0.5; bool hit = false;
      vec2 gq = vGW.xz / 3.5, gi = floor(gq), gf = fract(gq); gf = gf * gf * (3.0 - 2.0 * gf);
      float pat = mix(mix(gH(gi), gH(gi + vec2(1.0, 0.0)), gf.x), mix(gH(gi + vec2(0.0, 1.0)), gH(gi + vec2(1.0, 1.0)), gf.x), gf.y);
      if (gH(floor(gl_FragCoord.xy) + 0.37) < smoothstep(6.5, 12.0, dC)) discard;   // past ~12 m the blades are finer than a pixel: the green ground under them stands for them
      for (int L = 0; L < 2; L++) {
        vec2 qq = L == 0 ? mat2(0.92, -0.39, 0.39, 0.92) * vGW.xz * 21.0 : mat2(0.39, -0.92, 0.92, 0.39) * vGW.xz * 25.0 + 13.7, c = floor(qq) + float(L) * 57.0, f = fract(qq) - 0.5;   // two grids at odd angles: no lattice, no moire along the axes
        if (gH(c) < uDen - 0.4 * pat) continue;   // clumps: denser where the patch noise is high
        float hb = (0.3 + 0.7 * gH(c + 11.3)) * (0.55 + 0.55 * pat) * vM; if (vS > hb) continue;
        vec2 o = (vec2(gH(c + 3.1), gH(c + 7.7)) - 0.5) * 0.75;
        if (length(f - o) < (0.12 + 0.16 * gH(c + 5.5)) * (1.0 - vS / hb) + 0.035) { hit = true; th = vS / hb; r2 = gH(c + 17.31) * 0.45 + pat * 0.55; }
      }
      if (!hit) discard;
      diffuseColor.rgb = mix(uBase, mix(uTipA, uTipB, smoothstep(0.4, 0.95, r2)), 0.25 + 0.75 * th);`); };
  mat.customProgramCacheKey = () => 'grasscarpet';
  const m = GRASS.mesh = new THREE.Mesh(g, mat); m.frustumCulled = false; m.castShadow = false; m.receiveShadow = true; m.userData.dyn = true; m.visible = false; scene.add(m);
}
function grassTick() {
  const m = GRASS.mesh; if (!m) return; const map = MAP_OF[MODE], g = GROUND && GRASS.by[map]; m.visible = !!g; if (!g) return;
  if (GRASS.cur !== map) { GRASS.cur = map; GRASS.cx = 1e9; const k = g.k; GRASS.uH.value = k.h; GRASS.uDen.value = k.den; GRASS.uBase.value.setRGB(...k.base); GRASS.uTipA.value.setRGB(...k.a); GRASS.uTipB.value.setRGB(...k.b); }
  GRASS.uT.value = performance.now() / 1000;
  const S = GRASS.S, N = GRASS.N, cam = camera.position, cx = Math.round(cam.x / S), cz = Math.round(cam.z / S); if (Math.abs(cx - GRASS.cx) + Math.abs(cz - GRASS.cz) < 2) return; GRASS.cx = cx; GRASS.cz = cz;
  const P = m.geometry.attributes.position.array, Mk = m.geometry.attributes.aMask.array, h = (N - 1) / 2, R = h * S;
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) { const k = j * N + i, x = (cx + i - h) * S, z = (cz + j - h) * S, d = Math.hypot(i - h, j - h) * S;
    const y = groundAt(x, z); P[k * 3] = x; P[k * 3 + 1] = y; P[k * 3 + 2] = z;
    Mk[k] = d > R || !g.ok(x, z) || (groundAt(x + 1.4, z) + groundAt(x - 1.4, z) + groundAt(x, z + 1.4) + groundAt(x, z - 1.4)) / 4 - y > 0.35 ? 0 : 1 - smooth(R * 0.6, R, d); }   // none in a cut: a trench, a ditch, a pit
  m.geometry.attributes.position.needsUpdate = true; m.geometry.attributes.aMask.needsUpdate = true;
}
{ const prev = scene.onBeforeRender; scene.onBeforeRender = function (...a) { prev.apply(this, a); mapGrassTick(); grassTick(); }; }
