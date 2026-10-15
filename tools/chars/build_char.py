"""build_char.py OUT.glb: one soldier for the 1973 game, put together from two models -
   the Character Creator figure (military+game+character+.glb): head and face, hands, eyes, teeth, the skeleton, a few facial shapes;
   the US airborne soldier (soldier_airborne.obj, already split into pieces by objsplit.py -> obj.npz): helmet, jacket and trousers,
   webbing and pouches, boots - brought from its A-pose and proportions onto the figure's T-pose skeleton, given UVs, normals and the
   figure's skin weights (from the nearest skin), and a Soviet-pattern helmet made here for the Egyptian and Syrian soldiers.
   Every gear material is named, so the game can dress the same figure for each army."""
import io, sys, json
import numpy as np
from PIL import Image, ImageFilter
from scipy.spatial import cKDTree
import scipy.sparse as sp
sys.path.insert(0, __file__.rsplit('/', 1)[0])
import gltf, glbw

SRC = '/mnt/user-data/uploads/Downloads/military+game+character+.glb'
OUT = sys.argv[1]
j, b = gltf.load(SRC)
sk = j['skins'][0]; JOINTS = sk['joints']; NAMES = [j['nodes'][k]['name'] for k in JOINTS]; HEAD = NAMES.index('head.x')
A = lambda i: gltf.acc(j, b, i)

# ---------------- the figure's skin, as the source of weights ----------------
srcP, srcJ, srcW = [], [], []
for p in j['meshes'][2]['primitives']:
    srcP.append(A(p['attributes']['POSITION'])); srcJ.append(A(p['attributes']['JOINTS_0']).astype(np.int64)); srcW.append(A(p['attributes']['WEIGHTS_0']))
srcP = np.concatenate(srcP); srcJ = np.concatenate(srcJ); srcW = np.concatenate(srcW)
tree = cKDTree(srcP)
headP = A(j['meshes'][2]['primitives'][0]['attributes']['POSITION'])

# ---------------- the airborne soldier: pieces, and the warp onto the figure ----------------
d = np.load(sys.argv[2] if len(sys.argv) > 2 else 'obj.npz'); OV, OF, piece = d['V'], d['F'], d['piece']
EXCL = {231, 232, 233, 2, 5}                       # his face, eyes and hands: the figure's are far better
HELM = {234: 'shell', 237: 'liner', 238: 'band', 239: 'band', 235: 'metal', 236: 'metal'}
UNIF = {18, 27, 20, 24} | set(range(6, 18)) | {0, 1, 3, 4, 19, 21, 22, 23, 24, 25, 26}   # jacket, trousers, their pockets and buttons
STRAPS = {218, 230, 211, 223, 217, 229, 213, 225, 216, 228, 209, 210, 221, 222, 214, 215, 226, 227, 212, 224, 207, 208, 219, 220}   # the harness over the shoulders and its hooks: left off, the belt and its pouches stay (as worn in 1973)
yc = np.zeros(piece.max() + 1)
for k in range(piece.max() + 1): yc[k] = OV[np.unique(OF[piece == k])][:, 1].mean()
def cat(k):
    if k in EXCL or k in STRAPS: return None
    if k in HELM: return 'm1_' + HELM[k]
    if yc[k] > 1600: return 'm1_metal'   # the helmet's small fittings (they go with the M1)
    if yc[k] < 260: return 'boots'
    return 'uniform' if k in UNIF else 'webbing'
groups = {}
for k in range(piece.max() + 1):
    c = cat(k)
    if c: groups.setdefault(c, []).append(k)

def interp(y, pts): xs, ys = zip(*pts); return np.interp(y, xs, ys)
def sstep(a, b_, x): t = np.clip((x - a) / (b_ - a), 0, 1); return t * t * (3 - 2 * t)
YMAP = [(0, 0), (120, 120), (530, 533), (940, 940), (1440, 1481), (1668, 1702), (2100, 2136)]   # his joints' heights -> the figure's (mm)
DZ = [(0, 0), (530, -18), (740, -31), (900, -51), (1250, -80), (1550, -85), (1700, -100), (2100, -100)]   # he stands further forward
DXL = [(0, -26), (530, -32), (900, -18), (1000, 0), (2100, 0)]    # and his feet wider apart
def rot_between(a, c):
    v = np.cross(a, c); s = np.linalg.norm(v); co = a @ c
    if s < 1e-9: return np.eye(3)
    K = np.array([[0, -v[2], v[1]], [v[2], 0, -v[0]], [-v[1], v[0], 0]]) / s; th = np.arctan2(s, co)
    return np.eye(3) + np.sin(th) * K + (1 - np.cos(th)) * K @ K
