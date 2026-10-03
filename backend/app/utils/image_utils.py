import io

from PIL import Image, UnidentifiedImageError

from app.utils.validators import ImageValidationError


def decode_image(raw_bytes: bytes) -> Image.Image:
    """Decode raw upload bytes into a PIL Image, normalized to RGB.

    Raises ImageValidationError if the bytes are not a readable image, so
    the API can return a clean error instead of a 500.
    """
    try:
        image = Image.open(io.BytesIO(raw_bytes))
        image.load()
    except (UnidentifiedImageError, OSError):
        raise ImageValidationError(
            "Please upload a JPG, JPEG, or PNG image."
        )

    if image.mode != "RGB":
        image = image.convert("RGB")

    return image


def image_dimensions(image: Image.Image) -> tuple[int, int]:
    return image.size  # (width, height)
