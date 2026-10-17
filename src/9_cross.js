

/* ================= chapter 5: the crossing bridges, 18-19 October 1973 =================
   After Israeli sources (Hebrew Wikipedia, חיל ההנדסה במלחמת יום הכיפורים; ynet; the brigade 14 heritage site). The first tanks went over on
   16 October on the Gilloa ferries; on the 17th the uniflote pontoons were in the water by 11:30 and the pontoon bridge stood bank to bank at
   16:30 - from then on the crossing was over it, under shelling and air attack. The roller bridge broke on its way to the canal on the 16th and
   stuck in the sand; it was dragged on to the water's edge (Lt. Col. Aharon "Johnny" Tana, who led it, fell on the canal bank on the 18th) and
   launched on the 19th, north of the pontoon bridge; brigade 14's commander crossed on it that day.
   Film: the repair. 1. 18.10 - over the pontoon bridge in the jeeps, the jeep's machine gun against the Egyptians who crept back onto the
   rampart. 2. the jeeps north through the fields and their bazooka ambushes. 3. the village where the roller bridge will land: one street,
   house by house, by one route. 4. the night of the 19th - the house at the head of the street holds the junction against waves from three
   sides while, behind it, the roller bridge is pushed across. 5. the bridge is down: the tanks come up the street and round into the junction.
   Film: the Egyptians break; a column of tanks on its way to the roller bridge.
   As everywhere in the game +x is east (Sinai) and north is -z: the roller bridge lands at z = 0, the pontoon bridge is 404 m south of it. */
const CR = { o: { x: -7000, z: 7000 }, stage: 0, t: 0, cp: 0, msgs: {}, br: 0, flee: [], air: 0, rep: null, push: false, conv: null, filmTod: null, wave: 0, waveT: 0, doorN: false };
const CW = toWorld(CR.o);
const CR_STAGES = [
  { title: 'על גשר הדוברות', sub: '18 באוקטובר. גשר הדוברות עומד על התעלה מאתמול אחר הצהריים, וכל מה שעובר לגדה המערבית עובר עליו — תחת הפגזה ומטוסים. צנחני חטיבה 247 עוברים בג׳יפים, אחרי הטנקים. בלילה חזרו מצרים לסוללה שמצפון לגשר.', goal: 'מהמקלע על הג׳יפ: השתיקו את המצרים על הסוללה שמצפון לגשר' },
  { title: 'בין השדות', sub: 'מעבר לסוללה מתחילים שדות התעלה: תעלות השקיה, שיחים גבוהים, וחוליות בזוקה שמחכות בתוכם. הג׳יפים נוסעים צפונה, אל הכפר שליד המקום שבו יונח גשר הגלילים.', goal: 'חסלו את מארבי הבזוקה בשיחים, עד הכפר' },
  { title: 'רחוב הכפר', sub: 'רחוב אחד, כביש באמצעו ובתים משני צדיו. כובשים בית אחרי בית, בדרך אחת: חצר, בית, חוצים את הרחוב אל הבית שממול, דרך החצר שלו אל החצר הבאה — עד הבית שבראש הרחוב, מול הצומת.', goal: 'כבשו את הרחוב, בית אחרי בית — הדלת הבאה מסומנת ב־◆' },
  { title: 'הצומת', sub: 'הלילה שבין 18 ל־19 באוקטובר. הבית שבראש הרחוב שולט על הצומת. המצרים יודעים מה זה אומר — והם באים בגלים, משלושה כיוונים: מהסמטה הצפונית, מהסמטה הדרומית ומהדרך שממערב. מאחוריכם, בתעלה, גשר הגלילים נדחף אל המים.', goal: 'החזיקו את הבית מול הצומת עד שגשר הגלילים נוגע בגדה (הפס למעלה)' },
  { title: 'הטנקים באים', sub: '19 באוקטובר. גשר הגלילים מונח. הטנקים הראשונים עולים עליו — ובאים אליכם במעלה הרחוב ומסביב לכפר, אל הצומת.', goal: 'החזיקו את הבית — הטנקים בדרך אליכם' },
];
const CR_CLOCK = ['18.10.1973 · גשר הדוברות', '18.10.1973 · השדות', '18.10.1973 · הכפר', '19.10.1973 · הצומת', '19.10.1973 · גשר הגלילים'];
const CR_TOD = [8 * 60 + 40, 9 * 60, 9 * 60 + 50, 24 * 60 + 30, 24 * 60 + 42];   // minutes from midnight of the 18th
const CR_BRIDGE = -330;   // the sweet-water canal and the little bridge over it
// the Egyptian trench zigzags along the flat top of the west rampart between the two bridges (scenery now: its men went back into the village)
const crTri = (t) => 1 - 4 * Math.abs((((t % 1) + 1) % 1) - 0.5);
const crTX = (lz) => -128 + 2.0 * crTri(lz / 26);
const CR_TZ0 = 30, CR_TZ1 = 256, CR_RAMP_Z = 268;
// the pontoon bridge: uniflote pontoons bank to bank, its deck a metre over the water
const CR_PB_Z = 404, CR_PB_Y = 0.95, CR_PB_PATH = [[134, 404], [100, 404]];
// the jeeps: over the pontoon bridge, west through the gap in the rampart, then north through the fields, along the foot of the rampart to the village
const CR_JEEP = [[-100, 404], [-112, 404], [-124, 405], [-152, 410], [-200, 418], [-245, 404], [-252, 370], [-238, 345], [-222, 324], [-204, 302], [-180, 282], [-162, 262], [-153, 236], [-151, 196], [-152, 150], [-152, 104], [-151, 70], [-150, 44], [-147, 10]], CR_JEEP_S = smoothPath(CR_JEEP, 3);
const CR_J0 = [...CR_PB_PATH, ...CR_JEEP], CR_PB_END = pathLen(CR_PB_PATH) + 196;   // the whole drive, and where on it the bridge's west end is
// where along the jeep track the three ambushes halt the column, and where their runners come from
const CR_AMB = { a0: { stop: [-243, 352], from: [-275, 340], txt: 'מארב! בזוקות בשיחים משני הצדדים!' }, a1: { stop: [-196, 296], from: [-228, 286], txt: 'עוד מארב! חי״ר בשדה, משמאל!' }, a2: { stop: [-152, 158], from: [-206, 150], txt: 'בזוקות בשדה משמאל! עוד מארב!' } };
const crSAt = (path, x, z) => { let acc = 0, best = 0, bd = 1e9; for (let i = 0; i < path.length - 1; i++) { const a = path[i], b = path[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]); for (let u = 0; u <= 1; u += 0.02) { const d = Math.hypot(lerp(a[0], b[0], u) - x, lerp(a[1], b[1], u) - z); if (d < bd) { bd = d; best = acc + L * u; } } acc += L; } return best; };
const CR_ROAD = [[-120, 0], [-430, 0]];
const CR_SEGN = 32, CR_SEGL = 6.25, CR_DECK = 1.95, CR_BLEN = CR_SEGN * CR_SEGL;
const CR_NAMES = ['עמוס', 'רפאל', 'אהרון', 'גבריאל', 'נתן', 'אלון', 'יואב', 'שי', 'בועז', 'עידו', 'אריק', 'מאיר', 'יוסי', 'קובי', 'אבי', 'צחי'];
const CR_FOLLOW = [0, 1, 2, 3, 10, 11, 12, 13];
/* the village, built as a T. The stem is one street running west from the gap in the rampart, the road down its middle, six houses on each side
   with a walled yard behind each. The advance takes it by ONE route: into the first yard, through its house, across the street into the house
   opposite, through that house's yard into the next yard, through that house, across the street again... Everything off that route is shut:
   coils of wire cut the street between the crossings, the houses that are not on the route have their doors shut, the yard walls are higher
   than a man can climb. At its west end the street runs into the house at the head of the T (CR_D); in front of it the cross-lane and the road
   from the west meet - the junction. Mud-brick walls 60 cm thick, doorways 2.2 m wide, windows 1.4 m wide with their sills at 1.05 m */
const CR_WT = 0.6, CR_HH = 4.4, CR_DOOR = 2.2, CR_WIN = 1.4;
const CR_COLS = [-160, -173, -186, -199, -212, -225], CR_HW = 12, CR_HD = 9, CR_FZ = 6, CR_YZ = 24;   // house centres along the street; width, depth; the fronts at |z| 6; the yards' back walls
// each house: its column, its side (-1: north of the road, 1: south), its front door and back door (offset from its centre along the street;
// null: none), whether they are open (the route) or shut, its look; the route goes S1, N1, N2, S2, S3, N3 and on into the house at the head
const CR_VH = [
  { id: 'S1', c: 0, sd: 1, fd: -3.2, bd: 3.2, open: true, st: 0, in: 'b' }, { id: 'N1', c: 1, sd: -1, fd: 3.2, bd: -3.2, open: true, st: 1, in: 'f' },
  { id: 'N2', c: 2, sd: -1, fd: -3.2, bd: 3.2, open: true, st: 2, in: 'b' }, { id: 'S2', c: 3, sd: 1, fd: 3.2, bd: -3.2, open: true, st: 3, in: 'f' },
  { id: 'S3', c: 4, sd: 1, fd: -3.2, bd: 3.2, open: true, st: 4, in: 'b' }, { id: 'N3', c: 5, sd: -1, fd: 3.2, bd: -3.2, open: true, st: 5, in: 'f' },
  { id: 'n0', c: 0, sd: -1, fd: 0, bd: null, open: false, st: 6 }, { id: 's1', c: 1, sd: 1, fd: -2.5, bd: null, open: false, st: 7 },
  { id: 's2', c: 2, sd: 1, fd: 2.5, bd: null, open: false, st: 1 }, { id: 'n3', c: 3, sd: -1, fd: -2.5, bd: null, open: false, st: 4 },
  { id: 'n4', c: 4, sd: -1, fd: 2.5, bd: null, open: false, st: 0 }, { id: 's5', c: 5, sd: 1, fd: -2.5, bd: null, open: false, st: 5 },
];
const CR_D = { x: -240, z: 0, w: 12, d: 22 };            // the house at the head of the street: the village cooperative, two windows wide on the junction
const CR_LX0 = -246, CR_LX1 = -261, CR_LZ = 104;         // the cross-lane in front of it: between these x, out to |z|
const CR_WIRE = [-153.6, -179.5, -205.5];                // coils of wire across the street: at its mouth and between the crossings
// the route, door to door: the gate points of the advance, each just outside the door the next house is entered by
const CR_VG = [[-147, 10], [-156.8, 17.2], [-169.8, -3.8], [-182.8, -17.2], [-195.8, 3.8], [-208.8, 17.2], [-221.8, -3.8], [-240, -13.3], [-240, -4]];
const crInVillage = (lx, lz, pad = 0) => (lx > -266 - pad && lx < -150 + pad && Math.abs(lz) < 27 + pad) || (lx > CR_LX1 - 3 - pad && lx < CR_LX0 + 3 + pad && Math.abs(lz) < CR_LZ + 3 + pad) || (lx > -304 - pad && lx < CR_LX1 + pad && Math.abs(lz) < 9 + pad);
// the three ways into the junction: where a wave forms up out of sight, the mouth it comes through, the windows and the door it storms
const CR_FRONT = {
  n: { name: 'מהסמטה הצפונית', short: 'צפון', from: [-253.5, -101], mouth: [-253.5, -27], rpg: [-253.5, -34], tgt: [[-247, -8], [-247, -4], [-247, -9.5]] },
  s: { name: 'מהסמטה הדרומית', short: 'דרום', from: [-253.5, 101], mouth: [-253.5, 27], rpg: [-253.5, 34], tgt: [[-247, 8], [-247, 4], [-247, 9.5]] },
  w: { name: 'מהדרך שממערב', short: 'מערב', from: [-358, 0], mouth: [-266, 0], rpg: [-280, 2.5], tgt: [[-247, 0], [-247, -4], [-247, 4]] },
};
// the column of tanks in the last film: down the east bank, over the bridge, west along the road
const CR_CONV = [[330, 440], [318, 330], [330, 220], [300, 120], [250, 60], [190, 24], [140, 6], [110, 0], [-100, 0], [-150, 0], [-430, 0]];
const crBench = (x, z) => groundAt(x, z) + 0.4;
/* the land itself (crNat, or the map) and the crossing's works carved into it (crCarve): the canal, both ramparts and their breaches, the
   Egyptian trench, the sweet-water canal, the roads, the village's trodden dust */
function crNat(x, z) {
  const lx = x - CR.o.x, lz = z - CR.o.z, ax = Math.abs(lx);
  let h;
  if (lx > 0) { h = 0.9 + 1.4 * smooth(100, 125, lx) + 0.3 * fbm(lx / 90, lz / 90, 2); mix3(PAL.sandL, PAL.sandD, smooth(-0.3, 0.4, fbm(lx / 120, lz / 120, 3))); }
  else {
    const fieldH = 1.6 + 0.25 * fbm(lx / 70, lz / 70, 2), bank = 0.9 + 0.7 * smooth(100, 112, ax);
    h = lerp(bank, fieldH, smooth(-108, -150, lx)); mix3(PAL.sandL, PAL.sandD, smooth(-0.3, 0.4, fbm(lx / 100, lz / 100, 3)));
    if (lx < -150) { const f = smooth(-150, -175, lx), strip = noise(Math.floor((lx + 1000) / 38) * 1.7, Math.floor((lz + 1000) / 55) * 1.3);
      mixIn(strip > 0.05 ? [lerp(0.30, 0.42, strip), lerp(0.38, 0.47, strip), lerp(0.18, 0.24, strip)] : [0.47, 0.38, 0.27], 0.85 * f); }
  }
  return h;
}
function crCarve(x, z, h) {
  const lx = x - CR.o.x, lz = z - CR.o.z, ax = Math.abs(lx);
  if (ax < 100) { const t = smooth(76, 100, ax); mix3(PAL.deep, PAL.wet, t); return lerp(-5.5, 0.9, t); }
  if (lx > 0) {
    // the east rampart, cut where the roads come down to both bridges
    const breach = Math.max(1 - smooth(32, 50, Math.abs(lz)), 1 - smooth(12, 26, Math.abs(lz - CR_PB_Z))); const r = 7 * Math.exp(-(((lx - 142) / 9) ** 2)) * (1 - breach); h += r; mixIn(PAL.fresh, smooth(1, 5, r) * 0.5);
    mixIn(PAL.wet, 1 - smooth(100, 108, lx));
    { const d = Math.abs(lz); if (d < 5 && lx < 340) mixIn([0.56, 0.5, 0.4], 0.6 * (1 - smooth(2.5, 5, d))); }
    { const d = Math.abs(lz - CR_PB_Z); if (d < 5 && lx < 200) mixIn([0.56, 0.5, 0.4], 0.6 * (1 - smooth(2.5, 5, d))); }
    { const dc = distPolyline(lx, lz, CR_CONV); if (dc < 5 && lx > 110) mixIn([0.58, 0.52, 0.41], 0.55 * (1 - smooth(2.5, 5, dc))); }
  } else {
    const breach = 1 - smooth(12, 34, Math.abs(lz)), nr = 1 - smooth(6, 24, Math.abs(lz - CR_RAMP_Z)), dr = Math.abs(lx + 128);
    const ramp = 9 * (1 - smooth(6.5, 17, dr)) * (1 - breach) * (1 - 0.8 * nr) * smooth(10, 30, Math.abs(lz - CR_PB_Z));
    h += ramp; mixIn(PAL.fresh, smooth(2, 8, ramp) * 0.4);
    // the Egyptian trench: a cut in the flat top of the rampart, sandbags on its lips
    if (lz > CR_TZ0 - 3 && lz < CR_TZ1 + 3) { const d = Math.abs(lx - crTX(lz)), k = smooth(CR_TZ0 - 3, CR_TZ0 + 2, lz) * (1 - smooth(CR_TZ1 - 2, CR_TZ1 + 3, lz)); const c = 1.0 * (1 - smooth(1.4, 2.8, d)) * k; h -= c; mixIn(PAL.sandD, c * 0.6); }
    if (lx < -150) {
      { const dj = distPolyline(lx, lz, CR_JEEP_S); if (dj < 4) mixIn([0.6, 0.53, 0.42], 0.7 * (1 - smooth(2, 4, dj))); }
      const dc = Math.abs(lx - CR_BRIDGE); if (dc < 14) { h = lerp(h, -1.6, 1 - smooth(5, 12, dc)); mixIn(PAL.mud, 1 - smooth(6, 13, dc)); if (Math.abs(lz) < 4 && dc < 12) h = Math.max(h, 1.75); }
    }
    // the village: one level of trodden dust - the street, its yards, the junction and the lanes - so its floors and its walls sit true
    { const kv = Math.max(smooth(-148, -154, lx) * (1 - smooth(-264, -270, lx)) * (1 - smooth(26, 31, Math.abs(lz))), smooth(CR_LX0 + 4, CR_LX0 - 1, lx) * (1 - smooth(CR_LX1 + 1, CR_LX1 - 4, lx)) * (1 - smooth(CR_LZ, CR_LZ + 8, Math.abs(lz))), smooth(-260, -264, lx) * (1 - smooth(-300, -306, lx)) * (1 - smooth(7, 11, Math.abs(lz))));
      if (kv > 0) { h = lerp(h, 1.78, kv); mixIn([0.64, 0.57, 0.45], 0.88 * kv); } }
    { const d = Math.abs(lz); if (d < 4.5 && lx > -150) mixIn([0.58, 0.51, 0.4], 0.6 * (1 - smooth(2.5, 4.5, d))); }
    { const d = Math.abs(lz - CR_PB_Z); if (d < 4.5 && lx > -128) mixIn([0.58, 0.51, 0.4], 0.6 * (1 - smooth(2.5, 4.5, d))); }
    mixIn(PAL.wet, 1 - smooth(100, 106, ax));
  }
  return h;
}
const crH = (x, z) => crCarve(x, z, crNat(x, z));
/* ---------- the village: walls with real thickness, wide doorways, windows to shoot from ---------- */
// a straight wall in local coordinates (along x or along z), its outward normal, and its openings [from, to, 'door' | 'win'] measured along it
// paint: { out: outward normal [x, z] or null, c: the colour outside, band: the painted band at the foot (or null), in: the whitewash inside }
function crWall(ax, az, bx, bz, yb, y0, yt, gaps, P, th = CR_WT, paint = null) {
  const alongX = Math.abs(bz - az) < 1e-6, L = alongX ? Math.abs(bx - ax) : Math.abs(bz - az), sx = alongX ? Math.sign(bx - ax) : 0, sz = alongX ? 0 : Math.sign(bz - az);
  const pt = paint || { out: null, c: 0xc9ae86, band: null, in: 0xc9ae86 }, BAND = y0 + 0.9;
  const span = (s0, s1) => { const a = [ax + sx * s0, az + sz * s0], b = [ax + sx * s1, az + sz * s1], [wx0, wz0] = CW(Math.min(a[0], b[0]), Math.min(a[1], b[1])), [wx1, wz1] = CW(Math.max(a[0], b[0]), Math.max(a[1], b[1]));
    return [alongX ? wx0 : wx0 - th / 2, alongX ? wx1 : wx0 + th / 2, alongX ? wz0 - th / 2 : wz0, alongX ? wz0 + th / 2 : wz1]; };
  const piece = (s0, s1, y1, y2) => { if (s1 - s0 < 0.02 || y2 - y1 < 0.02) return; const [x0, x1, z0, z1] = span(s0, s1);
    // below the band line the outer face takes the band's colour: a piece that crosses it is cut in two (one collider still covers both)
    const cuts = pt.band != null && y1 < BAND && y2 > BAND ? [[y1, BAND, true], [BAND, y2, false]] : [[y1, y2, pt.band != null && y2 <= BAND + 1e-3]];
    for (const [q1, q2, band] of cuts) P.walls.push([crPaint(boxUV(x0, x1, q1, q2, z0, z1, 2.6, 2.6), pt.out, band ? pt.band : pt.c, pt.in, y0, yt), null]);
    addCollider((x0 + x1) / 2, (z0 + z1) / 2, (x1 - x0) / 2, (z1 - z0) / 2, 0, y2, y1); };
  // a doorway ('door'), a doorway with its iron doors shut and barred ('shut': nobody passes, no bullet either), one filled with sandbags to
  // chest height ('bag'), a window ('win'), a breach knocked through a yard wall ('gap': open to the top)
  let s = 0; for (const [g0, g1, kind] of [...gaps].sort((p, q) => p[0] - q[0])) { piece(s, g0, yb, yt); if (kind === 'win') { piece(g0, g1, yb, y0 + 1.05); piece(g0, g1, y0 + 2.05, yt); } else if (kind !== 'gap') piece(g0, g1, y0 + 2.4, yt);
    if (kind === 'shut' || kind === 'bag') { const [x0, x1, z0, z1] = span(g0, g1); addCollider((x0 + x1) / 2, (z0 + z1) / 2, (x1 - x0) / 2, (z1 - z0) / 2, 0, kind === 'shut' ? y0 + 2.4 : y0 + 1.55, yb); }
    s = g1; }
  piece(s, L, yb, yt);
}
// a wall box's colours: the outer face (and the jambs) in the house colour, the inner face whitewashed, darker toward the dust and under the roof
function crPaint(g, out, cOut, cIn, y0, yt) {
  const p = g.attributes.position, n = g.attributes.normal, a = new Float32Array(p.count * 3), co = new THREE.Color(cOut), ci = new THREE.Color(cIn), c = new THREE.Color();
  for (let i = 0; i < p.count; i++) {
    const d = out ? n.getX(i) * out[0] + n.getZ(i) * out[1] : 0, y = p.getY(i), inner = out ? d < -0.5 : true;
    // indoors is in the shade of the roof: without shadows (the lighter settings) that shade lives in the paint
    c.copy(inner ? (out ? ci : co) : co); const k = lerp(0.72, 1, smooth(y0 - 0.6, y0 + 1.5, y)) * lerp(1, 0.86, smooth(yt - 0.7, yt, y)) * (inner ? (LITE ? 0.62 : 0.8) : 1);
    a[i * 3] = c.r * k; a[i * 3 + 1] = c.g * k; a[i * 3 + 2] = c.b * k;
  }
  g.setAttribute('color', new THREE.BufferAttribute(a, 3)); return g;
}
/* ---------- the village dressed: a plastered concrete frame, framed windows with their shutters, metal doors, roofs with what the villagers keep
   on them, wires from the road, and the scars of the shelling. All of it is look only - every wall, doorway, window and place to fight from
   stays exactly where it was ---------- */
