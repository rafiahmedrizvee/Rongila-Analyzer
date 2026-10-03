from fastapi import APIRouter, File, HTTPException, UploadFile
from pydantic import BaseModel

from app.models.model_loader import ModelNotAvailableError
from app.services import skincare
from app.services.prediction import predict_skin_tone
from app.services.skin_segmentation import NoSkinDetectedError
from app.utils.image_utils import decode_image
from app.utils.labels import label_for
from app.utils.validators import ImageValidationError, validate_upload

router = APIRouter()


class HealthResponse(BaseModel):
    status: str


class GuidanceResponse(BaseModel):
    morning: list[str]
    evening: list[str]
    sun_protection: list[str]
    hand_care: list[str]
    notes: list[str]


class PredictResponse(BaseModel):
    success: bool
    skin_tone: str
    skin_tone_id: str
    confidence: float
    face_detected: bool
    skin_region_detected: bool
    lighting_warning: str | None = None
    processing_time: str
    guidance: GuidanceResponse


@router.get("/health", response_model=HealthResponse)
async def health_check():
    return {"status": "ok"}


@router.post("/predict", response_model=PredictResponse)
async def predict(image: UploadFile = File(...)):
    try:
        raw_bytes = await validate_upload(image)
        decoded = decode_image(raw_bytes)
    except ImageValidationError as err:
        raise HTTPException(status_code=422, detail=err.message)

    try:
        result = predict_skin_tone(decoded)
    except NoSkinDetectedError as err:
        raise HTTPException(status_code=422, detail=str(err))
    except ModelNotAvailableError as err:
        raise HTTPException(status_code=503, detail=str(err))

    guidance = skincare.get_guidance(
        result["skin_tone_id"],
        face_detected=result["face_detected"],
        confidence=result["confidence"],
        lighting_warning=result["lighting_warning"],
    )

    return {
        "success": True,
        "skin_tone": label_for(result["skin_tone_id"]),
        "skin_tone_id": result["skin_tone_id"],
        "confidence": result["confidence"],
        "face_detected": result["face_detected"],
        "skin_region_detected": result["skin_region_detected"],
        "lighting_warning": result["lighting_warning"],
        "processing_time": f"{result['processing_time_ms']}ms",
        "guidance": guidance,
    }
