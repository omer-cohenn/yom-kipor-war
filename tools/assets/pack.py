"""pack.py - turn converted models into the game's compact model data (read by src/4f_models.js).

    from pack import Pack
    pk = Pack('ground')                         # writes src/4f_data_ground.js
    pk.add('rock_a', src='rock_04', size=('y', 1.6), lods=[400, 150, 60], tex={'*': {'map': 'x/.../rock_04_BaseColor.png'}}, texsize=256)
    pk.write()

A model: its parts (one per material) in up to three levels of detail. Positions are made to stand on y = 0, centred on x/z unless
center=False, scaled so the named axis has the given length in metres (or scale=k), turned first by rot=(rx, ry, rz) degrees.
lods: triangle targets (or ratios <= 1) for each level. tex: material name (or '*') -> {'map': path, 'nmap': path, 'color': 0xrrggbb}.
uv_flip=True for glTF sources (their v runs down) so every model uses three's default flipY textures."""
import json, base64, io, os, sys
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(__file__)); import mesh
SRC = '/home/claude/yom-kipor-war/src/'

def b64(a): return base64.b64encode(np.ascontiguousarray(a).tobytes()).decode()

def rotm(rx, ry, rz):
    rx, ry, rz = np.radians([rx, ry, rz]); cx, sx, cy, sy, cz, sz = np.cos(rx), np.sin(rx), np.cos(ry), np.sin(ry), np.cos(rz), np.sin(rz)
    X = np.array([[1, 0, 0], [0, cx, -sx], [0, sx, cx]]); Y = np.array([[cy, 0, sy], [0, 1, 0], [-sy, 0, cy]]); Z = np.array([[cz, -sz, 0], [sz, cz, 0], [0, 0, 1]])
    M = np.eye(4); M[:3, :3] = Z @ Y @ X; return M

def texjpg(path, size, quality=80, normal=False):
    im = Image.open(path); im = im.convert('RGB')
    s = min(size, max(im.size)); im = im.resize((s, s), Image.LANCZOS)
    b = io.BytesIO(); im.save(b, 'JPEG', quality=quality, optimize=True); return 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()

def encode(p):
    P, N, U, I = p['P'], p['N'], p['U'], p['I']
    lo = P.min(0); sc = np.maximum(P.max(0) - lo, 1e-6); q = np.round((P - lo) / sc * 65535).astype(np.uint16)
    n = np.round(np.clip(N, -1, 1) * 127).astype(np.int8)
    ulo = U.min(0); usc = np.maximum(U.max(0) - ulo, 1e-6); uq = np.round((U - ulo) / usc * 65535).astype(np.uint16)
    idx = I.astype(np.uint16) if len(P) < 65536 else I.astype(np.uint32)
    return {'n': int(len(P)), 't': int(len(I) // 3), 'lo': [round(float(v), 5) for v in lo], 'sc': [float('%.6g' % v) for v in sc], 'ulo': [round(float(v), 5) for v in ulo], 'usc': [float('%.6g' % v) for v in usc],
            'p': b64(q), 'nr': b64(n), 'uv': b64(uq), 'i': b64(idx), 'i32': int(len(P) >= 65536)}

class Pack:
    def __init__(self, group):
        self.group = group; self.models = {}; self.tex = {}

    def add(self, name, src=None, parts=None, rot=(0, 0, 0), size=None, scale=None, center=True, ground=True, lods=(1.0,), tex=None, texsize=256, keep=None, drop=None, uv_flip=False, merge=True, preview=True, err=0.05):
        if parts is None: parts = mesh.load(src)
        if keep: parts = [p for p in parts if any(k in (p.get('name') or '') or k in p['mat'].get('name', '') for k in keep)]
        if drop: parts = [p for p in parts if not any(k in (p.get('name') or '') or k in p['mat'].get('name', '') for k in drop)]
        parts = mesh.transform(parts, rotm(*rot))
        lo, hi = mesh.bbox(parts)
        k = scale if scale else (size[1] / max(1e-9, (hi - lo)['xyz'.index(size[0])]) if size else 1.0)
        M = np.eye(4); M[:3, :3] *= k; parts = mesh.transform(parts, M); lo, hi = mesh.bbox(parts)
        off = np.array([-(lo[0] + hi[0]) / 2 if center else 0, -lo[1] if ground else 0, -(lo[2] + hi[2]) / 2 if center else 0]); T = np.eye(4); T[:3, 3] = off; parts = mesh.transform(parts, T)
        if uv_flip:
            for p in parts: p['U'] = p['U'].copy(); p['U'][:, 1] = 1 - p['U'][:, 1]
        # one part per material: the materials named in tex keep their own part, every other material falls to '*'
        tex = tex or {}; mats = []; byk = {}
        for p in parts:
            mk = p['mat'].get('name', '') if p['mat'].get('name', '') in tex else '*'
            if mk not in byk: byk[mk] = []; mats.append(mk)
            byk[mk].append(p)
        merged = []
        for mk in mats:
            ps = byk[mk]; off_i = 0; P, N, U, I = [], [], [], []
            for p in ps: P.append(p['P']); N.append(p['N']); U.append(p['U']); I.append(p['I'] + off_i); off_i += len(p['P'])
            merged.append({'P': np.concatenate(P), 'N': np.concatenate(N), 'U': np.concatenate(U), 'I': np.concatenate(I).astype(np.uint32), 'mat': {'name': mk}, 'mk': mk})
        total = mesh.tris(merged); levels = []
        for L in lods:
            ratio = L if L <= 1 else min(1.0, L / max(1, total))
            lv = [p if ratio >= 0.999 else mesh.simplify(p, ratio, err) for p in merged]
            if mesh.tris(lv) > (L if L > 1 else total * L) * 1.6 and ratio < 0.999: lv = [mesh.simplify(p, ratio, err * 4, sloppy=True) for p in merged]
            levels.append(lv)
        matl = []
        for mk in mats:
            t = tex.get(mk, tex.get('*', {})); m = {'color': t.get('color', 0xffffff), 'rough': t.get('rough', 0.85), 'metal': t.get('metal', 0.0)}
            for kk in ('map', 'nmap'):
                if t.get(kk):
                    key = self.group + '/' + name + '/' + kk + '/' + os.path.basename(t[kk])
                    if key not in self.tex: self.tex[key] = texjpg(t[kk], t.get('size', texsize), normal=kk == 'nmap')
                    m[kk] = key
            matl.append(m)
        lo, hi = mesh.bbox(levels[0])
        self.models[name] = {'box': [round(float(v), 3) for v in (hi - lo)], 'mats': matl, 'lods': [[dict(encode(p), m=j) for j, p in enumerate(lv)] for lv in levels]}
        if preview:
            os.makedirs('/home/claude/yk_assets/prev/pk', exist_ok=True)
            mesh.preview(levels[0], f'/home/claude/yk_assets/prev/pk/{name}.png', 280, title=f"{name} {[mesh.tris(l) for l in levels]} {np.round(hi - lo, 2).tolist()}")
        return self.models[name]

    def write(self):
        path = SRC + f'4f_data_{self.group}.js'
        s = (f"/* ================= model data: {self.group} - written by tools/assets/pack.py, do not edit by hand ================= */\n"
             f"MDL_ADD({json.dumps(self.models, separators=(',', ':'))}, {json.dumps(self.tex, separators=(',', ':'))});\n")
        open(path, 'w').write(s); print('wrote', path, len(s) // 1024, 'KB', {k: [l[0]['t'] if len(l) == 1 else sum(p['t'] for p in l) for l in v['lods']] for k, v in self.models.items()})
