
/* ================= chapter 5: the Hermon, 22 October 1973 =================
   Golani climb from Majdal Shams to take back the outpost that fell on the first day of the war. On the road, Syrian commandos lie in wait
   by the roadside and snipers sit on the rocks; at the cable-car station the fighting is room to room. Then the post itself, layer by layer:
   an outer ring of trench, an inner ring with sangars in the yard, a bunker of eight rooms sunk into the rock, the terrace and the three
   upper rooms on its slab, and last the roof, where the Syrians dug in behind stone baskets. Every position is manned before the player
   can see it: the defenders wait hidden and come alive as the fight reaches them - nothing appears out of thin air. */
const HM = { o: { x: 0, z: 11000 }, stage: 0, msgs: {} };
const HW = toWorld(HM.o);
const HM_STAGES = [
  { title: 'בעלייה', sub: 'עוד חושך, וקר. הציר ממג׳דל שמס מתפתל במעלה ההר, ובצדי הדרך, בין הסלעים, שוכב הקומנדו הסורי ומחכה. קטע אחרי קטע, סלע אחרי סלע.', goal: 'נקו קטע, רוצו לקטע הבא (◆). הקומנדו בצדי הדרך ועל הסלעים' },
  { title: 'הטבעת החיצונית', sub: 'הגדר של המוצב. התעלה החיצונית מתפתלת סביבו, עמדה אחרי עמדה, בכיוון אחד בלבד — עד תעלת הקשר שמובילה פנימה.', goal: 'בתעלה החיצונית סביב המוצב, עמדה אחרי עמדה, עד תעלת הקשר (◆)' },
  { title: 'אל דלת הבונקר', sub: 'בתעלת הקשר פנימה, אל הטבעת הפנימית. בחצר סנגרים של אבנים, ובסופה דלת הבונקר שהסורים נעלו מאחוריהם.', goal: 'הטבעת הפנימית, הסנגרים בחצר, ואז דלת הבונקר (◆)' },
  { title: 'בתוך ההר', sub: 'מסדרון ארוך, קר ואפל, ושמונה חדרים — כולם מאוישים. רימון לפני כל דלת, הפיצוץ, ואז פנימה. בקצה האולם מדרגות שעולות.', goal: 'חדר אחרי חדר, רימון לפני כל דלת, עד המדרגות באולם הכניסה (◆)' },
  { title: 'המרפסת', sub: 'עולים למרפסת, תחת אש מהגג שמעל. עמדות הגביונים, ואז שלושת החדרים העליונים: התצפית, הקשר והמפות.', goal: 'עמדות הגביונים במרפסת, ואז שלושת החדרים העליונים (◆)' },
  { title: 'הדגל', sub: 'במדרגות החיצוניות לגג. שם הם התבצרו, בין הגביונים והאנטנות, עם הנוף על כל הגליל. עמדה אחרי עמדה, עד התורן.', goal: 'עמדה אחרי עמדה על הגג, עד התורן (◆)' },
];
const HM_ROAD = [[-22, -150], [38, -92], [-26, -30], [34, 34], [-22, 98], [28, 160], [4, 232]], HM_ROAD_S = smoothPath(HM_ROAD, 4);
/* the post: two rings of trench round a bunker of three levels. Both rings are listed clockwise (seen from above, north up), so each bay's
   traverse stands ahead of its man along the ring - the way the attack moves round it */
/* not rings: a spiral. The outer trench runs from the gate round the post and stops short of where it began (the stretch between is earth,
   never dug); a communication trench leads in to the inner trench, which runs round the other way and stops short of its own start, at the
   trench down to the bunker's door. One way in, no way round: every bound in its order, and nothing to reach out of turn */
const HM_RING_O = [[5, 238], [-44, 252], [-60, 290], [-44, 328], [0, 342], [44, 328], [60, 290], [44, 252], [28, 246.3]];
const HM_RING_I = [[24, 264.8], [30, 266], [42, 290], [30, 314], [0, 320], [-30, 314], [-42, 290], [-30, 266], [0, 260]];
// radial trenches: three between the rings; the fourth runs down from the inner ring to the bunker's door; the last is the ramp from the road into the outer ring
const HM_SPURS = [[[28, 246.3], [24, 264.8]], null, null, [[0, 260], [6.5, 271.6]], [[5, 224], [5, 238]]];   // the two radial trenches between the rings are filled in: no short cuts
/* small concrete bunkers sunk into the outer wall of the ring trenches, a firing slit looking back down the trench at whoever comes along it:
   the centre (x, z), the trench point beside it (cx, cz), along the trench (tx, tz) and outward (nx, nz) */
const HM_PILL = (() => { const out = []; for (const [ring, tag, at] of [[HM_RING_O, 'o', [72, 160, 246]], [HM_RING_I, 'i', [58, 142]]]) { const d = densify(ring, 0.5); let acc = 0, k = 0; for (let i = 1; i < d.length && k < at.length; i++) { acc += Math.hypot(d[i][0] - d[i - 1][0], d[i][1] - d[i - 1][1]); if (acc < at[k]) continue; k++; const [px, pz] = d[i], [qx, qz] = d[Math.max(0, i - 4)], l = Math.hypot(px - qx, pz - qz) || 1, tx = (px - qx) / l, tz = (pz - qz) / l; let nx = -tz, nz = tx; if (nx * px + nz * (pz - 290) < 0) { nx = -nx; nz = -nz; } out.push({ x: px + nx * 2.9, z: pz + nz * 2.9, cx: px, cz: pz, tx, tz, nx, nz, ring: tag }); } } return out; })();
const HM_F = { x0: -26, x1: 26, z0: 272, z1: 308 }, HM_DOOR = [6.5, 272], HM_CORR = [287, 293], HM_RX = [[-26, -13], [-13, 0], [0, 13], [13, 26]];
const HM_U = { x0: -22, x1: 22, z0: 293, z1: 308 };                       // the upper block, three rooms on the slab; the terrace is south of it
const HM_STAIR = { x0: 2.5, x1: 11, z0: 282, z1: 286, top: 10.5 };          // the main stair, across the back of the entrance hall, up through the slab onto the terrace (rises toward +x)
const HM_RSTAIR = { x0: 22.4, x1: 25.4, z0: 289, z1: 300, zl: 303 };        // the outside stair to the roof, along the east wall of the upper block (rises toward +z)
const HM_CABLE = [56, 44];
const HM_NAMES = ['אבי', 'גיורא', 'דודי', 'ציון', 'ניסים', 'משה', 'יוסי', 'שמוליק', 'רמי', 'עוזי'];
const hmRock = (r) => [0xb4b2ac, 0x9e9c97, 0xc6c4bd, 0x8c8b86, 0xa9a69e, 0xd0cec6][Math.floor(r() * 6)];
function hmBase(lx, lz) { const cz = clamp(lz, -420, 700), cx = clamp(lx, -260, 260), a = 0.3 * (cz + 200), b = 132 + 0.06 * (cz - 240), ax = Math.abs(cx); return lerp(a, b, smooth(220, 262, cz)) + 0.0009 * cx * cx * (1 - smooth(50, 110, ax)) - 0.28 * Math.max(0, ax - 90) * smooth(80, 140, ax); }
const HM_PY = hmBase(0, 290) + 0.2, HM_L0 = HM_PY - 3.2, HM_U1 = HM_PY + 3.2, HM_RY = HM_U1 + 0.3;
const hmY = (f) => (f === 2 ? HM_RY : f ? HM_PY : HM_L0);
const hmDist = (lx, lz) => { const dx = Math.max(HM_F.x0 - lx, 0, lx - HM_F.x1), dz = Math.max(HM_F.z0 - lz, 0, lz - HM_F.z1); return Math.hypot(dx, dz); };
function hmH(x, z) {
  const lx = x - HM.o.x, lz = z - HM.o.z, base = hmBase(lx, lz);
  let h = base + 2.6 * fbm(lx / 42, lz / 42, 3) + 0.7 * fbm(lx / 9, lz / 9, 2);
  // bare limestone, grey and white; dark thorn cushions; dry yellow grass in the hollows
  mix3([0.64, 0.645, 0.65], [0.52, 0.525, 0.53], smooth(-0.3, 0.5, fbm(lx / 30, lz / 30, 3))); mixIn([0.72, 0.72, 0.7], 0.3 * smooth(0.2, 0.6, fbm(lx / 11, lz / 11, 2))); mixIn([0.5, 0.39, 0.31], 0.2 * smooth(0.15, 0.6, noise(lx / 48 + 3, lz / 48))); mixIn([0.34, 0.37, 0.3], 0.14 * smooth(0.3, 0.7, noise(lx / 25, lz / 25 + 9)));
  { const d = distPolyline(lx, lz, HM_ROAD_S); if (d < 8) { h = lerp(h, base + 0.3 * fbm(lx / 30, lz / 30, 2), 1 - smooth(3.5, 8, d)); mixIn([0.5, 0.47, 0.43], 0.75 * (1 - smooth(2, 4, d))); } }
  // the summit plateau, levelled for the post out past the outer ring; the bunker's lower level sunk into the rock
  { const dp = hmDist(lx, lz); const k = 1 - smooth(42, 78, dp); if (k > 0) { h = lerp(h, HM_PY + 0.25 * fbm(lx / 20, lz / 20, 2) * smooth(4, 16, dp), k); mixIn([0.6, 0.6, 0.59], 0.4 * k); }
    // the trenches: both rings 1.75 m deep, the radial trenches between them, the one to the door running down to the floor of the lower level
    let cut = 0;
    for (const ring of [HM_RING_O, HM_RING_I]) { const dr = distPolyline(lx, lz, ring); if (dr < 3) cut = Math.max(cut, 1.75 * (1 - smooth(1.1, 2.6, dr))); }
    HM_SPURS.forEach((sp, si) => { if (!sp) return; const [a, b] = sp, L = Math.hypot(b[0] - a[0], b[1] - a[1]), t = clamp(((lx - a[0]) * (b[0] - a[0]) + (lz - a[1]) * (b[1] - a[1])) / (L * L), 0, 1), px = a[0] + (b[0] - a[0]) * t, pz = a[1] + (b[1] - a[1]) * t, d = Math.hypot(lx - px, lz - pz);
      if (d < 3) { const depth = si === 4 ? 1.75 * smooth(0, 1, t) : si === 3 ? lerp(1.75, HM_PY - HM_L0, smooth(0.1, 0.9, t)) : 1.75; cut = Math.max(cut, depth * (1 - smooth(1.2, 2.7, d))); } });
    for (const b of HM_PILL) { const u = (lx - b.x) * b.tx + (lz - b.z) * b.tz, v = (lx - b.x) * b.nx + (lz - b.z) * b.nz, e = Math.max(Math.abs(u) - 2.0, Math.abs(v) - 1.6); if (e < 0.8) cut = Math.max(cut, 1.75 * (1 - smooth(0, 0.8, e))); }
    if (cut > 0 && dp > 0.3) { h -= cut; mixIn([0.45, 0.42, 0.36], 0.35 * Math.min(1, cut)); }
    if (dp < 1.8) h = HM_L0 - 0.02;
  }
  return h;
}
function hmBuildKit() {
  const K = { con: [], dark: [], gab: [], wood: [], prop: [], lamps: [] };
  // a straight wall from (a) to (b) in local coordinates, with door gaps [from, to] measured along it
  K.wall = (ax, az, bx, bz, y0, y1, gaps = [], th = 0.35) => {
    const L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L, rot = Math.atan2(-uz, ux); let s = 0; const segs = [];
    for (const [g0, g1] of [...gaps].sort((p, q) => p[0] - q[0])) { if (g0 > s) segs.push([s, g0]); s = g1; } if (s < L) segs.push([s, L]);
    for (const [s0, s1] of segs) { const m = (s0 + s1) / 2, [wx, wz] = HW(ax + ux * m, az + uz * m), len = s1 - s0; K.con.push([new THREE.BoxGeometry(len, y1 - y0, th).rotateY(rot).translate(wx, (y0 + y1) / 2, wz), 0xffffff]); addCollider(wx, wz, len / 2, th / 2, rot, y1, y0); }
    for (const [g0, g1] of gaps) { const m = (g0 + g1) / 2, [wx, wz] = HW(ax + ux * m, az + uz * m); K.con.push([new THREE.BoxGeometry(g1 - g0, 0.6, th).rotateY(rot).translate(wx, y1 - 0.3, wz), 0xffffff]); addCollider(wx, wz, (g1 - g0) / 2, th / 2, rot, y1, y1 - 0.6); }
  };
  K.slab = (x0, x1, z0, z1, y, t = 0.3, collide = true) => { const [a, b] = HW(x0, z0), [c, d] = HW(x1, z1); K.con.push([boxUV(a, c, y - t, y, b, d, 2, 2), 0xd8d4cc]); if (collide) addCollider((a + c) / 2, (b + d) / 2, (c - a) / 2, (d - b) / 2, 0, y, y - t); };
  K.gabion = (lx, lz, w, d, h, y) => { const [wx, wz] = HW(lx, lz); K.gab.push(boxUV(wx - w / 2, wx + w / 2, y, y + h, wz - d / 2, wz + d / 2, 1, 1)); addCollider(wx, wz, w / 2, d / 2, 0, y + h, y - 0.2); };
  K.box = (lx, lz, y, w, h, d, col, list = K.prop, rot = 0) => { const [wx, wz] = HW(lx, lz); list.push([new THREE.BoxGeometry(w, h, d).rotateY(rot).translate(wx, y + h / 2, wz), col]); };
  K.solid = (lx, lz, y, w, h, d, col, list = K.prop, rot = 0) => { K.box(lx, lz, y, w, h, d, col, list, rot); const [wx, wz] = HW(lx, lz); addCollider(wx, wz, w / 2, d / 2, rot, y + h, y); };
  return K;
}
// cover points inside the building belong to a floor, so the defenders stay on their own level
function hmCover(lx, lz, nx, nz, f, h = 1) { const [wx, wz] = HW(lx, lz); const l = Math.hypot(nx, nz) || 1; COVER.push({ x: wx, z: wz, nx: nx / l, nz: nz / l, h, by: null, floor: f, y: hmY(f) }); }
/* ---------- the furniture of the post: bunks, lockers, radio racks, map boards, the kitchen; and the mess the battle left ----------
   door = { z, nz }: the wall the door is in and which way the room extends from it; the defenders get cover flanking the door */
