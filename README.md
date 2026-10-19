# PuneSahayak

> **From a citizen's voice to a clear civic action plan.**

PuneSahayak is an open-source, multilingual civic complaint assistant for Pune.
It lets a citizen describe an issue in English, Marathi, Hindi, or Hinglish and
uses Google's open Gemma 4 model through the Gemini API to turn that description
into a structured, reviewable bilingual civic report.

**Project status:** Hackathon MVP
**License:** Apache 2.0
**Primary category:** Best Use of Gemma 4
**Repository:** https://github.com/kesharicoder/PuneSahayak

## Why PuneSahayak exists

Citizens notice potholes, accumulated waste, broken streetlights, water
problems, drainage issues, and traffic hazards every day. Reporting is often
hard because the user may not know the correct department, may not be
comfortable writing formal English, or may not know which important detail is
missing.

PuneSahayak keeps the interaction conversational and local-language friendly:

1. The citizen describes the issue naturally.
2. Gemma understands the original wording without requiring translation.
3. Gemma identifies the category, urgency, locality, and responsible department.
4. If a critical detail is missing, the assistant asks one focused follow-up
   question instead of generating an incomplete report.
5. The citizen reviews the English and Marathi report.
6. The citizen downloads a PDF draft for submission through the appropriate
   official channel.

## Main features

| Feature | What it does | Status |
|---|---|---|
| Gemma 4 analysis | Understands multilingual complaints and returns validated civic JSON | Available |
| Marathi, Hindi, Hinglish, English | Supports typed complaints and browser speech input where supported | Available |
| Image evidence | Upload an image or capture one with the webcam; Gemma analyzes image + complaint together | Available |
| Conversational follow-up | Asks one question at a time for missing details and re-analyzes the conversation | Available |
| Bilingual report | Generates English and Marathi report text | Available |
| PDF download | Creates a browser PDF with complaint, image, metadata, reports, actions, and disclaimer | Available |
| Back navigation | Lets users return to the previous step without losing the draft | Available |
| Community insights | Shows anonymized/demo Pune issue statistics and area information | Available |
| Structured location input | Backend accepts optional validated coordinates and source metadata | Available in API |
| Interactive map selector | Leaflet/OpenStreetMap map, search, marker, reverse geocoding, and GPS selection | UI integration pending |

PuneSahayak does not automatically submit a complaint to PMC. The generated
report is an AI-assisted draft that the citizen must verify and submit through
the appropriate official process.

## Why Gemma 4

Gemma is a core part of the product rather than a decorative chatbot. It is
used for:

- Understanding informal Marathi, Hindi, Hinglish, and English.
- Extracting the meaning of a complaint without asking the citizen to rewrite it.
- Classifying civic categories such as roads, waste, water, drainage, and
  streetlights.
- Estimating urgency while preserving uncertainty.
- Recommending the likely department.
- Identifying the most important missing detail.
- Generating English and Marathi report drafts.
- Producing structured JSON consumed by the application.
- Understanding an attached image together with the citizen's written context.

The configured default model is:

```text
gemma-4-26b-a4b-it
```

The server-side integration is in
`backend/app/services/gemma.py`. The browser never receives the provider key.

## System architecture

```text
React + Vite frontend
        │
        │ same-origin /api requests
        ▼
FastAPI backend
        │
        ├── request and location validation
        ├── prompt and conversation context construction
        ├── in-memory image handling
        └── safe provider error handling
        │
        ▼
Gemma 4 through the Gemini API
        │
        ▼
Validated civic analysis JSON
        │
        ▼
Review screen → browser-generated bilingual PDF
```

The MVP does not require a database. Complaint drafts remain in the browser
flow and are not persisted by the backend.

## Repository structure

```text
PuneSahayak/
├── README.md
├── PRD.md
├── CONTRIBUTING.md
├── LICENSE
├── .env.example
├── .gitignore
├── data/
│   ├── categories.json
│   └── sample_complaints.json
├── docs/
│   ├── architecture.md
│   ├── api.md
│   ├── design.md
│   ├── demo-script.md
│   ├── privacy.md
│   ├── rbac.md
│   ├── security.md
│   └── testing.md
├── backend/
│   ├── app/
│   │   ├── config.py
│   │   ├── main.py
│   │   ├── routes/analyze.py
│   │   ├── schemas/analysis.py
│   │   └── services/gemma.py
│   ├── requirements.txt
│   └── tests/
└── frontend/
    ├── index.html
    ├── package.json
    └── src/
        ├── data/puneWardsData.js
        ├── i18n/translations.js
        ├── main.jsx
        ├── services/apiClient.js
        ├── services/pdfReport.js
        └── styles.css
    ```

## Prerequisites

- Node.js 18 or newer and npm.
- Python 3.10 or newer.
- A Gemini API key with access to the configured Gemma model.
- A modern browser. Chrome, Edge, and Safari provide the best support for
  browser speech and camera features.

## Environment configuration

Copy the example file into a local ignored environment file. Do not paste a
real key into GitHub, the frontend, screenshots, logs, or chat transcripts.

### macOS/Linux/Git Bash

