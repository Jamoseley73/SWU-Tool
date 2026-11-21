// Shared header (with tabs), format strip and footer for every page.
import { h, loadJson, todayIso, formatDate } from './lib/dom.js';
import { activeSuspensions } from './lib/deck.js';

const TABS = [
  { id: 'deck', label: 'Deck Check', href: './' },
  { id: 'grids', label: 'Answer Grids', href: './answer-grid.html' },
];

export async function renderLayout(activeTab) {
  const [config, susp] = await Promise.all([loadJson('config.json'), loadJson('suspensions.json')]);
  const suspended = activeSuspensions(susp.suspensions, todayIso());

  const header = h(
    'header',
    { class: 'site-header' },
    h(
      'div',
      { class: 'wrap header-row' },
      h('a', { class: 'brand', href: './' }, 'SWU Deck Workbench'),
      h(
        'nav',
        { class: 'tabs', 'aria-label': 'Main' },
        TABS.map((t) =>
          h('a', { class: `tab${t.id === activeTab ? ' active' : ''}`, href: t.href, 'aria-current': t.id === activeTab ? 'page' : null }, t.label),
        ),
      ),
      h(
        'div',
        { class: 'window' },
        h('span', { class: 'pill' }, `${config.active_set} · ${config.active_window_label}`),
        h('span', { class: 'muted small' }, 'Premier'),
      ),
    ),
    h(
      'div',
      { class: 'wrap strip' },
      h(
        'details',
        {},
        h('summary', {}, `Suspended in Premier: ${suspended.length} cards`),
        h(
          'ul',
          { class: 'suspended-list' },
          suspended.map((s) => h('li', {}, `${s.card} (${s.set})`, h('span', { class: 'muted' }, ` since ${formatDate(s.suspended_on)}`))),
        ),
      ),
    ),
  );

  const footer = h(
    'footer',
    { class: 'site-footer' },
    h(
      'div',
      { class: 'wrap' },
      'Tournament data from ',
      h('a', { href: 'https://swumetastats.com', rel: 'noopener' }, 'swumetastats.com'),
      ' and ',
      h('a', { href: 'https://swustats.net', rel: 'noopener' }, 'SWU Stats'),
      '. Statistics, not suggestions: this site shows data; players decide. Unofficial fan tool, not affiliated with Fantasy Flight Games or Lucasfilm.',
    ),
  );

  document.body.prepend(header);
  document.body.append(footer);
  return { config, suspensions: susp.suspensions };
}

export function sampleBanner() {
  return h(
    'div',
    { class: 'sample-banner', role: 'note' },
    h('strong', {}, 'Sample data. '),
    'Cards marked (SMP) and all numbers on this page are made up to preview the layout. Real Homeworlds data comes with the data pipeline.',
  );
}
