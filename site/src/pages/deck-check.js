// Home page: paste-your-deck tool.
import { renderLayout, sampleBanner } from '../layout.js';
import { h, loadJson, loadText, todayIso, cardLabel, MARKS } from '../lib/dom.js';
import { parseDeck, checkDeck, findSuspended, copiesByCard } from '../lib/deck.js';
import { exposureFor, visibleAnswers, hiddenAnswerCounts } from '../lib/exposure.js';

const DRAFT_KEY = 'swu-deck-check-draft';

const { config, suspensions } = await renderLayout('deck');
const grids = await loadJson('sample/answer_grids.json');
if (grids.is_sample) document.getElementById('banner').append(sampleBanner());

const textarea = document.getElementById('decklist');
const results = document.getElementById('results');
const thresholds = config.playability_percent;

// Remember an unsent draft in this browser only.
try {
  textarea.value = localStorage.getItem(DRAFT_KEY) ?? '';
} catch {}
textarea.addEventListener('input', () => {
  try {
    localStorage.setItem(DRAFT_KEY, textarea.value);
  } catch {}
});

document.getElementById('analyze').addEventListener('click', analyze);
document.getElementById('clear').addEventListener('click', () => {
  textarea.value = '';
  textarea.dispatchEvent(new Event('input'));
  results.replaceChildren(h('div', { class: 'panel empty-state' }, h('h2', {}, 'Results'), h('p', { class: 'muted' }, 'Cleared.')));
});
document.getElementById('example').addEventListener('click', async () => {
  textarea.value = await loadText('sample/example_deck.txt');
  textarea.dispatchEvent(new Event('input'));
  analyze();
});

const deckName = (d) => `${d.leader.card} · ${d.base.card}`;

function analyze() {
  const deck = parseDeck(textarea.value);
  results.replaceChildren(
    summaryPanel(deck),
    suspendedPanel(deck),
    exposurePanel(deck),
    answerFinderPanel(deck),
  );
}

function summaryPanel(deck) {
  const checks = checkDeck(deck);
  const leader = deck.leader[0];
  const base = deck.base[0];
  const n = (list) => list.reduce((s, c) => s + c.count, 0);
  return h(
    'div',
    { class: 'panel' },
    h('div', { class: 'panel-head' }, h('h2', {}, 'Deck summary'), h('span', { class: `status ${checks.every((c) => c.ok) ? 'ok' : 'bad'}` }, checks.every((c) => c.ok) ? 'Legal' : 'Not legal')),
    h(
      'div',
      { class: 'summary-grid' },
      tile('Leader', leader ? cardLabel(leader) : '—'),
      tile('Base', base ? cardLabel(base) : '—'),
      tile('Main deck', n(deck.main)),
      tile('Sideboard', n(deck.sideboard)),
    ),
    h(
      'ul',
      { class: 'checks' },
      checks.map((c) => h('li', { class: c.ok ? 'ok' : 'bad' }, h('span', { class: 'check-icon' }, c.ok ? '✓' : '✗'), c.label, h('span', { class: 'muted' }, ` · ${c.detail}`))),
    ),
    deck.unreadable.length
      ? h('p', { class: 'warn small' }, `Couldn't read ${deck.unreadable.length} line(s): `, deck.unreadable.slice(0, 3).join(' | '))
      : null,
  );
}

function suspendedPanel(deck) {
  const hits = findSuspended(deck, suspensions, todayIso());
  if (!hits.length) return null;
  return h(
    'div',
    { class: 'panel alert' },
    h('h2', {}, 'Suspended cards in this list'),
    h('ul', {}, hits.map((s) => h('li', {}, `${s.card} (${s.set}) ×${s.count}`, s.nameOnly ? h('span', { class: 'muted' }, ' · matched by name (no set code pasted)') : null))),
  );
}

function tile(label, value) {
  return h('div', { class: 'tile' }, h('div', { class: 'tile-label' }, label), h('div', { class: 'tile-value' }, value));
}

