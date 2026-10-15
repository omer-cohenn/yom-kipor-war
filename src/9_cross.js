
/* ================= chapter 5: the crossing bridge, 16-19 October 1973 =================
   After Israeli sources. The roller bridge - some 200 m of steel cylinders - was torn on its way to the canal on the 16th, repaired under
   shelling, towed to the water by battalion 410 on the 18th and laid about a kilometre north of the pontoon bridge, at about 01:00 on the 19th.
   Film: the repair. 1. 18.10 - across on the rafts, the jeep's machine gun against the far bank. 2. the jeeps through the fields and their
   bazooka ambushes. 3. a small Egyptian village beside the crossing point, house by house. 4. 19.10, after midnight - the paratroopers hold the
   houses against the counter-attack while the bridge is pushed into the water. 5. the first tanks cross and come into the village firing.
   Film: the Egyptians break; a column of tanks on its way to the roller bridge. In this chapter north is +z. */
const CR = { o: { x: -7000, z: 7000 }, stage: 0, t: 0, cp: 0, msgs: {}, br: 0, flee: [], air: 0, rep: null, push: false, conv: null, filmTod: null, wave: 0, waveT: 0 };
const CW = toWorld(CR.o);
const CR_STAGES = [
  { title: 'על הדוברות', sub: 'צנחני חטיבה 247 חוצים את התעלה בג׳יפים על דוברות, מול גדה שיורה. המקלע על הג׳יפ הוא היחיד שיכול לענות לעמדות ממול — עד שהגלגלים נוגעים באפריקה.', goal: 'מהמקלע על הג׳יפ: השתיקו את העמדות בגדה ממול' },
  { title: 'בין השדות', sub: 'מעבר לסוללה מתחילים שדות התעלה: תעלות השקיה, שיחים גבוהים, וחוליות בזוקה שמחכות בתוכם. הג׳יפים נוסעים אל הכפר שליד נקודת הגישור.', goal: 'חסלו את מארבי הבזוקה בשיחים, עד הכפר' },
  { title: 'הכפר', sub: 'כפר מצרי קטן יושב בדיוק במקום שבו יעלה גשר הגלילים לגדה. בית אחרי בית, ממזרח למערב, לאורך הדרך.', goal: 'כבשו את הכפר, בית אחרי בית (◆)' },
  { title: 'להחזיק את הבתים', sub: '19 באוקטובר, אחרי חצות. מאחוריכם גשר הגלילים נדחף אל המים. המצרים יודעים מה זה אומר — ומסתערים על הכפר מהשדות שבמערב.', goal: 'החזיקו את הבתים מול ההסתערות, עד שהגשר נוגע בגדה (הפס למעלה)' },
  { title: 'הטנקים עוברים', sub: 'הגשר מונח. הטנקים הראשונים עולים עליו — ומגיעים לכפר באש של מקלעים ופגזים.', goal: 'החזיקו את הבתים — הטנקים בדרך אליכם' },
];
const CR_CLOCK = ['18.10.1973 · התעלה', '18.10.1973 · השדות', '18.10.1973 · הכפר', '19.10.1973 · הכפר', '19.10.1973 · גשר הגלילים'];
const CR_TOD = [8 * 60 + 40, 9 * 60, 9 * 60 + 50, 24 * 60 + 48, 25 * 60 + 4];   // minutes from midnight of the 18th
const CR_BRIDGE = -330;   // the sweet-water canal and the little bridge over it
// the Egyptian trench zigzags along the flat top of the west rampart, north of the breach (scenery now: its men were in the village)
const crTri = (t) => 1 - 4 * Math.abs((((t % 1) + 1) % 1) - 0.5);
const crTX = (lz) => -128 + 2.0 * crTri(lz / 26);
const CR_TZ0 = 30, CR_TZ1 = 256, CR_RAMP_Z = 268;
const CR_RAFT_Z = 404;
// the jeeps: off the rafts, west and then south through the fields, along the foot of the rampart to the village
const CR_JEEP = [[-86, 400], [-104, 401], [-124, 404], [-152, 410], [-200, 418], [-245, 404], [-252, 370], [-238, 345], [-222, 324], [-204, 302], [-180, 282], [-162, 262], [-153, 236], [-151, 196], [-152, 150], [-152, 104], [-151, 70], [-152, 42]], CR_JEEP_S = smoothPath(CR_JEEP, 3);
// where along the jeep track the three ambushes halt the column, and where their runners come from
const CR_AMB = { a0: { stop: [-243, 352], from: [-275, 340], txt: 'מארב! בזוקות בשיחים משני הצדדים!' }, a1: { stop: [-196, 296], from: [-228, 286], txt: 'עוד מארב! חי״ר בשדה, משמאל!' }, a2: { stop: [-152, 158], from: [-206, 150], txt: 'בזוקות בשדה מימין! עוד מארב!' } };
const crSAt = (path, x, z) => { let acc = 0, best = 0, bd = 1e9; for (let i = 0; i < path.length - 1; i++) { const a = path[i], b = path[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]); for (let u = 0; u <= 1; u += 0.02) { const d = Math.hypot(lerp(a[0], b[0], u) - x, lerp(a[1], b[1], u) - z); if (d < bd) { bd = d; best = acc + L * u; } } acc += L; } return best; };
const CR_ROAD = [[-120, 0], [-430, 0]];
const CR_SEGN = 32, CR_SEGL = 6.25, CR_DECK = 1.95, CR_BLEN = CR_SEGN * CR_SEGL;
const CR_NAMES = ['עמוס', 'רפאל', 'אהרון', 'גבריאל', 'נתן', 'אלון', 'יואב', 'שי', 'בועז', 'עידו', 'אריק', 'מאיר', 'יוסי', 'קובי', 'אבי', 'צחי'];
const CR_FOLLOW = [0, 1, 2, 3, 10, 11, 12, 13];
/* the village beside the crossing point: mud-brick houses with walls 60 cm thick and doorways 2.2 m wide, on both sides of the road that runs
   west from the breach. x, z, width (along x), depth (along z), the side of the door (n: toward -z, s: toward +z), all facing the road */
