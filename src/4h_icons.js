
/* ================= the touch controls drawn, not written =================
   Every on-screen button carries a picture of what it does - a round for fire, a scope for the sight, a grenade, a tank shell, a hand
   for "do it", a stretcher, a box of rounds - the way phone shooters label their controls, so nothing on the screen needs reading.
   The tutorial points at the button to press: a soft red ring round it and a small arrow beside it, breathing. */
const TICO = {
  fire: '<path d="M12 2.5c1.9 1.6 2.8 3.7 2.8 6.2V18H9.2V8.7c0-2.5.9-4.6 2.8-6.2z"/><path d="M8.4 18h7.2v3.2H8.4z"/><path d="M9.2 11h5.6"/>',
  ads: '<circle cx="12" cy="12" r="7.6"/><circle cx="12" cy="12" r="1.1" fill="currentColor"/><path d="M12 1.8v5M12 17.2v5M1.8 12h5M17.2 12h5"/>',
  gren: '<ellipse cx="11" cy="14.6" rx="5.6" ry="6.4"/><path d="M8.4 8.6V6.4h5.2v2.2"/><path d="M13.6 6.4h3.6l1.6 6"/><circle cx="7.6" cy="5" r="1.9"/><path d="M6.2 14.2h9.6M11 8.4v12.4"/>',
  shell: '<path d="M12 2c2 1.8 3 4.2 3 7v4.6H9V9c0-2.8 1-5.2 3-7z"/><path d="M8 13.6h8v3.2H8zM8.6 16.8h6.8V22H8.6z"/>',
  hand: '<path d="M8 12.5V6.2a1.4 1.4 0 0 1 2.8 0V11"/><path d="M10.8 10.6V4.6a1.4 1.4 0 0 1 2.8 0v6"/><path d="M13.6 10.6V5.8a1.4 1.4 0 0 1 2.8 0v6.6"/><path d="M16.4 9.8a1.4 1.4 0 0 1 2.8 0v4.6c0 4-2.6 7.1-6.6 7.1-2.7 0-4.4-1.2-5.9-3.5L4.4 14.4a1.4 1.4 0 0 1 2.3-1.6L8 14.6"/>',
  mg: '<path d="M2.5 10.5h13.5l2.5-1.5h3v3h-3l-1 1H9.5l-1.5 3h-3l1-3H2.5z"/><path d="M11 13l1.5 4.5M14.5 13l-1.5 4.5"/>',
  ammo: '<rect x="3" y="10" width="18" height="10" rx="1"/><path d="M3 13.5h18"/><path d="M7 10V5.5c0-1 .5-1.8 1.2-2.4.7.6 1.2 1.4 1.2 2.4V10M11 10V5.5c0-1 .5-1.8 1.2-2.4.7.6 1.2 1.4 1.2 2.4V10M15 10V5.5c0-1 .5-1.8 1.2-2.4.7.6 1.2 1.4 1.2 2.4V10"/>',
  lift: '<circle cx="12" cy="4.6" r="2"/><path d="M12 7.6v6.4M8.2 10.4l3.8-2.8 3.8 2.8M9.4 21l2.6-7 2.6 7"/><path d="M18.5 15.5V9.5M16.6 11.4l1.9-1.9 1.9 1.9"/>',
  drop: '<path d="M3 17.5h18M5 17.5v3M19 17.5v3"/><path d="M6.5 14.5h11"/><circle cx="7.2" cy="12.6" r="1.6"/><path d="M12 2.5v7M9.4 7l2.6 2.6L14.6 7"/>',
  aid: '<rect x="3.2" y="3.2" width="17.6" height="17.6" rx="3"/><path d="M12 7.2v9.6M7.2 12h9.6" stroke-width="3"/>',
  down: '<rect x="4" y="12" width="16" height="9" rx="1.5"/><path d="M12 2.5v8M8.8 7.4L12 10.6l3.2-3.2"/>',
  up: '<rect x="4" y="12" width="16" height="9" rx="1.5"/><path d="M12 10.6v-8M8.8 5.8L12 2.6l3.2 3.2"/>',
  exit: '<path d="M10 4H5v16h5"/><path d="M9.5 12H21M17 8l4 4-4 4"/>',
  swap: '<path d="M4 8.5h13.5M14 5l3.5 3.5L14 12"/><path d="M20 15.5H6.5M10 12l-3.5 3.5L10 19"/>',
  jet: '<path d="M12 2.2l1.6 6.4 7.4 4.6v1.8l-7.2-2.3-.6 5.4 2.6 2v1.5L12 20.4l-3.8 1.2v-1.5l2.6-2-.6-5.4-7.2 2.3v-1.8l7.4-4.6z"/>',
  smoke: '<rect x="8.5" y="11" width="7" height="10" rx="1"/><path d="M8.5 14h7"/><path d="M10 11V9.2h4V11"/><path d="M12 9c-2.6 0-3.6-1.6-3.1-3.2.5-1.6 2.3-1.8 3-1 .4-1.7 3.4-2 4 0 1.8-.3 2.6 1.6 1.6 2.8"/>',
  menu: '<path d="M4 6.5h16M4 12h16M4 17.5h16"/>',
};
function tico(n, cls = '') { const p = TICO[n] || TICO.hand; return `<svg class="ico ${cls}" viewBox="0 0 24 24" aria-hidden="true">${p}</svg>`; }
/* a small inline picture of a button, for the instructions: the same drawing in a little round chip */
const tchip = (n) => `<span class="tchip">${tico(n)}</span>`;
/* set a button's picture (and a small number on it), touching the page only when it changes */
function tbIcon(el, n, badge = null, pct = null) {
  if (typeof el === 'string') el = $(el); if (!el) return;
  const key = n + '|' + (badge ?? '') ; if (el.dataset.ic !== key) { el.dataset.ic = key; el.innerHTML = tico(n) + (badge !== null && badge !== '' ? `<b class="tbadge">${badge}</b>` : ''); }
  if (pct !== null) { el.style.setProperty('--p', `${Math.round(pct * 360)}deg`); el.classList.add('prog'); } else if (el.classList.contains('prog')) el.classList.remove('prog');
}
const TB_LABEL = { tfire: 'אש', tads: 'כוונת', tgren: 'רימון', tact: 'פעולה', tpos: 'עמדה חלופית', tpause: 'תפריט', tair: 'תקיפה אווירית', tsmoke: 'רימון עשן' };
const TB_ICON = { tfire: 'fire', tads: 'ads', tgren: 'gren', tact: 'hand', tpos: 'swap', tpause: 'menu', tair: 'jet', tsmoke: 'smoke' };
for (const id in TB_ICON) { const el = document.getElementById(id); if (el) { el.setAttribute('aria-label', TB_LABEL[id]); el.title = TB_LABEL[id]; tbIcon(el, TB_ICON[id]); } }
/* the tutorial's pointer: one button at a time, ringed in soft red with a small arrow at its side */
const TPOINT = { id: null };
function tutPoint(id) {
  if (TPOINT.id === id) return; if (TPOINT.id) { const o = document.getElementById(TPOINT.id); if (o) o.classList.remove('tpoint'); }
  TPOINT.id = id; if (id) { const el = document.getElementById(id); if (el) el.classList.add('tpoint'); }
}
/* the instructions on a phone: the buttons' names become their pictures */
const TI_MAP = [[/(?:על )?(?:הכפתור |כפתור )?<kbd>אש<\/kbd>/g, 'fire'], [/(?:הכפתור |כפתור )?<kbd>כוונת<\/kbd>/g, 'ads'], [/(?:הכפתור |כפתור )?<kbd>רימון<\/kbd>/g, 'gren'], [/(?:הכפתור |כפתור )?<kbd>תותח<\/kbd>/g, 'shell'],
  [/(?:הכפתור |כפתור )?<kbd>עשן<\/kbd>/g, 'smoke'], [/(?:הכפתור |כפתור )?<kbd>לאייש מא״ג<\/kbd>/g, 'mg'], [/(?:הכפתור |כפתור )?<kbd>לרדת<\/kbd>/g, 'exit'], [/(?:הכפתור |כפתור )?<kbd>פעולה<\/kbd>/g, 'hand'],
  [/(?:על |את )?הכפתור הירוק(?: שמופיע מימין)?/g, 'hand']];
function touchIcons(html) { if (typeof TOUCH === 'undefined' || !TOUCH) return html; for (const [re, n] of TI_MAP) html = html.replace(re, tchip(n)); return html; }
