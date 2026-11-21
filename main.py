# FastAPI related imports
from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware

from openai import AsyncOpenAI

import uuid

# Helpers
from helpers.jwt_helper import create_access_token, decode_token
from helpers.password_helper import verify_password, get_password_hash

# Schemas
from schemas.chat import ChatRequest, Conversation
from schemas.user import UserRequest, UserRecord, UserMessages
from schemas.common import ApiResponse
from config import settings

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

client = AsyncOpenAI(
    base_url='https://openrouter.ai/api/v1',
    api_key=settings.openai_api_key
)

security = HTTPBearer()

messages: list[Conversation] = []

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

user_messages: list[UserRecord] = [
    {
        "username": "username1",
        "messages": [
            {
                "id": "59705889-852d-4a09-a1ba-8e37a849ae11",
                "conversation": [
                     {
                        "role": "user",
                        "content": "What is the capital of Philippines?"
                    },
                    {
                        "role": "assistant",
                        "content": "The capital of the Philippines is Manila"
                    }
                ]
            }
           
        ]
    },
    {
        "username": "username2",
        "messages": [
            {
                "id": "59705889-852d-4a09-a1ba-8e37a849ae11",
                "conversation": [
                        {
                        "role": "user",
                        "content": "What is the capital of Philippines?"
                    },
                    {
                        "role": "assistant",
                        "content": "The capital of the Philippines is Manila"
                    }
                ]
            }
        ]
    }
]

def get_user(username: str):
    for row in user_messages:
        if row['username'] == username:
            return row
        
@app.post("/api/v1/messages/chat")
async def create_chat(body: ChatRequest, creds: HTTPAuthorizationCredentials = Depends(security)) -> ApiResponse:
    
    token = creds.credentials
    
    decoded_token = decode_token(token)
    
    conversation_id: str = body.id or str(uuid.uuid4())
    
    if body.id is None:
        record = get_user(decoded_token['username'])
        record['messages'].append({
            "id": conversation_id,
            "conversation": []
        })
        
    user_list_messages: list[UserMessages] = []
    
    for row in user_messages:
        if row['username'] == decoded_token['username']:
            user_list_messages = row['messages']
            break
    
    conversation: list[Conversation] = []
    
    for row in user_list_messages:
        if row['id'] == body.id:
            conversation = row['conversation']
    
    
    conversation.append({"role": "user", "content": body.message})
    
    response = await client.chat.completions.create(
        model=settings.  ai_model, 
        messages=conversation
    )
    
    reply = response.choices[0].message.content
    
    conversation.append({"role": "assistant", "content": reply})
    
    record = get_user(decoded_token['username'])
    
    for c in record['messages']:
        if c['id'] == conversation_id:
            c['conversation'] = conversation
            break
            
    return {
        "status": 200,
        "message": "Chat successfully created",
        "data": {"id": conversation_id, "role": "assistant", "content": reply}
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