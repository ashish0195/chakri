// Every sound in Chakri is synthesized with Web Audio; nothing is sampled. The audio context starts on
// the first tap (browsers require that), and the on/off choice is remembered on this phone.
// Vibration follows the same switch.
import { load, save } from './store.js';

let ctx = null;
let out = null;
let noise = null;
let on = load('sound', true) !== false;

function audio() {
  if (!on) return null;
  if (!ctx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    ctx = new Ctx();
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -12;
    limiter.ratio.value = 6;
    out = ctx.createGain();
    out.gain.value = 0.8;
    out.connect(limiter);
    limiter.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function unlock() {
  audio();
}

export function isOn() {
  return on;
}

export function setOn(value) {
  on = value;
  save('sound', value);
  if (value) audio();
}

export function buzz(pattern) {
  if (!on) return;
  try {
    navigator.vibrate?.(pattern);
  } catch {
    // Not every browser lets a page vibrate.
  }
}

function noiseBuffer(c) {
  if (!noise) {
    noise = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  return noise;
}

/** One oscillator with a fast attack and an exponential decay. */
function tone(c, { freq, to, start = 0, dur = 0.2, type = 'sine', gain = 0.2, attack = 0.005 }) {
  const t0 = c.currentTime + start;
  const osc = c.createOscillator();
  const env = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, t0 + dur);
  env.gain.setValueAtTime(0.0001, t0);
  env.gain.exponentialRampToValueAtTime(gain, t0 + attack);
  env.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(env);
  env.connect(out);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

/** A struck bell: a few inharmonic partials, the high ones dying first. */
function bell(c, freq, start = 0, gain = 0.16, dur = 1.2) {
  const partials = [[1, 1], [2.76, 0.32], [5.4, 0.14], [8.93, 0.05]];
  partials.forEach(([ratio, level], i) => {
    tone(c, { freq: freq * ratio, start, dur: dur / (1 + i * 0.7), gain: gain * level, attack: 0.002 });
  });
}

/** A burst of filtered noise. */
function hiss(c, { start = 0, dur = 0.3, gain = 0.2, type = 'bandpass', freq = 2000, to, q = 1 }) {
  const t0 = c.currentTime + start;
  const src = c.createBufferSource();
  src.buffer = noiseBuffer(c);
  src.loop = true;
  const filter = c.createBiquadFilter();
  filter.type = type;
  filter.Q.value = q;
  filter.frequency.setValueAtTime(freq, t0);
  if (to) filter.frequency.exponentialRampToValueAtTime(to, t0 + dur);
  const env = c.createGain();
  env.gain.setValueAtTime(0.0001, t0);
  env.gain.exponentialRampToValueAtTime(gain, t0 + Math.min(0.01, dur / 3));
  env.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(filter);
  filter.connect(env);
  env.connect(out);
  src.start(t0, Math.random() * 0.5);
  src.stop(t0 + dur + 0.05);
}

/** A soft click for buttons. */
export function tap() {
  const c = audio();
  if (c) tone(c, { freq: 520, to: 700, dur: 0.06, type: 'triangle', gain: 0.045 });
}

/** The chakri's pointer passing a name. */
export function tick() {
  const c = audio();
  if (c) tone(c, { freq: 2300, dur: 0.025, type: 'square', gain: 0.02 });
}

/** A diya lighting up: two bells, a fifth apart. */
export function chime() {
  const c = audio();
  if (!c) return;
  bell(c, 1318.5);
  bell(c, 1975.5, 0.11);
}

/** A wrong guess: a gentle falling bloop. */
export function miss() {
  const c = audio();
  if (c) tone(c, { freq: 330, to: 170, dur: 0.34, gain: 0.13 });
}

/** A firework: a thump, a lowpassed burst and a crackling tail. */
export function pop() {
  const c = audio();
  if (!c) return;
  tone(c, { freq: 130, to: 38, dur: 0.28, gain: 0.32 });
  hiss(c, { dur: 0.55, gain: 0.22, type: 'lowpass', freq: 5000, to: 260, q: 0.7 });
  for (let i = 0; i < 12; i++) {
    hiss(c, { start: 0.22 + Math.random() * 0.8, dur: 0.025, gain: 0.05 + Math.random() * 0.08, type: 'highpass', freq: 2500 + Math.random() * 3000 });
  }
}

/** The chakri fizzing and crackling while it spins: dense at first, thinning out as it slows. */
export function crackle(seconds) {
  const c = audio();
  if (!c) return;
  hiss(c, { dur: seconds, gain: 0.05, freq: 5200, to: 2600, q: 0.8 });
  const grains = Math.round(seconds * 28);
  for (let i = 0; i < grains; i++) {
    const at = seconds * (i / grains) ** 2;
    hiss(c, { start: at, dur: 0.02 + Math.random() * 0.02, gain: 0.03 + Math.random() * 0.07, type: 'highpass', freq: 3000 + Math.random() * 4000 });
  }
}

/** A card flipping over. */
export function whoosh() {
  const c = audio();
  if (c) hiss(c, { dur: 0.32, gain: 0.1, freq: 500, to: 3200, q: 2.2 });
}

/** The chakri stopping on someone. */
export function land() {
  const c = audio();
  if (!c) return;
  tone(c, { freq: 180, to: 90, dur: 0.18, gain: 0.18 });
  bell(c, 880, 0.04, 0.13, 0.9);
}

/** A result: a rising pentatonic run of bells. */
export function fanfare() {
  const c = audio();
  if (!c) return;
  [523.25, 587.33, 659.25, 783.99, 880, 1046.5].forEach((freq, i) => bell(c, freq, i * 0.09, 0.11, 1.5));
}
