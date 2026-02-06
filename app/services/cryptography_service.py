# Cryptography/KDF helpers will go here later
import base64
import os
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes


def _derive_key(password: str, salt: bytes) -> bytes:
    """
    Derive a 32-byte key from a human password using PBKDF2-HMAC-SHA256.
    - salt: 16 bytes random per journal file
    - iterations: 200k (good classroom default)
    Returns a base64-url key suitable for Fernet.
    """
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(), length=32, salt=salt, iterations=200_000
    )
    return base64.urlsafe_b64encode(kdf.derive(password.encode()))


def _encrypt_bytes(password: str, plaintext: bytes, salt: bytes | None = None) -> dict:
    """
    Encrypt arbitrary bytes with a password.
    Returns a JSON-serializable dict: {'salt': b64, 'ciphertext': b64}.
    """
    salt = os.urandom(16) if salt is None else salt
    key = _derive_key(password, salt)
    token = Fernet(key).encrypt(plaintext)
    return {
        "salt": base64.b64encode(salt).decode(),
        "ciphertext": base64.b64encode(token).decode(),
    }


def _decrypt_bytes(password: str, blob: dict) -> bytes:
    """
    Reverse of _encrypt_bytes. Raises if password is wrong or data is tampered.
    """
    salt = base64.b64decode(blob["salt"])
    token = base64.b64decode(blob["ciphertext"])
    key = _derive_key(password, salt)
    return Fernet(key).decrypt(token)
