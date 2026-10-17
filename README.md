# PuneSahayak

PuneSahayak is a multilingual civic reporting assistant powered by Gemma 4 through the Gemini API.

## Project structure

- `frontend/` — web interface for submitting and reviewing civic complaints
- `backend/` — FastAPI service, Gemma integration, validation, and report generation
- `data/` — civic categories and sample complaints
- `docs/` — architecture and demo documentation

## Planned AI workflow

1. Accept a Marathi, Hindi, Hinglish, or English complaint.
2. Send the complaint to Gemma through the Gemini API.
3. Classify the issue, severity, location, and responsible department.
4. Detect missing information.
5. Generate English and Marathi reports for user review.

## Local setup

Backend setup instructions will be added as the API is implemented. Copy `.env.example` to `.env` and add the Gemini API key locally. Never commit `.env`.

## Model

The exact Gemma model identifier required by the event will be recorded here after the Gemini API model is confirmed.
