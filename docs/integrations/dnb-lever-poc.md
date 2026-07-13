# Dun & Bradstreet Lever Postings Proof of Concept

**Status:** `LIVE`, scoped to a single employer's detail page. The endpoint is called from `app.js` only when the existing Dun & Bradstreet employer detail page (`data.js` `id: 41`) is opened — no other employer's page calls it, and no new employer card or record was added. See "UI integration" below.
**Endpoint:** `api/dnb-lever-jobs.js`
**Related decision:** `docs/decisions/ADR-003-dnb-lever-job-poc.md`
**Related research:** `docs/integrations/api-evaluation.md` (Section 5.9, Section 11)

## Why Dun & Bradstreet

`docs/integrations/api-evaluation.md` identified the Lever Postings API as the opportunity source with the best field-level fit for WorkJax's target data model (`commitment`, `workplaceType`, `salaryRange`, `applyUrl`). **Dun & Bradstreet already exists in WorkJax's curated employer dataset** — `data.js` record `id: 41` — with a hand-written description of its Jacksonville summer internship program. Dun & Bradstreet also operates a public, unauthenticated Lever postings board (`api.lever.co/v0/postings/dnb`), which made it a real, live source suitable for a small read-only proof of concept for an employer WorkJax already lists. This proof of concept validates the request/filter/normalize pattern only — it does not create or modify the existing `data.js` employer record, and its output is not merged into that record or any live listing.

## Fixed source

The endpoint always requests exactly one URL:

```
https://api.lever.co/v0/postings/dnb?mode=json
```

This is hard-coded in `api/dnb-lever-jobs.js`. The function does not accept a Lever site name, board token, or upstream URL from the caller in any form (query string, header, or body) — there is nothing in the request that changes which site or URL is fetched.

## Endpoint

`GET /api/dnb-lever-jobs`

No parameters. No authentication. No API key or environment variable is used — Dun & Bradstreet's Lever postings are public, unauthenticated GET data.

### Response shape

```json
{
  "source": "lever:dnb",
  "employer": "Dun & Bradstreet",
  "generatedAt": "2026-07-13T00:00:00.000Z",
  "count": 0,
  "jobs": []
}
```

On an upstream failure, the same shape is returned with `count: 0`, `jobs: []`, an added `error` string, and HTTP status `502`. No upstream response body, status text, or headers are passed through.

## Filtering scope

A Dun & Bradstreet posting is included only if it passes **all** of the following:

1. **Jacksonville, Florida match** — `categories.location` or any entry in `categories.allLocations` case-insensitively contains `"jacksonville"` together with `"florida"` or `"fl"`.
2. **Student/early-talent relevance** — at least one of:
   - `categories.commitment` **starts with** `"intern"` (case-insensitive), so `"Intern"`, `"Intern: Full Time"`, and `"Intern: Part Time"` all match — the check is a prefix match, not an exact-equality match, or
   - `categories.department` or `categories.team` contains `"internship"`, or
   - the title contains, as a whole word or phrase, `Internship`, `Intern`, `Early Talent`, `Co-op`/`Coop`, `Apprentice`/`Apprenticeship`, or `Graduate Program`. Word-boundary matching is used so `"international"` never matches on `"intern"`.

Ordinary full-time Dun & Bradstreet roles in Jacksonville that do not hit any of the above signals are excluded — they are not classified as student opportunities. The result set is capped at 20 records.

## Open opportunity vs. talent network

Not every Dun & Bradstreet posting that passes the filters above is an actual open job. Lever also hosts "talent network" postings — recruitment-interest signups, not specific job openings. Each normalized record carries a `postingKind` field:

- `"open_opportunity"` — a specific job or internship posting.
- `"talent_network"` — a recruitment-interest network, not a confirmed open position.

A posting is classified `"talent_network"` when either:

- its title contains the phrase `"Early Talent Network"`, or
- its description explicitly states the posting is not an open job opportunity/position/role (e.g. "This is not an open job opportunity...").

For a `"talent_network"` record, `opportunityType` is always forced to `"Early Talent"` and `status` is set to `"active_network"` (instead of `"active"`), specifically so it is never described as a currently open internship. Its `externalUrl`/`applicationUrl` are still populated from Lever's own `hostedUrl`/`applyUrl`, since joining the network is still a legitimate, official action a student can take.

