from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    cors_origins: list[str] = ["http://localhost:3000", "http://localhost:3009"]

settings = Settings()
