
/* ================= field chapters 2, 3 and 5: their own maps, vehicles, Sagger missiles and cinematics ================= */

/* ---------- maps: each chapter has a terrain of its own, fine over the battlefield and coarse out to the horizon ---------- */
/* the ground of the field chapters: the vertex colours carry each place's palette; on top of them the material lays grit and ripples
   near the camera, broad lighter and darker patches far away, a ridged bump so the low sun rakes across the sand, and rock-grey on the slopes */
let TERRAIN_MAT = null;
function terrainMat() {
  if (TERRAIN_MAT) return TERRAIN_MAT;
  const bump = TX.sandBump || (TX.sandBump = sandBumpTex()); bump.repeat.set(0.47, 0.47);
  const m = new THREE.MeshStandardMaterial({ vertexColors: true, map: TX.micro, bumpMap: bump, bumpScale: LITE ? 0.22 : 0.42, roughness: 0.96, metalness: 0, envMapIntensity: 0.3 });
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uMicro = { value: TX.micro };
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWPos; varying float vSlope;')
      .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWPos = (modelMatrix * vec4(transformed, 1.0)).xyz; vSlope = 1.0 - clamp(normal.y, 0.0, 1.0);');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vWPos; varying float vSlope; uniform sampler2D uMicro;')
      .replace('#include <map_fragment>', `#include <map_fragment>
      {
        float cd = length(vWPos - cameraPosition);
        // grit underfoot, two sizes, fading out by 140 m
        float mf = 1.0 - smoothstep(18.0, 140.0, cd);
        vec3 g1 = texture2D(uMicro, vWPos.xz / 1.35 + 0.21).rgb, g2 = texture2D(uMicro, vWPos.xz / 0.42).rgb;
        diffuseColor.rgb *= mix(vec3(1.0), g1 * (0.55 + 0.45 * g2) * 1.35, mf * 0.75);
        // broad tonal patches, so the far ground is not one flat colour
        vec3 p1 = texture2D(uMicro, vWPos.xz / 61.0 + 0.5).rgb, p2 = texture2D(uMicro, vWPos.xz / 230.0 + 0.13).rgb, p3 = texture2D(uMicro, vWPos.xz / 11.0 + 0.77).rgb;
        diffuseColor.rgb *= mix(vec3(0.78), vec3(1.06), (p1.g * 0.55 + p2.g * 0.45) / 0.8);
        float mid = 1.0 - smoothstep(60.0, 420.0, cd);
        diffuseColor.rgb *= mix(1.0, 0.86 + 0.28 * p3.g, mid * 0.7);
        // stretches of desert pavement: darker gravel flats with their own speckle
        float gm = smoothstep(0.5, 0.7, texture2D(uMicro, vWPos.xz / 37.0 + 0.31).g) * (1.0 - smoothstep(300.0, 1200.0, cd));
        float spk = texture2D(uMicro, vWPos.xz / 1.9 + 0.6).g;
        diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(0.76, 0.73, 0.70) * (0.8 + 0.45 * spk), gm * 0.85);
        // the wind draws long faint streaks across the sand
        float st = texture2D(uMicro, vec2(vWPos.x * 0.004 + vWPos.z * 0.09, vWPos.z * 0.004 - vWPos.x * 0.03)).g;
        diffuseColor.rgb *= mix(1.0, 0.93 + 0.14 * st, 0.6 * (1.0 - smoothstep(150.0, 900.0, cd)));
        // steeper ground reads as rock and shadowed scree: greyer and darker
        float sl = smoothstep(0.1, 0.42, vSlope);
        diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(0.72, 0.73, 0.76) + vec3(0.02), sl * 0.8);
      }`);
  };
  m.customProgramCacheKey = () => 'terrain3';
  return (TERRAIN_MAT = m);
}
function makeGround(d) {
  const s0 = LITE ? d.step * 1.6 : d.step, ext = 15000;
  // fine bands: where a cut in the ground is narrow (a ditch along a field's edge) the grid is drawn tighter, so the floor stays a floor
  const fine = (bands, v) => { for (const [b0, b1, st] of bands || []) if (v >= b0 - st && v <= b1) return LITE ? st * 1.4 : st; return s0; };
  const ax = (a0, a1, bands) => { const a = []; for (let v = a0; v < a1; v += fine(bands, v)) a.push(v); a.push(a1); const lo = [], hi = []; let s = s0, u = a0; while (u > a0 - ext) { s *= 1.2; u -= s; lo.push(u); } s = s0; u = a1; while (u < a1 + ext) { s *= 1.2; u += s; hi.push(u); } return lo.reverse().concat(a, hi); };
  const XS = ax(d.x0, d.x1, d.fineX), ZS = ax(d.z0, d.z1, d.fineZ), NX = XS.length, NZ = ZS.length, HG = new Float32Array(NX * NZ);
  const pos = new Float32Array(NX * NZ * 3), col = new Float32Array(NX * NZ * 3), uv = new Float32Array(NX * NZ * 2), K = 1 / 0.787;
  for (let j = 0; j < NZ; j++) for (let i = 0; i < NX; i++) {
    const x = XS[i], z = ZS[j], k = j * NX + i; const h = d.h(x, z); HG[k] = h;
    pos[k * 3] = x; pos[k * 3 + 1] = h; pos[k * 3 + 2] = z; col[k * 3] = lin(COL[0]) * K; col[k * 3 + 1] = lin(COL[1]) * K; col[k * 3 + 2] = lin(COL[2]) * K; uv[k * 2] = x / 3.3; uv[k * 2 + 1] = z / 3.3;
  }
  const idx = new Uint32Array((NX - 1) * (NZ - 1) * 6); let p = 0;
  for (let j = 0; j < NZ - 1; j++) for (let i = 0; i < NX - 1; i++) { const a = j * NX + i, b = a + 1, c = a + NX, e = c + 1; idx[p++] = a; idx[p++] = c; idx[p++] = b; idx[p++] = b; idx[p++] = c; idx[p++] = e; }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(col, 3)); geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); geo.setIndex(new THREE.BufferAttribute(idx, 1)); geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, terrainMat()); mesh.receiveShadow = !LITE; scene.add(mesh);
  return { mesh, at(x, z) { const i = findIdx(XS, x), j = findIdx(ZS, z); const tx = clamp((x - XS[i]) / (XS[i + 1] - XS[i]), 0, 1), tz = clamp((z - ZS[j]) / (ZS[j + 1] - ZS[j]), 0, 1); const k = j * NX + i; return lerp(lerp(HG[k], HG[k + 1], tx), lerp(HG[k + NX], HG[k + NX + 1], tx), tz); } };
}
function showWorld(mode) {
  PROPS.cur = mode; if (mode !== 'suez') szClarityOff();
  const lists = { mezach: SZ.mezObjs, suez: SZ.objs }; for (const k in CHAP) if (k !== 'mezach' && k !== 'suez') lists[k] = CHAP[k].objs || [];
  for (const v of VEH) if (v.tag) v.tag.visible = false;
  for (const k in lists) if (k !== mode) for (const o of lists[k]) o.visible = false;
  for (const o of lists[mode] || []) if (o !== SZ.ht && o !== TANK.g && !o.userData.dyn) o.visible = true;
  for (const o of WORLD.base) o.visible = mode === 'mezach' || mode === 'suez';
  GROUND = (CHAP[mode] && CHAP[mode].ground) || null; water.visible = !(CHAP[mode] && CHAP[mode].dry);
  if (mode === 'mezach') for (const B of BARRS) B.g.visible = B.on;
  for (const v of VEH) v.g.visible = v.mode === mode && v.shown !== false;
  if (mode !== 'mezach' && AIR.models) { AIR.ev = null; AIR.models.m.g.visible = false; AIR.models.m.wingR.visible = false; AIR.models.mig.visible = false; AIR.models.chute.visible = false; }
  if (TANK.g) TANK.g.visible = mode === 'suez' || !!(CHAP[mode] && CHAP[mode].tank);
}
/* everything a chapter builds goes on its list, so switching chapters hides it in one go */
function chapterBuild(C, fn) { const k0 = scene.children.length; fn(); C.objs = scene.children.slice(k0); dimEnv(scene); }
const toWorld = (o) => (x, z) => [o.x + x, o.z + z];

/* ---------- models ---------- */
const SEATED_F = build([
  [G.cap(0.15, 0.24, 4, 10), 0x5d5c3e, M4(0, 0.55, 0, 0, 0, 0, 1.1, 1, 0.8)], [G.box(0.36, 0.2, 0.27), 0x484a31, M4(0, 0.56, 0)], [G.box(0.29, 0.14, 0.07), 0x484a31, M4(0, 0.55, 0.16)],
  [G.sph(0.1, 12, 10), 0xb08566, M4(0, 0.9, 0.02)], [G.sph(0.137, 14, 6, 0, Math.PI * 2, 0, Math.PI * 0.5), 0x4f5638, M4(0, 0.93, 0)],
  [G.cap(0.075, 0.3, 4, 8), 0x55583a, M4(-0.09, 0.28, 0.2, Math.PI / 2, 0, 0)], [G.cap(0.075, 0.3, 4, 8), 0x55583a, M4(0.09, 0.28, 0.2, Math.PI / 2, 0, 0)],
  [G.cap(0.05, 0.2, 4, 8), 0x5d5c3e, M4(-0.18, 0.62, 0.12, -1.1, 0, 0.2)], [G.cap(0.05, 0.2, 4, 8), 0x5d5c3e, M4(0.18, 0.62, 0.12, -1.1, 0, -0.2)],
  [G.box(0.05, 0.07, 0.8), 0x1d1d1d, M4(0.05, 0.66, 0.25, -1.0, 0.2, 0)],
]);
/* the Egyptian T-55: low hull, dome turret, 100 mm gun, five big road wheels; sand paint */
function t55Parts(P) {
  const { T, TD, TK, WH } = P, parts = [
    [G.ext([[-3.0, 0.5], [2.9, 0.5], [3.25, 0.95], [2.4, 1.4], [-2.95, 1.42], [-3.15, 1.0]], 2.3), T, M4(-1.15, 0, 0, 0, 0, 0)],
    [G.box(6.1, 0.06, 0.62), T, M4(0, 1.15, 1.45)], [G.box(6.1, 0.06, 0.62), T, M4(0, 1.15, -1.45)],
    ...[-1, 1].map((sd) => [G.cyl(0.42, 0.42, 1.0, 14), 0x4a4632, M4(-3.1, 1.45, sd * 0.75, 0, 0, Math.PI / 2)]),
    ...[-1, 1].map((sd) => [G.box(1.6, 0.35, 0.4), TD, M4(-1.2, 1.32, sd * 1.5)]),
  ];
  for (const sd of [-1, 1]) { parts.push([G.box(6.0, 0.14, 0.58), TK, M4(0, 0.1, sd * 1.45)], [G.box(5.4, 0.06, 0.58), TK, M4(0, 1.04, sd * 1.45)]); for (const wx of [-2.2, -1.1, 0, 1.1, 2.2]) parts.push([G.cyl(0.42, 0.42, 0.3, 16), WH, M4(wx, 0.48, sd * 1.5, Math.PI / 2, 0, 0)], [G.cyl(0.15, 0.15, 0.32, 8), TD, M4(wx, 0.48, sd * 1.52, Math.PI / 2, 0, 0)]); parts.push([G.cyl(0.32, 0.32, 0.5, 12), TK, M4(2.75, 0.6, sd * 1.45, Math.PI / 2, 0, 0)]); }
  return parts;
}
const T55_HULL = build(t55Parts({ T: 0x9a8a62, TD: 0x8a7b56, TK: 0x24221d, WH: 0x6a6046 }));
const T55_HULL_B = build(t55Parts({ T: 0x2c2926, TD: 0x262320, TK: 0x161513, WH: 0x2a2724 }));
const T55_TUR = build([[G.sph(1.25, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.5), 0x9a8a62, M4(0, 0, 0, 0, 0, 0, 1.05, 0.62, 1.0)], [G.cyl(1.25, 1.3, 0.12, 22), 0x8a7b56, M4(0, 0.04, 0)], [G.cyl(0.09, 0.1, 4.1, 12), 0x7a6c4c, M4(2.9, 0.42, 0, 0, 0, Math.PI / 2)], [G.cyl(0.13, 0.13, 0.3, 12), 0x6a5e42, M4(4.4, 0.42, 0, 0, 0, Math.PI / 2)], [G.cyl(0.35, 0.36, 0.2, 12), 0x8a7b56, M4(-0.3, 0.8, -0.45)], [G.box(0.35, 0.25, 0.3), 0x5a5240, M4(0.1, 0.78, 0.55)]]);
const T55_TUR_B = build([[G.sph(1.25, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.5), 0x2c2926, M4(0, 0, 0, 0, 0, 0, 1.05, 0.62, 1.0)], [G.cyl(0.09, 0.1, 4.1, 12), 0x221f1c, M4(2.9, 0.42, 0, 0, 0, Math.PI / 2)]]);
const ETRUCK_GEO = build(truckParts({ B: 0x8e7f58, D: 0x7f714e, K: 0x1f1e1b, C: 0xa08f66 }));
const ATGUN_GEO = build([[G.box(1.1, 0.5, 0.5), 0x4a5038, M4(0, 0.85, 0)], [G.cyl(0.06, 0.07, 2.6, 10), 0x3a3e30, M4(1.6, 1.0, 0, 0, 0, Math.PI / 2)], [G.box(0.06, 0.9, 1.3), 0x4f5640, M4(0.35, 1.1, 0)], ...[-1, 1].map((sd) => [G.cyl(0.42, 0.42, 0.12, 12), 0x1a1a1a, M4(0, 0.42, sd * 0.75, Math.PI / 2, 0, 0)]), ...[-1, 1].map((sd) => [G.box(2.2, 0.08, 0.08), 0x3a3e30, M4(-1.2, 0.3, sd * 0.35, 0, sd * 0.25, 0)])]);
/* the rubber assault boat of the paratroopers, and the pontoon raft that ferried the first tanks */
const RBOAT_GEO = (() => { const tube = (sd) => [G.cap(0.24, 4.2, 6, 12), 0x2e302c, M4(0, 0.25, sd * 0.78, 0, 0, Math.PI / 2)]; return build([tube(-1), tube(1), [G.sph(0.42, 12, 8), 0x2e302c, M4(2.3, 0.25, 0, 0, 0, 0, 1.2, 0.6, 1.9)], [G.box(4.4, 0.06, 1.5), 0x3a3b36, M4(-0.1, 0.06, 0)], [G.box(0.5, 0.42, 0.3), 0x2a2a28, M4(-2.4, 0.42, 0)], [G.box(0.2, 0.7, 0.18), 0x1e1e1e, M4(-2.55, 0.1, 0)]]); })();
const RAFT_GEO = build([...[-1, 1].map((sd) => [G.cap(0.85, 9, 6, 14), 0x5a5c4a, M4(0, 0.35, sd * 3.0, 0, 0, Math.PI / 2)]), [G.box(11, 0.25, 5.4), 0x4f5142, M4(0, 0.95, 0)], ...[-1, 1].map((sd) => [G.box(2.2, 0.15, 4.2), 0x4a4c3e, M4(sd * 6.4, 0.75, 0, 0, 0, sd * -0.35)])]);

/* rings spreading on the water where something fell in: three of them, one after another */
const RIPPLE_GEO = new THREE.RingGeometry(0.86, 1, 40).rotateX(-Math.PI / 2);
const RIPPLES = [];
function rippleAdd(x, z, k = 1) {
  for (let i = 0; i < 3; i++) { let r = RIPPLES.find((q) => !q.on); if (!r) { if (RIPPLES.length >= 30) return; const m = new THREE.Mesh(RIPPLE_GEO, new THREE.MeshBasicMaterial({ color: 0xdfe8ea, transparent: true, opacity: 0, depthWrite: false })); m.renderOrder = 3; m.visible = false; scene.add(onLayer1(m)); r = { m, on: false }; RIPPLES.push(r); }
    Object.assign(r, { on: true, t: -i * 0.32, life: 2.6 + k * 0.7, k }); r.m.position.set(x, 0.14, z); r.m.visible = false; }
}
function rippleUpd(dt) { for (const r of RIPPLES) { if (!r.on) continue; r.t += dt; if (r.t < 0) continue; const u = r.t / r.life; if (u >= 1) { r.on = false; r.m.visible = false; continue; } r.m.visible = true; const s = (0.8 + u * 9) * r.k; r.m.scale.set(s, 1, s); r.m.material.opacity = 0.6 * (1 - u) * Math.min(1, r.t * 6); } }

/* ---------- vehicles: friendly and Egyptian, driving along paths over the terrain ---------- */
const VEH = [];
const MAT_BURNT = new THREE.MeshStandardMaterial({ color: 0x23201d, roughness: 1 });
function addVeh(o) {
  if ((o.geo === HT_GEO || o.geo === ETRUCK_GEO || o.geo === JEEP_GEO) && typeof VEH_DATA !== 'undefined' && VEH_DATA.jeep) { const r = vehModel('jeep', o.geo === ETRUCK_GEO || (o.side || 'e') === 'e' ? 'e' : 'f'); scene.add(SH(onLayer1(r.g))); o = Object.assign({}, o, { g: r.g, half: [2.05, 2.0, 0.95] }); if (o.mg) Object.assign(o, { mgM: r.mg, mgOff: 0 }); }   // the half-tracks and trucks of the old set are jeeps now
  if (o.geo === TANK_GEO && typeof VEH_DATA !== 'undefined' && VEH_DATA.magach) { const r = vehModel('magach', 'f'); scene.add(SH(onLayer1(r.g))); o = Object.assign({}, o, { g: r.g, tur: r.tur, half: [3.5, 2.6, 1.8] }); }   // the modelled Magach
  if (o.geo === T55_HULL && typeof VEH_DATA !== 'undefined' && VEH_DATA.t55) { const r = vehModel('t55', 'e'); scene.add(SH(onLayer1(r.g))); o = Object.assign({}, o, { g: r.g, tur: r.tur, half: [3.5, 2.3, 1.7] }); delete o.turGeo; }   // the modelled T-55
  const v = Object.assign({ mode: MODE, side: 'e', kind: 'truck', alive: true, hp: 100, armor: 0.12, s: 0, speed: 0, vmax: 7, path: null, fireCd: rand(4, 7), half: [3.2, 2.6, 1.2], fwdX: true, hdV: null, x: 0, z: 0, burnT: 0, fires: [] }, o);
  if (!v.g) { v.g = new THREE.Group(); const m = new THREE.Mesh(v.geo, MAT.vc); v.g.add(m); v.body = m; if (v.geo === TANK_GEO) tankMarks(m, TANK_GEO); if (v.turGeo) { v.tur = new THREE.Group(); v.tur.position.set(v.turAt[0], v.turAt[1], v.turAt[2]); v.tur.add(new THREE.Mesh(v.turGeo, MAT.vc)); v.g.add(v.tur); } scene.add(SH(onLayer1(v.g))); }
  if (v.g.userData.vl) v.g.userData.vl.crew = true;   // a modelled vehicle in the battle has its man at the gun or in the hatch
  v.g.userData.dyn = true; v.g.rotation.order = 'YXZ'; v.mats = []; v.g.traverse((m) => { if (m.isMesh) v.mats.push([m, m.material]); }); VEH.push(v); return v;
}
/* the modelled vehicles (4d_vehicles.js): a group with the body and, on the jeep, its MG on the post, turning about the post's top.
   Each keeps its level of detail by its distance from the camera */
const VLODS = [], _vlp = V3();
function vehModel(name, paint) {
  const VM = name === 'jeep' ? MAT.vehD : MAT.veh, g = new THREE.Group(), body = new THREE.Mesh(vehGeo(name, 0, 'body', paint), VM); g.add(body);
  let mg = null, tur = null; const pv = vehPivot(name);
  if (pv && VEH_DATA[name][0].tur) { tur = new THREE.Group(); tur.position.set(pv[0], pv[1], pv[2]); const m = new THREE.Mesh(vehGeo(name, 0, 'tur', paint), VM); tur.add(m); tur.userData.mesh = m; g.add(tur); }   // a tank's turret turns about its ring
  if (pv && VEH_DATA[name][0].mg) { mg = new THREE.Group(); mg.position.set(pv[0], pv[1], pv[2]); mg.rotation.order = 'YZX'; const m = new THREE.Mesh(vehGeo(name, 0, 'mg', paint), VM); mg.add(m); mg.userData.mesh = m; g.add(mg); m.geometry.computeBoundingBox(); mg.userData.tip = m.geometry.boundingBox.max.x; }
  // the moving parts: each one template drawn at every place it sits (the road wheels, the sprocket and idler, the track links); they ride on the body
  const parts = vehParts(name).map((pd, j) => { const im = new THREE.InstancedMesh(vehPartGeo(name, 0, j, paint), VM, pd.m.length); im.instanceMatrix.setUsage(THREE.DynamicDrawUsage); im.boundingSphere = im.geometry.boundingSphere.clone(); body.add(im); return { im, j }; });
  let wb = 0; { const w = vehParts(name).find((d) => d.steer); if (w) { let a = 1e9, b = -1e9; for (const m of w.m) { a = Math.min(a, m[0]); b = Math.max(b, m[0]); } wb = b - a; } }   // the wheelbase, for steering
  // a tank's gun turns on its trunnions in the turret; the Magach's commander has the jeep's M2 on a pintle on his cupola
  let gun = null, cmg = null; const L0 = VEH_DATA[name][0];
  if (tur && L0.gun) { gun = new THREE.Group(); gun.position.set(L0.gpiv[0], L0.gpiv[1], L0.gpiv[2]); const m = new THREE.Mesh(vehGeo(name, 0, 'gun', paint), VM); gun.add(m); gun.userData.mesh = m; tur.add(gun); }
  if (tur && L0.cpiv && VEH_DATA.jeep) { cmg = new THREE.Group(); cmg.position.set(L0.cpiv[0], L0.cpiv[1], L0.cpiv[2]); cmg.rotation.order = 'YZX'; const m = new THREE.Mesh(vehGeo('jeep', 0, 'mg', paint), VM); cmg.add(m); cmg.userData.mesh = m; tur.add(cmg); m.geometry.computeBoundingBox(); cmg.userData.tip = m.geometry.boundingBox.max.x; }
  const rec = { g, body, mg, tur, gun, cmg, name, paint, lod: 0, parts, odo: 0, odoD: null, steer: 0, steerD: 0, spd: 0, lp: null, wb }; if (parts.length) vehPartsPose(rec); vehMarks(rec); VLODS.push(rec); g.userData.vl = rec; return rec;
}
/* a part's template at a level: its bounding sphere is made to hold every copy (the template itself sits at the hub, the copies all round the hull) */
function vehPartGeo(name, lv, j, paint) {
  const pd = vehParts(name, lv)[j] || vehParts(name, 0)[j], g = vehGeo(name, vehParts(name, lv)[j] ? lv : 0, pd.g, paint);
  if (!g.userData.vs) { g.userData.vs = 1; let R = 0; for (const a of pd.m) R = Math.max(R, Math.hypot(a[0], a[1] - 1, a[2])); g.boundingSphere = new THREE.Sphere(V3(0, 1, 0), R + (pd.r || 0.6) + 0.3); }
  return g;
}
/* the moving parts set for the distance travelled (odo): each wheel turned by distance over its radius about its own axle - the front
   wheels of a jeep also steered into the turn - and each track link slid that fraction of the way to the next link's place, so the
   track runs back along the ground and forward over the top */
