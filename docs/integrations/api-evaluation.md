# API Evaluation: External Sources for Opportunities and Experience Jax

**Status:** `PROPOSED` planning and research document — no integration exists today, no code was changed, and no source in this document is `LIVE`.
**Scope:** Evaluates candidate external data sources for two `data.js`-backed features: Find Opportunities (`docs/features/opportunities.md`) and Experience Jax (`docs/features/experience-jax.md`).
**Research date:** 2026-07-13
**Author:** Claude (documentation task)

## Research method and a caveat on verification depth

Per the task instructions, only official API documentation, official government sites, official organization/source sites, and official GitHub repositories maintained by the provider were used. No blogs, tutorials, forum posts, or unofficial API summaries were consulted.

Within this session, direct page retrieval (`WebFetch`) of several primary documentation domains (`developer.ticketmaster.com`, `developer.adzuna.com`, `developer.usajobs.gov`, `developers.greenhouse.io`, `hire.lever.co`, `schema.org`) was blocked by the environment's outbound network policy. Where this happened, findings are instead drawn from search-result snippets that directly quote or closely paraphrase the official page in question, with the source URL cited. GitHub-hosted official docs (`grnhse/greenhouse-api-docs`, `lever/postings-api`, `public-apis/public-apis`) were retrieved directly and are more reliable.

**Every field that could not be confirmed through an official source is labeled `NOT VERIFIED` below.** Nothing is guessed. Before any of these sources moves past a small local read-only spike, the `NOT VERIFIED` items — especially exact rate limits, full terms-of-use text, and exact response schemas — should be re-confirmed with direct, unrestricted access to the primary documentation.

---

## 1. Executive Summary

WorkJax currently has no automated ingestion of any kind: every employer, opportunity, and event in `data.js` is hand-entered, with no source field, no verification timestamp, and no expiration logic that can act on real dates (see `docs/architecture/current-state.md` and `docs/data/date-normalization-audit.md`). This document evaluates whether, and how, any of eleven external sources named in the task — plus the `public-apis/public-apis` GitHub repository — could feed the `PROPOSED` ingestion pipeline described in `docs/operations/content-ingestion.md`.

**No single source provides complete Jacksonville coverage for either events or opportunities.** Ticketmaster's Discovery API is the strongest single **event** candidate (documented city/DMA/geo filtering, free tier, structured dates), but it only covers ticketed commercial events — it does not cover community markets, art walks, or city-run programming. Locally-run calendars (Downtown Vision Inc.'s dtjax.com, Visit Jacksonville) cover exactly the recurring, low-cost, youth-relevant experiences already hand-entered in `data.js` today, but neither has a confirmed public API — only possible calendar-subscription exports or an embeddable widget. On the **opportunity** side, Greenhouse's and Lever's job-board APIs are real, free, documented, per-employer feeds — but they only return data for the one employer whose board you query; there is no citywide job search across either platform. Adzuna and USAJOBS are broader aggregators, but Adzuna's terms of use impose attribution and redistribution restrictions that need legal review, and USAJOBS only covers federal positions, which are a small and mostly irrelevant slice of WorkJax's current employer list.

The realistic path is the one `docs/operations/content-ingestion.md` already describes: a combination of **one broad ticketed-event API (Ticketmaster) + trusted local calendars (Downtown Vision, Visit Jacksonville) reviewed manually or via partnership + employer-specific ATS feeds (Greenhouse/Lever) added opportunistically per employer + a manual review queue** for everything else. This document's two recommended proof-of-concept experiments (Section 10, Section 11) are both small, local, read-only, and reversible, and neither touches `data.js`, `app.js`, or any other website file.

---

## 2. WorkJax Requirements Recap

Pulled from `docs/features/opportunities.md`, `docs/features/experience-jax.md`, `docs/data/data-model.md`, and `docs/operations/content-ingestion.md` — restated here as the yardstick every source is measured against:

- Every imported record must retain its source (no source field exists in `data.js` today).
- Structured open/close/start/end dates in ISO 8601, sufficient to drive automatic expiration.
- Employer, organizer, venue, and location data, ideally with latitude/longitude for map display.
- An official outbound application/ticket/RSVP URL — WorkJax never hosts applications itself.
- A documented free tier or public access; any secret key must live server-side (Vercel Function), never in `app.js`/`data.js`/browser-visible code, per `CLAUDE.md`'s Security Rules.
- Support for distinguishing Scheduled Event vs. Recurring Space (events) and separate Employer vs. Opportunity records with multiple student levels/industries (opportunities) — matching the target data model, not the current combined `employers` structure.
- Compensation/salary, internship classification, and student-level/remote-mode fields, where available.
- A source priority that favors official APIs/feeds over scraping, per `docs/operations/content-ingestion.md`'s six-tier list.

---

## 3. Event-Source Comparison Table

