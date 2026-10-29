// The chakri wheel: everyone's names round the rim and the chakri spinning in the middle. Swipe the
// chakri (or tap Spin) to spin it. The game decides fairly who it lands on before it starts; the
// animation only gets it there, slowing down the way a real chakri does.
import { chakriBody } from './art.js';
import { html, raw } from './html.js';
import { sparks } from './fx.js';
import * as sound from './sound.js';

const VIEW = 320;
const NAME_RADIUS = 128;
const TIP_RADIUS = 92;
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

const mod = (a, n) => ((a % n) + n) % n;
const easeOut = (p) => 1 - (1 - p) ** 3;

function shortName(name, max) {
  return name.length > max ? `${name.slice(0, max - 1)}…` : name;
}

/** The wheel's SVG. `angle` is where the pointer points, in degrees clockwise from the top. */
export function wheelView(names, { highlight = -1, angle = 0, label = '', spinnable = false } = {}) {
  const n = names.length;
  const slot = 360 / n;
  const size = n > 8 ? 11 : n > 5 ? 13 : 15;
  const max = n > 8 ? 7 : n > 5 ? 9 : 12;

  const separators = names.map((_, i) => {
    const a = ((i + 0.5) * slot * Math.PI) / 180;
    const [s, c] = [Math.sin(a), -Math.cos(a)];
    return `<line x1="${(s * 104).toFixed(1)}" y1="${(c * 104).toFixed(1)}" x2="${(s * 150).toFixed(1)}" y2="${(c * 150).toFixed(1)}"/>`;
  }).join('');

  const labels = names.map((name, i) => {
    const a = (i * slot * Math.PI) / 180;
    const x = Math.sin(a) * NAME_RADIUS;
    const y = -Math.cos(a) * NAME_RADIUS;
    const text = shortName(name, max);
    const width = Math.max(40, text.length * size * 0.6 + 20);
    return html`<g class="wheel-name${i === highlight ? ' is-up' : ''}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})">
      <rect x="${(-width / 2).toFixed(1)}" y="${-size}" width="${width.toFixed(1)}" height="${size * 2}" rx="${size}"/>
      <text y="${(size * 0.36).toFixed(1)}" font-size="${size}" text-anchor="middle">${text}</text>
    </g>`;
  });

  return html`<svg class="wheel${spinnable ? ' is-spinnable' : ''}" viewBox="${-VIEW / 2} ${-VIEW / 2} ${VIEW} ${VIEW}" role="img" aria-label="${label}">
    <circle r="152" class="wheel-rim"/>
    <circle r="103" class="wheel-bed"/>
    <g class="wheel-seps">${raw(separators)}</g>
    ${labels}
    <g class="rotor" style="transform: rotate(${angle.toFixed(2)}deg)">${raw(chakriBody())}</g>
  </svg>`;
}

/**
 * Makes a rendered wheel spinnable. `choose()` returns the player index to land on; it's called when a
 * spin starts. The wheel reports its angle through `onAngle` so the next render can start from it.
 */
export class Wheel {
  constructor(svg, { count, angle = 0, choose, onStart, onEnd, onAngle }) {
    this.svg = svg;
    this.rotor = svg.querySelector('.rotor');
    this.count = count;
    this.angle = angle;
    this.choose = choose;
    this.onStart = onStart;
    this.onEnd = onEnd;
    this.onAngle = onAngle;
    this.spinning = false;
    this.enabled = true;
    this.frame = 0;
    this.drag = null;

    this.handleDown = (e) => this.down(e);
    this.handleMove = (e) => this.move(e);
    this.handleUp = (e) => this.up(e);
    svg.addEventListener('pointerdown', this.handleDown);
    svg.addEventListener('pointermove', this.handleMove);
    svg.addEventListener('pointerup', this.handleUp);
    svg.addEventListener('pointercancel', this.handleUp);
  }

  destroy() {
    cancelAnimationFrame(this.frame);
    this.svg.removeEventListener('pointerdown', this.handleDown);
    this.svg.removeEventListener('pointermove', this.handleMove);
    this.svg.removeEventListener('pointerup', this.handleUp);
    this.svg.removeEventListener('pointercancel', this.handleUp);
  }

