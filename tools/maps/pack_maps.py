"""pack_maps.py [SRC]: the terrain maps made for the game outside it (SRC/tools/maps/<map>/, from the maps session) packed for the browser.

  public/maps/<map>.json  {v, z}: z is one zlib stream, in base64: 4 bytes of header length, a JSON header, then the layers, each 4-byte aligned:
                          h  heights, uint16, every sample stored as its difference from the plane through its left, upper and upper-left
                             neighbours (smooth ground packs to almost nothing); the game adds them back
                          c  colour (RGB), s splat weights (RGBA), v vegetation densities (RGBA), m mask (RGB: rocks, plants, keep clear)
                          fh fc  the Hermon's far backdrop: its heights (predicted the same way) and colour
  public/maps/mat/<set>/<material>_a.jpg   albedo with its ambient occlusion baked in
  public/maps/mat/<set>/<material>_n.jpg   normal x, y (OpenGL) in R, G and the material's height (for blending) in B
  public/maps/veg.json, veg_atlas.png      the vegetation cards: each kind's quads and their place on the atlas
Every coordinate in the header is the game's world (metres): box = [x0, x1, z0, z1], samples corner-aligned over it."""
import io, json, os, struct, sys, zlib
import numpy as np
from PIL import Image

SRC = (sys.argv[1] if len(sys.argv) > 1 else '/home/claude/yk_maps/raw').rstrip('/') + '/tools/maps'
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'public', 'maps')
MAPS = ['rescue', 'armor', 'farm', 'cross', 'hermon', 'army', 'range']

def predict(h):
    """uint16 heights -> uint16 residuals against the plane through the left, upper and upper-left samples"""
    h = h.astype(np.int64); p = np.zeros_like(h)
    p[0, 1:] = h[0, :-1]; p[1:, 0] = h[:-1, 0]; p[1:, 1:] = h[1:, :-1] + h[:-1, 1:] - h[:-1, :-1]
    return ((h - p) % 65536).astype(np.uint16)

def unpredict(r):   # the same as the game does, to check the round trip
    r = r.astype(np.int64); H, W = r.shape; h = np.zeros_like(r)
    for j in range(H):
        for i in range(W):
            p = 0 if (i == 0 and j == 0) else h[j, i - 1] if j == 0 else h[j - 1, i] if i == 0 else h[j, i - 1] + h[j - 1, i] - h[j - 1, i - 1]
            h[j, i] = (r[j, i] + p) % 65536
    return h

def img(path, mode):
    im = Image.open(path)
    if mode == 'I16':
        a = np.asarray(im)
        return a.astype(np.uint16) if a.dtype != np.uint16 else a
    return np.asarray(im.convert(mode))

# ---------- the splat and vegetation layers, made again ----------
# The delivered splat.png / veg.png were halved as RGBA, which wiped their colour channels wherever alpha was 0 (a third of the armour map,
# most of every vegetation layer). They are derived layers: made here again from the intact height, colour and mask by the maps session's
# own recipe (generator/postprocess.py), then halved channel by channel. The Hermon's splat came from elsewhere: its few empty pixels
# take their nearest neighbour's weights.
KIND = dict(armor='desert', army='desert', range='desert', rescue='agri', cross='agri', farm='agri', hermon='hermon')
def ss(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t)
def clump(shape, cells, seed):
    from scipy.ndimage import zoom
    r = np.random.default_rng(seed); g = r.random((cells, int(cells * shape[1] / shape[0]) + 1))
    z = zoom(g, (shape[0] / g.shape[0], shape[1] / g.shape[1]), order=3); return np.clip(z[:shape[0], :shape[1]], 0, 1)
def chan_resize(a, size):   # (H, W, C) floats -> (h, w, C), each channel on its own (no alpha premultiplying)
    return np.stack([np.asarray(Image.fromarray(a[..., c].astype(np.float32), 'F').resize(size, Image.BILINEAR)) for c in range(a.shape[2])], -1)
