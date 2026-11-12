# Build phases

- [x] **0. Setup** — folder layout, project guide, data files for suspensions/config.
- [~] **1. Hello-world deployed** — site builds locally; needs a GitHub repo to go live.
- [ ] **2. Data pipeline + tests** — fetch from swumetastats + SWU Stats, clean, filter by event, write `data/*.json`.
- [ ] **3. Answer grids for all top decks** — key cards × answer cards (✓ / ✓* / S), matchups with likely ranges, deck shape, sideboard. Template: "Answer Grid: Ahsoka Blue" mockup.
- [ ] **4. Paste-your-deck** — exposure check + answer finder.
- [ ] **5. Matchup log + side plan sheet** — stored in the browser, export/import file.
- [ ] **6. Launch prep** — methodology page, error-report link, free analytics, credits.

## Open questions for the owner

1. **Minimum sample sizes**: below how many games/decks should a number be hidden? (Needed for rule 7.)
2. **Excluded events**: the Melee event id for the Oct 6, 2026 Galactic Championship Last Chance Qualifier.
3. **Homeworlds switch**: how many post-Nov 9 events (or decks) count as "enough" to switch from ASH to HMW data?
4. **Answer-grid symbols**: exact meaning of ✓ vs ✓* vs S (my guess: ✓ = clean answer, ✓* = answer with a condition, S = sideboard only — please confirm).
