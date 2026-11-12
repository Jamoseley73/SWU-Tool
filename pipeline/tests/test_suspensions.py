from datetime import date

from swu_pipeline.suspensions import Suspension, is_suspended, load


def test_real_list_loads_and_has_all_five():
    names = {(s.card, s.set) for s in load()}
    assert names == {
        ("Cad Bane | Still Faster Than You", "ASH"),
        ("Chimaera", "ASH"),
        ("Koska Reeves", "ASH"),
        ("Neel", "ASH"),
        ("Aggressive Negotiations", "SEC"),
    }


def test_nov_9_cards_were_legal_the_day_before():
    susp = load()
    assert not is_suspended("Chimaera", "ASH", date(2026, 11, 8), susp)
    assert is_suspended("Chimaera", "ASH", date(2026, 11, 9), susp)


def test_cad_bane_suspended_since_aug_31():
    susp = load()
    assert not is_suspended("Cad Bane | Still Faster Than You", "ASH", date(2026, 8, 30), susp)
    assert is_suspended("Cad Bane | Still Faster Than You", "ASH", date(2026, 8, 31), susp)


def test_set_code_must_match():
    susp = load()
    assert not is_suspended("Chimaera", "SEC", date(2026, 11, 10), susp)


def test_lifted_card_is_legal_again():
    s = [Suspension("Test Card", "TST", date(2026, 1, 1), date(2026, 3, 1))]
    assert is_suspended("Test Card", "TST", date(2026, 2, 1), s)
    assert not is_suspended("Test Card", "TST", date(2026, 3, 1), s)
