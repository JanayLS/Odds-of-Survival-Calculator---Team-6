# tests for fixed_prob_service.py
import pytest
from unittest.mock import patch
from datetime import datetime

# Original code - seperate for the sake of keeping things seperate
def _norm(name: str) -> str:
    return name.strip().lower()
 
 
def load_fixed_map(rows: list[dict]) -> dict[str, float]:
    fixed: dict[str, float] = {}
    for r in rows:
        if r.get("algo") == "config" and r.get("note", "").startswith("fixed|"):
            parts = dict(seg.split("=", 1) for seg in r["note"].split("|")[1:])
            name = _norm(parts.get("encounter", ""))
            if name and "p" in parts:
                try:
                    fixed[name] = float(parts["p"])
                except ValueError:
                    pass
    return fixed
 
 
def set_fixed_prob(rows: list[dict], encounter_name: str, p: float) -> None:
    rows.append(
        {
            "timestamp": datetime.now().isoformat(timespec="seconds"),
            "character": "",
            "encounter": encounter_name,
            "probability": "1.0",
            "algo": "config",
            "note": f"fixed|encounter={encounter_name}|p={p:.6f}",
        }
    )
 
 
def clear_character(rows: list[dict], name: str) -> int:
    before = len(rows)
    rows[:] = [r for r in rows if r["character"] != name or r.get("algo") == "meta"]
    return before - len(rows)




# Helpers
def _config_row(encounter, p, character=""):
    return {
        "algo": "config",
        "note": f"fixed|encounter={encounter}|p={p:.6f}",
        "character": character,   # ← add this
        "probability": "1.0",
    }
 
def _regular_row(character, encounter="dragon", algo="random"):
    return {"character": character, "encounter": encounter, "algo": algo}






# tests for load_fixed_map()
class TestLoadFixedMap:
    def test_empty_rows(self):
        assert load_fixed_map([]) == {}
 
    def test_parses_well_formed_config_row(self):
        result = load_fixed_map([_config_row("dragon", 0.7)])
        assert result == {"dragon": pytest.approx(0.7)}
 
    def test_key_is_lowercased(self):
        result = load_fixed_map([_config_row("Dragon", 0.7)])
        assert "dragon" in result
        assert "Dragon" not in result
 
    def test_key_is_stripped(self):
        row = {"algo": "config", "note": "fixed|encounter= goblin |p=0.5", "character": ""}
        result = load_fixed_map([row])
        assert "goblin" in result
 
    def test_multiple_encounters(self):
        rows = [_config_row("dragon", 0.7), _config_row("goblin", 0.4)]
        result = load_fixed_map(rows)
        assert result["dragon"] == pytest.approx(0.7)
        assert result["goblin"] == pytest.approx(0.4)
 
    def test_last_entry_wins_for_duplicate_encounter(self):
        rows = [_config_row("dragon", 0.7), _config_row("dragon", 0.5)]
        result = load_fixed_map(rows)
        assert result["dragon"] == pytest.approx(0.5)
 
    def test_non_config_rows_ignored(self):
        rows = [
            {"algo": "random", "note": "fixed|encounter=dragon|p=0.7", "character": ""},
            {"algo": "meta",   "note": "fixed|encounter=dragon|p=0.7", "character": ""},
        ]
        assert load_fixed_map(rows) == {}
 
    def test_config_row_without_fixed_prefix_ignored(self):
        row = {"algo": "config", "note": "some_other_note", "character": ""}
        assert load_fixed_map([row]) == {}
 
    def test_missing_p_key_skipped(self):
        row = {"algo": "config", "note": "fixed|encounter=dragon", "character": ""}
        assert load_fixed_map([row]) == {}
 
    def test_missing_encounter_key_skipped(self):
        row = {"algo": "config", "note": "fixed|p=0.7", "character": ""}
        assert load_fixed_map([row]) == {}
 
    def test_empty_encounter_name_skipped(self):
        row = {"algo": "config", "note": "fixed|encounter=|p=0.7", "character": ""}
        assert load_fixed_map([row]) == {}
 
    def test_non_numeric_p_skipped(self):
        row = {"algo": "config", "note": "fixed|encounter=dragon|p=high", "character": ""}
        assert load_fixed_map([row]) == {}
 
    def test_p_value_with_equals_sign_in_value(self):
        """partition on '=' means a value like '0.70000' survives intact."""
        row = {"algo": "config", "note": "fixed|encounter=dragon|p=0.700000", "character": ""}
        result = load_fixed_map([row])
        assert result["dragon"] == pytest.approx(0.7)






