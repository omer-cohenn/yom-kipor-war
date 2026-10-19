
/* ================= mission 0: the eve of Yom Kippur =================
   Friday, 5 October 1973, at the Mezach stronghold - the day before the war. The company commander runs a readiness drill along the western
   rampart: everything the stronghold will need tomorrow to hold (moving, shooting, the grenade, the MAG, the air-raid drill, first aid,
   ammunition), one thing at a time. Then the night falls quiet over the canal, and the game cuts to Saturday, 13:55 - mission 1.
   Nothing in it is random and nothing in it hurts: plywood targets that rise on hinges, a rubber boat towed on a rope as the target for the
   MAG, a "wounded" man who is acting, our own jets for the air-raid drill. It is played on the stronghold's own ground: the chapter shows
   the base world and the stronghold (showWorld: mezWorld) and draws the stronghold's minimap (mezMini). */
const PR = { step: 0, stepT: 0, msgs: {}, stage: 0, done: [], tg: [], raft: null, pit: null };
const PR_STAGES = [
  { title: 'תרגיל בלימה', sub: 'שישי, 5 באוקטובר 1973, ערב יום כיפור. המ״פ מריץ תרגיל כוננות לאורך הסוללה המערבית: כל מה שהמעוז צריך כדי להחזיק.', goal: 'תרגילי המ״פ, אחד אחרי השני' },
  { title: 'מטווח טנקים', sub: 'לפני השקיעה, בקצה הדרומי של המעוז. מחלקת הטנקים מתרגלת ירי מעמדת צריח על שני טנקים ישנים שנגררו לשם כמטרות.', goal: 'שני פגזים, שתי מטרות' },
  { title: 'לילה', sub: 'קצת לפני חצות. שקט על התעלה, ומחר יום כיפור.', goal: 'שמירה על הסוללה' },
];
const PR_TOD = [16 * 60 + 52, 17 * 60 + 22, 23 * 60 + 48];
const PR_NIGHT = 2;
// the drill's places, along the western trench (x ~ -76.5) from north to south
const PR_AT = {
  start: [-76.9, -50], walk: [-76.8, -38.5], run: [-76.6, -24], bay: [-78.5, -19.2],
  pit: [-101, -20], tent: [-64, 10], mag: 'W2', roof: [-76.4, -1.4], dudu: [-76.3, 10.5], ammo: 'G2', night: [-78.6, 4.6],
};
// the plywood targets on the beach in front of the bay (x, z, kind, label); they rise one after another
const PR_TARGETS = [[-104, -27, 'rifle', 'רובאי'], [-107, -13, 'lmg', 'מקלען'], [-110, -33, 'sniper', 'צלף'], [-105, -6, 'rpg', 'אר־פי־ג׳י']];
// each board stands on a low mound of sandbags, so that from the bay above it shows over the crest of the rampart
const PR_MOUND_GEO = new THREE.BoxGeometry(1.25, 1.2, 0.9).translate(0, 0.6, 0.05), PR_MOUND_MAT = new THREE.MeshStandardMaterial({ color: 0xa88f63, roughness: 1 }), PR_LIFT = 1.15;
const PR_MC = 'המ״פ';
const PR_PIT_R = 5.5;   // the grenade pit: wide, so a throw that lands near it counts

