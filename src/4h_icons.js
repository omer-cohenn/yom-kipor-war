
/* ================= the touch controls drawn, not written =================
   Every on-screen button carries a picture of what it does - a round for fire, a scope for the sight, a grenade, a tank shell, a hand
   for "do it", a stretcher, a box of rounds - the way phone shooters label their controls, so nothing on the screen needs reading.
   The tutorial points at the button to press: a soft red ring round it and a small arrow beside it, breathing. */
const TICO = {   /* line drawings with filled parts (class f: a tint of the line colour, class s: solid) - the detail of a game's button art */
  fire: '<path class="f" d="M12 1.6l1.9 5.2 4.6-3-1.5 5.3 5.4.4-4.4 3.2 4.1 3.6-5.5-.2.9 5.5-4.2-3.5-2.1 5.1-1.4-5.4-4.8 2.8 2-5.1-5.5-.6 4.6-3L1.8 6.5l5.4 1.2-.8-5.4 4.1 3.7z"/><path d="M12 1.6l1.9 5.2 4.6-3-1.5 5.3 5.4.4-4.4 3.2 4.1 3.6-5.5-.2.9 5.5-4.2-3.5-2.1 5.1-1.4-5.4-4.8 2.8 2-5.1-5.5-.6 4.6-3L1.8 6.5l5.4 1.2-.8-5.4 4.1 3.7z" stroke-width="1.2"/><path class="s" d="M12 8.2l1.1 2.5 2.7.3-2 1.8.6 2.7-2.4-1.4-2.4 1.4.6-2.7-2-1.8 2.7-.3z" style="fill:rgba(40,36,18,.75)"/>',
  ads: '<circle class="f" cx="12" cy="12" r="7.6"/><circle cx="12" cy="12" r="7.6"/><circle cx="12" cy="12" r="3.6" opacity=".55"/><circle class="s" cx="12" cy="12" r="1"/><path d="M12 2v6.2M12 15.8V22M2 12h6.2M15.8 12H22"/>',
  gren: '<ellipse class="f" cx="11" cy="15" rx="5.6" ry="6.2"/><ellipse cx="11" cy="15" rx="5.6" ry="6.2"/><path d="M5.6 13.2h10.8M5.6 16.8h10.8M8.6 9.2v11.6M13.4 9.2v11.6" stroke-width="1" opacity=".6"/><path class="s" d="M8.6 7.2h4.8v2.2H8.6z"/><path d="M13.4 7.6h3.4c.8 0 1.3.5 1.4 1.2l.9 4.6"/><circle cx="7.4" cy="5.4" r="1.9"/><path d="M8.8 6.4l.6.9"/>',
  shell: '<path class="f" d="M9 9.2c0-2.8 1-5.2 3-7 2 1.8 3 4.2 3 7v4.2H9z"/><path d="M9 9.2c0-2.8 1-5.2 3-7 2 1.8 3 4.2 3 7v4.2H9z"/><path class="s" d="M8.4 13.4h7.2v1.8H8.4z"/><path d="M8.8 15.2h6.4v6.6H8.8z"/><path d="M8.8 18.2h6.4" stroke-width="1" opacity=".6"/>',
  hand: '<path class="f" d="M8 14.6V6.2a1.4 1.4 0 0 1 2.8 0V4.6a1.4 1.4 0 0 1 2.8 0v1.2a1.4 1.4 0 0 1 2.8 0v4a1.4 1.4 0 0 1 2.8 0v4.6c0 4-2.6 7.1-6.6 7.1-2.7 0-4.4-1.2-5.9-3.5L4.4 14.4a1.4 1.4 0 0 1 2.3-1.6z"/><path d="M8 12.5V6.2a1.4 1.4 0 0 1 2.8 0V11"/><path d="M10.8 10.6V4.6a1.4 1.4 0 0 1 2.8 0v6"/><path d="M13.6 10.6V5.8a1.4 1.4 0 0 1 2.8 0v6.6"/><path d="M16.4 9.8a1.4 1.4 0 0 1 2.8 0v4.6c0 4-2.6 7.1-6.6 7.1-2.7 0-4.4-1.2-5.9-3.5L4.4 14.4a1.4 1.4 0 0 1 2.3-1.6L8 14.6"/>',
  mg: { vb: '0 0 48 24', p: '<path class="f" d="M18 8h15.4l.6.4h2.2l10.2 .6v1l-.4 .2v5.4l-.9.2-8.6-2.6H33l-1.6.4-.4 4.6-1.2.6h-1.6l.2-5.2H18z"/><path d="M18 8h15.4l.6.4h2.2l10.2 .6v1l-.4 .2v5.4l-.9.2-8.6-2.6H33l-1.6.4-.4 4.6-1.2.6h-1.6l.2-5.2H18z" stroke-width="0.9"/><path class="s" d="M1 9.1h3.4v1.8H1zM4.4 9.6H18v.9H4.4zM7.6 11h11v1H7.6zM4.6 7.8h.8v1.8h-.8z"/><path d="M2 9.1v1.8M3.2 9.1v1.8" stroke-width="0.5" style="stroke:rgba(30,28,14,.8)"/><path d="M18.6 8c.2-2.2 1.4-3 2.8-3s2.6.8 2.8 3" stroke-width="1.1"/><path class="s" d="M22 6.9h8.4V8H22zM31 6.6h1v1.4h-1z"/><path d="M24.6 12.8c0 1.6.8 2.6 2.6 2.6h1.4" stroke-width="0.9"/><path d="M14.6 12l-3.2 8.2M14.6 12l3 8.2" stroke-width="1.1"/><path d="M10.6 20.2h1.6M16.8 20.2h1.6" stroke-width="1.3"/><path class="s" d="M19.6 12.8h1.4v1.2h-1.4zM19.9 14.3h1.4v1.2h-1.4zM20.4 15.8h1.4V17h-1.4zM21.1 17.3h1.4v1.2h-1.4z"/><path d="M33.6 9.2l12 .8M34 12.4l11.4 3" stroke-width="0.5" style="stroke:rgba(30,28,14,.6)"/>' },
  ammo: '<path class="f" d="M2.8 10.4h15.6v10.4H2.8z"/><path d="M2.8 10.4h15.6v10.4H2.8z" stroke-width="1.3"/><path class="s" d="M2.2 8.8h16.8v1.8H2.2z"/><path d="M7.6 8.8V7.2h6v1.6" stroke-width="1.4"/><path d="M5.2 12.6v6.2M15.8 12.6v6.2" stroke-width="0.8" opacity=".7"/><path class="s" d="M1.4 12.2h1.4v3H1.4z"/><path d="M8 14.4h5.4M8 16.6h5.4" stroke-width="0.9" opacity=".75"/><path class="s" d="M18.6 10.2l1.6-.4 1 1.8-1.6.6zM19.6 12.4l1.6-.2.8 1.9-1.6.4zM20.2 14.8l1.6 0 .5 2-1.7.2z"/><path d="M19.4 9.6c1.6.9 2.6 3.6 2.6 7.6" stroke-width="0.7" opacity=".7"/>',
  lift: '<circle class="s" cx="10" cy="4.4" r="2"/><path d="M10 7.4v6.2M6.4 10.2l3.6-2.6 3.6 2.6M7.6 21l2.4-7.4 2.4 7.4"/><path class="f" d="M15.4 10.6l3.2-3.6 3.2 3.6h-2v6h-2.4v-6z"/><path d="M15.4 10.6l3.2-3.6 3.2 3.6h-2v6h-2.4v-6z"/>',
  drop: '<path class="f" d="M3 16h18v2.2H3z"/><path d="M3 16h18v2.2H3zM5 18.2v3M19 18.2v3"/><path d="M6.6 14.6h10.4"/><circle class="s" cx="6.6" cy="12.8" r="1.6"/><path d="M12 2.4v7.4M9.2 7.2l2.8 2.8 2.8-2.8"/>',
  aid: '<path d="M8.6 7.4V5.6c0-.9.7-1.6 1.6-1.6h3.6c.9 0 1.6.7 1.6 1.6v1.8" stroke-width="1.6"/><path class="f" d="M3.4 9.2c0-1 .8-1.8 1.8-1.8h13.6c1 0 1.8.8 1.8 1.8v9.6c0 1-.8 1.8-1.8 1.8H5.2c-1 0-1.8-.8-1.8-1.8z"/><path d="M3.4 9.2c0-1 .8-1.8 1.8-1.8h13.6c1 0 1.8.8 1.8 1.8v9.6c0 1-.8 1.8-1.8 1.8H5.2c-1 0-1.8-.8-1.8-1.8z" stroke-width="1.3"/><path d="M3.6 11.4h16.8" stroke-width="0.8" opacity=".7"/><circle cx="12" cy="15.2" r="4.1" style="fill:#efe9d8;stroke:rgba(30,28,14,.6);stroke-width:.6"/><path d="M10.9 12.6h2.2v1.5h1.5v2.2h-1.5v1.5h-2.2v-1.5H9.4v-2.2h1.5z" style="fill:#c8372b;stroke:none"/>',
  down: '<rect class="f" x="4" y="12" width="16" height="9" rx="1.5"/><rect x="4" y="12" width="16" height="9" rx="1.5"/><path d="M12 2.5v8M8.8 7.4L12 10.6l3.2-3.2"/>',
  up: '<rect class="f" x="4" y="12" width="16" height="9" rx="1.5"/><rect x="4" y="12" width="16" height="9" rx="1.5"/><path d="M12 10.6v-8M8.8 5.8L12 2.6l3.2 3.2"/>',
  exit: '<path class="f" d="M5 4h5v16H5z"/><path d="M10 4H5v16h5"/><path d="M9.5 12H21M17 8l4 4-4 4"/>',
  swap: '<path d="M4 8.5h13.5M14 5l3.5 3.5L14 12"/><path d="M20 15.5H6.5M10 12l-3.5 3.5L10 19"/>',
  jet: '<path class="f" d="M12 2.2l1.6 6.4 7.4 4.6v1.8l-7.2-2.3-.6 5.4 2.6 2v1.5L12 20.4l-3.8 1.2v-1.5l2.6-2-.6-5.4-7.2 2.3v-1.8l7.4-4.6z"/><path d="M12 2.2l1.6 6.4 7.4 4.6v1.8l-7.2-2.3-.6 5.4 2.6 2v1.5L12 20.4l-3.8 1.2v-1.5l2.6-2-.6-5.4-7.2 2.3v-1.8l7.4-4.6z"/>',
  smoke: '<rect class="f" x="8.5" y="11" width="7" height="10" rx="1"/><rect x="8.5" y="11" width="7" height="10" rx="1"/><path d="M8.5 14h7"/><path class="s" d="M10 9.2h4V11h-4z"/><path d="M12 9c-2.6 0-3.6-1.6-3.1-3.2.5-1.6 2.3-1.8 3-1 .4-1.7 3.4-2 4 0 1.8-.3 2.6 1.6 1.6 2.8"/>',
  fal: { vb: '0 0 48 24', p: '<path class="f" d="M3 9.4h9.6l.6-.6h12.4l1 .6h4l1.6-1h2.6l.4 1 10.4 1.6.2 4.2-1.2.6-9.8-2.4-2.2.2-1.4 4.4-1.4.4-1.8-.2.6-4.4h-3l-1.4 5.6-1 .3-3.6-.1.6-1.2 1.6-4.6h-1.8l-.6 1.6h-1.4l.4-1.8-6.4-.4-.4-.6H3z"/><path d="M3 9.4h9.6l.6-.6h12.4l1 .6h4l1.6-1h2.6l.4 1 10.4 1.6.2 4.2-1.2.6-9.8-2.4-2.2.2-1.4 4.4-1.4.4-1.8-.2.6-4.4h-3l-1.4 5.6-1 .3-3.6-.1.6-1.2 1.6-4.6h-1.8l-.6 1.6h-1.4l.4-1.8-6.4-.4-.4-.6H3z" stroke-width="0.8"/><path class="s" d="M.8 9.6H3v1.4H.8zM4.6 8.2h.7v1.2h-.7zM30.2 7.2h1.6v1.2h-1.6z"/><path d="M13.4 10.6h10.8M24.6 12.6l-1.4 5.6" stroke-width="0.5" style="stroke:rgba(30,28,14,.7)"/>' },
  menu: '<path d="M4 6.5h16M4 12h16M4 17.5h16"/>',
};
function tico(n, cls = '') { const t = TICO[n] || TICO.hand, p = t.p || t, vb = t.vb || '0 0 24 24'; return `<svg class="ico ${cls}${t.vb ? ' wide' : ''}" viewBox="${vb}" aria-hidden="true">${p}</svg>`; }
/* a small inline picture of a button, for the instructions: the same drawing in a little round chip */
const tchip = (n) => `<span class="tchip">${tico(n)}</span>`;
/* set a button's picture (and a small number on it), touching the page only when it changes */
function tbIcon(el, n, badge = null, pct = null) {
  if (typeof el === 'string') el = $(el); if (!el) return;
  const key = n + '|' + (badge ?? '') ; if (el.dataset.ic !== key) { el.dataset.ic = key; el.innerHTML = tico(n) + (badge !== null && badge !== '' ? `<b class="tbadge">${badge}</b>` : ''); }
  if (pct !== null) { el.style.setProperty('--p', `${Math.round(pct * 360)}deg`); el.classList.add('prog'); } else if (el.classList.contains('prog')) el.classList.remove('prog');
}
const TB_LABEL = { taid: 'עזרה ראשונה (להחזיק)', tmag: 'מקלע מא״ג', tfire: 'אש', tads: 'כוונת', tgren: 'רימון', tact: 'פעולה', tpos: 'עמדה חלופית', tpause: 'תפריט', tair: 'תקיפה אווירית', tsmoke: 'רימון עשן' };
const TB_ICON = { taid: 'aid', tmag: 'mg', tfire: 'fire', tads: 'ads', tgren: 'gren', tact: 'hand', tpos: 'swap', tpause: 'menu', tair: 'jet', tsmoke: 'smoke' };
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
  [/(?:על |את )?הכפתור הירוק(?: שמופיע מימין)?/g, 'hand'], [/(?:הכפתור |כפתור )?<kbd>עזרה ראשונה<\/kbd>/g, 'aid']];
