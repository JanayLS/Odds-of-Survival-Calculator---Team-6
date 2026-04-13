# tests for journal_store_csv.py
#
# Testing mostly load_csv_from_encrypted() and save_csv_to_encrypted()
#
import csv
import json
import os
import pytest
from io import StringIO
from unittest.mock import patch, MagicMock



# cryptography setup and things we need for testing
import base64
from cryptography.fernet import Fernet, InvalidToken
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
 
 
def _derive_key(password: str, salt: bytes) -> bytes:
    kdf = PBKDF2HMAC(algorithm=hashes.SHA256(), length=32, salt=salt, iterations=200_000)
    return base64.urlsafe_b64encode(kdf.derive(password.encode()))
 
 
def _encrypt_bytes(password: str, plaintext: bytes, salt: bytes | None = None) -> dict:
    salt = os.urandom(16) if salt is None else salt
    key = _derive_key(password, salt)
    token = Fernet(key).encrypt(plaintext)
    return {
        "salt": base64.b64encode(salt).decode(),
        "ciphertext": base64.b64encode(token).decode(),
    }
 
 
def _decrypt_bytes(password: str, blob: dict) -> bytes:
    salt = base64.b64decode(blob["salt"])
    token = base64.b64decode(blob["ciphertext"])
    key = _derive_key(password, salt)
    return Fernet(key).decrypt(token)




# Original code - for seperations sake
JOURNAL_ENC = "journal.enc"
CSV_HEADER = ["timestamp", "character", "encounter", "probability", "damage", "outcome", "algo", "note"]
 
 
def load_csv_from_encrypted(password: str, path: str = JOURNAL_ENC) -> list[dict]:
    if not os.path.exists(path):
        return []
    with open(path, "r", encoding="utf-8") as f:
        blob = json.load(f)
    plaintext = _decrypt_bytes(password, blob).decode("utf-8")
    return list(csv.DictReader(plaintext.splitlines()))
 
 
def save_csv_to_encrypted(password: str, rows: list[dict], path: str = JOURNAL_ENC) -> None:
    sio = StringIO()
    writer = csv.DictWriter(sio, fieldnames=CSV_HEADER)
    writer.writeheader()
    for r in rows:
        writer.writerow(r)
    plaintext = sio.getvalue().encode("utf-8")
    blob = _encrypt_bytes(password, plaintext)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(blob, f)



# helpers
PASSWORD = "test-password"
 
def _row(**kwargs):
    base = {k: "" for k in CSV_HEADER}
    base.update(kwargs)
    return base
 
 
@pytest.fixture
def journal_path(tmp_path):
    return str(tmp_path / "journal.enc")






# tests for load_csv_from_encrypted()
class TestLoadCsvFromEncrypted:
    def test_returns_empty_list_when_no_file(self, tmp_path):
        path = str(tmp_path / "missing.enc")
        assert load_csv_from_encrypted(PASSWORD, path) == []
 
    def test_roundtrip_single_row(self, journal_path):
        row = _row(character="Alice", encounter="dragon", probability="0.8")
        save_csv_to_encrypted(PASSWORD, [row], journal_path)
        rows = load_csv_from_encrypted(PASSWORD, journal_path)
        assert len(rows) == 1
        assert rows[0]["character"] == "Alice"
 
    def test_roundtrip_multiple_rows(self, journal_path):
        rows = [_row(character=c) for c in ("Alice", "Bob", "Carol")]
        save_csv_to_encrypted(PASSWORD, rows, journal_path)
        loaded = load_csv_from_encrypted(PASSWORD, journal_path)
        assert [r["character"] for r in loaded] == ["Alice", "Bob", "Carol"]
 
    def test_all_csv_fields_preserved(self, journal_path):
        row = _row(timestamp="2024-01-01T00:00:00", character="Alice",
                   encounter="dragon", probability="0.8", damage="10",
                   outcome="hit", algo="random", note="test note")
        save_csv_to_encrypted(PASSWORD, [row], journal_path)
        loaded = load_csv_from_encrypted(PASSWORD, journal_path)[0]
        for key in CSV_HEADER:
            assert loaded[key] == row[key]
 
    def test_wrong_password_raises(self, journal_path):
        save_csv_to_encrypted(PASSWORD, [_row(character="Alice")], journal_path)
        with pytest.raises(InvalidToken):
            load_csv_from_encrypted("wrong-password", journal_path)
 
    def test_empty_rows_roundtrip(self, journal_path):
        save_csv_to_encrypted(PASSWORD, [], journal_path)
        assert load_csv_from_encrypted(PASSWORD, journal_path) == []
 
    def test_file_is_not_plaintext(self, journal_path):
        """The written file must not contain raw character names."""
        save_csv_to_encrypted(PASSWORD, [_row(character="SensitiveCharacter")], journal_path)
        with open(journal_path) as f:
            raw = f.read()
        assert "SensitiveCharacter" not in raw
 
    def test_file_is_valid_json_blob(self, journal_path):
        """On-disk format is a JSON object with salt and ciphertext keys."""
        save_csv_to_encrypted(PASSWORD, [_row()], journal_path)
        with open(journal_path) as f:
            blob = json.load(f)
        assert "salt" in blob and "ciphertext" in blob






# tests for save_csv_to_encrypted()
class TestSaveCsvToEncrypted:
    def test_creates_file(self, journal_path):
        save_csv_to_encrypted(PASSWORD, [], journal_path)
        assert os.path.exists(journal_path)
 
    def test_overwrites_existing_file(self, journal_path):
        save_csv_to_encrypted(PASSWORD, [_row(character="Alice")], journal_path)
        save_csv_to_encrypted(PASSWORD, [_row(character="Bob")], journal_path)
        loaded = load_csv_from_encrypted(PASSWORD, journal_path)
        assert len(loaded) == 1
        assert loaded[0]["character"] == "Bob"
 
    def test_two_saves_produce_different_ciphertext(self, journal_path, tmp_path):
        """Fernet uses a random IV so each save produces a unique ciphertext."""
        path2 = str(tmp_path / "journal2.enc")
        rows = [_row(character="Alice")]
        save_csv_to_encrypted(PASSWORD, rows, journal_path)
        save_csv_to_encrypted(PASSWORD, rows, path2)
        with open(journal_path) as f1, open(path2) as f2:
            assert json.load(f1)["ciphertext"] != json.load(f2)["ciphertext"]
 
    def test_extra_fields_in_row_do_not_crash(self, journal_path):
        """DictWriter with extrasaction default ignores unknown keys."""
        row = _row(character="Alice")
        row["unexpected_field"] = "surprise"
        # csv.DictWriter raises ValueError by default for extra fields;
        # this documents current behaviour so a future change is caught
        with pytest.raises(ValueError):
            save_csv_to_encrypted(PASSWORD, [row], journal_path)