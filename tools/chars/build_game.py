"""build_game.py SOLDIER.glb OUT.js [textures dir]: the new soldier made ready for the game's own rig.
   The figure (built by build_char.py, skinned to the Character Creator skeleton) is scaled to the game's soldier (0.95), its spine set on
   the rig's axis, and its skin weights folded onto the game's joints - hips, chest, shoulders, elbows, hips, knees and the head - so the
   rig's poses and animations (and its two-hand grip on the rifle) move it exactly as they move the old figure. It stays in its T-pose:
   the game binds it with the rig's arms raised to match. The fingers are curled into a grip. Teeth, tongue, nails and the boots' eyelets
   are left out. Written as one compact binary (quantized positions and normals, byte weights) in base64, with the textures, as a JS file."""
import base64, io, json, sys
import numpy as np
from PIL import Image
sys.path.insert(0, __file__.rsplit('/', 1)[0])
import gltf

SRC, OUT = sys.argv[1], sys.argv[2]; TEXD = sys.argv[3] if len(sys.argv) > 3 else None
j, b = gltf.load(SRC); A = lambda i: gltf.acc(j, b, i)
sk = j['skins'][0]; NAMES = [j['nodes'][k]['name'] for k in sk['joints']]
ibm = A(sk['inverseBindMatrices']).reshape(-1, 4, 4).transpose(0, 2, 1); BP = {NAMES[i]: np.linalg.inv(ibm[i])[:3, 3] for i in range(len(NAMES))}
S, ZOFF, HIPY = 0.95, 0.07, 0.93
tf = lambda p: S * (np.asarray(p, float) + np.array([0, 0, ZOFF])) - np.array([0, HIPY, 0])   # the figure's space -> the rig's hips (rest)

# ---------------- the CC joints folded onto the game's ----------------
RB = ['hips', 'torso', 'sR', 'eR', 'sL', 'eL', 'hR', 'kR', 'hL', 'kL', 'headP']
def fold(name):
    n = name.lower(); side = 'L' if name.endswith('.l') else 'R' if name.endswith('.r') else None
    if n.startswith('def') or n.startswith('head') or 'eye' in n or 'jaw' in n or 'tongue' in n or 'teeth' in n: return [(10, 1.0)]
    if n.startswith('neck'): return [(1, 0.5), (10, 0.5)]
    if n.startswith('spine') or n.startswith('shoulder'): return [(1, 1.0)]
    if n.startswith('root'): return [(0, 1.0)]
    if side:
        L = side == 'L'
        if 'forearm' in n or n.startswith('hand') or any(f in n for f in ('thumb', 'index', 'middle', 'ring', 'pinky')): return [(5 if L else 3, 1.0)]
        if 'arm' in n: return [(4 if L else 2, 1.0)]
        if 'thigh' in n: return [(8 if L else 6, 1.0)]
        if n.startswith('leg') or n.startswith('foot') or n.startswith('toes'): return [(9 if L else 7, 1.0)]
    return [(1, 1.0)]
FOLD = [fold(nm) for nm in NAMES]
def rig_weights(J, W):
    n = len(J); D = np.zeros((n, len(RB)))
    for q in range(J.shape[1]):
        for ci in np.unique(J[:, q]):
            m = J[:, q] == ci
            for bi, f in FOLD[int(ci)]: D[m, bi] += W[m, q] * f
    idx = np.argsort(-D, 1)[:, :4]; w = np.take_along_axis(D, idx, 1); w /= np.maximum(w.sum(1, keepdims=True), 1e-9)
    wb = np.floor(w * 255 + 0.5).astype(np.int64); wb[:, 0] += 255 - wb.sum(1)   # bytes that add up to 255
    return idx.astype(np.uint8), np.clip(wb, 0, 255).astype(np.uint8)

