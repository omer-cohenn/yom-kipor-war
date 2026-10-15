
/* ================= viewmodel: the FN FAL in the player's hands =================
   Built from a modeller's reference sheet of the 1973 Israeli-issue rifle. The side profiles are traced from the drawing (its pixels -> metres
   below) and extruded with rounded edges: the stock, the pistol grip, the receiver, the carry handle, the trigger guard. The round parts are
   turned (barrel, flash hider, gas plug), the handguard and the magazine are rounded boxes. The sight is the groove along the top of the
   carry handle: its back end the notch, the blade sunk in its front end.
   The hands are built joint by joint - palm, three bones to a finger, a thumb, knuckles and nails - on tanned, hairy forearms, the sleeves
   of the olive fatigues rolled to below the elbow, and an old watch worn face-in on the left wrist */
const VM_S = 0.00225, VMZ = (x) => 0.10 - (x - 154) * VM_S, VMY = (y) => 0.012 + (130.5 - y) * VM_S;   // drawing pixels -> the rifle's frame (muzzle toward -z, bore at y 0.012)
const SIGHT_Y = 0.1039;   // the line of sight runs down the groove in the top of the carry handle: its back end is the notch, the blade stands in it
const VM_PEEP_Z = VMZ(197.5), VM_POST_Z = VMZ(268);   // the back end of the groove, and the blade

