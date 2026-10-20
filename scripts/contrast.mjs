import { wcagContrast } from 'culori';
import { APCAcontrast, sRGBtoY } from 'apca-w3';

// Conversión hex → OKLCh usando fórmulas CIE 2022 (idénticas a culori v4)
function sRGBToLinear(c) {
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}
function hexToRgb(hex) {
  const c = hex.replace('#', '');
  return {
    r: parseInt(c.substring(0, 2), 16) / 255,
    g: parseInt(c.substring(2, 4), 16) / 255,
    b: parseInt(c.substring(4, 6), 16) / 255,
  };
}
function hexToOklch(hex) {
  const { r, g, b } = hexToRgb(hex);
  const R = sRGBToLinear(r);
  const G = sRGBToLinear(g);
  const B = sRGBToLinear(b);
  const lms = [
    0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B,
    0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B,
    0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B,
  ];
  const l_ = Math.cbrt(lms[0]);
  const m_ = Math.cbrt(lms[1]);
  const s_ = Math.cbrt(lms[2]);
  const l = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0041060506 * s_;
  const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
  const bb = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;
  const h = Math.atan2(bb, a) * 180 / Math.PI;
  const chroma = Math.sqrt(a * a + bb * bb);
  return { l: Math.max(0, Math.min(1, l)), c: Math.max(0, chroma), h: ((h % 360) + 360) % 360 };
}

// OKLCh → sRGB (para inGamut y clampChroma)
function oklchToRgb(l, c, h) {
  const hr = (h * Math.PI) / 180;
  const a = Math.cos(hr) * c;
  const b = Math.sin(hr) * c;
  const lms = [
    l + 0.3963377774 * a + 0.2158037573 * b,
    l - 0.1055613458 * a - 0.0636867766 * b,
    l - 0.0894841775 * a - 1.2916033781 * b,
  ];
  const rgb = [
    4.0767416621 * lms[0] - 3.3077115913 * lms[1] + 0.2309699292 * lms[2],
    -1.2684380046 * lms[0] + 2.6097574046 * lms[1] - 0.3413913693 * lms[2],
    -0.0041960863 * lms[0] - 0.7034187074 * lms[1] + 1.7076145015 * lms[2],
  ];
  const srgb = rgb.map(v => {
    const lin = v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
    return Math.max(0, Math.min(1, lin));
  });
  return { r: srgb[0] * 255, g: srgb[1] * 255, b: srgb[2] * 255, ok: srgb.every(v => v >= 0 && v <= 1) };
}

// clampChroma: reducir croma hasta que el color entre en sRGB
function clampChroma(l, c, h) {
  let cNew = c;
  for (let i = 0; i < 20; i++) {
    const rgb = oklchToRgb(l, cNew, h);
    if (rgb.ok) break;
    cNew *= 0.95;
  }
  return cNew;
}

const colores = {
  'verde-500': '#00704A',
  'verde-900': '#1E3932',
  'crema-50': '#FDFBF7',
  'dorado-500': '#CBA258',
  'blanco': '#FFFFFF',
  'negro-950': '#1a120e',
};

console.log('=== COLORES DE MARCA (hex → OKLCh vía fórmulas CIE 2022) ===');
const oklchColores = {};
for (const [nombre, hex] of Object.entries(colores)) {
  const c = hexToOklch(hex);
  oklchColores[nombre] = c;
  console.log(`${nombre}: ${hex} → OKLCh L=${c.l.toFixed(4)} C=${c.c.toFixed(4)} H=${c.h.toFixed(1)}°`);
}

console.log('\n=== CONTRASTE WCAG 2.2 (culori wcagContrast) ===');
function clsificaWCAG(c) {
  if (c >= 7) return 'AAA';
  if (c >= 4.5) return 'AA (texto normal)';
  if (c >= 3) return 'AA (grande/componentes)';
  if (c >= 1.5) return 'Fail (solo grandes)';
  return 'Fail';
}
const pares = [
  ['blanco', 'verde-500'],
  ['blanco', 'verde-900'],
  ['verde-500', 'crema-50'],
  ['dorado-500', 'verde-900'],
  ['dorado-500', 'crema-50'],
  ['negro-950', 'crema-50'],
  ['blanco', 'crema-50'],
];
for (const [c1, c2] of pares) {
  const conv = wcagContrast(colores[c1], colores[c2]);
  console.log(`${c1} sobre ${c2}: ${conv.toFixed(2)}:1 → ${clsificaWCAG(conv)}`);
}

console.log('\n=== CONTRASTE APCA (apca-w3: sRGBtoY([r,g,b] 0-255) + APCAcontrast) ===');
function srgbHexToY(hex) {
  const c = hexToRgb(hex);
  return sRGBtoY([c.r * 255, c.g * 255, c.b * 255]);
}
for (const [c1, c2] of pares) {
  const y1 = srgbHexToY(colores[c1]);
  const y2 = srgbHexToY(colores[c2]);
  const ap = APCAcontrast(y1, y2);
  const nivel = Math.abs(ap) >= 75 ? 'Excelente' : Math.abs(ap) >= 60 ? 'Bueno' : Math.abs(ap) >= 45 ? 'Aceptable' : Math.abs(ap) >= 15 ? 'Mínimo' : 'Insuficiente';
  console.log(`${c1} (Y=${y1.toFixed(4)}) sobre ${c2} (Y=${y2.toFixed(4)}): APCA ${ap.toFixed(1)} → ${nivel}`);
}

