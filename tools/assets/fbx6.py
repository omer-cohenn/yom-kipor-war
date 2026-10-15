"""fbx6.py IN OUTPREFIX - read an old binary FBX (6.x, which three's FBXLoader refuses) and write the same OUT.json/.bin as conv.mjs.
Takes every Model of type Mesh: its Vertices, PolygonVertexIndex (fans into triangles), normals and uvs (ByPolygonVertex / ByVertice,
Direct / IndexToDirect), its per-polygon material, and its local translation / rotation / scaling (no parent chains - these exports are flat)."""
import sys, struct, zlib, json, os
import numpy as np

def read_props(b, o, n):
    props = []
    for _ in range(n):
        t = chr(b[o]); o += 1
        if t == 'Y': props.append(struct.unpack_from('<h', b, o)[0]); o += 2
        elif t == 'C': props.append(b[o] != 0); o += 1
        elif t == 'I': props.append(struct.unpack_from('<i', b, o)[0]); o += 4
        elif t == 'F': props.append(struct.unpack_from('<f', b, o)[0]); o += 4
        elif t == 'D': props.append(struct.unpack_from('<d', b, o)[0]); o += 8
        elif t == 'L': props.append(struct.unpack_from('<q', b, o)[0]); o += 8
        elif t in 'fdlib':
            ln, enc, cl = struct.unpack_from('<III', b, o); o += 12; raw = b[o:o + cl]; o += cl
            if enc == 1: raw = zlib.decompress(raw)
            dt = {'f': '<f4', 'd': '<f8', 'l': '<i8', 'i': '<i4', 'b': 'u1'}[t]; props.append(np.frombuffer(raw, dtype=dt, count=ln))
        elif t in 'SR':
            ln = struct.unpack_from('<I', b, o)[0]; o += 4; v = b[o:o + ln]; o += ln; props.append(v.decode('latin1') if t == 'S' else v)
        else: raise ValueError('prop type %r at %d' % (t, o))
    return props, o

def read_node(b, o, ver):
    if ver >= 7500: end, n, pl = struct.unpack_from('<QQQ', b, o); o += 24
    else: end, n, pl = struct.unpack_from('<III', b, o); o += 12
    nl = b[o]; o += 1
    if end == 0: return None, o
    name = b[o:o + nl].decode('latin1'); o += nl
    props, o2 = read_props(b, o, n); o = o + pl; kids = []
    null = 25 if ver >= 7500 else 13
    while o < end - null + 1 and o < end:
        if end - o == null: o += null; break
        k, o = read_node(b, o, ver)
        if k is None: break
        kids.append(k)
    return {'name': name, 'props': props, 'kids': kids}, end

def parse(path):
    b = open(path, 'rb').read(); assert b[:20] == b'Kaydara FBX Binary  ', 'not a binary FBX'
    ver = struct.unpack_from('<I', b, 23)[0]; o = 27; top = []
    while o < len(b) - 13:
        n, o = read_node(b, o, ver)
        if n is None: break
        top.append(n)
    return ver, top

def arr(n): return np.asarray(n['props'][0]) if len(n['props']) == 1 and isinstance(n['props'][0], np.ndarray) else np.asarray(n['props'])
def kid(n, name): return next((k for k in n['kids'] if k['name'] == name), None)
def kids(n, name): return [k for k in n['kids'] if k['name'] == name]

def euler(rx, ry, rz):
    rx, ry, rz = np.radians([rx, ry, rz]); cx, sx, cy, sy, cz, sz = np.cos(rx), np.sin(rx), np.cos(ry), np.sin(ry), np.cos(rz), np.sin(rz)
    X = np.array([[1, 0, 0], [0, cx, -sx], [0, sx, cx]]); Y = np.array([[cy, 0, sy], [0, 1, 0], [-sy, 0, cy]]); Z = np.array([[cz, -sz, 0], [sz, cz, 0], [0, 0, 1]])
    return Z @ Y @ X   # FBX's default XYZ order: x first

def layer(m, lname, dname, iname, npv, poly_of_pv, vert_of_pv, w):
    L = kid(m, lname)
    if L is None: return None
    data = arr(kid(L, dname)).astype(np.float64).reshape(-1, w)
    mp = kid(L, 'MappingInformationType')['props'][0]; rf = kid(L, 'ReferenceInformationType')['props'][0]
    if mp == 'ByPolygonVertex': idx = np.arange(npv)
    elif mp in ('ByVertice', 'ByVertex'): idx = vert_of_pv
    elif mp == 'ByPolygon': idx = poly_of_pv
    else: idx = np.zeros(npv, dtype=int)
    if rf == 'IndexToDirect' and kid(L, iname) is not None: idx = arr(kid(L, iname)).astype(np.int64)[idx]
    idx = np.clip(idx, 0, len(data) - 1); return data[idx]

