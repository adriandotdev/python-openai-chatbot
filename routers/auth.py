from fastapi import APIRouter, Depends, HTTPException

from dependencies import get_user_list, get_user_messages
from helpers.jwt_helper import create_access_token
from helpers.password_helper import verify_password
from schemas.user import UserRecord, UserRequest

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

@router.post('/login')
async def login(body: UserRequest, user_list: list[UserRequest] = Depends(get_user_list), user_messages: list[UserRecord] = Depends(get_user_messages)):
    
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
        "message": "Logged in successfully",
        "data": data
    }