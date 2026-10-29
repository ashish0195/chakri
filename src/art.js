// Chakri's art, drawn as SVG strings: diyas, the rangoli, the chakri, the four firecrackers, laddoos
// and the string lights. Gradients live in DEFS, once in the page (see app.js) and inside any SVG that
// is drawn on its own, like the share cards.

export const DEFS = `
<radialGradient id="ck-glow"><stop offset="0" stop-color="#ffe08a" stop-opacity=".9"/><stop offset=".4" stop-color="#ff9f1c" stop-opacity=".38"/><stop offset="1" stop-color="#ff7a1a" stop-opacity="0"/></radialGradient>
<linearGradient id="ck-clay" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e57a3e"/><stop offset="1" stop-color="#8e3117"/></linearGradient>
<linearGradient id="ck-clay-out" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a6070"/><stop offset="1" stop-color="#4a2a45"/></linearGradient>
<linearGradient id="ck-flame" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff6a13"/><stop offset=".5" stop-color="#ffb627"/><stop offset="1" stop-color="#fff2b0"/></linearGradient>
<linearGradient id="ck-gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe7a0"/><stop offset="1" stop-color="#f2961c"/></linearGradient>
<radialGradient id="ck-laddoo" cx=".38" cy=".35" r=".75"><stop offset="0" stop-color="#ffd27a"/><stop offset=".6" stop-color="#f4a12f"/><stop offset="1" stop-color="#c96a12"/></radialGradient>
`;

const PETAL_COLORS = ['#ff9f1c', '#e8407a', '#ffcf5a', '#1fb5a8'];
const BULB_COLORS = ['#ffcf5a', '#e8407a', '#1fb5a8', '#ff9f1c', '#b78cff'];

function defsBlock(withDefs) {
  return withDefs ? `<defs>${DEFS}</defs>` : '';
}

function svg(viewBox, body, { withDefs = false, cls = '', size, label } = {}) {
  const dims = size ? ` width="${size}" height="${size}"` : '';
  const a11y = label ? ` role="img" aria-label="${label}"` : ' aria-hidden="true"';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}"${dims} class="${cls}" overflow="visible"${a11y}>${defsBlock(withDefs)}${body}</svg>`;
}

// ── Diya ────────────────────────────────────────────────────────────────────────────────────────

/** The inside of a diya, drawn in a 70 × 64 box with the flame on the spout at the right. */
export function diyaBody(lit) {
  const glow = lit ? '<circle cx="58" cy="20" r="20" fill="url(#ck-glow)"/>' : '';
  const flame = lit
    ? `<g transform="translate(58.5 28.5)"><g class="flame">
        <path d="M0 0 C-5.5 -3.5 -6 -10.5 0 -21 C6 -10.5 5.5 -3.5 0 0 Z" fill="url(#ck-flame)"/>
        <path d="M0 -1.5 C-2.5 -3.5 -2.6 -7.5 0 -12 C2.6 -7.5 2.5 -3.5 0 -1.5 Z" fill="#fffbe6"/>
      </g></g>`
    : '';
  return `${glow}
    <path d="M7 35 C9 47 19 53 31 53 C43 53 51 47 54 39 L60 29.5 C57 31.8 53.5 33.6 50 34.6 C40 37 20 37 7 35 Z" fill="url(#${lit ? 'ck-clay' : 'ck-clay-out'})"/>
    <ellipse cx="29" cy="35" rx="20" ry="3.4" fill="${lit ? '#4a170b' : '#2a1530'}"/>
    <ellipse cx="29" cy="34.7" rx="14" ry="1.8" fill="${lit ? '#f5b43a' : '#6a5070'}" opacity=".55"/>
    <g fill="${lit ? '#ffd36b' : '#b79ab8'}">
      <circle cx="14" cy="43" r="1.7"/><circle cx="21.5" cy="46.5" r="1.7"/><circle cx="29.5" cy="48" r="1.7"/>
      <circle cx="37.5" cy="47" r="1.7"/><circle cx="44.5" cy="44" r="1.7"/>
    </g>
    <path d="M56.5 31.5 L58.5 28.5" stroke="#2b1206" stroke-width="1.6" stroke-linecap="round"/>
    ${flame}`;
}

export function diya({ lit = true, size, withDefs = false, cls = '', label } = {}) {
  return svg('0 0 70 64', diyaBody(lit), { withDefs, cls: `diya ${lit ? 'is-lit' : 'is-out'} ${cls}`, size, label });
}

