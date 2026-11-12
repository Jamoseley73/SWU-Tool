"""Premier suspended list (hard rule 5), read from data/suspensions.json."""

import json
from dataclasses import dataclass
from datetime import date
from pathlib import Path

from .paths import DATA_DIR


@dataclass(frozen=True)
class Suspension:
    card: str
    set: str
    suspended_on: date
    lifted_on: date | None

    def active_on(self, day: date) -> bool:
        return self.suspended_on <= day and (self.lifted_on is None or day < self.lifted_on)


def load(path: Path = DATA_DIR / "suspensions.json") -> list[Suspension]:
    raw = json.loads(Path(path).read_text(encoding="utf-8"))
    out = []
    for s in raw["suspensions"]:
        out.append(
            Suspension(
                card=s["card"],
                set=s["set"],
                suspended_on=date.fromisoformat(s["suspended_on"]),
                lifted_on=date.fromisoformat(s["lifted_on"]) if s["lifted_on"] else None,
            )
        )
    return out


def is_suspended(card: str, set_code: str, day: date, suspensions: list[Suspension]) -> bool:
    """True if this exact card (name + set) is suspended on the given day."""
    return any(
        s.card == card and s.set == set_code and s.active_on(day) for s in suspensions
    )
