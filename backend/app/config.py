from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Central app configuration. Values can be overridden via a .env file
    or environment variables (see .env.example)."""

    app_name: str = "Skin Tone Analysis API"
    api_prefix: str = "/api"

    # CORS: the Vite dev server origin by default. Add your deployed
    # frontend origin here (or via env var) before shipping.
    cors_origins: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    # Upload limits, enforced in utils/validators.py
    max_upload_size_mb: int = 8
    allowed_content_types: tuple[str, ...] = (
        "image/jpeg",
        "image/jpg",
        "image/png",
    )

    # Trained model location. Currently a scikit-learn joblib bundle (see
    # scripts/train_model.py); the Keras/MobileNetV2 path documented in
    # scripts/train_cnn_mobilenetv2.py would live at a .keras path instead.
    model_path: str = "trained_models/skin_tone_model.joblib"
    class_names_path: str = "trained_models/class_names.json"

    class Config:
        env_file = ".env"
        env_prefix = "APP_"


@lru_cache
def get_settings() -> Settings:
    return Settings()
