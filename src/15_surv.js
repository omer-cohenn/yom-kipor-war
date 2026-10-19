
/* ================= survival: hold the Mezach against wave after wave =================
   Every wave comes from somewhere else: boats from the west, commandos down the road from the north, infantry from Port Tewfik in the south,
   and later from two and three sides at once. Every MG is free and never needs a new belt; three recoilless guns stand ready; enough points
   call in an air strike on the spot you look at. The game lasts as long as you do. */
const SURV_DIRS = { w: 'ממערב, מהתעלה', n: 'מצפון, לאורך החוף', s: 'מדרום, לאורך החוף' };
/* survival is fought in the "small strongpoint": the middle hundred metres of the western rampart, closed at both ends by barricades that stand
   only in this mode (the whole strongpoint is far too long to run end to end between waves). The northern attack comes down the shore and
   climbs into the northern end of that stretch, the southern one up the shore into its southern end, the boats land in the middle. */
/* where they start: the northern attack already on the sand under the rampart, forty metres from the trench (the user), the southern one close in too */
const SURV_ZONE = { n: { spawn: [-98, -86, 9, 8], band: [52, 80], ks: [-45, -43, -34, -32].map(kz) }, s: { spawn: [-97, 102, 9, 10], band: [60, 92], ks: [32, 35, 38, 40].map(kz) } };
const SURV_TOTAL = [8, 12, 16, 24, 30, 37, 45, 56];
const SURV_AIR_PTS = 2500;
try { SURV.best = Number(localStorage.getItem('yk73.survBest') || 0); } catch (e) { SURV.best = 0; }

/* ---------- the recoilless guns: their bays are part of the strongpoint (gunPost, in the world file); the guns themselves only show in survival ---------- */
function survShowGuns(on) {
  // the MAGs of the two end positions exist only here: the campaign leaves W1 and W3 as plain bays
  for (const p of POSTS) if (p.magS) { p.mag = on ? p.magS : null; p.magS.pivot.visible = on; p.magS.box.visible = on; if (on) { p.magS.belt = 200; p.magS.reload = 0; p.magS.yaw = p.magS.yaw0; p.magS.pitch = 0; p.magS.pivot.rotation.set(0, p.magS.yaw0, 0); } else if (p.occupant === 'player') leaveMag(); }
  for (const p of SURV.guns) { p.mag.pivot.visible = on; p.legs.visible = on; if (on) { p.mag.reload = 0; p.mag.yaw = p.mag.yaw0; p.mag.pitch = 0; p.mag.pivot.rotation.set(0, p.mag.yaw0, 0); } if (!on && p.occupant === 'player') leaveMag(); } }
const SURV_GUN_SIDES = { G1: 'צפון', G2: 'מרכז', G3: 'דרום' };
// a recoilless round: a long flash and back-blast, the shell on its way, and a blast that kills everyone near it
function survCannonShoot() {
  const m = P.post.mag; if (m.reload > 0 || P.fireCd > 0) return; m.reload = 2.2; P.fireCd = 0.2;
  let d = V3(0, 0, 1).applyEuler(new THREE.Euler(m.pivot.rotation.x, m.pivot.rotation.y, 0, 'YXZ')); { const c = aimPick(camera.position, d, 0.07, true); if (c) d = c.clone().sub(camera.position).normalize(); }   /* the recoilless gun locks on like every other gun: men, boats, jeeps and tanks */
  const from = m.pivot.localToWorld(V3(0, 0.08, 2.3)), back = m.pivot.localToWorld(V3(0, 0.08, -1.7));
  // a diving aircraft in the sights: a generous cone, because the round is slow and the plane is fast - the gunner is given the lead
  let jet = null, jd = 1e9; for (const j of STRAFE) { if (j.t < 0 || j.dead || !j.m.visible) continue; const v = j.m.position.clone().sub(camera.position), L = v.length(); if (L > 1100) continue; v.normalize(); if (v.angleTo(d) < 0.07 && L < jd) { jet = j; jd = L; } }
  const hit = jet ? { p: jet.m.position.clone() } : castShot(camera.position.clone(), d, 900, 'f');
  fxMuzzle(from, true); fxExplosion(from, 0.55); LIGHTS.muzzle.position.copy(from); LIGHTS.muzzle.intensity = 2600; sndBoom(from, 1.2); FX.shake = Math.max(FX.shake, 0.55);
  for (let k = 0; k < 6; k++) { const s = FX.smoke.get(); s.life = 2.6; s.s.position.copy(back).add(V3(rand(-0.6, 0.6), rand(0, 0.6), rand(-0.6, 0.6))); s.s.material.color.set(0xb8b0a0); s.upd = (q, u, dt2) => { q.s.position.y += 0.8 * dt2; q.s.scale.setScalar(1.4 + u * 5); q.s.material.opacity = 0.55 * (1 - u); }; }
  fxTracer(from, hit.p, false); P.pitch += 0.03;
  if (jet) { DIRQ.push({ at: GAME.t + Math.min(0.9, jd / 600), fn: () => jetKill(jet, from) }); return; }
  DIRQ.push({ at: GAME.t + Math.min(0.6, from.distanceTo(hit.p) / 500), fn: () => explode(hit.p.clone().add(V3(0, 0.3, 0)), 2.2, 8.5, 30, 'cannon') });
}

