# Miller Electric Official Internship-Program Page

**Status:** `LIVE`, one registry entry enabled (Miller Electric Company, `employerId: 13`).
**Endpoint:** `api/miller-internship-program.js` → `GET /api/miller-internship-program`
**Registry entry:** `live-opportunity-sources.js`
**Related:** `docs/integrations/employer-feed-registry.md`, `docs/integrations/dnb-lever-poc.md`, `docs/operations/employer-feed-monitoring.md`, `docs/features/opportunities.md`

## 1. Why an official-program-page source instead of an iCIMS job feed

Dun & Bradstreet's live feed (`api/dnb-lever-jobs.js`) works because Lever exposes a structured, public JSON postings API — there is a stable schema to parse and individual job requisitions to normalize.

Miller Electric has no equivalent structured API this project integrates with. Miller's own internship-program page (`https://mecojax.com/join-the-team/internships`) links out to a public EMCOR iCIMS *job-search results* page, but that page is unauthenticated HTML with no stable schema, and it lists job requisitions generally — not an internship-program summary. Treating that iCIMS search page as if it were a structured jobs API would misrepresent both its reliability and its content.

Instead, this integration reads Miller's own official internship-program page directly and returns **one normalized program record** describing the internship *program* (status, eligibility, paid-ness, listed areas, official links) — never individual job requisitions, and never anything sourced from `api.icims.com` (the authenticated iCIMS API, which this project does not use and has no credentials for).

## 2. The server-controlled source

`api/miller-internship-program.js` fetches exactly one fixed URL, `https://mecojax.com/join-the-team/internships`, and never accepts a caller-supplied site name or URL. On every request it:

1. Fetches with an 8-second timeout (`AbortController`), following ordinary HTTPS redirects.
2. Reads the response body through a capped, streamed reader (3,000,000-byte hard limit) — never an unbounded read.
3. Confirms the *final* URL's hostname (after any redirects) is `mecojax.com`, `www.mecojax.com`, or a `mecojax.com` subdomain. Anything else is treated as a fetch failure and no parsing is attempted.
4. Reads only the returned public HTML. It never reaches a login page, an applicant account, a candidate-profile page, or an application-submission endpoint, and it never submits a form.
5. Never requires an API key, cookie, login, or environment variable.

If the fetch fails, times out, returns a non-2xx status, redirects off the approved hostname, or the page content doesn't structurally resemble a readable internship page (for example, a bot-challenge/CAPTCHA interstitial, or a response too short to plausibly be the real page), the endpoint returns a **controlled non-200 JSON error** (`{source, employer, generatedAt, count: 0, jobs: [], error}`, HTTP 502) — the same envelope shape `api/dnb-lever-jobs.js` uses on failure. It never returns stale or fabricated program data in place of a real parse.

## 3. Status-detection rules

Allowed values: `open`, `closed`, `unknown`. Detection is deliberately conservative and fails toward `unknown` rather than guessing:

- The page's HTML is reduced to plain text (scripts, styles, comments, and tags stripped; entities decoded) and split into sentences.
- Only sentences that mention "intern"/"internship" are considered.
- **`open`** requires an explicit, present-tense statement that applications are open right now (e.g. "Applications … are now open," "currently accepting applications") — and the sentence must *not* also contain recurring/future-tense language ("typically," "usually," "each spring," "will open"). A sentence like "Applications typically open in Spring" is explicitly excluded from counting as evidence, even though it contains the word "open."
- **`closed`** requires an equivalent explicit, present-tense "applications are closed" / "not currently accepting applications" statement, again excluding recurring/future-tense phrasing.
- If both open and closed evidence are found (conflicting signals), or neither is found, or the wording is otherwise ambiguous, the result is **`unknown`**.
- The matched sentence (or, for a conflict, both matched sentences) is captured verbatim, trimmed and capped to roughly 220 characters, in `statusEvidence` — enough for a human reviewer to check the classification against the source text without carrying an entire page excerpt.
- `programStatus: "unknown"` is a **successful** parse (HTTP 200), not an error — it means the page was read but current-status wording wasn't reliably present. It is never rendered as "open," and an endpoint failure is never rendered as "closed" (see §6).
- The existence of an "Apply" link is never, by itself, treated as evidence that the program is open.

