
/* ================= chapter 4: the Chinese Farm, 15-17 October 1973 =================
   The battle that opened the crossing, after Israeli sources (the Ministry of Defence's Yom Kippur War site, Yad LaShiryon, izkor, the IDF's
   history department and the accounts of the men who fought there). The east bank of the canal: the farm of the Bitter Lakes project, its
   deep dry irrigation ditches full of Egyptian infantry, the junction of the Tirtur and Lexicon roads, the Yard on the canal where the bridge
   was laid, and across the water - Africa.
   Film: 18:05 the 14th Brigade slips through the seam between the two Egyptian armies, ~20:00 the Yard is reached without a shot, the column goes on north.
   1. 15.10, 21:21 - the junction. Infantry among the 14th Brigade's tanks: the tank-hunter teams come out of the farm; then east along its edge ditch.
   2. 15.10, 22:40 - "is there a Jew here?": four pits, two wounded of ours, two Egyptians.
   3. 16.10, 01:25 - "Aquarium": the paratroopers of 247 cross the canal in rubber boats from the Yard. Silence. "Acapulco": on the west bank.
   4. 17.10, 00:25 - Tirtur 42: battalion 890 walks west along the road under the moon, and the farm opens fire. Into the ditch, west in it, hold.
   5. 17.10, dawn  - grey smoke: the Sagger salvos at the rescue carriers. Smoke grenades blind the missiles; the wounded go aboard.
   6. 17.10, day   - the Yard (after the pontoons pass on Akavish in the night): the bridge goes into the water under artillery in bursts.
   Film: 16:30 the bridge touches the west bank; the night of 17-18 the brigades cross; 18.10 Tirtur abandoned.
   Gameplay first: narrow routes, many enemies that drop at a touch, a save at every bound. */
const FM = { o: { x: 0, z: -12000 }, stage: 0, t: 0, msgs: {} };
const FW = toWorld(FM.o);
const FMX = { brFloor: [], pitMk: [], rings: [], sagRings: [] };   // live handles (floors, markers, meshes) kept out of the snapshot's copy of FM and CHAP.farm
const FL = (x, z) => [x - FM.o.x, z - FM.o.z];
// levels: the field and the desert round it, the floor of the dry irrigation ditches, the water
const FY = 3.0, DY = 1.75, FDEEP = FY - DY;   // the ditches are fighting trenches: standing on the floor a man looks out over the lip, crouched he is under it
/* ---------- the map, in local metres: north is -z, east is +x ---------- */
const FM_CANAL = { x: -420, hw: 70 };                    // the Suez Canal, its centre line and half its width
const FM_RAMP_X = -333;                                   // the crest of our sand rampart on the east bank
const FM_LEX = -290;                                      // Lexicon, north-south along the canal
const FM_TIR = -232;                                      // Tirtur, east from the junction (its z)
const FM_JCT = [FM_LEX, FM_TIR];                          // the Tirtur-Lexicon junction
const FM_LAKE = 392;                                      // the shore of the Great Bitter Lake (its z), south of Lakekan
const FM_LAKEKAN = [-300, 352];
const FM_AKAVISH = [[FM_LEX, 352], [-120, 340], [80, 318], [300, 300], [560, 296], [900, 290]];
const FM_YARD = { x0: -352, x1: -300, z0: -126, z1: -14, bz: -70 };   // the Yard: the crossing site cut into the rampart; bz is the axis of the bridge
const FM_DX = [-258, -190, -120, -50, 20, 90, 160, 258];  // the north-south ditches (the first and the last run along the edges)
const FM_ET = -268;                                       // the Egyptians' fire trench, dug across the whole width of the fields, sixteen metres north of the edge ditch
const FM_DZ = [-252, FM_ET, -300, -352, -404, -456, -508, -556]; // the east-west ditches
const FM_DW = 1.7;                                        // half the width of a trench at its floor: three and a half metres, revetted walls of timber
const FM_FARM = { x0: FM_DX[0] - FM_DW, x1: FM_DX[FM_DX.length - 1] + FM_DW, z0: FM_DZ[FM_DZ.length - 1] - FM_DW, z1: FM_DZ[0] + FM_DW };   // the outer trenches run along the farm's edge
const FM_T42 = [212, FM_TIR];                             // "Tirtur 42" on the map
const FM_BR = { x0: -356, x1: -492, n: 12 };              // the pontoon bridge: from the Yard's ramp west across the water
const FM_SEGL = (FM_BR.x0 - FM_BR.x1) / FM_BR.n;
const FM_SLIPZ = 12;                                       // the slipway lies this far south of the bridge's axis
const FM_PUMPS = [[-150, -318, 0], [55, -428, 1], [195, -330, 0]];   // pump houses with their Japanese lettering
const FM_STAGES = [
  { title: 'הצומת · 21:21', sub: 'הגדה המזרחית. חטיבה 14 עברה בשקט בתפר שבין שתי הארמיות המצריות והגיעה לתעלה — ובצומת טרטור–לכסיקון נקלעה למארב. תעלות ההשקיה של החווה מלאות בחי״ר מצרי. אתם החי״רניקים בין הטנקים.', goal: 'הגנו על הטנקים: חסלו את ציידי הטנקים (צהוב), ואז התקדמו מזרחה בתעלה' },
  { title: 'מי כאן יהודי?', sub: 'האש דועכת. בין הבורות בשטח שוכבים פצועים — שלנו, ולא רק שלנו. בחושך אין דרך לדעת לפני שקוראים.', goal: 'בדקו את ארבע הנקודות. חלצו את שני הפצועים שלנו לחובש שליד האמבולנס' },
  { title: 'אקווריום · 01:25', sub: 'ליל 15–16 באוקטובר. בזמן שהצומת בוערת, צנחני חטיבה 247 חוצים את התעלה בסירות גומי מהחצר — בשקט מוחלט.', goal: 'חצו בשקט, בלי לירות. עלו לגדה המערבית ותפסו את הקו' },
  { title: 'טרטור 42', sub: 'ליל 16–17 באוקטובר. ראש הגשר מעבר לתעלה מחזיק — אבל אין אליו דרך. גדוד 890 הולך מערבה בציר טרטור, בפריסה שקטה, תחת ירח, לפתוח אותו.', goal: 'התקדמו בשקט מערבה בציר טרטור' },
  { title: 'עשן אפור', sub: 'עלות השחר, 17 באוקטובר. הנגמ״שים באים לחלץ את הפצועים, ומהחווה יורים עליהם סאגרים. רימון עשן אחד במקום הנכון — והטיל עיוור.', goal: 'זרקו עשן מול הסאגרים, והעלו את הפצועים לנגמ״שים' },
  { title: 'החצר', sub: '17 באוקטובר. הדוברות עברו בלילה בציר עכביש אל החצר שעל שפת התעלה. מ־09:00 בונים כאן את הגשר, והארטילריה המצרית נופלת במטחים.', goal: 'בין המטחים: שחררו את הדוברות למים (◆). כשמתחילה הפגזה — למחסה' },
];
// the clock of each stage (minutes from midnight at the start of the 15th; the next days go on past 24:00)
const FM_TOD = [21 * 60 + 18, 22 * 60 + 40, 25 * 60 + 25, 48 * 60 + 25, 53 * 60 + 38, 57 * 60];
const FM_CLOCK = ['15.10.1973 · צומת טרטור–לכסיקון', '15.10.1973 · הצומת', '16.10.1973 · החצר, התעלה', '17.10.1973 · ציר טרטור', '17.10.1973 · ציר טרטור, עם שחר', '17.10.1973 · החצר, שפת התעלה'];
const FM_NAMES1 = ['שמעון', 'אילן', 'גדי', 'ניר', 'עמוס', 'בני'];          // the squad of the first night: invented names, a company of paratroopers among the tanks
const FM_NAMES2 = ['אורי', 'צבי', 'מיכה', 'דן', 'עזרא', 'נחום', 'יעקב'];    // the squad of the second night
const fmInFarm = (lx, lz, pad = 0) => lx > FM_FARM.x0 - pad && lx < FM_FARM.x1 + pad && lz > FM_FARM.z0 - pad && lz < FM_FARM.z1 + pad;
const fmDitchD = (lx, lz) => { let d = 1e9; for (const x of FM_DX) d = Math.min(d, Math.abs(lx - x)); for (const z of FM_DZ) d = Math.min(d, Math.abs(lz - z)); return d; };
/* the plots: everything inside the farm that is not a ditch. A plot is a raised block of field with sloping earth sides */
// (j counts the rows as they were before the fire trench was dug: the strip between the edge ditch and the fire trench is row -1, a strip)
const FM_PLOTS = (() => { const out = []; for (let i = 0; i < FM_DX.length - 1; i++) for (let j = 0; j < FM_DZ.length - 1; j++) { const x0 = FM_DX[i] + FM_DW + 0.3, x1 = FM_DX[i + 1] - FM_DW - 0.3, z0 = FM_DZ[j + 1] + FM_DW + 0.3, z1 = FM_DZ[j] - FM_DW - 0.3; out.push({ x0, x1, z0, z1, top: FY, i, j: j - 1, strip: j === 0 }); } return out; })();
const fmPlotAt = (lx, lz) => FM_PLOTS.find((p) => lx > p.x0 && lx < p.x1 && lz > p.z0 && lz < p.z1) || null;
/* ---------- the ground ---------- */
function fmH(x, z) {
  const lx = x - FM.o.x, lz = z - FM.o.z;
  const dC = Math.abs(lx - FM_CANAL.x);
  let h;
  // the desert of the east bank: low swells, sand, desert pavement; west of the canal the green strip of Africa
  h = FY + 0.9 * fbm(lx / 140, lz / 140, 3) * smooth(30, 120, Math.abs(lz - FM_TIR) + Math.abs(lx) * 0.2) + 0.35 * fbm(lx / 30, lz / 30, 2);
  mix3(PAL.sandL, PAL.sandD, smooth(-0.3, 0.45, fbm(lx / 90, lz / 90, 3))); mixIn([0.69, 0.63, 0.53], 0.25 * smooth(0.15, 0.6, fbm(lx / 25 + 4, lz / 25, 2)));
  if (lx < FM_CANAL.x - FM_CANAL.hw) {
    const k = smooth(FM_CANAL.x - FM_CANAL.hw - 2, FM_CANAL.x - FM_CANAL.hw - 26, lx); h = lerp(0.9, 1.5 + 0.25 * fbm(lx / 50, lz / 50, 2), k);
    const strip = noise(Math.floor((lx + 2000) / 34) * 1.7, Math.floor((lz + 2000) / 48) * 1.3), green = [lerp(0.36, 0.47, strip), lerp(0.42, 0.5, strip), lerp(0.24, 0.3, strip)];
    mixIn(strip > 0 ? green : [0.56, 0.47, 0.34], 0.75 * smooth(-500, -560, lx));
    const dS = Math.abs(lx + 575); if (dS < 7) { h = lerp(h, -0.9, 1 - smooth(3, 7, dS)); mixIn(PAL.mud, 1 - smooth(3.5, 7, dS)); }
  }
  // the canal and the lake
  if (dC < FM_CANAL.hw + 10) { const t = smooth(FM_CANAL.hw - 14, FM_CANAL.hw + 2, dC); h = lerp(-5.5, Math.min(h, 0.9), t); mix3(PAL.deep, PAL.wet, t); }
  { const sh = FM_LAKE + 30 * Math.sin(lx / 260) - 60 * smooth(0, 400, lx); if (lz > sh - 12) { const t = smooth(sh + 26, sh - 4, lz); h = lerp(-3.2, h, t); mixIn(PAL.wet, (1 - t) * 0.9); } }
  // our sand rampart along the east bank, broken by the Yard
  if (lx > FM_CANAL.x + FM_CANAL.hw - 6 && lx < FM_RAMP_X + 30 && lz < FM_LAKE - 20) {
    const r = 6.8 * (1 - smooth(4, 19, Math.abs(lx - FM_RAMP_X))) * smooth(FM_CANAL.x + FM_CANAL.hw - 4, FM_CANAL.x + FM_CANAL.hw + 6, lx);
    const yard = lz > FM_YARD.z0 - 6 && lz < FM_YARD.z1 + 6 ? smooth(FM_YARD.z0 - 6, FM_YARD.z0 + 2, lz) * (1 - smooth(FM_YARD.z1 - 2, FM_YARD.z1 + 6, lz)) : 0;
    h += r * (1 - yard); mixIn(PAL.fresh, smooth(1, 5, r * (1 - yard)) * 0.45);
  }
  // the Yard: a flat floor cut through the rampart, and a ramp down to the water where the bridge starts
  if (lz > FM_YARD.z0 && lz < FM_YARD.z1 && lx > FM_YARD.x0 - 8 && lx < FM_YARD.x1 + 4) {
    const k = smooth(FM_YARD.z0, FM_YARD.z0 + 5, lz) * (1 - smooth(FM_YARD.z1 - 5, FM_YARD.z1, lz)) * (1 - smooth(FM_YARD.x1 - 2, FM_YARD.x1 + 4, lx));
    const floorY = lx < FM_YARD.x0 ? lerp(0.15, FY, smooth(FM_YARD.x0 - 8, FM_YARD.x0, lx)) : FY; h = lerp(h, floorY, k); mixIn([0.6, 0.55, 0.45], 0.55 * k);
  }
  // the farm: everything inside it is cut down to the floor of the ditches; the plots stand on it as raised blocks (built as their own meshes)
  if (fmInFarm(lx, lz, 3)) { const e = Math.min(lx - FM_FARM.x0, FM_FARM.x1 - lx, lz - FM_FARM.z0, FM_FARM.z1 - lz); const k = smooth(-0.9, 0.25, e); h = lerp(FY, DY, k); mix3([0.47, 0.4, 0.31], [0.39, 0.34, 0.27], noise(lx / 9, lz / 9) * 0.5 + 0.5); mixIn([0.66, 0.6, 0.49], 1 - k); }
  // the roads: Lexicon, Tirtur, Akavish
  { const dL = Math.abs(lx - FM_LEX); if (dL < 7 && lz < FM_LAKE - 30 && !fmInFarm(lx, lz, 1)) { h = lerp(h, FY + 0.1, 1 - smooth(4.5, 7, dL)); mixIn([0.55, 0.52, 0.47], 0.7 * (1 - smooth(3.5, 5, dL))); } }
  { const dT = Math.abs(lz - FM_TIR); if (dT < 7 && lx > FM_LEX - 2 && !fmInFarm(lx, lz, 0.5)) { h = lerp(h, FY + 0.1, 1 - smooth(4.5, 7, dT)); mixIn([0.6, 0.55, 0.46], 0.6 * (1 - smooth(3, 4.5, dT))); } }
  { const dA = distPolyline(lx, lz, FM_AKAVISH); if (dA < 8) { h = lerp(h, FY + 0.1, 1 - smooth(5, 8, dA)); mixIn([0.53, 0.5, 0.46], 0.75 * (1 - smooth(3.5, 5, dA))); } }
  return h;
}
/* ---------- models made here ---------- */
// the M113 "Bamba" that took out the wounded at dawn
const M113_GEO = build([
  [G.ext([[-2.4, 0.45], [2.05, 0.45], [2.45, 1.05], [2.0, 2.05], [-2.4, 2.05]], 2.5), 0x6c6a50, M4(0, 0, -1.25)],
  [G.box(4.6, 0.62, 2.62), 0x24221d, M4(0, 0.45, 0)], ...[-1, 1].flatMap((sd) => [-1.6, -0.8, 0, 0.8, 1.6].map((wx) => [G.cyl(0.3, 0.3, 0.2, 12), 0x3a382e, M4(wx, 0.42, sd * 1.22, Math.PI / 2, 0, 0)])),
  [G.box(0.5, 0.3, 0.5), 0x5d5b45, M4(-0.4, 2.2, 0.5)], [G.cyl(0.03, 0.03, 1.0, 6), 0x1d1d1d, M4(0.1, 2.38, 0.5, 0, 0, Math.PI / 2)], [G.box(0.08, 1.4, 2.0), 0x55533f, M4(-2.42, 1.25, 0)], [G.box(0.6, 0.05, 0.6), 0x55533f, M4(1.2, 2.06, -0.6)],
]);
// the battalion's ambulance: an M3 half-track - armoured bonnet with the louvred radiator plate and the roller, the open box behind with two
// stretchers in it, the red Shield of David on a white field on both sides and on the back. Local x forward, the ground at y = 0
const HT_MED_GEO = (() => {
  const OL = 0x6f6b55, OD = 0x5c5947, K = 0x23221e, KM = 0x3a3830, WH = 0xe6e2d6, RD = 0xc0271f, CN = 0x7d7a5a, parts = [];
  const star = (s) => { const t = (a) => [Math.sin(a) * s, Math.cos(a) * s]; return [[t(0), t(2.094), t(4.189)], [t(Math.PI), t(Math.PI + 2.094), t(Math.PI + 4.189)]]; };
  parts.push([G.box(5.9, 0.25, 1.5), K, M4(-0.1, 0.72, 0)], [G.box(3.75, 0.08, 2.1), OD, M4(-0.98, 0.95, 0)]);
  for (const sd of [-1, 1]) parts.push([G.box(3.75, 1.1, 0.06), OL, M4(-0.98, 1.5, sd * 1.06)], [G.box(3.75, 0.06, 0.12), OD, M4(-0.98, 2.06, sd * 1.06)], [G.box(0.85, 0.72, 0.06), OL, M4(1.32, 1.33, sd * 1.06)]);
  parts.push([G.box(0.06, 1.1, 2.18), OL, M4(-2.85, 1.5, 0)], [G.box(0.04, 0.98, 0.8), OD, M4(-2.89, 1.45, -0.42)], [G.box(0.05, 0.06, 0.06), K, M4(-2.92, 1.45, -0.1)]);
  parts.push([G.box(0.06, 0.48, 2.04), OD, M4(1.76, 1.72, 0, 0, 0, -0.22)], [G.box(0.03, 0.12, 1.6), 0x1a1c1c, M4(1.78, 1.8, 0, 0, 0, -0.22)]);
  for (const sd of [-1, 1]) parts.push([G.box(0.46, 0.12, 0.5), K, M4(1.2, 1.25, sd * 0.5)], [G.box(0.1, 0.5, 0.5), K, M4(0.98, 1.5, sd * 0.5)]);
  parts.push([G.cyl(0.19, 0.19, 0.04, 12), K, M4(1.52, 1.62, 0.5, 0, 0, Math.PI / 2 - 0.55)]);
  parts.push([G.box(1.5, 0.55, 1.5), OL, M4(2.45, 1.25, 0)], [G.box(1.5, 0.06, 1.3), OD, M4(2.45, 1.54, 0)], [G.box(0.08, 0.72, 1.55), OD, M4(3.22, 1.2, 0)]);
  for (let k = 0; k < 6; k++) parts.push([G.box(0.03, 0.045, 1.38), K, M4(3.27, 0.95 + k * 0.09, 0)]);
  parts.push([G.cyl(0.2, 0.2, 1.9, 12), KM, M4(3.52, 0.68, 0, Math.PI / 2, 0, 0)]);
  for (const sd of [-1, 1]) parts.push([G.cyl(0.11, 0.11, 0.08, 10), 0xd8d4c0, M4(3.28, 1.45, sd * 0.62, 0, 0, Math.PI / 2)]);
  for (const sd of [-1, 1]) parts.push([G.cyl(0.47, 0.47, 0.3, 16), K, M4(2.35, 0.47, sd * 0.95, Math.PI / 2, 0, 0)], [G.cyl(0.22, 0.22, 0.32, 10), OD, M4(2.35, 0.47, sd * 0.97, Math.PI / 2, 0, 0)], [G.box(1.2, 0.06, 0.42), OL, M4(2.35, 1.0, sd * 0.95)], [G.box(0.06, 0.3, 0.42), OL, M4(1.78, 0.86, sd * 0.95)]);
  for (const sd of [-1, 1]) { const z = sd * 0.93;
    parts.push([G.box(2.9, 0.1, 0.34), K, M4(-1.3, 0.9, z)], [G.box(2.6, 0.1, 0.34), K, M4(-1.3, 0.05, z)], [G.cyl(0.42, 0.42, 0.34, 14), K, M4(0.12, 0.47, z, Math.PI / 2, 0, 0)], [G.cyl(0.42, 0.42, 0.34, 14), K, M4(-2.72, 0.47, z, Math.PI / 2, 0, 0)]);
    for (const x of [-0.45, -1.05, -1.65, -2.2]) parts.push([G.cyl(0.3, 0.3, 0.36, 12), KM, M4(x, 0.36, z, Math.PI / 2, 0, 0)]); }
  for (const sd of [-1, 1]) { parts.push([G.box(0.84, 0.84, 0.02), WH, M4(-1.45, 1.52, sd * 1.096)]); for (const tri of star(0.34)) parts.push([G.ext(tri, 0.02), RD, M4(-1.45, 1.52, sd * 1.108 - 0.01)]); }
  parts.push([G.box(0.02, 0.72, 0.72), WH, M4(-2.892, 1.52, 0.5)]); for (const tri of star(0.29)) parts.push([G.ext(tri, 0.02), RD, M4(-2.903, 1.52, 0.5 - 0.01, 0, Math.PI / 2, 0)]);
  for (const sd of [-1, 1]) parts.push([G.box(2.0, 0.06, 0.55), CN, M4(-1.4, 1.32, sd * 0.6)], [G.box(2.25, 0.04, 0.04), K, M4(-1.4, 1.34, sd * 0.6 + 0.29)], [G.box(2.25, 0.04, 0.04), K, M4(-1.4, 1.34, sd * 0.6 - 0.29)], [G.box(0.05, 0.3, 0.05), K, M4(-0.4, 1.12, sd * 0.89)], [G.box(0.05, 0.3, 0.05), K, M4(-2.4, 1.12, sd * 0.89)]);
  parts.push([G.box(0.5, 0.35, 0.42), 0x55603f, M4(0.45, 1.16, 0)], [G.box(0.36, 0.3, 0.3), WH, M4(0.45, 1.5, 0.55)], [G.cyl(0.012, 0.012, 2.4, 5), K, M4(-2.6, 2.6, -0.95, 0.08, 0, 0)]);
  return build(parts);
})();
// a folded stretcher on the sand behind the ambulance: where the wounded are handed over
const STRETCHER_GEO = build([[G.box(2.0, 0.05, 0.56), 0x7d7a5a, M4(0, 0.18, 0)], ...[-1, 1].flatMap((sd) => [[G.box(2.3, 0.05, 0.05), 0x23221e, M4(0, 0.2, sd * 0.29)], [G.box(0.05, 0.16, 0.05), 0x23221e, M4(0.8, 0.08, sd * 0.29)], [G.box(0.05, 0.16, 0.05), 0x23221e, M4(-0.8, 0.08, sd * 0.29)]])]);
// a section of the pontoon bridge: the steel float under the deck, the treadway plates, the curbs and the chain posts. It runs along x
const PONT_GEO = build([
  [G.box(FM_SEGL - 0.3, 1.25, 5.4), 0x5a5d4c, M4(0, -0.15, 0)], [G.box(FM_SEGL - 0.1, 0.16, 4.4), 0x4b4d40, M4(0, 0.55, 0)],
  ...[-1, 1].flatMap((sd) => [[G.box(FM_SEGL - 0.1, 0.22, 0.16), 0x3a3c32, M4(0, 0.74, sd * 2.2)], ...[-0.4, 0.4].map((u) => [G.cyl(0.05, 0.05, 0.85, 6), 0x2c2d28, M4(u * FM_SEGL, 1.05, sd * 2.25)]), [G.box(FM_SEGL - 0.2, 0.04, 0.04), 0x2c2d28, M4(0, 1.4, sd * 2.25)]]),
  ...[-0.5, 0.5].map((u) => [G.box(0.25, 1.0, 5.45), 0x45473b, M4(u * (FM_SEGL - 0.4), -0.1, 0)]),
]);
// a pontoon on its truck, for the convoy and the Yard
const PONT_TRUCK = build([...truckParts({ B: 0x68674a, D: 0x5d5c42, K: 0x1f1e1b, C: 0x6e6b4c }), [G.box(5.6, 1.0, 2.7), 0x5a5d4c, M4(-0.9, 2.65, 0)], [G.box(5.6, 0.12, 2.3), 0x4b4d40, M4(-0.9, 3.2, 0)]]);
// a pump house of the farm: concrete, flat roof, a pipe into the ditch
function fmPumpGeo() {
  return build([[G.box(5.2, 3.2, 4.2), 0xc9c2b0, M4(0, 1.6, 0)], [G.box(5.8, 0.25, 4.8), 0xa8a294, M4(0, 3.32, 0)], [G.box(1.2, 2.1, 0.1), 0x3a3428, M4(-1.2, 1.05, 2.12)], [G.box(1.1, 0.6, 0.08), 0x2a2620, M4(1.2, 2.3, 2.12)],
    [G.cyl(0.32, 0.32, 4.0, 12), 0x6a5a48, M4(3.4, 0.5, 0, 0, 0, Math.PI / 2)], [G.cyl(0.42, 0.42, 0.5, 12), 0x5a4a3a, M4(2.7, 0.5, 0, 0, 0, Math.PI / 2)], [G.box(1.2, 1.0, 1.2), 0x6e6656, M4(-3.2, 0.5, -1.2)]]);
}
// the Japanese lettering on the pump houses that gave the farm its Israeli name
function fmJpTex(i) {
  const c = canvas(256, 96), g = c.getContext('2d'); g.fillStyle = '#d8d0bc'; g.fillRect(0, 0, 256, 96); g.fillStyle = 'rgba(60,40,24,.12)'; for (let k = 0; k < 160; k++) g.fillRect(Math.random() * 256, Math.random() * 96, 3, 3);
  g.fillStyle = '#7a2a1e'; g.font = 'bold 40px "Noto Sans JP","Hiragino Sans","Yu Gothic","MS Gothic","Noto Sans CJK JP",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(['揚水機場', '農業試験場', '第二揚水機'][i % 3], 128, 40); g.font = 'bold 15px sans-serif'; g.fillStyle = '#3a2a1e'; g.fillText(['PUMP STATION 1', 'EXPERIMENTAL FARM', 'PUMP STATION 2'][i % 3], 128, 78); return tex(c);
}
/* the low hill south of Tirtur where the paratroopers lay, "tens of metres from the Egyptians" */
const FM_KNOLL = { x: 150, z: -200, r: 24, h: 2.8 };
const fmKnollH = (lx, lz) => { const d = Math.hypot(lx - FM_KNOLL.x, (lz - FM_KNOLL.z) * 1.25); return d < FM_KNOLL.r ? FM_KNOLL.h * Math.pow(Math.cos(d / FM_KNOLL.r * Math.PI / 2), 1.6) : 0; };
function fmHk(x, z) { const lx = x - FM.o.x, lz = z - FM.o.z, h = fmH(x, z), k = fmKnollH(lx, lz); if (k > 0) { mixIn([0.82, 0.75, 0.62], Math.min(1, k / FM_KNOLL.h) * 0.5); return h + k; } return h; }
/* ---------- the plots: raised blocks of dry field between the ditches ---------- */
function fmPlots() {
  const K = 1 / 0.787, C = (r, g, b) => [lin(r) * K, lin(g) * K, lin(b) * K], B = 0.06;
  const tp = [], tc = [], tu = [], sp = [], sc = [], su = [];
  const push = (P, Cc, U, x, y, z, c) => { const [wx, wz] = FW(x, z); P.push(wx, y, wz); Cc.push(...c); U.push(wx / 3.3, wz / 3.3); };
  for (const p of FM_PLOTS) {
    const t = p.top, x0 = p.x0 + B, x1 = p.x1 - B, z0 = p.z0 + B, z1 = p.z1 - B, nx = Math.max(1, Math.round((x1 - x0) / 6)), nz = Math.max(1, Math.round((z1 - z0) / 6));
    // each plot its own crop: stubble, a ploughed plot, a fallow one gone to weeds
    const kind = Math.floor(Math.abs(Math.sin(p.i * 12.9 + p.j * 78.2) * 43758) % 3), base = [[0.66, 0.6, 0.44], [0.5, 0.43, 0.33], [0.6, 0.57, 0.43]][kind];
    const col = (x, z) => { const n = noise(x / 7, z / 7) * 0.5 + 0.5, row = kind === 1 ? 0.5 + 0.5 * Math.sin(x * 1.3) : 0.5; const f = 0.88 + 0.16 * n - 0.06 * row; return C(base[0] * f, base[1] * f, base[2] * f); };
    for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) { const ax = lerp(x0, x1, i / nx), bx = lerp(x0, x1, (i + 1) / nx), az = lerp(z0, z1, j / nz), bz = lerp(z0, z1, (j + 1) / nz);
      for (const [x, z] of [[ax, az], [ax, bz], [bx, az], [bx, az], [ax, bz], [bx, bz]]) push(tp, tc, tu, x, t, z, col(x, z)); }
    // the sides: steep cut earth, darker toward the floor of the ditch
    const top = [[x0, z0], [x1, z0], [x1, z1], [x0, z1]], bot = [[p.x0, p.z0], [p.x1, p.z0], [p.x1, p.z1], [p.x0, p.z1]], wall = C(0.5, 0.43, 0.33), foot = C(0.4, 0.34, 0.26);
    for (let k = 0; k < 4; k++) { const a = top[k], b = top[(k + 1) % 4], c = bot[(k + 1) % 4], d = bot[k], L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(L / 5));
      for (let s = 0; s < n; s++) { const u0 = s / n, u1 = (s + 1) / n, A = [lerp(a[0], b[0], u0), lerp(a[1], b[1], u0)], Bb = [lerp(a[0], b[0], u1), lerp(a[1], b[1], u1)], Cc = [lerp(d[0], c[0], u1), lerp(d[1], c[1], u1)], D = [lerp(d[0], c[0], u0), lerp(d[1], c[1], u0)];
        for (const [q, y, cc] of [[A, t, wall], [D, DY - 0.05, foot], [Bb, t, wall], [Bb, t, wall], [D, DY - 0.05, foot], [Cc, DY - 0.05, foot]]) push(sp, sc, su, q[0], y, q[1], cc); } }
    // what stands and walks: the top is a floor, the block a wall to a man in the ditch
    const [cx, cz] = FW((p.x0 + p.x1) / 2, (p.z0 + p.z1) / 2); addCollider(cx, cz, (p.x1 - p.x0) / 2 - 0.12, (p.z1 - p.z0) / 2 - 0.12, 0, t, DY - 2);
    const [fa, fb] = FW(p.x0 + B, p.z0 + B), [fc, fd] = FW(p.x1 - B, p.z1 - B); addFloor(fa, fc, fb, fd, t);
  }
  const mk = (P, Cc, U) => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(Cc, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2)); g.computeVertexNormals(); return g; };
  const top = new THREE.Mesh(mk(tp, tc, tu), terrainMat()); top.receiveShadow = !LITE; scene.add(top);
  const wm = new THREE.MeshStandardMaterial({ vertexColors: true, map: TX.micro, roughness: 1, metalness: 0 }); const sides = new THREE.Mesh(mk(sp, sc, su), wm); sides.receiveShadow = !LITE; scene.add(sides);
}
/* ---------- the ditches as fighting trenches: every wall revetted with weathered planks held by posts, sandbags along the lips where the
   fighting goes. They read as trenches dug into the earth, not as low ground between fields ---------- */