| Source | Type | Official docs | Availability | Jax/NE FL filter | Auth | Free tier / rate limit | Structured dates | Outbound URL | Redistribution/caching terms | Browser-safe? | One-line fit |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Ticketmaster Discovery API | Commercial ticketing aggregator | developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2 | Live | Yes — `city`, `stateCode`, `postalCode`, `dmaId`, `geoPoint`+`radius` | API key (`apikey` param) | 5,000 calls/day; per-second limit conflicting across official sources — see Section 5.1 | Yes — `dates.start.localDate` | Yes — `url` field | "Reasonable periods" caching language; full terms `NOT VERIFIED` | No — key must be server-side | Strongest single event source; ticketed events only |
| Eventbrite API | Ticketing/event-management platform | eventbrite.com/platform/docs | Live, but public discovery/search removed Dec 2019–Feb 2020 | **No** — no citywide search endpoint remains for third parties | OAuth2 / private token | Conflicting figures found (1,000–2,000/hr); `NOT VERIFIED` | Presumed ISO 8601; `NOT VERIFIED` | Presumed present; `NOT VERIFIED` | `NOT VERIFIED` | No | Not usable for discovery today |
| SeatGeek API | Commercial ticket-marketplace aggregator | portal.seatgeek.com / seatgeek.com/api-terms | Live; new-signup status `NOT VERIFIED` | Venue has `city`/`state`/`location`; exact geo query param `NOT VERIFIED` | `client_id` vs. Bearer token — conflicting descriptions, `NOT VERIFIED` | `NOT VERIFIED` (no numeric limit found) | Yes — `datetime_local`/`datetime_utc` | Yes — `url` field | **Explicitly prohibits caching, storing, or redistributing content** | Unclear — likely no | Legally restrictive; defer |
| City of Jacksonville Special Events | Official city permitting portal | events.jacksonville.gov | Live | N/A — inherently Jacksonville-only | N/A (no API) | N/A | No — HTML/permitting workflow only | N/A | `NOT VERIFIED` (no data-reuse terms found) | N/A — no API to call | High trust, zero automation; permit registry, not a "things to do" list |
| Downtown Jax calendar (dtjax.com, Downtown Vision Inc.) | Local nonprofit BID community calendar | dtjax.com/events | Live | N/A — inherently Downtown-Jax-scoped | N/A (no documented API); possible iCal/Google/Outlook subscription (unconfirmed platform) | N/A | Unconfirmed — plausible `.ics` feed, `NOT VERIFIED` | `NOT VERIFIED` | `NOT VERIFIED` | Unclear — likely needs server-side proxy even if `.ics` exists (CORS) | Matches Experience Jax's "recurring space" content type well; no confirmed API |
| JaxEvents (jaxevents.com) | City-contracted venue ticketing portal (Legends Global/ASM Global) | jaxevents.com | Live | N/A — 6 specific city-owned venues only | N/A (no API) | N/A | N/A | Site itself / likely redirects to Ticketmaster | `NOT VERIFIED` | N/A | Likely redundant with Ticketmaster (same venues) |
| Visit Jacksonville events calendar | Official local tourism DMO calendar | visitjacksonville.com/events | Live | N/A — inherently Jacksonville-scoped | N/A — only a display widget/iframe found, not a data API | N/A | `NOT VERIFIED` | `NOT VERIFIED` | `NOT VERIFIED` | Widget only shows their own UI, not raw records | Best official curated source; needs a partnership conversation for real data access |

## 4. Opportunity-Source Comparison Table

| Source | Type | Official docs | Availability | Jax/NE FL filter | Auth | Free tier / rate limit | Internship field | Salary field | Remote/hybrid field | Structured close date | Browser-safe? | One-line fit |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Greenhouse Job Board API | Per-employer ATS job-board API | developers.greenhouse.io/job-board.html; github.com/grnhse/greenhouse-api-docs | Live | **No** — per-employer board (`board_token`) only, no cross-employer search | None for GET; API key (Basic auth) for POST | Free, unauthenticated GET; exact rate-limit number `NOT VERIFIED` | Not standard — only via optional employer `metadata` | Not present | Not present | Only on single-job endpoint (`application_deadline`); not on list endpoint | Yes for GET (public, CORS-friendly) | Real per-employer feed; no Jax-wide search |
| Lever Postings API | Per-employer ATS postings API | hire.lever.co/developer/postings; github.com/lever/postings-api | Live | **No** — per-employer site only; repeatable `location` filter works within one employer | None for GET; API key for POST | Free, unauthenticated GET; documented POST limit 2 req/sec; GET limit `NOT VERIFIED` | **Yes** — `commitment=Intern` | **Yes** — `salaryRange` object | **Yes** — `workplaceType` | `createdAt` exists but flagged undocumented/unstable by Lever's own GitHub issue tracker; no `validThrough` equivalent | Yes for GET | Best field-level fit of any ATS reviewed |
| Adzuna API | Multi-country job-search aggregator | developer.adzuna.com | Live | `location0`/`location1` hierarchy plausible; exact Jacksonville-city match `NOT VERIFIED` | `app_id` + `app_key` (both required every call) | Free tier exists; exact quota and rate limit `NOT VERIFIED` | `NOT VERIFIED` | `salary_min`/`salary_max` (+ `salary_is_predicted` flag) | `NOT VERIFIED` | `created` (posting date) documented; no close/expiry field found | No — keys required, plus mandatory-branding ToU makes server-side proxy the only compliant path | Broad but legally restrictive |
| USAJOBS API | Official U.S. federal job board | developer.usajobs.gov | Live | National; Jacksonville-specific parameter `NOT VERIFIED` | `User-Agent` + `Authorization-Key` headers | Free, self-service registration; exact rate limit `NOT VERIFIED` | Program-level (Pathways) confirmed at website level; API field `NOT VERIFIED` | Presumed present (federal pay-transparency law); exact field name `NOT VERIFIED` | `NOT VERIFIED` | Field names `NOT VERIFIED` | No — key tied to registered `User-Agent`, keep server-side | Highest trust, narrow relevance (federal only) |
| Employer career pages (schema.org `JobPosting` markup) | Open decentralized markup standard, not an API | schema.org/JobPosting; developers.google.com/search/docs/appearance/structured-data/job-posting | Standard is stable; per-employer adoption unknown | Fully depends on each employer's own site | None — public HTML | N/A — free, but requires a WorkJax-built crawler | **Yes** — `employmentType: INTERN` | `baseSalary` documented; real-world fill rate `NOT VERIFIED` | `jobLocationType: TELECOMMUTE` | **Yes** — `datePosted` + `validThrough`, both documented standard fields | N/A — requires server-side crawling/parsing, not a single callable endpoint | Best conceptual fit to WorkJax's target model; highest build cost (no shared endpoint) |

**`public-apis/public-apis` (github.com/public-apis/public-apis)** is not in either table above because it is not a data source at all. Confirmed by directly reading its README: it is "manually curated by community members... an extensive list of public APIs from many domains that you can use for your own products." It is a categorized table of links (name, description, auth type, HTTPS/CORS support) to *other* APIs — a research tool a human might browse, not something WorkJax's code could call, authenticate against, or receive event/job records from. None of the WorkJax-fit scoring in Section 5 applies to it.

---

