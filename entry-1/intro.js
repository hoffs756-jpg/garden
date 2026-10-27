/* Draws the hand-inked tree frame around the photo cutout.
   Everything is generated in code (seeded, so it looks the same every load).
   Change SEED for a different tree, or the numbers marked "tweak" below. */
(function () {
  const svg = document.getElementById("trees");
  const win = document.getElementById("window");
  const frame = document.getElementById("frame");
  if (!svg || !win || !frame) return;

  const W = 1000, H = 560, NS = "http://www.w3.org/2000/svg";
  let SEED = 7; // tweak: try any whole number

  const rnd = () => {
    SEED |= 0; SEED = (SEED + 0x6D2B79F5) | 0;
    let t = Math.imul(SEED ^ (SEED >>> 15), 1 | SEED);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const R = (a, b) => a + (b - a) * rnd();
  const el = (name, attrs, parent) => {
    const e = document.createElementNS(NS, name);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    (parent || svg).appendChild(e);
    return e;
  };
  const f1 = n => n.toFixed(1);

  /* ---------- 1. the organic window shape ---------- */
  const cx = 500, cy = 285, rx = 310, ry = 168, N = 96; // tweak: rx / ry = window size
  const ph = [R(0, 6.28), R(0, 6.28), R(0, 6.28)];
  const blob = [];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const n = 0.11 * Math.sin(3 * a + ph[0]) + 0.08 * Math.sin(5 * a + ph[1]) + 0.05 * Math.sin(9 * a + ph[2]) + R(-0.02, 0.02);
    const x = cx + Math.cos(a) * rx * (1 + n);
    const y = cy + Math.sin(a) * ry * (1 + n);
    let nx = Math.cos(a) / rx, ny = Math.sin(a) / ry;
    const l = Math.hypot(nx, ny); nx /= l; ny /= l;
    blob.push({ x, y, a, nx, ny });
  }
  win.style.clipPath = "polygon(" + blob.map(p => `${(p.x / W * 100).toFixed(2)}% ${(p.y / H * 100).toFixed(2)}%`).join(",") + ")";

  /* ---------- layers ---------- */
  const trunks = el("g", {});
  const twigs = el("g", {});
  const leafLayer = el("g", { id: "leaves" });
  const sectors = [];
  for (let i = 0; i < 6; i++) sectors.push(el("g", { class: "sway s" + i }, leafLayer));

  /* ---------- 2. trunks with pen hatching ---------- */
  const pstr = pts => pts.map(p => f1(p.x) + " " + f1(p.y)).join("L");
  function trunk(P, w0, w1) {
    const bez = t => {
      const u = 1 - t;
      return {
        x: u * u * u * P[0].x + 3 * u * u * t * P[1].x + 3 * u * t * t * P[2].x + t * t * t * P[3].x,
        y: u * u * u * P[0].y + 3 * u * u * t * P[1].y + 3 * u * t * t * P[2].y + t * t * t * P[3].y
      };
    };
    const S = 26, c = [];
    for (let i = 0; i <= S; i++) {
      const t = i / S, p = bez(t), q = bez(Math.min(1, t + 0.01)), r = bez(Math.max(0, t - 0.01));
      const dx = q.x - r.x, dy = q.y - r.y, l = Math.hypot(dx, dy) || 1;
      c.push({ x: p.x, y: p.y, nx: -dy / l, ny: dx / l, w: w0 + (w1 - w0) * t });
    }
    const edge = k => c.map((p, i) => ({
      x: p.x + p.nx * (p.w / 2) * k + Math.sin(i * 1.7 + k) * 2.4,
      y: p.y + p.ny * (p.w / 2) * k + Math.cos(i * 1.3 + k) * 1.6
    }));
    const L = edge(-1), Rr = edge(1).reverse();
    el("path", { d: "M" + pstr(L) + "L" + pstr(Rr) + "Z", class: "trunk" }, trunks);
    for (let j = -0.82; j <= 0.83; j += 0.16) {
      const line = c.map((p, i) => {
        const k = j + Math.sin(i * 0.8 + j * 9) * 0.05;
        return { x: p.x + p.nx * (p.w / 2) * k, y: p.y + p.ny * (p.w / 2) * k };
      });
      el("path", { d: "M" + pstr(line), class: "hatch" }, trunks);
    }
    return c;
  }
  const left = trunk([{ x: 70, y: 590 }, { x: 160, y: 430 }, { x: 80, y: 230 }, { x: 175, y: -10 }], 125, 56);
  const right = trunk([{ x: 935, y: 590 }, { x: 850, y: 420 }, { x: 925, y: 240 }, { x: 840, y: -10 }], 115, 50);

  /* ---------- 3. branches reaching toward the window ---------- */
  function branch(c, k, deg) {
    const s = c[k], tp = blob[Math.round(((deg % 360) / 360) * N) % N];
    const ex = tp.x + tp.nx * 22, ey = tp.y + tp.ny * 22;
    const mx = (s.x + ex) / 2 + R(-40, 40), my = (s.y + ey) / 2 + R(-40, 20);
    const d = `M${f1(s.x)} ${f1(s.y)}Q${f1(mx)} ${f1(my)} ${f1(ex)} ${f1(ey)}`;
    const w = R(5, 8);
    el("path", { d, class: "bo", "stroke-width": w }, twigs);
    el("path", { d, class: "bi", "stroke-width": w - 2.6 }, twigs);
  }
  [[10, 235], [14, 258], [19, 205], [6, 168], [3, 128]].forEach(b => branch(left, b[0], b[1]));
  [[10, 305], [14, 282], [19, 338], [6, 12], [3, 52]].forEach(b => branch(right, b[0], b[1]));

  // small twigs along the window edge
  blob.forEach((p, i) => {
    if (i % 3) return;
    const d0 = R(-6, 6), d1 = R(40, 88), t = R(-32, 32);
    const x0 = p.x + p.nx * d0, y0 = p.y + p.ny * d0;
    const x1 = p.x + p.nx * d1 - p.ny * t, y1 = p.y + p.ny * d1 + p.nx * t;
    const mx = (x0 + x1) / 2 + R(-14, 14), my = (y0 + y1) / 2 + R(-14, 14);
    el("path", { d: `M${f1(x0)} ${f1(y0)}Q${f1(mx)} ${f1(my)} ${f1(x1)} ${f1(y1)}`, class: "twig" }, twigs);
  });

  /* ---------- 4. leaves ---------- */
  function leaf(x, y, rot, len) {
    const ang = Math.atan2(y - cy, x - cx);
    const sec = sectors[Math.floor((((ang + Math.PI * 2) % (Math.PI * 2)) / (Math.PI * 2)) * 6) % 6];
    const w = len * 0.55, r = rnd();
    const cls = r < 0.5 ? "p0" : r < 0.82 ? "p1" : "p2";
    const delay = Math.round(((((ang + Math.PI * 2.5) % (Math.PI * 2)) / (Math.PI * 2)) * 1000) + R(0, 350));
    const g = el("g", { transform: `translate(${f1(x)} ${f1(y)}) rotate(${Math.round(rot)})` }, sec);
    const inner = el("g", { class: "lf", style: `animation-delay:${delay}ms` }, g);
    el("path", {
      d: `M0 0C${f1(w * .9)} ${f1(-len * .2)} ${f1(w * .8)} ${f1(-len * .8)} 0 ${f1(-len)}C${f1(-w * .8)} ${f1(-len * .8)} ${f1(-w * .9)} ${f1(-len * .2)} 0 0Z`,
      class: cls
    }, inner);
    el("path", { d: `M0 0L0 ${f1(-len * .8)}`, class: "vein" }, inner);
  }

  // ring of foliage around the cutout (tweak 620 for denser or sparser)
  for (let k = 0; k < 620; k++) {
    const p = blob[Math.floor(rnd() * N)];
    const d = Math.pow(rnd(), 1.4) * 78 - 8;
    const x = p.x + p.nx * d, y = p.y + p.ny * d;
    const out = Math.atan2(p.ny, p.nx) * 180 / Math.PI + 90;
    leaf(x, y, out + R(-80, 80), R(15, 34) + d * 0.1);
  }
  // crowns at the top of each trunk and a few leaves on the bark
  [[left[26], 95], [right[26], 90], [left[20], 55], [right[20], 55]].forEach(([c, r]) => {
    for (let k = 0; k < 70; k++) {
      const a = R(0, 6.28), d = Math.sqrt(rnd()) * r;
      leaf(c.x + Math.cos(a) * d, c.y + Math.sin(a) * d, R(0, 360), R(16, 30));
    }
  });
  [left, right].forEach(c => {
    for (let k = 0; k < 14; k++) {
      const p = c[Math.floor(R(3, 18))];
      leaf(p.x + R(-p.w / 2, p.w / 2), p.y, R(-60, 60) + (p.x < 500 ? -30 : 30), R(14, 22));
    }
  });

  /* ---------- 5. gentle parallax on pointer move ---------- */
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    frame.addEventListener("pointermove", e => {
      const b = frame.getBoundingClientRect();
      const px = (e.clientX - b.left) / b.width - 0.5, py = (e.clientY - b.top) / b.height - 0.5;
      frame.style.setProperty("--px", (px * -10).toFixed(1));
      frame.style.setProperty("--py", (py * -7).toFixed(1));
    });
    frame.addEventListener("pointerleave", () => {
      frame.style.setProperty("--px", 0);
      frame.style.setProperty("--py", 0);
    });
  }
})();