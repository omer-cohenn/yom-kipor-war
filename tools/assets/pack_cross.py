"""pack_cross.py - the crossing's scanned pieces (Megascans, Fab, Standard licence): the wooden fence round the fields, and the branches the
trees are built of (Desert Acacia: four cut branches on one sheet) before they are photographed into pictures in the game. Writes src/4f_data_cross.js.

    python3 tools/assets/pack_cross.py

The branch colour has its background filled from the leaves outwards (so mipmaps carry no grey halo); its opacity goes as a second JPEG
the material reads as an alpha map."""
import glob, io, base64, os, sys
import numpy as np
from PIL import Image, ImageFilter
sys.path.insert(0, os.path.dirname(__file__)); import mesh
from pack import Pack

DL = '/mnt/user-data/uploads/Downloads/'; W = '/home/claude/yk_assets/cross/'
def jpg(im, q=84):
    b = io.BytesIO(); im.save(b, 'JPEG', quality=q, optimize=True); return 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()

pk = Pack('cross')
# the fence: one 1.66 m section (its post at x = 0, its rails running to +x); the lone post of the scan is not needed
fence = glob.glob(DL + 'modular_wooden_fence*.glb')[0]
parts = mesh.load_glb(fence); sec = [p for p in parts if p['P'][:, 0].max() > 1.0]
pk.add('fence', parts=sec, center=False, lods=[1.0], tex={'*': {'map': sec[0]['mat']['map_path'], 'nmap': sec[0]['mat'].get('nmap_path'), 'rough': 0.92}}, texsize=512, uv_flip=True, preview=False)

from pack import encode   # a far level clustered from it (meshoptimizer is not in this workspace)
lo, hi = mesh.bbox(sec); off = np.array([0, -lo[1], 0], dtype=np.float32); lv = []
for p in sec:
    q = dict(p); q['P'] = (p['P'] + off).astype(np.float32); q['U'] = np.c_[p['U'][:, 0], 1 - p['U'][:, 1]].astype(np.float32); lv.append(mesh.cluster(q, 0.06, 0.04))
pk.models['fence']['lods'].append([dict(encode(p), m=0) for p in lv])

