
/* ================= chapter 3: the great tank battle, 14 October 1973 =================
   The Egyptian army comes out of its bridgeheads with hundreds of tanks. You command a tank and drive it yourself. Each position on the
   ridge takes an armoured assault: a broad front of T-55s rolling up out of the valley with a few infantrymen riding on them. The assault
   is broken when its last tank burns; then the order comes to reinforce the next position along the ridge, where they broke through.
   Almost all armour: about ten tanks and twenty men on each position (fewer on the easy level, more on the hard one). */
const AM = { o: { x: -7000, z: -7000 }, stage: 0, msgs: {}, zi: 0, zs: 'go', ech: 0, nAct: 0 };
const AMW = toWorld(AM.o);
/* four positions along the ridge, south to north: where they are, how big, the tanks already inside the line when we get there (breach),
   and the assault's echelons: [tanks, seconds after the position is clear]. Two men ride on every tank of an echelon (and two come with
   every tank of a breach), so the infantry is always twice the tanks */
const AM_Z = [
  { x: 0, z: 0, r: 70, name: 'עמדה "אבירם"', waves: [[6, 0], [4, 30]] },
  { x: 14, z: 250, r: 70, name: 'עמדה "ברק"', breach: 2, waves: [[5, 4], [3, 32]] },
  { x: -18, z: 500, r: 70, name: 'עמדה "גלעד"', breach: 2, waves: [[5, 4], [3, 32]], sagger: true },
  { x: 6, z: 740, r: 75, name: 'עמדה "דקל"', breach: 3, waves: [[5, 4], [4, 30]], sagger: true } ];
const AM_STAGES = AM_Z.map((z, i) => ({ title: i === 0 ? 'הרכס' : `${z.name} נפרצה`, sub: i === 0 ? 'ארבעה־עשר באוקטובר, שבע בבוקר. מאות טנקים מצריים עולים מהגשרים אל הרכסים, ואתם הטנק בעמדה. ההסתערות נשברת כשאחרון הטנקים שלה בוער.' : `${z.name} נפרצה: טנקים מצריים כבר בתוך העמדה, והצוותים שם מחזיקים בשיניים. גז לשם — נקו אותה ושברו את ההסתערות הבאה.`, goal: i === 0 ? 'שברו את ההסתערות: השמידו את הטנקים לפני שהם נכנסים לעמדה. W/S נסיעה, A/D סיבוב' : `${z.name}: נקו את העמדה ושברו את ההסתערות` }));
// the level sets the size of every assault (the infantry follows the tanks, two to one) and how well their gunners shoot
const amDi = () => Math.max(0, DIFF.indexOf(diff));
const amN = (n) => Math.max(1, Math.round(n * [0.7, 1, 1.3][amDi()]));
const MARK_GEO = build([[G.cyl(0.06, 0.08, 2.2, 6), 0x3a3a34, M4(0, 1.1, 0)], [G.box(0.02, 0.5, 0.8), 0xe8641e, M4(0, 1.9, 0.4)]]);
const amCrest = (lz) => 8 * Math.sin(lz / 180) + 4 * Math.sin(lz / 67 + 1.3);   // the ridge line wanders a little
/* the ground in two parts: the land itself (amNat - or the map, when the chapter has one) and what the battle needs exactly on top of it (amCarve) */
function amNat(x, z) {
  const lx = x - AM.o.x, lz = z - AM.o.z, cx = lx - amCrest(lz);
  let h = 1.1 * fbm(lx / 170, lz / 170, 3) + 0.35 * fbm(lx / 28, lz / 28, 2);
  const ridge = 13 * Math.exp(-((cx / 46) ** 2)); h += ridge; h += cx > 0 ? 3 * smooth(40, 180, cx) * (0.6 + 0.4 * fbm(lx / 90, lz / 90, 2)) : 0;
  mix3(PAL.sandL, PAL.sandD, smooth(-0.35, 0.45, fbm(lx / 120, lz / 120, 3) + 0.5 * fbm(lx / 18, lz / 18, 2))); mixIn(PAL.rock, smooth(5, 12, ridge) * 0.4);
  if (cx < -80) { const d = 1 - Math.abs(noise(lx / 90 + 7, lz / 140)); h += 2.6 * d * d * d * smooth(-80, -220, cx); const w = Math.abs(lx + 560 + 40 * Math.sin(lz / 120)); if (w < 20) { h -= 2.2 * (1 - smooth(5, 20, w)); mixIn(PAL.sandD, 0.5 * (1 - smooth(4, 16, w))); } mixIn([0.5, 0.44, 0.34], 0.25 * smooth(0.2, 0.6, noise(lx / 60, lz / 60))); }
  return h;
}
function amCarve(x, z, h) {
  const lx = x - AM.o.x, lz = z - AM.o.z, cx = lx - amCrest(lz);
  // dunes where no tank drives: behind the ridge (past the track along its back), south and north of the four positions, and far out west
  // past the Egyptian masses; the valley the assaults come up stays open ground
  { const k = Math.max(smooth(130, 230, cx), smooth(-200, -300, lz), smooth(930, 1030, lz), smooth(-1180, -1350, lx)); if (k > 0) h += dunes(x, z, k, Math.max(0, lx - 260, -1150 - lx, -220 - lz, lz - 920)); }
  // the positions: berms of sand to hide a tank behind, churned ground, the track along the back of the ridge
  for (const Z of AM_Z) { const dx = lx - Z.x, dz = lz - Z.z, d = Math.hypot(dx, dz); if (d < Z.r + 20) { mixIn([0.47, 0.41, 0.32], 0.35 * (1 - smooth(Z.r - 10, Z.r + 15, d)));
    for (const oz of [-28, 0, 28]) { const bz = Math.abs(dz - oz); if (bz < 10) h += 1.9 * Math.exp(-(((dx + 10) / 3.4) ** 2)) * (1 - smooth(5, 10, bz)); } } }
  { const d = Math.abs(cx - 38); if (d < 5) mixIn([0.52, 0.46, 0.36], 0.55 * (1 - smooth(2, 5, d))); }
  return h;
}
/* the wrecks on the field are tanks and jeeps only, like everything else that drives in this war: a T-55 knocked out in the first week,
   or a jeep burnt out on the road - each with its collider and cover, sooted, crooked and smouldering */