function exposurePanel(deck) {
  const rows = grids.decks.map((d) => {
    const exp = exposureFor(d, deck, thresholds);
    const covered = exp.filter((e) => e.inMain > 0).length;
    return h(
      'tr',
      {},
      h('td', {}, h('a', { href: `./answer-grid.html#${d.id}` }, deckName(d))),
      h('td', { class: 'num' }, `${d.meta_share_pct.toFixed(1)}%`),
      h('td', { class: 'num' }, `${covered} / ${exp.length}`),
      h(
        'td',
        {},
        h(
          'div',
          { class: 'chips' },
          exp.map((e) => {
            const state = e.inMain > 0 ? 'yes' : e.inSide > 0 ? 'side' : 'none';
            const text = state === 'yes' ? `${e.inMain} in main` : state === 'side' ? 'sideboard only' : 'none in list';
            const title = e.hits.length ? e.hits.map((x) => `${cardLabel(x)} ${MARKS[x.mark].symbol}`).join('\n') : 'No cards in your list are marked as answers';
            return h('span', { class: `chip chip-${state}`, title }, h('strong', {}, e.key.card), ` · ${text}`);
          }),
        ),
      ),
    );
  });
  return h(
    'div',
    { class: 'panel' },
    h('div', { class: 'panel-head' }, h('h2', {}, 'Exposure check'), h('span', { class: 'muted small' }, `${config.active_set} · ${config.active_window_label}`)),
    h('p', { class: 'muted small' }, 'For each top deck: how many of its key cards your list has at least one main-deck answer for. Hover a key card to see which of your cards answer it.'),
    h(
      'table',
      { class: 'table' },
      h('thead', {}, h('tr', {}, h('th', {}, 'Top deck'), h('th', { class: 'num' }, 'Meta share'), h('th', { class: 'num' }, 'Covered'), h('th', {}, 'Key cards'))),
      h('tbody', {}, rows),
    ),
  );
}

function answerFinderPanel(deck) {
  const mine = copiesByCard(deck);
  const select = h(
    'select',
    { id: 'key-select' },
    grids.decks.map((d) =>
      h('optgroup', { label: deckName(d) }, d.key_cards.map((k) => h('option', { value: `${d.id}|${k.id}` }, cardLabel(k)))),
    ),
  );
  const body = h('div');

  function render() {
    const [deckId, keyId] = select.value.split('|');
    const d = grids.decks.find((x) => x.id === deckId);
    const k = d.key_cards.find((x) => x.id === keyId);
    const answers = visibleAnswers(d, thresholds).filter((a) => a.cells[keyId]).sort((a, b) => b.play_pct - a.play_pct);
    const hidden = hiddenAnswerCounts(d, thresholds);
    body.replaceChildren(
      h('p', { class: 'reason' }, h('strong', {}, 'Why it matters: '), k.reason),
      answers.length
        ? h(
            'table',
            { class: 'table' },
            h('thead', {}, h('tr', {}, h('th', {}, 'Answer card'), h('th', {}, 'Type'), h('th', { class: 'num' }, '% of decks'), h('th', {}, 'In your list'))),
            h(
              'tbody',
              {},
              answers.map((a) => {
                const have = mine.get(a.card.toLowerCase());
                const m = MARKS[a.cells[keyId]];
                const where = have ? [have.main ? `Main ×${have.main}` : null, have.sideboard ? `Side ×${have.sideboard}` : null].filter(Boolean).join(', ') : '—';
                return h(
                  'tr',
                  { class: have ? 'have' : '' },
                  h('td', {}, cardLabel(a)),
                  h('td', {}, h('span', { class: `mark ${m.cls}`, title: m.label }, m.symbol)),
                  h('td', { class: 'num' }, `${a.play_pct.toFixed(1)}%`),
                  h('td', {}, where),
                );
              }),
            ),
          )
        : h('p', { class: 'muted' }, 'No answer cards above the playability threshold.'),
      h(
        'p',
        { class: 'muted small' },
        `Showing answer cards in at least ${thresholds.show_at_or_above}% of decks (main deck or sideboard). `,
        hidden.needsApproval ? `${hidden.needsApproval} card(s) between ${thresholds.approval_at_or_above}% and ${thresholds.show_at_or_above}% are waiting for review. ` : '',
        hidden.excluded ? `${hidden.excluded} card(s) under ${thresholds.approval_at_or_above}% are excluded.` : '',
      ),
    );
  }
  select.addEventListener('change', render);
  render();

  return h(
    'div',
    { class: 'panel' },
    h('div', { class: 'panel-head' }, h('h2', {}, 'Answer finder'), h('label', { class: 'inline-label' }, 'Key card ', select)),
    body,
  );
}