function plankTex() {
  const c = canvas(256, 256), g = c.getContext('2d'), r = rng(4471);
  for (let i = 0; i < 8; i++) { const y = i * 32, k = 0.82 + r() * 0.3, base = [116 * k, 96 * k, 70 * k]; g.fillStyle = `rgb(${base.map((v) => v | 0).join(',')})`; g.fillRect(0, y, 256, 32);
    for (let j = 0; j < 22; j++) { g.strokeStyle = `rgba(40,28,16,${0.08 + r() * 0.14})`; g.lineWidth = 1 + r(); g.beginPath(); const yy = y + 3 + r() * 26; g.moveTo(0, yy); g.bezierCurveTo(80, yy + (r() - 0.5) * 4, 170, yy + (r() - 0.5) * 4, 256, yy + (r() - 0.5) * 3); g.stroke(); }
    g.fillStyle = 'rgba(20,14,8,.75)'; g.fillRect(0, y + 30, 256, 2); const jx = r() * 256; g.fillRect(jx, y, 2, 32);
    for (let n = 0; n < 3; n++) { g.fillStyle = 'rgba(30,24,18,.6)'; g.beginPath(); g.arc(r() * 256, y + 6 + r() * 20, 1.4, 0, 6.283); g.fill(); } }
  g.fillStyle = 'rgba(70,58,40,.35)'; for (let k = 0; k < 40; k++) g.fillRect(r() * 256, 200 + r() * 56, 6 + r() * 30, 3 + r() * 8);   // earth splashed on the bottom boards
  const t = tex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
/* the planks: the board wall of the Plank Fence pack (4f_data_props.js, a texture only - thirteen weathered boards standing side by side,
   one repeat 2.4 m across and 1.28 m high, the trench wall from floor to lip) with its normal map, else the painted boards of plankTex */
const FM_PLANK = { has: () => !!MDL_TEX['props/plank/map'], H: 1.28 };
function fmRevet() {
  const pos = [], uv = [], col = [], posts = [], caps = [], H0 = DY - 0.06, H1 = FY - 0.03, step = LITE ? 3.2 : 1.6, r = rng(4472), pk = FM_PLANK.has();
  // one revetment face from (a) to (b), pushed out along its normal so it sits on the earth wall: panel by panel, each its own shade of old timber
  const face = (ax, az, bx, bz, nx, nz) => { const L = Math.hypot(bx - ax, bz - az); if (L < 1) return; const n = Math.max(1, Math.round(L / 2.4));
    for (let i = 0; i < n; i++) { const t0 = i / n, t1 = (i + 1) / n, o = 0.035 + (i % 2) * 0.014, [x0, z0] = FW(lerp(ax, bx, t0) + nx * o, lerp(az, bz, t0) + nz * o), [x1, z1] = FW(lerp(ax, bx, t1) + nx * o, lerp(az, bz, t1) + nz * o), u0 = t0 * L / 2.4, u1 = t1 * L / 2.4, v1 = (H1 - H0) / (pk ? FM_PLANK.H : 2.0), k = (pk ? 0.84 + r() * 0.24 : 0.74 + r() * 0.38), c = [k, k * (0.95 + r() * 0.07), k * (0.88 + r() * 0.12)];
      pos.push(x0, H0, z0, x1, H0, z1, x1, H1, z1, x0, H0, z0, x1, H1, z1, x0, H1, z0); uv.push(u0, 0, u1, 0, u1, v1, u0, 0, u1, v1, u0, v1); for (let q = 0; q < 6; q++) col.push(...c); }
    const m = Math.max(1, Math.round(L / step)); for (let i = 0; i <= m; i++) { const t = i / m, [px, pz] = FW(lerp(ax, bx, t) + nx * 0.1, lerp(az, bz, t) + nz * 0.1); posts.push([px, pz]); }
    const [cx, cz] = FW((ax + bx) / 2 + nx * 0.1, (az + bz) / 2 + nz * 0.1); caps.push([cx, cz, L, Math.atan2(-(bz - az), bx - ax)]); };
  for (const p of FM_PLOTS) { face(p.x0, p.z1, p.x1, p.z1, 0, 1); face(p.x1, p.z0, p.x0, p.z0, 0, -1); face(p.x0, p.z0, p.x0, p.z1, -1, 0); face(p.x1, p.z1, p.x1, p.z0, 1, 0); }
  // the farm's own edge, the outer wall of the trenches that run along it
  const F = FM_FARM; face(F.x1, F.z1 - 0.2, F.x0, F.z1 - 0.2, 0, -1); face(F.x0 + 0.2, F.z1, F.x0 + 0.2, F.z0, 1, 0); face(F.x0, F.z0 + 0.2, F.x1, F.z0 + 0.2, 0, 1); face(F.x1 - 0.2, F.z0, F.x1 - 0.2, F.z1, -1, 0);
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.computeVertexNormals();
  const pt = pk ? mdlTex('props/plank/map') : plankTex(), pmat = new THREE.MeshStandardMaterial({ map: pt, vertexColors: true, roughness: 0.95, metalness: 0, side: THREE.DoubleSide });
  if (pk && !LITE) { pmat.normalMap = mdlTex('props/plank/nmap', false); pmat.normalScale.set(0.9, 0.9); }
  const m = new THREE.Mesh(g, pmat); m.receiveShadow = !LITE; scene.add(onLayer1(m));
  const mm = new THREE.Matrix4(), q = new THREE.Quaternion(), up = V3(0, 1, 0), one = V3(1, 1, 1);
  const pg = new THREE.BoxGeometry(0.14, H1 - H0 + 0.22, 0.14).translate(0, (H1 + H0) / 2 + 0.08, 0), pm = new THREE.InstancedMesh(pg, new THREE.MeshStandardMaterial({ color: 0x4a3a28, roughness: 1 }), posts.length);
  posts.forEach(([x, z], i) => pm.setMatrixAt(i, mm.makeTranslation(x, 0, z))); scene.add(SH(onLayer1(pm), true, false));
  // the capping beam along every lip, and the duckboards down the middle of every trench
  const cm = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 0.13, 0.2), new THREE.MeshStandardMaterial({ color: 0x5a4632, roughness: 1 }), caps.length);
  caps.forEach(([x, z, L, a], i) => cm.setMatrixAt(i, mm.compose(V3(x, FY - 0.05, z), q.setFromAxisAngle(up, a), V3(L, 1, 1)))); scene.add(SH(onLayer1(cm), true, false));
  const boards = []; for (const x of FM_DX) for (let z = F.z1; z > F.z0 + 1.2; z -= 2.5) boards.push([x, z - 1.25, Math.PI / 2]); for (const z of FM_DZ) for (let x = F.x0; x < F.x1 - 1.2; x += 2.5) { if (FM_DX.some((dx) => Math.abs(dx - x - 1.25) < 1.4)) continue; boards.push([x + 1.25, z, 0]); }
  const bm = new THREE.InstancedMesh(new THREE.BoxGeometry(2.36, 0.06, 0.95), new THREE.MeshStandardMaterial({ map: pt, color: pk ? 0xc8bca8 : 0xb09878, roughness: 1 }), boards.length);   // the packed boards are brown already: only dusted
  boards.forEach(([x0, z0, a], i) => { const [x, z] = FW(x0, z0); bm.setMatrixAt(i, mm.compose(V3(x, DY + 0.03, z), q.setFromAxisAngle(up, a + (r() - 0.5) * 0.04), one)); }); bm.receiveShadow = !LITE; scene.add(onLayer1(bm));
  // sandbags: one row along both lips of the edge trench where the fighting goes, and the parapet of the Egyptians' fire trench across the fields
  const bagRun = (x0, x1, z, y) => { for (let x = x0; x < x1; x += 10) { const xb = Math.min(x1, x + 10); if (FM_DX.some((dx) => dx > x - 2.2 && dx < xb + 2.2)) continue; const [a, b] = FW(x, z), [c, d] = FW(xb, z); bagWall([[a, b], [c, d]], 1, y ?? groundAt((a + c) / 2, (b + d) / 2) - 0.05, false); } };
  const nz0 = FM_DZ[0] - FM_DW - 0.6, sz0 = F.z1 + 0.55, etz = FM_ET + FM_DW + 0.6;
  for (const [x0, x1] of [[-256, -112], [72, 226]]) { bagRun(x0, x1, nz0, FY - 0.02); bagRun(x0, x1, sz0); }
  bagRun(F.x0 + 2, F.x1 - 2, etz, FY - 0.02);
  // what lies about in the trenches: ammunition boxes, jerrycans, sacks, a stretcher, spent shells
  const parts = [], wood = []; for (const z of [FM_DZ[0], FM_ET]) for (let x = F.x0 + 6; x < F.x1 - 6; x += 7 + r() * 9) { if (FM_DX.some((dx) => Math.abs(dx - x) < 3)) continue; const sd = r() < 0.5 ? 1 : -1, [wx, wz] = FW(x, z + sd * (FM_DW - 0.45)); hmProps(parts, wood, wx, wz, DY + 0.06, sd > 0 ? 0 : Math.PI, r, Math.floor(r() * 10)); }
  if (parts.length) scene.add(SH(onLayer1(new THREE.Mesh(build(parts), MAT.vc)))); if (wood.length) scene.add(SH(onLayer1(new THREE.Mesh(build(wood), new THREE.MeshStandardMaterial({ vertexColors: true, map: TX.wood, roughness: 0.92 })))));
}
/* ---------- Egyptian positions: on the slope of the farm's edge facing the roads, and lying at the edges of the plots ----------
   Nothing stands in the ditches themselves: they are wide, open channels, and whatever blocks a man there can be seen */
