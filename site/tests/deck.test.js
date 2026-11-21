import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseDeck, checkDeck, findSuspended, copiesByCard } from '../src/lib/deck.js';

const suspensions = JSON.parse(readFileSync(new URL('../../data/suspensions.json', import.meta.url))).suspensions;
const example = readFileSync(new URL('../../data/sample/example_deck.txt', import.meta.url), 'utf8');

test('reads sections, counts and set codes', () => {
  const d = parseDeck('Leader\n1 Some Leader (ABC)\nBase:\nSome Base\nDeck\n3x Card One (ABC)\n2 Card Two\nSideboard (3)\n3 Card Three (XY1)');
  assert.deepEqual(d.leader, [{ count: 1, card: 'Some Leader', set: 'ABC' }]);
  assert.deepEqual(d.base, [{ count: 1, card: 'Some Base', set: null }]);
  assert.deepEqual(d.main, [
    { count: 3, card: 'Card One', set: 'ABC' },
    { count: 2, card: 'Card Two', set: null },
  ]);
  assert.deepEqual(d.sideboard, [{ count: 3, card: 'Card Three', set: 'XY1' }]);
});

test('keeps subtitles and parentheses that are not set codes', () => {
  const d = parseDeck('Deck\n1 Cad Bane | Still Faster Than You (ASH)\n1 Sample Base (Red, 28 HP) (SMP)');
  assert.equal(d.main[0].card, 'Cad Bane | Still Faster Than You');
  assert.equal(d.main[0].set, 'ASH');
  assert.equal(d.main[1].card, 'Sample Base (Red, 28 HP)');
});

test('example deck is the right size and flags the suspended card', () => {
  const d = parseDeck(example);
  const checks = Object.fromEntries(checkDeck(d).map((c) => [c.id, c.ok]));
  assert.deepEqual(checks, { leader: true, base: true, main: true, sideboard: true, copies: true });
  const hits = findSuspended(d, suspensions, '2026-11-20');
  assert.deepEqual(hits.map((x) => x.card), ['Neel']);
});

test('suspension respects dates and set codes', () => {
  const d = parseDeck('Deck\n2 Chimaera (ASH)\n1 Chimaera (SEC)\n1 Koska Reeves');
  assert.equal(findSuspended(d, suspensions, '2026-11-08').length, 0);
  const hits = findSuspended(d, suspensions, '2026-11-09');
  assert.equal(hits.length, 2);
  assert.equal(hits[1].nameOnly, true); // no set code pasted
});

test('copy limit counts main deck and sideboard together', () => {
  const d = parseDeck('Deck\n3 Card A\nSideboard\n1 card a');
  assert.equal(copiesByCard(d).get('card a').main, 3);
  assert.equal(checkDeck(d).find((c) => c.id === 'copies').ok, false);
});

test('main deck under 50 and sideboard over 10 fail', () => {
  const d = parseDeck('Leader\nL\nBase\nB\nDeck\n3 X\nSideboard\n3 S1\n3 S2\n3 S3\n2 S4');
  const checks = Object.fromEntries(checkDeck(d).map((c) => [c.id, c.ok]));
  assert.equal(checks.main, false);
  assert.equal(checks.sideboard, false);
});
