# Ticketmaster Discovery API Proof of Concept

**Status:** `DEMO ONLY` — a server-side endpoint exists, but it is not called by the live Experience Jax interface and returns no data to any visitor today.
**Decision record:** [ADR-002: Ticketmaster Discovery API Event Proof of Concept](../decisions/ADR-002-ticketmaster-event-poc.md)
**Scope:** Endpoint-only. No frontend integration, no database, no scheduled ingestion.

## Endpoint

```
GET /api/ticketmaster-events
```

Implemented as a Vercel Function at `api/ticketmaster-events.js` using a named Web Handler (`export async function GET(request)`). The `request` object is intentionally unused — the endpoint accepts no caller-supplied query parameters and cannot be configured by the caller.

## Fixed Search Scope

Every request to Ticketmaster uses these fixed, server-controlled parameters. None can be overridden by the caller:

| Parameter | Value |
|---|---|
| `city` | `Jacksonville` |
| `stateCode` | `FL` |
| `countryCode` | `US` |
| `startDateTime` | Current server time, ISO 8601 UTC, computed at request time |
| `endDateTime` | Current server time + 30 days, ISO 8601 UTC |
| `size` | `20` |
| `sort` | `date,asc` |
| `apikey` | Read from `process.env.TICKETMASTER_API_KEY` at request time |

## Normalized Event Schema

Each entry in the response `events` array has this shape:

| Field | Source | Notes |
|---|---|---|
| `id` | `"ticketmaster:" + event.id` | Prefixed to avoid collision with other future sources |
| `sourceId` | `event.id` | Raw Ticketmaster ID |
| `sourceName` | `"Ticketmaster"` | Fixed literal |
| `title` | `event.name` | |
| `description` | `event.info` or `event.pleaseNote`, else `null` | |
| `experienceType` | `"scheduled_event"` | Fixed; matches the `Experience` entity in `docs/data/data-model.md` |
| `startsAt` | `event.dates.start.dateTime`, else `null` | Only the official Ticketmaster UTC value. Never synthesized from `localDate`/`localTime`. |
| `endsAt` | `event.dates.end.dateTime`, else `null` | Same rule as `startsAt` |
| `localDate` | `event.dates.start.localDate`, else `null` | Display-only, not used for expiration logic |
| `localTime` | `event.dates.start.localTime`, else `null` | Display-only |
| `venueName` | first embedded venue's `name`, else `null` | |
| `address` | venue `address.line1`, else `null` | |
| `city` | venue `city.name`, else `null` | |
| `stateCode` | venue `state.stateCode`, else `null` | |
| `postalCode` | venue `postalCode`, else `null` | |
| `latitude` | venue `location.latitude`, else `null` | |
| `longitude` | venue `location.longitude`, else `null` | |
| `category` | first classification's `segment.name`, else `null` | |
| `externalUrl` | `event.url` | Official Ticketmaster outbound event page |
| `eventStatus` | `event.dates.status.code`, else `null` | e.g. `onsale`, `cancelled` |
| `dateVerificationStatus` | `"verified"` | Ticketmaster is treated as an authoritative live source for this proof of concept |
| `lastVerifiedAt` | Server request timestamp, ISO 8601 UTC | Set once per request, shared by every event in that response |

Top-level response body:

```json
{
  "source": "ticketmaster",
  "generatedAt": "2026-07-13T00:00:00Z",
  "searchWindow": {
    "startDateTime": "2026-07-13T00:00:00Z",
    "endDateTime": "2026-08-12T00:00:00Z"
  },
  "count": 0,
  "events": []
}
```

## Secret Management

- The API key is read only from `process.env.TICKETMASTER_API_KEY`.
- The key must be set as a Vercel environment variable (Preview scope, per ADR-002) and is never committed to the repository.
- The key is never written to `app.js`, `data.js`, `index.html`, logs, this document, or the JSON response.

## Error Behavior

| Condition | Response |
|---|---|
| `TICKETMASTER_API_KEY` not set | `500 { "error": "Ticketmaster is not configured." }` |
| Upstream request times out (8 seconds) | `504 { "error": "Ticketmaster request timed out." }` |
| Upstream network failure | `502 { "error": "Unable to reach Ticketmaster." }` |
| Ticketmaster returns a non-2xx status | `502 { "error": "Ticketmaster returned an error." }` |
| Ticketmaster returns unparseable JSON | `502 { "error": "Ticketmaster returned an unreadable response." }` |
| No matching events | `200` with `"events": []` |

