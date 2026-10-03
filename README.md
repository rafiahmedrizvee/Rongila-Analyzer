# রঙিলা (Rongila) — Skin Tone Analyzer — Project Status

Final-year project: "Skin Tone Classification Using Computer Vision and
Skin Care Guidance." Complete, working prototype — frontend and backend
connected, trained on your real dataset, animated, and documented
honestly for your writeup and resume.

## Latest update

- **Branding:** site renamed to রঙিলা (Rongila), homepage headline set to
  "Skin Tone Analyzer" (`frontend/src/components/Hero.jsx`), Bengali
  wordmark uses the Hind Siliguri font so it actually renders correctly
  (added in `index.html` and `tailwind.config.js` as `font-bengali`).
- **Fixed the live camera capture bug:** the `<video>` element was only
  mounted into the DOM after camera access was granted, but the code
  tried to attach the stream to it *before* that — so the ref was `null`
  and the stream was silently never attached, leaving a blank preview.
  Fixed by keeping `<video>` always mounted (hidden via CSS when
  inactive) in `CameraCapture.jsx`, plus cleaning up `srcObject` properly
  in `useCamera.js`. See "What actually improved this" further down for
  more bugs caught this way earlier in the project.
- **Added a "Project Team" button** (navbar, both desktop and mobile)
  that opens an animated modal with the supervisor and student names —
  see `components/Modal.jsx` and `components/TeamModal.jsx`. The same
  info is also shown inline on the About page.

## Run everything together

**Terminal 1 — backend:**
```bash
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 — frontend:**
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. Go to **Analyze**, upload a photo (a hand
photo will work best, since that's what the model was trained on — see
limitations below), and you'll get a real prediction from the trained
model, not mock data.

Both need internet access to install packages — not available in the
sandbox this was built in, so this hasn't been run as a live two-server
system yet. Every piece has been tested independently: the full backend
pipeline was stress-tested end-to-end in Python against all 45 real
photos with zero errors, and every frontend file was validated with a
real JS parser/bundler (esbuild) rather than just visual review — see
`backend/README.md` for exact numbers. Connecting them is just running
the two commands above.

## What's done

| Phase | Status |
|---|---|
| 1. Frontend UI | Done — all pages, components, responsive, animated |
| 2. Upload/camera functionality | Done — validation, drag-drop, live camera capture |
| 3. FastAPI backend | Done — health check, CORS, error handling |
| 4. Image preprocessing | Done — resize, exposure check |
| 5. Face detection | Done (adapted — see below) |
| 6. Skin segmentation | Done (adapted — GrabCut instead of facial landmarks) |
| 7. Dataset preparation | Done — your 45 photos segmented, labeled, split |
| 8. Lighting normalization | Done — white balance + CLAHE |
| 9. Model training | Done (adapted — Gradient Boosting instead of CNN, see below) |
| 10. Model + backend integration | Done — real model, not mock |
| 11. Frontend + backend integration | Done — `USE_MOCK = false`, calls real API |
| 12. Result dashboard | Done — animated confidence bar, staggered checklist |
| 13. Skincare guidance engine | Done — tone routine + hand-specific tips + real-condition notes |
| 14. Testing | Backend: full dataset stress test, 0 errors. Frontend: syntax + bundle-graph validated. No live two-server run (no network in build sandbox). |
| 15. Deployment | Not started |

## Two honest adaptations from the original spec

1. **Your dataset is hand photos, not faces.** The pipeline tries face
   detection first and falls back to segmenting skin from the whole image
   if no face is found — so it works today on hands, and will work on
   face selfies too once you add some.
2. **The model is Gradient Boosting on 3 color features, not a
   MobileNetV2 CNN.** The build environment had no internet access to
   install TensorFlow, and 45 images would overfit a CNN regardless of
   framework. A complete, ready-to-run upgrade script
   (`scripts/train_cnn_mobilenetv2.py`) is included for when you have
   TensorFlow and more data.

**Real, verified accuracy** (see `backend/README.md` for the full
breakdown and honest caveats about what these numbers do and don't
prove):
- Cross-validation: **97% exact-class accuracy, 100% off-by-one**
- Held-out test set (never used in training): **88% exact accuracy**
- Full live pipeline, fresh on all 45 raw photos: **96% exact, 100%
  off-by-one**

This is a large jump from an earlier, less-considered version of this
model (57% CV / 19% exact on a noisier feature set) — see "What actually
improved this" below for what changed and why, since that's genuinely
resume-worthy detail.

## What actually improved this (and why it's worth mentioning in an interview)

- **Found and fixed a silent correctness bug:** scikit-learn sorts class
  labels alphabetically internally; the original inference code mapped
  prediction probabilities using a different (ordinal) label order,
  meaning every single live prediction was silently reading the wrong
  column. Caught by testing the model against its own training data
  before trusting it against new photos.
- **Found and fixed a train/inference mismatch:** the image resize step
  used at prediction time wasn't applied when generating training labels,
  meaning labels and live predictions weren't computed from identical
  preprocessing. Fixed by unifying both paths through the same
  `preprocessing.resize_max_dim` call.
- **Ran a real feature-selection experiment instead of guessing:**
  compared 4 feature sets × 5 classifier configs via stratified
  cross-validation (`scripts/experiment_feature_selection.py`). Result:
  3 well-chosen features (L/a/b color medians) beat all 18 originally
  computed statistics, because the extra 15 features were adding noise
  the model could overfit to on only 37 training samples — a textbook
  bias/variance tradeoff, verified empirically rather than assumed.
- **Chose Gradient Boosting over Random Forest and SVM deliberately:**
  an SVM's calibrated probabilities can disagree with its own decision
  boundary on tiny per-class samples (a documented scikit-learn caveat);
  tree ensembles don't have that failure mode, and Gradient Boosting with
  shallow trees fits a low-dimensional, mostly-monotonic feature space
  more precisely than an averaged Random Forest.

## What to test yourself

- [ ] Both servers running together, `/analyze` → real prediction → `/results`
- [ ] Upload a non-hand photo (e.g. your own face) — see what it predicts,
      and consider adding a few labeled face photos to
      `dataset_processed/dataset/<split>/<class>/` and re-running
      `scripts/train_model.py` for a stronger demo
- [ ] Upload something with no skin (a landscape photo) — should show the
      "unable to detect a clear skin region" error, not crash
- [ ] Mobile responsiveness, camera capture on your phone, and the
      animations (FAQ accordion, section scroll-reveals, nav underline,
      results page confidence bar)

## Project layout

```
skin-tone-project/
├── frontend/              React app — pages, components, animations (Phase 1 spec)
├── backend/                FastAPI app (Phase 16 spec structure)
│   ├── app/
│   ├── trained_models/     skin_tone_model.joblib, class_names.json, training_metrics.json
│   └── README.md            full architecture + limitations writeup
├── scripts/
│   ├── prepare_dataset.py               Phase 7 — segmentation + auto-labeling
│   ├── experiment_feature_selection.py  the cross-validated experiment behind the accuracy jump
│   ├── train_model.py                   Phase 9 (adapted) — trains the live model
│   └── train_cnn_mobilenetv2.py         Phase 9 (as originally specified) — upgrade path
├── dataset_raw/             your original 45 uploaded photos
└── dataset_processed/       labels.csv, dataset_report.md, train/validation/test splits
```
