import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { wilson, classifyPlayability } from '../src/lib/stats.js';
import { parseDeck } from '../src/lib/deck.js';
import { exposureFor, visibleAnswers } from '../src/lib/exposure.js';

const close = (a, b, tol = 1e-4) => assert.ok(Math.abs(a - b) < tol, `${a} vs ${b}`);

test('90% likely range matches the Python pipeline value for 7 of 10', () => {
  const [lo, hi] = wilson(7, 10);
  close(lo, 0.4417);
  close(hi, 0.8731);
});

test('likely range rejects impossible inputs', () => {
  assert.throws(() => wilson(1, 0));
  assert.throws(() => wilson(6, 5));
});

test('playability thresholds: 2% shown, 0.5% to 2% review, under 0.5% excluded', () => {
  assert.equal(classifyPlayability(2.0), 'show');
  assert.equal(classifyPlayability(1.99), 'needs_approval');
  assert.equal(classifyPlayability(0.5), 'needs_approval');
  assert.equal(classifyPlayability(0.49), 'excluded');
});

const grids = JSON.parse(readFileSync(new URL('../../data/sample/answer_grids.json', import.meta.url)));
const thresholds = { show_at_or_above: 2.0, approval_at_or_above: 0.5 };

test('answers under 2% never appear', () => {
  for (const d of grids.decks) {
    for (const a of visibleAnswers(d, thresholds)) assert.ok(a.play_pct >= 2.0, a.card);
  }
});

test('exposure separates main-deck answers from sideboard-only answers', () => {
  const alpha = grids.decks.find((d) => d.id === 'alpha-red');
  const deck = parseDeck('Deck\n3 Sample Event: Forced Retreat\nSideboard\n2 Sample Event: Purge Protocol\n3 Sample Event: Last Resort');
  const [k1, k2, k3] = exposureFor(alpha, deck, thresholds);
  assert.equal(k1.inMain, 1); // Forced Retreat answers k1; Last Resort is under 2% so ignored
  assert.equal(k2.inMain, 1); // Forced Retreat answers k2 too
  assert.equal(k3.inMain, 0);
  assert.equal(k3.inSide, 1); // Purge Protocol, sideboard only
});
