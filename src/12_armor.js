
/* ================= chapter 3: the great tank battle, 14 October 1973 =================
   The Egyptian army comes out of its bridgeheads with hundreds of tanks. You command a tank and drive it yourself: hold the position
   clear of the enemy until the clock runs out, then the order comes to reinforce the next position along the ridge, where they broke through. */
const AM = { o: { x: -7000, z: -7000 }, stage: 0, msgs: {}, zi: 0, zs: 'go', hold: 0, wave: 0 };
const AMW = toWorld(AM.o);
// four positions along the ridge, south to north: where they are, how big, how long to hold, and the waves that come at each
const AM_Z = [
  { x: 0, z: 0, r: 70, t: 45, name: 'עמדה "אבירם"', waves: [[4, 1, 6], [4, 2, 10]] },
  { x: 14, z: 250, r: 70, t: 50, name: 'עמדה "ברק"', breach: [2, 1, 10], waves: [[4, 1, 10], [5, 2, 12]] },
  { x: -18, z: 500, r: 70, t: 55, name: 'עמדה "גלעד"', breach: [3, 1, 12], waves: [[5, 2, 12], [5, 2, 14]], sagger: true },
  { x: 6, z: 740, r: 75, t: 60, name: 'עמדה "דקל"', breach: [3, 2, 14], waves: [[5, 2, 12], [6, 2, 14], [6, 3, 16]], sagger: true } ];
