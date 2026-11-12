import json

from swu_pipeline.events import excluded_event_ids, keep_event, missing_ids


def test_entries_without_id_are_reported_not_silently_used(tmp_path):
    f = tmp_path / "ex.json"
    f.write_text(json.dumps({"events": [
        {"name": "Has id", "melee_id": 123},
        {"name": "No id yet", "melee_id": None},
    ]}))
    assert excluded_event_ids(f) == {"123"}
    assert missing_ids(f) == ["No id yet"]


def test_keep_event_compares_as_text():
    assert not keep_event(123, {"123"})
    assert keep_event("456", {"123"})
