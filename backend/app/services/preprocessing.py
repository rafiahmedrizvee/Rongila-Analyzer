"""Preprocessing: lighting normalization and resizing.

Limitations (documented per project requirements): white balance and CLAHE
reduce, but do not eliminate, the effect of lighting on perceived skin
color. Strongly colored ambient light (e.g. sodium-vapor streetlight,
heavy color-cast indoor bulbs) can still shift results, and this step
cannot recover detail lost to severe over/under-exposure.
"""

import cv2
import numpy as np


class ExposureWarning(Exception):
    """Raised as a soft warning when an image is likely too dark or
    overexposed for a reliable reading. Callers may choose to surface this
    to the user without necessarily blocking the prediction."""

    pass


def check_exposure(img_bgr: np.ndarray, dark_thresh: float = 40, bright_thresh: float = 235) -> str | None:
    """Returns a user-facing warning string if the image looks too dark or
    overexposed, else None."""
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    mean_brightness = float(gray.mean())

    if mean_brightness < dark_thresh or mean_brightness > bright_thresh:
        return (
            "Lighting conditions may affect the accuracy of the result. "
            "For best results, use natural, evenly distributed lighting."
        )
    return None


def gray_world_white_balance(img_bgr: np.ndarray) -> np.ndarray:
    """Simple gray-world assumption white balance: scales each channel so
    its mean matches the overall gray mean. Fast and has no external
    dependencies, at the cost of being less robust than learned white
    balance methods."""
    img = img_bgr.astype(np.float32)
    b, g, r = cv2.split(img)
    mean_b, mean_g, mean_r = b.mean(), g.mean(), r.mean()
    mean_gray = (mean_b + mean_g + mean_r) / 3.0

    b = np.clip(b * (mean_gray / (mean_b + 1e-6)), 0, 255)
    g = np.clip(g * (mean_gray / (mean_g + 1e-6)), 0, 255)
    r = np.clip(r * (mean_gray / (mean_r + 1e-6)), 0, 255)

    return cv2.merge([b, g, r]).astype(np.uint8)


def apply_clahe(img_bgr: np.ndarray, clip_limit: float = 2.0) -> np.ndarray:
    """Applies CLAHE (contrast-limited adaptive histogram equalization) to
    the L channel in Lab space, to reduce the effect of uneven exposure
    without distorting color."""
    lab = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2LAB)
    l_channel, a_channel, b_channel = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=clip_limit, tileGridSize=(8, 8))
    l_channel = clahe.apply(l_channel)
    lab = cv2.merge([l_channel, a_channel, b_channel])
    return cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)


def normalize_lighting(img_bgr: np.ndarray) -> np.ndarray:
    balanced = gray_world_white_balance(img_bgr)
    normalized = apply_clahe(balanced)
    return normalized


def resize_max_dim(img_bgr: np.ndarray, max_dim: int = 1024) -> np.ndarray:
    """Resize so the longer side is at most max_dim, preserving aspect
    ratio, to keep processing time and memory bounded."""
    h, w = img_bgr.shape[:2]
    scale = min(1.0, max_dim / max(h, w))
    if scale < 1.0:
        img_bgr = cv2.resize(img_bgr, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)
    return img_bgr