## 4. Internship-area extraction

- The parser looks for a heading (`<h1>`–`<h4>`) whose text matches "Internship Opportunities" or "Internship Areas," then reads list items (`<li>`) beneath it, up to the next heading.
- Each candidate is stripped of markup, entity-decoded (so `&amp;` becomes `&`, matching area names like "Virtual Design & Construction"), and trimmed.
- Candidates are rejected if they're implausibly long (>60 characters), read like prose (contain sentence-ending punctuation followed by more text), or exceed 8 words — these are treated as signs the parser latched onto the wrong section rather than a short area-name list.
- Results are deduplicated case-insensitively and capped at 40 entries.
- If the heading can't be found, or nothing plausible survives the filters, `programAreas` is returned as an **empty array** — never a guessed or hardcoded list. The specific area names mentioned in this project's implementation task (Construction Management, Virtual Design & Construction, Accounting, Information Technology, Electrical Construction, Estimating, Business Compliance, Learning & Development, Building Information Management, Engineering, Human Resources, Marketing) informed testing expectations only; the parser does not hardcode or assume that list.

## 5. Approved application links

- `externalUrl` is always the fixed Miller internship page.
- `applicationUrl` is only populated from an anchor whose visible text or attributes reference "Apply," resolved to an absolute URL, and only when that URL's hostname is exactly `mecojax.com`/`www.mecojax.com` (or a subdomain) or exactly `careers-emcorgroup.icims.com` — the specific EMCOR careers tenant Miller's own page links to. No other `icims.com` host, and no unverified redirect, tracking link, or login URL, is ever accepted.
- When no anchor resolves to an approved hostname, `applicationUrl` falls back to the official Miller internship page itself, per the task's "use the official page as the public action URL" rule — it is never left pointing at an unapproved destination.

## 6. Error and unknown-status behavior

| Situation | HTTP status | `programStatus` | Notes |
|---|---|---|---|
| Page fetched and parsed; explicit "open" evidence found | 200 | `open` | `statusEvidence` set |
| Page fetched and parsed; explicit "closed" evidence found | 200 | `closed` | `statusEvidence` set |
| Page fetched and parsed; wording absent, conflicting, or stale | 200 | `unknown` | `statusEvidence` set only for a conflict; otherwise `null` |
| Network error, timeout, non-2xx, off-allowlist redirect, or unreadable page | 502 | — (`jobs: []`) | Frontend shows "temporarily unavailable," never "closed" |

An endpoint failure is never described to users as the program being closed, and an `unknown` status is never rendered as open. See `docs/features/opportunities.md` for the exact frontend copy.

## 7. Separation from weekly iCIMS monitoring

