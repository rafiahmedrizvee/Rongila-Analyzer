# Dataset Report — Phase 7
Total source images: 45

## Labeling methodology
Labels were auto-generated, not manually verified. For each image, the skin region was segmented (GrabCut + YCrCb/HSV cleanup), lighting was normalized (gray-world white balance + CLAHE) to reduce ambient exposure/color-cast effects, and the median CIE-Lab lightness (L) of the masked skin pixels was measured on the normalized crop. Images were then sorted by L and split into 8 equal-frequency groups, mapped from lightest to darkest onto the very_fair -> deep scale.

**Limitation:** this is a documented, reproducible heuristic — it is not validated against an independent colorimetric reference (e.g. a Fitzpatrick scale card) or a second human rater, and lighting normalization reduces but does not fully remove the effect of ambient exposure on the measured value (a photo taken in dim light can still measure darker than the subject's actual skin tone). Treat class boundaries as approximate.

## Class distribution (train / validation / test)
- **Very Fair** (very_fair): 4 train / 1 val / 1 test
- **Fair** (fair): 4 train / 1 val / 1 test
- **Light** (light): 4 train / 1 val / 1 test
- **Medium** (medium): 4 train / 1 val / 1 test
- **Olive** (olive): 4 train / 1 val / 1 test
- **Tan** (tan): 3 train / 1 val / 1 test
- **Brown** (brown): 3 train / 1 val / 1 test
- **Deep** (deep): 3 train / 1 val / 1 test

## Known limitations
- Only 45 source images total (~5-6 per class) — far below the 500-1000/class recommended for a production model. This supports a working prototype only.
- Source images are hands, not faces. The skin-tone signal (color) transfers, but texture/context differs from facial skin.
- No subject_id was available, so person-level train/test leakage cannot be fully ruled out if multiple photos came from the same person.
- Val/test splits of 0-1 image per class are not statistically meaningful; metrics reported from this data should be read as a sanity check, not a reliable accuracy estimate.
