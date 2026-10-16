
/* ================= chapter 5: the encirclement of the Third Army, 24 October 1973 =================
   The armoured columns cut the Suez-Cairo road behind the Egyptian Third Army and reach the Gulf of Suez at Adabiya.
   At five in the afternoon the ceasefire comes into force: the Third Army is surrounded on the east bank.
   The chapter is told in three moves, each with its own goal: break through two defended lines to the road; hold the junction at km 101
   against the attempt to break the ring (three assaults from three directions); then the last dug-in tanks at the port, and the sea.
   The defenders fight like defenders: in foxholes behind sandbag parapets, with Sagger crews behind them, hull-down tanks in pits and a
   reserve that runs up to the parapet when the column halts. Every place is fixed; the level decides how many come. */
const AR = { o: { x: 7000, z: -7000 }, stage: 0, t: 0, cp: 0, msgs: {}, wave: -1, waveT: 0, lull: 0, stopT: 0, base: null, amb: 0 };
const AW = toWorld(AR.o);
const AR_STAGES = [
  { title: 'פריצה אל הכביש', sub: '24 באוקטובר, אחר הצהריים. החטיבה פורצת דרומה, מהשדות המושקים אל כביש סואץ–קהיר — העורק האחרון של הארמיה השלישית. בדרך שני קווי הגנה מצריים: שוחות מעבר לתעלת ההשקיה, ומחסום עם טנקים חפורים לפני הצומת של קילומטר 101.', goal: 'עצרו בעמדת הירי והשמידו כל קו: הטנק החפור (רק הצריח בולט מעל הסוללה), צוותי הסאגר והשוחות. אחר כך — לצומת' },
  { title: 'הצומת בקילומטר 101', sub: 'הכביש בידינו. מעכשיו שום דבר לא עובר בין קהיר לסואץ — והמצרים יודעים את זה. הארמיה תנסה לפרוץ את הטבעת בכל הכוח: ממזרח לאורך הכביש, מדרום מכיוון עדבייה, וממערב מכיוון קהיר. הטנק שלכם עומד בצומת.', goal: 'החזיקו את הצומת: שלוש הסתערויות משלושה כיוונים. אף רכב ואף חייל לא עוברים' },
  { title: 'הים', sub: 'ההתקפה נשברה. נשאר לסגור את הטבעת על חוף המפרץ: נמל עדבייה, לרגלי ג׳בל עטאקה. שם חפורים הטנקים האחרונים, מאחורי גדר תיל ושוחות — והשעון מתקתק אל הפסקת האש.', goal: 'דרומה לעדבייה: השמידו את הטנקים החפורים ואת השוחות שלפני הנמל, ורדו לחוף' },
];
const AR_ROUTE0 = [[60, -1100], [40, -930], [-30, -760], [30, -560], [-10, -380], [0, -232]];
const AR_ROUTE2 = [[0, -232], [10, -170], [60, -40], [130, 110], [190, 250], [236, 370], [252, 432]], AR_ROUTE0_S = smoothPath(AR_ROUTE0, 5), AR_ROUTE2_S = smoothPath(AR_ROUTE2, 5);
const AR_ROAD = -200, AR_KM = [[-140, AR_ROAD], [340, AR_ROAD]];
const coastZ = (lx) => 520 - 0.25 * lx;
// the drives are short: the column starts a hundred metres above the canal and halts at a firing position before each line (metres along the route)
const AR_S0 = 300, AR_STOP1 = 402, AR_STOP2 = 688, AR2_S0 = 220, AR2_STOP = 468, AR_V = 7.4;
const arD = () => Math.max(0, DIFF.indexOf(diff));
/* the tanks dug in hull-down: a pit for the hull and a berm of sand before it; only the turret shows, and the turret is what you hit.
   [x, z, facing] */
const AR_PITS = { Q: [[-60, -548, 2.89]], K: [[-95, -300, 2.53], [105, -288, -2.55]], S: [[-80, -40, 2.75]], P: [[214, 336, -2.82], [250, 344, -2.62]] };
const AR_PITL = Object.values(AR_PITS).flat(), AR_PD = 0.75, AR_PB = 0.5;   // pit depth, berm height: the berm hides the tracks and the lower hull, the turret and the top of the hull show
/* the lines: foxholes [x, z, kind]; sandbag parapets in front of them (toward the column); the reserve that runs up from behind when the column halts */
const AR_LINES = {
  Q: { slots: [[-112, -565, 'rifle'], [-74, -578, 'rpg'], [-38, -593, 'lmg'], [36, -626, 'rifle'], [72, -642, 'rpg'], [110, -655, 'rifle'], [-150, -540, 'atgm'], [148, -650, 'atgm']],
    walls: [[[-150, -563], [-112, -573], [-74, -586], [-42, -600]], [[30, -634], [72, -650], [110, -663], [150, -672]]], res: [[-70, -520], [80, -590]], resTo: [[-93, -575], [91, -652]] },
  K: { slots: [[-62, -326, 'rpg'], [-28, -316, 'lmg'], [28, -320, 'rifle'], [62, -330, 'rpg'], [-140, -292, 'atgm'], [146, -282, 'atgm'], [-74, -282, 'rifle'], [80, -276, 'rifle']],
    walls: [[[-92, -336], [-52, -338], [-14, -326]], [[14, -328], [52, -340], [94, -340]]], res: [[-40, -222], [40, -222]], resTo: [[-45, -332], [33, -330]] },
  P: { slots: [[150, 300, 'rifle'], [186, 312, 'rpg'], [282, 318, 'lmg'], [310, 352, 'rifle'], [232, 318, 'atgm'], [122, 262, 'rpg'], [262, 302, 'rifle']],
    walls: [[[136, 290], [166, 296], [198, 302]], [[242, 288], [272, 294], [302, 306]]], res: [[226, 386], [290, 372]], resTo: [[176, 301], [276, 299]] },
};
// small ambushes on the drives between the lines: two men each, up out of holes in the scrub as the column passes [trigger: tank z, shooters]
const AR_AMB = { 0: [[-600, [[-48, -512, 'rpg'], [-66, -478, 'rifle']]], [-540, [[52, -470, 'rpg'], [70, -436, 'lmg']]]], 2: [[-20, [[18, 42, 'rpg'], [150, 40, 'rifle']]], [90, [[96, 176, 'rpg'], [206, 150, 'lmg']]]] };
/* the junction: three assaults, each from its own direction, along fixed lanes. A squad starts at `from` and runs through its waypoints
   (the backs of sandbag walls and wrecks facing the junction) and then fights from that cover - some hold it, some storm on.
   [delay s, from, waypoints] */
