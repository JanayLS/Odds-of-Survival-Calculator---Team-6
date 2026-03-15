"""
probability_service.py
==============
Self-contained probability module for encounter/HP calculations.

Can be imported independently of the journal app:

    from probability import (
        EncounterResult,
        resolve_encounter,
        compute_hp,
        hp_bar,
        # ... etc.
    )

Public API
----------
Data classes
    EncounterResult         – outcome of a single resolved encounter
Probability helpers
    parse_prob(s)           – parse "0.7" or "70%" → float; raises ValueError on bad input
    sample_prob(enc_name)   – random float in [0.55, 0.85]
    total_survival(rows)    – product of all logged probabilities
    avg_prob_for_type(rows, enc_type) – (avg_prob, count) for one encounter type; (None, 0) if none
    cumulative_for_character(rows, name) – product of all probs for one character

HP helpers
    compute_hp(rows, name, start_hp) – replay hit history → current HP
    hp_fraction(rows, name, start_hp) – current HP as 0.0–1.0 fraction
    hp_bar(hp, width)        – color-coded ASCII bar (green/yellow/red)

Fixed-probability helpers
    load_fixed_map(rows)            – {norm_enc_name: float} from meta rows
    set_fixed_prob(rows, enc, p)    – append a meta row recording a fixed prob
    clear_character(rows, name)     – remove all non-meta rows for a character

Encounter resolution
    resolve_encounter(enc_name, p, dmg, rows, name) – roll Bernoulli(p), return EncounterResult
"""

from __future__ import annotations

import random
from dataclasses import dataclass, field
from datetime import datetime
from math import prod
from typing import Optional

# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _norm(name: str) -> str:
    """Normalise an encounter/character name to a stable lowercase key."""
    return name.strip().lower()


def _is_meta(row: dict) -> bool:
    return (row.get("algo") or "") in ("meta", "config")


# ---------------------------------------------------------------------------
# Data classes
# ---------------------------------------------------------------------------

@dataclass
class EncounterResult:
    """The outcome of a single resolved encounter."""
    character: str
    encounter: str
    probability: float
    damage: float
    outcome: str                    # "hit" | "miss"
    hp_before: float
    hp_after: float
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat(timespec="seconds"))

    @property
    def hit(self) -> bool:
        return self.outcome == "hit"

    def to_row(self, algo: str = "random") -> dict:
        """Serialise to the flat dict format used by JournalStore."""
        return {
            "timestamp": self.timestamp,
            "character": self.character,
            "encounter": self.encounter,
            "probability": f"{self.probability:.6f}",
            "damage": f"{self.damage:.2f}",
            "outcome": self.outcome,
            "algo": algo,
            "note": "",
        }


# ---------------------------------------------------------------------------
# Probability helpers
# ---------------------------------------------------------------------------

def parse_prob(s: str) -> float:
    """
    Parse user input probability into a float in [0, 1].

    Accepts:
      - Decimal form: '0.7'
      - Percent form: '70%'

    Raises:
      ValueError if the value is not a number or falls outside [0, 1].
    """
    s = str(s).strip()
    is_pct = s.endswith("%")
    if is_pct:
        s = s[:-1]
    p = float(s)
    if is_pct:
        p /= 100.0
    if not (0.0 <= p <= 1.0):
        raise ValueError("Probability must be 0–1.")
    return p


def sample_prob(encounter_name: str) -> float:
    """Return a random probability in [0.55, 0.85] for the given encounter."""
    return random.uniform(0.55, 0.85)


def total_survival(rows: list[dict]) -> float:
    """
    Compute the cumulative survival as the product of all logged probabilities.

    Returns 1.0 (neutral element) when there are no rows.
    """
    return prod(float(r["probability"]) for r in rows) if rows else 1.0


def avg_prob_for_type(rows: list[dict], encounter_type: str):
    """
    Calculate the average survival probability for a specific encounter type.

    Returns a tuple of (average_probability, count). Returns (None, 0) when
    no matching rows are found.
    """
    probs = [
        float(r["probability"])
        for r in rows
        if r.get("encounter", "").lower() == encounter_type.lower()
        and r.get("algo") != "meta"
    ]
    if not probs:
        return None, 0
    return sum(probs) / len(probs), len(probs)


def cumulative_for_character(rows: list[dict], name: str) -> float:
    """
    Calculate a character's overall survival score as the product of all their
    encounter probabilities.

    Acts as an HP-style survival meter: each logged encounter reduces the total
    proportionally. Returns 1.0 when the character has no entries.
    """
    vals = [
        float(r["probability"])
        for r in rows
        if r["character"] == name and r.get("algo") not in ("meta", "config")
    ]
    return prod(vals) if vals else 1.0


# ---------------------------------------------------------------------------
# HP helpers
# ---------------------------------------------------------------------------

