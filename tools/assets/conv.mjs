// conv.mjs IN OUTPREFIX : read an FBX / OBJ with three's own loaders (no browser), write OUT.json (meshes, materials, texture names) + OUT.bin
// Every mesh is baked into world space and split by material group. Textures are not loaded, only named: the python side finds the files.
import * as THREE from '/home/claude/mezach/test/three/build/three.module.js';
import fs from 'fs';
globalThis.window = globalThis; globalThis.self = globalThis;
import path from 'path';
THREE.TextureLoader.prototype.load = function (url) { const t = new THREE.Texture(); t.name = String(url); t.userData.url = String(url); return t; };
THREE.ImageLoader.prototype.load = function (url) { return { src: url }; };
const [inp, out] = process.argv.slice(2);
const ext = path.extname(inp).toLowerCase();
let root;
if (ext === '.fbx') {
  const { FBXLoader } = await import('/home/claude/mezach/test/three/examples/jsm/loaders/FBXLoader.js');
  const buf = fs.readFileSync(inp); root = new FBXLoader().parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength), path.dirname(inp) + '/');
} else if (ext === '.obj') {
  const { OBJLoader } = await import('/home/claude/mezach/test/three/examples/jsm/loaders/OBJLoader.js');
  root = new OBJLoader().parse(fs.readFileSync(inp, 'utf8'));
} else throw new Error('unsupported ' + ext);
root.updateMatrixWorld(true);
const meshes = [], chunks = []; let off = 0;
const put = (arr) => { const b = Buffer.from(arr.buffer, arr.byteOffset, arr.byteLength); chunks.push(b); const o = off; off += b.length; return [o, arr.length]; };
const texOf = (m, k) => (m && m[k] && (m[k].userData.url || m[k].name)) || null;
root.traverse((o) => {
  if (!o.isMesh) return;
  let g = o.geometry.clone(); g.applyMatrix4(o.matrixWorld);
  if (!g.attributes.normal) g.computeVertexNormals();
  const mats = Array.isArray(o.material) ? o.material : [o.material];
  const groups = g.groups && g.groups.length ? g.groups : [{ start: 0, count: g.index ? g.index.count : g.attributes.position.count, materialIndex: 0 }];
  const idxAll = g.index ? g.index.array : null;
  for (const gr of groups) {
    const m = mats[gr.materialIndex] || mats[0];
    // the triangles of this group as their own vertex list
    const n = gr.count, P = new Float32Array(n * 3), N = new Float32Array(n * 3), U = new Float32Array(n * 2);
    const pa = g.attributes.position, na = g.attributes.normal, ua = g.attributes.uv;
    for (let i = 0; i < n; i++) { const v = idxAll ? idxAll[gr.start + i] : gr.start + i; P[i * 3] = pa.getX(v); P[i * 3 + 1] = pa.getY(v); P[i * 3 + 2] = pa.getZ(v); N[i * 3] = na.getX(v); N[i * 3 + 1] = na.getY(v); N[i * 3 + 2] = na.getZ(v); if (ua) { U[i * 2] = ua.getX(v); U[i * 2 + 1] = ua.getY(v); } }
    meshes.push({ name: o.name, mat: { name: m ? m.name : '', color: m && m.color ? m.color.getHex() : 0xffffff, map: texOf(m, 'map'), normal: texOf(m, 'normalMap'), rough: texOf(m, 'roughnessMap'), metal: texOf(m, 'metalnessMap'), ao: texOf(m, 'aoMap'), alpha: texOf(m, 'alphaMap'), opacity: m ? m.opacity : 1, transparent: m ? !!m.transparent : false }, hasUV: !!ua, P: put(P), N: put(N), U: put(U) });
  }
});
fs.writeFileSync(out + '.bin', Buffer.concat(chunks));
fs.writeFileSync(out + '.json', JSON.stringify({ src: inp, meshes }, null, 0));
const box = new THREE.Box3().setFromObject(root), sz = box.getSize(new THREE.Vector3());
console.log(path.basename(inp), 'meshes', meshes.length, 'tris', meshes.reduce((s, m) => s + m.P[1] / 9, 0), 'size', sz.toArray().map((v) => v.toFixed(2)).join(' x '));
