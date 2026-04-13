# tests for probability_service.py
import pytest
from app.services.probability_service import (
    parse_prob, total_survival, avg_prob_for_type, cumulative_for_character,
    compute_hp, hp_fraction, hp_bar, load_fixed_map, set_fixed_prob,
    clear_character, resolve_encounter, EncounterResult
)

# Helpers

def _row(character, encounter, probability, outcome="miss", damage=0,
         algo="random", ts="2024-01-01T00:00:00"):
    return {
        "timestamp": ts, "character": character, "encounter": encounter,
        "probability": str(probability), "damage": str(damage),
        "outcome": outcome, "algo": algo, "note": "",
    }
 
class _AlwaysHit:
    def random(self): return 0.0
 
class _AlwaysMiss:
    def random(self): return 1.0




# tests for parse_prob()
class TestParseProb:
    def test_decimal_string(self):
        assert parse_prob("0.7") == pytest.approx(0.7)
 
    def test_percent_string(self):
        assert parse_prob("70%") == pytest.approx(0.7)
 
    def test_boundaries_valid(self):
        assert parse_prob("0") == 0.0
        assert parse_prob("1") == 1.0
        assert parse_prob("0%") == 0.0
        assert parse_prob("100%") == 1.0
 
    def test_integer_coerced(self):
        assert parse_prob(1) == 1.0
 
    def test_whitespace_stripped(self):
        assert parse_prob("  0.5  ") == pytest.approx(0.5)
 
    def test_above_one_raises(self):
        with pytest.raises(ValueError):
            parse_prob("1.1")
 
    def test_negative_raises(self):
        with pytest.raises(ValueError):
            parse_prob("-0.1")
 
    def test_over_100_percent_raises(self):
        with pytest.raises(ValueError):
            parse_prob("101%")
 
    def test_non_numeric_raises(self):
        with pytest.raises(ValueError):
            parse_prob("high")




# tests for total_survival()
class TestTotalSurvival:
    def test_empty_returns_one(self):
        assert total_survival([]) == 1.0
 
    def test_product_of_all_rows(self):
        rows = [_row("A", "e", 0.5), _row("A", "e", 0.8)]
        assert total_survival(rows) == pytest.approx(0.4)
 
    def test_single_row(self):
        assert total_survival([_row("A", "e", 0.3)]) == pytest.approx(0.3)




# tests for avg_prob_for_type()
class TestAvgProbForType:
    def test_no_match_returns_none_zero(self):
        avg, count = avg_prob_for_type([], "dragon")
        assert avg is None and count == 0
 
    def test_single_match(self):
        avg, count = avg_prob_for_type([_row("A", "dragon", 0.6)], "dragon")
        assert avg == pytest.approx(0.6) and count == 1
 
    def test_multiple_matches_averaged(self):
        rows = [_row("A", "dragon", 0.6), _row("B", "dragon", 0.4)]
        avg, count = avg_prob_for_type(rows, "dragon")
        assert avg == pytest.approx(0.5) and count == 2
 
    def test_case_insensitive(self):
        _, count = avg_prob_for_type([_row("A", "Dragon", 0.6)], "dragon")
        assert count == 1
 
    def test_meta_rows_excluded(self):
        rows = [_row("A", "dragon", 0.6), _row("A", "dragon", 0.99, algo="meta")]
        avg, count = avg_prob_for_type(rows, "dragon")
        assert count == 1 and avg == pytest.approx(0.6)




# tests for cumulative_for_character()
class TestCumulativeForCharacter:
    def test_no_rows_returns_one(self):
        assert cumulative_for_character([], "Alice") == 1.0
 
    def test_product_for_character(self):
        rows = [_row("Alice", "e", 0.9), _row("Alice", "e", 0.8)]
        assert cumulative_for_character(rows, "Alice") == pytest.approx(0.72)
 
    def test_other_characters_ignored(self):
        rows = [_row("Alice", "e", 0.9), _row("Bob", "e", 0.1)]
        assert cumulative_for_character(rows, "Alice") == pytest.approx(0.9)
 
    def test_meta_and_config_excluded(self):
        rows = [
            _row("Alice", "e", 0.9),
            _row("Alice", "e", 0.01, algo="meta"),
            _row("Alice", "e", 0.01, algo="config"),
        ]
        assert cumulative_for_character(rows, "Alice") == pytest.approx(0.9)