# tests for set_fixed_prob()
class TestSetFixedProb:
    def test_appends_one_row(self):
        rows = []
        set_fixed_prob(rows, "dragon", 0.7)
        assert len(rows) == 1
 
    def test_row_algo_is_config(self):
        rows = []
        set_fixed_prob(rows, "dragon", 0.7)
        assert rows[0]["algo"] == "config"
 
    def test_note_format(self):
        rows = []
        set_fixed_prob(rows, "dragon", 0.7)
        assert rows[0]["note"] == "fixed|encounter=dragon|p=0.700000"
 
    def test_probability_field_is_neutral(self):
        rows = []
        set_fixed_prob(rows, "dragon", 0.7)
        assert rows[0]["probability"] == "1.0"
 
    def test_character_field_is_empty(self):
        rows = []
        set_fixed_prob(rows, "dragon", 0.7)
        assert rows[0]["character"] == ""
 
    def test_encounter_field_matches_name(self):
        rows = []
        set_fixed_prob(rows, "goblin", 0.4)
        assert rows[0]["encounter"] == "goblin"
 
    def test_timestamp_is_iso_format(self):
        rows = []
        set_fixed_prob(rows, "dragon", 0.7)
        # should not raise
        datetime.fromisoformat(rows[0]["timestamp"])
 
    def test_does_not_deduplicate(self):
        """set_fixed_prob always appends; deduplication is the caller's job."""
        rows = []
        set_fixed_prob(rows, "dragon", 0.7)
        set_fixed_prob(rows, "dragon", 0.5)
        assert len(rows) == 2
 
    def test_round_trips_through_load_fixed_map(self):
        rows = []
        set_fixed_prob(rows, "dragon", 0.7)
        assert load_fixed_map(rows)["dragon"] == pytest.approx(0.7)
 
    def test_p_formatted_to_six_decimal_places(self):
        rows = []
        set_fixed_prob(rows, "dragon", 1/3)
        assert "0.333333" in rows[0]["note"]





# tests for clear_character()
class TestClearCharacter:

    
    def test_removes_regular_rows_for_character(self):
        rows = [_regular_row("Alice"), _regular_row("Alice")]
        removed = clear_character(rows, "Alice")
        assert removed == 2
        assert rows == []
 
    def test_preserves_other_characters(self):
        rows = [_regular_row("Alice"), _regular_row("Bob")]
        clear_character(rows, "Alice")
        assert len(rows) == 1
        assert rows[0]["character"] == "Bob"
 
    def test_preserves_meta_rows_for_character(self):
        rows = [
            _regular_row("Alice", algo="random"),
            _regular_row("Alice", algo="meta"),
        ]
        clear_character(rows, "Alice")
        assert len(rows) == 1
        assert rows[0]["algo"] == "meta"
 
    def test_config_rows_for_character_are_removed(self):
        """algo='config' is not 'meta', so config rows are cleared."""
        rows = [_regular_row("Alice", algo="config")]
        removed = clear_character(rows, "Alice")
        assert removed == 1
        assert rows == []
 
    def test_returns_zero_when_nothing_removed(self):
        rows = [_regular_row("Bob")]
        assert clear_character(rows, "Alice") == 0
 
    def test_empty_rows(self):
        rows = []
        assert clear_character(rows, "Alice") == 0
 
    def test_mutates_in_place(self):
        rows = [_regular_row("Alice")]
        original_ref = rows
        clear_character(rows, "Alice")
        assert rows is original_ref
        assert rows == []