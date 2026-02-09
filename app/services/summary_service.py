# Summary helpers will go here later
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
    # sort by name; change key if you prefer highest total first: key=lambda t: -t[1]
    return sorted(out, key=lambda t: t[0])
