# Privacy and data handling

## MVP promise

PuneSahayak is private by default. A user can generate a draft civic report without creating an account or providing a name, phone number, or email address.

## Data flow

1. The browser sends the complaint and optional location/category to the PuneSahayak backend.
2. The backend sends the required complaint context to the Gemini API for Gemma analysis.
3. The backend validates the structured result and returns it to the browser.
4. The user reviews the result before copying, exporting, or sharing it.

The MVP should not persist complaint content unless the product explicitly adds a documented storage feature.

## User controls

- Make contact details optional.
- Let the user edit generated text before sharing.
- Do not claim government submission without a real integration.
- Provide a clear way to discard the draft.
- Label community insights as demo/anonymized data until a verified source exists.

## Sensitive data

Users should not enter Aadhaar numbers, financial information, passwords, or medical records. The UI should show a short reminder near the complaint form.

If photo and voice input are added, document their retention, processing provider, and deletion behavior before release.