**As of this proof of concept, the Dun & Bradstreet feed's qualifying Jacksonville record is an Early Talent Network posting, not a confirmed open internship.** Any future caller of this endpoint must treat `postingKind: "talent_network"` results as a recruitment-interest signup, not an available position, and must not present them as a current job opening.

## Normalized job shape

Every returned posting is normalized into:

| Field | Source |
|---|---|
| `id` | `"lever:dnb:" + posting.id` |
| `sourceId` | Lever's own posting `id` |
| `sourceName` | `"Lever"` |
| `sourceEmployer` | `"Dun & Bradstreet"` |
| `title` | Lever `text` |
| `description` | Lever `content.description` (raw HTML, unmodified) |
| `descriptionPlain` | The same description with HTML tags mechanically stripped |
| `postingKind` | `"open_opportunity"` or `"talent_network"` — see Open opportunity vs. talent network above |
| `opportunityType` | `"Internship"`, `"Apprenticeship"`, or `"Early Talent"` — see Classification below |
| `studentLevel` | `"College"` or `"Unspecified"` — see Classification below |
| `employerName` | `"Dun & Bradstreet"` |
| `location` | Lever `categories.location` |
| `allLocations` | Lever `categories.allLocations` |
| `city` / `stateCode` | Parsed from `location` only when it cleanly matches `"City, ST"`; otherwise `null` |
| `countryCode` | Lever `country` |
| `workplaceType` | Lever `workplaceType` |
| `commitment` | Lever `categories.commitment` |
| `team` | Lever `categories.team` |
| `department` | Lever `categories.department` |
| `salaryRange` | Lever `salaryRange` object, or `null` if absent |
| `externalUrl` | Lever `hostedUrl` |
| `applicationUrl` | Lever `applyUrl` |
| `sourceLastSeenAt` / `lastVerifiedAt` | The server's request timestamp (ISO 8601), both set identically |
| `dateVerificationStatus` | `"verified"` — the live fetch is the verification |
| `status` | `"active"` for an open opportunity, `"active_network"` for a talent-network posting |

## Classification limitations

- **postingKind** is conservative: only an explicit `"Early Talent Network"` title phrase or explicit "not an open job opportunity/position/role" description language triggers `"talent_network"`. Anything else that passes the relevance filter is treated as `"open_opportunity"`.
- **opportunityType** is conservative: for a talent-network posting it is always `"Early Talent"`. For an open opportunity, `"Internship"` requires a structural signal (`commitment` starting with `"intern"`, `department`/`team`, or title) or an explicit title match; `"Apprenticeship"` requires an explicit structural or title match; everything else that passed the relevance filter falls back to `"Early Talent"`. Nothing is inferred beyond these fields.
- **studentLevel** is `"College"` only when the title or description text explicitly contains `college`, `university`, `undergraduate`, `graduate`, or `degree`. It is otherwise `"Unspecified"`. **High-school eligibility is never inferred** — this endpoint has no mechanism to determine or claim high-school eligibility.
- No compensation amount, application deadline, or age/eligibility requirement is invented. `salaryRange` is passed through only if Lever provides it; otherwise it is `null`.

## Error and cache behavior

- Upstream timeout (8 seconds), network failure, non-2xx status, or a non-JSON/non-array response body all return the controlled error JSON described above with HTTP `502`. No upstream error detail is exposed.
- Zero qualifying Jacksonville student postings is not an error — it returns HTTP `200` with `jobs: []`.
- Responses include `Cache-Control: public, max-age=0, s-maxage=300, stale-while-revalidate=60` — a conservative 5-minute CDN cache.
- Because nothing in `app.js` or `index.html` calls this endpoint, a failure here has no effect on any existing WorkJax page.

## Manual testing checklist

