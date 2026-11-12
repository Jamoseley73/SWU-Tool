"""Event filtering (hard rule 6): one set's meta at a time, filtered by event."""

import json
from pathlib import Path

from .paths import DATA_DIR


def excluded_event_ids(path: Path = DATA_DIR / "excluded_events.json") -> set[str]:
    """Melee event ids to drop. Entries without an id yet are skipped (and reported)."""
    raw = json.loads(Path(path).read_text(encoding="utf-8"))
    return {str(e["melee_id"]) for e in raw["events"] if e.get("melee_id") is not None}


def missing_ids(path: Path = DATA_DIR / "excluded_events.json") -> list[str]:
    """Names of excluded events whose Melee id hasn't been filled in."""
    raw = json.loads(Path(path).read_text(encoding="utf-8"))
    return [e["name"] for e in raw["events"] if e.get("melee_id") is None]


def keep_event(melee_id: str | int, excluded: set[str]) -> bool:
    return str(melee_id) not in excluded