// ── Rangoli ─────────────────────────────────────────────────────────────────────────────────────

function petal(r0, length, width) {
  const y0 = -r0;
  const y1 = -r0 - length;
  return `M0 ${y0} C${width} ${y0 - length * 0.3} ${width * 0.8} ${y0 - length * 0.78} 0 ${y1} C${-width * 0.8} ${y0 - length * 0.78} ${-width} ${y0 - length * 0.3} 0 ${y0} Z`;
}

/**
 * The rangoli with its 12 diyas. `states` has one entry per question: 'lit' (a match), 'out' (a miss),
 * 'next' (being played) or 'todo'. The slot at `fresh` gets the light-up animation.
 */
export function rangoli(states, { withDefs = false, cls = '', label, fresh = -1 } = {}) {
  const dots = Array.from({ length: 72 }, (_, i) => {
    const a = (i / 72) * Math.PI * 2;
    return `<circle cx="${(Math.sin(a) * 143).toFixed(1)}" cy="${(-Math.cos(a) * 143).toFixed(1)}" r="1.5"/>`;
  }).join('');

  const small = Array.from({ length: 12 }, (_, i) =>
    `<path d="${petal(26, 46, 10)}" transform="rotate(${i * 30 + 15})"/>`).join('');

  const big = states.map((state, i) => {
    const color = PETAL_COLORS[i % PETAL_COLORS.length];
    if (state === 'lit') {
      return `<g transform="rotate(${i * 30})" class="petal is-lit">
        <path d="${petal(24, 74, 17)}" fill="${color}"/>
        <path d="${petal(34, 50, 7)}" fill="#fff3dc" opacity=".35"/>
      </g>`;
    }
    const style = state === 'out'
      ? 'fill="rgba(255,255,255,.05)" stroke="rgba(255,243,220,.4)" stroke-dasharray="2 3"'
      : 'fill="none" stroke="rgba(255,243,220,.3)" stroke-dasharray="1.5 4"';
    return `<g transform="rotate(${i * 30})" class="petal"><path d="${petal(24, 74, 17)}" ${style} stroke-width="1.6"/></g>`;
  }).join('');

  const lamps = states.map((state, i) => {
    const a = (i / 12) * Math.PI * 2;
    const x = (Math.sin(a) * 117).toFixed(1);
    const y = (-Math.cos(a) * 117).toFixed(1);
    const ring = state === 'next' ? '<circle r="21" class="slot-pulse" fill="none" stroke="#ffcf5a" stroke-width="2"/>' : '';
    const dim = state === 'todo' || state === 'next' ? ' opacity=".55"' : '';
    const pop = i === fresh ? ' is-fresh' : '';
    return `<g transform="translate(${x} ${y})" class="slot slot-${state}">${ring}<g class="slot-pop${pop}"><g transform="scale(.5) translate(-35 -38)"${dim}>${diyaBody(state === 'lit')}</g></g></g>`;
  }).join('');

  const hub = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2;
    return `<circle cx="${(Math.sin(a) * 14).toFixed(1)}" cy="${(-Math.cos(a) * 14).toFixed(1)}" r="2.4"/>`;
  }).join('');

  const complete = states.every((s) => s === 'lit') ? ' is-complete' : '';
  const body = `
    <g fill="#fff3dc" opacity=".3">${dots}</g>
    <circle r="134" fill="none" stroke="rgba(255,207,90,.28)" stroke-width="1.4" stroke-dasharray="3 5"/>
    <g fill="#8a3aa0" opacity=".55">${small}</g>
    ${big}
    <circle r="24" fill="#2a1145" stroke="url(#ck-gold)" stroke-width="3"/>
    <g fill="url(#ck-gold)">${hub}</g>
    <circle r="6" fill="url(#ck-gold)"/>
    ${lamps}`;
  return svg('-150 -150 300 300', body, { withDefs, cls: `rangoli${complete} ${cls}`, label });
}

// ── Chakri ──────────────────────────────────────────────────────────────────────────────────────

function spiralPath(turns = 3.2, r0 = 15, r1 = 57, steps = 160) {
  let d = '';
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = t * turns * Math.PI * 2;
    const r = r0 + (r1 - r0) * t;
    d += `${i ? 'L' : 'M'}${(Math.sin(a) * r).toFixed(2)} ${(-Math.cos(a) * r).toFixed(2)}`;
  }
  return d;
}

