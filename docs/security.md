# Security requirements

## Scope

This document covers the hackathon MVP: a public frontend, a FastAPI backend, and a server-side Gemini API call using Gemma 4.

## Secrets

- Store `GEMINI_API_KEY` only in a local `.env` file or deployment secret manager.
- Never place keys in React code, browser local storage, screenshots, logs, README examples, or test fixtures.
- Commit `.env.example` with empty placeholders only.
- Rotate the key immediately if it is exposed.

## Input and model safety

- Treat every complaint as untrusted user input.
- Use a fixed system instruction and allowed category list.
- Do not allow user text to override model instructions.
- Validate the model response against a schema before returning it to the frontend.
- Do not render model output as raw HTML.
- Preserve uncertainty and return `missing_information` rather than guessing.

## API protections

Before public deployment, add:

- Request-size limits.
- Rate limiting per IP or session.
- CORS restricted to the real frontend origin.
- Timeouts and bounded retries for Gemini calls.
- Redacted error logs.
- Health checks that do not expose configuration or secrets.

## Data handling

- Do not require a name, phone number, or email for the MVP.
- Avoid storing complaint text by default.
- If persistence is added, define retention and deletion behavior first.
- Do not expose one user's report to another user.
- Strip or redact sensitive content from analytics.

## Security acceptance checklist

- [ ] `.env` is ignored by Git.
- [ ] No secret appears in tracked files.
- [ ] Gemini calls happen only in the backend.
- [ ] Model output is schema-validated.
- [ ] User review occurs before sharing.
- [ ] Demo statistics are labelled as anonymized/demo data.