function amWreck(name, x, z, rot, seed) {
  const r = rng(seed), rec = vehModel(name, name === 'magach' ? 'f' : 'e'), m = rec.g, g0 = groundAt(x, z), [hx, hz, h] = name === 'jeep' ? [2.05, 0.95, 2.0] : [3.6, 1.8, 2.6];
  vehDamage(rec, true); rec.dead = true; rec.crew = false; m.position.set(x, g0, z); m.rotation.y = rot; wreckTilt(m, r); scene.add(SH(onLayer1(m)));
  addCollider(x, z, hx, hz, rot, g0 + h); coverBox(x, z, hx, hz, rot, Math.min(2.2, h)); wreckFire(m, VEH_FIRE[name], name === 'jeep' ? 0.85 : 1.4); return m;
}
function amBuild() {
  const C = CHAP.armor; C.ground = makeGround({ x0: AM.o.x - 1150, x1: AM.o.x + 260, z0: AM.o.z - 220, z1: AM.o.z + 920, step: 3.2, h: mapH('armor', amNat, amCarve), map: 'armor', vegOk: (x, z) => { const lx = x - AM.o.x, lz = z - AM.o.z; return !AM_Z.some((Z) => Math.hypot(lx - Z.x, lz - Z.z) < 36) && Math.abs(lz - 366) > 6; }, grass: 'sand', sand: true, grassOk: (x, z) => Math.abs(z - AM.o.z - 366) > 6 }); GROUND = C.ground;
  const BAGS = [], sv = BATCH.bag; BATCH.bag = BAGS; const k0 = COVER.length; C.slots = [];
  const L = (x, z) => [x - AM.o.x, z - AM.o.z], inZone = (lx, lz) => AM_Z.some((Z) => Math.hypot(lx - Z.x, lz - Z.z) < 22), ok = (x, z) => { const [lx, lz] = L(x, z); return !inZone(lx, lz) && !C.slots.some((s) => Math.hypot(s.x - x, s.z - z) < 5); };
  // Sagger and bazooka nests in front of the northern positions
  const nb = []; C.nests = []; AM_Z.forEach((Z, zi) => { if (!Z.sagger) return; for (const [dx, dz] of [[-420, -30], [-460, 20], [-390, 45], [-500, -10]]) { const [wx, wz] = AMW(Z.x + dx, Z.z + dz), s = bushNest(wx, wz, 1, 0, C.slots, 'S' + zi, 'atgm', nb, Math.random); s.zi = zi; C.nests.push(s); } });
  const X0 = AM.o.x - 1140, X1 = AM.o.x + 250, Z0 = AM.o.z - 210, Z1 = AM.o.z + 910;
  instScatter(ROCK_G, scatterIn(LITE ? 320 : 760, X0, X1, Z0, Z1, 701, ok, (x, z, r) => [x, z, 0.2 + r() ** 3 * 1.2, r() * 6, rockCol(r), 0.2, 0.55]));
  instScatter(BUSH_G, scatterIn(LITE ? 280 : 680, X0, X1, Z0, Z1, 702, ok, (x, z, r) => [x, z, 0.35 + r() * 0.6, r() * 6, dryBush(r), 0, 0.72]).concat(nb));
  { const bl = scatterIn(LITE ? 40 : 80, X0, X1, Z0, Z1, 703, ok, (x, z, r) => [x, z, 1.2 + r() * 1.8, r() * 6, rockCol(r), 0.3, 0.72]); instScatter(BOULDER_G, bl); boulders(bl); }
  desertFlora(X0, X1, Z0, Z1, 7200, ok, 1, [[-90, -150], [-90, 880]].map(([x, z]) => AMW(x, z)).concat([[70, 880], [70, -150]].map(([x, z]) => AMW(x, z))));   // agaves, cacti, saguaros and hawks (3_world.js)
  dressArea(X0, X1, Z0, Z1, ok, 710, 0.9, 0.06);
  // wrecks of the first week (our Magachs, their T-55s), a road with burnt-out jeeps and telegraph poles across the valley, ruined huts, the supply jeeps behind the ridge
  for (const [x, z, b] of [[-420, -150, 80], [-760, 120, 300], [-300, 330, 40], [-520, 610, 120], [-260, 820, 200]]) { const [wx, wz] = AMW(x, z); placeTank(wx, wz, b, TANK_BURNT); }
  for (const [x, z, r] of [[-880, -60, 0.6], [-480, 400, 2.2], [-700, 700, 1.1]]) { const [wx, wz] = AMW(x, z); amWreck('t55', wx, wz, r, Math.round(x * 3 - z)); }
  roadRibbon([[-1140, 366], [250, 366]].map(([x, z]) => AMW(x, z)), 7, 'asphalt');
  for (const [x, sd, nm, r] of [[-1010, 1, 'jeep', 0.5], [-770, -1, 't55', 0.2], [-560, 1, 'jeep', -0.4], [-150, -1, 'jeep', 2.6], [130, 1, 't55', 2.9]]) { const [wx, wz] = AMW(x, 366 + sd * 8.5); amWreck(nm, wx, wz, r, 12117 + x); }
  powerLine([[-1140, 380], [250, 380]].map(([x, z]) => AMW(x, z)), 46, 7); roadPoles([[-1140, 366], [250, 366]].map(([x, z]) => AMW(x, z)), 40, 5);
  for (const [x, z] of [[-700, 360], [-300, 140]]) { const [wx, wz] = AMW(x, z); smallHut(wx, wz, 6, 5, 2.6, '#c8b796', 0x7d6e58, true); }
  for (const [x, z, r] of [[95, -40, 1.5], [105, 270, 1.6], [90, 520, 1.4], [100, 760, 1.5]]) { const [wx, wz] = AMW(x, z); vehicle(JEEP_GEO, wx, wz, r, 2.05, 0.95, 2.0); fieldDrums(wx + 6, wz + 4, 5); }
  for (const [x, z, s] of [[-1600, -300, 70], [-1800, 300, 90], [-1500, 800, 60], [400, -700, 30]]) { const [wx, wz] = AMW(x, z); smokeColumn(wx, wz, s, true); }
  // the zone markers: orange flags in a ring around each position, so it is clear where the line is held
  C.marks = AM_Z.map((Z) => { const items = []; for (let k = 0; k < 18; k++) { const a = k / 18 * Math.PI * 2, [wx, wz] = AMW(Z.x + Math.cos(a) * Z.r, Z.z + Math.sin(a) * Z.r); items.push([wx, wz, 1, a, 0xffffff, 0, 1]); } return instScatter(MARK_GEO, items, MAT.vc, false); });
  BATCH.bag = sv; if (BAGS.length) scene.add(bagMesh(BAGS)); C.covers = COVER.slice(k0); for (const c of C.covers) c.y = groundAt(c.x, c.z);
  // our tanks at the positions, and the Egyptian armour. A T-55's hit box takes in the whole of its turret, roof and all (the shared box
  // stops at 2.3 m, under the turret roof), and a second box the cupola and the commander standing in his hatch: a tank down behind a
  // berm with only its turret showing can always be hit where it is seen
  C.mates = []; AM_Z.forEach((Z, zi) => { for (const oz of [-28, 28]) { const v = addVeh({ mode: 'armor', side: 'f', kind: 'tank', geo: TANK_GEO, half: [3.4, 2.6, 1.9], guns: true, vmax: 0 }); v.zi = zi; v.at = [Z.x - 4, Z.z + oz]; C.mates.push(v); } });
  C.foes = []; for (let i = 0; i < 44; i++) { const v = addVeh({ mode: 'armor', kind: 't55', geo: T55_HULL, turGeo: T55_TUR, turAt: [0.3, 1.42, 0], half: [3.2, 2.3, 1.75], armor: 0, hp: 100, shoots: true, vmax: 4.6 }); v.half = [3.75, 2.8, 1.85]; v.box2 = [-0.8, 1.9, 2.7, 3.3, -1.25, 1.25]; C.foes.push(v); }
  AML.ring = amLockRing(); scene.add(AML.ring);
}
/* ---------- the assault: a broad front of T-55s rolls up out of the valley at the position, along fixed lanes from fixed starts, halting
   twice to fire; two men ride on each and jump off 250 m short of the line. A breach: tanks and their men already inside the line ---------- */
