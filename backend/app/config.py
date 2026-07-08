import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    GROQ_API_KEY: str = ""
    OPENROUTER_API_KEY: str = ""
    NIM_API_KEY: str = ""
    TAVILY_API_KEY: str = ""
    ALLOWED_ORIGINS: str = "http://localhost:5173"
    PORT: int = 8000
    HOST: str = "0.0.0.0"

    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

    model_config = SettingsConfigDict(
        # Load from .env file relative to the app directory (which is in the backend directory)
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