const CR_VH = [[-172, -21, 10, 8, 's'], [-197, -23, 9, 10, 's'], [-223, -21, 11, 8, 's'], [-172, 21, 10, 8, 'n'], [-197, 23, 9, 10, 'n'], [-223, 21, 11, 8, 'n'], [-198, -48, 10, 8, 's'], [-198, 48, 10, 8, 'n']];
const CR_WT = 0.6, CR_HH = 4.4, CR_DOOR = 2.2, CR_WIN = 1.4;   // tall rooms, a high flat roof with its parapet: a village that reads at a glance
const CR_VSEG = [0, 1, 2, 0, 1, 2, 1, 1];                 // the bound of the advance that takes each house
const crDoorX = (h) => (h[2] >= 10 ? h[0] + h[2] / 4 : h[0]);
const crDoorFront = (i) => { const h = CR_VH[i]; return [crDoorX(h), h[4] === 's' ? h[1] + h[3] / 2 + 3.5 : h[1] - h[3] / 2 - 3.5]; };
// the bounds: in front of a door each, east to west; the man inside each of those houses belongs to the bound that starts at his door
const CR_VG = [[-152, 8], crDoorFront(3), crDoorFront(1), crDoorFront(5), [-234, 0]];
const CR_GUARD = [[3, 1], [1, 2], [6, 2], [5, 3], [2, 3]];   // [house, bound]
const CR_LOWW = [[-240, -40, -28], [-240, -14, -5], [-240, 5, 14], [-240, 28, 40]];   // low walls along the west edge: x, z0, z1
const crInVillage = (lx, lz, pad = 0) => lx > -252 - pad && lx < -152 + pad && Math.abs(lz) < 62 + pad;
// the column of tanks in the last film: down the east bank, over the bridge, west along the road
const CR_CONV = [[330, 440], [318, 330], [330, 220], [300, 120], [250, 60], [190, 24], [140, 6], [110, 0], [-100, 0], [-150, 0], [-430, 0]];
const crBench = (x, z) => groundAt(x, z) + 0.4;
function crH(x, z) {
  const lx = x - CR.o.x, lz = z - CR.o.z, ax = Math.abs(lx);
  if (ax < 100) { const t = smooth(76, 100, ax); mix3(PAL.deep, PAL.wet, t); return lerp(-5.5, 0.9, t); }
  let h;
  if (lx > 0) {
    h = 0.9 + 1.4 * smooth(100, 125, lx) + 0.3 * fbm(lx / 90, lz / 90, 2); mix3(PAL.sandL, PAL.sandD, smooth(-0.3, 0.4, fbm(lx / 120, lz / 120, 3)));
    const breach = 1 - smooth(32, 50, Math.abs(lz)); const r = 7 * Math.exp(-(((lx - 142) / 9) ** 2)) * (1 - breach); h += r; mixIn(PAL.fresh, smooth(1, 5, r) * 0.5);
    mixIn(PAL.wet, 1 - smooth(100, 108, lx));
    { const d = Math.abs(lz); if (d < 5 && lx < 340) mixIn([0.56, 0.5, 0.4], 0.6 * (1 - smooth(2.5, 5, d))); }
    { const dc = distPolyline(lx, lz, CR_CONV); if (dc < 5 && lx > 110) mixIn([0.58, 0.52, 0.41], 0.55 * (1 - smooth(2.5, 5, dc))); }
  } else {
    const breach = 1 - smooth(12, 34, Math.abs(lz)), nr = 1 - smooth(6, 24, Math.abs(lz - CR_RAMP_Z));
    const fieldH = 1.6 + 0.25 * fbm(lx / 70, lz / 70, 2), bank = 0.9 + 0.7 * smooth(100, 112, ax), dr = Math.abs(lx + 128);
    const ramp = 9 * (1 - smooth(6.5, 17, dr)) * (1 - breach) * (1 - 0.8 * nr) * smooth(10, 30, Math.abs(lz - CR_RAFT_Z));
    h = lerp(bank, fieldH, smooth(-108, -150, lx)) + ramp;
    mix3(PAL.sandL, PAL.sandD, smooth(-0.3, 0.4, fbm(lx / 100, lz / 100, 3))); mixIn(PAL.fresh, smooth(2, 8, ramp) * 0.4);
    // the Egyptian trench: a cut in the flat top of the rampart, sandbags on its lips
    if (lz > CR_TZ0 - 3 && lz < CR_TZ1 + 3) { const d = Math.abs(lx - crTX(lz)), k = smooth(CR_TZ0 - 3, CR_TZ0 + 2, lz) * (1 - smooth(CR_TZ1 - 2, CR_TZ1 + 3, lz)); const c = 1.0 * (1 - smooth(1.4, 2.8, d)) * k; h -= c; mixIn(PAL.sandD, c * 0.6); }
    if (lx < -150) {
      const f = smooth(-150, -175, lx), strip = noise(Math.floor((lx + 1000) / 38) * 1.7, Math.floor((lz + 1000) / 55) * 1.3);
      const green = [lerp(0.30, 0.42, strip), lerp(0.38, 0.47, strip), lerp(0.18, 0.24, strip)], tilled = [0.47, 0.38, 0.27];
      mixIn(strip > 0.05 ? green : tilled, 0.85 * f);
      const dr2 = Math.abs(lz); if (dr2 < 4) mixIn([0.6, 0.53, 0.42], 0.8 * (1 - smooth(2, 4, dr2)));
      { const dj = distPolyline(lx, lz, CR_JEEP_S); if (dj < 4) mixIn([0.6, 0.53, 0.42], 0.7 * (1 - smooth(2, 4, dj))); }
      const dc = Math.abs(lx - CR_BRIDGE); if (dc < 14) { h = lerp(h, -1.6, 1 - smooth(5, 12, dc)); mixIn(PAL.mud, 1 - smooth(6, 13, dc)); if (Math.abs(lz) < 4 && dc < 12) h = Math.max(h, 1.75); }
    }
    // the village: trodden dust between the houses
    { const kv = smooth(-258, -246, lx) * (1 - smooth(-158, -148, lx)) * (1 - smooth(54, 66, Math.abs(lz))); if (kv > 0) mixIn([0.64, 0.57, 0.45], 0.88 * kv); }
    { const d = Math.abs(lz); if (d < 4.5 && lx > -150) mixIn([0.58, 0.51, 0.4], 0.6 * (1 - smooth(2.5, 4.5, d))); }
    mixIn(PAL.wet, 1 - smooth(100, 106, ax));
  }
  return h;
}
/* ---------- the village: walls with real thickness, wide doorways, windows to shoot from ---------- */
// a straight wall in local coordinates (along x or along z), its outward normal, and its openings [from, to, 'door' | 'win'] measured along it
function crWall(ax, az, bx, bz, yb, y0, yt, gaps, P, th = CR_WT) {
  const alongX = Math.abs(bz - az) < 1e-6, L = alongX ? Math.abs(bx - ax) : Math.abs(bz - az), sx = alongX ? Math.sign(bx - ax) : 0, sz = alongX ? 0 : Math.sign(bz - az);
  const piece = (s0, s1, y1, y2) => { if (s1 - s0 < 0.02 || y2 - y1 < 0.02) return; const a = [ax + sx * s0, az + sz * s0], b = [ax + sx * s1, az + sz * s1], [wx0, wz0] = CW(Math.min(a[0], b[0]), Math.min(a[1], b[1])), [wx1, wz1] = CW(Math.max(a[0], b[0]), Math.max(a[1], b[1]));
    const x0 = alongX ? wx0 : wx0 - th / 2, x1 = alongX ? wx1 : wx0 + th / 2, z0 = alongX ? wz0 - th / 2 : wz0, z1 = alongX ? wz0 + th / 2 : wz1;
    P.walls.push(boxUV(x0, x1, y1, y2, z0, z1, 2.6, 2.6)); addCollider((x0 + x1) / 2, (z0 + z1) / 2, (x1 - x0) / 2, (z1 - z0) / 2, 0, y2, y1); };
  let s = 0; for (const [g0, g1, kind] of [...gaps].sort((p, q) => p[0] - q[0])) { piece(s, g0, yb, yt); if (kind === 'door') piece(g0, g1, y0 + 2.4, yt); else { piece(g0, g1, yb, y0 + 1.05); piece(g0, g1, y0 + 2.05, yt); } s = g1; }
  piece(s, L, yb, yt);
}
function crVHouse(i, P, C, r) {
  const [x, z, w, d, door] = CR_VH[i], T = CR_WT, x0 = x - w / 2, x1 = x + w / 2, z0 = z - d / 2, z1 = z + d / 2;
  // the floor sits just above the highest ground under the house, the walls go down into it
  let g = -1e9; for (const [a, b] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1], [x, z]]) g = Math.max(g, groundAt(...CW(a, b)));
  const y0 = g + 0.12, yb = g - 0.7, yt = y0 + CR_HH, H = { i, x, z, w, d, door, y: y0, win: [], guard: null };
  const dx = crDoorX(CR_VH[i]);
  // windows: two in every outer wall (one where the door leaves no room), each 1.4 m wide, the sill at 1.05 m
  const wins = (L, avoid) => { const out = []; for (const c of [L * 0.25, L * 0.75]) { if (avoid !== undefined && Math.abs(c - avoid) < CR_DOOR / 2 + CR_WIN / 2 + 0.5) continue; out.push([c - CR_WIN / 2, c + CR_WIN / 2, 'win']); } return out; };
  const LX = w + T, LZ = d - T;   // the walls along x run the full width, corners included; the walls along z fit between them
  const nGaps = wins(LX, door === 'n' ? dx - (x0 - T / 2) : undefined), sGaps = wins(LX, door === 's' ? dx - (x0 - T / 2) : undefined);
  if (door === 'n') nGaps.push([dx - (x0 - T / 2) - CR_DOOR / 2, dx - (x0 - T / 2) + CR_DOOR / 2, 'door']); else sGaps.push([dx - (x0 - T / 2) - CR_DOOR / 2, dx - (x0 - T / 2) + CR_DOOR / 2, 'door']);
  const wGaps = wins(LZ), eGaps = wins(LZ);
  crWall(x0 - T / 2, z0, x1 + T / 2, z0, yb, y0, yt, nGaps, P); crWall(x0 - T / 2, z1, x1 + T / 2, z1, yb, y0, yt, sGaps, P);
  crWall(x0, z0 + T / 2, x0, z1 - T / 2, yb, y0, yt, wGaps, P); crWall(x1, z0 + T / 2, x1, z1 - T / 2, yb, y0, yt, eGaps, P);
  const rec = (gaps, f) => { for (const [g0, g1, k] of gaps) if (k === 'win') H.win.push(f((g0 + g1) / 2)); };
  rec(nGaps, (s) => ({ x: x0 - T / 2 + s, z: z0, nx: 0, nz: -1 })); rec(sGaps, (s) => ({ x: x0 - T / 2 + s, z: z1, nx: 0, nz: 1 }));
  rec(wGaps, (s) => ({ x: x0, z: z0 + T / 2 + s, nx: -1, nz: 0 })); rec(eGaps, (s) => ({ x: x1, z: z0 + T / 2 + s, nx: 1, nz: 0 }));
  // inside: one partition with a 2.4 m opening in the middle, across the long side
  if (w >= 10) crWall(x, z0 + T / 2, x, z1 - T / 2, yb, y0, yt - 0.02, [[LZ / 2 - 1.2, LZ / 2 + 1.2, 'door']], P, 0.45);
  else crWall(x0 + T / 2, z, x1 - T / 2, z, yb, y0, yt - 0.02, [[(w - T) / 2 - 1.2, (w - T) / 2 + 1.2, 'door']], P, 0.45);
  // the floor, the flat roof with its low parapet, a door leaf standing open against the wall
  { const [a, b] = CW(x0 + T / 2, z0 + T / 2), [c, e] = CW(x1 - T / 2, z1 - T / 2); P.floor.push([boxUV(a, c, y0 - 0.14, y0, b, e, 2, 2), 0x6a5a44]); addFloor(a, c, b, e, y0); }
  { const [a, b] = CW(x0 - T / 2 - 0.15, z0 - T / 2 - 0.15), [c, e] = CW(x1 + T / 2 + 0.15, z1 + T / 2 + 0.15); P.roof.push([boxUV(a, c, yt, yt + 0.32, b, e, 3, 1), 0xb9a88a]); addCollider((a + c) / 2, (b + e) / 2, (c - a) / 2, (e - b) / 2, 0, yt + 0.32, yt);
    for (const [p0, p1, q0, q1] of [[a, c, b, b + 0.3], [a, c, e - 0.3, e], [a, a + 0.3, b, e], [c - 0.3, c, b, e]]) P.roof.push([boxUV(p0, p1, yt + 0.32, yt + 0.72, q0, q1, 3, 1), 0xc4b292]); }
  { const dz = door === 's' ? z1 - T / 2 - 0.08 : z0 + T / 2 + 0.08, [lx, lz] = CW(dx + CR_DOOR / 2 + 0.55, dz + (door === 's' ? -0.5 : 0.5)); P.wood.push([new THREE.BoxGeometry(0.08, 2.2, 1.0).translate(lx, y0 + 1.1, lz), 0x6a4a2c]); }
  // a few things in the rooms, in the corners away from the doorways
  const [cx, cz] = CW(x, z), far = door === 's' ? z0 + T / 2 + 0.7 : z1 - T / 2 - 0.7;
  for (const [ox, kind] of [[x0 + T / 2 + 0.8, 0], [x1 - T / 2 - 0.9, 1]]) { const [px, pz] = CW(ox, far);
    if (kind === 0) { P.wood.push([new THREE.BoxGeometry(1.0, 0.6, 0.7).translate(px, y0 + 0.3, pz), 0x7a5a38]); addCollider(px, pz, 0.5, 0.35, 0, y0 + 0.6, y0); }
    else for (let k = 0; k < 3; k++) { P.floor.push([G.cyl(0.24, 0.3, 0.7, 10), 0x9a6a44, M4(px + (k - 1) * 0.55, y0 + 0.35, pz + (k % 2) * 0.3)]); } }
  { const [px, pz] = CW(x + (r() - 0.5) * 2, z + (r() - 0.5) * 2); P.floor.push([new THREE.BoxGeometry(1.8, 0.03, 1.2).rotateY(r() * 3).translate(px, y0 + 0.02, pz), 0x8a3a2a]); }
  // cover for whoever fights around it outside, and in the window bays inside
  coverBox(cx, cz, w / 2 + T / 2, d / 2 + T / 2, 0, 2.4);
  // inside, beside the doorway: a man stands flat against the wall at the jamb and leans out into the opening to fire
  { const zw = door === 's' ? z1 : z0, nz = door === 's' ? 1 : -1, zi = zw - nz * (T / 2 + 0.45);
    for (const sd of [-1, 1]) { const [qx, qz] = CW(dx + sd * (CR_DOOR / 2 + 0.45), zi), [px, pz] = CW(dx + sd * (CR_DOOR / 2 - 0.3), zi + nz * 0.2); COVER.push({ x: qx, z: qz, nx: 0, nz, h: 2.4, by: null, px, pz, door: true }); } }
  // the window bays: where an Egyptian waits for the advance in the third stage, and where our men stand in the fourth
  for (const wn of H.win) { const bx = wn.x - wn.nx * (T / 2 + 0.55), bz = wn.z - wn.nz * (T / 2 + 0.55), [sx, sz] = CW(bx, bz), [px, pz] = CW(bx + wn.nx * 0.2, bz + wn.nz * 0.2), [hx, hz] = CW(bx - wn.nx * 0.7, bz - wn.nz * 0.7);
    const s = { x: sx, z: sz, y: y0, nx: wn.nx, nz: wn.nz, f: 0, b: null, used: false, fox: true, p: [px, pz], h: [hx, hz], grp: 'V', hi: i }; C.slots.push(s); wn.slot = s; }
  // the man inside, waiting for whoever comes through the door
  { const gz = door === 's' ? z0 + T / 2 + 1.3 : z1 - T / 2 - 1.3, nz = door === 's' ? 1 : -1, gx = w >= 10 ? dx : x, [sx, sz] = CW(gx, gz), [px, pz] = CW(gx, gz + nz * 0.2), [hx, hz] = CW(gx + 0.6, gz - nz * 0.3);
    const s = { x: sx, z: sz, y: y0, nx: 0, nz, f: 0, b: null, used: false, fox: true, p: [px, pz], h: [hx, hz], grp: 'G', hi: i }; C.slots.push(s); H.guard = s; }
  return H;
}
function crVillage(P, C, parts) {
  const r = rng(4417); C.vh = CR_VH.map((h, i) => crVHouse(i, P, C, r));
  // the low mud walls along the west edge: chest high, 60 cm thick, with wide gaps between them
  for (const [lx, z0, z1] of CR_LOWW) { const [a, b] = CW(lx - 0.3, z0), [c, e] = CW(lx + 0.3, z1), g = Math.min(groundAt(a, b), groundAt(c, e)); P.walls.push(boxUV(a, c, g - 0.4, g + 1.25, b, e, 2.6, 2.6)); addCollider((a + c) / 2, (b + e) / 2, 0.3, (e - b) / 2, 0, g + 1.25, g - 0.4); coverBox((a + c) / 2, (b + e) / 2, 0.3, (e - b) / 2, 0, 1.2); }
  // a well, drums, a cart, a few palms between the houses
  { const [wx, wz] = CW(-186, 0.0 + 10.5); parts.push([G.cyl(0.9, 0.95, 0.85, 14), 0xa89878, M4(wx, groundAt(wx, wz) + 0.42, wz)], [G.cyl(0.7, 0.7, 0.05, 12), 0x222a2a, M4(wx, groundAt(wx, wz) + 0.86, wz)]); addCollider(wx, wz, 0.9, 0.9, 0, groundAt(wx, wz) + 0.85); }
  for (const [x, z] of [[-210, -36], [-185, 36], [-232, -9]]) { const [wx, wz] = CW(x, z); fieldDrums(wx, wz, 3); }
  { const [wx, wz] = CW(-212, 10.5), g = groundAt(wx, wz); parts.push([G.box(2.6, 0.18, 1.4), 0x6e5236, M4(wx, g + 0.8, wz)], [G.cyl(0.55, 0.55, 0.1, 12), 0x3a2e22, M4(wx - 0.4, g + 0.55, wz - 0.75, Math.PI / 2, 0, 0)], [G.cyl(0.55, 0.55, 0.1, 12), 0x3a2e22, M4(wx - 0.4, g + 0.55, wz + 0.75, Math.PI / 2, 0, 0)], [G.box(1.6, 0.08, 0.08), 0x6e5236, M4(wx + 2.0, g + 0.7, wz)]); addCollider(wx, wz, 1.3, 0.8, 0, g + 1.0); coverBox(wx, wz, 1.3, 0.7, 0, 1.0); }
  { const pl = []; for (const [x, z] of [[-184, -36], [-210, 36], [-160, -12], [-238, 52], [-244, -52], [-186, 60], [-212, -62]]) { const [wx, wz] = CW(x, z); pl.push([wx, wz, 0.9 + r() * 0.3, r() * 6]); } palms(pl); }
}
// the roller bridge: one segment = a big steel float (the "roller") under a deck with side rails
const BR_SEG = build([[G.box(6.2, 0.35, 5.0), 0x5d604a, M4(0, 1.78, 0)], [G.cyl(1.25, 1.25, 4.6, 18), 0x4b4e3e, M4(0, 0.5, 0, Math.PI / 2, 0, 0)], [G.cyl(1.28, 1.28, 0.18, 18), 0x2f3229, M4(0, 0.5, 2.3, Math.PI / 2, 0, 0)], [G.cyl(1.28, 1.28, 0.18, 18), 0x2f3229, M4(0, 0.5, -2.3, Math.PI / 2, 0, 0)],
  ...[-1, 1].flatMap((sd) => [[G.box(6.2, 0.16, 0.14), 0x3f4236, M4(0, 2.85, sd * 2.5)], [G.box(6.2, 0.16, 0.14), 0x3f4236, M4(0, 2.35, sd * 2.5)], [G.box(0.16, 0.95, 0.16), 0x3f4236, M4(-3.0, 2.4, sd * 2.5)], [G.box(0.16, 0.95, 0.16), 0x3f4236, M4(0, 2.4, sd * 2.5)], [G.box(1.3, 0.12, 0.12), 0x3f4236, M4(-1.5, 2.4, sd * 2.5, 0, 0, 0.6)], [G.box(1.3, 0.12, 0.12), 0x3f4236, M4(1.5, 2.4, sd * 2.5, 0, 0, -0.6)]]), [G.box(0.3, 0.5, 5.2), 0x34372c, M4(3.0, 1.6, 0)]]);
