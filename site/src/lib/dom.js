// Tiny helper for building page elements safely (text is never parsed as HTML).
//   h('div', { class: 'card' }, 'Hello', h('b', {}, 'world'))
export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs ?? {})) {
    if (v === null || v === undefined || v === false) continue;
    if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of children.flat()) {
    if (c === null || c === undefined || c === false) continue;
    el.append(c instanceof Node ? c : String(c));
  }
  return el;
}

export async function loadJson(path) {
  const res = await fetch(`./${path}`);
  if (!res.ok) throw new Error(`Could not load ${path} (${res.status})`);
  return res.json();
}

export async function loadText(path) {
  const res = await fetch(`./${path}`);
  if (!res.ok) throw new Error(`Could not load ${path} (${res.status})`);
  return res.text();
}

export function todayIso() {
  const t = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`;
}

export function formatDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export const pct = (x, digits = 1) => `${(x * 100).toFixed(digits)}%`;

export const cardLabel = (c) => `${c.card} (${c.set})`;

// Symbols for answer-grid cells. Meanings are open question 4 in docs/phases.md.
export const MARKS = {
  yes: { symbol: '✓', label: 'Answers it', cls: 'mark-yes' },
  cond: { symbol: '✓*', label: 'Answers it with a condition', cls: 'mark-cond' },
  side: { symbol: 'S', label: 'Sideboard answer', cls: 'mark-side' },
};
