// Joins a parsed deck with answer-grid data. Pure functions.
import { copiesByCard } from './deck.js';
import { classifyPlayability } from './stats.js';

// Answer cards that pass the playability filter (>= 2% by default).
export function visibleAnswers(deckData, thresholds) {
  return deckData.answers.filter(
    (a) => classifyPlayability(a.play_pct, thresholds?.show_at_or_above, thresholds?.approval_at_or_above) === 'show',
  );
}

export function hiddenAnswerCounts(deckData, thresholds) {
  let needsApproval = 0;
  let excluded = 0;
  for (const a of deckData.answers) {
    const c = classifyPlayability(a.play_pct, thresholds?.show_at_or_above, thresholds?.approval_at_or_above);
    if (c === 'needs_approval') needsApproval++;
    if (c === 'excluded') excluded++;
  }
  return { needsApproval, excluded };
}

// For one top deck: for each key card, which of the player's cards are
// marked as answers (by the mechanical rules), split by main deck / sideboard.
export function exposureFor(deckData, playerDeck, thresholds) {
  const mine = copiesByCard(playerDeck);
  const answers = visibleAnswers(deckData, thresholds);
  return deckData.key_cards.map((k) => {
    const hits = [];
    for (const a of answers) {
      const mark = a.cells[k.id];
      if (!mark) continue;
      const have = mine.get(a.card.toLowerCase());
      if (have) hits.push({ card: a.card, set: a.set, mark, main: have.main, sideboard: have.sideboard });
    }
    const inMain = hits.filter((h) => h.main > 0).length;
    const inSide = hits.filter((h) => h.main === 0 && h.sideboard > 0).length;
    return { key: k, hits, inMain, inSide };
  });
}