def warp(V):
    x, y, z = V.T
    T = np.stack([x + np.sign(x) * interp(y, DXL) * sstep(0, 60, np.abs(x)), interp(y, YMAP), z + interp(y, DZ)], 1) / 1000
    for s in (1, -1):   # each arm swung up from his A-pose to the figure's T-pose about the shoulder, and lengthened to the figure's arm
        So = np.array([190 * s, 1440, 20.]); Wo = np.array([493 * s, 1101, 39.])
        Sc = np.array([0.186 * s, 1.481, -0.107]); Wc = np.array([0.726 * s, 1.494, -0.084])
        a = Wo - So; Lo = np.linalg.norm(a); a /= Lo; ac = Wc - Sc; Lc = np.linalg.norm(ac); ac /= Lc; kk = Lc / (Lo / 1000); R = rot_between(a, ac)
        u = V - So; t = u @ a; rv = u - np.outer(t, a); r = np.linalg.norm(rv, axis=1)
        w = sstep(-30, 70, t) * (1 - sstep(115, 160, r)) * (V[:, 0] * s > 60)
        rs = 1 - 0.3 * sstep(0.6 * Lo, Lo, t)          # the cuff drawn in toward the wrist
        Va = Sc + np.outer(t / 1000 * kk, ac) + (rv * rs[:, None] / 1000) @ R.T
        T = T * (1 - w[:, None]) + Va * w[:, None]
    return T

def submesh(ks):
    fs = OF[np.isin(piece, ks)]; vs, inv = np.unique(fs, return_inverse=True)
    return OV[vs], inv.reshape(-1, 3)

def box_uv(P, N, scale):
    ax = np.abs(N).argmax(1); uv = np.zeros((len(P), 2))
    uv[ax == 0] = P[ax == 0][:, [2, 1]]; uv[ax == 1] = P[ax == 1][:, [0, 2]]; uv[ax == 2] = P[ax == 2][:, [0, 1]]
    return (uv * scale).astype(np.float32)

def solidify(P, I, d):
    """a sheet given thickness: an inner skin d inside the outer one, and a strip along the open edges joining them (a helmet's rim)"""
    N = glbw.smooth_normals(P, I); n = len(P)
    P2 = np.concatenate([P, P - N * d]); I2 = np.concatenate([I, I[:, ::-1] + n])
    from collections import Counter
    E = Counter(); 
    for t in I:
        for k in range(3): a_, b_ = t[k], t[(k + 1) % 3]; E[(min(a_, b_), max(a_, b_))] += 1
    rim = []
    for t in I:
        for k in range(3):
            a_, b_ = t[k], t[(k + 1) % 3]
            if E[(min(a_, b_), max(a_, b_))] == 1: rim += [[b_, a_, a_ + n], [b_, a_ + n, b_ + n]]
    if rim: I2 = np.concatenate([I2, np.array(rim)])
    return P2.astype(np.float32), I2
HC = np.array([0.0, 1.70, -0.03])   # about the middle of the skull: the helmets' UVs are taken round it
def sph_uv(P, scale):
    q = P - HC; r = np.linalg.norm(q, axis=1); ph = np.arctan2(q[:, 0], q[:, 2]); th = np.arccos(np.clip(q[:, 1] / np.maximum(r, 1e-6), -1, 1))
    return (np.stack([ph * 0.13, th * 0.13], 1) * scale).astype(np.float32)

def body_uv(P, scale):
    """cloth UVs without the stretched stripes of a box projection: each part of the body wrapped as a cylinder - the sleeves round the arm
    (the figure is in its T-pose: the arm lies along x), the legs each round its own upright, the body round the spine"""
    x, y, z = P.T; uv = np.zeros((len(P), 2))
    arm = (np.abs(x) > 0.24) & (y > 1.3); leg = (y < 0.93) & ~arm; tor = ~arm & ~leg
    ca = np.arctan2(z[arm] + 0.1, y[arm] - 1.487); uv[arm] = np.stack([np.abs(x[arm]), ca * 0.075], 1)
    cx = np.sign(x[leg]) * 0.095; cl = np.arctan2(x[leg] - cx, z[leg] + 0.02); uv[leg] = np.stack([cl * 0.1, y[leg]], 1)
    ct = np.arctan2(x[tor], z[tor] + 0.04); uv[tor] = np.stack([ct * 0.17, y[tor]], 1)
    return (uv * scale).astype(np.float32)

