"""pack_trench.py - the stronghold's combat trenches from Quixel Megascans scans (Fab, Standard licence): the mixed revetment wall (planks,
corrugated iron, earth on top), the canvas sandbag barrier, and the dry sand surface for the ground. Writes src/4f_data_trench.js.

    python3 tools/assets/pack_trench.py

The scans' earth is the brown of a European field: it is moved to the sand of Sinai in the wall's colour map (only earth-coloured pixels move,
the wood and the iron keep theirs). The sand surface goes in as a detail map (its colour divided by its mean, stored linear around 0.5),
so the ground keeps the game's own palette and gets the scan's grain."""
import glob, io, base64, os, sys
import numpy as np
from PIL import Image, ImageFilter
sys.path.insert(0, os.path.dirname(__file__)); import mesh
from pack import Pack, texjpg

DL = '/mnt/user-data/uploads/Downloads/'; W = '/home/claude/yk_assets/trench/'
os.makedirs(W, exist_ok=True)

def sand_tint(src, dst, size=1024):
    im = Image.open(src).convert('RGB').resize((size, size), Image.LANCZOS); a = np.asarray(im).astype(np.float32) / 255
    r, g, b = a[..., 0], a[..., 1], a[..., 2]; mx = a.max(-1); mn = a.min(-1); sat = (mx - mn) / (mx + 1e-5); lum = 0.3 * r + 0.59 * g + 0.11 * b
    earth = ((r >= g) & (g >= b * 0.95) & (sat > 0.24) & (sat < 0.8) & (lum < 0.68)).astype(np.float32)
    earth = np.asarray(Image.fromarray((earth * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.5))).astype(np.float32) / 255
    sand = np.array([0.80, 0.70, 0.52]); tgt = np.clip(lum[..., None] / 0.42 * sand * 0.92 + 0.05, 0, 1)
    out = a * (1 - earth[..., None] * 0.85) + tgt * earth[..., None] * 0.85
    Image.fromarray((np.clip(out, 0, 1) * 255).astype(np.uint8)).save(dst, quality=92)
    return dst

def jpg(im, q=82):
    b = io.BytesIO(); im.save(b, 'JPEG', quality=q, optimize=True); return 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()

pk = Pack('trench')
glb = lambda k: glob.glob(DL + 'military_trenches_' + k + '*.glb')[0]

# the wall: x along the trench (2.5 m), +z its face (into the trench), standing on y = 0
parts = mesh.load_glb(glob.glob(DL + 'military_trenches_wall_mixed*.glb')[0]); m0 = parts[0]['mat']
pk.add('tr_wall', parts=parts, tex={'*': {'map': sand_tint(m0['map_path'], W + 'wall_col.jpg'), 'nmap': m0['nmap_path'], 'rough': 0.92}}, texsize=1024, uv_flip=True, preview=False)

# the sandbags: a row of canvas bags 4.1 m long, 0.96 deep, 0.65 high
bparts = mesh.load_glb(glb('barrier_sandbag')); b0 = bparts[0]['mat']
def burlap(src, dst, size=1024):
    # the scan's canvas is a dark muddy brown: the light and shade of it kept, the colour moved to the pale khaki of sun-bleached sandbags
    a = np.asarray(Image.open(src).convert('RGB').resize((size, size), Image.LANCZOS)).astype(np.float32) / 255
    lum = (0.3 * a[..., 0] + 0.59 * a[..., 1] + 0.11 * a[..., 2])[..., None]; k = lum / max(1e-3, float(np.median(lum)))
    tgt = np.array([0.56, 0.48, 0.35]) * np.clip(0.55 + 0.45 * k, 0, 1.6); out = a * 0.3 + tgt * 0.7
    Image.fromarray((np.clip(out, 0, 1) * 255).astype(np.uint8)).save(dst, quality=92); return dst
pk.add('tr_bags', parts=bparts, tex={'*': {'map': burlap(b0['map_path'], W + 'bags_col.jpg'), 'nmap': b0['nmap_path'], 'rough': 0.95}}, texsize=1024, uv_flip=True, preview=False)

# far levels: the same placement as the near one (pack centres and grounds the near level; the far one is moved the same way)
from pack import encode
for name, src, cell in (('tr_wall', glob.glob(DL + 'military_trenches_wall_mixed*.glb')[0], 0.1), ('tr_bags', glb('barrier_sandbag'), 0.08)):
    ps = mesh.load_glb(src); lo, hi = mesh.bbox(ps); off = np.array([-(lo[0] + hi[0]) / 2, -lo[1], -(lo[2] + hi[2]) / 2], dtype=np.float32)
    lv = []
    for p in ps:
        q = dict(p); q['P'] = (p['P'] + off).astype(np.float32); q['U'] = np.c_[p['U'][:, 0], 1 - p['U'][:, 1]].astype(np.float32); lv.append(mesh.cluster(q, cell, 0.03))
    pk.models[name]['lods'].append([dict(encode(p), m=0) for p in lv])

# the sand surface: a detail map (colour / mean, linear, around 0.5) and its normal map, both 1K
col = Image.open(glob.glob(W + 'Dry_Sand*BaseColor.jpg')[0]).convert('RGB').resize((1024, 1024), Image.LANCZOS); a = np.asarray(col).astype(np.float32)
lum = a.mean(-1, keepdims=True); det = a / a.reshape(-1, 3).mean(0) * 0.5; det = det * 0.35 + (lum / lum.mean() * 0.5) * 0.65   # mostly the grain's light and shade, a little of its colour
pk.tex['trench/sand/det'] = jpg(Image.fromarray(np.clip(det * 255, 0, 255).astype(np.uint8)), 86)
pk.tex['trench/sand/nmap'] = jpg(Image.open(glob.glob(W + 'Dry_Sand*Normal.jpg')[0]).convert('RGB').resize((1024, 1024), Image.LANCZOS), 88)
# the trench's earth faces: the sand in the game's colour (sRGB)
tint = a.reshape(-1, 3).mean(0); sand = np.array([205, 187, 149], np.float32)
pk.tex['trench/sand/earth'] = jpg(Image.fromarray(np.clip(a / tint * sand, 0, 255).astype(np.uint8)), 84)
pk.write()
