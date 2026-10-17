from fastapi import FastAPI

app = FastAPI(
    title="PuneSahayak API",
    description="Multilingual civic reporting assistant powered by Gemma.",
    version="0.1.0",
)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok", "service": "punesahayak-backend"}