/* ---------- the plywood figure: an IDF figure target, the enemy's silhouette painted on it with his weapon ---------- */
const PR_FIG_TEX = {};
function prFigTex(kind) {
  if (PR_FIG_TEX[kind]) return PR_FIG_TEX[kind];
  const W = 128, H = 296, c = canvas(W, H), g = c.getContext('2d');
  // the board: plywood, cut to a head-and-shoulders figure, a darker rim
  const board = () => { g.beginPath(); g.moveTo(10, H - 4); g.lineTo(10, 108); g.quadraticCurveTo(12, 80, 40, 74); g.lineTo(46, 66); g.arc(64, 42, 26, Math.PI * 0.78, Math.PI * 0.22, false); g.lineTo(88, 74); g.quadraticCurveTo(116, 80, 118, 108); g.lineTo(118, H - 4); g.closePath(); };
  board(); g.fillStyle = '#c8b28a'; g.fill(); g.lineWidth = 4; g.strokeStyle = '#8e7a58'; g.stroke();
  g.save(); board(); g.clip(); g.globalAlpha = 0.14; for (let i = 0; i < 26; i++) { g.strokeStyle = i % 2 ? '#7a6644' : '#e3d2ae'; g.lineWidth = 1 + (i % 3); g.beginPath(); g.moveTo(0, i * 12 + 3); g.bezierCurveTo(40, i * 12 - 4, 80, i * 12 + 8, W, i * 12 + 1); g.stroke(); } g.restore();
  // the man: helmet and head, shoulders, body, the legs apart
  g.fillStyle = '#2b2a22';
  g.beginPath(); g.ellipse(64, 46, 17, 19, 0, 0, Math.PI * 2); g.fill(); g.beginPath(); g.ellipse(64, 34, 21, 12, 0, Math.PI, 0); g.fill();
  g.beginPath(); g.moveTo(30, 96); g.quadraticCurveTo(64, 70, 98, 96); g.lineTo(94, 182); g.lineTo(34, 182); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(36, 180); g.lineTo(60, 180); g.lineTo(56, H - 10); g.lineTo(38, H - 10); g.closePath(); g.fill(); g.beginPath(); g.moveTo(68, 180); g.lineTo(92, 180); g.lineTo(90, H - 10); g.lineTo(72, H - 10); g.closePath(); g.fill();
  // the weapon, in the same black: across the body, or the tube on the shoulder
  g.lineCap = 'round'; g.strokeStyle = '#1c1b16';
  if (kind === 'rpg') { g.lineWidth = 9; g.beginPath(); g.moveTo(8, 62); g.lineTo(120, 92); g.stroke(); g.fillStyle = '#1c1b16'; g.beginPath(); g.ellipse(14, 63, 12, 8, 0.27, 0, Math.PI * 2); g.fill(); g.beginPath(); g.moveTo(2, 60); g.lineTo(-6, 58); g.lineTo(2, 66); g.fill(); }
  else { g.lineWidth = kind === 'lmg' ? 9 : 6; g.beginPath(); g.moveTo(22, 148); g.lineTo(112, 104); g.stroke(); g.lineWidth = 4; g.beginPath(); g.moveTo(112, 104); g.lineTo(124, 98); g.stroke();
    if (kind === 'lmg') { g.lineWidth = 3; g.beginPath(); g.moveTo(104, 108); g.lineTo(98, 132); g.moveTo(108, 106); g.lineTo(118, 128); g.stroke(); g.fillStyle = '#1c1b16'; g.fillRect(56, 124, 22, 14); }
    if (kind === 'sniper') { g.lineWidth = 5; g.beginPath(); g.moveTo(62, 118); g.lineTo(90, 104); g.stroke(); } }
  // the aiming ring on the chest
  g.strokeStyle = 'rgba(236,226,200,.75)'; g.lineWidth = 2.5; g.beginPath(); g.arc(64, 128, 16, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.arc(64, 128, 5, 0, Math.PI * 2); g.stroke();
  return (PR_FIG_TEX[kind] = tex(c));
}
const PR_STAKE = build([-1, 1].map((sd) => [G.box(0.06, 0.5, 0.06), 0x6b5236, M4(sd * 0.3, 0.25, -0.03)]).concat([[G.box(0.84, 0.08, 0.1), 0x5a462e, M4(0, 0.04, -0.03)]]));
const PR_FIG_GEO = new THREE.PlaneGeometry(0.8, 1.85).translate(0, 0.925, 0);
/* a target on the ground at (x, z), facing (fx, fz); rises on its hinge, falls back when hit */
function prTarget(kind, x, z, fx, fz, label, onRaft = null) {
  const root = new THREE.Group(), pivot = new THREE.Group(), mat = new THREE.MeshStandardMaterial({ map: prFigTex(kind), transparent: true, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.95 });
  const board = new THREE.Mesh(PR_FIG_GEO, mat); board.position.y = 0.12; pivot.add(board); root.add(pivot); const stake = new THREE.Mesh(PR_STAKE, MAT.vc); root.add(stake);
  if (!onRaft) { const m = new THREE.Mesh(PR_MOUND_GEO, PR_MOUND_MAT); m.position.y = -0.05; m.rotation.x = 0.04; root.add(m); pivot.position.y = PR_LIFT; stake.position.y = PR_LIFT; }
  root.rotation.y = Math.atan2(fx, fz); SH(onLayer1(root), true, false);
  if (onRaft) onRaft.add(root); else { root.position.set(x, groundAt(x, z) - 0.02, z); scene.add(root); }
  const T = { kind, label, root, pivot, board, up: 0, want: 0, hit: false, x, z };
  if (kind === 'sniper') { T.glint = new THREE.Sprite(new THREE.SpriteMaterial({ map: FXT.flare, color: new THREE.Color(6, 6, 5), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, fog: false, toneMapped: false })); T.glint.position.set(0.06, 1.62, 0.04); T.glint.scale.setScalar(0.35); pivot.add(T.glint); }
  if (kind === 'rpg') { T.tag = new THREE.Sprite(TAGM.rpg); T.tag.center.set(0.5, 0); T.tag.position.set(0, 2.15, 0); T.tag.scale.setScalar(0.03); pivot.add(T.tag); }
  pivot.rotation.x = -Math.PI / 2; return T;
}
/* a round against a target: its board, in its own frame, against the figure (the head and the body, not the plywood round them) */
const _prI = new THREE.Matrix4(), _prO = V3(), _prD = V3();
function prRayFig(T, o, d, maxT) {
  if (T.up < 0.8 || T.hit) return null; T.board.updateMatrixWorld(true); _prI.copy(T.board.matrixWorld).invert();
  _prO.copy(o).applyMatrix4(_prI); _prD.copy(d).transformDirection(_prI); if (Math.abs(_prD.z) < 1e-6) return null;
  const t = -_prO.z / _prD.z; if (t <= 0 || t > maxT) return null; const x = _prO.x + _prD.x * t, y = _prO.y + _prD.y * t;
  return Math.abs(x) < 0.5 && y > -0.05 && y < 1.95 ? t : null;   // anywhere on the plywood counts: the drill teaches the controls, not marksmanship
}

/* ---------- the drill: one step at a time, each with its words, its hint, its marker and what finishes it ---------- */
const prPost = (id) => POSTS.find((p) => p.id === id);
const prDudu = () => FRIENDS[3];
const prKey = (desk, touch) => (TOUCH ? touch : desk);
const PR_STEPS = [
  { id: 'walk', title: 'גשו לעמדה', at: () => PR_AT.walk, label: 'המ״פ',
    say: ['ערב חג, ועדיין מתרגלים. תתקדם אליי בתעלה.'],
    hint: () => `<b>תנועה:</b> ${prKey(`${K('W')}${K('A')}${K('S')}${K('D')} הולכים, העכבר מסובב את המבט`, 'הג׳ויסטיק משמאל מזיז אתכם, גרירה מימין מסובבת את המבט')}. לכו אל ה־◆ הצהוב.`,
    done: () => prNear(PR_AT.walk, 2.2) },
  { id: 'run', title: 'ריצה', at: () => PR_AT.run, label: 'רוצו לכאן',
    say: ['ככה הולכים בחופש. במלחמה רצים. עד העמדה הבאה, בריצה!'],
    hint: () => `<b>ריצה:</b> ${prKey(`החזיקו ${K('Shift')} תוך כדי הליכה`, 'דחפו את הג׳ויסטיק עד הקצה')}. רוצו אל ה־◆.`,
    done: () => prNear(PR_AT.run, 2.4) },
  { id: 'crouch', title: 'מחסה וכריעה', at: () => PR_AT.bay, label: 'עמדת ירי',
    say: ['לעמדה. ראש למטה, מאחורי השקים. השקים עוצרים כדורים, הראש שלך לא.'],
    hint: () => TOUCH ? '<b>מחסה:</b> היכנסו לעמדת הירי (◆). בטלפון כורעים לבד מאחורי שקי החול, והם מגינים עליכם.' : `<b>מחסה:</b> היכנסו לעמדת הירי (◆) וכרעו מאחורי שקי החול: ${K('C')}.`,
    done: () => prNear(PR_AT.bay, 1.7) && (P.crouch || TOUCH) },
  { id: 'shoot', title: 'ירי במטרות', at: () => { const T = PR.tg.find((q) => q.want && !q.hit); return T ? prPt(T.x, T.z, 1.5, `מטרה · ${T.label}`) : null; },
    say: ['ככה הם ייראו מחר, אם יבואו. רובאי, מקלען, צלף, ונושא אר־פי־ג׳י. אחד אחד.'],
    start: () => prRaise(0),
    hint: () => `<b>ירי:</b> ${prKey(`${K('לחיצה')} יורה, ${K('לחצן ימני')} כוונת`, 'גררו באצבע בצד ימין של המסך כדי לכוון. הכפתור <kbd>אש</kbd> יורה, <kbd>כוונת</kbd> מקרבת')}. כל מטרה שנופלת מקימה את הבאה.`,
    done: () => PR.tg.every((q) => q.hit) },
  { id: 'reload', title: 'החלפת מחסנית', at: () => PR_AT.bay, label: 'עמדת ירי',
    say: ['מחסנית חצי ריקה זו מחסנית ריקה. מחליפים עכשיו, לא באמצע.'],
    start: () => { PR.rl = 0; if (TOUCH) P.mag = 0; },
    hint: () => TOUCH ? '<b>טעינה:</b> בטלפון הטעינה אוטומטית כשהמחסנית נגמרת. חכו שהרובה יטען.' : `<b>טעינה:</b> ${K('R')} מחליף מחסנית.`,
    done: () => { if (P.reloadT > 0) PR.rl = 1; return PR.rl === 1 && P.reloadT <= 0 && P.mag === 20; } },
  { id: 'gren', title: 'רימון לבור', at: () => [...prPt(PR_AT.pit[0], PR_AT.pit[1], 0.6, 'הבור'), null, 9],
    say: ['רואה את הבור עם השקים? רימון פנימה. מכוונים גבוה, הוא נופל בקשת.'],
    start: () => { P.gren = Math.max(P.gren, 3); PR.boomHit = false; },
    hint: () => `<b>רימון:</b> ${prKey(K('G'), 'הכפתור <kbd>רימון</kbd>')} זורק לאן שאתם מסתכלים. כוונו קצת מעל הבור.`,
    done: () => PR.boomHit },
  { id: 'gwarn', title: 'רימון אויב', at: () => null,
    say: ['ועכשיו רימון שלהם. של תרגיל, אבל תתנהג כאילו אמיתי. רימון!'],
    start: () => prThrowAtPlayer(),
    hint: () => `<b>רימון!</b> הסימן ⚠ מראה איפה הוא נפל. ${prKey('רוצו ממנו לאורך התעלה, מהר', 'דחפו את הג׳ויסטיק עד הקצה ורוצו ממנו לאורך התעלה')}.`,
    done: () => PR.gw === 'ok' },
  { id: 'man', title: 'איוש המא״ג', at: () => { const p = prPost('W2'); return prPt(p.stand[0], p.stand[1], 1.2, 'המא״ג המערבי'); },
    say: ['המא״ג המערבי. מחר זה מה שעומד בינם לבין הסוללה. תאייש אותו.'],
    hint: () => TOUCH ? '<b>מא״ג:</b> עמדו ליד המקלע (◆) ולחצו על הכפתור הירוק <kbd>לאייש מא״ג</kbd>.' : `<b>מא״ג:</b> עמדו ליד המקלע (◆) ולחצו ${K('E')}.`,
    done: () => P.mode === 'mag' && P.post && P.post.id === 'W2' },
  { id: 'raft', title: 'ירי על הסירה', at: () => { const r = PR.raft; return r ? [r.g.position.x, 1.2, r.g.position.z, `סירת מטרה · ${PR.raftHits}/12`] : null; },
    say: ['יוסי גורר סירת גומי על חבל. תחשוב שהיא מלאה בהם. צרורות קצרים.'],
    start: () => { PR.raftHits = 0; PR.raft.on = true; },
    hint: () => `<b>צרורות:</b> ${prKey(`החזיקו ${K('לחיצה ממושכת')}, ${K('לחצן ימני')} לזום`, 'גררו באצבע בצד ימין כדי לכוון את המקלע, החזיקו את <kbd>אש</kbd>, <kbd>כוונת</kbd> לזום')}. צרור קצר, תיקון, עוד צרור.`,
    done: () => PR.raftHits >= 12 },
  { id: 'belt', title: 'החלפת שרשרת', at: () => null,
    say: ['השרשרת נגמרת תמיד ברגע הכי גרוע. תחליף.'],
    start: () => { const m = P.post && P.post.mag; if (m) m.belt = Math.min(m.belt, 6); PR.bl = 0; },
    hint: () => TOUCH ? '<b>שרשרת:</b> ירו עד שהשרשרת נגמרת: המא״ג מחליף אותה לבד.' : `<b>שרשרת:</b> ${K('R')} מחליף שרשרת, או שהיא מתחלפת לבד כשהיא נגמרת.`,
    done: () => { const m = P.post && P.post.mag; if (!m) return false; if (m.reload > 0) PR.bl = 1; return PR.bl === 1 && m.reload <= 0; } },
  { id: 'leave', title: 'לרדת מהמא״ג', at: () => null,
    say: ['יופי. רד מהמקלע.'],
    hint: () => TOUCH ? '<b>לרדת:</b> הכפתור הירוק <kbd>לרדת</kbd>.' : `<b>לרדת:</b> ${K('E')} עוזב את המא״ג.`,
    done: () => P.mode === 'rifle' },
  { id: 'air', title: 'תרגיל אוויר', at: () => prPt(PR_AT.roof[0], PR_AT.roof[1], 1.4, 'קטע מקורה'),
    say: ['אזעקה! מטוסים! לקטע המקורה, מהר!'],
    start: () => prAirRun(),
    hint: () => (TOUCH ? '<b>מטוס בצלילה:</b> ג׳ויסטיק עד הקצה, ורוצו' : '<b>מטוס בצלילה:</b> רוצו') + ' לקטע המקורה בתעלה, שהגג שלו משקי חול (◆). בשטח פתוח התותחים שלו קורעים הכול.',
    done: () => PR.air === 'ok' },
  { id: 'treat', title: 'עזרה ראשונה', at: () => { const u = prDudu().unit; return [u.pos.x, u.pos.y + 0.4, u.pos.z, 'דודו · "פצוע"']; },
    say: ['דודו "נפגע" בתרגיל. אל תצחקו, תחבשו אותו כמו שצריך.'],
    start: () => prWoundDudu(),
    hint: () => `<b>עזרה ראשונה:</b> עמדו ליד הפצוע (✚) והחזיקו ${prKey(K('F'), 'את הכפתור הירוק שמופיע מימין')} עד שהפס מתמלא.`,
    done: () => prDudu().state === 'stable' },
  { id: 'carry', title: 'פינוי לתאג״ד', at: () => (P.mode === 'carry' ? [AIDPOST.x, AIDPOST.y ?? groundAt(AIDPOST.x, AIDPOST.z), AIDPOST.z, 'תאג״ד'] : null),
    say: ['עכשיו לתאג״ד. סוחבים אותו בתעלת הקשר, לא מעל הסוללה.'],
    hint: () => `<b>פינוי:</b> ${prKey('הכפתור הירוק', K('E'))} מרים אותו. סחבו אותו לאוהל התאג״ד (◆), ושם ${prKey('הכפתור הירוק', K('E'))} משכיב אותו על האלונקה.`,
    done: () => prDudu().state === 'saved' },
  { id: 'ammo', title: 'מילוי תחמושת', at: () => { const p = prPost('G2'); return prPt(p.stand[0], p.stand[1], 1.0, 'ארגז תחמושת'); },
    say: ['ירית כמו בחתונה. בכל עמדה יש ארגז. תמלא.'],
    start: () => { P.reserve = Math.min(P.reserve, 12); P.ammoCd = 0; },
    hint: () => `<b>תחמושת:</b> בכל עמדה לאורך התעלה יש ארגז. ${prKey('הכפתור הירוק', K('E'))} ליד הארגז ממלא כדורים ורימונים.`,
    done: () => P.reserve >= 160 },
];
/* ---------- the tank range: a Magach of the platoon goes up into a hull-down position at the south end of the stronghold and fires two
   shells at two old tanks towed out there as targets ---------- */
const PR_TK = { path: [[-6, -94], [-6, -117]], berm: [-6, -123], foes: [[-20, -262, 0.3], [24, -296, -0.25]] };
const PR_TC = 'ניסים · מפקד הטנק';
const prFoe = (i) => PR.foes && PR.foes[i];
const prFoeAt = (i) => { const v = prFoe(i); return v ? [v.g.position.x, v.g.position.y + 2.2, v.g.position.z, 'מטרה'] : null; };
const PR_TSTEPS = [
  { id: 'tup', title: 'לעמדת צריח', at: () => null, who: PR_TC,
    say: ['נהג, קדימה לעמדה. לאט... לאט... עצור. רק הצריח מעל הסוללה, הגוף מתחתיה. ככה הם רואים מאיתנו כמה שפחות.'],
    start: () => { TANK.goal = pathLen(PR_TK.path) - 0.05; },
    hint: () => '<b>עמדת צריח:</b> הטנק עולה לבד אל מאחורי סוללת העפר. רק הצריח והתותח מציצים מעליה, והגוף מוגן.',
    done: () => TANK.goal !== null && Math.abs(TANK.s - TANK.goal) < 0.08 && Math.abs(TANK.speed) < 0.05 },
  { id: 'tsight', title: 'כוונת התותחן', at: () => prFoeAt(0), who: PR_TC,
    say: ['תיכנס לכוונת. שני טנקים ישנים, גררו אותם לשם בשבילנו.'],
    hint: () => `<b>כוונת:</b> ${prKey(`${K('לחצן ימני')} נכנסים לכוונת התותחן, והעכבר מזיז את הצריח`, 'הכפתור <kbd>כוונת</kbd> מכניס לכוונת התותחן. גוררים באצבע בצד ימין כדי לסובב את הצריח')}.`,
    done: () => P.ads > 0.5 },
  { id: 'tfire1', title: 'פגז ראשון', at: () => prFoeAt(0), who: PR_TC,
    say: ['טנק, ימני, אלף שמונה מאות. תותחן, אש!'],
    hint: () => `<b>פגז:</b> שימו את הצלב על הטנק הימני ו${prKey(`לחצו ${K('G')}`, 'לחצו על הכפתור <kbd>תותח</kbd>')}. הכוונת עוזרת לכם להינעל על המטרה.`,
    done: () => prFoe(0) && !prFoe(0).alive },
  { id: 'tfire2', title: 'פגז שני', at: () => prFoeAt(1), who: PR_TC,
    say: ['פגיעה! טען... מוכן. טנק שמאלי, רחוק יותר. אש!'],
    hint: () => `<b>טעינה:</b> אחרי כל פגז הטען טוען 4 שניות (בפינה כתוב "טוען"). כוונו לטנק השמאלי ו${prKey(K('G'), 'הכפתור <kbd>תותח</kbd>')}.`,
    done: () => prFoe(1) && !prFoe(1).alive },
];
const prSteps = () => (PR.stage === 1 ? PR_TSTEPS : PR_STEPS);
function prBuildRange() {
  // the earth bank the tank goes up behind: a long low mound across its front
  const [bx, bz] = PR_TK.berm, g0 = groundAt(bx, bz), geo = new THREE.CylinderGeometry(1.7, 2.1, 9.5, 18, 1).rotateZ(Math.PI / 2); geo.scale(1, 0.72, 1);
  const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0xb59c6c, roughness: 1 })); m.position.set(bx, g0 - 0.12, bz); m.receiveShadow = SHADOWS; m.castShadow = SHADOWS; scene.add(m);
  // the targets: two old T-55s, white crosses painted on them, standing in the sand far out to the south
  PR.foes = PR_TK.foes.map(([x, z, h]) => { const v = addVeh({ mode: 'prologue', side: 'e', kind: 't55', geo: T55_HULL, turGeo: T55_TUR, turAt: [0.3, 1.42, 0], half: [3.2, 2.3, 1.75], armor: 0, hp: 100, vmax: 0, shoots: false, fireCd: 1e9 }); v.at = [x, z, Math.PI + h]; if (v.g.userData.vl) v.g.userData.vl.crew = false; return v; });   // nobody in them
}
function prTankSetup() {
  for (const v of PR.foes) { vehRevive(v); v.shown = true; v.g.visible = true; v.path = null; v.fireCd = 1e9; v.shoots = false; vehPose(v, v.at[0], v.at[1], v.at[2]); }
  tankStart(PR_TK.path, (x, z) => [x, z], 0, []); TANK.driveOn = false; TANK.free = false; TANK.goal = null; TANK.speed = 0; P.pitch = -0.04;
  PR.step = -1; DIRQ.push({ at: GAME.t + 1.6, fn: () => prStep(0) });
}
function prTankDone() {
  radio(PR_TC, 'שתי יריות, שתי פגיעות. אם הם יבואו מחר, זה מה שיקרה להם.', 4.2, true);
  DIRQ.push({ at: GAME.t + 4.6, fn: () => radio('הטען', 'אחרי מה שעשינו להם ב־67? הם לא יעזו לחצות.', 3.6, true) });
  DIRQ.push({ at: GAME.t + 8.6, fn: () => prCut(() => prSetup(PR_NIGHT)) });
}
const prPt = (x, z, h, label) => [x, groundAt(x, z) + h, z, label];
const prNear = (at, r) => Math.hypot(at[0] - P.pos.x, at[1] - P.pos.z) < r;