// the render: pale and neutral, so each house's paint (its vertex colour) is the colour; trowel sweeps, hairline cracks, chips to the grey under it
function crPlasterTex() {
  const W = 512, c = canvas(W, W), g = c.getContext('2d'), r = rng(9091);
  g.fillStyle = '#e6e2da'; g.fillRect(0, 0, W, W);
  tileBlotches(g, W, r, 26, 30, 110, 'rgba(120,110,95,0.11)', 'rgba(255,255,255,0.10)', 0.55);
  g.lineCap = 'round';
  for (let i = 0; i < 70; i++) { const x = r() * W, y = r() * W, rad = 20 + r() * 50, a0 = r() * 6.28; g.strokeStyle = `rgba(${r() < 0.5 ? '255,255,250' : '110,100,88'},${0.05 + r() * 0.07})`; g.lineWidth = 3 + r() * 8; g.beginPath(); g.arc(x, y, rad, a0, a0 + 0.6 + r() * 0.9); g.stroke(); }
  const img = g.getImageData(0, 0, W, W), d = img.data; for (let i = 0; i < d.length; i += 4) { const n = (r() - 0.5) * 18; d[i] += n; d[i + 1] += n; d[i + 2] += n; } g.putImageData(img, 0, 0);
  for (let k = 0; k < 7; k++) { let x = r() * W, y = r() * W; g.strokeStyle = `rgba(60,52,44,${0.25 + r() * 0.25})`; g.lineWidth = 0.7 + r() * 0.6; g.beginPath(); g.moveTo(x, y); for (let j = 0; j < 9; j++) { x += (r() - 0.5) * 22; y += (r() - 0.3) * 20; g.lineTo(x, y); } g.stroke(); }
  for (let k = 0; k < 18; k++) { const x = r() * W, y = r() * W, w = 3 + r() * 10, h = 2 + r() * 7; g.fillStyle = 'rgba(150,145,135,0.7)'; g.beginPath(); for (let a = 0; a < 6.3; a += 0.9) g.lineTo(x + Math.cos(a) * w * (0.6 + r() * 0.5), y + Math.sin(a) * h * (0.6 + r() * 0.5)); g.closePath(); g.fill(); }
  const t = tex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
// poured concrete: the boards of the formwork, pores, stains
function crConcTex() {
  const W = 256, c = canvas(W, W), g = c.getContext('2d'), r = rng(9092);
  g.fillStyle = '#d2cec6'; g.fillRect(0, 0, W, W);
  tileBlotches(g, W, r, 18, 12, 60, 'rgba(80,74,66,0.16)', 'rgba(255,255,255,0.1)', 0.6);
  for (let y = 0; y < W; y += 32) { g.fillStyle = 'rgba(70,64,56,0.2)'; g.fillRect(0, y, W, 1.5); for (let k = 0; k < 6; k++) { g.strokeStyle = 'rgba(90,84,76,0.08)'; g.lineWidth = 1; g.beginPath(); const yy = y + 4 + r() * 24; g.moveTo(0, yy); g.bezierCurveTo(W * 0.3, yy + (r() - 0.5) * 4, W * 0.7, yy + (r() - 0.5) * 4, W, yy); g.stroke(); } }
  for (let i = 0; i < 900; i++) { g.fillStyle = r() < 0.6 ? 'rgba(60,56,50,0.35)' : 'rgba(255,255,255,0.2)'; g.fillRect(r() * W, r() * W, 1 + r() * 1.5, 1 + r()); }
  const t = tex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
// the scars, one per cell of a strip: bricks where the render has fallen, a shell's burst, a burst of bullet holes, a streak of soot or damp
function crDecalTex() {
  const S = 256, c = canvas(S * 4, S), g = c.getContext('2d'), r = rng(9093);
  g.clearRect(0, 0, S * 4, S);
  const cell = (k, fn) => { g.save(); g.translate(k * S, 0); g.beginPath(); g.rect(0, 0, S, S); g.clip(); fn(); g.restore(); };
  const pock = (x, y, rad) => { g.fillStyle = 'rgba(214,208,196,0.95)'; g.beginPath(); for (let a = 0; a < 6.3; a += 0.7) g.lineTo(x + Math.cos(a) * rad * (0.7 + r() * 0.6), y + Math.sin(a) * rad * (0.7 + r() * 0.6)); g.closePath(); g.fill(); g.fillStyle = 'rgba(40,34,28,0.95)'; g.beginPath(); g.arc(x, y, rad * 0.42, 0, 6.283); g.fill(); };
  cell(0, () => {
    const pts = []; for (let a = 0; a < 6.283; a += 0.22) { const rr = 0.36 + 0.08 * Math.sin(a * 3 + 1) + (r() - 0.5) * 0.12; pts.push([S / 2 + Math.cos(a) * S * rr * 1.12, S / 2 + Math.sin(a) * S * rr * 0.92]); }
    const path = () => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); };
    path(); g.fillStyle = 'rgba(196,188,174,1)'; g.fill();
    g.save(); g.translate(S / 2, S / 2); g.scale(0.88, 0.85); g.translate(-S / 2, -S / 2); path(); g.clip();
    g.fillStyle = '#7e786c'; g.fillRect(0, 0, S, S);
    for (let row = 0; row * 15 < S; row++) for (let k = -1; k * 52 < S; k++) { const x = k * 52 + (row % 2) * 26 + 1, y = row * 15 + 1, t = 0.78 + r() * 0.36; g.fillStyle = `rgb(${(152 * t) | 0},${(94 * t) | 0},${(66 * t) | 0})`; g.fillRect(x, y, 49, 12); }
    const sh = g.createRadialGradient(S / 2, S / 2, S * 0.15, S / 2, S / 2, S * 0.5); sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,0.35)'); g.fillStyle = sh; g.fillRect(0, 0, S, S);
    g.restore();
  });
  cell(1, () => {
    const gr = g.createRadialGradient(S / 2, S / 2, 4, S / 2, S / 2, S * 0.48); gr.addColorStop(0, 'rgba(26,22,18,0.9)'); gr.addColorStop(0.45, 'rgba(40,34,28,0.5)'); gr.addColorStop(1, 'rgba(40,34,28,0)'); g.fillStyle = gr; g.fillRect(0, 0, S, S);
    g.strokeStyle = 'rgba(30,26,22,0.35)'; g.lineCap = 'round'; for (let k = 0; k < 40; k++) { const a = r() * 6.283, r0 = 18 + r() * 20, r1 = r0 + 30 + r() * 70; g.lineWidth = 1 + r() * 2.5; g.beginPath(); g.moveTo(S / 2 + Math.cos(a) * r0, S / 2 + Math.sin(a) * r0); g.lineTo(S / 2 + Math.cos(a) * r1, S / 2 + Math.sin(a) * r1); g.stroke(); }
    g.fillStyle = 'rgba(128,120,108,1)'; g.beginPath(); for (let a = 0; a < 6.3; a += 0.45) g.lineTo(S / 2 + Math.cos(a) * (24 + r() * 16), S / 2 + Math.sin(a) * (22 + r() * 14)); g.closePath(); g.fill();
    g.fillStyle = 'rgba(30,26,22,1)'; g.beginPath(); for (let a = 0; a < 6.3; a += 0.6) g.lineTo(S / 2 + Math.cos(a) * (9 + r() * 7), S / 2 + Math.sin(a) * (8 + r() * 6)); g.closePath(); g.fill();
    for (let k = 0; k < 34; k++) { const a = r() * 6.283, d = 40 + r() * 80; pock(S / 2 + Math.cos(a) * d, S / 2 + Math.sin(a) * d, 2.5 + r() * 4); }
  });
  cell(2, () => { for (let k = 0; k < 30; k++) { const x = S * (0.12 + r() * 0.76), y = S * (0.15 + r() * 0.7); pock(x, y, 2.5 + r() * 5); } });
  cell(3, () => {
    for (let k = 0; k < 9; k++) { const x = S * (0.3 + r() * 0.4), w = S * (0.12 + r() * 0.2), gr = g.createLinearGradient(0, S, 0, S * (0.05 + r() * 0.3)); gr.addColorStop(0, 'rgba(24,20,16,0.75)'); gr.addColorStop(1, 'rgba(24,20,16,0)'); g.fillStyle = gr; g.beginPath(); g.ellipse(x, S * 0.9, w, S * 0.85, 0, 0, 6.283); g.fill(); }
  });
  return tex(c);
}
// louvred shutters, painted over and chipped; metal doors with their two panels; corrugated iron; a dovecote's clay; bundles of dry stalks
function crShutTex() {
  const W = 128, H = 192, c = canvas(W, H), g = c.getContext('2d'), r = rng(9094);
  g.fillStyle = '#ebe6dc'; g.fillRect(0, 0, W, H); g.fillStyle = 'rgba(60,50,40,0.5)'; g.fillRect(0, 0, W, 8); g.fillRect(0, H - 8, W, 8); g.fillRect(0, 0, 8, H); g.fillRect(W - 8, 0, 8, H);
  for (let y = 12; y < H - 12; y += 11) { const gr = g.createLinearGradient(0, y, 0, y + 11); gr.addColorStop(0, 'rgba(255,255,255,0.35)'); gr.addColorStop(0.7, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(40,30,20,0.55)'); g.fillStyle = gr; g.fillRect(10, y, W - 20, 11); }
  for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(110,82,56,${0.4 + r() * 0.4})`; g.fillRect(r() * W, r() * H, 1 + r() * 6, 1 + r() * 3); }
  return tex(c);
}
function crDoorTex() {
  const W = 128, H = 256, c = canvas(W, H), g = c.getContext('2d'), r = rng(9095);
  g.fillStyle = '#e2e0da'; g.fillRect(0, 0, W, H);
  const panel = (x, y, w, h) => { g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(x, y, w, h); g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(x, y + h - 3, w, 3); g.fillRect(x + w - 3, y, 3, h); g.fillStyle = 'rgba(0,0,0,0.3)'; g.fillRect(x, y, w, 3); g.fillRect(x, y, 3, h); };
  panel(16, 16, W - 32, H * 0.42); panel(16, H * 0.52, W - 32, H * 0.42);
  for (let k = 0; k < 14; k++) { const x = r() * W, gr = g.createLinearGradient(0, H * (0.4 + r() * 0.5), 0, H); gr.addColorStop(0, 'rgba(120,62,30,0)'); gr.addColorStop(1, `rgba(120,62,30,${0.25 + r() * 0.35})`); g.fillStyle = gr; g.fillRect(x, 0, 2 + r() * 6, H); }
  for (let i = 0; i < 90; i++) { g.fillStyle = `rgba(${r() < 0.5 ? '130,70,36' : '60,52,44'},${0.3 + r() * 0.4})`; g.fillRect(r() * W, r() * H, 1 + r() * 4, 1 + r() * 3); }
  g.fillStyle = 'rgba(40,36,30,0.9)'; g.fillRect(W - 24, H * 0.5, 8, 14);
  return tex(c);
}
function crSheetTex() {
  const W = 256, H = 64, c = canvas(W, H), g = c.getContext('2d'), r = rng(9096);
  for (let x = 0; x < W; x++) { const v = 170 + 60 * Math.sin(x / W * Math.PI * 2 * 12); g.fillStyle = `rgb(${v | 0},${(v * 0.98) | 0},${(v * 0.94) | 0})`; g.fillRect(x, 0, 1, H); }
  tileBlotches(g, W, r, 14, 6, 26, 'rgba(120,64,30,0.5)', 'rgba(255,255,255,0.08)', 0.8);
  const t = tex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
function crPigeonTex() {
  const W = 256, c = canvas(W, W), g = c.getContext('2d'), r = rng(9097);
  g.fillStyle = '#b39a76'; g.fillRect(0, 0, W, W); tileBlotches(g, W, r, 20, 10, 40, 'rgba(90,70,50,0.25)', 'rgba(255,245,225,0.15)', 0.6);
  for (let row = 0; row < 9; row++) for (let k = 0; k < 10; k++) { const x = k * 25.6 + (row % 2) * 12.8 + 6, y = 18 + row * 26; g.fillStyle = 'rgba(205,190,165,0.9)'; g.beginPath(); g.arc(x, y, 7, 0, 6.283); g.fill(); g.fillStyle = 'rgba(28,22,16,0.95)'; g.beginPath(); g.arc(x, y, 4.2, 0, 6.283); g.fill(); }
  const t = tex(c); t.wrapS = THREE.RepeatWrapping; return t;
}
function crStrawTex() {
  const W = 128, c = canvas(W, W), g = c.getContext('2d'), r = rng(9098);
  g.fillStyle = '#9a8158'; g.fillRect(0, 0, W, W);
  for (let i = 0; i < 260; i++) { const y = r() * W, sh = 120 + r() * 90; g.strokeStyle = `rgba(${sh | 0},${(sh * 0.86) | 0},${(sh * 0.58) | 0},0.8)`; g.lineWidth = 0.8 + r() * 1.6; g.beginPath(); g.moveTo(0, y); g.lineTo(W, y + (r() - 0.5) * 10); g.stroke(); }
  const t = tex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
/* how each house looks: its paint and the band at its foot, the frame (plastered with the walls, or raw concrete), the height of its rooms,
   its parapet, what stands on its roof, the shutters and the door, a concrete hood over the door or an iron awning, a burnt window */
const CR_VSTYLE = [
  { c: 0xdcd4c0, band: 0x8a98a2, raw: false, dh: 0.3, par: 'solid', roof: 'cols', sh: 0x4e6e5a, dr: 0x56666e, aw: true, shop: true },
  { c: 0xcaa46c, band: 0x7d6a52, raw: false, dh: 0, par: 'rail', roof: 'tank', sh: 0x6a4a30, dr: 0x6b3f2a, hood: true },
  { c: 0xa6bcc6, band: 0x6a7c86, raw: false, dh: 0.5, par: 'solid', roof: 'pigeon', sh: 0x3c5c70, dr: 0x4a5a64, burnt: true },
  { c: 0xd2a088, band: 0x8a6a5a, raw: false, dh: -0.2, par: 'low', roof: 'straw', sh: 0x587860, dr: 0x6a5040, aw: true },
  { c: 0xb6b0a4, band: null, raw: true, dh: 0.2, par: 'broken', roof: 'cols', sh: 0x7a5a3a, dr: 0x50585a, scar: true },
  { c: 0xbac29e, band: 0x6a7860, raw: false, dh: 0, par: 'solid', roof: 'tank', sh: 0x6a4a30, dr: 0x3e4e44, line: true },
  { c: 0xcfb994, band: null, raw: false, dh: -0.3, par: 'low', roof: 'straw', sh: 0x40607a, dr: 0x6a4a34, scar: true },
  { c: 0xe2ddd0, band: 0x9a8a72, raw: false, dh: 0.4, par: 'rail', roof: 'cols', sh: 0x5a6e4a, dr: 0x5c5048, line: true, hood: true },
  { c: 0xd6cdb6, band: 0x6f7f74, raw: false, dh: 0.5, par: 'solid', roof: 'tank', sh: 0x3c5c70, dr: 0x4a5a5a, hood: true, shop: true, coop: true },   // the cooperative at the head of the street
];
const CR_IN = 0xe6dfcf, CR_CONC = 0xb4b0a6, CR_RAWC = 0xa8a398;
const crMix = (a, b, t) => new THREE.Color(a).lerp(new THREE.Color(b), t).getHex();
// a box against a wall, in the wall's own measure: s0..s1 along it, d0..d1 out from its centre line (its outer face is at d = CR_WT / 2)
function crBoxOn(wl, s0, s1, d0, d1, y1, y2, tw = 1, th = 1) {
  const ax = wl.o[0] + wl.t[0] * s0 + wl.n[0] * d0, az = wl.o[1] + wl.t[1] * s0 + wl.n[1] * d0, bx = wl.o[0] + wl.t[0] * s1 + wl.n[0] * d1, bz = wl.o[1] + wl.t[1] * s1 + wl.n[1] * d1;
  const [x0, z0] = CW(Math.min(ax, bx), Math.min(az, bz)), [x1, z1] = CW(Math.max(ax, bx), Math.max(az, bz)); return boxUV(x0, x1, y1, y2, z0, z1, tw, th);
}
// a flat card on a wall facing out of it, its picture one cell of the strip of scars
function crQuad(wl, s, y, w, h, d, cell, list, flip = false) {
  const g = new THREE.PlaneGeometry(w, h), uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, (cell + uv.getX(i)) / 4, flip ? 1 - uv.getY(i) : uv.getY(i));
  g.rotateY(Math.atan2(wl.n[0], wl.n[1])); const [x, z] = CW(wl.o[0] + wl.t[0] * s + wl.n[0] * d, wl.o[1] + wl.t[1] * s + wl.n[1] * d); g.translate(x, y, z); list.push([g, 0xffffff]);
}
// a geometry built standing at the foot of a wall (x along it, z out of it), turned to face out of the wall and set down at s, d
function crOnWall(wl, s, d, y, geo) { geo.rotateY(Math.atan2(wl.n[0], wl.n[1])); const [x, z] = CW(wl.o[0] + wl.t[0] * s + wl.n[0] * d, wl.o[1] + wl.t[1] * s + wl.n[1] * d); geo.translate(x, y, z); return geo; }
function crVDress(H, st, WL, P, r, y0, yt, yb) {
  const T = CR_WT, F = T / 2, fr = st.raw ? CR_RAWC : crMix(st.c, 0xffffff, 0.14), conc = CR_CONC, [x0, x1, z0, z1] = H.box;
  // is this stretch of a wall clear of the corners and of every opening but the one named?
  const free = (wl, s0, s1, pad = 0.25, own = null) => s0 >= wl.e0 + 0.5 && s1 <= wl.e1 - 0.5 && !wl.gaps.some(([g0, g1]) => g0 !== own && s1 > g0 - pad && s0 < g1 + pad);
  const wpt = (wl, s, d) => [wl.o[0] + wl.t[0] * s + wl.n[0] * d, wl.o[1] + wl.t[1] * s + wl.n[1] * d];
  const gl = (wl, s, d) => groundAt(...CW(...wpt(wl, s, d)));
  const rubble = (wl, s, n, spread) => { for (let k = 0; k < n; k++) { const [lx, lz] = wpt(wl, s + (r() - 0.5) * spread, F + 0.2 + r() * 1.3), [wx, wz] = CW(lx, lz), q = 0.07 + r() * 0.17; P.conc.push([new THREE.DodecahedronGeometry(q, 0), [st.c, 0x9a5a40, conc, CR_RAWC][Math.floor(r() * 4)], M4(wx, groundAt(wx, wz) + q * 0.5, wz, r() * 3, r() * 3, r() * 3, 1, 0.7, 1.2)]); } };
  for (const wl of WL) {
    const L = wl.L, c0 = wl.e0, c1 = wl.e1;
    // the frame shows through the render: a pilaster at each corner, a beam under the roof all round
    P.conc.push([crBoxOn(wl, c0 - 0.05, c0 + 0.45, F - 0.02, F + 0.05, yb, yt), fr], [crBoxOn(wl, c1 - 0.45, c1 + 0.05, F - 0.02, F + 0.05, yb, yt), fr], [crBoxOn(wl, c0 + 0.45, c1 - 0.45, F - 0.02, F + 0.04, yt - 0.34, yt), fr]);
    for (const [g0, g1, kind] of wl.gaps) {
      if (kind === 'win') {
        P.conc.push([crBoxOn(wl, g0 - 0.12, g0, F - 0.02, F + 0.05, y0 + 1.0, y0 + 2.18), fr], [crBoxOn(wl, g1, g1 + 0.12, F - 0.02, F + 0.05, y0 + 1.0, y0 + 2.18), fr], [crBoxOn(wl, g0 - 0.12, g1 + 0.12, F - 0.02, F + 0.06, y0 + 2.05, y0 + 2.2), fr], [crBoxOn(wl, g0 - 0.2, g1 + 0.2, F - 0.02, F + 0.11, y0 + 0.97, y0 + 1.05), conc]);
        // the shutters, folded right back flat against the wall; now and then a leaf is gone
        for (const sd of [-1, 1]) { const s0 = sd < 0 ? g0 - 0.84 : g1 + 0.14; if (!free(wl, s0, s0 + 0.7, 0.25, g0) || r() < 0.12) continue; P.shut.push([crBoxOn(wl, s0, s0 + 0.7, F + 0.03, F + 0.065, y0 + 1.02, y0 + 2.1, 0.7, 1.08), crMix(st.sh, 0x9a8a70, r() * 0.3)]); }
      } else {
        P.conc.push([crBoxOn(wl, g0 - 0.16, g0, F - 0.02, F + 0.06, y0 - 0.05, y0 + 2.58), fr], [crBoxOn(wl, g1, g1 + 0.16, F - 0.02, F + 0.06, y0 - 0.05, y0 + 2.58), fr], [crBoxOn(wl, g0 - 0.16, g1 + 0.16, F - 0.02, F + 0.07, y0 + 2.4, y0 + 2.6), fr]);
        // the step at the door, a concrete hood over it on some houses
        P.conc.push([crBoxOn(wl, g0 - 0.25, g1 + 0.25, F - 0.02, F + 0.55, Math.min(gl(wl, (g0 + g1) / 2, F + 0.4), y0) - 0.3, y0 - 0.03), conc]);
        if (st.hood && wl.front) P.conc.push([crBoxOn(wl, g0 - 0.45, g1 + 0.45, F - 0.02, F + 0.65, y0 + 2.8, y0 + 2.92), conc]);
        if (kind === 'shut') {
          // a house off the route: its iron doors shut in the opening, a beam barred across them outside
          const mid = (g0 + g1) / 2; P.door.push([crBoxOn(wl, g0 + 0.02, mid - 0.01, -0.05, 0.05, y0 + 0.03, y0 + 2.38, 1.1, 2.33), st.dr], [crBoxOn(wl, mid + 0.01, g1 - 0.02, -0.05, 0.05, y0 + 0.03, y0 + 2.38, 1.1, 2.33), st.dr]);
          P.wood.push([crBoxOn(wl, g0 - 0.35, g1 + 0.35, F + 0.02, F + 0.15, y0 + 1.12, y0 + 1.3), 0x5a4630]);
        } else if (kind === 'bag') {
          // the door on the junction: filled with sandbags from inside to the chest, to fire over
          const a = CW(...wpt(wl, g0 - 0.25, -F - 0.27)), b = CW(...wpt(wl, g1 + 0.25, -F - 0.27)); bagWall([a, b], 8, y0 - 0.05, false);
        } else
        // the iron doors: both leaves swung right back against the wall inside; where a window leaves no room, that leaf lies blown off in the dust outside
        for (const sd of [-1, 1]) { const s0 = sd < 0 ? g0 - 1.12 : g1 + 0.02, s1 = s0 + 1.1;
          if (s0 >= T + 0.05 && s1 <= L - T - 0.05 && !wl.gaps.some(([q0, q1]) => q0 !== g0 && s1 > q0 - 0.1 && s0 < q1 + 0.1)) P.door.push([crBoxOn(wl, s0, s1, -F - 0.06, -F - 0.012, y0 + 0.03, y0 + 2.36, 1.1, 2.33), st.dr]);
          else { const [lx, lz] = wpt(wl, (g0 + g1) / 2 + sd * 0.7, F + 1.7 + r() * 0.8), [wx, wz] = CW(lx, lz); P.door.push([new THREE.BoxGeometry(1.1, 0.05, 2.33), st.dr, M4(wx, groundAt(wx, wz) + 0.05, wz, 0.04, r() * 3, 0.03)]); } }
        // an iron awning on brackets over the front door
        if (st.aw && wl.front && kind !== 'bag') { const W = g1 - g0 + 1.6, D = 1.45, yi = y0 + 3.08, yo = y0 + 2.74, g = new THREE.BufferGeometry();
          g.setAttribute('position', new THREE.Float32BufferAttribute([-W / 2, yi - y0, 0, W / 2, yi - y0, 0, -W / 2, yo - y0, D, W / 2, yo - y0, D], 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 1, W, 1, 0, 0, W, 0], 2)); g.setIndex([0, 2, 1, 1, 2, 3]); g.computeVertexNormals();
          P.sheet.push([crOnWall(wl, (g0 + g1) / 2, F + 0.02, y0, g), crMix(0x9a948a, 0x8a5a3a, r() * 0.5)]);
          for (const e of [-1, 1]) P.metal.push([crOnWall(wl, (g0 + g1) / 2 + e * (W / 2 - 0.2), F, y0, new THREE.BoxGeometry(0.04, 0.04, 1.5).rotateX(-0.42).translate(0, 2.55, 0.68)), 0x3a3834]); }
        // the grocer's board over his door (the cooperative's over the door of the house at the head of the street)
        if (st.shop && wl.front) { const cv = canvas(512, 128), g = cv.getContext('2d'), rr = rng(9099); g.fillStyle = '#2d5a66'; g.fillRect(0, 0, 512, 128); tileBlotches(g, 512, rr, 18, 8, 40, 'rgba(120,70,40,0.35)', 'rgba(255,255,255,0.1)', 0.7);
          g.strokeStyle = 'rgba(230,224,206,0.85)'; g.lineWidth = 5; g.strokeRect(10, 10, 492, 108); g.fillStyle = '#efe8d4'; g.font = 'bold 74px "DejaVu Sans", Tahoma, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.direction = 'rtl'; if (st.coop) g.font = 'bold 58px "DejaVu Sans", Tahoma, Arial, sans-serif'; g.fillText(st.coop ? 'جمعية تعاونية' : 'بقالة', 256, 66);
          const m = new THREE.Mesh(crBoxOn(wl, (g0 + g1) / 2 - 1.3, (g0 + g1) / 2 + 1.3, F + 0.01, F + 0.05, y0 + 3.25, y0 + 3.9, 2.6, 0.65), new THREE.MeshStandardMaterial({ map: tex(cv), roughness: 0.8 })); scene.add(SH(onLayer1(m))); }
      }
    }
  }
  // the roof: a concrete slab with its lip all round, and on it the parapet of this house
  const lb = (ax, az, bx, bz, ya, yb2, col, list = P.conc, tw = 1, th = 1) => { const [p, q] = CW(Math.min(ax, bx), Math.min(az, bz)), [u, v] = CW(Math.max(ax, bx), Math.max(az, bz)); list.push([boxUV(p, u, ya, yb2, q, v, tw, th), col]); };
  const X0 = x0 - F, X1 = x1 + F, Z0 = z0 - F, Z1 = z1 + F, ys = yt + 0.22, pw = 0.22;
  lb(X0 - 0.3, Z0 - 0.3, X1 + 0.3, Z1 + 0.3, yt, ys, crMix(conc, 0x8a8478, 0.15));
  lb(x0 + F, z0 + F, x1 - F, z1 - F, yt - 0.03, yt - 0.004, LITE ? 0x5a564e : 0x87827a);
  const edges = [[X0, Z0, X1, Z0 + pw, 'x'], [X0, Z1 - pw, X1, Z1, 'x'], [X0, Z0 + pw, X0 + pw, Z1 - pw, 'z'], [X1 - pw, Z0 + pw, X1, Z1 - pw, 'z']];
  const ph = st.par === 'solid' || st.par === 'broken' ? 0.95 : st.par === 'low' ? 0.45 : 0.18;
  for (const [ax, az, bx, bz, ax2] of edges) {
    // a broken parapet has lost a stretch or two to the shelling: rebar sticks out of the broken ends, the pieces lie under the wall
    let runs = [[0, 1]];
    if (st.par === 'broken' && r() < 0.8) { const a = 0.15 + r() * 0.45, b = a + 0.15 + r() * 0.2; runs = [[0, a], [b, 1]]; }
    for (const [u0, u1] of runs) {
      const p0 = ax2 === 'x' ? [lerp(ax, bx, u0), az] : [ax, lerp(az, bz, u0)], p1 = ax2 === 'x' ? [lerp(ax, bx, u1), bz] : [bx, lerp(az, bz, u1)];
      if (st.par === 'rail') lb(p0[0], p0[1], p1[0], p1[1], ys, ys + ph, conc);
      else { lb(p0[0], p0[1], p1[0], p1[1], ys, ys + ph, st.par === 'low' ? crMix(st.c, 0x8a7a62, 0.25) : st.c, P.walls, 2.6, 2.6); lb(p0[0] - 0.04, p0[1] - 0.04, p1[0] + 0.04, p1[1] + 0.04, ys + ph, ys + ph + 0.06, conc); }
    }
    if (runs.length > 1) for (const u of [runs[0][1], runs[1][0]]) {
      const [px, pz] = ax2 === 'x' ? [lerp(ax, bx, u), (az + bz) / 2] : [(ax + bx) / 2, lerp(az, bz, u)], [wx, wz] = CW(px, pz);
      for (let k = 0; k < 3; k++) P.metal.push([G.cyl(0.011, 0.011, 0.5 + r() * 0.4, 4), 0x4a3426, M4(wx + (r() - 0.5) * 0.15, ys + 0.2 + k * 0.25, wz + (r() - 0.5) * 0.15, ax2 === 'x' ? 0 : Math.PI / 2 + (r() - 0.5) * 0.6, 0, ax2 === 'x' ? Math.PI / 2 + (r() - 0.5) * 0.6 : 0)]);
      const wl = WL[ax2 === 'x' ? (az < (Z0 + Z1) / 2 ? 0 : 1) : (ax < (X0 + X1) / 2 ? 2 : 3)], s = ax2 === 'x' ? px - wl.o[0] : pz - wl.o[1]; rubble(wl, s, 7, 1.6);
    }
  }
  if (st.par === 'rail') {
    // an iron railing on a low curb
    const posts = [], rails = [];
    for (const [ax, az, bx, bz] of [[X0 + 0.11, Z0 + 0.11, X1 - 0.11, Z0 + 0.11], [X0 + 0.11, Z1 - 0.11, X1 - 0.11, Z1 - 0.11], [X0 + 0.11, Z0 + 0.11, X0 + 0.11, Z1 - 0.11], [X1 - 0.11, Z0 + 0.11, X1 - 0.11, Z1 - 0.11]]) {
      const L = Math.hypot(bx - ax, bz - az), n = Math.max(2, Math.round(L / 1.4)); for (let k = 0; k <= n; k++) { const [wx, wz] = CW(lerp(ax, bx, k / n), lerp(az, bz, k / n)); posts.push([G.box(0.05, 0.85, 0.05), 0x3c3a34, M4(wx, ys + ph + 0.42, wz)]); }
      const [mx, mz] = CW((ax + bx) / 2, (az + bz) / 2); for (const y of [0.42, 0.84]) rails.push([G.box(bx !== ax ? L : 0.04, 0.04, bz !== az ? L : 0.04), 0x3c3a34, M4(mx, ys + ph + y, mz)]);
    }
    P.metal.push(...posts, ...rails);
  }
  // rain spouts through the back parapet, the walls streaked under them
  { const wl = WL[H.door === 's' ? 0 : 1]; for (const u of [0.22, 0.78]) { const s = lerp(wl.e0, wl.e1, u); P.conc.push([crBoxOn(wl, s - 0.07, s + 0.07, F - 0.1, F + 0.45, ys + 0.05, ys + 0.17), conc]); crQuad(wl, s, ys - 0.85, 0.34, 1.7, F + 0.013, 3, P.decal, true); } }
  // what stands on the roof
  const roofPt = (u, v) => CW(lerp(X0 + 0.4, X1 - 0.4, u), lerp(Z0 + 0.4, Z1 - 0.4, v));
  if (st.roof === 'cols') {
    // the next storey, begun and left: columns with their rebar standing out of them, and a few courses of block between two of them
    const cols = [[X0 + 0.15, Z0 + 0.15], [X1 - 0.15, Z0 + 0.15], [X0 + 0.15, Z1 - 0.15], [X1 - 0.15, Z1 - 0.15]]; if (X1 - X0 > 10) cols.push([(X0 + X1) / 2, Z0 + 0.15], [(X0 + X1) / 2, Z1 - 0.15]);
    for (const [lx, lz] of cols) { const [wx, wz] = CW(lx, lz), hc = r() < 0.25 ? 0.45 : 1.1 + r() * 1.2; P.conc.push([G.box(0.3, hc, 0.3), CR_RAWC, M4(wx, ys + hc / 2, wz)]);
      for (const [ox, oz] of [[-0.09, -0.09], [0.09, -0.09], [-0.09, 0.09], [0.09, 0.09]]) { const len = 0.55 + r() * 0.5; P.metal.push([G.cyl(0.011, 0.011, len, 4), 0x4a3426, M4(wx + ox, ys + hc + len / 2 - 0.05, wz + oz, (r() - 0.5) * 0.3, 0, (r() - 0.5) * 0.3)]); } }
    if (st.par === 'solid') { const zb = H.door === 's' ? [Z0, Z0 + 0.22] : [Z1 - 0.22, Z1]; lb(X0 + 0.3, zb[0], X0 + 0.3 + (X1 - X0) * 0.55, zb[1], ys, ys + ph + 0.46 + r() * 0.5, 0xa29d92, P.conc, 0.4, 0.2); }
  }
  if (st.roof === 'tank') {
    // a water tank on an iron stand
    const [wx, wz] = roofPt(r() < 0.5 ? 0.12 : 0.88, r() < 0.5 ? 0.15 : 0.85);
    for (const [ox, oz] of [[-0.45, -0.45], [0.45, -0.45], [-0.45, 0.45], [0.45, 0.45]]) P.metal.push([G.box(0.06, 1.25, 0.06), 0x3e3c36, M4(wx + ox, ys + 0.62, wz + oz)]);
    P.metal.push([G.box(1.05, 0.06, 1.05), 0x3e3c36, M4(wx, ys + 1.27, wz)], [G.cyl(0.58, 0.58, 1.15, 16), crMix(0x8a8a82, 0x8a5a3a, 0.35), M4(wx, ys + 1.88, wz)], [G.cyl(0.2, 0.2, 0.08, 10), 0x5a5850, M4(wx, ys + 2.49, wz)]);
  }
  if (st.roof === 'pigeon') {
    // a clay dovecote, the pots of its nests set in its walls, perches through it
    const [wx, wz] = roofPt(0.7, 0.5); P.pig.push([G.cyl(0.55, 0.92, 2.5, 16), 0xffffff, M4(wx, ys + 1.25, wz)]); P.conc.push([G.cone(0.6, 0.55, 16), 0xb59c78, M4(wx, ys + 2.78, wz)]);
    for (let k = 0; k < 6; k++) { const a = r() * 6.283, y = ys + 0.6 + r() * 1.7, rad = lerp(0.92, 0.55, (y - ys) / 2.5); P.wood.push([G.cyl(0.02, 0.02, 0.6, 4), 0x6a5236, M4(wx + Math.cos(a) * rad, y, wz + Math.sin(a) * rad, 0, -a, Math.PI / 2)]); }
  }
  if (st.roof === 'straw') {
    // bundles of dry cotton stalks stacked against the parapet, the fuel of the village ovens
    for (let k = 0; k < 4; k++) { const along = r() < 0.5, [wx, wz] = roofPt(along ? 0.2 + r() * 0.6 : (r() < 0.5 ? 0.06 : 0.94), along ? (r() < 0.5 ? 0.08 : 0.92) : 0.2 + r() * 0.6), L = 1.4 + r() * 0.8; P.straw.push([G.box(along ? L : 0.6, 0.5 + r() * 0.2, along ? 0.6 : L), 0xffffff, M4(wx, ys + 0.3, wz, 0, (r() - 0.5) * 0.2, 0)]); }
    // and the ladder up to them, against the back wall (the side walls stand a hand's breadth from the next house)
    const wl = WL[H.door === 's' ? 0 : H.door === 'n' ? 1 : 3], s = (wl.e0 + wl.e1) / 2, g0 = gl(wl, s, F + 1.4), Hh = ys + 0.7 - g0, len = Math.hypot(Hh, 1.35), th = Math.atan2(1.35, Hh);
    const parts = [[G.box(0.05, len, 0.07), 0x7a5a3a, M4(-0.22, len / 2, 0)], [G.box(0.05, len, 0.07), 0x7a5a3a, M4(0.22, len / 2, 0)]]; for (let y = 0.3; y < len - 0.1; y += 0.32) parts.push([G.box(0.44, 0.04, 0.045), 0x6e5034, M4(0, y, 0)]);
    P.wood.push([crOnWall(wl, s, F + 1.4, g0, build(parts).rotateX(-th)), null]);
  }
  if (st.line) {
    // washing on a line across the roof
    const [ax, az] = roofPt(0.15, 0.35), [bx, bz] = roofPt(0.85, 0.55), L = Math.hypot(bx - ax, bz - az), yaw = Math.atan2(-(bz - az), bx - ax);
    for (const [px, pz] of [[ax, az], [bx, bz]]) P.metal.push([G.box(0.04, 1.75, 0.04), 0x4a4842, M4(px, ys + 0.87, pz)]);
    P.metal.push([G.box(L, 0.012, 0.012), 0x2a2824, M4((ax + bx) / 2, ys + 1.7, (az + bz) / 2, 0, yaw, 0)]);
    for (let k = 0; k < 5; k++) { const t = 0.12 + k * 0.18, w = 0.4 + r() * 0.25, h = 0.5 + r() * 0.35; P.cloth.push([new THREE.PlaneGeometry(w, h), [0xe0d8c8, 0x8a3a2a, 0x3a5a7a, 0xc9a24a, 0x6a7a4a, 0xd8d0e0][Math.floor(r() * 6)], M4(lerp(ax, bx, t), ys + 1.7 - h / 2, lerp(az, bz, t), (r() - 0.5) * 0.1, yaw, 0)]); }
  }
  // the scars: render fallen to the brick, bullet holes round the windows that face the fighting, a shell's burst, soot over a burnt window
  const dec = (wl, s, y, w, h, cell, flip = false) => crQuad(wl, s, y, w, h, F + 0.012, cell, P.decal, flip);
  for (let k = 0; k < 2; k++) { const wl = WL[Math.floor(r() * 4)], w = 0.8 + r() * 0.8, h = 0.55 + r() * 0.45; for (let n = 0; n < 10; n++) { const s = lerp(wl.e0 + 0.6 + w / 2, wl.e1 - 0.6 - w / 2, r()), y = y0 + 0.5 + r() * (yt - y0 - 1.3); if (free(wl, s - w / 2, s + w / 2, 0.2)) { dec(wl, s, y, w, h, 0); break; } } }
  for (const wl of WL) for (const [g0, g1, kind] of wl.gaps) if (kind === 'win' && (wl.n[0] > 0.5 || wl.n[1] === (H.door === 's' ? 1 : -1)) && r() < 0.6) dec(wl, (g0 + g1) / 2 + (r() - 0.5) * 0.5, y0 + 2.75 + r() * 0.3, 1.5, 1.0, 2);
  if (st.scar) { const wl = WL[Math.floor(r() * 4)]; for (let n = 0; n < 10; n++) { const s = lerp(wl.e0 + 1.4, wl.e1 - 1.4, r()); if (free(wl, s - 0.85, s + 0.85, 0.1)) { dec(wl, s, y0 + 2.6 + r() * 0.8, 1.7, 1.7, 1); rubble(wl, s, 8, 1.4); break; } } }
  if (st.burnt) for (const wl of WL) for (const [g0, g1, kind] of wl.gaps) if (kind === 'win' && r() < 0.35) dec(wl, (g0 + g1) / 2, y0 + 2.2 + 0.8, 1.7, 1.6, 3);
}
/* a house: sp = { id, x, z, w, d (local centre and size), st (its look), doors: [{ w: 'n'|'s'|'e'|'w', at: the world coordinate along that
   wall, k: 'door'|'shut'|'bag' }], wins: { wall: 'a' (two, at the quarters, clear of the doors) or [world coordinates] }, part: 'z' (a partition
   across the long side, a 2.4 m opening in its middle) or null, front: the side its front is on, guard: [x, z, fx, fz] - the man inside } */
function crHouse(sp, P, C, r) {
  const { x, z, w, d } = sp, T = CR_WT, x0 = x - w / 2, x1 = x + w / 2, z0 = z - d / 2, z1 = z + d / 2;
  // the floor sits just above the highest ground under the house, the walls go down into it
  let g = -1e9; for (const [a, b] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1], [x, z]]) g = Math.max(g, groundAt(...CW(a, b)));
  const st = CR_VSTYLE[sp.st], y0 = g + 0.12, yb = g - 0.7, yt = y0 + CR_HH + st.dh, H = { id: sp.id, x, z, w, d, door: sp.front || 's', y: y0, yt, win: [], guard: null, box: [x0, x1, z0, z1] };
  const LX = w + T, LZ = d - T, o = { n: x0 - T / 2, s: x0 - T / 2, w: z0 + T / 2, e: z0 + T / 2 }, Ln = { n: LX, s: LX, w: LZ, e: LZ }, gaps = { n: [], s: [], w: [], e: [] };
  for (const dr of sp.doors) { const s = dr.at - o[dr.w]; gaps[dr.w].push([s - CR_DOOR / 2, s + CR_DOOR / 2, dr.k || 'door']); }
  for (const k of ['n', 's', 'w', 'e']) { const ws = sp.wins && sp.wins[k] !== undefined ? sp.wins[k] : 'a', list = ws === 'a' ? [Ln[k] * 0.25, Ln[k] * 0.75] : ws.map((c) => c - o[k]);
    for (const c of list) { if (gaps[k].some(([g0, g1]) => c + CR_WIN / 2 + 0.5 > g0 && c - CR_WIN / 2 - 0.5 < g1)) continue; gaps[k].push([c - CR_WIN / 2, c + CR_WIN / 2, 'win']); } }
  const pt = (out) => ({ out, c: st.c, band: st.band, in: CR_IN });
  crWall(x0 - T / 2, z0, x1 + T / 2, z0, yb, y0, yt, gaps.n, P, T, pt([0, -1])); crWall(x0 - T / 2, z1, x1 + T / 2, z1, yb, y0, yt, gaps.s, P, T, pt([0, 1]));
  crWall(x0, z0 + T / 2, x0, z1 - T / 2, yb, y0, yt, gaps.w, P, T, pt([-1, 0])); crWall(x1, z0 + T / 2, x1, z1 - T / 2, yb, y0, yt, gaps.e, P, T, pt([1, 0]));
  const rec = (k, f) => { for (const [g0, g1, kd] of gaps[k]) if (kd === 'win') H.win.push(Object.assign(f((g0 + g1) / 2), { wall: k })); };
  rec('n', (s) => ({ x: o.n + s, z: z0, nx: 0, nz: -1 })); rec('s', (s) => ({ x: o.s + s, z: z1, nx: 0, nz: 1 }));
  rec('w', (s) => ({ x: x0, z: o.w + s, nx: -1, nz: 0 })); rec('e', (s) => ({ x: x1, z: o.e + s, nx: 1, nz: 0 }));
  // inside: one partition across the long side with a 2.4 m opening in its middle - the house is two rooms, one after the other
  const wash = { out: null, c: CR_IN, band: null, in: CR_IN };
  if (sp.part === 'z') crWall(x, z0 + T / 2, x, z1 - T / 2, yb, y0, yt - 0.02, [[LZ / 2 - 1.2, LZ / 2 + 1.2, 'door']], P, 0.45, wash);
  // the floor; the roof slab keeps a collider of its own (its look, the parapet and everything on the roof come from crVDress)
  { const [a, b] = CW(x0 + T / 2, z0 + T / 2), [c, e] = CW(x1 - T / 2, z1 - T / 2); P.floor.push([boxUV(a, c, y0 - 0.14, y0, b, e, 2, 2), 0x6a5a44]); addFloor(a, c, b, e, y0); }
  { const [a, b] = CW(x0 - T / 2 - 0.15, z0 - T / 2 - 0.15), [c, e] = CW(x1 + T / 2 + 0.15, z1 + T / 2 + 0.15); addCollider((a + c) / 2, (b + e) / 2, (c - a) / 2, (e - b) / 2, 0, yt + 0.32, yt); }
  const WL = [{ o: [o.n, z0], t: [1, 0], n: [0, -1], L: LX, gaps: gaps.n, e0: 0, e1: LX, front: H.door === 'n' }, { o: [o.s, z1], t: [1, 0], n: [0, 1], L: LX, gaps: gaps.s, e0: 0, e1: LX, front: H.door === 's' },
    { o: [x0, o.w], t: [0, 1], n: [-1, 0], L: LZ, gaps: gaps.w, e0: -T, e1: LZ + T, front: H.door === 'w' }, { o: [x1, o.e], t: [0, 1], n: [1, 0], L: LZ, gaps: gaps.e, e0: -T, e1: LZ + T, front: H.door === 'e' }];
  crVDress(H, st, WL, P, r, y0, yt, yb);
  // a few things in the rooms, against the side walls, away from the doorways and the opening between the rooms
  if (sp.part === 'z') for (const [ox, kind] of [[x0 + T / 2 + 0.55, 0], [x1 - T / 2 - 0.6, 1]]) { const [px, pz] = CW(ox, z + (kind ? -1.6 : 1.6));
    if (kind === 0) { P.wood.push([new THREE.BoxGeometry(0.7, 0.6, 1.0).translate(px, y0 + 0.3, pz), 0x7a5a38]); addCollider(px, pz, 0.35, 0.5, 0, y0 + 0.6, y0); }
    else for (let k = 0; k < 3; k++) P.floor.push([G.cyl(0.24, 0.3, 0.7, 10), 0x9a6a44, M4(px, y0 + 0.35, pz + (k - 1) * 0.55)]); }
  { const [px, pz] = CW(x + (sp.part ? 3 : 0) + (r() - 0.5), z + (r() - 0.5)); P.floor.push([new THREE.BoxGeometry(1.8, 0.03, 1.2).rotateY(r() * 3).translate(px, y0 + 0.02, pz), 0x8a3a2a]); }
  // cover for whoever fights around it outside, and beside each open doorway inside: a man flat against the jamb leans out to fire
  { const [cx, cz] = CW(x, z); coverBox(cx, cz, w / 2 + T / 2, d / 2 + T / 2, 0, 2.4); }
  for (const k of ['n', 's']) for (const [g0, g1, kd] of gaps[k]) { if (kd !== 'door') continue; const zw = k === 's' ? z1 : z0, nz = k === 's' ? 1 : -1, dx = o[k] + (g0 + g1) / 2, zi = zw - nz * (T / 2 + 0.45);
    for (const sd of [-1, 1]) { const [qx, qz] = CW(dx + sd * (CR_DOOR / 2 + 0.45), zi), [px, pz] = CW(dx + sd * (CR_DOOR / 2 - 0.3), zi + nz * 0.2); COVER.push({ x: qx, z: qz, nx: 0, nz, h: 2.4, by: null, px, pz, door: true }); } }
  // the window bays: where an Egyptian waits for the advance, and where our men stand on the night
  for (const wn of H.win) { const bx = wn.x - wn.nx * (T / 2 + 0.55), bz = wn.z - wn.nz * (T / 2 + 0.55), [sx, sz] = CW(bx, bz), [px, pz] = CW(bx + wn.nx * 0.2, bz + wn.nz * 0.2), [hx, hz] = CW(bx - wn.nx * 0.7, bz - wn.nz * 0.7);
    const s = { x: sx, z: sz, y: y0, nx: wn.nx, nz: wn.nz, f: 0, b: null, used: false, fox: true, p: [px, pz], h: [hx, hz], grp: 'V', hi: sp.id }; C.slots.push(s); wn.slot = s; }
  // the man inside, waiting in the second room for whoever comes through the opening
  if (sp.guard) { const [gx, gz, fx, fz] = sp.guard, [sx, sz] = CW(gx, gz), [px, pz] = CW(gx + fx * 0.2, gz + fz * 0.2), [hx, hz] = CW(gx - fx * 0.5, gz - fz * 0.5);
    const s = { x: sx, z: sz, y: y0, nx: fx, nz: fz, f: 0, b: null, used: false, fox: true, p: [px, pz], h: [hx, hz], grp: 'G', hi: sp.id }; C.slots.push(s); H.guard = s; }
  return H;
}
// a plain wall of the yards and lanes, 2.4 m of mud brick on its own ground: straight runs between the points, with breaches [from, to] (world
// coordinates along the run). Colliders come with it: higher than a man can jump
function crYardWall(pts, P, gaps = [], h = 2.4, col = 0xb9a27e, r = null) {
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, az] = pts[i], [bx, bz] = pts[i + 1], alongX = Math.abs(bz - az) < 1e-6, L = alongX ? Math.abs(bx - ax) : Math.abs(bz - az), sg = alongX ? Math.sign(bx - ax) : Math.sign(bz - az);
    // a long run is cut into pieces of 10 m or less, each standing on the ground under it
    const n = Math.max(1, Math.ceil(L / 10));
    for (let k = 0; k < n; k++) {
      const s0 = (L * k) / n, s1 = (L * (k + 1)) / n, pa = alongX ? [ax + sg * s0, az] : [ax, az + sg * s0], pb = alongX ? [ax + sg * s1, az] : [ax, az + sg * s1];
      let gmin = 1e9, gmax = -1e9; for (let u = 0; u <= 1.001; u += 0.25) { const gy = groundAt(...CW(lerp(pa[0], pb[0], u), lerp(pa[1], pb[1], u))); gmin = Math.min(gmin, gy); gmax = Math.max(gmax, gy); }
      const gl = []; for (const [g0, g1] of gaps) { const c0 = alongX ? g0 : g0, c1 = alongX ? g1 : g1, q0 = (c0 - (alongX ? pa[0] : pa[1])) * sg, q1 = (c1 - (alongX ? pa[0] : pa[1])) * sg, lo = Math.min(q0, q1), hi = Math.max(q0, q1); if (hi > 0 && lo < s1 - s0) gl.push([Math.max(0, lo), Math.min(s1 - s0, hi), 'gap']); }
      crWall(pa[0], pa[1], pb[0], pb[1], gmin - 0.5, gmax, gmax + h, gl, P, 0.42, { out: null, c: col, band: null, in: col });
      // the coping: a course of brick along the top
      { const [p0, q0] = CW(Math.min(pa[0], pb[0]), Math.min(pa[1], pb[1])), [p1, q1] = CW(Math.max(pa[0], pb[0]), Math.max(pa[1], pb[1])); P.conc.push([boxUV(alongX ? p0 : p0 - 0.26, alongX ? p1 : p0 + 0.26, gmax + h, gmax + h + 0.1, alongX ? q0 - 0.26 : q0, alongX ? q0 + 0.26 : q1, 1, 1), crMix(col, 0x8a7a62, 0.3)]); }
      // a breach leaves its bricks in the dust at its foot
      if (r) for (const [g0, g1] of gl) for (let q = 0; q < 9; q++) { const s = g0 + (g1 - g0) * r(), lat = (r() - 0.5) * 2.4, [wx, wz] = CW(alongX ? pa[0] + sg * s : pa[0] + lat, alongX ? pa[1] + lat : pa[1] + sg * s), qs = 0.1 + r() * 0.16; P.conc.push([new THREE.DodecahedronGeometry(qs, 0), [col, 0x9a5a40, CR_RAWC][Math.floor(r() * 3)], M4(wx, groundAt(wx, wz) + qs * 0.4, wz, r() * 3, r() * 3, r() * 3, 1, 0.7, 1.2)]); }
    }
  }
}
/* coils of barbed wire, three to a fence (two side by side, one on top, 1.7 m high), on their pickets, following the ground: nobody climbs them
   and nobody jumps them. Returns the meshes and the colliders, so a stage can lift them (the engineers clear the street for the tanks) */
const CR_COIL = (() => { const g = new THREE.TorusGeometry(0.46, 0.011, 3, 12); g.rotateY(Math.PI / 2); return g; })();
function crWire(pts) {
  const d = densify(pts, 0.21), M = [], q = new THREE.Quaternion(), e = new THREE.Euler(), one = V3(1, 1, 1), cols = [], stakes = [];
  for (let i = 0; i < d.length; i++) {
    const a = d[Math.max(0, i - 1)], b = d[Math.min(d.length - 1, i + 1)], hd = Math.atan2(b[0] - a[0], b[1] - a[1]), nx = Math.cos(hd), nz = -Math.sin(hd), [wx, wz] = CW(d[i][0], d[i][1]), gy = groundAt(wx, wz);
    for (const [lat, y, ph] of [[-0.42, 0.45, 0], [0.42, 0.45, 1.3], [0, 1.22, 2.1]]) { e.set(0, hd + Math.PI / 2 + Math.sin(i * 0.9 + ph) * 0.38, Math.sin(i * 1.7 + ph) * 0.12, 'YXZ'); q.setFromEuler(e); M.push(new THREE.Matrix4().compose(V3(wx + nx * lat, gy + y, wz + nz * lat), q, one)); }
    if (i % 14 === 0) for (const sd of [-1, 1]) stakes.push([G.box(0.05, 1.5, 0.05), 0x4a4238, M4(wx + nx * sd * 0.5, gy + 0.6, wz + nz * sd * 0.5, sd * 0.25 * nz, 0, -sd * 0.25 * nx)]);
  }
  for (let i = 0; i < pts.length - 1; i++) { const [ax, az] = pts[i], [bx, bz] = pts[i + 1], L = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.ceil(L / 2));
    for (let k = 0; k < n; k++) { const pa = [lerp(ax, bx, k / n), lerp(az, bz, k / n)], pb = [lerp(ax, bx, (k + 1) / n), lerp(az, bz, (k + 1) / n)], [wa, va] = CW(...pa), [wb, vb] = CW(...pb), g0 = Math.min(groundAt(wa, va), groundAt(wb, vb)), g1 = Math.max(groundAt(wa, va), groundAt(wb, vb));
      cols.push(addCollider((wa + wb) / 2, (va + vb) / 2, Math.hypot(wb - wa, vb - va) / 2 + 0.1, 0.55, Math.atan2(-(vb - va), wb - wa), g1 + 1.75, g0 - 1)); } }
  const im = new THREE.InstancedMesh(CR_COIL, new THREE.MeshStandardMaterial({ color: 0x5a544c, roughness: 0.55, metalness: 0.6 }), M.length); M.forEach((m4, k) => im.setMatrixAt(k, m4)); im.instanceMatrix.needsUpdate = true; im.computeBoundingSphere(); im.userData.dyn = true; scene.add(onLayer1(im));
  const sm = new THREE.Mesh(build(stakes), MAT.vc); sm.userData.dyn = true; scene.add(SH(onLayer1(sm)));
  return { mesh: [im, sm], cols };
}
// the things the stages switch on and off: meshes and colliders kept outside the saves (a save holds only CR's flags, crDynApply puts them back)
const CR_DYN = {};
function crDyn(name, mesh, cols) { CR_DYN[name] = { mesh: [].concat(mesh || []), cols: cols.map((k) => ({ k, top: k.top })) }; }
function crDynSet(name, on) { const g = CR_DYN[name]; if (!g) return; for (const m of g.mesh) m.visible = on; for (const c of g.cols) c.k.top = on ? c.top : -1e9; }
// what stands when: the street's wire and the walls round the place the jeeps stop belong to the advance; on the night the engineers have cut them
// for the tanks, the north door of the house at the head is shut and barred behind our men, and the gates in the lanes are shut till the tanks come
function crDynApply() {
  const s = CR.stage; crDynSet('wire', s <= 2); crDynSet('box', s <= 2); crDynSet('doorN', CR.doorN); crDynSet('gates', s <= 3);
  const C = CHAP.cross; if (C.jeepCol) C.jeepCol.top = s === 2 ? C.jeepColTop : -1e9;
}
function crVillage(P, C, parts) {
  const r = rng(4417), T = CR_WT; C.vh = {};
  // the street's houses: the route's six with their doors open front and back, the rest shut
  for (const h of CR_VH) {
    const x = CR_COLS[h.c], z = h.sd * (CR_FZ + CR_HD / 2), fw = h.sd > 0 ? 'n' : 's', bw = h.sd > 0 ? 's' : 'n', k = h.open ? 'door' : 'shut';
    const doors = [{ w: fw, at: x + h.fd, k }]; if (h.bd !== null) doors.push({ w: bw, at: x + h.bd, k });
    let guard = null;
    if (h.open) { const ent = h.in === 'b' ? h.bd : h.fd, sg = Math.sign(ent), back = h.in === 'b' ? h.sd : -h.sd, gx = x - sg * 3.9, gz = z + back * 2.3, l = Math.hypot(sg * 3.9, back * 2.3); guard = [gx, gz, (sg * 3.9) / l, (-back * 2.3) / l]; }
    C.vh[h.id] = crHouse({ id: h.id, x, z, w: CR_HW, d: CR_HD, st: h.st, front: fw, doors, part: 'z', guard, wins: { n: 'a', s: 'a', e: h.c === 0 ? 'a' : [], w: [] } }, P, C, r);
  }
  // the house at the head of the street: two windows each side of its barricaded door on the junction, two looking back down the street, its
  // north door from the yard beside it (the way in; shut behind our men on the night)
  { const D = CR_D, x0 = D.x - D.w / 2, x1 = D.x + D.w / 2;
    C.vh.D = crHouse({ id: 'D', x: D.x, z: D.z, w: D.w, d: D.d, st: 8, front: 'w', doors: [{ w: 'w', at: 0, k: 'bag' }, { w: 'n', at: D.x, k: 'door' }], part: null, wins: { w: [-8, -4, 4, 8], e: [-3, 3], n: [x0 + 1.8], s: [x0 + 2.5, x1 - 2.5] } }, P, C, r);
    // two pillars hold its roof
    for (const zz of [-5.5, 5.5]) { const [px, pz] = CW(D.x, zz), y0 = C.vh.D.y; P.conc.push([G.box(0.45, CR_HH, 0.45), CR_RAWC, M4(px, y0 + CR_HH / 2, pz)]); addCollider(px, pz, 0.23, 0.23, 0, y0 + CR_HH, y0 - 0.5); }
    // the north door: its iron leaves, swung shut and barred on the night
    { const y0 = C.vh.D.y, [ax, az] = CW(D.x - CR_DOOR / 2, D.z - D.d / 2), [bx] = CW(D.x + CR_DOOR / 2, 0), dm = new THREE.Mesh(build([[G.box(CR_DOOR / 2 - 0.02, 2.36, 0.06), CR_VSTYLE[8].dr, M4(ax + CR_DOOR / 4, y0 + 1.2, az)], [G.box(CR_DOOR / 2 - 0.02, 2.36, 0.06), CR_VSTYLE[8].dr, M4(bx - CR_DOOR / 4, y0 + 1.2, az)], [G.box(CR_DOOR + 0.5, 0.14, 0.1), 0x6a5236, M4((ax + bx) / 2, y0 + 1.25, az + 0.12)]]), MAT.vc);
      dm.userData.dyn = true; scene.add(SH(onLayer1(dm))); crDyn('doorN', dm, [addCollider((ax + bx) / 2, az, CR_DOOR / 2, 0.32, 0, y0 + 2.4, y0 - 0.7)]); }
    // its two defenders on the day, inside, watching the north door
    C.dIn = [[-243.6, 2.8], [-236.8, 7.0]].map(([gx, gz]) => { const l = Math.hypot(D.x - gx, -D.d / 2 - gz), fx = (D.x - gx) / l, fz = (-D.d / 2 - gz) / l, [sx, sz] = CW(gx, gz), [px, pz] = CW(gx + fx * 0.2, gz + fz * 0.2), [hx, hz] = CW(gx - fx * 0.5, gz - fz * 0.5);
      const s = { x: sx, z: sz, y: C.vh.D.y, nx: fx, nz: fz, f: 0, b: null, used: false, fox: true, p: [px, pz], h: [hx, hz], grp: 'G', hi: 'D' }; C.slots.push(s); return s; });
    // inside: ammunition boxes and a few sandbags under the windows on the junction
    for (const zz of [-8, -4, 4, 8]) { const [bx, bz] = CW(x0 + 0.95, zz), y0 = C.vh.D.y; bagWall([[bx, bz - 0.55], [bx, bz + 0.55]], 2, y0 - 0.05, false); }
    for (const [lx, lz] of [[-236, -7], [-236.2, 7.5], [-243.5, 9.6]]) { const [px, pz] = CW(lx, lz), y0 = C.vh.D.y; P.wood.push([G.box(0.8, 0.45, 0.5), 0x5a5a3a, M4(px, y0 + 0.22, pz)], [G.box(0.8, 0.45, 0.5), 0x5f5f3e, M4(px + 0.1, y0 + 0.67, pz + 0.05)]); addCollider(px, pz, 0.45, 0.3, 0, y0 + 0.9, y0); } }
  // the yards: a wall at the back of each row, walls between the yards, breaches where the route goes through
  const Y = CR_YZ, F = CR_FZ + CR_HD, E = -154, mids = [-166.5, -179.5, -192.5, -205.5, -218.5, -232.5];
  for (const sd of [-1, 1]) {
    crYardWall([[E, sd * Y], [-232.5, sd * Y]], P);   // the back line
    crYardWall([[E, sd * F], [E, sd * Y]], P, sd > 0 ? [[17.6, 21.6]] : [], 2.4, 0xb9a27e, r);   // the east end: the way into the first yard
    // (between two houses the gap is a slit of 40 cm, too narrow for a man: the walls between the yards start at the houses' backs; the last
    // one, beside the house at the head, runs from the street front)
    mids.forEach((mx, i) => { const gap = (sd < 0 && i === 1) || (sd > 0 && i === 3) || (sd < 0 && i === 5) ? [[sd * 17.6, sd * 21.6]] : []; crYardWall([[mx, sd * (i === 5 ? CR_FZ : F)], [mx, sd * Y]], P, gap, 2.4, 0xb9a27e, r); });
    // the strip between the last house and the house at the head: shut to the street
    crYardWall([[-231, sd * CR_FZ], [-234, sd * CR_FZ]], P);
    // the yards of the house at the head: its north yard is reached from the last house's yard; the south one is shut
    crYardWall([[-232.5, sd * Y], [CR_LX0, sd * Y]], P); crYardWall([[CR_LX0, sd * (CR_D.d / 2)], [CR_LX0, sd * Y]], P);
  }
  // the junction: the cross-lane between walls, the road from the west between walls; gates in the lanes' east walls (shut till the tanks come)
  { const LZ = CR_LZ, gz0 = 40, gz1 = 46;
    for (const sd of [-1, 1]) {
      crYardWall([[CR_LX0, sd * Y], [CR_LX0, sd * gz0]], P); crYardWall([[CR_LX0, sd * gz1], [CR_LX0, sd * LZ]], P);
      crYardWall([[CR_LX1, sd * 6], [CR_LX1, sd * LZ]], P); crYardWall([[CR_LX1, sd * 6], [-302, sd * 6]], P);
    }
    const gl = [], gc = []; for (const sd of [-1, 1]) { const [gx, gzw] = CW(CR_LX0, sd * (gz0 + gz1) / 2), y = groundAt(gx, gzw); gl.push([G.box(0.12, 2.2, 2.95), 0x5a4a36, M4(gx, y + 1.1, gzw - 1.5)], [G.box(0.12, 2.2, 2.95), 0x5e4e38, M4(gx, y + 1.1, gzw + 1.5)], [G.box(0.16, 0.16, 6.1), 0x4a3c2c, M4(gx - 0.08, y + 1.6, gzw)]); gc.push(addCollider(gx, gzw, 0.3, 3.05, 0, y + 2.4, y - 0.7)); }
    const gm = new THREE.Mesh(build(gl), MAT.vc); gm.userData.dyn = true; scene.add(SH(onLayer1(gm))); crDyn('gates', gm, gc); }
  // the street is cut by wire between the crossings: the only way on is through the houses
  // (and Czech hedgehogs in front of it)
  { const ms = [], cs = []; for (const wx of CR_WIRE) { const w = crWire([[wx, -CR_FZ + 0.35], [wx, CR_FZ - 0.35]]); ms.push(...w.mesh); cs.push(...w.cols); }
    const hh = []; for (const wx of CR_WIRE) for (const lz of [-3.6, 0.2, 3.9]) { const [x, z] = CW(wx + 1.0 + (lz > 0 ? 0.3 : -0.2), lz), y = groundAt(x, z); hh.push(new THREE.Matrix4().compose(V3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, lz * 0.7, 0)), V3(1, 1, 1))); }
    if (mdlHas('hedgehog')) for (const m of mdlInst('hedgehog', 0, hh)) { m.userData.dyn = true; ms.push(m); }
    crDyn('wire', ms, cs); }
  // a well and oil drums in the junction, a palm or two in the yards
  { const [wx, wz] = CW(-255, -14), y = groundAt(wx, wz); parts.push([G.cyl(0.9, 0.95, 0.85, 14), 0xa89878, M4(wx, y + 0.42, wz)], [G.cyl(0.7, 0.7, 0.05, 12), 0x222a2a, M4(wx, y + 0.86, wz)]); addCollider(wx, wz, 0.9, 0.9, 0, y + 0.85); coverBox(wx, wz, 0.9, 0.9, 0, 0.85); }
  for (const [x, z] of [[-251, 15], [-258.5, -40], [-249, 62], [-275, -4.6]]) { const [wx, wz] = CW(x, z); fieldDrums(wx, wz, 3); }
  { const pl = []; for (const [x, z] of [[-161, 21], [-185, -20], [-200, 21], [-214, -20], [-226, 20], [-240, -20], [-170, -21], [-240, 18]]) { const [wx, wz] = CW(x, z); pl.push([wx, wz, 0.85 + r() * 0.3, r() * 6]); } palms(pl); }
  // sabra hedges behind the yards' back walls on both sides and round the street's east end - where nobody walks, clear of the cross-lane
  { const sr = rng(97), sl = []; for (let x = -240; x < -153; x += 2.6 + sr() * 1.2) for (const sd of [-1, 1]) if (sr() > 0.18) { const [wx, wz] = CW(x + sr(), sd * (29.4 + sr() * 1.6)); sl.push([wx, wz, 0.9 + sr() * 0.45, sr() * 6]); }
    for (let z = 10; z < 28; z += 2.8) for (const sd of [-1, 1]) if (sr() > 0.25) { const [wx, wz] = CW(-147.5 + sr() * 1.5, sd * z); sl.push([wx, wz, 0.85 + sr() * 0.4, sr() * 6]); } sabras(sl); }
  // the street's power line, a wire from a pole to the parapet of each house on the south side
  { powerLine([[-152, 5.1], [-232, 5.1]].map(([x, z]) => CW(x, z)), 40, 7); const segs = [];
    for (const h of CR_VH) { if (h.sd < 0) continue; const H = C.vh[h.id], hx = CR_COLS[h.c] + 4.5, px = -152 - 40 * Math.round((-152 - hx) / 40), [ax, az] = CW(px, 5.1), [bx, bz] = CW(hx, CR_FZ - 0.3), ya = groundAt(ax, az) + 7 - 0.4, yb = H.yt + 0.9;
      for (let k = 0; k < 10; k++) { const t0 = k / 10, t1 = (k + 1) / 10, sag = (t) => -Math.sin(t * Math.PI) * 0.55; segs.push(V3(lerp(ax, bx, t0), lerp(ya, yb, t0) + sag(t0), lerp(az, bz, t0)), V3(lerp(ax, bx, t1), lerp(ya, yb, t1) + sag(t1), lerp(az, bz, t1))); }
      parts.push([G.box(0.06, 0.25, 0.06), 0x2e2c28, M4(bx, yb - 0.1, bz)]); }
    scene.add(onLayer1(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(segs), new THREE.LineBasicMaterial({ color: 0x2a2724 })))); }
  // where the jeeps stop: fences of wire from the village's corners to the water, a gap for the track that the second jeep parks in. With the canal on the east, the street's wire and the yard walls, the only way on from here is into the first yard
  { const ms = [], cs = [];
    for (const sd of [-1, 1]) for (const sg of sd > 0 ? [[[E, Y], [-149.7, Y]], [[-146.7, Y], [-88, Y]]] : [[[E, -Y], [-88, -Y]]]) { const w = crWire(sg); ms.push(...w.mesh); cs.push(...w.cols); }
    crDyn('box', ms, cs);
    const [jx, jz] = CW(-148.2, Y), gy = groundAt(jx, jz); C.jeepColTop = gy + 2.2; C.jeepCol = addCollider(jx, jz, 1.55, 0.6, 0, C.jeepColTop, gy - 1); }
}
// the roller bridge: one segment = a big steel float (the "roller") under a deck with side rails
const BR_SEG = build([[G.box(6.2, 0.35, 5.0), 0x5d604a, M4(0, 1.78, 0)], [G.cyl(1.25, 1.25, 4.6, 18), 0x4b4e3e, M4(0, 0.5, 0, Math.PI / 2, 0, 0)], [G.cyl(1.28, 1.28, 0.18, 18), 0x2f3229, M4(0, 0.5, 2.3, Math.PI / 2, 0, 0)], [G.cyl(1.28, 1.28, 0.18, 18), 0x2f3229, M4(0, 0.5, -2.3, Math.PI / 2, 0, 0)],
  ...[-1, 1].flatMap((sd) => [[G.box(6.2, 0.16, 0.14), 0x3f4236, M4(0, 2.85, sd * 2.5)], [G.box(6.2, 0.16, 0.14), 0x3f4236, M4(0, 2.35, sd * 2.5)], [G.box(0.16, 0.95, 0.16), 0x3f4236, M4(-3.0, 2.4, sd * 2.5)], [G.box(0.16, 0.95, 0.16), 0x3f4236, M4(0, 2.4, sd * 2.5)], [G.box(1.3, 0.12, 0.12), 0x3f4236, M4(-1.5, 2.4, sd * 2.5, 0, 0, 0.6)], [G.box(1.3, 0.12, 0.12), 0x3f4236, M4(1.5, 2.4, sd * 2.5, 0, 0, -0.6)]]), [G.box(0.3, 0.5, 5.2), 0x34372c, M4(3.0, 1.6, 0)]]);
const BR_FRONT = build([[G.cyl(0.05, 0.05, 4.2, 6), 0x2a2a28, M4(0, 3.6, 2.3)], [G.box(0.04, 0.7, 1.1), 0xe8641e, M4(0, 5.2, 2.85)], [G.cyl(0.05, 0.05, 4.2, 6), 0x2a2a28, M4(0, 3.6, -2.3)], [G.box(0.04, 0.7, 1.1), 0xe8641e, M4(0, 5.2, -2.85)]]);
const JEEP_MG = build([[G.box(0.1, 0.13, 0.95), 0x1d1d1b, M4(0, 0, -0.35)], [G.cyl(0.024, 0.024, 0.75, 6), 0x151515, M4(0, 0.012, -1.17, Math.PI / 2, 0, 0)], [G.cyl(0.04, 0.04, 0.3, 8), 0x2a2a28, M4(0, 0.012, -0.95, Math.PI / 2, 0, 0)], [G.box(0.07, 0.2, 0.1), 0x24221f, M4(0, -0.13, -0.05)], [G.box(0.17, 0.11, 0.26), 0x2a2a24, M4(0, 0.07, -0.5)], [G.box(0.2, 0.15, 0.2), 0x4a4c3a, M4(-0.16, -0.03, -0.5)], [G.box(0.05, 0.08, 0.05), 0x1a1a1a, M4(0, 0.1, -1.45)]]);
// the pontoon bridge: 8 m uniflote pontoons pinned end to end, the roadway on them with its kerbs, a ramp down to each bank
const CR_PBSEG = build([[G.box(7.85, 0.85, 6.4), 0x5f6450, M4(0, 0.05, 0)], [G.box(7.9, 0.1, 4.4), 0x8a8a78, M4(0, 0.88, 0)], ...[-1.4, -0.45, 0.45, 1.4].map((zz) => [G.box(7.9, 0.03, 0.5), 0x9a9886, M4(0, 0.94, zz)]), ...[-1, 1].flatMap((sd) => [[G.box(7.9, 0.22, 0.22), 0x4a4c3e, M4(0, 1.02, sd * 2.25)], [G.box(7.85, 0.3, 0.9), 0x565b48, M4(0, 0.62, sd * 2.75)], [G.cyl(0.09, 0.11, 0.35, 8), 0x2a2b26, M4(-3.4, 0.98, sd * 2.95)], [G.cyl(0.09, 0.11, 0.35, 8), 0x2a2b26, M4(3.4, 0.98, sd * 2.95)]]), [G.box(0.18, 0.12, 4.4), 0x2e3028, M4(3.93, 0.9, 0)]]);
const CR_PBRAMP = build([[G.box(7.0, 0.22, 4.4), 0x8a8a78, M4(0, 0, 0)], [G.box(7.0, 0.2, 0.2), 0x3a3c30, M4(0, 0.16, 2.25)], [G.box(7.0, 0.2, 0.2), 0x3a3c30, M4(0, 0.16, -2.25)]]);
// the deck a vehicle drives on: the pontoon bridge (by day) - its roadway, with a ramp at each end down to the bank
function crPBDeck(x, z) { const lx = x - CR.o.x, lz = z - CR.o.z; if (Math.abs(lz - CR_PB_Z) > 3.4 || Math.abs(lx) > 107) return null; const a = Math.abs(lx); return a <= 100 ? CR_PB_Y : lerp(CR_PB_Y, Math.max(CR_PB_Y, groundAt(x, z)), (a - 100) / 7); }
// an Egyptian tank knocked out in the fields: the T-55 model, burnt, crooked, smouldering
function crWreckT55(lx, lz, hd, r) {
  const [x, z] = CW(lx, lz); if (!(typeof VEH_DATA !== 'undefined' && VEH_DATA.t55)) return placeTank(x, z, hd, TANK_BURNT);
  const rec = vehModel('t55', 'e'), m = rec.g; m.position.set(x, groundAt(x, z), z); m.rotation.y = -THREE.MathUtils.degToRad(hd) + Math.PI / 2; rec.crew = false; rec.dead = true; vehDamage(rec, true); m.traverse((o) => { if (o.isMesh) o.material = MAT_BURNT; });
  scene.add(SH(onLayer1(m))); wreckTilt(m, r); wreckFire(m, VEH_FIRE.t55, 1.4); addCollider(x, z, 3.4, 1.8, m.rotation.y, groundAt(x, z) + 2.3); coverBox(x, z, 3.4, 1.8, m.rotation.y, 2.1); return m;
}
function crBuild() {
  const C = CHAP.cross; C.ground = makeGround({ x0: CR.o.x - 440, x1: CR.o.x + 345, z0: CR.o.z - 160, z1: CR.o.z + 450, step: 1.9, h: mapH('cross', crNat, crCarve), map: 'cross', vegOk: (x, z) => { const lx = x - CR.o.x, lz = z - CR.o.z; return Math.abs(lx) > 106 && Math.abs(lz) > 5 && Math.abs(lz - CR_PB_Z) > 6 && Math.abs(lx - CR_BRIDGE) > 12 && !crInVillage(lx, lz, 6) && !(lx > -158 && lx < -94 && Math.abs(lz) < 27); }, grass: 'farm', grassOk: (x, z) => { const lx = x - CR.o.x, lz = z - CR.o.z; return Math.abs(lx) > 106 && Math.abs(lz - CR_PB_Z) > 6 && Math.abs(lx - CR_BRIDGE) > 12 && !crInVillage(lx, lz, 1.5); }, tint: [[0.36, 0.43, 0.22], 0.4] }); GROUND = C.ground;
  const BAGS = [], sv = BATCH.bag; BATCH.bag = BAGS; const k0 = COVER.length; C.slots = [];
  // the trench on the rampart between the bridges: sandbag lips, traverses, bunkers, the Egyptian flag
  { const line = []; for (let lz = CR_TZ0; lz <= CR_TZ1; lz += 2.5) line.push([crTX(lz), lz]); const W = (dx) => line.map(([x, z]) => CW(x + dx, z));
    bagWall(W(-2.9), 4, null, true); bagWall(W(2.9), 3, null, true); if (!LITE) { bagWall(W(-3.35), 3, null, false); bagWall(W(3.35), 2, null, false); }
    bagWall(W(-1.55), LITE ? 1 : 2, null, false);
    for (let lz = CR_TZ0 + 6; lz <= CR_TZ1 - 4; lz += 8.5) { const tx = crTX(lz), [ax, az] = CW(tx - 2.1, lz + 0.9), [bx, bz] = CW(tx - 0.25, lz + 0.9), g = groundAt(...CW(tx - 1, lz)); bagWall([[ax, az], [bx, bz]], 4, g - 0.05, true); }
    const bk = []; for (const [lz, sd] of [[150, 1], [100, -1], [228, 1]]) { const tx = crTX(lz), [wx, wz] = CW(tx + sd * 5.9, lz), y = groundAt(wx, wz) - 0.3; bk.push([G.box(4.2, 1.7, 3.6), 0x8e8468, M4(wx, y + 0.85, wz)], [G.box(4.6, 0.35, 4.0), 0x7a7258, M4(wx, y + 1.85, wz)], [G.box(0.06, 0.25, 2.2), 0x161412, M4(wx - sd * 2.11, y + 1.25, wz)]); addCollider(wx, wz, 2.1, 1.8, 0, y + 2.0); coverBox(wx, wz, 2.1, 1.8, 0, 1.8); }
    scene.add(SH(onLayer1(new THREE.Mesh(build(bk), MAT.vc))));
    { const [fx, fz] = CW(crTX(34) - 3.5, 34); C.egFlag = flag(fx, fz, 'eg', 6.5, Math.PI / 2); C.egFlag.userData.dyn = true; } }
  // bazooka nests in the scrub: three ambushes along the jeep track
  const nb = []; C.nests = {};
  for (const [id, pts] of [['a0', [[-252, 360, 'rpg'], [-212, 352, 'rifle'], [-246, 332, 'rifle'], [-206, 322, 'rpg'], [-230, 314, 'rifle'], [-258, 346, 'rifle']]], ['a1', [[-212, 290, 'rpg'], [-176, 300, 'rifle'], [-192, 266, 'rifle'], [-162, 292, 'rifle'], [-202, 276, 'rpg'], [-170, 258, 'rifle']]],
    ['a2', [[-176, 178, 'rpg'], [-184, 160, 'rifle'], [-172, 146, 'rifle'], [-188, 136, 'rpg'], [-170, 124, 'rifle'], [-182, 170, 'rifle']]]])
    C.nests[id] = pts.map(([x0, z0, kind]) => { const [x, z] = corr(CR_JEEP, x0, z0, 22, 9), [wx, wz] = CW(x, z); let bd = 1e9, tx = x, tz = z; for (const p of densify(CR_JEEP, 6)) { const d = Math.hypot(p[0] - x, p[1] - z); if (d < bd) { bd = d; tx = p[0]; tz = p[1]; } } const dx = tx - x, dz = tz - z, l = Math.hypot(dx, dz) || 1; return bushNest(wx, wz, dx / l, dz / l, C.slots, 'A' + id, kind, nb, rng(Math.round(x0 * 13 - z0))); });
  // on the night: two holes on the road from the west, out past the end of its walls, from where a machine gun and a bazooka look down it at the junction
  C.nests.h = [[-308, -3.4, 'rpg'], [-312, 3.6, 'lmg']].map(([x, z, kind]) => { const [wx, wz] = CW(x, z), s = foxhole(wx, wz, 1, 0, C.slots); s.grp = 'H'; s.kind = kind; return s; });
  // the Egyptians who crept back onto the rampart north of the pontoon bridge's landing, looking down on the bridge
  for (const [x, z] of [[-127, 384], [-129, 371], [-125, 360], [-130, 349], [-126, 338]]) { const [wx, wz] = CW(x, z), dx = -40 - x, dz = 404 - z, l = Math.hypot(dx, dz); foxhole(wx, wz, dx / l, dz / l, C.slots).grp = 'L'; }
  // the village
  const P = { walls: [], roof: [], floor: [], wood: [], conc: [], shut: [], door: [], sheet: [], metal: [], pig: [], straw: [], cloth: [], decal: [] }, parts = []; crVillage(P, C, parts);
  { const pt = crPlasterTex(), ct = crConcTex(), vm = (map, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ vertexColors: true, map, roughness: 0.95 }, o)), put = (list, mat, cast = true) => { if (!list.length) return; const m = new THREE.Mesh(build(list), mat); scene.add(SH(onLayer1(m), cast, true)); };
    put(P.walls, vm(pt, { bumpMap: bumpOf(pt), bumpScale: 0.5 })); put(P.conc, vm(ct, { bumpMap: bumpOf(ct), bumpScale: 0.4 }));
    put(P.shut, vm(crShutTex(), { roughness: 0.85 })); put(P.door, vm(crDoorTex(), { roughness: 0.7, metalness: 0.25 })); put(P.sheet, vm(crSheetTex(), { roughness: 0.7, metalness: 0.3, side: THREE.DoubleSide }));
    put(P.metal, vm(null, { roughness: 0.6, metalness: 0.45 })); put(P.pig, vm(crPigeonTex())); put(P.straw, vm(crStrawTex())); put(P.cloth, vm(null, { side: THREE.DoubleSide, roughness: 0.9 }), true);
    put(P.decal, new THREE.MeshStandardMaterial({ map: crDecalTex(), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2, roughness: 0.95 }), false); }
  if (P.roof.length) { const m = new THREE.Mesh(build(P.roof), new THREE.MeshStandardMaterial({ vertexColors: true, map: TX.grime, roughness: 0.95 })); scene.add(SH(onLayer1(m))); }
  { const m = new THREE.Mesh(build(P.floor), MAT.vc); m.receiveShadow = SHADOWS; scene.add(onLayer1(m)); }
  { const m = new THREE.Mesh(build(P.wood), new THREE.MeshStandardMaterial({ vertexColors: true, map: TX.wood, roughness: 0.92 })); scene.add(SH(onLayer1(m))); }
  const clearOf = (x, z) => !crInVillage(x, z, 5);
  { const pl = []; const r = rng(91); for (let i = 0; i < 46; i++) { const x = -190 - r() * 140, z = 76 + r() * 150; if (!clearOf(x, z)) continue; const [wx, wz] = CW(x, z); pl.push([wx, wz, 0.8 + r() * 0.35, r() * 6]); } for (let i = 0; i < 18; i++) { const [wx, wz] = CW(-345 - r() * 60, -150 + r() * 560); pl.push([wx, wz, 0.9, r() * 6]); } palms(pl); }
  { const r = rng(92), trees = []; for (let i = 0; i < 90; i++) { const t = [-175 - r() * 120, -72 - r() * 80]; if (clearOf(t[0], t[1]) && Math.abs(t[1] + 34) > 8) trees.push(t); } const tg = build([[G.cyl(0.12, 0.18, 1.6, 6), 0x5a4632, M4(0, 0.8, 0)], [G.sph(1.5, 9, 7), 0x3d5a2c, M4(0, 2.3, 0, 0, 0, 0, 1, 0.8, 1)]]); const im = new THREE.InstancedMesh(tg, MAT.vc, trees.length), mm = new THREE.Matrix4(), q = new THREE.Quaternion(); trees.forEach(([x, z], i) => { const [wx, wz] = CW(x, z), s = 0.8 + r() * 0.5; im.setMatrixAt(i, mm.compose(V3(wx, groundAt(wx, wz), wz), q.setFromAxisAngle(V3(0, 1, 0), r() * 6), V3(s, s, s))); }); scene.add(SH(onLayer1(im))); for (let i = 0; i < trees.length; i += 4) { const [wx, wz] = CW(...trees[i]); addCover(wx + 0.9, wz, -1, 0, 1.2); } }
  // the little bridge over the sweet-water canal
  { const [bx, bz] = CW(CR_BRIDGE, 0), y = 1.85; const m = new THREE.Mesh(build([[G.box(30, 0.5, 6.4), 0xa29a8a, M4(0, -0.25, 0)], [G.box(30, 0.8, 0.3), 0x8e8676, M4(0, 0.4, 3.1)], [G.box(30, 0.8, 0.3), 0x8e8676, M4(0, 0.4, -3.1)]]), MAT.vc); m.position.set(bx, y, bz); scene.add(SH(onLayer1(m))); addFloor(bx - 15, bx + 15, bz - 3, bz + 3, y); addCollider(bx, bz + 3.1, 15, 0.15, 0, y + 0.8, y - 0.5); addCollider(bx, bz - 3.1, 15, 0.15, 0, y + 0.8, y - 0.5); }
  // the pontoon bridge, bank to bank, 404 m south of where the roller bridge will lie
  { const list = []; for (let x = -96; x <= 96; x += 8) { const [wx, wz] = CW(x, CR_PB_Z); list.push([CR_PBSEG, null, M4(wx, 0, wz)]); }
    for (const sd of [-1, 1]) { const [wx, wz] = CW(sd * 103.5, CR_PB_Z), gb = Math.max(CR_PB_Y, groundAt(...CW(sd * 107, CR_PB_Z))); list.push([CR_PBRAMP, null, M4(wx, (CR_PB_Y + gb) / 2 - 0.1, wz, 0, 0, sd * Math.atan2(gb - CR_PB_Y, 7))]); }
    scene.add(SH(onLayer1(new THREE.Mesh(build(list), MAT.vc)), true, true)); }
  // the east bank: the crossing yard; the roller bridge lies on the sand behind the water's edge with the tanks that will push it, more waiting
  for (const [x, z, b] of [[175, -60, 270], [190, 40, 250], [205, -26, 280], [228, 30, 265], [168, 70, 260], [212, 82, 270], [196, -80, 275]]) { const [wx, wz] = CW(x, z); placeTank(wx, wz, b); }
  C.towT = [0, 1, 2, 3].map(() => { const m = VEH_DATA.magach ? (() => { const r = vehModel('magach', 'f'); r.crew = true; return r.g; })() : new THREE.Mesh(TANK_GEO, MAT.vc); m.rotation.y = Math.PI; m.userData.dyn = true; scene.add(SH(onLayer1(m))); return m; });
  { const [rx, rz] = CW(104, 0); const m = new THREE.Mesh(build([[G.box(12, 0.5, 5.2), 0x5a5c48, M4(0, 0, 0, 0, 0, 0.12)], [G.box(12, 0.4, 0.15), 0x43463a, M4(0, 0.45, 2.5, 0, 0, 0.12)], [G.box(12, 0.4, 0.15), 0x43463a, M4(0, 0.45, -2.5, 0, 0, 0.12)]]), MAT.vc); m.position.set(rx, 1.4, rz); scene.add(SH(onLayer1(m))); }
  { const [rx, rz] = CW(-106, 0); C.wramp = new THREE.Mesh(build([[G.box(12, 0.5, 5.2), 0x5a5c48, M4(0, 0, 0, 0, 0, -0.1)], [G.box(12, 0.4, 0.15), 0x43463a, M4(0, 0.45, 2.5, 0, 0, -0.1)], [G.box(12, 0.4, 0.15), 0x43463a, M4(0, 0.45, -2.5, 0, 0, -0.1)]]), MAT.vc); C.wramp.position.set(rx, 1.45, rz); C.wramp.userData.dyn = true; C.wramp.visible = false; scene.add(SH(onLayer1(C.wramp))); }
  C.front = new THREE.Mesh(BR_FRONT, MAT.vc); C.front.userData.dyn = true; scene.add(onLayer1(C.front));
  C.segs = []; for (let k = 0; k < CR_SEGN; k++) { const m = new THREE.Mesh(BR_SEG, MAT.vc); m.userData.dyn = true; SH(m, true, true); onLayer1(m); scene.add(m); C.segs.push(m); }
  // work lamps along the rails and on the bow, lit on the night it is pushed out
  { C.lamps = []; const lm = new THREE.SpriteMaterial({ map: FXT.flare, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, color: 0xffd8a0 });
    // (big glows: from the house at the head of the street, 250 m off, they are how the bridge is seen going out across the dark water)
    for (let k = 0; k < CR_SEGN; k += 2) for (const sd of [-1, 1]) { const q = new THREE.Sprite(lm); q.position.set(0, 3.1, sd * 2.5); q.scale.setScalar(2.6); q.visible = false; C.segs[k].add(q); C.lamps.push(q); }
    for (const sd of [-1, 1]) { const q = new THREE.Sprite(lm); q.position.set(0, 4.7, sd * 2.3); q.scale.setScalar(6); q.visible = false; C.front.add(q); C.lamps.push(q); }
    for (const t of C.towT) { const q = new THREE.Sprite(lm); q.position.set(1.5, 2.9, 0); q.scale.setScalar(3.2); q.visible = false; t.add(q); C.lamps.push(q); } }
  // the repair of the opening film: a tank shoves the new roller in from the side over the sand, the engineers round it
  { const r = VEH_DATA.magach ? vehModel('magach', 'f') : null, m = r ? r.g : new THREE.Mesh(TANK_GEO, MAT.vc); if (r) r.crew = true; m.userData.dyn = true; m.visible = false; scene.add(SH(onLayer1(m))); C.repT = m;
    C.eng = [0, 1, 2, 3, 4].map(() => { const u = new Unit('f', 'rifle'); scene.remove(u.tag); u.alive = true; u.rig.root.visible = false; u.rig.root.userData.dyn = true; u.rig.gun.visible = false; return u; }); }
  for (const [x, z, s] of [[-900, -500, 40], [-1200, 300, 55], [600, -900, 30], [-700, 800, 45]]) { const [wx, wz] = CW(x, z); smokeColumn(wx, wz, s, true); }
  { // fields, scrub and reeds
    const L = (x, z) => [x - CR.o.x, z - CR.o.z], onRoad = (lx, lz) => (Math.abs(lz) < 6 && lx < -110) || distPolyline(lx, lz, CR_JEEP) < 6;
    const okF = (x, z) => { const [lx, lz] = L(x, z); return lx < -150 && !onRoad(lx, lz) && !crInVillage(lx, lz, 4) && Math.abs(lx - CR_BRIDGE) > 11; };
    const X0 = CR.o.x - 440, X1 = CR.o.x - 150, Z0 = CR.o.z - 160, Z1 = CR.o.z + 450;
    concealPatches([...patchesNear(CR_JEEP.map(([x, z]) => CW(x, z)), 30, 9, 30, 880, okF, 4, 9), ...patchesNear(CR_ROAD.map(([x, z]) => CW(x, z)), 22, 8, 30, 882, okF, 4, 9), ...patchesIn(40, X0, X1, Z0, Z1, 883, okF, 5, 12)], C, 884, 0.7);
    dressRoute(CR_ROAD.map(([x, z]) => CW(x, z)), okF, 800, 1, 0.8); dressRoute(CR_JEEP.map(([x, z]) => CW(x, z)), okF, 805, 1.2, 0.6); dressArea(X0, X1, Z0, Z1, okF, 820, 0.8, 0.8);
    { const okE = (x, z) => { const [lx, lz] = L(x, z); return lx > 104 && !(Math.abs(lz) < 40 && lx < 160) && Math.abs(lz) > 6 && Math.abs(lz - CR_PB_Z) > 7 && distPolyline(lx, lz, CR_CONV) > 7; }; dressArea(CR.o.x + 104, CR.o.x + 345, Z0, Z1, okE, 840, 0.5, 0.1); const okR = (x, z) => { const [lx, lz] = L(x, z); return lx < -100 && lx > -150 && Math.abs(lx - crTX(lz)) > 3.2 && Math.abs(lz) > 27 && Math.abs(lz - CR_PB_Z) > 7 && distPolyline(lx, lz, CR_JEEP) > 6; }; dressArea(CR.o.x - 150, CR.o.x - 100, Z0, Z1, okR, 860, 0.35, 0.3); }
    instScatter(BUSH_G, scatterIn(LITE ? 300 : 700, X0, CR.o.x - 152, Z0, Z1, 501, okF, (x, z, r) => [x, z, 0.7 + r() * 1.0, r() * 6, greenBush(r), 0, 0.9]).concat(nb));
    { const rows = []; for (const [x0, x1, z0, z1] of [[-430, -350, -150, -12], [-430, -350, 12, 160], [-320, -190, 120, 240], [-330, -280, 300, 440]]) for (let x = x0; x < x1; x += 1.6) for (let z = z0; z < z1; z += 6.5) { const [wx, wz] = CW(x, z); if (!okF(wx, wz)) continue; rows.push([wx, wz, 1, 0, 0x5c7a3a + (Math.random() < 0.5 ? 0x060300 : 0), 0, 1]); }
      if (MAPV.kinds && MAPV.kinds.grass_green) {   // with the map's plant cards: rows of young crop, plant by plant, instead of green boxes
        const geo = MAPV.kinds.grass_green, M = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), sc = V3(), r = rng(4711), mats = [], step = LITE ? 1.1 : 0.75;
        for (const [wx, wz] of rows) for (let d = -2.9; d < 3.0; d += step) { const z = wz + d + (r() - 0.5) * 0.3, x = wx + (r() - 0.5) * 0.18, y = groundAt(x, z), s = 0.75 + r() * 0.5; e.set(0, r() * Math.PI, 0); q.setFromEuler(e); sc.set(s, s * (0.8 + r() * 0.5), s); mats.push(M.compose(V3(x, y - 0.04, z), q, sc).clone()); }
        const im = new THREE.InstancedMesh(geo, MAPV.mat, mats.length); mats.forEach((m4, k) => im.setMatrixAt(k, m4)); im.instanceMatrix.needsUpdate = true; im.computeBoundingSphere(); im.castShadow = false; scene.add(onLayer1(im));
      } else { const cg = build([[G.box(0.45, 0.55, 6.0), 0xffffff, M4(0, 0.27, 0)]]); instScatter(cg, rows, DET_MAT, false); } }
    { const reeds = []; for (let lz = -160; lz < 450; lz += 2.6) for (const sd of [-1, 1]) { if (Math.abs(lz) < 6 || Math.random() < 0.3) continue; const [wx, wz] = CW(CR_BRIDGE + sd * rand(7, 9.5), lz + rand(-1, 1)); reeds.push([wx, wz, 0.8 + Math.random() * 0.5, Math.random() * 6, Math.random() < 0.5 ? 0x7a8a4a : 0x8a8a58, 0, 1]); } instScatter(REED_G, reeds, DET_MAT, false); }
    { const hs = []; for (const [x, z] of [[-212, -120], [-224, -126], [-300, 180], [-312, 190], [-290, 360]]) { const [wx, wz] = CW(x, z); hs.push([G.cyl(1.4, 1.6, 1.8, 12), 0xc8b070, M4(wx, groundAt(wx, wz) + 0.9, wz)], [G.cone(1.5, 0.9, 12), 0xbca262, M4(wx, groundAt(wx, wz) + 2.2, wz)]); addCollider(wx, wz, 1.4, 1.4, 0, groundAt(wx, wz) + 2.2); coverBox(wx, wz, 1.4, 1.4, 0, 1.8); } scene.add(SH(onLayer1(new THREE.Mesh(build(hs), MAT.vc)))); }
    for (const [x, z, w, d, h, ru, col] of [[-318, 16, 4, 4, 2.6, 0, '#bfae8e'], [-380, -36, 6, 4, 2.8, 0, '#c7b490'], [-200, 96, 5, 4, 2.4, 1, '#c2ab84'], [-404, 52, 5, 5, 2.6, 0, '#cbb894'], [-276, 352, 5, 4, 2.5, 1, '#c4ae86'], [-192, 248, 4, 4, 2.4, 0, '#c9b48e']]) { const [wx, wz] = CW(x, z); smallHut(wx, wz, w, d, h, col, 0x7a6a52, !!ru); }
    powerLine([[-306, 9], [-700, 9]].map(([x, z]) => CW(x, z)), 40, 7); powerLine(CR_JEEP.slice(3).map(([x, z]) => CW(x - 14, z)), 42, 7);
    wireFence([[-306, -9], [-322, -9]].map(([x, z]) => CW(x, z))); wireFence([[-340, -9], [-600, -9]].map(([x, z]) => CW(x, z)));
    { const bl = []; for (const [x, z] of [[-140, 300], [-142, 318], [-136, 330]]) { const [wx, wz] = CW(x, z); bl.push([wx, wz, 1.2 + Math.random() * 0.6, Math.random() * 6, rockCol(Math.random), 0.3, 0.72]); } instScatter(BOULDER_G, bl); boulders(bl); }
    instScatter(ROCK_G, scatterIn(LITE ? 80 : 180, CR.o.x + 100, CR.o.x + 345, Z0, Z1, 502, (x, z) => { const [lx, lz] = L(x, z); return Math.abs(lz) > 5 && Math.abs(lz - CR_PB_Z) > 6 && distPolyline(lx, lz, CR_CONV) > 6; }, (x, z, r) => [x, z, 0.25 + r() ** 3, r() * 6, rockCol(r), 0.2, 0.55]).concat(scatterIn(90, X0, X1, Z0, Z1, 503, okF, (x, z, r) => [x, z, 0.2 + r() * 0.4, r() * 6, rockCol(r), 0.2, 0.6])));
    instScatter(BUSH_G, scatterIn(LITE ? 60 : 140, CR.o.x + 100, CR.o.x + 345, Z0, Z1, 504, (x, z) => { const [lx, lz] = L(x, z); return Math.abs(lz) > 5 && Math.abs(lz - CR_PB_Z) > 6 && distPolyline(lx, lz, CR_CONV) > 6; }, (x, z, r) => [x, z, 0.35 + r() * 0.5, r() * 6, dryBush(r), 0, 0.7]));
    for (const [x, z] of [[-150, 280], [-300, 14]]) { const [wx, wz] = CW(x, z); fieldDrums(wx, wz, 5); }
    { const [a, b] = CW(-170, 276); fieldSign(a, b, 'אל הכפר ←', Math.PI, 1.4); }
  }
  if (parts.length) scene.add(SH(onLayer1(new THREE.Mesh(build(parts), MAT.vc))));
  BATCH.bag = sv; if (BAGS.length) scene.add(bagMesh(BAGS)); C.covers = COVER.slice(k0); for (const c of C.covers) c.y = hAt(c.x, c.z, groundAt(c.x, c.z) + 0.6);
  // vehicles: our jeeps (no truck, no half-track: the tanks and the jeeps are the only vehicles of this chapter); the tanks over the bridges
  const jeepCrew = (v) => { const d = new THREE.Mesh(SEATED_F, MAT.clothF); d.position.set(-0.35 * JK, 0.95 * JK, -0.3 * JK); d.rotation.y = Math.PI / 2; v.g.add(d); v.crew = [d]; };
  C.jeeps = [0, 1, 2].map((i) => { const v = addVeh({ mode: 'cross', side: 'f', kind: 'jeep', geo: JEEP_GEO, half: [1.6 * JK, 1.6 * JK, 0.8 * JK], guns: i > 0, vmax: 6.5, float: crPBDeck }); jeepCrew(v); const vl = v.g.userData.vl; if (vl) vl.crew = false; else v.g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.8 * JK, 6).translate(-0.55 * JK, 1.35 * JK, 0), MAT.metal));   // the modelled jeep has its own .50 on its post; its men are set here
    if (i > 0) { const gu = new Unit('f', 'rifle'); scene.remove(gu.tag); gu.alive = true; gu.rig.root.visible = true; gu.stance = 'stand'; gu.rig.pose('aim', 0, 0.05); v.crewU = [{ u: gu, at: V3(-0.85 * JK, 0.95 * JK, 0.0) }]; v.crew.push(gu.rig.root); } return v; });
  C.jeepX = addVeh({ mode: 'cross', side: 'f', kind: 'jeep', geo: JEEP_GEO, half: [1.6 * JK, 1.6 * JK, 0.8 * JK], vmax: 3, float: crPBDeck }); if (C.jeepX.g.userData.vl) C.jeepX.g.userData.vl.crew = false; C.jeepX.men = [[-0.35, 0.95, -0.3], [0.45, 0.95, 0.35], [-1.1, 0.95, 0.3]].map(([x, y, z]) => { const d = new THREE.Mesh(SEATED_F, MAT.clothF); d.position.set(x * JK, y * JK, z * JK); d.rotation.y = Math.PI / 2; C.jeepX.g.add(d); return d; });
  roadRibbon(CR_JEEP.map(([x, z]) => CW(x, z)), 5, 'dirt'); roadRibbon(CR_PB_PATH.map(([x, z]) => CW(x, z)), 5, 'dirt');
  roadRibbon([[-106, 0], [-153, 0]].map(([x, z]) => CW(x, z)), 8, 'asphalt'); roadRibbon([[-153, 0], [-234, 0]].map(([x, z]) => CW(x, z)), 6.4, 'asphalt'); roadRibbon([[CR_LX1, 0], [-420, 0]].map(([x, z]) => CW(x, z)), 7, 'asphalt'); roadRibbon([[-253.5, -CR_LZ], [-253.5, CR_LZ]].map(([x, z]) => CW(x, z)), 6, 'dirt');
  { const r = rng(9117); crWreckT55(-352, -16, 190, r); crWreckT55(-385, 13, 160, r); crWreckT55(-292, 58, 210, r); crWreckT55(-288, -62, 120, r); }
  C.mg = new THREE.Mesh(JEEP_MG, MAT.vc); C.mg.visible = false; C.mg.userData.dyn = true; scene.add(onLayer1(C.mg));
  const deck = (x, z) => crDeck(x, z) ?? crPBDeck(x, z);
  C.tanks = [0, 1, 2, 3, 4, 5].map(() => addVeh({ mode: 'cross', side: 'f', kind: 'tank', geo: TANK_GEO, half: [3.4, 2.6, 1.9], guns: false, vmax: 8, float: deck }));
  C.pbT = [0, 1].map(() => addVeh({ mode: 'cross', side: 'f', kind: 'tank', geo: TANK_GEO, half: [3.4, 2.6, 1.9], guns: false, vmax: 3, float: crPBDeck }));
  // the column of the last film: fifty tanks drawn as one instanced mesh
  C.conv = VEH_DATA.magach ? new THREE.InstancedMesh(vehMerged('magach', 2, 'f'), MAT.veh, 50) : new THREE.InstancedMesh(TANK_GEO, MAT.vc, 50); C.conv.frustumCulled = false; C.conv.userData.dyn = true; C.conv.visible = false; SH(C.conv, true, false); scene.add(onLayer1(C.conv));
}
/* ---------- the roller bridge: on the sand behind the water's edge, then pushed out across the canal, every segment where it physically is ---------- */
// the height of a segment's centre: floating on the water, or resting on its rollers on the bank, with a slope at the edge
function crSegY(cx) { if (cx < 96) return 0; const [wx, wz] = CW(Math.max(cx, 104), 0), land = Math.max(0, groundAt(wx, wz)) + 0.75; return cx > 104 ? land : lerp(0, land, (cx - 96) / 8); }
// the deck the tanks drive on once the bridge is down, with a ramp at each end
function crDeck(x, z) { const lx = x - CR.o.x, lz = z - CR.o.z; if (Math.abs(lz) > 3.4 || CR.br < 1) return null; if (lx > -100 && lx < 100) return CR_DECK; if (lx >= 100 && lx < 112) return lerp(CR_DECK, groundAt(x, z), (lx - 100) / 12); if (lx <= -100 && lx > -112) return lerp(CR_DECK, groundAt(x, z), (-100 - lx) / 12); return null; }
function crBridgePose(dt) {
  const C = CHAP.cross, R = CR.rep, xf = 100 - CR.br * CR_BLEN, ys = [];
  for (let k = 0; k < CR_SEGN; k++) { if (R && k === 12 && !R.joined) continue; const m = C.segs[k], cx = xf + (k + 0.5) * CR_SEGL + (R && k > 12 ? R.gap : 0), y = crSegY(cx), [wx, wz] = CW(cx, 0); m.visible = true; m.position.set(wx, y + (y === 0 ? Math.sin(GAME.t * 1.4 + k) * 0.04 : 0), wz); ys[k] = y; }
  for (let k = 0; k < CR_SEGN; k++) { if (ys[k] === undefined) continue; const a = ys[k - 1] ?? ys[k], b = ys[k + 1] ?? ys[k]; C.segs[k].rotation.set(0, 0, Math.atan2(b - a, 2 * CR_SEGL)); }
  C.front.visible = CR.br < 1; C.front.position.set(CR.o.x + xf + 0.3, ys[0] ?? 0, CR.o.z); C.wramp.visible = CR.br >= 1;
  // the tanks that push it, nose to its tail
  const tail = xf + CR_BLEN + (R ? R.gap : 0); C.towT.forEach((t, i) => { const [wx, wz] = CW(tail + 3.7 + (i >> 1) * 7.6, (i % 2 ? 1 : -1) * 2.05); t.position.set(wx, groundAt(wx, wz), wz); t.visible = CR.br < 1; });
  const moving = CR.push && CR.br < 1, closing = R && R.t > 20 && R.t < 25.5;
  if (dt > 0 && (moving || closing)) for (const t of C.towT) if (Math.random() < dt * 3) { const s = FX.smoke.get(); s.life = 2.2; s.s.position.copy(t.position).add(V3(rand(2.6, 3.4), 2.3, rand(-1, 1))); s.s.material.color.set(0x2e2c28); s.upd = (q, u, d2) => { q.s.position.y += 1.6 * d2; q.s.scale.setScalar(0.8 + u * 3.4); q.s.material.opacity = 0.55 * (1 - u); }; }
  // where the bow goes into the water: spray, and rings spreading on the canal
  if (dt > 0 && moving && xf < 98) { CR.tipT = (CR.tipT || 0) - dt; if (CR.tipT <= 0) { CR.tipT = 0.32; const [tx, tz] = CW(xf - 0.6, rand(-2.2, 2.2)); fxDust(V3(tx, 0.3, tz), true); fxDust(V3(tx - 0.8, 0.8, tz), true); if (Math.random() < 0.6) rippleAdd(tx - 1, tz, 0.7); } }
  { const night = CR.filmTod != null ? CR.filmTod % 1440 < 300 : CR.stage >= 3; if (C.lamps[0].visible !== night) for (const q of C.lamps) q.visible = night; }
  if (CR.stage === 3) meter('גשר הגלילים', CR.br);
}
/* the repair: the new roller lies on the sand beside the gap; a tank shoves it in sideways, then the tanks behind push the rear half up against it */
function crRepStart() {
  const C = CHAP.cross, cx12 = 100 + 12.5 * CR_SEGL, z0 = -9.5;
  CR.rep = { t: 0, gap: 4, joined: false, cx: cx12, z0, yS: crSegY(cx12) };
  const spots = [[cx12 - 4.4, 3.4, 'crouch'], [cx12 + 4.6, 3.3, 'idle'], [cx12 - 4.0, -4.2, 'idle'], [cx12 + 5.8, -4.0, 'crouch'], [cx12 + 2.6, -17.5, 'idle']];
  C.eng.forEach((u, i) => { const [ex, ez] = CW(spots[i][0], spots[i][1]); u.place(ex, ez); u.engPose = spots[i][2]; u.face(...CW(cx12, 0)); u.stance = spots[i][2] === 'crouch' ? 'crouch' : 'stand'; u.rig.root.visible = true; u.rig.pose(u.engPose, 0, 0); u.sync(); });
  C.repT.visible = true; crRepUpd(0);
}
function crRepEnd() { const C = CHAP.cross; CR.rep = null; if (C.repT) C.repT.visible = false; for (const u of C.eng || []) u.rig.root.visible = false; }
function crRepUpd(dt) {
  const R = CR.rep; if (!R) return; const C = CHAP.cross, m = C.segs[12], t = (R.t += dt);
  // 9.5-18.5 the tank shoves the roller across the sand into the gap; 20-25.5 the tanks behind push the rear half up against it
  const u = smooth(9.5, 18.5, t), lz = lerp(R.z0, 0, u);
  if (t >= 18.5 && !R.joined) { R.joined = true; const [wx, wz] = CW(R.cx, 0); fxDust(V3(wx, R.yS - 0.4, wz)); sndClick(240, 0.4); }
  if (!R.joined) { const [wx, wz] = CW(R.cx, lz); m.visible = true; m.position.set(wx, R.yS + (t > 9.5 ? Math.sin(t * 7) * 0.02 : 0), wz); m.rotation.set(0, 0, 0); if (dt > 0 && t > 9.5 && Math.random() < dt * 5) fxDust(V3(wx + rand(-3, 3), R.yS - 0.6, wz - 2.6)); }
  R.gap = t < 20 ? 4 : lerp(4, 0, smooth(20, 25.5, t));
  // the tank: nose against the roller's side, backing off once it is home
  { const tz = lz - 2.6 - 3.9 - (R.joined ? smooth(18.5, 22, t) * 6 : 0), [wx, wz] = CW(R.cx, tz); C.repT.position.set(wx, groundAt(wx, wz), wz); C.repT.rotation.set(0, -Math.PI / 2, 0); const vl = C.repT.userData.vl; if (vl) vl.spd = t > 9.5 && t < 22 ? 1.2 : 0; }
  if (dt > 0 && t > 9.5 && t < 18.5 && Math.random() < dt * 3) { const s = FX.smoke.get(); s.life = 2.2; s.s.position.copy(C.repT.position).add(V3(rand(-1, 1), 2.3, rand(-3.4, -2.6))); s.s.material.color.set(0x2e2c28); s.upd = (q, uu, d2) => { q.s.position.y += 1.6 * d2; q.s.scale.setScalar(0.8 + uu * 3.4); q.s.material.opacity = 0.55 * (1 - uu); }; }
  for (const e of C.eng) { e.anim = (e.anim || 0) + dt * (e.engPose === 'crouch' ? 1.5 : 0.8); e.rig.pose(e.engPose, e.anim, 0); e.sync(); }
}
/* ---------- the jeep right behind the player's on the bridge: a direct hit. One man is killed, two are wounded; a few seconds on the
   burning wreck is pushed off the pontoons into the canal, so the column behind it can cross ---------- */
function crDirectHit() {
  const C = CHAP.cross, X = C.jeepX; CR.hit3 = true; X.g.updateMatrixWorld(true); const p = X.g.getWorldPosition(V3());
  fxExplosion(p.clone().add(V3(0, 0.8, 0)), 3.2); sndBoom(p, 3.0); crBurst(p.x + 3, p.z + 7, 1.5); crBurst(p.x - 5, p.z - 6, 1.3); crSplash(V3(p.x + 1, 0, p.z - 5), 1.2);
  X.vmax = 0; X.speed = 0; X.stop = X.s; FX.shake = Math.max(FX.shake, clamp(1.4 - camera.position.distanceTo(p) / 40, 0.2, 0.9));
  X.crHit = true; X.g.traverse((m) => { if (m.isMesh && !X.men.includes(m)) m.material = MAT_BURNT; }); { const vl = X.g.userData.vl; if (vl) { vehDamage(vl, true); vl.dead = true; } }
  for (let i = 0; i < 2; i++) { const f = new THREE.Sprite(new THREE.SpriteMaterial({ map: FXT.fire, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, color: HDC })); f.position.set(rand(-0.4, 0.4), 1.4 + i * 0.6, rand(-0.3, 0.3)); f.scale.setScalar(1.8 + i * 0.6); X.g.add(f); X.fires.push(f); }
  // one is thrown off the bridge into the canal; the other two lie on the roadway beside the burning jeep
  const [a, b, c] = X.men; scene.attach(a); CR.thrown = { m: a, v: V3(rand(-1, 1), 5.5, (Math.random() < 0.5 ? -1 : 1) * rand(3, 4)), t: 0 };
  for (const [m, at] of [[b, [2.6, 1.6]], [c, [-2.4, -1.5]]]) { scene.attach(m); m.position.set(p.x + at[0], CR_PB_Y + 0.15, p.z + at[1]); m.rotation.set(0, rand(0, 3), Math.PI / 2); }
  radio('קשר', 'פצצה על הגשר מאחורינו! פגיעה ישירה בג׳יפ!', 2.4); CR.pushT = GAME.t + 8;
  DIRQ.push({ at: GAME.t + 6.5, fn: () => radio('נהג', 'דוחפים אותו למים! לפנות את הגשר!', 2.2) });
  DIRQ.push({ at: GAME.t + 2.8, fn: () => { radio('חובש', 'הג׳יפ מאחורינו נפגע! יש הרוג ושני פצועים. אני עליהם!', 3.4); feed('הג׳יפ שמאחור נפגע על הגשר: הרוג ושני פצועים', 'bad'); } });
}
/* the bomb that finds the jeep behind the player's on the bridge: a jet comes in low from the east, along the bridge; the bomb falls in slow
   motion, the player's head is turned to it, and it lands on the jeep right behind, a dozen metres back */
function crStrike() {
  const C = CHAP.cross, X = C.jeepX; X.g.updateMatrixWorld(true); const to = X.g.getWorldPosition(V3());
  const m = new THREE.Mesh(JET_GEO, MAT.jet); SH(m, true, false); scene.add(onLayer1(m));
  CR.strike = { m, t: 0, x0: to.x + 330, z: to.z - 3, rel: false }; m.position.set(to.x + 330, 46, to.z - 3);
  sndJet(3.2); radio('צנחן', 'מטוס! מהמזרח — הוא צולל על הגשר!', 2.6);
}
function crStrikeUpd(dt) {
  const S = CR.strike; if (!S) return; const C = CHAP.cross, X = C.jeepX; S.t += dt;
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
  const C = CHAP.cross, X = C.jeepX, T = CR.thrown;
  if (T && T.m.visible) { T.t += dt; T.v.y -= 9.8 * dt; T.m.position.addScaledVector(T.v, dt); T.m.rotation.x += dt * 5; T.m.rotation.z += dt * 3; if (T.m.position.y < -1.2) { T.m.visible = false; const wp = T.m.position.clone(); wp.y = 0; for (let k = 0; k < 4; k++) fxDust(wp.clone().add(V3(rand(-0.6, 0.6), 0.3 + k * 0.3, rand(-0.6, 0.6))), true); rippleAdd(wp.x, wp.z, 0.5); } }
  if (X.crHit && X.g.visible && Math.random() < dt * 3.5) { const wp = X.g.getWorldPosition(V3()), q = FX.smoke.get(); q.life = 6; q.s.position.set(wp.x + rand(-0.6, 0.6), wp.y + 2.2, wp.z + rand(-0.6, 0.6)); q.s.material.color.set(0x1a1816); q.upd = (o, u, d2) => { o.s.position.y += 2.4 * d2; o.s.scale.setScalar(1.6 + u * 7); o.s.material.opacity = 0.7 * (1 - u); }; }
  if (X.crHit) for (const f of X.fires) f.scale.setScalar(1.6 + Math.sin(GAME.t * 11 + f.id) * 0.3 + (f.position.y > 1.6 ? 0.6 : 0));
  // pushed off: it slides sideways off the deck, rolls over the edge and goes into the canal
  if (X.crHit && CR.pushT && GAME.t > CR.pushT && !CR.xGone) {
    if (!CR.push0) { X.path = null; X.speed = 0; CR.push0 = { p: X.g.position.clone(), ry: X.g.rotation.y }; }
    const u = clamp((GAME.t - CR.pushT) / 2.6, 0, 1), P0 = CR.push0, e = u * u;
    const sx = Math.sin(P0.ry), sz = Math.cos(P0.ry), d = 4.6 * Math.min(1, u * 1.4);   // toward its own right side (local +z), rolling that way
    X.g.position.set(P0.p.x + sx * d, P0.p.y - e * 3.2, P0.p.z + sz * d); X.g.rotation.set(1.1 * smooth(0.3, 1, u), P0.ry, 0, 'YXZ');
    if (u >= 1) { CR.xGone = true; X.g.visible = false; X.shown = false; const w = V3(P0.p.x + sx * 4.6, 0, P0.p.z + sz * 4.6); crSplash(w, 1.6); sndBoom(w, 0.6); }
  }
}
/* ---------- the air raids: Egyptian jets dive on the pontoon bridge and on the roller bridge waiting on the bank ---------- */
const CRJ = [];
function crJet(kind) {
  const m = new THREE.Mesh(JET_GEO, MAT.jet); SH(m, true, false); m.visible = false; scene.add(onLayer1(m));
  let tx, tz, ang;
  if (kind === 'pb') { tx = CR.o.x + rand(-70, 70); tz = CR.o.z + CR_PB_Z + rand(-30, 10); ang = Math.PI / 2 + rand(-0.15, 0.15); }
  else { tx = CR.o.x + 100 - CR.br * CR_BLEN + rand(10, 190); tz = CR.o.z; ang = rand(-0.25, 0.25) + (Math.random() < 0.5 ? 0 : Math.PI); }
  CRJ.push({ m, kind, tx, tz, dx: Math.cos(ang), dz: Math.sin(ang), t: 0, last: -1e9, bombs: false });
  radio('תצפית', kind === 'pb' ? pick(['מיג צולל על גשר הדוברות!', 'מטוס! הוא בא על הגשר!']) : pick(['מיגים על גשר הגלילים!', 'סוחויים בצלילה על הצומת!']), 2.6);
}
function crInTrench(x, z) { const lz = z - CR.o.z; return lz > CR_TZ0 - 2 && lz < CR_TZ1 + 2 && Math.abs(x - CR.o.x - crTX(lz)) < 1.7; }
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
// bombs that fall in the canal throw up water instead of sand
function crBombsUpd(dt) {
  for (let i = AIR.bombs.length - 1; i >= 0; i--) { const b = AIR.bombs[i]; b.t += dt; if (b.t < 0) { b.m.visible = false; continue; } b.m.visible = true; const u = Math.min(1, b.t / b.dur);
    const p = b.from.clone().lerp(b.to, u); p.y = lerp(b.from.y, b.to.y, u * u); b.m.position.copy(p); b.m.lookAt(b.to);
    if (u >= 1) { scene.remove(b.m); AIR.bombs.splice(i, 1); if (b.water) crBurst(b.to.x, b.to.z, 1.7); else explode(b.to.clone(), 2.0, 12, 110, 'art'); } }
}
// shells from the Egyptian artillery keep falling around the crossing: columns of water in the canal, sand on the yard
function crShells(dt) {
  CR.shT = (CR.shT ?? 2) - dt; if (CR.shT > 0) return; const crossing = CR.stage === 0 && CR.msgs.go && !CR.msgs.off, pushing = CR.push && CR.br < 1; CR.shT = crossing ? rand(0.4, 1.0) : pushing ? rand(0.7, 1.5) : rand(1.2, 3.2);
  const xf = 100 - CR.br * CR_BLEN, r = Math.random(); let x, z;
  // on the crossing they fall in the water either side of the bridge, along the column; a few on the bridge's ends
  if (crossing && r < 0.9) { const q = CHAP.cross.jeeps[0].g.position; x = clamp(q.x + rand(-40, 50), CR.o.x - 92, CR.o.x + 92); z = CR.o.z + CR_PB_Z + (Math.random() < 0.5 ? -1 : 1) * rand(8, 30); }
  else if (CR.stage === 0 && r < 0.6) { x = CR.o.x + rand(-90, 90); z = CR.o.z + CR_PB_Z + (Math.random() < 0.5 ? -1 : 1) * rand(10, 45); }
  else if (r < 0.6) { x = CR.o.x + clamp(xf + rand(-30, 60), -90, 92); z = CR.o.z + (Math.random() < 0.5 ? -1 : 1) * rand(8, 34); } else if (r < 0.85) { x = CR.o.x + rand(110, 300); z = CR.o.z + rand(-90, 90); if (Math.abs(z - CR.o.z) < 8) z += 16; } else { x = CR.o.x + rand(-80, 80); z = CR.o.z + rand(-160, 160); if (Math.abs(z - CR.o.z) < 6) z += 12; }
  const gy = groundAt(x, z), p = V3(x, Math.max(gy, 0), z); if (camera.position.distanceTo(p) < 70 && Math.random() < 0.5) sndWhistle(1.0);
  DIRQ.push({ at: GAME.t + 1.0, fn: () => { if (gy < 0) crBurst(x, z, crossing ? 1.5 : 1.2); else { fxExplosion(p, 1.1); sndBoom(p, 1.0); } } });
}
// a shell in the canal: a column of water and rings; close to the camera the whole picture shakes
function crSplash(p, k = 1) {
  const n = Math.round(9 * k); for (let i = 0; i < n; i++) fxDust(p.clone().add(V3(rand(-2, 2) * k, 0.3 + i * 0.55 * k, rand(-2, 2) * k)), true); for (let i = 0; i < 5; i++) fxDust(p.clone().add(V3(rand(-5, 5), 0.2, rand(-5, 5))), true); sndBoom(p, 1.1 * k);
  rippleAdd(p.x, p.z, 0.9 * k); FX.shake = Math.max(FX.shake, clamp(1.1 - camera.position.distanceTo(p) / 34, 0, 0.75));
}
// a big one: the water thrown high in a white column that falls back, and rings that spread wide
function crBurst(x, z, k = 1.4) {
  fxExplosion(V3(x, 0.1, z), 0.8 * k); crSplash(V3(x, 0, z), k);
  for (let i = 0; i < (LITE ? 4 : 8); i++) { const d = FX.dust.get(); d.life = 1.7 + Math.random() * 0.8; const ox = rand(-1, 1) * k, oz = rand(-1, 1) * k, vy = rand(9, 17) * k; d.s.position.set(x + ox, 0.4, z + oz); d.s.material.color.set(0xe8eef0); d.upd = (q, u, dt2) => { q.s.position.y += vy * dt2 * Math.pow(1 - u, 1.6) - 2.5 * dt2 * u; q.s.scale.setScalar((1.2 + u * 5.5) * k); q.s.material.opacity = 0.9 * (1 - u); }; }
  rippleAdd(x, z, 1.3 * k);
}
/* ---------- stage setup ---------- */
function crSeat(v, x, z) { return () => ({ p: v.g.localToWorld(V3(x * JK, 0.95 * JK, z * JK)), hd: v.hdV + (z < 0 ? Math.PI / 2 : -Math.PI / 2) }); }
function crCut(fn) { const f = $('#fade'); f.style.transition = 'opacity .5s'; f.style.opacity = '1'; DIRQ.push({ at: GAME.t + 0.55, fn: () => { fn(); f.style.transition = 'opacity 1.2s'; f.style.opacity = '0'; } }); }
// a post for one of ours: a window bay (or any place with a facing), in world coordinates
const crPost = (s, name) => ({ name, x: s.x, z: s.z, y: s.y, fx: s.nx, fz: s.nz, state: 'post' });
const crDi = () => Math.max(0, DIFF.indexOf(diff));   // the level: 0 easy, 1, 2 hard
function crSetup(stage) {
  const C = CHAP.cross; fieldSetupCommon(C, stage); resetTrail(); CR.flee = []; CR.msgs = {}; CR.stage = stage; if (CR.shellIn && CR.shellIn.m) scene.remove(CR.shellIn.m); CR.shellIn = null; SLOW.left = 0; SLOW.k = 1; SLOW.look = null; for (const j of CRJ) scene.remove(j.m); CRJ.length = 0; for (const b of AIR.bombs) scene.remove(b.m); AIR.bombs.length = 0;
  CR.br = stage >= 4 ? 1 : 0; CR.push = false; CR.air = [34, 18, 999, 999, 999][stage]; if (CR.strike) { scene.remove(CR.strike.m); CR.strike = null; } CR.wave = 0; CR.waveT = 0; CR.filmTod = null; CR.tanksOn = false; CR.illumT = 3; CR.doorN = stage >= 3; CR.rg = { i: 0, clear: false, t: 0 }; crRepEnd(); crConvOff(); meter(null);
  $('#clockSub').textContent = CR_CLOCK[stage];
  for (const v of VEH) if (v.mode === 'cross') { vehRevive(v); v.path = null; v.stop = undefined; v.ended = false; v.shown = false; v.g.visible = false; v.onEnd = null; v.speed = 0; }
  if (C.egFlag) C.egFlag.visible = stage < 2;
  P.mode = 'rifle'; vm.visible = true; if (TANK.g) TANK.g.visible = false; C.mg.visible = false;
  // the jeep right behind the player's on the bridge: the one the bomb will find (the other two follow it)
  { const X = C.jeepX; X.crHit = false; CR.hit3 = false; CR.thrown = null;
    X.men.forEach((m, i) => { if (m.parent !== X.g) X.g.add(m); m.position.set(...[[-0.35, 0.95, -0.3], [0.45, 0.95, 0.35], [-1.1, 0.95, 0.3]][i].map((q) => q * JK)); m.rotation.set(0, Math.PI / 2, 0); m.visible = true; });
    if (stage === 0) { X.shown = true; X.g.visible = true; X.path = CR_J0.map(([x, z]) => CW(x, z)); X.s = 36; X.vmax = 0; X.hdV = null; X.stop = CR_PB_END - 12; CR.xGone = false; CR.pushT = null; CR.push0 = null; const [x, z, hd] = pathAt(X.path, X.s); vehPose(X, x, z, hd); } }
  const J = CR_J0.map(([x, z]) => CW(x, z)), L = pathLen(J);
  C.jeeps.forEach((v, i) => { v.shown = true; v.g.visible = true; v.ambush = null; v.hdV = null; v.off = 0; v.path = J; v.gap = i * 14;
    v.s = stage === 0 ? (i ? 34 - i * 14 : 48) : stage === 1 ? CR_PB_END + 30 - i * 14 : L - i * 14; v.vmax = stage === 0 ? 0 : 6.5; v.stop = stage === 0 ? CR_PB_END - (i ? 12 + v.gap : 0) : stage === 1 ? undefined : v.s; const [x, z, hd] = pathAt(J, v.s); vehPose(v, x, z, hd); });
  // the two tanks ahead of the jeeps on the bridge: over, and away west into the bridgehead
  if (stage === 0) C.pbT.forEach((v, i) => { v.shown = true; v.g.visible = true; v.path = [...CR_PB_PATH, [-100, 404], [-124, 405], [-160, 424], [-205, 441], [-245, 449]].map(([x, z]) => CW(x, z)); v.s = 66 + i * 17; v.vmax = 0; v.hdV = null; v.onEnd = (q) => { q.g.visible = false; q.shown = false; }; const [x, z, hd] = pathAt(v.path, v.s); vehPose(v, x, z, hd); });
  const lead = C.jeeps[0];
  lead.crew[0].visible = stage > 1;
  if (stage <= 1) { P.ride = { pos: () => lead.g.localToWorld(V3(-1.2, 1.3, 0)), eye: 1.62, mg: true, gun: C.mg, muzzle: () => C.mg.localToWorld(V3(0, 0.012, -1.5)) }; lead.g.updateMatrixWorld(true); P.pos.copy(P.ride.pos()); P.yaw = Math.PI / 2; P.pitch = -0.04; vm.visible = false; }
  else if (stage === 2) { const [x, z] = CW(-146.6, 13.2); P.pos.set(x, groundAt(x, z), z); P.yaw = Math.atan2(7.4, -6.4); P.pitch = 0; }
  const seats = [crSeat(lead, -1.5, -0.55), crSeat(lead, -1.5, 0.55), crSeat(C.jeeps[1], -1.45, -0.5), crSeat(C.jeeps[1], -1.45, 0.5), crSeat(C.jeeps[1], -0.35, 0.3), crSeat(C.jeeps[2], -1.45, -0.5), crSeat(C.jeeps[2], -1.45, 0.5), crSeat(C.jeeps[2], -0.35, 0.3)];
  // the night: the house at the head of the street. Our men at three of the four windows on the junction, both sides of the barricaded door, the
  // north window and a window looking back down the street; the fourth window on the junction is the player's
  const D = C.vh.D, win = (k) => D.win.filter((w) => w.wall === k).map((w) => w.slot), W = win('w'), dp = (lz) => { const [x, z] = CW(CR_D.x - CR_D.w / 2 + CR_WT / 2 + 0.6, lz); return { x, z, y: D.y, nx: -1, nz: 0 }; };
  const posts = [W[0], W[1], W[3], dp(-0.75), dp(0.75), win('n')[0], win('e')[0], win('e')[1]];
  if (stage >= 3) { const s = W[2]; P.pos.set(s.x, hAt(s.x, s.z, s.y + 0.4), s.z); P.yaw = Math.PI / 2; P.pitch = 0; }
  const fw = [-Math.sin(P.yaw), -Math.cos(P.yaw)];
  fieldFriends(CR_NAMES.map((name, i) => {
    const fo = CR_FOLLOW.indexOf(i); if (fo < 0) return null;
    if (stage <= 1) return { name, state: 'ride', ride: seats[fo], fi: fo };
    if (stage === 2) { const b = 2.2 + fo * 1.2; return { name, x: P.pos.x - fw[0] * b + (fo % 2 ? 1 : -1) * fw[1] * 0.8, z: P.pos.z - fw[1] * b - (fo % 2 ? 1 : -1) * fw[0] * 0.8, state: 'follow', fi: fo }; }
    return posts[fo] ? crPost(posts[fo], name) : null;
  }));
  crDynApply(); crBridgePose(0); crStage(stage);
}
function crStage(i) {
  const C = CHAP.cross; fieldStage(C, i); CR.stage = i; CR.msgs = {}; crDynApply();
  if (i === 0) { if (CR.introSeen) DIRQ.push({ at: GAME.t + 0.4, fn: crIntroEnd }); else DIRQ.push({ at: GAME.t + 0.4, fn: () => crIntroFilm() }); }
  if (i === 1) { const lead = C.jeeps[0]; C.stops = {}; for (const id in CR_AMB) C.stops[id] = crSAt(lead.path, ...CW(...CR_AMB[id].stop)); radio('מ״פ', 'עברנו! עכשיו צפונה בין השדות, לאורך הסוללה, אל הכפר — שם יעלה גשר הגלילים לגדה. מקלעים מוכנים!', 4); }
  if (i === 2) {
    radio('מ״פ', 'קפצו מהג׳יפים! הכפר שולט על המקום שבו יעלה הגשר. הרחוב חסום בגדר תיל — עוברים דרך החצרות והבתים, בית אחרי בית!', 4.5);
    hint('cr-gate', `<b>בית אחרי בית, בדרך אחת:</b> חצר, בית, חוצים את הרחוב אל הבית שממול, ודרך החצר שלו לחצר הבאה. הדלת הבאה מסומנת ב־◆ — היא נפתחת לדרך רק כשכל המצרים בקטע מתים. בכל בית יש מצרי שמחכה בחדר השני.`, 10);
    crVillageMan(); crVGate(0);
  }
  if (i === 3) crHoldStart();
  if (i === 4) { meter(null); if (!CR.tanksOn) crTanksGo(); radio('מג״ד', 'הגשר מונח! הטנקים עולים עליו — הם באים במעלה הרחוב ומסביב לכפר. החזיקו עוד קצת!', 4); crWaveGo(9); }
}
/* the street: every house manned before the advance reaches it - men at the windows that look onto the route, one inside each house on the route,
   waiting in its second room. Each bound: [house, the wall and which of its windows (or 'g', the man inside; 'in', inside the house at the
   head), weapon, from which level on] */
const CR_VMEN = [
  [['S1', 'e', 0, 'rifle', 0], ['S1', 's', 0, 'smg', 0], ['n0', 'e', 1, 'rifle', 1]],
  [['S1', 'g', 0, 'smg', 0], ['N1', 's', 0, 'rifle', 0], ['n0', 's', 0, 'lmg', 1], ['s1', 'n', 0, 'rifle', 0]],
  [['N1', 'g', 0, 'rifle', 0], ['N2', 'n', 0, 'rifle', 0]],
  [['N2', 'g', 0, 'smg', 0], ['S2', 'n', 0, 'rifle', 0], ['s2', 'n', 0, 'lmg', 1], ['n3', 's', 0, 'rifle', 0]],
  [['S2', 'g', 0, 'rifle', 0], ['S3', 's', 0, 'smg', 0]],
  [['S3', 'g', 0, 'smg', 0], ['N3', 's', 0, 'rifle', 0], ['n4', 's', 0, 'rifle', 1], ['s5', 'n', 0, 'lmg', 0], ['D', 'e', 0, 'rifle', 2]],
  [['N3', 'g', 0, 'rifle', 0], ['D', 'n', 0, 'smg', 0]],
  [['D', 'in', 0, 'smg', 0], ['D', 'in', 1, 'rifle', 1]],
];
function crVillageMan() {
  const C = CHAP.cross, di = crDi();
  CR_VMEN.forEach((list, b) => { for (const [id, wall, k, kind, lv] of list) { if (di < lv) continue; const H = C.vh[id];
    const s = wall === 'g' ? H.guard : wall === 'in' ? C.dIn[k] : (H.win.filter((w) => w.wall === wall)[k] || {}).slot;
    const e = fSlotPlace(s, kind, 'g' + b, { wakeR: wall === 'g' || wall === 'in' ? 7 : 30 }); if (e) e.cyc = rand(0.3, 0.8); } });
}
// the advance through the street: as the field's gates, but a bound is clear only when every man in it is down - seen or not
const crRouteLeft = () => UNITS.enemies.reduce((n, e) => n + (e.alive && e.sq === 'g' + CR.rg.i ? 1 : 0), 0);
const CR_VSAY = [
  'פורצים לחצר של הבית הראשון — דרך הפרצה בחומה המזרחית!',
  'בחצר! פנימה מהדלת האחורית — חדר, ואחריו החדר השני. אחר כך החוצה לרחוב, אל הבית שממול.',
  'חצינו! הבית שממול — פנימה, ואז דרך החצר שלו, בפרצה, אל החצר הבאה.',
  'החצר הבאה! הדלת האחורית של הבית — פנימה, ומשם שוב לרחוב.',
  'עוד חציה! הבית שממול, ודרך החצר שלו אל הבית הבא.',
  'הדלת האחורית! פנימה, ואחר כך החוצה — אל הבית האחרון שממול.',
  'הבית האחרון! דרך החצר שלו, בפרצה — אל החצר של הבית שבראש הרחוב.',
  'הדלת של הבית שבראש הרחוב — פנימה! מכאן שולטים על הצומת.',
];
function crVGate(k) {
  // the bound's men stop hiding: the player sees where the fire will come from
  for (const e of UNITS.enemies) if (e.alive && e.sq === 'g' + k && e.dormant) { e.dormant = false; e.cyc = rand(0.4, 1.4); }
  radio('מ״פ', CR_VSAY[k], 3.4);
}
function crRouteUpd(dt) {
  if (CINE.on || CR.msgs.vdone) return; const R = CR.rg, n = CR_VG.length - 1; R.t += dt;
  const left = crRouteLeft(); if (left > 0 && !(R.t > 60 && left <= 1) && R.t < 100) { R.clear = false; return; }
  if (!R.clear) { R.clear = true; for (const e of UNITS.enemies) if (e.alive && e.sq === 'g' + R.i && !fieldSees(e, 120)) { e.alive = false; e.rig.root.visible = false; e.tag.visible = false; if (e.slot) { e.slot.used = false; e.slot = null; } }
    if (R.i >= n - 1) { crVDone(); return; } radio('צנחן', pick(['נקי! הבא!', 'נקי! קדימה, לדלת הבאה!', 'הבית נקי!']), 2); feed(`הקטע נקי · הדלת הבאה ◆ (${R.i + 2}/${n})`, 'good'); }
  const [x, z] = CW(...CR_VG[R.i + 1]); if (Math.hypot(P.pos.x - x, P.pos.z - z) < 2.8) { R.i++; R.clear = false; R.t = 0; if (R.i >= n) { crVDone(); return; } feed(`בית ${R.i}/${n - 1}`); crVGate(R.i); snapRequest('gate'); }
}
function crVDone() {
  if (CR.msgs.vdone) return; CR.msgs.vdone = true;
  feed('הרחוב בידינו', 'good'); radio('מ״פ', 'הרחוב שלנו! כולם לבית שבראש הרחוב — מכאן הם יבואו, מכל הכיוונים של הצומת.', 4); snapRequest('village');
  DIRQ.push({ at: GAME.t + 4.5, fn: () => crCut(() => crSetup(3)) });
}
/* ---------- the night: the bridge goes into the water, the Egyptians come for the junction ---------- */
const CR_HOLD = [150, 165, 180];   // seconds the roller bridge takes to cross, by level: the length of the stand
// the waves: which ways in each comes by, and how many men down each (on the middle level; the easy level brings fewer, the hard one more)
const CR_WAVES = [[['w'], 4], [['n'], 5], [['s'], 5], [['w', 'n'], 4], [['s', 'w'], 4], [['n', 's'], 4], [['w', 'n', 's'], 3], [['n', 's', 'w'], 4], [['w', 's', 'n'], 4], [['n', 'w', 's'], 4]];
function crHoldStart() {
  const C = CHAP.cross; CR.push = true; CR.wave = 0; CR.waveT = 2;
  const tip = () => V3(CR.o.x + 100 - CR.br * CR_BLEN, 1.0, CR.o.z), [vx, vz] = CW(-240, 0), vil = V3(vx, groundAt(vx, vz), vz);
  { const [x, z] = CW(rand(-40, 40), 30); spawnFlare(x, z, 150, 30, 26, 0.6); } { const [x, z] = CW(-275, 0); spawnFlare(x, z, 160, 30, 26, 0.5); }
  playCine({ vid: 'cr_hold',
    title: 'הצומת · הלילה שבין 18 ל־19 באוקטובר 1973',
    shots: [
      { d: 7.5, cam: camLerp(() => V3(CR.o.x + 132, 6.5, CR.o.z + 24), () => V3(CR.o.x + 122, 5.2, CR.o.z + 20), () => tip().add(V3(16, 0, 0)), () => tip(), 50) },
      { d: 7.5, cam: camLerp(vil.clone().add(V3(16, 15, 22)), vil.clone().add(V3(10, 12, 16)), vil.clone().add(V3(-16, 0, 0)), vil.clone().add(V3(-22, 0, 0)), 56) },
    ],
    caps: [[0.4, '<b>19 באוקטובר, אחרי חצות.</b> הטנקים דוחפים את גשר הגלילים אל המים, גליל אחרי גליל.', 6.8], [7.8, 'בכפר, הצנחנים בבית שבראש הרחוב. מולם הצומת — ושלוש דרכים שמהן יבואו המצרים.', 6.8]],
    end: () => { CR.filmTod = null; radio('מ״פ', 'כל אחד בחלון שלו! הם יבואו מהסמטה הצפונית, מהסמטה הדרומית ומהדרך שממערב — לא נותנים להם להגיע לקירות!', 4.4);
      hint('cr-hold', `<b>מחזיקים את הבית מול הצומת.</b> ירו מהחלונות על כל מי שרץ אליכם — מהסמטאות בצפון ובדרום ומהדרך שממערב. מי שמגיע לקיר זורק רימון פנימה: התרחקו מהסימן ⚠. מאחוריכם, דרך החלונות המזרחיים, רואים את גשר הגלילים נדחף אל המים — הפס למעלה מראה כמה נשאר.`, 12); },
  });
}
/* one man of a wave: out of sight up his lane, at a run through its mouth to a window or the door of the house - he does not stop to fight on the
   way. At the wall he fires in point blank and, if he carries one, throws a grenade in. The bazooka men stop in the mouth and fire from there */
function crStormer(f, k, j, kind) {
  const F = CR_FRONT[f], r = rng(9000 + CR.wave * 131 + k * 17 + j), lat = (r() - 0.5) * (f === 'w' ? 5 : 8), [x, z] = CW(F.from[0] + (f === 'w' ? r() * 6 : lat), F.from[1] + (f === 'w' ? lat : (r() - 0.5) * 6));
  const rpg = kind === 'rpg', mouth = CW(F.mouth[0] + (f === 'w' ? 0 : lat * 0.6), F.mouth[1] + (f === 'w' ? lat * 0.6 : 0)), t = F.tgt[(k + j) % F.tgt.length], end = rpg ? CW(F.rpg[0] + lat * 0.3, F.rpg[1]) : CW(t[0] - r() * 0.5, t[1] + (r() - 0.5) * 1.6);
  const path = f === 'w' ? [CW(-318, lat * 0.4), mouth, end] : [mouth, end], e = fSpawnStreet0(x, z, path, kind); if (!e) return null;
  e.sq = 'h'; e.crFront = f; e.tac = rpg ? 'hold' : 'storm'; e.wild = !rpg; e.crSt = !rpg; e.crG = r() < [0.25, 0.45, 0.5][crDi()] ? 1 : 0; e.crAt = null; e.crK = r(); e.rpgCd = rpg ? 4 + r() * 4 : 99;
  return e;
}
function crWave(n) {
  const [fronts, base] = CR_WAVES[Math.min(n, CR_WAVES.length - 1)], k = [0.7, 1, 0.85][crDi()], m = Math.max(2, Math.round(base * k));
  fronts.forEach((f, fi) => { for (let j = 0; j < m; j++) DIRQ.push({ at: GAME.t + fi * 1.6 + j * 0.85, spawn: true, fn: () => crStormer(f, fi, j, j === 2 && n % 2 === 1 ? 'rpg' : j % 4 === 3 ? 'smg' : 'rifle') }); });
  if (n === 2) for (const s of CHAP.cross.nests.h) { const e = fSlotSpawn(s.kind, (q) => q === s, 'h'); if (e) { e.crSt = false; e.crFront = 'w'; } }
  const where = fronts.map((f) => CR_FRONT[f].name).join(fronts.length > 2 ? ', ' : ' ו');
  radio('תצפית', fronts.length > 2 ? `מכל הכיוונים! ${where}!` : `${n ? 'עוד גל' : 'הם באים'} — ${where}!`, 3);
  CR.lastFronts = fronts;
}
// the last assault, as the tanks come: everything down all three ways at once
function crWaveGo(n) { CR.wave = n; crWave(n); }
/* at the wall: a man who got there fires in at whatever he sees and throws his grenade in at the window or the doorway beside him */
function crStormUpd(dt) {
  const C = CHAP.cross, D = C.vh.D, live = PROJ.filter((q) => q.type === 'gren' && q.owner === 'e').length, cap = [1, 2, 3][crDi()];
  for (const e of UNITS.enemies) {
    if (!e.alive || !e.crSt || e.state !== 'sz' || e.sz !== 'street' || !e.path) continue;   // (a man's flags outlive him: the pool hands his body on)
    if (e.pi < e.path.length) continue;
    if (e.crAt === null) { e.crAt = GAME.t; e.crGT = GAME.t + 2.2 + e.crK * 1.6; }
    if (e.crG > 0 && GAME.t > e.crGT && live < cap && P.alive) {
      // the opening beside him, and a point two metres inside it: whoever stands at that window has the fuse's two seconds to get away from it
      let best = null, bd = 1e9; for (const w of D.win.concat([{ x: CR_D.x - CR_D.w / 2, z: 0, nx: -1, nz: 0 }])) { if (w.nx > -0.5) continue; const [wx, wz] = CW(w.x, w.z), d = Math.hypot(wx - e.pos.x, wz - e.pos.z); if (d < bd) { bd = d; best = [wx, wz]; } }
      if (best && bd < 4.5) { const pin = V3(best[0] + 2.4, D.y + 0.2, best[1] + (e.crK - 0.5) * 1.6);
        const from = e.chest().add(V3(0, 0.6, 0)), T = 0.9, v = V3((pin.x - from.x) / T, (pin.y - from.y) / T + 4.9 * T, (pin.z - from.z) / T); throwGrenade(from, v, 'e'); e.face(pin.x, pin.z); e.throwT = 0.5;
        e.crG--; e.crGT = GAME.t + 7; if (Math.random() < 0.5) radio(pick(CR_NAMES), pick(['רימון! בחלון!', 'רימון פנימה! זוזו!', 'הוא ליד הקיר — רימון!']), 2); } }
  }
}
function crBridgeDone() {
  const C = CHAP.cross; CR.push = false; meter('גשר הגלילים', 1); feed('גשר הגלילים מונח', 'good'); crTanksGo();
  for (let i = DIRQ.length - 1; i >= 0; i--) if (DIRQ[i].spawn) DIRQ.splice(i, 1);
  const t0 = () => C.tanks[0].g.position.clone(), wb = V3(CR.o.x - 112, 4.2, CR.o.z - 16);
  playCine({ vid: 'cr_bridge', shots: [{ d: 8.5, cam: camLerp(wb, wb.clone().add(V3(3, -0.6, 2)), () => t0().add(V3(-26, 1, 0)), () => t0().add(V3(0, 1.5, 0)), 44) }],
    caps: [[0.5, '<b>19 באוקטובר.</b> הקצה נוגע בגדה המערבית. הטנק הראשון עולה על גשר הגלילים.', 7.6]],
    end: () => crStage(4) });
}
/* ---------- the tanks: over the bridge, up the street, and round the village through the gates into the lanes - with every gun they have ---------- */
const CR_TDEST = [[[-150, 0], [-226, 0]], [[-150, 0], [-150, -34], [-232, -34], [-242, -43], [-251, -43], [-253.5, -34]], [[-150, 0], [-150, 34], [-232, 34], [-242, 43], [-251, 43], [-253.5, 34]], [[-150, 0], [-210, 0]], [[-150, 0], [-192, 0]], [[-150, 0], [-172, 0]]];
function crTanksGo() {
  const C = CHAP.cross; CR.tanksOn = true;
  C.tanks.forEach((v, i) => { vehRevive(v); const pts = [[104 + i * 15, 0], [100, 0], [-100, 0], ...CR_TDEST[i]]; v.path = pts.map(([x, z]) => CW(x, z)); v.s = 0; v.vmax = 8.5; v.speed = 0; v.stop = pathLen(v.path); v.ended = false; v.hdV = null; v.onEnd = null; v.shown = true; v.g.visible = true; v.name = ['הטנק הראשון', 'טנק 2', 'טנק 3', 'טנק 4', 'טנק 5', 'טנק 6'][i]; v.mgT = rand(0, 1); v.gunT = rand(1.5, 3.5); const [x, z, hd] = pathAt(v.path, 0); vehPose(v, x, z, hd); });
}
// a tank's machine gun in long bursts, and its gun every few seconds where the Egyptians are thickest
function crTankGun(v, dt) {
  if (!v.alive || !v.g.visible) return; const from = v.g.position.clone(); from.y += 2.55;
  v.tgtT = (v.tgtT || 0) - dt; if (v.tgtT <= 0 || !v.tgt || !v.tgt.alive) { v.tgtT = 0.5; v.tgt = null; let bd = 320; for (const e of UNITS.enemies) { if (!e.alive || !e.rig.root.visible) continue; const c = e.chest(), d = from.distanceTo(c); if (d < bd && losW(from.x, from.y, from.z, c.x, c.y, c.z)) { bd = d; v.tgt = e; } } }
  const e = v.tgt; if (!e) return; const c = e.chest();
  v.mgT -= dt; if (v.mgT <= 0) { v.mgN = (v.mgN ?? 14) - 1; v.mgT = 0.08; if (v.mgN <= 0) { v.mgT = rand(0.35, 0.8); v.mgN = Math.floor(rand(10, 20)); }
    const mz = from.clone().add(V3(0, 0.15, 0)); if (Math.random() < 0.5) fxMuzzle(mz, false); fxTracer(mz, c.clone().add(V3(rand(-1.3, 1.3), rand(-0.7, 0.9), rand(-1.3, 1.3))), false); if (Math.random() < 0.35) sndShot('lmg', mz);
    if (Math.random() < 0.07) killEnemy(e, false); else if (Math.random() < 0.3) fxDust(V3(c.x + rand(-1.5, 1.5), groundAt(c.x, c.z) + 0.1, c.z + rand(-1.5, 1.5))); }
  v.gunT -= dt; if (v.gunT <= 0) { v.gunT = rand(2.4, 4.0); const p = e.pos.clone(), a = Math.atan2(p.x - from.x, p.z - from.z), mz = v.g.position.clone().add(V3(Math.sin(a) * 4.6, 2.3, Math.cos(a) * 4.6)); fxMuzzle(mz, true); fxExplosion(mz, 0.4); sndBoom(mz, 1.0); fxTracer(mz, c, true); FX.shake = Math.max(FX.shake, clamp(0.5 - camera.position.distanceTo(mz) / 80, 0, 0.4));
    DIRQ.push({ at: GAME.t + 0.22, fn: () => { p.y = groundAt(p.x, p.z); fxExplosion(p, 1.3); sndBoom(p, 1.1); for (const o of UNITS.enemies) if (o.alive && o.pos.distanceTo(p) < 5.5) killEnemy(o, false); } }); }
}
// the Egyptians break: whoever is left turns and runs back the way he came
function crFlee() {
  CR.msgs.flee = true; CR.fleeT = CHAP.cross.t; for (let i = DIRQ.length - 1; i >= 0; i--) if (DIRQ[i].spawn) DIRQ.splice(i, 1);
  for (const e of UNITS.enemies) if (e.alive && e.sz && e.sq === 'h') { e.state = 'film'; e.sz = null; e.dormant = false; e.drift = rand(-0.9, 0.9); e.anim = rand(0, 6); if (e.slot) { e.slot.used = false; e.slot = null; } CR.flee.push(e); }
  radio('מ״פ', 'הם בורחים! הם נשברים ובורחים לשדות!', 3); feed('המצרים נסוגים', 'good');
}
/* ---------- every frame ---------- */
function crLook(dt) {
  { let fl = 0; for (const f of FLARES) { const k = f.t < 1.5 ? f.t / 1.5 : f.t > f.life - 4 ? Math.max(0, (f.life - f.t) / 4) : 1, d = Math.hypot(f.x - P.pos.x, f.z - P.pos.z); fl = Math.max(fl, k * clamp(1 - d / 520, 0, 1)); } FLARE_LIGHT = fl; }
  // illumination rounds over the fields and over the canal, on the night
  if (CR.stage >= 3 && !CINE.on) { CR.illumT -= dt; if (CR.illumT <= 0) { CR.illumT = rand(8, 12); CR.illumN = (CR.illumN || 0) + 1; const [x, z] = CR.illumN % 3 === 0 ? CW(rand(-60, 60), rand(-50, 50)) : CW(rand(-300, -210), rand(-55, 55)); spawnFlare(x, z, rand(150, 180), 30, 26, 0.5); } }
}
function crUpd(dt) {
  const C = CHAP.cross; C.t += dt; CR.t = (CR.t || 0) + dt; if (Math.floor(C.t * 2) !== Math.floor((C.t - dt) * 2)) szEnemyCleanup();
  for (let i = DIRQ.length - 1; i >= 0; i--) if (DIRQ[i] && GAME.t >= DIRQ[i].at) { const q = DIRQ.splice(i, 1)[0]; q.fn(); }
  crJetsUpd(dt); crBombsUpd(dt); updDebris(dt); crHitUpd(dt); rippleUpd(dt); crRepUpd(dt); crConvUpd(dt); crLook(dt); if (!CR.msgs.flee) crShells(dt);
  if (CR.push && CR.br < 1) CR.br = Math.min(1, CR.br + dt / CR_HOLD[crDi()]);
  crBridgePose(dt);
  if (CR.stage < 2 && !CINE.on && !(CR.stage === 0 && !CR.msgs.go)) { CR.air -= dt; if (CR.air <= 0) { CR.air = rand(20, 30); crJet(CR.stage === 0 ? 'pb' : 'bridge'); } }
  // the jeep's machine gun turns with the gunner
  if (P.ride && P.ride.mg) { C.mg.visible = !CINE.on; C.mg.quaternion.copy(camera.quaternion); C.mg.position.copy(playerEye()).add(V3(0.0, -0.44, -0.3).applyQuaternion(camera.quaternion)); }   /* at his hands, not the eye's: the eye stands back of his helmet */ else C.mg.visible = false;
  // the Egyptians who break run back the way they came: up the lanes, or west down the road (kept between its walls)
  for (const e of CR.flee) { if (!e.alive) continue; const sp = 5.4 * dt, lx = e.pos.x - CR.o.x, lz = e.pos.z - CR.o.z;
    if (e.crFront === 'n' || e.crFront === 's') { const sg = e.crFront === 'n' ? -1 : 1; e.pos.z += sg * sp; e.pos.x += clamp(clamp(lx, CR_LX1 + 1.5, CR_LX0 - 1.5) - lx, -3 * dt, 3 * dt); e.heading = sg < 0 ? Math.PI : 0; }
    else { e.pos.x -= sp; if (e.crFront === 'w' && lx < CR_LX0 - 1 && lx > -304) e.pos.z += clamp(clamp(lz, -3.5, 3.5) - lz, -3 * dt, 3 * dt); else e.pos.z += (e.drift || 0) * dt; e.heading = -Math.PI / 2; }
    e.pos.y = groundAt(e.pos.x, e.pos.z); e.anim += dt * 11; e.stance = 'stand'; e.rig.pose('run', e.anim); e.sync(); }
  if (CR.stage === 4) for (const v of C.tanks) crTankGun(v, dt);
  if (CR.stage === 0) {
    // the column crawls over the bridge behind the tanks; the Egyptians on the rampart open fire as it reaches the middle; it goes on when they are quiet
    const lead = C.jeeps[0], X = C.jeepX;
    if (CR.msgs.go && !CR.hit3 && !CR.strike && !CR.shellIn && X.g.position.x - CR.o.x < 10) crStrike(); crStrikeUpd(dt); crShellUpd(dt);
    // the two jeeps behind wait behind the burning one until it is pushed into the canal
    if (X.crHit && !CR.xGone) { C.jeeps[1].stop = Math.min(C.jeeps[1].stop, X.s - 11); C.jeeps[2].stop = Math.min(C.jeeps[2].stop, X.s - 25); }
    else if (CR.xGone && !CR.msgs.xFree) { CR.msgs.xFree = true; C.jeeps[1].stop = CR_PB_END - 26; C.jeeps[2].stop = CR_PB_END - 40; }
    if (lead.g.position.x - CR.o.x < 62 && !CR.msgs.fire) { CR.msgs.fire = true; let first = true; for (const s of C.slots) if (s.grp === 'L') { fSlotSpawn(first ? 'rpg' : 'rifle', (q) => q === s, 'L'); first = false; } radio('צנחן', 'אש מהסוללה! מצפון לגשר, על הסוללה — מקלע!', 2.4);
      for (let k = 0; k < 8; k++) DIRQ.push({ at: GAME.t + 3 + k * 1.2, spawn: true, fn: () => { const [x, z] = CW(-129 + (k % 3) * 2, 296 - k * 3), [tx, tz] = CW(-123 - (k % 4) * 2.5, 350 + k * 5); const e = fSpawnStreet(x, z, [[tx, tz]], k % 4 === 2 ? 'rpg' : 'rifle'); if (e) e.sq = 'L'; } }); }
    if (lead.s >= lead.stop - 0.8) { CR.msgs.landT = (CR.msgs.landT || 0) + dt; if (!CR.msgs.off && holdDone(fieldLeft((e) => e.sq === 'L'), CR.msgs.landT)) { CR.msgs.off = true; fieldDespawn((e) => e.sq === 'L'); radio('נהג', 'יורדים מהגשר! מחזיקים חזק!', 2); crStage(1); } }
  } else if (CR.stage === 1) {
    const lead = C.jeeps[0], L = pathLen(lead.path);
    for (const id in CR_AMB) { const s0 = C.stops[id]; if (lead.s > s0 - 75 && !CR.msgs[id]) { CR.msgs[id] = true; crAmbush(id); lead.stop = s0; } }
    // after the last ambush the track runs straight along the rampart: the column picks up speed
    if (CR.msgs.a1 && lead.stop === undefined) lead.vmax = 8.5;
    for (const v of C.jeeps) { v.stop = lead.stop === undefined ? (v === lead ? undefined : L - v.gap) : lead.stop - v.gap; if (v !== lead) v.vmax = lead.vmax; }
    if (lead.stop !== undefined && lead.s > lead.stop - 0.8) { CR.msgs.wait = (CR.msgs.wait || 0) + dt; const left = fieldLeft((e) => e.sq === lead.ambush); if (holdDone(left, CR.msgs.wait)) { fieldDespawn((e) => e.sq === lead.ambush); lead.stop = undefined; CR.msgs.wait = 0; radio('נהג', left ? 'אין זמן, ממשיכים!' : 'נקי! ממשיכים!', 2); } }
    if (lead.s >= L - 0.6 && !CR.msgs.out) { CR.msgs.out = true; crDismount(); }
  } else if (CR.stage === 2) { updTrail(dt); crRouteUpd(dt); }
  else if (CR.stage === 3) {
    updTrail(dt); if (CINE.on) return; crStormUpd(dt);
    CR.waveT -= dt; if (CR.waveT <= 0 && CR.br < 0.94 && CR.wave < CR_WAVES.length - 1) { crWave(CR.wave++); CR.waveT = (CR_HOLD[crDi()] - 12) / (CR_WAVES.length - 1); }
    for (const [k, txt] of [[0.3, 'הגשר בשליש הדרך! תחזיקו!'], [0.55, 'חצי גשר במים!'], [0.8, 'שמונים אחוז! הקצה כמעט אצלנו!'], [0.95, 'עוד גליל אחד! הטנקים מתניעים!']]) if (CR.br >= k && !CR.msgs['b' + k]) { CR.msgs['b' + k] = true; radio('גשר', txt, 3); }
    if (CR.br >= 0.5 && !CR.msgs.look) { CR.msgs.look = true; hint('cr-look', 'הסתכלו לאחור דרך החלון המזרחי, במורד הרחוב: הפנסים על גשר הגלילים כבר באמצע התעלה, והטנקים מאחוריו.', 7); }
    if (CR.br >= 1 && !CR.msgs.done) { CR.msgs.done = true; crBridgeDone(); }
  } else if (CR.stage === 4) {
    updTrail(dt); if (CINE.on) return; crStormUpd(dt);
    const arr = [C.tanks[1], C.tanks[2]].some((v) => v.alive && v.s >= v.stop - 0.6);
    if (!CR.msgs.arr && arr) { CR.msgs.arr = true; radio('מפקד הטנק', 'אנחנו בסמטה! תנו לנו מטרות — אנחנו מנקים את הצומת!', 3.2); DIRQ.push({ at: GAME.t + 7, fn: () => { if (!CR.msgs.flee) crFlee(); } }); }
    if (!CR.msgs.flee && C.t > 80) crFlee();
    if (CR.msgs.flee && !CR.msgs.end && C.t - CR.fleeT > 9) { CR.msgs.end = true; DIRQ.push({ at: GAME.t + 0.5, fn: crEndFilm }); }
  }
}
function crAmbush(id) {
  const C = CHAP.cross, lead = C.jeeps[0], A = CR_AMB[id]; lead.ambush = id;
  for (const s of C.nests[id]) fSlotSpawn(s.kind, (q) => q === s, id);
  const rr = rng(7300 + id.charCodeAt(1));   // the same runners from the same places on every try
  for (let k = 0; k < 13; k++) { const ox = rr() * 20 - 10, oz = rr() * 28 - 14, tx0 = 10 + rr() * 10, tz0 = rr() * 16 - 8; DIRQ.push({ at: GAME.t + 2 + k * 0.7, spawn: true, fn: () => { const [x, z] = corr(CR_JEEP, A.from[0] + ox, A.from[1] + oz, 22, 14), [tx, tz] = corr(CR_JEEP, x + tx0, z + tz0, 14, 7); const e = fSpawnStreet(...CW(x, z), [CW(tx, tz)], k === 3 ? 'rpg' : 'rifle'); if (e) e.sq = id; } }); }
  radio('צנחן', A.txt, 2.6);
}
function crDismount() {
  const C = CHAP.cross, lead = C.jeeps[0]; P.ride = null; C.mg.visible = false; vm.visible = true; P.crouch = false; lead.crew[0].visible = true;
  const p = lead.g.localToWorld(V3(-0.6 * JK, 0, -2.0 * JK)); P.pos.set(p.x, groundAt(p.x, p.z), p.z); P.yaw = Math.atan2(7.4, -6.4); resetTrail();
  CR_FOLLOW.forEach((fi, k) => { const f = FRIENDS[fi], u = f.unit, q = C.jeeps[Math.floor(k / 3)].g.localToWorld(V3(-1.2 + (k % 3) * 0.8, 0, k % 2 ? -2.0 : 2.0)); u.place(q.x, q.z); f.state = 'follow'; f.fi = k; f.ti = 0; f.stuck = 0; f.post = { id: 'F' + fi, fx: 0, fz: -1, mag: null, occupant: f, stand: [q.x, q.z] }; });
  crStage(2); crDynApply();
}
/* ---------- films ---------- */
/* the opening: the roller bridge on the east bank, mended under fire - a tank shoves the new roller into the gap, the tanks close it up, shells
   throw up the canal; then the pontoon bridge to the south, the tanks and the jeeps on it */
function crIntroFilm() {
  const C = CHAP.cross, pb = () => C.jeeps[0].g.position.clone(), cx12 = 100 + 12.5 * CR_SEGL, slot = V3(CR.o.x + cx12, 2.6, CR.o.z), g = groundAt(slot.x, slot.z);
  crRepStart(); CR.filmTod = 7 * 60 + 50;
  const water = (lx, lz, k) => () => crBurst(CR.o.x + lx, CR.o.z + lz, k), land = (lx, lz) => () => { const [x, z] = CW(lx, lz), p = V3(x, groundAt(x, z), z); fxExplosion(p, 1.2); sndBoom(p, 1.0); };
  // slow: every shot long enough to look at - the tank shoving the roller, the water thrown up by the shells, the bridge of pontoons
  playCine({ vid: 'cr_intro',
    title: 'הגשרים · 16–18 באוקטובר 1973',
    shots: [
      { d: 8.5, cam: camLerp(V3(slot.x + 54, 34, slot.z + 66), V3(slot.x + 36, 25, slot.z + 52), slot.clone().add(V3(-30, -2, 0)), slot.clone().add(V3(-16, -2, 0)), 50) },
      { d: 10.5, cam: camLerp(V3(slot.x - 17, g + 5.2, slot.z + 21), V3(slot.x - 14, g + 4.7, slot.z + 18), slot.clone().add(V3(2, 2.0, -7)), slot.clone().add(V3(0, 1.4, -3)), 50) },
      { d: 8.0, cam: camLerp(V3(CR.o.x + 66, 1.5, CR.o.z + 30), V3(CR.o.x + 69, 1.45, CR.o.z + 27), V3(CR.o.x + 150, 2.5, CR.o.z), V3(CR.o.x + 162, 2.5, CR.o.z), 46) },
      { d: 8.5, cam: (u) => ({ p: pb().add(V3(-26 + u * 6, 7.5, 24)), l: pb().add(V3(-6, 1.0, 0)), fov: 50 }) },
    ],
    ev: [[1.8, water(70, 26, 1.5)], [4.0, land(220, 40)], [5.8, water(55, -18, 1.4)], [10.5, water(84, 14, 1.2)], [13.5, land(162, -30)], [17.0, water(64, 9, 1.4)], [20.2, water(86, -7, 1.6)], [22.0, water(74, 18, 1.5)], [24.0, land(236, -24)], [25.6, water(60, -12, 1.3)], [27.0, () => { crRepEnd(); CR.filmTod = null; }], [29.5, water(40, CR_PB_Z + 26, 1.3)], [32.0, water(-30, CR_PB_Z - 22, 1.2)]],
    caps: [[0.6, '<b>16 באוקטובר.</b> בדרך אל התעלה נשבר גשר הגלילים — כ־200 מטר של גלילי פלדה — ונתקע בחולות.', 7.4], [9.0, 'המהנדסים מחליפים את החוליה הפגועה, תחת הפגזה.', 8.6], [19.4, '<b>18 באוקטובר.</b> הגשר נגרר אל שפת המים. סא״ל אהרון (ג׳וני) טנא, שהוביל אותו, נופל על גדת התעלה.', 7.2], [27.4, 'מדרום, גשר הדוברות עומד על התעלה מאז אחר הצהריים של ה־17. עליו עוברים הטנקים — ואחריהם הצנחנים בג׳יפים.', 4.6], [32.4, '<b>מ״פ:</b> נוסעים! מקלעים מוכנים — ועיניים על הסוללה ממול!', 3.0]],
    end: crIntroEnd,
  });
}
function crIntroEnd() { const C = CHAP.cross; CR.introSeen = true; crRepEnd(); CR.filmTod = null; CR.msgs.go = true; for (const v of [...C.jeeps, C.jeepX, ...C.pbT]) if (v.g.visible) v.vmax = 3; hint('cr-mg', `אתם על המקלע של הג׳יפ: ${TOUCH ? 'לחצו ממושך על אש' : 'לחיצה ממושכת'} יורה צרורות. הכוונת נצמדת לאויב הקרוב. חוליות בזוקה מסומנות באדום.`, 8); }
// the column of the last film: fifty tanks along the east bank, over the bridge, west along the road
function crConvOff() { const C = CHAP.cross; CR.conv = null; if (C.conv) C.conv.visible = false; }
// on the night the tanks that will cross wait in a file beside the roller bridge on the east bank, closing up as it goes out: seen from the
// house at the head of the street, down the street and through the gap in the rampart
function crQueuePose() {
  const C = CHAP.cross, m4 = new THREE.Matrix4(), q = new THREE.Quaternion().setFromAxisAngle(V3(0, 1, 0), Math.PI), one = V3(1, 1, 1), zero = V3(0.001, 0.001, 0.001), hide = V3(0, -100, 0);
  for (let i = 0; i < 50; i++) { if (i >= 10) { C.conv.setMatrixAt(i, m4.compose(hide, q, zero)); continue; } const [x, z] = CW(160 + i * 16 - 46 * CR.br, 10.5); C.conv.setMatrixAt(i, m4.compose(V3(x, groundAt(x, z), z), q, one)); }
  C.conv.instanceMatrix.needsUpdate = true; C.conv.visible = true;
}
function crConvUpd(dt) {
  const C = CHAP.cross, V = CR.conv; if (!V) { if (CR.stage === 3 && C.conv) crQueuePose(); return; } V.s += 7 * dt; const path = V.path, m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), up = V3(0, 1, 0), hide = V3(0, -100, 0), one = V3(1, 1, 1), zero = V3(0.001, 0.001, 0.001);
  for (let i = 0; i < 50; i++) { const s = V.s - i * 17; if (s < 0) { C.conv.setMatrixAt(i, m4.compose(hide, q.identity(), zero)); continue; } const [x, z, hd] = pathAt(path, s), fy = crDeck(x, z); q.setFromAxisAngle(up, hd - Math.PI / 2); C.conv.setMatrixAt(i, m4.compose(V3(x, fy ?? groundAt(x, z), z), q, one)); }
  C.conv.instanceMatrix.needsUpdate = true; C.conv.visible = true;
}
function crEndFilm() {
  const C = CHAP.cross, t0 = C.tanks[0], lp = () => t0.g.position.clone();
  for (const e of UNITS.enemies) if (e.alive && e.state !== 'film') { e.alive = false; e.rig.root.visible = false; e.tag.visible = false; }
  for (let k = 0; k < 14; k++) { const [x, z] = CW(-262 - rand(0, 40), rand(-34, 34)), e = spawnEnemy(x, z, k % 4 ? 'rifle' : 'rpg', null, null); if (!e) continue; e.state = 'film'; e.sq = 'flee'; e.drift = rand(-0.8, 0.8); e.anim = rand(0, 6); e.noTag = true; CR.flee.push(e); }
  const path = CR_CONV.map(([x, z]) => CW(x, z)); CR.conv = { path, s: 820 };
  const camE = V3(CR.o.x + 236, 0, CR.o.z - 34); camE.y = groundAt(camE.x, camE.z) + 7;
  const fire = () => { for (const v of C.tanks) if (v.alive && v.g.visible) { const e = CR.flee.find((q) => q.alive); if (!e) return; const from = v.g.position.clone().add(V3(0, 2.6, 0)); fxTracer(from, e.chest(), false); fxMuzzle(from, false); if (Math.random() < 0.35) killEnemy(e, false); } };
  // the film is shot from a drone: low and close, circling the tanks, the shells bursting in the fields round them
  const c2 = () => { const V = CR.conv; if (!V) return lp(); const [x, z] = pathAt(V.path, Math.max(0, V.s - 34)); return V3(x, groundAt(x, z), z); };
  const drone = (cf, a0, a1, r0, r1, h0, h1, look, fov) => (u) => { const c = cf(), e = u * u * (3 - 2 * u), a = lerp(a0, a1, u), r = lerp(r0, r1, e), h = lerp(h0, h1, e); return { p: V3(c.x + Math.sin(a) * r, c.y + h, c.z + Math.cos(a) * r), l: c.clone().add(look), fov }; };
  const boom = (cf, r0, r1, k = 1) => () => { const c = cf(), a = rand(0, 6.283), r = rand(r0, r1), x = c.x + Math.sin(a) * r, z = c.z + Math.cos(a) * r, p = V3(x, groundAt(x, z), z), sz = rand(1.0, 1.6) * k; fxExplosion(p, sz); sndBoom(p, sz); FX.shake = Math.max(FX.shake, 0.18); };
  playCine({ vid: 'cr_end',
    title: 'הגדה המערבית · 19 באוקטובר 1973',
    shots: [
      { d: 8.5, cam: drone(lp, 0.9, 2.5, 22, 30, 12, 16, V3(-8, 1.2, 0), 58) },
      { d: 10.0, cam: drone(c2, -0.6, 1.3, 26, 34, 15, 19, V3(-4, 1.5, 0), 58) },
      { d: 9.5, cam: drone(c2, 1.3, 2.4, 34, 78, 19, 58, V3(-10, 0, 0), 56) },
    ],
    ev: [[0.001, () => { CR.filmTod = 25 * 60 + 20; }], ...[0.5, 1.1, 1.7, 2.3, 2.9, 3.5, 4.1, 4.7, 5.3, 5.9, 6.5, 7.1, 7.7].map((t) => [t, fire]),
      ...[0.8, 1.9, 2.7, 3.9, 4.6, 5.8, 6.9, 7.8].map((t) => [t, boom(lp, 13, 38)]),
      [8.5, () => { CR.filmTod = 30 * 60 + 15; for (const e of CR.flee) { e.alive = false; e.rig.root.visible = false; } for (const v of C.tanks.slice(3)) { v.g.visible = false; v.path = null; } }],
      ...[9.4, 10.6, 11.5, 12.9, 14.2, 15.0, 16.4, 17.7].map((t) => [t, boom(c2, 16, 44)]), ...[19.6, 21.3, 23.0, 25.1, 26.8].map((t) => [t, boom(c2, 30, 75, 1.3)])],
    caps: [[0.4, 'המצרים נשברים ונסוגים אל השדות.', 7.4], [8.8, '<b>19 באוקטובר, עם שחר.</b> טור ארוך של טנקים בדרך אל גשר הגלילים.', 8.6], [18.6, 'גשר הגלילים הונח מצפון לגשר הדוברות. בימים הבאים עברו על שני הגשרים אוגדות שלמות, וראש הגשר בגדה המערבית התרחב לרוחב של קילומטרים.', 9.0]],
    end: () => { CR.filmTod = null; DIRQ.push({ at: GAME.t + 0.3, fn: () => endGame(true) }); },
  });
}
/* ---------- the chapter's hooks ---------- */
function crObj() {
  const C = CHAP.cross;
  if (CR.stage === 0) { const e = fieldNearest((q) => q.sq === 'L'); if (e) return [e.pos.x, e.pos.y + 2.2, e.pos.z, 'מצרים על הסוללה', 'foe']; const [x, z] = CW(-100, CR_PB_Z); return [x, 1.5, z, 'קצה הגשר']; }
  if (CR.stage === 1) { const lead = C.jeeps[0]; if (lead.stop !== undefined) { const e = fieldNearest((q) => q.sq === lead.ambush); if (e) return [e.pos.x, e.pos.y + 2.2, e.pos.z, 'מארב', 'foe']; } return null; }
  if (CR.stage === 2) { if (CINE.on || CR.msgs.vdone) return null; if (crRouteLeft() > 0) { const e = fieldNearest((q) => q.sq === 'g' + CR.rg.i); return e ? [e.pos.x, e.pos.y + 2.2, e.pos.z, 'מצרי בקטע', 'foe'] : null; } const [x, z] = CW(...CR_VG[CR.rg.i + 1]); return [x, groundAt(x, z), z, CR.rg.i + 1 >= CR_VG.length - 2 ? 'הבית שבראש הרחוב' : 'הדלת הבאה']; }
  if (CR.stage === 3 || CR.stage === 4) { const e = !CR.msgs.flee && fieldNearest((q) => q.sq === 'h', 140); if (e) return [e.pos.x, e.pos.y + 2.2, e.pos.z, 'מסתערים', 'foe']; if (CR.stage === 4) { const p = C.tanks[1].g.position; return [p.x, p.y + 3.5, p.z, 'הטנקים']; } return null; }
  return null;
}
function crItems(items) {
  const C = CHAP.cross, S = CR_STAGES[CR.stage]; items.push(['go', (S.goal || S.sub) + (OBJ.on ? ' (◆)' : '')]);
  if (CR.stage === 0) { const lead = C.jeeps[0], left = fieldLeft((e) => e.sq === 'L'); items.push(['', lead.s >= lead.stop - 1 ? `בקצה הגשר · מצרים על הסוללה: ${left}` : `עד קצה הגשר: ${Math.max(0, Math.round(lead.stop - lead.s))} מ׳${left ? ` · מצרים על הסוללה: ${left}` : ''}`]); }
  if (CR.stage === 1) { const lead = C.jeeps[0]; items.push(['', lead.stop !== undefined ? `מארב! מצרים שנותרו: ${fieldLeft((e) => e.sq === lead.ambush)}` : `עד הכפר: ${Math.max(0, Math.round(pathLen(lead.path) - lead.s))} מ׳`]); }
  if (CR.stage === 2 && !CR.msgs.vdone) { const n = CR_VG.length - 1, left = crRouteLeft(); items.push([left ? '' : 'next', left ? `בית ${Math.min(CR.rg.i + 1, n - 1)}/${n - 1} · מצרים בקטע: ${left}` : `הקטע נקי · לדלת הבאה (◆)`]); }
  if (CR.stage === 3) { items.push(['next', `גשר הגלילים: ${Math.round(CR.br * 100)}%`]); const fr = (CR.lastFronts || []).map((f) => CR_FRONT[f].short); items.push(['', `גל ${CR.wave}${fr.length ? ` · ${fr.join(', ')}` : ''} · מסתערים: ${UNITS.enemies.filter((e) => e.alive && e.sq === 'h').length}`]); }
  if (CR.stage === 4) { const lead = C.tanks[0], lx = lead.g.position.x - CR.o.x; items.push(['next', CR.msgs.flee ? 'המצרים נסוגים' : lx > -100 ? `הטנק הראשון על הגשר: עוד ${Math.max(0, Math.round(lx + 100))} מ׳` : 'הטנקים בכפר!']); items.push(['', `מסתערים: ${UNITS.enemies.filter((e) => e.alive && e.sq === 'h').length}`]); }
  if (CR.stage >= 2) { const n = FRIENDS.filter((f) => f.state === 'follow' || f.state === 'post').length; items.push([n < 2 ? 'warn' : '', `צנחנים איתכם: ${n}`]); }
}
function crHints() {
  if (CR.stage === 3 && CR.br > 0.85) hint('cr-almost', 'הגשר כמעט מונח! הטנקים כבר מחכים על הגדה המזרחית.', 6);
}
function crMini(g, X, poly, dot, k) {
  const W = (pts) => pts.map(([x, z]) => CW(x, z)), tl = []; for (let z = CR_TZ0; z <= CR_TZ1; z += 4) tl.push([crTX(z), z]); const xf = 100 - CR.br * CR_BLEN;
  const box = (x, z, w, d, col) => [W([[x - w / 2, z - d / 2], [x + w / 2, z - d / 2], [x + w / 2, z + d / 2], [x - w / 2, z + d / 2]]), col];
  miniField(g, X, poly, dot, k, { bg: 'rgba(120,128,84,.92)', polys: [[W([[100, -900], [100, 900], [900, 900], [900, -900]]), 'rgba(176,152,112,.95)'], [W([[-150, -900], [-150, 900], [100, 900], [100, -900]]), 'rgba(184,160,118,.95)'], [W([[-92, -900], [-92, 900], [92, 900], [92, -900]]), 'rgba(28,70,86,.95)'], [W([[CR_BRIDGE - 8, -900], [CR_BRIDGE - 8, 900], [CR_BRIDGE + 8, 900], [CR_BRIDGE + 8, -900]]), 'rgba(40,80,90,.95)'],
      box(-193, 0, 79, 48, 'rgba(170,150,116,.9)'), box((CR_LX0 + CR_LX1) / 2, 0, CR_LX0 - CR_LX1, 2 * CR_LZ, 'rgba(160,140,108,.9)'), ...CR_VH.map((h) => box(CR_COLS[h.c], h.sd * (CR_FZ + CR_HD / 2), CR_HW, CR_HD, h.open ? 'rgba(222,206,172,.98)' : 'rgba(150,136,112,.95)')), box(CR_D.x, CR_D.z, CR_D.w, CR_D.d, 'rgba(236,222,186,1)')],
    lines: [[W([[-106, 0], [-153, 0]]), 3, 'rgba(150,130,96,.9)'], [W([[CR_LX1, 0], [-700, 0]]), 3, 'rgba(150,130,96,.9)'], [W(CR_JEEP), 3, 'rgba(150,130,96,.9)'], [W(tl), 2.5, 'rgba(90,60,40,.95)'], [W([[-100, CR_PB_Z], [100, CR_PB_Z]]), 3.5, 'rgba(70,74,58,1)'], [W([[xf, 0], [xf + CR_BLEN, 0]]), 4, 'rgba(60,64,50,1)']] });
}
function crEnd(win, why) {
  const stats = [[STATS.kills, 'אויבים נפגעו'], [Math.round(CR.br * 100), 'גשר הגלילים %'], [CR.stage + 1, 'השלב שהגעתם אליו']];
  if (win) return ['גשר הגלילים מונח', 'מ־16 באוקטובר 1973 עברו הטנקים לגדה המערבית על התמסחים, ומאחר הצהריים של ה־17 — על גשר הדוברות, תחת הפגזה ותקיפות מהאוויר. גשר הגלילים — כ־200 מטר של גלילי פלדה — נשבר בדרך אל התעלה, תוקן, ונגרר אל שפת המים; סא״ל אהרון (ג׳וני) טנא, שהוביל אותו, נפל על גדת התעלה ב־18 באוקטובר. ב־19 באוקטובר הושק הגשר למים, מצפון לגשר הדוברות, ובו ביום עבר עליו מח״ט 14. באותם ימים נלחמו הצנחנים בכפרים ובשדות שלאורך התעלה כדי להרחיב את ראש הגשר. מעל שני הגשרים עברו אוגדות שלמות לגדה המערבית.', stats];
  return ['נפגעת', ['תנו למקלע לעבוד: צרורות ארוכים על המצרים שעל הסוללה, והחוליות המסומנות באדום קודם.', 'במארב — קודם הבזוקות. הן מסומנות באדום.', 'בכל בית יש מצרי בחדר השני: רימון לפני שעוברים בפתח, והחלונות של הבית שממול לפני שחוצים את הרחוב.', 'מהחלון — לירות ולרדת. מי שמגיע לקיר זורק רימון: זוזו מהסימן ⚠. אל תעמדו מול הדלת.', 'הטנקים בדרך. עוד כמה שניות של אש מהחלונות.'][CR.stage] || '', stats];
}
function crSnapOK() { if (CR.stage === 0) return false; if (CR.stage === 1 && CR.msgs.out) return false; return true; }
function crSnapAfter() { crRepEnd(); crDynApply(); crBridgePose(0); if (CR.stage !== 3) meter(null); CR.filmTod = null; }
CHAP.cross = { stages: CR_STAGES, st: () => CR.stage, cp: () => CHAP.cross.cpN || 0, upd: crUpd, obj: crObj, hints: crHints, items: crItems, mini: crMini, restore: fieldRestore, end: crEnd, tank: false, night: true, snapOK: crSnapOK, snapAfter: crSnapAfter,
  stableTag: () => 'למחסה',
  tod: () => { const m = CR.filmTod != null ? CR.filmTod : CR_TOD[CR.stage] + CHAP.cross.t / (CR.stage >= 3 ? 20 : 6); return (((m % 1440) + 1440) % 1440) - START_MIN; },
  build: () => chapterBuild(CHAP.cross, crBuild), setup: crSetup, clock: CR_CLOCK[0], toast: ['18–19 באוקטובר 1973 · הגשרים', 'גשר הדוברות כבר על התעלה; גשר הגלילים מחכה על הגדה. צריך להחזיק את הצד שממול'], start: () => { CR.introSeen = false; fieldStart('cross'); } };
