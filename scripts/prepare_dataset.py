"""Phase 7 — Dataset preparation.

Takes the raw, unlabeled hand photos, and for each image:
  1. Runs skin segmentation (GrabCut + color cleanup) to crop the skin
     region and exclude background.
  2. Computes robust color statistics (median Lab/HSV/YCrCb) over the
     masked skin pixels.
  3. Auto-labels the image into one of the 8 tone classes by binning
     images into equal-frequency groups ordered by measured Lab lightness
     (L) — highest L (lightest) -> very_fair, lowest L (darkest) -> deep.
  4. Splits each class into train/validation/test and copies the cropped
     skin-patch image into dataset/<split>/<class>/.

Documented limitation: labels are derived from a single measured
lightness value, not independently verified by a human rater or a
colorimetric reference card. With only 45 source images across 8 classes,
per-class counts are small (5-6 images) and splits are correspondingly
thin — this is a working prototype pipeline, not a validated, production
labeling methodology. See dataset/dataset_report.md for details.

Usage:
    python3 prepare_dataset.py
"""

import csv
import json
import shutil
import sys
from pathlib import Path

import cv2
import numpy as np

BACKEND_ROOT = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(BACKEND_ROOT))

from app.services.skin_segmentation import segment_skin, masked_color_stats, NoSkinDetectedError  # noqa: E402
from app.services.preprocessing import normalize_lighting, resize_max_dim  # noqa: E402

RAW_DIR = Path(__file__).resolve().parent.parent / "dataset_raw" / "dataset"
OUT_DIR = Path(__file__).resolve().parent.parent / "dataset_processed"
SPLIT_DIR = OUT_DIR / "dataset"

CLASS_ORDER = ["very_fair", "fair", "light", "medium", "olive", "tan", "brown", "deep"]
CLASS_LABELS = {
    "very_fair": "Very Fair", "fair": "Fair", "light": "Light", "medium": "Medium",
    "olive": "Olive", "tan": "Tan", "brown": "Brown", "deep": "Deep",
}


def process_all_images():
    records = []
    skipped = []

    image_paths = sorted(RAW_DIR.glob("*.jpg"))
    print(f"Found {len(image_paths)} source images in {RAW_DIR}")

    crops_dir = OUT_DIR / "skin_crops"
    crops_dir.mkdir(parents=True, exist_ok=True)

    for path in image_paths:
        img = cv2.imread(str(path))
        if img is None:
            skipped.append((path.name, "unreadable"))
            continue

        # Apply the exact same resize step used at live-inference time
        # (see services/prediction.py), so training labels and production
        # predictions are computed from pixel-identical preprocessing.
        # Previously this was skipped here, which meant a label could be
        # based on very slightly different measured color than what the
        # live pipeline would later compute for the same photo.
        img = resize_max_dim(img, max_dim=1024)

        try:
            seg = segment_skin(img)
            # Normalize lighting (white balance + CLAHE) before measuring
            # color, so the auto-label reflects intrinsic tone more than
            # ambient exposure/color cast. The same normalization step runs
            # at live inference time (see services/prediction.py), so
            # training labels and production predictions are computed
            # consistently.
            normalized_crop = normalize_lighting(seg["crop_bgr"])
            stats = masked_color_stats(normalized_crop, seg["crop_mask"])
        except NoSkinDetectedError as e:
            skipped.append((path.name, str(e)))
            continue

        crop_filename = f"{path.stem}.jpg"
        # Saved crop is the original (un-normalized) image for realistic
        # visual review; normalization is applied at feature-extraction time.
        cv2.imwrite(str(crops_dir / crop_filename), seg["crop_bgr"])

        h, w = img.shape[:2]
        records.append({
            "image_id": path.stem,
            "source_file": path.name,
            "crop_file": crop_filename,
            "width": w,
            "height": h,
            "orientation": "hand (non-face)",
            "dataset_source": "user-provided (WhatsApp export)",
            "lighting_condition": "uncontrolled / not recorded",
            "camera_device": "not recorded",
            "subject_id": "not tracked",
            **stats,
        })

    print(f"Segmented {len(records)} images successfully, skipped {len(skipped)}")
    for name, reason in skipped:
        print(f"  SKIPPED {name}: {reason}")

    return records


def auto_label(records):
    # Sort by measured lightness, descending (lightest first).
    records_sorted = sorted(records, key=lambda r: r["L_med"], reverse=True)
    groups = np.array_split(np.arange(len(records_sorted)), len(CLASS_ORDER))

    for group_indices, class_id in zip(groups, CLASS_ORDER):
        for idx in group_indices:
            records_sorted[idx]["class_id"] = class_id
            records_sorted[idx]["class_label"] = CLASS_LABELS[class_id]

    return records_sorted