const BR_FRONT = build([[G.cyl(0.05, 0.05, 4.2, 6), 0x2a2a28, M4(0, 3.6, 2.3)], [G.box(0.04, 0.7, 1.1), 0xe8641e, M4(0, 5.2, 2.85)], [G.cyl(0.05, 0.05, 4.2, 6), 0x2a2a28, M4(0, 3.6, -2.3)], [G.box(0.04, 0.7, 1.1), 0xe8641e, M4(0, 5.2, -2.85)]]);
const JEEP_MG = build([[G.box(0.1, 0.13, 0.95), 0x1d1d1b, M4(0, 0, -0.35)], [G.cyl(0.024, 0.024, 0.75, 6), 0x151515, M4(0, 0.012, -1.17, Math.PI / 2, 0, 0)], [G.cyl(0.04, 0.04, 0.3, 8), 0x2a2a28, M4(0, 0.012, -0.95, Math.PI / 2, 0, 0)], [G.box(0.07, 0.2, 0.1), 0x24221f, M4(0, -0.13, -0.05)], [G.box(0.17, 0.11, 0.26), 0x2a2a24, M4(0, 0.07, -0.5)], [G.box(0.2, 0.15, 0.2), 0x4a4c3a, M4(-0.16, -0.03, -0.5)], [G.box(0.05, 0.08, 0.05), 0x1a1a1a, M4(0, 0.1, -1.45)]]);
const CRANE_BOOM = build([[G.box(9.9, 0.42, 0.42), 0xc9a43a, M4(4.95, 0, 0)], [G.box(9.9, 0.08, 0.5), 0x8a7428, M4(4.95, 0.25, 0)], [G.box(1.4, 0.9, 1.0), 0x7a6a30, M4(0.2, 0, 0)], [G.cyl(0.18, 0.18, 0.6, 10), 0x2a2a28, M4(9.9, -0.3, 0)]]);
function crBuild() {
  const C = CHAP.cross; C.ground = makeGround({ x0: CR.o.x - 440, x1: CR.o.x + 345, z0: CR.o.z - 160, z1: CR.o.z + 450, step: 1.9, h: crH }); GROUND = C.ground;
  const BAGS = [], sv = BATCH.bag; BATCH.bag = BAGS; const k0 = COVER.length; C.slots = [];
  // the trench on the rampart north of the breach: sandbag lips, traverses, bunkers, the Egyptian flag
  { const line = []; for (let lz = CR_TZ0; lz <= CR_TZ1; lz += 2.5) line.push([crTX(lz), lz]); const W = (dx) => line.map(([x, z]) => CW(x + dx, z));
    bagWall(W(-2.9), 4, null, true); bagWall(W(2.9), 3, null, true); if (!LITE) { bagWall(W(-3.35), 3, null, false); bagWall(W(3.35), 2, null, false); }
    bagWall(W(-1.55), LITE ? 1 : 2, null, false);
    for (let lz = CR_TZ0 + 6; lz <= CR_TZ1 - 4; lz += 8.5) { const tx = crTX(lz), [ax, az] = CW(tx - 2.1, lz + 0.9), [bx, bz] = CW(tx - 0.25, lz + 0.9), g = groundAt(...CW(tx - 1, lz)); bagWall([[ax, az], [bx, bz]], 4, g - 0.05, true); }
    const bk = []; for (const [lz, sd] of [[150, 1], [100, -1], [228, 1]]) { const tx = crTX(lz), [wx, wz] = CW(tx + sd * 5.9, lz), y = groundAt(wx, wz) - 0.3; bk.push([G.box(4.2, 1.7, 3.6), 0x8e8468, M4(wx, y + 0.85, wz)], [G.box(4.6, 0.35, 4.0), 0x7a7258, M4(wx, y + 1.85, wz)], [G.box(0.06, 0.25, 2.2), 0x161412, M4(wx - sd * 2.11, y + 1.25, wz)]); addCollider(wx, wz, 2.1, 1.8, 0, y + 2.0); coverBox(wx, wz, 2.1, 1.8, 0, 1.8); }
    scene.add(SH(onLayer1(new THREE.Mesh(build(bk), MAT.vc))));
    { const [fx, fz] = CW(crTX(34) - 3.5, 34); C.egFlag = flag(fx, fz, 'eg', 6.5, Math.PI / 2); C.egFlag.userData.dyn = true; } }
  // bazooka nests in the scrub: three ambushes along the jeep track; and the nests in the fields west of the village for the counter-attack
  const nb = []; C.nests = {};
  for (const [id, pts] of [['a0', [[-252, 360, 'rpg'], [-212, 352, 'rifle'], [-246, 332, 'rifle'], [-206, 322, 'rpg'], [-230, 314, 'rifle'], [-258, 346, 'rifle']]], ['a1', [[-212, 290, 'rpg'], [-176, 300, 'rifle'], [-192, 266, 'rifle'], [-162, 292, 'rifle'], [-202, 276, 'rpg'], [-170, 258, 'rifle']]],
    ['a2', [[-176, 178, 'rpg'], [-184, 160, 'rifle'], [-172, 146, 'rifle'], [-188, 136, 'rpg'], [-170, 124, 'rifle'], [-182, 170, 'rifle']]]])
    C.nests[id] = pts.map(([x0, z0, kind]) => { const [x, z] = corr(CR_JEEP, x0, z0, 22, 9), [wx, wz] = CW(x, z); let bd = 1e9, tx = x, tz = z; for (const p of densify(CR_JEEP, 6)) { const d = Math.hypot(p[0] - x, p[1] - z); if (d < bd) { bd = d; tx = p[0]; tz = p[1]; } } const dx = tx - x, dz = tz - z, l = Math.hypot(dx, dz) || 1; return bushNest(wx, wz, dx / l, dz / l, C.slots, 'A' + id, kind, nb, Math.random); });
  C.nests.h = [[-292, -26, 'rpg'], [-300, 18, 'rifle'], [-288, 44, 'rpg'], [-304, -6, 'rifle']].map(([x, z, kind]) => { const [wx, wz] = CW(x, z); return bushNest(wx, wz, 1, 0, C.slots, 'H', kind, nb, Math.random); });
  // Egyptian positions at the landing, on the shoulders of the breach, facing the canal
  for (const [x, z] of [[-112, 386], [-110, 424], [-131, 391], [-131, 419], [-118, 404]]) { const [wx, wz] = CW(x, z); foxhole(wx, wz, 1, 0, C.slots).grp = 'L'; }
  // the village
  const P = { walls: [], roof: [], floor: [], wood: [] }, parts = []; crVillage(P, C, parts);
  { const m = new THREE.Mesh(mergeGeometries(P.walls, false), new THREE.MeshStandardMaterial({ map: plasterTex(77, '#c9ae86'), roughness: 0.95 })); scene.add(SH(onLayer1(m))); }
  { const m = new THREE.Mesh(build(P.roof), new THREE.MeshStandardMaterial({ vertexColors: true, map: TX.grime, roughness: 0.95 })); scene.add(SH(onLayer1(m))); }
  { const m = new THREE.Mesh(build(P.floor), MAT.vc); m.receiveShadow = !LITE; scene.add(onLayer1(m)); }
  { const m = new THREE.Mesh(build(P.wood), new THREE.MeshStandardMaterial({ vertexColors: true, map: TX.wood, roughness: 0.92 })); scene.add(SH(onLayer1(m))); }
  { const pl = []; const r = rng(91); for (let i = 0; i < 46; i++) { const x = -190 - r() * 140, z = 76 + r() * 150; const [wx, wz] = CW(x, z); pl.push([wx, wz, 0.8 + r() * 0.35, r() * 6]); } for (let i = 0; i < 18; i++) { const [wx, wz] = CW(-345 - r() * 60, -150 + r() * 560); pl.push([wx, wz, 0.9, r() * 6]); } palms(pl); }
  { const r = rng(92), trees = []; for (let i = 0; i < 90; i++) trees.push([-175 - r() * 120, -72 - r() * 80]); const tg = build([[G.cyl(0.12, 0.18, 1.6, 6), 0x5a4632, M4(0, 0.8, 0)], [G.sph(1.5, 9, 7), 0x3d5a2c, M4(0, 2.3, 0, 0, 0, 0, 1, 0.8, 1)]]); const im = new THREE.InstancedMesh(tg, MAT.vc, trees.length), mm = new THREE.Matrix4(), q = new THREE.Quaternion(); trees.forEach(([x, z], i) => { const [wx, wz] = CW(x, z), s = 0.8 + r() * 0.5; im.setMatrixAt(i, mm.compose(V3(wx, groundAt(wx, wz), wz), q.setFromAxisAngle(V3(0, 1, 0), r() * 6), V3(s, s, s))); }); scene.add(SH(onLayer1(im))); for (let i = 0; i < trees.length; i += 4) { const [wx, wz] = CW(...trees[i]); addCover(wx + 0.9, wz, -1, 0, 1.2); } }
  // the little bridge over the sweet-water canal
  { const [bx, bz] = CW(CR_BRIDGE, 0), y = 1.85; const m = new THREE.Mesh(build([[G.box(30, 0.5, 6.4), 0xa29a8a, M4(0, -0.25, 0)], [G.box(30, 0.8, 0.3), 0x8e8676, M4(0, 0.4, 3.1)], [G.box(30, 0.8, 0.3), 0x8e8676, M4(0, 0.4, -3.1)]]), MAT.vc); m.position.set(bx, y, bz); scene.add(SH(onLayer1(m))); addFloor(bx - 15, bx + 15, bz - 3, bz + 3, y); addCollider(bx, bz + 3.1, 15, 0.15, 0, y + 0.8, y - 0.5); addCollider(bx, bz - 3.1, 15, 0.15, 0, y + 0.8, y - 0.5); }
  // the east bank: the crossing yard; the roller bridge lies on the sand behind the water's edge with the tanks that will push it
  for (const [x, z, b] of [[175, -60, 270], [190, 40, 250], [205, -26, 280], [228, 30, 265]]) { const [wx, wz] = CW(x, z); placeTank(wx, wz, b); }
  for (const [x, z, b] of [[168, 70, 260], [212, 82, 270], [196, -80, 275]]) { const [wx, wz] = CW(x, z); halftrack(wx, wz, b); }
  C.towT = [0, 1, 2, 3].map(() => { const m = VEH_DATA.magach ? (() => { const r = vehModel('magach', 'f'); r.crew = true; return r.g; })() : new THREE.Mesh(TANK_GEO, MAT.vc); m.rotation.y = Math.PI; m.userData.dyn = true; scene.add(SH(onLayer1(m))); return m; });
  { const [rx, rz] = CW(104, 0); const m = new THREE.Mesh(build([[G.box(12, 0.5, 5.2), 0x5a5c48, M4(0, 0, 0, 0, 0, 0.12)], [G.box(12, 0.4, 0.15), 0x43463a, M4(0, 0.45, 2.5, 0, 0, 0.12)], [G.box(12, 0.4, 0.15), 0x43463a, M4(0, 0.45, -2.5, 0, 0, 0.12)]]), MAT.vc); m.position.set(rx, 1.4, rz); scene.add(SH(onLayer1(m))); }
  { const [rx, rz] = CW(-106, 0); C.wramp = new THREE.Mesh(build([[G.box(12, 0.5, 5.2), 0x5a5c48, M4(0, 0, 0, 0, 0, -0.1)], [G.box(12, 0.4, 0.15), 0x43463a, M4(0, 0.45, 2.5, 0, 0, -0.1)], [G.box(12, 0.4, 0.15), 0x43463a, M4(0, 0.45, -2.5, 0, 0, -0.1)]]), MAT.vc); C.wramp.position.set(rx, 1.45, rz); C.wramp.userData.dyn = true; C.wramp.visible = false; scene.add(SH(onLayer1(C.wramp))); }
  C.front = new THREE.Mesh(BR_FRONT, MAT.vc); C.front.userData.dyn = true; scene.add(onLayer1(C.front));
  C.segs = []; for (let k = 0; k < CR_SEGN; k++) { const m = new THREE.Mesh(BR_SEG, MAT.vc); m.userData.dyn = true; SH(m, true, true); onLayer1(m); scene.add(m); C.segs.push(m); }
  // work lamps along the rails and on the bow, lit on the night it is pushed out
  { C.lamps = []; const lm = new THREE.SpriteMaterial({ map: FXT.flare, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, color: 0xffd8a0 });
    for (let k = 0; k < CR_SEGN; k += 4) for (const sd of [-1, 1]) { const q = new THREE.Sprite(lm); q.position.set(0, 3.1, sd * 2.5); q.scale.setScalar(1.7); q.visible = false; C.segs[k].add(q); C.lamps.push(q); }
    for (const sd of [-1, 1]) { const q = new THREE.Sprite(lm); q.position.set(0, 4.7, sd * 2.3); q.scale.setScalar(2.6); q.visible = false; C.front.add(q); C.lamps.push(q); } }
  // the repair of the opening film: a crane on a truck, a trailer, the engineers
  { const cr = new THREE.Group(); cr.add(new THREE.Mesh(TRUCK_GEO, MAT.vc)); cr.children[0].position.set(1.8, 0, 0); const piv = new THREE.Group(); piv.position.set(0, 2.9, 0); cr.add(piv); const boom = new THREE.Mesh(CRANE_BOOM, MAT.vc); boom.rotation.z = 0.55; piv.add(boom); cr.userData = { dyn: true, piv, boom }; cr.visible = false; scene.add(SH(onLayer1(cr))); C.crane = cr;
    C.cable = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1, 5), MAT.metal); C.cable.userData.dyn = true; C.cable.visible = false; scene.add(onLayer1(C.cable));
    C.trailer = new THREE.Mesh(build([[G.box(7.2, 0.35, 3.0), 0x4e4f40, M4(0, 0.7, 0)], ...[-2.4, -1.4, 2.4].flatMap((x) => [-1, 1].map((sd) => [G.cyl(0.42, 0.42, 0.3, 12), 0x1d1c19, M4(x, 0.42, sd * 1.2, Math.PI / 2, 0, 0)]))]), MAT.vc); C.trailer.userData.dyn = true; C.trailer.visible = false; scene.add(SH(onLayer1(C.trailer)));
    C.eng = [0, 1, 2, 3, 4].map(() => { const u = new Unit('f', 'rifle'); scene.remove(u.tag); u.alive = true; u.rig.root.visible = false; u.rig.root.userData.dyn = true; u.rig.gun.visible = false; return u; }); }
  for (const [x, z, s] of [[-900, -500, 40], [-1200, 300, 55], [600, -900, 30], [-700, 800, 45]]) { const [wx, wz] = CW(x, z); smokeColumn(wx, wz, s, true); }
  { // fields, scrub and reeds
    const L = (x, z) => [x - CR.o.x, z - CR.o.z], onRoad = (lx, lz) => (Math.abs(lz) < 6 && lx < -110) || distPolyline(lx, lz, CR_JEEP) < 6;
    const okF = (x, z) => { const [lx, lz] = L(x, z); return lx < -150 && !onRoad(lx, lz) && !crInVillage(lx, lz, 4) && Math.abs(lx - CR_BRIDGE) > 11; };
    const X0 = CR.o.x - 440, X1 = CR.o.x - 150, Z0 = CR.o.z - 160, Z1 = CR.o.z + 450;
    concealPatches([...patchesNear(CR_JEEP.map(([x, z]) => CW(x, z)), 30, 9, 30, 880, okF, 4, 9), ...patchesNear(CR_ROAD.map(([x, z]) => CW(x, z)), 22, 8, 30, 882, okF, 4, 9), ...patchesIn(40, X0, X1, Z0, Z1, 883, okF, 5, 12)], C, 884, 0.7);
    dressRoute(CR_ROAD.map(([x, z]) => CW(x, z)), okF, 800, 1, 0.8); dressRoute(CR_JEEP.map(([x, z]) => CW(x, z)), okF, 805, 1.2, 0.6); dressArea(X0, X1, Z0, Z1, okF, 820, 0.8, 0.8);
    { const okE = (x, z) => { const [lx, lz] = L(x, z); return lx > 104 && !(Math.abs(lz) < 40 && lx < 160) && Math.abs(lz) > 6 && distPolyline(lx, lz, CR_CONV) > 7; }; dressArea(CR.o.x + 104, CR.o.x + 345, Z0, Z1, okE, 840, 0.5, 0.1); const okR = (x, z) => { const [lx, lz] = L(x, z); return lx < -100 && lx > -150 && Math.abs(lx - crTX(lz)) > 3.2 && Math.abs(lz) > 20 && distPolyline(lx, lz, CR_JEEP) > 6; }; dressArea(CR.o.x - 150, CR.o.x - 100, Z0, Z1, okR, 860, 0.35, 0.3); }
    instScatter(BUSH_G, scatterIn(LITE ? 300 : 700, X0, CR.o.x - 152, Z0, Z1, 501, okF, (x, z, r) => [x, z, 0.7 + r() * 1.0, r() * 6, greenBush(r), 0, 0.9]).concat(nb));
    { const rows = []; for (const [x0, x1, z0, z1] of [[-430, -350, -150, -12], [-430, -350, 12, 160], [-320, -190, 120, 240], [-330, -280, 300, 440]]) for (let x = x0; x < x1; x += 1.6) for (let z = z0; z < z1; z += 6.5) { const [wx, wz] = CW(x, z); if (!okF(wx, wz)) continue; rows.push([wx, wz, 1, 0, 0x5c7a3a + (Math.random() < 0.5 ? 0x060300 : 0), 0, 1]); } const cg = build([[G.box(0.45, 0.55, 6.0), 0xffffff, M4(0, 0.27, 0)]]); instScatter(cg, rows, DET_MAT, false); }
    { const reeds = []; for (let lz = -160; lz < 450; lz += 2.6) for (const sd of [-1, 1]) { if (Math.abs(lz) < 6 || Math.random() < 0.3) continue; const [wx, wz] = CW(CR_BRIDGE + sd * rand(7, 9.5), lz + rand(-1, 1)); reeds.push([wx, wz, 0.8 + Math.random() * 0.5, Math.random() * 6, Math.random() < 0.5 ? 0x7a8a4a : 0x8a8a58, 0, 1]); } instScatter(REED_G, reeds, DET_MAT, false); }
    { const hs = []; for (const [x, z] of [[-212, -120], [-224, -126], [-300, 180], [-312, 190], [-290, 360]]) { const [wx, wz] = CW(x, z); hs.push([G.cyl(1.4, 1.6, 1.8, 12), 0xc8b070, M4(wx, groundAt(wx, wz) + 0.9, wz)], [G.cone(1.5, 0.9, 12), 0xbca262, M4(wx, groundAt(wx, wz) + 2.2, wz)]); addCollider(wx, wz, 1.4, 1.4, 0, groundAt(wx, wz) + 2.2); coverBox(wx, wz, 1.4, 1.4, 0, 1.8); } scene.add(SH(onLayer1(new THREE.Mesh(build(hs), MAT.vc)))); }
    for (const [x, z, w, d, h, ru, col] of [[-318, 14, 4, 4, 2.6, 0, '#bfae8e'], [-380, -36, 6, 4, 2.8, 0, '#c7b490'], [-200, 96, 5, 4, 2.4, 1, '#c2ab84'], [-404, 52, 5, 5, 2.6, 0, '#cbb894'], [-276, 352, 5, 4, 2.5, 1, '#c4ae86'], [-192, 248, 4, 4, 2.4, 0, '#c9b48e']]) { const [wx, wz] = CW(x, z); smallHut(wx, wz, w, d, h, col, 0x7a6a52, !!ru); }
    powerLine([[-150, 7], [-700, 7]].map(([x, z]) => CW(x, z)), 40, 7); powerLine(CR_JEEP.map(([x, z]) => CW(x - 14, z)), 42, 7);
    wireFence([[-256, -6], [-322, -6]].map(([x, z]) => CW(x, z))); wireFence([[-340, -6], [-600, -6]].map(([x, z]) => CW(x, z)));
    { const bl = []; for (const [x, z] of [[-140, 300], [-142, 318], [-136, 330]]) { const [wx, wz] = CW(x, z); bl.push([wx, wz, 1.2 + Math.random() * 0.6, Math.random() * 6, rockCol(Math.random), 0.3, 0.72]); } instScatter(BOULDER_G, bl); boulders(bl); }
    instScatter(ROCK_G, scatterIn(LITE ? 80 : 180, CR.o.x + 100, CR.o.x + 345, Z0, Z1, 502, (x, z) => { const [lx, lz] = L(x, z); return Math.abs(lz) > 5 && distPolyline(lx, lz, CR_CONV) > 6; }, (x, z, r) => [x, z, 0.25 + r() ** 3, r() * 6, rockCol(r), 0.2, 0.55]).concat(scatterIn(90, X0, X1, Z0, Z1, 503, okF, (x, z, r) => [x, z, 0.2 + r() * 0.4, r() * 6, rockCol(r), 0.2, 0.6])));
    instScatter(BUSH_G, scatterIn(LITE ? 60 : 140, CR.o.x + 100, CR.o.x + 345, Z0, Z1, 504, (x, z) => { const [lx, lz] = L(x, z); return Math.abs(lz) > 5 && distPolyline(lx, lz, CR_CONV) > 6; }, (x, z, r) => [x, z, 0.35 + r() * 0.5, r() * 6, dryBush(r), 0, 0.7]));
    for (const [x, z] of [[-150, 280], [-300, 8]]) { const [wx, wz] = CW(x, z); fieldDrums(wx, wz, 5); }
    { const [a, b] = CW(-170, 276); fieldSign(a, b, 'צומת הצליחה ←', Math.PI, 1.4); }
  }
  if (parts.length) scene.add(SH(onLayer1(new THREE.Mesh(build(parts), MAT.vc))));
  BATCH.bag = sv; if (BAGS.length) scene.add(bagMesh(BAGS)); C.covers = COVER.slice(k0); for (const c of C.covers) c.y = hAt(c.x, c.z, groundAt(c.x, c.z) + 0.6);
  // vehicles: our jeeps on their rafts; the tanks that cross the bridge
  const jeepCrew = (v) => { const d = new THREE.Mesh(SEATED_F, MAT.clothF); d.position.set(-0.35 * JK, 0.95 * JK, -0.3 * JK); d.rotation.y = Math.PI / 2; v.g.add(d); v.crew = [d]; };
  C.jeeps = [0, 1, 2].map((i) => { const v = addVeh({ mode: 'cross', side: 'f', kind: 'jeep', geo: JEEP_GEO, half: [1.6 * JK, 1.6 * JK, 0.8 * JK], guns: i > 0, vmax: 6.5 }); jeepCrew(v); const vl = v.g.userData.vl; if (vl) vl.crew = false; else v.g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.8 * JK, 6).translate(-0.55 * JK, 1.35 * JK, 0), MAT.metal));   // the modelled jeep has its own .50 on its post; its men are set here
    if (i > 0) { const gu = new Unit('f', 'rifle'); scene.remove(gu.tag); gu.alive = true; gu.rig.root.visible = true; gu.stance = 'stand'; gu.rig.pose('aim', 0, 0.05); v.crewU = [{ u: gu, at: V3(-0.85 * JK, 0.95 * JK, 0.0) }]; v.crew.push(gu.rig.root); } return v; });
  C.rafts = [0, 1, 2].map(() => addVeh({ mode: 'cross', side: 'f', kind: 'raft', geo: RAFT_GEO, half: [5.5, 1.2, 3.2], float: (x, z) => (groundAt(x, z) < 0.4 ? 0.02 : null), vmax: 3.2, rock: { a: 0 }, sea: true }));
  C.jeepX = addVeh({ mode: 'cross', side: 'f', kind: 'jeep', geo: JEEP_GEO, half: [1.6 * JK, 1.6 * JK, 0.8 * JK], vmax: 0 }); if (C.jeepX.g.userData.vl) C.jeepX.g.userData.vl.crew = false; C.jeepX.men = [[-0.35, 0.95, -0.3], [0.45, 0.95, 0.35], [-1.1, 0.95, 0.3]].map(([x, y, z]) => { const d = new THREE.Mesh(SEATED_F, MAT.clothF); d.position.set(x * JK, y * JK, z * JK); d.rotation.y = Math.PI / 2; C.jeepX.g.add(d); return d; });
  for (const v of C.jeeps) { v.sea = true; v.float = (x, z) => { const lx = x - CR.o.x; return lx > -97 && lx < 100 && Math.abs(z - CR.o.z - CR_RAFT_Z) < 22 ? 1.1 : null; }; }
  roadRibbon(CR_JEEP.map(([x, z]) => CW(x, z)), 5, 'dirt'); roadRibbon([[-106, 0], [-400, 0]].map(([x, z]) => CW(x, z)), 9, 'asphalt'); roadWrecks([[-262, 0], [-400, 0]].map(([x, z]) => CW(x, z)), 3, 9117, 7.5);
  C.mg = new THREE.Mesh(JEEP_MG, MAT.vc); C.mg.visible = false; C.mg.userData.dyn = true; scene.add(onLayer1(C.mg));
  C.tanks = [0, 1, 2, 3, 4, 5].map(() => addVeh({ mode: 'cross', side: 'f', kind: 'tank', geo: TANK_GEO, half: [3.4, 2.6, 1.9], guns: false, vmax: 8, float: crDeck }));
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
/* the repair: segment 12 is lifted off the trailer, swung over and lowered into the gap; then the tanks push the rear half up against it */
function crRepStart() {
  const C = CHAP.cross, cx12 = 100 + 12.5 * CR_SEGL, px = cx12 + 3, pz = -7.9, reach = Math.hypot(cx12 - px, -pz), a1 = Math.atan2(0 - pz, cx12 - px), a0 = a1 + 1.75;
  const [tx, tz] = [px + Math.cos(a0) * reach, pz + Math.sin(a0) * reach], [wtx, wtz] = CW(tx, tz), gT = groundAt(wtx, wtz);
  CR.rep = { t: 0, gap: 4, joined: false, px, pz, reach, a0, a1, yT: gT + 1.6, yS: crSegY(cx12) };
  const [wx, wz] = CW(px, pz); C.crane.position.set(wx, groundAt(wx, wz), wz); C.crane.visible = true; C.cable.visible = true;
  C.trailer.position.set(wtx, gT, wtz); C.trailer.rotation.y = -a0 + Math.PI / 2; C.trailer.visible = true;
  const spots = [[cx12 - 4.4, 3.4, 'crouch'], [cx12 + 4.6, 3.3, 'idle'], [cx12 - 4.0, -3.5, 'idle'], [cx12 + 5.8, -3.0, 'crouch'], [px - 2.2, pz - 1.6, 'idle']];
  C.eng.forEach((u, i) => { const [ex, ez] = CW(spots[i][0], spots[i][1]); u.place(ex, ez); u.engPose = spots[i][2]; u.face(...CW(cx12, 0)); u.stance = spots[i][2] === 'crouch' ? 'crouch' : 'stand'; u.rig.root.visible = true; u.rig.pose(u.engPose, 0, 0); u.sync(); });
}
function crRepEnd() { const C = CHAP.cross; CR.rep = null; C.crane.visible = false; C.cable.visible = false; C.trailer.visible = false; for (const u of C.eng) u.rig.root.visible = false; }
function crRepUpd(dt) {
  const R = CR.rep; if (!R) return; const C = CHAP.cross, m = C.segs[12], t = (R.t += dt);
  // 9.5 lifted off the trailer, 12.5 swung over the gap, 15.5 lowered into it, 18.5 home; 20-25.5 the tanks push the rear half up against it
  const a = t < 12.5 ? R.a0 : t < 15.5 ? lerp(R.a0, R.a1, smooth(12.5, 15.5, t)) : R.a1, yUp = R.yS + 4.4;
  const y = t < 9.5 ? R.yT : t < 12.5 ? lerp(R.yT, yUp, smooth(9.5, 12.5, t)) : t < 15.5 ? yUp : t < 18.5 ? lerp(yUp, R.yS, smooth(15.5, 18.5, t)) : R.yS;
  if (t >= 18.5 && !R.joined) { R.joined = true; const [wx, wz] = CW(R.px + Math.cos(R.a1) * R.reach, 0); fxDust(V3(wx, R.yS - 0.4, wz)); sndClick(240, 0.4); }
  const lx = R.px + Math.cos(a) * R.reach, lz = R.pz + Math.sin(a) * R.reach, [wx, wz] = CW(lx, lz);
  if (!R.joined) { m.visible = true; m.position.set(wx, y + (t > 9.5 && t < 18.5 ? Math.sin(t * 1.8) * 0.07 : 0), wz); m.rotation.set(0, a - R.a1, 0); }
  R.gap = t < 20 ? 4 : lerp(4, 0, smooth(20, 25.5, t));
  const piv = C.crane.userData.piv; piv.rotation.y = -a; C.crane.updateMatrixWorld(true); const tip = C.crane.userData.boom.localToWorld(V3(9.9, -0.4, 0)), top = (R.joined ? R.yS : y) + 2.0, L = Math.max(0.2, tip.y - top);
  C.cable.position.set(tip.x, tip.y - L / 2, tip.z); C.cable.scale.set(1, L, 1); C.cable.visible = !R.joined || t < 19;
  for (const u of C.eng) { u.anim = (u.anim || 0) + dt * (u.engPose === 'crouch' ? 1.5 : 0.8); u.rig.pose(u.engPose, u.anim, 0); u.sync(); }
}
/* ---------- the third raft: a direct hit on the jeep it carries. One man is killed, two are wounded ---------- */
function crDirectHit() {
  const C = CHAP.cross, r = C.rafts[2], X = C.jeepX; CR.hit3 = true; r.g.updateMatrixWorld(true); const p = X.g.getWorldPosition(V3());
  fxExplosion(p.clone().add(V3(0, 0.8, 0)), 3.2); sndBoom(p, 3.0); crBurst(p.x + 4, p.z + 3, 1.5); crBurst(p.x - 5, p.z - 3, 1.3); crSplash(V3(p.x + 1, 0, p.z - 4), 1.2);
  r.rock.a = 0.45; r.vmax = 1.3; FX.shake = Math.max(FX.shake, clamp(1.4 - camera.position.distanceTo(p) / 40, 0.2, 0.9));
  X.wreck = true; X.g.traverse((m) => { if (m.isMesh && !X.men.includes(m)) m.material = MAT_BURNT; }); X.g.rotation.set(0.12, 0.5, 0.2);
  for (let i = 0; i < 2; i++) { const f = new THREE.Sprite(new THREE.SpriteMaterial({ map: FXT.fire, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, color: HDC })); f.position.set(rand(-0.4, 0.4), 1.4 + i * 0.6, rand(-0.3, 0.3)); f.scale.setScalar(1.8 + i * 0.6); X.g.add(f); X.fires.push(f); }
  const [a, b, c] = X.men; r.g.attach(a); CR.thrown = { m: a, v: V3(rand(1.5, 3), 5.5, rand(2, 4)), t: 0 };
  for (const [m, at] of [[b, [2.7, 0.3, 1.5]], [c, [-2.5, 0.3, -1.3]]]) { r.g.attach(m); m.position.set(...at); m.rotation.set(0, rand(0, 3), Math.PI / 2); }
  radio('קשר', 'פצצה על הדוברה שלידנו! פגיעה ישירה!', 2.4);
  DIRQ.push({ at: GAME.t + 2.8, fn: () => { radio('חובש', 'הג׳יפ על הדוברה השכנה נפגע! יש הרוג ושני פצועים. אני עליהם!', 3.4); feed('הדוברה השכנה נפגעה: הרוג ושני פצועים', 'bad'); } });
}
/* the bomb that finds the raft beside the player's: a jet comes in low from behind, along the line of the rafts; the bomb falls in slow motion,
   the player's head is turned to it, and it lands on the jeep nine metres away */