const AM_STAGES = AM_Z.map((z, i) => ({ title: i === 0 ? 'הרכס' : `${z.name} נפרצה`, sub: i === 0 ? 'ארבעה־עשר באוקטובר, שבע בבוקר. מאות טנקים מצריים עולים מהגשרים אל הרכסים, ואתם הטנק בעמדה. שום דבר לא עובר עד שהשעון נגמר.' : `${z.name} נפרצה: טנקים מצריים כבר בתוך העמדה, והצוותים שם מחזיקים בשיניים. גז לשם — נקו אותה והחזיקו עד שהשעון נגמר.`, goal: i === 0 ? 'החזיקו את העמדה עד שהשעון נגמר. W/S נסיעה, A/D סיבוב' : `${z.name}: נקו את העמדה והחזיקו עד שהשעון נגמר` }));
const OTRUCK_GEO = build(truckParts({ B: 0x5f6146, D: 0x55573e, K: 0x1f1e1b, C: 0x6a6c50 }));
const BTR_GEO = build([[G.box(6.6, 1.0, 2.6), 0x8e8058, M4(0, 1.1, 0)], [G.box(1.5, 0.75, 2.5), 0x857852, M4(3.6, 1.05, 0, 0, 0, -0.45)], [G.box(1.2, 0.7, 2.5), 0x857852, M4(-3.45, 1.0, 0, 0, 0, 0.35)], [G.box(5.4, 0.5, 2.2), 0x8a7c55, M4(-0.2, 1.8, 0)], [G.cyl(0.45, 0.52, 0.5, 12), 0x7d7050, M4(0.9, 2.3, 0)], [G.cyl(0.04, 0.04, 1.3, 6), 0x2a2a26, M4(1.6, 2.4, 0, 0, 0, Math.PI / 2)], ...[-2.4, -0.8, 0.8, 2.4].flatMap((x) => [-1, 1].map((sd) => [G.cyl(0.55, 0.55, 0.36, 14), 0x22201c, M4(x, 0.55, sd * 1.25, Math.PI / 2, 0, 0)]))]);
const MARK_GEO = build([[G.cyl(0.06, 0.08, 2.2, 6), 0x3a3a34, M4(0, 1.1, 0)], [G.box(0.02, 0.5, 0.8), 0xe8641e, M4(0, 1.9, 0.4)]]);
const amCrest = (lz) => 8 * Math.sin(lz / 180) + 4 * Math.sin(lz / 67 + 1.3);   // the ridge line wanders a little
function amH(x, z) {
  const lx = x - AM.o.x, lz = z - AM.o.z, cx = lx - amCrest(lz);
  let h = 1.1 * fbm(lx / 170, lz / 170, 3) + 0.35 * fbm(lx / 28, lz / 28, 2);
  const ridge = 13 * Math.exp(-((cx / 46) ** 2)); h += ridge; h += cx > 0 ? 3 * smooth(40, 180, cx) * (0.6 + 0.4 * fbm(lx / 90, lz / 90, 2)) : 0;
  mix3(PAL.sandL, PAL.sandD, smooth(-0.35, 0.45, fbm(lx / 120, lz / 120, 3) + 0.5 * fbm(lx / 18, lz / 18, 2))); mixIn(PAL.rock, smooth(5, 12, ridge) * 0.4);
  if (cx < -80) { const d = 1 - Math.abs(noise(lx / 90 + 7, lz / 140)); h += 2.6 * d * d * d * smooth(-80, -220, cx); const w = Math.abs(lx + 560 + 40 * Math.sin(lz / 120)); if (w < 20) { h -= 2.2 * (1 - smooth(5, 20, w)); mixIn(PAL.sandD, 0.5 * (1 - smooth(4, 16, w))); } mixIn([0.5, 0.44, 0.34], 0.25 * smooth(0.2, 0.6, noise(lx / 60, lz / 60))); }
  // the positions: berms of sand to hide a tank behind, churned ground, the track along the back of the ridge
  for (const Z of AM_Z) { const dx = lx - Z.x, dz = lz - Z.z, d = Math.hypot(dx, dz); if (d < Z.r + 20) { mixIn([0.47, 0.41, 0.32], 0.35 * (1 - smooth(Z.r - 10, Z.r + 15, d)));
    for (const oz of [-28, 0, 28]) { const bz = Math.abs(dz - oz); if (bz < 10) h += 1.9 * Math.exp(-(((dx + 10) / 3.4) ** 2)) * (1 - smooth(5, 10, bz)); } } }
  { const d = Math.abs(cx - 38); if (d < 5) mixIn([0.52, 0.46, 0.36], 0.55 * (1 - smooth(2, 5, d))); }
  return h;
}
function amBuild() {
  const C = CHAP.armor; C.ground = makeGround({ x0: AM.o.x - 1150, x1: AM.o.x + 260, z0: AM.o.z - 220, z1: AM.o.z + 920, step: 3.2, h: amH }); GROUND = C.ground;
  const BAGS = [], sv = BATCH.bag; BATCH.bag = BAGS; const k0 = COVER.length; C.slots = [];
  const L = (x, z) => [x - AM.o.x, z - AM.o.z], inZone = (lx, lz) => AM_Z.some((Z) => Math.hypot(lx - Z.x, lz - Z.z) < 22), ok = (x, z) => { const [lx, lz] = L(x, z); return !inZone(lx, lz) && !C.slots.some((s) => Math.hypot(s.x - x, s.z - z) < 5); };
  // Sagger and bazooka nests in front of the northern positions
  const nb = []; C.nests = []; AM_Z.forEach((Z, zi) => { if (!Z.sagger) return; for (const [dx, dz] of [[-420, -30], [-460, 20], [-390, 45], [-500, -10]]) { const [wx, wz] = AMW(Z.x + dx, Z.z + dz), s = bushNest(wx, wz, 1, 0, C.slots, 'S' + zi, 'atgm', nb, Math.random); s.zi = zi; C.nests.push(s); } });
  const X0 = AM.o.x - 1140, X1 = AM.o.x + 250, Z0 = AM.o.z - 210, Z1 = AM.o.z + 910;
  instScatter(ROCK_G, scatterIn(LITE ? 320 : 760, X0, X1, Z0, Z1, 701, ok, (x, z, r) => [x, z, 0.2 + r() ** 3 * 1.2, r() * 6, rockCol(r), 0.2, 0.55]));
  instScatter(BUSH_G, scatterIn(LITE ? 280 : 680, X0, X1, Z0, Z1, 702, ok, (x, z, r) => [x, z, 0.35 + r() * 0.6, r() * 6, dryBush(r), 0, 0.72]).concat(nb));
  { const bl = scatterIn(LITE ? 40 : 80, X0, X1, Z0, Z1, 703, ok, (x, z, r) => [x, z, 1.2 + r() * 1.8, r() * 6, rockCol(r), 0.3, 0.72]); instScatter(BOULDER_G, bl); boulders(bl); }
  dressArea(X0, X1, Z0, Z1, ok, 710, 0.9, 0.06);
  // wrecks of the first week, a road and telegraph poles across the valley, ruined huts, the supply trucks behind the ridge
  for (const [x, z, b] of [[-420, -150, 80], [-760, 120, 300], [-300, 330, 40], [-520, 610, 120], [-260, 820, 200]]) { const [wx, wz] = AMW(x, z); placeTank(wx, wz, b, TANK_BURNT); }
  for (const [x, z, r] of [[-880, -60, 0.6], [-480, 400, 2.2], [-700, 700, 1.1]]) { const [wx, wz] = AMW(x, z); vehicle(TRUCK_BURNT, wx, wz, r, 3.3, 1.2, 2.6); }
  roadRibbon([[-1140, 366], [250, 366]].map(([x, z]) => AMW(x, z)), 7, 'asphalt'); roadWrecks([[-1100, 366], [200, 366]].map(([x, z]) => AMW(x, z)), 5, 12117, 7);
  powerLine([[-1140, 380], [250, 380]].map(([x, z]) => AMW(x, z)), 46, 7); roadPoles([[-1140, 366], [250, 366]].map(([x, z]) => AMW(x, z)), 40, 5);
  for (const [x, z] of [[-700, 360], [-300, 140]]) { const [wx, wz] = AMW(x, z); smallHut(wx, wz, 6, 5, 2.6, '#c8b796', 0x7d6e58, true); }
  for (const [x, z, r] of [[95, -40, 1.5], [105, 270, 1.6], [90, 520, 1.4], [100, 760, 1.5]]) { const [wx, wz] = AMW(x, z); vehicle(OTRUCK_GEO, wx, wz, r, 3.3, 1.2, 2.6); fieldDrums(wx + 6, wz + 4, 5); }
  for (const [x, z, s] of [[-1600, -300, 70], [-1800, 300, 90], [-1500, 800, 60], [400, -700, 30]]) { const [wx, wz] = AMW(x, z); smokeColumn(wx, wz, s, true); }
  // the zone markers: orange flags in a ring around each position, so it is clear where the line is held
  C.marks = AM_Z.map((Z) => { const items = []; for (let k = 0; k < 18; k++) { const a = k / 18 * Math.PI * 2, [wx, wz] = AMW(Z.x + Math.cos(a) * Z.r, Z.z + Math.sin(a) * Z.r); items.push([wx, wz, 1, a, 0xffffff, 0, 1]); } return instScatter(MARK_GEO, items, MAT.vc, false); });
  BATCH.bag = sv; if (BAGS.length) scene.add(bagMesh(BAGS)); C.covers = COVER.slice(k0); for (const c of C.covers) c.y = groundAt(c.x, c.z);
  // our tanks at the positions, and the Egyptian armour
  C.mates = []; AM_Z.forEach((Z, zi) => { for (const oz of [-28, 28]) { const v = addVeh({ mode: 'armor', side: 'f', kind: 'tank', geo: TANK_GEO, half: [3.4, 2.6, 1.9], guns: true, vmax: 0 }); v.zi = zi; v.at = [Z.x - 4, Z.z + oz]; C.mates.push(v); } });
  C.foes = []; for (let i = 0; i < 44; i++) C.foes.push(addVeh({ mode: 'armor', kind: 't55', geo: T55_HULL, turGeo: T55_TUR, turAt: [0.3, 1.42, 0], half: [3.2, 2.3, 1.75], armor: 0, hp: 100, shoots: true, vmax: 4.6 }));
  for (let i = 0; i < 18; i++) C.foes.push(addVeh({ mode: 'armor', kind: 'btr', geo: BTR_GEO, half: [3.4, 2.3, 1.3], armor: 0, hp: 60, shoots: false, vmax: 5.2 }));
}
/* ---------- waves: columns roll in from the valley toward the position; those that get there are inside the line ---------- */
function amSend(zi, nT, nB, nI, breach = false) {
  const C = CHAP.armor, Z = AM_Z[zi], free = (k) => C.foes.filter((v) => v.kind === k && !v.used); let i = 0;
  const go = (v) => { v.used = true; v.zi = zi; vehRevive(v, v.kind === 'btr' ? 60 : 100); v.shown = true; v.g.visible = true; const lane = rand(-60, 60), tx = Z.x + rand(-26, 8), tz = Z.z + rand(-40, 40);
    if (breach) { const [wx, wz] = AMW(Z.x + rand(-40, 10), Z.z + rand(-45, 45)); v.path = null; vehPose(v, wx, wz, Math.PI / 2 + rand(-0.6, 0.6)); v.s = 0; v.stop = undefined; v.hdV = null; v.fireCd = rand(1, 4); v.inside = true; return; }
    const x0 = Z.x - 900 - i * 30 - rand(0, 60); i++; v.path = [AMW(x0, Z.z + lane * 1.6), AMW(Z.x - 500, Z.z + lane + rand(-15, 15)), AMW(Z.x - 220, Z.z + lane * 0.6 + rand(-15, 15)), AMW(tx, tz)]; v.s = 0; v.vmax = v.kind === 'btr' ? 5.2 : 4.6; v.hdV = null; v.ended = false;
    v.halts = [rand(150, 260), rand(420, 560)]; v.hold = 0; v.stop = v.halts.shift(); v.fireCd = rand(3, 7); v.dropped = false; v.inside = false; vehPose(v, ...v.path[0], Math.PI / 2); };
  free('t55').slice(0, nT).forEach(go); free('btr').slice(0, nB).forEach(go);
  for (let k = 0; k < nI; k++) { const [x, z] = breach ? [Z.x + rand(-45, 15), Z.z + rand(-45, 45)] : [Z.x - 210 - rand(0, 70), Z.z + rand(-50, 50)], [tx, tz] = [Z.x + rand(-30, 10), Z.z + rand(-40, 40)]; DIRQ.push({ at: GAME.t + k * (breach ? 0.2 : 0.9), spawn: true, fn: () => { const e = fSpawnStreet(...AMW(x, z), [AMW(tx, tz)], k % 4 === 1 ? 'rpg' : 'rifle'); if (e) { e.sq = 'z' + zi; e.inZone = zi; } } }); }
}
function amFoes(dt) {
  const C = CHAP.armor;
  for (const v of C.foes) { if (!v.used || !v.alive || !v.g.visible) continue;
    if (v.path && v.stop !== undefined && v.s >= v.stop - 0.6) { v.hold += dt; if (v.hold > 6) { v.hold = 0; v.stop = v.halts.length ? v.halts.shift() : undefined; } }
    if (v.kind === 'btr' && v.path && !v.dropped && v.s > 380) { v.dropped = true; const p = v.g.position, Z = AM_Z[v.zi]; for (let k = 0; k < 6; k++) { const e = fSpawnStreet(p.x + rand(-2, 2), p.z + rand(-2, 2), [AMW(Z.x + rand(-30, 5), Z.z + rand(-35, 35))], k === 1 ? 'rpg' : 'rifle'); if (e) { e.sq = 'z' + v.zi; e.inZone = v.zi; } } }
  }
}
function amInZone(p, Z, pad = 0) { return Math.hypot(p.x - (AM.o.x + Z.x), p.z - (AM.o.z + Z.z)) < Z.r + pad; }
// how many of the enemy are inside the line of this position (tanks, carriers and men)
function amInside(zi) { const Z = AM_Z[zi]; let n = 0; for (const v of CHAP.armor.foes) if (v.used && v.alive && v.g.visible && amInZone(v.g.position, Z)) n++; for (const e of UNITS.enemies) if (e.alive && e.sz && amInZone(e.pos, Z)) n++; return n; }
function amLeft(zi) { let n = 0; for (const v of CHAP.armor.foes) if (v.used && v.zi === zi && v.alive && v.g.visible) n++; return n + szAlive((e) => e.inZone === zi); }
/* ---------- stages: one position each ---------- */
function amSetup(stage) {
  const C = CHAP.armor; fieldSetupCommon(C, stage); AM.msgs = {};
  for (const v of VEH) if (v.mode === 'armor') { vehRevive(v); v.used = false; v.path = null; v.stop = undefined; v.ended = false; v.shown = v.side === 'f'; v.g.visible = v.shown; v.onEnd = null; v.speed = 0; }
  for (const v of C.mates) { const [wx, wz] = AMW(...v.at); v.hdV = null; vehPose(v, wx, wz, -Math.PI / 2); }
  const Z = AM_Z[stage], start = stage === 0 ? [Z.x + 10, Z.z] : [AM_Z[stage - 1].x + 20, AM_Z[stage - 1].z + 30];
  tankStart([AMW(start[0], start[1]), AMW(start[0] - 1, start[1])], (x, z) => [x, z], 0, []); const [sx, sz] = AMW(...start); Object.assign(TANK, { free: true, fx: sx, fz: sz, hd: stage === 0 ? -Math.PI / 2 : 0, vmax: 7, bounds: [AM.o.x - 900, AM.o.x + 240, AM.o.z - 200, AM.o.z + 900] });
  P.mode = 'tank'; P.yaw = stage === 0 ? Math.PI / 2 : Math.PI; P.pitch = -0.03; P.crouch = false; TANK.hp = 100;
  fieldFriends([]); amStage(stage);
}
function amStage(i) {
  const C = CHAP.armor, Z = AM_Z[i]; fieldStage(C, i); AM.stage = i; AM.zi = i; AM.msgs = {}; C.t = 0; AM.hold = 0; AM.wave = 0;
  C.marks.forEach((m, k) => { m.visible = k === i; });
  if (i === 0) { AM.zs = 'intro'; DIRQ.push({ at: GAME.t + 0.3, fn: () => amIntroFilm() }); }
  else { AM.zs = 'go'; amSend(i, ...Z.breach, true); radio('מג״ד', `${Z.name} נפרצה! טנקים מצריים בתוך העמדה. סע לשם מיד ונקה אותה!`, 4.5); for (const v of C.mates) if (v.zi === i && v.alive && Math.random() < 0.6) vehDestroy(v, true); }
}
function amUpd(dt) {
  const C = CHAP.armor, Z = AM_Z[AM.zi]; C.t += dt; if (Math.floor(C.t * 2) !== Math.floor((C.t - dt) * 2)) szEnemyCleanup();
  for (let i = DIRQ.length - 1; i >= 0; i--) if (DIRQ[i] && GAME.t >= DIRQ[i].at) { const q = DIRQ.splice(i, 1)[0]; q.fn(); }
  amFoes(dt); if (C.mass && C.mass.visible) amMass(true, dt);
  // Egyptian artillery keeps falling on the positions
  if (!CINE.on) { C.shT = (C.shT ?? 3) - dt; if (C.shT <= 0) { C.shT = rand(1.4, 3.4); const near = Math.random() < 0.35, p = near ? TANK.g.position.clone().add(V3(rand(-30, 30), 0, rand(-30, 30))) : V3(AM.o.x + Z.x + rand(-60, 60), 0, AM.o.z + Z.z + rand(-70, 70)); p.y = groundAt(p.x, p.z); if (near) sndWhistle(0.9); DIRQ.push({ at: GAME.t + 0.9, fn: () => { fxExplosion(p, 1.2); sndBoom(p, 1.1); if (TANK.alive && p.distanceTo(TANK.g.position) < 6) tankHit(p.clone(), false, 10); } }); } }
  const pIn = amInZone(TANK.g.position, Z, 6), inside = amInside(AM.zi);
  if (AM.zs === 'go') {
    if (pIn) { AM.zs = 'clear'; radio('תותחן', 'אנחנו בתוך העמדה! טנקים מצריים, קרוב!', 2.6); }
  } else if (AM.zs === 'clear') {
    if (inside === 0) { AM.zs = 'hold'; AM.hold = 0; AM.wave = 0; C.nextWave = 6; radio('מג״ד', `העמדה נקייה. תחזיק אותה. גל חדש בדרך מהעמק.`, 3.5); }
  } else if (AM.zs === 'hold') {
    // the clock runs while you are inside the line and none of them are
    const running = pIn && inside === 0; if (running) AM.hold += dt;
    if (!pIn && !AM.msgs.out) { AM.msgs.out = true; hint('am-out', 'יצאתם מתחום העמדה (הדגלים הכתומים). השעון עוצר עד שחוזרים פנימה.', 6); } if (pIn) AM.msgs.out = false;
    if (inside > 0 && !AM.msgs.br) { AM.msgs.br = true; radio('תצפית', 'הם בתוך העמדה! תשמיד אותם!', 2.4); } if (inside === 0) AM.msgs.br = false;
    C.nextWave -= dt; if (C.nextWave <= 0 && AM.wave < Z.waves.length) { amSend(AM.zi, ...Z.waves[AM.wave]); radio('תצפית', ['טנקים יוצאים מהעשן בעמק!', 'עוד גל! טנקים ונגמ״שים!', 'הם שולחים הכול! כל העמק מלא!'][Math.min(AM.wave, 2)], 3); AM.wave++; C.nextWave = Z.t / Z.waves.length; if (Z.sagger && AM.wave === 1) for (const s of C.nests) if (s.zi === AM.zi) fSlotSpawn('atgm', (q) => q === s, 'S' + AM.zi); }
    if (AM.hold >= Z.t) { feed(`${Z.name} החזיקה`, 'good'); TANK.hp = Math.min(100, TANK.hp + 35); fieldDespawn((e) => e.inZone === AM.zi || e.sq === 'S' + AM.zi); for (const v of C.foes) if (v.used && v.zi === AM.zi && v.alive && !amInZone(v.g.position, Z, 120)) { v.alive = false; v.g.visible = false; }
      if (AM.zi < AM_Z.length - 1) amStage(AM.zi + 1); else if (!AM.msgs.end) { AM.msgs.end = true; DIRQ.push({ at: GAME.t + 1.5, fn: amEndFilm }); } }
  }
  if (AM.zs !== 'intro') meter(AM.zs === 'hold' ? `${Z.name} · מחזיקים` : AM.zs === 'clear' ? `${Z.name} · נקו את העמדה` : `סעו אל ${Z.name}`, AM.zs === 'hold' ? AM.hold / Z.t : 0, AM.zs === 'hold' && inside > 0 ? 'warn' : '');
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
  const C = CHAP.armor; amSend(0, 4, 1, 0); amMass(true); const col = () => { const v = C.foes.find((q) => q.used && q.alive) || C.foes[0]; return v.g.position.clone(); };
  playCine({ vid: 'am_intro',
    title: 'החזית הדרומית, מזרחית לתעלה · 14 באוקטובר 1973 · 06:15',
    shots: [
      { d: 4.6, cam: (u) => ({ p: V3(AM.o.x - 640 + u * 60, 60, AM.o.z + 140), l: col().add(V3(-80, 0, 0)), fov: 50 }) },
      { d: 3.8, cam: (u) => ({ p: col().add(V3(40 - u * 8, 3, 22)), l: col().add(V3(0, 1.5, 0)), fov: 44 }) },
      { d: 4.0, cam: (u) => ({ p: TANK.g.position.clone().add(V3(14 - u * 3, 4, 10)), l: TANK.g.position.clone().add(V3(-40, 1, 0)), fov: 50 }) },
    ],
    caps: [[0.3, '<b>14 באוקטובר 1973.</b> אחרי שבוע של בלימה, הצבא המצרי יוצא מראשי הגשר שלו למתקפה הגדולה.', 4.2], [4.7, 'מאות טנקים מתקדמים מזרחה, אל הרכסים שבהם מחכים הטנקים שלנו.', 3.8], [8.6, '<b>מג״ד:</b> כל טנק שומר על העמדה שלו. אף טנק מצרי לא נכנס לקו!', 3.6]],
    end: () => { amMass(false); AM.zs = 'hold'; AM.hold = 0; AM.wave = 1; CHAP.armor.nextWave = 30; hint('am-drive', `אתם <b>נוהגים בטנק</b>: ${TOUCH ? 'ג׳ויסטיק' : 'W/S'} נסיעה, ${TOUCH ? 'ג׳ויסטיק לצדדים' : 'A/D'} סיבוב, והצריח פונה לאן שאתם מסתכלים. החזיקו את העמדה (בתוך הדגלים הכתומים) נקייה מאויב עד שהמד מתמלא. סוללות החול מסתירות את גוף הטנק.`, 12); },
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
  if (best) { const p = best.g.position; return [p.x, p.y + 3, p.z, amInZone(p, Z) ? 'בתוך העמדה!' : best.kind === 'btr' ? 'נגמ״ש' : 'טנק מצרי']; }
  const e = fieldNearest((q) => q.inZone === AM.zi); if (e) return [e.pos.x, e.pos.y + 2, e.pos.z, 'חי״ר בעמדה'];
  return null;
}
function amItems(items) {
  const Z = AM_Z[AM.zi], S = AM_STAGES[AM.stage]; items.push(['go', (S.goal || S.sub) + (OBJ.on ? ' (◆)' : '')]);
  items.push([TANK.hp < 40 ? 'warn' : '', `מצב הטנק: ${Math.max(0, Math.round(TANK.hp))}% · פגז: ${TANK.gunT > 0 ? `טוען ${Math.ceil(TANK.gunT)}` : 'מוכן'}`]);
  if (AM.zs === 'hold') { const left = Math.max(0, Math.ceil(Z.t - AM.hold)), ins = amInside(AM.zi); items.push([ins ? 'warn' : 'next', ins ? `האויב בתוך העמדה (${ins}): השעון עוצר` : `להחזיק עוד ${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`]); }
  if (AM.zs === 'clear') items.push(['warn', `מצרים בתוך העמדה: ${amInside(AM.zi)}`]);
  items.push(['', `טנקים ונגמ״שים מצריים בגזרה: ${amLeft(AM.zi)}`]);
  if (PROJ.some((q) => q.type === 'atgm')) items.push(['warn', 'סאגר באוויר! זוזו, הסתתרו מאחורי סוללה, או הרגו את המפעיל']);
}
function amHints() { if (GAME.t > 1) hint('sz-tank', TOUCH ? `אתם מפקד הטנק ונוהג בו. <kbd>אש</kbd> = מקלע 0.5, <kbd>רימון</kbd> = פגז, <kbd>כוונת</kbd> = כוונת התותחן.` : `${K('לחיצה ממושכת')} מקלע 0.5, ${K('G')} פגז מהתותח, לחצן ימני כוונת תותחן. טנק שזז קשה יותר לפגוע בו.`, 9); }
function amMini(g, X, poly, dot, k) {
  const W = (pts) => pts.map(([x, z]) => AMW(x, z)), crest = []; for (let z = -200; z <= 900; z += 40) crest.push([amCrest(z), z]);
  miniField(g, X, poly, dot, k, { bg: 'rgba(176,152,112,.92)', lines: [[W(crest), 4, 'rgba(110,86,56,.95)'], [W([[-1140, 366], [250, 366]]), 2, 'rgba(150,130,96,.8)']] });
  AM_Z.forEach((Z, i) => { const [a, b] = X(...AMW(Z.x, Z.z)), [a2] = X(...AMW(Z.x + Z.r, Z.z)); g.strokeStyle = i === AM.zi ? '#ffcf73' : i < AM.zi ? 'rgba(111,168,255,.7)' : 'rgba(255,207,115,.35)'; g.lineWidth = i === AM.zi ? 3 : 1.5; g.beginPath(); g.arc(a, b, Math.abs(a2 - a), 0, 6.283); g.stroke(); });
}
function amEnd(win, why) {
  const stats = [[STATS.kills, 'טנקים, נגמ״שים וחיילים הושמדו'], [Math.max(0, Math.round(TANK.hp)), 'מצב הטנק %'], [AM.zi + 1, 'עמדות שהגעתם אליהן']];
  if (win) return ['הרכס החזיק', 'ב־14 באוקטובר 1973 יצאו כמה מאות טנקים מצריים למתקפה מראשי הגשר שלהם. הטנקים של צה״ל החזיקו את העמדות על הרכסים, עברו מעמדה לעמדה לסגור פרצות, וההתקפה נשברה. מאות טנקים מצריים הושמדו, ויומיים אחר כך חצה צה״ל את התעלה.', stats];
  if (why === 'tank') return ['הטנק הושמד', 'טנק שעומד במקום חשוף הוא מטרה. זוזו בין הסוללות, ירו פגז, ושנו מקום לפני שהם מכוונים שוב.', stats];
  return ['נפגעת', 'כשהמקלעים שלהם יורים, היכנסו לצריח (C) וירו בכוונת התותחן.', stats];
}
CHAP.armor = { stages: AM_STAGES, st: () => AM.stage, dbg: () => { const Z = AM_Z[AM.zi], [x, z] = AMW(Z.x, Z.z); return { zi: AM.zi, zs: AM.zs, hold: +AM.hold.toFixed(1), wave: AM.wave, x, z, ins: amInside(AM.zi), left: amLeft(AM.zi) }; }, cp: () => CHAP.armor.cpN || 0, upd: amUpd, obj: amObj, hints: amHints, items: amItems, mini: amMini, restore: fieldRestore, end: amEnd, tank: true, dry: true, burnLong: true,
  hitK: () => (Math.abs(TANK.speed) > 2 ? 0.3 : 0.6), allyK: 0.3,
  tod: () => [8 * 60 + 10, 8 * 60 + 35, 9 * 60, 9 * 60 + 30][AM.stage] - START_MIN + CHAP.armor.t / 6,
  build: () => chapterBuild(CHAP.armor, amBuild), setup: amSetup, clock: '14.10.1973 · הרכסים מזרחית לתעלה', toast: ['14 באוקטובר 1973 · 06:15', 'המתקפה המצרית הגדולה'], start: () => fieldStart('armor') };
