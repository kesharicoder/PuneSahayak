"""Environment-backed configuration for the backend.

Secrets are deliberately kept out of module constants and application responses.
The Gemini credential is read only when the service creates its server-side
client.
"""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from functools import lru_cache
from typing import Optional

from dotenv import load_dotenv


DEFAULT_GEMMA_MODEL = "gemma-4-26b-a4b-it"
DEFAULT_THINKING_LEVEL = "high"
DEFAULT_THINKING_BUDGET = 0


def _thinking_budget_from_environment() -> Optional[int]:
    raw_budget = os.getenv("GEMMA_THINKING_BUDGET")
    if raw_budget is None or not raw_budget.strip():
        return DEFAULT_THINKING_BUDGET

    try:
        budget = int(raw_budget)
    except ValueError:
        return DEFAULT_THINKING_BUDGET

    return budget if budget >= 0 else DEFAULT_THINKING_BUDGET


def _thinking_level_from_environment() -> Optional[str]:
    raw_level = os.getenv("GEMMA_THINKING_LEVEL")
    if raw_level is None or not raw_level.strip():
        return DEFAULT_THINKING_LEVEL

    level = raw_level.strip().lower()
    return level if level in {"low", "medium", "high"} else DEFAULT_THINKING_LEVEL


@dataclass(frozen=True)
class Settings:
    """Runtime settings loaded from the process environment.

    ``repr=False`` prevents an accidental settings repr from exposing the API
    key in a traceback or debug message.
    """

    gemini_api_key: Optional[str] = field(default=None, repr=False)
    gemma_model: str = DEFAULT_GEMMA_MODEL
    thinking_level: Optional[str] = DEFAULT_THINKING_LEVEL
    thinking_budget: Optional[int] = DEFAULT_THINKING_BUDGET

    @classmethod
    def from_environment(cls) -> "Settings":
        # Environment variables already set by the process take precedence.
        # Loading .env is local-development support and never writes a secret.
        load_dotenv(override=False)
        # Both names are supported because the provider is Gemma through the
        # Gemini API. GEMMA_API_KEY takes precedence when both are present.
        api_key = os.getenv("GEMMA_API_KEY") or os.getenv("GEMINI_API_KEY")
        model = (os.getenv("GEMMA_MODEL") or DEFAULT_GEMMA_MODEL).strip()
        return cls(
            gemini_api_key=api_key.strip() if api_key and api_key.strip() else None,
            gemma_model=model or DEFAULT_GEMMA_MODEL,
            thinking_level=_thinking_level_from_environment(),
            thinking_budget=_thinking_budget_from_environment(),
        )


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return process settings, cached so client configuration is stable."""

    return Settings.from_environment()