/* ---------- textures ---------- */
function vmWoodTex() {
  const W = 512, H = 256, c = canvas(W, H), g = c.getContext('2d'), r = rng(731);
  g.fillStyle = '#76553d'; g.fillRect(0, 0, W, H);
  // broad tone bands, then the grain: long wavy lines along the length of the wood, darker and lighter, with figure where they bunch
  for (let i = 0; i < 9; i++) { const y = r() * H, h = 20 + r() * 60, gr = g.createLinearGradient(0, y - h, 0, y + h); const k = r() < 0.5 ? 'rgba(46,30,18,' : 'rgba(156,112,80,'; gr.addColorStop(0, k + '0)'); gr.addColorStop(0.5, k + (0.18 + r() * 0.2) + ')'); gr.addColorStop(1, k + '0)'); g.fillStyle = gr; g.fillRect(0, y - h, W, 2 * h); }
  for (let i = 0; i < 150; i++) { const y0 = r() * H, a = 1.5 + r() * 7, f = 0.004 + r() * 0.02, ph = r() * 6, dark = r() < 0.62; g.strokeStyle = dark ? `rgba(44,28,16,${0.18 + r() * 0.4})` : `rgba(178,135,100,${0.12 + r() * 0.25})`; g.lineWidth = 0.5 + r() * 1.6; g.beginPath(); for (let x = -8; x <= W + 8; x += 6) { const y = y0 + Math.sin(x * f + ph) * a + Math.sin(x * f * 3.1 + ph * 2) * a * 0.25; x > -8 ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
  for (let i = 0; i < 1600; i++) { g.fillStyle = `rgba(30,18,10,${0.25 + r() * 0.35})`; g.fillRect(r() * W, r() * H, 1.5 + r() * 4, 0.7); }   // pores
  for (let i = 0; i < 40; i++) { g.strokeStyle = `rgba(210,170,120,${0.08 + r() * 0.12})`; g.lineWidth = 0.6; const x = r() * W, y = r() * H; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 10 + r() * 30, y + (r() - 0.5) * 6); g.stroke(); }   // scratches through the oil
  const t = tex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
function vmMetalTex() {
  const n = 256, c = canvas(n), g = c.getContext('2d'), r = rng(519);
  g.fillStyle = '#b4b4b4'; g.fillRect(0, 0, n, n);
  for (let i = 0; i < 9000; i++) { const v = 150 + r() * 70; g.fillStyle = `rgba(${v},${v},${v},0.35)`; g.fillRect(r() * n, r() * n, 1, 1); }   // the parkerized grain
  for (let i = 0; i < 26; i++) { const x = r() * n, y = r() * n, rr = 6 + r() * 26, gr = g.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, `rgba(${r() < 0.5 ? '70,68,64' : '190,188,180'},0.1)`); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - rr, y - rr, 2 * rr, 2 * rr); }
  for (let i = 0; i < 70; i++) { g.strokeStyle = `rgba(220,220,214,${0.1 + r() * 0.25})`; g.lineWidth = 0.5 + r() * 0.6; const x = r() * n, y = r() * n, a = r() * 6.28, l = 3 + r() * 16; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }   // wear on the edges and scratches
  const t = tex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
// skin: sun-tanned, mottled, with pores; on the forearm also the hair, laid along the arm (the v direction of its uv)
function vmSkinTex(hair) {
  const n = 512, c = canvas(n), g = c.getContext('2d'), r = rng(hair ? 377 : 233);
  g.fillStyle = '#b97f58'; g.fillRect(0, 0, n, n);
  for (let i = 0; i < 70; i++) { const x = r() * n, y = r() * n, rr = 14 + r() * 50, gr = g.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, r() < 0.5 ? 'rgba(150,70,50,0.16)' : 'rgba(225,175,135,0.14)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - rr, y - rr, 2 * rr, 2 * rr); }
  for (let i = 0; i < 9000; i++) { g.fillStyle = r() < 0.5 ? 'rgba(90,50,30,0.10)' : 'rgba(240,200,160,0.08)'; g.fillRect(r() * n, r() * n, 1.2, 1.2); }
  for (let i = 0; i < 30; i++) { const x = r() * n, y = r() * n, rr = 5 + r() * 20; g.fillStyle = 'rgba(110,85,60,0.12)'; g.beginPath(); g.ellipse(x, y, rr, rr * 0.6, r() * 3, 0, 6.28); g.fill(); }   // dust
  if (hair) { g.lineCap = 'round'; for (let i = 0; i < 7000; i++) { const x = r() * n, y = r() * n, v = 1 - y / n, dens = clamp((v - 0.04) / 0.22, 0, 1); if (r() > dens * dens * (3 - 2 * dens)) continue; const l = 5 + r() * 11, a = Math.PI / 2 + (r() - 0.5) * 0.7 + Math.sin(x * 0.02) * 0.3; g.strokeStyle = `rgba(${44 + r() * 30},${26 + r() * 16},${14 + r() * 10},${0.35 + r() * 0.4})`; g.lineWidth = 0.6 + r() * 0.5; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * l * 0.5 + 1.5, y + Math.sin(a) * l * 0.5, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); } }
  const t = tex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
function vmFabricTex() {
  const n = 256, c = canvas(n), g = c.getContext('2d'), r = rng(611);
  g.fillStyle = '#6a6c45'; g.fillRect(0, 0, n, n);
  for (let y = 0; y < n; y += 2) { g.fillStyle = `rgba(40,42,24,${0.12 + r() * 0.1})`; g.fillRect(0, y, n, 1); }
  for (let x = 0; x < n; x += 2) { g.fillStyle = `rgba(150,150,110,${0.06 + r() * 0.06})`; g.fillRect(x, 0, 1, n); }
  for (let i = 0; i < 30; i++) { const x = r() * n, y = r() * n, rr = 10 + r() * 40, gr = g.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, r() < 0.6 ? 'rgba(120,100,70,0.22)' : 'rgba(30,32,18,0.2)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - rr, y - rr, 2 * rr, 2 * rr); }   // dust and sweat
  const t = tex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
function vmDialTex() {
  const n = 128, c = canvas(n), g = c.getContext('2d'); g.fillStyle = '#e9e1cc'; g.fillRect(0, 0, n, n);
  const gr = g.createRadialGradient(64, 64, 20, 64, 64, 64); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(90,70,40,0.35)'); g.fillStyle = gr; g.fillRect(0, 0, n, n);
  g.strokeStyle = '#1c1a16'; for (let i = 0; i < 60; i++) { const a = i / 60 * Math.PI * 2, big = i % 5 === 0, r0 = big ? 46 : 52; g.lineWidth = big ? 3.2 : 1.2; g.beginPath(); g.moveTo(64 + Math.sin(a) * r0, 64 - Math.cos(a) * r0); g.lineTo(64 + Math.sin(a) * 58, 64 - Math.cos(a) * 58); g.stroke(); }
  g.lineCap = 'round'; g.lineWidth = 4; g.beginPath(); g.moveTo(64, 64); g.lineTo(64 + Math.sin(-1.1) * 30, 64 - Math.cos(-1.1) * 30); g.stroke(); g.lineWidth = 2.6; g.beginPath(); g.moveTo(64, 64); g.lineTo(64 + Math.sin(2.2) * 44, 64 - Math.cos(2.2) * 44); g.stroke();
  g.fillStyle = '#1c1a16'; g.beginPath(); g.arc(64, 64, 3.5, 0, 6.28); g.fill();
  return tex(c);
}
const VMTX = { wood: vmWoodTex(), metal: vmMetalTex(), skin: vmSkinTex(false), arm: vmSkinTex(true), fabric: vmFabricTex(), dial: vmDialTex() };
VMTX.wood.repeat.set(4.5, 4.5); VMTX.metal.repeat.set(9, 9); VMTX.skin.repeat.set(1, 1); VMTX.arm.repeat.set(1, 1); VMTX.fabric.repeat.set(3, 3);
const VMAT = {
  metal: new THREE.MeshStandardMaterial({ vertexColors: true, map: VMTX.metal, metalness: 0.22, roughness: 0.6, envMapIntensity: 0.2 }),
  wood: new THREE.MeshStandardMaterial({ vertexColors: true, map: VMTX.wood, bumpMap: VMTX.wood, bumpScale: 0.35, metalness: 0, roughness: 0.64, envMapIntensity: 0.25 }),
  skin: new THREE.MeshStandardMaterial({ vertexColors: true, map: VMTX.skin, metalness: 0, roughness: 0.63, envMapIntensity: 0.3 }),
  arm: new THREE.MeshStandardMaterial({ vertexColors: true, map: VMTX.arm, metalness: 0, roughness: 0.64, envMapIntensity: 0.3 }),
  cloth: new THREE.MeshStandardMaterial({ vertexColors: true, map: VMTX.fabric, bumpMap: VMTX.fabric, bumpScale: 0.6, metalness: 0, roughness: 0.95, envMapIntensity: 0.25 }),
  leather: new THREE.MeshStandardMaterial({ color: 0x4f3220, roughness: 0.72, metalness: 0, envMapIntensity: 0.3 }),
  steel: new THREE.MeshStandardMaterial({ color: 0xc9c6bd, roughness: 0.28, metalness: 0.92, envMapIntensity: 0.9 }),
  dial: new THREE.MeshStandardMaterial({ map: VMTX.dial, roughness: 0.35, metalness: 0, envMapIntensity: 0.5 }),
};

/* ---------- geometry helpers ---------- */
// a side profile (drawing pixels, in the z-y plane) extruded across the rifle to width w, its edges rounded, centred on x = xc; holes too
function vmSlab(pts, w, bevel = 0.003, xc = 0, holes = null, seg = 3) {
  const sh = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(VMZ(x), VMY(y))));
  if (holes) for (const h of holes) sh.holes.push(new THREE.Path(h.map(([x, y]) => new THREE.Vector2(VMZ(x), VMY(y)))));
  const d = Math.max(0.0008, w - 2 * bevel);
  const g = new THREE.ExtrudeGeometry(sh, { depth: d, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelOffset: -bevel, bevelSegments: seg, curveSegments: 6 });
  g.rotateY(-Math.PI / 2).translate(xc + d / 2, 0, 0); return g;
}
// a rounded box lying along z (cross-section w x h with corner radius r), centred on the origin
function vmRBox(w, h, len, r, bevel = 0.0015) {
  r = Math.min(r, w / 2 - 1e-4, h / 2 - 1e-4); const s = new THREE.Shape(), x = w / 2 - r, y = h / 2 - r;
  s.moveTo(-x, -h / 2); s.lineTo(x, -h / 2); s.absarc(x, -y, r, -Math.PI / 2, 0, false); s.lineTo(w / 2, y); s.absarc(x, y, r, 0, Math.PI / 2, false); s.lineTo(-x, h / 2); s.absarc(-x, y, r, Math.PI / 2, Math.PI, false); s.lineTo(-w / 2, -y); s.absarc(-x, -y, r, Math.PI, Math.PI * 1.5, false);
  const d = Math.max(0.0008, len - 2 * bevel), g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelOffset: -bevel, bevelSegments: 2, curveSegments: 5 });
  g.translate(0, 0, -d / 2); return g;
}
function vmSwapUV(g, k = 1) { const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) { const u = uv.getX(i), v = uv.getY(i); uv.setXY(i, v * k, u * k); } return g; }
const vmTube = (r0, r1, z0, z1, y = 0.012, seg = 20, x = 0) => new THREE.CylinderGeometry(r1, r0, Math.abs(z1 - z0), seg, 1).rotateX(-Math.PI / 2).translate(x, y, (z0 + z1) / 2);   // r0 at z0, r1 at z1