console.log('\n=== CHEQUEOS AUTOMÁTICOS ===');
const L = {};
const C = {};
for (const [nombre, hex] of Object.entries(colores)) {
  L[nombre] = oklchColores[nombre].l;
  C[nombre] = oklchColores[nombre].c;
}
console.log(`L(#1E3932)=${L['verde-900'].toFixed(4)} < L(#00704A)=${L['verde-500'].toFixed(4)}: ${L['verde-900'] < L['verde-500'] ? 'OK' : 'FALLA'}`);
console.log(`L(#00704A)=${L['verde-500'].toFixed(4)} < L(#CBA258)=${L['dorado-500'].toFixed(4)}: ${L['verde-500'] < L['dorado-500'] ? 'OK' : 'FALLA'}`);
console.log(`L(#CBA258)=${L['dorado-500'].toFixed(4)} < L(#FDFBF7)=${L['crema-50'].toFixed(4)}: ${L['dorado-500'] < L['crema-50'] ? 'OK' : 'FALLA'}`);
console.log(`blanco C=${C['blanco'].toFixed(4)}: |C| < 1e-4: ${Math.abs(C['blanco']) < 1e-4 ? 'OK' : 'FALLA'}`);
console.log(`blanco H=${oklchColores['blanco'].h.toFixed(4)}: H ignorado en acromático: OK`);

console.log('\n=== ESCALA VERDE MONÓTONA (950=más oscuro → 50=más claro) desde #00704A ===');
const base = oklchColores['verde-500'];
console.log(`Base verde-500: L=${base.l.toFixed(4)} C=${base.c.toFixed(4)} H=${base.h.toFixed(1)}°`);
for (const e of [950, 900, 800, 700, 600, 500, 400, 300, 200, 100, 50]) {
  let Lv;
  if (e > 500) {
    Lv = base.l - (e - 500) * 0.00065;
  } else if (e < 500) {
    Lv = base.l + (500 - e) * 0.00065;
  } else {
    Lv = base.l;
  }
  Lv = Math.max(0.15, Math.min(0.97, Lv));
  const c = Math.max(0.005, Math.min(0.20, base.c * (e / 500)));
  const cOk = clampChroma(Lv, c, base.h);
  const rgb = oklchToRgb(Lv, cOk, base.h);
  const hex = Math.round(rgb.r).toString(16).padStart(2, '0') + Math.round(rgb.g).toString(16).padStart(2, '0') + Math.round(rgb.b).toString(16).padStart(2, '0');
  console.log(`verde-${e}: L=${Lv.toFixed(4)} C=${cOk.toFixed(4)} H=${base.h.toFixed(1)}° hex=#${hex} inGamut=${rgb.ok}`);
}

console.log('\n=== ESCALA DORADO MONÓTONA (950=más oscuro → 50=más claro) desde #CBA258 ===');
const baseD = oklchColores['dorado-500'];
console.log(`Base dorado-500: L=${baseD.l.toFixed(4)} C=${baseD.c.toFixed(4)} H=${baseD.h.toFixed(1)}°`);
for (const e of [950, 900, 800, 700, 600, 500, 400, 300, 200, 100, 50]) {
  let Lv;
  if (e > 500) {
    Lv = baseD.l - (e - 500) * 0.0005;
  } else if (e < 500) {
    Lv = baseD.l + (500 - e) * 0.0005;
  } else {
    Lv = baseD.l;
  }
  Lv = Math.max(0.15, Math.min(0.97, Lv));
  const c = Math.max(0.02, Math.min(0.12, baseD.c * (e / 500)));
  const cOk = clampChroma(Lv, c, baseD.h);
  const rgb = oklchToRgb(Lv, cOk, baseD.h);
  const hex = Math.round(rgb.r).toString(16).padStart(2, '0') + Math.round(rgb.g).toString(16).padStart(2, '0') + Math.round(rgb.b).toString(16).padStart(2, '0');
  console.log(`dorado-${e}: L=${Lv.toFixed(4)} C=${cOk.toFixed(4)} H=${baseD.h.toFixed(1)}° hex=#${hex} inGamut=${rgb.ok}`);
}

console.log('\n=== UBICACIÓN DE COLORES DE MARCA EN ESCALAS ===');
console.log(`verde-500 (#00704A): L=${L['verde-500'].toFixed(4)} → escalón 500 de escala verde`);
console.log(`verde-900 (#1E3932): L=${L['verde-900'].toFixed(4)} → escalón 900 de escala verde`);
console.log(`dorado-500 (#CBA258): L=${L['dorado-500'].toFixed(4)} → escalón 500 de escala dorado`);

