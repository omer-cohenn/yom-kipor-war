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
pk.write()
