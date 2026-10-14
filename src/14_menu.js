
/* ================= menus: the title screen and the operations room =================
   Mission select: the missions in order of the days, a tactical map of the front that glides to the chosen battle and draws its arrows,
   and the briefing: when, where, which force, the story and the objectives. */
const CHM = {
  mezach: { short: 'המזח', day: 6, when: 'שבת, 6 באוקטובר 1973, 13:55', where: 'מעוז המזח, בקצה הדרומי של התעלה', who: 'לוחמי המעוז',
    vs: { e: [800, 'כ־800', 'חי״ר מצרי, קומנדו וסירות'], f: [42, '42', 'לוחמי המעוז'] }, story: 'צהרי יום הכיפורים. מטוסים מצריים מעל התעלה, הרעשה על כל הקו, ומהרציף של פורט תאופיק יוצאות סירות צליחה. המעוז צריך להחזיק.',
    obj: ['שרדו את ההרעשה בעמדות המחסה', 'אישו את המא״ג מול סירות הצליחה', 'הדפו את המצרים מתעלות המעוז', 'טפלו בפצועים והחזיקו מעמד'], pin: [574, 868], view: [400, 730, 300, 240],
    arrows: [['red', 'M470 828 C 500 836, 526 848, 548 856'], ['red', 'M478 878 C 504 874, 528 870, 548 866'], ['red', 'M492 800 C 515 816, 534 834, 550 848']] },
  rescue: { short: 'פורקן', day: 9, when: 'שלישי, 9 באוקטובר 1973, עם שחר', where: 'מעוז פורקן, מול איסמעיליה', who: 'טור טנקים וג׳יפים',
    vs: { e: [300, 'כ־300', 'חי״ר וצוותי סאגר'], f: [40, 'כ־40', 'אנשי כוח החילוץ · 33 לוחמים לאיסוף'] }, story: 'לוחמי המעוז הנצור יצאו בלילה ברגל בין העמדות המצריות. עם שחר יוצא טור קטן לאסוף אותם מהדיונות ולהחזיר אותם לקווים.',
    obj: ['פקדו על טנק בטור החילוץ', 'השמידו את צוותי הסאגר בשוחות', 'אספו את לוחמי המעוז מהדיונות', 'חזרו לקווים תחת אש'], pin: [482, 410], view: [350, 320, 330, 250],
    arrows: [['blue', 'M720 382 C 640 380, 560 394, 494 406'], ['blue', 'M494 420 C 570 432, 650 432, 720 422'], ['red', 'M412 396 C 434 400, 452 404, 468 404']] },
  armor: { short: 'קרב השריון', day: 14, when: 'ראשון, 14 באוקטובר 1973, 06:15', where: 'הרכסים מזרחית לתעלה', who: 'גדוד טנקים בעמדות',
    vs: { e: [1000, 'כ־1,000 טנקים', 'במתקפה על כל החזית'], f: [750, 'כ־750 טנקים', 'בעמדות על הרכסים'] }, story: 'אחרי שבוע של בלימה, הצבא המצרי יוצא מראשי הגשר שלו למתקפה הגדולה. מאות טנקים מסתערים מזרחה, ועמדה אחרי עמדה על הרכסים נפרצת.',
    obj: ['נהגו בטנק והחזיקו את עמדה "אבירם" נקייה מאויב', 'סעו לתגבר כל עמדה שנפרצה', 'נקו אותה מהטנקים המצריים והחזיקו עד שהשעון נגמר', 'החזיקו ארבע עמדות עד שהמתקפה נשברת'], pin: [632, 600], view: [410, 450, 400, 300],
    arrows: [['blue', 'M630 492 C 636 560, 638 650, 642 770'], ['red', 'M560 556 C 580 558, 598 562, 614 568'], ['red', 'M566 640 C 584 638, 598 632, 614 626'], ['red', 'M562 724 C 582 716, 600 708, 620 702']] },
  farm: { short: 'החווה הסינית', day: 16, when: 'שני–רביעי, 15–17 באוקטובר 1973', where: 'החווה הסינית, מזרחית לתעלה, צפונית לאגם המר', who: 'צנחנים בין הטנקים',
    vs: { e: [20000, 'כ־20,000', 'דיוויזיות 16 ו־21'], f: [3000, 'חטיבה 14', 'צנחני 890 ומהנדסי הגשר'] }, story: 'חטיבה 14 מחליקה בשקט בתפר שבין שתי הארמיות המצריות ומגיעה לתעלה בלי ירייה — ובצומת טרטור–לכסיקון נתקלת בתעלות ההשקיה של החווה, מלאות בחי״ר מצרי. באותו לילה חוצים צנחני 247 בסירות גומי. בלילה השני הולכים צנחני 890 בציר טרטור, וכשהמצרים נלחמים בהם עוברות הדוברות אל החצר שעל שפת התעלה — ושם, תחת הפגזה, נבנה הגשר לאפריקה.',
    obj: ['הגנו על הטנקים בצומת מציידי הטנקים', 'מצאו את הפצועים שלנו בבורות — בזהירות', 'חצו את התעלה בסירות, בשקט', 'שרדו את המארב בטרטור 42 והחזיקו עד אור ראשון', 'עוורו את הסאגרים בעשן והעלו את הפצועים לנגמ״שים', 'שחררו דוברות למים בין המטחים, עד שהגשר נוגע באפריקה'], pin: [500, 462], view: [350, 380, 330, 250],
    arrows: [['blue', 'M680 452 C 620 454, 560 458, 516 462'], ['red', 'M520 420 C 516 432, 510 444, 504 450'], ['blue', 'M680 500 C 600 500, 530 494, 486 482']] },
  cross: { short: 'גשר הצליחה', day: 18.5, when: 'חמישי–שישי, 18–19 באוקטובר 1973', where: 'נקודת הצליחה, צפונית לאגם המר', who: 'צנחנים בג׳יפים',
    vs: { e: [20000, 'כ־20,000', 'דיוויזיות 16 ו־21'], f: [750, 'כ־750', 'צנחני חטיבה 247 בראש הגשר'] }, story: 'גשר הגלילים — כ־200 מטר של גלילי פלדה — נקרע בדרך אל התעלה ותוקן תחת הפגזה. כדי להניח אותו, צנחני 247 חוצים בדוברות, פורצים בג׳יפים בין השדות וכובשים כפר קטן שליד נקודת הגישור. בלילה הם מחזיקים בבתים מול ההסתערות, עד שהגשר נוגע בגדה והטנקים עוברים.',
    obj: ['חצו את התעלה על הדוברות', 'פרצו את המארבים בג׳יפ', 'כבשו את הכפר, בית אחרי בית', 'החזיקו את הבתים עד שהגשר מונח', 'החזיקו עד שהטנקים מגיעים'], pin: [466, 482], view: [350, 400, 330, 250],
    arrows: [['blue', 'M660 466 C 590 472, 526 478, 484 482'], ['blue', 'M452 486 C 430 494, 406 504, 376 516'], ['blue', 'M452 496 C 440 530, 428 560, 418 592']] },
  hermon: { short: 'החרמון', day: 22, when: 'שני, 22 באוקטובר 1973, עם שחר', where: 'מוצב החרמון, ברמת הגולן', who: 'לוחמי גולני',
    vs: { e: [150, 'כ־150', 'קומנדו סורי במוצב'], f: [600, 'כ־600', 'שני גדודי גולני'] }, story: 'שבועיים אחרי שהמוצב בחרמון נפל, גולני עולים להחזיר אותו. קומנדו סורי מחכה בצדי הדרך ובמבני הרכבל, בשתי טבעות התעלות סביב המוצב, בבונקר של שמונה חדרים, ועל הגג — שם הם התבצרו.',
    obj: ['עלו בציר וחסלו את הקומנדו בצדי הדרך', 'הקיפו את המוצב בטבעת החיצונית, ואז נקו את הפנימית והחצר', 'טהרו את הבונקר חדר אחרי חדר, ואת הקומה העליונה', 'עלו במדרגות החיצוניות לגג והניפו את הדגל'], pin: [906, 752], view: [760, 108, 236, 224],
    arrows: [['blue', 'M842 884 C 860 846, 880 798, 898 762']] },
  suez: { short: 'סואץ', day: 23.5, when: 'רביעי, 24 באוקטובר 1973, בוקר', where: 'העיר סואץ', who: 'טנקים וצנחנים',
    vs: { e: [5000, 'אלפים', 'חי״ר, קומנדו ומיליציה בעיר'], f: [1000, 'כ־1,000', 'טנקים וצנחנים בטור'] }, story: 'שעות לפני הפסקת האש, הטור נכנס לעיר סואץ. ברחובות ובכיכר מחכים מארבים, והצנחנים נאחזים בבניין עם הפצועים, עד שתגיע שיירת חילוץ.',
    obj: ['פרצו עם הטנק ברחובות העיר', 'חצו את הכיכר ממחסה למחסה', 'טהרו את הבניין קומה אחרי קומה', 'הגנו על התאג״ד המאולתר עד שהשיירה מגיעה', 'חפו על השיירה וחלצו את הפצועים'], pin: [502, 836], view: [380, 740, 320, 240],
    arrows: [['blue', 'M418 524 C 440 604, 466 704, 490 834']] },
  army: { short: 'הכיתור', day: 24.5, when: 'רביעי, 24 באוקטובר 1973, 14:50', where: 'כביש סואץ–קהיר ונמל עדבייה', who: 'חטיבת שריון',
    vs: { e: [45000, '45,000', 'הארמיה השלישית · 250 טנקים'], f: [10000, 'כ־10,000', 'אוגדת אדן · ~200 טנקים'] }, story: 'הטורים מנתקים את כביש סואץ–קהיר מאחורי הארמיה השלישית ויורדים אל מפרץ סואץ. בחמש אחר הצהריים נכנסת הפסקת האש לתוקף.',
    obj: ['פרצו בטנק אל כביש סואץ–קהיר', 'עצרו את השיירה המצרית שבורחת', 'השמידו את הטנקים החפורים בנמל', 'הגיעו לחוף לפני הפסקת האש'], pin: [538, 918], view: [330, 600, 430, 370],
    arrows: [['blue', 'M416 562 C 424 662, 446 782, 478 842'], ['blue', 'M478 842 C 496 864, 516 884, 530 904']] },
};
const IMG = (k) => `img/${k}.jpg`;   // pictures from the game itself, one per mission
// and a few seconds of footage from each, rendered by the game: MP4 where the browser plays it, WebM otherwise
const VEXT = (() => { try { const v = document.createElement('video'); return v.canPlayType('video/mp4; codecs="avc1.42E01E"') ? 'mp4' : v.canPlayType('video/webm; codecs="vp9"') ? 'webm' : ''; } catch (e) { return ''; } })();
const VID = (k) => `vid/${k}.${VEXT}`;
const USE_VID = (() => { try { return !!VEXT && !(navigator.connection && navigator.connection.saveData) && !matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } })();
const PROG = { done: new Set(), last: null, sel: null, from: 'title', vb: [0, 0, 1000, 1000], anim: 0 };
try { for (const k of JSON.parse(localStorage.getItem('yk73.done') || '[]')) PROG.done.add(k); PROG.last = localStorage.getItem('yk73.last'); } catch (e) { /* private window: progress lives only in memory */ }
function markDone(m) { PROG.done.add(m); try { localStorage.setItem('yk73.done', JSON.stringify([...PROG.done])); } catch (e) {} }
function markLast(m) { PROG.last = m; try { localStorage.setItem('yk73.last', m); } catch (e) {} }
const nextChapter = () => CH_ORDER.find((k) => !PROG.done.has(k)) || PROG.last || CH_ORDER[0];
const REDUCED_M = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- the map of the front ---------- */
function opsMapSvg() {
  const sp = [120, 200, 280, 352, 404, 470, 760, 820, 862].map((y) => { const x = y < 410 ? 444 + (y - 92) * 0.03 : y < 520 ? 474 : 560; return `<rect class="m-sp" x="${x + 8}" y="${y - 4}" width="8" height="8"/>`; }).join('');
  const pins = CH_ORDER.map((k) => { const [x, y] = CHM[k].pin, n = CH_INFO[k].n; return `<g class="pin" data-k="${k}" role="button" tabindex="0" aria-label="משימה ${n}, ${CH_INFO[k].name}" transform="translate(${x} ${y})"><circle r="16"/><text y="1">${n}</text><text class="pin-d" y="31">${Math.round(CHM[k].day)}.10</text></g>`; }).join('');
  // the course of the war, always on the map: the Egyptian crossing of the 6th, and every mission's moves drawn faintly; the chosen one is drawn bright on top
  const course = CH_ORDER.map((k) => CHM[k].arrows.map(([col, d]) => `<path class="m-course ${col}" d="${d}" marker-end="url(#mHead${col === 'red' ? 'R' : 'B'})"/>`).join('')).join('');
  const egy = [[400, 150, 470, 152], [404, 250, 476, 252], [412, 340, 482, 342], [430, 470, 498, 474], [510, 760, 586, 764], [506, 820, 580, 824]].map(([x0, y0, x1, y1]) => `<path class="m-course red" d="M${x0} ${y0} L${x1} ${y1}" marker-end="url(#mHeadR)"/>`).join('');
  // the balance of forces of the whole war, bottom left: men, tanks, aircraft - red for Egypt and Syria, blue for us
  const bal = [['חיילים', 950000, 'כ־950,000', 375000, '375,000'], ['טנקים', 4000, 'כ־4,000', 2000, 'כ־2,000'], ['מטוסי קרב', 750, 'כ־750', 440, 'כ־440']].map(([n, e, es, f, fs], i) => { const y = 44 + i * 50, w = 190, x0 = 316; return `<text class="bl-n" x="${x0}" y="${y}">${n}</text><rect class="bl-red" x="${x0 - 8 - w}" y="${y + 7}" width="${w}" height="8"/><rect class="bl-blue" x="${x0 - 8 - w}" y="${y + 18}" width="${(w * f / e).toFixed(1)}" height="8"/><text class="bl-v red" x="${x0 - 12 - w}" y="${y + 14}" text-anchor="start">${es}</text><text class="bl-v blue" x="${x0 - 12 - w * f / e}" y="${y + 25}" text-anchor="start">${fs}</text>`; }).join('');
  const legend = `<g class="m-legend" transform="translate(16 790)"><rect x="0" y="0" width="334" height="196" rx="1"/><text class="bl-t" x="316" y="24">מאזן הכוחות · אוקטובר 1973</text>${bal}<text class="bl-k" x="316" y="188">אדום: מצרים וסוריה · כחול: צה״ל</text></g>`;
  const grid = `<path class="m-grid" d="${[100, 200, 300, 400, 500, 600, 700, 800, 900].map((v) => `M${v} 0 V1000 M0 ${v} H1000`).join(' ')}"/>`;
  const frame = `<rect class="m-paper" x="0" y="0" width="1000" height="1000"/><rect class="m-grain" x="0" y="0" width="1000" height="1000" filter="url(#paperF)"/>${grid}
    <g class="m-title" transform="translate(20 76)"><rect x="0" y="0" width="300" height="58" rx="1"/><text class="t1" x="288" y="24">סיני, התעלה והחרמון</text><text class="t2" x="288" y="46">מצב הכוחות ומהלך הלחימה · 6–24.10.1973</text></g>
    <g class="m-scale" transform="translate(740 952)"><rect x="0" y="0" width="121" height="6"/><rect class="w" x="121" y="0" width="121" height="6"/><text x="0" y="22">0</text><text x="121" y="22">25</text><text x="242" y="22">50 ק״מ</text></g>
    <g class="m-north" transform="translate(956 600)"><path d="M0 -26 L9 8 L0 0 L-9 8 Z"/><text y="26">צ</text></g>`;
  return `<defs><filter id="paperF" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="4" result="g"/><feTurbulence type="fractalNoise" baseFrequency="0.009" numOctaves="3" seed="9" result="s"/><feBlend in="g" in2="s" mode="multiply" result="b"/><feColorMatrix in="b" type="matrix" values="0 0 0 0 0.42  0 0 0 0 0.33  0 0 0 0 0.16  0 0 0 0.6 0"/></filter><filter id="greaseF" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="7"/><feDisplacementMap in="SourceGraphic" scale="5"/></filter>
    <pattern id="hatchR" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><line x1="0" y1="0" x2="0" y2="9" stroke="#b3362b" stroke-width="2.4" opacity=".55"/></pattern>
    <marker id="mHeadR" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="3.2" markerHeight="3.2" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill="var(--mred)"/></marker><marker id="mHeadB" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="3.2" markerHeight="3.2" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill="var(--mblu)"/></marker></defs>
  ${frame}
  <path class="m-sea" d="M0 0 H1000 V66 C 880 92, 720 70, 580 90 C 510 99, 460 98, 410 88 C 300 72, 170 96, 0 78 Z"/>
  <text class="m-lbl m-sealbl" x="660" y="40">הים התיכון</text>
  <text class="m-lbl m-reg" x="200" y="560">מצרים</text><text class="m-lbl m-reg" x="830" y="560">סיני</text>
  <path class="m-road" d="M524 856 C 430 842, 300 820, 70 780"/><text class="m-lbl m-sm" x="64" y="768" text-anchor="start">לקהיר</text>
  <path class="m-ridge" d="M626 486 C 634 556, 636 650, 640 770"/><text class="m-lbl m-sm" x="660" y="470" text-anchor="start">הרכסים</text>
  <path class="m-canal" d="M430 90 L 436 180 L 442 262 L 448 344 L 454 406 M 462 432 L 468 492 M 548 712 L 552 790 L 546 850 L 538 866"/>
  <ellipse class="m-water" cx="458" cy="419" rx="20" ry="12"/>
  <ellipse class="m-water" cx="512" cy="580" rx="38" ry="74" transform="rotate(-14 512 580)"/>
  <ellipse class="m-water" cx="541" cy="684" rx="13" ry="28" transform="rotate(-10 541 684)"/>
  <path class="m-water" d="M522 872 Q 548 858 576 872 L 700 1000 L 560 1000 Q 546 932 522 872 Z"/>
  <text class="m-lbl m-sm" x="422" y="386" text-anchor="end">איסמעיליה</text><text class="m-lbl m-sm" x="420" y="100" text-anchor="end">פורט סעיד</text>
  <text class="m-lbl m-sm" x="562" y="596" text-anchor="end">האגם המר</text><text class="m-lbl m-sm" x="496" y="846" text-anchor="end">סואץ</text>
  <text class="m-lbl m-sm" x="512" y="944" text-anchor="end">עדבייה</text><text class="m-lbl m-sm" x="626" y="952">מפרץ סואץ</text>
  <text class="m-lbl m-canlbl" x="420" y="300" transform="rotate(-86 420 300)">תעלת סואץ</text>
  <g>${sp}</g><text class="m-lbl m-sm m-blue" x="470" y="260" text-anchor="start">קו המעוזים</text>
  <g class="m-inset"><rect x="770" y="700" width="214" height="204" rx="2"/><path class="m-golan" d="M790 884 C 810 834, 840 794, 880 760 L 912 734 L 960 756 C 962 804, 950 854, 940 896 Z"/><ellipse class="m-water" cx="828" cy="876" rx="12" ry="18"/>
    <path class="m-peak" d="M890 766 L 906 734 L 922 766 Z"/><text class="m-lbl m-sm" x="964" y="726" text-anchor="start">החזית הצפונית</text><text class="m-lbl m-sm" x="934" y="782" text-anchor="end">החרמון</text><text class="m-lbl m-xs" x="846" y="902" text-anchor="end">הכנרת</text></g>
  <path class="m-border" d="M700 84 L 1000 660"/><text class="m-lbl m-reg" x="900" y="150">ישראל</text><text class="m-lbl m-sm" x="930" y="186">הנגב</text>
  <g class="m-res">${[[996, 250, 'M996 250 C 910 300, 840 330, 770 352'], [996, 320, 'M996 320 C 905 372, 830 412, 752 446'], [996, 390, 'M996 390 C 920 448, 850 500, 768 548']].map(([x, y, d]) => `<path d="${d}" marker-end="url(#mHeadB)"/>`).join('')}</g>
  <text class="m-lbl m-sm m-blue" x="990" y="228" text-anchor="start">המילואים מגיעים מהנגב · 6–8.10</text>
  <g class="m-courseG">${egy}${course}</g>
  <text class="m-lbl m-sm m-red" x="330" y="236">6.10 · הצליחה המצרית</text><text class="m-lbl m-sm m-red" x="560" y="540" text-anchor="start">14.10 · המתקפה הגדולה</text>
  <text class="m-lbl m-sm m-blue" x="684" y="452" text-anchor="start">15–17.10 · צליחת צה״ל</text><text class="m-lbl m-sm m-blue" x="372" y="700" text-anchor="end">18–24.10 · הכיתור</text><text class="m-lbl m-xs m-blue" x="852" y="886" text-anchor="start">22.10</text>
  ${legend}
  <g class="m-arrows" filter="url(#greaseF)"></g>
  <g class="m-pins">${pins}</g>`;
}
function opsList() {
  $('#opsList').innerHTML = CH_ORDER.map((k) => { const c = CHM[k], d = Math.round(c.day); return `<button type="button" class="m-item" role="option" data-k="${k}" aria-label="משימה ${CH_INFO[k].n}, ${CH_INFO[k].name}, ${d} באוקטובר"><span class="m-img pic"><img src="${IMG(k)}" alt="" loading="lazy" decoding="async"><span class="m-n">${CH_INFO[k].n}</span></span><span class="m-t"><b>${CH_INFO[k].name}</b><small>${d}.10 · ${c.where}</small><span class="m-s"></span></span></button>`; }).join('');
}
/* ---------- the battle maps: one schematic per mission, the stages numbered in the order they are fought ----------
   drawn in a 640 × 360 box, north up unless the caption says otherwise; red is the enemy, blue is us, the amber discs are the stages */
