# tests for journal_store.py
import base64
import json
import os
import pytest
import tempfile
 
from cryptography.fernet import InvalidToken



# original  code:
from __future__ import annotations

import os
import json
import base64
import sqlite3
from typing import Any
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes

DEFAULT_DB_PATH = os.path.join("data", "journal.db")


def _derive_key(password: str, salt: bytes) -> bytes:
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=200_000,
    )
    return base64.urlsafe_b64encode(kdf.derive(password.encode("utf-8")))


def _encrypt_dict(password: str, salt: bytes, row: dict[str, Any]) -> bytes:
    key = _derive_key(password, salt)
    token = Fernet(key).encrypt(json.dumps(row, separators=(",", ":")).encode("utf-8"))
    return token


def _decrypt_dict(password: str, salt: bytes, token: bytes) -> dict[str, Any]:
    key = _derive_key(password, salt)
    plaintext = Fernet(key).decrypt(token)
    return json.loads(plaintext.decode("utf-8"))


class JournalStore:
    def __init__(self, db_path: str = DEFAULT_DB_PATH):
        self.db_path = db_path
        os.makedirs(os.path.dirname(db_path), exist_ok=True)

    def _connect(self) -> sqlite3.Connection:
        con = sqlite3.connect(self.db_path)
        con.execute("PRAGMA journal_mode=WAL;")
        con.execute("PRAGMA foreign_keys=ON;")
        return con

    def init_db(self) -> None:
        with self._connect() as con:
            con.execute(
                """
                CREATE TABLE IF NOT EXISTS meta (
                    k TEXT PRIMARY KEY,
                    v TEXT NOT NULL
                );
                """
            )
            con.execute(
                """
                CREATE TABLE IF NOT EXISTS entries (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    ts TEXT NOT NULL,
                    blob BLOB NOT NULL
                );
                """
            )

    def has_journal(self) -> bool:
        if not os.path.exists(self.db_path):
            return False
        self.init_db()
        with self._connect() as con:
            cur = con.execute("SELECT 1 FROM meta WHERE k='salt' LIMIT 1;")
            return cur.fetchone() is not None

    def create_new_journal(self, password: str) -> None:
        self.init_db()
        salt = os.urandom(16)
        with self._connect() as con:
            con.execute("DELETE FROM meta;")
            con.execute("DELETE FROM entries;")
            con.execute(
                "INSERT INTO meta(k, v) VALUES('salt', ?);",
                (base64.b64encode(salt).decode("utf-8"),),
            )

    def open_or_create_journal(self):
        import getpass

        if self.has_journal():
            while True:
                pwd = getpass.getpass("Enter journal password (Enter to cancel): ")
                if not pwd:
                    print("Canceled.")
                    return [], ""
                try:
                    rows = self.load_rows(pwd)
                    return rows, pwd
                except Exception:
                    print("Wrong password or corrupt data. Try again.")
        else:
            while True:
                p1 = getpass.getpass("Create a new password: ")
                p2 = getpass.getpass("Confirm password: ")
                if p1 and p1 == p2:
                    self.create_new_journal(p1)  # <-- correct method name
                    print("New journal created.")
                    return [], p1
                print("Passwords did not match. Try again.")

    def _get_salt(self) -> bytes:
        with self._connect() as con:
            cur = con.execute("SELECT v FROM meta WHERE k='salt' LIMIT 1;")
            row = cur.fetchone()
            if not row:
                raise RuntimeError("Journal not initialized (missing salt).")
            return base64.b64decode(row[0])

    def load_rows(self, password: str) -> list[dict[str, Any]]:
        self.init_db()
        salt = self._get_salt()
        rows: list[dict[str, Any]] = []
        with self._connect() as con:
            for _id, ts, blob in con.execute(
                "SELECT id, ts, blob FROM entries ORDER BY ts;"
            ):
                d = _decrypt_dict(password, salt, blob)
                # keep timestamp consistent with row contents
                if "timestamp" not in d:
                    d["timestamp"] = ts
                rows.append(d)
        return rows

    def append_row(self, password: str, row: dict[str, Any]) -> None:
        salt = self._get_salt()
        ts = str(row.get("timestamp") or "")
        blob = _encrypt_dict(password, salt, row)
        with self._connect() as con:
            con.execute("INSERT INTO entries(ts, blob) VALUES(?, ?);", (ts, blob))

    def replace_all(self, password: str, rows: list[dict[str, Any]]) -> None:
        salt = self._get_salt()
        with self._connect() as con:
            con.execute("DELETE FROM entries;")
            for r in rows:
                ts = str(r.get("timestamp") or "")
                blob = _encrypt_dict(password, salt, r)
                con.execute("INSERT INTO entries(ts, blob) VALUES(?, ?);", (ts, blob))

    def reset(self) -> None:

        self.init_db()
        with self._connect() as con:
            con.execute("DELETE FROM entries;")
            con.execute("DELETE FROM meta;")

    def change_password(self, old_password: str, rows: list[dict[str, Any]]) -> str:
        import getpass

        # Verify current password by attempting a decrypt
        check = getpass.getpass("Current password: ")
        if check != old_password:
            print("Incorrect current password.")
            return ""

        p1 = getpass.getpass("New password: ")
        p2 = getpass.getpass("Confirm new password: ")
        if not p1 or p1 != p2:
            print("Passwords did not match.")
            return ""

        # Re-encrypt everything with the new password
        self.replace_all(p1, rows)
        print("Password updated.")
        return p1



