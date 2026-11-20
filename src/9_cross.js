/* ================= chapter 5: the crossing bridges, 18-19 October 1973 =================
   After Israeli sources (Hebrew Wikipedia, חיל ההנדסה במלחמת יום הכיפורים; ynet; the brigade 14 heritage site). The first tanks went over on
   16 October on the Gilloa ferries; on the 17th the uniflote pontoons were in the water and the pontoon bridge stood bank to bank by the
   afternoon - from then on the crossing was over it, under shelling and air attack. The roller bridge broke on its way to the canal on the
   16th, was mended and dragged to the water's edge, and launched on the 19th, north of the pontoon bridge.
   On the map of 9b_cross_map.js (local metres round CR.o, x east, z south; the canal x 70..170, the roller bridge's axis z -40, the pontoon
   bridge z 70, the village a T on the roller bridge's road with the mosque at its head):
   1. 18.10 - over the pontoon bridge in the jeeps, the jeep's machine gun on the Egyptians on the rampart north of it; a bomb tears the
      bridge behind. 2. the jeeps through the wheat fields to the village, three bazooka ambushes. 3. 19.10 at dawn - the main street, straight
      up it from cover to cover, men on the roofs and behind the carts; at its end the MG in the mosque's upper window pins it. 4. round it:
      the narrow alley, the lane behind the houses, the south arm, the mosque's side door - the hall, the stair, the upper floor, the MG room.
      5. on the MG: two minutes against the Egyptian reinforcement coming back up the way we came, while the roller bridge is pushed across;
      then the tanks come over it, up the street, under the mosque and north over the concrete bridge. Film: the Egyptians break. */
const CR = { o: { x: -7000, z: 7000 }, stage: 0, t: 0, msgs: {}, br: 0, flee: [], air: 0, push: false, conv: null, filmTod: null, wave: 0, waveT: 0 };
const CW = toWorld(CR.o);
const CR_STAGES = [
  { title: 'על גשר הדוברות', sub: '18 באוקטובר. גשר הדוברות עומד על התעלה מאתמול אחר הצהריים, וכל מה שעובר לגדה המערבית עובר עליו — תחת הפגזה ומטוסים. צנחנים עוברים בג׳יפים, אחרי הטנקים. בלילה חזרו מצרים לסוללה שמצפון לגשר.', goal: 'מהמקלע על הג׳יפ: השתיקו את המצרים על הסוללה שמצפון לגשר' },
  { title: 'בין השדות', sub: 'מעבר לסוללה: שדות חיטה בין דרכי עפר וגדרות עץ, פרדסים ושורות אקליפטוס — וחוליות בזוקה שמחכות בתוכם. הג׳יפים נוסעים אל הכפר שאליו יעלה גשר הגלילים.', goal: 'חסלו את מארבי הבזוקה, עד הכפר' },
  { title: 'הרחוב הראשי', sub: '19 באוקטובר, עם שחר. הכפר בנוי כמו האות T: הרחוב הראשי עולה ממקום הנחיתה של גשר הגלילים מערבה, ובראשו, מול הרחוב, המסגד. מתקדמים ברחוב עצמו, ממחסה למחסה — מצרים על הגגות ומאחורי העגלות.', goal: 'התקדמו ברחוב, ממחסה למחסה, עד סופו' },
  { title: 'המסגד', sub: 'מחלון הקומה השנייה של המסגד מקלע מרתק את הרחוב. עוקפים: הסמטה הצרה מדרום, מאחורי הבתים, אל הזרוע הדרומית ודלת הצד של המסגד. אולם התפילה, המדרגות, הקומה השנייה — וחדר המקלע.', goal: 'עקפו בסמטה, כבשו את המסגד וקחו את עמדת המקלע' },
  { title: 'על המקלע', sub: 'המקלע בידינו, וחלונו מביט במורד הרחוב — עד גשר הגלילים, שנדחף עכשיו אל המים. התגבורת המצרית באה בדיוק מהדרך שבה באתם, ומהזרוע הצפונית.', goal: 'החזיקו במקלע שתי דקות, עד שגשר הגלילים מונח והטנקים מגיעים' },
];
const CR_CLOCK = ['18.10.1973 · גשר הדוברות', '18.10.1973 · השדות', '19.10.1973 · הכפר', '19.10.1973 · המסגד', '19.10.1973 · גשר הגלילים'];
const CR_TOD = [8 * 60 + 40, 9 * 60, 24 * 60 + 6 * 60 + 40, 24 * 60 + 7 * 60, 24 * 60 + 7 * 60 + 25];   // minutes from midnight of the 18th
// the map's layout (9b_cross_map.js keeps the same numbers)
const CR_CAN0 = 70, CR_CAN1 = 170, CR_RBZ = -40, CR_PBZ = 70, CR_SBZ = -100, CR_SWC = -130, CR_BAR = -90, CR_LZ = -19;
const CR_HOLD = 120;   // the stand on the MG, and the time the roller bridge takes to cross (the user: two minutes)
// the jeeps: the east bank, over the pontoon bridge, then the track through the fields and along the foot of the rampart to the village
const CR_PB_PATH = [[262, 94], [222, 75], [CR_CAN1 + 14, CR_PBZ], [CR_CAN0 - 14, CR_PBZ]];
const CR_JEEP = [[CR_CAN0 - 14, CR_PBZ], [30, 72], [10, 100], [-2, 116], [-14, 120], [-40, 120], [-40, 90], [-40, 66], [-36, 64], [0, 64], [37, 64], [40, 58], [40, 0], [40, -28], [37, -37]];
const CR_J0 = [...CR_PB_PATH, ...CR_JEEP.slice(1)];
const CR_NAMES = ['עמוס', 'רפאל', 'אהרון', 'גבריאל', 'נתן', 'אלון', 'יואב', 'שי', 'בועז', 'עידו', 'אריק', 'מאיר', 'יוסי', 'קובי', 'אבי', 'צחי'];
const CR_FOLLOW = [0, 1, 2, 3, 10, 11, 12, 13];
const CR_AMB = { a0: { stop: [-22, 120], from: [-14, 150], txt: 'מארב! בזוקות מימין, מעבר לדרך!' }, a1: { stop: [-40, 88], from: [-80, 86], txt: 'עוד מארב! חי״ר בחיטה, משמאל!' }, a2: { stop: [40, 22], from: [6, 22], txt: 'בזוקות בשדה משמאל! עוד מארב!' } };
const CR_NESTS = { a0: [[-30, 132, 'rpg'], [-18, 136, 'rifle'], [-6, 131, 'rifle'], [-26, 142, 'rifle'], [-12, 145, 'rpg'], [2, 138, 'rifle']],
  a1: [[-56, 96, 'rpg'], [-60, 84, 'rifle'], [-54, 76, 'rifle'], [-62, 104, 'rifle'], [-58, 70, 'rpg'], [-66, 92, 'rifle']],
  a2: [[24, 30, 'rpg'], [18, 18, 'rifle'], [26, 8, 'rifle'], [14, 36, 'rifle'], [22, -2, 'rpg'], [47, 40, 'rifle']] };
// the street (stage 3) and the way round to the MG (stage 4): the bounds of the advance
const CR_G2 = [[38, -40], [22, -40], [6, -40], [-10, -40], [-28, -40]];
const crSAt = (path, x, z) => { let acc = 0, best = 0, bd = 1e9; for (let i = 0; i < path.length - 1; i++) { const a = path[i], b = path[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]); for (let u = 0; u <= 1; u += 0.02) { const d = Math.hypot(lerp(a[0], b[0], u) - x, lerp(a[1], b[1], u) - z); if (d < bd) { bd = d; best = acc + L * u; } } acc += L; } return best; };
const crDi = () => Math.max(0, DIFF.indexOf(diff));   // the level: 0 easy, 1, 2 hard

/* ---------- the decks the vehicles drive on ---------- */
// the roller bridge, once it is across
function crDeck(x, z) { const lx = x - CR.o.x, lz = z - CR.o.z; if (Math.abs(lz - CR_RBZ) > 3 || CR.br < 1 || !CRM.built) return null; const y = CRM.DECK_Y(lx); return y == null ? null : y + 0.02; }
// the pontoon bridge: its roadway, the ramps down to both banks, and the gap the bomb tears in it
function crPBDeck(x, z) { const lx = x - CR.o.x, lz = z - CR.o.z; if (Math.abs(lz - CR_PBZ) > 3.4 || lx < CR_CAN0 - 14 || lx > CR_CAN1 + 14 || !CRM.built) return null;
  if (CR.cut && Math.abs(lx - CRM.PB.segs[CR.cutK].x) < 4) return null; const PBD = CRM.PB_DECK + 0.07;
  if (lx >= CR_CAN0 - 4 && lx <= CR_CAN1 + 4) return PBD; const e = lx < CR_CAN0 ? CR_CAN0 - 4 - lx : lx - CR_CAN1 - 4; return lerp(PBD, Math.max(PBD, groundAt(x, z)), clamp(e / 10, 0, 1)); }
// the concrete bridge over the sweet-water canal, on the tanks' axis
function crSBDeck(x, z) { const lx = x - CR.o.x, lz = z - CR.o.z; return Math.abs(lz - CR_SBZ) < 3.3 && Math.abs(lx - CR_SWC) < 11 ? 2.0 : null; }
const crAnyDeck = (x, z) => crDeck(x, z) ?? crPBDeck(x, z) ?? crSBDeck(x, z);

/* ---------- positions: a slot is where a man waits (hidden) and from where he fires (peeking) ---------- */
function crSlot(lx, lz, y, nx, nz, grp, kind = 'rifle', back = 0.3) { const [x, z] = CW(lx, lz), l = Math.hypot(nx, nz) || 1; nx /= l; nz /= l; const s = { x, z, y, nx, nz, f: 0, b: null, used: false, p: [x + nx * 0.15, z + nz * 0.15], h: [x - nx * back, z - nz * back], grp, kind }; CHAP.cross.slots.push(s); return s; }
// facing a point (local)
const crFace = (lx, lz, tx, tz) => [tx - lx, tz - lz];
function crSlots() {
  const C = CHAP.cross, M = CRM.MQ, H = CRM.HOUSES;
  // the roofs of the main street: two places on each house's street side, behind its parapet, looking down the street to the east
  for (const h of H) { if (!h.n || h.n[0] !== 0) continue; const onStem = Math.abs(h.z - CR_RBZ) < 16 && h.x > -78 && h.x < 34; if (!onStem) continue;
    for (const k of [-0.42, 0.38]) { const lx = h.x + k * h.w, lz = h.z + h.n[1] * (h.d / 2 - 0.75); crSlot(lx, lz, h.top - 0.05, 0.55, h.n[1], 'roof', 'rifle', 0.35).ax = lx; } }
  // behind the carts, the drums and the sacks along the street, on their west side, looking east down it
  for (const p of CRM.PROPS) if (p.along === 'x') { const lz = p.z + (p.s > 0 ? 0.3 : -0.3); crSlot(p.x - 0.7, lz, groundAt(...CW(p.x - 0.7, lz)), 1, 0, 'prop', 'rifle', 0.5).ax = p.x; }
  // the lane and the south arm, on the way round
  crSlot(-80, CR_LZ, groundAt(...CW(-80, CR_LZ)), 1, 0, 'lane');
  crSlot(-93.3, -11, groundAt(...CW(-93.3, -11)), ...crFace(-93.3, -11, -86, -19), 'arm');
  crSlot(-92.6, -27.5, groundAt(...CW(-92.6, -27.5)), ...crFace(-92.6, -27.5, -86, -19), 'arm');
  // the mosque: the hall behind its columns, the head of the stair, the MG room - and the gunner at his window, his back to the door
  crSlot(M.M.x - 2.5, M.M.z - 6, M.f + 0.1, 0.2, 1, 'hall', 'smg');
  crSlot(M.M.x + 2.5, M.M.z - 1, M.f + 0.1, -0.4, 1, 'hall');
  crSlot(M.M.x + 6.2, M.M.z + 5.2, M.f + 0.1, -1, 0.3, 'hall');
  crSlot(M.M.x - 0.5, M.Z0 + 1.6, M.F2 + 0.3, -1, 0.15, 'up', 'smg');
  crSlot(M.X1 - 2.6, M.M.z - 3.6, M.F2 + 0.3, -1, 0.3, 'mgroom');
  C.mgSlot = crSlot(M.X1 - 1.6, M.M.z, M.F2 + 0.3, 1, 0, 'mg', 'lmg', 0.05);
}

