"""Builds the game from the sources in src/.

  python3 tools/build.py                      the site, into docs/ (what GitHub Pages serves): a small index.html - the page and its loading
                                              screen - that downloads game.js (all the game's code, one module) and shows how much has
                                              arrived; plus the media from public/
  python3 tools/build.py --single OUT.html    everything in one file (the Claude artifact)   [--src DIR] [--mjs OUT.mjs for a syntax check]

Between the source files the module pauses for a frame (a top-level await) so the loading screen can show how far the code has got;
EST is roughly how long each file takes to run on a fast computer, in ms, and sets the steps of the bar."""
import argparse, hashlib, os, shutil, sys

ORDER = ['2_core.js', '4f_models.js', '4f_data_ground.js', '4f_data_props.js', '4f_data_furn.js', '4f_data_village.js', '4f_data_desert.js', '4f_data_bag.js', '3_world.js', '16_props.js', '4b_assets.js', '4d_vehicles.js', '4_actors.js', '4c_vm.js', '4e_soldier_data.js', '4e_soldier.js', '4g_maps.js', '5_game.js', '6_suez.js', '7_field.js',
         '8_rescue.js', '9_cross.js', '10_army.js', '11_air.js', '12_armor.js', '13_hermon.js', '15_surv.js', '18_farm.js', '19_range.js', '17_snap.js', '14_menu.js']
EST = {'2_core.js': 320, '3_world.js': 230, '16_props.js': 80, '4_actors.js': 800, '4c_vm.js': 140, '4e_soldier_data.js': 40, '7_field.js': 180, '18_farm.js': 25, '14_menu.js': 190}
PAUSE_AFTER = ['2_core.js', '16_props.js', '4_actors.js', '7_field.js']   # the long ones end a piece
TOTAL = 2000   # LD_BOOT in 5_game.js: the last report, from main(), is TOTAL of TOTAL


def module(src):
    """the game's code as one module, with the progress reports between the pieces"""
    pieces, cur = [], []
    for f in ORDER:
        cur.append(f)
        if f in PAUSE_AFTER: pieces.append(cur); cur = []
    pieces.append(cur)
    cost = [sum(EST.get(f, 5) for f in p) for p in pieces]; scale = (TOTAL * 0.97) / sum(cost)
    cost = [round(c * scale) for c in cost]
    out, done = [f'LD.mod(0, {cost[0]}, {TOTAL});\n'], 0
    for i, p in enumerate(pieces):
        for f in p:
            if not os.path.exists(os.path.join(src, f)): continue   # a model data file not packed yet
            out.append(open(os.path.join(src, f), encoding='utf-8').read().rstrip('\n') + '\n')
        done += cost[i]
        if i + 1 < len(pieces): out.append(f'await LD.mod({done}, {cost[i + 1]}, {TOTAL});\n')
    return ''.join(out)


def shell(src):
    return open(os.path.join(src, '1_shell.html'), encoding='utf-8').read().rstrip('\n') + '\n'


BOOT = r"""<script>
/* the game's code is one big file: fetched here so the loading screen can show how much of it has arrived, then run as a module */
(function () {
  var SRC = '__SRC__', SIZE = __SIZE__, mb = function (n) { return (n / 1048576).toFixed(1); };
  LD.plan([['dl', 'מוריד את המשחק', 5], ['code', 'מכין את המשחק', 4]], { img: 'img/mezach.jpg', clip: 'mezach' }); LD.step('dl'); LD.note('0.0 מתוך ' + mb(SIZE) + ' מ״ב');
  function fail() { LD.error('ההורדה נכשלה. בדקו את החיבור לאינטרנט ורעננו את הדף.'); }
  function start(s) { LD.step('code'); LD.frac(0.15, 2500); s.type = 'module'; document.body.appendChild(s); }
  function run(code) { var s = document.createElement('script'); s.textContent = code; start(s); }
  function plain() { var s = document.createElement('script'); s.src = SRC; s.onerror = fail; start(s); }   // an old browser: no progress, but it loads
  if (!window.fetch || !window.TextDecoder) return plain();
  fetch(SRC).then(function (r) {
    if (!r.ok) throw new Error('http ' + r.status);
    if (!r.body || !r.body.getReader) return r.text();
    var rd = r.body.getReader(), dec = new TextDecoder(), got = 0, out = [];
    return (function pump() {
      return rd.read().then(function (x) {
        if (x.done) { out.push(dec.decode()); return out.join(''); }
        got += x.value.length; out.push(dec.decode(x.value, { stream: true })); LD.frac(got / SIZE); LD.note(mb(Math.min(got, SIZE)) + ' מתוך ' + mb(SIZE) + ' מ״ב');
        return pump();
      });
    })();
  }).then(run, fail);
})();
</script>
"""


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--src', default=None); ap.add_argument('--single'); ap.add_argument('--mjs'); a = ap.parse_args()
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); src = a.src or os.path.join(root, 'src')
    code = module(src)
    if a.mjs:
        open(a.mjs, 'w', encoding='utf-8').write(''.join(l for l in code.splitlines(True) if not l.startswith('import ')))
    if a.single:
        open(a.single, 'w', encoding='utf-8').write(shell(src) + '<script type="module">\n' + code + '</script>\n')
        print('built', a.single, os.path.getsize(a.single), 'bytes'); return
    docs = os.path.join(root, 'docs'); shutil.rmtree(docs, ignore_errors=True); shutil.copytree(os.path.join(root, 'public'), docs)
    for dp, _, fs in os.walk(docs):
        for f in fs:
            if f == '.gitkeep': os.remove(os.path.join(dp, f))
    # one file name for every version (git keeps it as small changes), with the version in the address so a browser never runs an old copy
    data = code.encode('utf-8'); name = f'game.js?v={hashlib.sha1(data).hexdigest()[:10]}'
    open(os.path.join(docs, 'game.js'), 'wb').write(data)
    page = '<!doctype html>\n<html lang="he">\n<meta charset="utf-8">\n' + shell(src) + BOOT.replace('__SRC__', name).replace('__SIZE__', str(len(data)))
    open(os.path.join(docs, 'index.html'), 'w', encoding='utf-8').write(page)
    open(os.path.join(docs, '.nojekyll'), 'w').close()
    print('built docs/index.html', len(page.encode()), 'bytes +', name, len(data), 'bytes')


if __name__ == '__main__':
    main()
