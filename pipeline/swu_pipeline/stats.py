"""Win-rate math.

The "likely range" shown next to every win rate is a 90% Wilson interval:
a standard way to say "given this few games, the true win rate is probably
between X% and Y%". It behaves well even with small samples, unlike the
simple "win rate plus or minus a margin" formula.
"""

from math import sqrt
from statistics import NormalDist


def z_for_confidence(confidence: float) -> float:
    """How many standard deviations wide a two-sided range must be.

    For 90% confidence this is about 1.645.
    """
    return NormalDist().inv_cdf(0.5 + confidence / 2)


def wilson_interval(wins: int, games: int, confidence: float = 0.90) -> tuple[float, float]:
    """Return (low, high) as fractions between 0 and 1.

    Raises ValueError for impossible inputs, so bad data fails loudly
    instead of producing a misleading number.
    """
    if games <= 0:
        raise ValueError("games must be positive")
    if wins < 0 or wins > games:
        raise ValueError("wins must be between 0 and games")

    z = z_for_confidence(confidence)
    p = wins / games
    z2 = z * z
    center = (p + z2 / (2 * games)) / (1 + z2 / games)
    half_width = (z / (1 + z2 / games)) * sqrt(p * (1 - p) / games + z2 / (4 * games * games))
    return max(0.0, center - half_width), min(1.0, center + half_width)
