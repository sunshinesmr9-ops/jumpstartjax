# Experience Jax

**Current status:** `LIVE` hard-coded content  
**Target status:** `PROPOSED` automatically refreshed experience directory

## Purpose

Help summer interns and year-round users discover existing Jacksonville events, recurring third spaces, and community experiences.

WorkJax generally curates existing experiences rather than creating them.

## Content Types

### Scheduled Event

A one-time or dated event with a specific start and end.

Examples:

- Concert
- Festival
- Market
- Sports game
- Community event

### Recurring Space or Experience

A repeating or ongoing gathering that may not require an RSVP.

Examples:

- Weekly market
- Recurring yoga
- Trivia night
- Community garden
- Monthly art walk

These types must remain distinct in the data model because their expiration and recurrence behavior differ.

## Required Fields

- Title
- Type
- Description
- Category or categories
- Venue
- Address
- Structured date/time or recurrence rule
- Price
- Transportation information
- Accessibility information
- Age restrictions
- Official source
- External RSVP or information URL
- Last verified date
- Status

## Target Expiration Rules

| Content | Rule |
|---|---|
| One-time event | Hide after `ends_at`, unless retained in an archive |
| Cancelled event | Hide immediately from active results |
| Recurring experience | Remain active while recurrence is valid and source continues to confirm it |
| Unverified recurring item | Move to review after the freshness threshold |
| Changed event | Update the canonical record and retain an audit entry |

## RSVP Relationship

WorkJax may allow a user to record that they plan to attend. The official ticket or organizer RSVP remains external unless a future WorkJax-hosted event is approved.

**Disclosure (`LIVE`):** Every event card displays a "Prototype note" directly above the RSVP control, visible before the user selects RSVP, stating that the RSVP is for demonstration only, does not register the user with the event organizer, and that the official event link should be used to register.

```mermaid
flowchart TD
    A[Open experience] --> B[Review details]
    B --> C[Open official information or RSVP]
    B --> D[Mark interested or going in WorkJax]
    D --> E[Optional display in Connect Jax under privacy settings]
```

## Future WorkJax-Hosted Events

The concept of a WorkJax-hosted intern event is `TBD`. It should not be treated as an existing product capability until an operator, liability plan, event owner, and budget are identified.

## Structured Date Fields (`LIVE`, values currently `null`/unverified)

Per `docs/data/date-normalization-audit.md`, every `events` record in `data.js` now carries:

- `experienceType` — `"scheduled_event"` or `"recurring_space"` where the audit clearly recommends one of those two values; `null` where the audit instead flags the record as needing a future split (e.g. Cody Johnson Live '26, Jax River Jams, Jumbo Shrimp Baseball) or as a standing/evergreen activity that doesn't fit the current two-value enum (e.g. Kayaking, Jacksonville Beach, Timucuan Preserve)
- `startsAt`, `endsAt`, `recurrenceRule` — `null` on every current record, including Cody Johnson Live '26 and The Music of David Bowie (Symphonic), whose source verification is still incomplete
- `dateVerificationStatus` — `"unverified"` on every current record

`isEventActive(record)` in `app.js` gates the Experience Jax grid: it only excludes a record when `dateVerificationStatus === "verified"` **and** `endsAt` is a past date. Since every current record is unverified, the helper returns `true` for all 15 records today and nothing is hidden. The original `date` text field remains the display source of truth; no event record was split as part of adding these fields.

## Nested Subtabs: Explore Jacksonville vs. Community Event Platform

**Current status:** `LIVE` nested-tab shell; `DEMO ONLY` content in the second tab

The Third Spaces page now contains two nested subtabs:

- **Explore Jacksonville** (default) — everything described above in this document. Unchanged.
- **Community Event Platform** — a separate, `DEMO ONLY` prototype adapted from a different public project (`espil77/3rd-Space`). It uses its own isolated data (`community-event-data.js`) and its own script (`community-event-platform.js`); it does not read or write the `events` array, `renderEvents()`, or the RSVP data described above. See [Community Event Platform](community-event-platform.md) for full detail.

These two must not be conflated in future documentation or code: this page's existing event-discovery content is WorkJax's own curated data; the Community Event Platform tab is an adapted external concept; and a possible future SMS-based version of that concept remains `PROPOSED` and unbuilt.
