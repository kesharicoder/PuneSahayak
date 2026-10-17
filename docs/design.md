# Design specification

## Visual direction

PuneSahayak uses a **Civic Minimal** visual language inspired by the supplied reference: warm ivory surfaces, forest green actions, mint and soft-yellow accents, generous spacing, rounded cards, and friendly but trustworthy typography.

The product should feel like a modern civic-tech service rather than a traditional government portal.

## Design principles

1. **Local-language first** — users should see Marathi, Hindi, Hinglish, and English examples before they need to change settings.
2. **One clear action** — every screen should have one obvious next step.
3. **Trust through explanation** — label AI-generated fields and show missing information.
4. **Review before sharing** — never imply that a complaint was submitted automatically.
5. **Private by default** — do not require an account or unnecessary personal details.
6. **Accessible contrast** — severity colors must be accompanied by text and icons.

## Screens

### Home

- Brand and privacy message.
- Hero: “Report a civic issue in your language.”
- Primary action: “Report an issue”.
- Secondary action: “See community insights”.
- Describe → Analyze → Review explanation.

### Describe

- Complaint text area.
- Upload-from-device and take-photo actions with preview/remove controls.
- Optional location and category.
- Marathi/Hinglish examples.
- Voice input can remain a clearly labelled future affordance until implemented.

### Analyze

- Gemma analysis status.
- Issue summary.
- Category, urgency, route-to department, and location cards.
- Suggested next steps.
- One follow-up question at a time when Gemma reports a missing critical detail.
- Explicit loading and failure states.

### Review and generate

- English and Marathi report previews.
- Attached image preview when the report includes image evidence.
- Missing-information warning.
- Edit action.
- Generate/download PDF action.
- Reference number only means a local report was generated, not that it was submitted to PMC.

All non-home screens include a visible back action so the user can correct the
complaint or return to the previous step without losing control of the flow.

### Community insights

- Anonymized sample statistics.
- Clear “demo data” label until a verified data source exists.
- No personally identifiable complaint details.

## Component conventions

- Use rounded cards with subtle borders instead of heavy shadows.
- Use green for primary actions and text labels for status.
- Use amber for medium urgency and red for high urgency, never color alone.
- Use responsive stacked cards below 800px.
- Keep buttons action-oriented: “Create my report”, “Review report”, and “Make edits”.
