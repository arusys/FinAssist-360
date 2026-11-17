import os
from typing import List, Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "FinAssist 360 – GenAI-Based Banking Service Management"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "finassist360-enterprise-banking-security-key-2025-token-secret")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Database (Default to SQLite for immediate zero-config execution; seamlessly accepts PostgreSQL)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./finassist360.db")
    
    # LLM Settings
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "demo")  # demo, openai, gemini, anthropic
    LLM_API_KEY: Optional[str] = os.getenv("LLM_API_KEY", None)
    LLM_MODEL: str = os.getenv("LLM_MODEL", "1.5 AI model")
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000"
    ]
    
    # Paths
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    DATA_DIR: str = os.path.join(BASE_DIR, "..", "data")
    SAMPLE_DOCS_DIR: str = os.path.join(BASE_DIR, "..", "data", "sample_documents")
    SYNTHETIC_DATA_DIR: str = os.path.join(BASE_DIR, "..", "data", "synthetic_datasets")

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