/** The chakri seen from above, centred on 0,0 with its pointer up. Radius 58, pointer to 92. */
export function chakriBody() {
  const whiteDots = Array.from({ length: 6 }, (_, i) => {
    const a = (i / 6) * Math.PI * 2 + 0.3;
    return `<circle cx="${(Math.sin(a) * 46).toFixed(1)}" cy="${(-Math.cos(a) * 46).toFixed(1)}" r="2.6"/>`;
  }).join('');
  const goldDots = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2;
    return `<circle cx="${(Math.sin(a) * 30).toFixed(1)}" cy="${(-Math.cos(a) * 30).toFixed(1)}" r="2.2"/>`;
  }).join('');
  return `
    <circle r="62" fill="url(#ck-glow)" class="chakri-glow"/>
    <path d="M-11 -55 L0 -92 L11 -55 Z" fill="url(#ck-gold)" stroke="#7a3a08" stroke-width="2" stroke-linejoin="round"/>
    <circle r="58" fill="#19a56e"/>
    <circle r="50" fill="#e8407a"/>
    <circle r="41" fill="#ffcf5a"/>
    <circle r="33" fill="#1fb5a8"/>
    <circle r="25" fill="#e8407a"/>
    <path d="${spiralPath()}" fill="none" stroke="rgba(30,8,40,.35)" stroke-width="2.4"/>
    <g fill="#fff3dc">${whiteDots}</g>
    <g fill="#ffe7a0">${goldDots}</g>
    <circle r="14" fill="#2a1145" stroke="url(#ck-gold)" stroke-width="3"/>
    <circle r="4.5" fill="url(#ck-gold)"/>
    <circle cy="-58" r="4" fill="#5a2a0a"/>`;
}

export function chakri({ size, withDefs = false, cls = '' } = {}) {
  return svg('-100 -100 200 200', chakriBody(), { withDefs, cls: `chakri ${cls}`, size });
}

// ── Firecrackers ────────────────────────────────────────────────────────────────────────────────

function starburst(cx, cy, count, inner, outer, colors) {
  return Array.from({ length: count }, (_, i) => {
    const a = (i / count) * Math.PI * 2;
    const len = i % 2 ? outer * 0.7 : outer;
    const x1 = cx + Math.cos(a) * inner;
    const y1 = cy + Math.sin(a) * inner;
    const x2 = cx + Math.cos(a) * len;
    const y2 = cy + Math.sin(a) * len;
    return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${colors[i % colors.length]}" stroke-width="2" stroke-linecap="round"/>`;
  }).join('');
}

const CRACKERS = {
  sparkler: () => `
    <circle cx="40" cy="21" r="13" fill="url(#ck-glow)"/>
    <line x1="15" y1="57" x2="38" y2="24" stroke="#a6a9bd" stroke-width="3" stroke-linecap="round"/>
    <line x1="31" y1="34" x2="38" y2="24" stroke="#6b6e80" stroke-width="3.6" stroke-linecap="round"/>
    ${starburst(40, 21, 12, 3, 13, ['#ffe08a', '#fff3dc', '#ff9f1c'])}
    <circle cx="40" cy="21" r="2.6" fill="#fffbe6"/>`,
  flowerpot: () => `
    <ellipse cx="32" cy="16" rx="20" ry="14" fill="url(#ck-glow)"/>
    <g stroke="#ffcf5a" stroke-width="2.2" fill="none" stroke-linecap="round">
      <path d="M32 29 Q24 12 13 18"/><path d="M32 29 Q40 12 51 18"/>
      <path d="M32 29 Q29 9 22 6"/><path d="M32 29 Q35 9 42 6"/><path d="M32 29 L32 3"/>
    </g>
    <g fill="#fff3dc"><circle cx="13" cy="19" r="1.8"/><circle cx="51" cy="19" r="1.8"/><circle cx="22" cy="6" r="1.8"/><circle cx="42" cy="6" r="1.8"/><circle cx="32" cy="3" r="1.8"/></g>
    <path d="M19 59 H45 L38 32 H26 Z" fill="#e8407a"/>
    <path d="M21.5 51 H42.5 M24 42 H40" stroke="#ffcf5a" stroke-width="3"/>
    <rect x="25" y="29" width="14" height="4.5" rx="1.6" fill="#ffcf5a"/>`,
  rocket: () => `
    <g transform="rotate(35 32 32)">
      <ellipse cx="32" cy="50" rx="7" ry="10" fill="url(#ck-glow)"/>
      <line x1="32" y1="42" x2="32" y2="63" stroke="#c9a46a" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M28 42 Q32 56 36 42 Z" fill="#ff9f1c"/>
      <path d="M26 37 L19 46 L26 43 Z M38 37 L45 46 L38 43 Z" fill="#1fb5a8"/>
      <rect x="26" y="14" width="12" height="29" rx="2.5" fill="#e8407a"/>
      <rect x="26" y="30" width="12" height="4" fill="#ffcf5a"/>
      <path d="M26 15 L32 3 L38 15 Z" fill="#ffcf5a"/>
    </g>`,
  bomb: () => `
    <circle cx="51" cy="12" r="10" fill="url(#ck-glow)"/>
    <circle cx="30" cy="39" r="18" fill="#c9924f"/>
    <path d="M13 35 Q30 26 47 35 M12 43 Q30 52 48 43 M21 23 Q16 39 21 55 M39 23 Q44 39 39 55" stroke="#8a5a2b" stroke-width="2.2" fill="none"/>
    <ellipse cx="23" cy="30" rx="5" ry="3" fill="#fff" opacity=".2"/>
    <path d="M39 23 Q44 14 50 13" stroke="#5a3a1a" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    ${starburst(51, 12, 8, 2, 8, ['#ffe08a', '#fff3dc'])}`,
};