# tests for compute_hp() and hp_fraction()
class TestComputeHp:
    def test_no_rows_returns_start(self):
        assert compute_hp([], "Alice") == 100.0
 
    def test_miss_no_damage(self):
        assert compute_hp([_row("Alice", "e", 0.5, outcome="miss", damage=20)], "Alice") == 100.0
 
    def test_hit_reduces_hp(self):
        assert compute_hp([_row("Alice", "e", 0.5, outcome="hit", damage=30)], "Alice") == 70.0
 
    def test_hp_clamped_at_zero(self):
        assert compute_hp([_row("Alice", "e", 0.5, outcome="hit", damage=999)], "Alice") == 0.0
 
    def test_multiple_hits_accumulate(self):
        rows = [
            _row("Alice", "e", 0.5, outcome="hit", damage=20, ts="2024-01-01T00:00:01"),
            _row("Alice", "e", 0.5, outcome="hit", damage=30, ts="2024-01-01T00:00:02"),
        ]
        assert compute_hp(rows, "Alice") == 50.0
 
    def test_rows_applied_in_timestamp_order(self):
        """Insertion order must not matter — only timestamp order does."""
        rows = [
            _row("Alice", "e", 0.5, outcome="hit", damage=999, ts="2024-01-01T00:00:02"),
            _row("Alice", "e", 0.5, outcome="hit", damage=10,  ts="2024-01-01T00:00:01"),
        ]
        assert compute_hp(rows, "Alice") == 0.0
 
    def test_meta_rows_ignored(self):
        rows = [_row("Alice", "e", 0.5, outcome="hit", damage=999, algo="meta")]
        assert compute_hp(rows, "Alice") == 100.0
 
    def test_other_character_ignored(self):
        assert compute_hp([_row("Bob", "e", 0.5, outcome="hit", damage=50)], "Alice") == 100.0
 
    def test_custom_start_hp(self):
        rows = [_row("Alice", "e", 0.5, outcome="hit", damage=10)]
        assert compute_hp(rows, "Alice", start_hp=50.0) == 40.0
 
 
class TestHpFraction:
    def test_full_hp(self):
        assert hp_fraction([], "Alice") == pytest.approx(1.0)
 
    def test_half_hp(self):
        rows = [_row("Alice", "e", 0.5, outcome="hit", damage=50)]
        assert hp_fraction(rows, "Alice") == pytest.approx(0.5)
 
    def test_zero_start_hp_returns_zero(self):
        assert hp_fraction([], "Alice", start_hp=0) == 0.0





# tests for hp_bar()
class TestHpBar:
    def test_high_hp_green(self):
        assert "\033[92m" in hp_bar(1.0)
 
    def test_mid_hp_yellow(self):
        assert "\033[93m" in hp_bar(0.4)
 
    def test_low_hp_red(self):
        assert "\033[91m" in hp_bar(0.1)
 
    def test_percentage_shown(self):
        assert "75.0%" in hp_bar(0.75)
 
    def test_full_bar_filled(self):
        assert "██████████" in hp_bar(1.0, width=10)
 
    def test_empty_bar(self):
        assert "░░░░░░░░░░" in hp_bar(0.0, width=10)
 
    def test_boundary_60_is_green(self):
        assert "\033[92m" in hp_bar(0.6)
 
    def test_boundary_30_is_yellow(self):
        assert "\033[93m" in hp_bar(0.3)




