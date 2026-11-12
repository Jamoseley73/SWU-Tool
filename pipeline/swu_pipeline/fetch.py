"""Download raw data from swumetastats.com and save it untouched in pipeline/raw/.

Phase 2 will add cleaning on top of these raw files. Saving raw responses first
means we can re-run cleaning without hitting the API again.

Run from inside the pipeline/ folder:  python -m swu_pipeline.fetch
"""

import json
import sys
import time
import urllib.request

from .paths import RAW_DIR

BASE = "https://swumetastats.com"
# Generic client name: no personal details in requests.
USER_AGENT = "swu-deck-workbench-pipeline/0.1"

ENDPOINTS = {
    "openapi": "/openapi.json",
    "meta_boundaries": "/api/meta-boundaries",
    "archetypes": "/api/archetypes",
    "tournaments": "/api/tournaments",
}


def get_json(path: str):
    req = urllib.request.Request(BASE + path, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.loads(resp.read().decode("utf-8"))


def main() -> int:
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    failures = 0
    for name, path in ENDPOINTS.items():
        try:
            data = get_json(path)
        except Exception as exc:  # report and keep going with the others
            print(f"FAILED {name}: {exc}", file=sys.stderr)
            failures += 1
            continue
        (RAW_DIR / f"{name}.json").write_text(json.dumps(data, indent=2), encoding="utf-8")
        print(f"saved {name}")
        time.sleep(1)  # be polite to a free service
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