# Fixtures
PASSWORD = "test-password"
ROW = {"timestamp": "2024-01-01T00:00:00", "character": "Alice", "encounter": "dragon", "probability": "0.8"}
 
 
@pytest.fixture
def store(tmp_path):
    return JournalStore(db_path=str(tmp_path / "journal.db"))
 
 
@pytest.fixture
def initialised_store(store):
    store.create_new_journal(PASSWORD)
    return store




# Tests for init_db
class TestInitDb:
    def test_creates_db_file(self, store):
        store.init_db()
        assert os.path.exists(store.db_path)
 
    def test_creates_meta_and_entries_tables(self, store):
        store.init_db()
        with store._connect() as con:
            tables = {r[0] for r in con.execute("SELECT name FROM sqlite_master WHERE type='table';")}
        assert {"meta", "entries"}.issubset(tables)
 
    def test_idempotent(self, store):
        store.init_db()
        store.init_db()  # should not raise




# tests for has_journal()
class TestHasJournal:
    def test_false_when_no_db_file(self, store):
        assert store.has_journal() is False
 
    def test_false_after_init_db_only(self, store):
        store.init_db()
        assert store.has_journal() is False
 
    def test_true_after_create_new_journal(self, initialised_store):
        assert initialised_store.has_journal() is True






# tests for create_new_journal()
class TestCreateNewJournal:
    def test_stores_salt_in_meta(self, store):
        store.create_new_journal(PASSWORD)
        with store._connect() as con:
            cur = con.execute("SELECT v FROM meta WHERE k='salt';")
            row = cur.fetchone()
        assert row is not None
        assert len(base64.b64decode(row[0])) == 16
 
    def test_clears_existing_entries(self, initialised_store):
        initialised_store.append_row(PASSWORD, ROW)
        initialised_store.create_new_journal("new-password")
        assert initialised_store.load_rows("new-password") == []
 
    def test_each_journal_has_unique_salt(self, store):
        store.create_new_journal(PASSWORD)
        salt1 = store._get_salt()
        store.create_new_journal(PASSWORD)
        salt2 = store._get_salt()
        assert salt1 != salt2