const AR_WAVES = [
  { tag: 'E', name: 'ממזרח, לאורך הכביש מסואץ', at: [300, -200], jeeps: [1, 2, 3], t55: [1, 1, 1],
    sq: [[4, [420, -206], [[300, -212], [236, -216], [150, -212]]], [10, [430, -188], [[310, -186], [240, -184], [118, -188]]], [17, [360, -150], [[262, -160], [184, -178]]], [25, [400, -250], [[282, -246], [194, -234], [96, -224]]]] },
  { tag: 'S', name: 'מדרום, מכיוון עדבייה', at: [20, -60], pits: [[150, -40], [-120, -30]],
    sq: [[3, [-60, 30], [[-50, -60], [-58, -118]]], [8, [40, 45], [[30, -50], [22, -102]]], [14, [130, 20], [[112, -60], [96, -122]]], [22, [-130, 10], [[-110, -80], [-90, -136]]], [30, [60, 50], [[30, -50], [56, -158]]]] },
  { tag: 'W', name: 'ממערב, מכיוון קהיר — וממזרח', at: [-300, -200], t55w: [1, 2, 2],
    sq: [[4, [-380, -210], [[-290, -214], [-214, -218], [-110, -214]]], [10, [-390, -186], [[-300, -184], [-208, -182], [-104, -186]]], [8, [420, -206], [[300, -212], [236, -216], [150, -212]]], [16, [-340, -140], [[-262, -150], [-150, -176]]], [22, [360, -150], [[262, -160], [184, -178], [118, -188]]], [28, [-330, -250], [[-250, -240], [-150, -216]]]] },
];
const AR_JCOV = [[236, -216], [240, -184], [184, -178], [194, -234], [150, -212], [300, -212], [310, -186], [262, -160], [282, -246], [118, -188], [96, -224], [-110, -214], [-104, -186],
  [-58, -118], [22, -102], [96, -122], [-90, -136], [56, -158], [-50, -60], [30, -50], [112, -60], [-110, -80],
  [-214, -218], [-208, -182], [-150, -176], [-290, -214], [-300, -184], [-262, -150], [-250, -240], [-150, -216]];
