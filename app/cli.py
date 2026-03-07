from datetime import datetime
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.domain.models import UserProfile

from app.storage.journal_store import JournalStore

from app.services.probability_service import (
    # Data class
    EncounterResult,
    # Probability helpers
    parse_prob,
    sample_prob,
    total_survival,
    avg_prob_for_type,
    cumulative_for_character,
    # HP helpers
    compute_hp,
    hp_fraction,
    hp_bar,
    # Fixed-prob helpers
    load_fixed_map,
    set_fixed_prob,
    clear_character,
    # High-level resolution
    resolve_encounter,
    _norm,
)

from app.services.summary_service import (
    unique_characters,
    character_summaries,
)


def print_history(rows: list[dict], name: str) -> None:
    hist = [
        r
        for r in rows
        if r["character"] == name and r.get("algo") not in ("meta", "config")
    ]
    if not hist:
        print(f"No entries for '{name}'.")
        return
    hist.sort(key=lambda r: r["timestamp"])

    hp = 100.0
    print(f"\nHistory for {name}")
    print("timestamp              encounter            prob   dmg  outcome  hp_after")
    for r in hist:
        p = float(r["probability"])
        dmg = float(r.get("damage", 0) or 0)
        outcome = (r.get("outcome") or "").lower()
        if outcome == "hit":
            hp = max(0.0, hp - dmg)
        enc = (r.get("encounter", "") or "")[:20]
        bar = hp_bar(hp / 100.0, width=20)
        print(
            f"{r['timestamp']:20s}  {enc:20s}  {p:0.3f}  {dmg:4.0f}  {outcome:7s}  {bar}"
        )
    print(f"Final HP: {hp:0.1f}\n")


def print_names(rows: list[dict]) -> None:
    names = unique_characters(rows)
    if not names:
        print("No characters found.")
        return
    print("\nCharacters:")
    for n in names:
        print(f"- {n}")
    print()


def print_character_summaries(rows: list[dict]) -> None:
    summaries = character_summaries(rows)
    if not summaries:
        print("No character data to summarize.")
        return
    print("\nCharacter Summary")
    print("name                 entries   cumulative   hp(100→)         ")
    for name, total, count in summaries:
        hp_pts = compute_hp(rows, name, 100.0)
        bar = hp_bar(hp_pts / 100.0, width=14)
        print(f"{name:20s}   {count:7d}   {total:0.3f}   {hp_pts:6.1f}  {bar}")
    print()


def list_encounter_types(rows: list[dict]) -> None:
    """Print all unique encounter types recorded across all characters."""
    types = {r["encounter"].lower() for r in rows if r.get("algo") != "meta"}
    if not types:
        print("No encounter types logged yet.")
    else:
        print("\nKnown Encounter Types:")
        for t in sorted(types):
            print(f"- {t}")
        print()


def collect_user_profile() -> UserProfile:
    """One-time prompt when the journal is empty."""
    name = input("Profile name (press Enter to reuse character name later): ").strip()
    location = input("Location (optional): ").strip()
    email = input("Contact email (optional): ").strip()
    return UserProfile(name=name or "", location=location, email=email)

def create_encounter(
    session: JournalStore, 
    name: str,
    enc_name: str,
    mode: str,
    damage: float,
    fixed_probability: float = None,
) -> EncounterResult:
    """
    Functions just like main() but without the main loop, so it can be used for the main game loop
    
    Params:
     -- session: the database session (rows, store, password)
     -- name: chatracter name
     -- enc_name: encounter name
     -- mode: "fixed" or "random
     -- damage: amount of damage to deal
     -- fixed_probability: probability to use when set to fixed

    Returns:
    -- EncounterResult with outcome, HP before/after, selected probability, etc

    Raises:
     -- ValueError If damage is negative, mode is "fixed" but no probability is given, or fixed_probability is out of range
    """

    if damage < 0:
        raise ValueError("Damage must be >= 0.")

    fixed_map = load_fixed_map(session.rows)
    key = _norm(enc_name)

    if mode == "f" or mode == "fixed":
        if key in fixed_map:
            p = fixed_map[key]
        else:
            if fixed_probability is None:
                raise ValueError(
                    f"No saved probability for '{enc_name}'. "
                    "Provide fixed_probability to set one."
                )
            p = parse_prob(str(fixed_probability))
            set_fixed_prob(session.rows, enc_name, p)
            session.store.replace_all(session.password, session.rows)
        algo_label = "fixed"
    else:
        p = sample_prob(enc_name)
        algo_label = "random"

    result = resolve_encounter(enc_name, p, damage, session.rows, name)

    entry = result.to_row(algo=algo_label)
    session.rows.append(entry)
    session.store.append_row(session.password, entry)

    return result


