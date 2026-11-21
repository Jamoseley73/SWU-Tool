// Likely range for a win rate (Wilson interval) and the playability filter.
// Mirrors pipeline/swu_pipeline/stats.py and playability.py.

const Z = { 0.9: 1.6448536269514722, 0.95: 1.959963984540054 };

export function wilson(wins, games, confidence = 0.9) {
  const z = Z[confidence];
  if (!z) throw new Error(`unsupported confidence ${confidence}`);
  if (!(games > 0)) throw new Error('games must be positive');
  if (wins < 0 || wins > games) throw new Error('wins must be between 0 and games');
  const p = wins / games;
  const z2 = z * z;
  const center = (p + z2 / (2 * games)) / (1 + z2 / games);
  const half = (z / (1 + z2 / games)) * Math.sqrt((p * (1 - p)) / games + z2 / (4 * games * games));
  return [Math.max(0, center - half), Math.min(1, center + half)];
}

export function classifyPlayability(pct, showAt = 2.0, approvalAt = 0.5) {
  if (pct >= showAt) return 'show';
  if (pct >= approvalAt) return 'needs_approval';
  return 'excluded';
}