# ---------------- the grip: each finger curled at its three joints, the thumb brought under ----------------
def curl(P, J, W):
    P = P.copy().astype(float)
    for sd, sfx in ((1, '.l'), (-1, '.r')):
        rot = lambda c, th: (lambda v: c + (v - c) @ np.array([[np.cos(th), np.sin(th), 0], [-np.sin(th), np.cos(th), 0], [0, 0, 1]]))   # about z (front-back): tips down
        for f, (t1, t2, t3) in {'index': (0.85, 1.15, 0.75), 'middle': (0.95, 1.2, 0.8), 'ring': (1.0, 1.25, 0.8), 'pinky': (1.05, 1.25, 0.8)}.items():
            names = [f + '1' + sfx, 'c_' + f + '2' + sfx, 'c_' + f + '3' + sfx]
            if not all(nm in BP for nm in names): continue
            ids = [NAMES.index(nm) for nm in names]; wk = [((J == i) * W).sum(1) for i in ids]
            if not any(w.max() > 0 for w in wk): continue
            K, M_, T_ = (BP[nm] for nm in names); th = [-sd * t for t in (t1, t2, t3)]
            r1 = rot(K, th[0]); M1 = r1(M_[None])[0]; T1 = r1(T_[None])[0]; r2 = rot(M1, th[1]); T2 = r2(T1[None])[0]; r3 = rot(T2, th[2])
            v1 = r1(P); v2 = r2(v1); v3 = r3(v2); w1, w2, w3 = wk; w0 = np.clip(1 - w1 - w2 - w3, 0, 1)
            P = P * w0[:, None] + v1 * w1[:, None] + v2 * w2[:, None] + v3 * w3[:, None]
        names = ['thumb1' + sfx, 'c_thumb2' + sfx, 'c_thumb3' + sfx]
        if all(nm in BP for nm in names):
            ids = [NAMES.index(nm) for nm in names]; wt = sum(((J == i) * W).sum(1) for i in ids); c = BP[names[0]]; th = 0.75
            R = np.array([[1, 0, 0], [0, np.cos(th), -np.sin(th)], [0, np.sin(th), np.cos(th)]]).T   # about the hand's own axis: the thumb swings under the palm
            P = P * (1 - wt[:, None]) + (c + (P - c) @ R) * wt[:, None]
    return P

def components(I, nv):
    par = np.arange(nv)
    def f(a):
        while par[a] != a: par[a] = par[par[a]]; a = par[a]
        return a
    for t in I:
        a = f(t[0])
        for v in t[1:]:
            c = f(v)
            if a != c: par[c] = a
    return np.array([f(i) for i in range(nv)])

# ---------------- the parts ----------------
mesh_by = {m['name']: m for m in j['meshes']}
groups = []   # (name, P, N, UV, Jcc, Wcc, I)
def take(mesh, keep=None, rename=None, fn=None):
    for p in mesh_by[mesh]['primitives']:
        mn = j['materials'][p['material']]['name']
        if keep and mn not in keep: continue
        at = p['attributes']; P = A(at['POSITION']).astype(float); N = A(at['NORMAL']); UV = A(at['TEXCOORD_0']); J = A(at['JOINTS_0']).astype(np.int64); W = A(at['WEIGHTS_0']); I = A(p['indices']).reshape(-1, 3).astype(np.int64)
        if fn: P, N, UV, J, W, I = fn(mn, P, N, UV, J, W, I)
        groups.append([(rename or {}).get(mn, mn), P, N, UV, J, W, I])
def boots_fn(mn, P, N, UV, J, W, I):   # the eyelets and studs out: only the boots' big pieces
    c = components(I, len(P)); ids, cnt = np.unique(c[I[:, 0]], return_counts=True); big = set(ids[cnt >= 120]); keep = np.array([c[t[0]] in big for t in I])
    I = I[keep]; vs, inv = np.unique(I, return_inverse=True); return P[vs], N[vs], UV[vs], J[vs], W[vs], inv.reshape(-1, 3)
def hands_fn(mn, P, N, UV, J, W, I):
    if mn != 'Std_Skin_Arm': return P, N, UV, J, W, I
    P2 = curl(P, J, W); Q2 = curl(P + N * 0.002, J, W); N2 = Q2 - P2; N2 /= np.maximum(np.linalg.norm(N2, axis=1, keepdims=True), 1e-9)   # the normals turn with the fingers
    return P2, N2.astype(np.float32), UV, J, W, I
take('Body', keep={'Std_Skin_Head', 'Std_Skin_Arm'}, rename={'Std_Skin_Head': 'head', 'Std_Skin_Arm': 'hands'}, fn=hands_fn)
take('Eyes', keep={'Std_Eye_R', 'Std_Eye_L'}, rename={'Std_Eye_R': 'eyes', 'Std_Eye_L': 'eyes'})
take('Uniform', rename={'Uniform': 'uniform'}); take('Webbing', rename={'Webbing': 'webbing'}); take('Boots', rename={'Boots': 'boots'}, fn=boots_fn)
take('HelmetM1', rename={'HelmetM1': 'm1', 'HelmetLiner': 'm1fit', 'HelmetBand': 'm1fit', 'Metal': 'm1fit'}); take('HelmetSoviet', rename={'HelmetSoviet': 'sov'})
# merge the parts that share a material
merged = {}
for nm, P, N, UV, J, W, I in groups:
    if nm in merged:
        m = merged[nm]; off = len(m[0]); m[0] = np.concatenate([m[0], P]); m[1] = np.concatenate([m[1], N]); m[2] = np.concatenate([m[2], UV]); m[3] = np.concatenate([m[3], J]); m[4] = np.concatenate([m[4], W]); m[5] = np.concatenate([m[5], I + off])
    else: merged[nm] = [P, N, UV, J, W, I]
