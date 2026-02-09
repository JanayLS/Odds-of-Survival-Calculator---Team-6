from datetime import datetime
from app.services.probability_service import _norm


def load_fixed_map(rows: list[dict]) -> dict[str, float]:
    """
    Scan meta rows (algo='config') like: note='fixed|encounter=<name>|p=<value>'
    Returns {encounter_name_lower: p}
    """
    fixed: dict[str, float] = {}
    for r in rows:
        if r.get("algo") == "config" and r.get("note", "").startswith("fixed|"):
            # format: fixed|encounter=<name>|p=<value>
            parts = dict(seg.split("=", 1) for seg in r["note"].split("|")[1:])
            name = _norm(parts.get("encounter", ""))
            if name and "p" in parts:
                try:
                    fixed[name] = float(parts["p"])
                except ValueError:
                    pass
    return fixed


def set_fixed_prob(rows: list[dict], encounter_name: str, p: float) -> None:
    """
    Append a meta config row for a fixed probability, persisted in the journal.
    """
    rows.append(
        {
            "timestamp": datetime.now().isoformat(timespec="seconds"),
            "character": "",  # global config, not tied to a character
            "encounter": encounter_name,  # optional; kept for readability
            "probability": "1.0",  # neutral
            "algo": "config",
            "note": f"fixed|encounter={encounter_name}|p={p:.6f}",
        }
    )


def clear_character(rows: list[dict], name: str) -> int:
    """
    In-place filter of `rows` to drop encounters for `name`.
    Returns the number of removed rows. Caller is responsible for saving.
    """
    before = len(rows)
    rows[:] = [r for r in rows if r["character"] != name or r.get("algo") == "meta"]
    return before - len(rows)