/* ---------- the rifle ---------- */
function vmRifleGeo() {
  const K = 0xa9a69e, K2 = 0x99968f, K3 = 0x7c7a74, BL = 0x0c0c0c, WD = 0xf2e8de, metal = [], wood = [];
  const M = (g, c = K, m) => metal.push([g, c, m]), Wd = (g, c = WD, m) => wood.push([g, c, m]);
  // the stock: comb nearly in line with the bore, the toe sweeping down to the butt; narrower at the wrist than at the butt
  { const g = vmSlab([[19, 128], [60, 127], [110, 126], [125, 124], [135, 121], [146, 117], [149, 117], [149, 148], [140, 150], [130, 151], [120, 155], [110, 158], [100, 163], [90, 166], [80, 171], [70, 175], [60, 178], [50, 184], [40, 187], [30, 190], [22, 190], [19, 188]], 0.046, 0.007);
    const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const z = p.getZ(i), k = lerp(0.8, 1, clamp((z - VMZ(149)) / (VMZ(19) - VMZ(149)), 0, 1)); p.setX(i, p.getX(i) * k); } g.computeVertexNormals(); Wd(g); }
  M(vmSlab([[14, 130], [19, 128], [19, 190], [14, 188]], 0.048, 0.002), K2);   // the steel butt plate
  M(vmSlab([[146, 117], [150, 117], [150, 149], [146, 149]], 0.044, 0.002), K2);   // the stock's ferrule against the receiver
  // the receiver: the lower part as a profile, the rounded cover on top, the ring at the front where the handguard starts
  M(vmSlab([[148, 119], [292, 119], [293, 121], [293, 140], [279, 141], [277, 152], [150, 151], [148, 148]], 0.043, 0.0028));
  M(vmRBox(0.039, 0.03, (287 - 150) * VM_S, 0.011), K, M4(0, VMY(118.8), VMZ(218.5)));
  M(vmRBox(0.047, 0.066, 0.011, 0.02), K2, M4(0, VMY(125.2), VMZ(292)));
  for (const sd of [-1, 1]) M(new THREE.BoxGeometry(0.0012, 0.0018, (288 - 165) * VM_S), 0x26272a, M4(sd * 0.0216, VMY(131), VMZ(226.5)));
  M(vmSlab([[235, 145], [281, 145], [281, 153], [235, 153]], 0.0465, 0.0018), K2);
  M(vmSlab([[196, 135], [236, 135], [236, 151], [196, 151]], 0.0452, 0.0018), K2);
  // the ejection port on the right with the bolt carrier in it; the slot of the cocking handle and the handle itself on the left
  M(new THREE.BoxGeometry(0.0016, 0.012, (262 - 222) * VM_S), BL, M4(0.02, VMY(121), VMZ(242)));
  M(new THREE.BoxGeometry(0.0014, 0.0075, (258 - 226) * VM_S), 0x8a8c90, M4(0.0204, VMY(121), VMZ(242)));
  M(new THREE.BoxGeometry(0.0014, 0.0035, (262 - 200) * VM_S), BL, M4(-0.0213, VMY(121), VMZ(231)));
  M(new THREE.BoxGeometry(0.028, 0.0075, 0.009), K2, M4(-0.034, VMY(121), VMZ(259)));
  M(new THREE.CylinderGeometry(0.0055, 0.0055, 0.008, 12).rotateZ(Math.PI / 2), K3, M4(-0.049, VMY(121), VMZ(259)));
  // the fire selector above the grip, the takedown pin, the magazine catch
  M(new THREE.CylinderGeometry(0.0072, 0.0072, 0.003, 16).rotateZ(Math.PI / 2), K3, M4(-0.0225, VMY(137), VMZ(197)));
  M(new THREE.BoxGeometry(0.0025, 0.016, 0.005), K3, M4(-0.0235, VMY(131), VMZ(201), -0.5, 0, 0));
  M(new THREE.CylinderGeometry(0.0042, 0.0042, 0.047, 12).rotateZ(Math.PI / 2), K3, M4(0, VMY(144), VMZ(159)));
  M(new THREE.BoxGeometry(0.046, 0.007, 0.008), K3, M4(0, VMY(146), VMZ(235)));
  // the pistol grip: wood, raked back, well rounded, with a steel cap at its foot
  Wd(vmSlab([[206, 151], [176, 151], [170, 165], [163, 174], [156, 183], [154, 190], [157, 194], [166, 198], [175, 201], [180, 194], [187, 182], [195, 170], [200, 163], [206, 155]], 0.032, 0.009, 0, null, 4), 0xc8b29a);
  // the trigger guard with the trigger in it
  M(vmSlab([[203, 151], [205, 160], [208, 168], [217, 170], [225, 164], [231, 158], [235, 151], [231, 151], [228, 156], [223, 161], [216, 166], [210, 164], [208, 158], [207, 151]], 0.012, 0.0018), K2);
  M(vmSlab([[211, 151], [217, 151], [216, 156], [214, 161], [211, 163], [212, 157]], 0.0055, 0.001), K3);
  // the carry handle - the bridge - is the sight: two slim legs and a slim rail across their tops, a groove milled down the rail. Looking
  // down the groove its back end is the notch, and the blade stands down inside it at the front, its tip level with the line
  for (const pts of [[[190, 113.5], [192.4, 113.5], [200.4, 92], [198, 92]], [[279, 113.5], [281.4, 113.5], [279, 92], [276.6, 92]]]) M(vmSlab(pts, 0.007, 0.0012), K2);
  { const W = 0.0043, y0 = 0.0999, y1 = 0.1044, c = 0.0006, gt = 0.0018, gf = 0.0013, yf = 0.1012, sh = new THREE.Shape();
    [[-W, y0], [W, y0], [W, y1 - c], [W - c, y1], [gt + 0.0002, y1], [gt, y1 - 0.0002], [gf, yf], [-gf, yf], [-gt, y1 - 0.0002], [-gt - 0.0002, y1], [-W + c, y1], [-W, y1 - c]].forEach(([x, y], k) => k ? sh.lineTo(x, y) : sh.moveTo(x, y));
    const L = (279 - 197.5) * VM_S; M(new THREE.ExtrudeGeometry(sh, { depth: L, bevelEnabled: false }).translate(0, 0, VMZ(279)), K2); }
  // the handguard: two halves of oiled wood with a seam between them, a long vent each side, steel rings at both ends
  Wd(vmSwapUV(vmRBox(0.057, 0.067, (402 - 296) * VM_S, 0.022, 0.002)), WD, M4(0, VMY(125.2), VMZ(349)));
  for (const sd of [-1, 1]) { M(new THREE.CapsuleGeometry(0.0042, (393 - 307) * VM_S, 4, 10).rotateX(Math.PI / 2), BL, M4(sd * 0.0272, VMY(120), VMZ(350), 0, 0, 0, 0.5, 1, 1)); M(new THREE.BoxGeometry(0.0012, 0.0016, (402 - 296) * VM_S), 0x241509, M4(sd * 0.0287, VMY(129), VMZ(349))); }
  M(vmRBox(0.059, 0.069, 0.01, 0.023), K2, M4(0, VMY(125.2), VMZ(295.6))); M(vmRBox(0.059, 0.069, 0.01, 0.023), K2, M4(0, VMY(125.2), VMZ(401)));
  // the gas block, its regulator and plug, and the front sight between its ears; the post's tip is on the line of sight
  M(vmRBox(0.036, 0.052, (426 - 405) * VM_S, 0.011), K, M4(0, VMY(125.5), VMZ(415.5)));
  M(vmTube(0.0078, 0.0078, VMZ(426), VMZ(432), VMY(118.5), 16), K2); for (let i = 0; i < 6; i++) M(new THREE.BoxGeometry(0.0016, 0.0035, 0.0125), BL, M4(Math.sin(i * 1.047) * 0.0078, VMY(118.5) + Math.cos(i * 1.047) * 0.0078, VMZ(429), 0, 0, -i * 1.047));
  // the barrel, the bayonet lug and front swivel under it, and the slotted birdcage flash hider at the muzzle
  M(vmTube(0.0098, 0.0088, VMZ(420), VMZ(494), 0.012, 22), K3);
  M(new THREE.BoxGeometry(0.012, 0.012, 0.022), K2, M4(0, VMY(139), VMZ(431))); M(new THREE.TorusGeometry(0.008, 0.0018, 6, 14), K3, M4(0, VMY(146), VMZ(432), 0, Math.PI / 2, 0));
  M(vmTube(0.0128, 0.0128, VMZ(493), VMZ(527), 0.012, 24), K3);
  for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; M(new THREE.BoxGeometry(0.0032, 0.0028, (495 - 472) * VM_S), BL, M4(Math.sin(a) * 0.0122, 0.012 + Math.cos(a) * 0.0122, VMZ(511.5), 0, 0, -a)); }
  M(vmTube(0.0135, 0.0135, VMZ(491), VMZ(494), 0.012, 24), K2); M(new THREE.CylinderGeometry(0.0058, 0.0058, 0.004, 16).rotateX(Math.PI / 2), BL, M4(0, 0.012, VMZ(527) - 0.0006));
  // the rear swivel under the stock
  M(new THREE.TorusGeometry(0.009, 0.0018, 6, 14), K3, M4(0, VMY(178), VMZ(64), 0, Math.PI / 2, 0));
  return { metal: build(metal), wood: build(wood) };
}
// the magazine: its own mesh, so a reload can take it out
function vmMagGeo() {
  const K = 0x66686c, K2 = 0x58595d, parts = [];
  parts.push([vmSlab([[239, 150], [277, 150], [276, 203], [275, 206], [240, 207], [239, 204]], 0.028, 0.0018), K]);
  parts.push([vmSlab([[236, 201], [279, 201], [279, 206], [277, 209], [238, 209], [236, 206]], 0.031, 0.0015), K2]);
  for (const sd of [-1, 1]) for (const y of [168, 188]) parts.push([new THREE.BoxGeometry(0.0016, 0.0042, (272 - 244) * VM_S), 0x77797d, M4(sd * 0.0143, VMY(y), VMZ(258))]);
  return build(parts);
}
// the magazine's own origin: the middle of the top of the magazine well, so the reload slides it straight down out of it
const VM_MAG0 = V3(0, VMY(152), VMZ(258));

