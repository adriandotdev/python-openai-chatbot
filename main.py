import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import AsyncOpenAI
from dotenv import load_dotenv
from pwdlib import PasswordHash
from typing import Any

# Helpers
from helpers.jwt_helper import create_access_token
from helpers.password_helper import verify_password, get_password_hash

load_dotenv()

# Models
class Conversation(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    
class ApiResponse(BaseModel):
    status: int
    message: str
    data: Any = None

class UserRequest(BaseModel):
    username: str
    password: str

class UserMessage(BaseModel):
    username: str
    message: list[Conversation]
    
# ===== Models ====

openai_api_key = os.getenv("OPENAI_API_KEY")
ai_model = os.getenv("AI_MODEL")
jwt_secret_key = os.getenv("SECRET_KEY")
jwt_alg = os.getenv("ALGORITHM")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

client = AsyncOpenAI(
    base_url='https://openrouter.ai/api/v1',
    api_key=openai_api_key
)

user_messages: list[Conversation] = []

user_list: list[UserRequest] = [
    {
        "username": "username1",
        "password": "$argon2id$v=19$m=65536,t=3,p=4$+22D0bk0qHU2MS6Yk8UFDg$9ann2cQfyG3bYR5vqISe8TL5Vg+5kP6BoWGH6fSs9ZY"
    },
    {
        "username": "username2",
        "password": "$argon2id$v=19$m=65536,t=3,p=4$+22D0bk0qHU2MS6Yk8UFDg$9ann2cQfyG3bYR5vqISe8TL5Vg+5kP6BoWGH6fSs9ZY"
    }
]

user_messages: list[UserMessage] = [
    {
        "username": "username1",
        "message": [
            {
                "role": "user",
                "content": "What is the capital of Philippines?"
            },
            {
                "role": "assistant",
                "content": "The capital of the Philippines is Manila"
            }
        ]
    },
    {
        "username": "username2",
        "message": [
            {
                "role": "user",
                "content": "What is the capital of Italy?"
            },
            {
                "role": "assistant",
                "content": "The capital of Italy is Rome"
            }
        ]
    }
]

@app.post("/api/v1/messages/chat")
async def create_chat(body: ChatRequest) -> ApiResponse:
    
    user_messages.append({"role": "user", "content": body.message})
    
    response = await client.chat.completions.create(
        model=ai_model, 
        messages=user_messages
    )
    
    reply = response.choices[0].message.content
    
    user_messages.append({"role": "assistant", "content": reply})
    
    return {
        "status": 200,
        "message": "Chat successfully created",
        "data": [{"role": "assistant", "content": reply}]
    }

@app.post('/api/v1/users/create')
async def create_user(body: UserRequest) -> ApiResponse:
    
    if any(u["username"] == body.username for u in user_list):
        raise HTTPException(status_code=409, detail="Username already exist")
        
    access_token = create_access_token({"username": body.username, "type": "access_token"})
    
    hashed_password =  get_password_hash(body.password)
    
    data = {
        "username": body.username,
        "access_token": access_token
    }
    
    user_list.append({
        "username": body.username,
        "password": hashed_password
    })
    
    return {
        "status": 201,
        "message": "User successfully created",
        "data": data
    }
    
@app.post("/api/v1/auth/login")
async def login(body: UserRequest):
    
    user = None
    
    for u in user_list:
        if u["username"] == body.username:
            user = u
            break
        
    if user is None:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    is_password_valid = verify_password(body.password, user["password"])
    
    if is_password_valid is False:
        raise HTTPException(status_code = 401, detail="Invalid credentials")
    
    access_token = create_access_token({"username": body.username, "type": "access_token"})
    
    chat = None
    
    for row in user_messages:
        if row['username'] == user['username']:
            chat = row
            break
        
    data = {
        "chat": chat,
        "access_token": access_token
    }
    
    return {
        "status": 201,
        "message": "User successfully created",
        "data": data
    }