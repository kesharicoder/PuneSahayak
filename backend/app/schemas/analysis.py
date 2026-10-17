"""Request and response validation for civic complaint analysis."""

from __future__ import annotations

import math
from typing import Any, List, Literal, Optional, Union

from pydantic import BaseModel, Field, root_validator, validator


ALLOWED_CATEGORIES = (
    "Roads",
    "Waste Management",
    "Water Supply",
    "Streetlights",
    "Traffic",
    "Drainage",
    "Public Safety",
    "Noise Pollution",
    "Parks",
    "Other",
)


def _clean_optional_text(value: Any) -> Any:
    if value is None:
        return None
    if not isinstance(value, str):
        return value
    cleaned = value.strip()
    return cleaned or None


class StructuredLocation(BaseModel):
    """A user-selected location accepted by the analysis request.

    The coordinate pair is optional, but a single coordinate is never valid.
    ``lat`` and ``lng`` are accepted as input aliases because the existing web
    map component uses those names; the canonical API names remain
    ``latitude`` and ``longitude``.
    """

    latitude: Optional[float] = Field(default=None, ge=-90, le=90)
    longitude: Optional[float] = Field(default=None, ge=-180, le=180)
    address: Optional[str] = Field(default=None, max_length=300)
    location_source: Optional[Literal["map", "search", "gps", "manual"]] = None
    location_accuracy: Optional[float] = Field(default=None, ge=0)
    location_confirmed: Optional[bool] = None

    @root_validator(pre=True)
    def normalize_coordinate_aliases(cls, values: Any) -> Any:
        if not isinstance(values, dict):
            return values

        normalized = dict(values)
        for canonical, alias in (("latitude", "lat"), ("longitude", "lng")):
            if alias not in normalized:
                continue
            if canonical in normalized and normalized[canonical] != normalized[alias]:
                raise ValueError("location coordinate aliases disagree")
            normalized[canonical] = normalized.pop(alias)
        return normalized

    @validator("latitude", "longitude", "location_accuracy", pre=True)
    def validate_finite_number(cls, value: Any) -> Any:
        if value is None:
            return None
        if isinstance(value, bool):
            raise ValueError("location coordinates and accuracy must be numbers")
        try:
            number = float(value)
        except (TypeError, ValueError) as exc:
            raise ValueError("location coordinates and accuracy must be numbers") from exc
        if not math.isfinite(number):
            raise ValueError("location coordinates and accuracy must be finite")
        return number

    @validator("address", pre=True)
    def trim_address(cls, value: Any) -> Any:
        return _clean_optional_text(value)

    @validator("location_source", pre=True)
    def normalize_source(cls, value: Any) -> Any:
        if value is None:
            return None
        if not isinstance(value, str):
            return value
        cleaned = value.strip().lower()
        return cleaned or None

    @root_validator(skip_on_failure=True)
    def require_complete_coordinate_pair(cls, values: Any) -> Any:
        has_latitude = values.get("latitude") is not None
        has_longitude = values.get("longitude") is not None
        if has_latitude != has_longitude:
            raise ValueError("latitude and longitude must be provided together")
        return values

    class Config:
        extra = "forbid"


# ``Location`` is a convenient public name for callers that want to import the
# structured request type directly, while ``StructuredLocation`` describes its
# role more explicitly in generated documentation and error messages.
Location = StructuredLocation


class ConversationMessage(BaseModel):
    """A small, bounded transcript used to gather missing complaint details."""

    role: Literal["user", "assistant"]
    content: str = Field(..., min_length=1, max_length=1000)

    @validator("content", pre=True)
    def trim_content(cls, value: Any) -> str:
        if not isinstance(value, str) or not value.strip():
            raise ValueError("conversation content must be a non-empty string")
        return value.strip()

    class Config:
        extra = "forbid"


