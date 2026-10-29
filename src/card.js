// The result cards people post: 1080 × 1920 story images drawn on a canvas. The rangoli, chakri and
// lights are the same SVGs the game shows, drawn in as images.
import { chakri, lights, rangoli } from './art.js';
import { t } from './i18n.js';
import { SITE_HOST } from './config.js';
import { seeded } from './random.js';

const W = 1080;
const H = 1920;
const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", sans-serif';
const CREAM = '#fff3dc';
const MUTED = '#cbb8e6';
const GOLD = '#ffcf5a';

/** An SVG string as a decoded image, with an explicit size so every browser rasterizes it sharply. */
function svgImage(markup, width, height) {
  const sized = markup.replace('<svg ', `<svg width="${width}" height="${height}" `);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(sized)}`;
  });
}

function setFont(ctx, weight, size) {
  ctx.font = `${weight} ${size}px ${FONT}`;
}

/** Shrinks the font until the text fits, down to `min`. */
function fit(ctx, text, maxWidth, weight, size, min) {
  let s = size;
  setFont(ctx, weight, s);
  while (ctx.measureText(text).width > maxWidth && s > min) {
    s -= 2;
    setFont(ctx, weight, s);
  }
  return s;
}

function wrap(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** Centred text, wrapped to at most `maxLines`; returns the y below the last line. */
function centred(ctx, text, y, { size, weight = 700, color = CREAM, maxWidth = W - 160, maxLines = 2, lineHeight = 1.18, min } = {}) {
  setFont(ctx, weight, size);
  let s = size;
  let lines = wrap(ctx, text, maxWidth);
  while (lines.length > maxLines && s > (min ?? size * 0.6)) {
    s -= 2;
    setFont(ctx, weight, s);
    lines = wrap(ctx, text, maxWidth);
  }
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  lines.slice(0, maxLines).forEach((line, i) => ctx.fillText(line, W / 2, y + i * s * lineHeight));
  return y + (Math.min(lines.length, maxLines) - 1) * s * lineHeight;
}

function goldFill(ctx, top, bottom) {
  const g = ctx.createLinearGradient(0, top, 0, bottom);
  g.addColorStop(0, '#ffe9a6');
  g.addColorStop(1, '#f2961c');
  return g;
}

function spaced(ctx, text, y, { size, weight = 800, color = GOLD, spacing = 8 }) {
  setFont(ctx, weight, size);
  ctx.fillStyle = color;
  ctx.textAlign = 'left';
  const widths = [...text].map((ch) => ctx.measureText(ch).width);
  const total = widths.reduce((a, b) => a + b, 0) + spacing * (widths.length - 1);
  let x = (W - total) / 2;
  [...text].forEach((ch, i) => {
    ctx.fillText(ch, x, y);
    x += widths[i] + spacing;
  });
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

async function backdrop(ctx) {
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#12082a');
  sky.addColorStop(0.55, '#2a0f3d');
  sky.addColorStop(1, '#3d1350');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  const glow = ctx.createRadialGradient(W / 2, H, 0, W / 2, H, W);
  glow.addColorStop(0, 'rgba(255,159,28,0.34)');
  glow.addColorStop(1, 'rgba(255,159,28,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  const rng = seeded(11);
  const tints = ['255,207,90', '232,64,122', '31,181,168', '183,140,255'];
  for (let i = 0; i < 28; i++) {
    const x = rng() * W;
    const y = 220 + rng() * (H - 420);
    const r = 12 + rng() * 46;
    const bokeh = ctx.createRadialGradient(x, y, 0, x, y, r);
    const tint = tints[i % tints.length];
    bokeh.addColorStop(0, `rgba(${tint},${0.08 + rng() * 0.1})`);
    bokeh.addColorStop(1, `rgba(${tint},0)`);
    ctx.fillStyle = bokeh;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const string = await svgImage(lights({ withDefs: true }), W, 151);
  ctx.drawImage(string, 0, 0, W, 151);
}

function footer(ctx, cta) {
  const x = 90;
  const y = 1690;
  const w = W - 180;
  const h = 160;
  roundRect(ctx, x, y, w, h, 80);
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,207,90,0.45)';
  ctx.lineWidth = 3;
  ctx.stroke();
  centred(ctx, cta, y + 66, { size: 38, weight: 600, color: CREAM, maxWidth: w - 80, maxLines: 1, min: 26 });
  centred(ctx, t('card.play', { host: SITE_HOST }), y + 122, { size: 42, weight: 800, color: GOLD, maxWidth: w - 80, maxLines: 1, min: 28 });
}

function toBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('The card could not be drawn.'))), 'image/png');
  });
}

function canvas() {
  const el = document.createElement('canvas');
  el.width = W;
  el.height = H;
  return el;
}

/** Jodi Check: names, the rangoli, the score and its title, and who knows whom. */
export async function jodiCard({ names, score, title, line, rows, states }) {
  const el = canvas();
  const ctx = el.getContext('2d');
  await backdrop(ctx);

  spaced(ctx, t('card.jodi.label'), 250, { size: 40, spacing: 10 });
  const pair = `${names[0]} & ${names[1]}`;
  fit(ctx, pair, W - 160, 800, 88, 50);
  ctx.fillStyle = CREAM;
  ctx.textAlign = 'center';
  ctx.fillText(pair, W / 2, 350, W - 160);

  const art = await svgImage(rangoli(states, { withDefs: true }), 640, 640);
  ctx.drawImage(art, (W - 640) / 2, 390, 640, 640);

  setFont(ctx, 900, 200);
  ctx.fillStyle = goldFill(ctx, 1070, 1215);
  ctx.textAlign = 'center';
  ctx.fillText(`${score}/12`, W / 2, 1215);

  // Title and line wrap to two lines at most; the rows still clear the footer at 1690.
  let y = centred(ctx, title, 1310, { size: 72, weight: 800, maxLines: 2 });
  y = centred(ctx, line, y + 62, { size: 40, weight: 500, color: MUTED, maxLines: 2 });
  rows.forEach((row, i) => {
    centred(ctx, `${row.label}  ${row.score}/6`, y + 84 + i * 62, { size: 42, weight: 600, maxLines: 1, min: 28 });
  });

  footer(ctx, t('card.jodi.cta'));
  return toBlob(el);
}

/** Truth or dare: the night's top scorer, the standings and the awards. */
export async function todCard({ winner, points, table, awards }) {
  const el = canvas();
  const ctx = el.getContext('2d');
  await backdrop(ctx);

  spaced(ctx, t('card.tod.label'), 250, { size: 40, spacing: 10 });
  const art = await svgImage(chakri({ withDefs: true }), 360, 360);
  ctx.drawImage(art, (W - 360) / 2, 290, 360, 360);

  centred(ctx, t('tod.result.kicker'), 720, { size: 46, weight: 700, color: MUTED, maxLines: 1 });
  const size = fit(ctx, winner, W - 160, 900, 120, 60);
  ctx.fillStyle = goldFill(ctx, 845 - size, 850);
  ctx.textAlign = 'center';
  ctx.fillText(winner, W / 2, 845);
  centred(ctx, points, 912, { size: 44, weight: 700, maxLines: 1 });

  const left = 170;
  const right = W - 170;
  table.slice(0, 6).forEach((row, i) => {
    const y = 1030 + i * 78;
    setFont(ctx, 800, 42);
    ctx.textAlign = 'left';
    ctx.fillStyle = i === 0 ? GOLD : MUTED;
    ctx.fillText(String(i + 1), left, y);
    ctx.fillStyle = CREAM;
    setFont(ctx, 600, 42);
    let name = row.name;
    while (ctx.measureText(name).width > right - left - 200 && name.length > 2) name = `${name.slice(0, -2)}…`;
    ctx.fillText(name, left + 70, y);
    ctx.textAlign = 'right';
    setFont(ctx, 800, 42);
    ctx.fillStyle = i === 0 ? GOLD : CREAM;
    ctx.fillText(String(row.points), right, y);
  });

  const awardTop = 1030 + Math.min(table.length, 6) * 78 + 50;
  awards.slice(0, 3).forEach((award, i) => {
    const y = awardTop + i * 100;
    if (y > 1620) return;
    centred(ctx, award.title, y, { size: 38, weight: 800, color: GOLD, maxLines: 1 });
    centred(ctx, award.sub, y + 46, { size: 32, weight: 500, color: CREAM, maxLines: 1 });
  });

  footer(ctx, t('card.tod.cta'));
  return toBlob(el);
}
