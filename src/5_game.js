
/* ================= settings ================= */
/* three levels, one route and one story: what changes is how forgiving the war is. The higher the level, the more Egyptians, the sooner they
   react and the more of them storm; the more each hit costs and the less you heal; the weaker the men beside you; the fewer the saves.
   The aim lock is the same on every level */
const DIFF = [
  { name: 'טירון', cap: 0.9, seats: 4, extra: 0.8, boats: 0.8, acc: 0.04, accF: 0.012, dmg: [9, 13], bleed: 200, art: [32, 48], boat: 9.5, fgun: 0.85, fAcc: 1.5, fSmart: 2, regenD: 2, regenCap: 100, react: 1.2, storm: 0.25, gren: 0, aware: 18, cp: 2, gren0: 6, foeMap: true },
  { name: 'לוחם', cap: 1.5, seats: 5, extra: 1.0, boats: 1.0, acc: 0.065, accF: 0.022, dmg: [14, 21], bleed: 140, art: [22, 34], boat: 10.5, fgun: 1, fAcc: 1, fSmart: 1, regenD: 3, regenCap: 100, react: 0.7, storm: 0.55, gren: 1, aware: 24, cp: 1, gren0: 4, foeMap: true },
  { name: 'ותיק', cap: 1.9, seats: 6, extra: 1.35, boats: 1.3, acc: 0.09, accF: 0.032, dmg: [21, 31], bleed: 90, art: [15, 25], boat: 11.5, fgun: 1.25, fAcc: 0.6, fSmart: 0, regenD: 5, regenCap: 60, react: 0.4, storm: 0.75, gren: 1.6, aware: 30, cp: 0, gren0: 3, foeMap: false },
];
let diff = DIFF[1];
/* the first chapter has to leave the player sure that he can win: on top of the level, the stronghold eases its own war (survival keeps the
   level as it is). acc / dmg: how often an Egyptian round finds the player and what any hit costs him; gren: the share of the grenades still
   thrown; art: the shellings that much further apart; regen: [seconds without a hit before he heals, points a second, up to]; fAcc / fHit:
   the squad's fire that much deadlier, the Egyptians' fire at the squad that much weaker; boats / boatV: fewer boats, slower oars; cap: the
   capture meter that much slower; react: a man who has just seen the player waits that much longer before he fires */
const MZ_EASE = [
  { acc: 0.4, dmg: 0.5, gren: 0, art: 1.8, regen: [1.2, 38, 100], fAcc: 2, fHit: 0.4, boats: 0.7, boatV: 0.85, cap: 0.5, react: 1.6 },
  { acc: 0.42, dmg: 0.55, gren: 0.3, art: 1.5, regen: [1.6, 34, 100], fAcc: 1.8, fHit: 0.5, boats: 0.7, boatV: 0.88, cap: 0.6, react: 1.4 },
  { acc: 0.6, dmg: 0.72, gren: 0.6, art: 1.25, regen: [2.8, 28, 85], fAcc: 1.45, fHit: 0.7, boats: 0.85, boatV: 0.94, cap: 0.75, react: 1.2 },
];
const mzEase = () => (MODE === 'mezach' && !SURV.on ? MZ_EASE[Math.max(0, DIFF.indexOf(diff))] : null);
const GAME = { state: 'loading', t: 0, stats: null };

/* ================= audio ================= */
const AUD = { ctx: null, master: null, lp: null, noise: null, muted: false, ring: 0 };
function initAudio() {
  if (AUD.ctx) { if (AUD.ctx.resume) AUD.ctx.resume(); return; }
  try {
    const C = window.AudioContext || window.webkitAudioContext; if (!C) return;
    const ctx = new C(); AUD.ctx = ctx; AUD.master = ctx.createGain(); AUD.master.gain.value = AUD.muted ? 0 : 0.8;
    AUD.lp = ctx.createBiquadFilter(); AUD.lp.type = 'lowpass'; AUD.lp.frequency.value = 18000; AUD.master.connect(AUD.lp); AUD.lp.connect(ctx.destination);
    const len = ctx.sampleRate * 2, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1; AUD.noise = buf;
    const bed = (type, f, q, gain, lfoHz, amt) => { const s = ctx.createBufferSource(); s.buffer = buf; s.loop = true; const fl = ctx.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q; const g = ctx.createGain(); g.gain.value = gain; const l = ctx.createOscillator(); l.frequency.value = lfoHz; const lg = ctx.createGain(); lg.gain.value = amt; l.connect(lg); lg.connect(g.gain); s.connect(fl); fl.connect(g); g.connect(AUD.master); s.start(); l.start(); };
    bed('bandpass', 360, 0.6, 0.035, 0.11, 0.02); bed('lowpass', 220, 0.7, 0.03, 0.07, 0.015);
  } catch (e) { AUD.ctx = null; }
}
function nz(t, dur, { f = 1000, type = 'bandpass', q = 0.8, vol = 0.5, attack = 0.002, f2 = null } = {}) {
  const ctx = AUD.ctx; const s = ctx.createBufferSource(); s.buffer = AUD.noise; s.loop = true;
  const fl = ctx.createBiquadFilter(); fl.type = type; fl.frequency.setValueAtTime(f, t); if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + dur); fl.Q.value = q;
  const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(vol, 0.0002), t + attack); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(fl); fl.connect(g); g.connect(AUD.master); s.start(t, Math.random() * 1.5); s.stop(t + dur + 0.05);
}
function tone(t, dur, f1, f2, vol, type = 'sine') { const ctx = AUD.ctx; const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f1, t); o.frequency.exponentialRampToValueAtTime(Math.max(f2, 20), t + dur); const g = ctx.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g); g.connect(AUD.master); o.start(t); o.stop(t + dur + 0.05); }
function distVol(p, ref) { const d = camera.position.distanceTo(p); return [Math.min(1, ref / (d + ref * 0.3)), Math.min(d / 343, 5)]; }
function sndShot(kind, p) {
  if (!AUD.ctx) return; const t0 = AUD.ctx.currentTime;
  if (kind === 'fal' || kind === 'mag') { nz(t0, 0.16, { f: 2600, type: 'bandpass', q: 0.5, vol: kind === 'mag' ? 0.4 : 0.5 }); nz(t0, 0.35, { f: 900, type: 'lowpass', vol: 0.45, f2: 200 }); tone(t0, 0.12, 140, 50, 0.45); nz(t0 + 0.05, 0.6, { f: 500, type: 'lowpass', vol: 0.08, attack: 0.05 }); return; }
  const [v, dl] = distVol(p, kind === 'ak' || kind === 'smg' ? 60 : kind === 'svd' ? 120 : 80); if (v < 0.015) return; const t = t0 + dl;
  // a hundred rifles on the water: past some thirty shots a second the far ones add nothing to the roar, and every one costs the sound card
  // and the page a handful of nodes, so the quiet ones are left out
  { const L = (AUD.shL || 0) * Math.exp(-(t0 - (AUD.shT || t0)) * 6); AUD.shT = t0; if ((L > 3 && v < 0.6) || (L > 6 && v < 0.95)) { AUD.shL = L; return; } AUD.shL = L + 1; }
  if (kind === 'smg') { nz(t, 0.07, { f: 2100, q: 0.8, vol: 0.4 * v }); nz(t, 0.16, { f: 700, type: 'lowpass', vol: 0.18 * v, f2: 200 }); return; }
  if (kind === 'svd') { nz(t, 0.14, { f: 1300, q: 0.6, vol: 0.7 * v }); nz(t, 0.5, { f: 500, type: 'lowpass', vol: 0.35 * v, f2: 120 }); tone(t, 0.1, 120, 50, 0.3 * v); return; }
  nz(t, 0.11, { f: kind === 'ak' ? 1500 : kind === 'lmg' ? 1350 : 1200, q: 0.7, vol: (kind === 'lmg' ? 0.6 : 0.55) * v }); nz(t, 0.3, { f: 600, type: 'lowpass', vol: 0.25 * v, f2: 150 });
}
function sndBoom(p, size = 1) {
  if (!AUD.ctx) return; const [v, dl] = distVol(p, 260 * size); if (v < 0.01) return; const t = AUD.ctx.currentTime + dl; const d = camera.position.distanceTo(p);
  nz(t, 2.4, { f: d < 60 ? 2200 : 800, type: 'lowpass', vol: v, f2: 110, attack: 0.01 }); tone(t, 0.9, 70, 26, v);
  if (d < 14) { AUD.ring = 2.2; tone(t, 2.2, 3700, 3500, 0.08 * (1 - d / 14)); }
}
function sndWhistle(eta) { if (!AUD.ctx) return; const t = AUD.ctx.currentTime; const o = AUD.ctx.createOscillator(); o.frequency.setValueAtTime(1900, t); o.frequency.exponentialRampToValueAtTime(650, t + eta); const g = AUD.ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.07, t + eta * 0.9); g.gain.exponentialRampToValueAtTime(0.0001, t + eta); o.connect(g); g.connect(AUD.master); o.start(t); o.stop(t + eta + 0.05); }
function sndClick(f = 1800, vol = 0.12) { if (!AUD.ctx) return; nz(AUD.ctx.currentTime, 0.04, { f, q: 2, vol }); }
function sndHurt() { if (!AUD.ctx) return; const t = AUD.ctx.currentTime; tone(t, 0.25, 90, 40, 0.5); nz(t, 0.15, { f: 400, type: 'lowpass', vol: 0.3 }); }
function sndWhiz(p) { if (!AUD.ctx) return; const t = AUD.ctx.currentTime; nz(t, 0.12, { f: 3500, f2: 1200, q: 3, vol: 0.12 }); }
function sndRadio() { if (!AUD.ctx) return; const t = AUD.ctx.currentTime; nz(t, 0.08, { f: 2900, q: 1.3, vol: 0.07 }); tone(t + 0.02, 0.06, 1400, 1300, 0.025, 'square'); }
function sndJet(eta) {
  if (!AUD.ctx) return; const ctx = AUD.ctx, t = ctx.currentTime, T = eta + 7;
  const s = ctx.createBufferSource(); s.buffer = AUD.noise; s.loop = true;
  const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(240, t); f.frequency.exponentialRampToValueAtTime(3600, t + eta); f.frequency.exponentialRampToValueAtTime(300, t + T);
  const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(1.0, t + eta); g.gain.exponentialRampToValueAtTime(0.28, t + eta + 1.6); g.gain.exponentialRampToValueAtTime(0.0001, t + T);
  s.connect(f); f.connect(g); g.connect(AUD.master); s.start(t); s.stop(t + T + 0.1);
  const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(820, t); o.frequency.exponentialRampToValueAtTime(1250, t + eta); o.frequency.exponentialRampToValueAtTime(380, t + eta + 2.2);
  const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1100; const og = ctx.createGain(); og.gain.setValueAtTime(0.0001, t); og.gain.exponentialRampToValueAtTime(0.035, t + eta); og.gain.exponentialRampToValueAtTime(0.0001, t + eta + 3);
  o.connect(bp); bp.connect(og); og.connect(AUD.master); o.start(t); o.stop(t + eta + 3.1);
}
function setMute(m) { AUD.muted = m; if (AUD.master) AUD.master.gain.value = m ? 0 : 0.8; $('#bMute').textContent = m ? 'צליל: כבוי' : 'צליל: פועל'; }

/* the viewmodel (the rifle and the hands) is built in 4c_vm.js */

/* ================= player ================= */
const P = { pos: V3(), vy: 0, yaw: 0, pitch: 0, crouch: false, hp: 100, lastHit: -9, mode: 'rifle', mag: 20, reserve: 160, gren: diff.gren0, reloadT: 0, fireCd: 0, ads: 0, recoil: 0, post: null, carrying: null, hold: 0, grounded: true, bob: 0, kick: 0, throwT: 0, ammoCd: 0 };
const INPUT = { keys: {}, fire: false, mFire: false, kFire: false, ads: false, locked: false, drag: null, joy: { x: 0, y: 0 }, joyId: null, tAds: false };
function resetPlayer() {
  Object.assign(P, { smokeMax: 0, smoke: 0, vy: 0, crouch: false, hp: 100, lastHit: -9, mode: 'rifle', mag: 20, reserve: 160, gren: diff.gren0, reloadT: 0, fireCd: 0, ads: 0, recoil: 0, post: null, carrying: null, hold: 0, kick: 0, throwT: 0, ammoCd: 0, vx: 0, vz: 0, bobAmp: 0, land: 0, eyeH: 1.65, crK: 0, crV: 0, swx: 0, swy: 0, sprintK: 0, roll: 0 });
  const sp = trenchAt(-1.0); P.pos.set(sp[0], groundAt(sp[0], sp[1]), sp[1]); P.yaw = -THREE.MathUtils.degToRad(345); P.pitch = 0.04;
}
function camForward(out = V3()) { return out.set(-Math.sin(P.yaw) * Math.cos(P.pitch), Math.sin(P.pitch), -Math.cos(P.yaw) * Math.cos(P.pitch)); }
function playerEye() { return V3(P.pos.x, P.pos.y + (P.ride && P.ride.eye ? P.ride.eye : P.mode === 'carry' ? 1.45 : P.crouch ? 1.05 : 1.65), P.pos.z); }
/* riding (the jeep's gun, a rubber boat): a wide view, wide enough on a phone held upright to see the road or the far bank on both sides */
/* on foot: a lens of about 92 degrees across, as in the shooters of the kind (it was 72 tall, 104 across on a wide screen - the enemy small and far, the edges stretched); never wider than 72 tall on a narrow screen */
function footFov() { const a = camera.aspect || 1.6; return clamp(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(46)) / a) * 180 / Math.PI, 55, 72); }
function rideFov() { const a = camera.aspect || 1.6, v = 2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(35)) / a) * 180 / Math.PI; return clamp(v, 80, 104); }
/* a touch of third person at a vehicle's gun (the jeep's MG, the tank's hatch): the eye some 1.1 m behind and above the player's own head,
   in the frame of his look, so his helmet and shoulders sit low in the picture whichever way he turns and the crosshair stays where it is;
   k eases it away on aim, when the eye goes back into his head. TPV.r is his figure: our soldier, standing at the gun */
const TPV = { B: 1.02, U: 0.46, S: 0.13, rB: 1.15, rU: 0.95, r: null, v: V3() };   // rB, rU: on the jeep's gun, higher - over the jeep, the road ahead in view
function tpvCam(e, k, ride = false) {
  const sy = Math.sin(P.yaw), cy = Math.cos(P.yaw), sp = Math.sin(P.pitch), cp = Math.cos(P.pitch), B = (ride ? TPV.rB : TPV.B) * k, U = (ride ? TPV.rU : TPV.U) * k, S = TPV.S * k;
  camera.position.set(e.x + sy * cp * B + sy * sp * U + cy * S, e.y - sp * B + cp * U, e.z + cy * cp * B + cy * sp * U - sy * S);
}
function tpvBody(on, e) {
  if (!on) { if (TPV.r) TPV.r.root.visible = false; return; }
  if (!TPV.r) { TPV.r = new Rig('f', FAL_W); TPV.r.gun.visible = false; }
  const R = TPV.r, T = R.T, pt = P.pitch; if (!!R.nsOn !== NEWSOL.on) nsShow(R, NEWSOL.on);
  if (!R.root.visible) R.snapNext = true; R.root.visible = true; R.root.rotation.set(0, P.yaw + Math.PI, 0);
  // the hands on the gun's grips (the rifle of the pose unseen, held low and forward), the body leaning with the look
  R.hYaw = 0; T.rootX = 0; T.hipsY = 0.93; T.hipsX = 0; T.hipsZ = 0; T.hipsYaw = 0; T.torsoX = 0.1 - pt * 0.45; T.torsoY = 0; T.torsoZ = 0; T.arms = null; T.ik = true;
  R.legs(-0.05, 0.08, 0.05, 0.08); R.gunAt(-0.04, 0.3, 0.52, -pt * 0.5, 0, 0); R.apply('aim'); R.headP.rotation.x -= pt * 0.5;
  R.root.position.copy(e); R.root.updateMatrixWorld(true); const hp = R.headP.getWorldPosition(TPV.v);
  R.root.position.x += e.x - hp.x; R.root.position.y += e.y - 0.1 - hp.y; R.root.position.z += e.z - hp.z;   // his eyes where the eye would be in first person
}

/* ================= raycasting ================= */
function rayCapsule(o, d, a, b, r) {
  const vx = b.x - a.x, vy = b.y - a.y, vz = b.z - a.z, wx = o.x - a.x, wy = o.y - a.y, wz = o.z - a.z;
  const bb = d.x * vx + d.y * vy + d.z * vz, cc = vx * vx + vy * vy + vz * vz, dd = d.x * wx + d.y * wy + d.z * wz, ee = vx * wx + vy * wy + vz * wz;
  const D = cc - bb * bb; let t = D > 1e-6 ? (bb * ee - cc * dd) / D : 0; let s = (ee + t * bb) / cc;
  s = clamp(s, 0, 1); t = Math.max(0, s * bb - dd); s = clamp((ee + t * bb) / cc, 0, 1);
  const px = wx + t * d.x - s * vx, py = wy + t * d.y - s * vy, pz = wz + t * d.z - s * vz; const dist = Math.sqrt(px * px + py * py + pz * pz);
  return dist < r ? { t, s } : null;
}
function terrainHit(o, d, maxD) {
  let prev = 0;
  for (let s = 0.5; s < maxD; s += 0.4 + s * 0.012) {
    const x = o.x + d.x * s, y = o.y + d.y * s, z = o.z + d.z * s; const g = groundAt(x, z);
    if (y < g || (y < 0 && g < 0)) { let lo = prev, hi = s; for (let k = 0; k < 6; k++) { const m = (lo + hi) / 2; const yy = o.y + d.y * m, gg = Math.max(groundAt(o.x + d.x * m, o.z + d.z * m), -0.02); if (yy < gg) hi = m; else lo = m; } return { t: hi, water: g < 0 }; }
    prev = s;
  }
  return null;
}
const _inv = new THREE.Matrix4(), _lo = V3(), _ld = V3();
function castShot(o, d, maxD, fromSide) {
  const th = terrainHit(o, d, maxD); let best = { t: th ? th.t : maxD, kind: th ? (th.water ? 'water' : 'ground') : 'none' };
  if (fromSide !== 'e') {
    for (const e of UNITS.enemies) { if (!e.alive) continue; const [a, b, r] = e.capsule(); const h = rayCapsule(o, d, a, b, fromSide === 'f' ? r * 1.4 : r); if (h && h.t < best.t) best = { t: h.t, kind: 'enemy', u: e, head: e.stance !== 'down' && h.s > 0.86 }; }
    for (const bt of BOATS) {
      if (bt.dead || !bt.g.visible) continue;
      bt.seats.forEach((st, i) => { if (!st.alive || st.gone) return; const p = bt.seatWorld(i); const h = rayCapsule(o, d, V3(p.x, p.y + 0.3, p.z), V3(p.x, p.y + 1.0, p.z), 0.3); if (h && h.t < best.t) best = { t: h.t, kind: 'seat', boat: bt, seat: i }; });
      _inv.copy(bt.g.matrixWorld).invert(); _lo.copy(o).applyMatrix4(_inv); _ld.copy(d).transformDirection(_inv);
      let hb = rayBox(_lo, _ld, -2.8, 2.8, -0.32, 0.42, -0.72, 0.72); if (hb !== null) hb *= BOAT_S; if (hb !== null && hb < best.t) best = { t: hb, kind: 'boat', boat: bt };
    }
  }
  if (fromSide !== 'e') { const vh = rayVeh(o, d, best.t); if (vh) best = vh; }
  if (fromSide !== 'f') for (const f of FRIENDS) { if (f.state === 'carried' || !f.unit.rig.root.visible) continue; const [a, b, r] = f.unit.capsule(); const h = rayCapsule(o, d, a, b, r * 0.9); if (h && h.t < best.t && h.t > 1.0) best = { t: h.t, kind: 'friend', f }; }
  { const wt = segHitT(o.x, o.y, o.z, o.x + d.x * best.t, o.y + d.y * best.t, o.z + d.z * best.t, 0.35); if (wt >= 0) best = { t: wt * best.t, kind: 'wall', k: SEG_K }; }
  if (fromSide !== 'e') { const ph = propRay(o, d, best.t); if (ph) best = { t: ph.t, kind: 'prop', prop: ph.item }; }
  best.p = V3(o.x + d.x * best.t, o.y + d.y * best.t, o.z + d.z * best.t); best.dir = d; best.o = o;
  return best;
}
function rayBox(o, d, x0, x1, y0, y1, z0, z1) {
  let tmin = -1e9, tmax = 1e9;
  for (const [oo, dd, a, b] of [[o.x, d.x, x0, x1], [o.y, d.y, y0, y1], [o.z, d.z, z0, z1]]) {
    if (Math.abs(dd) < 1e-8) { if (oo < a || oo > b) return null; continue; }
    let t1 = (a - oo) / dd, t2 = (b - oo) / dd; if (t1 > t2) [t1, t2] = [t2, t1]; tmin = Math.max(tmin, t1); tmax = Math.min(tmax, t2); if (tmin > tmax) return null;
  }
  return tmax < 0 ? null : Math.max(tmin, 0);
}

/* ================= shelters ================= */
const SHELTERS = ['aid', 'cmd', 'q1', 'q2', 'kitchen', 'shul', 'ammo'];
// until the stronghold is built (only its own mission builds it) its doors stand at its middle, as far from every other battlefield as the real ones
for (const id of SHELTERS) if (!DOORS[id]) DOORS[id] = { x: 0, z: 0, rot: 0, label: '' };
function nearestShelter(x = P.pos.x, z = P.pos.z) { let b = null, bd = 1e9; for (const id of SHELTERS) { const d = DOORS[id]; const dd = Math.hypot(d.x - x, d.z - z); if (dd < bd) { bd = dd; b = d; } } return b; }
function inTrench() { return onTrench(P.pos.x, P.pos.z) < 1.4; }
function underRoof(x = P.pos.x, z = P.pos.z) {
  if (MODE === 'mezach' && inDugout(x, z)) return true; for (const r of ROOFS) { const dx = x - r.x, dz = z - r.z, a = dx * r.tx + dz * r.tz; if (Math.abs(a) < 1.75 && Math.hypot(dx - r.tx * a, dz - r.tz * a) < 1.4) return true; } return false; }
function sheltered() { if (CH() && CH().shelter) return CH().shelter(); if (underRoof()) return true; if (P.mode !== 'rifle') return false; if (inTrench() && (P.crouch || TOUCH)) return true; const d = nearestShelter(); return Math.hypot(d.x - P.pos.x, d.z - P.pos.z) < 3.8; }

/* ================= friendlies ================= */
const FRIEND_DEF = [['יוסי', 'W1'], ['דודו', 'W3'], ['אבי', 'W4'], ['רפי', 'N2'], ['שמוליק', 'N3'], ['גבי', 'S2'], ['ניסים', 'S3'], ['מוטי', 'E1'], ['אריה', 'W2N'], ['שלום', 'W2S'], ['בני', 'T-22'], ['עמי', 'T6'], ['חיים', 'T-42'], ['צביקה', 'T-58'], ['קובי', 'K18'], ['אלי', 'K48'], ['משה', 'T27']];
const TPOSTS = {};
function postById(id) {
  if (id[0] !== 'T' && id[0] !== 'K') return POSTS.find((p) => p.id === id);
  if (TPOSTS[id]) return TPOSTS[id];
  const k = id[0] === 'K' ? Number(id.slice(1)) : kz(Number(id.slice(1))), p = TR.pts[k], o = TR.out[k], x = p[0] + o[0] * 0.75, z = p[1] + o[1] * 0.75;
  return (TPOSTS[id] = { id, name: 'תעלת הקרב', x, z, g: groundAt(x, z), fx: o[0], fz: o[1], mag: null, occupant: null, stand: [x, z], trench: true });
}
const FRIENDS = FRIEND_DEF.map(([name, postId]) => {
  const unit = new Unit('f', 'rifle'); const el = document.createElement('div'); el.className = 'mk wounded';
  const marker = new CSS2DObject(el); marker.center.set(0.5, 1); marker.visible = false; scene.add(marker);
  return { name, postId, unit, post: null, state: 'bunker', bleed: 0, fireCd: rand(0.5, 2), scanCd: 0, target: null, burst: 0, burstCd: 0, marker, el, aimP: 0, crouchT: 0, delay: 0, goal: null };
});
function resetFriends() {
  for (const f of FRIENDS) {
    f.name = FRIEND_DEF[FRIENDS.indexOf(f)][0]; f.aid = false; f.bed = null; f.unit.rig.gun.visible = true; f.post = postById(f.postId); f.post.occupant = f; f.state = 'duck'; f.bleed = 0; f.target = null; f.burst = 0; f.marker.visible = false;
    const u = f.unit; u.alive = true; u.fall = -1; u.stance = 'hide'; u.place(f.post.stand[0], f.post.stand[1]); u.heading = Math.atan2(f.post.fx, f.post.fz); u.rig.root.visible = true; u.rig.pose('hide', 0); u.sync();
  }
  for (const p of POSTS) if (!FRIENDS.some((f) => f.post === p)) p.occupant = null;
  for (const p of POSTS) if (p.mag) { p.mag.belt = p.mag.cap || 200; p.mag.reload = 0; p.mag.yaw = p.mag.yaw0; p.mag.pitch = 0; p.mag.pivot.rotation.set(0, p.mag.yaw0, 0); }
}
function friendsToPosts() { for (const f of FRIENDS) if (f.state === 'duck') { f.state = 'post'; f.unit.stance = 'stand'; f.scanCd = rand(0.2, 1.5); } }
function steer(u, tx, tz, speed, dt) {
  const dx = tx - u.pos.x, dz = tz - u.pos.z, d = Math.hypot(dx, dz); if (d < 0.05) return d;
  const base = Math.atan2(dx, dz), st = Math.min(d, speed * dt);
  // a friend following the player keeps inside the lane of the moment: a step that takes him out of it (or further out) is refused like a wall
  const lb0 = u.laneLock ? laneBad(u.pos.x, u.pos.z) : 0, inL = (x, z) => { if (!u.laneLock) return true; const b = laneBad(x, z); return b <= 0 || (lb0 > 0 && b <= lb0 + 1e-5); };
  for (const off of [0, 0.5, -0.5, 1.0, -1.0, 1.5, -1.5]) {
    const a = base + off, nx = u.pos.x + Math.sin(a) * st, nz = u.pos.z + Math.cos(a) * st;
    if (!blocked(nx, nz, 0.35, u.pos.y) && inL(nx, nz)) { u.pos.x = nx; u.pos.z = nz; u.pos.y = hAt(nx, nz, u.pos.y); u.heading = a; return d; }
  }
  const fx = u.pos.x + dx / d * st, fz = u.pos.z + dz / d * st; u.heading = base;
  if (inL(fx, fz) && (!blocked(fx, fz, 0.12, u.pos.y) || blocked(u.pos.x, u.pos.z, 0.12, u.pos.y))) { u.pos.x = fx; u.pos.z = fz; u.pos.y = hAt(fx, fz, u.pos.y); }
  return d;
}
function reviveFriend(f) {
  const u = f.unit; f.state = f.prevState === 'follow' ? 'follow' : 'post'; f.bleed = 0; f.marker.visible = false; f.target = null; f.burst = 0; f.scanCd = 0.5; u.fall = -1; u.stance = 'stand'; u.alive = true; u.rig.root.rotation.x = 0; u.rig.shut = false; u.rig.head.material = MAT.faces[u.side][u.rig.faceV];
  if (f.post && !f.post.occupant) f.post.occupant = f; if (f.state === 'follow') { f.ti = SZ.trailN ? Math.max(SZ.trailBase, SZ.trailN - 6) : 0; f.stuck = 0; }
}
function woundFriend(f, killed = false, force = false) {
  if (GOD()) return; if (f.state !== 'post' && f.state !== 'follow') return; if (!force && MODE === 'mezach' && !inStage(f.unit.pos.x, f.unit.pos.z)) return;
  f.prevState = f.state; if (f.post && f.post.occupant === f) f.post.occupant = null;
  const u = f.unit; u.fall = 0; u.fallDir = 1; u.stance = 'down';
  if (killed) { f.state = 'kia'; feed(`${f.name} נהרג`, 'bad'); STATS.kia++; }
  else { f.state = 'wounded'; f.bleed = diff.bleed; feed(`${f.name} נפגע! ״חובש!״`, 'bad'); f.marker.visible = true; radio(f.name, 'נפגעתי! חובש!', 3); }
}
/* ================= the squad: how the men beside the player fight =================
   As an IDF squad does. Contact: the first man to see the enemy calls it - the clock and the range - and the squad goes to ground, each man
   to the cover nearest his place in the line that faces the enemy (sqfCover), kneeling where there is none. Fire and movement: in contact
   the squad moves in two fire teams, one bounding forward bent low while the other covers it with fire, then the other way. Covering fire:
   a man who sees no target himself fires on one a comrade called (sqfSupp), to keep the enemy's head down. A magazine is changed with a
   call, and another man answers that he covers. A grenade is called and run from. The calls show over the men's heads, short */