export function cracker(level, { size, withDefs = false, cls = '' } = {}) {
  return svg('0 0 64 64', CRACKERS[level](), { withDefs, cls: `cracker ${cls}`, size });
}

// ── Laddoo ──────────────────────────────────────────────────────────────────────────────────────

export function laddoo({ spent = false, size = 18, withDefs = false } = {}) {
  const body = spent
    ? '<circle cx="12" cy="12.5" r="8.5" fill="none" stroke="rgba(255,243,220,.35)" stroke-width="1.4" stroke-dasharray="2 2.6"/>'
    : `<circle cx="12" cy="12.5" r="9" fill="url(#ck-laddoo)"/>
       <g fill="#d9771a" opacity=".75"><circle cx="8" cy="10" r="1.2"/><circle cx="14" cy="8" r="1.1"/><circle cx="16" cy="14" r="1.2"/><circle cx="10" cy="16" r="1.1"/><circle cx="12.5" cy="12" r="1"/></g>
       <g fill="#ffe2a0" opacity=".8"><circle cx="10.5" cy="7.5" r=".9"/><circle cx="7" cy="14" r=".8"/><circle cx="15" cy="17" r=".8"/></g>`;
  return svg('0 0 24 24', body, { withDefs, cls: `laddoo${spent ? ' is-spent' : ''}`, size });
}

// ── String lights ───────────────────────────────────────────────────────────────────────────────

/** Fairy lights strung in swags, each 80 wide, in a box 56 high. */
export function lights({ withDefs = false, swags = 5, stretch = false } = {}) {
  const span = 80;
  const width = swags * span;
  let wire = 'M0 4';
  let bulbs = '';
  let n = 0;
  for (let s = 0; s < swags; s++) {
    const x0 = s * span;
    const x1 = x0 + span;
    const cx = x0 + span / 2;
    wire += ` Q${cx} 44 ${x1} 4`;
    for (const t of [0.2, 0.4, 0.6, 0.8]) {
      const x = (1 - t) ** 2 * x0 + 2 * (1 - t) * t * cx + t ** 2 * x1;
      const y = (1 - t) ** 2 * 4 + 2 * (1 - t) * t * 44 + t ** 2 * 4;
      const color = BULB_COLORS[n % BULB_COLORS.length];
      const delay = ((n * 0.37) % 2.4).toFixed(2);
      bulbs += `<g class="bulb" style="animation-delay:-${delay}s">
        <circle cx="${x.toFixed(1)}" cy="${(y + 7).toFixed(1)}" r="9" fill="${color}" opacity=".28"/>
        <rect x="${(x - 1.6).toFixed(1)}" y="${(y - 1).toFixed(1)}" width="3.2" height="3" fill="#3b2a4a"/>
        <ellipse cx="${x.toFixed(1)}" cy="${(y + 6).toFixed(1)}" rx="3.2" ry="4.6" fill="${color}"/>
      </g>`;
      n += 1;
    }
  }
  const body = `<path d="${wire}" fill="none" stroke="#3b2a4a" stroke-width="1.4"/>${bulbs}`;
  const fit = stretch ? 'none' : 'xMidYMin meet';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} 56" preserveAspectRatio="${fit}" aria-hidden="true">${defsBlock(withDefs)}${body}</svg>`;
}
