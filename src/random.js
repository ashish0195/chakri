// Randomness helpers. Every function takes the random source as an argument, so tests can seed it.

/** A small seeded generator (mulberry32), for tests and anything that must repeat. */
export function seeded(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A shuffled copy (Fisher–Yates). */
export function shuffle(items, rng = Math.random) {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** The index of one weight, picked in proportion to its size. Zero weights are never picked. */
export function pickWeighted(weights, rng = Math.random) {
  const total = weights.reduce((sum, w) => sum + w, 0);
  if (total <= 0) return -1;
  let r = rng() * total;
  for (let i = 0; i < weights.length; i++) {
    if (weights[i] <= 0) continue;
    r -= weights[i];
    if (r < 0) return i;
  }
  return weights.findLastIndex((w) => w > 0);
}
