# Tests for cryptography_service.py
import base64
import pytest
from unittest.mock import patch
import os

# cryptography_service.py -- I just copied the code here to make the tests seperate
import base64
import os
from cryptography.fernet import Fernet, InvalidToken
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



# HELPERS
FIXED_SALT = b"\x00" * 16
PASSWORD = "correct-horse-battery-staple"
PLAINTEXT = b"hello, journal"






# _derive_key() Tests
class TestDeriveKey:
    def test_returns_bytes(self):
        key = _derive_key(PASSWORD, FIXED_SALT)
        assert isinstance(key, bytes)
 
    def test_valid_fernet_key(self):
        """Derived key must be usable as a Fernet key (44-char base64url)."""
        key = _derive_key(PASSWORD, FIXED_SALT)
        Fernet(key)  # raises if key is malformed
 
    def test_deterministic(self):
        """Same password + salt always yields the same key."""
        key1 = _derive_key(PASSWORD, FIXED_SALT)
        key2 = _derive_key(PASSWORD, FIXED_SALT)
        assert key1 == key2
 
    def test_different_passwords_produce_different_keys(self):
        key1 = _derive_key("password-a", FIXED_SALT)
        key2 = _derive_key("password-b", FIXED_SALT)
        assert key1 != key2
 
    def test_different_salts_produce_different_keys(self):
        key1 = _derive_key(PASSWORD, b"\x00" * 16)
        key2 = _derive_key(PASSWORD, b"\xff" * 16)
        assert key1 != key2
 
    def test_empty_password(self):
        """Empty passwords are allowed; key should still be valid."""
        key = _derive_key("", FIXED_SALT)
        Fernet(key)
 
    def test_unicode_password(self):
        key = _derive_key("pässwörð", FIXED_SALT)
        Fernet(key)





# _encrypt_bytes() Tests
class TestEncryptBytes:
    def test_returns_dict_with_expected_keys(self):
        blob = _encrypt_bytes(PASSWORD, PLAINTEXT)
        assert set(blob.keys()) == {"salt", "ciphertext"}
 
    def test_salt_and_ciphertext_are_strings(self):
        blob = _encrypt_bytes(PASSWORD, PLAINTEXT)
        assert isinstance(blob["salt"], str)
        assert isinstance(blob["ciphertext"], str)
 
    def test_salt_is_valid_base64(self):
        blob = _encrypt_bytes(PASSWORD, PLAINTEXT)
        decoded = base64.b64decode(blob["salt"])
        assert len(decoded) == 16
 
    def test_ciphertext_is_valid_base64(self):
        blob = _encrypt_bytes(PASSWORD, PLAINTEXT)
        base64.b64decode(blob["ciphertext"])  # must not raise
 
    def test_random_salt_generated_when_none(self):
        """Two calls without an explicit salt should produce different salts."""
        blob1 = _encrypt_bytes(PASSWORD, PLAINTEXT)
        blob2 = _encrypt_bytes(PASSWORD, PLAINTEXT)
        assert blob1["salt"] != blob2["salt"]
 
    def test_explicit_salt_is_used(self):
        blob = _encrypt_bytes(PASSWORD, PLAINTEXT, salt=FIXED_SALT)
        assert base64.b64decode(blob["salt"]) == FIXED_SALT
 
    def test_ciphertext_differs_on_each_call(self):
        """Fernet uses a random IV, so ciphertext is never the same twice."""
        blob1 = _encrypt_bytes(PASSWORD, PLAINTEXT)
        blob2 = _encrypt_bytes(PASSWORD, PLAINTEXT)
        assert blob1["ciphertext"] != blob2["ciphertext"]
 
    def test_encrypts_empty_plaintext(self):
        blob = _encrypt_bytes(PASSWORD, b"")
        assert "ciphertext" in blob
 
    def test_encrypts_large_plaintext(self):
        large = os.urandom(1024 * 1024)  # 1 MB
        blob = _encrypt_bytes(PASSWORD, large)
        assert "ciphertext" in blob
 
    def test_os_urandom_called_when_salt_is_none(self):
        """os.urandom(16) must be called at least once for the salt.
        Fernet also calls os.urandom internally for its IV, so we assert
        the first call used 16 bytes and that the salt in the blob matches."""
        with patch("os.urandom", return_value=FIXED_SALT) as mock_rand:
            blob = _encrypt_bytes(PASSWORD, PLAINTEXT)
        assert mock_rand.call_args_list[0] == ((16,),)
        assert base64.b64decode(blob["salt"]) == FIXED_SALT





# _decrypt_bytes() Tests
class TestDecryptBytes:
    def test_roundtrip(self):
        blob = _encrypt_bytes(PASSWORD, PLAINTEXT, salt=FIXED_SALT)
        assert _decrypt_bytes(PASSWORD, blob) == PLAINTEXT
 
    def test_roundtrip_empty_plaintext(self):
        blob = _encrypt_bytes(PASSWORD, b"", salt=FIXED_SALT)
        assert _decrypt_bytes(PASSWORD, blob) == b""
 
    def test_roundtrip_binary_data(self):
        binary = bytes(range(256))
        blob = _encrypt_bytes(PASSWORD, binary, salt=FIXED_SALT)
        assert _decrypt_bytes(PASSWORD, blob) == binary
 
    def test_wrong_password_raises(self):
        blob = _encrypt_bytes(PASSWORD, PLAINTEXT, salt=FIXED_SALT)
        with pytest.raises(InvalidToken):
            _decrypt_bytes("wrong-password", blob)
 
    def test_tampered_ciphertext_raises(self):
        blob = _encrypt_bytes(PASSWORD, PLAINTEXT, salt=FIXED_SALT)
        raw = base64.b64decode(blob["ciphertext"])
        # Flip the last byte
        tampered = raw[:-1] + bytes([raw[-1] ^ 0xFF])
        blob["ciphertext"] = base64.b64encode(tampered).decode()
        with pytest.raises(InvalidToken):
            _decrypt_bytes(PASSWORD, blob)
 
    def test_tampered_salt_raises(self):
        blob = _encrypt_bytes(PASSWORD, PLAINTEXT, salt=FIXED_SALT)
        bad_salt = base64.b64encode(b"\xff" * 16).decode()
        blob["salt"] = bad_salt
        with pytest.raises(InvalidToken):
            _decrypt_bytes(PASSWORD, blob)
 
    def test_missing_salt_key_raises(self):
        blob = _encrypt_bytes(PASSWORD, PLAINTEXT, salt=FIXED_SALT)
        del blob["salt"]
        with pytest.raises(KeyError):
            _decrypt_bytes(PASSWORD, blob)
 
    def test_missing_ciphertext_key_raises(self):
        blob = _encrypt_bytes(PASSWORD, PLAINTEXT, salt=FIXED_SALT)
        del blob["ciphertext"]
        with pytest.raises(KeyError):
            _decrypt_bytes(PASSWORD, blob)
 
    def test_random_salt_roundtrip(self):
        """End-to-end with os.urandom salt (most common real-world path)."""
        blob = _encrypt_bytes(PASSWORD, PLAINTEXT)
        assert _decrypt_bytes(PASSWORD, blob) == PLAINTEXT
 
    def test_multiple_messages_independent(self):
        """Encrypting several messages with the same password is independent."""
        messages = [b"msg one", b"msg two", b"msg three"]
        blobs = [_encrypt_bytes(PASSWORD, m) for m in messages]
        for original, blob in zip(messages, blobs):
            assert _decrypt_bytes(PASSWORD, blob) == original