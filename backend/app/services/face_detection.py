"""Face detection service.

Uses OpenCV's bundled Haar cascade frontal-face detector. If a face is
found, the largest detected face is cropped (with padding) and returned.
If no face is found, `detect_face` returns None rather than raising —
the caller (services/prediction.py) then falls back to running skin
segmentation on the full image, which is what makes this pipeline work for
both face photos and non-face skin photos (e.g. the hand dataset used to
bootstrap this project).
"""

import cv2
import numpy as np

_CASCADE_PATH = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
_face_cascade = cv2.CascadeClassifier(_CASCADE_PATH)


def detect_face(img_bgr: np.ndarray, padding: float = 0.25) -> np.ndarray | None:
    """Detect the most relevant (largest) face in an image.

    Returns a cropped BGR image of the face region with padding, or None if
    no face is detected. Never raises for "no face" — that's an expected,
    normal outcome for non-face photos.

    Thresholds are tuned conservatively (higher minNeighbors, minSize
    scaled to the image) because Haar cascades produce false positives on
    textured non-face surfaces — including, empirically, on the hand
    photos used to bootstrap this project. A missed real face just falls
    back to full-image skin segmentation (see services/prediction.py),
    which is a much smaller problem than confidently cropping to a wrong
    region.
    """
    h, w = img_bgr.shape[:2]
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    gray = cv2.equalizeHist(gray)

    min_size = int(min(h, w) * 0.22)
    faces = _face_cascade.detectMultiScale(
        gray, scaleFactor=1.1, minNeighbors=10, minSize=(min_size, min_size)
    )

    if len(faces) == 0:
        return None

    # Select the most relevant face if multiple are detected: largest area.
    x, y, w, h = max(faces, key=lambda f: f[2] * f[3])

    pad_x, pad_y = int(w * padding), int(h * padding)
    h_img, w_img = img_bgr.shape[:2]
    x0 = max(0, x - pad_x)
    y0 = max(0, y - pad_y)
    x1 = min(w_img, x + w + pad_x)
    y1 = min(h_img, y + h + pad_y)

    return img_bgr[y0:y1, x0:x1]


def count_faces(img_bgr: np.ndarray) -> int:
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    gray = cv2.equalizeHist(gray)
    faces = _face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(80, 80))
    return len(faces)
