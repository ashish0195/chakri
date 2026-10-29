// Moving between screens. The modes register their screens and actions here; the shell (app.js)
// draws whichever screen is current.
//
// A screen is { view(): html, mount?(element): cleanup?, inGame?: boolean }. Actions are called from
// elements with data-action="name"; inputs report through "model:<name>" and forms through
// "form:<name>".

const screens = {};
const actions = {};
let current = 'home';
let draw = () => {};

export function register({ screens: newScreens = {}, actions: newActions = {} }) {
  Object.assign(screens, newScreens);
  Object.assign(actions, newActions);
}

export function onDraw(fn) {
  draw = fn;
}

export function go(name) {
  current = name;
  draw();
}

export function redraw() {
  draw();
}

export function currentName() {
  return current;
}

export function screenOf(name = current) {
  return screens[name];
}

export function action(name) {
  return actions[name];
}

/** Says something to screen readers. */
export function announce(text) {
  const live = document.getElementById('live');
  if (!live) return;
  live.textContent = '';
  requestAnimationFrame(() => {
    live.textContent = text;
  });
}
