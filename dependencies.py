from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from openai import AsyncOpenAI

from helpers.jwt_helper import decode_token
from schemas.user import UserRecord, UserRequest
from state import user_list, user_messages
from config import settings
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()
client = AsyncOpenAI(
    base_url='https://openrouter.ai/api/v1',
    api_key=settings.openai_api_key
)

def get_user_list() -> list[UserRequest]: 
    return user_list

def get_user_messages() -> list[UserRecord]:
    return user_messages

def get_client() -> AsyncOpenAI:
    return client

def get_current_user(
    creds: HTTPAuthorizationCredentials = Depends(security)
) -> str:
    payload = decode_token(creds.credentials) 
    
    username = payload.get("username")
    
    if not username:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    return username

def get_user(username: str):
    user_messages = get_user_messages()
    for row in user_messages:
        if row['username'] == username:
            return row


def strip_system_messages(record):
    """Return a copy of a user record without internal system prompts."""
    return {
        **record,
        "messages": [
            {
                **c,
                "conversation": [
                    m for m in c.get("conversation", []) if m.get("role") != "system"
                ],
            }
            for c in record.get("messages", [])
        ],
    }
