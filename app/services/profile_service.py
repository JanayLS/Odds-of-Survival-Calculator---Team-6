from app.domain.models import UserProfile
from app.services.probability_service import compute_hp


def load_user_profile(rows: list[dict]) -> UserProfile:
    for row in rows:
        if row.get("algo") == "meta" and "profile|" in row.get("note", ""):
            note = row["note"]
            name = row.get("character", "")

            location = ""
            email = ""
            parts = note.split("|")
            for part in parts:
                if part.startswith("location="):
                    location = part.replace("location=", "")
                elif part.startswith("email="):
                    email = part.replace("email=", "")

            return UserProfile(name=name, location=location, email=email)

    return UserProfile(name="Unknown", location="", email="")


def calculate_stats(rows: list[dict], character_name: str) -> dict:
    encounters = [
        r
        for r in rows
        if r["character"] == character_name and r.get("algo") not in ("meta", "config")
    ]

    total_encounters = len(encounters)

    current_hp = compute_hp(rows, character_name, 100.0)
    survival_rate = current_hp

    num_of_potions = 0

    return {
        "total_encounters": total_encounters,
        "survival_rate": round(survival_rate, 1),
        "num_of_potions": num_of_potions,
    }
