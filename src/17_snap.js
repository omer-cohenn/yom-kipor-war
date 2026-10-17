
/* ================= checkpoints that save the moment =================
   A checkpoint is the battle exactly as it stood when it was saved: where the player stood and how hurt he was, every enemy alive or dead and
   what he was doing, the squad, the wounded, the vehicles, the clocks and the queue of what was about to happen. Coming back from a death
   puts all of it back - with full ammunition. Saves are taken at fixed points (see snapRequest). The last few are kept: a player who dies straight after coming back twice falls back to the one before. */
const SNAP = { list: [], max: 4, lastT: -99, want: null, wantT: 0, from: null, restoredAt: -99, autoT: 0 };
const SNAP_SKIP = new Set(['rig', 'tag', 'marker', 'el']);
const _isHandle = (v) => !!v && typeof v === 'object' && (v.isObject3D || v.isMaterial || v.isTexture || v.isBufferGeometry || (typeof Node !== 'undefined' && v instanceof Node));
const _plain = (o) => { const p = Object.getPrototypeOf(o); return p === Object.prototype || p === null; };
let SNAP_ID = new Set();
// a copy of a value that keeps live things (units, vehicles, cover points, meshes, functions) by reference and copies the data around them
function snapCp(v, d) {
  if (v === null || typeof v !== 'object') return v;
  if (v.isVector3) return v.clone();
  if (SNAP_ID.has(v) || _isHandle(v)) return v;
  if (Array.isArray(v)) return d > 0 ? v.map((x) => snapCp(x, d - 1)) : v.slice();
  if (!_plain(v) || d <= 0) return v;
  const o = {}; for (const k in v) o[k] = snapCp(v[k], d - 1); return o;
}
const _handleArr = (v) => Array.isArray(v) && v.length > 0 && (_isHandle(v[0]) || (Array.isArray(v[0]) && _isHandle(v[0][0])));
// the own fields of an object, minus its meshes and its DOM
function snapObj(o, d = 3, skip = SNAP_SKIP) { const s = {}; for (const k of Object.keys(o)) { const v = o[k]; if (skip.has(k) || _isHandle(v) || _handleArr(v)) continue; s[k] = snapCp(v, d); } return s; }
// put the fields back; a container (an array or a plain object) that still exists is refilled in place, so whoever holds it sees the change
function snapPut(o, s, d = 3, strict = false) {
  for (const k of Object.keys(s)) {
    const v = s[k], cur = o[k];
    if (Array.isArray(v) && Array.isArray(cur) && !SNAP_ID.has(cur)) { const c = snapCp(v, d); cur.length = 0; for (const x of c) cur.push(x); continue; }
    if (v && typeof v === 'object' && cur && typeof cur === 'object' && _plain(v) && _plain(cur) && !SNAP_ID.has(cur) && !SNAP_ID.has(v) && !v.isVector3) { const c = snapCp(v, d); for (const kk of Object.keys(cur)) if (!(kk in c)) delete cur[kk]; Object.assign(cur, c); continue; }
    if (v && v.isVector3 && cur && cur.isVector3) { cur.copy(v); continue; }
    o[k] = snapCp(v, d);
  }
  // flags that were set after the save are cleared; objects made after it (meshes, lists) are left alone
  if (strict) for (const k of Object.keys(o)) if (!(k in s) && !SNAP_SKIP.has(k)) { const v = o[k]; if (v === null || v === undefined || typeof v !== 'object' && typeof v !== 'function') delete o[k]; }
}
// the state of each chapter's director, besides the chapter object itself
function snapStates() {
  const m = MODE, list = [GATE];
  if (m === 'mezach') list.push(D, DRUMFIRE); else if (m === 'suez') list.push(SZ); else if (typeof SZ !== 'undefined' && SZ.trail) list.push(SZ);
  const by = { rescue: () => RS, cross: () => CR, army: () => AR, armor: () => AM, hermon: () => HM, farm: () => (typeof FM !== 'undefined' ? FM : null) };
  if (by[m]) { const s = by[m](); if (s && !list.includes(s)) list.push(s); }
  if (CHAP[m]) list.push(CHAP[m]);
  return list;
}
function snapIdent() {
  const S = new Set(), add = (o) => { if (o && typeof o === 'object') S.add(o); }, addAll = (a) => { if (a) for (const o of a) add(o); };
  addAll(UNITS.enemies); addAll(FRIENDS); for (const f of FRIENDS) { add(f.unit); add(f.post); add(f.ride); }
  addAll(VEH); addAll(POSTS); addAll(Object.values(TPOSTS)); addAll(COVER); addAll(BOATS); addAll(GROUPS); addAll(PROJ); addAll(FLARES); addAll(JETS); addAll(STRAFE); addAll(FAR_SMOKE); addAll(BARRS); addAll(Object.values(DOORS)); addAll(DUGOUTS);
  for (const k in CHAP) { const C = CHAP[k]; addAll(C.slots); addAll(C.covers); add(C); }
  addAll(SZ.slots); addAll(SZ.citySlots); addAll(SZ.covers); addAll(SZ.cityCovers);
  for (const o of [TANK, P, GATE, OBJ, CINE, D, SZ, AIR, DRUMFIRE, SURV, STATS, GAME, P.ride, AIDPOST]) add(o);
  if (AIR.bombs) addAll(AIR.bombs);
  for (const s of snapStates()) add(s);
  if (typeof SMOKES !== 'undefined') addAll(SMOKES);
  return S;
}
const _unitSnap = (u) => { const s = snapObj(u, 2); s.__vis = u.rig.root.visible; s.__gun = u.rig.gun.visible; return s; };
function _unitPut(u, s) {
  snapPut(u, s, 2); u.rig.root.visible = s.__vis; u.guide = null;
  if (u.side === 'e' && u.kind) u.setKind(u.kind);
  if (u.alive) { u.rig.shut = false; u.rig.head.material = MAT.faces[u.side][u.rig.faceV]; u.rig.root.rotation.x = 0; u.rig.root.rotation.z = 0; u.rig.gun.visible = s.__gun; }
  else if (s.__vis && u.fallKind) { const FV = FALLS[u.fallKind] || FALLS.knees; u.rig.fallPose(Math.max(u.fall ?? FV.dur, FV.dur + 0.4), u.fallDir || 1, u.fallKind, u.fallSlope || 0); u.rig.gun.visible = false; }
  u.snapHd = true; u.rig.snapNext = true; u.sync(); if (!s.__vis) u.tag.visible = false;
}
function _vehDead(v) { v.alive = false; v.speed = 0; v.g.traverse((m) => { if (m.isMesh) m.material = MAT_BURNT; }); if (v.fires.length < 2) for (let i = 0; i < 2; i++) { const f = new THREE.Sprite(new THREE.SpriteMaterial({ map: FXT.fire, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, color: HDC })); v.g.add(f); v.fires.push(f); } if (v.crew) for (const c of v.crew) c.visible = false; }
/* ---------- taking a save ---------- */
function snapTake(why = 'auto') {
  SNAP_ID = snapIdent();
  const s = { mode: MODE, why, t: GAME.t, gCd: GAME.gCd, stats: { ...STATS }, deaths: 0, at: performance.now(), ids: SNAP_ID, air: { next: AIR.next, magT: AIR.magT, mirage: AIR.mirage } };
  s.P = snapObj(P, 2, new Set(['bob', 'swx', 'swy', 'pyaw', 'ppitch']));
  s.enemies = UNITS.enemies.map(_unitSnap);
  s.friends = FRIENDS.map((f) => ({ f: snapObj(f, 2), u: _unitSnap(f.unit), mk: f.marker.visible }));
  s.posts = POSTS.map((p) => ({ occupant: p.occupant, mag: p.mag ? { belt: p.mag.belt, reload: p.mag.reload, yaw: p.mag.yaw, pitch: p.mag.pitch, rot: p.mag.pivot.rotation.clone() } : null }));
  s.fposts = FRIENDS.map((f) => (f.post && !POSTS.includes(f.post) ? snapObj(f.post, 2) : null));
  s.cover = COVER.map((c) => c.by);
  const slots = new Set([...(SZ.slots || []), ...((CHAP[MODE] && CHAP[MODE].slots) || [])]); s.slots = [...slots].map((sl) => [sl, sl.used, sl.b]);
  s.veh = VEH.filter((v) => v.mode === MODE).map((v) => ({ v, f: snapObj(v, 2), gp: v.g.position.clone(), gr: v.g.rotation.clone(), gv: v.g.visible, tr: v.tur ? v.tur.rotation.clone() : null }));
  if (TANK.g) s.tank = { f: snapObj(TANK, 2), gp: TANK.g.position.clone(), gr: TANK.g.rotation.clone(), gv: TANK.g.visible, tu: TANK.turret ? TANK.turret.rotation.clone() : null, gu: TANK.gun ? TANK.gun.rotation.clone() : null };
  s.states = snapStates().map((o) => [o, snapObj(o, 3)]);
  s.dirq = DIRQ.map((q) => ({ ...q }));
  s.barrs = BARRS.map((B) => B.on);
  if (typeof SMOKES !== 'undefined') s.smokes = SMOKES.map((m) => ({ ...m, p: m.p.clone() }));
  SNAP.list.push(s); if (SNAP.list.length > SNAP.max) SNAP.list.shift(); SNAP.lastT = GAME.t; SNAP.want = null; SNAP.autoT = 0;
  return s;
}
/* ---------- coming back ---------- */
function snapRestore(s = SNAP.list[SNAP.list.length - 1]) {
  if (!s) return false; SNAP_ID = new Set([...s.ids, ...snapIdent()]);
  if (CINE.on) { CINE.on = false; CINE.slow = 1; $('#app').classList.remove('cine'); $('#cine').hidden = true; camera.fov = CINE.fov0 || 72; camera.updateProjectionMatrix(); }
  SLOW.left = 0; SLOW.k = 1; SLOW.look = null;
  for (const q of PROJ) { scene.remove(q.m); if (q.marker) scene.remove(q.marker); } PROJ.length = 0;
  FX.flashes.clear(); FX.glows.clear(); FX.smoke.clear(); FX.dust.clear(); FX.fire.clear(); FX.trail.clear(); FX.exh.clear(); for (const t of FX.tracers) { t.on = false; t.m.visible = false; }
  for (const j of STRAFE) scene.remove(j.m); STRAFE.length = 0; for (const j of JETS) scene.remove(j.m); JETS.length = 0;
  if (AIR.bombs) { for (const b of AIR.bombs) scene.remove(b.m); AIR.bombs.length = 0; } AIR.ev = null; Object.assign(AIR, s.air);
  dropsClear(); LIGHTS.boom.intensity = 0;
  GAME.t = s.t; GAME.gCd = s.gCd; Object.assign(STATS, s.stats);
  for (const [o, st] of s.states) snapPut(o, st, 3, true);
  UNITS.enemies.forEach((u, i) => _unitPut(u, s.enemies[i]));
  FRIENDS.forEach((f, i) => { const r = s.friends[i]; snapPut(f, r.f, 2); _unitPut(f.unit, r.u); f.marker.visible = r.mk; if (s.fposts[i] && f.post) snapPut(f.post, s.fposts[i], 2); });
  POSTS.forEach((p, i) => { const r = s.posts[i]; p.occupant = r.occupant; if (p.mag && r.mag) { p.mag.belt = p.mag.cap || 200; p.mag.reload = 0; p.mag.yaw = r.mag.yaw; p.mag.pitch = r.mag.pitch; p.mag.pivot.rotation.copy(r.mag.rot); } });
  COVER.forEach((c, i) => { c.by = i < s.cover.length ? s.cover[i] : null; });
  for (const [sl, used, b] of s.slots) { sl.used = used; sl.b = b; }
  for (const r of s.veh) { const v = r.v; if (r.f.alive && !v.alive) vehRevive(v, r.f.hp); else if (!r.f.alive && v.alive) _vehDead(v); snapPut(v, r.f, 2); v.g.position.copy(r.gp); v.g.rotation.copy(r.gr); v.g.visible = r.gv; if (v.tur && r.tr) v.tur.rotation.copy(r.tr); if (v.crew) for (const c of v.crew) c.visible = v.alive; }
  if (s.tank && TANK.g) { snapPut(TANK, s.tank.f, 2); TANK.g.position.copy(s.tank.gp); TANK.g.rotation.copy(s.tank.gr); TANK.g.visible = s.tank.gv; if (TANK.turret && s.tank.tu) TANK.turret.rotation.copy(s.tank.tu); if (TANK.gun && s.tank.gu) TANK.gun.rotation.copy(s.tank.gu); for (const f of TANK.fireS || []) f.visible = !!TANK.burning; LIGHTS.fire.intensity = TANK.burning ? LIGHTS.fire.intensity : 0; TANK.g.updateMatrixWorld(true); }
  DIRQ.length = 0; for (const q of s.dirq) DIRQ.push({ ...q });
  if (MODE === 'mezach') { BARRS.forEach((B, i) => { const on = s.barrs[i]; B.on = on; B.g.visible = on; B.col.top = on ? B.top : -1e4; }); }
  if (typeof SMOKES !== 'undefined') smokesRestore(s.smokes || []);
  // the player: as he was, but with full health and ammunition
  snapPut(P, s.P, 2); P.alive = true; P.hp = 100; P.lastHit = GAME.t - 9; P.vy = 0; P.reloadT = 0; P.throwT = 0; P.fireCd = 0; P.hold = 0; P.ads = 0; P.recoil = 0; P.kick = 0;
  P.mag = 20; cpRefill();
  if (P.mode === 'carry' && P.carrying) { P.carrying.state = 'carried'; P.carrying.unit.rig.root.visible = false; }
  vm.visible = P.mode === 'rifle' && !(P.ride && P.ride.mg); INPUT.fire = INPUT.mFire = INPUT.kFire = false; INPUT.keys = {};
  if (CH() && CH().snapAfter) CH().snapAfter(s); else if (MODE === 'suez') szShow(true);
  // what the radio and the hints were about to say is dropped; the hints already seen stay seen
  TUT.queue.length = 0; TUT.radioQ.length = 0; TUT.cur = null; $('#hint').classList.remove('on');
  clearObjective(); SNAP.restoredAt = GAME.t; SNAP.from = s; SNAP.want = null; SNAP.autoT = 0; SNAP.lastT = GAME.t;
  GAME.state = 'play'; $('#app').classList.add('play'); for (const m of ['#mBrief', '#mPause', '#mEnd', '#mOps', '#mSet']) $(m).hidden = true; initAudio(); lockPointer();
  feed('חוזרים לנקודת השמירה', 'good');
  return true;
}
const snapCan = () => !SURV.on && SNAP.list.length > 0 && SNAP.list[SNAP.list.length - 1].mode === MODE;
function snapReset() { SNAP.list.length = 0; SNAP.want = null; SNAP.lastT = -99; SNAP.from = null; SNAP.restoredAt = -99; SNAP.autoT = 0; }
// a death soon after coming back counts against that save; two such deaths and the save before it is used instead
function snapOnDeath() {
  const s = SNAP.from; if (!s || !SNAP.list.includes(s)) return;
  if (GAME.t - SNAP.restoredAt < 12) { s.deaths++; if (s.deaths >= 2 && SNAP.list.length > 1 && SNAP.list[SNAP.list.length - 1] === s) SNAP.list.pop(); }
}
/* saves come at fixed points only: the start of every stage, and on the easier levels a few marked moments inside one (the village taken,
   the hill, the hold in the ditch, the landing). Every bound and every small event saves only on the easiest level; there is no save on a timer */
