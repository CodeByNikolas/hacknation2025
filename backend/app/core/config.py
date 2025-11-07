from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings"""
    
    # API Settings
    API_V1_STR: str = "/api"
    PROJECT_NAME: str = "HackNation 2025 API"
    VERSION: str = "1.0.0"
    
    # CORS Settings
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
    ]
    
    # Database Settings
    DATABASE_URL: str = "sqlite:///./app.db"
    
    # Security Settings
    SECRET_KEY: str = "your-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

