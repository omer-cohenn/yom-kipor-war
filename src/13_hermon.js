
/* ================= chapter 5: the Hermon, 22 October 1973 =================
   Golani climb from Majdal Shams to take back the outpost that fell on the first day of the war. On the road, Syrian commandos lie in wait
   by the roadside and snipers sit on the rocks; at the cable-car station the fighting is room to room. Then the post itself, layer by layer:
   an outer ring of trench, an inner ring with sangars in the yard, the bunker sunk into the rock - a chain of eight rooms, each opening
   into the next, round to the stair in the middle - the six rooms of the upper floor the same way, and last the roof, where the Syrians dug
   in behind walls of stone baskets. Every position is manned before the player can see it: the defenders wait hidden and come alive as the
   fight reaches them - nothing appears out of thin air. */
const HM = { o: { x: 0, z: 11000 }, stage: 0, msgs: {} };
const HW = toWorld(HM.o);
const HM_STAGES = [
  { title: 'בעלייה', sub: 'עוד חושך, וקר. הציר ממג׳דל שמס מתפתל במעלה ההר, ובצדי הדרך, בין הסלעים, שוכב הקומנדו הסורי ומחכה. קטע אחרי קטע, סלע אחרי סלע.', goal: 'נקו קטע, רוצו לקטע הבא (◆). הקומנדו בצדי הדרך ועל הסלעים' },
  { title: 'הטבעת החיצונית', sub: 'הגדר של המוצב. התעלה החיצונית מתפתלת סביבו, עמדה אחרי עמדה, בכיוון אחד בלבד — עד תעלת הקשר שמובילה פנימה.', goal: 'בתעלה החיצונית סביב המוצב, עמדה אחרי עמדה, עד תעלת הקשר (◆)' },
  { title: 'אל דלת הבונקר', sub: 'בתעלת הקשר פנימה, אל הטבעת הפנימית. בחצר סנגרים של אבנים, ובסופה דלת הבונקר שהסורים נעלו מאחוריהם.', goal: 'הטבעת הפנימית, הסנגרים בחצר, ואז דלת הבונקר (◆)' },
  { title: 'בתוך ההר', sub: 'אין כאן מסדרון: חדר נפתח לחדר. חדר השמירה, המגורים, חדר האוכל, המטבח, המחסן, הקשר ומגורי הקצינים — ובאמצע האולם עם המדרגות למעלה. כל דלת נפתחת רק כשהחדר שלפניה נקי.', goal: 'חדר אחרי חדר, עד המדרגות שבאולם האמצעי (◆)' },
  { title: 'הקומה העליונה', sub: 'במדרגות למעלה, אל חדר הקשר. גם כאן חדר אחרי חדר: המודיעין, המגורים, החדר של המ״פ, אולם התצפית — עד המחסן שבו המדרגות לגג.', goal: 'חדר אחרי חדר בקומה העליונה, עד המדרגות לגג (◆)' },
  { title: 'הדגל', sub: 'דרך הפתח אל הגג. קירות של סלסלות אבנים חוצים אותו, וביניהם מסלול אחד שמתפתל עד התורן. שם הם התבצרו, עמדה אחרי עמדה.', goal: 'במסלול שבין קירות הגביונים, עמדה אחרי עמדה, עד התורן (◆)' },
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
/* the bunker: no corridor. Each floor is a chain of rooms, one door from each into the next and no other way between them, the way the
   trenches outside are one lane: the guard room at the door, then deeper and deeper into the post, round to the stair in the middle; upstairs
   the same, round to the stair onto the roof. Each door stays shut until the room before it is clear, so there is only ever one room to take */
const HM_F = { x0: -26, x1: 26, z0: 272, z1: 308 }, HM_DOOR = [6.5, 272];
const HM_U = { x0: -22, x1: 22, z0: 280, z1: 308 };                       // the upper block on the slab; the strip of terrace south of it is never walked
// the rooms of each floor, in the order they are taken. paint: the lower band and the wall above it; wood: a board floor; tz: polished screed (else rough)
const HM_RM = [[
  { id: 'guard', x0: 0, x1: 13, z0: 272, z1: 284, paint: [0x7a8466, 0xe8e2d0] },
  { id: 'bunks', x0: -13, x1: 0, z0: 272, z1: 284, paint: [0x7e8c78, 0xeae5d6] },
  { id: 'mess', x0: -26, x1: -13, z0: 272, z1: 296, paint: [0x8e8064, 0xede6d2] },
  { id: 'kitchen', x0: -26, x1: -13, z0: 296, z1: 308, paint: [0xb9c0b8, 0xeeede6], tz: true },
  { id: 'ammo', x0: -13, x1: 0, z0: 296, z1: 308, paint: [0xa29e94, 0xbcb8ae] },
  { id: 'radio', x0: 0, x1: 13, z0: 296, z1: 308, paint: [0x667579, 0xe4e3da], tz: true },
  { id: 'officers', x0: 13, x1: 26, z0: 284, z1: 308, paint: [0x74604a, 0xebe3d1], wood: true },
  { id: 'hall', x0: -13, x1: 13, z0: 284, z1: 296, paint: [0x737c66, 0xdcd8cb] },
], [
  { id: 'signals', x0: 0, x1: 13, z0: 280, z1: 294, paint: [0x667579, 0xe6e5dc], tz: true },
  { id: 'intel', x0: -9, x1: 0, z0: 280, z1: 294, paint: [0x80907c, 0xebe7da], tz: true },
  { id: 'bunks2', x0: -22, x1: -9, z0: 280, z1: 294, paint: [0x7e8c78, 0xeae5d6] },
  { id: 'cmdr', x0: -22, x1: -9, z0: 294, z1: 308, paint: [0x74604a, 0xebe3d1], wood: true },
  { id: 'obs', x0: -9, x1: 13, z0: 294, z1: 308, paint: [0x7a8466, 0xe6e0ce], tz: true },
  { id: 'store', x0: 13, x1: 22, z0: 294, z1: 308, paint: [0xa29e94, 0xbcb8ae] },
]];
// door k of a floor leads from room k-1 into room k: [x, z, the axis its wall runs along]. The lower floor's door 0 is the way in from the trench
const HM_DR = [[[6.5, 272, 'x'], [0, 281, 'z'], [-13, 275, 'z'], [-22, 296, 'x'], [-13, 303, 'z'], [0, 299, 'z'], [13, 304, 'z'], [13, 291.5, 'z']],
  [null, [0, 291, 'z'], [-9, 283, 'z'], [-19, 294, 'x'], [-9, 304, 'z'], [13, 298, 'z']]];
// slits in the upper block's outer walls, over Syria and the Golan: [x, z, axis]
const HM_WIN = [[-18, 308, 'x'], [-13, 308, 'x'], [-5, 308, 'x'], [0, 308, 'x'], [5, 308, 'x'], [10, 308, 'x'], [17.5, 308, 'x'], [-22, 286, 'z'], [-22, 300, 'z'], [-22, 304, 'z'], [-15.5, 280, 'x'], [-4.5, 280, 'x'], [6.5, 280, 'x']];
const HM_STAIR = { x0: 2, x1: 10, z0: 284.2, z1: 287.6 };              // the hall's stair, along its south wall, rising toward +x into the signals room above
const HM_RSTAIR = { x0: 18.6, x1: 21.6, z0: 298, z1: 306 };            // the store's stair along its east wall, rising toward -z through a hatch onto the roof
const HM_MAST = [-17.5, 294], HM_RW = [14, 5, -4, -13];                 // the flag; the roof's walls of stone baskets, north to south, each open at alternate ends
const HM_CABLE = [56, 44];
const HM_NAMES = ['אבי', 'גיורא', 'דודי', 'ציון', 'ניסים', 'משה', 'יוסי', 'שמוליק', 'רמי', 'עוזי'];
const hmRock = (r) => [0x8f8a80, 0x7d786f, 0x9a948a, 0x6e6a63, 0x878177, 0xa39d92][Math.floor(r() * 6)];   // weathered limestone, grey-tan with lichen (lighter greys read as snow in the sun)
function hmBase(lx, lz) { const cz = clamp(lz, -420, 700), cx = clamp(lx, -260, 260), a = 0.3 * (cz + 200), b = 132 + 0.06 * (cz - 240), ax = Math.abs(cx); return lerp(a, b, smooth(220, 262, cz)) + 0.0009 * cx * cx * (1 - smooth(50, 110, ax)) - 0.28 * Math.max(0, ax - 90) * smooth(80, 140, ax); }
const HM_PY = hmBase(0, 290) + 0.2, HM_L0 = HM_PY - 3.2, HM_U1 = HM_PY + 3.2, HM_RY = HM_U1 + 0.3;
const hmH = (x, z) => hmCarve(x, z, hmNat(x, z));
/* past the map's box the ground is the map's far country (the backdrop's own heights and colour), so the mountain falls away to the Golan
   and the Hula on every side instead of running on as a flat shelf */
function hmOuter(x, z) {
  const F = MAPS.hermon && MAPS.hermon.far; if (!F) return hmNat(x, z);
  const [u, v] = mapUV(F, x, z); COL[0] = mapCh(F.c, u, v, 0); COL[1] = mapCh(F.c, u, v, 1); COL[2] = mapCh(F.c, u, v, 2); return mapBil(F.h, F.W, F.H, u, v);
}
const hmY = (f) => (f === 2 ? HM_RY : f ? HM_PY : HM_L0);
const hmDist = (lx, lz) => { const dx = Math.max(HM_F.x0 - lx, 0, lx - HM_F.x1), dz = Math.max(HM_F.z0 - lz, 0, lz - HM_F.z1); return Math.hypot(dx, dz); };
/* the mountain itself (hmNat, or the map) and the post's works carved into it (hmCarve): the road, the levelled summit, the trenches, the bunker's floor */
function hmNat(x, z) {
  const lx = x - HM.o.x, lz = z - HM.o.z, base = hmBase(lx, lz);
  let h = base + 2.6 * fbm(lx / 42, lz / 42, 3) + 0.7 * fbm(lx / 9, lz / 9, 2);
  // bare limestone, grey and white; dark thorn cushions; dry yellow grass in the hollows
  mix3([0.64, 0.645, 0.65], [0.52, 0.525, 0.53], smooth(-0.3, 0.5, fbm(lx / 30, lz / 30, 3))); mixIn([0.72, 0.72, 0.7], 0.3 * smooth(0.2, 0.6, fbm(lx / 11, lz / 11, 2))); mixIn([0.5, 0.39, 0.31], 0.2 * smooth(0.15, 0.6, noise(lx / 48 + 3, lz / 48))); mixIn([0.34, 0.37, 0.3], 0.14 * smooth(0.3, 0.7, noise(lx / 25, lz / 25 + 9)));
  return h;
}
function hmCarve(x, z, h) {
  const lx = x - HM.o.x, lz = z - HM.o.z, base = hmBase(lx, lz);
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
  const K = { con: [], gab: [], wood: [], prop: [], lamps: [], skin: [], floorC: [], floorW: [], floorT: [], bulb: [] };
  // a straight wall from (a) to (b) in local coordinates, with openings [from, to] measured along it: a door runs from the foot of the wall up
  // to dTop, a window [from, to, bottom, top] is a slit with wall below and above it
  // the walls' concrete is tiled every 2 m (a plain box would stretch the whole texture along a 52 m wall)
  const wUV = (g, len, h, th) => { const uv = g.attributes.uv, n = g.attributes.normal; for (let i = 0; i < uv.count; i++) { const w = Math.abs(n.getX(i)) > 0.5 ? th : len, hh = Math.abs(n.getY(i)) > 0.5 ? th : h; uv.setXY(i, uv.getX(i) * w / 2, uv.getY(i) * hh / 2); } return g; };
  K.wall = (ax, az, bx, bz, y0, y1, gaps = [], th = 0.35, col = 0xffffff, dTop = null, list = K.con) => {
    const L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L, rot = Math.atan2(-uz, ux); let s = 0; const segs = [];
    const piece = (s0, s1, ya, yb) => { if (s1 - s0 < 0.01 || yb - ya < 0.01) return; const m = (s0 + s1) / 2, [wx, wz] = HW(ax + ux * m, az + uz * m), len = s1 - s0; list.push([wUV(new THREE.BoxGeometry(len, yb - ya, th), len, yb - ya, th).rotateY(rot).translate(wx, (ya + yb) / 2, wz), col]); addCollider(wx, wz, len / 2, th / 2, rot, yb, ya); };
    for (const [g0, g1] of [...gaps].sort((p, q) => p[0] - q[0])) { if (g0 > s) segs.push([s, g0]); s = Math.max(s, g1); } if (s < L) segs.push([s, L]);
    for (const [s0, s1] of segs) piece(s0, s1, y0, y1);
    for (const [g0, g1, wb, wt] of gaps) { if (wb === undefined) piece(g0, g1, dTop ?? y1 - 0.6, y1); else { piece(g0, g1, y0, wb); piece(g0, g1, wt, y1); } }
  };
  K.slab = (x0, x1, z0, z1, y, t = 0.3, collide = true) => { const [a, b] = HW(x0, z0), [c, d] = HW(x1, z1); K.con.push([boxUV(a, c, y - t, y, b, d, 2, 2), 0xd8d4cc]); if (collide) addCollider((a + c) / 2, (b + d) / 2, (c - a) / 2, (d - b) / 2, 0, y, y - t); };
  K.gabion = (lx, lz, w, d, h, y, collide = true) => { const [wx, wz] = HW(lx, lz); K.gab.push(boxUV(wx - w / 2, wx + w / 2, y, y + h, wz - d / 2, wz + d / 2, 1, 1)); if (collide) addCollider(wx, wz, w / 2, d / 2, 0, y + h, y - 0.2); };
  // a model of the furniture pack (src/4f_data_furn.js) or the props pack (4f_data_props.js): standing at y, turned ry (0: its front to +z), scaled sc (a
  // number or [x, y, z]). solid: it blocks, sized from the model's own box. Each copy is an instance; all the copies of a model are drawn at once at
  // the end. Returns its top (y without the model). set: K.mdl for the post's furniture, K.mdlC for the cable-car station's, K.mdlT for the trenches'
  K.mdl = {}; K.mdlC = {}; K.mdlT = {};
  K.fm = (name, lx, lz, y, ry = 0, solid = false, sc = 1, set = K.mdl) => {
    if (!mdlHas(name)) return y; const b = mdlBox(name), s = Array.isArray(sc) ? sc : [sc, sc, sc], [wx, wz] = HW(lx, lz);
    (set[name] = set[name] || []).push(M4(wx, y, wz, 0, ry, 0, s[0], s[1], s[2]));
    if (solid) addCollider(wx, wz, b[0] * s[0] / 2, b[2] * s[2] / 2, ry, y + b[1] * s[1], y);
    return y + b[1] * s[1];
  };
  // the same knocked over: tipped rx about its own x axis and rz about its own z, then turned ry; it rests on its lowest corner. solid: a collider
  // round what it covers now (a table on its side is a shield 0.8 high)
  const _q = new THREE.Quaternion(), _e = new THREE.Euler(), _v = V3(), _mt = new THREE.Matrix4(), _my = new THREE.Matrix4();
  K.ft = (name, lx, lz, y, ry, rx, rz = 0, solid = false, set = K.mdl) => {
    if (!mdlHas(name)) return; const b = mdlBox(name), [wx, wz] = HW(lx, lz), lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9]; _q.setFromEuler(_e.set(rx, 0, rz, 'XYZ'));
    for (const sx of [-0.5, 0.5]) for (const sy of [0, 1]) for (const sz of [-0.5, 0.5]) { _v.set(sx * b[0], sy * b[1], sz * b[2]).applyQuaternion(_q); for (let k = 0; k < 3; k++) { lo[k] = Math.min(lo[k], _v.getComponent(k)); hi[k] = Math.max(hi[k], _v.getComponent(k)); } }
    const m = _my.makeRotationY(ry).clone().multiply(_mt.makeRotationFromQuaternion(_q)); m.setPosition(wx, y - lo[1], wz); (set[name] = set[name] || []).push(m);
    if (solid) { const cx = (lo[0] + hi[0]) / 2, cz = (lo[2] + hi[2]) / 2, c = Math.cos(ry), s = Math.sin(ry); addCollider(wx + cx * c + cz * s, wz - cx * s + cz * c, (hi[0] - lo[0]) / 2, (hi[2] - lo[2]) / 2, ry, y + hi[1] - lo[1], y); }
  };
  // a pile of crates: layers of the long weapons crates n side by side, then ammunition boxes, each a little askew; it blocks. Returns its top
  const jr = rng(2311);
  K.pile = (lx, lz, y, ry, layers, boxes, n = 2, solid = true, set = K.mdl) => {
    if (!mdlHas('f_crate_long') || !mdlHas('f_crate_wood')) return y; const L = mdlBox('f_crate_long'), A = mdlBox('f_crate_wood'), s = Math.sin(ry), c = Math.cos(ry); let h = y;
    for (let l = 0; l < layers; l++, h += L[1]) for (let i = 0; i < n; i++) { const o = (i - (n - 1) / 2) * L[2]; K.fm('f_crate_long', lx + s * o, lz + c * o, h, ry + (jr() - 0.5) * 0.05, false, 1, set); }
    for (let k = 0; k < boxes; k++, h += A[1]) K.fm('f_crate_wood', lx, lz, h, ry + (jr() - 0.5) * 0.16, false, 1, set);
    if (solid) { const [wx, wz] = HW(lx, lz); addCollider(wx, wz, (layers ? L[0] : A[0]) / 2, (layers ? n * L[2] : A[2]) / 2, ry, h, y); }
    return h;
  };
  return K;
}
/* ---------- the walls of a floor, its paint, floors, ceilings and lights ----------
   Every room's edges and the floor's outline, merged line by line into straight walls, the doors and slits cut into them. Inside, each room is
   painted the way army posts were: a dark band to shoulder height, a line, pale wash above, darker into the corners where the floor and the
   ceiling meet the wall (all in the vertex colours over a plaster texture); a screed floor or boards; a whitewashed ceiling on concrete beams */
