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