class AnalysisRequest(BaseModel):
    """Input accepted by ``POST /api/analyze``."""

    text: str = Field(..., min_length=10, max_length=5000)
    # A legacy display string remains valid. New callers can send the
    # validated structured location object in this same field.
    location: Optional[Union[StructuredLocation, str]] = None
    category: Optional[str] = Field(default=None, max_length=80)
    language: Optional[str] = Field(default="auto", max_length=50)
    conversation: List[ConversationMessage] = Field(default_factory=list, max_items=20)

    @validator("text", pre=True)
    def validate_text(cls, value: Any) -> str:
        if not isinstance(value, str):
            raise ValueError("text must be a string")
        cleaned = value.strip()
        if len(cleaned) < 10:
            raise ValueError("text must contain at least 10 characters")
        return cleaned

    @validator("location", pre=True)
    def validate_location_input(cls, value: Any) -> Any:
        if value is None:
            return None
        if isinstance(value, StructuredLocation):
            return value
        if isinstance(value, dict):
            return value
        if not isinstance(value, str):
            raise ValueError("location must be a string or structured object")
        return _clean_optional_text(value)

    @validator("location")
    def validate_legacy_location_length(cls, value: Any) -> Any:
        if isinstance(value, str) and len(value) > 300:
            raise ValueError("location must contain at most 300 characters")
        return value

    @validator("category", "language", pre=True)
    def trim_optional_text(cls, value: Any) -> Any:
        return _clean_optional_text(value)

    @validator("category")
    def validate_category(cls, value: Optional[str]) -> Optional[str]:
        if value is not None and value not in ALLOWED_CATEGORIES:
            allowed = ", ".join(ALLOWED_CATEGORIES)
            raise ValueError("category must be one of: %s" % allowed)
        return value


class CivicAnalysis(BaseModel):
    """Validated, frontend-safe analysis returned by the backend.

    Some model prompts use ``urgency`` and ``department`` instead of the
    canonical API names. Those aliases are accepted on input and normalized so
    the public response remains stable.
    """

    category: str = Field(..., max_length=80)
    severity: str = Field(..., min_length=1, max_length=50)
    language: str = Field(..., min_length=1, max_length=50)
    summary: str = Field(..., min_length=1, max_length=2000)
    location: Optional[str] = Field(default=None, max_length=300)
    recommended_department: str = Field(..., min_length=1, max_length=150)
    missing_information: List[str] = Field(default_factory=list, max_items=20)
    english_report: str = Field(..., min_length=1, max_length=5000)
    marathi_report: str = Field(..., min_length=1, max_length=5000)
    actions: List[str] = Field(default_factory=list, max_items=20)
    reference: Optional[str] = Field(default=None, max_length=1000)

    @root_validator(pre=True)
    def normalize_supported_aliases(cls, values: Any) -> Any:
        if not isinstance(values, dict):
            return values

        normalized = dict(values)
        if normalized.get("severity") and normalized.get("urgency"):
            if normalized["severity"] != normalized["urgency"]:
                raise ValueError("severity and urgency aliases disagree")
        if normalized.get("recommended_department") and normalized.get("department"):
            if normalized["recommended_department"] != normalized["department"]:
                raise ValueError("department aliases disagree")
        if not normalized.get("severity") and "urgency" in normalized:
            normalized["severity"] = normalized["urgency"]
        if not normalized.get("recommended_department") and "department" in normalized:
            normalized["recommended_department"] = normalized["department"]

        # ``extra = forbid`` below gives a useful validation failure for any
        # unexpected key, but aliases are intentionally internal only.
        normalized.pop("urgency", None)
        normalized.pop("department", None)
        return normalized

    @validator("category")
    def validate_output_category(cls, value: str) -> str:
        if value not in ALLOWED_CATEGORIES:
            raise ValueError("model returned a category outside the allowed list")
        return value

    @validator("location", "reference", pre=True)
    def trim_nullable_fields(cls, value: Any) -> Any:
        return _clean_optional_text(value)

    @validator("summary", "english_report", "marathi_report", "recommended_department", pre=True)
    def trim_required_text(cls, value: Any) -> Any:
        if isinstance(value, str):
            return value.strip()
        return value

    @validator("missing_information", "actions", each_item=True, pre=True)
    def trim_list_items(cls, value: Any) -> Any:
        if isinstance(value, str):
            return value.strip()
        return value

    class Config:
        extra = "forbid"