function fmSlots(C, parts) {
  // every Egyptian position is in a trench: a man stands on its floor against the wall he fires over, his head and rifle above the lip; he ducks to the floor behind it
  const S = (lx, lz, nx, nz, y, grp, extra = {}) => { const [x, z] = FW(lx, lz), [px, pz] = FW(lx + nx * 0.18, lz + nz * 0.18), [hx, hz] = FW(lx - nx * 0.75, lz - nz * 0.75); const s = { x, z, y, nx, nz, f: 0, b: null, used: false, fox: true, p: [px, pz], h: [hx, hz], grp, lx, lz, ...extra }; C.slots.push(s); return s; };
  const cross = (v, list, r = 3.5) => list.some((d) => Math.abs(d - v) < r);
  // the edge trench along the south of the farm: men at its north wall firing south, over the road
  for (let x = FM_FARM.x0 + 4; x < FM_FARM.x1 - 2; x += 12) { if (cross(x, FM_DX)) continue; S(x, FM_DZ[0] - 0.8, 0, 1, DY, 'ES', { i: x }); }
  // the trench along the west edge, toward Lexicon
  for (let z = FM_FARM.z1 - 6; z > FM_FARM.z0 + 2; z -= 12) { if (cross(z, FM_DZ)) continue; S(FM_DX[0] + 0.8, z, -1, 0, DY, 'EW', { j: z }); }
  // the fire trench across the fields: a bay every nine metres, a traverse of bags between the bays; a man in each bay stands to fire over the parapet at the edge trench
  for (let x = FM_FARM.x0 + 5; x < FM_FARM.x1 - 4; x += 9) { if (cross(x, FM_DX)) continue; S(x, FM_ET + 0.9, 0, 1, DY, 'ET', { i: x }); const tx = x + 4.5; if (!cross(tx, FM_DX)) { const [a, b] = FW(tx, FM_ET - FM_DW + 0.1), [c, d] = FW(tx, FM_ET + FM_DW - 0.1); bagWall([[a, b], [c, d]], 4, DY - 0.03, true); } }
  // the communication trenches from the edge trench up to the fire trench: a man in each, looking down it at the crossing
  for (const x of FM_DX) for (const o of [-0.7, 0.7]) S(x + o, FM_ET + FM_DW + 2.2, 0, 1, DY, 'NS', { i: x });
  // the trenches deeper in the farm, row behind row: men at their south walls, firing south over the plots ('pl.j' counts the rows behind the fire trench)
  for (let t = 2; t < FM_DZ.length; t++) for (let x = FM_FARM.x0 + 8; x < FM_FARM.x1 - 4; x += 14) { if (cross(x, FM_DX)) continue; S(x, FM_DZ[t] + 0.8, 0, 1, DY, 'PS', { pl: { j: t - 2 } }); }
}
/* ---------- the Yard: shelters, the launch ramp, the trucks; the pontoon bridge itself ---------- */
function fmDugout(lx, lz, parts, list) {
  // a dugout of sandbags with a roof of rails and bags: open to the canal (west), so a man inside sees the bridge; room for three
  const [x, z] = FW(lx, lz), y = groundAt(x, z), W = 4.2, D = 3.2;
  bagWall([FW(lx - W / 2, lz - D / 2), FW(lx + W / 2, lz - D / 2)], 10, y - 0.05, true); bagWall([FW(lx - W / 2, lz + D / 2), FW(lx + W / 2, lz + D / 2)], 10, y - 0.05, true); bagWall([FW(lx + W / 2, lz - D / 2), FW(lx + W / 2, lz + D / 2)], 10, y - 0.05, true);
  parts.push([G.box(W + 0.8, 0.35, D + 0.8), 0x7a6f58, M4(x, y + 2.42, z)], [G.box(W + 0.4, 0.2, D + 0.4), 0x3a3a34, M4(x, y + 2.18, z)]);
  for (let k = 0; k < 4; k++) parts.push([G.box(0.16, 0.16, D + 0.6), 0x3a3a34, M4(x - W / 2 + 0.5 + k * 1.1, y + 2.04, z)]);
  list.push({ lx, lz, hw: W / 2 - 0.1, hd: D / 2 - 0.2, x, z }); addCover(x - W / 2 - 0.9, z, -1, 0, 1.6);
}
function fmSplash(p, k = 1) {
  const n = Math.round(10 * k); for (let i = 0; i < n; i++) fxDust(p.clone().add(V3(rand(-1.6, 1.6) * k, 0.3 + i * 0.7 * k, rand(-1.6, 1.6) * k)), true);
  for (let i = 0; i < 6; i++) fxDust(p.clone().add(V3(rand(-5, 5), 0.2, rand(-5, 5))), true); sndBoom(p, 1.1 * k); FX.shake = Math.max(FX.shake, clamp(1.1 - camera.position.distanceTo(p) / 34, 0, 0.75));
}
/* ---------- building the battlefield ---------- */
function fmBuild() {
  const C = CHAP.farm; C.ground = makeGround({ x0: FM.o.x - 660, x1: FM.o.x + 720, z0: FM.o.z - 880, z1: FM.o.z + 460, step: 4, h: fmHk,
    fineX: [[FM_FARM.x0 - 9, FM_FARM.x0 + 13, 1.25], [FM_FARM.x1 - 13, FM_FARM.x1 + 9, 1.25]].map(([a, b, s]) => [FM.o.x + a, FM.o.x + b, s]),
    fineZ: [[FM_FARM.z0 - 9, FM_FARM.z0 + 13, 1.25], [FM_FARM.z1 - 13, FM_FARM.z1 + 9, 1.25]].map(([a, b, s]) => [FM.o.z + a, FM.o.z + b, s]) }); GROUND = C.ground;
  const BAGS = [], sv = BATCH.bag; BATCH.bag = BAGS; const k0 = COVER.length; C.slots = []; C.shelters = []; C.fires = [];
  const parts = [], wood = [], r = rng(1573), W = (pts) => pts.map(([x, z]) => FW(x, z));
  fmPlots(); fmRevet(); fmSlots(C, parts);
  // the pump houses of the farm, their Japanese lettering, an old pump and pipes beside them
  FM_PUMPS.forEach(([lx, lz, rot], i) => { const [x, z] = FW(lx, lz), y = FY; const m = new THREE.Mesh(fmPumpGeo(), new THREE.MeshStandardMaterial({ vertexColors: true, map: TX.grime, roughness: 0.95 })); m.position.set(x, y, z); m.rotation.y = rot * Math.PI / 2; scene.add(SH(onLayer1(m)));
    addCollider(x, z, rot ? 2.2 : 2.7, rot ? 2.7 : 2.2, 0, y + 3.4, y - 0.5); coverBox(x, z, rot ? 2.2 : 2.7, rot ? 2.7 : 2.2, 0, 2.6);
    const sg = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.9), new THREE.MeshStandardMaterial({ map: fmJpTex(i), roughness: 0.9 })); const ry = rot * Math.PI / 2; sg.position.set(x + Math.sin(ry) * 2.13, y + 2.45, z + Math.cos(ry) * 2.13); sg.rotation.y = ry; scene.add(onLayer1(sg)); C.jp = C.jp || []; C.jp.push(sg); });
  // farm machinery left in the fields: a tractor's carcass, a trailer, pipes
  for (const [lx, lz, a] of [[-60, -380, 0.4], [120, -485, 1.9], [-215, -470, 2.6]]) { const [x, z] = FW(lx, lz); parts.push([G.box(2.6, 1.2, 1.5), 0x6a3a26, M4(x, FY + 1.0, z, 0, a, 0)], [G.cyl(0.75, 0.75, 0.4, 14), 0x2a2420, M4(x - Math.cos(a) * 1.1, FY + 0.75, z + Math.sin(a) * 1.1, Math.PI / 2, a, 0)], [G.cyl(0.45, 0.45, 0.3, 12), 0x2a2420, M4(x + Math.cos(a) * 1.1, FY + 0.45, z - Math.sin(a) * 1.1, Math.PI / 2, a, 0)]); addCollider(x, z, 1.6, 1.0, a, FY + 1.6, FY - 0.3); }
  for (const [lx, lz] of [[-170, -330], [70, -332], [40, -480], [130, -322]]) { const [x, z] = FW(lx, lz); parts.push([G.cyl(0.25, 0.25, 7, 10), 0x5e5248, M4(x, FY + 0.25, z, 0, 0, Math.PI / 2)]); }
  // the roads, with the IDF's code names on boards at the junctions
  roadRibbon(W([[FM_LEX, 340], [FM_LEX, 120], [FM_LEX, -120], [FM_LEX, -400], [FM_LEX, -880]]), 7.5, 'asphalt');
  roadRibbon(W([[FM_LEX, FM_TIR], [-200, FM_TIR], [100, FM_TIR + 1], [400, FM_TIR - 2], [900, FM_TIR - 6]]), 6.5, 'dirt');
  roadRibbon(W(FM_AKAVISH), 7.5, 'asphalt'); roadPoles(W([[FM_LEX + 8, 330], [FM_LEX + 8, -860]]), 26, 1);
  { const [a, b] = FW(FM_LEX + 8, FM_TIR + 9); fieldSign(a, b, 'טרטור ←', Math.PI, 1.3); const [c, d] = FW(FM_LEX + 8, FM_TIR - 10); fieldSign(c, d, '↑ לכסיקון', Math.PI, 1.3); const [e, f] = FW(FM_LEX + 9, 330); fieldSign(e, f, 'עכביש · לקקן', Math.PI, 1.5); const [g, h] = FW(FM_T42[0], FM_TIR + 8); fieldSign(g, h, 'טרטור 42', Math.PI, 1.2); const [i, j] = FW(FM_LEX + 9, -60); fieldSign(i, j, 'החצר ←', Math.PI, 1.2); }
  // the graveyard of the first night: our tanks and theirs, burnt out, round the junction and along the roads
  for (const [lx, lz, b] of [[-276, -212, 15], [-262, -226, 92], [-206, -236, 95], [-140, -236, 70], [70, -240, 88], [300, -238, 90]]) { const [x, z] = FW(lx, lz); placeTank(x, z, b, TANK_BURNT); }
  for (const [lx, lz, a] of [[-228, -284, 0.6], [30, -282, 0.2], [-275, -330, 1.9]]) { const [x, z] = FW(lx, lz), y = lz < FM_FARM.z1 && lz > FM_FARM.z0 && lx > FM_FARM.x0 && lx < FM_FARM.x1 ? (fmPlotAt(lx, lz) ? FY : DY) : groundAt(x, z); const m = new THREE.Mesh(T55_HULL, MAT.vc); m.position.set(x, y, z); m.rotation.y = a; const t = new THREE.Mesh(T55_TUR, MAT.vc); t.position.set(0.3, 1.42, 0); t.rotation.set(0, rand(-1, 1), 0.07); m.add(t); scene.add(SH(onLayer1(m))); wreckTilt(m, Math.random); if (lx === -228) wreckFire(m, VEH_FIRE.t55, 1.3);   /* knocked out in its paint; one still burning */ addCollider(x, z, 3.1, 1.7, a, y + 2.2, y - 0.5); coverBox(x, z, 3.1, 1.7, a, 2.0); }
  for (const [lx, lz, a] of [[-284, -160, 1.6], [120, -226, 0.1]]) { const [x, z] = FW(lx, lz); vehicle(TRUCK_BURNT, x, z, a, 3.3, 1.2, 2.6); }
  // the wrecks that still burn: flames, a glow and smoke - at night they light the junction
  for (const [lx, lz, sz] of [[-276, -212, 0.9], [70, -240, 0.8]]) { const [x, z] = FW(lx, lz), g = groundAt(x, z); const f = { x, z, g, size: sz, ph: r() * 6, fires: [] }; for (let i = 0; i < 4; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: FXT.fire, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, color: new THREE.Color(HDRK * 0.5, HDRK * 0.36, HDRK * 0.22) })); s.position.set(x + rand(-0.6, 0.6), g + 1.8 + i * 0.7, z + rand(-0.5, 0.5)); s.userData.dyn = true; scene.add(onLayer1(s)); f.fires.push(s); } C.fires.push(f); }
  C.fireL = [0, 1].map((i) => { const L = new THREE.PointLight(0xff8a3c, 0, 70, 2); const f = C.fires[Math.min(i, C.fires.length - 1)]; L.position.set(f.x, f.g + 3, f.z); scene.add(L); return L; });
  // Matsmed: two small posts on the rampart, north and south of the Yard
  for (const [lx, lz] of [[FM_RAMP_X, FM_YARD.z0 - 22], [FM_RAMP_X, FM_YARD.z1 + 22]]) { const [x, z] = FW(lx, lz), y = groundAt(x, z); const arc = []; for (let a = 0; a <= 360; a += 30) arc.push([x + Math.cos(a * Math.PI / 180) * 3.2, z + Math.sin(a * Math.PI / 180) * 3.2]); bagWall(arc, 4, y - 0.1, true); parts.push([G.box(3.4, 1.5, 3.0), 0x8e8468, M4(x + 5, y + 0.75, z)], [G.box(3.8, 0.3, 3.4), 0x7a7258, M4(x + 5, y + 1.6, z)]); addCollider(x + 5, z, 1.7, 1.5, 0, y + 1.8); }
  // the Yard: an earth berm on its east side with the gate, shelters, the launch ramp at the water, trucks and stacks
  { const berm = (z0, z1) => { const [x, za] = FW(FM_YARD.x1 + 2, z0), [, zb] = FW(0, z1), y = FY, L = Math.abs(zb - za), mz = (za + zb) / 2; const g = new THREE.CylinderGeometry(0.8, 2.6, 2.8, 4, 1, false).rotateY(Math.PI / 4).scale(1, 1, L / 3.7).translate(x, y + 1.4, mz); parts.push([g, 0xb8a47e]); addCollider(x, mz, 1.4, L / 2, 0, y + 2.7, y - 0.5); };
    berm(FM_YARD.z0, FM_YARD.bz - 10); berm(FM_YARD.bz + 10, FM_YARD.z1); }
  for (const [lx, lz] of [[-337, -48], [-337, -94], [-321, -70]]) fmDugout(lx, lz, parts, C.shelters);
  fmPitsBuild(parts);
  { // the slipway: timber rails down the ramp into the water, a winch, the next pontoon on its rollers
    for (const sd of [-1.6, 1.6]) { const [a, b] = FW(-355, FM_YARD.bz + FM_SLIPZ + sd), [c] = FW(-346, 0); wood.push([G.box(Math.abs(c - a), 0.14, 0.3), 0x6a5236, M4((a + c) / 2, 1.0, b, 0, 0, 0.18)]); }
    const [wx, wz] = FW(-343, FM_YARD.bz + FM_SLIPZ + 5); parts.push([G.box(1.2, 1.0, 1.0), 0x4a4c3e, M4(wx, FY + 0.5, wz)], [G.cyl(0.35, 0.35, 1.3, 12), 0x2a2a26, M4(wx, FY + 1.2, wz, Math.PI / 2, 0, 0)]); addCollider(wx, wz, 0.7, 0.6, 0, FY + 1.5);
    C.slip = new THREE.Mesh(PONT_GEO, MAT.vc); const [sx, sz] = FW(-344, FM_YARD.bz + FM_SLIPZ); C.slip.position.set(sx, FY + 0.6, sz); C.slip.userData.dyn = true; scene.add(SH(onLayer1(C.slip)));
    C.yardProps = [];
    for (const [lx, lz] of [[-330, FM_YARD.bz - 30], [-330, FM_YARD.bz + 30], [-322, FM_YARD.bz - 38]]) { const [x, z] = FW(lx, lz); const m = new THREE.Mesh(PONT_GEO, MAT.vc); m.position.set(x, FY + 0.75, z); m.rotation.y = Math.PI / 2; m.userData.dyn = true; C.yardProps.push(m); scene.add(SH(onLayer1(m))); addCollider(x, z, 2.8, FM_SEGL / 2, 0, FY + 1.6); coverBox(x, z, 2.8, FM_SEGL / 2, 0, 1.4); }
    for (const [lx, lz, a] of [[-312, -112, 0.0], [-312, -28, 0.0]]) { const [x, z] = FW(lx, lz); const m = new THREE.Mesh(PONT_TRUCK, MAT.vc); m.position.set(x, FY, z); m.rotation.y = a; m.userData.dyn = true; C.yardProps.push(m); scene.add(SH(onLayer1(m))); addCollider(x, z, 3.4, 1.3, a, FY + 3.3); coverBox(x, z, 3.4, 1.3, a, 2.2); }
    for (const [lx, lz] of [[-324, -60], [-326, -82], [-305, -45], [-305, -96]]) { const [x, z] = FW(lx, lz); fieldDrums(x, z, 6); }
    { const [fx, fz] = FW(-305, -18); flag(fx, fz, 'il', 7, Math.PI / 2); }
  }
  // the pontoon bridge: twelve sections from the ramp to the west bank; each carries a floor that exists only once the section is in place
  C.pont = []; FMX.brFloor.length = 0;
  for (let k = 0; k < FM_BR.n; k++) { const lx = FM_BR.x0 - (k + 0.5) * FM_SEGL, [x, z] = FW(lx, FM_YARD.bz); const m = new THREE.Mesh(PONT_GEO, MAT.vc); m.position.set(x, 0.2, z); m.userData = { dyn: true, x, z, k }; m.visible = false; SH(m, true, true); onLayer1(m); scene.add(m); C.pont.push(m);
    const [fa, fb] = FW(lx - FM_SEGL / 2 - 0.05, FM_YARD.bz - 2.1), [fc, fd] = FW(lx + FM_SEGL / 2 + 0.05, FM_YARD.bz + 2.1); FMX.brFloor.push(addFloor(fa, fc, fb, fd, -100)); }
  { // the far end: a landing ramp up the west bank, and the bridgehead the paratroopers of 247 hold since the night
    const [a, b] = FW(FM_BR.x1 - 10, FM_YARD.bz - 2.3), [c, d] = FW(FM_BR.x1 + 0.5, FM_YARD.bz + 2.3); FMX.brFloor.push(addRamp(a, c, b, d, 'x', a, c, 1.35, 0.95)); wood.push([G.box(Math.abs(c - a), 0.2, 4.6), 0x5a5d4c, M4((a + c) / 2, 1.1, (b + d) / 2, 0, 0, -0.04)]);
    const [e, f] = FW(FM_BR.x0 + 0.5, FM_YARD.bz - 2.3), [g, h] = FW(FM_BR.x0 + 7, FM_YARD.bz + 2.3); FMX.brFloor.push(addRamp(e, g, f, h, 'x', e, g, 0.95, FY)); wood.push([G.box(Math.abs(g - e), 0.2, 4.6), 0x5a5d4c, M4((e + g) / 2, 1.5, (f + h) / 2, 0, 0, 0.16)]);
    for (const lz of [-100, -88, -76, -64, -52, -40]) { const [x0, z0] = FW(-520, lz), [x1, z1] = FW(-520, lz + 10); if (Math.abs(lz + 70) < 7) continue; bagWall([[x0, z0], [x1, z1]], 4, null, true); }
    const [fx, fz] = FW(-512, FM_YARD.bz + 9); C.wflag = flag(fx, fz, 'il', 6.5, Math.PI / 2); C.wflag.userData.dyn = true;
    // the rubber boats of 247, for the night of the crossing
    C.rboats = [0, 1, 2].map(() => { const b = new THREE.Mesh(RBOAT_GEO, MAT.vc); b.userData.dyn = true; b.visible = false; scene.add(SH(onLayer1(b))); return b; });
  }
  // Africa: palms and orchards along the sweet-water canal, a few mud houses
  { const pl = []; for (let i = 0; i < 70; i++) { const lx = -530 - r() * 170, lz = -500 + r() * 800; if (Math.abs(lx + 575) < 8) continue; const [x, z] = FW(lx, lz); pl.push([x, z, 0.8 + r() * 0.35, r() * 6]); } palms(pl); }
  { const trees = []; for (let i = 0; i < 160; i++) { const lx = -590 - r() * 120, lz = -420 + r() * 700; trees.push([lx, lz]); } const tg = build([[G.cyl(0.12, 0.18, 1.6, 6), 0x5a4632, M4(0, 0.8, 0)], [G.sph(1.5, 9, 7), 0x48603a, M4(0, 2.3, 0, 0, 0, 0, 1, 0.8, 1)]]); const im = new THREE.InstancedMesh(tg, MAT.vc, trees.length), mm = new THREE.Matrix4(), q = new THREE.Quaternion(); trees.forEach(([lx, lz], i) => { const [wx, wz] = FW(lx, lz), s = 0.8 + r() * 0.5; im.setMatrixAt(i, mm.compose(V3(wx, groundAt(wx, wz), wz), q.setFromAxisAngle(V3(0, 1, 0), r() * 6), V3(s, s, s))); }); scene.add(SH(onLayer1(im))); }
  for (const [lx, lz, w, d] of [[-610, -150, 6, 5], [-640, 40, 5, 4], [-620, 160, 6, 6]]) { const [x, z] = FW(lx, lz); smallHut(x, z, w, d, 2.7, '#c7b48e', 0x7a6a52, false); }
  // the desert, the ditches and the canal's edge: scrub, stones, dry weeds, reeds; stubble on the plots
  const L = (x, z) => FL(x, z);
  const okD = (x, z) => { const [lx, lz] = L(x, z); return !fmInFarm(lx, lz, 4) && lx > FM_CANAL.x + FM_CANAL.hw + 14 && Math.abs(lx - FM_LEX) > 6 && Math.abs(lz - FM_TIR) > 6 && distPolyline(lx, lz, FM_AKAVISH) > 7 && !(lz > FM_YARD.z0 - 4 && lz < FM_YARD.z1 + 4 && lx < FM_YARD.x1 + 6) && lz < FM_LAKE - 10; };
  dressArea(FM.o.x - 250, FM.o.x + 700, FM.o.z - 880, FM.o.z + 380, okD, 1580, 1.0, 0.12);
  dressRoute(W([[FM_LEX, 330], [FM_LEX, -860]]), okD, 1581, 1.0, 0.15); dressRoute(W([[FM_LEX, FM_TIR], [880, FM_TIR - 6]]), okD, 1582, 1.0, 0.1);
  instScatter(ROCK_G, scatterIn(LITE ? 300 : 700, FM.o.x - 250, FM.o.x + 700, FM.o.z - 880, FM.o.z + 380, 1583, okD, (x, z, rr) => [x, z, 0.2 + rr() ** 3 * 0.9, rr() * 6, rockCol(rr), 0.2, 0.55]));
  { const st = []; for (const p of FM_PLOTS) { const n = Math.round((p.x1 - p.x0) * (p.z1 - p.z0) / (LITE ? 60 : 26)); for (let i = 0; i < n; i++) { const lx = lerp(p.x0 + 1, p.x1 - 1, r()), lz = lerp(p.z0 + 1, p.z1 - 1, r()); const [x, z] = FW(lx, lz); st.push([x, z, 0.5 + r() * 0.6, r() * 6, tallCol(r), FY - groundAt(x, z), 0.75]); } } instScatter(TALL_G, st, NAT_MAT, false); }
  { const wd = []; for (let i = 0; i < (LITE ? 700 : 1700); i++) { const vert = r() < 0.5, lx = vert ? FM_DX[Math.floor(r() * FM_DX.length)] + rand(-1.3, 1.3) : rand(FM_FARM.x0, FM_FARM.x1), lz = vert ? rand(FM_FARM.z0, FM_FARM.z1) : FM_DZ[Math.floor(r() * FM_DZ.length)] + rand(-1.3, 1.3); if (fmPlotAt(lx, lz) || !fmInFarm(lx, lz)) continue; const [x, z] = FW(lx, lz); wd.push([x, z, 0.35 + r() * 0.5, r() * 6, grassCol(r), 0, 0.7]); } instScatter(GRASS_G, wd, NAT_MAT, false); }
  { const reeds = []; for (let lz = -860; lz < 380; lz += 3) for (const sd of [-1, 1]) { if (r() < 0.35 || (Math.abs(lz - FM_YARD.bz) < 10)) continue; const [x, z] = FW(FM_CANAL.x + sd * (FM_CANAL.hw + rand(-1, 3)), lz + rand(-1, 1)); reeds.push([x, z, 0.8 + r() * 0.5, r() * 6, r() < 0.5 ? 0x7a8a4a : 0x8a8a58, 0, 1]); } instScatter(REED_G, reeds, DET_MAT, false); }
  for (const [lx, lz, s] of [[-900, -600, 40], [700, -900, 34], [-300, -1100, 50], [900, 200, 30]]) { const [x, z] = FW(lx, lz); smokeColumn(x, z, s, true); }
  // meshes
  scene.add(SH(onLayer1(new THREE.Mesh(build(parts), new THREE.MeshStandardMaterial({ vertexColors: true, map: TX.grime, roughness: 0.95 })))));
  if (wood.length) scene.add(SH(onLayer1(new THREE.Mesh(build(wood), new THREE.MeshStandardMaterial({ vertexColors: true, map: TX.wood, roughness: 0.92 })))));
  BATCH.bag = sv; if (BAGS.length) scene.add(bagMesh(BAGS)); C.covers = COVER.slice(k0); for (const c of C.covers) c.y = hAt(c.x, c.z, FY + 0.5);
  fmVehicles(C);
}
/* ---------- vehicles: the 14th Brigade's tanks at the junction, the half-track, the carriers and tanks of the dawn, the convoy, the T-55s dug into the farm ---------- */
function fmVehicles(C) {
  const tank = (o = {}) => addVeh(Object.assign({ mode: 'farm', side: 'f', kind: 'tank', geo: TANK_GEO, half: [3.4, 2.6, 1.9], guns: true, vmax: 4.5, rpgHit: 34, sturdy: true, hitP: 0.18, shellDmg: 26 }, o));
  C.tanks = [0, 1, 2, 3, 4, 5].map(() => tank());
  C.ht = addVeh({ mode: 'farm', side: 'f', kind: 'jeep', geo: HT_MED_GEO, half: [3.1, 2.2, 1.15], guns: false, vmax: 5, rpgHit: 22 });
  for (const sz of FM_STR) { const sm = new THREE.Mesh(STRETCHER_GEO, MAT.vc); sm.position.set(-4.4, 0, sz); C.ht.g.add(sm); }   // a stretcher for each of the two wounded
  C.apc = [0, 1].map((i) => addVeh({ mode: 'farm', side: 'f', kind: 'apc', geo: M113_GEO, half: [2.4, 2.1, 1.35], guns: true, vmax: 6.5, rpgHit: 30, sturdy: true, name: ['הנגמ״ש הראשון', 'הנגמ״ש השני'][i], lto: ['לנגמ״ש הראשון', 'לנגמ״ש השני'][i], bin: ['בנגמ״ש הראשון', 'בנגמ״ש השני'][i] }));
  C.btank = [0, 1, 2].map(() => tank({ vmax: 5 }));
  C.conv = [0, 1, 2].map(() => addVeh({ mode: 'farm', side: 'f', kind: 'jeep', geo: PONT_TRUCK, half: [3.4, 3.3, 1.3], guns: false, vmax: 7 }));
  C.ytank = [0, 1].map(() => tank({ guns: false, float: (x, z) => { const [lx, lz] = FL(x, z); return Math.abs(lz - FM_YARD.bz) < 2.6 && lx < FM_BR.x0 + 0.5 && lx > FM_BR.x1 - 0.5 ? 0.85 : null; } }));
  C.etruck = addVeh({ mode: 'farm', side: 'e', kind: 'truck', geo: ETRUCK_GEO, half: [3.2, 2.6, 1.2], armor: 0, vmax: 7, shoots: false, hp: 100 });
  C.t55 = [0, 1, 2].map(() => addVeh({ mode: 'farm', side: 'e', kind: 't55', geo: T55_HULL, turGeo: T55_TUR, turAt: [0.3, 1.42, 0], half: [3.2, 2.3, 1.75], armor: 0, shoots: true, vmax: 0, hp: 100 }));
  for (const v of VEH) if (v.mode === 'farm') { v.g.visible = false; v.shown = false; }
}
const fmPose = (v, lx, lz, hd, y) => { const [x, z] = FW(lx, lz); v.hdV = hd; vehPose(v, x, z, hd); if (y !== undefined) v.g.position.y = y; v.g.visible = true; v.shown = true; };
const fmHide = (v) => { v.g.visible = false; v.shown = false; v.path = null; v.stop = undefined; v.onEnd = null; v.tgtV = null; };
/* ---------- smoke grenades: a white cloud that hides whatever is behind it. A Sagger operator who loses sight of his target loses his missile ---------- */
const SMOKES = []; let SMOKE_ID = 0;
const SMOKE_POOL = new SpritePool(LITE ? 44 : 72, FXT.puff, false, 0xd9d5cc);
function smokeAdd(p, t0 = 0, life = 19) {
  const m = { id: ++SMOKE_ID, p: p.clone(), t: t0, life, r: 0, rMax: 8.2, puffs: [] }; SMOKES.push(m);
  const n = LITE ? 7 : 11; for (let i = 0; i < n; i++) { const q = SMOKE_POOL.get(); q.life = life - t0; q.t = 0; const a = i / n * 6.283 + Math.random(), d = i === 0 ? 0 : rand(1.5, 5.5), h = rand(0.6, 3.6); q.s.material.color.setHex(i % 3 ? 0xd9d5cc : 0xc4c0b6);
    q.upd = (qq, u) => { const T = m.t, grow = clamp(T / 2.6, 0, 1), fade = clamp((m.life - T) / 4, 0, 1); qq.s.position.set(m.p.x + Math.cos(a + T * 0.05) * d * (0.5 + 0.5 * grow), m.p.y + h * (0.5 + 0.5 * grow) + T * 0.06, m.p.z + Math.sin(a + T * 0.05) * d * (0.5 + 0.5 * grow)); qq.s.scale.setScalar((3 + 6.5 * grow) * (1 + T * 0.012)); qq.s.material.opacity = 0.9 * fade * Math.min(1, T * 2 + 0.2); };
    m.puffs.push(q); }
  return m;
}
function smokeUpd(dt) { for (let i = SMOKES.length - 1; i >= 0; i--) { const m = SMOKES[i]; m.t += dt; const grow = clamp(m.t / 2.6, 0, 1), fade = clamp((m.life - m.t) / 4, 0, 1); m.r = m.rMax * grow * (0.4 + 0.6 * fade); if (m.t >= m.life) SMOKES.splice(i, 1); } }
// a line of sight through a cloud is cut: the segment passes within the cloud's radius of its centre (a sphere 2.4 m above the ground)
function smokeBlocks(ax, ay, az, bx, by, bz) {
  if (!SMOKES.length) return false;
  for (const m of SMOKES) { if (m.r < 2.5) continue; const cx = m.p.x, cy = m.p.y + 2.2, cz = m.p.z, dx = bx - ax, dy = by - ay, dz = bz - az, L2 = dx * dx + dy * dy + dz * dz || 1, t = clamp(((cx - ax) * dx + (cy - ay) * dy + (cz - az) * dz) / L2, 0, 1), px = ax + dx * t - cx, py = ay + dy * t - cy, pz = az + dz * t - cz; if (px * px + py * py * 2.2 + pz * pz < m.r * m.r) return true; }
  return false;
}
function smokesRestore(list) { SMOKE_POOL.clear(); SMOKES.length = 0; for (const s of list) smokeAdd(s.p, s.t, s.life); }
function throwSmoke() {
  if (P.mode !== 'rifle' || !(P.smoke > 0) || P.throwT > 0 || P.reloadT > 0) return; P.smoke--; P.throwT = 0.7;
  const f = camForward(V3()), from = camera.position.clone().addScaledVector(f, 0.6), m = new THREE.Mesh(GREN_GEO, MAT.vc); m.scale.set(1.3, 1.8, 1.3); m.position.copy(from); onLayer1(m); scene.add(m);
  PROJ.push({ type: 'smokeg', m, v: f.multiplyScalar(19).add(V3(0, 4.0, 0)), fuse: 1.25, owner: 'player' }); sndClick(700, 0.2);
}
function updSmokeGren(q, dt) {
  q.v.y -= 9.8 * dt; q.fuse -= dt; const o = q.m.position, tx = o.x + q.v.x * dt, ty = o.y + q.v.y * dt, tz = o.z + q.v.z * dt;   /* not nx/nz: nz is the noise burst the hiss below plays */
  if (segHitT(o.x, o.y, o.z, tx, o.y, o.z) >= 0) q.v.x *= -0.3; else o.x = tx; if (segHitT(o.x, o.y, o.z, o.x, o.y, tz) >= 0) q.v.z *= -0.3; else o.z = tz; o.y = ty;
  const g = Math.max(hAt(o.x, o.z, o.y + 0.3), -0.3); if (o.y < g + 0.05) { o.y = g + 0.05; q.v.y = Math.abs(q.v.y) * 0.25; q.v.x *= 0.5; q.v.z *= 0.5; }
  if (q.fuse <= 0) { smokeAdd(V3(o.x, g, o.z)); sndClick(300, 0.3); if (AUD.ctx) nz(AUD.ctx.currentTime, 1.4, { f: 1800, type: 'highpass', q: 0.5, vol: 0.12 }); return true; }
  return false;
}
// the schematic of the battlefield, for the operations room
function fmMapBase(br, missouri = true) {
  const ditch = [56, 80, 104, 128].map((y) => `M228 ${y} H440`).join(' ') + ' ' + [268, 308, 348, 388].map((x) => `M${x} 36 V138`).join(' ');
  return `
    <rect class="mm-field" x="0" y="0" width="150" height="300"/><path class="mm-water" d="M86 0 V300" style="fill:none;stroke-width:3"/>
    <rect class="mm-water" x="150" y="0" width="34" height="294"/><path class="mm-water" d="M0 300 C 120 286, 220 298, 340 318 L 340 360 L 0 360 Z"/>
    <text class="mm-t mm-wt" x="167" y="110" transform="rotate(-90 167 110)">תעלת סואץ</text><text class="mm-t mm-wt" x="120" y="336">האגם המר הגדול</text>
    <path class="mm-ridge" d="M190 0 V 290" style="stroke-width:6"/>
    <rect class="mm-field" x="228" y="36" width="212" height="102"/><path class="mm-trench2" d="${ditch}"/><path class="mm-hatch" d="M228 36 H440 V138 H228 Z"/>
    <text class="mm-t" x="334" y="92">החווה הסינית</text>
    ${missouri ? '<path class="mm-hatch" d="M228 0 H470 V28 H228 Z"/><text class="mm-t mm-sm mm-red" x="350" y="20">מיזורי</text>' : ''}
    <path class="mm-road" d="M206 300 V 0"/><path class="mm-road" d="M206 296 C 300 290, 450 282, 640 276"/><path class="mm-road" d="M206 150 L 640 146"/>
    <text class="mm-t mm-sm" x="222" y="60" transform="rotate(-90 222 60)">לכסיקון</text><text class="mm-t mm-sm" x="560" y="140">טרטור</text><text class="mm-t mm-sm" x="560" y="270">עכביש</text>
    <rect class="mm-bunker" x="184" y="196" width="20" height="38"/><text class="mm-t mm-sm" x="236" y="220" text-anchor="start">החצר · מצמד</text>
    <rect class="mm-post" x="192" y="182" width="8" height="8"/><rect class="mm-post" x="192" y="240" width="8" height="8"/><rect class="mm-post" x="202" y="292" width="8" height="8"/><text class="mm-t mm-sm" x="236" y="306" text-anchor="start">לקקן</text>
    <text class="mm-t mm-sm" x="234" y="166" text-anchor="start">הצומת</text>${MM.x(382, 150, 5)}<text class="mm-t mm-sm" x="382" y="174">טרטור 42</text>
    ${br ? '<path class="mm-bridge" d="M150 214 L 184 214" style="stroke:#3a3a34;stroke-width:6"/>' : ''}
    <text class="mm-side" x="75" y="150" text-anchor="middle">הגדה המערבית</text><text class="mm-side" x="75" y="168" text-anchor="middle">״אפריקה״</text><text class="mm-side" x="540" y="330" text-anchor="middle">הגדה המזרחית · סיני</text>`;
}
/* ---------- artillery that comes in bursts: a calm, the warning, then the shells - in the Yard, and on the bridge ---------- */
function fmBarStart(calm = 10) { FM.bar = { on: true, phase: 'calm', t: 0, calm, warn: 4.5, fire: 6.5, shellT: 0, n: 0 }; }
function fmBarStop() { FM.bar = { on: false, phase: 'calm', t: 0, calm: 12, warn: 4.5, fire: 6.5, shellT: 0, n: 0 }; }
function fmInShelter() { if (MODE !== 'farm' || FM.stage !== S_YARD) return false; const [lx, lz] = FL(P.pos.x, P.pos.z); return CHAP.farm.shelters.some((s) => Math.abs(lx - s.lx) < s.hw && Math.abs(lz - s.lz) < s.hd); }
function fmBarUpd(dt) {
  const B = FM.bar; if (!B || !B.on || CINE.on) return; B.t += dt;
  if (B.phase === 'calm' && B.t > B.calm) { B.phase = 'warn'; B.t = 0; radio('קשר', pick(['ארטילריה! הם יורים! כולם למחסה!', 'פגזים בדרך אלינו! למחסות!', 'מטח נכנס! לבונקרים, מהר!']), 3); for (let k = 0; k < 3; k++) DIRQ.push({ at: GAME.t + 1.2 + k * 1.1, shell: true, fn: () => sndWhistle(2.4) }); fmEngShelter(true); }
  else if (B.phase === 'warn' && B.t > B.warn) { B.phase = 'fire'; B.t = 0; B.shellT = 0; B.n++; }
  else if (B.phase === 'fire') {
    B.shellT -= dt; if (B.shellT <= 0) { B.shellT = rand(0.28, 0.5); fmShell(); }
    if (B.t > B.fire) { B.phase = 'calm'; B.t = 0; B.calm = rand(12, 15); radio('קשר', pick(['המטח נגמר! לעבודה, מהר!', 'שקט. יש לכם כמה שניות — קדימה!', 'נגמר. לדוברה, לפני המטח הבא!']), 2.6); fmEngShelter(false); fmEngAdd(); }
  }
}
// a shell: mostly into the Yard and the water by the bridge; a man in the open draws them
function fmShell() {
  const Y = FM_YARD, open = !fmInShelter() && P.alive, r = Math.random(); let lx, lz;
  if (open && r < 0.3) { const [px, pz] = FL(P.pos.x, P.pos.z), a = rand(0, 6.28), d = rand(3, 13); lx = px + Math.cos(a) * d; lz = pz + Math.sin(a) * d; }
  else if (r < 0.62) { lx = rand(Y.x0 + 2, Y.x1); lz = rand(Y.z0 + 4, Y.z1 - 4); }
  else { lx = rand(FM_BR.x1, FM_BR.x0 + 4); lz = Y.bz + rand(-26, 26) * (Math.random() < 0.5 ? 1 : 0.4); }
  if (Math.abs(lz - Y.bz) < 4 && lx < FM_BR.x0 + 2 && lx > FM_BR.x1) lz = Y.bz + (Math.random() < 0.5 ? -1 : 1) * rand(6, 14);   // the bridge itself takes only the hit the story gives it
  for (const s of CHAP.farm.shelters) if (Math.hypot(lx - s.lx, lz - s.lz) < 7) { lx = s.lx + (lx < s.lx ? -1 : 1) * 8; }
  const [x, z] = FW(lx, lz), g = groundAt(x, z), eta = 1.0; if (Math.hypot(x - camera.position.x, z - camera.position.z) < 70 && Math.random() < 0.5) sndWhistle(eta);
  DIRQ.push({ at: GAME.t + eta, shell: true, fn: () => { if (g < 0.1) fmSplash(V3(x, 0.1, z), 1.1); else explode(V3(x, g, z), 1.05, 9, 120, 'art'); } });
}
/* ---------- the director: helpers ---------- */
const fmPts = (list) => list.map(([x, z, y]) => [...FW(x, z), y]);
/* the lane of each stage (the straw rule: one route, never more than 50 m wide). Gated advances in a trench get the trench itself */
const FM_LANES = {
  jct: [[-290, -184], [-290, -226], [-262, -238], [-220, -238]],          // the junction: along Lexicon to the crossroads, then a little east along Tirtur
  pits: [[-305, -203], [-291, -228], [-250, -240]],                      // the four craters, from the road south of the junction to the farm's corner
  land: [[-488, -74], [-520, -86]],                                      // the west bank, from the boats to the line
  t42: [[356, -233], [212, -233], [205, -251]],                          // west along Tirtur, then down into the ditch
  hold: [[112, -252], [86, -252]],                                       // the stretch of ditch held till dawn
  smoke: [[100, -239], [178, -239]],                                     // the road and the ditch beside it, where the wounded lie
  yard: [[-333, -104], [-333, -36]],                                     // the Yard, from shelter to shelter past the slipway
};
const fmLane = (pts, hw) => laneSet(pts.map(([x, z]) => FW(x, z)), hw);
const fmNear = (lx, lz, r) => { const [x, z] = FW(lx, lz); return Math.hypot(P.pos.x - x, P.pos.z - z) < r; };
const fmNearV = (v, r) => v && v.g.visible && Math.hypot(P.pos.x - v.g.position.x, P.pos.z - v.g.position.z) < r;
// where the wounded are handed over: on the sand behind the ambulance's rear door, between its two stretchers
const FM_STR = [0.25, -0.8];
const fmEvac = () => CHAP.farm.ht.g.localToWorld(V3(-4.4, 0, -0.27));
const fmNearEvac = (r) => { const v = CHAP.farm.ht; if (!v || !v.g.visible) return false; const p = fmEvac(); return Math.hypot(P.pos.x - p.x, P.pos.z - p.z) < r; };
const fmLP = () => FL(P.pos.x, P.pos.z);
// man the positions that answer to a test, up to a number of men; most carry rifles, every fifth a machine gun
function fmMan(pred, tag, o = {}, max = 99, kindFn = null) { let n = 0; const C = CHAP.farm; const list = C.slots.filter((s) => !s.used && pred(s)); for (const s of list) { if (n >= max) break; const k = kindFn ? kindFn(n, s) : n % 5 === 2 ? 'lmg' : n % 7 === 4 ? 'smg' : 'rifle'; if (fSlotPlace(s, k, tag, o)) n++; } return n; }
// a man who runs in along a ditch or a road, in plain sight
function fmRun(from, path, kind, tag, delay, gate) { DIRQ.push({ at: GAME.t + delay, spawn: true, gate, fn: () => { const [x, z] = FW(from[0] + rand(-1, 1), from[1] + rand(-1, 1)); const e = fSpawnStreet(x, z, path.map(([a, b]) => FW(a + rand(-0.7, 0.7), b + rand(-0.7, 0.7))), kind); if (e) e.sq = tag; } }); }
// a tank-hunter team: an RPG man who runs for a tank, out of the ditch and up to its hull
function fmHunter(from, path, tank, tag, delay, gate) { DIRQ.push({ at: GAME.t + delay, spawn: true, gate, fn: () => { if (!tank.alive) return; const [x, z] = FW(...from); const e = fSpawnStreet(x, z, path.map(([a, b]) => FW(a, b)), 'rpg'); if (e) { e.sq = tag; e.hunter = tank; e.rpgCd = rand(7, 11); } } }); }
function fmTankTarget() { const al = CHAP.farm.tanks.filter((v) => v.alive && v.g.visible); return al.length ? pick(al) : null; }
function fmBridgeSet(n, walk) { const C = CHAP.farm; FM.br = n; C.pont.forEach((m, k) => { m.visible = k < n; m.position.set(m.userData.x, 0.2, m.userData.z); m.rotation.set(0, 0, 0); }); FMX.brFloor.forEach((s, k) => { if (k < FM_BR.n) s.y = walk && k < n ? 0.92 : -100; else { s.y0 = walk ? (k === FM_BR.n ? 1.35 : 0.95) : -100; s.y1 = walk ? (k === FM_BR.n ? 0.95 : FY) : -100; } }); }
function fmFriends(defs) { fieldFriends(defs); }
function fmWounded(list) {
  // the wounded of a stage: lying, bandaged, waiting to be carried; marked with a cross and a name
  list.forEach(([name, lx, lz, show], i) => { const f = FRIENDS[10 + i], u = f.unit; f.name = name; f.aid = false; f.post = null; f.target = null; f.bleed = 0; f.state = show ? 'stable' : 'bunker'; f.marker.visible = !!show;
    u.alive = true; u.fall = 1; u.stance = 'down'; const [x, z] = FW(lx, lz); u.place(x, z, hAt(x, z, FY + 0.5) + 0.05); u.heading = rand(0, 6); u.rig.root.visible = !!show; u.rig.gun.visible = false; u.rig.pose('prone', 0); u.sync(); });
}
function fmLoad(target) {
  const f = P.carrying; if (!f) return; P.carrying = null; P.mode = 'rifle'; f.state = 'saved'; f.unit.rig.root.visible = false; f.marker.visible = false; STATS.saved++;
  if (target === 'ht') { const v = CHAP.farm.ht, k = Math.min(FM.saved || 0, FM_STR.length - 1), sp = v.g.localToWorld(V3(-4.4, 0, FM_STR[k])), u = f.unit;   /* he is laid on the next free stretcher */
    const h = v.hdV ?? 0, ax = Math.sin(h), az = Math.cos(h);   /* a man prone lies behind his own feet: the feet go to the stretcher's end by the truck */
    u.rig.root.visible = true; u.fall = 1; u.stance = 'down'; u.place(sp.x + ax * 0.95, sp.z + az * 0.95, sp.y + 0.24); u.heading = h; u.snapHd = true; u.rig.pose('prone', 0); u.sync();
    FM.saved = (FM.saved || 0) + 1; feed(`${f.name} אצל החובש, באמבולנס`, 'good'); radio('חובש', pick(['תן אותו לי. הוא נושם — יהיה בסדר.', 'קיבלתי אותו. לך להביא את הבא!']), 2.6); }
  else { target.load = (target.load || 0) + 1; FM.loaded = (FM.loaded || 0) + 1; feed(`${f.name} ${target.bin} · ${FM.loaded}/4`, 'good'); radio('נהג הנגמ״ש', pick(['עלה! עוד אחד ויוצאים!', 'יש לנו אותו. מהר, הבא!', 'סוגר עליו — תביא את הבא!']), 2.4); }
  snapRequest('loaded');
}
/* ---------- the director: places ---------- */
const S_JCT = 0, S_PITS = 1, S_AQ = 2, S_T42 = 3, S_SMOKE = 4, S_YARD = 5;
// the craters round the junction where the wounded of the first night lie: two of ours, two not
const FM_PITS = [[-302, -209], [-293, -224], [-270, -236], [-252, -241]];   // along the one lane of the stage, from the road south of the junction to the farm's corner
const FM_HT1 = [-296, -214];                              // the half-track that takes them out
// the first night: the tanks at the junction, then east along the ditch at the farm's south edge, bound by bound
const FM_TPOS = [[-290, -196, Math.PI], [-289, -178, Math.PI], [-282, -232, 1.9], [-250, -224, Math.PI / 2], [-222, -228, Math.PI / 2], [-291, -140, Math.PI]];
const FM_TNAME = ['טנק 1', 'טנק 2', 'הטנק בצומת', 'טנק 4', 'טנק 5', 'טנק 6'];
const FM_G0 = [[-276, -232], [-257, -251], [-214, -252], [-170, -252], [-128, -252]];
const FM_G0R = [[[-236, -252]], [[-190, -252], [-190, -282]], [[-146, -252]], [[-104, -252], [-120, -282]]];
// the boats of 247: from the foot of the Yard's ramp straight across, and the line they took on the far bank
const FM_AQ0 = -357, FM_AQ1 = -485, FM_AQP = [-516, -84];
const FM_NAMES3 = ['רמי', 'יגאל', 'חזי', 'ששון', 'גיל', 'דב', 'מוטי', 'אריה', 'צביקה', 'עמי', 'פיני'];
// the second night: the ditch the paratroopers jumped into at Tirtur 42, west along it, and where they held till dawn
const FM_DITCH2 = [205, -251];
const FM_G2 = [[205, -251], [166, -252], [128, -252], [98, -252]];
const FM_G2R = [[[150, -252]], [[110, -252], [90, -282]], [[70, -252], [90, -292]]];
const FM_HOLD = [98, -252];
// the dawn: the wounded in the ditch beside the road, the Sagger crews up in the farm ahead of them, in one sector
const FM_COLL = [[118, -251.4], [131, -251.4], [144, -251.4], [157, -251.4]];
const FM_SAG = [[50, -462], [110, -462], [170, -462], [80, -410], [140, -410], [20, -410]];
const FM_WNAMES = [['אבנר', 'שלמה'], ['יוחנן', 'רפאל', 'משה', 'חנן']];
const FM_ENG = ['יוני', 'חזי', 'רוני', 'שאול', 'אבי', 'מנחם'];
// along Akavish, for the films
const fmAkZ = (x) => (x < -120 ? 340 + (-120 - x) * 0.0706 : 340 - (x + 120) * 0.11);
/* the craters: a scorched disc, a rim of thrown earth and a few bags; each has a marker the second stage lights in yellow */
function fmPitsBuild(parts) {
  FMX.pitMk.length = 0;
  const mat = new THREE.MeshStandardMaterial({ color: 0x2a241c, roughness: 1, transparent: true, opacity: 0.78, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
  FM_PITS.forEach(([lx, lz], i) => {
    const [x, z] = FW(lx, lz), y = groundAt(x, z), r = rng(900 + i);
    const disc = new THREE.Mesh(new THREE.CircleGeometry(2.3, 20).rotateX(-Math.PI / 2), mat); disc.position.set(x, y + 0.05, z); scene.add(onLayer1(disc));
    for (let k = 0; k < 9; k++) { const a = k / 9 * 6.283 + (r() - 0.5) * 0.4, d = 2.3 + r() * 0.6; parts.push([G.sph(0.35 + r() * 0.25, 7, 5), 0x7d6c52, M4(x + Math.cos(a) * d, y + 0.05, z + Math.sin(a) * d, 0, 0, 0, 1.4, 0.45, 1.1)]); }
    const arc = [], a0 = r() * 6; for (let a = 0; a <= 1.6; a += 0.4) arc.push([x + Math.cos(a0 + a) * 2.9, z + Math.sin(a0 + a) * 2.9]); bagWall(arc, 2, y - 0.05, false);
    const el = document.createElement('div'); el.className = 'mk pit'; const mk = new CSS2DObject(el); mk.center.set(0.5, 1); mk.position.set(x, y + 1.7, z); mk.visible = false; mk.userData.dyn = true; scene.add(mk); FMX.pitMk.push({ mk, el, x, y, z });
  });
}
/* ---------- the director: helpers ---------- */
const fmV = (lx, lz, dy = 0, y) => { const [x, z] = FW(lx, lz); return V3(x, (y ?? hAt(x, z, FY + 0.6)) + dy, z); };
const fmDef = (name, lx, lz, face = [0, -1], state = 'post') => { const [x, z] = FW(lx, lz); return { name, x, z, fx: face[0], fz: face[1], state, y: FY + 0.6 }; };
// a file behind the player: a pace and a half apart, alternating sides; back is the unit vector behind him
function fmSquad(names, at, back, state = 'follow') { const [x0, z0] = FW(at[0], at[1]), [bx, bz] = back; return names.map((name, i) => { const sd = i % 2 ? 0.9 : -0.9; return { name, x: x0 + bx * (2.4 + i * 1.6) + sd * bz, z: z0 + bz * (2.4 + i * 1.6) - sd * bx, state, fi: i, fx: -bx, fz: -bz, y: FY + 0.6 }; }); }
function fmCut(fn) { const f = $('#fade'); f.style.transition = 'opacity .5s'; f.style.opacity = '1'; DIRQ.push({ at: GAME.t + 0.55, fn: () => { fn(); f.style.transition = 'opacity 1.2s'; f.style.opacity = '0'; } }); }
// a vehicle driven along a path of local points, slowing to a halt at its end
function fmDrive(v, pts, vmax, onEnd = null) { v.path = pts.map(([x, z]) => FW(x, z)); v.s = 0; v.vmax = vmax; v.speed = 0; v.stop = pathLen(v.path); v.ended = false; v.onEnd = onEnd; v.hdV = null; const [x, z, hd] = pathAt(v.path, 0); vehPose(v, x, z, hd); v.g.visible = true; v.shown = true; }
// the opening of every stage: a camera flight from where the story was to where it is now, and one line on the screen - the place, the bank, the hour.
// Shots may carry their own hour (tod: minutes from midnight of the 15th) for films that pass through the night
function fmEstablish(st, title, shots, caps, end) {
  const ev = []; let t0 = 0; for (const sh of shots) { if (sh.tod !== undefined) { const m = sh.tod; ev.push([t0 + 0.001, () => { FM.filmTod = m; }]); } t0 += sh.d; }
  if (shots[0].tod !== undefined) FM.filmTod = shots[0].tod;
  playCine({ vid: [null, 'fm_pits', 'fm_aq', 'fm_t42', 'fm_smoke', 'fm_yard'][st], title, shots, caps: caps || [], ev, end: (skip) => { FM.filmTod = null; const S = FM_STAGES[st]; toast(`שלב ${st + 1} מתוך ${FM_STAGES.length} · ${S.title}`, S.goal); if (end) end(skip); } });
}
const fmNearestTank = (p) => { let best = null, bd = 1e9; for (const v of CHAP.farm.tanks) if (v.alive && v.g.visible) { const d = Math.hypot(v.g.position.x - p[0], v.g.position.z - p[1]); if (d < bd) { bd = d; best = v; } } return best; };
// a tank-hunter: out of the ditch, across the open, to the side of the tank he was sent for
function fmHuntTo(from, delay, tank = null) {
  DIRQ.push({ at: GAME.t + delay, spawn: true, hunt: true, fn: () => {
    const [fx, fz] = FW(from[0] + rand(-1, 1), from[1] + rand(-1, 1)), v = tank && tank.alive ? tank : fmNearestTank([fx, fz]); if (!v) return;
    const t = v.g.position, dx = fx - t.x, dz = fz - t.z, d = Math.hypot(dx, dz) || 1, ex = t.x + dx / d * 3.6, ez = t.z + dz / d * 3.6;
    const e = fSpawnStreet(fx, fz, [[lerp(fx, ex, 0.45) + rand(-2, 2), lerp(fz, ez, 0.45) + rand(-2, 2)], [ex, ez]], 'rpg'); if (!e) return;
    e.sq = 'h'; e.hunter = v; e.wild = true; e.plant = 0; e.rpgCd = rand(8, 11);
    if (!FM.msgs.hunt1) { FM.msgs.hunt1 = true; radio('מ״פ', 'ציידי טנקים יוצאים מהתעלה! סימון צהוב — לחסל לפני שהם מגיעים לטנק!', 3.6); } } });
}
// two men up on a tank's deck behind the turret, prising at the hatch: they have a few seconds before it burns
function fmClimbers(v, n = 2) {
  if (!v || !v.alive) return; const offs = [[-1.9, 1.95, -0.7], [-1.5, 1.95, 0.75], [-2.3, 1.9, 0.1]];
  for (let k = 0; k < n; k++) { const p = v.g.localToWorld(V3(...offs[k])), e = spawnEnemy(p.x, p.z, k === 1 ? 'smg' : 'rifle', null, null); if (!e) continue;
    e.state = 'film'; e.sz = 'street'; e.sq = 'cl'; e.climbV = v; e.climbOff = offs[k]; e.climbT = 0; e.pos.copy(p); e.stance = 'crouch'; e.rig.pose('crouch', 0, 0); e.sync(); }
  radio(`מפקד ${v.name}`, 'יש מצרים עליי! על הסיפון! תורידו אותם ממני!', 3.2); feed(`מצרים מטפסים על ${v.name}!`, 'bad');
}
function fmHuntUpd(dt) {
  for (const e of UNITS.enemies) {
    if (e.hunter) { const v = e.hunter; if (!e.alive || !v.alive) { e.hunter = null; continue; }
      if (Math.hypot(e.pos.x - v.g.position.x, e.pos.z - v.g.position.z) < 5.8) { e.plant += dt; if (e.plant > 2.6) { vehDestroy(v); e.hunter = null; feed(`${v.name} נפגע מצייד טנקים`, 'bad'); radio('מ״פ', pick(['הוא הגיע לטנק! אל תתנו להם להגיע!', 'עוד טנק בוער! תורידו אותם לפני שהם מגיעים!']), 2.6); } } }
    if (e.climbV) { const v = e.climbV;
      if (!e.alive) { e.pos.y = Math.max(groundAt(e.pos.x, e.pos.z), e.pos.y - 7 * dt); if (e.state === 'dead') e.climbV = null; continue; }
      if (CINE.on) continue; const p = v.g.localToWorld(V3(...e.climbOff)); e.pos.copy(p); e.face(v.g.position.x, v.g.position.z); e.stance = 'crouch'; e.anim += dt * 2; e.rig.pose('crouch', e.anim, 0.4); e.sync();
      e.climbT += dt; if (e.climbT > 13 && v.alive) { vehDestroy(v); killEnemy(e, false); feed(`${v.name} עלה באש`, 'bad'); radio('מ״פ', 'הם זרקו רימון לצריח! הטנק בוער!', 2.6); } }
  }
}
/* ---------- set-up of a stage (also from a checkpoint without a save) ---------- */
function fmSetup(st) {
  const C = CHAP.farm; fieldSetupCommon(C, st); resetTrail();
  Object.assign(FM, { stage: st, t: 0, msgs: {}, ph: '', saved: 0, loaded: 0, jt: 0, kt: 0, holdT: 0, waveT: 0, salvoT: 6, salvoN: 0, blind: 0, eng: 0, hitDone: false, hitAnim: null, slip: { st: 'ready', t: 0 }, pits: [], drive: false, artT: 0, illumT: 5, shot0: STATS.shots || 0, infT: 20, aq: null, amb: 1, filmTod: null, film: [] });
  fmBarStop(); fmRingsClear(); SMOKE_POOL.clear(); SMOKES.length = 0; for (const m of FMX.pitMk) m.mk.visible = false;
  P.mode = 'rifle'; vm.visible = true; P.smokeMax = [0, 0, 0, 3, 8, 0][st]; P.smoke = P.smokeMax; if (TANK.g) TANK.g.visible = false;
  for (const v of VEH) if (v.mode === 'farm') { vehRevive(v, v.kind === 'apc' ? 90 : 100); fmHide(v); v.onHit = null; v.onDead = null; v.arrived = false; v.load = 0; v.shoots = false; v.speed = 0; v.s = 0; v.hdV = null; }
  meter(null); fmBridgeSet(st === S_YARD ? 3 : 0, false);
  { const [sx, sz] = FW(-344, FM_YARD.bz + FM_SLIPZ); C.slip.position.set(sx, FY + 0.6, sz); C.slip.rotation.set(0, 0, 0); C.slip.visible = st === S_YARD; }
  for (const m of C.yardProps) m.visible = st === S_YARD; if (C.wflag) C.wflag.visible = st >= S_T42; for (const b of C.rboats) b.visible = st === S_AQ;
  $('#clockSub').textContent = FM_CLOCK[st];
  const put = (lx, lz, face) => { const [x, z] = FW(lx, lz); P.pos.set(x, hAt(x, z, FY + 0.6), z); P.yaw = Math.atan2(-face[0], -face[1]); P.pitch = 0.02; };
  [fm0Setup, fm1Setup, fmAqSetup, fm3Setup, fm4Setup, fm5Setup][st](C, put);
  fmStage(st);
}
function fmStage(st) { const C = CHAP.farm; fieldStage(C, st); FM.stage = st; $('#toast').classList.remove('show'); [fm0Start, fm1Start, fmAqStart, fm3Start, fm4Start, fm5Start][st](C); }

/* ---------- stage 1: the junction, 15 October, 21:21 ---------- */
function fm0Setup(C, put) {
  C.tanks.forEach((v, i) => { const [lx, lz, hd] = FM_TPOS[i]; fmPose(v, lx, lz, hd); v.name = FM_TNAME[i]; });
  fmPose(C.ht, -296, -166, Math.PI);
  // the T-55s dug into the plots fire at the tanks all night (and miss more than they hit); they open up when the ambush does
  C.t55.forEach((v, i) => { const [lx, lz] = [[-150, -418], [30, -472], [-215, -490]][i]; fmPose(v, lx, lz, 0, FY - 1.0); v.shoots = false; v.tgtV = fmTankTarget; v.fireCd = rand(5, 10); });
  put(-284, -206, [0.49, -0.87]);
  fieldFriends(fmSquad(FM_NAMES1, [-284, -206], [-0.49, 0.87]));
  fmLane(FM_LANES.jct, 25);
}
/* the opening film, as it happened: the quiet drive into the seam between the two Egyptian armies, the crossing point reached without a shot,
   the column going on north - and the junction */
function fm0Start(C) {
  FM.ph = 'intro'; const T = C.tanks, t2 = T[2];
  const pose = (paths, vmax) => T.forEach((v, i) => { if (paths[i]) fmDrive(v, paths[i], vmax); });
  const shot1 = () => pose(T.map((v, i) => { const x0 = -30 + i * 15; return [[x0, fmAkZ(x0)], [x0 - 70, fmAkZ(x0 - 70)]]; }), 5);
  const shot2 = () => pose(T.map((v, i) => [[FM_LEX, -6 - i * 15], [FM_LEX, -40 - i * 15]]), 5);
  const shot3 = () => pose(T.map((v, i) => [[FM_LEX + (i % 2 ? 1.5 : -1.5), -120 - i * 13], [FM_LEX + (i % 2 ? 1.5 : -1.5), -150 - i * 13]]), 4);
  const shot4 = () => { T.forEach((v, i) => { const [lx, lz, hd] = FM_TPOS[i]; v.path = null; v.speed = 0; fmPose(v, lx, lz, hd); }); };
  const ak = fmV(-80, 352, 0), yard = fmV(-316, -58, 0), jct = fmV(-290, -120, 0), farm = fmV(-228, -246, 0, FY);
  shot1();
  playCine({ vid: 'fm_intro',
    title: 'מבצע אבירי לב · 15 באוקטובר 1973',
    shots: [
      { d: 5.2, cam: camLerp(ak.clone().add(V3(30, 7, 22)), ak.clone().add(V3(10, 5, 16)), () => T[2].g.position.clone().add(V3(0, 1.4, 0)), () => T[3].g.position.clone().add(V3(0, 1.4, 0)), 46) },
      { d: 5.2, cam: camLerp(fmV(-279, -66, 3.2), fmV(-281, -60, 2.8), () => T[1].g.position.clone().add(V3(0, 1.3, 0)), () => T[3].g.position.clone().add(V3(-6, 1.3, 0)), 50) },
      { d: 4.6, cam: (u) => ({ p: jct.clone().add(V3(-5, 5.5 - u, 22 - u * 8)), l: fmV(-260, -270, 2, FY), fov: 48 }) },
      { d: 5.2, slow: 0.55, cam: (u) => ({ p: t2.g.position.clone().add(V3(-15 + u * 3, 3.4, 13)), l: t2.g.position.clone().add(V3(0, 1.4, 0)), fov: 42 }) },
      { d: 4.2, cam: camLerp(farm.clone().add(V3(-34, 3.5, 30)), farm.clone().add(V3(-28, 3, 24)), farm, farm.clone().add(V3(4, -0.5, -4)), 46) },
    ],
    ev: [[0.001, () => { FM.filmTod = 18 * 60 + 10; }], [5.2, () => { FM.filmTod = 19 * 60 + 56; shot2(); }], [10.4, () => { FM.filmTod = 21 * 60 + 12; shot3(); }], [15.0, () => { FM.filmTod = 21 * 60 + 21; shot4(); }],
      [16.5, () => { const from = fmV(-246, -250, 1.6), to = t2.g.position.clone().add(V3(0, 1.5, 0)); fxMuzzle(from, true); fxTracer(from, to, true); sndShot('ak', from); }],
      [16.85, () => { const p = t2.g.position.clone().add(V3(0, 1.6, 0)); vehDestroy(t2); fxExplosion(p, 1.8); FX.shake = 0.7; }],
      [17.6, () => { const p = t2.g.position.clone().add(V3(1, 2.4, 0)); fxExplosion(p, 1.1); sndBoom(p, 0.8); }],
      [19.9, () => { for (const s of C.slots) if (s.grp === 'ES' && s.lx > -250 && s.lx < -200) { const e = spawnEnemy(s.p[0], s.p[1], 'rifle', null, null); if (!e) continue; e.state = 'film'; e.pos.y = s.y; e.heading = 0; e.stance = 'stand'; e.rig.pose('aim', 0, 0.05); e.noTag = true; e.sync(); FM.film.push(e); } }]],
    caps: [[0.3, '<b>18:05.</b> חטיבה 14 יוצאת לדרך — ונכנסת לתפר שבין שתי הארמיות המצריות.', 4.6], [5.4, 'ציר לכסיקון ריק. בסביבות 20:00 הטנקים כבר ליד החצר במעוז מצמד — נקודת הצליחה — בלי שנורתה ירייה.', 4.8], [10.6, 'נקודת הצליחה בידינו. אבל הדרכים אליה, עכביש וטרטור, עוברות ליד החווה הסינית.', 4.2],
      [15.2, '<b>21:21.</b> גדוד 184 נכנס לצומת טרטור–לכסיקון. בתוך דקות נפגעים עשרה טנקים.', 4.6], [20.1, 'תעלות ההשקיה של החווה מלאות בחי״ר מצרי. אתם החי״רניקים בין הטנקים.', 3.8]],
    end: () => { FM.filmTod = null; for (const e of FM.film) { e.alive = false; e.rig.root.visible = false; e.tag.visible = false; } FM.film = []; shot4(); fm0Begin(); },
  });
}
function fm0Begin() {
  const C = CHAP.farm; if (C.tanks[2].alive) vehDestroy(C.tanks[2], true); FM.ph = 'jct'; FM.jt = 0; for (const v of C.t55) v.shoots = true;
  const S = FM_STAGES[0]; toast(`שלב 1 מתוך ${FM_STAGES.length} · ${S.title}`, S.goal);
  // one front: the edge of the farm north-east of the junction comes alive
  fmMan((s) => s.grp === 'ES' && s.lx > -256 && s.lx < -196, 'j', { dormant: false }, 5);
  fmMan((s) => s.grp === 'PS' && s.pl.j === 0 && s.lx < -200, 'j', { dormant: false }, 2);
  fmMan((s) => s.grp === 'ET' && s.lx < -205, 'j', { dormant: false }, 3);
  radio('מ״פ', 'אש מהתעלה מצפון! ציידי טנקים — סימון צהוב! תורידו אותם לפני שהם מגיעים לטנקים!', 4);
  hint('fm-hunt', 'ציידי טנקים מסומנים <b>בצהוב</b>: הם יוצאים מקצה החווה ורצים אל הטנקים. אחד שמגיע לטנק — הטנק עולה באש. ירו בהם קודם.', 8);
}
function fm0Upd(dt, C) {
  if (FM.ph === 'jct') {
    FM.jt += dt; const W = [['w1', 1.5], ['cl', 12], ['w2', 18], ['w3', 33], ['w4', 47]];
    for (const [k, at] of W) if (!FM.msgs[k] && FM.jt > at) { FM.msgs[k] = true;
      if (k === 'w1') { fmHuntTo([-246, -250], 0, C.tanks[3]); fmHuntTo([-232, -250], 1.2, C.tanks[4]); fmHuntTo([-256, -252], 2.4, C.tanks[0]); }
      if (k === 'cl') { const v = C.tanks[3].alive ? C.tanks[3] : fmNearestTank(FW(-250, -224)); fmClimbers(v, 2); }
      if (k === 'w2') { fmHuntTo([-222, -251], 0); fmHuntTo([-250, -251], 1.5); for (let j = 0; j < 3; j++) fmRun([-214, -252], [[-240 + j * 6, -250]], 'rifle', 'j', 1 + j * 1.1); }
      if (k === 'w3') { fmHuntTo([-207, -251], 0); fmHuntTo([-238, -251], 1.0); fmHuntTo([-226, -252], 2.2); radio('תצפית', 'עוד ציידים יוצאים מהתעלה, מקדימה!', 2.4); }
      if (k === 'w4') { fmHuntTo([-232, -251], 0); fmHuntTo([-218, -251], 1.4); const v = fmNearestTank(FW(-222, -228)); if (v) DIRQ.push({ at: GAME.t + 6, fn: () => fmClimbers(v.alive ? v : fmNearestTank(FW(-250, -224)), 2) }); }
    }
    const pend = DIRQ.some((q) => q.hunt), live = UNITS.enemies.some((e) => e.alive && (e.hunter || e.climbV));
    if (((FM.msgs.w4 && FM.jt > 58 && !pend && !live) || FM.jt > 120) && !FM.msgs.jdone) { FM.msgs.jdone = true; FM.ph = 'ditchgo'; radio('מ״פ', 'הצומת מחזיקה! עכשיו לתעלה — ומזרחה בתוכה, עמדה אחרי עמדה. אחריי!', 3.8); DIRQ.push({ at: GAME.t + 2.5, fn: fm0Ditch }); }
  }
}
function fm0Ditch() {
  FM.ph = 'ditch';
  for (const e of UNITS.enemies) if (e.alive && e.sq === 'j') { const [lx, lz] = FL(e.pos.x, e.pos.z); e.sq = 'g' + gateSegOf(FM_G0, lx, lz); }
  // every bound's positions are manned now, hidden at the plot edges above the ditch; they wake as the advance reaches them
  for (let k = 0; k < FM_G0.length - 1; k++) { const [bx, bz] = FM_G0[k + 1]; fmMan((s) => Math.hypot(s.lx - bx, s.lz - bz) < 26 && (s.grp === 'ES' || s.grp === 'ET' || s.grp === 'NS'), 'g' + k, { wakeG: k, wakeR: 30 }, k < 1 ? 4 : 6); }
  gateStart(fmPts(FM_G0), fm0Gate, () => { feed('התעלה נקייה', 'good'); radio('מ״פ', 'נקי. עוצרים כאן — האש דועכת.', 3); DIRQ.push({ at: GAME.t + 3.5, fn: () => fmCut(() => fmSetup(S_PITS)) }); }, 'קטע', 6.5, 1.5);
  hint('fm-ditch', 'בתעלה מתקדמים <b>מזרחה, קטע אחרי קטע</b>. המצרים שוכבים בשולי החלקות מעליכם ורצים אליכם מקדימה. הנקודה הבאה מסומנת ב־◆ רק כשהקטע נקי.', 8);
}
function fm0Gate(k) {
  for (const [lx, lz] of FM_G0R[k] || []) for (let j = 0; j < 2; j++) { const [bx, bz] = FM_G0[k + 1]; fmRun([lx, lz], [[bx + rand(-2, 2), bz + rand(-0.8, 0.8)]], j === 1 && k % 2 ? 'smg' : 'rifle', 'g' + k, 1.5 + j * 1.3 + rand(0, 1), k); }
  if (k > 0) radio('מ״פ', pick(['עוד קטע! קסדות בשולי החלקה — לירות!', 'הם רצים אלינו בתעלה מקדימה! לחסל!', 'רימון לחלקה משמאל, ואז ממשיכים!']), 2.4);
}

/* ---------- stage 2: "is there a Jew here?" ---------- */
function fm1Setup(C, put) {
  for (const i of [0, 1, 3]) { const [lx, lz, hd] = FM_TPOS[i]; fmPose(C.tanks[i], lx, lz, hd); C.tanks[i].name = FM_TNAME[i]; }
  { const [lx, lz, hd] = FM_TPOS[2]; fmPose(C.tanks[2], lx, lz, hd); vehDestroy(C.tanks[2], true); }
  fmPose(C.ht, FM_HT1[0], FM_HT1[1], -Math.PI / 2); C.ht.name = 'הזחל״ם';
  put(-262, -242, [-1, 0.25]); fmLane(FM_LANES.pits, 25);
  fieldFriends([fmDef('חובש', FM_HT1[0] + 4.3, FM_HT1[1] - 1.1, [1, 0.3]), fmDef(FM_NAMES1[0], -282, -224, [0, -1]), fmDef(FM_NAMES1[1], -256, -229, [0.4, -1])]);
  // which craters hold ours is decided now, and kept by every save
  const roles = ['w', 'w', 'e', 'e'].sort(() => Math.random() - 0.5); let wi = 0; const wl = [];
  FM.pits = FM_PITS.map(([lx, lz], i) => { const p = { lx, lz, role: roles[i], st: 'wait', t: 0, w: -1 }; if (p.role === 'w') { p.w = 10 + wi; wl.push([FM_WNAMES[0][wi], lx + 0.4, lz + 0.3, false]); wi++; } return p; });
  fmWounded(wl); for (const p of FM.pits) if (p.w >= 0) FRIENDS[p.w].unit.rig.root.visible = true;   // a figure lies in every crater: ours or theirs, nobody knows yet
  // in a crater of theirs one man lies in sight like any wounded man of ours - one figure, nothing to tell them apart in the dark; his mate
  // lies flat below the rim and is only seen when they open fire. Neither shows on the map before the call
  FM.pits.forEach((p, i) => { if (p.role !== 'e') return;
    for (let k = 0; k < 2; k++) { const a = k * 2.6 + rand(-0.3, 0.3), [x, z] = FW(p.lx + Math.cos(a) * (k ? 1.4 : 0.4), p.lz + Math.sin(a) * (k ? 1.4 : 0.3)), e = spawnEnemy(x, z, k === 1 ? 'smg' : 'rifle', null, null); if (!e) continue;
      e.state = 'film'; e.sz = 'street'; e.sq = 'pit' + i; e.noTag = true; e.mmHide = true; e.pitHid = k === 1; e.stance = 'down'; e.fallDir = 1; e.pos.y = hAt(x, z, FY + 0.6); e.heading = rand(0, 6); e.rig.pose('prone', 0); e.sync(); fmPitLook(e); } });
}
function fm1Start(C) {
  FM.ph = 'search'; const c = fmV(-278, -230, 0);
  fmEstablish(S_PITS, 'צומת טרטור–לכסיקון · הגדה המזרחית · 15.10 · 22:40', [{ d: 5.6, cam: camLerp(c.clone().add(V3(40, 34, 50)), c.clone().add(V3(22, 14, 30)), c, c.clone().add(V3(0, -1, 0)), 50) }], [[0.4, 'האש בצומת דועכת. בבורות שמסביב שוכבים פצועים — שלנו, ולא רק שלנו.', 4.6]], () => {
    radio('חובש', 'בחושך אי אפשר לדעת מי שוכב שם. קוראים קודם, מתקרבים אחר כך.', 4.4);
    hint('fm-pits', 'ארבע נקודות צהובות סביב הצומת. כשמתקרבים, קוראים <b>"מי כאן יהודי?"</b> — מי שעונה בעברית הוא שלנו. מי שלא...', 8);
  });
  FM.pits.forEach((p, i) => { FMX.pitMk[i].mk.visible = true; });
}
// how a man in a crater looks before the call: in our colours (no enemy outline), the hidden one not drawn at all
function fmDisguise(e, on) { e.rig.root.traverse((m) => { if (!m.isMesh) return; if (Array.isArray(m.material)) { if (on && m.material[0] === MAT.uni.e) { m.material = [MAT.uni.f, m.material[1]]; m.userData.dz = 1; } else if (!on && m.userData.dz) { m.material = [MAT.uni.e, m.material[1]]; m.userData.dz = 0; } return; } if (on && m.material === MAT.clothE) { m.material = MAT.clothF; m.userData.dz = 1; } else if (!on && m.userData.dz) { m.material = MAT.clothE; m.userData.dz = 0; } }); }
function fmPitLook(e) { const before = e.alive && e.state === 'film' && /^pit/.test(e.sq || ''); fmDisguise(e, before); if (before) e.rig.root.visible = !e.pitHid; }
const fmPitShot = (i) => UNITS.enemies.some((e) => e.sq === 'pit' + i && !e.alive);
function fmPitReveal(i) {
  const p = FM.pits[i]; FMX.pitMk[i].mk.visible = false;
  if (p.role === 'w') { const f = FRIENDS[p.w]; f.state = 'stable'; f.marker.visible = true; p.st = 'found';
    radio(f.name, pick(['כאן! אני יהודי! אל תירו... הרגל שלי.', 'כן! יהודי! תוציאו אותי מפה, אני לא מרגיש את הרגל.', 'אני שלכם! צנחן... תסחבו אותי, אני לא יכול ללכת.']), 3.2);
    feed(`${f.name} — פצוע שלנו!`, 'good'); hint('fm-carry', `הרימו את הפצוע (${K('E')}) וסחבו אותו לחובש שמאחורי האמבולנס (◆) — שם ${K('E')} כדי למסור אותו.`, 7); snapRequest('wounded'); return; }
  p.st = 'fight'; const pp = P.pos;
  for (const e of UNITS.enemies) if (e.alive && e.sq === 'pit' + i) { e.mmHide = false; e.pitHid = false; fmDisguise(e, false); e.rig.root.visible = true; Object.assign(e, { state: 'sz', sz: 'street', path: [], pi: 0, cov: null, patience: 0, cyc: 1, peek: false, meleeCd: 0.8, wild: true, noTag: false, stance: 'stand', fallDir: 1, fireCd: rand(0.05, 0.35), burst: 0 }); e.face(pp.x, pp.z); e.rig.pose('aim', 0, 0); e.sync(); }
  feed('תשובה בערבית — ואש! מצרים בבור!', 'bad'); FX.shake = Math.max(FX.shake, 0.45); sndShot('ak', pp);
  hint('fm-pit', 'לא כל מי ששוכב בבור הוא שלנו. מצרים בטווח מטרים — ירו מהר.', 6);
}
function fm1Upd(dt, C) {
  FM.pits.forEach((p, i) => {
    if (p.st === 'wait') { const near = fmNear(p.lx, p.lz, 5.4); if (near || (p.role === 'e' && fmPitShot(i))) { p.st = 'call'; p.t = 0; if (near) { radio('אתם', 'מי כאן יהודי?!', 1.8); sndClick(500, 0.2); } } }
    else if (p.st === 'call') { p.t += dt; if (p.t > (p.role === 'w' ? 1.0 : 0.8)) fmPitReveal(i); }
    else if (p.st === 'fight' && !UNITS.enemies.some((e) => e.alive && e.sq === 'pit' + i)) { p.st = 'clear'; feed('הבור נקי', 'good'); snapRequest('pit'); }
  });
  for (const m of FMX.pitMk) if (m.mk.visible) { const d = Math.round(Math.hypot(camera.position.x - m.x, camera.position.z - m.z)), h = `<i>?</i>מי כאן יהודי?<small>${d} מ׳</small>`; if (m.el.innerHTML !== h) m.el.innerHTML = h; }
  if (FM.saved >= 2 && !FM.msgs.done) { FM.msgs.done = true; radio('חובש', 'שניהם אצלי. נוסעים — תודה שלא השארת אותם שם.', 3.4); DIRQ.push({ at: GAME.t + 4.5, fn: () => fmCut(() => fmSetup(S_AQ)) }); }
}

/* ---------- stage 3: "Aquarium", 16 October, 01:25 - the boats ----------
   While the junction burns, the paratroopers of 247 reach the Yard with rubber boats on their half-tracks. "Aquarium" on the radio: the boats are
   in the water. Across, in silence, under a moon nearly full. "Acapulco": the first men are on the west bank. Nobody fired at them. */
const FM_SEATS = [[[1.75, 0], [0.35, 0.45], [0.35, -0.45], [-1.0, 0]], [[1.15, 0.42], [1.15, -0.42], [-0.35, 0.42], [-0.35, -0.42]], [[1.15, 0.42], [1.15, -0.42], [-0.35, 0.42], [-0.35, -0.42]]];   // the player alone in the bow of the first boat
function fmAqPose() {
  const C = CHAP.farm, A = FM.aq; if (!A) return;
  C.rboats.forEach((b, i) => { const s = clamp(A.s - i * 5, 0, FM_AQ0 - FM_AQ1), [x, z] = FW(FM_AQ0 - s - i * 1.5, FM_YARD.bz + (i - 1) * 7); b.position.set(x, 0.12 + Math.sin(GAME.t * 1.7 + i) * 0.04, z); b.rotation.set(Math.sin(GAME.t * 1.3 + i) * 0.03, Math.PI + Math.sin(GAME.t * 0.6 + i * 2) * 0.04, Math.sin(GAME.t * 1.1 + i) * 0.04); b.updateMatrixWorld(true); });
}
const fmSeat = (bi, k) => () => { const b = CHAP.farm.rboats[bi], [sx, sz] = FM_SEATS[bi][k]; return { p: b.localToWorld(V3(sx, 0.05, sz)), hd: b.rotation.y - Math.PI / 2, pose: 'crouch' }; };
function fmAqSetup(C, put) {
  put(-350, FM_YARD.bz - 7, [-1, 0]);
  FM.aq = { s: 0, go: false, stopT: 0, flare: false, landed: false, truck: '', truckT: 0, done: false };
  // eleven paratroopers in three boats; the player in the bow of the first, on the north side
  const seats = [fmSeat(0, 1), fmSeat(0, 2), fmSeat(0, 3), fmSeat(1, 0), fmSeat(1, 1), fmSeat(1, 2), fmSeat(1, 3), fmSeat(2, 0), fmSeat(2, 1), fmSeat(2, 2), fmSeat(2, 3)];
  fieldFriends(FM_NAMES3.map((name, i) => ({ name, state: 'ride', ride: seats[i], fi: i, x: P.pos.x, z: P.pos.z })));
  fmAqPose(); P.ride = { pos: () => CHAP.farm.rboats[0].localToWorld(V3(1.75, 0.05, 0)), eye: 1.32, novm: true };   /* a silent crossing: rifle down, eyes on the far bank */ P.pos.copy(P.ride.pos()); P.crouch = true; P.yaw = Math.PI / 2; P.pitch = -0.02;
  // an Egyptian truck on the road by the sweet-water canal: it will pass, if nobody gives them away
  const v = C.etruck; const [x, z] = FW(-562, -196); vehRevive(v, 100); v.hdV = 0; vehPose(v, x, z, 0); v.g.visible = false; v.shown = false;
}
function fmAqStart(C) {
  FM.ph = 'boats'; const jc = fmV(-270, -230, 0), boat = () => C.rboats[0].position.clone();
  fmEstablish(S_AQ, 'החצר במעוז מצמד · שפת התעלה · 16.10 · 01:25', [
    { d: 5.0, cam: camLerp(jc.clone().add(V3(10, 42, 40)), fmV(-300, -120, 30), jc, fmV(-360, -70, 0, 0.5), 52) },
    { d: 4.6, cam: (u) => ({ p: boat().add(V3(-6 + u * 2, 2.4, -7)), l: boat().add(V3(4, 0.8, 4)), fov: 46 }) },
  ], [[0.3, 'הצומת בוערת. בינתיים מגיעים צנחני חטיבה 247 לחצר — עם סירות גומי על הזחל״מים.', 4.8], [5.2, '<b>01:25.</b> בקשר: "אקווריום" — הסירות במים.', 4.2]], () => {
    FM.aq.go = true; radio('מפקד הסירה', 'חותרים. בשקט מוחלט — אף אחד לא יורה.', 3.4);
    hint('fm-aq', 'אתם בסירה הראשונה. הסתכלו סביב: מאחור, מצפון־מזרח, הצומת בוערת. <b>לא לירות</b> — ההפתעה היא כל מה שיש לנו.', 8);
  });
}
function fmAqUpd(dt, C) {
  const A = FM.aq; if (!A) return;
  // the battle at the junction, two kilometres behind: flashes, the thunder a few seconds late, tracers, an illumination round now and then
  FM.amb -= dt; if (FM.amb <= 0) { FM.amb = rand(0.45, 1.3); const [x, z] = FW(rand(-300, -150), rand(-330, -210)), p = V3(x, groundAt(x, z), z); fxExplosion(p, rand(0.9, 1.7)); DIRQ.push({ at: GAME.t + rand(1.5, 2.5), fn: () => sndBoom(p, 0.6) });
    if (Math.random() < 0.4) { const [ax, az] = FW(rand(-280, -200), rand(-260, -240)), [bx, bz] = FW(rand(-300, -220), rand(-230, -190)); fxTracer(V3(ax, FY + 2, az), V3(bx, FY + 1, bz), Math.random() < 0.5); } }
  if (!CINE.on) { FM.illumT -= dt; if (FM.illumT <= 0) { FM.illumT = rand(10, 16); const [x, z] = FW(rand(-280, -180), rand(-300, -220)); spawnFlare(x, z, rand(140, 170), 26, 24, 0.35); } }
  if (A.go && !A.landed) {
    // a flare over the water, half way: everyone freezes until it burns down
    if (A.s > 52 && !A.flare) { A.flare = true; A.stopT = 6.5; const [x, z] = FW(-430, FM_YARD.bz - 150); spawnFlare(x, z, 110, 16, 30, 0.6); radio('מפקד הסירה', 'זיקוק! לא לזוז... ראש למטה.', 3); }
    if (A.stopT > 0) { A.stopT -= dt; if (A.stopT <= 0) radio('מפקד הסירה', 'ממשיכים. לאט, בלי להתיז.', 2.4); }
    else A.s = Math.min(FM_AQ0 - FM_AQ1, A.s + 3.6 * dt);
    if (A.s >= FM_AQ0 - FM_AQ1 - 0.01) fmAqLand();
  }
  if (A.landed && !A.done) {
    const v = C.etruck; A.truckT += dt;
    if (A.truckT > 7 && !A.truck) { A.truck = 'coming'; const pts = [[-562, -196], [-562, -120], [-561, -40], [-560, 24]]; fmDrive(v, pts, 9, () => { if (A.truck === 'coming') { A.truck = 'passed'; feed('המשאית עברה — ההפתעה נשמרה', 'good'); radio('מפקד הכוח', 'עבר. אף אחד לא ראה אותנו.', 2.8); DIRQ.push({ at: GAME.t + 0.05, fn: () => fmHide(v) }); } }); v.stop = undefined; radio('תצפית', 'רכב מצרי בכביש ממערב, ליד תעלת המים המתוקים. לא לירות — תנו לו לעבור.', 4); }
    // shot at, it stops: the men in the back jump off and come at the landing
    if (A.truck === 'coming' && v.alive && v.hp < 100) { A.truck = 'fight'; v.path = null; v.speed = 0; const p = v.g.position; for (let k = 0; k < 5; k++) { const e = fSpawnStreet(p.x + rand(-2, 2), p.z + rand(-2, 2), [[p.x + 12 + rand(0, 6), p.z + rand(-8, 8)]], k === 2 ? 'smg' : 'rifle'); if (e) e.sq = 'tr'; } radio('מפקד הכוח', 'גילו אותנו! אש!', 2.2); }
    if (A.truck === 'coming' && !v.alive) { A.truck = 'fight'; }
    if (A.truck === 'fight' && !UNITS.enemies.some((e) => e.alive && e.sq === 'tr')) A.truck = 'done';
    const atLine = fmNear(FM_AQP[0], FM_AQP[1], 7);
    if ((A.truck === 'passed' || A.truck === 'done') && atLine) { A.done = true; radio('קשר', 'ראש גשר בגדה המערבית. עכשיו צריך דרך אליו — והדרך עוברת ליד החווה.', 4.4); feed('ראש הגשר מוחזק', 'good'); DIRQ.push({ at: GAME.t + 5, fn: () => fmCut(() => fmSetup(S_T42)) }); }
  }
}
function fmAqLand() {
  const A = FM.aq, C = CHAP.farm; A.landed = true; P.ride = null; vm.visible = true; P.crouch = false; fmLane(FM_LANES.land, 25); const [x, z] = FW(FM_AQ1 - 6, FM_YARD.bz - 7); P.pos.set(x, groundAt(x, z), z); resetTrail();
  FRIENDS.slice(0, 11).forEach((f, i) => { const u = f.unit, [fx, fz] = FW(FM_AQ1 - 7 - (i % 4) * 1.6, FM_YARD.bz - 10 + Math.floor(i / 4) * 6 + (i % 2) * 1.2); u.place(fx, fz); f.state = 'follow'; f.fi = i; f.ti = 0; f.stuck = 0; f.post = { id: 'F' + i, fx: -1, fz: 0, mag: null, occupant: f, stand: [fx, fz] }; u.stance = 'stand'; u.sync(); });
  radio('קשר', '"אקפולקו". הכוח הראשון על הגדה המערבית. אין אש.', 3.6); feed('אקפולקו — על אדמת מצרים', 'good'); snapRequest('landed');
  hint('fm-aq2', 'עלו מהמים אל הקו (◆) ותפסו עמדות. ״ההפתעה היתה מושלמת. לא נתקלנו בהתנגדות.״', 7);
}

/* ---------- stage 4: Tirtur 42, the night of 16-17 October ---------- */
function fm3Setup(C, put) {
  put(352, -233, [-1, 0]); fmLane(FM_LANES.t42, 22);
  fieldFriends(fmSquad(FM_NAMES2, [352, -233], [1, 0]));
  const kind = (n) => (n % 6 === 2 ? 'lmg' : n % 5 === 4 ? 'smg' : 'rifle');
  // one front, north of the road: the edge of the farm and the plots behind it, full of men who will not fire until the battalion is on top of them
  fmMan((s) => s.grp === 'ES' && s.lx > 106 && s.lx < 262, 'f2', { wakeR: 9 }, 9, kind);
  fmMan((s) => s.grp === 'PS' && s.pl.j === 0 && s.lx > 106, 'f2', { wakeR: 9 }, 6, kind);
  fmMan((s) => s.grp === 'PS' && s.pl.j === 1 && s.lx > 120, 'f2', { wakeR: 9 }, 4, kind);
  fmMan((s) => s.grp === 'ET' && s.lx > 106, 'f2', { wakeR: 20 }, 6, kind);
}
function fm3Start(C) {
  FM.ph = 'walk'; const road = fmV(300, -233, 0), east = fmV(560, -238, 0);
  fmEstablish(S_T42, 'ציר טרטור · הגדה המזרחית · 17.10 · 00:25', [
    { d: 4.6, cam: camLerp(east.clone().add(V3(20, 40, 60)), road.clone().add(V3(40, 18, 40)), road, road.clone().add(V3(-80, 0, 0)), 52) },
    { d: 3.6, cam: (u) => ({ p: P.pos.clone().add(V3(4 - u, 1.7, 2.2)), l: road.clone().add(V3(-120, 1.2, 0)), fov: 46 }) },
  ], [[0.3, 'ראש הגשר בגדה המערבית קיים — אבל אין אליו דרך. עכביש וטרטור חסומים ליד החווה, והגשרים לא יכולים להגיע.', 4.6], [4.8, 'גדוד הצנחנים 890 הולך מערבה בציר טרטור, לפתוח אותו. ״ירח, מדבר לבן, כולם הולכים בפריסה מרווחת ושקטה.״', 3.6]],
    () => { radio('מג״ד', 'שקט מוחלט. טור עורפי, מרווחים. ממשיכים מערבה בציר — ואף אחד לא יורה עד שאומרים.', 4.6); hint('fm-quiet', 'הולכים בשקט מערבה. אל תירו ראשונים.', 5); });
}
function fm3Contact() {
  FM.ph = 'contact'; FM.kt = 0; FM.artT = 22;
  for (const e of UNITS.enemies) if (e.alive && e.sq === 'f2') { e.dormant = false; e.cyc = rand(0.1, 0.9); e.peek = false; }
  { const [x, z] = FW(210, -300); spawnFlare(x, z, 170, 30, 26, 0.5); } { const [x, z] = FW(130, -280); spawnFlare(x, z, 160, 28, 24, 0.45); }
  radio('מג״ד', 'אש! אש מכל החזית! לתעלה מימין — קופצים פנימה!', 4); feed('״אש חזקה מחזית רחבה למדי״ — טרטור 42', 'bad'); FX.shake = Math.max(FX.shake, 0.5);
  hint('fm-ditch2', `לתעלה (◆) שמצפון לכביש — שם יש מחסה. משם מתקדמים בתוכה מערבה, קטע אחרי קטע. רימון עשן (${K('T')}) מסתיר אתכם בדרך.`, 8);
}
function fm3Gates() {
  FM.ph = 'gates';
  for (const e of UNITS.enemies) if (e.alive && e.sq === 'f2') { const [lx, lz] = FL(e.pos.x, e.pos.z); e.sq = 'g' + gateSegOf(FM_G2, lx, lz); }
  for (let k = 1; k < FM_G2.length - 1; k++) { const [bx, bz] = FM_G2[k + 1]; fmMan((s) => Math.hypot(s.lx - bx, s.lz - bz) < 24 && (s.grp === 'ES' || s.grp === 'ET' || s.grp === 'NS'), 'g' + k, { wakeG: k, wakeR: 24 }, 3); }
  gateStart(fmPts(FM_G2), (k) => { for (const [lx, lz] of FM_G2R[k] || []) for (let j = 0; j < 2; j++) { const [bx, bz] = FM_G2[k + 1]; fmRun([lx, lz], [[bx + rand(-2, 2), bz + rand(-0.8, 0.8)]], j ? 'smg' : 'rifle', 'g' + k, 1.4 + j * 1.2 + rand(0, 1), k); } if (k > 0) radio('מ״פ', pick(['עוד קטע! קסדות בשולי החלקה!', 'מקלע בפינה — רימון!', 'הם באים בתעלה מקדימה! אש!']), 2.4); }, fm3Hold, 'קטע', 6.5, 1.5);
  radio('מ״פ', 'בתעלה! עכשיו מערבה, קטע אחרי קטע. אחריי!', 3.2);
}
function fm3Hold() {
  FM.ph = 'hold'; FM.holdT = 45; FM.waveT = 4; fmLane(FM_LANES.hold, 1.5); feed('מחזיקים בתעלה', 'good'); snapRequest('hold');
  radio('מג״ד', 'מחזיקים כאן עד אור ראשון. פצועים — למרכז. אף אחד לא נשאר לבד!', 4.2);
}
function fm3Upd(dt, C) {
  if (FM.ph === 'walk') { const [lx] = fmLP(); if (lx < 238 || FM.t > 55 || (STATS.shots || 0) > FM.shot0 || UNITS.enemies.some((e) => e.sq === 'f2' && !e.alive)) fm3Contact(); return; }
  // the barrage that came with the ambush: shells along the road, never on top of the player
  if (FM.artT > 0) { FM.artT -= dt; FM.shellT = (FM.shellT || 0) - dt; if (FM.shellT <= 0) { FM.shellT = rand(0.7, 1.5); for (let k = 0; k < 6; k++) { const lx = rand(90, 270), lz = rand(-242, -200), [x, z] = FW(lx, lz); if (Math.hypot(x - P.pos.x, z - P.pos.z) < 14) continue; const p = V3(x, groundAt(x, z), z); fxExplosion(p, 1.2); sndBoom(p, 0.9); break; } } }
  if (FM.ph === 'contact') { FM.kt += dt; const [x, z] = FW(FM_DITCH2[0], FM_DITCH2[1]); if ((Math.hypot(P.pos.x - x, P.pos.z - z) < 8 && P.pos.y < FY - 0.9) || FM.kt > 40) { snapRequest('ditch'); fm3Gates(); } }
  if (FM.ph === 'hold') {
    FM.holdT -= dt; FM.waveT -= dt;
    if (FM.waveT <= 0 && FM.holdT > 6) { FM.waveT = 11; const src = pick([[[40, -252], [86, -252]], [[90, -300], [90, -257]], [[30, -252], [80, -252]]]); for (let j = 0; j < 3; j++) fmRun(src[0], [[src[1][0] + rand(-1, 1), src[1][1] + rand(-0.8, 0.8)]], j === 2 ? 'lmg' : 'rifle', 'hw', 0.6 + j * 1.2); radio('צנחן', pick(['הם באים בתעלה ממערב!', 'תנועה בתעלה מצפון!', 'עוד גל — ממערב!']), 2.2); }
    if (FM.holdT <= 0 && !FM.msgs.dawn) { FM.msgs.dawn = true; radio('קשר', 'אור ראשון. טנקים ונגמ״שים בדרך אליכם — תחזיקו את הפצועים!', 3.6); DIRQ.push({ at: GAME.t + 3.5, fn: () => fmCut(() => fmSetup(S_SMOKE)) }); }
  }
}
/* ---------- stage 5: grey smoke, dawn of 17 October ---------- */
const RING_GEO = new THREE.RingGeometry(3.3, 4.1, 48).rotateX(-Math.PI / 2), DISC_GEO = new THREE.CircleGeometry(4.0, 40).rotateX(-Math.PI / 2);
const fmRingMat = (col = 0xffd23a, op = 0.85) => new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: op, depthWrite: false, side: THREE.DoubleSide, fog: false, toneMapped: false });
function fmRingsClear() { for (const r of FMX.sagRings) { scene.remove(r.m); if (r.d) scene.remove(r.d); } FMX.sagRings.length = 0; }
function fm4Setup(C, put) {
  put(140, -240, [0, -1]); fmLane(FM_LANES.smoke, 25);
  fieldFriends([fmDef(FM_NAMES2[0], 122, -240), fmDef(FM_NAMES2[1], 152, -241), fmDef(FM_NAMES2[2], 168, -240), fmDef(FM_NAMES2[3], 106, -239)]);
  fmWounded(FM_WNAMES[1].map((n, i) => [n, FM_COLL[i][0], FM_COLL[i][1], true]));
  // the rescue comes along Tirtur from the east: two carriers to the wounded, three tanks to cover them
  C.apc.forEach((v, i) => { fmDrive(v, [[[200, 226][i], -233], [[126, 156][i], -233]], 6.5, (vv) => { vv.arrived = true; if (!FM.msgs.arr) { FM.msgs.arr = true; radio('נהג הנגמ״ש', 'אנחנו פה! דלת אחורית פתוחה — תביאו אותם!', 3); } });
    v.onHit = () => { radio('נהג הנגמ״ש', pick(['חטפנו סאגר! אנחנו עוד זזים!', 'פגיעה! הדלת תקועה — אבל אנחנו פה!']), 2.6); };
    v.onDead = (vv) => { feed(`${vv.name} נפגע ועולה באש!`, 'bad'); radio('קשר', `${vv.name} נפגע! הנגמ״ש השני — אתם האחרונים!`, 3); }; });
  C.btank.forEach((v, i) => { fmDrive(v, [[256 + i * 26, -230], [[180, 206, 232][i], -229]], 5); v.name = ['טנק 1', 'טנק 2', 'טנק 3'][i]; });
  // one front, north: the Sagger crews far up in the farm on the edges of the plots, a fresh one in place of every crew that falls; riflemen nearer
  for (const [lx, lz] of FM_SAG.slice(0, 4)) fmSagMan(lx, lz);
  fmMan((s) => s.grp === 'PS' && s.pl.j === 1 && s.lx > 60 && s.lx < 200, 'inf', { wakeR: 70 }, 6);
}
function fmSagMan(lx, lz) {
  const C = CHAP.farm; let best = null, bd = 1e9; for (const s of C.slots) if (!s.used && s.grp === 'PS' && s.pl.j >= 3) { const d = Math.hypot(s.lx - lx, s.lz - lz); if (d < bd) { bd = d; best = s; } }
  const e = best ? fSlotPlace(best, 'rifle', 'sag', { dormant: false }) : null; if (e) { e.fmSag = true; e.rpgCd = 1e9; } return e;
}
function fm4Start(C) {
  FM.ph = 'rescue'; const at = fmV(150, -244, 0), farm = fmV(120, -420, 0, FY);
  fmEstablish(S_SMOKE, 'ציר טרטור, מול החווה · 17.10 · 05:38', [
    { d: 4.4, cam: camLerp(farm.clone().add(V3(-30, 26, 150)), farm.clone().add(V3(-20, 16, 110)), farm, at, 50) },
    { d: 4.4, cam: (u) => { const a = C.apc[1].g.position; return { p: at.clone().add(V3(-14 - u * 4, 3.4, -10)), l: a.clone().add(V3(0, 1.4, 0)), fov: 44 }; } }],
    [[0.3, 'הצנחנים מחזיקים בתעלה עד הבוקר, עם הפצועים. נגמ״שים וטנקים יוצאים לחלץ אותם בציר טרטור.', 4.0], [4.5, '״כל האזור היה מלא בעשן אפור. כל 45 שניות בערך, מקבץ של סאגרים שוגרו לעבר הטנקים.״ · מפקד גדוד 100', 4.4]],
    () => { radio('מ״פ', 'הנגמ״שים פה! ארבעה פצועים בתעלה — כל אחד לנגמ״ש. ועיניים לחווה, צפונה: הם יורים סאגרים!', 4.6); });
}
// a salvo: one missile (later two) from a crew that can see its target, at a carrier mostly
function fmSagger() {
  const C = CHAP.farm, ops = UNITS.enemies.filter((e) => e.alive && e.fmSag && !e.guide).sort(() => Math.random() - 0.5);
  const apcs = C.apc.filter((v) => v.alive && v.g.visible), tks = C.btank.filter((v) => v.alive && v.g.visible);
  const v = apcs.length && (Math.random() < 0.72 || !tks.length) ? pick(apcs) : tks.length ? pick(tks) : null; if (!v || !ops.length) return;
  const tp = () => v.g.position.clone().add(V3(0, 1.5, 0)); let op = null;
  for (const e of ops) { const mz = e.muzzle(), t = tp(); if (losW(mz.x, mz.y + 0.4, mz.z, t.x, t.y, t.z)) { op = e; break; } } if (!op) return;
  op.face(tp().x, tp().z); op.peek = true; const q = fireAtgm(op, tp); q.vt = true; q.fmV = v;
  q.onLost = () => { FM.blind++; feed('הסאגר איבד את המטרה! הטיל יורד לחול', 'good'); radio('מ״פ', pick(['הוא עיוור! הטיל נפל!', 'העשן עבד — הטיל הולך לאיבוד!', 'יופי! עוד אחד לחול!']), 2.2); fmSagRingOff(q, true); };
  const t = v.g.position, o = op.pos, dx = o.x - t.x, dz = o.z - t.z, d = Math.hypot(dx, dz) || 1, x = t.x + dx / d * 7, z = t.z + dz / d * 7, y = hAt(x, z, FY + 0.6) + 0.14;
  const m = new THREE.Mesh(RING_GEO, fmRingMat()), dm = new THREE.Mesh(DISC_GEO, fmRingMat(0xffd23a, 0.16)); m.position.set(x, y, z); dm.position.set(x, y - 0.02, z); m.renderOrder = dm.renderOrder = 4; scene.add(onLayer1(m), onLayer1(dm)); FMX.sagRings.push({ q, m, d: dm, x, y, z, t: 0 });
  radio('תצפית', `סאגר! ${clockOf(op.pos)}! אל ${v.name}!`, 2.2); FM.sagN = (FM.sagN || 0) + 1;
  if (!FM.msgs.sag1) { FM.msgs.sag1 = true; slowMo(1.6, 0.35); hint('fm-smoke', `<b>סאגר!</b> הלהבה הצהובה באוויר היא הטיל, והמפעיל מהבהב בצהוב בחווה. זרקו רימון עשן (${K('T')}) לתוך <b>העיגול הצהוב</b> שליד ${v.name} — המפעיל לא יראה את המטרה, והטיל יאבד אותה.`, 10); }
}
function fmSagRingOff(q, good) { const i = FMX.sagRings.findIndex((r) => r.q === q); if (i < 0) return; const r = FMX.sagRings[i]; scene.remove(r.m); scene.remove(r.d); FMX.sagRings.splice(i, 1); if (good) fxDust(V3(r.x, r.y + 0.4, r.z)); }
function fmRingsUpd() {
  for (const r of [...FMX.sagRings]) { if (!PROJ.includes(r.q)) { fmSagRingOff(r.q, false); continue; } if (r.q.fmV && r.q.op) { const t = r.q.fmV.g.position, o = r.q.op.pos, dx = o.x - t.x, dz = o.z - t.z, d = Math.hypot(dx, dz) || 1; r.x = t.x + dx / d * 7; r.z = t.z + dz / d * 7; r.y = hAt(r.x, r.z, FY + 0.6) + 0.14; r.m.position.set(r.x, r.y, r.z); r.d.position.set(r.x, r.y - 0.02, r.z); } const k = 1 + 0.08 * Math.sin(GAME.t * 9); r.m.scale.set(k, 1, k); r.m.material.opacity = 0.6 + 0.3 * Math.abs(Math.sin(GAME.t * 6)); }
}
function fm4Upd(dt, C) {
  if (!C.apc.some((v) => v.alive)) { endGame(false, 'apc'); return; }
  if (FM.ph === 'rescue') {
    if (C.apc.some((v) => v.arrived)) FM.salvoT -= dt; if (FM.salvoT <= 0) { FM.salvoN++; const n = FM.salvoN >= 3 && Math.random() < 0.45 ? 2 : 1; for (let k = 0; k < n; k++) DIRQ.push({ at: GAME.t + k * 2.8, fn: fmSagger }); FM.salvoT = rand(13, 17); }
    // a crew that falls is replaced from further back after a while
    const ops = UNITS.enemies.filter((e) => e.alive && e.fmSag).length; if (ops < 3 && !DIRQ.some((q) => q.sag)) DIRQ.push({ at: GAME.t + 7, sag: true, fn: () => { const [lx, lz] = pick(FM_SAG); fmSagMan(lx + rand(-20, 20), lz); } });
    // riflemen come down the north-south ditches from the farm toward the wounded: always from the north, the one front
    FM.infT -= dt; if (FM.infT <= 0) { FM.infT = rand(22, 28); const src = pick([[[90, -304], [92, -262]], [[160, -304], [160, -262]]]); for (let j = 0; j < 3; j++) fmRun(src[0], [[src[1][0] + rand(-2, 2), src[1][1] + rand(-1, 1)]], j === 1 ? 'smg' : 'rifle', 'inf', 0.5 + j * 1.2); radio('צנחן', pick(['חי״ר מצרי בתעלה, מצפון! הם באים לפצועים!', 'תנועה בתעלה מהחווה!']), 2.4); }
    if (FM.loaded >= 4 && !FM.msgs.go) { FM.msgs.go = true; FM.ph = 'go'; FM.drive = true; radio('נהג הנגמ״ש', 'כולם בפנים! סוגרים דלת — נוסעים!', 3);
      C.apc.forEach((v, i) => { if (!v.alive) return; const [lx] = FL(v.g.position.x, v.g.position.z); DIRQ.push({ at: GAME.t + 1 + i * 1.2, fn: () => fmDrive(v, [[lx, -233], [720, -233]], 7) }); });
      DIRQ.push({ at: GAME.t + 7, fn: () => fmCut(() => fmSetup(S_YARD)) }); }
  }
}
/* ---------- stage 6: the Yard, 17 October, from 09:00 ---------- */
function fm5Setup(C, put) {
  put(-322, -62, [-1, 0]); fmLane(FM_LANES.yard, 25);
  FM.engAt = [[-341, -64], [-341, -76], [-347, -61], [-347, -79], [-335, -67], [-335, -73]];
  const grd = [[-312, -118, [0, -1]], [-324, -121, [0, -1]], [-306, -22, [0, 1]], [-320, -19, [0, 1]]];
  fieldFriends([...FM.engAt.map(([lx, lz], i) => fmDef(FM_ENG[i], lx, lz, [-1, 0])), ...grd.map(([lx, lz, f], i) => fmDef(FM_NAMES1[i + 2], lx, lz, f))]);
}
/* first the night before: the pontoons on Akavish, "unhindered", while the Egyptians fight the paratroopers at Tirtur; then the Yard at nine */
function fm5Start(C) {
  FM.ph = 'yard'; const yard = fmV(-326, -70, 0, FY), tip = fmV(FM_BR.x0 - 3 * FM_SEGL, FM_YARD.bz, 0, 0.6);
  const conv = [...C.conv, C.btank[0]];
  conv.forEach((v, i) => { const x0 = 70 + i * 17; fmDrive(v, [[x0, fmAkZ(x0) + 0.5], [x0 - 90, fmAkZ(x0 - 90) + 0.5]], 6); });
  const lead = () => C.conv[1].g.position.clone().add(V3(0, 1.8, 0)), far = fmV(160, -260, 6, FY);
  const flash = (lx, lz) => () => { const [x, z] = FW(lx, lz), p = V3(x, groundAt(x, z), z); fxExplosion(p, 2.2); };
  fmEstablish(S_YARD, 'ציר עכביש ← החצר · 17.10', [
    { d: 5.4, tod: 51 * 60 + 10, cam: (u) => { const l = lead(); return { p: l.clone().add(V3(10 - u * 8, 2.6, 13)), l: l.clone().lerp(far, 0.18 + u * 0.1), fov: 48 }; } },
    { d: 5.6, tod: FM_TOD[S_YARD], cam: camLerp(yard.clone().add(V3(40, 16, -30)), yard.clone().add(V3(26, 11, -22)), tip, tip.clone().add(V3(-30, 0, 0)), 50) }],
    [[0.3, 'באותו לילה, בזמן שהמצרים נלחמים בצנחנים בטרטור, עוברות הדוברות בציר עכביש אל החצר — ״ללא הפרעה״.', 5.0], [5.6, '<b>09:00.</b> בחצר מתחילים לבנות את גשר הדוברות — תחת אש ארטילרית כבדה.', 5.0]],
    () => { for (const v of conv) fmHide(v); fmBarStart(12); meter('גשר הדוברות', FM.br / FM_BR.n); radio('מפקד הגשר', 'כל דוברה שנכנסת למים — עוד צעד לאפריקה. בין המטחים משחררים, בזמן מטח — בבונקרים!', 4.6); hint('fm-yard', `<b>המטחים באים בגלים.</b> כשהקשר צועק "ארטילריה!" — לבונקר הקרוב (פתוח לכיוון התעלה). בשקט שבין המטחים: למנוף (◆) ו־${K('E')} — דוברה למים.`, 10); });
  // the farm burning on the horizon behind the convoy
  for (const [t, lx, lz] of [[0.8, 180, -262], [2.1, 120, -300], [3.3, 210, -250], [4.4, 90, -258]]) CINE.ev.push([t, flash(lx, lz)]); CINE.ev.sort((a, b) => a[0] - b[0]);
}
function fmEngShelter(on) {
  if (FM.stage !== S_YARD || !FM.engAt) return; const C = CHAP.farm;
  FRIENDS.slice(0, 6).forEach((f, i) => { if (f.state !== 'post' && f.state !== 'toPost') return; const s = C.shelters[i % 3], [lx, lz] = on ? [s.lx + (i < 3 ? -0.9 : 0.6), s.lz + (i < 3 ? -0.5 : 0.5)] : FM.engAt[i]; const [x, z] = FW(lx, lz); f.state = 'toPost'; f.goal = [x, z]; f.goalY = FY + 0.6; f.delay = i * 0.15; });
}
// the engineers bring a pontoon of their own after a barrage, three times in all
function fmEngAdd() { if (FM.stage !== S_YARD || FM.eng >= 3 || FM.br >= FM_BR.n || FM.br >= 11) return; FM.eng++; DIRQ.push({ at: GAME.t + 3, fn: () => fmAttach('המהנדסים חיברו עוד דוברה') }); }
function fmAttach(msg) {
  if (FM.br >= FM_BR.n) return; FM.br++; fmBridgeSet(FM.br, false); const m = CHAP.farm.pont[FM.br - 1]; fmSplash(m.position.clone().add(V3(0, 0.2, 2.8)), 0.9);
  feed(`${msg} · ${FM.br}/${FM_BR.n}`, 'good'); meter('גשר הדוברות', FM.br / FM_BR.n); snapRequest('pontoon');
  if (FM.br >= FM_BR.n && !FM.msgs.bridge) { FM.msgs.bridge = true; FM.bar.on = false; radio('מפקד הגשר', 'הגשר נוגע בגדה השנייה! יש גשר לאפריקה!', 4); DIRQ.push({ at: GAME.t + 3.5, fn: fmEndFilm }); }
}
function fmLaunch() { if (FM.slip.st !== 'ready' || FM.bar.phase !== 'calm') return; FM.slip = { st: 'slide', t: 0 }; sndClick(400, 0.3); radio(pick(FM_ENG), pick(['משחררים! דוברה למים!', 'הכבל משוחרר — היא יורדת!']), 2); }
function fm5Anim(dt) {
  const C = CHAP.farm, S = FM.slip, m = C.slip, [x0, z0] = FW(-344, FM_YARD.bz + FM_SLIPZ), [xw] = FW(-366, 0);
  if (S.st === 'slide') { S.t += dt; const u = smooth(0, 2.4, S.t); m.position.set(lerp(x0, xw, u), lerp(FY + 0.6, 0.25, u), z0); m.rotation.set(0, 0, 0.2 * Math.sin(u * Math.PI)); if (S.t >= 2.4) { fmSplash(m.position.clone(), 1.0); rippleAdd(m.position.x, m.position.z, 1.2); S.st = 'float'; S.t = 0; } }
  else if (S.st === 'float') { S.t += dt; const [tx, tz] = FW(FM_BR.x0 - (FM.br + 0.5) * FM_SEGL, FM_YARD.bz), L1 = Math.abs(tx - xw), L2 = Math.abs(tz - z0), T = (L1 + L2) / 9, u = clamp(S.t / T, 0, 1), s = u * (L1 + L2);
    m.position.set(s < L1 ? lerp(xw, tx, s / L1) : tx, 0.22 + Math.sin(S.t * 2.2) * 0.05, s < L1 ? z0 : lerp(z0, tz, (s - L1) / L2)); m.rotation.set(Math.sin(S.t * 1.7) * 0.03, 0, Math.sin(S.t * 1.3) * 0.03);
    if (u >= 1) { S.st = 'reset'; S.t = 0; m.visible = false; fmAttach('הדוברה מחוברת'); } }
  else if (S.st === 'reset') { S.t += dt; if (S.t > 1.6) { m.position.set(x0, FY + 0.6, z0); m.rotation.set(0, 0, 0); m.visible = FM.br < FM_BR.n; FM.slip = { st: 'ready', t: 0 }; } }
  const H = FM.hitAnim; if (H && H.on) { H.t += dt; const pm = C.pont[H.k]; pm.rotation.set(Math.min(0.3, H.t * 0.25), 0, Math.min(0.6, H.t * 0.45)); pm.position.y = 0.2 - Math.min(2.8, H.t * H.t * 0.6); }
}
// the hit of the story: a shell on the far pontoon, seen from the water, in slow motion
function fmPontoonHit() {
  const C = CHAP.farm, k = FM.br - 1, pm = C.pont[k]; FM.hitDone = true; FM.hitAnim = { k, t: 0, on: false };
  for (let i = DIRQ.length - 1; i >= 0; i--) if (DIRQ[i].shell) DIRQ.splice(i, 1);
  const sz = Math.sign(SUN.dir.z) || 1, tip = pm.position.clone(), c0 = tip.clone().add(V3(-8, 3.4, 28 * sz)), c1 = tip.clone().add(V3(-3, 2.6, 19 * sz));   // from the sun's side of the bridge: the light on the pontoon, not in the lens
  playCine({ vid: 'fm_hit', shots: [{ d: 4.6, slow: 0.4, cam: camLerp(c0, c1, tip.clone().add(V3(0, 1, 0)), tip.clone().add(V3(0, 0.4, 0)), 40) }, { d: 2.6, cam: camLerp(c1, c1.clone().add(V3(0, 1.2, 5)), tip, tip.clone().add(V3(0, -0.6, 0)), 44) }],
    ev: [[0.5, () => sndWhistle(0.7)], [1.2, () => { const p = tip.clone().add(V3(0.6, 0.9, 0.4)); fxExplosion(p, 2.3); fmSplash(p, 1.5); rippleAdd(p.x, p.z, 1.6); sndBoom(p, 1.7); FX.shake = 0.8; FM.hitAnim.on = true; }]],
    caps: [[1.4, '<b>פגיעה ישירה בדוברה.</b> הגשר נקרע, והדוברה שוקעת.', 3.4], [4.9, 'מנתקים אותה — ודוברה חדשה יורדת למים, תחת אש.', 2.4]],
    end: () => { FM.hitAnim = null; pm.position.set(pm.userData.x, 0.2, pm.userData.z); pm.rotation.set(0, 0, 0); FM.br = k; fmBridgeSet(FM.br, false); meter('גשר הדוברות', FM.br / FM_BR.n); Object.assign(FM.bar, { phase: 'calm', t: 0, calm: 12 }); fmEngShelter(false); radio('מפקד הגשר', 'דוברה אחת הלכה! מנתקים — ועוד אחת למים, עכשיו!', 3.4); snapRequest('hit'); } });
}
function fm5Upd(dt, C) {
  fmBarUpd(dt);
  if (!FM.hitDone && FM.br >= 7 && FM.bar.phase === 'fire' && FM.bar.t > 1.2) { fmPontoonHit(); return; }
  // Egyptian commandos come down the rampart from the north, twice: one front, the Yard's north gate
  for (const [k, at] of [['cm1', 55], ['cm2', 130]]) if (!FM.msgs[k] && FM.t > at && FM.bar.phase === 'calm') { FM.msgs[k] = true; for (let j = 0; j < 5; j++) fmRun([-322 + rand(-6, 6), -212 - j * 3], [[-320, -160], [-316 + rand(-6, 6), -134 + rand(-3, 3)]], j === 2 ? 'smg' : 'rifle', 'cm', 0.5 + j * 0.9); radio('שומר', 'קומנדו מצרי מצפון, על הסוללה! הם באים לחצר!', 3); }
}

