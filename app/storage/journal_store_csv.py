# Encrypted journal load/save will go here later
import os
import json
import csv
import getpass
from io import StringIO
from typing import List, Dict
from app.services.cryptography_service import _encrypt_bytes, _decrypt_bytes
from app.storage.paths import JOURNAL_PATH, FIXED_MAP_PATH  # if you use them

JOURNAL_ENC = "journal.enc"
CSV_HEADER = [
    "timestamp",
    "character",
    "encounter",
    "probability",
    "damage",
    "outcome",
    "algo",
    "note",
]


def load_csv_from_encrypted(password: str) -> list[dict]:
    """
    Read the encrypted journal from JOURNAL_ENC using the given password.

    Flow:
      1) Read JSON blob {salt, ciphertext}.
      2) Derive key from password+salt (PBKDF2).
      3) Decrypt with Fernet (verifies integrity).
      4) Parse CSV text into a list of dict rows.

    Returns [] on first run (no file).
    """
    if not os.path.exists(JOURNAL_ENC):
        return []
    with open(JOURNAL_ENC, "r", encoding="utf-8") as f:
        blob = json.load(f)
    plaintext = _decrypt_bytes(password, blob).decode("utf-8")
    return list(csv.DictReader(plaintext.splitlines()))


def save_csv_to_encrypted(password: str, rows: list[dict]) -> None:
    """
    Serialize rows → CSV text → encrypt → write JOURNAL_ENC.

    Using authenticated encryption (Fernet) ensures the file cannot be
    modified without detection and keeps the contents confidential.
    """
    sio = StringIO()
    writer = csv.DictWriter(sio, fieldnames=CSV_HEADER)
    writer.writeheader()
    for r in rows:
        writer.writerow(r)
    plaintext = sio.getvalue().encode("utf-8")
    blob = _encrypt_bytes(password, plaintext)
    with open(JOURNAL_ENC, "w", encoding="utf-8") as f:
        json.dump(blob, f)


def change_password(old_pwd: str, rows: list[dict]) -> str:
    """
    Optional 'verify current password' step + set a new password.
    Re-encrypts the already-decrypted `rows` with the new password and saves.
    Returns the new password on success, "" on failure.
    """
    check = getpass.getpass("Current password: ")
    if check != old_pwd:
        print("Incorrect current password.")
        return ""
    p1 = getpass.getpass("New password: ")
    p2 = getpass.getpass("Confirm new password: ")
    if not p1 or p1 != p2:
        print("Passwords did not match.")
        return ""
    save_csv_to_encrypted(p1, rows)
    print("Password updated.")
    return p1


def reset_journal() -> bool:
    """
    Safely remove journal.enc after a typed confirmation.
    Does not modify in-memory `rows`; caller should clear those.
    """
    confirm = input('Type "DELETE" to permanently remove journal.enc: ').strip()
    if confirm != "DELETE":
        print("Reset canceled.")
        return False
    try:
        os.remove(JOURNAL_ENC)
        print("journal.enc removed.")
        return True
    except FileNotFoundError:
        print("No journal to remove.")
        return False


def open_or_create_journal() -> tuple[list[dict], str]:
    """
    If journal.enc exists: loop until a valid password decrypts it (or user cancels).
    If it doesn't: ask the user to create/confirm a new password; start empty.
    Returns (rows, password). If canceled, returns ([], "").
    """
    if os.path.exists(JOURNAL_ENC):
        while True:
            pwd = getpass.getpass("Enter journal password (Enter to cancel): ")
            if not pwd:
                print("Canceled.")
                return [], ""
            try:
                rows = load_csv_from_encrypted(pwd)
                return rows, pwd
            except Exception:
                print("Wrong password or corrupt file. Try again.")
    else:
        while True:
            p1 = getpass.getpass("Create a new password: ")
            p2 = getpass.getpass("Confirm password: ")
            if p1 and p1 == p2:
                print("New journal created.")
                return [], p1
            print("Passwords did not match. Try again.")