const hmShade = (hex, k) => { const c = new THREE.Color(hex); return c.multiplyScalar(k).getHex(); };
function hmFloorGeo(K, f) {
  const R = HM_RM[f], y0 = hmY(f), yc = f ? HM_U1 : HM_PY - 0.3, B = f ? HM_U : HM_F, tOut = f ? 0.5 : 0.6, doors = HM_DR[f].filter(Boolean), wins = f ? HM_WIN : [];
  const lines = new Map(), add = (ax, c, a, b) => { const k = ax + c; if (!lines.has(k)) lines.set(k, { ax, c, iv: [] }); lines.get(k).iv.push([Math.min(a, b), Math.max(a, b)]); };
  for (const r of R) { add('x', r.z0, r.x0, r.x1); add('x', r.z1, r.x0, r.x1); add('z', r.x0, r.z0, r.z1); add('z', r.x1, r.z0, r.z1); }
  add('x', B.z0, B.x0, B.x1); add('x', B.z1, B.x0, B.x1); add('z', B.x0, B.z0, B.z1); add('z', B.x1, B.z0, B.z1);
  const outer = (ax, c) => (ax === 'x' ? c === B.z0 || c === B.z1 : c === B.x0 || c === B.x1), thick = (ax, c) => (outer(ax, c) ? tOut : 0.35);
  const at = (o, ax, c) => o[2] === ax && Math.abs((ax === 'x' ? o[1] : o[0]) - c) < 1e-6, along = (o, ax) => (ax === 'x' ? o[0] : o[1]);
  const dw = (d) => (d === HM_DR[0][0] ? 1.0 : 0.8);   // half the width of a door: the way in from the trench is 2 m wide, the others 1.6
  for (const { ax, c, iv } of lines.values()) {
    iv.sort((p, q) => p[0] - q[0]); const m = []; for (const v of iv) { const l = m[m.length - 1]; if (l && v[0] <= l[1] + 1e-6) l[1] = Math.max(l[1], v[1]); else m.push([...v]); }
    const out = outer(ax, c), th = thick(ax, c);
    for (let [a, b] of m) {
      a -= th / 2; b += th / 2;   // run into the walls across its ends, so no corner is left open
      const gaps = [];
      for (const d of doors) if (at(d, ax, c)) { const p = along(d, ax); if (p > a && p < b) gaps.push([p - a - dw(d), p - a + dw(d)]); }
      for (const w of wins) if (at(w, ax, c)) { const p = along(w, ax); if (p > a && p < b) gaps.push([p - a - 0.55, p - a + 0.55, y0 + 1.4, y0 + 1.78]); }
      const lo = out && !f ? y0 - 0.4 : y0, hi = f ? yc : out ? HM_PY : yc, col = f ? 0xc9c5bc : 0xb8b4aa;
      if (ax === 'x') K.wall(a, c, b, c, lo, hi, gaps, th, col, y0 + 2.3); else K.wall(c, a, c, b, lo, hi, gaps, th, col, y0 + 2.3);
    }
  }
  // a concrete sill in each doorway of the lower floor, where the room floors stop at the wall (else the rock of the pit shows through)
  if (!f) for (const d of doors) { if (d === HM_DR[0][0]) continue; const [x, z, ax] = d, [a, b] = HW(ax === 'z' ? x - 0.22 : x - 0.8, ax === 'z' ? z - 0.8 : z - 0.22), [c, e] = HW(ax === 'z' ? x + 0.22 : x + 0.8, ax === 'z' ? z + 0.8 : z + 0.22); K.floorC.push([boxUV(a, c, y0 - 0.034, y0 - 0.002, b, e, 1, 1), 0x7a766c]); }
  // the paint, room by room, on the inner face of each of its walls
  const S = 0.02, dado = 1.22, band = 0.06;
  R.forEach((r, ri) => {
    const [lo, hi] = r.paint, inset = (ax, c, sd) => c + sd * (thick(ax, c) / 2 + 0.006), ix0 = inset('z', r.x0, 1), ix1 = inset('z', r.x1, -1), iz0 = inset('x', r.z0, 1), iz1 = inset('x', r.z1, -1);
    const ao = (hex) => (x, y, z) => hmShade(hex, lerp(0.7, 1, smooth(y0, y0 + 0.9, y)) * lerp(1, 0.84, smooth(yc - 0.7, yc, y)));
    const bandBox = (p0, p1, ya, yb, ax, c, sd) => {   // one wall face from p0 to p1 along it, between heights ya and yb, cut into the three bands
      for (const [b0, b1, hex] of [[y0, y0 + dado, lo], [y0 + dado, y0 + dado + band, hmShade(lo, 0.55)], [y0 + dado + band, yc, hi]]) { const u0 = Math.max(ya, b0), u1 = Math.min(yb, b1); if (u1 - u0 < 0.005) continue;
        const [w0, wz0] = HW(ax === 'x' ? p0 : c, ax === 'x' ? c : p0), [w1, wz1] = HW(ax === 'x' ? p1 : c + sd * S, ax === 'x' ? c + sd * S : p1);
        const g = ax === 'x' ? boxUV(w0, w1, u0, u1, Math.min(wz0, wz1), Math.max(wz0, wz1), 4.4, 4.4) : boxUV(Math.min(w0, w1), Math.max(w0, w1), u0, u1, wz0, wz1, 4.4, 4.4); K.skin.push([colored(g, ao(hex)), null]); } };
    for (const [ax, c, sd, p0, p1] of [['x', iz0, 1, ix0, ix1], ['x', iz1, -1, ix0, ix1], ['z', ix0, 1, iz0, iz1], ['z', ix1, -1, iz0, iz1]]) {
      const line = ax === 'x' ? (sd > 0 ? r.z0 : r.z1) : (sd > 0 ? r.x0 : r.x1), cuts = [];
      for (const d of doors) if (at(d, ax, line)) { const p = along(d, ax); if (p > p0 && p < p1) cuts.push([p - dw(d), p + dw(d), y0 + 2.3, yc]); }
      for (const w of wins) if (at(w, ax, line)) { const p = along(w, ax); if (p > p0 && p < p1) cuts.push([p - 0.55, p + 0.55, y0 + 1.4, y0 + 1.78, true]); }
      cuts.sort((p, q) => p[0] - q[0]); let s = p0;
      for (const [q0, q1, ya, yb, win] of cuts) { if (q0 > s) bandBox(s, q0, y0, yc, ax, c, sd); if (win) { bandBox(q0, q1, y0, ya, ax, c, sd); bandBox(q0, q1, yb, yc, ax, c, sd); } else bandBox(q0, q1, ya, yb, ax, c, sd); s = q1; }
      if (s < p1) bandBox(s, p1, y0, yc, ax, c, sd);
    }
    // the floor (screed, or boards in the officers' rooms), the ceiling and its beams across the short way, a bulb or two
    const [a, b] = HW(ix0, iz0), [c2, d] = HW(ix1, iz1), fy = f ? HM_PY + 0.012 : HM_L0 - 0.004;
    if (r.wood) K.floorW.push([boxUV(a, c2, fy - 0.03, fy, b, d, 2.4, 1.28), 0xd8c8b0]); else if (r.tz) K.floorT.push([boxUV(a, c2, fy - 0.03, fy, b, d, 2.2, 2.2), [0xffffff, 0xf2f0ea][ri % 2]]); else K.floorC.push([boxUV(a, c2, fy - 0.03, fy, b, d, 4.6, 4.6), [0x76726a, 0x6e6b64, 0x7a756c][ri % 3]]);
    K.skin.push([colored(boxUV(a, c2, yc - 0.02, yc, b, d, 5.5, 5.5), 0xe4e1d8), null]);
    const wx = ix1 - ix0, wz = iz1 - iz0, alongX = wx < wz, span = alongX ? wz : wx, nb = Math.max(1, Math.round(span / 3.2));
    for (let i = 1; i < nb; i++) { const t = (alongX ? iz0 : ix0) + span * i / nb; const g = alongX ? boxUV(a, c2, yc - 0.28, yc - 0.02, HW(0, t)[1] - 0.16, HW(0, t)[1] + 0.16, 2, 2) : boxUV(HW(t, 0)[0] - 0.16, HW(t, 0)[0] + 0.16, yc - 0.28, yc - 0.02, b, d, 2, 2); K.skin.push([colored(g, (x, y) => hmShade(0xd6d3cb, y > yc - 0.1 ? 0.86 : 1)), null]); }
    const nl = span > 16 ? 2 : 1; for (let i = 0; i < nl; i++) { const t = (i + 0.5) / nl, lx = alongX ? (ix0 + ix1) / 2 : lerp(ix0, ix1, t), lz = alongX ? lerp(iz0, iz1, t) : (iz0 + iz1) / 2, [bx, bz] = HW(lx, lz);
      K.bulb.push([new THREE.SphereGeometry(0.07, 8, 6).translate(bx, yc - 0.36, bz), 0xfff4d0]); K.con.push([new THREE.CylinderGeometry(0.008, 0.008, 0.3, 4).translate(bx, yc - 0.17, bz), 0x222222]); K.lamps.push([bx, yc - 0.45, bz, f, ri]); }
  });
}
/* ---------- the doors between the rooms: steel, painted, shut. Each opens into the room it leads to, once the room before it is clear ---------- */
const HM_DOORS = [[], []];
function hmDoorsBuild() {
  // one mesh a door: the painted leaf, two stiffening ribs across it, the handles (in the vertex colours, over the grime texture)
  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.62, metalness: 0.3, map: TX.grime });
  const geo = build([[new THREE.BoxGeometry(1.56, 2.24, 0.05), 0x5a6450, M4(0.78, 1.12, 0)], [new THREE.BoxGeometry(1.4, 0.06, 0.07), 0x525c48, M4(0.78, 0.35, 0)], [new THREE.BoxGeometry(1.4, 0.06, 0.07), 0x525c48, M4(0.78, 1.9, 0)], [new THREE.BoxGeometry(0.12, 0.04, 0.16), 0x1c1c1a, M4(1.38, 1.02, 0)]]);
  for (let f = 0; f < 2; f++) HM_DR[f].forEach((d, k) => {
    if (!d || (f === 0 && k === 0)) { HM_DOORS[f][k] = null; return; }
    const [x, z, ax] = d, y = hmY(f), into = HM_RM[f][k], u = ax === 'x' ? [1, 0] : [0, 1], c = ax === 'x' ? z : x, n = ax === 'x' ? [0, (into.z0 === c ? 1 : -1)] : [(into.x0 === c ? 1 : -1), 0];
    const hx = x - u[0] * 0.78, hz = z - u[1] * 0.78, [wx, wz] = HW(hx, hz), phi = Math.atan2(-u[1], u[0]), sgn = Math.abs(n[0] - u[1]) < 1e-6 && Math.abs(n[1] + u[0]) < 1e-6 ? 1 : -1;
    const pivot = new THREE.Group(); pivot.position.set(wx, y, wz); pivot.rotation.y = phi;
    pivot.add(new THREE.Mesh(geo, mat)); scene.add(SH(onLayer1(pivot), false, true));
    const [cx, cz] = HW(x, z), col = addCollider(cx, cz, 0.82, 0.12, Math.atan2(-u[1], u[0]), y + 2.3, y - 0.1);
    HM_DOORS[f][k] = { pivot, phi, sgn, col, top: col.top, bot: col.bot, ang: 0, open: false, at: V3(cx, y + 1.2, cz) };
  });
}
function hmDoorSet(d, open, now = true) { if (!d) return; d.open = open; d.req = null; d.col.top = open ? -1e9 : d.top; d.col.bot = open ? -1e9 - 1 : d.bot; if (now) { d.ang = open ? 1 : 0; d.pivot.rotation.y = d.phi + d.sgn * d.ang * 1.66; } }
// the doors as a stage of the post begins (or comes back from a checkpoint at bound g0): every door up to the room the player stands in is open
function hmDoorsSet(stage, g0 = 0) {
  HM_DOORS[0].forEach((d, k) => hmDoorSet(d, stage > 3 || (stage === 3 && k <= g0)));
  HM_DOORS[1].forEach((d, k) => hmDoorSet(d, stage > 4 || (stage === 4 && k <= g0)));
}
function hmDoorsUpd(dt) {
  const st = HM.stage;
  if ((st === 3 || st === 4) && GATE.on && GATE.clear) { const d = HM_DOORS[st - 3][GATE.i + 1]; if (d && !d.open && !d.req) d.req = GAME.t + 1.1; }
  for (const L of HM_DOORS) for (const d of L) { if (!d) continue;
    if (d.req && GAME.t >= d.req) { hmDoorSet(d, true, false); sndBoom(d.at, 0.12); sndClick(260, 0.22); radio('לוחם', pick(['פותחים! רימון ונכנסים!', 'הדלת פתוחה - פנימה!', 'דלת! מכסים, נכנסים!']), 1.8); }
    const tg = d.open ? 1 : 0; if (Math.abs(d.ang - tg) > 1e-3) { d.ang += (tg - d.ang) * Math.min(1, dt * 7); d.pivot.rotation.y = d.phi + d.sgn * d.ang * 1.66; } }
}
/* ---------- the rooms: a Syrian company has lived in the post for two weeks, and the attack catches it at breakfast ----------
   Bunks with the blankets thrown back and mattresses dragged to the floor, rifles left on the beds and on the mess tables, chairs knocked over,
   the radio room with its sets still on, crates of ammunition opened in the store, the officers' beds and the commander's desk. Every piece is a
   model of the furniture and props packs. The defenders: each has his place behind something solid, facing the door the attack comes through
   (cover: 'tab' a table thrown on its side, 'pile' crates, 'bags' sandbags, 'drum' oil drums, 'own' whatever stands there already) */
