# Access control and RBAC

## MVP decision

The hackathon MVP does **not** require authentication or role-based access control. It is an anonymous draft-generation experience, so adding accounts would increase privacy and implementation risk without helping the core Gemma demonstration.

## Current access model

| Actor | Access |
|---|---|
| Anonymous citizen | Create and review a local draft report. |
| Browser session | Holds the current draft only while the flow is active. |
| Backend service | Calls Gemini and validates responses. It does not expose API keys. |
| Maintainer/developer | Controls source code and deployment secrets outside the repository. |

## Future roles, only if persistence is added

| Role | Allowed actions |
|---|---|
| Citizen | Create, edit, view, export, and delete their own reports. |
| Community moderator | Review anonymized community trends; no access to private contact data. |
| Administrator | Manage categories and system configuration; no default access to raw complaint content. |

## Rules for future implementation

- Deny by default.
- Enforce authorization on the backend, never only in the UI.
- Scope access to the report owner or an explicit organization role.
- Audit administrative actions without logging complaint secrets.
- Do not introduce authentication until a real persisted workflow requires it.