const SQF = { at: -1, contact: false, cT: -99, threat: null, spots: new Map(), bound: 0, boundT: 0, callT: -99, later: [], contactCall: -99 };
const sqfTeam = (f) => (f.fi ?? FRIENDS.indexOf(f)) % 2;
function sqfReset() { SQF.at = -1; SQF.contact = false; SQF.cT = -99; SQF.threat = null; SQF.spots.clear(); SQF.later.length = 0; SQF.contactCall = -99; for (const f of FRIENDS) { sqfTakeCover(f, null); f.cvC = null; f.cvT = 0; f.supE = null; if (f.say) f.say.visible = false; } }
function shout(f, text, dur = 1.9, force = false) {
  if (!f || !f.unit || !f.unit.alive || CINE.on || GAME.state !== 'play') return false;
  if (!force && (GAME.t - SQF.callT < 1.1 || GAME.t < (f.shoutCd || 0))) return false;
  if (camera.position.distanceTo(f.unit.pos) > 60) return false;
  SQF.callT = GAME.t; f.shoutCd = GAME.t + 3.2;
  if (!f.say) { const el = document.createElement('div'); el.className = 'say'; f.say = new CSS2DObject(el); f.say.center.set(0.5, 1); scene.add(f.say); f.sayEl = el; }
  f.sayEl.textContent = `${f.name}: ${text}`; f.say.visible = true; f.sayT = dur; return true;
}
function sqfLater(f, text, delay) { if (f) SQF.later.push({ f, text, at: GAME.t + delay }); }
function sqfMate(f, R = 16) { let b = null, bd = R; for (const o of FRIENDS) { if (o === f || !o.unit.alive || (o.state !== 'follow' && o.state !== 'post')) continue; const d = o.unit.pos.distanceTo(f.unit.pos); if (d < bd) { bd = d; b = o; } } return b; }
function sqfSpot(e, f) {   // a man seen (or heard firing): the squad knows where he is for a few seconds
  if (!e || !e.alive) return; const fresh = !SQF.contact; SQF.spots.set(e, GAME.t); SQF.cT = GAME.t;
  if (fresh && f && GAME.t - SQF.contactCall > 18 && P.alive) { const d = Math.hypot(e.pos.x - P.pos.x, e.pos.z - P.pos.z);
    if (shout(f, `${pick(['מגע!', 'מגע! מגע!', 'אויב!'])} ${clockOf(e.pos)}, ${Math.max(10, Math.round(d / 10) * 10)} מטר!`, 2.4, true)) { SQF.contactCall = GAME.t; sqfLater(sqfMate(f, 30), pick(['למחסה!', 'כולם לתפוס מחסה!', 'פזר! למחסה!', 'אש לעברם!']), 1.1); } }
}
function sqfFrame() {
  if (SQF.at === GAME.t) return; SQF.at = GAME.t;
  for (const [e, t] of SQF.spots) if (!e.alive || GAME.t - t > 7) SQF.spots.delete(e);
  let sx = 0, sz = 0, sw = 0;
  for (const [e] of SQF.spots) { const w = 1 / Math.max(8, Math.hypot(e.pos.x - P.pos.x, e.pos.z - P.pos.z)); sx += e.pos.x * w; sz += e.pos.z * w; sw += w; }
  const was = SQF.contact; SQF.contact = GAME.t - SQF.cT < 7 && P.alive && !CINE.on;
  if (sw > 0) SQF.threat = { x: sx / sw, z: sz / sw }; else if (!SQF.contact) SQF.threat = null;
  if (SQF.contact && !was) { SQF.bound = 0; SQF.boundT = GAME.t; }
  for (let i = SQF.later.length - 1; i >= 0; i--) { const q = SQF.later[i]; if (GAME.t >= q.at) { SQF.later.splice(i, 1); shout(q.f, q.text, 1.7, true); } }
  if (!SQF.contact) return;
  // the bound changes hands when the men moving are down in their places, or after a few seconds; only if the others have somewhere to go
  const team = (k) => FRIENDS.filter((f) => f.state === 'follow' && f.unit.alive && sqfTeam(f) === k), movers = team(SQF.bound);
  if ((movers.every((f) => !f.moving) && GAME.t - SQF.boundT > 1.4) || GAME.t - SQF.boundT > 5 || !movers.length) {
    const other = team(1 - SQF.bound), go = other.filter((f) => f.wantMove);
    if (go.length) { SQF.bound = 1 - SQF.bound; SQF.boundT = GAME.t;
      if (Math.random() < 0.55) { const m = go[0], c = movers.find((f) => !f.moving); if (shout(m, pick(['זז!', 'עובר!', 'מתקדם!', 'קפיצה!']), 1.5) && c) sqfLater(c, pick(['מחפה!', 'זוז, מחפה!', 'אש חיפוי!']), 0.6); } }
  }
}
/* the cover a man in the line takes in contact: near his place (and the player), between him and the enemy, free, reachable in a straight run */
function sqfCover(f, sx, sz) {
  if (f.cvT > GAME.t && f.cvFor && Math.hypot(f.cvFor[0] - sx, f.cvFor[1] - sz) < 2.5) return f.cvC;
  f.cvT = GAME.t + 1.2; f.cvFor = [sx, sz]; const u = f.unit, T = SQF.threat; let best = null, bs = 1e9;
  if (T) for (const c of (SZ.covers && SZ.covers.length ? SZ.covers : COVER)) {
    if (c.floor !== undefined || (c.by && c.by.alive) || (c.fby && c.fby !== f && c.fby.unit.alive && c.fby.state === 'follow')) continue;
    const dsl = Math.hypot(c.x - sx, c.z - sz); if (dsl > 7) continue;
    const dp = Math.hypot(c.x - P.pos.x, c.z - P.pos.z); if (dp < 2.4 || dp > 21) continue;
    if (c.y !== undefined && Math.abs(c.y - u.pos.y) > 1.2) continue;
    const tx = T.x - c.x, tz = T.z - c.z, dT = Math.hypot(tx, tz); if (dT < 8 || (tx * c.nx + tz * c.nz) / dT < 0.4 || laneBad(c.x, c.z) > 0) continue;
    const sc = dsl + 0.25 * Math.hypot(c.x - u.pos.x, c.z - u.pos.z) - (c.h > 1.2 ? 0.6 : 0); if (sc < bs) { bs = sc; best = c; }
  }
  if (best && !clearRun(u.pos.x, u.pos.z, best.x, best.z, u.pos.y)) best = null;
  return (f.cvC = best);
}
function sqfTakeCover(f, c) { if (f.cov && f.cov.fby === f) f.cov.fby = null; f.cov = c; if (c) c.fby = f; }
/* in contact a man without cover kneels; behind low cover he kneels to fire over it; behind a wall he stands */
const sqfKneel = (f) => f.state === 'follow' && SQF.contact && !(f.cov && f.cov.h >= 0.95);
/* covering fire: no target of his own in sight, he fires on a man a comrade called - over the top of the man's cover, to keep him down */
function sqfSupp(f, dt) {
  const u = f.unit; f.supCd = (f.supCd ?? rand(0.4, 1.2)) - dt; f.supChk = (f.supChk || 0) - dt; let e = f.supE;
  if (!e || !e.alive || !SQF.spots.has(e) || f.supChk <= 0) {
    f.supChk = 0.8; e = null; let bd = 170; const ex = u.pos.x, ey = u.pos.y + 1.55 * US, ez = u.pos.z;
    for (const [q] of SQF.spots) { const d = Math.hypot(q.pos.x - ex, q.pos.z - ez); if (d > bd || d < 4) continue; const c = q.chest(); if (losW(ex, ey, ez, c.x, c.y + 0.75, c.z)) { bd = d; e = q; } }
    f.supE = e;
  }
  if (!e) return false;
  const c = e.chest(), kneel = sqfKneel(f); u.face(c.x, c.z); u.stance = kneel ? 'crouch' : 'stand'; const eye = u.eye(); f.aimP = Math.atan2(c.y + 0.4 - eye.y, Math.hypot(c.x - eye.x, c.z - eye.z)); u.rig.pose(kneel ? 'crouch' : 'aim', u.anim, f.aimP);
  if (f.supCd <= 0) {
    if (!(f.supN > 0)) { f.supN = Math.floor(rand(2, 4)); if (Math.random() < 0.12) shout(f, pick(['מרתק אותו!', 'אש על המצרי!', 'תורידו לו את הראש!'])); }
    f.supN--; f.supCd = f.supN > 0 ? 0.3 : rand(1.3, 2.4) * diff.fgun;
    const from = u.muzzle(); fxMuzzle(from, false); sndShot('fal-npc', from);
    const end = c.clone().add(V3(rand(-1.1, 1.1), rand(-0.2, 1.0), rand(-1.1, 1.1))); if (Math.random() < 0.3) fxTracer(from, end, false);
    fxDust(V3(end.x, surfAt(end.x, end.z) + 0.2, end.z), groundAt(end.x, end.z) < 0); supPin(e, 0.3);
    if (Math.random() < 0.015 * diff.fAcc) killEnemy(e, false);   /* a lucky round now and then; the fire is to pin him, not to kill */
  }
  return true;
}
/* an enemy grenade near him: he shouts it and runs from it */
function sqfNade(f, dt) {
  const u = f.unit;
  if (f.dodgeT > 0) { f.dodgeT -= dt; u.anim += dt * 9; u.stance = 'stand'; const d = steer(u, f.dodgeX, f.dodgeZ, 5.6, dt); u.rig.pose(d > 0.6 ? 'crun' : 'hide', u.anim); f.post.stand = [u.pos.x, u.pos.z]; return true; }
  f.dodgeCd = (f.dodgeCd || 0) - dt; if (f.dodgeCd > 0) return false; f.dodgeCd = 0.2;
  for (const q of PROJ) { if (q.type !== 'gren' || q.owner === 'player') continue; const dx = u.pos.x - q.m.position.x, dz = u.pos.z - q.m.position.z, d = Math.hypot(dx, dz);
    if (d < 6.5 && q.m.position.y - groundAt(q.m.position.x, q.m.position.z) < 2.0) { const k = (7.8 - d) / (d || 1);
      if (!q.called) { q.called = true; shout(f, pick(['רימון!', 'רימון! לזוז!', 'רימון, תשכבו!']), 1.6, true); }
      f.dodgeX = u.pos.x + dx * k + rand(-1, 1); f.dodgeZ = u.pos.z + dz * k + rand(-1, 1); f.dodgeT = Math.min(q.fuse + 0.5, 2.0); sqfTakeCover(f, null); f.moving = true; f.holdP = null; return true; } }
  return false;
}
const PDOOR = { on: false };   /* the player opening a door himself (13_hermon.js): for a moment his feet, his eyes and his hands are the scene's */
const FCALL = { t: -99 };   // the last time a friend shouted a warning
function updFriend(f, dt, time) {
  const u = f.unit; u.anim += dt; sqfFrame();
  if (f.say && f.say.visible) { f.sayT -= dt; f.say.position.set(u.pos.x, u.pos.y + 2.05 * US, u.pos.z); if (f.sayT <= 0 || !u.alive || !u.rig.root.visible || CINE.on) f.say.visible = false; }
  if (f.state === 'bunker') return;
  if (f.state === 'ride') { const r = f.ride(); u.pos.copy(r.p); u.heading = r.hd; u.stance = 'crouch'; u.rig.pose(r.pose || 'crouch', u.anim, 0); u.sync(); return; }
  if (f.state === 'board') { const g = f.goal(); const d = steer(u, g.x, g.z, 5.2, dt); u.anim += dt * 9.5; u.stance = 'stand'; u.rig.pose('run', u.anim); if (d < 0.8) f.onArrive(f); u.sync(); return; }
  if (f.state === 'duck') { u.stance = 'hide'; u.rig.pose('hide', u.anim); u.sync(); return; }
  if (f.state === 'door') {   // the man opening a door: to its near side, then the kick, the hand on the handle, or the charge placed and back away from it
    const J = f.doorJob; if (!J) { f.state = 'follow'; u.sync(); return; } u.stance = 'stand';
    if (!J.ready) { const dd = steer(u, J.x, J.z, 4.6, dt); if (dd > 0.3 && GAME.t < J.t1) { u.anim += dt * 8; u.rig.pose('crun', u.anim); u.sync(); return; } J.ready = GAME.t; }
    const k = GAME.t - J.ready; u.face(J.fx, J.fz);
    if (J.way === 'kick') u.rig.pose('kick', k / PD_SLOW, 0);
    else if (J.way === 'hand') u.rig.pose('aim', u.anim, 0);
    else if (k < 0.9 * PD_SLOW) { u.stance = 'crouch'; u.rig.pose('crouch', u.anim, -0.2); }
    else { const dd = steer(u, J.bx, J.bz, 4.6, dt); if (dd > 0.3) { u.anim += dt * 8; u.rig.pose('crun', u.anim); } else { u.stance = 'hide'; u.face(J.fx, J.fz); u.rig.pose('hide', u.anim); } }
    if (k > J.dur) { f.state = J.prev || 'follow'; f.doorJob = null; f.moving = true; }
    u.sync(); return;
  }
  if (f.state === 'toPost') {
    if (f.delay > 0) { f.delay -= dt; if (f.delay > 0) return; u.rig.root.visible = true; }
    const d = steer(u, f.goal[0], f.goal[1], 5.3, dt); u.anim += dt * 9; u.rig.pose('run', u.anim);
    if (d < 0.45) { f.state = 'post'; u.place(f.goal[0], f.goal[1], f.goalY); u.heading = Math.atan2(f.post.fx, f.post.fz); }
    u.sync(); return;
  }
  if (f.state === 'follow' && (sqfNade(f, dt) || szFollow(f, dt))) { u.sync(); return; }
  if (f.state === 'post' || f.state === 'follow') {
    const p = f.post; f.scanCd -= dt;
    // under fire he ducks for a moment, then comes up again; he does not stand in the open trading shots
    f.supp = Math.max(0, (f.supp || 0) - dt * 0.8); f.duckT = (f.duckT ?? -9) - dt;
    if (diff.fSmart > 0 && f.supp > 3 && f.duckT < -2.5) { f.duckT = rand(1.0, 1.8); f.supp = 0; if (Math.random() < 0.3) shout(f, pick(['יורים עליי!', 'אני מרותק!', 'מרתקים אותנו!', 'ראשים למטה!'])); }
    if (f.scanCd <= 0) {
      f.scanCd = rand(0.35, 0.6); f.target = null; let bd = 300; const eye = u.eye(), pe = P.alive ? P.pos : null;
      // the squad picks its targets by danger, not by distance alone: a man inside the wire or in the trench, one firing at the player from close,
      // an RPG or a flamethrower come first; a man in the open before a man behind cover; and the fire is spread, two friends do not take the same man
      const smart = diff.fSmart > 0, taken = new Map(); if (smart) for (const o of FRIENDS) if (o !== f && o.target && o.target.u) taken.set(o.target.u, (taken.get(o.target.u) || 0) + 1);
      for (const e of UNITS.enemies) { if (!e.alive || e.state === 'jump' || e.state === 'film' || e.mmHide) continue; const c = e.chest(), d = eye.distanceTo(c); if (d > 300) continue;
        let w = d * (!FIELDM() && inPoly(e.pos.x, e.pos.z, YARD) ? 0.4 : 1) * (e.state === 'trench' || e.inside ? 0.5 : 1);
        if (!smart) { if (w < bd && losW(eye.x, eye.y, eye.z, c.x, c.y + 0.2, c.z)) { bd = w; f.target = { u: e }; } continue; }   /* on the hard level the men beside you just shoot at the nearest man they see */
        if (pe) { const dp = Math.hypot(e.pos.x - pe.x, e.pos.z - pe.z); if (dp < 25 && e.target && e.target.player) w *= 0.45 + 0.02 * dp; }
        if (e.kind === 'rpg' || e.kind === 'flame' || e.atgm) w *= 0.6;
        w *= (e.stance === 'hide' ? 1.8 : e.stance === 'stand' ? 0.85 : 1) * (1 + 0.6 * (taken.get(e) || 0));
        if (w < bd && losW(eye.x, eye.y, eye.z, c.x, c.y + 0.2, c.z)) { bd = w; f.target = { u: e }; } }
      // a man close behind the player, or beside him, while he looks the other way: the friend who sees him shouts
      if (f.target && f.target.u && pe && !CINE.on && Math.abs(GAME.t - FCALL.t) > (diff.fSmart >= 2 ? 7 : diff.fSmart ? 9 : 22)) { const e = f.target.u, vx = e.pos.x - pe.x, vz = e.pos.z - pe.z, dp = Math.hypot(vx, vz);
        if (dp < 14) { const fw = camForward(_aimF), c = (vx * fw.x + vz * fw.z) / (dp || 1); if (c < 0.25) { const right = vx * -fw.z + vz * fw.x > 0; FCALL.t = GAME.t; radio(f.name, `${pick(MODE === 'hermon' ? ['סורי', 'זהירות, סורי', 'יש סורי'] : ['מצרי', 'זהירות, מצרי', 'יש מצרי'])} ${c < -0.5 ? 'מאחוריך' : right ? 'מימינך' : 'משמאלך'}!`, 2.2); } } }
      if (f.target && f.target.u) sqfSpot(f.target.u, f);
      if (!f.target) for (const bt of BOATS) { if (bt.dead || bt.state !== 'cross' || !bt.g.visible) continue; const i = bt.seats.findIndex((s) => s.alive && !s.gone); if (i < 0) continue; const sp = bt.seatWorld(i); const d = eye.distanceTo(sp); if (d < 420 && d < bd && los(eye.x, eye.y, eye.z, sp.x, sp.y + 0.8, sp.z)) { bd = d; f.target = { boat: bt, seat: i }; } }
    }
    const isMag = p.mag && p.occupant === f;
    let tp = null; if (f.target) tp = f.target.u ? (f.target.u.alive ? f.target.u.chest() : null) : (f.target.boat.seats[f.target.seat].alive ? f.target.boat.seatWorld(f.target.seat).add(V3(0, 0.7, 0)) : null);
    if (!tp) f.target = null;
    f.peekT = (f.peekT || 0) - dt;
    if (f.duckT > 0 || (f.peekT > 0 && tp && !isMag)) {
      if (tp) u.face(tp.x, tp.z); u.stance = 'hide'; u.rig.pose('hide', u.anim); if (f.peekT > 0) f.fireCd -= dt;
      // moving along his cover, crouched, to come up somewhere the enemy is not looking (a post on the ground; men at windows stay at theirs)
      if (f.peekKind === 'move' && f.state === 'post' && p && p.fx !== undefined && p.x !== undefined && p.y === undefined) { const bx = p.stand ? p.stand[0] : p.x, bz = p.stand ? p.stand[1] : p.z; u.anim += dt * 3; steer(u, bx + p.fz * f.peekOff, bz - p.fx * f.peekOff, 1.6, dt); if (tp) u.face(tp.x, tp.z); }
      // pinned down, he still answers: the rifle up over the cover and a few blind rounds toward the enemy
      if (f.duckT > 0 && tp && f.target && f.target.u) { f.blindCd = (f.blindCd ?? rand(0.4, 0.9)) - dt; if (f.blindCd <= 0) { f.blindCd = rand(0.18, 0.4); const from = u.muzzle().add(V3(0, 0.35, 0)); fxMuzzle(from, false); sndShot('fal-npc', from); if (Math.random() < 0.5) supPin(f.target.u, 0.12); } }
    }
    else if (tp) {
      u.face(tp.x, tp.z); const eye = u.eye(); f.aimP = Math.atan2(tp.y - eye.y, Math.hypot(tp.x - eye.x, tp.z - eye.z));
      if (isMag) { const yaw = Math.atan2(tp.x - p.mag.pivot.position.x, tp.z - p.mag.pivot.position.z); p.mag.pivot.rotation.set(-f.aimP, yaw, 0); }
      f.fireCd -= dt;
      if (f.fireCd <= 0) {
        if (f.burst <= 0) { f.burst = isMag ? Math.floor(rand(6, 11)) : Math.floor(rand(1, 3)); }
        f.burst--; f.fireCd = f.burst > 0 ? (isMag ? 0.09 : 0.35) : rand(1.1, 2.4) * (isMag ? 1.2 : 1) * diff.fgun;
        if (f.burst <= 0 && !isMag) {   // the burst fired: he works his cover - down and up again from another spot along it, a magazine changed behind it every few bursts, or he stays up on his target
          f.magN = (f.magN || 0) + 1; const r = Math.random();
          if (f.magN >= 4) { f.magN = 0; f.peekT = rand(2.2, 3.0); f.peekKind = 'reload'; f.fireCd = Math.max(f.fireCd, f.peekT + 0.15); if (Math.random() < 0.6 && shout(f, pick(['מחליף מחסנית!', 'מחסנית!', 'טוען!']))) sqfLater(sqfMate(f), pick(['מחפה!', 'מחפה עליך!', 'יש לך כיסוי!']), 0.7); }
          else if (r < 0.7) { f.peekT = f.fireCd * rand(0.55, 0.9); f.peekKind = 'move'; f.peekOff = clamp((f.peekOff || 0) + (Math.random() < 0.5 ? -1 : 1) * rand(0.5, 0.9), -0.9, 0.9); }
        }
        const from = isMag ? p.mag.pivot.localToWorld(V3(0, 0.012, 0.9)) : u.muzzle(); fxMuzzle(from, isMag); sndShot('fal-npc', from);
        const d = from.distanceTo(tp); const rangeF = clamp(1 - d / 420, 0.2, 1);
        let pHit = (isMag ? 0.0018 : FIELDM() ? 0.013 : 0.0045) * rangeF;
        // close in he rarely misses: an Egyptian at the wire or in the trench is shot by the friends round him; a man behind cover is hard to hit
        if (f.target.u) { const tu = f.target.u; pHit *= (1 + clamp(1 - d / 35, 0, 1) * (isMag ? 3 : 8)) * (tu.stance === 'hide' ? 0.35 : tu.stance === 'crouch' ? 0.6 : 1) * (tu.state === 'trench' || tu.inside ? 1.5 : 1); }
        if (f.target.boat) pHit *= 0.15; pHit *= diff.fAcc * (mzEase() ? mzEase().fAcc : 1);
        const hit = Math.random() < pHit; const end = tp.clone(); if (!hit) end.add(V3(rand(-1.5, 1.5), rand(-0.6, 1.2), rand(-1.5, 1.5)));
        if (isMag && Math.random() < 0.4) fxTracer(from, end, false);
        if (hit) { if (f.target.u) { killEnemy(f.target.u, false); if (Math.random() < 0.3) shout(f, pick(['נפל!', 'חיסלתי אותו!', 'פגעתי!', 'הוא למטה!'])); } else killSeat(f.target.boat, f.target.seat); } else { if (f.target.u) supPin(f.target.u, isMag ? 0.12 : 0.2); } if (!hit) fxDust(V3(end.x, surfAt(end.x, end.z) + 0.2, end.z), groundAt(end.x, end.z) < 0);
      }
      const kn = sqfKneel(f); u.stance = kn ? 'crouch' : 'stand'; u.rig.pose(kn ? 'crouch' : 'aim', u.anim, f.aimP);
    } else if (SQF.contact && f.state === 'follow' && !isMag && sqfSupp(f, dt)) { /* covering fire on a man his comrades see */ }
    else if (SQF.contact && f.state === 'follow') {   // contact, nothing to fire at: down behind his cover, or kneeling, watching where the enemy is
      const T = SQF.threat; if (T) u.heading += wrapPi(Math.atan2(T.x - u.pos.x, T.z - u.pos.z) - u.heading) * Math.min(1, dt * 4);
      const low = f.cov && f.cov.h < 1.3; u.stance = low ? 'hide' : 'crouch'; u.rig.pose(low ? 'hide' : 'crouch', u.anim, 0);
    } else { u.heading += wrapPi(Math.atan2(p.fx, p.fz) - u.heading) * 0.05; u.stance = 'stand'; u.rig.pose('idle', u.anim); }
  } else if (f.state === 'wounded' || f.state === 'stable' || f.state === 'saved' || f.state === 'kia') {
    if (u.fall >= 0 && u.fall < 1.4) { u.fall += dt; if (u.fall < 0.5) u.fallSlope = fallSlope(u, 1); u.rig.fallPose(u.fall, 1, 'back', u.fallSlope || 0); }
    else if (f.state !== 'kia') u.rig.pose('prone', f.state === 'wounded' ? u.anim * 2 : u.anim * 0.4);
    if (f.state === 'wounded') { f.bleed -= dt; if (f.bleed <= 0) { f.state = 'kia'; f.marker.visible = false; feed(`${f.name} מת מפצעיו`, 'bad'); STATS.kia++; } }
  }
  u.sync();
  if (f.marker.visible) {
    const c = u.pos; f.marker.position.set(c.x, c.y + 1.2, c.z);
    const s = Math.max(0, Math.ceil(f.bleed)); const d = Math.round(camera.position.distanceTo(c));
    f.el.className = 'mk ' + (f.state === 'stable' ? 'stable' : 'wounded');
    f.el.innerHTML = `<i>${crossSvg(f.state === 'stable' ? '#93d48d' : '#ff5a4a')}</i>${f.name}<small>${f.state === 'stable' ? `מיוצב · ${(CH() && CH().stableTag && CH().stableTag(f)) || 'לתאג״ד'}` : `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`} · ${d} מ׳</small>`;
  }
}
function crossSvg(c) { return `<svg viewBox="0 0 18 18" width="18" height="18"><path d="M6 1h6v5h5v6h-5v5H6v-5H1V6h5z" fill="${c}" stroke="#000" stroke-width="1"/></svg>`; }

/* ================= enemies ================= */
const GROUPS = [];
function getUnit() {
  let u = UNITS.enemies.find((e) => !e.alive && !e.rig.root.visible); if (u) return u;
  let oldest = null; for (const e of UNITS.enemies) if (!e.alive && e.deadAt !== undefined && (!oldest || e.deadAt < oldest.deadAt)) oldest = e;
  if (oldest) { oldest.rig.root.visible = false; return oldest; } return null;
}
function spawnEnemy(x, z, kind, group, path, opts = {}) {
  const e = getUnit(); if (!e) return null;
  e.thrT = -99; e.arcT = -9; e.shotT = -9;   /* nothing he did in an earlier life counts as fire at the player */
  if (e.mmHide || e.pitHid) fmDisguise(e, false); e.mmHide = false; e.pitHid = false;   /* a man last used as a disguised figure in a crater gets his own colours back */
  e.side = 'e'; e.setKind(kind); e.alive = true; e.hp = 100; e.fall = -1; e.stance = 'stand'; e.place(x, z); e.rig.root.visible = true; e.rig.gun.visible = true; e.deadAt = undefined; e.rig.shut = false; e.rig.head.material = MAT.faces[e.side][e.rig.faceV]; e.rig.deadOpen = Math.random() < 0.35; e.rig.blinkT = rand(1, 4);
  Object.assign(e, { state: 'move', path, pi: 0, group, t: 0, fireCd: rand(0.5, 1.5), burst: 0, scanCd: 0, target: null, stopCd: rand(2, 5), engageT: 0, gCd: diff.gren > 0 ? rand(8, 20) / diff.gren : 1e9, rpgCd: rand(4, 9), flameT: 0, hold: opts.hold ?? -1, speed: rand(3.9, 4.6), inside: false, goalCd: 0, charge: false, plan: null, ps: 0, tcov: null, tcovCd: 0, inCov: false, usedTrav: null, k: 0, meleeCd: 0, throwT: 0, cover: null, sz: null, slot: null, cov: null, dormant: false, wakeG: undefined, wakeR: 24, climb: false, raid: false, sq: undefined, guide: null, peek: false, rpgAim: 0, wild: false, rpgMiss: false, noTag: false,
    sqAuto: 'g' + Math.round(GAME.t / 4) + ':' + Math.round(x / 50) + ':' + Math.round(z / 50), supp: 0, seeT: 0, alert: false, lkp: null, lkpT: -99, fellBack: false, flanking: false, peekOff: 0, blindCd: undefined, blindN: 0, blindK: undefined, tac: undefined, flankD: false, reactCd: undefined, reactT: 0 });   // (a pooled body keeps nothing of how his last owner fought)
  if (opts.jump) { e.state = 'jump'; e.jd = 0; e.j0 = opts.jump.clone(); e.j1 = V3(x, groundAt(x, z), z); e.pos.copy(e.j0); }
  e.sync(); return e;
}
function leaveCover(e) { if (e.cover) { e.cover.by = null; e.cover = null; } }
function takeCover(e, c) { leaveCover(e); c.by = e; e.cover = c; e.state = 'toCover'; e.toCoverT = 0; }
function findCover(e, tp, R) {
  let best = null, bs = 1e9; const dT = Math.hypot(tp.x - e.pos.x, tp.z - e.pos.z);
  for (const c of COVER) {
    if (c.by && c.by !== e) continue; const de = Math.hypot(c.x - e.pos.x, c.z - e.pos.z); if (de > R) continue;
    const tx = tp.x - c.x, tz = tp.z - c.z, dc = Math.hypot(tx, tz); if (dc < 6 || dc > dT + 3 || (tx * c.nx + tz * c.nz) / dc < 0.55) continue;
    const sc = de + dc * 0.35 + Math.random() * 3; if (sc < bs) { bs = sc; best = c; }
  }
  return best;
}
function killEnemy(e, headshot) {
  if (!e.alive) return; leaveCover(e); if (e.plan) for (const s of e.plan) if (s.c && s.c.by === e) s.c.by = null; if (e.tcov && e.tcov.by === e) e.tcov.by = null; e.tcov = null; if (D.tok[1] === e) D.tok[1] = null; if (D.tok[-1] === e) D.tok[-1] = null; e.alive = false; e.state = 'dying'; e.fall = 0; e.stance = 'down'; e.deadAt = GAME.t; STATS.kills++; if (headshot) STATS.heads++;
  // how he goes down: a head shot drops him like a sack, a running man staggers on and pitches forward, the rest fold, spin or are thrown back
  const run = e.rig.kind === 'run' || e.rig.kind === 'walk', r = Math.random();
  e.fallKind = headshot && r < 0.75 ? 'head' : run && r < 0.5 ? 'stumble' : pick(['knees', 'knees', 'back', 'spin', 'crumple', 'knees', 'back']);
  e.fallDir = e.fallKind === 'back' || e.fallKind === 'spin' ? 1 : e.fallKind === 'stumble' ? -1 : Math.random() < 0.5 ? 1 : -1; e.spinDir = Math.random() < 0.5 ? 1 : -1; e.dropped = false; corpseCap();
}
/* the dead stay where they fell for half a minute (updEnemy), and only so many of them: past that the oldest goes (a great wave leaves hundreds, and each one is drawn) */
function corpseCap() {
  const max = LITE ? 14 : 26; let n = 0, old = null;
  for (const e of UNITS.enemies) if (!e.alive && e.rig.root.visible && e.deadAt !== undefined) { n++; if (e.state === 'dead' && (!old || e.deadAt < old.deadAt)) old = e; }
  if (n > max && old) { old.rig.root.visible = false; if (old.tag) old.tag.visible = false; }
}
function killSeat(bt, i) { const s = bt.seats[i]; if (!s.alive) return; bt.intact = false; bt.setLod(false); s.alive = false; s.m.visible = false; STATS.kills++; fxDust(bt.seatWorld(i).add(V3(0, 0.3, 0)), true); }
const seeW = (ax, ay, az, bx, by, bz) => (FIELDM() ? los(ax, ay, az, bx, by, bz) && segHitT(ax, ay, az, bx, by, bz, 0.25) < 0 : losW(ax, ay, az, bx, by, bz)) && !smokeBlocks(ax, ay, az, bx, by, bz);
function targetsFor(e) {
  // a man firing wild (the hill at Purkan) knows exactly where the tank is and empties his magazine at it whatever the sightline
  if (e.wild && P.alive) return { player: true, p: P.mode === 'tank' && P.crouch ? tankTurretWorld().add(V3(0, 0.5, 0)) : playerEye() };
  const eye = e.eye(); let best = null, bd = 260;
  if (P.alive && !(P.mode === 'tank' && P.crouch)) { const pe = playerEye(); const d = eye.distanceTo(pe); const hid = P.mode === 'rifle' && FIELDM() && inConceal(P.pos.x, P.pos.z); if (hid && d > (P.crouch ? 16 : 45)) { /* hidden in the grass */ } else if (d * 0.55 < bd && (!FIELDM() || d < 200) && seeW(eye.x, eye.y, eye.z, pe.x, pe.y - 0.3, pe.z)) { bd = d * 0.55; best = { player: true, p: pe }; } }
  for (const f of FRIENDS) { if (f.state !== 'post' && f.state !== 'follow') continue; const c = f.unit.chest(); const d = eye.distanceTo(c); if (d < bd && seeW(eye.x, eye.y, eye.z, c.x, c.y + 0.25, c.z)) { bd = d; best = { f, p: c }; } }
  return best;
}
/* what each of them carries decides how he shoots: the sub-machine gun sprays long close bursts and is wild past sixty metres, the light
   machine gun hammers long bursts with tracer, the Dragunov fires single aimed rounds that reach far and hurt */
const WPN = { rifle: { burst: [2, 5], gap: 0.12, pause: [1.4, 2.8], acc: 1, dmg: 1, range: 320, snd: 'ak' }, smg: { burst: [5, 9], gap: 0.07, pause: [1.0, 2.0], acc: 0.65, dmg: 0.7, range: 110, snd: 'smg' }, lmg: { burst: [7, 13], gap: 0.085, pause: [1.8, 3.2], acc: 0.8, dmg: 1, range: 360, snd: 'lmg', tracer: 0.8 }, sniper: { burst: [1, 1], gap: 0, pause: [2.4, 3.8], acc: 2.4, dmg: 1.9, range: 520, snd: 'svd' }, rpg: { burst: [2, 4], gap: 0.13, pause: [1.6, 3.0], acc: 0.9, dmg: 1, range: 300, snd: 'ak' }, flame: { burst: [2, 4], gap: 0.13, pause: [1.6, 3.0], acc: 0.8, dmg: 1, range: 200, snd: 'ak' } };
const wpnOf = (e) => WPN[e.kind] || WPN.rifle, wBurst = (e) => { const b = wpnOf(e).burst; return Math.floor(rand(b[0], b[1] + 1) * (e.wild ? 1.7 : 1)); }, wGap = (e, k = 1) => wpnOf(e).gap * k, wPause = (e, k = 1) => { const p = wpnOf(e).pause; return rand(p[0], p[1]) * k * (e.wild ? 0.3 : 1); };
function enemyFire(e) {
  const mz = mzEase(), from = e.muzzle(); const tgt = e.target; if (!tgt) return; if (tgt.player) { e.shotT = GAME.t; if (MODE === 'suez') szFireAt(e, from); if (Math.hypot(e.pos.x - P.pos.x, e.pos.z - P.pos.z) < 150) SQF.spots.set(e, GAME.t), SQF.cT = GAME.t; } const W = wpnOf(e);
  const tp = tgt.player ? playerEye() : tgt.f.unit.chest(); const d = from.distanceTo(tp); const rangeF = clamp(1 - d / W.range, 0.25, 1) * (W.range < 200 && d > W.range * 0.6 ? 0.3 : 1);
  fxMuzzle(from, W.snd === 'lmg'); sndShot(W.snd, from);
  let hit = false; const eye = e.eye(); const wt = segHitT(eye.x, eye.y, eye.z, tp.x, tp.y, tp.z, FIELDM() ? 0.25 : 0.7);
  if (wt >= 0) { const wk = SEG_K, wp = V3(lerp(eye.x, tp.x, wt), lerp(eye.y, tp.y, wt), lerp(eye.z, tp.z, wt)); if (Math.random() < 0.5) fxTracer(from, wp, true); fxDust(wp); if (wk && camera.position.distanceTo(wp) < 60) { const dv = V3(tp.x - eye.x, tp.y - eye.y, tp.z - eye.z).normalize(); bulletHole(wp, colNormal(wk, wp, dv)); } e.scanCd = 0; return; }   /* the walls round the player are pocked by their fire too */
  if (tgt.player) { let p = W.acc * (FIELDM() ? (CH().hard || 0.7) : 1) * (SURV.on ? SURV.acc : 1) * diff.acc * rangeF * (d < 12 ? 2 : 1) * (P.mode === 'tank' ? 0.45 : 1) * (P.crouch ? 0.55 : 1) * (moving() ? 0.7 : 1) * (P.post ? 0.8 : 1) * (e.stance === 'crouch' ? 1.1 : 1) * (FIELDM() && P.mode === 'rifle' && inConceal(P.pos.x, P.pos.z) ? 0.45 : 1) * (e.wild ? 0.3 : 1) * (mz ? mz.acc * (SCENES[Math.max(0, D.scene)].acc || 1) : 1) * (e.wild ? 1 : tacAcc(e)); hit = Math.random() < p; if (hit && P.mode === 'tank' && P.crouch) { hit = false; fxDust(tp.clone().add(V3(rand(-0.6, 0.6), rand(-0.3, 0.3), rand(-0.6, 0.6)))); } if (hit) hurtPlayer(rand(diff.dmg[0], diff.dmg[1]) * W.dmg, from); else if (d < 60 && Math.random() < 0.35) sndWhiz(); }
  else { sqfSpot(e, tgt.f); hit = Math.random() < diff.accF * (1 - 0.6 * clamp(e.supp || 0, 0, 1)) * rangeF * (FIELDM() ? 0.45 : 1) * (tgt.f.duckT > 0 ? 0.25 : 1) * (tgt.f.unit.stance === 'crouch' ? 0.7 : 1) * (tgt.f.cov ? 0.55 : 1) * (mz ? mz.fHit : 1); if (hit) woundFriend(tgt.f, Math.random() < 0.18); else tgt.f.supp = (tgt.f.supp || 0) + 1; }
  const end = tp.clone(); if (!hit) end.add(V3(rand(-1.4, 1.4), rand(-0.4, 1.4), rand(-1.4, 1.4)));
  if (Math.random() < ((CH() && CH().tracers) || W.tracer || 0.5)) fxTracer(from, end, true);
  if (!hit && Math.random() < 0.4) fxDust(V3(end.x, groundAt(end.x, end.z) + 0.2, end.z));
}
/* ================= how the enemy fights (every chapter) =================
   Suppression: rounds that crack close past a man, blasts near him and his comrades' danger pin him - he ducks, stops showing himself and
   fires blind over his cover; it wears off in a few seconds. Fair aim: a man who has just caught sight of the player throws his first rounds
   wide and closes in the longer the player stays in his sight. Awareness: a man posted at a window or a parapet sees what is in front of him
   until he is alerted - by seeing the player, by fire near him, by a comrade - and every man remembers where he last saw the player: his
   grenades go there, and when he cannot see him he fires at that place to keep his head down. Squads (the men who share a tag): only so many
   leave cover at once while the rest fire to cover them; a player who stays in one place draws a flanker round
   his side; a squad that has lost most of its men falls back to cover further off. Nothing is said aloud - it shows in what they do */
const TAC = [   // by level: how easily fire pins them, how fast it wears off, how long their aim takes to close in, the time a player may stay put before he is flanked, the share of a squad that may move at once, the losses that break a squad
  { supp: 1.45, sDecay: 0.4, ramp: 3.6, flank: 30, mover: 0.3, fall: 0.45 },
  { supp: 1.1, sDecay: 0.34, ramp: 2.7, flank: 20, mover: 0.36, fall: 0.55 },
  { supp: 0.8, sDecay: 0.3, ramp: 1.8, flank: 13, mover: 0.45, fall: 0.68 },
];
const tacK = () => TAC[Math.max(0, DIFF.indexOf(diff))] || TAC[1];
const pinned = (e) => (e.supp || 0) > 0.55;
const sqKey = (e) => e.sq || e.sqAuto;   // his squad: the chapter's tag, or else the men who came in with him (spawned together, close by)
const SQ = {};   // the squads by tag: their men, how many they were, where they last saw the player, their last flank and smoke, broken
const PSTILL = { x: 0, z: 0, t: 0, at: -1 };   // how long the player has stayed within a few metres of one place
function tacReset() { for (const k in SQ) delete SQ[k]; PSTILL.t = 0; PSTILL.at = -1; }
function tacFrame() {   // once a frame: the player's stillness, and the smoke of the enemy's grenades outside the farm (which runs its own)
  if (PSTILL.at === GAME.t) return; const dt = PSTILL.at < 0 ? 0 : clamp(GAME.t - PSTILL.at, 0, 0.1); PSTILL.at = GAME.t;
  if (Math.hypot(P.pos.x - PSTILL.x, P.pos.z - PSTILL.z) > 4) { PSTILL.x = P.pos.x; PSTILL.z = P.pos.z; PSTILL.t = 0; } else PSTILL.t += dt;
  if (MODE !== 'farm' && SMOKES.length) { smokeUpd(dt); SMOKE_POOL.update(dt); }
}
function sqOf(e) {
  const key = sqKey(e); if (!key) return null; let s = SQ[key]; if (!s) s = SQ[key] = { men: new Set(), n0: 0, lkp: null, lkpT: -99, flankT: -99, smokeT: -99, broken: false };
  if (!s.men.has(e)) { s.men.add(e); } let n = 0; for (const m of s.men) if (m.alive && sqKey(m) === key) n++; s.n0 = Math.max(s.n0, n); return s;
}
function sqAlive(s, tag) { let n = 0; for (const m of s.men) if (m.alive && sqKey(m) === tag) n++; return n; }
/* a round from o that ended at p pins every enemy it cracked close past, or struck beside */
function suppressAlong(o, p, k = 1) {
  const dx = p.x - o.x, dy = p.y - o.y, dz = p.z - o.z, L2 = dx * dx + dy * dy + dz * dz || 1, g = tacK().supp * k;
  for (const e of UNITS.enemies) { if (!e.alive || e.state === 'film' || e.dormant) continue; const c = e.chest(), t = clamp(((c.x - o.x) * dx + (c.y - o.y) * dy + (c.z - o.z) * dz) / L2, 0, 1);
    const qx = o.x + dx * t - c.x, qy = o.y + dy * t - c.y, qz = o.z + dz * t - c.z, d = Math.sqrt(qx * qx + qy * qy + qz * qz); if (d < 2.2) { e.supp = Math.min(1.6, (e.supp || 0) + g * 0.42 * (1 - d / 2.2)); e.alert = true; } }
}
function supPin(e, a) { if (e && e.alive) { e.supp = Math.min(1.6, (e.supp || 0) + a * tacK().supp); e.alert = true; } }
/* what he can see of the player: a man still unalerted at his post sees in front of him (or right beside him) */
function tacSees(e) {
  if (e.alert || !e.slot || e.sz !== 'win') return true;
  const s = e.slot, tx = P.pos.x - e.pos.x, tz = P.pos.z - e.pos.z, d = Math.hypot(tx, tz) || 1; return d < 8 || (tx * s.nx + tz * s.nz) / d > 0.17;
}
/* per frame for every live man: suppression wearing off, how long he has had the player in sight, what he remembers, his squad */
function tacTick(e, dt) {
  tacFrame(); const K = tacK();
  if (e.supp > 0) e.supp = Math.max(0, e.supp - K.sDecay * dt);
  const sees = !!(e.target && e.target.player); e.seeT = sees ? (e.seeT || 0) + dt : Math.max(0, (e.seeT || 0) - dt * 2.5);
  const s = sqOf(e);
  if (sees) { e.alert = true; e.lkp = (e.lkp || V3()).copy(P.pos); e.lkpT = GAME.t; if (s) { s.lkp = (s.lkp || V3()).copy(P.pos); s.lkpT = GAME.t; } }
  else if (s && s.lkpT > (e.lkpT ?? -99) && GAME.t - s.lkpT < 6) { e.lkp = (e.lkp || V3()).copy(s.lkp); e.lkpT = s.lkpT; e.alert = true; }   // a comrade's warning: silent, but he knows
  if (s && !s.broken && s.n0 >= 3 && 1 - sqAlive(s, sqKey(e)) / s.n0 >= K.fall) s.broken = true;
}
const tacKnows = (e, sec = 6) => e.lkp && GAME.t - (e.lkpT ?? -99) < sec;
/* the accuracy of one round at the player: closing in with the time in sight, spoiled by suppression, wild when fired blind */
function tacAcc(e) { return clamp(0.12 + (e.seeT || 0) / tacK().ramp, 0.12, 1) * (1 - 0.75 * clamp(e.supp || 0, 0, 1)) * (e.blindK ?? 1); }
/* fire at where he believes the player is (blind over cover, or to keep a hidden player's head down): the round goes for the player, but at a
   fraction of the chance, and it stops at whatever is in the way */
