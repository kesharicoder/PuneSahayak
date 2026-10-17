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

## Image analysis

`POST /api/analyze-image` accepts multipart form data with:

- `image` — a JPEG, PNG, GIF, or WebP upload (10 MiB maximum)
- `text` — the complaint text (at least 10 characters)
- `location`, `category`, and `language` — optional complaint context fields

The image is read into memory for one server-side Gemini request and is not
stored permanently. The endpoint returns the same validated `CivicAnalysis`
shape as `POST /api/analyze`, including the English and Marathi reports,
category, severity/urgency, location, missing information, and actions. The
Gemini credential remains server-side and is never accepted in this request.
