import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  LADDOOS, awards, createGame, drawCard, finishTurn, land, pickOther, pickPlayer, standings,
} from '../src/dares.js';
import { DARE_CARDS } from '../src/decks/dares.js';
import { seeded } from '../src/random.js';

const NAMES = ['Asha', 'Bilal', 'Chinmay', 'Divya', 'Esha'];

test('the chakri never picks the same player twice running, and turns stay even', () => {
  const game = createGame(NAMES, ['family']);
  const rng = seeded(1);
  let last = -1;
  for (let turn = 0; turn < 500; turn++) {
    const player = pickPlayer(game, rng);
    assert.notEqual(player, last, `turn ${turn} repeated player ${player}`);
    land(game, player);
    finishTurn(game, player, 'sparkler', 'done');
    last = player;
  }
  const turns = game.players.map((p) => p.turns);
  assert.ok(Math.max(...turns) - Math.min(...turns) <= 2, `uneven turns: ${turns}`);
});

test('two players simply take turns', () => {
  const game = createGame(['Mira', 'Neel'], ['couple']);
  const rng = seeded(2);
  const order = [];
  for (let i = 0; i < 6; i++) {
    const player = pickPlayer(game, rng);
    land(game, player);
    finishTurn(game, player, 'rocket', 'done');
    order.push(player);
  }
  for (let i = 1; i < order.length; i++) assert.notEqual(order[i], order[i - 1]);
});

test('couple cards are only dealt to exactly two players', () => {
  assert.deepEqual(createGame(NAMES, ['couple', 'friends']).decks, ['friends']);
  assert.deepEqual(createGame(['Mira', 'Neel'], ['couple', 'friends']).decks, ['couple', 'friends']);
});

test('a card doesn’t come back until every card of its level has been dealt', () => {
  const game = createGame(NAMES, ['family', 'aunty']);
  const pool = DARE_CARDS.filter((c) => c.level === 'bomb' && (c.deck === 'family' || c.deck === 'aunty'));
  const rng = seeded(5);
  const seen = new Set();
  for (let i = 0; i < pool.length; i++) {
    const card = drawCard(game, 'bomb', rng);
    assert.ok(card, 'ran out of cards early');
    assert.ok(['family', 'aunty'].includes(card.deck));
    assert.ok(!seen.has(card.id), `${card.id} came back early`);
    seen.add(card.id);
  }
  assert.ok(drawCard(game, 'bomb', rng), 'the bag refills');
});

test('{other} is never the player whose turn it is', () => {
  const game = createGame(NAMES, ['friends']);
  const rng = seeded(7);
  for (let i = 0; i < 200; i++) {
    const player = i % NAMES.length;
    assert.notEqual(pickOther(game, player, rng), player);
  }
});

test('done scores the level, skipping costs a laddoo, and nobody skips without one', () => {
  const game = createGame(['Mira', 'Neel'], ['family']);
  finishTurn(game, 0, 'bomb', 'done');
  finishTurn(game, 0, 'sparkler', 'done');
  assert.equal(game.players[0].points, 4);
  assert.equal(game.players[0].dares, 1);
  assert.equal(game.players[0].truths, 1);
  for (let i = 0; i < LADDOOS; i++) assert.equal(finishTurn(game, 1, 'rocket', 'skip'), true);
  assert.equal(game.players[1].laddoos, 0);
  assert.equal(finishTurn(game, 1, 'rocket', 'skip'), false);
  assert.equal(game.players[1].turns, LADDOOS);
});

test('standings and awards', () => {
  const game = createGame(['Asha', 'Bilal', 'Chinmay'], ['friends']);
  finishTurn(game, 0, 'bomb', 'done'); // Asha 3, a dare
  finishTurn(game, 0, 'rocket', 'done'); // Asha 5, two dares
  finishTurn(game, 1, 'flowerpot', 'done'); // Bilal 2
  finishTurn(game, 1, 'sparkler', 'skip'); // Bilal skips
  finishTurn(game, 2, 'flowerpot', 'done'); // Chinmay 2, no skips
  assert.deepEqual(standings(game).map((p) => p.name), ['Asha', 'Chinmay', 'Bilal']);
  assert.deepEqual(awards(game), [
    { id: 'rocket', name: 'Asha' },
    { id: 'lover', name: 'Bilal' },
    { id: 'hoarder', name: 'Asha' },
  ]);
});