/* ---------- building: the map, then what moves on it ---------- */
const JEEP_MG = build([[G.box(0.1, 0.13, 0.95), 0x1d1d1b, M4(0, 0, -0.35)], [G.cyl(0.024, 0.024, 0.75, 6), 0x151515, M4(0, 0.012, -1.17, Math.PI / 2, 0, 0)], [G.cyl(0.04, 0.04, 0.3, 8), 0x2a2a28, M4(0, 0.012, -0.95, Math.PI / 2, 0, 0)], [G.box(0.07, 0.2, 0.1), 0x24221f, M4(0, -0.13, -0.05)], [G.box(0.17, 0.11, 0.26), 0x2a2a24, M4(0, 0.07, -0.5)], [G.box(0.2, 0.15, 0.2), 0x4a4c3a, M4(-0.16, -0.03, -0.5)], [G.box(0.05, 0.08, 0.05), 0x1a1a1a, M4(0, 0.1, -1.45)]]);
function crWreckT55(lx, lz, hd, r) {
  const [x, z] = CW(lx, lz); if (!(typeof VEH_DATA !== 'undefined' && VEH_DATA.t55)) return placeTank(x, z, hd, TANK_BURNT);
  const rec = vehModel('t55', 'e'), m = rec.g; m.position.set(x, groundAt(x, z), z); m.rotation.y = -THREE.MathUtils.degToRad(hd) + Math.PI / 2; rec.crew = false; rec.dead = true; vehDamage(rec, true); m.traverse((o) => { if (o.isMesh) o.material = MAT_BURNT; });
  scene.add(SH(onLayer1(m))); wreckTilt(m, r); wreckFire(m, VEH_FIRE.t55, 1.4); addCollider(x, z, 3.4, 1.8, m.rotation.y, groundAt(x, z) + 2.3); coverBox(x, z, 3.4, 1.8, m.rotation.y, 2.1); return m;
}
function crBuild() {
  const C = CHAP.cross; crMapBuild(); C.ground = CRM.ground; GROUND = C.ground; C.ready = CRM.ready;
  const BAGS = [], sv = BATCH.bag; BATCH.bag = BAGS; const k0 = COVER.length; C.slots = [];
  // the Egyptians who crept back onto the rampart north of the pontoon bridge, looking down on it
  for (const [x, z] of [[52, 50], [50, 38], [53, 26], [51, 14], [52, 2]]) { const [wx, wz] = CW(x, z), dx = 110 - x, dz = CR_PBZ - z, l = Math.hypot(dx, dz); foxhole(wx, wz, dx / l, dz / l, C.slots).grp = 'L'; }
  // bazooka nests: three ambushes along the jeeps' track
  const nb = []; C.nests = {}; const tr = densify(CR_JEEP, 4);
  for (const id in CR_NESTS) C.nests[id] = CR_NESTS[id].map(([x, z, kind]) => { const [wx, wz] = CW(x, z); let bd = 1e9, tx = x, tz = z; for (const p of tr) { const d = Math.hypot(p[0] - x, p[1] - z); if (d < bd) { bd = d; tx = p[0]; tz = p[1]; } } const dx = tx - x, dz = tz - z, l = Math.hypot(dx, dz) || 1; return bushNest(wx, wz, dx / l, dz / l, C.slots, 'A' + id, kind, nb, rng(Math.round(x * 13 - z))); });
  instScatter(BUSH_G, nb);
  crSlots();
  // the east bank: tanks waiting their turn; two to push the roller bridge
  for (const [x, z, b] of [[232, 8, 270], [250, -84, 250], [262, 30, 280], [214, 110, 265], [276, -20, 270]]) { const [wx, wz] = CW(x, z); placeTank(wx, wz, b); }
  C.towT = [0, 1].map(() => { const m = VEH_DATA.magach ? (() => { const r = vehModel('magach', 'f'); r.crew = true; return r.g; })() : new THREE.Mesh(TANK_GEO, MAT.vc); m.rotation.y = Math.PI; m.userData.dyn = true; scene.add(SH(onLayer1(m))); return m; });
  { const r = rng(9117); crWreckT55(-20, 88, 190, r); crWreckT55(-150, -110, 160, r); crWreckT55(20, 112, 120, r); }
  for (const [x, z, s] of [[-900, -500, 40], [-1200, 300, 55], [600, -900, 30], [-700, 800, 45]]) { const [wx, wz] = CW(x, z); smokeColumn(wx, wz, s, true); }
  BATCH.bag = sv; if (BAGS.length) scene.add(bagMesh(BAGS)); C.covers = COVER.slice(k0); for (const c of C.covers) c.y = hAt(c.x, c.z, groundAt(c.x, c.z) + 0.6);
  // vehicles: our jeeps; the tanks over the bridges
  const jeepCrew = (v) => { const d = new THREE.Mesh(SEATED_F, MAT.clothF); d.position.set(-0.35 * JK, 0.95 * JK, -0.3 * JK); d.rotation.y = Math.PI / 2; v.g.add(d); v.crew = [d]; };
  C.jeeps = [0, 1, 2].map((i) => { const v = addVeh({ mode: 'cross', side: 'f', kind: 'jeep', geo: JEEP_GEO, half: [1.6 * JK, 1.6 * JK, 0.8 * JK], guns: i > 0, vmax: 6.5, float: crPBDeck }); jeepCrew(v); const vl = v.g.userData.vl; if (vl) vl.crew = false; else v.g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.8 * JK, 6).translate(-0.55 * JK, 1.35 * JK, 0), MAT.metal));
    if (i > 0) { const gu = new Unit('f', 'rifle'); scene.remove(gu.tag); gu.alive = true; gu.rig.root.visible = true; gu.stance = 'stand'; gu.rig.pose('aim', 0, 0.05); v.crewU = [{ u: gu, at: V3(-0.85 * JK, 0.95 * JK, 0.0) }]; v.crew.push(gu.rig.root); } return v; });
  C.jeepX = addVeh({ mode: 'cross', side: 'f', kind: 'jeep', geo: JEEP_GEO, half: [1.6 * JK, 1.6 * JK, 0.8 * JK], vmax: 3, float: crPBDeck }); if (C.jeepX.g.userData.vl) C.jeepX.g.userData.vl.crew = false; C.jeepX.fires = C.jeepX.fires || []; C.jeepX.men = [[-0.35, 0.95, -0.3], [0.45, 0.95, 0.35], [-1.1, 0.95, 0.3]].map(([x, y, z]) => { const d = new THREE.Mesh(SEATED_F, MAT.clothF); d.position.set(x * JK, y * JK, z * JK); d.rotation.y = Math.PI / 2; C.jeepX.g.add(d); return d; });
  C.mg = new THREE.Mesh(JEEP_MG, MAT.vc); C.mg.visible = false; C.mg.userData.dyn = true; scene.add(onLayer1(C.mg));
  C.tanks = [0, 1, 2, 3, 4, 5].map(() => addVeh({ mode: 'cross', side: 'f', kind: 'tank', geo: TANK_GEO, half: [3.4, 2.6, 1.9], guns: false, vmax: 8, float: crAnyDeck }));
  C.pbT = [0, 1].map(() => addVeh({ mode: 'cross', side: 'f', kind: 'tank', geo: TANK_GEO, half: [3.4, 2.6, 1.9], guns: false, vmax: 3, float: crPBDeck }));
  // the column of the last film: fifty tanks drawn as one instanced mesh
  C.conv = VEH_DATA.magach ? new THREE.InstancedMesh(vehMerged('magach', 2, 'f'), MAT.veh, 50) : new THREE.InstancedMesh(TANK_GEO, MAT.vc, 50); C.conv.frustumCulled = false; C.conv.userData.dyn = true; C.conv.visible = false; SH(C.conv, true, false); scene.add(onLayer1(C.conv));
}
/* ---------- the roller bridge: on the east bank, then pushed across by the two tanks behind it ---------- */
function crBridgePose(dt) {
  const C = CHAP.cross; if (!CRM.built) return; CRM.RB.pose(CR.br, GAME.t);
  const tail = CRM.RB.tail; C.towT.forEach((t, i) => { const [wx, wz] = CW(tail + 3.9, CR_RBZ + (i ? 2.05 : -2.05)); t.position.set(wx, groundAt(wx, wz), wz); t.visible = CR.br < 1; });
  const moving = CR.push && CR.br < 1;
  if (dt > 0 && moving) { for (const t of C.towT) if (Math.random() < dt * 3) { const s = FX.smoke.get(); s.life = 2.2; s.s.position.copy(t.position).add(V3(rand(2.6, 3.4), 2.3, rand(-1, 1))); s.s.material.color.set(0x2e2c28); s.upd = (q, u, d2) => { q.s.position.y += 1.6 * d2; q.s.scale.setScalar(0.8 + u * 3.4); q.s.material.opacity = 0.55 * (1 - u); }; }
    const tip = CRM.RB.tip; if (tip < CR_CAN1 - 2) { CR.tipT = (CR.tipT || 0) - dt; if (CR.tipT <= 0) { CR.tipT = 0.32; const [tx, tz] = CW(tip - 0.6, CR_RBZ + rand(-2.2, 2.2)); fxDust(V3(tx, 0.3, tz), true); if (Math.random() < 0.6) rippleAdd(tx - 1, tz, 0.7); } } }
  if (CR.stage === 4 && CR.push) meter('גשר הגלילים', CR.br);
}
/* ---------- the pontoon bridge broken: the pontoon under the jeep behind blown over and down, the two beside it hanging into the gap ---------- */
function crPBReset() { if (CRM.built) CRM.PB.reset(); CR.cut = false; CR.breakT = null; }
function crPBBreak() {
  const C = CHAP.cross, X = C.jeepX; if (!CR.cut || CR.breakT === null || !CRM.built) return; const t = GAME.t - CR.breakT, k0 = CR.cutK, S = CRM.PB.segs;
  for (const kind of [-1, 0, 1]) { const k = k0 + kind; if (k < 0 || k >= S.length) continue; const g = S[k].g;
    if (kind === 0) { const u = clamp(t / 3.6, 0, 1); g.position.set(S[k].x + 0.6 * u, -u * u * 4.2 - 0.3 * u, CR_PBZ + 3.2 * u); g.rotation.set(2.4 * u, 0.35 * u, 0.5 * u); }
    else { const u = smooth(0, 1.4, t), th = 0.15 * kind * u + Math.sin(GAME.t * 1.3 + k) * 0.012 * u, d = -kind * 4, hx = S[k].x - d; g.position.set(hx + d * Math.cos(th), d * Math.sin(th), CR_PBZ); g.rotation.set(0, 0, th); } }
  if (X.g.visible) { if (!CR.push0) { X.path = null; X.speed = 0; CR.push0 = { p: X.g.position.clone(), ry: X.g.rotation.y }; } const u = clamp((t - 0.5) / 2.8, 0, 1), P0 = CR.push0;
    X.g.position.set(P0.p.x + 0.6 * u, P0.p.y - u * u * 4.5, P0.p.z + 3.0 * u); X.g.rotation.set(1.3 * u, P0.ry, 0.3 * u, 'YXZ');
    if (u >= 1) { X.g.visible = false; X.shown = false; CR.xGone = true; crSplash(V3(P0.p.x, 0, P0.p.z + 3), 1.4); } }
}
function crDirectHit() {
  const C = CHAP.cross, X = C.jeepX; CR.hit3 = true; X.g.updateMatrixWorld(true); const p = X.g.getWorldPosition(V3());
  fxExplosion(p.clone().add(V3(0, 0.8, 0)), 3.2); sndBoom(p, 3.0); crBurst(p.x + 3, p.z + 7, 1.5); crBurst(p.x - 5, p.z - 6, 1.3); crSplash(V3(p.x + 1, 0, p.z - 5), 1.2);
  X.vmax = 0; X.speed = 0; X.stop = X.s; FX.shake = Math.max(FX.shake, clamp(1.4 - camera.position.distanceTo(p) / 40, 0.2, 0.9));
  X.crHit = true; X.g.traverse((m) => { if (m.isMesh && !X.men.includes(m)) m.material = MAT_BURNT; }); { const vl = X.g.userData.vl; if (vl) { vehDamage(vl, true); vl.dead = true; } }
  for (let i = 0; i < 2; i++) { const f = new THREE.Sprite(new THREE.SpriteMaterial({ map: FXT.fire, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, color: HDC })); f.position.set(rand(-0.4, 0.4), 1.4 + i * 0.6, rand(-0.3, 0.3)); f.scale.setScalar(1.8 + i * 0.6); X.g.add(f); X.fires.push(f); }
  const [a, b, c] = X.men; scene.attach(a); CR.thrown = { m: a, v: V3(rand(-1, 1), 5.5, (Math.random() < 0.5 ? -1 : 1) * rand(3, 4)), t: 0 };
  for (const [m, at] of [[b, [9.6, 1.2]], [c, [-9.4, -1.0]]]) { scene.attach(m); m.position.set(p.x + at[0], CRM.PB_DECK + 0.2, p.z + at[1]); m.rotation.set(0, rand(0, 3), Math.PI / 2); }
  { const S = CRM.PB.segs, lx = p.x - CR.o.x; let k0 = 0; S.forEach((s, k) => { if (Math.abs(s.x - lx) < Math.abs(S[k0].x - lx)) k0 = k; }); CR.cutK = k0; CR.cut = true; CR.breakT = GAME.t; CR.push0 = null;
    const [gx, gz] = CW(S[k0].x, CR_PBZ); for (const dx of [-3, 0, 3]) crBurst(gx + dx, gz + rand(-2, 2), 1.6); fxExplosion(V3(gx, 1.2, gz), 2.4); }
  radio('קשר', 'פצצה על הגשר מאחורינו! פגיעה ישירה בג׳יפ — הגשר נקרע!', 2.6);
  DIRQ.push({ at: GAME.t + 6.5, fn: () => radio('מ״פ', 'הגשר נקרע מאחורינו. שני הג׳יפים האחרונים נשארו בצד השני — הם יעברו בדוברה ויצטרפו אלינו בכפר. ממשיכים!', 4.2) });
  DIRQ.push({ at: GAME.t + 2.8, fn: () => { radio('חובש', 'הג׳יפ מאחורינו נפגע! יש הרוג ושני פצועים. אני עליהם!', 3.4); feed('הג׳יפ שמאחור נפגע על הגשר: הרוג ושני פצועים', 'bad'); } });
}
function crStrike() {
  const X = CHAP.cross.jeepX; X.g.updateMatrixWorld(true); const to = X.g.getWorldPosition(V3());
  const m = new THREE.Mesh(JET_GEO, MAT.jet); SH(m, true, false); scene.add(onLayer1(m));
  CR.strike = { m, t: 0, x0: to.x + 330, z: to.z - 3, rel: false }; m.position.set(to.x + 330, 46, to.z - 3);
  sndJet(3.2); radio('צנחן', 'מטוס! מהמזרח — הוא צולל על הגשר!', 2.6);
}
function crStrikeUpd(dt) {
  const S = CR.strike; if (!S) return; const X = CHAP.cross.jeepX; S.t += dt;
  const x = S.x0 - 92 * S.t, y = Math.max(20, 46 - S.t * 9); S.m.position.set(x, y, S.z); S.m.rotation.set(0, Math.PI, 0); S.m.rotateZ(S.rel ? 0.35 : -0.15);
  X.g.updateMatrixWorld(true); const tgt = X.g.getWorldPosition(V3());
  if (!S.rel && x < tgt.x + 52) { S.rel = true; const bm = new THREE.Mesh(BOMB_GEO, MAT.vc); bm.scale.setScalar(1.6); scene.add(onLayer1(bm)); const from = S.m.position.clone().add(V3(0, -1.2, 0));
    CR.shellIn = { m: bm, from, to: tgt.clone().add(V3(0, 0.6, 0)), t: 0, dur: 1.15, track: true }; bm.position.copy(from);
    slowMo(3.8, 0.2, tgt.clone().add(V3(0, 3.4, 0))); toast('פצצה!', 'על הגשר, מאחוריכם'); }
  if (x < tgt.x - 800) { scene.remove(S.m); CR.strike = null; }
}
function crShellUpd(dt) {
  const S = CR.shellIn; if (!S || S.done) return; S.t += dt; if (S.track) { const X = CHAP.cross.jeepX; X.g.updateMatrixWorld(true); S.to.copy(X.g.getWorldPosition(V3())).add(V3(0, 0.6, 0)); } const u = Math.min(1, S.t / S.dur); S.m.position.lerpVectors(S.from, S.to, u); S.m.position.y = lerp(S.from.y, S.to.y, u * u); S.m.lookAt(S.to); S.m.rotateX(Math.PI / 2);
  if (u >= 1) { S.done = true; scene.remove(S.m); crDirectHit(); }
}
function crHitUpd(dt) {
  const X = CHAP.cross.jeepX, T = CR.thrown;
  if (T && T.m.visible) { T.t += dt; T.v.y -= 9.8 * dt; T.m.position.addScaledVector(T.v, dt); T.m.rotation.x += dt * 5; T.m.rotation.z += dt * 3; if (T.m.position.y < -1.2) { T.m.visible = false; const wp = T.m.position.clone(); wp.y = 0; for (let k = 0; k < 4; k++) fxDust(wp.clone().add(V3(rand(-0.6, 0.6), 0.3 + k * 0.3, rand(-0.6, 0.6))), true); rippleAdd(wp.x, wp.z, 0.5); } }
  if (X.crHit && X.g.visible && Math.random() < dt * 3.5) { const wp = X.g.getWorldPosition(V3()), q = FX.smoke.get(); q.life = 6; q.s.position.set(wp.x + rand(-0.6, 0.6), wp.y + 2.2, wp.z + rand(-0.6, 0.6)); q.s.material.color.set(0x1a1816); q.upd = (o, u, d2) => { o.s.position.y += 2.4 * d2; o.s.scale.setScalar(1.6 + u * 7); o.s.material.opacity = 0.7 * (1 - u); }; }
  if (X.crHit) for (const f of X.fires) f.scale.setScalar(1.6 + Math.sin(GAME.t * 11 + f.id) * 0.3 + (f.position.y > 1.6 ? 0.6 : 0));
  crPBBreak();
}
/* ---------- the air raids: jets dive on the pontoon bridge and on the roller bridge waiting on the bank ---------- */
const CRJ = [];
function crJet(kind) {
  const m = new THREE.Mesh(JET_GEO, MAT.jet); SH(m, true, false); m.visible = false; scene.add(onLayer1(m)); let tx, tz, ang;
  if (kind === 'pb') { tx = CR.o.x + rand(CR_CAN0 - 10, CR_CAN1 + 10); tz = CR.o.z + CR_PBZ + rand(-30, 10); ang = Math.PI / 2 + rand(-0.15, 0.15); }
  else { tx = CR.o.x + rand(CR_CAN1 + 10, CR_CAN1 + 110); tz = CR.o.z + CR_RBZ; ang = rand(-0.25, 0.25) + (Math.random() < 0.5 ? 0 : Math.PI); }
  CRJ.push({ m, kind, tx, tz, dx: Math.cos(ang), dz: Math.sin(ang), t: 0, last: -1e9, bombs: false });
  radio('תצפית', kind === 'pb' ? pick(['מיג צולל על גשר הדוברות!', 'מטוס! הוא בא על הגשר!']) : pick(['מיגים על גשר הגלילים!', 'סוחויים בצלילה על הגדה!']), 2.6);
}
function crJetsUpd(dt) {
  for (let i = CRJ.length - 1; i >= 0; i--) {
    const j = CRJ[i]; j.t += dt; const s = -720 + 58 * j.t; if (s > 900) { scene.remove(j.m); CRJ.splice(i, 1); continue; }
    const g = Math.max(0, groundAt(j.tx, j.tz)), alt = s < -60 ? 16 + (-60 - s) * 0.1 : 16 + (s + 60) * 0.3;
    j.m.visible = true; j.m.position.set(j.tx + j.dx * s, g + alt, j.tz + j.dz * s); j.m.rotation.set(0, Math.atan2(-j.dz, j.dx), 0); j.m.rotateZ(s < -60 ? -0.25 : 0.4);
    if (!j.heard) { j.heard = true; sndJet(Math.max(0.5, -s / 58)); }
    if (s > -430 && s < -140) { const u0 = Math.max(j.last, -150), u1 = s + 300; j.last = u1;
      for (let u = u0; u < u1; u += 6.5) { const lat = rand(-1.6, 1.6), x = j.tx + j.dx * u - j.dz * lat, z = j.tz + j.dz * u + j.dx * lat, gy = groundAt(x, z), p = V3(x, Math.max(gy, 0), z); fxDust(p.clone().add(V3(0, 0.2, 0)), gy < 0); if (gy < 0 && Math.random() < 0.3) rippleAdd(x, z, 0.4); if (Math.random() < 0.3) sndShot('mag', p);
        const d = Math.hypot(P.pos.x - x, P.pos.z - z); if (d < 2.4 && P.alive && !CINE.on && Math.random() < (P.crouch ? 0.2 : 0.45)) hurtPlayer(rand(22, 34), p, true); if (d < 6) FX.shake = Math.max(FX.shake, 0.35); } }
    if (!j.bombs && s > -105) { j.bombs = true; for (let k = 0; k < 3; k++) { const u = 4 + k * 14, x = j.tx + j.dx * u + rand(-3, 3), z = j.tz + j.dz * u + rand(-3, 3), from = j.m.position.clone(), bm = new THREE.Mesh(BOMB_GEO, MAT.vc); scene.add(onLayer1(bm)); bm.scale.setScalar(1.8); AIR.bombs.push({ m: bm, from, to: V3(x, Math.max(groundAt(x, z), 0), z), t: -k * 0.3, dur: 2.3, hard: false, water: groundAt(x, z) < 0 }); } }
  }
}
function crBombsUpd(dt) {
  for (let i = AIR.bombs.length - 1; i >= 0; i--) { const b = AIR.bombs[i]; b.t += dt; if (b.t < 0) { b.m.visible = false; continue; } b.m.visible = true; const u = Math.min(1, b.t / b.dur);
    const p = b.from.clone().lerp(b.to, u); p.y = lerp(b.from.y, b.to.y, u * u); b.m.position.copy(p); b.m.lookAt(b.to);
    if (u >= 1) { scene.remove(b.m); AIR.bombs.splice(i, 1); if (b.water) crBurst(b.to.x, b.to.z, 1.7); else explode(b.to.clone(), 2.0, 12, 110, 'art'); } }
}
// the Egyptian artillery: columns of water in the canal round the bridges, sand on the east bank
function crShells(dt) {
  CR.shT = (CR.shT ?? 2) - dt; if (CR.shT > 0) return; const crossing = CR.stage === 0 && CR.msgs.go && !CR.msgs.off, pushing = CR.push && CR.br < 1; CR.shT = crossing ? rand(0.4, 1.0) : pushing ? rand(0.8, 1.6) : rand(1.4, 3.4);
  const r = Math.random(); let lx, lz;
  if (crossing && r < 0.9) { const q = CHAP.cross.jeeps[0].g.position.x - CR.o.x; lx = clamp(q + rand(-40, 50), CR_CAN0 + 4, CR_CAN1 - 4); lz = CR_PBZ + (Math.random() < 0.5 ? -1 : 1) * rand(8, 30); }
  else if (r < 0.6) { lx = rand(CR_CAN0 + 6, CR_CAN1 - 6); lz = CR_RBZ + (Math.random() < 0.5 ? -1 : 1) * rand(8, 40); }
  else if (r < 0.85) { lx = rand(CR_CAN1 + 15, 300); lz = rand(-120, 140); if (Math.abs(lz - CR_RBZ) < 8) lz += 16; } else { lx = rand(CR_CAN0 + 4, CR_CAN1 - 4); lz = rand(-180, 200); }
  const [x, z] = CW(lx, lz), gy = groundAt(x, z), p = V3(x, Math.max(gy, 0), z); if (camera.position.distanceTo(p) < 70 && Math.random() < 0.5) sndWhistle(1.0);
  DIRQ.push({ at: GAME.t + 1.0, fn: () => { if (gy < 0) crBurst(x, z, crossing ? 1.5 : 1.2); else { fxExplosion(p, 1.1); sndBoom(p, 1.0); } } });
}
function crSplash(p, k = 1) {
  const n = Math.round(9 * k); for (let i = 0; i < n; i++) fxDust(p.clone().add(V3(rand(-2, 2) * k, 0.3 + i * 0.55 * k, rand(-2, 2) * k)), true); for (let i = 0; i < 5; i++) fxDust(p.clone().add(V3(rand(-5, 5), 0.2, rand(-5, 5))), true); sndBoom(p, 1.1 * k);
  rippleAdd(p.x, p.z, 0.9 * k); FX.shake = Math.max(FX.shake, clamp(1.1 - camera.position.distanceTo(p) / 34, 0, 0.75));
}
function crBurst(x, z, k = 1.4) {
  fxExplosion(V3(x, 0.1, z), 0.8 * k); crSplash(V3(x, 0, z), k);
  for (let i = 0; i < (LITE ? 4 : 8); i++) { const d = FX.dust.get(); d.life = 1.7 + Math.random() * 0.8; const ox = rand(-1, 1) * k, oz = rand(-1, 1) * k, vy = rand(9, 17) * k; d.s.position.set(x + ox, 0.4, z + oz); d.s.material.color.set(0xe8eef0); d.upd = (q, u, dt2) => { q.s.position.y += vy * dt2 * Math.pow(1 - u, 1.6) - 2.5 * dt2 * u; q.s.scale.setScalar((1.2 + u * 5.5) * k); q.s.material.opacity = 0.9 * (1 - u); }; }
  rippleAdd(x, z, 1.3 * k);
}

