from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")

    openai_api_key: str
    ai_model: str
    secret_key: str
    algorithm: str = "HS256"
    cors_origins: str = "http://localhost:3000"
    
settings = Settings()
