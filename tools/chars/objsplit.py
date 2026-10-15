"""objsplit.py: read the OBJ, split it into connected pieces (faces that share a vertex), and save them (npz) with a summary"""
import numpy as np, sys
V = []; VT = []; F = []; FT = []
for l in open(sys.argv[1]):
    if l.startswith('v '): V.append([float(x) for x in l.split()[1:4]])
    elif l.startswith('vt '): VT.append([float(x) if 'IND' not in x and 'INF' not in x else 0.0 for x in l.split()[1:3]])
    elif l.startswith('f '):
        idx = [x.split('/') for x in l.split()[1:]]
        f = [int(a[0]) - 1 for a in idx]; ft = [int(a[1]) - 1 if len(a) > 1 and a[1] else -1 for a in idx]
        for k in range(1, len(f) - 1): F.append([f[0], f[k], f[k + 1]]); FT.append([ft[0], ft[k], ft[k + 1]])
V = np.array(V); VT = np.array(VT) if VT else np.zeros((0, 2)); F = np.array(F); FT = np.array(FT)
par = np.arange(len(V))
def find(a):
    while par[a] != a: par[a] = par[par[a]]; a = par[a]
    return a
for f in F:
    a = find(f[0])
    for v in f[1:]:
        b = find(v)
        if a != b: par[b] = a
root = np.array([find(i) for i in range(len(V))]); comp_of_face = root[F[:, 0]]
ids, inv = np.unique(comp_of_face, return_inverse=True)
print(len(V), 'verts', len(F), 'tris', len(ids), 'pieces')
info = []
for k, cid in enumerate(ids):
    fs = np.where(inv == k)[0]; vs = np.unique(F[fs]); P = V[vs]
    info.append((k, len(fs), P.min(0), P.max(0), P.mean(0)))
info.sort(key=lambda t: -t[1])
for k, n, mn, mx, c in info[:80]: print(k, n, 'min', mn.round(0), 'max', mx.round(0), 'c', c.round(0))
np.savez(sys.argv[2], V=V, VT=VT, F=F, FT=FT, piece=inv)
