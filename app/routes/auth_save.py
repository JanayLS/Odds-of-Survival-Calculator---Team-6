from __future__ import annotations

import json
import os
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict

from flask import Blueprint, current_app, jsonify, request, session

from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes

auth_save_bp = Blueprint("auth_save", __name__)

MAGIC = b"PV1"
SALT_LEN = 16
NONCE_LEN = 12
PBKDF2_ITERS = 200_000


def _safe_username(username: str) -> str:
    username = (username or "").strip().lower()
    safe = "".join(ch for ch in username if ch.isalnum() or ch in ("_", "-"))
    return safe


@dataclass(frozen=True)
class SaveConfig:
    base_dir: Path

    @staticmethod
    def from_app() -> "SaveConfig":
        save_dir = current_app.config.get("SAVE_DIR")
        if save_dir:
            base_dir = Path(save_dir)
        else:
            project_root = Path(current_app.root_path).parent
            base_dir = project_root / "data"

        base_dir.mkdir(parents=True, exist_ok=True)
        return SaveConfig(base_dir=base_dir)

    def path_for_user(self, username: str) -> Path:
        safe = _safe_username(username)
        return self.base_dir / f"{safe}.json"


def _default_payload() -> Dict[str, Any]:
    return {"v": 1, "username": "placeholder"}


def _derive_key(password: str, salt: bytes) -> bytes:
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=PBKDF2_ITERS,
    )
    return kdf.derive(password.encode("utf-8"))


def _encrypt_json(password: str, payload: Dict[str, Any]) -> bytes:
    salt = os.urandom(SALT_LEN)
    key = _derive_key(password, salt)
    aes = AESGCM(key)
    nonce = os.urandom(NONCE_LEN)
    plaintext = json.dumps(payload, separators=(",", ":"), ensure_ascii=False).encode(
        "utf-8"
    )
    ciphertext = aes.encrypt(nonce, plaintext, None)
    return MAGIC + salt + nonce + ciphertext


def _decrypt_json(password: str, blob: bytes) -> Dict[str, Any]:
    if len(blob) < len(MAGIC) + SALT_LEN + NONCE_LEN or blob[: len(MAGIC)] != MAGIC:
        raise ValueError("Invalid save file format")

    salt_off = len(MAGIC)
    nonce_off = salt_off + SALT_LEN
    ct_off = nonce_off + NONCE_LEN

    salt = blob[salt_off:nonce_off]
    nonce = blob[nonce_off:ct_off]
    ciphertext = blob[ct_off:]

    key = _derive_key(password, salt)
    aes = AESGCM(key)
    plaintext = aes.decrypt(nonce, ciphertext, None)
    return json.loads(plaintext.decode("utf-8"))


@auth_save_bp.post("/api/auth/login")
def login_or_create_account():
    cfg = SaveConfig.from_app()
    data = request.get_json(silent=True) or {}

    username_raw = (data.get("username") or "").strip()
    password = (data.get("password") or "").strip()
    create = bool(data.get("create", False))

    username = _safe_username(username_raw)
    if not username or not password:
        return jsonify(ok=False, error="username and password required"), 400

    path = cfg.path_for_user(username)

    if create:
        if path.exists():
            return jsonify(ok=False, error="Account already exists"), 409

        payload = _default_payload()
        payload["username"] = username
        path.write_bytes(_encrypt_json(password, payload))

        session["username"] = username
        session["password"] = password
        return jsonify(ok=True, username=username, created=True)

    if not path.exists():
        return (
            jsonify(
                ok=False,
                error="Account does not exist. Check 'Create new account'.",
            ),
            404,
        )

    try:
        _decrypt_json(password, path.read_bytes())
    except Exception:
        return jsonify(ok=False, error="Invalid username or password"), 401

    session["username"] = username
    session["password"] = password
    return jsonify(ok=True, username=username, created=False)


@auth_save_bp.post("/api/auth/logout")
def logout():
    session.pop("username", None)
    session.pop("password", None)
    return jsonify(ok=True)


@auth_save_bp.get("/api/auth/me")
def me():
    username = session.get("username")
    return jsonify(ok=True, logged_in=bool(username), username=username)


@auth_save_bp.post("/api/save-game")
def save_game():
    username = session.get("username")
    password = session.get("password")

    if not username or not password:
        return jsonify(ok=False, error="You must be logged in to save."), 401

    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify(ok=False, error="Invalid save payload"), 400

    cfg = SaveConfig.from_app()
    path = cfg.path_for_user(username)

    payload = {
        "v": 1,
        "username": username,
        "game": data,
    }

    path.write_bytes(_encrypt_json(password, payload))
    return jsonify(ok=True, message="Game saved successfully")


@auth_save_bp.get("/api/load-game")
def load_game():
    username = session.get("username")
    password = session.get("password")

    if not username or not password:
        return jsonify(ok=False, error="You must be logged in to load."), 401

    cfg = SaveConfig.from_app()
    path = cfg.path_for_user(username)

    if not path.exists():
        return jsonify(ok=False, error="No save file found"), 404

    try:
        payload = _decrypt_json(password, path.read_bytes())
    except Exception:
        return jsonify(ok=False, error="Failed to decrypt save file"), 500

    game_data = payload.get("game")
    if not isinstance(game_data, dict):
        return jsonify(ok=False, error="No saved game data found"), 404

    return jsonify(game_data), 200