ORDER = ['uniform', 'webbing', 'boots', 'head', 'hands', 'eyes', 'm1', 'm1fit', 'sov']

# ---------------- finer: the coarse cloth and the helmets split (each triangle into four), the new points on the curved surface ----------------
def pn_split(P, N, UV, J, W, I):
    """one level of curved (PN) subdivision: the old points stay where they are, each edge gets a point on the cubic through its two ends
    along their normals (normals taken smooth over the welded position, so seams stay closed), with the mean uv, normal and skin of the ends"""
    P = P.astype(float); k = np.round(P / 1e-5).astype(np.int64); _, tid = np.unique(k, axis=0, return_inverse=True); tid = tid.ravel()
    Ns = np.zeros((tid.max() + 1, 3)); np.add.at(Ns, tid, N.astype(float)); Ns /= np.maximum(np.linalg.norm(Ns, axis=1, keepdims=True), 1e-9)
    E = np.concatenate([I[:, [0, 1]], I[:, [1, 2]], I[:, [2, 0]]]); E = np.sort(E, 1)
    ue, inv = np.unique(E, axis=0, return_inverse=True); inv = inv.ravel(); a, c = ue[:, 0], ue[:, 1]
    P1, P2, N1, N2 = P[a], P[c], Ns[tid[a]], Ns[tid[c]]
    w12 = ((P2 - P1) * N1).sum(1, keepdims=True); w21 = ((P1 - P2) * N2).sum(1, keepdims=True)
    d = -(w12 * N1 + w21 * N2) / 8; L = np.linalg.norm(P2 - P1, axis=1, keepdims=True); dl = np.linalg.norm(d, axis=1, keepdims=True)
    d *= np.minimum(1, 0.2 * L / np.maximum(dl, 1e-12))   # never more than a fifth of the edge: a crease does not balloon
    M = (P1 + P2) / 2 + d
    MN = N[a].astype(float) + N[c]; MN /= np.maximum(np.linalg.norm(MN, axis=1, keepdims=True), 1e-9)
    MUV = (UV[a] + UV[c]) / 2
    nj = int(J.max()) + 1; D = np.zeros((len(ue), nj)); r = np.arange(len(ue))
    for q in range(J.shape[1]):
        np.add.at(D, (r, J[a, q]), W[a, q] * 0.5); np.add.at(D, (r, J[c, q]), W[c, q] * 0.5)
    MJ = np.argsort(-D, 1)[:, :J.shape[1]]; MW = np.take_along_axis(D, MJ, 1); MW /= np.maximum(MW.sum(1, keepdims=True), 1e-9)
    n0, nt = len(P), len(I); m = inv + n0; m01, m12, m20 = m[:nt], m[nt:2 * nt], m[2 * nt:]; i0, i1, i2 = I[:, 0], I[:, 1], I[:, 2]
    I2 = np.concatenate([np.stack([i0, m01, m20], 1), np.stack([m01, i1, m12], 1), np.stack([m20, m12, i2], 1), np.stack([m01, m12, m20], 1)])
    return [np.concatenate([P, M]), np.concatenate([N, MN.astype(N.dtype)]), np.concatenate([UV, MUV.astype(UV.dtype)]), np.concatenate([J, MJ.astype(J.dtype)]), np.concatenate([W, MW.astype(W.dtype)]), I2]
SUB = {'uniform': 1, 'm1': 2, 'm1fit': 1, 'sov': 1}   # the uniform's triangles were 3 cm a side, the M1's 5 cm
for nm, lv in SUB.items():
    for _ in range(lv): merged[nm] = pn_split(*merged[nm])
    assert len(merged[nm][0]) < 65536, nm
# the hands use only the top of the arm texture (its third tile, rows 0.64-1): that strip alone, at full size, and their uvs moved onto it
HV0 = 0.64
merged['hands'][2] = merged['hands'][2].copy(); merged['hands'][2][:, 0] -= 2.0; merged['hands'][2][:, 1] = (merged['hands'][2][:, 1] - HV0) / (1 - HV0)

# ---------------- write ----------------
allP = np.concatenate([tf(merged[k][0]) for k in ORDER]); pmin = allP.min(0); pmax = allP.max(0); span = pmax - pmin
blob = bytearray(); hdr = {'bones': RB, 'min': pmin.tolist(), 'span': span.tolist(), 'groups': []}
def put(arr):
    while len(blob) % 4: blob.append(0)
    off = len(blob); blob.extend(np.ascontiguousarray(arr).tobytes()); return off