```bash
cp .env.example .env
```

### Windows PowerShell

```powershell
Copy-Item .env.example .env
```

Set the server-side values in `.env`:

```env
GEMMA_API_KEY=your_rotated_gemma_or_gemini_key
GEMINI_API_KEY=
GEMMA_MODEL=gemma-4-26b-a4b-it
GEMMA_THINKING_LEVEL=high
# Optional fallback for older SDK/model configurations:
GEMMA_THINKING_BUDGET=0
```

`GEMMA_API_KEY` takes precedence over `GEMINI_API_KEY`. Both variables are
accepted because Gemma is accessed through the Gemini API. The frontend does
not read either variable.

## Install and run locally

Open two terminals from the repository root.

### Terminal 1 — backend

```bash
cd backend
python -m venv .venv
```

Activate the environment:

```bash
# macOS/Linux/Git Bash
source .venv/bin/activate

# Windows PowerShell
.venv\Scripts\Activate.ps1
```

Install dependencies and start FastAPI:

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The backend will be available at `http://localhost:8000` and its interactive
API documentation at `http://localhost:8000/docs`.

### Terminal 2 — frontend

```bash
cd frontend
npm install
npm run dev
```

Open the URL printed by Vite, normally `http://localhost:5173`. In development,
Vite proxies `/api/*` to `http://localhost:8000`, so provider credentials stay
on the server.

## Complaint flow

### 1. Describe

The user can:

- Type an English, Marathi, Hindi, or Hinglish complaint.
- Use browser speech recognition when the browser supports it.
- Upload an image from the device.
- Open the webcam viewfinder, capture a photo, preview it, retake it, or use it.
- Optionally provide a manual location and civic category.

### 2. Analyze

The frontend calls `POST /api/analyze` for text-only complaints or
`POST /api/analyze-image` when an image is attached. Gemma receives the
original language and context; the user is not required to translate the issue
into formal English.

For a complaint such as:

```text
Aundh madhe kachra khup jama zala aahe, smell yetoy.
```

Gemma should identify accumulated waste, Aundh as the reported locality, and a
sanitation concern. It should return a bilingual report and request a missing
detail when that detail is important to responsible follow-up.

### 3. Follow up

If the model returns `missing_information`, PuneSahayak shows only the first
follow-up question. The answer is added to a bounded conversation transcript
and the same analysis endpoint is called again.

Example:

```text
Citizen: There is a pothole in Kothrud.
PuneSahayak: Can you share the road name or a nearby landmark?
Citizen: Near the MIT College gate.
PuneSahayak: Updated report ready for review.
```

Report generation stays disabled while important details remain unresolved.

### 4. Review and download

The review screen shows the complaint, category, urgency, location,
department, English report, Marathi report, recommended actions, and disclaimer.
Clicking **Generate & download PDF** creates an A4 PDF in the browser. The PDF
contains the attached image when it can be embedded and does not claim that a
government complaint was submitted.

## API endpoints

### Health check

```http
GET /health
```

Response:

```json
{
  "status": "ok",
  "service": "punesahayak-backend"
}
```

### Text complaint analysis

```http
POST /api/analyze
Content-Type: application/json
```

Example request:

```json
{
  "text": "There is a pothole in Kothrud near the MIT College gate.",
  "location": {
    "latitude": 18.5074,
    "longitude": 73.8077,
    "address": "Kothrud, Pune",
    "location_source": "map",
    "location_accuracy": 8.5,
    "location_confirmed": true
  },
  "category": null,
  "language": "auto",
  "conversation": [
    { "role": "user", "content": "There is a pothole in Kothrud." },
    { "role": "assistant", "content": "Can you share the road name or a nearby landmark?" },
    { "role": "user", "content": "Near the MIT College gate." }
  ]
}
```

`location` also accepts the legacy string form, such as
`"Kothrud, Pune"`. Structured location coordinates are optional, but latitude
and longitude must be provided together. Coordinates are validated by the
backend and are passed to Gemma as separate structured context; the model is
not allowed to fabricate or infer exact coordinates.

### Image complaint analysis

```http
POST /api/analyze-image
Content-Type: multipart/form-data
```

Multipart fields:

| Field | Required | Description |
|---|---:|---|
| `image` | Yes | JPEG, PNG, GIF, or WebP image; maximum 10 MiB |
| `text` | Yes | Complaint text with at least 10 characters |
| `location` | No | Legacy text or JSON-encoded structured location |
| `category` | No | One allowed civic category |
| `language` | No | `auto`, `en`, `hi`, or `mr` |
| `conversation` | No | JSON-encoded bounded transcript |

Images are read into memory for the provider request and are not permanently
stored by the backend.

### Analysis response

Both analysis endpoints return the same validated shape:

```json
{
  "category": "Waste Management",
  "severity": "high",
  "language": "Hinglish",
  "summary": "Accumulated waste has been reported in Aundh.",
  "location": "Aundh, Pune",
  "recommended_department": "Solid Waste Management",
  "missing_information": [],
  "english_report": "...",
  "marathi_report": "...",
  "actions": ["..."],
  "reference": null
}
```