const AR_J = [0, -232];
// the back of a junction cover: where a man runs to, with the wall between him and the junction
function arCovPt(x, z) { const dx = AR_J[0] - x, dz = AR_J[1] - z, l = Math.hypot(dx, dz) || 1; return [x - dx / l * 1.3, z - dz / l * 1.3]; }
// past the end of that wall, a step toward the junction: the way on from one cover to the next goes round the sandbags, not into them
function arSidePt(x, z, k) { const dx = AR_J[0] - x, dz = AR_J[1] - z, l = Math.hypot(dx, dz) || 1, fx = dx / l, fz = dz / l, sd = k % 2 ? 1 : -1; return [x + fz * sd * 3.2 + fx * 0.8, z - fx * sd * 3.2 + fz * 0.8]; }
// a man's lane through his squad's covers (world points): the back of each, round its end to the next; one who storms goes on from the last
function arLane(covs, k, storm) { const p = []; covs.forEach(([x, z], c) => { p.push(AW(...arCovPt(x, z))); if (c < covs.length - 1 || storm) p.push(AW(...arSidePt(x, z, k))); }); if (storm) { const l = covs[covs.length - 1]; p.push(arStormPt(l[0], l[1], k)); } return p; }
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
// a pit at p: depth k (0..1) in the pit, height of the berm before it
function arPitK(p, lx, lz) {
  const fx = Math.sin(p[2]), fz = Math.cos(p[2]), dx = lx - p[0], dz = lz - p[1], u = dx * fx + dz * fz, v = dx * fz - dz * fx;
  const pit = (1 - smooth(4.3, u < 0 ? 8.5 : 5.6, Math.abs(u))) * (1 - smooth(2.3, 3.7, Math.abs(v)));   // the ramp out is at the back
  const berm = smooth(3.8, 5.6, u) * (1 - smooth(7.2, 9.4, u)) * (1 - smooth(3.6, 5.4, Math.abs(v))) + 0.5 * (1 - smooth(4.2, 6.2, Math.abs(u))) * smooth(3.5, 4.6, Math.abs(v)) * (1 - smooth(5.6, 7.2, Math.abs(v)));
  return [pit, berm];
}
// the road and the column's tracks (the map comes with them levelled: only their surface is drawn here), and the tank pits
function arCarve(x, z, h) {
  const lx = x - AR.o.x, lz = z - AR.o.z;
  { const d = Math.abs(lz - AR_ROAD); if (d < 12) { if (!MAPS.army) h = lerp(h, 4.2 + 1.2 * fbm(lx / 700, 0, 2), 1 - smooth(5, 12, d)); if (d < 4.5) mix3([0.26, 0.26, 0.25], [0.32, 0.31, 0.29], noise(lx / 8, lz / 8) * 0.5 + 0.5); } }
  if (lz < 480) { const d = Math.min(distPolyline(lx, lz, AR_ROUTE0_S), distPolyline(lx, lz, AR_ROUTE2_S)); if (d < 9) { h = lerp(h, h - 0.15, 1 - smooth(3, 9, d)); mixIn(PAL.sandL, 0.35 * (1 - smooth(1.5, 5, d))); } }
  for (const p of AR_PITL) { if (Math.abs(lx - p[0]) > 14 || Math.abs(lz - p[1]) > 14) continue; if (p.h0 === undefined) p.h0 = AR.base(AR.o.x + p[0], AR.o.z + p[1]);
    const [k, b] = arPitK(p, lx, lz); if (b > 0) { h += AR_PB * b; mixIn(PAL.sandL, 0.5 * b); } if (k > 0) { h = lerp(h, p.h0 - AR_PD, k); mixIn(PAL.sandD, 0.6 * k); } }
  return h;
}
function arBuild() {
  const C = CHAP.army; AR.base = mapH('army', arNat);
  const fineX = AR_PITL.map((p) => [AR.o.x + p[0] - 10, AR.o.x + p[0] + 10, 1.1]), fineZ = AR_PITL.map((p) => [AR.o.z + p[1] - 10, AR.o.z + p[1] + 10, 1.1]);
  const nearWork = (lx, lz) => AR_PITL.some((p) => Math.hypot(lx - p[0], lz - p[1]) < 13);
  C.ground = makeGround({ x0: AR.o.x - 520, x1: AR.o.x + 980, z0: AR.o.z - 1180, z1: AR.o.z + 620, step: 3.6, fineX, fineZ, h: mapH('army', arNat, arCarve), map: 'army', vegOk: (x, z) => { const lx = x - AR.o.x, lz = z - AR.o.z; return Math.abs(lz - AR_ROAD) > 7 && lz < coastZ(lx) - 6 && Math.min(distPolyline(lx, lz, AR_ROUTE0_S), distPolyline(lx, lz, AR_ROUTE2_S)) > 5 && !nearWork(lx, lz); }, grass: 'dry' }); GROUND = C.ground;
  const BAGS = [], sv = BATCH.bag; BATCH.bag = BAGS; const k0 = COVER.length; C.slots = []; C.walls = [];
  const face = (x, z, tx, tz) => { const dx = tx - x, dz = tz - z, l = Math.hypot(dx, dz) || 1; return [dx / l, dz / l]; };
  // the lines: a foxhole for each man, facing the firing position the column halts at; parapets of sandbags (cover for the reserve too)
  for (const [id, L] of Object.entries(AR_LINES)) { const st = id === 'Q' ? AR_STOP1 : id === 'K' ? AR_STOP2 : AR2_STOP, [sx, sz] = pathAt(id === 'P' ? AR_ROUTE2 : AR_ROUTE0, st);
    L.slots.forEach(([x, z, kind]) => { const [wx, wz] = AW(x, z), [fx, fz] = face(x, z, sx, sz), s = foxhole(wx, wz, fx, fz, C.slots); s.grp = id; s.kind = kind; });
    for (const w of L.walls) { const pts = densify(w, 3).map(([x, z]) => AW(x, z)); bagWall(pts, 4); C.walls.push(...pts); } }
  for (const [st, list] of Object.entries(AR_AMB)) list.forEach(([, sh], i) => sh.forEach(([x, z, kind], k) => { const [wx, wz] = AW(x, z), R = st === '0' ? AR_ROUTE0 : AR_ROUTE2; let bd = 1e9, fx = 0, fz = 1; for (const p of densify(R, 10)) { const d = Math.hypot(p[0] - x, p[1] - z); if (d < bd) { bd = d; [fx, fz] = face(x, z, p[0], p[1]); } } const s = foxhole(wx, wz, fx, fz, C.slots); s.grp = `am${st}_${i}`; s.kind = kind; }));
  for (const [x, z] of AR_WAVES[1].pits) { const [wx, wz] = AW(x, z), [fx, fz] = face(x, z, AR_J[0], AR_J[1]), s = foxhole(wx, wz, fx, fz, C.slots); s.grp = 'Sp'; s.kind = 'atgm'; }
  // the junction's approaches: sandbag walls and wrecks facing it, the cover the assaults run from one to the next
  for (const [x, z] of AR_JCOV) { const [fx, fz] = face(x, z, AR_J[0], AR_J[1]), pts = [AW(x + fz * 1.7, z - fx * 1.7), AW(x - fz * 1.7, z + fx * 1.7)]; bagWall(pts, 4); C.walls.push(...pts); }
  for (const [x, z, r] of [[252, -196, 0.3], [168, -222, 2.8], [-282, -206, 1.4], [-176, -214, 0.2], [420, AR_ROAD + 5, 0.1], [520, AR_ROAD - 9, 2.9]]) { const [wx, wz] = AW(x, z); rsJeepWreck(wx, wz, r, 'e'); }
  // our own position at the junction: a horseshoe of sandbags round the tank's place (low: it does not stop a shot)
  { const arc = []; for (let a = -110; a <= 110; a += 20) { const t = THREE.MathUtils.degToRad(a); arc.push(AW(AR_J[0] + Math.sin(t) * 6.5, AR_J[1] + 3 + Math.cos(t) * 6.5)); } bagWall(arc, 3, null, false); }
  const nearW = (x, z) => C.walls.some((w) => Math.abs(w[0] - x) < 3 && Math.abs(w[1] - z) < 3);
  // the lines of fire from each firing position to its dug-in tanks are kept clear of boulders (a rock in the way would take every shell)
  const lanes = []; for (const [id, R, st] of [['Q', AR_ROUTE0, AR_STOP1], ['K', AR_ROUTE0, AR_STOP2], ['S', AR_ROUTE0, pathLen(AR_ROUTE0) - 0.5], ['P', AR_ROUTE2, AR2_STOP]]) { const [sx, sz] = pathAt(R, st); for (const p of AR_PITS[id]) lanes.push([[sx, sz], [p[0], p[1]]]); }
  const nearLane = (lx, lz) => lanes.some((l) => distPolyline(lx, lz, l) < 7) || Math.hypot(lx - AR_J[0], lz - AR_J[1]) < 28;   // and the junction's own field of fire
  // the road: asphalt, telephone poles, a kilometre stone, burnt-out jeeps from the morning
  roadRibbon([[-1150, AR_ROAD], [1150, AR_ROAD]].map(([x, z]) => AW(x, z)), 8, 'asphalt'); roadRibbon(AR_ROUTE0.map(([x, z]) => AW(x, z)), 6, 'dirt'); roadRibbon(AR_ROUTE2.map(([x, z]) => AW(x, z)), 6, 'dirt'); rsRoadWrecks([[-1100, AR_ROAD], [1100, AR_ROAD]].map(([x, z]) => AW(x, z)), 7, 10117, 7);
  powerLine([[-1150, AR_ROAD - 12], [1150, AR_ROAD - 12]].map(([x, z]) => AW(x, z)), 48, 7.5); roadPoles([[-1150, AR_ROAD], [1150, AR_ROAD]].map(([x, z]) => AW(x, z)), 50, 5.2);
  { const L = (x, z) => [x - AR.o.x, z - AR.o.z], ok = (x, z) => { const [lx, lz] = L(x, z); return Math.abs(lz - AR_ROAD) > 9 && distPolyline(lx, lz, AR_ROUTE0) > 9 && distPolyline(lx, lz, AR_ROUTE2) > 9 && lz < coastZ(lx) - 8 && !C.slots.some((s) => Math.hypot(s.x - x, s.z - z) < 4) && !nearW(x, z) && !nearWork(lx, lz) && !nearLane(lx, lz); };
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
    for (const [x, z] of [[70, AR_ROAD + 12], [-90, AR_ROAD - 12], [206, 372], [300, 360]]) { const [wx, wz] = AW(x, z); fieldDrums(wx, wz, 5); }
    wireFence([[140, 280], [340, 280], [360, 330]].map(([x, z]) => AW(x, z)));
  }
  { const [x, z] = AW(-14, AR_ROAD - 7); sign('ק״מ 101', 'plain', x, groundAt(x, z) + 1.0, z, 0, 1.0); const [a, b] = AW(30, AR_ROAD + 7); sign('القاهرة ← السويس', 'plain', a, groundAt(a, b) + 1.6, b, Math.PI, 1.4); }
  for (const [x, z, b] of [[-200, -700, 30], [260, -480, 300]]) { const [wx, wz] = AW(x, z); placeTank(wx, wz, b, TANK_BURNT); }
  // Adabiya: the port at the foot of the mountain, a jetty into the gulf, fuel tanks
  { const parts = []; for (const [x, z, w, d, h] of [[200, 390, 18, 10, 6], [236, 404, 12, 8, 5], [292, 380, 20, 12, 7], [180, 350, 10, 10, 4]]) { const [wx, wz] = AW(x, z), y = groundAt(wx, wz) - 0.3; parts.push([boxUV(wx - w / 2, wx + w / 2, y, y + h, wz - d / 2, wz + d / 2, 3, 3), 0xd8ccb0]); addCollider(wx, wz, w / 2, d / 2, 0, y + h); coverBox(wx, wz, w / 2, d / 2, 0, 2.2); }
    const m = new THREE.Mesh(build(parts), new THREE.MeshStandardMaterial({ vertexColors: true, map: plasterTex(93, '#e2d8c2'), roughness: 0.95 })); scene.add(SH(onLayer1(m)));
    const [jx, jz] = AW(262, coastZ(262) + 30); const jt = new THREE.Mesh(new THREE.BoxGeometry(8, 1.2, 70), MAT.concrete); jt.position.set(jx, 0.6, jz); scene.add(SH(onLayer1(jt)));
    const tanks = new THREE.Mesh(build([0, 1, 2].map((i) => [G.cyl(5, 5, 7, 20), 0xd6d2c6, M4(i * 13, 3.5, 0)])), MAT.vc); const [tx, tz] = AW(330, 330); tanks.position.set(tx, groundAt(tx, tz), tz); scene.add(SH(onLayer1(tanks))); addCollider(tx + 13, tz, 19, 5.2, 0, groundAt(tx, tz) + 7); }
  for (const [x, z, s] of [[1500, -500, 90], [1200, 200, 60], [-200, -1600, 40], [900, -1200, 50]]) { const [wx, wz] = AW(x, z); smokeColumn(wx, wz, s, s > 55); }
  BATCH.bag = sv; if (BAGS.length) scene.add(bagMesh(BAGS)); C.covers = COVER.slice(k0); for (const c of C.covers) c.y = groundAt(c.x, c.z);
  // our column; the Egyptian jeeps and tanks of the assaults; the tanks dug in at the lines and the port
  C.wings = [18, 34, 64].map((gap) => addVeh({ mode: 'army', side: 'f', kind: 'tank', geo: TANK_GEO, half: [3.4, 2.6, 1.9], guns: true, follow: { gap } }));
  C.ht = addVeh({ mode: 'army', side: 'f', kind: 'jeep', geo: JEEP_GEO, half: [3.0, 2.2, 1.2], guns: true, follow: { gap: 48 } });
  C.ht2 = addVeh({ mode: 'army', side: 'f', kind: 'jeep', geo: JEEP_GEO, half: [3.0, 2.2, 1.2], guns: true, follow: { gap: 80 } });
  const t55 = () => addVeh({ mode: 'army', kind: 't55', geo: T55_HULL, turGeo: T55_TUR, turAt: [0.3, 1.42, 0], half: [3.2, 2.3, 1.75], armor: 0, shoots: true, vmax: 7 });
  C.ej = [0, 1, 2].map(() => addVeh({ mode: 'army', kind: 'jeep', geo: JEEP_GEO, half: [3.2, 2.6, 1.2], armor: 0.14, hp: 60, mg: true, vmax: 9 }));
  C.et = [0, 1, 2, 3].map(t55);
  C.dug = {}; for (const [id, list] of Object.entries(AR_PITS)) C.dug[id] = list.map((p) => { const v = t55(); v.pit = p; return v; });
}
/* a tank in its pit: on the pit's flat floor, facing out over the berm. The hit boxes are the T-55's own (hull, turret, gun); half[1] only
   sets where the aim help points (0.6 of it: the upper turret, the part that shows over the berm - aimed lower, its sight line would graze the
   berm and the help would hand the shell to a man in a foxhole beside the tank) */