/* ---------- the MG in the mosque's upper window: long bursts down the street, at whoever is in it ---------- */
function crMgMuzzle() { const M = CRM.MQ; return V3(CR.o.x + M.X1 - 0.1, M.u + 1.38, CR.o.z + M.M.z); }
function crMgUpd(dt) {
  const C = CHAP.cross, g = C.mgMan; if (!g || !g.alive || !CR.mgOn || CINE.on) return;
  CR.mgT = (CR.mgT ?? 0.8) - dt; if (CR.mgT > 0) return;
  CR.mgN = (CR.mgN ?? 0) - 1; CR.mgT = 0.085; if (CR.mgN <= 0) { CR.mgN = Math.floor(rand(10, 22)); CR.mgT = rand(0.6, 1.4); return; }
  const mz = crMgMuzzle(), pe = playerEye(), lx = P.pos.x - CR.o.x, lz = P.pos.z - CR.o.z, inSt = lx > -88 && lx < 60 && Math.abs(lz - CR_RBZ) < 4.6, sees = inSt && P.alive && losW(mz.x, mz.y, mz.z, pe.x, pe.y - 0.3, pe.z);
  let tgt; if (sees) tgt = pe.clone().add(V3(rand(-1.2, 1.2), rand(-0.9, 0.4), rand(-1.2, 1.2))); else { const [x, z] = CW(rand(-80, 40), CR_RBZ + rand(-3.5, 3.5)); tgt = V3(x, groundAt(x, z) + rand(0, 1.2), z); }
  fxMuzzle(mz, false); if (Math.random() < 0.6) fxTracer(mz, tgt, true); sndShot('lmg', mz);
  if (sees) { if (Math.random() < [0.05, 0.08, 0.11][crDi()]) hurtPlayer(rand(9, 15), mz); else if (Math.random() < 0.25) sndWhiz(); }
  else if (Math.random() < 0.5) fxDust(V3(tgt.x, groundAt(tgt.x, tgt.z) + 0.1, tgt.z));
}

