from datetime import datetime
import random
from app.domain.models import UserProfile

from app.storage.journal_store import (
    open_or_create_journal,
    save_csv_to_encrypted,
    load_csv_from_encrypted,
    change_password,
    reset_journal,
)

from app.services.probability_service import (
    parse_prob,
    total_survival,
    avg_prob_for_type,
    sample_prob,
    cumulative_for_character,
    compute_hp,
    hp_fraction,
    hp_bar,
    _norm,
)

from app.services.summary_service import (
    unique_characters,
    character_summaries,
)

from app.services.fixed_prob_service import (
    load_fixed_map,
    set_fixed_prob,
    clear_character,
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
    """
    Print all unique encounter types recorded across all characters.
    """
    # Collect all encounter names
    types = {r["encounter"].lower() for r in rows if r.get("algo") != "meta"}

    if not types:
        print("No encounter types logged yet.")
    else:
        print("\nKnown Encounter Types:")
        for t in sorted(types):
            print(f"- {t}")
        print()


def collect_user_profile() -> UserProfile:
    """
    One-time prompt when the journal is empty.
    Stores minimal user metadata as a 'meta' row inside the encrypted file.
    """
    name = input("Profile name (press Enter to reuse character name later): ").strip()
    location = input("Location (optional): ").strip()
    email = input("Contact email (optional): ").strip()
    return UserProfile(name=name or "", location=location, email=email)


def main() -> None:
    """
    App entrypoint: open/create the encrypted journal, ensure first-run profile,
    then run a simple menu so the user can:
      - Add an encounter (validate prob; save encrypted)
      - List known encounter types (user can choose from known encounter type or enter new encounter type)
      - List a characters history with running total
      - Clear a characters entries
      - Change the journal password (re-encrypt in place)
      - Reset (delete) the journal file
      - Quit
    All calculations come from the persisted (decrypted) rows in memory.
    """
    print("Welcome to Group 2 MVP")

    rows, password = open_or_create_journal()
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
        save_csv_to_encrypted(password, rows)

    while True:
        print(
            "\nMenu: [A]dd Encounter [E]ncounter Types  [L]ist History  [N]ames  [S]ummary  "
            "[C]lear Character  [P]asswd Change  [R]eset Journal  [Q]uit"
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
            fixed_map = load_fixed_map(rows)  # requires helper
            key = _norm(enc_name)  # requires helper

            if mode == "f":
                if key in fixed_map:
                    p = fixed_map[key]
                    print(f"Using saved fixed p={p:.3f} for '{enc_name}'.")
                else:
                    while True:
                        raw = input("Set fixed probability (0.0–1.0): ").strip()
                        try:
                            p = float(raw)
                            if 0.0 <= p <= 1.0:
                                break
                        except ValueError:
                            pass
                        print("Invalid. Enter a number between 0 and 1.")
                    set_fixed_prob(rows, enc_name, p)  # persist fixed p as meta row
                    save_csv_to_encrypted(password, rows)
                    print(f"Saved fixed p={p:.3f} for '{enc_name}'.")
                algo_label = "fixed"
            else:
                p = sample_prob(enc_name)  # requires helper + _rng
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

            # ---- run Bernoulli(p) to decide hit/miss, then apply damage on hit ----
            curr_hp = compute_hp(rows, name, 100.0)  # requires helper
            hit = random.random() < p
            outcome = "hit" if hit else "miss"
            new_hp = max(0.0, curr_hp - (dmg if hit else 0.0))

            # ---- record encounter ----
            ts = datetime.now().isoformat(timespec="seconds")
            rows.append(
                {
                    "timestamp": ts,
                    "character": name,
                    "encounter": enc_name,
                    "probability": f"{p:.6f}",
                    "damage": f"{dmg:.2f}",
                    "outcome": outcome,  # NEW
                    "algo": algo_label,  # "fixed" or "random"
                    "note": "",
                }
            )
            save_csv_to_encrypted(password, rows)

            # ---- feedback ----
            bar = hp_bar(new_hp / 100.0, width=20)  # requires your hp_bar()
            print(
                f"Result: {outcome.upper()} | p={p:.3f}, dmg={dmg:.0f} | HP {new_hp:0.1f}"
            )
            print(bar)

        elif choice == "e":  # List known encounter types
            list_encounter_types(rows)

        elif choice == "l":  # List history
            name = input("Character to list: ").strip()
            print_history(rows, name)

        elif choice == "n":  # list names only
            print_names(rows)

        elif choice == "s":  # list names with cumulative probability and entry count
            print_character_summaries(rows)

        elif choice == "c":  # Clear character entries
            name = input("Character to clear: ").strip()
            confirm = input(f'Type "YES" to clear all entries for {name}: ').strip()
            if confirm == "YES":
                removed = clear_character(rows, name)
                save_csv_to_encrypted(password, rows)
                print(f"Removed {removed} entries.")
            else:
                print("Canceled.")

        elif choice == "p":  # Change password
            new_pwd = change_password(password, rows)
            if new_pwd:
                password = new_pwd

        elif choice == "r":  # Reset journal file
            if reset_journal():
                rows.clear()
                print("Journal cleared. Relaunch to create a new one.")
                break

        elif choice == "q":  # Quit
            break

        else:
            print("Choose A/E/L/N/S/C/P/R/Q.")


if __name__ == "__main__":
    main()