function arPitPose(v) { const p = v.pit, [x, z] = AW(p[0], p[1]); v.hdV = p[2]; vehPose(v, x, z, p[2]); v.half = [3.5, 4.6, 1.7]; v.path = null; v.follow = null; if (v.tur) v.tur.rotation.y = 0; }
// a line's defenders: each in his hole, down until the column comes within 230 m (then up, and firing)
function arLine(id) { const C = CHAP.army, d = arD(); let k = 0;
  for (const s of C.slots) if (s.grp === id) { const n = k++; if (d === 0 && s.kind === 'atgm' && n % 2) continue; const e = fSlotPlace(s, s.kind === 'atgm' ? 'rpg' : s.kind, id, { wakeR: 230 }); if (!e) continue; e.atgm = s.kind === 'atgm'; if (e.atgm) e.rpgCd = 7 + n; e.rpgMiss = d === 0 && s.kind === 'rpg'; }
  for (const v of C.dug[id] || []) { vehRevive(v); arPitPose(v); v.shown = true; v.g.visible = true; v.shoots = id !== 'K'; v.fireCd = 8 + (v.pit[0] > 0 ? 4 : 0); }   // the road block's tanks hold their fire until the column is across the canal
}
// its reserve: riflemen running up from behind to the parapet when the column halts before the line
function arReserve(id) { const L = AR_LINES[id], n = [3, 4, 6][arD()];
  L.res.forEach(([x, z], j) => { const [tx, tz] = L.resTo[j]; for (let k = 0; k < n; k++) { const [wx, wz] = AW(x + (k % 3 - 1) * 2.4, z + Math.floor(k / 3) * 2.4), [gx, gz] = AW(tx + (k - (n - 1) / 2) * 2.4, tz); const e = fSpawnStreet0(wx, wz, [[gx, gz]], k === 2 ? 'rpg' : 'rifle'); if (e) { e.sq = id; e.tac = 'hold'; } } });
}
function arSetup(stage) {
  const C = CHAP.army; fieldSetupCommon(C, stage); C.kT = 0; C.endT = 0; AR.stopT = 0; AR.wave = -1; AR.waveT = 0; AR.lull = 0; AR.amb = 0; AR.wv = [];
  for (const v of VEH) if (v.mode === 'army') { vehRevive(v); v.path = null; v.stop = undefined; v.ended = false; v.shown = false; v.g.visible = false; v.onEnd = null; v.tgtV = null; }
  for (const v of [...C.wings, C.ht, C.ht2]) { v.shown = true; v.g.visible = true; }
  // the dug-in tanks of lines already taken stand burnt out in their pits
  { const k0 = STATS.kills; for (const [id, list] of Object.entries(C.dug)) list.forEach((v) => { arPitPose(v); const done = (stage >= 1 && (id === 'Q' || id === 'K')) || (stage >= 2 && id === 'S'); if (done) { v.shown = true; v.g.visible = true; v.alive = true; vehDestroy(v, true); } }); STATS.kills = k0; }
  if (stage === 0) { tankStart(AR_ROUTE0, AW, AR_S0, [AR_STOP1, AR_STOP2, pathLen(AR_ROUTE0) - 0.5]); arLine('Q'); arLine('K'); }
  else if (stage === 1) { tankStart(AR_ROUTE0, AW, pathLen(AR_ROUTE0) - 0.5, []); TANK.driveOn = false; arJunction(); }
  else { tankStart(AR_ROUTE2, AW, AR2_S0, [AR2_STOP, pathLen(AR_ROUTE2) - 0.5]); arLine('P'); }
  TANK.vmax = AR_V;
  if (stage !== 1) { C.wings.forEach((w, i) => { w.follow = { gap: [18, 34, 64][i] }; }); C.ht.follow = { gap: 48 }; C.ht2.follow = { gap: 80 }; }
  fieldFriends([]);
  arStage(stage);
}
/* the junction: our tank in its horseshoe at the crossing, the wingmen covering the road east and west, the jeeps behind; the dug-in tank
   to the south is already there in its pit, silent until its assault */
