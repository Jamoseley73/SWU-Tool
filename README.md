# SWU-Tool

**SWU Deck Workbench**: competitive Premier statistics for Star Wars: Unlimited. Statistics, not suggestions.

Tournament data from [swumetastats.com](https://swumetastats.com) and [SWU Stats](https://swustats.net).

## Folders

| Folder | What's in it |
|---|---|
| `site/` | The website (built with Vite) |
| `pipeline/` | Python code that fetches and cleans tournament data |
| `data/` | JSON files the website reads, including hand-edited ones (suspensions, key cards, settings) |
| `docs/` | Rulings, build phases, open questions |
| `.github/workflows/` | Automatic jobs GitHub runs for free: test + deploy, nightly data |

## Run the site on your computer

```bash
cd site
npm install
npm run dev
```

Then open the address it prints (usually http://localhost:5173).

## Run the pipeline tests

Needs Python 3.12+ (free from python.org).

```bash
cd pipeline
pip install -r requirements.txt
pytest
```

## Common edits

- **A card gets suspended or comes back:** edit `data/suspensions.json`.
- **Pick key cards for a deck:** edit `data/key_cards.json`.
- **Exclude an event from a different card pool:** add it to `data/excluded_events.json`.