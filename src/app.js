// Chakri: boots the page, draws the top bar and the current screen, and runs the shared controls
// (language, sound, home, and the phone's back button). The two modes live in play-jodi.js and
// play-tod.js and register their screens with nav.js.
import { html, markup, raw } from './html.js';
import { t, getLang, setLang, applyLang } from './i18n.js';
import { DEFS, chakri, cracker, lights, rangoli } from './art.js';
import { ICON } from './icons.js';
import * as sound from './sound.js';
import { burst, initFx } from './fx.js';
import { action, announce, currentName, go, onDraw, register, screenOf } from './nav.js';
import { closeSheet, isSheetOpen, openConfirm } from './sheet.js';
import './play-jodi.js';
import './play-tod.js';

const root = document.getElementById('app');
const SAMPLE = ['lit', 'lit', 'out', 'lit', 'lit', 'lit', 'out', 'lit', 'lit', 'lit', 'todo', 'todo'];

function topbar(name) {
  const home = name === 'home';
  const lang = getLang();
  return html`<header class="topbar">
    <div class="tb-left">
      ${home ? '' : html`<button class="icon-btn" data-action="home" aria-label="${t('top.home')}">${raw(ICON.home)}</button>
        <span class="mini-mark" aria-hidden="true">${raw(chakri())}Chakri</span>`}
    </div>
    <div class="tb-right">
      <div class="seg" role="group" aria-label="${t('top.lang')}">
        <button data-action="lang" data-value="en" aria-pressed="${lang === 'en'}">EN</button>
        <button data-action="lang" data-value="hi" aria-pressed="${lang === 'hi'}">Hinglish</button>
      </div>
      <button class="icon-btn" data-action="sound" aria-pressed="${sound.isOn()}" aria-label="${t(sound.isOn() ? 'top.sound.on' : 'top.sound.off')}">${raw(sound.isOn() ? ICON.soundOn : ICON.soundOff)}</button>
    </div>
  </header>`;
}

register({
  screens: {
    home: {
      view: () => html`<section class="screen home">
        <div class="hero">
          <button class="hero-chakri" data-action="hero-spin" aria-label="${t('home.spin')}">${raw(chakri())}</button>
          <h1 class="wordmark">Chakri</h1>
          <p class="tagline">${t('tagline')}</p>
        </div>
        <div class="modes">
          <button class="mode-card mode-jodi" data-action="go" data-value="jodi-setup">
            <span class="mode-art">${raw(rangoli(SAMPLE))}</span>
            <span class="mode-text">
              <span class="mode-title">${t('home.jodi.title')}</span>
              <span class="mode-sub">${t('home.jodi.sub')}</span>
              <span class="mode-meta">${t('home.jodi.meta')}</span>
            </span>
          </button>
          <button class="mode-card mode-tod" data-action="go" data-value="tod-setup">
            <span class="mode-art crackers-art">${raw(cracker('rocket'))}${raw(cracker('sparkler'))}</span>
            <span class="mode-text">
              <span class="mode-title">${t('home.tod.title')}</span>
              <span class="mode-sub">${t('home.tod.sub')}</span>
              <span class="mode-meta">${t('home.tod.meta')}</span>
            </span>
          </button>
        </div>
        <footer class="home-foot">
          <p>${t('home.privacy')}</p>
          <p class="from">${t('home.from')}</p>
        </footer>
      </section>`,
    },
  },
  actions: {
    go: (el) => go(el.dataset.value),
    home: () => leave(),
    lang: (el) => {
      setLang(el.dataset.value);
      draw();
    },
    sound: () => {
      sound.setOn(!sound.isOn());
      draw();
    },
    'hero-spin': (el) => {
      el.classList.remove('whirl');
      void el.offsetWidth;
      el.classList.add('whirl');
      const rect = el.getBoundingClientRect();
      burst(rect.left + rect.width / 2, rect.top + rect.height / 2, { count: 60, speed: 5 });
      sound.crackle(1.4);
    },
  },
});

// ── Drawing ─────────────────────────────────────────────────────────────────────────────────────

let unmount = null;
let lastDrawn = null;

function draw() {
  unmount?.();
  unmount = null;
  const name = currentName();
  const screen = screenOf(name);
  // A redraw of the same screen (the next question, a reveal) doesn't fade the whole screen in again.
  const same = name === lastDrawn;
  root.innerHTML = markup(html`${topbar(name)}<div class="screen-wrap${same ? ' is-same' : ''}" data-screen="${name}">${screen.view()}</div>`);
  unmount = screen.mount?.(root.querySelector('.screen-wrap')) ?? null;

  if (!same) {
    lastDrawn = name;
    window.scrollTo(0, 0);
    const heading = root.querySelector('.screen-wrap h1');
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
    }
  }
  if (name !== 'home') guard();
  else unguard();
}

// ── Leaving a game, and the back button ─────────────────────────────────────────────────────────
// Away from home there's one extra history entry, so the phone's back button comes home (and asks
// before it throws a game away) instead of leaving the site.

let guarded = false;
let ignorePop = false;

function guard() {
  if (guarded) return;
  history.pushState({ chakri: true }, '');
  guarded = true;
}

function unguard() {
  if (!guarded) return;
  guarded = false;
  ignorePop = true;
  history.back();
}

function leave() {
  if (!screenOf().inGame) {
    go('home');
    return;
  }
  openConfirm({
    title: t('leave.title'),
    body: t('leave.body'),
    yes: t('leave.yes'),
    no: t('leave.no'),
    onYes: () => go('home'),
  });
}

window.addEventListener('popstate', () => {
  if (ignorePop) {
    ignorePop = false;
    return;
  }
  guarded = false;
  if (isSheetOpen()) {
    closeSheet();
    if (currentName() !== 'home') guard();
    return;
  }
  if (currentName() === 'home') return;
  if (screenOf().inGame) {
    guard();
    leave();
  } else {
    go('home');
  }
});

// ── Events ──────────────────────────────────────────────────────────────────────────────────────

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]');
  if (!el || el.disabled) return;
  const fn = action(el.dataset.action);
  if (!fn) return;
  sound.unlock();
  sound.tap();
  fn(el, e);
});

document.addEventListener('input', (e) => {
  const model = e.target.dataset?.model;
  if (model) action(`model:${model}`)?.(e.target.value, e.target);
});

document.addEventListener('submit', (e) => {
  const form = e.target.dataset?.form;
  if (!form) return;
  e.preventDefault();
  sound.unlock();
  action(`form:${form}`)?.(e.target);
});

// ── Boot ────────────────────────────────────────────────────────────────────────────────────────

function hangLights() {
  const swags = Math.max(4, Math.round(window.innerWidth / 92));
  document.querySelector('.lights').innerHTML = lights({ swags, stretch: true });
}

document.body.insertAdjacentHTML('afterbegin', `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>${DEFS}</defs></svg>`);
applyLang();
hangLights();
let lightsTimer = 0;
window.addEventListener('resize', () => {
  clearTimeout(lightsTimer);
  lightsTimer = setTimeout(hangLights, 150);
});
initFx(document.getElementById('fx'));
onDraw(draw);
draw();
announce(t('tagline'));
