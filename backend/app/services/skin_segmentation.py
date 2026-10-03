"""Skin region segmentation.

Adapted approach (per project decision): rather than requiring a detected
face, this isolates the dominant skin region in *any* photo — hand, cheek,
forearm, etc. — using GrabCut foreground segmentation, then uses YCrCb/HSV
color thresholding only to clean up the GrabCut mask (removing stray
non-skin pixels like nails or shadows within the foreground blob).

This is what makes it possible to train on the hand-photo dataset today and
swap in real face crops later (via face_detection.py) without changing this
module at all — it always receives "a region likely to contain skin" and
returns the cleaned mask plus robust color statistics for that region.
"""

import cv2
import numpy as np


class NoSkinDetectedError(Exception):
    pass


# Loose HSV/YCrCb skin ranges, used only to prune the GrabCut foreground
# (not as the primary segmentation method — see module docstring).
_YCRCB_LOWER = np.array([0, 130, 80], dtype=np.uint8)
_YCRCB_UPPER = np.array([255, 185, 140], dtype=np.uint8)
_HSV_LOWER = np.array([0, 15, 40], dtype=np.uint8)
_HSV_UPPER = np.array([30, 180, 255], dtype=np.uint8)

MIN_SKIN_FRACTION = 0.03  # below this, we consider detection to have failed


def _grabcut_foreground_mask(img_bgr: np.ndarray, margin: float = 0.06, iters: int = 5) -> np.ndarray:
    h, w = img_bgr.shape[:2]
    mx, my = int(w * margin), int(h * margin)
    rect = (mx, my, w - 2 * mx, h - 2 * my)

    mask = np.zeros((h, w), np.uint8)
    bgd_model = np.zeros((1, 65), np.float64)
    fgd_model = np.zeros((1, 65), np.float64)

    cv2.grabCut(img_bgr, mask, rect, bgd_model, fgd_model, iters, cv2.GC_INIT_WITH_RECT)
    binary = np.where((mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD), 255, 0).astype(np.uint8)

    kernel = np.ones((5, 5), np.uint8)
    binary = cv2.morphologyEx(binary, cv2.MORPH_OPEN, kernel)
    binary = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel)
    return binary


def _color_skin_mask(img_bgr: np.ndarray) -> np.ndarray:
    ycrcb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2YCrCb)
    hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)
    mask_ycrcb = cv2.inRange(ycrcb, _YCRCB_LOWER, _YCRCB_UPPER)
    mask_hsv = cv2.inRange(hsv, _HSV_LOWER, _HSV_UPPER)
    return cv2.bitwise_or(mask_ycrcb, mask_hsv)


def segment_skin(img_bgr: np.ndarray, grabcut_max_dim: int = 400) -> dict:
    """Segment the dominant skin region in an image.

    GrabCut is run on a downscaled copy (longer side <= grabcut_max_dim)
    for speed, since it's an iterative graph-cut algorithm that scales
    poorly with pixel count; the resulting mask is then upscaled back to
    the original resolution before cropping, so output crops stay
    full-resolution.

    Returns a dict with:
      - mask: uint8 binary mask, same size as input
      - bbox: (x, y, w, h) of the largest skin blob
      - crop_bgr: the image cropped to bbox
      - crop_mask: the mask cropped to bbox

    Raises NoSkinDetectedError if no sufficiently large skin region is found.
    """
    h0, w0 = img_bgr.shape[:2]
    scale = min(1.0, grabcut_max_dim / max(h0, w0))
    if scale < 1.0:
        small = cv2.resize(img_bgr, (int(w0 * scale), int(h0 * scale)), interpolation=cv2.INTER_AREA)
    else:
        small = img_bgr

    fg_mask_small = _grabcut_foreground_mask(small)
    fg_mask = cv2.resize(fg_mask_small, (w0, h0), interpolation=cv2.INTER_NEAREST)
    color_mask = _color_skin_mask(img_bgr)

    # Prefer pixels that are both foreground AND skin-colored; if that's too
    # sparse (e.g. unusual lighting), fall back to foreground alone so we
    # don't discard an otherwise valid crop.
    combined = cv2.bitwise_and(fg_mask, color_mask)
    h, w = img_bgr.shape[:2]
    total = h * w
    if combined.sum() / 255 / total < MIN_SKIN_FRACTION:
        combined = fg_mask

    contours, _ = cv2.findContours(combined, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not contours:
        raise NoSkinDetectedError(
            "Unable to detect a clear skin region. Please upload a well-lit photo showing skin clearly."
        )

    largest = max(contours, key=cv2.contourArea)
    area_fraction = cv2.contourArea(largest) / total
    if area_fraction < MIN_SKIN_FRACTION:
        raise NoSkinDetectedError(
            "Unable to detect a clear skin region. Please upload a well-lit photo showing skin clearly."
        )

    x, y, bw, bh = cv2.boundingRect(largest)
    crop_bgr = img_bgr[y:y + bh, x:x + bw]
    crop_mask = combined[y:y + bh, x:x + bw]

    return {
        "mask": combined,
        "bbox": (x, y, bw, bh),
        "crop_bgr": crop_bgr,
        "crop_mask": crop_mask,
    }


def masked_color_stats(crop_bgr: np.ndarray, crop_mask: np.ndarray) -> dict:
    """Robust (median-based) color statistics over the masked skin pixels
    only, across Lab, HSV, and YCrCb — median is used instead of mean so
    small non-skin inclusions (a fingernail sliver, a shadow edge) don't
    skew the estimate.
    """
    lab = cv2.cvtColor(crop_bgr, cv2.COLOR_BGR2LAB)
    hsv = cv2.cvtColor(crop_bgr, cv2.COLOR_BGR2HSV)
    ycrcb = cv2.cvtColor(crop_bgr, cv2.COLOR_BGR2YCrCb)

    idx = crop_mask > 0
    if idx.sum() == 0:
        raise NoSkinDetectedError(
            "Unable to detect a clear skin region. Please upload a well-lit photo showing skin clearly."
        )

    def stats(channel_img):
        pixels = channel_img[idx].astype(np.float32)
        return float(np.median(pixels)), float(np.std(pixels))

    l_med, l_std = stats(lab[:, :, 0])
    a_med, a_std = stats(lab[:, :, 1])
    b_med, b_std = stats(lab[:, :, 2])
    h_med, h_std = stats(hsv[:, :, 0])
    s_med, s_std = stats(hsv[:, :, 1])
    v_med, v_std = stats(hsv[:, :, 2])
    y_med, y_std = stats(ycrcb[:, :, 0])
    cr_med, cr_std = stats(ycrcb[:, :, 1])
    cb_med, cb_std = stats(ycrcb[:, :, 2])

    return {
        "L_med": l_med, "L_std": l_std,
        "a_med": a_med, "a_std": a_std,
        "b_med": b_med, "b_std": b_std,
        "H_med": h_med, "H_std": h_std,
        "S_med": s_med, "S_std": s_std,
        "V_med": v_med, "V_std": v_std,
        "Y_med": y_med, "Y_std": y_std,
        "Cr_med": cr_med, "Cr_std": cr_std,
        "Cb_med": cb_med, "Cb_std": cb_std,
    }