const _pm = new THREE.Matrix4(), _pq = new THREE.Quaternion(), _pq2 = new THREE.Quaternion(), _pqz = new THREE.Quaternion(), _pp = V3(), _pone = V3(1, 1, 1), _AXZ = V3(0, 0, 1), _AXY = V3(0, 1, 0);
function vehPartsPose(r) {
  for (const p of r.parts) {
    const d = vehParts(r.name, r.lod)[p.j] || vehParts(r.name, 0)[p.j], m = d.m, im = p.im;
    if (d.k === 'spin') {
      for (let i = 0; i < m.length; i++) { const a = m[i]; _pq.set(a[3], a[4], a[5], a[6]); if (d.steer && d.steer[i] && r.steer) _pq.multiply(_pq2.setFromAxisAngle(_AXY, r.steer));
        _pq.multiply(_pqz.setFromAxisAngle(_AXZ, -d.s[i] * r.odo / d.r)); _pm.compose(_pp.set(a[0], a[1], a[2]), _pq, _pone); im.setMatrixAt(i, _pm); }
    } else {
      const f = ((r.odo / d.pitch) % 1 + 1) % 1; let o = 0;
      for (const n of d.loops) { for (let k = 0; k < n; k++) { const a = m[o + k], b = m[o + (k + 1) % n];
          _pp.set(a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f); _pq.set(a[3], a[4], a[5], a[6]).slerp(_pq2.set(b[3], b[4], b[5], b[6]), f); _pm.compose(_pp, _pq, _pone); im.setMatrixAt(o + k, _pm); }
        o += n; }
    }
    im.instanceMatrix.needsUpdate = true;
  }
  r.odoD = r.odo; r.steerD = r.steer;
}
/* what a moving vehicle leaves behind: dust thrown up from under the rear wheels or the tracks, which hangs and drifts down the wind
   long after it has passed, and the exhaust - a light grey from the jeep's petrol engine, a dark diesel cloud from a tank, thicker as it
   pulls away. Points in the vehicle's own frame (nose +X for the modelled ones, +Z for the drivable tank) */
const TRAIL = {
  jeep: { dust: [[-1.38, 0.1, 0.84], [-1.38, 0.1, -0.8], [-1.75, 0.1, 0.02]], ex: [[-1.98, 0.37, 0.46]], exd: [-1, 0.15, 0.2], rate: 1.0, ds: 0.9, dl: 1.0, dop: 0.8, er: 1.0, es: 0.6, ec: 0x8a867e, eo: 0.32, el: 1.0 },
  magach: null,
  t55: { dust: [[-3.0, 0.1, 1.28], [-3.0, 0.1, -1.28], [-1.4, 0.06, 1.3], [-1.4, 0.06, -1.3], [1.8, 0.06, 1.3], [1.8, 0.06, -1.3]], ex: [[-3.36, 1.38, 0.58], [-3.36, 1.38, -0.58]], exd: [-1, 0.35, 0], rate: 1.5, ds: 1.45, dl: 1.35, er: 2.0, es: 1.15, ec: 0x3a3834, eo: 0.36, el: 1.3, dop: 0.68 },
  mtank: { dust: [[1.55, 0.1, -3.0], [-1.55, 0.1, -3.0], [1.55, 0.06, -1.2], [-1.55, 0.06, -1.2], [1.55, 0.06, 1.8], [-1.55, 0.06, 1.8]], ex: [[0.45, 1.2, -3.62], [-0.45, 1.2, -3.62]], exd: [0, 0.35, -1], rate: 1.5, ds: 1.45, dl: 1.35, er: 2.0, es: 1.15, ec: 0x3a3834, eo: 0.36, el: 1.3, dop: 0.68 },
};
const _te = V3(), _td = V3(), _tf = V3();
function vehTrail(M, spec, spd, acc, dt, st) {
  const a = Math.abs(spd); if (a < 0.35 || st.noDust) return; const e = M.elements, dc = Math.hypot(e[12] - camera.position.x, e[14] - camera.position.z); if (dc > 420) return;
  const far = dc > 170, lk = (LITE ? 0.45 : 1) * (CINE.on ? 0.55 : 1), fl = Math.hypot(e[0], e[1], e[2]) || 1;   // far off: fewer puffs, bigger; in a film, fewer
  _tf.set(e[0] / fl, 0, e[2] / fl);
  st.dA = (st.dA || 0) + dt * Math.min(30, a * 2.4) * spec.rate * lk * (far ? 0.33 : 1);
  while (st.dA >= 1) { st.dA -= 1; st.di = ((st.di || 0) + 1) % spec.dust.length; const p = spec.dust[st.di]; _te.set(p[0], p[1], p[2]).applyMatrix4(M); _te.addScaledVector(_tf, -Math.sign(spd) * (0.8 + Math.random() * 1.4)); dustPuff(_te, groundAt(_te.x, _te.z), spec.ds * (0.7 + Math.min(1, a / 9) * 0.6) * (far ? 1.6 : 1), spec.dl, (spec.dop || 1) * (CINE.on ? 0.7 : 1), -Math.sign(spd) * Math.min(a, 8) * 0.35); }
  st.eA = (st.eA || 0) + dt * (3 + a * 0.7 + Math.min(2, Math.max(0, acc)) * 6) * spec.er * lk * (far ? 0.4 : 1);
  while (st.eA >= 1) { st.eA -= 1; st.ei = ((st.ei || 0) + 1) % spec.ex.length; const p = spec.ex[st.ei]; _te.set(p[0], p[1], p[2]).applyMatrix4(M); _td.set(spec.exd[0], spec.exd[1], spec.exd[2]).transformDirection(M); exhPuff(_te, _td, spec.es * (1 + Math.min(1.5, Math.max(0, acc)) * 0.5) * (far ? 1.4 : 1), spec); }
}
const camNear = (p, sc) => { const d = p.distanceTo(camera.position) - sc * 0.25; return d > 7 ? 1 : Math.max(0.12, d / 7); };
const DUST_COL = [0xd2bf96, 0xc4ae84, 0xdac9a4, 0xb9a37a];
function dustPuff(p, gy, k, lk = 1, ok = 1, back = 0) {   // back: thrown off behind the vehicle (along _tf), slowing
  const q = FX.trail.get(); q.life = (4 + Math.random() * 2.8) * lk; q.s.position.set(p.x + rand(-0.4, 0.4) * k, gy + 0.35 * k, p.z + rand(-0.4, 0.4) * k); q.s.material.color.setHex(DUST_COL[Math.floor(Math.random() * 4)]);
  const s0 = (0.8 + Math.random() * 0.5) * k, s1 = (4 + Math.random() * 2.6) * k, bx = _tf.x * back, bz = _tf.z * back, vx = WIND.x * 0.8 + rand(-0.35, 0.35), vz = WIND.z * 0.8 + rand(-0.35, 0.35), vy = (0.25 + Math.random() * 0.35) * Math.sqrt(k), op = (0.36 + Math.random() * 0.14) * ok;
  q.s.scale.setScalar(s0); q.s.material.opacity = 0;
  q.upd = (q, u, dt) => { const bk = Math.max(0, 1 - u * 4); q.s.position.x += (vx + bx * bk) * dt; q.s.position.z += (vz + bz * bk) * dt; q.s.position.y += vy * dt * (1 - u) * (1.6 - u); q.s.scale.setScalar(s0 + (s1 - s0) * Math.sqrt(u)); q.s.material.opacity = op * Math.min(1, u * 6) * Math.pow(1 - u, 1.4) * camNear(q.s.position, q.s.scale.x); };
}
function exhPuff(p, d, k, spec) {
  const q = FX.exh.get(); q.life = (1.7 + Math.random() * 1.4) * spec.el; q.s.position.copy(p); q.s.material.color.setHex(spec.ec).multiplyScalar(0.85 + Math.random() * 0.3);
  const s0 = 0.3 * k, s1 = (2 + Math.random() * 1.3) * k, v = 1.4 + Math.random() * 1.2, vx = d.x * v, vy = d.y * v + 0.55, vz = d.z * v, op = spec.eo * (0.8 + Math.random() * 0.4);
  q.s.scale.setScalar(s0); q.s.material.opacity = 0;
  q.upd = (q, u, dt) => { const k2 = 1 - u; q.s.position.x += (vx * k2 + WIND.x * 0.8) * dt; q.s.position.y += vy * dt * (1.2 - u * 0.6); q.s.position.z += (vz * k2 + WIND.z * 0.8) * dt; q.s.scale.setScalar(s0 + (s1 - s0) * Math.sqrt(u)); q.s.material.opacity = op * Math.min(1, u * 14) * Math.pow(1 - u, 1.3) * camNear(q.s.position, q.s.scale.x); };
}
/* a vehicle's frame as it stands this frame (a child of the scene composes its own; one carried on something else uses last frame's world matrix) */
const vehMat = (o) => o.parent === scene ? (o.updateMatrix(), o.matrix) : o.matrixWorld;
/* every modelled vehicle, every frame: how far it went along its nose (from where its frame stood), the wheels and tracks set to match
   when it is near enough to see them turn, and the dust and exhaust it leaves */
function vehAnim(dt) {
  if (dt <= 0) return; const c = camera.position;
  for (const r of VLODS) {
    if (!r.g.parent || !r.g.visible) { r.lp = null; continue; }
    const M = vehMat(r.g), e = M.elements, px = e[12], pz = e[14], fl = Math.hypot(e[0], e[1], e[2]) || 1, fx = e[0] / fl, fz = e[2] / fl, hd = Math.atan2(-fz, fx);
    if (!r.lp) { r.lp = [px, pz, hd]; r.spd = 0; continue; }
    let dd = (px - r.lp[0]) * fx + (pz - r.lp[1]) * fz; if (Math.abs(dd) > 8) dd = 0;   // a jump (a reset, a respawn) is not driving
    const yr = wrapPi(hd - r.lp[2]) / dt; r.lp[0] = px; r.lp[1] = pz; r.lp[2] = hd;
    const s0 = r.spd; r.spd += (dd / dt - r.spd) * Math.min(1, dt * 6); const acc = (r.spd - s0) / dt;
    if (r.still) continue;
    r.odo += dd;
    if (r.wb) { const want = Math.abs(r.spd) > 0.4 ? clamp(Math.atan(r.wb * yr / r.spd), -0.5, 0.5) : r.steer; r.steer += (want - r.steer) * Math.min(1, dt * 5); }
    const dist = Math.hypot(px - c.x, pz - c.z);
    if (r.parts && r.parts.length && r.parts[0].im.visible && dist < 170 && (Math.abs(r.odo - r.odoD) > 1e-4 || Math.abs(r.steer - r.steerD) > 1e-3)) vehPartsPose(r);
    const spec = TRAIL[r.name]; if (spec) vehTrail(M, spec, r.spd, acc, dt, r);
  }
}
function vehLodTick() {
  const c = camera.position;
  for (const r of VLODS) { if (!r.g.parent || !r.g.visible) continue; r.g.getWorldPosition(_vlp); const k = r.name === 'jeep' ? 2.4 : 1.7, d = _vlp.distanceTo(c), l = d > QLOD[1] * k ? 2 : d > QLOD[0] * k ? 1 : 0;
    if (l !== r.lod) { r.lod = l; r.body.geometry = vehGeo(r.name, l, 'body', r.paint); if (r.mg && !r.mgHi) r.mg.userData.mesh.geometry = vehGeo(r.name, l, 'mg', r.paint); if (r.tur) r.tur.userData.mesh.geometry = vehGeo(r.name, l, 'tur', r.paint); if (r.gun) r.gun.userData.mesh.geometry = vehGeo(r.name, l, 'gun', r.paint); if (r.cmg && !r.cmgHi) r.cmg.userData.mesh.geometry = vehGeo('jeep', l, 'mg', r.paint); vehPartsLod(r); } }
}
function vehPaint(r, paint) { r.paint = paint; const l = Math.max(0, r.lod); r.body.geometry = vehGeo(r.name, l, 'body', paint); if (r.mg && !r.mgHi) r.mg.userData.mesh.geometry = vehGeo(r.name, l, 'mg', paint); if (r.tur) r.tur.userData.mesh.geometry = vehGeo(r.name, l, 'tur', paint); if (r.gun) r.gun.userData.mesh.geometry = vehGeo(r.name, l, 'gun', paint); if (r.cmg && !r.cmgHi) r.cmg.userData.mesh.geometry = vehGeo('jeep', l, 'mg', paint); vehPartsLod(r); }
/* the parts at the vehicle's level: far off they are already set into the body (pb), and hidden */
function vehPartsLod(r) { const L = VEH_DATA[r.name][Math.min(r.lod, VEH_DATA[r.name].length - 1)]; for (const p of r.parts || []) { p.im.visible = !L.pb; if (!L.pb) p.im.geometry = vehPartGeo(r.name, r.lod, p.j, r.paint); } for (const m of r.marks || []) m.visible = r.lod <= 1; }
let VLT = 0;
function vehDamage(r, on) { r.body.rotation.set(on ? 0.05 : 0, 0, on ? 0.075 : 0); r.body.position.y = on ? -0.12 : 0; if (r.mg) r.mg.rotation.set(0, on ? 0.7 : 0, on ? -0.32 : 0); }
function vehRevive(v, hp = 100) { v.alive = true; v.hp = hp; v.burnT = 0; v.hdV = null; v.ended = false; v.s = 0; v.speed = 0; for (const [m, mt] of v.mats) m.material = mt; { const vl = v.g.userData.vl; if (vl) { vehDamage(vl, false); vl.dead = false; } else if (v.body) { v.body.rotation.set(0, 0, 0); v.body.position.y = 0; } if (v.wreck) v.wreck.on = false; } for (const f of v.fires) v.g.remove(f); v.fires.length = 0; if (v.tur) v.tur.rotation.set(0, 0, 0); if (v.crew) for (const c of v.crew) c.visible = true; }
const _wt = { h: 0, pitch: 0, roll: 0 };
function vehPose(v, x, z, hd) {
  if (v.hdV === null) v.hdV = hd; v.hdV += wrapPi(hd - v.hdV) * 0.12; const h = v.hdV, L = v.half[0], W = v.half[2], fx = Math.sin(h), fz = Math.cos(h);
  const pf = groundAt(x + fx * L, z + fz * L), pb = groundAt(x - fx * L, z - fz * L), pl = groundAt(x + fz * W, z - fx * W), pr = groundAt(x - fz * W, z + fx * W), gy = (pf + pb + pl + pr) / 4;
  const fy = v.float ? v.float(x, z) : null, rk = fy !== null && v.rock ? v.rock.a : 0; v.x = x; v.z = z;
  // a hull on open water rides the waves: it lifts with them and pitches and rolls with their slope (a long raft less than a small boat)
  let wy = 0, wp = 0, wr = 0; if (fy !== null && v.sea) { const t = waveTilt(x, z, h, L, W, _wt); wy = t.h * 0.9; wp = t.pitch * 0.8; wr = t.roll * 0.8; }
  v.g.position.set(x, (fy ?? gy) + wy + rk * Math.sin(GAME.t * 4.6 + x) * 1.3, z);
  if (fy !== null) v.g.rotation.set(Math.sin(GAME.t * 1.3 + x) * 0.03 + rk * Math.sin(GAME.t * 5.4 + z) * 0.9 + (v.fwdX ? wr : -wp), h - (v.fwdX ? Math.PI / 2 : 0), Math.sin(GAME.t * 1.7 + z) * 0.03 + rk * Math.sin(GAME.t * 3.8 + x) + (v.fwdX ? wp : wr), 'YXZ');
  else if (v.fwdX) v.g.rotation.set(-Math.atan2(pr - pl, 2 * W) * 0.9, h - Math.PI / 2, Math.atan2(pf - pb, 2 * L) * 0.9, 'YXZ');
  else v.g.rotation.set(-Math.atan2(pf - pb, 2 * L) * 0.9, h, Math.atan2(pl - pr, 2 * W) * 0.9, 'YXZ');
  if (v.flip) { v.g.rotation.z = Math.min(2.6, v.flip * 1.6); v.g.position.y -= Math.min(0.6, v.flip * 0.2); }
}
function pathAt(P0, s) { let acc = 0; for (let i = 0; i < P0.length - 1; i++) { const a = P0[i], b = P0[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]); if (acc + L >= s) { const u = (s - acc) / L; return [lerp(a[0], b[0], u), lerp(a[1], b[1], u), Math.atan2(b[0] - a[0], b[1] - a[1])]; } acc += L; } const a = P0[P0.length - 2], b = P0[P0.length - 1]; return [b[0], b[1], Math.atan2(b[0] - a[0], b[1] - a[1])]; }
const pathLen = (P0) => { let L = 0; for (let i = 0; i < P0.length - 1; i++) L += Math.hypot(P0[i + 1][0] - P0[i][0], P0[i + 1][1] - P0[i][1]); return L; };
function vehHit(v, dmg, p) { if (!v.alive || (GOD() && v.side === 'f')) return; v.hp -= dmg; if (p) fxDust(p.clone(), false); if (v.hp <= 0) vehDestroy(v); }
function vehDestroy(v, quiet = false) {
  if (!v.alive || (GOD() && v.side === 'f')) return; v.alive = false; v.speed = 0; STATS.kills += v.side === 'e' ? 1 : 0;
  const p = v.g.position.clone(); p.y += 1.4; if (!quiet) { fxExplosion(p, 1.5); sndBoom(p, 1.3); FX.shake = Math.max(FX.shake, clamp(1.2 - camera.position.distanceTo(p) / 60, 0, 0.8)); }
  { const vl = v.g.userData.vl; if (vl) { vehDamage(vl, true); vl.dead = true; } else if (v.body) { v.body.rotation.set(0.04, 0, 0.06); v.body.position.y = -0.08; }   // knocked out: it keeps its paint, sits a little crooked, and burns
    if (!v.wreck) v.wreck = wreckFire(v.g, VEH_FIRE[vl ? vl.name : v.kind] || [[0, 1.4, 0]], v.kind === 'jeep' ? 1 : 1.6); v.wreck.on = true; } if (v.tur && v.kind === 't55') v.tur.rotation.z = 0.08;
  if (v.crew) for (const c of v.crew) c.visible = false;
  if (v.onDead) v.onDead(v);
}
const _vi = new THREE.Matrix4(), _vo = V3(), _vd = V3();
function rayVeh(o, d, maxT) {
  let best = null, bt = maxT;
  for (const v of VEH) { if (v.mode !== MODE || v.side !== 'e' || !v.g.visible) continue; if (Math.hypot(v.g.position.x - o.x, v.g.position.z - o.z) > maxT + 10) continue;
    _vi.copy(v.g.matrixWorld).invert(); _vo.copy(o).applyMatrix4(_vi); _vd.copy(d).transformDirection(_vi); const [hx, hy, hz] = v.half;
    const t = v.fwdX ? rayBox(_vo, _vd, -hx, hx, 0, hy, -hz, hz) : rayBox(_vo, _vd, -hz, hz, 0, hy, -hx, hx); if (t !== null && t < bt && t > 0.5) { bt = t; best = { t, kind: 'veh', v }; } }
  return best;
}
/* friendly guns: jeep machine guns and the wingman tanks shoot at whatever they can see */
function allyFire(v, dt) {
  v.fireCd -= dt; if (v.fireCd > 0 || !v.alive) return; v.fireCd = v.kind === 'tank' ? rand(2.5, 4.5) : rand(1.2, 2.2);
  const from = v.g.position.clone(); from.y += v.kind === 'tank' ? 2.6 : 1.9; let best = null, bd = v.kind === 'tank' ? 900 : 420;
  for (const e of UNITS.enemies) { if (!e.alive || !e.rig.root.visible || e.stance === 'hide' || e.state === 'film' /* men nobody has identified yet (the hill at Purkan) are not shot at */) continue; const c = e.chest(), d = from.distanceTo(c); if (d < bd && losW(from.x, from.y, from.z, c.x, c.y, c.z)) { bd = d; best = { u: e, p: c }; } }
  if (v.kind === 'tank') for (const w of VEH) { if (w.mode !== MODE || !w.alive || w.side !== 'e' || !w.g.visible) continue; const c = w.g.position.clone(); c.y += 1.4; const d = from.distanceTo(c); if (d < 1200 && d < bd * 1.5 && losW(from.x, from.y, from.z, c.x, c.y, c.z)) { bd = d; best = { v: w, p: c }; } }
  if (!best) return;
  if (best.v) { fxMuzzle(from, true); sndBoom(from, 0.6); fxTracer(from, best.p, false); if (Math.random() < 0.45 * (CH() && CH().allyK || 1)) vehDestroy(best.v); else fxExplosion(best.p.clone().add(V3(rand(-3, 3), -1, rand(-3, 3))), 0.7); v.fireCd = rand(6, 9); return; }
  fxMuzzle(from, false); sndShot('fal-npc', from); fxTracer(from, best.p, false); if (Math.random() < (v.kind === 'tank' ? 0.2 : 0.14) * clamp(1 - bd / 600, 0.3, 1) * ((CH() && CH().allyInf && CH().allyInf()) ?? 1)) killEnemy(best.u, false); else fxDust(best.p.clone().add(V3(rand(-1, 1), -0.8, rand(-1, 1))));
}
/* Egyptian tanks and anti-tank guns: they shoot at the player's tank (or at the player on foot) when they see it */
function enemyVehFire(v, dt) {
  v.fireCd -= dt; if (!v.alive || v.fireCd > 0 || !v.shoots) return; v.fireCd = rand(6, 9.5);
  // some tanks are told to shoot at a friendly vehicle instead (the rescue: Shaul's tank under the hill)
  const other = v.tgtV ? v.tgtV() : null;
  if (other && other.alive && other.g.visible) { const from = v.g.position.clone(); from.y += 2.1; const tp = other.g.position.clone(); tp.y += 1.4; const d = from.distanceTo(tp); if (d > 1600) return;
    if (!losW(from.x, from.y, from.z, tp.x, tp.y, tp.z)) { v.fireCd = rand(1.5, 3); return; }
    const a = Math.atan2(tp.x - from.x, tp.z - from.z); if (v.tur) v.tur.rotation.y = wrapPi(a - v.hdV);
    const mz = v.g.position.clone().add(V3(Math.sin(a) * 4.5, 2.2, Math.cos(a) * 4.5)); fxMuzzle(mz, true); fxExplosion(mz, 0.35); sndBoom(mz, 0.9); fxTracer(mz, tp, true);
    if (Math.random() < (other.hitP ?? 0.22)) { vehHit(other, other.shellDmg ?? 34, tp); fxExplosion(tp.clone(), 0.8); sndBoom(tp, 0.8); if (other.onHit) other.onHit(other, 'shell'); }
    else { const m = tp.clone().add(V3(rand(-14, 14), 0, rand(-14, 14))); m.y = groundAt(m.x, m.z); fxExplosion(m, 0.8); sndBoom(m, 0.7); }
    return; }
  const tank = P.mode === 'tank' && TANK.alive && TANK.g.visible, tp = tank ? tankTurretWorld() : playerEye(); const from = v.g.position.clone(); from.y += v.kind === 'atgun' ? 1.1 : 2.1; const d = from.distanceTo(tp); if (d > 1600) return;
  if (!losW(from.x, from.y, from.z, tp.x, tp.y, tp.z)) { v.fireCd = rand(1.5, 3); return; }
  if (v.tur) v.tur.rotation.y = wrapPi(Math.atan2(tp.x - from.x, tp.z - from.z) - v.hdV);
  const mz = v.g.position.clone().add(V3(Math.sin(Math.atan2(tp.x - from.x, tp.z - from.z)) * 4.5, v.kind === 'atgun' ? 1.0 : 2.2, Math.cos(Math.atan2(tp.x - from.x, tp.z - from.z)) * 4.5));
  fxMuzzle(mz, true); fxExplosion(mz, 0.35); sndBoom(mz, 0.9); fxTracer(mz, tp, true);
  const pHit = clamp(0.55 - d / 2600, 0.14, 0.5) * (tank ? (P.crouch ? 0.7 : 1) : 0.35) * (CH() && CH().hitK ? CH().hitK() : 1), mk = CH() && CH().missK ? CH().missK() : 1;
  if (Math.random() < pHit) { if (tank) { tankHit(tp.clone().add(V3(rand(-1, 1), -0.6, rand(-1, 1))), false, 22); radio('נהג', pick(['פגיעה מטנק! זה בא מ־' + clockOf(v.g.position) + '!', 'טנק מצרי יורה עלינו!']), 2.4); } else { explode(tp.clone().add(V3(rand(-2, 2), -1.4, rand(-2, 2))), 1.0, 6, 60, 'art'); } }
  else { const ux = (from.x - tp.x) / d, uz = (from.z - tp.z) / d, over = Math.random() < 0.6, along = over ? -rand(9, 20) : rand(-5, 5), side = (over ? rand(-6, 6) : (Math.random() < 0.5 ? -1 : 1) * rand(9, 15)) * Math.max(1, mk); const m = V3(tp.x + ux * along - uz * side, 0, tp.z + uz * along + ux * side); m.y = groundAt(m.x, m.z); fxExplosion(m, 0.8); sndBoom(m, 0.7); }
}
/* a jeep's machine gun: short bursts at the player whenever it sees him; a man flat in the trench is hard to hit */
function jeepMgFire(v, dt) {
  if (!v.alive) return; v.fireCd -= dt; if (v.fireCd > 0) return;
  const tp = playerEye(), from = v.g.position.clone().add(V3(0, 2.1, 0)), d = from.distanceTo(tp);
  if (!P.alive || d > 240 || !losW(from.x, from.y, from.z, tp.x, tp.y, tp.z)) { v.fireCd = rand(0.8, 1.6); v.burst = 0; return; }
  if (v.burst <= 0) { v.burst = Math.floor(rand(5, 10)); v.gap = rand(1.3, 2.4); }
  v.burst--; v.fireCd = v.burst > 0 ? 0.1 : v.gap;
  if (v.mgM) v.mgM.rotation.y = Math.atan2(tp.x - from.x, tp.z - from.z) - (v.hdV ?? 0) + (v.mgOff ?? Math.PI * 1.5);   // the modelled jeep's gun points along its nose (mgOff 0)
  const hit = Math.random() < 0.045 * diff.acc * (P.crouch ? 0.5 : 1) * (sheltered() ? 0.2 : 1) * clamp(1 - d / 300, 0.3, 1);
  fxMuzzle(from, true); sndShot('lmg', from); const end = tp.clone(); if (!hit) end.add(V3(rand(-1.6, 1.6), rand(-0.5, 1.2), rand(-1.6, 1.6))); fxTracer(from, end, true);
  if (hit) hurtPlayer(rand(5, 9), from); else if (d < 60 && Math.random() < 0.3) sndWhiz();
}
function clockOf(p) { const fwd = Math.atan2(-Math.sin(P.yaw), -Math.cos(P.yaw)), a = Math.atan2(p.x - P.pos.x, p.z - P.pos.z); let h = Math.round(-wrapPi(a - fwd) / (Math.PI / 6)); h = ((h % 12) + 12) % 12 || 12; return `שעה ${h}`; }
function updVeh(dt) {
  VLT -= dt; if (VLT <= 0) { VLT = 0.3; vehLodTick(); } wreckUpd(dt); vehAnim(dt); crewUpd(dt);
  for (const v of VEH) {
    if (v.tag && (v.mode !== MODE || !v.g.visible || !v.alive || CINE.on)) v.tag.visible = false;
    if (v.mode !== MODE || !v.g.visible) continue;
    // enemy vehicles carry a red marker too, so a tank in the haze reads as a target
    if (v.side === 'e' && v.alive && !CINE.on) { if (!v.tag) { v.tag = new THREE.Sprite(TAGM.e); v.tag.center.set(0.5, 0); v.tag.renderOrder = 5; onLayer1(v.tag); scene.add(v.tag); } v.tag.visible = true; v.tag.position.set(v.g.position.x, v.g.position.y + v.half[1] + 1.4, v.g.position.z); v.tag.scale.setScalar(v.kind === 't55' || v.kind === 'btr' ? 0.05 : 0.04); }
    if (v.rock) v.rock.a *= Math.exp(-dt * 0.9);
    if (v.alive) {
      if (v.follow) { const f = v.follow; const s = Math.max(0, f.s ? f.s() : TANK.s - f.gap); const [x, z, hd] = tankAt(Math.min(s, pathLen(TANK.path))); const [wx, wz] = TANK.toW(x, z); vehPose(v, wx + Math.cos(hd) * (f.lat || 0), wz - Math.sin(hd) * (f.lat || 0), hd); v.speed = TANK.speed; }
      else if (v.path) { const L = pathLen(v.path), want = v.stop !== undefined ? Math.min(v.vmax, Math.sqrt(Math.max(0, 2 * 1.5 * (v.stop - v.s)))) : v.vmax; v.speed += clamp(want - v.speed, -dt * 3, dt * 1.5); v.s = Math.min(L, v.s + v.speed * dt); if (v.s >= L - 0.01) { v.speed = 0; if (v.onEnd && !v.ended) { v.ended = true; v.onEnd(v); } } const [x, z, hd] = pathAt(v.path, v.s); vehPose(v, x, z, hd); }
      if (v.speed > 0.6 && !v.g.userData.vl && Math.random() < dt * 6) fxDust(V3(v.g.position.x + rand(-1.5, 1.5), v.g.position.y + 0.3, v.g.position.z + rand(-1.5, 1.5)));
      if (v.side === 'f' && v.guns) allyFire(v, dt); if (v.side === 'e') { if (v.mg) jeepMgFire(v, dt); else enemyVehFire(v, dt); }
      if (v.crewU) for (const c of v.crewU) { c.u.pos.copy(v.g.localToWorld(c.at.clone())); c.u.heading = (c.face ?? v.hdV); c.u.sync(); }
    } else {
      v.burnT += dt; const fade = v.burnT < (CH() && CH().burnLong ? 600 : 240) ? 1 : 0;
      if (v.wreck) v.wreck.on = fade > 0;   // the fire and smoke are the wreck's own (wreckUpd)
    }
  }
}
/* ---------- the modelled vehicles' paint: weathering and markings ----------
   The paint is not flat: a tiling texture of dust, dirt streaks running down, chips and scratches is laid over every face from the
   three sides (by the vehicle's own coordinates, so it rides with it and needs no UV), and the lower half is caked in the sand it
   drives through. Then the markings, painted in off-white and worn: ours carry Hebrew tactical signs (a number and a company
   letter, the chevron on a tank's turret) and the IDF registration on the bumpers; theirs carry Arabic-Indic numbers. */