/* ---------- hands ---------- */
// a smooth, slightly boxy blob: a sphere pushed toward a box (a superellipsoid), half-extents ax, ay, az
function vmBlob(ax, ay, az, e = 0.6, ws = 20, hs = 14) {
  const g = new THREE.SphereGeometry(1, ws, hs), p = g.attributes.position, f = (v) => Math.sign(v) * Math.pow(Math.abs(v), e);
  for (let i = 0; i < p.count; i++) p.setXYZ(i, f(p.getX(i)) * ax, f(p.getY(i)) * ay, f(p.getZ(i)) * az);
  g.computeVertexNormals(); return g;
}
const vmRot = (ax, a) => new THREE.Matrix4().makeRotationAxis(ax, a), VX = V3(1, 0, 0), VY = V3(0, 1, 0), VZ = V3(0, 0, 1);
// one bone: a tapered tube from the joint along +z, rounded at the joint
function vmBone(parts, m, L, r0, r1, col) {
  parts.push([new THREE.CylinderGeometry(r1, r0, L, 12, 1).rotateX(Math.PI / 2).translate(0, 0, L / 2), col, m.clone()]);
  parts.push([new THREE.SphereGeometry(r0 * 1.02, 12, 8), col, m.clone()]);
}
/* a hand in its own frame: the wrist at the origin, the fingers along +z when flat, the back of the hand toward +y; the thumb is on +x for a
   right hand, on -x for a left one. pose.f: four fingers (index..little) as [spread toward the thumb, mcp, pip, dip] in radians (flexion bends
   toward the palm); pose.t: the thumb as [swing out, roll, flex at the base, flex 1, flex 2]. skip: a finger left out (built on its own) */
const VM_FING = [{ x: 0.029, z: 0.091, y: 0.001, L: [0.043, 0.025, 0.02], r: 0.0099 }, { x: 0.009, z: 0.096, y: 0.002, L: [0.047, 0.029, 0.021], r: 0.0102 }, { x: -0.01, z: 0.093, y: 0.001, L: [0.044, 0.027, 0.02], r: 0.0096 }, { x: -0.027, z: 0.085, y: -0.001, L: [0.034, 0.021, 0.018], r: 0.0086 }];
const SKN = 0xe8e2dc, SKN2 = 0xdcc6ba, NAIL = 0xf2dcd2;
function vmFingerParts(parts, side, i, f) {
  const s = side === 'R' ? 1 : -1, F = VM_FING[i], [spr, a0, a1, a2] = f, r = F.r;
  let m = new THREE.Matrix4().makeTranslation(F.x * s, F.y, F.z).multiply(vmRot(VY, spr * s)).multiply(vmRot(VX, a0));
  parts.push([new THREE.SphereGeometry(r * 1.18, 12, 8).translate(0, r * 0.32, 0.002), SKN2, m.clone()]);   // the knuckle
  const rs = [r, r * 0.9, r * 0.8, r * 0.72];
  vmBone(parts, m, F.L[0], rs[0], rs[1], SKN); m = m.multiply(new THREE.Matrix4().makeTranslation(0, 0, F.L[0])).multiply(vmRot(VX, a1));
  vmBone(parts, m, F.L[1], rs[1], rs[2], SKN); m = m.multiply(new THREE.Matrix4().makeTranslation(0, 0, F.L[1])).multiply(vmRot(VX, a2));
  vmBone(parts, m, F.L[2], rs[2], rs[3], SKN); parts.push([new THREE.SphereGeometry(rs[3], 12, 8).scale(1, 0.92, 1.15).translate(0, 0, F.L[2]), SKN, m.clone()]);
  parts.push([vmBlob(rs[3] * 0.86, 0.0013, F.L[2] * 0.36, 0.5, 10, 6).translate(0, rs[3] * 0.86, F.L[2] * 0.66), NAIL, m.clone()]);   // the nail
}
function vmHandGeo(side, pose, skip = -1) {
  const s = side === 'R' ? 1 : -1, parts = [];
  // the palm: wider at the knuckles than at the wrist, its back gently arched; the heel of the hand and the ball of the thumb on the palm side
  { const g = vmBlob(0.041, 0.0135, 0.046, 0.55, 34, 22), p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), t = (z + 0.046) / 0.092; p.setXYZ(i, x * lerp(0.76, 1, t), y + 0.004 * (1 - (x / 0.041) ** 2) * (y > 0 ? 1 : 0.3), z + 0.051); }
    g.computeVertexNormals(); parts.push([g, SKN]); }
  parts.push([vmBlob(0.018, 0.013, 0.027, 0.8, 22, 14), SKN, new THREE.Matrix4().makeTranslation(0.021 * s, -0.009, 0.036).multiply(vmRot(VY, -0.35 * s))]);   // the ball of the thumb
  parts.push([vmBlob(0.019, 0.011, 0.02, 0.8, 22, 14), SKN, M4(-0.017 * s, -0.008, 0.03)]);   // the heel of the hand
  for (let i = 0; i < 4; i++) if (i !== skip) vmFingerParts(parts, side, i, pose.f[i]);
  // the thumb: from the side of the palm, swung out, rolled so its nail faces outward, three bones
  { const [sw, roll, b0, b1, b2] = pose.t; let m = new THREE.Matrix4().makeTranslation(0.025 * s, -0.008, 0.024).multiply(vmRot(VY, sw * s)).multiply(vmRot(VZ, roll * s)).multiply(vmRot(VX, b0));
    vmBone(parts, m, 0.04, 0.0128, 0.0118, SKN); m = m.multiply(new THREE.Matrix4().makeTranslation(0, 0, 0.04)).multiply(vmRot(VX, b1));
    parts.push([new THREE.SphereGeometry(0.0128, 12, 8).translate(0, 0.004, 0), SKN2, m.clone()]);
    vmBone(parts, m, 0.031, 0.0118, 0.0106, SKN); m = m.multiply(new THREE.Matrix4().makeTranslation(0, 0, 0.031)).multiply(vmRot(VX, b2));
    vmBone(parts, m, 0.026, 0.0106, 0.0094, SKN); parts.push([new THREE.SphereGeometry(0.0094, 12, 8).scale(1, 0.9, 1.15).translate(0, 0, 0.026), SKN, m.clone()]);
    parts.push([vmBlob(0.0085, 0.0014, 0.0095, 0.5, 10, 6).translate(0, 0.0086, 0.017), NAIL, m.clone()]); }
  // the colour in the creases: a shade darker toward the palm and between the knuckles
  const g = build(parts), p = g.attributes.position, c = g.attributes.color;
  for (let i = 0; i < p.count; i++) { const k = lerp(0.88, 1.02, clamp((p.getY(i) + 0.02) / 0.04, 0, 1)); c.setXYZ(i, c.getX(i) * k, c.getY(i) * k * 0.98, c.getZ(i) * k * 0.97); }
  return g;
}
/* the arm as one skin: it grows out of the heel of the hand, runs through the wrist along the line of the hand and bends smoothly onto the
   line of the forearm, out to the elbow - no seam where the hand ends and the arm begins. The cross-section is wider than it is thick, narrowest
   just behind the wrist (with the knob of the ulna on the little-finger side), the muscles swelling toward the elbow. Returns the geometry and
   frameAt(d): the frame and the cross-section d metres from the wrist toward the elbow (for the watch and the sleeve) */