# tests for load_rows() and append_row()
class TestLoadAndAppend:
    def test_empty_journal_returns_empty_list(self, initialised_store):
        assert initialised_store.load_rows(PASSWORD) == []
 
    def test_appended_row_is_recovered(self, initialised_store):
        initialised_store.append_row(PASSWORD, ROW)
        rows = initialised_store.load_rows(PASSWORD)
        assert len(rows) == 1
        assert rows[0]["character"] == "Alice"
 
    def test_multiple_rows_recovered_in_timestamp_order(self, initialised_store):
        row_a = {**ROW, "timestamp": "2024-01-01T00:00:02", "character": "Bob"}
        row_b = {**ROW, "timestamp": "2024-01-01T00:00:01", "character": "Alice"}
        initialised_store.append_row(PASSWORD, row_a)
        initialised_store.append_row(PASSWORD, row_b)
        rows = initialised_store.load_rows(PASSWORD)
        assert [r["character"] for r in rows] == ["Alice", "Bob"]
 
    def test_row_without_timestamp_gets_ts_injected(self, initialised_store):
        row = {"character": "Alice", "encounter": "goblin", "probability": "0.5"}
        initialised_store.append_row(PASSWORD, row)
        rows = initialised_store.load_rows(PASSWORD)
        assert "timestamp" in rows[0]
 
    def test_wrong_password_raises(self, initialised_store):
        initialised_store.append_row(PASSWORD, ROW)
        with pytest.raises(Exception):
            initialised_store.load_rows("wrong-password")
 
    def test_all_fields_preserved(self, initialised_store):
        initialised_store.append_row(PASSWORD, ROW)
        recovered = initialised_store.load_rows(PASSWORD)[0]
        for key, value in ROW.items():
            assert recovered[key] == value






# tests for replace_all()
class TestReplaceAll:
    def test_replaces_existing_rows(self, initialised_store):
        initialised_store.append_row(PASSWORD, ROW)
        new_row = {**ROW, "character": "Bob"}
        initialised_store.replace_all(PASSWORD, [new_row])
        rows = initialised_store.load_rows(PASSWORD)
        assert len(rows) == 1
        assert rows[0]["character"] == "Bob"
 
    def test_replace_with_empty_clears_entries(self, initialised_store):
        initialised_store.append_row(PASSWORD, ROW)
        initialised_store.replace_all(PASSWORD, [])
        assert initialised_store.load_rows(PASSWORD) == []
 
    def test_replace_preserves_order(self, initialised_store):
        rows = [
            {**ROW, "timestamp": f"2024-01-01T00:00:0{i}", "character": str(i)}
            for i in range(3)
        ]
        initialised_store.replace_all(PASSWORD, rows)
        recovered = initialised_store.load_rows(PASSWORD)
        assert [r["character"] for r in recovered] == ["0", "1", "2"]






# tests for reset()
class TestReset:
    def test_clears_entries(self, initialised_store):
        initialised_store.append_row(PASSWORD, ROW)
        initialised_store.reset()
        # salt is also gone, so has_journal should be False
        assert initialised_store.has_journal() is False
 
    def test_clears_meta(self, initialised_store):
        initialised_store.reset()
        with initialised_store._connect() as con:
            cur = con.execute("SELECT COUNT(*) FROM meta;")
            assert cur.fetchone()[0] == 0
 
    def test_reset_on_empty_store_does_not_raise(self, store):
        store.reset()  # init_db is called internally






# tests for _encrypt_dict() and _decrypt_dict()
class TestEncryptDecryptDict:
    def test_roundtrip(self):
        salt = os.urandom(16)
        data = {"key": "value", "number": 42}
        token = _encrypt_dict(PASSWORD, salt, data)
        assert _decrypt_dict(PASSWORD, salt, token) == data
 
    def test_wrong_password_raises(self):
        salt = os.urandom(16)
        token = _encrypt_dict(PASSWORD, salt, {"x": 1})
        with pytest.raises(InvalidToken):
            _decrypt_dict("wrong", salt, token)
 
    def test_wrong_salt_raises(self):
        salt = os.urandom(16)
        token = _encrypt_dict(PASSWORD, salt, {"x": 1})
        with pytest.raises(InvalidToken):
            _decrypt_dict(PASSWORD, os.urandom(16), token)