tri = 0
for k in ORDER:
    P, N, UV, J, W, I = merged[k]; P = tf(P); si, sw = rig_weights(J, W)
    q = np.clip(np.round((P - pmin) / span * 65535) - 32768, -32768, 32767).astype(np.int16)
    n8 = np.clip(np.round(N / np.maximum(np.linalg.norm(N, axis=1, keepdims=True), 1e-9) * 127), -127, 127).astype(np.int8)
    g = {'name': k, 'v': len(P), 'i': int(I.size), 'pos': put(q), 'nrm': put(n8), 'uv': put(UV.astype(np.float32)), 'si': put(si), 'sw': put(sw), 'idx': put(I.astype(np.uint16))}
    hdr['groups'].append(g); tri += len(I)
jp = lambda nm: tf(BP[nm])
hdr['joints'] = {'sL': jp('c_arm_twist_offset.l').tolist(), 'sR': jp('c_arm_twist_offset.r').tolist(), 'eLen': float(np.linalg.norm(jp('forearm_stretch.l') - jp('c_arm_twist_offset.l'))),
                 'hL': jp('thigh_twist.l').tolist(), 'hR': jp('thigh_twist.r').tolist(), 'kL': (jp('leg_stretch.l') - jp('thigh_twist.l')).tolist(), 'kR': (jp('leg_stretch.r') - jp('thigh_twist.r')).tolist(),
                 'headP': jp('head.x').tolist()}
# the figure's own textures: the faces (ours, theirs), the hands, the eyes
tex = {}
def jpg_of(im, size, q=84):
    im = im.convert('RGB'); im = im.resize((size, size), Image.LANCZOS) if max(im.size) > size else im; bio = io.BytesIO(); im.save(bio, 'JPEG', quality=q); return 'data:image/jpeg;base64,' + base64.b64encode(bio.getvalue()).decode()
def glb_tex(matname):
    m = next(x for x in j['materials'] if x['name'] == matname); ti = m['pbrMetallicRoughness']['baseColorTexture']['index']
    im = j['images'][j['textures'][ti]['source']]; bv = j['bufferViews'][im['bufferView']]; return Image.open(io.BytesIO(b[bv.get('byteOffset', 0): bv.get('byteOffset', 0) + bv['byteLength']]))
# the face and the hands straight from the Character Creator file, at its full 2048 (the built figure keeps smaller copies)
CC = '/mnt/user-data/uploads/Downloads/military+game+character+.glb'; jc, bc = gltf.load(CC)
def cc_tex(matname):
    m = next(x for x in jc['materials'] if x['name'] == matname); ti = m['pbrMetallicRoughness']['baseColorTexture']['index']
    im = jc['images'][jc['textures'][ti]['source']]; bv = jc['bufferViews'][im['bufferView']]; return Image.open(io.BytesIO(bc[bv.get('byteOffset', 0): bv.get('byteOffset', 0) + bv['byteLength']]))
arm = cc_tex('Std_Skin_Arm').convert('RGB'); aw, ah = arm.size; strip = arm.crop((0, int(ah * HV0), aw, ah))
def jpg_rect(im, q=84):
    bio = io.BytesIO(); im.convert('RGB').save(bio, 'JPEG', quality=q); return 'data:image/jpeg;base64,' + base64.b64encode(bio.getvalue()).decode()
tex['head'] = jpg_of(cc_tex('Std_Skin_Head'), 2048, 82); tex['hands'] = jpg_rect(strip, 84); tex['eyes'] = jpg_of(glb_tex('Std_Eye_R'), 512, 88)
if TEXD: tex['headAr'] = jpg_of(Image.open(TEXD + '/head_ar.jpg'), 2048, 82)
js = ('/* the new soldier (tools: chars/build_char.py, build_game.py): geometry for the game rig, and its textures. Generated - do not edit */\n'
      'const SOLDIER_DATA = ' + json.dumps({'hdr': hdr, 'tex': tex}, separators=(',', ':'))[:-1] + ',"bin":"' + base64.b64encode(bytes(blob)).decode() + '"};\n')
open(OUT, 'w').write(js)
print('triangles', tri, 'groups', [(g['name'], g['v'], g['i'] // 3) for g in hdr['groups']], 'binary', len(blob) // 1024, 'KB', 'js', len(js) // 1024, 'KB')
print('joints', json.dumps({k: (np.round(v, 3).tolist() if isinstance(v, list) else round(v, 3)) for k, v in hdr['joints'].items()}))
