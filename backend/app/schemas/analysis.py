"""Request and response validation for civic complaint analysis."""

from __future__ import annotations

from typing import Any, List, Optional

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


class AnalysisRequest(BaseModel):
    """Input accepted by ``POST /api/analyze``."""

    text: str = Field(..., min_length=10, max_length=5000)
    location: Optional[str] = Field(default=None, max_length=300)
    category: Optional[str] = Field(default=None, max_length=80)
    language: Optional[str] = Field(default="auto", max_length=50)

    @validator("text", pre=True)
    def validate_text(cls, value: Any) -> str:
        if not isinstance(value, str):
            raise ValueError("text must be a string")
        cleaned = value.strip()
        if len(cleaned) < 10:
            raise ValueError("text must contain at least 10 characters")
        return cleaned

    @validator("location", "category", "language", pre=True)
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
