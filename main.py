from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

@app.get("/")
def index():
    return {
        "message": "Hello"
    }
    
@app.post("/chat")
def create_chat():
    return {
        "message": "Chat successfully created"
    }