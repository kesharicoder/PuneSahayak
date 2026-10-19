"""Complaint analysis HTTP endpoints."""

import json
from typing import Any, Optional

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


def _parse_location_form(value: Any) -> Any:
    """Parse a multipart location object while preserving legacy text values."""

    if value is None or not isinstance(value, str):
        return value

    cleaned = value.strip()
    if not cleaned:
        return None

    # A plain location such as ``Baner, Pune`` remains a string. Structured
    # multipart callers send the object as a JSON object in this same field.
    if not cleaned.startswith("{"):
        return cleaned

    try:
        parsed = json.loads(cleaned)
    except json.JSONDecodeError:
        # Keep malformed legacy text compatible; a valid-looking object still
        # receives normal AnalysisRequest validation when it parses as JSON.
        return cleaned
    return parsed


def _request_from_form(
    text: str,
    location: Optional[str],
    category: Optional[str],
    language: Optional[str],
    conversation: Optional[str] = None,
) -> AnalysisRequest:
    conversation_data = []
    if conversation:
        try:
            parsed_conversation = json.loads(conversation)
            if isinstance(parsed_conversation, list):
                conversation_data = parsed_conversation
        except (TypeError, json.JSONDecodeError):
            # Transcript is supplemental context; still validate the primary text.
            conversation_data = []

    try:
        return AnalysisRequest(
            text=text,
            location=_parse_location_form(location),
            category=category,
            language=language,
            conversation=conversation_data,
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
    conversation: Optional[str] = Form(default=None),
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

    request = _request_from_form(text, location, category, language, conversation)
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
