# Testing strategy

## MVP checks

### Backend

- Health endpoint returns HTTP 200.
- Empty complaint input is rejected.
- Marathi, Hinglish, and English fixtures return the expected category shape.
- Invalid model JSON produces a safe error instead of an unhandled response.
- Missing location is reported in `missing_information`.

### Frontend

- A user cannot continue with an empty or very short complaint.
- The analysis loading state is visible.
- The user can review and edit before generating a report.
- Mobile layout stacks cards and keeps primary actions usable.
- No API key is included in the browser bundle.

## Manual demo test

1. Enter the Marathi pothole sample from `data/sample_complaints.json`.
2. Confirm the UI shows roads, urgency, department, and bilingual report text.
3. Enter a vague streetlight complaint.
4. Confirm the UI asks for missing area/landmark information.
5. Generate a draft report and confirm that the UI does not claim PMC submission.

## Commands

Frontend:

```bash
cd frontend
npm install
npm run build
```

Backend, after Python is installed:

```bash
cd backend
python -m pytest
```