function vmArmGeo(side, hm, elbow, L = 0.31) {
  const s = side === 'R' ? 1 : -1, hx = V3(), hy = V3(), hz = V3(), W = V3(); hm.extractBasis(hx, hy, hz); W.setFromMatrixPosition(hm);
  const e = elbow.clone().normalize(), yF = hy.clone().addScaledVector(e, -hy.dot(e)).normalize(), IN = 0.03;
  const P0 = W.clone().addScaledVector(hz, IN), P1 = W.clone().addScaledVector(hz, -0.014), P2 = W.clone().addScaledVector(e, 0.085), P3 = W.clone().addScaledVector(e, L);
  const bez = (u, o) => { const a = 1 - u; return o.set(0, 0, 0).addScaledVector(P0, a * a * a).addScaledVector(P1, 3 * a * a * u).addScaledVector(P2, 3 * a * u * u).addScaledVector(P3, u * u * u); };
  const NS = 48, NR = 26, C = [], S = [0];
  for (let i = 0; i <= NS; i++) { C.push(bez(i / NS, V3())); if (i) S.push(S[i - 1] + C[i].distanceTo(C[i - 1])); }
  const tot = S[NS], sW = (() => { let best = 0, bd = 1e9; C.forEach((c, i) => { const d = c.distanceTo(W); if (d < bd) { bd = d; best = S[i]; } }); return best; })();
  const size = (d) => { if (d < 0) return [lerp(0.0255, 0.0282, clamp(1 + d / IN, 0, 1)), lerp(0.0155, 0.0185, clamp(1 + d / IN, 0, 1))];
    const t = clamp(d / (L - 0.01), 0, 1), neck = 0.0015 * Math.exp(-((d - 0.025) ** 2) / 0.0003); return [lerp(0.0282, 0.041, Math.pow(t, 0.8)) + 0.004 * Math.sin(Math.PI * clamp((t - 0.45) / 0.55, 0, 1)) - neck, lerp(0.0185, 0.035, Math.pow(t, 0.9)) - neck * 0.6]; };
  const frames = C.map((c, i) => { const T = (i < NS ? C[i + 1].clone().sub(c) : c.clone().sub(C[i - 1])).normalize(), b = clamp((S[i] - sW + 0.01) / 0.09, 0, 1), k = b * b * (3 - 2 * b);
    const up = hy.clone().lerp(yF, k), y = up.addScaledVector(T, -up.dot(T)).normalize(), z = T.clone().negate(), x = y.clone().cross(z).normalize(); return { c, x, y, z }; });
  const pos = [], uv = [], idx = [];
  for (let i = 0; i <= NS; i++) { const F = frames[i], d = S[i] - sW, [w, h] = size(d), v = S[i] / tot;
    for (let j = 0; j <= NR; j++) { const th = j / NR * Math.PI * 2, ct = Math.cos(th), st = Math.sin(th);
      // the back of the forearm is rounder than its inside; the knob of the ulna just behind the wrist on the little-finger side
      const bump = 0.0032 * Math.exp(-((d - 0.012) ** 2) / 0.00012) * Math.exp(-(((th - (s > 0 ? 2.2 : 0.94)) % 6.283) ** 2) / 0.12), r = 1 + (st > 0 ? 0.06 * st * clamp(d / 0.12, 0, 1) : 0);
      const px = ct * (w + bump) * r, py = st * (h + bump) * r; pos.push(F.c.x + F.x.x * px + F.y.x * py, F.c.y + F.x.y * px + F.y.y * py, F.c.z + F.x.z * px + F.y.z * py); uv.push(j / NR * 2, v); } }
  for (let i = 0; i < NS; i++) for (let j = 0; j < NR; j++) { const a = i * (NR + 1) + j, b = a + NR + 1; idx.push(a, b, a + 1, a + 1, b, b + 1); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
  // the seam where the ring closes: average the two copies of each normal so no line shows
  { const n = g.attributes.normal; for (let i = 0; i <= NS; i++) { const a = i * (NR + 1), b = a + NR, nx = n.getX(a) + n.getX(b), ny = n.getY(a) + n.getY(b), nz = n.getZ(a) + n.getZ(b), l = Math.hypot(nx, ny, nz) || 1; n.setXYZ(a, nx / l, ny / l, nz / l); n.setXYZ(b, nx / l, ny / l, nz / l); } }
  colored(g, 0xffffff);
  const frameAt = (d) => { const sd = sW + d; let i = 0; while (i < NS - 1 && S[i + 1] < sd) i++; const F = frames[i], G2 = frames[i + 1], t = clamp((sd - S[i]) / ((S[i + 1] - S[i]) || 1), 0, 1);
    const c = F.c.clone().lerp(G2.c, t), x = F.x.clone().lerp(G2.x, t).normalize(), z = F.z.clone().lerp(G2.z, t).normalize(), y = z.clone().cross(x).normalize(); return { m: new THREE.Matrix4().makeBasis(x, y, z).setPosition(c), size: size(d) }; };
  return { geo: g, frameAt };
}
/* the sleeve, rolled up to below the elbow: two thick rolls of cloth and the sleeve behind them, all creased; z0: where the roll begins */
function vmSleeveGeo(z0 = 0) {
  const parts = [], r = rng(901);
  for (const [dz, R, t] of [[0, 0.047, 0.016], [-0.022, 0.05, 0.017]]) { const g = new THREE.TorusGeometry(1, t / R, 12, 30), p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), a = Math.atan2(y, x), n = 1 + 0.07 * Math.sin(a * 5 + dz * 90) + 0.05 * Math.sin(a * 11 + 1.3); p.setXYZ(i, x * R * n, y * R * 0.86 * n, z * R * 1.1); }
    g.computeVertexNormals(); parts.push([g, 0xffffff, M4(0, 0.002, z0 + dz)]); }
  { const g = new THREE.CylinderGeometry(1, 1, 1, 26, 10, true).rotateX(Math.PI / 2).translate(0, 0, -0.5), p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), t = -p.getZ(i), a = Math.atan2(y, x), fold = 1 + 0.06 * Math.sin(a * 4 + t * 9) + 0.035 * Math.sin(a * 9 - t * 17) + 0.02 * Math.sin(a * 17 + r() * 0.2); const R = lerp(0.05, 0.066, t) * fold; p.setXYZ(i, x * R, y * R * 0.9, z0 - 0.03 - t * 0.42); }
    g.computeVertexNormals(); parts.push([g, 0xffffff]); }
  const g = build(parts), p = g.attributes.position, c = g.attributes.color, o = V3();
  for (let i = 0; i < p.count; i++) { o.set(p.getX(i), p.getY(i), 0); const k = clamp(0.62 + o.length() * 6.5, 0.7, 1.08); c.setXYZ(i, k, k, k * 0.96); }   // the creases fall into shade
  return g;
}
/* an old field watch worn face-in, on the inside of the wrist: leather strap, steel case and bezel, a cream dial; w, h: the wrist's half-width
   and half-thickness where it sits */