/* ---------- the end: the bridge touches Africa; the night the brigades crossed; the morning after ---------- */
function fmEndFilm() {
  const C = CHAP.farm; FM.ph = 'end'; FM.bar.on = false; fmRingsClear(); for (const e of UNITS.enemies) if (e.alive) killEnemy(e, false); for (let i = DIRQ.length - 1; i >= 0; i--) if (DIRQ[i].spawn || DIRQ[i].shell) DIRQ.splice(i, 1);
  fmBridgeSet(FM_BR.n, true); meter(null); C.slip.visible = false; if (C.wflag) C.wflag.visible = true;
  const bz = FM_YARD.bz, T = () => C.ytank[0].g.position.clone(), sz = Math.sign(SUN.dir.z) || 1;
  const wb = fmV(-506, bz + 12, 0, 3.4), mid = fmV(-424, bz, 0, 1.0), yard = fmV(-318, bz - 26, 0, FY + 5), ramp = fmV(-350, bz + 8, 0, FY), qcam = fmV(-252, bz - 24, 0, FY + 5.5), pump = fmV(FM_PUMPS[0][0], FM_PUMPS[0][1], 1.8, FY);
  const night = () => { C.ytank.forEach((v, i) => { vehRevive(v); fmDrive(v, [[-372 - i * 30, bz], [-640, bz]], 5.5); v.stop = undefined; });
    C.tanks.slice(0, 5).forEach((v, i) => { vehRevive(v); fmDrive(v, [[-290 + i * 15, bz], [-308 + i * 15, bz]], 4.5); v.name = FM_TNAME[i]; });
    const [fx, fz] = FW(-430, bz - 60); spawnFlare(fx, fz, 150, 30, 26, 0.6); };
  const splash = (lx, lz, k = 1.2) => () => { const [x, z] = FW(lx, lz); fmSplash(V3(x, 0.1, z), k); rippleAdd(x, z, k * 1.2); };
  playCine({ vid: 'fm_end',
    title: 'הגשר · 17–18 באוקטובר 1973',
    shots: [
      { d: 5.2, cam: camLerp(wb, wb.clone().add(V3(4, -0.6, -2)), mid, mid.clone().add(V3(30, 0, 0)), 46) },
      { d: 4.6, cam: camLerp(yard, yard.clone().add(V3(-4, -1, 3)), ramp, ramp.clone().add(V3(-6, 0, 0)), 50) },
      { d: 6.4, cam: (u) => { const t = T(); return { p: V3(t.x + 8 - u * 5, 2.8, t.z + 20 * sz), l: t.add(V3(0, 1.4, 0)), fov: 44 }; } },
      { d: 4.4, cam: camLerp(qcam, qcam.clone().add(V3(-6, -0.5, 0)), fmV(-278, bz, 1.5, FY), fmV(-300, bz, 1.0, FY), 50) },
      { d: 6.6, cam: camOrbit(pump, 17, 0.6, 1.5, 4.5, 50) },
    ],
    ev: [[0.001, () => { FM.filmTod = 64 * 60 + 30; }],
      [6.9, () => { const [x, z] = FW(-338, bz + 15), p = V3(x, groundAt(x, z), z); fxExplosion(p, 1.3); sndBoom(p, 0.9); FX.shake = 0.4; }],
      [9.8, () => { FM.filmTod = 70 * 60; night(); }], [11.0, splash(-440, bz + 16)], [12.3, splash(-410, bz - 12, 1.4)], [13.6, splash(-468, bz + 9)], [14.6, splash(-395, bz + 22, 1.0)], [15.5, splash(-452, bz - 18, 1.5)],
      [16.4, () => { const [x, z] = FW(-270, bz - 40), p = V3(x, groundAt(x, z), z); fxExplosion(p, 1.6); sndBoom(p, 0.8); }],
      [20.6, () => { FM.filmTod = 72 * 60 + 7 * 60 + 30; for (const v of [...C.ytank, ...C.tanks]) fmHide(v); }]],
    caps: [[0.4, '<b>17 באוקטובר, בסביבות 16:30.</b> גשר הדוברות נוגע בגדה המערבית.', 4.6], [5.4, 'פצצת מרגמה הרגה באותו יום את סג״מ יהודה מונהייט וארבעה מאנשי צוות הדוברה.', 4.2],
      [10.2, 'בלילה עוברות על הגשר חטיבות 421, 460 ו־217 — תחת הפגזה. ראש הגשר באפריקה גדל.', 5.6], [16.4, 'בצד הזה של הגשר ממתינים הטנקים הבאים בתור.', 3.6],
      [21.0, '<b>18 באוקטובר.</b> המצרים נוטשים את ציר טרטור, ובתי המשאבות עם הכתב היפני נכבשים בלי ירייה.', 3.2], [24.4, 'בלילה הראשון נפלו כ־120 לוחמי חטיבה 14; בציר טרטור — כארבעים צנחנים מגדוד 890.', 3.0]],
    end: () => { FM.filmTod = null; DIRQ.push({ at: GAME.t + 0.3, fn: () => endGame(true) }); },
  });
}

