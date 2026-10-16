/* Kinetiq – Säulenfeld im Hero
   Isometrisches Feld aus Stößeln (Hairline-Stil, eigener Code). Unter der Maus heben sich
   die Stößel wie Pressen-Stößel; ohne Maus (Handy) fährt ein Taktpunkt automatisch übers Feld.
   Darüber schwebt das Zahnrad-Q: Ring + Zähne drehen sich, der Schweif steht. */
(function () {
  var cv = document.getElementById('feld');
  if (!cv || !cv.getContext) return;
  var ctx = cv.getContext('2d');

  // Logische Zeichenfläche (CSS skaliert), Farben aus der Kinetiq-Palette
  var W = 520, H = 420;
  var BLAU = [0, 160, 253], STAHL = [141, 151, 168];
  var N = 9, HALF = (N - 1) / 2;           // 9 × 9 Stößel
  var S = 29;                               // Rastermaß in px
  var ZS = S * 0.82;                        // Höhenmaß in px
  var C = Math.cos(Math.PI / 6);
  var OX = W / 2, OY = H * 0.63;            // Ursprung (Feldmitte)
  var HW = 0.36;                            // halbe Stößelbreite (Rest = Fuge)
  var BASE = 0.32, LIFT = 2.3, SIG = 1.15;  // Grundhöhe, Hub, Einflussradius

  var reduce = false;
  try { reduce = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  // Stößel-Zustand (Feder-Dämpfer für mechanisches Nachfedern)
  var cols = [];
  for (var i = 0; i < N; i++) for (var j = 0; j < N; j++) {
    cols.push({ x: i - HALF, y: j - HALF, h: BASE, v: 0 });
  }
  cols.sort(function (a, b) { return (a.x + a.y) - (b.x + b.y) || (a.x - b.x); });

  function iso(gx, gy, z) {
    return [OX + (gx - gy) * C * S, OY + (gx + gy) * 0.5 * S - z * ZS];
  }
  function mix(a, b, t, al) {
    return 'rgba(' + Math.round(a[0] + (b[0] - a[0]) * t) + ',' + Math.round(a[1] + (b[1] - a[1]) * t) + ',' + Math.round(a[2] + (b[2] - a[2]) * t) + ',' + al + ')';
  }
  function poly(pts) {
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    for (var k = 1; k < pts.length; k++) ctx.lineTo(pts[k][0], pts[k][1]);
    ctx.closePath();
  }

  var lw = 1; // Linienstärke in logischen px, so gesetzt, dass es 1 CSS-px ergibt

  function drawCol(c) {
    var x0 = c.x - HW, x1 = c.x + HW, y0 = c.y - HW, y1 = c.y + HW, h = c.h;
    var t = Math.max(0, Math.min(1, (h - BASE) / LIFT));
    var A = iso(x0, y0, h), B = iso(x1, y0, h), Cc = iso(x1, y1, h), D = iso(x0, y1, h);
    var B0 = iso(x1, y0, 0), C0 = iso(x1, y1, 0), D0 = iso(x0, y1, 0);
    var line = mix(STAHL, BLAU, t, 0.32 + 0.6 * t);
    ctx.lineWidth = lw;
    // rechte Seitenfläche (x = x1)
    poly([B, Cc, C0, B0]); ctx.fillStyle = '#0A101C'; ctx.fill(); ctx.strokeStyle = line; ctx.stroke();
    // vordere Seitenfläche (y = y1)
    poly([D, Cc, C0, D0]); ctx.fillStyle = '#080D17'; ctx.fill(); ctx.stroke();
    // Deckfläche
    poly([A, B, Cc, D]); ctx.fillStyle = '#0E1626'; ctx.fill();
    if (t > 0.02) { ctx.fillStyle = 'rgba(0,160,253,' + (0.16 * t) + ')'; ctx.fill(); }
    ctx.stroke();
    // Stößel-Markierung auf der Deckfläche, nur bei Hub
    if (t > 0.25) {
      var m = iso(c.x, c.y, h);
      ctx.beginPath(); ctx.ellipse(m[0], m[1], HW * 0.5 * C * S * 1.15, HW * 0.5 * 0.5 * S * 1.15, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0,160,253,' + (0.9 * (t - 0.25)) + ')'; ctx.stroke();
    }
  }

  // ---- Zahnrad-Q (Logo-Einheiten: Ring r 30–50, 8 Zähne 12 × 11, Schweif fest) ----
  var QK = 1.9 / 50;                        // Logo-Einheit → Rastermaß
  var R2 = Math.SQRT1_2;
  function qPt(lx, ly, z) {                 // Logo-x → Bildschirm rechts, Logo-y → Bildschirm unten
    return iso((lx + ly) * R2 * QK, (ly - lx) * R2 * QK, z);
  }
  function rot(p, a) { var c = Math.cos(a), s = Math.sin(a); return [p[0] * c - p[1] * s, p[0] * s + p[1] * c]; }
  function gearContour(a) {
    var pts = [], half = Math.asin(6 / 50), yIn = -Math.sqrt(50 * 50 - 36);
    for (var k = 0; k < 8; k++) {
      var th = k * Math.PI / 4;
      // Zahn (lokal nach oben), dann Bogen bis zum nächsten Zahn
      [[-6, yIn], [-6, -59], [6, -59], [6, yIn]].forEach(function (p) { pts.push(rot(p, th + a)); });
      var s0 = th - Math.PI / 2 + half, s1 = th + Math.PI / 4 - Math.PI / 2 - half;
      for (var q = 1; q < 6; q++) { var ang = s0 + (s1 - s0) * q / 6 + a; pts.push([50 * Math.cos(ang), 50 * Math.sin(ang)]); }
    }
    return pts;
  }
  var TAIL = [[4, 16], [16, 4], [62, 50], [38, 50]];
  function tracePlane(pts, z, close) {
    for (var k = 0; k < pts.length; k++) { var p = qPt(pts[k][0], pts[k][1], z); k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }
    if (close) ctx.closePath();
  }
  function circlePlane(r, z) {
    for (var k = 0; k <= 48; k++) { var ang = k / 48 * Math.PI * 2, p = qPt(r * Math.cos(ang), r * Math.sin(ang), z); k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }
    ctx.closePath();
  }
  function qLayer(a, z, top) {
    var g = gearContour(a);
    ctx.beginPath(); tracePlane(g, z, true); circlePlane(30, z);
    ctx.fillStyle = '#0B1424'; ctx.fill('evenodd');
    if (top) { ctx.fillStyle = 'rgba(0,160,253,.22)'; ctx.fill('evenodd'); }
    ctx.strokeStyle = top ? '#00A0FD' : 'rgba(0,160,253,.35)'; ctx.lineWidth = lw * (top ? 1.4 : 1); ctx.stroke();
    // Schweif: dunkle Kontur schneidet den Ring, dann Fläche
    ctx.beginPath(); tracePlane(TAIL, z, true);
    if (top) { ctx.strokeStyle = '#080C15'; ctx.lineWidth = 5 * QK * S * 1.1; ctx.lineJoin = 'miter'; ctx.stroke(); }
    ctx.fillStyle = '#0B1424'; ctx.fill();
    if (top) { ctx.fillStyle = 'rgba(0,160,253,.22)'; ctx.fill(); }
    ctx.strokeStyle = top ? '#00A0FD' : 'rgba(0,160,253,.35)'; ctx.lineWidth = lw * (top ? 1.4 : 1); ctx.stroke();
  }
  function drawQ(a, z) {
    // feine Lotlinie zur Feldmitte – technischer Bezug
    var p0 = iso(0, 0, z - 0.25), p1 = iso(0, 0, centerH());
    ctx.setLineDash([2, 4]); ctx.strokeStyle = 'rgba(0,160,253,.45)'; ctx.lineWidth = lw;
    ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]); ctx.stroke(); ctx.setLineDash([]);
    qLayer(a, z - 0.25, false);             // Unterkante (Materialstärke)
    qLayer(a, z, true);                     // Oberseite
  }
  function centerH() {
    var s = 0, n = 0;
    for (var k = 0; k < cols.length; k++) if (Math.abs(cols[k].x) < 1 && Math.abs(cols[k].y) < 1) { s += cols[k].h; n++; }
    return n ? s / n : BASE;
  }

  // ---- Zeiger: Maus folgt, sonst automatischer Taktpunkt ----
  var px = 0, py = 0, amp = 0, mouse = null, lastMove = -1e9;
  function onMove(e) {
    var r = cv.getBoundingClientRect(), m = 60;
    if (e.clientX < r.left - m || e.clientX > r.right + m || e.clientY < r.top - m || e.clientY > r.bottom + m) { mouse = null; return; }
    var lx = (e.clientX - r.left) * W / r.width, ly = (e.clientY - r.top) * H / r.height + 0.9 * ZS;
    var u = (lx - OX) / (C * S), v = (ly - OY) / (0.5 * S);
    mouse = [(u + v) / 2, (v - u) / 2]; lastMove = performance.now();
  }
  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('pointerdown', onMove, { passive: true });
  document.addEventListener('pointerleave', function () { mouse = null; });

  function step(t) {
    var tx, ty, ta;
    if (mouse && t - lastMove < 2500) { tx = mouse[0]; ty = mouse[1]; ta = 1; }
    else { var s = t / 1000; tx = 3.1 * Math.sin(s * 0.41); ty = 3.1 * Math.sin(s * 0.29 + 1.3); ta = 0.8; }
    px += (tx - px) * 0.14; py += (ty - py) * 0.14; amp += (ta - amp) * 0.05;
    for (var k = 0; k < cols.length; k++) {
      var c = cols[k], dx = c.x - px, dy = c.y - py;
      var target = BASE + LIFT * amp * Math.exp(-(dx * dx + dy * dy) / (2 * SIG * SIG));
      c.v = (c.v + (target - c.h) * 0.16) * 0.74;   // Feder + Dämpfung
      c.h += c.v;
    }
  }

  function render(t) {
    ctx.clearRect(0, 0, W, H);
    var qa = t / 32000 * Math.PI * 2;                  // eine Umdrehung in 32 s wie bisher
    var qz = 3.7 + 0.45 * (centerH() - BASE) + 0.08 * Math.sin(t / 900);
    for (var k = 0; k < cols.length; k++) if (cols[k].x + cols[k].y < 2.6) drawCol(cols[k]);
    drawQ(qa, qz);
    for (k = 0; k < cols.length; k++) if (cols[k].x + cols[k].y >= 2.6) drawCol(cols[k]);
  }

  function fit() {
    var r = cv.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (!r.width) return;
    var sc = r.width / W;
    cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.width * H / W * dpr);
    ctx.setTransform(dpr * sc, 0, 0, dpr * sc, 0, 0);
    lw = 1 / sc;
  }
  window.addEventListener('resize', function () { fit(); if (reduce) still(); });
  fit();

  function still() {                                   // „Bewegung reduzieren“: ein ruhendes Bild
    px = 1.6; py = -1.2; amp = 0.8;
    for (var n = 0; n < 200; n++) step(0);
    cols.forEach(function (c) { c.h = BASE + LIFT * amp * Math.exp(-((c.x - px) * (c.x - px) + (c.y - py) * (c.y - py)) / (2 * SIG * SIG)); });
    render(0);
  }
  if (reduce) { still(); return; }

  var visible = true, raf = 0;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible && !raf) raf = requestAnimationFrame(loop); }).observe(cv);
  }
  function loop(t) {
    raf = 0;
    if (!visible || document.hidden) return;
    step(t); render(t);
    raf = requestAnimationFrame(loop);
  }
  document.addEventListener('visibilitychange', function () { if (!document.hidden && !raf) raf = requestAnimationFrame(loop); });
  raf = requestAnimationFrame(loop);
})();