/* ---------- the attacks along the shore: from the north and from the south, down the western slope of the tongue, a rush at the rampart's corner and over it ---------- */
function survSidePlan(side, e, i, hold = 0) {
  const Z = SURV_ZONE[side], r = rng((side === 'n' ? 4242 : 5151) + i * 137), RR = (a, b) => a + r() * (b - a), plan = [], sg = side === 'n' ? 1 : -1;
  // fire and movement down the shore: two stops behind the stones at the water's edge (they face the rampart, so they hide a man from it),
  // one far out and one closer in, a short burst from each; then the final dash at the rampart and over it
  const pick = (zMin, zMax) => { let best = null, bd = 1e9; for (const c of COVER) { const az = Math.abs(c.z); if (c.by || c.nx < 0.35 || az < zMin || az > zMax || Math.sign(c.z) !== sg * -1 || c.x > crestX(c.z) + 1 || c.x < tongueWestX(c.z) - 2) continue; const d = Math.hypot(c.x - e.pos.x, c.z - e.pos.z) + r() * 10; if (d < bd) { bd = d; best = c; } } return best; };
  { const c = pick(Z.band[0], Z.band[1]); if (c) { c.by = e; const o = RR(-0.9, 0.9); plan.push({ t: 'cover', c, x: c.x - c.nz * o, z: c.z + c.nx * o, nx: c.nx, nz: c.nz, h: c.h, dur: RR(2.2, 4.0) + hold }); } else if (hold) plan.push({ t: 'cover', x: e.pos.x + 1.2, z: e.pos.z, nx: 1, nz: 0, h: 0.7, dur: hold }); }   /* one stop on the sand (the north: a long one - they were there before him), then the dash */
  const k = clamp(Z.ks[i % 4] + Math.floor(RR(-2, 3)), 1, TR.pts.length - 2), p = TR.pts[k], o = TR.out[k];
  plan.push({ t: 'cover', x: p[0] + o[0] * 2.6 - 1.2, z: p[1] + o[1] * 2.6 + sg * RR(2, 5), px: p[0] + o[0] * 1.4, pz: p[1], nx: 1, nz: 0, h: 1, dur: RR(1.2, 2.6) });
  plan.push({ t: 'run', final: true, x: p[0] + o[0] * 2.6, z: p[1] + o[1] * 2.6 });
  plan.push({ t: 'vault', x: p[0], z: p[1] });
  return plan;
}
function survSideGroup(side, n, delay, kinds = []) {
  const Z = SURV_ZONE[side], north = side === 'n';
  for (let i = 0; i < n; i++) {
    const k = kinds[i] || 'rifle', r = rng(91 + i * 37 + SURV.wave * 11 + (side === 'n' ? 7 : 0)), go = () => { const e = spawnEnemy(Z.spawn[0] + (r() - 0.5) * Z.spawn[2], Z.spawn[1] + (r() - 0.5) * Z.spawn[3], varyKind(k, i * 3.7 + SURV.wave, delay), null, null); if (!e) { DIRQ.push({ at: GAME.t + 1, spawn: true, fn: go }); return; } e.plan = survSidePlan(side, e, i, north ? 3 + r() * 5 : 0); e.state = 'plan'; };
    DIRQ.push({ at: GAME.t + delay + i * (north ? 0.3 : 1.5), spawn: true, fn: go });   /* the north is on the beach all at once */
  }
}

/* ---------- Egyptian vehicles on the shore: jeeps with a machine gun and T-55s come down the lanes with the later waves and stop short of the
   rampart to fire. Rifles do nothing to a tank: that is what the recoilless guns are for (a grenade or a bomb finishes a jeep) ---------- */