function tacFireAt(e, k) {
  if (!P.alive) return; const keep = e.target; e.target = { player: true, p: playerEye() }; e.blindK = k; e.face(e.lkp ? e.lkp.x : P.pos.x, e.lkp ? e.lkp.z : P.pos.z); enemyFire(e); e.blindK = undefined; e.target = keep;
}
/* a squad lets a man leave his cover only while enough of the others stay behind theirs to fire */
function sqMoving(s, tag) { let n = 0; for (const m of s.men) if (m.alive && sqKey(m) === tag && m.cov && !m.inCov) n++; return n; }
function sqMayMove(e) {
  const s = sqOf(e); if (!s) return true; const key = sqKey(e), n = sqAlive(s, key); if (n <= 1) return true;
  if (sqMoving(s, key) >= Math.max(1, Math.round(n * tacK().mover))) return false;
  return true;
}
/* while one of them is out in the open the others fire to cover him */
function sqCovering(e) { const key = sqKey(e), s = key && SQ[key]; return !!(s && sqMoving(s, key) > 0); }
/* a new spot along the cover each time he shows himself, so he cannot be waited for with the sights on one place */
function tacPeekOff(e, c) {
  const r = Math.random(), o = r < 0.36 ? 0 : r < 0.68 ? 0.55 : -0.55; if (!o || c.px !== undefined || c.door) return 0;
  const x = c.x - c.nz * o, z = c.z + c.nx * o; return blocked(x, z, 0.3, e.pos.y) ? 0 : o;
}
/* a flanker: a player who stays put a while against a squad draws one of its men to a cover off to his side */
function szPickFlank(e, s) {
  if (!SZ.covers || !P.alive) return null; let cx = 0, cz = 0, n = 0; const key = sqKey(e); for (const m of s.men) if (m.alive && sqKey(m) === key) { cx += m.pos.x; cz += m.pos.z; n++; } if (!n) return null; cx /= n; cz /= n;
  const ax = cx - P.pos.x, az = cz - P.pos.z, al = Math.hypot(ax, az) || 1; let best = null, bs = 1e9;
  for (const c of SZ.covers) { if (c.floor !== undefined || (c.by && c.by !== e)) continue; const tx = c.x - P.pos.x, tz = c.z - P.pos.z, dc = Math.hypot(tx, tz); if (dc < 7 || dc > 30) continue;
    if ((tx * ax + tz * az) / (dc * al) > 0.55) continue; if (!szCovFaces(c, 0.4)) continue; const de = Math.hypot(c.x - e.pos.x, c.z - e.pos.z); if (de > 40) continue;
    const sc = de + dc * 0.4; if (sc < bs) { bs = sc; best = c; } }
  return best;
}
function moveAlong(e, dt, speed) {
  const w = e.path[e.pi]; if (!w) return true;
  const dx = w[0] - e.pos.x, dz = w[1] - e.pos.z, d = Math.hypot(dx, dz);
  if (d < 0.8) { e.pi++; return e.pi >= e.path.length; }
  const ny = groundAt(e.pos.x + dx / d, e.pos.z + dz / d); const slope = clamp((ny - e.pos.y), 0, 1.5);
  const sp = speed * clamp(1 - slope * 0.45, 0.4, 1); const st = Math.min(d, sp * dt);
  e.pos.x += dx / d * st; e.pos.z += dz / d * st; e.pos.y = groundAt(e.pos.x, e.pos.z); e.heading = Math.atan2(dx, dz);
  return false;
}
function insideGoal(e) {
  const r = Math.random();
  if (r < 0.8 && P.alive) return [P.pos.x + rand(-1.5, 1.5), P.pos.z + rand(-1.5, 1.5)];
  if (r < 0.92) { let best = null, bd = 1e9; for (const f of FRIENDS) { if (f.state !== 'post') continue; const d = f.unit.pos.distanceTo(e.pos); if (d < bd) { bd = d; best = f; } } if (best) return [best.post.stand[0] + rand(-1, 1), best.post.stand[1] + rand(-1, 1)]; }
  if (r < 0.85) return pick([[-4 + rand(-3, 3), -64 + rand(-3, 3)], [DOORS.cmd.x, DOORS.cmd.z], [DOORS.aid.x, DOORS.aid.z]]);
  const gp = pick(YARD_GOALS); return [gp[0] + rand(-4, 4), gp[1] + rand(-4, 4)];
}
const YARD_GOALS = [[-20, 0], [0, -22], [12, 12], [-12, 30], [-30, 12], [-4, -38], [20, -30], [-40, -30], [24, 36]];
/* a man who sees a grenade land near him runs from it - a few long strides away and down - unless he is at a window or in a trench bay he
   cannot leave; then he goes back to what he was doing */
function nadeDodge(e, dt) {
  if (e.dodgeT > 0) { e.dodgeT -= dt; e.anim += dt * 10; e.stance = 'stand'; const d = steer(e, e.dodgeX, e.dodgeZ, 5.6, dt); e.rig.pose(d > 0.6 ? 'run' : 'hide', e.anim); return true; }
  if (e.sz === 'win' || e.state === 'trench' || e.state === 'jump' || e.inside || !e.alive) return false;
  e.dodgeCd = (e.dodgeCd || 0) - dt; if (e.dodgeCd > 0) return false; e.dodgeCd = 0.25;
  for (const q of PROJ) { if (q.type !== 'gren' || q.owner !== 'player' || q.fuse < 0.6) continue; const dx = e.pos.x - q.m.position.x, dz = e.pos.z - q.m.position.z, d = Math.hypot(dx, dz);
    if (d < 6.5 && q.m.position.y - groundAt(q.m.position.x, q.m.position.z) < 1.5) { const k = (7.5 - d) / (d || 1); e.dodgeX = e.pos.x + dx * k + rand(-1, 1); e.dodgeZ = e.pos.z + dz * k + rand(-1, 1); e.dodgeT = Math.min(q.fuse + 0.4, 1.6); e.peek = false; return true; } }
  return false;
}
/* the lie of the ground under a falling man: where his head will come down (behind him on his back, ahead on his face) against his feet */
function fallSlope(u, dir = u.fallDir || 1) {
  const L = 1.45, hx = u.pos.x - Math.sin(u.heading) * L * dir, hz = u.pos.z - Math.cos(u.heading) * L * dir;
  if (blocked(hx, hz, 0.2, u.pos.y)) return 0; const dy = hAt(hx, hz, u.pos.y) - u.pos.y; if (Math.abs(dy) > 0.9) return 0;
  return clamp(Math.asin(clamp(dy / L, -1, 1)), -0.5, 0.5);
}
function updEnemy(e, dt) {
  e.t += dt;
  if (e.state === 'dying') {
    e.fall += dt; const FV = FALLS[e.fallKind] || FALLS.knees;
    if (FV.spin && e.fall < 0.5) e.heading += dt * 5.5 * (e.spinDir || 1);
    if (FV.walk && e.fall < 0.45) { const sp = 3.4 * (1 - e.fall / 0.45), nx = e.pos.x + Math.sin(e.heading) * sp * dt, nz = e.pos.z + Math.cos(e.heading) * sp * dt; if (!blocked(nx, nz, 0.3, e.pos.y)) { e.pos.x = nx; e.pos.z = nz; e.pos.y = hAt(nx, nz, e.pos.y); } }
    if (e.fall >= FV.drop && !e.dropped) { e.dropped = true; dropGun(e); }
    if (e.fallSlope === undefined || e.fall < 0.5) e.fallSlope = fallSlope(e);
    e.rig.fallPose(e.fall, e.fallDir, e.fallKind, e.fallSlope); e.sync(); if (e.fall > FV.dur + 0.4) e.state = 'dead'; return;   /* (a moment longer: the body eases fully onto the ground) */
  }
  if (e.state === 'dead') { if (e.deadAt !== undefined && GAME.t - e.deadAt > 30) { e.rig.root.visible = false; if (e.tag) e.tag.visible = false; } return; }   /* a body is cleared away half a minute after he fell */
  if (e.state === 'film') { e.sync(); return; }
  if (nadeDodge(e, dt)) { e.sync(); return; }
  e.inside = inPoly(e.pos.x, e.pos.z, YARD);
  tacTick(e, dt);
  e.scanCd -= dt; if (e.scanCd <= 0) { e.scanCd = rand(0.5, 0.9); const was = !!(e.target && e.target.player); e.target = targetsFor(e); if (e.target && e.target.player && !tacSees(e)) e.target = null; if (!was && e.target && e.target.player) e.fireCd = Math.max(e.fireCd, diff.react * rand(0.8, 1.2) * (mzEase() ? mzEase().react : 1)); }   /* a man who has just seen the player needs a moment before he fires: longer on the easy level */
  const g = e.group;
  if (e.state === 'jump') {
    // over the gunwale and down onto the sand: the vault's own movement, at a pace a man can jump (not a flight)
    if (!e.jd) e.jd = clamp(Math.hypot(e.j1.x - e.j0.x, e.j1.z - e.j0.z) / 4.2, 0.8, 1.6);
    const u = clamp(e.t / e.jd, 0, 1), h = u * u * (3 - 2 * u); e.pos.lerpVectors(e.j0, e.j1, h); e.pos.y += Math.sin(u * Math.PI) * 0.7; e.face(e.j1.x + 1, e.j1.z);
    e.rig.pose('vault', u); e.sync(); if (u >= 1) { e.state = e.plan ? 'plan' : 'move'; e.t = 0; e.jd = 0; } return;
  }
  if (e.state === 'retreat') { e.anim += dt * 10; if (moveAlong(e, dt, 5)) { e.alive = false; e.rig.root.visible = false; } e.rig.pose('run', e.anim); e.sync(); return; }
  // specials
  if (e.kind === 'rpg' && e.target && e.rpgCd <= 0 && (e.state === 'hold' || e.state === 'engage' || e.state === 'move')) {
    const tp = e.target.p; const d = e.pos.distanceTo(tp);
    if (d > 25 && d < 230) { e.rpgCd = rand(13, 20); const from = e.muzzle(); fireRocket(from, tp.clone().add(V3(rand(-1.5, 1.5), rand(-0.5, 0.8), rand(-1.5, 1.5))), 'e'); fxMuzzle(from, true); sndShot('ak', from); sndBoom(from, 0.25); e.state = 'engage'; e.engageT = 1.5; e.stance = 'crouch'; }
  }
  e.rpgCd -= dt; e.gCd -= dt; e.coverCd = (e.coverCd || 0) - dt;
  if ((e.state === 'inside' || (e.state === 'move' && e.charge)) && e.target && e.coverCd <= 0 && e.kind !== 'flame') {
    e.coverCd = rand(1.2, 2.4); const tp = e.target.p, dT = Math.hypot(tp.x - e.pos.x, tp.z - e.pos.z);
    if (dT > 9 && dT < 70) { const c = findCover(e, tp, 15); if (c) takeCover(e, c); }
  }
  if (e.kind === 'flame' && e.target) {
    const d = e.pos.distanceTo(e.target.p);
    if (d < 17) { e.flameT = 2.5; }
    if (Math.hypot(e.pos.x - 12, e.pos.z - 104) < 22 && !DRUMFIRE.on) { DRUMFIRE.on = true; DRUMFIRE.t = 0; toast('חביות הדלק עולות באש', 'להביורים בשער הדרומי'); }
  }
  if (e.flameT > 0) {
    e.flameT -= dt; const tp = e.target ? e.target.p : null; if (tp) e.face(tp.x, tp.z);
    const dirx = Math.sin(e.heading), dirz = Math.cos(e.heading); const from = e.muzzle();
    if (Math.random() < dt * 30) { const q = FX.fire.get(); q.life = 0.7; const sp = rand(10, 16); const px = from.x, py = from.y, pz = from.z; q.s.position.set(px, py, pz); q.upd = (q, uu, dt2) => { q.s.position.x += dirx * sp * dt2; q.s.position.z += dirz * sp * dt2; q.s.position.y += 1.2 * dt2; q.s.scale.setScalar(0.8 + uu * 4); q.s.material.opacity = 1 - uu; }; }
    const pe = playerEye(); const vx = pe.x - from.x, vz = pe.z - from.z, dd = Math.hypot(vx, vz);
    if (dd < 16 && (vx * dirx + vz * dirz) / dd > 0.93) hurtPlayer(55 * dt, from, true);
    for (const f of FRIENDS) if (f.state === 'post') { const c = f.unit.pos; const fx = c.x - from.x, fz = c.z - from.z, fd = Math.hypot(fx, fz); if (fd < 15 && (fx * dirx + fz * dirz) / fd > 0.9 && Math.random() < dt * 1.5) woundFriend(f); }
    LIGHTS.fire.position.set(from.x + dirx * 5, from.y, from.z + dirz * 5); if (!DRUMFIRE.on) LIGHTS.fire.intensity = 30000;
    e.rig.pose('aim', e.anim, 0); e.sync(); return;
  }
  if (e.target && e.gCd <= 0 && GAME.gCd <= 0 && e.state !== 'trench' && e.state !== 'plan' && e.sz !== 'win' && P.mode !== 'tank') {
    const tp = e.target.p; const d = Math.hypot(tp.x - e.pos.x, tp.z - e.pos.z);
    const mz = mzEase(), skip = mz && Math.random() >= mz.gren;   /* the stronghold's easing: fewer grenades (none on the easy level) */
    if (skip) e.gCd = rand(22, 35);
    else if (d > 7 && d < 26 && (Math.random() < 0.5 || e.state === 'hold' || e.state === 'cover')) {
      e.gCd = diff.gren > 0 ? rand(22, 35) / diff.gren : 1e9; GAME.gCd = rand(2.5, 5); const T = d / 13; const from = e.eye().add(V3(0, 0.4, 0)); const dy = tp.y - 1 - from.y;
      throwGrenade(from, V3((tp.x - from.x) / T + rand(-1, 1), (dy + 0.5 * 9.8 * T * T) / T, (tp.z - from.z) / T + rand(-1, 1)), 'e'); e.throwT = 0.5;
    }
  }
  if (e.throwT > 0) { e.throwT -= dt; if (e.target) e.face(e.target.p.x, e.target.p.z); e.rig.pose('throw', 1 - e.throwT / 0.5); e.sync(); return; }
  const shoot = () => { if (!e.target) return; e.face(e.target.p.x, e.target.p.z); e.fireCd -= dt; if (e.fireCd <= 0) { if (e.burst <= 0) e.burst = wBurst(e); e.burst--; e.fireCd = e.burst > 0 ? wGap(e) : wPause(e); enemyFire(e); } };
  const aimPitch = () => e.target ? Math.atan2(e.target.p.y - e.eye().y, Math.hypot(e.target.p.x - e.pos.x, e.target.p.z - e.pos.z)) : 0;
  if (e.state === 'sz') { suezEnemyStep(e, dt, shoot, aimPitch); e.sync(); return; }
  if (e.state === 'plan') { planStep(e, dt, shoot, aimPitch); e.sync(); return; }
  if (e.state === 'trench') { trenchStep(e, dt, shoot, aimPitch); e.sync(); return; }
  if (e.state === 'move') {
    e.stopCd -= dt;
    if (e.charge && e.target && Math.random() < dt * 0.7) { e.face(e.target.p.x, e.target.p.z); enemyFire(e); }
    if (e.charge && P.alive && Math.hypot(P.pos.x - e.pos.x, P.pos.z - e.pos.z) < 22) { e.state = 'inside'; e.goalCd = 0; e.next = null; }
    if (e.target && e.stopCd <= 0 && e.kind !== 'flame') { e.stopCd = rand(3, 6); if (Math.random() < (e.charge ? 0.2 : 0.6)) { e.state = 'engage'; e.engageT = rand(1.3, 2.8); e.stance = Math.random() < 0.6 ? 'crouch' : 'stand'; } }
    e.anim += dt * 9.5; e.stance = 'stand';
    const done = moveAlong(e, dt, e.speed * (e.kind === 'flame' ? 0.9 : 1));
    e.rig.pose('run', e.anim);
    if (done) {
      if (e.hold >= 0 && g && !g.go) { e.state = 'hold'; g.arrived = (g.arrived || 0) + 1; if (!g.goAt) g.goAt = GAME.t + rand(2.5, 4.5); }
      else if (e.next) { e.path = e.next; e.next = null; e.pi = 0; e.hold = -1; }
      else { e.state = 'inside'; e.goalCd = 0; }
    }
  } else if (e.state === 'hold') {
    e.stance = 'crouch'; if (g && g.go) { e.state = 'move'; e.path = e.next || e.path; e.next = null; e.pi = 0; e.hold = -1; e.speed = rand(5.2, 6.1); e.charge = true; }
    if (e.target && Math.random() < dt * 0.35) { e.state = 'engage'; e.engageT = rand(1, 2); e.stance = 'stand'; e.backTo = 'hold'; }
    e.rig.pose('crouch', e.anim, aimPitch()); if (e.target) e.face(e.target.p.x, e.target.p.z);
  } else if (e.state === 'engage') {
    e.engageT -= dt; shoot(); if (aimedAt(e)) { e.stance = 'crouch'; e.sideT = (e.sideT ?? rand(0.6, 1.4)) - dt; if (e.sideT <= 0) { e.sideT = rand(0.8, 1.6); e.sideD = Math.random() < 0.5 ? -1 : 1; } if (e.sideD) { const h = e.heading + Math.PI / 2 * e.sideD; steer(e, e.pos.x + Math.sin(h), e.pos.z + Math.cos(h), 1.4, dt); if (e.target) e.face(e.target.p.x, e.target.p.z); } }   // in the open, aimed at: down to a knee, a step aside
    e.rig.pose(e.stance === 'crouch' ? 'crouch' : 'aim', e.anim, aimPitch());
    if (e.engageT <= 0) { e.state = e.backTo || 'move'; e.backTo = null; }
  } else if (e.state === 'toCover') {
    const c = e.cover; e.toCoverT += dt;
    if (!c || e.toCoverT > 8) { leaveCover(e); e.state = 'inside'; e.goalCd = 0; }
    else { e.anim += dt * 10; e.stance = 'stand'; const d = steer(e, c.x, c.z, 5.4, dt); e.rig.pose('run', e.anim); if (d < 0.5) { e.state = 'cover'; e.coverT = rand(5, 9); e.cyc = rand(0.7, 1.4); e.peek = false; e.cside = Math.random() < 0.5 ? 1 : -1; } }
  } else if (e.state === 'cover') {
    const c = e.cover; e.coverT -= dt; e.cyc -= dt;
    const tp = e.target ? e.target.p : P.alive ? playerEye() : null; if (tp) e.face(tp.x, tp.z);
    if (!c) { e.state = 'inside'; e.goalCd = 0; }
    else {
      if (tp) { const tx = tp.x - c.x, tz = tp.z - c.z, dc = Math.hypot(tx, tz) || 1; if ((tx * c.nx + tz * c.nz) / dc < 0.15 || dc < 4.5) { leaveCover(e); e.state = 'inside'; e.goalCd = 0; e.coverCd = rand(2, 4); } }
      if (e.state === 'cover') {
        if (e.cyc <= 0) { e.peek = !e.peek; e.cyc = e.peek ? rand(0.9, 1.8) : rand(1.0, 2.3); if (e.peek) e.scanCd = 0; }
        const tall = c.h > 1.5, px = -c.nz * (e.cside || 1), pz = c.nx * (e.cside || 1);
        if (e.peek) { e.stance = tall ? 'stand' : 'crouch'; if (tall) steer(e, c.x + px * 1.4, c.z + pz * 1.4, 3, dt); if (tp) e.face(tp.x, tp.z); shoot(); e.rig.pose(tall ? 'aim' : 'crouch', e.anim, aimPitch()); }
        else { e.stance = 'hide'; steer(e, c.x, c.z, 3, dt); if (tp) e.face(tp.x, tp.z); e.rig.pose('hide', e.anim); }
        if (e.coverT <= 0) {
          const dP = Math.hypot(P.pos.x - e.pos.x, P.pos.z - e.pos.z); const nc = P.alive ? findCover(e, P.pos, 16) : null;
          if (nc && nc !== c && Math.hypot(nc.x - P.pos.x, nc.z - P.pos.z) < dP - 3) takeCover(e, nc); else { leaveCover(e); e.state = 'inside'; e.goalCd = 0; e.coverCd = rand(3, 5); }
        }
      }
    }
  } else if (e.state === 'inside') {
    e.goalCd -= dt;
    if (e.goalCd <= 0 || !e.path || e.pi >= e.path.length) { e.path = [insideGoal(e)]; e.pi = 0; e.goalCd = rand(1.4, 2.8); }
    for (const f of FRIENDS) if (f.state === 'post' && f.unit.pos.distanceTo(e.pos) < 2.4 && Math.random() < dt * 1.2) woundFriend(f, Math.random() < 0.5);
    const pd = Math.hypot(P.pos.x - e.pos.x, P.pos.z - e.pos.z), seesP = e.target && e.target.player;
    if (seesP && pd < 3.2 && Math.random() < dt * 2.5) { e.face(P.pos.x, P.pos.z); enemyFire(e); enemyFire(e); }
    if (e.target && Math.random() < dt * (seesP && pd < 30 ? 1.5 : 0.8)) { e.state = 'engage'; e.engageT = seesP ? rand(0.5, 1.1) : rand(1.2, 2.2); e.stance = Math.random() < 0.4 ? 'crouch' : 'stand'; e.backTo = 'inside'; }
    else { e.anim += dt * 9.5; e.stance = 'stand'; const w = e.path[e.pi]; if (w && steer(e, w[0], w[1], pd < 12 ? 3.8 : 5.0, dt) < 1.2) e.pi++; e.rig.pose('run', e.anim); }
  }
  e.sync();
}

/* ================= scripted assault: shore → cover → under the crest → into the trench → hunt the player ================= */
function scEntries() { const S = SCENES[Math.max(0, D.scene)]; return S.entries || [-14, 3]; }
function westPlan(e, z, i, r = Math.random) {
  const RR = (a, b) => a + r() * (b - a);
  const ents = scEntries().map((ez) => [ez, Math.abs(ez - z)]).sort((a, b) => a[1] - b[1]);
  const ez = (ents[i % 2] || ents[0])[0] + RR(-1.5, 1.5);
  const k = clamp(kz(ez), 1, TR.pts.length - 2), p = TR.pts[k], o = TR.out[k], plan = [];
  if (r() < 0.75) {
    let best = null, bd = 1e9; const zm = (z + ez) / 2, sx = tongueWestX(z) + 2;
    for (const c of COVER) { if (c.by || c.nx < 0.5 || c.x > crestX(c.z) - 1.5 || c.x < tongueWestX(c.z) + 1 || Math.abs(c.z - zm) > 7) continue; const d = Math.hypot(c.x - sx, c.z - zm) + r() * 3; if (d < bd) { bd = d; best = c; } }
    if (best) { best.by = e; plan.push({ t: 'cover', c: best, x: best.x, z: best.z, nx: best.nx, nz: best.nz, h: best.h, dur: RR(1.6, 3) }); }
  }
  const zc = ez + RR(-1.2, 1.2), cx = crestX(zc);
  plan.push({ t: 'cover', x: cx - 3.3, z: zc, px: cx - 1.4, pz: zc + RR(-0.6, 0.6), nx: 1, nz: 0, h: 1, dur: RR(2.6, 4.4) });
  plan.push({ t: 'run', final: true, x: p[0] + o[0] * 2.6, z: p[1] + o[1] * 2.6 });
  plan.push({ t: 'vault', x: p[0], z: p[1] });
  return plan;
}
/* where a man's way from (x0, z0) to (x1, z1) crosses the wire round the stronghold: the points a stride either side of it, or null */
function wireCross(x0, z0, x1, z1) {
  const L = Math.hypot(x1 - x0, z1 - z0) || 1, dx = (x1 - x0) / L, dz = (z1 - z0) / L; let best = null, bd = 2.5;
  for (const [wx, wz] of WIRE_PTS) { const t = (wx - x0) * dx + (wz - z0) * dz; if (t < 2 || t > L - 2) continue; const d = Math.abs((wx - x0) * dz - (wz - z0) * dx); if (d < bd) { bd = d; best = t; } }
  if (best === null) return null; const px = x0 + dx * best, pz = z0 + dz * best; return [[px - dx * 1.7, pz - dz * 1.7], [px + dx * 1.7, pz + dz * 1.7]];
}
/* the way in out of the scrub (north or south): up their own sap at a crouching run, hidden in it and in the bushes, to its end under our
   parapet - and from there over it into the trench. They come up some fifteen metres from the stronghold, never over open ground */
function sapPlan(e, sap, j) {
  const r = rng(5150 + j * 37), plan = [];
  for (let i = 1; i < sap.length - 1; i++) plan.push({ t: 'run', crun: true, near: 0.8, x: sap[i][0] + (r() - 0.5) * 0.4, z: sap[i][1] + (r() - 0.5) * 0.4 });
  const end = sap[sap.length - 1], k = clamp(trK(end[0], end[1])[0], 1, TR.pts.length - 2), p = TR.pts[k];
  plan.push({ t: 'run', crun: true, final: true, x: end[0], z: end[1] });
  plan.push({ t: 'vault', x: p[0], z: p[1] });
  return plan;
}
function northPlan(e, i) { return sapPlan(e, SAPS.n[i % 2], i); }
/* men already ashore before the player gets there: each waits in his place on the sand (the cover he ran to, or where he jumped down) until
   'until', firing from it, and only then goes for the rampart */
function holdPlan(e, until) {
  const s0 = e.plan && e.plan[0], dur = Math.max(1, until - GAME.t);
  if (s0 && s0.t === 'cover' && s0.c) { s0.dur = dur; return; }
  e.plan.unshift({ t: 'cover', x: e.pos.x + 1.2, z: e.pos.z + rand(-1, 1), nx: 1, nz: 0, h: 0.7, dur });
}
/* the Egyptians read the player: they duck when a rifle is on them and move when he reloads or looks away */
const _aimV = V3(), _aimF = V3();
function aimedAt(e) {
  if (!P.alive || P.mode === 'carry') return false;
  const v = _aimV.subVectors(e.chest(), camera.position), d = v.length(); if (d > 55) return false;
  return v.dot(camForward(_aimF)) / d > (d < 6 ? 0.86 : d < 15 ? 0.95 : 0.975);
}
function playerBusy() { return P.reloadT > 0 || P.throwT > 0 || P.mode === 'carry' || P.hold > 0 || (P.mode === 'mag' && P.post && P.post.mag.reload > 0); }
function lobGrenade(e, tp) {
  { const mz = mzEase(); if (mz && Math.random() >= mz.gren) { e.gCd = rand(13, 21); GAME.gCd = rand(2, 4); return; } }   /* the stronghold's easing: this one is not thrown */
  const from = e.eye().add(V3(0, 0.45, 0)), d = Math.hypot(tp.x - from.x, tp.z - from.z), T = clamp(d / 11, 0.7, 1.8), dy = tp.y - 0.9 - from.y;
  throwGrenade(from, V3((tp.x - from.x) / T + rand(-0.7, 0.7), (dy + 0.5 * 9.8 * T * T) / T, (tp.z - from.z) / T + rand(-0.7, 0.7)), 'e');
  e.face(tp.x, tp.z); e.throwT = 0.5; e.gCd = rand(13, 21); GAME.gCd = rand(3.5, 6);
}
function coverCycle(e, dt, c, shoot, aimPitch) {
  e.coverT -= dt; e.cyc -= dt;
  const aimed = aimedAt(e), pin = pinned(e), covering = !pin && sqCovering(e);
  if (pin && e.peek) { e.peek = false; e.cyc = Math.max(e.cyc, rand(0.5, 1.0)); }   // pinned: down behind the cover at once
  if (e.peek && aimed) { e.aimT = (e.aimT || 0) + dt; if (e.aimT > 0.35) e.cyc = Math.min(e.cyc, 0); } else e.aimT = 0;
  if (e.cyc <= 0) {
    e.peek = !e.peek; if (e.peek && (pin || (aimed && Math.random() < 0.7))) e.peek = false;
    e.cyc = e.peek ? rand(0.7, 2.0) + (covering ? 0.8 : 0) : covering ? rand(0.3, 0.7) : rand(0.8, 2.4) + (aimed ? 0.7 : 0);
    if (e.peek) { e.scanCd = 0; e.burst = 0; e.fireCd = rand(0.25, 0.5); e.peekOff = tacPeekOff(e, c); e.peekN = (e.peekN || 0) + 1; e.peekLow = Math.random() < 0.4;
      if (e.peekN >= 3 + Math.floor(Math.random() * 3)) { e.peekN = 0; e.peek = false; e.cyc = rand(2.0, 3.2); e.reloading = true; } else e.reloading = false; }   // the magazine: changed down behind the cover, and that is the moment to move on him
  }
  const tp = e.target ? e.target.p : null;
  if (e.peek) {
    const hasP = c.px !== undefined, tall = (hasP || c.h > 1.5) && !(e.peekLow && !hasP), o = (e.peekOff || 0) * (e.peekLow ? 1.25 : 1); e.stance = tall ? 'stand' : 'crouch';   // on tall cover sometimes from a knee at its corner
    steer(e, hasP ? c.px : c.x - c.nz * o, hasP ? c.pz : c.z + c.nx * o, 3.4, dt); if (tp) e.face(tp.x, tp.z); else if (tacKnows(e)) e.face(e.lkp.x, e.lkp.z); else e.heading = Math.atan2(c.nx, c.nz);
    if (tp) shoot(); else if (covering && tacKnows(e, 5)) { e.fireCd -= dt; if (e.fireCd <= 0) { e.fireCd = rand(0.25, 0.6); tacFireAt(e, 0.2); } }   // he cannot see the player, but fires at where he was to cover a comrade on the move
    e.rig.pose(tall ? 'aim' : 'crouch', e.anim, aimPitch());
  } else {
    if (c.door) { e.stance = 'stand'; steer(e, c.x, c.z, 3.4, dt); e.heading = Math.atan2(c.px - c.x, c.pz - c.z); e.rig.pose('idle', e.anim); }   /* flat against the wall beside the doorway, rifle up, waiting */
    else { e.stance = 'hide'; steer(e, c.x, c.z, 3.4, dt); e.heading = Math.atan2(c.nx, c.nz); e.rig.pose('hide', e.anim); }
    // pinned, he holds his rifle up over the cover and fires blind at where the player was
    if (pin && tacKnows(e, 4)) { e.blindCd = (e.blindCd ?? rand(0.6, 1.4)) - dt; if (e.blindCd <= 0) { e.blindCd = rand(0.15, 0.3); e.blindN = (e.blindN || 0) + 1; tacFireAt(e, 0.12); if (e.blindN >= Math.floor(rand(3, 6))) { e.blindN = 0; e.blindCd = rand(1.4, 2.8); } } }
    // his grenade goes to where he last saw the player, not to where the player really is
    const lk = tacKnows(e) ? e.lkp : null, dP = lk ? Math.hypot(lk.x - e.pos.x, lk.z - e.pos.z) : 99;
    if (P.alive && lk && e.kind !== 'rpg' && e.gCd <= 0 && GAME.gCd <= 0 && dP > 5 && dP < 19 && e.cyc > 0.6) lobGrenade(e, V3(lk.x + rand(-1.2, 1.2), lk.y, lk.z + rand(-1.2, 1.2)));
  }
  return e.coverT <= 0;
}
/* every man sees all round him: once the player is within this radius and in his sight - in front, beside or behind - he stops whatever
   he was running to do, drops to a knee, turns and fires a burst, then goes on. A short pause before he can do it again */
