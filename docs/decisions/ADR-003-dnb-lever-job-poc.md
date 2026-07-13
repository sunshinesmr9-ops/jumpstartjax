# ADR-003: Dun & Bradstreet Lever Postings Job Proof of Concept

- **Status:** Implemented (endpoint-only proof of concept)
- **Date:** 2026-07-13
- **Decision owner:** TBD
- **Technical owner:** TBD

## Context

`docs/integrations/api-evaluation.md` evaluated the Lever Postings API as an opportunity source and found it to have the best field-level fit of any applicant-tracking-system feed reviewed — documented `commitment` (including an `Intern` value), `workplaceType`, `salaryRange`, and `applyUrl` fields map cleanly onto WorkJax's target Opportunity schema (`docs/data/data-model.md`). That document's Section 11 recommended a manual per-employer spike as the next step, but noted that no current WorkJax employer had been confirmed to run a Lever job board.

Dun & Bradstreet operates a public, unauthenticated Lever postings board at `api.lever.co/v0/postings/dnb`. This ADR documents building a small, reversible, server-side endpoint against that one fixed board to validate the request/filter/normalize pattern for a Lever-based source, independent of any decision about whether Dun & Bradstreet is added to WorkJax's employer list.

## Decision

Build a Vercel Function proof of concept scoped as follows.

The proof of concept:

- Calls only the fixed Lever endpoint `https://api.lever.co/v0/postings/dnb?mode=json`. No site name, board token, or upstream URL is accepted from a caller.
- Requires no API key or environment variable, because Lever's GET postings endpoint is public.
- Filters to postings whose location data indicates Jacksonville, Florida, and whose structured fields or title conservatively indicate a student or early-talent opportunity (Intern commitment, an Internship department/team, or Internship/Intern/Early Talent/Co-op/Apprentice/Graduate Program in the title).
- Returns no more than 20 normalized records.
- Normalizes every result into the shape documented in `docs/integrations/dnb-lever-poc.md`, prefixing the internal `id` with `lever:dnb:` and retaining Lever's own `sourceId`, `hostedUrl` (as `externalUrl`), and `applyUrl` (as `applicationUrl`).
- Returns controlled JSON on any upstream failure, with no upstream error detail exposed, an 8-second request timeout, and conservative `Cache-Control` headers.
- Makes no change to `index.html`, `styles.css`, `app.js`, or `data.js`. Nothing in the current UI calls this endpoint.
- Is fully reversible by deleting `api/dnb-lever-jobs.js`, `docs/integrations/dnb-lever-poc.md`, and this ADR.

## Out of Scope

This proof of concept does not:

- Add Dun & Bradstreet to `data.js` or any live WorkJax listing.
- Wire the endpoint into `app.js` or any page in `index.html`.
- Add a database, scheduled job, package, dependency, or environment variable.
- Process applications or store applicant information — `applicationUrl` always points to Dun & Bradstreet's own official application page.
- Infer high-school eligibility for any posting.
- Claim coverage of any Jacksonville employer other than Dun & Bradstreet.
- Resolve whether Dun & Bradstreet should become a WorkJax employer record — that remains a separate, future product decision.

## Success Criteria

1. The endpoint returns only Jacksonville, Florida postings from Dun & Bradstreet's Lever board.
2. Ordinary full-time roles that show no structural or title-based student/early-talent signal are excluded.
3. No posting's `studentLevel` is set to `"College"` unless its title or description explicitly references college, university, undergraduate, graduate, or a degree.
4. No posting infers high-school eligibility.
5. Every returned record retains its Lever `sourceId` and both an `externalUrl` and `applicationUrl` pointing to Dun & Bradstreet's own site.
6. No API key, secret, or environment variable is required or referenced anywhere in the function.
7. Upstream failures return controlled JSON with no leaked upstream detail.
8. `index.html`, `styles.css`, `app.js`, and `data.js` are unchanged, and existing WorkJax pages continue to work with no console errors.

## Alternatives Considered

### Wait for a confirmed WorkJax employer on Lever before spiking

**Rejected for this proof of concept.** Dun & Bradstreet's board is public and requires no relationship with WorkJax to read from; validating the filter/normalize pattern does not depend on first deciding whether D&B becomes a listed employer.

### Build the endpoint and immediately wire it into the Opportunities page

**Rejected.** This would conflate a small, reversible technical spike with a live content decision, contrary to `CLAUDE.md`'s rule to make one logical change at a time and to avoid presenting demo-only functionality as operational.

### Use a local throwaway script instead of a deployed endpoint

**Rejected as insufficient on its own**, consistent with ADR-002's reasoning: a local script does not validate the actual Vercel Function request/timeout/error/cache pattern that a future real integration would depend on.

## Consequences

### Positive

- Produces a working, inspectable example of the Lever-based normalization pattern against real data, without committing to adding Dun & Bradstreet as a WorkJax employer.
- Fully reversible: deleting the three files removes all trace of the experiment.
- Requires no secret, dependency, or infrastructure decision.

### Negative

- Adds an endpoint to the codebase that is currently unused by the live site until/unless a future task wires it in.
- Dun & Bradstreet's Lever board could change field shapes or disappear without notice; the function degrades to `null`/empty defaults rather than failing, but its output should be spot-checked again before any future UI integration.
- Does not resolve whether other Northeast Florida employers use Lever — this remains a manual, ongoing operator task per `docs/integrations/api-evaluation.md`.

## Relationship to ADR-001 and ADR-002

Like ADR-002's Ticketmaster proof of concept, this does not require or assume the managed PostgreSQL database, authentication service, or scheduled ingestion job proposed in ADR-001. It reuses the same endpoint-only, Preview-first, reversible pattern ADR-002 established, applied to a per-employer opportunity source instead of a citywide event source.

## Open Questions

- Should Dun & Bradstreet be added to WorkJax's employer directory at all? This ADR does not decide that.
- Who reviews and re-verifies this endpoint's output if Lever changes its posting schema?
- If the decision after review is "no further action," who is responsible for removing the endpoint and its documentation?
- Should this pattern be repeated for other Northeast Florida employers confirmed to use Lever, once identified?

## Change Log

| Date | Change | Author |
|---|---|---|
| 2026-07-13 | ADR created and endpoint-only proof of concept implemented at `api/dnb-lever-jobs.js` | Claude (implementation task) |