function hmRoom(K, x0, x1, z0, z1, f, kind, r, door = null) {
  const y = hmY(f), cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  if (kind === 'bunks') { for (let i = 0; i < 2; i++) { const bx = x0 + 1.2 + i * 2.6, bz = z1 - 1.2; for (const yy of [0.45, 1.35]) K.box(bx, bz, y + yy, 0.95, 0.12, 2.0, 0x5c6248); for (const [ox, oz] of [[-0.45, -0.95], [0.45, -0.95], [-0.45, 0.95], [0.45, 0.95]]) K.box(bx + ox, bz + oz, y, 0.05, 1.6, 0.05, 0x3c3e36); K.box(bx, bz, y + 0.57, 0.85, 0.14, 1.8, 0x7c7f6c); } K.solid(x1 - 0.5, z0 + 1.2, y, 0.6, 1.9, 1.6, 0x55603f); hmCover(x1 - 1.2, z0 + 1.2, 1, 0, f); hmCover(x0 + 2.5, z1 - 2.6, 0, 1, f); }
  else if (kind === 'radio') { for (let i = 0; i < 3; i++) { const bz = z0 + 1.0 + i * 1.5; K.solid(x1 - 0.45, bz, y, 0.7, 1.9, 1.3, 0x4c5444); for (let j = 0; j < 4; j++) K.box(x1 - 0.82, bz + (j % 2 ? 0.3 : -0.3), y + 0.5 + j * 0.32, 0.04, 0.12, 0.24, j % 3 ? 0x2a2a28 : 0xd8b64a); } K.solid(cx - 0.5, cz, y, 2.2, 0.78, 1.0, 0x6e5a40, K.wood); K.box(cx - 0.5, cz, y + 0.78, 0.5, 0.25, 0.4, 0x3a3e34); hmCover(cx - 0.5, cz - 1.1, 0, -1, f); hmCover(x1 - 1.4, z0 + 2.2, 1, 0, f); }
  else if (kind === 'map') { K.box(x0 + 0.08, cz, y + 0.9, 0.06, 1.3, 2.4, 0xd8cfb4); K.box(x0 + 0.1, cz, y + 1.2, 0.02, 0.5, 1.6, 0x6b8a9a); K.solid(cx, cz, y, 2.6, 0.78, 1.2, 0x7a6448, K.wood); for (let i = 0; i < 4; i++) K.box(cx - 1 + i * 0.66, cz + (i % 2 ? 0.9 : -0.9), y, 0.45, 0.45, 0.45, 0x4a4436); hmCover(cx, cz + 1.0, 0, 1, f); hmCover(cx, cz - 1.0, 0, -1, f); }
  else if (kind === 'kitchen') { K.solid(x0 + 0.45, cz, y, 0.8, 0.9, z1 - z0 - 1.2, 0x8a8a80); for (let i = 0; i < 3; i++) K.box(x0 + 0.45, z0 + 1.2 + i * 1.6, y + 0.9, 0.4, 0.28, 0.4, 0x9a9a92); K.solid(cx + 0.6, cz, y, 1.6, 0.76, 2.6, 0x7a6448, K.wood); hmCover(cx + 1.6, cz, 1, 0, f); }
  else if (kind === 'store') { for (let i = 0; i < 6; i++) { const bx = x0 + 0.7 + (i % 3) * 1.4, bz = z1 - 0.6 - Math.floor(i / 3) * 1.1; K.solid(bx, bz, y, 0.9, 0.5 + (i % 2) * 0.35, 0.6, 0x4d5a34); } for (let i = 0; i < 4; i++) K.box(x1 - 0.6, z0 + 0.7 + i * 0.5, y, 0.36, 0.48, 0.18, 0x435033); hmCover(cx, z1 - 2.4, 0, 1, f); }
  else if (kind === 'obs') { K.solid(cx, z1 - 1.0, y, 1.0, 1.1, 0.6, 0x55524a); K.box(cx, z1 - 1.0, y + 1.1, 0.3, 0.25, 0.9, 0x1a1a1a); K.solid(x0 + 1.2, cz, y, 1.8, 0.78, 1.0, 0x6e5a40, K.wood); hmCover(x0 + 1.2, cz - 1.0, 0, -1, f); hmCover(cx, z1 - 2.0, 0, 1, f); }
  // wide rooms get a second table with stools and a row of lockers on the far side, so the room is not half empty
  if (x1 - x0 > 11) { K.solid(x1 - 3.2, cz + 0.5, y, 1.9, 0.78, 1.0, 0x6e5a40, K.wood); for (const [ox, oz] of [[-0.6, -1.0], [0.6, -1.0], [0, 1.0]]) K.box(x1 - 3.2 + ox, cz + 0.5 + oz, y, 0.36, 0.45, 0.36, 0x6e5a40, K.wood); for (let i = 0; i < 3; i++) K.solid(x1 - 0.45, cz + 2.8 + i * 0.95, y, 0.6, 1.9, 0.85, 0x55603f); hmCover(x1 - 3.2, cz - 0.6, 0, -1, f); K.solid(x0 + 2.2, cz - 0.5, y, 1.0, 0.9, 0.7, 0x4d5a34); hmCover(x0 + 2.2, cz - 1.3, 0, -1, f, 0.9); }
  // and cover flanking the door, inside: the first men in through it are met from both sides
  if (door) { for (const sd of [-1, 1]) { const px = cx + sd * 2.6, pz = door.z + door.nz * 1.1; K.solid(px, pz, y, 1.1, 0.95, 0.6, 0x4d5a34); hmCover(px, pz + door.nz * 0.6, cx - px, door.z - pz - door.nz * 0.6, f, 0.95); } }
  // the battle of the 6th: overturned crates, scorch marks, papers and spent cases on the floor
  for (let i = 0; i < 5; i++) { const px = lerp(x0 + 0.8, x1 - 0.8, r()), pz = lerp(z0 + 0.8, z1 - 0.8, r()); if (r() < 0.5) K.box(px, pz, y, 0.5, 0.32, 0.4, 0x4d5a34, K.prop, r() * 3); else K.box(px, pz, y + 0.01, 0.6 + r() * 0.8, 0.005, 0.5 + r() * 0.6, 0x26221e, K.prop, r() * 3); }
  K.box(cx, cz, y + 2.55, 0.12, 0.12, 0.12, 0xfff2c8); K.lamps.push([cx, cz, y + 2.4]);
  hmRoomMore(K, x0, x1, z0, z1, f, kind); hmRoomProps(x0, x1, z0, z1, f, kind, r);
}
/* the rest of the furniture: a post that men lived in for months is full - tables and stools, shelves, stoves with their pipes, a generator, barrels, boards */
function hmRoomMore(K, x0, x1, z0, z1, f, kind) {
  const y = hmY(f), cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  const shelf = (lx, lz, w, d, hs) => { for (const h of hs) K.box(lx, lz, y + h, w, 0.03, d, 0x8a7a5a, K.wood); };
  const stove = (lx, lz) => { K.solid(lx, lz, y, 0.55, 0.6, 0.5, 0x3a3a36); K.box(lx, lz, y + 0.6, 0.12, 1.9, 0.12, 0x2a2a28); K.box(lx, lz - 0.2, y + 2.4, 0.12, 0.12, 0.5, 0x2a2a28); };
  const stool = (lx, lz) => K.box(lx, lz, y, 0.36, 0.45, 0.36, 0x6e5a40, K.wood);
  if (kind === 'bunks') { K.solid(cx, z0 + 1.6, y, 1.2, 0.76, 0.8, 0x6e5a40, K.wood); stool(cx - 0.9, z0 + 1.6); stool(cx + 0.9, z0 + 1.6); stove(x0 + 0.6, z0 + 0.6); shelf(cx + 1.5, z0 + 0.2, 2.4, 0.3, [1.4, 1.85]); for (let i = 0; i < 3; i++) K.box(x1 - 0.2, z0 + 2.4 + i * 0.5, y + 1.6, 0.06, 0.06, 0.06, 0x2a2a28); }
  else if (kind === 'radio') { K.solid(cx + 1.6, z1 - 0.75, y, 1.9, 0.76, 0.8, 0x6e5a40, K.wood); stool(cx + 1.0, z1 - 1.5); stool(cx - 0.5, cz - 1.0); K.solid(x0 + 0.7, z1 - 0.7, y, 0.9, 0.7, 0.6, 0x3a3a30); K.box(x0 + 0.7, z1 - 0.7, y + 0.7, 0.3, 0.1, 0.3, 0x2a2a28); for (let i = 0; i < 4; i++) K.box(x0 + 1.2 + i * 1.2, z1 - 0.4, y + 0.01, 1.3, 0.02, 0.03, 0x1a1a1a); shelf(x0 + 1.6, z0 + 0.2, 2.6, 0.3, [1.3, 1.75]); }
  else if (kind === 'map') { for (const [lx, lz] of [[cx - 0.9, cz - 1.0], [cx + 0.6, cz - 1.0], [cx, cz + 1.0]]) stool(lx, lz); K.solid(x1 - 0.4, z0 + 0.8, y, 0.5, 1.3, 0.6, 0x4a5a4a); K.box(x1 - 0.08, cz + 1.2, y + 0.9, 0.06, 1.1, 1.6, 0xd8cfb4); K.box(x1 - 0.1, cz + 1.2, y + 1.15, 0.02, 0.5, 1.2, 0x6b8a9a); shelf(cx, z1 - 0.2, 3.0, 0.3, [1.5, 1.9]); }
  else if (kind === 'kitchen') { shelf(x0 + 0.45, cz, 0.3, z1 - z0 - 1.6, [1.5, 1.9]); K.solid(x1 - 0.6, z1 - 0.7, y, 0.9, 1.1, 0.9, 0x6a7a8a); K.box(x1 - 0.6, z1 - 0.7, y + 1.1, 0.9, 0.06, 0.9, 0x5a6a7a); stove(x1 - 0.6, z0 + 0.6); for (const [lx, lz] of [[cx + 1.6, cz - 0.9], [cx - 0.4, cz + 0.9], [cx + 1.6, cz + 0.9]]) stool(lx, lz); K.solid(x0 + 2.2, z1 - 0.6, y, 1.2, 0.9, 0.6, 0x9a9a92); K.box(x0 + 2.2, z1 - 0.6, y + 0.9, 1.0, 0.06, 0.5, 0x7a7a74); }
  else if (kind === 'store') { for (let i = 0; i < 3; i++) K.solid(x0 + 0.6 + i * 0.75, z0 + 0.7, y, 0.6, 0.9, 0.6, 0x46503f); for (let i = 0; i < 3; i++) { const [wx, wz] = HW(x1 - 0.6, z0 + 0.6 + i * 0.75); K.prop.push([G.cyl(0.3, 0.3, 0.9, 12), i % 2 ? 0x46503f : 0x5a4a30, M4(wx, y + 0.45, wz)]); addCollider(wx, wz, 0.32, 0.32, 0, y + 0.9, y); } shelf(cx, z1 - 0.2, 3.2, 0.35, [1.2, 1.6, 2.0]); K.solid(cx, cz, y, 1.4, 0.5, 1.0, 0x4d5a34); }
  else if (kind === 'obs') { K.solid(cx + 1.6, cz - 0.9, y, 1.6, 0.45, 0.4, 0x6e5a40, K.wood); K.box(x0 + 0.08, cz + 1.4, y + 0.9, 0.06, 1.0, 1.4, 0xd8cfb4); K.box(x0 + 0.1, cz + 1.4, y + 1.15, 0.02, 0.5, 1.0, 0x6b8a9a); stool(x0 + 1.2, cz - 0.9); stove(x1 - 0.6, z0 + 0.6); shelf(cx, z0 + 0.2, 2.0, 0.3, [1.5]); }
}
/* the small things of the post, room by room: everything the Syrians found there and everything they brought */
function hmRoomProps(x0, x1, z0, z1, f, kind, r) {
  const y = hmY(f), cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, seed = Math.round(x0 * 7 + z0 * 3 + f * 101);
  const P = (k, lx, lz, yy, rot = 0, floor = y) => { const [x, z] = HW(lx, lz); return propAdd('hermon', k, x, yy, z, rot, floor); };
  const On = (kinds, lx, lz, yy, w, d, sd) => { const [x, z] = HW(lx, lz); return propsOn('hermon', kinds, x, z, yy, w, d, 0, sd, y); };
  const W = (k, lx, yy, lz, ry, sd = 1) => { const [x, z] = HW(lx, lz); return propWall('hermon', k, x, yy, z, ry, sd, 'e'); };
  const E = Math.PI / 2, Wf = -Math.PI / 2, S = 0, N = Math.PI;   // facing +x, -x, +z, -z
  if (kind === 'bunks') {
    for (let i = 0; i < 2; i++) { const bx = x0 + 1.2 + i * 2.6, bz = z1 - 1.2; P('pillow', bx, bz - 0.75, y + 0.64, 0.1 * i); P('blanketF', bx, bz + 0.2, y + 0.64, 0.2); P('books', bx + 0.3, bz + 0.75, y + 0.64, 0.4); P('blanket', bx, bz + 0.3, y + 1.41, 0.1); P('pack', bx, bz - 0.6, y + 1.41, 1.5 + i); P('boots', bx + 0.6, bz - 0.95, y, 0.3); P('helmet', bx - 0.5, bz - 1.15, y, 0.8); P('canteen', bx + 0.2, bz - 1.2, y); }
    P('frame', x1 - 0.5, z0 + 1.0, y + 1.9, 0.2); P('lamp', x1 - 0.5, z0 + 1.5, y + 1.9); On(['cards', 'cups', 'ashtray', 'candle', 'backgammon'], cx, z0 + 1.6, y + 0.76, 1.1, 0.7, seed + 1); On(['books', 'canteen', 'frame', 'cigs', 'thermos'], cx + 1.5, z0 + 0.2, y + 1.42, 2.2, 0.26, seed + 2); On(['helmet', 'mess', 'books', 'lamp'], cx + 1.5, z0 + 0.2, y + 1.87, 2.2, 0.26, seed + 3); P('kettle', x0 + 0.6, z0 + 0.6, y + 0.62, 0.3); P('pot', x0 + 0.6, z0 + 0.35, y + 0.62, 0); for (let i = 0; i < 3; i++) P('helmet', x1 - 0.35, z0 + 2.4 + i * 0.5, y + 1.42, 0.5 + i, y); P('cigs', x0 + 2.9, z0 + 1.3, y); P('jerry', x0 + 0.6, z0 + 0.7, y, 0.2); P('bucket', x1 - 1.6, z0 + 0.6, y); P('radio', x0 + 3.0, z0 + 2.0, y, 2.6);
    W('calendar', x0 + 0.03, y + 1.6, z0 + 2.0, E, 2); W('portrait', cx, y + 1.75, z0 + 0.03, S, 5); W('clock', x1 - 0.03, y + 2.0, z1 - 2.2, Wf);
  } else if (kind === 'radio') {
    On(['radioBig', 'phone', 'papers', 'headset', 'cups', 'lamp', 'cigs', 'thermos'], cx - 0.5, cz, y + 0.78, 2.1, 1.0, seed);
    for (let i = 0; i < 3; i++) P('headset', x1 - 0.82, z0 + 1.0 + i * 1.5 + 0.45, y + 0.5 + 0.34, 0.3 * i, y); On(['radioBig', 'phone', 'headset', 'papers', 'lamp', 'cups'], cx + 1.6, z1 - 0.75, y + 0.76, 1.8, 0.7, seed + 4); P('jerry', x0 + 0.4, z1 - 1.3, y, 0.3); P('oilcan', x0 + 1.3, z1 - 0.5, y); On(['books', 'papers', 'canteen', 'cans', 'tclock'], x0 + 1.6, z0 + 0.2, y + 1.32, 2.4, 0.26, seed + 5); On(['maptube', 'books', 'lamp', 'cigs'], x0 + 1.6, z0 + 0.2, y + 1.77, 2.4, 0.26, seed + 6); P('ammo', x0 + 0.6, z1 - 0.6, y, 0.2); P('jerry', x0 + 1.1, z1 - 0.6, y, 0.3); P('helmet', x0 + 0.5, z0 + 0.6, y, 1.0); P('pack', x0 + 1.0, z0 + 0.5, y, 2.0); P('crateS', cx + 1.5, z1 - 0.7, y, 0.1); P('radio', cx + 1.5, z1 - 0.7, y + 0.33, 0.4);
    W('map', cx, y + 1.65, z0 + 0.03, S, 3); W('clock', x0 + 1.0, y + 2.05, z0 + 0.03, S); W('portrait', x0 + 0.03, y + 1.75, cz, E, 6); W('calendar', x0 + 0.03, y + 1.5, cz + 1.4, E, 1);
  } else if (kind === 'map') {
    On(['papers', 'maptube', 'maptube', 'phone', 'binocs', 'lamp', 'cups', 'ashtray', 'typewriter', 'books'], cx, cz, y + 0.78, 2.5, 1.1, seed);
    P('helmet', cx - 1, cz - 0.9, y + 0.45, 0.4); P('radio', cx + 0.98, cz + 0.9, y + 0.45, 0.3); P('papers', x1 - 0.4, z0 + 0.8, y + 1.3, 0.3); P('phone', x1 - 0.5, z0 + 0.6, y + 1.3, 0.1); On(['books', 'maptube', 'binocs', 'cans', 'lamp', 'papers'], cx, z1 - 0.2, y + 1.52, 2.8, 0.26, seed + 7); On(['bottles', 'cups', 'tclock', 'books'], cx, z1 - 0.2, y + 1.92, 2.8, 0.26, seed + 8); P('jerry', x1 - 0.6, z1 - 0.6, y, 0.3); P('pack', x1 - 0.7, z0 + 0.7, y, 1.1); P('crateS', x0 + 0.9, z1 - 0.7, y, 0.3); P('papers', x0 + 0.9, z1 - 0.7, y + 0.33, 0.8); P('thermos', x0 + 1.2, z1 - 0.9, y + 0.33);
    W('portrait', cx + 2.0, y + 1.75, z1 - 0.03, N, 4); W('clock', x1 - 0.03, y + 2.0, cz, Wf); W('map', x1 - 0.03, y + 1.5, cz - 1.8, Wf, 9);
  } else if (kind === 'kitchen') {
    for (let i = 0; i < 3; i++) P(['pot', 'pan', 'kettle'][i], x0 + 0.45, z0 + 1.2 + i * 1.6, y + 1.18, 0.3 * i); for (let i = 0; i < 2; i++) { const bz = z0 + 2.0 + i * 1.6; P(['plates', 'jug'][i], x0 + 0.35, bz, y + 0.9, 0); P(['cans', 'cups'][i], x0 + 0.6, bz + 0.4, y + 0.9, 0.3); P(['bottles', 'basket'][i], x0 + 0.45, bz - 0.4, y + 0.9, 0.1); }
    On(['plates', 'glasses', 'teapot', 'backgammon', 'bottle', 'basket', 'fruit', 'cards', 'cups'], cx + 0.6, cz, y + 0.76, 1.5, 2.5, seed);
    On(['cans', 'bottles', 'plates', 'jug', 'cans', 'basket', 'bottle'], x0 + 0.45, cz, y + 1.52, 0.26, z1 - z0 - 1.8, seed + 9); On(['bottles', 'cans', 'tin', 'cups', 'teapot', 'cans'], x0 + 0.45, cz, y + 1.92, 0.26, z1 - z0 - 1.8, seed + 10); P('bucket', x1 - 0.6, z1 - 1.5, y, 0.2); P('cups', x1 - 0.4, z1 - 0.7, y + 1.16, 0, y); P('pot', x1 - 0.6, z0 + 0.6, y + 0.62, 0.3); P('kettle', x1 - 0.4, z0 + 0.4, y + 0.62, 0); On(['plates', 'pan', 'bottles', 'mess'], x0 + 2.2, z1 - 0.6, y + 0.93, 1.0, 0.5, seed + 11);
    P('bucket', x0 + 1.2, z0 + 0.6, y); P('sack', x1 - 0.8, z1 - 0.7, y, 0.3); P('sack', x1 - 0.9, z1 - 1.4, y, 1.4); P('jerry', x1 - 0.6, z0 + 0.8, y, 0.2); P('tin', x1 - 0.6, z0 + 1.3, y, 0.1); P('crateS', x0 + 1.6, z1 - 0.7, y, 0.4); P('cans', x0 + 1.6, z1 - 0.7, y + 0.33, 0.2); P('primus', x0 + 1.4, z1 - 1.5, y); P('oilcan', x0 + 1.9, z1 - 1.3, y);
    W('calendar', x1 - 0.03, y + 1.6, cz, Wf, 1); W('clock', cx, y + 2.05, z1 - 0.03, N);
  } else if (kind === 'store') {
    for (let i = 0; i < 6; i++) { const bx = x0 + 0.7 + (i % 3) * 1.4, bz = z1 - 0.6 - Math.floor(i / 3) * 1.1, top = y + 0.5 + (i % 2) * 0.35; P(['ammo', 'jerry', 'cans', 'blanket', 'helmet', 'sack'][i], bx, bz, top, 0.4 * i); }
    for (let i = 0; i < 3; i++) P(['ammo', 'jerry', 'cans'][i], x0 + 0.6 + i * 0.75, z0 + 0.7, y + 0.9, 0.3 * i); for (const [h, ks] of [[1.2, ['ammo', 'ammo', 'cans', 'jerry', 'tin']], [1.6, ['bottles', 'cans', 'blanket', 'mess', 'cans']], [2.0, ['helmet', 'helmet', 'pack', 'blanket']]]) On(ks, cx, z1 - 0.2, y + h + 0.02, 3.0, 0.3, seed + h * 10); P('blanketF', cx - 0.3, cz, y + 0.5, 0.2); P('helmet', cx + 0.4, cz + 0.2, y + 0.5, 0.6);
    P('jerry', x0 + 0.5, z0 + 0.6, y, 0.2); P('jerry', x0 + 0.95, z0 + 0.6, y, -0.1); P('sack', cx, z0 + 0.8, y, 0.7); P('sack', cx + 0.6, z0 + 1.2, y, 1.9); P('tin', x1 - 1.2, z0 + 0.6, y, 0.2); P('oilcan', x1 - 1.5, z0 + 1.0, y); P('crateS', cx - 1.5, z0 + 1.1, y, 0.3); P('bottles', cx - 1.5, z0 + 1.1, y + 0.33, 0.2); P('lamp', cx - 1.2, z0 + 0.9, y + 0.33);
    W('calendar', x0 + 0.03, y + 1.6, cz, E, 2);
  } else if (kind === 'obs') {
    On(['binocs', 'papers', 'phone', 'lamp', 'cups', 'maptube', 'headset', 'cigs'], x0 + 1.2, cz, y + 0.78, 1.7, 0.9, seed);
    P('helmet', x1 - 0.8, z0 + 0.6, y, 0.4); P('ammo', x1 - 0.7, z0 + 1.1, y, 0.1); P('jerry', x0 + 0.5, z0 + 0.5, y, 0.3); On(['pack', 'helmet', 'canteen', 'blanket'], cx + 1.6, cz - 0.9, y + 0.45, 1.4, 0.3, seed + 12); On(['books', 'binocs', 'cans', 'lamp'], cx, z0 + 0.2, y + 1.52, 1.8, 0.26, seed + 13); P('kettle', x1 - 0.6, z0 + 0.6, y + 0.62, 0.2); P('cups', x1 - 0.3, z0 + 0.9, y + 0.62, 0, y); P('thermos', x0 + 0.4, cz + 0.6, y + 0.78); P('radio', x1 - 0.8, cz + 0.6, y, 1.9);
    W('map', x0 + 0.03, y + 1.6, cz, E, 10); W('clock', cx, y + 2.05, z0 + 0.03, S);
  }
}
function hmBuild() {
  const C = CHAP.hermon; C.ground = makeGround({ x0: HM.o.x - 230, x1: HM.o.x + 230, z0: HM.o.z - 210, z1: HM.o.z + 345, step: 1.6, h: hmH }); GROUND = C.ground;
  const BAGS = [], sv = BATCH.bag; BATCH.bag = BAGS; const k0 = COVER.length; C.slots = [];
  const K = hmBuildKit(), r = rng(2210), stone = [], L = (x, z) => [x - HM.o.x, z - HM.o.z], y0 = HM_L0, y1 = HM_PY, u0 = HM_PY, u1 = HM_U1, yR = HM_RY;
  const { x0, x1, z0, z1 } = HM_F, [c0, c1] = HM_CORR, [dx, dz] = HM_DOOR, U = HM_U, ST = HM_STAIR, RS = HM_RSTAIR;
  // ---- the lower level, sunk into the rock: a 6 m corridor east to west, four rooms on each side, the entrance hall with the stair at the south door ----
  K.wall(x0, z1, x1, z1, y0 - 0.4, y1, [], 0.6); K.wall(x0, z0, x1, z0, y0 - 0.4, y1, [[dx - x0 - 1.3, dx - x0 + 1.3]], 0.6);
  K.wall(x0, z0, x0, z1, y0 - 0.4, y1, [], 0.6); K.wall(x1, z0, x1, z1, y0 - 0.4, y1, [], 0.6);
  const doorAt = (a, b) => [(a + b) / 2 - x0 - 1.0, (a + b) / 2 - x0 + 1.0];
  K.wall(x0, c1, x1, c1, y0, y1 - 0.3, HM_RX.map(([a, b]) => doorAt(a, b)));                                            // the north wall of the corridor: a door into each room
  K.wall(x0, c0, x1, c0, y0, y1 - 0.3, [...HM_RX.filter((rr) => rr[0] !== 0).map(([a, b]) => doorAt(a, b)), [1.2 - x0, 11.8 - x0]]);   // south: three doors and the wide opening of the hall
  for (const x of [-13, 0, 13]) { K.wall(x, c1, x, z1, y0, y1 - 0.3, x === 0 ? [] : [[7, 9]]); K.wall(x, z0, x, c0, y0, y1 - 0.3, x === -13 ? [[6, 8]] : []); }   // partitions, two of them with a connecting door
  K.con.push([boxUV(...[HW(x0, z0)[0], HW(x1, z1)[0]], y0 - 0.02, y0, ...[HW(x0, z0)[1], HW(x1, z1)[1]], 2, 2), 0x8e8a82]);   // the floor
  // the main stair: in the hall, rising east onto the terrace through a hole in the slab; stringer walls along its sides, a step rail at the top
  { const [a, b] = HW(ST.x0, ST.z0), [c, d] = HW(ST.x1, ST.z1); addRamp(a, c, b, d, 'x', a, HW(ST.top, 0)[0], y0, y1);
    const n = 14, run = ST.top - ST.x0; for (let i = 0; i < n; i++) { const xx = ST.x0 + (i + 0.5) * run / n, [sx, sz] = HW(xx, (ST.z0 + ST.z1) / 2); K.con.push([new THREE.BoxGeometry(run / n + 0.02, 0.2, ST.z1 - ST.z0).translate(sx, y0 + (i + 1) / n * (y1 - y0) - 0.1, sz), 0x9a968c]); }
    for (let i = 0; i < 4; i++) { const xa = ST.x0 + i * run / 4, xb = xa + run / 4, top = y0 + (i + 1) / 4 * (y1 - y0) + 0.95; for (const zz of [ST.z0, ST.z1]) K.wall(xa, zz, xb, zz, y0 - 0.2, top, [], 0.16); }
    for (let i = 0; i < 4; i++) { const h = Math.max(0.25, (i + 0.15) / 4 * (y1 - y0)), [bx, bz] = HW(ST.x0 + (i + 0.5) * run / 4, (ST.z0 + ST.z1) / 2); K.con.push([new THREE.BoxGeometry(run / 4, h, ST.z1 - ST.z0 - 0.1).translate(bx, y0 + h / 2, bz), 0x8e8a82]); }   // the solid under the steps
    K.wall(ST.x1, ST.z0, ST.x1, ST.z1, y0, y1 - 0.45, [], 0.12);   // the high end is closed below, so nobody walks in under the steps
  }
  // the slab, split round the stair hole; the terrace apron 3.8 m wide all round, with the strip for the door trench left open; the lower level's walls hold it up
  K.slab(x0 - 0.3, x1 + 0.3, ST.z1, z1 + 0.3, y1, 0.3); K.slab(x0 - 0.3, x1 + 0.3, z0 - 0.3, ST.z0, y1, 0.3); K.slab(x0 - 0.3, ST.x0, ST.z0, ST.z1, y1, 0.3); K.slab(ST.x1, x1 + 0.3, ST.z0, ST.z1, y1, 0.3);
  { const A = 3.8, t = 0.7; for (const [a, b, c, d] of [[x0 - A, dx - 1.6, z0 - A, z0 - 0.3], [dx + 1.6, x1 + A, z0 - A, z0 - 0.3], [x0 - A, x1 + A, z1 + 0.3, z1 + A], [x0 - A, x0 - 0.3, z0 - 0.3, z1 + 0.3], [x1 + 0.3, x1 + A, z0 - 0.3, z1 + 0.3]]) K.slab(a, b, c, d, y1, t, false);
    // the walkable surfaces: the slab and apron, minus the stair hole and the door strip
    const F = (a, b, c, d, y) => { const [p, q] = HW(a, c), [s, t2] = HW(b, d); addFloor(p, s, q, t2, y); };
    F(x0 - 3.2, x1 + 3.2, ST.z1, z1 + 3.2, y1); F(x0 - 3.2, dx - 1.6, z0 - 3.2, ST.z0, y1); F(dx + 1.6, x1 + 3.2, z0 - 3.2, ST.z0, y1); F(x0 - 3.2, ST.x0, ST.z0, ST.z1, y1); F(ST.x1, x1 + 3.2, ST.z0, ST.z1, y1); F(dx - 1.6, dx + 1.6, z0 - 0.3, ST.z0, y1);
    // the concrete-walled approach: the last stretch of the door trench between retaining walls
    { const [a, b] = HM_SPURS[3], ux = b[0] - a[0], uz = b[1] - a[1], l = Math.hypot(ux, uz), nx = -uz / l, nz = ux / l; for (const sd of [-1, 1]) K.wall(a[0] + ux * 0.35 + nx * sd * 1.5, a[1] + uz * 0.35 + nz * sd * 1.5, b[0] + nx * sd * 1.5, b[1] + nz * sd * 1.5, y0 - 0.3, y1 + 0.25, [], 0.4); }
    // a low wall round the stair hole on the terrace, open on the east where the stair comes out
    K.wall(ST.x0, ST.z0, ST.x0, ST.z1, y1, y1 + 0.9, [], 0.15); K.wall(ST.x0, ST.z0, ST.x1 - 0.5, ST.z0, y1, y1 + 0.9, [], 0.15); K.wall(ST.x0, ST.z1, ST.x1 - 0.5, ST.z1, y1, y1 + 0.9, [], 0.15);
  }
  // the rooms of the lower level: the door of each is on the corridor wall
  const RK_N = ['bunks', 'store', 'radio', 'bunks'], RK_S = ['kitchen', 'map', null, 'bunks'];
  HM_RX.forEach(([a, b], i) => { hmRoom(K, a, b, c1, z1, 0, RK_N[i], r, { z: c1, nz: 1 }); if (RK_S[i]) hmRoom(K, a, b, z0, c0, 0, RK_S[i], r, { z: c0, nz: -1 }); });
  // the entrance hall: crates to fight from, a sign for the stair
  for (const [lx, lz] of [[1.4, 279.4], [11.6, 279.4]]) K.solid(lx, lz, y0, 1.1, 0.95, 0.7, 0x4d5a34); hmCover(1.4, 280.1, 5.1, -7.1, 0, 0.95); hmCover(11.6, 280.1, -5.1, -7.1, 0, 0.95); hmCover(1.0, 274.5, 5.5, 8, 0, 0.6);
  for (const [lx, lz] of [[12.2, 274.5], [12.2, 275.6], [1.2, 286.2]]) K.solid(lx, lz, y0, 0.9, 0.5, 0.6, 0x4d5a34);
  { const [sx, sz] = HW(12.6, 284); sign('↑ לגג', 'plain', sx, y0 + 2.0, sz, -Math.PI / 2, 1.3); const [tx, tz] = HW(6.5, 292.85); sign('← המסדרון →', 'plain', tx, y0 + 2.2, tz, Math.PI, 1.6); }
  for (const x of [-20, -7, 7, 20]) { K.box(x, (c0 + c1) / 2, y0 + 2.6, 0.12, 0.12, 0.12, 0xfff2c8); } K.lamps.push([-14, 290, y0 + 2.5], [14, 290, y0 + 2.5]);
  // the Syrians' barricades in the corridor: sandbags across half its width, a man behind each
  for (const [x, sd] of [[-16, 1], [-3, -1], [18, 1]]) { const [wx, wz] = HW(x, 290 + sd * 1.3); for (let k = 0; k < 12; k++) BAGS.push([wx + ((k % 6) - 2.5) * 0.52, y0 + 0.1 + Math.floor(k / 6) * 0.2, wz, 0]); addCollider(wx, wz, 1.6, 0.25, 0, y0 + 0.5, y0 - 0.2); hmCover(x + 0.7, 290 + sd * 1.3, -1, 0, 0, 0.5); }
  // ---- the upper level: three rooms in a block on the slab, their doors onto the terrace; slit windows north, over Syria ----
  K.wall(U.x0, U.z1, U.x1, U.z1, u0, u1); K.wall(U.x0, U.z0, U.x1, U.z0, u0, u1, [-15, 0, 15].map((x) => [x - U.x0 - 1.0, x - U.x0 + 1.0])); K.wall(U.x0, U.z0, U.x0, U.z1, u0, u1); K.wall(U.x1, U.z0, U.x1, U.z1, u0, u1);
  K.wall(-8, U.z0, -8, U.z1, u0, u1, [[7, 9]]); K.wall(8, U.z0, 8, U.z1, u0, u1, [[7, 9]]);
  K.slab(U.x0 - 0.3, U.x1 + 0.3, U.z0 - 0.3, U.z1 + 0.3, yR, 0.3);
  hmRoom(K, U.x0, -8, U.z0, U.z1, 1, 'obs', r, { z: U.z0, nz: 1 }); hmRoom(K, -8, 8, U.z0, U.z1, 1, 'radio', r, { z: U.z0, nz: 1 }); hmRoom(K, 8, U.x1, U.z0, U.z1, 1, 'map', r, { z: U.z0, nz: 1 });
  for (const lx of [-15, -5, 5, 15]) K.box(lx, U.z1 + 0.05, u0 + 1.4, 2.2, 0.06, 0.1, 0x101010);
  { const [a, b] = HW(U.x0 - 0.3, U.z0 - 0.3), [c, d] = HW(U.x1 + 0.3, U.z1 + 0.3); addFloor(a, c, b, d, yR); }
  // the outside stair to the roof, along the east wall: concrete steps, a parapet on its outer side rising with it, a landing with its own parapet
  { const [a, b] = HW(RS.x0 - 0.2, RS.z0), [c, d] = HW(RS.x1, RS.z1); addRamp(a, c, b, d, 'z', b, d, y1, yR);
    const n = 16, run = RS.z1 - RS.z0; for (let i = 0; i < n; i++) { const zz = RS.z0 + (i + 0.5) * run / n, [sx, sz] = HW((RS.x0 + RS.x1) / 2, zz); K.con.push([new THREE.BoxGeometry(RS.x1 - RS.x0, 0.2, run / n + 0.02).translate(sx, y1 + (i + 1) / n * (yR - y1) - 0.1, sz), 0x9a968c]); }
    for (let i = 0; i < 4; i++) { const za = RS.z0 + i * run / 4, zb = za + run / 4, top = y1 + (i + 1) / 4 * (yR - y1) + 1.0; K.wall(RS.x1 + 0.12, za, RS.x1 + 0.12, zb, y1 - 0.2, top, [], 0.25); const [bx, bz] = HW((RS.x0 + RS.x1) / 2, (za + zb) / 2); K.con.push([new THREE.BoxGeometry(RS.x1 - RS.x0, Math.max(0.3, (i + 0.5) / 4 * (yR - y1) - 0.3), run / 4).translate(bx, y1 + Math.max(0.3, (i + 0.5) / 4 * (yR - y1) - 0.3) / 2 - 0.3, bz), 0x8e8a82]); }
    K.slab(RS.x0 - 0.2, RS.x1 + 0.3, RS.z1, RS.zl + 0.3, yR, 0.3); { const [a2, b2] = HW(RS.x0 - 0.2, RS.z1), [c2, d2] = HW(RS.x1 + 0.3, RS.zl + 0.3); addFloor(a2, c2, b2, d2, yR); }
    K.wall(RS.x1 + 0.12, RS.z1, RS.x1 + 0.12, RS.zl + 0.3, yR, yR + 1.0, [], 0.25); K.wall(RS.x0 - 0.2, RS.zl + 0.3, RS.x1 + 0.3, RS.zl + 0.3, yR, yR + 1.0, [], 0.25);
    const [sx, sz] = HW(RS.x1 + 0.3, RS.z0 - 1.2); sign('↑ לגג', 'plain', sx, y1 + 2.1, sz, -Math.PI / 2, 1.3);
  }
  // ---- the gabion blast layer: baskets of stone round the terrace, round the roof, and the firing blocks on the roof ----
  for (let x = x0 - 2.5; x <= x1 + 2.5; x += 1.2) { if (Math.abs(x - dx) > 2.4) K.gabion(x, z0 - 2.6, 1.15, 1.0, 1.1, y1); K.gabion(x, z1 + 2.6, 1.15, 1.0, 1.1, y1); }
  for (let z = z0 - 1.5; z <= z1 + 1.5; z += 1.2) { K.gabion(x0 - 2.6, z, 1.0, 1.15, 1.1, y1); K.gabion(x1 + 2.6, z, 1.0, 1.15, 1.1, y1); }
  for (let x = U.x0 + 0.6; x <= U.x1 - 0.5; x += 1.2) { K.gabion(x, U.z1 - 0.5, 1.15, 1.0, 1.1, yR); K.gabion(x, U.z0 + 0.5, 1.15, 1.0, 1.1, yR); }
  for (let z = U.z0 + 1.7; z <= U.z1 - 1.6; z += 1.2) { K.gabion(U.x0 + 0.5, z, 1.0, 1.15, 1.1, yR); if (z < RS.z1 - 0.8 || z > RS.zl + 0.6) K.gabion(U.x1 - 0.5, z, 1.0, 1.15, 1.1, yR); }
  // the terrace nests: gabion blocks facing the stair exit; the roof blocks facing the landing
  // a gabion block is cover for two: one man at each end of it, both facing the same way
  let nestId = 0;
  const nest = (lx, lz, fx, fz, y, f, grp, long) => { const l = Math.hypot(fx, fz) || 1; fx /= l; fz /= l; K.gabion(lx, lz, long ? 1.0 : 2.4, long ? 2.4 : 1.0, 1.05, y); const [wx, wz] = HW(lx, lz), sx = -fz, sz = fx, id = 'n' + nestId++;
    for (const o of [-0.7, 0.7]) C.slots.push({ x: wx - fx * 0.8 + sx * o, z: wz - fz * 0.8 + sz * o, y, nx: fx, nz: fz, f, b: null, used: false, fox: true, roof: f === 2, p: [wx - fx * 0.85 + sx * o, wz - fz * 0.85 + sz * o], h: [wx - fx * 1.35 + sx * o, wz - fz * 1.35 + sz * o], grp, bay: id }); addCover(wx - fx * 0.75, wz - fz * 0.75, fx, fz, 1.0); };
  nest(-15, 287, 26, -3, y1, 1, 'T2', true); nest(16, 287.5, -5, -3.5, y1, 1, 'T2', false); nest(-7, 290.6, 18, -6.5, y1, 1, 'T2', false); nest(7, 290.6, 4, -6.5, y1, 1, 'T2', false); nest(-21, 281, 32, 3, y1, 1, 'T2', true); nest(21, 276, -10, 8, y1, 1, 'T2', true);
  for (const [lx, lz] of [[12, 297], [12, 304], [4, 297], [4, 304], [-4, 300.5], [-12, 297], [-12, 304], [-18, 300.5]]) nest(lx, lz, 1, 0, yR, 2, 'R2', true);
  nest(18, 306.4, 0.76, -0.65, yR, 2, 'R2', false); nest(18, 294.6, 0.64, 0.77, yR, 2, 'R2', false);
  // antennas, the radar dome on the terrace, the observation cupola on the roof, a water tank in the yard
  for (const [lx, lz, hgt] of [[-31, 300, 22], [31, 280, 28]]) { const [wx, wz] = HW(lx, lz), y = groundAt(wx, wz); for (const [ox, oz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) K.prop.push([G.cyl(0.07, 0.09, hgt, 5), 0x8e8e88, M4(wx + ox * 0.9, y + hgt / 2, wz + oz * 0.9, oz * 0.025, 0, -ox * 0.025)]); for (let k = 1; k < hgt / 1.6; k++) { const yy = y + k * 1.6, w = 0.9 * (1 - k * 1.6 / hgt * 0.35); K.prop.push([G.box(w * 2, 0.04, 0.04), 0x8e8e88, M4(wx, yy, wz - w, 0, 0, k % 2 ? 0.5 : -0.5)], [G.box(w * 2, 0.04, 0.04), 0x8e8e88, M4(wx, yy, wz + w, 0, 0, k % 2 ? -0.5 : 0.5)], [G.box(0.04, 0.04, w * 2), 0x8e8e88, M4(wx - w, yy, wz, k % 2 ? 0.5 : -0.5, 0, 0)], [G.box(0.04, 0.04, w * 2), 0x8e8e88, M4(wx + w, yy, wz, k % 2 ? -0.5 : 0.5, 0, 0)]); } K.prop.push([G.sph(1.3, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.45), 0xd8d8d0, M4(wx, y + hgt * 0.78, wz + 1.1, -1.3, 0, 0)]); addCollider(wx, wz, 1.1, 1.1, 0, y + hgt, y); }
  { const [wx, wz] = HW(-16, 279); K.prop.push([G.sph(3.4, 22, 12, 0, Math.PI * 2, 0, Math.PI * 0.55), 0xe8e8e2, M4(wx, y1 + 0.4, wz)], [G.cyl(3.5, 3.6, 0.6, 22), 0xbab8b0, M4(wx, y1 + 0.3, wz)]); addCollider(wx, wz, 3.0, 3.0, 0, y1 + 3.6, y1); }
  { const [wx, wz] = HW(-7, 300.5); K.prop.push([G.cyl(0.7, 0.7, 1.0, 12), 0x55524a, M4(wx, yR + 0.5, wz)], [G.box(1.0, 0.28, 0.3), 0x1a1a1a, M4(wx, yR + 0.9, wz + 0.5)]); addCollider(wx, wz, 0.75, 0.75, 0, yR + 1.0, yR); }
  { const [wx, wz] = HW(-30, 278), y = groundAt(wx, wz); for (const [ox, oz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) K.prop.push([G.cyl(0.08, 0.08, 3, 5), 0x6e6a60, M4(wx + ox * 1.1, y + 1.5, wz + oz * 1.1)]); K.prop.push([G.cyl(1.6, 1.6, 2.2, 16), 0x8a8a7a, M4(wx, y + 4.1, wz)]); addCollider(wx, wz, 1.4, 1.4, 0, y + 5.2); }
  // ---- the trenches: timber revetments and duckboards, sandbags on the lips of both rings ----
  const lipBag = (pts, off) => pts.map(([x, z], i) => { const j = Math.min(i + 1, pts.length - 1), p = pts[Math.max(0, j - 1)], q = pts[j], dx2 = q[0] - p[0], dz2 = q[1] - p[1], l = Math.hypot(dx2, dz2) || 1; return HW(x - dz2 / l * off, z + dx2 / l * off); });
  const LINES = [HM_RING_O, HM_RING_I, ...HM_SPURS.filter(Boolean)];
  for (const line of LINES) { const d = densify(line, 0.8); for (let i = 0; i < d.length - 1; i++) { if (hmDist(...d[i]) < 2.2) continue; const [ax, az] = d[i], [bx, bz] = d[i + 1], dx2 = bx - ax, dz2 = bz - az, l = Math.hypot(dx2, dz2) || 1, nx = -dz2 / l, nz = dx2 / l, a = Math.atan2(dz2, dx2), [mx, mz] = HW((ax + bx) / 2, (az + bz) / 2), fy = groundAt(mx, mz);
      K.wood.push([G.box(l + 0.02, 0.04, 1.1), 0x9a8466, M4(mx, fy + 0.04, mz, 0, -a, 0)]);
      for (const sd of [-1, 1]) { const lip = groundAt(mx + nx * 2.7 * sd, mz + nz * 2.7 * sd), dep = lip - fy; if (dep < 0.6) continue; if (HM_PILL.some((b) => Math.hypot((ax + bx) / 2 - b.cx, (az + bz) / 2 - b.cz) < 2.4 && nx * sd * b.nx + nz * sd * b.nz > 0.3)) continue; const px = mx + nx * 1.32 * sd, pz = mz + nz * 1.32 * sd, sc = [0x9c9890, 0x8e8a82, 0xa8a49a, 0x86827a][(i + (sd > 0 ? 1 : 0)) % 4];
        K.con.push([new THREE.BoxGeometry(l + 0.06, dep, 0.3).rotateY(-a).translate(px, fy + dep / 2, pz), sc]); if (i % 3 === 0) K.wood.push([G.box(0.13, dep + 0.1, 0.13), 0x8a7458, M4(px - nx * 0.18 * sd, fy + dep / 2, pz - nz * 0.18 * sd)]); if (i % 9 === 4) K.prop.push([G.box(l * 0.9, 0.6, 0.04), 0x7d7f7a, M4(px - nx * 0.17 * sd, fy + dep * 0.6, pz - nz * 0.17 * sd, 0, -a, 0)]); } }
    if (line === HM_RING_O || line === HM_RING_I) { bagWall(lipBag(densify(line, 0.8), 2.55), 2, null, false); bagWall(lipBag(densify(line, 0.8), -2.55), 2, null, false); } }
  // the bays: a traverse of sandbags across the outer half of the trench every so often, a man behind it facing back down the trench
  for (const [line, ring, gap] of [[HM_RING_O, 'o', 14], [HM_RING_I, 'i', 12]]) { const pts = densify(line, 0.8); let acc = gap * 0.5; for (let i = 1; i < pts.length; i++) { acc += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (acc < gap) continue; acc = 0; const [ax, az] = pts[i - 1], [bx, bz] = pts[i], dx2 = bx - ax, dz2 = bz - az, l = Math.hypot(dx2, dz2) || 1, tx = dx2 / l, tz = dz2 / l, nx = -tz, nz = tx, [wx, wz] = HW(bx, bz), g = groundAt(wx, wz);
      if (HM_SPURS.some((sp) => sp && distPolyline(bx, bz, sp) < 4) || HM_PILL.some((b) => Math.hypot(bx - b.cx, bz - b.cz) < 6)) continue;
      bagWall([[wx + nx * 1.45 + tx * 0.9, wz + nz * 1.45 + tz * 0.9], [wx + nx * 0.8 + tx * 0.9, wz + nz * 0.8 + tz * 0.9]], 4, g - 0.05, false);
      for (const o of [0.6, 1.1]) C.slots.push({ x: wx + nx * o, z: wz + nz * o, y: g, nx: -tx, nz: -tz, f: 0, b: null, used: false, fox: true, p: [wx + nx * o - tx * 0.3, wz + nz * o - tz * 0.3], h: [wx + nx * o + tx * 0.4, wz + nz * o + tz * 0.4], grp: 'T', ring, at: [bx, bz], bay: ring + i }); addCover(wx + nx * 0.6 + tx * 0.2, wz + nz * 0.6 + tz * 0.2, -tx, -tz, 0.8); } }
  for (const line of LINES) { const d = densify(line, 2.6); for (let i = 1; i < d.length; i++) { if (hmDist(...d[i]) < 3.5 || HM_PILL.some((b) => Math.hypot(d[i][0] - b.cx, d[i][1] - b.cz) < 4.6)) continue; const [x, z] = d[i], [px, pz] = d[i - 1], a = Math.atan2(z - pz, x - px), sd = i % 2 ? 1 : -1, [wx, wz] = HW(x - Math.sin(a) * 0.85 * sd, z + Math.cos(a) * 0.85 * sd); hmProps(K.prop, K.wood, wx, wz, groundAt(wx, wz) + 0.06, a, r, Math.floor(r() * 10)); } }
  // ---- the trench bunkers: concrete boxes sunk into the outer wall of the rings, roofed with a slab and a layer of earth and bags; a slit
  //      in the trench-side wall looks back down the trench, the door is at its far end. One machine gun in each ----
  HM_PILL.forEach((b, bi) => { const at = (u, v) => [b.x + b.tx * u + b.nx * v, b.z + b.tz * u + b.nz * v], fy = groundAt(...HW(b.cx, b.cz)), W = (u0, v0, u1, v1, y0, y1) => K.wall(...at(u0, v0), ...at(u1, v1), fy + y0, fy + y1, [], 0.35);
    W(-1.7, -1.3, 0.25, -1.3, 0, 1.0); W(-1.7, -1.3, 0.25, -1.3, 1.98, 2.2); W(0.25, -1.3, 0.75, -1.3, 0, 2.2); W(0.75, -1.3, 1.7, -1.3, 1.95, 2.2);
    W(-1.7, 1.3, 1.7, 1.3, 0, 2.2); W(-1.7, -1.3, -1.7, 1.3, 0, 2.2); W(1.7, -1.3, 1.7, 1.3, 0, 2.2);
    const [rx, rz] = HW(b.x, b.z), rot = Math.atan2(-b.tz, b.tx); K.con.push([new THREE.BoxGeometry(3.85, 0.36, 2.95).rotateY(rot).translate(rx, fy + 2.38, rz), 0xc8c4bc]); addCollider(rx, rz, 1.92, 1.47, rot, fy + 2.56, fy + 2.2);
    K.prop.push([new THREE.BoxGeometry(3.4, 0.3, 2.5).rotateY(rot).translate(rx, fy + 2.7, rz), 0x8a8274]);
    bagWall([HW(...at(-1.6, 1.15)), HW(...at(1.6, 1.15))], 1, fy + 2.56, false); bagWall([HW(...at(-1.6, -1.15)), HW(...at(-1.6, 0.9))], 1, fy + 2.56, false);
    const d = [-b.tx * 0.85 - b.nx * 0.5, -b.tz * 0.85 - b.nz * 0.5], dl = Math.hypot(d[0], d[1]), [sx, sz] = HW(...at(-0.75, -0.7)), [pxx, pzz] = HW(...at(-0.85, -0.92)), [hx, hz] = HW(...at(-0.25, 0.25));
    C.slots.push({ x: sx, z: sz, y: fy, nx: d[0] / dl, nz: d[1] / dl, f: 0, b: null, used: false, fox: true, p: [pxx, pzz], h: [hx, hz], grp: 'B', ring: b.ring, at: [b.cx, b.cz], bay: 'pb' + bi });
    { const [ax, az] = HW(...at(1.2, -0.75)), [bx2, bz2] = HW(...at(1.2, -1.05)), [cx2, cz2] = HW(...at(1.25, 0.55)); C.slots.push({ x: ax, z: az, y: fy, nx: -b.nx, nz: -b.nz, f: 0, b: null, used: false, fox: true, p: [bx2, bz2], h: [cx2, cz2], grp: 'B', ring: b.ring, at: [b.cx, b.cz], bay: 'pb' + bi, door: true }); } });
  // the Syrian flag on the mast on the roof (in 1973 the Federation flag, the same red, white and black with the gold hawk as Egypt's): it flies
  // over the post the whole battle, and comes down at the end
  { const [mx, mz] = HW(-16, 300.5); C.syFlag = flag(mx, mz, 'sy', 9, Math.PI * 0.4); C.syFlag.position.y = yR; }
  // the roof parapet, looking out over the rings: the Syrians fire down from it while the rings are fought for
  for (const [lx, lz, nx, nz] of [[-15, 294.5, 0, -1], [0, 294.5, 0, -1], [15, 294.5, 0, -1], [-20.5, 297, -1, 0], [-20.5, 304, -1, 0], [20.5, 297, 1, 0], [-12, 306.5, 0, 1], [0, 306.5, 0, 1], [12, 306.5, 0, 1]]) { const [wx, wz] = HW(lx, lz); C.slots.push({ x: wx, z: wz, y: yR, nx, nz, f: 2, b: null, used: false, fox: true, roof: true, p: [wx + nx * 0.25, wz + nz * 0.25], h: [wx - nx * 0.9, wz - nz * 0.9], grp: 'R' }); }
  // the sangars in the yard between the inner ring and the bunker, facing out at the ring
  const sangar = (lx, lz, fx, fz, grp, k, hi = 0) => { const l = Math.hypot(fx, fz) || 1; fx /= l; fz /= l; const [wx, wz] = HW(lx, lz), y = groundAt(wx, wz) + hi, a0 = Math.atan2(fx, fz); for (let s = -95; s <= 95; s += 19) { const t = a0 + THREE.MathUtils.degToRad(s); stone.push([wx + Math.sin(t) * 1.35, wz + Math.cos(t) * 1.35, 0.35 + r() * 0.2, r() * 6, hmRock(r), 0.25, 0.6]); } addCover(wx - fx * 0.3, wz - fz * 0.3, fx, fz, 0.7);
    const s = { x: wx, z: wz, y: y - 0.05, nx: fx, nz: fz, f: 0, b: null, used: false, fox: true, p: [wx + fx * 0.2, wz + fz * 0.2], h: [wx - fx * 0.3, wz - fz * 0.3], grp, k }; C.slots.push(s); if (hi) stone.push([wx, wz, hi * 0.9, r() * 6, hmRock(r), 0.3, 0.72]); return s; };
  for (const [lx, lz, fx, fz] of [[0, 314, 0, 1], [-18, 313, -0.4, 0.92], [-8, 266, -0.3, -0.95], [16, 267, 0.3, -0.95], [-33, 296, -0.9, 0.3], [33, 284, 0.9, -0.3]]) { const s0 = sangar(lx, lz, fx, fz, 'Y', 0), l = Math.hypot(fx, fz), sx = -fz / l * 0.8, sz = fx / l * 0.8; C.slots.push({ ...s0, x: s0.x + sx, z: s0.z + sz, p: [s0.p[0] + sx, s0.p[1] + sz], h: [s0.h[0] + sx, s0.h[1] + sz] }); }
  // ---- the cable-car station on the road: a concrete building, the pylon, the cable climbing to the summit, a stuck gondola ----
  { const [cx, cz] = HM_CABLE, gy = groundAt(...HW(cx, cz)) - 0.2, wl = (ax, az, bx, bz, g = []) => K.wall(ax, az, bx, bz, gy, gy + 3.2, g, 0.3);
    wl(cx - 6, cz - 4, cx + 6, cz - 4, [[2.6, 3.8], [8.4, 9.6]]); wl(cx - 6, cz + 4, cx + 6, cz + 4, [[5, 7]]); wl(cx - 6, cz - 4, cx - 6, cz + 4, [[3.4, 4.6]]); wl(cx + 6, cz - 4, cx + 6, cz + 4); wl(cx, cz - 4, cx, cz + 4, [[3.4, 4.6]]);
    K.slab(cx - 6.3, cx + 6.3, cz - 4.3, cz + 4.3, gy + 3.5, 0.3); const [wx, wz] = HW(cx, cz); K.con.push([boxUV(wx - 6, wx + 6, gy - 0.02, gy + 0.02, wz - 4, wz + 4, 2, 2), 0x8e8a82]);
    for (const [lx, lz, f] of [[cx - 3, cz + 1.5, 'store'], [cx + 3, cz - 1.5, 'radio']]) { K.solid(lx, lz, gy, 1.6, 0.9, 0.8, 0x6e5a40, K.wood); const [ax, az] = HW(lx, lz - 0.8); COVER.push({ x: ax, z: az, nx: 0, nz: -1, h: 0.9, by: null }); const [tx, tz] = HW(lx, lz); propsOn('hermon', f === 'store' ? ['jerry', 'cans', 'ammo', 'lamp'] : ['radioBig', 'phone', 'cups', 'papers'], tx, tz, gy + 0.9, 1.5, 0.7, 0, 77, gy); }
    { const [tx, tz] = HW(cx - 4.5, cz - 2.5); propAdd('hermon', 'crateS', tx, gy, tz, 0.3, gy); propAdd('hermon', 'bottles', tx, gy + 0.33, tz, 0, gy); const [ux, uz] = HW(cx + 4.8, cz + 2.8); propAdd('hermon', 'sack', ux, gy, uz, 0.5, gy); propAdd('hermon', 'jerry', ux + 0.6, gy, uz - 0.4, 0.2, gy); propAdd('hermon', 'helmet', ux - 0.5, gy, uz + 0.5, 0.9, gy); }
    const [px, pz] = HW(cx + 9, cz + 12), py = groundAt(px, pz); for (const [ox, oz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) K.prop.push([G.cyl(0.1, 0.14, 14, 5), 0x7e7e78, M4(px + ox * 0.8, py + 7, pz + oz * 0.8)]); K.prop.push([G.box(4.5, 0.4, 0.6), 0x6e6e68, M4(px, py + 14, pz)], [G.cyl(0.9, 0.9, 0.3, 16), 0x3a3a36, M4(px - 2, py + 14.3, pz, Math.PI / 2, 0, 0)]);
    const [tx, tz] = HW(28, 304), ty = HM_PY + 12, cab = new THREE.CatmullRomCurve3([V3(px - 2, py + 14.2, pz), V3((px + tx) / 2, (py + ty) / 2 + 2, (pz + tz) / 2), V3(tx, ty, tz)]); K.prop.push([new THREE.TubeGeometry(cab, 40, 0.04, 4, false), 0x1a1a1a]); const gp = cab.getPoint(0.3); K.prop.push([G.box(1.6, 1.8, 1.4), 0xb8402a, M4(gp.x, gp.y - 2.2, gp.z)], [G.cyl(0.03, 0.03, 1.2, 4), 0x1a1a1a, M4(gp.x, gp.y - 0.7, gp.z)]); }
  // Syrian sangars on the slopes and commandos lying by the road: stone half-rings and hollows among the rocks
  for (let k = 0; k < HM_GATES0.length - 1; k++) { const A = HM_GATES0[k], B = HM_GATES0[k + 1], ddx = B[0] - A[0], ddz = B[1] - A[1], l = Math.hypot(ddx, ddz) || 1;
    for (let j = 0; j < 4; j++) { const t = 0.25 + j * 0.18, px = lerp(A[0], B[0], t), pz = lerp(A[1], B[1], t), sd = j % 2 ? 1 : -1, off = j < 2 ? rand(4, 7) : rand(10, 21); const [sx, sz] = corr(HM_ROAD, px - ddz / l * off * sd, pz + ddx / l * off * sd, 22, 3.5); sangar(sx, sz, -ddx / l, -ddz / l, j < 2 ? 'A' : 'S', k, j === 3 && k % 2 ? 1.6 : 0); } }
  // ---- dress the mountain ----
  const okS = (x, z) => { const [lx, lz] = L(x, z); return distPolyline(lx, lz, HM_ROAD_S) > 5 && distPolyline(lx, lz, HM_RING_O) > 3.6 && distPolyline(lx, lz, HM_RING_I) > 3.6 && hmDist(lx, lz) > 4.8 && Math.hypot(lx - HM_CABLE[0], lz - HM_CABLE[1]) > 9 && !HM_SPURS.some((s) => s && distPolyline(lx, lz, s) < 3.4) && !C.slots.some((s) => Math.hypot(s.x - x, s.z - z) < 2.2); };
  const X0 = HM.o.x - 225, X1 = HM.o.x + 225, Z0 = HM.o.z - 205, Z1 = HM.o.z + 340;
  for (let k = 0; k < 16; k++) { const d = densify(HM_ROAD, 12), [x, z] = d[Math.floor(r() * d.length)], a = r() * 6, [wx, wz] = HW(x + (r() - 0.5) * 12, z + (r() - 0.5) * 12); if (okS(wx, wz)) hmProps(K.prop, K.wood, wx, wz, groundAt(wx, wz), a, r, [0, 1, 2, 7, 8][Math.floor(r() * 5)]); }
  for (const [x, z, rr] of [[30, -70, 0.8], [-12, 70, 2.4]]) { const [wx, wz] = HW(x, z); vehicle(TRUCK_BURNT, wx, wz, rr, 3.3, 1.2, 2.6); }
  for (const [x, z, b] of [[10, -40, 30], [-6, 130, 200]]) { const [wx, wz] = HW(x, z); placeTank(wx, wz, b, TANK_BURNT); }
  roadRibbon(HM_ROAD.map(([x, z]) => HW(x, z)), 6.5, 'asphalt');
  roadPoles(HM_ROAD.map(([x, z]) => HW(x, z)), 24, 6);
  { const fence = [[-14, 222], [-68, 230], [-76, 290], [-68, 350], [-14, 358], [14, 358], [68, 350], [76, 290], [68, 230], [14, 222]]; wireFence(fence.map(([x, z]) => HW(x, z)), 3); for (const [x, z] of densify(fence, 2.2)) { const [wx, wz] = HW(x + (x > 0 ? 1.6 : -1.6) * (Math.abs(x) > 40 ? 1 : 0), z + (z > 300 ? 1.6 : -1.6)); K.prop.push([G.tor(0.45, 0.02, 4, 16), 0x5a5a56, M4(wx, groundAt(wx, wz) + 0.4, wz, 0, Math.random() * 3, 0)]); } }
  { const [wx, wz] = HW(12, 226); fieldSign(wx, wz, 'מוצב החרמון', Math.PI, 1.5); const [a, b] = HW(48, 34); fieldSign(a, b, 'רכבל החרמון', 0.6, 1.3); }
  { const pt = plasterTex(2214, '#b4b0a6'); scene.add(SH(onLayer1(new THREE.Mesh(build(K.con), new THREE.MeshStandardMaterial({ vertexColors: true, map: pt, bumpMap: bumpOf(pt), bumpScale: 0.8, roughness: 0.95 }))))); }
  scene.add(SH(onLayer1(new THREE.Mesh(build(K.prop), MAT.vc))));
  scene.add(SH(onLayer1(new THREE.Mesh(build(K.wood), new THREE.MeshStandardMaterial({ vertexColors: true, map: TX.wood, roughness: 0.92 })))));
  if (K.gab.length) scene.add(SH(onLayer1(new THREE.Mesh(mergeGeometries(K.gab, false), MAT.gabion))));
  // warm bulbs in the rooms: only a few real lights, the rest are glowing bulbs
  for (const [lx, lz, y] of K.lamps.filter((_, i) => i % 4 === 0).slice(0, 3)) { const lt = new THREE.PointLight(0xffd9a0, 70, 14, 2); const [wx, wz] = HW(lx, lz); lt.position.set(wx, y, wz); scene.add(lt); }
  instScatter(ROCK_G, stone.concat(scatterIn(LITE ? 1400 : 3600, X0, X1, Z0, Z1, 2211, okS, (x, z, rr) => [x, z, 0.25 + rr() ** 2.5 * 1.5, rr() * 6, hmRock(rr), 0.2, 0.5]), scatterNear(HM_ROAD.map(([x, z]) => HW(x, z)), LITE ? 400 : 900, 5, 26, 2212, okS, (x, z, rr) => [x, z, 0.3 + rr() ** 2 * 1.3, rr() * 6, hmRock(rr), 0.2, 0.5])));
  { const bl = scatterNear(HM_ROAD.map(([x, z]) => HW(x, z)), LITE ? 70 : 160, 7, 24, 2213, okS, (x, z, rr) => [x, z, 1.1 + rr() * 1.8, rr() * 6, hmRock(rr), 0.3, 0.6]).concat(scatterIn(LITE ? 110 : 260, X0, X1, Z0, Z1, 2214, okS, (x, z, rr) => [x, z, 1.4 + rr() * 2.6, rr() * 6, hmRock(rr), 0.3, 0.55])); instScatter(BOULDER_G, bl); boulders(bl); }
  instScatter(BUSH_G, scatterIn(LITE ? 400 : 1000, X0, X1, Z0, Z1, 2215, okS, (x, z, rr) => [x, z, 0.25 + rr() * 0.4, rr() * 6, rr() < 0.5 ? 0x4a5038 : rr() < 0.5 ? 0x6e6650 : 0x5c5a48, -0.2, 0.45]));
  dressArea(X0, X1, Z0, Z1, okS, 2220, 1.3, 0.1, { rock: hmRock, trees: 0, grass: 0.5 }); dressRoute(HM_ROAD.map(([x, z]) => HW(x, z)), okS, 2221, 1.4, 0.1, { rock: hmRock, trees: 0, grass: 0.5 });
  for (const [x, z, s] of [[-600, 400, 40], [500, 200, 30], [-300, -500, 50]]) { const [wx, wz] = HW(x, z); smokeColumn(wx, wz, s, false); }
  BATCH.bag = sv; if (BAGS.length) scene.add(bagMesh(BAGS)); C.covers = COVER.slice(k0); for (const c of C.covers) if (c.floor === undefined) c.y = groundAt(c.x, c.z);
  hmPano();
}
/* ---------- the view from the top: the Golan, the Hula valley and the Galilee, Lebanon, the Damascus plain, all spread out below, 360 degrees ----------
   A far terrain sixty kilometres in radius round the post, heights in metres below it (the post stands at 2,070 m; the main summit, 2,814 m, is
   six kilometres to the north-east along the ridge). North is +z, east is -x. It is drawn first, shrunk toward the eye (a shrink centred on the eye
   changes no direction, so from wherever the camera stands it looks exactly as the real one would, and it fits the depth range finely), and the
   depth is cleared after it, so the mountain itself is always drawn over it */
let HM_PANO = null;
const HM_RIDGE = [[-3.5, -5, -900], [0, 0, 0], [3.4, 4.9, 740], [12, 16, 360], [30, 36, 120], [48, 52, -250]];   // the crest of the massif: km east, km north, metres
const HM_CONES = [[3, -12, 300, 1.3], [2, -9, 260, 1.1], [4, -27, 320, 1.4], [3, -29, 350, 1.5], [0.5, -33, 220, 1.2], [2, -40, 240, 1.3], [5, -45, 200, 1.2], [15, -15, 300, 1.6], [12, -25, 280, 1.5], [9, -31, 240, 1.3], [-2, -18, 160, 1.0], [7, -19, 200, 1.1]];   // the volcanic cones of the Golan: Odem, Hermonit, Bental, Avital, and on the Syrian side Tel Shams, Tel Antar and others
function hmPanoH(E, N) {
  // the plains: the Golan plateau (~900 m), lower to the south; the Damascus plain to the east (~700 m)
  let h = -1150 - 150 * smooth(0, -22, N) * (1 - smooth(4, 20, E)) - 260 * smooth(8, 30, E) * smooth(-35, 4, N);
  // the Hula valley, a trough to the south-west with its floor at 70 m; the Sea of Galilee beyond it to the south
  { const u = (E + 11) / 5.2, v = (N + 26) / 15; h = lerp(h, -2000, smooth(0.08, 0.7, Math.exp(-(u * u + v * v)))); }
  { const d = Math.hypot(E + 2, N + 57); if (d < 9) h = lerp(h, -2290, 1 - smooth(5.5, 9, d)); }
  // Wadi al-Taym under the massif to the north-west, Mount Lebanon on the horizon beyond it; the Galilee hills west of the Hula
  { const t = distPolyline(E, N, [[-22, -10], [-34, 20], [-44, 55]]); h = Math.max(h, lerp(h, -150, Math.exp(-(t * t) / 50))); }
  h += 110 * smooth(-18, -30, E) * smooth(-48, -14, N);
  // the volcanic cones of the Golan
  for (const [ce, cn, hh, r] of HM_CONES) { const dd = Math.hypot(E - ce, N - cn); if (dd < r * 3.5) h += hh * Math.exp(-(dd * dd) / (r * r)); }
  // the massif: the crest along the ridge, the slopes falling to the plains on both sides
  let best = 1e9, crest = 0; for (let i = 0; i < HM_RIDGE.length - 1; i++) { const [ax, az, ah] = HM_RIDGE[i], [bx, bz, bh] = HM_RIDGE[i + 1], dx = bx - ax, dz = bz - az, t = clamp(((E - ax) * dx + (N - az) * dz) / (dx * dx + dz * dz), 0, 1), d = Math.hypot(E - ax - dx * t, N - az - dz * t); if (d < best) { best = d; crest = lerp(ah, bh, t); } }
  const m = crest - 1500 * (1 - Math.exp(-best / 5.36));
  const k = smooth(-200, 200, m - h); h = lerp(h, m, k);
  // rough ground everywhere, rougher on the mountain
  return h + (35 + 150 * k) * fbm(E / 2.3, N / 2.3, 4) + 22 * fbm(E / 0.55, N / 0.55, 2);
}
function hmPano() {
  if (HM_PANO) return;
  const NR = LITE ? 70 : 112, NA = LITE ? 180 : 300, R0 = 0.12, R1 = 62, [cx, cz] = HW(0, 290), post = HM_PY;
  const pos = new Float32Array(NR * NA * 3), col = new Float32Array(NR * NA * 3), hz = new Float32Array(NR * NA), K = 1 / 0.787, C = (r, g, b) => [lin(r) * K, lin(g) * K, lin(b) * K], r = rng(2290);
  const LIME = C(0.68, 0.67, 0.64), ROCK = C(0.52, 0.5, 0.47), OCHRE = C(0.58, 0.5, 0.37), SCRUB = C(0.37, 0.38, 0.28), DRY = C(0.64, 0.57, 0.4), BASALT = C(0.33, 0.31, 0.28), FIELD = C(0.42, 0.48, 0.3), FIELD2 = C(0.56, 0.5, 0.36), ORCH = C(0.3, 0.37, 0.24), WATER = C(0.24, 0.36, 0.46), VILL = C(0.72, 0.7, 0.66);
  const mixc = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  for (let i = 0; i < NR; i++) { const km = R0 * Math.pow(R1 / R0, i / (NR - 1));
    for (let j = 0; j < NA; j++) { const a = (j / NA) * Math.PI * 2, E = Math.sin(a) * km, N = Math.cos(a) * km, lx = -E * 1000, lz = 290 + N * 1000;
      // near the post the mountain of the map itself, far off the country round it
      const near = hmBase(lx, lz) + 2.6 * fbm(lx / 42, lz / 42, 3) - post, far = hmPanoH(E, N), w = smooth(0.35, 1.6, km), h = lerp(near, far, w), o = (i * NA + j) * 3;
      pos[o] = cx + lx; pos[o + 1] = post + h; pos[o + 2] = cz + lz - 290;
      // the colour: limestone on the heights, dry ochre slopes, the yellow plateau with its black basalt, green fields in the valleys, the lake
      const n1 = fbm(E / 1.7 + 7, N / 1.7, 3), cell = Math.sin(Math.floor(E / 0.55) * 12.9898 + Math.floor(N / 0.42) * 78.233) * 43758.5 % 1, cv = Math.abs(cell);
      let c = h > -450 ? mixc(LIME, ROCK, smooth(-0.2, 0.5, n1)) : h > -1000 ? mixc(OCHRE, SCRUB, smooth(0.0, 0.5, n1) * 0.7) : mixc(DRY, BASALT, smooth(0.05, 0.45, n1));
      if (h < -1250 && h > -1700) c = mixc(c, cv < 0.5 ? FIELD2 : DRY, 0.5);
      if (h <= -1700) c = mixc(cv < 0.45 ? FIELD : cv < 0.85 ? FIELD2 : C(0.4, 0.5, 0.54), c, 0.15);
      if (E > 12 && h < -1300) c = mixc(c, cv < 0.4 ? ORCH : FIELD2, 0.55 * smooth(12, 30, E));
      if (h < -2270) c = WATER;
      for (const [vx, vz, vr] of [[0.4, -5.6, 0.7], [1.6, -4.8, 0.45], [3.2, -6.4, 0.4], [-9, -14.5, 0.6], [24, -12, 1.2], [38, 6, 3.2]]) if (Math.hypot(E - vx, N - vz) < vr) c = mixc(c, VILL, 0.55);   // Majdal Shams, Mas'ade, Buq'ata, Banias; Sasa and Damascus far off
      if (h > -250) c = mixc(c, LIME, smooth(-250, 300, h) * 0.5);
      col[o] = c[0]; col[o + 1] = c[1]; col[o + 2] = c[2];
      hz[i * NA + j] = Math.min(0.9, 1 - Math.exp(-km / 24)) * (0.85 + 0.15 * smooth(-1500, 0, -h)); } }
  const idx = []; for (let i = 0; i < NR - 1; i++) for (let j = 0; j < NA; j++) { const a = i * NA + j, b = i * NA + (j + 1) % NA, c2 = (i + 1) * NA + j, d = (i + 1) * NA + (j + 1) % NA; idx.push(a, c2, b, b, c2, d); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.setAttribute('aHaze', new THREE.BufferAttribute(hz, 1)); g.setIndex(idx); g.computeVertexNormals();
  const mat = new THREE.MeshLambertMaterial({ vertexColors: true, fog: false });
  const uHaze = { value: new THREE.Color(0xb8c4ce) };
  mat.onBeforeCompile = (sh) => { sh.uniforms.uHaze = uHaze; sh.vertexShader = 'attribute float aHaze;\nvarying float vHaze;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvHaze = aHaze;');
    sh.fragmentShader = 'uniform vec3 uHaze;\nvarying float vHaze;\n' + sh.fragmentShader.replace('#include <tonemapping_fragment>', 'gl_FragColor.rgb = mix(gl_FragColor.rgb, uHaze, vHaze);\n#include <tonemapping_fragment>'); };
  mat.customProgramCacheKey = () => 'hmpano';
  const m = HM_PANO = new THREE.Mesh(g, mat); m.frustumCulled = false; m.matrixAutoUpdate = false; m.renderOrder = -1000; m.castShadow = false; m.receiveShadow = false; m.userData.dyn = true;
  const KS = 0.02;
  m.onBeforeRender = (rr, sc, cam) => { const p = cam.position; m.matrixWorld.makeScale(KS, KS, KS).setPosition(p.x * (1 - KS), p.y * (1 - KS), p.z * (1 - KS)); if (scene.fog) uHaze.value.copy(scene.fog.color).lerp(new THREE.Color(1, 1, 1), 0.12); };
  m.onAfterRender = (rr) => rr.clearDepth();
  sky.renderOrder = -1001; scene.add(m);
}
/* ---------- props for the trenches ---------- */
function hmProps(parts, wood, x, z, y, a, r, kind) {
  const R = (dx, dz) => [x + Math.cos(a) * dx - Math.sin(a) * dz, z + Math.sin(a) * dx + Math.cos(a) * dz];
  const P = (geo, col, dx, dy, dz, rx = 0, ry = 0, rz = 0, list = parts) => { const [px, pz] = R(dx, dz); list.push([geo, col, M4(px, y + dy, pz, rx, -a + ry, rz)]); };
  if (kind === 0) { for (let k = 0; k < 3; k++) P(G.box(0.62, 0.3, 0.32), 0x4d5a34, 0, 0.15 + k * 0.31, (k % 2) * 0.05, 0, (k - 1) * 0.12); P(G.box(0.63, 0.04, 0.12), 0xd8c84a, 0, 0.32, 0.17); }
  else if (kind === 1) { for (let k = 0; k < 2; k++) P(G.box(0.36, 0.48, 0.17), 0x435033, k * 0.4, 0.24, 0, 0, r() * 0.4); }
  else if (kind === 2) { P(G.sph(0.15, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.55), 0x4f5638, 0, 0.02, 0, Math.PI, 0, 0); P(G.box(0.08, 0.06, 1.05), 0x2b2a26, 0.4, 0.5, 0, 0.6, 0, 0.1); }
  else if (kind === 3) { P(G.box(0.48, 0.34, 0.32), 0x56603c, 0, 0.2, 0); P(G.cyl(0.006, 0.006, 1.6, 4), 0x1a1a1a, 0.18, 1.1, 0.1); }
  else if (kind === 4) { P(G.cyl(0.03, 0.03, 2.1, 6), 0x6b5a3e, 0, 0.12, -0.25, 0, 0, Math.PI / 2); P(G.cyl(0.03, 0.03, 2.1, 6), 0x6b5a3e, 0, 0.12, 0.25, 0, 0, Math.PI / 2); P(G.box(1.8, 0.02, 0.5), 0x6a6a52, 0, 0.13, 0); }
  else if (kind === 5) { P(G.box(0.7, 0.42, 0.5), 0x8a6e48, 0, 0.21, 0, 0, 0, 0, wood); P(G.box(0.55, 0.32, 0.42), 0x7d6442, 0.1, 0.58, 0.02, 0, 0.3, 0, wood); }
  else if (kind === 6) { for (let k = 0; k < 3; k++) P(G.tor(0.42, 0.02, 4, 18), 0x5a5a56, k * 0.3, 0.42, 0, 0, Math.PI / 2, 0); }
  else if (kind === 7) { P(G.cap(0.16, 0.45, 4, 8), 0x55603c, 0, 0.18, 0, 0, 0, Math.PI / 2); P(G.cap(0.12, 0.6, 4, 8), 0x6a6248, 0.05, 0.42, 0.06, 0, 0.4, Math.PI / 2); }
  else if (kind === 8) { for (let k = 0; k < 9; k++) P(G.cyl(0.012, 0.012, 0.06, 6), 0xc8a24a, (r() - 0.5) * 0.7, 0.02, (r() - 0.5) * 0.5, Math.PI / 2, r() * 3, 0); P(G.box(0.3, 0.18, 0.22), 0x6e5a3a, 0.2, 0.09, 0.1, 0, 0, 0, wood); }
  else { P(G.cyl(0.18, 0.18, 0.12, 12), 0x3a3a34, 0, 0.06, 0, Math.PI / 2, 0, 0); P(G.box(0.2, 0.22, 0.12), 0x3f4a2f, 0.3, 0.11, 0); }
}
/* ---------- the advance, bound by bound ---------- */
const HM_GATES0 = (() => { const d = densify(HM_ROAD.slice(4), 1), out = [d[0]]; let acc = 0; for (let i = 1; i < d.length; i++) { acc += Math.hypot(d[i][0] - d[i - 1][0], d[i][1] - d[i - 1][1]); if (acc >= 50) { out.push(d[i]); acc = 0; } } const e = d[d.length - 1]; if (Math.hypot(out[out.length - 1][0] - e[0], out[out.length - 1][1] - e[1]) > 30) out.push(e); else out[out.length - 1] = e; return out; })();
/* the gate points of each stage of the post, in local coordinates (a third number is the floor height the player must be on) */
const HM_G = {
  1: [[5, 238], [-44, 252], [-60, 290], [-44, 328], [0, 342], [44, 328], [60, 290], [44, 252], [28, 246.3]],
  2: [[28, 246.3], [24, 264.8], [30, 266], [42, 290], [30, 314], [0, 320], [-30, 314], [-42, 290], [-30, 266], [0, 260], [6.5, 270, HM_L0 + 0.6]],
  3: [[6.5, 273.5, HM_L0], [6.5, 280, HM_L0], [-6, 290, HM_L0], [-20, 290, HM_L0], [20, 290, HM_L0], [3.6, 284, HM_L0 + 0.4]],
  4: [[11.8, 284, HM_PY], [0, 280, HM_PY], [-15, 295.5, HM_PY], [-3, 296.5, HM_PY], [10.5, 297, HM_PY], [23.9, 289.5, HM_PY]],
  5: [[23.9, 289.5, HM_PY], [23.9, 301.5, HM_RY], [8, 300.5, HM_RY], [-4, 297, HM_RY], [-16, 300.5, HM_RY]],
};
const HM_LABEL = { 1: 'עמדה', 2: 'עמדה', 3: 'נקודה', 4: 'נקודה', 5: 'עמדה' };
function hmRoomEnemy(f, lx, lz, tag, kind = 'rifle') { const [x, z] = HW(lx, lz), e = spawnEnemy(x, z, kind === 'rifle' ? (Math.random() < 0.45 ? 'smg' : 'rifle') : kind, null, null); if (!e) return null; e.pos.y = hmY(f); e.sz = 'room'; e.state = 'sz'; e.floor = f; e.cov = null; e.patience = rand(0, 4); e.cyc = rand(0.5, 1.5); e.peek = false; e.meleeCd = 0.5; e.sq = tag; e.sync(); return e; }
/* ---------- who stands where: every position of a stage is manned when the stage begins and waits hidden ----------
   a man wakes when his bound opens or the player comes within his waking distance; the roof fires down at the rings from far off */
function hmPlace(st, g0 = 0) {
  const C = CHAP.hermon, pts = HM_G[st], seg = (lx, lz) => gateSegOf(pts, lx, lz), L = (s) => [s.x - HM.o.x, s.z - HM.o.z];
  const put = (s, kind, k, wakeR) => (k < g0 ? null : fSlotPlace(s, kind, 'g' + k, { wakeG: k, wakeR }));
  if (st === 1 || st === 2) {
    const ring = st === 1 ? 'o' : 'i', bays = [...new Set(C.slots.filter((s) => s.grp === 'T' && s.ring === ring).map((s) => s.bay))];
    bays.forEach((b, i) => { if (st === 1 ? i % 2 === 1 : i % 3 === 2) return; const two = C.slots.filter((s) => s.bay === b && !s.used); two.forEach((s, j) => put(s, j === 0 && i % 3 === 0 ? 'lmg' : i % 7 === 3 && j === 1 ? 'sniper' : 'rifle', seg(...s.at), 24)); });
    C.slots.filter((s) => s.grp === 'B' && s.ring === ring && !s.used).forEach((s) => put(s, s.door ? 'rifle' : 'lmg', seg(...s.at), 30));   /* the trench bunkers: a machine gun at the slit, a rifleman at the door */
    { let n = 0; for (const s of C.slots) if (s.grp === 'R' && !s.used && n < (st === 1 ? 4 : 5)) { if (fSlotPlace(s, n === 1 ? 'lmg' : 'rifle', 'roof', { wakeR: 70 })) n++; } }   /* the roof over the rings: they fire down, and nobody goes up there */
  }
  if (st === 3) {
    const { z0, z1 } = HM_F, [c0, c1] = HM_CORR;
    const R = (a, b, zA, zB, nz, k, n) => { if (k < g0) return; const far = nz > 0 ? zB - 3 : zA + 3, spots = [[a + 2.8, far], [b - 2.8, far], [(a + b) / 2 + 1.6, (zA + zB) / 2 + nz * 1.5]]; for (let i = 0; i < n; i++) hmRoomEnemy(0, spots[i][0], spots[i][1], 'g' + k, i === 2 ? 'lmg' : 'rifle'); };
    if (g0 <= 0) { hmRoomEnemy(0, 1.6, 281, 'g0', 'smg'); hmRoomEnemy(0, 11.6, 281, 'g0', 'rifle'); hmRoomEnemy(0, 12.2, 273.8, 'g0', 'rifle'); }
    R(0, 13, c1, z1, 1, 1, 3); R(-13, 0, c1, z1, 1, 1, 3); R(-13, 0, z0, c0, -1, 1, 3); if (g0 <= 1) hmRoomEnemy(0, -2.3, 288.6, 'g1', 'rifle');
    R(-26, -13, c1, z1, 1, 2, 3); R(-26, -13, z0, c0, -1, 2, 3); if (g0 <= 2) hmRoomEnemy(0, -15.3, 291.4, 'g2', 'lmg');
    R(13, 26, c1, z1, 1, 3, 3); R(13, 26, z0, c0, -1, 3, 3); if (g0 <= 3) hmRoomEnemy(0, 18.7, 291.4, 'g3', 'lmg');
  }
  if (st === 4) {
    const U = HM_U; let i = 0;
    for (const s of C.slots) if (s.grp === 'T2' && !s.used && i < 10) { fSlotPlace(s, i++ % 3 === 1 ? 'lmg' : 'rifle', 'g0', { dormant: false }); }
    let n = 0; for (const s of C.slots) if (s.grp === 'R' && s.nz < -0.5 && !s.used && n < 3) { if (fSlotPlace(s, 'rifle', 'roof', { wakeR: 45 })) n++; }
    const R = (a, b, k, n2) => { if (k < g0) return; const spots = [[a + 2.8, U.z1 - 3], [b - 2.8, U.z1 - 3], [(a + b) / 2 + 1.6, (U.z0 + U.z1) / 2 + 1.5], [(a + b) / 2 - 3, U.z0 + 4]]; for (let j = 0; j < n2; j++) hmRoomEnemy(1, spots[j][0], spots[j][1], 'g' + k, j === 2 ? 'lmg' : 'rifle'); };
    R(U.x0, -8, 1, 3); R(-8, 8, 2, 4); R(8, U.x1, 3, 3);
  }
  if (st === 5) { let i = 0; const R2 = C.slots.filter((s) => s.grp === 'R2' && !s.used).sort((a, b) => b.x - a.x); for (const s of R2) { if (i >= 16) break; const [lx, lz] = L(s); put(s, i++ % 4 === 1 ? 'lmg' : 'rifle', Math.max(1, seg(lx, lz)), 14); } }
}
/* a bound opens: a word on the radio, and two or three men come down the trench from two bounds ahead (or out of a door), in plain sight */
function hmRunners(ring, pts, k, n, tag) {
  const d = densify(ring, 2).map(([x, z]) => HW(x, z)), near = (p) => { const [wx, wz] = HW(p[0], p[1]); let b = 0, bd = 1e9; d.forEach((q, i) => { const dd = Math.hypot(q[0] - wx, q[1] - wz); if (dd < bd) { bd = dd; b = i; } }); return b; };
  const i1 = near(pts[Math.min(k + 1, pts.length - 1)]), i2 = near(pts[Math.min(k + 2, pts.length - 1)]); if (i2 <= i1) return;
  const path = d.slice(i1, i2 + 1).reverse();
  for (let j = 0; j < n; j++) DIRQ.push({ at: GAME.t + 1.5 + j * 1.4, spawn: true, gate: k, fn: () => { const [sx, sz] = path[0]; const e = fSpawnStreet(sx + rand(-0.5, 0.5), sz + rand(-0.5, 0.5), path.slice(1), 'rifle'); if (e) e.sq = tag; } });
}
function hmWake(st, k) {
  const C = CHAP.hermon, pts = HM_G[st], tag = 'g' + k, last = pts.length - 2;
  if (k > 0 && k % 3 === 0 && k < last) { C.cpG = k; CP.stats = { ...STATS }; feed('נקודת שמירה', 'good'); }
  if (st === 1) { hmRunners(HM_RING_O, pts, k, 2 + (k >= 4 ? 1 : 0), tag); if (k > 0) radio('מ״פ', pick(['העמדה הבאה בתעלה! רימון מעבר למחסום!', 'יורים עליכם מהגג, ראש למטה!', 'הם רצים אלינו בתעלה! לחסל!', 'קסדות מעל שקי החול - לצלוף לפני שמתקרבים!']), 2.4); }
  if (st === 2) { if (k >= 1 && k < last) hmRunners(HM_RING_I, pts.slice(1), k - 1, 2, tag); if (k === last) { for (let j = 0; j < 3; j++) DIRQ.push({ at: GAME.t + 1 + j * 1.3, spawn: true, gate: k, fn: () => { const [sx, sz] = HW(6.5 + rand(-1, 1), 277); const e = fSpawnStreet(sx, sz, [HW(6.5, 270.5), HW(2 + rand(-1, 1), 263)], 'smg'); if (e) e.sq = tag; } }); radio('מ״פ', 'הם יוצאים מהבונקר! לירות! אחר כך, פנימה בעקבותיהם!', 3); } else if (k > 0) radio('צנחן', pick(['סנגר בחצר, מימין!', 'הטבעת הפנימית מאוישת - עמדה אחרי עמדה!', 'הם על הגג, מעלינו!', 'רימון לתוך העמדה!']), 2.2); }
  if (st === 3) { if (k === 1) radio('לוחם', 'חדרים משני הצדדים! רימון, ואז נכנסים!', 2.4); if (k === 2) radio('לוחם', 'מקלע מאחורי שקי החול במסדרון!', 2.2); if (k === 3) radio('מ״פ', 'הזרוע המזרחית! עוד שני חדרים, ואז חזרה למדרגות!', 2.6); if (k === 4) { radio('מ״פ', 'הקומה נקייה. למדרגות שבאולם הכניסה - למעלה!', 2.6); hint('hm-up', 'המדרגות למרפסת נמצאות באולם הכניסה (◆). למעלה מחכות עמדות גביונים מול היציאה - רימון קודם.', 7); } }
  if (st === 4) { if (k === 0) { for (let j = 0; j < 2; j++) DIRQ.push({ at: GAME.t + 2.5 + j * 1.5, spawn: true, gate: 0, fn: () => { const [sx, sz] = HW(j ? 15 : -15, 294.3); const e = fSpawnStreet(sx, sz, [HW(j ? 13 : -7, 285)], 'smg'); if (e) { e.pos.y = HM_PY; e.sq = 'g0'; } } }); radio('מ״פ', 'על המרפסת! גביונים מולכם ואש מהגג - מהר למחסה!', 2.8); } if (k === 1) radio('לוחם', 'חדר התצפית, משמאל!', 2); if (k === 3) radio('לוחם', 'החדר האחרון! ואז המדרגות החיצוניות, בצד המזרחי!', 2.6); if (k === 4) hint('hm-roof', 'המדרגות החיצוניות לגג בפינה המזרחית של המרפסת (◆). על הגג עיקר ההתנגדות: מחסום אחרי מחסום.', 7); }
  if (st === 5) { if (k === 1) radio('מ״פ', 'הגג! הם מאחורי סלסלות האבנים, שורה אחרי שורה! רימונים!', 3); if (k === 2) for (let j = 0; j < 2; j++) DIRQ.push({ at: GAME.t + 1 + j * 1.2, spawn: true, gate: 2, fn: () => { const [sx, sz] = HW(-19 + j, 300.5 + (j ? 2 : -2)); const e = fSpawnStreet(sx, sz, [HW(-2, 300.5)], 'smg'); if (e) { e.pos.y = HM_RY; e.sq = 'g2'; } } }); if (k === 3) radio('מ״פ', 'העמדה האחרונה! לקצה הגג, ולהביא את הדגל!', 2.6); }
}
/* ---------- stages ---------- */
function hmSetup(stage) {
  const C = CHAP.hermon; fieldSetupCommon(C, stage); resetTrail(); HM.msgs = {};
  if (C.syFlag) { C.syFlag.children[1].visible = true; C.syFlag.children[1].position.y = 8.2; } if (C.ilFlag) C.ilFlag.children[1].visible = false; C.lower = 0; C.raise = 0;
  P.mode = 'rifle'; vm.visible = true; if (TANK.g) TANK.g.visible = false;
  const g0 = stage ? Math.min(C.cpG || 0, HM_G[stage].length - 2) : 0, pts = stage ? HM_G[stage] : HM_GATES0, at = pts[g0], nx = pts[Math.min(g0 + 1, pts.length - 1)], [x, z] = HW(at[0], at[1]);
  P.pos.set(x, at[2] !== undefined ? hAt(x, z, at[2] + 0.3) : groundAt(x, z), z); P.yaw = Math.atan2(-(nx[0] - at[0]), -(nx[1] - at[1])); P.pitch = 0.02;
  const fw = [-Math.sin(P.yaw), -Math.cos(P.yaw)];
  fieldFriends(HM_NAMES.map((name, i) => (i < 8 ? { name, x: P.pos.x - fw[0] * (2.2 + i * 1.3) + (i % 2 ? 0.8 : -0.8) * fw[1], z: P.pos.z - fw[1] * (2.2 + i * 1.3) - (i % 2 ? 0.8 : -0.8) * fw[0], y: stage >= 3 ? P.pos.y : undefined, state: 'follow', fi: i } : null)));
  hmStage(stage, g0);
}
function hmStage(i, g0 = 0) {
  const C = CHAP.hermon; fieldStage(C, i); HM.stage = i; C.t = 0; C.cpG = g0;
  fieldDespawn((e) => !!e.sz);
  const go = (st, done, r = 6.5) => { const pts = HM_G[st].map(([x, z, y]) => [...HW(x, z), y]); gateStart(pts, (k) => { if (k >= g0) hmWake(st, k); }, done, HM_LABEL[st], r, st === 1 ? 1.45 : st === 2 ? [1.45, [HW(36, 249.1), ...pts.map((q) => [q[0], q[1]])]] : 0);   /* the inner stage's lane takes in the end of the outer trench, where the player stands when it begins */ if (g0) { GATE.i = g0; GATE.t = 0; GATE.clear = false; hmWake(st, g0); } };
  if (i === 0) DIRQ.push({ at: GAME.t + 0.3, fn: () => hmIntroFilm() });
  if (i === 1) { hmPlace(1, g0); radio('מ״פ', 'הגענו לגדר! לתוך התעלה החיצונית, ומתקדמים בה סביב המוצב - עמדה אחרי עמדה, עד תעלת הקשר פנימה. לא יוצאים מהתעלה!', 4.6); hint('hm-ring', 'כל העמדות בתעלה <b>מאוישות מראש</b>: חפשו קסדות מעל שקי החול וצלפו מרחוק. העמדה הבאה מסומנת ב־◆; מי שרץ אליכם בתעלה - בא משתי עמדות קדימה.', 9); go(1, () => { feed('הטבעת החיצונית נקייה', 'good'); hmStage(2); }); }
  if (i === 2) { hmPlace(2, g0); radio('מ״פ', 'הטבעת החיצונית שלנו! בתעלת הקשר פנימה, מנקים את הטבעת הפנימית והסנגרים בחצר, ואז דלת הבונקר בדרום!', 4.4); go(2, () => { feed('החצר נקייה · לדלת הבונקר', 'good'); hmStage(3); }); }
  if (i === 3) { hmPlace(3, g0); radio('מ״פ', 'נכנסים לבונקר! אולם כניסה, מסדרון ושמונה חדרים - כולם מלאים. רימון לפני כל דלת, ואף אחד לא נשאר מאחור.', 4.2); hint('hm-cqb', 'בתוך הבונקר יורים מטווח מטרים ספורים. עצרו לפני כל דלת, זרקו רימון, וכנסו רק אחרי הפיצוץ. קודם הזרוע המערבית של המסדרון, אחר כך המזרחית, ואז המדרגות באולם.', 9); go(3, () => { feed('הקומה התחתונה נקייה · למדרגות', 'good'); hmStage(4); }, 3.4); }
  if (i === 4) { hmPlace(4, g0); radio('מ״פ', 'למעלה! המרפסת, ואז חדר התצפית, חדר הקשר וחדר המפקד!', 3.2); go(4, () => { feed('הקומה העליונה נקייה · למדרגות לגג', 'good'); hmStage(5); }, 3.4); }
  if (i === 5) { hmPlace(5, g0); radio('מ״פ', 'הגג! במדרגות החיצוניות, ושם הם התבצרו - עמדה אחרי עמדה עד הדגל!', 3.4); go(5, () => { feed('המוצב בידינו', 'good'); radio('מ״פ', 'המוצב שלנו! להביא את הדגל!', 3.5); DIRQ.push({ at: GAME.t + 2, fn: hmEndFilm }); }, 3.4); }
}
function hmGate0(k) {
  const C = CHAP.hermon, N = HM_GATES0.length - 1, tag = 'g' + k;
  // the sangars of this bound and the next two are manned before the player can see them; they wake as he comes within range
  for (let j = k; j <= Math.min(k + 2, N - 1); j++) { let i = 0; for (const s of C.slots) if ((s.grp === 'S' || s.grp === 'A') && s.k === j && !s.used) fSlotPlace(s, i++ === 2 ? 'rpg' : 'rifle', 'g' + j, { wakeG: j, wakeR: 55 }); }
  // a few come down the road from two bounds ahead into cover round the next point - seen coming, not conjured
  const B = HM_GATES0[Math.min(k + 1, N)], F = HM_GATES0[Math.min(k + 2, N)], n = 2 + Math.floor(k / 2);
  for (let i = 0; i < n; i++) DIRQ.push({ at: GAME.t + 2 + i * 1.6, spawn: true, gate: k, fn: () => { const [x, z] = corr(HM_ROAD, F[0] + rand(-6, 6), F[1] + rand(-4, 4), 18), [tx, tz] = corr(HM_ROAD, B[0] + rand(-12, 12), B[1] + rand(-8, 4), 18, 4); const e = fSpawnStreet(...HW(x, z), [HW(tx, tz)], 'rifle'); if (e) e.sq = tag; } });
  // the cable-car station: the bound that reaches it has defenders inside, in both rooms
  const [cx, cz] = HM_CABLE; if (Math.hypot(B[0] - cx, B[1] - cz) < 60 && !HM.msgs.cable) { HM.msgs.cable = true; for (const [lx, lz] of [[cx - 4, cz + 2.5], [cx + 2, cz + 2.5], [cx + 4.5, cz - 2.5]]) { const [x, z] = HW(lx, lz), e = spawnEnemy(x, z, 'rifle', null, null); if (e) { e.sz = 'street'; e.state = 'sz'; e.path = [[x + 0.2, z]]; e.pi = 0; e.cov = null; e.patience = 0; e.cyc = 1; e.peek = false; e.meleeCd = 0.5; e.rpgCd = 99; e.sq = tag; } } radio('מ״מ', 'מבני הרכבל לפנינו! יש בהם סורים. נכנסים, חדר אחרי חדר!', 3.2); }
  if (k > 0) radio('מ״פ', pick(['קומנדו סורי בצד הדרך! לירות לפני שהם קמים!', 'צלף על הסלע משמאל!', 'הם מחזיקים את הקטע הבא! ממחסה למחסה!', 'מקלע שלנו בידיים שלהם, מהסלעים מימין!']), 2.4);
}
function hmUpd(dt) {
  const C = CHAP.hermon; C.t += dt; if (Math.floor(C.t * 2) !== Math.floor((C.t - dt) * 2)) szEnemyCleanup();
  for (let i = DIRQ.length - 1; i >= 0; i--) if (DIRQ[i] && GAME.t >= DIRQ[i].at) { const q = DIRQ.splice(i, 1)[0]; q.fn(); }
  updTrail(dt); gateUpd(dt);
  if (!CINE.on && HM.stage === 0) { C.airT = (C.airT ?? 14) - dt; if (C.airT <= 0) { C.airT = rand(30, 44); const g = HM_GATES0[Math.min(GATE.i + 3, HM_GATES0.length - 1)], [tx, tz] = HW(g[0] + rand(-30, 30), g[1] + rand(10, 40)); sndJet(1.8); radio('קשר', pick(['סקייהוקים בדרך, מכים בעמדות מעליכם!', 'סיוע אווירי על הפסגה!']), 2.4); for (let k = 0; k < 3; k++) DIRQ.push({ at: GAME.t + 2.2 + k * 0.3, fn: () => { const p = V3(tx + rand(-12, 12), 0, tz + rand(-10, 10)); p.y = groundAt(p.x, p.z); fxExplosion(p, 2.4); sndBoom(p, 2.2); } }); } }
  if (C.lower && C.syCloth) { C.lower += dt; C.syCloth.position.y = lerp(8.2, 1.1, smooth(0, 3.4, C.lower)); }
  if (C.raise && C.ilCloth) { C.raise += dt; C.ilCloth.position.y = lerp(1.1, 8.2, smooth(0, 4.4, C.raise)); }
}
/* ---------- films ---------- */
function hmIntroFilm() {
  const P0 = HW(...HM_GATES0[0]), P2 = HW(...HM_GATES0[2]), base = V3(P0[0], groundAt(...P0), P0[1]), top = V3(HM.o.x, HM_RY + 6, HM.o.z + 300);
  // the company climbs while the film runs: a file of Golani men up the road past the camera (put back behind the player when it ends)
  const dl = Math.hypot(P2[0] - P0[0], P2[1] - P0[1]) || 1, dx = (P2[0] - P0[0]) / dl, dz = (P2[1] - P0[1]) / dl, at = (a, s = 0, up = 0) => { const x = base.x + dx * a - dz * s, z = base.z + dz * a + dx * s; return V3(x, groundAt(x, z) + up, z); };
  const fr = FRIENDS.slice(0, 8).filter((f) => f.unit.rig.root.visible && f.unit.alive), keep = fr.map((f) => [f, f.state, f.unit.pos.clone(), f.unit.heading]);
  fr.forEach((f, i) => { f.state = 'bunker'; f.target = null; const u = f.unit; u.pos.copy(at(3 - i * 2.3, i % 2 ? 0.8 : -0.8)); u.stance = 'stand'; u.anim = i * 0.7; FILMW.push({ u, dx, dz, sp: 1.25 + (i % 3) * 0.04 }); });
  playCine({ vid: 'hm_intro',
    title: 'החרמון · 22 באוקטובר 1973 · לפנות בוקר',
    shots: [
      { d: 4.6, cam: camLerp(() => base.clone().add(V3(-40, 30, -80)), () => base.clone().add(V3(-30, 40, -60)), () => top, () => top.clone().add(V3(0, -10, 0)), 46) },
      { d: 4.0, cam: (u) => ({ p: at(17 - u * 1.5, 2.6, 1.0), l: at(6 + u * 2, 0, 1.3), fov: 46 }) },
      { d: 3.6, cam: (u) => ({ p: at(-1.5 + u, -1.2, 1.75), l: top, fov: 40 - u * 6 }) },
    ],
    // Skyhawks on the positions up the slope, and the commandos' fire coming down the road at the file
    ev: [[0.9, () => sndJet(1.8)], ...[2.0, 2.35, 2.7, 9.6, 9.9].map((t, k) => [t, () => { const p = at([120, 138, 156, 70, 84][k], rand(-22, 22)); fxExplosion(p, 2.3); sndBoom(p, 2.0); }]),
      ...[5.2, 5.5, 6.4, 7.1, 7.3, 8.2, 10.6, 11.2].map((t) => [t, () => { const a = at(rand(55, 90), rand(-14, 14), 1.0), b = at(rand(-6, 10), rand(-3, 3), rand(0.4, 1.8)); fxTracer(a, b, true); fxDust(b); sndShot('ak', a); }])],
    caps: [[0.3, '<b>22 באוקטובר 1973.</b> שבועיים אחרי שהמוצב בחרמון נפל, לוחמי גולני עולים להחזיר אותו.', 4.3], [4.8, 'כל הלילה נלחמו על המדרונות. הקומנדו הסורי מחכה בצדי הדרך, בשתי טבעות התעלות, בבונקר ועל הגג.', 3.8], [8.7, '<b>מ״פ:</b> ממחסה למחסה. אף אחד לא רץ לבד. קדימה!', 3.4]],
    end: () => { FILMW.length = 0; for (const [f, st, p, hd] of keep) { f.state = st; f.unit.pos.copy(p); f.unit.heading = hd; f.unit.sync(); } gateStart(HM_GATES0.map(([x, z]) => HW(x, z)), hmGate0, () => { feed('הגענו לגדר המוצב', 'good'); hmStage(1); }, 'קטע', 6.5, [25, HM_ROAD.slice(4).map(([x, z]) => HW(x, z))]);   /* the road up: a lane 50 m wide, the climb one bound at a time */ hint('hm-gate', 'עולים בציר <b>קטע אחרי קטע</b>. הקומנדו הסורי כבר שוכב בעמדות האבנים לפניכם - סרקו, צלפו מרחוק, ואז הנקודה הבאה תסומן ב־◆.', 9); },
  });
}
function hmEndFilm() {
  const C = CHAP.hermon, [mx, mz] = HW(-16, 300.5), my = HM_RY, mast = V3(mx, my, mz);
  for (const e of UNITS.enemies) if (e.alive) killEnemy(e, false);
  // the Syrian flag comes down the mast, ours goes up it: one pole, two cloths
  C.syCloth = C.syFlag.children[1]; C.syCloth.visible = true; C.syCloth.position.y = 8.2;
  if (!C.ilFlag) { C.ilFlag = flag(mx, mz, 'il', 9, Math.PI * 0.4); C.objs.push(C.ilFlag); C.ilFlag.children[0].visible = false; } C.ilFlag.position.y = my; C.ilCloth = C.ilFlag.children[1]; C.ilCloth.visible = false; C.ilCloth.position.y = 1.1; C.lower = 0; C.raise = 0;
  FRIENDS.slice(0, 8).forEach((f, i) => { const u = f.unit; if (!u.rig.root.visible) return; f.state = 'post'; f.target = null; const [x, z] = HW(-11 + (i % 4) * 2.4, 297.5 + Math.floor(i / 4) * 2.6); u.place(x, z, HM_RY + 0.3); u.heading = Math.atan2(mx - x, mz - z); u.sync(); });
  { const f = FRIENDS[0], u = f.unit; if (u.rig.root.visible) { f.state = 'bunker'; const [x, z] = HW(-15.1, 299.7); u.place(x, z, HM_RY + 0.3); u.heading = Math.atan2(mx - x, mz - z); u.rig.pose('idle', 0); const R = u.rig; R.sR.rotation.set(-2.7, 0, 0.15); R.eR.rotation.set(-0.5, 0, 0); R.sL.rotation.set(-2.3, 0, -0.15); R.eL.rotation.set(-0.7, 0, 0); R.gun.visible = false; u.sync(); } }   // the one at the halyard
  playCine({ vid: 'hm_end',
    title: 'מוצב החרמון · 22 באוקטובר 1973 · 11:00',
    shots: [
      { d: 4.2, cam: (u) => ({ p: mast.clone().add(V3(5.5, 1.7, -4.2)), l: mast.clone().add(V3(0, 7.2 - u * 4.5, 0)), fov: 44 }) },
      { d: 5.0, cam: (u) => ({ p: mast.clone().add(V3(6.5 - u * 1.2, 1.3, -5.5)), l: mast.clone().add(V3(0, 2.6 + u * 5.2, 0)), fov: 42 }) },
      { d: 9.4, cam: camOrbit(() => mast.clone().add(V3(0, 4, 0)), 30, 0.6, 4.4, 9, 60) },
    ],
    ev: [[0.4, () => { C.lower = 0.001; }], [4.2, () => { C.syCloth.visible = false; C.ilCloth.visible = true; C.raise = 0.001; }]],
    caps: [[0.4, '<b>22 באוקטובר 1973, 11:00.</b> על גג מוצב החרמון יורד הדגל הסורי.', 3.6], [4.4, 'לוחמי גולני מניפים במקומו את דגל ישראל.', 4.4], [9.2, '<b>"אמרו לנו שהחרמון הוא העיניים של מדינת ישראל."</b> · לוחם גולני, באותו בוקר', 4.4], [13.8, 'המוצב חזר לידי צה״ל, יומיים לפני הפסקת האש. 55 מלוחמי גולני נפלו בקרב.', 4.6]],
    end: () => { C.ilCloth.position.y = 8.2; DIRQ.push({ at: GAME.t + 0.3, fn: () => endGame(true) }); },
  });
}
function hmObj() { const en = ['קומנדו סורי', 'סורי בתעלה', 'סורי בחצר', 'סורי בחדר', 'סורי במרפסת', 'סורי על הגג'][HM.stage], pt = ['הסלע הבא', 'העמדה הבאה', 'העמדה הבאה', 'הנקודה הבאה', 'הנקודה הבאה', 'העמדה הבאה'][HM.stage]; return gateObj(en, pt); }
function hmItems(items) { const S = HM_STAGES[HM.stage]; items.push(['go', S.goal || S.sub]); gateItem(items); const n = FRIENDS.filter((f) => f.state === 'follow').length; items.push([n < 3 ? 'warn' : '', `לוחמי גולני איתכם: ${n}`]); }
function hmHints() { if (HM.stage === 0 && GATE.on && GATE.i >= 1) hint('hm-snip', 'הקומנדו הסורי כבר שוכב בעמדות לפניכם וקם כשאתם קרובים. סרקו את צדי הדרך, וצלפו קסדות מרחוק לפני שאתם מתקדמים.', 7); }
function hmMini(g, X, poly, dot, k) {
  const W = (pts) => pts.map(([x, z]) => HW(x, z)), { x0, x1, z0, z1 } = HM_F, U = HM_U;
  miniField(g, X, poly, dot, k, { bg: 'rgba(158,154,142,.92)', polys: [[W([[x0, z0], [x1, z0], [x1, z1], [x0, z1]]), 'rgba(214,210,200,.95)'], [W([[U.x0, U.z0], [U.x1, U.z0], [U.x1, U.z1], [U.x0, U.z1]]), 'rgba(190,186,176,.95)'], [W([[HM_CABLE[0] - 6, HM_CABLE[1] - 4], [HM_CABLE[0] + 6, HM_CABLE[1] - 4], [HM_CABLE[0] + 6, HM_CABLE[1] + 4], [HM_CABLE[0] - 6, HM_CABLE[1] + 4]]), 'rgba(214,210,200,.95)']], lines: [[W(HM_ROAD), 4, 'rgba(120,104,84,.95)'], [W(HM_RING_O), 2.5, 'rgba(70,60,50,.95)'], [W(HM_RING_I), 2.5, 'rgba(70,60,50,.95)'], ...HM_SPURS.filter(Boolean).map((s) => [W(s), 2.5, 'rgba(70,60,50,.95)'])] });
}
function hmEnd(win, why) {
  const stats = [[STATS.kills, 'אויבים נפגעו'], [FRIENDS.filter((f) => f.state === 'follow' || f.state === 'post').length, 'לוחמים איתכם בסוף'], [HM.stage + 1, 'השלב שהגעתם אליו']];
  if (win) return ['החרמון שלנו', 'בלילה שבין 21 ל־22 באוקטובר 1973 עלו לוחמי גולני ממג׳דל שמס להחזיר את המוצב בחרמון, שנכבש בידי קומנדו סורי ביום הראשון למלחמה. הם נלחמו על הדרך, בסלעים, במבני הרכבל, בתעלות המוצב ובתוך הבונקר עצמו, ובאחת עשרה בבוקר הניפו עליו את הדגל. 55 מלוחמי גולני נפלו בקרב.', stats];
  return ['נפגעת', HM.stage >= 3 ? 'בתוך הבונקר יורים מטווח מטרים. עצרו לפני כל פינה, זרקו רימון, ותנו ללוחמים להיכנס איתכם.' : 'העמדות מאוישות מראש - צלפו את הקסדות מרחוק לפני שאתם מתקרבים, ואל תעלו על הסוללה מול הגג.', stats];
}
CHAP.hermon = { stages: HM_STAGES, st: () => HM.stage, dbg: () => ({ py: HM_PY, l0: HM_L0, ry: HM_RY }), cp: () => CHAP.hermon.cpN || 0, upd: hmUpd, obj: hmObj, hints: hmHints, items: hmItems, mini: hmMini, restore: fieldRestore, end: hmEnd, tank: false, dry: true, cloth: 0xf0eee6,
  tod: () => [7 * 60 + 40, 8 * 60 + 35, 9 * 60, 9 * 60 + 25, 9 * 60 + 50, 10 * 60 + 25][HM.stage] - START_MIN + CHAP.hermon.t / 6,
  build: () => chapterBuild(CHAP.hermon, hmBuild), setup: hmSetup, clock: '22.10.1973 · החרמון', toast: ['22 באוקטובר 1973 · לפנות בוקר', 'גולני עולים להחזיר את החרמון'], start: () => fieldStart('hermon') };
