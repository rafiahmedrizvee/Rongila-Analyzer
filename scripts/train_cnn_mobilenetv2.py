"""Phase 9 upgrade path — MobileNetV2 transfer learning (Keras/TensorFlow).

This is the architecture the project spec originally calls for. It is NOT
run as part of the current pipeline because this sandbox has no internet
access to install TensorFlow. Run this yourself once you have:

  1. TensorFlow installed:  pip install tensorflow
  2. A larger dataset — ideally hundreds of images per class (see
     dataset_processed/dataset_report.md for why 45 images isn't enough
     for a CNN). You can keep adding images to dataset_processed/dataset/
     in the same train/validation/test/<class>/ structure this project
     already uses; this script reads that structure directly.

Usage:
    pip install tensorflow
    python3 train_cnn_mobilenetv2.py

Output:
    backend/trained_models/skin_tone_model.keras
    backend/trained_models/class_names.json

After running this, update backend/app/config.py's `model_path` to point
at the .keras file, and update backend/app/models/model_loader.py to load
it with tf.keras.models.load_model(...) and call model.predict(...) on a
preprocessed image array instead of a hand-crafted feature vector (the
face_detection.py / skin_segmentation.py steps upstream stay the same —
only what happens after "get a cropped, normalized skin patch" changes).
"""

import json
from pathlib import Path

IMG_SIZE = (224, 224)
BATCH_SIZE = 16
EPOCHS_HEAD = 10
EPOCHS_FINE_TUNE = 8
CLASS_ORDER = ["very_fair", "fair", "light", "medium", "olive", "tan", "brown", "deep"]

DATASET_DIR = Path(__file__).resolve().parent.parent / "dataset_processed" / "dataset"
MODEL_OUT_DIR = Path(__file__).resolve().parent.parent / "backend" / "trained_models"


def build_model(num_classes: int):
    import tensorflow as tf
    from tensorflow.keras import layers, models

    base_model = tf.keras.applications.MobileNetV2(
        input_shape=(*IMG_SIZE, 3), include_top=False, weights="imagenet"
    )
    base_model.trainable = False  # frozen initially, per the spec's architecture

    data_augmentation = models.Sequential([
        layers.RandomFlip("horizontal"),
        layers.RandomRotation(0.05),
        layers.RandomZoom(0.1),
        layers.RandomBrightness(0.15),
        layers.RandomContrast(0.15),
        # Deliberately NOT using RandomHue/color-jitter augmentations here —
        # they would distort the very signal (skin color) this model needs
        # to learn, per the project's augmentation requirements.
    ])

    inputs = tf.keras.Input(shape=(*IMG_SIZE, 3))
    x = data_augmentation(inputs)
    x = tf.keras.applications.mobilenet_v2.preprocess_input(x)
    x = base_model(x, training=False)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.Dropout(0.3)(x)
    outputs = layers.Dense(num_classes, activation="softmax")(x)
    model = tf.keras.Model(inputs, outputs)
    return model, base_model


def main():
    import tensorflow as tf
    from sklearn.metrics import classification_report, confusion_matrix

    train_ds = tf.keras.utils.image_dataset_from_directory(
        DATASET_DIR / "train", image_size=IMG_SIZE, batch_size=BATCH_SIZE,
        class_names=CLASS_ORDER, label_mode="categorical",
    )
    val_ds = tf.keras.utils.image_dataset_from_directory(
        DATASET_DIR / "validation", image_size=IMG_SIZE, batch_size=BATCH_SIZE,
        class_names=CLASS_ORDER, label_mode="categorical",
    )
    test_ds = tf.keras.utils.image_dataset_from_directory(
        DATASET_DIR / "test", image_size=IMG_SIZE, batch_size=BATCH_SIZE,
        class_names=CLASS_ORDER, label_mode="categorical", shuffle=False,
    )

    model, base_model = build_model(len(CLASS_ORDER))
    model.compile(
        optimizer=tf.keras.optimizers.Adam(1e-3),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )

    print("=== Training classification head (base frozen) ===")
    model.fit(train_ds, validation_data=val_ds, epochs=EPOCHS_HEAD)

    print("\n=== Fine-tuning (unfreezing top layers of MobileNetV2) ===")
    base_model.trainable = True
    for layer in base_model.layers[:-30]:
        layer.trainable = False
    model.compile(
        optimizer=tf.keras.optimizers.Adam(1e-5),  # low LR for fine-tuning
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )
    model.fit(train_ds, validation_data=val_ds, epochs=EPOCHS_FINE_TUNE)

    print("\n=== Test set evaluation ===")
    test_loss, test_acc = model.evaluate(test_ds)
    print(f"Test accuracy: {test_acc:.3f}")

    y_true, y_pred = [], []
    for images, labels in test_ds:
        preds = model.predict(images, verbose=0)
        y_true.extend(labels.numpy().argmax(axis=1))
        y_pred.extend(preds.argmax(axis=1))

    print(classification_report(y_true, y_pred, target_names=CLASS_ORDER, zero_division=0))
    print(confusion_matrix(y_true, y_pred))

    MODEL_OUT_DIR.mkdir(parents=True, exist_ok=True)
    model.save(MODEL_OUT_DIR / "skin_tone_model.keras")
    with open(MODEL_OUT_DIR / "class_names.json", "w") as f:
        json.dump(CLASS_ORDER, f, indent=2)
    print(f"\nSaved model to {MODEL_OUT_DIR / 'skin_tone_model.keras'}")


if __name__ == "__main__":
    main()
