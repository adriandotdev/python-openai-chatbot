import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import AsyncOpenAI
from dotenv import load_dotenv

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
    data: list[Conversation] = None
    
# ===== Models ====

openai_api_key = os.getenv("OPENAI_API_KEY")
ai_model = os.getenv("AI_MODEL")

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
    