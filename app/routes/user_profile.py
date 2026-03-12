from flask import Blueprint, render_template, session, redirect, url_for, request, flash
from app.storage.journal_store import JournalStore
from app.services.profile_service import load_user_profile, calculate_stats


profile_bp = Blueprint("profile", __name__)


@profile_bp.get("/")
def index():
    return "Plague Survival Simulator - Web Version"


@profile_bp.route("/login", methods=["GET", "POST"])
def login():
    """Login page - user enters password to decrypt their journal"""
    if request.method == "POST":
        # Get password from form
        password = request.form.get("password")
        
        # Try to load the journal with this password
        try:
            store = JournalStore()
            rows = store.load_rows(password)
            
            # If successful, store password in session
            session["password"] = password
            flash("Login successful!", "success")
            return redirect(url_for("profile.profile"))
        except Exception as e:
            # Wrong password or other error
            flash("Invalid password. Please try again.", "error")
            return redirect(url_for("profile.login"))
    
    # GET request - show login form
    return render_template("login.html")


@profile_bp.get("/profile")
def profile():
    """Profile page - shows user stats (requires login)"""
    # Check if user is logged in
    if "password" not in session:
        flash("Please login first.", "error")
        return redirect(url_for("profile.login"))
    
    # Get password from session
    password = session["password"]
    
    try:
        # Load the encrypted journal
        store = JournalStore()
        rows = store.load_rows(password)
        
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
    except Exception as e:
        # Password might be wrong 
        flash("Error loading profile. Please login again.", "error")
        session.pop("password", None)  # Clear invalid session
        return redirect(url_for("profile.login"))
