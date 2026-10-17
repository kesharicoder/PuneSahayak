# Architecture

```text
Frontend → FastAPI backend → Gemma through Gemini API → validated civic report
```

The frontend will never receive the Gemini API key. The backend will call the model, validate its structured response, and return only the fields required by the user interface.
