// Answer Grids tab: one top deck at a time, picked from the left-hand list.
import { renderLayout, sampleBanner } from '../layout.js';
import { h, loadJson, cardLabel, pct, MARKS } from '../lib/dom.js';
import { wilson } from '../lib/stats.js';
import { visibleAnswers, hiddenAnswerCounts } from '../lib/exposure.js';

const { config } = await renderLayout('grids');
const grids = await loadJson('sample/answer_grids.json');
if (grids.is_sample) document.getElementById('banner').append(sampleBanner());

const thresholds = config.playability_percent;
const minGames = config.min_sample_sizes.games_for_matchup_win_rate;
const decks = [...grids.decks].sort((a, b) => b.meta_share_pct - a.meta_share_pct);
const nav = document.getElementById('deck-nav');
const detail = document.getElementById('deck-detail');

const deckName = (d) => `${d.leader.card} · ${d.base.card}`;
const nameById = (id) => (id === 'other' ? 'All other decks' : deckName(decks.find((d) => d.id === id)));

function renderNav(activeId) {
  nav.replaceChildren(
    ...decks.map((d) =>
      h(
        'li',
        {},
        h(
          'a',
          { href: `#${d.id}`, class: d.id === activeId ? 'active' : '' },
          h('span', { class: 'nav-leader' }, d.leader.card),
          h('span', { class: 'nav-base muted small' }, d.base.card),
          h('span', { class: 'nav-share' }, `${d.meta_share_pct.toFixed(1)}%`),
        ),
      ),
    ),
  );
}

function render() {
  const id = location.hash.slice(1);
  const d = decks.find((x) => x.id === id) ?? decks[0];
  renderNav(d.id);
  detail.replaceChildren(headerPanel(d), keyCardsPanel(d), gridPanel(d), h('div', { class: 'two-col' }, matchupsPanel(d), h('div', { class: 'stack' }, shapePanel(d), sideboardPanel(d))));
}

function tile(label, value, small = false) {
  return h('div', { class: `tile${small ? ' tile-small' : ''}` }, h('div', { class: 'tile-label' }, label), h('div', { class: 'tile-value' }, value));
}

function headerPanel(d) {
  return h(
    'div',
    { class: 'panel deck-header' },
    h(
      'div',
      {},
      h('h2', { class: 'deck-title' }, cardLabel(d.leader)),
      h('div', { class: 'muted' }, cardLabel(d.base)),
      h('div', { class: 'aspects' }, d.aspects.map((a) => h('span', { class: `aspect aspect-${a.toLowerCase()}` }, a))),
    ),
    h('div', { class: 'summary-grid compact' }, tile('Meta share', `${d.meta_share_pct.toFixed(1)}%`), tile('Decks', d.decks), tile('Top 8s', d.top8s)),
  );
}

function keyCardsPanel(d) {
  return h(
    'div',
    { class: 'panel' },
    h('div', { class: 'panel-head' }, h('h2', {}, 'Key cards'), h('span', { class: 'muted small' }, 'Picked by hand')),
    h(
      'ol',
      { class: 'key-cards' },
      d.key_cards.map((k) => h('li', {}, h('div', { class: 'key-name' }, cardLabel(k)), h('div', { class: 'muted' }, k.reason))),
    ),
  );
}

function gridPanel(d) {
  const answers = visibleAnswers(d, thresholds).sort((a, b) => b.play_pct - a.play_pct);
  const hidden = hiddenAnswerCounts(d, thresholds);
  return h(
    'div',
    { class: 'panel' },
    h(
      'div',
      { class: 'panel-head' },
      h('h2', {}, 'Answer grid'),
      h('div', { class: 'legend' }, Object.values(MARKS).map((m) => h('span', {}, h('span', { class: `mark ${m.cls}` }, m.symbol), ` ${m.label}`))),
    ),
    h(
      'div',
      { class: 'table-scroll' },
      h(
        'table',
        { class: 'table answer-grid' },
        h(
          'thead',
          {},
          h('tr', {}, h('th', {}, 'Answer card'), h('th', { class: 'num' }, '% of decks'), d.key_cards.map((k) => h('th', { class: 'key-col', title: k.reason }, k.card))),
        ),
        h(
          'tbody',
          {},
          answers.map((a) =>
            h(
              'tr',
              {},
              h('td', {}, cardLabel(a)),
              h('td', { class: 'num' }, `${a.play_pct.toFixed(1)}%`),
              d.key_cards.map((k) => {
                const m = MARKS[a.cells[k.id]];
                return h('td', { class: 'cell' }, m ? h('span', { class: `mark ${m.cls}`, title: m.label }, m.symbol) : h('span', { class: 'empty' }, '·'));
              }),
            ),
          ),
        ),
      ),
    ),
    h(
      'p',
      { class: 'muted small' },
      `Answers come from mechanical rules on card text and stats. Only cards in at least ${thresholds.show_at_or_above}% of decks (main deck or sideboard) are shown. `,
      hidden.needsApproval ? `${hidden.needsApproval} waiting for review. ` : '',
      hidden.excluded ? `${hidden.excluded} excluded (under ${thresholds.approval_at_or_above}%).` : '',
    ),
  );
}

