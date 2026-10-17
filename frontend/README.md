# PuneSahayak frontend

The frontend provides the complaint submission form, live backend analysis
state, conversational follow-up questions, image evidence capture, report
review, and browser PDF export.

## Run locally

Start the FastAPI backend in one terminal first. It must be listening on port
8000 and have its provider credential configured in the backend environment:

```bash
cd ../backend
uvicorn app.main:app --reload
```

Then start the Vite frontend in a second terminal:

```bash
npm install
npm run dev
```

Open the URL printed by Vite (normally `http://localhost:5173`). During local
development, Vite proxies `/api/*` to `http://localhost:8000`, so the browser
does not need provider credentials and none are sent from this frontend.

To verify a production build:

```bash
npm run build
```

The frontend calls `POST /api/analyze` for text-only complaints and
`POST /api/analyze-image` when an image is attached. Image uploads use
multipart fields (`image`, `text`, `location`, `category`, and `language`) and
remain in browser memory. If the backend returns `missing_information`, the
user is asked one question at a time; each answer is appended to the complaint
context and sent back through the same endpoint before report generation is
enabled.

The review screen generates and downloads a PDF directly in the browser. The
PDF includes the complaint, attached image when it can be embedded, bilingual
reports, category, urgency, location, department, recommended actions, and an
AI-assisted-report disclaimer. Provider credentials are never read or sent by
this frontend.

## Folders

- `src/components/` — reusable UI components
- `src/pages/` — application screens
- `src/services/` — backend API clients
- `src/types/` — shared frontend types
