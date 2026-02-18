from app.services.profile_service import load_user_profile, calculate_stats


def test_load_user_profile_from_meta_row():
    rows = [
        {
            "algo": "meta",
            "character": "Alice",
            "note": "profile|location=NC|email=a@b.com",
        },
    ]
    prof = load_user_profile(rows)
    assert prof.name == "Alice"
    assert prof.location == "NC"
    assert prof.email == "a@b.com"


def test_load_user_profile_defaults_when_missing():
    rows = [{"algo": "sim", "character": "Bob", "note": ""}]
    prof = load_user_profile(rows)
    assert prof.name == "Unknown"


def test_calculate_stats_counts_only_real_encounters(monkeypatch):
    rows = [
        {
            "algo": "meta",
            "character": "Alice",
            "note": "profile|location=NC|email=a@b.com",
        },
        {
            "algo": "config",
            "character": "Alice",
            "note": "fixed|encounter=goblin|p=0.5",
        },
        {"algo": "sim", "character": "Alice", "note": "", "encounter": "goblin"},
        {"algo": "sim", "character": "Alice", "note": "", "encounter": "dragon"},
    ]

    # Avoid depending on compute_hp internals in this unit test
    import app.services.profile_service as ps

    monkeypatch.setattr(ps, "compute_hp", lambda *args, **kwargs: 77.7)

    stats = calculate_stats(rows, "Alice")
    assert stats["total_encounters"] == 2
    assert stats["survival_rate"] == 77.7
