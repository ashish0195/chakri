// The question decks and the UI strings: both languages everywhere, the right placeholders, lengths
// that fit a phone, and a few guards on what the content may say.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JODI_QUESTIONS } from '../src/decks/jodi.js';
import { DARE_CARDS } from '../src/decks/dares.js';
import { JODI_TYPES } from '../src/jodi.js';
import { DECKS, LEVELS } from '../src/dares.js';
import { STRINGS } from '../src/i18n.js';

const LANGS = ['en', 'hi'];
const placeholders = (text) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]);
// Length on screen: code points, with a placeholder counted as a 10-letter name.
const length = (text) => [...text.replace(/\{\w+\}/g, 'x'.repeat(10))].length;

// Hindi verb forms that change with the gender of the person they're about. Lines about a player
// must avoid them.
const GENDERED = /\b(karoge|karogi|karunga|karungi|jaoge|jaogi|jaunga|jaungi|gaye ho|gayi ho|gaya tha|gayi thi|sakte ho|sakti ho|sakta|sakti|rahe ho|rahi ho|raha hai|rahi hai|thake|thaki|thaka|lagoge|lagogi|dikhoge|dikhogi|hoge|hogi)\b/i;

test('every Jodi question has both languages, four distinct options and the right placeholders', () => {
  const ids = new Set();
  for (const q of JODI_QUESTIONS) {
    assert.ok(!ids.has(q.id), `duplicate id ${q.id}`);
    ids.add(q.id);
    assert.ok(['all', ...JODI_TYPES].includes(q.for), `${q.id}: unknown set ${q.for}`);
    for (const lang of LANGS) {
      assert.ok(q.you[lang]?.trim(), `${q.id}: you.${lang} is empty`);
      assert.ok(q.they[lang]?.trim(), `${q.id}: they.${lang} is empty`);
      assert.deepEqual(placeholders(q.you[lang]), [], `${q.id}: you.${lang} mustn't name anyone`);
      const they = placeholders(q.they[lang]);
      assert.ok(they.length >= 1 && they.every((p) => p === 'name'), `${q.id}: they.${lang} needs {name} and nothing else`);
      assert.ok(length(q.you[lang]) <= 90, `${q.id}: you.${lang} is too long`);
      assert.ok(length(q.they[lang]) <= 90, `${q.id}: they.${lang} is too long`);
      const options = q.options.map((o) => o[lang]?.trim());
      assert.equal(options.length, 4, `${q.id}: needs 4 options`);
      assert.ok(options.every(Boolean), `${q.id}: an option has no ${lang}`);
      assert.equal(new Set(options).size, 4, `${q.id}: options repeat in ${lang}`);
      for (const option of options) assert.ok(length(option) <= 34, `${q.id}: option "${option}" is too long`);
    }
  }
});

test('every kind of jodi has enough questions for several fresh games', () => {
  const shared = JODI_QUESTIONS.filter((q) => q.for === 'all').length;
  assert.ok(shared >= 24, `only ${shared} questions for everyone`);
  for (const type of JODI_TYPES) {
    const own = JODI_QUESTIONS.filter((q) => q.for === type).length;
    assert.ok(own >= 10, `only ${own} questions for ${type}`);
  }
});

test('every deck has cards at every level, in both languages, with known placeholders', () => {
  const ids = new Set();
  for (const card of DARE_CARDS) {
    assert.ok(!ids.has(card.id), `duplicate id ${card.id}`);
    ids.add(card.id);
    assert.ok(DECKS.includes(card.deck), `${card.id}: unknown deck`);
    assert.ok(LEVELS.some((l) => l.id === card.level), `${card.id}: unknown level`);
    for (const lang of LANGS) {
      assert.ok(card[lang]?.trim(), `${card.id}: no ${lang}`);
      assert.ok(placeholders(card[lang]).every((p) => p === 'name' || p === 'other'), `${card.id}: unknown placeholder in ${lang}`);
      assert.ok(length(card[lang]) <= 150, `${card.id}: ${lang} is too long`);
    }
    assert.deepEqual(
      [...new Set(placeholders(card.en))].sort(),
      [...new Set(placeholders(card.hi))].sort(),
      `${card.id}: en and hi name different people`,
    );
  }
  for (const deck of DECKS) {
    for (const { id } of LEVELS) {
      const count = DARE_CARDS.filter((c) => c.deck === deck && c.level === id).length;
      assert.ok(count >= 8, `${deck}/${id} has only ${count} cards`);
    }
  }
});

test('no dare involves fire, drink, smoke, blades or kissing', () => {
  const banned = /\b(lighter|lighting|light (a|the|up)|matchsticks?|matches|candles?|fire|burn\w*|alcohol|beer|wine|vodka|whisk(e)?y|drunk|smok\w*|vap(e|ing)|knife|knives|kiss\w*)\b/i;
  for (const card of DARE_CARDS.filter((c) => c.level === 'rocket' || c.level === 'bomb')) {
    assert.ok(!banned.test(card.en), `${card.id}: "${card.en}"`);
  }
});

test('Hinglish lines avoid verb forms that assume a gender', () => {
  const lines = [
    ...JODI_QUESTIONS.flatMap((q) => [[q.id, q.you.hi], [q.id, q.they.hi], ...q.options.map((o) => [q.id, o.hi])]),
    ...DARE_CARDS.map((c) => [c.id, c.hi]),
    ...Object.entries(STRINGS).map(([key, pair]) => [key, pair[1]]),
  ];
  for (const [id, line] of lines) assert.ok(!GENDERED.test(line), `${id}: "${line}"`);
});

test('every UI string has both languages and the same placeholders in each', () => {
  for (const [key, [en, hi]] of Object.entries(STRINGS)) {
    assert.ok(en?.trim() && hi?.trim(), `${key} is missing a language`);
    assert.deepEqual(placeholders(en).sort(), placeholders(hi).sort(), `${key}: placeholders differ`);
  }
});