function vmWatch(w, h) {
  const g = new THREE.Group();
  const band = new THREE.TorusGeometry(1, 0.05, 6, 36); band.scale(w + 0.0014, h + 0.0014, 0.17); g.add(new THREE.Mesh(band, VMAT.leather));
  const cy = -h - 0.0038, cas = new THREE.CylinderGeometry(0.0168, 0.0172, 0.0075, 28).translate(0, cy, 0); g.add(new THREE.Mesh(cas, VMAT.steel));
  const bez = new THREE.TorusGeometry(0.0155, 0.0016, 8, 28).rotateX(Math.PI / 2).translate(0, cy - 0.0037, 0); g.add(new THREE.Mesh(bez, VMAT.steel));
  const dial = new THREE.CircleGeometry(0.0146, 28).rotateX(Math.PI / 2).rotateY(Math.PI / 2).translate(0, cy - 0.0039, 0); g.add(new THREE.Mesh(dial, VMAT.dial));
  const crown = new THREE.CylinderGeometry(0.0024, 0.0024, 0.004, 10).rotateZ(Math.PI / 2).translate(0.0185, cy, 0); g.add(new THREE.Mesh(crown, VMAT.steel));
  for (const sz of [-1, 1]) { const lug = new THREE.BoxGeometry(0.009, 0.004, 0.006).translate(0, cy + 0.0005, sz * 0.0185); g.add(new THREE.Mesh(lug, VMAT.steel)); }
  return g;
}
// a frame from two directions: the hand's z (where the fingers point when flat) and its y (the back of the hand), x completing it
function vmFrame(pos, zDir, yDir) { const z = zDir.clone().normalize(), x = yDir.clone().cross(z).normalize(), y = z.clone().cross(x).normalize(); return new THREE.Matrix4().makeBasis(x, y, z).setPosition(pos); }

/* ---------- the poses ---------- */
// the right hand round the pistol grip: three fingers wrapped round its front, the index laid straight along the side of the receiver above
// the guard, the thumb over the left side; when firing the index comes down onto the trigger
const VM_POSE_R = { f: [[0.62, 0.08, 0.12, 0.08], [-0.05, 1.32, 1.55, 0.7], [-0.1, 1.38, 1.55, 0.72], [-0.18, 1.42, 1.5, 0.75]], t: [0.62, -1.05, 0.5, 0.55, 0.35] };
const VM_IDX_FIRE = [0.18, 0.62, 1.05, 0.55];
// the left hand under the handguard, palm up: the fingers curled up its right side and angled toward the muzzle, the thumb laid along its left
// flank, pointing at the muzzle (not standing up in the air).
// Found by a search over placements, turns and bends: nothing of the hand shows through the peep when aiming, the palm rests on the wood and
// the fingers lie on it, not in it
const VM_POSE_L = { f: [[0.02, 0.25, 1.0, 0.4], [0.0, 0.3, 1.0, 0.4], [-0.02, 0.33, 1.02, 0.4], [-0.045, 0.37, 1.05, 0.4]], t: [0.092, 1.087, 0.337, 0.633, 0.153] };
const VM_HAND = {
  // where each hand sits on the rifle (rifle frame): its wrist, the way its fingers point, the way the back of the hand faces; the elbow's direction
  R: { palm: V3(0.031, VMY(173), VMZ(163)), z: V3(-0.06, -0.3, -0.95), y: V3(1, 0.12, 0.02), elbow: V3(0.42, -0.5, 0.76) },
  L: { palm: V3(-0.034, VMY(130.5) - 0.031, VMZ(350)), z: V3(1, 0, -0.45), y: V3(-0.1, -1, 0.05), elbow: V3(-0.36, -0.55, 0.75) },
};

