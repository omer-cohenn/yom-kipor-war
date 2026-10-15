"""ns_lod.py - levels of detail for the new soldier figure: each group of src/4e_soldier_data.js gets two lighter index buffers over the
same vertices (meshoptimizer, borders locked so the groups do not part), appended to the binary, so far soldiers keep the new figure.
Run again after build_game.py rewrites the data (it is idempotent: old levels are dropped first)."""
import json, base64, ctypes, re, sys
import numpy as np
MO = ctypes.CDLL('/home/claude/tools_src/meshoptimizer/libmeshopt.so'); MO.meshopt_simplify.restype = ctypes.c_size_t
P = '/home/claude/yom-kipor-war/src/4e_soldier_data.js'
src = open(P).read(); i0 = src.index('{'); d, end = json.JSONDecoder().raw_decode(src[i0:])
H = d['hdr']; buf = bytearray(base64.b64decode(d['bin']))
base_len = max(g['idx'] + g['i'] * 2 for g in H['groups'])
for g in H['groups']:
    for k in ('i1', 'idx1', 'i2', 'idx2'): g.pop(k, None)
    base_len = max(base_len, g['pos'] + g['v'] * 6, g['nrm'] + g['v'] * 3, g['uv'] + g['v'] * 8, g['si'] + g['v'] * 4, g['sw'] + g['v'] * 4)
buf = buf[:base_len]
mn = np.array(H['min']); sp = np.array(H['span'])
LV = [(0.34, 0.012), (0.12, 0.03)]
for g in H['groups']:
    q = np.frombuffer(bytes(buf[g['pos']:g['pos'] + g['v'] * 6]), dtype=np.int16).reshape(-1, 3).astype(np.float32)
    pos = np.ascontiguousarray(mn + ((q + 32768) / 65535) * sp, dtype=np.float32)
    idx = np.frombuffer(bytes(buf[g['idx']:g['idx'] + g['i'] * 2]), dtype=np.uint16).astype(np.uint32)
    for li, (ratio, err) in enumerate(LV, 1):
        small = g['name'] in ('eyes',) or g['i'] < 300
        target = g['i'] if small else max(3, int(g['i'] * ratio) // 3 * 3)
        out = np.zeros(len(idx), dtype=np.uint32); e = ctypes.c_float(0)
        n = MO.meshopt_simplify(out.ctypes.data_as(ctypes.c_void_p), idx.ctypes.data_as(ctypes.c_void_p), ctypes.c_size_t(len(idx)), pos.ctypes.data_as(ctypes.c_void_p), ctypes.c_size_t(len(pos)), ctypes.c_size_t(12), ctypes.c_size_t(target), ctypes.c_float(err), ctypes.c_uint(1), ctypes.byref(e)) if not small else len(idx)
        res = (out[:n] if not small else idx).astype(np.uint16)
        while len(buf) % 4: buf.append(0)
        g['idx%d' % li] = len(buf); g['i%d' % li] = int(len(res)); buf += res.tobytes()
    print(g['name'], g['i'] // 3, '->', g['i1'] // 3, g['i2'] // 3)
d['bin'] = base64.b64encode(bytes(buf)).decode()
out = src[:i0] + json.dumps(d, separators=(',', ':')) + src[i0 + end:]
open(P, 'w').write(out); print('tris', sum(g['i'] for g in H['groups']) // 3, '->', sum(g['i1'] for g in H['groups']) // 3, sum(g['i2'] for g in H['groups']) // 3, 'bytes', len(out))