def skin_weights(P, I, rigid=None):
    n = len(P)
    if rigid is not None:
        J = np.zeros((n, 4), np.int64); J[:, 0] = rigid; W = np.zeros((n, 4), np.float32); W[:, 0] = 1; return J, W
    dd, ii = tree.query(P, k=8); wk = 1 / (dd + 0.004) ** 2; wk /= wk.sum(1, keepdims=True)
    D = np.zeros((n, len(JOINTS)), np.float32)
    for c in range(8):
        for q in range(4): np.add.at(D, (np.arange(n), srcJ[ii[:, c], q]), wk[:, c] * srcW[ii[:, c], q])
    rows = np.concatenate([I[:, 0], I[:, 1], I[:, 2], I[:, 1], I[:, 2], I[:, 0]]); cols = np.concatenate([I[:, 1], I[:, 2], I[:, 0], I[:, 0], I[:, 1], I[:, 2]])
    Adj = sp.csr_matrix((np.ones(len(rows), np.float32), (rows, cols)), shape=(n, n)); deg = np.asarray(Adj.sum(1)).ravel(); deg[deg == 0] = 1
    for _ in range(3): D = 0.5 * D + 0.5 * (Adj @ D) / deg[:, None]
    J = np.argsort(-D, 1)[:, :4]; W = np.take_along_axis(D, J, 1); W /= np.maximum(W.sum(1, keepdims=True), 1e-9)
    return J, W.astype(np.float32)

# ---------------- textures made here: cloth, webbing, the helmet net, paint, leather ----------------
rng = np.random.default_rng(73)
def tile_noise(n, blur):
    f = np.fft.fft2(rng.standard_normal((n, n))); ky = np.fft.fftfreq(n)[:, None]; kx = np.fft.fftfreq(n)[None, :]
    g = np.exp(-(kx ** 2 + ky ** 2) * (blur ** 2) * 40); x = np.real(np.fft.ifft2(f * g)); return (x - x.mean()) / (x.std() + 1e-9)
def to_jpg(arr, q=85):
    im = Image.fromarray(np.clip(arr * 255, 0, 255).astype(np.uint8)); bio = io.BytesIO(); im.save(bio, 'JPEG', quality=q); return bio.getvalue()
n = 256; yy, xx = np.mgrid[0:n, 0:n]
weave = 0.5 + 0.5 * np.sin(xx * 2 * np.pi / 4) * np.sin(yy * 2 * np.pi / 4)
cloth = 0.88 + 0.022 * tile_noise(n, 6) + 0.03 * tile_noise(n, 1) + 0.05 * weave
cloth_rgb = np.repeat(cloth[:, :, None], 3, 2)
web = 0.85 + 0.05 * tile_noise(n, 4) + 0.06 * (0.5 + 0.5 * np.sin(yy * 2 * np.pi / 3))
web_rgb = np.repeat(web[:, :, None], 3, 2)
d1 = ((xx + yy) % 32); d2 = ((xx - yy) % 32)
net = np.where((d1 < 3) | (d2 < 3), 0.42, 0.95 + 0.04 * tile_noise(n, 3))   # the net over the M1, its cords darker than the paint under it
net_rgb = np.repeat(net[:, :, None], 3, 2)
paint = 0.9 + 0.05 * tile_noise(n, 8) + 0.02 * tile_noise(n, 1); paint_rgb = np.repeat(paint[:, :, None], 3, 2)
leather = 0.85 + 0.08 * tile_noise(n, 5) + 0.03 * tile_noise(n, 1); leather_rgb = np.repeat(leather[:, :, None], 3, 2)

g = glbw.GLB()
def tex(arr): return g.image(to_jpg(arr), 'image/jpeg')
T_CLOTH, T_WEB, T_NET, T_PAINT, T_LEATHER = tex(cloth_rgb), tex(web_rgb), tex(net_rgb), tex(paint_rgb), tex(leather_rgb)
def srgb(h): return [((h >> 16 & 255) / 255) ** 2.2, ((h >> 8 & 255) / 255) ** 2.2, ((h & 255) / 255) ** 2.2, 1.0]
def mat(name, color, t, rough, metal=0.0, ds=True):
    return g.material({'name': name, 'pbrMetallicRoughness': {'baseColorFactor': srgb(color), 'baseColorTexture': {'index': t} if t is not None else None, 'metallicFactor': metal, 'roughnessFactor': rough}, 'doubleSided': ds})
