# API contract

## Health check

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

## Analyze complaint

```http
POST /api/analyze
Content-Type: application/json
```

Request:

```json
{
  "text": "Baner bus stop ke paas char din se kachra pada hai.",
  "location": "Baner, Pune",
  "category": null,
  "language": "auto"
}
```

The backend calls the configured Gemma model and validates its JSON before
returning it. `text` must contain at least 10 characters. `location`,
`category`, and `language` are optional; `category`, when supplied, must be one
of the categories in `data/categories.json`.

Response:

```json
{
  "category": "Waste Management",
  "severity": "high",
  "language": "Hinglish",
  "summary": "Garbage has not been collected near the Baner bus stop for four days.",
  "location": "Baner, Pune",
  "recommended_department": "Solid Waste Management",
  "missing_information": [],
  "english_report": "...",
  "marathi_report": "...",
  "actions": [],
  "reference": null
}
```

## API rules

- The Gemini API key is server-side only.
- `text` must be non-empty and bounded in length.
- `category` is optional and must be checked against the allowed category list.
- The backend must validate every model response before returning it.
- Errors should return a safe user-facing message without provider keys or stack traces.

When `GEMINI_API_KEY` is missing, the endpoint returns HTTP 503. Invalid JSON
or schema-invalid model output returns HTTP 502. The server uses
`gemma-4-26b-a4b-it` by default and accepts `GEMMA_MODEL` as an environment
override; credentials are never sent to the browser.
