"""head_ar.py OUT.jpg: a second face for the Egyptian and Syrian soldiers - the figure's own face texture with a thick dark moustache, fuller
dark brows and short dark hair over the scalp, sideburns and nape (so no bare skull shows under the helmet). The skin tone itself is set by
the game (a tint on the skin materials), the same for the face and the hands"""
import io, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
sys.path.insert(0, __file__.rsplit('/', 1)[0])
import gltf
j, b = gltf.load('/mnt/user-data/uploads/Downloads/military+game+character+.glb')
p = j['meshes'][2]['primitives'][0]; P = gltf.acc(j, b, p['attributes']['POSITION']); UV = gltf.acc(j, b, p['attributes']['TEXCOORD_0']); I = gltf.acc(j, b, p['indices']).reshape(-1, 3)
m = next(x for x in j['materials'] if x['name'] == 'Std_Skin_Head'); ti = m['pbrMetallicRoughness']['baseColorTexture']['index']
im = j['images'][j['textures'][ti]['source']]; bv = j['bufferViews'][im['bufferView']]
T = Image.open(io.BytesIO(b[bv.get('byteOffset', 0): bv.get('byteOffset', 0) + bv['byteLength']])).convert('RGB')
S = int(sys.argv[2]) if len(sys.argv) > 2 else 2048; T = T.resize((S, S), Image.LANCZOS); K = S / 1024; x, y, z = P[:, 0], P[:, 1], P[:, 2]; ax = np.abs(x)
masks = {
    # the moustache: the upper lip from under the nose to the lip line, out to the corners of the mouth and a little down them
    'stache': ((y > 1.6405) & (y < 1.6545) & (ax < 0.033) & (z > 0.036)) | ((y > 1.631) & (y < 1.643) & (ax > 0.022) & (ax < 0.034) & (z > 0.03)),   # full width, its ends down past the corners of the mouth
    'brows': (y > 1.706) & (y < 1.726) & (ax > 0.006) & (ax < 0.066) & (z > 0.028),
    'hair': ((y > 1.772) | ((y > 1.66) & (z < -0.04)) | ((ax > 0.064) & (ax < 0.073) & (y > 1.69) & (y < 1.745) & (z > -0.01) & (z < 0.012))) & ~((ax > 0.074) & (y < 1.72)),
}
def paint(mask_v, blur):
    M = Image.new('L', (S, S), 0); dr = ImageDraw.Draw(M)
    for t in I:
        if mask_v[t].sum() >= 2:
            dr.polygon([(float(UV[k, 0] * S), float(UV[k, 1] * S)) for k in t], fill=255)
    return np.asarray(M.filter(ImageFilter.GaussianBlur(blur * K))).astype(float) / 255
A = np.asarray(T).astype(float) / 255
rng = np.random.default_rng(5); yy, xx = np.mgrid[0:S, 0:S] / K
strands = 0.75 + 0.25 * np.sin(xx * 1.7 + np.sin(yy * 0.31) * 3) * np.sin(yy * 2.3 + xx * 0.11)
noise = rng.random((S, S)) * 0.25
hairs = np.asarray(Image.fromarray((rng.random((S, S)) * 255).astype(np.uint8)).resize((S // 2, S * 2)).resize((S, S)).filter(ImageFilter.GaussianBlur(0.6 * K))).astype(float) / 255
for name, (col, blur, k) in {'hair': ([0.13, 0.095, 0.07], 3, 0.82), 'brows': ([0.1, 0.075, 0.055], 1.5, 0.55), 'stache': ([0.11, 0.08, 0.06], 4.5, 0.85)}.items():
    Mk = paint(masks[name], blur)[:, :, None] * k; C = np.array(col)[None, None, :] * (strands + noise)[:, :, None]
    if name == 'stache': Mk = Mk * (0.7 + 0.3 * hairs)[:, :, None]   # hair by hair, thinning toward its edges
    A = A * (1 - Mk) + C * Mk
    print(name, int(masks[name].sum()), 'vertices')
Image.fromarray(np.clip(A * 255, 0, 255).astype(np.uint8)).save(sys.argv[1], 'JPEG', quality=86); print('saved', sys.argv[1])
