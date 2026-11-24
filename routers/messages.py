import uuid

from fastapi import APIRouter, Depends, HTTPException
from openai import AsyncOpenAI

from dependencies import get_client, get_current_user, get_user, get_user_messages, strip_system_messages

from schemas.chat import ChatRequest, Conversation
from schemas.common import ApiResponse
from schemas.user import UserMessages, UserRecord
from helpers.prompts import system_prompt, response_guideline, response_tone
from config import settings

router = APIRouter(prefix="/api/v1/messages", tags=["messages"])

@router.get('')
def get_conversations(username: str = Depends(get_current_user)):
    
    return strip_system_messages(get_user(username))

@router.post("/chat")
async def create_chat(body: ChatRequest, username: str = Depends(get_current_user), user_messages: list[UserRecord] = Depends(get_user_messages), client: AsyncOpenAI = Depends(get_client)) -> ApiResponse:
    
    conversation_id: str = body.id or str(uuid.uuid4())
    
    if body.id is None:
        record = get_user(username)
        record['messages'].append({
            "id": conversation_id,
            "conversation": []
        })
        
    user_list_messages: list[UserMessages] = []
    
    for row in user_messages:
        if row['username'] == username:
            user_list_messages = row['messages']
            break
    
    conversation: list[Conversation] = [{
        "role": "system",
        "content": system_prompt + response_guideline + response_tone
    }]
    
    for row in user_list_messages:
        if row['id'] == body.id:
            conversation = row['conversation']
    
    
    conversation.append({"role": "user", "content": body.message})
    
    response = await client.chat.completions.create(
        model=settings.ai_model, 
        messages=conversation
    )
    
    reply = response.choices[0].message.content
    
    conversation.append({"role": "assistant", "content": reply})
    
    record = get_user(username)
    
    for c in record['messages']:
        if c['id'] == conversation_id:
            c['conversation'] = conversation
            break
            
    return {
        "status": 200,
        "message": "Chat successfully created",
        "data": {"id": conversation_id, "role": "assistant", "content": reply}
    }

@router.delete('/chat/{id}')
def delete_conversation_by_id(id: str, username: str = Depends(get_current_user), user_messages: list[UserRecord] = Depends(get_user_messages)) -> ApiResponse:
  
    user_record = next((u for u in user_messages if u["username"] == username), None)
    
    if user_record is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    new_user_messages = []
    
    for record in user_record["messages"]:
        if record["id"] != id:
            new_user_messages.append(record)
            
    print(new_user_messages)
    
    for row in user_messages:
        if row["username"] == username:
            row["messages"] = new_user_messages
            break
        
    return {
        "status": 201,
        "message": "Conversation successfully deleted"
    }
