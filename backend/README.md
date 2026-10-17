# PuneSahayak backend

FastAPI backend for complaint analysis and Gemma 4 integration through the Gemini API.

## Modules

- `app/routes/` — HTTP endpoints
- `app/services/` — Gemma and report-generation services
- `app/schemas/` — request and response validation
- `app/models/` — persistence models
- `app/prompts/` — versioned model prompts
- `tests/` — API and service tests

## Local configuration

Copy the repository `.env.example` to `.env` for local development. Set
`GEMMA_API_KEY` or `GEMINI_API_KEY` in the server environment only; the former
takes precedence when both are present. The backend defaults to
`gemma-4-26b-a4b-it`; set `GEMMA_MODEL` to override it. Never put a provider
credential in frontend code, request payloads, logs, or committed files. The
thinking configuration follows the Gemini SDK example with
`GEMMA_THINKING_LEVEL=high`, with a budget fallback for older SDK versions.

Run the backend with:

```bash
uvicorn app.main:app --reload
```

The backend exposes `POST /api/analyze` for text complaints and
`POST /api/analyze-image` for an in-memory image plus complaint context. Both
endpoints return the same validated civic-analysis shape. The optional bounded
conversation context lets Gemma ask for one missing detail at a time before a
report is generated.

## Location input

The request `location` field accepts the existing display string or a validated
structured object. The response contract is unchanged: Gemma still returns a
display string (or `null`) in its `location` field.

Legacy request:

```json
{ "location": "Baner, Pune" }
```

Structured request:

```json
{
  "location": {
    "latitude": 18.5596,
    "longitude": 73.7868,
    "address": "Baner, Pune",
    "location_source": "map",
    "location_accuracy": 8.5,
    "location_confirmed": true
  }
}
```

`latitude` must be between -90 and 90, `longitude` between -180 and 180,
and `location_accuracy` must be non-negative. Latitude and longitude must be
provided together when either is present. `location_source` is one of `map`,
`search`, `gps`, or `manual`; all structured fields are optional. The map
client's `lat` and `lng` names are also accepted as input aliases for the
canonical `latitude` and `longitude` names.

For `POST /api/analyze-image`, send the structured object as a JSON-encoded
value in the multipart `location` field. Plain text in that field remains a
legacy location string. The selected object is passed to Gemma as a separate,
server-validated prompt input for report context; it is never persisted, and
the model is instructed not to infer or fabricate exact coordinates.

## Image analysis

`POST /api/analyze-image` accepts multipart form data with:

- `image` — a JPEG, PNG, GIF, or WebP upload (10 MiB maximum)
- `text` — the complaint text (at least 10 characters)
- `location` — an optional plain string or JSON-encoded structured location
- `category` and `language` — optional complaint context fields

The image is read into memory for one server-side Gemini request and is not
stored permanently. The endpoint returns the same validated `CivicAnalysis`
shape as `POST /api/analyze`, including the English and Marathi reports,
category, severity/urgency, location, missing information, and actions. The
Gemini credential remains server-side and is never accepted in this request.