const amFree = () => CHAP.armor.foes.find((v) => !v.used || (!v.alive && !v.g.visible));   // a wreck that has gone is free again
function amMan(zi, x, z, tx, tz, rpg) { const e = fSpawnStreet(x, z, [[tx, tz]], rpg ? 'rpg' : 'rifle'); if (e) { e.sq = 'z' + zi; e.inZone = zi; e.amRet = false; } return e; }
function amSend(zi, n, ech, breach = false) {
  const Z = AM_Z[zi], r = rng(1000 + zi * 37 + ech * 11 + n);
  for (let i = 0; i < n; i++) { const v = amFree(); if (!v) break;
    v.used = true; v.zi = zi; v.ech = ech; v.ri = i; vehRevive(v, 100); v.shown = true; v.g.visible = true; v.sinkY = null; v.riders = breach ? 0 : 2; v.hold = 0; v.halts = [];
    if (breach) { const [wx, wz] = AMW(Z.x - 30 + r() * 36, Z.z - 40 + 80 * (i + 0.5) / n); v.path = null; vehPose(v, wx, wz, Math.PI / 2 + (r() - 0.5) * 1.2); v.stop = undefined; v.fireCd = 1.5 + r() * 3; v.inside = true; continue; }
    const lane = n > 1 ? -70 + 140 * i / (n - 1) : 0, tx = Z.x - 22 + r() * 26, tz = Z.z + clamp(lane * 0.5, -40, 40) + (r() - 0.5) * 10, x0 = Z.x - 640 - (i % 2) * 50 - r() * 30;
    v.path = [AMW(x0, Z.z + lane * 1.3), AMW(Z.x - 420, Z.z + lane + (r() - 0.5) * 20), AMW(Z.x - 190, Z.z + lane * 0.7 + (r() - 0.5) * 16), AMW(tx, tz)];
    v.vmax = 5.2 + r() * 0.8; v.ended = false; v.halts = [140 + r() * 60, 330 + r() * 60]; v.stop = v.halts.shift(); v.fireCd = 3 + r() * 5; v.inside = false; vehPose(v, ...v.path[0], Math.PI / 2);
  }
  if (breach) for (let k = 0; k < n * 2; k++) { const [x, z] = AMW(Z.x - 40 + r() * 55, Z.z - 45 + r() * 90), [tx, tz] = AMW(Z.x - 25 + r() * 30, Z.z - 40 + r() * 80); DIRQ.push({ at: GAME.t + k * 0.2, spawn: true, fn: () => amMan(zi, x, z, tx, tz, k % 4 === 1) }); }
}
function amFoes(dt) {
  const C = CHAP.armor; let n = 0;
  for (const v of C.foes) { if (!v.used || !v.g.visible) continue;
    if (!v.alive) { amSink(v, dt); continue; } n++;
    if (v.path && v.stop !== undefined && v.s >= v.stop - 0.6) { v.hold += dt; if (v.hold > 5) { v.hold = 0; v.stop = v.halts.length ? v.halts.shift() : undefined; } }
    // the riders jump down from the back deck when the tank is 250 m from the line, and run on to where it is going
    if (v.riders > 0 && v.path) { const Z = AM_Z[v.zi], p = v.g.position; if (Math.hypot(p.x - AM.o.x - Z.x, p.z - AM.o.z - Z.z) < 250) {
      const h = v.hdV, end = v.path[v.path.length - 1]; for (let k = 0; k < v.riders; k++) { const sd = k ? 1 : -1; amMan(v.zi, p.x + Math.cos(h) * 2.7 * sd - Math.sin(h) * 2, p.z - Math.sin(h) * 2.7 * sd - Math.cos(h) * 2, end[0] + sd * 4, end[1] + rand(-3, 3), (v.ri + k) % 4 === 1); } v.riders = 0; } }
  }
  for (const v of C.mates) if (!v.alive && v.g.visible) amSink(v, dt);
  AM.nAct = n;
}
/* only in this chapter: a knocked-out tank burns for half a minute, then its fire dies down and it settles into the sand in a cloud of
   dust and is gone - the wreck, its fire and its hit box (the moving tanks have no colliders of their own to free) */