/* ---------- stage setup ---------- */
function crSeat(v, x, z) { return () => ({ p: v.g.localToWorld(V3(x * JK, 0.95 * JK, z * JK)), hd: v.hdV + (z < 0 ? Math.PI / 2 : -Math.PI / 2) }); }
function crCut(fn) { const f = $('#fade'); f.style.transition = 'opacity .5s'; f.style.opacity = '1'; DIRQ.push({ at: GAME.t + 0.55, fn: () => { fn(); f.style.transition = 'opacity 1.2s'; f.style.opacity = '0'; } }); }
const crPost = (s, name) => ({ name, x: s.x, z: s.z, y: s.y, fx: s.nx, fz: s.nz, state: 'post' });
// the mosque's upper floor on the stand: our men at its windows (east, south, north) and one at the front door below
function crMqPosts() { const M = CRM.MQ, y2 = M.F2 + 0.3, P0 = (lx, lz, y, nx, nz) => { const [x, z] = CW(lx, lz); return { x, z, y, nx, nz }; };
  return [P0(M.X1 - 1.0, M.M.z + 5.6, y2, 1, 0), P0(M.X1 - 1.0, M.M.z - 5.6, y2, 1, 0), P0(M.M.x - 4, M.Z1 - 1.0, y2, 0, 1), P0(M.M.x + 1, M.Z1 - 1.0, y2, 0, 1), P0(M.M.x - 4, M.Z0 + 1.0, y2, 0, -1), P0(M.M.x + 1, M.Z0 + 1.0, y2, 0, -1), P0(M.M.x + 5.5, M.Z0 + 1.0, y2, 0, -1), P0(M.X1 - 1.2, M.M.z + 2.0, M.f + 0.1, 1, 0)]; }
function crRideMG() { const C = CHAP.cross, M = CRM.MQ; const [x, z] = CW(M.X1 - 2.0, M.M.z), y = M.F2 + 0.3;
  P.ride = { pos: () => V3(x, y, z), eye: 1.42, mg: true, gun: C.mg, muzzle: () => C.mg.localToWorld(V3(0, 0.012, -1.5)) }; P.pos.set(x, y, z); P.yaw = -Math.PI / 2; P.pitch = -0.02; vm.visible = false; if (M.mgObj) M.mgObj.visible = false; }
