# SWU Deck Workbench: Project Guide for Claude Code

Claude Code reads this file automatically at the start of every session in this folder.

## Who you're working with

- The owner (Jacob) is new to programming. Explain every programming term in plain words, in parentheses, the first time you use it.
- No advanced statistics terms without a plain explanation.
- The owner is an experienced competitive Star Wars: Unlimited (SWU) player. Use competitive terms freely.
- Whenever a card is mentioned, include its 3-letter set code, e.g. Pre Vizsla (ASH).
- Never act as if you know something you don't. Ask first.

## Hard rules

1. **$0 to run.** No paid hosting, databases, APIs or AI calls. Before adding any service, check that it's free and say so.
2. **Statistics, not suggestions.** The site never tells users to add or cut cards. It shows data; players decide.
3. **Selective interpretation only.**
   - Key cards per deck are picked by the owner (stored in `data/key_cards.json`).
   - Answers to key cards come from mechanical rules based on card text and stats.
   - Each rule has an automated test.
4. **Playability filter** (share of decks running the card, main deck or sideboard, in the current window):
   - ≥ 2% → may be shown.
   - 0.5–2% → goes on a list for the owner to approve; never auto-shown.
   - < 0.5% → excluded.
   - Thresholds live in `data/config.json`; logic in `pipeline/swu_pipeline/playability.py`.
5. **Premier format only** (Eternal later).
   - Suspensions are data with dates in `data/suspensions.json` (cards can return at set releases).
   - Suspended cards are never shown as answers or key cards.
   - Current window: **Homeworlds (HMW), "post-Chimaera ban"** (the owner's name for the Nov 9, 2026 four-card suspension). Switched from Ashes (ASH) on Nov 20, 2026 with 12 HMW events completed. Never mix in ASH-window events.
   - Icons 2027 released Nov 20, 2026. Until the owner confirms how it affects the Premier card pool, don't assume.
6. **One set's meta at a time.** Never mix sets. Exclude events played on a different card pool (list in `data/excluded_events.json`). Filter by event, not only by date.
7. **Show sample sizes and likely ranges** (90% Wilson interval). Hide numbers below minimum sample sizes.
8. **Card-level win rates must pass a shuffle test** before being shown. They did not pass on ASH data (too few matches).

## Data sources (free, credit both on every page)

- swumetastats.com API (OpenAPI at `/openapi.json`): Melee tournament data.
  `/api/meta-boundaries`, `/api/archetypes`, `/api/archetypes/{leader}/{base}`, `/api/decklists` (max 100), `/api/tournaments`, `/api/cards?type=all&includeUsage=true`.
- SWU Stats (swustats.net/TCGEngine): `GetMeleeTournaments.php`, `GetMeleeTournament.php?id=&include_matchups=1`.
  Join to swumetastats decklists by Melee event id + normalized player name (~89% matched).
- **Do NOT scrape Melee.gg**: its terms ban automated access.

## Ruling notes

See `docs/rulings.md`.

## Architecture

- `site/` — static site built with Vite, deployed to GitHub Pages. Desktop first; mobile later.
  - `index.html` = home page = **Deck Check** (paste-your-deck tool, the main feature).
  - `answer-grid.html` = **Answer Grids** tab.
  - Shared header/nav/footer in `site/src/layout.js`; logic in `site/src/lib/` with tests in `site/tests/` (`npm test`).
  - Until real HMW data exists, pages use `data/sample/*.json`: made-up cards, always shown with a "Sample data" banner. Never present sample data as real.
- `pipeline/` — Python code that fetches and cleans data, writes `data/*.json`. Runs nightly on GitHub Actions.
- `data/` — JSON files the site reads. Hand-edited files (suspensions, key cards, config) live here too.
- `docs/` — rulings, open questions, build phases.
- User data (decks, matchup logs) stays in browser storage + export/import file. No accounts.
