"""mesh.py - the python side of the asset pipeline: read conv.mjs output (or a GLB), weld, simplify with meshoptimizer, draw a preview.
A part is a dict: P (n,3) float32 positions, N (n,3) normals, U (n,2) uvs, I (m,) uint32 indices, mat (dict)."""
import json, ctypes, os, sys
import numpy as np
from PIL import Image, ImageDraw
MO = ctypes.CDLL('/home/claude/tools_src/meshoptimizer/libmeshopt.so')
MO.meshopt_simplify.restype = ctypes.c_size_t
MO.meshopt_simplifySloppy.restype = ctypes.c_size_t
J = '/home/claude/yk_assets/j/'

def load(name):
    meta = json.load(open(J + name + '.json')); buf = open(J + name + '.bin', 'rb').read(); parts = []
    for m in meta['meshes']:
        arr = lambda o, k: np.frombuffer(buf, dtype=np.float32, count=o[1], offset=o[0]).reshape(-1, k).copy()
        P, N, U = arr(m['P'], 3), arr(m['N'], 3), arr(m['U'], 2)
        parts.append(weld({'P': P, 'N': N, 'U': U, 'mat': m['mat'], 'name': m['name']}))
    return parts

def load_glb(path, tex_dir=None):
    """read a .glb into the same parts as load(): every triangle primitive baked into world space by its node, one part each.
    Embedded images are written once to tex_dir (default x/glb/<file name>/) and named in the part's mat: 'map_path', 'nmap_path'.
    Draco-compressed meshes cannot be read here (no decoder): they raise. glTF uvs run down, so pack.add needs uv_flip=True."""
    sys.path.insert(0, '/home/claude/yom-kipor-war/tools/chars'); import gltf
    j, b = gltf.load(path)
    if 'KHR_draco_mesh_compression' in (j.get('extensionsRequired') or []): raise ValueError(path + ': Draco-compressed, no decoder here')
    stem = os.path.splitext(os.path.basename(path))[0]; tex_dir = tex_dir or ('/home/claude/yk_assets/x/glb/' + stem); imgs = {}
    def image(ti):
        if ti is None: return None
        si = j['textures'][ti].get('source'); im = j['images'][si]
        if si in imgs: return imgs[si]
        if 'bufferView' in im:
            bv = j['bufferViews'][im['bufferView']]; ext = '.jpg' if 'jpeg' in im.get('mimeType', '') else '.png'
            out = os.path.join(tex_dir, (im.get('name') or 'img%d' % si).replace('/', '_') + ext)
            if not os.path.exists(out):
                os.makedirs(tex_dir, exist_ok=True); o = bv.get('byteOffset', 0); open(out, 'wb').write(b[o:o + bv['byteLength']])
        else: out = os.path.join(os.path.dirname(path), im['uri'])
        imgs[si] = out; return out
    W, _ = gltf.node_mats(j); parts = []
    roots = j['scenes'][j.get('scene', 0)]['nodes'] if j.get('scenes') else range(len(j['nodes']))
    todo = list(roots); seen = []
    while todo: i = todo.pop(0); seen.append(i); todo += j['nodes'][i].get('children', [])
    for ni in seen:
        nd = j['nodes'][ni]
        if 'mesh' not in nd: continue
        M = W[ni]; R = M[:3, :3]; Ni = np.linalg.inv(R).T; flip = np.linalg.det(R) < 0
        for pr in j['meshes'][nd['mesh']]['primitives']:
            if pr.get('mode', 4) != 4: continue
            at = pr['attributes']; P = gltf.acc(j, b, at['POSITION']).astype(np.float64)
            I = gltf.acc(j, b, pr['indices']).ravel().astype(np.int64) if 'indices' in pr else np.arange(len(P))
            if flip: I = I.reshape(-1, 3)[:, [0, 2, 1]].ravel()
            N = gltf.acc(j, b, at['NORMAL']).astype(np.float64) if 'NORMAL' in at else None
            U = gltf.acc(j, b, at['TEXCOORD_0']).astype(np.float32) if 'TEXCOORD_0' in at else np.zeros((len(P), 2), np.float32)
            P = P @ R.T + M[:3, 3]
            if N is None:   # smooth normals from the faces
                T = P[I.reshape(-1, 3)]; fn = np.cross(T[:, 1] - T[:, 0], T[:, 2] - T[:, 0]); N = np.zeros_like(P)
                for k in range(3): np.add.at(N, I.reshape(-1, 3)[:, k], fn)
            else: N = N @ Ni.T
            N = N / (np.linalg.norm(N, axis=1, keepdims=True) + 1e-12)
            mt = j['materials'][pr['material']] if 'material' in pr else {}; pbr = mt.get('pbrMetallicRoughness', {}); cf = pbr.get('baseColorFactor', [0.8, 0.8, 0.8, 1])
            col = sum(int(round(min(1.0, max(0.0, c)) ** (1 / 2.2) * 255)) << s for c, s in zip(cf[:3], (16, 8, 0)))
            mat = {'name': mt.get('name', 'mat%d' % pr.get('material', 0)), 'color': col, 'map': None, 'normal': None,
                   'map_path': image((pbr.get('baseColorTexture') or {}).get('index')), 'nmap_path': image((mt.get('normalTexture') or {}).get('index'))}
            parts.append(weld({'P': P[I].astype(np.float32), 'N': N[I].astype(np.float32), 'U': U[I], 'mat': mat, 'name': j['meshes'][nd['mesh']].get('name') or nd.get('name', '')}))
    return parts