/* ---------- the pieces of the drill ---------- */
function prRaise(i) { const T = PR.tg[i]; if (!T) return; T.want = 1; T.hit = false; sndClick(260, 0.25); }
function prThrowAtPlayer() {
  const mc = FRIENDS[0].unit, from = mc.pos.clone().add(V3(0, 1.6, 0)), d = Math.atan2(P.pos.x - mc.pos.x, P.pos.z - mc.pos.z);
  const to = V3(P.pos.x + Math.sin(d) * 1.6, P.pos.y + 0.2, P.pos.z + Math.cos(d) * 1.6), T = 1.1, v = to.clone().sub(from).multiplyScalar(1 / T); v.y += 0.5 * 9.8 * T;
  PR.gw = 'fly'; PR.gwAt = to.clone(); PR.gwT = GAME.t; throwGrenade(from, v, 'e');
}
function prAirRun() { PR.air = 'wait'; PR.airT = GAME.t; spawnJets(0); prSiren(); }
function prSiren() {   // the stronghold's hand siren, wound up and down
  if (!AUD.ctx) return; const ctx = AUD.ctx, t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'triangle';
  o.frequency.setValueAtTime(300, t); for (let k = 0; k < 3; k++) { o.frequency.linearRampToValueAtTime(980, t + k * 2 + 1.1); o.frequency.linearRampToValueAtTime(420, t + k * 2 + 2); }
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.07, t + 0.6); g.gain.setValueAtTime(0.07, t + 5.4); g.gain.exponentialRampToValueAtTime(0.0001, t + 6.2);
  o.connect(g); g.connect(AUD.master); o.start(t); o.stop(t + 6.3);
}
function prWoundDudu() {
  const f = prDudu(), u = f.unit; f.prevState = 'post'; if (f.post) f.post.occupant = null;
  u.place(PR_AT.dudu[0], PR_AT.dudu[1]); u.heading = 0;   /* along the trench, not into its wall */ u.fall = 0; u.fallDir = 1; u.stance = 'down'; u.alive = true; f.state = 'wounded'; f.bleed = 1e9; f.marker.visible = true;
}
/* the boat on the rope: towed up and down the canal before the western MAG, three figures standing in it */
function prBuildRaft() {
  const g = new THREE.Group(); g.add(new THREE.Mesh(RBOAT_GEO, MAT.vc)); g.rotation.y = Math.PI / 2; SH(onLayer1(g), true, false); scene.add(g);
  const figs = [-1.4, 0, 1.4].map((lx, k) => { const T = prTarget(['rifle', 'lmg', 'rifle'][k], 0, 0, 0, 1, '', g); T.root.position.set(lx, 0.1, 0); T.root.rotation.y = 0; T.root.scale.setScalar(0.85); T.up = 1; T.want = 1; T.pivot.rotation.x = 0; return T; });
  const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1, 5).rotateX(Math.PI / 2), MAT.dark); scene.add(onLayer1(rope));
  PR.raft = { g, figs, rope, z: -46, dir: 1, on: false };
}
function prRaftUpd(dt) {
  const R = PR.raft; if (!R) return; if (R.on) { R.z += R.dir * 2.3 * dt; if (R.z > 22) R.dir = -1; if (R.z < -46) R.dir = 1; }
  const x = -117, y = 0.05 + Math.sin(GAME.t * 1.4) * 0.04; R.g.position.set(x, y, R.z); R.g.rotation.z = Math.sin(GAME.t * 1.1) * 0.03;
  // the rope from the boat to Yossi's stake on the beach, upstream
  const a = V3(x, 0.45, R.z + R.dir * 2.4), b = V3(-104, 0.6, R.dir > 0 ? 40 : -64); R.rope.position.copy(a).add(b).multiplyScalar(0.5); R.rope.scale.set(1, 1, a.distanceTo(b)); R.rope.lookAt(b);
}

