
/* ================= chapter 2: the rescue of the Purkan garrison, the night of 8-9 October 1973 =================
   After the account of the brigade commander, Amnon Reshef. The 33 men of the strongpoint walked out at night, after moonset,
   south along the Talisman road. Toward dawn a small force - two tanks, four half-tracks and the doctor - went in to meet them,
   found nobody, came back under fire, asked for a green flare, saw it, went in again through Sagger and tank fire; the brigade
   commander charged a hill full of Egyptians, and the battalion commander's tank came back out of the dunes with all 33 on its deck.
   The company in the half-tracks paid for it: five dead, twenty-one wounded. It is a night battle, lit the way a film would light it:
   a bright cold moon, illumination rounds over the dunes, a searchlight on the tank, burning wrecks and tracer. */
const RS = { o: { x: 7000, z: 6000 }, stage: 0, t: 0, cp: 0, msgs: {}, boarded: 0, stopT: 0, introSeen: false, flare: null, flareLook: 0, flareN: 0, illumT: 6, walk: null };
const RW = toWorld(RS.o);
const RS_TRACK = [[640, 10], [500, 38], [340, -12], [190, 22], [40, -28], [-110, 4], [-260, 34], [-400, 6], [-515, -14]], RS_TRACK_S = smoothPath(RS_TRACK, 5);
const RS_BACK = [[-515, -14], [-505, -44], [-470, -46], [-430, -14], [-400, 6], [-260, 34], [-110, 4], [40, -28], [190, 22], [340, -12], [500, 38], [640, 10]];
const RS_MEET = [-575, -78], RS_WEST = [[-560, -66], [-860, -62]];
const RS_MEET2 = [-572, -42], RS_HILL = [-440, 112], RS_SOUTH = [[-520, -150], [-660, -175]];
const RS_WAIT = [-600, -110];   // where the garrison lies up behind the big dune, out of sight of the track
const RS_STAGES = [
  { title: 'כניסה ראשונה', sub: 'שלוש וארבעים לפנות בוקר. הטור יוצא מערבה בציר, בין דיונות שהירח צובע בכחול. פצצות תאורה נתלות מעל הדרך, ובשוחות משני צדיה כבר יושבים צוותי הסאגר עם האצבע על הידית. לוחמי פורקן אמורים לחכות בקצה.', goal: 'מערבה בציר עד נקודת המפגש. חסלו את צוותי הסאגר בשוחות לפני שהם יורים' },
  { title: 'הזיקוק הירוק', sub: 'נקודת המפגש הייתה ריקה, והטור חזר לקו תחת אש. בקשר, המח״ט מנסה להבין איפה הם, ובסוף מבקש דבר אחד: זיקוק ירוק. כולם יורים נותבים אדומים — ירוק יבלוט.', goal: 'סרקו את השמיים מערבה, מצאו את הזיקוק הירוק והחזיקו עליו את המבט' },
  { title: 'כניסה שנייה — אש תופת', sub: 'עכשיו יודעים איפה הם. הטור שועט שוב מערבה, המח״ט בטנק השמאלי. טילי סאגר שטים מעל הצריחים, הנגמ״שים חוטפים. ואז, מגבעה משמאל, קבוצה של כשלושים חיילים יורדת לקראת הטור. מדים לא רואים בחושך.', goal: 'מערבה בציר. קבוצת החיילים שיורדת מהגבעה — מי הם? תנו להם להתקרב, ואצבע על ההדק' },
  { title: 'המפלצת', sub: 'שאול הגיע לנקודת המפגש, ולוחמי פורקן רצים אליו מאחורי הדיונה. שלושים ושלושה איש מטפסים על טנק אחד. כל סאגר וכל פגז בגזרה מכוונים אליו עכשיו — ואתם היחידים שיכולים להרחיק אותם.', goal: 'חפו על הטנק של שאול עד שכל 33 הלוחמים עליו: הרגו מפעילי סאגר (סימון צהוב) ואת הטנקים המצריים' },
  { title: 'מזרחה', sub: 'מתוך האבק מגיח טנק שנראה כמו מפלצת: עשרות חיילים צמודים אליו מכל צד. הוא פונה מזרחה, ואתם צמודים אליו. כל טנק מצרי בגזרה כבר יודע עליו, ואף סאגר לא יכול לפגוע בו.', goal: 'ליווי צמוד מזרחה: אף סאגר לא מגיע לטנק עם הפצועים. הרגו את המפעילים לפני הפגיעה' },
];
const RS_TOD = [3 * 60 + 40, 4 * 60 + 20, 4 * 60 + 48, 5 * 60 + 22, 5 * 60 + 48];   // the clock at the start of each stage: a night that turns into first light
const RS_NAMES = ['מאירק׳ה', 'שמעון', 'יצחק', 'רוני', 'אליהו', 'דני', 'זאב', 'יעקב', 'חנן', 'מנחם', 'עזרא', 'פנחס'];
function rsH(x, z) {
  const lx = x - RS.o.x, lz = z - RS.o.z;
  const base = 9 + 4 * fbm(lx / 420, lz / 420, 3); let h = base;
  const w = fbm(lx / 160, lz / 260, 2), r = 1 - Math.abs(noise(lx / 95 + w * 1.4, lz / 210)); h += 6.5 * r * r * r;
  { const d = Math.hypot(lx - RS_MEET[0], lz - RS_MEET[1]); h += 8 * (1 - smooth(8, 85, d)); }
  { const d = Math.hypot(lx - RS_HILL[0], lz - RS_HILL[1]); h += 9 * (1 - smooth(12, 62, d)); }   // the hill the Egyptians stood on
  mix3(PAL.sandL, PAL.sandD, smooth(-0.35, 0.45, fbm(lx / 140, lz / 140, 3) + 0.5 * fbm(lx / 22, lz / 22, 2))); mixIn(PAL.sandR, 0.3 * smooth(0.1, 0.5, noise(lx / 700, lz / 700))); mixIn(PAL.fresh, 0.35 * r * r);
  { const belt = smooth(-330, -440, lx); if (belt > 0) { h -= belt * r * r * r * 4; const f = noise(Math.floor((lx + 2000) / 45) * 1.9, Math.floor((lz + 2000) / 60) * 1.3); mixIn(f > 0 ? [0.42, 0.44, 0.27] : [0.52, 0.43, 0.3], belt * 0.65); } }
  if (Math.abs(lz) < 90 && lx > -560 && lx < 680) { const d = distPolyline(lx, lz, RS_TRACK_S); if (d < 14) { const k = 1 - smooth(4, 13, d); h = lerp(h, base + 1.2, k); mixIn(PAL.sandD, 0.5 * (1 - smooth(1.2, 4.5, d))); if (d > 1.0 && d < 2.6) mixIn([0.45, 0.39, 0.31], 0.45); } }
  return h;
}
const RS_GROUPS = {
  A: { at: 340, pts: [[260, -72], [300, 65], [222, 82], [372, -87], [180, -57], [330, 94]], kinds: ['atgm', 'rpg', 'rifle', 'atgm', 'rifle', 'rifle'] },
  B: { at: 40, pts: [[62, -82], [-22, 77], [102, 95], [-64, -65], [12, -105], [70, 66]], kinds: ['atgm', 'rifle', 'rpg', 'atgm', 'rifle', 'rifle'] },
  C: { at: -260, pts: [[-200, 82], [-300, -72], [-246, -90], [-338, 67], [-150, 88], [-380, -61]], kinds: ['atgm', 'rpg', 'rifle', 'atgm', 'rifle', 'rpg'] },
  W: { pts: [[-700, -22], [-684, 51], [-722, -88], [-660, 88], [-690, -130]], kinds: ['atgm', 'rifle', 'rpg', 'atgm', 'atgm'], bush: true },
  N: { pts: [[-380, 38], [-420, -51], [-462, 68], [-352, -77], [-440, 22]], kinds: ['rifle', 'rpg', 'rifle', 'atgm', 'rpg'], bush: true },
  S: { pts: [[-540, -160], [-590, -190], [-630, -150], [-660, -200], [-560, -210]], kinds: ['atgm', 'rifle', 'atgm', 'rpg', 'atgm'], bush: true },
  D: { pts: [[122, 73], [160, -82], [420, 72], [462, -67], [-80, 88], [280, 88]], kinds: ['atgm', 'rifle', 'atgm', 'rpg', 'rifle', 'atgm'] },
};
function rsArc(x) { let best = 0, bd = 1e9, acc = 0; for (let i = 0; i < RS_TRACK.length - 1; i++) { const a = RS_TRACK[i], b = RS_TRACK[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]); for (let u = 0; u <= 1; u += 0.02) { const px = lerp(a[0], b[0], u); if (Math.abs(px - x) < bd) { bd = Math.abs(px - x); best = acc + L * u; } } acc += L; } return best; }
function rsBuild() {
  const C = CHAP.rescue; C.ground = makeGround({ x0: RS.o.x - 780, x1: RS.o.x + 760, z0: RS.o.z - 330, z1: RS.o.z + 330, step: 3.2, h: rsH }); GROUND = C.ground;
  const BAGS = [], sv = BATCH.bag; BATCH.bag = BAGS; const k0 = COVER.length; C.slots = []; C.nestBush = []; C.fires = [];
  { const r = rng(4242); for (const id of ['A', 'B', 'C', 'D']) { const g = RS_GROUPS[id], cx = g.at ?? g.pts[0][0]; if (g.extra) continue; g.extra = true; for (let k = 0; k < 5; k++) { const sd = k % 2 ? 1 : -1; g.pts.push([cx + (r() - 0.5) * 200, sd * (70 + r() * 120)]); g.kinds.push(['rifle', 'rpg', 'rifle', 'rifle', 'atgm'][k]); } } }
  for (const [id, g] of Object.entries(RS_GROUPS)) g.pts.forEach(([x0, z0], i) => { const lane = id === 'W' ? RS_WEST : id === 'S' ? RS_SOUTH : RS_TRACK, [x, z] = corr(lane, x0, z0, 23, id === 'W' || id === 'S' ? 4 : 12); const [wx, wz] = RW(x, z); let tx = x, tz = 0; { let bd = 1e9; for (const p of id === 'W' || id === 'S' ? [RS_MEET2, [-560, -66]] : densify(RS_TRACK, 10)) { const d = Math.hypot(p[0] - x, p[1] - z); if (d < bd) { bd = d; tx = p[0]; tz = p[1]; } } } const dx = tx - x, dz = tz - z, l = Math.hypot(dx, dz) || 1; const s = foxhole(wx, wz, dx / l, dz / l, C.slots); s.grp = id; s.kind = g.kinds[i]; if (g.bush) for (let k = 0; k < 6; k++) { const a = Math.atan2(dx, dz) + rand(-2.4, 2.4), d = rand(1.6, 3.4); C.nestBush.push([wx + Math.sin(a) * d, wz + Math.cos(a) * d, rand(0.9, 1.6), rand(0, 6), greenBush(Math.random)]); } });
  // the battlefield of the day before: burnt tanks and trucks along the track. At night three of them still burn, and light the road
  for (const [x, z, b, fire] of [[120, -44, 70, true], [-330, 58, 110, true], [-610, 30, 200, false], [505, -40, 20, false]]) { const [wx, wz] = RW(x, z); placeTank(wx, wz, b, TANK_BURNT); if (fire) rsFire(wx, wz, 2.2); }
  for (const [x, z, r, fire] of [[430, 62, 0.4, false], [-640, -50, 1.2, false], [-20, 70, 2.2, true]]) { const [wx, wz] = RW(x, z); vehicle(TRUCK_BURNT, wx, wz, r, 3.3, 1.2, 2.6); if (fire) rsFire(wx, wz, 1.6); }
  { const [wx, wz] = RW(-600, 80); vehicle(TRUCK_BURNT, wx, wz, 2.6, 3.3, 1.2, 2.6); }
  for (const [x, z, s] of [[-1300, -400, 40], [-1500, 300, 60], [-900, 900, 30], [200, -1200, 26]]) { const [wx, wz] = RW(x, z); smokeColumn(wx, wz, s, s > 35); }
  { const L = (x, z) => [x - RS.o.x, z - RS.o.z], okW = (x, z) => { const [lx, lz] = L(x, z); return distPolyline(lx, lz, RS_TRACK) > 9 && Math.hypot(lx - RS_MEET[0], lz - RS_MEET[1]) > 22 && Math.hypot(lx - RS_MEET2[0], lz - RS_MEET2[1]) > 16 && Math.hypot(lx - RS_HILL[0], lz - RS_HILL[1]) > 30 && !C.slots.some((s) => Math.hypot(s.x - x, s.z - z) < 4); };
    const X0 = RS.o.x - 770, X1 = RS.o.x + 750, Z0 = RS.o.z - 320, Z1 = RS.o.z + 320;
    const TW = RS_TRACK.map(([x, z]) => RW(x, z));
    concealPatches([...patchesNear(TW, 60, 12, 120, 990, okW, 4, 9), ...patchesIn(70, X0, RS.o.x - 330, Z0, Z1, 991, okW, 5, 12)], C, 992, 0.5);
    dressRoute(TW, okW, 900, 1.2, 0.15); dressArea(X0, X1, Z0, Z1, okW, 950, 1, 0.1); dressArea(X0, RS.o.x - 330, Z0, Z1, okW, 980, 0.8, 0.85);
    instScatter(ROCK_G, scatterIn(LITE ? 200 : 460, X0, X1, Z0, Z1, 301, okW, (x, z, r) => [x, z, 0.22 + r() ** 3 * 1.1, r() * 6, rockCol(r), 0.2, 0.55]).concat(scatterNear(TW, LITE ? 260 : 700, 9, 140, 311, okW, (x, z, r) => [x, z, 0.18 + r() ** 3 * 1.3, r() * 6, rockCol(r), 0.2, 0.55])));
    instScatter(BUSH_G, scatterNear(TW, LITE ? 220 : 560, 10, 150, 312, okW, (x, z, r) => [x, z, 0.5 + r() * 1.0, r() * 6, r() < 0.25 ? greenBush(r) : dryBush(r), 0, 0.8]));
    { const bl2 = scatterNear(TW, LITE ? 16 : 30, 18, 110, 313, okW, (x, z, r) => [x, z, 1.2 + r() * 1.8, r() * 6, rockCol(r), 0.3, 0.72]); instScatter(BOULDER_G, bl2); boulders(bl2); }
    const bl = scatterIn(LITE ? 30 : 44, X0, X1, Z0, Z1, 303, okW, (x, z, r) => [x, z, 1.3 + r() * 1.5, r() * 6, rockCol(r), 0.3, 0.72]); instScatter(BOULDER_G, bl); boulders(bl);
    instScatter(BUSH_G, scatterIn(LITE ? 220 : 520, X0, RS.o.x - 300, Z0, Z1, 304, okW, (x, z, r) => [x, z, 0.4 + r() * 0.7, r() * 6, dryBush(r), 0, 0.75]).concat(scatterIn(LITE ? 120 : 260, RS.o.x - 300, X1, Z0, Z1, 305, okW, (x, z, r) => [x, z, 0.35 + r() * 0.5, r() * 6, dryBush(r), 0, 0.7])));
    // the green belt toward the canal: fields and thick scrub where the tank hunters wait
    instScatter(BUSH_G, scatterIn(LITE ? 300 : 760, X0, RS.o.x - 340, Z0, Z1, 306, okW, (x, z, r) => [x, z, 0.7 + r() * 1.1, r() * 6, greenBush(r), 0, 0.9]).concat(C.nestBush));
    for (let i = 0; i < 70; i++) { const r = rng(400 + i); const [x, z] = [X0 + r() * 420, Z0 + r() * 640]; if (okW(x, z)) addCover(x + 1.2, z, -1, 0, 1.1); }
    palms(scatterIn(26, X0, RS.o.x - 520, Z0, Z1, 307, okW, (x, z, r) => [x, z, 0.8 + r() * 0.3, r() * 6]));
    powerLine(densify(RS_TRACK, 40).filter(([x]) => x > -420).map(([x, z]) => RW(x, z - 30)), 46);
    roadRibbon(RS_TRACK.map(([x, z]) => RW(x, z)), 6.5, 'dirt'); roadRibbon(RS_BACK.slice(0, 5).map(([x, z]) => RW(x, z)), 5.5, 'dirt'); roadWrecks(RS_TRACK.map(([x, z]) => RW(x, z)), 5, 8113, 7);
    roadPoles(RS_TRACK.filter(([x]) => x > -480).map(([x, z]) => RW(x, z)), 30, 5.5);
    { const [a, b] = RW(626, 16); fieldSign(a, b, 'ציר טליסמן', -Math.PI / 2, 1.2); const [c, d] = RW(612, -14); fieldSign(c, d, 'אזור אש · נוסעים בטור', -Math.PI / 2, 1.6); }
    for (const [x, z, w, d, h, ru] of [[660, -40, 6, 4, 2.6, 0], [672, 46, 5, 4, 2.4, 0], [262, 48, 5, 4, 2.4, 1], [-150, -44, 6, 5, 2.6, 1], [-36, 58, 4, 4, 2.2, 1]]) { const [wx, wz] = RW(x, z); smallHut(wx, wz, w, d, h, '#cbb68e', 0x7d6e58, !!ru); }
    wireFence([[690, -80], [600, -80], [600, -30]].map(([x, z]) => RW(x, z))); wireFence([[600, 40], [600, 80], [690, 80]].map(([x, z]) => RW(x, z)));
    for (const [x, z] of [[640, 28], [-470, 60]]) { const [wx, wz] = RW(x, z); fieldDrums(wx, wz, 5); }
  }
  BATCH.bag = sv; if (BAGS.length) scene.add(bagMesh(BAGS)); C.covers = COVER.slice(k0); for (const c of C.covers) c.y = groundAt(c.x, c.z);
  // the rescue force: Shaul's tank (the battalion commander), the artillery liaison officer's tank, and the four half-tracks of company Yod behind
  C.shaul = addVeh({ mode: 'rescue', side: 'f', kind: 'tank', geo: TANK_GEO, half: [3.4, 2.6, 1.9], guns: true, follow: { gap: 26 }, sturdy: true, hitP: 0.14, shellDmg: 22, name: 'הטנק של שאול' });
  C.ksha = addVeh({ mode: 'rescue', side: 'f', kind: 'tank', geo: TANK_GEO, half: [3.4, 2.6, 1.9], guns: true, follow: { gap: 50 }, sturdy: true, hitP: 0.14, shellDmg: 22, name: 'טנק הקש״א' });
  C.apc = [74, 90, 106, 122].map((gap, i) => addVeh({ mode: 'rescue', side: 'f', kind: 'jeep', geo: HT_GEO, half: [3.0, 2.2, 1.2], guns: i < 2, follow: { gap }, name: `נגמ״ש ${i + 1}` }));
  C.t55 = [[-1100, 60], [-1050, -180], [-950, -430], [-760, -60], [-740, 40]].map(() => addVeh({ mode: 'rescue', kind: 't55', geo: T55_HULL, turGeo: T55_TUR, turAt: [0.3, 1.42, 0], half: [3.2, 2.3, 1.75], armor: 0, hp: 100, shoots: true, vmax: 5 }));
  // the rest of the garrison: twenty-one more men, so that thirty-three climb onto one tank
  C.riders = Array.from({ length: 21 }, (_, i) => { const u = new Unit('f', 'rifle'); scene.remove(u.tag); u.alive = true; u.rig.root.visible = false; u.rig.root.userData.dyn = true; u.stance = 'stand'; u.rig.pose('idle', i); return { u, state: 'hide', seat: null }; });
  // our own tanks at the line, firing over the column at the far dunes all night (the brigade's covering fire)
  C.liner = [[560, -130, 285], [575, 150, 262]].map(([x, z, b]) => { const [wx, wz] = RW(x, z); const m = placeTank(wx, wz, b, TANK_GEO); return { m, x: wx, z: wz, t: rand(2, 6) }; });
}
/* a wreck that still burns: flames, and a warm light on the sand round it */
function rsFire(x, z, size) {
  const C = CHAP.rescue, g = groundAt(x, z), fires = [];
  for (let i = 0; i < 5; i++) { const glow = i === 4; const f = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow ? FXT.glow : FXT.fire, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, fog: false, color: glow ? new THREE.Color(0.9, 0.45, 0.15) : new THREE.Color(1.8, 1.1, 0.5), opacity: glow ? 0.55 : 1 })); f.position.set(x + rand(-1.2, 1.2), g + (glow ? 3 : 1.6 + i * 0.8), z + rand(-1.2, 1.2)); f.scale.setScalar(size * (glow ? 7 : 2.6 + i * 0.9)); scene.add(onLayer1(f)); fires.push(f); }
  const light = LITE ? null : new THREE.PointLight(0xff9a4a, 0, 110, 2); if (light) { light.position.set(x, g + 2.6, z); scene.add(light); }
  C.fires.push({ x, z, g, size, fires, light, ph: rand(0, 6) });
}
function rsSeats() {
  // thirty-three places on one tank: the rear deck, the glacis, the fenders, the turret rear, and two men hanging on at the turret sides
  const C = CHAP.rescue, seats = [], add = (x, y, z, hd = 0) => seats.push(() => ({ p: C.shaul.g.localToWorld(V3(x, y, z)), hd: (C.shaul.hdV ?? 0) + hd }));
  for (const x of [-3.0, -2.3, -1.6]) for (const z of [-1.3, -0.65, 0, 0.65, 1.3]) add(x, 1.62, z, Math.PI);
  for (const x of [2.2, 2.9]) for (const z of [-1.0, -0.33, 0.33, 1.0]) add(x, 1.45, z, 0);
  for (const x of [-1.0, 0, 1.0]) for (const z of [-1.75, 1.75]) add(x, 1.5, z, z < 0 ? Math.PI * 0.5 : -Math.PI * 0.5);
  for (const z of [-0.5, 0.5]) add(-1.0, 2.3, z, Math.PI);
  for (const z of [-1.4, 1.4]) add(0.5, 1.6, z, z < 0 ? Math.PI * 0.5 : -Math.PI * 0.5);
  return seats;
}
/* the whole garrison: the twelve named men (friends) and the twenty-one others. Where they stand, and what they do */
function rsGarrison(mode) {
  const C = CHAP.rescue, seats = rsSeats();
  const spot = (i) => RW(RS_WAIT[0] - 16 + (i % 6) * 5.2 + (Math.floor(i / 6) % 2) * 2.4, RS_WAIT[1] - 10 - Math.floor(i / 6) * 4.6);
  fieldFriends(RS_NAMES.map((name, i) => { const [x, z] = spot(i); return { name, x, z, fx: 1, fz: 0.3, state: mode === 'ride' ? 'ride' : mode === 'wait' ? 'post' : 'bunker', ride: seats[i] }; }));
  if (mode === 'hide') for (const f of FRIENDS) { f.unit.rig.root.visible = false; f.unit.tag.visible = false; }
  C.riders.forEach((r, i) => { const u = r.u, [x, z] = spot(12 + i); r.seat = seats[12 + i]; r.state = mode === 'ride' ? 'ride' : mode === 'wait' ? 'wait' : 'hide'; u.rig.root.visible = mode !== 'hide'; u.place(x, z); u.heading = Math.atan2(1, 0.3); u.stance = 'stand'; u.sync(); });
  RS.boarded = mode === 'ride' ? 33 : 0;
}
function rsBoardStart() {
  const C = CHAP.rescue; RS.boardT = 0;
  FRIENDS.slice(0, 12).forEach((f, i) => { if (f.state !== 'post') return; const seat = f.ride; DIRQ.push({ at: GAME.t + i * 0.7, fn: () => { if (f.state !== 'post') return; f.state = 'board'; f.goal = () => seat().p; f.onArrive = (ff) => { ff.state = 'ride'; ff.ride = seat; rsBoarded(); }; } }); });
  C.riders.forEach((r, i) => { if (r.state === 'wait') { r.state = 'run'; r.delay = 1.5 + i * 1.1; } });
}
function rsBoarded() { RS.boarded++; if (RS.boarded % 6 === 0 || RS.boarded === 33) feed(`על הטנק של שאול: ${RS.boarded}/33`, 'good'); if (RS.boarded === 20) radio('שאול', 'עשרים עליי. עוד! תמשיכו לעלות, אין מקום רק למי שלא מחזיק חזק!', 3); }
function rsRidersUpd(dt) {
  const C = CHAP.rescue;
  for (const r of C.riders) { const u = r.u; if (r.state === 'hide') continue; u.anim += dt;
    if (r.state === 'run') { if (r.delay > 0) { r.delay -= dt; u.rig.pose('idle', u.anim); u.sync(); continue; } const g = r.seat(); const d = steer(u, g.p.x, g.p.z, 5.0, dt); u.anim += dt * 9; u.rig.pose('run', u.anim); if (d < 1.0 || (RS.boardT > 70)) { r.state = 'ride'; rsBoarded(); } u.sync(); continue; }
    if (r.state === 'ride') { const g = r.seat(); u.pos.copy(g.p); u.heading = g.hd; u.stance = 'crouch'; u.rig.pose('crouch', u.anim, 0); u.sync(); continue; }
    u.rig.pose('idle', u.anim); u.sync();
  }
}
/* ---------- night: the light of the battle ---------- */
function rsNightUpd(dt) {
  const C = CHAP.rescue;
  // illumination rounds from our guns hang over the ground the column fights on
  if (RS.stage !== 1 && !CINE.on) { RS.illumT -= dt; if (RS.illumT <= 0) { RS.illumT = rand(22, 34); const [tx, tz] = TANK.g ? [TANK.g.position.x, TANK.g.position.z] : RW(0, 0); const ahead = RS.stage === 4 ? 1 : -1; spawnFlare(tx + ahead * rand(80, 170) + rand(-40, 40), tz + rand(-90, 90), rand(170, 210), 30, 26, 0.4); if (Math.random() < 0.5) radio('תצפית', pick(['תאורה מעל הציר!', 'פצצת תאורה באוויר, עיניים לדיונות!']), 2); } }
  // how much an illumination round overhead lights the ground round the player (the global brightening in setTimeOfDay)
  { let fl = 0; for (const f of FLARES) { const k = f.t < 1.5 ? f.t / 1.5 : f.t > f.life - 4 ? Math.max(0, (f.life - f.t) / 4) : 1, d = Math.hypot(f.x - P.pos.x, f.z - P.pos.z); fl = Math.max(fl, k * clamp(1 - d / 520, 0, 1)); } FLARE_LIGHT = fl; }
  // the burning wrecks flicker
  for (const f of C.fires) { const k = 0.75 + 0.25 * Math.sin(GAME.t * 11 + f.ph) * Math.sin(GAME.t * 4.3 + f.ph * 2); f.fires.forEach((s, i) => { const glow = i === 4; s.scale.setScalar(f.size * (glow ? 7 : 2.6 + i * 0.9) * (0.85 + 0.3 * Math.abs(Math.sin(GAME.t * 7 + i + f.ph)))); if (!glow) s.position.y = f.g + 1.6 + i * 0.8 + Math.sin(GAME.t * 5 + i) * 0.15; }); if (f.light) f.light.intensity = 40000 * k; if (Math.random() < dt * 2.5) { const s = FX.smoke.get(); s.life = 5; s.s.position.set(f.x + rand(-1, 1), f.g + 3, f.z + rand(-1, 1)); s.s.material.color.set(0x1a1816); s.upd = (q, u, dt2) => { q.s.position.y += 2.4 * dt2; q.s.scale.setScalar(2 + u * 8); q.s.material.opacity = 0.6 * (1 - u); }; } }
  // the three hull-down T-55s far to the west fire at our line all night: flashes and tracers over the dunes, nothing that can hit
  for (const v of C.t55) if (v.far && v.g.visible && v.alive && !CINE.on) { v.ct -= dt; if (v.ct <= 0) { v.ct = rand(7, 15); const from = v.g.position.clone().add(V3(0, 2.3, 0)), to = V3(from.x + rand(900, 1500), from.y + rand(4, 20), from.z + rand(-250, 250)); fxMuzzle(from, true); fxTracer(from, to, true); if (camera.position.distanceTo(from) < 700) sndBoom(from, 0.35); } }
  // the tanks at the line fire over our heads at the far dunes
  for (const t of C.liner) { t.t -= dt; if (t.t <= 0) { t.t = rand(4, 9); const from = V3(t.x, groundAt(t.x, t.z) + 2.6, t.z), to = V3(t.x - rand(500, 900), groundAt(t.x, t.z) + rand(2, 12), t.z + rand(-200, 200)); fxMuzzle(from, true); fxTracer(from, to, false); if (camera.position.distanceTo(from) < 260) sndBoom(from, 0.5); DIRQ.push({ at: GAME.t + 1.4, fn: () => fxExplosion(V3(to.x, groundAt(to.x, to.z), to.z), 0.9) }); } }
  // the green flare of the garrison
  const g = RS.flare; if (g) {
    g.t += dt; if (g.t < 2.6) g.y += (38 - g.t * 11) * dt; else g.y -= 2.6 * dt; g.x += g.vx * dt; g.z += g.vz * dt;
    const k = g.t < 0.6 ? g.t / 0.6 : g.t > g.life - 2.5 ? Math.max(0, (g.life - g.t) / 2.5) : 1, fl = 0.85 + 0.15 * Math.sin(g.t * 19);
    g.s.position.set(g.x, g.y, g.z); g.s.material.opacity = k; g.h.position.set(g.x, g.y, g.z); g.h.material.opacity = 0.45 * k; g.light.position.set(g.x, g.y, g.z); g.light.intensity = 2.6e5 * k * fl;
    if (Math.random() < dt * 14) { const s = FX.smoke.get(); s.life = 2.2; s.s.position.set(g.x, g.y - 0.5, g.z); s.s.material.color.set(0x8fd8a0); s.upd = (q, u) => { q.s.scale.setScalar(1.2 + u * 5); q.s.material.opacity = 0.35 * (1 - u); }; }
    if (g.t > g.life) { scene.remove(g.s); scene.remove(g.h); scene.remove(g.light); RS.flare = null; }
  }
}
function rsGreenFlare() {
  const [x, z] = RW(RS_MEET2[0] + rand(-6, 6), RS_MEET2[1] + rand(-6, 6)), y = groundAt(x, z) + 1;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: FXT.flare, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, fog: false, toneMapped: false, color: new THREE.Color(0.08, 1.0, 0.2) })); s.scale.setScalar(80); s.position.set(x, y, z); scene.add(s);
  const h = new THREE.Sprite(new THREE.SpriteMaterial({ map: FXT.flare, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, fog: false, toneMapped: false, color: new THREE.Color(0.04, 0.5, 0.1), opacity: 0.45 })); h.scale.setScalar(230); h.position.set(x, y, z); scene.add(h);
  const light = new THREE.PointLight(0x5cff7a, 0, 0, 2); light.position.set(x, y, z); scene.add(light);
  RS.flare = { s, h, light, x, y, z, t: 0, life: 20, vx: rand(-1, 1), vz: rand(-1, 1) }; RS.flareN++; RS.flareLook = 0;
  sndShot('fal-npc', V3(x, y, z)); feed('זיקוק ירוק באוויר! חפשו אותו מערבה', 'good');
}
/* ---------- set-up for a stage (also from a checkpoint) ---------- */
function rsSetup(stage) {
  const C = CHAP.rescue; fieldSetupCommon(C, stage); RS.stopT = 0; RS.flareLook = 0; RS.flareN = 0; RS.illumT = 6; RS.boardT = 0; RS.walk = null; RS.hillOn = false; RS.ided = false;
  if (RS.flare) { scene.remove(RS.flare.s); scene.remove(RS.flare.h); scene.remove(RS.flare.light); RS.flare = null; }
  for (const v of VEH) if (v.mode === 'rescue') { vehRevive(v); v.shown = true; v.g.visible = true; v.ended = false; v.path = null; v.stop = undefined; v.onEnd = null; v.tgtV = null; v.hpSeen = 100; }
  const sA = rsArc(RS_GROUPS.A.at), sB = rsArc(RS_GROUPS.B.at), sC = rsArc(RS_GROUPS.C.at), sE = pathLen(RS_TRACK) - 0.5, sH = rsArc(RS_HILL[0] + 10); RS.stops = [sA, sB, sC, sE]; RS.sH = sH;
  // the T-55s: three hull-down far to the west; two more come forward to the dunes for the second entry
  C.t55.forEach((v, i) => { const [x, z] = [[-1080, -50], [-1150, -84], [-990, -70], [-760, -60], [-740, 40]][i]; const [wx, wz] = RW(x, z); v.hdV = Math.PI / 2; vehPose(v, wx, wz, Math.PI / 2); v.shoots = i >= 3 && stage >= 2; v.shown = i < 3 || stage >= 2; v.g.visible = v.shown; v.far = i < 3; v.ct = rand(3, 12); });
  if (!TANK.g) tankModel(); if (TANK.spot) TANK.spot.intensity = 0;   // no searchlight: the moon, the illumination rounds and the fires light the night
  if (stage !== 2) RS.hillCp = false;
  if (stage === 0 || stage === 2) {
    const atHill = stage === 2 && RS.hillCp, s0 = stage === 0 ? 0 : atHill ? sH - 2 : sA + 30, stops = stage === 0 ? [sA, sB, sC, sE] : atHill ? [sH] : [sC, sH];
    tankStart(RS_TRACK, RW, s0, stops); TANK.vmax = stage === 0 ? 5.2 : 6.2;
    C.shaul.follow = { gap: 26 }; C.ksha.follow = { gap: 50 }; C.apc.forEach((v, i) => { v.follow = { gap: [74, 90, 106, 122][i] }; });
    rsGarrison('hide');
  } else if (stage === 1) {
    tankStart(RS_TRACK, RW, 0, [0]); TANK.holdAt = 0; TANK.speed = 0; TANK.vmax = 5.2;
    C.shaul.follow = { gap: 26 }; C.ksha.follow = { gap: 50 }; C.apc.forEach((v, i) => { v.follow = { gap: [74, 90, 106, 122][i] }; });
    rsGarrison('hide');
  } else if (stage === 3) {
    rsHillPark(); for (const i of [0, 1, 3]) { vehDestroy(C.apc[i], true); C.apc[i].follow = null; const [x, z] = RW(RS_HILL[0] + 70 + i * 30, RS_HILL[1] - 60 + i * 15); vehPose(C.apc[i], x, z, -Math.PI / 2); }
    C.apc[2].follow = null; { const [x, z] = RW(RS_HILL[0] + 40, RS_HILL[1] + 25); vehPose(C.apc[2], x, z, -Math.PI / 2); }
    C.ksha.follow = null; { const [x, z] = RW(RS_HILL[0] + 22, RS_HILL[1] - 18); vehPose(C.ksha, x, z, -Math.PI / 2); }
    C.shaul.follow = null; { const [x, z] = RW(RS_MEET2[0], RS_MEET2[1]); C.shaul.hdV = -Math.PI * 0.6; vehPose(C.shaul, x, z, -Math.PI * 0.6); }
    rsGarrison('wait');
  } else {
    // the way home: Shaul leads on his own path with the garrison on his deck, the player's tank joins behind him, the liaison tank and the last half-track follow
    const home = [[RS_MEET2[0], RS_MEET2[1]], ...RS_BACK].map(([x, z]) => RW(x, z)), mine = [[RS_HILL[0], RS_HILL[1]], [-480, 40], ...RS_BACK].map(([x, z]) => RW(x, z));
    C.shaul.follow = null; C.shaul.path = home; C.shaul.s = pathLen(home.slice(0, 2)) + 60; C.shaul.vmax = 5.8; C.shaul.hdV = null; C.shaul.onEnd = () => { RS.msgs.home = true; };
    tankStart([[RS_HILL[0], RS_HILL[1]], [-480, 40], ...RS_BACK], RW, 95, [pathLen(mine) - 0.5]); TANK.vmax = 6.3;
    C.ksha.follow = { gap: 22 }; C.apc[2].follow = { gap: 44 }; for (const i of [0, 1, 3]) { vehDestroy(C.apc[i], true); C.apc[i].follow = null; const [x, z] = RW(RS_HILL[0] + 70 + i * 30, RS_HILL[1] - 60 + i * 15); vehPose(C.apc[i], x, z, -Math.PI / 2); }
    rsGarrison('ride');
  }
  rsStage(stage);
}
/* the player's tank halts on the hill, facing the meeting point, and stays there while the garrison boards */
function rsHillPark() {
  const [hx, hz] = RW(RS_HILL[0], RS_HILL[1]), [mx, mz] = RW(RS_MEET2[0], RS_MEET2[1]); const hd = Math.atan2(mx - hx, mz - hz);
  const path = [[hx - Math.sin(hd) * 2, hz - Math.cos(hd) * 2], [hx + Math.sin(hd) * 40, hz + Math.cos(hd) * 40]];
  tankStart(path, (x, z) => [x, z], 0, [0]); TANK.holdAt = 0; TANK.speed = 0; TANK.free = false; TANK.hdV = hd;
}
function rsStage(i) {
  const C = CHAP.rescue; fieldStage(C, i); RS.stage = i; RS.msgs = {}; RS.stopT = 0;
  if (i === 0) { if (!RS.introSeen) { RS.introSeen = true; rsIntroFilm(); } else radio('מח״ט', 'כוח החילוץ, נעים מערבה בציר. אור ראשון עוד שעתיים — נזהה אותם לפי התאורה.', 4); }
  if (i === 1) {
    DIRQ.push({ at: GAME.t + 2, fn: () => radio('מח״ט', 'מאירק׳ה, כאן המח״ט. הכוח היה בנקודה ולא מצא אתכם. איפה אתם? תן לי משהו לזהות.', 5) });
    DIRQ.push({ at: GAME.t + 7.5, fn: () => radio('מפקד פורקן', 'אנחנו בין הדיונות, דרומית לציר. אני לא יכול להדליק אור — הם קרובים. יורה זיקוק ירוק. עכשיו!', 5) });
    DIRQ.push({ at: GAME.t + 12, fn: () => { rsGreenFlare(); hint('rs-flare', 'הזיקוק הירוק עולה מערבה. סובבו את המבט אליו והחזיקו אותו בכוונת כמה שניות — ככה מזהים את המיקום. אם פספסתם, הוא יירה עוד אחד.', 9); } });
  }
  if (i === 2 && RS.hillCp) { RS.msgs.h1 = RS.msgs.h2 = RS.msgs.h3 = RS.msgs.c2 = true; for (const k of [0, 1, 3]) vehDestroy(C.apc[k], true); radio('מח״ט', 'שאול, עצור. קבוצת חיילים יורדת מהגבעה אליכם — אל תירו עד שמזהים.', 4); }
  else if (i === 2) { radio('מח״ט', 'אני נכנס איתכם, הטנק שלי משמאל. חטיבה 421 מגבירה אש. כולם — גז, לא עוצרים!', 4.5); rsGroupSpawn('C'); rsGroupSpawn('N'); rsSquad('C', 10); }
  if (i === 3) { radio('שאול', 'אני בנקודת המפגש! הם רצים אליי מאחורי הדיונה. תחפה עליי מהגבעה — הסאגרים יחפשו אותי עכשיו.', 5); const nW = rsGroupSpawn('W', 10, 9); rsGroupSpawn('S', 10 + nW * 9 - 4, 9); for (const v of C.t55.slice(3)) { v.shown = true; v.g.visible = true; v.shoots = true; } rsBoardStart(); hint('rs-cover', 'הטנק של שאול עומד במקום עד ש־33 איש עולים עליו. סימון צהוב מהבהב = מפעיל סאגר מכוון אליו: הרגו אותו לפני שהטיל מגיע. טנק מצרי — פגז (G).', 10); }
  if (i === 4) { radio('שאול', 'כולם עליי! שלושים ושלושה. אני זז מזרחה — תישאר צמוד אליי.', 4); rsGroupSpawn('D', 8, 7); rsSquad('D', 12); DIRQ.push({ at: GAME.t + 18, spawn: true, fn: () => rsSquad('D', 10) }); }
}
function rsSquad(id, n) { const C = CHAP.rescue, sl = C.slots.filter((q) => q.grp === id); for (let k = 0; k < n && sl.length; k++) { const s = sl[k % sl.length], [lx, lz] = corr(RS_TRACK, s.x - RS.o.x + rand(-25, 25), s.z - RS.o.z + rand(-6, 6), 24, 10), [mx, mz] = corr(RS_TRACK, lx + rand(-10, 10), lz * 0.5, 14, 4), [x, z] = RW(lx, lz), [tx, tz] = RW(mx, mz); const e = fSpawnStreet(x, z, [[tx, tz]], k % 4 === 3 ? 'rpg' : 'rifle'); if (e) e.sq = id; } }
function rsGroupSpawn(id, first = 9, gap = 8) { const C = CHAP.rescue; let k = 0; for (const s of C.slots) if (s.grp === id && !s.used) { const e = fSlotSpawn(s.kind, (q) => q === s, id); if (e && e.atgm) { e.rpgCd = first + (k++) * gap; } } return k; }
/* the thirty Egyptians on the hill: they stand in the open, unmarked, until the tank is a hundred metres away */
function rsHillGroup() {
  // thirty men come down off the hill toward the halted column in a loose file, unmarked, as if they were ours: each one walks to a place
  // of his own twenty-odd metres in front of the tank. Nobody fires until the first of them is twenty metres away
  const r = rng(777); RS.hill = []; const t = TANK.g.position, hd = TANK.hdV ?? 0, fx = Math.sin(hd), fz = Math.cos(hd), [hx, hz] = RW(RS_HILL[0], RS_HILL[1]);
  const sx = Math.sign((hx - t.x) * fz - (hz - t.z) * fx) || 1;   // which side the hill is on
  for (let k = 0; k < 30; k++) {
    const ahead = 20 + (k % 5) * 3.5 + r() * 2, side = (k % 2 ? 1 : -1) * (2 + Math.floor(k / 2) % 6 * 2.2 + r()), gx = t.x + fx * ahead - fz * side, gz = t.z + fz * ahead + fx * side;   // where he stops
    const back = 62 + k * 1.4 + r() * 5, lat = (r() - 0.5) * 10, x = gx - fz * sx * back + fx * lat, z = gz + fx * sx * back + fz * lat;   // where he starts: in a file coming down from the hill side
    const e = spawnEnemy(x, z, k % 5 === 0 ? 'rpg' : k % 5 === 2 ? 'smg' : 'rifle', null, null); if (!e) continue;
    e.state = 'film'; e.sq = 'H'; e.noTag = true; e.stance = 'stand'; e.hg = [gx, gz]; e.hw = 2.6 + r() * 0.7; e.heading = Math.atan2(gx - x, gz - z); e.rig.pose('walk', k); e.sync(); RS.hill.push(e);
  }
  RS.hillT = 0;
}
function rsHillApproach(dt) {
  RS.hillT += dt; let near = 1e9; const t = TANK.g.position;
  for (const e of RS.hill) { if (!e.alive || e.state !== 'film') continue; const d = steer(e, e.hg[0], e.hg[1], e.hw, dt); e.anim += dt * 7; e.rig.pose(d > 0.6 ? 'walk' : 'idle', e.anim); if (d <= 0.6) e.face(t.x, t.z); e.sync(); near = Math.min(near, Math.hypot(e.pos.x - t.x, e.pos.z - t.z)); }
  if (!RS.msgs.h10 && RS.hillT > 9) { RS.msgs.h10 = true; radio('תותחן', 'הם הולכים ישר אלינו... שלושים איש לפחות. אני לא מזהה מדים.', 3.5); }
  if (!RS.msgs.h20 && RS.hillT > 17) { RS.msgs.h20 = true; radio('מח״ט', 'שאול, אל תירו! אם זה פורקן ואנחנו פותחים עליהם — אין לנו חיים.', 3.5); }
  // the moment: twenty metres, a dead man among them, or the player's patience - and they open up
  if (near < 24 || RS.hill.some((e) => !e.alive) || RS.hillT > 40) rsHillWake();
}
function rsHillWake() {
  RS.ided = true; const t = TANK.g.position; let k = 0;
  for (const e of RS.hill) if (e.alive) { e.noTag = false; e.state = 'sz'; e.sz = 'street'; e.path = []; e.pi = 0; e.cov = null; e.patience = 0; e.cyc = 1; e.peek = false; e.meleeCd = 0.5; e.wild = true; e.rpgMiss = true; e.rpgCd = 0.4 + (k++ % 6) * 1.1; e.fireCd = rand(0.1, 0.9); e.face(t.x, t.z); }
  radio('מח״ט', 'מצרים!! אלה מצרים! אש! אש!', 3); feed('קבוצת החיילים מהגבעה — מצרים! הם פותחים באש!', 'bad'); FX.shake = Math.max(FX.shake, 0.5);
  hint('rs-hill2', `<b>מטווח אפס!</b> מקלע 0.5 (${TOUCH ? 'אש' : 'לחיצה ממושכת'}) ופגז (${TOUCH ? 'רימון' : 'G'}) לתוך הקבוצה. אם האש כבדה מדי — לתוך הצריח (${TOUCH ? 'כפתור צריח' : 'C'}) וממשיכים לירות משם.`, 8);
}
function rsUpd(dt) {
  const C = CHAP.rescue; C.t += dt; RS.t += dt; if (Math.floor(RS.t * 2) !== Math.floor((RS.t - dt) * 2)) szEnemyCleanup();
  for (let i = DIRQ.length - 1; i >= 0; i--) if (DIRQ[i] && GAME.t >= DIRQ[i].at) { const q = DIRQ.splice(i, 1)[0]; q.fn(); }
  rsNightUpd(dt); rsRidersUpd(dt); if (RS.walk) rsWalkUpd(dt);
  // the T-55s pick on Shaul's tank once it carries the garrison, the player the rest of the time
  C.t55.forEach((v, i) => { v.tgtV = i >= 3 && RS.stage >= 3 && C.shaul.alive ? (Math.random() < 0.6 ? () => C.shaul : null) : null; });
  if (C.shaul.alive && C.shaul.hp < C.shaul.hpSeen - 1) { C.shaul.hpSeen = C.shaul.hp; radio('שאול', pick(['חטפתי! עוד אני נע.', 'פגיעה בטנק, יש פצועים על הסיפון! תוריד אותם!']), 2.6); }
  if (RS.stage >= 3 && !C.shaul.alive) { endGame(false, 'shaul'); return; }
  if (RS.stage === 0) {
    if (CINE.on) return;
    for (const [id, s0] of [['A', RS.stops[0]], ['B', RS.stops[1]], ['C', RS.stops[2]]]) if (TANK.s > s0 - 95 && !RS.msgs[id]) { RS.msgs[id] = true; rsGroupSpawn(id); if (id === 'C') rsGroupSpawn('N'); rsSquad(id, 12); DIRQ.push({ at: GAME.t + 11, spawn: true, fn: () => rsSquad(id, 8) }); radio('תותחן', pick(['שוחות על הדיונות מימין!', 'צוות סאגר על הרכס, בתאורה!', 'תנועה בשוחות, משני צדי הציר!']), 2.6); }
    const st = TANK.stops[TANK.stopI]; if (st !== undefined && TANK.holdAt === st) {
      if (TANK.stopI >= 3) { if (!RS.msgs.empty) { RS.msgs.empty = true; radio('שאול', 'אנחנו בנקודה. אין פה אף אחד — סרקנו, כלום. אש כבדה מהצפון.', 4); DIRQ.push({ at: GAME.t + 5, fn: () => radio('מח״ט', 'חזרו לקו, עכשיו. אני מברר איתו בקשר איפה הם.', 3.5) }); DIRQ.push({ at: GAME.t + 9, fn: () => rsCut(() => rsSetup(1)) }); } return; }
      RS.stopT += dt; const id = 'ABC'[TANK.stopI]; const left = fieldLeft((e) => e.sq === id); if (holdDone(left, RS.stopT)) { fieldDespawn((e) => e.sq === id); TANK.stopI++; TANK.holdAt = null; RS.stopT = 0; radio('נהג', left ? 'אין זמן, ממשיכים!' : 'נקי. ממשיכים מערבה.', 2); }
    }
  } else if (RS.stage === 1) {
    const g = RS.flare;
    if (g && g.t > 1.2) { const f = camForward(V3()), d = V3(g.x - camera.position.x, g.y - camera.position.y, g.z - camera.position.z).normalize(); const ang = f.angleTo(d); RS.flareLook = ang < 0.12 ? RS.flareLook + dt : Math.max(0, RS.flareLook - dt * 0.5);
      if (RS.flareLook > 1.5 && !RS.msgs.id) { RS.msgs.id = true; feed('הזיקוק זוהה: 400 מטר דרומית לקצה הציר, מאחורי הדיונה הגדולה', 'good'); radio('שאול', 'יש לי אותו! ירוק, דרומית לציר, מאחורי הדיונה הגדולה. מוכן לנוע אליו.', 4); DIRQ.push({ at: GAME.t + 4.5, fn: () => radio('מח״ט', 'אני מצטרף אליכם עם הטנק שלי. כולם — נכנסים!', 3) }); DIRQ.push({ at: GAME.t + 8, fn: () => rsCut(() => rsSetup(2)) }); } }
    if (!g && !RS.msgs.id && RS.flareN > 0 && !RS.msgs.again) { RS.msgs.again = true; DIRQ.push({ at: GAME.t + 6, fn: () => { RS.msgs.again = false; radio('מפקד פורקן', 'ראיתם? יורה עוד אחד!', 2.5); rsGreenFlare(); } }); }
  } else if (RS.stage === 2) {
    // the half-tracks take the hits of the story, one after another, as the column runs the gauntlet
    for (const [k, s0, i] of [['h1', RS.stops[1] + 40, 3], ['h2', RS.stops[2] - 40, 1], ['h3', RS.sH - 60, 0]]) if (!RS.msgs[k] && TANK.s > s0) { RS.msgs[k] = true; const v = C.apc[i]; if (v.alive) { vehDestroy(v); radio(pick(['קש״א', 'שאול']), `${v.name} נפגע! הוא בוער!`, 3); } }
    if (!RS.msgs.c2 && TANK.s > RS.stops[2] - 100) { RS.msgs.c2 = true; rsSquad('C', 8); }
    const st = TANK.stops[TANK.stopI];
    if (!RS.hillOn && st === RS.sH && TANK.holdAt === st) {
      RS.hillOn = true; RS.hillCp = true; CP.stats = { ...STATS }; snapRequest('hill'); fieldDespawn((e) => e.sq === 'C' || e.sq === 'N'); rsHillGroup(); feed('נקודת שמירה: הגבעה', 'good');
      radio('מח״ט', 'שאול, עצור! קבוצת חיילים יורדת מהגבעה משמאל, לכיוון הטור. אני לא רואה מדים — אל תירו! זה יכול להיות פורקן.', 5);
      hint('rs-hill', 'שלושים איש יורדים מהגבעה אליכם, לא מסומנים. פורקן או מצרים? תנו להם להתקרב — ותהיו מוכנים.', 8);
    } else if (TANK.holdAt === st && st !== RS.sH && TANK.stopI < TANK.stops.length) { RS.stopT += dt; const left = fieldLeft((e) => e.sq === 'C' || e.sq === 'N'); if (holdDone(left, RS.stopT)) { TANK.stopI++; TANK.holdAt = null; RS.stopT = 0; radio('נהג', 'ממשיכים!', 1.6); } }
    if (RS.hillOn) {
      const [hx, hz] = RW(RS_HILL[0], RS_HILL[1]); const d = Math.hypot(TANK.g.position.x - hx, TANK.g.position.z - hz);
      if (!RS.ided) rsHillApproach(dt);
      if (RS.ided) { const left = RS.hill.filter((e) => e.alive).length; if (left <= 12 && !RS.msgs.turn) { RS.msgs.turn = true; radio('מח״ט', 'עוד! אל תתנו לאף אחד להגיע לטנק!', 2.5); } if (left === 0 && !RS.msgs.hillDone) { RS.msgs.hillDone = true; radio('שאול', 'מח״ט, אני מחליף תדר — הגעתי לנקודה! פורקן איתי, מתחילים להעלות אותם!', 4); DIRQ.push({ at: GAME.t + 4, fn: () => rsCut(() => { rsHillPark(); rsSetup3Soft(); }) }); } }
    }
  } else if (RS.stage === 3) {
    RS.boardT += dt;
    if (RS.boarded >= 33 && !RS.msgs.full) { RS.msgs.full = true; DIRQ.push({ at: GAME.t + 2.5, fn: () => rsCut(() => rsSetup(4)) }); }
    if (RS.boardT > 30 && !RS.msgs.w2) { RS.msgs.w2 = true; for (let k = 0; k < 10; k++) { const sd = k % 2 ? 1 : -1, [x, z] = RW(...corr(RS_WEST, -760 + rand(-30, 30), -64 + sd * rand(2, 22), 23)), [tx, tz] = RW(...corr(RS_WEST, -640 + rand(-20, 20), -64 + sd * rand(2, 20), 22)); fSpawnStreet(x, z, [[tx, tz]], k === 2 ? 'rpg' : 'rifle'); } radio('תצפית', 'חי״ר מצרי מתקרב לטנק של שאול ממערב!', 2.6); }
  } else if (RS.stage === 4) {
    if (!RS.msgs.join && Math.hypot(TANK.g.position.x - C.shaul.g.position.x, TANK.g.position.z - C.shaul.g.position.z) < 70) { RS.msgs.join = true; radio('מח״ט', 'אני מאחוריך, שאול. סע, אני מחפה.', 2.5); }
    for (const [k, s0, id, n] of [['w1', 520, 'B', 8], ['w2', 860, 'A', 8]]) if (!RS.msgs[k] && C.shaul.s > s0) { RS.msgs[k] = true; rsGroupSpawn(id, 7, 7); rsSquad(id, n); radio('תצפית', pick(['עוד שוחות לפנים, משני צדי הציר!', 'צוותי סאגר על הדיונות — הם מחכים לטנק של שאול!']), 2.6); }
    if (RS.msgs.home || C.shaul.s > pathLen(C.shaul.path) - 230 || TANK.s > pathLen(TANK.path) - 2) { if (!RS.msgs.endFilm) { RS.msgs.endFilm = true; rsEndFilm(); } }
  }
}
/* stage 3 without a checkpoint reset: the tank is already parked on the hill, the rest is placed */
function rsSetup3Soft() { const C = CHAP.rescue; C.apc[2].follow = null; C.ksha.follow = null; C.shaul.follow = null; { const [x, z] = RW(RS_MEET2[0], RS_MEET2[1]); C.shaul.hdV = -Math.PI * 0.6; vehPose(C.shaul, x, z, -Math.PI * 0.6); C.shaul.speed = 0; } rsGarrison('wait'); rsStage(3); }
/* a cut: the screen goes dark for half a second while the column is put where the story goes on */
function rsCut(fn) { const f = $('#fade'); f.style.transition = 'opacity .5s'; f.style.opacity = '1'; DIRQ.push({ at: GAME.t + 0.55, fn: () => { fn(); f.style.transition = 'opacity 1.2s'; f.style.opacity = '0'; } }); }
/* the garrison walking out at night, for the opening film */
function rsWalkUpd(dt) { const w = RS.walk; for (const q of w.units) { q.u.pos.x += w.dx * 1.35 * dt; q.u.pos.z += w.dz * 1.35 * dt; q.u.pos.y = groundAt(q.u.pos.x, q.u.pos.z); q.u.anim += dt * 6; q.u.rig.pose('walk', q.u.anim); q.u.sync(); } }
/* ---------- films ---------- */
function rsIntroFilm() {
  const C = CHAP.rescue;
  // the file of thirty-three men, far out in the dunes south of the track, walking east
  const [sx, sz] = RW(-520, 150), dir = [1, -0.15], L = Math.hypot(dir[0], dir[1]), dx = dir[0] / L, dz = dir[1] / L;
  const units = []; FRIENDS.slice(0, 12).forEach((f, i) => units.push({ u: f.unit, f })); C.riders.forEach((r) => units.push({ u: r.u, r }));
  units.forEach((q, i) => { const u = q.u, back = i * 2.6, side = (i % 2 ? 1 : -1) * 0.6; u.pos.set(sx - dx * back - dz * side, 0, sz - dz * back + dx * side); u.pos.y = groundAt(u.pos.x, u.pos.z); u.heading = Math.atan2(dx, dz); u.alive = true; u.rig.root.visible = true; u.stance = 'stand'; u.rig.pose('walk', i); u.sync(); if (q.f) { q.f.state = 'bunker'; q.f.unit.tag.visible = false; } });
  RS.walk = { units, dx, dz };
  const lead = () => units[0].u.pos.clone(), mid = () => units[8].u.pos.clone();
  const line = V3(...(() => { const [x, z] = RW(600, 10); return [x, groundAt(x, z), z]; })());
  playCine({ vid: 'rs_intro',
    title: 'מזרחית לתעלה · הלילה שבין 8 ל־9 באוקטובר',
    shots: [
      { d: 5.2, cam: (u) => ({ p: mid().add(V3(-6 + u * 2, 1.6, 7)), l: lead().add(V3(0, 1.3, 0)), fov: 46 }) },
      { d: 4.6, cam: (u) => ({ p: lead().add(V3(9, 1.2, -2 + u)), l: mid().add(V3(0, 1.2, 0)), fov: 42 }) },
      { d: 5.0, cam: camLerp(() => line.clone().add(V3(40, 3.5, 30)), () => line.clone().add(V3(22, 2.6, 18)), () => line.clone().add(V3(-20, 2, 0)), () => line.clone().add(V3(-30, 2, 0)), 48) },
    ],
    ev: [[9.6, () => { RS.walk = null; for (const q of units) { q.u.rig.root.visible = false; if (q.r) q.r.state = 'hide'; } }]],
    caps: [[0.3, '<b>8 באוקטובר, בערב.</b> מאירק׳ה, מפקד פורקן, בקשר: "יש בכוונתי להיחלץ רגלית." דיוויזיה מצרית שלמה בינו לבין כוחותינו.', 4.6], [5.3, 'בשתיים וחצי, אחרי שקיעת הירח, יוצאים 33 לוחמים דרומה, לאורך ציר טליסמן. עשרה קילומטרים ברגל, בין העמדות המצריות.', 4.4], [10.0, '<b>לפנות בוקר.</b> חטיבה 14 מקבלת את החילוץ. הכוח: שני טנקים, ארבעה נגמ״שים ורופא. המח״ט עולה לתצפית ומשגיח מקרוב.', 4.8]],
    end: () => { radio('מח״ט', 'כוח החילוץ, היכנסו. לוחמי פורקן מחכים בנקודת המפגש בקצה הציר. כל שוחה בדרך — אש מיד.', 5); },
  });
}
function rsEndFilm() {
  const C = CHAP.rescue; for (const e of UNITS.enemies) if (e.alive) killEnemy(e, false); for (let i = DIRQ.length - 1; i >= 0; i--) if (DIRQ[i].spawn) DIRQ.splice(i, 1);
  const sh = () => C.shaul.g.position.clone(), [lx, lz] = RW(620, 10), line = V3(lx, groundAt(lx, lz), lz);
  // the lone, scorched half-track comes along the road behind everyone
  const apc = C.apc[2]; apc.follow = null; { const p = [[380, -12], [500, 38], [640, 10]].map(([x, z]) => RW(x, z)); apc.path = p; apc.s = 0; apc.vmax = 6; apc.stop = undefined; apc.ended = false; if (!apc.alive) vehRevive(apc, 30); const [ax, az, ahd] = pathAt(p, 0); vehPose(apc, ax, az, ahd); }
  playCine({ vid: 'rs_end',
    title: 'הקו שלנו · 06:10',
    shots: [
      { d: 5.0, cam: (u) => ({ p: sh().add(V3(14 - u * 3, 2.4, 8)), l: sh().add(V3(0, 1.9, 0)), fov: 44 }) },
      { d: 4.6, cam: camLerp(() => line.clone().add(V3(-30, 2.2, 14)), () => line.clone().add(V3(-24, 2.0, 10)), () => apc.g.position.clone().add(V3(0, 1.5, 0)), () => apc.g.position.clone().add(V3(0, 1.5, 0)), 42) },
      { d: 5.4, cam: camOrbit(() => sh().add(V3(0, 1.5, 0)), 22, 2.6, 1.9, 7, 50) },
    ],
    caps: [[0.3, '<b>06:10.</b> הטנק של שאול שלו מגיע לקו, ועליו 33 לוחמי מעוז פורקן — ללא פגע.', 4.4], [5.2, 'מאחור מגיע נגמ״ש בודד ומפויח. ארבעת הנגמ״שים של פלוגה י׳ נפגעו בדרך.', 4.2], [10.0, 'המחיר של החילוץ: חמישה חללים ועשרים ואחד פצועים, כולם מפלוגה י׳ של גדוד 184.', 5.0]],
    end: () => { DIRQ.push({ at: GAME.t + 0.3, fn: () => endGame(true) }); },
  });
}
/* ---------- objective, items, hints, minimap, end ---------- */
function rsObj() {
  const C = CHAP.rescue;
  if (RS.stage === 0 || (RS.stage === 2 && !RS.hillOn)) { const st = TANK.stops[TANK.stopI]; if (st === undefined) return null; const [x, z] = tankAt(st), [wx, wz] = RW(x, z); return [wx, groundAt(wx, wz), wz, RS.stage === 0 && TANK.stopI >= 3 ? 'נקודת המפגש' : 'עצירה']; }
  if (RS.stage === 1) return null;
  if (RS.stage === 2) return null;
  if (RS.stage === 3) return C.shaul.alive ? [C.shaul.g.position.x, C.shaul.g.position.y + 1.2, C.shaul.g.position.z, 'הטנק של שאול'] : null;
  const [wx, wz] = RW(640, 10); return [wx, groundAt(wx, wz), wz, 'הקווים שלנו'];
}
function rsItems(items) {
  const C = CHAP.rescue, S = RS_STAGES[RS.stage]; items.push(['go', (S.goal || S.sub) + (OBJ.on ? ' (◆)' : '')]);
  items.push([TANK.hp < 40 ? 'warn' : '', `מצב הטנק: ${Math.max(0, Math.round(TANK.hp))}% · פגז: ${TANK.gunT > 0 ? `טוען ${Math.ceil(TANK.gunT)}` : 'מוכן'}`]);
  const sag = PROJ.filter((q) => q.type === 'atgm').length; if (sag) items.push(['warn', `סאגר באוויר! הרגו את המפעיל (סימון צהוב)`]);
  if (RS.stage === 1) items.push([RS.flare ? 'warn' : '', RS.flare ? `זיקוק ירוק באוויר · זיהוי ${Math.min(100, Math.round(RS.flareLook / 1.5 * 100))}%` : 'מחכים לזיקוק…']);
  if (RS.stage === 2 && RS.hillOn && !RS.ided) items.push(['next', 'קבוצת חיילים יורדת מהגבעה אליכם — מי הם?']);
  if (RS.stage === 2 && RS.ided) items.push(['warn', `מצרים על הגבעה: ${RS.hill.filter((e) => e.alive).length}`]);
  if (RS.stage >= 3) items.push([C.shaul.hp < 50 ? 'warn' : '', `הטנק של שאול: ${Math.max(0, Math.round(C.shaul.hp))}%`]);
  if (RS.stage === 3) items.push(['next', `לוחמי פורקן על הטנק: ${RS.boarded}/33`]);
  if (RS.stage !== 1) items.push(['', `בשוחות: ${szAlive((e) => e.sz === 'win')} · ברגל: ${szAlive((e) => e.sz === 'street')} · טנקים מצריים: ${VEH.filter((v) => v.mode === 'rescue' && v.side === 'e' && v.alive && v.g.visible).length}`]);
  if (RS.stage === 4) { const d = Math.round(Math.max(0, pathLen(TANK.path) - TANK.s)); items.push(['next', `עד הקווים שלנו: ${d} מ׳`]); }
}
function rsHints() {
  if (GAME.t > 1 && RS.stage === 0 && !CINE.on) hint('sz-tank', TOUCH ? `אתם מפקד הטנק, ראש מחוץ לצריח. <kbd>אש</kbd> = מקלע 0.5, <kbd>רימון</kbd> = פגז מהתותח, <kbd>כוונת</kbd> = כוונת התותחן.` : `אתם מפקד הטנק, ראש מחוץ לצריח. ${K('לחיצה ממושכת')} מקלע 0.5, ${K('G')} פגז מהתותח, לחצן ימני כוונת תותחן, ${K('C')} להיכנס לצריח.`, 10);
}
function rsMini(g, X, poly, dot, k) {
  const W = (pts) => pts.map(([x, z]) => RW(x, z));
  miniField(g, X, poly, dot, k, { bg: 'rgba(96,104,128,.92)', lines: [[W(RS_TRACK), 5, 'rgba(70,66,56,.95)']] });
  const [a, b] = X(...RW(RS_MEET2[0], RS_MEET2[1])); g.fillStyle = '#ffcf73'; g.beginPath(); g.arc(a, b, 6, 0, 6.283); g.fill();
  
  if (RS.flare) { const [c, d] = X(RS.flare.x, RS.flare.z); g.fillStyle = '#6cff8a'; g.beginPath(); g.arc(c, d, 5 + 2 * Math.sin(GAME.t * 8), 0, 6.283); g.fill(); }
}
function rsEnd(win, why) {
  const stats = [[STATS.kills, 'אויבים נפגעו'], [Math.max(0, Math.round(TANK.hp)), 'מצב הטנק %'], [RS.boarded, 'לוחמי פורקן חולצו']];
  if (win) return ['לוחמי פורקן בבית', 'שלושים ושלושה לוחמי מעוז פורקן חולצו ללא פגע על גבי טנק אחד. כך זה היה באמת, בבוקר 9 באוקטובר 1973: אחרי לילה של הליכה בין העמדות המצריות, כניסה ראשונה ריקה, זיקוק ירוק וכניסה שנייה באש תופת. פלוגה י׳ של גדוד 184 שילמה את המחיר — חמישה חללים ועשרים ואחד פצועים.', stats];
  if (why === 'tank') return ['הטנק הושמד', 'סאגר טס לאט ומונחה בחוט: כל עוד המפעיל חי, הוא פוגע. כשנשמעת קריאת "סאגר!", מצאו את הסימון הצהוב והרגו את המפעיל, או היכנסו לצריח. בלילה המפעיל מתגלה בתאורה ובהבזק השיגור.', stats];
  if (why === 'shaul') return ['הטנק של שאול נפגע', 'הטנק עם לוחמי פורקן על הסיפון הוא המטרה של כל סאגר וכל טנק בגזרה. הישארו מולו, חפשו את הסימונים הצהובים ברגע שהם מופיעים, ותנו פגז לכל טנק מצרי שמציץ מהדיונות.', stats];
  return ['נפגעת', 'המפקד חשוף בצריח. כשהאש כבדה, היכנסו לצריח וירו בכוונת התותחן.', stats];
}
CHAP.rescue = { stages: RS_STAGES, st: () => RS.stage, cp: () => CHAP.rescue.cpN || 0, upd: rsUpd, obj: rsObj, hints: rsHints, items: rsItems, mini: rsMini, restore: fieldRestore, tod: () => RS_TOD[RS.stage] - START_MIN + CHAP.rescue.t / 8, end: rsEnd, tank: true, dry: true, night: true, tracers: 0.75, burnLong: true, hitK: () => 0.75,
  atgmTarget: (e) => (RS.stage >= 3 && CHAP.rescue.shaul.alive && Math.random() < 0.6 ? () => CHAP.rescue.shaul.g.position.clone().add(V3(0, 1.6, 0)) : null),
  build: () => chapterBuild(CHAP.rescue, rsBuild), setup: rsSetup, clock: '9.10.1973 · ציר טליסמן', toast: ['הלילה שבין 8 ל־9 באוקטובר 1973 · 03:40', 'כוח חילוץ יוצא בלילה לאסוף את לוחמי מעוז פורקן'], start: () => fieldStart('rescue') };