1. Deploy to a Vercel Preview and request `GET /api/dnb-lever-jobs`; confirm a `200` response with the documented top-level shape.
2. Confirm every returned job's `id` starts with `lever:dnb:` and has a non-empty `externalUrl` and `applicationUrl`.
3. Independently fetch `https://api.lever.co/v0/postings/dnb?mode=json` and manually cross-check 3–5 returned jobs' `location`/`allLocations` to confirm Jacksonville filtering has no false positives or negatives.
4. Identify at least one ordinary full-time Dun & Bradstreet Jacksonville posting in the raw feed and confirm it does **not** appear in the endpoint's output.
5. Confirm no job in the response has `studentLevel: "College"` unless its title or description text actually contains one of the listed college-reference words.
6. Confirm a posting with `categories.commitment` of `"Intern: Full Time"` or `"Intern: Part Time"` is still recognized and included (prefix match, not exact match).
7. Confirm any Early Talent Network posting returns `postingKind: "talent_network"`, `opportunityType: "Early Talent"`, and `status: "active_network"` — and is not labeled as a currently open internship.
8. Confirm the response has no `error` field and the correct `Cache-Control` header on a normal run.
9. Load the existing WorkJax homepage and Opportunities page and confirm no console errors or behavior change — this endpoint is not called from anywhere in the current UI.

## UI integration

The endpoint is now connected to exactly one place in the WorkJax interface: the existing Dun & Bradstreet employer detail page (`data.js` `id: 41`, unmodified). Opening that detail page (`showDetail(41)` in `app.js`) renders a new **"Current opportunities from Dun & Bradstreet"** section beneath the curated program details and calls `GET /api/dnb-lever-jobs` at that moment — not before, and not for any other employer.

- **Separation by `postingKind`:** `open_opportunity` results render as current opportunities with an "Apply Officially" link; `talent_network` results render in a distinct, clearly labeled "Talent Network" group with explicit text that joining is not a currently open job, and a "Join Talent Network" link instead.
- **Fields shown:** title, opportunity type, location, workplace type, commitment, salary (only when `salaryRange` is present), last verified date, and the official external `applicationUrl` — nothing is displayed for a field the response doesn't provide.
- **Loading / empty / error states:** a loading message appears immediately; an empty result set says no current matching opportunities were found (the curated "Apply Directly at Dun & Bradstreet" careers link stays visible regardless); any upstream failure replaces only this section with a small "temporarily unavailable" message, leaving the rest of the curated detail page (hero, requirements, programs, sidebar) fully visible and unaffected.
- **Caching:** a successful response is cached in memory for the rest of the browser page session, so reopening the detail page does not repeat the network call. A failed request is not cached and will retry on the next open.
- **No duplicate employer card:** this only augments the existing detail page's content; no new record was added to the `employers` array and no additional Dun & Bradstreet card appears in the directory, search, home page, or map.
- Full behavior, visual components, and rationale are documented in `docs/features/opportunities.md` under "Dun & Bradstreet Live Opportunities Section."

## What this proof of concept is not

- It is **not** a citywide job aggregator. It reflects only Dun & Bradstreet's own Lever board, one employer among many in Jacksonville.
- It does **not** modify Dun & Bradstreet's existing employer record (`data.js`, `id: 41`) or any other live listing. `data.js` remains the site's only live data source, and this endpoint's output is not merged into it.
- It does **not** appear anywhere else in the user interface — only the Dun & Bradstreet detail page calls it; every other employer's detail page, the directory, search, home page, and map are unchanged.
- It does **not** process applications or store applicant information — every `applicationUrl` sends the user to Dun & Bradstreet's own official application page.
- A `talent_network` result is **not** presented as a confirmed open internship anywhere in the UI — see "Open opportunity vs. talent network" above and "UI integration" below.

## Change Log

| Date | Change | Author |
|---|---|---|
| 2026-07-13 | Documented the Dun & Bradstreet Lever Postings API endpoint-only proof of concept | Claude (implementation task) |
| 2026-07-13 | Corrected the claim that Dun & Bradstreet's presence in WorkJax's employer dataset was undecided (it already exists as `data.js` `id: 41`); added the `postingKind` field distinguishing an open opportunity from a talent-network posting, the `commitment` prefix-match behavior for `"Intern: Full Time"`/`"Intern: Part Time"`, and explicit documentation that the current Jacksonville result is a talent network, not a confirmed open internship | Claude (implementation task) |
| 2026-07-13 | Connected the endpoint to the existing Dun & Bradstreet detail page only (`app.js`), added the "Current opportunities from Dun & Bradstreet" section with open-opportunity/talent-network separation, loading/empty/error states, and page-session caching; updated status from `DEMO ONLY` to `LIVE` (scoped to this one employer's detail page) | Claude (implementation task) |