# the branches: 1024 square, colour bled out under the cut-outs
S = 1024
col = Image.open(glob.glob(W + '*BaseColor.jpg')[0]).convert('RGB').resize((S, S), Image.LANCZOS)
op = Image.open(glob.glob(W + '*Opacity.jpg')[0]).convert('L').resize((S, S), Image.LANCZOS)
a = np.asarray(col).astype(np.float32); m = (np.asarray(op) > 110).astype(np.float32)[..., None]
acc, wt = a * m, m.copy()
for r in (2, 4, 8, 16, 32, 64):
    A = Image.fromarray(np.clip(acc / np.maximum(wt, 1e-4), 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(r)); Wt = Image.fromarray((np.clip(wt[..., 0], 0, 1) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(r))
    wb = np.asarray(Wt).astype(np.float32)[..., None] / 255; ab = np.asarray(A).astype(np.float32)
    fill = (wt < 0.5); acc = np.where(fill, ab * wb, acc); wt = np.where(fill, wb, wt)
out = np.where(m > 0.5, a, acc / np.maximum(wt, 1e-4))
pk.tex['cross/branch/map'] = jpg(Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)), 86)
pk.tex['cross/branch/alpha'] = jpg(op, 88)
pk.tex['cross/branch/nmap'] = jpg(Image.open(glob.glob(W + '*Normal.jpg')[0]).convert('RGB').resize((S // 2, S // 2), Image.LANCZOS), 84)

# the ground under the test page and the fields: the Megascans cracked soil and dry sand as detail maps (colour over its mean, around 0.5) and normals
def detail(path, size=1024):
    a = np.asarray(Image.open(path).convert('RGB').resize((size, size), Image.LANCZOS)).astype(np.float32); lum = a.mean(-1, keepdims=True)
    det = a / a.reshape(-1, 3).mean(0) * 0.5 * 0.35 + (lum / lum.mean() * 0.5) * 0.65; return jpg(Image.fromarray(np.clip(det * 255, 0, 255).astype(np.uint8)), 86)
pk.tex['cross/soil/det'] = detail(glob.glob(W + '*Soil*BaseColor.jpg')[0] if glob.glob(W + '*Soil*BaseColor.jpg') else glob.glob(W + '*okoso0*BaseColor.jpg')[0])
pk.tex['cross/soil/nmap'] = jpg(Image.open((glob.glob(W + '*Soil*Normal.jpg') or glob.glob(W + '*okoso0*Normal.jpg'))[0]).convert('RGB').resize((1024, 1024), Image.LANCZOS), 86)
T = '/home/claude/yk_assets/trench/'
pk.tex['cross/sand/det'] = detail(glob.glob(T + 'Dry_Sand*BaseColor.jpg')[0])
pk.tex['cross/sand/nmap'] = jpg(Image.open(glob.glob(T + 'Dry_Sand*Normal.jpg')[0]).convert('RGB').resize((1024, 1024), Image.LANCZOS), 86)

# the wheat: the Megascans scan's billboard sheet (eight clumps, four on each of two rows), colour bled under the cut-outs, and its opacity
WH = '/home/claude/yk_assets/cross/wheat/'
def bled(colp, opp, S):
    col = Image.open(colp).convert('RGB').resize((S, S), Image.LANCZOS); op = Image.open(opp).convert('L').resize((S, S), Image.LANCZOS)
    a = np.asarray(col).astype(np.float32); m = (np.asarray(op) > 100).astype(np.float32)[..., None]; acc, wt = a * m, m.copy()
    for r in (2, 4, 8, 16, 32, 64):
        A = Image.fromarray(np.clip(acc / np.maximum(wt, 1e-4), 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(r)); Wt = Image.fromarray((np.clip(wt[..., 0], 0, 1) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(r))
        wb = np.asarray(Wt).astype(np.float32)[..., None] / 255; ab = np.asarray(A).astype(np.float32); fill = (wt < 0.5); acc = np.where(fill, ab * wb, acc); wt = np.where(fill, wb, wt)
    return Image.fromarray(np.clip(np.where(m > 0.5, a, acc / np.maximum(wt, 1e-4)), 0, 255).astype(np.uint8)), op
c, o = bled(WH + 'Wheat_slBiJ_Mid_2K_Billboard_BaseColor.jpg', WH + 'Wheat_slBiJ_Mid_2K_Billboard_Opacity.jpg', 1024)
pk.tex['cross/wheat/map'] = jpg(c, 86); pk.tex['cross/wheat/alpha'] = jpg(o, 88)

# the grass: the user's 'Trava Kolosok' (a patch of 332 blades, each one quad on a sheet of blades; the 'Cut' sheet is its opacity).
# The blades go in shuffled so that the first third of the triangles is a thinner patch of its own (the game draws only that further off)
TK = '/home/claude/yk_assets/cross/trava/'
def obj_parts(path):
    V, T, F = [], [], []
    for ln in open(path, encoding='latin1'):
        a = ln.split()
        if not a: continue
        if a[0] == 'v': V.append([float(x) for x in a[1:4]])
        elif a[0] == 'vt': T.append([float(x) for x in a[1:3]])
        elif a[0] == 'f': F.append([[int(i) if i else 0 for i in (c.split('/') + ['', ''])[:2]] for c in a[1:]])
    V, T = np.array(V, np.float32), np.array(T, np.float32); rs = np.random.RandomState(7); order = rs.permutation(len(F)); P, U = [], []
    for fi in order:
        f = F[fi]
        for k in range(1, len(f) - 1):
            for c in (f[0], f[k], f[k + 1]): P.append(V[c[0] - 1]); U.append(T[c[1] - 1] if c[1] else [0, 0])
    P = np.array(P, np.float32); U = np.array(U, np.float32); N = np.tile(np.array([0, 1, 0], np.float32), (len(P), 1))
    return [{'P': P, 'N': N, 'U': U, 'I': np.arange(len(P), dtype=np.uint32), 'mat': {'name': '*'}}]
tp = obj_parts(TK + 'Trava Kolosok.obj')
pk.add('trava', parts=tp, size=('y', 0.75), lods=[1.0], tex={'*': {'rough': 0.9}}, preview=False, merge=False) if False else None
from pack import encode
P = tp[0]['P']; lo, hi = P.min(0), P.max(0); k = 0.75 / (hi[1] - lo[1]); P2 = (P - np.array([(lo[0] + hi[0]) / 2, lo[1], (lo[2] + hi[2]) / 2])) * k
q = dict(tp[0]); q['P'] = P2.astype(np.float32); pk.models['trava'] = {'box': [round(float(v), 3) for v in (P2.max(0) - P2.min(0))], 'mats': [{'color': 0xffffff, 'rough': 0.9, 'metal': 0.0}], 'lods': [[dict(encode(q), m=0)]]}
c, o = bled(TK + 'Trava Kolosok.jpg', TK + 'Trava Kolosok Cut.jpg', 1024)
pk.tex['cross/trava/map'] = jpg(c, 86); pk.tex['cross/trava/alpha'] = jpg(o, 88)

# the bark: the user's eucalyptus bark picture (Flow), made to tile both ways by cross-fading each edge into the opposite one, for every tree
def seamless(a, B):
    a = a.astype(np.float32); H, W = a.shape[:2]; t = np.linspace(0, 1, B)[None, :, None]
    a = np.concatenate([a[:, W - B:] * (1 - t) + a[:, :B] * t, a[:, B:W - B]], 1); t = np.linspace(0, 1, B)[:, None, None]; H = a.shape[0]
    return np.concatenate([a[H - B:] * (1 - t) + a[:B] * t, a[B:H - B]], 0)
bk = seamless(np.asarray(Image.open('/mnt/user-data/uploads/d433c059-image.jpg').convert('RGB')), 56)
bim = Image.fromarray(np.clip(bk, 0, 255).astype(np.uint8)).resize((512, 1024), Image.LANCZOS)
pk.tex['cross/bark/map'] = jpg(bim, 88); pk.tex['cross/bark/bump'] = jpg(bim.convert('L'), 86)
pk.write()