# the IDF's colours by default; the game sets each army's (see chars.html)
M = {'uniform': mat('Uniform', 0x5d5a3c, T_CLOTH, 0.95), 'webbing': mat('Webbing', 0x5b5638, T_WEB, 0.9), 'boots': mat('Boots', 0x4a2c1c, T_LEATHER, 0.55),
     'm1_shell': mat('HelmetM1', 0x4c4e34, T_NET, 0.8), 'm1_liner': mat('HelmetLiner', 0x3e3d2b, T_PAINT, 0.85), 'm1_band': mat('HelmetBand', 0x34331f, T_WEB, 0.9),
     'm1_metal': mat('Metal', 0x2a2a28, None, 0.45, 0.6), 'sov': mat('HelmetSoviet', 0x4a4e34, T_PAINT, 0.6)}
for m in g.j['materials']:
    if m['pbrMetallicRoughness'].get('baseColorTexture') is None: m['pbrMetallicRoughness'].pop('baseColorTexture', None)

nodes_new = []
def add_mesh(name, prims, targetNames=None):
    m = {'name': name, 'primitives': prims}
    if targetNames: m['extras'] = {'targetNames': targetNames}; m['weights'] = [0.0] * len(targetNames)
    g.j['meshes'].append(m); nodes_new.append({'name': name, 'mesh': len(g.j['meshes']) - 1, 'skin': 0})

report = {}
gear_prims = {'Uniform': [], 'Webbing': [], 'Boots': [], 'HelmetM1': []}
for c, ks in groups.items():
    V0, I = submesh(ks); P = warp(V0)
    if c.startswith('m1_'): P = (HC + (P - HC) * 1.03).astype(np.float32)   # a touch fuller, so it reads at a distance
    if c == 'm1_shell': P, I = solidify(P, I, 0.007)   # steel you can see the thickness of
    N = glbw.smooth_normals(P, I)
    rigid = HEAD if c.startswith('m1_') else None
    J, W = skin_weights(P, I, rigid)
    uv = sph_uv(P, 4) if c == 'm1_shell' else body_uv(P, 4) if c in ('uniform', 'webbing') else box_uv(P, N, 4)
    pr = g.prim(P, I, N, uv, J, W, mat=M[c])
    gear_prims['HelmetM1' if c.startswith('m1_') else c.capitalize()].append(pr)
    report[c] = (len(P), len(I))

# ---------------- the Soviet-pattern helmet (SSh-68 shape): Egyptians and Syrians ----------------
H = headP[headP[:, 1] > 1.68]
hx = np.abs(H[:, 0]).max(); hz0, hz1 = H[:, 2].min(), H[:, 2].max(); htop = H[:, 1].max(); hcz = (hz0 + hz1) / 2
cx, cy, cz = 0.0, 1.695, hcz - 0.004; rx, rz, ry = hx + 0.022, (hz1 - hz0) / 2 + 0.022, htop - 1.695 + 0.022
nu, nv = 48, 20; verts = []; faces = []
for i in range(nv + 1):
    for k in range(nu):
        ph = 2 * np.pi * k / nu; rim = 1.695 + 0.03 * np.cos(ph) - 0.006   # low at the back, over the brow in front
        th_r = np.arccos(np.clip((rim - cy) / ry, -1, 1)); th = th_r * i / nv
        fl = 1 + 0.07 * sstep(np.radians(78), np.radians(108), th) + 0.05 * sstep(0.85, 1.0, i / nv)   # the skirt flares out a little
        verts.append([cx + rx * fl * np.sin(th) * np.sin(ph), cy + ry * np.cos(th), cz + rz * fl * np.sin(th) * np.cos(ph)])
for i in range(nv):
    for k in range(nu):
        a_, b_, c_, d_ = i * nu + k, i * nu + (k + 1) % nu, (i + 1) * nu + k, (i + 1) * nu + (k + 1) % nu
        faces += [[a_, c_, b_], [b_, c_, d_]]
SP = np.array(verts, np.float32); SI = np.array(faces); SP = (HC + (SP - HC) * 1.03).astype(np.float32); SP, SI = solidify(SP, SI, 0.007)
SN = glbw.smooth_normals(SP, SI); SJ, SW = skin_weights(SP, SI, HEAD)
sov_prim = g.prim(SP, SI, SN, sph_uv(SP, 6), SJ, SW, mat=M['sov'])
report['sov'] = (len(SP), len(SI))