Invalid model JSON, invalid coordinates, missing credentials, unsupported image
types, and provider failures return safe errors without provider secrets or
model payloads.

## Location support

The backend currently supports optional structured location metadata:

```json
{
  "latitude": 18.5596,
  "longitude": 73.7868,
  "address": "Baner, Pune",
  "location_source": "map",
  "location_accuracy": 8.5,
  "location_confirmed": true
}
```

Allowed `location_source` values are `map`, `search`, `gps`, and `manual`.
Latitude must be in `[-90, 90]`, longitude in `[-180, 180]`, and accuracy must
be non-negative. There is currently no database, so coordinates are not
persisted as complaint records.

The stable frontend currently keeps manual location entry available. The
interactive Leaflet/OpenStreetMap selector is tracked as the next UI increment
because the first React Leaflet attempt caused a blank-screen regression and was
removed from the stable flow. Do not describe the map selector as live until a
working component is restored and tested end-to-end.

When the map selector is enabled, it should use OpenStreetMap tiles with
attribution and a configurable, debounced geocoder. A suggested configuration
name is `VITE_GEOCODER_URL`; the default provider must follow its acceptable-use
policy and rate limits. Browser GPS must be requested only after the user clicks
**Use My Location**, and the UI must retain manual selection if permission is
denied.

## Privacy and security

- Provider credentials are server-side only.
- Never commit `.env`, API keys, certificates, private datasets, or user report
  exports.
- No account or identity is required for the MVP.
- Complaint images are kept in browser memory and backend request memory only.
- The backend does not persist complaint text, images, or coordinates.
- Model output is schema-validated before the frontend treats it as structured
  data.
- User text, conversation messages, image contents, and location values are
  treated as untrusted input.
- The user must review the draft before downloading or sharing it.
- Community insight values are demo/anonymized data unless a verified data
  source is explicitly connected.
- Location coordinates should not be exposed publicly for private homes or
  sensitive complaints without an explicit privacy and authorization design.

See [docs/security.md](docs/security.md), [docs/privacy.md](docs/privacy.md),
and [docs/rbac.md](docs/rbac.md) for the detailed rules.

## Testing and verification

### Frontend

From `frontend/`:

```bash
npm install
npm run build
```

The build verifies the Vite production bundle and catches JSX/import errors.

### Backend

From the repository root, after activating the backend virtual environment:

```bash
python -m pytest backend/tests -q
```

The backend tests cover:

- Health endpoint behavior.
- Successful mocked Gemma analysis.
- Schema validation and safe invalid-model errors.
- Missing credentials.
- Image MIME type and size validation.
- Conversation context forwarding.
- Structured location coordinate ranges and coordinate pairing.
- JSON-encoded structured location in multipart image requests.

No test should make a real Gemini request. Use a local rotated key only for a
manual integration demo.

## Demo script

1. Start the backend and frontend.
2. Enter a Marathi or Hinglish waste complaint, for example:
   `Aundh madhe kachra khup jama zala aahe, smell yetoy.`
3. Show Gemma understanding the original wording and generating English and
   Marathi report text.
4. Enter `There is a pothole in Kothrud.` and show the one-question follow-up.
5. Answer `Near the MIT College gate.` and show the conversation-aware report.
6. Upload or capture a civic issue image and show that the image is analyzed
   together with the complaint.
7. Click **Generate & download PDF** and open the downloaded report.
8. Point to `backend/app/services/gemma.py`, the model name, and the public
   GitHub repository.

## Troubleshooting

### The frontend cannot reach the backend

Confirm that FastAPI is running on port 8000 and that Vite is running from the
`frontend/` folder. The development proxy only applies to the Vite dev server.

### Analysis says the service is not configured

Confirm that `.env` is in the repository root and contains a rotated
`GEMMA_API_KEY` or `GEMINI_API_KEY`. Restart Uvicorn after changing it.

### Camera or microphone access fails

Allow the browser permission and use `localhost` or HTTPS. The browser may
disable camera, microphone, or geolocation features on an insecure remote
origin. Uploading an image from the device remains available as a fallback.

### PDF does not include the image

The complaint can still be downloaded as a text report. Image embedding may
fail for an unsupported browser image format or a corrupted file; the PDF
records that the image was attached but could not be embedded.

### Python is not found

Install Python 3.10+ and ensure `python` is available on `PATH`, then recreate
the virtual environment and install `backend/requirements.txt`.

## Documentation

- [Product requirements](PRD.md)
- [Architecture](docs/architecture.md)
- [API contract](docs/api.md)
- [Design specification](docs/design.md)
- [Security requirements](docs/security.md)
- [Privacy and data handling](docs/privacy.md)
- [Access control and RBAC](docs/rbac.md)
- [Testing strategy](docs/testing.md)
- [Contributing guide](CONTRIBUTING.md)
- [Demo script](docs/demo-script.md)

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.
Useful contributions include Marathi/Hinglish fixtures, schema-validation
tests, accessibility improvements, report formatting, and a tested Leaflet
location selector that follows OpenStreetMap and geocoder usage policies.

## License

PuneSahayak is released under the [Apache License 2.0](LICENSE).
