"""gltf.py: read a .glb into its JSON and binary chunk, and accessors into numpy arrays (enough for the character work)"""
import json, struct
import numpy as np

CT = {5120: np.int8, 5121: np.uint8, 5122: np.int16, 5123: np.uint16, 5125: np.uint32, 5126: np.float32}
NC = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4, 'MAT2': 4, 'MAT3': 9, 'MAT4': 16}


def load(path):
    with open(path, 'rb') as f:
        magic, ver, length = struct.unpack('<III', f.read(12))
        assert magic == 0x46546C67, 'not a glb'
        l, t = struct.unpack('<II', f.read(8)); j = json.loads(f.read(l))
        l2, t2 = struct.unpack('<II', f.read(8)); b = f.read(l2)
    return j, b


def acc(j, b, i):
    a = j['accessors'][i]; n = NC[a['type']]; dt = CT[a['componentType']]; cnt = a['count']
    if 'bufferView' in a:
        bv = j['bufferViews'][a['bufferView']]; off = bv.get('byteOffset', 0) + a.get('byteOffset', 0); stride = bv.get('byteStride', 0)
        isz = np.dtype(dt).itemsize * n
        if stride and stride != isz:
            raw = np.frombuffer(b, dtype=np.uint8, count=stride * (cnt - 1) + isz, offset=off)
            out = np.lib.stride_tricks.as_strided(raw, shape=(cnt, isz), strides=(stride, 1)).copy().view(dt).reshape(cnt, n)
        else:
            out = np.frombuffer(b, dtype=dt, count=cnt * n, offset=off).reshape(cnt, n).copy()
    else:
        out = np.zeros((cnt, n), dt)
    if 'sparse' in a:
        sp = a['sparse']; k = sp['count']
        iv = j['bufferViews'][sp['indices']['bufferView']]; idx = np.frombuffer(b, dtype=CT[sp['indices']['componentType']], count=k, offset=iv.get('byteOffset', 0) + sp['indices'].get('byteOffset', 0))
        vv = j['bufferViews'][sp['values']['bufferView']]; val = np.frombuffer(b, dtype=dt, count=k * n, offset=vv.get('byteOffset', 0) + sp['values'].get('byteOffset', 0)).reshape(k, n)
        out = out.astype(dt).copy(); out[idx.astype(np.int64)] = val
    if a.get('normalized') and dt != np.float32:
        out = out.astype(np.float32) / np.iinfo(dt).max
    return out


def node_mats(j):
    """every node's matrix in the scene (rest pose)"""
    from numpy.linalg import multi_dot
    N = j['nodes']; par = {}
    for i, n in enumerate(N):
        for c in n.get('children', []): par[c] = i
    loc = []
    for n in N:
        if 'matrix' in n: m = np.array(n['matrix'], np.float64).reshape(4, 4).T
        else:
            t = n.get('translation', [0, 0, 0]); r = n.get('rotation', [0, 0, 0, 1]); s = n.get('scale', [1, 1, 1])
            x, y, z, w = r
            R = np.array([[1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w)], [2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w)], [2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y)]])
            m = np.eye(4); m[:3, :3] = R * np.array(s); m[:3, 3] = t
        loc.append(m)
    W = [None] * len(N)
    def world(i):
        if W[i] is None: W[i] = loc[i] if i not in par else world(par[i]) @ loc[i]
        return W[i]
    for i in range(len(N)): world(i)
    return W, par