def main(inp, out):
    ver, top = parse(inp); objs = next(n for n in top if n['name'] == 'Objects')
    mats = {}; texs = {}
    for n in objs['kids']:
        if n['name'] == 'Material': mats[n['props'][0].split('::')[-1].split('\x00')[0]] = n
        if n['name'] == 'Texture':
            fn = kid(n, 'RelativeFilename') or kid(n, 'FileName'); texs[n['props'][0].split('::')[-1].split('\x00')[0]] = fn['props'][0] if fn else ''
    conns = next((n for n in top if n['name'] == 'Connections'), {'kids': []})
    clean = lambda s: s.split('::')[-1].split('\x00')[0] if isinstance(s, str) else s
    par = {}; tex_of_mat = {}
    for c in conns['kids']:
        p = c['props']
        if len(p) >= 3:
            a, bb = clean(p[1]), clean(p[2]); par.setdefault(a, []).append(bb)
            if a in texs: tex_of_mat.setdefault(bb, texs[a])
    meshes, chunks, off = [], [], [0]
    def put(arr):
        arr = np.ascontiguousarray(arr, dtype=np.float32); chunks.append(arr.tobytes()); o = off[0]; off[0] += arr.nbytes; return [o, int(arr.size)]
    for m in objs['kids']:
        if m['name'] != 'Model' or len(m['props']) < 2 or m['props'][1] != 'Mesh' or kid(m, 'Vertices') is None: continue
        mname = clean(m['props'][0]); V = arr(kid(m, 'Vertices')).astype(np.float64).reshape(-1, 3)
        PVI = arr(kid(m, 'PolygonVertexIndex')).astype(np.int64)
        ends = PVI < 0; vert_of_pv = np.where(ends, -PVI - 1, PVI); npv = len(PVI)
        poly_of_pv = np.concatenate([[0], np.cumsum(ends)[:-1]]).astype(int)
        N = layer(m, 'LayerElementNormal', 'Normals', 'NormalsIndex', npv, poly_of_pv, vert_of_pv, 3)
        U = layer(m, 'LayerElementUV', 'UV', 'UVIndex', npv, poly_of_pv, vert_of_pv, 2)
        Lm = kid(m, 'LayerElementMaterial'); pmat = np.zeros(int(ends.sum()), dtype=int)
        if Lm is not None and kid(Lm, 'Materials') is not None:
            ma = arr(kid(Lm, 'Materials')).astype(np.int64); mp = kid(Lm, 'MappingInformationType')['props'][0]
            pmat = ma if mp == 'ByPolygon' and len(ma) == len(pmat) else np.full(len(pmat), ma[0] if len(ma) else 0)
        # the model's own transform (Properties60 in 6.x, Properties70 in 7.x)
        T, R, S = np.zeros(3), np.zeros(3), np.ones(3)
        for pn in ('Properties60', 'Properties70'):
            P60 = kid(m, pn)
            if P60 is None: continue
            for pr in P60['kids']:
                nm = pr['props'][0]; vals = [v for v in pr['props'][1:] if isinstance(v, float)]
                if nm == 'Lcl Translation' and len(vals) >= 3: T = np.array(vals[-3:])
                if nm == 'Lcl Rotation' and len(vals) >= 3: R = np.array(vals[-3:])
                if nm == 'Lcl Scaling' and len(vals) >= 3: S = np.array(vals[-3:])
        M = euler(*R) @ np.diag(S); Vw = V @ M.T + T
        if N is not None: N = N @ np.linalg.inv(M).T
        # the materials this model is connected to, in connection order
        mlist = [x for x in par.get(mname, []) if x in mats] or [k for k, v in par.items() if mname in v and k in mats]
        mlist = [k for k, v in par.items() if k in mats and mname in v] or mlist
        # polygons -> triangle fans, grouped by material
        starts = np.concatenate([[0], np.where(ends)[0][:-1] + 1]); stops = np.where(ends)[0]
        groups = {}
        for pi, (s0, s1) in enumerate(zip(starts, stops)):
            for k in range(s0 + 1, s1): groups.setdefault(int(pmat[pi]) if pi < len(pmat) else 0, []).extend([s0, k, k + 1])
        for gi, pv in groups.items():
            pv = np.array(pv); P = Vw[vert_of_pv[pv]]
            if N is not None: Nn = N[pv]
            else:
                t = P.reshape(-1, 3, 3); fn = np.cross(t[:, 1] - t[:, 0], t[:, 2] - t[:, 0]); fn /= np.linalg.norm(fn, axis=1, keepdims=True) + 1e-12; Nn = np.repeat(fn, 3, axis=0)
            Nn = Nn / (np.linalg.norm(Nn, axis=1, keepdims=True) + 1e-12); Uu = U[pv] if U is not None else np.zeros((len(pv), 2))
            matn = mlist[gi] if gi < len(mlist) else (mlist[0] if mlist else '')
            tex = tex_of_mat.get(matn) or ''
            meshes.append({'name': mname, 'mat': {'name': matn, 'color': 0xffffff, 'map': os.path.basename(tex.replace('\\', '/')) if tex else None}, 'hasUV': U is not None, 'P': put(P), 'N': put(Nn), 'U': put(Uu)})
    open(out + '.bin', 'wb').write(b''.join(chunks)); json.dump({'src': inp, 'meshes': meshes}, open(out + '.json', 'w'))
    allp = np.concatenate([np.frombuffer(b''.join(chunks), dtype=np.float32, count=mm['P'][1], offset=mm['P'][0]).reshape(-1, 3) for mm in meshes])
    print(os.path.basename(inp), 'ver', ver, 'meshes', len(meshes), 'tris', sum(mm['P'][1] // 9 for mm in meshes), 'size', np.round(allp.max(0) - allp.min(0), 2).tolist(), 'mats', sorted({mm['mat']['name'] + ':' + str(mm['mat']['map']) for mm in meshes}))

if __name__ == '__main__': main(sys.argv[1], sys.argv[2])
