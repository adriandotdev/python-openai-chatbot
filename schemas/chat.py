from pydantic import BaseModel

class Conversation(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    id: str | None = None
    message: str