const HM_TE = Math.PI / 2, HM_TW = -Math.PI / 2, HM_TN = Math.PI;   // the turn that faces a model's front to +x, to -x, to -z (0: to +z)
function hmFurnish(K, f) {
  const C = CHAP.hermon, y = hmY(f), E = HM_TE, W = HM_TW, N = HM_TN, PI = Math.PI, r = rng(2230 + f);
  const F = (n, x, z, ry = 0, solid = false, sc = 1) => K.fm(n, x, z, y, ry, solid, sc);
  const On = (n, x, z, top, ry = 0) => K.fm(n, x, z, top, ry);
  const T = (n, x, z, ry, rx, rz = 0, top = y, solid = false) => K.ft(n, x, z, top, ry, rx, rz, solid);
  const Lie = (n, x, z, ry, top = y) => K.ft(n, x, z, top, ry, 0, PI / 2);             // a rifle on its side
  const Rack = (x, z, ry, n, step = 0.13) => { const c = Math.cos(ry), s = Math.sin(ry); for (let i = 0; i < n; i++) K.ft('akms', x + c * (i - (n - 1) / 2) * step, z - s * (i - (n - 1) / 2) * step, y, ry + PI, -PI / 2 + 0.12, 0); };   // rifles stood on their butts against a wall, leaning in
  const Pile = (x, z, ry, layers, boxes, n = 2, solid = true) => K.pile(x, z, y, ry, layers, boxes, n, solid);
  const Bags = (pts, layers = 4) => bagWall(pts.map(([a, b]) => HW(a, b)), layers, y - 0.02, true);
  const Lockers = (x, z, ry, n) => { if (!mdlHas('f_locker')) return; const b = mdlBox('f_locker'), c = Math.cos(ry), s = Math.sin(ry); for (let i = 0; i < n; i++) { const o = (i - (n - 1) / 2) * b[0]; K.fm('f_locker', x + c * o, z - s * o, y, ry); } const [wx, wz] = HW(x, z); addCollider(wx, wz, n * b[0] / 2, b[2] / 2, ry, y + b[1], y); };
  const Cabs = (x, z, ry, n) => { if (!mdlHas('f_cabinet')) return; const b = mdlBox('f_cabinet'), c = Math.cos(ry), s = Math.sin(ry); for (let i = 0; i < n; i++) { const o = (i - (n - 1) / 2) * b[0]; K.fm('f_cabinet', x + c * o, z - s * o, y, ry); } const [wx, wz] = HW(x, z); addCollider(wx, wz, n * b[0] / 2, b[2] / 2, ry, y + b[1], y); };
  const Jerries = (x, z, ry, n) => { const c = Math.cos(ry), s = Math.sin(ry); for (let i = 0; i < n; i++) K.fm('jerry', x + c * i * 0.2, z - s * i * 0.2, y, ry + (r() - 0.5) * 0.25); };
  const Mess = (x, z, ry, tip = 0) => {   // a mess table: two metal tables end to end, a bench along each side (tip: which bench lies on its side)
    const c = Math.cos(ry), s = Math.sin(ry); for (const o of [-0.615, 0.615]) K.fm('f_table_metal', x + c * o, z - s * o, y, ry); const [wx, wz] = HW(x, z); addCollider(wx, wz, 1.23, 0.34, ry, y + 0.76, y);
    for (const sd of [-1, 1]) for (const o of [-0.66, 0.66]) { const bx = x + c * o + s * sd * 0.56, bz = z - s * o + c * sd * 0.56; if (tip && sd === tip && o > 0) K.ft('f_bench_metal', bx + s * sd * 0.2, bz + c * sd * 0.2, y, ry + 0.2, PI / 2, 0); else K.fm('f_bench_metal', bx, bz, y, ry + (r() - 0.5) * 0.12); } };
  const Desk = (x, z, ry, items, chair = 'f_chair', tip = false) => {   // a desk or table against a wall (front: the side the chair is), what stands on it, the chair
    const n = items.shift(), top = K.fm(n, x, z, y, ry, true), c = Math.cos(ry), s = Math.sin(ry), w = mdlHas(n) ? mdlBox(n)[0] : 1.2;
    items.forEach((it, i) => { const o = ((i + 0.5) / items.length - 0.5) * (w - 0.35); if (it === 'akms') K.ft('akms', x + c * o, z - s * o, top, ry + PI / 2 + (r() - 0.5) * 0.3, 0, PI / 2); else K.fm(it, x + c * o, z - s * o, top, ry + (r() - 0.5) * 0.3); });
    if (chair) { const cx = x + s * 0.72, cz = z + c * 0.72; if (tip) K.ft(chair, cx + s * 0.35, cz + c * 0.35, y, ry + PI + 0.5, -PI / 2, 0); else K.fm(chair, cx, cz, y, ry + PI + (r() - 0.5) * 0.4); } };
  // a defender's place: hiding at (hx, hz) behind his cover, facing the door the attack comes through; he rises to fire over low cover,
  // or steps out beside tall cover. dmin: the lowest level (DIFF) he is there on
  const S = (k, hx, hz, cover, kind = 'rifle', dmin = 0, face = null) => {
    const ent = face || (f === 0 ? HM_DR[0][k] : k === 0 ? [10.4, 285.9] : HM_DR[1][k]), dx = ent[0] - hx, dz = ent[1] - hz, l = Math.hypot(dx, dz) || 1, ux = dx / l, uz = dz / l, ry = Math.atan2(ux, uz);
    let px = hx, pz = hz;
    if (cover === 'tab') K.ft('f_table_wood', hx + ux * 0.42, hz + uz * 0.42, y, ry, PI / 2, 0, true);   /* on its side the wooden table stands 0.8: a man ducked behind it is hidden */
    else if (cover === 'pile') Pile(hx + ux * 0.68, hz + uz * 0.68, ry, 3, 0, 2);   /* the crates broadside to the door */
    else if (cover === 'bags') Bags([[hx + ux * 0.72 - uz * 1.0, hz + uz * 0.72 + ux * 1.0], [hx + ux * 0.72 + uz * 1.0, hz + uz * 0.72 - ux * 1.0]]);
    else if (cover === 'drum') for (const sd of [-1, 1]) K.fm('drum', hx + ux * 0.72 + uz * sd * 0.32, hz + uz * 0.72 - ux * sd * 0.32, y, r() * 3, true);
    else if (cover === 'side') { px = hx - uz * 0.62; pz = hz + ux * 0.62; }   // tall cover beside him: he steps out to his right to fire
    const [wx, wz] = HW(hx, hz), [ppx, ppz] = HW(px, pz);
    C.slots.push({ x: wx, z: wz, y, nx: ux, nz: uz, f, b: null, used: false, fox: true, p: [ppx + ux * 0.08, ppz + uz * 0.08], h: [wx, wz], grp: 'IN', fl: f, room: k, kind, dmin });
  };
  const sign1 = (t, x, z, yy, rot, w = 1.3) => { const [sx, sz] = HW(x, z); sign(t, 'plain', sx, yy, sz, rot, w); };
  if (f === 0) {
    // ---- 0: the guard room inside the door. A sandbag post facing the way in, the sentries' bunks, their table and radio, a rack of rifles ----
    Bags([[8.4, 274.0], [8.4, 275.7], [11.8, 275.7]]); S(0, 9.5, 276.6, 'own', 'lmg');
    S(0, 2.7, 279.7, 'pile'); S(0, 3.0, 276.1, 'bags', 'smg', 2);
    Lockers(12.6, 278.2, W, 4); Desk(10.4, 283.3, N, ['f_table_wood', 'f_radio_set', 'akms', 'f_lamp_k'], 'f_chair', true);
    Cabs(7.2, 283.45, N, 2); F('f_shelf', 4.6, 283.67, N, true); On('f_radio_set', 4.3, 283.68, y + 0.67, N); On('f_lamp_k', 5.0, 283.66, y + 1.13);
    F('f_bunk', 0.58, 274.15, 0, true); F('f_bunk', 0.58, 276.35, 0, true); F('f_mattress', 1.62, 274.6, 0.22); Lie('akms', 1.6, 274.3, 0.3, y + 0.2);
    F('drum', 12.3, 272.95, 0, true); F('drum', 11.65, 272.95, 0.5, true); Jerries(12.45, 273.75, E, 3); Rack(12.62, 280.6, W, 4);
    T('f_chair', 5.8, 278.2, 1.1, -PI / 2); F('f_bench_metal', 2.9, 272.66, 0); F('f_table_metal', 10.3, 280.5, 0, true); On('f_lamp_k', 10.0, 280.55, y + 0.76); F('f_stool_metal', 10.8, 279.75, 0.4);
    F('f_shelf', 0.32, 278.6, E, true); On('f_radio_set', 0.33, 278.3, y + 0.67, E); On('f_lamp_k', 0.33, 279.0, y + 1.13); F('jerry', 7.9, 283.5, 0.2);
    // ---- 1: the first bunk room. Two rows of bunks, blankets thrown back, mattresses dragged off; a table in the middle where they played cards ----
    for (const x of [-12.35, -11.05, -9.75, -6.8, -5.5, -4.2]) F('f_bunk', x, 282.85, 0, true);
    for (const x of [-9.0, -7.7, -6.4, -5.1]) F('f_bunk', x, 273.28, N, true);
    S(1, -8.4, 282.7, 'pile', 'rifle', 0, [0, 281]); S(1, -10.7, 278.0, 'tab'); S(1, -11.4, 273.6, 'tab', 'smg', 1);
    Desk(-6.6, 278.0, 0, ['f_table_wood', 'f_lamp_k', 'f_radio_set'], null); F('f_bench_metal', -6.6, 278.8, 0); F('f_stool_metal', -7.6, 277.3); T('f_stool_metal', -5.4, 277.1, 0.4, PI / 2);
    F('f_mattress', -2.7, 275.2, 1.3); F('f_mattress', -10.2, 280.6, 1.75); Lie('akms', -9.75, 282.5, 0.1, y + 0.54); Lie('akms', -2.4, 275.0, 1.0, y + 0.2); Lie('akms', -5.1, 273.4, 1.6, y + 1.32);
    Lockers(-0.4, 283.5, W, 2); Jerries(-12.45, 277.4, 0, 2); F('crate', -1.2, 272.9, 0.1, true);
    // ---- 2: the mess hall. Long tables and benches, the rifles laid down by the plates, a bench knocked over as they ran ----
    Mess(-22.6, 278.6, E, 1); Mess(-22.6, 283.8, E); Mess(-22.6, 289.0, E, -1); Mess(-17.1, 281.4, E); Mess(-17.1, 286.6, E, 1); Mess(-17.1, 291.8, E);
    for (const [x, z, n] of [[-22.6, 278.0, 'f_lamp_k'], [-22.5, 284.4, 'f_radio_set'], [-17.0, 287.0, 'f_lamp_k'], [-17.2, 291.2, 'f_lamp_k']]) On(n, x, z, y + 0.76, r() * 6);
    Lie('akms', -22.7, 289.4, 0.2, y + 0.76); Lie('akms', -17.0, 281.0, 2.9, y + 0.76); Lie('akms', -22.5, 283.2, 0.1, y + 0.76);
    S(2, -19.6, 279.2, 'tab'); S(2, -24.6, 286.0, 'pile'); S(2, -14.6, 293.3, 'drum', 'lmg', 1); S(2, -19.6, 294.6, 'bags', 'rifle', 2);
    F('f_shelf', -25.55, 293.0, E, true); On('f_radio_set', -25.55, 292.7, y + 0.67, E); F('drum', -25.1, 272.9, 0, true); F('drum', -24.45, 272.95, 1, true); Jerries(-23.8, 272.75, 0, 3); Cabs(-25.35, 275.5, E, 2);
    T('f_chair', -20.0, 286.3, 2.2, -PI / 2); T('f_stool_metal', -15.6, 284.0, 0.7, 0, PI / 2);
    // ---- 3: the kitchen. Ovens and worktops on the north wall, shelves, water drums, food crates; the breakfast left on the prep table ----
    for (const x of [-24.9, -24.3, -23.7]) F('f_oven', x, 307.44, N, true); for (const x of [-22.45, -21.2]) F('f_table_metal', x, 307.36, N, true);
    On('f_lamp_k', -21.6, 307.3, y + 0.76); F('f_shelf', -25.55, 304.6, E, true); F('f_shelf', -25.55, 302.9, E, true); On('f_lamp_k', -25.5, 303.1, y + 1.13);
    for (const [x, z] of [[-25.2, 296.75], [-24.55, 296.8], [-25.2, 297.45]]) F('drum', x, z, r() * 3, true); Pile(-14.0, 297.2, 0, 0, 3, 1); Pile(-15.0, 297.2, 0.1, 0, 2, 1); F('crate', -14.0, 298.4, E, true);
    Desk(-19.5, 302.4, 0, ['f_table_wood', 'f_lamp_k', 'f_radio_set'], null); F('f_stool_metal', -20.2, 301.6); T('f_stool_metal', -18.6, 301.4, 1.0, PI / 2);
    S(3, -15.3, 305.8, 'pile', 'rifle', 0); S(3, -19.4, 303.4, 'own'); S(3, -23.8, 300.6, 'drum', 'smg', 2);
    for (const zz of [299.6, 300.85]) F('f_table_metal', -25.36, zz, E, true); On('f_lamp_k', -25.3, 300.3, y + 0.76); K.fm('f_crate_wood', -25.36, 299.6, y + 0.76, E + 0.1);
    F('f_table_metal', -16.4, 300.4, 0, true); F('f_stool_metal', -16.9, 299.7); F('f_stool_metal', -15.8, 301.15, 2.0); On('f_radio_set', -16.6, 300.5, y + 0.76, 0.3);
    Pile(-17.6, 296.62, 0, 0, 2, 1); F('crate', -19.2, 296.56, 0, true); Jerries(-22.9, 306.95, 0, 3);
    // ---- 4: the ammunition store. Stacks of crates on both long walls, an island of them in the middle, the RPGs on top, a rack of rifles ----
    for (let i = 0; i < 7; i++) { const x = -11.6 + i * 1.5, top = Pile(x, 307.25, 0, 3 + (i % 2), i % 3 === 0 ? 1 : 0, 2); if (i === 2 || i === 5) K.ft('rpg7', x, 307.2, top, PI / 2, 0, PI / 2); }
    for (const x of [-11.2, -9.4]) { const top = K.fm('crate', x, 296.6, y, 0, true); K.fm('crate', x, 296.6, top, 0.05); } Pile(-7.4, 296.75, 0, 2, 2, 2);
    Rack(-3.6, 296.45, 0, 6); Jerries(-0.55, 301.5, -PI / 2, 6); F('drum', -0.65, 305.2, 0, true); F('drum', -0.65, 305.85, 1.3, true);
    S(4, -4.2, 301.6, 'pile', 'rifle', 0); S(4, -7.6, 304.4, 'pile'); S(4, -1.6, 304.0, 'drum', 'lmg', 1);
    K.ft('rpg7', -7.3, 297.0, y + 2 * 0.259 + 2 * 0.231, 0.2, 0, PI / 2); K.ft('crate', -5.6, 299.5, y, 0.6, 0, PI / 2);
    // ---- 5: the radio room. The sets on the long table, the typewriter, the filing cabinets, the map table in the middle ----
    Desk(3.5, 307.3, N, ['f_table_wood', 'f_radio_set', 'f_radio_set', 'f_lamp_desk']); Desk(5.3, 307.3, N, ['f_table_wood', 'f_radio_set', 'f_lamp_k'], 'f_chair', true);
    Desk(9.6, 307.36, N, ['f_desk', 'f_typewriter', 'f_lamp_desk']); Cabs(3.3, 296.53, 0, 4);
    for (const zz of [301.8, 302.6]) F('f_table_wood', 6.6, zz, 0, true); F('f_chair_fold', 5.8, 300.95, 0); F('f_chair_fold', 7.4, 300.95, 0.3); F('f_chair_fold', 5.8, 303.45, N); T('f_chair_fold', 7.6, 303.8, 2.9, -PI / 2); On('f_radio_set', 6.3, 302.4, y + 0.76, 0.4); On('f_lamp_k', 7.0, 301.9, y + 0.76);
    S(5, 10.6, 299.4, 'tab'); S(5, 6.8, 303.7, 'own'); S(5, 11.6, 302.6, 'pile', 'smg', 1);
    Desk(12.43, 299.6, W, ['f_desk', 'f_typewriter', 'f_lamp_desk'], 'f_chair', true); F('f_shelf', 0.32, 304.6, E, true); On('f_radio_set', 0.33, 304.2, y + 0.67, E); On('f_radio_set', 0.33, 305.0, y + 1.13, E); On('f_lamp_k', 0.33, 304.9, y + 0.67);
    // ---- 6: the officers' quarters. Beds and wardrobes in the north half, a line of wardrobes across the room, the commander's office beyond ----
    K.fm('f_bed_wood', 24.7, 306.7, W, true); K.fm('f_bed_wood', 24.7, 302.6, W, true); F('f_wardrobe', 20.6, 307.39, N, true); F('f_wardrobe', 19.05, 307.39, N, true);
    for (const x of [13.95, 15.45, 16.95, 18.45, 19.95]) F('f_wardrobe', x, 296.0, 0, true);
    F('f_sofa', 17.2, 300.3, 0, true); Desk(14.3, 301.0, E, ['f_table_metal', 'f_lamp_k'], 'f_stool_metal'); Lie('akms', 24.6, 302.3, 0.1, y + 0.62);
    S(6, 22.9, 300.2, 'tab'); S(6, 21.8, 305.2, 'bags', 'rifle', 1); F('f_wardrobe', 25.39, 299.2, W, true); F('f_table_metal', 23.25, 304.65, 0, true); On('f_lamp_k', 23.0, 304.7, y + 0.76); On('f_radio_set', 23.6, 304.6, y + 0.76, 0.2);
    Desk(19.4, 284.52, 0, ['f_desk', 'f_typewriter', 'f_lamp_desk', 'f_radio_set']); F('f_sofa', 25.28, 290.0, W, true); F('f_table_metal', 23.9, 290.0, E, true); On('f_lamp_k', 23.9, 289.7, y + 0.76);
    Cabs(23.2, 284.53, 0, 3); F('f_chair', 21.9, 292.8, 2.6); F('f_shelf', 13.33, 287.5, E, true);
    S(6, 15.6, 288.6, 'pile', 'rifle', 0, [23.3, 295.6]); S(6, 18.6, 292.4, 'tab', 'smg', 2, [23.3, 295.6]);
    // ---- 7: the hall in the middle of the post, its stair up to the signals room. The Syrians' last stand on this floor, sandbags at the stair ----
    S(7, -1.0, 289.6, 'bags', 'lmg', 0); S(7, -6.2, 293.6, 'pile'); S(7, -3.4, 286.2, 'drum', 'rifle', 1); S(7, 6.2, 294.6, 'bags', 'smg', 1); S(7, -10.6, 289.2, 'pile', 'rifle', 2);
    Desk(-9.2, 295.4, N, ['f_table_wood', 'f_radio_set', 'f_radio_set']); Desk(-11.4, 295.4, N, ['f_table_wood', 'f_lamp_k', 'akms'], 'f_chair', true);
    Cabs(-12.45, 286.2, E, 3); F('drum', 11.2, 285.0, 0, true); F('drum', 11.9, 285.2, 1, true); Jerries(12.0, 286.0, 0, 3); Pile(2.6, 295.3, 0, 2, 2, 2); F('crate', 0.4, 295.35, 0, true);
    sign1('↑ למעלה', 1.2, 284.24, y + 2.0, 0, 1.2); F('f_shelf', -12.68, 291.8, E, true); On('f_radio_set', -12.67, 291.5, y + 0.67, E); On('f_lamp_k', -12.67, 292.2, y + 1.13);
    Pile(11.6, 295.25, 0, 3, 1, 2); Pile(10.2, 295.25, 0.05, 2, 0, 2); F('drum', 12.3, 294.0, 0.4, true); Jerries(-4.6, 295.55, 0, 4);
    // the post was ours until the 6th: its Hebrew signs are still on the walls
    sign1('מחסן תחמושת · אסור לעשן', -3.6, 296.25, y + 2.05, 0, 1.6);
  } else {
    // ---- 0: the signals room at the head of the stair. Its sets along the east wall, cabinets, a crate store south of the stairwell ----
    Desk(12.42, 289.9, W, ['f_table_wood', 'f_radio_set', 'f_radio_set']); Desk(12.42, 291.7, W, ['f_table_wood', 'f_radio_set', 'f_lamp_desk'], 'f_chair', true); Cabs(4.0, 293.47, N, 4);
    Pile(1.2, 281.0, 0, 3, 1, 2); F('drum', 12.3, 280.9, 0, true); Jerries(11.4, 280.7, 0, 3); F('crate', 8.0, 280.8, 0, true);
    sign1('חדר קשר', 9.0, 280.32, y + 2.3, 0, 1.1); Desk(1.0, 293.49, N, ['f_desk', 'f_typewriter', 'f_lamp_desk']); Pile(3.0, 280.95, 0.05, 2, 2, 2); S(0, 7.2, 291.8, 'tab'); S(0, 11.2, 293.3, 'pile'); S(0, 4.6, 281.6, 'bags', 'rifle', 1); S(0, 1.6, 289.8, 'drum', 'smg', 2);
    // ---- 1: the intelligence room: the Israeli equipment the Syrians took over - desks, typewriters, cabinets of files ----
    Desk(-7.0, 293.49, N, ['f_desk', 'f_typewriter', 'f_lamp_desk']); Desk(-5.4, 293.49, N, ['f_desk', 'f_typewriter'], 'f_chair', true); Cabs(-6.2, 280.61, 0, 5); Desk(-1.0, 286.8, W, ['f_table_wood', 'f_radio_set', 'f_lamp_k']);
    S(1, -7.6, 289.2, 'tab'); S(1, -3.2, 284.2, 'pile'); S(1, -8.0, 285.8, 'drum', 'smg', 2); Cabs(-8.46, 288.2, E, 3); F('f_chair', -2.2, 290.6, 2.4); sign1('מודיעין · כניסה למורשים בלבד', -6.2, 293.75, y + 2.25, Math.PI, 1.7);
    // ---- 2: the upper bunk room ----
    for (const x of [-21.15, -19.85, -18.55, -17.25, -15.95]) F('f_bunk', x, 281.23, N, true);
    for (const z of [285.6, 286.9, 288.2]) F('f_bunk', -20.78, z, E, true); Lockers(-14.0, 293.6, N, 4);
    F('f_mattress', -15.4, 285.2, 0.5); F('f_mattress', -12.0, 288.6, 1.4); Lie('akms', -18.55, 281.0, 0.2, y + 0.54); Lie('akms', -20.6, 286.9, 1.7, y + 1.32);
    Desk(-17.0, 290.0, 0, ['f_table_metal', 'f_lamp_k'], null); F('f_stool_metal', -17.6, 289.3); T('f_stool_metal', -16.2, 289.1, 2.0, PI / 2);
    S(2, -14.6, 290.8, 'tab'); S(2, -19.2, 284.6, 'bags'); S(2, -11.4, 292.6, 'pile', 'smg', 1);
    // ---- 3: the company commander's room: his bed, wardrobe, desk under the slit, a sofa, the map table ----
    K.fm('f_bed_wood', -20.75, 306.4, E, true); F('f_wardrobe', -17.0, 307.44, N, true); Desk(-13.4, 307.41, N, ['f_desk', 'f_typewriter', 'f_lamp_desk', 'f_radio_set']);
    F('f_sofa', -21.33, 299.6, E, true); F('f_table_wood', -15.6, 300.6, 0, true); F('f_chair_fold', -16.2, 299.8, 0); T('f_chair_fold', -14.8, 299.4, 0.8, -PI / 2); On('f_lamp_k', -15.4, 300.8, y + 0.76);
    Cabs(-9.75, 296.0, W, 2); Lie('akms', -20.8, 306.1, 0.2, y + 0.6);
    S(3, -12.0, 301.6, 'tab'); S(3, -16.4, 305.0, 'bags', 'rifle', 1);
    // ---- 4: the observation hall: stations under the slits over Syria, the map table, the RPGs by the windows ----
    for (const x of [-5, 0, 5, 10]) { F('f_table_metal', x, 307.36, N, true); F(x === 0 ? 'f_chair' : 'f_stool_metal', x + 0.2, 306.6, r() * 0.6); }
    On('f_radio_set', -5.2, 307.4, y + 0.76, N); On('f_radio_set', 10.1, 307.4, y + 0.76, N); On('f_lamp_k', 4.8, 307.3, y + 0.76); K.ft('rpg7', 0.1, 307.3, y + 0.76, PI / 2, 0, PI / 2);
    for (const zz of [300.1, 300.9]) F('f_table_wood', 2.0, zz, 0, true); F('f_chair_fold', 1.2, 299.25, 0); F('f_chair_fold', 2.8, 301.75, N); T('f_chair_fold', 3.2, 299.0, 0.9, -PI / 2);
    Cabs(-6.0, 294.53, 0, 4); Rack(12.4, 296.2, W, 3); Cabs(12.46, 302.5, W, 3); Bags([[-3.4, 307.35], [-1.4, 307.35]], 3); Bags([[6.6, 307.35], [8.4, 307.35]], 3);
    S(4, 3.2, 304.2, 'tab'); S(4, 8.2, 297.6, 'pile'); S(4, -3.2, 296.2, 'bags', 'rifle', 1); S(4, 11.2, 305.6, 'drum', 'lmg', 2);
    // ---- 5: the store under the roof hatch ----
    Pile(20.1, 295.0, 0, 3, 1, 2); F('drum', 21.1, 296.6, 0, true); Jerries(18.9, 297.2, 0, 3); F('f_shelf', 13.33, 303.6, E, true); F('crate', 13.7, 306.9, E, true);
    S(5, 16.8, 304.6, 'pile'); S(5, 16.0, 295.4, 'drum', 'smg', 1); Pile(13.62, 300.6, PI / 2, 3, 1, 2); Pile(13.62, 305.3, PI / 2, 2, 2, 2); F('drum', 14.0, 295.0, 0.3, true); F('drum', 14.65, 294.85, 1.2, true);
  }
}
/* the roof: four walls of stone baskets across it, north to south, each open at alternate ends - a lane that winds from the hatch to the flag.
   The men of each stretch wait behind baskets facing the gap the attack comes through */
