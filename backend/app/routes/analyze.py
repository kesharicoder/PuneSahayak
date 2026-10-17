"""Complaint analysis HTTP endpoints."""

from typing import Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.exceptions import RequestValidationError
from pydantic import ValidationError

from app.schemas.analysis import AnalysisRequest, CivicAnalysis
from app.services.gemma import (
    AnalysisServiceError,
    InvalidModelResponseError,
    MissingCredentialsError,
    ProviderError,
    get_analysis_service,
)


router = APIRouter(prefix="/api", tags=["analysis"])

MAX_IMAGE_BYTES = 10 * 1024 * 1024
ALLOWED_IMAGE_MIME_TYPES = frozenset(
    {"image/gif", "image/jpeg", "image/png", "image/webp"}
)


def _request_from_form(
    text: str,
    location: Optional[str],
    category: Optional[str],
    language: Optional[str],
) -> AnalysisRequest:
    try:
        return AnalysisRequest(
            text=text,
            location=location,
            category=category,
            language=language,
        )
    except ValidationError as exc:
        # Reuse the JSON endpoint's Pydantic validation and let FastAPI return
        # its normal 422 response without exposing model/provider data.
        raise RequestValidationError(exc.errors()) from exc


def _raise_analysis_http_error(exc: AnalysisServiceError) -> None:
    if isinstance(exc, MissingCredentialsError):
        raise HTTPException(
            status_code=503,
            detail="Analysis service is not configured.",
        ) from exc
    if isinstance(exc, InvalidModelResponseError):
        raise HTTPException(
            status_code=502,
            detail="Analysis service returned an invalid response.",
        ) from exc
    if isinstance(exc, ProviderError):
        raise HTTPException(
            status_code=502,
            detail="Analysis service is temporarily unavailable.",
        ) from exc
    raise HTTPException(
        status_code=502,
        detail="Analysis service could not analyze the complaint.",
    ) from exc


@router.post("/analyze", response_model=CivicAnalysis)
def analyze(request: AnalysisRequest) -> CivicAnalysis:
    try:
        return get_analysis_service().analyze(request)
    except MissingCredentialsError as exc:
        _raise_analysis_http_error(exc)
    except InvalidModelResponseError as exc:
        _raise_analysis_http_error(exc)
    except ProviderError as exc:
        _raise_analysis_http_error(exc)
    except AnalysisServiceError as exc:
        _raise_analysis_http_error(exc)


@router.post("/analyze-image", response_model=CivicAnalysis)
async def analyze_image(
    image: UploadFile = File(...),
    text: str = Form(...),
    location: Optional[str] = Form(default=None),
    category: Optional[str] = Form(default=None),
    language: Optional[str] = Form(default="auto"),
) -> CivicAnalysis:
    """Analyze a complaint and image without storing the upload on disk."""

    mime_type = (image.content_type or "").split(";", 1)[0].strip().lower()
    if mime_type not in ALLOWED_IMAGE_MIME_TYPES:
        raise HTTPException(
            status_code=415,
            detail="Unsupported image type. Use JPEG, PNG, GIF, or WebP.",
        )

    try:
        image_bytes = await image.read(MAX_IMAGE_BYTES + 1)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Image could not be read.") from exc
    finally:
        await image.close()

    if not image_bytes:
        raise HTTPException(status_code=400, detail="Image file is empty.")
    if len(image_bytes) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=413, detail="Image file is too large.")

    request = _request_from_form(text, location, category, language)
    try:
        return get_analysis_service().analyze_image(request, image_bytes, mime_type)
    except MissingCredentialsError as exc:
        _raise_analysis_http_error(exc)
    except InvalidModelResponseError as exc:
        _raise_analysis_http_error(exc)
    except ProviderError as exc:
        _raise_analysis_http_error(exc)
    except AnalysisServiceError as exc:
        _raise_analysis_http_error(exc)
