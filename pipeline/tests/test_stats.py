import pytest

from swu_pipeline.stats import wilson_interval, z_for_confidence


def test_z_for_90_percent():
    assert z_for_confidence(0.90) == pytest.approx(1.6449, abs=1e-4)


def test_known_value_7_of_10():
    # Reference value for 7 wins in 10 games, 90% Wilson interval.
    low, high = wilson_interval(7, 10)
    assert low == pytest.approx(0.4417, abs=1e-4)
    assert high == pytest.approx(0.8731, abs=1e-4)


def test_range_contains_observed_rate():
    low, high = wilson_interval(13, 20)
    assert low < 13 / 20 < high


def test_more_games_means_narrower_range():
    low_small, high_small = wilson_interval(6, 10)
    low_big, high_big = wilson_interval(60, 100)
    assert (high_big - low_big) < (high_small - low_small)


def test_edges_stay_between_0_and_1():
    assert wilson_interval(0, 5)[0] == 0.0
    assert wilson_interval(5, 5)[1] == pytest.approx(1.0)


@pytest.mark.parametrize("wins,games", [(0, 0), (-1, 5), (6, 5)])
def test_bad_input_fails_loudly(wins, games):
    with pytest.raises(ValueError):
        wilson_interval(wins, games)