/* ---------- the chapter ---------- */
/* the battalion aid station for the drill: a big tent in the yard behind the western trench - canvas on poles, a red cross on white on its
   roof and its sides, stretchers on the ground, a medical chest, a doctor and a medic waiting */
function prBuildTent() {
  const [tx, tz] = PR_AT.tent, g0 = groundAt(tx, tz), g = new THREE.Group(); g.position.set(tx, g0, tz);
  const W = 9, D = 7, H = 3.1, E = 1.9, can = new THREE.MeshStandardMaterial({ color: 0x6f6a48, roughness: 0.95, side: THREE.DoubleSide }), pole = new THREE.MeshStandardMaterial({ color: 0x4a3a28, roughness: 0.9 });
  const crossTex = (() => { const c = canvas(128, 128), q = c.getContext('2d'); q.fillStyle = '#f2efe6'; q.fillRect(0, 0, 128, 128); q.fillStyle = '#c4161c'; q.fillRect(48, 14, 32, 100); q.fillRect(14, 48, 100, 32); return tex(c); })();
  const crossM = new THREE.MeshStandardMaterial({ map: crossTex, roughness: 0.9, side: THREE.DoubleSide, emissive: 0x220404 });
  // the roof: two slopes from the ridge to the eaves
  const slope = Math.hypot(D / 2, H - E), ang = Math.atan2(H - E, D / 2);
  for (const sd of [-1, 1]) { const r = new THREE.Mesh(new THREE.PlaneGeometry(W, slope), can); r.position.set(0, (H + E) / 2, sd * D / 4); r.rotation.x = -Math.PI / 2 + sd * ang; g.add(r);
    const c = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2.4), crossM); c.position.set(0, (H + E) / 2 + 0.03, sd * D / 4 + sd * 0.01); c.rotation.x = -Math.PI / 2 + sd * ang; g.add(c); }
  // the walls: the two long sides (to the eaves) and the far gable; the gable towards the trench is left open, the way in
  const gab = new THREE.Shape([new THREE.Vector2(-D / 2, 0), new THREE.Vector2(D / 2, 0), new THREE.Vector2(D / 2, E), new THREE.Vector2(0, H), new THREE.Vector2(-D / 2, E)]);
  { const m = new THREE.Mesh(new THREE.ShapeGeometry(gab), can); m.rotation.y = Math.PI / 2; m.position.set(W / 2, 0, 0); g.add(m); const c = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.5), crossM); c.rotation.y = Math.PI / 2; c.position.set(W / 2 + 0.02, 1.95, 0); g.add(c); }
  for (const sd of [-1, 1]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(W, E), can); m.position.set(0, E / 2, sd * D / 2); g.add(m); const c = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.4), crossM); c.position.set(0, 1.0, sd * (D / 2 + 0.02)); g.add(c); }
  // the front, towards the trench: canvas either side of a wooden door frame, the gable over it, and a door that opens like the post's on the Hermon
  { const DW = 0.82, DH = 2.3, side = (D / 2 - DW) ; for (const sd of [-1, 1]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(side, E), can); m.rotation.y = Math.PI / 2; m.position.set(-W / 2, E / 2, sd * (DW + side / 2)); g.add(m); }
    const top = new THREE.Shape([new THREE.Vector2(-D / 2, E), new THREE.Vector2(-DW, E), new THREE.Vector2(-DW, DH + 0.1), new THREE.Vector2(DW, DH + 0.1), new THREE.Vector2(DW, E), new THREE.Vector2(D / 2, E), new THREE.Vector2(0, H)]); const tm = new THREE.Mesh(new THREE.ShapeGeometry(top), can); tm.rotation.y = Math.PI / 2; tm.position.set(-W / 2, 0, 0); g.add(tm);
    const fr = new THREE.MeshStandardMaterial({ color: 0x6b5236, roughness: 0.9 }); for (const sd of [-1, 1]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.1, DH + 0.1, 0.1), fr); p.position.set(-W / 2, (DH + 0.1) / 2, sd * (DW + 0.05)); g.add(p); }
    { const b = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, DW * 2 + 0.2), fr); b.position.set(-W / 2, DH + 0.05, 0); g.add(b); }
    const c = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.0), crossM); c.rotation.y = Math.PI / 2; c.position.set(-W / 2 - 0.02, H - 0.45, 0); g.add(c); }
  for (const [x, z, h] of [[-W / 2, -D / 2, E], [-W / 2, D / 2, E], [W / 2, -D / 2, E], [W / 2, D / 2, E], [-W / 2, 0, H], [W / 2, 0, H], [0, 0, H]]) { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, h, 6), pole); m.position.set(x, h / 2, z); g.add(m); }
  // three stretchers on the ground (the middle one is where the wounded are laid), a medical chest, a water can
  const st = new THREE.MeshStandardMaterial({ color: 0x55603d, roughness: 1 }), bar = new THREE.MeshStandardMaterial({ color: 0x3b3a30, roughness: 0.8 });
  for (const z of [-0.9, 0, 0.9]) { const s = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.04, 0.6), st); s.position.set(1.2, 0.2, z); g.add(s); for (const sd of [-1, 1]) { const b = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.05, 0.05), bar); b.position.set(1.2, 0.18, z + sd * 0.3); g.add(b); } for (const lx of [0.3, 2.1]) for (const sd of [-1, 1]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.18, 0.05), bar); l.position.set(lx, 0.09, z + sd * 0.3); g.add(l); } }
  { const ch = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.5, 0.55), new THREE.MeshStandardMaterial({ color: 0x4d5636, roughness: 0.9 })); ch.position.set(3.4, 0.25, -2.8); g.add(ch); const c = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.4), crossM); c.position.set(3.4, 0.36, -2.52); g.add(c); }
  g.traverse((m) => { if (m.isMesh) { m.castShadow = SHADOWS; m.receiveShadow = SHADOWS; } }); scene.add(g);
  // the doctor and the medic (the game's own soldiers, dressed like the others)
  PR.medics = [[2.6, -1.0, Math.PI, 'idle'], [0.3, 1.0, Math.PI / 2, 'idle']].map(([x, z, hd, pose]) => { const u = new Unit('f', 'rifle'); scene.remove(u.tag); u.place(tx + x, tz + z); u.heading = hd; u.alive = true; u.stance = 'stand'; u.rig.root.visible = true; u.rig.gun.visible = false; u.rig.pose(pose, 0); u.sync(); return u; });
  PR.tent = { x: tx + 1.2, z: tz, rot: 0, y: undefined };
  // the door: a wooden leaf hinged at the frame's south post; it swings into the tent (the post's door on the Hermon, pdoorStart, opens it)
  { const dx = tx - W / 2, mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85 });
    const geo = build([[new THREE.BoxGeometry(1.56, 2.24, 0.05), 0x7a6040, M4(0.78, 1.12, 0)], [new THREE.BoxGeometry(1.4, 0.06, 0.07), 0x5e4a30, M4(0.78, 0.35, 0)], [new THREE.BoxGeometry(1.4, 0.06, 0.07), 0x5e4a30, M4(0.78, 1.9, 0)], [new THREE.BoxGeometry(0.12, 0.04, 0.16), 0x1c1c1a, M4(1.38, 1.02, 0)]]);
    const pivot = new THREE.Group(), phi = -Math.PI / 2; pivot.position.set(dx, g0, tz - 0.78); pivot.rotation.y = phi; pivot.add(new THREE.Mesh(geo, mat)); scene.add(SH(onLayer1(pivot), false, true));
    const col = addCollider(dx, tz, 0.82, 0.12, -Math.PI / 2, g0 + 2.3, g0 - 0.1);
    PR.door = { pivot, phi, sgn: 1, col, top: col.top, bot: col.bot, ang: 0, open: false, at: V3(dx, g0 + 1.2, tz), y: g0, nIn: V3(1, 0, 0), geo, mat, rate: 7 };
    // the canvas walls hold: you go in by the door
    addCollider(dx, tz - (0.82 + (D / 2 - 0.82) / 2), 0.08, (D / 2 - 0.82) / 2, 0, g0 + 2, g0 - 0.1); addCollider(dx, tz + (0.82 + (D / 2 - 0.82) / 2), 0.08, (D / 2 - 0.82) / 2, 0, g0 + 2, g0 - 0.1);
    for (const sd of [-1, 1]) addCollider(tx, tz + sd * D / 2, W / 2, 0.08, 0, g0 + 2, g0 - 0.1); addCollider(tx + W / 2, tz, 0.08, D / 2, 0, g0 + 2, g0 - 0.1); }
}
/* the way out of the western trench to the aid tent: wooden steps up over the rear parapet and down the back of the rampart into the yard
   (in the battle that wall is whole; for the drill its two segments there are opened, prSetup) */
