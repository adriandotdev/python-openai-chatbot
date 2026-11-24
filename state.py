from schemas.chat import Conversation
from schemas.user import UserRecord, UserRequest


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
                        "content": "What is the capital of France?"
                    },
                    {
                        "role": "assistant",
                        "content": "Paris, of course, the City of Light! Stroll along the Seine and you'll see why."
                    }
                ]
            }
           
        ]
    },
    {
        "username": "username2",
        "messages": [
            {
                "messages": [
                    {
                        "id": "59705889-852d-4a09-a1ba-8eZ37a849ae11",
                        "conversation": [
                            {
                                "role": "user",
                                "content": "What is the capital of France?"
                            },
                            {
                                "role": "assistant",
                                "content": "Paris, of course, the City of Light! Stroll along the Seine and you'll see why."
                            }
                        ]
                    }
                    
                ]
            }
        ]
    }
]