def remake_layers(d, J, h):
    from scipy.ndimage import gaussian_filter, distance_transform_edt
    nm = J['chapter']; kind = KIND[nm]; H, W = h.shape; b = J['box_local']; px = (b['x1'] - b['x0']) / (W - 1)
    rs = lambda f: np.asarray(Image.open(os.path.join(d, f)).convert('RGB').resize((W, H), Image.BILINEAR)).astype(np.float32) / 255
    col = rs('color.png'); mask = rs('mask.png')
    gz, gx = np.gradient(h, px, px); sl = np.degrees(np.arctan(np.hypot(gx, gz))); sig = lambda m: max(m / px, 0.5)
    lows = np.clip(gaussian_filter(h, sig(25)) - h, 0, 3) / 3
    relief = np.sqrt(np.clip(gaussian_filter(h ** 2, sig(15)) - gaussian_filter(h, sig(15)) ** 2, 0, None))
    green = ss(0.015, 0.07, col[..., 1] - 0.5 * (col[..., 0] + col[..., 2])); strong_green = ss(0.05, 0.1, col[..., 1] - 0.5 * (col[..., 0] + col[..., 2]))
    if J.get('water_level') is not None and h.min() < -0.2: dw = distance_transform_edt(h > -0.15) * px; wet = (1 - ss(2.0, 22.0, dw)) * (h > -0.15)
    else: wet = np.zeros_like(h)
    under = (h < -0.15).astype(np.float32); clear = mask[..., 2]
    c1, c2, c3 = clump((H, W), max(4, int(H * px / 25)), 1), clump((H, W), max(4, int(H * px / 60)), 2), clump((H, W), max(4, int(H * px / 9)), 3)
    flat = 1 - ss(4, 12, sl); half = (J['splat']['size_px'][0], J['splat']['size_px'][1])
    if kind == 'hermon':
        sp0 = np.asarray(Image.open(os.path.join(d, 'splat.png'))).astype(np.float32); bad = sp0.sum(-1) < 8
        if bad.any(): idx = distance_transform_edt(bad, return_distances=False, return_indices=True); sp0 = sp0[idx[0], idx[1]]
        sp_half = sp0 / np.maximum(sp0.sum(-1, keepdims=True), 1); sp = chan_resize(sp_half, (W, H)); sp /= np.maximum(sp.sum(-1, keepdims=True), 1e-6)
    else:
        if kind == 'desert':
            rock = np.clip(0.9 * mask[..., 0] + ss(14, 26, sl), 0, 1); pave = flat * (1 - ss(0.25, 0.9, relief)) * (0.4 + 0.6 * c1) * (1 - 0.7 * lows)
            sab = np.clip(ss(0.25, 0.7, lows) * flat + 1.2 * wet, 0, 1); sand = np.full_like(h, 0.45) + 0.6 * ss(0.3, 1.2, relief); sp = np.stack([sand, pave, sab, rock], -1)
        else:
            field = green; mud = np.clip(1.4 * wet + 0.6 * under + 0.4 * ss(0.4, 0.9, lows) * green, 0, 1)
            grass = np.clip(0.55 * mask[..., 1] * (1 - field) + 0.25 * c1 * flat * (1 - field), 0, 1); sand = np.clip(0.5 * (1 - field) + 0.3 * ss(0.3, 1.2, relief), 0, 1)
            sp = np.stack([sand, field, mud, grass], -1)
        sp = np.clip(sp, 1e-4, None) ** 1.5; sp /= sp.sum(-1, keepdims=True)
    no = (1 - clear) * (1 - under) * (1 - ss(28, 38, sl))
    if kind == 'hermon':
        lime, grassw, terra = sp[..., 0], sp[..., 1], sp[..., 2]; zfrac = np.linspace(1, 0, H)[:, None] * np.ones((1, W))
        R = np.clip(1.1 * grassw * (0.5 + 0.5 * c3), 0, 1); G = np.clip((0.7 * (grassw + terra) * (1 - lime) + 0.4 * mask[..., 1]) * ss(0.35, 0.7, c1), 0, 1)
        B = np.clip(ss(0.72, 0.9, c2) * flat * (0.3 + 0.7 * zfrac) * (1 - lime), 0, 1); A = np.zeros_like(h)
    elif kind == 'desert':
        R = np.clip((0.12 + 0.5 * mask[..., 1] + 0.5 * lows) * (0.3 + 0.7 * c3) * (1 - sp[..., 3]), 0, 1)
        G = np.clip((0.18 * c1 + 0.6 * mask[..., 1] + 0.9 * ss(0.15, 0.6, lows) + 0.4 * wet) * (1 - 0.6 * sp[..., 3]), 0, 1)
        B = np.clip((0.9 * ss(0.3, 0.8, lows) + 0.7 * wet + 0.6 * strong_green) * ss(0.5, 0.85, c2), 0, 1)
        A = np.clip((0.9 * wet + 0.7 * strong_green) * ss(0.55, 0.8, c2), 0, 1)
    else:
        edge_f = np.clip(green, 0, 1) * (1 - ss(0.3, 0.6, c3))
        R = np.clip((0.12 * green + 0.25 * edge_f + 0.9 * wet + 0.45 * mask[..., 1] * (1 - green)) * (0.4 + 0.6 * c3), 0, 1)
        G = np.clip(((1 - green) * 0.25 * c1 + 0.4 * mask[..., 1] + 0.5 * ss(0.2, 0.7, lows) * (1 - green)), 0, 1)
        B = np.clip((0.25 * green * ss(0.45, 0.8, c2) + 0.6 * wet * ss(0.4, 0.8, c2)), 0, 1)
        A = np.clip(1.2 * wet * (0.5 + 0.5 * c3), 0, 1)
    veg = np.stack([R, G, B, A], -1) * no[..., None]
    q = lambda a: (np.clip(a, 0, 1) * 255 + 0.5).astype(np.uint8)
    return q(chan_resize(sp, half) if kind != 'hermon' else sp_half), q(chan_resize(veg, half))

