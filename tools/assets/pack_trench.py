"""pack_trench.py - the stronghold's combat trenches: the post of a Megascans plank fence (Fab, Standard licence) for the revetment, the
user's own board and trench-floor textures (Google Flow), and the Megascans dry sand for the ground. Writes src/4f_data_trench.js.

    python3 tools/assets/pack_trench.py

The sand surface goes in as a detail map (its colour divided by its mean, stored linear around 0.5),
so the ground keeps the game's own palette and gets the scan's grain."""
import glob, io, base64, os, sys
import numpy as np
from PIL import Image, ImageFilter
sys.path.insert(0, os.path.dirname(__file__)); import mesh
from pack import Pack, texjpg

DL = '/mnt/user-data/uploads/Downloads/'; W = '/home/claude/yk_assets/trench/'
os.makedirs(W, exist_ok=True)

def jpg(im, q=82):
    b = io.BytesIO(); im.save(b, 'JPEG', quality=q, optimize=True); return 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()

pk = Pack('trench')

# the revetment's posts: the post of the Megascans plank fence alone (every triangle of it lies at x < 0.1, the rails run off to +x), cut
# off at 1.07 m where the rails' stubs begin; a far level clustered from it
fence = glob.glob(DL + 'modular_wooden_fence*.glb')[0]
def post_parts():
    ps = mesh.load_glb(fence); out = []
    for p in ps:
        T = p['I'].reshape(-1, 3); keep = (p['P'][T][:, :, 0] < 0.1).all(1) & (p['P'][T][:, :, 1] < 1.07).all(1); q = dict(p); q['I'] = T[keep].ravel().astype(np.uint32); q = mesh.compact(q)
        if len(q['I']): out.append(q)
    return out, ps[0]['mat']
pparts, pm = post_parts()
pk.add('post', parts=pparts, tex={'*': {'map': pm['map_path'], 'nmap': pm.get('nmap_path'), 'rough': 0.9}}, texsize=512, uv_flip=True, preview=False)
from pack import encode
lo, hi = mesh.bbox(pparts); off = np.array([-(lo[0] + hi[0]) / 2, -lo[1], -(lo[2] + hi[2]) / 2], dtype=np.float32); lv = []
for p in pparts:
    q = dict(p); q['P'] = (p['P'] + off).astype(np.float32); q['U'] = np.c_[p['U'][:, 0], 1 - p['U'][:, 1]].astype(np.float32); lv.append(mesh.cluster(q, 0.08, 0.05))
pk.models['post']['lods'].append([dict(encode(p), m=0) for p in lv])

# the boards and the floor: textures the user made (Google Flow), crossfaded across their seams to tile, normals from their light and shade
# (saved from the trench test page as yk_assets/trench/flow_*.jpg)
for k in ('plank2', 'floor'):
    for m in ('map', 'nmap'): pk.tex['tp/%s/%s' % (k, m)] = 'data:image/jpeg;base64,' + base64.b64encode(open(W + 'flow_%s_%s.jpg' % (k, m), 'rb').read()).decode()

# the sand surface: a detail map (colour / mean, linear, around 0.5) and its normal map, both 1K
col = Image.open(glob.glob(W + 'Dry_Sand*BaseColor.jpg')[0]).convert('RGB').resize((1024, 1024), Image.LANCZOS); a = np.asarray(col).astype(np.float32)
lum = a.mean(-1, keepdims=True); det = a / a.reshape(-1, 3).mean(0) * 0.5; det = det * 0.35 + (lum / lum.mean() * 0.5) * 0.65   # mostly the grain's light and shade, a little of its colour
pk.tex['trench/sand/det'] = jpg(Image.fromarray(np.clip(det * 255, 0, 255).astype(np.uint8)), 86)
pk.tex['trench/sand/nmap'] = jpg(Image.open(glob.glob(W + 'Dry_Sand*Normal.jpg')[0]).convert('RGB').resize((1024, 1024), Image.LANCZOS), 88)
# the trench's earth faces: the sand in the game's colour (sRGB)
tint = a.reshape(-1, 3).mean(0); sand = np.array([205, 187, 149], np.float32)
pk.tex['trench/sand/earth'] = jpg(Image.fromarray(np.clip(a / tint * sand, 0, 255).astype(np.uint8)), 84)
pk.write()
