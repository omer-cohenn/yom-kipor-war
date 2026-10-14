/* ================= props: the small things of a room, and what a bullet does to them =================
   Pots and cups, radios and field telephones, lamps, papers, helmets, bottles, a backgammon board: everything soldiers and families leave
   on tables, shelves and floors. Each kind is one instanced mesh per chapter. A shot that hits one knocks it flying: it spins, falls,
   bounces and comes to rest - on the floor, if it was knocked off its table. A grenade throws everything near it. Maps, portraits and
   clocks hang on the walls as painted planes. */
const PROP_LIB = {};
function propKind(name, parts, r, h) { PROP_LIB[name] = { geo: build(parts), r, h }; }
(() => {
  const brass = 0xb8863a, tin = 0x9a9a92, od = 0x4d5a34, wood = 0x8a6e48, white = 0xe8e2d6, dark = 0x2a2a28;
  const ring = (R, t, y, col, arc = Math.PI) => [G.tor(R, t, 5, 12, arc), col, M4(0, y, 0, 0, 0, 0)];
  // ---- the kitchen and the coffee ----
  propKind('kettle', [[G.cyl(0.05, 0.08, 0.15, 12), brass, M4(0, 0.075, 0)], [G.cyl(0.035, 0.05, 0.06, 10), brass, M4(0, 0.18, 0)], [G.cyl(0.012, 0.018, 0.12, 6), brass, M4(0.07, 0.15, 0, 0, 0, -0.9)], [G.box(0.03, 0.12, 0.02), 0x3a2a1a, M4(-0.075, 0.13, 0, 0, 0, 0.2)]], 0.08, 0.22);
  propKind('cups', [...[[0, 0], [0.07, 0.03], [0.035, -0.06]].map(([x, z]) => [G.cyl(0.028, 0.022, 0.05, 10, true), white, M4(x, 0.025, z)]), ...[[0, 0], [0.07, 0.03], [0.035, -0.06]].map(([x, z]) => [G.cyl(0.02, 0.02, 0.01, 10), 0x4a3020, M4(x, 0.035, z)])], 0.1, 0.05);
  propKind('glasses', [[G.cyl(0.11, 0.11, 0.01, 14), brass, M4(0, 0.005, 0)], ...[[-0.05, 0.02], [0.04, 0.04], [0, -0.05]].map(([x, z]) => [G.cyl(0.026, 0.02, 0.08, 10), 0xc87a2a, M4(x, 0.05, z)])], 0.11, 0.09);
  propKind('teapot', [[G.sph(0.08, 12, 8), tin, M4(0, 0.08, 0, 0, 0, 0, 1, 0.8, 1)], [G.cyl(0.03, 0.03, 0.02, 10), tin, M4(0, 0.15, 0)], [G.sph(0.012, 6, 4), dark, M4(0, 0.17, 0)], [G.cyl(0.012, 0.02, 0.11, 6), tin, M4(0.09, 0.1, 0, 0, 0, -0.8)], ring(0.05, 0.008, 0.1, 0x3a2a1a)], 0.1, 0.18);
  propKind('pot', [[G.cyl(0.17, 0.15, 0.2, 14, true), 0x8a8a84, M4(0, 0.1, 0)], [G.cyl(0.15, 0.15, 0.01, 14), 0x6a6a64, M4(0, 0.005, 0)], [G.cyl(0.18, 0.18, 0.02, 14), 0x9a9a94, M4(0, 0.21, 0)], [G.sph(0.02, 6, 4), dark, M4(0, 0.23, 0)], [G.box(0.06, 0.02, 0.02), dark, M4(0.19, 0.17, 0)], [G.box(0.06, 0.02, 0.02), dark, M4(-0.19, 0.17, 0)]], 0.19, 0.24);
  propKind('pan', [[G.cyl(0.14, 0.12, 0.04, 14, true), dark, M4(0, 0.02, 0)], [G.cyl(0.12, 0.12, 0.008, 14), 0x1a1a18, M4(0, 0.004, 0)], [G.box(0.2, 0.015, 0.03), dark, M4(0.22, 0.035, 0)]], 0.3, 0.05);
  propKind('plates', [0, 1, 2, 3, 4].map((i) => [G.cyl(0.12, 0.1, 0.012, 16), i % 2 ? white : 0xd8d0c0, M4(0, 0.006 + i * 0.013, 0)]), 0.12, 0.07);
  propKind('bottle', [[G.cyl(0.035, 0.035, 0.2, 10), 0x2a5a2a, M4(0, 0.1, 0)], [G.cyl(0.014, 0.03, 0.08, 10), 0x2a5a2a, M4(0, 0.24, 0)], [G.cyl(0.016, 0.016, 0.02, 8), 0xd8c84a, M4(0, 0.29, 0)]], 0.04, 0.3);
  propKind('bottles', [...[[0, 0], [0.075, 0.02], [0.03, 0.07]].flatMap(([x, z], i) => [[G.cyl(0.032, 0.032, 0.22, 10), [0x5a3a1a, 0x2a5a2a, 0x3a3a2a][i], M4(x, 0.11, z)], [G.cyl(0.012, 0.028, 0.07, 8), [0x5a3a1a, 0x2a5a2a, 0x3a3a2a][i], M4(x, 0.255, z)]])], 0.1, 0.29);
  propKind('cans', [...[[0, 0], [0.085, 0.0], [0.04, 0.075]].flatMap(([x, z], i) => [[G.cyl(0.04, 0.04, 0.11, 12), tin, M4(x, 0.055, z)], [G.cyl(0.041, 0.041, 0.05, 12, true), [0xc8402a, 0x3a6a8a, 0xd8b84a][i], M4(x, 0.055, z)]])], 0.1, 0.11);
  propKind('jerry', [[G.box(0.35, 0.47, 0.17), od, M4(0, 0.235, 0)], [G.box(0.26, 0.04, 0.03), od, M4(0, 0.5, 0)], [G.cyl(0.03, 0.03, 0.04, 8), 0x3a3a30, M4(0.12, 0.49, 0)], [G.box(0.3, 0.01, 0.18), 0x3f4a2a, M4(0, 0.3, 0)]], 0.2, 0.52);
  propKind('jug', [[G.sph(0.11, 12, 8), 0xa0704a, M4(0, 0.13, 0, 0, 0, 0, 1, 1.15, 1)], [G.cyl(0.045, 0.06, 0.1, 10), 0xa0704a, M4(0, 0.28, 0)], [G.cyl(0.07, 0.05, 0.02, 10), 0x8a5a3a, M4(0, 0.01, 0)], [G.tor(0.05, 0.012, 5, 10, Math.PI), 0xa0704a, M4(-0.1, 0.2, 0, 0, 0, Math.PI / 2 + 0.3)]], 0.12, 0.33);
  propKind('bucket', [[G.cyl(0.14, 0.11, 0.26, 14, true), 0x7a7a74, M4(0, 0.13, 0)], [G.cyl(0.11, 0.11, 0.01, 14), 0x5a5a54, M4(0, 0.005, 0)], [G.tor(0.14, 0.008, 4, 14, Math.PI), 0x5a5a54, M4(0, 0.26, 0, 0, Math.PI / 2, 0)]], 0.14, 0.4);
  propKind('primus', [[G.cyl(0.1, 0.1, 0.12, 12), brass, M4(0, 0.06, 0)], [G.cyl(0.03, 0.05, 0.12, 8), 0x6a5a3a, M4(0, 0.18, 0)], [G.cyl(0.05, 0.05, 0.02, 8), dark, M4(0, 0.25, 0)], ...[0, 1, 2].map((k) => [G.box(0.03, 0.02, 0.16), dark, M4(0, 0.26, 0, 0, k * 1.047, 0)]), [G.cyl(0.01, 0.01, 0.1, 6), brass, M4(0.1, 0.1, 0, 0, 0, Math.PI / 2)]], 0.12, 0.28);
  propKind('basket', [[G.cyl(0.14, 0.11, 0.1, 12, true), 0xb8905a, M4(0, 0.05, 0)], [G.cyl(0.11, 0.11, 0.01, 12), 0xa8804a, M4(0, 0.005, 0)], ...[[-0.04, 0.02], [0.05, 0.03], [0.0, -0.05]].map(([x, z]) => [G.sph(0.05, 8, 6), 0xc89a5a, M4(x, 0.11, z, 0, 0, 0, 1.3, 0.8, 1)])], 0.15, 0.16);
  propKind('fruit', [[G.cyl(0.13, 0.08, 0.06, 14, true), white, M4(0, 0.03, 0)], [G.cyl(0.08, 0.08, 0.01, 14), 0xd8d0c0, M4(0, 0.005, 0)], ...[[0, 0], [0.06, 0.02], [-0.05, 0.03], [0.01, -0.06]].map(([x, z]) => [G.sph(0.035, 8, 6), 0xe08a2a, M4(x, 0.075, z)])], 0.13, 0.11);
  propKind('sack', [[G.cap(0.2, 0.34, 4, 10), 0xb7a47c, M4(0, 0.18, 0, 0, 0, Math.PI / 2, 1, 1, 0.8)]], 0.38, 0.36);
  propKind('thermos', [[G.cyl(0.045, 0.045, 0.3, 12), 0x8a2a2a, M4(0, 0.15, 0)], [G.cyl(0.04, 0.04, 0.05, 12), 0xd8d8d0, M4(0, 0.325, 0)]], 0.05, 0.35);
  // ---- the signals and the office ----
  propKind('radio', [[G.box(0.46, 0.3, 0.3), 0x4c5444, M4(0, 0.15, 0)], [G.box(0.44, 0.28, 0.01), 0x3a3f36, M4(0, 0.15, 0.155)], ...[[-0.14, 0.2], [0, 0.2], [0.14, 0.2]].map(([x, y]) => [G.cyl(0.03, 0.03, 0.02, 10), 0x1a1a1a, M4(x, y, 0.165, Math.PI / 2, 0, 0)]), ...[[-0.14], [0.14]].map(([x]) => [G.box(0.08, 0.03, 0.01), 0xd8b64a, M4(x, 0.08, 0.165)]), [G.box(0.05, 0.05, 0.2), 0x1a1a1a, M4(0.17, 0.33, -0.02)], [G.cyl(0.006, 0.006, 1.3, 5), 0x1a1a1a, M4(-0.2, 0.95, -0.1)], [G.box(0.3, 0.03, 0.03), 0x3a3a30, M4(0, 0.31, 0.1)]], 0.3, 0.36);
  propKind('radioBig', [[G.box(0.62, 0.46, 0.4), 0x46503e, M4(0, 0.23, 0)], [G.box(0.6, 0.44, 0.012), 0x343a30, M4(0, 0.23, 0.205)], ...[[-0.18, 0.3], [0.18, 0.3], [-0.18, 0.13], [0.18, 0.13]].map(([x, y]) => [G.cyl(0.04, 0.04, 0.025, 12), 0x161616, M4(x, y, 0.22, Math.PI / 2, 0, 0)]), [G.box(0.16, 0.08, 0.012), 0xd8d0a0, M4(0, 0.33, 0.215)], [G.box(0.014, 0.05, 0.004), 0xc02020, M4(0.02, 0.33, 0.224, 0, 0, 0.4)], ...[0, 1, 2, 3, 4].map((k) => [G.cyl(0.012, 0.012, 0.01, 6), 0xd8b64a, M4(-0.24 + k * 0.12, 0.05, 0.215, Math.PI / 2, 0, 0)]), [G.box(0.05, 0.05, 0.22), 0x1a1a1a, M4(-0.22, 0.49, 0.02)], [G.tor(0.08, 0.008, 4, 10, Math.PI), 0x1a1a1a, M4(-0.1, 0.47, 0.15, 0, 0, 0)], [G.cyl(0.007, 0.007, 1.8, 5), 0x1a1a1a, M4(0.26, 1.35, -0.12)], [G.box(0.5, 0.03, 0.04), 0x3a3a30, M4(0, 0.48, 0.1)], [G.box(0.5, 0.03, 0.04), 0x3a3a30, M4(0, 0.48, -0.1)]], 0.38, 0.52);
  propKind('phone', [[G.box(0.26, 0.17, 0.2), 0x3a3f36, M4(0, 0.085, 0)], [G.cap(0.025, 0.14, 4, 8), 0x1a1a1a, M4(0, 0.2, 0, 0, 0, Math.PI / 2)], [G.cyl(0.015, 0.015, 0.06, 6), dark, M4(0.14, 0.1, 0, 0, 0, Math.PI / 2)], [G.box(0.04, 0.01, 0.01), dark, M4(0.17, 0.12, 0)]], 0.15, 0.23);
  propKind('typewriter', [[G.box(0.38, 0.1, 0.3), dark, M4(0, 0.05, 0.02)], [G.box(0.3, 0.02, 0.14), 0x3a3a3a, M4(0, 0.1, 0.07, -0.25, 0, 0)], ...[0, 1, 2, 3].flatMap((row) => [0, 1, 2, 3, 4, 5, 6].map((k) => [G.cyl(0.012, 0.012, 0.01, 6), 0xe0e0d8, M4(-0.11 + k * 0.035 + (row % 2) * 0.015, 0.115 + row * 0.012, 0.13 - row * 0.03, -0.25, 0, 0)])), [G.cyl(0.03, 0.03, 0.42, 10), 0x1a1a1a, M4(0, 0.15, -0.1, 0, 0, Math.PI / 2)], [G.box(0.22, 0.26, 0.004), white, M4(0, 0.26, -0.1, 0.2, 0, 0)]], 0.22, 0.38);
  propKind('papers', [[G.box(0.3, 0.03, 0.22), 0xe8e2d4, M4(0, 0.015, 0)], [G.box(0.3, 0.003, 0.22), 0xf0ece4, M4(0.05, 0.034, 0.02, 0, 0.3, 0)], [G.box(0.3, 0.003, 0.22), 0xe0dccc, M4(-0.04, 0.038, -0.03, 0, -0.2, 0)], [G.box(0.12, 0.01, 0.08), 0x8a3a2a, M4(0.08, 0.04, -0.05, 0, 0.5, 0)]], 0.2, 0.05);
  propKind('books', [[G.box(0.22, 0.04, 0.16), 0x5a3a2a, M4(0, 0.02, 0)], [G.box(0.2, 0.035, 0.15), 0x2a4a5a, M4(0.02, 0.058, 0.01, 0, 0.15, 0)], [G.box(0.21, 0.03, 0.14), 0x6a6a3a, M4(-0.01, 0.09, -0.01, 0, -0.1, 0)]], 0.14, 0.11);
  propKind('maptube', [[G.cyl(0.04, 0.04, 0.7, 10), 0x8a7050, M4(0, 0.04, 0, 0, 0, Math.PI / 2)], [G.cyl(0.042, 0.042, 0.04, 10), 0x5a4a30, M4(0.33, 0.04, 0, 0, 0, Math.PI / 2)]], 0.36, 0.08);
  propKind('lamp', [[G.cyl(0.07, 0.08, 0.03, 12), 0x4a4a46, M4(0, 0.015, 0)], [G.cyl(0.05, 0.045, 0.14, 12, true), 0xfff0c0, M4(0, 0.1, 0)], [G.cyl(0.015, 0.012, 0.06, 6), 0xffe080, M4(0, 0.08, 0)], [G.cone(0.065, 0.05, 12), 0x4a4a46, M4(0, 0.195, 0)], [G.tor(0.06, 0.006, 4, 12, Math.PI), 0x4a4a46, M4(0, 0.21, 0)], ...[0, 1, 2].map((k) => [G.box(0.006, 0.14, 0.006), 0x4a4a46, M4(Math.cos(k * 2.09) * 0.055, 0.1, Math.sin(k * 2.09) * 0.055)])], 0.08, 0.28);
  propKind('candle', [[G.cyl(0.03, 0.03, 0.12, 10), 0x2a5a2a, M4(0, 0.06, 0)], [G.cyl(0.012, 0.025, 0.08, 8), 0x2a5a2a, M4(0, 0.16, 0)], [G.cyl(0.013, 0.013, 0.1, 8), 0xf0ead8, M4(0, 0.25, 0)], [G.sph(0.012, 6, 4), 0xffc040, M4(0, 0.31, 0)]], 0.04, 0.32);
  propKind('ashtray', [[G.cyl(0.06, 0.05, 0.02, 12, true), 0x8a8a8a, M4(0, 0.01, 0)], [G.cyl(0.05, 0.05, 0.005, 12), 0x6a6a6a, M4(0, 0.003, 0)], [G.box(0.06, 0.008, 0.008), white, M4(0.03, 0.025, 0, 0, 0.4, 0)], [G.box(0.08, 0.03, 0.05), 0xd8d8d0, M4(0.12, 0.015, 0.02, 0, 0.3, 0)]], 0.1, 0.03);
  propKind('binocs', [...[-0.03, 0.03].map((x) => [G.cyl(0.025, 0.03, 0.12, 8), 0x1a1a1a, M4(x, 0.03, 0, Math.PI / 2, 0, 0)]), [G.box(0.08, 0.02, 0.03), 0x1a1a1a, M4(0, 0.04, 0)], [G.box(0.01, 0.005, 0.3), 0x3a2a1a, M4(0, 0.01, 0.1, 0, 0.3, 0)]], 0.08, 0.06);
  propKind('helmet', [[G.sph(0.14, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), 0x4a5840, M4(0, 0.02, 0, 0, 0, 0, 1, 1.05, 1.08)], [G.cyl(0.145, 0.155, 0.025, 14, true), 0x3f4c36, M4(0, 0.02, 0)], [G.box(0.02, 0.06, 0.26), 0x5a4a30, M4(0, 0.0, 0)]], 0.16, 0.17);
  propKind('canteen', [[G.cyl(0.06, 0.06, 0.17, 12), 0x5a6440, M4(0, 0.085, 0, 0, 0, 0, 1, 1, 0.6)], [G.cyl(0.025, 0.025, 0.04, 8), dark, M4(0, 0.19, 0)], [G.box(0.08, 0.1, 0.09), 0x6a6a4a, M4(0, 0.06, 0)]], 0.07, 0.21);
  propKind('pack', [[G.box(0.32, 0.38, 0.2), 0x5a5a3e, M4(0, 0.19, 0)], [G.box(0.33, 0.12, 0.22), 0x52523a, M4(0, 0.36, 0)], ...[-0.1, 0.1].map((x) => [G.box(0.03, 0.4, 0.22), 0x3a3a2a, M4(x, 0.2, 0.0)]), [G.cyl(0.05, 0.05, 0.3, 8), 0x6b6a4a, M4(0, 0.47, -0.02, 0, 0, Math.PI / 2)]], 0.2, 0.52);
  propKind('ammo', [[G.box(0.42, 0.2, 0.2), 0x4b5536, M4(0, 0.1, 0)], [G.box(0.44, 0.02, 0.22), 0x3f4a2e, M4(0, 0.2, 0)], [G.box(0.12, 0.03, 0.02), dark, M4(0, 0.2, 0.1)], [G.box(0.3, 0.05, 0.005), 0xd8c84a, M4(0, 0.1, 0.103)]], 0.23, 0.22);
  propKind('blanket', [[G.cyl(0.1, 0.1, 0.5, 12), 0x6b6a4a, M4(0, 0.1, 0, 0, 0, Math.PI / 2)], [G.box(0.5, 0.01, 0.03), 0x3a3a2a, M4(0, 0.2, 0)]], 0.26, 0.2);
  propKind('blanketF', [[G.box(0.6, 0.12, 0.45), 0x6b6a4a, M4(0, 0.06, 0)], [G.box(0.58, 0.04, 0.43), 0x5a5a3a, M4(0.01, 0.14, 0, 0, 0.05, 0)]], 0.35, 0.16);
  propKind('pillow', [[G.sph(0.2, 10, 6), 0xe8e0d0, M4(0, 0.06, 0, 0, 0, 0, 1.1, 0.35, 0.75)]], 0.22, 0.12);
  propKind('boots', [...[-0.07, 0.07].flatMap((x) => [[G.box(0.1, 0.1, 0.3), 0x3a2a1a, M4(x, 0.05, 0)], [G.box(0.1, 0.16, 0.12), 0x3a2a1a, M4(x, 0.16, -0.08)]])], 0.15, 0.24);
  propKind('backgammon', [[G.box(0.44, 0.03, 0.34), 0x6b4a30, M4(0, 0.015, 0)], [G.box(0.42, 0.005, 0.32), 0xc8a870, M4(0, 0.032, 0)], ...[0, 1, 2, 3, 4, 5].flatMap((k) => [[G.box(0.025, 0.004, 0.13), k % 2 ? 0x8a3a2a : 0x3a2a1a, M4(-0.17 + k * 0.058, 0.036, -0.09)], [G.box(0.025, 0.004, 0.13), k % 2 ? 0x3a2a1a : 0x8a3a2a, M4(-0.17 + k * 0.058, 0.036, 0.09)]]), ...[0, 1, 2, 3].map((k) => [G.cyl(0.018, 0.018, 0.008, 10), k % 2 ? white : dark, M4(-0.1 + k * 0.05, 0.04, 0.0)]), [G.box(0.03, 0.03, 0.03), white, M4(0.12, 0.05, 0.02, 0.3, 0.4, 0)]], 0.26, 0.06);
  propKind('cards', [[G.box(0.09, 0.015, 0.06), 0xf0ece0, M4(0, 0.008, 0)], [G.box(0.09, 0.003, 0.06), white, M4(0.07, 0.002, 0.03, 0, 0.6, 0)], [G.box(0.09, 0.003, 0.06), white, M4(-0.06, 0.002, 0.04, 0, -0.4, 0)], [G.box(0.02, 0.002, 0.03), 0xc02020, M4(0.07, 0.004, 0.03, 0, 0.6, 0)]], 0.1, 0.02);
  propKind('nargila', [[G.cyl(0.07, 0.05, 0.03, 12), brass, M4(0, 0.015, 0)], [G.sph(0.1, 12, 8), 0x3a5a9a, M4(0, 0.12, 0, 0, 0, 0, 1, 1.2, 1)], [G.cyl(0.018, 0.022, 0.3, 8), brass, M4(0, 0.38, 0)], [G.cyl(0.04, 0.03, 0.05, 10), 0x8a4a2a, M4(0, 0.55, 0)], [G.cyl(0.05, 0.05, 0.01, 10), brass, M4(0, 0.52, 0)], [G.tor(0.12, 0.012, 5, 14, Math.PI * 1.3), 0x6a2a2a, M4(0.08, 0.26, 0, 0, 0.4, 1.2)]], 0.13, 0.58);
  propKind('tclock', [[G.box(0.14, 0.16, 0.05), 0x8a6a3a, M4(0, 0.08, 0)], [G.cyl(0.055, 0.055, 0.01, 16), white, M4(0, 0.085, 0.03, Math.PI / 2, 0, 0)], [G.box(0.004, 0.04, 0.004), dark, M4(0, 0.1, 0.036)], [G.box(0.03, 0.004, 0.004), dark, M4(0.012, 0.085, 0.036)], [G.sph(0.02, 6, 4), brass, M4(0, 0.18, 0)]], 0.09, 0.2);
  propKind('frame', [[G.box(0.14, 0.18, 0.012), 0x6a4a2a, M4(0, 0.09, 0, -0.15, 0, 0)], [G.box(0.11, 0.15, 0.004), 0xd8d0c0, M4(0, 0.09, 0.007, -0.15, 0, 0)], [G.box(0.05, 0.08, 0.004), 0x5a4a3a, M4(0, 0.1, 0.009, -0.15, 0, 0)], [G.box(0.03, 0.17, 0.01), 0x6a4a2a, M4(0, 0.085, -0.03, 0.3, 0, 0)]], 0.09, 0.19);
  propKind('crateS', [[G.box(0.45, 0.3, 0.35), wood, M4(0, 0.15, 0)], [G.box(0.47, 0.03, 0.37), 0x6a5238, M4(0, 0.3, 0)], ...[-0.15, 0.15].map((x) => [G.box(0.03, 0.31, 0.37), 0x6a5238, M4(x, 0.155, 0)])], 0.28, 0.33);
  propKind('tin', [[G.box(0.2, 0.3, 0.2), 0x6a7a8a, M4(0, 0.15, 0)], [G.cyl(0.02, 0.02, 0.06, 8), 0x4a5a6a, M4(0.07, 0.32, 0.07)], [G.box(0.12, 0.02, 0.02), 0x4a5a6a, M4(0, 0.32, 0)]], 0.14, 0.34);
  propKind('rifleDrop', [[G.box(0.04, 0.09, 0.2), 0x6b4424, M4(0, 0.03, -0.29)], [G.box(0.05, 0.07, 0.3), 0x1d1d1d, M4(0, 0.04, -0.03)], [G.box(0.05, 0.055, 0.18), 0x6b4424, M4(0, 0.035, 0.2)], [G.cyl(0.01, 0.01, 0.34, 6), 0x151515, M4(0, 0.04, 0.42, Math.PI / 2, 0, 0)], [G.box(0.03, 0.1, 0.06), 0x2a2a2a, M4(0, 0.1, 0.04, 0.25, 0, 0)]], 0.4, 0.1);
  propKind('vase', [[G.cyl(0.05, 0.035, 0.22, 10), 0x6a8a9a, M4(0, 0.11, 0)], [G.cyl(0.03, 0.045, 0.05, 10), 0x6a8a9a, M4(0, 0.245, 0)], ...[0, 1, 2].map((k) => [G.cyl(0.004, 0.004, 0.22, 4), 0x3a6a2a, M4(Math.cos(k * 2.1) * 0.03, 0.34, Math.sin(k * 2.1) * 0.03, Math.cos(k) * 0.3, 0, Math.sin(k) * 0.3)]), ...[0, 1, 2].map((k) => [G.sph(0.025, 6, 4), [0xd84a4a, 0xe8c04a, 0xe87aa0][k], M4(Math.cos(k * 2.1) * 0.06, 0.45, Math.sin(k * 2.1) * 0.06)])], 0.08, 0.48);
  propKind('cigs', [[G.box(0.06, 0.02, 0.09), 0xd8d8d0, M4(0, 0.01, 0)], [G.box(0.06, 0.004, 0.03), 0xc02020, M4(0, 0.022, -0.03)], [G.box(0.03, 0.05, 0.015), 0x8a8a8a, M4(0.07, 0.025, 0.01)]], 0.07, 0.05);
  propKind('headset', [[G.tor(0.09, 0.012, 5, 14, Math.PI), 0x1a1a1a, M4(0, 0.03, 0, 0, 0, 0)], ...[-0.09, 0.09].map((x) => [G.cyl(0.035, 0.035, 0.03, 10), 0x2a2a2a, M4(x, 0.025, 0, 0, 0, Math.PI / 2)])], 0.12, 0.09);
  propKind('mess', [[G.box(0.18, 0.06, 0.13), 0x7a7a74, M4(0, 0.03, 0)], [G.box(0.16, 0.01, 0.11), 0x5a5a54, M4(0, 0.06, 0)], [G.box(0.12, 0.008, 0.015), 0x9a9a92, M4(0.05, 0.07, 0.02, 0, 0.5, 0)]], 0.12, 0.08);
  propKind('oilcan', [[G.cyl(0.05, 0.05, 0.14, 10), 0x8a3a2a, M4(0, 0.07, 0)], [G.cyl(0.006, 0.01, 0.16, 6), 0x8a3a2a, M4(0.06, 0.17, 0, 0, 0, -0.9)], [G.box(0.02, 0.06, 0.015), 0x3a3a3a, M4(-0.05, 0.1, 0)]], 0.08, 0.22);
})();
const PROPS = { items: [], meshes: {}, reg: {}, cur: null, CAP: 220 };
const _prM = new THREE.Matrix4(), _prQ = new THREE.Quaternion(), _prE = new THREE.Euler(), _prV = V3(), _prS = V3(1, 1, 1);
function propMesh(mode, kind) {
  const key = mode + ':' + kind; let m = PROPS.meshes[key];
  if (!m) { const L = PROP_LIB[kind]; m = new THREE.InstancedMesh(L.geo, MAT.vc, PROPS.CAP); m.count = 0; m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.frustumCulled = false; scene.add(SH(onLayer1(m))); if (PROPS.reg[mode]) PROPS.reg[mode](m); PROPS.meshes[key] = m; }
  return m;
}
function propWrite(it) { _prE.set(it.ax, it.rot, it.az); _prQ.setFromEuler(_prE); _prV.set(it.x, it.y + it.lift, it.z); it.m.setMatrixAt(it.i, _prM.compose(_prV, _prQ, _prS)); it.m.instanceMatrix.needsUpdate = true; }
/* put one down at (x, y, z): y is the surface it stands on, floor the floor it would fall to if knocked off */
function propAdd(mode, kind, x, y, z, rot = 0, floor = y) {
  const L = PROP_LIB[kind]; if (!L) return null; const m = propMesh(mode, kind); if (m.count >= PROPS.CAP) return null;
  const it = { kind, L, m, i: m.count++, mode, x, y, z, rot, x0: x, z0: z, y0: y, floor, ax: 0, az: 0, lift: 0, live: false, vx: 0, vy: 0, vz: 0, wx: 0, wy: 0, wz: 0, bounces: 0 };
  propWrite(it); PROPS.items.push(it); return it;
}
/* scatter a handful of kinds over a table top or a shelf: a jittered grid, so nothing stands inside anything else */
function propsOn(mode, kinds, cx, cz, y, w, d, rot, seed, floor = y - 0.8) {
  const r = rng(seed), n = kinds.length, cols = Math.max(1, Math.round(Math.sqrt(n * w / Math.max(d, 0.2)))), rows = Math.ceil(n / cols), c = Math.cos(rot), s = Math.sin(rot), out = [];
  kinds.forEach((k, i) => { const u = ((i % cols) + 0.5) / cols - 0.5, v = (Math.floor(i / cols) + 0.5) / rows - 0.5, lx = u * (w - 0.2) + (r() - 0.5) * 0.08, lz = v * (d - 0.2) + (r() - 0.5) * 0.08; out.push(propAdd(mode, k, cx + lx * c + lz * s, y, cz - lx * s + lz * c, rot + (r() - 0.5) * 1.2, floor)); });
  return out;
}
/* a shot that passes through one of them: the nearest sphere on the ray, no farther than the wall it would have hit */
function propRay(o, d, maxT) {
  let best = null, bt = maxT;
  for (const it of PROPS.items) { if (it.mode !== PROPS.cur) continue; const R = Math.max(it.L.r, it.L.h * 0.5) * 0.95, cx = it.x - o.x, cy = it.y + it.lift + it.L.h * 0.5 - o.y, cz = it.z - o.z; const tca = cx * d.x + cy * d.y + cz * d.z; if (tca < 0.3 || tca - R > bt) continue; const d2 = cx * cx + cy * cy + cz * cz - tca * tca; if (d2 > R * R) continue; const t = tca - Math.sqrt(R * R - d2); if (t < bt) { bt = t; best = it; } }
  return best ? { t: bt, item: best } : null;
}
function propKick(it, dir, k = 1) {
  it.live = true; it.vx += dir.x * 1.6 * k + rand(-0.5, 0.5); it.vz += dir.z * 1.6 * k + rand(-0.5, 0.5); it.vy = Math.max(it.vy, 0) + rand(1.5, 2.8) * k; it.wx = rand(-10, 10); it.wy = rand(-7, 7); it.wz = rand(-10, 10); it.bounces = 0; it.lift = 0;
  if (typeof sndClick === 'function') sndClick(rand(500, 1600), 0.1);
}
function propsBlast(p, radius, k = 1.6) { for (const it of PROPS.items) { if (it.mode !== PROPS.cur) continue; const dx = it.x - p.x, dy = it.y - p.y, dz = it.z - p.z, d = Math.hypot(dx, dy, dz); if (d > radius || d < 0.01) continue; const f = (1 - d / radius) * k; propKick(it, V3(dx / d, 0.3, dz / d), f); } }
function propsUpdate(dt) {
  for (const it of PROPS.items) {
    if (!it.live) continue;
    it.vy -= 9.8 * dt; it.x += it.vx * dt; it.y += it.vy * dt; it.z += it.vz * dt; it.ax += it.wx * dt; it.rot += it.wy * dt; it.az += it.wz * dt;
    const off = Math.hypot(it.x - it.x0, it.z - it.z0) > Math.max(0.35, it.L.r), fy = off ? it.floor : it.y0;
    if (it.y < fy) {
      it.y = fy;
      if (Math.abs(it.vy) > 1.1 && it.bounces < 2) { it.vy = -it.vy * 0.32; it.vx *= 0.55; it.vz *= 0.55; it.wx *= 0.6; it.wz *= 0.6; it.bounces++; }
      else { // at rest: on its base or on its side, whichever it was nearer to when it landed
        it.live = false; it.vx = it.vy = it.vz = it.wx = it.wy = it.wz = 0; const q = Math.PI / 2; it.ax = Math.round(it.ax / q) * q; it.az = Math.round(it.az / q) * q;
        const side = Math.abs(Math.sin(it.ax)) > 0.5 || Math.abs(Math.sin(it.az)) > 0.5, over = Math.abs(Math.cos(it.ax) * Math.cos(it.az) + 1) < 0.1;
        it.lift = side ? Math.min(it.L.r, it.L.h * 0.5) : over ? it.L.h : 0; }
    }
    propWrite(it);
  }
}
/* ---- the walls: maps, portraits of officers, clocks, calendars, a mirror ---- */
function pMapTex(seed, lang) {
  const c = canvas(256, 192), g = c.getContext('2d'), r = rng(seed);
  g.fillStyle = '#d9cfae'; g.fillRect(0, 0, 256, 192); g.strokeStyle = 'rgba(90,70,40,0.25)'; g.lineWidth = 1; for (let i = 0; i < 256; i += 32) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 192); g.stroke(); } for (let j = 0; j < 192; j += 32) { g.beginPath(); g.moveTo(0, j); g.lineTo(256, j); g.stroke(); }
  // relief in sepia blotches, a strip of water, a road, towns
  for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(150,120,70,${0.08 + r() * 0.12})`; g.beginPath(); g.ellipse(r() * 256, r() * 192, 10 + r() * 30, 6 + r() * 18, r() * 3, 0, 6.283); g.fill(); }
  g.strokeStyle = '#4a7a9a'; g.lineWidth = 7; g.beginPath(); g.moveTo(120 + r() * 20, 0); for (let y = 0; y <= 192; y += 24) g.lineTo(110 + Math.sin(y * 0.05 + seed) * 18 + r() * 6, y); g.stroke();
  g.strokeStyle = '#7a3a2a'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, 140); for (let x = 0; x <= 256; x += 32) g.lineTo(x, 130 + Math.sin(x * 0.04) * 14); g.stroke();
  g.fillStyle = '#2a2a2a'; for (let i = 0; i < 7; i++) g.fillRect(20 + r() * 216, 20 + r() * 150, 4 + r() * 5, 4 + r() * 4);
  // the arrows of the plan, red and blue, and a few scribbled labels
  const arrow = (x0, y0, x1, y1, col) => { g.strokeStyle = col; g.fillStyle = col; g.lineWidth = 3; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); const a = Math.atan2(y1 - y0, x1 - x0); g.beginPath(); g.moveTo(x1, y1); g.lineTo(x1 - Math.cos(a - 0.5) * 10, y1 - Math.sin(a - 0.5) * 10); g.lineTo(x1 - Math.cos(a + 0.5) * 10, y1 - Math.sin(a + 0.5) * 10); g.closePath(); g.fill(); };
  for (let i = 0; i < 3; i++) arrow(170 + r() * 60, 30 + i * 50 + r() * 20, 90 + r() * 20, 40 + i * 50 + r() * 20, '#c0302a'); for (let i = 0; i < 2; i++) arrow(40 + r() * 30, 50 + i * 70, 120 + r() * 40, 60 + i * 60, '#2a4aa0');
  g.fillStyle = '#2a2a2a'; g.font = '11px "IBM Plex Sans Hebrew", Arial, sans-serif'; g.textAlign = 'center'; const labels = lang === 'he' ? ['סואץ', 'איסמעיליה', 'התעלה', 'הגדה המערבית', 'ציר'] : ['السويس', 'الإسماعيلية', 'القناة', 'الضفة', 'الطريق']; labels.forEach((t, i) => g.fillText(t, 40 + ((i * 97) % 180), 24 + ((i * 53) % 150)));
  g.strokeStyle = 'rgba(60,40,20,0.6)'; g.lineWidth = 3; g.strokeRect(1, 1, 254, 190); return tex(c);
}
function portraitTex(seed, side) {
  const c = canvas(96, 128), g = c.getContext('2d'), r = rng(seed);
  // a generic officer: cap, shoulders with rank, a ribbon bar; no particular man
  g.fillStyle = side === 'e' ? '#3a3a40' : '#4a4034'; g.fillRect(0, 0, 96, 128); const gr = g.createRadialGradient(48, 60, 10, 48, 60, 80); gr.addColorStop(0, 'rgba(255,240,210,0.25)'); gr.addColorStop(1, 'rgba(0,0,0,0.5)'); g.fillStyle = gr; g.fillRect(0, 0, 96, 128);
  g.fillStyle = side === 'e' ? '#5a5a3e' : '#4e5440'; g.beginPath(); g.moveTo(6, 128); g.quadraticCurveTo(10, 86, 48, 82); g.quadraticCurveTo(86, 86, 90, 128); g.closePath(); g.fill();   // shoulders
  g.fillStyle = side === 'e' ? '#a97c58' : '#c89a74'; g.beginPath(); g.ellipse(48, 56, 15, 19, 0, 0, 6.283); g.fill(); g.fillRect(43, 72, 10, 12);   // head and neck
  g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(36, 50, 24, 3); g.fillRect(40, 60, 16, 3);   // the shadow of the brows, the moustache
  if (side === 'e') { g.fillStyle = '#4a4a32'; g.beginPath(); g.ellipse(48, 38, 20, 8, 0, Math.PI, 6.283); g.fill(); g.fillRect(28, 36, 40, 6); g.fillStyle = '#d8b64a'; g.beginPath(); g.arc(48, 39, 3, 0, 6.283); g.fill(); }
  else { g.fillStyle = '#5a1a1a'; g.beginPath(); g.ellipse(50, 38, 19, 9, 0.25, Math.PI, 6.283); g.fill(); g.fillRect(31, 37, 36, 5); }   // a peaked cap, or a beret
  g.fillStyle = '#d8b64a'; for (let i = 0; i < 3; i++) g.fillRect(14 + i * 6, 92 + i * 2, 4, 4); g.fillRect(70, 92, 6, 6);   // rank, a badge
  for (let i = 0; i < 4; i++) { g.fillStyle = ['#c03030', '#3050a0', '#d8b64a', '#2a7a3a'][i]; g.fillRect(28 + i * 8, 104, 7, 4); }   // a ribbon bar
  for (let i = 0; i < 300; i++) { g.fillStyle = `rgba(0,0,0,${r() * 0.1})`; g.fillRect(r() * 96, r() * 128, 2, 2); }
  g.strokeStyle = '#8a6a3a'; g.lineWidth = 6; g.strokeRect(3, 3, 90, 122); g.strokeStyle = '#d8b64a'; g.lineWidth = 1; g.strokeRect(7, 7, 82, 114); return tex(c);
}
function calendarTex(seed) { const c = canvas(64, 96), g = c.getContext('2d'); g.fillStyle = '#f0ebe0'; g.fillRect(0, 0, 64, 96); g.fillStyle = '#b03030'; g.fillRect(0, 0, 64, 22); g.fillStyle = '#fff'; g.font = 'bold 12px Arial'; g.textAlign = 'center'; g.fillText(seed % 2 ? '1973' : 'أكتوبر', 32, 16); g.fillStyle = '#2a2a2a'; g.font = '8px Arial'; for (let i = 0; i < 31; i++) g.fillText(String(i + 1), 8 + (i % 7) * 8, 36 + Math.floor(i / 7) * 11); g.fillStyle = 'rgba(200,40,40,0.6)'; g.beginPath(); g.arc(8 + 5 * 8, 33 + 0 * 11, 5, 0, 6.283); g.fill(); return tex(c); }
function clockTex() { const c = canvas(64, 64), g = c.getContext('2d'); g.fillStyle = '#f4f0e6'; g.beginPath(); g.arc(32, 32, 30, 0, 6.283); g.fill(); g.strokeStyle = '#2a2a2a'; g.lineWidth = 3; g.stroke(); g.fillStyle = '#2a2a2a'; for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; g.fillRect(32 + Math.cos(a) * 24 - 1, 32 + Math.sin(a) * 24 - 1, 2, 2); } g.lineWidth = 2.5; g.beginPath(); g.moveTo(32, 32); g.lineTo(32 + 14 * Math.cos(-1.2), 32 + 14 * Math.sin(-1.2)); g.stroke(); g.lineWidth = 1.5; g.beginPath(); g.moveTo(32, 32); g.lineTo(32 + 22 * Math.cos(0.5), 32 + 22 * Math.sin(0.5)); g.stroke(); return tex(c); }
const WALLTEX = {};
function wallTexOf(kind, seed, side) { const key = kind + seed + (side || ''); if (!WALLTEX[key]) WALLTEX[key] = kind === 'map' ? pMapTex(seed, side) : kind === 'portrait' ? portraitTex(seed, side) : kind === 'calendar' ? calendarTex(seed) : clockTex(); return WALLTEX[key]; }
/* hang something on a wall at (x, y, z), facing ry (the way the wall faces into the room) */
function propWall(mode, kind, x, y, z, ry, seed = 1, side = 'e') {
  let m;
  if (kind === 'mirror') { m = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.62), new THREE.MeshStandardMaterial({ color: 0xc8d0d8, roughness: 0.04, metalness: 1 })); }
  else if (kind === 'clock') { m = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.05, 20).rotateX(Math.PI / 2), [new THREE.MeshStandardMaterial({ color: 0x5a3a1a, roughness: 0.6 }), new THREE.MeshStandardMaterial({ map: clockTex(), roughness: 0.5 }), new THREE.MeshStandardMaterial({ color: 0x5a3a1a })]); }
  else { const w = kind === 'map' ? 1.3 : kind === 'portrait' ? 0.5 : 0.32, h = kind === 'map' ? 0.95 : kind === 'portrait' ? 0.66 : 0.46; m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: wallTexOf(kind, seed, side), roughness: 0.75 })); if (kind !== 'calendar') { const fr = new THREE.Mesh(new THREE.BoxGeometry(w + 0.06, h + 0.06, 0.03), new THREE.MeshStandardMaterial({ color: kind === 'map' ? 0x5a4a3a : 0x3a2a1a, roughness: 0.7 })); fr.position.z = -0.02; m.add(fr); } }
  m.position.set(x, y, z); m.rotation.y = ry; scene.add(onLayer1(m)); if (PROPS.reg[mode]) PROPS.reg[mode](m); return m;
}