def pack_map(name):
    d = os.path.join(SRC, name); J = json.load(open(os.path.join(d, 'map.json')))
    b = J['box']; hdr = {'name': name, 'box': [b['x0'], b['x1'], b['z0'], b['z1']], 'origin': J['origin'], 'hmin': J['height']['hmin'], 'hmax': J['height']['hmax'], 'layers': {}}
    layers = []
    def add(key, arr, kind):
        layers.append((key, np.ascontiguousarray(arr), kind))
    h = img(os.path.join(d, 'height.png'), 'I16'); add('h', predict(h), 'u16'); hdr['size'] = [h.shape[1], h.shape[0]]
    hm = J['height']; hf = hm['hmin'] + h.astype(np.float32) / 65535 * (hm['hmax'] - hm['hmin']); spl, veg = remake_layers(d, J, hf)
    for key, f, mode in (('c', 'color.png', 'RGB'), ('s', None, spl), ('v', None, veg), ('m', 'mask.png', 'RGB')):
        a = img(os.path.join(d, f), mode) if f else mode; add(key, a, 'u8'); hdr['layers'][key] = {'size': [a.shape[1], a.shape[0]], 'ch': a.shape[2]}
    hdr['vegMean'] = [round(float(veg[..., c].mean()) / 255, 3) for c in range(4)]; hdr['splatZero'] = round(float((spl.astype(int).sum(-1) < 8).mean()), 4)
    sp = J.get('splat') or {}
    if sp:
        hdr['set'] = sp.get('set'); hdr['mats'] = [sp['channels'][k] for k in 'RGBA']
    vg = J.get('vegetation') or {}
    if vg:
        hdr['veg'] = {k: [[e['type'], e['share']] for e in vg['channels'].get(k, [])] for k in 'RGBA'}; hdr['vegMax'] = [vg['max_per_m2'].get(k, 0) for k in 'RGBA']
    far = J.get('far')
    if far:
        fh = img(os.path.join(d, far['file']), 'I16'); fc = img(os.path.join(d, far['color']), 'RGB'); o = J['origin']; fb = far['box_local']
        add('fh', predict(fh), 'u16'); add('fc', fc, 'u8')
        hdr['far'] = {'box': [o[0] + fb['x0'], o[0] + fb['x1'], o[1] + fb['z0'], o[1] + fb['z1']], 'hmin': far['hmin'], 'hmax': far['hmax'], 'size': [fh.shape[1], fh.shape[0]], 'csize': [fc.shape[1], fc.shape[0]]}
    # the layers one after another, each 4-byte aligned, after the header
    body = bytearray(); off = {}
    for key, a, kind in layers:
        while len(body) % 4: body.append(0)
        off[key] = [len(body), a.nbytes, kind]; body += a.tobytes()
    hdr['off'] = off
    hj = json.dumps(hdr, separators=(',', ':')).encode(); pad = (-(4 + len(hj))) % 4; hj += b' ' * pad
    raw = struct.pack('<I', len(hj)) + hj + bytes(body)
    z = zlib.compress(raw, 9); json.dump({'v': 1, 'z': __import__('base64').b64encode(z).decode()}, open(os.path.join(OUT, name + '.json'), 'w'))   # base64 in JSON: served everywhere (an artifact serves no .bin)
    assert np.array_equal(unpredict(predict(h[:40, :40])), h[:40, :40])
    print(f'{name}: {hdr["size"]} heights {hdr["hmin"]}..{hdr["hmax"]}, veg {hdr["vegMean"]}, empty splat {hdr["splatZero"]}, {len(raw) // 1024} KB -> {len(z) // 1024} KB')
    return hdr