/* ---------- assembly ---------- */
const vm = new THREE.Group(), VMR = {};
{
  const R = vmRifleGeo(); vm.add(new THREE.Mesh(R.metal, VMAT.metal), new THREE.Mesh(R.wood, VMAT.wood));
  // the blade, down in the groove at the front of the bridge: thin, its tip on the line of sight - in the sight it thickens only a touch
  VMR.post = new THREE.Mesh(colored(new THREE.BoxGeometry(0.0011, SIGHT_Y - 0.1008, 0.0026).translate(0, -(SIGHT_Y - 0.1008) / 2, 0), 0x7c7a74), VMAT.metal); VMR.post.position.set(0, SIGHT_Y, VM_POST_Z); vm.add(VMR.post);
  VMR.mag = new THREE.Mesh(vmMagGeo().translate(-VM_MAG0.x, -VM_MAG0.y, -VM_MAG0.z), VMAT.metal); VMR.mag.position.copy(VM_MAG0); vm.add(VMR.mag);
  const arm = (side) => {
    const H = VM_HAND[side], g = new THREE.Group(), pose = side === 'R' ? VM_POSE_R : VM_POSE_L; H.wrist = H.palm.clone().addScaledVector(H.z.clone().normalize(), -0.051);
    const hm = vmFrame(H.wrist, H.z, H.y), hand = new THREE.Mesh(vmHandGeo(side, pose, side === 'R' ? 0 : -1), VMAT.skin); hand.matrixAutoUpdate = false; hand.matrix.copy(hm); g.add(hand);
    if (side === 'R') { // the trigger finger: two poses, swapped when firing
      for (const [k, f] of [['idxRest', pose.f[0]], ['idxFire', VM_IDX_FIRE]]) { const parts = []; vmFingerParts(parts, 'R', 0, f); const m = new THREE.Mesh(build(parts), VMAT.skin); m.matrixAutoUpdate = false; m.matrix.copy(hm); g.add(m); VMR[k] = m; }
      VMR.idxFire.visible = false; }
    // the arm grows out of the heel of the hand and bends onto the line of the forearm; the rolled sleeve and the watch sit on it
    const A = vmArmGeo(side, hm, H.elbow); g.add(new THREE.Mesh(A.geo, VMAT.arm));
    { const m = new THREE.Mesh(vmSleeveGeo(), VMAT.cloth); m.matrixAutoUpdate = false; m.matrix.copy(A.frameAt(0.24).m); g.add(m); }
    if (side === 'L') { const F = A.frameAt(0.036), w = vmWatch(...F.size); w.matrixAutoUpdate = false; w.matrix.copy(F.m); g.add(w); }
    return g;
  };
  VMR.armR = arm('R'); VMR.armL = arm('L'); vm.add(VMR.armR, VMR.armL);
  vmScene.add(vm);
}
const vmFlash = new THREE.Sprite(new THREE.SpriteMaterial({ map: FXT.flash, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, toneMapped: false, color: HDC })); vmFlash.position.set(0, 0.012, VMZ(527) - 0.07); vmFlash.scale.setScalar(0.28); vmFlash.visible = false; vm.add(vmFlash);
const VM_HIP = V3(0.16, -0.175, -0.34), VM_ADS = V3(0, -SIGHT_Y, -(VM_PEEP_Z + 0.064)), VM_YAW = 0.12, VM_ROLL = -0.05;   // at the hip the rifle is turned in a little and canted, so its left side and the left hand show
/* on a phone held upright the picture is narrow: the rifle comes in toward the middle and further off, so the whole of it shows - both hands on
   it, the magazine and the stock - held in front of the chest rather than off to the side of a picture that is not there */
const vmFit = (asp) => clamp((asp - 0.45) / (1.5 - 0.45), 0, 1);
function vmHip(asp, out = V3()) { const f = vmFit(asp); return out.set(lerp(0.07, VM_HIP.x, f), lerp(-0.162, VM_HIP.y, f), lerp(-0.6, VM_HIP.z, f)); }
/* the hands at work: the trigger finger goes onto the trigger while firing; a reload drops the magazine out of the well, the left hand goes down
   for a fresh one, pushes it home and comes back to the handguard */
