import os
import jwt
from jwt.exceptions import InvalidTokenError
from dotenv import load_dotenv
from datetime import UTC, datetime, timedelta
from config import settings

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(UTC) + expires_delta
    else:
        expire = datetime.now(UTC) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt

def decode_token(token: str):
    decoded_token = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])

    return decoded_token