const SURV_LANE = { n: [[-93, -215], [-92, -160], [-91, -130], [-90.5, -105], [-90, -78]], s: [[-80, 215], [-84, 160], [-87, 130], [-88, 105], [-88.5, 78]] };   // along the water's edge, where the guns on the rampart can see them
function survVeh(side, kind, delay, stopBack = 0) {
  const path = SURV_LANE[side];
  const go = () => {
    let v = SURV.pool.find((w) => !w.g.visible && w.kind === kind);
    if (!v) {
      v = kind === 't55' ? addVeh({ mode: 'mezach', side: 'e', kind: 't55', geo: T55_HULL, turGeo: T55_TUR, turAt: [0.3, 1.42, 0], half: [3.2, 2.3, 1.75], armor: 0, hp: 100, shoots: true, vmax: 5.5, heavy: true })
        : addVeh({ mode: 'mezach', side: 'e', kind: 'jeep', geo: JEEP_GEO, half: [1.9, 1.7, 1.0], armor: 0.5, hp: 60, mg: true, vmax: 9 });
      if (kind === 'jeep') { v.body.material = SURV.jeepMat || (SURV.jeepMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9, color: 0xd6c59c })); const mg = new THREE.Mesh(JEEP_MG, MAT.vc); mg.position.set(-0.7, 1.95, 0); v.g.add(SH(onLayer1(mg))); v.mgM = mg; }
      v.g.traverse((m) => { if (m.isMesh) m.castShadow = SHADOWS; }); v.mats = []; v.g.traverse((m) => { if (m.isMesh) v.mats.push([m, m.material]); }); SURV.pool.push(v);
    }
    vehRevive(v, kind === 't55' ? 100 : 60); v.path = path; v.s = 0; v.stop = pathLen(path) - stopBack; v.ended = false; v.hdV = null; v.fireCd = rand(4, 7); v.burst = 0; v.g.visible = true; const [x, z, hd] = pathAt(path, 0); vehPose(v, x, z, hd);
    v.onDead = (w) => { const b = w.kind === 't55' ? 400 : 200; SURV.bonus += b; feed(`${w.kind === 't55' ? 'טנק' : 'ג׳יפ'} מצרי הושמד · בונוס ${b}`, 'good'); };
    if (!SURV.vehMsg) { SURV.vehMsg = true; hint('surv-veh', `<b>כלי רכב מצריים על החוף!</b> הרובה לא עוזר נגד טנק: רוצו לתותח ללא רתע הקרוב (עיגול צהוב במפה) — פגז אחד מספיק. לג׳יפ מספיק גם רימון.`, 9); }
    radio('תצפית', kind === 't55' ? `טנק מצרי ${side === 'n' ? 'מצפון' : 'מדרום'}, על החוף! לתותח!` : `ג׳יפ עם מקלע ${side === 'n' ? 'מצפון' : 'מדרום'}!`, 3);
  };
  DIRQ.push({ at: GAME.t + delay, spawn: true, fn: go });
}
const survVehAlive = () => VEH.filter((v) => v.mode === 'mezach' && v.g.visible && v.alive).length;
function survVehStop() { for (const v of SURV.pool) { v.g.visible = false; v.path = null; if (v.tag) v.tag.visible = false; } }

