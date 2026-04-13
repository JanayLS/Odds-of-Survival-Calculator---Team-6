# tests for auth_save.py
import os
import json
import pytest
import tempfile

from flask import Flask

# original code
from app.routes.auth_save import (
    _safe_username,
    _encrypt_json,
    _decrypt_json,
    SaveConfig,
    auth_save_bp,
)


PASSWORD = "test-password"
USERNAME = "alice"

# fixtures
@pytest.fixture
def app(tmp_path):
    app = Flask(__name__)
    app.config["TESTING"] = True
    app.config["SECRET_KEY"] = "test-secret"
    app.config["SAVE_DIR"] = str(tmp_path)
    app.register_blueprint(auth_save_bp)
    return app


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def config(app):
    with app.app_context():
        return SaveConfig.from_app()



# tests for _safe_username()
class TestSafeUsername:
    def test_lowercases_and_strips(self):
        assert _safe_username("  Alice  ") == "alice"

    def test_removes_invalid_chars(self):
        assert _safe_username("bob!@#$") == "bob"

    def test_allows_valid_chars(self):
        assert _safe_username("user_name-123") == "user_name-123"

    def test_empty_input(self):
        assert _safe_username("") == ""





# tests for saveConfig
class TestSaveConfig:
    def test_creates_base_dir(self, config):
        assert os.path.exists(config.base_dir)

    def test_path_for_user(self, config):
        path = config.path_for_user("Alice!!")
        assert path.name == "alice.json"





# tests for _encrypt_json() and _decrypt_json()
class TestEncryptDecryptJson:
    def test_roundtrip(self):
        payload = {"v": 1, "username": USERNAME}
        blob = _encrypt_json(PASSWORD, payload)
        result = _decrypt_json(PASSWORD, blob)
        assert result == payload

    def test_wrong_password_raises(self):
        payload = {"v": 1}
        blob = _encrypt_json(PASSWORD, payload)
        with pytest.raises(Exception):
            _decrypt_json("wrong-password", blob)

    def test_invalid_blob_format_raises(self):
        with pytest.raises(ValueError):
            _decrypt_json(PASSWORD, b"invalid-data")






# tests for pathways and endpoints
class TestLoginOrCreate:
    def test_create_account_success(self, client):
        res = client.post(
            "/api/auth/login",
            json={"username": USERNAME, "password": PASSWORD, "create": True},
        )
        data = res.get_json()

        assert res.status_code == 200
        assert data["ok"] is True
        assert data["created"] is True

    def test_create_account_duplicate(self, client):
        payload = {"username": USERNAME, "password": PASSWORD, "create": True}
        client.post("/api/auth/login", json=payload)

        res = client.post("/api/auth/login", json=payload)
        assert res.status_code == 409

    def test_login_success(self, client):
        client.post(
            "/api/auth/login",
            json={"username": USERNAME, "password": PASSWORD, "create": True},
        )

        res = client.post(
            "/api/auth/login",
            json={"username": USERNAME, "password": PASSWORD, "create": False},
        )
        data = res.get_json()

        assert res.status_code == 200
        assert data["ok"] is True
        assert data["created"] is False

    def test_login_wrong_password(self, client):
        client.post(
            "/api/auth/login",
            json={"username": USERNAME, "password": PASSWORD, "create": True},
        )

        res = client.post(
            "/api/auth/login",
            json={"username": USERNAME, "password": "wrong", "create": False},
        )

        assert res.status_code == 401

    def test_login_nonexistent_account(self, client):
        res = client.post(
            "/api/auth/login",
            json={"username": "ghost", "password": PASSWORD, "create": False},
        )
        assert res.status_code == 404

    def test_missing_fields(self, client):
        res = client.post("/api/auth/login", json={})
        assert res.status_code == 400



class TestSessionRoutes:
    def test_me_not_logged_in(self, client):
        res = client.get("/api/auth/me")
        data = res.get_json()
        assert data["logged_in"] is False

    def test_me_after_login(self, client):
        client.post(
            "/api/auth/login",
            json={"username": USERNAME, "password": PASSWORD, "create": True},
        )

        res = client.get("/api/auth/me")
        data = res.get_json()

        assert data["logged_in"] is True
        assert data["username"] == USERNAME

    def test_logout(self, client):
        client.post(
            "/api/auth/login",
            json={"username": USERNAME, "password": PASSWORD, "create": True},
        )

        client.post("/api/auth/logout")

        res = client.get("/api/auth/me")
        data = res.get_json()

        assert data["logged_in"] is False