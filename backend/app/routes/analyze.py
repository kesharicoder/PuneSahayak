"""Complaint analysis HTTP endpoint."""

from fastapi import APIRouter, HTTPException

from app.schemas.analysis import AnalysisRequest, CivicAnalysis
from app.services.gemma import (
    AnalysisServiceError,
    InvalidModelResponseError,
    MissingCredentialsError,
    ProviderError,
    get_analysis_service,
)


router = APIRouter(prefix="/api", tags=["analysis"])


@router.post("/analyze", response_model=CivicAnalysis)
def analyze(request: AnalysisRequest) -> CivicAnalysis:
    try:
        return get_analysis_service().analyze(request)
    except MissingCredentialsError as exc:
        raise HTTPException(
            status_code=503,
            detail="Analysis service is not configured.",
        ) from exc
    except InvalidModelResponseError as exc:
        raise HTTPException(
            status_code=502,
            detail="Analysis service returned an invalid response.",
        ) from exc
    except ProviderError as exc:
        raise HTTPException(
            status_code=502,
            detail="Analysis service is temporarily unavailable.",
        ) from exc
    except AnalysisServiceError as exc:
        raise HTTPException(
            status_code=502,
            detail="Analysis service could not analyze the complaint.",
        ) from exc
