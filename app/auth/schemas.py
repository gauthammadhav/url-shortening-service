from typing import Literal

from pydantic import BaseModel, EmailStr


class RegisterRequest(BaseModel):
    """Registration data accepted from a new user."""

    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """Safe public representation of a registered user."""

    id: int
    email: EmailStr


class TokenResponse(BaseModel):
    """JWT access token returned after successful authentication."""

    access_token: str
    token_type: Literal["bearer"] = "bearer"
