# PuneSahayak

PuneSahayak is a multilingual civic reporting assistant powered by Gemma 4 through the Gemini API.

## Project structure

- `frontend/` — web interface for submitting and reviewing civic complaints
- `backend/` — FastAPI service, Gemma integration, validation, and report generation
- `data/` — civic categories and sample complaints
- `docs/` — architecture, design, security, privacy, RBAC, API, testing, and demo documentation

## Project documentation

- [Product requirements](PRD.md)
- [Architecture](docs/architecture.md)
- [Design specification](docs/design.md)
- [Security requirements](docs/security.md)
- [Privacy and data handling](docs/privacy.md)
- [Access control and RBAC](docs/rbac.md)
- [API contract](docs/api.md)
- [Testing strategy](docs/testing.md)
- [Contributing guide](CONTRIBUTING.md)
- [Demo script](docs/demo-script.md)

## Planned AI workflow

1. Accept a Marathi, Hindi, Hinglish, or English complaint.
2. Send the complaint to Gemma through the Gemini API.
3. Classify the issue, severity, location, and responsible department.
4. Detect missing information.
5. Generate English and Marathi reports for user review.

## Local setup

Copy `.env.example` to `.env` and configure the Gemini credential in the
server environment only. Never commit `.env`.

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Model

The backend uses `gemma-4-26b-a4b-it` by default through the server-side
Gemini API client. Set `GEMMA_MODEL` in the server environment to override the
model. `GEMINI_API_KEY` is read only by the backend and must never be placed in
frontend code or request payloads.
