
/* ================= the test range =================
   A practice ground out in the desert, away from every chapter. On the firing line: the MAG, the Browning .50 and the 106 mm recoilless gun,
   and our eight men at their places. Out in front: a gallery of every kind of enemy soldier standing still to be looked at, a line of foxholes
   whose men shoot back, enemy vehicles to knock out, and cover to move between. To the west the park of our vehicles - the tank can be
   driven, the jeep's MG manned - and to the south a pond with the rafts, the pontoons, the rubber boat and the roller bridge.
   Nothing hurts here (GOD): not the player, not his men, not his vehicles; ammunition never runs out, and whatever falls stands up again. */
const RG = { o: { x: 12000, z: 0 }, msgs: {} };
const RGW = toWorld(RG.o);
const RG_STAGES = [{ title: 'מטווח ניסויים', sub: 'כל הנשקים, כל כלי הרכב, כל סוגי האויב. האויב יורה, אבל שום דבר לא פוגע בכם.', goal: 'מטווח חופשי · אין נזק, התחמושת לא נגמרת' }];
const RG_POND = { x: -50, z: 98, rx: 32, rz: 22 };
const rgPondD = (lx, lz) => Math.hypot((lx - RG_POND.x) / RG_POND.rx, (lz - RG_POND.z) / RG_POND.rz);   // under 1.15 is water
const RG_TANK = [-58, 47];
const RG_LOOP = { x: 104, z: 22, rx: 27, rz: 17 };   // the driving loop
// the gallery: one of each, standing still to be looked at (and shot: he is back on his feet a few seconds later)
const RG_GALLERY = [['rifle', 'idle', 'רובאי'], ['smg', 'aim', 'תת־מקלען'], ['lmg', 'crouch', 'מקלען'], ['sniper', 'aim', 'צלף'], ['rpg', 'rpg', 'אר־פי־ג׳י'], ['atgm', 'crouch', 'מפעיל סאגר'], ['flame', 'idle', 'להביורן'], ['rifle', 'run', 'מסתער']];
// the foxholes that shoot back
const RG_FOX = [[-42, -100, 'rifle'], [-30, -106, 'lmg'], [-18, -98, 'smg'], [-6, -104, 'rpg'], [6, -99, 'sniper'], [18, -105, 'atgm'], [30, -98, 'rifle'], [42, -103, 'smg']];
const RG_FRIENDS = [[-31, 'אבי'], [-27, 'יוסי'], [-15, 'מוטי'], [-9, 'שלומי'], [9, 'דני'], [15, 'גיל'], [27, 'חיים'], [31, 'רמי']];
// the enemy park, out in the field: knocked out, each burns a while and stands there whole again
const RG_EVEH = [['t55', 62, -62], ['jeep', 66, -42], ['jeep', 58, -26], ['atgun', 48, -8]];

