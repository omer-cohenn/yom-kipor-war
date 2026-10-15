
/* ================= chapter 5: the encirclement of the Third Army, 24 October 1973 =================
   The armoured columns cut the Suez-Cairo road behind the Egyptian Third Army and reach the Gulf of Suez at Adabiya.
   At five in the afternoon the ceasefire comes into force: the Third Army is surrounded on the east bank. */
const AR = { o: { x: 7000, z: -7000 }, stage: 0, t: 0, cp: 0, msgs: {} };
const AW = toWorld(AR.o);
const AR_STAGES = [
  { title: 'דרומה, לכביש לקהיר', sub: 'הטנקים יורדים דרומה דרך השדות המושקים, אל כביש סואץ–קהיר. בדרך חפורים תותחי נ״ט וצוותי סאגר, וכל אחד מהם צריך פגז לפני שהוא יורה.', goal: 'דרומה אל הכביש. תורידו את תותחי הנ״ט והסאגרים מהתותח' },
  { title: 'הכביש שלנו', sub: 'הכביש נחתך. מסואץ פורצת שיירה מצרית אחרונה, שמנסה להגיע הביתה לפני שהטבעת נסגרת. אף רכב לא עובר.', goal: 'עצרו את השיירה המצרית הפורצת מסואץ — אף רכב לא עובר' },
  { title: 'הים', sub: 'מהכביש כבר רואים את המפרץ. בנמל עדבייה חפורים הטנקים האחרונים של הארמיה, ועל השעון נשארו דקות עד הפסקת האש.', goal: 'ירדו לנמל עדבייה, פוצצו את הטנקים החפורים והניפו דגל' },
];
const AR_ROUTE0 = [[60, -1100], [40, -930], [-30, -760], [30, -560], [-10, -380], [0, -232]];
const AR_ROUTE2 = [[0, -232], [10, -170], [60, -40], [130, 110], [190, 250], [236, 370], [252, 432]], AR_ROUTE0_S = smoothPath(AR_ROUTE0, 5), AR_ROUTE2_S = smoothPath(AR_ROUTE2, 5);
const AR_ROAD = -200, AR_KM = [[-140, AR_ROAD], [340, AR_ROAD]];
const coastZ = (lx) => 520 - 0.25 * lx;
function arNat(x, z) {
  const lx = x - AR.o.x, lz = z - AR.o.z;
  let h = 4 + 5 * fbm(lx / 520, lz / 520, 3) + 0.9 * fbm(lx / 60, lz / 60, 2); { const hill = 1 - Math.abs(noise(lx / 260 + 3.1, lz / 300)); h += 7 * hill * hill * hill * smooth(-100, 400, Math.abs(lz - AR_ROAD)) * (lz < coastZ(lx) - 60 ? 1 : 0); }
  { const dn = smooth(-420, -700, lz); if (dn > 0) { const r = 1 - Math.abs(noise(lx / 70 + fbm(lx / 200, lz / 200, 2), lz / 160)); h += dn * 5.5 * r * r * r; } }
  { const w = Math.abs(lz + 640 + 60 * Math.sin(lx / 130)); if (w < 16) h -= 2.2 * (1 - smooth(4, 16, w)); }
  mix3(PAL.sandD, PAL.rock, 0.2 + 0.35 * smooth(-0.3, 0.5, fbm(lx / 180, lz / 180, 3) + 0.6 * fbm(lx / 20, lz / 20, 2))); mixIn(PAL.sandL, 0.3 * smooth(0, 0.5, noise(lx / 90, lz / 90)));
  // Jebel Ataqa: the mountain behind the plain, west and south-west
  { const m = smooth(-320, -1300, lx) * (0.55 + 0.45 * smooth(-900, 300, lz)); if (m > 0) { const ridge = 1 - Math.abs(noise(lx / 380, lz / 520)); const mh = m * (180 + 160 * ridge * ridge + 60 * fbm(lx / 160, lz / 160, 3)); h += mh; mixIn(PAL.rock, smooth(10, 90, mh) * 0.8); } }
  // the gulf: a beach, then deep water
  { const c = lz - coastZ(lx); if (c > -40) { mixIn(PAL.fresh, 0.5 * (1 - smooth(-40, 0, c)) + 0.4 * smooth(-40, -5, c)); mixIn(PAL.wet, smooth(-6, 4, c)); h = lerp(h, 0.9 - c * 0.08, smooth(-40, -4, c)); if (c > 0) { h = lerp(0.9, -6, smooth(0, 70, c)); mix3(PAL.wet, PAL.deep, smooth(0, 50, c)); } } }
  return h;
}
// the road and the column's tracks (the map comes with them levelled: only their surface is drawn here)
function arCarve(x, z, h) {
  const lx = x - AR.o.x, lz = z - AR.o.z;
  { const d = Math.abs(lz - AR_ROAD); if (d < 12) { if (!MAPS.army) h = lerp(h, 4.2 + 1.2 * fbm(lx / 700, 0, 2), 1 - smooth(5, 12, d)); if (d < 4.5) mix3([0.26, 0.26, 0.25], [0.32, 0.31, 0.29], noise(lx / 8, lz / 8) * 0.5 + 0.5); } }
  if (lz < 480) { const d = Math.min(distPolyline(lx, lz, AR_ROUTE0_S), distPolyline(lx, lz, AR_ROUTE2_S)); if (d < 9) { h = lerp(h, h - 0.15, 1 - smooth(3, 9, d)); mixIn(PAL.sandL, 0.35 * (1 - smooth(1.5, 5, d))); } }
  return h;
}
function arBuild() {
  const C = CHAP.army; C.ground = makeGround({ x0: AR.o.x - 520, x1: AR.o.x + 980, z0: AR.o.z - 1180, z1: AR.o.z + 620, step: 3.6, h: mapH('army', arNat, arCarve), map: 'army', vegOk: (x, z) => { const lx = x - AR.o.x, lz = z - AR.o.z; return Math.abs(lz - AR_ROAD) > 7 && lz < coastZ(lx) - 6 && Math.min(distPolyline(lx, lz, AR_ROUTE0_S), distPolyline(lx, lz, AR_ROUTE2_S)) > 5; } }); GROUND = C.ground;
  const BAGS = [], sv = BATCH.bag; BATCH.bag = BAGS; const k0 = COVER.length; C.slots = [];
  const fox = (pts, grp, kinds) => pts.forEach(([x0, z0], i) => { const [x, z] = corr(grp === 'P' ? AR_ROUTE2 : grp === 'K' ? AR_KM : AR_ROUTE0, x0, z0, 23, 11); const [wx, wz] = AW(x, z); let bd = 1e9, tx = 0, tz = 0; for (const p of densify([...AR_ROUTE0, ...AR_ROUTE2], 12)) { const d = Math.hypot(p[0] - x, p[1] - z); if (d < bd) { bd = d; tx = p[0]; tz = p[1]; } } const dx = tx - x, dz = tz - z, l = Math.hypot(dx, dz) || 1; const s = foxhole(wx, wz, dx / l, dz / l, C.slots); s.grp = grp; s.kind = kinds[i % kinds.length]; });
  fox([[-90, -900], [150, -860], [-130, -650], [160, -560], [-100, -430], [120, -390], [-60, -300], [80, -980], [-70, -800], [90, -700], [-80, -520], [70, -340]], 'R', ['atgm', 'rifle', 'rpg', 'rifle', 'rifle', 'rpg', 'rifle', 'rifle', 'atgm', 'rifle', 'rifle', 'rpg']);
  fox([[180, -150], [230, -260], [-100, -150], [300, -230], [90, -150], [140, -250], [40, -260]], 'K', ['rpg', 'rifle', 'atgm', 'rifle', 'rifle', 'rifle', 'rpg']);
  fox([[170, 300], [300, 330], [210, 410], [320, 400], [120, 220]], 'P', ['atgm', 'rifle', 'rpg', 'rifle', 'atgm']);
  // the road: asphalt, telephone poles, a kilometre stone, burnt trucks from the morning
  roadRibbon([[-1150, AR_ROAD], [1150, AR_ROAD]].map(([x, z]) => AW(x, z)), 8, 'asphalt'); roadRibbon(AR_ROUTE0.map(([x, z]) => AW(x, z)), 6, 'dirt'); roadRibbon(AR_ROUTE2.map(([x, z]) => AW(x, z)), 6, 'dirt'); roadWrecks([[-1100, AR_ROAD], [1100, AR_ROAD]].map(([x, z]) => AW(x, z)), 7, 10117, 7);
  powerLine([[-1150, AR_ROAD - 12], [1150, AR_ROAD - 12]].map(([x, z]) => AW(x, z)), 48, 7.5); roadPoles([[-1150, AR_ROAD], [1150, AR_ROAD]].map(([x, z]) => AW(x, z)), 50, 5.2);
  { const L = (x, z) => [x - AR.o.x, z - AR.o.z], ok = (x, z) => { const [lx, lz] = L(x, z); return Math.abs(lz - AR_ROAD) > 9 && distPolyline(lx, lz, AR_ROUTE0) > 9 && distPolyline(lx, lz, AR_ROUTE2) > 9 && lz < coastZ(lx) - 8 && !C.slots.some((s) => Math.hypot(s.x - x, s.z - z) < 4); };
    const X0 = AR.o.x - 520, X1 = AR.o.x + 980, Z0 = AR.o.z - 1180, Z1 = AR.o.z + 600;
    const RT = [...AR_ROUTE0, ...AR_ROUTE2].map(([x, z]) => AW(x, z)), RD = [[-1150, AR_ROAD], [1150, AR_ROAD]].map(([x, z]) => AW(x, z));
    concealPatches([...patchesNear(RT, 40, 14, 120, 790, ok, 4, 8), ...patchesNear(RD, 30, 12, 90, 791, ok, 4, 8)], C, 792, 0.25);
    dressRoute(AR_ROUTE0.map(([x, z]) => AW(x, z)), ok, 700, 1.1); dressRoute(AR_ROUTE2.map(([x, z]) => AW(x, z)), ok, 720, 0.8); dressRoute(RD, ok, 740, 1.4); dressArea(X0, X1, Z0, Z1, ok, 760, 1.2);
    instScatter(ROCK_G, scatterIn(LITE ? 200 : 460, X0, X1, Z0, Z1, 601, ok, (x, z, r) => [x, z, 0.2 + r() ** 3 * 1.2, r() * 6, rockCol(r), 0.2, 0.55]).concat(scatterNear(RT, LITE ? 260 : 700, 9, 150, 611, ok, (x, z, r) => [x, z, 0.2 + r() ** 3 * 1.4, r() * 6, rockCol(r), 0.2, 0.55]), scatterNear(RD, LITE ? 160 : 420, 9, 120, 612, ok, (x, z, r) => [x, z, 0.2 + r() ** 3 * 1.2, r() * 6, rockCol(r), 0.2, 0.55])));
    instScatter(BUSH_G, scatterNear(RT, LITE ? 200 : 520, 10, 160, 613, ok, (x, z, r) => [x, z, 0.45 + r() * 0.8, r() * 6, dryBush(r), 0, 0.75]).concat(scatterNear(RD, LITE ? 120 : 300, 10, 120, 614, ok, (x, z, r) => [x, z, 0.45 + r() * 0.8, r() * 6, dryBush(r), 0, 0.75])));
    { const bl2 = scatterNear(RT, LITE ? 18 : 34, 20, 120, 615, ok, (x, z, r) => [x, z, 1.4 + r() * 2, r() * 6, rockCol(r), 0.3, 0.7]); instScatter(BOULDER_G, bl2); boulders(bl2); }
    const bl = scatterIn(LITE ? 34 : 56, X0, X1, Z0, Z1, 602, ok, (x, z, r) => [x, z, 1.3 + r() * 1.8, r() * 6, rockCol(r), 0.3, 0.7]); instScatter(BOULDER_G, bl); boulders(bl);
    const nb = []; C.slots.forEach((s) => { if (s.grp !== 'P') for (let k = 0; k < 4; k++) nb.push([s.x + rand(-3, 3), s.z + rand(-3, 3), rand(0.8, 1.3), rand(0, 6), dryBush(Math.random)]); });
    instScatter(BUSH_G, scatterIn(LITE ? 220 : 520, X0, X1, Z0, Z1, 603, ok, (x, z, r) => [x, z, 0.35 + r() * 0.6, r() * 6, dryBush(r), 0, 0.7]).concat(nb));
    // by the road: a coffee shack, a ruined checkpoint, kilometre stones, oil drums; huts and a fence at the port
    for (const [x, z, w, d, h, ru, col] of [[64, AR_ROAD + 18, 5, 4, 2.6, 0, '#d2c3a2'], [-84, AR_ROAD - 18, 4, 4, 2.4, 1, '#c8b896'], [520, AR_ROAD + 20, 6, 5, 3, 0, '#d8ccb0'], [-420, AR_ROAD + 16, 5, 4, 2.6, 1, '#c4b08a'], [150, 300, 5, 4, 2.8, 0, '#ddd2bb'], [330, 430, 6, 5, 3, 0, '#ddd2bb']]) { const [wx, wz] = AW(x, z); smallHut(wx, wz, w, d, h, col, 0x857660, !!ru); }
    { const ks = []; for (let x = -1100; x < 1100; x += 100) { const [wx, wz] = AW(x, AR_ROAD + 6.2); ks.push([G.box(0.35, 0.6, 0.18), 0xe6e0d0, M4(wx, groundAt(wx, wz) + 0.3, wz)], [G.box(0.36, 0.14, 0.19), 0xb03a2a, M4(wx, groundAt(wx, wz) + 0.62, wz)]); } scene.add(SH(onLayer1(new THREE.Mesh(build(ks), MAT.vc)))); }
    for (const [x, z] of [[70, AR_ROAD + 12], [-90, AR_ROAD - 12], [240, 330], [300, 360]]) { const [wx, wz] = AW(x, z); fieldDrums(wx, wz, 5); }
    wireFence([[140, 280], [340, 280], [360, 330]].map(([x, z]) => AW(x, z)));
  }
  { const [x, z] = AW(-14, AR_ROAD - 7); sign('ק״מ 101', 'plain', x, groundAt(x, z) + 1.0, z, 0, 1.0); const [a, b] = AW(30, AR_ROAD + 7); sign('القاهرة ← السويس', 'plain', a, groundAt(a, b) + 1.6, b, Math.PI, 1.4); }
  for (const [x, z, r] of [[420, AR_ROAD + 5, 0.1], [520, AR_ROAD - 9, 2.9], [-300, AR_ROAD + 10, 1.7]]) { const [wx, wz] = AW(x, z); vehicle(TRUCK_BURNT, wx, wz, r, 3.3, 1.2, 2.6); }
  for (const [x, z, b] of [[-200, -700, 30], [260, -480, 300]]) { const [wx, wz] = AW(x, z); placeTank(wx, wz, b, TANK_BURNT); }
  // Adabiya: the port at the foot of the mountain, a jetty into the gulf, fuel tanks
  { const parts = []; for (const [x, z, w, d, h] of [[200, 390, 18, 10, 6], [236, 404, 12, 8, 5], [292, 380, 20, 12, 7], [180, 350, 10, 10, 4]]) { const [wx, wz] = AW(x, z), y = groundAt(wx, wz) - 0.3; parts.push([boxUV(wx - w / 2, wx + w / 2, y, y + h, wz - d / 2, wz + d / 2, 3, 3), 0xd8ccb0]); addCollider(wx, wz, w / 2, d / 2, 0, y + h); coverBox(wx, wz, w / 2, d / 2, 0, 2.2); }
    const m = new THREE.Mesh(build(parts), new THREE.MeshStandardMaterial({ vertexColors: true, map: plasterTex(93, '#e2d8c2'), roughness: 0.95 })); scene.add(SH(onLayer1(m)));
    const [jx, jz] = AW(262, coastZ(262) + 30); const jt = new THREE.Mesh(new THREE.BoxGeometry(8, 1.2, 70), MAT.concrete); jt.position.set(jx, 0.6, jz); scene.add(SH(onLayer1(jt)));
    const tanks = new THREE.Mesh(build([0, 1, 2].map((i) => [G.cyl(5, 5, 7, 20), 0xd6d2c6, M4(i * 13, 3.5, 0)])), MAT.vc); const [tx, tz] = AW(330, 330); tanks.position.set(tx, groundAt(tx, tz), tz); scene.add(SH(onLayer1(tanks))); addCollider(tx + 13, tz, 19, 5.2, 0, groundAt(tx, tz) + 7); }
  // dug-in T-55s at the port: berms of sand in front of them
  for (const [x, z] of [[214, 336], [250, 344]]) { const [wx, wz] = AW(x, z); const arc = []; for (let a = -60; a <= 60; a += 15) { const t = THREE.MathUtils.degToRad(a) + Math.PI; arc.push([wx + Math.sin(t) * 4.2, wz + Math.cos(t) * 4.2]); } bagWall(arc, 4, groundAt(wx, wz) - 0.1, false); }
  for (const [x, z, s] of [[1500, -500, 90], [1200, 200, 60], [-200, -1600, 40], [900, -1200, 50]]) { const [wx, wz] = AW(x, z); smokeColumn(wx, wz, s, s > 55); }
  BATCH.bag = sv; if (BAGS.length) scene.add(bagMesh(BAGS)); C.covers = COVER.slice(k0); for (const c of C.covers) c.y = groundAt(c.x, c.z);
  // our column; the convoy that tries to break out; the guns and the dug-in tanks
  C.wings = [18, 34, 64].map((gap) => addVeh({ mode: 'army', side: 'f', kind: 'tank', geo: TANK_GEO, half: [3.4, 2.6, 1.9], guns: true, follow: { gap } }));
  C.ht = addVeh({ mode: 'army', side: 'f', kind: 'jeep', geo: HT_GEO, half: [3.0, 2.2, 1.2], guns: true, follow: { gap: 48 } });
  C.ht2 = addVeh({ mode: 'army', side: 'f', kind: 'jeep', geo: HT_GEO, half: [3.0, 2.2, 1.2], guns: true, follow: { gap: 80 } });
  C.guns = [[-12, -500], [22, -300]].map(() => addVeh({ mode: 'army', kind: 'atgun', geo: ATGUN_GEO, half: [1.4, 1.5, 0.9], armor: 0.15, hp: 60, shoots: true }));
  C.convoy = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => i === 2 || i === 6 ? addVeh({ mode: 'army', kind: 't55', geo: T55_HULL, turGeo: T55_TUR, turAt: [0.3, 1.42, 0], half: [3.2, 2.3, 1.75], armor: 0, shoots: true, vmax: 7 }) : addVeh({ mode: 'army', kind: 'truck', geo: ETRUCK_GEO, half: [3.2, 2.6, 1.2], armor: 0.14, vmax: 9 }));
  C.port = [[214, 336], [250, 344]].map(() => addVeh({ mode: 'army', kind: 't55', geo: T55_HULL, turGeo: T55_TUR, turAt: [0.3, 1.42, 0], half: [3.2, 2.3, 1.75], armor: 0, shoots: true }));
}
function arSetup(stage) {
  const C = CHAP.army; fieldSetupCommon(C, stage); C.escaped = 0; C.kT = 0; C.endT = 0;
  for (const v of VEH) if (v.mode === 'army') { vehRevive(v); v.path = null; v.stop = undefined; v.ended = false; v.shown = true; v.g.visible = true; v.onEnd = null; }
  if (stage === 0) tankStart(AR_ROUTE0, AW, 0, [pathLen(AR_ROUTE0) - 0.5]); else if (stage === 1) { tankStart(AR_ROUTE0, AW, pathLen(AR_ROUTE0) - 0.5, []); TANK.driveOn = false; } else tankStart(AR_ROUTE2, AW, 0, [pathLen(AR_ROUTE2) - 0.5]);
  TANK.vmax = 5.6;
  C.guns.forEach((v, i) => { const [x, z] = AW(...[[-12, -500], [22, -300]][i]); const hd = Math.atan2(-(x - TANK.g.position.x), -(z - TANK.g.position.z)); vehPose(v, x, z, hd); v.shown = stage === 0; v.g.visible = v.shown; v.alive = stage === 0; });
  C.convoy.forEach((v) => { v.shown = false; v.g.visible = false; });
  C.port.forEach((v, i) => { const [x, z] = AW(...[[214, 336], [250, 344]][i]); v.hdV = Math.PI; vehPose(v, x, z, Math.PI); v.shown = stage === 2; v.g.visible = v.shown; v.shoots = true; });
  C.wings.forEach((w, i) => { w.follow = { gap: [18, 34, 64][i] }; }); C.ht.follow = { gap: 48 }; C.ht2.follow = { gap: 80 };
  fieldFriends([]);
  arStage(stage);
}
function arStage(i) {
  const C = CHAP.army; fieldStage(C, i); AR.stage = i; AR.msgs = {};
  if (i === 0) { radio('מח״ט', 'כל התחנות, יוצאים דרומה לכביש סואץ–קהיר. מי שמחזיק את הכביש, מחזיק את הארמיה השלישית.', 5); for (const s of C.slots) if (s.grp === 'R') fSlotSpawn(s.kind, (q) => q === s, 'R'); C.squads = [[-860, 1], [-740, -1], [-600, -1], [-500, 1], [-400, 1], [-300, -1]]; }
  if (i === 1) { radio('מח״ט', 'הכביש בידינו. תצפית מדווחת על שיירה מצרית יוצאת מסואץ מערבה. אף רכב לא עובר.', 5); for (const s of C.slots) if (s.grp === 'K') fSlotSpawn(s.kind, (q) => q === s, 'K'); C.convoyT = 7; TANK.driveOn = false; }
  if (i === 2) { for (let k = 0; k < 26; k++) { const [x, z] = AW(...corr(AR_ROUTE2, 210 + rand(-30, 30), 360 + rand(-30, 40), 22)), [tx, tz] = AW(...corr(AR_ROUTE2, 150 + rand(-30, 30), 220 + rand(-40, 60), 18)); const e = fSpawnStreet(x, z, [[tx, tz]], k % 4 === 1 ? 'rpg' : 'rifle'); if (e) e.sq = 'P'; } C.port.forEach((v) => { v.shown = true; v.g.visible = true; v.shoots = true; }); radio('מח״ט', 'השיירה הושמדה. ממשיכים דרומה, לנמל עדבייה ולמפרץ. הארמיה תהיה מכותרת עד הערב.', 5); for (const s of C.slots) if (s.grp === 'P') fSlotSpawn(s.kind, (q) => q === s, 'P'); }
}
function arUpd(dt) {
  const C = CHAP.army; C.t += dt; if (Math.floor(C.t * 2) !== Math.floor((C.t - dt) * 2)) szEnemyCleanup();
  for (let i = DIRQ.length - 1; i >= 0; i--) if (DIRQ[i] && GAME.t >= DIRQ[i].at) { const q = DIRQ.splice(i, 1)[0]; q.fn(); }
  if (AR.stage === 0) {
    if (C.squads) for (const sq of C.squads) { const [sz, sd] = sq; if (sq.done) continue; const [, tz] = [0, 0]; const [px, pz] = tankAt(TANK.s); if (pz > sz - 170) { sq.done = true; for (let k = 0; k < 15; k++) { const [x, z] = AW(...corr(AR_ROUTE0, sd * rand(24, 60), sz + rand(-30, 30), 23, 12)), [tx, tz2] = AW(...corr(AR_ROUTE0, sd * rand(8, 30), sz + rand(-20, 20), 14, 5)); const e = fSpawnStreet(x, z, [[tx, tz2]], k === 3 ? 'rpg' : 'rifle'); if (e) e.sq = 'R'; } radio('תותחן', pick(['חי״ר מצרי רץ אל הציר!', 'כיתה מצרית בשיחים מימין!', 'חוליית בזוקה משמאל!']), 2.4); } }
    if (TANK.s > 300 && !AR.msgs.g) { AR.msgs.g = true; radio('תותחן', 'תותח נגד־טנקים על הגבעה משמאל! ועוד אחד בהמשך מימין!', 3); }
    if (TANK.holdAt != null && TANK.s > pathLen(AR_ROUTE0) - 1) { arStage(1); }
  } else if (AR.stage === 1) {
    if (C.convoyT > 0) { C.convoyT -= dt; if (C.convoyT <= 0) C.convoy.forEach((v, i) => { v.shown = true; v.g.visible = true; v.path = [AW(1050 + i * 34, AR_ROAD + (i % 2 ? 1.8 : -1.8)), AW(-1150, AR_ROAD + (i % 2 ? 1.8 : -1.8))]; v.s = 0; v.speed = v.vmax; v.hdV = -Math.PI / 2; v.ended = false; v.onEnd = (vv) => { if (vv.alive) { C.escaped++; vv.shown = false; vv.g.visible = false; vv.alive = false; radio('תצפית', 'רכב אחד חמק מערבה!', 2); } };
      if (v.kind === 'truck' && i % 3 === 1) { v.stop = 760 + i * 40; v.onStop = true; } }); }
    for (const v of C.convoy) if (v.alive && v.onStop && v.stop !== undefined && v.s >= v.stop - 0.6 && !v.unloaded) { v.unloaded = true; for (let k = 0; k < 12; k++) { const p = v.g.position, [tx, tz] = AW(rand(40, 200), AR_ROAD + rand(-22, 22)); const e = fSpawnStreet(p.x + rand(-2, 2), p.z + rand(-3, 3), [[tx, tz]], k === 1 ? 'rpg' : 'rifle'); if (e) e.sq = 'K'; } radio('תותחן', 'הם יורדים מהמשאית! חי״ר על הכביש!', 2.5); DIRQ.push({ at: GAME.t + 9, fn: () => { v.stop = undefined; } }); }
    const left = C.convoy.filter((v) => v.alive && v.g.visible).length;
    if (C.convoyT <= 0 && left === 0) C.kT = (C.kT || 0) + dt; if (C.convoyT <= 0 && left === 0 && holdDone(fieldLeft((e) => e.sq === 'K'), C.kT)) { fieldDespawn((e) => e.sq === 'K'); AR.msgs.done = (AR.msgs.done || 0) + dt; if (AR.msgs.done > 2.5) { if (C.escaped > 2) radio('מח״ט', `${C.escaped} רכבים חמקו. לא נורא, הם לא יגיעו רחוק. ממשיכים.`, 3); const hp = TANK.hp; tankStart(AR_ROUTE2, AW, 0, [pathLen(AR_ROUTE2) - 0.5]); TANK.hp = hp; TANK.vmax = 5.6; arStage(2); } }
  } else if (AR.stage === 2) {
    if (C.flag && C.raise) { C.raise += dt; C.flag.position.y = lerp(C.flagY - 7.2, C.flagY, smooth(0, 4.2, C.raise)); }
    if (TANK.holdAt != null && TANK.s > pathLen(AR_ROUTE2) - 1 && !AR.msgs.end) { C.endT = (C.endT || 0) + dt; if (C.endT > 20) for (const v of C.port) if (v.alive) { vehDestroy(v); radio('טנק 2', 'פגעתי בטנק החפור! הנמל נקי!', 3); }
      if (C.port.some((v) => v.alive) || !holdDone(fieldLeft((e) => e.sq === 'P'), C.endT)) { hint('ar-port', 'הטנקים החפורים בנמל עדיין יורים. השמידו אותם בתותח לפני שיורדים לחוף.', 6); } else { AR.msgs.end = true; arVictoryFilm(); } }
  }
}
/* film: the picture of victory. The column at the water's edge of the Gulf of Suez as the ceasefire comes into force */
function arVictoryFilm() {
  const C = CHAP.army, [bx, bz] = AW(244, coastZ(244) - 14), by = groundAt(bx, bz), beach = V3(bx, by, bz);
  const k0 = scene.children.length; flag(bx + 3, bz + 6, 'il', 7.5, Math.PI * 0.6); const fl = scene.children[scene.children.length - 1]; C.objs.push(fl); fl.position.y = by - 7.2;
  const men = []; for (let i = 0; i < 8; i++) { const f = FRIENDS[i], u = f.unit; f.state = 'post'; f.name = ['רמי', 'אבי', 'שלומי', 'דוד', 'גיל', 'מוטי', 'ארז', 'חיים'][i]; f.post = { id: 'V' + i, fx: 0, fz: 1, mag: null, occupant: f, stand: [0, 0] }; u.alive = true; u.rig.root.visible = true; u.place(bx + 4 + rand(-4, 4), bz + 3 + rand(-3, 4)); u.heading = Math.PI * 0.25 + rand(-0.5, 0.5); f.target = null; men.push(u); }
  for (const e of UNITS.enemies) if (e.alive) killEnemy(e, false);
  // prisoners: a file of Egyptian soldiers coming down to the beach with their hands up, their rifles left behind
  for (let k = 0; k < 9; k++) { const x = bx - 7 + (k % 2 ? 1.1 : -1.1), z = bz - 24 - Math.floor(k / 2) * 2.2, e = spawnEnemy(x, z, 'rifle', null, null); if (!e) continue; e.state = 'film'; e.noTag = true; e.tag.visible = false; e.stance = 'stand'; e.anim = k; FILMW.push({ u: e, dx: 0.16, dz: 0.987, sp: 0.85 + (k % 3) * 0.05, arms: HANDS_UP }); }
  const sea = V3(bx + 40, by + 6, bz + 60), fp = () => fl.position.clone().add(V3(0, 6, 0));
  playCine({ vid: 'ar_end',
    title: 'עדבייה, חוף מפרץ סואץ · 24 באוקטובר 1973 · 17:00',
    shots: [
      { d: 5.0, cam: camLerp(sea, V3(bx + 22, by + 4, bz + 42), beach.clone().add(V3(0, 2, 0)), beach.clone().add(V3(-10, 4, -10)), 50) },
      { d: 4.6, cam: (u) => ({ p: beach.clone().add(V3(9, 1.1, 12)), l: fl.position.clone().add(V3(0, 4 + u * 3, 0)), fov: 42 }) },
      { d: 6.2, cam: camOrbit(() => beach.clone().add(V3(2, 2, 2)), 26, 0.4, 1.6, 9, 50) },
    ],
    ev: [[5.0, () => { C.raise = 0.001; }], [15.8, () => {}]],
    caps: [[0.4, '<b>24 באוקטובר 1973, 17:00.</b> הפסקת האש נכנסת לתוקף.', 4.4], [5.2, 'כביש סואץ–קהיר חסום. הארמיה השלישית המצרית מכותרת על הגדה המזרחית של התעלה.', 4.6], [10.2, 'שמונה־עשר יום: מהבלימה במעוזים, דרך הצליחה, עד חופי מפרץ סואץ.', 5.6]],
    end: () => { fl.position.y = by; FILMW.length = 0; DIRQ.push({ at: GAME.t + 0.3, fn: () => endGame(true) }); },
  });
  C.flag = fl; C.flagY = by;
}
function arObj() {
  const C = CHAP.army;
  if (AR.stage === 0) { const [x, z] = AW(0, AR_ROAD); return [x, groundAt(x, z), z, 'כביש סואץ–קהיר']; }
  if (AR.stage === 1) return null;
  const alive = C.port.find((v) => v.alive); if (alive) return [alive.g.position.x, alive.g.position.y + 2, alive.g.position.z, 'טנק חפור'];
  const [x, z] = AW(252, 432); return [x, groundAt(x, z), z, 'מפרץ סואץ'];
}
function arItems(items) {
  const C = CHAP.army, S = AR_STAGES[AR.stage]; items.push(['go', (S.goal || S.sub) + (OBJ.on ? ' (◆)' : '')]);
  items.push([TANK.hp < 40 ? 'warn' : '', `מצב הטנק: ${Math.max(0, Math.round(TANK.hp))}% · פגז: ${TANK.gunT > 0 ? `טוען ${Math.ceil(TANK.gunT)}` : 'מוכן'}`]);
  if (PROJ.some((q) => q.type === 'atgm')) items.push(['warn', 'סאגר באוויר! הרגו את המפעיל (סימון צהוב)']);
  if (AR.stage === 1) { const left = C.convoy.filter((v) => v.alive && v.g.visible).length; items.push(['next', C.convoyT > 0 ? `השיירה מגיעה בעוד ${Math.ceil(C.convoyT)} שנ׳` : `רכבים בשיירה: ${left} · חמקו: ${C.escaped}`]); }
  if (AR.stage === 2) items.push(['', `טנקים חפורים בנמל: ${C.port.filter((v) => v.alive).length}`]);
}
function arHints() {
  if (GAME.t > 1) hint('sz-tank', TOUCH ? `אתם מפקד הטנק. <kbd>אש</kbd> = מקלע 0.5, <kbd>רימון</kbd> = פגז, <kbd>כוונת</kbd> = כוונת התותחן.` : `אתם מפקד הטנק. ${K('לחיצה ממושכת')} מקלע 0.5, ${K('G')} פגז מהתותח, לחצן ימני כוונת תותחן, ${K('C')} להיכנס לצריח.`, 10);
  if (AR.stage === 1 && CHAP.army.convoyT <= 0) hint('ar-convoy', 'פגז אחד עוצר משאית. הטנקים בשיירה יורים בחזרה: אותם קודם.', 7);
}
function arMini(g, X, poly, dot, k) {
  const W = (pts) => pts.map(([x, z]) => AW(x, z)); const coast = []; for (let x = -1500; x <= 1500; x += 100) coast.push([x, coastZ(x)]);
  miniField(g, X, poly, dot, k, { bg: 'rgba(160,140,108,.92)', polys: [[W([...coast, [1500, 2000], [-1500, 2000]]), 'rgba(28,70,86,.95)'], [W([[-1500, -2000], [-420, -2000], [-420, 2000], [-1500, 2000]]), 'rgba(120,98,74,.9)']], lines: [[W([[-1200, AR_ROAD], [1200, AR_ROAD]]), 7, 'rgba(60,60,58,.95)'], [W(AR_ROUTE0), 3, 'rgba(120,98,66,.8)'], [W(AR_ROUTE2), 3, 'rgba(120,98,66,.8)']] });
}
function arEnd(win, why) {
  const stats = [[STATS.kills, 'אויבים ורכבים הושמדו'], [Math.max(0, Math.round(TANK.hp)), 'מצב הטנק %'], [AR.stage + 1, 'השלב שהגעתם אליו']];
  if (win) return ['הארמיה השלישית מכותרת', 'עם כניסת הפסקת האש, ב־24 באוקטובר 1973, עמדו כוחות צה״ל על כביש סואץ–קהיר ועל חוף מפרץ סואץ בעדבייה. כעשרים אלף חיילי הארמיה השלישית נותרו מנותקים על הגדה המזרחית. בקילומטר 101 של הכביש נפגשו אחר כך הקצינים של שני הצדדים לשיחות הראשונות.', stats];
  if (why === 'tank') return ['הטנק הושמד', 'התותחים נגד־טנקים והטנקים המצריים יורים מרחוק. עצרו מאחורי קפל קרקע, היכנסו לצריח, ותנו את הפגז הראשון.', stats];
  return ['נפגעת', 'המפקד חשוף בצריח: כשיורים עליכם, היכנסו פנימה וירו בכוונת התותחן.', stats];
}
CHAP.army = { stages: AR_STAGES, st: () => AR.stage, cp: () => CHAP.army.cpN || 0, upd: arUpd, obj: arObj, hints: arHints, items: arItems, mini: arMini, restore: fieldRestore, end: arEnd, tank: true,
  tod: () => [14 * 60 + 50, 15 * 60 + 20, 15 * 60 + 50][AR.stage] - START_MIN + CHAP.army.t / 6 + (CINE.on && CHAP.army.flag ? 4 : 0),
  build: () => chapterBuild(CHAP.army, arBuild), setup: arSetup, clock: '24.10.1973 · מערבית לסואץ', toast: ['24 באוקטובר 1973 · 14:50', 'הטור יוצא לנתק את הארמיה השלישית'], start: () => fieldStart('army') };
