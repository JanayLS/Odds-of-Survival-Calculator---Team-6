# Probability functions will go here later
import random
from math import prod


def parse_prob(s: str) -> float:
    """
    Parse user input probability into a float in [0, 1].

    Accepts:
      - Decimal form: '0.7'
      - Percent form: '70%'

    Raises:
      ValueError if not a number or outside [0, 1].
    """

    s = s.strip()
    is_pct = s.endswith("%")
    if is_pct:
        s = s[:-1]

    p = float(s)
    if is_pct:
        p /= 100.0

    if not (0.0 <= p <= 1.0):
        raise ValueError("Probability must be 0–1.")

    return p


def cumulative_for_character(rows: list[dict], name: str) -> float:
    """
    Calculates the character's overall survival score by multiplying the probabilities of all their past encounters.

    This represents an "HP-style" survival meter: each logged encounter reduces total survival proportionally based on its
    probability result.
    """
    vals = [
        float(r["probability"])
        for r in rows
        if r["character"] == name and r.get("algo") not in ("meta", "config")
    ]
    return prod(vals) if vals else 1.0


def compute_hp(rows: list[dict], name: str, start_hp: float = 100.0) -> float:
    """Apply each encounter as a Bernoulli trial:
    if outcome=='hit' → hp -= damage; else unchanged. Ignores meta/config."""
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
    return compute_hp(rows, name, start_hp) / start_hp if start_hp > 0 else 0.0


def hp_bar(hp: float, width: int = 20) -> str:
    """
    Returns a color-coded HP bar based on a decimal HP value.
    hp: A float between 0 and 1 (e.g. 0.75 = 75% HP)
    width: Total width of the bar display
    """
    # Determines how much of the bar is full vs empty
    filled = int(hp * width)
    empty = width - filled

    # Colors - HP bar changes color depending on how full or low it is
    green = "\033[92m"
    yellow = "\033[93m"
    red = "\033[91m"
    reset = "\033[0m"

    if hp >= 0.6:
        color = green
    elif hp >= 0.3:
        color = yellow
    else:
        color = red

    bar = f"{color}[{'█' * filled}{'░' * empty}]{reset} {hp * 100:.1f}%"
    return bar


def total_survival(rows: list[dict]) -> float:
    """
    Compute the cumulative survival as the product of probabilities.
    If no rows yet, return 1.0 (neutral element for multiplication).
    """
    return prod(float(r["probability"]) for r in rows) if rows else 1.0


def avg_prob_for_type(rows: list[dict], encounter_type: str):
    """
    Calculates average survival probability of a specific Encounter Type.
    Returns average probability and number of instances of the Encounter Type.
    """
    probs = [
        float(r["probability"])
        for r in rows
        if r.get("encounter", "").lower() == encounter_type.lower()
        and r.get("algo") != "meta"
    ]
    if not probs:
        return None, 0

    avg = sum(probs) / len(probs)
    return avg, len(probs)


def sample_prob(encounter_name: str) -> float:
    return random.uniform(0.55, 0.85)


def _norm(name: str) -> str:
    return name.strip().lower()
