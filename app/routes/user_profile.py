from flask import Blueprint, render_template
from app.storage.journal_store import load_csv_from_encrypted  # open_or_create_journal
from app.services.profile_service import load_user_profile, calculate_stats


profile_bp = Blueprint("profile", __name__)


@profile_bp.get("/")
def index():
    return "Plague Survival Simulator - Web Version"


# load the flask server and go to http://127.0.0.1:5000/profile , you will need to run the CLI to create the journal first


@profile_bp.get("/profile")
def profile():
    # Load the encrypted journal
    # rows, password = open_or_create_journal()

    # if not rows or not password:
    #     return "Error: Could not load journal"
    password = "1234"  # change whats in the quotes to the password of the journal that you set when you created it
    rows = load_csv_from_encrypted(password)

    # Load user profile from meta row
    user_profile = load_user_profile(rows)

    # Calculate stats
    stats = calculate_stats(rows, user_profile.name)

    # Prepare data for template
    user = {
        "name": user_profile.name,
        "location": user_profile.location,
        "email": user_profile.email,
        "profile_pic": "default.jpg",
        "stats": stats,
    }

    return render_template("profile.html", user=user)
