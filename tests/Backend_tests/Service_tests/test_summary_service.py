# Tests for summary_service.py
import pytest

# Code from summary_service.py
def unique_characters(rows: list[dict]) -> list[str]:
    names = {
        r["character"] for r in rows if r.get("algo") != "meta" and r.get("character")
    }
    return sorted(names)
 
 
def character_summaries(rows: list[dict]) -> list[tuple[str, float, int]]:
    by_name: dict[str, list[float]] = {}
    for r in rows:
        if r.get("algo") == "meta":
            continue
        name = r["character"]
        by_name.setdefault(name, []).append(float(r["probability"]))
    out: list[tuple[str, float, int]] = []
    for name, probs in by_name.items():
        total = 1.0
        for p in probs:
            total *= p
        out.append((name, total, len(probs)))
    return sorted(out, key=lambda t: t[0])



# Fixtures
TYPICAL_ROWS = [
    {"character": "Alice", "algo": "dtw",  "probability": "0.9"},
    {"character": "Alice", "algo": "cosine", "probability": "0.8"},
    {"character": "Bob",   "algo": "dtw",  "probability": "0.5"},
    {"character": "Bob",   "algo": "meta", "probability": "0.99"},  # failing test
]


# tests for unique_characters()
class TestUniqueCharacters:
    def test_returns_sorted_names(self):
        rows = [
            {"character": "Zara", "algo": "dtw"},
            {"character": "Alice", "algo": "dtw"},
            {"character": "Bob", "algo": "dtw"},
        ]
        assert unique_characters(rows) == ["Alice", "Bob", "Zara"]
 
    def test_meta_rows_excluded(self):
        rows = [
            {"character": "Alice", "algo": "dtw"},
            {"character": "Ghost", "algo": "meta"},
        ]
        assert unique_characters(rows) == ["Alice"]
 
    def test_duplicates_collapsed(self):
        rows = [
            {"character": "Alice", "algo": "dtw"},
            {"character": "Alice", "algo": "cosine"},
        ]
        assert unique_characters(rows) == ["Alice"]
 
    def test_empty_input(self):
        assert unique_characters([]) == []
 
    def test_all_meta_rows_returns_empty(self):
        rows = [{"character": "Ghost", "algo": "meta"}]
        assert unique_characters(rows) == []
 
    def test_missing_character_key_excluded(self):
        rows = [
            {"algo": "dtw"},                        # missing key character
            {"character": "", "algo": "dtw"},       # falsy character
            {"character": "Alice", "algo": "dtw"},
        ]
        assert unique_characters(rows) == ["Alice"]




# tests for character_summaries()
class TestCharacterSummaries:
    def test_returns_list_of_tuples(self):
        result = character_summaries(TYPICAL_ROWS)
        assert isinstance(result, list)
        assert all(isinstance(t, tuple) and len(t) == 3 for t in result)
 
    def test_sorted_alphabetically(self):
        result = character_summaries(TYPICAL_ROWS)
        names = [t[0] for t in result]
        assert names == sorted(names)
 
    def test_meta_rows_excluded(self):
        result = character_summaries(TYPICAL_ROWS)
        names = [t[0] for t in result]
        assert "meta" not in names
        # Bob's meta row should NOT inflate his count
        bob = next(t for t in result if t[0] == "Bob")
        assert bob[2] == 1  # only 1 non-meta row
 
    def test_probability_product(self):
        result = character_summaries(TYPICAL_ROWS)
        alice = next(t for t in result if t[0] == "Alice")
        assert alice[1] == pytest.approx(0.9 * 0.8)
        assert alice[2] == 2
 
    def test_single_probability_unchanged(self):
        rows = [{"character": "Solo", "algo": "dtw", "probability": "0.7"}]
        result = character_summaries(rows)
        assert result == [("Solo", pytest.approx(0.7), 1)]
 
    def test_empty_input(self):
        assert character_summaries([]) == []
 
    def test_all_meta_rows_returns_empty(self):
        rows = [{"character": "Ghost", "algo": "meta", "probability": "0.5"}]
        assert character_summaries(rows) == []
 
    def test_probability_coerced_from_string(self):
        rows = [{"character": "Alice", "algo": "dtw", "probability": "0.5"}]
        result = character_summaries(rows)
        assert isinstance(result[0][1], float)
 
    def test_count_reflects_non_meta_rows_only(self):
        rows = [
            {"character": "Alice", "algo": "a", "probability": "0.9"},
            {"character": "Alice", "algo": "b", "probability": "0.8"},
            {"character": "Alice", "algo": "meta", "probability": "0.99"},
        ]
        result = character_summaries(rows)
        assert result[0][2] == 2