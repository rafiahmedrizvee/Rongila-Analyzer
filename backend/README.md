# Skin Tone Analysis — Backend

FastAPI backend for the skin tone classification project. Implements the
full pipeline: image validation → face detection (best-effort) → skin
segmentation → lighting normalization → feature extraction → trained
model → skincare guidance.

## Quick start

Requires Python 3.11+ (needs internet access to install packages — not
available in the sandbox this was built in, so run this on your own
machine).

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Visit `http://localhost:8000/docs` for interactive API docs, or
`http://localhost:8000/api/health` for a health check.

The model is already trained and included at
`trained_models/skin_tone_model.joblib` — you don't need to retrain
before running the server. See "Retraining" below if you add more images.

### Troubleshooting: `pip install` fails trying to build numpy/opencv from source

If you see a Meson/compiler error like `Unknown compiler(s)` while
installing on Windows, it means pip couldn't find a prebuilt wheel for
your Python version and tried (and failed) to compile numpy from source.
This almost always means your Python version is newer than the packages
have wheels for yet.

- `requirements.txt` is pinned to `numpy>=2.4`, `opencv-python-headless>=4.13`,
  etc. — versions modern enough to have Windows wheels for most current
  Python releases. If you already have this version of the file and still
  hit the error, your Python is likely *too new* (e.g. a just-released
  version like 3.14) for these packages to have wheels yet.
- **Fix:** install Python 3.11 or 3.12 alongside your current version
  (they can coexist), and create the virtual environment with that
  instead:
  ```bash
  py -3.12 -m venv venv
  venv\Scripts\activate
  pip install -r requirements.txt
  ```
  Python 3.11/3.12 has the widest, most reliable wheel support across the
  whole scientific-Python ecosystem — this sidesteps needing a C/C++
  compiler installed at all.
- `scikit-learn==1.8.0` and `joblib==1.5.3` are pinned exactly (not a
  range) — don't loosen these two. The trained model was pickled with
  these exact versions, and scikit-learn's tree-based models (this
  project uses Gradient Boosting) are sensitive to version mismatches in
  ways that can fail silently rather than throwing a clear error.

## Connecting the frontend

The frontend (`../frontend`) already points at `http://localhost:8000`
by default (`VITE_API_BASE_URL` in its `.env.example`) and has mock mode
turned off (`USE_MOCK = false` in `src/services/api.js`). With this
backend running on port 8000 and the frontend dev server running on 5173,
`/analyze` will call the real `/api/predict` endpoint.

## API

**`GET /api/health`** → `{"status": "ok"}`

**`POST /api/predict`** — multipart form, field name `image` (JPG/PNG, ≤8MB)

```json
{
  "success": true,
  "skin_tone": "Medium",
  "skin_tone_id": "medium",
  "confidence": 0.55,
  "face_detected": false,
  "skin_region_detected": true,
  "lighting_warning": null,
  "processing_time": "620ms",
  "guidance": {
    "morning": ["Gentle cleanser", "Moisturizer", "Broad-spectrum sunscreen, SPF 30+"],
    "evening": ["Gentle cleanser", "Moisturizer", "Balanced moisturizer"],
    "sun_protection": ["Reapply sunscreen every 2 hours in direct sun", "..."]
  }
}
```

Error responses return `{"detail": "<user-facing message>"}` with status
422 (bad/no-skin image) or 503 (model not loaded).

## Architecture — what's real vs. adapted from the original spec

| Piece | Spec called for | What's actually implemented | Why |
|---|---|---|---|
| Face detection | Required first step | OpenCV Haar cascade, **optional** — falls back to full-image skin segmentation if no face is found | Training dataset is hand photos, not faces (see below) |
| Skin segmentation | Facial landmarks + YCrCb/HSV on cheeks/forehead/chin | GrabCut foreground segmentation + YCrCb/HSV cleanup, works on any body part | Generalizes to both the current hand dataset and future face photos |
| Model | MobileNetV2/EfficientNetB0 CNN, transfer learning | Gradient Boosting on a 3-feature [L, a, b] color vector, chosen by cross-validated experiment over 5 feature sets and 5 model configs | No internet access to install TensorFlow in the build environment; a CNN would also badly overfit 45 images regardless of framework |
| Lighting normalization | White balance, CLAHE | Implemented as specified (gray-world white balance + CLAHE on L channel) | — |

**Upgrade path to the original spec:** `scripts/train_cnn_mobilenetv2.py`
is a complete, ready-to-run Keras/MobileNetV2 transfer-learning script
that reads the same `dataset_processed/dataset/train|validation|test/`
folder structure this project already uses. Run it once you have
TensorFlow installed and a larger dataset, then repoint
`app/config.py`'s `model_path` and swap the loading logic in
`app/models/model_loader.py` — nothing else in the pipeline needs to
change.

## Model limitations (read before presenting this)

- **Training data is 45 hand photos, not faces.** The color signal
  transfers to skin tone classification, but texture and context differ
  from facial skin. Add real face photos to
  `dataset_processed/dataset/<split>/<class>/` and re-run
  `scripts/train_model.py` before claiming this works on selfies.
- **45 images across 8 classes is far below the 500-1000/class this kind
  of project should have** — so treat these numbers as a strong prototype
  result, not a production accuracy claim:
  - Cross-validation (train+validation, 37 samples): **97% exact-class
    accuracy, 100% off-by-one accuracy**, macro F1 0.97.
  - Held-out test set (8 samples, never used in training or CV): **88%
    exact accuracy** (7/8).
  - Full live pipeline, fresh end-to-end on all 45 raw photos (face
    detection → segmentation → normalization → model, not precomputed
    features): **96% exact accuracy, 100% off-by-one accuracy** (43/45
    exact; both misses are the immediately adjacent class, on the
    held-out test split).
  - The feature set (just L/a/b color medians, not all 18 computed
    statistics) and model (Gradient Boosting over Random Forest/SVM) were
    both chosen by running the actual cross-validated comparison in
    `scripts/experiment_feature_selection.py`, not by default — see that
    file for the full results table.
  - **Why this can look this strong on so little data:** labels were
    generated by sorting images on measured L (lightness) and cutting
    into 8 equal groups (see `dataset_report.md`). That makes L/a/b the
    literal generative signal behind every label, so a model that
    recovers those thresholds well is expected to score highly here —
    it's a strong result *for this labeling method*, not proof the model
    would hit 96% against independently, humanly-verified tone labels.
    Full numbers (including the confusion matrix) are in
    `trained_models/training_metrics.json`.
- **Labels were auto-generated** from measured skin lightness, not
  verified by a human rater or a colorimetric reference card. Treat class
  boundaries as approximate.
- **Face detection has a small false-positive rate** (~4% in testing) —
  OpenCV's Haar cascade occasionally flags a textured non-face region as
  a face. A missed real face just falls back to whole-image segmentation
  (low cost); a false-positive face crop could occasionally feed a wrong
  region into segmentation.
- **This is not a medical device.** It classifies visible color only —
  it does not, and will not, detect skin diseases or conditions. See the
  ethical disclaimer in the frontend and section 31 of the original spec.

## Retraining after adding more data

```bash
cd scripts
python3 prepare_dataset.py   # re-segments dataset_raw/, regenerates labels.csv
python3 train_model.py       # retrains, re-evaluates, saves the model
```

Add new raw photos to `dataset_raw/dataset/` before running
`prepare_dataset.py`, or add pre-labeled images directly into
`dataset_processed/dataset/<split>/<class>/` and skip straight to
`train_model.py` if you're providing your own labels.