function amSink(v, dt) {
  if (v.burnT < 30) return; const p = v.g.position, w = v.wreck;
  if (v.sinkY == null) { v.sinkY = p.y; if (w) w.k0 = w.k0 ?? w.k; for (let i = 0; i < 8; i++) dustPuff(V3(p.x + rand(-4, 4), 0, p.z + rand(-3, 3)), groundAt(p.x, p.z), 2.6, 1.5, 1); }
  const u = Math.min(1, (v.burnT - 30) / 4); p.y = v.sinkY - u * u * 3.8; if (w) w.k = w.k0 * Math.max(0.04, 1 - u * 1.6);
  if (Math.random() < dt * 5) dustPuff(V3(p.x + rand(-3, 3), 0, p.z + rand(-2, 2)), groundAt(p.x, p.z), 2, 1.2, 0.8);
  if (u >= 1) { v.g.visible = false; v.shown = false; v.sinkY = null; if (w) w.k = w.k0; if (v.tag) v.tag.visible = false; }
}
function amInZone(p, Z, pad = 0) { return Math.hypot(p.x - (AM.o.x + Z.x), p.z - (AM.o.z + Z.z)) < Z.r + pad; }
// how many of the enemy are inside the line of this position (tanks and men)
function amInside(zi) { const Z = AM_Z[zi]; let n = 0; for (const v of CHAP.armor.foes) if (v.used && v.alive && v.g.visible && amInZone(v.g.position, Z)) n++; for (const e of UNITS.enemies) if (e.alive && e.sz && !e.amRet && amInZone(e.pos, Z)) n++; return n; }
function amTanks(zi) { let n = 0; for (const v of CHAP.armor.foes) if (v.used && v.zi === zi && v.alive && v.g.visible) n++; return n; }
function amLeft(zi) { return amTanks(zi) + szAlive((e) => e.inZone === zi); }
// the assault's tanks still to come or still fighting, out of all it brings
function amAssault() { const Z = AM_Z[AM.zi]; let tot = 0, left = 0; Z.waves.forEach((w, k) => { const n = amN(w[0]); tot += n; if (k >= AM.ech) left += n; }); for (const v of CHAP.armor.foes) if (v.used && v.zi === AM.zi && v.ech >= 0 && v.alive && v.g.visible) left++; return [left, tot]; }
/* ---------- one route at a time: in a position the tank stays inside its ring of orange flags, and on the way to the next one, on the
   ridge between the two. The valley in front is where they come from, not somewhere to drive to ---------- */
function amKeep() {
  if (!TANK.free || !TANK.alive || CINE.on) return; const Z = AM_Z[AM.zi], lx = TANK.fx - AM.o.x, lz = TANK.fz - AM.o.z; let cx = Z.x, cz = Z.z, R = Z.r + 4;
  if (AM.zs === 'go' && AM.zi > 0) { const A = AM_Z[AM.zi - 1], dx = Z.x - A.x, dz = Z.z - A.z, t = clamp(((lx - A.x) * dx + (lz - A.z) * dz) / (dx * dx + dz * dz), 0, 1); cx = A.x + dx * t; cz = A.z + dz * t; R = Math.max(A.r, Z.r) + 4; }
  const ex = lx - cx, ez = lz - cz, d = Math.hypot(ex, ez); if (d <= R) return;
  TANK.fx = AM.o.x + cx + ex / d * R; TANK.fz = AM.o.z + cz + ez / d * R; TANK.speed *= 0.3;
  if (!AM.msgs.edge) { AM.msgs.edge = true; hint('am-edge' + AM.zs, AM.zs === 'go' ? 'סעו לאורך הרכס אל העמדה (◆): משם הם פרצו.' : 'הטנק מחזיק את העמדה: לא יוצאים מעבר לדגלים הכתומים. מכאן יורים בהם כשהם עולים מהעמק.', 6); }
}
/* ---------- the gunner's sight locks on: a tank near the cross-hairs and in plain view gets a red ring round it, and the shell goes to it.
   The lock lets go when the shell is fired (a moment later it takes the next tank), when the tank burns, or when it leaves the sight ---------- */
