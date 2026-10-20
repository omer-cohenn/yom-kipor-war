
/* ================= chapter 1: the air war over the strongpoint =================
   Slow, low dives along the trench line: cannon fire walks down the line, sandbags fly, bombs fall on whoever is exposed.
   Halfway through, an Israeli Mirage is caught by a MiG over the canal, breaks up and crashes beyond the strongpoint; its pilot comes down under a parachute. */
const AIR = { next: 30, magT: 0, mirage: false, bombs: [], debris: [], ev: null };
const BAG_POOL = (() => { const gs = bagGeos(), list = []; for (let i = 0; i < (LITE ? 18 : 36); i++) { const m = new THREE.Mesh(gs[i % gs.length], MAT.bag); m.scale.set(0.6, 0.22, 0.36); m.visible = false; m.castShadow = SHADOWS; scene.add(onLayer1(m)); list.push({ m, v: V3(), w: V3(), t: 99, rest: false }); } return list; })();
function bagBurst(p, n) {
  for (let k = 0; k < n; k++) { let b = BAG_POOL[0]; for (const q of BAG_POOL) if (q.t > b.t) b = q; b.t = 0; b.rest = false; b.m.visible = true; b.m.position.copy(p).add(V3(rand(-0.6, 0.6), 0.6, rand(-0.6, 0.6))); b.v.set(rand(-5, 5), rand(6, 13), rand(-5, 5)); b.w.set(rand(-8, 8), rand(-8, 8), rand(-8, 8)); }
}
function updDebris(dt) {
  for (const b of BAG_POOL) { if (!b.m.visible) continue; b.t += dt; if (b.t > 14) { b.m.visible = false; continue; } if (b.rest) continue;
    b.v.y -= 9.8 * dt; b.m.position.addScaledVector(b.v, dt); b.m.rotation.x += b.w.x * dt; b.m.rotation.y += b.w.y * dt; b.m.rotation.z += b.w.z * dt;
    const g = hAt(b.m.position.x, b.m.position.z, b.m.position.y) + 0.1; if (b.m.position.y < g) { b.m.position.y = g; if (Math.abs(b.v.y) < 2.5) { b.rest = true; b.m.rotation.x = 0; b.m.rotation.z = 0; } else { b.v.y *= -0.25; b.v.x *= 0.4; b.v.z *= 0.4; b.w.multiplyScalar(0.4); } } }
}
const BOMB_GEO = build([[G.cyl(0.18, 0.18, 1.5, 10), 0x3a3d36, M4(0, 0, 0, Math.PI / 2, 0, 0)], [G.cone(0.18, 0.4, 10), 0x2e302b, M4(0, 0, 0.95, Math.PI / 2, 0, 0)], [G.box(0.5, 0.04, 0.3), 0x2e302b, M4(0, 0, -0.75)]]);
const airExposed = () => P.alive && (P.mode === 'mag' || (!underRoof() && !(inTrench() && P.crouch)));
function dropBombs(j) {
  const near = Math.hypot(P.pos.x - j.tx, P.pos.z - j.tz) < 110, exp = near && airExposed();
  const tg = exp ? [[P.pos.x + rand(-1.2, 1.2), P.pos.z + rand(-1.2, 1.2)], [P.pos.x + j.dx * 14 + rand(-2, 2), P.pos.z + j.dz * 14 + rand(-2, 2)]] : [0, 1, 2].map((k) => { const u = 18 + k * 17; return [j.tx + j.dx * u + rand(-2, 2), j.tz + j.dz * u + rand(-2, 2)]; });
  if (exp) radio('תצפית', P.mode === 'mag' ? 'הטייס ראה אותך! תרד מהמא״ג!' : 'הוא צולל ישר עליך! לקטע המקורה!', 2.4);
  tg.forEach(([x, z], k) => { const m = new THREE.Mesh(BOMB_GEO, MAT.vc); m.scale.setScalar(1.8); scene.add(onLayer1(m)); const from = j.m.position.clone(); AIR.bombs.push({ m, from, to: V3(x, groundAt(x, z), z), t: -k * 0.3, dur: 2.3, hard: exp && k === 0 }); });
}
function updBombs(dt) {
  for (let i = AIR.bombs.length - 1; i >= 0; i--) { const b = AIR.bombs[i]; b.t += dt; if (b.t < 0) { b.m.visible = false; continue; } b.m.visible = true; const u = Math.min(1, b.t / b.dur);
    const p = b.from.clone().lerp(b.to, u); p.y = lerp(b.from.y, b.to.y, u * u); b.m.position.copy(p); b.m.lookAt(b.to);
    if (u >= 1) { scene.remove(b.m); AIR.bombs.splice(i, 1); explode(b.to.clone(), 2.0, 13, b.hard ? 190 : 140, 'art'); if (onTrench(b.to.x, b.to.z) < 5) bagBurst(b.to, 7); } }
}
function airDirector(dt) {
  updDebris(dt); updBombs(dt);
  AIR.magT = 0;   // the jets come once, in the opening attack; after that the sky over the Mezach is quiet
  if (!AIR.mirage && D.phase === 'alert' && D.phaseT > 0.9) { AIR.mirage = true; mirageFilm(); }
  if (AIR.ev) updMirage(dt);
}
/* ---------- the Mirage: delta wing, desert camouflage, the blue Star of David in white roundels ---------- */
function roundelTex() {
  const c = canvas(128), g = c.getContext('2d'); g.fillStyle = '#ffffff'; g.beginPath(); g.arc(64, 64, 62, 0, 6.283); g.fill(); g.strokeStyle = '#1846b8'; g.lineWidth = 9; g.lineJoin = 'miter';
  for (const a0 of [-Math.PI / 2, Math.PI / 2]) { g.beginPath(); for (let k = 0; k < 3; k++) { const a = a0 + k * 2.0944, x = 64 + Math.cos(a) * 44, y = 64 + Math.sin(a) * 44; k ? g.lineTo(x, y) : g.moveTo(x, y); } g.closePath(); g.stroke(); }
  const t = tex(c); return t;
}
/* ---------- the two jets of the film, modelled properly: turned fuselages (a lathe of the real cross-sections), wings and fins with
   thickness and rounded edges, intakes and shock cones, a glazed canopy, the nozzle - and painted: the Mirage in the IAF's sand, brown and
   olive with its blue Stars of David and yellow identification triangles; the MiG-21 in bare metal with Egypt's roundels and flag ---------- */
