// Fireworks and sparks, drawn on one canvas over the whole page. The loop only runs while something
// is still burning, and people who ask for reduced motion get a few sparks instead of a show.

const COLORS = ['#ffcf5a', '#ff9f1c', '#e8407a', '#1fb5a8', '#fff3dc', '#b78cff'];
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

let canvas = null;
let ctx = null;
let dpr = 1;
let particles = [];
let running = false;

export function initFx(element) {
  canvas = element;
  ctx = canvas.getContext('2d');
  resize();
  window.addEventListener('resize', resize);
}

function resize() {
  if (!canvas) return;
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(window.innerWidth * dpr);
  canvas.height = Math.round(window.innerHeight * dpr);
}

function add(particle) {
  particles.push(particle);
  if (!running) {
    running = true;
    requestAnimationFrame(frame);
  }
}

/** A round burst of sparks at (x, y), in page pixels. */
export function burst(x, y, { count = 80, speed = 4.4, colors = COLORS, life = 75, gravity = 0.055 } = {}) {
  if (!ctx) return;
  const n = reduced.matches ? Math.round(count / 5) : count;
  const tint = colors[Math.floor(Math.random() * colors.length)];
  for (let i = 0; i < n; i++) {
    const angle = Math.random() * Math.PI * 2;
    const v = speed * (0.35 + Math.random() * 0.75);
    add({
      x, y,
      vx: Math.cos(angle) * v,
      vy: Math.sin(angle) * v,
      life: life * (0.6 + Math.random() * 0.5),
      age: 0,
      color: Math.random() < 0.7 ? tint : colors[Math.floor(Math.random() * colors.length)],
      size: 1.4 + Math.random() * 1.6,
      gravity,
      drag: 0.965,
    });
  }
}

/** A short jet of sparks from (x, y) heading along (dx, dy), like the chakri's fuse. */
export function sparks(x, y, dx, dy, count = 3) {
  if (!ctx || reduced.matches) return;
  for (let i = 0; i < count; i++) {
    const spread = (Math.random() - 0.5) * 0.9;
    const cos = Math.cos(spread);
    const sin = Math.sin(spread);
    const v = 2.2 + Math.random() * 3.2;
    add({
      x, y,
      vx: (dx * cos - dy * sin) * v,
      vy: (dx * sin + dy * cos) * v,
      life: 18 + Math.random() * 20,
      age: 0,
      color: Math.random() < 0.6 ? '#ffd76a' : Math.random() < 0.5 ? '#fff3dc' : '#ff9f1c',
      size: 1 + Math.random() * 1.4,
      gravity: 0.08,
      drag: 0.93,
    });
  }
}

/** A few bursts across the top of the screen, one after another. */
export function celebrate(times = 5, onPop) {
  const shows = reduced.matches ? 1 : times;
  for (let i = 0; i < shows; i++) {
    setTimeout(() => {
      const x = window.innerWidth * (0.15 + Math.random() * 0.7);
      const y = window.innerHeight * (0.12 + Math.random() * 0.3);
      burst(x, y, { count: 90 + Math.random() * 50 });
      onPop?.();
    }, i * 420 + Math.random() * 160);
  }
}

function frame() {
  const w = canvas.width;
  const h = canvas.height;
  ctx.globalCompositeOperation = 'source-over';
  ctx.clearRect(0, 0, w, h);
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';

  particles = particles.filter((p) => p.age < p.life);
  for (const p of particles) {
    const px = p.x;
    const py = p.y;
    p.vx *= p.drag;
    p.vy = p.vy * p.drag + p.gravity;
    p.x += p.vx;
    p.y += p.vy;
    p.age += 1;
    const fade = 1 - p.age / p.life;
    ctx.globalAlpha = Math.max(0, fade);
    ctx.strokeStyle = p.color;
    ctx.lineWidth = p.size * dpr;
    ctx.beginPath();
    ctx.moveTo((px - p.vx * 1.5) * dpr, (py - p.vy * 1.5) * dpr);
    ctx.lineTo(p.x * dpr, p.y * dpr);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  if (particles.length) {
    requestAnimationFrame(frame);
  } else {
    ctx.clearRect(0, 0, w, h);
    running = false;
  }
}
