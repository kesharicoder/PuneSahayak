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
  "language": "auto",
  "conversation": [
    { "role": "user", "content": "There is a pothole in Kothrud." },
    { "role": "assistant", "content": "Can you share the road name or a nearby landmark?" }
  ]
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
- `conversation` is bounded, optional context used for one-question-at-a-time follow-up.
- The backend must validate every model response before returning it.
- Errors should return a safe user-facing message without provider keys or stack traces.

When both `GEMMA_API_KEY` and `GEMINI_API_KEY` are missing, the endpoint returns
HTTP 503. `GEMMA_API_KEY` takes precedence when both are configured. Invalid
JSON or schema-invalid model output returns HTTP 502. The server uses
`gemma-4-26b-a4b-it` by default and accepts `GEMMA_MODEL` as an environment
override; credentials are never sent to the browser.

## Image analysis

```http
POST /api/analyze-image
Content-Type: multipart/form-data
```

The multipart request contains `image`, `text`, `location`, `category`,
`language`, and optional JSON-encoded `conversation` fields. The backend keeps
the image in memory, sends it to Gemma with the complaint context, and returns
the same validated response shape as the text endpoint.
