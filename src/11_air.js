
/* ================= chapter 1: the air war over the strongpoint =================
   Slow, low dives along the trench line: cannon fire walks down the line, sandbags fly, bombs fall on whoever is exposed.
   Halfway through, an Israeli Mirage is caught by a MiG over the canal, breaks up and crashes beyond the strongpoint; its pilot comes down under a parachute. */
const AIR = { next: 30, magT: 0, mirage: false, bombs: [], debris: [], ev: null };
const BAG_POOL = (() => { const g = pillowGeo(), list = []; for (let i = 0; i < (LITE ? 18 : 36); i++) { const m = new THREE.Mesh(g, MAT.bag); m.scale.set(0.6, 0.22, 0.36); m.visible = false; m.castShadow = SHADOWS; scene.add(onLayer1(m)); list.push({ m, v: V3(), w: V3(), t: 99, rest: false }); } return list; })();
function bagBurst(p, n) {
  for (let k = 0; k < n; k++) { let b = BAG_POOL[0]; for (const q of BAG_POOL) if (q.t > b.t) b = q; b.t = 0; b.rest = false; b.m.visible = true; b.m.position.copy(p).add(V3(rand(-0.6, 0.6), 0.6, rand(-0.6, 0.6))); b.v.set(rand(-5, 5), rand(6, 13), rand(-5, 5)); b.w.set(rand(-8, 8), rand(-8, 8), rand(-8, 8)); }
}
function updDebris(dt) {
  for (const b of BAG_POOL) { if (!b.m.visible) continue; b.t += dt; if (b.t > 14) { b.m.visible = false; continue; } if (b.rest) continue;
    b.v.y -= 9.8 * dt; b.m.position.addScaledVector(b.v, dt); b.m.rotation.x += b.w.x * dt; b.m.rotation.y += b.w.y * dt; b.m.rotation.z += b.w.z * dt;
    const g = hAt(b.m.position.x, b.m.position.z, b.m.position.y) + 0.1; if (b.m.position.y < g) { b.m.position.y = g; if (Math.abs(b.v.y) < 2.5) { b.rest = true; b.m.rotation.x = 0; b.m.rotation.z = 0; } else { b.v.y *= -0.25; b.v.x *= 0.4; b.v.z *= 0.4; b.w.multiplyScalar(0.4); } } }
}
const BOMB_GEO = build([[G.cyl(0.18, 0.18, 1.5, 10), 0x3a3d36, M4(0, 0, 0, Math.PI / 2, 0, 0)], [G.cone(0.18, 0.4, 10), 0x2e302b, M4(0, 0, 0.95, Math.PI / 2, 0, 0)], [G.box(0.5, 0.04, 0.3), 0x2e302b, M4(0, 0, -0.75)]]);
const airExposed = () => P.alive && (P.mode === 'mag' || (!underRoof() && !(inTrench() && P.crouch)));
function dropBombs(j) {
  const near = Math.hypot(P.pos.x - j.tx, P.pos.z - j.tz) < 110, exp = near && airExposed();
  const tg = exp ? [[P.pos.x + rand(-1.2, 1.2), P.pos.z + rand(-1.2, 1.2)], [P.pos.x + j.dx * 14 + rand(-2, 2), P.pos.z + j.dz * 14 + rand(-2, 2)]] : [0, 1, 2].map((k) => { const u = 18 + k * 17; return [j.tx + j.dx * u + rand(-2, 2), j.tz + j.dz * u + rand(-2, 2)]; });
  if (exp) radio('תצפית', P.mode === 'mag' ? 'הטייס ראה אותך! תרד מהמא״ג!' : 'הוא צולל ישר עליך! לקטע המקורה!', 2.4);
  tg.forEach(([x, z], k) => { const m = new THREE.Mesh(BOMB_GEO, MAT.vc); m.scale.setScalar(1.8); scene.add(onLayer1(m)); const from = j.m.position.clone(); AIR.bombs.push({ m, from, to: V3(x, groundAt(x, z), z), t: -k * 0.3, dur: 2.3, hard: exp && k === 0 }); });
}
function updBombs(dt) {
  for (let i = AIR.bombs.length - 1; i >= 0; i--) { const b = AIR.bombs[i]; b.t += dt; if (b.t < 0) { b.m.visible = false; continue; } b.m.visible = true; const u = Math.min(1, b.t / b.dur);
    const p = b.from.clone().lerp(b.to, u); p.y = lerp(b.from.y, b.to.y, u * u); b.m.position.copy(p); b.m.lookAt(b.to);
    if (u >= 1) { scene.remove(b.m); AIR.bombs.splice(i, 1); explode(b.to.clone(), 2.0, 13, b.hard ? 190 : 140, 'art'); if (onTrench(b.to.x, b.to.z) < 5) bagBurst(b.to, 7); } }
}
function airDirector(dt) {
  updDebris(dt); updBombs(dt);
  AIR.magT = 0;   // the jets come once, in the opening attack; after that the sky over the Mezach is quiet
  if (!AIR.mirage && D.phase === 'alert' && D.phaseT > 0.9) { AIR.mirage = true; mirageFilm(); }
  if (AIR.ev) updMirage(dt);
}
/* ---------- the Mirage: delta wing, desert camouflage, the blue Star of David in white roundels ---------- */
function roundelTex() {
  const c = canvas(128), g = c.getContext('2d'); g.fillStyle = '#ffffff'; g.beginPath(); g.arc(64, 64, 62, 0, 6.283); g.fill(); g.strokeStyle = '#1846b8'; g.lineWidth = 9; g.lineJoin = 'miter';
  for (const a0 of [-Math.PI / 2, Math.PI / 2]) { g.beginPath(); for (let k = 0; k < 3; k++) { const a = a0 + k * 2.0944, x = 64 + Math.cos(a) * 44, y = 64 + Math.sin(a) * 44; k ? g.lineTo(x, y) : g.moveTo(x, y); } g.closePath(); g.stroke(); }
  const t = tex(c); return t;
}
function mirageModel() {
  const T = 0xb7a173, B = 0x7d5e3c, Gn = 0x6b6f4a, K = 0x2a2b2c;
  const delta = (sd) => G.ext([[1.6, 0], [-5.8, 0], [-5.4, sd * 4.3]], 0.12).rotateX(Math.PI / 2);
  const body = build([[G.cyl(0.5, 0.62, 12, 16), T, M4(-0.5, 0, 0, 0, 0, -Math.PI / 2)], [G.cone(0.5, 2.6, 16), Gn, M4(6.8, 0, 0, 0, 0, -Math.PI / 2)], [G.sph(0.42, 14, 8), 0x3e5566, M4(3.6, 0.45, 0, 0, 0, 0, 2.3, 0.85, 0.8)],
    [G.cyl(0.62, 0.55, 0.6, 16), K, M4(-6.7, 0, 0, 0, 0, -Math.PI / 2)], [G.ext([[-3.0, 0], [-6.4, 3.0], [-7.0, 3.0], [-6.8, 0]], 0.12).translate(0, 0, -0.06), B, M4(0, 0.35, 0)],
    ...[-1, 1].map((sd) => [G.cone(0.42, 1.8, 10), B, M4(1.6, 0.05, sd * 0.62, 0, 0, Math.PI / 2, 1, 1, 0.7)]), [delta(-1), T, M4(0, -0.15, -0.3)], [G.box(3.2, 0.14, 1.2), B, M4(-3.4, -0.05, -2.0)]]);
  const g = new THREE.Group(), mat = MAT.jet.clone(); mat.metalness = 0.15; mat.roughness = 0.6; g.add(new THREE.Mesh(body, mat));
  const wingR = new THREE.Mesh(build([[delta(1), T, M4(0, -0.15, 0.3)], [G.box(3.0, 0.14, 1.2), B, M4(-3.3, -0.05, 2.0)]]), mat); g.add(wingR);
  const rt = roundelTex(), rm = new THREE.MeshStandardMaterial({ map: rt, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.5, polygonOffset: true, polygonOffsetFactor: -2 });
  const ro = (parent, x, y, z, s, rx, ry) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(s, s), rm); m.position.set(x, y, z); m.rotation.set(rx, ry, 0); parent.add(m); };
  ro(g, -3.6, -0.02, -2.6, 1.9, -Math.PI / 2, 0); ro(g, -3.6, -0.24, -2.6, 1.9, Math.PI / 2, 0); ro(wingR, -3.6, -0.02, 2.6, 1.9, -Math.PI / 2, 0); ro(wingR, -3.6, -0.24, 2.6, 1.9, Math.PI / 2, 0);
  ro(g, -1.6, 0.05, 0.64, 1.0, 0, 0); ro(g, -1.6, 0.05, -0.64, 1.0, 0, Math.PI);
  g.traverse((m) => { if (m.isMesh) { m.castShadow = SHADOWS; onLayer1(m); } }); g.visible = false; scene.add(g); return { g, wingR };
}
function chuteModel() {
  const g = new THREE.Group(); const can = new THREE.Mesh(new THREE.SphereGeometry(3.2, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.42), new THREE.MeshStandardMaterial({ color: 0xe8e2d2, side: THREE.DoubleSide, roughness: 0.9 }));
  const cn = new THREE.Group(); g.add(cn); g.userData.canopy = cn;   // the canopy, lines and all, in a group of its own: it blooms over the pilot, who is there whole from the start
  can.position.y = 6; cn.add(can); const stripes = new THREE.Mesh(new THREE.SphereGeometry(3.22, 16, 8, 0, Math.PI * 2, Math.PI * 0.2, Math.PI * 0.08), new THREE.MeshStandardMaterial({ color: 0xd2662a, side: THREE.DoubleSide })); stripes.position.y = 6; cn.add(stripes);
  const lines = []; for (let k = 0; k < 8; k++) { const a = k * 0.785; lines.push(V3(0, 0.9, 0), V3(Math.cos(a) * 2.9, 6 + 1.2, Math.sin(a) * 2.9)); } cn.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(lines), new THREE.LineBasicMaterial({ color: 0x222222 })));
  const pilot = new THREE.Mesh(SEATED_F, MAT.clothF); pilot.position.y = -0.2; g.add(pilot); g.traverse((m) => onLayer1(m)); g.visible = false; scene.add(g); return g;
}
function mirageFilm() {
  if (!AIR.models) { AIR.models = { m: mirageModel(), mig: new THREE.Mesh(JET_GEO, MAT.jet), chute: chuteModel() }; scene.add(AIR.models.mig); onLayer1(AIR.models.mig); }
  const M = AIR.models, H = V3(nearX(-350), 235, 175), d = V3(0.9, 0, -0.45).normalize(), sp = 92;
  M.m.g.visible = true; M.m.wingR.visible = true; M.mig.visible = true; M.chute.visible = false; if (M.m.wingR.parent !== M.m.g) { M.m.g.attach(M.m.wingR); } M.m.wingR.position.set(0, 0, 0); M.m.wingR.rotation.set(0, 0, 0);
  // three shots: the chase (from behind the Sukhoi, the Mirage ahead, the missile off its rail), the hit on the wing in slow motion close
  // alongside, and the pilot thrown clear with his canopy opening over him
  const ev = AIR.ev = { t: 5.4, H, d, sp, hit: false, vy: 0, roll: 0, crashed: false, missile: null, wingV: V3(), smokeT: 0, chuteOn: false };
  updMirage(0);
  const mp = () => M.m.g.position.clone(), gp = () => M.mig.position.clone(), side = V3(-d.z, 0, d.x), sunSd = side.x * SUN.dir.x + side.z * SUN.dir.z > 0 ? 1 : -1, chT = () => (ev.chuteOn ? ev.chP.clone() : mp().add(V3(0, 3, 0)));
  playCine({ vid: 'mz_mirage',
    title: 'מעל תעלת סואץ · 14:00',
    shots: [
      { d: 3.2, cam: (u) => ({ p: gp().addScaledVector(d, -16 + u * 3).addScaledVector(side, 4 * sunSd).add(V3(0, 3.5, 0)), l: mp().add(V3(0, -1, 0)), fov: 30 }) },
      { d: 3.4, slow: 0.45, cam: (u) => ({ p: mp().addScaledVector(side, 14 * sunSd).addScaledVector(d, -9 + u * 3).add(V3(0, 3, 0)), l: mp().addScaledVector(d, -3).addScaledVector(side, 1.5 * sunSd), fov: 40 }) },
      // straight at him, the pilot and his canopy in the middle of the frame (on a phone held upright there is little room either side)
      { d: 6.0, slow: 0.4, cam: (u) => { const c = chT(), up = ev.chuteOn ? 2.6 * Math.min(1, ev.chT / 1.2) : 0; return { p: c.clone().addScaledVector(side, 11 * sunSd).addScaledVector(d, -3 + u * 1.5).add(V3(0, up - 1 + u * 0.8, 0)), l: c.clone().add(V3(0, up, 0)), fov: 44 }; } },
    ],
    caps: [[0.2, '<b>תצפית:</b> מיראז׳ שלנו מעל התעלה! סוחוי על הזנב שלו!', 2.6], [1.9, '<b>תצפית:</b> טיל! טיל באוויר!', 1.8], [4.2, '<b>תצפית:</b> פגיעה בכנף! הכנף נקרעה!', 2.3], [6.8, '<b>מ״פ:</b> הטייס נטש! יש מצנח!', 2.2], [10.2, '<b>מ״פ:</b> כולם להישאר במקורה, המטוסים חוזרים!', 2.4]],
    end: () => { M.mig.visible = false; },
  });
}
function updMirage(dt) {
  const ev = AIR.ev, M = AIR.models; ev.t += dt; const t = ev.t, T_HIT = 9, d = ev.d;
  const mig = M.mig, g = M.m.g;
  if (!ev.hit) { const p = ev.H.clone().addScaledVector(d, ev.sp * (t - T_HIT)); g.position.copy(p); g.rotation.set(0, Math.atan2(-d.z, d.x), Math.sin(t * 1.3) * 0.15); g.updateMatrixWorld(true); }
  // the MiG closes from behind, fires, and breaks away
  { const lag = 165 - Math.min(60, t * 7), p = g.position.clone().addScaledVector(d, -lag).add(V3(0, 12, 0)); if (ev.hit) { const k = t - T_HIT; p.add(V3(-k * 30, k * 18, k * 20)); } mig.position.copy(p); mig.rotation.set(0, Math.atan2(-d.z, d.x), ev.hit ? 0.9 : 0.1); }
  if (t > 7.2 && !ev.missile && !ev.hit) { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.4, 8).rotateZ(Math.PI / 2), MAT.dark); const fl = new THREE.Sprite(new THREE.SpriteMaterial({ map: FXT.fire, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, color: new THREE.Color(5, 2, 0.8) })); fl.scale.setScalar(2.2); m.add(fl); scene.add(m); ev.missile = { m, from: mig.position.clone() }; sndShot('ak', mig.position); }
  if (ev.missile && !ev.hit) { const k = clamp((t - 7.2) / 1.8, 0, 1), wp = M.m.wingR.localToWorld(V3(-2.4, 0, 2.3)), p = ev.missile.from.clone().lerp(wp, k * k * (3 - 2 * k)); ev.missile.m.position.copy(p); ev.missile.m.lookAt(wp); if (Math.random() < 0.9) { const s = FX.smoke.get(); s.life = 3.5; s.s.position.copy(p); s.s.material.color.set(0xd8d4cc); s.upd = (q, u) => { q.s.scale.setScalar(1 + u * 5); q.s.material.opacity = 0.7 * (1 - u); }; } }
  if (!ev.hit && t >= T_HIT) {
    ev.hit = true; if (ev.missile) { scene.remove(ev.missile.m); ev.missile = null; } const p = M.m.wingR.localToWorld(V3(-2.4, 0, 2.3)); fxExplosion(p, 2.2); sndBoom(p, 1.6); FX.shake = Math.max(FX.shake, 0.3);
    scene.attach(M.m.wingR); ev.wingV.copy(d).multiplyScalar(ev.sp * 0.6).add(V3(0, 12, 0)); ev.v = d.clone().multiplyScalar(ev.sp * 0.92); radio('תצפית', 'מיראז׳ נפגע!', 2);
  }
  if (ev.hit && !ev.crashed) {
    ev.v.y -= 9.8 * dt * 0.95; g.position.addScaledVector(ev.v, dt); ev.roll += dt * 2.6; g.rotation.set(0, Math.atan2(-d.z, d.x), ev.roll); g.rotateZ(-Math.atan2(-ev.v.y, Math.hypot(ev.v.x, ev.v.z)) * 0.0);
    const w = M.m.wingR; ev.wingV.y -= 9.8 * dt; w.position.addScaledVector(ev.wingV, dt); w.rotation.x += dt * 4; w.rotation.y += dt * 2.2;
    ev.smokeT -= dt; if (ev.smokeT <= 0) { ev.smokeT = 0.025; const s = FX.smoke.get(); s.life = 7; s.s.position.copy(g.position); s.s.material.color.set(0x1d1a17); s.upd = (q, u) => { q.s.scale.setScalar(3 + u * 12); q.s.material.opacity = 0.85 * (1 - u); }; const f = FX.fire.get(); f.life = 0.5; f.s.position.copy(g.position); f.s.scale.setScalar(7.5); f.upd = (q, u) => q.s.scale.setScalar(7.5 * (1 - u * 0.6)); }
    if (t > T_HIT + 1.0 && !ev.chuteOn) { ev.chuteOn = true; ev.chT = 0; ev.chP = g.position.clone().add(V3(0, 3, 0)); ev.chV = V3(d.x * 20, 24, d.z * 20); M.chute.visible = true; M.chute.scale.setScalar(1); M.chute.userData.canopy.scale.setScalar(0.02); }
    const gy = groundAt(g.position.x, g.position.z); if (g.position.y < Math.max(gy, 0) + 1) { ev.crashed = true; ev.crashP = g.position.clone(); ev.crashP.y = Math.max(gy, 0); fxExplosion(ev.crashP, 3.2); sndBoom(ev.crashP, 3); g.visible = false; D.smoke.push(smokeColumn(ev.crashP.x, ev.crashP.z, 36, true)); FX.shake = Math.max(FX.shake, 0.6); }
    if (w.position.y < Math.max(groundAt(w.position.x, w.position.z), 0)) { w.visible = false; }
  }
  if (ev.chuteOn) { const c = M.chute; ev.chV.multiplyScalar(Math.max(0, 1 - dt * 1.4)); ev.chP.addScaledVector(ev.chV, dt); ev.chP.y -= 4.2 * dt; ev.chP.x += 1.2 * dt; c.position.copy(ev.chP); ev.chT += dt; { const k = clamp((ev.chT - 0.4) / 0.9, 0, 1); c.userData.canopy.scale.setScalar(Math.max(0.02, k * k * (3 - 2 * k))); } c.rotation.z = Math.sin(t * 0.9) * 0.08;
    if (ev.chP.y < Math.max(groundAt(ev.chP.x, ev.chP.z), 0) + 0.3) { c.visible = false; ev.chuteOn = false; feed('הטייס נחת מאחורי המעוז', 'good'); } }
  if (ev.crashed && !ev.chuteOn && t > 20) { AIR.ev = null; M.m.wingR.visible = true; }
}
