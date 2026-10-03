"""Prediction service — orchestrates the full pipeline.

    image bytes
      -> decode (utils/image_utils.py)
      -> resize to a bounded max dimension (preprocessing.py)
      -> try face detection (face_detection.py)
         -> face found: crop to face region
         -> no face found: use the full image (this is what makes the
            hand-photo dataset work today, and real face selfies work
            once they're available)
      -> skin segmentation on that region (skin_segmentation.py)
      -> lighting normalization (preprocessing.py)
      -> color-statistics feature extraction (features.py)
      -> trained model prediction (models/model_loader.py)

This mirrors exactly the architecture diagram in the project spec (section
5), with one adaptation: face detection is best-effort/optional rather
than required, since the current training dataset is hand photos, not
faces (see README.md for the reasoning).
"""

import time
from typing import TypedDict

import numpy as np
from PIL import Image

from app.models import model_loader
from app.services import face_detection, preprocessing
from app.services.features import to_vector
from app.services.skin_segmentation import NoSkinDetectedError, masked_color_stats, segment_skin


class PredictionResult(TypedDict):
    skin_tone_id: str
    confidence: float
    face_detected: bool
    skin_region_detected: bool
    lighting_warning: str | None
    processing_time_ms: int


def _pil_to_bgr(image: Image.Image) -> np.ndarray:
    rgb = np.array(image)
    return rgb[:, :, ::-1].copy()  # RGB -> BGR for OpenCV


def predict_skin_tone(image: Image.Image) -> PredictionResult:
    start = time.perf_counter()

    img_bgr = _pil_to_bgr(image)
    img_bgr = preprocessing.resize_max_dim(img_bgr, max_dim=1024)

    lighting_warning = preprocessing.check_exposure(img_bgr)

    face_crop = face_detection.detect_face(img_bgr)
    face_detected = face_crop is not None
    region = face_crop if face_detected else img_bgr

    try:
        seg = segment_skin(region)
    except NoSkinDetectedError:
        # If we tried a face crop and found no skin in it (unusual, but
        # possible with a bad crop), fall back once to the full image
        # before giving up.
        if face_detected:
            seg = segment_skin(img_bgr)
        else:
            raise

    normalized = preprocessing.normalize_lighting(seg["crop_bgr"])
    stats = masked_color_stats(normalized, seg["crop_mask"])
    feature_vector = to_vector(stats)

    class_id, confidence = model_loader.predict(feature_vector)

    elapsed_ms = int((time.perf_counter() - start) * 1000)

    return {
        "skin_tone_id": class_id,
        "confidence": round(confidence, 2),
        "face_detected": face_detected,
        "skin_region_detected": True,
        "lighting_warning": lighting_warning,
        "processing_time_ms": elapsed_ms,
    }