function hmRoof(K) {
  const C = CHAP.hermon, U = HM_U, yR = HM_RY, H = 1.9;
  const wallZ = (x, z0, z1) => { for (let z = z0 + 0.6; z < z1 - 0.3; z += 1.2) for (let c = 0; c < 2; c++) K.gabion(x + (c ? 0.04 : 0), z, 1.0 - c * 0.08, 1.15, H / 2, yR + c * H / 2, false); const [wx, wz] = HW(x, (z0 + z1) / 2); addCollider(wx, wz, 0.5, (z1 - z0) / 2, 0, yR + H, yR - 0.2); };
  HM_RW.forEach((x, i) => (i % 2 === 0 ? wallZ(x, U.z0 + 3.5, U.z1 - 0.9) : wallZ(x, U.z0 + 0.9, U.z1 - 3.5)));
  const r = rng(2291), st = [[17.2, 285.0, 0, 1, 0], [20.0, 287.6, 0, 1, 1], [8.0, 300.6, 1, -1, 0], [11.4, 304.8, 1, -1, 0], [6.6, 292.2, 1, -1, 1], [0.2, 288.0, 2, 1, 0], [-2.4, 284.0, 2, 1, 0], [2.8, 293.6, 2, 1, 1],
    [-8.6, 300.8, 3, -1, 0], [-11.0, 305.0, 3, -1, 0], [-6.2, 293.2, 3, -1, 1], [-17.2, 288.4, 4, 1, 0], [-20.0, 290.8, 4, 1, 0], [-15.4, 284.2, 4, 1, 1]];
  // each man faces the way the lane comes at his stretch (north or south), a block of baskets in front of him
  for (const [x, z, k, sd, dmin] of st) { K.gabion(x, z + sd * 0.95, 2.4, 1.0, 1.05, yR); const [wx, wz] = HW(x, z); C.slots.push({ x: wx, z: wz, y: yR, nx: 0, nz: sd, f: 2, b: null, used: false, fox: true, roof: true, p: [wx, wz + sd * 0.12], h: [wx, wz], grp: 'R2', room: k, kind: r() < 0.25 ? 'lmg' : 'rifle', dmin }); }
}
/* the small things along the trenches: crates of ammunition, jerrycans, an oil drum, a rifle left against the wall - the models of the props packs */
function hmTrenchProp(K, x, z, y, a, kind) {
  const [lx, lz] = [x - HM.o.x, z - HM.o.z], c = Math.cos(a), s = Math.sin(a), at = (u, v) => [lx + c * u - s * v, lz + s * u + c * v], ry = -a, T = K.mdlT;
  if (kind === 0) K.pile(...at(0, 0), y, ry, 2, 0, 1, false, T);
  else if (kind === 1) { K.fm('jerry', ...at(0, 0), y, ry, false, 1, T); K.fm('jerry', ...at(0.22, 0.04), y, ry + 0.2, false, 1, T); }
  else if (kind === 2) { const top = K.fm('f_crate_wood', ...at(0, 0), y, ry + Math.PI / 2, false, 1, T); K.fm('f_crate_wood', ...at(0.02, 0), top, ry + Math.PI / 2 + 0.1, false, 1, T); }
  else if (kind === 3) K.fm('crate', ...at(0, 0), y, ry, false, 1, T);
  else if (kind === 4) K.fm('drum', ...at(0, 0), y, ry, false, 1, T);
  else K.ft('akms', ...at(0, 0), y, ry, 0, Math.PI / 2, false, T);
}
function hmBuild() {
  const C = CHAP.hermon; C.ground = makeGround({ x0: HM.o.x - 230, x1: HM.o.x + 230, z0: HM.o.z - 210, z1: HM.o.z + 345, step: 1.6, h: mapH('hermon', hmOuter, hmCarve), map: 'hermon', vegOk: (x, z) => { const lx = x - HM.o.x, lz = z - HM.o.z; return distPolyline(lx, lz, HM_ROAD_S) > 5 && hmDist(lx, lz) > 70; } }); GROUND = C.ground;
  const BAGS = [], sv = BATCH.bag; BATCH.bag = BAGS; const k0 = COVER.length; C.slots = [];
  const K = hmBuildKit(), r = rng(2210), stone = [], L = (x, z) => [x - HM.o.x, z - HM.o.z], y0 = HM_L0, y1 = HM_PY, yR = HM_RY;
  const { x0, x1, z0, z1 } = HM_F, [dx] = HM_DOOR, U = HM_U, ST = HM_STAIR, RS = HM_RSTAIR;
  // ---- the two floors: walls, paint, floors, ceilings; the furniture and the defenders' places ----
  hmFloorGeo(K, 0); hmFloorGeo(K, 1); hmFurnish(K, 0); hmFurnish(K, 1); hmDoorsBuild();
  // the hall's stair: rising east along the hall's south wall through a hole in the slab into the signals room; a stringer wall along its open
  // side rising with it, the solid under the steps, and the high end walled in below so nobody walks in under it
  { const [a, b] = HW(ST.x0, ST.z0), [c, d] = HW(ST.x1, ST.z1); addRamp(a, c, b, d, 'x', a, c, y0, y1);
    const n = 15, run = ST.x1 - ST.x0, w = ST.z1 - ST.z0, zc = (ST.z0 + ST.z1) / 2; for (let i = 0; i < n; i++) { const [sx, sz] = HW(ST.x0 + (i + 0.5) * run / n, zc); K.con.push([new THREE.BoxGeometry(run / n + 0.02, 0.2, w).translate(sx, y0 + (i + 1) / n * (y1 - y0) - 0.1, sz), 0x9a968c]); }
    for (let i = 0; i < 4; i++) { const xa = ST.x0 + i * run / 4, xb = xa + run / 4, top = y0 + (i + 1) / 4 * (y1 - y0) + 0.95; K.wall(xa, ST.z1 + 0.08, xb, ST.z1 + 0.08, y0, Math.min(top, y1 - 0.31), [], 0.16, 0x7c8470, null, K.skin); }
    for (let i = 0; i < 4; i++) { const h = Math.max(0.25, (i + 0.15) / 4 * (y1 - y0)), [bx, bz] = HW(ST.x0 + (i + 0.5) * run / 4, zc); K.con.push([new THREE.BoxGeometry(run / 4, h, w - 0.1).translate(bx, y0 + h / 2, bz), 0x8e8a82]); }
    K.wall(ST.x1 + 0.06, ST.z0, ST.x1 + 0.06, ST.z1 + 0.16, y0, y1 - 0.45, [], 0.12, 0x7c8470, null, K.skin);
    // round the hole upstairs, a low wall on three sides; the east end, where the stair comes up, open
    K.wall(ST.x0 - 0.08, ST.z0 - 0.16, ST.x0 - 0.08, ST.z1 + 0.16, y1, y1 + 0.95, [], 0.16, 0x6c7a7e, null, K.skin); for (const zz of [ST.z0 - 0.08, ST.z1 + 0.08]) K.wall(ST.x0, zz, ST.x1 - 0.2, zz, y1, y1 + 0.95, [], 0.16, 0x6c7a7e, null, K.skin); }
  // the store's stair to the roof: along its east wall, rising south through the hatch; its stringer wall on the open side, the high end walled in below
  { const [a, b] = HW(RS.x0, RS.z0), [c, d] = HW(RS.x1, RS.z1); addRamp(a, c, b, d, 'z', d, b, y1, yR);
    const n = 16, run = RS.z1 - RS.z0, w = RS.x1 - RS.x0, xc = (RS.x0 + RS.x1) / 2; for (let i = 0; i < n; i++) { const [sx, sz] = HW(xc, RS.z1 - (i + 0.5) * run / n); K.con.push([new THREE.BoxGeometry(w, 0.2, run / n + 0.02).translate(sx, y1 + (i + 1) / n * (yR - y1) - 0.1, sz), 0x9a968c]); }
    for (let i = 0; i < 4; i++) { const za = RS.z1 - i * run / 4, zb = za - run / 4, top = y1 + (i + 1) / 4 * (yR - y1) + 0.95; K.wall(RS.x0 - 0.08, za, RS.x0 - 0.08, zb, y1, Math.min(top, HM_U1 - 0.01), [], 0.16, 0xa8a49a, null, K.skin); const h = Math.max(0.25, (i + 0.15) / 4 * (yR - y1)), [bx, bz] = HW(xc, (za + zb) / 2); K.con.push([new THREE.BoxGeometry(w - 0.1, h, run / 4).translate(bx, y1 + h / 2, bz), 0x8e8a82]); }
    K.wall(RS.x0 - 0.16, RS.z0 - 0.06, RS.x1, RS.z0 - 0.06, y1, yR - 0.45, [], 0.12, 0xa8a49a, null, K.skin);
    // on the roof, round the hatch: low walls west, north and east; the south end, where the stair comes out, open
    K.wall(RS.x0 - 0.08, RS.z0, RS.x0 - 0.08, RS.z1 + 0.16, yR, yR + 1.0, [], 0.16, 0xc9c5bc); K.wall(RS.x0 - 0.16, RS.z1 + 0.08, RS.x1 + 0.2, RS.z1 + 0.08, yR, yR + 1.0, [], 0.16, 0xc9c5bc); K.wall(RS.x1 + 0.12, RS.z0 - 0.5, RS.x1 + 0.12, RS.z1 + 0.16, yR, yR + 1.0, [], 0.16, 0xc9c5bc); }
  // the slab over the lower floor, split round the stair hole; the terrace apron 3.8 m wide all round, with the strip for the door trench left open
  K.slab(x0 - 0.3, x1 + 0.3, ST.z1, z1 + 0.3, y1, 0.3); K.slab(x0 - 0.3, x1 + 0.3, z0 - 0.3, ST.z0, y1, 0.3); K.slab(x0 - 0.3, ST.x0, ST.z0, ST.z1, y1, 0.3); K.slab(ST.x1, x1 + 0.3, ST.z0, ST.z1, y1, 0.3);
  { const A = 3.8, t = 0.7; for (const [a, b, c, d] of [[x0 - A, dx - 1.6, z0 - A, z0 - 0.3], [dx + 1.6, x1 + A, z0 - A, z0 - 0.3], [x0 - A, x1 + A, z1 + 0.3, z1 + A], [x0 - A, x0 - 0.3, z0 - 0.3, z1 + 0.3], [x1 + 0.3, x1 + A, z0 - 0.3, z1 + 0.3]]) K.slab(a, b, c, d, y1, t, false);
    const F = (a, b, c, d, y) => { const [p, q] = HW(a, c), [s, t2] = HW(b, d); addFloor(p, s, q, t2, y); };
    F(x0 - 3.2, x1 + 3.2, ST.z1, z1 + 3.2, y1); F(x0 - 3.2, dx - 1.6, z0 - 3.2, ST.z0, y1); F(dx + 1.6, x1 + 3.2, z0 - 3.2, ST.z0, y1); F(x0 - 3.2, ST.x0, ST.z0, ST.z1, y1); F(ST.x1, x1 + 3.2, ST.z0, ST.z1, y1); F(dx - 1.6, dx + 1.6, z0 - 0.3, ST.z0, y1);
    // the concrete-walled approach: the last stretch of the door trench between retaining walls
    { const [a, b] = HM_SPURS[3], ux = b[0] - a[0], uz = b[1] - a[1], l = Math.hypot(ux, uz), nx = -uz / l, nz = ux / l; for (const sd of [-1, 1]) K.wall(a[0] + ux * 0.35 + nx * sd * 1.5, a[1] + uz * 0.35 + nz * sd * 1.5, b[0] + nx * sd * 1.5, b[1] + nz * sd * 1.5, y0 - 0.3, y1 + 0.25, [], 0.4); }
    // the roof slab over the upper block, split round the hatch, and its walkable top
    K.slab(U.x0 - 0.3, U.x1 + 0.3, U.z0 - 0.3, RS.z0, yR, 0.3); K.slab(U.x0 - 0.3, U.x1 + 0.3, RS.z1, U.z1 + 0.3, yR, 0.3); K.slab(U.x0 - 0.3, RS.x0, RS.z0, RS.z1, yR, 0.3); K.slab(RS.x1, U.x1 + 0.3, RS.z0, RS.z1, yR, 0.3);
    F(U.x0 - 0.3, U.x1 + 0.3, U.z0 - 0.3, RS.z0, yR); F(U.x0 - 0.3, U.x1 + 0.3, RS.z1, U.z1 + 0.3, yR); F(U.x0 - 0.3, RS.x0, RS.z0, RS.z1, yR); F(RS.x1, U.x1 + 0.3, RS.z0, RS.z1, yR); }
  // ---- the gabion blast layer: baskets of stone round the terrace (nobody walks the terrace: they close it off from the yard) and round the roof ----
  for (let x = x0 - 2.5; x <= x1 + 2.5; x += 1.2) { if (Math.abs(x - dx) > 2.4) K.gabion(x, z0 - 2.6, 1.15, 1.0, 1.1, y1); K.gabion(x, z1 + 2.6, 1.15, 1.0, 1.1, y1); }
  for (let z = z0 - 1.5; z <= z1 + 1.5; z += 1.2) { K.gabion(x0 - 2.6, z, 1.0, 1.15, 1.1, y1); K.gabion(x1 + 2.6, z, 1.0, 1.15, 1.1, y1); }
  for (let x = U.x0 + 0.6; x <= U.x1 - 0.5; x += 1.2) { K.gabion(x, U.z1 - 0.5, 1.15, 1.0, 1.1, yR); K.gabion(x, U.z0 + 0.5, 1.15, 1.0, 1.1, yR); }
  for (let z = U.z0 + 1.7; z <= U.z1 - 1.6; z += 1.2) { K.gabion(U.x0 + 0.5, z, 1.0, 1.15, 1.1, yR); if (z < RS.z0 - 0.8 || z > RS.z1 + 0.8) K.gabion(U.x1 - 0.5, z, 1.0, 1.15, 1.1, yR); }
  hmRoof(K);
  // antennas, the radar dome on the terrace, the observation cupola on the roof, a water tank in the yard
  for (const [lx, lz, hgt] of [[-31, 300, 22], [31, 280, 28]]) { const [wx, wz] = HW(lx, lz), y = groundAt(wx, wz); for (const [ox, oz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) K.prop.push([G.cyl(0.07, 0.09, hgt, 5), 0x8e8e88, M4(wx + ox * 0.9, y + hgt / 2, wz + oz * 0.9, oz * 0.025, 0, -ox * 0.025)]); for (let k = 1; k < hgt / 1.6; k++) { const yy = y + k * 1.6, w = 0.9 * (1 - k * 1.6 / hgt * 0.35); K.prop.push([G.box(w * 2, 0.04, 0.04), 0x8e8e88, M4(wx, yy, wz - w, 0, 0, k % 2 ? 0.5 : -0.5)], [G.box(w * 2, 0.04, 0.04), 0x8e8e88, M4(wx, yy, wz + w, 0, 0, k % 2 ? -0.5 : 0.5)], [G.box(0.04, 0.04, w * 2), 0x8e8e88, M4(wx - w, yy, wz, k % 2 ? 0.5 : -0.5, 0, 0)], [G.box(0.04, 0.04, w * 2), 0x8e8e88, M4(wx + w, yy, wz, k % 2 ? -0.5 : 0.5, 0, 0)]); } K.prop.push([G.sph(1.3, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.45), 0xd8d8d0, M4(wx, y + hgt * 0.78, wz + 1.1, -1.3, 0, 0)]); addCollider(wx, wz, 1.1, 1.1, 0, y + hgt, y); }
  { const [wx, wz] = HW(-16, 276); K.prop.push([G.sph(3.4, 22, 12, 0, Math.PI * 2, 0, Math.PI * 0.55), 0xe8e8e2, M4(wx, y1 + 0.4, wz)], [G.cyl(3.5, 3.6, 0.6, 22), 0xbab8b0, M4(wx, y1 + 0.3, wz)]); addCollider(wx, wz, 3.0, 3.0, 0, y1 + 3.6, y1); }
  { const [wx, wz] = HW(-8, 296.4); K.prop.push([G.cyl(0.7, 0.7, 1.0, 12), 0x55524a, M4(wx, yR + 0.5, wz)], [G.box(1.0, 0.28, 0.3), 0x1a1a1a, M4(wx, yR + 0.9, wz + 0.5)]); addCollider(wx, wz, 0.75, 0.75, 0, yR + 1.0, yR); }
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
  for (const line of LINES) { const d = densify(line, 4.2); for (let i = 1; i < d.length; i++) { if (hmDist(...d[i]) < 3.5 || HM_PILL.some((b) => Math.hypot(d[i][0] - b.cx, d[i][1] - b.cz) < 4.6)) continue; const [x, z] = d[i], [px, pz] = d[i - 1], a = Math.atan2(z - pz, x - px), sd = i % 2 ? 1 : -1, [wx, wz] = HW(x - Math.sin(a) * 0.85 * sd, z + Math.cos(a) * 0.85 * sd); hmTrenchProp(K, wx, wz, groundAt(wx, wz) + 0.04, a, Math.floor(r() * 6)); } }
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
  { const [mx, mz] = HW(...HM_MAST); C.syFlag = flag(mx, mz, 'sy', 9, Math.PI * 0.4); C.syFlag.position.y = yR; }
  // the roof's edge, looking out over the rings: the Syrians fire down from it while the rings are fought for
  for (const [lx, lz, nx, nz] of [[-15, 281.5, 0, -1], [0, 281.5, 0, -1], [16, 281.5, 0, -1], [-20.5, 287, -1, 0], [-20.5, 301, -1, 0], [20.5, 287, 1, 0], [-9, 306.5, 0, 1], [0, 306.5, 0, 1], [9.5, 306.5, 0, 1]]) { const [wx, wz] = HW(lx, lz); C.slots.push({ x: wx, z: wz, y: yR, nx, nz, f: 2, b: null, used: false, fox: true, roof: true, p: [wx + nx * 0.25, wz + nz * 0.25], h: [wx - nx * 0.9, wz - nz * 0.9], grp: 'R' }); }
  // the sangars in the yard between the inner ring and the bunker, facing out at the ring
  const sangar = (lx, lz, fx, fz, grp, k, hi = 0) => { const l = Math.hypot(fx, fz) || 1; fx /= l; fz /= l; const [wx, wz] = HW(lx, lz), y = groundAt(wx, wz) + hi, a0 = Math.atan2(fx, fz); for (let s = -95; s <= 95; s += 19) { const t = a0 + THREE.MathUtils.degToRad(s); stone.push([wx + Math.sin(t) * 1.35, wz + Math.cos(t) * 1.35, 0.35 + r() * 0.2, r() * 6, hmRock(r), 0.25, 0.6]); } addCover(wx - fx * 0.3, wz - fz * 0.3, fx, fz, 0.7);
    const s = { x: wx, z: wz, y: y - 0.05, nx: fx, nz: fz, f: 0, b: null, used: false, fox: true, p: [wx + fx * 0.2, wz + fz * 0.2], h: [wx - fx * 0.3, wz - fz * 0.3], grp, k }; C.slots.push(s); if (hi) stone.push([wx, wz, hi * 0.9, r() * 6, hmRock(r), 0.3, 0.72]); return s; };
  for (const [lx, lz, fx, fz] of [[0, 314, 0, 1], [-18, 313, -0.4, 0.92], [-8, 266, -0.3, -0.95], [16, 267, 0.3, -0.95], [-33, 296, -0.9, 0.3], [33, 284, 0.9, -0.3]]) { const s0 = sangar(lx, lz, fx, fz, 'Y', 0), l = Math.hypot(fx, fz), sx = -fz / l * 0.8, sz = fx / l * 0.8; C.slots.push({ ...s0, x: s0.x + sx, z: s0.z + sz, p: [s0.p[0] + sx, s0.p[1] + sz], h: [s0.h[0] + sx, s0.h[1] + sz] }); }
  // ---- the cable-car station on the road: a concrete building, the pylon, the cable climbing to the summit ----
  { const [cx, cz] = HM_CABLE, gy = groundAt(...HW(cx, cz)) - 0.2, wl = (ax, az, bx, bz, g = []) => K.wall(ax, az, bx, bz, gy, gy + 3.2, g, 0.3);
    wl(cx - 6, cz - 4, cx + 6, cz - 4, [[2.6, 3.8], [8.4, 9.6]]); wl(cx - 6, cz + 4, cx + 6, cz + 4, [[5, 7]]); wl(cx - 6, cz - 4, cx - 6, cz + 4, [[3.4, 4.6]]); wl(cx + 6, cz - 4, cx + 6, cz + 4); wl(cx, cz - 4, cx, cz + 4, [[3.4, 4.6]]);
    K.slab(cx - 6.3, cx + 6.3, cz - 4.3, cz + 4.3, gy + 3.5, 0.3); const [wx, wz] = HW(cx, cz); K.con.push([boxUV(wx - 6, wx + 6, gy - 0.02, gy + 0.02, wz - 4, wz + 4, 2, 2), 0x8e8a82]);
    const M = K.mdlC;
    for (const [lx, lz, f] of [[cx - 3, cz + 1.5, 'store'], [cx + 3, cz - 1.5, 'radio']]) { const top = K.fm('f_table_wood', lx, lz, gy, 0, true, 1, M); const [ax, az] = HW(lx, lz - 0.8); COVER.push({ x: ax, z: az, nx: 0, nz: -1, h: 0.9, by: null });
      if (f === 'store') { K.fm('jerry', lx - 0.5, lz, top, 0.3, false, 1, M); K.fm('f_lamp_k', lx + 0.1, lz + 0.1, top, 0, false, 1, M); K.ft('akms', lx + 0.45, lz - 0.1, top, 1.4, 0, Math.PI / 2, false, M); }
      else { K.fm('f_radio_set', lx - 0.3, lz + 0.12, top, Math.PI, false, 1, M); K.fm('f_radio_set', lx + 0.35, lz + 0.15, top, Math.PI + 0.2, false, 1, M); K.fm('f_chair', lx, lz - 0.75, gy, 0.2, false, 1, M); } }
    K.pile(cx - 4.5, cz - 2.5, gy, 0.3, 2, 1, 2, true, M); K.fm('drum', cx + 4.8, cz + 2.8, gy, 0.5, true, 1, M); K.fm('jerry', cx + 4.2, cz + 2.4, gy, 0.2, false, 1, M); K.ft('f_chair', cx - 1.5, cz - 2.2, gy, 2.1, -Math.PI / 2, 0, false, M);
    const [px, pz] = HW(cx + 9, cz + 12), py = groundAt(px, pz); for (const [ox, oz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) K.prop.push([G.cyl(0.1, 0.14, 14, 5), 0x7e7e78, M4(px + ox * 0.8, py + 7, pz + oz * 0.8)]); K.prop.push([G.box(4.5, 0.4, 0.6), 0x6e6e68, M4(px, py + 14, pz)], [G.cyl(0.9, 0.9, 0.3, 16), 0x3a3a36, M4(px - 2, py + 14.3, pz, Math.PI / 2, 0, 0)]);
    const [tx, tz] = HW(28, 304), ty = HM_PY + 12, cab = new THREE.CatmullRomCurve3([V3(px - 2, py + 14.2, pz), V3((px + tx) / 2, (py + ty) / 2 + 2, (pz + tz) / 2), V3(tx, ty, tz)]); K.prop.push([new THREE.TubeGeometry(cab, 40, 0.04, 4, false), 0x1a1a1a]); }
  // Syrian sangars on the slopes and commandos lying by the road: stone half-rings and hollows among the rocks
  for (let k = 0; k < HM_GATES0.length - 1; k++) { const A = HM_GATES0[k], B = HM_GATES0[k + 1], ddx = B[0] - A[0], ddz = B[1] - A[1], l = Math.hypot(ddx, ddz) || 1;
    for (let j = 0; j < 4; j++) { const t = 0.25 + j * 0.18, px = lerp(A[0], B[0], t), pz = lerp(A[1], B[1], t), sd = j % 2 ? 1 : -1, off = j < 2 ? rand(4, 7) : rand(10, 21); const [sx, sz] = corr(HM_ROAD, px - ddz / l * off * sd, pz + ddx / l * off * sd, 22, 3.5); sangar(sx, sz, -ddx / l, -ddz / l, j < 2 ? 'A' : 'S', k, j === 3 && k % 2 ? 1.6 : 0); } }
  // ---- dress the mountain ----
  const okS = (x, z) => { const [lx, lz] = L(x, z); return distPolyline(lx, lz, HM_ROAD_S) > 5 && distPolyline(lx, lz, HM_RING_O) > 3.6 && distPolyline(lx, lz, HM_RING_I) > 3.6 && hmDist(lx, lz) > 4.8 && Math.hypot(lx - HM_CABLE[0], lz - HM_CABLE[1]) > 9 && !HM_SPURS.some((s) => s && distPolyline(lx, lz, s) < 3.4) && !C.slots.some((s) => Math.hypot(s.x - x, s.z - z) < 2.2); };
  const X0 = HM.o.x - 225, X1 = HM.o.x + 225, Z0 = HM.o.z - 205, Z1 = HM.o.z + 340;
  for (let k = 0; k < 16; k++) { const d = densify(HM_ROAD, 12), [x, z] = d[Math.floor(r() * d.length)], a = r() * 6, [wx, wz] = HW(x + (r() - 0.5) * 12, z + (r() - 0.5) * 12); if (okS(wx, wz)) hmTrenchProp(K, wx, wz, groundAt(wx, wz), a, [0, 1, 3, 4][Math.floor(r() * 4)]); }
  // the burnt-out wrecks on the road up: Syrian jeeps shot up on the way, and two of our tanks from the attempts before
  for (const [x, z, rr] of [[30, -70, 0.8], [-12, 70, 2.4]]) { const [wx, wz] = HW(x, z); hmJeepWreck(wx, wz, rr); }
  for (const [x, z, b] of [[10, -40, 30], [-6, 130, 200]]) { const [wx, wz] = HW(x, z); placeTank(wx, wz, b, TANK_BURNT); }
  roadRibbon(HM_ROAD.map(([x, z]) => HW(x, z)), 6.5, 'asphalt');
  roadPoles(HM_ROAD.map(([x, z]) => HW(x, z)), 24, 6);
  { const fence = [[-14, 222], [-68, 230], [-76, 290], [-68, 350], [-14, 358], [14, 358], [68, 350], [76, 290], [68, 230], [14, 222]]; wireFence(fence.map(([x, z]) => HW(x, z)), 3); for (const [x, z] of densify(fence, 2.2)) { const [wx, wz] = HW(x + (x > 0 ? 1.6 : -1.6) * (Math.abs(x) > 40 ? 1 : 0), z + (z > 300 ? 1.6 : -1.6)); K.prop.push([G.tor(0.45, 0.02, 4, 16), 0x5a5a56, M4(wx, groundAt(wx, wz) + 0.4, wz, 0, Math.random() * 3, 0)]); } }
  { const [wx, wz] = HW(12, 226); fieldSign(wx, wz, 'מוצב החרמון', Math.PI, 1.5); const [a, b] = HW(48, 34); fieldSign(a, b, 'רכבל החרמון', 0.6, 1.3); }
  { const pt = plasterTex(2214, '#b4b0a6'); scene.add(SH(onLayer1(new THREE.Mesh(build(K.con), new THREE.MeshStandardMaterial({ vertexColors: true, map: pt, bumpMap: bumpOf(pt), bumpScale: 0.8, roughness: 0.95 }))))); }
  // inside: the paint over a fine plaster, the screed floors, the board floors, the bulbs
  { const pt = plasterTex(2215, '#f3f0e8'); scene.add(SH(onLayer1(new THREE.Mesh(build(K.skin), new THREE.MeshStandardMaterial({ vertexColors: true, map: pt, bumpMap: LITE ? null : bumpOf(pt), bumpScale: 0.45, roughness: 0.9 }))), false, true)); }
  { const gt = TX.grime; if (K.floorC.length) scene.add(SH(onLayer1(new THREE.Mesh(build(K.floorC), new THREE.MeshStandardMaterial({ vertexColors: true, map: gt, bumpMap: LITE ? null : bumpOf(gt), bumpScale: 0.6, roughness: 0.96 }))), false, true));
    const pk = !!MDL_TEX['props/plank/map'], wm = new THREE.MeshStandardMaterial({ vertexColors: true, map: pk ? mdlTex('props/plank/map') : plankTex(), roughness: 0.85 }); if (pk && !LITE && MDL_TEX['props/plank/nmap']) { wm.normalMap = mdlTex('props/plank/nmap', false); wm.normalScale.set(0.7, 0.7); }
    if (K.floorW.length) scene.add(SH(onLayer1(new THREE.Mesh(build(K.floorW), wm)), false, true));
    // a harder floor in the offices and the kitchen: polished screed, its fine aggregate showing (the road's grain, lightened), worn and cracked
    if (K.floorT.length) scene.add(SH(onLayer1(new THREE.Mesh(build(K.floorT), new THREE.MeshStandardMaterial({ vertexColors: true, map: MAT.asphalt.map, roughness: 0.62, color: 0xdedbd4 }))), false, true)); }
  if (K.bulb.length) scene.add(onLayer1(new THREE.Mesh(build(K.bulb), new THREE.MeshBasicMaterial({ vertexColors: true }))));
  scene.add(SH(onLayer1(new THREE.Mesh(build(K.prop), MAT.vc))));
  scene.add(SH(onLayer1(new THREE.Mesh(build(K.wood), new THREE.MeshStandardMaterial({ vertexColors: true, map: TX.wood, roughness: 0.92 })))));
  // the furniture models: all the copies of each in one draw; indoors under concrete, none casts a shadow. The post's can only be seen from close by:
  // both levels of detail are built and hmUpd shows the full models inside the post, the lighter ones from the yard and none from further out
  C.furn = [[], []]; for (const n in K.mdl) for (let l = 0; l < 2; l++) for (const m of mdlInst(n, l, K.mdl[n], null, false)) { m.visible = false; m.userData.dyn = true; C.furn[l].push(m); }
  for (const n in K.mdlC) mdlInst(n, LITE ? 1 : 0, K.mdlC[n], null, false);
  for (const n in K.mdlT) mdlInst(n, 1, K.mdlT[n], null, false);   // along the trenches: the lighter models, seen from a few metres at the nearest
  if (K.gab.length) scene.add(SH(onLayer1(new THREE.Mesh(mergeGeometries(K.gab, false), MAT.gabion))));
  // warm bulbs in the rooms: three real lights, moved to the bulbs nearest the eye (hmUpd); the rest only glow
  C.lamps = K.lamps; C.plights = [0, 1, 2].map(() => { const lt = new THREE.PointLight(0xffd9a0, 0, 13, 2); lt.userData.dyn = true; scene.add(lt); return lt; }); C.plT = 0;
  // the wall hangings: the staff maps of the radio room, the intelligence room and the commander's, a portrait, the clocks
  { const W = (k, lx, yy, lz, ry, sd = 1) => { const [x, z] = HW(lx, lz); propWall('hermon', k, x, yy, z, ry, sd, 'e'); }, yl = y0, yu = y1, E = Math.PI / 2, Wf = -Math.PI / 2, N = Math.PI;
    // each hangs a few centimetres off the painted face of its wall
    W('map', 6.5, yl + 1.65, 296.24, 0, 3); W('map', 12.76, yl + 1.6, 301.5, Wf, 9); W('clock', 1.5, yl + 2.2, 296.24, 0); W('calendar', 0.24, yl + 1.5, 302.5, E, 1);
    W('map', 18.2, yl + 1.65, 284.24, 0, 4); W('portrait', 21.4, yl + 1.75, 284.24, 0, 6); W('clock', 13.24, yl + 2.1, 300.0, E); W('calendar', 25.635, yl + 1.5, 295.0, Wf, 2);
    W('portrait', 10.5, yl + 1.75, 272.365, 0, 5); W('clock', -6.5, yl + 2.2, 283.76, N); W('calendar', -25.635, yl + 1.6, 279.0, E, 1); W('clock', -19.5, yl + 2.2, 272.365, 0);
    W('map', -2.5, yu + 1.65, 280.315, 0, 10); W('map', -21.685, yu + 1.6, 296.8, E, 11); W('portrait', -15.0, yu + 1.75, 294.24, 0, 7); W('map', 2.0, yu + 1.7, 294.24, 0, 12); W('clock', 12.76, yu + 2.2, 288.0, Wf); W('calendar', -9.24, yu + 1.6, 290.0, Wf, 2); }
  instScatter(ROCK_G, stone.concat(scatterIn(LITE ? 1400 : 3600, X0, X1, Z0, Z1, 2211, okS, (x, z, rr) => [x, z, 0.25 + rr() ** 2.5 * 1.5, rr() * 6, hmRock(rr), 0.2, 0.5]), scatterNear(HM_ROAD.map(([x, z]) => HW(x, z)), LITE ? 400 : 900, 5, 26, 2212, okS, (x, z, rr) => [x, z, 0.3 + rr() ** 2 * 1.3, rr() * 6, hmRock(rr), 0.2, 0.5])));
  { const bl = scatterNear(HM_ROAD.map(([x, z]) => HW(x, z)), LITE ? 70 : 160, 7, 24, 2213, okS, (x, z, rr) => [x, z, 1.1 + rr() * 1.8, rr() * 6, hmRock(rr), 0.3, 0.6]).concat(scatterIn(LITE ? 110 : 260, X0, X1, Z0, Z1, 2214, okS, (x, z, rr) => [x, z, 1.4 + rr() * 2.6, rr() * 6, hmRock(rr), 0.3, 0.55])); instScatter(BOULDER_G, bl); boulders(bl); }
  instScatter(BUSH_G, scatterIn(LITE ? 400 : 1000, X0, X1, Z0, Z1, 2215, okS, (x, z, rr) => [x, z, 0.25 + rr() * 0.4, rr() * 6, rr() < 0.5 ? 0x4a5038 : rr() < 0.5 ? 0x6e6650 : 0x5c5a48, -0.2, 0.45]));
  dressArea(X0, X1, Z0, Z1, okS, 2220, 1.3, 0.1, { rock: hmRock, trees: 0, grass: 0.5 }); dressRoute(HM_ROAD.map(([x, z]) => HW(x, z)), okS, 2221, 1.4, 0.1, { rock: hmRock, trees: 0, grass: 0.5 });
  for (const [x, z, s] of [[-600, 400, 40], [500, 200, 30], [-300, -500, 50]]) { const [wx, wz] = HW(x, z); smokeColumn(wx, wz, s, false); }
  BATCH.bag = sv; if (BAGS.length) scene.add(bagMesh(BAGS)); C.covers = COVER.slice(k0); for (const c of C.covers) if (c.floor === undefined) c.y = groundAt(c.x, c.z);
  hmPano();
}
// a Syrian jeep burnt out on the road: the modelled jeep in their paint, broken and on fire (the rules of the post: tanks and jeeps only)
function hmJeepWreck(x, z, rot) {
  if (typeof VEH_DATA === 'undefined' || !VEH_DATA.jeep) return; const rec = vehModel('jeep', 'e'), m = rec.g, g0 = groundAt(x, z); vehDamage(rec, true); rec.dead = true;
  m.position.set(x, g0, z); m.rotation.y = rot; wreckTilt(m, rng(Math.round(x * 7 + z * 3) >>> 0)); scene.add(SH(onLayer1(m))); addCollider(x, z, 2.05, 0.95, rot, g0 + 2.0); coverBox(x, z, 2.05, 0.95, rot, 2.0); wreckFire(m, VEH_FIRE.jeep, 0.85);
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
  const NR = LITE ? 70 : 112, NA = LITE ? 180 : 300, R0 = 0.12, R1 = 62, [cx, cz] = HW(0, 290), post = HM_PY, F = MAPS.hermon && MAPS.hermon.far;   // the far country from the map when it has one
  const pos = new Float32Array((NR + 1) * NA * 3), col = new Float32Array((NR + 1) * NA * 3), hz = new Float32Array((NR + 1) * NA), K = 1 / 0.787, C = (r, g, b) => [lin(r) * K, lin(g) * K, lin(b) * K], r = rng(2290);
  const LIME = C(0.68, 0.67, 0.64), ROCK = C(0.52, 0.5, 0.47), OCHRE = C(0.58, 0.5, 0.37), SCRUB = C(0.37, 0.38, 0.28), DRY = C(0.64, 0.57, 0.4), BASALT = C(0.33, 0.31, 0.28), FIELD = C(0.42, 0.48, 0.3), FIELD2 = C(0.56, 0.5, 0.36), ORCH = C(0.3, 0.37, 0.24), WATER = C(0.24, 0.36, 0.46), VILL = C(0.72, 0.7, 0.66);
  const mixc = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  for (let i = 0; i < NR; i++) { const km = R0 * Math.pow(R1 / R0, i / (NR - 1));
    for (let j = 0; j < NA; j++) { const a = (j / NA) * Math.PI * 2, E = Math.sin(a) * km, N = Math.cos(a) * km, lx = -E * 1000, lz = 290 + N * 1000;
      // near the post the mountain of the map itself, far off the country round it
      // the far map is drawn with its distances squeezed past 4 km (r' = 4 + 0.42 (r - 4)), so it is read at the squeezed radius
      let far, fc = null; if (F) { const q = km > 4 ? (4 + (km - 4) * 0.42) / km : 1, [u, v] = mapUV(F, HM.o.x + lx * q, HM.o.z + 290 + (lz - 290) * q); const fr = mapCh(F.c, u, v, 0), fg = mapCh(F.c, u, v, 1), fb = mapCh(F.c, u, v, 2), dry = 1 - smooth(0.02, 0.08, fb - fr); far = mapBil(F.h, F.W, F.H, u, v) - post + dry * (6 + 40 * smooth(0.3, 4, km)) * fbm(E / 0.4, N / 0.4, 3); fc = C(fr, fg, fb); } else far = hmPanoH(E, N);
      const near = hmBase(lx, lz) + 2.6 * fbm(lx / 42, lz / 42, 3) - post, w = F ? smooth(0.16, 0.42, km) : smooth(0.35, 1.6, km), h = lerp(near, far, w), o = (i * NA + j) * 3;
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
      if (fc) c = mixc(c, fc, w * (fc[2] > fc[0] * 1.15 ? 1 : 0.78));   // the map's own country (its lake drawn in its colour), keeping a little of the patchwork above so its smooth slopes are not one flat grey
      col[o] = c[0]; col[o + 1] = c[1]; col[o + 2] = c[2];
      hz[i * NA + j] = Math.min(0.9, 1 - Math.exp(-km / 24)) * (0.85 + 0.15 * smooth(-1500, 0, -h)); } }
  // a haze bank round the outer edge, rising to the post's own level: from up here the land ends a degree below the horizon, and the sky under
  // the horizon would show there as a black band
  for (let j = 0; j < NA; j++) { const o = ((NR - 1) * NA + j) * 3, o2 = (NR * NA + j) * 3; pos[o2] = pos[o]; pos[o2 + 1] = post + 40; pos[o2 + 2] = pos[o + 2]; col[o2] = col[o]; col[o2 + 1] = col[o + 1]; col[o2 + 2] = col[o + 2]; hz[NR * NA + j] = 1; }
  const idx = []; for (let i = 0; i < NR; i++) for (let j = 0; j < NA; j++) { const a = i * NA + j, b = i * NA + (j + 1) % NA, c2 = (i + 1) * NA + j, d = (i + 1) * NA + (j + 1) % NA; idx.push(a, c2, b, b, c2, d); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.setAttribute('aHaze', new THREE.BufferAttribute(hz, 1)); g.setIndex(idx); g.computeVertexNormals();
  // the rings run the other way round to the faces' front, so the computed normals point down: turned over, the near slopes take the sun (they were lit from below, black under the haze)
  { const nn = g.attributes.normal.array; for (let i = 0; i < nn.length; i++) nn[i] = -nn[i]; }
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
/* ---------- the advance, bound by bound ---------- */
const HM_GATES0 = (() => { const d = densify(HM_ROAD.slice(4), 1), out = [d[0]]; let acc = 0; for (let i = 1; i < d.length; i++) { acc += Math.hypot(d[i][0] - d[i - 1][0], d[i][1] - d[i - 1][1]); if (acc >= 50) { out.push(d[i]); acc = 0; } } const e = d[d.length - 1]; if (Math.hypot(out[out.length - 1][0] - e[0], out[out.length - 1][1] - e[1]) > 30) out.push(e); else out[out.length - 1] = e; return out; })();
/* the gate points of each stage of the post, in local coordinates (a third number is the floor height the player must be on; a fourth and fifth,
   a point to face when the stage starts there). Inside, a point is a step through each door into the room it opens: bound k is room k */
const HM_G = {
  1: [[5, 238], [-44, 252], [-60, 290], [-44, 328], [0, 342], [44, 328], [60, 290], [44, 252], [28, 246.3]],
  2: [[28, 246.3], [24, 264.8], [30, 266], [42, 290], [30, 314], [0, 320], [-30, 314], [-42, 290], [-30, 266], [0, 260], [6.5, 270, HM_L0 + 0.6]],
  3: [[6.5, 270.4, HM_L0 + 0.3, 6.5, 280], [-1.6, 281, HM_L0], [-14.6, 275, HM_L0], [-22, 297.6, HM_L0], [-11.4, 303, HM_L0], [1.6, 299, HM_L0], [14.6, 304, HM_L0], [11.4, 291.5, HM_L0], [1.2, 285.9, HM_L0]],
  4: [[0.9, 285.9, HM_L0, 8, 285.9], [-1.6, 291, HM_PY], [-10.6, 283, HM_PY], [-19, 295.6, HM_PY], [-7.4, 304, HM_PY], [14.6, 298, HM_PY], [20.1, 296.6, HM_RY]],
  5: [[20.1, 296.4, HM_RY, 20.1, 285], [14, 282.2, HM_RY], [5, 305.8, HM_RY], [-4, 282.2, HM_RY], [-13, 305.8, HM_RY], [-17.5, 294.6, HM_RY]],
};
const HM_LABEL = { 1: 'עמדה', 2: 'עמדה', 3: 'חדר', 4: 'חדר', 5: 'עמדה' };
const hmDiff = () => Math.max(0, DIFF.indexOf(diff));
/* ---------- who stands where: every position of a stage is manned before the player can see it and waits hidden ----------
   outside, a man wakes when his bound opens or the player comes within his waking distance; the roof fires down at the rings from far off.
   Inside, the room being taken and the one behind the next shut door are manned, each man at his own place facing the door; the room
   wakes as the player comes through its door */
function hmPlaceRoom(f, k) {
  const C = CHAP.hermon, D = hmDiff(), grp = f === 2 ? 'R2' : 'IN';
  for (const s of C.slots) if (s.grp === grp && (f === 2 || s.fl === f) && s.room === k && !s.used && s.dmin <= D) fSlotPlace(s, s.kind === 'lmg' && D === 0 ? 'rifle' : s.kind, 'g' + k, { wakeG: k, wakeR: 3.5 });
}
function hmPlace(st, g0 = 0) {
  const C = CHAP.hermon, pts = HM_G[st], seg = (lx, lz) => gateSegOf(pts, lx, lz);
  const put = (s, kind, k, wakeR) => (k < g0 ? null : fSlotPlace(s, kind, 'g' + k, { wakeG: k, wakeR }));
  if (st === 1 || st === 2) {
    const ring = st === 1 ? 'o' : 'i', bays = [...new Set(C.slots.filter((s) => s.grp === 'T' && s.ring === ring).map((s) => s.bay))];
    bays.forEach((b, i) => { if (st === 1 ? i % 2 === 1 : i % 3 === 2) return; const two = C.slots.filter((s) => s.bay === b && !s.used); two.forEach((s, j) => put(s, j === 0 && i % 3 === 0 ? 'lmg' : i % 7 === 3 && j === 1 ? 'sniper' : 'rifle', seg(...s.at), 24)); });
    C.slots.filter((s) => s.grp === 'B' && s.ring === ring && !s.used).forEach((s) => put(s, s.door ? 'rifle' : 'lmg', seg(...s.at), 30));   /* the trench bunkers: a machine gun at the slit, a rifleman at the door */
    { let n = 0; for (const s of C.slots) if (s.grp === 'R' && !s.used && n < (st === 1 ? 4 : 5)) { if (fSlotPlace(s, n === 1 ? 'lmg' : 'rifle', 'roof', { wakeR: 70 })) n++; } }   /* the roof over the rings: they fire down, and nobody goes up there */
  }
  if (st >= 3) { const f = st - 3; hmPlaceRoom(f, g0); hmPlaceRoom(f, g0 + 1); }
}
/* a bound opens: a word on the radio, and two or three men come down the trench from two bounds ahead (or out of a door), in plain sight */
function hmRunners(ring, pts, k, n, tag) {
  const d = densify(ring, 2).map(([x, z]) => HW(x, z)), near = (p) => { const [wx, wz] = HW(p[0], p[1]); let b = 0, bd = 1e9; d.forEach((q, i) => { const dd = Math.hypot(q[0] - wx, q[1] - wz); if (dd < bd) { bd = dd; b = i; } }); return b; };
  const i1 = near(pts[Math.min(k + 1, pts.length - 1)]), i2 = near(pts[Math.min(k + 2, pts.length - 1)]); if (i2 <= i1) return;
  const path = d.slice(i1, i2 + 1).reverse();
  for (let j = 0; j < n; j++) DIRQ.push({ at: GAME.t + 1.5 + j * 1.4, spawn: true, gate: k, fn: () => { const [sx, sz] = path[0]; const e = fSpawnStreet(sx + rand(-0.5, 0.5), sz + rand(-0.5, 0.5), path.slice(1), 'rifle'); if (e) e.sq = tag; } });
}
const HM_SAY = {
  3: ['חדר השמירה! רימון פנימה, ואז נכנסים!', 'המגורים! הם בין המיטות!', 'חדר האוכל - שולחנות הפוכים, הם מאחוריהם!', 'המטבח! לנקות!', 'המחסן! מאחורי הארגזים - ולא לירות לתוך התחמושת!', 'חדר הקשר! לא לתת להם לשדר!', 'מגורי הקצינים! שורת ארונות באמצע - חלק מהם מעבר לה!', 'האולם! שקי חול מול המדרגות - הקו האחרון שלהם למטה!'],
  4: ['הם מעל המדרגות! רימון דרך הפתח, ואז למעלה!', 'חדר המודיעין!', 'עוד חדר מגורים, מלא!', 'החדר של המ״פ שלהם!', 'אולם התצפית! הם מאחורי השולחנות, מול החלונות!', 'המחסן! המדרגות לגג בקצה!'],
  5: ['על הגג! קירות של סלסלות אבנים - דרך אחת, עד התורן!', 'מעבר לפינה! עוד שלושה מאחורי הגביונים!', 'השורה הבאה! רימונים!', 'עוד מעבר אחד!', 'התורן! העמדה האחרונה שלהם!'],
};
function hmWake(st, k) {
  const C = CHAP.hermon, pts = HM_G[st], tag = 'g' + k, last = pts.length - 2;
  if (k > 0 && k % 3 === 0 && k < last) { C.cpG = k; CP.stats = { ...STATS }; feed('נקודת שמירה', 'good'); }
  if (st === 1) { hmRunners(HM_RING_O, pts, k, 2 + (k >= 4 ? 1 : 0), tag); if (k > 0) radio('מ״פ', pick(['העמדה הבאה בתעלה! רימון מעבר למחסום!', 'יורים עליכם מהגג, ראש למטה!', 'הם רצים אלינו בתעלה! לחסל!', 'קסדות מעל שקי החול - לצלוף לפני שמתקרבים!']), 2.4); }
  if (st === 2) { if (k >= 1 && k < last) hmRunners(HM_RING_I, pts.slice(1), k - 1, 2, tag); if (k === last) { for (let j = 0; j < 3; j++) DIRQ.push({ at: GAME.t + 1 + j * 1.3, spawn: true, gate: k, fn: () => { const [sx, sz] = HW(6.5 + rand(-1, 1), 277); const e = fSpawnStreet(sx, sz, [HW(6.5, 270.5), HW(2 + rand(-1, 1), 263)], 'smg'); if (e) e.sq = tag; } }); radio('מ״פ', 'הם יוצאים מהבונקר! לירות! אחר כך, פנימה בעקבותיהם!', 3); } else if (k > 0) radio('צנחן', pick(['סנגר בחצר, מימין!', 'הטבעת הפנימית מאוישת - עמדה אחרי עמדה!', 'הם על הגג, מעלינו!', 'רימון לתוך העמדה!']), 2.2); }
  if (st >= 3) {
    // the room is entered: its men are up, and counted from now (each is behind something solid, and a bound that has seen none of its men for
    // a few seconds is taken as clear); the room behind the next door is manned
    for (const e of UNITS.enemies) if (e.alive && e.sq === tag) { e.seenAt = GAME.t; e.dormant = false; }
    hmPlaceRoom(st - 3, k + 1); if (k > 0 || st === 5) radio(k % 2 ? 'לוחם' : 'מ״פ', HM_SAY[st][k], 2.4);
    if (st === 3 && k === 1) hint('hm-door', 'כל דלת בבונקר <b>נעולה</b> עד שהחדר שלפניה נקי - ואז נפתחת. כשהיא נפתחת, מאחוריה כבר מחכים: עמדו בצד הפתח, רימון פנימה, ואז נכנסים.', 8);
    if (st === 5 && k === 0) hint('hm-lane', 'על הגג אין לאן לברוח: בין קירות הגביונים יש <b>מסלול אחד</b> שמתפתל מהפתח עד התורן. בכל קטע עמדה מחכה מול המעבר.', 7);
  }
}
/* ---------- stages ---------- */
function hmSetup(stage) {
  const C = CHAP.hermon; fieldSetupCommon(C, stage); resetTrail(); HM.msgs = {};
  if (C.syFlag) { C.syFlag.children[1].visible = true; C.syFlag.children[1].position.y = 8.2; } if (C.ilFlag) C.ilFlag.children[1].visible = false; C.lower = 0; C.raise = 0;
  P.mode = 'rifle'; vm.visible = true; if (TANK.g) TANK.g.visible = false;
  const g0 = stage ? Math.min(C.cpG || 0, HM_G[stage].length - 2) : 0, pts = stage ? HM_G[stage] : HM_GATES0, at = pts[g0], nx = at[3] !== undefined ? [at[3], at[4]] : pts[Math.min(g0 + 1, pts.length - 1)], [x, z] = HW(at[0], at[1]);
  P.pos.set(x, at[2] !== undefined ? hAt(x, z, at[2] + 0.3) : groundAt(x, z), z); P.yaw = Math.atan2(-(nx[0] - at[0]), -(nx[1] - at[1])); P.pitch = 0.02;
  hmDoorsSet(stage, g0);
  // the squad behind him, each man where he can stand: inside the post a spot behind him that is not in a wall, else at his heels
  const fw = [-Math.sin(P.yaw), -Math.cos(P.yaw)], spot = (i) => { const b = 2.2 + i * 1.3, sd = i % 2 ? 0.8 : -0.8, cand = [[b, sd], [b, 0], [b * 0.6, sd], [b * 0.4, 0], [1.2, sd * 0.5]];
    for (const [bb, s] of cand) { const px = P.pos.x - fw[0] * bb + s * fw[1], pz = P.pos.z - fw[1] * bb - s * fw[0], y = stage >= 3 ? hAt(px, pz, P.pos.y + 0.3) : groundAt(px, pz); if (stage < 3 || (!blocked(px, pz, 0.35, y) && Math.abs(y - P.pos.y) < 1.2)) return [px, pz, stage >= 3 ? y : undefined]; }
    return [P.pos.x + (i % 3 - 1) * 0.4, P.pos.z + 0.3, stage >= 3 ? P.pos.y : undefined]; };
  fieldFriends(HM_NAMES.map((name, i) => { if (i >= 8) return null; const [px, pz, py] = spot(i); return { name, x: px, z: pz, y: py, state: 'follow', fi: i }; }));
  hmStage(stage, g0);
}
function hmStage(i, g0 = 0) {
  const C = CHAP.hermon; fieldStage(C, i); HM.stage = i; C.t = 0; C.cpG = g0;
  fieldDespawn((e) => !!e.sz);
  // once inside, the men left on the roof edge over the rings are gone: the roof is fought for in its turn, along its own lane
  if (i >= 3) for (const e of UNITS.enemies) if (e.alive && e.sq === 'roof') { e.alive = false; e.rig.root.visible = false; e.tag.visible = false; if (e.slot) { e.slot.used = false; e.slot = null; } }
  // the last stage's survivors fight on where they are, but their bound numbers belong to the old stage: they no longer hold a bound of this one;
  // and the men it still had on their way in (queued to run down a trench) are not sent - they would arrive tagged for a bound of this stage
  for (const e of UNITS.enemies) if (e.alive && e.sq && e.sq !== 'roof') e.sq = 'was' + e.sq;
  for (let j = DIRQ.length - 1; j >= 0; j--) if (DIRQ[j].spawn) DIRQ.splice(j, 1);
  hmDoorsSet(i, g0);
  const go = (st, done, r = 6.5) => { const pts = HM_G[st].map(([x, z, y]) => [...HW(x, z), y]); gateStart(pts, (k) => { if (k >= g0) hmWake(st, k); }, done, HM_LABEL[st], r, st === 1 ? 1.45 : st === 2 ? [1.45, [HW(36, 249.1), ...pts.map((q) => [q[0], q[1]])]] : 0);   /* the inner stage's lane takes in the end of the outer trench, where the player stands when it begins; inside the walls and the shut doors are the lane */ if (g0) { GATE.i = g0; GATE.t = 0; GATE.clear = false; hmWake(st, g0); } };
  if (i === 0) DIRQ.push({ at: GAME.t + 0.3, fn: () => hmIntroFilm() });
  if (i === 1) { hmPlace(1, g0); radio('מ״פ', 'הגענו לגדר! לתוך התעלה החיצונית, ומתקדמים בה סביב המוצב - עמדה אחרי עמדה, עד תעלת הקשר פנימה. לא יוצאים מהתעלה!', 4.6); hint('hm-ring', 'כל העמדות בתעלה <b>מאוישות מראש</b>: חפשו קסדות מעל שקי החול וצלפו מרחוק. העמדה הבאה מסומנת ב־◆; מי שרץ אליכם בתעלה - בא משתי עמדות קדימה.', 9); go(1, () => { feed('הטבעת החיצונית נקייה', 'good'); hmStage(2); }); }
  if (i === 2) { hmPlace(2, g0); radio('מ״פ', 'הטבעת החיצונית שלנו! בתעלת הקשר פנימה, מנקים את הטבעת הפנימית והסנגרים בחצר, ואז דלת הבונקר בדרום!', 4.4); go(2, () => { feed('החצר נקייה · לדלת הבונקר', 'good'); hmStage(3); }); }
  if (i === 3) { hmPlace(3, g0); radio('מ״פ', 'נכנסים לבונקר! אין כאן מסדרון - חדר שנפתח לחדר, עד האולם עם המדרגות באמצע. חדר אחרי חדר, ואף אחד לא נשאר מאחור.', 4.4); hint('hm-cqb', 'בתוך הבונקר יורים מטווח מטרים ספורים. כל מגן יושב מאחורי משהו מוצק ומול הדלת: עצרו בצד הפתח, זרקו רימון, וכנסו רק אחרי הפיצוץ.', 9); go(3, () => { feed('הקומה התחתונה נקייה · למדרגות', 'good'); hmStage(4); }, 2.4); }
  if (i === 4) { hmPlace(4, g0); if (!g0) radio('מ״פ', HM_SAY[4][0], 3); go(4, () => { feed('הקומה העליונה נקייה · לגג', 'good'); hmStage(5); }, 2.4); }
  if (i === 5) { hmPlace(5, g0); go(5, () => { feed('המוצב בידינו', 'good'); radio('מ״פ', 'המוצב שלנו! להביא את הדגל!', 3.5); DIRQ.push({ at: GAME.t + 2, fn: hmEndFilm }); }, 3.0); }
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
  // inside and on the roof every man of the room being taken counts until he is down, seen or not (one behind the wardrobes still holds the
  // door shut; the marker leads to him); the framework's time limits on a bound still apply
  if (HM.stage >= 3 && GATE.on) { const tag = 'g' + GATE.i; for (const e of UNITS.enemies) if (e.alive && e.sq === tag) e.seenAt = GAME.t; }
  updTrail(dt); gateUpd(dt); hmDoorsUpd(dt);
  // the post's furniture: the full models inside the post (the lighter ones in the light setting), the lighter ones within 40 m of it, none further out
  const cd = hmDist(camera.position.x - HM.o.x, camera.position.z - HM.o.z);
  if (C.furn) { const l = cd < 4 && !LITE ? 0 : cd < 40 ? 1 : -1; C.furn.forEach((list, k) => { for (const m of list) m.visible = k === l; }); }
  // the three real lights go to the bulbs nearest the eye on its own floor; out of the post they are off
  if (C.plights && (C.plT -= dt) <= 0) { C.plT = 0.3; const c = camera.position, fl = c.y < HM_PY - 0.2 ? 0 : 1, inside = cd < 1 && c.y < HM_RY;
    const near = inside ? C.lamps.map((q) => [q, Math.hypot(q[0] - c.x, q[2] - c.z) + (q[3] === fl ? 0 : 60)]).sort((a, b) => a[1] - b[1]) : [];
    C.plights.forEach((lt, i) => { const q = near[i]; if (q && q[1] < 22) { lt.position.set(q[0][0], q[0][1], q[0][2]); lt.intensity = 55; } else lt.intensity = 0; }); }
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
  const C = CHAP.hermon, [mx, mz] = HW(...HM_MAST), my = HM_RY, mast = V3(mx, my, mz);
  for (const e of UNITS.enemies) if (e.alive) killEnemy(e, false);
  // the Syrian flag comes down the mast, ours goes up it: one pole, two cloths
  C.syCloth = C.syFlag.children[1]; C.syCloth.visible = true; C.syCloth.position.y = 8.2;
  if (!C.ilFlag) { C.ilFlag = flag(mx, mz, 'il', 9, Math.PI * 0.4); C.objs.push(C.ilFlag); C.ilFlag.children[0].visible = false; } C.ilFlag.position.y = my; C.ilCloth = C.ilFlag.children[1]; C.ilCloth.visible = false; C.ilCloth.position.y = 1.1; C.lower = 0; C.raise = 0;
  // the squad round the mast, in the last stretch of the roof's lane (its walls stand on either side)
  FRIENDS.slice(0, 8).forEach((f, i) => { const u = f.unit; if (!u.rig.root.visible) return; f.state = 'post'; f.target = null; const [x, z] = HW(HM_MAST[0] - 2.8 + (i % 4) * 1.7, HM_MAST[1] + 3.2 + Math.floor(i / 4) * 2.2); u.place(x, z, HM_RY + 0.3); u.heading = Math.atan2(mx - x, mz - z); u.sync(); });
  { const f = FRIENDS[0], u = f.unit; if (u.rig.root.visible) { f.state = 'bunker'; const [x, z] = HW(HM_MAST[0] + 0.9, HM_MAST[1] - 0.8); u.place(x, z, HM_RY + 0.3); u.heading = Math.atan2(mx - x, mz - z); u.rig.pose('idle', 0); const R = u.rig; R.sR.rotation.set(-2.7, 0, 0.15); R.eR.rotation.set(-0.5, 0, 0); R.sL.rotation.set(-2.3, 0, -0.15); R.eL.rotation.set(-0.7, 0, 0); R.gun.visible = false; u.sync(); } }   // the one at the halyard
  playCine({ vid: 'hm_end',
    title: 'מוצב החרמון · 22 באוקטובר 1973 · 11:00',
    shots: [
      { d: 4.2, cam: (u) => ({ p: mast.clone().add(V3(2.6, 1.7, 5.6)), l: mast.clone().add(V3(0, 7.2 - u * 4.5, 0)), fov: 46 }) },
      { d: 5.0, cam: (u) => ({ p: mast.clone().add(V3(-2.4 + u * 1.2, 1.3, 7.0)), l: mast.clone().add(V3(0, 2.6 + u * 5.2, 0)), fov: 44 }) },
      { d: 9.4, cam: camOrbit(() => mast.clone().add(V3(0, 4, 0)), 30, 0.6, 4.4, 9, 60) },
    ],
    ev: [[0.4, () => { C.lower = 0.001; }], [4.2, () => { C.syCloth.visible = false; C.ilCloth.visible = true; C.raise = 0.001; }]],
    caps: [[0.4, '<b>22 באוקטובר 1973, 11:00.</b> על גג מוצב החרמון יורד הדגל הסורי.', 3.6], [4.4, 'לוחמי גולני מניפים במקומו את דגל ישראל.', 4.4], [9.2, '<b>"אמרו לנו שהחרמון הוא העיניים של מדינת ישראל."</b> · לוחם גולני, באותו בוקר', 4.4], [13.8, 'המוצב חזר לידי צה״ל, יומיים לפני הפסקת האש. 55 מלוחמי גולני נפלו בקרב.', 4.6]],
    end: () => { C.ilCloth.position.y = 8.2; DIRQ.push({ at: GAME.t + 0.3, fn: () => endGame(true) }); },
  });
}
function hmObj() { const en = ['קומנדו סורי', 'סורי בתעלה', 'סורי בחצר', 'סורי בחדר', 'סורי בחדר', 'סורי על הגג'][HM.stage], pt = ['הסלע הבא', 'העמדה הבאה', 'העמדה הבאה', 'החדר הבא', 'החדר הבא', 'המעבר הבא'][HM.stage]; return gateObj(en, pt); }
function hmItems(items) { const S = HM_STAGES[HM.stage]; items.push(['go', S.goal || S.sub]); gateItem(items); const n = FRIENDS.filter((f) => f.state === 'follow').length; items.push([n < 3 ? 'warn' : '', `לוחמי גולני איתכם: ${n}`]); }
function hmHints() { if (HM.stage === 0 && GATE.on && GATE.i >= 1) hint('hm-snip', 'הקומנדו הסורי כבר שוכב בעמדות לפניכם וקם כשאתם קרובים. סרקו את צדי הדרך, וצלפו קסדות מרחוק לפני שאתם מתקדמים.', 7); }
function hmMini(g, X, poly, dot, k) {
  const W = (pts) => pts.map(([x, z]) => HW(x, z)), { x0, x1, z0, z1 } = HM_F, U = HM_U, fl = HM.stage === 3 ? 0 : HM.stage === 4 ? 1 : -1;
  // inside, the rooms of the floor the player is on, each outlined, so the chain from door to door can be read
  const rooms = fl < 0 ? [] : HM_RM[fl].map((r) => [W([[r.x0, r.z0], [r.x1, r.z0], [r.x1, r.z1], [r.x0, r.z1], [r.x0, r.z0]]), 1.2, 'rgba(60,54,46,.9)']);
  const walls = fl === 1 ? [] : HM_RW.map((x, i) => [W(i % 2 === 0 ? [[x, U.z0 + 3.5], [x, U.z1 - 0.9]] : [[x, U.z0 + 0.9], [x, U.z1 - 3.5]]), 1.6, 'rgba(92,86,76,.9)']);
  miniField(g, X, poly, dot, k, { bg: 'rgba(158,154,142,.92)', polys: [[W([[x0, z0], [x1, z0], [x1, z1], [x0, z1]]), 'rgba(214,210,200,.95)'], [W([[U.x0, U.z0], [U.x1, U.z0], [U.x1, U.z1], [U.x0, U.z1]]), 'rgba(190,186,176,.95)'], [W([[HM_CABLE[0] - 6, HM_CABLE[1] - 4], [HM_CABLE[0] + 6, HM_CABLE[1] - 4], [HM_CABLE[0] + 6, HM_CABLE[1] + 4], [HM_CABLE[0] - 6, HM_CABLE[1] + 4]]), 'rgba(214,210,200,.95)']], lines: [[W(HM_ROAD), 4, 'rgba(120,104,84,.95)'], [W(HM_RING_O), 2.5, 'rgba(70,60,50,.95)'], [W(HM_RING_I), 2.5, 'rgba(70,60,50,.95)'], ...HM_SPURS.filter(Boolean).map((s) => [W(s), 2.5, 'rgba(70,60,50,.95)']), ...(fl < 0 && HM.stage >= 5 ? walls : []), ...rooms] });
}
function hmEnd(win, why) {
  const stats = [[STATS.kills, 'אויבים נפגעו'], [FRIENDS.filter((f) => f.state === 'follow' || f.state === 'post').length, 'לוחמים איתכם בסוף'], [HM.stage + 1, 'השלב שהגעתם אליו']];
  if (win) return ['החרמון שלנו', 'בלילה שבין 21 ל־22 באוקטובר 1973 עלו לוחמי גולני ממג׳דל שמס להחזיר את המוצב בחרמון, שנכבש בידי קומנדו סורי ביום הראשון למלחמה. הם נלחמו על הדרך, בסלעים, במבני הרכבל, בתעלות המוצב ובתוך הבונקר עצמו, ובאחת עשרה בבוקר הניפו עליו את הדגל. 55 מלוחמי גולני נפלו בקרב.', stats];
  return ['נפגעת', HM.stage >= 3 ? 'בתוך הבונקר יורים מטווח מטרים. עצרו לפני כל פינה, זרקו רימון, ותנו ללוחמים להיכנס איתכם.' : 'העמדות מאוישות מראש - צלפו את הקסדות מרחוק לפני שאתם מתקרבים, ואל תעלו על הסוללה מול הגג.', stats];
}
CHAP.hermon = { stages: HM_STAGES, st: () => HM.stage, dbg: () => ({ py: HM_PY, l0: HM_L0, ry: HM_RY }), cp: () => CHAP.hermon.cpN || 0, upd: hmUpd, snapAfter: () => hmDoorsSet(HM.stage, GATE.on ? GATE.i : 0), obj: hmObj, hints: hmHints, items: hmItems, mini: hmMini, restore: fieldRestore, end: hmEnd, tank: false, dry: true, cloth: 0xf0eee6,
  tod: () => [7 * 60 + 40, 8 * 60 + 35, 9 * 60, 9 * 60 + 25, 9 * 60 + 50, 10 * 60 + 25][HM.stage] - START_MIN + CHAP.hermon.t / 6,
  build: () => chapterBuild(CHAP.hermon, hmBuild), setup: hmSetup, clock: '22.10.1973 · החרמון', toast: ['22 באוקטובר 1973 · לפנות בוקר', 'גולני עולים להחזיר את החרמון'], start: () => fieldStart('hermon') };
