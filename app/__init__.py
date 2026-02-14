# App package marker
from flask import Flask


def create_app():
    app = Flask(__name__)
    app.config["SECRET_KEY"] = "dev-change-me"

    from app.routes.web import web_bp
    from app.routes.user_profile import profile_bp

    # app.register_blueprint(web_bp)
    app.register_blueprint(profile_bp)

    return app
