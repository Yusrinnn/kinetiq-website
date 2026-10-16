/* Kinetiq – Säulenfeld im Hero (eigener Code, Hairline-Stil)
   - Beim Laden formen die Stößel ein Q als Relief, daraus geht das Zahnrad-Q hervor
   - Das Zahnrad-Q liegt auf den Mittelstößeln, wird von ihnen angehoben und dreht schneller, je höher sie stehen
   - Maus: Stößel heben sich unter dem Zeiger, das Feld neigt sich leicht zur Maus
   - Ohne Maus: Ablaufprogramm wie eine SPS-Schrittkette (Reihe, Diagonale, Schachbrett, Spalte)
   - Klick / Tippen: Druckwelle läuft ringförmig durchs Feld
   - Scrollen: Die Anlage fährt herunter – Stößel ein, Q setzt ab und steht still */
(function () {
  var cv = document.getElementById('feld');
  if (!cv || !cv.getContext) return;
  var ctx = cv.getContext('2d');

  var W = 520, H = 420;
  var BLAU = [0, 160, 253], STAHL = [141, 151, 168];
  var N = 9, HALF = (N - 1) / 2;
  var S = 29, ZS = S * 0.82;
  var OX = W / 2, OY = H * 0.63;
  var HW = 0.36;                            // halbe Stößelbreite
  var BASE = 0.32, LIFT = 2.3, SIG = 1.15;
  var QR = 1.9;                             // Radius Zahnrad-Q in Rastermaß

  var reduce = false;
  try { reduce = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  var cols = [];
  for (var i = 0; i < N; i++) for (var j = 0; j < N; j++) {
    var x = i - HALF, y = j - HALF, d = Math.sqrt(x * x + y * y);
    cols.push({ x: x, y: y, d: d, h: BASE, v: 0, q: inQ(x, y, d) });
  }

  // Q-Relief auf dem 9×9-Raster: Ring + Schweif nach rechts unten (Bild), entspricht +x im Raster
  function inQ(x, y, d) {
    if (Math.abs(y) < 0.6 && x >= 2.5) return 1.25;  // Schweif ragt über den Ring hinaus
    if (d >= 1.9 && d <= 2.9) return 1;
    return 0;
  }

  // ---- Projektion mit Neigung (Gieren um die Hochachse, Kippen über die Bildhöhe) ----
  var yaw = 0, pitch = 0.5, cy = 1, sy = 0;
  var C = Math.cos(Math.PI / 6);
  function setView(yw, pt) { yaw = yw; pitch = pt; cy = Math.cos(yw); sy = Math.sin(yw); }
  function iso(gx, gy, z) {
    var rx = gx * cy - gy * sy, ry = gx * sy + gy * cy;
    return [OX + (rx - ry) * C * S, OY + (rx + ry) * pitch * S - z * ZS];
  }
  function depth(c) { return (c.x * cy - c.y * sy) + (c.x * sy + c.y * cy); }

  function mix(a, b, t, al) {
    return 'rgba(' + Math.round(a[0] + (b[0] - a[0]) * t) + ',' + Math.round(a[1] + (b[1] - a[1]) * t) + ',' + Math.round(a[2] + (b[2] - a[2]) * t) + ',' + al + ')';
  }
  function poly(pts) {
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    for (var k = 1; k < pts.length; k++) ctx.lineTo(pts[k][0], pts[k][1]);
    ctx.closePath();
  }
  var lw = 1;

  function drawCol(c) {
    var x0 = c.x - HW, x1 = c.x + HW, y0 = c.y - HW, y1 = c.y + HW, h = Math.max(0.04, c.h);
    var t = Math.max(0, Math.min(1, (h - BASE) / LIFT));
    var A = iso(x0, y0, h), B = iso(x1, y0, h), Cc = iso(x1, y1, h), D = iso(x0, y1, h);
    var B0 = iso(x1, y0, 0), C0 = iso(x1, y1, 0), D0 = iso(x0, y1, 0);
    var line = mix(STAHL, BLAU, t, 0.32 + 0.6 * t);
    ctx.lineWidth = lw;
    poly([B, Cc, C0, B0]); ctx.fillStyle = '#0A101C'; ctx.fill(); ctx.strokeStyle = line; ctx.stroke();
    poly([D, Cc, C0, D0]); ctx.fillStyle = '#080D17'; ctx.fill(); ctx.stroke();
    poly([A, B, Cc, D]); ctx.fillStyle = '#0E1626'; ctx.fill();
    if (t > 0.02) { ctx.fillStyle = 'rgba(0,160,253,' + (0.16 * t) + ')'; ctx.fill(); }
    ctx.stroke();
    if (t > 0.25) {
      var m = iso(c.x, c.y, h), r = HW * 0.58 * S;
      ctx.beginPath(); ctx.ellipse(m[0], m[1], r * C, r * pitch, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0,160,253,' + (0.9 * (t - 0.25)) + ')'; ctx.stroke();
    }
  }

  // ---- Zahnrad-Q ----
  var R2 = Math.SQRT1_2;
  var qk = QR / 50;
  function qPt(lx, ly, z) { return iso((lx + ly) * R2 * qk, (ly - lx) * R2 * qk, z); }
  function rot(p, a) { var c = Math.cos(a), s = Math.sin(a); return [p[0] * c - p[1] * s, p[0] * s + p[1] * c]; }
  function gearContour(a) {
    var pts = [], half = Math.asin(6 / 50), yIn = -Math.sqrt(50 * 50 - 36);
    for (var k = 0; k < 8; k++) {
      var th = k * Math.PI / 4;
      [[-6, yIn], [-6, -59], [6, -59], [6, yIn]].forEach(function (p) { pts.push(rot(p, th + a)); });
      var s0 = th - Math.PI / 2 + half, s1 = th - Math.PI / 4 - half;
      for (var q = 1; q < 6; q++) { var ang = s0 + (s1 - s0) * q / 6 + a; pts.push([50 * Math.cos(ang), 50 * Math.sin(ang)]); }
    }
    return pts;
  }
  var TAIL = [[4, 16], [16, 4], [62, 50], [38, 50]];
  function tracePlane(pts, z) {
    for (var k = 0; k < pts.length; k++) { var p = qPt(pts[k][0], pts[k][1], z); k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }
    ctx.closePath();
  }
  function circlePlane(r, z) {
    for (var k = 0; k <= 48; k++) { var ang = k / 48 * Math.PI * 2, p = qPt(r * Math.cos(ang), r * Math.sin(ang), z); k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }
    ctx.closePath();
  }
  function qLayer(a, z, top, al) {
    var edge = top ? 'rgba(0,160,253,' + al + ')' : 'rgba(0,160,253,' + (0.35 * al) + ')';
    ctx.beginPath(); tracePlane(gearContour(a), z); circlePlane(30, z);
    ctx.fillStyle = 'rgba(11,20,36,' + al + ')'; ctx.fill('evenodd');
    if (top) { ctx.fillStyle = 'rgba(0,160,253,' + (0.22 * al) + ')'; ctx.fill('evenodd'); }
    ctx.strokeStyle = edge; ctx.lineWidth = lw * (top ? 1.4 : 1); ctx.stroke();
    ctx.beginPath(); tracePlane(TAIL, z);
    if (top) { ctx.strokeStyle = 'rgba(8,12,21,' + al + ')'; ctx.lineWidth = 5 * qk * S * 1.1; ctx.lineJoin = 'miter'; ctx.stroke(); }
    ctx.fillStyle = 'rgba(11,20,36,' + al + ')'; ctx.fill();
    if (top) { ctx.fillStyle = 'rgba(0,160,253,' + (0.22 * al) + ')'; ctx.fill(); }
    ctx.strokeStyle = edge; ctx.lineWidth = lw * (top ? 1.4 : 1); ctx.stroke();
  }
  var QT = 0.24;                            // Materialstärke des Q
  function drawQ(a, z, scale, al) {
    if (al <= 0.01) return;
    qk = QR * scale / 50;
    qLayer(a, z, false, al);
    qLayer(a, z + QT, true, al);
    qk = QR / 50;
  }
  // Auflagehöhe: höchster Stößel unter dem Q
  function supportH() {
    var m = 0;
    for (var k = 0; k < cols.length; k++) if (cols[k].d < QR - 0.2) m = Math.max(m, cols[k].h);
    return m;
  }

  // ---- Eingaben ----
  var mouse = null, lastMove = -1e9, waves = [], scrollP = 0;
  var tiltX = 0, tiltY = 0;                 // Zielneigung −1…1
  function toGrid(e) {
    var r = cv.getBoundingClientRect();
    var lx = (e.clientX - r.left) * W / r.width, ly = (e.clientY - r.top) * H / r.height + 0.9 * ZS;
    var u = (lx - OX) / (C * S), v = (ly - OY) / (pitch * S);
    var rx = (u + v) / 2, ry = (v - u) / 2;            // gedrehtes Raster → zurückdrehen
    return [rx * cy + ry * sy, -rx * sy + ry * cy];
  }
  function near(e, m) {
    var r = cv.getBoundingClientRect();
    return !(e.clientX < r.left - m || e.clientX > r.right + m || e.clientY < r.top - m || e.clientY > r.bottom + m);
  }
  window.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse') return;
    var r = cv.getBoundingClientRect();
    tiltX = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width * 0.9)));
    tiltY = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (r.height * 0.9)));
    if (!near(e, 60)) { mouse = null; return; }
    mouse = toGrid(e); lastMove = performance.now();
  }, { passive: true });
  document.addEventListener('pointerleave', function () { mouse = null; tiltX = tiltY = 0; });
  window.addEventListener('pointerdown', function (e) {
    if (!near(e, 0)) return;
    var g = toGrid(e);
    waves.push({ x: g[0], y: g[1], t0: performance.now() });
    if (waves.length > 4) waves.shift();
  }, { passive: true });
  var hero = cv.closest('section') || cv;
  function onScroll() {
    var r = hero.getBoundingClientRect();
    scrollP = Math.max(0, Math.min(1, -r.top / (r.height * 0.7)));
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---- Ablaufprogramm ohne Maus (Schrittkette, je 3,6 s) ----
  var STEP = 3600;
  function program(c, t) {
    var k = Math.floor(t / STEP) % 4, f = (t % STEP) / STEP;   // f: 0…1 innerhalb des Schritts
    var pos = -6 + 12 * f, w;
    if (k === 0) { w = c.x - pos; return Math.exp(-w * w / 0.6); }                 // Reihe für Reihe
    if (k === 1) { w = (c.x + c.y) / 1.4 - pos; return Math.exp(-w * w / 0.6); }   // Diagonale
    if (k === 2) {                                                                 // Schachbrett im Takt
      var tick = Math.floor(f * 6) % 2, odd = (Math.round(c.x + c.y) % 2 + 2) % 2;
      return (f > 0.08 && f < 0.92 && odd === tick) ? 0.55 : 0;
    }
    w = c.y - pos; return Math.exp(-w * w / 0.6);                                   // Spalte für Spalte
  }

  // ---- Ladeeffekt: Q-Relief, daraus entsteht das Zahnrad-Q ----
  var T_RISE = 1100, T_HOLD = 1500, T_FALL = 900, T_INTRO = T_RISE + T_HOLD + T_FALL;
  var t0 = null;
  function intro(c, ti) {
    if (!c.q) return 0;
    var delay = (c.d / 4) * 500;                       // von innen nach außen hochfahren
    if (ti < T_RISE + T_HOLD) return Math.max(0, Math.min(1, (ti - delay) / 450)) * 0.8 * c.q;
    return Math.max(0, 1 - (ti - T_RISE - T_HOLD) / T_FALL) * 0.8 * c.q;
  }

  var amp = 0, qa = 0, qScale = 0, qAlpha = 0, lastT = null, mp = [0, 0];
  function step(t) {
    if (t0 === null) t0 = t;
    var dt = lastT === null ? 16 : Math.min(50, t - lastT); lastT = t;
    var ti = t - t0, introOn = ti < T_INTRO;
    var useMouse = !introOn && mouse && t - lastMove < 2500;
    if (useMouse) { mp[0] += (mouse[0] - mp[0]) * 0.18; mp[1] += (mouse[1] - mp[1]) * 0.18; }
    amp += ((useMouse ? 1 : 0) - amp) * 0.08;
    var down = 1 - scrollP;                              // 1 = Anlage läuft, 0 = heruntergefahren
    var tp = t - t0 - T_INTRO;                           // Programmzeit nach dem Intro
    for (var k = 0; k < cols.length; k++) {
      var c = cols[k], lift = 0;
      if (introOn) lift = intro(c, ti);
      else {
        var dx = c.x - mp[0], dy = c.y - mp[1];
        var mouseLift = Math.exp(-(dx * dx + dy * dy) / (2 * SIG * SIG));
        lift = amp * mouseLift + (1 - amp) * 0.75 * program(c, Math.max(0, tp));
      }
      for (var w = 0; w < waves.length; w++) {         // Druckwelle
        var age = (t - waves[w].t0) / 1000, wx = c.x - waves[w].x, wy = c.y - waves[w].y;
        var r = age * 6.5, dd = Math.sqrt(wx * wx + wy * wy) - r;
        lift += Math.exp(-dd * dd / 0.5) * 0.85 * Math.max(0, 1 - age / 1.6);
      }
      var target = (BASE + LIFT * Math.min(1.15, lift)) * down + 0.04 * (1 - down);
      c.v = (c.v + (target - c.h) * 0.16) * 0.74;
      c.h += c.v;
    }
    waves = waves.filter(function (w) { return t - w.t0 < 1700; });

    // Zahnrad-Q: erscheint nach dem Relief, dreht schneller bei Hub, steht still wenn heruntergefahren
    var appear = Math.max(0, Math.min(1, (ti - T_RISE - T_HOLD + 300) / 900));
    qScale += (0.6 + 0.4 * appear - qScale) * 0.12; qAlpha = appear;
    var sup = supportH(), boost = Math.max(0, (sup - BASE) / LIFT);
    var omega = (Math.PI * 2 / 32000) * (1 + 3 * boost) * down;
    qa += omega * dt;

    // Neigung zur Maus, sanft nachgeführt
    var ty = useMouse || mouse ? tiltX * 0.14 : 0, tpch = 0.5 + (useMouse || mouse ? -tiltY * 0.06 : 0);
    setView(yaw + (ty - yaw) * 0.06, pitch + (tpch - pitch) * 0.06);
  }

  function render() {
    ctx.clearRect(0, 0, W, H);
    var qz = supportH() + 0.02;
    var order = cols.slice().sort(function (a, b) { return depth(a) - depth(b); });
    var after = [];
    for (var k = 0; k < order.length; k++) {
      var c = order[k], dp = depth(c);
      var front = dp >= 2.6 || (c.d > QR + 0.3 && dp >= 0.5 && c.h > qz + QT);
      if (front) after.push(c); else drawCol(c);
    }
    drawQ(qa, qz, qScale, qAlpha);
    for (k = 0; k < after.length; k++) drawCol(after[k]);
  }

  function fit() {
    var r = cv.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (!r.width) return;
    var sc = r.width / W;
    cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.width * H / W * dpr);
    ctx.setTransform(dpr * sc, 0, 0, dpr * sc, 0, 0);
    lw = 1 / sc;
  }
  window.addEventListener('resize', function () { fit(); if (reduce) render(); });
  fit();

  if (reduce) {                                        // „Bewegung reduzieren“: ruhendes Bild, Q liegt auf
    cols.forEach(function (c) { var dx = c.x - 1.6, dy = c.y + 1.2; c.h = BASE + LIFT * 0.7 * Math.exp(-(dx * dx + dy * dy) / (2 * SIG * SIG)); });
    qScale = 1; qAlpha = 1; render();
    return;
  }

  var visible = true, raf = 0;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible && !raf) { lastT = null; raf = requestAnimationFrame(loop); } }).observe(cv);
  }
  function loop(t) {
    raf = 0;
    if (!visible || document.hidden) return;
    step(t); render();
    raf = requestAnimationFrame(loop);
  }
  document.addEventListener('visibilitychange', function () { if (!document.hidden && !raf) { lastT = null; raf = requestAnimationFrame(loop); } });
  raf = requestAnimationFrame(loop);
})();