def compute_hp(rows: list[dict], name: str, start_hp: float = 100.0) -> float:
    """
    Replay the hit history for *name* and return current HP.

    Each encounter is treated as a Bernoulli trial: ``outcome == 'hit'``
    subtracts damage; misses leave HP unchanged. Meta/config rows are ignored.
    HP is clamped to [0.0, start_hp].
    """
    seq = [
        r
        for r in rows
        if r["character"] == name and r.get("algo") not in ("meta", "config")
    ]
    seq.sort(key=lambda r: r["timestamp"])
    hp = float(start_hp)
    for r in seq:
        dmg = float(r.get("damage", 0) or 0)
        if (r.get("outcome") or "").lower() == "hit":
            hp = max(0.0, hp - dmg)
    return hp


def hp_fraction(rows: list[dict], name: str, start_hp: float = 100.0) -> float:
    """Current HP expressed as a fraction of *start_hp* (0.0 – 1.0)."""
    return compute_hp(rows, name, start_hp) / start_hp if start_hp > 0 else 0.0


def hp_bar(hp: float, width: int = 20) -> str:
    """
    Render a color-coded HP bar for the given HP fraction.

    ``hp`` is a float between 0.0 and 1.0 (e.g. 0.75 = 75% HP).
    Color thresholds: green ≥ 60 %, yellow ≥ 30 %, red below 30 %.
    """
    filled = int(hp * width)
    empty = width - filled

    green  = "\033[92m"
    yellow = "\033[93m"
    red    = "\033[91m"
    reset  = "\033[0m"

    if hp >= 0.6:
        color = green
    elif hp >= 0.3:
        color = yellow
    else:
        color = red

    return f"{color}[{'█' * filled}{'░' * empty}]{reset} {hp * 100:.1f}%"


# ---------------------------------------------------------------------------
# Fixed-probability helpers
# ---------------------------------------------------------------------------

_FIXED_PREFIX = "fixed_prob|"


def load_fixed_map(rows: list[dict]) -> dict[str, float]:
    """
    Return ``{normalised_enc_name: probability}`` from meta rows.

    Meta rows that store fixed probabilities have the form::

        {"algo": "meta", "note": "fixed_prob|<enc_name>=<p>", ...}
    """
    result: dict[str, float] = {}
    for row in rows:
        note = row.get("note", "") or ""
        if row.get("algo") == "meta" and note.startswith(_FIXED_PREFIX):
            payload = note[len(_FIXED_PREFIX):]
            if "=" in payload:
                enc, _, raw_p = payload.partition("=")
                result[_norm(enc)] = parse_prob(raw_p)
    return result


def set_fixed_prob(rows: list[dict], enc_name: str, p: float) -> None:
    """
    Append (or overwrite) a meta row that records a fixed probability for
    *enc_name*.  Mutates *rows* in-place; caller must persist the change.
    """
    key = _norm(enc_name)
    # Remove any existing fixed-prob meta row for this encounter
    rows[:] = [
        r for r in rows
        if not (
            r.get("algo") == "meta"
            and (r.get("note") or "").startswith(_FIXED_PREFIX)
            and _norm((r["note"][len(_FIXED_PREFIX):].split("=")[0])) == key
        )
    ]
    rows.append({
        "timestamp": datetime.now().isoformat(timespec="seconds"),
        "character": "_system",
        "probability": f"{p:.6f}",
        "algo": "meta",
        "note": f"{_FIXED_PREFIX}{enc_name}={p:.6f}",
    })


def clear_character(rows: list[dict], name: str) -> int:
    """
    Remove all non-meta rows for *name* from *rows* in-place.

    Returns the number of rows removed.
    """
    before = len(rows)
    rows[:] = [r for r in rows if _is_meta(r) or r.get("character") != name]
    return before - len(rows)


# ---------------------------------------------------------------------------
# High-level encounter resolution
# ---------------------------------------------------------------------------

def resolve_encounter(
    enc_name: str,
    p: float,
    dmg: float,
    rows: list[dict],
    character: str,
    rng: Optional[random.Random] = None,
) -> EncounterResult:
    """
    Roll Bernoulli(p) and return an :class:`EncounterResult`.

    Parameters
    ----------
    enc_name:   encounter label
    p:          hit probability (will be clamped to [0, 1])
    dmg:        damage dealt on a hit
    rows:       existing journal rows (used to compute current HP)
    character:  name of the character facing the encounter
    rng:        optional RNG for deterministic testing

    The result is *not* appended to *rows*; the caller decides whether to
    persist it (e.g. via ``rows.append(result.to_row())``).
    """
    p = parse_prob(p)
    _rng = rng or random
    hp_before = compute_hp(rows, character)
    hit = _rng.random() < p
    outcome = "hit" if hit else "miss"
    hp_after = max(0.0, hp_before - (dmg if hit else 0.0))

    return EncounterResult(
        character=character,
        encounter=enc_name,
        probability=p,
        damage=dmg,
        outcome=outcome,
        hp_before=hp_before,
        hp_after=hp_after,
    )