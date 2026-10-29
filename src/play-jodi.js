// Jodi Check screens: setup, the hand-offs, answering in secret, guessing with the reveal, halfway,
// and the result with its rangoli.
import { html, raw } from './html.js';
import { pick, t } from './i18n.js';
import { diya, rangoli } from './art.js';
import { ICON } from './icons.js';
import { announce, currentName, go, redraw, register } from './nav.js';
import { load, save } from './store.js';
import * as sound from './sound.js';
import { burst, celebrate } from './fx.js';
import { jodiCard } from './card.js';
import { openShare } from './sheet.js';
import { SITE_URL } from './config.js';
import {
  JODI_TYPES, PER_ROUND, bragger, createGame, isMatch, questionIds, rangoliStates, roundScore, titleFor, totalScore,
} from './jodi.js';

const EMOJI = { couple: '💞', siblings: '🧑‍🤝‍🧑', friends: '🫶', family: '🏡' };
const RECENT_MAX = 48;
const MAX_NAME = 16;

const savedType = load('jodi.type', 'couple');
const savedNames = load('jodi.names', ['', '']);

const s = {
  type: JODI_TYPES.includes(savedType) ? savedType : 'couple',
  names: Array.isArray(savedNames) && savedNames.length === 2 ? savedNames.map(String) : ['', ''],
  game: null,
  round: 0,
  index: 0,
  phase: 'choose', // while guessing: 'choose' → 'thinking' → 'revealed'
  busy: false,
  celebrated: false,
};

const round = () => s.game.rounds[s.round];
const subject = () => s.game.names[round().subject];
const guesser = () => s.game.names[round().guesser];
const question = () => round().questions[s.index];
const slotIndex = () => s.round * PER_ROUND + s.index;

function progress() {
  return html`<div class="progress" aria-hidden="true">${round().questions.map((_, i) =>
    html`<i class="${i < s.index ? 'done' : i === s.index ? 'now' : ''}"></i>`)}</div>`;
}

function startGame() {
  const names = s.names.map((name, i) => name.trim().slice(0, MAX_NAME) || t(i ? 'jodi.player2' : 'jodi.player1'));
  save('jodi.type', s.type);
  save('jodi.names', s.names.map((name) => name.trim()));
  s.game = createGame(s.type, names, { recent: new Set(load('jodi.recent', [])) });
  s.round = 0;
  s.index = 0;
  s.phase = 'choose';
  s.celebrated = false;
  go('jodi-handoff');
}

function rememberQuestions() {
  const played = questionIds(s.game);
  const before = load('jodi.recent', []);
  save('jodi.recent', [...played, ...before.filter((id) => !played.includes(id))].slice(0, RECENT_MAX));
}

function revealEffects() {
  const r = round();
  if (isMatch(r, s.index)) {
    sound.chime();
    sound.buzz([15, 40, 15]);
    const slot = document.querySelector('.mini .slot-pop.is-fresh');
    if (slot) {
      const rect = slot.getBoundingClientRect();
      burst(rect.left + rect.width / 2, rect.top + rect.height / 2, { count: 46, speed: 3.4, life: 55 });
    }
    announce(t('jodi.reveal.match'));
  } else {
    sound.miss();
    announce(`${t('jodi.reveal.miss', { name: subject() })} ${pick(question().options[r.answers[s.index]])}`);
  }
}

function shareResult() {
  const g = s.game;
  const score = totalScore(g);
  const band = titleFor(score);
  const rows = g.rounds.map((r) => ({
    label: t('jodi.result.knows', { guesser: g.names[r.guesser], subject: g.names[r.subject] }),
    score: roundScore(r),
  }));
  openShare({
    filename: 'chakri-jodi-check.png',
    text: t('share.jodi.text', { a: g.names[0], b: g.names[1], score, title: pick(band.title), url: SITE_URL }),
    makeCard: () => jodiCard({
      names: g.names, score, title: pick(band.title), line: pick(band.line), rows, states: rangoliStates(g),
    }),
  });
}

