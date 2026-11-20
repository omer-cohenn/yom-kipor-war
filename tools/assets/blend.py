"""blend.py FILE OUTDIR - read the meshes and images out of a .blend (2.8x, little-endian, 64-bit) with no Blender: walks the file's own
DNA to find Mesh (mvert, mpoly, mloop, mloopuv), Object (its matrix, data, particle systems) and Image (name, packed file); writes each mesh
as OUTDIR/<name>.npz (P, U, I) and every packed image as a file."""
import struct, sys, os, numpy as np
b = open(sys.argv[1], 'rb').read(); OUT = sys.argv[2]; os.makedirs(OUT, exist_ok=True)
assert b[7:9] == b'-v', 'only 64-bit little-endian'
blocks, o, byptr = [], 12, {}
while o < len(b):
    code = b[o:o + 4].rstrip(b'\0').decode('latin1'); size, = struct.unpack_from('<i', b, o + 4); old, = struct.unpack_from('<Q', b, o + 8); sdna, cnt = struct.unpack_from('<ii', b, o + 16)
    blk = dict(code=code, size=size, old=old, sdna=sdna, cnt=cnt, off=o + 24); blocks.append(blk); byptr[old] = blk; o += 24 + size
    if code == 'ENDB': break
dna = next(x for x in blocks if x['code'] == 'DNA1'); p = dna['off']
def rd_names(p, tag):
    assert b[p:p + 4] == tag, (b[p:p + 4], tag); n, = struct.unpack_from('<i', b, p + 4); p += 8; out = []
    for _ in range(n): e = b.index(b'\0', p); out.append(b[p:e].decode('latin1')); p = e + 1
    return out, p
p += 4; names, p = rd_names(p, b'NAME'); p = (p + 3) & ~3; types, p = rd_names(p, b'TYPE'); p = (p + 3) & ~3
assert b[p:p + 4] == b'TLEN'; p += 4; tlen = list(struct.unpack_from('<%dh' % len(types), b, p)); p += 2 * len(types); p = (p + 3) & ~3
assert b[p:p + 4] == b'STRC'; n, = struct.unpack_from('<i', b, p + 4); p += 8; structs = []
for _ in range(n):
    t, nf = struct.unpack_from('<hh', b, p); p += 4; f = []
    for _ in range(nf): ft, fn = struct.unpack_from('<hh', b, p); p += 4; f.append((types[ft], names[fn]))
    structs.append((types[t], f))
sidx = {s[0]: i for i, s in enumerate(structs)}
def layout(sname):
    off, out = 0, {}
    for t, nm in structs[sidx[sname]][1]:
        base = nm.split('[')[0]; dims = [int(x) for x in __import__('re').findall(r'\[(\d+)\]', nm)]; cnt = int(np.prod(dims)) if dims else 1
        sz = 8 if (nm.startswith('*') or nm.startswith('(*')) else tlen[types.index(t)]
        out[base] = (off, t, sz, cnt); off += sz * cnt
    return out, off
def field(blk, sname, fname, i=0):
    L, size = layout(sname); off, t, sz, cnt = L[fname]; at = blk['off'] + i * size + off
    if fname.startswith('*'): return struct.unpack_from('<Q', b, at)[0]
    fmt = {'int': 'i', 'float': 'f', 'short': 'h', 'char': 'b', 'uchar': 'B'}.get(t)
    if fmt and cnt > 1: return struct.unpack_from('<%d%s' % (cnt, fmt), b, at)
    if fmt: return struct.unpack_from('<' + fmt, b, at)[0]
    return at