function rgH(x, z) {
  const lx = x - RG.o.x, lz = z - RG.o.z, R = Math.hypot(lx, lz);
  let h = 2.2 + 0.3 * fbm(lx / 70, lz / 70, 2) + 0.1 * fbm(lx / 9, lz / 9, 2);
  mix3(PAL.sandD, PAL.sandL, 0.35 + 0.35 * smooth(-0.3, 0.4, fbm(lx / 50, lz / 50, 3))); mixIn(PAL.rock, 0.16 * smooth(0, 0.5, noise(lx / 22, lz / 22)));
  // the stop butt: an earth bank behind the enemy's line
  if (Math.abs(lx) < 150) { const d = Math.abs(lz + 150 + 4 * Math.sin(lx / 23)), b = (1 - smooth(0, 10, d)) * (1 - smooth(115, 150, Math.abs(lx))); h += 6.5 * b; mixIn(PAL.sandR, 0.6 * b); }
  // low hills all round the horizon
  { const f = smooth(170, 420, R); if (f > 0) { const ridge = 1 - Math.abs(noise(lx / 160, lz / 160)); h += f * (14 + 30 * ridge * ridge + 10 * fbm(lx / 80, lz / 80, 3)); mixIn(PAL.rock, f * 0.45); } }
  // the firing point and the vehicle park: trodden, lighter sand
  { const d = Math.max(Math.abs(lx) - 40, Math.abs(lz - 44) - 8); if (d < 4) mixIn(PAL.fresh, 0.35 * (1 - smooth(0, 4, d))); }
  { const d = Math.max(Math.abs(lx + 58) - 9, Math.abs(lz - 18) - 38); if (d < 5) { mixIn(PAL.yard, 0.5 * (1 - smooth(0, 5, d))); h = lerp(h, 2.2, 0.7 * (1 - smooth(0, 5, d))); } }
  // the pond
  { const p = rgPondD(lx, lz); if (p < 1.6) { const s = smooth(1.55, 0.95, p); h = lerp(h, -1.6 - 1.4 * smooth(0.9, 0.2, p), s); mixIn(PAL.wet, smooth(1.55, 1.05, p)); if (p < 1.05) mix3(PAL.wet, PAL.deep, smooth(1.05, 0.5, p)); } }
  return h;
}
/* a sign on two stakes */
function rgSign(text, lx, lz, rot, w = 1.6, y = 1.25) {
  const [x, z] = RGW(lx, lz), g0 = groundAt(x, z), c = Math.cos(rot), s = Math.sin(rot), hw = w * 0.38;
  sign(text, 'plain', x, g0 + y, z, rot, w);
  const st = new THREE.Mesh(build([-1, 1].map((sd) => [G.box(0.07, y, 0.07), 0x6b5236, M4(sd * hw * c, y / 2 - 0.05, -sd * hw * s)])), MAT.vc); st.position.set(x - s * 0.03, g0, z - c * 0.03); scene.add(SH(onLayer1(st)));
}
/* the recoilless gun on its tripod in a sandbag horseshoe; the same gun the survival mode uses, here always shown */
const RG_WOOD = new THREE.MeshStandardMaterial({ color: 0x7a6440, vertexColors: true, roughness: 0.92 });   // the shell crates, in plain wood
function rgRclPost(lx, lz) {
  const [x, z] = RGW(lx, lz), g0 = groundAt(x, z), b = 0, gx = x, gz = z - 0.9;
  const arc = []; for (let a = -100; a <= 100.1; a += 12.5) { const r = THREE.MathUtils.degToRad(a); arc.push([x + Math.sin(r) * 2.3, z - Math.cos(r) * 2.3]); } bagWall(arc, 4, g0 - 0.05);
  const pivot = new THREE.Group(); pivot.position.set(gx, g0 + 1.08, gz); pivot.rotation.order = 'YXZ'; pivot.rotation.y = Math.PI - b; pivot.add(new THREE.Mesh(RCL_GEO, MAT.vcMetal)); scene.add(SH(onLayer1(pivot)));
  const legs = new THREE.Mesh(RCL_LEGS, MAT.vcMetal); legs.position.set(gx, g0, gz); legs.rotation.y = Math.PI - b; scene.add(SH(onLayer1(legs)));
  // the shell crates: the packed crate, a little warmer than the army's olive (3_world.js propSet), else the old box in plain wood
  if (!propSet('crate', [-1, 1].map((sd) => propM(x + sd * 1.7, g0, z + 0.9, sd * 0.25)), [0xe6d2b0, 0xe6d2b0])) for (const sd of [-1, 1]) { const c = new THREE.Mesh(CRATE_GEO, RG_WOOD); c.position.set(x + sd * 1.7, g0, z + 0.9); c.rotation.y = sd * 0.25; scene.add(SH(onLayer1(c))); }
  const P0 = { id: 'RGR', name: 'תותח ללא רתע', x, z, g: g0, bearing: 0, fx: 0, fz: -1, occupant: null, stand: [gx, gz + 0.4], legs, mag: { pivot, yaw0: Math.PI, yaw: Math.PI, pitch: 0, belt: 1, reload: 0, heat: 0, big: true } };
  POSTS.push(P0); return P0;
}
/* a modelled jeep standing in the range: ours (f), theirs (e) or burnt out (x) */
function rgJeep(lx, lz, rot, paint, parent = null) {
  const r = vehModel('jeep', paint); SH(onLayer1(r.g));
  if (parent) { parent.add(r.g); return r; }
  const [x, z] = RGW(lx, lz), y = groundAt(x, z); r.g.position.set(x, y, z); r.g.rotation.y = rot; scene.add(r.g);
  addCollider(x, z, 2.05, 0.95, rot, y + 1.5); coverBox(x, z, 2.05, 0.95, rot, 1.3); return r;
}
function rgBuild() {
  const C = CHAP.range, O = RG.o; C.ground = makeGround({ x0: O.x - 240, x1: O.x + 240, z0: O.z - 260, z1: O.z + 200, step: 3, h: rgH }); GROUND = C.ground;
  const BAGS = [], sv = BATCH.bag; BATCH.bag = BAGS; const k0 = COVER.length; C.slots = [];
  // the firing line: a sandbag wall with gaps, the three guns in it, a flag
  for (const [a, b] of [[-38, -25.5], [-18.5, -3.4], [3.4, 18.5], [25.5, 38]]) bagWall([RGW(a, 40), RGW(b, 40)], 4);
  C.posts = [post('RG1', 'מא״ג', ...RGW(-22, 40), 0, true), rgRclPost(0, 40), post('RG3', 'בראונינג', ...RGW(22, 40), 0, 'heavy')];
  { const [x, z] = RGW(-40, 43); flag(x, z, 'il', 7, Math.PI * 0.5); }
  rgSign('קו הירי', -36, 45.5, 0, 1.4, 1.1); rgSign('מא״ג', -24.6, 42.4, 0, 0.9, 0.7); rgSign('תותח ללא רתע 106', 4.6, 42.8, 0, 1.4, 0.7); rgSign('בראונינג 0.5', 24.8, 42.4, 0, 1.1, 0.7);
  // cover to move between, from the firing line out to the gallery
  { const parts = []; for (const [lx, lz, r] of [[-24, 26, 0.1], [-7, 23, -0.15], [11, 26, 0.2], [27, 21, 0], [-14, 4, 0.5], [16, -4, -0.3]]) { const [x, z] = RGW(lx, lz), g = groundAt(x, z) - 0.05; parts.push([G.box(2.6, 1.15, 0.62), 0xb9b2a2, M4(x, g + 0.575, z, 0, r, 0)], [G.box(2.7, 0.12, 0.7), 0xa8a191, M4(x, g + 0.06, z, 0, r, 0)]); addCollider(x, z, 1.3, 0.31, r, g + 1.15); coverBox(x, z, 1.3, 0.31, r, 1.15); }
    scene.add(SH(onLayer1(new THREE.Mesh(build(parts), MAT.vc)))); }
  for (const pts of [[[-18, 13], [-13, 12.5]], [[2, 11], [7, 10.5], [8, 7.5]], [[19, 14], [23.5, 13]], [[-4, -1], [1, -1.5]], [[26, 2], [29, 0], [29, -3]]]) bagWall(pts.map(([x, z]) => RGW(x, z)), 5);
  { const r = rgJeep(-27, 3, 0.4, 'f'); vehDamage(r, true); wreckFire(r.g, VEH_FIRE.jeep, 1); }   /* knocked out: in its paint, a little broken, burning */ { const [x, z] = RGW(23, -12); placeTank(x, z, 200, TANK_BURNT); }
  for (const [lx, lz] of [[12, 3], [-9, 7], [-31, 30]]) { const [x, z] = RGW(lx, lz); fieldDrums(x, z, 5); }
  { const hh = [], hm = mdlHas('hedgehog');   // the Czech hedgehogs: the packed rusty steel ones (3_world.js propSet), else the old beams; the same colliders
    for (const [lx, lz, r] of [[-36, 8, 0.3], [-34, 12, 1.2], [34, 8, 2.1], [36, 12, 0.6], [-38, -4, 0.9], [38, -7, 1.7]]) { const [x, z] = RGW(lx, lz); if (hm) hh.push(propM(x, groundAt(x, z), z, r)); else { const m = new THREE.Mesh(HEDGEHOG_GEO, MAT.vc); m.position.set(x, groundAt(x, z), z); m.rotation.y = r; scene.add(SH(onLayer1(m))); } addCollider(x, z, 0.6, 0.6, 0, groundAt(x, z) + 1.2); }
    propSet('hedgehog', hh); }
  { const [x, z] = RGW(-33, -14); smallHut(x, z, 5, 4, 2.6, '#c8b896', 0x857660, true); }
  // the gallery: a sign at the feet of each man
  RG_GALLERY.forEach(([, , label], i) => rgSign(label, -21 + i * 6, -17, 0, 1.25, 0.7));
  rgSign('גלריית האויב · לא יורים', -26.5, -17, 0, 2.2, 1.6);
  // the enemy's line: foxholes facing the firing line, a trench of sandbags between them
  for (const [lx, lz, kind] of RG_FOX) { const [x, z] = RGW(lx, lz); const s = foxhole(x, z, 0, 1, C.slots); s.kind = kind; s.rgT = 99; }
  for (let i = 0; i < RG_FOX.length - 1; i++) { const a = RG_FOX[i], b = RG_FOX[i + 1]; bagWall([RGW(a[0] + 2, a[1] - 1.4), RGW(b[0] - 2, b[1] - 1.4)], 3); }
  // our vehicles, nose to the east, each with its name
  // (the APCs and the trucks are gone from the game: only jeeps and tanks)
  C.jeepRec = rgJeep(-58, 34, 0, 'f'); C.jeep = C.jeepRec.g; if (VEH_DATA.m2hi && C.jeepRec.mg) { C.jeepRec.mg.userData.mesh.geometry = vehGeo('m2hi', 0, 'body', 'f'); C.jeepRec.mg.userData.mesh.material = MAT.gunHi; C.jeepRec.mgHi = true; }   // the jeep you man: its .50 in full detail rgSign('ג׳יפ סיור · 0.5 · E', -50.5, 35.6, Math.PI / 2, 1.4, 1.1);
  rgJeep(-58, 24, 0.12, 'f'); rgSign('ג׳יפ סיור', -50.5, 25.6, Math.PI / 2, 1.4, 1.1);
  { const [x, z] = RGW(-58, 10); vehicle(TANK_GEO, x, z, 0, 3.4, 1.9, 2.4); rgSign('טנק מגח', -50.5, 11.6, Math.PI / 2, 1.4, 1.1); }
  rgSign('טנק לנהיגה · E', -50.5, RG_TANK[1] + 1.6, Math.PI / 2, 1.4, 1.1); rgSign('כלי הרכב שלנו', -48, 58, 0, 2, 1.6);
  // the pond: the raft with a jeep on it, three pontoons with a tank, the rubber boat, an enemy boat; the roller bridge runs into it from the east bank
  C.float = [];
  const afloat = (m, lx, lz, rot, bob = 1) => { const [x, z] = RGW(lx, lz); m.position.set(x, 0.02, z); m.rotation.y = rot; scene.add(SH(onLayer1(m))); C.float.push({ m, y: m.position.y, bob, ph: lx * 0.7 + lz }); return m; };
  { const g = new THREE.Group(); g.add(new THREE.Mesh(RAFT_GEO, MAT.vc)); const j = rgJeep(0, 0, 0, 'f', g); j.still = true; j.g.position.set(1.4, 1.08, 0); afloat(g, -60, 88, 0.15, 0.6); }
  { const g = new THREE.Group(); for (let k = -1; k <= 1; k++) { const p = new THREE.Mesh(PONT_GEO, MAT.vc); p.position.set(k * FM_SEGL, 0.18, 0); g.add(p); } const tr = vehModel('magach', 'f'), t = tr.g; tr.still = true; t.position.set(0, 0.82, 0); g.add(t); afloat(g, -46, 110, -0.1, 0.35); }
  afloat(new THREE.Mesh(RBOAT_GEO, MAT.vc), -32, 92, 0.9, 1.2);
  { const b = new THREE.Mesh(FLOT_GEO, MAT.boatWood); b.scale.setScalar(BOAT_S); afloat(b, -72, 106, 2.4, 1.1); }
  for (let k = 0; k < 4; k++) { const [x, z] = RGW(-4 - k * 6.2, 82), gy = Math.max(groundAt(x, z) + 0.75, 0.15), m = new THREE.Mesh(BR_SEG, MAT.vc); m.position.set(x, gy, z); scene.add(SH(onLayer1(m))); if (k === 3) { const f = new THREE.Mesh(BR_FRONT, MAT.vc); f.position.set(x - 3.1, gy, z); scene.add(onLayer1(f)); } }
  rgSign('אסדה עם ג׳יפ', -60, 74.5, 0, 1.3, 1.0); rgSign('דוברות עם טנק', -44, 74.5, 0, 1.4, 1.0); rgSign('סירת גומי', -24, 86, -0.6, 1.1, 1.0); rgSign('גשר הגלילים', -2, 77, 0, 1.3, 1.1); rgSign('סירת אויב', -86, 98, Math.PI / 2, 1.2, 1.0);
  rgSign('אסדות וכלי שיט', -50, 70, 0, 1.9, 1.6);
  // the ground round it: stones and dry bushes, kept off the lanes
  { const ok = (x, z) => { const lx = x - O.x, lz = z - O.z; if (rgPondD(lx, lz) < 1.35) return false; if (Math.abs(lx) < 46 && lz > -125 && lz < 50) return false; if (lx > -70 && lx < -42 && lz > -25 && lz < 66) return false; if (lx > 40 && lx < 80 && lz > -75 && lz < 5) return false; if (Math.abs(lx - RG_LOOP.x) < RG_LOOP.rx + 8 && Math.abs(lz - RG_LOOP.z) < RG_LOOP.rz + 8) return false; return true; };
    dressArea(O.x - 220, O.x + 220, O.z - 240, O.z + 180, ok, 1960, 0.9);
    const bl = scatterIn(LITE ? 18 : 30, O.x - 200, O.x + 200, O.z - 220, O.z + 170, 1961, ok, (x, z, r) => [x, z, 1.2 + r() * 1.6, r() * 6, rockCol(r), 0.3, 0.7]); instScatter(BOULDER_G, bl); boulders(bl); }
  BATCH.bag = sv; if (BAGS.length) scene.add(bagMesh(BAGS)); C.covers = COVER.slice(k0); for (const c of C.covers) c.y = groundAt(c.x, c.z);
  // the driving loop east of the firing line: one of our jeeps and an Egyptian T-55 going round and round, to watch the wheels and the
  // tracks turn and the dust and the smoke they leave
  C.drive = [['jeep', 'f', RG_LOOP.rx, RG_LOOP.rz, 8.5, 0], ['t55', 'e', RG_LOOP.rx - 7, RG_LOOP.rz - 6.5, 5, Math.PI]].filter((d) => VEH_DATA[d[0]]).map(([n, paint, rx, rz, v, a0]) => {
    const r = vehModel(n, paint); r.crew = true; scene.add(SH(onLayer1(r.g))); const pts = []; for (let i = 0; i <= 72; i++) { const a = a0 + (i / 72) * Math.PI * 2; pts.push(RGW(RG_LOOP.x + Math.cos(a) * rx, RG_LOOP.z + Math.sin(a) * rz)); }
    return { r, pts, L: pathLen(pts), s: 0, v, pv: { g: r.g, half: n === 'jeep' ? [1.6, 2, 0.75] : [3.0, 2.3, 1.4], fwdX: true, hdV: null } }; });
  rgSign('מסלול נהיגה', RG_LOOP.x - RG_LOOP.rx - 4, RG_LOOP.z + 4, Math.PI / 2, 1.4, 1.1);
  // the enemy's vehicles, out in the field facing the firing line
  const mk = { t55: { kind: 't55', geo: T55_HULL, turGeo: T55_TUR, turAt: [0.3, 1.42, 0], half: [3.2, 2.3, 1.75], armor: 0, hp: 100, shoots: true }, jeep: () => { const r = vehModel('jeep', 'e'); scene.add(SH(onLayer1(r.g))); return { kind: 'jeep', g: r.g, mgM: r.mg, mgOff: 0, mg: true, half: [2.05, 2.0, 0.95], armor: 0.3, hp: 80 }; }, atgun: { kind: 'atgun', geo: ATGUN_GEO, half: [1.4, 1.5, 0.9], armor: 0.15, hp: 60 } };
  C.eveh = RG_EVEH.map(([k, lx, lz]) => { const [x, z] = RGW(lx, lz), [px, pz] = RGW(0, 40); const v = addVeh(Object.assign({ mode: 'range', side: 'e', vmax: 0 }, typeof mk[k] === 'function' ? mk[k]() : mk[k])); v.at = [x, z, Math.atan2(px - x, pz - z)]; return v; });
}
function rgSetup() {
  const C = CHAP.range; fieldSetupCommon(C, 0); RG.msgs = {}; C.t = 0; C.ck = 0;
  Object.assign(P, { smokeMax: 4, smoke: 4, gren: 9 });
  for (const v of C.eveh) { vehRevive(v); v.shown = true; v.g.visible = true; v.path = null; v.stop = undefined; v.fireCd = rand(5, 9); vehPose(v, v.at[0], v.at[1], v.at[2]); }
  // the tank stands at the head of the park; the player walks up to it to drive
  const [tx, tz] = RGW(...RG_TANK); tankStart([[tx, tz], [tx + 1, tz]], (x, z) => [x, z], 0, []);
  Object.assign(TANK, { free: true, fx: tx, fz: tz, hd: Math.PI / 2, hdV: Math.PI / 2, vmax: 7, thr: 0, turn: 0, bounds: [RG.o.x - 130, RG.o.x + 130, RG.o.z - 135, RG.o.z + 64] });
  P.mode = 'rifle'; vm.visible = true; P.crouch = false; P.ads = 0; P.ride = null; $('#tsight').classList.remove('on'); if (C.jeepRec.mg) C.jeepRec.mg.rotation.set(0, 0, 0);
  for (const p of C.posts) { p.occupant = null; const m = p.mag; if (!m) continue; m.reload = 0; m.belt = m.cap || 1; m.pitch = 0; m.yaw = m.yaw0; m.pivot.rotation.set(0, m.yaw0, 0); if (m.beltM) beltPose(m); }
  const [px, pz] = RGW(0, 52); P.pos.set(px, hAt(px, pz), pz); P.yaw = 0; P.pitch = -0.02;
  fieldFriends(RG_FRIENDS.map(([lx, name]) => { const [x, z] = RGW(lx, 41.4); return { name, x, z, fx: 0, fz: -1 }; }));
  C.gal = RG_GALLERY.map(() => ({ e: null, down: -99 })); for (const s of C.slots) s.rgT = 99;
  rgUpd(0);
}
function rgSpawnGallery(i) {
  const C = CHAP.range, [kind, pose] = RG_GALLERY[i], [x, z] = RGW(-21 + i * 6, -20), e = spawnEnemy(x, z, kind === 'atgm' ? 'rpg' : kind, null, null); if (!e) return;
  e.atgm = kind === 'atgm'; e.state = 'film'; e.sz = null; e.slot = null; e.dormant = false; e.heading = 0; e.stance = pose === 'crouch' ? 'crouch' : 'stand'; e.anim = 0.35; e.rig.pose(pose, e.anim, 0); e.sync(); e.rgG = C.gal[i]; C.gal[i].e = e;
}
function rgUpd(dt) {
  const C = CHAP.range; C.t += dt;
  for (let i = DIRQ.length - 1; i >= 0; i--) if (DIRQ[i] && GAME.t >= DIRQ[i].at) { const q = DIRQ.splice(i, 1)[0]; q.fn(); }
  // the range never runs dry
  P.reserve = 160; P.gren = 9; P.smoke = 4; P.hp = 100; for (const p of C.posts) if (p.mag && !p.mag.big) p.mag.belt = p.mag.cap;
  // the rafts and boats ride the water
  for (const f of C.float) { f.m.position.y = f.y + Math.sin(GAME.t * 1.3 + f.ph) * 0.05 * f.bob; f.m.rotation.x = Math.sin(GAME.t * 1.1 + f.ph) * 0.02 * f.bob; f.m.rotation.z = Math.sin(GAME.t * 1.6 + f.ph * 1.3) * 0.025 * f.bob; }
  // the jeep's MG, when manned: it follows the eyes
  if (P.ride && P.ride.mg && C.jeepRec.mg) { const mg = C.jeepRec.mg; mg.rotation.y = wrapPi(P.yaw + Math.PI / 2 - C.jeep.rotation.y); mg.rotation.z = clamp(P.pitch, -0.35, 0.6); }
  // round the driving loop
  for (const d of C.drive || []) { d.s = (d.s + d.v * dt) % d.L; const [x, z, hd] = pathAt(d.pts, d.s); vehPose(d.pv, x, z, hd); if (d.r.tur) d.r.tur.rotation.y = 0.5 * Math.sin(C.t * 0.25); }
  // twice a second: whoever fell stands up again
  C.ck -= dt; if (C.ck > 0) return; C.ck = 0.5; szEnemyCleanup();
  C.gal.forEach((g, i) => { const up = g.e && g.e.alive && g.e.rgG === g; if (up) { g.down = -99; return; } if (g.down < 0) g.down = C.t; if (C.t - g.down > 4 || !g.e) { g.down = -99; rgSpawnGallery(i); } });
  for (const s of C.slots) { if (s.used) { s.rgT = 0; continue; } s.rgT += 0.5; if (s.rgT < 6) continue; const e = fSlotPlace(s, s.kind === 'atgm' ? 'rpg' : s.kind, 'rg', { dormant: false }); if (e) { e.atgm = s.kind === 'atgm'; e.rgG = null; if (e.atgm) e.rpgCd = rand(9, 16); } }
  for (const v of C.eveh) if (!v.alive && v.burnT > 9) { vehRevive(v); vehPose(v, v.at[0], v.at[1], v.at[2]); v.fireCd = rand(5, 9); }
}
/* getting into the tank and out of it, onto the jeep's MG and off it */
function rgIntoTank() { P.mode = 'tank'; P.yaw = TANK.hd + Math.PI; P.pitch = -0.03; P.crouch = false; P.ads = 0; vm.visible = false; TANK.thr = 0; TANK.turn = 0; sndClick(500, 0.2); hint('rg-tank', `נוהגים בטנק: ${K('W')}${K('S')} קדימה ואחורה, ${K('A')}${K('D')} פנייה. ${K('לחיצה ממושכת')} מקלע 0.5, ${K('G')} פגז, לחצן ימני כוונת התותחן, ${K('C')} לתוך הצריח.`, 9); }
function rgOutOfTank() {
  const hd = TANK.hd, px = TANK.fx + Math.cos(hd) * 2.9, pz = TANK.fz - Math.sin(hd) * 2.9;
  P.mode = 'rifle'; P.ads = 0; P.crouch = false; INPUT.tAds = false; $('#tads').classList.remove('on'); $('#tsight').classList.remove('on'); TANK.thr = 0; TANK.turn = 0;
  P.pos.set(px, hAt(px, pz), pz); P.vy = 0; vm.visible = true; sndClick(500, 0.2);
}
function rgOnJeep() { const C = CHAP.range, j = C.jeep, mg = C.jeepRec.mg, pv = vehPivot('jeep'); j.updateMatrixWorld(true); P.ride = { pos: () => { const b = mg.rotation.y, D = 1.08, S = 0.24; return j.localToWorld(V3(pv[0] - D * Math.cos(b) - S * Math.sin(b), 0.98, pv[2] + D * Math.sin(b) - S * Math.cos(b))); }, eye: 1.78, mg: true, novm: true, gun: mg, muzzle: () => mg.localToWorld(V3(mg.userData.tip, 0.1, 0)) }; P.pos.copy(P.ride.pos()); P.yaw = -0.5; P.pitch = -0.03; vm.visible = false; sndClick(600, 0.2); }
function rgOffJeep() { const C = CHAP.range, j = C.jeep.position, px = j.x + 1.5, pz = j.z + 2.6; P.ride = null; P.crouch = false; P.pos.set(px, hAt(px, pz), pz); P.vy = 0; vm.visible = true; sndClick(600, 0.2); }
function rgPrompt() {
  const C = CHAP.range;
  if (P.ride) return { text: '<kbd>E</kbd> לרדת מהג׳יפ', label: 'לרדת', fn: rgOffJeep };
  if (P.mode !== 'rifle') return null;
  if (TANK.g && Math.hypot(TANK.g.position.x - P.pos.x, TANK.g.position.z - P.pos.z) < 4.6) return { text: '<kbd>E</kbd> לעלות לטנק ולנהוג בו', label: 'לטנק', fn: rgIntoTank };
  const j = C.jeep.position; if (Math.hypot(j.x - P.pos.x, j.z - P.pos.z) < 3.4) return { text: '<kbd>E</kbd> לעלות על המא״ג בג׳יפ', label: 'לג׳יפ', fn: rgOnJeep };
  return null;
}
function rgItems(items) {
  items.push(['go', 'מטווח ניסויים · אין נזק · התחמושת לא נגמרת']);
  if (P.mode === 'tank') items.push(['', `בטנק · ${K('E')} לרדת · ${K('C')} ${P.crouch ? 'החוצה מהצריח' : 'לתוך הצריח'}`]);
  else items.push(['', 'קו הירי: מא״ג, תותח ללא רתע, בראונינג · משמאל: הטנק והג׳יפ · מאחור: האסדות']);
  items.push(['next', `פגיעות: ${STATS.kills}`]);
}
function rgHints() { if (GAME.t > 1) hint('rg-intro', `<b>מטווח ניסויים.</b> שום דבר כאן לא פוגע בכם, בחיילים או בכלים, והתחמושת לא נגמרת. בעמדות האויב בקצה יורים עליכם; הגלריה באמצע רק עומדת. ${K('E')} ליד עמדה, טנק או ג׳יפ.`, 10); }
function rgMini(g, X, poly, dot, k) {
  const W = (pts) => pts.map(([x, z]) => RGW(x, z)), pond = []; for (let a = 0; a < 6.283; a += 0.3) pond.push([RG_POND.x + Math.cos(a) * RG_POND.rx * 1.12, RG_POND.z + Math.sin(a) * RG_POND.rz * 1.12]);
  miniField(g, X, poly, dot, k, { bg: 'rgba(170,150,116,.92)', polys: [[W(pond), 'rgba(28,70,86,.95)'], [W([[-150, -158], [150, -158], [150, -144], [-150, -144]]), 'rgba(140,110,80,.9)']], lines: [[W(Array.from({ length: 41 }, (_, i) => [RG_LOOP.x + Math.cos(i * 0.157) * RG_LOOP.rx, RG_LOOP.z + Math.sin(i * 0.157) * RG_LOOP.rz])), 2, 'rgba(120,104,78,.9)'], [W([[-38, 40], [38, 40]]), 2.5, 'rgba(110,96,70,.95)'], [W([[-44, -103], [44, -103]]), 2.5, 'rgba(150,70,50,.9)']] });
}
function rgEnd() { return ['מטווח ניסויים', 'במטווח אין נזק.', [[STATS.kills, 'פגיעות']]]; }
CHAP.range = { stages: RG_STAGES, st: () => 0, cp: () => 0, upd: rgUpd, obj: () => null, hints: rgHints, items: rgItems, mini: rgMini, restore: fieldRestore, end: rgEnd, tank: true, prompt: rgPrompt, snapOK: () => false,
  tankPrompt: () => ({ text: `<kbd>E</kbd> לרדת מהטנק · ${K('C')} ${P.crouch ? 'החוצה מהצריח' : 'לתוך הצריח'}`, label: 'לרדת' }), tankAct: rgOutOfTank,
  tod: () => 11 * 60 - START_MIN + CHAP.range.t / 30,
  build: () => chapterBuild(CHAP.range, rgBuild), setup: rgSetup, clock: 'מטווח ניסויים · ללא נזק', toast: ['מטווח ניסויים', 'כל הנשקים, כל כלי הרכב, כל סוגי האויב. האויב יורה, אבל שום דבר לא פוגע'], start: () => fieldStart('range') };
