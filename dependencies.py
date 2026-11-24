from schemas.user import UserRecord, UserRequest
from state import user_list, user_messages

def get_user_list() -> list[UserRequest]: 
    return user_list

def get_user_messages() -> list[UserRecord]:
    return user_messages