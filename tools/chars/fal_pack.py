"""fal_pack.py IN.json OUT.js: the FAL our soldiers hold (FAL_W, built in the game from the viewmodel's rifle by 4c_vm.js and taken out of a
running game as plain arrays) packed small for the showroom: positions 16-bit over the box, normals and colours 8-bit, not indexed."""
import json, sys, base64
import numpy as np
d = json.load(open(sys.argv[1])); P = np.array(d['P'], np.float64).reshape(-1, 3); N = np.array(d['N'], np.float64).reshape(-1, 3); C = np.array(d['C'], np.float64).reshape(-1, 3)
if d.get('I'): I = np.array(d['I'], np.int64); P, N, C = P[I], N[I], C[I]
lo = P.min(0); sc = np.maximum(P.max(0) - lo, 1e-6); q = np.round((P - lo) / sc * 65535).astype(np.uint16)
n = np.round(np.clip(N / np.maximum(np.linalg.norm(N, axis=1, keepdims=True), 1e-9), -1, 1) * 127).astype(np.int8); c = np.round(np.clip(C, 0, 1) * 255).astype(np.uint8)
b = lambda a: base64.b64encode(np.ascontiguousarray(a).tobytes()).decode()
out = {'v': len(P), 'lo': lo.round(5).tolist(), 'sc': [float('%.6g' % v) for v in sc], 'p': b(q), 'n': b(n), 'c': b(c)}
js = '/* the FAL in our soldiers\' hands (the game\'s FAL_W), for the showroom - written by tools/chars/fal_pack.py */\nwindow.FAL_W_DATA = ' + json.dumps(out, separators=(',', ':')) + ';\n'
open(sys.argv[2], 'w').write(js); print('verts', len(P), 'box', np.round(P.min(0), 3).tolist(), np.round(P.max(0), 3).tolist(), 'KB', len(js) // 1024)