def split_and_organize(records):
    from collections import defaultdict
    by_class = defaultdict(list)
    for r in records:
        by_class[r["class_id"]].append(r)

    if SPLIT_DIR.exists():
        shutil.rmtree(SPLIT_DIR)
    for split in ["train", "validation", "test"]:
        for class_id in CLASS_ORDER:
            (SPLIT_DIR / split / class_id).mkdir(parents=True, exist_ok=True)

    crops_dir = OUT_DIR / "skin_crops"
    split_summary = {}

    for class_id, items in by_class.items():
        n = len(items)
        # Small-n split rule (documented): n>=5 -> 1 test, 1 val, rest train.
        # n==4 -> 1 val, 1 test, 2 train. n<=3 -> all train (too few to hold out).
        if n >= 5:
            n_test, n_val = 1, 1
        elif n == 4:
            n_test, n_val = 1, 1
        else:
            n_test, n_val = 0, 0

        test_items = items[:n_test]
        val_items = items[n_test:n_test + n_val]
        train_items = items[n_test + n_val:]

        for split_name, split_items in [("test", test_items), ("validation", val_items), ("train", train_items)]:
            for r in split_items:
                src = crops_dir / r["crop_file"]
                dst = SPLIT_DIR / split_name / class_id / r["crop_file"]
                shutil.copy2(src, dst)
                r["split"] = split_name

        split_summary[class_id] = {"train": len(train_items), "validation": len(val_items), "test": len(test_items)}

    return split_summary


def write_labels_csv(records):
    fieldnames = [
        "image_id", "source_file", "crop_file", "class_id", "class_label", "split",
        "width", "height", "orientation", "dataset_source", "lighting_condition",
        "camera_device", "subject_id",
        "L_med", "L_std", "a_med", "a_std", "b_med", "b_std",
        "H_med", "H_std", "S_med", "S_std", "V_med", "V_std",
        "Y_med", "Y_std", "Cr_med", "Cr_std", "Cb_med", "Cb_std",
    ]
    out_path = OUT_DIR / "labels.csv"
    with open(out_path, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for r in records:
            writer.writerow({k: r.get(k) for k in fieldnames})
    print(f"Wrote {out_path}")


def write_report(records, split_summary):
    lines = [
        "# Dataset Report — Phase 7\n",
        f"Total source images: {len(records)}\n",
        "\n## Labeling methodology\n",
        "Labels were auto-generated, not manually verified. For each image, the skin "
        "region was segmented (GrabCut + YCrCb/HSV cleanup), lighting was normalized "
        "(gray-world white balance + CLAHE) to reduce ambient exposure/color-cast "
        "effects, and the median CIE-Lab lightness (L) of the masked skin pixels was "
        "measured on the normalized crop. Images were then sorted by L and split into "
        "8 equal-frequency groups, mapped from lightest to darkest onto the "
        "very_fair -> deep scale.\n",
        "\n**Limitation:** this is a documented, reproducible heuristic — it is not "
        "validated against an independent colorimetric reference (e.g. a Fitzpatrick "
        "scale card) or a second human rater, and lighting normalization reduces but "
        "does not fully remove the effect of ambient exposure on the measured value "
        "(a photo taken in dim light can still measure darker than the subject's "
        "actual skin tone). Treat class boundaries as approximate.\n",
        "\n## Class distribution (train / validation / test)\n",
    ]
    for class_id in CLASS_ORDER:
        counts = split_summary.get(class_id, {"train": 0, "validation": 0, "test": 0})
        lines.append(
            f"- **{CLASS_LABELS[class_id]}** ({class_id}): "
            f"{counts['train']} train / {counts['validation']} val / {counts['test']} test\n"
        )
    lines.append(
        "\n## Known limitations\n"
        "- Only 45 source images total (~5-6 per class) — far below the 500-1000/class "
        "recommended for a production model. This supports a working prototype only.\n"
        "- Source images are hands, not faces. The skin-tone signal (color) transfers, "
        "but texture/context differs from facial skin.\n"
        "- No subject_id was available, so person-level train/test leakage cannot be "
        "fully ruled out if multiple photos came from the same person.\n"
        "- Val/test splits of 0-1 image per class are not statistically meaningful; "
        "metrics reported from this data should be read as a sanity check, not a "
        "reliable accuracy estimate.\n"
    )
    out_path = OUT_DIR / "dataset_report.md"
    out_path.write_text("".join(lines))
    print(f"Wrote {out_path}")


if __name__ == "__main__":
    records = process_all_images()
    records = auto_label(records)
    split_summary = split_and_organize(records)
    write_labels_csv(records)
    write_report(records, split_summary)

    with open(OUT_DIR / "class_names.json", "w") as f:
        json.dump(CLASS_ORDER, f, indent=2)

    print("\nDone. Class distribution:")
    for class_id, counts in split_summary.items():
        print(f"  {class_id}: {counts}")