/* the checkpoints are fixed: one at the start of every stage of every chapter. Coming back puts the stage back exactly as it begins - the same
   place, the same time of day, the same enemies - whatever the player had done in it. Nothing is saved mid-stage */
function snapRequest(why = 'stage') { if (why !== 'stage') return; cpRefill(); if (GAME.t > 1) snapMark(); }   // a stage's start is the checkpoint: it gives back full health and ammunition (cpRefill)
// the moment is calm enough to keep: alive, not in a film, not just hit, no enemy on top of him, nothing in the air at him
function snapCalm(strict) {
  if (GAME.state !== 'play' || !P.alive || CINE.on || SLOW.left > 0 || SURV.on || P.mode === 'carry') return false;
  if (strict && (P.hp < 60 || GAME.t - P.lastHit < 5)) return false; if (!strict && (P.hp < 30 || GAME.t - P.lastHit < 1.2)) return false;
  for (const e of UNITS.enemies) if (e.alive && !e.dormant && e.pos.distanceTo(P.pos) < (strict ? 11 : 4.5)) return false;
  for (const q of PROJ) if ((q.type === 'rocket' && q.owner === 'e') || q.type === 'atgm' || (q.type === 'gren' && q.owner !== 'player')) if (q.m.position.distanceTo(P.pos) < 40) return false;
  if (MODE === 'mezach' && BOATS.some((b) => !b.dead && b.state !== 'sinking')) return false;
  if (CH() && CH().snapOK && !CH().snapOK(strict)) return false;
  return true;
}
function snapUpd(dt) {
  return;   // no moment-saves: see snapRequest
  if (GAME.state !== 'play' || SURV.on) return;
  if (SNAP.want) { SNAP.wantT += dt; if (snapCalm(false)) { const first = SNAP.list.length === 0; snapTake(SNAP.want); if (!first) snapMark(); } else if (SNAP.wantT > 25) SNAP.want = null; return; }
  SNAP.autoT += dt;
}
function snapMark() { const el = $('#saved'); if (!el) return; el.classList.remove('on'); void el.offsetWidth; el.classList.add('on'); }