function vehGrimeTex() {
  const n = 512, c = canvas(n), g = c.getContext('2d'), r = rng(733);
  g.fillStyle = '#f0eee8'; g.fillRect(0, 0, n, n);
  tileBlotches(g, n, r, 60, 20, 90, 'rgba(120,104,80,0.22)', 'rgba(255,250,236,0.3)', 0.55);   // dust and dirt in broad patches
  tileBlotches(g, n, r, 160, 4, 18, 'rgba(90,78,62,0.2)', 'rgba(255,252,240,0.25)', 0.6);
  for (let i = 0; i < 150; i++) {   // streaks running down from every edge and bolt: rain on dust, oil, rust
    const x = r() * n, y = r() * n, h = 20 + r() * 120, w = 1 + r() * 3, a = 0.05 + r() * 0.14, col = r() < 0.3 ? `rgba(110,70,40,${a})` : `rgba(80,72,60,${a})`;
    for (const oy of [-n, 0, n]) { const gr = g.createLinearGradient(0, y + oy, 0, y + oy + h); gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x, y + oy, w, h); }
  }
  for (let i = 0; i < 700; i++) {   // chips: the paint knocked off to the primer and the steel, a light rim round each
    const x = r() * n, y = r() * n, s = 0.6 + r() * r() * 4;
    g.fillStyle = 'rgba(255,255,250,0.35)'; g.beginPath(); g.ellipse(x, y, s * 1.5, s * 1.1, r() * 3, 0, 7); g.fill();
    g.fillStyle = r() < 0.5 ? 'rgba(60,54,46,0.55)' : 'rgba(96,64,40,0.45)'; g.beginPath(); g.ellipse(x, y, s, s * 0.7, r() * 3, 0, 7); g.fill();
  }
  g.lineCap = 'round'; for (let i = 0; i < 60; i++) { const x = r() * n, y = r() * n, a = r() * 6.28, L = 6 + r() * 30; g.strokeStyle = `rgba(250,248,240,${0.15 + r() * 0.2})`; g.lineWidth = 0.6 + r(); g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); g.stroke(); }   // scratches
  for (let i = 0; i < 9000; i++) { g.fillStyle = r() < 0.5 ? `rgba(70,62,52,${0.06 + r() * 0.16})` : `rgba(255,255,255,${0.06 + r() * 0.14})`; g.fillRect(r() * n, r() * n, 1, 1); }
  const t = tex(c, false); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
