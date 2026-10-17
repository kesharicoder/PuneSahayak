# PuneSahayak Product Requirements Document

**Status:** Hackathon MVP  
**Version:** 0.1  
**Last updated:** 2026-10-17

## 1. Product summary

PuneSahayak is a multilingual civic reporting assistant for Pune. A citizen can describe a local issue in Marathi, Hindi, Hinglish, or English and receive a structured, editable civic report. Gemma 4, accessed through the Gemini API, is the core intelligence layer for understanding, categorization, urgency assessment, department routing, missing-information detection, and bilingual report generation.

## 2. Problem

Citizens often notice potholes, uncollected waste, broken streetlights, water problems, or drainage issues but do not know how to describe them formally or which department should receive the report. Language and formality barriers make reporting harder, while unstructured complaints are difficult to act on.

## 3. Goals

- Make civic reporting possible in natural local language.
- Produce a clear report in English and Marathi.
- Recommend a civic category, urgency, and responsible department.
- Identify missing information instead of inventing it.
- Keep the citizen in control before a report is generated or shared.
- Demonstrate a meaningful, inspectable use of Gemma 4 through the Gemini API.
- Keep the MVP open-source, privacy-aware, and easy to run locally.

## 4. Non-goals for the MVP

- Direct submission to a government system.
- Automatic legal, medical, or safety decisions.
- Required citizen accounts or identity verification.
- Guaranteed location accuracy.
- Real-time citywide issue data.
- Fully offline inference while using the Gemini API.

## 5. Target users

### Primary user

A Pune resident who wants to report a civic issue quickly using the language they are comfortable with.

### Secondary user

A community organizer or open-source contributor who wants structured, anonymized civic issue data and an easy way to improve the project.

## 6. MVP user journey

1. The user opens PuneSahayak.
2. The user chooses to write a complaint, with voice and photo affordances reserved for the next increment.
3. The user enters a complaint and optional location/category.
4. The backend sends a constrained prompt to Gemma 4 through the Gemini API.
5. The response is validated as structured data.
6. The UI shows category, urgency, location, department, summary, and missing information.
7. The user edits or confirms the information.
8. PuneSahayak generates English and Marathi report text and an exportable report.

## 7. Functional requirements

| ID | Requirement | Priority | Acceptance criterion |
|---|---|---|---|
| FR-01 | Accept a civic complaint | Must | A user can enter a complaint of at least 10 characters. |
| FR-02 | Support multilingual input | Must | Marathi, Hindi, Hinglish, and English examples can be analyzed. |
| FR-03 | Analyze with Gemma 4 | Must | The backend calls the configured Gemma model through the Gemini API. |
| FR-04 | Classify the issue | Must | Output includes one allowed civic category. |
| FR-05 | Estimate urgency | Must | Output includes low, medium, or high urgency. |
| FR-06 | Recommend department | Must | Output includes a suggested responsible department. |
| FR-07 | Detect missing information | Must | Vague complaints return a missing-information list. |
| FR-08 | Generate bilingual reports | Must | Output includes English and Marathi report text. |
| FR-09 | User review | Must | The user can review and edit before generating a report. |
| FR-10 | Privacy controls | Must | No login is required and reports are private until the user chooses to share. |
| FR-11 | Community insights | Should | The UI can display clearly labelled anonymized demo statistics. |
| FR-12 | Photo and voice input | Later | Add only after the text workflow is reliable and the model/API support is confirmed. |

## 8. Non-functional requirements

- API keys must remain server-side and never be committed.
- Model output must be validated before it is displayed as structured data.
- The UI must work on mobile and desktop widths.
- The system must show uncertainty and missing information.
- The application must not claim that a report was submitted to PMC unless a real integration exists.
- Public source code must use the Apache 2.0 license.

## 9. Success criteria for the hackathon

- A judge can submit a Marathi or Hinglish complaint in under one minute.
- The demo shows a complete Describe → Analyze → Review flow.
- The repository visibly contains the Gemma integration and model documentation.
- At least three representative complaints produce valid structured results.
- The README explains setup, privacy boundaries, and the open-source license.

## 10. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Hallucinated details | Strict prompt, missing-information field, schema validation, user review. |
| Incorrect translation | Label output as AI-generated and allow editing before sharing. |
| API outage or quota issue | Show a useful error state and keep sample demo data separate from live claims. |
| Sensitive complaint content | Minimize collection, avoid required identity fields, and provide deletion guidance. |
| Ambiguous event model name | Store the exact event-provided model ID in `.env` and README before final submission. |