const PR_EXIT = { z0: 9.7, z1: 11.4, x0: -75.55, x1: -74.55, x2: -73.95, x3: -71.2 };
function prExitSurf(on) { for (const q of PR.exitSurf || []) { if (q.ramp) { q.y0 = on ? q.on.y0 : -100; q.y1 = on ? q.on.y1 : -100; } else q.y = on ? q.on.y : -100; } }   // the steps are walked on only in the drill
function prBuildExit() {
  const E = PR_EXIT, zc = (E.z0 + E.z1) / 2, hw = (E.z1 - E.z0) / 2, yF = groundAt(E.x0 - 0.3, zc), yT = 8.4, yG = groundAt(E.x3 + 0.2, zc);
  PR.exitCols = COLLIDERS.filter((c) => Math.abs(c.x - (-74.85)) < 0.3 && c.z > E.z0 - 0.4 && c.z < E.z1 + 0.4 && c.top > yF);
  PR.exitSurf = [addRamp(E.x0, E.x1, E.z0, E.z1, 'x', E.x0, E.x1, yF, yT), addFloor(E.x1, E.x2, E.z0, E.z1, yT), addRamp(E.x2, E.x3, E.z0, E.z1, 'x', E.x2, E.x3, yT, yG)];
  for (const q of PR.exitSurf) q.on = { y: q.y, y0: q.y0, y1: q.y1 }; prExitSurf(false);
  const wood = new THREE.MeshStandardMaterial({ color: 0x7a6040, roughness: 0.9 }), dark = new THREE.MeshStandardMaterial({ color: 0x4e3c28, roughness: 0.9 }), g = new THREE.Group();
  const flight = (xa, xb, ya, yb, n) => { for (let i = 0; i < n; i++) { const u = (i + 0.5) / n, x = lerp(xa, xb, u), y = lerp(ya, yb, u); const st = new THREE.Mesh(new THREE.BoxGeometry(Math.abs(xb - xa) / n + 0.04, 0.06, hw * 2), wood); st.position.set(x, y - 0.03, zc); g.add(st); }
    const L = Math.hypot(xb - xa, yb - ya), a = Math.atan2(yb - ya, xb - xa); for (const sd of [-1, 1]) { const s2 = new THREE.Mesh(new THREE.BoxGeometry(L + 0.2, 0.22, 0.07), dark); s2.position.set((xa + xb) / 2, (ya + yb) / 2 - 0.1, zc + sd * (hw + 0.03)); s2.rotation.z = a; g.add(s2); } };
  flight(E.x0, E.x1, yF, yT, 6); flight(E.x2, E.x3, yT, yG, 10);
  { const pl = new THREE.Mesh(new THREE.BoxGeometry(E.x2 - E.x1 + 0.05, 0.08, hw * 2), wood); pl.position.set((E.x1 + E.x2) / 2, yT - 0.04, zc); g.add(pl); }
  for (const sd of [-1, 1]) for (const x of [E.x1, E.x2]) { const r = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.0, 0.06), dark); r.position.set(x, yT + 0.5, zc + sd * (hw + 0.03)); g.add(r); }
  g.traverse((m) => { if (m.isMesh) { m.castShadow = SHADOWS; m.receiveShadow = SHADOWS; } }); scene.add(g);
}
function prBuild() {
  const C = CHAP.prologue; C.slots = []; C.covers = [];
  prBuildTent(); prBuildExit(); prBuildRange();
  PR.tg = PR_TARGETS.map(([x, z, kind, label]) => { const [bx, bz] = PR_AT.bay; return prTarget(kind, x, z, bx - x, bz - z, label); });
  // the grenade pit: a ring of sandbags round a hollow
  { const BAGS = [], sv = BATCH.bag; BATCH.bag = BAGS; const [px, pz] = PR_AT.pit, g0 = groundAt(px, pz), ring = []; for (let a = 0; a <= 360.1; a += 15) { const r = THREE.MathUtils.degToRad(a); ring.push([px + Math.sin(r) * PR_PIT_R, pz + Math.cos(r) * PR_PIT_R]); } bagWall(ring, 1, null, false); BATCH.bag = sv; scene.add(bagMesh(BAGS));
    const hg = new THREE.CircleGeometry(PR_PIT_R - 0.3, 40, 0).rotateX(-Math.PI / 2), hp = hg.attributes.position; for (let k = 0; k < hp.count; k++) { const x = px + hp.getX(k), z = pz + hp.getZ(k); hp.setY(k, groundAt(x, z) - g0 + 0.04); } hg.computeVertexNormals();
    const hole = new THREE.Mesh(hg, new THREE.MeshStandardMaterial({ color: 0x5a4c36, roughness: 1 })); hole.position.set(px, g0, pz); scene.add(onLayer1(hole)); }
  prBuildRaft();
}
function prSetup(stage = 0) {
  if (PR.door) { hmDoorSet(PR.door, false, true); PR.door.rate = 7; } PR.bedT = 0;
  for (const c of PR.exitCols || []) { if (c.top0 === undefined) c.top0 = c.top; c.top = -1e4; } prExitSurf(true);   // the steps over the parapet to the aid tent
  if (!PR.aid0) PR.aid0 = { ...AIDPOST }; Object.assign(AIDPOST, PR.tent); delete AIDPOST.y;   // the wounded go to the aid tent in the yard
  for (const B of BARRS) { B.on = false; B.g.visible = false; B.col.top = -1e4; }   // a drill, not the battle: every trench of the stronghold is open
  const C = CHAP.prologue; fieldSetupCommon(C, stage); C.t = 0; PR.stage = stage; PR.msgs = {}; PR.done = []; P.mode = 'rifle'; vm.visible = true; TANK.g && (TANK.g.visible = false);
  for (const T of PR.tg) { T.want = 0; T.up = 0; T.hit = false; T.pivot.rotation.x = -Math.PI / 2; }
  for (const p of POSTS) { p.occupant = null; const m = p.mag; if (!m) continue; m.reload = 0; m.belt = m.cap || 200; m.pitch = 0; m.yaw = m.yaw0 ?? m.yaw; }
  PR.raft.on = false; PR.raft.z = -46; PR.raft.dir = 1; PR.gw = null; PR.air = null;
  const fr = [[PR_MC, -77.4, -36.2, -1, 0.3], ['יוסי', -104.5, 40.5, 0, -1], ['רפי', -78.6, -30.5, -1, 0], ['דודו', -76.4, 14, 0, -1], ['שמוליק', -78.6, 29.9, -1, 0.4], ['אבי', -78.4, 47.3, -0.3, 0.9]];
  fieldFriends(fr.map(([name, x, z, fx, fz]) => ({ name, x, z, fx, fz })));
  if (stage === 0) {
    const [sx, sz] = PR_AT.start; P.pos.set(sx, groundAt(sx, sz), sz); P.yaw = Math.PI; P.pitch = -0.04;
    prStep(0);
  } else if (stage === 1) prTankSetup(); else prNight();
  fieldStage(C, stage);
}
function prStep(i) {
  PR.step = i; PR.stepT = 0; const S = prSteps()[i]; if (!S) { if (PR.stage === 1) prTankDone(); else prDrillDone(); return; }
  if (S.start) S.start();
  TUT.radioQ = TUT.radioQ.filter((r) => r.who !== PR_MC && r.who !== PR_TC);   // the words of a step already passed are not said any more
  for (const l of S.say) radio(S.who || PR_MC, l, Math.max(3.2, l.length * 0.075), true);
  PR.hintAt = GAME.t + 0.8;   // the hint follows the words a moment later
  prMcTo(i);
}
/* the company commander goes ahead to the next place of the drill: he walks there if you are watching, and simply is there if you are not */
const PR_MC_AT = { walk: [-77.6, -36.6], run: [-77.4, -26.2], crouch: [-77.4, -21.4], gren: [-77.4, -21.4], man: [-77.3, -10.6], air: [-77.0, -3.6], treat: [-75.3, 12.6], ammo: [-77.6, 21.2] };
function prMcTo(i) {
  if (PR.stage !== 0) return; const id = PR_STEPS[i].id, at = PR_MC_AT[id]; if (!at) return; const f = FRIENDS[0];
  if (Math.hypot(f.unit.pos.x - at[0], f.unit.pos.z - at[1]) < 0.5) return;
  f.state = 'toPost'; f.goal = at; f.goalY = undefined; f.delay = 0; f.post.fx = -1; f.post.fz = 0;
}
function prDrillDone() {
  PR.msgs.end = GAME.t; radio(PR_MC, 'זהו. אתם מוכנים, ואני מקווה שלא נצטרך. ארוחת חג בשש, ושמירה בלילה.', 4.6, true);
  DIRQ.push({ at: GAME.t + 5.0, fn: () => radio('רפי', 'המפקד, המודיעין אומר "סבירות נמוכה". המצרים עושים תרגיל, כמו כל סתיו.', 4.4, true) });
  DIRQ.push({ at: GAME.t + 9.6, fn: () => radio(PR_MC, 'שיעשו. אחרי ששת הימים הם יודעים מה מחכה להם. עכשיו לטנקים, הם יורים לפני השקיעה.', 4.6, true) });
  DIRQ.push({ at: GAME.t + 14.6, fn: () => prCut(() => prSetup(1)) });
}
function prNight() {
  const [x, z] = PR_AT.night; P.pos.set(x, groundAt(x, z), z); P.yaw = Math.PI / 2; P.pitch = 0.02; PR.nightT = 0;
  FRIENDS[2].unit.place(-78.7, 2.6); FRIENDS[2].unit.heading = -Math.PI / 2; FRIENDS[2].state = 'post'; FRIENDS[2].unit.stance = 'stand';
  DIRQ.push({ at: GAME.t + 2.5, fn: () => radio('רפי', 'שקט מדי הלילה. אפילו הכלבים בצד שלהם שותקים.', 4.2, true) });
  DIRQ.push({ at: GAME.t + 8, fn: () => radio('רפי', 'מחר יום כיפור. אצלם רמדאן. אף אחד לא יירה מחר, נכון?', 4.4, true) });
  DIRQ.push({ at: GAME.t + 13.5, fn: () => radio('שמוליק', 'שיירו. ב־67 הם השאירו את הנעליים בחול וברחו. יש לנו את הסוללה, את הטנקים ואת חיל האוויר.', 5, true) });
  DIRQ.push({ at: GAME.t + 19.5, fn: () => radio('רפי', 'כן... יומיים, ואנחנו בקהיר. ככה אומרים.', 3.6, true) });
  DIRQ.push({ at: GAME.t + 25, fn: prToMission1 });
}
/* a fade to black and back, with the change made in the dark */
function prCut(fn) { const f = $('#fade'); f.style.transition = 'opacity .6s'; f.style.opacity = '1'; DIRQ.push({ at: GAME.t + 0.7, fn: () => { fn(); DIRQ.push({ at: GAME.t + 0.4, fn: () => { f.style.opacity = '0'; } }); } }); }
/* the end of the eve: black, the date, and mission 1 */
function prToMission1() {
  const el = document.createElement('div'); el.id = 'prCard';
  el.innerHTML = '<div><small>שבת</small><b>6 באוקטובר 1973</b><span>13:55</span></div>';
  el.style.cssText = 'position:fixed;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;background:#000;color:#efe6cf;opacity:0;transition:opacity 1.2s;text-align:center;font-family:"Rubik Dirt","Heebo",sans-serif;direction:rtl';
  el.querySelector('div').style.cssText = 'display:flex;flex-direction:column;gap:6px;font-size:clamp(28px,6vw,64px);line-height:1.1';
  el.querySelector('small').style.cssText = 'font-family:Heebo,sans-serif;font-size:.36em;letter-spacing:.2em;opacity:.7';
  el.querySelector('span').style.cssText = 'font-size:.62em;opacity:.85';
  document.body.appendChild(el); requestAnimationFrame(() => (el.style.opacity = '1'));
  markDone('prologue');
  setTimeout(() => { startChapter('mezach'); setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 1400); }, 1600); }, 3200);
}
function prUpd(dt) {
  const C = CHAP.prologue; C.t += dt; PR.stepT += dt;
  for (let i = DIRQ.length - 1; i >= 0; i--) if (DIRQ[i] && GAME.t >= DIRQ[i].at) { const q = DIRQ.splice(i, 1)[0]; q.fn(); }
  if (PR.medics) for (const u of PR.medics) u.sync();
  // the aid tent's door: carrying the wounded up to it, the player opens it by hand and goes in, and lays him on the stretcher by himself
  { const d = PR.door; if (d) {
    if ((P.mode === 'carry' || P.mode === 'rifle') && !d.open && !PDOOR.on && P.pos.x < d.at.x && Math.hypot(P.pos.x - d.at.x, P.pos.z - d.at.z) < 2.1) { HM_DOOR_WAY.n = 1; pdoorStart(d); if (P.mode === 'carry') PR.bedT = 1; }
    const tg = d.open ? 1 : 0; if (Math.abs(d.ang - tg) > 1e-3) { d.ang += (tg - d.ang) * Math.min(1, dt * (d.rate || 7)); d.pivot.rotation.y = d.phi + d.sgn * d.ang * 1.66; }
    if (P.mode === 'carry' && !PR.bedT && d.open && Math.hypot(P.pos.x - AIDPOST.x, P.pos.z - AIDPOST.z) < 3.2) PR.bedT = 1;   // the door already open: in, and down on the stretcher
    if (PR.bedT === 1 && !PDOOR.on && P.mode === 'carry') { PR.bedT = 2; promptState = { act: 'drop-aid' }; doAction(); }
  } }
  if (P.hp < 100) P.hp = 100; if (PR.stage === 0 && P.gren < 3) P.gren = 3;   // a drill: grenades without end
  // the pit catches a grenade that reaches it: on the slope of the rampart it would roll on down to the water
  for (const q of PROJ) if (q.type === 'gren' && q.owner === 'player' && Math.hypot(q.m.position.x - PR_AT.pit[0], q.m.position.z - PR_AT.pit[1]) < PR_PIT_R && q.m.position.y < groundAt(q.m.position.x, q.m.position.z) + 0.6) { q.v.set(0, Math.min(q.v.y, 0), 0); }
  // the targets rise and fall on their hinges; the sniper's scope glints, the RPG man's tag blinks
  for (const T of PR.tg) {
    const want = T.want && !T.hit ? 1 : 0; T.up += clamp(want - T.up, -dt * 2.2, dt * 1.6); T.pivot.rotation.x = -Math.PI / 2 * (1 - T.up) * (1 - T.up * 0.0);
    if (T.glint) T.glint.visible = T.up > 0.9 && (GAME.t % 1.6) < 0.22; if (T.tag) T.tag.visible = T.up > 0.9 && (GAME.t * 3) % 1 < 0.6;
  }
  for (const T of PR.raft ? PR.raft.figs : []) if (T.hit && T.pivot.rotation.x > -1.4) T.pivot.rotation.x -= dt * 3;
  prRaftUpd(dt);
  if (PR.stage === PR_NIGHT) return;
  const S = prSteps()[PR.step]; if (!S) return;
  if (PR.hintAt && GAME.t >= PR.hintAt) { PR.hintAt = 0; TUT.seen['pr-' + S.id] = false; hint('pr-' + S.id, S.hint(), 30); }
  // the enemy grenade of the drill: away from it when it goes, or once more
  if (S.id === 'gwarn' && PR.gw === 'fly' && GAME.t - PR.gwT > 2.75) { const far = Math.hypot(P.pos.x - PR.gwAt.x, P.pos.z - PR.gwAt.z) > 4.5; PR.gw = far ? 'ok' : 'again'; if (!far) { radio(PR_MC, 'מת. בתרגיל, אבל מת. עוד פעם, והפעם תזוז!', 3.4, true); DIRQ.push({ at: GAME.t + 3.6, fn: prThrowAtPlayer }); } }
  // the air-raid drill: under the roof as the jets pass overhead, or the jets come round again
  if (S.id === 'air' && PR.air === 'wait') { const tt = GAME.t - PR.airT; if (tt > 12.5 && tt < 15.5 && sheltered()) PR.air = 'ok'; else if (tt >= 15.5) { PR.air = 'again'; radio(PR_MC, 'בשטח פתוח המטוס הזה היה קורע אותך. עוד סיבוב!', 3.4, true); DIRQ.push({ at: GAME.t + 4, fn: prAirRun }); } }
  if (S.done()) {
    PR.done.push(S.title); feed(`✓ ${S.title}`, 'good'); sndClick(1500, 0.2); setTimeout(() => sndClick(1900, 0.18), 90);
    if (S.id === 'carry') { const u = prDudu().unit; u.pos.y = groundAt(u.pos.x, u.pos.z) + 0.24; u.sync(); DIRQ.push({ at: GAME.t + 1.6, fn: () => radio('דודו', 'אני מת... מצחוק. תודה, חובש. אני נשאר פה קצת, נוח במיטה.', 3.4, true) }); }   // he lies on the stretcher, and stays there
    if (S.id === 'shoot') for (const T of PR.tg) T.want = 0;
    PR.step = -1; DIRQ.push({ at: GAME.t + 1.3, fn: () => prStep(prSteps().indexOf(S) + 1) });
  }
}
/* the hooks: a round from the player against the targets and the boat (castShot), what it hits (applyHit), a grenade going off (explode),
   and first aid that leaves the "wounded" man for carrying instead of sending him back to his post */