# tests for load_fixed_map() and set_fixed_prob()
class TestFixedProbHelpers:
    def test_load_empty(self):
        assert load_fixed_map([]) == {}
 
    def test_load_ignores_non_meta(self):
        assert load_fixed_map([_row("A", "dragon", 0.6)]) == {}
 
    def test_load_parses_note(self):
        rows = [{"algo": "meta", "note": "fixed_prob|dragon=0.7", "character": "_system", "probability": "0.7"}]
        assert load_fixed_map(rows) == {"dragon": pytest.approx(0.7)}
 
    def test_load_normalises_key(self):
        rows = [{"algo": "meta", "note": "fixed_prob|Dragon=0.7", "character": "_system", "probability": "0.7"}]
        assert "dragon" in load_fixed_map(rows)
 
    def test_set_appends_meta_row(self):
        rows = []
        set_fixed_prob(rows, "dragon", 0.7)
        assert len(rows) == 1 and rows[0]["algo"] == "meta"
 
    def test_set_overwrites_existing(self):
        rows = []
        set_fixed_prob(rows, "dragon", 0.7)
        set_fixed_prob(rows, "dragon", 0.5)
        assert len(rows) == 1
        assert load_fixed_map(rows)["dragon"] == pytest.approx(0.5)
 
    def test_set_independent_encounters(self):
        rows = []
        set_fixed_prob(rows, "dragon", 0.7)
        set_fixed_prob(rows, "goblin", 0.4)
        result = load_fixed_map(rows)
        assert result["dragon"] == pytest.approx(0.7)
        assert result["goblin"] == pytest.approx(0.4)





# tests for clear_character()
class TestClearCharacter:
    def test_removes_non_meta_rows(self):
        rows = [_row("Alice", "e", 0.5), _row("Alice", "e", 0.8)]
        assert clear_character(rows, "Alice") == 2
        assert rows == []
 
    def test_preserves_meta_rows(self):
        rows = [
            _row("Alice", "e", 0.5),
            {"algo": "meta", "character": "Alice", "note": "fixed_prob|e=0.5", "probability": "0.5"},
        ]
        clear_character(rows, "Alice")
        assert len(rows) == 1 and rows[0]["algo"] == "meta"
 
    def test_preserves_other_characters(self):
        rows = [_row("Alice", "e", 0.5), _row("Bob", "e", 0.5)]
        clear_character(rows, "Alice")
        assert len(rows) == 1 and rows[0]["character"] == "Bob"
 
    def test_returns_zero_when_nothing_removed(self):
        assert clear_character([_row("Bob", "e", 0.5)], "Alice") == 0





# tests for resolve_encounter()
class TestResolveEncounter:
    def test_hit_reduces_hp(self):
        r = resolve_encounter("dragon", 0.9, 20.0, [], "Alice", rng=_AlwaysHit())
        assert r.outcome == "hit" and r.hp_after == pytest.approx(80.0)
 
    def test_miss_preserves_hp(self):
        r = resolve_encounter("dragon", 0.9, 20.0, [], "Alice", rng=_AlwaysMiss())
        assert r.outcome == "miss" and r.hp_after == pytest.approx(100.0)
 
    def test_hit_property(self):
        assert resolve_encounter("e", 0.9, 0, [], "A", rng=_AlwaysHit()).hit is True
        assert resolve_encounter("e", 0.9, 0, [], "A", rng=_AlwaysMiss()).hit is False
 
    def test_hp_before_reflects_history(self):
        rows = [_row("Alice", "e", 0.5, outcome="hit", damage=30)]
        r = resolve_encounter("dragon", 0.5, 10.0, rows, "Alice", rng=_AlwaysMiss())
        assert r.hp_before == pytest.approx(70.0)
 
    def test_hp_after_clamped_at_zero(self):
        r = resolve_encounter("dragon", 0.9, 999.0, [], "Alice", rng=_AlwaysHit())
        assert r.hp_after == 0.0
 
    def test_fields_populated(self):
        r = resolve_encounter("dragon", "0.8", 15.0, [], "Alice", rng=_AlwaysMiss())
        assert r.character == "Alice"
        assert r.encounter == "dragon"
        assert r.probability == pytest.approx(0.8)
        assert r.damage == 15.0
 
    def test_accepts_percent_probability(self):
        r = resolve_encounter("dragon", "80%", 10.0, [], "Alice", rng=_AlwaysMiss())
        assert r.probability == pytest.approx(0.8)
 
    def test_to_row_round_trip(self):
        r = resolve_encounter("dragon", 0.5, 10.0, [], "Alice", rng=_AlwaysHit())
        row = r.to_row(algo="test")
        assert row["character"] == "Alice"
        assert row["outcome"] == "hit"
        assert row["algo"] == "test"
        assert float(row["probability"]) == pytest.approx(0.5)
        assert float(row["damage"]) == pytest.approx(10.0)