const awareR = () => diff.aware ?? 24;   // how far round him a man notices the player: wider on the hard level
function awareReact(e, dt, shoot, aimPitch) {
  if (e.reactT > 0) { e.reactT -= dt; e.stance = 'crouch'; e.anim += dt; shoot(); e.rig.pose('crouch', e.anim, aimPitch()); return true; }
  e.reactCd = (e.reactCd ?? rand(0, 2)) - dt;
  if (e.reactCd > 0 || !e.target || !e.target.player || !P.alive || CINE.on) return false;
  if (Math.hypot(P.pos.x - e.pos.x, P.pos.z - e.pos.z) > awareR()) return false;
  e.reactT = rand(1.1, 1.9); e.reactCd = rand(5, 8); e.fireCd = Math.min(e.fireCd, rand(0.15, 0.4)); e.burst = 0; e.face(P.pos.x, P.pos.z); return true;
}
function planStep(e, dt, shoot, aimPitch) {
  const s = e.plan[e.ps]; if (!s) { enterTrench(e); return; }
  s.tt = (s.tt || 0) + dt;
  if (s.t === 'run' || (s.t === 'cover' && !s.go)) {
    if (s.final && s.tt < 4 && aimedAt(e)) { e.stance = 'hide'; e.rig.pose('hide', e.anim); return; }
    if (awareReact(e, dt, shoot, aimPitch)) return;
    e.anim += dt * (s.crun ? 8.5 : 9.5); e.stance = s.crun ? 'crouch' : 'stand'; const d = steer(e, s.x, s.z, s.crun ? Math.min(e.speed, 3.7) : e.speed, dt); e.rig.pose(s.crun ? 'crun' : 'run', e.anim);   /* in the sap: bent low */
    if (s.t === 'run') { const nx = e.plan[e.ps + 1]; if (s.final && nx && d < 2.5 && s.tt < 9 && crowdedAt(nx.x, nx.z, 1.6, e)) { e.stance = 'crouch'; e.rig.pose('crouch', e.anim, 0); return; }
      if (d < (s.final ? 1.7 : s.near || 0.6) || (s.final ? s.tt > 6 && d < 3.2 : s.tt > 14)) e.ps++;   /* the last steps to the parapet end in the vault - but only from beside it, never a leap from afar */
      else if (s.final && s.tt > 10) { const k = clamp(trK(e.pos.x, e.pos.z)[0], 1, TR.pts.length - 2), p = TR.pts[k], o = TR.out[k]; s.x = p[0] + o[0] * 2.6; s.z = p[1] + o[1] * 2.6; s.tt = 5; if (nx && nx.t === 'vault') { nx.x = p[0]; nx.z = p[1]; } } }   /* held up on the way to his place: the nearest stretch of parapet instead */
    else if (d < 1.0 || s.tt > 7) { s.go = true; e.coverT = s.dur; e.cyc = rand(0.4, 0.9); e.peek = false; }
  } else if (s.t === 'cover') {
    if (coverCycle(e, dt, s, shoot, aimPitch)) { if (s.c && s.c.by === e) s.c.by = null; e.ps++; }
  } else if (s.t === 'vault' || s.t === 'hurdle') {
    // over the parapet into the trench (vault) or over the wire fence (hurdle): one smooth arc, its height the obstacle's, with the vault's own movement
    if (!s.a) { s.a = e.pos.clone(); s.b = V3(s.x, groundAt(s.x, s.z), s.z); s.tt = 0; e.face(s.x, s.z); let top = Math.max(s.a.y, s.b.y); for (let i = 1; i < 6; i++) top = Math.max(top, groundAt(lerp(s.a.x, s.b.x, i / 6), lerp(s.a.z, s.b.z, i / 6)));
      s.top = top + (s.t === 'hurdle' ? 0.75 : 0.62); s.dur = clamp(Math.hypot(s.b.x - s.a.x, s.b.z - s.a.z) / 2.7, 0.8, 1.3); }
    const u = clamp(s.tt / s.dur, 0, 1), h = u * u * (3 - 2 * u), cy = 2 * s.top - (s.a.y + s.b.y) / 2; e.pos.x = lerp(s.a.x, s.b.x, h); e.pos.z = lerp(s.a.z, s.b.z, h); e.pos.y = (1 - u) * (1 - u) * s.a.y + 2 * (1 - u) * u * cy + u * u * s.b.y;
    e.stance = 'stand'; e.rig.pose('vault', u);
    if (u >= 1) { e.ps++; if (!e.plan[e.ps]) enterTrench(e); }
  }
}
function enterTrench(e) {
  Object.assign(e, { state: 'trench', slide: null, plan: null, k: trK(e.pos.x, e.pos.z)[0], stX: e.pos.x, stZ: e.pos.z, stT: 0, tcov: null, tcovCd: 0, inCov: false, usedTrav: new Set(), meleeCd: 0.5, fireCd: rand(0.3, 0.9), burst: 0, speed: rand(4.4, 5.0), patience: 0, rush: false, moving: false, cside: Math.random() < 0.5 ? 1 : -1, sideT: 0, gCd: rand(4, 9) });
  if (GAME.t - (D.trenchMsg || -99) > 25) { D.trenchMsg = GAME.t; radio(pick(['יוסי', 'דודו', 'רפי']), pick(['הם בתעלה! הם בתעלה!', 'מצרים קפצו לתעלה! תשמרו על הגב!', 'יש להם רגל בתעלה! לחסל אותם!']), 3.2); }
}
function initLanes() {
  TR.lane = TR.pts.map(() => null);
  TR.travK = [];
  for (const c of TRAV) { const kc = c.k + c.dir, l = [c.lx, c.lz]; if (!TR.travK.includes(kc)) TR.travK.push(kc); for (let i = kc - 1; i <= kc + 1; i++) if (i >= 0 && i < TR.pts.length) TR.lane[i] = l; }
}
function lanePt(i) { const p = TR.pts[i], l = TR.lane && TR.lane[i]; return l ? [p[0] + l[0], p[1] + l[1]] : p; }
function trNear(k, x, z) { let b = k, bd = 1e9; for (let i = Math.max(0, k - 4); i <= Math.min(TR.pts.length - 1, k + 4); i++) { const d = Math.hypot(TR.pts[i][0] - x, TR.pts[i][1] - z); if (d < bd) { bd = d; b = i; } } return b; }
function separate(e) {
  const k = clamp(e.k || 0, 1, TR.pts.length - 2), tx0 = TR.pts[k + 1][0] - TR.pts[k - 1][0], tz0 = TR.pts[k + 1][1] - TR.pts[k - 1][1], tl = Math.hypot(tx0, tz0) || 1, tx = tx0 / tl, tz = tz0 / tl;
  for (const o of UNITS.enemies) {
    if (o === e || !o.alive || (o.state !== 'trench' && o.state !== 'plan')) continue; let dx = e.pos.x - o.pos.x, dz = e.pos.z - o.pos.z, d = Math.hypot(dx, dz);
    if (d >= 1.0) continue;
    if (d < 0.02) { const sg = UNITS.enemies.indexOf(e) % 2 ? 1 : -1; dx = tx * sg; dz = tz * sg; d = 1; }   // two men on one spot: the trench decides who steps which way
    const push = (1.0 - d) * 0.5; let nx = e.pos.x + dx / d * push, nz = e.pos.z + dz / d * push;
    if (blocked(nx, nz, 0.3, e.pos.y)) { const sg = (dx * tx + dz * tz) >= 0 ? 1 : -1; nx = e.pos.x + tx * sg * push; nz = e.pos.z + tz * sg * push; if (blocked(nx, nz, 0.3, e.pos.y)) continue; }   // the wall is in the way: step along the trench instead
    e.pos.x = nx; e.pos.z = nz; e.pos.y = groundAt(nx, nz);
  }
}
const crowdedAt = (x, z, r = 1.3, not = null) => UNITS.enemies.some((o) => o !== not && o.alive && (o.state === 'trench' || o.state === 'plan') && Math.hypot(o.pos.x - x, o.pos.z - z) < r);
function releaseCov(e) { if (e.tcov && e.tcov.by === e) e.tcov.by = null; e.tcov = null; e.inCov = false; if (D.tok[1] === e) D.tok[1] = null; if (D.tok[-1] === e) D.tok[-1] = null; }
function tokFree(dir, e) { const t = D.tok[dir]; return !t || t === e || !t.alive || t.state !== 'trench' || !t.moving; }
function sideStep(e, dt, speed) { e.sideT -= dt; if (e.sideT <= 0) { e.cside = -(e.cside || 1); e.sideT = rand(0.8, 1.6); } const p = TR.pts[e.k], n = TR.n[e.k]; steer(e, p[0] + n[0] * e.cside * 0.55, p[1] + n[1] * e.cside * 0.55, speed, dt); }
function trenchStep(e, dt, shoot, aimPitch) {
  separate(e); e.k = trNear(e.k, e.pos.x, e.pos.z);
  // a man wedged against a sandbag traverse where the trench floor climbs steeply (the north-west corner) never reaches the cover he is
  // making for, and stood there out of sight for good, holding the stage open: after a few seconds of running on the spot he gives that
  // cover up and steps back onto the middle of the trench
  if (e.slide) { const dx = e.slide[0] - e.pos.x, dz = e.slide[1] - e.pos.z, dl = Math.hypot(dx, dz), st = Math.min(dl, 3.2 * dt); if (dl > 0.03) { e.pos.x += dx / dl * st; e.pos.z += dz / dl * st; e.pos.y = groundAt(e.pos.x, e.pos.z); } else e.slide = null; }   /* freed: he steps across to the middle, not a jump */
  if (Math.hypot(e.pos.x - e.stX, e.pos.z - e.stZ) > 0.6) { e.stX = e.pos.x; e.stZ = e.pos.z; e.stT = 0; }
  else if ((e.stT += dt) > 3.5 && e.moving) { if (e.tcov) { e.usedTrav.add(e.tcov); releaseCov(e); } const q = TR.pts[clamp(e.k + (TR.pK >= e.k ? 1 : -1), 0, TR.pts.length - 1)]; if (!blocked(q[0], q[1], 0.3, groundAt(q[0], q[1]))) e.slide = [q[0], q[1]]; e.stT = 0; }
  const dk = TR.pK - e.k, dir = dk >= 0 ? 1 : -1, dP = Math.hypot(P.pos.x - e.pos.x, P.pos.z - e.pos.z), seesP = !!(e.target && e.target.player);
  for (const f of FRIENDS) if (f.state === 'post' && f.unit.pos.distanceTo(e.pos) < 2.2 && Math.random() < dt * 0.5) woundFriend(f, Math.random() < 0.4);
  e.meleeCd -= dt; e.patience += dt;
  const busy = playerBusy(), aimed = aimedAt(e), between = TR.travK.some((kc) => (kc - e.k) * dir > 0 && (TR.pK - kc) * dir > 0); e.moving = false;
  if (!e.rush && !between && dP < 10 && ((e.patience > 10 && !aimed) || (busy && dP < 13))) e.rush = true;
  if (e.tcov && e.tcov.dir !== dir) releaseCov(e);
  // point blank, or the player is reloading next to us, or he left the trench: go for the kill
  if (P.alive && (dP < 3.5 || e.rush || (busy && dP < 11 && !between) || (TR.pD > 2.2 && dP < 12))) {
    releaseCov(e);
    if (dP < 1.75 && e.meleeCd <= 0) { e.meleeCd = 1.3; e.face(P.pos.x, P.pos.z); e.throwT = 0.5; hurtPlayer(diff.dmg[1], e.chest()); return; }
    e.anim += dt * 9; if (dP > 1.3) steer(e, P.pos.x, P.pos.z, dP > 8 ? 5.0 : 3.4, dt);
    e.face(P.pos.x, P.pos.z); e.stance = 'stand';
    e.fireCd -= dt; if (seesP && e.fireCd <= 0) { if (e.burst <= 0) e.burst = wBurst(e); e.burst--; e.fireCd = e.burst > 0 ? wGap(e) : wPause(e, 0.3); enemyFire(e); }
    e.rig.pose(dP > 8 ? 'run' : 'aim', e.anim, aimPitch()); return;
  }
  // no traverse left between us and him: crouch, fire bursts and keep moving sideways; fall back to cover if he has us in his sights
  if (!between && dP < 10 && !(e.tcov && !e.inCov)) {
    if (aimed) e.aimT = (e.aimT || 0) + dt; else e.aimT = Math.max(0, (e.aimT || 0) - dt);
    if (e.aimT > 0.7) { let back = null, bd = 99; for (const c of TRAV) { if (c.dir !== dir || (c.by && c.by !== e)) continue; const a = (c.k - e.k) * dir; if (a > 0 || a < -7) continue; if (-a < bd) { bd = -a; back = c; } } if (back) { releaseCov(e); back.by = e; e.tcov = back; e.inCov = false; e.aimT = 0; e.patience = 0; } }
    if (!e.tcov || e.inCov) {
      if (e.inCov && e.tcov && !(e.patience > 9 || busy)) { coverCycle(e, dt, e.tcov, shoot, aimPitch); return; }
      releaseCov(e); e.anim += dt * 6; sideStep(e, dt, 1.8); e.face(P.pos.x, P.pos.z); e.stance = 'crouch';
      e.fireCd -= dt; if (seesP && e.fireCd <= 0) { if (e.burst <= 0) e.burst = wBurst(e); e.burst--; e.fireCd = e.burst > 0 ? wGap(e) : wPause(e, 0.45); enemyFire(e); }
      if (e.gCd <= 0 && GAME.gCd <= 0 && dP > 5) lobGrenade(e, P.pos);
      e.rig.pose('crouch', e.anim, aimPitch()); return;
    }
  }
  if (!e.tcov) {
    // pick the next traverse: the first ahead of us (or the one we are standing at)
    let best = null, bd = 99;
    for (const c of TRAV) { if (c.dir !== dir || (c.by && c.by !== e) || e.usedTrav.has(c)) continue; const a = (c.k - e.k) * dir; if (a < -2 || a > 13 || (TR.pK - c.k) * dir < 2) continue; if (Math.abs(a) < bd) { bd = Math.abs(a); best = c; } }
    const packed = crowdedAt(e.pos.x, e.pos.z, 1.4, e), far = dP > 14;   // far from the player the column keeps moving: nobody waits for the token
    if (best && (bd <= 2 || tokFree(dir, e) || far || e.patience > 12 || (packed && e.patience > 3))) { best.by = e; e.tcov = best; e.inCov = false; if (bd > 2) D.tok[dir] = e; }
    else if (!best && packed && e.patience > 3 && dP > 6) { const t = TR.pts[clamp(e.k + dir * 3, 0, TR.pts.length - 1)]; e.anim += dt * 8; steer(e, t[0], t[1], 3.2, dt); e.patience = 0; e.rig.pose('run', e.anim); return; }   // nowhere to bound to and men piling up behind: move up the trench anyway
  }
  if (e.tcov) {
    const c = e.tcov;
    if (!e.inCov) {
      e.moving = true; e.anim += dt * 10; e.stance = 'stand'; const d = steer(e, c.x, c.z, e.speed + (aimed ? 0.6 : 0), dt); e.rig.pose('run', e.anim);
      if (d < 0.45) { e.inCov = true; e.coverT = dP > 14 ? rand(0.7, 1.4) : rand(2.2, 3.6); e.cyc = rand(0.5, 1.0); e.peek = false; e.patience = 0; if (D.tok[dir] === e) D.tok[dir] = null; }
      return;
    }
    if (coverCycle(e, dt, c, shoot, aimPitch)) {
      // time to bound forward, but only if nobody else is moving, he is not covering us, or we have waited long enough
      let next = null, bd = 99; for (const o of TRAV) { if (o === c || o.dir !== dir || (o.by && o.by !== e) || e.usedTrav.has(o)) continue; const a = (o.k - e.k) * dir; if (a < 2 || a > 13 || (TR.pK - o.k) * dir < 2) continue; if (a < bd) { bd = a; next = o; } }
      const far = dP > 14, go = (!aimed && (tokFree(dir, e) || far) && (busy || far || Math.random() < 0.6)) || e.patience > 14 || (crowdedAt(e.pos.x, e.pos.z, 1.4, e) && e.patience > 4);
      if (next && go) { e.usedTrav.add(c); releaseCov(e); next.by = e; e.tcov = next; e.inCov = false; D.tok[dir] = e; }
      else if (!next && (busy || e.patience > 11) && !aimed) { e.usedTrav.add(c); releaseCov(e); e.patience = 0; }
      else e.coverT = rand(0.8, 1.6);
    }
    return;
  }
  // open trench ahead: move up one at a time, never in a crowd
  if (!tokFree(dir, e) && e.patience < 10 && dP < 30) { e.stance = 'crouch'; e.anim += dt; if (seesP) { e.face(P.pos.x, P.pos.z); e.fireCd -= dt; if (e.fireCd <= 0) { if (e.burst <= 0) e.burst = wBurst(e); e.burst--; e.fireCd = e.burst > 0 ? wGap(e) : wPause(e, 0.6); enemyFire(e); } } e.rig.pose('crouch', e.anim, aimPitch()); return; }
  D.tok[dir] = e; e.moving = true;
  const ni = clamp(e.k + dir * 2, 0, TR.pts.length - 1), w = lanePt(ni);
  e.anim += dt * 9.5; e.stance = 'stand'; steer(e, w[0], w[1], dP > 30 ? 5.2 : e.speed, dt); e.rig.pose('run', e.anim);
}
/* ================= boats & waves ================= */
/* a wave of boats: n of them (more on the hard level, fewer on a phone), their landing points spread along the front and their starts a couple of
   seconds apart, so the canal fills with boats; rpg / flame: how many boats carry an RPG man or a flamethrower. Every boat is full - eight
   soldiers and the rowers - and all of them come ashore. near [d0, step]: the wave is already on the water, the first boat d0 metres from
   the beach and each next one step metres further out */
function boatWave(z0, z1, n, t0, gap, seats, rpg = 0, flame = 0, hp, near) {
  const N = Math.max(2, Math.round(n * diff.boats * (LITE ? 0.8 : 1) * (mzEase() ? mzEase().boats : 1))), r = rng(4400 + Math.round(z0 * 7 + z1 * 3) + Math.max(0, D.scene) * 131);
  for (let i = 0; i < N; i++) { const z = lerp(z0, z1, (i * 0.618034) % 1) + (r() - 0.5) * 2.5, b = launchBoat(z, t0 + i * gap + r() * gap * 0.6, seats, i < rpg ? 1 : 0, i === Math.floor(N / 2) && flame ? 1 : 0); if (hp) b.hp = hp;
    if (near) { const left = Math.min(b.len * 0.95, near[0] + i * near[1] + r() * near[1] * 0.4); b.t = (b.len - left) / b.speed; } }
}
/* the boats on the water, as they are now (with their men, their RPGs and flamethrowers, how far across they are), and put back again */
function boatSnap() {
  if (MODE !== 'mezach' || SURV.on) return [];
  return BOATS.filter((b) => !b.dead && (b.state === 'wait' || b.state === 'cross') && aboard(b) > 0).map((b) => ({ z: b.zLand, t: b.t, hp: b.hp, wave: b.wave,
    men: b.seats.filter((q) => !q.rower && q.alive && !q.gone).length, rowers: b.seats.filter((q) => q.rower).length, spread: b.spread, rpg: b.seats.filter((q) => q.kind === 'rpg' && q.alive).length, flame: b.seats.filter((q) => q.kind === 'flame' && q.alive).length }));
}
function boatRestore(list) { for (const o of list) { const b = launchBoat(o.z, 0, 8, o.rpg, o.flame, o.men, o.spread, o.rowers); b.t = o.t; b.hp = o.hp; if (o.wave !== undefined) b.wave = o.wave; } }
/* the oars' pace: the level's, eased in the stronghold, and slower still where a stage asks for it (boatV: the great wave) */
const boatSpd = () => { const mz = mzEase(), S = SCENES[Math.max(0, D.scene)]; return diff.boat * 0.34 * (!mz ? 1 : S.boatV ? S.boatV[Math.max(0, DIFF.indexOf(diff))] : mz.boatV); };
function launchBoat(zLand, delay, n, rpg = 0, flame = 0, men, spread = 90, rowers) {
  const seed = 9001 + Math.round(zLand * 13) + Math.max(0, D.scene) * 7919, r = rng(seed);
  const to = [tongueWestX(zLand) - 4.5, zLand]; const from = [nearX(-400), clamp(zLand + (r() - 0.5) * spread, -380, 380)];   // from just off the Port Tewfik quays
  const bt = new Boat(from, to, men ?? (SURV.on ? Math.max(2, Math.ceil(n * 0.55)) : 8), boatSpd(), delay, rowers); /* a full boat (survival keeps its own count); a heavy rowboat: about three metres a second, a minute and a half across */ bt.zLand = zLand; bt.state = 'wait'; bt.seed = seed; bt.spread = spread; bt.mine = MODE === 'mezach' && !SURV.on && !!SCENES[Math.max(0, D.scene)].mines;
  const ns = bt.seats.length;   // the boat carries fewer men than the wave counts: never index past its seats (that froze the game)
  for (let i = 0; i < rpg && i < ns; i++) bt.seats[i].kind = 'rpg';
  for (let i = 0; i < flame && ns - 1 - i > rpg - 1 && i < ns; i++) bt.seats[ns - 1 - i].kind = 'flame';
  return bt;
}
/* the men in the boats shoot back as they come in: short wild bursts from a random seat, muzzle flashes over the water, rounds that slap
   the sandbags and the bank around the player, and a hit now and then on a man who stands up in the open */
const _wtB = { h: 0, pitch: 0, roll: 0 };
function boatFire(bt, dt, x, z) {
  if (!P.alive || CINE.on || GAME.state !== 'play') return;
  bt.fireCd = (bt.fireCd ?? rand(0.6, 2.5)) - dt; if (bt.fireCd > 0) return;
  const pe = playerEye(), d = Math.hypot(pe.x - x, pe.z - z);
  if (d > 220 || d < 6) { bt.fireCd = 0.5; return; }
  const seats = []; bt.seats.forEach((s, i) => { if (s.alive && !s.gone && !s.rower) seats.push(i); }); if (!seats.length) return;
  if (!(bt.burst > 0)) { bt.burst = Math.floor(rand(2, 5)); bt.shooter = pick(seats); }
  bt.burst--; bt.fireCd = bt.burst > 0 ? rand(0.1, 0.16) : rand(2.0, 4.2) * (SURV.on ? 0.75 : 1);
  const i = seats.includes(bt.shooter) ? bt.shooter : pick(seats); const from = bt.seatWorld(i); from.y += 0.92; from.x += Math.sin(bt.heading) * 0.55; from.z += Math.cos(bt.heading) * 0.55;
  fxMuzzle(from); sndShot('ak', from); bt.shotT = GAME.t;
  const rangeF = clamp(1 - d / 320, 0.2, 1), aim = V3(pe.x, pe.y - 0.2, pe.z), wt = segHitT(from.x, from.y, from.z, aim.x, aim.y, aim.z, 1.5);
  if (wt >= 0) { // the round ends in the parapet or a wall in front of the player: a puff of sand, sometimes a torn sandbag
    const wp = V3(lerp(from.x, aim.x, wt), lerp(from.y, aim.y, wt), lerp(from.z, aim.z, wt)); fxTracer(from, wp, true); fxDust(wp); if (d < 70 && Math.random() < 0.25) sndWhiz();
    if (Math.random() < 0.3) bagBurst(wp, 1); return;
  }
  const p = 0.42 * diff.acc * (mzEase() ? mzEase().acc : 1) * rangeF * (SURV.on ? SURV.acc : 1) * (P.crouch ? 0.5 : 1) * (moving() ? 0.7 : 1) * (P.post ? 0.8 : 1) * (d < 25 ? 1.6 : 1);
  const hit = Math.random() < p; if (hit) hurtPlayer(rand(diff.dmg[0], diff.dmg[1]) * 0.85, from); else if (d < 80 && Math.random() < 0.35) sndWhiz();
  const end = aim.clone(); if (!hit) end.add(V3(rand(-1.8, 1.8), rand(-0.9, 1.1), rand(-1.8, 1.8)));
  fxTracer(from, end, true);
  if (!hit && Math.random() < 0.55) { const gy = groundAt(end.x, end.z); fxDust(V3(end.x, Math.max(gy, 0) + 0.2, end.z), gy < 0); }
}
/* while the beach already has its fill - the men ashore and still alive, and those still in the boats that have gone past the line - the
   boats behind wait on the water some twenty-five metres out, rowing against the current, until there is room. LANDCAP.n is in boatloads,
   set by the stage and the level; one boat always comes in when the beach is empty */
const LANDCAP = { n: 999, wave: 0, open: -1 };
/* the great wave comes in waves: a wave lands together, and only once the beach has thinned to LANDCAP.wave men; until then it waits on the
   water twenty-five metres out, and the waves behind it wait in line behind it, thirty metres apart (LANDCAP.open: the last wave let in) */
const aboard = (bt) => { let n = 0; for (const s of bt.seats) if (s.alive && !s.gone) n++; return n; };
function updBoats(dt) {
  // counted before any boat moves this frame (a boat coming to the line must not count itself)
  let men = 0; if ((LANDCAP.n < 999 || LANDCAP.wave) && !CINE.on) { for (const e of UNITS.enemies) if (e.alive) men++; for (const bt of BOATS) if (!bt.dead && (bt.state === 'landed' || (bt.state === 'cross' && bt.t * bt.speed > bt.len - 25 + 0.01))) men += aboard(bt); }
  const load = 8 + (LITE ? 4 : 6), room = (LANDCAP.n + 0.3) * load;
  for (const bt of BOATS) {
    if (bt.dead) continue;
    { const fz = CINE.on && bt.ft0 !== undefined && !bt.filmLand; bt.t += fz ? dt * (CINE.def.boatRate || 1) : dt; if (fz) bt.t = Math.min(bt.t, (bt.len - 5) / bt.speed); }   /* in a film of the boats (boatsFreeze) only its own boat lands */
    if (bt.state === 'wait') { if (bt.t >= 0) { bt.state = 'cross'; bt.g.visible = true; } else continue; }
    if (bt.state === 'cross') {
      if (LANDCAP.wave && bt.wave !== undefined) { bt.holding = false;
        if (bt.wave > LANDCAP.open && bt.len - bt.t * bt.speed < 25) LANDCAP.open = bt.wave;   /* in past the line (in a film, or put there): its wave is in */
        if (!CINE.on && bt.wave > LANDCAP.open) { const k = bt.wave - LANDCAP.open - 1, tl = (bt.len - 25 - 32 * k - (bt.back ? 9 : 0)) / bt.speed;   /* the second row waits a boat's length behind the first */
          if (bt.t > tl && bt.t - dt <= tl + 1e-3) { if (k === 0 && men <= LANDCAP.wave) LANDCAP.open = bt.wave; else { bt.holding = true; bt.t = tl; } } } }
      else { const tHold = (bt.len - 25) / bt.speed; bt.holding = false;
        if (LANDCAP.n < 999 && !CINE.on && bt.t > tHold && bt.t - dt <= tHold + 1e-3) { const a = aboard(bt); if (men > 0 && men + a > room) { bt.holding = true; bt.t = tHold; } else men += a; } }
      const u = Math.min(1, bt.t * bt.speed / bt.len); const x = lerp(bt.from[0], bt.to[0], u), z = lerp(bt.from[1], bt.to[1], u);
      // the boat rides bow-up under power and climbs the waves it is drawn on: lifted by their height, pitched and heeled by their slope, plus its own slap over the chop
      const wt = waveTilt(x, z, bt.heading, 3.2, 1.2, _wtB);
      // a rowed boat: it lifts and heels with the waves and surges a little with every stroke
      bt.g.position.set(x, 0.03 + wt.h + Math.sin(bt.t * 2.2) * 0.025, z); bt.g.rotation.set(wt.roll * 0.9 + Math.sin(bt.t * 2.3 + bt.len) * 0.03, bt.heading - Math.PI / 2, 0.02 + wt.pitch * 0.9 + Math.sin(bt.ph) * 0.012); bt.g.updateMatrixWorld();
      { const lk = Math.tan(camera.fov * Math.PI / 360) / 0.601, ld = LITE ? 60 : 80; bt.setLod(bt.intact && !bt.filmHide && camera.position.distanceToSquared(bt.g.position) * lk * lk > ld * ld); }   // far off (by what the eye sees: closer through a sight), one piece
      if (!bt.filmHide && !bt.lodOn) bt.row(dt);   // in the drone's film the oars are put away: up close the rowing does not look right
      if (Math.random() < dt * 4) fxDust(V3(x + Math.sin(bt.heading) * 4.2 + Math.cos(bt.heading) * rand(-0.8, 0.8), 0.12 + wt.h, z + Math.cos(bt.heading) * 4.2 - Math.sin(bt.heading) * rand(-0.8, 0.8)), true);
      boatFire(bt, dt, x, z);
      if (bt.mine && bt.len - bt.t * bt.speed <= bt.speed * MZ_MINE_T) { mzMineBoat(bt); continue; }
      if (u >= 1) { bt.state = 'landed'; bt.landT = 0; bt.setLod(false); }
      if (bt.hp <= 0 || bt.aliveCount() === 0) { if (bt.hp <= 0) { bt.seats.forEach((s, i) => { if (s.alive) killSeat(bt, i); }); feed('סירה נפגעה וטבעה', 'good'); } bt.state = 'sinking'; bt.sinkT = 0; }
    } else if (bt.state === 'sinking') { bt.sinkT += dt; bt.g.position.y -= dt * 0.5; bt.g.rotation.z += dt * 0.3; if (bt.sinkT > 4) bt.dispose(); }
    else if (bt.state === 'landed') {
      bt.landT += dt; bt.g.position.y = 0.03 + waveH(bt.g.position.x, bt.g.position.z) * 0.5; bt.g.updateMatrixWorld();
      bt.seats.forEach((s, i) => {
        if (!s.alive || s.gone || bt.landT < i * 0.25) return;   // the soldiers first, then the rowers ship their oars and follow them
        const sp = bt.seatWorld(i), r = rng(bt.seed + i * 97), z = bt.zLand + (i % 2 ? 1 : -1) * (0.5 + r() * 3.5);
        const e = spawnEnemy(tongueWestX(z) + 1.6, z, varyKind(s.kind, z * 3.1, i * 7.7), null, null, { jump: sp });
        if (!e) return; e.plan = westPlan(e, z, i, r); if (D.landHold && GAME.t < D.landHold && !SURV.on) holdPlan(e, D.landHold + r() * 6); bt.intact = false; bt.setLod(false); s.gone = true; s.m.visible = false; if (s.oar) s.oar.visible = false;
      });
      if (bt.seats.every((s) => !s.alive || s.gone) && bt.landT > 30) bt.dispose();
    }
  }
}
/* the great wave does not reach the shore yet: a second before each boat would ground it runs onto the mines laid along the waterline and goes
   up with everyone in it (the user's call: no one lands in that wave). Their dead are the mines', not the player's */
const MZ_MINE_T = 1;
function mzMineBoat(bt) {
  // a boat put past the line in one jump (a skipped film) still goes up on it, not on the sand
  const u = Math.max(0, 1 - bt.speed * MZ_MINE_T / bt.len); bt.t = Math.min(bt.t, u * bt.len / bt.speed); bt.g.position.x = lerp(bt.from[0], bt.to[0], u); bt.g.position.z = lerp(bt.from[1], bt.to[1], u); bt.g.updateMatrixWorld();
  const p = bt.g.position.clone(); p.y = 0.1; bt.mined = true; bt.intact = false; bt.setLod(false); bt.hp = 0;
  for (const s of bt.seats) { if (s.alive && !s.gone) { s.alive = false; s.m.visible = false; } if (s.oar) s.oar.visible = false; } for (const m of bt.filmExtra || []) m.visible = false;
  fxExplosion(p, 1.7); sndBoom(p, 1.5); FX.shake = Math.max(FX.shake, clamp(1.3 - camera.position.distanceTo(p) / 40, 0, 0.8));
  // a column of white water and, in it, the boat's planks thrown up and falling back
  for (let i = 0; i < 12; i++) fxDust(p.clone().add(V3(rand(-1.8, 1.8), 0.3 + i * 0.9, rand(-1.8, 1.8))), true);
  for (let i = 0; i < 9; i++) { const q = FX.dust.get(); q.life = 1.8; const vx = rand(-6, 6), vz = rand(-6, 6); let vy = rand(9, 17); q.s.position.copy(p); q.s.material.color.set(0x4a3a28);
    q.upd = (o, u, d2) => { vy -= 16 * d2; o.s.position.x += vx * d2; o.s.position.y = Math.max(0.05, o.s.position.y + vy * d2); o.s.position.z += vz * d2; o.s.scale.setScalar(0.35 + u * 0.4); o.s.material.opacity = 0.95 * (1 - u * u); }; }
  bt.state = 'sinking'; bt.sinkT = 0; bt.g.rotation.z += 0.35;
  feed('סירה עלתה על מוקש לפני החוף', 'good');
  if (!CINE.on && !D.mineMsg) { D.mineMsg = true; radio('תצפית', 'סירה עלתה על מוקש בקו המים! אף אחד מהם לא יצא ממנה!', 4); }
}
/* the great wave, in waves: when the player has the gun again one boat is on the beach and two more are ten seconds out; behind them, every
   few seconds (9 on the easy level), a wave of six pushes off from the quays - two rows of three, the second row in the gaps of the first, a
   few metres behind it, the rows zigzagging one wave to the next. A boat is put on the water only when it is due to leave the quays; while
   the boats ahead are held off the beach (the landing cap), or the canal holds as many boats as it can draw, the waves behind wait */
const ROWS = { on: false, q: [] };
function rowsStart(o) { Object.assign(ROWS, { on: true, q: [], j: 0, men: 0, shift: 0, total: o.total, z0: o.z0, z1: o.z1, every: o.every, ctrl: o.ctrl, aLand: o.aLand, r: rng(7300 + Math.round(GAME.t * 7)) }); }
const ROW_MEN = 6, ROW_OARS = 4, ROW_LOAD = () => ROW_MEN + ROW_OARS;   /* a boat of the great wave: ten men, six soldiers and four at the oars - a wave of six boats is sixty */
function rowsWave() {   // the next wave's boats: where each lands on the beach and when
  const j = ROWS.j++, r = ROWS.r, out = [], zc = (ROWS.z0 + ROWS.z1) / 2, d = (ROWS.z1 - ROWS.z0) / 3.4, cl = (z) => clamp(z, ROWS.z0, ROWS.z1);
  const boat = (land, z, back = false, jit = 0.5) => out.push({ land: land + rand(-jit, jit), z: cl(z + (r() - 0.5) * 4), wave: j, back, rpg: r() < 0.3 ? 1 : 0, flame: j > 2 && r() < 0.12 ? 1 : 0 });
  if (j === 0) boat(ROWS.aLand, zc + (r() - 0.5) * 8, false, 0);   // to the frame: the boats film shows this one go up on the mines
  else if (j === 1) { boat(ROWS.ctrl + 10, zc - d * 0.9); boat(ROWS.ctrl + 10.8, zc + d * 0.9); }
  else { const L = ROWS.ctrl + 10 + ROWS.every * (j - 1), c = zc + (r() - 0.5) * 8, sg = j % 2 ? 1 : -1;
    for (const k of [-1, 0, 1]) boat(L, c + k * d); for (const k of [-1, 0, 1]) boat(L + 2.6, c + sg * d / 2 + k * d, true); }
  out.length = Math.min(out.length, Math.max(1, Math.ceil((ROWS.total - ROWS.men) / ROW_LOAD())));   /* the last wave: only what is left of the total */
  ROWS.men += out.length * ROW_LOAD(); ROWS.q.push(...out); ROWS.q.sort((a, b) => a.land - b.land);
}
function rowsPending() { return ROWS.on ? Math.max(0, ROWS.total - ROWS.men) + ROWS.q.length * ROW_LOAD() : 0; }
function rowsUpd(dt) {
  if (!ROWS.on || MODE !== 'mezach' || SURV.on) return;
  if (CINE.on && CINE.def && CINE.def.boatFilm) { ROWS.shift += dt; return; }   /* a film of the boats stops the battle: the waves behind wait it out at the quays */
  const maxOut = LITE ? 26 : 32; /* far off a boat is one piece to draw (Boat.setLod), so the canal can hold this many */ let out = 0, holding = false; for (const b of BOATS) if (!b.dead && (b.state === 'wait' || b.state === 'cross')) { out++; if (b.holding) holding = true; }
  if (out >= maxOut || holding) { ROWS.shift += dt; return; }   // the canal is full, or the boats ahead are held off the beach: the waves behind wait at the quays
  const sp = boatSpd(), cross = (tongueWestX(20) - 4.5 - nearX(-400)) / sp;
  for (;;) {
    if (!ROWS.q.length) { if (ROWS.men >= ROWS.total) break; rowsWave(); }
    const e = ROWS.q[0], land = e.land + ROWS.shift; if (land - cross > GAME.t + 1.5) break;   // not due to push off yet
    ROWS.q.shift(); const b = launchBoat(e.z, 0, 8, e.rpg, e.flame, ROW_MEN, 6, ROW_OARS); b.wave = e.wave; b.back = e.back;   /* straight across, so a row stays a line */ b.t = (b.len - (land - GAME.t) * b.speed) / b.speed;
    if (CINE.on && CINE.def && CINE.def.boatFilm) filmRow(b, true); if (++out >= maxOut) break;
  }
  if (!ROWS.q.length && ROWS.men >= ROWS.total) ROWS.on = false;
}
function southGroup(n, delay, kinds = [], i0 = 0) {   // the same out of the southern scrub, up the southern saps
  for (let i = 0; i < n; i++) {
    const k = kinds[i] || 'rifle', j = i + i0, sap = SAPS.s[j % 2], r = rng(91 + j * 29), go = () => { const e = spawnEnemy(sap[0][0] + (r() - 0.5) * 0.8, sap[0][1] + (r() - 0.5) * 0.8, varyKind(k, j * 2.9, delay), null, null); if (!e) { DIRQ.push({ at: GAME.t + 1, spawn: true, fn: go }); return; } e.plan = sapPlan(e, sap, j + 50); e.state = 'plan'; };
    DIRQ.push({ at: GAME.t + delay + i * 0.9, spawn: true, fn: go });
  }
}
function northGroup(n, delay, kinds = [], i0 = 0) {   // i0: the first man's number in the whole force, so each squad has its own starts and its own routes
  for (let i = 0; i < n; i++) {
    const k = kinds[i] || 'rifle', j = i + i0;
    const r = rng(77 + j * 31), sap = SAPS.n[j % 2], go = () => { const e = spawnEnemy(sap[0][0] + (r() - 0.5) * 0.8, sap[0][1] + (r() - 0.5) * 0.8, varyKind(k, j * 3.7, delay), null, null);   /* at the head of one of their saps, in the scrub */ if (!e) { DIRQ.push({ at: GAME.t + 1, spawn: true, fn: go }); return; } e.plan = northPlan(e, j); e.state = 'plan'; };
    DIRQ.push({ at: GAME.t + delay + i * 0.9, spawn: true, fn: go });
  }
}
/* the commando from the north comes in squads, one behind the other down the Lexicon road: far more men to stop than the one small group
   there was (the user: too few there), but never all of them at once, and only a couple of RPGs - more targets, not more fire. Per level:
   the men in each squad; a squad sets off MZ_CMD_GAP seconds after the one before it */