const MM = {
  badge: (x, y, n, label, side = 1, dy = 0) => `<g class="mm-badge"><circle cx="${x}" cy="${y}" r="12.5"/><text x="${x}" y="${y + 1}">${n}</text></g>${label ? `<text class="mm-lbl" x="${x + side * 17}" y="${y + 5 + dy}" text-anchor="${side > 0 ? 'end' : 'start'}">${label}</text>` : ''}`,   // rtl: 'end' is the left edge of the text
  arr: (col, d, w = 4) => `<path class="mm-arr ${col}" d="${d}" style="stroke-width:${w}" marker-end="url(#mmh-${col})"/>`,
  dash: (col, d) => `<path class="mm-arr mm-dash ${col}" d="${d}" marker-end="url(#mmh-${col})"/>`,
  x: (x, y, s = 6) => `<path class="mm-x" d="M${x - s} ${y - s} L${x + s} ${y + s} M${x + s} ${y - s} L${x - s} ${y + s}"/>`,
  lbl: (x, y, t, cls = '', anchor = 'middle') => `<text class="mm-t ${cls}" x="${x}" y="${y}" text-anchor="${anchor}">${t}</text>`,
  tank: (x, y, col, r = 0) => `<g class="mm-tank ${col}" transform="translate(${x} ${y}) rotate(${r})"><rect x="-9" y="-6" width="18" height="12" rx="2"/><rect x="-4" y="-3" width="9" height="6"/><path d="M4 0 H16"/></g>`,
  man: (x, y, col) => `<g class="mm-man ${col}"><circle cx="${x}" cy="${y - 5}" r="2.6"/><path d="M${x} ${y - 2} V${y + 5} M${x - 3.5} ${y} H${x + 3.5}"/></g>`,
  boat: (x, y, r = 0) => `<path class="mm-boat" transform="translate(${x} ${y}) rotate(${r})" d="M-11 -4 H9 L13 0 L9 4 H-11 Z"/>`,
  jet: (x, y, r = 0) => `<path class="mm-jet" transform="translate(${x} ${y}) rotate(${r})" d="M-10 0 L10 0 M0 -7 L4 0 L0 7 M-7 -4 L-4 0 L-7 4"/>`,
  defs: `<defs><filter id="mmGrain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="5" result="g"/><feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="3" seed="11" result="s"/><feBlend in="g" in2="s" mode="multiply" result="b"/><feColorMatrix in="b" type="matrix" values="0 0 0 0 0.42  0 0 0 0 0.33  0 0 0 0 0.16  0 0 0 0.55 0"/></filter><marker id="mmh-red" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill="var(--mred)"/></marker><marker id="mmh-blue" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill="var(--mblu)"/></marker>
    <pattern id="mmHatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(40)"><line x1="0" y1="0" x2="0" y2="8" stroke="#b4352a" stroke-width="2" opacity=".55"/></pattern>
    <pattern id="mmHatchB" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(-40)"><line x1="0" y1="0" x2="0" y2="8" stroke="#2f5f9c" stroke-width="2" opacity=".5"/></pattern></defs>`,
  // the balance of forces, top left: the enemy's strength in red, ours in blue, a bar under each on one scale
  vs: (v) => { if (!v) return ''; const mx = Math.max(v.e[0], v.f[0]); const cell = (x, col, d) => `<text class="mm-vsn ${col}" x="${x}" y="30" text-anchor="middle">${d[1]}</text><text class="mm-vsl" x="${x}" y="44" text-anchor="middle">${d[2]}</text><rect class="mm-vsb ${col}" x="${x - 46}" y="49" width="${Math.max(6, 92 * d[0] / mx).toFixed(1)}" height="4"/>`;
    return `<g class="mm-vs"><rect x="6" y="6" width="214" height="54" rx="1"/><line x1="113" y1="12" x2="113" y2="54"/><text class="mm-vst" x="113" y="17" text-anchor="middle">מאזן הכוחות</text>${cell(164, 'red', v.e)}${cell(62, 'blue', v.f)}</g>`; },
  // a unit box the way the period maps drew them: a rectangle, an X for infantry, an oval for armour, the size marks above it
  unit: (x, y, col, kind = 'inf', size = '', label = '', side = 1) => `<g class="mm-unit ${col}" transform="translate(${x} ${y})"><rect x="-13" y="-8" width="26" height="16"/>${kind === 'arm' ? '<ellipse cx="0" cy="0" rx="9" ry="4.5"/>' : '<path d="M-13 -8 L13 8 M13 -8 L-13 8"/>'}${size ? `<text class="sz" y="-11">${size}</text>` : ''}</g>${label ? `<text class="mm-t mm-sm ${col === 'red' ? 'mm-red' : 'mm-blue'}" x="${x + side * 17}" y="${y + 4}" text-anchor="${side > 0 ? 'end' : 'start'}">${label}</text>` : ''}`,
  front: (col, d) => `<path class="mm-front ${col}" d="${d}"/>`,
  contour: (d) => `<path class="mm-cont" d="${d}"/>`,
  // the stage list, a column of numbered rows at the left of a map
  list: (x, y, rows) => `<g class="mm-list"><rect x="${x}" y="${y}" width="178" height="${rows.length * 22 + 12}" rx="1"/>${rows.map((t, i) => `<circle cx="${x + 166}" cy="${y + 17 + i * 22}" r="8"/><text class="n" x="${x + 166}" y="${y + 18 + i * 22}">${i + 1}</text><text class="t" x="${x + 152}" y="${y + 21 + i * 22}">${t}</text>`).join('')}</g>`,
  frame: (title, body, note, v) => `${MM.defs}<rect class="mm-land" x="0" y="0" width="640" height="360"/><rect class="mm-grain" x="0" y="0" width="640" height="360" filter="url(#mmGrain)"/>${body}<text class="mm-title" x="632" y="24" text-anchor="start">${title}</text>${note ? `<text class="mm-note" x="632" y="42" text-anchor="start">${note}</text>` : ''}${MM.vs(v)}<g class="mm-north" transform="translate(16 338)"><path d="M0 -12 L5 4 L0 0 L-5 4 Z"/><text y="16">צ</text></g>`,
};
/* arrow weight by the size of the force it stands for: a division is a fat grease-pencil stroke, a platoon a thin line */
const MMW = (n) => (n >= 10000 ? 11 : n >= 2000 ? 9 : n >= 600 ? 7 : n >= 200 ? 5.5 : n >= 60 ? 4 : 3);
const MICRO = {
  mezach: () => MM.frame('מעוז המזח · 6.10 · 13:55', `
    <rect class="mm-water" x="150" y="0" width="22" height="360"/><text class="mm-t mm-wt" x="161" y="200" transform="rotate(-90 161 200)">תעלת סואץ</text>
    <path class="mm-hatch" d="M172 28 L292 50 L306 180 L298 332 L172 340 Z"/>${MM.front('red', 'M292 44 C 300 110, 306 200, 298 336')}
    ${[52, 102, 152, 202, 252].map((y) => `<rect class="mm-post" x="173" y="${y - 5}" width="10" height="10"/>${MM.x(178, y, 7)}`).join('')}
    <rect class="mm-post mm-big" x="170" y="318" width="16" height="16"/>
    ${[40, 136, 236].map((y) => MM.arr('red', `M118 ${y} C 150 ${y}, 170 ${y + 2}, 196 ${y + 4}`, MMW(1500))).join('')}
    ${MM.arr('red', 'M110 92 C 170 94, 250 104, 286 112', MMW(15000))}${MM.arr('red', 'M110 192 C 170 194, 262 198, 290 200', MMW(15000))}${MM.arr('red', 'M110 290 C 170 296, 262 304, 288 306', MMW(15000))}
    ${MM.unit(76, 130, 'red', 'inf', 'XX')}${MM.unit(76, 258, 'red', 'inf', 'XX')}
    ${MM.unit(364, 136, 'blue', 'arm', 'X')}${MM.arr('blue', 'M346 136 L 318 136', MMW(300))}${MM.dash('blue', 'M320 150 L 350 158')}
    ${MM.unit(364, 268, 'blue', 'arm', 'X')}${MM.arr('blue', 'M346 268 L 320 268', MMW(300))}${MM.dash('blue', 'M322 282 L 350 290')}
    <rect class="mm-bldg" x="96" y="330" width="46" height="22"/>
    <line class="mm-div" x1="396" y1="64" x2="396" y2="352"/>
    <g transform="translate(402 62)">
      <rect class="mm-water" x="0" y="0" width="30" height="294"/><rect class="mm-water" x="216" y="0" width="22" height="294"/>
      <path class="mm-trench" d="M72 40 L130 26 L188 40 L200 110 L188 180 L130 194 L72 180 L60 110 Z"/><path class="mm-trench2" d="M82 50 L130 38 L178 50 L188 110 L178 170 L130 182 L82 170 L72 110 Z"/>
      <rect class="mm-bldg" x="112" y="76" width="22" height="12"/><rect class="mm-bldg" x="146" y="128" width="20" height="11"/><text class="mm-aid" x="104" y="124" text-anchor="middle">✚</text>
      <rect class="mm-post" x="62" y="86" width="8" height="8"/><rect class="mm-post" x="62" y="124" width="8" height="8"/><rect class="mm-post" x="126" y="30" width="8" height="8"/><rect class="mm-post" x="126" y="186" width="8" height="8"/>
      ${MM.boat(14, 84)}${MM.boat(10, 112)}${MM.boat(16, 140)}
      ${MM.arr('red', 'M30 84 C 44 86, 52 88, 58 90', MMW(80))}${MM.arr('red', 'M26 112 C 40 114, 50 118, 58 124', MMW(80))}${MM.arr('red', 'M32 140 C 44 136, 52 132, 58 130', MMW(80))}
      ${MM.arr('red', 'M130 4 L 130 24', MMW(120))}${MM.arr('red', 'M30 230 C 70 222, 100 206, 124 194', MMW(120))}
      ${MM.badge(170, 70, 1)}${MM.badge(70, 108, 2)}${MM.badge(150, 40, 3)}${MM.badge(106, 150, 4)}
    </g>`, '', CHM.mezach.vs),
  rescue: () => MM.frame('חילוץ פורקן · 9.10', `
    <rect class="mm-water" x="0" y="0" width="26" height="360"/>
    ${['M200 80 C 260 60, 320 96, 380 72 S 500 56, 556 76', 'M196 130 C 250 112, 316 146, 376 124 S 500 108, 558 130', 'M200 236 C 262 218, 330 250, 392 226 S 500 212, 558 236', 'M204 290 C 262 270, 330 304, 392 282 S 500 266, 560 290', 'M210 334 C 266 316, 330 346, 392 326 S 500 312, 560 334'].map((d) => MM.contour(d)).join('')}
    <path class="mm-hatch" d="M26 0 H 190 L 198 360 H 26 Z"/>${MM.front('red', 'M190 0 C 186 120, 200 240, 196 360')}
    ${MM.unit(118, 90, 'red', 'inf', 'XX')}${MM.unit(118, 300, 'red', 'inf', 'X')}
    <rect class="mm-trench" x="42" y="152" width="30" height="30"/>
    <rect class="mm-hatchB" x="568" y="0" width="72" height="360"/>
    <path class="mm-road" d="M566 180 C 480 178, 400 184, 320 182 S 160 176, 80 180"/>
    ${[[250, 150], [300, 214], [360, 146], [420, 216], [470, 152]].map(([x, y]) => `<path class="mm-tri" d="M${x} ${y - 7} L${x + 6} ${y + 4} L${x - 6} ${y + 4} Z"/>${MM.arr('red', `M${x} ${y + 6} L ${x + (y < 180 ? 4 : -4)} ${y < 180 ? 170 : 192}`, 2.6)}`).join('')}
    ${MM.unit(606, 160, 'blue', 'arm')}
    ${MM.dash('blue', 'M72 170 C 100 200, 130 226, 164 244')}<circle class="mm-rv" cx="176" cy="250" r="9"/>
    ${MM.arr('blue', 'M566 168 C 480 164, 400 170, 320 168 S 220 170, 206 176', MMW(40))}${MM.arr('blue', 'M206 184 C 200 206, 194 226, 190 242', MMW(40))}
    ${MM.dash('blue', 'M196 262 C 300 262, 420 256, 560 250')}${MM.arr('blue', 'M470 254 L 556 250', MMW(70))}
    ${MM.badge(528, 136, 1)}${MM.badge(400, 104, 2)}${MM.badge(206, 282, 3)}${MM.badge(470, 290, 4)}`, '', CHM.rescue.vs),
  armor: () => MM.frame('קרב השריון · 14.10 · 06:15', `
    <rect class="mm-water" x="0" y="0" width="40" height="360"/>
    <rect class="mm-hatch" x="40" y="0" width="150" height="360"/>
    <path class="mm-ridge" d="M452 20 C 440 100, 446 200, 440 340"/>
    ${[[448, 70], [444, 150], [446, 230], [442, 310]].map(([x, y]) => `<rect class="mm-post" x="${x - 9}" y="${y - 9}" width="18" height="18"/>`).join('')}
    ${MM.arr('red', 'M196 76 C 280 70, 360 68, 426 70', MMW(3000))}${MM.arr('red', 'M196 156 C 280 150, 360 150, 422 152', MMW(3000))}${MM.arr('red', 'M196 236 C 280 232, 360 232, 424 232', MMW(3000))}${MM.arr('red', 'M196 316 C 280 312, 360 312, 420 312', MMW(3000))}
    ${MM.tank(230, 60, 'red')}${MM.tank(270, 88, 'red')}${MM.tank(240, 140, 'red')}${MM.tank(260, 250, 'red')}${MM.tank(236, 300, 'red')}${MM.tank(280, 328, 'red')}
    ${MM.tank(500, 70, 'blue', 180)}
    ${MM.dash('blue', 'M500 86 C 504 120, 500 130, 498 136')}${MM.dash('blue', 'M498 166 C 502 200, 500 210, 498 216')}${MM.dash('blue', 'M498 246 C 502 280, 500 290, 498 296')}
    ${MM.badge(545, 70, 1)}${MM.badge(545, 150, 2)}${MM.badge(545, 230, 3)}${MM.badge(545, 310, 4)}`, '', CHM.armor.vs),
  farm: () => MM.frame('החווה הסינית · 15–17.10', `${fmMapBase(true, false)}
    ${MM.arr('red', 'M300 124 C 290 136, 270 146, 222 150', MMW(2000))}${MM.arr('red', 'M380 124 C 382 132, 382 138, 382 142', MMW(600))}
    ${MM.arr('blue', 'M206 300 C 206 250, 206 200, 206 162', MMW(1500))}${MM.arr('blue', 'M630 146 C 540 147, 460 148, 396 149', MMW(600))}${MM.arr('blue', 'M630 278 C 450 282, 300 290, 214 294 C 210 270, 208 248, 206 236', MMW(300))}
    ${MM.arr('blue', 'M186 204 L 140 204', MMW(750))}${MM.arr('blue', 'M184 222 L 136 222', MMW(1500))}
    ${MM.badge(236, 132, 1)}${MM.badge(254, 168, 2)}${MM.badge(118, 196, 3)}${MM.badge(400, 128, 4)}${MM.badge(420, 168, 5)}${MM.badge(226, 204, 6)}`, '', CHM.farm.vs),
  // the bridgehead on the west bank, growing: from a toe-hold round the pontoon bridge on the 16th to several kilometres by the 19th
  cross: () => MM.frame('גשר הצליחה · 16–19.10', `
    ${[[60, 120, 120, 46], [40, 196, 120, 44], [70, 268, 110, 40], [150, 96, 70, 40]].map(([x, y, w, h]) => `<rect class="mm-field" x="${x}" y="${y - h / 2}" width="${w}" height="${h}"/>`).join('')}
    <path class="mm-water" d="M244 0 V 312" style="fill:none;stroke-width:3"/>
    <rect class="mm-water" x="300" y="0" width="44" height="316"/><path class="mm-water" d="M0 318 C 140 306, 260 322, 344 316 C 440 312, 540 324, 640 320 L 640 360 L 0 360 Z"/>
    <text class="mm-t mm-wt" x="322" y="120" transform="rotate(-90 322 120)">תעלת סואץ</text><text class="mm-t mm-wt" x="470" y="344">האגם המר הגדול</text>
    <path class="mm-hatchB" d="M300 250 C 284 252, 270 266, 270 286 C 270 300, 284 308, 300 308 C 300 296, 300 262, 300 250 Z"><animate attributeName="d" dur="12s" repeatCount="indefinite" values="M300 250 C 284 252, 270 266, 270 286 C 270 300, 284 308, 300 308 C 300 296, 300 262, 300 250 Z;M300 250 C 284 252, 270 266, 270 286 C 270 300, 284 308, 300 308 C 300 296, 300 262, 300 250 Z;M300 176 C 262 180, 236 220, 234 256 C 232 292, 262 310, 300 310 C 300 280, 300 210, 300 176 Z;M300 176 C 262 180, 236 220, 234 256 C 232 292, 262 310, 300 310 C 300 280, 300 210, 300 176 Z;M300 66 C 210 74, 120 150, 112 230 C 106 290, 200 310, 300 312 C 300 260, 300 120, 300 66 Z;M300 66 C 210 74, 120 150, 112 230 C 106 290, 200 310, 300 312 C 300 260, 300 120, 300 66 Z;M300 250 C 284 252, 270 266, 270 286 C 270 300, 284 308, 300 308 C 300 296, 300 262, 300 250 Z" keyTimes="0;0.1;0.3;0.42;0.66;0.92;1"/></path>
    <text class="mm-t mm-blue" x="252" y="282" opacity="1">16.10<animate attributeName="opacity" dur="12s" repeatCount="indefinite" values="1;1;0;0;0;0;1" keyTimes="0;0.1;0.3;0.42;0.66;0.92;1"/></text><text class="mm-t mm-blue" x="214" y="244" opacity="0">18.10<animate attributeName="opacity" dur="12s" repeatCount="indefinite" values="0;0;1;1;0;0;0" keyTimes="0;0.1;0.3;0.42;0.66;0.92;1"/></text><text class="mm-t mm-blue" x="150" y="186" opacity="0">19.10 · כמה קילומטרים<animate attributeName="opacity" dur="12s" repeatCount="indefinite" values="0;0;0;0;1;1;0" keyTimes="0;0.1;0.3;0.42;0.66;0.92;1"/></text>
    ${[[262, 200], [276, 198], [262, 218], [276, 222], [288, 210], [268, 186]].map(([x, y]) => `<rect class="mm-bldg" x="${x - 4}" y="${y - 3}" width="8" height="6"/>`).join('')}<text class="mm-t mm-sm" x="262" y="240">הכפר</text>
    <path class="mm-bridge" d="M298 286 L 346 286"/><text class="mm-t mm-sm" x="400" y="290">גשר הדוברות</text>
    <path class="mm-bridge" d="M298 208 L 346 208" style="stroke-width:7"/><text class="mm-t mm-sm" x="404" y="200">גשר הגלילים</text>
    <path class="mm-dim" d="M370 214 V 280" style="stroke:var(--ink2);stroke-width:1.2;stroke-dasharray:3 3"/><text class="mm-t mm-sm" x="384" y="252" text-anchor="start">כ־1 ק״מ</text>
    ${MM.boat(330, 168, 180)}${MM.arr('blue', 'M372 168 L 308 168', MMW(250))}
    ${MM.dash('blue', 'M296 168 C 270 160, 258 166, 262 178 C 266 186, 270 190, 272 194')}
    ${MM.arr('red', 'M150 206 C 190 206, 222 208, 250 208', MMW(600))}${MM.arr('red', 'M160 232 C 196 228, 226 222, 252 216', MMW(300))}
    ${MM.arr('blue', 'M430 208 L 352 208', MMW(1500))}${MM.tank(452, 208, 'blue', 180)}${MM.tank(480, 208, 'blue', 180)}${MM.tank(508, 208, 'blue', 180)}
    <path d="M40 342 H 116" style="stroke:var(--ink);stroke-width:2"/><path d="M40 337 V 347 M116 337 V 347" style="stroke:var(--ink);stroke-width:1.5"/><text class="mm-t mm-sm" x="78" y="334">1 ק״מ</text>
    ${MM.badge(392, 168, 1)}${MM.badge(238, 156, 2)}${MM.badge(286, 236, 3)}${MM.badge(226, 192, 4)}${MM.badge(392, 226, 5)}`, '', CHM.cross.vs),
  hermon: () => MM.frame('מוצב החרמון · 22.10', `
    ${[[300, 60], [360, 82], [420, 104], [480, 126], [540, 148]].map(([rx, ry], i) => `<ellipse class="mm-cont" cx="320" cy="${118 + i * 10}" rx="${rx / 2}" ry="${ry / 2}"/>`).join('')}
    <path class="mm-road" d="M300 356 L 350 318 L 280 284 L 340 250 L 300 216 L 322 196"/>
    ${MM.x(268, 304)}${MM.x(356, 266)}${MM.x(272, 234)}${MM.x(350, 206)}
    <rect class="mm-bldg" x="408" y="228" width="26" height="16"/><path class="mm-cable" d="M421 228 C 400 190, 370 150, 352 128"/>
    <path class="mm-fence" d="M166 190 L 184 60 L 456 60 L 474 190 Z"/>
    <ellipse class="mm-trench" cx="320" cy="124" rx="134" ry="56"/><ellipse class="mm-trench" cx="320" cy="124" rx="88" ry="34"/>
    <path class="mm-trench2" d="M320 180 V 158 M 320 90 V 68 M 232 124 H 186 M 408 124 H 454"/>
    <rect class="mm-bunker" x="286" y="108" width="68" height="32"/><rect class="mm-bldg" x="296" y="112" width="48" height="11"/><text class="mm-flag" x="298" y="106">⚑</text>
    ${[[244, 150], [396, 100], [196, 118], [446, 132], [356, 86], [282, 164], [250, 100], [392, 150]].map(([x, y]) => MM.x(x, y, 4)).join('')}
    ${MM.arr('blue', 'M304 352 L 346 320', MMW(600))}${MM.arr('blue', 'M344 314 L 286 286', MMW(600))}${MM.arr('blue', 'M286 280 L 336 252', MMW(600))}${MM.arr('blue', 'M336 246 L 304 216 L 320 198', MMW(600))}
    ${MM.arr('blue', 'M318 190 C 220 192, 160 150, 182 112 C 200 78, 268 58, 320 58 C 384 58, 450 80, 466 120 C 478 154, 420 190, 342 190', 5.5)}
    ${MM.arr('blue', 'M322 184 C 322 176, 322 172, 322 166', 5)}${MM.arr('blue', 'M316 162 C 240 162, 218 136, 232 112 C 246 94, 296 86, 322 86 C 362 86, 406 98, 416 122 C 424 144, 386 164, 340 164', 5)}
    ${MM.arr('blue', 'M322 162 L 322 144', 5)}${MM.arr('blue', 'M300 136 C 292 128, 290 120, 296 112', 4)}
    ${MM.badge(306, 300, 1)}${MM.badge(466, 160, 2)}${MM.badge(424, 112, 3)}${MM.badge(346, 128, 4)}${MM.badge(328, 110, 5)}${MM.badge(298, 96, 6)}`, '', CHM.hermon.vs),
  suez: () => MM.frame('העיר סואץ · 24.10', `
    <path class="mm-water" d="M0 326 C 160 316, 400 334, 640 322 L 640 360 L 0 360 Z"/>
    ${[[26, 70, 92, 46], [26, 128, 92, 38], [26, 180, 92, 54], [26, 246, 92, 62], [134, 70, 64, 46], [134, 128, 64, 38], [134, 246, 64, 62], [214, 70, 62, 46], [214, 128, 62, 38], [374, 70, 70, 46], [374, 128, 70, 38], [460, 70, 76, 46], [460, 128, 76, 38], [460, 180, 76, 54], [460, 246, 76, 62], [552, 70, 72, 46], [552, 128, 72, 38], [552, 180, 72, 54], [552, 246, 72, 62], [374, 246, 70, 62]].map(([x, y, w, h]) => `<rect class="mm-block" x="${x}" y="${y}" width="${w}" height="${h}"/>`).join('')}
    <path class="mm-street" d="M300 0 V 170 M 0 228 H 640 M 0 116 H 640 M 120 50 V 320 M 450 50 V 320"/>
    <rect class="mm-sq" x="214" y="176" width="230" height="46"/>
    <rect class="mm-bunker" x="214" y="246" width="60" height="62"/><text class="mm-aid" x="244" y="283" text-anchor="middle">✚</text>
    ${[[214, 182], [214, 216], [444, 182], [444, 216], [250, 176], [400, 176], [300, 222], [380, 222]].map(([x, y]) => `<path class="mm-tri" d="M${x} ${y - 6} L${x + 5} ${y + 4} L${x - 5} ${y + 4} Z"/>`).join('')}
    ${MM.arr('red', 'M250 160 L 262 176', 3)}${MM.arr('red', 'M404 160 L 392 176', 3)}${MM.arr('red', 'M170 200 L 206 200', 3)}${MM.arr('red', 'M484 200 L 452 200', 3)}${MM.arr('red', 'M200 290 L 212 282', 3)}${MM.arr('red', 'M330 270 L 280 268', 3)}
    ${MM.unit(300, 22, 'blue', 'arm', 'X')}${MM.arr('blue', 'M300 40 L 300 172', MMW(1000))}
    ${MM.dash('blue', 'M300 182 C 286 200, 270 220, 256 242')}
    ${MM.unit(118, 22, 'blue', 'arm')}${MM.dash('blue', 'M118 40 L 118 226')}${MM.arr('blue', 'M118 226 L 118 262 L 206 262', MMW(400))}
    ${MM.badge(326, 86, 1)}${MM.badge(330, 198, 2)}${MM.badge(204, 240, 3)}${MM.badge(156, 288, 4)}`, '', CHM.suez.vs),
  army: () => MM.frame('כיתור הארמיה השלישית · 24.10', `
    <path class="mm-water" d="M470 246 L 640 228 L 640 360 L 426 360 Z"/>
    ${[[534, 150, 40, 30], [580, 150, 44, 30], [534, 188, 40, 32], [580, 188, 44, 32]].map(([x, y, w, h]) => `<rect class="mm-block" x="${x}" y="${y}" width="${w}" height="${h}"/>`).join('')}
    <rect class="mm-bldg" x="456" y="266" width="50" height="26"/>
    <path class="mm-road" d="M0 198 H 530"/><path class="mm-road" d="M500 198 C 490 222, 486 246, 482 266"/>
    <ellipse class="mm-pocket" cx="360" cy="96" rx="170" ry="54"/>${MM.unit(300, 96, 'red', 'inf', 'XX')}${MM.unit(420, 96, 'red', 'inf', 'XX')}
    ${[280, 316, 352, 388].map((x) => `<rect class="mm-truck" x="${x - 10}" y="190" width="20" height="14"/>`).join('')}${MM.arr('red', 'M266 197 L 220 197', MMW(500))}
    ${[[468, 278], [490, 284], [500, 272]].map(([x, y]) => `<path class="mm-tri" d="M${x} ${y - 7} L${x + 7} ${y + 5} L${x - 7} ${y + 5} Z"/>`).join('')}
    ${MM.unit(606, 60, 'blue', 'arm', 'XX')}
    ${MM.arr('blue', 'M590 76 C 560 110, 540 150, 516 182', MMW(10000))}${MM.arr('blue', 'M506 206 C 440 212, 380 216, 330 218', MMW(10000))}${MM.front('blue', 'M332 186 L 326 214')}
    ${MM.arr('blue', 'M510 214 C 500 232, 492 248, 484 262', MMW(3000))}${MM.arr('blue', 'M460 300 C 440 318, 420 332, 400 346', MMW(3000))}
    <text class="mm-clock" x="70" y="316">⏱ 17:00</text>
    ${MM.badge(560, 118, 1)}${MM.badge(330, 246, 2)}${MM.badge(430, 254, 3)}${MM.badge(384, 322, 4)}`, '', CHM.army.vs),
};
function opsMicro(k) { const svg = $('#microMap'); if (!svg || !MICRO[k]) return; svg.innerHTML = MICRO[k](); svg.setAttribute('aria-label', `מפת הקרב: ${CH_INFO[k].name}`); }
/* the course of the war along the top of the map: the eight missions as a strip of days */
const PHASE = { mezach: 'בלימה', rescue: 'חילוץ', armor: 'שבירת המתקפה', farm: 'החווה', cross: 'גשר הצליחה', hermon: 'החרמון', suez: 'סואץ', army: 'כיתור' };
function opsLine() { $('#opsLine').innerHTML = CH_ORDER.map((k) => `<button type="button" class="tl" data-k="${k}" aria-label="משימה ${CH_INFO[k].n}: ${CH_INFO[k].name}"><img src="${IMG(k)}" alt="" decoding="async"><b>${CH_INFO[k].n}</b><span><em>${Math.round(CHM[k].day)}.10</em>${PHASE[k]}</span></button>`).join('<i class="tl-sep"></i>'); }
/* the footage of the chosen mission: the hero's picture, then the clip over it once it plays; the same clip opens large on request */
const PHONE_MQ = window.matchMedia ? window.matchMedia('(max-width: 600px) and (orientation: portrait), (max-height: 540px) and (orientation: landscape)') : { matches: false, addEventListener() {} };
function opsHero(k) {
  const img = $('#dImg'), v = $('#dVid'); img.src = IMG(k); $('#hNum').textContent = CH_INFO[k].n; $('#hName').textContent = CH_INFO[k].name; $('#hDate').textContent = `${Math.round(CHM[k].day)} באוקטובר 1973`;
  v.classList.remove('on'); v.pause(); v.removeAttribute('src'); v.dataset.src = VID(k); try { v.load(); } catch (e) {}
  if (USE_VID && !$('#mOps').hidden) playVid(v);
}
/* on a phone the hero sits above the tabs; on a desktop it lies behind the briefing text */
function opsLayout() {
  const hero = $('#bHero'); if (!hero) return; const phone = PHONE_MQ.matches, want = phone ? $('.m-detail') : $('.b-text');
  if (hero.parentNode === want) return;
  if (phone) want.insertBefore(hero, $('.b-tabs')); else want.insertBefore(hero, want.firstChild);
  if (PROG.sel && !$('#mOps').hidden) opsHero(PROG.sel);
}
function opsTab(t) { if (t === 'front' && !PHONE_MQ.matches) t = 'brief'; $('#mOps').dataset.tab = t; for (const b of document.querySelectorAll('.b-tabs button')) { const on = b.dataset.tab === t; b.classList.toggle('on', on); b.setAttribute('aria-selected', on ? 'true' : 'false'); } }
function vidOpen() {
  const k = PROG.sel; if (!k || !VEXT) return; const m = $('#vidModal'), v = $('#dVidBig'); m.hidden = false; $('#vmTitle').textContent = `משימה ${CH_INFO[k].n} · ${CH_INFO[k].name}`;
  v.src = VID(k); v.muted = false; v.currentTime = 0; const p = v.play(); if (p && p.catch) p.catch(() => { v.muted = true; v.play().catch(() => {}); }); $('#dVid').pause();
}
function vidClose() { const m = $('#vidModal'), v = $('#dVidBig'); if (m.hidden) return; m.hidden = true; v.pause(); v.removeAttribute('src'); try { v.load(); } catch (e) {} if (USE_VID && !$('#mOps').hidden) playVid($('#dVid')); }
function opsViewBox(to) {
  const svg = $('#opsMap'), from = PROG.vb.slice(), t0 = performance.now(), dur = REDUCED_M ? 0 : 760; cancelAnimationFrame(PROG.anim);
  const step = (now) => { const u = dur ? Math.min(1, (now - t0) / dur) : 1, e = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; PROG.vb = from.map((v, i) => v + (to[i] - v) * e); svg.setAttribute('viewBox', PROG.vb.map((v) => v.toFixed(1)).join(' ')); if (u < 1) PROG.anim = requestAnimationFrame(step); };
  PROG.anim = requestAnimationFrame(step);
}
function opsArrows(k) {
  const g = $('#opsMap .m-arrows'); g.innerHTML = ''; const ns = 'http://www.w3.org/2000/svg';
  CHM[k].arrows.forEach(([col, d], i) => {
    const p = document.createElementNS(ns, 'path'); p.setAttribute('d', d); p.setAttribute('class', `arr ${col}`); p.setAttribute('pathLength', '1'); p.style.transitionDelay = `${0.25 + i * 0.18}s`; g.appendChild(p);
    const L = p.getTotalLength(), a = p.getPointAtLength(L), b = p.getPointAtLength(Math.max(0, L - 14)), ang = Math.atan2(a.y - b.y, a.x - b.x), w = 0.55, s = 15;
    const hd = document.createElementNS(ns, 'path'); hd.setAttribute('d', `M${a.x + Math.cos(ang) * 3} ${a.y + Math.sin(ang) * 3} L${a.x - Math.cos(ang - w) * s} ${a.y - Math.sin(ang - w) * s} L${a.x - Math.cos(ang + w) * s} ${a.y - Math.sin(ang + w) * s} Z`); hd.setAttribute('class', `ahead ${col}`); hd.style.transitionDelay = `${0.95 + i * 0.18}s`; g.appendChild(hd);
  });
  if (k === 'army') { const e = document.createElementNS(ns, 'ellipse'); for (const [a, v] of [['cx', 592], ['cy', 790], ['rx', 40], ['ry', 66], ['class', 'm-pocket']]) e.setAttribute(a, v); g.prepend(e); const t = document.createElementNS(ns, 'text'); for (const [a, v] of [['x', 640], ['y', 800], ['class', 'm-lbl m-sm m-red'], ['text-anchor', 'start']]) t.setAttribute(a, v); t.textContent = 'הארמיה השלישית'; g.appendChild(t); }
  if (k === 'cross') { const b = document.createElementNS(ns, 'path'); b.setAttribute('d', 'M460 476 L 468 490 M 468 475 L 476 489'); b.setAttribute('class', 'm-bridge'); g.appendChild(b); }
  requestAnimationFrame(() => requestAnimationFrame(() => { for (const el of g.querySelectorAll('.arr, .ahead')) el.classList.add('drawn'); }));
}
function opsSelect(k) {
  if (!CHM[k]) return; PROG.sel = k; const c = CHM[k], info = CH_INFO[k], done = PROG.done.has(k), nx = nextChapter();
  for (const el of document.querySelectorAll('#mOps [data-k]')) { const q = el.dataset.k; el.classList.toggle('on', q === k); el.classList.toggle('done', PROG.done.has(q)); if (el.classList.contains('m-item')) { el.setAttribute('aria-selected', q === k ? 'true' : 'false'); const st = el.querySelector('.m-s'); st.textContent = PROG.done.has(q) ? 'הושלמה' : q === nx ? 'הבאה' : ''; st.classList.toggle('nx', !PROG.done.has(q) && q === nx); } }
  $('#dNum').textContent = info.n; $('#dOf').textContent = `משימה ${info.n} מתוך ${CH_ORDER.length}`; $('#dName').textContent = info.name; $('#dWhen').textContent = c.when; $('#dWhere').textContent = c.where; $('#dWho').textContent = c.who; $('#dStory').textContent = c.story;
  $('#dObj').innerHTML = c.obj.map((o) => `<li>${o}</li>`).join('');
  $('#dStamp').hidden = !done; const go = $('#dGo'); go.dataset.chap = k; go.textContent = done ? 'שחק שוב' : 'התחל משימה';
  $('#opsSub').textContent = `6 עד 24 באוקטובר 1973 · הושלמו ${PROG.done.size} מתוך ${CH_ORDER.length}`;
  opsArrows(k); opsMicro(k); opsHero(k);
  requestAnimationFrame(() => { for (const it of document.querySelectorAll(`#opsList [data-k="${k}"], #opsLine [data-k="${k}"]`)) if (it.scrollIntoView) it.scrollIntoView({ block: 'nearest', inline: 'center' }); });
}
/* ---------- moving between the screens ---------- */
const MENUS = ['#mBrief', '#mOps', '#mSet', '#mPause', '#mEnd'];
function menuShow(id) { for (const m of MENUS) { $(m).hidden = m !== id; if (m !== id) for (const v of $(m).querySelectorAll('video')) v.pause(); } }
function showTitle() {
  const n = nextChapter(), any = PROG.done.size > 0, all = PROG.done.size >= CH_ORDER.length;
  $('#tContinue').innerHTML = `<span class="t-cta"><b>${all ? 'שחק שוב' : any ? 'המשך' : 'התחל'}</b><small>משימה ${CH_INFO[n].n} · ${CH_INFO[n].name} · ${Math.round(CHM[n].day)} באוקטובר</small></span><span class="t-thumb pic"><img src="${IMG(n)}" alt=""></span>`; $('#tContinue').dataset.chap = n;
  $('#tProg').innerHTML = `<span class="seg">${CH_ORDER.map((k) => `<i class="${PROG.done.has(k) ? 'on' : k === n && !all ? 'nx' : ''}"></i>`).join('')}</span><span>${any ? `הושלמו ${PROG.done.size} מתוך ${CH_ORDER.length} משימות` : `${CH_ORDER.length} משימות לפי סדר הימים`}</span>`;
  $('#tStrip').innerHTML = CH_ORDER.map((k) => `<button type="button" class="st-card" role="listitem" data-k="${k}" aria-label="משימה ${CH_INFO[k].n}, ${CH_INFO[k].name}"><img src="${IMG(k)}" alt="" loading="lazy" decoding="async">${PROG.done.has(k) ? '<i>הושלמה</i>' : k === n && !all ? '<i class="nx">הבאה</i>' : ''}<span><em>${CH_INFO[k].n}</em><b>${CH_INFO[k].name}</b></span></button>`).join('');
  for (const b of document.querySelectorAll('#tStrip .st-card')) b.addEventListener('click', () => showOps(b.dataset.k));
  $('#tSurv').innerHTML = `<span>הישרדות · להחזיק את המעוז${SURV.best ? `<small>השיא שלכם: ${SURV.best.toLocaleString('he-IL')}</small>` : '<small>גל אחרי גל, מכל הכיוונים</small>'}</span>`;
  menuShow('#mBrief'); titleShow(CH_ORDER.indexOf(n));
}
// behind the title, the eight battles play one after another, like the trailer of the game: footage when it loads, the still picture until then
const TSHOW = { i: 0, timer: 0, dur: 5 };   // a clip is four seconds of footage, played a little slowed down
function playVid(v) { if (!USE_VID || !v) return; if (!v.src) v.src = v.dataset.src; v.preload = 'auto'; v.defaultPlaybackRate = 0.8; try { v.currentTime = 0; } catch (e) {} const p = v.play(); if (p && p.catch) p.catch(() => {}); v.playbackRate = 0.8; }
function titleShow(start) {
  const box = $('#tSlides');
  if (!box.children.length) {
    box.innerHTML = CH_ORDER.map((k) => `<div class="sh" data-k="${k}"><img src="${IMG(k)}" alt="" decoding="async">${USE_VID ? `<video muted playsinline loop preload="none" data-src="${VID(k)}"></video>` : ''}</div>`).join('');
    for (const v of box.querySelectorAll('video')) { v.addEventListener('playing', () => v.parentNode.classList.add('vid')); v.addEventListener('error', () => v.parentNode.classList.remove('vid')); }
    $('#tBars').innerHTML = CH_ORDER.map(() => '<i><b></b></i>').join('');
    $('#tNow').addEventListener('click', () => showOps(CH_ORDER[TSHOW.i]));
  }
  const sh = [...box.children], bars = [...$('#tBars').children];
  const go = (i) => {
    TSHOW.i = (i + sh.length) % sh.length; const k = CH_ORDER[TSHOW.i];
    sh.forEach((el, j) => { const on = j === TSHOW.i; el.classList.toggle('on', on); const v = el.querySelector('video'); if (v) { if (on) playVid(v); else { v.pause(); el.classList.remove('vid'); } } const im = el.querySelector('img'); if (on && im) { im.style.animation = 'none'; void im.offsetWidth; im.style.animation = ''; } });
    const nx = sh[(TSHOW.i + 1) % sh.length].querySelector('video'); if (USE_VID && nx && !nx.src) { nx.src = nx.dataset.src; nx.preload = 'auto'; }
    bars.forEach((el, j) => { el.className = j < TSHOW.i ? 'done' : ''; if (j === TSHOW.i) { void el.offsetWidth; el.className = 'on'; } });
    $('#tBars').style.setProperty('--dur', TSHOW.dur + 's');
    $('#tCap').innerHTML = `<em>${CH_INFO[k].n}</em><span>${CH_INFO[k].name}</span><small>${Math.round(CHM[k].day)} באוקטובר</small>`;
    $('#tBack').style.backgroundImage = `url('${IMG(k)}')`;
    for (const c of document.querySelectorAll('#tStrip .st-card')) c.classList.toggle('now', c.dataset.k === k);
  };
  clearInterval(TSHOW.timer); go(start >= 0 ? start : 0);
  if (!REDUCED_M) TSHOW.timer = setInterval(() => { if ($('#mBrief').hidden) { clearInterval(TSHOW.timer); return; } go(TSHOW.i + 1); }, TSHOW.dur * 1000);
}
function showOps(k) { menuShow('#mOps'); vidClose(); opsSelect(k || PROG.sel || (PROG.last && CHM[PROG.last] ? PROG.last : nextChapter())); setTimeout(() => { const b = document.querySelector('#mOps .m-item.on'); if (b) b.focus({ preventScroll: true }); }, 30); }
function showSet(from) { PROG.from = from; menuShow('#mSet'); }
function toOps() { survStop(); if (CINE.on) endCine(true); GAME.state = 'menu'; $('#app').classList.remove('play'); if (document.pointerLockElement && document.exitPointerLock) document.exitPointerLock(); meter(null); showOps(MODE); }
function initMenus() {
  $('#opsMap').innerHTML = opsMapSvg(); opsList(); opsLine();
  { const v = $('#dVid'); v.addEventListener('playing', () => v.classList.add('on')); v.addEventListener('error', () => v.classList.remove('on')); }
  opsLayout(); if (PHONE_MQ.addEventListener) PHONE_MQ.addEventListener('change', opsLayout); else if (PHONE_MQ.addListener) PHONE_MQ.addListener(opsLayout);
  for (const b of document.querySelectorAll('.b-tabs button')) b.addEventListener('click', () => opsTab(b.dataset.tab));
  for (const id of ['#dExp', '#hExp']) $(id).addEventListener('click', vidOpen); $('#vmClose').addEventListener('click', vidClose); $('#vidModal').addEventListener('click', (e) => { if (e.target === $('#vidModal')) vidClose(); });
  window.addEventListener('keydown', (e) => { if (e.code === 'Escape' && !$('#vidModal').hidden) vidClose(); });
  if (!VEXT) for (const id of ['#dExp', '#hExp']) $(id).hidden = true;
  for (const el of document.querySelectorAll('#mOps [data-k]')) { el.addEventListener('click', () => opsSelect(el.dataset.k)); el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (el.classList.contains('on')) startChapter(el.dataset.k); else opsSelect(el.dataset.k); } }); }
  $('#tOps').addEventListener('click', () => showOps()); $('#tSet').addEventListener('click', () => showSet('title')); $('#tSurv').addEventListener('click', () => loadMission('surv', survStart)); $('#tRange').addEventListener('click', () => startChapter('range'));
  $('#oBack').addEventListener('click', showTitle); $('#oSet').addEventListener('click', () => showSet('ops'));
  $('#sBack').addEventListener('click', () => (PROG.from === 'ops' ? showOps() : showTitle()));
  $('#bOps').addEventListener('click', toOps);
  // the list runs down in time; on the map, left and right step through the days too (left is forward in Hebrew)
  $('#mOps').addEventListener('keydown', (e) => { const fw = e.key === 'ArrowDown' || e.key === 'ArrowLeft', bk = e.key === 'ArrowUp' || e.key === 'ArrowRight'; if (!fw && !bk) return; const i = CH_ORDER.indexOf(PROG.sel), j = clamp(i + (fw ? 1 : -1), 0, CH_ORDER.length - 1); opsSelect(CH_ORDER[j]); const b = document.querySelector(`#opsList [data-k="${CH_ORDER[j]}"]`); if (b) b.focus({ preventScroll: true }); e.preventDefault(); });
  showTitle(); $('#mBrief').hidden = true;
}
initMenus();
bootGame();   // the last file: everything is defined, the game can start
