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

## Analyze complaint — planned MVP endpoint

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
  "marathi_report": "..."
}
```

## API rules

- The Gemini API key is server-side only.
- `text` must be non-empty and bounded in length.
- `category` is optional and must be checked against the allowed category list.
- The backend must validate every model response before returning it.
- Errors should return a safe user-facing message without provider keys or stack traces.
