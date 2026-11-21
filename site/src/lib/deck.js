// Decklist parsing and Premier legality checks.
// Pure functions (no page access), so they can be tested with `npm test`.

const SECTION_ALIASES = {
  leader: 'leader',
  leaders: 'leader',
  base: 'base',
  deck: 'main',
  main: 'main',
  'main deck': 'main',
  maindeck: 'main',
  sideboard: 'sideboard',
  side: 'sideboard',
};

// Premier deck rules used by checkDeck. Open question 6 in docs/phases.md:
// the owner should confirm these.
export const PREMIER_RULES = {
  leaders: 1,
  bases: 1,
  minMain: 50,
  maxSideboard: 10,
  maxCopies: 3,
};

// "3 Card Name (ASH)", "3x Card Name", "Card Name" (count 1).
// A trailing set code in parentheses is 2–4 capital letters/digits, e.g. (ASH).
const CARD_LINE = /^(?:(\d+)\s*x?\s+)?(.+?)(?:\s+\(([A-Z0-9]{2,4})\))?\s*$/;

export function parseDeck(text) {
  const deck = { leader: [], base: [], main: [], sideboard: [], unreadable: [] };
  let section = 'main';

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;

    const header = line.replace(/:$/, '').replace(/\s*\(\d+\)$/, '').toLowerCase();
    if (SECTION_ALIASES[header]) {
      section = SECTION_ALIASES[header];
      continue;
    }

    const m = line.match(CARD_LINE);
    if (!m) {
      deck.unreadable.push(line);
      continue;
    }
    const count = m[1] ? Number(m[1]) : 1;
    if (count < 1) {
      deck.unreadable.push(line);
      continue;
    }
    deck[section].push({ count, card: m[2].trim(), set: m[3] ?? null });
  }
  return deck;
}

const total = (list) => list.reduce((sum, c) => sum + c.count, 0);
const key = (name) => name.trim().toLowerCase();

// Copies of each card across main deck + sideboard, keyed by lower-case name.
export function copiesByCard(deck) {
  const out = new Map();
  for (const c of [...deck.main, ...deck.sideboard]) {
    const k = key(c.card);
    const prev = out.get(k) ?? { card: c.card, set: c.set, main: 0, sideboard: 0 };
    if (deck.main.includes(c)) prev.main += c.count;
    else prev.sideboard += c.count;
    out.set(k, prev);
  }
  return out;
}

export function checkDeck(deck, rules = PREMIER_RULES) {
  const leaders = total(deck.leader);
  const bases = total(deck.base);
  const main = total(deck.main);
  const side = total(deck.sideboard);
  const overLimit = [...copiesByCard(deck).values()].filter(
    (c) => c.main + c.sideboard > rules.maxCopies,
  );

  return [
    { id: 'leader', ok: leaders === rules.leaders, label: `${rules.leaders} leader`, detail: `${leaders} found` },
    { id: 'base', ok: bases === rules.bases, label: `${rules.bases} base`, detail: `${bases} found` },
    { id: 'main', ok: main >= rules.minMain, label: `At least ${rules.minMain} main-deck cards`, detail: `${main} cards` },
    { id: 'sideboard', ok: side <= rules.maxSideboard, label: `At most ${rules.maxSideboard} sideboard cards`, detail: `${side} cards` },
    {
      id: 'copies',
      ok: overLimit.length === 0,
      label: `At most ${rules.maxCopies} copies of a card (main + sideboard)`,
      detail: overLimit.length ? overLimit.map((c) => `${c.card} ×${c.main + c.sideboard}`).join(', ') : 'OK',
    },
  ];
}

// Suspensions active on a given day (YYYY-MM-DD text compares correctly).
export function activeSuspensions(list, onIso) {
  return list.filter(
    (s) => s.suspended_on <= onIso && (s.lifted_on === null || s.lifted_on > onIso),
  );
}

// Cards in the deck that are suspended. If the pasted line had no set code,
// match on name alone and say so.
export function findSuspended(deck, suspensions, onIso) {
  const active = activeSuspensions(suspensions, onIso);
  const hits = [];
  for (const c of [...deck.leader, ...deck.base, ...deck.main, ...deck.sideboard]) {
    const s = active.find(
      (x) => key(x.card) === key(c.card) && (c.set === null || x.set === c.set),
    );
    if (s) hits.push({ card: s.card, set: s.set, count: c.count, nameOnly: c.set === null });
  }
  return hits;
}