## 5. Detailed Source Assessments and WorkJax Fit Scores

Scoring is 1–5 on: **Relevance** to WorkJax users, **Jacksonville coverage**, **Structured data quality**, **Source trustworthiness**, **Ability to reduce employer duplication**, **Automatic expiration support**, **Implementation simplicity**, **Cost and access**, **Long-term maintainability**. Every score is followed by the specific fact it rests on. Where the underlying fact is `NOT VERIFIED`, the score is deliberately conservative rather than optimistic.

### 5.1 Ticketmaster Discovery API

- **Relevance: 4/5** — covers concerts, sports, arts/theatre, and comedy (`classificationName` values), which map directly onto Experience Jax's "Scheduled Event" content type.
- **Jacksonville coverage: 4/5** — `city`, `stateCode`, `dmaId`, and `geoPoint`+`radius` are documented, real query parameters; full completeness of Jacksonville-area venues in Ticketmaster's inventory is `NOT VERIFIED`.
- **Structured data quality: 5/5** — stable `id` fields, `dates.start.localDate`, `_embedded.venues[]` with `name`/`city`, and an `url` field are all documented.
- **Source trustworthiness: 5/5** — major national commercial ticketing platform with a versioned (v2), actively documented API and an API Explorer/Postman collection.
- **Dedup reduction: 3/5** — stable IDs help match records over time, but Ticketmaster listings likely overlap with JaxEvents (same venues) and possibly Downtown Jax/Visit Jacksonville for larger events; cross-source dedup would still be manual.
- **Automatic expiration: 4/5** — `dates.start.localDate` is real structured data that `isEventActive()` (already implemented in `app.js`) could act on once a record is marked `"verified"`.
- **Implementation simplicity: 3/5** — standard REST/JSON, but requires a server-side proxy since `apikey` is a credential that should not be embedded in browser code.
- **Cost and access: 4/5, with a documentation conflict to resolve before implementation** — Ticketmaster's official sources disagree on the per-second limit. The Discovery API product/docs page (developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2) states **5,000 calls per day and 5 requests per second**. Ticketmaster's official FAQ states **5,000 calls per day and 2 requests per second**. Both figures are official, but they conflict, and neither should be treated as authoritative on its own. Until this is resolved, any implementation should use conservative request behavior (pacing calls well under 2 req/sec) and verify the actual limit shown in the developer account that holds the provisioned key — see `docs/decisions/ADR-002-ticketmaster-event-poc.md`, Success Criterion 10.
- **Long-term maintainability: 4/5** — large, stable, commercially-maintained API unlikely to disappear; exact caching/attribution terms are `NOT VERIFIED` this session and should be reconfirmed before Phase 1 (Section 13).

### 5.2 Eventbrite API

- **Relevance: 2/5** — the platform hosts many relevant community events, but the capability WorkJax would need (search all events in a city) was removed for third parties in Dec 2019–Feb 2020, per an official Eventbrite-maintained GitHub issue.
- **Jacksonville coverage: 1/5** — no citywide/geographic discovery endpoint exists today for accounts that don't already own the organization/venue/event ID being queried.
- **Structured data quality: 3/5** — IDs and endpoint structure exist, but IDs are useless without a way to discover them, and date-field format is `NOT VERIFIED`.
- **Source trustworthiness: 4/5** — official, well-known platform, but the documented feature removal is a material limitation, not a rumor.
- **Dedup reduction: 2/5** — moot without a discovery mechanism.
- **Automatic expiration: 2/5** — `NOT VERIFIED`, and moot given coverage.
- **Implementation simplicity: 2/5** — requires OAuth2 for no practical discovery benefit.
- **Cost and access: 3/5** — free key, but delivers little usable functionality for WorkJax's use case.
- **Long-term maintainability: 2/5** — a platform that has already removed the exact capability WorkJax would need is a poor long-term bet.
- **Overall:** not usable as a Jacksonville event-discovery source today.

### 5.3 SeatGeek API

- **Relevance: 3/5** — covers similar ticketed content to Ticketmaster.
- **Jacksonville coverage: 2/5** — venue objects reportedly include `city`/`state`/`location`, but the exact geographic search parameter is `NOT VERIFIED`, and current new-developer-signup availability is `NOT VERIFIED`.
- **Structured data quality: 3/5** — `id`, `datetime_local`/`datetime_utc`, and venue `location` are documented in schema snippets, but full verification was not possible.
- **Source trustworthiness: 3/5** — an established commercial platform, but the authentication mechanism itself is described inconsistently across sources found, which is itself a signal of documentation instability.
- **Dedup reduction: 2/5** — would likely duplicate Ticketmaster's ticketed-event coverage for the same shows, with no confirmed shared identifier to reconcile against.
- **Automatic expiration: 3/5** — structured datetime fields are documented, in principle sufficient.
- **Implementation simplicity: 2/5** — unclear auth model and unconfirmed signup process add real risk before any code is written.
- **Cost and access: 2/5** — access model (free vs. commission-based Partner Program) is unclear.
- **Long-term maintainability: 2/5** — the SeatGeek API/SDK Terms explicitly state (quoted directly from seatgeek.com/api-terms): *"You shall not commercialize... copy, store or cache SeatGeek Content"* and *"You cannot sell, rent, redistribute, transfer, or sublicense the API or API content to anyone."* This is materially more restrictive than Ticketmaster's language and is likely incompatible with WorkJax's model of displaying merged, cached listings on its own site.
- **Overall:** defer pending legal review of the redistribution/caching restriction (see Section 14).

### 5.4 City of Jacksonville Special Events

