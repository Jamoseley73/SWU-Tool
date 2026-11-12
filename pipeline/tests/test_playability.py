import json

import pytest

from swu_pipeline.paths import DATA_DIR
from swu_pipeline.playability import Playability, classify, percent_of_decks


@pytest.mark.parametrize(
    "pct,expected",
    [
        (2.0, Playability.SHOW),            # exactly 2% is shown
        (15.0, Playability.SHOW),
        (1.99, Playability.NEEDS_APPROVAL),
        (0.5, Playability.NEEDS_APPROVAL),  # exactly 0.5% goes to approval
        (0.49, Playability.EXCLUDED),
        (0.0, Playability.EXCLUDED),
    ],
)
def test_thresholds(pct, expected):
    assert classify(pct) == expected


def test_percent_of_decks():
    assert percent_of_decks(3, 150) == pytest.approx(2.0)


def test_config_matches_hard_rule():
    cfg = json.loads((DATA_DIR / "config.json").read_text(encoding="utf-8"))
    assert cfg["playability_percent"]["show_at_or_above"] == 2.0
    assert cfg["playability_percent"]["approval_at_or_above"] == 0.5


@pytest.mark.parametrize("bad", [-1, 101])
def test_bad_percent_fails(bad):
    with pytest.raises(ValueError):
        classify(bad)