register({
  screens: {
    'jodi-setup': {
      view: () => html`<section class="screen setup">
        <h1 class="screen-title">${t('jodi.setup.title')}</h1>
        <h2 class="label">${t('jodi.setup.type')}</h2>
        <div class="type-grid" role="radiogroup" aria-label="${t('jodi.setup.type')}">
          ${JODI_TYPES.map((type) => html`<button class="type-chip${s.type === type ? ' is-on' : ''}" role="radio" aria-checked="${s.type === type}" data-action="jodi-type" data-value="${type}">
            <span class="type-emoji" aria-hidden="true">${EMOJI[type]}</span>
            <span class="type-name">${t(`jodi.type.${type}`)}</span>
            <span class="type-sub">${t(`jodi.type.${type}.sub`)}</span>
          </button>`)}
        </div>
        <h2 class="label">${t('jodi.setup.names')}</h2>
        <div class="names">
          <input class="field" data-model="jodi-name-0" maxlength="${MAX_NAME}" autocomplete="off" autocapitalize="words" enterkeyhint="next" placeholder="${t('jodi.setup.name1')}" aria-label="${t('jodi.setup.name1')}" value="${s.names[0]}">
          <span class="amp" aria-hidden="true">&amp;</span>
          <input class="field" data-model="jodi-name-1" maxlength="${MAX_NAME}" autocomplete="off" autocapitalize="words" enterkeyhint="done" placeholder="${t('jodi.setup.name2')}" aria-label="${t('jodi.setup.name2')}" value="${s.names[1]}">
        </div>
        <div class="card how">
          <h2 class="label">${t('jodi.setup.how')}</h2>
          <ol class="steps">
            ${['jodi.setup.step1', 'jodi.setup.step2', 'jodi.setup.step3'].map((key, i) =>
              html`<li>${raw(diya({ lit: i > 0 }))}<span>${t(key)}</span></li>`)}
          </ol>
        </div>
        <button class="btn btn-primary btn-wide" data-action="jodi-start">${t('jodi.setup.start')}</button>
      </section>`,
    },

    'jodi-handoff': {
      inGame: true,
      view: () => html`<section class="screen handoff">
        <div class="handoff-emoji" aria-hidden="true">🙈</div>
        <h1>${t('jodi.handoff.title', { name: subject() })}</h1>
        <p>${t('jodi.handoff.peek', { name: guesser() })}</p>
        <button class="btn btn-primary btn-wide" data-action="jodi-answering">${t('jodi.handoff.go', { name: subject() })}</button>
      </section>`,
    },

    'jodi-answer': {
      inGame: true,
      view: () => html`<section class="screen play is-choose">
        ${progress()}
        <p class="kicker">${t('jodi.answer.kicker', { n: s.index + 1 })}</p>
        <h1 class="question">${pick(question().you)}</h1>
        <p class="hint">${t('jodi.answer.hint', { name: guesser() })}</p>
        <div class="options">
          ${question().options.map((option, i) => html`<button class="option" data-action="jodi-answer" data-value="${i}">${pick(option)}</button>`)}
        </div>
        ${s.index > 0 ? html`<button class="link-btn" data-action="jodi-undo">${t('jodi.answer.undo')}</button>` : ''}
      </section>`,
    },

    'jodi-pass': {
      inGame: true,
      view: () => html`<section class="screen handoff">
        <div class="handoff-emoji" aria-hidden="true">🤝</div>
        <h1>${t('jodi.pass.title', { name: guesser() })}</h1>
        <p>${t('jodi.pass.watch', { name: subject() })}</p>
        <button class="btn btn-primary btn-wide" data-action="jodi-guessing">${t('jodi.pass.go', { name: guesser() })}</button>
      </section>`,
    },

    'jodi-guess': {
      inGame: true,
      view: () => {
        const r = round();
        const q = question();
        const revealed = s.phase === 'revealed';
        const guess = r.guesses[s.index];
        const answer = r.answers[s.index];
        const states = rangoliStates(s.game, revealed ? null : { round: s.round, index: s.index });
        const match = revealed && isMatch(r, s.index);
        const last = s.index === PER_ROUND - 1;
        return html`<section class="screen play is-${s.phase}">
          <div class="mini">${raw(rangoli(states, { fresh: match ? slotIndex() : -1 }))}</div>
          <p class="kicker">${t('jodi.guess.kicker', { name: guesser(), n: s.index + 1 })}</p>
          <h1 class="question">${pick(q.they, { name: subject() })}</h1>
          ${revealed ? '' : html`<p class="hint">${t('jodi.guess.hint', { name: subject() })}</p>`}
          <div class="options">
            ${q.options.map((option, i) => {
              let cls = 'option';
              let tag = '';
              if (s.phase === 'thinking' && i === guess) cls += ' is-chosen';
              if (revealed && i === answer) {
                cls += ' is-answer';
                tag = t('jodi.reveal.theirs', { name: subject() });
              } else if (revealed && i === guess) {
                cls += ' is-wrong';
                tag = t('jodi.reveal.guess', { name: guesser() });
              }
              return html`<button class="${cls}" data-action="jodi-guess" data-value="${i}" ${s.phase === 'choose' ? '' : raw('disabled')}>${pick(option)}${tag ? html`<span class="tag">${tag}</span>` : ''}</button>`;
            })}
          </div>
          ${revealed ? html`
            <p class="reveal-banner ${match ? 'match' : 'miss'}">${match ? t('jodi.reveal.match') : t('jodi.reveal.nope')}</p>
            <button class="btn btn-primary btn-wide" data-action="jodi-next">${last ? t('jodi.continue') : t('jodi.next')}</button>` : ''}
        </section>`;
      },
    },

    'jodi-half': {
      inGame: true,
      view: () => {
        const first = s.game.rounds[0];
        return html`<section class="screen handoff half">
          <div class="half-art">${raw(rangoli(rangoliStates(s.game)))}</div>
          <h1>${t('jodi.half.title')}</h1>
          <p>${t('jodi.half.score', { guesser: s.game.names[first.guesser], subject: s.game.names[first.subject], n: roundScore(first) })}</p>
          <p>${t('jodi.half.next', { subject: s.game.names[1], guesser: s.game.names[0] })}</p>
          <button class="btn btn-primary btn-wide" data-action="jodi-swap">${t('jodi.half.go')}</button>
        </section>`;
      },
    },

    'jodi-result': {
      view: () => {
        const g = s.game;
        const score = totalScore(g);
        const band = titleFor(score);
        const top = bragger(g);
        return html`<section class="screen result">
          <p class="kicker">${t('jodi.result.kicker')}</p>
          <h1 class="result-names">${g.names[0]} &amp; ${g.names[1]}</h1>
          <div class="result-art">${raw(rangoli(rangoliStates(g)))}</div>
          <p class="big-score"><span>${score}</span>/12</p>
          <h2 class="result-title">${pick(band.title)}</h2>
          <p class="result-line">${pick(band.line)}</p>
          <div class="card knows">
            ${g.rounds.map((r) => html`<div class="knows-row"><span>${t('jodi.result.knows', { guesser: g.names[r.guesser], subject: g.names[r.subject] })}</span><b>${roundScore(r)}/6</b></div>`)}
            <p class="brag">${top === null ? t('jodi.result.tie') : t('jodi.result.brag', { name: g.names[top] })}</p>
          </div>
          <button class="btn btn-primary btn-wide" data-action="jodi-share">${raw(ICON.share)} ${t('jodi.result.share')}</button>
          <div class="row-btns">
            <button class="btn btn-ghost" data-action="jodi-again">${t('jodi.result.again')}</button>
            <button class="btn btn-ghost" data-action="jodi-new">${t('jodi.result.new')}</button>
          </div>
        </section>`;
      },
      mount: (el) => {
        if (s.celebrated) return null;
        s.celebrated = true;
        const timers = [];
        const lit = [...el.querySelectorAll('.result-art .slot-lit .slot-pop')];
        lit.forEach((pop, k) => {
          const delay = 250 + k * 150;
          pop.style.animationDelay = `${delay}ms`;
          pop.classList.add('is-fresh');
          timers.push(setTimeout(() => sound.tick(), delay));
        });
        const score = totalScore(s.game);
        timers.push(setTimeout(() => {
          sound.fanfare();
          if (score >= 10) celebrate(6, sound.pop);
          else if (score >= 7) celebrate(2, sound.pop);
        }, 400 + lit.length * 150));
        return () => timers.forEach(clearTimeout);
      },
    },
  },

  actions: {
    'jodi-type': (el) => {
      s.type = el.dataset.value;
      redraw();
    },
    'model:jodi-name-0': (value) => {
      s.names[0] = value;
    },
    'model:jodi-name-1': (value) => {
      s.names[1] = value;
    },
    'jodi-start': () => startGame(),
    'jodi-answering': () => {
      s.index = 0;
      go('jodi-answer');
    },
    'jodi-answer': (el) => {
      if (s.busy) return;
      s.busy = true;
      el.classList.add('is-chosen');
      round().answers[s.index] = Number(el.dataset.value);
      setTimeout(() => {
        s.busy = false;
        if (currentName() !== 'jodi-answer') return;
        if (s.index + 1 < PER_ROUND) {
          s.index += 1;
          redraw();
          announce(pick(question().you));
        } else {
          s.index = 0;
          go('jodi-pass');
        }
      }, 240);
    },
    'jodi-undo': () => {
      if (s.busy || s.index === 0) return;
      s.index -= 1;
      round().answers.length = s.index;
      redraw();
    },
    'jodi-guessing': () => {
      s.index = 0;
      s.phase = 'choose';
      go('jodi-guess');
    },
    'jodi-guess': (el) => {
      if (s.phase !== 'choose') return;
      round().guesses[s.index] = Number(el.dataset.value);
      s.phase = 'thinking';
      redraw();
      setTimeout(() => {
        s.phase = 'revealed';
        if (currentName() !== 'jodi-guess') return;
        redraw();
        revealEffects();
      }, 700);
    },
    'jodi-next': () => {
      s.phase = 'choose';
      if (s.index + 1 < PER_ROUND) {
        s.index += 1;
        redraw();
        announce(pick(question().they, { name: subject() }));
      } else if (s.round === 0) {
        go('jodi-half');
      } else {
        rememberQuestions();
        go('jodi-result');
      }
    },
    'jodi-swap': () => {
      s.round = 1;
      s.index = 0;
      s.phase = 'choose';
      go('jodi-handoff');
    },
    'jodi-share': () => shareResult(),
    'jodi-again': () => startGame(),
    'jodi-new': () => go('jodi-setup'),
  },
});