for nm in ['Uniform', 'Webbing', 'Boots', 'HelmetM1']: add_mesh(nm, gear_prims[nm])
add_mesh('HelmetSoviet', [sov_prim])

# ---------------- the figure's own parts: head, hands, eyes, teeth, tongue, lashes; a few facial shapes ----------------
KEEP_T = ['Eyes_Blink', 'Eye_Blink_L', 'Eye_Blink_R', 'Mouth_Smile', 'Mouth_Frown', 'Mouth_Open', 'Brow_Drop_Left', 'Brow_Drop_Right', 'A25_Jaw_Open']
imgs = j['images']; texs = j['textures']; tex_cache = {}
def src_image(ti, size, mode='JPEG'):
    key = (ti, size, mode)
    if key in tex_cache: return tex_cache[key]
    im_j = imgs[texs[ti]['source']]; bv = j['bufferViews'][im_j['bufferView']]; raw = b[bv.get('byteOffset', 0): bv.get('byteOffset', 0) + bv['byteLength']]
    im = Image.open(io.BytesIO(raw)); im = im.convert('RGBA' if mode == 'PNG' else 'RGB')
    if max(im.size) > size: im = im.resize((size, size), Image.LANCZOS)
    bio = io.BytesIO(); im.save(bio, mode, **({'quality': 86} if mode == 'JPEG' else {'optimize': True}))
    tex_cache[key] = g.image(bio.getvalue(), 'image/jpeg' if mode == 'JPEG' else 'image/png'); return tex_cache[key]
def eye_image(ti):
    if ('eye', ti) in tex_cache: return tex_cache[('eye', ti)]
    im_j = imgs[texs[ti]['source']]; bv = j['bufferViews'][im_j['bufferView']]; raw = b[bv.get('byteOffset', 0): bv.get('byteOffset', 0) + bv['byteLength']]
    E = np.asarray(Image.open(io.BytesIO(raw)).convert('RGB').resize((512, 512), Image.LANCZOS)).astype(float) / 255
    E = E * 0.45 + np.array([0.93, 0.9, 0.86]) * 0.55   # a less bloodshot white
    yy_, xx_ = np.mgrid[0:512, 0:512]; dx = (xx_ - 256) / 512; dy = (yy_ - 257.5) / 512; r = np.hypot(dx, dy) / 0.125; an = np.arctan2(dy, dx)
    fib = 0.75 + 0.25 * np.sin(an * 37 + np.sin(an * 11) * 2) * np.cos(an * 23)
    iris = np.array([0.33, 0.21, 0.12])[None, None, :] * (fib[:, :, None] * (0.8 + 0.5 * np.clip(1 - r, 0, 1)[:, :, None]))
    iris = iris * np.where(r > 0.86, 0.55, 1.0)[:, :, None]                     # the dark ring at its edge
    a_ = np.clip((1.02 - r) / 0.06, 0, 1)[:, :, None]; E = E * (1 - a_) + iris * a_
    pu = np.clip((0.4 - r) / 0.05, 0, 1)[:, :, None]; E = E * (1 - pu) + 0.02 * pu   # the pupil
    tex_cache[('eye', ti)] = g.image(to_jpg(E, 90), 'image/jpeg'); return tex_cache[('eye', ti)]

def cc_mat(name):
    m = next(x for x in j['materials'] if x['name'] == name); pb = m.get('pbrMetallicRoughness', {})
    sizes = {'Std_Skin_Head': 1024, 'Std_Skin_Arm': 512, 'Std_Eye_R': 512, 'Std_Eye_L': 512}
    out = {'name': name, 'pbrMetallicRoughness': {'metallicFactor': 0.0, 'roughnessFactor': 0.5}, 'doubleSided': True}
    if name.startswith('Std_Cornea'):
        out['pbrMetallicRoughness'] = {'baseColorFactor': [1, 1, 1, 0.06], 'metallicFactor': 0, 'roughnessFactor': 0.03}; out['alphaMode'] = 'BLEND'; return g.material(out)
    if name.startswith('Std_Eye_') and 'baseColorTexture' in pb:
        out['pbrMetallicRoughness']['baseColorTexture'] = {'index': eye_image(pb['baseColorTexture']['index'])}; out['pbrMetallicRoughness']['roughnessFactor'] = 0.15; return g.material(out)
    if 'baseColorTexture' in pb:
        png = name == 'Std_Eyelash'
        out['pbrMetallicRoughness']['baseColorTexture'] = {'index': src_image(pb['baseColorTexture']['index'], sizes.get(name, 256), 'PNG' if png else 'JPEG')}
        if png: out['alphaMode'] = 'BLEND'
    if name.startswith('Std_Skin') or name == 'Std_Nails': out['pbrMetallicRoughness']['roughnessFactor'] = 0.55
    if name.startswith('Std_Eye_') : out['pbrMetallicRoughness']['roughnessFactor'] = 0.15
    return g.material(out)
