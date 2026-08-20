import os
from datetime import UTC, datetime, timedelta
from typing import Any

from jose import jwt
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_jwt_config() -> tuple[str, str]:
    """Return the JWT signing configuration from environment variables."""
    secret_key = os.getenv("JWT_SECRET_KEY")
    algorithm = os.getenv("JWT_ALGORITHM")

    if not secret_key:
        raise RuntimeError("JWT_SECRET_KEY environment variable is not set.")
    if not algorithm:
        raise RuntimeError("JWT_ALGORITHM environment variable is not set.")

    return secret_key, algorithm


def hash_password(password: str) -> str:
    """Hash a plaintext password with bcrypt before storing it."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Return whether a plaintext password matches its stored bcrypt hash."""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(
    data: dict[str, Any], expires_delta: timedelta | None = None
) -> str:
    """Create a signed JWT access token with an expiration claim."""
    secret_key, algorithm = get_jwt_config()

    payload = data.copy()
    expires_at = datetime.now(UTC) + (
        expires_delta or timedelta(minutes=15)
    )
    payload["exp"] = expires_at
    return jwt.encode(payload, secret_key, algorithm=algorithm)
