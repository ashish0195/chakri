// Chakri Truth or Dare screens: setup, the wheel, the patakha pick, the card, and the night's result.
import { html, raw } from './html.js';
import { pick, t } from './i18n.js';
import { cracker, laddoo } from './art.js';
import { ICON } from './icons.js';
import { announce, go, redraw, register } from './nav.js';
import { load, save } from './store.js';
import * as sound from './sound.js';
import { burst, celebrate } from './fx.js';
import { Wheel, wheelView } from './wheel.js';
import { todCard } from './card.js';
import { openShare } from './sheet.js';
import { SITE_URL } from './config.js';
import {
  DECKS, LADDOOS, LEVELS, MAX_PLAYERS, MIN_PLAYERS,
  awards, createGame, deckAllowed, drawCard, finishTurn, land, level, pickOther, pickPlayer, standings,
} from './dares.js';

const DECK_EMOJI = { family: '🏡', friends: '🎉', couple: '💞', aunty: '👀' };
const MAX_NAME = 16;

const savedNames = load('tod.names', []);
const savedDecks = load('tod.decks', ['family', 'aunty']);

const s = {
  names: Array.isArray(savedNames) ? savedNames.map(String).slice(0, MAX_PLAYERS) : [],
  decks: Array.isArray(savedDecks) ? savedDecks.filter((d) => DECKS.includes(d)) : ['family'],
  draft: '',
  notice: '',
  focusDraft: false,
  game: null,
  phase: 'spin', // 'spin' → 'pick' once the chakri stops
  player: -1,
  levelId: null,
  card: null,
  other: -1,
  angle: 0,
  celebrated: false,
};

let wheel = null;

function laddoos(count, size = 16) {
  return raw(Array.from({ length: LADDOOS }, (_, i) => laddoo({ spent: i >= count, size })).join(''));
}

function playableDecks() {
  return s.decks.filter((deck) => deckAllowed(deck, s.names.length));
}

function saveSetup() {
  save('tod.names', s.names);
  save('tod.decks', s.decks);
}

function uniqueName(name) {
  const taken = new Set(s.names.map((n) => n.toLowerCase()));
  if (!taken.has(name.toLowerCase())) return name;
  let n = 2;
  while (taken.has(`${name} ${n}`.toLowerCase())) n += 1;
  return `${name} ${n}`;
}

function newGame() {
  s.game = createGame(s.names, playableDecks());
  s.phase = 'spin';
  s.player = -1;
  s.angle = 0;
  s.celebrated = false;
  go('tod-play');
}

function pointsLabel(points) {
  return points === 1 ? t('tod.result.point') : t('tod.result.points', { n: points });
}

function scoreboard() {
  return html`<div class="scoreboard">
    ${s.game.players.map((p, i) => html`<div class="score-chip${s.phase === 'pick' && i === s.player ? ' is-up' : ''}">
      <span class="sc-name">${p.name}</span>
      <span class="sc-points">${p.points}</span>
      <span class="sc-laddoos" role="img" aria-label="${t('tod.card.left', { n: p.laddoos })}">${laddoos(p.laddoos, 12)}</span>
    </div>`)}
  </div>`;
}

function pickSheet() {
  const player = s.game.players[s.player];
  return html`<div class="pick-sheet">
    <h2 class="pick-name">${t('tod.spin.landed', { name: player.name })}</h2>
    <p class="pick-title">${t('tod.pick.title')}</p>
    <div class="cracker-grid">
      ${LEVELS.map((l) => html`<button class="cracker-btn level-${l.id}" data-action="tod-level" data-value="${l.id}">
        <span class="cracker-art">${raw(cracker(l.id))}</span>
        <span class="cracker-name">${t(`level.${l.id}`)}</span>
        <span class="cracker-sub">${t(`level.${l.id}.sub`)}</span>
        <span class="cracker-points">${t('tod.points', { n: l.points })}</span>
      </button>`)}
    </div>
  </div>`;
}

function centreOf(el) {
  const rect = el.getBoundingClientRect();
  return [rect.left + rect.width / 2, rect.top + rect.height / 2];
}

function shareNight() {
  const table = standings(s.game);
  const top = table[0];
  openShare({
    filename: 'chakri-truth-or-dare.png',
    text: t('share.tod.text', { name: top.name, url: SITE_URL }),
    makeCard: () => todCard({
      winner: top.name,
      points: pointsLabel(top.points),
      table,
      awards: awards(s.game).map((a) => ({ title: t(`award.${a.id}`), sub: t(`award.${a.id}.sub`, { name: a.name }) })),
    }),
  });
}

