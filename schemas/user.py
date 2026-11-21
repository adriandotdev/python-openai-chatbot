from pydantic import BaseModel
from schemas.chat import Conversation

class UserRequest(BaseModel):
    username: str
    password: str

class UserMessages(BaseModel):
    id: str
    conversation: list[Conversation]
    
class UserRecord(BaseModel):
    username: str
    messages: UserMessages