const MZ_CMD = [[6, 6, 7], [7, 7, 8], [8, 8, 8, 6]], MZ_CMD_GAP = 24;
function mzCommando() { let t = 5, i0 = 0; MZ_CMD[Math.max(0, DIFF.indexOf(diff))].forEach((n, k) => { northGroup(n, t, k === 0 ? ['rpg'] : k === 2 ? ['rifle', 'rifle', 'rpg'] : [], i0); i0 += n; t += MZ_CMD_GAP; }); }
const DIRQ = [];
const BARRAGE_AT = 4, BARRAGE_LEN = 16;   // twenty seconds in the covered trench, then out to the guns
const D = { scene: -1, phase: 'alert', phaseT: 0, introLen: 0, artT: 12, inside: 0, barT: 0, launched: false, r2: false, jets: false, smoke: [], capture: 0, capWarn: false, chargeMsg: -99, objDone: false, trenchMsg: -99, inTrench: 0, tok: { 1: null, '-1': null } };
const STATS = { kills: 0, heads: 0, treated: 0, saved: 0, kia: 0 };
const trenchAt = (z) => [crestX(z) + 3.6, z];
const POSTP = (id) => POSTS.find((q) => q.id === id);
const bayOf = (id, r = 2.7) => { const p = POSTP(id); return [p.x, p.z, r]; };
const postFocus = (id, label, mag) => () => { const p = POSTP(id); return [p.x, p.g + 0.6, p.z, label, mag ? 'mag' : '']; };
const trFocus = (z, label) => () => { const p = TR.pts[kz(z)]; return [p[0], groundAt(p[0], p[1]), p[1], label]; };
const w2Focus = postFocus('W2', 'מא״ג מערבי', true);
/* each stage is one stretch of the trench (plus the post bays on it); nothing else is reachable */
function CORR(k0, k1, o = {}) { return { k0: Math.max(0, Math.min(k0, k1)), k1: Math.min(TR.pts.length - 1, Math.max(k0, k1)), extra: o.extra || [], bays: o.bays || [], rects: o.rects || [] }; }
function segD(x, z, a, b) { const ex = b[0] - a[0], ez = b[1] - a[1], l2 = ex * ex + ez * ez; const t = l2 ? clamp(((x - a[0]) * ex + (z - a[1]) * ez) / l2, 0, 1) : 0; return Math.hypot(a[0] + ex * t - x, a[1] + ez * t - z); }
function corridorHas(C, x, z) {
  for (let i = C.k0; i < C.k1; i++) { const a = TR.pts[i]; if (Math.abs(a[0] - x) > 3 || Math.abs(a[1] - z) > 3) continue; if (segD(x, z, a, TR.pts[i + 1]) < 1.6) return true; }
  for (const L of C.extra) if (distPolyline(x, z, L) < 1.6) return true;
  for (const [bx, bz, r] of C.bays) if (Math.hypot(bx - x, bz - z) < r) return true;
  for (const r of C.rects) if (x > r[0] && x < r[2] && z > r[1] && z < r[3]) return true;
  return false;
}
/* the mission is one trench: each stage opens the next stretch, sandbag barricades close everything else */
const SCENES = [
  { title: 'סירות על המים', sub: 'שתיים אחרי הצהריים. מעבר לתעלה, מתוך העשן, יוצאות סירות עץ בשורה — עשרות חיילים בכל אחת, חותרים ישר אלינו. המא״ג המערבי הוא כל מה שעומד בינם לבין הסוללה.', goal: 'ירו בסירות מהמא״ג המערבי. מי שעלה לתעלה — הרגו אותו בתוכה', open: [136, 176], spawn: () => trenchAt(-1.0), face: 345, focus: w2Focus,
    entries: [-20, -14, -8, -2, 3, 8.5], radio: ['מ״פ', 'סירות במים ממערב! המא״ג המערבי שלך!'], cap: [1, 1, 2], start() { boatWave(-21, 10, 18, 3, 1.8, diff.seats, 0, 0, 150); } },
  { title: 'הפרצה בצפון', sub: 'המחסום הצפוני נפתח, ובקצה הסוללה, ליד עמדה 1, כבר מטפסים הראשונים שצלחו. בתעלה הצרה פוגשים אותם פנים אל פנים, שק חול אחרי שק חול.', goal: 'התקדמו צפונה בתעלה ונקו אותה מהצולחים', open: [96, 176], spawn: () => TR.pts[140], face: 0, focus: trFocus(-38, 'עמדה מערבית 1'),
    entries: [-55, -50, -39.5, -27], radio: ['יוסי', 'הם עולים עליי מצפון! תביאו תגבורת לתעלה!'], cap: [1, 1, 2], pre(len) { const nb = [2, 2, 3][Math.max(0, DIFF.indexOf(diff))]; for (let i = 0; i < nb; i++) { const b = launchBoat(lerp(-76, -60, nb > 1 ? i / (nb - 1) : 0.5), 0, 5, i === 0 ? 1 : 0, 0, 5, 30, 3); b.t = (b.len - 1.5 - i * 5) / b.speed; } D.landHold = GAME.t + len + 2; }, start() {} },   // two boats, beached as the stage is called: their men are on the sand under the rampart, some forty metres from the trench, when the player gets there - and wait there a little before they go for it
  { title: 'קומנדו בשער', sub: 'מכביש לכסיקון, מצפון, רץ כוח קומנדו ישר אל השער. הם מכירים את המוצב מתצלומי האוויר, ויודעים שהתעלה הצפונית היא הדרך פנימה.', goal: 'עצרו את הקומנדו בתעלה הצפונית, עד הפינה — והחזיקו אותה', open: [0, 176], spawn: () => TR.pts[100], face: 0, focus: postFocus('N1', 'עמדה צפונית'),
    radio: ['תצפית', 'כוח קומנדו בכביש מצפון! הם רצים לתעלה הצפונית!'], acc: 0.8, start: mzCommando },   // acc: running men firing on the move: more of them, each one less deadly
  { title: 'חובש!', sub: 'ההרעשה חזרה. פגז נכנס ישר לעמדה הדרומית, ובתעלה שוכבים חברים שצועקים לחובש. התאג״ד חפור בדופן התעלה, ומי שנחבש בזמן חוזר לעמדה.', goal: 'עזרה ראשונה לפצועים (להחזיק F) — ועצרו את הכוח שעולה מהשיחים בדרום', medevac: true, open: [136, 316], spawn: () => trenchAt(-6), face: 180,
    focus: () => { const w = nearestWounded(); return w ? [w.unit.pos.x, w.unit.pos.y, w.unit.pos.z, `פצוע · ${w.name}`] : null; },
    entries: [12, 24, 35, 46], radio: ['דודו', 'פגיעה ישירה בעמדה! יש פצועים בתעלה הדרומית!'], start: medevacStart },
  { title: 'הגל הגדול', sub: 'לפנות ערב הם זורקים את הכול: סירות לכל אורך הסוללה המערבית, מקצה לקצה, והשמש השוקעת מאחוריהם. המוצב הקטן הזה הוא כל מה שנשאר מהקו.', goal: 'ירו בסירות מהמא״ג המערבי. אל תתנו להן להגיע לחוף', open: [96, 250], spawn: () => trenchAt(-2), face: 338, focus: w2Focus,
    entries: [-50, -27, -14, 8.5, 24, 46, 56, 68], radio: ['מ״פ', 'גל גדול של סירות! כולם לסוללה המערבית!'], waveRoom: [20, 26, 32], boatV: [0.55, 0.58, 0.62],
    pre(len) { const lv = Math.max(0, DIFF.indexOf(diff)), film = !D.boatsFilm, ctrl = GAME.t + len; D.mineMsg = false;   // the film stops the battle (boatsFreeze): the player has the gun again with the boats where they were as it began - but for its own boat, which reaches the mines 14.9 s into it
      rowsStart({ z0: -25, z1: 63, total: [60, 90, 120][lv], every: [24, 22, 20][lv], ctrl, aLand: film ? ctrl + 14.9 + MZ_MINE_T : ctrl + 4 }); }, start() { mzBoatsFilm(); } },   // the great wave: half the boats it had (the user), and no mines - they land and come up the rampart
];
function scCorr(i) {
  const S = SCENES[i]; if (S._c) return S._c; const [a, b] = S.open;
  const bays = POSTS.filter((p) => { const [k, d] = trK(p.x, p.z); return d < 3.4 && k >= a && k <= b; }).map((p) => [p.x, p.z, 2.7]);
  const rects = DUGOUTS.filter((d) => d.k > a && d.k < b).map((d) => { const c = [d.at(-2.4, 1.0), d.at(2.4, 1.0), d.at(-2.4, TW + 4.6), d.at(2.4, TW + 4.6)]; return [Math.min(...c.map((q) => q[0])), Math.min(...c.map((q) => q[1])), Math.max(...c.map((q) => q[0])), Math.max(...c.map((q) => q[1]))]; });
  return (S._c = CORR(a, b, { bays, rects, extra: S.cj ? [TRENCH_LINES[3].pts] : [] }));
}
function curCorrs() { return [scCorr(Math.max(0, D.scene))]; }
function inStage(x, z) { if (SURV.on) return true; for (const C of curCorrs()) if (corridorHas(C, x, z)) return true; return false; }
function applyBarricades(i, fx = true) {
  const S = SCENES[Math.max(0, i)], [a, b] = S.open;
  for (const B of BARRS) {
    const on = B.surv ? false : B.id === 'CJ' ? !S.cj : !(B.id > a && B.id < b); if (on === B.on) continue; B.on = on; B.g.visible = on; B.col.top = on ? B.top : -1e4;
    if (fx && !on) { for (let k = 0; k < 6; k++) fxDust(V3(B.x + rand(-1, 1), groundAt(B.x, B.z) + rand(0.2, 1.2), B.z + rand(-1, 1))); feed('המחסום בתעלה נפתח', 'good'); }
  }
}
function moveToScene(i) {
  const S = SCENES[i]; if (P.mode === 'mag') leaveMag(); if (P.carrying) { const f = P.carrying; P.carrying = null; P.mode = 'rifle'; f.unit.rig.root.visible = true; f.state = 'stable'; f.marker.visible = true; }
  const sp = S.spawn(); P.pos.set(sp[0], groundAt(sp[0], sp[1]), sp[1]); P.yaw = -THREE.MathUtils.degToRad(S.face); P.pitch = 0; P.vy = 0;
  const f = $('#fade'); f.style.transition = 'none'; f.style.opacity = '1'; requestAnimationFrame(() => requestAnimationFrame(() => { f.style.transition = 'opacity .9s'; f.style.opacity = '0'; }));
}
function nearestWounded() { let b = null, bd = 1e9; for (const f of FRIENDS) if (f.state === 'wounded' || f.state === 'stable') { const d = Math.hypot(f.unit.pos.x - P.pos.x, f.unit.pos.z - P.pos.z); if (d < bd) { bd = d; b = f; } } return b; }
function medevacStart() {
  const order = ['W3', 'W4', 'T27', 'W1', 'T6', 'S2', 'S3', 'E1', 'N2', 'N3'];
  const pickF = order.map((id) => FRIENDS.find((f) => f.postId === id)).filter((f) => f && f.state === 'post').slice(0, 2);
  pickF.forEach((f, i) => DIRQ.push({ at: GAME.t + 0.2 + i * 1.6, fn: () => {
    if (!D.medMsg) { D.medMsg = true; sceneAnnounce(D.scene); }   /* the shell is in: now the stage is told - wounded in the trench, get to them */
    if (f.state !== 'post') return; const [x, z] = i === 0 ? (f.postId === 'W3' ? f.post.stand : trenchAt(28)) : trenchAt(44);
    f.unit.place(x, z); const b = V3(x - 1.5, groundAt(x - 1.5, z + 1), z + 1); fxExplosion(b, 1.1); sndBoom(b, 1.1); FX.shake = Math.max(FX.shake, 0.4); woundFriend(f, false, true);
  } }));
  DIRQ.push({ at: GAME.t + 0.3, fn: () => { if (!D.medMsg) { D.medMsg = true; sceneAnnounce(D.scene); } } });   // told even if nobody was left at a post to be hit
  boatWave(30, 50, 2, 8, 6, diff.seats, 1, 0);
  { const lv = Math.max(0, DIFF.indexOf(diff)), n = [5, 6, 8][lv]; southGroup(n, 16, ['rpg'], 0); DIRQ.push({ at: GAME.t + 16.5, fn: () => radio('תצפית', 'כוח מצרי עולה מהשיחים בדרום! הם בתעלה שלהם, ממש מתחת לתעלה הדרומית!', 4) }); }   /* while the wounded are seen to, a squad comes up out of the southern scrub */
  D.artT = 6;
}
function pendingSpawns() { let n = 0; for (const q of DIRQ) if (q.spawn) n++; return n; }
function enemiesLeft() { let n = pendingSpawns() + rowsPending(); for (const e of UNITS.enemies) if (e.alive) n++; for (const b of BOATS) if (!b.dead && b.state !== 'sinking') n += b.seats.filter((s) => s.alive && !s.gone).length; return n; }
function sceneClear() {
  if (D.phaseT < 6 || enemiesLeft() > 0) return false;
  if (SCENES[D.scene].medevac && FRIENDS.some((f) => f.state === 'wounded' || f.state === 'stable' || f.state === 'carried')) return false;
  return true;
}
const CP = { scene: -1, friends: null, stats: null };
function sceneAnnounce(i) { const S = SCENES[i]; toast(`שלב ${i + 1} מתוך ${SCENES.length} · ${S.title}`, S.sub); feed(`שלב ${i + 1}: ${S.title}`); radio(S.radio[0], S.radio[1], 4.5); }
function introScene(i, len) {
  D.scene = i; D.phase = 'intro'; D.phaseT = 0; D.introLen = len; D.objDone = false;
  CP.scene = i; CP.friends = FRIENDS.map((f) => (f.state === 'kia' ? 'kia' : f.state === 'saved' ? 'saved' : 'post')); CP.stats = { ...STATS };
  applyBarricades(i);
  for (const f of FRIENDS) if ((f.state === 'wounded' || f.state === 'stable') && !corridorHas(scCorr(i), f.unit.pos.x, f.unit.pos.z)) { f.state = 'saved'; f.marker.visible = false; feed(`חובשים פינו את ${f.name} לתאג״ד`, 'good'); }
  CP.boats = boatSnap();   // the boats already on the water as the stage begins: after a death they are put back just where they were
  D.landHold = 0; const S = SCENES[i], lv = Math.max(0, DIFF.indexOf(diff)); LANDCAP.n = S.cap ? S.cap[lv] : 999; LANDCAP.wave = S.waveRoom ? S.waveRoom[lv] : 0; LANDCAP.open = -1; if (S.pre) S.pre(len);
  if (S.medevac) D.medMsg = false; else sceneAnnounce(i);   /* the medics' stage: nothing is said until the shell has come in (medevacStart) */
  snapRequest('stage');
  if (i > 0) { P.reserve = 160; P.gren = diff.gren0; for (const p of POSTS) if (p.mag) { p.mag.belt = p.mag.cap || 200; p.mag.reload = 0; } if (!corridorHas(scCorr(i), P.pos.x, P.pos.z)) moveToScene(i); }
}
function airStrike() {
  spawnJets(0);
  for (let k = 0; k < 4; k++) DIRQ.push({ at: GAME.t + 6.6 + k * 0.55 + rand(0, 0.3), fn: () => {
    const x = rand(480, 1150), z = rand(-950, -250), p = V3(x, groundAt(x, z), z); fxExplosion(p, 3.6); sndBoom(p, 3); D.smoke.push(smokeColumn(x + rand(-20, 20), z, rand(34, 52), true));
  } });
}
function barrageShell() {
  let x, z; const exposed = !sheltered() && P.alive; const r = Math.random();
  if (exposed && r < 0.28) { const a = rand(0, 6.28), d = rand(7, 24); x = P.pos.x + Math.cos(a) * d; z = P.pos.z + Math.sin(a) * d; }
  else if (r < 0.78) { let k = 0; do { x = rand(-75, 62); z = rand(-95, 92); k++; } while ((!inPoly(x, z, MAOZ) || (!exposed && Math.hypot(x - P.pos.x, z - P.pos.z) < 10)) && k < 30); }
  else { x = rand(-130, 110); z = rand(-260, 260); }
  const eta = 1.1; if (Math.random() < 0.4 && Math.hypot(x - camera.position.x, z - camera.position.z) < 80) sndWhistle(eta);
  DIRQ.push({ at: GAME.t + eta, fn: () => explode(V3(x, groundAt(x, z), z), rand(0.9, 1.3), 9, 110, 'art') });
}
const STRAFE = [];
function strafeRun(tx, tz, delay = 0) {
  const along = Math.random() < 0.55, ang = along ? (Math.random() < 0.5 ? Math.PI / 2 : -Math.PI / 2) + rand(-0.08, 0.08) : rand(-0.35, 0.35), m = new THREE.Mesh(JET_GEO, MAT.jet); SH(m, true, false); m.visible = false; scene.add(m);
  if (along) tx = crestX(tz) + 3.6;
  STRAFE.push({ m, tx, tz, dx: Math.cos(ang), dz: Math.sin(ang), t: -delay, last: -1, bombs: false, heard: false });
  DIRQ.push({ at: GAME.t + delay + 0.3, fn: () => { radio('תצפית', pick(['מטוס בצלילה! לתוך המקורה!', 'מיגים מעל המעוז! לכסות!', 'סוחוי בצלילה עלינו! לרדת!']), 3); hint('air', `<b>מטוס בצלילה!</b> רוצו לקטע המקורה בתעלה (הגג משקי חול)${TOUCH ? '' : ` או כרעו (${K('C')})`}. בשטח פתוח התותחים שלו קורעים הכול.`, 7); } });
}
/* an attacking aircraft is hit: a fireball in the air, and the wreck falls out of the sky (survival: a big bonus) */
function jetKill(j, from = null) {
  if (j.dead) return; j.dead = true; j.vy = rand(2, 6); const p = j.m.position.clone();
  fxExplosion(p, 2.2); sndBoom(p, 1.5); LIGHTS.boom.position.copy(p); LIGHTS.boom.intensity = 60000; FX.boomT = 0; hitmark(true);
  for (let k = 0; k < 10; k++) { const q = FX.dust.get(); q.life = 1.6; const vx = rand(-14, 14), vz = rand(-14, 14); let vy = rand(-2, 14); q.s.position.copy(p); q.s.material.color.set(0x3a3330); q.upd = (o, u, d2) => { vy -= 18 * d2; o.s.position.x += vx * d2; o.s.position.y += vy * d2; o.s.position.z += vz * d2; o.s.scale.setScalar(0.6 + u * 1.2); o.s.material.opacity = 0.9 * (1 - u); }; }
  if (SURV.on) { SURV.bonus += 2000; SURV.planes = (SURV.planes || 0) + 1; feed('מטוס מצרי הופל! בונוס 2,000', 'good'); radio('תצפית', pick(['פגיעה! המטוס בוער ונופל!', 'הפלתם אותו! הוא מתרסק!']), 2.8); }
  else feed('מטוס מצרי הופל!', 'good');
}
function updStrafe(dt) {
  for (let i = STRAFE.length - 1; i >= 0; i--) {
    const j = STRAFE[i]; j.t += dt; if (j.t < 0) continue; const sAl = -950 + 62 * j.t;
    if (j.dead) {
      // hit by the recoilless gun: the aircraft burns, rolls over and goes into the ground
      j.vy -= 11 * dt; j.m.position.x += j.dx * 58 * dt; j.m.position.z += j.dz * 58 * dt; j.m.position.y += j.vy * dt; j.m.rotation.z += dt * 2.2; j.m.rotation.x += dt * 0.9;
      if (Math.random() < dt * 40) { const q = FX.smoke.get(); q.life = 2.4; q.s.position.copy(j.m.position).add(V3(rand(-1, 1), rand(-0.5, 0.5), rand(-1, 1))); q.s.material.color.set(0x1c1a18); q.upd = (o, u) => { o.s.scale.setScalar(2 + u * 7); o.s.material.opacity = 0.7 * (1 - u); }; }
      if (Math.random() < dt * 30) { const q = FX.fire.get(); q.life = 0.5; q.s.position.copy(j.m.position); const sc = rand(2.5, 4.5); q.upd = (o, u) => { o.s.scale.setScalar(sc * (1 - u * 0.4)); o.s.material.opacity = 1 - u; }; }
      const gy = Math.max(groundAt(j.m.position.x, j.m.position.z), 0); if (j.m.position.y < gy + 1.2 || j.t > 200) { const p = j.m.position.clone(); p.y = gy; explode(p, 3.2, 16, 150, 'cannon'); fxExplosion(p, 2.6); sndBoom(p, 1.6); FX.shake = Math.max(FX.shake, clamp(1.4 - camera.position.distanceTo(p) / 120, 0, 0.9)); scene.remove(j.m); STRAFE.splice(i, 1); }
      continue;
    }
    if (sAl > 1300) { scene.remove(j.m); STRAFE.splice(i, 1); continue; }
    const alt = sAl < -60 ? 15 + (-60 - sAl) * 0.11 : 15 + (sAl + 60) * 0.32;
    j.m.visible = true; j.m.position.set(j.tx + j.dx * sAl, groundAt(j.tx, j.tz) + alt, j.tz + j.dz * sAl); j.m.rotation.set(0, Math.atan2(-j.dz, j.dx), 0); j.m.rotateZ(sAl < -60 ? -0.3 : 0.45);
    if (!j.heard) { j.heard = true; sndJet(Math.max(0.5, -sAl / 62)); }
    if (sAl > -430 && sAl < -150 && !j.quiet) {
      // the cannon: shells walk along the ground 300 m ahead of the aircraft
      const u0 = j.last, u1 = sAl + 300; j.last = u1;
      for (let u = Math.max(u0, -140); u < u1; u += 6.5) {
        const lat = rand(-1.6, 1.6), x = j.tx + j.dx * u - j.dz * lat, z = j.tz + j.dz * u + j.dx * lat, p = V3(x, groundAt(x, z), z);
        fxDust(p.clone().add(V3(0, 0.2, 0))); if (onTrench(x, z) < 3.2 && Math.random() < 0.45) bagBurst(p, 2); if (Math.random() < 0.5) fxDust(p.clone().add(V3(rand(-0.5, 0.5), 0.6, rand(-0.5, 0.5)))); if (Math.random() < 0.3) sndShot('mag', p);
        const d = Math.hypot(P.pos.x - x, P.pos.z - z);
        if (d < 2.4 && P.alive && !underRoof() && (!inTrench() || Math.random() < (P.crouch ? 0.15 : 0.5))) hurtPlayer(rand(28, 42), p, true);
        if (d < 6) FX.shake = Math.max(FX.shake, 0.35);
      }
    }
    if (!j.bombs && sAl > -125) { j.bombs = true; if (!j.quiet) dropBombs(j); }
  }
}
function updDirector(dt) {
  updStrafe(dt); airDirector(dt); rowsUpd(dt);
  if (!CINE.on) D.phaseT += dt; { const [k, d] = trK(P.pos.x, P.pos.z); TR.pK = k; TR.pD = d; }
  for (let i = DIRQ.length - 1; i >= 0; i--) if (DIRQ[i] && GAME.t >= DIRQ[i].at) { const q = DIRQ.splice(i, 1)[0]; q.fn(); }
  for (const g of GROUPS) if (!g.go && g.goAt && GAME.t >= g.goAt) { g.go = true; if (GAME.t - (D.chargeMsg || -99) > 20) { D.chargeMsg = GAME.t; radio('תצפית', g.side === 'north' ? 'הם מסתערים על השער הצפוני!' : g.side === 'south' ? 'הם מסתערים מדרום!' : 'הם עולים על הסוללה! מסתערים על המוצב!'); } }
  if (D.phase === 'alert') {
    if (!D.jets && D.phaseT > 0.3) { D.jets = true; airStrike(); radio('חמ״ל', 'כוננות ספיגה! מטוסים מצריים מעל התעלה!'); strafeRun(P.pos.x + 2, P.pos.z - 14, 2.2); }
    if (D.phaseT > BARRAGE_AT) { D.phase = 'barrage'; D.phaseT = 0; D.barT = 0.2; radio('חמ״ל', 'הרעשה ארטילרית על כל הקו! כולם במחסה!'); }
  } else if (D.phase === 'barrage') {
    // the dives come early in the barrage: a run takes 13 s from the first sound to its bombs, and all of them must be over before the guns are manned
    if (!D.s2 && D.phaseT > 0.4) { D.s2 = true; strafeRun(P.pos.x, P.pos.z, 0); } if (!D.s3 && D.phaseT > 1.6) { D.s3 = true; strafeRun(P.pos.x + 1, P.pos.z + 3, 0); }
    D.barT -= dt; if (D.barT <= 0) { D.barT = rand(0.28, 0.75) * (D.phaseT > BARRAGE_LEN - 6 ? 2 : 1); barrageShell(); }
    if (!D.launched && D.phaseT > 3) { D.launched = true; SCENES[0].start(); radio('תצפית', 'סירות יוצאות מהרציף בפורט תאופיק! חותרים אלינו!'); }
    if (!D.r2 && D.phaseT > 7.5) { D.r2 = true; radio('מ״פ', 'כשההרעשה נגמרת, המא״ג המערבי לידך הוא שלך! הסירות כבר במים.', 5.5); }
    if (D.phaseT > BARRAGE_LEN) { friendsToPosts(); TUT.step = 'toMag'; introScene(0, 0.01); for (const j of STRAFE) j.quiet = true; for (const b of AIR.bombs) scene.remove(b.m); AIR.bombs.length = 0; }   // the barrage is over, and so is the air attack: nothing more falls from the sky
  } else if (D.phase === 'intro') {
    if (D.phaseT >= D.introLen) { if (!corridorHas(scCorr(D.scene), P.pos.x, P.pos.z)) moveToScene(D.scene); D.phase = 'scene'; D.phaseT = 0; if (!(D.scene === 0 && D.launched)) SCENES[D.scene].start(); D.artT = rand(diff.art[0], diff.art[1]) * (mzEase() ? mzEase().art : 1); }
  } else if (D.phase === 'scene') {
    if (sceneClear()) D.clearT = (D.clearT || 0) + dt; else D.clearT = 0;
    if (D.clearT > 2.5) {
      D.clearT = 0; feed('כל המצרים באזור חוסלו', 'good');
      if (D.scene >= SCENES.length - 1) { endGame(true); return; }
      feed('השלב הושלם', 'good'); radio('מ״פ', 'השטח נקי. משלימים תחמושת, יש עוד עבודה.'); introScene(D.scene + 1, SCENES[D.scene + 1].medevac ? 3 : 11); return;   /* before the medics' stage only three seconds of quiet, then the shell */
    }
    D.artT -= dt;
    if (D.artT <= 0) { D.artT = rand(diff.art[0], diff.art[1]) * (SCENES[D.scene].medevac ? 0.55 : 1) * (mzEase() ? mzEase().art : 1); const n = Math.floor(rand(3, 6)); for (let i = 0; i < n; i++) DIRQ.push({ at: GAME.t + i * rand(0.6, 1.4), fn: incomingShell }); }
  }
  let inside = 0, inTr = 0; for (const e of UNITS.enemies) if (e.alive) { if (e.inside) inside++; else if (e.state === 'trench') inTr++; } D.inside = inside; D.inTrench = inTr;
  if (inside + inTr > 0) { D.capture = Math.min(100, D.capture + (inside + inTr * 0.25) * diff.cap * (mzEase() ? mzEase().cap : 1) * dt); if (!D.capWarn && inside > 0) { D.capWarn = true; radio('מ״פ', 'הם בתוך המוצב! לנקות את החצר!'); } } else { D.capture = Math.max(0, D.capture - 5 * dt); if (D.capture <= 0) D.capWarn = false; }
  if (D.capture >= 100) endGame(false, 'breach');
}
function incomingShell() {
  const inYard = Math.random() < 0.62; let x, z;
  if (inYard) { do { x = rand(-75, 62); z = rand(-95, 92); } while (!inPoly(x, z, MAOZ)); } else { x = rand(-120, 90); z = rand(-200, 200); }
  const eta = 1.25; if (camera.position.distanceTo(V3(x, 3, z)) < 90) sndWhistle(eta);
  DIRQ.push({ at: GAME.t + eta, fn: () => explode(V3(x, groundAt(x, z), z), 1.1, 9, 110, 'art') });
}
function explode(p, size, radius, dmg, src) {
  fxExplosion(p, size); sndBoom(p, size); propsBlast(p, Math.max(radius * 0.8, 4), 1.2 + size * 0.5);
  const pd = camera.position.distanceTo(p); FX.shake = Math.max(FX.shake, clamp(1.4 - pd / 40, 0, 1.2) * size);
  const pe = playerEye(); const d = Math.hypot(pe.x - p.x, pe.y - 1 - p.y, pe.z - p.z);
  const wallP = FIELDM() && segHitT(p.x, p.y + 0.4, p.z, pe.x, pe.y - 0.4, pe.z, 0.1) >= 0;
  if (d < radius && P.alive && !((src === 'player' || src === 'cannon' || src === 'shell') && P.mode === 'tank') && (d < radius * 0.5 || los(p.x, p.y + 0.6, p.z, pe.x, pe.y, pe.z))) hurtPlayer(dmg * (1 - d / radius) * (P.crouch ? 0.8 : 1) * (sheltered() ? 0.08 : 1) * (wallP ? 0.12 : 1), p, true);
  const own = src === 'player' || src === 'cannon';
  // our blasts wreck vehicles: a recoilless round or a bomb kills anything, a grenade kills a jeep and only scratches a tank
  if (own) for (const v of VEH) { if (v.mode !== MODE || v.side !== 'e' || !v.alive || !v.g.visible) continue; const dv = Math.hypot(v.g.position.x - p.x, v.g.position.z - p.z); if (dv < radius * 0.9 + 2.5) vehHit(v, src === 'cannon' || size >= 2.5 ? 200 : v.heavy ? 12 : 60, p); }
  if (own || src === 'shell') for (const e of UNITS.enemies) { if (!e.alive) continue; const de = e.pos.distanceTo(p); if (de < radius * 2.6) supPin(e, 0.9 * (1 - de / (radius * 2.6))); if (src === 'shell' && de >= radius && de < radius * 2.4 && e.sz === 'win') { e.peek = false; e.cyc = rand(2.2, 3.6); } if (FIELDM() && de > 1.2 && src !== 'shell') { const c = e.chest(); if (segHitT(p.x, p.y + 0.4, p.z, c.x, c.y, c.z, 0.1) >= 0) continue; } if (de < radius * 0.75 || (de < radius && Math.random() < 0.5)) { killEnemy(e, false); hitmark(true); } }
  if (own) for (const bt of BOATS) { if (bt.dead || !bt.g.visible) continue; bt.seats.forEach((s, i) => { if (s.alive && !s.gone && bt.seatWorld(i).distanceTo(p) < radius * 0.7) killSeat(bt, i); }); if (bt.g.position.distanceTo(p) < radius * 0.6) bt.hp -= 300; }
  for (const f of FRIENDS) { if (f.state !== 'post' && f.state !== 'follow') continue; const df = f.unit.pos.distanceTo(p); if (FIELDM() && df > 1.2) { const c = f.unit.chest(); if (segHitT(p.x, p.y + 0.4, p.z, c.x, c.y, c.z, 0.1) >= 0) continue; } if (df < radius * 0.55 && Math.random() < (FIELDM() ? 0.3 : 0.8 * (mzEase() ? mzEase().fHit : 1))) woundFriend(f, df < radius * (FIELDM() ? 0.1 : 0.2)); }
}
const _tw = V3();
function updProjectiles(dt) {
  for (let i = PROJ.length - 1; i >= 0; i--) {
    const q = PROJ[i];
    if (q.type === 'gren') {
      q.v.y -= 9.8 * dt; q.m.rotation.x += dt * 8; q.fuse -= dt;
      { const o = q.m.position, nx = o.x + q.v.x * dt, ny = o.y + q.v.y * dt, nz = o.z + q.v.z * dt;
        if (segHitT(o.x, o.y, o.z, nx, o.y, o.z) >= 0) q.v.x *= -0.35; else o.x = nx;
        if (segHitT(o.x, o.y, o.z, o.x, o.y, nz) >= 0) q.v.z *= -0.35; else o.z = nz;
        if (q.v.y > 0 && segHitT(o.x, o.y, o.z, o.x, ny + 0.1, o.z) >= 0) q.v.y *= -0.3; else o.y = ny; }
      const g = Math.max(hAt(q.m.position.x, q.m.position.z, q.m.position.y + 0.3), -0.3);
      if (q.m.position.y < g + 0.05) { q.m.position.y = g + 0.05; q.v.y = Math.abs(q.v.y) * 0.3; q.v.x *= 0.55; q.v.z *= 0.55; if (Math.abs(q.v.y) < 0.6) q.v.y = 0; }
      if (q.marker) { const dd = camera.position.distanceTo(q.m.position); q.marker.position.copy(q.m.position).add(V3(0, 0.6, 0)); q.marker.visible = dd < 14; if (dd < 10) hint('gren', `רימון! התרחקו מהסימן ⚠ או קפצו לתוך בונקר.`, 4); }
      if (q.fuse <= 0) { explode(q.m.position.clone(), 0.8, 8.5, 130, q.owner); scene.remove(q.m); if (q.marker) scene.remove(q.marker); PROJ.splice(i, 1); }
    } else if (q.type === 'atgm') { if (updAtgm(q, dt)) { scene.remove(q.m); PROJ.splice(i, 1); }
    } else if (q.type === 'smokeg') { if (updSmokeGren(q, dt)) { scene.remove(q.m); PROJ.splice(i, 1); }
    } else if (q.type === 'rocket') {
      q.m.position.addScaledVector(q.v, dt); q.life -= dt; q.age = (q.age || 0) + dt; if (q.fl) q.fl.scale.setScalar(0.42 + Math.random() * 0.3);   // the motor's flame flickers
      if (Math.random() < dt * 90) { const s = FX.smoke.get(); s.life = 2.2; s.s.position.copy(q.m.position); s.s.material.color.set(0xa8a49a); s.upd = (qq, u) => { qq.s.scale.setScalar(0.5 + u * 3); qq.s.material.opacity = 0.7 * (1 - u); }; }
      const p = q.m.position;
      if (FIELDM() && q.owner === 'e' && TANK.alive && TANK.g && TANK.g.visible && p.distanceTo(tankTurretWorld(_tw)) < 3.0) { tankHit(p.clone(), false, null, p.clone().addScaledVector(q.v, -1)); scene.remove(q.m); PROJ.splice(i, 1); continue; }
      if (q.owner === 'e') { let hv = null; for (const v of VEH) if (v.rpgHit && v.alive && v.mode === MODE && v.g.visible && Math.hypot(p.x - v.g.position.x, p.z - v.g.position.z) < 3.6 && p.y < v.g.position.y + v.half[1] + 1.2) { hv = v; break; } if (hv) { vehHit(hv, hv.rpgHit, p); fxExplosion(p.clone(), 1.0); sndBoom(p, 1.0); FX.shake = Math.max(FX.shake, 0.3); scene.remove(q.m); PROJ.splice(i, 1); continue; } }
      const hitT = p.distanceTo(q.target) < 2.5 || (q.age > 0.05 && p.y < hAt(p.x, p.z, p.y) + 0.2);   // armed after a few metres
      if (hitT || q.life <= 0) { explode(p.clone(), 0.9, FIELDM() ? 5.5 : 7, FIELDM() ? 75 : 140, 'rpg'); scene.remove(q.m); PROJ.splice(i, 1); }
    }
  }
}

/* ================= player actions ================= */
function moving() { const k = INPUT.keys; return !!(k.KeyW || k.KeyA || k.KeyS || k.KeyD || k.ArrowUp || k.ArrowDown || k.ArrowLeft || k.ArrowRight || Math.hypot(INPUT.joy.x, INPUT.joy.y) > 0.2); }
function hurtPlayer(dmg, from, splash = false) {
  if (!P.alive || GAME.state !== 'play' || CINE.on) return;
  { const mz = mzEase(); if (mz) dmg *= mz.dmg; }
  if (!GOD()) P.hp -= dmg; P.lastHit = GAME.t; sndHurt(); $('#flashHit').style.opacity = String(clamp(dmg / 40, 0.2, 0.8));
  showDmgDir(from);
  if (P.hp <= 0) { P.hp = 0; P.alive = false; endGame(false, 'dead'); }
}
const dmgEls = []; for (let i = 0; i < 4; i++) { const b = document.createElement('b'); $('#dmg').appendChild(b); dmgEls.push({ b, t: 0 }); }
function showDmgDir(from) {
  const heading = -P.yaw; const ang = Math.atan2(from.x - P.pos.x, -(from.z - P.pos.z)); const rel = THREE.MathUtils.radToDeg(wrapPi(ang - heading));
  const d = dmgEls.reduce((a, b) => (a.t < b.t ? a : b)); d.t = GAME.t; d.b.style.transform = `rotate(${rel}deg)`; d.b.style.transition = 'none'; d.b.style.opacity = '1';
  requestAnimationFrame(() => { d.b.style.transition = 'opacity 1.1s'; d.b.style.opacity = '0'; });
}
function hitmark(kill) { const h = $('#hitm'); h.className = 'hud' + (kill ? ' kill' : ''); h.style.opacity = '1'; clearTimeout(hitmark.t); hitmark.t = setTimeout(() => (h.style.opacity = '0'), 160); if (AUD.ctx) nz(AUD.ctx.currentTime, 0.05, { f: kill ? 900 : 2400, q: 4, vol: 0.18 }); }
const _fw = V3();
function playerShoot() {
  P.shotT = GAME.t;   /* the men hiding nearby hear it */
  if (P.mode === 'tank') return tankMG();
  if (P.mode === 'mag') return magShoot();
  if (P.mode === 'rifle' && P.ride && P.ride.mg) return rideMG();
  if (P.mode !== 'rifle' || P.reloadT > 0 || P.fireCd > 0 || P.throwT > 0 || INPUT.keys.ShiftLeft && moving()) return;
  if (P.mag <= 0) { sndClick(900, 0.2); P.fireCd = 0.25; if (P.reserve > 0) reload(); return; }
  P.mag--; P.fireCd = 0.12; STATS.shots = (STATS.shots || 0) + 1;
  const spread = (lerp(0.03, 0.0035, P.ads) + (moving() ? 0.02 : 0) + P.recoil * 0.2) * (P.crouch ? 0.7 : 1);
  let d = camForward(_fw).clone(); if (TOUCH || FIELDM()) d = aimAssist(camera.position, d, TOUCH ? 0.06 : FIELDM() ? 0.05 : 0.015, false); d.x += rand(-spread, spread); d.y += rand(-spread, spread); d.z += rand(-spread, spread); d.normalize();
  const o = camera.position.clone(); const hit = castShot(o, d, 700, 'f');
  P.kick = 1; P.recoil = Math.min(P.recoil + 0.35, 1); P.pitch += 0.016 + rand(0, 0.006); P.yaw += rand(-0.005, 0.005);
  vmFlash.visible = true; vmFlash.material.rotation = Math.random() * 6; setTimeout(() => (vmFlash.visible = false), 40); vmMuzzle.intensity = 6; LIGHTS.muzzle.position.copy(o).addScaledVector(d, 1.2); LIGHTS.muzzle.intensity = 700;
  sndShot('fal');
  applyHit(hit, 105);
}
function rideMG() {
  if (P.fireCd > 0) return; P.fireCd = 0.095; STATS.shots = (STATS.shots || 0) + 1;
  let d = aimAssist(camera.position, camForward(V3()), 0.1, false); const sp = 0.007; d.x += rand(-sp, sp); d.y += rand(-sp, sp); d.z += rand(-sp, sp); d.normalize();
  const hit = castShot(camera.position.clone(), d, 700, 'f'), from = P.ride.muzzle ? P.ride.muzzle() : camera.position.clone().addScaledVector(d, 1.2).add(V3(0, -0.3, 0));
  fxMuzzle(from, true); sndShot('mag'); if (Math.random() < 0.45) fxTracer(from, hit.p, false); FX.shake = Math.max(FX.shake, 0.08); P.pitch += 0.0025; P.yaw += rand(-0.002, 0.002); P.vmKick = 1;
  applyHit(hit, 140);
}
/* ================= the marks rounds leave =================
   Every round that strikes a wall, a sandbag, a door, a piece of furniture leaves its hole there - dark in the middle, a ring of chipped
   plaster or splintered wood, dust round it - turned to the face it struck, and it stays (when there are too many the oldest go). Small
   things struck, or beside the strike, jump off */
