// Chakri Truth or Dare: who the chakri picks, which card comes up, and the scores. Pure game logic,
// no DOM.
import { DARE_CARDS } from './decks/dares.js';
import { pickWeighted, shuffle } from './random.js';

export const LEVELS = [
  { id: 'sparkler', kind: 'truth', points: 1 },
  { id: 'flowerpot', kind: 'truth', points: 2 },
  { id: 'rocket', kind: 'dare', points: 2 },
  { id: 'bomb', kind: 'dare', points: 3 },
];
export const DECKS = ['family', 'friends', 'couple', 'aunty'];
export const LADDOOS = 3;
export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 12;

export function level(id) {
  return LEVELS.find((l) => l.id === id);
}

/** Couple is only for exactly two players, so {other} is always the partner. */
export function deckAllowed(deck, playerCount) {
  return deck !== 'couple' || playerCount === 2;
}

export function createGame(names, decks) {
  return {
    players: names.map((name) => ({ name, points: 0, laddoos: LADDOOS, turns: 0, truths: 0, dares: 0, skips: 0 })),
    decks: decks.filter((deck) => deckAllowed(deck, names.length)),
    last: -1,
    bags: {},
  };
}

/** Who the chakri lands on: never the same player twice running, and whoever has had fewer turns is likelier. */
export function pickPlayer(game, rng = Math.random) {
  const n = game.players.length;
  const fewest = Math.min(...game.players.map((p) => p.turns));
  const weights = game.players.map((p, i) => (n > 1 && i === game.last ? 0 : 1 / (1 + 2 * (p.turns - fewest))));
  return pickWeighted(weights, rng);
}

/** The chakri has stopped on this player. */
export function land(game, playerIndex) {
  game.last = playerIndex;
}

/** Anyone but the player whose turn it is, for a card's {other}. */
export function pickOther(game, playerIndex, rng = Math.random) {
  const others = game.players.map((_, i) => i).filter((i) => i !== playerIndex);
  return others[Math.floor(rng() * others.length)];
}

/** The next card of a level from the chosen decks. Each level is a shuffled bag: no repeats until it's empty. */
export function drawCard(game, levelId, rng = Math.random) {
  if (!game.bags[levelId]?.length) {
    const pool = DARE_CARDS.filter((card) => card.level === levelId && game.decks.includes(card.deck));
    game.bags[levelId] = shuffle(pool, rng);
  }
  return game.bags[levelId].pop() ?? null;
}

/** Ends a turn: 'done' scores the level's points, 'skip' costs a laddoo. Returns false if a skip isn't allowed. */
export function finishTurn(game, playerIndex, levelId, outcome) {
  const player = game.players[playerIndex];
  if (outcome === 'skip') {
    if (player.laddoos === 0) return false;
    player.laddoos -= 1;
    player.skips += 1;
    player.turns += 1;
    return true;
  }
  const { kind, points } = level(levelId);
  player.points += points;
  player.turns += 1;
  if (kind === 'dare') player.dares += 1;
  else player.truths += 1;
  return true;
}

/** Highest score first; ties go to whoever has more laddoos left, then fewer skips. */
export function standings(game) {
  return game.players
    .map((player, index) => ({ ...player, index }))
    .sort((a, b) => b.points - a.points || b.laddoos - a.laddoos || a.skips - b.skips || a.index - b.index);
}

/** The night's awards. Each goes to one clear winner, and only when it means something. */
export function awards(game) {
  const played = game.players.filter((p) => p.turns > 0);
  const list = [];
  const soleTop = (key) => {
    const best = Math.max(0, ...played.map((p) => p[key]));
    const winners = played.filter((p) => p[key] === best);
    return best > 0 && winners.length === 1 ? winners[0] : null;
  };
  const rocket = soleTop('dares');
  if (rocket) list.push({ id: 'rocket', name: rocket.name });
  const lover = soleTop('skips');
  if (lover) list.push({ id: 'lover', name: lover.name });
  const neverSkipped = played.filter((p) => p.skips === 0 && p.turns >= 2);
  if (neverSkipped.length === 1) list.push({ id: 'hoarder', name: neverSkipped[0].name });
  return list;
}