/* ---------- the waves ---------- */
function survKinds(n, count) { const rpg = Math.min(0.34, 0.06 + n * 0.035), flame = n >= 5 ? 0.06 : 0; return Array.from({ length: count }, () => { const q = Math.random(); return q < rpg ? 'rpg' : q < rpg + flame ? 'flame' : 'rifle'; }); }
/* which side each wave comes from: the first two from the same side, so nobody runs the length of the strongpoint between them; later waves from two sides, then all three */
function survDirsFor(n) { const order = SURV.order; return n <= 2 ? [order[0]] : n === 3 ? [order[1]] : n === 4 ? [order[1], order[0]] : n === 5 ? [order[2], order[1]] : n === 6 ? [order[0], order[2]] : ['w', 'n', 's']; }
function survWave(n) {
  const dirs = survDirsFor(n);
  const total = Math.round((n <= 8 ? SURV_TOTAL[n - 1] : SURV_TOTAL[7] + (n - 8) * 9) * diff.extra), per = Math.ceil(total / dirs.length);
  SURV.dirs = dirs; SURV.acc = Math.min(1.75, 1 + (n - 1) * 0.08);
  dirs.forEach((dr, di) => {
    const T = di * 32;   // each further direction is a wave of its own, half a minute behind the one before: never two sides in the same breath
    if (dr === 'w') { const nb = Math.max(2, Math.ceil(per / 3)); for (let i = 0; i < nb; i++) { const z = rand(-30, 34), b = launchBoat(z, T + 2 + i * rand(1.4, 2.4), Math.min(7, 4 + Math.floor(n / 3)), Math.random() < 0.2 + n * 0.04 ? 1 : 0, n >= 5 && Math.random() < 0.15 ? 1 : 0); b.hp = 170; } }
    else if (dr === 'n') { const pn = Math.max(3, Math.round(per * 0.6)); survSideGroup('n', pn, T + 0.5, survKinds(n, pn));   /* fewer of them: they are right there */ if (n >= 4) for (let i = 0; i < 2; i++) launchBoat(rand(-62, -46), T + 4 + i * 3, 4, 0); }
    else { survSideGroup('s', per, T + 3, survKinds(n, per)); if (n >= 6) launchBoat(rand(40, 56), T + 5, 4, 0); }
    // from the third wave a jeep leads the shore attacks, from the fifth a tank follows it, from the seventh two
    if (dr !== 'w') { if (n >= 3) survVeh(dr, 'jeep', T + 5); if (n >= 5) survVeh(dr, 't55', T + 10, 7); if (n >= 7) survVeh(dr, 't55', T + 17, 16); }
    if (di > 0) DIRQ.push({ at: GAME.t + T, fn: () => { if (SURV.on && SURV.state === 'wave') { radio('תצפית', `גל נוסף ${SURV_DIRS[dr]}!`, 3); toast(`גל ${n} · גל נוסף`, SURV_DIRS[dr]); } } });
  });
  radio('תצפית', `גל ${n}! ${SURV_DIRS[dirs[0]]}${dirs.length > 1 ? ' — ואחריו ' + dirs.slice(1).map((d) => SURV_DIRS[d]).join(' וגם ') : ''}!`, 3.6);
  toast(`גל ${n}`, dirs.length > 1 ? `${SURV_DIRS[dirs[0]]} · ואחריו ${dirs.slice(1).map((d) => SURV_DIRS[d]).join(' · ')}` : SURV_DIRS[dirs[0]]);
  SURV.jetT = rand(20, 30); SURV.artT = rand(6, 10);
}
function survClear() {
  const n = SURV.wave, b = 500 * n; SURV.bonus += b; SURV.cleared = n;
  feed(`גל ${n} נהדף · בונוס ${b}`, 'good'); radio('מ״פ', n >= 7 ? 'עוד גל נשבר עלינו! מחזיקים, לא זזים!' : pick(['הגל נהדף! מילוי תחמושת, הם יחזרו.', 'הם נסוגים! לעמדות, הגל הבא בדרך.', 'המוצב שלנו. תחמושת ורימונים, מהר.']), 3.4);
  P.hp = Math.min(100, P.hp + 45); P.gren = Math.max(P.gren, diff.gren0); P.reserve = Math.max(P.reserve, 160);
  for (const f of FRIENDS) if (f.state === 'wounded' || f.state === 'stable') { f.state = 'saved'; f.marker.visible = false; }
  SURV.state = 'break'; SURV.t = 0; SURV.breakLen = 18; SURV.nextDirs = survDirsFor(n + 1);
  DIRQ.push({ at: GAME.t + 3, fn: () => { if (SURV.on && SURV.state === 'break') { toast(`הגל הבא ${SURV.nextDirs.map((d) => SURV_DIRS[d]).join(' וגם ')}`, 'החץ האדום במפה מראה מאיפה. תפסו עמדה שם'); radio('תצפית', `הגל הבא יגיע ${SURV.nextDirs.map((d) => SURV_DIRS[d]).join(' וגם ')}. ${SURV.nextDirs.length > 1 ? 'מתפצלים!' : 'כולם לשם!'}`, 3.4); } } });
}