function arJunction() {
  const C = CHAP.army, put = (v, x, z, hd) => { v.follow = null; v.path = null; v.hdV = hd; const [wx, wz] = AW(x, z); vehPose(v, wx, wz, hd); v.shown = true; v.g.visible = true; };
  put(C.wings[0], -26, -214, -Math.PI / 2); put(C.wings[1], 28, -216, Math.PI / 2); put(C.wings[2], 12, -262, Math.PI * 0.85); put(C.ht, -14, -280, 0); put(C.ht2, 16, -296, 0);
  for (const v of C.dug.S) { vehRevive(v); arPitPose(v); v.shown = true; v.g.visible = true; v.shoots = false; }
}
function arStage(i) {
  const C = CHAP.army; fieldStage(C, i); AR.stage = i; AR.msgs = {}; AR.stopT = 0;
  if (i === 0) { radio('מח״ט', 'כל התחנות, פורצים דרומה לכביש סואץ–קהיר. מי שמחזיק את הכביש — מחזיק את הארמיה השלישית. לפנינו שני קווים שלהם. עוצרים, מנקים, ממשיכים.', 6); DIRQ.push({ at: GAME.t + 7, fn: () => hint('ar-line', 'הטור עוצר בעמדת ירי מול כל קו הגנה. הטנק החפור מסתתר מאחורי סוללת עפר — רק הצריח בולט, ובו פוגעים. צוות סאגר: סימון צהוב — לחסל לפני שהטיל מגיע.', 10) }); }
  if (i === 1) { radio('מח״ט', 'הכביש בידינו! תפסו עמדות בצומת. הארמיה תנסה לפרוץ — הם יבואו מכל כיוון. אף אחד לא עובר.', 5); AR.lull = 6; AR.wave = -1; DIRQ.push({ at: GAME.t + 6.5, fn: () => hint('ar-jct', 'שלוש הסתערויות, כל אחת מכיוון אחר: ממזרח, מדרום וממערב. הסימון על המסך מראה מאיפה הן באות. טנק מצרי — פגז; חי״ר שמגיע לסוללות — מקלע.', 10) }); }
  if (i === 2) { radio('מח״ט', 'ההתקפה נשברה. ממשיכים דרומה, לנמל עדבייה ולמפרץ — לפני הפסקת האש. בנמל יש עוד טנקים חפורים.', 5); }
}
// the ambushes between the lines: up out of their holes as the tank passes
function arAmbUpd() {
  const L = AR_AMB[AR.stage]; if (!L || AR.amb >= L.length) return; const tz = TANK.g.position.z - AR.o.z; if (tz < L[AR.amb][0]) return;
  const i = AR.amb++, n = [1, 2, 2][arD()]; let k = 0; for (const s of CHAP.army.slots) if (s.grp === `am${AR.stage}_${i}` && k < n) { const e = fSlotSpawn(s.kind, (q) => q === s, 'am'); k++; if (e) { e.peek = true; e.cyc = 1.4 + k * 0.5; e.rpgCd = 2.5 + k * 1.5; e.rpgMiss = arD() === 0; } }
  radio('תותחן', i % 2 ? 'בזוקה בשיחים מימין!' : 'שוחה בשיחים משמאל, קרוב!', 2);
}
const arHold = (left, t) => left === 0 || (t > 40 && left <= 2) || t > 75;
// a line holds the column at its firing position until it is destroyed: its men and its dug-in tank
function arLineUpd(id, dt) {
  const C = CHAP.army, dug = (C.dug[id] || []).filter((v) => v.alive);
  if (!AR.msgs['r' + id]) { AR.msgs['r' + id] = true; arReserve(id); radio('תותחן', id === 'P' ? 'טנקים חפורים בנמל, מאחורי הסוללות! ושוחות לפני הגדר!' : id === 'Q' ? 'קו שוחות מעבר לתעלה! טנק חפור משמאל — רק הצריח בחוץ!' : 'מחסום לפני הצומת! שני טנקים חפורים, משני צדי הציר!', 3); }
  AR.stopT += dt; if (AR.stopT > 55 && dug.length && !AR.msgs['k' + id]) { AR.msgs['k' + id] = true; for (const v of dug) vehDestroy(v); radio('טנק 2', 'פגעתי בטנק החפור! הוא בוער!', 2.6); }
  const left = szAlive((e) => e.sq === id) + dug.length;
  if (!dug.length && arHold(left, AR.stopT)) { fieldDespawn((e) => e.sq === id); return true; }
  return false;
}
/* ---------- the junction's assaults ---------- */
function arWaveStart(i) {
  const C = CHAP.army, W = AR_WAVES[i], d = arD(); AR.wave = i; AR.waveT = 0; AR.wv = [];
  radio('תצפית', ['שיירה מצרית יוצאת מסואץ! ג׳יפים וטנק, וחי״ר לאורך הכביש — ממזרח!', 'חי״ר מסתער מדרום, מכיוון עדבייה! צוותי סאגר על הרכס וטנק חפור!', 'טנקים מכיוון קהיר, ממערב! ועוד חי״ר ממזרח — הם תוקפים משני הצדדים!'][i], 4);
  feed(`הסתערות ${i + 1}/3 · ${W.name}`, 'bad');
  W.sq.forEach((sq, j) => DIRQ.push({ at: GAME.t + sq[0], spawn: true, wave: i, fn: () => arSquad(i, j) }));
  const lane = (k) => (k % 2 ? 2.2 : -2.2);
  if (W.jeeps) C.ej.slice(0, W.jeeps[d]).forEach((v, k) => { vehRevive(v, 60); v.shown = true; v.g.visible = true; v.path = [AW(640 + k * 40, AR_ROAD + lane(k)), AW(330 + k * 26, AR_ROAD + lane(k))]; v.s = 0; v.speed = v.vmax; v.hdV = -Math.PI / 2; v.ended = false; v.stop = pathLen(v.path) - 0.3; v.unloaded = false;
    v.unload = (vv) => { if (!vv.alive) return; const n = [2, 3, 4][arD()]; for (let m = 0; m < n; m++) { const p = vv.g.position, pth = arLane(m % 2 ? [[300, -212], [236, -216], [150, -212]] : [[310, -186], [240, -184]], m, m % 2 === 1); const e = fSpawnStreet0(p.x + (m - 1) * 1.6, p.z + 2.6, pth, m === 1 ? 'rpg' : 'rifle'); if (e) { e.sq = 'w' + i; e.tac = m % 2 ? 'storm' : 'hold'; } } radio('תותחן', 'הם יורדים מהג׳יפ! חי״ר על הכביש!', 2.2); };
    AR.wv.push(v); });
  const roll = (v, x0, x1, z, k) => { vehRevive(v); v.shown = true; v.g.visible = true; v.path = [AW(x0, z), AW(x1, z)]; v.s = 0; v.speed = 4; v.vmax = 6; v.hdV = x1 < x0 ? -Math.PI / 2 : Math.PI / 2; v.ended = false; v.stop = pathLen(v.path) - 0.3; v.shoots = true; v.fireCd = 6 + k * 2.5; v.half = [3.5, 2.3, 1.7]; AR.wv.push(v); };
  if (W.t55) C.et.slice(0, W.t55[d]).forEach((v, k) => roll(v, 760 + k * 60, 520 + k * 50, AR_ROAD + 3.5, k));
  if (W.t55w) C.et.slice(1, 1 + W.t55w[d]).forEach((v, k) => roll(v, -780 - k * 50, -460 + k * 40, AR_ROAD + (k % 2 ? 9 : -9), k));
  if (W.pits) { let k = 0; for (const s of C.slots) if (s.grp === 'Sp' && k < [1, 2, 2][d]) { k++; const e = fSlotSpawn('atgm', (q) => q === s, 'w' + i); if (e) e.rpgCd = 8 + k * 3; }
    for (const v of C.dug.S) if (v.alive) { v.shoots = true; v.fireCd = 4; AR.wv.push(v); } }
}
/* one squad of an assault: from its start, through its covers. Those who hold fight from the last cover; those who storm run on from it at
   the junction itself, to the sandbags round our tank - that is the assault the player has to stop. Who storms is set by the level */