function crSetup(stage) {
  const C = CHAP.cross; fieldSetupCommon(C, stage); resetTrail(); crPBReset(); CR.flee = []; CR.msgs = {}; CR.stage = stage; if (CR.shellIn && CR.shellIn.m) scene.remove(CR.shellIn.m); CR.shellIn = null; SLOW.left = 0; SLOW.k = 1; SLOW.look = null; for (const j of CRJ) scene.remove(j.m); CRJ.length = 0; for (const b of AIR.bombs) scene.remove(b.m); AIR.bombs.length = 0;
  CR.br = 0; CR.push = false; CR.air = [34, 18, 999, 999, 999][stage]; if (CR.strike) { scene.remove(CR.strike.m); CR.strike = null; } CR.wave = 0; CR.waveT = 0; CR.filmTod = null; CR.tanksOn = false; CR.mgOn = false; CR.mgN = 0; CR.mgT = 1; C.mgMan = null; CR.holdT = 0; crConvOff(); meter(null);
  if (CRM.MQ && CRM.MQ.mgObj) CRM.MQ.mgObj.visible = true;
  $('#clockSub').textContent = CR_CLOCK[stage];
  for (const v of VEH) if (v.mode === 'cross') { vehRevive(v); v.path = null; v.stop = undefined; v.ended = false; v.shown = false; v.g.visible = false; v.onEnd = null; v.speed = 0; }
  P.mode = 'rifle'; vm.visible = true; if (TANK.g) TANK.g.visible = false; C.mg.visible = false;
  { const X = C.jeepX; X.crHit = false; CR.hit3 = false; CR.thrown = null;
    X.men.forEach((m, i) => { if (m.parent !== X.g) X.g.add(m); m.position.set(...[[-0.35, 0.95, -0.3], [0.45, 0.95, 0.35], [-1.1, 0.95, 0.3]][i].map((q) => q * JK)); m.rotation.set(0, Math.PI / 2, 0); m.visible = true; });
    if (stage === 0) { const J = CR_J0.map(([x, z]) => CW(x, z)); X.shown = true; X.g.visible = true; X.path = J; X.s = 36; X.vmax = 0; X.hdV = null; X.stop = C.pbEnd - 12; CR.xGone = false; CR.push0 = null; const [x, z, hd] = pathAt(X.path, X.s); vehPose(X, x, z, hd); } }
  const J = CR_J0.map(([x, z]) => CW(x, z)), L = pathLen(J); C.pbEnd = crSAt(J, ...CW(CR_CAN0 - 16, CR_PBZ));
  if (stage <= 1) C.jeeps.forEach((v, i) => { v.shown = true; v.g.visible = true; v.ambush = null; v.hdV = null; v.off = 0; v.path = J; v.gap = i * 14;
    v.s = stage === 0 ? (i ? 34 - i * 14 : 48) : C.pbEnd + 30 - i * 14; v.vmax = stage === 0 ? 0 : 6.5; v.stop = stage === 0 ? C.pbEnd - (i ? 12 + v.gap : 0) : undefined; const [x, z, hd] = pathAt(J, v.s); vehPose(v, x, z, hd); });
  else C.jeeps.forEach((v, i) => { v.shown = true; v.g.visible = true; v.path = J; v.s = L - 6 - i * 9; v.vmax = 0; v.stop = v.s; v.hdV = null; const [x, z, hd] = pathAt(J, v.s); vehPose(v, x, z, hd); });
  if (stage === 0) C.pbT.forEach((v, i) => { v.shown = true; v.g.visible = true; v.path = [...CR_PB_PATH, [30, 72], [10, 100], [-10, 160], [-12, 230]].map(([x, z]) => CW(x, z)); v.s = 66 + i * 17; v.vmax = 0; v.hdV = null; v.onEnd = (q) => { q.g.visible = false; q.shown = false; }; const [x, z, hd] = pathAt(v.path, v.s); vehPose(v, x, z, hd); });
  const lead = C.jeeps[0]; lead.crew[0].visible = stage > 1;
  if (stage <= 1) { P.ride = { pos: () => lead.g.localToWorld(V3(-1.2, 1.3, 0)), eye: 1.62, mg: true, gun: C.mg, muzzle: () => C.mg.localToWorld(V3(0, 0.012, -1.5)) }; lead.g.updateMatrixWorld(true); P.pos.copy(P.ride.pos()); P.yaw = Math.PI / 2; P.pitch = -0.04; vm.visible = false; }
  else if (stage === 2) { const [x, z] = CW(38, CR_RBZ + 1.5); P.pos.set(x, groundAt(x, z), z); P.yaw = Math.PI / 2; P.pitch = 0; }
  else if (stage === 3) { const [x, z] = CW(-26, CR_RBZ + 2.6); P.pos.set(x, groundAt(x, z), z); P.yaw = Math.PI / 2 + 0.5; P.pitch = 0; P.crouch = true; }
  else crRideMG();
  const seats = [crSeat(lead, -1.5, -0.55), crSeat(lead, -1.5, 0.55), crSeat(C.jeeps[1], -1.45, -0.5), crSeat(C.jeeps[1], -1.45, 0.5), crSeat(C.jeeps[1], -0.35, 0.3), crSeat(C.jeeps[2], -1.45, -0.5), crSeat(C.jeeps[2], -1.45, 0.5), crSeat(C.jeeps[2], -0.35, 0.3)];
  const posts = crMqPosts(), fw = [-Math.sin(P.yaw), -Math.cos(P.yaw)];
  fieldFriends(CR_NAMES.map((name, i) => {
    const fo = CR_FOLLOW.indexOf(i); if (fo < 0) return null;
    if (stage <= 1) return { name, state: 'ride', ride: seats[fo], fi: fo };
    if (stage === 2 || stage === 3) { const b = 2.2 + fo * 1.2; return { name, x: P.pos.x - fw[0] * b + (fo % 2 ? 1 : -1) * fw[1] * 0.9, z: P.pos.z - fw[1] * b - (fo % 2 ? 1 : -1) * fw[0] * 0.9, state: 'follow', fi: fo }; }
    return posts[fo] ? crPost(posts[fo], name) : null;
  }));
  crBridgePose(0); crStage(stage);
}
function crStage(i) {
  const C = CHAP.cross; fieldStage(C, i); CR.stage = i; CR.msgs = {};
  if (i === 0) { if (CR.introSeen) DIRQ.push({ at: GAME.t + 0.4, fn: crIntroEnd }); else DIRQ.push({ at: GAME.t + 0.4, fn: () => crIntroFilm() }); }
  if (i === 1) { const lead = C.jeeps[0]; C.stops = {}; for (const id in CR_AMB) C.stops[id] = crSAt(lead.path, ...CW(...CR_AMB[id].stop)); radio('מ״פ', 'עברנו! עכשיו בין השדות, אל הכפר — שם יעלה גשר הגלילים לגדה. מקלעים מוכנים!', 4); }
  if (i === 2) crStreetStart();
  if (i === 3) crFlankStart();
  if (i === 4) crHoldStart();
}
/* ---------- stage 3: the main street, straight up it ---------- */
// who waits where along it: in each bound, men on the roofs ahead and behind the carts and the drums ahead; the more the harder the level
function crStreetMan() {
  const C = CHAP.cross, di = crDi(), n = CR_G2.length - 1, per = [[2, 1], [2, 2], [3, 2]][di];
  for (let k = 0; k < n; k++) { const xa = CR_G2[k + 1][0] - 13, xb = CR_G2[k][0] - 6;
    for (const [grp, m] of [['roof', per[0]], ['prop', per[1]]]) { const c = C.slots.filter((s) => s.grp === grp && !s.used && s.ax > xa && s.ax < xb); for (let j = 0; j < m && c.length; j++) { const s = c.splice(Math.floor(((k * 7 + j * 3) % 11) / 11 * c.length), 1)[0]; const e = fSlotPlace(s, j === 0 && k % 2 && grp === 'prop' ? 'rpg' : grp === 'roof' && j === 1 ? 'smg' : 'rifle', 'g' + k, { wakeR: 30 }); if (e) e.cyc = rand(0.3, 0.9); } } }
}
function crStreetStart() {
  radio('מ״פ', 'הכפר שולט על המקום שבו יעלה גשר הגלילים. עולים ברחוב הראשי עד סופו — ממחסה למחסה, עיניים על הגגות!', 4.5);
  hint('cr-street', '<b>ברחוב עצמו, ממחסה למחסה:</b> עגלות, חביות, ערמות לבנים וחבילות קש לאורך שני צדי הרחוב. המצרים על הגגות, מאחורי המעקות, ומאחורי המחסות שלפניכם. הקטע הבא נפתח כשהקטע הזה נקי.', 9);
  crStreetMan();
  const pts = CR_G2.map(([x, z]) => CW(x, z));
  gateStart(pts, (k) => { for (const e of UNITS.enemies) if (e.alive && e.sq === 'g' + k && e.dormant) { e.dormant = false; e.cyc = rand(0.4, 1.4); } if (k > 0) radio('מ״פ', pick(['קדימה! למחסה הבא!', 'על הגג משמאל! אש!', 'מאחורי העגלה — רימון!', 'עוד קטע! צמודים לקירות!']), 2.4); },
    () => crStreetEnd(), 'מחסה', 6, 3.6);
}
function crStreetEnd() {
  if (CR.msgs.send) return; CR.msgs.send = true; const C = CHAP.cross;
  C.mgMan = fSlotPlace(C.mgSlot, 'lmg', 'mg', { dormant: false }); if (C.mgMan) { C.mgMan.cyc = 99; C.mgMan.peek = false; }   // he does not fight as a rifleman: his gun is the script's (crMgUpd)
  CR.mgOn = true; CR.mgT = 0.2; CR.mgN = 26; sndShouts(null, 0.3);
  radio('צנחן', 'מקלע! מהמסגד — מהחלון למעלה! לרדת!', 2.4);
  DIRQ.push({ at: GAME.t + 2.4, fn: () => crStage(3) });
}
/* ---------- stage 4: round it - the alley, the lane, the south arm, the side door, the hall, the stair, the upper floor, the MG room ---------- */
function crFlankPts() { const M = CRM.MQ, y1 = M.f + 0.1, y2 = M.F2 + 0.3;
  return [[-28, CR_RBZ + 2.6], [-40, CR_RBZ + 8], [-40, CR_LZ - 1.5], [-62, CR_LZ], [-84, CR_LZ], [CR_BAR, -27.5], [M.door[0], M.Z1 + 1.6], [M.door[0], M.Z1 - 3.0, y1], [M.SX0 + 0.9, M.SZ0 + 1.2, y1], [M.SX0 + 1.2, M.SZ1 - 1.0, y2], [M.PX - 1.6, M.M.z - 2.6, y2], [M.X1 - 2.6, M.M.z - 1.2, y2]].map(([x, z, y]) => { const [wx, wz] = CW(x, z); return y === undefined ? [wx, wz] : [wx, wz, y]; }); }
