"""Environment-driven settings (OpenRouter, DB, CORS)."""

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# backend/ directory (parent of app/)
BACKEND_ROOT = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BACKEND_ROOT / "data"


class Settings(BaseSettings):
    """Single source of truth for configuration."""

    OPENROUTER_API_KEY: str = ""
    OPENROUTER_BASE_URL: str = "https://openrouter.ai/api/v1"
    LLM_MODEL: str = "meta-llama/llama-3.3-70b-instruct:free"
    MAX_UPLOAD_SIZE_MB: int = 50
    ALLOWED_ORIGINS: str = "http://localhost:3000"
    DATABASE_URL: str = "sqlite:///./fallback.db"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    def cors_origins(self) -> list[str]:
        """Parse comma-separated origins for CORSMiddleware."""
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]


settings = Settings()
