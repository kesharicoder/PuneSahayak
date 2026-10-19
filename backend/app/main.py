from fastapi import FastAPI

from app.routes.analyze import router as analyze_router

app = FastAPI(
    title="PuneSahayak API",
    description="Multilingual civic reporting assistant powered by Gemma.",
    version="0.1.0",
)

app.include_router(analyze_router)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok", "service": "punesahayak-backend"}
