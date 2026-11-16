/* «Болашақ химиядан басталады» — one WebGL world, camera driven by page scroll.
   Lab (photo, glass ring, flask) → dive through the flask neck → micro-world inside the drop
   (molecules, H2O 104.5°, lattice gate, gallery panes, light line) → back to the lab. */
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const P = window.portfolio, root = document.documentElement;
if (!root.classList.contains("static")) {
  try { init(); } catch (e) { console.warn("WebGL off:", e); P.toStatic(); }
}

function init() {
  const canvas = document.getElementById("gl"), veil = document.getElementById("veil");
  const mob = innerWidth < 820 || matchMedia("(pointer: coarse)").matches;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !mob, alpha: true, powerPreference: "high-performance" });
  if (!renderer.getContext()) throw new Error("no gl");
  renderer.setPixelRatio(Math.min(devicePixelRatio, mob ? 1.25 : 1.6));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;

  const BG = new THREE.Color(0x031615), BG2 = new THREE.Color(0x032321);
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene(); scene.background = BG.clone();
  scene.fog = new THREE.FogExp2(0x031615, mob ? .03 : .028);
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), .04).texture;
  const camera = new THREE.PerspectiveCamera(mob ? 52 : 38, innerWidth / innerHeight, .05, 400);

  scene.add(new THREE.HemisphereLight(0x8ff3f0, 0x020a0b, .5));
  const key = new THREE.DirectionalLight(0xdffcff, 1.4); key.position.set(-4, 8, 6); scene.add(key);

  /* ---------- materials ---------- */
  const glass = new THREE.MeshPhysicalMaterial({ color: 0xd9fbfb, roughness: .05, metalness: 0, transmission: mob ? 0 : 1, thickness: .5, ior: 1.45,
    transparent: true, opacity: mob ? .3 : 1, clearcoat: 1, clearcoatRoughness: .04, envMapIntensity: 1.3, attenuationColor: new THREE.Color(0x47d8de), attenuationDistance: 4, side: THREE.DoubleSide });
  const glassLite = new THREE.MeshPhysicalMaterial({ color: 0x9fe9ea, roughness: .04, metalness: 0, transparent: true, opacity: .26, clearcoat: 1, envMapIntensity: 1.8, depthWrite: false });
  const metal = new THREE.MeshStandardMaterial({ color: 0xbfe6e6, metalness: 1, roughness: .2, envMapIntensity: 1.3 });
  const core = c => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: .85 });
  const sph = new THREE.SphereGeometry(1, mob ? 24 : 40, mob ? 16 : 28), cyl = new THREE.CylinderGeometry(1, 1, 1, 16), UP = new THREE.Vector3(0, 1, 0);
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const glowTex = (() => { const c = document.createElement("canvas"); c.width = c.height = 128; const x = c.getContext("2d"), g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(.25, "rgba(255,255,255,.45)"); g.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = g; x.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c); })();
  function glow(parent, color, size, pos, op = .6) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); s.scale.setScalar(size); s.position.copy(pos); parent.add(s); return s; }
  function label(parent, text, pos, h = .5, color = "#F4F7F5") { const c = document.createElement("canvas"); c.width = 512; c.height = 128; const x = c.getContext("2d");
    x.font = "800 84px Inter,Segoe UI,Arial"; x.fillStyle = color; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(text, 256, 68);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false, fog: false }));
    s.scale.set(h * 4, h, 1); s.position.copy(pos); parent.add(s); return s; }
  function atom(g, p, r, m, coreColor) { const a = new THREE.Mesh(sph, m); a.position.copy(p); a.scale.setScalar(r); g.add(a);
    if (coreColor) { const c = new THREE.Mesh(sph, core(coreColor)); c.position.copy(p); c.scale.setScalar(r * .32); g.add(c); } return a; }
  function bond(g, a, b, r = .06) { const m = new THREE.Mesh(cyl, metal), d = V(0, 0, 0).subVectors(b, a); m.position.copy(a).addScaledVector(d, .5); m.scale.set(r, d.length(), r); m.quaternion.setFromUnitVectors(UP, d.normalize()); g.add(m); return m; }
  const HALF = THREE.MathUtils.degToRad(104.5 / 2);
  function molecule(kind, s = 1, coreC = 0x47d8de, mat = glassLite) {
    const g = new THREE.Group(), o = V(0, 0, 0);
    if (kind === "h2o") { atom(g, o, .55, mat, coreC); for (const sg of [1, -1]) { const h = V(Math.sin(HALF) * sg * 1.1, -Math.cos(HALF) * 1.1, 0); atom(g, h, .34, mat, 0xd2ff24); bond(g, o, h, .05); } }
    else if (kind === "co2") { atom(g, o, .5, mat, coreC); for (const sg of [1, -1]) { const h = V(sg * 1.3, 0, 0); atom(g, h, .42, mat, 0xd2ff24); bond(g, o, h, .05); } }
    else { atom(g, o, .5, mat, coreC); [V(1, 1, 1), V(-1, -1, 1), V(-1, 1, -1), V(1, -1, -1)].forEach(v => { const h = v.normalize().multiplyScalar(1.15); atom(g, h, .3, mat, 0xd2ff24); bond(g, o, h, .045); }); }
    g.scale.setScalar(s); g.userData.spin = V((Math.random() - .5) * .3, (Math.random() - .5) * .4, (Math.random() - .5) * .2); return g;
  }
  const spinners = [];

  /* ================= LAB ================= */
  const lab = new THREE.Group(); scene.add(lab);
  // The lab itself (background photo + teacher cut-out) is an HTML layer under this transparent canvas;
  // here we only add glass molecules floating in front of it for depth.
  const L = mob ? { cam: V(0, .7, 10.5), look: V(0, .7, 0) } : { cam: V(0, .2, 9.2), look: V(0, .2, 0) };
  const fore = mob ? [[-2.4, 4.6, 1, .5], [2.3, -1.2, 2.5, .45]] : [[-6.6, -3.2, 1.5, .8], [-1.2, 3.9, -1, .55], [6.8, 3.6, 0, .6], [3.8, -3.8, 3, .45]];
  fore.forEach(([x, y, z, s], i) => { const m = molecule(["h2o", "ch4", "co2", "h2o"][i], s, i % 2 ? 0xd2ff24 : 0x47d8de, glass); m.position.set(x, y, z); lab.add(m); spinners.push(m); });
  // distant soft-lit molecules + final-gather molecules
  const labMols = [];
  const far = [];
  far.forEach((p, i) => { const m = molecule(["h2o", "ch4", "co2"][i % 3], mob ? .7 : .85); m.position.set(...p); lab.add(m); labMols.push(m); spinners.push(m); glow(lab, 0x47d8de, 2.4, V(...p), .18); });
  // final composition: a small calm arc high in the gap between the text column and the teacher — never over text or face
  const gather = []; const GN = mob ? 3 : 5, gc = mob ? V(0, 5.2, -9) : V(2.4, 3.4, -8);
  for (let i = 0; i < GN; i++) { const m = molecule(["h2o", "ch4", "co2"][i % 3], mob ? .35 : .42, i % 2 ? 0xd2ff24 : 0x47d8de);
    const a = Math.PI * (.15 + .7 * i / Math.max(1, GN - 1));
    m.userData.to = V(gc.x + Math.cos(a) * (mob ? 2.2 : 2.6), gc.y + Math.sin(a) * .9, gc.z + Math.sin(i * 1.7) * .6);
    m.userData.from = V((Math.random() - .5) * 26, (Math.random() - .3) * 14, -18 - Math.random() * 12); m.position.copy(m.userData.from); m.visible = false; lab.add(m); gather.push(m); spinners.push(m); }

  /* ================= MICRO-WORLD (inside the drop) ================= */
  const micro = new THREE.Group(); scene.add(micro); micro.visible = false;
  const mx = (x, y, z) => V(x, y, z);
  // glass swirl rings ("inside the drop")
  [[-205, 9.5, .45, .2], [-262, 11, .5, -.35], [-318, 10, .4, .5]].forEach(([z, r, t, tilt]) => { const m = new THREE.Mesh(new THREE.TorusGeometry(r, t, mob ? 12 : 24, mob ? 80 : 160), glassLite); m.position.set(0, 0, z); m.rotation.set(tilt, tilt * .5, 0); micro.add(m); });
  // lime caustic light below
  const caus = (() => { const c = document.createElement("canvas"); c.width = 1024; c.height = 1024; const x = c.getContext("2d"); x.lineCap = "round";
    for (let i = 0; i < 26; i++) { x.strokeStyle = i % 3 ? "rgba(210,255,36,.55)" : "rgba(71,216,222,.6)"; x.lineWidth = 2 + Math.random() * 5; x.shadowColor = x.strokeStyle; x.shadowBlur = 24; x.beginPath();
      let y = Math.random() * 1024; x.moveTo(0, y); for (let k = 0; k < 4; k++) x.bezierCurveTo(k * 256 + 80, y + (Math.random() - .5) * 260, k * 256 + 170, y + (Math.random() - .5) * 260, (k + 1) * 256, y += (Math.random() - .5) * 120); x.stroke(); }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1, 4); return t; })();
  const causMat = new THREE.MeshBasicMaterial({ map: caus, transparent: true, opacity: .55, blending: THREE.AdditiveBlending, depthWrite: false, fog: true, side: THREE.DoubleSide });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(70, 180), causMat); floor.rotation.x = -Math.PI / 2; floor.position.set(0, -6, -262); micro.add(floor);
  // free-floating molecules along the path (kept out of the text areas)
  const MN = mob ? 12 : 26, freeMols = new THREE.Group(); micro.add(freeMols);
  for (let i = 0; i < MN; i++) { const z = -194 - i * (110 / MN) - Math.random() * 3; let x, y;
    if (mob) { x = (Math.random() - .5) * 5; y = 1.4 + Math.random() * 2.6; } else { const right = Math.random() < .75; x = right ? 2.2 + Math.random() * 5.5 : -4.8 - Math.random() * 3; y = (Math.random() - .5) * 6; }
    if (z < -228 && z > -246) continue;      // keep the gallery gate clear
    const m = molecule(["h2o", "ch4", "co2"][i % 3], .55 + Math.random() * .6, i % 3 ? 0x47d8de : 0xd2ff24); m.position.set(x, y, z); freeMols.add(m); spinners.push(m); }
  // bubbles
  { const n = mob ? 260 : 700, a = new Float32Array(n * 3); for (let i = 0; i < n; i++) { a[i * 3] = (Math.random() - .5) * 30; a[i * 3 + 1] = (Math.random() - .5) * 16; a[i * 3 + 2] = -190 - Math.random() * 140; }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(a, 3));
    micro.add(new THREE.Points(g, new THREE.PointsMaterial({ map: glowTex, color: 0xbff6f4, size: .16, transparent: true, opacity: .6, depthWrite: false, blending: THREE.AdditiveBlending }))); }
  // H2O hero model — correct 104.5° bond angle, labelled
  const W = mob ? V(0, 2.1, -224) : V(4.3, -.2, -224);
  const h2o = new THREE.Group(); h2o.position.copy(W); micro.add(h2o);
  const hm = mob ? glassLite : glass, O = V(0, .55, 0), dd = 2.1;
  const H1 = V(Math.sin(HALF) * dd, .55 - Math.cos(HALF) * dd, 0), H2 = V(-Math.sin(HALF) * dd, .55 - Math.cos(HALF) * dd, 0);
  atom(h2o, O, 1.05, hm, 0x47d8de); atom(h2o, H1, .62, hm, 0xd2ff24); atom(h2o, H2, .62, hm, 0xd2ff24); bond(h2o, O, H1, .09); bond(h2o, O, H2, .09);
  glow(h2o, 0x47d8de, 5, O, .35);
  label(h2o, "O", O.clone().add(V(0, 1.55, 0)), .55); label(h2o, "H", H1.clone().add(V(.75, -.5, 0)), .45, "#D2FF24"); label(h2o, "H", H2.clone().add(V(-.75, -.5, 0)), .45, "#D2FF24");
  { const pts = []; for (let i = 0; i <= 40; i++) { const a = -Math.PI / 2 - HALF + i / 40 * HALF * 2; pts.push(V(Math.cos(a) * .95, .55 + Math.sin(a) * .95, 0)); }
    h2o.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0xd2ff24 }))); label(h2o, "104,5°", V(0, -.75, 0), .36, "#D2FF24"); }
  // lattice gate the camera passes through into the gallery
  const gate = new THREE.Group(); gate.position.set(0, mob ? .8 : 0, -236); micro.add(gate);
  const RN = 12, Ri = 3.4; const ringPts = [];
  for (let i = 0; i < RN; i++) { const a = i / RN * Math.PI * 2; ringPts.push(V(Math.cos(a) * Ri, Math.sin(a) * Ri, 0)); }
  ringPts.forEach((p, i) => { atom(gate, p, .38, glassLite, i % 2 ? 0xd2ff24 : 0x47d8de); bond(gate, p, ringPts[(i + 1) % RN], .045); const o = p.clone().multiplyScalar(1.45); o.z = -.6; atom(gate, o, .26, glassLite); bond(gate, p, o, .035); });
  // gallery backdrop: tilted glass panes with glowing edges
  const panes = new THREE.Group(); micro.add(panes);
  const paneGeo = new THREE.BoxGeometry(3.2, 2.4, .05), edge = new THREE.EdgesGeometry(paneGeo), edgeMat = new THREE.LineBasicMaterial({ color: 0x47d8de, transparent: true, opacity: .55 });
  (mob ? [[-2.2, 3.4, -256, .4], [2.4, 3.2, -258, -.4]] : [[-7, 2.6, -256, .5], [7.2, 2.2, -257, -.5], [-6, -2.8, -259, .35], [6.6, -2.6, -258, -.3], [0, 4.4, -262, 0]]).forEach(([x, y, z, r]) => {
    const p = new THREE.Mesh(paneGeo, glassLite); p.position.set(x, y, z); p.rotation.set(.08, r, 0); p.add(new THREE.LineSegments(edge, edgeMat)); panes.add(p); });
  // light line with year nodes
  const tlGroup = new THREE.Group(); micro.add(tlGroup);
  const LY = mob ? 1.6 : -1.4, LZ = -276, NODE = i => -1 + i * 4;
  const line = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, 120, 8), new THREE.MeshBasicMaterial({ color: 0x47d8de, fog: false })); line.rotation.z = Math.PI / 2; line.position.set(14, LY, LZ); tlGroup.add(line);
  const lineGlow = new THREE.Mesh(new THREE.CylinderGeometry(.16, .16, 120, 8, 1, true), new THREE.MeshBasicMaterial({ color: 0x47d8de, transparent: true, opacity: .18, blending: THREE.AdditiveBlending, depthWrite: false })); lineGlow.rotation.z = Math.PI / 2; lineGlow.position.copy(line.position); tlGroup.add(lineGlow);
  const YEARS = window.TL_YEARS || ["2022", "2023", "2024", "2025", "2026"], TN = YEARS.length, TS = 4 * TN, LEND = TS + 4, nodes = [];
  YEARS.forEach((y, i) => { const p = V(NODE(i), LY, LZ); const n = new THREE.Mesh(sph, core(0xd2ff24)); n.scale.setScalar(.14); n.position.copy(p); tlGroup.add(n);
    nodes.push([n, glow(tlGroup, 0xd2ff24, 1.6, p, .5), label(tlGroup, y, p.clone().add(V(0, .75, 0)), .5, "#AFC4C1")]); });

  /* ================= camera path ================= */
  // lab phase: the camera drifts forward through the foreground molecules toward the painted flask (HTML layer zooms the photo)
  const K = [
    { g: 0, p: L.cam, l: L.look },
    { g: .4, p: mob ? V(.3, .4, 6) : V(.4, -.3, 5.4), l: mob ? V(.4, 0, -4) : V(.8, -1, -4) },
    { g: .8, p: mob ? V(.5, -.2, 2) : V(.7, -.8, 1.6), l: mob ? V(.6, -.6, -6) : V(.9, -1.5, -6) },
    { g: .92, p: V(0, mob ? 1.2 : 0, -189), l: V(mob ? 0 : .6, mob ? 1.4 : 0, -200), cut: true },
    { g: 1.5, p: V(0, mob ? 1.4 : 0, -195), l: V(mob ? .2 : 1, mob ? 1.6 : 0, -206) },
    { g: 2.0, p: V(mob ? 0 : .2, mob ? 1.6 : .1, -207), l: V(mob ? 0 : 2.2, mob ? 1.9 : 0, -219) },
    { g: 2.5, p: V(mob ? 0 : -1.4, mob ? 1.4 : .4, mob ? -213 : -211), l: V(mob ? 0 : W.x * .32, W.y, -224) },
    { g: 2.95, p: V(0, mob ? 1.2 : 0, -226), l: V(0, mob ? .9 : 0, -240) },
    { g: 3.3, p: V(0, mob ? .9 : 0, -239), l: V(0, mob ? 1 : 0, -252) },
    { g: 3.6, p: V(0, mob ? 1 : 0, -246), l: V(0, mob ? 1.2 : 0, -258) },
    { g: 4.0, p: V(-7, LY + 2.4, -265), l: V(-1, LY + 1.5, -276) },
    { g: 5.0, p: V(-7 + TS, LY + 2.4, -265), l: V(-1 + TS, LY + 1.5, -276) },
    { g: 5.12, p: mob ? V(0, .8, 11.5) : V(-.4, .35, 10.4), l: mob ? V(0, 1.2, 0) : V(.6, .1, 0), cut: true },
    { g: 6.0, p: mob ? V(0, .7, 11) : V(-.6, .3, 9.8), l: mob ? V(0, 1.1, 0) : V(.4, .1, 0) }
  ];
  const sm = (a, b, v) => { const x = Math.min(1, Math.max(0, (v - a) / (b - a))); return x * x * (3 - 2 * x); };
  const tmpP = V(0, 0, 0), tmpL = V(0, 0, 0);
  function cam(G) {
    let i = 0; while (i < K.length - 2 && G >= K[i + 1].g) i++;
    const a = K[i], b = K[i + 1], t = Math.min(1, Math.max(0, (G - a.g) / (b.g - a.g)));
    let v = 0;
    if (b.cut) { const s = t < .5 ? a : b; tmpP.copy(s.p); tmpL.copy(s.l); v = Math.pow(1 - Math.abs(t - .5) * 2, .7); if (t < .5) tmpP.lerp(tmpL, t * .5); }
    else if (a.g === 4) { const q = sm(.08, .92, G - 4); tmpP.set(-7 + TS * q, LY + 2.4, -265); tmpL.set(-1 + TS * q, LY + 1.5, -276); }
    else { const e = t * t * (3 - 2 * t); tmpP.lerpVectors(a.p, b.p, e); tmpL.lerpVectors(a.l, b.l, e); }
    return v;
  }

  /* ================= loop ================= */
  let G = P.getG(), prev = performance.now(), first = true;
  const t0 = prev;
  function resize() { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); }
  addEventListener("resize", resize); resize();
  function frame(now) {
    const dt = Math.min(.1, (now - prev) / 1000), t = (now - t0) / 1000; prev = now;
    G += (P.getG() - G) * (1 - Math.exp(-dt * 6)); if (Math.abs(P.getG() - G) < 1e-4) G = P.getG(); window.__G3 = G;
    const v = cam(G); camera.position.copy(tmpP); camera.lookAt(tmpL);
    veil.style.opacity = v.toFixed(3);
    const inLab = G < .86 || G > 5.06; lab.visible = inLab; micro.visible = !inLab || (G > .7 && G < .95) || (G > 4.9 && G < 5.1);
    scene.background = inLab ? null : BG2; scene.fog.color.copy(inLab ? BG : BG2); scene.fog.density = inLab ? .012 : (mob ? .03 : .028);
    // final: molecules gather into a calm composition around the closing text
    gather.forEach((m, i) => { m.visible = G > 5.02; if (m.visible) { const k = sm(.12 + i * .03, .6 + i * .03, G - 5); m.position.lerpVectors(m.userData.from, m.userData.to, k); m.position.y += Math.sin(t * .6 + i) * .06 * k; } });
    // decorative calm motion
    spinners.forEach(m => { if (m.parent.visible) { m.rotation.x += m.userData.spin.x * dt * .4; m.rotation.y += m.userData.spin.y * dt * .4; } });
    if (micro.visible) {
      const u2 = Math.min(1, Math.max(0, G - 2)); h2o.rotation.set(Math.sin(u2 * Math.PI) * .35, -.7 + u2 * 1.7, Math.sin(t * .4) * .03);
      gate.rotation.z = G * .35; caus.offset.y = t * .015;
      h2o.visible = G > (mob ? 1.7 : 1.2) && G < 3.1; gate.visible = G > 2.55 && G < 3.5; panes.visible = G > 2.9 && G < 4.3; tlGroup.visible = G > 3.6;
      const q = sm(.08, .92, G - 4), act = Math.min(TN - 1, Math.floor(q * TN - 1e-6));
      freeMols.visible = G < 3.85;
      // the light line starts to the right of the reading column, so it never crosses the text
      const cx = camera.position.x + (mob ? -3 : 6.5), len = Math.max(.01, LEND - cx);
      line.scale.y = lineGlow.scale.y = len / 120; line.position.x = lineGlow.position.x = cx + len / 2;
      nodes.forEach(([n, gl, lb], i) => { const on = G > 3.9 && G < 5.05 && i === act, vis = NODE(i) > cx - .3; n.visible = gl.visible = vis; lb.visible = vis && !mob;
        n.scale.setScalar(on ? .22 : .12); gl.material.opacity = on ? .9 : .3; lb.material.opacity = on ? 1 : .55; });
    }
    renderer.render(scene, camera);
    if (first) { first = false; root.classList.add("gl-ready"); }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  window.__setG = g => { window.__forceG = g; };   // debug helper for screenshots
}