/* ---------- the air strike: two Skyhawks bomb along the line you point at ---------- */
function survAir() {
  if (!SURV.on || GAME.state !== 'play') return;
  if (SURV.air <= 0) { feed(`תקיפה אווירית בעוד ${SURV_AIR_PTS - (SURV.score % SURV_AIR_PTS)} נקודות`); return; }
  const hit = castShot(camera.position.clone(), camForward(V3()), 420, 'f'), p = hit.p.clone(); p.y = Math.max(groundAt(p.x, p.z), 0);
  if (Math.hypot(p.x - P.pos.x, p.z - P.pos.z) < 22) { feed('קרוב מדי לעמדה שלנו. כוונו רחוק יותר'); return; }
  const heavy = SURV.air >= 2; SURV.air -= heavy ? 2 : 1; SURV.strike = { p, t: 0, smokeT: 0, dx: P.pos.x - p.x, dz: P.pos.z - p.z, jets: null, dropped: false, heavy };
  radio('חמ״ל', heavy ? 'רביעיית סקייהוקים בדרך! תקיפה כבדה בעוד חמש שניות — כולם למטה!' : 'תקיפה אווירית בדרך! סקייהוקים בעוד חמש שניות, להוריד ראשים!', 3); sndClick(1100, 0.3);
}
function survAirUpd(dt) {
  const S = SURV.strike; if (!S) return; S.t += dt;
  S.smokeT -= dt; if (S.t < 7 && S.smokeT <= 0) { S.smokeT = 0.12; const q = FX.smoke.get(); q.life = 3; q.s.position.copy(S.p).add(V3(rand(-0.4, 0.4), 0.4, rand(-0.4, 0.4))); q.s.material.color.set(0xd04a2a); q.upd = (o, u, d2) => { o.s.position.y += 1.6 * d2; o.s.scale.setScalar(0.8 + u * 4); o.s.material.opacity = 0.75 * (1 - u); }; }
  const L = Math.hypot(S.dx, S.dz) || 1, ux = -S.dz / L, uz = S.dx / L;
  // the second pair of a heavy strike lays its bombs on a parallel line, further from our own trench
  const ax = -S.dx / L, az = -S.dz / L, nJ = S.heavy ? 4 : 2;
  if (!S.jets && S.t > 2.2) { S.jets = Array.from({ length: nJ }, (_, i) => { const m = new THREE.Mesh(JET_GEO, MAT.jet); m.scale.setScalar(1); SH(m, true, false); scene.add(onLayer1(m)); return { m, off: (i % 2) * 14 - 7 + (i >= 2 ? 26 : 0), lag: (i % 2) * 0.5 + (i >= 2 ? 1.6 : 0) }; }); sndJet(2.6); if (S.heavy) DIRQ.push({ at: GAME.t + 1.6, fn: () => sndJet(2.6) }); }
  if (S.jets) for (const j of S.jets) { const s = (S.t - 5 - j.lag) * 120, x = S.p.x + ux * s + ax * j.off, z = S.p.z + uz * s + az * j.off; j.m.position.set(x, Math.max(groundAt(x, z), 0) + 38 + Math.max(0, -s) * 0.04, z); j.m.rotation.set(0, Math.atan2(-uz, ux), 0); j.m.rotateZ(-0.12); }
  if (!S.dropped && S.t > 5) { S.dropped = true; const R = S.heavy ? 22 : 19, lines = S.heavy ? [0, 26] : [0];
    lines.forEach((off, li) => { for (let k = -4; k <= 4; k++) DIRQ.push({ at: GAME.t + 0.35 + li * 1.6 + (k + 4) * 0.14, fn: () => { const side = (k % 2 ? 1 : -1) * 4; const q = V3(S.p.x + ux * k * 10 + ax * (off + side) + rand(-1.5, 1.5), 0, S.p.z + uz * k * 10 + az * (off + side) + rand(-1.5, 1.5)); q.y = Math.max(groundAt(q.x, q.z), 0); explode(q, 2.8, R, 160, 'player'); } }); });
    feed(S.heavy ? 'תקיפה כבדה! ארבעה סקייהוקים' : 'תקיפה אווירית!', 'good'); }
  if (S.t > (S.heavy ? 13 : 11)) { if (S.jets) for (const j of S.jets) scene.remove(j.m); SURV.strike = null; }
}