register({
  screens: {
    'tod-setup': {
      view: () => {
        const count = s.names.length;
        const ready = count >= MIN_PLAYERS && playableDecks().length > 0;
        const notice = s.notice || (count < MIN_PLAYERS ? t('tod.setup.need') : '');
        return html`<section class="screen setup">
          <h1 class="screen-title">${t('tod.setup.title')}</h1>
          <form class="add-row" data-form="tod-add" autocomplete="off">
            <input class="field" data-model="tod-draft" maxlength="${MAX_NAME}" autocapitalize="words" enterkeyhint="done" placeholder="${t('tod.setup.placeholder')}" aria-label="${t('tod.setup.placeholder')}" value="${s.draft}">
            <button class="btn btn-ghost add-btn" type="submit">${t('tod.setup.add')}</button>
          </form>
          ${count ? html`<ul class="chips">${s.names.map((name, i) => html`<li class="chip"><span>${name}</span><button class="chip-x" data-action="tod-remove" data-value="${i}" aria-label="${t('tod.setup.remove', { name })}">×</button></li>`)}</ul>` : ''}
          ${notice ? html`<p class="notice">${notice}</p>` : ''}
          <h2 class="label">${t('tod.setup.decks')}</h2>
          <div class="deck-grid">
            ${DECKS.map((deck) => {
              const allowed = deckAllowed(deck, count);
              const on = s.decks.includes(deck) && allowed;
              const sub = deck === 'couple' && !allowed ? t('deck.couple.locked') : t(`deck.${deck}.sub`);
              return html`<button class="deck-chip${on ? ' is-on' : ''}" role="checkbox" aria-checked="${on}" data-action="tod-deck" data-value="${deck}" ${allowed ? '' : raw('disabled')}>
                <span class="type-emoji" aria-hidden="true">${DECK_EMOJI[deck]}</span>
                <span class="type-name">${t(`deck.${deck}`)}</span>
                <span class="type-sub">${sub}</span>
              </button>`;
            })}
          </div>
          <p class="rule"><span class="laddoo-row" aria-hidden="true">${laddoos(LADDOOS, 18)}</span>${t('tod.setup.laddoos')}</p>
          <button class="btn btn-primary btn-wide" data-action="tod-start" ${ready ? '' : raw('disabled')}>${t('tod.setup.start')}</button>
        </section>`;
      },
      mount: (el) => {
        if (s.focusDraft) {
          s.focusDraft = false;
          el.querySelector('[data-model="tod-draft"]')?.focus();
        }
        return null;
      },
    },

    'tod-play': {
      inGame: true,
      view: () => html`<section class="screen tod-play">
        <h1 class="sr-only">${t('tod.play.title')}</h1>
        ${scoreboard()}
        <div class="wheel-wrap">${wheelView(s.game.players.map((p) => p.name), {
          highlight: s.phase === 'pick' ? s.player : -1,
          angle: s.angle,
          label: t('tod.spin.hint'),
          spinnable: s.phase === 'spin',
        })}</div>
        ${s.phase === 'pick' ? pickSheet() : html`<div class="spin-controls">
          <p class="hint">${t('tod.spin.hint')}</p>
          <button class="btn btn-primary spin-btn" data-action="tod-spin">${t('tod.spin.button')}</button>
        </div>`}
        <button class="link-btn" data-action="tod-end">${t('tod.end')}</button>
      </section>`,
      mount: (el) => {
        if (s.phase !== 'spin') {
          el.querySelector('.pick-sheet')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          return null;
        }
        const controls = el.querySelector('.spin-controls');
        wheel = new Wheel(el.querySelector('.wheel'), {
          count: s.game.players.length,
          angle: s.angle,
          choose: () => pickPlayer(s.game),
          onAngle: (angle) => {
            s.angle = angle;
          },
          onStart: () => {
            controls.classList.add('is-spinning');
            controls.querySelector('button').disabled = true;
          },
          onEnd: (index) => {
            land(s.game, index);
            s.player = index;
            s.angle = ((s.angle % 360) + 360) % 360;
            s.phase = 'pick';
            redraw();
            const name = document.querySelector('.wheel-name.is-up');
            if (name) {
              const [x, y] = centreOf(name);
              burst(x, y, { count: 40, speed: 3, life: 50 });
            }
            announce(t('tod.spin.landed', { name: s.game.players[index].name }));
          },
        });
        return () => {
          wheel?.destroy();
          wheel = null;
        };
      },
    },

    'tod-card': {
      inGame: true,
      view: () => {
        const player = s.game.players[s.player];
        const lvl = level(s.levelId);
        const other = s.game.players[s.other]?.name ?? '';
        const text = s.card ? pick(s.card, { name: player.name, other }) : '…';
        return html`<section class="screen tod-card">
          <article class="dare-card level-${lvl.id}">
            <header class="dare-head">
              <span class="dare-art">${raw(cracker(lvl.id))}</span>
              <span class="dare-meta">
                <span class="dare-level">${t(`level.${lvl.id}`)} · ${t(`level.${lvl.id}.sub`)}</span>
                <span class="dare-who">${t(lvl.kind === 'dare' ? 'tod.card.dare' : 'tod.card.truth', { name: player.name })}</span>
              </span>
              <span class="dare-points">${t('tod.points', { n: lvl.points })}</span>
            </header>
            <h1 class="dare-text">${text}</h1>
          </article>
          <button class="btn btn-primary btn-wide" data-action="tod-done">${t('tod.card.done', { n: lvl.points })}</button>
          ${player.laddoos > 0
            ? html`<button class="btn btn-ghost btn-wide skip-btn" data-action="tod-skip"><span>${t('tod.card.skip')}</span><span class="laddoo-row">${laddoos(player.laddoos)}<span class="left">${t('tod.card.left', { n: player.laddoos })}</span></span></button>`
            : html`<p class="broke">${t('tod.card.broke')}</p>`}
        </section>`;
      },
    },

    'tod-result': {
      view: () => {
        const table = standings(s.game);
        const played = s.game.players.some((p) => p.turns > 0);
        const top = table[0];
        const list = awards(s.game);
        return html`<section class="screen result tod-result">
          <p class="kicker">${t('tod.result.kicker')}</p>
          ${played
            ? html`<div class="winner-art" aria-hidden="true">${raw(cracker('bomb'))}</div><h1 class="winner">${top.name}</h1><p class="winner-points">${pointsLabel(top.points)}</p>`
            : html`<h1 class="winner is-empty">${t('tod.result.none')}</h1>`}
          <ol class="card standings">
            ${table.map((p, i) => html`<li>
              <span class="rank">${i + 1}</span>
              <span class="st-name">${p.name}</span>
              <span class="laddoo-row" role="img" aria-label="${t('tod.card.left', { n: p.laddoos })}">${laddoos(p.laddoos, 14)}</span>
              <span class="st-points">${p.points}</span>
            </li>`)}
          </ol>
          ${list.length ? html`<ul class="awards">${list.map((a) => html`<li class="award">
            <span class="award-title">${t(`award.${a.id}`)}</span>
            <span class="award-sub">${t(`award.${a.id}.sub`, { name: a.name })}</span>
          </li>`)}</ul>` : ''}
          ${played ? html`<button class="btn btn-primary btn-wide" data-action="tod-share">${raw(ICON.share)} ${t('tod.result.share')}</button>` : ''}
          <div class="row-btns">
            <button class="btn btn-ghost" data-action="tod-resume">${t('tod.result.resume')}</button>
            <button class="btn btn-ghost" data-action="tod-again">${t('tod.result.again')}</button>
          </div>
          <button class="link-btn" data-action="tod-new">${t('tod.result.new')}</button>
        </section>`;
      },
      mount: () => {
        if (s.celebrated || !s.game.players.some((p) => p.turns > 0)) return null;
        s.celebrated = true;
        const timer = setTimeout(() => {
          sound.fanfare();
          celebrate(3, sound.pop);
        }, 250);
        return () => clearTimeout(timer);
      },
    },
  },

  actions: {
    'model:tod-draft': (value) => {
      s.draft = value;
    },
    'form:tod-add': () => {
      const name = s.draft.trim().slice(0, MAX_NAME);
      s.focusDraft = true;
      if (!name) {
        redraw();
        return;
      }
      if (s.names.length >= MAX_PLAYERS) {
        s.notice = t('tod.setup.full');
        redraw();
        return;
      }
      s.names.push(uniqueName(name));
      s.draft = '';
      s.notice = '';
      saveSetup();
      redraw();
    },
    'tod-remove': (el) => {
      s.names.splice(Number(el.dataset.value), 1);
      s.notice = '';
      saveSetup();
      redraw();
    },
    'tod-deck': (el) => {
      const deck = el.dataset.value;
      s.decks = s.decks.includes(deck) ? s.decks.filter((d) => d !== deck) : [...s.decks, deck];
      saveSetup();
      redraw();
    },
    'tod-start': () => {
      if (s.names.length < MIN_PLAYERS || !playableDecks().length) return;
      newGame();
    },
    'tod-spin': () => wheel?.spin(0.9 + Math.random() * 0.7),
    'tod-level': (el) => {
      s.levelId = el.dataset.value;
      s.card = drawCard(s.game, s.levelId);
      s.other = pickOther(s.game, s.player);
      sound.whoosh();
      go('tod-card');
    },
    'tod-done': (el) => {
      const [x, y] = centreOf(el);
      finishTurn(s.game, s.player, s.levelId, 'done');
      sound.chime();
      burst(x, y, { count: 50, speed: 3.6, life: 55 });
      s.phase = 'spin';
      go('tod-play');
    },
    'tod-skip': () => {
      if (!finishTurn(s.game, s.player, s.levelId, 'skip')) return;
      sound.miss();
      s.phase = 'spin';
      go('tod-play');
    },
    'tod-end': () => go('tod-result'),
    'tod-resume': () => {
      s.phase = 'spin';
      go('tod-play');
    },
    'tod-again': () => newGame(),
    'tod-share': () => shareNight(),
    'tod-new': () => go('tod-setup'),
  },
});