This endpoint and the weekly iCIMS monitor (`monitoring/employer-feed-watch.json`'s `miller-electric-icims` entry, run by `scripts/check-employer-feeds.mjs`) are independent systems that share no code, no state, and no failure dependency:

- The **weekly monitor** attempts to identify job-level records on EMCOR's public iCIMS job-search results page (`careers-emcorgroup.icims.com/jobs/search?...`) and only ever writes to a GitHub issue ("Employer Feed Watch Report"). It never touches the WorkJax website.
- **This endpoint** reads Miller's own internship-*program* page (`mecojax.com`) and only ever feeds the WorkJax UI, as one program-level record — never individual job listings.
- Neither system uses the authenticated iCIMS customer/integration API (`api.icims.com`).
- One system failing (for example, the weekly monitor reporting a `parser_warning` on the iCIMS results page) has no bearing on this endpoint's status, and vice versa. They are documented separately and must not be conflated as "the iCIMS integration."
- This task did not modify `monitoring/employer-feed-watch.json`, `scripts/check-employer-feeds.mjs`, or `.github/workflows/employer-feed-watch.yml`; the weekly monitor continues to run exactly as before.

## 8. Limitations of webpage-based verification

- Public marketing-page HTML has no stable schema and can change layout, wording, or structure without notice — unlike Lever's or Greenhouse's structured JSON. A future redesign of Miller's page could cause status detection or area extraction to silently degrade toward `unknown`/`[]` rather than failing loudly.
- Sentence-level regex matching is a heuristic. It is deliberately biased toward under-claiming (`unknown` over a wrong guess), but a genuinely unusual sentence structure could still be missed.
- `dateVerificationStatus` on the returned record is always `"unverified"` — this is an intentional, permanent signal (not a placeholder pending a future update) that webpage-text parsing is inherently less certain than a structured feed, distinct from D&B's Lever integration where `dateVerificationStatus` is `"verified"`.
- This integration was implemented without the ability to fetch the live page from the development sandbox (outbound network access to `mecojax.com` was blocked by the sandbox's network policy); parsing logic was validated against synthetic HTML fixtures modeled on the page's documented content, not the live page itself. A manual verification pass against the live page is recommended after deployment (see "Human-review requirements" below).

## 9. Human-review requirements

- Before or shortly after this goes live, a human should open `https://mecojax.com/join-the-team/internships` directly and compare it against the endpoint's actual JSON response — particularly `programStatus`, `statusEvidence`, and `programAreas` — to confirm the heuristics are reading the real page correctly.
- Because `programStatus` directly affects whether students are told applications are open, a `programStatus: "open"` result is worth an occasional spot-check against the live page, especially soon after Miller is known to have updated it (e.g., at the start or end of an application cycle).
- If Miller redesigns the page and `programAreas` unexpectedly drops to `[]` or `programStatus` unexpectedly drops to `unknown` for an extended period, that is a signal the parser needs updating — not evidence that the program itself changed.
- As with the D&B integration, this is a prototype-stage source with no formal ownership; see `docs/README.md`'s Documentation Ownership table.

## 10. Reusing this pattern for another official employer program page

`api/miller-internship-program.js` is written around Miller-specific constants (the fixed source URL, the approved hostnames, the extraction regexes) rather than as a generic, registry-driven adapter — unlike the monitoring script's `icims_public_portal` provider, which is generic. Reusing this pattern for a different employer's official program page later would mean:

1. Writing a **new, dedicated endpoint** (its own file under `api/`) with that employer's fixed page URL, approved hostname(s), and its own status/area-extraction rules tuned to that page's actual wording and structure — regexes tuned for Miller's phrasing will not necessarily fit another employer's page.
2. Adding a **new registry entry** to `live-opportunity-sources.js` with `provider: "official_program_page"`, that employer's stable `employerId`, the new `endpoint` path, an appropriate `sourceLabel`/`sectionTitle`, and `enabled: true` only after validation.
3. Confirming the **existing generic frontend** in `app.js` (the `postingKind: "official_program"` handling added for Miller) needs no changes — it already reads `programStatus`, `statusEvidence` (API-only; not currently rendered), `programAreas`, `paid`, `studentLevel`, and the approved-link rules generically, regardless of which employer the record describes.
4. Writing a **separate integration doc**, following this file's structure, and updating `docs/integrations/employer-feed-registry.md` and `docs/features/opportunities.md` the same way this change did.
5. A **human manually verifying** the new page's actual wording against whatever status/area regexes are written, the same "Human-review requirements" step called out above.

## Change Log

| Date | Change | Author |
|---|---|---|
| 2026-07-14 | Created `api/miller-internship-program.js` and this document; added Miller Electric Company (`employerId: 13`) as the second `live-opportunity-sources.js` entry, using a new `provider: "official_program_page"` and `postingKind: "official_program"`. Extended the generic `liveOpportunity*` frontend in `app.js` to render program status, an accessible internship-areas `<details>` section, and the correct action-button wording — with no Miller-specific rendering functions. Dun & Bradstreet's entry, endpoint, and behavior are unchanged. The weekly iCIMS monitor (`monitoring/employer-feed-watch.json`, `scripts/check-employer-feeds.mjs`) was not modified. | Claude (implementation task) |