/* ---------- the director ---------- */
function survStart() {
  for (const v of document.querySelectorAll('.menu video')) { v.pause(); v.removeAttribute('src'); try { v.load(); } catch (e) {} }
  MAT.clothE.color.setHex(0xffffff); TANK.goal = null; $('#app').classList.remove('armor');
  SURV.on = true; resetGame(); survShowGuns(true); setRim(MAT.clothE, 0);
  MODE = 'mezach'; D.phase = 'surv'; D.phaseT = 0; D.scene = 0;
  for (const B of BARRS) { B.on = !!B.surv; B.g.visible = B.on; B.col.top = B.on ? B.top : -1e4; }   // the campaign's barricades open, the two of the small strongpoint close
  // every MG is free: the defenders who sat on them take places in the trench beside them; and everyone holds the western rampart, where the whole fight is
  const moveTo = { W4: 'T38', N3: 'T16', S3: 'T40', W2N: 'T-26', W2S: 'T10', N2: 'T-14', S2: 'T36', E1: 'T-32', K18: 'T-12', K48: 'T34', 'T-58': 'T-29', 'T-42': 'T-42', W1: 'T-41', W3: 'T31' };   // W1 and W3 carry MAGs in this mode: their men step into the trench beside them, the guns are the player's
  for (const f of FRIENDS) { if (f.post && f.post.occupant === f) f.post.occupant = null; const id = moveTo[f.postId] || f.postId; f.post = postById(id); f.post.occupant = f; const u = f.unit; u.place(f.post.stand[0], f.post.stand[1]); u.sync(); f.state = 'post'; u.stance = 'stand'; f.scanCd = rand(0.2, 1.5); }
  for (const p of POSTS) if (p.mag) { p.mag.belt = 200; p.mag.reload = 0; }
  const order = ['w', 'n', 's']; for (let i = 2; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; } if (order[0] !== 'w' && Math.random() < 0.6) { const k = order.indexOf('w'); [order[0], order[k]] = [order[k], order[0]]; }
  Object.assign(SURV, { wave: 0, state: 'break', t: 0, breakLen: 12, bonus: 0, score: 0, air: 0, airGiven: 0, cleared: 0, dirs: [], acc: 1, order, strike: null, jetT: 30, artT: 10, vehMsg: false, lastKills: 0, lastKillT: 0, planes: 0 }); SURV.nextDirs = survDirsFor(1); if (!SURV.pool) SURV.pool = []; survVehStop();
  TUT.step = 'done'; { const [x, z] = trenchAt(-6); P.pos.set(x, groundAt(x, z), z); P.yaw = -THREE.MathUtils.degToRad(270); P.pitch = 0; }
  $('#clockSub').textContent = 'מעוז המזח · הישרדות'; markLast('mezach');
  GAME.state = 'play'; $('#app').classList.add('play'); $('#app').classList.add('surv'); for (const m of ['#mBrief', '#mPause', '#mEnd', '#mOps', '#mSet']) $(m).hidden = true;
  initAudio(); lockPointer(); toast('הישרדות', 'החזיקו את המעוז כמה שיותר זמן');
  hint('surv', `<b>המעוז הקטן</b>: מאה מטר של סוללה, חסומים במחסומים משני הקצוות — הכול קורה כאן. הסירות נוחתות מולכם, הצפוניים עולים בקצה הצפוני והדרומיים בקצה הדרומי. כל המא״גים פנויים ואין צורך להחליף שרשרת. שלושה <b>תותחים ללא רתע</b> (צפון, מרכז, דרום) — עיגול צהוב עם קנה במפה; פגז אחד מחסל כיתה. כל ${SURV_AIR_PTS} נקודות פותחות <b>תקיפה אווירית</b>: הסתכלו על המקום ולחצו ${TOUCH ? 'על כפתור התקיפה' : '<kbd>B</kbd>'}.`, 14);
  DIRQ.push({ at: GAME.t + 4, fn: () => { if (!SURV.on) return; radio('מפקד המעוז', 'סגרנו את התעלה משני הצדדים — מחזיקים רק את המאה מטר האלה, אף אחד לא מתפזר! שלושה תול״רים בסוללה, מסומנים במפה: פגז אחד מפרק סירה או כיתה שלמה.', 4.6); feed('המעוז הקטן · תותחים: צפון · מרכז · דרום', 'good'); } });
}
function survUpd(dt) {
  updStrafe(dt); airDirector(dt); survAirUpd(dt); updVeh(dt);
  if (!CINE.on) D.phaseT += dt; { const [k, d] = trK(P.pos.x, P.pos.z); TR.pK = k; TR.pD = d; }   // the men in the trench fight their way toward the player
  for (let i = DIRQ.length - 1; i >= 0; i--) if (GAME.t >= DIRQ[i].at) { const q = DIRQ.splice(i, 1)[0]; q.fn(); }
  for (const g of GROUPS) if (!g.go && g.goAt && GAME.t >= g.goAt) g.go = true;
  SURV.t += dt;
  if (SURV.state === 'break') { if (SURV.t >= SURV.breakLen) { SURV.wave++; SURV.state = 'wave'; SURV.t = 0; survWave(SURV.wave); } }
  else {
    const boats = BOATS.some((b) => !b.dead && (b.state === 'wait' || b.state === 'cross' || (b.state === 'landed' && b.seats.some((s) => s.alive && !s.gone))));
    let busy = boats || DIRQ.some((q) => q.spawn) || UNITS.enemies.some((e) => e.alive) || survVehAlive() > 0 || SURV.t < 32 * (SURV.dirs.length - 1) + 8;
    // a wave must never hang on a straggler nobody can reach: after a long quiet spell the last few are written off as having run for it
    if (STATS.kills !== SURV.lastKills) { SURV.lastKills = STATS.kills; SURV.lastKillT = GAME.t; }
    if (busy && !boats && SURV.t > 60 && GAME.t - (SURV.lastKillT || 0) > 45 && !DIRQ.some((q) => q.spawn)) {
      const alive = UNITS.enemies.filter((e) => e.alive), far = alive.filter((e) => Math.hypot(e.pos.x - P.pos.x, e.pos.z - P.pos.z) > 28 || !e.rig.root.visible);
      if (alive.length <= 4 && far.length === alive.length) { for (const e of far) { e.alive = false; e.rig.root.visible = false; e.tag.visible = false; if (e.slot) { e.slot.used = false; e.slot = null; } }
        if (GAME.t - (SURV.lastKillT || 0) > 90) for (const v of VEH) if (v.mode === 'mezach' && v.g.visible && v.alive) { v.g.visible = false; if (v.tag) v.tag.visible = false; }
        if (far.length || survVehAlive() === 0) { SURV.lastKillT = GAME.t; radio('תצפית', 'השאר נסוגים! הגל נשבר.', 2.4); busy = boats || UNITS.enemies.some((e) => e.alive) || survVehAlive() > 0; } }
    }
    if (!busy && SURV.t > 6) survClear();
    if (SURV.wave >= 3) { SURV.jetT -= dt; if (SURV.jetT <= 0) { SURV.jetT = Math.max(24, rand(40, 55) - SURV.wave * 2); strafeRun(P.pos.x + rand(-6, 6), P.pos.z + rand(-10, 10), 0); radio('תצפית', 'מטוס! הוא נמוך ובא עלינו!', 2.4); hint('surv-jet', '<b>מטוס בצלילה!</b> מהתותח ללא רתע אפשר להפיל אותו: כוונו קצת לפניו וירו — הפלה שווה 2,000 נקודות.', 8); } }
    if (SURV.wave >= 3) { SURV.artT -= dt; if (SURV.artT <= 0) { SURV.artT = Math.max(8, rand(15, 21) - SURV.wave * 0.8); for (let k = 0; k < 1 + Math.floor(SURV.wave / 4); k++) DIRQ.push({ at: GAME.t + k * rand(0.6, 1.3), fn: incomingShell }); } }
  }
  // the strongpoint falls when they hold the trench and the yard
  let inside = 0, inTr = 0; for (const e of UNITS.enemies) if (e.alive) { if (e.inside) inside++; else if (e.state === 'trench') inTr++; } D.inside = inside; D.inTrench = inTr;
  if (inside + inTr > 0) D.capture = Math.min(100, D.capture + (inside + inTr * 0.25) * diff.cap * 0.8 * dt); else D.capture = Math.max(0, D.capture - 6 * dt);
  if (D.capture >= 100) { endGame(false, 'breach'); return; }
  SURV.score = STATS.kills * 100 + STATS.heads * 50 + SURV.bonus;
  const due = Math.floor(SURV.score / SURV_AIR_PTS); while (SURV.airGiven < due) { SURV.airGiven++; if (SURV.air < 3) { SURV.air++; feed(`תקיפה אווירית זמינה ×${SURV.air} · ${TOUCH ? 'כפתור תקיפה' : 'B'}`, 'good'); radio('חמ״ל', SURV.air >= 2 ? 'רביעיית סקייהוקים זמינה! תקיפה כבדה — שמרו אותה לגל צפוף.' : 'יש לכם זוג סקייהוקים. סמנו מטרה, או חכו לזוג שני לתקיפה כבדה.', 2.8); } }
  $('#tair').classList.toggle('on', SURV.air > 0); if (SURV.air > 0 && $('#tair').textContent !== `תקיפה ×${SURV.air}`) $('#tair').textContent = `תקיפה ×${SURV.air}`;
}
function survHUD() {
  const brk = SURV.state === 'break', left = Math.max(0, Math.ceil(SURV.breakLen - SURV.t));
  $('#waveTitle').textContent = brk ? (SURV.wave ? `הישרדות · גל ${SURV.wave + 1} בעוד ${left}` : `הישרדות · הגל הראשון בעוד ${left}`) : `הישרדות · גל ${SURV.wave}`;
  const items = [['go', `ניקוד ${SURV.score.toLocaleString('he-IL')} · הרוגים ${STATS.kills}`]];
  if (!brk) items.push(['warn', `מגיעים ${SURV.dirs.map((d) => SURV_DIRS[d]).join(' וגם ')}`]);
  if (SURV.wave < 2) { const near = SURV.guns.map((p) => [Math.hypot(p.x - P.pos.x, p.z - P.pos.z), p]).sort((a, b) => a[0] - b[0])[0]; if (near) items.push(['next', `תותח ללא רתע הקרוב: ${SURV_GUN_SIDES[near[1].id]} · ${Math.round(near[0])} מ׳ (עיגול צהוב במפה)`]); }
  items.push([SURV.air ? 'done' : 'next', SURV.air >= 2 ? `תקיפה כבדה מוכנה (רביעייה, ×${SURV.air}) · ${TOUCH ? 'כפתור תקיפה' : 'B'}` : SURV.air ? `תקיפה אווירית מוכנה · ${TOUCH ? 'כפתור תקיפה' : 'B'}` : `תקיפה אווירית בעוד ${SURV_AIR_PTS - (SURV.score % SURV_AIR_PTS)} נק׳`]);
  if (SURV.planes) items.push(['done', `מטוסים שהופלו: ${SURV.planes}`]);
  { const nv = survVehAlive(); if (nv) items.push(['warn', `כלי רכב מצריים על החוף: ${nv} · לתותח ללא רתע`]); }
  if (D.inTrench > 0) items.push(['warn', `מצרים בתעלה: ${D.inTrench}`]);
  if (D.inside > 0) items.push(['warn', `מצרים בתוך המוצב: ${D.inside}`]);
  if (SURV.best) items.push(['', `השיא שלכם: ${SURV.best.toLocaleString('he-IL')}`]);
  $('#cap').classList.toggle('on', D.capture > 0.5); $('#capFill').style.width = `${D.capture}%`; $('#capText').textContent = `המצרים משתלטים על המוצב · ${Math.round(D.capture)}%`;
  const html = items.map(([c, t]) => `<li class="${c}">${t}</li>`).join(''); if ($('#objList').innerHTML !== html) $('#objList').innerHTML = html;
  for (const f of FEED) { if (GAME.t - f.t > 5) f.el.style.opacity = '0'; }
}
function survEnd(why) {
  const newBest = SURV.score > SURV.best; if (newBest) { SURV.best = SURV.score; try { localStorage.setItem('yk73.survBest', String(SURV.best)); } catch (e) {} }
  $('#endEyebrow').textContent = `הישרדות · מעוז המזח · ${diff.name}`;
  $('#endTitle').textContent = why === 'breach' ? 'המוצב נפל' : 'נפגעת';
  $('#endText').textContent = `${SURV.cleared ? `החזקתם ${SURV.cleared} גלים` : 'הגל הראשון שבר את ההגנה'}${SURV.wave > SURV.cleared ? ` ונפלתם בגל ${SURV.wave}` : ''}. ${newBest ? 'שיא חדש!' : `השיא שלכם: ${SURV.best.toLocaleString('he-IL')}.`} ${SURV.wave >= 8 ? 'גל שמיני ומעלה: רק מעטים מגיעים לשם.' : 'מהגל הרביעי זה כבר מגיע משני כיוונים. בחרו מא״ג מול הכיוון המסומן, והשאירו את התקיפה האווירית לגל הצפוף.'}`;
  $('#endStats').innerHTML = [[SURV.score.toLocaleString('he-IL'), 'ניקוד'], [SURV.wave, 'הגל שהגעתם אליו'], [STATS.kills, 'הרוגים'], SURV.planes ? [SURV.planes, 'מטוסים הופלו'] : [SURV.best.toLocaleString('he-IL'), 'השיא']].map(([n, l]) => `<div><b>${n}</b><span>${l}</span></div>`).join('');
  $('#bNext').hidden = true; $('#bRetry').hidden = false; $('#bRetry').textContent = 'שוב, מהגל הראשון';
  { const nt = document.querySelector('#mEnd .note'); if (nt) nt.hidden = true; }
  setTimeout(() => { $('#mEnd').hidden = false; }, 900);
}
function survStop() { if (!SURV.on) return; SURV.on = false; survShowGuns(false); if (SURV.pool) survVehStop(); for (const B of BARRS) if (B.surv) { B.on = false; B.g.visible = false; B.col.top = -1e4; } $('#app').classList.remove('surv'); $('#tair').classList.remove('on'); if (SURV.strike && SURV.strike.jets) for (const j of SURV.strike.jets) scene.remove(j.m); SURV.strike = null; }
