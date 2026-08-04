import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Find .env inside the current app directory parent
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
load_dotenv(os.path.join(backend_dir, ".env"))

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Security Investigation Platform (Build with Paritok)"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Paritok Configuration
    PARITOK_API_KEY: str = os.getenv("PARITOK_API_KEY", "")
    PARITOK_PROXY_URL: str = os.getenv("PARITOK_PROXY_URL", "http://localhost:8080")
    
    # Groq LLM Configuration
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    
    # Ingestion & Upload settings
    MAX_UPLOAD_SIZE_MB: int = 500
    
    class Config:
        case_sensitive = True
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
