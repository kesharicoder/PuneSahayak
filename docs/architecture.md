# Architecture

## System overview

```text
React/Vite frontend
        ↓
FastAPI backend
        ↓
Prompt + category rules
        ↓
Gemma 4 through Gemini API
        ↓
Schema validation
        ↓
English/Marathi report for user review
```

## Responsibilities

- **Frontend:** collect complaint input, show progress, display validated results, and keep the user in control.
- **Backend:** hold provider credentials, construct prompts, call Gemma, validate output, and provide safe errors.
- **Gemma:** understand multilingual complaints and produce the civic analysis fields.
- **Data files:** define allowed categories and stable demo fixtures.

## Trust boundary

The browser is untrusted. It must never receive the Gemini API key or decide whether a model response is valid. The backend validates model output before returning it to the UI.

## MVP persistence

No database is required for the anonymous draft-generation MVP. If persistence is added, it must follow `docs/privacy.md` and `docs/rbac.md` before implementation.
