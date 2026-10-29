// Jodi Check: one player answers questions about themselves in secret, the other guesses each answer,
// then they swap. Every match lights a diya; 12 lights finish the rangoli. Pure game logic, no DOM.
import { JODI_QUESTIONS } from './decks/jodi.js';
import { shuffle } from './random.js';

export const JODI_TYPES = ['couple', 'siblings', 'friends', 'family'];
export const PER_ROUND = 6;
export const TOTAL = PER_ROUND * 2;
const OWN_PER_GAME = 5;

/** Scores and what they mean, best first. */
export const TITLES = [
  {
    min: 12,
    title: { en: 'Made in the same factory', hi: 'Ek hi factory ka maal' },
    line: { en: 'Every single diya lit. Frankly, suspicious.', hi: 'Saare diye jal gaye. Thoda suspicious hai.' },
  },
  {
    min: 10,
    title: { en: 'Kaju katli jodi', hi: 'Kaju katli jodi' },
    line: { en: 'Rare, precious, and everyone is jealous.', hi: 'Rare, precious, aur sab jealous.' },
  },
  {
    min: 7,
    title: { en: 'Gulab jamun jodi', hi: 'Gulab jamun jodi' },
    line: { en: 'Sweet, a little syrupy, very solid.', hi: 'Meethi, thodi chipku, ekdum solid.' },
  },
  {
    min: 4,
    title: { en: 'Soan papdi jodi', hi: 'Soan papdi jodi' },
    line: { en: 'Passed around for years. Never actually opened.', hi: 'Saalon se ghoom rahi hai. Kabhi kholi hi nahi.' },
  },
  {
    min: 1,
    title: { en: 'Same Wi-Fi, different worlds', hi: 'Wi-Fi same, duniya alag' },
    line: { en: "You share a password. That's about it.", hi: 'Bas Wi-Fi ka password common hai.' },
  },
  {
    min: 0,
    title: { en: 'Strangers at the same party', hi: 'Ek hi party ke ajnabi' },
    line: { en: 'Introduce yourselves. Then play again.', hi: 'Pehle intro karo. Phir se khelo.' },
  },
];

export function titleFor(score) {
  return TITLES.find((band) => score >= band.min);
}

/** Questions that weren't played recently come first, each group in random order. */
function freshFirst(questions, recent, rng) {
  const mixed = shuffle(questions, rng);
  return [...mixed.filter((q) => !recent.has(q.id)), ...mixed.filter((q) => recent.has(q.id))];
}

/**
 * The 12 questions for a game, as two rounds of 6. Five come from the jodi's own set (three in the
 * first round, two in the second) and the rest from the questions for everyone.
 */
export function pickRounds(type, { rng = Math.random, recent = new Set(), bank = JODI_QUESTIONS } = {}) {
  const own = freshFirst(bank.filter((q) => q.for === type), recent, rng);
  const shared = freshFirst(bank.filter((q) => q.for === 'all'), recent, rng);
  const ownCount = Math.min(OWN_PER_GAME, own.length);
  const ownFirst = Math.ceil(ownCount / 2);
  const sharedFirst = PER_ROUND - ownFirst;
  const first = [...own.slice(0, ownFirst), ...shared.slice(0, sharedFirst)];
  const second = [...own.slice(ownFirst, ownCount), ...shared.slice(sharedFirst, sharedFirst + PER_ROUND - (ownCount - ownFirst))];
  return [shuffle(first, rng), shuffle(second, rng)];
}

export function createGame(type, names, options) {
  const [first, second] = pickRounds(type, options);
  return {
    type,
    names,
    rounds: [
      { subject: 0, guesser: 1, questions: first, answers: [], guesses: [] },
      { subject: 1, guesser: 0, questions: second, answers: [], guesses: [] },
    ],
  };
}

export function isMatch(round, index) {
  return round.guesses[index] !== undefined && round.guesses[index] === round.answers[index];
}

export function roundScore(round) {
  return round.questions.filter((_, i) => isMatch(round, i)).length;
}

export function totalScore(game) {
  return game.rounds.reduce((sum, round) => sum + roundScore(round), 0);
}

/**
 * The rangoli's 12 slots: the first round's questions, then the second's. A guessed question is
 * 'lit' or 'out'; the one being guessed is 'next' (pass `current` as { round, index }).
 */
export function rangoliStates(game, current = null) {
  return game.rounds.flatMap((round, r) =>
    round.questions.map((_, i) => {
      if (round.guesses[i] !== undefined) return isMatch(round, i) ? 'lit' : 'out';
      if (current && current.round === r && current.index === i) return 'next';
      return 'todo';
    }));
}

/** Who knows whom better: the guesser of the higher-scoring round, or null for a tie. */
export function bragger(game) {
  const [a, b] = game.rounds.map(roundScore);
  if (a === b) return null;
  return a > b ? game.rounds[0].guesser : game.rounds[1].guesser;
}

export function questionIds(game) {
  return game.rounds.flatMap((round) => round.questions.map((q) => q.id));
}