function arStormPt(x, z, k) { const dx = x - AR_J[0], dz = z - AR_J[1], l = Math.hypot(dx, dz) || 1, r = 20 + (k % 3) * 4, sd = (k % 2 ? 1 : -1) * (3 + k); return AW(AR_J[0] + dx / l * r - dz / l * sd, AR_J[1] + dz / l * r + dx / l * sd); }
function arSquad(i, j) {
  const sq = AR_WAVES[i].sq[j], d = arD(), n = Math.round(4 * [0.6, 1, 1.35][d]), kinds = ['rifle', 'rpg', 'rifle', 'lmg', 'rifle', 'rifle'];
  for (let k = 0; k < n; k++) { const [x, z] = sq[1], [wx, wz] = AW(x + (k % 3 - 1) * 2.6, z + Math.floor(k / 3) * 2.6), storm = (k + j) % 4 < [1, 2, 3][d];
    const e = fSpawnStreet0(wx, wz, arLane(sq[2], k, storm), kinds[(k + j) % 6]); if (!e) continue; e.sq = 'w' + i; e.tac = storm ? 'storm' : 'hold'; e.rpgMiss = d === 0; }
}
function arWaveUpd(dt) {
  const C = CHAP.army;
  if (AR.wave < 0 || AR.waveDone) { AR.lull -= dt; if (AR.lull <= 0) { const nx = AR.wave + 1; AR.waveDone = false; if (nx < AR_WAVES.length) arWaveStart(nx); else if (!AR.msgs.broken) { AR.msgs.broken = true; radio('מח״ט', 'ההתקפה נשברה! הצומת שלנו, הטבעת סגורה. כל הכבוד. מתארגנים לתנועה דרומה.', 4.5); feed('הצומת הוחזק · הכביש לקהיר חתוך', 'good'); DIRQ.push({ at: GAME.t + 5, fn: () => rsCut(() => arSetup(2)) }); } } return; }
  AR.waveT += dt; const tag = 'w' + AR.wave, pend = DIRQ.filter((q) => q.wave === AR.wave).length, vl = AR.wv.filter((v) => v.alive);
  for (const v of vl) if (v.unload && !v.unloaded && v.stop !== undefined && v.s >= v.stop - 0.6) { v.unloaded = true; v.unload(v); }   // a jeep that has pulled up puts its men out
  // vehicles that sit out the assault too long are taken by the wingmen (a dug-in one too) - the junction is never left waiting on one
  if (AR.waveT > 80 && vl.length && !AR.msgs['k' + AR.wave]) { AR.msgs['k' + AR.wave] = true; for (const v of vl) vehDestroy(v); radio('טנק 3', 'פגעתי בהם! הטנק בוער!', 2.4); }
  const left = szAlive((e) => e.sq === tag);
  if (!pend && !vl.length && (left === 0 || (AR.waveT > 100 && left <= 3) || AR.waveT > 150)) { fieldDespawn((e) => e.sq === tag); AR.waveDone = true; AR.lull = 8; feed(`הסתערות ${AR.wave + 1}/3 נהדפה`, 'good');
    // the lull between assaults: the crew patches the tank up
    if (TANK.alive && TANK.hp < 100) { TANK.hp = Math.min(100, TANK.hp + [45, 35, 25][arD()]); feed('הצוות מתקן את הטנק בהפוגה', 'good'); }
    if (AR.wave < 2) radio('מח״ט', 'הדפתם אותם! תמלאו תחמושת — הם עוד יחזרו, מכיוון אחר.', 3.5); }
}
function arUpd(dt) {
  const C = CHAP.army; C.t += dt; if (Math.floor(C.t * 2) !== Math.floor((C.t - dt) * 2)) szEnemyCleanup();
  for (let i = DIRQ.length - 1; i >= 0; i--) if (DIRQ[i] && GAME.t >= DIRQ[i].at) { const q = DIRQ.splice(i, 1)[0]; q.fn(); }
  if (C.flag && C.raise) { C.raise += dt; C.flag.position.y = lerp(C.flagY - 7.2, C.flagY, smooth(0, 4.2, C.raise)); }   // the flag goes up during the film
  if (CINE.on) return;
  if (AR.stage === 0) {
    arAmbUpd(); if (TANK.stopI >= 1) for (const v of C.dug.K) v.shoots = true;
    const st = TANK.stops[TANK.stopI]; if (st !== undefined && TANK.holdAt === st) {
      if (TANK.stopI >= 2) { arStage(1); arJunction(); TANK.driveOn = false; return; }
      if (arLineUpd(TANK.stopI === 0 ? 'Q' : 'K', dt)) { TANK.stopI++; TANK.holdAt = null; AR.stopT = 0; radio('נהג', TANK.stopI === 1 ? 'הקו נקי. חוצים את התעלה, ממשיכים דרומה!' : 'המחסום נפרץ! לצומת!', 2.4); }
    }
  } else if (AR.stage === 1) {
    arWaveUpd(dt);
  } else if (AR.stage === 2) {
    arAmbUpd();
    const st = TANK.stops[TANK.stopI]; if (st !== undefined && TANK.holdAt === st) {
      if (TANK.stopI === 0) { if (arLineUpd('P', dt)) { TANK.stopI++; TANK.holdAt = null; AR.stopT = 0; radio('נהג', 'הנמל נקי! יורדים לחוף!', 2.4); } }
      else if (!AR.msgs.end) { AR.msgs.end = true; arVictoryFilm(); }
    }
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
  const C = CHAP.army, near = (pred) => { let b = null, bd = 1e9; for (const e of UNITS.enemies) if (e.alive && e.sz && pred(e)) { const d = Math.hypot(e.pos.x - P.pos.x, e.pos.z - P.pos.z); if (d < bd) { bd = d; b = e; } } return b; };
  const dugOf = (id) => (C.dug[id] || []).find((v) => v.alive && v.g.visible);
  if (AR.stage === 0 || AR.stage === 2) {
    const st = TANK.stops[TANK.stopI], id = AR.stage === 2 ? 'P' : TANK.stopI === 0 ? 'Q' : 'K';
    if (st !== undefined && TANK.holdAt === st && TANK.stopI < (AR.stage === 2 ? 1 : 2)) { const v = dugOf(id); if (v) return [v.g.position.x, v.g.position.y + 3.6, v.g.position.z, 'טנק חפור', 'foe']; const e = near((q) => q.sq === id); if (e) return [e.pos.x, e.pos.y + 2.2, e.pos.z, 'אויב בקו', 'foe']; }
    if (st === undefined) return null; const [x, z] = pathAt(AR.stage === 2 ? AR_ROUTE2 : AR_ROUTE0, st), [wx, wz] = AW(x, z);
    return [wx, groundAt(wx, wz), wz, AR.stage === 2 ? (TANK.stopI ? 'מפרץ סואץ' : 'עמדת ירי מול הנמל') : TANK.stopI >= 2 ? 'הצומת, ק״מ 101' : 'עמדת ירי'];
  }
  if (AR.wave < 0) return null; const tag = 'w' + AR.wave, v = AR.wv.find((q) => q.alive);
  if (v) return [v.g.position.x, v.g.position.y + 3.6, v.g.position.z, v.kind === 'jeep' ? 'ג׳יפ מצרי' : 'טנק מצרי', 'foe'];
  const e = near((q) => q.sq === tag); if (e) return [e.pos.x, e.pos.y + 2.2, e.pos.z, 'מסתערים', 'foe'];
  const [x, z] = AW(...AR_WAVES[Math.min(2, AR.wave + (AR.waveDone ? 1 : 0))].at); return [x, groundAt(x, z), z, 'כיוון ההסתערות הבאה'];
}
function arItems(items) {
  const C = CHAP.army, S = AR_STAGES[AR.stage]; items.push(['go', (S.goal || S.sub) + (OBJ.on ? ' (◆)' : '')]);
  items.push([TANK.hp < 40 ? 'warn' : '', `מצב הטנק: ${Math.max(0, Math.round(TANK.hp))}% · פגז: ${TANK.gunT > 0 ? `טוען ${Math.ceil(TANK.gunT)}` : 'מוכן'}`]);
  if (PROJ.some((q) => q.type === 'atgm')) items.push(['warn', 'סאגר באוויר! הרגו את המפעיל (סימון צהוב)']);
  if (AR.stage === 0 || AR.stage === 2) { const id = AR.stage === 2 ? 'P' : TANK.stopI === 0 ? 'Q' : 'K', hold = TANK.holdAt != null && TANK.stopI < (AR.stage === 2 ? 1 : 2); if (hold) items.push(['next', `${id === 'Q' ? 'קו התעלה' : id === 'K' ? 'המחסום לפני הצומת' : 'הנמל'}: טנקים חפורים ${(C.dug[id] || []).filter((v) => v.alive).length} · בשוחות ${szAlive((e) => e.sq === id)}`]); }
  if (AR.stage === 1) { if (AR.wave < 0) items.push(['next', 'תופסים עמדות בצומת…']); else { const W = AR_WAVES[AR.wave]; items.push([AR.waveDone ? 'next' : 'warn', AR.waveDone ? `הסתערות ${AR.wave + 1}/3 נהדפה · הבאה בדרך` : `הסתערות ${AR.wave + 1}/3 · ${W.name} · מסתערים ${szAlive((e) => e.sq === 'w' + AR.wave)} · רכבים ${AR.wv.filter((v) => v.alive).length}`]); } }
}
function arHints() {
  if (GAME.t > 1) hint('sz-tank', TOUCH ? `אתם מפקד הטנק. <kbd>אש</kbd> = מקלע 0.5, <kbd>רימון</kbd> = פגז, <kbd>כוונת</kbd> = כוונת התותחן.` : `אתם מפקד הטנק. ${K('לחיצה ממושכת')} מקלע 0.5, ${K('G')} פגז מהתותח, לחצן ימני כוונת תותחן, ${K('C')} להיכנס לצריח.`, 10);
}
function arMini(g, X, poly, dot, k) {
  const W = (pts) => pts.map(([x, z]) => AW(x, z)); const coast = []; for (let x = -1500; x <= 1500; x += 100) coast.push([x, coastZ(x)]);
  miniField(g, X, poly, dot, k, { bg: 'rgba(160,140,108,.92)', polys: [[W([...coast, [1500, 2000], [-1500, 2000]]), 'rgba(28,70,86,.95)'], [W([[-1500, -2000], [-420, -2000], [-420, 2000], [-1500, 2000]]), 'rgba(120,98,74,.9)']], lines: [[W([[-1200, AR_ROAD], [1200, AR_ROAD]]), 7, 'rgba(60,60,58,.95)'], [W(AR_ROUTE0), 3, 'rgba(120,98,66,.8)'], [W(AR_ROUTE2), 3, 'rgba(120,98,66,.8)']] });
}
function arEnd(win, why) {
  const stats = [[STATS.kills, 'אויבים ורכבים הושמדו'], [Math.max(0, Math.round(TANK.hp)), 'מצב הטנק %'], [AR.stage + 1, 'השלב שהגעתם אליו']];
  if (win) return ['הארמיה השלישית מכותרת', 'עם כניסת הפסקת האש, ב־24 באוקטובר 1973, עמדו כוחות צה״ל על כביש סואץ–קהיר ועל חוף מפרץ סואץ בעדבייה. כעשרים אלף חיילי הארמיה השלישית נותרו מנותקים על הגדה המזרחית. בקילומטר 101 של הכביש נפגשו אחר כך הקצינים של שני הצדדים לשיחות הראשונות.', stats];
  if (why === 'tank') return ['הטנק הושמד', 'טנק חפור חושף רק את הצריח — כוונו אליו, לא לסוללה. בצומת: הטנקים והג׳יפים קודם, אחר כך החי״ר שמגיע לסוללות. כשהאש כבדה, היכנסו לצריח וירו בכוונת התותחן.', stats];
  return ['נפגעת', 'המפקד חשוף בצריח: כשיורים עליכם, היכנסו פנימה וירו בכוונת התותחן.', stats];
}
CHAP.army = { stages: AR_STAGES, st: () => AR.stage, cp: () => CHAP.army.cpN || 0, upd: arUpd, obj: arObj, hints: arHints, items: arItems, mini: arMini, restore: fieldRestore, end: arEnd, tank: true, allyK: 0.3, allyInf: () => (AR.stage === 1 ? 0.45 : 0.7), hitK: () => [0.45, 0.65, 0.9][arD()],
  tod: () => [14 * 60 + 50, 15 * 60 + 20, 16 * 60 + 20][AR.stage] - START_MIN + CHAP.army.t / 6 + (CINE.on && CHAP.army.flag ? 4 : 0),
  build: () => chapterBuild(CHAP.army, arBuild), setup: arSetup, clock: '24.10.1973 · מערבית לסואץ', toast: ['24 באוקטובר 1973 · 14:50', 'הטור פורץ אל כביש סואץ–קהיר, לנתק את הארמיה השלישית'], start: () => fieldStart('army') };
