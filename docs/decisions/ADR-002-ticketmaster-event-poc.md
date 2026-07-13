# ADR-002: Ticketmaster Discovery API Event Proof of Concept

- **Status:** Proposed
- **Date:** 2026-07-13
- **Decision owner:** TBD
- **Technical owner:** TBD

## Context

Experience Jax's event content is currently 100% hard-coded in `data.js` and rendered by `app.js`, with no source field, no automated ingestion, and no server-side functions anywhere in the repository (`docs/architecture/current-state.md`).

`docs/integrations/api-evaluation.md` evaluated eleven candidate external sources for Experience Jax and Find Opportunities. It found Ticketmaster's Discovery API to be the strongest single **event** candidate available today — documented Jacksonville-area filtering (`city`, `stateCode`, `dmaId`, `geoPoint`+`radius`), a free tier, structured dates, and a documented outbound `url` field — while explicitly noting it only covers ticketed commercial events, not community markets, art walks, or city-run programming, and that several of its terms (full caching/attribution language) could not be confirmed in that research session.

That document's Section 10 recommended a **local, throwaway script spike** run outside the deployed application, deliberately stopping short of any server-side integration. This ADR proposes the next, still-small step: a **server-side Vercel Function proof of concept**, run only on a Vercel Preview deployment, to validate the key-handling and response-normalization pattern that `docs/architecture/target-state.md` eventually calls for — without committing to that broader managed-backend architecture.

## Decision

Run a limited Ticketmaster Discovery API proof of concept for Experience Jax with the following scope.

The proof of concept will:

- Use the Ticketmaster Discovery API.
- Search only for upcoming events in Jacksonville, Florida.
- Use a fixed upcoming window of 30 days.
- Return no more than 20 events.
- Use a server-side Vercel Function.
- Keep the API key in a Vercel environment variable.
- Normalize the response into a WorkJax-compatible event shape.
- Retain the Ticketmaster source ID and official outbound URL for every result.
- Run first on a Vercel Preview deployment.
- Leave the current hard-coded Experience Jax records in `data.js` unchanged.
- Make no frontend changes during this endpoint-only phase.
- Be fully reversible by removing the function and this documentation.

This ADR documents the decision and scope only. It does not create the `api/` directory, request or expose an API key, deploy anything, or modify any website code. Implementation is a separate, future task.

## Out of Scope

The proof of concept will not:

- Replace current events.
- Automatically publish events to Experience Jax.
- Add a database.
- Add a scheduled job.
- Add a new framework.
- Store Ticketmaster results.
- Claim complete Jacksonville coverage.
- Integrate Visit Jacksonville, Downtown Vision, Eventbrite, SeatGeek, or opportunity sources.
- Process ticket purchases or RSVPs.

## Success Criteria

1. The endpoint returns current Jacksonville events.
2. Every result has a stable source ID.
3. Every result has a title and official outbound URL.
4. Structured event dates are returned when Ticketmaster provides them.
5. Venue and address data are normalized when available.
6. The API key never appears in browser-visible code or the JSON response.
7. Missing configuration and upstream errors return controlled JSON errors.
8. Existing WorkJax pages continue to function unchanged.
9. Three to five sample records are manually compared against the target Experience data model (`docs/data/data-model.md`).
10. Ticketmaster's attribution, caching, and current rate limits are reviewed before any frontend integration.

These criteria apply to the future implementation task and are recorded here so that task can be evaluated against this decision.

## Alternatives Considered

### Continue with the local-script-only spike (api-evaluation.md, Section 10)

**Not sufficient on its own.** A local script proves the API returns usable Jacksonville data, but it does not validate server-side key handling, error handling, or response normalization inside the actual Vercel deployment model described in `docs/architecture/target-state.md`. Retained as the appropriate first step, already completed by that document's research; this ADR is the next increment.

### Skip the proof of concept and integrate Ticketmaster directly into the live site

**Rejected.** This would violate CLAUDE.md's rule to make one logical change at a time and its Security Rules on validating server-side secret handling before depending on it, and it would risk presenting an automated, unreviewed source as live content.

### Do nothing further until the full managed backend (ADR-001) is built

**Rejected as the only path.** The managed database, authentication, and scheduled-ingestion pipeline in ADR-001 are a larger, separate decision. A small, reversible, endpoint-only Preview experiment does not require that decision to be made first and can retire cleanly if the answer is "no."

## Consequences

### Positive

- Validates the server-side secret-handling pattern (Vercel Function + environment variable) before any larger ingestion commitment.
- Produces real, current Jacksonville event data to compare against the target Experience data model.
- Fully reversible: deleting the function and this document removes all trace of the experiment.
- Does not require the ADR-001 managed-backend decision to be made first.

### Negative

- Requires a real Ticketmaster developer account and API key to be provisioned in Vercel before the endpoint can run; this ADR does not request or create that key.
- Adds a temporary, unused endpoint to the codebase between this decision and a future go/no-go decision.
- Does not resolve Ticketmaster's unconfirmed caching/attribution terms (`docs/integrations/api-evaluation.md`, Section 14) — those must still be reviewed before any frontend integration, per Success Criterion 10.

## Relationship to ADR-001

This proof of concept does not require or assume the managed PostgreSQL database, authentication service, or scheduled daily ingestion job proposed in ADR-001. It only requires a single Vercel Function and a Vercel environment variable, both available on the current static-site architecture today. A decision to proceed past this proof of concept toward automated, published Experience Jax content would still depend on the broader backend described in ADR-001 and `docs/architecture/target-state.md`.

## Open Questions

- Who provisions and owns the Ticketmaster developer account and API key?
- If the decision after this proof of concept is "no," who is responsible for removing the endpoint and this documentation?
- When will the unresolved legal/terms questions in `docs/integrations/api-evaluation.md` Section 14 (full caching and attribution terms) be re-verified with unrestricted access to Ticketmaster's documentation?
- What is the actual per-second rate limit shown in the provisioned developer account, given the conflicting figures documented in `docs/integrations/api-evaluation.md`?

## Change Log

| Date | Change | Author |
|---|---|---|
| 2026-07-13 | ADR created to document the decision to run a Ticketmaster Discovery API proof of concept for Experience Jax | Claude (documentation task) |
