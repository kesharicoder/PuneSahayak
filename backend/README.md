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
`GEMINI_API_KEY` in the server environment only. The backend defaults to
`gemma-4-26b-a4b-it`; set `GEMMA_MODEL` to override it. Never put a provider
credential in frontend code, request payloads, logs, or committed files. The
optional `GEMMA_THINKING_BUDGET` setting defaults to `0` and is passed only
when the installed Google SDK supports its thinking configuration.

Run the backend with:

```bash
uvicorn app.main:app --reload
```
