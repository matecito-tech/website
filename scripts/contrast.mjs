import { wcagContrast, oklch, formatHex } from 'culori';
import { APCAcontrast, sRGBtoY } from 'apca-w3';
import { readFileSync } from 'node:fs';

// Leer tokens desde global.css (única fuente de verdad)
const css = readFileSync('src/styles/global.css', 'utf-8');

function extractToken(name) {
  const re = new RegExp('--' + name + ':\\s*oklch\\(([^)]+)\\)', 'i');
  const m = css.match(re);
  if (!m) return null;
  const parts = m[1].trim().split(/\s+/);
  return { l: parseFloat(parts[0]), c: parseFloat(parts[1]), h: parseFloat(parts[2]) };
}

function tokenHex(name) {
  const t = extractToken(name);
  if (!t) return null;
  const col = oklch({ mode: 'oklch', l: t.l, c: t.c, h: t.h });
  return formatHex(col);
}

function srgbHexToY(hex) {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return sRGBtoY([r, g, b]);
}

// Tokens de color (leídos de global.css)
const verde = tokenHex('color-brand-verde') || '#3ca577';
const verdeProfundo = tokenHex('color-brand-verde-profundo') || '#0f3c29';
const crema = tokenHex('color-brand-crema') || '#fdfbf7';
const dark = tokenHex('color-brand-dark') || '#1a120e';
const success = tokenHex('color-success') || '#22c55e';
const blanco = '#ffffff';

// Dark mode verde (override en .dark)
const darkMatch = css.match(/\.dark\s*\{[^}]*--color-brand-verde:\s*oklch\(([^)]+)\)/);
const verdeDark = darkMatch
  ? formatHex(oklch({ mode: 'oklch', l: parseFloat(darkMatch[1].split(/\s+/)[0]), c: parseFloat(darkMatch[1].split(/\s+/)[1]), h: parseFloat(darkMatch[1].split(/\s+/)[2]) }))
  : verde;

const colores = {
  'verde': verde,
  'verde-profundo': verdeProfundo,
  'crema': crema,
  'dark': dark,
  'success': success,
  'blanco': blanco,
  'verde-dark': verdeDark,
  'blue-600': '#2563eb',
  'blue-400': '#60a5fa',
};

console.log('=== TOKENS LEÍDOS DE global.css ===');
for (const [name, hex] of Object.entries(colores)) {
  console.log(`${name}: ${hex}`);
}
console.log('');

// Pares reales de uso (texto, fondo)
const pares = [
  // Claro
  { fg: 'blanco', bg: 'verde', modo: 'claro', texto: 'blanco sobre verde (botones)' },
  { fg: 'blanco', bg: 'verde-profundo', modo: 'claro', texto: 'blanco sobre verde-profundo (footer)' },
  { fg: 'verde-profundo', bg: 'crema', modo: 'claro', texto: 'verde-profundo sobre crema (texto body)' },
  { fg: 'verde', bg: 'crema', modo: 'claro', texto: 'verde sobre crema (enlaces, eyebrows)' },
  { fg: 'blue-600', bg: 'crema', modo: 'claro', texto: 'blue-600 sobre crema (Fundador)' },
  { fg: 'success', bg: 'dark', modo: 'claro', texto: 'success sobre dark (badge En Línea)' },
  // Oscuro
  { fg: 'blanco', bg: 'dark', modo: 'oscuro', texto: 'blanco sobre dark (texto)' },
  { fg: 'crema', bg: 'dark', modo: 'oscuro', texto: 'crema sobre dark (texto)' },
  { fg: 'verde-dark', bg: 'dark', modo: 'oscuro', texto: 'verde-dark sobre dark (acentos)' },
  { fg: 'blue-400', bg: 'dark', modo: 'oscuro', texto: 'blue-400 sobre dark (Fundador)' },
  { fg: 'success', bg: 'dark', modo: 'oscuro', texto: 'success sobre dark (badge En Línea)' },
];

console.log('=== CONTRASTE WCAG 2.2 ===');
let failed = false;
for (const p of pares) {
  const conv = wcagContrast(colores[p.fg], colores[p.bg]);
  const level = conv >= 7 ? 'AAA' : conv >= 4.5 ? 'AA' : conv >= 3 ? 'AA-grande' : 'FAIL';
  const ok = conv >= 4.5 || conv >= 3;
  if (conv < 4.5 && conv < 3) failed = true;
  console.log(`${p.texto}: ${conv.toFixed(2)}:1 → ${level} ${ok ? '✅' : '❌'}`);
}

console.log('\n=== CONTRASTE APCA ===');
for (const p of pares) {
  const y1 = srgbHexToY(colores[p.fg]);
  const y2 = srgbHexToY(colores[p.bg]);
  const ap = APCAcontrast(y1, y2);
  const nivel = Math.abs(ap) >= 75 ? 'Excelente' : Math.abs(ap) >= 60 ? 'Bueno' : Math.abs(ap) >= 45 ? 'Aceptable' : Math.abs(ap) >= 15 ? 'Mínimo' : 'Insuficiente';
  console.log(`${p.texto}: APCA ${ap.toFixed(1)} → ${nivel}`);
}

// Check focus ring (≥3:1 non-text)
console.log('\n=== FOCUS RING (≥3:1 no-textual) ===');
const ringContrast = wcagContrast(colores['verde'], colores['crema']);
console.log(`verde sobre crema (focus ring): ${ringContrast.toFixed(2)}:1 ${ringContrast >= 3 ? '✅' : '❌'}`);

if (failed) {
  console.error('\n❌ FALLO: Algún par de texto no alcanza 4.5:1');
  process.exit(1);
} else {
  console.log('\n✅ Todos los pares pasan');
}