/* ---------- every frame ---------- */
function fmLook(dt) {
  const C = CHAP.farm, night = FM.stage <= S_T42;
  for (const f of C.fires) { f.fires.forEach((s, i) => { s.scale.setScalar(f.size * (2.4 + i * 0.8) * (0.85 + 0.3 * Math.abs(Math.sin(GAME.t * 7 + i + f.ph)))); s.position.y = f.g + 1.6 + i * 0.75 + Math.sin(GAME.t * 5 + i) * 0.15; });
    if (Math.random() < dt * 2) { const q = FX.smoke.get(); q.life = 5; q.s.position.set(f.x + rand(-1, 1), f.g + 3, f.z + rand(-1, 1)); q.s.material.color.set(0x1a1816); q.upd = (qq, u, dt2) => { qq.s.position.y += 2.4 * dt2; qq.s.scale.setScalar(2 + u * 8); qq.s.material.opacity = 0.6 * (1 - u); }; } }
  C.fireL.forEach((L, i) => { L.intensity = night && !LITE ? 26000 * (0.8 + 0.2 * Math.sin(GAME.t * 9 + i * 2)) : 0; });
  { let fl = 0; for (const f of FLARES) { const k = f.t < 1.5 ? f.t / 1.5 : f.t > f.life - 4 ? Math.max(0, (f.life - f.t) / 4) : 1, d = Math.hypot(f.x - P.pos.x, f.z - P.pos.z); fl = Math.max(fl, k * clamp(1 - d / 520, 0, 1)); } FLARE_LIGHT = fl; }
  // illumination rounds over the fight, on the nights (the boats have their own, over the junction behind them)
  if (night && !CINE.on && ((FM.stage === S_JCT && FM.ph !== 'intro') || (FM.stage === S_T42 && FM.ph !== 'walk'))) { FM.illumT -= dt; if (FM.illumT <= 0) { FM.illumT = rand(16, 26); spawnFlare(P.pos.x + rand(-60, 60), P.pos.z - rand(40, 120), rand(150, 190), 30, 26, 0.45); } }
}
function fmUpd(dt) {
  const C = CHAP.farm; C.t += dt; FM.t += dt; if (Math.floor(C.t * 2) !== Math.floor((C.t - dt) * 2)) szEnemyCleanup();
  for (let i = DIRQ.length - 1; i >= 0; i--) if (DIRQ[i] && GAME.t >= DIRQ[i].at) { const q = DIRQ.splice(i, 1)[0]; q.fn(); }
  if (MODE !== 'farm' || GAME.state !== 'play') return;
  updTrail(dt); gateUpd(dt); smokeUpd(dt); SMOKE_POOL.update(dt); fmLook(dt); fmRingsUpd(dt); fmHuntUpd(dt); rippleUpd(dt);
  if (FM.stage === S_AQ) fmAqPose(); if (FM.stage === S_YARD) fm5Anim(dt);
  if (CINE.on) return;
  [fm0Upd, fm1Upd, fmAqUpd, fm3Upd, fm4Upd, fm5Upd][FM.stage](dt, C);
}
/* ---------- the chapter's hooks ---------- */
function fmPrompt() {
  const C = CHAP.farm, st = FM.stage;
  if (P.mode === 'carry' && P.carrying) {
    if (st === S_PITS && (fmNearEvac(3.6) || fmNearV(C.ht, 4.2))) return { text: `<kbd>E</kbd> למסור את ${P.carrying.name} לחובש`, fn: () => fmLoad('ht'), label: 'למסור' };
    if (st === S_SMOKE && !FM.drive) for (const v of C.apc) if (v.alive && v.arrived && fmNearV(v, 5.5)) return { text: `<kbd>E</kbd> להעלות את ${P.carrying.name} ${v.lto}`, fn: () => fmLoad(v), label: 'להעלות' };
    return null;
  }
  if (st === S_SMOKE && P.smoke < P.smokeMax) for (const v of C.apc) if (v.alive && v.arrived && fmNearV(v, 5)) return { text: '<kbd>E</kbd> לקחת רימוני עשן מהנגמ״ש', label: 'עשן', fn: () => { P.smoke = P.smokeMax; sndClick(900, 0.25); feed(`רימוני עשן: ${P.smoke}`, 'good'); } };
  if (st === S_YARD && FM.ph === 'yard' && FM.slip.st === 'ready' && FM.br < FM_BR.n) { const [wx, wz] = FW(-343, FM_YARD.bz + FM_SLIPZ + 5); if (Math.hypot(P.pos.x - wx, P.pos.z - wz) < 3.6) return FM.bar.phase === 'calm' ? { text: '<kbd>E</kbd> לשחרר את הדוברה למים', fn: fmLaunch, label: 'לשחרר' } : { text: 'הפגזה! קודם למחסה — משחררים אחרי המטח' }; }
  return null;
}
function fmRpgTarget(e) {
  if (e.hunter && e.hunter.alive) return e.hunter.g.position.clone().add(V3(rand(-1, 1), 1.4, rand(-1, 1)));
  if (FM.stage === S_JCT && Math.random() < 0.3) { const v = fmNearestTank([e.pos.x, e.pos.z]); if (v && Math.hypot(v.g.position.x - e.pos.x, v.g.position.z - e.pos.z) < 120) return v.g.position.clone().add(V3(rand(-2, 2), 1.4, rand(-2, 2))); }
  return null;
}
function fmSnapOK() {
  if (FM.stage === S_JCT && FM.ph === 'intro') return false;
  if (FM.stage === S_AQ && !(FM.aq && FM.aq.landed)) return false;
  if (FM.stage === S_SMOKE && PROJ.some((q) => q.type === 'atgm')) return false;
  if (FM.stage === S_YARD && (FM.ph !== 'yard' || (FM.bar && FM.bar.on && FM.bar.phase !== 'calm') || FM.slip.st !== 'ready' || FM.hitAnim || (FM.bar && FM.bar.on && FM.bar.calm - FM.bar.t < 4))) return false;
  return true;
}
// after coming back to a save: what is only drawn (the bridge, the slipway, the boats, the markers, the rings) is drawn again from the saved state
function fmSnapAfter() {
  const C = CHAP.farm, st = FM.stage; fmRingsClear(); FM.filmTod = null;
  fmBridgeSet(FM.br || 0, false); if (st === S_YARD) meter('גשר הדוברות', FM.br / FM_BR.n); else meter(null);
  { const [sx, sz] = FW(-344, FM_YARD.bz + FM_SLIPZ); C.slip.position.set(sx, FY + 0.6, sz); C.slip.rotation.set(0, 0, 0); C.slip.visible = st === S_YARD && FM.br < FM_BR.n; FM.slip = { st: 'ready', t: 0 }; }
  for (const m of C.yardProps) m.visible = st === S_YARD; if (C.wflag) C.wflag.visible = st >= S_T42; for (const b of C.rboats) b.visible = st === S_AQ; if (st === S_AQ) fmAqPose();
  FM.hitAnim = null; FMX.pitMk.forEach((m, i) => { const p = FM.pits && FM.pits[i]; m.mk.visible = st === S_PITS && !!p && (p.st === 'wait' || p.st === 'call'); });
  for (const e of UNITS.enemies) { if (e.alive && e.state === 'film' && /^pit/.test(e.sq || '')) { e.stance = 'down'; e.rig.pose('prone', 0); e.sync(); } fmPitLook(e); }
  for (const p of FM.pits || []) if (p.w >= 0 && p.st === 'wait') FRIENDS[p.w].unit.rig.root.visible = true;
}
function fmObj() {
  const C = CHAP.farm, st = FM.stage, foe = (e, label) => [e.pos.x, e.pos.y + 2.2, e.pos.z, label, 'foe'], at = (v, label, h = 2.4) => [v.g.position.x, v.g.position.y + h, v.g.position.z, label], pt = (lx, lz, label, y) => { const [x, z] = FW(lx, lz); return [x, y ?? groundAt(x, z), z, label]; };
  if (st === S_JCT) {
    if (FM.ph === 'ditch') return gateObj('מצרי בתעלה', 'הקטע הבא');
    const cl = UNITS.enemies.find((e) => e.alive && e.climbV); if (cl) return foe(cl, 'על הטנק!');
    const h = fieldNearest((e) => !!e.hunter); return h ? foe(h, 'צייד טנקים') : null;
  }
  if (st === S_PITS) {
    if (P.mode === 'carry') { const e = fmEvac(); return [e.x, hAt(e.x, e.z, FY + 0.6) + 1.6, e.z, 'פינוי · חובש']; }
    const f = fieldNearest((e) => /^pit/.test(e.sq || '') && e.state !== 'film'); if (f) return foe(f, 'מצרי');
    const w = FRIENDS.find((fr) => fr.state === 'stable' && fr.marker.visible); return w ? [w.unit.pos.x, w.unit.pos.y + 1.2, w.unit.pos.z, w.name] : null;
  }
  if (st === S_AQ) {
    const A = FM.aq; if (!A) return null;
    if (!A.landed) return pt(FM_AQ1 - 4, FM_YARD.bz, 'הגדה המערבית', 1.2);
    if (A.truck === 'fight') { const e = fieldNearest((q) => q.sq === 'tr', 200); return e ? foe(e, 'מצרי') : null; }
    if (A.truck === 'coming' && C.etruck.alive) return at(C.etruck, 'לא לירות', 3.4);
    return A.done ? null : pt(FM_AQP[0], FM_AQP[1], 'הקו');
  }
  if (st === S_T42) {
    if (FM.ph === 'walk') return pt(FM_T42[0], FM_TIR, 'טרטור 42');
    if (FM.ph === 'contact') return pt(FM_DITCH2[0], FM_DITCH2[1], 'לתעלה!', DY + 0.5);
    if (FM.ph === 'gates') return gateObj('מצרי בתעלה', 'הקטע הבא');
    if (FM.ph === 'hold') return fmNear(FM_HOLD[0], FM_HOLD[1], 10) ? null : pt(FM_HOLD[0], FM_HOLD[1], 'להחזיק כאן', DY + 0.5);
    return null;
  }
  if (st === S_SMOKE) {
    const r = FMX.sagRings[0]; if (r) return [r.x, r.y + 0.4, r.z, 'עשן כאן!'];
    if (FM.ph === 'go') return null;
    if (P.mode === 'carry') { const v = C.apc.filter((q) => q.alive && q.arrived).sort((a, b) => a.g.position.distanceTo(P.pos) - b.g.position.distanceTo(P.pos))[0]; return v ? at(v, v.name) : null; }
    const w = FRIENDS.filter((fr) => fr.state === 'stable').sort((a, b) => a.unit.pos.distanceTo(P.pos) - b.unit.pos.distanceTo(P.pos))[0]; return w ? [w.unit.pos.x, w.unit.pos.y + 1.2, w.unit.pos.z, w.name] : null;
  }
  if (FM.ph !== 'yard') return null;
  if (FM.bar.on && FM.bar.phase !== 'calm' && !fmInShelter()) { let b = null, bd = 1e9; for (const s of C.shelters) { const d = Math.hypot(s.x - P.pos.x, s.z - P.pos.z); if (d < bd) { bd = d; b = s; } } return b ? [b.x, FY + 0.4, b.z, 'למחסה!'] : null; }
  const cm = fieldNearest((e) => e.sq === 'cm', 150); if (cm) return foe(cm, 'קומנדו');
  if (FM.slip.st === 'ready' && FM.br < FM_BR.n) return pt(-343, FM_YARD.bz + FM_SLIPZ + 5, 'מנוף הדוברות', FY + 1.2);
  return null;
}
function fmItems(items) {
  const C = CHAP.farm, st = FM.stage, S = FM_STAGES[st]; items.push(['go', S.goal + (OBJ.on ? ' (◆)' : '')]);
  if (st === S_JCT) { const al = C.tanks.filter((v) => v.alive && v.g.visible).length; items.push([al < 3 ? 'warn' : '', `טנקים פעילים בצומת: ${al}`]);
    if (FM.ph === 'ditch') gateItem(items); else { const h = UNITS.enemies.filter((e) => e.alive && e.hunter).length, cl = UNITS.enemies.filter((e) => e.alive && e.climbV).length; if (cl) items.push(['warn', `מצרים על טנק: ${cl}`]); items.push([h ? 'warn' : '', `ציידי טנקים: ${h}`]); } }
  if (st === S_PITS) { const left = FM.pits.filter((p) => p.st === 'wait').length; items.push(['next', `פצועים שפונו: ${FM.saved}/2`]); if (left) items.push(['', `נקודות שלא נבדקו: ${left}`]); }
  if (st === S_AQ && FM.aq) { const A = FM.aq; if (!A.landed) items.push(['next', `עד הגדה המערבית: ${Math.max(0, Math.round(FM_AQ0 - FM_AQ1 - A.s))} מ׳`]); if (A.stopT > 0) items.push(['warn', 'זיקוק! לא לזוז']); if (A.truck === 'coming') items.push(['warn', 'משאית מצרית בכביש — לא לירות']); if (A.truck === 'fight') items.push(['warn', 'גילו אותנו! חסלו את המצרים']); items.push(['', 'צנחני 247 בסירות: 11']); }
  if (st === S_T42) { if (FM.ph === 'gates') gateItem(items); if (FM.ph === 'hold') items.push(['next', `מחזיקים עד אור ראשון: ${Math.max(0, Math.ceil(FM.holdT))} שנ׳`]); const n = FRIENDS.filter((f) => f.state === 'follow').length; items.push([n < 3 ? 'warn' : '', `צנחנים איתכם: ${n}`]); }
  if (st === S_SMOKE) { items.push(['next', `פצועים בנגמ״שים: ${FM.loaded}/4`]); for (const v of C.apc) items.push([!v.alive || v.hp < 40 ? 'warn' : '', `${v.name}: ${v.alive ? Math.max(0, Math.round(v.hp / 0.9)) + '%' : 'נפגע'}`]); if (FMX.sagRings.length) items.push(['warn', 'סאגר באוויר! עשן לעיגול הצהוב']); items.push(['', `רימוני עשן: ${P.smoke} · טילים שעוורו: ${FM.blind}`]); }
  if (st === S_YARD) { const B = FM.bar; items.push(['next', `דוברות בגשר: ${FM.br}/${FM_BR.n}`]); if (B.on) items.push(B.phase === 'calm' ? ['', `שקט — המטח הבא בעוד ${Math.max(0, Math.ceil(B.calm - B.t))} שנ׳`] : ['warn', fmInShelter() ? 'הפגזה — אתם במחסה' : 'הפגזה! למחסה!']); }
}
function fmHints() { if (FM.stage === S_SMOKE && P.smoke === 0 && FM.ph === 'rescue') hint('fm-refill', `נגמרו רימוני העשן. ליד הנגמ״ש — ${K('E')} למילוי.`, 6); }
function fmMini(g, X, poly, dot, k) {
  const W = (pts) => pts.map(([x, z]) => FW(x, z)), F = FM_FARM, Y = FM_YARD, cx = FM_CANAL.x, hw = FM_CANAL.hw, wl = [];
  for (const x of FM_DX) wl.push([W([[x, F.z0], [x, F.z1]]), 1.4, 'rgba(70,58,44,.85)']); for (const z of FM_DZ) wl.push([W([[F.x0, z], [F.x1, z]]), 1.4, 'rgba(70,58,44,.85)']);
  if (FM.br) wl.push([W([[FM_BR.x0, Y.bz], [FM_BR.x0 - FM.br * FM_SEGL, Y.bz]]), 4, 'rgba(46,46,40,.95)']);
  miniField(g, X, poly, dot, k, { bg: 'rgba(176,158,122,.92)', polys: [[W([[-760, -900], [cx - hw, -900], [cx - hw, 420], [-760, 420]]), 'rgba(118,128,90,.92)'], [W([[cx - hw, -900], [cx + hw, -900], [cx + hw, 420], [cx - hw, 420]]), 'rgba(70,104,128,.95)'], [W([[-760, FM_LAKE + 10], [0, FM_LAKE - 20], [900, FM_LAKE - 60], [900, 480], [-760, 480]]), 'rgba(70,104,128,.95)'], [W([[F.x0, F.z0], [F.x1, F.z0], [F.x1, F.z1], [F.x0, F.z1]]), 'rgba(132,114,84,.95)'], [W([[Y.x0, Y.z0], [Y.x1, Y.z0], [Y.x1, Y.z1], [Y.x0, Y.z1]]), 'rgba(200,188,152,.95)']],
    lines: [[W([[FM_LEX, 340], [FM_LEX, -880]]), 4, 'rgba(66,60,52,.9)'], [W([[FM_LEX, FM_TIR], [900, FM_TIR - 6]]), 3.5, 'rgba(96,84,64,.9)'], [W(FM_AKAVISH), 4, 'rgba(66,60,52,.9)'], ...wl] });
  if (FM.stage === S_PITS) FM.pits.forEach((p) => { if (p.st !== 'wait' && p.st !== 'call') return; const [a, b] = X(...FW(p.lx, p.lz)); g.strokeStyle = '#ffd23a'; g.lineWidth = 2; g.beginPath(); g.arc(a, b, 8, 0, 6.283); g.stroke(); g.fillStyle = '#6fa8ff'; g.strokeStyle = 'rgba(0,0,0,.6)'; g.lineWidth = 1.5; g.beginPath(); g.arc(a, b, 5, 0, 6.283); g.fill(); g.stroke(); });
  if (FM.stage === S_AQ) for (const b of CHAP.farm.rboats) { const [a, c] = X(b.position.x, b.position.z); g.fillStyle = '#2e302c'; g.beginPath(); g.arc(a, c, 3, 0, 6.283); g.fill(); }
  for (const r of FMX.sagRings) { const [a, b] = X(r.x, r.z); g.strokeStyle = '#ffd23a'; g.lineWidth = 2; g.beginPath(); g.arc(a, b, 6 + 2 * Math.sin(GAME.t * 8), 0, 6.283); g.stroke(); }
}
function fmEnd(win, why) {
  const stats = [[STATS.kills, 'אויבים נפגעו'], [STATS.saved, 'פצועים חולצו'], [FM.blind || 0, 'סאגרים שעוורו בעשן']];
  if (win) return ['יש גשר לאפריקה', 'ב־15 באוקטובר 1973 עברה חטיבה 14 בשקט בתפר שבין שתי הארמיות המצריות והגיעה לתעלה בלי ירייה — ובצומת טרטור–לכסיקון נקלעה לאחד הקרבות הקשים של המלחמה. באותו לילה חצו צנחני 247 את התעלה בסירות גומי, ו״ההפתעה היתה מושלמת״. בליל 16–17 הלך גדוד 890 מערבה בציר טרטור ונלחם בתעלות עד הבוקר; בזמן שהמצרים נלחמו בו, עברו הדוברות בציר עכביש אל החצר. המהנדסים בנו את הגשר תחת הפגזה, ובסביבות 16:30 ב־17 באוקטובר נגע הגשר בגדה המערבית. בקרבות החווה נפלו כ־120 לוחמי חטיבה 14 בלילה הראשון וכארבעים מצנחני 890.', stats];
  if (why === 'apc') return ['הנגמ״שים הושמדו', 'כל סאגר שמגיע לנגמ״ש פוגע בו. כשנשמעת קריאת "סאגר!" — חפשו את הלהבה הצהובה וזרקו עשן (T) לעיגול הצהוב שבין הנגמ״ש לחווה. מפעיל שלא רואה את המטרה מאבד את הטיל.', stats];
  return ['נפגעת', ['הישארו ליד הטנקים וירו בציידי הטנקים (צהוב) לפני שהם מגיעים. בתעלה — קטע אחרי קטע, ורימון לפני כל פינה.', 'לא כל מי ששוכב בבור הוא שלנו. כשעונים בערבית — יורים מיד, ומתרחקים מהבור.', 'בסירה — לא יורים. על הגדה נותנים למשאית לעבור; ואם גילו אתכם — מחסלים את מי שקופץ ממנה.', 'כשנפתחת האש — לתעלה שמצפון לכביש (◆): שם יש מחסה, ועשן (T) מסתיר אתכם בדרך. משם מערבה, קטע אחרי קטע.', 'הפצועים בתעלה, הנגמ״שים על הכביש. סחבו אחד־אחד, וזרקו עשן כשטס סאגר.', 'כשהקשר צועק "ארטילריה!" יש כמה שניות להגיע לבונקר. משחררים דוברות רק בין המטחים.'][FM.stage] || '', stats];
}
CHAP.farm = { stages: FM_STAGES, st: () => FM.stage, cp: () => CHAP.farm.cpN || 0, upd: fmUpd, obj: fmObj, hints: fmHints, items: fmItems, mini: fmMini, restore: fieldRestore, end: fmEnd,
  tank: false, dry: false, night: true, cloth: 0xb0a582, tracers: 0.8, burnLong: true, allyK: 0.15, allyInf: () => (FM.stage === S_JCT ? 0.2 : 0.5), hitK: () => 0.8, atgmBright: true, atgmSpeed: 38,
  shelter: () => fmInShelter(), rpgTarget: fmRpgTarget, prompt: fmPrompt, snapOK: fmSnapOK, snapAfter: fmSnapAfter, stableTag: () => (FM.stage === S_PITS ? 'לחובש' : FM.stage === S_SMOKE ? 'לנגמ״ש' : 'למחסה'),
  tod: () => { const m = FM.filmTod != null ? FM.filmTod : FM.stage === S_YARD ? lerp(FM_TOD[S_YARD], 64 * 60 + 26, clamp((FM.br - 3) / 9, 0, 1)) : FM_TOD[FM.stage] + CHAP.farm.t / (FM.stage === S_T42 ? 2 : 6); return (((m % 1440) + 1440) % 1440) - START_MIN; },
  build: () => chapterBuild(CHAP.farm, fmBuild), setup: fmSetup, clock: FM_CLOCK[0], toast: ['15–17 באוקטובר 1973 · החווה הסינית', 'הקרב שפתח את הדרך לגשר'], start: () => fieldStart('farm') };