function matchupsPanel(d) {
  const rows = [...d.matchups].sort((a, b) => b.games - a.games);
  return h(
    'div',
    { class: 'panel' },
    h('div', { class: 'panel-head' }, h('h2', {}, 'Matchups'), h('span', { class: 'muted small' }, '90% likely range')),
    h(
      'table',
      { class: 'table matchups' },
      h('thead', {}, h('tr', {}, h('th', {}, 'Opponent'), h('th', { class: 'num' }, 'Win rate'), h('th', {}, 'Likely range'), h('th', { class: 'num' }, 'Games'))),
      h(
        'tbody',
        {},
        rows.map((m) => {
          const tooFew = minGames !== null && m.games < minGames;
          const [lo, hi] = wilson(m.wins, m.games, config.likely_range_confidence);
          return h(
            'tr',
            {},
            h('td', {}, nameById(m.vs)),
            h('td', { class: 'num' }, tooFew ? '—' : pct(m.wins / m.games, 0)),
            h('td', {}, tooFew ? h('span', { class: 'muted small' }, 'too few games') : rangeBar(m.wins / m.games, lo, hi)),
            h('td', { class: 'num' }, m.games),
          );
        }),
      ),
    ),
    h(
      'p',
      { class: 'muted small' },
      'Likely range: given this many games, the true win rate is probably inside the bar (90% Wilson interval). Fewer games means a wider bar. ',
      minGames === null ? 'Minimum sample size not set yet, so small samples are still shown.' : `Hidden below ${minGames} games.`,
    ),
  );
}

function rangeBar(p, lo, hi) {
  return h(
    'div',
    { class: 'range', title: `${pct(lo, 0)} – ${pct(hi, 0)}` },
    h('div', { class: 'range-mid' }),
    h('div', { class: 'range-band', style: { left: pct(lo), width: pct(hi - lo) } }),
    h('div', { class: 'range-dot', style: { left: pct(p) } }),
    h('span', { class: 'range-text small muted' }, `${pct(lo, 0)}–${pct(hi, 0)}`),
  );
}

function shapePanel(d) {
  const s = d.shape;
  return h(
    'div',
    { class: 'panel' },
    h('h2', {}, 'Deck shape'),
    h(
      'div',
      { class: 'summary-grid small-tiles' },
      tile('Avg cost', s.avg_cost.toFixed(1), true),
      tile('Units', s.units, true),
      tile('Events', s.events, true),
      tile('Upgrades', s.upgrades, true),
      tile('Ground', s.ground_units, true),
      tile('Space', s.space_units, true),
    ),
    h('p', { class: 'muted small' }, 'Average across Top 8 lists in the window.'),
  );
}

function sideboardPanel(d) {
  return h(
    'div',
    { class: 'panel' },
    h('h2', {}, 'Sideboard'),
    h(
      'table',
      { class: 'table' },
      h('thead', {}, h('tr', {}, h('th', {}, 'Card'), h('th', { class: 'num' }, '% of lists'), h('th', { class: 'num' }, 'Avg copies'))),
      h('tbody', {}, d.sideboard.map((c) => h('tr', {}, h('td', {}, cardLabel(c)), h('td', { class: 'num' }, `${c.pct_of_lists}%`), h('td', { class: 'num' }, c.avg_copies.toFixed(1))))),
    ),
  );
}

window.addEventListener('hashchange', render);
render();
