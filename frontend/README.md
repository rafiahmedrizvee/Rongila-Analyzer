# রঙিলা (Rongila) — Skin Tone Analyzer (Frontend)

React frontend for "Skin Tone Classification Using Computer Vision and
Skin Care Guidance." Connected to the real FastAPI backend in `../backend`
— not mock data. See `../PROJECT_STATUS.md` for the whole project's
status and `../backend/README.md` for the model/API details.

## Stack

- React 18 + Vite
- Tailwind CSS (custom design tokens in `tailwind.config.js`)
- React Router (`/`, `/analyze`, `/results`, `/guide`, `/about`, `/contact`)
- Framer Motion — animated FAQ accordion, staggered scroll-reveals on
  section grids, animated nav underline, animated mobile menu, page
  transitions, animated results confidence bar
- Lucide React icons
- Axios-based API layer (`src/services/api.js`), `USE_MOCK = false`

## Setup

Requires Node.js 18+ and npm, and an internet connection to install
packages (not available in the sandbox this was built in).

```bash
npm install
npm run dev
```

Open the printed local URL (typically `http://localhost:5173`). For
`/analyze` to return real predictions, the backend needs to be running
too — see `../backend/README.md`. If the backend isn't running, `/analyze`
will show the connection error message rather than crashing.

## How to test the flow

1. **Home (`/`)** — hero swatch animation, scroll-reveal on the "How it
   works" steps and feature/tone-scale grids, animated FAQ accordion.
2. **Analyze (`/analyze`)** — upload a JPG/PNG (drag-and-drop or browse)
   or use the camera, then click **Analyze skin tone**. You'll see the
   7-step animated loader, then land on `/results` with a real prediction
   from the trained model.
3. **Results (`/results`)** — analyzed photo, predicted tone with an
   animated confidence bar, a staggered status checklist, and the
   morning/evening/sun-protection routine — plus hand-specific care tips
   when the photo wasn't a detected face, and any lighting/confidence
   notes the backend flagged. Visiting `/results` directly (no analysis
   run) shows a labeled sample result instead of crashing.
4. **Guide (`/guide`)** — expand each of the eight tone classes for their
   full routine.
5. **About (`/about`)** and **Contact (`/contact`)** — static content and
   a local-only contact form.
6. **Responsiveness** — resize to phone width; the nav collapses into an
   animated menu, grids reflow to one or two columns.

## Error handling to check

- No image selected → "Please upload or capture an image first."
- Non-JPG/PNG or >8MB file → rejected client-side with a message.
- Backend unreachable → "Unable to connect to the analysis server."
- Photo with no detectable skin (e.g. a landscape) → backend's 422 error
  message is shown, not a crash.

## Validation notes

No live `npm run dev` was run in the build sandbox (no network access to
install packages). Every `.jsx`/`.js` file was instead syntax-checked with
esbuild directly, and the full app's import graph was bundled (with npm
packages marked external) to confirm every internal component/page/hook
import resolves correctly. Run `npm install && npm run dev` on your own
machine to see it live.