- **Relevance: 3/5** — genuinely official city content, but the site is a **permitting portal** (events over 500 attendees, or private events using public space) plus a general "All Events Calendar," not a curated "things to do" list in the tourism sense.
- **Jacksonville coverage: 5/5** — by definition, entirely Jacksonville/Duval County.
- **Structured data quality: 1/5** — confirmed no public API, JSON feed, or iCal export exists; it is an HTML permitting-workflow site.
- **Source trustworthiness: 5/5** — official city government source, the highest trust tier available.
- **Dedup reduction: 3/5** — permit records are a fairly distinct category unlikely to heavily overlap with ticketed/commercial events.
- **Automatic expiration: 1/5** — no structured dates to act on.
- **Implementation simplicity: 1/5** — would require manual entry or webpage scraping, the two lowest-priority methods in `docs/operations/content-ingestion.md`'s six-tier source priority list.
- **Cost and access: 5/5** — free and public, no signup.
- **Long-term maintainability: 3/5** — stable government site, but any future scraping approach is fragile to layout changes with no advance notice contract.
- **Overall:** valuable as a trusted, manually-reviewed reference, not automatable today.

### 5.5 Downtown Jax calendar (dtjax.com, operated by Downtown Vision Inc.)

A disambiguation surfaced during research: the "Downtown Investment Authority" (DIA) is a separate City of Jacksonville government body (`dia.jacksonville.gov`) that only publishes board meeting agendas/minutes — it does not run a public events calendar. The organization that actually runs the downtown events calendar is **Downtown Vision, Inc.**, a nonprofit Business Improvement District, at `dtjax.com` (with `downtownjacksonville.org` referenced elsewhere as a related/legacy domain for the same organization — a live redirect could not be directly confirmed this session).

- **Relevance: 4/5** — recurring community programming (art walks, markets, fountain events) is exactly the "Recurring Space" content type Experience Jax already hand-curates — several current `data.js` events (e.g., "First Wednesday Art Walk") plausibly originate from this same calendar.
- **Jacksonville coverage: 5/5** — the site states only Downtown-Jacksonville events are accepted, so it is inherently and precisely scoped to a WorkJax-relevant sub-area.
- **Structured data quality: 2/5** — the site advertises Google Calendar/iCalendar/Outlook subscription options, which suggests (but does not confirm) an underlying calendar plugin capable of emitting a structured `.ics` feed; this is an inference from the feature set, not a confirmed platform identification.
- **Source trustworthiness: 4/5** — an established nonprofit Business Improvement District with a public event-submission process.
- **Dedup reduction: 3/5** — likely overlaps with Visit Jacksonville and JaxEvents for larger downtown events, with no shared identifier across sources to reconcile automatically.
- **Automatic expiration: 2/5** — contingent entirely on the unconfirmed `.ics` feed existing and being reliable.
- **Implementation simplicity: 2/5** — if a subscription feed exists, ingestion is straightforward; if not, this reduces to manual entry (the same method already used today).
- **Cost and access: 5/5** — free, public, no signup.
- **Long-term maintainability: 3/5** — small nonprofit organization; no formal API contract or change-notice commitment.
- **Overall:** the strongest content-type match for Experience Jax's existing recurring-space listings, but with no confirmed API — a good manual-curation or partnership candidate, not a code-integration candidate today.

### 5.6 JaxEvents (jaxevents.com)

- **Relevance: 2/5** — covers ticketed events at six specific city-owned venues (arena, ballpark/stadium, performing-arts center, convention center, Ritz Theatre), operated by Legends Global (successor to ASM Global/SMG Jacksonville) under a City of Jacksonville contract.
- **Jacksonville coverage: 5/5** by definition, but narrow — only those six venues, not citywide.
- **Structured data quality: 1/5** — confirmed no developer API or documentation portal exists; it is a consumer ticketing website.
- **Source trustworthiness: 4/5** — operated under a city contract, a legitimate operator, but not itself a data provider.
- **Dedup reduction: 1/5** — research found evidence that at least some of these venues' ticketing routes through Ticketmaster's own venue pages (e.g., a `ticketmaster.com/vystar-veterans-memorial-arena-tickets-jacksonville` URL was found), meaning events at these venues may already be retrievable through the Ticketmaster Discovery API under Ticketmaster's own venue IDs — a real duplication risk if both were integrated.
- **Automatic expiration: 1/5** — no data feed to act on.
- **Implementation simplicity: 1/5** — no API; only manual/scraping options exist.
- **Cost and access: 3/5** — free to browse, no formal data access exists.
- **Long-term maintainability: 2/5** — no API means no contract to maintain, but also nothing durable to build on.
- **Overall:** likely redundant with Ticketmaster for the venues it manages; do not pursue independently (Section 12).

### 5.7 Visit Jacksonville events calendar

- **Relevance: 4/5** — an official Destination Marketing Organization (DMO) calendar (Visit Jacksonville is described as a Destinations International-accredited DMO contracted by the Duval County Tourist Development Council) — exactly the kind of officially-curated source Experience Jax's stated purpose ("WorkJax generally curates existing experiences rather than creating them") calls for.
- **Jacksonville coverage: 5/5** — entirely Jacksonville-scoped by the organization's mandate.
- **Structured data quality: 1/5** — no public REST API or data feed was found; only a "Calendar Share" embeddable widget/iframe tool for third-party sites. Visit Jacksonville's calendar is plausibly built on Simpleview, a DMO CMS vendor that markets feed/API products to its customers generally — but no evidence confirmed that capability is actually enabled for Visit Jacksonville specifically.
- **Source trustworthiness: 5/5** — official tourism authority with an event-submission and review process.
- **Dedup reduction: 3/5** — would need manual reconciliation against Ticketmaster/Downtown Jax listings for the same events; no shared identifiers across sources.
- **Automatic expiration: 1/5** — no structured data confirmed.
- **Implementation simplicity: 1/5** — the widget only displays Visit Jacksonville's own calendar UI; it does not hand WorkJax structured records it can filter, merge, or normalize into its own data model. Real programmatic access would likely require a direct data-sharing/partnership agreement with Visit Jacksonville (and possibly Simpleview), not a self-serve developer signup.
- **Cost and access: 3/5** — calendar is free to view; genuine data access is not confirmed to be self-service.
- **Long-term maintainability: 3/5** — an established official organization, a reasonable long-term partner if a data-sharing conversation succeeds.
- **Overall:** the best-trust, best-coverage single source for Jacksonville events overall, but the realistic next step is an operator-level partnership conversation, not an engineering integration (see Section 14).

