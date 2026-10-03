from fastapi import UploadFile

from app.config import get_settings


class ImageValidationError(Exception):
    """Raised when an uploaded image fails a validation check.
    Carries a user-facing message safe to return in an API response."""

    def __init__(self, message: str):
        self.message = message
        super().__init__(message)


async def validate_upload(file: UploadFile) -> bytes:
    """Validate an uploaded file's type and size, returning its raw bytes.

    Raises ImageValidationError with a message suitable for direct display
    to the user (per the project's error-handling requirements).
    """
    settings = get_settings()

    if file.content_type not in settings.allowed_content_types:
        raise ImageValidationError("Please upload a JPG, JPEG, or PNG image.")

    raw = await file.read()

    max_bytes = settings.max_upload_size_mb * 1024 * 1024
    if len(raw) == 0:
        raise ImageValidationError("Please upload or capture an image first.")
    if len(raw) > max_bytes:
        raise ImageValidationError(
            f"Image is too large. Please use a file under {settings.max_upload_size_mb}MB."
        )

    return raw
