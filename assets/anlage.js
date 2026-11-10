/* Kinetiq – "Weg eines Werkstücks": Taktanlage in der Draufsicht (eigener Code, SVG)
   - Roboter legt Rohteile von der Platte aufs Stauförderband, danach Taktstraße bis zum Stapeln
   - Läuft nur, wenn der Abschnitt im Bild ist; Zähler laufen über die Uhr weiter
   - Stationstexte stehen im HTML (Liste #anl-st), hier wird nur gezeichnet */
(function () {
'use strict';
var root = document.getElementById('anlage');
var box = document.getElementById('anl-svg');
if (!root || !box || !document.createElementNS) return;
var TPL = "<defs>\n<pattern id=\"anlRaster\" width=\"40\" height=\"40\" patternUnits=\"userSpaceOnUse\"><path d=\"M40 0H0V40\" style=\"fill:none;stroke:#121C30;stroke-width:1\"></path></pattern>\n<pattern id=\"anlSchraffur\" width=\"8\" height=\"8\" patternUnits=\"userSpaceOnUse\" patternTransform=\"rotate(45)\"><path d=\"M0 0V8\" style=\"stroke:#2A3F62;stroke-width:2\"></path></pattern>\n</defs>\n<rect x=\"0\" y=\"0\" width=\"800\" height=\"670\" fill=\"url(#anlRaster)\"></rect>\n<path d=\"M400 410V375M360 435H120M440 425H660V290M78 116V135M116 173H128V130H142\" style=\"fill:none;stroke:#1E3350;stroke-width:2;stroke-dasharray:3 6\"></path>\n<circle cx=\"{{s1x}}\" cy=\"{{s1y}}\" r=\"4\" fill=\"#00A0FD\"></circle>\n<circle cx=\"{{s2x}}\" cy=\"{{s2y}}\" r=\"4\" fill=\"#00A0FD\"></circle>\n<circle cx=\"{{s3x}}\" cy=\"{{s3y}}\" r=\"4\" fill=\"#00A0FD\"></circle>\n<path d=\"M300 120H710V330H90V540H400\" style=\"fill:none;stroke:#2B4369;stroke-width:52;stroke-linejoin:round;stroke-linecap:round\"></path>\n<path d=\"M300 120H710V330H90V540H400\" style=\"fill:none;stroke:#0F1A2E;stroke-width:47;stroke-linejoin:round;stroke-linecap:round\"></path>\n<rect x=\"40\" y=\"40\" width=\"76\" height=\"76\" rx=\"4\" style=\"fill:none;stroke:#DCE6F5;stroke-width:2\"></rect>\n<path d=\"M40 54H33M40 102H33M116 54H123M116 102H123\" style=\"fill:none;stroke:#DCE6F5;stroke-width:2;stroke-linecap:round\"></path>\n<g transform=\"translate(78 78)\"><path d=\"{{qD}}\" style=\"fill:none;stroke:#00A0FD;stroke-width:1.5;stroke-dasharray:4 3\"></path><path d=\"M5 9L9 5L22 18L18 22Z\" style=\"fill:none;stroke:#00A0FD;stroke-width:1.5;stroke-dasharray:4 3\"></path></g>\n<circle cx=\"{{penX}}\" cy=\"{{penY}}\" r=\"3.5\" fill=\"#FFC857\"></circle>\n<rect x=\"40\" y=\"135\" width=\"76\" height=\"76\" rx=\"6\" style=\"fill:url(#anlSchraffur);stroke:#DCE6F5;stroke-width:2\"></rect>\n<rect x=\"61\" y=\"156\" width=\"34\" height=\"34\" rx=\"3\" style=\"fill:#8C99AE;stroke:#DCE6F5;stroke-width:2\"></rect>\n<path d=\"M61 146H95M61 141V151M95 141V151M105 156V190M100 156H110M100 190H110\" opacity=\"{{workO}}\" style=\"fill:none;stroke:#00A0FD;stroke-width:2;stroke-linecap:round\"></path>\n<path d=\"M130 8H784V272H640V184H130Z\" style=\"fill:none;stroke:#E0A83A;stroke-width:2;stroke-dasharray:10 7;stroke-linejoin:round\"></path>\n<rect x=\"123\" y=\"92\" width=\"14\" height=\"10\" rx=\"2\" style=\"fill:#0B1322;stroke:#E0A83A;stroke-width:2\"></rect>\n<rect x=\"123\" y=\"150\" width=\"14\" height=\"10\" rx=\"2\" style=\"fill:#0B1322;stroke:#E0A83A;stroke-width:2\"></rect>\n<path d=\"M127 103V149M130 103V149M133 103V149\" stroke=\"{{beamC}}\" opacity=\"{{beamO}}\" style=\"fill:none;stroke-width:1.5\"></path>\n<circle cx=\"150\" cy=\"208\" r=\"10\" style=\"fill:#F2C230;stroke:#0B1322;stroke-width:2\"></circle>\n<circle cx=\"150\" cy=\"208\" r=\"5\" style=\"fill:#E5484D\"></circle>\n<rect x=\"142\" y=\"70\" width=\"140\" height=\"100\" rx=\"6\" style=\"fill:url(#anlSchraffur);stroke:#DCE6F5;stroke-width:2\"></rect>\n<path d=\"M149 77h126v86h-126Z\" style=\"fill:none;stroke:#2C4670;stroke-width:1.5\"></path>\n<path d=\"{{plateD}}\" style=\"fill:#8C99AE;stroke:#DCE6F5;stroke-width:2;stroke-linejoin:round\"></path>\n<rect x=\"298\" y=\"94\" width=\"330\" height=\"52\" rx=\"8\" style=\"fill:#0F1A2E;stroke:#DCE6F5;stroke-width:2\"></rect>\n<path d=\"{{beltD}}\" style=\"fill:none;stroke:#2C4670;stroke-width:3;stroke-linecap:round\"></path>\n<rect x=\"622\" y=\"100\" width=\"8\" height=\"40\" rx=\"2\" fill=\"{{stopC}}\"></rect>\n<rect x=\"674\" y=\"84\" width=\"72\" height=\"72\" rx=\"5\" style=\"fill:url(#anlSchraffur);stroke:#DCE6F5;stroke-width:2\"></rect>\n<rect x=\"698\" y=\"76\" width=\"24\" height=\"11\" rx=\"2\" style=\"fill:#0B1322;stroke:#DCE6F5;stroke-width:2\"></rect>\n<rect x=\"698\" y=\"153\" width=\"24\" height=\"11\" rx=\"2\" style=\"fill:#0B1322;stroke:#DCE6F5;stroke-width:2\"></rect>\n<rect x=\"676\" y=\"192\" width=\"68\" height=\"66\" rx=\"5\" style=\"fill:none;stroke:#DCE6F5;stroke-width:2\"></rect>\n<circle cx=\"90\" cy=\"435\" r=\"34\" style=\"fill:none;stroke:#DCE6F5;stroke-width:2;stroke-dasharray:9 6\"></circle>\n<g transform=\"{{turnT}}\"><path d=\"M90 397A38 38 0 0 1 128 435M90 473A38 38 0 0 1 52 435\" style=\"fill:none;stroke:#00A0FD;stroke-width:3;stroke-linecap:round\"></path></g>\n<rect x=\"364\" y=\"524\" width=\"72\" height=\"32\" rx=\"4\" style=\"fill:none;stroke:#DCE6F5;stroke-width:2\"></rect>\n<rect x=\"545\" y=\"495\" width=\"90\" height=\"90\" rx=\"6\" style=\"fill:none;stroke:#DCE6F5;stroke-width:2\"></rect>\n<path d=\"M567 495V585M590 495V585M613 495V585\" style=\"fill:none;stroke:#2C4670;stroke-width:2\"></path>\n<rect x=\"690\" y=\"498\" width=\"92\" height=\"84\" rx=\"6\" style=\"fill:none;stroke:#DCE6F5;stroke-width:2;stroke-dasharray:8 5\"></rect>\n<path d=\"{{stackD}}\" style=\"fill:#00A0FD;stroke:#9FDBFF;stroke-width:1.5;stroke-linejoin:round\"></path>\n<path d=\"{{outD}}\" opacity=\"{{outO}}\" style=\"fill:#00A0FD;stroke:#9FDBFF;stroke-width:1.5;stroke-linejoin:round\"></path>\n<rect x=\"{{shx}}\" y=\"{{shy}}\" width=\"38\" height=\"38\" rx=\"3\" transform=\"translate(-19 -19)\" fill=\"#000000\" opacity=\"{{sho}}\"></rect>\n%%PARTS%%\n<path d=\"{{progD}}\" style=\"fill:none;stroke:#00A0FD;stroke-width:3;stroke-linecap:round\"></path>\n<path d=\"M751 78a5 5 0 1 0 10 0a5 5 0 1 0 -10 0M751 268a5 5 0 1 0 10 0a5 5 0 1 0 -10 0M599 284a5 5 0 1 0 10 0a5 5 0 1 0 -10 0M449 278a5 5 0 1 0 10 0a5 5 0 1 0 -10 0M281 276a5 5 0 1 0 10 0a5 5 0 1 0 -10 0M129 398a5 5 0 1 0 10 0a5 5 0 1 0 -10 0M281 498a5 5 0 1 0 10 0a5 5 0 1 0 -10 0M645 478a5 5 0 1 0 10 0a5 5 0 1 0 -10 0\" fill=\"{{lampC}}\" style=\"stroke:#0B1322;stroke-width:1.5\"></path>\n<path d=\"M370 492H640M370 588H640\" style=\"fill:none;stroke:#DCE6F5;stroke-width:3\"></path>\n<g transform=\"{{gantryT}}\"><rect x=\"-6\" y=\"488\" width=\"12\" height=\"104\" rx=\"3\" style=\"fill:#16233B;stroke:#DCE6F5;stroke-width:2\"></rect><rect x=\"-13\" y=\"527\" width=\"26\" height=\"26\" rx=\"4\" style=\"fill:none;stroke:#00A0FD;stroke-width:3\"></rect></g>\n<circle cx=\"{{millX}}\" cy=\"{{millY}}\" r=\"7\" opacity=\"{{workO}}\" style=\"fill:#0B1322;stroke:#FFC857;stroke-width:3\"></circle>\n<path d=\"{{chipD}}\" style=\"fill:#C9D3E3;stroke:none\"></path>\n<g transform=\"{{discT}}\"><circle cx=\"752\" cy=\"225\" r=\"19\" style=\"fill:#16233B;stroke:#DCE6F5;stroke-width:2\"></circle><path d=\"M752 208V242M735 225H769\" style=\"fill:none;stroke:#6F8FBC;stroke-width:2\"></path></g>\n<path d=\"{{sparkD}}\" style=\"fill:none;stroke:#FFC857;stroke-width:2.5;stroke-linecap:round\"></path>\n<rect x=\"515\" y=\"290\" width=\"80\" height=\"80\" rx=\"7\" style=\"fill:#16233B;fill-opacity:0.55;stroke:#DCE6F5;stroke-width:2\"></rect>\n<path d=\"M523 298H587M523 362H587\" style=\"fill:none;stroke:#6F8FBC;stroke-width:3;stroke-dasharray:3 9;stroke-linecap:round\"></path>\n<path d=\"{{sprayD}}\" style=\"fill:#7FD0FF;stroke:none\"></path>\n<rect x=\"355\" y=\"285\" width=\"90\" height=\"90\" rx=\"7\" stroke=\"{{retroStroke}}\" style=\"fill:#16233B;fill-opacity:0.8;stroke-width:3\"></rect>\n<path d=\"M369 300H431M369 313H410\" stroke=\"{{retroStroke}}\" style=\"fill:none;stroke-width:3;stroke-linecap:round\"></path>\n<circle cx=\"428\" cy=\"359\" r=\"5\" fill=\"{{retroLed}}\"></circle>\n<rect x=\"232\" y=\"268\" width=\"26\" height=\"18\" rx=\"3\" style=\"fill:#16233B;stroke:#DCE6F5;stroke-width:2\"></rect>\n<path d=\"M245 286V326\" opacity=\"{{laserO}}\" style=\"fill:none;stroke:#E5484D;stroke-width:2\"></path>\n<rect x=\"360\" y=\"410\" width=\"80\" height=\"50\" rx=\"5\" style=\"fill:url(#anlSchraffur);stroke:#DCE6F5;stroke-width:2\"></rect>\n<circle cx=\"374\" cy=\"424\" r=\"4.5\" fill=\"{{ledA}}\"></circle>\n<circle cx=\"388\" cy=\"424\" r=\"4.5\" fill=\"{{ledB}}\"></circle>\n<rect x=\"408\" y=\"430\" width=\"22\" height=\"20\" rx=\"2\" style=\"fill:#0A2A44;stroke:#00A0FD;stroke-width:1.5\"></rect>\n<rect x=\"580\" y=\"440\" width=\"80\" height=\"46\" rx=\"5\" style=\"fill:#0A1A2C;stroke:#DCE6F5;stroke-width:2\"></rect>\n<path d=\"{{barD}}\" style=\"fill:#00A0FD\"></path>\n<path d=\"{{trendD}}\" style=\"fill:none;stroke:#3DDC97;stroke-width:2;stroke-linecap:round;stroke-linejoin:round\"></path>\n<rect x=\"234\" y=\"492\" width=\"22\" height=\"12\" rx=\"3\" style=\"fill:#0B1322;stroke:#DCE6F5;stroke-width:2\"></rect>\n<rect x=\"234\" y=\"576\" width=\"22\" height=\"12\" rx=\"3\" style=\"fill:#0B1322;stroke:#DCE6F5;stroke-width:2\"></rect>\n<path d=\"{{scanD}}\" opacity=\"{{workO}}\" style=\"fill:none;stroke:#00A0FD;stroke-width:3\"></path>\n<rect x=\"90\" y=\"612\" width=\"52\" height=\"34\" rx=\"4\" style=\"fill:url(#anlSchraffur);stroke:#DCE6F5;stroke-width:2\"></rect>\n<path d=\"M104 612V604H128V612M90 626H142\" style=\"fill:none;stroke:#DCE6F5;stroke-width:2;stroke-linejoin:round\"></path>\n<circle cx=\"330\" cy=\"44\" r=\"22\" style=\"fill:url(#anlSchraffur);stroke:#DCE6F5;stroke-width:2\"></circle>\n<path d=\"{{armD}}\" style=\"fill:none;stroke:#2F6FB3;stroke-width:15;stroke-linecap:round;stroke-linejoin:round\"></path>\n<path d=\"{{armD}}\" style=\"fill:none;stroke:#DCE6F5;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:6 5\"></path>\n<circle cx=\"330\" cy=\"44\" r=\"10\" style=\"fill:#00A0FD\"></circle>\n<circle cx=\"{{ex}}\" cy=\"{{ey}}\" r=\"8\" style=\"fill:#0B1322;stroke:#DCE6F5;stroke-width:2\"></circle>\n<circle cx=\"{{gx}}\" cy=\"{{gy}}\" r=\"{{gr}}\" stroke=\"{{gc}}\" style=\"fill:none;stroke-width:3\"></circle>\n<g transform=\"translate(78 238)\"><path d=\"M0 -4L0 -30\" opacity=\"{{workO}}\" style=\"fill:none;stroke:#DCE6F5;stroke-width:4;stroke-linecap:round\"></path><ellipse cx=\"0\" cy=\"0\" rx=\"17\" ry=\"9\" style=\"fill:#0A0D14;stroke:#DCE6F5;stroke-width:2\"></ellipse><circle cx=\"7\" cy=\"2\" r=\"2\" style=\"fill:#00A0FD\"></circle><circle cx=\"0\" cy=\"-3\" r=\"8\" style=\"fill:#2A3345;stroke:#DCE6F5;stroke-width:2\"></circle></g>\n<g transform=\"translate(600 214)\"><ellipse cx=\"0\" cy=\"0\" rx=\"17\" ry=\"9\" style=\"fill:#0A0D14;stroke:#DCE6F5;stroke-width:2\"></ellipse><circle cx=\"7\" cy=\"2\" r=\"2\" style=\"fill:#00A0FD\"></circle><circle cx=\"0\" cy=\"-3\" r=\"8\" style=\"fill:#2A3345;stroke:#DCE6F5;stroke-width:2\"></circle></g>\n<g transform=\"translate(470 438)\"><path d=\"M0 0L-26 0\" style=\"fill:none;stroke:#DCE6F5;stroke-width:4;stroke-linecap:round\"></path><ellipse cx=\"0\" cy=\"0\" rx=\"17\" ry=\"9\" style=\"fill:#0A0D14;stroke:#DCE6F5;stroke-width:2\"></ellipse><circle cx=\"7\" cy=\"2\" r=\"2\" style=\"fill:#00A0FD\"></circle><circle cx=\"0\" cy=\"-3\" r=\"8\" style=\"fill:#2A3345;stroke:#DCE6F5;stroke-width:2\"></circle></g>\n<g style=\"font-family:Chakra Petch,sans-serif;font-size:11px;fill:#6F8FBC\"><text x=\"694\" y=\"492\">VERSAND</text></g>\n<circle cx=\"{{bx}}\" cy=\"{{by}}\" r=\"17\" fill=\"#00A0FD\" opacity=\"{{bo}}\"></circle>\n%%BADGES%%";
var PART = "<g transform=\"{{p#.t}}\">\n<g opacity=\"{{p#.rawO}}\"><rect x=\"-19\" y=\"-19\" width=\"38\" height=\"38\" rx=\"3\" style=\"fill:#8C99AE;stroke:#DCE6F5;stroke-width:2\"></rect><path d=\"M-12 -4L-4 -12M-12 8L8 -12M-4 12L12 -4\" style=\"fill:none;stroke:#6F7C92;stroke-width:2;stroke-linecap:round\"></path></g>\n<g opacity=\"{{p#.qO}}\"><path d=\"M5 9L9 5L22 18L18 22Z\" fill=\"{{p#.fill}}\" stroke=\"{{p#.stroke}}\" style=\"stroke-width:2;stroke-linejoin:round\"></path><path d=\"{{qD}}\" fill=\"{{p#.fill}}\" stroke=\"{{p#.stroke}}\" style=\"stroke-width:2;stroke-linejoin:round\"></path><circle cx=\"0\" cy=\"0\" r=\"7\" fill=\"{{p#.hole}}\" stroke=\"{{p#.stroke}}\" style=\"stroke-width:2\"></circle></g>\n<g opacity=\"{{p#.checkO}}\"><circle cx=\"21\" cy=\"-21\" r=\"9\" style=\"fill:#3DDC97\"></circle><path d=\"M17 -21L20 -18L26 -25\" style=\"fill:none;stroke:#04121F;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round\"></path></g>\n</g>";
var items = [].slice.call(root.querySelectorAll('#anl-st li'));
var B = items.map(function (li) { return li.getAttribute('data-p').split(',').map(Number); });
var parts = '';
for (var pi = 0; pi < 13; pi++) parts += PART.replace(/p#/g, 'p' + pi);
var badges = '<circle class="sel" cx="{{bx}}" cy="{{by}}" r="18" fill="#00A0FD" opacity="{{bo}}"></circle><g class="bdg" style="font-family:Chakra Petch,sans-serif;font-weight:600;font-size:17px;text-anchor:middle;fill:#FFFFFF">';
B.forEach(function (b, k) {
  badges += '<circle cx="' + b[0] + '" cy="' + b[1] + '" r="15" style="fill:#0B1322;fill-opacity:0.85;stroke:#DCE6F5;stroke-width:2"></circle><text x="' + b[0] + '" y="' + (b[1] + 6) + '">' + (k + 1) + '</text>';
});
badges += '</g>';
var html = TPL.replace('%%PARTS%%', parts).replace('%%BADGES%%', badges)
  .replace(/([\w:-]+)="\{\{([\w.]+)\}\}"/g, 'data-k-$1="$2"');
box.innerHTML = '<svg viewBox="0 0 800 670" role="img" aria-label="Taktanlage in der Draufsicht: Ein Roboter legt Rohteile von der Platte auf ein Förderband, danach durchlaufen sie die Stationen und werden gestapelt">' + html + '</svg>';
var binds = [];
[].forEach.call(box.querySelectorAll('*'), function (el) {
  for (var a = el.attributes.length - 1; a >= 0; a--) {
    var at = el.attributes[a];
    if (at.name.indexOf('data-k-') === 0) {
      var key = at.value.split('.');
      binds.push({ el: el, attr: at.name.slice(7), k0: key[0], k1: key[1], last: null });
      el.removeAttribute(at.name);
    }
  }
});
var hud = {};
['stk', 'takt', 'laufzeit', 'phase'].forEach(function (k) { hud[k] = { el: document.getElementById('anl-' + k), last: null }; });
var titel = document.getElementById('anl-titel'), text = document.getElementById('anl-text');
var T0 = { t: titel.textContent, x: text.textContent };
var sel = -1;
items.forEach(function (li, idx) {
  var btn = li.querySelector('button');
  btn.addEventListener('click', function () {
    sel = sel === idx ? -1 : idx;
    items.forEach(function (o, j) { o.querySelector('button').setAttribute('aria-pressed', j === sel ? 'true' : 'false'); });
    titel.textContent = sel < 0 ? T0.t : li.querySelector('h3').textContent;
    text.textContent = sel < 0 ? T0.x : li.querySelector('p').textContent;
    if (!running) draw();
  });
});
root.classList.add('an');

function pos(L) {
if (L <= 620) return [90 + L, 120];
if (L <= 830) return [710, 120 + (L - 620)];
if (L <= 1450) return [710 - (L - 830), 330];
if (L <= 1660) return [90, 330 + (L - 1450)];
return [90 + (L - 1660), 540];
}
function along(pts, f) {
var tot = 0, segs = [];
for (var i = 1; i < pts.length; i++) {
var l = Math.abs(pts[i][0] - pts[i - 1][0]) + Math.abs(pts[i][1] - pts[i - 1][1]);
segs.push(l); tot += l;
}
var t = f * tot;
for (var j = 0; j < segs.length; j++) {
if (t <= segs[j]) {
var q = segs[j] ? t / segs[j] : 0;
return [pts[j][0] + (pts[j + 1][0] - pts[j][0]) * q, pts[j][1] + (pts[j + 1][1] - pts[j][1]) * q];
}
t -= segs[j];
}
return pts[pts.length - 1];
}
function gear(cx, cy, ro, ri) {
var d = '', rad = Math.PI / 180;
for (var k = 0; k < 8; k++) {
var c = k * 45 + 22.5;
var pts = [[ri, c - 22.5], [ri, c - 11], [ro, c - 8], [ro, c + 8], [ri, c + 11]];
for (var i = 0; i < pts.length; i++) {
var x = Math.round((cx + pts[i][0] * Math.cos(pts[i][1] * rad)) * 10) / 10;
var y = Math.round((cy + pts[i][0] * Math.sin(pts[i][1] * rad)) * 10) / 10;
d += (i === 0 && k === 0 ? 'M' : 'L') + x + ' ' + y;
}
}
return d + 'Z';
}
function pile(x, n) {
var d = 'M0 0';
for (var k = 0; k < n; k++) d += gear(x + (k % 2) * 3, 556 - k * 5, 19, 14);
return d;
}
function vals(T) {
var r1 = function (v) { return Math.round(v * 10) / 10; };
var ease = function (t) { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };
var MOVE = 2, DWELL = 5.5;
var CYC = MOVE + DWELL;
var n = Math.floor(T / CYC);
var ph = T - n * CYC;
var u = ph / CYC;
var moving = ph < MOVE;
var e = moving ? ease(ph / MOVE) : 1;
var eq = moving ? ease(ph / (MOVE * 0.45)) : 1;
var dp = moving ? 0 : (ph - MOVE) / DWELL;
var P = [510, 620, 725, 985, 1140, 1295, 1555, 1815, 1970];
var out = {};
var kc = n % 6;
var cell = [[166, 212, 258][kc % 3], [97, 143][Math.floor(kc / 3)]];
var drop = [322, 120];
var restP = [296, 62];
var carryX = 400, lift0 = 0, armT = restP, grip = false, p0;
if (u < 0.1) { var a0 = ease(u / 0.1); p0 = cell; armT = [restP[0] + (cell[0] - restP[0]) * a0, restP[1] + (cell[1] - restP[1]) * a0]; }
else if (u < 0.4) { var a1 = ease((u - 0.1) / 0.3); p0 = [cell[0] + (drop[0] - cell[0]) * a1, cell[1] + (drop[1] - cell[1]) * a1]; lift0 = Math.sin(Math.PI * a1); armT = p0; grip = true; }
else if (u < 0.46) { p0 = drop; armT = drop; grip = u < 0.43; }
else {
var a2 = Math.min(1, (u - 0.46) / 0.16);
p0 = [drop[0] + (440 - drop[0]) * a2, 120];
var a3 = ease((u - 0.46) / 0.25);
armT = [drop[0] + (restP[0] - drop[0]) * a3, drop[1] + (restP[1] - drop[1]) * a3];
}
for (var i = 0; i < 13; i++) {
var cur = function (k) { return !moving && i === k; };
var p, sc = 1, rot = 0;
if (i === 0) { p = p0; sc = 1 + 0.3 * lift0; }
else if (i <= 4) { var from = 600 - 40 * (5 - i), to = 600 - 40 * (4 - i); p = [from + (to - from) * eq, 120]; }
else { p = pos(moving ? P[i - 5] + (P[i - 4] - P[i - 5]) * e : P[i - 4]); }
var m = i > 5 ? 1 : (cur(5) ? Math.min(1, dp * 1.15) : 0);
if (i > 10) rot += 180;
if (cur(10)) { rot += 180 * ease(dp); sc = 1 + 0.15 * Math.sin(Math.PI * dp); }
if (cur(12)) {
carryX = 400 + 190 * ease((dp - 0.15) / 0.6);
p = [carryX, 540];
sc = 1 + 0.25 * Math.sin(Math.PI * Math.max(0, Math.min(1, (dp - 0.08) / 0.84)));
}
var bright = i > 6 || (cur(6) && dp > 0.6);
var checked = i > 11 || (cur(11) && dp > 0.7);
var marked = i > 9 || (cur(9) && dp > 0.5);
out['p' + i] = {
t: 'translate(' + r1(p[0]) + ' ' + r1(p[1]) + ') rotate(' + Math.round(rot) + ') scale(' + r1(sc) + ')',
rawO: r1(1 - m),
qO: r1(m),
fill: i === 12 ? '#00A0FD' : (bright ? '#D5DEEC' : '#8FA0B8'),
stroke: checked ? '#9FDBFF' : (i > 7 ? '#FFFFFF' : '#B9C4D6'),
hole: marked ? '#00A0FD' : '#0F1A2E',
checkO: (i === 11 && checked) ? 1 : 0
};
}
var plateD = 'M0 0';
for (var c = kc + 1; c < 6; c++) {
plateD += 'M' + ([166, 212, 258][c % 3] - 18) + ' ' + ([97, 143][Math.floor(c / 3)] - 18) + 'h36v36h-36Z';
}
var work = moving ? 0 : 1;
var bx0 = 330, by0 = 44, len = 100;
var dx = armT[0] - bx0, dy = armT[1] - by0;
var d = Math.max(12, Math.min(2 * len - 2, Math.sqrt(dx * dx + dy * dy)));
var ang = Math.atan2(dy, dx);
var bend = Math.acos(d / (2 * len));
var ex = bx0 + len * Math.cos(ang - bend), ey = by0 + len * Math.sin(ang - bend);
var gx = bx0 + d * Math.cos(ang), gy = by0 + d * Math.sin(ang);
var ma = dp * Math.PI * 4;
var mx = 710 + 23 * Math.cos(ma), my = 120 + 23 * Math.sin(ma);
var chipD = 'M0 0';
if (!moving && dp < 0.87) {
for (var ci = 0; ci < 5; ci++) {
var ca = ma + Math.PI + (Math.random() - 0.5) * 1.6, cr = 6 + Math.random() * 16;
chipD += 'M' + r1(mx + cr * Math.cos(ca)) + ' ' + r1(my + cr * Math.sin(ca)) + 'h3v3h-3Z';
}
}
var sparkD = 'M0 0';
if (!moving && dp > 0.12 && dp < 0.88) {
sparkD = '';
for (var k = 0; k < 7; k++) {
var an = Math.PI / 2 + (Math.random() - 0.2) * 1.3;
var ln = 8 + Math.random() * 22;
var s0 = 3 + Math.random() * 6;
sparkD += 'M' + r1(731 + s0 * Math.cos(an)) + ' ' + r1(227 + s0 * Math.sin(an)) + 'L' + r1(731 + (s0 + ln) * Math.cos(an)) + ' ' + r1(227 + (s0 + ln) * Math.sin(an));
}
}
var sprayD = 'M0 0';
if (!moving) {
for (var w = 0; w < 12; w++) {
var wx = 525 + Math.random() * 60, wy = 300 + Math.random() * 60;
sprayD += 'M' + r1(wx - 2) + ' ' + r1(wy) + 'a2 2 0 1 0 4 0a2 2 0 1 0 -4 0';
}
}
var off = (T * 170) % 22;
var beltD = '';
for (var b = 0; b < 14; b++) { beltD += 'M' + r1(308 + b * 22 + off) + ' 100V140'; }
var progD = 'M0 0';
if (!moving) {
var C = [[710, 120], [710, 225], [555, 330], [400, 330], [245, 330], [90, 435], [245, 540]];
var f = Math.min(0.999, dp), pa = -Math.PI / 2 + f * Math.PI * 2;
for (var ri = 0; ri < C.length; ri++) {
progD += 'M' + C[ri][0] + ' ' + (C[ri][1] - 31) + 'A31 31 0 ' + (f > 0.5 ? 1 : 0) + ' 1 ' + r1(C[ri][0] + 31 * Math.cos(pa)) + ' ' + r1(C[ri][1] + 31 * Math.sin(pa));
}
}
var scanX = 227 + 36 * (0.5 - 0.5 * Math.cos(dp * Math.PI * 2));
var q1 = along([[400, 410], [400, 375]], (T * 1.1) % 1);
var q2 = along([[360, 435], [120, 435]], (T * 0.5) % 1);
var q3 = along([[440, 425], [660, 425], [660, 290]], (T * 0.4) % 1);
var blink = Math.floor(T * 2) % 2 === 0;
var leaving = moving && n > 0 && n % 8 === 0;
var refill = kc === 0 && u < 0.08;
var mm = Math.floor(T / 60), ss = Math.floor(T % 60);
var pen = T * 1.6;
out.qD = gear(0, 0, 19, 14);
out.plateD = plateD;
out.penX = r1(78 + 24 * Math.cos(pen)); out.penY = r1(78 + 24 * Math.sin(pen));
out.workO = work;
out.beamC = refill ? '#E5484D' : '#E0A83A';
out.beamO = refill ? 1 : 0.45;
out.stopC = moving ? '#3DDC97' : '#E5484D';
out.lampC = moving ? '#F2C230' : '#3DDC97';
out.millX = r1(mx); out.millY = r1(my);
out.chipD = chipD;
out.discT = 'rotate(' + Math.round((T * (moving ? 60 : 420)) % 360) + ' 752 225)';
out.sparkD = sparkD;
out.sprayD = sprayD;
out.beltD = beltD;
out.progD = progD;
out.turnT = 'rotate(' + Math.round(moving ? 0 : 180 * ease(dp)) + ' 90 435)';
out.retroStroke = moving ? '#56627A' : '#00A0FD';
out.retroLed = moving ? '#56627A' : '#3DDC97';
out.laserO = (!moving && dp > 0.2 && dp < 0.8 && Math.random() > 0.25) ? 1 : 0;
out.ledA = blink ? '#3DDC97' : '#1E5C45';
out.ledB = blink ? '#0A4A75' : '#00A0FD';
out.scanD = 'M' + r1(scanX) + ' 504V576';
out.gantryT = 'translate(' + r1(moving ? 590 - 190 * e : carryX) + ' 0)';
out.stackD = pile(590, n % 8);
out.outD = leaving ? pile(590 + 150 * e, 8) : 'M0 0';
out.outO = leaving ? r1(1 - e * e) : 0;
out.s1x = r1(q1[0]); out.s1y = r1(q1[1]); out.s2x = r1(q2[0]); out.s2y = r1(q2[1]); out.s3x = r1(q3[0]); out.s3y = r1(q3[1]);
out.armD = 'M' + bx0 + ' ' + by0 + 'L' + r1(ex) + ' ' + r1(ey) + 'L' + r1(gx) + ' ' + r1(gy);
out.ex = r1(ex); out.ey = r1(ey); out.gx = r1(gx); out.gy = r1(gy);
out.gr = grip ? 11 : 15; out.gc = grip ? '#00A0FD' : '#FFFFFF';
out.shx = r1(p0[0] + 10 * lift0); out.shy = r1(p0[1] + 16 * lift0); out.sho = r1(0.45 * lift0);
var barD = 'M0 0', trendD = '';
for (var bi = 0; bi < 6; bi++) {
var bh = 8 + 12 * (0.5 + 0.5 * Math.sin(T * 0.9 + bi * 1.3));
barD += 'M' + (588 + bi * 11) + ' 480v-' + r1(bh) + 'h7v' + r1(bh) + 'Z';
trendD += (bi === 0 ? 'M' : 'L') + (591 + bi * 11) + ' ' + r1(456 - bi * 1.6 - 2 * Math.sin(T * 0.7 + bi));
}
out.barD = barD; out.trendD = trendD;
out.stk = String(n);
out.takt = CYC.toFixed(1).replace('.', ',') + ' s';
out.laufzeit = (mm < 10 ? '0' : '') + mm + ':' + (ss < 10 ? '0' : '') + ss;
out.phase = moving ? 'Transport' : 'Bearbeitung';

out.bx = sel >= 0 ? B[sel][0] : 0; out.by = sel >= 0 ? B[sel][1] : 0; out.bo = sel >= 0 ? 1 : 0;
return out;
}

var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var start = null, running = false, raf = 0, visible = false;
function now() { return (window.performance && performance.now ? performance.now() : Date.now()); }
function draw() {
  if (start === null) start = now();
  var T = still ? 3.2 : (now() - start) / 1000;
  var v = vals(T);
  for (var i = 0; i < binds.length; i++) {
    var b = binds[i], x = v[b.k0];
    if (b.k1) x = x[b.k1];
    if (x !== b.last) { b.el.setAttribute(b.attr, x); b.last = x; }
  }
  for (var k in hud) { if (hud[k].el && hud[k].last !== v[k]) { hud[k].el.textContent = v[k]; hud[k].last = v[k]; } }
}
function loop() { draw(); raf = requestAnimationFrame(loop); }
function sync() {
  var want = visible && !document.hidden && !still;
  if (want && !running) { running = true; raf = requestAnimationFrame(loop); }
  else if (!want && running) { running = false; cancelAnimationFrame(raf); }
}
draw();
if ('IntersectionObserver' in window) {
  new IntersectionObserver(function (es) { visible = es[es.length - 1].isIntersecting; sync(); }, { rootMargin: '120px' }).observe(box);
} else { visible = true; }
document.addEventListener('visibilitychange', sync);
sync();
})();
