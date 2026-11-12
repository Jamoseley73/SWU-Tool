"""Playability filter (hard rule 4).

Decides whether an answer card is common enough to show, based on the
percent of decks in the current window that run it (main deck or sideboard).
"""

from enum import Enum

DEFAULT_SHOW_AT = 2.0
DEFAULT_APPROVAL_AT = 0.5


class Playability(str, Enum):
    SHOW = "show"                       # >= 2%: may appear automatically
    NEEDS_APPROVAL = "needs_approval"   # 0.5% to under 2%: owner must approve
    EXCLUDED = "excluded"               # under 0.5%: never shown


def classify(
    percent_of_decks: float,
    show_at: float = DEFAULT_SHOW_AT,
    approval_at: float = DEFAULT_APPROVAL_AT,
) -> Playability:
    if percent_of_decks < 0 or percent_of_decks > 100:
        raise ValueError("percent_of_decks must be between 0 and 100")
    if percent_of_decks >= show_at:
        return Playability.SHOW
    if percent_of_decks >= approval_at:
        return Playability.NEEDS_APPROVAL
    return Playability.EXCLUDED


def percent_of_decks(decks_with_card: int, total_decks: int) -> float:
    """Share of decks (0-100) that run a card in the main deck or sideboard."""
    if total_decks <= 0:
        raise ValueError("total_decks must be positive")
    if decks_with_card < 0 or decks_with_card > total_decks:
        raise ValueError("decks_with_card must be between 0 and total_decks")
    return 100 * decks_with_card / total_decks
