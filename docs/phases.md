# Build phases

- [x] **0. Setup** — folder layout, project guide, data files for suspensions/config.
- [~] **1. Hello-world deployed** — pushed to Jamoseley73/SWU-Tool; goes live once the repo is public and Pages is on.
- [ ] **2. Data pipeline + tests** — fetch HMW (post-Chimaera ban) data from swumetastats + SWU Stats, clean, filter by event, write `data/*.json`.
- [ ] **3. Answer grids for all top decks** — layout shell built with sample data (Answer Grids tab).
- [ ] **4. Paste-your-deck** — layout shell built on the home page (Deck Check): parser + legality checks are real; exposure/answer finder use sample data.
- [ ] **5. Matchup log + side plan sheet** — stored in the browser, export/import file.
- [ ] **6. Launch prep** — methodology page, error-report link, free analytics, credits, mobile layout.

## Decisions log

- **Nov 20, 2026:** Switched the active window from Ashes (ASH, post-Cad ban) to Homeworlds (HMW, post-Chimaera ban). 12 HMW events completed at the time.
- **Nov 20, 2026:** Home page = Deck Check (paste-your-deck). Answer Grids is its own tab. Desktop first, mobile later.

## Open questions for the owner

1. **Minimum sample sizes**: below how many games/decks should a number be hidden? (Needed for rule 7.)
2. **Excluded events**: the Melee event id for the Oct 6, 2026 Galactic Championship Last Chance Qualifier. (Less urgent now that the window is HMW-only.)
3. **Icons 2027 (released Nov 20, 2026)**: does it add cards to the Premier pool? If yes, are events after Nov 20 a different card pool from the first 12 HMW events (rule 6)?
4. **Answer-grid symbols**: my guess is ✓ = clean answer, ✓* = answer with a condition, S = sideboard only. Please confirm.
5. **Decklist formats** to accept in Deck Check: currently plain text (`3 Card Name`, with Leader/Base/Deck/Sideboard headers). Which exports do players actually paste (SWUDB, Melee, Karabast, other)?
6. **Deck legality checks** used in Deck Check — please confirm for Premier: 1 leader, 1 base, at least 50 main-deck cards, at most 10 sideboard cards, at most 3 copies of a card across main deck + sideboard.