const JX = {};   // shared pieces, made once
function jxLathe(prof, segs = 48, sy = 1, sz = 1) { const g = new THREE.LatheGeometry(prof.map(([r, x]) => new THREE.Vector2(r, x)), segs); g.rotateZ(-Math.PI / 2); g.scale(1, sy, sz); g.computeVertexNormals(); return g; }
function jxPlate(pts, plane = 'xz', thick = 0.07, bev = 0.07) {   // a wing or a fin: its planform extruded thin, with rounded edges
  const sh = new THREE.Shape(pts.map(([a, b]) => new THREE.Vector2(a, b)));
  const g = new THREE.ExtrudeGeometry(sh, { depth: thick, bevelEnabled: true, bevelThickness: bev * 0.7, bevelSize: bev, bevelSegments: 3, curveSegments: 4 });
  g.translate(0, 0, -thick / 2); if (plane === 'xz') g.rotateX(Math.PI / 2); g.computeVertexNormals();
  const pa = g.attributes.position, uv = g.attributes.uv; for (let k = 0; k < pa.count; k++) uv.setXY(k, pa.getX(k) / 9, (plane === 'xz' ? pa.getZ(k) : pa.getY(k)) / 9);   // the paint laid on from above
  return g;
}
function jxCamoTex() {
  if (JX.camo) return JX.camo; const c = canvas(1024, 1024), g = c.getContext('2d'), r = rng(1967);
  g.fillStyle = '#b8a06a'; g.fillRect(0, 0, 1024, 1024);
  const blob = (col, n, s0, s1) => { g.fillStyle = col; for (let i = 0; i < n; i++) { const x = r() * 1024, y = r() * 1024, s = s0 + r() * (s1 - s0); g.beginPath(); for (let k = 0; k <= 14; k++) { const a = k / 14 * 6.283, rr = s * (0.65 + 0.5 * r()); const px = x + Math.cos(a) * rr * 1.6, py = y + Math.sin(a) * rr; k ? g.lineTo(px, py) : g.moveTo(px, py); } g.closePath(); g.fill(); } };
  blob('#7c5c3a', 26, 50, 110); blob('#6b6c44', 22, 45, 100);
  g.globalAlpha = 0.07; for (let i = 0; i < 3000; i++) { g.fillStyle = r() < 0.5 ? '#000' : '#fff'; g.fillRect(r() * 1024, r() * 1024, 2 + r() * 6, 1 + r() * 3); } g.globalAlpha = 1;
  g.strokeStyle = 'rgba(30,26,18,.35)'; g.lineWidth = 1.2; for (let x = 0; x < 1024; x += 64 + Math.floor(r() * 40)) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 1024); g.stroke(); } for (let y = 0; y < 1024; y += 90 + Math.floor(r() * 50)) { g.beginPath(); g.moveTo(0, y); g.lineTo(1024, y); g.stroke(); }
  g.fillStyle = 'rgba(20,18,12,.4)'; for (let i = 0; i < 260; i++) g.fillRect(r() * 1024, r() * 1024, 2, 2);   // rivets and fasteners
  JX.camo = tex(c); JX.camo.wrapS = JX.camo.wrapT = THREE.RepeatWrapping; JX.camo.anisotropy = ANISO; return JX.camo;
}
function jxMetalTex() {
  if (JX.metal) return JX.metal; const c = canvas(1024, 1024), g = c.getContext('2d'), r = rng(1968);
  g.fillStyle = '#b9bdbd'; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(${r() < 0.5 ? '255,255,255' : '60,64,66'},${0.04 + r() * 0.06})`; g.fillRect(Math.floor(r() * 16) * 64, Math.floor(r() * 16) * 64, 64 * (1 + Math.floor(r() * 3)), 64 * (1 + Math.floor(r() * 2))); }   // panels of slightly different sheen
  g.strokeStyle = 'rgba(40,44,46,.45)'; g.lineWidth = 1.2; for (let x = 0; x < 1024; x += 64) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 1024); g.stroke(); } for (let y = 0; y < 1024; y += 128) { g.beginPath(); g.moveTo(0, y); g.lineTo(1024, y); g.stroke(); }
  g.fillStyle = 'rgba(30,32,34,.35)'; for (let x = 4; x < 1024; x += 64) for (let y = 6; y < 1024; y += 12) g.fillRect(x, y, 1.5, 1.5);
  JX.metal = tex(c); JX.metal.wrapS = JX.metal.wrapT = THREE.RepeatWrapping; JX.metal.anisotropy = ANISO; return JX.metal;
}
function jxDecal(texture, w, h, x, y, z, rx, ry = 0, rz = 0) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: texture, transparent: true, alphaTest: 0.4, side: THREE.DoubleSide, roughness: 0.5, polygonOffset: true, polygonOffsetFactor: -3 })); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); return m; }
function idTriTex() { const c = canvas(128), g = c.getContext('2d'); g.beginPath(); g.moveTo(64, 8); g.lineTo(122, 116); g.lineTo(6, 116); g.closePath(); g.fillStyle = '#111'; g.fill(); g.beginPath(); g.moveTo(64, 26); g.lineTo(108, 106); g.lineTo(20, 106); g.closePath(); g.fillStyle = '#f2b623'; g.fill(); return tex(c); }
function egyRoundelTex() { const c = canvas(128), g = c.getContext('2d'); for (const [r, col] of [[62, '#c8241c'], [42, '#ffffff'], [22, '#151515']]) { g.fillStyle = col; g.beginPath(); g.arc(64, 64, r, 0, 6.283); g.fill(); } return tex(c); }
function egyFlagTex() { const c = canvas(96, 72), g = c.getContext('2d'); g.fillStyle = '#c8241c'; g.fillRect(0, 0, 96, 24); g.fillStyle = '#fff'; g.fillRect(0, 24, 96, 24); g.fillStyle = '#151515'; g.fillRect(0, 48, 96, 24); return tex(c); }
const jxGlass = () => JX.glass || (JX.glass = new THREE.MeshStandardMaterial({ color: 0x223442, metalness: 0.9, roughness: 0.08, transparent: true, opacity: 0.88, envMapIntensity: 1.6 }));
const jxDark = () => JX.dark || (JX.dark = new THREE.MeshStandardMaterial({ color: 0x2a2b2b, metalness: 0.7, roughness: 0.45 }));
const jxBurnt = () => JX.burnt || (JX.burnt = new THREE.MeshStandardMaterial({ color: 0x6f5a46, metalness: 0.8, roughness: 0.35 }));
function mirageModel() {
  const skin = new THREE.MeshStandardMaterial({ map: jxCamoTex(), metalness: 0.15, roughness: 0.58 }), g = new THREE.Group(), add = (geo, mat, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); g.add(m); return m; };
  // the fuselage, tail to radome, and the pitot boom
  add(jxLathe([[0.5, -7.2], [0.56, -6.9], [0.63, -6.2], [0.67, -4], [0.69, -1], [0.67, 1.5], [0.61, 3], [0.53, 4.2], [0.43, 5.2], [0.31, 6.2], [0.17, 7.0], [0.05, 7.6], [0, 7.7]], 56, 1.06, 0.93), skin);
  add(new THREE.CylinderGeometry(0.025, 0.035, 1.1, 8).rotateZ(Math.PI / 2), jxDark(), 8.2, 0, 0);
  // the canopy and its frame
  { const c = add(new THREE.SphereGeometry(1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), jxGlass(), 4.2, 0.46, 0); c.scale.set(1.35, 0.44, 0.38); const fr = add(new THREE.TorusGeometry(0.36, 0.025, 6, 24, Math.PI), jxDark(), 4.6, 0.46, 0); fr.rotation.y = Math.PI / 2; }
  // the intakes along the sides with their half-cone shock bodies
  for (const sd of [-1, 1]) { const duct = add(new THREE.CylinderGeometry(0.34, 0.38, 4.0, 24, 1, false, 0, Math.PI).rotateZ(Math.PI / 2), skin, 1.0, 0.05, sd * 0.6); duct.rotation.x = sd > 0 ? -Math.PI / 2 : Math.PI / 2;
    add(new THREE.ConeGeometry(0.2, 0.75, 20).rotateZ(-Math.PI / 2), jxDark(), 3.25, 0.05, sd * 0.66); }
  // the delta wing (the right half apart: it is what the missile tears away), the elevons' hinge lines in the paint
  const wingPts = [[1.9, 0.55], [-5.0, 4.1], [-5.7, 4.1], [-6.25, 0.55]];
  add(jxPlate(wingPts.map(([x, z]) => [x, -z]), 'xz', 0.08, 0.08), skin, 0, -0.22, 0);
  const wingR = new THREE.Mesh(jxPlate(wingPts, 'xz', 0.08, 0.08), skin); wingR.position.y = -0.22; g.add(wingR);
  // the fin, the nozzle and its burnt-metal ring
  add(jxPlate([[-2.9, 0.4], [-6.0, 3.5], [-6.85, 3.5], [-7.05, 0.4]], 'xy', 0.07, 0.07), skin);
  add(new THREE.CylinderGeometry(0.47, 0.52, 0.8, 32, 1, true).rotateZ(Math.PI / 2), jxBurnt(), -7.5, 0, 0); add(new THREE.CircleGeometry(0.44, 24).rotateY(-Math.PI / 2), jxDark(), -7.3, 0, 0);
  // the drop tanks under the wings
  for (const sd of [-1, 1]) add(jxLathe([[0, 1.6], [0.16, 1.2], [0.24, 0.4], [0.24, -0.9], [0.14, -1.6], [0, -1.8]], 20), skin, -2.4, -0.62, sd * 2.0);
  // the markings: Stars of David on the wings (above and below) and the intakes, yellow triangles on the wings
  const rt = roundelTex(), tt = idTriTex();
  g.add(jxDecal(rt, 1.8, 1.8, -3.9, -0.12, -2.6, -Math.PI / 2), jxDecal(rt, 1.8, 1.8, -3.9, -0.32, -2.6, Math.PI / 2));
  wingR.add(jxDecal(rt, 1.8, 1.8, -3.9, 0.1, 2.6, -Math.PI / 2), jxDecal(rt, 1.8, 1.8, -3.9, -0.1, 2.6, Math.PI / 2), jxDecal(tt, 1.1, 1.0, -1.6, 0.1, 1.9, -Math.PI / 2, 0, Math.PI / 2));
  g.add(jxDecal(tt, 1.1, 1.0, -1.6, -0.12, -1.9, -Math.PI / 2, 0, Math.PI / 2));
  g.add(jxDecal(rt, 0.9, 0.9, 0.3, 0.1, 0.99, 0), jxDecal(rt, 0.9, 0.9, 0.3, 0.1, -0.99, 0, Math.PI));
  g.traverse((m) => { if (m.isMesh) { m.castShadow = SHADOWS; onLayer1(m); } }); g.visible = false; scene.add(g); return { g, wingR };
}
function migModel() {
  const skin = new THREE.MeshStandardMaterial({ map: jxMetalTex(), metalness: 0.72, roughness: 0.34 }), g = new THREE.Group(), add = (geo, mat, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); g.add(m); return m; };
  // the fuselage, open at the nose round its intake, the shock cone in it, the spine down the back
  add(jxLathe([[0.5, -6.6], [0.56, -6.2], [0.6, -5], [0.62, -2], [0.62, 0], [0.6, 2], [0.56, 3.5], [0.5, 5], [0.46, 6.3], [0.45, 6.6], [0.4, 6.62], [0.38, 6.2]], 56), skin);
  add(new THREE.ConeGeometry(0.24, 0.95, 24).rotateZ(-Math.PI / 2), jxDark(), 6.75, 0, 0);
  { const sp = add(new THREE.SphereGeometry(1, 28, 12), skin, -0.6, 0.48, 0); sp.scale.set(4.6, 0.32, 0.24); }
  { const c = add(new THREE.SphereGeometry(1, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), jxGlass(), 3.55, 0.44, 0); c.scale.set(0.95, 0.38, 0.33); }
  // the tailed delta: wings, tailplanes, the tall swept fin and the ventral fin
  for (const sd of [-1, 1]) { add(jxPlate([[1.05, 0.5], [-2.95, 3.6], [-3.45, 3.6], [-3.6, 0.5]].map(([x, z]) => [x, z * sd]), 'xz', 0.07, 0.06), skin, 0, -0.12, 0);
    add(jxPlate([[-4.5, 0.45], [-6.0, 1.75], [-6.4, 1.75], [-6.45, 0.45]].map(([x, z]) => [x, z * sd]), 'xz', 0.05, 0.05), skin, 0, -0.05, 0); }
  add(jxPlate([[-2.5, 0.45], [-5.6, 2.95], [-6.35, 2.95], [-6.55, 0.45]], 'xy', 0.07, 0.06), skin);
  add(jxPlate([[-5.0, -0.4], [-6.1, -1.0], [-6.4, -1.0], [-6.3, -0.4]], 'xy', 0.05, 0.04), skin);
  add(new THREE.CylinderGeometry(0.45, 0.5, 0.7, 32, 1, true).rotateZ(Math.PI / 2), jxBurnt(), -6.9, 0, 0); add(new THREE.CircleGeometry(0.42, 24).rotateY(-Math.PI / 2), jxDark(), -6.65, 0, 0);
  // the missiles on the pylons under the wings (one of them fired in the film)
  const rail = []; for (const sd of [-1, 1]) { const m = add(new THREE.CylinderGeometry(0.06, 0.06, 2.6, 10).rotateZ(Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xd9d6cc, roughness: 0.5 }), -1.3, -0.42, sd * 2.4); rail.push(m); }
  // Egypt's roundels on the wings and the nose, its flag on the fin
  const et = egyRoundelTex(), ft = egyFlagTex();
  for (const sd of [-1, 1]) { g.add(jxDecal(et, 1.4, 1.4, -1.8, -0.04, sd * 2.4, -Math.PI / 2), jxDecal(et, 1.4, 1.4, -1.8, -0.2, sd * 2.4, Math.PI / 2), jxDecal(et, 0.7, 0.7, 2.2, 0.05, sd * 0.585, 0, sd > 0 ? 0 : Math.PI)); }
  g.add(jxDecal(ft, 0.9, 0.68, -5.4, 2.0, 0.08, 0), jxDecal(ft, 0.9, 0.68, -5.4, 2.0, -0.08, 0, Math.PI));
  g.userData.rail = rail;
  g.traverse((m) => { if (m.isMesh) { m.castShadow = SHADOWS; onLayer1(m); } }); g.visible = false; scene.add(g); return g;
}
/* the parachute: a round canopy of twenty-eight gores, white and orange in turn, its skirt scalloped between the lines, the lines running
   down to four risers - and under it the pilot, hanging upright, his hands up on the risers */
function chuteModel() {
  const g = new THREE.Group(), cn = new THREE.Group(); g.add(cn); g.userData.canopy = cn;
  const N = 28, R = 4.0, H0 = 7.4, rows = 14, pos = [], col = [], idx = [];
  for (let j = 0; j <= rows; j++) { const v = j / rows, phi = v * Math.PI * 0.46; for (let i = 0; i <= N * 4; i++) { const a = i / (N * 4) * Math.PI * 2, gi = Math.floor(i / 4) % N, f = (i % 4) / 4, sc = 1 - 0.07 * Math.sin(f * Math.PI) * v * v;   // between two lines the cloth bellies out and its hem scallops
      const rr = R * Math.sin(phi) * sc * (1 + 0.035 * Math.sin(f * Math.PI)), y = H0 + R * 0.62 * Math.cos(phi) - (v > 0.92 ? (v - 0.92) * 2 : 0);
      pos.push(Math.cos(a) * rr, y, Math.sin(a) * rr); const w = gi % 2 ? [0.93, 0.92, 0.88] : [0.86, 0.36, 0.12]; const sh = 0.9 + 0.1 * Math.cos(f * Math.PI * 2); col.push(w[0] * sh, w[1] * sh, w[2] * sh); } }
  const W = N * 4 + 1; for (let j = 0; j < rows; j++) for (let i = 0; i < N * 4; i++) { const a = j * W + i; idx.push(a, a + W, a + 1, a + 1, a + W, a + W + 1); }
  const cg = new THREE.BufferGeometry(); cg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); cg.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); cg.setIndex(idx); cg.computeVertexNormals();
  const can = new THREE.Mesh(cg, new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, roughness: 0.85 })); cn.add(can);
  { const vent = new THREE.Mesh(new THREE.RingGeometry(0.15, 0.32, 20).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x3a3a36, side: THREE.DoubleSide })); vent.position.y = H0 + R * 0.62 - 0.01; cn.add(vent); }
  // the lines: from each seam at the hem down to the four risers' ends, then the risers to the harness on his shoulders
  const L = [], riser = (k) => V3((k % 2 ? 0.22 : -0.22), 2.0, (k < 2 ? 0.12 : -0.12));
  for (let i = 0; i < N; i++) { const a = i / N * Math.PI * 2, top = V3(Math.cos(a) * R * Math.sin(Math.PI * 0.46), H0 + R * 0.62 * Math.cos(Math.PI * 0.46) - 0.08, Math.sin(a) * R * Math.sin(Math.PI * 0.46)); const k = (Math.cos(a) > 0 ? 1 : 0) + (Math.sin(a) > 0 ? 0 : 2); L.push(top, riser(k)); }
  cn.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(L), new THREE.LineBasicMaterial({ color: 0x8c8a80, transparent: true, opacity: 0.85 })));
  const rs = []; for (let k = 0; k < 4; k++) rs.push(riser(k), V3(k % 2 ? 0.2 : -0.2, 1.45, (k < 2 ? 0.04 : -0.04)));
  g.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(rs), new THREE.LineBasicMaterial({ color: 0x4a4a3c })));
  // the pilot: the game's own detailed soldier, hanging in the harness
  const rig = new Rig('f', FAL_W); scene.remove(rig.root); rig.gun.visible = false; rig.root.visible = true; try { nsShow(rig, true); } catch (e) {} rig.root.position.set(0, 0, 0); g.add(rig.root); g.userData.rig = rig;
  g.traverse((m) => onLayer1(m)); g.visible = false; scene.add(g); return g;
}
/* each frame the pilot hangs straight, legs a little forward, and his hands are on the risers above his shoulders */
const _chA = V3();
function chutePose(c, t) {
  const R = c.userData.rig; if (!R) return; R.pose('idle', t * 0.3, 0); R.hips.rotation.x = 0.12; R.kR && (R.kR.rotation.x = -0.25); R.kL && (R.kL.rotation.x = -0.2);
  for (const [sh, el, sd, pole] of [[R.sR, R.eR, -1, V3(-1, -0.2, 0.3).normalize()], [R.sL, R.eL, 1, V3(1, -0.2, 0.3).normalize()]]) ikArm(sh, el, _chA.copy(sh.position).add(V3(-sd * 0.02 * 0, 0.52, 0.08)), pole);
  R.root.updateMatrixWorld(true);
}
/* the film of the Mirage: the chase from behind the MiG, the launch, the hit alongside in slow motion, the ejection, the parachute.
   The order is always the same: the chase, the launch, the missile across the gap, the hit, the wing torn off - and only then the pilot. */
const MG_T = { launch: 7.0, hit: 7.8, eject: 8.6, gap: 70 };
function mirageFilm() {
  if (!AIR.models) { AIR.models = { m: mirageModel(), mig: migModel(), chute: chuteModel() }; }
  const M = AIR.models, H = V3(nearX(-350), 330, 175), d = V3(0.9, 0, -0.45).normalize(), sp = 92;
  M.m.g.visible = true; M.m.wingR.visible = true; M.mig.visible = true; for (const r of M.mig.userData.rail || []) r.visible = true; M.chute.visible = false; if (M.m.wingR.parent !== M.m.g) { M.m.g.attach(M.m.wingR); } M.m.wingR.position.set(0, 0, 0); M.m.wingR.rotation.set(0, 0, 0);
  const ev = AIR.ev = { t: 5.4, H, d, sp, hit: false, vy: 0, roll: 0, crashed: false, missile: null, wingV: V3(), smokeT: 0, chuteOn: false, ejected: false };
  updMirage(0);
  const side = V3(-d.z, 0, d.x), sunSd = side.x * SUN.dir.x + side.z * SUN.dir.z > 0 ? 1 : -1, UP = V3(0, 1, 0);
  const mp = () => M.m.g.position.clone(), gp = () => M.mig.position.clone(), chT = () => (ev.chuteOn ? ev.chP.clone() : mp().add(V3(0, 3, 0)));
  const at = (o, f, s2, u) => o.clone().addScaledVector(d, f).addScaledVector(side, s2 * sunSd).addScaledVector(UP, u);
  const sm = (a, b, x) => smooth(a, b, x);
  let shots;
  shots = [
    // behind and above the MiG: it fills the left of the frame, the Mirage small and sharp seventy metres ahead
    { d: 1.6, cam: (u) => ({ p: at(gp(), -15 + u * 2, 3.2, 3.2), l: mp().add(V3(0, -0.5, 0)), fov: 30 }) },
    // beside the MiG's wing as the missile leaves it: the camera turns to follow the missile across the gap
    { d: 1.6, slow: 0.5, cam: (u) => ({ p: at(gp(), -2 + u * 6, 7, 1.4), l: ev.missile ? ev.missile.m.position.clone().lerp(mp(), 0.35) : mp(), fov: 36 }) },
    // alongside the Mirage, slow: the missile arrives, the fireball, the wing torn off and tumbling away
    { d: 2.6, slow: 0.35, cam: (u) => ({ p: at(mp(), -7 + u * 2, 17, 2.6 - u * 2), l: mp().addScaledVector(d, -2), fov: 40 }) },
    // behind the falling jet: the canopy goes, the seat fires the pilot clear
    { d: 1.6, slow: 0.4, cam: (u) => ({ p: at(mp(), -13, 6, 7 - u * 2), l: chT().lerp(mp(), 0.4), fov: 46 }) },
    // the parachute opening high over the canal, pulling away until the jet is a burning streak far below
    { d: 4.6, slow: 0.5, cam: (u) => { const c = chT(), up = ev.chuteOn ? 2.6 * Math.min(1, ev.chT / 1.2) : 0; return { p: at(c, -3 + u * 5, 11 + u * 16, up - 1 + u * 7), l: c.clone().add(V3(0, up * (1 - u * 0.6) - u * 4, 0)), fov: 44 + u * 8 }; } },
  ];

  playCine({ vid: 'mz_mirage',
    title: 'מעל תעלת סואץ · 14:00',
    shots,
    caps: [[0.1, '<b>תצפית:</b> מיראז׳ שלנו מעל התעלה! מיג מצרי על הזנב שלו!', 1.6], [1.6, '<b>תצפית:</b> טיל! טיל באוויר!', 1.6], [3.3, '<b>תצפית:</b> פגיעה! הכנף נקרעה!', 2.2], [5.4, '<b>מ״פ:</b> הטייס נטש! יש מצנח!', 2.4], [9.6, '<b>מ״פ:</b> כולם להישאר במקורה, המטוסים חוזרים!', 2.2]],
    end: () => { M.mig.visible = false; },
  });
}
function updMirage(dt) {
  const ev = AIR.ev, M = AIR.models; ev.t += dt; const t = ev.t, T_HIT = MG_T.hit, d = ev.d;
  const mig = M.mig, g = M.m.g;
  if (!ev.hit) { const p = ev.H.clone().addScaledVector(d, ev.sp * (t - T_HIT)); g.position.copy(p); g.rotation.set(0, Math.atan2(-d.z, d.x), Math.sin(t * 1.3) * 0.15); g.updateMatrixWorld(true); }
  // the MiG seventy metres behind and a little above, nose on him; after the hit it pulls up and away
  { const p = (ev.hit ? ev.migAt.clone().addScaledVector(d, ev.sp * (t - T_HIT)) : g.position.clone()).addScaledVector(d, ev.hit ? 0 : -MG_T.gap).add(V3(0, ev.hit ? 0 : 3, 0)); if (ev.hit) { const k = t - T_HIT; p.add(V3(0, k * k * 6 + k * 10, 0)).addScaledVector(V3(-d.z, 0, d.x), -k * 14); } mig.position.copy(p); mig.rotation.set(0, Math.atan2(-d.z, d.x), ev.hit ? -0.8 : 0.08 + Math.sin(t * 1.1) * 0.06); if (ev.hit) mig.rotateZ(Math.min(0.5, (t - T_HIT) * 0.4)); }
  if (t > MG_T.launch && !ev.missile && !ev.hit) {
    const m = new THREE.Group(), wm = new THREE.MeshStandardMaterial({ color: 0xdedbd2, roughness: 0.45, metalness: 0.3 });
    m.add(new THREE.Mesh(jxLathe([[0, 1.45], [0.06, 1.25], [0.085, 0.95], [0.085, -1.3], [0.07, -1.4]], 20), wm));   // the K-13: a slim body, a glass seeker
    m.add(new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 8), jxGlass())).position.x = 1.42;
    for (let k = 0; k < 4; k++) { const f = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.008, 0.2), wm); f.position.set(-1.15, 0, 0); f.rotation.x = k * Math.PI / 2; f.translateZ(0.13); m.add(f); const c2 = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.006, 0.1), wm); c2.position.set(0.95, 0, 0); c2.rotation.x = k * Math.PI / 2 + Math.PI / 4; c2.translateZ(0.1); m.add(c2); }
    const core = new THREE.Sprite(new THREE.SpriteMaterial({ map: FXT.flare, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, toneMapped: false, color: new THREE.Color(HDRK * 1.4, HDRK * 1.2, HDRK * 0.9) })); core.position.x = -1.6; core.scale.setScalar(1.3); m.add(core);
    const fl = new THREE.Sprite(new THREE.SpriteMaterial({ map: FXT.fire, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, toneMapped: false, color: new THREE.Color(HDRK * 1.0, HDRK * 0.55, HDRK * 0.18) })); fl.position.x = -2.3; fl.scale.set(2.6, 1.4, 1); m.add(fl);
    m.traverse((o) => onLayer1(o)); scene.add(m); ev.missile = { m, core, fl, from: mig.localToWorld(V3(-1.3, -0.42, 2.4)), last: null }; if (mig.userData.rail) mig.userData.rail[1].visible = false; sndRocket(mig.position);
  }
  if (ev.missile && !ev.hit) { const k = clamp((t - MG_T.launch) / (T_HIT - MG_T.launch), 0, 1), wp = M.m.wingR.localToWorld(V3(-2.4, 0, 2.3)), p = ev.missile.from.clone().addScaledVector(d, ev.sp * (t - MG_T.launch)).lerp(wp, k * k);
    const ms = ev.missile, m = ms.m; m.position.copy(p); { const q = new THREE.Quaternion().setFromUnitVectors(V3(1, 0, 0), wp.clone().sub(p).normalize()); m.quaternion.copy(q); }
    ms.core.scale.setScalar(1.1 + Math.random() * 0.5); ms.fl.scale.set(2.2 + Math.random() * 1.2, 1.1 + Math.random() * 0.5, 1);   // the motor flickers
    // the trail: fire laid all along the way it came, white-hot at the motor, orange, then grey smoke that swells and hangs
    const from = ms.last || p.clone(), seg = p.distanceTo(from), n = Math.min(24, Math.max(2, Math.ceil(seg / 0.8)));
    for (let q = 0; q < n; q++) { const at2 = from.clone().lerp(p, q / n); const f = FX.fire.get(); f.life = 0.28; f.s.position.copy(at2); f.s.scale.setScalar(1.4); f.upd = (o, u) => { o.s.scale.setScalar(1.4 * (1 - u * 0.5)); };
      if (q % 2 === 0) { const sm = FX.smoke.get(); sm.life = 4.5; sm.s.position.copy(at2); sm.s.material.color.set(0xeae6de); sm.upd = (o, u) => { o.s.scale.setScalar(0.8 + u * 5.5); o.s.material.opacity = 0.8 * (1 - u) * Math.min(1, u * 8); }; } }
    ms.last = p.clone(); }
  if (!ev.hit && t >= T_HIT) {
    ev.hit = true; ev.migAt = mig.position.clone().addScaledVector(d, MG_T.gap * 0); if (ev.missile) { scene.remove(ev.missile.m); ev.missile = null; } const p = M.m.wingR.localToWorld(V3(-2.4, 0, 2.3)); fxExplosion(p, 2.6); sndBoom(p, 1.8); FX.shake = Math.max(FX.shake, 0.3);
    scene.attach(M.m.wingR); ev.wingV.copy(d).multiplyScalar(ev.sp * 0.55).add(V3(0, 9, 0)).addScaledVector(V3(-d.z, 0, d.x), 14); ev.v = d.clone().multiplyScalar(ev.sp * 0.92).add(V3(0, -16, 0)); radio('תצפית', 'מיראז׳ נפגע!', 2);
  }
  if (ev.hit && !ev.crashed) {
    ev.v.y -= 9.8 * dt * 1.7; g.position.addScaledVector(ev.v, dt); ev.roll += dt * 2.6; g.rotation.set(0, Math.atan2(-d.z, d.x), ev.roll); g.rotateZ(-Math.atan2(-ev.v.y, Math.hypot(ev.v.x, ev.v.z)) * 0.0);
    const w = M.m.wingR; ev.wingV.y -= 9.8 * dt; w.position.addScaledVector(ev.wingV, dt); w.rotation.x += dt * 4; w.rotation.y += dt * 2.2;
    ev.smokeT -= dt; if (ev.smokeT <= 0) { ev.smokeT = 0.025; const s = FX.smoke.get(); s.life = 7; s.s.position.copy(g.position); s.s.material.color.set(0x1d1a17); s.upd = (q, u) => { q.s.scale.setScalar(3 + u * 12); q.s.material.opacity = 0.85 * (1 - u); }; const f = FX.fire.get(); f.life = 0.5; f.s.position.copy(g.position); f.s.scale.setScalar(7.5); f.upd = (q, u) => q.s.scale.setScalar(7.5 * (1 - u * 0.6)); }
    if (t > MG_T.eject && !ev.chuteOn) { { const q = FX.fire.get(); q.life = 0.35; q.s.position.copy(g.position).add(V3(0, 1.2, 0)); q.s.scale.setScalar(3); q.upd = (o, u) => o.s.scale.setScalar(3 * (1 - u)); const sm2 = FX.smoke.get(); sm2.life = 2.5; sm2.s.position.copy(g.position).add(V3(0, 1.5, 0)); sm2.s.material.color.set(0xcfc8bc); sm2.upd = (o, u) => { o.s.scale.setScalar(1 + u * 4); o.s.material.opacity = 0.7 * (1 - u); }; }
      ev.chuteOn = true; ev.chT = 0; ev.chP = g.position.clone().add(V3(0, 3, 0)); ev.chV = V3(d.x * 20, 24, d.z * 20); M.chute.visible = true; M.chute.scale.setScalar(1); M.chute.userData.canopy.scale.setScalar(0.02); }
    const gy = groundAt(g.position.x, g.position.z); if (g.position.y < Math.max(gy, 0) + 1) { ev.crashed = true; ev.crashP = g.position.clone(); ev.crashP.y = Math.max(gy, 0); fxExplosion(ev.crashP, 3.2); sndBoom(ev.crashP, 3); g.visible = false; D.smoke.push(smokeColumn(ev.crashP.x, ev.crashP.z, 36, true)); FX.shake = Math.max(FX.shake, 0.6); }
    if (w.position.y < Math.max(groundAt(w.position.x, w.position.z), 0)) { w.visible = false; }
  }
  if (ev.chuteOn) { const c = M.chute; ev.chV.multiplyScalar(Math.max(0, 1 - dt * 1.4)); ev.chP.addScaledVector(ev.chV, dt); ev.chP.y -= 4.2 * dt; ev.chP.x += 1.2 * dt; c.position.copy(ev.chP); ev.chT += dt; { const k = clamp((ev.chT - 0.4) / 0.9, 0, 1), kk = k * k * (3 - 2 * k); c.userData.canopy.scale.set(Math.max(0.02, kk * (1 + 0.03 * Math.sin(t * 3))), Math.max(0.02, kk), Math.max(0.02, kk * (1 + 0.03 * Math.sin(t * 3 + 1)))); } chutePose(c, t); c.rotation.z = Math.sin(t * 0.9) * 0.08;
    if (ev.chP.y < Math.max(groundAt(ev.chP.x, ev.chP.z), 0) + 0.3) { c.visible = false; ev.chuteOn = false; feed('הטייס נחת מאחורי המעוז', 'good'); } }
  if (ev.crashed && !ev.chuteOn && t > 20) { AIR.ev = null; M.m.wingR.visible = true; }
}