const VM_LHG = V3(), VM_LMAG = V3(0.004, VMY(222) - VMY(152), VMZ(258) - VMZ(350));
function vmAnimate(dt, firing, reloadU) {
  const a = P.ads || 0; VMR.post.scale.set(1 + 0.35 * a, 1 + 0.1 * a, 1);
  const fire = firing && P.mode === 'rifle'; VMR.fireT = fire ? 0.18 : Math.max(0, (VMR.fireT || 0) - dt); const on = VMR.fireT > 0; VMR.idxFire.visible = on; VMR.idxRest.visible = !on;
  const u = reloadU, mag = VMR.mag, L = VMR.armL;
  if (u === null) { mag.position.copy(VM_MAG0); mag.visible = true; L.position.copy(VM_LHG); L.rotation.set(0, 0, 0); return; }
  const sm = (a, b) => { const t = clamp((u - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  // 0-.18 the hand to the magazine; .18-.36 the magazine out and away; .36-.55 down for a fresh one; .55-.72 it goes in; .72-.9 back to the handguard
  const toMag = sm(0.0, 0.18) - sm(0.72, 0.9), out = sm(0.18, 0.36) - sm(0.55, 0.72), away = sm(0.36, 0.46) - sm(0.46, 0.55);
  L.position.copy(VM_LHG).lerp(VM_LMAG, toMag); L.position.y -= 0.16 * out + 0.12 * away; L.position.x += 0.05 * away;
  mag.visible = !(u > 0.36 && u < 0.55); mag.position.copy(VM_MAG0); mag.position.y -= 0.16 * out; mag.position.x += 0.05 * away;
}

/* ---------- the machine gun's sights, for aiming: the MAG on the rampart and on the jeeps ----------
   Drawn from a picture of the gun from the gunner's eye: in the middle the rear sight, a heavy ring on a broad post between two guards on
   their base, and through the ring, far down the ribbed barrel, the front sight blade between its ears, its tip on the line of sight. Below
   in the foreground the feed cover with its catch, a big rounded plate either side, and at the right the brass of the belt. Built in the
   picture's own terms: px(x, y, z) takes a point of the picture (pixels from the ring's centre, y down) to the depth z where that part
   stands, so the parts keep the picture's proportions; the line of sight is the camera's axis, so the ring is dead centre on any screen.
   It rises into view as the gun comes up to the eye, and kicks with every round */
const MAGSIGHT = (() => {
  const K = 0x4b4945, D = 0x403e3a, W = 0x57534d, L = 0x232220, B = 0xb48c4c, KZ = 9.06e-4;
  const m = (px, z) => px * KZ * z;   // a length in the picture at depth z, in metres
  const box = (w, h, d, c, x, y, z) => [new THREE.BoxGeometry(w, h, d), c, M4(x, y, -z)];
  const cyl = (r, h, c, x, y, z, ax, n = 16) => [new THREE.CylinderGeometry(r, r, h, n), c, ax === 'z' ? M4(x, y, -z, Math.PI / 2, 0, 0) : ax === 'x' ? M4(x, y, -z, 0, 0, Math.PI / 2) : M4(x, y, -z)];
  const ext = (shape, depth, c, x, y, z, bev = 0.0015) => [new THREE.ExtrudeGeometry(shape, { depth, curveSegments: 40, bevelEnabled: true, bevelThickness: bev, bevelSize: bev * 0.8, bevelSegments: 2 }), c, M4(x, y, -z - depth / 2)];
  const rrect = (w, h, r) => { const s = new THREE.Shape(); s.moveTo(-w / 2 + r, -h / 2); s.lineTo(w / 2 - r, -h / 2); s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r); s.lineTo(w / 2, h / 2 - r); s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2); s.lineTo(-w / 2 + r, h / 2); s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r); s.lineTo(-w / 2, -h / 2 + r); s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2); return s; };
  const rbox = (w, h, d, c, x, y, z, r = Math.min(w, h) * 0.12) => ext(rrect(w, h, r), d, c, x, y, z, Math.min(0.0025, r * 0.5));   // a block with its edges worn round, for the light to catch
  const parts = [];
  // the rear sight: ring and post in one plate, the hole through it
  { const z = 0.32, R = m(180, z), Ri = m(125, z), w = m(85, z), yb = -m(275, z), yj = -Math.sqrt(R * R - w * w), a = Math.atan2(yj, -w), b = Math.atan2(yj, w);
    const sh = new THREE.Shape(); sh.moveTo(-w, yb); sh.lineTo(-w, yj); sh.absarc(0, 0, R, a, b + Math.PI * 2, true); sh.lineTo(w, yb); sh.lineTo(-w, yb);
    const hole = new THREE.Path(); hole.absarc(0, 0, Ri, 0, Math.PI * 2, false); sh.holes.push(hole); parts.push(ext(sh, 0.012, K, 0, 0, z));
    for (const sd of [-1, 1]) {   // the guards: an upright at each side, joined to the post low down
      parts.push(rbox(m(40, z), m(275, z) - m(150, z), 0.03, D, sd * m(198, z), -(m(150, z) + m(275, z)) / 2, z));
      parts.push(box(m(93, z), m(18, z), 0.03, D, sd * (m(85, z) + m(178, z)) / 2, -m(275, z) + m(9, z), z));
    }
    parts.push(rbox(m(546, z), m(65, z), 0.06, W, 0, -m(307, z), z + 0.01));                 // the base under them
    parts.push(box(m(580, 0.39), m(25, 0.39), 0.06, L, 0, -m(262, 0.39), 0.39));            // and the rail beyond it
  }
  // the barrel: its jacket ribbed for cooling, and on it at the muzzle the front sight, the blade's tip on the line
  { const top = -0.055, r = 0.027, ay = top - r;
    parts.push(cyl(0.021, 0.66, D, 0, ay, 0.69, 'z')); for (let zz = 0.4; zz < 0.955; zz += 0.034) parts.push(cyl(r, 0.011, W, 0, ay, zz, 'z'));
    parts.push(box(0.06, 0.03, 0.1, D, 0, ay - 0.012, 0.41));                                 // its seat under the rear sight
    const zf = 0.99; parts.push(box(0.07, 0.016, 0.03, K, 0, top + 0.005, zf), box(0.014, 0.046, 0.012, D, 0, -0.023, zf));
    for (const sd of [-1, 1]) parts.push(box(0.011, 0.024, 0.02, K, sd * 0.028, -0.034, zf));
  }
  // the feed cover in the foreground, its catch and its seam; the receiver's shoulders either side of it
  { parts.push(rbox(0.124, 0.064, 0.13, K, 0, -0.128, 0.235, 0.008), box(0.16, 0.06, 0.13, D, 0, -0.134, 0.235));
    parts.push(cyl(0.0065, 0.004, W, 0, -0.094, 0.285, 'y', 20), box(0.124, 0.0012, 0.0025, L, 0, -0.0955, 0.23)); }
  // the big rounded plates either side, their faces to the gunner, and the blocks before them low down
  { const pw = 0.057, ph = 0.22, rr = 0.012, sh = new THREE.Shape(); sh.moveTo(-pw / 2, -ph); sh.lineTo(pw / 2, -ph); sh.lineTo(pw / 2, -rr); sh.quadraticCurveTo(pw / 2, 0, pw / 2 - rr, 0); sh.lineTo(-pw / 2 + rr, 0); sh.quadraticCurveTo(-pw / 2, 0, -pw / 2, -rr); sh.lineTo(-pw / 2, -ph);
    for (const sd of [-1, 1]) { parts.push(ext(sh, 0.05, W, sd * (0.0713 + pw / 2), -0.0326, 0.265, 0.003)); parts.push(rbox(0.04, 0.12, 0.06, D, sd * 0.08, -0.14, 0.21, 0.006)); } }
  // the belt at the right: brass rounds, and the black links between them
  for (let k = 0; k < 6; k++) { const y = -0.095 - k * 0.0118; parts.push(cyl(0.0057, 0.034, B, 0.142, y, 0.27, 'z', 12), box(0.006, 0.009, 0.012, L, 0.1495, y, 0.262)); }
  const g = new THREE.Group(); g.add(new THREE.Mesh(build(parts), VMAT.metal)); g.visible = false; vmScene.add(g); return g;
})();
const MAGFILL = new THREE.DirectionalLight(0xfff2e2, 0); MAGFILL.position.set(0.35, 0.9, 0.8); vmScene.add(MAGFILL);   // light on the gunner's side of the sights: the gun often faces the sun, and its back would be black
/* how far the gunner has the sights up (0..1), and the sights placed for it; the world's gun is hidden while they are up */
function magSightUpd(dt, off) {
  const mag = !off && P.mode === 'mag' && P.post && P.post.mag && !P.post.mag.big && !P.post.mag.heavy, jeep = !off && !!(P.ride && P.ride.mg), k = mag || jeep ? P.ads : 0;
  const gun = mag ? P.post.mag.pivot : jeep ? P.ride.gun : null, hide = gun && k > 0.5 ? gun : null;
  if (P.adsHid && P.adsHid !== hide) { P.adsHid.visible = true; P.adsHid = null; } if (hide && hide.visible) { hide.visible = false; P.adsHid = hide; }
  MAGSIGHT.visible = k > 0.02; MAGFILL.intensity = MAGSIGHT.visible ? 2.2 / renderer.toneMappingExposure : 0; if (!MAGSIGHT.visible) return 0;
  const e = k * k * (3 - 2 * k), kick = P.vmKick || 0; P.vmKick = Math.max(0, kick - dt * 14);
  MAGSIGHT.position.set(rand(-1, 1) * 0.0012 * kick, -0.2 * (1 - e) + 0.0035 * kick, 0.016 * kick); MAGSIGHT.rotation.set(0.01 * kick, 0, 0);
  return k;
}


/* ---------- the FAL in our soldiers' hands: the viewmodel's own rifle ----------
   The same parts as the rifle in the player's hands (vmRifleGeo, vmMagGeo), turned into the soldiers' weapon frame - the muzzle forward
   along +z - and set so the pistol grip and the back of the handguard fall either side of where the rig puts the right and the left hand
   (GRIPS.rifle). At that size the wood and the steel are their colours, baked into the vertices (the soldiers' guns use MAT.vcMetal).
   It replaces the box-built FAL_W in place, so every soldier, rig and dropped rifle that holds FAL_W gets it. */
{
  const R = vmRifleGeo(), mag = vmMagGeo();
  const tint = (g, r, gg, b) => { const c = g.attributes.color; for (let i = 0; i < c.count; i++) c.setXYZ(i, c.getX(i) * r, c.getY(i) * gg, c.getZ(i) * b); return g; };
  tint(R.metal, 0.3, 0.3, 0.3); tint(mag, 0.36, 0.36, 0.36); tint(R.wood, 0.42, 0.29, 0.2);
  const g = mergeGeometries([R.metal, R.wood, mag].map((x) => { const y = x.index ? x.toNonIndexed() : x; for (const k of Object.keys(y.attributes)) if (!['position', 'normal', 'uv', 'color'].includes(k)) y.deleteAttribute(k); return y; }), false);
  // turned about y, then moved so the pistol grip is where the rig puts the right hand for the FAL (GRIPS.fal: 0.04 behind the box rifle's)
  // and the back of the handguard, 0.27 m in front of it, is where the left hand goes
  g.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 0.01, 0.0015).multiply(new THREE.Matrix4().makeRotationY(Math.PI)));
  g.computeBoundingSphere(); FAL_W.copy(g); FAL_W.computeBoundingSphere(); FAL_W.userData = {};
}
