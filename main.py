import os
from fastapi import FastAPI
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

@app.get("/")
def index():
    return {
        "message": "Hello"
    }
    
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
    
    access_token = create_access_token({"username": body.username, "type": "access_token"})
    
    data = {
        "username": body.username,
        "password": get_password_hash(body.password), # This is for testing only
        "access_token": access_token
    }
    
    return {
        "status": 201,
        "message": "User successfully created",
        "data": data
    }