def idname(blk): at = field(blk, blk['_s'], 'id'); return b[at + 32: at + 32 + 66].split(b'\0')[0].decode('latin1')   # ID: next, prev, newid, lib (4 ptrs), then name[66]
for blk in blocks: blk['_s'] = structs[blk['sdna']][0] if blk['sdna'] < len(structs) else None
info = {}
for blk in blocks:
    if blk['code'] == 'ME':
        nm = idname(blk); tv, tp, tl = field(blk, 'Mesh', 'totvert'), field(blk, 'Mesh', 'totpoly'), field(blk, 'Mesh', 'totloop')
        V = byptr[field(blk, 'Mesh', '*mvert')]; Lv, vs = layout('MVert'); P = np.array([struct.unpack_from('<3f', b, V['off'] + i * vs + Lv['co'][0]) for i in range(tv)], np.float32)
        Pb = byptr[field(blk, 'Mesh', '*mpoly')]; Lp, ps = layout('MPoly'); polys = [(struct.unpack_from('<i', b, Pb['off'] + i * ps + Lp['loopstart'][0])[0], struct.unpack_from('<i', b, Pb['off'] + i * ps + Lp['totloop'][0])[0], struct.unpack_from('<h', b, Pb['off'] + i * ps + Lp['mat_nr'][0])[0]) for i in range(tp)]
        Lb = byptr[field(blk, 'Mesh', '*mloop')]; Ll, ls = layout('MLoop'); loops = np.array([struct.unpack_from('<i', b, Lb['off'] + i * ls + Ll['v'][0])[0] for i in range(tl)])
        uvp = field(blk, 'Mesh', '*mloopuv'); U = None
        if uvp and uvp in byptr: Ub = byptr[uvp]; Lu, us = layout('MLoopUV'); U = np.array([struct.unpack_from('<2f', b, Ub['off'] + i * us + Lu['uv'][0]) for i in range(tl)], np.float32)
        tri, triL, mat = [], [], []
        for ls0, n, m in polys:
            for k in range(1, n - 1): tri.append((loops[ls0], loops[ls0 + k], loops[ls0 + k + 1])); triL.append((ls0, ls0 + k, ls0 + k + 1)); mat.append(m)
        triL = np.array(triL); PP = P[loops[triL.ravel()]] if len(triL) else P[:0]; UU = U[triL.ravel()] if U is not None and len(triL) else np.zeros((len(PP), 2), np.float32)
        np.savez(os.path.join(OUT, nm + '.npz'), P=PP, U=UU, M=np.repeat(np.array(mat), 3)); info[nm] = dict(verts=tv, polys=tp, tris=len(triL), lo=P.min(0).round(3).tolist() if tv else None, hi=P.max(0).round(3).tolist() if tv else None, uv=U is not None)
    if blk['code'] == 'IM':
        nm = idname(blk); L, _ = layout('Image'); path = b[blk['off'] + L['name'][0]: blk['off'] + L['name'][0] + 1024].split(b'\0')[0].decode('latin1'); pk = field(blk, 'Image', '*packedfile') if '*packedfile' in L else 0
        got = None
        if not pk and 'packedfiles' in L:
            lb = blk['off'] + L['packedfiles'][0]; first, = struct.unpack_from('<Q', b, lb)
            if first in byptr and byptr[first]['code'] == 'DATA':
                try: pk = field(byptr[first], 'ImagePackedFile', '*packedfile')
                except Exception: pk = 0
        if pk and pk in byptr: pf = byptr[pk]; sz, = struct.unpack_from('<i', b, pf['off'] + layout('PackedFile')[0]['size'][0]); dp, = struct.unpack_from('<Q', b, pf['off'] + layout('PackedFile')[0]['*data'][0]); d = byptr[dp]; got = os.path.join(OUT, os.path.basename(path.replace('\\', '/')) or nm); open(got, 'wb').write(b[d['off']: d['off'] + sz])
        info['IM:' + nm] = dict(path=path, packed=got)
    if blk['code'] == 'OB':
        nm = idname(blk); L, _ = layout('Object'); M = struct.unpack_from('<16f', b, blk['off'] + L['obmat'][0]); dp = field(blk, 'Object', '*data'); info['OB:' + nm] = dict(data=idname(byptr[dp]) if dp in byptr and byptr[dp]['_s'] else None, loc=[round(v, 3) for v in M[12:15]], scale=[round(np.linalg.norm(M[0:3]), 3), round(np.linalg.norm(M[4:7]), 3), round(np.linalg.norm(M[8:11]), 3)])
import json; print(json.dumps(info, indent=1))
