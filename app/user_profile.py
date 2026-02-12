from flask import Flask, render_template
from app.domain.models import UserProfile
from app.storage.journal_store import load_csv_from_encrypted, open_or_create_journal
from app.services.probability_service import compute_hp

app = Flask(__name__)

def load_user_profile(rows: list[dict]) -> UserProfile:
    """
    Extract the UserProfile from the meta row in the encrypted journal.
    
    """
    for row in rows:
        if row.get("algo") == "meta" and "profile|" in row.get("note", ""):
            note = row["note"]
            name = row.get("character", "")
            
            # Parse location and email from note
            location = ""
            email = ""
            parts = note.split("|")
            for part in parts:
                if part.startswith("location="):
                    location = part.replace("location=", "")
                elif part.startswith("email="):
                    email = part.replace("email=", "")
            
            return UserProfile(name=name, location=location, email=email)
    
    # Return default if no profile found
    return UserProfile(name="Unknown", location="", email="")

def calculate_stats(rows: list[dict], character_name: str) -> dict:
    """
    Calculate stats for the profile page.
    """
    # Filter encounters for this character (exclude meta rows)
    encounters = [
        r for r in rows 
        if r["character"] == character_name and r.get("algo") not in ("meta", "config")
    ]
    
    total_encounters = len(encounters)
    
    # Calculate current HP
    current_hp = compute_hp(rows, character_name, 100.0)
    survival_rate = current_hp  # HP percentage is survival rate
    
    # TODO: Add potion count when your team implements that feature
    num_of_potions = 0
    
    return {
        'total_encounters': total_encounters,
        'survival_rate': round(survival_rate, 1),
        'num_of_potions': num_of_potions
    }

@app.route('/')
def index():
    return "Plague Survival Simulator - Web Version"

@app.route('/profile')
def profile():
    # Load the encrypted journal
    rows, password = open_or_create_journal()
    
    if not rows or not password:
        return "Error: Could not load journal"
    
    # Load user profile from meta row
    user_profile = load_user_profile(rows)
    
    # Calculate stats
    stats = calculate_stats(rows, user_profile.name)
    
    # Prepare data for template
    user = {
        'name': user_profile.name,
        'location': user_profile.location,
        'email': user_profile.email,
        'profile_pic': 'default.jpg',
        'stats': stats
    }
    
    return render_template('profile.html', user=user)

if __name__ == '__main__':
    app.run(debug=True)