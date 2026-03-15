"""Tests for create_encounter() in main.py."""

import pytest
import random
import tempfile
from unittest.mock import MagicMock, patch

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.services.probability_service import EncounterResult, resolve_encounter
from app.storage.journal_store import JournalStore
from app.cli import create_encounter


@pytest.fixture
def session(tmp_path):
    """Real JournalStore backed by a temp SQLite DB, pre-initialised."""
    db = JournalStore(db_path=str(tmp_path / "test_journal.db"))
    db.create_new_journal("testpass")
    s = MagicMock()
    s.rows = []
    s.password = "testpass"
    s.store = db
    return s


# Deterministic rng: random() returns 0.5, so any p > 0.5 → hit, p < 0.5 → miss
def fixed_rng(val):
    rng = MagicMock()
    rng.random.return_value = val
    return rng


# TESTS

def test_negative_damage_raises(session):
    with pytest.raises(ValueError, match="Damage must be >= 0"):
        create_encounter(session, "Hero", "goblin", "random", -1)


def test_fixed_mode_unknown_encounter_no_prob_raises(session):
    with pytest.raises(ValueError, match="No saved probability"):
        create_encounter(session, "Hero", "new_encounter", "fixed", 10)


def test_random_mode_records_algo_random(session):
    with patch("main.sample_prob", return_value=0.6), \
         patch("main.resolve_encounter", return_value=resolve_encounter(
             "goblin", 0.6, 10, [], "Hero", rng=fixed_rng(0.3)  # hit
         )):
        create_encounter(session, "Hero", "goblin", "random", 10)
    assert session.rows[-1]["algo"] == "random"


def test_fixed_mode_saves_and_reuses_probability(session):
    """First call saves p; second call reuses it without re-prompting."""
    create_encounter(session, "Hero", "troll", "fixed", 0, fixed_probability=0.7)
    create_encounter(session, "Hero", "troll", "fixed", 0)  # should not raise
    # Both rows should use the same probability
    encounter_rows = [r for r in session.rows if r.get("encounter") == "troll"]
    probs = {float(r["probability"]) for r in encounter_rows}
    assert probs == {0.7}


def test_row_appended_to_session_and_store(session):
    with patch("main.sample_prob", return_value=0.6), \
         patch("main.resolve_encounter", return_value=resolve_encounter(
             "goblin", 0.6, 10, [], "Hero", rng=fixed_rng(0.3)
         )):
        create_encounter(session, "Hero", "goblin", "random", 10)
    assert len(session.rows) == 1
    session.store.append_row.assert_called_once_with(session.password, session.rows[0])


def test_returns_resolve_encounter_result(session):
    expected = resolve_encounter("goblin", 0.6, 10, [], "Hero", rng=fixed_rng(0.3))
    with patch("main.sample_prob", return_value=0.6), \
         patch("main.resolve_encounter", return_value=expected):
        result = create_encounter(session, "Hero", "goblin", "random", 10)
    assert result is expected