const AML = { v: null, t: 0, ck: 0, aim: null, ring: null };
function amLockRing() {
  const c = canvas(128), g = c.getContext('2d'), ring = (w, col) => { g.lineWidth = w; g.strokeStyle = col; g.beginPath(); g.arc(64, 64, 50, 0, 7); g.stroke(); for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2; g.beginPath(); g.moveTo(64 + Math.cos(a) * 38, 64 + Math.sin(a) * 38); g.lineTo(64 + Math.cos(a) * 61, 64 + Math.sin(a) * 61); g.stroke(); } };
  ring(12, 'rgba(0,0,0,0.5)'); ring(6, '#ff2a18');   // a dark rim under the red, so it reads on bright sand and on smoke alike
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex(c), transparent: true, depthTest: false, depthWrite: false, fog: false, toneMapped: false })); s.renderOrder = 9; s.visible = false; s.userData.dyn = true; s.frustumCulled = false; return onLayer1(s);
}
// a point of the tank the gun can see from here: the hull, else the turret, else its roof (a tank down behind a berm shows only that)
const AM_AIMP = [[0.1, 1.15, 0], [0.6, 2.2, 0], [0.6, 2.6, 0]], _amA = V3();
const amPt = (v, x, y, z) => (v.g.updateMatrix(), _amA.set(x, y, z).applyMatrix4(v.g.matrix));   // a point of the tank as it stands this frame (its group sits right in the scene)
function amSeePt(v, o) { for (const q of AM_AIMP) { const p = amPt(v, q[0], q[1], q[2]); if (losW(o.x, o.y, o.z, p.x, p.y, p.z) && los(o.x, o.y, o.z, p.x, p.y - 0.25, p.z)) return p.clone(); } return null; }
function amOff(v, o, f) { const d = amPt(v, 0.1, 1.4, 0).sub(o), L = d.length(); return Math.acos(clamp(d.dot(f) / L, -1, 1)); }
function amLockUpd(dt) {
  const L = AML, r = L.ring; if (!r) return;
  const on = P.mode === 'tank' && P.ads > 0.5 && TANK.alive && !CINE.on && GAME.state === 'play';
  if (!on || (L.v && (!L.v.alive || !L.v.g.visible))) L.v = null;
  if (on && TANK.gunT < 3.2) {
    const o = camera.position, f = camForward(V3()); L.ck -= dt;
    if (L.v) { if (amOff(L.v, o, f) > 0.1) L.v = null; else if (L.ck <= 0) { L.ck = 0.25; L.aim = amSeePt(L.v, o); if (!L.aim) L.v = null; } }
    if (!L.v && L.ck <= 0) { L.ck = 0.15; let best = null, ba = 0.055;
      for (const v of CHAP.armor.foes) { if (!v.used || !v.alive || !v.g.visible || v.g.position.distanceTo(o) > 1500) continue; const a = amOff(v, o, f); if (a < ba) { const p = amSeePt(v, o); if (p) { ba = a; best = v; L.aim = p; } } }
      if (best) { L.v = best; L.t = 0; L.ck = 0.25; hint('am-lock', `הכוונת <b>ננעלה</b> על טנק: הטבעת האדומה סביבו. ${TOUCH ? '<kbd>רימון</kbd>' : K('G')} — והפגז הולך אליו.`, 6); } }
  }
  if (!L.v) { r.visible = false; return; }
  // the ring wraps the tank as it shows from here: long side on, short head on, never under 46 pixels; it closes in on the tank as it locks
  L.t += dt; const v = L.v, c = amPt(v, 0.1, 1.4, 0).clone(), cp = camera.position, d = c.distanceTo(cp), side = Math.abs(Math.sin(v.hdV - Math.atan2(c.x - cp.x, c.z - cp.z)));
  const minS = 46 * 2 * d * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) / Math.max(200, renderer.domElement.clientHeight || 450);
  const s = Math.max(minS, (4.4 + 3.6 * side) * 1.35) * (1 + 1.4 * Math.max(0, 1 - L.t / 0.3));
  r.position.copy(c); r.scale.set(s, s, 1); r.material.opacity = 0.82 + 0.18 * Math.sin(L.t * 9); r.visible = true;
}
// the shell is away: it goes to the locked tank (to the part of it the gun sees), and the lock lets go
function amLockShot() { const L = AML, o = camera.position; let d = null; if (L.v && L.v.alive && L.v.g.visible) { const p = amSeePt(L.v, o) || L.aim; if (p) d = p.clone().sub(o).normalize(); } L.v = null; L.ck = 0; if (L.ring) L.ring.visible = false; return d; }
/* ---------- stages: one position each ---------- */
function amSetup(stage) {
  const C = CHAP.armor; fieldSetupCommon(C, stage); AM.msgs = {}; AML.v = null; if (AML.ring) AML.ring.visible = false;
  for (const v of VEH) if (v.mode === 'armor') { vehRevive(v); v.used = false; v.path = null; v.stop = undefined; v.ended = false; v.shown = v.side === 'f'; v.g.visible = v.shown; v.onEnd = null; v.speed = 0; v.sinkY = null; v.riders = 0; if (v.wreck && v.wreck.k0) v.wreck.k = v.wreck.k0; }
  for (const v of C.mates) { const [wx, wz] = AMW(...v.at); v.hdV = null; vehPose(v, wx, wz, -Math.PI / 2); }
  const Z = AM_Z[stage], start = stage === 0 ? [Z.x + 10, Z.z] : [AM_Z[stage - 1].x + 20, AM_Z[stage - 1].z + 30];
  tankStart([AMW(start[0], start[1]), AMW(start[0] - 1, start[1])], (x, z) => [x, z], 0, []); const [sx, sz] = AMW(...start); Object.assign(TANK, { free: true, fx: sx, fz: sz, hd: stage === 0 ? -Math.PI / 2 : 0, vmax: 7, bounds: [AM.o.x - 900, AM.o.x + 240, AM.o.z - 200, AM.o.z + 900] });
  P.mode = 'tank'; P.yaw = stage === 0 ? Math.PI / 2 : Math.PI; P.pitch = -0.03; P.crouch = false; TANK.hp = 100;
  fieldFriends([]); amStage(stage);
}
function amStage(i) {
  const C = CHAP.armor, Z = AM_Z[i]; fieldStage(C, i); AM.stage = i; AM.zi = i; AM.msgs = {}; C.t = 0; C.holdT = 0; AM.ech = 0;
  C.marks.forEach((m, k) => { m.visible = k === i; });
  if (i === 0) { AM.zs = 'intro'; DIRQ.push({ at: GAME.t + 0.3, fn: () => amIntroFilm() }); }
  else { AM.zs = 'go'; amSend(i, amN(Z.breach), -1, true); radio('מג״ד', `${Z.name} נפרצה! טנקים מצריים בתוך העמדה. סע לשם מיד ונקה אותה!`, 4.5); const m = C.mates.find((v) => v.zi === i && v.alive); if (m) vehDestroy(m, true); }
}
function amHold() { const C = CHAP.armor; AM.zs = 'hold'; C.holdT = 0; AM.ech = 0; radio('מג״ד', 'העמדה נקייה. הסתערות חדשה עולה מהעמק — שבור אותה לפני שהיא מגיעה לקו!', 3.6); }
// the assault is broken: the men it brought fall back into the valley (those out of sight are simply gone), and on to the next position
function amBroken() {
  const C = CHAP.armor, Z = AM_Z[AM.zi], zi = AM.zi; feed(`${Z.name} החזיקה · ההסתערות נשברה`, 'good'); TANK.hp = 100; radio('נהג', 'תיקנו מה שאפשר, יש פגזים. זזים!', 2.4);
  fieldDespawn((e) => e.inZone === zi || e.sq === 'S' + zi);
  for (const e of UNITS.enemies) if (e.alive && e.sz && (e.inZone === zi || e.sq === 'S' + zi)) { e.amRet = true; e.inZone = -1; e.path = [AMW(Z.x - 700, e.pos.z - AM.o.z)]; e.pi = 0; e.cov = null; }
  if (zi < AM_Z.length - 1) amStage(zi + 1); else if (!AM.msgs.end) { AM.msgs.end = true; AM.zs = 'done'; DIRQ.push({ at: GAME.t + 1.5, fn: amEndFilm }); }
}
function amUpd(dt) {
  const C = CHAP.armor, Z = AM_Z[AM.zi]; C.t += dt; C.allyK = [0.35, 0.25, 0.18][amDi()];   // our tanks on the ridge: steadier help on the easy level
  for (const v of C.mates) v.guns = v.zi === AM.zi;   // only the crews of this position fight it: the others along the ridge have their own battle
  if (Math.floor(C.t * 2) !== Math.floor((C.t - dt) * 2)) { szEnemyCleanup(); fieldDespawn((e) => e.amRet); }
  for (let i = DIRQ.length - 1; i >= 0; i--) if (DIRQ[i] && GAME.t >= DIRQ[i].at) { const q = DIRQ.splice(i, 1)[0]; q.fn(); }
  amFoes(dt); if (C.mass && C.mass.visible) amMass(true, dt); amKeep(); amLockUpd(dt);
  // Egyptian artillery keeps falling on the positions
  if (!CINE.on) { C.shT = (C.shT ?? 3) - dt; if (C.shT <= 0) { C.shT = rand(1.4, 3.4); const near = Math.random() < 0.35, p = near ? TANK.g.position.clone().add(V3(rand(-30, 30), 0, rand(-30, 30))) : V3(AM.o.x + Z.x + rand(-60, 60), 0, AM.o.z + Z.z + rand(-70, 70)); p.y = groundAt(p.x, p.z); if (near) sndWhistle(0.9); DIRQ.push({ at: GAME.t + 0.9, fn: () => { fxExplosion(p, 1.2); sndBoom(p, 1.1); if (TANK.alive && p.distanceTo(TANK.g.position) < 6) tankHit(p.clone(), false, 10); } }); } }
  const inside = amInside(AM.zi);
  if (AM.zs === 'go') {
    if (amInZone(TANK.g.position, Z)) { AM.zs = 'clear'; radio('תותחן', 'אנחנו בתוך העמדה! טנקים מצריים, קרוב!', 2.6); }
  } else if (AM.zs === 'clear') {
    if (inside === 0) amHold();
  } else if (AM.zs === 'hold') {
    C.holdT += dt;
    if (inside > 0 && !AM.msgs.br) { AM.msgs.br = true; radio('תצפית', 'הם בתוך העמדה! תשמיד אותם!', 2.4); } if (inside === 0) AM.msgs.br = false;
    if (AM.ech < Z.waves.length && C.holdT >= Z.waves[AM.ech][1]) { amSend(AM.zi, amN(Z.waves[AM.ech][0]), AM.ech); radio('תצפית', AM.ech === 0 ? 'טנקים יוצאים מהעשן בעמק! חזית רחבה, ישר עלינו!' : 'עוד גל טנקים! חי״ר רוכב עליהם!', 3); AM.ech++; if (Z.sagger && AM.ech === 1) C.nests.filter((s) => s.zi === AM.zi).slice(0, amDi() + 1).forEach((s) => fSlotSpawn('atgm', (q) => q === s, 'S' + AM.zi)); }
    if (AM.ech >= Z.waves.length && amTanks(AM.zi) === 0 && inside === 0) amBroken();
  }
  if (AM.zs !== 'intro' && AM.zs !== 'done') { const [left, tot] = amAssault(); meter(AM.zs === 'hold' ? `${Z.name} · שוברים את ההסתערות` : AM.zs === 'clear' ? `${Z.name} · נקו את העמדה` : `סעו אל ${Z.name}`, AM.zs === 'hold' ? 1 - left / tot : 0, AM.zs === 'hold' && inside > 0 ? 'warn' : ''); }
}
/* ---------- films ---------- */
// the opening film's mass: four dozen more T-55s out in the valley behind the first wave, rolling east in a broad front (one instanced mesh, seen only in the film)
const _amM4 = new THREE.Matrix4(), _amQ = new THREE.Quaternion(), _amOne = V3(1, 1, 1);
function amMass(on, dt = 0) {
  const C = CHAP.armor;
  if (!C.mass) { C.mass = VEH_DATA.t55 ? new THREE.InstancedMesh(vehMerged('t55', 2, 'e'), MAT.veh, 48) : new THREE.InstancedMesh(T55_HULL, MAT.vc, 48); C.mass.frustumCulled = false; C.mass.userData.dyn = true; C.mass.visible = false; SH(C.mass, true, false); scene.add(onLayer1(C.mass)); }
  if (on && !C.mass.visible) { const r = rng(7311); C.massP = []; for (let i = 0; i < 48; i++) { const row = i % 4; C.massP.push([-760 - row * 95 - r() * 40, -170 + ((i * 0.618034) % 1) * 800 + (r() - 0.5) * 24, 3.6 + r() * 0.8, (r() - 0.5) * 0.12]); } C.dustT = 0; }
  C.mass.visible = on; if (!on) return;
  C.massP.forEach((q, i) => { q[0] += q[2] * dt; const [x, z] = AMW(q[0], q[1]); _amQ.setFromAxisAngle(V3(0, 1, 0), q[3]); C.mass.setMatrixAt(i, _amM4.compose(V3(x, groundAt(x, z), z), _amQ, _amOne)); });
  C.mass.instanceMatrix.needsUpdate = true;
  C.dustT -= dt; if (C.dustT <= 0) { C.dustT = 0.12; const q = pick(C.massP), [x, z] = AMW(q[0] - 3.5, q[1]); dustPuff(V3(x, 0, z), groundAt(x, z), 2.2, 1.2, 0.6); }
}
function amIntroFilm() {
  const C = CHAP.armor; amSend(0, amN(AM_Z[0].waves[0][0]), 0); AM.ech = 1; amMass(true); const col = () => { const v = C.foes.find((q) => q.used && q.alive) || C.foes[0]; return v.g.position.clone(); };
  playCine({ vid: 'am_intro',
    title: 'החזית הדרומית, מזרחית לתעלה · 14 באוקטובר 1973 · 06:15',
    shots: [
      { d: 4.6, cam: (u) => ({ p: V3(AM.o.x - 640 + u * 60, 60, AM.o.z + 140), l: col().add(V3(-80, 0, 0)), fov: 50 }) },
      { d: 3.8, cam: (u) => ({ p: col().add(V3(40 - u * 8, 3, 22)), l: col().add(V3(0, 1.5, 0)), fov: 44 }) },
      { d: 4.0, cam: (u) => ({ p: TANK.g.position.clone().add(V3(14 - u * 3, 4, 10)), l: TANK.g.position.clone().add(V3(-40, 1, 0)), fov: 50 }) },
    ],
    caps: [[0.3, '<b>14 באוקטובר 1973.</b> אחרי שבוע של בלימה, הצבא המצרי יוצא מראשי הגשר שלו למתקפה הגדולה.', 4.2], [4.7, 'מאות טנקים מתקדמים מזרחה, אל הרכסים שבהם מחכים הטנקים שלנו.', 3.8], [8.6, '<b>מג״ד:</b> כל טנק שומר על העמדה שלו. אף טנק מצרי לא נכנס לקו!', 3.6]],
    end: () => { amMass(false); AM.zs = 'hold'; CHAP.armor.holdT = 12.4; AM.ech = 1; hint('am-drive', `אתם <b>נוהגים בטנק</b>: ${TOUCH ? 'ג׳ויסטיק' : 'W/S'} נסיעה, ${TOUCH ? 'ג׳ויסטיק לצדדים' : 'A/D'} סיבוב, והצריח פונה לאן שאתם מסתכלים. ההסתערות עולה מהעמק: השמידו את הטנקים לפני שהם נכנסים לעמדה (הדגלים הכתומים). בכוונת התותחן ${TOUCH ? '' : '(לחצן ימני) '}הכוונת ננעלת על טנק ומקיפה אותו באדום. סוללות החול מסתירות את גוף הטנק.`, 12); },
  });
}
function amEndFilm() {
  const C = CHAP.armor, wr = C.foes.filter((v) => v.used && !v.alive && v.g.visible), focus = wr.length ? wr[wr.length - 1].g.position.clone() : TANK.g.position.clone().add(V3(-200, 0, 0));
  playCine({ vid: 'am_end',
    title: 'הרכסים מזרחית לתעלה · 14 באוקטובר 1973, צהריים',
    shots: [
      { d: 5.0, cam: (u) => ({ p: TANK.g.position.clone().add(V3(20, 14 + u * 6, -30 + u * 30)), l: TANK.g.position.clone().add(V3(-420, 0, u * 20)), fov: 48 }) },
      { d: 4.6, cam: camOrbit(() => focus, 26, 0.3, 1.4, 7, 46) },
      { d: 5.4, cam: (u) => ({ p: TANK.g.position.clone().add(V3(-12 - u * 4, 4, 9)), l: TANK.g.position.clone().add(V3(0, 2, 0)), fov: 50 }) },
    ],
    caps: [[0.3, '<b>ההתקפה המצרית נשברה על הרכסים.</b>', 3.6], [4.2, 'ביום אחד הושמדו כמאתיים וחמישים טנקים מצריים, והשריון המצרי לא חזר להתקיף.', 5.0], [9.6, 'יומיים אחר כך חצו כוחות צה״ל את התעלה.', 4.6]],
    end: () => { DIRQ.push({ at: GAME.t + 0.3, fn: () => endGame(true) }); },
  });
}
function amObj() {
  const Z = AM_Z[AM.zi];
  if (AM.zs === 'go') { const [x, z] = AMW(Z.x, Z.z); return [x, groundAt(x, z) + 3, z, Z.name]; }
  let best = null, bd = 1e9; for (const v of CHAP.armor.foes) if (v.used && v.alive && v.g.visible) { const d = v.g.position.distanceTo(TANK.g.position) * (amInZone(v.g.position, Z) ? 0.3 : 1); if (d < bd) { bd = d; best = v; } }
  if (best) { const p = best.g.position; return [p.x, p.y + 3, p.z, amInZone(p, Z) ? 'בתוך העמדה!' : 'טנק מצרי']; }
  const e = fieldNearest((q) => q.inZone === AM.zi); if (e) return [e.pos.x, e.pos.y + 2, e.pos.z, 'חי״ר בעמדה'];
  return null;
}
function amItems(items) {
  const S = AM_STAGES[AM.stage]; items.push(['go', (S.goal || S.sub) + (OBJ.on ? ' (◆)' : '')]);
  items.push([TANK.hp < 40 ? 'warn' : '', `מצב הטנק: ${Math.max(0, Math.round(TANK.hp))}% · פגז: ${TANK.gunT > 0 ? `טוען ${Math.ceil(TANK.gunT)}` : 'מוכן'}`]);
  if (AM.zs === 'hold') { const [left, tot] = amAssault(), ins = amInside(AM.zi); items.push([ins ? 'warn' : 'next', ins ? `האויב בתוך העמדה (${ins})!` : `טנקים בהסתערות: ${left} מתוך ${tot}`]); }
  if (AM.zs === 'clear') items.push(['warn', `מצרים בתוך העמדה: ${amInside(AM.zi)}`]);
  items.push(['', `טנקים וחי״ר מצריים בגזרה: ${amLeft(AM.zi)}`]);
  if (PROJ.some((q) => q.type === 'atgm')) items.push(['warn', 'אר־פי־ג׳י באוויר! זוזו, הסתתרו מאחורי סוללה, או הרגו את המפעיל']);
}
function amHints() { if (GAME.t > 1) hint('sz-tank', TOUCH ? `אתם מפקד הטנק ונוהג בו. <kbd>אש</kbd> = מקלע 0.5, <kbd>רימון</kbd> = פגז, <kbd>כוונת</kbd> = כוונת התותחן.` : `${K('לחיצה ממושכת')} מקלע 0.5, ${K('G')} פגז מהתותח, לחצן ימני כוונת תותחן. טנק שזז קשה יותר לפגוע בו.`, 9); }
function amMini(g, X, poly, dot, k) {
  const W = (pts) => pts.map(([x, z]) => AMW(x, z)), crest = []; for (let z = -200; z <= 900; z += 40) crest.push([amCrest(z), z]);
  miniField(g, X, poly, dot, k, { bg: 'rgba(176,152,112,.92)', lines: [[W(crest), 4, 'rgba(110,86,56,.95)'], [W([[-1140, 366], [250, 366]]), 2, 'rgba(150,130,96,.8)']] });
  AM_Z.forEach((Z, i) => { const [a, b] = X(...AMW(Z.x, Z.z)), [a2] = X(...AMW(Z.x + Z.r, Z.z)); g.strokeStyle = i === AM.zi ? '#ffcf73' : i < AM.zi ? 'rgba(111,168,255,.7)' : 'rgba(255,207,115,.35)'; g.lineWidth = i === AM.zi ? 3 : 1.5; g.beginPath(); g.arc(a, b, Math.abs(a2 - a), 0, 6.283); g.stroke(); });
}
function amEnd(win, why) {
  const stats = [[STATS.kills, 'טנקים וחיילים הושמדו'], [Math.max(0, Math.round(TANK.hp)), 'מצב הטנק %'], [AM.zi + 1, 'עמדות שהגעתם אליהן']];
  if (win) return ['הרכס החזיק', 'ב־14 באוקטובר 1973 יצאו כמה מאות טנקים מצריים למתקפה מראשי הגשר שלהם. הטנקים של צה״ל החזיקו את העמדות על הרכסים, עברו מעמדה לעמדה לסגור פרצות, וההתקפה נשברה. מאות טנקים מצריים הושמדו, ויומיים אחר כך חצה צה״ל את התעלה.', stats];
  if (why === 'tank') return ['הטנק הושמד', 'טנק שעומד במקום חשוף הוא מטרה. זוזו בין הסוללות, ירו פגז על הטנק שהכוונת ננעלה עליו, ושנו מקום לפני שהם מכוונים שוב.', stats];
  return ['נפגעת', 'כשהמקלעים שלהם יורים, היכנסו לצריח (C) וירו בכוונת התותחן.', stats];
}
/* their gunners: a tank on the move is half as easy to hit, the level sets the rest; and however many T-55s are on the field, no more than a
   few of them are laying on you at a time (the rest are firing at the other tanks on the ridge) - so a front of ten is fought, not a firing squad */
