// Loads the hand-edited data files and fills in the page.

async function loadJson(name) {
  const res = await fetch(`./${name}`);
  if (!res.ok) throw new Error(`Could not load ${name} (${res.status})`);
  return res.json();
}

function formatDate(iso) {
  // Parse as a plain calendar date so time zones can't shift it a day.
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function todayIso() {
  const t = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`;
}

// A card is suspended on a date if it was suspended on/before that date
// and not yet lifted. Mirrors pipeline/swu_pipeline/suspensions.py.
function activeSuspensions(list, onIso) {
  return list.filter(
    (s) => s.suspended_on <= onIso && (s.lifted_on === null || s.lifted_on > onIso),
  );
}

async function main() {
  const [config, susp] = await Promise.all([
    loadJson('config.json'),
    loadJson('suspensions.json'),
  ]);

  document.getElementById('window-label').textContent =
    `${config.active_set} · ${config.active_window_label}`;
  document.getElementById('window-text').textContent =
    `Format: ${config.format[0].toUpperCase()}${config.format.slice(1)}. ` +
    `Statistics use one set's meta at a time and never mix card pools.`;

  const rows = activeSuspensions(susp.suspensions, todayIso())
    .sort((a, b) => a.suspended_on.localeCompare(b.suspended_on))
    .map((s) => {
      const tr = document.createElement('tr');
      for (const text of [s.card, s.set, formatDate(s.suspended_on)]) {
        const td = document.createElement('td');
        td.textContent = text;
        tr.appendChild(td);
      }
      return tr;
    });
  document.getElementById('suspensions').replaceChildren(...rows);
}

main().catch((err) => {
  document.getElementById('window-label').textContent = 'error';
  document.getElementById('window-text').textContent = err.message;
});
