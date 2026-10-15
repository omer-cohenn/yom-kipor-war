
/* ================= models from the asset pipeline =================
   Downloaded models, cut down and packed by tools/assets/pack.py into the 4f_data_*.js files. Each model has up to three levels of detail,
   each a list of parts (one per material): positions 16-bit over the part's box, normals 8-bit, uvs 16-bit over their range, indices 16 or
   32-bit. Its textures are small JPEGs. mdlGeo / mdlMats unpack once and keep; mdlMesh gives a group to place, mdlInst one InstancedMesh per
   part for many copies. box: the model's size in metres (x, y, z), standing on y = 0 and centred on x and z. */
const MDL_DATA = {}, MDL_TEX = {}, _MDL_GEO = {}, _MDL_MAT = {}, _MDL_TX = {};
function MDL_ADD(d, t) { Object.assign(MDL_DATA, d); Object.assign(MDL_TEX, t || {}); }
const _mb64 = (s) => { const b = atob(s), u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u.buffer; };
const mdlHas = (name) => !!MDL_DATA[name];
const mdlBox = (name) => MDL_DATA[name].box;
function mdlTex(key, srgb = true) {
  const k = key + (srgb ? '' : '|lin'); if (_MDL_TX[k]) return _MDL_TX[k];
  const img = new Image(), t = new THREE.Texture(img); img.onload = () => { t.needsUpdate = true; }; img.src = MDL_TEX[key];
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = ANISO; return (_MDL_TX[k] = t);
}
// the level of detail asked for, or the nearest one the model has
function mdlGeo(name, lod = 0) {
  const d = MDL_DATA[name], L = Math.min(lod, d.lods.length - 1), key = name + '#' + L; if (_MDL_GEO[key]) return _MDL_GEO[key];
  return (_MDL_GEO[key] = d.lods[L].map((q) => {
    const P = new Uint16Array(_mb64(q.p)), N = new Int8Array(_mb64(q.nr)), U = new Uint16Array(_mb64(q.uv)), I = q.i32 ? new Uint32Array(_mb64(q.i)) : new Uint16Array(_mb64(q.i));
    const pos = new Float32Array(q.n * 3), nrm = new Float32Array(q.n * 3), uv = new Float32Array(q.n * 2);
    for (let i = 0; i < q.n; i++) { for (let k = 0; k < 3; k++) { pos[i * 3 + k] = q.lo[k] + (P[i * 3 + k] / 65535) * q.sc[k]; nrm[i * 3 + k] = N[i * 3 + k] / 127; } uv[i * 2] = q.ulo[0] + (U[i * 2] / 65535) * q.usc[0]; uv[i * 2 + 1] = q.ulo[1] + (U[i * 2 + 1] / 65535) * q.usc[1]; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nrm, 3)); g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); g.setIndex(new THREE.BufferAttribute(I, 1));
    g.computeBoundingSphere(); return { g, m: q.m };
  }));
}
// its materials; o: { color, rough, metal } override every part (a tint for one side, a burnt look), tag keeps the variant apart
function mdlMats(name, o = null, tag = '') {
  const key = name + '|' + tag; if (_MDL_MAT[key]) return _MDL_MAT[key];
  return (_MDL_MAT[key] = MDL_DATA[name].mats.map((m) => {
    const mat = new THREE.MeshStandardMaterial({ color: (o && o.color) ?? m.color, roughness: (o && o.rough) ?? m.rough, metalness: (o && o.metal) ?? m.metal });
    if (m.map) mat.map = mdlTex(m.map); if (m.nmap && !LITE) { mat.normalMap = mdlTex(m.nmap, false); mat.normalScale.set(0.8, 0.8); }
    return mat;
  }));
}
// one placed copy: a group of meshes sharing the model's geometry and materials
function mdlMesh(name, lod = 0, mats = null) {
  const g = new THREE.Group(), ms = mats || mdlMats(name);
  for (const p of mdlGeo(name, lod)) { const m = new THREE.Mesh(p.g, ms[p.m]); g.add(m); }
  return g;
}
// many copies: one InstancedMesh per part, from a list of matrices
function mdlInst(name, lod, mats4, mats = null, cast = true) {
  const ms = mats || mdlMats(name), out = [];
  for (const p of mdlGeo(name, lod)) { const im = new THREE.InstancedMesh(p.g, ms[p.m], mats4.length); mats4.forEach((M, i) => im.setMatrixAt(i, M)); im.instanceMatrix.needsUpdate = true; im.computeBoundingSphere(); out.push(SH(onLayer1(im), cast, true)); scene.add(im); }
  return out;
}
// a model that changes its level of detail with the distance (three updates a LOD object every frame by itself); dists: where each level starts
function mdlLOD(name, mats = null, dists = [0, 35, 100]) {
  const lod = new THREE.LOD(), n = MDL_DATA[name].lods.length, ms = mats || mdlMats(name);
  for (let l = 0; l < n && l < dists.length; l++) lod.addLevel(mdlMesh(name, l, ms), dists[l]);
  return lod;
}
