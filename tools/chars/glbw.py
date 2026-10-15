"""glbw.py: a small glTF 2.0 (.glb) writer - buffers, accessors, meshes, materials, images; enough for skinned characters"""
import json, struct
import numpy as np


class GLB:
    def __init__(self):
        self.j = {'asset': {'version': '2.0', 'generator': 'yk-chars'}, 'scenes': [{'nodes': []}], 'scene': 0, 'nodes': [], 'meshes': [], 'materials': [], 'accessors': [], 'bufferViews': [], 'buffers': [{'byteLength': 0}]}
        self.bin = bytearray()

    def _view(self, data, target=None):
        while len(self.bin) % 4: self.bin += b'\0'
        off = len(self.bin); self.bin += data
        v = {'buffer': 0, 'byteOffset': off, 'byteLength': len(data)}
        if target: v['target'] = target
        self.j['bufferViews'].append(v); return len(self.j['bufferViews']) - 1

    def acc(self, arr, kind, target=None, normalized=False, minmax=False):
        arr = np.ascontiguousarray(arr)
        ct = {np.dtype(np.float32): 5126, np.dtype(np.uint32): 5125, np.dtype(np.uint16): 5123, np.dtype(np.uint8): 5121, np.dtype(np.int16): 5122, np.dtype(np.int8): 5120}[arr.dtype]
        n = 1 if arr.ndim == 1 else arr.shape[1]
        a = {'bufferView': self._view(arr.tobytes(), target), 'componentType': ct, 'count': int(arr.shape[0]), 'type': {1: 'SCALAR', 2: 'VEC2', 3: 'VEC3', 4: 'VEC4', 16: 'MAT4'}[n]}
        if normalized: a['normalized'] = True
        if minmax: a['min'] = arr.min(0).astype(float).tolist() if arr.ndim > 1 else [float(arr.min())]; a['max'] = arr.max(0).astype(float).tolist() if arr.ndim > 1 else [float(arr.max())]
        self.j['accessors'].append(a); return len(self.j['accessors']) - 1

    def prim(self, P, I, N=None, UV=None, J=None, W=None, mat=None, targets=None, color=None):
        at = {'POSITION': self.acc(P.astype(np.float32), 'VEC3', 34962, minmax=True)}
        if N is not None: at['NORMAL'] = self.acc(N.astype(np.float32), 'VEC3', 34962)
        if UV is not None: at['TEXCOORD_0'] = self.acc(UV.astype(np.float32), 'VEC2', 34962)
        if color is not None: at['COLOR_0'] = self.acc(color.astype(np.float32), 'VEC3', 34962)
        if J is not None: at['JOINTS_0'] = self.acc(J.astype(np.uint16 if J.max() > 255 else np.uint8), 'VEC4', 34962); at['WEIGHTS_0'] = self.acc(W.astype(np.float32), 'VEC4', 34962)
        idx = I.astype(np.uint32 if P.shape[0] > 65535 else np.uint16).reshape(-1)
        p = {'attributes': at, 'indices': self.acc(idx, 'SCALAR', 34963), 'mode': 4}
        if mat is not None: p['material'] = mat
        if targets:
            p['targets'] = []
            for t in targets:
                tt = {'POSITION': self.acc(t['POSITION'].astype(np.float32), 'VEC3', minmax=True)}
                if 'NORMAL' in t: tt['NORMAL'] = self.acc(t['NORMAL'].astype(np.float32), 'VEC3')
                p['targets'].append(tt)
        return p

    def image(self, data, mime):
        self.j.setdefault('images', []).append({'bufferView': self._view(data), 'mimeType': mime})
        self.j.setdefault('samplers', [{'magFilter': 9729, 'minFilter': 9987, 'wrapS': 10497, 'wrapT': 10497}])
        self.j.setdefault('textures', []).append({'sampler': 0, 'source': len(self.j['images']) - 1})
        return len(self.j['textures']) - 1

    def material(self, m):
        self.j['materials'].append(m); return len(self.j['materials']) - 1

    def save(self, path):
        while len(self.bin) % 4: self.bin += b'\0'
        self.j['buffers'][0]['byteLength'] = len(self.bin)
        for k in ['materials', 'meshes']:
            if not self.j[k]: del self.j[k]
        js = json.dumps(self.j, separators=(',', ':')).encode()
        while len(js) % 4: js += b' '
        total = 12 + 8 + len(js) + 8 + len(self.bin)
        with open(path, 'wb') as f:
            f.write(struct.pack('<III', 0x46546C67, 2, total)); f.write(struct.pack('<II', len(js), 0x4E4F534A)); f.write(js)
            f.write(struct.pack('<II', len(self.bin), 0x004E4942)); f.write(self.bin)
        return total


def smooth_normals(P, I):
    N = np.zeros_like(P, dtype=np.float64); T = P[I]
    fn = np.cross(T[:, 1] - T[:, 0], T[:, 2] - T[:, 0])
    for k in range(3): np.add.at(N, I[:, k], fn)
    L = np.linalg.norm(N, axis=1, keepdims=True); L[L == 0] = 1
    return (N / L).astype(np.float32)