No error response includes the API key, the full upstream request URL, or raw upstream error bodies.

## Cache Behavior

Successful responses are returned with:

```
Cache-Control: public, s-maxage=300, stale-while-revalidate=600
```

This caches a response at the edge for 5 minutes and allows a stale copy to be served for up to 10 more minutes while revalidating, so repeat visits within that window do not consume an additional Ticketmaster request. This is a deliberately conservative setting because Ticketmaster's own official pages disagree on the exact per-second rate limit (`docs/integrations/api-evaluation.md`, Section 5.1 and Section 14; `docs/decisions/ADR-002-ticketmaster-event-poc.md`, Open Questions). Error responses are returned with `Cache-Control: no-store` and are never cached.

No API response is stored anywhere else — not in a database, not in a file, not in memory beyond the lifetime of a single request.

## Manual Testing Process

1. Deploy this branch to a Vercel **Preview** environment only (per ADR-002 — not production).
2. With `TICKETMASTER_API_KEY` unset in that environment, call the endpoint and confirm a `500` response with the generic configuration-error message and no leaked details.
3. Set a real `TICKETMASTER_API_KEY` in the Preview environment's Vercel project settings.
4. Call `GET /api/ticketmaster-events` and confirm:
   - HTTP `200`
   - `source`, `generatedAt`, `searchWindow`, `count`, and `events` are all present
   - Every event has all fields listed in the schema above, using `null` where Ticketmaster did not supply a value
   - `startsAt`/`endsAt` are `null` (not a guessed value) whenever Ticketmaster's response omits an official UTC `dateTime`
5. Manually compare 3–5 returned events against the `Experience` entity in `docs/data/data-model.md` to confirm the field mapping is usable.
6. Search the raw response text for the configured API key value and confirm zero matches.
7. Call the endpoint twice in quick succession and confirm the second call is served from cache (via response headers/timing) rather than issuing a second upstream Ticketmaster request.
8. Confirm `index.html`, `styles.css`, `app.js`, and `data.js` behavior is completely unchanged — Experience Jax must still read only from `data.js`.

## Success Criteria

Matches ADR-002's Success Criteria 1–8 for this implementation task:

1. The endpoint returns current Jacksonville events when a valid key is configured.
2. Every result has a stable `sourceId`.
3. Every result has a `title` and an official `externalUrl`.
4. `startsAt`/`endsAt` are populated whenever Ticketmaster provides an official UTC `dateTime`, and are `null` otherwise.
5. Venue and address fields are populated when Ticketmaster provides them.
6. The API key never appears in browser-visible code or in the JSON response.
7. Missing configuration and upstream errors return controlled JSON errors, not raw upstream detail.
8. `index.html`, `styles.css`, `app.js`, and `data.js` are unchanged and continue to function exactly as before.

ADR-002's Success Criteria 9 (manual comparison of 3–5 sample records) and 10 (attribution/caching/rate-limit terms review) are operator tasks to complete after a real API key is provisioned, using the process above — they are not resolved by this code change alone.

## Failure Criteria

This proof of concept should be considered a "no" and removed if, once a real key is tested:

- Ticketmaster's actual per-second rate limit (once confirmed in a provisioned developer account) is too restrictive for a plausible daily-sync use case.
- The full caching/attribution terms (still unresolved per `docs/integrations/api-evaluation.md`, Section 14) turn out to be incompatible with WorkJax's intended display model.
- Sample records compared against `docs/data/data-model.md` do not map usefully onto the target Experience schema.

## Relationship to the Live Site

**The live Experience Jax interface does not call this endpoint.** `app.js` and `index.html` are unchanged, and Experience Jax continues to render only the hard-coded records in `data.js`. This endpoint exists solely to validate the server-side key-handling and normalization pattern described in ADR-002, ahead of any future, separately-approved decision to connect a real data source to the live site.

## Change Log

| Date | Change | Author |
|---|---|---|
| 2026-07-13 | Created endpoint-only Ticketmaster proof of concept and this documentation, per ADR-002 | Claude (implementation task) |