### 5.8 Greenhouse Job Board API

- **Relevance: 4/5** — a genuine, official, documented per-employer job-board API used by many mid-size and large employers.
- **Jacksonville coverage: 1/5** — no cross-employer or geographic search exists; you must already know an employer's `board_token`, and results are whatever that one employer has posted, filtered client-side by `location.name` text.
- **Structured data quality: 3/5** — stable `id`, `absolute_url`, `location.name` (free text, no lat/long), `updated_at` always present; `application_deadline` and `first_published` exist only on the single-job endpoint (not the list endpoint).
- **Source trustworthiness: 5/5** — officially documented via developers.greenhouse.io and a Greenhouse-maintained companion GitHub repo (`grnhse/greenhouse-api-docs`), which was directly fetched and verified.
- **Dedup reduction: 4/5** — because each board is authoritative for exactly one employer, this directly addresses the current `data.js` limitation where one employer record improperly combines multiple opportunities (`docs/architecture/current-state.md`, "Employer and opportunity are combined") — Greenhouse's data model already separates employer (the board) from opportunity (each job) the way WorkJax's target model does.
- **Automatic expiration: 2/5** — no general close-date field on the list endpoint; would rely on "listing disappears from source" grace-period logic (`docs/operations/content-ingestion.md`) rather than a known `application_close_at`.
- **Implementation simplicity: 4/5** — GET endpoints are public, unauthenticated, and CORS-friendly (Greenhouse's stated purpose is enabling exactly this kind of external career-site use); the real cost is discovering and maintaining which employers' `board_token` values apply.
- **Cost and access: 5/5** — completely free for read access, no signup.
- **Long-term maintainability: 4/5** — stable, widely-used ATS platform; per-employer data quality still depends on that employer keeping its own board current.
- **Overall:** strong per-employer proof-of-concept candidate (Section 11), if any current WorkJax employer actually uses Greenhouse.

### 5.9 Lever Postings API

- **Relevance: 4/5** — same per-employer ATS model as Greenhouse, but with notably better field coverage for WorkJax's specific needs.
- **Jacksonville coverage: 1/5** — same per-employer-only limitation; the documented, repeatable `location` filter (e.g., `?location=Oakland&location=Boston`) only filters within one employer's own postings, never across employers.
- **Structured data quality: 4/5** — documented `salaryRange` object (currency/interval/min/max), `workplaceType` (on-site/remote/hybrid), `commitment` (including an `Intern` value), and `applyUrl`. `createdAt` exists in practice but is explicitly flagged as an **undocumented, historically-ambiguous field** in Lever's own GitHub issue tracker (`lever/postings-api` issue #35) — treat it as unstable, not a reliable posted-date source.
- **Source trustworthiness: 4/5** — officially documented at hire.lever.co/developer/postings, corroborated by Lever's own companion GitHub repo, which was directly fetched.
- **Dedup reduction: 4/5** — same per-employer-authoritative argument as Greenhouse.
- **Automatic expiration: 2/5** — no documented close/expiry-date field found; same grace-period approach as Greenhouse would be needed.
- **Implementation simplicity: 4/5** — public, unauthenticated GET; simple JSON; documented POST-only rate limit (2 req/sec) doesn't affect read-only use.
- **Cost and access: 5/5** — free for read access, no signup.
- **Long-term maintainability: 4/5** — stable API; same per-employer maintenance dependency as Greenhouse.
- **Overall:** the best field-level fit of any ATS reviewed — `commitment=Intern`, `workplaceType`, and `salaryRange` map almost directly onto Opportunity's `opportunity_types`, `work_mode`, and `compensation_type` in `docs/data/data-model.md`. Recommended as the first choice for the opportunity experiment (Section 11), if a current or prospective WorkJax employer is confirmed to use Lever.

### 5.10 Adzuna API

- **Relevance: 3/5** — a broad aggregator could surface postings WorkJax doesn't already have, but unclear internship-specific filtering and a restrictive ToU reduce the practical fit.
- **Jacksonville coverage: 2/5** — `location0`/`location1` hierarchical parameters (e.g., `location0=US&location1=Florida`) are documented in principle; exact Jacksonville-city-level resolution is `NOT VERIFIED`.
- **Structured data quality: 3/5** — `id`, `created` (posting date, ISO 8601), `latitude`/`longitude`, `salary_min`/`salary_max`/`salary_is_predicted`, and `redirect_url` (application link) are documented; no close/expiry-date field was found.
- **Source trustworthiness: 3/5** — an established commercial aggregator, but the terms of use impose real constraints (below) that lower confidence in unrestricted use.
- **Dedup reduction: 2/5** — as an aggregator of other employers' original postings, Adzuna results risk re-duplicating what an employer's own Greenhouse/Lever board (or WorkJax's own hand-entered record) already provides, with no shared ID to reconcile against.
- **Automatic expiration: 2/5** — no confirmed close-date field.
- **Implementation simplicity: 3/5** — simple REST, but `app_id`/`app_key` must be kept server-side, and the mandatory attribution requirement (below) adds real front-end implementation work, not just a backend call.
- **Cost and access: 3/5** — free-tier registration exists; exact quota/rate limit `NOT VERIFIED`.
- **Long-term maintainability: 2/5** — Adzuna's own Terms of Service (developer.adzuna.com/docs/terms_of_service, quoted via search snippet) state: *"Data may not be used in its original format or in aggregation... to deliver any ongoing work or research... without written consent,"* and mandate a specific "Jobs by Adzuna" logo/link of a minimum pixel size on every displayed advert, plus a separate "Adzuna Jobsworth" credit on any published salary estimate. This is a genuine legal constraint on a persistent product feature, not a one-time integration cost.
- **Overall:** defer pending legal review of the redistribution/attribution terms (Section 14); not recommended as a first experiment.

### 5.11 USAJOBS API

- **Relevance: 2/5** — covers only U.S. federal positions. WorkJax's current 38 hard-coded employers are almost entirely private-sector, nonprofit, or local-government — federal listings would be a new, small, largely non-overlapping category, most notably the Pathways student internship program.
- **Jacksonville coverage: 2/5** — a national database; exact Jacksonville-filtering parameter behavior is `NOT VERIFIED`, and federal-agency presence in Jacksonville specifically (a handful of agencies such as the VA and Navy) is inherently limited.
- **Structured data quality: 3/5** — `PositionID` is confirmed; date and salary field names are referenced in search snippets but not independently confirmed via direct fetch.
- **Source trustworthiness: 5/5** — an official U.S. federal government system (developer.usajobs.gov, under OPM), the highest trust tier of any source in this evaluation.
- **Dedup reduction: 4/5** — inherently distinct from every private-employer source, minimal duplication risk.
- **Automatic expiration: 2/5** — field names `NOT VERIFIED`.
- **Implementation simplicity: 3/5** — documented `User-Agent` + `Authorization-Key` header auth, free self-service registration.
- **Cost and access: 5/5** — free, official, self-service.
- **Long-term maintainability: 4/5** — a stable federal system unlikely to disappear; exact rate limits are `NOT VERIFIED` and OPM's documented rate-limiting guide states it may adjust limits at its sole discretion.
- **Overall:** legitimate and highest-trust, but low near-term relevance given WorkJax's current employer mix — a good candidate to revisit later (Section 12), not a first experiment.

### 5.12 Employer career pages via `schema.org` `JobPosting` markup

- **Relevance: 5/5** — this is not a third-party API at all, but the actual mechanism `docs/architecture/target-state.md` names as a preferred source ("structured employer career pages"), and its documented fields map almost one-to-one onto WorkJax's target Opportunity schema: `datePosted`/`validThrough` → `application_open_at`/`application_close_at`; `employmentType: INTERN` → `opportunity_types`; `jobLocationType: TELECOMMUTE` → `work_mode`; `baseSalary` → `compensation_type`/`compensation_text`; `hiringOrganization`/`jobLocation` → Employer/Employer Location.
- **Jacksonville coverage: 3/5** — entirely dependent on whether each individual employer's own site implements the markup at all; adoption across WorkJax's current 38 employers is unknown and would need per-employer spot-checking.
- **Structured data quality: 4/5** — when present, this is the richest field set of any source reviewed (see above); real-world fill rate for optional fields like `baseSalary` and precise `jobLocation` geocoordinates is `NOT VERIFIED` and, based on general knowledge of the standard's optional nature, likely to vary widely.
- **Source trustworthiness: 4/5** — an open, long-standing schema.org/W3C Community Group standard, corroborated by Google's own Search Central implementation guide; trustworthy as a *standard*, though each employer's specific implementation is unverified.
- **Dedup reduction: 4/5** — one record per employer's own posting, avoiding the employer/opportunity conflation problem the same way Greenhouse/Lever do.
- **Automatic expiration: 4/5** — `validThrough` is a documented standard field mapping directly onto `application_close_at`, the best expiration support of any source reviewed, if employers actually populate it.
- **Implementation simplicity: 2/5** — the highest engineering cost of any source: there is no shared endpoint to call. WorkJax would need to build and maintain its own per-employer crawler/parser, watch for markup appearing/disappearing/drifting, and handle inconsistent or missing implementations — squarely the kind of "controlled webpage extraction" work `docs/operations/content-ingestion.md` ranks below official feeds in its source-priority list.
- **Cost and access: 5/5** — completely free, open standard, no account or key required to read it.
- **Long-term maintainability: 3/5** — the standard itself is stable, but reliability in practice depends on many independent employers maintaining correct markup, with no central registry to know who currently implements it or when they stop.
- **Overall:** the best long-term conceptual and legal fit (no ToU, no key, exact schema match), but the highest immediate build cost — recommended as a zero-cost manual spot-check (Section 11), not a crawler-building commitment, until adoption among WorkJax's actual employers is confirmed.

### 5.13 `public-apis/public-apis` (GitHub)

Not scored — it is a catalog, not a data source (see Section 4's closing note and Section 9's explicit confirmation below).

---

## 6. Authentication and Secret-Management Requirements

Per `CLAUDE.md`'s Security Rules, no private key may live in `app.js`, `data.js`, `index.html`, or any other browser-visible code; server-side use requires a Vercel Function, and this document does not request or create any such key.

| Source | Requires a secret? | Safe from browser JS? |
|---|---|---|
| Ticketmaster Discovery API | Yes — `apikey` | No — server-side only |
| Eventbrite API | Yes — OAuth2/private token | No |
| SeatGeek API | Yes (mechanism unclear) | No |
| City of Jacksonville Special Events | No (no API) | N/A |
| Downtown Jax calendar | Unconfirmed — possibly none if a public `.ics` feed exists | Unclear — CORS would likely still require a server-side proxy |
| JaxEvents | No (no API) | N/A |
| Visit Jacksonville calendar | No confirmed API; widget is client-embeddable but not a data source | N/A |
| Greenhouse Job Board API | No for GET; yes for POST (apply) | Yes for GET |
| Lever Postings API | No for GET; yes for POST (apply) | Yes for GET |
| Adzuna API | Yes — `app_id` + `app_key` | No |
| USAJOBS API | Yes — `Authorization-Key` | No |
| Employer `JobPosting` markup | No (public HTML) | N/A — requires server-side crawling, not a client call |

Every source that does require a secret would need a Vercel Function acting as a proxy — consistent with `docs/architecture/target-state.md`'s proposed architecture, none of which exists today. No key was requested or created as part of this task.

## 7. Data-Normalization Requirements

Every source above returns data in its own shape; none matches `data.js`'s current fields or the target `data-model.md` schema exactly. Recurring normalization needs, common across sources:

- **Dates:** per `CLAUDE.md`, all structured dates must be ISO 8601. Ticketmaster, Adzuna (`created`), and schema.org (`datePosted`/`validThrough`) already provide ISO 8601-shaped values; Greenhouse/Lever's date fields are partial or unstable (Section 5.8, 5.9) and would need per-record confirmation before trust.
- **Location:** none of the opportunity sources reviewed provide latitude/longitude on the job record itself (Adzuna is the one exception, with documented `latitude`/`longitude`); geocoding of free-text addresses, as already flagged as a gap in `docs/data/migration-map.md` Section 6, would still be required for any newly-ingested opportunity or event.
- **Employer identity:** Greenhouse/Lever require WorkJax to already maintain a list mapping its own Employer records to each employer's `board_token`/site slug — this is new operational data with no current equivalent in `data.js`.
- **Internship/compensation/remote-mode vocabularies:** Lever's `commitment`/`workplaceType`/`salaryRange` and schema.org's `employmentType`/`jobLocationType`/`baseSalary` map cleanly onto the target model's `opportunity_types`/`work_mode`/`compensation_type`; Greenhouse and Adzuna do not expose equivalent fields and would need inference or a documented gap, consistent with the "Missing / ambiguous" treatment already used in `docs/data/current-data-dictionary.md`.
- No source reviewed should be treated as fully populated — every ingested field should carry a `dateVerificationStatus`/`last_verified_at`-equivalent, exactly as `data.js` already does for its structured-date foundation fields (`docs/data/date-normalization-audit.md`), so that unverified imported data is never displayed as more trustworthy than it is.

## 8. Deduplication Risks

- **Ticketmaster ↔ JaxEvents ↔ Visit Jacksonville ↔ Downtown Jax:** the same large ticketed show at a city-owned venue could plausibly appear in Ticketmaster's inventory (Section 5.1) and be referenced by JaxEvents (Section 5.6) or a local calendar, with no shared identifier across sources to reconcile automatically.
- **Adzuna ↔ Greenhouse/Lever ↔ an employer's own site:** because Adzuna aggregates postings originally sourced from ATS platforms and employer sites, the same job could be ingested twice from two different "sources" with two different external IDs.
- **Existing employer-duplicate problem is unrelated to ingestion and already flagged internally:** `docs/data/date-normalization-audit.md` and `docs/data/migration-map.md` already document two likely duplicate employer pairs in the current hand-entered data (`id 3`/`id 31` "JEA"; `id 23`/`id 40` "Jacksonville Jaguars") — any automated ingestion must be built to detect this class of problem (same organization, different record), not just exact-ID duplicates across sources.
- Per `docs/operations/content-ingestion.md`, resolving any of the above requires the `PROPOSED` review queue and audit log, neither of which exists today; this evaluation does not resolve dedup, it flags where it will be needed.

## 9. Legal, Attribution, and Terms Questions

- **`public-apis/public-apis` is confirmed to be a catalog, not an endpoint.** Its own README states it is "manually curated by community members... an extensive list of public APIs from many domains that you can use for your own products" — a table of links to other APIs, categorized by domain, with columns for auth type and CORS/HTTPS support. It cannot be called, queried, or integrated; it can only be browsed by a human researcher to find candidate APIs (which is exactly how it informed this document's initial source list).
- **SeatGeek's API/SDK Terms** explicitly prohibit caching, storing, or redistributing its content and prohibit commercializing it in any form — likely incompatible with WorkJax's model of displaying merged/cached listings, pending legal confirmation.
- **Adzuna's Terms of Service** require a specific minimum-size "Jobs by Adzuna" attributed logo/link on every displayed listing, a separate "Adzuna Jobsworth" credit on any published salary estimate, and prohibit "aggregation" reuse without written consent — a real design and legal constraint, not just a technical integration detail.
- **Ticketmaster's full Terms of Use** (caching windows, exact attribution wording) could not be fully retrieved this session due to the network restriction described in the Research Method section — this should be re-confirmed with direct access before any real integration.
- **Greenhouse and Lever** did not surface a formal terms-of-use/attribution requirement in the material that could be directly fetched this session; both platforms' stated purpose is explicitly to let external sites build on their public job-board data, which is a favorable signal, but a formal terms page was not located and confirmed either way.
- **USAJOBS** is a federal system with terms requiring authorized use per posted policy; specific attribution/redistribution language was not retrievable this session.
- None of the above should be treated as settled; Section 14 lists the specific follow-ups needed.

---

## 10. Recommended First Event Proof of Concept

**Ticketmaster Discovery API, local read-only spike — not integrated into the live site.**

- Write a small, throwaway script (not a Vercel Function, not committed to the deployed site) that calls the Discovery API's `events` search with a Jacksonville-area `city` or `dmaId` parameter and a short date window (e.g., the next 30 days).
- Manually compare 3–5 returned event records against 2–3 existing `events` entries in `data.js` (e.g., a concert-type record if one exists, or a nearby comparable) to check field-mapping fit: does the returned `id`, `dates.start.localDate`, venue `name`/`city`, and `url` look usable for the target Experience fields in `docs/data/data-model.md`?
- Confirm whether the 5,000-calls/day free tier is realistically sufficient for a daily sync at WorkJax's scale.
- **This does not touch `data.js`, `app.js`, or any other website file, requests no API key be committed anywhere, and is fully reversible** — deleting the script removes all trace of the experiment.
- Success criteria: real, current Jacksonville-area events are returned with usable structured dates and a valid outbound URL, within the free tier's limits.
- Explicitly out of scope for this spike: Downtown Jax, Visit Jacksonville, JaxEvents, and City of Jacksonville sources — none has a confirmed public API to spike against; those remain manual-curation or partnership candidates (Section 14), not code experiments, until that changes.

## 11. Recommended First Opportunity-Source Experiment

**A manual per-employer spike against Greenhouse and/or Lever, plus a zero-cost `schema.org` spot-check — not integrated into the live site.**

1. Pick 2–3 employers already present in `data.js` (the migration map and data dictionary already list all 38 current records) and manually check whether their careers pages expose a Greenhouse `board_token` (URLs typically under `boards.greenhouse.io/<token>` or embedded via their own careers page) or a Lever site slug (`jobs.lever.co/<slug>`).
2. For any employer confirmed on one of these platforms, call the corresponding public, unauthenticated GET endpoint (Job Board API or Postings API) as a local script and compare the returned fields against that employer's current hard-coded `data.js` record — specifically checking whether `location`, `commitment`/internship classification, and (for Lever) `salaryRange`/`workplaceType` are populated in practice, not just documented in theory.
3. In parallel, view-source (or search) 2–3 employer career pages for embedded `application/ld+json` `JobPosting` markup, to get a real read on local adoption of the schema.org standard before committing to building a crawler.
4. **This does not touch `data.js`, `app.js`, requests no API key, and is fully reversible.**
5. Success criteria: at least one real, current WorkJax employer is confirmed to expose either an ATS feed or schema.org markup with genuinely usable structured fields (especially a real close/expiry date or internship flag) — if none do, that is itself a valid and important finding (Section 12).
6. Explicitly out of scope for this spike: Adzuna (legal review needed first, Section 14) and USAJOBS (low near-term relevance, Section 12).

## 12. Sources to Defer

- **Eventbrite** — the specific capability WorkJax needs (citywide discovery) was removed for third parties; revisit only if Eventbrite reinstates a public search endpoint.
- **SeatGeek** — defer pending legal review of its explicit no-caching/no-redistribution terms; also has unresolved auth-mechanism and new-signup-availability questions.
- **JaxEvents** — likely redundant with Ticketmaster for the venues it manages, and has no API of its own; do not pursue as an independent source.
- **Adzuna** — defer pending legal/operator review of its mandatory attribution and anti-aggregation terms.
- **USAJOBS** — legitimate and highest-trust, but low near-term relevance given WorkJax's current employer mix; revisit if federal/Pathways internships become a stated product priority.
- **City of Jacksonville Special Events** — no structured feed exists; keep as a manually-checked reference source, not an automation target, unless the city later publishes a feed.

## 13. Proposed Implementation Sequence

This sequence assumes the `PROPOSED` managed backend in `docs/architecture/target-state.md` (database, Vercel Functions, source registry, review queue) is built first — none of the steps below can go live on the current static-`data.js` architecture.

1. **Phase 0 (now, no site changes):** run the two spikes in Sections 10 and 11; re-verify the `NOT VERIFIED` items in Section 14 that a full documentation pass (unrestricted network access) could resolve.
2. **Phase 1:** once the managed backend exists, register Ticketmaster (events) and whichever ATS platform (Greenhouse or Lever) proved viable in Phase 0 as the first two entries in the `Source Registry`, with the validation/dedup/review-queue pipeline from `docs/operations/content-ingestion.md` — all new records enter as `review_required`, none auto-publish.
3. **Phase 2:** pursue a data-sharing or partnership conversation with Visit Jacksonville and/or Downtown Vision Inc. for structured local-calendar access; until/unless that succeeds, continue curating those sources manually.
4. **Phase 3:** expand ATS coverage opportunistically as more WorkJax employers are confirmed to use Greenhouse or Lever; treat schema.org markup as a supplementary, lower-priority method per the ingestion pipeline's own source-priority ranking.
5. **Phase 4:** revisit Adzuna, USAJOBS, and SeatGeek only after the legal questions in Section 14 are resolved, or if product priorities change (e.g., a stated need for federal internship listings).

At every phase, `docs/operations/content-ingestion.md`'s existing rule applies without exception: automation should reduce repetitive work, not eliminate accountable human review, and no source's coverage should ever be presented as complete Jacksonville coverage.

## 14. Open Questions Requiring Operator or Legal Review

- Legal review of Adzuna's mandatory-attribution and anti-aggregation Terms of Service before any integration beyond a private read-only spike.
- Legal review of SeatGeek's explicit no-caching/no-redistribution terms before any use beyond reading its public documentation.
- Re-verification, with unrestricted network access, of Ticketmaster's full caching/attribution terms, Eventbrite's exact rate limits, and USAJOBS's/Adzuna's/Greenhouse's/Lever's complete terms-of-use text — all were only retrievable via search snippets this session, not full page renders.
- Resolution of the conflicting official Ticketmaster per-second rate limits: the Discovery API docs page states 5 requests per second, while Ticketmaster's official FAQ states 2 requests per second, both under the same 5,000-calls-per-day daily cap. The proof of concept in `docs/decisions/ADR-002-ticketmaster-event-poc.md` must use conservative request behavior and verify the actual limit shown in the provisioned developer account rather than trusting either published figure alone.
- An operator-level outreach conversation with Visit Jacksonville (and/or its CMS vendor) to determine whether a real data-sharing or API partnership is available beyond the public embeddable widget.
- A similar outreach conversation with Downtown Vision Inc. to confirm whether dtjax.com's calendar actually offers a subscribable `.ics`/structured feed, and under what reuse terms.
- A manual, ongoing operator task (not a coding task) to determine which of WorkJax's current employers use Greenhouse, Lever, both, or neither — no directory of this exists today.
- Confirmation of whether SeatGeek is currently accepting new developer signups at all.
- A product decision on whether embedding a third-party calendar widget (if that is all Visit Jacksonville ultimately offers) would meet Experience Jax's goals, given it would not hand WorkJax structured records it can filter, merge, or de-duplicate against its own data.
- An operator decision on sequencing: none of Sections 10–13 can move past a local read-only spike until the `PROPOSED` managed backend, database, and Vercel Functions in `docs/architecture/target-state.md` exist — this document is input to that future work, not a substitute for deciding to build it.

---

## Change Log

| Date | Change | Author |
|---|---|---|
| 2026-07-13 | Initial API evaluation created from official documentation research (Ticketmaster, Eventbrite, SeatGeek, City of Jacksonville, Downtown Vision Inc./dtjax.com, JaxEvents, Visit Jacksonville, Greenhouse, Lever, Adzuna, USAJOBS, schema.org JobPosting, and public-apis/public-apis) | Claude (documentation task) |
| 2026-07-13 | Corrected the Ticketmaster rate-limit language to document the conflict between the Discovery API docs page (5 req/sec) and Ticketmaster's official FAQ (2 req/sec), both under a 5,000 calls/day cap; linked to ADR-002 | Claude (documentation task) |