def pack_materials(sets):
    """each set's four materials: albedo x AO, and normal x, y + height; and a manifest the game reads (tile size, blend depth, roughness)"""
    man = {}
    for st in sets:
        md = os.path.join(SRC, 'materials', st); os.makedirs(os.path.join(OUT, 'mat', st), exist_ok=True); man[st] = []
        for m in json.load(open(os.path.join(md, 'materials.json'))):
            p = os.path.join(md, m['name']); a = np.asarray(Image.open(os.path.join(p, 'albedo.jpg')).convert('RGB')).astype(float)
            r = np.asarray(Image.open(os.path.join(p, 'rah.png')).convert('RGB')).astype(float); n = np.asarray(Image.open(os.path.join(p, 'normal_gl.png')).convert('RGB')).astype(float)
            ao = r[:, :, 1:2] / 255; A = np.clip(a * (0.35 + 0.65 * ao), 0, 255).astype(np.uint8)
            N = np.dstack([n[:, :, 0], n[:, :, 1], r[:, :, 2]]).astype(np.uint8)
            Image.fromarray(A).save(os.path.join(OUT, 'mat', st, m['name'] + '_a.jpg'), quality=86, optimize=True)
            Image.fromarray(N).save(os.path.join(OUT, 'mat', st, m['name'] + '_n.jpg'), quality=90, optimize=True)
            man[st].append({'name': m['name'], 'size': m['size_m'], 'depth': m['depth_m'], 'rough': round(float(r[:, :, 0].mean() / 255), 3), 'avg': [round(float(v) / 255, 4) for v in A.reshape(-1, 3).mean(0)]})
    json.dump(man, open(os.path.join(OUT, 'mat', 'materials.json'), 'w'), separators=(',', ':'))
    print('materials', {k: [m['name'] for m in v] for k, v in man.items()})

def pack_veg():
    """the vegetation cards out of veg_models.glb: per kind its quads (positions in metres, standing on y=0) and atlas uvs"""
    sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'chars')); import gltf
    j, b = gltf.load(os.path.join(SRC, 'vegetation', 'veg_models.glb')); A = lambda i: gltf.acc(j, b, i); kinds = {}
    for m in j['meshes']:
        P, U, I = [], [], []
        for pr in m['primitives']:
            o = sum(len(x) for x in P); P.append(A(pr['attributes']['POSITION'])); U.append(A(pr['attributes']['TEXCOORD_0'])); I.append(A(pr['indices']).reshape(-1) + o)
        P = np.concatenate(P); U = np.concatenate(U); I = np.concatenate(I)
        kinds[m['name']] = {'p': [round(float(v), 4) for v in P.reshape(-1)], 'uv': [round(float(v), 5) for v in U.reshape(-1)], 'i': [int(v) for v in I]}
    types = json.load(open(os.path.join(SRC, 'vegetation', 'veg_types.json')))
    json.dump({'kinds': kinds, 'types': types}, open(os.path.join(OUT, 'veg.json'), 'w'), separators=(',', ':'))
    at = Image.open(os.path.join(SRC, 'vegetation', 'veg_atlas.png')).convert('RGBA').resize((1024, 512), Image.LANCZOS)
    at.save(os.path.join(OUT, 'veg_atlas.png'), optimize=True)
    print('vegetation', list(kinds), os.path.getsize(os.path.join(OUT, 'veg_atlas.png')) // 1024, 'KB atlas')

if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True); sets = set()
    for n in MAPS:
        h = pack_map(n); sets.add(h.get('set'))
    pack_materials(sorted(s for s in sets if s)); pack_veg()
    tot = sum(os.path.getsize(os.path.join(dp, f)) for dp, _, fs in os.walk(OUT) for f in fs); print('total', tot // 1024, 'KB')