def copy_mesh(mi, keep_prims=None, vfilter=None, name=None):
    m = j['meshes'][mi]; tn = m.get('extras', {}).get('targetNames', []); keep = [i for i, t in enumerate(tn) if t in KEEP_T]
    prims = []
    for pi, p in enumerate(m['primitives']):
        if keep_prims is not None and pi not in keep_prims: continue
        at = p['attributes']; P = A(at['POSITION']); I = A(p['indices']).reshape(-1, 3).astype(np.int64)
        N = A(at['NORMAL']) if 'NORMAL' in at else None; UV = A(at['TEXCOORD_0']) if 'TEXCOORD_0' in at else None
        J = A(at['JOINTS_0']).astype(np.int64); W = A(at['WEIGHTS_0'])
        tg = [{k: A(v) for k, v in p['targets'][ti].items() if k in ('POSITION', 'NORMAL')} for ti in keep] if keep else None
        mn = j['materials'][p['material']]['name']
        if vfilter and pi in vfilter:
            ok = vfilter[pi](P); fk = ok[I].all(1); I = I[fk]; vs, inv = np.unique(I, return_inverse=True); I = inv.reshape(-1, 3)
            P, N, UV, J, W = P[vs], (N[vs] if N is not None else None), (UV[vs] if UV is not None else None), J[vs], W[vs]
            if tg: tg = [{k: v[vs] for k, v in t.items()} for t in tg]
        if len(I) == 0: continue
        prims.append(g.prim(P, I, N, UV, J, W, mat=cc_mat(mn), targets=tg))
    add_mesh(name or m['name'], prims, [tn[i] for i in keep] if keep else None)
hands = lambda P: np.abs(P[:, 0]) > 0.69
copy_mesh(2, keep_prims={0, 2, 4}, vfilter={2: hands, 4: hands}, name='Body')   # the head (with the neck) and the hands with their nails
copy_mesh(3, name='Eyes'); copy_mesh(7, name='Teeth'); copy_mesh(8, name='Tongue')   # no lashes: their cards need an opacity map the file does not have

# ---------------- the skeleton, its skin, two of its pose clips ----------------
N0 = len(j['nodes']); g.j['nodes'] = []
for i, nd in enumerate(j['nodes']):
    x = {k: v for k, v in nd.items() if k not in ('mesh', 'skin')}
    g.j['nodes'].append(x)
rig = next(i for i, nd in enumerate(j['nodes']) if nd.get('name') == 'rig')
g.j['nodes'][rig].setdefault('children', [])
g.j['nodes'][rig]['children'] = [c for c in g.j['nodes'][rig]['children'] if 'mesh' not in j['nodes'][c]]
for nn in nodes_new: g.j['nodes'].append(nn); g.j['nodes'][rig]['children'].append(len(g.j['nodes']) - 1)
ibm = A(sk['inverseBindMatrices']).astype(np.float32)
g.j['skins'] = [{'name': 'rig', 'joints': JOINTS, 'inverseBindMatrices': g.acc(ibm, 'MAT4')}]
g.j['scenes'][0]['nodes'] = [rig]
g.j['animations'] = []
for an in j['animations']:
    if an.get('name') not in ('rig_fist', 'poses'): continue
    smp = []
    for s in an['samplers']:
        smp.append({'input': g.acc(A(s['input']).astype(np.float32).reshape(-1), 'SCALAR', minmax=True), 'output': g.acc(A(s['output']).astype(np.float32), {1: 'SCALAR', 3: 'VEC3', 4: 'VEC4'}[A(s['output']).shape[1]]), 'interpolation': s.get('interpolation', 'LINEAR')})
    g.j['animations'].append({'name': an['name'], 'samplers': smp, 'channels': [{'sampler': c['sampler'], 'target': c['target']} for c in an['channels']]})
size = g.save(OUT)
print('saved', OUT, round(size / 1048576, 2), 'MB'); print(json.dumps({k: v for k, v in report.items()}))
