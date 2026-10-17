# PuneSahayak frontend

The frontend provides the complaint submission form, live backend analysis
state, report review screen, and export actions.

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

The frontend calls `POST /api/analyze` for each complaint. If the backend is
unavailable or returns an error, the flow shows an actionable error state and
does not present simulated analysis results.

## Folders

- `src/components/` — reusable UI components
- `src/pages/` — application screens
- `src/services/` — backend API clients
- `src/types/` — shared frontend types