const HOLES = { n: 0, max: LITE ? 180 : 420, mesh: null, m4: new THREE.Matrix4(), q: new THREE.Quaternion(), q2: new THREE.Quaternion(), z: V3(0, 0, 1) };
function holeTex() {
  const N = 128, c = canvas(N), g = c.getContext('2d'), r = rng(7713), C = N / 2;
  let gr = g.createRadialGradient(C, C, 4, C, C, C); gr.addColorStop(0, 'rgba(34,29,24,0.75)'); gr.addColorStop(0.45, 'rgba(62,55,46,0.38)'); gr.addColorStop(1, 'rgba(70,62,52,0)'); g.fillStyle = gr; g.fillRect(0, 0, N, N);   /* the dust and the scorch round it */
  g.fillStyle = 'rgba(205,196,180,0.75)'; g.beginPath(); for (let a = 0; a <= 6.3; a += 0.3) { const rr = 18 + r() * 10; g.lineTo(C + Math.cos(a) * rr, C + Math.sin(a) * rr); } g.fill();   /* the chipped ring, lighter */
  g.strokeStyle = 'rgba(30,26,22,0.6)'; g.lineWidth = 1.2; for (let k = 0; k < 6; k++) { let a = r() * 6.28, x = C + Math.cos(a) * 13, y = C + Math.sin(a) * 13; g.beginPath(); g.moveTo(x, y); for (let j = 0; j < 4; j++) { a += (r() - 0.5) * 0.7; x += Math.cos(a) * (5 + r() * 6); y += Math.sin(a) * (5 + r() * 6); g.lineTo(x, y); } g.stroke(); }   /* cracks */
  gr = g.createRadialGradient(C, C, 0, C, C, 15); gr.addColorStop(0, 'rgba(4,3,2,1)'); gr.addColorStop(0.75, 'rgba(14,12,10,0.97)'); gr.addColorStop(1, 'rgba(30,26,22,0)'); g.fillStyle = gr; g.beginPath(); g.arc(C, C, 15, 0, 6.2832); g.fill();   /* the hole */
  return tex(c);
}
function holesInit() {
  const m = new THREE.MeshStandardMaterial({ map: holeTex(), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3, roughness: 0.95, metalness: 0 });
  const im = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), m, HOLES.max); im.count = 0; im.frustumCulled = false; im.renderOrder = 2; scene.add(onLayer1(im)); HOLES.mesh = im;
}
function bulletHole(p, n, size = rand(0.16, 0.22)) {
  if (!HOLES.mesh) holesInit(); const H = HOLES, i = H.n % H.max; H.n++;
  H.q.setFromUnitVectors(H.z, n); H.q2.setFromAxisAngle(H.z, rand(0, 6.28)); H.q.multiply(H.q2);
  H.m4.compose(V3(p.x + n.x * 0.02, p.y + n.y * 0.02, p.z + n.z * 0.02), H.q, V3(size, size, 1));   /* 2 cm off the face: the far depth buffer cannot tell less */ H.mesh.setMatrixAt(i, H.m4); H.mesh.count = Math.min(H.n, H.max); H.mesh.instanceMatrix.needsUpdate = true;
}
/* chips: bits of the plaster, the concrete, the wood a round knocks off, thrown out of the face it struck, falling and skittering on the floor */
const CHIPS = { max: LITE ? 140 : 300, n: 0, mesh: null, st: [], m4: new THREE.Matrix4(), q: new THREE.Quaternion(), e: new THREE.Euler(), c: new THREE.Color() };
function chipsAt(p, n) {
  const C = CHIPS; if (!C.mesh) { const im = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ roughness: 0.9 }), C.max); im.count = C.max; im.frustumCulled = false; for (let i = 0; i < C.max; i++) { im.setMatrixAt(i, C.m4.makeScale(0, 0, 0)); im.setColorAt(i, C.c.set(0xcfc6b4)); C.st.push({ life: 0 }); } scene.add(onLayer1(im)); C.mesh = im; }
  const fl = hAt(p.x + n.x * 0.4, p.z + n.z * 0.4, p.y), k = LITE ? 6 : 10;
  for (let j = 0; j < k; j++) { const i = C.n++ % C.max, s = C.st[i];
    Object.assign(s, { x: p.x + n.x * 0.03, y: p.y + n.y * 0.03, z: p.z + n.z * 0.03, vx: n.x * rand(1.5, 4) + rand(-1.4, 1.4), vy: n.y * rand(1.5, 3) + rand(0.5, 2.6), vz: n.z * rand(1.5, 4) + rand(-1.4, 1.4), life: rand(1.2, 2.4), sz: rand(0.008, 0.026), rx: rand(0, 6), ry: rand(0, 6), w: rand(-14, 14), floor: fl + 0.01 });
    C.mesh.setColorAt(i, C.c.set(j % 3 ? 0xd2c9b6 : 0x7c7468)); }
  C.mesh.instanceColor.needsUpdate = true;
}
function chipsUpd(dt) {
  const C = CHIPS; if (!C.mesh) return; let any = false;
  for (let i = 0; i < C.max; i++) { const s = C.st[i]; if (s.life <= 0) continue; any = true; s.life -= dt;
    if (s.life <= 0) { C.mesh.setMatrixAt(i, C.m4.makeScale(0, 0, 0)); continue; }
    s.vy -= 9.8 * dt; s.x += s.vx * dt; s.y += s.vy * dt; s.z += s.vz * dt; s.rx += s.w * dt; s.ry += s.w * 0.7 * dt;
    if (s.y < s.floor) { s.y = s.floor; s.vy *= -0.3; s.vx *= 0.55; s.vz *= 0.55; s.w *= 0.5; }
    C.q.setFromEuler(C.e.set(s.rx, s.ry, 0)); C.m4.compose(_hdc.set(s.x, s.y, s.z), C.q, _hds.set(s.sz, s.sz * 0.6, s.sz)); C.mesh.setMatrixAt(i, C.m4); }
  if (any) C.mesh.instanceMatrix.needsUpdate = true;
}
const _hdc = V3(), _hds = V3();
function holesClear() { HOLES.n = 0; if (HOLES.mesh) HOLES.mesh.count = 0; }
/* the face of a box a round struck: the side nearest the point (its top, or one of its four sides), turned toward the shooter */
function colNormal(k, p, dir) {
  const dx = p.x - k.x, dz = p.z - k.z, lx = dx * k.c - dz * k.s, lz = dx * k.s + dz * k.c, ex = k.hx - Math.abs(lx), ez = k.hz - Math.abs(lz), ey = Math.abs(k.top - p.y);
  let n; if (ey < ex && ey < ez) n = V3(0, 1, 0); else if (ex < ez) { const sx = Math.sign(lx) || 1; n = V3(k.c * sx, 0, -k.s * sx); } else { const sz = Math.sign(lz) || 1; n = V3(k.s * sz, 0, k.c * sz); }
  if (dir && n.dot(dir) > 0) n.negate(); return n;
}
function propsNear(p, R, dir) { if (typeof PROPS === 'undefined') return; for (const it of PROPS.items) { if (it.mode !== PROPS.cur) continue; const d = Math.hypot(it.x - p.x, it.y + it.L.h * 0.5 - p.y, it.z - p.z); if (d < R) propKick(it, dir, 1.6 * (1 - d / R) + 0.5); } }
function applyHit(hit, dmg) {
  if (hit.o) suppressAlong(hit.o, hit.p, dmg > 120 ? 1.5 : 1);   // every round of ours pins the men it cracks past
  if (hit.kind === 'enemy') { const e = hit.u; const dd = hit.head ? dmg * 2.5 : dmg; e.hp -= dd; const kill = e.hp <= 0; if (kill) killEnemy(e, hit.head); hitmark(kill); fxDust(hit.p.clone(), false); if (e.dormant || kill) wakeNear(e.pos, 9); }
  else if (hit.kind === 'seat') { killSeat(hit.boat, hit.seat); hitmark(true); }
  else if (hit.kind === 'boat') { hit.boat.hp -= dmg * 0.2; fxDust(hit.p.clone(), true); hitmark(false); }
  else if (hit.kind === 'friend') { toast('זהירות', 'אש על כוחותינו'); }
  else if (hit.kind === 'veh') { if (hit.v.alive && hit.v.armor > 0) { vehHit(hit.v, dmg * hit.v.armor, hit.p); hitmark(!hit.v.alive); } fxDust(hit.p.clone(), false); }
  else if (hit.kind === 'prop') { const dir = hit.dir || V3(0, 0, 1); propKick(hit.prop, dir, 1.7); propsNear(hit.p, 0.4, dir); fxDust(hit.p.clone(), false); }
  else if (hit.kind === 'wall') { const n = hit.k ? colNormal(hit.k, hit.p, hit.dir) : null; if (n) { bulletHole(hit.p, n); chipsAt(hit.p, n); } fxDust(hit.p.clone().addScaledVector(n || V3(0, 1, 0), 0.08), false); propsNear(hit.p, 0.35, hit.dir || V3(0, 0, 1)); }
  else if (hit.kind === 'ground' || hit.kind === 'water') fxDust(hit.p.clone().add(V3(0, 0.15, 0)), hit.kind === 'water');
}
function magShoot() {
  const m = P.post.mag; if (m.big) { survCannonShoot(); return; } if (m.reload > 0 || P.fireCd > 0) return;
  const hv = !!m.heavy;
  if (m.belt <= 0 && !SURV.on) { m.reload = hv ? 5.5 : 4.5; feed(hv ? 'מחליף ארגז' : 'מחליף שרשרת'); return; }
  if (!SURV.on) m.belt--; P.fireCd = hv ? 0.118 : 0.085; m.feedT = 1;   /* the belt jumps one link toward the gun */
  // the rounds go where the gunner looks - over the gun, or along its sights when he aims - with the spread of a machine gun on a bipod and
  // its climb: hits come from keeping the bursts short and walking them on, not from the gun finding the target for him
  let d = camForward(V3()); const sp = (hv ? 0.019 : 0.015) * (1 - 0.35 * P.ads); P.vmKick = 1; d.x += rand(-sp, sp); d.y += rand(-sp, sp); d.z += rand(-sp, sp); d.normalize();
  const from = m.pivot.localToWorld(V3(0, 0.012, hv ? 1.3 : 0.9));
  const hit = castShot(camera.position.clone(), d, hv ? 1100 : 800, 'f');
  if (m.belt % (hv ? 2 : 3) === 0) fxTracer(from, hit.p, false);
  fxMuzzle(from, true); LIGHTS.muzzle.position.copy(from); LIGHTS.muzzle.intensity = hv ? 1800 : 900; sndShot('mag'); if (hv) sndBoom(from, 0.14); FX.shake = Math.max(FX.shake, hv ? 0.24 : 0.12);
  P.pitch += hv ? 0.01 : 0.0065; P.yaw += rand(-0.005, 0.005) * (hv ? 1.6 : 1);
  applyHit(hit, hv ? 240 : 80);
  // a .50 round goes through the first man and on into the next, and tears up the sand where it lands
  if (hv) { if (hit.kind === 'enemy') { const h2 = castShot(hit.p.clone().addScaledVector(d, 0.7), d, 14, 'f'); if (h2.kind === 'enemy') applyHit(h2, 160); } if (hit.kind === 'ground' || hit.kind === 'enemy' || !hit.kind) { const q = hit.p.clone(); fxDust(q); fxDust(q.clone().add(V3(rand(-0.4, 0.4), 0.3, rand(-0.4, 0.4)))); } }
}
const RELOAD_T = 3.45;   // the magazine change, unhurried
function reload() { if (P.mode !== 'rifle' || P.reloadT > 0 || P.mag >= 20 || P.reserve <= 0) { if (P.mode === 'mag' && P.post.mag.belt < (P.post.mag.cap || 200) && P.post.mag.reload <= 0) P.post.mag.reload = P.post.mag.heavy ? 5.5 : 4.5; return; } P.reloadT = RELOAD_T; sndClick(1200, 0.15); setTimeout(() => sndClick(700, 0.2), 1350); setTimeout(() => sndClick(1500, 0.2), 2700); }
function throwPlayerGrenade() {
  if (P.mode === 'tank') return tankMainGun();
  if (P.mode !== 'rifle' || P.gren <= 0 || P.throwT > 0 || P.reloadT > 0) return; P.gren--; P.throwT = 0.7;
  const f = camForward(V3()); const from = camera.position.clone().addScaledVector(f, 0.6); throwGrenade(from, f.multiplyScalar(17).add(V3(0, 3.5, 0)), 'player');
}
function nearest(list, r) { let best = null, bd = r; for (const it of list) { const d = Math.hypot(it.x - P.pos.x, it.z - P.pos.z); if (d < bd) { bd = d; best = it; } } return best; }
let promptState = null;
// a chapter's own action with no short label of its own: the button says its first word ("להעלות", "לשחרר"...)
const promptLabel = (t) => (t || '').replace(/<kbd>[^<]*<\/kbd>/g, '').replace(/<[^>]*>/g, '').trim().split(/\s+/)[0] || 'פעולה';
function interactions() {
  promptState = null;
  if (P.mode === 'tank' && CH() && CH().tankPrompt) { promptState = CH().tankPrompt(); return; }
  if (P.mode === 'tank') { promptState = { text: `<kbd>E</kbd> ${P.crouch ? 'לצאת מהצריח (מקלע)' : 'להיכנס לצריח (מחסה)'}`, act: 'duck' }; return; }
  if (P.mode === 'mag') { promptState = { text: P.post.mag.big ? '<kbd>E</kbd> לעזוב את התותח' : SURV.on ? '<kbd>E</kbd> לעזוב את המא״ג' : '<kbd>E</kbd> לעזוב את המא״ג · <kbd>R</kbd> החלפת שרשרת' }; return; }
  if (CH() && CH().prompt) { const ps = CH().prompt(); if (ps) { promptState = ps; return; } }
  if (P.mode === 'carry') {
    if (Math.hypot(AIDPOST.x - P.pos.x, AIDPOST.z - P.pos.z) < 3.2) promptState = { text: `<kbd>E</kbd> להשכיב את ${P.carrying.name} בתאג״ד`, act: 'drop-aid' };
    else promptState = { text: `<kbd>E</kbd> להוריד את ${P.carrying.name}`, act: 'drop' };
    return;
  }
  const wounded = FRIENDS.filter((f) => f.state === 'wounded' || f.state === 'stable').map((f) => ({ x: f.unit.pos.x, z: f.unit.pos.z, f }));
  const w = nearest(wounded, 2.6);
  if (w) {
    if (w.f.state === 'wounded') promptState = { text: `החזיקו <kbd>F</kbd> לעזרה ראשונה ל${w.f.name}`, hold: true, f: w.f };
    else promptState = { text: `<kbd>E</kbd> להרים את ${w.f.name} ולסחוב ${(CH() && CH().stableTag && CH().stableTag(w.f)) || 'לתאג״ד'}`, act: 'lift', f: w.f };
    return;
  }
  const mg = nearest(POSTS.filter((p) => p.mag && (!p.survOnly || SURV.on) && (!p.occupant || p.occupant === 'player')).map((p) => ({ x: p.stand[0], z: p.stand[1], p })), 2.4);
  if (mg) { promptState = { text: `<kbd>E</kbd> לאייש את ה${mg.p.name}`, act: 'man', post: mg.p }; return; }
  const ammoPts = [DOORS.ammo, ...DUGOUTS.filter((d) => d.refill), ...POSTS.map((p) => ({ x: p.stand[0], z: p.stand[1] }))];
  if (nearest(ammoPts, 3) && (P.reserve < 160 || P.gren < 4)) promptState = { text: '<kbd>E</kbd> למילוי תחמושת ורימונים', act: 'ammo' };
}
function doAction() {
  const s = promptState;
  if (P.mode === 'tank' && CH() && CH().tankAct) { CH().tankAct(); return; }
  if (P.mode === 'tank') { P.crouch = !P.crouch; sndClick(500, 0.2); return; }
  if (P.mode === 'mag') { leaveMag(); return; }
  if (s && s.fn) { s.fn(); return; }
  if (!s || !s.act) return;
  if (s.act === 'man') manMag(s.post);
  else if (s.act === 'ammo') { if (P.ammoCd > 0) return; P.reserve = 160; P.gren = diff.gren0; P.ammoCd = 2; feed('תחמושת ורימונים מולאו', 'good'); sndClick(900, 0.25); }
  else if (s.act === 'lift') { P.mode = 'carry'; P.carrying = s.f; s.f.state = 'carried'; s.f.unit.rig.root.visible = false; s.f.marker.visible = false; P.crouch = false; }
  else if (s.act === 'drop' || s.act === 'drop-aid') {
    const f = P.carrying; P.carrying = null; P.mode = 'rifle'; const u = f.unit; u.rig.root.visible = true; u.fall = 1;
    if (s.act === 'drop-aid') { const a = AIDPOST, off = (STATS.saved % 3) * 0.9 - 0.9; u.place(a.x + Math.sin(a.rot) * off, a.z + Math.cos(a.rot) * off, a.y === undefined ? undefined : a.y + 0.2); u.heading = a.rot + Math.PI / 2; f.state = 'saved'; STATS.saved++; feed(`${f.name} בתאג״ד. הרופא מטפל בו`, 'good'); }
    else { u.place(P.pos.x - Math.sin(P.yaw), P.pos.z - Math.cos(P.yaw)); f.state = 'stable'; f.marker.visible = true; }
    u.sync();
  }
}
function manMag(post) { P.mode = 'mag'; P.post = post; post.occupant = 'player'; P.pos.set(post.stand[0], post.g, post.stand[1]); P.yaw = post.mag.pivot.rotation.y + Math.PI; P.pitch = -0.05; P.crouch = false; P.reloadT = 0; sndClick(600, 0.2); 
  if (MODE === 'mezach' && !SURV.on && D.scene === 0 && D.phase === 'scene') mzDroneFilm(); }   // the first gun on the western rampart: the boats, seen up close
function leaveMag() {
  const p = P.post; if (!p) return; p.occupant = null; P.mode = 'rifle'; P.post = null; vm.visible = true;
  let x = p.stand[0] - p.fx * 1.2, z = p.stand[1] - p.fz * 1.2; const [k, d] = trK(p.stand[0], p.stand[1]);
  if (d < 3.6) { const q = TR.pts[k], o = TR.out[k]; x = q[0] + o[0] * 0.45; z = q[1] + o[1] * 0.45; if (blocked(x, z, 0.3, groundAt(x, z))) { x = q[0]; z = q[1]; } }
  P.pos.set(x, groundAt(x, z), z); P.vy = 0;
}

/* ================= player update ================= */
function updPlayer(dt) {
  const k = INPUT.keys;
  P.fireCd -= dt; P.ammoCd -= dt; P.recoil = Math.max(0, P.recoil - dt * 2.2); P.kick = Math.max(0, P.kick - dt * 9);
  if (P.reloadT > 0) { P.reloadT -= dt; if (P.reloadT <= 0) { const need = 20 - P.mag; const got = Math.min(need, P.reserve); P.mag += got; P.reserve -= got; } }
  if (P.throwT > 0) P.throwT -= dt;
  if (P.mode === 'mag' && P.post.mag.reload > 0) { P.post.mag.reload -= dt; if (P.post.mag.reload <= 0) P.post.mag.belt = P.post.mag.cap || 200; }
  if (P.mode === 'mag' && P.post.mag.beltM) { const m = P.post.mag; if (m.feedT > 0 || m.beltShown !== m.belt) { m.feedT = Math.max(0, m.feedT - dt / (m.heavy ? 0.1 : 0.07)); m.beltShown = m.feedT > 0 ? -1 : m.belt; beltPose(m); } }   // the belt feeding, and shortening over the last twenty rounds
  { const mz = mzEase(), rd = mz ? mz.regen[0] : diff.regenD + (FIELDM() ? 0 : 0.5), rr = mz ? mz.regen[1] : FIELDM() ? 30 : 24, rc = mz ? mz.regen[2] : diff.regenCap;   /* healing: sooner and all the way on the easy level, later and only to 60 on the hard one (the stronghold heals faster) */
    if (GAME.t - P.lastHit > rd && P.hp < rc) P.hp = Math.min(rc, P.hp + rr * dt); }
  aimMagnet(dt);
  if (INPUT.fire && !PDOOR.on) { if (P.mode === 'mag' || INPUT.fireEdge || (P.ride && P.ride.mg)) playerShoot(); INPUT.fireEdge = false; }
  // hold F
  if (promptState && promptState.hold && (k.KeyF || INPUT.tHold) && !moving()) {
    P.hold += dt; if (P.hold >= 3) { const f = promptState.f; P.hold = 0; STATS.treated++; STATS.saved++; reviveFriend(f); feed(`${f.name} חבוש. הוא חוזר להילחם`, 'good'); radio(f.name, pick(['תודה. אני בסדר, חוזר לעמדה!', 'חבשת אותי טוב. ממשיכים!', 'כואב, אבל אני יכול לירות.']), 2.6); }
  } else P.hold = 0;
  // movement
  if (!P.ride && P.mode !== 'tank') tpvBody(false);   // his own figure only at a vehicle's gun
  if (P.mode === 'tank') {
    P.ads = clamp(P.ads + ((INPUT.ads || k.KeyQ || INPUT.tAds) ? 1 : -1) * dt * 6, 0, 1);
    if (TANK.free) { TANK.thr = clamp((k.KeyW || k.ArrowUp ? 1 : 0) - (k.KeyS || k.ArrowDown ? 1 : 0) - INPUT.joy.y, -1, 1); TANK.turn = clamp((k.KeyA || k.ArrowLeft ? 1 : 0) - (k.KeyD || k.ArrowRight ? 1 : 0) - INPUT.joy.x, -1, 1); }
    if (INPUT.fire) tankMG(); tankCamera(dt); interactions(); return;
  }
  if (P.mode === 'mag') {
    const m = P.post.mag, lim = m.big ? 2.2 : 1.25; const rel = clamp(wrapPi(P.yaw + Math.PI - m.yaw0), -lim, lim); P.yaw = m.yaw0 + rel - Math.PI; P.pitch = clamp(P.pitch, m.big ? -0.62 : -0.55, 0.3);   // a recoilless gun on its mount swings almost all the way round
    m.pivot.rotation.set(-P.pitch, P.yaw + Math.PI, 0);
    const back = (m.big ? V3(-0.34, 0.4, -0.95) : m.heavy ? V3(0.2, 0.55, -1.25) : V3(0.15, 0.37, -1.22)).applyEuler(new THREE.Euler(-P.pitch * 0.4, P.yaw + Math.PI, 0, 'YXZ'));
    camera.position.copy(m.pivot.position).add(back);
  } else if (P.ride) {
    const rp = P.ride.pos(); P.pos.copy(rp); P.crouch = true; P.sprint = false; const e = playerEye(); if (P.ride.mg || P.ride.novm) vm.visible = false;
    // a touch of third person on a vehicle: just behind and above his helmet (tpvCam); the shot still goes through the crosshair's centre
    const k = P.ads > 0.5 ? 0 : 1 - P.ads * 2; tpvCam(e, k, true); tpvBody(k > 0.3 && !CINE.on, e);
  } else {
    let fwd = (k.KeyW || k.ArrowUp ? 1 : 0) - (k.KeyS || k.ArrowDown ? 1 : 0) - INPUT.joy.y, str = (k.KeyD || k.ArrowRight ? 1 : 0) - (k.KeyA || k.ArrowLeft ? 1 : 0) + INPUT.joy.x;
    if (PDOOR.on) { fwd = 0; str = 0; }   /* the player at a door: his feet are the scene's (pdoorMove) */
    const l = Math.hypot(fwd, str); if (l > 1) { fwd /= l; str /= l; }
    const sprint = (k.ShiftLeft || k.ShiftRight || l > 0.95 && TOUCH && Math.hypot(INPUT.joy.x, INPUT.joy.y) > 0.95) && fwd > 0 && P.mode === 'rifle' && !P.crouch;
    const sp = P.mode === 'carry' ? 2.7 : P.crouch ? 2.2 : sprint ? 6.8 : 4.4;
    const sy = Math.sin(P.yaw), cy = Math.cos(P.yaw);
    // the body has weight: it picks up speed over a few frames and stops over a few more, instead of jumping to full pace
    const wx = (-sy * fwd + cy * str) * sp, wz = (-cy * fwd - sy * str) * sp, acc = (l > 0.05 ? 28 : 36) * dt;
    const ap = (a, b) => (Math.abs(b - a) <= acc ? b : a + Math.sign(b - a) * acc);
    P.vx = ap(P.vx || 0, wx); P.vz = ap(P.vz || 0, wz);
    const dx = P.vx * dt, dz = P.vz * dt;
    const inside = MODE === 'mezach' && inStage(P.pos.x, P.pos.z);
    const ok = (x, z) => { if (inside && !inStage(x, z)) { hint('bounds', 'הקרב שלכם בקטע התעלה הזה (מסומן בצהוב במפה הקטנה). אי אפשר לעזוב אותו עד שכל המצרים בו מתים.', 6); P.bumpT = 0.6; return false; } if (FIELDM() && !laneOk(x, z)) { P.bumpT = 0.6; return false; } return (groundAt(x, z) > -0.3 || hAt(x, z, P.pos.y) > -0.3) && !blocked(x, z, 0.3, P.pos.y); };
    const x0 = P.pos.x, z0 = P.pos.z;
    // a long frame (a phone that stutters) is walked in short steps, so a sandbag wall is never crossed or entered in one jump
    const nSub = Math.max(1, Math.ceil(Math.hypot(dx, dz) / 0.12)), sdx = dx / nSub, sdz = dz / nSub;
    for (let si = 0; si < nSub; si++) { if (ok(P.pos.x + sdx, P.pos.z)) P.pos.x += sdx; else { P.vx *= 0.2; break; } } for (let si = 0; si < nSub; si++) { if (ok(P.pos.x, P.pos.z + sdz)) P.pos.z += sdz; else { P.vz *= 0.2; break; } }
    { const want = Math.hypot(dx, dz), got = Math.hypot(P.pos.x - x0, P.pos.z - z0); if (want > 1e-4 && got < want * 0.35) { const px = -dz / want, pz = dx / want; for (const sg of [1, -1]) { const sx = P.pos.x + px * sg * want * 0.9, sz = P.pos.z + pz * sg * want * 0.9; if (ok(sx, sz) && ok(sx + dx, sz + dz)) { P.pos.x = sx; P.pos.z = sz; break; } } } }
    if (PDOOR.on) pdoorMove(dt);
    // caught inside a wall or a sandbag heap (a slope that led into it, a step down off it): ease out to the nearest free ground instead of freezing
    if (blocked(P.pos.x, P.pos.z, 0.3, P.pos.y)) { P.stuckT = (P.stuckT || 0) + dt; let best = null, bd = 1e9; for (let rr = 0.25; rr <= 2.6 && !best; rr += 0.25) for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2, x = P.pos.x + Math.cos(a) * rr, z = P.pos.z + Math.sin(a) * rr; if (groundAt(x, z) > -0.3 && !blocked(x, z, 0.32, P.pos.y) && !blocked(x, z, 0.32, hAt(x, z, P.pos.y))) { const d = Math.abs(hAt(x, z, P.pos.y) - P.pos.y) * 2 + rr; if (d < bd) { bd = d; best = [x, z]; } } }
      if (best) { const k = Math.min(1, dt * 8 + (P.stuckT > 0.45 ? 1 : 0)); P.pos.x += (best[0] - P.pos.x) * k; P.pos.z += (best[1] - P.pos.z) * k; } } else P.stuckT = 0;
    const ground = hAt(P.pos.x, P.pos.z, P.pos.y);
    const vyBefore = P.vy; P.vy -= 9.8 * dt; P.pos.y += P.vy * dt; if (P.pos.y <= ground) { if (!P.grounded && vyBefore < -2.5) P.land = Math.min(0.16, -vyBefore * 0.035); P.pos.y = ground; P.vy = 0; P.grounded = true; }
    // the walk: the eye rises and dips with each step and sways a little to the side; the amount follows the real speed
    const speed = Math.hypot(P.vx, P.vz), ms = Math.hypot(P.pos.x - x0, P.pos.z - z0) / Math.max(dt, 1e-4);
    const ampW = P.grounded && ms > 0.3 ? clamp(ms / 4.4, 0, 1.6) : 0; P.bobAmp = (P.bobAmp || 0) + (ampW - (P.bobAmp || 0)) * (1 - Math.exp(-dt * 9));
    if (P.grounded) P.bob += dt * Math.max(ms, 0.001) * 1.95;
    P.land = Math.max(0, (P.land || 0) * Math.exp(-dt * 7) - dt * 0.02);
    // the crouch has weight: the eye drops quickly and settles with a small overshoot (a spring), the head nods into the drop and comes up with the rise
    { const want = P.mode === 'carry' ? 0.33 : P.crouch ? 1 : 0, w = 15, acc = w * w * (want - (P.crK || 0)) - 1.5 * w * (P.crV || 0);
      P.crV = REDUCED ? 0 : (P.crV || 0) + acc * dt; P.crK = REDUCED ? want : clamp((P.crK || 0) + P.crV * dt, -0.06, 1.1); P.eyeH = 1.65 - 0.6 * P.crK; }
    const amp = REDUCED ? 0 : P.bobAmp * (1 - 0.3 * clamp(P.crK, 0, 1)), bobY = Math.sin(P.bob * 2) * 0.022 * amp - P.land, bobX = Math.sin(P.bob) * 0.016 * amp;
    camera.position.set(P.pos.x + cy * bobX, P.pos.y + P.eyeH + bobY, P.pos.z - sy * bobX);
    P.strafe = P.vx * cy - P.vz * sy; P.roll = REDUCED ? 0 : Math.sin(P.bob) * 0.011 * amp - P.strafe / 6.8 * 0.02 + (P.crV || 0) * 0.004;
    P.sprint = sprint; void speed;
  }
  const sh = FX.shake; FX.shake = Math.max(0, FX.shake - dt * 1.8);
  const crNod = P.mode === 'rifle' || P.mode === 'carry' ? -(P.crV || 0) * 0.012 : 0;
  camera.rotation.set(P.pitch + crNod + (sh ? rand(-sh, sh) * 0.03 : 0), P.yaw + (sh ? rand(-sh, sh) * 0.02 : 0), P.mode === 'rifle' || P.mode === 'carry' ? (P.roll || 0) : 0, 'YXZ');
  // ads & fov
  const wantAds = (INPUT.ads || k.KeyQ || INPUT.tAds) && ((P.mode === 'rifle' && P.reloadT <= 0 && !P.sprint) || P.mode === 'mag' || !!(P.ride && P.ride.mg));
  P.ads = clamp(P.ads + (wantAds ? 1 : -1) * dt * 7, 0, 1);
  const fov = P.mode === 'mag' ? lerp(62, P.post && P.post.mag && P.post.mag.big ? 24 : 30, P.ads) : lerp(P.ride ? rideFov() : footFov(), P.ride && P.ride.mg ? 30 : FIELDM() ? 32 : 40, P.ads);   /* the guns on the rampart have their sight too: twice as close, the men in the boats plain to see */ if (Math.abs(camera.fov - fov) > 0.05) { camera.fov = fov; camera.updateProjectionMatrix(); }
  // viewmodel
  // the rifle has inertia: it lags a little behind a turn of the head, swings with the stride and settles into the sprint carry over a few frames
  { const dy = wrapPi(P.yaw - (P.pyaw ?? P.yaw)), dp = P.pitch - (P.ppitch ?? P.pitch); P.pyaw = P.yaw; P.ppitch = P.pitch; const kq = 1 - Math.exp(-dt * 9);
    P.swx = (P.swx || 0) + (clamp(-dy * 1.1, -0.045, 0.045) - (P.swx || 0)) * kq; P.swy = (P.swy || 0) + (clamp(dp * 0.9, -0.04, 0.04) - (P.swy || 0)) * kq;
    P.sprintK = (P.sprintK || 0) + ((P.sprint ? 1 : 0) - (P.sprintK || 0)) * (1 - Math.exp(-dt * 8)); }
  const vp = vmHip(vmCamera.aspect).lerp(VM_ADS, P.ads), vfit = vmFit(vmCamera.aspect), amp = (REDUCED ? 0 : (P.bobAmp || 0)) * (1 - P.ads * 0.85), sk = P.sprintK || 0, sw = 1 - P.ads * 0.8;
  // a reload brings the rifle up toward the middle and rolls it over so the magazine well faces the eye, then puts it back
  const ru = P.reloadT > 0 ? clamp(1 - P.reloadT / RELOAD_T, 0, 1) : -1, renv = ru < 0 ? 0 : smooth(0, 0.14, ru) * (1 - smooth(0.84, 1, ru));
  vp.z += P.kick * 0.045 * (1 - 0.75 * P.ads) + 0.02 * renv; vp.x -= 0.075 * renv; vp.y += 0.075 * renv + Math.sin(P.bob * 2) * 0.007 * amp - Math.abs(Math.cos(P.bob)) * 0.003 * amp - (P.throwT > 0 ? 0.2 : 0) + (P.swy || 0) * 0.5 * sw;
  vp.x += Math.sin(P.bob) * 0.006 * amp + (P.swx || 0) * 0.6 * sw; vp.x -= 0.05 * sk; vp.y -= 0.05 * sk;
  // going down or coming up, the rifle is pulled in and dips, and cants a little toward the leading hand
  const crv = P.mode === 'rifle' ? (P.crV || 0) * sw : 0, crm = Math.abs(crv); vp.y -= crm * 0.012; vp.z += crm * 0.006; vp.x -= crv * 0.003;
  vm.position.copy(vp); vm.rotation.set(P.kick * 0.07 + 0.12 * renv + (P.swy || 0) * 1.2 * sw - Math.sin(P.bob) * 0.004 * amp - crm * 0.045, 0.5 * sk + VM_YAW * lerp(0.75, 1, vfit) * (1 - P.ads) * (1 - sk) + 0.3 * renv + (P.swx || 0) * 1.5 * sw - crv * 0.02, VM_ROLL * (1 - P.ads) * (1 - sk) - 0.88 * renv + Math.sin(P.bob) * 0.012 * amp + (P.swx || 0) * 0.8 * sw + crv * 0.03);
  vmAnimate(dt, (INPUT.fire || INPUT.mFire || INPUT.kFire) && P.mag > 0 && P.reloadT <= 0 && !P.sprint && P.throwT <= 0, P.reloadT > 0 ? clamp(1 - P.reloadT / RELOAD_T, 0, 1) : null);
  pdoorVM(dt);   /* at a door: the rifle down, the boot, the hand, the charge */
  vmMuzzle.intensity = Math.max(0, vmMuzzle.intensity - dt * 60); LIGHTS.muzzle.intensity = Math.max(0, LIGHTS.muzzle.intensity - dt * 12000);
  interactions();
}

