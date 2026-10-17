import json
from types import SimpleNamespace

from fastapi.testclient import TestClient

from app.config import DEFAULT_GEMMA_MODEL, Settings
from app.main import app
from app.routes import analyze as analyze_route
from app.schemas.analysis import AnalysisRequest
from app.services.gemma import (
    GemmaService,
    InvalidModelResponseError,
    MissingCredentialsError,
)


client = TestClient(app)


def _model_payload() -> dict:
    return {
        "category": "Roads",
        "severity": "high",
        "language": "English",
        "summary": "A large pothole is blocking part of the road.",
        "location": "Baner, Pune",
        "recommended_department": "Roads Department",
        "missing_information": ["Nearest landmark"],
        "english_report": "Please inspect and repair the pothole near Baner, Pune.",
        "marathi_report": "बाणेर, पुणे येथील खड्ड्याची पाहणी करून दुरुस्ती करावी.",
        "actions": ["Add a nearby landmark before sharing"],
        "reference": None,
    }


def _mock_client(payload: object) -> SimpleNamespace:
    response = SimpleNamespace(text=json.dumps(payload))
    calls = []

    def generate_content(**kwargs):
        calls.append(kwargs)
        return response

    return SimpleNamespace(models=SimpleNamespace(generate_content=generate_content), calls=calls)


def test_analyze_route_returns_validated_model_result(monkeypatch) -> None:
    fake_client = _mock_client(_model_payload())
    service = GemmaService(
        settings=Settings(gemini_api_key=None, gemma_model="test-model"),
        client=fake_client,
    )
    monkeypatch.setattr(analyze_route, "get_analysis_service", lambda: service)

    response = client.post(
        "/api/analyze",
        json={
            "text": "There is a large pothole near the Baner bus stop.",
            "location": "Baner, Pune",
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert body["category"] == "Roads"
    assert body["recommended_department"] == "Roads Department"
    assert body["missing_information"] == ["Nearest landmark"]
    assert fake_client.calls[0]["model"] == "test-model"
    assert "GEMINI_API_KEY" not in fake_client.calls[0]["contents"]


def test_urgency_and_department_aliases_are_normalized() -> None:
    fake_client = _mock_client(
        {
            **_model_payload(),
            "severity": None,
            "urgency": "medium",
            "recommended_department": None,
            "department": "Solid Waste Management",
            "category": "Waste Management",
        }
    )
    service = GemmaService(client=fake_client)
    result = service.analyze(
        AnalysisRequest(text="Garbage has not been collected for four days.")
    )

    assert result.severity == "medium"
    assert result.recommended_department == "Solid Waste Management"


def test_invalid_model_json_is_safe(monkeypatch) -> None:
    service = GemmaService(client=_mock_client("not-json"))
    monkeypatch.setattr(analyze_route, "get_analysis_service", lambda: service)

    response = client.post(
        "/api/analyze",
        json={"text": "The streetlight has been broken for a week."},
    )

    assert response.status_code == 502
    assert response.json() == {"detail": "Analysis service returned an invalid response."}

    # Keep a direct assertion that the service, rather than the HTTP layer,
    # owns invalid JSON detection.
    try:
        service.analyze(AnalysisRequest(text="The streetlight has been broken for a week."))
    except InvalidModelResponseError:
        pass
    else:
        raise AssertionError("invalid model JSON should fail validation")


def test_missing_credentials_are_rejected_before_provider_call() -> None:
    service = GemmaService(settings=Settings(gemini_api_key=None))

    try:
        service.analyze(AnalysisRequest(text="The streetlight has been broken for a week."))
    except MissingCredentialsError:
        pass
    else:
        raise AssertionError("missing credentials should fail safely")


def test_missing_credentials_return_safe_http_error(monkeypatch) -> None:
    service = GemmaService(settings=Settings(gemini_api_key=None))
    monkeypatch.setattr(analyze_route, "get_analysis_service", lambda: service)

    response = client.post(
        "/api/analyze",
        json={"text": "The streetlight has been broken for a week."},
    )

    assert response.status_code == 503
    assert response.json() == {"detail": "Analysis service is not configured."}


def test_short_text_and_invalid_category_are_rejected() -> None:
    short_response = client.post("/api/analyze", json={"text": "too short"})
    invalid_category_response = client.post(
        "/api/analyze",
        json={
            "text": "There is a persistent civic issue near my home.",
            "category": "Not a civic category",
        },
    )

    assert short_response.status_code == 422
    assert invalid_category_response.status_code == 422


def test_default_model_is_the_required_gemma_model() -> None:
    assert Settings(gemini_api_key=None).gemma_model == DEFAULT_GEMMA_MODEL


def test_model_can_be_overridden_by_environment(monkeypatch) -> None:
    monkeypatch.setenv("GEMMA_MODEL", "gemma-test-override")

    settings = Settings.from_environment()

    assert settings.gemma_model == "gemma-test-override"
