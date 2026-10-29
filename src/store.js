// Per-device conveniences (language, sound, last names) in localStorage. Every access is guarded:
// private windows and blocked storage just fall back to the defaults. Nothing here leaves the phone.

const PREFIX = 'chakri.';

export function load(key, fallback) {
  try {
    const value = localStorage.getItem(PREFIX + key);
    return value === null ? fallback : JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Storage is a convenience; the game works without it.
  }
}