/* ================= tutorial hints, radio and the objective marker ================= */
const TKEY = { T: 'עשן', E: 'הכפתור הירוק', F: 'פעולה (להחזיק)', G: 'רימון', R: 'טעינה', Shift: 'ג׳ויסטיק עד הקצה', C: 'כריעה', 'לחיצה ממושכת': 'אש (להחזיק)' };
const K = (k) => `<kbd>${TOUCH && TKEY[k] ? TKEY[k] : k}</kbd>`;
const TUT = { seen: {}, queue: [], cur: null, curT: 0, shown: 0, radioQ: [], radioT: 0, step: 'shelter' };
function hint(key, html, dur = 7) { if (TUT.seen[key]) return; TUT.seen[key] = true; TUT.queue.push({ html, dur }); }
function radio(who, text, dur = 4.2) { TUT.radioQ.push({ who, text, dur }); }
function resetTutorial() { Object.assign(TUT, { seen: {}, queue: [], cur: null, curT: 0, shown: 0, radioQ: [], radioT: 0, step: 'shelter' }); $('#hint').classList.remove('on'); $('#radio').classList.remove('on'); clearObjective(); }
function updTutorial(dt) {
  tutorialTriggers();
  if (TUT.cur) { TUT.curT -= dt; TUT.shown += dt; if (TUT.queue.length && TUT.shown > 4) TUT.curT = Math.min(TUT.curT, 0.4); if (TUT.curT <= 0) { TUT.cur = null; $('#hint').classList.remove('on'); } }
  if (!TUT.cur && TUT.queue.length) { TUT.cur = TUT.queue.shift(); TUT.curT = TUT.cur.dur; TUT.shown = 0; $('#hintText').innerHTML = TUT.cur.html; $('#hint').classList.add('on'); }
  TUT.radioT -= dt;
  if (TUT.radioT <= 0) { if (TUT.radioQ.length) { const r = TUT.radioQ.shift(); $('#radioWho').textContent = r.who; $('#radioText').textContent = r.text; $('#radio').classList.add('on'); TUT.radioT = r.dur; sndRadio(); } else $('#radio').classList.remove('on'); }
  updObjective();
}
function tutorialTriggers() {
  if (SURV.on) return;
  if (FIELDM()) return CH().hints();
  if (D.phase === 'alert' && GAME.t > 0.5) hint('start', `המלחמה פרצה. אתם <b>בקטע המקורה של תעלת הקרב</b>, צמוד למא״ג המערבי. <b>הישארו מתחת לגג</b> עד שההפצצה וההרעשה ייפסקו.`, 9);
  if (D.phase === 'barrage' && D.phaseT > 2 && !sheltered()) hint('left', TOUCH ? `אתם חשופים! חזרו לקטע המקורה בתעלה עד שההרעשה תיפסק.` : `אתם חשופים! חזרו לקטע המקורה, או כרעו בתוך התעלה (${K('C')}).`, 6);
  if (D.phase !== 'alert' && D.phase !== 'barrage' && D.scene === 0 && D.phaseT > 0.3) hint('run', TOUCH ? `<b>לעמדות!</b> המא״ג המערבי צמוד אליכם (◆ הצהוב). כשתעמדו לידו יופיע הכפתור הירוק <kbd>לאייש מא״ג</kbd>.` : `<b>לעמדות!</b> המא״ג המערבי צמוד אליכם (◆ הצהוב). עמדו לידו ולחצו ${K('E')}.`, 8);
  if ((D.scene === 0 || D.scene === 4) && P.mode !== 'mag') { const p = POSTS.find((q) => q.id === 'W2'); if (Math.hypot(p.x - P.pos.x, p.z - P.pos.z) < 7) hint('man', `לחצו ${K('E')} ליד המא״ג כדי לאייש אותו.`, 5); }
  if (P.mode === 'mag') hint('mag', TOUCH ? `ירו בסירות לפני שהן נוחתות: החזיקו <kbd>אש</kbd> לצרור, <kbd>כוונת</kbd> לזום. הכפתור הירוק <kbd>לרדת</kbd> עוזב את המא״ג.` : `ירו בסירות לפני שהן נוחתות. ${K('לחצן ימני')} לזום, ${K('לחיצה ממושכת')} לצרור, ${K('R')} להחלפת שרשרת, ${K('E')} לעזוב את המא״ג.`, 9);
  if (D.inTrench > 0) hint('intrench', P.mode === 'mag' ? `<b>מצרים בתעלה!</b> המא״ג לא מכסה את התעלה. רדו ממנו (${TOUCH ? '<kbd>לרדת</kbd>' : K('E')}) ולחמו בתעלה.` : `<b>מצרים בתעלה!</b> הם רצים אליכם ומסתתרים מאחורי חומות שקי החול שבתעלה. תפסו אותם כשהם מציצים, או זרקו רימון (${K('G')}) מעבר לחומה.`, 9);
  const w = FRIENDS.find((f) => f.state === 'wounded'); if (w) hint('wounded', `<b>${w.name} נפגע!</b> רוצו אליו (✚ אדום), החזיקו ${K('F')} לעזרה ראשונה. אחרי החבישה הוא חוזר להילחם.`, 10);
  if (P.mode === 'carry') hint('carry', `סחבו אותו בתעלת הקשר לתאג״ד הקדמי (◆) ולחצו ${K('E')} ליד האלונקות.`, 6);
  if (P.mode === 'rifle' && P.reserve < 40) hint('ammo', `<b>תחמושת אוזלת!</b> ארגזי תחמושת בכל עמדה לאורך התעלה - ${K('E')} ליד הארגז.`, 7);
  if (P.hp < 45 && D.phase !== 'alert') hint('hp', `<b>אתם מדממים!</b> מחסה - שקי חול או חומה - וכריעה. כמה שניות בלי פגיעה והכוח חוזר.`, 7);
  if (D.phase === 'intro' && D.scene > 0) hint('cp', `<b>שלב הושלם ✓</b> נקודת שמירה: חיים ותחמושת מלאים. קדימה בתעלה אל ה־◆.`, 8);
  if (D.phase === 'scene' && SCENES[D.scene].medevac) hint('medevac', `שני לוחמים נפגעו. השלב נגמר רק כשכל הפצועים בתאג״ד וכל המצרים מתים.`, 7);
}
const OBJ = { on: false, p: V3(), label: '', el: null, marker: null, beam: null };
{
  const el = document.createElement('div'); el.className = 'mk obj'; OBJ.el = el; OBJ.marker = new CSS2DObject(el); OBJ.marker.center.set(0.5, 1); OBJ.marker.visible = false; scene.add(OBJ.marker);
  const c = canvas(8, 128), g = c.getContext('2d'); const gr = g.createLinearGradient(0, 0, 0, 128); gr.addColorStop(0, 'rgb(0,0,0)'); gr.addColorStop(0.7, 'rgb(120,120,120)'); gr.addColorStop(1, 'rgb(255,255,255)'); g.fillStyle = gr; g.fillRect(0, 0, 8, 128);
  const bm = new THREE.MeshBasicMaterial({ color: 0xffcf73, alphaMap: tex(c, false), transparent: true, opacity: 0.5, depthWrite: false, side: THREE.DoubleSide, fog: false });
  OBJ.beam = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 40, 14, 1, true).translate(0, 18, 0), bm); OBJ.beam.visible = false; onLayer1(OBJ.beam); scene.add(OBJ.beam);
}
function clearObjective() { OBJ.on = false; OBJ.marker.visible = false; OBJ.beam.visible = false; $('#edge').classList.remove('on'); $('#guide').classList.remove('on'); }
function pickObjective() {
  if (FIELDM()) return CH().obj();
  if (D.phase === 'alert' || D.phase === 'barrage') { if (sheltered()) return null; let b = ROOFS[0], bd = 1e9; for (const r of ROOFS) { const d = Math.hypot(r.x - P.pos.x, r.z - P.pos.z); if (d < bd) { bd = d; b = r; } } return [b.x, groundAt(b.x, b.z), b.z, 'קטע מקורה']; }
  if (P.mode === 'carry') { const a = AIDPOST; return [a.x, a.y ?? groundAt(a.x, a.z), a.z, 'תאג״ד']; }
  if (D.phase === 'intro' || D.phase === 'scene') {
    const S = SCENES[D.scene]; const o = S.focus(); if (!o) return null;
    if (S.medevac) return o;
    if (D.objDone) return null;
    if ((o[4] === 'mag' && P.mode === 'mag') || Math.hypot(o[0] - P.pos.x, o[2] - P.pos.z) < 4) { D.objDone = true; return null; }
    return o;
  }
  return null;
}
const _pv = V3(), _gF = V3();
function updObjective() {
  const o = pickObjective(); if (!o) { if (OBJ.on) clearObjective(); return; }
  // just a pillar of yellow light where to go, nothing written beside it; over an enemy no light at all (the enemies have their red marks)
  let foe = o[4] === 'foe'; if (!foe) { for (const e of UNITS.enemies) if (e.alive && Math.abs(e.pos.x - o[0]) < 2.5 && Math.abs(e.pos.z - o[2]) < 2.5) { foe = true; break; } if (!foe) for (const v of VEH) if (v.side === 'e' && v.alive && v.g.visible && Math.abs(v.g.position.x - o[0]) < 5 && Math.abs(v.g.position.z - o[2]) < 5) { foe = true; break; } } OBJ.on = true; OBJ.p.set(o[0], o[1], o[2]); OBJ.marker.visible = false; OBJ.beam.visible = !CINE.on && !foe; OBJ.beam.position.set(o[0], o[1] - 0.5, o[2]);
  const d = Math.hypot(OBJ.p.x - P.pos.x, OBJ.p.z - P.pos.z);
  // the guide arrow: the way to the objective measured from where the player is looking - up is straight ahead
  { const g = $('#guide'), show = d > 4 && P.mode !== 'mag' && !CINE.on; g.classList.toggle('on', show);
    if (show) { const fw = camForward(_gF), vx = OBJ.p.x - P.pos.x, vz = OBJ.p.z - P.pos.z, a = Math.atan2(fw.x * vz - fw.z * vx, fw.x * vx + fw.z * vz) * 180 / Math.PI, fl = Math.hypot(fw.x, fw.z) > 0.2;
      g.firstElementChild.style.transform = `rotate(${(fl ? a : 0).toFixed(1)}deg)`; g.classList.toggle('foe', !!foe); const t = `${Math.round(d)} מ׳`; if (g.lastElementChild.textContent !== t) g.lastElementChild.textContent = t; } }
  OBJ.marker.position.set(OBJ.p.x, OBJ.p.y + 1.7, OBJ.p.z);
  OBJ.beam.material.opacity = clamp((d - 3) / 12, 0.2, 0.72);
  _pv.set(OBJ.p.x, OBJ.p.y + 1, OBJ.p.z).project(camera);
  const behind = _pv.z > 1; let x = _pv.x, y = _pv.y; if (behind) { x = -x; y = -y; if (Math.hypot(x, y) < 0.25) y = -1; }
  const off = behind || Math.abs(x) > 0.92 || Math.abs(y) > 0.88; const edge = $('#edge'); edge.classList.toggle('on', off && d > 2.5 && OBJ.beam.visible);
  if (off) {
    const a = Math.atan2(y, x), ca = Math.abs(Math.cos(a)) || 1e-4, sa = Math.abs(Math.sin(a)) || 1e-4; const r = Math.min(0.86 / ca, 0.78 / sa);
    const w = stage.clientWidth, h = stage.clientHeight; const sx = (Math.cos(a) * r * 0.5 + 0.5) * w, sy = (-Math.sin(a) * r * 0.5 + 0.5) * h;
    edge.style.transform = `translate(${sx.toFixed(0)}px,${sy.toFixed(0)}px)`; edge.firstElementChild.style.transform = `rotate(${(90 - a * 180 / Math.PI).toFixed(1)}deg)`;
  }
}

/* ================= HUD ================= */
const compassEls = [];
{
  const strip = $('#cstrip'); const names = { 0: 'צ', 90: 'מז', 180: 'ד', 270: 'מע', 45: 'צמ', 135: 'דמ', 225: 'דמע', 315: 'צמע' };
  for (let b = 0; b < 360; b += 15) { const s = document.createElement('span'); s.textContent = names[b] || String(b); if (!names[b]) s.className = 'minor'; strip.appendChild(s); compassEls.push({ el: s, b }); }
}
const compassMarks = [];
function compassMark(key, html) { let m = compassMarks.find((q) => q.key === key); if (!m) { const el = document.createElement('em'); $('#cstrip').appendChild(el); m = { key, el }; compassMarks.push(m); } if (m.html !== html) { m.el.innerHTML = html; m.html = html; } m.used = true; return m; }
function updCompass() {
  const w = $('#compass').clientWidth, heading = (THREE.MathUtils.radToDeg(-P.yaw) % 360 + 360) % 360, ppd = w / 150;
  for (const c of compassEls) { const rel = ((c.b - heading + 540) % 360) - 180; c.el.style.display = Math.abs(rel) < 72 ? '' : 'none'; c.el.style.left = `${w / 2 + rel * ppd}px`; }
  for (const m of compassMarks) m.used = false;
  const place = (m, x, z) => { const b = bearingOf(x - P.pos.x, z - P.pos.z); const rel = ((b - heading + 540) % 360) - 180; m.el.style.display = ''; m.el.style.left = `${w / 2 + clamp(rel, -70, 70) * ppd}px`; };
  if (MODE === 'mezach') place(compassMark('aid', '<span style="color:#ff7a70">✚</span>'), AIDPOST.x, AIDPOST.z);
  else if (MODE === 'suez' && SZ.stage >= 5) place(compassMark('aid', '<span style="color:#ff7a70">✚</span>'), LX(SZ_AID.c[0]), LZ(SZ_AID.c[1]));
  for (const f of FRIENDS) if (f.state === 'wounded' || f.state === 'stable') place(compassMark('f' + f.name, `<span style="color:${f.state === 'wounded' ? '#ff5a4a' : '#93d48d'}">✚</span>`), f.unit.pos.x, f.unit.pos.z);
  if (OBJ.on) place(compassMark('obj', '<span style="color:#ffcf73;font-size:14px">◆</span>'), OBJ.p.x, OBJ.p.z);
  for (const m of compassMarks) if (!m.used) m.el.style.display = 'none';
}
let hudT = 0; const FEED = [];
function feed(text, cls = '') { const el = document.createElement('div'); el.textContent = text; if (cls) el.className = cls; $('#feed').prepend(el); FEED.push({ el, t: GAME.t }); while ($('#feed').children.length > 6) $('#feed').lastChild.remove(); }
let toastTimer = 0;
function toast(t, s = '') { $('#toastT').textContent = t; $('#toastS').textContent = s; $('#toast').classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 3800 + Math.min(4200, s.length * 32)); }
function clockText() { const m = START_MIN + Math.floor(FIELDM() ? CH().tod() : GAME.t / 6); return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`; }
/* which enemies carry their red mark, and when: the ones that matter now - firing, aiming a bazooka, or with the player in their sight. On
   the easy level also every man who knows we are here; on the hard one only those shooting */
function tagWanted(e) {
  const lv = Math.max(0, DIFF.indexOf(diff)), fired = GAME.t - (e.shotT ?? -9) < 2.6, aim = (e.rpgAim > 0.1 && e.peek) || !!e.guide;
  if (fired || aim) return true; if (lv === 2) return false; if ((e.seeT || 0) > 0.3) return true; return lv === 0 && !!e.alert;
}
/* arrows on a ring round the middle of the screen toward the men shooting at the player from out of view - the nearer the arrow to the top,
   the more ahead of him the shooter (up to four, the most recent) */
const _thv = V3();
function threatArrows() {
  const box = $('#threats'); if (!box) return; if (!box.children.length) for (let i = 0; i < 4; i++) box.appendChild(document.createElement('i'));
  const L = []; if (GAME.state === 'play' && P.alive && !CINE.on) for (const e of UNITS.enemies) { if (!e.alive || GAME.t - (e.shotT ?? -9) > 3) continue; const c = e.chest(), v = _thv.copy(c).project(camera); if (v.z < 1 && Math.abs(v.x) < 0.92 && Math.abs(v.y) < 0.92) continue; L.push([e.shotT, c.clone().applyMatrix4(camera.matrixWorldInverse)]); }
  L.sort((a, b) => b[0] - a[0]); const W = innerWidth, H = innerHeight;
  [...box.children].forEach((el, i) => { const q = L[i]; if (!q) { el.style.opacity = '0'; return; } const a = Math.atan2(q[1].x, -q[1].z), x = W / 2 + Math.sin(a) * W * 0.4, y = H / 2 - Math.cos(a) * H * 0.38;
    el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${a.toFixed(3)}rad)`; el.style.opacity = '1'; });
}
function updHUD(dt) {
  updCompass(); drawMinimap(); threatArrows();
  // no movement stick when the player cannot move anyway: on a vehicle that drives itself, or in a gun pit
  { const noMove = (P.mode === 'tank' && !TANK.free) || !!P.ride || P.mode === 'mag' || CINE.on; if (noMove !== updHUD.noMove) { updHUD.noMove = noMove; $('#app').classList.toggle('nomove', noMove); } }
  const low = 1 - P.hp / 100; $('#vignette').style.opacity = String(clamp(Math.pow(low, 1.2) * 1.1, 0, 0.95));
  const fh = $('#flashHit'); fh.style.opacity = String(Math.max(0, parseFloat(fh.style.opacity || 0) - dt * 2.5));
  const gap = (P.mode === 'mag' ? 6 : lerp(14, 3, P.ads) + (moving() ? 8 : 0) + P.recoil * 16);
  const xh = $('#xhair'), bare = P.mode === 'rifle' && !(P.ride && P.ride.mg); xh.style.opacity = P.mode === 'carry' ? '0' : P.ads > (bare ? 0.15 : 0.7) ? '0' : '1'; xh.classList.toggle('bare', bare);
  xh.children[0].style.top = `${-gap - 9}px`; xh.children[1].style.top = `${gap}px`; xh.children[2].style.left = `${-gap - 9}px`; xh.children[3].style.left = `${gap}px`;
  if (AUD.lp) { AUD.ring = Math.max(0, AUD.ring - dt); AUD.lp.frequency.value = AUD.ring > 0 ? 700 + (1 - AUD.ring / 2.2) * 6000 : 18000; }
  hudT -= dt; if (hudT > 0) return; hudT = 0.12;
  $('#clockTime').textContent = clockText();
  { const h = Math.max(0, Math.round(P.hp)); $('#hpFill').style.width = `${h}%`; $('#hpFill').style.background = h > 60 ? '#7fcf6a' : h > 30 ? '#e6c14f' : '#e5533f'; $('#hpText').textContent = `חיים ${h}`; }
  if (P.mode === 'tank') { $('#wName').textContent = 'מגח · מקלע 0.5 ותותח 90'; $('#wAmmo').innerHTML = TANK.gunT > 0 ? `פגז <small>טוען ${Math.ceil(TANK.gunT)}</small>` : 'פגז <small>מוכן</small>'; $('#wAmmo').className = 'n'; }
  else if (P.mode === 'mag') { const m = P.post.mag; if (m.big) { $('#wName').textContent = 'תותח ללא רתע 106'; $('#wAmmo').innerHTML = m.reload > 0 ? 'טוען…' : 'פגז <small>מוכן</small>'; $('#wAmmo').className = 'n'; } else { $('#wName').textContent = m.heavy ? 'בראונינג 0.5' : 'מא״ג 7.62'; $('#wAmmo').innerHTML = SURV.on ? `∞ <small>${m.heavy ? 'ארגזים בלי סוף' : 'שרשרת ללא הפסקה'}</small>` : m.reload > 0 ? 'מחליף…' : `${m.belt} <small>/ ${m.heavy ? 'ארגז' : 'שרשרת'}</small>`; $('#wAmmo').className = 'n' + (!SURV.on && m.belt < 30 ? ' low' : ''); } }
  else { $('#wName').textContent = P.mode === 'carry' ? 'נושא פצוע' : 'רובה FN (פאל)'; $('#wAmmo').innerHTML = P.reloadT > 0 ? 'טוען…' : `${P.mag} <small>/ ${P.reserve}</small>`; $('#wAmmo').className = 'n' + (P.mag <= 5 ? ' low' : ''); }
  $('#wGren').textContent = P.smokeMax ? `רימוני רסס: ${P.gren} · עשן: ${P.smoke}` : `רימוני רסס: ${P.gren}`;
  { const tr = $('#treat'), on = !!(promptState && promptState.hold && P.hold > 0); tr.classList.toggle('on', on); if (on) { const pc = Math.min(100, Math.round(P.hold / 3 * 100)); $('#treatPct').textContent = `${pc}%`; $('#treatFill').style.width = `${pc}%`; $('#treatName').textContent = `חובשים את ${promptState.f ? promptState.f.name : 'הפצוע'}…`; } }
  const pr = $('#prompt'); if (promptState) { pr.classList.add('on'); $('#promptText').innerHTML = TOUCH ? promptState.text.replace(/<kbd>[^<]*<\/kbd>/g, '<kbd>פעולה</kbd>') : promptState.text; $('#promptBar').hidden = !promptState.hold; $('#promptFill').style.width = `${P.hold / 3 * 100}%`; } else pr.classList.remove('on');
  $('#carry').classList.toggle('on', P.mode === 'carry');
  if (TOUCH) {
    const ta = $('#tact'); const sh = P.mode === 'mag' ? 'לרדת' : promptState ? (promptState.hold ? 'עזרה ראשונה' : promptState.label || { man: 'לאייש מא״ג', ammo: 'תחמושת', lift: 'להרים', drop: 'להוריד', 'drop-aid': 'להשכיב', duck: P.crouch ? 'החוצה' : 'לצריח' }[promptState.act] || (promptState.fn ? promptLabel(promptState.text) : null)) : null; $('#tads').style.visibility = P.mode === 'rifle' || P.mode === 'tank' || P.mode === 'mag' ? '' : 'hidden';
    ta.classList.toggle('on', !!sh); if (sh) ta.textContent = promptState.hold && P.hold > 0 ? `${Math.round(P.hold / 3 * 100)}%` : sh;
    if (P.mode === 'rifle' && P.mag === 0 && P.reserve > 0 && P.reloadT <= 0) reload();
    const gl = P.mode === 'tank' ? 'תותח' : 'רימון'; if ($('#tgren').textContent !== gl) $('#tgren').textContent = gl;
    { const sm = !!P.smokeMax && P.mode === 'rifle' && (MODE === 'farm' || MODE === 'range'); $('#tsmoke').classList.toggle('on', sm); if (sm) $('#tsmoke').textContent = `עשן ${P.smoke}`; }
  }
  if (FIELDM()) { const C = CH(), st = C.st(); $('#waveTitle').textContent = `שלב ${st + 1}/${C.stages.length} · ${C.stages[st].title}`; const items = []; C.items(items); if (P.mode === 'rifle' && inConceal(P.pos.x, P.pos.z)) items.push(['done', P.crouch ? 'מוסתרים בצמחייה' : 'בתוך הצמחייה · כרעו כדי להיעלם']); if (P.reserve < 40 && P.mode === 'rifle') items.push(['', 'תחמושת נמוכה']); const html = items.map(([c, t]) => `<li class="${c}">${t}</li>`).join(''); if ($('#objList').innerHTML !== html) $('#objList').innerHTML = html; $('#cap').classList.remove('on'); for (const f of FEED) { if (GAME.t - f.t > 5) f.el.style.opacity = '0'; } return; }
  if (SURV.on) { survHUD(); return; }
  $('#waveTitle').textContent = D.phase === 'alert' ? 'כוננות ספיגה' : D.phase === 'barrage' ? 'הרעשה ארטילרית' : `שלב ${D.scene + 1}/${SCENES.length} · ${SCENES[D.scene].title}`;
  const items = [];
  if (D.phase === 'alert' || D.phase === 'barrage') {
    const left = Math.max(0, Math.ceil(D.phase === 'alert' ? BARRAGE_AT - D.phaseT + BARRAGE_LEN : BARRAGE_LEN - D.phaseT)); const ok = sheltered();
    items.push([ok ? 'done' : 'warn', `${ok ? '✓ במחסה' : 'חזרו לקטע המקורה'} · ההרעשה: עוד ${left} שנ׳`]);
    items.push(['next', 'אחר כך: למא״ג המערבי שלידכם (◆)']);
  }
  if (D.phase === 'intro' || D.phase === 'scene') { items.push(['go', (SCENES[D.scene].goal || SCENES[D.scene].sub) + (OBJ.on ? ' (◆)' : '')]); if (D.phase === 'intro' && D.introLen > 1) items.push(['next', `מתחיל בעוד ${Math.max(0, Math.ceil(D.introLen - D.phaseT))} שנ׳`]); else items.push(['', `מצרים שנותרו בשלב: ${enemiesLeft()}`]); }
  if (D.inTrench > 0) items.push(['warn', `מצרים בתעלה: ${D.inTrench}`]);
  if (D.inside > 0) items.push(['warn', `מצרים בתוך המוצב: ${D.inside}`]);
  $('#cap').classList.toggle('on', D.capture > 0.5); $('#capFill').style.width = `${D.capture}%`; $('#capText').textContent = `המצרים משתלטים על המוצב · ${Math.round(D.capture)}%`;
  let cas = 0; for (const f of FRIENDS) { if ((f.state === 'wounded' || f.state === 'stable' || f.state === 'carried') && ++cas > 2) continue; if (f.state === 'wounded') { const s = Math.ceil(f.bleed); items.push(['med', `${f.name} פצוע · עזרה ראשונה <small>${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}</small>`]); } else if (f.state === 'stable') items.push(['med', `${f.name} מיוצב · סחבו אותו לתאג״ד`]); else if (f.state === 'carried') items.push(['med', `הביאו את ${f.name} לתאג״ד (◆)`]); }
  if (P.reserve < 40 && P.mode === 'rifle') items.push(['', 'תחמושת נמוכה · ארגז בכל עמדה בתעלה']);
  const html = items.map(([c, t]) => `<li class="${c}">${t}</li>`).join(''); if ($('#objList').innerHTML !== html) $('#objList').innerHTML = html;
  for (const f of FEED) { if (GAME.t - f.t > 5) f.el.style.opacity = '0'; }
}


/* ================= minimap ================= */
const MINI = { c: $('#mini'), R: 115, shore: [] };
MINI.g = MINI.c.getContext('2d');
for (let z = -260; z <= 260; z += 10) MINI.shore.push([tongueWestX(z), z]);
function drawMinimap() {
  const g = MINI.g, N = MINI.c.width, C = N / 2, k = C / MINI.R, h = -P.yaw, sh = Math.sin(h), ch = Math.cos(h);
  const X = (x, z) => { const dx = x - P.pos.x, dz = z - P.pos.z; return [C + (dx * ch + dz * sh) * k, C - (dx * sh - dz * ch) * k]; };
  const poly = (pts, close = true) => { g.beginPath(); pts.forEach((p, i) => { const [a, b] = X(p[0], p[1]); i ? g.lineTo(a, b) : g.moveTo(a, b); }); if (close) g.closePath(); };
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, N, N); g.save(); g.beginPath(); g.arc(C, C, C - 1, 0, 6.283); g.clip();
  const dot = (x, z, r, col, ring) => { const [a, b] = X(x, z); g.beginPath(); g.arc(a, b, r, 0, 6.283); g.fillStyle = col; g.fill(); if (ring) { g.lineWidth = 2; g.strokeStyle = ring; g.stroke(); } };
  if (FIELDM()) CH().mini(g, X, poly, dot, k); else {
  g.fillStyle = 'rgba(92,82,62,.82)'; g.fillRect(0, 0, N, N);
  poly([...MINI.shore, [-900, 260], [-900, -260]]); g.fillStyle = 'rgba(28,70,86,.9)'; g.fill();
  poly(MAOZ); g.fillStyle = 'rgba(150,132,96,.9)'; g.fill(); g.lineWidth = 3; g.strokeStyle = 'rgba(214,176,108,.9)'; g.stroke();
  g.strokeStyle = 'rgba(60,60,58,.95)'; g.lineCap = 'round'; for (const rd of ROADS) { g.lineWidth = rd.w * k; poly(rd.pts, false); g.stroke(); }
  g.strokeStyle = 'rgba(120,88,48,.95)'; g.lineWidth = 1.6 * k; for (const t of TRENCH_LINES) { poly(t.pts, false); g.stroke(); }
  g.fillStyle = 'rgba(40,36,28,.9)'; for (const b of BUNKERS) { poly(b); g.fill(); }
  g.lineJoin = 'round'; for (const C of curCorrs()) { g.strokeStyle = 'rgba(255,207,115,.55)'; g.lineWidth = 3.6 * k; poly(TR.pts.slice(C.k0, C.k1 + 1), false); g.stroke(); for (const L of C.extra) { poly(L, false); g.stroke(); } g.fillStyle = 'rgba(255,207,115,.4)'; for (const [bx, bz, r] of C.bays) { const [a, b] = X(bx, bz); g.beginPath(); g.arc(a, b, r * k, 0, 6.283); g.fill(); } g.fillStyle = 'rgba(255,207,115,.22)'; for (const r of C.rects) { poly([[r[0], r[1]], [r[2], r[1]], [r[2], r[3]], [r[0], r[3]]]); g.fill(); } }
  if (SURV.on) { // the small strongpoint: everything beyond its two barricades is shaded out
    g.fillStyle = 'rgba(14,12,10,.5)'; poly([[-400, -49], [400, -49], [400, -600], [-400, -600]]); g.fill(); poly([[-400, 49], [400, 49], [400, 600], [-400, 600]]); g.fill();
    g.strokeStyle = 'rgba(255,207,115,.7)'; g.lineWidth = 2; g.setLineDash([6, 5]); poly([[-86, -49], [-40, -49]], false); g.stroke(); poly([[-86, 49], [-40, 49]], false); g.stroke(); g.setLineDash([]); }
  for (const p of POSTS) if (p.mag && !p.survOnly) { const [a, b] = X(p.x, p.z); if (SURV.on && Math.abs(p.z) > 49) continue; g.fillStyle = p.occupant ? 'rgba(255,207,115,.55)' : '#ffcf73'; g.fillRect(a - 5, b - 5, 10, 10); }
  if (SURV.on) for (const p of SURV.guns) { // the recoilless guns: a yellow disc with the barrel drawn out of it, pulsing until the first waves are over
    const [a, b] = X(p.x, p.z), mx = p.fx * ch + p.fz * sh, my = -(p.fx * sh - p.fz * ch), pulse = SURV.wave < 2 ? 1 + 0.18 * Math.sin(GAME.t * 4) : 1;
    g.save(); g.translate(a, b); g.scale(pulse, pulse); g.lineCap = 'round'; g.strokeStyle = '#1b150b'; g.lineWidth = 7; g.beginPath(); g.moveTo(0, 0); g.lineTo(mx * 15, my * 15); g.stroke();
    g.strokeStyle = p.occupant === 'player' ? '#fff3c4' : '#ffcf73'; g.lineWidth = 3.5; g.beginPath(); g.moveTo(0, 0); g.lineTo(mx * 15, my * 15); g.stroke();
    g.beginPath(); g.arc(0, 0, 7.5, 0, 6.283); g.fillStyle = p.occupant === 'player' ? '#fff3c4' : '#ffcf73'; g.fill(); g.lineWidth = 2; g.strokeStyle = '#1b150b'; g.stroke(); g.restore(); }
  { const [a, b] = X(AIDPOST.x, AIDPOST.z); g.fillStyle = '#ff6b5c'; g.fillRect(a - 7, b - 2, 14, 4); g.fillRect(a - 2, b - 7, 4, 14); }
  for (const bt of BOATS) { if (bt.dead || !bt.g.visible) continue; const [a, b] = X(bt.g.position.x, bt.g.position.z); g.fillStyle = '#ff5a4a'; g.fillRect(a - 6, b - 4, 12, 8); }
  if (SURV.on) for (const v of VEH) { if (v.mode !== 'mezach' || !v.g.visible) continue; const [a, b] = X(v.g.position.x, v.g.position.z); g.fillStyle = v.alive ? '#ff5a4a' : 'rgba(40,36,30,.8)'; g.fillRect(a - 6, b - 6, 12, 12); if (v.alive) { g.lineWidth = 2; g.strokeStyle = '#1b150b'; g.strokeRect(a - 6, b - 6, 12, 12); } }
  }
  if (diff.foeMap) for (const e of UNITS.enemies) if (e.alive && e.rig.root.visible && !e.mmHide) dot(e.pos.x, e.pos.z, 5, '#ff4a3a', 'rgba(0,0,0,.6)');
  // in the city every man who fired at the player pings on the map for three seconds, on every level: an orange ring that keeps spreading
  if (MODE === 'suez') for (const e of UNITS.enemies) { const a = GAME.t - (e.thrT ?? -99); if (!e.alive || a > 3) continue; const [px, py] = X(e.pos.x, e.pos.z), u = (a * 1.6) % 1; g.beginPath(); g.arc(px, py, 4 + u * 9, 0, 6.283); g.lineWidth = 2.2; g.strokeStyle = `rgba(255,164,52,${(1 - u) * (1 - a / 3) + 0.15})`; g.stroke(); dot(e.pos.x, e.pos.z, 4.5, '#ffa434', 'rgba(0,0,0,.7)'); }
  const blink = (GAME.t * 3) % 1 < 0.5;
  if (SURV.on && !FIELDM()) { // the attack's direction: a red arrow on the rim of the map, pulsing; during the break it already shows the next wave
    const dirs = SURV.state === 'wave' ? SURV.dirs : (SURV.nextDirs || []), DV = { w: [-1, 0], n: [-0.55, -0.83], s: [-0.55, 0.83] }, pulse = 0.75 + 0.25 * Math.sin(GAME.t * 5);
    for (const d of dirs) { const [dx, dz] = DV[d] || [0, 0], mx = dx * ch + dz * sh, my = -(dx * sh - dz * ch), L = Math.hypot(mx, my) || 1, ux = mx / L, uy = my / L, ax = C + ux * (C - 16), ay = C + uy * (C - 16);
      g.save(); g.translate(ax, ay); g.rotate(Math.atan2(uy, ux)); g.scale(pulse, pulse); g.fillStyle = SURV.state === 'wave' ? '#ff3b2a' : 'rgba(255,90,70,.85)'; g.strokeStyle = 'rgba(0,0,0,.7)'; g.lineWidth = 2;
      g.beginPath(); g.moveTo(-18, 0); g.lineTo(2, -11); g.lineTo(2, -4); g.lineTo(14, -4); g.lineTo(14, 4); g.lineTo(2, 4); g.lineTo(2, 11); g.closePath(); g.fill(); g.stroke(); g.restore(); } }
  for (const f of FRIENDS) {
    if (f.state === 'post' || f.state === 'toPost' || f.state === 'duck') { if (f.unit.rig.root.visible) dot(f.unit.pos.x, f.unit.pos.z, 5, '#6fa8ff', 'rgba(0,0,0,.6)'); }
    else if (f.state === 'wounded') dot(f.unit.pos.x, f.unit.pos.z, blink ? 7 : 5, '#ff5a4a', '#fff');
    else if (f.state === 'stable') dot(f.unit.pos.x, f.unit.pos.z, 6, '#93d48d', '#fff');
  }
  if (OBJ.on) { let [a, b] = X(OBJ.p.x, OBJ.p.z); const d = Math.hypot(a - C, b - C), m = C - 12; if (d > m) { a = C + (a - C) / d * m; b = C + (b - C) / d * m; } g.save(); g.translate(a, b); g.rotate(Math.PI / 4); g.fillStyle = '#ffcf73'; g.strokeStyle = '#1b150b'; g.lineWidth = 2; g.fillRect(-7, -7, 14, 14); g.strokeRect(-7, -7, 14, 14); g.restore(); }
  g.restore();
  g.beginPath(); g.moveTo(C, C - 13); g.lineTo(C + 9, C + 9); g.lineTo(C, C + 4); g.lineTo(C - 9, C + 9); g.closePath(); g.fillStyle = '#fff'; g.fill(); g.lineWidth = 2; g.strokeStyle = '#000'; g.stroke();
  const [nx, ny] = [C - sh * (C - 16), C - ch * (C - 16)]; g.font = '600 22px "IBM Plex Sans Hebrew", Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 4; g.strokeStyle = '#000'; g.strokeText('צ', nx, ny); g.fillStyle = '#ece5d4'; g.fillText('צ', nx, ny);
}

/* ================= game flow ================= */
function clearBattle() {
  holesClear();   /* a new battle: the old one's bullet holes go */
  SLOW.left = 0; SLOW.k = 1; SLOW.look = null;
  for (const e of UNITS.enemies) { e.alive = false; e.rig.root.visible = false; e.deadAt = undefined; e.tag.visible = false; e.cover = null; e.state = 'dead'; e.sz = null; e.slot = null; e.cov = null; }
  for (const b of [...BOATS]) b.dispose(); BOATS.length = 0; GROUPS.length = 0; DIRQ.length = 0; dropsClear(); flotReset(); ROWS.on = false; LANDCAP.n = 999; LANDCAP.wave = 0;
  for (const q of PROJ) { scene.remove(q.m); if (q.marker) scene.remove(q.marker); } PROJ.length = 0;
  FX.flashes.clear(); FX.glows.clear(); FX.smoke.clear(); FX.dust.clear(); FX.fire.clear(); FX.trail.clear(); FX.exh.clear(); for (const t of FX.tracers) { t.on = false; t.m.visible = false; }
  DRUMFIRE.on = false; LIGHTS.fire.intensity = 0; LIGHTS.boom.intensity = 0; LIGHTS.wreck.intensity = 0; for (const p of POSTS) if (p.occupant === 'player') p.occupant = null;
  Object.assign(D, { capture: 0, capWarn: false, inside: 0, inTrench: 0, chargeMsg: -99, clearT: 0, trenchMsg: -99, tok: { 1: null, '-1': null } }); for (const c of COVER) c.by = null;
}
function placeFriendAtPost(f) { f.post.occupant = f; f.state = 'post'; f.bleed = 0; f.target = null; f.burst = 0; f.marker.visible = false; const u = f.unit; u.alive = true; u.fall = -1; u.stance = 'stand'; u.place(f.post.stand[0], f.post.stand[1]); u.heading = Math.atan2(f.post.fx, f.post.fz); u.rig.root.visible = true; u.sync(); }
/* a checkpoint gives everything back (the user's rule, on every chapter): on reaching one - a stage begins (snapRequest) - and on coming back
   to it after a death. Full health, a full magazine, the reserve, the grenades and the smoke, the machine-gun belts, and the tank he fights from */