function prRayT(o, d, maxT) {
  let best = null;
  for (const T of PR.tg) { const t = prRayFig(T, o, d, best ? best.t : maxT); if (t !== null) best = { t, kind: 'target', tg: T }; }
  const R = PR.raft; if (R && R.on) { R.g.updateMatrixWorld(true); _prI.copy(R.g.matrixWorld).invert(); _prO.copy(o).applyMatrix4(_prI); _prD.copy(d).transformDirection(_prI); const h = rayBox(_prO, _prD, -2.4, 2.4, -0.1, 1.8, -0.95, 0.95); if (h !== null && h > 0 && h < (best ? best.t : maxT)) best = { t: h, kind: 'target', raft: true }; }
  return best;
}
function prHitT(hit) {
  if (hit.raft) { PR.raftHits = (PR.raftHits || 0) + 1; fxDust(hit.p.clone(), true); const f = PR.raft.figs[PR.raftHits % 3]; if (PR.raftHits >= 12) for (const T of PR.raft.figs) T.hit = true; return; }
  const T = hit.tg; if (!T || T.hit) return; T.hit = true; fxDust(hit.p.clone(), false); sndImpact(hit.p); hitmark(true);
  const i = PR.tg.indexOf(T); if (PR.stage === 0 && PR_STEPS[PR.step] && PR_STEPS[PR.step].id === 'shoot') DIRQ.push({ at: GAME.t + 0.9, fn: () => prRaise(i + 1) });
}
function prBoom(p, src) { if (src === 'player' && PR.stage === 0 && PR_STEPS[PR.step] && PR_STEPS[PR.step].id === 'gren' && Math.hypot(p.x - PR_AT.pit[0], p.z - PR_AT.pit[1]) < PR_PIT_R + 1.5) PR.boomHit = true; }
function prTreat(f) { f.state = 'stable'; f.marker.visible = true; f.bleed = 1e9; STATS.treated++; feed(`${f.name} חבוש. עכשיו לפנות`, 'good'); radio(f.name, 'איי... חבשת כמו אמא שלי. עכשיו תסחוב אותי.', 3, true); }
function prObj() { const S = prSteps()[PR.step]; if (PR.stage === PR_NIGHT || !S) return null; const a = S.at(); if (!a) return null; if (a.length >= 4) return a; return [a[0], groundAt(a[0], a[1]) + 1.2, a[1], S.label || S.title]; }
function prItems(items) {
  if (PR.stage === PR_NIGHT) { items.push(['go', PR_STAGES[PR_NIGHT].goal]); return; }
  items.push(['go', PR.stage === 1 ? 'מטווח טנקים · עמדת צריח' : 'תרגיל כוננות · ערב יום כיפור']);
  const n = prSteps().length, i = Math.max(0, PR.step), last = PR.done[PR.done.length - 1];
  if (last) items.push(['done', `✓ ${last}`]);
  const S = prSteps()[PR.step]; if (S) items.push(['next', `${S.title} <small>${Math.min(i + 1, n)}/${n}</small>`]);
  if (S && S.id === 'raft') items.push(['', `פגיעות בסירה: ${PR.raftHits || 0}/12`]);
  if (S && S.id === 'shoot') items.push(['', `מטרות: ${PR.tg.filter((q) => q.hit).length}/${PR.tg.length}`]);
}
function prHints() {}
function prEnd() { return ['ערב יום כיפור', 'התרגיל הושלם.', [[PR.done.length, 'תרגילים']]]; }
CHAP.prologue = { stages: PR_STAGES, st: () => PR.stage, cp: () => PR.stage, upd: prUpd, obj: prObj, hints: prHints, items: prItems, restore: fieldRestore, end: prEnd, snapOK: () => false,
  mezWorld: true, mezMini: true, peace: true, night: true, tank: true, rayT: prRayT, hitT: prHitT, onBoom: prBoom, treat: prTreat, stableTag: () => 'לתאג״ד',
  tod: () => PR_TOD[PR.stage] - START_MIN + CHAP.prologue.t / (PR.stage ? 30 : 12),
  build: () => chapterBuild(CHAP.prologue, prBuild), setup: prSetup, clock: '5.10.1973 · מעוז המזח · ערב יום כיפור', toast: ['שישי, 5 באוקטובר 1973 · 16:52', 'ערב יום כיפור במעוז המזח'], start: () => fieldStart('prologue') };