function touchIcons(html) { if (typeof TOUCH === 'undefined' || !TOUCH) return html; for (const [re, n] of TI_MAP) html = html.replace(re, tchip(n)); return html; }

/* the weapon panel: the weapon drawn, the rounds left in big numbers, the magazine as a row of cartridges (or the belt as a bar), the
   grenades beside it - all in the olive and brass of the buttons */
const WP = { k: '', t: '', g: '' };
function wpUpdate(kind, n, of, fill, ticks, gren, smoke, low) {
  if (WP.k !== kind) { WP.k = kind; $('#wIco').innerHTML = tico(kind); }
  const t = `${n}${of !== '' ? `<small>${of}</small>` : ''}`; if (WP.t !== t) { WP.t = t; $('#wAmmo').innerHTML = t; } $('#wAmmo').classList.toggle('low', !!low);
  const tk = $('#wTicks'), key = ticks ? `t${ticks}|${fill}` : `b${Math.round(fill * 40)}`;
  if (tk.dataset.k !== key) { tk.dataset.k = key;
    if (ticks) { let h = ''; const on = Math.round(fill * ticks); for (let i = 0; i < ticks; i++) h += `<i class="${i < on ? 'on' : ''}"></i>`; tk.innerHTML = h; tk.className = 'ticks'; }
    else { tk.innerHTML = `<span style="width:${Math.round(fill * 100)}%"></span>`; tk.className = 'bar'; } }
  const g = `${gren}|${smoke}`; if (WP.g !== g) { WP.g = g; $('#wGren').innerHTML = (gren !== null ? `<span class="wg">${tico('gren')}<b>${gren}</b></span>` : '') + (smoke ? `<span class="wg">${tico('smoke')}<b>${smoke}</b></span>` : ''); }
}