// which group of men holds each bound of the way round
const CR_FLANK = [[], ['lane'], ['arm'], [], [], ['hall'], [], [], ['up'], ['mgroom'], ['mg']];
function crFlankStart() {
  const C = CHAP.cross; CR.mgOn = true;
  if (!C.mgMan || !C.mgMan.alive) { C.mgMan = fSlotPlace(C.mgSlot, 'lmg', 'mg', { dormant: false }); if (C.mgMan) C.mgMan.cyc = 99; }
  if (C.mgMan) C.mgMan.sq = 'g10';
  CR_FLANK.forEach((grps, k) => { for (const s of C.slots) if (grps.includes(s.grp) && s.grp !== 'mg' && !s.used) { const e = fSlotPlace(s, s.kind || 'rifle', 'g' + k, { wakeR: s.grp === 'hall' || s.grp === 'up' || s.grp === 'mgroom' ? 9 : 18 }); if (e) e.cyc = rand(0.3, 0.9); } });
  radio('מ״פ', 'המקלע מרתק את הרחוב! לא נשארים בו — לסמטה מימין, מאחורי הבתים, ומשם לדלת הצד של המסגד!', 4.6);
  hint('cr-flank', '<b>עוקפים את המקלע:</b> הסמטה הצרה שמימין (דרומה), הסמטה שמאחורי הבתים מערבה, אל הזרוע הדרומית של הרחוב, ודלת הצד של המסגד. בפנים: אולם התפילה, המדרגות לאורך הקיר המערבי, הקומה השנייה — וחדר המקלע מעל הדלת הראשית. רימון לפני כל פתח.', 11);
  gateStart(crFlankPts(), (k) => { const say = ['לסמטה! צמודים לקיר!', 'מאחורי הבתים — שקט, צמודים!', 'הזרוע הדרומית! פינה — זהירות!', 'דלת הצד! רימון ופנימה!', 'האולם! מאחורי העמודים!', 'המדרגות — לאורך הקיר המערבי, למעלה!', 'קומה שנייה! חדר המקלע מקדימה!', 'הדלת של חדר המקלע — רימון!', 'המקלען! הוא עם הגב אליכם!'][k - 1]; if (say) radio('מ״פ', say, 2.6); },
    () => crMqTaken(), 'נקודה', 2.4, 0);
}
function crMqTaken() {
  if (CR.msgs.mq) return; CR.msgs.mq = true; CR.mgOn = false; const C = CHAP.cross; if (C.mgMan && C.mgMan.alive) killEnemy(C.mgMan, false);
  feed('המסגד בידינו', 'good'); radio('מ״פ', 'המסגד שלנו! תפוס את המקלע — הם יחזרו, מאותה דרך שבאנו!', 3.6); snapRequest('village');
  DIRQ.push({ at: GAME.t + 3.2, fn: () => crCut(() => crSetup(4)) });
}
/* ---------- stage 5: on the MG, two minutes, while the roller bridge goes across ---------- */
// where the reinforcement comes from: down the main street from the canal end, and down the north arm; and where each man runs to
function crReinf(f, j) {
  const di = crDi(), r = rng(7100 + CR.wave * 131 + j * 17), props = CRM.PROPS.filter((p) => (f === 'e' ? p.along === 'x' && p.x > -66 && p.x < 26 : p.along === 'z' && p.z < -50));
  const p = props[Math.floor(r() * props.length)], kind = j % 4 === 2 && CR.wave % 2 ? 'rpg' : j % 3 === 1 ? 'smg' : 'rifle'; if (!p) return null;
  let path, x0, z0; const tx = p.x + (p.along === 'x' ? -0.8 : (p.s > 0 ? 0.6 : -0.6)), tz = p.z + (p.along === 'x' ? 0 : -0.8);
  if (f === 'e') { x0 = 48 + r() * 10; z0 = CR_RBZ + (r() - 0.5) * 4; path = [[30, CR_RBZ + (r() - 0.5) * 5], [tx, tz]]; } else { x0 = CR_BAR + (r() - 0.5) * 3; z0 = -104 - r() * 6; path = [[CR_BAR + (r() - 0.5) * 4, -86], [tx, tz]]; }
  const e = fSpawnStreet(...CW(x0, z0), path.map(([x, z]) => CW(x, z)), kind); if (!e) return null; e.sq = 'h'; e.crFront = f; e.tac = j % 2 ? 'storm' : 'hold'; return e;
}
function crWave() {
  const di = crDi(), n = CR.wave, east = [3, 4, 5][di] + Math.min(3, n >> 1), north = n % 2 ? [2, 3, 3][di] : n > 3 ? 2 : 0;
  for (let j = 0; j < east; j++) DIRQ.push({ at: GAME.t + j * 0.9, spawn: true, fn: () => crReinf('e', j) });
  for (let j = 0; j < north; j++) DIRQ.push({ at: GAME.t + 1.5 + j * 1.0, spawn: true, fn: () => crReinf('n', j) });
  sndShouts(null, 0.3); radio('תצפית', north ? pick(['הם באים — במורד הרחוב ומהזרוע הצפונית!', 'עוד גל! מהרחוב ומצפון!']) : n ? pick(['עוד גל במורד הרחוב!', 'עוד הם באים — מכיוון התעלה!']) : 'הם באים! במורד הרחוב, מאיפה שבאנו!', 2.8);
  CR.wave++;
}
function crHoldStart() {
  const C = CHAP.cross, M = CRM.MQ; CR.push = true; CR.wave = 0; CR.waveT = 4; CR.holdT = 0;
  const win = () => V3(CR.o.x + M.X1 + 1.5, M.u + 2.0, CR.o.z + M.M.z), tip = () => V3(CR.o.x + CRM.RB.tip, 2.2, CR.o.z + CR_RBZ);
  playCine({ vid: 'cr2_hold', title: 'המסגד · 19 באוקטובר 1973',
    shots: [
      { d: 6.5, cam: camLerp(() => win().add(V3(-1, 0, 0)), () => win().add(V3(2, -0.3, 0)), () => V3(CR.o.x + 40, 2, CR.o.z + CR_RBZ), () => V3(CR.o.x + 90, 2, CR.o.z + CR_RBZ), 38) },
      { d: 6.5, cam: camLerp(() => tip().add(V3(-26, 7, 24)), () => tip().add(V3(-20, 6, 20)), () => tip(), () => tip().add(V3(6, 0, 0)), 50) },
    ],
    caps: [[0.4, '<b>מחלון המקלע</b> רואים את כל הרחוב — עד התעלה.', 5.8], [6.8, 'שם הטנקים דוחפים את גשר הגלילים אל המים, גליל אחרי גליל.', 5.8]],
    end: () => { crRideMG(); radio('מ״פ', 'שתי דקות! עד שהגשר נוגע בגדה ואנחנו מחזיקים את הרחוב. אש על כל מי שזז בו!', 4);
      hint('cr-hold', `<b>על המקלע:</b> ${TOUCH ? 'לחיצה ממושכת על אש' : 'לחיצה ממושכת'} יורה צרורות, והכוונת נצמדת לאויב הקרוב. התגבורת באה במורד הרחוב — מאחורי העגלות והחביות — ומהזרוע הצפונית. בקצה הרחוב גשר הגלילים נדחף אל המים: הפס למעלה מראה כמה נשאר.`, 11); },
  });
}
function crBridgeDone() {
  const C = CHAP.cross; CR.push = false; meter('גשר הגלילים', 1); feed('גשר הגלילים מונח', 'good'); crTanksGo();
  for (let i = DIRQ.length - 1; i >= 0; i--) if (DIRQ[i].spawn) DIRQ.splice(i, 1);
  const t0 = () => C.tanks[0].g.position.clone(), wb = V3(CR.o.x + CR_CAN0 - 22, 6.5, CR.o.z + CR_RBZ - 16);
  playCine({ vid: 'cr2_bridge', shots: [{ d: 8.5, cam: camLerp(wb, wb.clone().add(V3(3, -0.8, 2)), () => t0().add(V3(-26, 1, 0)), () => t0().add(V3(0, 1.5, 0)), 44) }],
    caps: [[0.5, '<b>19 באוקטובר.</b> הקצה נוגע בגדה המערבית. הטנק הראשון עולה על גשר הגלילים.', 7.6]],
    end: () => { crRideMG(); radio('מג״ד', 'הגשר מונח! הטנקים עולים עליו — הם באים במעלה הרחוב, אליכם!', 4); CR.tankPh = true; } });
}
/* ---------- the tanks: over the bridge, up the street, under the mosque, north up the arm and west over the concrete bridge ---------- */
const CR_TDEST = [[[-88, CR_RBZ], [CR_BAR, -56], [CR_BAR, -96], [-96, CR_SBZ], [CR_SWC, CR_SBZ], [-170, CR_SBZ], [-230, CR_SBZ]], [[-88, CR_RBZ], [CR_BAR, -56], [CR_BAR, -88]], [[-62, CR_RBZ]], [[-40, CR_RBZ]], [[-16, CR_RBZ]], [[8, CR_RBZ]]];
function crTanksGo() {
  const C = CHAP.cross; CR.tanksOn = true;
  C.tanks.forEach((v, i) => { vehRevive(v); const pts = [[CR_CAN1 + 14 + i * 16, CR_RBZ], [CR_CAN1 + 6, CR_RBZ], [CR_CAN0 - 6, CR_RBZ], [30, CR_RBZ], ...CR_TDEST[i]]; v.path = pts.map(([x, z]) => CW(x, z)); v.s = 0; v.vmax = 8; v.speed = 0; v.stop = pathLen(v.path); v.ended = false; v.hdV = null; v.onEnd = null; v.shown = true; v.g.visible = true; v.name = ['הטנק הראשון', 'טנק 2', 'טנק 3', 'טנק 4', 'טנק 5', 'טנק 6'][i]; v.mgT = rand(0, 1); v.gunT = rand(1.5, 3.5); const [x, z, hd] = pathAt(v.path, 0); vehPose(v, x, z, hd); });
}
function crTankGun(v, dt) {
  if (!v.alive || !v.g.visible) return; const from = v.g.position.clone(); from.y += 2.55;
  v.tgtT = (v.tgtT || 0) - dt; if (v.tgtT <= 0 || !v.tgt || !v.tgt.alive) { v.tgtT = 0.5; v.tgt = null; let bd = 320; for (const e of UNITS.enemies) { if (!e.alive || !e.rig.root.visible) continue; const c = e.chest(), d = from.distanceTo(c); if (d < bd && losW(from.x, from.y, from.z, c.x, c.y, c.z)) { bd = d; v.tgt = e; } } }
  const e = v.tgt; if (!e) return; const c = e.chest();
  v.mgT -= dt; if (v.mgT <= 0) { v.mgN = (v.mgN ?? 14) - 1; v.mgT = 0.08; if (v.mgN <= 0) { v.mgT = rand(0.35, 0.8); v.mgN = Math.floor(rand(10, 20)); }
    const mz = from.clone().add(V3(0, 0.15, 0)); if (Math.random() < 0.5) fxMuzzle(mz, false); fxTracer(mz, c.clone().add(V3(rand(-1.3, 1.3), rand(-0.7, 0.9), rand(-1.3, 1.3))), false); if (Math.random() < 0.35) sndShot('lmg', mz);
    if (Math.random() < 0.07) killEnemy(e, false); else if (Math.random() < 0.3) fxDust(V3(c.x + rand(-1.5, 1.5), groundAt(c.x, c.z) + 0.1, c.z + rand(-1.5, 1.5))); }
  v.gunT -= dt; if (v.gunT <= 0) { v.gunT = rand(2.4, 4.0); const p = e.pos.clone(), a = Math.atan2(p.x - from.x, p.z - from.z), mz = v.g.position.clone().add(V3(Math.sin(a) * 4.6, 2.3, Math.cos(a) * 4.6)); fxMuzzle(mz, true); fxExplosion(mz, 0.4); sndCannon(mz, 1.0); fxTracer(mz, c, true); FX.shake = Math.max(FX.shake, clamp(0.5 - camera.position.distanceTo(mz) / 80, 0, 0.4));
    DIRQ.push({ at: GAME.t + 0.22, fn: () => { p.y = groundAt(p.x, p.z); fxExplosion(p, 1.3); sndBoom(p, 1.1); for (const o of UNITS.enemies) if (o.alive && o.pos.distanceTo(p) < 5.5) killEnemy(o, false); } }); }
}
// the Egyptians break: whoever is left runs away from the tanks - west and north, out of the village
function crFlee() {
  CR.msgs.flee = true; CR.fleeT = CHAP.cross.t; for (let i = DIRQ.length - 1; i >= 0; i--) if (DIRQ[i].spawn) DIRQ.splice(i, 1);
  for (const e of UNITS.enemies) if (e.alive && e.sz && e.sq === 'h') { e.state = 'film'; e.sz = null; e.dormant = false; e.drift = rand(-0.9, 0.9); e.anim = rand(0, 6); if (e.slot) { e.slot.used = false; e.slot = null; } CR.flee.push(e); }
  radio('מ״פ', 'הם בורחים! הם נשברים ובורחים לשדות!', 3); feed('המצרים נסוגים', 'good');
}
/* ---------- every frame ---------- */
function crUpd(dt) {
  const C = CHAP.cross; C.t += dt; CR.t = (CR.t || 0) + dt; if (Math.floor(C.t * 2) !== Math.floor((C.t - dt) * 2)) szEnemyCleanup();
  if (CRM.built) CRM.upd(dt);
  for (let i = DIRQ.length - 1; i >= 0; i--) if (DIRQ[i] && GAME.t >= DIRQ[i].at) { const q = DIRQ.splice(i, 1)[0]; q.fn(); }
  crJetsUpd(dt); crBombsUpd(dt); updDebris(dt); crHitUpd(dt); rippleUpd(dt); crConvUpd(dt); crMgUpd(dt); if (!CR.msgs.flee) crShells(dt);
  if (CR.push && CR.br < 1 && !CINE.on) CR.br = Math.min(1, CR.br + dt / CR_HOLD);
  crBridgePose(dt);
  if (CR.stage < 2 && !CINE.on && !(CR.stage === 0 && !CR.msgs.go)) { CR.air -= dt; if (CR.air <= 0) { CR.air = rand(20, 30); crJet(CR.stage === 0 ? 'pb' : 'bridge'); } }
  // the gun turns with the gunner: on the jeep, and in the mosque's window
  if (P.ride && P.ride.mg) { C.mg.visible = !CINE.on; C.mg.quaternion.copy(camera.quaternion); C.mg.position.copy(playerEye()).add(V3(0.0, -0.44, -0.3).applyQuaternion(camera.quaternion)); } else C.mg.visible = false;
  for (const e of CR.flee) { if (!e.alive) continue; const sp = 5.4 * dt; e.pos.x -= sp * 0.8; e.pos.z -= sp * 0.6 + (e.drift || 0) * dt; e.heading = Math.atan2(-0.8, -0.6); e.pos.y = groundAt(e.pos.x, e.pos.z); e.anim += dt * 11; e.stance = 'stand'; e.rig.pose('run', e.anim); e.sync(); }
  if (CR.tankPh) for (const v of C.tanks) crTankGun(v, dt);
  if (CR.stage === 0) {
    const lead = C.jeeps[0], X = C.jeepX;
    if (CR.msgs.go && !CR.hit3 && !CR.strike && !CR.shellIn && X.g.position.x - CR.o.x < (CR_CAN0 + CR_CAN1) / 2 + 6) crStrike(); crStrikeUpd(dt); crShellUpd(dt);
    if (CR.cut) { if (CR.cutS === undefined) CR.cutS = X.s; C.jeeps[1].stop = Math.min(C.jeeps[1].stop, CR.cutS - 13); C.jeeps[2].stop = Math.min(C.jeeps[2].stop, CR.cutS - 27); }
    if (lead.g.position.x - CR.o.x < CR_CAN1 - 18 && !CR.msgs.fire) { CR.msgs.fire = true; let first = true; for (const s of C.slots) if (s.grp === 'L') { fSlotSpawn(first ? 'rpg' : 'rifle', (q) => q === s, 'L'); first = false; } radio('צנחן', 'אש מהסוללה! מצפון לגשר, על הסוללה — מקלע!', 2.4);
      for (let k = 0; k < 8; k++) DIRQ.push({ at: GAME.t + 3 + k * 1.2, spawn: true, fn: () => { const [x, z] = CW(44 + (k % 3) * 2, -14 + k * 2), [tx, tz] = CW(51 + (k % 4) * 0.8, 6 + k * 5); const e = fSpawnStreet(x, z, [[tx, tz]], k % 4 === 2 ? 'rpg' : 'rifle'); if (e) e.sq = 'L'; } }); }
    if (lead.s >= lead.stop - 0.8) { CR.msgs.landT = (CR.msgs.landT || 0) + dt; if (!CR.msgs.off && holdDone(fieldLeft((e) => e.sq === 'L'), CR.msgs.landT)) { CR.msgs.off = true; fieldDespawn((e) => e.sq === 'L'); radio('נהג', 'יורדים מהגשר! מחזיקים חזק!', 2); crStage(1); } }
  } else if (CR.stage === 1) {
    const lead = C.jeeps[0], L = pathLen(lead.path);
    for (const id in CR_AMB) { const s0 = C.stops[id]; if (lead.s > s0 - 75 && !CR.msgs[id]) { CR.msgs[id] = true; crAmbush(id); lead.stop = s0; } }
    for (const v of C.jeeps) { if (CR.cut && v !== lead) continue; v.stop = lead.stop === undefined ? (v === lead ? L - 0.5 : L - 0.5 - v.gap) : lead.stop - v.gap; if (v !== lead) v.vmax = lead.vmax; }
    if (lead.stop !== undefined && lead.s > lead.stop - 0.8 && lead.ambush) { CR.msgs.wait = (CR.msgs.wait || 0) + dt; const left = fieldLeft((e) => e.sq === lead.ambush); if (holdDone(left, CR.msgs.wait)) { fieldDespawn((e) => e.sq === lead.ambush); lead.stop = undefined; lead.ambush = null; CR.msgs.wait = 0; radio('נהג', left ? 'אין זמן, ממשיכים!' : 'נקי! ממשיכים!', 2); } }
    if (lead.s >= L - 1.2 && !CR.msgs.out) { CR.msgs.out = true; crDismount(); }
  } else if (CR.stage === 2 || CR.stage === 3) { updTrail(dt); gateUpd(dt); }
  else if (CR.stage === 4) {
    if (CINE.on) return; updTrail(dt);
    if (CR.push) { CR.holdT += dt; CR.waveT -= dt; if (CR.waveT <= 0 && CR.br < 0.92) { crWave(); CR.waveT = [17, 14, 12][crDi()]; }
      for (const [k, txt] of [[0.25, 'הגשר ברבע הדרך! תחזיקו!'], [0.5, 'חצי גשר במים!'], [0.8, 'שמונים אחוז! הקצה כמעט בגדה!'], [0.95, 'עוד גליל אחד! הטנקים מתניעים!']]) if (CR.br >= k && !CR.msgs['b' + k]) { CR.msgs['b' + k] = true; radio('גשר', txt, 3); }
      if (CR.br >= 1 && !CR.msgs.done) { CR.msgs.done = true; crBridgeDone(); } }
    if (CR.tankPh) { const t0 = C.tanks[0], under = t0.alive && t0.g.position.x - CR.o.x < -80;
      if (!CR.msgs.arr && under) { CR.msgs.arr = true; radio('מפקד הטנק', 'אנחנו מתחת למסגד! ממשיכים צפונה, לגשר הבטון — תנו לנו מטרות!', 3.4); DIRQ.push({ at: GAME.t + 5, fn: () => { if (!CR.msgs.flee) crFlee(); } }); }
      if (!CR.msgs.flee && C.t > 90 && CR.br >= 1) crFlee();
      if (CR.msgs.flee && !CR.msgs.end && C.t - CR.fleeT > 9) { CR.msgs.end = true; DIRQ.push({ at: GAME.t + 0.5, fn: crEndFilm }); } }
  }
}
function crAmbush(id) {
  const C = CHAP.cross, lead = C.jeeps[0], A = CR_AMB[id]; lead.ambush = id;
  for (const s of C.nests[id]) fSlotSpawn(s.kind, (q) => q === s, id);
  const rr = rng(7300 + id.charCodeAt(1)), stop = A.stop;
  for (let k = 0; k < 11; k++) { const ox = rr() * 16 - 8, oz = rr() * 16 - 8, u = 0.45 + rr() * 0.3; DIRQ.push({ at: GAME.t + 2 + k * 0.7, spawn: true, fn: () => { const x = A.from[0] + ox, z = A.from[1] + oz, tx = lerp(x, stop[0], u), tz = lerp(z, stop[1], u); const e = fSpawnStreet(...CW(x, z), [CW(tx, tz)], k === 3 ? 'rpg' : 'rifle'); if (e) e.sq = id; } }); }
  radio('צנחן', A.txt, 2.6);
}
function crDismount() {
  const C = CHAP.cross, lead = C.jeeps[0]; P.ride = null; C.mg.visible = false; vm.visible = true; P.crouch = false; lead.crew[0].visible = true;
  radio('מ״פ', 'קופצים מהג׳יפים! הכפר מקדימה — מחר עם שחר נכנסים לרחוב הראשי.', 3.4);
  DIRQ.push({ at: GAME.t + 3.2, fn: () => crCut(() => crSetup(2)) });
}
/* ---------- films ---------- */
// the opening: the roller bridge lying on the east bank, the shells in the canal; then the pontoon bridge to the south, the tanks and the jeeps on it
function crIntroFilm() {
  const C = CHAP.cross, pb = () => C.jeeps[0].g.position.clone(), rb = V3(CR.o.x + CRM.RB.tip + 50, 3, CR.o.z + CR_RBZ);
  CR.filmTod = 7 * 60 + 50;
  const water = (lx, lz, k) => () => crBurst(CR.o.x + lx, CR.o.z + lz, k), land = (lx, lz) => () => { const [x, z] = CW(lx, lz), p = V3(x, groundAt(x, z), z); fxExplosion(p, 1.2); sndBoom(p, 1.0); };
  playCine({ vid: 'cr2_intro', title: 'הגשרים · 16–18 באוקטובר 1973',
    shots: [
      { d: 8.5, cam: camLerp(rb.clone().add(V3(-70, 34, 60)), rb.clone().add(V3(-52, 25, 46)), rb.clone().add(V3(-20, -2, 0)), rb.clone().add(V3(-6, -2, 0)), 50) },
      { d: 8.0, cam: camLerp(V3(CR.o.x + CR_CAN0 + 4, 1.6, CR.o.z + CR_RBZ + 26), V3(CR.o.x + CR_CAN0 + 8, 1.5, CR.o.z + CR_RBZ + 22), rb.clone().add(V3(-30, -1, 0)), rb.clone().add(V3(-10, -1, 0)), 46) },
      { d: 8.5, cam: (u) => ({ p: pb().add(V3(-26 + u * 6, 7.5, 24)), l: pb().add(V3(-6, 1.0, 0)), fov: 50 }) },
    ],
    ev: [[1.8, water(110, -14, 1.5)], [4.0, land(220, -10)], [5.8, water(95, -66, 1.4)], [10.5, water(130, -20, 1.2)], [13.0, land(200, -80)], [15.0, water(112, -55, 1.4)], [18.2, water(120, CR_PBZ + 26, 1.3)], [21.0, water(150, CR_PBZ - 22, 1.2)]],
    caps: [[0.6, '<b>16 באוקטובר.</b> בדרך אל התעלה נשבר גשר הגלילים — יותר ממאה מטר של גלילי פלדה. הוא תוקן, ונגרר אל הגדה.', 7.6], [8.8, 'הוא מחכה על הגדה המזרחית, מול הכפר שממול — תחת הפגזה.', 7.0], [16.6, 'מדרום, גשר הדוברות עומד על התעלה מאז אחר הצהריים של ה־17. עליו עוברים הטנקים — ואחריהם הצנחנים בג׳יפים.', 5.0], [21.8, '<b>מ״פ:</b> נוסעים! מקלעים מוכנים — ועיניים על הסוללה ממול!', 3.0]],
    end: crIntroEnd,
  });
}
function crIntroEnd() { const C = CHAP.cross; CR.introSeen = true; CR.filmTod = null; CR.msgs.go = true; for (const v of [...C.jeeps, C.jeepX, ...C.pbT]) if (v.g.visible) v.vmax = 3; hint('cr-mg', `אתם על המקלע של הג׳יפ: ${TOUCH ? 'לחצו ממושך על אש' : 'לחיצה ממושכת'} יורה צרורות. הכוונת נצמדת לאויב הקרוב. חוליות בזוקה מסומנות באדום.`, 8); }
function crConvOff() { const C = CHAP.cross; CR.conv = null; if (C.conv) C.conv.visible = false; }
const CR_CONV = [[320, -70], [250, -44], [CR_CAN1 + 6, CR_RBZ], [CR_CAN0 - 6, CR_RBZ], [30, CR_RBZ], [-88, CR_RBZ], [CR_BAR, -56], [CR_BAR, -96], [-96, CR_SBZ], [-160, CR_SBZ], [-300, CR_SBZ]];
function crConvUpd(dt) {
  const C = CHAP.cross, V = CR.conv; if (!V) return; V.s += 7 * dt; const path = V.path, m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), up = V3(0, 1, 0), hide = V3(0, -100, 0), one = V3(1, 1, 1), zero = V3(0.001, 0.001, 0.001);
  for (let i = 0; i < 50; i++) { const s = V.s - i * 17; if (s < 0) { C.conv.setMatrixAt(i, m4.compose(hide, q.identity(), zero)); continue; } const [x, z, hd] = pathAt(path, s), fy = crAnyDeck(x, z); q.setFromAxisAngle(up, hd - Math.PI / 2); C.conv.setMatrixAt(i, m4.compose(V3(x, fy ?? groundAt(x, z), z), q, one)); }
  C.conv.instanceMatrix.needsUpdate = true; C.conv.visible = true;
}
function crEndFilm() {
  const C = CHAP.cross, t0 = C.tanks[0], lp = () => t0.g.position.clone();
  for (const e of UNITS.enemies) if (e.alive && e.state !== 'film') { e.alive = false; e.rig.root.visible = false; e.tag.visible = false; }
  for (let k = 0; k < 14; k++) { const [x, z] = CW(-150 - rand(0, 40), rand(-140, -60)), e = spawnEnemy(x, z, k % 4 ? 'rifle' : 'rpg', null, null); if (!e) continue; e.state = 'film'; e.sq = 'flee'; e.drift = rand(-0.8, 0.8); e.anim = rand(0, 6); e.noTag = true; CR.flee.push(e); }
  const path = CR_CONV.map(([x, z]) => CW(x, z)); CR.conv = { path, s: 260 };
  const fire = () => { for (const v of C.tanks) if (v.alive && v.g.visible) { const e = CR.flee.find((q) => q.alive); if (!e) return; const from = v.g.position.clone().add(V3(0, 2.6, 0)); fxTracer(from, e.chest(), false); fxMuzzle(from, false); if (Math.random() < 0.35) killEnemy(e, false); } };
  const c2 = () => { const V = CR.conv; if (!V) return lp(); const [x, z] = pathAt(V.path, Math.max(0, V.s - 34)); return V3(x, crAnyDeck(x, z) ?? groundAt(x, z), z); };
  const drone = (cf, a0, a1, r0, r1, h0, h1, look, fov) => (u) => { const c = cf(), e = u * u * (3 - 2 * u), a = lerp(a0, a1, u), r = lerp(r0, r1, e), h = lerp(h0, h1, e); return { p: V3(c.x + Math.sin(a) * r, c.y + h, c.z + Math.cos(a) * r), l: c.clone().add(look), fov }; };
  const boom = (cf, r0, r1, k = 1) => () => { const c = cf(), a = rand(0, 6.283), r = rand(r0, r1), x = c.x + Math.sin(a) * r, z = c.z + Math.cos(a) * r, p = V3(x, groundAt(x, z), z), sz = rand(1.0, 1.6) * k; fxExplosion(p, sz); sndBoom(p, sz); FX.shake = Math.max(FX.shake, 0.18); };
  playCine({ vid: 'cr2_end', title: 'הגדה המערבית · 19 באוקטובר 1973',
    shots: [
      { d: 8.5, cam: drone(lp, 0.9, 2.5, 22, 30, 12, 16, V3(-8, 1.2, 0), 58) },
      { d: 10.0, cam: drone(c2, -0.6, 1.3, 26, 34, 15, 19, V3(-4, 1.5, 0), 58) },
      { d: 9.5, cam: drone(c2, 1.3, 2.4, 34, 78, 19, 58, V3(-10, 0, 0), 56) },
    ],
    ev: [...[0.5, 1.1, 1.7, 2.3, 2.9, 3.5, 4.1, 4.7, 5.3, 5.9, 6.5, 7.1, 7.7].map((t) => [t, fire]), ...[0.8, 1.9, 2.7, 3.9, 4.6, 5.8, 6.9, 7.8].map((t) => [t, boom(lp, 13, 38)]),
      [8.5, () => { for (const e of CR.flee) { e.alive = false; e.rig.root.visible = false; } for (const v of C.tanks.slice(2)) { v.g.visible = false; v.path = null; } }],
      ...[9.4, 10.6, 11.5, 12.9, 14.2, 15.0, 16.4, 17.7].map((t) => [t, boom(c2, 16, 44)]), ...[19.6, 21.3, 23.0, 25.1, 26.8].map((t) => [t, boom(c2, 30, 75, 1.3)])],
    caps: [[0.4, 'המצרים נשברים ונסוגים אל השדות.', 7.4], [8.8, '<b>19 באוקטובר.</b> טור ארוך של טנקים עולה על גשר הגלילים, ברחוב הכפר, מתחת למסגד — ומערבה, על גשר הבטון.', 8.6], [18.6, 'גשר הגלילים הונח מצפון לגשר הדוברות. בימים הבאים עברו על שני הגשרים אוגדות שלמות, וראש הגשר בגדה המערבית התרחב לרוחב של קילומטרים.', 9.0]],
    end: () => { CR.filmTod = null; DIRQ.push({ at: GAME.t + 0.3, fn: () => endGame(true) }); },
  });
}
/* ---------- the chapter's hooks ---------- */
function crObj() {
  const C = CHAP.cross;
  if (CR.stage === 0) { const e = fieldNearest((q) => q.sq === 'L'); if (e) return [e.pos.x, e.pos.y + 2.2, e.pos.z, 'מצרים על הסוללה', 'foe']; const [x, z] = CW(CR_CAN0 - 10, CR_PBZ); return [x, 1.5, z, 'קצה הגשר']; }
  if (CR.stage === 1) { const lead = C.jeeps[0]; if (lead.ambush) { const e = fieldNearest((q) => q.sq === lead.ambush); if (e) return [e.pos.x, e.pos.y + 2.2, e.pos.z, 'מארב', 'foe']; } return null; }
  if (CR.stage === 2) return gateObj('מצרי בקטע', 'המחסה הבא');
  if (CR.stage === 3) { if (CR.msgs.mq) return null; const o = gateObj('מצרי בקטע', 'הלאה'); if (o && GATE.i >= 9 && C.mgMan && C.mgMan.alive && o[4] !== 'foe') { const p = C.mgMan.pos; return [p.x, p.y + 2, p.z, 'המקלען', 'foe']; } return o; }
  if (CR.stage === 4) { const e = !CR.msgs.flee && fieldNearest((q) => q.sq === 'h', 160); if (e) return [e.pos.x, e.pos.y + 2.2, e.pos.z, 'תגבורת', 'foe']; if (CR.tankPh) { const p = C.tanks[0].g.position; return [p.x, p.y + 3.5, p.z, 'הטנקים']; } return null; }
  return null;
}
function crItems(items) {
  const C = CHAP.cross, S = CR_STAGES[CR.stage]; items.push(['go', (S.goal || S.sub) + (OBJ.on ? ' (◆)' : '')]);
  if (CR.stage === 0) { const lead = C.jeeps[0], left = fieldLeft((e) => e.sq === 'L'); items.push(['', lead.s >= lead.stop - 1 ? `בקצה הגשר · מצרים על הסוללה: ${left}` : `עד קצה הגשר: ${Math.max(0, Math.round(lead.stop - lead.s))} מ׳${left ? ` · מצרים על הסוללה: ${left}` : ''}`]); }
  if (CR.stage === 1) { const lead = C.jeeps[0]; items.push(['', lead.ambush ? `מארב! מצרים שנותרו: ${fieldLeft((e) => e.sq === lead.ambush)}` : `עד הכפר: ${Math.max(0, Math.round(pathLen(lead.path) - lead.s))} מ׳`]); }
  if (CR.stage === 2 || CR.stage === 3) gateItem(items);
  if (CR.stage === 3 && CR.mgOn) items.push(['warn', 'המקלע במסגד מרתק את הרחוב — לא להישאר בו']);
  if (CR.stage === 4) { items.push(['next', CR.br < 1 ? `גשר הגלילים: ${Math.round(CR.br * 100)}% · עוד ${Math.max(0, Math.ceil(CR_HOLD * (1 - CR.br)))} שניות` : CR.msgs.flee ? 'המצרים נסוגים' : 'הטנקים בדרך אליכם']); items.push(['', `תגבורת ברחוב: ${UNITS.enemies.filter((e) => e.alive && e.sq === 'h').length}`]); }
  if (CR.stage >= 2) { const n = FRIENDS.filter((f) => f.state === 'follow' || f.state === 'post').length; items.push([n < 2 ? 'warn' : '', `צנחנים איתכם: ${n}`]); }
}
function crHints() { if (CR.stage === 4 && CR.br > 0.85 && CR.br < 1) hint('cr-almost', 'הגשר כמעט מונח! הטנקים כבר מחכים על הגדה המזרחית.', 6); }
function crMini(g, X, poly, dot, k) {
  const W = (pts) => pts.map(([x, z]) => CW(x, z)), box = (x0, x1, z0, z1, col) => [W([[x0, z0], [x1, z0], [x1, z1], [x0, z1]]), col];
  const houses = CRM.built ? CRM.HOUSES.map((h) => box(h.x - h.w / 2, h.x + h.w / 2, h.z - h.d / 2, h.z + h.d / 2, 'rgba(196,176,140,.95)')) : [], M = CRM.MQ;
  const tip = CRM.built ? CRM.RB.tip : CR_CAN0;
  miniField(g, X, poly, dot, k, { bg: 'rgba(150,132,96,.92)', polys: [box(CR_CAN1, 900, -900, 900, 'rgba(196,174,128,.95)'), box(CR_CAN0, CR_CAN1, -900, 900, 'rgba(28,70,86,.95)'), box(CR_SWC - 7, CR_SWC + 7, -900, 900, 'rgba(40,80,90,.95)'),
      ...(CRM.built ? CRM.PLOTS.map((p) => box(p.x0, p.x1, p.z0, p.z1, 'rgba(196,172,104,.85)')) : []), ...houses, ...(M ? [box(M.X0, M.X1, M.Z0, M.Z1, 'rgba(240,236,224,1)')] : [])],
    lines: [...(CRM.built ? CRM.ROADS.map((R) => [W(R.p), 2.5, 'rgba(176,150,110,.95)']) : []), [W([[CR_CAN0 - 4, CR_PBZ], [CR_CAN1 + 4, CR_PBZ]]), 3.5, 'rgba(70,74,58,1)'], [W([[tip, CR_RBZ], [tip + (CRM.built ? CRM.RB.len : 100), CR_RBZ]]), 4, 'rgba(60,64,50,1)'], [W([[CR_SWC - 11, CR_SBZ], [CR_SWC + 11, CR_SBZ]]), 3, 'rgba(160,156,146,1)']] });
}
function crEnd(win) {
  const stats = [[STATS.kills, 'אויבים נפגעו'], [Math.round(CR.br * 100), 'גשר הגלילים %'], [CR.stage + 1, 'השלב שהגעתם אליו']];
  if (win) return ['גשר הגלילים מונח', 'מ־16 באוקטובר 1973 עברו הטנקים לגדה המערבית על התמסחים, ומאחר הצהריים של ה־17 — על גשר הדוברות, תחת הפגזה ותקיפות מהאוויר. גשר הגלילים — גלילי פלדה שנגררו בשרשרת — נשבר בדרך אל התעלה, תוקן, ונגרר אל שפת המים; סא״ל אהרון (ג׳וני) טנא, שהוביל אותו, נפל על גדת התעלה ב־18 באוקטובר. ב־19 באוקטובר הושק הגשר למים, מצפון לגשר הדוברות. באותם ימים נלחמו הצנחנים בכפרים ובשדות שלאורך התעלה כדי להרחיב את ראש הגשר. על שני הגשרים עברו אוגדות שלמות לגדה המערבית.', stats];
  return ['נפגעת', ['תנו למקלע לעבוד: צרורות ארוכים על המצרים שעל הסוללה, והחוליות המסומנות באדום קודם.', 'במארב — קודם הבזוקות. הן מסומנות באדום.', 'ברחוב: ממחסה למחסה, ועיניים על המעקות של הגגות. לא רצים במרכז הרחוב.', 'אל תחזרו לרחוב — המקלע במסגד רואה את כולו. רימון לפני כל פתח, ובחדר המקלע — המקלען עם הגב אליכם.', 'צרורות קצרים על מי שרץ בין המחסות; הבזוקות קודם. הטנקים בדרך.'][CR.stage] || '', stats];
}
function crSnapOK() { if (CR.stage === 0) return false; if (CR.stage === 1 && CR.msgs.out) return false; if (CR.stage === 4) return false; return true; }
function crSnapAfter() { crBridgePose(0); if (CR.stage !== 4) meter(null); CR.filmTod = null; }
CHAP.cross = { stages: CR_STAGES, st: () => CR.stage, cp: () => CHAP.cross.cpN || 0, upd: crUpd, obj: crObj, hints: crHints, items: crItems, mini: crMini, restore: fieldRestore, end: crEnd, tank: false, night: true, snapOK: crSnapOK, snapAfter: crSnapAfter,
  stableTag: () => 'למחסה',
  tod: () => { const m = CR.filmTod != null ? CR.filmTod : CR_TOD[CR.stage] + CHAP.cross.t / 6; return (((m % 1440) + 1440) % 1440) - START_MIN; },
  build: () => chapterBuild(CHAP.cross, crBuild), setup: crSetup, clock: CR_CLOCK[0], toast: ['18–19 באוקטובר 1973 · הגשרים', 'גשר הדוברות כבר על התעלה; גשר הגלילים מחכה על הגדה. צריך להחזיק את הצד שממול'], start: () => { CR.introSeen = false; fieldStart('cross'); } };
