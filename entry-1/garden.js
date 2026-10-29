/* ASCII garden: plants grow along the page. Click a garden to replant it. */
(function () {
  const raw = s => s.split("\n").slice(1);
  const PLANTS = [
    raw(String.raw`
  _
_(_)_
(_)@(_)
  (_)
   |
 \ | /
   |`),
    raw(String.raw`
 ,-.
( @ )
 \_/
  |
 /|\
  |`),
    raw(String.raw`
 \ | /
--(*)--
 / | \
   |
  \|/
   |`),
    raw(String.raw`
 .-"-.
(_____)
  | |`),
    raw(String.raw`
   .
 \ | /
  \|/
 --@--
  /|\
   |
   |
  _|_`),
    raw(String.raw`
\|/
 |`),
    raw(String.raw`
 ,|, ,|,
\|/ \|/`),
    raw(String.raw`
 (@)
 \|/
  |
 _|_`)
  ];

  function build(el) {
    const fs = parseFloat(getComputedStyle(el).fontSize) || 13;
    const cols = Math.max(24, Math.floor(el.clientWidth / (fs * 0.6)));
    const items = [];
    let w = 0;
    while (w < cols) {
      const p = PLANTS[Math.floor(Math.random() * PLANTS.length)];
      const pw = Math.max(...p.map(l => l.length));
      const gap = 1 + Math.floor(Math.random() * 4);
      items.push({ p, pw, gap });
      w += pw + gap;
    }
    const H = Math.max(...items.map(i => i.p.length));
    const rows = Array.from({ length: H }, () => "");
    items.forEach(({ p, pw, gap }) => {
      const pad = H - p.length;
      for (let r = 0; r < H; r++) rows[r] += (r < pad ? "" : p[r - pad]).padEnd(pw + gap);
    });
    const ground = "~'~.".repeat(Math.ceil(cols / 4)).slice(0, cols);
    el.innerHTML = rows.map(r => r.slice(0, cols)).concat(ground).join("\n")
      .replace(/[@*]/g, m => `<i>${m}</i>`);
    el.classList.remove("grow"); void el.offsetWidth; el.classList.add("grow");
  }

  const beds = document.querySelectorAll(".bed");
  beds.forEach(b => {
    b.title = "Click to replant";
    b.addEventListener("click", () => build(b));
  });
  const go = () => beds.forEach(build);
  go();
  let t; let last = innerWidth;
  addEventListener("resize", () => { if (innerWidth === last) return; last = innerWidth; clearTimeout(t); t = setTimeout(go, 200); });

  // little rose-vine dividers
  document.querySelectorAll(".divider").forEach(d => { d.textContent = "@}-;--- ".repeat(60); });

  // drifting stars and sparkles
  const sp = document.createElement("div");
  sp.className = "sparkles"; sp.setAttribute("aria-hidden", "true");
  for (let i = 0; i < 18; i++) {
    const s = document.createElement("span");
    s.textContent = Math.random() < 0.5 ? "★" : "✦";
    s.style.cssText = `left:${Math.random() * 98}%;top:${Math.random() * 98}%;font-size:${10 + Math.random() * 16}px;` +
      `color:var(${Math.random() < 0.55 ? "--pink" : "--moss"});animation-duration:${4 + Math.random() * 6}s;animation-delay:${-Math.random() * 8}s`;
    sp.append(s);
  }
  document.body.prepend(sp);
})();