def weld(p):
    """index a triangle soup: vertices equal in position, normal (to 1/100) and uv (to 1/4096) become one"""
    P, N, U = p['P'], p['N'], p['U']
    key = np.concatenate([np.round(P * 1e4), np.round(N * 100), np.round(U * 4096)], axis=1).astype(np.int64)
    _, first, inv = np.unique(key, axis=0, return_index=True, return_inverse=True)
    q = dict(p); q['P'] = P[first]; q['N'] = N[first]; q['U'] = U[first]; q['I'] = inv.astype(np.uint32).ravel(); return q

def simplify(p, ratio, err=0.02, sloppy=False):
    """keep about `ratio` of the triangles (meshoptimizer, borders locked so pieces do not open)"""
    I = np.ascontiguousarray(p['I'], dtype=np.uint32); P = np.ascontiguousarray(p['P'], dtype=np.float32)
    target = max(3, int(len(I) * ratio) // 3 * 3); out = np.zeros(len(I), dtype=np.uint32); e = ctypes.c_float(0)
    ext = float(np.ptp(P, axis=0).max()) or 1.0
    if sloppy: n = MO.meshopt_simplifySloppy(out.ctypes.data_as(ctypes.c_void_p), I.ctypes.data_as(ctypes.c_void_p), ctypes.c_size_t(len(I)), P.ctypes.data_as(ctypes.c_void_p), ctypes.c_size_t(len(P)), ctypes.c_size_t(12), None, ctypes.c_size_t(target), ctypes.c_float(err), ctypes.byref(e))
    else: n = MO.meshopt_simplify(out.ctypes.data_as(ctypes.c_void_p), I.ctypes.data_as(ctypes.c_void_p), ctypes.c_size_t(len(I)), P.ctypes.data_as(ctypes.c_void_p), ctypes.c_size_t(len(P)), ctypes.c_size_t(12), ctypes.c_size_t(target), ctypes.c_float(err), ctypes.c_uint(1), ctypes.byref(e))
    q = dict(p); q['I'] = out[:n].copy(); return compact(q)

def compact(p):
    used = np.unique(p['I']); remap = np.full(len(p['P']), -1, dtype=np.int64); remap[used] = np.arange(len(used))
    q = dict(p); q['P'] = p['P'][used]; q['N'] = p['N'][used]; q['U'] = p['U'][used]; q['I'] = remap[p['I']].astype(np.uint32); return q

def tris(parts): return sum(len(p['I']) // 3 for p in parts)

def bbox(parts):
    allp = np.concatenate([p['P'] for p in parts]); return allp.min(0), allp.max(0)

def transform(parts, M):
    """apply a 4x4 matrix (numpy) to every part: positions and normals"""
    R = M[:3, :3]; Ni = np.linalg.inv(R).T; out = []
    for p in parts:
        q = dict(p); q['P'] = (p['P'] @ R.T + M[:3, 3]).astype(np.float32); n = p['N'] @ Ni.T; q['N'] = (n / (np.linalg.norm(n, axis=1, keepdims=True) + 1e-9)).astype(np.float32); out.append(q)
    return out

def preview(parts, path, size=360, yaw=0.7, pitch=0.45, cols=None, title=''):
    """a quick look: flat-shaded triangles drawn back to front from three quarters above"""
    img = Image.new('RGB', (size, size), (52, 56, 60)); d = ImageDraw.Draw(img)
    cy, sy, cp, sp = np.cos(yaw), np.sin(yaw), np.cos(pitch), np.sin(pitch)
    R = np.array([[cy, 0, -sy], [0, 1, 0], [sy, 0, cy]]) ; Rp = np.array([[1, 0, 0], [0, cp, -sp], [0, sp, cp]]); V = Rp @ R
    lo, hi = bbox(parts); c = (lo + hi) / 2; s = (size * 0.8) / max(1e-6, float(np.max(hi - lo)) * 1.25)
    L = np.array([0.4, 0.8, 0.45]); L /= np.linalg.norm(L); polys = []
    for k, p in enumerate(parts):
        col = np.array(cols[k] if cols else [(p['mat'].get('color', 0xbbbbbb) >> 16) & 255, (p['mat'].get('color', 0xbbbbbb) >> 8) & 255, p['mat'].get('color', 0xbbbbbb) & 255], dtype=float)
        if col.sum() > 700 or col.sum() < 40: col = np.array([185, 178, 165.])
        Q = (p['P'] - c) @ V.T; T = Q[p['I'].reshape(-1, 3)]
        n = np.cross(T[:, 1] - T[:, 0], T[:, 2] - T[:, 0]); n /= (np.linalg.norm(n, axis=1, keepdims=True) + 1e-12)
        sh = 0.35 + 0.65 * np.abs(n @ (V @ L)); z = T[:, :, 2].mean(1)
        for t in range(len(T)): polys.append((z[t], [(size / 2 + T[t, i, 0] * s, size / 2 - T[t, i, 1] * s) for i in range(3)], tuple((col * sh[t]).astype(int))))
    polys.sort(key=lambda a: a[0])
    for _, pts, cl in polys: d.polygon(pts, fill=cl)
    if title: d.text((6, 6), title, fill=(255, 255, 210))
    img.save(path); return img