function cpRefill() {
  tacReset(); if (SURV.on) return;
  P.hp = 100; P.lastHit = -99; P.mag = Math.max(P.mag, 20); P.reserve = Math.max(P.reserve, 160); P.gren = Math.max(P.gren, diff.gren0); if (P.smokeMax) P.smoke = Math.max(P.smoke || 0, P.smokeMax);
  for (const p of POSTS) if (p.mag) { p.mag.belt = p.mag.cap || 200; p.mag.reload = 0; }
  if (P.mode === 'tank' && TANK.alive) { TANK.hp = 100; TANK.gunT = 0; }
}
function restoreCheckpoint() {
  if (FIELDM()) { CH().restore(); cpRefill(); return; }
  if (CP.scene < 0) { startGame(); return; }
  clearBattle(); Object.assign(STATS, CP.stats); resetTutorial(); for (const k of ['start', 'left', 'run', 'mag', 'man', 'cp']) TUT.seen[k] = true;
  FRIENDS.forEach((f, i) => { if (CP.friends[i] === 'post') placeFriendAtPost(f); });
  resetPlayer(); P.alive = true; const S = SCENES[CP.scene], sp = S.spawn(); P.pos.set(sp[0], groundAt(sp[0], sp[1]), sp[1]); P.yaw = -THREE.MathUtils.degToRad(S.face);
  const snap = CP.boats || []; D.launched = CP.scene === 0 && snap.length > 0; D.droneFilm = false; D.phase = 'intro'; introScene(CP.scene, 5); boatRestore(snap); CP.boats = snap;   // back at the start of the boats: their film comes again when the gun is taken (it can be skipped)
  cpRefill();
  GAME.state = 'play'; $('#app').classList.add('play'); for (const m of ['#mBrief', '#mPause', '#mEnd', '#mOps', '#mSet']) $(m).hidden = true; initAudio(); lockPointer();
}
function resetGame() {
  ensureMez(); facesNow(); envReady(); sqfReset();
  for (const e of UNITS.enemies) if (e.mmHide || e.pitHid) { fmDisguise(e, false); e.mmHide = false; e.pitHid = false; }
  MODE = 'mezach'; showWorld('mezach'); P.ride = null; if (CINE.on) endCine(true); $('#clockSub').textContent = '6.10.1973 · מעוז המזח'; P.mode = 'rifle'; P.crouch = false; vm.visible = true; $('#tsight').classList.remove('on'); FRIENDS.forEach((f, i) => { f.name = FRIEND_DEF[i][0]; });
  clearBattle(); CP.scene = -1; snapReset(); if (!TR.lane) initLanes(); D.scene = -1; applyBarricades(0, false);
  for (const f of FLARES) { scene.remove(f.s); f.light.intensity = 0; } FLARES.length = 0; if (TANK.spot) TANK.spot.intensity = 0; FLARE_LIGHT = 0;
  for (const j of JETS) scene.remove(j.m); JETS.length = 0;
  for (const c of D.smoke) { for (const p of c.parts) scene.remove(p.sp); if (c.fire) scene.remove(c.fire); FAR_SMOKE.splice(FAR_SMOKE.indexOf(c), 1); }
  for (const m of SCORCH.list) m.visible = false;
  FX.flashes.clear(); FX.glows.clear(); FX.smoke.clear(); FX.dust.clear(); FX.fire.clear(); FX.trail.clear(); FX.exh.clear(); for (const t of FX.tracers) { t.on = false; t.m.visible = false; }
  DRUMFIRE.on = false; LIGHTS.fire.intensity = 0; LIGHTS.boom.intensity = 0; LIGHTS.wreck.intensity = 0;
  for (const j of STRAFE) scene.remove(j.m); STRAFE.length = 0;
  AIR.mirage = false; AIR.ev = null; AIR.next = 30; AIR.magT = 0; for (const b of AIR.bombs) scene.remove(b.m); AIR.bombs.length = 0; if (AIR.models) { AIR.models.m.g.visible = false; AIR.models.m.wingR.visible = false; AIR.models.mig.visible = false; AIR.models.chute.visible = false; }
  Object.assign(D, { mineMsg: false, filmDone: false, boatsFilm: false, droneFilm: false, s2: false, s3: false, capture: 0, capWarn: false, chargeMsg: -99, scene: -1, objDone: false, introLen: 0, phase: 'alert', phaseT: 0, artT: 12, breachT: 0, inside: 0, barT: 0, launched: false, r2: false, jets: false, smoke: [] });
  Object.assign(STATS, { kills: 0, heads: 0, treated: 0, saved: 0, kia: 0, shots: 0 });
  GAME.t = 0; GAME.gCd = 0; resetPlayer(); P.alive = true; resetFriends(); setTimeOfDay(0); resetTutorial();
  $('#feed').innerHTML = ''; FEED.length = 0;
}
function lockPointer() { if (TOUCH) return; try { const r = renderer.domElement.requestPointerLock(); if (r && r.catch) r.catch(() => {}); } catch (e) {} }
function startGame() { survStop(); cvidPrefetch('mezach'); MAT.clothE.color.setHex(0xffffff); TANK.goal = null; $('#app').classList.remove('armor');
  resetGame(); setRim(MAT.clothE, 0); GAME.state = 'play'; $('#app').classList.add('play'); for (const m of ['#mBrief', '#mPause', '#mEnd', '#mOps', '#mSet']) $(m).hidden = true;
  initAudio(); lockPointer(); toast('13:55 · יום הכיפורים', 'מעוז המזח, הקצה הדרומי של תעלת סואץ');
}
function pauseGame() { if (GAME.state !== 'play') return; GAME.state = 'pause'; $('#app').classList.remove('play'); $('#mPause').hidden = false; INPUT.keys = {}; INPUT.fire = INPUT.mFire = INPUT.kFire = false; if (document.pointerLockElement) document.exitPointerLock(); }
function resumeGame() { GAME.state = 'play'; $('#app').classList.add('play'); $('#mPause').hidden = true; lockPointer(); }
function endGame(win, why) { if (win) markDone(MODE); $('#mEnd').style.setProperty('--endimg', `url('${IMG(MODE)}')`); { const nt = document.querySelector('#mEnd .note'); if (nt) nt.hidden = MODE !== 'mezach'; }
  if (GAME.state !== 'play') return; GAME.state = 'end'; $('#app').classList.remove('play'); if (document.pointerLockElement) document.exitPointerLock();
  if (SURV.on) { survEnd(why); return; }
  if (!win) snapOnDeath();
  const nx = CH_ORDER[CH_ORDER.indexOf(MODE) + 1]; $('#bNext').hidden = !(win && nx); if (nx) $('#bNext').textContent = `למשימה ${CH_INFO[nx].n} · ${CH_INFO[nx].name}`;
  $('#endEyebrow').textContent = `משימה ${CH_INFO[MODE].n} · ${CH_INFO[MODE].name} · ${diff.name} · ${clockText()}`;
  if (FIELDM()) {
    const C = CH(); const [title, text, stats] = C.end(win, why); $('#endTitle').textContent = title; $('#endText').textContent = text;
    $('#endStats').innerHTML = stats.map(([n, l]) => `<div><b>${n}</b><span>${l}</span></div>`).join('');
    $('#bRetry').hidden = win; $('#bRetry').textContent = `המשך מתחילת שלב ${C.cp() + 1}`; setTimeout(() => { $('#mEnd').hidden = false; }, win ? 1200 : 700); return;
  }
  if (win) { $('#endTitle').textContent = 'המוצב החזיק'; $('#endText').textContent = 'חמשת השלבים הושלמו: הסירות נהדפו, השערים החזיקו והפצועים בתאג״ד. השמש יורדת מעל פורט תאופיק, והמצור רק מתחיל.'; }
  else if (why === 'breach') { $('#endTitle').textContent = 'המוצב נכבש'; $('#endText').textContent = 'המצרים השתלטו על התעלה ועל המוצב. עצרו אותם כבר במים עם המא״ג, ומי שקופץ לתעלה צריך למות מהר, לפני שהמד מתמלא.'; }
  else { $('#endTitle').textContent = 'נפגעת'; $('#endText').textContent = 'בהרעשה כורעים בתעלה. כשהמצרים בתעלה, אל תעמדו בקו ישר מולם: כרעו מאחורי חומת שקי חול, חכו שיציצו, וזרקו רימון מעבר לחומה. אל תתנו להם להגיע אליכם צמוד.'; }
  $('#endStats').innerHTML = [[STATS.kills, 'אויבים נפגעו'], [STATS.treated, 'פצועים טופלו'], [STATS.saved, 'נחבשו וחזרו להילחם'], [STATS.kia, 'לוחמים שלנו נהרגו']].map(([n, l]) => `<div><b>${n}</b><span>${l}</span></div>`).join('');
  $('#bRetry').hidden = win || CP.scene < 0; $('#bRetry').textContent = CP.scene >= 0 ? `המשך מתחילת שלב ${CP.scene + 1}` : '';
  setTimeout(() => { $('#mEnd').hidden = false; }, win ? 1200 : 700);
}

/* ================= input ================= */
window.addEventListener('keydown', (e) => {
  if (GAME.state !== 'play') { if (e.code === 'Escape' && GAME.state === 'pause') resumeGame(); return; }
  if (CINE.on) { if (['Enter', 'Space', 'Escape', 'KeyE'].includes(e.code)) { e.preventDefault(); endCine(true); } return; }
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.code)) e.preventDefault();
  if (INPUT.keys[e.code]) return; INPUT.keys[e.code] = true;
  if (e.code === 'KeyR') { if (P.mode === 'tank' && CH() && CH().tankAct2) CH().tankAct2(); else reload(); }
  if (e.code === 'KeyG') throwPlayerGrenade();
  if (e.code === 'KeyB') survAir();
  if (e.code === 'KeyE') doAction();
  if (e.code === 'KeyC') { if (P.mode === 'rifle' || P.mode === 'tank') P.crouch = !P.crouch; }
  if (e.code === 'Space' && P.grounded && P.mode !== 'mag' && P.mode !== 'tank') { P.vy = 4.2; P.grounded = false; }
  if (e.code === 'Escape' && !INPUT.locked) pauseGame();
  if (e.code === 'KeyM') { INPUT.kFire = true; INPUT.fire = true; INPUT.fireEdge = true; }   // M fires, like the mouse button
});
window.addEventListener('keyup', (e) => { INPUT.keys[e.code] = false; if (e.code === 'KeyM') { INPUT.kFire = false; INPUT.fire = !!INPUT.mFire; } });
window.addEventListener('blur', () => { INPUT.keys = {}; INPUT.fire = INPUT.mFire = INPUT.kFire = false; });
document.addEventListener('pointerlockchange', () => { const was = INPUT.locked; INPUT.locked = document.pointerLockElement === renderer.domElement; if (was && !INPUT.locked && GAME.state === 'play') pauseGame(); });
document.addEventListener('mousemove', (e) => { if (GAME.state === 'play' && INPUT.locked) look(e.movementX || 0, e.movementY || 0, 0.0021 * lerp(1, 0.6, P.ads)); });
function look(dx, dy, s) { P.yaw -= dx * s; P.pitch = clamp(P.pitch - dy * s, -1.4, 1.4); }
const cvs = renderer.domElement;
cvs.addEventListener('contextmenu', (e) => e.preventDefault());
cvs.addEventListener('pointerdown', (e) => {
  if (GAME.state !== 'play') return;
  if (e.pointerType === 'mouse') {
    if (!INPUT.locked) { lockPointer(); }
    if (e.button === 0) { INPUT.mFire = true; INPUT.fire = true; INPUT.fireEdge = true; }
    if (e.button === 2) { if (INPUT.locked) INPUT.ads = true; else INPUT.drag = { id: e.pointerId, x: e.clientX, y: e.clientY }; }
  } else { INPUT.drag = { id: e.pointerId, x: e.clientX, y: e.clientY }; }
  try { cvs.setPointerCapture(e.pointerId); } catch (_) {}
});
cvs.addEventListener('pointermove', (e) => { const d = INPUT.drag; if (!d || d.id !== e.pointerId) return; look(e.clientX - d.x, e.clientY - d.y, e.pointerType === 'touch' ? 0.0055 : 0.004); d.x = e.clientX; d.y = e.clientY; });
const up = (e) => { if (e.pointerType === 'mouse') { if (e.button === 0) { INPUT.mFire = false; INPUT.fire = !!INPUT.kFire; } if (e.button === 2) INPUT.ads = false; } if (INPUT.drag && INPUT.drag.id === e.pointerId) INPUT.drag = null; };
cvs.addEventListener('pointerup', up); cvs.addEventListener('pointercancel', up);
// touch controls
if (TOUCH) { $('#app').classList.add('is-touch'); $('#keysDesk').hidden = true; $('#keysTouch').hidden = false; }
{
  const joy = $('#tjoy'), knob = joy.querySelector('i');
  const mv = (e) => { const r = joy.getBoundingClientRect(); let dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2); const l = Math.hypot(dx, dy), m = 50; if (l > m) { dx *= m / l; dy *= m / l; } INPUT.joy.x = dx / m; INPUT.joy.y = dy / m; knob.style.transform = `translate(${dx}px,${dy}px)`; };
  joy.addEventListener('pointerdown', (e) => { INPUT.joyId = e.pointerId; try { joy.setPointerCapture(e.pointerId); } catch (_) {} mv(e); });
  joy.addEventListener('pointermove', (e) => { if (e.pointerId === INPUT.joyId) mv(e); });
  const end = (e) => { if (e.pointerId !== INPUT.joyId) return; INPUT.joyId = null; INPUT.joy.x = INPUT.joy.y = 0; knob.style.transform = ''; };
  joy.addEventListener('pointerup', end); joy.addEventListener('pointercancel', end);
  const hold = (id, down, upf) => { const b = $(id); b.addEventListener('pointerdown', (e) => { e.preventDefault(); down(); }); b.addEventListener('pointerup', () => upf && upf()); b.addEventListener('pointercancel', () => upf && upf()); b.addEventListener('pointerleave', () => upf && upf()); };
  hold('#tfire', () => { INPUT.fire = true; INPUT.fireEdge = true; }, () => { INPUT.fire = false; });
  hold('#tgren', () => throwPlayerGrenade());
  hold('#tsmoke', () => throwSmoke());
  hold('#tads', () => { INPUT.tAds = !INPUT.tAds; $('#tads').classList.toggle('on', INPUT.tAds); });
  hold('#tpause', () => pauseGame());
  hold('#tair', () => survAir());
  hold('#tpos', () => { if (CH() && CH().tankAct2) CH().tankAct2(); });
  hold('#tact', () => { if (promptState && promptState.hold) INPUT.tHold = true; else doAction(); }, () => { INPUT.tHold = false; });
}
function startChapter(m) { survStop(); if (CH_ORDER.includes(m)) markLast(m); for (const v of document.querySelectorAll('.menu video')) { v.pause(); v.removeAttribute('src'); try { v.load(); } catch (e) {} if (v.parentNode) v.parentNode.classList.remove('vid'); v.classList.remove('on'); } /* free the video decoders before the battle loads */ for (const k of ['#mBrief', '#mOps', '#mSet', '#mEnd', '#mPause']) $(k).hidden = true; loadMission(m, m === 'mezach' ? startGame : () => CHAP[m].start()); }
for (const b of document.querySelectorAll('[data-chap]')) b.addEventListener('click', () => startChapter(b.dataset.chap));
$('#bNext').addEventListener('click', () => { const nx = CH_ORDER[CH_ORDER.indexOf(MODE) + 1]; if (nx) startChapter(nx); });
$('#bResume').addEventListener('click', resumeGame);
$('#bRestart').addEventListener('click', () => (SURV.on ? survStart() : startChapter(MODE)));
$('#bAgain').addEventListener('click', () => toOps());
$('#bRetry').addEventListener('click', () => (SURV.on ? survStart() : restoreCheckpoint()));
$('#bMute').addEventListener('click', () => setMute(!AUD.muted));
/* fullscreen: the same button on every menu. Its label follows the state, and a browser (or an embedding frame) that blocks it says so */
const fsEl = () => document.fullscreenElement || document.webkitFullscreenElement;
function fsLabel(txt) { const on = !!fsEl(); for (const b of document.querySelectorAll('.fsb')) (b.querySelector('span') || b).textContent = txt || (on ? 'יציאה ממסך מלא' : 'מסך מלא'); }
function fsFail() { fsLabel('הדפדפן חוסם מסך מלא כאן · נסו F11'); setTimeout(() => fsLabel(), 3200); }
function fsToggle() {
  const d = document, el = d.documentElement;
  try {
    if (fsEl()) { const r = d.exitFullscreen ? d.exitFullscreen() : d.webkitExitFullscreen(); if (r && r.catch) r.catch(() => {}); return; }
    const req = el.requestFullscreen || el.webkitRequestFullscreen; if (!req) { fsFail(); return; }
    const r = req.call(el, { navigationUI: 'hide' }); if (r && r.catch) r.catch(fsFail);
  } catch (e) { fsFail(); }
}
for (const b of document.querySelectorAll('.fsb')) b.addEventListener('click', fsToggle);
document.addEventListener('fullscreenchange', () => fsLabel()); document.addEventListener('webkitfullscreenchange', () => fsLabel());
function setDiff(i) { diff = DIFF[i]; for (const x of document.querySelectorAll('#diff button, #diffP button')) x.setAttribute('aria-pressed', String(+x.dataset.d === i)); try { localStorage.setItem('yk73.diff', String(i)); } catch (e) {} }
for (const id of ['#diff', '#diffP']) { const el = $(id); if (el) el.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; setDiff(+b.dataset.d); if (id === '#diffP') feed(`רמת קושי: ${diff.name}`, 'good'); }); }
/* the graphics quality: the soldiers' detail distances and the drawing resolution change at once; the sea, the plants and the rest are built
   when the game loads, so those follow on the next load */
function setQual(q, live) {
  for (const x of document.querySelectorAll('#qual button')) x.setAttribute('aria-pressed', String(x.dataset.q === q)); if (!live) return;
  try { localStorage.setItem('yk73.q2', q); } catch (e) {}
  const L = { high: [16, 48], med: [9, 30], low: [0, 15] }[q]; QLOD[0] = L[0]; QLOD[1] = L[1];
  const dpr = window.devicePixelRatio || 1; renderer.setPixelRatio(q === 'low' ? 1 : Math.min(dpr, q === 'high' ? (PHONE ? 2 : 3) : 2)); GOV.cap = renderer.getPixelRatio(); window.dispatchEvent(new Event('resize'));
  const n = $('#qualNote'); if (n) n.hidden = q === QUAL;
}
{ const el = $('#qual'); if (el) el.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b && b.dataset.q) setQual(b.dataset.q, true); }); setQual(QUAL, false);
  const rl = $('#qualReload'); if (rl) rl.addEventListener('click', () => location.reload()); }
try { const sv = Number(localStorage.getItem('yk73.diff')); if (sv >= 0 && sv <= 2 && localStorage.getItem('yk73.diff') !== null) setDiff(sv); } catch (e) {}

/* ================= main loop ================= */
let composer = null, vmPass = null;
function setupComposer() {
  if (LITE || PHONE) return;   // a phone draws straight to the screen with the GPU's own antialiasing: the post-processing's big half-float buffers are what some phones cannot hold (parts of the picture stayed black)
  try {
    const w = stage.clientWidth, h = stage.clientHeight;
    composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType }));
    composer.addPass(new RenderPass(scene, camera));
    vmPass = new RenderPass(vmScene, vmCamera); vmPass.clear = false; vmPass.clearDepth = true; composer.addPass(vmPass);
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(w, h), 0.28, 0.55, 1.3));
    composer.addPass(new OutputPass());
    composer.addPass(new SMAAPass(w * renderer.getPixelRatio(), h * renderer.getPixelRatio()));
    composer.setPixelRatio(renderer.getPixelRatio()); composer.setSize(w, h);
  } catch (e) { console.warn('post-processing off', e); composer = null; }
}
const GOV = { acc: 0, n: 0, cd: 6, cap: renderer.getPixelRatio() };   // the frame governor's state (govTick, below)
function resize() { const w = stage.clientWidth, h = stage.clientHeight; renderer.setSize(w, h); fitBuffer(w, h); labelRenderer.setSize(w, h); if (composer) composer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); vmCamera.aspect = w / h; vmCamera.updateProjectionMatrix(); }
/* a browser that cannot give the canvas every pixel asked for (a phone's limit on the drawing buffer, or on a texture the post-processing
   draws into) hands over fewer, and part of the picture then stays black: ask for no more than it gives and the GPU allows */
function fitBuffer(w, h) {
  const gl = renderer.getContext(), pr = renderer.getPixelRatio(), lim = Math.min(gl.getParameter(gl.MAX_TEXTURE_SIZE), gl.getParameter(gl.MAX_RENDERBUFFER_SIZE), ...gl.getParameter(gl.MAX_VIEWPORT_DIMS));
  let k = Math.min(1, lim / Math.max(1, w * pr, h * pr)); const c = renderer.domElement; if (gl.drawingBufferWidth < c.width - 1 || gl.drawingBufferHeight < c.height - 1) k = Math.min(k, gl.drawingBufferWidth / c.width, gl.drawingBufferHeight / c.height);
  if (k < 0.999) { const np = Math.max(1, Math.floor(pr * k * 20) / 20); renderer.setPixelRatio(np); renderer.setSize(w, h); GOV.cap = Math.min(GOV.cap, np); if (composer) composer.setPixelRatio(np); }
}
window.addEventListener('resize', resize);
function update(dt, time) {
  const rdt = dt; if (CINE.on) dt *= CINE.slow; FDT = dt;
  GAME.t += dt; GAME.gCd -= dt;
  for (const v of VEH) if (v.tag && v.tag.visible && (v.mode !== MODE || !FIELDM())) v.tag.visible = false;   // marks of another chapter's vehicles
  if (FIELDM()) { CH().upd(dt); if (GAME.state !== 'play') return; updTank(dt); updVeh(dt); } else { if (SURV.on) survUpd(dt); else updDirector(dt); if (GAME.state !== 'play') return; updBoats(dt); flotUpd(dt, BOATS.some((b) => !b.dead && (b.state === 'cross' || b.state === 'landed'))); }
  updJets(dt); if (FILMW.length) filmWalk(dt);
  for (const e of UNITS.enemies) if (e.rig.root.visible) updEnemy(e, dt);
  for (const f of FRIENDS) updFriend(f, dt, time);
  if (P.carrying) { P.carrying.unit.pos.copy(P.pos); }
  updProjectiles(dt); propsUpdate(dt);
  if (CINE.on) updCine(rdt); else { updPlayer(dt); const sh = FX.shake; if (sh > 0.02) { camera.rotation.x += rand(-sh, sh) * 0.016; camera.rotation.y += rand(-sh, sh) * 0.016; camera.position.y += rand(-sh, sh) * 0.06; } FX.shake = Math.max(0, sh - dt * 1.4); }
  updTutorial(dt);
  setTimeOfDay(FIELDM() ? CH().tod() : GAME.t / 6);
  snapUpd(rdt);
}
function idleCamera(time) {
  // over the rampart of the strongpoint, looking west across the canal at the far bank
  const a = time * 0.05; camera.position.set(-40 + Math.sin(a) * 22, 22 + Math.sin(a * 0.7) * 3, 68 + Math.cos(a) * 8); camera.lookAt(-300, 4, -70 + Math.sin(a * 0.6) * 25);
}
// behind the title the battle goes on: shells walking along the far bank, tracers over the water
const MENUFX = { t: 1.2, tr: 0.6, q: [] };
function menuFx(dt) {
  if ($('#mBrief').hidden) return; camera.getWorldDirection(_fwd); const fx = _fwd.x, fz = _fwd.z, L = Math.hypot(fx, fz) || 1, ux = fx / L, uz = fz / L;
  const at = (d, side) => { const p = V3(camera.position.x + ux * d - uz * side, 0, camera.position.z + uz * d + ux * side); p.y = groundAt(p.x, p.z); return p; };
  MENUFX.t -= dt; if (MENUFX.t <= 0) { MENUFX.t = rand(0.5, 1.4); const d = rand(70, 260), p = at(d, rand(-0.6, 0.12) * d); fxExplosion(p, rand(1.4, 2.6)); if (Math.random() < 0.35) MENUFX.q.push([0.28, d]); }
  for (let i = MENUFX.q.length - 1; i >= 0; i--) { const q = MENUFX.q[i]; q[0] -= dt; if (q[0] <= 0) { MENUFX.q.splice(i, 1); fxExplosion(at(q[1] + rand(-20, 20), rand(-0.4, 0.4) * q[1]), rand(0.7, 1.3)); } }
  MENUFX.tr -= dt; if (MENUFX.tr <= 0) { MENUFX.tr = rand(0.08, 0.35); const d = rand(110, 260), a = at(d, rand(-0.6, 0.1) * d), b = at(d * rand(0.3, 0.55), rand(-0.45, 0.05) * d); a.y += 1.5; b.y += rand(1, 8); fxTracer(a, b, Math.random() < 0.7); }
}
const clock = new THREE.Clock(); let firstFrame = true;
const _fwd = V3();
function frame() {
  // the first frame only puts up the menu, which covers the screen: no world is drawn (and no shader compiled) until a mission is chosen
  if (firstFrame) { firstFrame = false; window.__gameReady = true; clearTimeout(window.__gameTimer); LD.finish(); LD.hide(); showTitle(); GAME.state = 'menu'; setTimeout(facesIdle, 1500); if (HM_SANDBOX) setTimeout(() => startChapter('hermon'), 50); return; }   /* the building alone goes straight in */
  try { frameInner(); } catch (err) { if (!frame.err) { frame.err = true; console.error(err); } }
}
const SLOW = { k: 1, left: 0, fade: 0.8, look: null };
function slowMo(dur, k = 0.25, lookAt = null) { SLOW.left = dur; SLOW.k0 = k; SLOW.k = k; SLOW.look = lookAt; }
function slowStep(real) { if (SLOW.left > 0) { SLOW.left -= real; const u = clamp(SLOW.left / SLOW.fade, 0, 1); SLOW.k = SLOW.left > 0 ? lerp(1, SLOW.k0, u) : 1; if (SLOW.left <= 0) SLOW.look = null; } else SLOW.k = 1;
  if (SLOW.look && P.alive) { const L = SLOW.look, e = playerEye(), dx = L.x - e.x, dy = L.y - e.y, dz = L.z - e.z, yaw = Math.atan2(-dx, -dz), pitch = Math.atan2(dy, Math.hypot(dx, dz)), kk = 1 - Math.exp(-real * 5); P.yaw += wrapPi(yaw - P.yaw) * kk; P.pitch += (pitch - P.pitch) * kk; } }
/* the frame governor: the game starts at the sharpest the quality allows (up to twice the CSS pixels) and, when the frames come slower than
   about 33 a second for a few seconds running, draws a quarter less finely; at plain resolution and still slow (a weak phone) the sun's
   shadows go too. When there is room again it climbs back, a step at a time */
function govSet(pr) { renderer.setPixelRatio(pr); if (composer) composer.setPixelRatio(pr); resize(); }
function govTick(real) {
  if (QUAL === 'low' || GAME.state !== 'play' || document.hidden || CINE.on) { GOV.acc = 0; GOV.n = 0; return; }
  GOV.acc += real; GOV.n++; GOV.cd -= real; if (GOV.acc < 2.5) return; const ft = GOV.acc / GOV.n, pr = renderer.getPixelRatio(); GOV.acc = 0; GOV.n = 0; if (GOV.cd > 0) return;
  if (ft > 0.03 && pr > 1.01) { govSet(Math.max(1, pr - 0.25)); GOV.cd = 3; }
  else if (ft > 0.036 && sun.castShadow) { sun.castShadow = false; renderer.shadowMap.enabled = false; GOV.cd = 6; }
  else if (ft < 0.019 && pr < GOV.cap - 0.01) { govSet(Math.min(GOV.cap, pr + 0.25)); GOV.cd = 10; }
}
function frameInner() {
  if (LD.busy) { clock.getDelta(); return; }   // a mission is loading: its own pieces of work have the page; nothing is drawn under the loading screen
  const real = Math.min(clock.getDelta(), 0.05); slowStep(real); govTick(real); const dt = real * SLOW.k, time = clock.elapsedTime;
  // the title and mission select cover the screen with pictures: no need to draw the 3D world behind them (it saves the phone's battery)
  if (GAME.state === 'menu' && (!$('#mBrief').hidden || !$('#mOps').hidden)) return;
  if (GAME.state === 'play') update(dt, time); else if (GAME.state !== 'pause' && GAME.state !== 'end') { idleCamera(time); updJets(dt); menuFx(dt); }
  chipsUpd(dt); FX.flashes.update(dt); FX.glows.update(dt); FX.smoke.update(dt); FX.dust.update(dt); FX.fire.update(dt); FX.trail.update(dt); FX.exh.update(dt); updateTracers(dt); updateFlares(dt); updateDrumFire(dt, time);
  FX.boomT = (FX.boomT || 0) + dt; LIGHTS.boom.intensity *= Math.max(0, 1 - dt * 9);
  updFarSmoke(dt, time); wreckUpd(dt); animateWater(dt); waveFlags(time);
  if (HM_PANO) HM_PANO.visible = MODE === 'hermon';   // the view from the Hermon is drawn only there
  if (UNI_E.mode !== MODE) { UNI_E.mode = MODE; uniformFor(MODE); }   // Syrian uniforms on the Hermon, Egyptian everywhere else
  sky.position.copy(camera.position); if (NSKY.g.visible) NSKY.g.position.copy(camera.position); camera.getWorldDirection(_fwd); followSun(camera.position.x + _fwd.x * 40, camera.position.z + _fwd.z * 40); updateVmLight();
  if (GAME.state === 'play') updHUD(dt);
  if (CVID.on) { if (GAME.state !== 'play' && !CVID.el.paused) CVID.el.pause(); return; }   // a film on video: its picture covers the view, nothing to draw under it (paused with the game)
  const ms = magSightUpd(real, CINE.on || GAME.state !== 'play'), showVm = GAME.state === 'play' && !CINE.on && (P.mode === 'rifle' || ms > 0.02), vmWas = vm.visible; if (ms > 0.02) vm.visible = false;   // aiming a machine gun: its sights in the viewmodel pass instead of the rifle
  if (composer) { vmPass.enabled = showVm; composer.render(dt); }
  else { renderer.setRenderTarget(null); renderer.clear(); renderer.render(scene, camera); if (showVm) { renderer.clearDepth(); renderer.render(vmScene, vmCamera); } }
  vm.visible = vmWas;
  labelRenderer.render(scene, camera);
}
/* ---------- starting up: the menu comes first, and each battlefield is built only when its mission is chosen ---------- */
const WORLDB = { terrain: false, towns: false, mez: false, kb: 0 };
function ensureTerrain() { if (WORLDB.terrain) return; WORLDB.terrain = true; WORLDB.kb = scene.children.length; buildTerrain(); }
function ensureBase() { ensureTerrain(); if (WORLDB.towns) return; WORLDB.towns = true; buildTowns(); WORLD.base = scene.children.slice(WORLDB.kb); dimEnv(scene); }   // the canal, its banks, Port Tewfik and Suez: the stronghold's mission and the city's
function ensureMez() { ensureBase(); if (WORLDB.mez) return; WORLDB.mez = true; const k0 = scene.children.length; buildStronghold(); SZ.mezObjs = scene.children.slice(k0); dimEnv(scene); }
async function main() {
  dimEnv(scene); dimEnv(vmScene); for (const m of Object.values(MAT)) if (m.isMeshStandardMaterial && !m.userData.envDone && m.envMapIntensity === 1) { m.userData.envDone = true; m.envMapIntensity = ENVK; }
  setupComposer(); await LD.mod(LD_BOOT, 0, LD_BOOT);
  renderer.setAnimationLoop(frame);
}
// for testing on a real device: with ?dev in the address, window.__ev runs code inside the game (its own variables and functions)
if (/[?&]dev\b/.test(location.search)) window.__ev = (c) => eval(c);
function bootGame() { main().catch((err) => { console.error(err); LD.error('המשחק לא נטען בדפדפן זה. נסו דפדפן אחר או מחשב.'); }); }   // called by the last file, once everything is defined

/* ---------- loading a mission: only what it needs, behind a screen that shows each step ---------- */
const LD_BOOT = 2000;   // the game's code, start to menu, on a fast computer (ms)
const LD_PLACE = { mezach: 'המעוז', rescue: 'ציר טליסמן', armor: 'הרכסים מזרחית לתעלה', farm: 'החווה הסינית', cross: 'אזור הצליחה', hermon: 'החרמון', suez: 'העיר סואץ', army: 'הדרך מערבית לסואץ', range: 'המטווח' };
// what each piece takes on a fast computer (ms); the screen stretches it by how fast this device turned out to be at start-up
const LD_MS = { base: 420, mez: 600, setup: 250, rescue: 900, armor: 900, farm: 1200, cross: 1000, hermon: 1200, suez: 900, army: 900, range: 500 };
const TEXK = ['map', 'bumpMap', 'normalMap', 'roughnessMap', 'metalnessMap', 'alphaMap', 'emissiveMap', 'aoMap', 'lightMap', 'displacementMap', 'specularMap'];
const GFXW = new WeakSet();
/* the graphics card gets everything before the battle starts, a little at a time so the screen keeps moving: first the shader program of
   every material in the scene (compiled in the background where the browser can, checked one at a time otherwise), then the textures */
async function gfxWarm(m, cb) {
  envReady(); if (m === 'suez') szShow(true); else showWorld(m === 'surv' ? 'mezach' : m);   // the objects and lights as the mission will have them, so the programs match
  // the other missions' battlefields stay out of it (hidden, and lit differently): the scene is shown to the compiler without them for a moment
  const skip = new Set(), mm = m === 'surv' ? 'mezach' : m, add = (l) => { if (l) for (const o of l) skip.add(o); };
  for (const k in CHAP) if (k !== mm && k !== 'mezach' && k !== 'suez') add(CHAP[k].objs);
  if (mm !== 'mezach') add(SZ.mezObjs); if (mm !== 'suez') add(SZ.objs); if (mm !== 'mezach' && mm !== 'suez') add(WORLD.base);
  const texs = [], seen = new Set(), all = scene.children;
  const addT = (t) => { if (t && t.isTexture && !seen.has(t) && !t.isRenderTargetTexture && !t.isVideoTexture && t.image && t.version > 0 && renderer.properties.get(t).__version !== t.version) { seen.add(t); texs.push(t); } };
  scene.children = all.filter((o) => !skip.has(o));
  try {
    renderer.compile(scene, camera); renderer.compile(vmScene, vmCamera);
    for (const root of [scene, vmScene]) root.traverse((o) => { const ms = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : []; for (const mt of ms) { for (const k of TEXK) addT(mt[k]); if (mt.uniforms) for (const k in mt.uniforms) addT(mt.uniforms[k] && mt.uniforms[k].value); } });
  } finally { scene.children = all; }
  const progs = renderer.info.programs.filter((p) => !GFXW.has(p));
  const total = progs.length * 2 + texs.length || 1; let n = 0;
  if (renderer.extensions.has('KHR_parallel_shader_compile')) {   // the browser compiles them side by side; wait, without blocking, until they say they are done
    const t0 = performance.now(); while (performance.now() - t0 < 12000) { const r = progs.filter((p) => p.isReady()).length; cb(r / total); if (r === progs.length) break; await new Promise((ok) => setTimeout(ok, 40)); }
  }
  n = progs.length;
  for (let i = 0; i < progs.length;) { const t0 = performance.now(); while (i < progs.length && performance.now() - t0 < 45) { progs[i].getUniforms(); GFXW.add(progs[i]); i++; n++; } cb(n / total); await LD.tick(); }
  for (let i = 0; i < texs.length;) { const t0 = performance.now(); while (i < texs.length && performance.now() - t0 < 45) { try { renderer.initTexture(texs[i]); } catch (e) {} i++; n++; } cb(n / total); await LD.tick(); }
}
/* m: a mission key, or 'surv' for the survival mode in the stronghold; go: what starts it once everything is in place */
async function loadMission(m, go) {
  if (LD.busy) return; LD.busy = true; const t0 = performance.now(), info = CH_INFO[m], surv = m === 'surv';
  for (const v of document.querySelectorAll('.menu video')) v.pause(); for (const k of ['#mBrief', '#mOps', '#mSet', '#mEnd', '#mPause']) $(k).hidden = true;
  const base = (m === 'mezach' || surv || m === 'suez') && !WORLDB.towns, mez = (m === 'mezach' || surv) && !WORLDB.mez, chap = m !== 'mezach' && !surv && !(m === 'suez' ? SZ.built : CHAP[m].built);
  const steps = [];
  if (base) steps.push(['base', 'בונה את השטח ואת התעלה', 3]);
  if (mez) steps.push(['mez', 'בונה את המעוז', 4]);
  if (chap) steps.push(['chap', `בונה את ${LD_PLACE[m]}`, 6]);
  if (FACEQ.length) steps.push(['faces', 'מצייר את פני הלוחמים', 2]);
  steps.push(['gfx', 'מכין את הגרפיקה', 4], ['setup', 'מציב את הכוחות', 1]);
  LD.plan(steps, { eye: info ? `משימה ${info.n}` : surv ? 'הישרדות' : 'אימון', title: info ? info.name : surv ? 'להחזיק את המעוז' : 'המטווח', img: info || surv ? IMG(surv ? 'mezach' : m) : '', clip: info || surv ? (surv ? 'mezach' : m) : '' });
  try {
    await LD.paint();
    if (base) { LD.step('base', LD_MS.base); await LD.paint(); ensureBase(); }
    if (mez) { LD.step('mez', LD_MS.mez); await LD.paint(); ensureMez(); }
    if (chap) { LD.step('chap', LD_MS[m] || 900); await LD.paint(); await mapsLoad(m); if (m === 'suez') { ensureBase(); buildSuez(); } else { const C = CHAP[m]; C.built = true; const g0 = GROUND; C.build(); GROUND = g0; } }
    if (FACEQ.length) { LD.step('faces'); await facesPaint((f) => LD.frac(f)); }
    LD.step('gfx'); await gfxWarm(m, (f) => LD.frac(f));
    // a long wait has used up the click that chose the mission: the browser wants a fresh one for the sound and for taking the mouse
    if (performance.now() - t0 > 3500) await LD.ready(info ? 'התחל את המשימה' : 'התחל');
    LD.step('setup', LD_MS.setup); await LD.paint();
    go();
  } catch (err) { console.error(err); LD.busy = false; LD.error('המשימה לא נטענה. נסו לרענן את הדף.'); return; }
  LD.busy = false; LD.finish(); await LD.paint(); await LD.paint(); LD.hide();   // two frames of the battle drawn under the screen, then it lifts
}