CHAP.armor = { stages: AM_STAGES, st: () => AM.stage, dbg: () => { const Z = AM_Z[AM.zi], [x, z] = AMW(Z.x, Z.z), [left, tot] = amAssault(); return { zi: AM.zi, zs: AM.zs, ech: AM.ech, holdT: +(CHAP.armor.holdT || 0).toFixed(1), x, z, ins: amInside(AM.zi), left: amLeft(AM.zi), aLeft: left, aTot: tot, act: AM.nAct }; }, cp: () => CHAP.armor.cpN || 0, upd: amUpd, obj: amObj, hints: amHints, items: amItems, mini: amMini, restore: fieldRestore, end: amEnd, tank: true, dry: true, burnLong: true,
  hitK: () => (Math.abs(TANK.speed) > 2 ? 0.5 : 1) * [0.12, 0.28, 0.4][amDi()] * Math.min(1, [3.5, 4, 5][amDi()] / Math.max(1, AM.nAct)), allyK: 0.3,
  // a bazooka man laying on a tank in the open: his rocket passes within a couple of metres of the turret, nearer on the harder levels
  rpgTarget: () => { if (P.mode !== 'tank' || !TANK.alive) return null; const r = [8, 5.5, 4][amDi()]; return tankTurretWorld().add(V3(rand(-r, r), rand(-0.6, 1.4), rand(-r, r))); },
  tod: () => [8 * 60 + 10, 8 * 60 + 35, 9 * 60, 9 * 60 + 30][AM.stage] - START_MIN + CHAP.armor.t / 6,
  build: () => chapterBuild(CHAP.armor, amBuild), setup: amSetup, clock: '14.10.1973 · הרכסים מזרחית לתעלה', toast: ['14 באוקטובר 1973 · 06:15', 'המתקפה המצרית הגדולה'], start: () => fieldStart('armor') };