function crStrike() {
  const C = CHAP.cross, X = C.jeepX; X.g.updateMatrixWorld(true); const to = X.g.getWorldPosition(V3());
  const m = new THREE.Mesh(JET_GEO, MAT.jet); SH(m, true, false); scene.add(onLayer1(m));
  CR.strike = { m, t: 0, x0: to.x + 330, z: to.z - 3, rel: false }; m.position.set(to.x + 330, 46, to.z - 3);
  sndJet(3.2); radio('צנחן', 'מטוס! מאחורינו — הוא צולל על הדוברה שלידנו!', 2.6);
}
function crStrikeUpd(dt) {
  const S = CR.strike; if (!S) return; const C = CHAP.cross, X = C.jeepX; S.t += dt;
  const x = S.x0 - 92 * S.t, y = Math.max(20, 46 - S.t * 9); S.m.position.set(x, y, S.z); S.m.rotation.set(0, Math.PI, 0); S.m.rotateZ(S.rel ? 0.35 : -0.15);
  X.g.updateMatrixWorld(true); const tgt = X.g.getWorldPosition(V3());
  if (!S.rel && x < tgt.x + 52) { S.rel = true; const bm = new THREE.Mesh(BOMB_GEO, MAT.vc); bm.scale.setScalar(1.6); scene.add(onLayer1(bm)); const from = S.m.position.clone().add(V3(0, -1.2, 0));
    CR.shellIn = { m: bm, from, to: tgt.clone().add(V3(0, 0.6, 0)), t: 0, dur: 1.15, track: true }; bm.position.copy(from);
    slowMo(3.8, 0.2, tgt.clone().add(V3(0, 3.4, 0)));   /* aimed a little high: the burst fills the view above our own jeep's windscreen */ toast('פצצה!', 'הדוברה שלידכם'); }
  if (x < tgt.x - 800) { scene.remove(S.m); CR.strike = null; }
}
function crShellUpd(dt) {
  const S = CR.shellIn; if (!S || S.done) return; S.t += dt; if (S.track) { const X = CHAP.cross.jeepX; X.g.updateMatrixWorld(true); S.to.copy(X.g.getWorldPosition(V3())).add(V3(0, 0.6, 0)); } const u = Math.min(1, S.t / S.dur); S.m.position.lerpVectors(S.from, S.to, u); S.m.position.y = lerp(S.from.y, S.to.y, u * u); S.m.lookAt(S.to); S.m.rotateX(Math.PI / 2);
  if (u >= 1) { S.done = true; scene.remove(S.m); crDirectHit(); }
}
function crHitUpd(dt) {
  const C = CHAP.cross, X = C.jeepX, T = CR.thrown;
  if (T && T.m.visible) { T.t += dt; T.v.y -= 9.8 * dt; T.m.position.addScaledVector(T.v, dt); T.m.rotation.x += dt * 5; T.m.rotation.z += dt * 3; if (T.m.position.y < -1.2) { T.m.visible = false; const wp = T.m.getWorldPosition(V3()); wp.y = 0; for (let k = 0; k < 4; k++) fxDust(wp.clone().add(V3(rand(-0.6, 0.6), 0.3 + k * 0.3, rand(-0.6, 0.6))), true); rippleAdd(wp.x, wp.z, 0.5); } }
  if (X.wreck && X.g.visible && Math.random() < dt * 3.5) { const wp = X.g.getWorldPosition(V3()), q = FX.smoke.get(); q.life = 6; q.s.position.set(wp.x + rand(-0.6, 0.6), wp.y + 2.2, wp.z + rand(-0.6, 0.6)); q.s.material.color.set(0x1a1816); q.upd = (o, u, d2) => { o.s.position.y += 2.4 * d2; o.s.scale.setScalar(1.6 + u * 7); o.s.material.opacity = 0.7 * (1 - u); }; }
  if (X.wreck) for (const f of X.fires) f.scale.setScalar(1.6 + Math.sin(GAME.t * 11 + f.id) * 0.3 + (f.position.y > 1.6 ? 0.6 : 0));
}
/* ---------- the air raids: Egyptian jets dive on the rafts and on the bridge waiting on the bank ---------- */
const CRJ = [];
function crJet(kind) {
  const m = new THREE.Mesh(JET_GEO, MAT.jet); SH(m, true, false); m.visible = false; scene.add(onLayer1(m));
  let tx, tz, ang;
  if (kind === 'raft') { const r = CHAP.cross.rafts[Math.random() < 0.6 ? 0 : 1].g.position; tx = r.x + rand(-6, 6); tz = r.z + rand(-30, 10); ang = Math.PI / 2 + rand(-0.15, 0.15); }
  else { tx = CR.o.x + 100 - CR.br * CR_BLEN + rand(10, 190); tz = CR.o.z; ang = rand(-0.25, 0.25) + (Math.random() < 0.5 ? 0 : Math.PI); }
  CRJ.push({ m, kind, tx, tz, dx: Math.cos(ang), dz: Math.sin(ang), t: 0, last: -1e9, bombs: false });
  radio('תצפית', kind === 'raft' ? pick(['מיג צולל על הדוברות!', 'מטוס! הוא בא על הדוברות!']) : pick(['מיגים על גשר הגלילים!', 'סוחויים בצלילה על הצומת!']), 2.6);
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
  CR.shT = (CR.shT ?? 2) - dt; if (CR.shT > 0) return; const crossing = CR.stage === 0 && CR.msgs.go && !CHAP.cross.rafts[0].ended, pushing = CR.push && CR.br < 1; CR.shT = crossing ? rand(0.4, 1.0) : pushing ? rand(0.7, 1.5) : rand(1.2, 3.2);
  const xf = 100 - CR.br * CR_BLEN, r = Math.random(); let x, z;
  if (crossing && r < 0.9) { const q = CHAP.cross.rafts[Math.floor(Math.random() * 3)].g.position, a = rand(0, 6.283), dd = rand(7, 26); x = q.x + Math.cos(a) * dd; z = q.z + Math.sin(a) * dd; }
  else if (CR.stage === 0 && r < 0.6) { const q = CHAP.cross.rafts[Math.random() < 0.5 ? 0 : 1].g.position; x = q.x + rand(-30, 30); z = q.z + rand(-25, 25); }
  else if (r < 0.6) { x = CR.o.x + clamp(xf + rand(-30, 60), -90, 92); z = CR.o.z + (Math.random() < 0.5 ? -1 : 1) * rand(8, 34); } else if (r < 0.85) { x = CR.o.x + rand(110, 300); z = CR.o.z + rand(-90, 90); if (Math.abs(z - CR.o.z) < 8) z += 16; } else { x = CR.o.x + rand(-80, 80); z = CR.o.z + rand(-160, 160); if (Math.abs(z - CR.o.z) < 6) z += 12; }
  const gy = groundAt(x, z), p = V3(x, Math.max(gy, 0), z); if (camera.position.distanceTo(p) < 70 && Math.random() < 0.5) sndWhistle(1.0);
  DIRQ.push({ at: GAME.t + 1.0, fn: () => { if (gy < 0) crBurst(x, z, crossing ? 1.5 : 1.2); else { fxExplosion(p, 1.1); sndBoom(p, 1.0); } } });
}
// a shell in the canal: a column of water, and every raft near it rocks; close to the camera the whole picture shakes
function crSplash(p, k = 1) {
  const n = Math.round(9 * k); for (let i = 0; i < n; i++) fxDust(p.clone().add(V3(rand(-2, 2) * k, 0.3 + i * 0.55 * k, rand(-2, 2) * k)), true); for (let i = 0; i < 5; i++) fxDust(p.clone().add(V3(rand(-5, 5), 0.2, rand(-5, 5))), true); sndBoom(p, 1.1 * k);
  for (const r of CHAP.cross.rafts) { const d = r.g.position.distanceTo(p); if (d < 32) r.rock.a = Math.max(r.rock.a, 0.16 * k * (1 - d / 32)); }
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
const CR_RAFT_LOAD = [[0, 2.6], [0, -2.6], [1, 2.6]];   // which raft each jeep crosses on, and where on its deck
// the third raft, the one that is hit, crosses right beside the player's
function crRaftPath(i) { const z = CR_RAFT_Z - 4 + [0, 17, -8.5][i]; return [CW(i === 2 ? 72 : 84, z), CW(-84, z)]; }   // a little ahead, so the gunner sees it past the men beside him
function crRelease(v, gap) {
  // a jeep drives off its raft: its own path begins where it stands and joins the track
  scene.attach(v.g); const J = CR_JEEP.map(([x, z]) => CW(x, z)), p = v.g.position, start = [p.x, p.z], off = Math.hypot(J[0][0] - p.x, J[0][1] - p.z);
  v.path = [start, ...J]; v.s = 0; v.hdV = null; v.vmax = 6.5; v.speed = 0; v.onRaft = null; v.gap = gap - off; v.off = off;
}
function crCut(fn) { const f = $('#fade'); f.style.transition = 'opacity .5s'; f.style.opacity = '1'; DIRQ.push({ at: GAME.t + 0.55, fn: () => { fn(); f.style.transition = 'opacity 1.2s'; f.style.opacity = '0'; } }); }
// a bay of the village for one of ours: the base of a window slot, facing out of it
const crPost = (s, name) => ({ name, x: s.x, z: s.z, y: s.y, fx: s.nx, fz: s.nz, state: 'post' });
function crSetup(stage) {
  const C = CHAP.cross; fieldSetupCommon(C, stage); resetTrail(); CR.flee = []; CR.msgs = {}; if (CR.shellIn && CR.shellIn.m) scene.remove(CR.shellIn.m); CR.shellIn = null; SLOW.left = 0; SLOW.k = 1; SLOW.look = null; for (const j of CRJ) scene.remove(j.m); CRJ.length = 0; for (const b of AIR.bombs) scene.remove(b.m); AIR.bombs.length = 0;
  CR.br = stage >= 4 ? 1 : 0; CR.push = false; CR.air = [40, 18, 22, 999, 999][stage]; if (CR.strike) { scene.remove(CR.strike.m); CR.strike = null; } CR.wave = 0; CR.waveT = 4; CR.filmTod = null; CR.tanksOn = false; CR.illumT = 3; crRepEnd(); crConvOff(); meter(null);
  $('#clockSub').textContent = CR_CLOCK[stage];
  for (const v of C.jeeps) if (v.g.parent !== scene) scene.attach(v.g);
  for (const v of VEH) if (v.mode === 'cross') { vehRevive(v); v.path = null; v.stop = undefined; v.ended = false; v.shown = false; v.g.visible = false; v.onEnd = null; v.speed = 0; v.onRaft = null; }
  if (C.egFlag) C.egFlag.visible = stage < 2;
  P.mode = 'rifle'; vm.visible = true; if (TANK.g) TANK.g.visible = false; C.mg.visible = false;
  // the rafts: loaded at the Sinai bank, or already tied up at the west bank
  C.rafts.forEach((r, i) => { const RP = crRaftPath(i); r.shown = true; r.g.visible = true; r.path = RP; r.s = stage === 0 ? 0 : pathLen(RP); r.vmax = 0; r.hdV = null; r.ended = stage > 0; r.onEnd = () => {}; const [x, z, hd] = pathAt(RP, r.s); vehPose(r, x, z, hd); r.g.updateMatrixWorld(true); });
  // the fourth jeep rides the third raft, the one that will be hit half way over
  { const X = C.jeepX, r = C.rafts[2]; if (X.g.parent !== r.g) r.g.add(X.g); X.g.position.set(0, 1.1, 0); X.g.rotation.set(0, 0, 0); X.g.visible = stage === 0; X.wreck = false; X.onRaft = r;
    X.men.forEach((m, i) => { if (m.parent !== X.g) X.g.add(m); m.position.set(...[[-0.35, 0.95, -0.3], [0.45, 0.95, 0.35], [-1.1, 0.95, 0.3]][i].map((q) => q * JK)); m.rotation.set(0, Math.PI / 2, 0); m.visible = true; });
    CR.hit3 = false; CR.wh3 = false; CR.thrown = null; for (const q of C.rafts) q.rock.a = 0; }
  const J = CR_JEEP.map(([x, z]) => CW(x, z)), L = pathLen(J);
  C.jeeps.forEach((v, i) => { v.shown = true; v.g.visible = true; v.ambush = null; v.hdV = null; v.off = 0;
    if (stage === 0) { const [ri, lx] = CR_RAFT_LOAD[i], r = C.rafts[ri]; r.g.add(v.g); v.g.position.set(lx, 1.1, 0); v.g.rotation.set(0, 0, 0); v.onRaft = r; v.path = null; v.gap = i * 14; }
    else { v.path = J; v.s = stage === 1 ? 30 - i * 14 : L - i * 14; v.vmax = 6.5; v.gap = i * 14; v.stop = stage === 1 ? undefined : v.s; const [x, z, hd] = pathAt(J, v.s); vehPose(v, x, z, hd); } });
  const lead = C.jeeps[0];
  lead.crew[0].visible = stage > 1;
  const put = (lx, lz, yaw, y) => { const [x, z] = CW(lx, lz); P.pos.set(x, y === undefined ? groundAt(x, z) : hAt(x, z, y + 0.4), z); P.yaw = yaw; P.pitch = 0; };
  if (stage <= 1) { P.ride = { pos: () => lead.g.localToWorld(V3(-1.2, 1.3, 0)), eye: 1.62, mg: true, gun: C.mg, muzzle: () => C.mg.localToWorld(V3(0, 0.012, -1.5)) }; lead.g.updateMatrixWorld(true); P.pos.copy(P.ride.pos()); P.yaw = Math.PI / 2; P.pitch = -0.04; vm.visible = false; }
  else if (stage === 2) put(-149, 34, 0.98);
  else { const pw = C.vh[2].win.filter((wn) => wn.nx < -0.5)[1].slot; P.pos.set(pw.x, hAt(pw.x, pw.z, pw.y + 0.4), pw.z); P.yaw = Math.PI / 2; P.pitch = 0; }   // the other west window of the house at the corner is the player's
  const seats = [crSeat(lead, -1.5, -0.55), crSeat(lead, -1.5, 0.55), crSeat(C.jeeps[1], -1.45, -0.5), crSeat(C.jeeps[1], -1.45, 0.5), crSeat(C.jeeps[1], -0.35, 0.3), crSeat(C.jeeps[2], -1.45, -0.5), crSeat(C.jeeps[2], -1.45, 0.5), crSeat(C.jeeps[2], -0.35, 0.3)];
  // the bays our men hold in the fourth and fifth stages: the west windows of the four houses that face the fields
  const W = (hi, f) => C.vh[hi].win.filter(f).map((wn) => wn.slot), west = (wn) => wn.nx < -0.5;
  const bays = [W(2, west)[0], W(2, (wn) => wn.nz < -0.5)[0], ...W(5, west), ...W(6, west), ...W(7, west)];
  const fw = [-Math.sin(P.yaw), -Math.cos(P.yaw)];
  fieldFriends(CR_NAMES.map((name, i) => {
    const fo = CR_FOLLOW.indexOf(i); if (fo < 0) return null;
    if (stage <= 1) return { name, state: 'ride', ride: seats[fo], fi: fo };
    if (stage === 2) { const b = 2.2 + fo * 1.4; return { name, x: P.pos.x - fw[0] * b + (fo % 2 ? 1 : -1) * fw[1], z: P.pos.z - fw[1] * b - (fo % 2 ? 1 : -1) * fw[0], state: 'follow', fi: fo }; }
    return bays[fo] ? crPost(bays[fo], name) : null;
  }));
  crBridgePose(0); crStage(stage);
}
function crStage(i) {
  const C = CHAP.cross; fieldStage(C, i); CR.stage = i; CR.msgs = {};
  if (i === 0) { if (CR.introSeen) DIRQ.push({ at: GAME.t + 0.4, fn: crIntroEnd }); else DIRQ.push({ at: GAME.t + 0.4, fn: () => crIntroFilm() }); }   // a second try of the crossing starts at once
  if (i === 1) { const lead = C.jeeps[0]; C.stops = {}; for (const id in CR_AMB) C.stops[id] = crSAt(lead.path, ...CW(...CR_AMB[id].stop)); radio('מ״פ', 'על הגדה! נוסעים בין השדות, ואז דרומה לאורך הסוללה, אל הכפר שליד נקודת הגישור. מקלעים מוכנים!', 4); }
  if (i === 2) {
    radio('מ״פ', 'קפצו מהג׳יפים! הכפר שולט על המקום שבו יעלה הגשר. בית אחרי בית, ממזרח למערב — רימון לפני כל דלת!', 4.5);
    hint('cr-gate', `כובשים את הכפר <b>בית אחרי בית</b>: חסלו את המצרים בחלונות של הבתים שלפניכם, ואז היכנסו מהדלת — יש מישהו בפנים. הבית הבא יסומן ב־◆. הדלתות רחבות, והחלונות טובים לירי.`, 9);
    crVillageMan(); gateStart(CR_VG.map(([x, z]) => CW(x, z)), crVGate, crVDone, 'בית');
  }
  if (i === 3) crHoldStart();
  if (i === 4) { meter(null); if (!CR.tanksOn) crTanksGo(); radio('מג״ד', 'הגשר מונח! הטנקים עולים עליו — החזיקו עוד קצת, הם בדרך אליכם!', 4); CR.waveT = 6; }
}
/* the village: every house manned before the advance reaches it - men in the windows, one inside behind each door the bounds lead to */
function crVillageMan() {
  const C = CHAP.cross;
  C.vh.forEach((H, hi) => { const seg = CR_VSEG[hi], tag = 'g' + seg, cap = hi === 2 || hi === 5 ? 4 : 3;
    const ok = H.win.filter((wn) => wn.nx > 0.5 || (wn.nz !== 0 && Math.sign(wn.nz) !== Math.sign(H.z)) || (seg === 2 && wn.nx > -0.5)).sort(() => Math.random() - 0.5);
    ok.slice(0, cap).forEach((wn, k) => fSlotPlace(wn.slot, k === 1 && hi % 3 === 1 ? 'lmg' : k === 2 ? 'smg' : 'rifle', tag, { wakeG: seg, wakeR: 30 })); });
  for (const [hi, seg] of CR_GUARD) { const e = fSlotPlace(C.vh[hi].guard, hi === 2 ? 'smg' : 'rifle', 'g' + seg, { wakeG: seg, wakeR: 7 }); if (e) e.cyc = rand(0.3, 0.8); }
}
// each bound: men who run in along the road and the lanes from the west, in plain sight
function crVGate(k) {
  const tgt = [[-188, 0], [-210, 0], [-232, 0], [-246, 0]][k], n = [3, 3, 3, 5][k];
  for (let j = 0; j < n; j++) DIRQ.push({ at: GAME.t + 1.2 + j * 1.1, spawn: true, gate: k, fn: () => { const z0 = k === 3 ? rand(-30, 30) : rand(-6, 6), [x, z] = CW(k === 3 ? rand(-300, -286) : rand(-268, -258), z0), [tx, tz] = CW(tgt[0] + rand(-3, 3), (k === 3 ? z0 * 0.6 : rand(-5, 5))); const e = fSpawnStreet(x, z, [[tx, tz]], j === 1 ? 'smg' : j === 3 ? 'rpg' : 'rifle'); if (e) e.sq = 'g' + k; } });
  if (k > 0) radio('צנחן', pick(['יש מישהו בבית! רימון לדלת!', 'חלון בקומה — מקלע!', 'הם רצים אלינו בדרך, ממערב!', 'הבית הבא! לכסות את החלונות!']), 2.4);
}
function crVDone() {
  feed('הכפר בידינו', 'good'); radio('מ״פ', 'הכפר שלנו! תופסים את הבתים שמול השדות — מכאן הם יבואו.', 4); snapRequest('village');
  DIRQ.push({ at: GAME.t + 4.5, fn: () => crCut(() => crSetup(3)) });
}
/* ---------- the night: the bridge goes into the water, the Egyptians come for the village ---------- */
function crHoldStart() {
  const C = CHAP.cross; CR.push = true; CR.waveT = 13; DIRQ.push({ at: GAME.t + 7.4, spawn: true, fn: () => crWave(CR.wave++) });
  const tip = () => V3(CR.o.x + 100 - CR.br * CR_BLEN, 1.0, CR.o.z), [vx, vz] = CW(-212, -6), vil = V3(vx, groundAt(vx, vz), vz);
  { const [x, z] = CW(rand(-40, 40), 30); spawnFlare(x, z, 150, 30, 26, 0.6); } { const [x, z] = CW(-280, 10); spawnFlare(x, z, 160, 30, 26, 0.5); }
  playCine({ vid: 'cr_hold',
    title: 'גשר הגלילים · 19 באוקטובר 1973',
    shots: [
      { d: 7.5, cam: camLerp(() => V3(CR.o.x + 132, 6.5, CR.o.z + 24), () => V3(CR.o.x + 122, 5.2, CR.o.z + 20), () => tip().add(V3(16, 0, 0)), () => tip(), 50) },
      { d: 7.0, cam: camLerp(vil.clone().add(V3(14, 9, 6)), vil.clone().add(V3(11, 8.2, 5)), vil.clone().add(V3(-60, 1, 0)), vil.clone().add(V3(-72, 0, 0)), 54) },
    ],
    caps: [[0.4, '<b>19 באוקטובר, 00:50.</b> גדוד 410 דוחף את גשר הגלילים אל המים.', 6.8], [7.8, 'בכפר, הצנחנים מחזיקים בבתים. מהשדות שבמערב — הסתערות.', 6.6]],
    end: () => { CR.filmTod = null; radio('מ״פ', 'כל אחד בחלון שלו! הם באים מהשדות — לא נותנים להם להגיע לבתים עד שהגשר מונח!', 4.4);
      hint('cr-hold', `<b>מחזיקים את הבתים.</b> ירו מהחלונות על כל מי שרץ אליכם מהשדות במערב. מאחוריכם, דרך הפרצה בסוללה, אפשר לראות את גשר הגלילים נדחף אל המים — הפס למעלה מראה כמה נשאר.`, 10); },
  });
}
/* the counter-attack: waves out of the fields to the west, on a front as wide as the village, a bazooka here and there */
function crWave(n) {
  const sz = [10, 12, 14, 15, 12, 10][Math.min(n, 5)];
  for (let k = 0; k < sz; k++) DIRQ.push({ at: GAME.t + k * 0.6, spawn: true, fn: () => { const z0 = rand(-44, 44), [x, z] = CW(rand(-318, -298), z0), pts = [CW(rand(-268, -254), z0 + rand(-6, 6))]; if (Math.random() < 0.4) pts.push(CW(rand(-249, -244), clamp(z0 * 0.8, -40, 40))); const e = fSpawnStreet(x, z, pts, k % 5 === 2 ? 'rpg' : 'rifle'); if (e) e.sq = 'h'; } });
  if (n === 1) for (const s of CHAP.cross.nests.h) fSlotSpawn(s.kind, (q) => q === s, 'h');
  radio('תצפית', ['חי״ר מצרי בשדות! מתקרבים מהמערב!', 'עוד גל! הם רצים בין התעלות!', 'משאיות פרקו חי״ר מאחורי המטע! הם באים!', 'עוד גל! תחזיקו, הגשר כמעט מונח!', 'הם עוד באים! הטנקים בדרך!', 'גל אחרון!'][Math.min(n, 5)], 3);
}
function crBridgeDone() {
  const C = CHAP.cross; CR.push = false; meter('גשר הגלילים', 1); feed('גשר הגלילים מונח', 'good'); crTanksGo();
  const t0 = () => C.tanks[0].g.position.clone(), wb = V3(CR.o.x - 112, 4.2, CR.o.z - 16);
  playCine({ vid: 'cr_bridge', shots: [{ d: 8.5, cam: camLerp(wb, wb.clone().add(V3(3, -0.6, 2)), () => t0().add(V3(-26, 1, 0)), () => t0().add(V3(0, 1.5, 0)), 44) }],
    caps: [[0.5, '<b>01:00.</b> הקצה נוגע בגדה המערבית. הטנק הראשון עולה על הגשר.', 7.6]],
    end: () => crStage(4) });
}
/* ---------- the tanks: over the bridge, through the breach, into the village with every gun they have ---------- */
const CR_TDEST = [[[-184, 0], [-232, 0]], [[-184, 0], [-186, -35], [-232, -35]], [[-184, 0], [-186, 35], [-232, 35]], [[-166, 0]], [[-148, 0]], [[-130, 0]]];
function crTanksGo() {
  const C = CHAP.cross; CR.tanksOn = true;
  C.tanks.forEach((v, i) => { vehRevive(v); const pts = [[104 + i * 15, 0], [100, 0], [-100, 0], [-150, 0], ...CR_TDEST[i]]; v.path = pts.map(([x, z]) => CW(x, z)); v.s = 0; v.vmax = 8.5; v.speed = 0; v.stop = pathLen(v.path); v.ended = false; v.hdV = null; v.onEnd = null; v.shown = true; v.g.visible = true; v.name = ['הטנק הראשון', 'טנק 2', 'טנק 3', 'טנק 4', 'טנק 5', 'טנק 6'][i]; v.mgT = rand(0, 1); v.gunT = rand(1.5, 3.5); const [x, z, hd] = pathAt(v.path, 0); vehPose(v, x, z, hd); });
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
// the Egyptians break: whoever is left turns and runs for the fields
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
  if (CR.push && CR.br < 1) CR.br = Math.min(1, CR.br + dt / 62);
  crBridgePose(dt);
  if (CR.stage < 3 && !CINE.on && !(CR.stage === 0 && !CR.msgs.go)) { CR.air -= dt; if (CR.air <= 0) { CR.air = rand(20, 30); crJet(CR.stage === 0 ? 'raft' : 'bridge'); } }
  // the jeep's machine gun turns with the gunner
  if (P.ride && P.ride.mg) { C.mg.visible = !CINE.on; C.mg.quaternion.copy(camera.quaternion); C.mg.position.copy(camera.position).add(V3(0.0, -0.44, -0.3).applyQuaternion(camera.quaternion)); } else C.mg.visible = false;
  // fleeing Egyptians run for the fields
  for (const e of CR.flee) { if (!e.alive) continue; e.pos.x -= 5.4 * dt; e.pos.z += (e.drift || 0) * dt; e.pos.y = groundAt(e.pos.x, e.pos.z); e.heading = -Math.PI / 2; e.anim += dt * 11; e.stance = 'stand'; e.rig.pose('run', e.anim); e.sync(); }
  if (CR.stage === 4) for (const v of C.tanks) crTankGun(v, dt);
  if (CR.stage === 0) {
    // the rafts cross; the Egyptians at the landing open fire half way over; the jeeps drive off when the bank is quiet
    const rA = C.rafts[0], u = rA.s / pathLen(rA.path);
    { const r3 = C.rafts[2], u3 = r3.s / pathLen(r3.path); if (CR.msgs.go && !CR.hit3 && u3 > 0.3 && !CR.strike && !CR.shellIn) crStrike(); crStrikeUpd(dt); crShellUpd(dt); }
    if (u > 0.22 && !CR.msgs.fire) { CR.msgs.fire = true; for (const s of C.slots) if (s.grp === 'L') fSlotSpawn(s === C.slots.find((q) => q.grp === 'L') ? 'rpg' : 'rifle', (q) => q === s, 'L'); radio('צנחן', 'אש מהגדה ממול! מקלע בסוללה!', 2.4);
      for (let k = 0; k < 10; k++) DIRQ.push({ at: GAME.t + 3 + k * 1.1, spawn: true, fn: () => { const lz = CR_RAFT_Z + rand(-30, 26), [x, z] = CW(-150 - rand(0, 40), lz), [tx, tz] = CW(-108 - rand(0, 10), lz + rand(-6, 6)); const e = fSpawnStreet(x, z, [[tx, tz]], k % 5 === 2 ? 'rpg' : 'rifle'); if (e) e.sq = 'L'; } }); }
    if (rA.ended) { CR.msgs.landT = (CR.msgs.landT || 0) + dt; if (!CR.msgs.off && holdDone(fieldLeft((e) => e.sq === 'L'), CR.msgs.landT)) { CR.msgs.off = true; fieldDespawn((e) => e.sq === 'L'); crRelease(C.jeeps[0], 0); radio('נהג', 'יורדים מהדוברה! מחזיקים חזק!', 2); crStage(1); } }
  } else if (CR.stage === 1) {
    const lead = C.jeeps[0], L = pathLen(lead.path);
    // the other jeeps leave their rafts in turn, fourteen metres apart
    const [j1, j2] = [C.jeeps[1], C.jeeps[2]];
    if (j1.onRaft && lead.s > 16) crRelease(j1, 14);
    if (j2.onRaft && !j1.onRaft && C.rafts[1].ended && j1.s - (j1.off || 0) > 16) crRelease(j2, 28);
    for (const id in CR_AMB) { const s0 = C.stops[id]; if (lead.s > s0 - 75 && !CR.msgs[id]) { CR.msgs[id] = true; crAmbush(id); lead.stop = s0; } }
    // after the last ambush the track runs straight along the rampart: the column picks up speed
    if (CR.msgs.a1 && lead.stop === undefined) lead.vmax = 8.5;
    for (const v of C.jeeps) { if (v.onRaft) continue; v.stop = lead.stop === undefined ? (v === lead ? undefined : L - v.gap) : lead.stop - v.gap; if (v !== lead) v.vmax = lead.vmax; }
    if (lead.stop !== undefined && lead.s > lead.stop - 0.8) { CR.msgs.wait = (CR.msgs.wait || 0) + dt; const left = fieldLeft((e) => e.sq === lead.ambush); if (holdDone(left, CR.msgs.wait)) { fieldDespawn((e) => e.sq === lead.ambush); lead.stop = undefined; CR.msgs.wait = 0; radio('נהג', left ? 'אין זמן, ממשיכים!' : 'נקי! ממשיכים!', 2); } }
    if (lead.s >= L - 0.6 && !CR.msgs.out) { CR.msgs.out = true; crDismount(); }
  } else if (CR.stage === 2) { updTrail(dt); gateUpd(dt); }
  else if (CR.stage === 3) {
    updTrail(dt); if (CINE.on) return;
    CR.waveT -= dt; if (CR.waveT <= 0 && CR.br < 0.94) { crWave(CR.wave++); CR.waveT = 13; }
    for (const [k, txt] of [[0.3, 'הגשר בשליש הדרך! תחזיקו!'], [0.55, 'חצי גשר במים!'], [0.8, 'שמונים אחוז! הקצה כמעט אצלנו!'], [0.95, 'עוד גליל אחד! הטנקים מתניעים!']]) if (CR.br >= k && !CR.msgs['b' + k]) { CR.msgs['b' + k] = true; radio('גשר', txt, 3); }
    if (CR.br >= 1 && !CR.msgs.done) { CR.msgs.done = true; crBridgeDone(); }
  } else if (CR.stage === 4) {
    updTrail(dt); if (CINE.on) return;
    if (!CR.msgs.flee) { CR.waveT -= dt; if (CR.waveT <= 0) { crWave(CR.wave++); CR.waveT = 12; } }
    const tlx = C.tanks[0].g.position.x - CR.o.x;
    if (!CR.msgs.arr && tlx < -112) { CR.msgs.arr = true; radio('מפקד הטנק', 'אנחנו בפרצה! תנו לנו מטרות — אנחנו מנקים את השדה!', 3.2); DIRQ.push({ at: GAME.t + 9, fn: () => { if (!CR.msgs.flee) crFlee(); } }); }
    if (!CR.msgs.flee && C.t > 60) crFlee();
    if (CR.msgs.flee && !CR.msgs.end && C.t - CR.fleeT > 9) { CR.msgs.end = true; DIRQ.push({ at: GAME.t + 0.5, fn: crEndFilm }); }
  }
}
function crAmbush(id) {
  const C = CHAP.cross, lead = C.jeeps[0], A = CR_AMB[id]; lead.ambush = id;
  for (const s of C.nests[id]) fSlotSpawn(s.kind, (q) => q === s, id);
  for (let k = 0; k < 13; k++) DIRQ.push({ at: GAME.t + 2 + k * 0.7, spawn: true, fn: () => { const [x, z] = corr(CR_JEEP, A.from[0] + rand(-10, 10), A.from[1] + rand(-14, 14), 22, 14), [tx, tz] = corr(CR_JEEP, x + rand(10, 20), z + rand(-8, 8), 14, 7); const e = fSpawnStreet(...CW(x, z), [CW(tx, tz)], k === 3 ? 'rpg' : 'rifle'); if (e) e.sq = id; } });
  radio('צנחן', A.txt, 2.6);
}
function crDismount() {
  const C = CHAP.cross, lead = C.jeeps[0]; P.ride = null; C.mg.visible = false; vm.visible = true; P.crouch = false; lead.crew[0].visible = true;
  const p = lead.g.localToWorld(V3(-0.6 * JK, 0, -2.0 * JK)); P.pos.set(p.x, groundAt(p.x, p.z), p.z); resetTrail();
  CR_FOLLOW.forEach((fi, k) => { const f = FRIENDS[fi], u = f.unit, q = C.jeeps[Math.floor(k / 3)].g.localToWorld(V3(-1.2 + (k % 3) * 0.8, 0, k % 2 ? -2.0 : 2.0)); u.place(q.x, q.z); f.state = 'follow'; f.fi = k; f.ti = 0; f.stuck = 0; f.post = { id: 'F' + fi, fx: 0, fz: -1, mag: null, occupant: f, stand: [q.x, q.z] }; });
  crStage(2);
}
/* ---------- films ---------- */
/* the opening: the roller bridge on the east bank, mended under fire - the crane lowers a new roller into the gap, the tanks close it up,
   shells throw up the canal; then the rafts */
function crIntroFilm() {
  const C = CHAP.cross, rp = () => C.rafts[0].g.position.clone(), cx12 = 100 + 12.5 * CR_SEGL, slot = V3(CR.o.x + cx12, 2.6, CR.o.z), g = groundAt(slot.x, slot.z);
  crRepStart(); CR.filmTod = 7 * 60 + 50;
  const water = (lx, lz, k) => () => crBurst(CR.o.x + lx, CR.o.z + lz, k), land = (lx, lz) => () => { const [x, z] = CW(lx, lz), p = V3(x, groundAt(x, z), z); fxExplosion(p, 1.2); sndBoom(p, 1.0); };
  // slow: every shot long enough to look at - the crane, the roller swinging over, the water thrown up by the shells
  playCine({ vid: 'cr_intro',
    title: 'גשר הצליחה · 16–18 באוקטובר 1973',
    shots: [
      { d: 8.5, cam: camLerp(V3(slot.x + 54, 34, slot.z + 66), V3(slot.x + 36, 25, slot.z + 52), slot.clone().add(V3(-30, -2, 0)), slot.clone().add(V3(-16, -2, 0)), 50) },
      { d: 10.5, cam: camLerp(V3(slot.x - 17, g + 5.2, slot.z + 21), V3(slot.x - 14, g + 4.7, slot.z + 18), slot.clone().add(V3(2, 3.0, -6)), slot.clone().add(V3(0, 1.4, -2)), 50) },
      { d: 8.0, cam: camLerp(V3(CR.o.x + 66, 1.5, CR.o.z + 30), V3(CR.o.x + 69, 1.45, CR.o.z + 27), V3(CR.o.x + 150, 2.5, CR.o.z), V3(CR.o.x + 162, 2.5, CR.o.z), 46) },
      { d: 8.5, cam: (u) => ({ p: rp().add(V3(-17 + u * 4, 4.5, 15)), l: rp().add(V3(0, 1.2, 0)), fov: 50 }) },
    ],
    ev: [[1.8, water(70, 26, 1.5)], [4.0, land(220, 40)], [5.8, water(55, -18, 1.4)], [10.5, water(84, 14, 1.2)], [13.5, land(162, -30)], [17.0, water(64, 9, 1.4)], [20.2, water(86, -7, 1.6)], [22.0, water(74, 18, 1.5)], [24.0, land(236, -24)], [25.6, water(60, -12, 1.3)], [27.0, () => { crRepEnd(); CR.filmTod = null; }], [29.5, water(40, 430, 1.3)], [32.0, water(-30, 380, 1.2)]],
    caps: [[0.6, '<b>16 באוקטובר.</b> בדרך אל התעלה נקרע גשר הגלילים — כ־200 מטר של גלילי פלדה.', 7.4], [9.0, 'המהנדסים מחליפים את הגליל הפגוע, תחת הפגזה.', 8.6], [19.4, '<b>18 באוקטובר.</b> גדוד 410 גורר את הגשר אל שפת המים. כדי להניח אותו — צריך להחזיק את הגדה שממול.', 7.2], [27.4, 'בינתיים צנחני חטיבה 247 חוצים בג׳יפים על הדוברות.', 4.6], [32.4, '<b>מ״פ:</b> דוברות, יוצאים! מקלעים על הגדה ממול!', 3.0]],
    end: crIntroEnd,
  });
}
function crIntroEnd() { const C = CHAP.cross; CR.introSeen = true; crRepEnd(); CR.filmTod = null; CR.msgs.go = true; for (const r of C.rafts) r.vmax = 3.2; C.rafts[1].vmax = 2.9; C.rafts[2].vmax = 3.15; hint('cr-mg', `אתם על המקלע של הג׳יפ: ${TOUCH ? 'לחצו ממושך על אש' : 'לחיצה ממושכת'} יורה צרורות. הכוונת נצמדת לאויב הקרוב. חוליות בזוקה מסומנות באדום.`, 8); }
// the column of the last film: fifty tanks along the east bank, over the bridge, west along the road
function crConvOff() { const C = CHAP.cross; CR.conv = null; if (C.conv) C.conv.visible = false; }
function crConvUpd(dt) {
  const C = CHAP.cross, V = CR.conv; if (!V) return; V.s += 7 * dt; const path = V.path, m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), up = V3(0, 1, 0), hide = V3(0, -100, 0), one = V3(1, 1, 1), zero = V3(0.001, 0.001, 0.001);
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
    caps: [[0.4, 'המצרים נשברים ונסוגים מערבה, אל השדות.', 7.4], [8.8, '<b>19 באוקטובר, עם שחר.</b> טור ארוך של טנקים בדרך אל גשר הגלילים.', 8.6], [18.6, 'הגשר הונח כקילומטר צפונית לגשר הדוברות. בימים הבאים עברו על שני הגשרים אוגדות שלמות, וראש הגשר בגדה המערבית התרחב לרוחב של קילומטרים.', 9.0]],
    end: () => { CR.filmTod = null; DIRQ.push({ at: GAME.t + 0.3, fn: () => endGame(true) }); },
  });
}
/* ---------- the chapter's hooks ---------- */
function crObj() {
  const C = CHAP.cross;
  if (CR.stage === 0) { const e = fieldNearest((q) => q.sq === 'L'); if (e) return [e.pos.x, e.pos.y + 2.2, e.pos.z, 'עמדה בגדה']; const [x, z] = CW(-96, CR_RAFT_Z); return [x, 1, z, 'הגדה המערבית']; }
  if (CR.stage === 1) { const lead = C.jeeps[0]; if (lead.stop !== undefined) { const e = fieldNearest((q) => q.sq === lead.ambush); if (e) return [e.pos.x, e.pos.y + 2.2, e.pos.z, 'מארב']; } return null; }
  if (CR.stage === 2) return gateObj('מצרי בבית', 'הבית הבא');
  if (CR.stage === 3) { const e = fieldNearest((q) => q.sq === 'h', 140); return e ? [e.pos.x, e.pos.y + 2.2, e.pos.z, 'מסתערים', 'foe'] : null; }
  if (CR.stage === 4) { const e = !CR.msgs.flee && fieldNearest((q) => q.sq === 'h', 140); if (e) return [e.pos.x, e.pos.y + 2.2, e.pos.z, 'מסתערים', 'foe']; const p = C.tanks[0].g.position; return [p.x, p.y + 3.5, p.z, 'הטנקים']; }
  return null;
}
function crItems(items) {
  const C = CHAP.cross, S = CR_STAGES[CR.stage]; items.push(['go', (S.goal || S.sub) + (OBJ.on ? ' (◆)' : '')]);
  if (CR.stage === 0) { const r = C.rafts[0]; items.push(['', r.ended ? `הדוברה עגנה · מצרים בגדה: ${fieldLeft((e) => e.sq === 'L')}` : `עד הגדה המערבית: ${Math.max(0, Math.round(pathLen(r.path) - r.s))} מ׳`]); }
  if (CR.stage === 1) { const lead = C.jeeps[0]; items.push(['', lead.stop !== undefined ? `מארב! מצרים שנותרו: ${fieldLeft((e) => e.sq === lead.ambush)}` : `עד הכפר: ${Math.max(0, Math.round(pathLen(lead.path) - lead.s))} מ׳`]); }
  if (CR.stage === 2) gateItem(items);
  if (CR.stage === 3) { items.push(['next', `גשר הגלילים: ${Math.round(CR.br * 100)}%`]); items.push(['', `גל ${CR.wave} · מצרים מול הכפר: ${fieldLeft((e) => e.sq === 'h', 160)}`]); }
  if (CR.stage === 4) { const lead = C.tanks[0], lx = lead.g.position.x - CR.o.x; items.push(['next', CR.msgs.flee ? 'המצרים נסוגים' : lx > -100 ? `הטנק הראשון על הגשר: עוד ${Math.max(0, Math.round(lx + 100))} מ׳` : 'הטנקים בכפר!']); items.push(['', `מצרים מול הכפר: ${fieldLeft((e) => e.sq === 'h', 160)}`]); }
  if (CR.stage >= 2) { const n = FRIENDS.filter((f) => f.state === 'follow' || f.state === 'post').length; items.push([n < 2 ? 'warn' : '', `צנחנים איתכם: ${n}`]); }
}
function crHints() {
  if (CR.stage === 3 && CR.br > 0.85) hint('cr-almost', 'הגשר כמעט מונח! הטנקים כבר מחכים על הגדה המזרחית.', 6);
}
function crMini(g, X, poly, dot, k) {
  const W = (pts) => pts.map(([x, z]) => CW(x, z)), tl = []; for (let z = CR_TZ0; z <= CR_TZ1; z += 4) tl.push([crTX(z), z]); const xf = 100 - CR.br * CR_BLEN;
  miniField(g, X, poly, dot, k, { bg: 'rgba(120,128,84,.92)', polys: [[W([[100, -900], [100, 900], [900, 900], [900, -900]]), 'rgba(176,152,112,.95)'], [W([[-150, -900], [-150, 900], [100, 900], [100, -900]]), 'rgba(184,160,118,.95)'], [W([[-92, -900], [-92, 900], [92, 900], [92, -900]]), 'rgba(28,70,86,.95)'], [W([[CR_BRIDGE - 8, -900], [CR_BRIDGE - 8, 900], [CR_BRIDGE + 8, 900], [CR_BRIDGE + 8, -900]]), 'rgba(40,80,90,.95)'], ...CR_VH.map(([x, z, w, d]) => [W([[x - w / 2, z - d / 2], [x + w / 2, z - d / 2], [x + w / 2, z + d / 2], [x - w / 2, z + d / 2]]), 'rgba(205,190,160,.95)'])],
    lines: [[W([[-150, 0], [-700, 0]]), 3, 'rgba(150,130,96,.9)'], [W(CR_JEEP), 3, 'rgba(150,130,96,.9)'], [W(tl), 2.5, 'rgba(90,60,40,.95)'], [W([[xf, 0], [xf + CR_BLEN, 0]]), 4, 'rgba(60,64,50,1)']] });
}
function crEnd(win, why) {
  const stats = [[STATS.kills, 'אויבים נפגעו'], [Math.round(CR.br * 100), 'גשר הגלילים %'], [CR.stage + 1, 'השלב שהגעתם אליו']];
  if (win) return ['גשר הגלילים מונח', 'גשר הגלילים — כ־200 מטר של גלילי פלדה — נקרע בדרך אל התעלה ב־16 באוקטובר 1973, תוקן תחת הפגזה, ונגרר אל המים בידי גדוד 410. בלילה שבין 18 ל־19 באוקטובר, בסביבות 01:00, הוא הונח כקילומטר צפונית לגשר הדוברות. באותם ימים נלחמו צנחני חטיבה 247 בכפרים ובבתים שלאורך התעלה כדי להרחיב את ראש הגשר; גדוד 565 החזיק בבתי סרפאום מול הסתערויות, עד שחולץ. מעל שני הגשרים עברו אוגדות שלמות לגדה המערבית.', stats];
  return ['נפגעת', ['תנו למקלע לעבוד: צרורות ארוכים על העמדות בגדה, והחוליות המסומנות באדום קודם.', 'במארב — קודם הבזוקות. הן מסומנות באדום.', 'בכפר: חלון אחרי חלון, ורימון לפני כל דלת. הדלתות רחבות — אל תעמדו בתוכן.', 'מהחלון — לירות ולרדת. רימון על מי שמגיע עד החומה הנמוכה.', 'הטנקים בדרך. עוד כמה שניות של אש מהחלונות.'][CR.stage] || '', stats];
}
function crSnapOK() { if (CR.stage === 0) return false; if (CR.stage === 1 && CHAP.cross.jeeps.some((v) => v.onRaft)) return false; return true; }
function crSnapAfter() { crRepEnd(); crBridgePose(0); if (CR.stage !== 3) meter(null); CR.filmTod = null; }
CHAP.cross = { stages: CR_STAGES, st: () => CR.stage, cp: () => CHAP.cross.cpN || 0, upd: crUpd, obj: crObj, hints: crHints, items: crItems, mini: crMini, restore: fieldRestore, end: crEnd, tank: false, night: true, snapOK: crSnapOK, snapAfter: crSnapAfter,
  stableTag: () => 'למחסה',
  tod: () => { const m = CR.filmTod != null ? CR.filmTod : CR_TOD[CR.stage] + CHAP.cross.t / (CR.stage >= 3 ? 20 : 6); return (((m % 1440) + 1440) % 1440) - START_MIN; },
  build: () => chapterBuild(CHAP.cross, crBuild), setup: crSetup, clock: CR_CLOCK[0], toast: ['18–19 באוקטובר 1973 · גשר הצליחה', 'גשר הגלילים מחכה על הגדה. צריך להחזיק את הצד שממול'], start: () => { CR.introSeen = false; fieldStart('cross'); } };
