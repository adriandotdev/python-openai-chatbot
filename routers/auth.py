from fastapi import APIRouter, Depends, HTTPException, status

from dependencies import get_user_list, get_user_messages, strip_system_messages
from helpers.jwt_helper import create_access_token
from helpers.password_helper import get_password_hash, verify_password
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
        "chat": strip_system_messages(chat) if chat else chat,
        "access_token": access_token
    }
    
    return {
        "status": 200,
        "message": "Logged in successfully",
        "data": data
    }
    
@router.post('/signup')
async def signup(body: UserRequest, user_list: list[UserRequest] = Depends(get_user_list), user_messages: list[UserRecord] = Depends(get_user_messages)):
    
   user =  next((u for u in user_list if str.lower(u["username"]) == str.lower(body.username)), None)
   
   print(user)
   
   if user is not None:
       raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="Username already exists")

   
   hashed_password = get_password_hash(body.password)
   
   user_list.append({
       "username": body.username,
       "password": hashed_password
   })
   
   user_messages.append({
       "username": body.username,
       "messages": []
   })
   
   access_token = create_access_token({"username": body.username, "type": "access_token"})
   
   data = {
       "chat": None,
       "access_token": access_token
   }
   return {
       "status": 201,
       "message": "Signed up successfully",
       "data": data
   }