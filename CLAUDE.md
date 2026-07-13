# WorkJax Project Instructions

## Project Context

WorkJax is a workforce ecosystem prototype designed to connect young people in Northeast Florida with experiential learning opportunities, employers, local experiences, and peers.

The current website uses:

* Plain HTML
* Plain CSS
* Vanilla JavaScript
* Hard-coded data in `data.js`
* Vercel for hosting

The product and architecture source of truth is located in `docs/README.md` and the files linked from it.

Before making changes, read:

* `README.md`
* `docs/README.md`
* The documentation file for the feature being changed
* `docs/architecture/current-state.md`
* `docs/architecture/target-state.md`

## Status Language

Use these labels accurately:

* `LIVE`: Implemented and usable in the deployed prototype
* `DEMO ONLY`: Simulated in the browser and not shared across users
* `PROPOSED`: Recommended future functionality
* `TBD`: Requires a product, technical, legal, or governance decision

Never describe proposed or demo-only functionality as operational.

## Coding Rules

* Do not introduce React, Next.js, or another framework without an approved architecture decision.
* Preserve the existing HTML, CSS, and JavaScript structure unless a documented change requires otherwise.
* Make one logical change at a time.
* Avoid unrelated visual or functional changes.
* Do not rename or delete files without explaining why.
* Do not add dependencies unless they are necessary and documented.
* Do not deploy automatically.
* Do not push directly to `main`.
* Do not merge pull requests automatically.

## Planning Rules

Before editing files:

1. Read the relevant code and documentation.
2. Explain the current behavior.
3. List the files that will be created or modified.
4. Describe the proposed change.
5. Identify risks, data impacts, privacy impacts, and fallback behavior.
6. Wait for approval before implementing major changes.

After editing:

1. Summarize every changed file.
2. Explain how behavior changed.
3. Provide a manual testing checklist.
4. Check for JavaScript console errors.
5. Update the relevant Markdown documentation.

## Data and Architecture Rules

* Treat employers and opportunities as separate future entities.
* One employer may have multiple opportunities and multiple locations.
* Applications must remain on official employer websites.
* Every imported opportunity or event must retain its source.
* Structured dates should use ISO 8601 format.
* Expired opportunities and events should be excluded from active results.
* Automated ingestion must include validation, deduplication, and failure handling.
* Do not present an automated source as complete coverage of Jacksonville.

## Security Rules

* Never commit API keys, passwords, access tokens, or secrets.
* Never place private API keys in `app.js`, `data.js`, `index.html`, or browser-visible code.
* Store secrets in Vercel environment variables.
* Use server-side functions for third-party services that require secret keys.
* Do not expose private account information publicly.
* Do not add public profiles for minors without approved privacy and safeguarding requirements.

## Connect Jax Rules

* Connect Jax does not provide direct messaging.
* External contact links must be optional.
* Account email and public contact information must be treated separately.
* AI may assist content moderation, but it must not be the only safety control.
* Do not implement public minor profiles without explicit approval.

## Documentation Rules

Update documentation whenever a change affects:

* User behavior
* Feature purpose
* Data fields
* Architecture
* Integrations
* Privacy
* Content-management processes
* Ownership
* Deployment

The documentation and code must not contradict one another.
