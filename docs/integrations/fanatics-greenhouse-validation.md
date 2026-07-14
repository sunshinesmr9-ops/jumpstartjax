# Fanatics Greenhouse Validation

**Status:** `HOLD` — platform validated, no qualifying posting currently exists.
**Employer:** Fanatics (`data.js` `id: 41` is Dun & Bradstreet — Fanatics is `id: 19`)
**Boards reviewed:** Fanatics Corporate (`fanaticsinc`), Fanatics Collectibles (`fanaticscollectibles`)
**Related:** `docs/integrations/ats-source-audit.md` (Section 6, Section 9, Section 10, Section 11), `docs/integrations/employer-feed-registry.md`, `docs/integrations/dnb-lever-poc.md`

## Confirmed facts

- **Fanatics officially uses Greenhouse** for multiple of its business job boards, including at least Fanatics Corporate and Fanatics Collectibles — confirmed in `docs/integrations/ats-source-audit.md` via live-looking, employer-named Greenhouse-hosted URLs (`job-boards.greenhouse.io/fanaticsinc`, `job-boards.greenhouse.io/fanaticscollectibles`).
- **Greenhouse's published-job GET endpoints are public and require no API key or authentication.** This is the same access tier documented in `docs/integrations/api-evaluation.md` (Section 5.8) and is what made the existing Dun & Bradstreet Lever integration (`api/dnb-lever-jobs.js`) possible for a comparable platform.

## Environment limitation encountered during technical validation

This Claude cloud session's outbound proxy could not directly call `boards-api.greenhouse.io`. Two independent tools were tried:

- `curl` via Bash: `CONNECT tunnel failed, response 403`.
- `WebFetch`: `HTTP 403 Forbidden`, no response body.

The proxy's own failure log recorded this as a policy-level CONNECT rejection, not a response from Greenhouse:

```json
{
  "kind": "connect_rejected",
  "detail": "gateway answered 403 to CONNECT (policy denial or upstream failure)",
  "host": "boards-api.greenhouse.io:443"
}
```

**This was an environment restriction on this session's outbound network access, not evidence that the Greenhouse endpoint or either board token (`fanaticsinc`, `fanaticscollectibles`) was invalid.** No conclusion about Greenhouse's API, Fanatics' boards, or the correctness of the board tokens should be drawn from the 403 itself — it reflects only what this session's proxy would allow, not what Greenhouse's servers would have returned.

## Independent review outcome

A subsequent, independent review of Fanatics' official Greenhouse career boards (outside this session's blocked path) found:

- **Fanatics Corporate currently displayed 25 jobs.**
- **Two roles were located in Jacksonville:**
  - Sr. Accountant, Indirect Tax
  - Sr. AP Specialist, Vendor Management
- **Neither role was student, internship, apprenticeship, or early-talent relevant** — both are standard, experienced-hire finance positions, with no title, department, or content signal matching the conservative student/early-talent criteria used throughout this project (e.g., `intern`, `internship`, `co-op`, `apprentice`, `apprenticeship`, `early career`, `early talent`, `graduate program`, `university`, `campus`).
- **No qualifying Jacksonville student posting was confirmed on the currently reviewed Fanatics boards.**

## Decision: HOLD

**HOLD** means:

1. **Fanatics remains a technically compatible Greenhouse candidate.** The platform itself is confirmed, and Greenhouse's public GET access model is confirmed — nothing found here changes that assessment. If anything, this review adds confidence that the boards are real and reachable (the 25-job count and specific Jacksonville-located roles are concrete, current evidence, not a hypothetical).
2. **No endpoint or registry entry should be implemented until a real, current, Jacksonville-specific student opportunity exists** on one of Fanatics' Greenhouse boards. Building a live-feed integration today would have nothing genuine to show — the two current Jacksonville postings are ordinary experienced-hire roles, and presenting them as student opportunities would misrepresent them.
3. **The board should be checked again periodically, because postings change.** Fanatics' Greenhouse boards are live and actively updated (this review already found a different job count and content than any prior assumption in `docs/integrations/ats-source-audit.md`, which had not yet read live data). A future recheck — ideally from an environment without this session's proxy restriction — could find a qualifying posting where none exists today.

HOLD is distinct from both `PROCEED` (a qualifying posting exists now — it does not) and `STOP` (the token or endpoint is invalid — it is not; the platform and access model are both confirmed, only the current content doesn't qualify).

## What would change this to PROCEED

A future recheck of `fanaticsinc` and/or `fanaticscollectibles` finding at least one current, Jacksonville-located posting whose title, department, or content explicitly matches the conservative student/early-talent criteria above — at which point the next step would be the technical spike already scoped in `docs/integrations/ats-source-audit.md` Section 11 (field-mapping confirmation, classification-logic validation, manual cross-check against `data.js`'s curated Fanatics programs) before any registry entry or endpoint is built.

## Change Log

| Date | Change | Author |
|---|---|---|
| 2026-07-14 | Documented the Fanatics Greenhouse validation outcome: platform and access model confirmed, environment proxy restriction explained and distinguished from a Greenhouse failure, independent review found 25 Fanatics Corporate postings with 2 Jacksonville-located roles (neither student-relevant), decision set to HOLD | Claude (documentation task) |
