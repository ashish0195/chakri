import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  JODI_TYPES, PER_ROUND, TITLES, bragger, createGame, pickRounds, rangoliStates, roundScore, titleFor, totalScore,
} from '../src/jodi.js';
import { JODI_QUESTIONS } from '../src/decks/jodi.js';
import { seeded } from '../src/random.js';

test('a game is two rounds of six different questions, five of them from the jodi’s own set', () => {
  for (const type of JODI_TYPES) {
    for (let seed = 1; seed <= 20; seed++) {
      const [first, second] = pickRounds(type, { rng: seeded(seed) });
      assert.equal(first.length, PER_ROUND);
      assert.equal(second.length, PER_ROUND);
      const all = [...first, ...second];
      assert.equal(new Set(all.map((q) => q.id)).size, 12, `${type}: a question repeats`);
      assert.equal(first.filter((q) => q.for === type).length, 3);
      assert.equal(second.filter((q) => q.for === type).length, 2);
      assert.ok(all.every((q) => q.for === type || q.for === 'all'), `${type}: a question from another set`);
    }
  }
});

test('questions played recently wait until the fresh ones run out', () => {
  const [a1, a2] = pickRounds('couple', { rng: seeded(3) });
  const recent = new Set([...a1, ...a2].map((q) => q.id));
  const [b1, b2] = pickRounds('couple', { rng: seeded(4), recent });
  const ownLeft = JODI_QUESTIONS.filter((q) => q.for === 'couple' && !recent.has(q.id)).length;
  const sharedLeft = JODI_QUESTIONS.filter((q) => q.for === 'all' && !recent.has(q.id)).length;
  const repeats = [...b1, ...b2].filter((q) => recent.has(q.id));
  const expected = Math.max(0, 5 - ownLeft) + Math.max(0, 7 - sharedLeft);
  assert.equal(repeats.length, expected);
});

test('scores, the rangoli and bragging rights follow the guesses', () => {
  const game = createGame('friends', ['Riya', 'Kabir'], { rng: seeded(9) });
  const [first, second] = game.rounds;
  first.answers = [0, 1, 2, 3, 0, 1];
  first.guesses = [0, 1, 2, 0, 0, 0]; // 4 right
  second.answers = [3, 3, 3, 3, 3, 3];
  second.guesses = [3, 0, 3]; // 2 right so far
  assert.equal(roundScore(first), 4);
  assert.equal(roundScore(second), 2);
  assert.equal(totalScore(game), 6);
  assert.deepEqual(
    rangoliStates(game, { round: 1, index: 3 }),
    ['lit', 'lit', 'lit', 'out', 'lit', 'out', 'lit', 'out', 'lit', 'next', 'todo', 'todo'],
  );
  assert.equal(bragger(game), first.guesser);
  second.guesses = [3, 3, 3, 3, 0, 0];
  assert.equal(bragger(game), null);
});

test('every score from 0 to 12 has exactly the right title', () => {
  const expected = { 0: 0, 1: 1, 3: 1, 4: 2, 6: 2, 7: 3, 9: 3, 10: 4, 11: 4, 12: 5 };
  const bands = [...TITLES].reverse();
  for (const [score, band] of Object.entries(expected)) {
    assert.equal(titleFor(Number(score)), bands[band], `score ${score}`);
  }
});