def main() -> None:

    print("Welcome to Group 2 MVP")

    store = JournalStore()
    rows, password = store.open_or_create_journal()
    if not password:
        return

    if not rows:
        profile = collect_user_profile()
        rows.append(
            {
                "timestamp": datetime.now().isoformat(timespec="seconds"),
                "character": profile.name or "default",
                "probability": "1.0",
                "algo": "meta",
                "note": f"profile|location={profile.location}|email={profile.email}",
            }
        )
        store.replace_all(password, rows)

    while True:
        print(
            "\nMenu: [A]dd Encounter [E]ncounter Types  [L]ist History  [N]ames  [S]ummary  "
            "[C]lear Character  [P]asswd Change  [R]eset Journal  [Q]uit >"
        )
        choice = input("> ").strip().lower()

        if choice == "a":  # Add encounter
            name = input("Character name: ").strip()
            if not name:
                print("Name required.")
                continue

            enc_name = input("Encounter name: ").strip() or "unspecified"

            # ---- choose probability mode (Fixed or Random) ----
            mode = input("Probability mode [F]ixed / [R]andom? ").strip().lower()
            fixed_map = load_fixed_map(rows)
            key = _norm(enc_name)

            if mode == "f":
                if key in fixed_map:
                    p = fixed_map[key]
                    print(f"Using saved fixed p={p:.3f} for '{enc_name}'.")
                else:
                    while True:
                        raw = input("Set fixed probability (0.0–1.0 or e.g. 70%): ").strip()
                        try:
                            p = parse_prob(raw)
                            break
                        except ValueError as e:
                            print(f"Invalid: {e}")
                    set_fixed_prob(rows, enc_name, p)
                    store.replace_all(password, rows)
                    print(f"Saved fixed p={p:.3f} for '{enc_name}'.")
                algo_label = "fixed"
            else:
                p = sample_prob(enc_name)
                algo_label = "random"

            # ---- damage ----
            while True:
                raw_dmg = input("Damage this encounter (0 for none): ").strip() or "0"
                try:
                    dmg = float(raw_dmg)
                    if dmg >= 0:
                        break
                except ValueError:
                    pass
                print("Invalid. Enter a number ≥ 0.")

            # ---- resolve encounter via probability module ----
            result: EncounterResult = resolve_encounter(enc_name, p, dmg, rows, name)

            # ---- record encounter ----
            entry = result.to_row(algo=algo_label)
            rows.append(entry)
            store.append_row(password, entry)

            # ---- feedback ----
            bar = hp_bar(result.hp_after / 100.0, width=20)
            print(
                f"Result: {result.outcome.upper()} | p={result.probability:.3f}, "
                f"dmg={result.damage:.0f} | HP {result.hp_after:0.1f}"
            )
            print(bar)

        elif choice == "e":
            list_encounter_types(rows)

        elif choice == "l":
            name = input("Character to list: ").strip()
            print_history(rows, name)

        elif choice == "n":
            print_names(rows)

        elif choice == "s":
            print_character_summaries(rows)

        elif choice == "c":
            name = input("Character to clear: ").strip()
            confirm = input(f'Type "YES" to clear all entries for {name}: ').strip()
            if confirm == "YES":
                removed = clear_character(rows, name)
                store.replace_all(password, rows)
                print(f"Removed {removed} entries.")
            else:
                print("Canceled.")

        elif choice == "p":
            new_pwd = store.change_password(password, rows)
            if new_pwd:
                password = new_pwd

        elif choice == "r":
            confirm = input('Type "YES" to reset/delete the journal: ').strip()
            if confirm == "YES":
                store.reset()
                rows.clear()
                print("Journal cleared. Relaunch to create a new one.")
                break
            else:
                print("Canceled.")

        elif choice == "q":
            break

        else:
            print("Choose A/E/L/N/S/C/P/R/Q.")


if __name__ == "__main__":
    main()