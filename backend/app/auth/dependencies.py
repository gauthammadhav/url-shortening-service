from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.security import get_jwt_config
from app.database import get_db
from app.models import User


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)


def _credentials_exception() -> HTTPException:
    """Build the generic response used for all invalid credentials."""
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )


def get_current_user(
    token: Annotated[str | None, Depends(oauth2_scheme)],
    db: Annotated[Session, Depends(get_db)],
) -> User:
    """Decode a bearer token and return the user identified by its subject."""
    if token is None:
        raise _credentials_exception()

    try:
        secret_key, algorithm = get_jwt_config()
        payload = jwt.decode(token, secret_key, algorithms=[algorithm])
        subject = payload.get("sub")
        if not isinstance(subject, str):
            raise ValueError("JWT subject is missing or malformed.")
        user_id = int(subject)
    except (JWTError, TypeError, ValueError):
        raise _credentials_exception() from None

    user = db.scalar(select(User).where(User.id == user_id))
    if user is None:
        raise _credentials_exception()

    return user