  setAngle(angle) {
    this.angle = angle;
    this.rotor.style.transform = `rotate(${angle.toFixed(2)}deg)`;
    this.onAngle?.(angle);
  }

  pointerAngle(e) {
    const rect = this.svg.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    return (Math.atan2(dx, -dy) * 180) / Math.PI;
  }

  down(e) {
    if (this.spinning || !this.enabled) return;
    this.svg.setPointerCapture?.(e.pointerId);
    const a = this.pointerAngle(e);
    this.drag = { last: a, moved: 0, samples: [{ t: e.timeStamp, angle: this.angle }] };
  }

  move(e) {
    if (!this.drag) return;
    const a = this.pointerAngle(e);
    const delta = mod(a - this.drag.last + 180, 360) - 180;
    this.drag.last = a;
    this.drag.moved += delta;
    this.setAngle(this.angle + delta);
    this.drag.samples.push({ t: e.timeStamp, angle: this.angle });
    if (this.drag.samples.length > 8) this.drag.samples.shift();
  }

  up(e) {
    if (!this.drag) return;
    const { samples, moved } = this.drag;
    this.drag = null;
    const recent = samples.filter((s) => e.timeStamp - s.t < 120);
    let velocity = 0;
    if (recent.length >= 2) {
      const first = recent[0];
      const last = recent[recent.length - 1];
      velocity = (last.angle - first.angle) / Math.max(16, last.t - first.t);
    }
    // A tap, a slow drag and a fling all spin it; a fling just spins it harder.
    const direction = Math.sign(velocity) || Math.sign(moved) || 1;
    this.spin(direction * Math.max(Math.abs(velocity), 0.7));
  }

  /** Spins at `velocity` degrees per millisecond (negative is anticlockwise). */
  spin(velocity = 0.9) {
    if (this.spinning || !this.enabled) return;
    const target = this.choose();
    if (target < 0) return;
    this.spinning = true;

    const slot = 360 / this.count;
    const speed = Math.min(Math.abs(velocity), 3);
    const direction = Math.sign(velocity) || 1;
    const base = target * slot + (Math.random() - 0.5) * slot * 0.6;
    const turns = reduced.matches ? 1 : Math.round(3 + speed * 1.6);
    const duration = reduced.matches ? 1400 : Math.min(5200, 2700 + speed * 850);
    const start = this.angle;
    const delta = direction > 0
      ? mod(base - start, 360) + 360 * turns
      : -(mod(start - base, 360) + 360 * turns);

    const slotOf = (angle) => Math.floor(mod(angle + slot / 2, 360) / slot) % this.count;
    let lastSlot = slotOf(start);
    const began = performance.now();
    this.onStart?.(target);
    sound.crackle(duration / 1000);

    const step = (now) => {
      const p = Math.min(1, (now - began) / duration);
      const angle = start + delta * easeOut(p);
      this.setAngle(angle);

      const current = slotOf(angle);
      if (current !== lastSlot) {
        lastSlot = current;
        sound.tick();
      }
      // Degrees per millisecond right now, for how hard the fuse sprays.
      const rate = (Math.abs(delta) * 3 * (1 - p) ** 2) / duration;
      this.spray(angle, direction, Math.min(5, Math.round(rate * 2.5)));

      if (p < 1) {
        this.frame = requestAnimationFrame(step);
      } else {
        this.spinning = false;
        sound.land();
        sound.buzz(30);
        this.onEnd?.(target);
      }
    };
    this.frame = requestAnimationFrame(step);
  }

  /** Sparks from the pointer's tip, flying back against the spin and a little outward. */
  spray(angle, direction, count) {
    if (count <= 0) return;
    const rect = this.svg.getBoundingClientRect();
    const scale = rect.width / VIEW;
    const a = (angle * Math.PI) / 180;
    const out = [Math.sin(a), -Math.cos(a)];
    const along = [Math.cos(a) * direction, Math.sin(a) * direction];
    const x = rect.left + rect.width / 2 + out[0] * TIP_RADIUS * scale;
    const y = rect.top + rect.height / 2 + out[1] * TIP_RADIUS * scale;
    const dx = -along[0] * 0.75 + out[0] * 0.35;
    const dy = -along[1] * 0.75 + out[1] * 0.35;
    const len = Math.hypot(dx, dy) || 1;
    sparks(x, y, dx / len, dy / len, count);
  }
}
