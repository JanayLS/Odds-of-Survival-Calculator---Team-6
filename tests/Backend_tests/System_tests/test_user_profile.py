# tests for profile.py

import pytest

from flask import Flask, session

# original code
from app.routes.user_profile import profile_bp


# Fixtures
@pytest.fixture
def app(monkeypatch):
    app = Flask(__name__)
    app.config["TESTING"] = True
    app.config["SECRET_KEY"] = "test-secret"

    app.register_blueprint(profile_bp)

    return app


@pytest.fixture
def client(app):
    return app.test_client()

# helpers and mocks
class DummyProfile:
    def __init__(self):
        self.name = "Alice"
        self.location = "Wonderland"
        self.email = "alice@example.com"



# tests for index()
class TestIndex:
    def test_index_returns_string(self, client):
        res = client.get("/")
        assert res.status_code == 200
        assert b"Plague Survival Simulator" in res.data




# tests for login()
class TestLogin:
    def test_get_login_page(self, client):
        res = client.get("/login")
        assert res.status_code == 200

    def test_login_success(self, client, monkeypatch):
        class MockStore:
            def load_rows(self, password):
                return [{"dummy": True}]

        monkeypatch.setattr("app.routes.user_profile.JournalStore", MockStore)

        res = client.post("/login", data={"password": "pw"}, follow_redirects=False)

        assert res.status_code == 302
        assert "/profile" in res.headers["Location"]

    def test_login_failure(self, client, monkeypatch):
        class MockStore:
            def load_rows(self, password):
                raise Exception("fail")

        monkeypatch.setattr("app.routes.user_profile.JournalStore", MockStore)

        res = client.post("/login", data={"password": "wrong"}, follow_redirects=False)

        assert res.status_code == 302
        assert "/login" in res.headers["Location"]

    def test_login_sets_session(self, client, monkeypatch):
        class MockStore:
            def load_rows(self, password):
                return []

        monkeypatch.setattr("app.routes.user_profile.JournalStore", MockStore)

        with client:
            client.post("/login", data={"password": "pw"})
            assert "password" in session






# tests for /profile
class TestProfile:
    def test_requires_login(self, client):
        res = client.get("/profile", follow_redirects=False)
        assert res.status_code == 302
        assert "/login" in res.headers["Location"]

    def test_profile_success(self, client, monkeypatch):
        class MockStore:
            def load_rows(self, password):
                return [{"timestamp": "2024"}]

        def mock_load_user_profile(rows):
            return DummyProfile()

        def mock_calculate_stats(rows, name):
            return {"games": 1}

        monkeypatch.setattr("app.routes.user_profile.JournalStore", MockStore)
        monkeypatch.setattr("app.routes.user_profile.load_user_profile", mock_load_user_profile)
        monkeypatch.setattr("app.routes.user_profile.calculate_stats", mock_calculate_stats)

        with client:
            with client.session_transaction() as sess:
                sess["password"] = "pw"

            res = client.get("/profile")
            assert res.status_code == 200

    def test_profile_invalid_session_password(self, client, monkeypatch):
        class MockStore:
            def load_rows(self, password):
                raise Exception("decrypt fail")

        monkeypatch.setattr("app.routes.user_profile.JournalStore", MockStore)

        with client:
            with client.session_transaction() as sess:
                sess["password"] = "bad"

            res = client.get("/profile", follow_redirects=False)

            assert res.status_code == 302
            assert "/login" in res.headers["Location"]

            # session should be cleared
            with client.session_transaction() as sess:
                assert "password" not in sess