function vehMatMk(side) { const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.82, metalness: 0.12, side }); m.onBeforeCompile = VEH_SHADE; m.customProgramCacheKey = () => 'vehgrime'; return m; }
let VEH_SHADE = null;
{ const gt = vehGrimeTex(); VEH_SHADE = (sh) => {
    sh.uniforms.vGrime = { value: gt };
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vLP; varying vec3 vON;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvLP = transformed; vON = objectNormal;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform sampler2D vGrime; varying vec3 vLP; varying vec3 vON;').replace('#include <color_fragment>', `#include <color_fragment>
      { vec3 w = abs(normalize(vON)); w = w * w * w * w; w /= (w.x + w.y + w.z + 1e-5);
        vec3 g = texture2D(vGrime, vLP.zy * 0.7).rgb * w.x + texture2D(vGrime, vLP.xz * 0.7 + 0.37).rgb * w.y + texture2D(vGrime, vLP.xy * 0.7 + 0.71).rgb * w.z;
        diffuseColor.rgb *= mix(vec3(1.0), g * g * 1.12, 0.62);
        float dust = (1.0 - smoothstep(0.1, 1.15, vLP.y)) * 0.42 + max(vON.y, 0.0) * w.y * 0.14;
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.40, 0.33, 0.22) * (0.8 + 0.4 * g.r), dust); }`);
  }; }
MAT.gunHi = new THREE.MeshStandardMaterial({ vertexColors: true, metalness: 0.55, roughness: 0.42 });   // the commander's own .50, seen from a metre away
MAT.veh = vehMatMk(THREE.FrontSide); MAT.vehD = vehMatMk(THREE.DoubleSide);   // (the jeep's model has some panels wound inside out: it is drawn from both sides)
/* the markings: a worn stencil on a transparent canvas, projected onto the surface the ray from outside first meets */
const MARK_TEX = {}, MARK_MAT = {};
function markTex(text, kind, aspect) {
  const key = kind + ':' + text + ':' + aspect; if (MARK_TEX[key]) return MARK_TEX[key];
  const H = 128, W = Math.round(H * aspect), c = canvas(W, H), g = c.getContext('2d'), r = rng([...key].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) >>> 0, 7));
  g.fillStyle = '#fff'; g.strokeStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle';
  const font = (px) => `900 ${px}px "Arial Black", "Heebo", "Noto Sans Hebrew", "Noto Sans Arabic", Arial, sans-serif`;
  let x0 = W / 2;
  if (kind === 'chev') {   // the turret chevron, then the tactical sign beside it
    const s = H * 0.36, cx = W * 0.2; g.lineWidth = H * 0.13; g.lineJoin = 'miter'; g.beginPath(); g.moveTo(cx - s, H * 0.2); g.lineTo(cx, H * 0.8); g.lineTo(cx + s, H * 0.2); g.stroke(); x0 = W * 0.64;
  }
  const px = kind === 'reg' ? H * 0.62 : H * 0.8; g.font = font(px); g.direction = /[֐-׿]/.test(text) ? 'rtl' : 'ltr';
  const room = (kind === 'chev' ? W * 0.6 : W * 0.94); let m = g.measureText(text).width; if (m > room) { g.font = font(px * room / m); }
  g.fillText(text, x0, H * 0.54);
  // worn: specks and a scratch or two through the paint, the edges a little ragged
  g.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < W * 0.9; i++) { g.fillStyle = `rgba(0,0,0,${0.4 + r() * 0.6})`; g.beginPath(); g.arc(r() * W, r() * H, 0.6 + r() * r() * 4, 0, 7); g.fill(); }
  g.lineCap = 'round'; for (let i = 0; i < 3; i++) { g.lineWidth = 1 + r() * 3; g.beginPath(); const y = r() * H; g.moveTo(r() * W * 0.3, y); g.lineTo(W * (0.7 + r() * 0.3), y + (r() - 0.5) * H * 0.4); g.stroke(); }
  g.clearRect(0, 0, W, 2); g.clearRect(0, H - 2, W, 2); g.clearRect(0, 0, 2, H); g.clearRect(W - 2, 0, 2, H);   // a clear border: outside the decal the clamp shows nothing
  const t = tex(c); t.anisotropy = ANISO; return (MARK_TEX[key] = t);
}
function markMat(t) { return MARK_MAT[t.uuid] || (MARK_MAT[t.uuid] = new THREE.MeshStandardMaterial({ map: t, color: 0xe4ded0, roughness: 0.92, metalness: 0, alphaTest: 0.45, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 })); }
const _mrc = new THREE.Raycaster(), _mrm = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide })), _DECALS = {};
/* a decal's geometry: from a projector at the point where a ray (origin o, direction d, in the mesh's own frame) meets the mesh, the
   faces that look back at it within a w x h box, lifted a little off the surface, with UVs across the box */
function decalGeo(src, key, o, d, up, w, h, depth = 0.45, lift = 0.01) {
  if (key && _DECALS[key] !== undefined) return _DECALS[key];
  _mrm.geometry = src; const bs = src.boundingSphere; src.boundingSphere = null; src.computeBoundingSphere();
  const D = V3(d[0], d[1], d[2]).normalize(); _mrc.set(V3(o[0], o[1], o[2]), D); _mrc.far = 40; const hit = _mrc.intersectObject(_mrm, false)[0]; src.boundingSphere = bs;
  if (!hit) return (_DECALS[key] = null);
  const C = hit.point, R = new THREE.Vector3().crossVectors(D, V3(up[0], up[1], up[2])).normalize(), U = new THREE.Vector3().crossVectors(R, D);
  const P = src.attributes.position.array, N = src.attributes.normal.array, I = src.index ? src.index.array : null, nt = I ? I.length / 3 : P.length / 9, pos = [], nor = [], uv = [];
  const loc = (i) => { const x = P[i * 3] - C.x, y = P[i * 3 + 1] - C.y, z = P[i * 3 + 2] - C.z; return [x * R.x + y * R.y + z * R.z, x * U.x + y * U.y + z * U.z, x * D.x + y * D.y + z * D.z]; };
  for (let t = 0; t < nt; t++) {
    const ia = I ? I[t * 3] : t * 3, ib = I ? I[t * 3 + 1] : t * 3 + 1, ic = I ? I[t * 3 + 2] : t * 3 + 2, A = loc(ia), B = loc(ib), Cc = loc(ic);
    // a face that overlaps the box (a big flat panel may have no corner inside it)
    if (Math.min(A[0], B[0], Cc[0]) > w / 2 || Math.max(A[0], B[0], Cc[0]) < -w / 2 || Math.min(A[1], B[1], Cc[1]) > h / 2 || Math.max(A[1], B[1], Cc[1]) < -h / 2 || Math.min(A[2], B[2], Cc[2]) > depth / 2 || Math.max(A[2], B[2], Cc[2]) < -depth / 2) continue;
    const e1x = P[ib * 3] - P[ia * 3], e1y = P[ib * 3 + 1] - P[ia * 3 + 1], e1z = P[ib * 3 + 2] - P[ia * 3 + 2], e2x = P[ic * 3] - P[ia * 3], e2y = P[ic * 3 + 1] - P[ia * 3 + 1], e2z = P[ic * 3 + 2] - P[ia * 3 + 2];
    const fx = e1y * e2z - e1z * e2y, fy = e1z * e2x - e1x * e2z, fz = e1x * e2y - e1y * e2x, fl = Math.hypot(fx, fy, fz) || 1; if (Math.abs(fx * D.x + fy * D.y + fz * D.z) / fl < 0.25) continue;   // only the faces turned to the projector (or away, on a panel wound inside out)
    for (const [i, q] of [[ia, A], [ib, B], [ic, Cc]]) { const sg = N[i * 3] * D.x + N[i * 3 + 1] * D.y + N[i * 3 + 2] * D.z > 0 ? -1 : 1; pos.push(P[i * 3] - D.x * lift, P[i * 3 + 1] - D.y * lift, P[i * 3 + 2] - D.z * lift); nor.push(N[i * 3] * sg, N[i * 3 + 1] * sg, N[i * 3 + 2] * sg); uv.push(q[0] / w + 0.5, q[1] / h + 0.5); }
  }
  if (!pos.length) return (_DECALS[key] = null);
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.computeBoundingSphere();
  return (_DECALS[key] = g);
}
/* what is painted where: ray origin, direction and 'up' in the piece's own frame, the size, and what kind of text */
const VEH_MARKS = {
  jeep: [
    { p: 'body', o: [1.45, 3, 0], d: [0, -1, 0], up: [-1, 0, 0], w: 0.92, h: 0.44, k: 'tac' },   // the hood: the tactical sign
    { p: 'body', o: [1.3, 0.95, 2.5], d: [0, 0, -1], up: [0, 1, 0], w: 0.5, h: 0.22, k: 'tac' }, { p: 'body', o: [1.3, 0.95, -2.5], d: [0, 0, 1], up: [0, 1, 0], w: 0.5, h: 0.22, k: 'tac' },
    { p: 'body', o: [3.5, 0.6, 0], d: [-1, 0, 0], up: [0, 1, 0], w: 0.95, h: 0.13, k: 'reg' }, { p: 'body', o: [-3.5, 0.74, 0.42], d: [1, 0, 0], up: [0, 1, 0], w: 0.52, h: 0.1, k: 'reg' },
  ],
  magach: [
    { p: 'tur', o: [-0.4, 0.38, 3], d: [0, 0, -1], up: [0, 1, 0], w: 1.1, h: 0.42, k: 'chev' }, { p: 'tur', o: [-0.4, 0.38, -3], d: [0, 0, 1], up: [0, 1, 0], w: 1.1, h: 0.42, k: 'chev' },
    { p: 'body', o: [6, 1.15, 0.45], d: [-1, 0, 0], up: [0, 1, 0], w: 0.8, h: 0.15, k: 'reg' }, { p: 'body', o: [-6, 1.22, 0.4], d: [1, 0, 0], up: [0, 1, 0], w: 0.75, h: 0.15, k: 'reg' },
  ],
  t55: [
    { p: 'tur', o: [-0.12, 0.33, 3], d: [0, 0, -1], up: [0, 1, 0], w: 0.95, h: 0.4, k: 'num' }, { p: 'tur', o: [-0.12, 0.33, -3], d: [0, 0, 1], up: [0, 1, 0], w: 0.95, h: 0.4, k: 'num' },
    { p: 'tur', o: [-3, 0.3, 0], d: [1, 0, 0], up: [0, 1, 0], w: 0.6, h: 0.26, k: 'num' },
    { p: 'body', o: [6, 1.12, 0.62], d: [-1, 0, 0], up: [0, 1, 0], w: 0.55, h: 0.2, k: 'reg' }, { p: 'body', o: [-6, 1.22, 0.4], d: [1, 0, 0], up: [0, 1, 0], w: 0.6, h: 0.18, k: 'reg' },
  ],
};
TRAIL.magach = TRAIL.t55;   // the same hull: the same tracks, the same exhausts
/* a modelled vehicle as one geometry (body, turret, gun) for an instanced crowd far off */
function vehMerged(name, lv, paint) {
  const L = VEH_DATA[name][Math.min(lv, VEH_DATA[name].length - 1)], pv = L.pivot || [0, 0, 0], gp = L.gpiv || [0, 0, 0];
  const list = [[vehGeo(name, lv, 'body', paint), [0, 0, 0]]]; if (L.tur) list.push([vehGeo(name, lv, 'tur', paint), pv]); if (L.gun) list.push([vehGeo(name, lv, 'gun', paint), [pv[0] + gp[0], pv[1] + gp[1], pv[2] + gp[2]]]);
  let nv = 0, ni = 0; for (const [g] of list) { nv += g.attributes.position.count; ni += g.index.count; }
  const pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3), col = new Float32Array(nv * 3), idx = new Uint32Array(ni); let ov = 0, oi = 0;
  for (const [g, o] of list) { const p = g.attributes.position.array, n = g.attributes.normal.array, c = g.attributes.color.array, ix = g.index.array, k = p.length / 3;
    for (let i = 0; i < k; i++) { pos[(ov + i) * 3] = p[i * 3] + o[0]; pos[(ov + i) * 3 + 1] = p[i * 3 + 1] + o[1]; pos[(ov + i) * 3 + 2] = p[i * 3 + 2] + o[2]; }
    nor.set(n, ov * 3); col.set(c, ov * 3); for (let i = 0; i < ix.length; i++) idx[oi + i] = ix[i] + ov; ov += k; oi += ix.length; }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.setIndex(new THREE.BufferAttribute(idx, 1)); g.computeBoundingSphere(); return g;
}
const AR_DIG = '٠١٢٣٤٥٦٧٨٩', toAr = (s) => s.replace(/[0-9]/g, (ch) => AR_DIG[+ch]);
function markText(kind, side, seed) {
  const r = rng(seed), d = (k) => Array.from({ length: k }, () => Math.floor(r() * 10)).join('');
  if (side === 'f') { if (kind === 'reg') return 'צה״ל ' + (1 + Math.floor(r() * 8)) + d(5); return (1 + Math.floor(r() * 4)) + 'אבגד'[Math.floor(r() * 4)]; }
  if (kind === 'reg') return toAr(String(10000 + Math.floor(r() * 89999))); return toAr(String(100 + Math.floor(r() * 899)));
}
let _MSEED = 1;
function vehMarks(rec) {
  const specs = VEH_MARKS[rec.name]; if (!specs) return; const side = rec.paint === 'e' || rec.name === 't55' ? 'e' : 'f', seed = 977 * _MSEED++, txt = {};
  rec.marks = [];
  specs.forEach((s, i) => {
    const host = s.p === 'tur' ? rec.tur && rec.tur.userData.mesh : rec.body; if (!host) return;
    const g = decalGeo(vehGeo(rec.name, 0, s.p, rec.paint), rec.name + ':' + i, s.o, s.d, s.up, s.w, s.h); if (!g) return;
    const kind = s.k === 'tac' && side === 'e' ? 'num' : s.k, text = txt[kind] || (txt[kind] = markText(kind, side, seed + kind.length));
    const m = new THREE.Mesh(g, markMat(markTex(text, kind, s.w / s.h))); m.castShadow = false; m.receiveShadow = true; host.add(m); rec.marks.push(m);
  });
}
/* the IDF tank of the old set (TANK_GEO) and the drivable one: the chevron and tactical sign on both sides of the turret */
const TANK_MARKS = [{ o: [-0.35, 1.9, 4], d: [0, 0, -1], w: 1.15, h: 0.44 }, { o: [-0.35, 1.9, -4], d: [0, 0, 1], w: 1.15, h: 0.44 }];
function tankMarks(mesh, geo, specs = TANK_MARKS, key = 'tankgeo') {
  const text = markText('tac', 'f', 4111 * _MSEED++);
  specs.forEach((s, i) => { const g = decalGeo(geo, key + ':' + i, s.o, s.d, s.up || [0, 1, 0], s.w, s.h); if (g) { const m = new THREE.Mesh(g, markMat(markTex(text, 'chev', s.w / s.h))); m.receiveShadow = true; mesh.add(m); } });
}
/* ---------- crews: the man on the jeep's .50, the commander standing in his hatch ----------
   Each side has a small pool of men, handed out every so often to the nearest modelled vehicles that carry a crew (not the one the
   player drives or rides, not a wreck); each frame they are set in place on their vehicle and posed: the gunner behind his gun with
   his hands on the grips, turning round with it; the commander out of the hatch to the waist, forearms on the rim, looking about */
const CREW_SPEC = { jeep: { k: 'gun', feet: 0.72, back: 0.84 }, magach: { k: 'hatch', at: [-0.42, 0.98, 0.55] }, t55: { k: 'hatch', at: [-0.12, 0.98, -0.44] } };
const CREW = { f: [], e: [] }, CREW_N = LITE ? 4 : 10, _cv = V3(), _cd = V3();
let CREWT = 0;
const crewSide = (r) => (r.name === 't55' || r.paint === 'e' ? 'e' : 'f');
function crewPose(R, kind, t) {
  const T = R.T; T.rootX = 0; T.hipsY = 0.93; T.hipsX = 0; T.hipsZ = 0; T.hipsYaw = 0; T.torsoY = 0; T.torsoZ = 0;
  if (kind === 'gun') { R.legs(-0.08, 0.1, 0.14, 0.08); T.torsoX = 0.16 + Math.sin(t * 0.9) * 0.01; R.arms(-1.2, -0.7, -1.2, -0.7, 0.14, -0.14); }
  else { R.legs(0, 0.05, 0, 0.05); T.torsoX = 0.08 + Math.sin(t * 0.7) * 0.015; T.torsoY = 0.4 * Math.sin(t * 0.21) + 0.15 * Math.sin(t * 0.53); R.arms(-0.55, -1.5, -0.5, -1.45, 0.32, -0.32); }
  R.gunAt(0, -3, 0, 0, 0, 0); R.apply('crew');
}
function crewUpd(dt) {
  CREWT -= dt;
  if (CREWT <= 0) {
    CREWT = 0.4; const c = camera.position;
    for (const side of ['f', 'e']) {
      const want = []; for (const r of VLODS) { if (!r.crew || r.dead || r.crewOff || !CREW_SPEC[r.name] || crewSide(r) !== side || !_shown(r.g)) continue; r.g.getWorldPosition(_cv); const d = _cv.distanceTo(c); if (d < 170) want.push([r, d]); }
      want.sort((a, b) => a[1] - b[1]); const top = want.slice(0, CREW_N).map((a) => a[0]), pool = CREW[side];
      for (const m of pool) if (m.rec && !top.includes(m.rec)) { m.rec.man = null; m.rec = null; m.R.root.visible = false; }
      for (const r of top) { if (r.man) continue; let m = pool.find((q) => !q.rec); if (!m) { if (pool.length >= CREW_N) break; const R = new Rig(side, new THREE.BufferGeometry()); R.gun.visible = false; m = { R, rec: null, t: Math.random() * 9 }; pool.push(m); } m.rec = r; r.man = m; m.R.snapNext = true; }
    }
  }
  for (const side of ['f', 'e']) for (const m of CREW[side]) {
    const r = m.rec; if (!r) continue; if (r.dead || r.crewOff || !_shown(r.g)) { m.R.root.visible = false; continue; }
    const S = CREW_SPEC[r.name], R = m.R; m.t += dt; r.g.updateWorldMatrix(true, true);
    if (S.k === 'gun' && r.mg) { const pv = r.mg.position, b = r.mg.rotation.y; _cv.set(pv.x - S.back * Math.cos(b), S.feet, pv.z + S.back * Math.sin(b)); r.g.localToWorld(_cv); _cd.set(Math.cos(b), 0, -Math.sin(b)).transformDirection(r.g.matrixWorld); crewPose(R, 'gun', m.t); }
    else if (S.k === 'hatch' && r.tur) { _cv.set(S.at[0], S.at[1] - 0.93 * US + 0.06, S.at[2]); r.tur.localToWorld(_cv); _cd.set(1, 0, 0).transformDirection(r.tur.matrixWorld); crewPose(R, 'hatch', m.t); }
    else { R.root.visible = false; continue; }
    R.root.visible = true; R.root.position.copy(_cv); R.root.rotation.y = Math.atan2(_cd.x, _cd.z);
    const d = camera.position.distanceTo(_cv); R.setLOD(d < 30 ? 0 : d < 85 ? 1 : 2);
  }
}
/* ---------- the Sagger: a wire-guided missile. It flies only as long as its operator keeps looking at the target ---------- */
function fireAtgm(e, tgt = null) {
  const from = e.muzzle(); const m = new THREE.Group(); m.add(new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.8, 8).rotateX(Math.PI / 2), MAT.dark));
  const bright = !!(CH() && CH().atgmBright), fl = new THREE.Sprite(new THREE.SpriteMaterial({ map: FXT.fire, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, color: bright ? new THREE.Color(5, 4.2, 0.7) : new THREE.Color(4, 1.6, 0.6) })); fl.scale.setScalar(bright ? 3.4 : 0.9); fl.position.z = -0.5; m.add(fl);
  // a bright missile also carries a glow of fixed size on the screen, so the yellow exhaust reads at three hundred metres
  if (bright) { const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: FXT.glow || FXT.fire, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, depthTest: false, sizeAttenuation: false, fog: false, toneMapped: false, color: new THREE.Color(3.2, 2.6, 0.4) })); gl.scale.setScalar(0.045); gl.position.z = -0.5; gl.renderOrder = 6; m.add(gl); }
  m.position.copy(from); scene.add(m); const tp = tgt ? tgt() : tankTurretWorld(); const dir = tp.clone().sub(from).normalize(); dir.y += 0.12; dir.normalize();
  const q = { type: 'atgm', m, fl, op: e, dir, speed: (CH() && CH().atgmSpeed) || 48, life: 30, tgt: tgt || (() => tankTurretWorld()), t: 0, bright }; e.guide = q; PROJ.push(q); sndShot('ak', from); sndBoom(from, 0.25);
  if (bright) return q; szRpgCall(e, 'סאגר'); hint('sagger', `<b>סאגר!</b> הטיל מונחה בחוט: הוא פוגע רק אם המפעיל ממשיך לכוון. הרגו את המפעיל (סימון צהוב) לפני שהטיל מגיע, או היכנסו לצריח (${K('C')}).`, 8); return q;
}
function updAtgm(q, dt) {
  q.t += dt; q.life -= dt; const p = q.m.position;
  // smoke: an operator who cannot see his target (or a missile flying blind through a cloud) loses it; the missile wanders off and drops
  if (!q.lost && q.op && q.op.alive && q.op.guide === q && SMOKES.length) { const e = q.op.eye(), tp = q.tgt(); if (smokeBlocks(e.x, e.y, e.z, tp.x, tp.y, tp.z) || smokeBlocks(p.x, p.y, p.z, p.x + 0.01, p.y, p.z)) { q.lost = true; q.wob = rand(-1, 1); if (q.onLost) q.onLost(q); } }
  const guided = q.op && q.op.alive && q.op.guide === q && !q.lost;
  if (q.lost) { q.dir.x += Math.cos(q.t * 3) * dt * 0.9 * q.wob; q.dir.z += Math.sin(q.t * 2.3) * dt * 0.9; q.dir.y -= dt * 0.55; q.dir.normalize(); }
  if (guided) { const want = q.tgt().sub(p).normalize(); const a = q.dir.angleTo(want), k = Math.min(1, (1.5 * dt) / Math.max(a, 1e-4)); q.dir.lerp(want, k).normalize(); } else { q.dir.y -= dt * 0.25; q.dir.normalize(); }
  p.addScaledVector(q.dir, q.speed * dt); q.m.lookAt(p.clone().add(q.dir)); q.fl.scale.setScalar(0.8 + Math.random() * 0.5);
  if (Math.random() < dt * (q.bright ? 60 : 40)) { const s = FX.smoke.get(); s.life = q.bright ? 2.4 : 1.4; s.s.position.copy(p); s.s.material.color.set(q.bright ? 0xe0d6a8 : 0xb8b2a6); s.upd = (qq, u) => { qq.s.scale.setScalar(0.4 + u * (q.bright ? 2.4 : 1.6)); qq.s.material.opacity = (q.bright ? 0.65 : 0.5) * (1 - u); }; }
  const done = () => { if (q.op && q.op.guide === q) { q.op.guide = null; q.op.cyc = 0.6; } return true; };
  if (TANK.alive && TANK.g && TANK.g.visible && p.distanceTo(tankTurretWorld(_tw)) < 2.6) { tankHit(p.clone(), false, P.crouch ? 14 : 22); radio('נהג', 'סאגר פגע בנו! ממשיכים!', 2.2); return done(); }
  if (q.vt) for (const v of VEH) if (v.alive && v.side === 'f' && v.mode === MODE && p.distanceTo(v.g.position) < 3.2) { if (v.sturdy) { fxExplosion(p.clone(), 0.9); sndBoom(p, 0.9); vehHit(v, 30, p); if (v.onHit) v.onHit(v, 'atgm'); } else vehDestroy(v); return done(); }
  if (p.y < groundAt(p.x, p.z) + 0.15 || q.life <= 0 || segHitT(p.x - q.dir.x * 1.2, p.y - q.dir.y * 1.2, p.z - q.dir.z * 1.2, p.x, p.y, p.z) >= 0) { explode(p.clone(), 0.8, 4, 50, 'rpg'); return done(); }
  return false;
}

/* ---------- the straw rule: the fight happens in a lane no wider than 50 m around the route the player advances on ----------
   corr() moves a local point into that lane (between min and w metres from the route line), keeping its side */
function corr(path, x, z, w = 23, min = 0) {
  let bd = 1e9, bx = x, bz = z;
  for (let i = 0; i < path.length - 1; i++) { const [ax, az] = path[i], [cx, cz] = path[i + 1], dx = cx - ax, dz = cz - az, t = clamp(((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz || 1), 0, 1), px = ax + dx * t, pz = az + dz * t, d = Math.hypot(x - px, z - pz); if (d < bd) { bd = d; bx = px; bz = pz; } }
  if (bd >= min && bd <= w) return [x, z]; if (bd < 1e-3) return [bx + min, bz];
  const k = clamp(bd, min, w) / bd; return [bx + (x - bx) * k, bz + (z - bz) * k];
}
/* ---------- who still counts: an enemy holds up the advance only if the player can actually get at him -
   within range and seen in the last few seconds (a man in a foxhole counts while he keeps peeking). The rest are cleared away ---------- */
function fieldSees(e, maxD = 150) {
  if (!e.alive) return false; const c = camera.position, d = Math.hypot(e.pos.x - c.x, e.pos.z - c.z); if (d > maxD) return false;
  if ((e.seeCk ?? 0) < GAME.t) { e.seeCk = GAME.t + 0.4; const h = e.chest(); if (losW(c.x, c.y, c.z, h.x, h.y + 0.45, h.z)) e.seenAt = GAME.t; }
  return GAME.t - (e.seenAt ?? -99) < 5;
}
// a stop or a bound never waits forever: clear means nobody in sight; after 12 s one straggler is allowed; after 20 s it moves on regardless
const holdDone = (left, t) => left === 0 || (t > 12 && left <= 1) || t > 20;
function fieldLeft(pred, maxD = 150) { let n = 0; for (const e of UNITS.enemies) if (e.alive && e.sz && pred(e) && fieldSees(e, maxD)) n++; return n; }
function fieldDespawn(pred) { for (const e of UNITS.enemies) if (e.alive && pred(e) && !fieldSees(e, 120)) { e.alive = false; e.rig.root.visible = false; e.tag.visible = false; if (e.slot) { e.slot.used = false; e.slot = null; } } }
function fieldNearest(pred, maxD = 1e9) { let best = null, bd = maxD; for (const e of UNITS.enemies) if (e.alive && e.sz && pred(e)) { const d = Math.hypot(e.pos.x - P.pos.x, e.pos.z - P.pos.z); if (d < bd) { bd = d; best = e; } } return best; }
/* ---------- assault gates: on foot the advance goes point to point, about 50 m apart.
   Segment i lies between pts[i] and pts[i+1]; its enemies come up when the player reaches pts[i], and the next point
   is shown only once every one of them is down - like any shooter that respects itself ---------- */
const GATE = { on: false, pts: null, i: 0, clear: false, spawn: null, done: null, label: 'נקודה' };
// lane: the half-width of the lane the advance runs in (0: none), or [half-width, the lane's own line, metres it reaches back behind the first point]
function gateStart(pts, spawn, done, label = 'נקודה', r = 6.5, lane = 0) {
  const hw = Array.isArray(lane) ? lane[0] : lane; Object.assign(GATE, { on: true, pts, i: 0, clear: false, spawn, done, label, t: 0, r, lane: hw, back: Array.isArray(lane) ? lane[2] : undefined, s0m: -1e9 });
  if (hw) { laneSet(Array.isArray(lane) ? lane[1] : pts.map((q) => [q[0], q[1]]), hw); GATE.ls = pts.map((q) => laneProj(q[0], q[1]).s); } else laneOff();   // an advance without a lane of its own leaves no old one behind
  spawn(0);
}
/* ---------- the straw: in the field chapters the player moves inside one lane at a time, never wider than 30 m, along the route of the moment.
   Its sides are the walls of the trench or the edge of the ground the fight is on; its far end is the end of the bound being fought through -
   past that the fire from the next bound would cut a man down, so he cannot go on until the bound is clear and the lane opens to the next one ---------- */
const LANE = { pts: null, S: null, hw: 14, s0: 0, s1: 1e9, warnT: 0, prev: null };
const LANE_MAX = 25;   // the straw: never wider than 50 m
const laneCopy = () => ({ pts: LANE.pts, S: LANE.S, hw: LANE.hw, s0: LANE.s0, s1: LANE.s1 });
/* a new lane never shuts the player out: while he is still outside it, the lane he was in stays open beside it (the two together), and the
   old one is dropped only once he has walked into the new */
function laneSet(pts, hw = 14, s0 = 0, s1 = 1e9) {
  const S = [0]; for (let i = 1; i < pts.length; i++) S.push(S[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const old = LANE.pts ? laneCopy() : null; Object.assign(LANE, { pts, S, hw: Math.min(hw, LANE_MAX), s0, s1 });
  LANE.prev = old && laneBadOf(LANE, P.pos.x, P.pos.z) > 0 ? old : null;
}
function laneOff() { LANE.pts = null; LANE.prev = null; }
function laneProjOf(L, x, z) {
  const P0 = L.pts; let best = null;
  for (let i = 0; i < P0.length - 1; i++) { const [ax, az] = P0[i], [bx, bz] = P0[i + 1], ex = bx - ax, ez = bz - az, L2 = ex * ex + ez * ez || 1, t = clamp(((x - ax) * ex + (z - az) * ez) / L2, 0, 1), px = ax + ex * t, pz = az + ez * t, d = Math.hypot(x - px, z - pz);
    if (!best || d < best.d - 1e-6) best = { d, s: L.S[i] + t * Math.sqrt(L2), t, i }; }
  return best;
}
const laneProj = (x, z) => laneProjOf(LANE, x, z);
// how far outside a lane a point is: beside it, behind its start or past its end
function laneBadOf(L, x, z) { const q = laneProjOf(L, x, z); return Math.max(0, q.d - L.hw) + Math.max(0, L.s0 - q.s) + Math.max(0, q.s - L.s1); }
function laneBad(x, z) { if (!LANE.pts) return 0; const b = laneBadOf(LANE, x, z); return LANE.prev ? Math.min(b, laneBadOf(LANE.prev, x, z)) : b; }
// each frame: the old lane is let go once the player stands in the new one
function laneUpd() { if (LANE.pts && LANE.prev && laneBadOf(LANE, P.pos.x, P.pos.z) <= 0) LANE.prev = null; }
// a step is allowed when it stays in the lane, or brings a man who is outside it (a cut, a start point) nearer to it
function laneOk(x, z) {
  if (!LANE.pts || CINE.on || P.ride) return true; laneUpd(); const b = laneBad(x, z); if (b <= 0) return true; const b0 = laneBad(P.pos.x, P.pos.z); if (b0 > 0 && b <= b0 + 1e-5) return true;
  if (GAME.t - LANE.warnT > 5) { LANE.warnT = GAME.t; const q = laneProj(x, z);
    if (q.s > LANE.s1) { hint('lane-ahead', 'קודם מנקים את הקטע הזה. מעבר לו האש מהקטע הבא תתפור אתכם — הוא ייפתח כשהקטע נקי.', 5); const pe = playerEye(), fw = camForward(V3()); for (let k = 0; k < 3; k++) { const a = V3(pe.x + fw.x * 40 + rand(-6, 6), pe.y + rand(-1, 2), pe.z + fw.z * 40 + rand(-6, 6)), b2 = V3(pe.x + rand(-1.5, 1.5), pe.y + rand(-0.6, 0.8), pe.z + rand(-1.5, 1.5)); fxTracer(a, b2, true); } sndWhiz(); }
    else hint('lane-side', 'הציר כאן — לא יוצאים ממנו. בשטח שמסביב יורים עליכם מכל כיוון.', 5); }
  return false;
}
// the lane on the small map: a pale band along the stretch that is open now (and, fainter, the one the player is leaving)
function laneMiniOf(g, X, k, L, col) {
  const P0 = L.pts, S = L.S, a = Math.max(0, L.s0), b = Math.min(S[S.length - 1], L.s1), at = (s) => { let i = 0; while (i < S.length - 2 && S[i + 1] < s) i++; const t = clamp((s - S[i]) / ((S[i + 1] - S[i]) || 1), 0, 1); return [lerp(P0[i][0], P0[i + 1][0], t), lerp(P0[i][1], P0[i + 1][1], t)]; };
  const pts = [at(a)]; for (let i = 1; i < S.length - 1; i++) if (S[i] > a && S[i] < b) pts.push(P0[i]); pts.push(at(b));
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = col; g.lineWidth = Math.max(6, L.hw * 2 * k); g.beginPath(); pts.forEach(([x, z], i) => { const [u, v] = X(x, z); if (i) g.lineTo(u, v); else g.moveTo(u, v); }); g.stroke(); g.restore();
}
function laneMini(g, X, k) { if (!LANE.pts) return; if (LANE.prev) laneMiniOf(g, X, k, LANE.prev, 'rgba(255,214,120,.14)'); laneMiniOf(g, X, k, LANE, 'rgba(255,214,120,.30)'); }
function gateStop() { GATE.on = false; if (GATE.lane) laneOff(); }
const gateLeft = () => (GATE.on ? fieldLeft((e) => e.sq === 'g' + GATE.i, 130) + DIRQ.filter((q) => q.gate === GATE.i).length : 0);
function gateUpd(dt = 1 / 30) {
  if (!GATE.on || CINE.on) return; const i = GATE.i, n = GATE.pts.length - 1; GATE.t = (GATE.t || 0) + dt;
  // the lane opens forward; its back edge never closes in front of the player, and never gives ground once set (walking backwards does not drag it along)
  if (GATE.lane && LANE.pts && GATE.ls) { const ps = laneProj(P.pos.x, P.pos.z).s, tgt = i > 0 ? GATE.ls[i - 1] : GATE.back !== undefined ? GATE.ls[0] - GATE.back : 0; LANE.s0 = Math.max(GATE.s0m ?? -1e9, Math.min(tgt, ps - 1)); GATE.s0m = LANE.s0; LANE.s1 = GATE.ls[Math.min(i + 1, n)] + 1.5; }
  const left = gateLeft(); if (left > 0 && !(GATE.t > 45 && left <= 2) && GATE.t < 75) { GATE.clear = false; return; }
  if (!GATE.clear) { GATE.clear = true; fieldDespawn((e) => e.sq === 'g' + i); if (i >= n - 1) { GATE.on = false; GATE.done(); return; } radio('מ״פ', pick(['נקי! קדימה לנקודה הבאה!', 'הקטע נקי. מתקדמים, אחריי!', 'קדימה! לנקודה הבאה!']), 2.2); feed(`הקטע נקי · ${GATE.label} ${i + 2}/${n + 1}`, 'good'); }
  const [x, z, y] = GATE.pts[i + 1]; if (Math.hypot(P.pos.x - x, P.pos.z - z) < GATE.r && (y === undefined || Math.abs(P.pos.y - y) < 2.2)) { GATE.i++; GATE.clear = false; GATE.t = 0; if (GATE.i >= n) { GATE.on = false; GATE.done(); return; } feed(`${GATE.label} ${GATE.i + 1}/${n + 1}`); GATE.spawn(GATE.i); snapRequest('gate'); }
}
// what the objective marker shows during a gated advance: the nearest enemy in the segment, or the next point when it is clear
function gateObj(enemyLabel = 'אויב בקטע', pointLabel = 'הנקודה הבאה') {
  if (!GATE.on) return null; const i = GATE.i;
  if (gateLeft() > 0) { let best = null, bd = 1e9; for (const e of UNITS.enemies) if (e.alive && e.sq === 'g' + i) { const d = Math.hypot(e.pos.x - P.pos.x, e.pos.z - P.pos.z); if (d < bd) { bd = d; best = e; } } return best ? [best.pos.x, best.pos.y + 2.2, best.pos.z, enemyLabel, 'foe'] : null; }
  const [x, z, y] = GATE.pts[i + 1]; return [x, y ?? groundAt(x, z), z, pointLabel];
}
function gateItem(items) { if (!GATE.on) return; const n = GATE.pts.length - 1, left = gateLeft(); items.push([left ? '' : 'next', left ? `${GATE.label} ${GATE.i + 1}/${n} · אויבים בקטע: ${left}` : `הקטע נקי · התקדמו ל${GATE.label} ${GATE.i + 2} (◆)`]); }
/* a progress meter at the top of the screen (the roller bridge) */
function meter(label, frac) { const el = $('#meter'); if (label === null) { el.classList.remove('on'); return; } el.classList.add('on'); $('#meterT').textContent = label; const pc = Math.round(clamp(frac, 0, 1) * 100); $('#meterF').style.width = pc + '%'; $('#meterP').textContent = pc + '%'; }
/* ---------- field positions and squads in world coordinates ---------- */
function foxhole(x, z, fx, fz, list, ring = true) {
  const y = groundAt(x, z); if (ring) { const arc = []; const a0 = Math.atan2(fx, fz); for (let a = -100; a <= 100; a += 25) { const t = a0 + THREE.MathUtils.degToRad(a); arc.push([x + Math.sin(t) * 1.25, z + Math.cos(t) * 1.25]); } bagWall(arc, 3, y - 0.05, true); }
  const s = { x, z, y: y - 0.05, nx: fx, nz: fz, f: 0, b: null, used: false, fox: true, p: [x + fx * 0.15, z + fz * 0.15], h: [x - fx * 0.25, z - fz * 0.25] }; list.push(s); return s;
}
/* the mix of weapons in a squad: most carry the rifle, some a sub-machine gun, one in six a light machine gun, one in ten a marksman's rifle */
function varyKind(kind, x, z) { if (kind !== 'rifle') return kind; const h = Math.abs(Math.sin(x * 12.9898 + z * 78.233) * 43758.5453) % 1; return h < 0.55 ? 'rifle' : h < 0.75 ? 'smg' : h < 0.9 ? 'lmg' : 'sniper'; }
/* on the hard level a man running in may bring a mate with him: same route, same squad, a pace behind */
function fSpawnStreet(x, z, path, kind = 'rifle') {
  const e = fSpawnStreet0(x, z, path, kind); if (!e || !(diff.extra > 1) || Math.random() > diff.extra - 1) return e;
  DIRQ.push({ at: GAME.t + rand(0.5, 1.2), spawn: true, fn: () => { if (!e.alive || e.hunter || e.wild || e.climbV || e.climb || e.state !== 'sz' || e.sz !== 'street') return; const c = fSpawnStreet0(e.pos.x + rand(-1.6, 1.6), e.pos.z + rand(-1.6, 1.6), e.path.slice(e.pi), e.kind); if (c) { c.sq = e.sq; c.tac = 'storm'; } } });
  return e;
}
function fSpawnStreet0(x, z, path, kind = 'rifle') { const e = spawnEnemy(x, z, varyKind(kind, x, z), null, null); if (!e) return null; e.sz = 'street'; e.state = 'sz'; e.path = path.map((p) => [p[0], p[1]]); e.pi = 0; e.cov = null; e.patience = 0; e.climb = false; e.cyc = 1; e.peek = false; e.meleeCd = 0.5; e.rpgCd = rand(7, 13); return e; }
function fSlotSpawn(kind, filter, tag) { const e = szSpawnSlot(kind === 'atgm' ? 'rpg' : kind, filter); if (e) { e.atgm = kind === 'atgm'; e.sq = tag; e.guide = null; if (e.atgm) e.rpgCd = rand(9, 16); } return e; }
/* ---------- defenders placed ahead of the advance ----------
   A position is manned before the player can see it, not when he reaches it: the man sits in his hole, hidden, and comes alive when the
   fight reaches him - his sector opens (wakeG), the player comes within his waking distance (wakeR), or a bullet lands near him.
   So the player sees a line of positions ahead, picks them off from a distance if he can, and nothing appears out of thin air around him. */
function fSlotPlace(s, kind, tag, o = {}) {
  if (!s || s.used) return null; const e = spawnEnemy(s.h[0], s.h[1], kind, null, null); if (!e) return null;
  s.used = true; e.sz = 'win'; e.slot = s; e.state = 'sz'; e.pos.set(s.h[0], s.y, s.h[1]); e.cyc = rand(0.5, 2.5); e.peek = false; e.aimT = 0; e.rpgAim = 0; e.rpgCd = rand(7, 13); e.heading = Math.atan2(s.nx, s.nz); e.sq = tag; e.guide = null;
  e.dormant = o.dormant ?? true; e.wakeG = o.wakeG; e.wakeR = o.wakeR ?? 24; e.stance = 'hide'; e.rig.pose('hide', e.anim); e.sync(); return e;
}
const DORM_HEAR_R = 30, dormSeeR = () => awareR() + 8;
function dormantStep(e, dt) {
  if (!e.dormant) return false;
  const dP = Math.hypot(P.pos.x - e.pos.x, P.pos.z - e.pos.z), gateOpen = e.wakeG !== undefined && GATE.on && GATE.i >= e.wakeG;
  // he sees all round: inside the radius he wakes when the player is in his sight from where he would look out, whichever way that is; and gunfire near him wakes him
  let sees = false; e.awT = (e.awT || 0) - dt;
  if (!gateOpen && dP < Math.max(e.wakeR, dormSeeR()) && e.awT <= 0 && P.alive) { e.awT = 0.35; const q = e.slot ? e.slot.p : [e.pos.x, e.pos.z], y = (e.slot ? e.slot.y : e.pos.y) + 1.35, pe = playerEye(); sees = losW(q[0], y, q[1], pe.x, pe.y - 0.2, pe.z) && !smokeBlocks(q[0], y, q[1], pe.x, pe.y, pe.z); }
  const heard = P.shotT !== undefined && GAME.t - P.shotT < 0.4 && dP < DORM_HEAR_R;
  if (gateOpen || dP < e.wakeR || sees || heard || !P.alive) { e.dormant = false; e.cyc = rand(0.3, 1.4); e.peek = false; return false; }
  if (e.slot) { e.pos.x = e.slot.h[0]; e.pos.z = e.slot.h[1]; e.pos.y = e.slot.y; e.heading = Math.atan2(e.slot.nx, e.slot.nz); }
  e.stance = 'hide'; e.rig.pose('hide', e.anim); return true;
}
function wakeNear(p, r) { for (const o of UNITS.enemies) if (o.alive && o.dormant && Math.hypot(o.pos.x - p.x, o.pos.z - p.z) < r) { o.dormant = false; o.cyc = rand(0.2, 0.9); } }
/* the nearest gate segment to a point: segment i runs from pts[i] to pts[i+1] - used to hand each pre-placed man to the bound that passes him */
function gateSegOf(pts, x, z) { let best = 0, bd = 1e9; for (let i = 0; i < pts.length - 1; i++) { const [ax, az] = pts[i], [bx, bz] = pts[i + 1], dx = bx - ax, dz = bz - az, t = clamp(((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz || 1), 0, 1), d = Math.hypot(x - ax - dx * t, z - az - dz * t); if (d < bd) { bd = d; best = i; } } return best; }
function fieldFriends(defs) {
  FRIENDS.forEach((f, i) => { const u = f.unit, d = defs[i]; f.marker.visible = false; f.target = null; f.bleed = 0; f.burst = 0;
    if (!d) { f.state = 'bunker'; u.rig.root.visible = false; u.tag.visible = false; return; }
    f.name = d.name; f.fi = d.fi ?? i; f.ti = 0; f.stuck = 0; f.goalY = undefined; u.alive = true; u.fall = -1; u.stance = 'stand'; u.rig.root.visible = true; u.rig.gun.visible = true;
    const x = d.x ?? 0, z = d.z ?? 0; u.place(x, z, d.y); u.heading = Math.atan2(d.fx ?? 0, d.fz ?? 1);
    f.post = { id: 'F' + i, name: 'כוח', x, z, fx: d.fx ?? 0, fz: d.fz ?? 1, mag: null, occupant: f, stand: [x, z] }; f.state = d.state || 'post'; if (d.ride) f.ride = d.ride; u.sync(); });
}
/* the player's footsteps (the trail the squad can always fall back on) and his direction of advance, which the squad's line forms across */
function updTrail(dt) { const tr = SZ.trail, l = tr[tr.length - 1]; if (!P.alive) return; if (!l || Math.hypot(P.pos.x - l[0], P.pos.z - l[1]) > 0.8 || Math.abs(P.pos.y - l[2]) > 0.9) { tr.push([P.pos.x, P.pos.z, P.pos.y]); SZ.trailN++; SZ.stillT = 0; if (tr.length > 260) { tr.shift(); SZ.trailBase++; }
    const k = tr.length - 1, b = tr[Math.max(0, k - 4)], dx = tr[k][0] - b[0], dz = tr[k][1] - b[1]; if (Math.hypot(dx, dz) > 1.6) { const d = Math.atan2(dx, dz); SZ.fdir = SZ.fdir === undefined ? d : SZ.fdir + wrapPi(d - SZ.fdir) * 0.5; } } else SZ.stillT = (SZ.stillT || 0) + dt; }
function resetTrail() { SZ.trail = []; SZ.trailN = 0; SZ.trailBase = 0; SZ.stillT = 0; SZ.fdir = P.yaw + Math.PI; }
/* common start of a field chapter */
function fieldStart(m) {
  survStop(); snapReset(); facesNow(); envReady();
  const C = CHAP[m]; if (!C.built) { C.built = true; const g0 = GROUND; C.build(); GROUND = g0; }
  for (const e of UNITS.enemies) if (e.mmHide || e.pitHid) { fmDisguise(e, false); e.mmHide = false; e.pitHid = false; }
  MODE = m; P.ride = null; GATE.on = false; meter(null); MAT.clothE.color.setHex(C.cloth ?? 0xffffff); uniformFor(m); TANK.goal = null; $('#app').classList.remove('armor'); if (CINE.on) endCine(true); showWorld(m); setRim(MAT.clothE, 0); SZ.covers = C.covers; SZ.slots = C.slots;
  $('#clockSub').textContent = C.clock; GAME.t = 0; GAME.gCd = 0; resetTutorial(); $('#feed').innerHTML = ''; FEED.length = 0;
  Object.assign(STATS, { kills: 0, heads: 0, treated: 0, saved: 0, kia: 0, shots: 0 }); D.capture = 0;
  for (const j of STRAFE) scene.remove(j.m); STRAFE.length = 0; for (const j of JETS) scene.remove(j.m); JETS.length = 0; for (const f of FLARES) { scene.remove(f.s); f.light.intensity = 0; } FLARES.length = 0;
  if (TANK.spot) TANK.spot.intensity = 0; FLARE_LIGHT = 0;
  cvidPrefetch(m); C.setup(0); GAME.state = 'play'; $('#app').classList.add('play'); for (const k of ['#mBrief', '#mPause', '#mEnd', '#mOps', '#mSet']) $(k).hidden = true;
  initAudio(); lockPointer(); toast(C.toast[0], C.toast[1]);
}
function fieldSetupCommon(C, stage) {
  clearBattle(); GATE.on = false; laneOff(); for (const s of C.slots) s.used = false; for (const c of C.covers) c.by = null; if (CINE.on) endCine(true);
  Object.assign(P, { smokeMax: 0, smoke: 0, vy: 0, crouch: false, hp: 100, lastHit: -9, mag: 20, reserve: 160, gren: diff.gren0, reloadT: 0, fireCd: 0, ads: 0, recoil: 0, post: null, carrying: null, hold: 0, kick: 0, throwT: 0, ammoCd: 0 }); P.alive = true; P.ride = null;
  INPUT.tAds = false; $('#tads').classList.remove('on'); $('#tsight').classList.remove('on'); C.cpN = stage;
}
function fieldRestore() { const C = CH(), st = CP.stats; C.setup(C.cpN || 0); if (st) Object.assign(STATS, st); GAME.state = 'play'; $('#app').classList.add('play'); for (const m of ['#mBrief', '#mPause', '#mEnd', '#mOps', '#mSet']) $(m).hidden = true; initAudio(); lockPointer(); }
function fieldStage(C, i) { C.stage = i; C.t = 0; C.cpN = i; C.msgs = {}; CP.stats = { ...STATS }; snapRequest('stage'); P.reserve = Math.max(P.reserve, 160); P.gren = Math.max(P.gren, diff.gren0); const S = C.stages[i]; toast(`שלב ${i + 1} מתוך ${C.stages.length} · ${S.title}`, S.sub); feed(`שלב ${i + 1}: ${S.title}`); }
function tankStart(path, toW, s, stops = []) {
  if (!TANK.g) tankModel(); Object.assign(TANK, { goal: null, free: false, thr: 0, turn: 0, bounds: null, hp: 100, s, speed: 0, alive: true, burning: false, stopI: 0, holdAt: null, mg: 0, gunT: 0, recoil: 0, fireT: 0, path, stops, toW, hdV: null, vmax: 4.6, driveOn: true });
  for (const f of TANK.fireS) f.visible = false; LIGHTS.fire.intensity = 0; TANK.turret.rotation.y = 0; TANK.gun.rotation.x = 0; TANK.g.visible = true;
  const [x, z, hd] = tankAt(s), [wx, wz] = toW(x, z); TANK.g.position.set(wx, groundAt(wx, wz), wz); TANK.g.rotation.set(0, hd, 0, 'YXZ'); TANK.g.updateMatrixWorld(true);
  P.mode = 'tank'; P.yaw = hd + Math.PI; P.pitch = -0.02; vm.visible = false; P.crouch = false;
}
/* the minimap of a field map: ground, water, roads, the objective and the vehicles */
function miniField(g, X, poly, dot, k, d) {
  g.fillStyle = d.bg; g.fillRect(0, 0, MINI.c.width, MINI.c.width);
  for (const [pts, col] of d.polys || []) { poly(pts); g.fillStyle = col; g.fill(); }
  g.lineCap = 'round'; g.lineJoin = 'round'; for (const [pts, w, col] of d.lines || []) { g.strokeStyle = col; g.lineWidth = Math.max(1.5, w * k); poly(pts, false); g.stroke(); }
  laneMini(g, X, k);
  for (const v of VEH) { if (v.mode !== MODE || !v.g.visible) continue; const [a, b] = X(v.g.position.x, v.g.position.z); g.fillStyle = !v.alive ? 'rgba(40,36,30,.8)' : v.side === 'e' ? '#ff5a4a' : '#6fa8ff'; g.fillRect(a - 4, b - 4, 8, 8); }
  if (TANK.g && TANK.g.visible) { const [a, b] = X(TANK.g.position.x, TANK.g.position.z); g.fillStyle = TANK.alive ? '#6fa8ff' : '#ff6b5c'; g.fillRect(a - 6, b - 6, 12, 12); }
}

/* ---------- cinematics: short in-game films with letterbox bars, captions and slow motion ---------- */
const CINE = { on: false, t: 0, slow: 1, def: null, ev: [], caps: [], total: 0, capT: 0, fov0: 72, vid: null };
/* the films on video: every film here was also rendered beforehand, frame by frame at full size, from these same shots. When its video is at
   hand it plays over the 3D view, which is not drawn meanwhile (a weak computer shows the film as smooth as a strong one). The film itself
   still runs underneath: its events, its sound and its captions keep time with the picture, and the battle goes on from where the film left it */
const CVID = { el: $('#cineVid'), on: false, wait: 0, off: false, blobs: {}, q: [],
  ch: { mezach: ['mz_mirage', 'mz_drone', 'mz_boats'], rescue: ['rs_intro', 'rs_end'], cross: ['cr_intro', 'cr_hold', 'cr_bridge', 'cr_end'], army: ['ar_end'], armor: ['am_intro', 'am_end'], hermon: ['hm_intro', 'hm_end'], suez: ['sz_lead', 'sz_convoy'], farm: ['fm_intro', 'fm_pits', 'fm_aq', 'fm_t42', 'fm_smoke', 'fm_yard', 'fm_hit', 'fm_end'] } };
CVID.el.addEventListener('playing', () => { if (CINE.on && CINE.vid && !CVID.on) { CVID.on = true; CVID.el.classList.add('on'); } });
CVID.el.addEventListener('error', () => { if (CINE.vid) cvidStop(); });
// the films that have a video so far (filled in when the videos are published; a film not listed is drawn live, as before)
const CVID_HAVE = new Set([]);
const cvidOk = () => !CVID.off && typeof VEXT !== 'undefined' && VEXT === 'mp4' && USE_VID;
// a chapter's films are fetched when it starts, one after the other, into memory: a film then starts at once, with no wait on the network
function cvidPrefetch(m) {
  const keep = CVID.ch[m] || []; for (const k of Object.keys(CVID.blobs)) if (!keep.includes(k)) { URL.revokeObjectURL(CVID.blobs[k]); delete CVID.blobs[k]; }
  if (!cvidOk()) return; CVID.q = keep.filter((k) => CVID_HAVE.has(k) && !CVID.blobs[k]); const nx = () => { const k = CVID.q.shift(); if (!k) return; fetch(`cine/${k}.mp4`).then((r) => (r.ok ? r.blob() : null)).then((b) => { if (b && b.size > 1000 && (CVID.ch[MODE] || []).includes(k)) CVID.blobs[k] = URL.createObjectURL(b); }).catch(() => {}).finally(nx); }; nx();
}
function cvidStart(k) {
  if (!k || !CVID_HAVE.has(k) || !cvidOk()) return; const v = CVID.el; CINE.vid = k; CVID.on = false; CVID.wait = 1.2;
  v.src = CVID.blobs[k] || `cine/${k}.mp4`; try { v.currentTime = 0; } catch (e) {} const p = v.play(); if (p && p.catch) p.catch(() => { if (CINE.vid === k) cvidStop(); });
}
function cvidStop() { const v = CVID.el; CINE.vid = null; CVID.on = false; v.classList.remove('on'); try { v.pause(); v.removeAttribute('src'); v.load(); } catch (e) {} }
function playCine(def) {
  if (CINE.on) endCine(true);
  Object.assign(CINE, { on: true, t: 0, def, slow: 1, ev: (def.ev || []).slice().sort((a, b) => a[0] - b[0]), caps: (def.caps || []).map((c) => ({ t: c[0], html: c[1], d: c[2] || 3.6 })), total: def.shots.reduce((a, s) => a + s.d, 0), capT: 0, fov0: camera.fov, vid: null });
  $('#app').classList.add('cine'); $('#cine').hidden = false; $('#cineCap').innerHTML = ''; $('#cineTitle').textContent = def.title || ''; $('#cineTitle').classList.toggle('on', !!def.title);
  CINE.vm0 = vm.visible; P.ads = 0; INPUT.fire = false; vm.visible = false; $('#tsight').classList.remove('on'); cvidStart(def.vid); updCine(0);
}
function updCine(dt) {
  if (CINE.vid) { const v = CVID.el;
    if (!CVID.on) { CVID.wait -= dt; if (CVID.wait > 0) dt = 0; else cvidStop(); }   // the film waits on its first frame while the video starts - a moment at most, then it runs without it
    else if (!v.ended) { if (v.paused) { const p = v.play(); if (p && p.catch) p.catch(() => {}); } dt = Math.max(0, v.currentTime + 1 / 24 - CINE.t); } }   // the picture leads: the film's clock follows the video's (frame i shows the film at (i+1)/24)
  CINE.t += dt; while (CINE.ev.length && CINE.ev[0][0] <= CINE.t) CINE.ev.shift()[1]();
  if (CINE.def.tick) CINE.def.tick(dt * CINE.slow);   // a film's own per-frame work (in game time), before its camera is placed
  for (const c of CINE.caps) if (!c.shown && CINE.t >= c.t) { c.shown = true; $('#cineCap').innerHTML = c.html; CINE.capT = CINE.t + c.d; }
  if (CINE.capT && CINE.t > CINE.capT) { $('#cineCap').innerHTML = ''; CINE.capT = 0; }
  if (CINE.t > 3.5) $('#cineTitle').classList.remove('on');
  let t = CINE.t, shot = CINE.def.shots[CINE.def.shots.length - 1], u = 1; for (const s of CINE.def.shots) { if (t < s.d) { shot = s; u = t / s.d; break; } t -= s.d; }
  const r = shot.cam(clamp(u, 0, 1)); CINE.slow = shot.slow ?? 1; camera.position.copy(r.p); camera.lookAt(r.l);
  const sh = FX.shake; FX.shake = Math.max(0, FX.shake - dt * 1.5); if (sh > 0.02) { camera.rotation.x += rand(-sh, sh) * 0.012; camera.rotation.y += rand(-sh, sh) * 0.012; }
  // a film is framed for a wide screen: on a narrow one (a phone held upright) the lens is widened so the sides are not cut away
  let fov = r.fov || shot.fov || 55; if (camera.aspect < 0.9) fov = Math.min(78, THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(fov) / 2) * 0.9 / camera.aspect)));
  if (Math.abs(camera.fov - fov) > 0.05) { camera.fov = fov; camera.updateProjectionMatrix(); }
  if (CINE.t >= CINE.total) endCine(false);
}
function endCine(skip) {
  if (!CINE.on) return; const def = CINE.def; if (skip) while (CINE.ev.length) CINE.ev.shift()[1]();
  CINE.on = false; CINE.slow = 1; FILMW.length = 0; if (CINE.vid) cvidStop(); $('#app').classList.remove('cine'); $('#cine').hidden = true; $('#cineCap').innerHTML = ''; camera.fov = CINE.fov0 || 72; camera.updateProjectionMatrix();
  vm.visible = CINE.vm0 || P.mode === 'rifle'; if (def && def.end) def.end(skip);   // the rifle as it was before the film (a film that starts on a gun hid it too)
}
$('#cineSkip').addEventListener('click', () => endCine(true));
/* film extras: men walking a straight line through a shot - a file climbing a road, prisoners with their hands up. Cleared by the film's end */
const FILMW = [];
const HANDS_UP = (R) => { R.sR.rotation.set(-2.85, 0, 0.32); R.eR.rotation.set(-0.35, 0, 0); R.sL.rotation.set(-2.85, 0, -0.32); R.eL.rotation.set(-0.35, 0, 0); R.gun.visible = false; };
function filmWalk(dt) { for (const w of FILMW) { const u = w.u; u.pos.x += w.dx * w.sp * dt; u.pos.z += w.dz * w.sp * dt; u.pos.y = groundAt(u.pos.x, u.pos.z); u.heading = Math.atan2(w.dx, w.dz); u.anim = (u.anim || 0) + dt * 4.6 * w.sp; u.rig.pose('walk', u.anim); if (w.arms) w.arms(u.rig); u.sync(); } }
/* camera helpers for shots: a fixed or moving point looking at a fixed or moving target */
const camLerp = (a, b, l0, l1, fov) => (u) => { const e = u * u * (3 - 2 * u); const A = typeof a === 'function' ? a() : a, B = typeof b === 'function' ? b() : b, L0 = typeof l0 === 'function' ? l0() : l0, L1 = typeof l1 === 'function' ? l1() : l1; return { p: A.clone().lerp(B, e), l: L0.clone().lerp(L1, e), fov }; };
const camOrbit = (c, r, a0, a1, h, fov) => (u) => { const C = typeof c === 'function' ? c() : c, a = lerp(a0, a1, u); return { p: V3(C.x + Math.sin(a) * r, C.y + h, C.z + Math.cos(a) * r), l: C, fov }; };

/* ---------- film, chapter 1, the big wave: the canal full of boats rowing at the rampart, the first of them grounding on the beach ---------- */
function mzBoatsFilm() {
  if (D.boatsFilm || CINE.on) return; const W = BOATS.filter((b) => !b.dead && b.state === 'wait'); if (W.length < 4) return; D.boatsFilm = true;
  // the fleet is brought out to mid-canal (the leading boats a little nearer): the film opens on the crossing at its height. One boat, the
  // nearest the middle of the wave, is close in: it grounds while the film runs, and its men are the first up the beach
  const T_LAND = 14.6, zc = 20; W.sort((a, b) => Math.abs(a.zLand - zc) - Math.abs(b.zLand - zc)); const lead = W[0], mid = W.find((b, i) => i > 0 && Math.abs(b.zLand - zc) > 6) || W[1];
  W.forEach((b, i) => { const u = b === lead ? 1 - (T_LAND * b.speed) / b.len : b === mid ? 0.55 : 0.34 + 0.28 * ((i * 0.618034) % 1); b.t = (u * b.len) / b.speed; });
  for (const b of W) filmRow(b, true);   // the oars shipped for the film, as in the drone's (up close the rowing does not look right)
  const zl = lead.zLand, bx = () => lead.g.position.clone(), cx = crestX(zc), cy = groundAt(cx, zc), fwd = (b) => V3(Math.sin(b.heading), 0, Math.cos(b.heading)), rgt = (b) => V3(Math.cos(b.heading), 0, -Math.sin(b.heading));
  const mp = () => mid.g.position.clone(), beachX = tongueWestX(zl), pe = playerEye();
  // the stronghold's guns on the water: spouts round the boats, tracers from the rampart; and the boats' own rifles at the sand wall
  const alive = () => W.filter((b) => !b.dead && b.state === 'cross');
  const spout = (k) => () => { const b = pick(alive()); if (!b) return; const p = b.g.position.clone().add(V3(rand(-9, 9), 0.1, rand(-9, 9))); fmSplash(p, k); };
  const mg = () => { const b = pick(alive()); if (!b) return; const z = zc + rand(-30, 30), x = crestX(z) - 0.5, from = V3(x, groundAt(x, z) + 1.1, z), to = b.g.position.clone().add(V3(rand(-3, 3), 0.6, rand(-3, 3))); for (let k = 0; k < 3; k++) DIRQ.push({ at: GAME.t + k * 0.09, fn: () => { fxTracer(from, to.clone().add(V3(rand(-1.5, 1.5), 0, rand(-1.5, 1.5))), false); fxMuzzle(from, false); if (!k) sndShot('lmg', from); } }); fxDust(to, true); };
  const volley = () => { const b = pick(alive()); if (!b) return; const from = b.g.position.clone().add(V3(0, 1.2, 0)), z = b.zLand + rand(-12, 12), x = crestX(z) - 1; fxMuzzle(from); fxTracer(from, V3(x, groundAt(x, z) + rand(0.3, 2.2), z), true); sndShot('ak', from); };
  const ev = []; for (let t = 0.4; t < 22.5; t += 0.55) ev.push([t, t % 1.1 < 0.55 ? mg : volley]); for (const t of [1.6, 3.4, 6.2, 8.8, 11.1, 12.7, 17.5, 20.4]) ev.push([t, spout(0.55)]); for (const t of [2.5, 7.4, 10.6, 21.2]) ev.push([t, spout(1.1)]);
  playCine({
    vid: 'mz_boats', title: 'מעוז המזח · 6 באוקטובר 1973 · לפנות ערב',
    shots: [
      { d: 5.6, cam: camLerp(V3(beachX + 3, 2.6, zc + 26), V3(beachX + 1, 2.2, zc + 20), V3(nearX(-236), 1.2, zc - 8), V3(nearX(-222), 1.0, zc - 2), 24) },
      { d: 4.6, cam: (u) => { const b = mp(), f = fwd(mid), r = rgt(mid), sd = r.x * SUN.dir.x + r.z * SUN.dir.z > 0 ? 1 : -1; return { p: b.clone().addScaledVector(f, -2.5 + u * 3).addScaledVector(r, sd * 9).add(V3(0, 3.4, 0)), l: b.clone().addScaledVector(f, 0.5 + u * 1.5).add(V3(0, 0.6, 0)), fov: 46 }; } },
      { d: 4.0, cam: (u) => { const b = mp(), f = fwd(mid), r = rgt(mid); return { p: b.clone().addScaledVector(f, -6.5 + u * 1.2).addScaledVector(r, 1.4).add(V3(0, 2.5, 0)), l: V3(crestX(mid.zLand) - 4, groundAt(crestX(mid.zLand), mid.zLand) + 2.5, mid.zLand), fov: 48 }; } },
      { d: 5.4, slow: 0.55, cam: (u) => ({ p: V3(beachX + 10 - u * 1.5, groundAt(beachX + 10, zl + 11) + 2.3, zl + 11), l: V3(lerp(beachX - 3, beachX + 9, u * u), lerp(0.9, groundAt(beachX + 9, zl) + 1.4, u), zl), fov: 44 }) },
      { d: 3.4, cam: (u) => { const x = crestX(zl) - 1 - u * 1.5; return { p: V3(x, groundAt(x, zl + 9) + 2.4, zl + 9), l: V3(beachX + 3 - u * 2, 1.0, zl - 3), fov: 50 }; } },
    ],
    ev,
    caps: [[0.3, '<b>לפנות ערב.</b> הם זורקים את הכול: סירות לכל אורך הסוללה המערבית, מקצה לקצה.', 4.8], [5.8, 'בכל סירה חיילים צפופים. החותרים לא עוצרים, גם כשהמים מסביבם רותחים מאש.', 4.2],
      [10.4, '<b>תצפית:</b> הראשונים כבר ליד החוף! עוד רגע הם על הסוללה!', 3.6], [14.8, '<b>מ״פ:</b> הם נוחתים! כולם לסוללה המערבית!', 3.6], [19.8, '<b>מ״פ:</b> לא נותנים להם לעלות. אש על הסירות, עכשיו!', 3.0]],
    end: () => { for (const b of W) filmRow(b, false); },
  });
}
/* ---------- film, chapter 1, the boats up close: the moment the player takes a gun on the western rampart, a drone's pass along the line of
   boats rowing at it - ten metres in front of them, a metre and a half over their gunwales - near enough to see the faces of the men firing
   over the bows, and the stronghold's rounds slapping the water among them. Then it climbs, and the whole line is seen at once ---------- */
const BCREW = [];   // the men in the bows of the boats nearest the camera: real soldiers (faces, helmets, rifles); the other boats keep their seated figures
const BCREW_AT = [[2.05, -0.22, 'crouch'], [1.98, 0.27, 'aim'], [0.98, -0.34, 'crouch'], [0.93, 0.33, 'crouch'], [-0.15, -0.31, 'crouch'], [-0.25, 0.3, 'crouch']];   // in the boat (its own units, bow +x): x, z, and how he holds himself
function bcrewUnit(i) {
  while (BCREW.length <= i) { const u = new Unit('e', BCREW.length % 5 === 3 ? 'lmg' : 'rifle'); scene.remove(u.tag); u.noTag = true; u.alive = true; u.rig.root.visible = false; BCREW.push(u); }
  return BCREW[i];
}
function filmRow(b, on) {
  b.filmHide = on;
  for (const s of b.seats) if (s.rower) { s.m.visible = !on && s.alive; s.oar.visible = !on; }
  if (on && !b.filmExtra) { b.filmExtra = []; const have = b.seats.filter((s) => !s.rower).length; for (let i = have; i < 8; i++) { const m = new THREE.Mesh(SEATED, MAT.clothE); m.position.set(SEATS[i][0], 0.02, SEATS[i][1]); m.rotation.y = Math.PI / 2; m.scale.setScalar(US / BOAT_S); b.g.add(m); b.filmExtra.push(m); } }
  if (!on && b.filmExtra) { for (const m of b.filmExtra) b.g.remove(m); b.filmExtra = null; }
}
function mzDroneFilm() {
  if (D.droneFilm || CINE.on) return;
  const W = BOATS.filter((b) => !b.dead && (b.state === 'wait' || b.state === 'cross')); if (W.length < 6) return; D.droneFilm = true;
  // the wave is brought out into ragged lines abreast: the first a hundred-odd metres off the beach, the next two thirty and sixty metres behind
  // it, still near the quays (they land ten seconds apart, as the wave would have); the film opens on the crossing at its height
  // each line is spread out along the bank, eight metres from boat to boat: a boat's track is turned to pass through its place in the line
  // (it still lands where it was going)
  const X0 = tongueWestX(-5) - 105, rows = Math.max(1, Math.ceil(W.length / 8)), per = Math.ceil(W.length / rows), QX = nearX(-400), GAP = 8;
  for (let row = 0; row * per < W.length; row++) {
    const L = W.slice(row * per, (row + 1) * per).sort((a, b) => a.to[1] - b.to[1]), zc = L.reduce((a, b) => a + b.to[1], 0) / L.length + (row % 2) * GAP * 0.5;
    L.forEach((b, i) => {
      const x = Math.max(X0 - row * 30 + rand(-1.5, 1.5), QX + 6), z = zc + (i - (L.length - 1) / 2) * GAP + rand(-1, 1), k = (QX - b.to[0]) / (x - b.to[0]);
      b.from = [b.to[0] + (x - b.to[0]) * k, b.to[1] + (z - b.to[1]) * k]; b.len = Math.hypot(b.to[0] - b.from[0], b.to[1] - b.from[1]); b.heading = Math.atan2(b.to[0] - b.from[0], b.to[1] - b.from[1]);
      b.t = Math.hypot(x - b.from[0], z - b.from[1]) / b.speed; if (b.state === 'wait') { b.state = 'cross'; b.g.visible = true; }
    });
  }
  // for the film the oars are shipped and the rowers put away (close up, the rowing looks wrong); every boat is filled with men instead - the
  // real soldiers in the boats by the camera, seated figures in the rest - and all of it is put back when the film ends
  for (const b of W) filmRow(b, true);
  updBoats(0);
  const front = W.slice(0, per), vx = front.reduce((a, b) => a + b.speed * Math.sin(b.heading), 0) / front.length, zs = front.map((b) => b.g.position.z).sort((a, b) => a - b);
  let zA = zs[Math.min(1, zs.length - 1)] - 3, zB = zs[Math.max(0, zs.length - 2)] + 3; if (zB - zA > 46) { const m = (zA + zB) / 2; zA = m - 23; zB = m + 23; }   // a slow pass: some 45 m in 14 s
  const zM = (zA + zB) / 2, F = { t: 0, it: 0.3, used: new Map(), free: [], n: 0 }, XL = () => X0 + vx * F.t;
  const live = () => W.filter((b) => !b.dead && b.state === 'cross');
  // a boat comes near the camera: four men in its bow; it goes off, they go back to the pool and its own figures come back
  const crewOn = (b) => { const us = []; for (let k = 0; k < BCREW_AT.length; k++) { const u = bcrewUnit(F.free.length ? F.free.pop() : F.n++); u.rig.root.visible = true; u.alive = true; u.dieT = -1; u.cf = rand(0.2, 2.2); u.cb = 0; u.snapHd = true; u.rig.snapNext = true; us.push(u); } for (const s of b.seats) if (!s.rower && s.sp[0] > -1) s.m.visible = false; for (const m of b.filmExtra || []) if (m.position.x > -1) m.visible = false; F.used.set(b, us); };
  const crewOff = (b) => { const us = F.used.get(b); if (!us) return; for (const u of us) { u.rig.root.visible = false; F.free.push(BCREW.indexOf(u)); } for (const s of b.seats) if (!s.rower && s.alive && !s.gone) s.m.visible = true; for (const m of b.filmExtra || []) m.visible = true; F.used.delete(b); };
  const _lp = V3();
  const tick = (dt) => {
    F.t += dt; const cam = camera.position;
    // the seven boats nearest the camera have their men (the front line passes right by it; the lines behind are far enough for the figures)
    const near = new Set(W.filter((b) => !b.dead && b.state === 'cross' && Math.abs(b.g.position.z - cam.z) < 16 && Math.abs(b.g.position.x - cam.x) < 30).sort((a, b) => a.g.position.distanceTo(cam) - b.g.position.distanceTo(cam)).slice(0, 7));
    for (const b of W) { if (near.has(b) && !F.used.has(b)) crewOn(b); else if (!near.has(b) && F.used.has(b)) crewOff(b); }
    for (const [b, us] of F.used) us.forEach((u, k) => {
      const [x, z, pose] = BCREW_AT[k]; u.pos.copy(b.g.localToWorld(_lp.set(x, 0.05, z))); u.heading = b.heading; u.stance = pose === 'aim' ? 'stand' : 'crouch'; u.anim = (u.anim || 0) + dt;
      if (u.dieT >= 0) { u.dieT += dt; u.rig.fallPose(Math.min(u.dieT, 1.4), 1, 'crumple'); u.sync(); return; }
      u.rig.pose(pose, u.anim, 0.06); u.sync();
      // his rifle at the rampart: short bursts, the green tracers going past the camera
      u.cf -= dt; if (u.cf <= 0) { if (u.cb <= 0) u.cb = Math.floor(rand(2, 5)); u.cb--; u.cf = u.cb > 0 ? rand(0.1, 0.17) : rand(1.1, 2.8);
        const m = u.muzzle(), zt = u.pos.z + rand(-10, 10), xt = crestX(zt) - 1; fxMuzzle(m); fxTracer(m, V3(xt, groundAt(xt, zt) + rand(0.4, 2.4), zt), true); if (m.distanceTo(cam) < 20 && u.cb % 2 === 0) sndShot(u.kind === 'lmg' ? 'lmg' : 'ak', m); }
    });
    // the stronghold answers: bursts from the rampart into the water round the boats, now and then into a boat
    F.it -= dt; if (F.it <= 0) { F.it = rand(0.12, 0.32); const near = live().filter((b) => Math.abs(b.g.position.z - cam.z) < 26); const b = near.length ? pick(near) : pick(live()); if (b) {
      const zf = b.g.position.z + rand(-30, 30), xf = crestX(zf) - 0.5, from = V3(xf, groundAt(xf, zf) + 1.1, zf), to = b.g.position.clone().add(V3(rand(-5, 3), 0.1, rand(-5, 5)));
      for (let k = 0; k < 3; k++) DIRQ.push({ at: GAME.t + k * 0.08, fn: () => { const q = to.clone().add(V3(rand(-1.2, 1.2), 0, rand(-1.2, 1.2))); fxTracer(from, q, false); fxDust(q, true); if (!k) { fxMuzzle(from, false); sndShot('lmg', from); } } });
      const us = F.used.get(b); if (us && Math.random() < 0.18) { const v = us.filter((u) => u.dieT < 0); if (v.length > 1) { const u = pick(v); u.dieT = 0; fxDust(u.chest()); } }
    } }
  };
  const zAt = (u) => lerp(zA, zB, u * u * (3 - 2 * u));
  playCine({
    vid: 'mz_drone',
    shots: [
      // the pass: six and a half metres in front of the bows, a metre and a half over the gunwales, slowly, the game a little slowed with it
      { d: 14.0, slow: 0.8, cam: (u) => { const z = zAt(u), x = XL(); return { p: V3(x + 6.5, 2.0 + 0.1 * Math.sin(F.t * 1.7), z), l: V3(x - 1, 1.05, z + 2.2), fov: 30 }; } },
      { d: 3.6, cam: (u) => { const e = u * u * (3 - 2 * u), x = XL(); return { p: V3(x + 6.5 + 25 * e, 2.0 + 14 * e, zB + 6 * e), l: V3(x - 2 * (1 - e), lerp(1.05, 0.6, e), lerp(zB + 2.2, zM, e)), fov: lerp(30, 52, e) }; } },
    ],
    tick,
    caps: [[0.3, '<b>תצפית:</b> הם כבר באמצע התעלה! עשרות סירות, שורה אחרי שורה!', 3.8], [6.0, 'בכל סירה חיילים צפופים. הם יורים עלינו תוך כדי חתירה.', 4.0], [13.4, '<b>מ״פ:</b> אש על הסירות! לא נותנים להם להגיע לחוף!', 4.0]],
    end: () => { for (const b of [...F.used.keys()]) crewOff(b); for (const b of W) filmRow(b, false); },
  });
}

/* ---------- ground detail for the field maps: rocks, scrub, crops, reeds, poles and wires, fences, huts ---------- */
const DET_MAT = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, flatShading: true });
/* ================= the look of the open country =================
   Everything that dresses the ground is made here, by hand: rocks grown from noise under a painted stone skin, scrub and grass as
   crossed cut-out cards painted leaf by leaf into one atlas, and the flat-topped acacia of the desert. One instanced mesh per kind. */
// a rock: a sphere pushed in and out by noise, its hollows darkened in the vertex colours, the bottom flattened so it sits in the sand.
// kind 'round' is a weathered boulder, 'slab' a bedded sandstone block with its strata, 'sharp' a split angular chunk
function rockGeo(seed, detail = 2, sx = 1, sy = 0.78, sz = 1, kind = 'round') {
  let g = new THREE.IcosahedronGeometry(1, detail); if (kind === 'sharp') g = g.toNonIndexed();
  const p = g.attributes.position, r = rng(seed), col = new Float32Array(p.count * 3), ph = [r() * 6, r() * 6, r() * 6], fq = [1.3 + r(), 2.1 + r(), 3.4 + r() * 1.5], big = 0.8 + r() * 0.6;
  const n = (x, y, z) => 0.5 * Math.sin(x * fq[0] + ph[0]) * Math.cos(z * fq[0] + ph[1]) + 0.3 * Math.sin((y + x) * fq[1] + ph[2]) + 0.2 * Math.sin((z - y) * fq[2] + ph[0] * 2) * Math.cos(x * fq[2]) + 0.45 * noise(x * big + seed * 0.37, (z + y * 0.6) * big - seed * 0.11);
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i), d = n(x, y, z);
    let k = 1 + d * (kind === 'sharp' ? 0.3 : 0.22) + 0.05 * Math.sin(x * 9 + ph[1]) * Math.sin(z * 11 + ph[2]);
    if (kind === 'slab') k += 0.06 * Math.sin(y * 10 + ph[0]) + 0.03 * Math.sin(y * 23 + ph[2]);   // the bedding
    let ny = (y * k + 0.08 * d) * sy; if (ny < -0.25 * sy) ny = -0.25 * sy + (ny + 0.25 * sy) * 0.25;   // flat underside
    p.setXYZ(i, x * k * sx, ny, z * k * sz);
    const crev = clamp(0.74 + d * 0.42 + (y > 0.2 ? 0.1 : y < -0.3 ? -0.16 : 0), 0.5, 1.1); col[i * 3] = crev; col[i * 3 + 1] = crev * (0.99 + 0.02 * d); col[i * 3 + 2] = crev * (0.96 + 0.04 * d);
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.computeVertexNormals(); return g;
}
// the stone skin: grain, blotches of darker varnish, hairline cracks, a little lichen
function rockTex() {
  const n = 512, c = canvas(n), g = c.getContext('2d'), img = g.createImageData(n, n), r = rng(23);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const i = (y * n + x) * 4, bl = noise(x / 46 + 7.7, y / 46) * 0.5 + noise(x / 13, y / 13 + 3.3) * 0.25 + noise(x / 4.2, y / 4.2) * 0.12, v = clamp(214 + bl * 70 + (r() - 0.5) * 34 + (r() < 0.025 ? -50 : 0) + (r() < 0.015 ? 22 : 0), 0, 255);
    img.data[i] = v; img.data[i + 1] = v * 0.975; img.data[i + 2] = v * 0.935; img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0); g.lineCap = 'round';
  for (let k = 0; k < 16; k++) { let x = r() * n, y = r() * n; g.strokeStyle = `rgba(60,52,44,${0.22 + r() * 0.3})`; g.lineWidth = 0.6 + r() * 1.3; g.beginPath(); g.moveTo(x, y); for (let j = 0; j < 10; j++) { x += (r() - 0.5) * 50; y += (r() - 0.5) * 50; g.lineTo(x, y); } g.stroke(); }
  for (let k = 0; k < 90; k++) { g.fillStyle = r() < 0.5 ? `rgba(110,98,84,${0.1 + r() * 0.16})` : `rgba(236,232,222,${0.12 + r() * 0.18})`; g.beginPath(); g.ellipse(r() * n, r() * n, 8 + r() * 36, 5 + r() * 20, r() * 3, 0, 6.283); g.fill(); }
  for (let k = 0; k < 70; k++) { g.fillStyle = r() < 0.6 ? `rgba(160,170,90,${0.12 + r() * 0.2})` : `rgba(190,120,60,${0.1 + r() * 0.16})`; g.beginPath(); g.ellipse(r() * n, r() * n, 2 + r() * 7, 2 + r() * 5, r() * 3, 0, 6.283); g.fill(); }   // lichen
  const t = tex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2, 2); return t;
}
TX.rock = rockTex();
const ROCK_MAT = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.96, map: TX.rock, bumpMap: bumpOf(TX.rock), bumpScale: LITE ? 0.6 : 1.1 });
const ROCK_G = rockGeo(31, 1, 1.1, 0.7, 0.9, 'round'), BOULDER_G = rockGeo(32, LITE ? 2 : 3, 1, 0.82, 1.15, 'round');
const ROCK_GEOS = new Set([ROCK_G, BOULDER_G]);
/* ---------- the foliage atlas: six painted cells, 512 px each. Leaves and blades are painted in pale neutral tones and tinted per instance;
   the acacia's crown and bark are painted in their own colours ---------- */
const NAT = { cols: 3, rows: 3, cell: LITE ? 256 : 512 };
NAT.cellUV = (cx, cy) => ({ u0: cx / NAT.cols, u1: (cx + 1) / NAT.cols, v0: 1 - (cy + 1) / NAT.rows, v1: 1 - cy / NAT.rows });
function natureAtlas() {
  const S = NAT.cell, c = canvas(S * NAT.cols, S * NAT.rows), g = c.getContext('2d'), r = rng(8011);
  g.clearRect(0, 0, c.width, c.height);
  const cell = (cx, cy, fn) => { g.save(); g.translate(cx * S, cy * S); g.beginPath(); g.rect(0, 0, S, S); g.clip(); fn(); g.restore(); };
  const leaf = (x, y, rad, col, a, rot = 0, ry = 1) => { g.fillStyle = `rgba(${col},${a})`; g.beginPath(); g.ellipse(x, y, rad, rad * ry, rot, 0, 6.283); g.fill(); };
  // a branching shrub: twigs fanning out from the root, leaves along them. dry: sparse, twiggy; green: round and dense
  const shrub = (dry, bare = false) => {
    const bx = S / 2, by = S * 0.98, twigs = [];
    const branch = (x, y, a, len, w, depth) => { const ex = x + Math.cos(a) * len, ey = y - Math.sin(a) * len; g.strokeStyle = `rgba(${dry ? '96,84,66' : '88,80,62'},${0.85})`; g.lineWidth = w; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * len * 0.5 + (r() - 0.5) * len * 0.3, y - Math.sin(a) * len * 0.5, ex, ey); g.stroke(); twigs.push([x, y, ex, ey, depth]); if (depth < 3) { const k = 2 + Math.floor(r() * 2); for (let i = 0; i < k; i++) branch(lerp(x, ex, 0.45 + r() * 0.5), lerp(y, ey, 0.45 + r() * 0.5), a + (r() - 0.5) * 1.5, len * (0.5 + r() * 0.3), Math.max(0.8, w * 0.6), depth + 1); } };
    const nb = dry ? 7 : 6; for (let i = 0; i < nb; i++) branch(bx + (r() - 0.5) * 10, by, Math.PI / 2 + (i / (nb - 1) - 0.5) * 2.3 + (r() - 0.5) * 0.3, S * (0.3 + r() * 0.16), 3.2, 0);
    const per = bare ? 1 : dry ? 5 : 12, rad = dry ? S * 0.012 : S * 0.016;
    for (const [x0, y0, x1, y1, depth] of twigs) { if (depth === 0) continue; for (let i = 0; i < per; i++) { const t = r(), x = lerp(x0, x1, t) + (r() - 0.5) * rad * 3, y = lerp(y0, y1, t) + (r() - 0.5) * rad * 3, shade = 150 + r() * 95, hi = y < S * 0.5 ? 18 : 0; leaf(x, y, rad * (0.6 + r() * 0.9), `${shade + hi},${shade + hi - 4},${shade + hi - (dry ? 30 : 14)}`, 0.92, r() * 3, dry ? 0.45 : 0.8); } }
    for (let i = 0; i < (bare ? 8 : dry ? 60 : 160); i++) { const x = bx + (r() - 0.5) * S * 0.78, y = S * (0.2 + r() * 0.72), d = Math.hypot((x - bx) / (S * 0.4), (y - S * 0.6) / (S * 0.42)); if (d > 1) continue; const shade = 140 + r() * 100; leaf(x, y, rad * (0.5 + r()), `${shade},${shade - 4},${shade - (dry ? 32 : 16)}`, 0.85, r() * 3, dry ? 0.5 : 0.8); }
  };
  cell(0, 0, () => shrub(true)); cell(1, 0, () => shrub(false)); cell(0, 2, () => shrub(true, true));
  // a spiny desert bush: a dense ball of fine grey twigs with a dusting of tiny leaves
  cell(1, 2, () => { const bx = S / 2, by = S * 0.98; g.lineCap = 'round'; for (let i = 0; i < 160; i++) { const a = Math.PI / 2 + (r() - 0.5) * 2.6, len = S * (0.25 + r() * 0.4), w = 0.8 + r() * 1.4, sh = 118 + r() * 60; g.strokeStyle = `rgba(${sh},${sh - 6},${sh - 20},0.9)`; g.lineWidth = w; g.beginPath(); g.moveTo(bx + (r() - 0.5) * 14, by); g.quadraticCurveTo(bx + Math.cos(a) * len * 0.5 + (r() - 0.5) * 40, by - Math.sin(a) * len * 0.5, bx + Math.cos(a) * len + (r() - 0.5) * 30, by - Math.sin(a) * len); g.stroke(); } for (let i = 0; i < 400; i++) { const a = r() * 6.283, d = Math.sqrt(r()); const x = bx + Math.cos(a) * d * S * 0.36, y = S * 0.6 + Math.sin(a) * d * S * 0.34; if (y > by) continue; const sh = 150 + r() * 90; leaf(x, y, 1 + r() * 2, `${sh},${sh - 2},${sh - 28}`, 0.9, 0, 0.7); } });
  // a tuft of grass: blades from one root, bending over, lighter at the tips
  cell(2, 0, () => { const bx = S / 2, by = S * 0.99; for (let i = 0; i < 46; i++) { const a = Math.PI / 2 + (r() - 0.5) * 1.9, len = S * (0.42 + r() * 0.5), bend = (r() - 0.5) * 1.4, w = 1.6 + r() * 2.6, shade = 165 + r() * 80; g.lineCap = 'round'; const grd = g.createLinearGradient(bx, by, bx + Math.cos(a) * len, by - Math.sin(a) * len); grd.addColorStop(0, `rgba(${shade - 70},${shade - 72},${shade - 100},1)`); grd.addColorStop(1, `rgba(${shade + 30},${shade + 26},${shade - 10},1)`); g.strokeStyle = grd; g.lineWidth = w; g.beginPath(); g.moveTo(bx + (r() - 0.5) * 8, by); g.quadraticCurveTo(bx + Math.cos(a) * len * 0.55, by - Math.sin(a) * len * 0.62, bx + Math.cos(a) * len + bend * len * 0.5, by - Math.sin(a) * len * (0.75 + 0.25 * (1 - Math.abs(bend)))); g.stroke(); } });
  // the acacia seen from the side: a flat crown of fine leaves on dark branches, ragged on top, open underneath
  const crown = (top) => {
    const cx = S / 2, cy = top ? S / 2 : S * 0.42, rx = S * 0.47, ry = top ? S * 0.44 : S * 0.2;
    if (!top) { g.strokeStyle = 'rgba(58,46,34,0.95)'; for (let i = 0; i < 7; i++) { const a = Math.PI / 2 + (i / 6 - 0.5) * 2.1; g.lineWidth = 3.5 - i % 2; g.beginPath(); g.moveTo(cx + (r() - 0.5) * 6, S * 0.98); g.quadraticCurveTo(cx + Math.cos(a) * rx * 0.4, S * 0.7, cx + Math.cos(a) * rx * 0.9, cy + (r() - 0.3) * ry); g.stroke(); } }
    for (let i = 0; i < (LITE ? 1600 : 3600); i++) { const a = r() * 6.283, d = Math.sqrt(r()); const x = cx + Math.cos(a) * d * rx * (0.92 + 0.12 * noise(a * 3, i * 0.01)), y = cy + Math.sin(a) * d * ry * (top ? 1 : (Math.sin(a) > 0 ? 1.6 : 0.8)); if (!top && y < cy - ry * 0.95 + noise(x / 12, 9) * 14) continue; const gsh = 40 + r() * 70, k = top ? 0.96 : 0.78 + 0.34 * (1 - (y - (cy - ry)) / (ry * 2.6)); leaf(x, y, 1.4 + r() * 2.0, `${Math.round((108 + gsh * 0.36) * k)},${Math.round((110 + gsh * 0.4) * k)},${Math.round((78 + gsh * 0.3) * k)}`, 0.95, r() * 3, 0.7); }
    if (top) for (let i = 0; i < 26; i++) { g.save(); g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.ellipse(cx + (r() - 0.5) * rx * 1.5, cy + (r() - 0.5) * ry * 1.5, 4 + r() * 12, 3 + r() * 9, r() * 3, 0, 6.283); g.fill(); g.restore(); }   // sky through the crown
  };
  cell(0, 1, () => crown(false)); cell(1, 1, () => crown(true));
  // bark, and a dead grey branch for the stumps: opaque cells
  cell(2, 1, () => { const img = g.createImageData(S, S); for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) { const i = (y * S + x) * 4, v = 86 + noise(x / 6, y / 40) * 30 + (r() - 0.5) * 26 + (x % 23 < 2 ? -22 : 0); img.data[i] = v; img.data[i + 1] = v * 0.84; img.data[i + 2] = v * 0.68; img.data[i + 3] = 255; } g.putImageData(img, 2 * S, S); });
  const t = tex(c); t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; t.anisotropy = ANISO; return t;
}
TX.nature = natureAtlas();
const NAT_MAT = new THREE.MeshStandardMaterial({ map: TX.nature, alphaTest: 0.42, side: THREE.DoubleSide, vertexColors: true, roughness: 0.92, metalness: 0 });
NAT_MAT.shadowSide = THREE.DoubleSide;
/* a cut-out card: a quad standing on the ground (or lying flat), its uvs on one atlas cell, its normals bent outward like a rounded bush so the
   light does not reveal it as a flat plane, and its colour darker toward the root */
function natCard(w, h, cx, cy, o = {}) {
  const g = new THREE.PlaneGeometry(w, h, 1, 1); if (o.flat) g.rotateX(-Math.PI / 2); else g.translate(0, h / 2, 0);
  if (o.tilt) g.rotateZ(o.tilt); if (o.yaw) g.rotateY(o.yaw); g.translate(o.x || 0, o.y || 0, o.z || 0);
  const uv = g.attributes.uv, { u0, u1, v0, v1 } = NAT.cellUV(cx, cy); for (let i = 0; i < uv.count; i++) uv.setXY(i, lerp(u0, u1, uv.getX(i)), lerp(v0, v1, uv.getY(i)));
  const p = g.attributes.position, nn = g.attributes.normal, col = new Float32Array(p.count * 3), hc = o.center ?? h * 0.45, tmp = V3();
  for (let i = 0; i < p.count; i++) { tmp.set(p.getX(i) - (o.x || 0), p.getY(i) - (o.y || 0) - hc, p.getZ(i) - (o.z || 0)).normalize().lerp(V3(0, 1, 0), 0.45).normalize(); nn.setXYZ(i, tmp.x, tmp.y, tmp.z); const sh = o.flat ? 1 : lerp(o.dark ?? 0.62, 1, clamp((p.getY(i) - (o.y || 0)) / Math.max(h, 0.01), 0, 1)); col[i * 3] = sh; col[i * 3 + 1] = sh; col[i * 3 + 2] = sh; }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3)); return g;
}
const natMerge = (parts) => mergeGeometries(parts.map((g) => { const gg = g.index ? g.toNonIndexed() : g; for (const k of Object.keys(gg.attributes)) if (!['position', 'normal', 'uv', 'color'].includes(k)) gg.deleteAttribute(k); return gg; }), false);
// scrub: four crossed cards, two of them leaning, so it reads as a volume from every side and from above
function bushGeo(cellX, w = 1.0, h = 0.9, seed = 5, cellY = 0) { const r = rng(seed), parts = []; for (let i = 0; i < 4; i++) parts.push(natCard(w * (0.85 + r() * 0.3), h * (0.85 + r() * 0.3), cellX, cellY, { yaw: i * Math.PI / 4 + (r() - 0.5) * 0.3, tilt: i % 2 ? (r() - 0.5) * 0.5 : 0, x: (r() - 0.5) * 0.2, z: (r() - 0.5) * 0.2, dark: 0.55 })); return natMerge(parts); }
const BUSH_G = bushGeo(0, 1.05, 0.95, 5), BUSH_GREEN_G = bushGeo(1, 1.0, 1.0, 6), BUSH_TWIG_G = bushGeo(0, 1.0, 0.8, 7, 2), BUSH_SPINY_G = bushGeo(1, 0.9, 0.7, 8, 2);
const GRASS_G = natMerge([0, 1, 2].map((i) => natCard(0.62, 0.55, 2, 0, { yaw: i * Math.PI / 3, dark: 0.5 })));
const TALL_G = natMerge([0, 1, 2].map((i) => natCard(1.0, 1.15, 2, 0, { yaw: i * Math.PI / 3 + 0.3, dark: 0.45 })));
// the acacia: a leaning trunk and two limbs in bark, a flat crown of five cards - one lying across the top, four standing round the edge
const TAMA_G = (() => {
  const bark = (g) => { const uv = g.attributes.uv, { u0, u1, v0, v1 } = NAT.cellUV(2, 1); for (let i = 0; i < uv.count; i++) uv.setXY(i, lerp(u0, u1, 0.1 + 0.8 * uv.getX(i)), lerp(v0, v1, 0.1 + 0.8 * uv.getY(i))); colored(g, (x, y) => (y < 0.4 ? 0xb9b2a6 : 0xd8d2c6)); return g; };
  const trunk = new THREE.CylinderGeometry(0.15, 0.3, 2.0, 7, 3).translate(0, 1.0, 0); { const p = trunk.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i); p.setX(i, p.getX(i) + y * y * 0.09); } trunk.computeVertexNormals(); }
  const limb = (a, len, tilt) => { const g = new THREE.CylinderGeometry(0.06, 0.13, len, 5, 1).translate(0, len / 2, 0); g.rotateZ(tilt); g.rotateY(a); g.translate(0.3, 1.75, 0); return g; };
  const parts = [bark(trunk), bark(limb(0.4, 1.5, 0.85)), bark(limb(2.6, 1.4, -0.8)), bark(limb(4.4, 1.2, 0.7)), bark(limb(1.6, 1.0, 0.5))];
  parts.push(natCard(3.6, 3.6, 1, 1, { flat: true, y: 2.75, center: 0, dark: 1 }), natCard(3.0, 3.0, 1, 1, { flat: true, y: 3.0, yaw: 0.7, x: 0.25, center: 0, dark: 1 }));
  for (let i = 0; i < 4; i++) parts.push(natCard(3.7, 1.5, 0, 1, { yaw: i * Math.PI / 4 + 0.2, y: 1.75, x: 0.3, center: 0.9, dark: 0.8 }));
  return natMerge(parts);
})();
const REED_G = build([0, 1, 2, 3, 4, 5, 6].map((k) => [G.cone(0.05, 1.8 + (k % 3) * 0.4, 4), 0xffffff, M4(Math.cos(k * 2.4) * 0.35, 0.9, Math.sin(k * 2.4) * 0.35, Math.cos(k) * 0.12, 0, Math.sin(k) * 0.12)]));
const NAT_GEOS = new Set([BUSH_G, BUSH_GREEN_G, BUSH_TWIG_G, BUSH_SPINY_G, GRASS_G, TALL_G, TAMA_G]);
const _tiltE = new THREE.Euler();
function instScatter(geo, items, mat = DET_MAT, cast = true) {
  // items: [x, z, scale, rot, color, yOff, sy]
  if (!items.length) return null; const rock = ROCK_GEOS.has(geo) || ROCKS_G.includes(geo), nat = NAT_GEOS.has(geo); if (mat === DET_MAT && rock) mat = ROCK_MAT; if (nat) mat = NAT_MAT;
  if (geo === BUSH_G) { // the greener bushes get the rounder, denser cut-out; the dry scrub comes in three kinds
    const hs = (it) => Math.abs(Math.sin(it[0] * 7.13 + it[1] * 3.71) * 10000) % 1, gr = [], dr = [], tw = [], sp = [];
    for (const it of items) { const c = it[4]; if (((c >> 8) & 255) > ((c >> 16) & 255) + 10) gr.push(it); else { const h = hs(it); (h < 0.3 ? tw : h < 0.6 ? sp : dr).push(it); } }
    if (gr.length) instScatter(BUSH_GREEN_G, gr, mat, cast); if (tw.length) instScatter(BUSH_TWIG_G, tw, mat, cast); if (sp.length) instScatter(BUSH_SPINY_G, sp, mat, cast); items = dr; if (!items.length) return null; }
  const im = new THREE.InstancedMesh(geo, mat, items.length), mm = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), c = new THREE.Color();
  items.forEach(([x, z, s, r, col, yo = 0, sy = 1], i) => {
    const h = Math.abs(Math.sin(x * 12.9898 + z * 78.233) * 43758.5453) % 1, h2 = Math.abs(Math.sin(x * 39.3468 + z * 11.135) * 24634.6345) % 1;
    if (rock) e.set((h - 0.5) * 0.5, r, (h2 - 0.5) * 0.5); else e.set(0, r, 0);   // rocks lie as they fell
    im.setMatrixAt(i, mm.compose(V3(x, groundAt(x, z) + yo * s, z), q.setFromEuler(e), V3(s, s * sy, s)));
    if (geo === TAMA_G) c.setHex(0xffffff).multiplyScalar(0.82 + h * 0.3); else c.setHex(col); if (nat && geo !== TAMA_G) c.multiplyScalar(1.18 + (h2 - 0.5) * 0.3);   // painted in neutral tones: the tint is the colour
    im.setColorAt(i, c); });
  im.instanceColor.needsUpdate = true; scene.add(SH(onLayer1(im), cast || nat, true)); return im;
}
/* scatter: n items in a rectangle (world), skipping wherever ok(x, z) says no */
function scatterIn(n, x0, x1, z0, z1, seed, ok, make) { const r = rng(seed), out = []; for (let k = 0; k < n * 4 && out.length < n; k++) { const x = lerp(x0, x1, r()), z = lerp(z0, z1, r()); if (ok && !ok(x, z)) continue; out.push(make(x, z, r)); } return out; }
const rockCol = (r) => [0x8a7d68, 0x7a6e5c, 0x9a8c74, 0x6e6454, 0xa49478][Math.floor(r() * 5)], ROCKC = rockCol;
const dryBush = (r) => [0x8a8460, 0x7d7a58, 0x938a66, 0x6f7050, 0x9a9270, 0x857e5e][Math.floor(r() * 6)];   // straw, dust and grey: the scrub of the Sinai
const greenBush = (r) => [0x66744e, 0x5c6c48, 0x707c56, 0x627452, 0x76805c][Math.floor(r() * 5)];   // the greener bushes of a wadi floor or the canal's belt: still grey-green, never lush
// plants grow where water once ran: clumps and bare ground, from a slow noise over the map
const clumpy = (ok, scale, bias, off = 0) => (x, z) => (!ok || ok(x, z)) && noise(x / scale + off, z / scale - off * 0.7) > bias;
function boulders(list) { for (const [x, z, s] of list) { addCollider(x, z, s * 0.8, s * 0.8, 0, groundAt(x, z) + s * 1.1); coverBox(x, z, s * 0.8, s * 0.8, 0, Math.min(1.6, s * 1.1)); } }
function powerLine(pts, step = 42, h = 7.5) {
  const poles = densify(pts, step), pm = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.11, 0.15, h, 7).translate(0, h / 2, 0), MAT.wood, poles.length), cm = new THREE.InstancedMesh(new THREE.BoxGeometry(1.6, 0.1, 0.1), MAT.wood, poles.length), mm = new THREE.Matrix4(), q = new THREE.Quaternion();
  const wires = [];
  poles.forEach(([x, z], i) => { const g = groundAt(x, z), b = poles[Math.min(i + 1, poles.length - 1)], a = poles[Math.max(i - 1, 0)], rot = Math.atan2(-(b[1] - a[1]), b[0] - a[0]) + Math.PI / 2; pm.setMatrixAt(i, mm.compose(V3(x, g, z), q.identity(), V3(1, 1, 1))); cm.setMatrixAt(i, mm.compose(V3(x, g + h - 0.4, z), q.setFromAxisAngle(V3(0, 1, 0), rot), V3(1, 1, 1)));
    if (i < poles.length - 1) { const gb = groundAt(b[0], b[1]); for (const sd of [-0.7, 0, 0.7]) for (let k = 0; k < 8; k++) { const t0 = k / 8, t1 = (k + 1) / 8, sag = (t) => -Math.sin(t * Math.PI) * 0.7, ox = Math.cos(rot) * sd, oz = -Math.sin(rot) * sd; wires.push(V3(lerp(x, b[0], t0) + ox, lerp(g, gb, t0) + h - 0.4 + sag(t0), lerp(z, b[1], t0) + oz), V3(lerp(x, b[0], t1) + ox, lerp(g, gb, t1) + h - 0.4 + sag(t1), lerp(z, b[1], t1) + oz)); } } });
  scene.add(SH(onLayer1(pm)), SH(onLayer1(cm))); scene.add(onLayer1(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(wires), new THREE.LineBasicMaterial({ color: 0x2a2724 }))));
}
function wireFence(pts, step = 3.2) {
  const posts = densify(pts, step), pm = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.04, 0.05, 1.3, 5).translate(0, 0.65, 0), MAT.wood, posts.length), mm = new THREE.Matrix4(), q = new THREE.Quaternion(), wires = [];
  posts.forEach(([x, z], i) => { const g = groundAt(x, z); pm.setMatrixAt(i, mm.compose(V3(x, g, z), q.setFromAxisAngle(V3(0, 1, 0), i * 0.7), V3(1, 0.9 + (i % 3) * 0.07, 1))); if (i < posts.length - 1) { const [bx, bz] = posts[i + 1], gb = groundAt(bx, bz); for (const y of [0.35, 0.75, 1.15]) wires.push(V3(x, g + y, z), V3(bx, gb + y - 0.04, bz)); } });
  scene.add(SH(onLayer1(pm))); scene.add(onLayer1(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(wires), new THREE.LineBasicMaterial({ color: 0x3a3632 }))));
}
const HUT_MAT = {}; function hutMat(col) { if (!HUT_MAT[col]) { const t = plasterTex(col.length * 7 + 3, col); HUT_MAT[col] = new THREE.MeshStandardMaterial({ map: t, bumpMap: bumpOf(t), bumpScale: 0.7, roughness: 0.95 }); } return HUT_MAT[col]; }
function smallHut(x, z, w, d, h, col = '#cdb894', roof = 0x8a7a62, ruined = false) {
  const y = groundAt(x, z) - 0.2, hh = (ruined ? h * 0.6 : h) * 1.35;   // taller than they were: a house reads as a house from far off const m = new THREE.Mesh(boxUV(x - w / 2, x + w / 2, y, y + hh, z - d / 2, z + d / 2, 3, 3), hutMat(col)); scene.add(SH(onLayer1(m)));
  const parts = []; if (!ruined) parts.push([G.box(w + 0.7, 0.32, d + 0.7), roof, M4(x, y + hh + 0.16, z)], [G.box(w + 0.8, 0.12, d + 0.8), 0x5e5446, M4(x, y + hh + 0.02, z)]); parts.push([G.box(0.9, 1.9, 0.06), 0x2a2018, M4(x - w * 0.2, y + 1.15, z + d / 2 + 0.02)], [G.box(0.7, 0.6, 0.06), 0x1d1a16, M4(x + w * 0.25, y + 1.6, z + d / 2 + 0.02)], [G.box(0.06, 0.6, 0.7), 0x1d1a16, M4(x + w / 2 + 0.02, y + 1.6, z)]);
  if (ruined) for (let k = 0; k < 6; k++) parts.push([new THREE.DodecahedronGeometry(0.25 + Math.random() * 0.3, 0), 0xb4a282, M4(x + rand(-w, w) * 0.7, y + 0.25, z + d / 2 + rand(0.3, 1.5))]);
  scene.add(SH(onLayer1(new THREE.Mesh(build(parts), MAT.vc)))); addCollider(x, z, w / 2, d / 2, 0, y + hh + 0.2); coverBox(x, z, w / 2, d / 2, 0, Math.min(2, hh));
}
/* ---------- roads you can read as roads: asphalt with lane marks, wear and sand at the edges; dirt tracks with two ruts and tyre marks ----------
   A road is a ribbon laid over the ground along a line; its texture runs along it, so the marks and the ruts follow the bends. */
function roadTex(kind) {
  const W = 512, H = 128, c = canvas(W, H), g = c.getContext('2d'), img = g.createImageData(W, H), r = rng(kind === 'dirt' ? 7313 : kind === 'shoulder' ? 7319 : 7311);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const v = y / (H - 1), i = (y * W + x) * 4, n = (r() - 0.5), edge = Math.min(v, 1 - v);
    if (kind === 'shoulder') {
      // trodden, wheel-marked ground either side of the road: a little paler and greyer than the sand, fading into it
      const trk = Math.max(1 - Math.abs(v - 0.14) / 0.05, 1 - Math.abs(v - 0.86) / 0.05, 0) * (noise(x / 30, v * 9) > -0.1 ? 1 : 0), k = 1 + n * 0.12 - 0.1 * trk;
      img.data[i] = 178 * k; img.data[i + 1] = 160 * k; img.data[i + 2] = 128 * k; img.data[i + 3] = 255 * clamp((0.42 + 0.3 * noise(x / 24, v * 6 + 2)) * smooth(0, 0.3, edge), 0, 0.75);
    } else if (kind === 'dirt') {
      const rut = Math.max(1 - Math.abs(v - 0.3) / 0.09, 1 - Math.abs(v - 0.7) / 0.09, 0), k = 1 - 0.16 * Math.max(0, rut) + n * 0.16 + (r() < 0.02 ? 0.25 : 0) - (r() < 0.02 ? 0.22 : 0);
      img.data[i] = 168 * k; img.data[i + 1] = 142 * k; img.data[i + 2] = 106 * k; img.data[i + 3] = 255 * Math.min(1, smooth(0, 0.22, edge) * 1.05 + (r() - 0.5) * 0.25 * (1 - smooth(0.05, 0.22, edge)));
    } else {
      const wear = Math.max(1 - Math.abs(v - 0.28) / 0.07, 1 - Math.abs(v - 0.72) / 0.07, 0), k = 1 + n * 0.22 - 0.07 * wear + (r() < 0.012 ? 0.35 : 0), sand = 1 - smooth(0.02, 0.14, edge);
      img.data[i] = lerp(112 * k, 176, sand * 0.75); img.data[i + 1] = lerp(110 * k, 156, sand * 0.75); img.data[i + 2] = lerp(104 * k, 118, sand * 0.75); img.data[i + 3] = 255 * Math.min(1, smooth(0, 0.05, edge) * 1.1);
    }
  }
  g.putImageData(img, 0, 0); g.lineCap = 'round';
  if (kind === 'shoulder') { for (let k = 0; k < 120; k++) { const x = r() * W, y = r() * H; g.fillStyle = r() < 0.5 ? `rgba(225,210,180,${0.25 + r() * 0.3})` : `rgba(90,76,58,${0.2 + r() * 0.3})`; g.beginPath(); g.arc(x, y, 0.8 + r() * 1.8, 0, 6.283); g.fill(); } }
  else if (kind === 'dirt') {
    // tyre tread in the ruts, pebbles, a few puddle stains
    for (const rv of [0.3, 0.7]) for (let x = 0; x < W; x += 3) { if (r() < 0.55) { g.strokeStyle = `rgba(70,55,36,${0.12 + r() * 0.16})`; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x, (rv - 0.05) * H); g.lineTo(x + 1.5, (rv + 0.05) * H); g.stroke(); } }
    for (let k = 0; k < 260; k++) { const x = r() * W, y = (0.15 + r() * 0.7) * H; g.fillStyle = r() < 0.5 ? `rgba(220,205,175,${0.4 + r() * 0.4})` : `rgba(80,66,48,${0.35 + r() * 0.4})`; g.beginPath(); g.arc(x, y, 0.6 + r() * 1.6, 0, 6.283); g.fill(); }
    for (let k = 0; k < 6; k++) { const x = r() * W, y = (0.25 + r() * 0.5) * H; g.fillStyle = 'rgba(95,78,55,0.22)'; g.beginPath(); g.ellipse(x, y, 10 + r() * 18, 4 + r() * 6, 0, 0, 6.283); g.fill(); }
  } else {
    // cracks, patches, the faded edge lines and the broken centre line
    for (let k = 0; k < 22; k++) { let x = r() * W, y = (0.1 + r() * 0.8) * H; g.strokeStyle = `rgba(30,30,30,${0.3 + r() * 0.35})`; g.lineWidth = 0.7 + r() * 1.1; g.beginPath(); g.moveTo(x, y); for (let j = 0; j < 6; j++) { x += (r() - 0.3) * 26; y += (r() - 0.5) * 14; g.lineTo(x, y); } g.stroke(); }
    for (let k = 0; k < 5; k++) { const x = r() * W, y = (0.15 + r() * 0.6) * H; g.fillStyle = `rgba(${62 + r() * 18},${62 + r() * 18},${60 + r() * 16},0.55)`; g.fillRect(x, y, 24 + r() * 50, 12 + r() * 22); }
    for (const ev of [0.08, 0.92]) for (let x = 0; x < W; x += 2) { if (r() < 0.86) { g.fillStyle = `rgba(226,222,206,${0.35 + r() * 0.3})`; g.fillRect(x, ev * H - 1.5, 2, 3); } }
    for (let d = 0; d < 4; d++) { const x0 = d * 128 + 10; for (let x = x0; x < x0 + 60; x += 2) if (r() < 0.9) { g.fillStyle = `rgba(232,214,150,${0.4 + r() * 0.3})`; g.fillRect(x, 0.5 * H - 2, 2, 4); } }
    for (let k = 0; k < 4; k++) { const x = r() * W; g.fillStyle = 'rgba(25,22,18,0.35)'; g.beginPath(); g.ellipse(x, (0.3 + r() * 0.4) * H, 16 + r() * 20, 5 + r() * 6, r(), 0, 6.283); g.fill(); }   // oil and scorch
  }
  const t = tex(c); t.wrapS = THREE.RepeatWrapping; t.wrapT = THREE.ClampToEdgeWrapping; return t;
}
const ROADM = {};
function roadMat(kind) { return ROADM[kind] || (ROADM[kind] = new THREE.MeshStandardMaterial({ map: roadTex(kind), transparent: true, depthWrite: false, roughness: 0.95, metalness: 0, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4, side: THREE.DoubleSide })); }
// pts in world coordinates; three rows across so the ribbon follows the crown of the road
function roadRibbon(pts, w, kind = 'asphalt', lift = 0.07, tile = kind === 'dirt' ? 14 : kind === 'shoulder' ? 26 : 18, o = {}) {
  if (kind !== 'shoulder' && !o.bare) { const sh = roadRibbon(pts, w * 2.3, 'shoulder', lift - 0.035, 26, { bare: true }); sh.renderOrder = 0;
    const L = Math.max(1, pathLen(pts)); instScatter(PEBBLE_G, scatterNear(pts, Math.round(L * (LITE ? 0.5 : 1.3)), w * 0.5 + 0.15, w * 0.5 + 1.6, 7777 + Math.round(pts[0][0]), null, (x, z, r) => [x, z, 0.5 + r() * 1.1, r() * 6, [0x8a7d68, 0x7a6e5c, 0x9a8c74, 0xa09078][Math.floor(r() * 4)], 0.05, 0.6]), DET_MAT, false); }
  const d = densify(smoothPath(pts, 2.5), 2), pos = [], uv = [], idx = []; let acc = 0;
  for (let i = 0; i < d.length; i++) {
    const a = d[Math.max(0, i - 1)], b = d[Math.min(d.length - 1, i + 1)], dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz) || 1, nx = -dz / L, nz = dx / L; if (i > 0) acc += Math.hypot(d[i][0] - d[i - 1][0], d[i][1] - d[i - 1][1]);
    for (const sv of [0, 0.5, 1]) { const o = (sv - 0.5) * w, x = d[i][0] + nx * o, z = d[i][1] + nz * o; pos.push(x, groundAt(x, z) + lift, z); uv.push(acc / tile, sv); }
    if (i > 0) { const k = (i - 1) * 3; idx.push(k, k + 3, k + 1, k + 1, k + 3, k + 4, k + 1, k + 4, k + 2, k + 2, k + 4, k + 5); }
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
  const m = new THREE.Mesh(g, roadMat(kind)); m.receiveShadow = !LITE; m.renderOrder = 1; scene.add(onLayer1(m)); return m;
}
// burnt-out and abandoned vehicles by the side of a road
function roadWrecks(pts, n, seed, side = 6.5) {
  const r = rng(seed), d = densify(smoothPath(pts, 3), 6), geos = [TRUCK_BURNT, TRUCK_BURNT, TANK_BURNT, JEEP_GEO, ETRUCK_GEO];
  for (let k = 0; k < n; k++) { const i = 2 + Math.floor(r() * Math.max(1, d.length - 4)), a = d[i - 1], b = d[i + 1], hd = Math.atan2(b[0] - a[0], b[1] - a[1]), sd = r() < 0.5 ? -1 : 1, nx = Math.cos(hd), nz = -Math.sin(hd), x = d[i][0] + nx * side * sd * (0.9 + r() * 0.4), z = d[i][1] + nz * side * sd * (0.9 + r() * 0.4), geo = geos[Math.floor(r() * geos.length)];
    if (geo === TANK_BURNT) placeTank(x, z, hd * 180 / Math.PI + rand(-30, 30), TANK_BURNT); else { const m = vehicle(geo, x, z, hd + (r() - 0.5) * 0.9 + (geo === JEEP_GEO ? Math.PI / 2 : 0), geo === JEEP_GEO ? 3.3 * JK : 3.3, geo === JEEP_GEO ? 1.2 * JK : 1.2, geo === JEEP_GEO ? 2.6 * JK : 2.6); if (geo === JEEP_GEO && m && m.material) m.material = MAT_BURNT; } }
}
function roadPoles(pts, step = 25, side = 6) { const list = []; const dp = densify(smoothPath(pts, 4), step); dp.forEach((p, i) => { const b = dp[Math.min(i + 1, dp.length - 1)], a = dp[Math.max(i - 1, 0)], dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz) || 1; for (const sd of [-1, 1]) list.push([p[0] - dz / l * side * sd, p[1] + dx / l * side * sd]); });
  const pm = new THREE.InstancedMesh(build([[G.box(0.12, 1.0, 0.12), 0xe8e4d8, M4(0, 0.5, 0)], [G.box(0.13, 0.22, 0.13), 0x2a2a2a, M4(0, 0.82, 0)]]), MAT.vc, list.length), mm = new THREE.Matrix4(), q = new THREE.Quaternion(); list.forEach(([x, z], i) => pm.setMatrixAt(i, mm.compose(V3(x, groundAt(x, z), z), q, V3(1, 1, 1)))); scene.add(SH(onLayer1(pm))); }
function fieldSign(x, z, text, rot, w = 1.3, h = 2.1) { const g = groundAt(x, z); const m = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, h, 6).translate(0, h / 2, 0), MAT.metal); m.position.set(x, g, z); scene.add(onLayer1(m)); sign(text, 'plain', x, g + h, z, rot, w); }
/* an ambush nest in the scrub: a sandbag ring hidden in a clump of bushes */
function bushNest(x, z, fx, fz, slots, grp, kind, bushes, r) { const s = foxhole(x, z, fx, fz, slots); s.grp = grp; s.kind = kind; for (let k = 0; k < 5; k++) { const a = Math.atan2(fx, fz) + rand(-2.2, 2.2), d = rand(1.6, 3.2); bushes.push([x + Math.sin(a) * d, z + Math.cos(a) * d, rand(0.9, 1.5), rand(0, 6), greenBush(r)]); } return s; }
const DRUM_G = build([[G.cyl(0.29, 0.29, 0.88, 12), 0xffffff, M4(0, 0.44, 0)]]);
function fieldDrums(x, z, n) { const r = rng(Math.round(x * 7 + z * 13) >>> 0), items = []; for (let i = 0; i < n; i++) items.push([x + (i % 3) * 0.62 + (r() - 0.5) * 0.1, z + Math.floor(i / 3) * 0.62, 1, r() * 6, [0x2f4a3a, 0x6b3a26, 0x3d4652, 0x7a6a3a][Math.floor(r() * 4)], 0, 1]); instScatter(DRUM_G, items, MAT.vc); addCover(x - 0.8, z, -1, 0, 0.9); }
/* scatter along a route: items at a random point of the polyline, dmin..dmax to its side (where the player actually looks) */
function scatterNear(pts, n, dmin, dmax, seed, ok, make) { const r = rng(seed), dp = densify(pts, 6), out = []; for (let k = 0; k < n * 4 && out.length < n; k++) { const i = Math.floor(r() * (dp.length - 1)), a = dp[i], b = dp[i + 1], u = r(), dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz) || 1, sd = r() < 0.5 ? -1 : 1, off = lerp(dmin, dmax, r() ** 1.4) * sd; const x = lerp(a[0], b[0], u) - dz / l * off, z = lerp(a[1], b[1], u) + dx / l * off; if (ok && !ok(x, z)) continue; out.push(make(x, z, r)); } return out; }
/* ---------- lots of detail: a handful of shapes, instanced by the thousand along the roads and over the ground ---------- */
const PEBBLE_G = build([[new THREE.OctahedronGeometry(0.17, 0), 0xffffff, M4(0, 0, 0, 0.3, 0.2, 0)], [new THREE.OctahedronGeometry(0.12, 0), 0xffffff, M4(0.3, 0, 0.12, 0, 0.7, 0.4)], [new THREE.OctahedronGeometry(0.1, 0), 0xffffff, M4(-0.22, 0, 0.25)], [new THREE.OctahedronGeometry(0.14, 0), 0xffffff, M4(0.05, 0, -0.3, 0.5, 0, 0)]]);
const SLAB_G = rockGeo(33, LITE ? 1 : 2, 1.7, 0.5, 1.0, 'slab'), SHARP_G = rockGeo(34, 1, 1.0, 0.8, 1.25, 'sharp'), CLUSTER_G = natMerge([rockGeo(35, 1, 1, 0.7, 1.2, 'round').translate(0, 0, 0), rockGeo(36, 1, 0.55, 0.45, 0.6, 'sharp').translate(1.1, -0.15, 0.3), rockGeo(37, 1, 0.4, 0.35, 0.45, 'round').translate(-0.9, -0.2, 0.6)]);
const ROCKS_G = [ROCK_G, SLAB_G, SHARP_G, CLUSTER_G];
const grassCol = (r) => [0x8a8456, 0x9a9060, 0x7a7a4a, 0xa49a68, 0x6f7442][Math.floor(r() * 5)];
function dressRoute(pts, ok, seed, k = 1, green = 0.2, o = {}) {
  const n = (v) => Math.round(v * k * (LITE ? 0.4 : 1)), rockCol = o.rock || ROCKC, nT = (v) => Math.round(n(v) * 0.55 * (o.trees ?? 1)), nG = (v) => Math.round(n(v) * (o.grass ?? 1));
  const okG = clumpy(ok, 19, -0.08, seed * 0.01), okB = clumpy(ok, 44, -0.14, seed * 0.013 + 5), okT = clumpy(ok, 70, 0.12, seed * 0.017 + 9);
  instScatter(PEBBLE_G, scatterNear(pts, n(2600), 3.5, 14, seed + 1, ok, (x, z, r) => [x, z, 0.6 + r() * 1.4, r() * 6, rockCol(r), 0.05, 0.6]), DET_MAT, false);
  ROCKS_G.forEach((g, i) => instScatter(g, scatterNear(pts, n(i === 0 ? 700 : 360), 6, 90, seed + 2 + i, ok, (x, z, r) => [x, z, 0.2 + r() ** 2.5 * 1.2, r() * 6, rockCol(r), 0.2, 0.6]), DET_MAT, false));
  instScatter(GRASS_G, scatterNear(pts, nG(3600), 4, 60, seed + 6, okG, (x, z, r) => [x, z, 0.7 + r() * 0.9, r() * 6, grassCol(r), 0, 1]), DET_MAT, false);
  instScatter(BUSH_G, scatterNear(pts, n(1500), 7, 110, seed + 7, okB, (x, z, r) => [x, z, 0.4 + r() * 1.0, r() * 6, r() < green ? greenBush(r) : dryBush(r), 0, 0.8]), DET_MAT, false);
  instScatter(TAMA_G, scatterNear(pts, nT(260), 12, 120, seed + 8, okT, (x, z, r) => [x, z, 0.8 + r() * 0.9, r() * 6, r() < 0.5 ? 0x5e6a40 : 0x6e6a44, 0, 1]));
  const bl = scatterNear(pts, n(90), 14, 100, seed + 9, ok, (x, z, r) => [x, z, 1.2 + r() * 1.8, r() * 6, rockCol(r), 0.3, 0.7]); instScatter(BOULDER_G, bl); boulders(bl); scree(bl, seed + 11, rockCol);
  for (const [x, z] of scatterNear(pts, n(60), 10, 70, seed + 10, ok, (x, z) => [x, z])) addCover(x, z, 0, 1, 1.0);
}
function dressArea(x0, x1, z0, z1, ok, seed, k = 1, green = 0.2, o = {}) {
  const n = (v) => Math.round(v * k * (LITE ? 0.4 : 1)), rockCol = o.rock || ROCKC, nT = (v) => Math.round(n(v) * 0.55 * (o.trees ?? 1)), nG = (v) => Math.round(n(v) * (o.grass ?? 1));
  const okG = clumpy(ok, 19, -0.08, seed * 0.01), okB = clumpy(ok, 44, -0.14, seed * 0.013 + 5), okT = clumpy(ok, 70, 0.12, seed * 0.017 + 9);
  ROCKS_G.forEach((g, i) => instScatter(g, scatterIn(n(i === 0 ? 800 : 400), x0, x1, z0, z1, seed + i, ok, (x, z, r) => [x, z, 0.2 + r() ** 2.5 * 1.3, r() * 6, rockCol(r), 0.2, 0.6]), DET_MAT, false));
  instScatter(GRASS_G, scatterIn(nG(3200), x0, x1, z0, z1, seed + 4, okG, (x, z, r) => [x, z, 0.7 + r() * 0.9, r() * 6, grassCol(r), 0, 1]), DET_MAT, false);
  instScatter(BUSH_G, scatterIn(n(1400), x0, x1, z0, z1, seed + 5, okB, (x, z, r) => [x, z, 0.4 + r() * 1.0, r() * 6, r() < green ? greenBush(r) : dryBush(r), 0, 0.8]), DET_MAT, false);
  instScatter(TAMA_G, scatterIn(nT(300), x0, x1, z0, z1, seed + 6, okT, (x, z, r) => [x, z, 0.8 + r() * 1.0, r() * 6, r() < 0.5 ? 0x5e6a40 : 0x6e6a44, 0, 1]));
  const bl = scatterIn(n(120), x0, x1, z0, z1, seed + 7, ok, (x, z, r) => [x, z, 1.2 + r() * 2.0, r() * 6, rockCol(r), 0.3, 0.7]); instScatter(BOULDER_G, bl); boulders(bl); scree(bl, seed + 8, rockCol);
}
/* the broken stone that lies round every boulder */
function scree(bl, seed, rockCol) { const r = rng(seed), items = []; for (const [x, z, s] of bl) { const n = 3 + Math.floor(r() * 5); for (let i = 0; i < n; i++) { const a = r() * 6.283, d = s * (0.9 + r() * 1.4); items.push([x + Math.cos(a) * d, z + Math.sin(a) * d, 0.15 + r() * 0.35 * s, r() * 6, rockCol(r), 0.15, 0.6]); } } if (items.length) instScatter(SHARP_G, items, DET_MAT, false); }
/* ---------- tall grass and thick scrub you can walk into: it hides you, more so when you crouch ---------- */
const tallCol = (r) => [0x8f8a52, 0x9c9458, 0x7f8048, 0xa89e62, 0x76823f, 0x6c7a3a][Math.floor(r() * 6)];
function concealPatches(list, C, seed, green = 0.5) {
  // list: [x, z, r] in world coordinates
  const r = rng(seed), tufts = [], bushes = []; C.conceal = C.conceal || [];
  for (const [x, z, rad] of list) { C.conceal.push({ x, z, r: rad * 0.92 }); const n = Math.round(rad * rad * (LITE ? 0.3 : 0.75));
    for (let k = 0; k < n; k++) { const a = r() * 6.283, d = rad * Math.sqrt(r()); const px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d; tufts.push([px, pz, 1.05 + r() * 0.6, r() * 6, r() < green ? tallCol(r) : grassCol(r), 0, 1]); }
    for (let k = 0; k < Math.round(rad * 0.9); k++) { const a = r() * 6.283, d = rad * Math.sqrt(r()); bushes.push([x + Math.cos(a) * d, z + Math.sin(a) * d, 0.8 + r() * 0.9, r() * 6, r() < green ? greenBush(r) : dryBush(r), 0, 1.0]); } }
  instScatter(TALL_G, tufts, DET_MAT, false); instScatter(BUSH_G, bushes, DET_MAT, false);
}
function inConceal(x, z) { const C = CHAP[MODE]; if (!C || !C.conceal) return false; for (const c of C.conceal) if (Math.abs(c.x - x) < c.r && Math.abs(c.z - z) < c.r && Math.hypot(c.x - x, c.z - z) < c.r) return true; return false; }
/* patches placed along a route and over an area */
function patchesNear(pts, n, dmin, dmax, seed, ok, rmin = 4, rmax = 10) { return scatterNear(pts, n, dmin, dmax, seed, ok, (x, z, r) => [x, z, rmin + r() * (rmax - rmin)]); }
function patchesIn(n, x0, x1, z0, z1, seed, ok, rmin = 4, rmax = 11) { return scatterIn(n, x0, x1, z0, z1, seed, ok, (x, z, r) => [x, z, rmin + r() * (rmax - rmin)]); }
