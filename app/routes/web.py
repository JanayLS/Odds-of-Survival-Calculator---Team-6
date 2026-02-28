from __future__ import annotations
from flask import Blueprint, redirect, render_template, url_for

web_bp = Blueprint("web", __name__)


@web_bp.get("/")
def home():
    # Make menu the homepage. If you'd rather render directly, replace redirect with render_template.
    return redirect(url_for("web.menu"))


@web_bp.get("/menu")
def menu():
    return render_template("menu.html")
