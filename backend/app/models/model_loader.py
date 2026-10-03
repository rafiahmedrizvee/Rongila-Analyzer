"""Trained model loader.

Loads the scikit-learn pipeline bundle produced by scripts/train_model.py:
a StandardScaler + GradientBoostingClassifier pipeline trained on a
3-feature [L_med, a_med, b_med] color vector, plus the class order it was
trained with. Both the classifier and the feature set were chosen by
cross-validated experiment (scripts/experiment_feature_selection.py), not
by default — see that script and train_model.py's module docstring for
the reasoning. Tree-ensemble predict_proba() (Random Forest or Gradient
Boosting) is guaranteed consistent with predict() by construction, unlike
an SVM with Platt-scaled probabilities, which can disagree with its own
decision boundary on very small per-class samples.

Note on architecture: the project spec calls for a MobileNetV2/
EfficientNetB0 CNN (see README.md "Model architecture" section for why
this project currently uses a classical ML model instead, and
scripts/train_cnn_mobilenetv2.py for the documented upgrade path). This
loader is intentionally generic about *how* prediction works — it exposes
predict(features) -> (class_id, confidence) — so swapping in a Keras model
later only requires changing this file and features.py, not the API layer.
"""

from functools import lru_cache
from pathlib import Path

import joblib
import numpy as np

from app.config import get_settings


class ModelNotAvailableError(Exception):
    pass


@lru_cache
def load_bundle():
    settings = get_settings()
    path = Path(settings.model_path)
    if not path.exists():
        raise ModelNotAvailableError(
            f"No trained model found at {path}. Run scripts/prepare_dataset.py "
            "and scripts/train_model.py first."
        )
    return joblib.load(path)


def load_class_names() -> list[str]:
    return load_bundle()["class_order"]


def predict(feature_vector: list[float]) -> tuple[str, float]:
    """Returns (class_id, confidence) for a single feature vector.

    Important: predict_proba() columns are ordered by pipeline.classes_,
    which scikit-learn sorts alphabetically — NOT by bundle["class_order"]
    (the ordinal very_fair -> deep scale used everywhere else in this
    project). Indexing predict_proba with the wrong order silently maps
    every prediction to the wrong label, so this always reads columns
    against classes_, the fitted model's own ordering.
    """
    bundle = load_bundle()
    pipeline = bundle["pipeline"]
    classes = pipeline.classes_

    X = np.array(feature_vector).reshape(1, -1)
    probabilities = pipeline.predict_proba(X)[0]

    best_idx = int(np.argmax(probabilities))
    return classes[best_idx], float(probabilities[best_idx])
