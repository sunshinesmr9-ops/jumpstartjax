# Migration Map: Current Prototype → Target Data Model

**Status:** `PROPOSED` planning document — no migration has been built or run
**Sources documented:** `data.js`, `app.js`
**Target schema:** [`docs/data/data-model.md`](data-model.md)
**Prior inventory:** [`docs/data/current-data-dictionary.md`](current-data-dictionary.md)
**Last reviewed:** 2026-07-13

## Purpose

This document maps every current, hard-coded field in `data.js` (plus the browser-only data written by `app.js`) to the `PROPOSED` target entities in `docs/data/data-model.md`: **Employer, Employer Location, Opportunity, Experience, Profile, Source, Saved Opportunity, RSVP**.

This is a planning artifact, not a migration script. No values are invented — every "current field" and "example" is taken directly from `data.js`/`app.js` as read for this document. Website code was not modified to produce this document.

## How to read the tables

| Column | Meaning |
|---|---|
| Current dataset | The `data.js` array/object or browser storage key the field comes from today |
| Current field | The exact field name today |
| Target entity | Which of the 8 target entities the field should live on |
| Target field | The proposed target field name |
| Required transformation | What must happen to the value to make it valid in the target schema |
| Missing data? | Whether the target field's data does not exist today and must be newly collected, inferred, or defaulted |
| Automatable? | Whether a script can perform the transformation unattended (`Yes`), only as an unverified first pass (`Partial`), or not at all (`No`) |
| Human review required? | Whether a person must check or decide something before the migrated value can be trusted |

---

## 1. `employers` → Employer, Employer Location, Opportunity

`employers` is the dataset most affected by this migration: it must be split into three target entities. See dedicated Sections 1–4 below for the reasoning; this table gives the field-level detail.

| Current dataset | Current field | Target entity | Target field | Required transformation | Missing data? | Automatable? | Human review required? |
|---|---|---|---|---|---|---|---|
| `employers` | `id` | Employer | `id` | Generate a new UUID per **unique** employer (see Section 1 on deduplication before this step) | Yes — no employer/opportunity ID split exists | Partial | Yes |
| `employers` | `id` | Opportunity | `id` | Generate a new UUID per entry in `programs[]` (fan-out — see Section 2) | Yes | Partial | Yes |
| `employers` | `id` | Opportunity | `external_id` | Store the original numeric `id` (plus program index) so `workjax_saved` entries can be remapped (see Section 7) | No (value exists, just needs to be carried forward) | Yes | No |
| `employers` | `name` | Employer | `name` | Direct copy | No | Yes | Yes — confirm official name and resolve near-duplicate employer records (e.g., `id 23`/`id 40`, both `"Jacksonville Jaguars"`; `id 3`/`id 31`, `"JEA"` vs. `"JEA Skilled Craft Apprenticeship"`) before generating one Employer row per name |
| `employers` | `icon` | *(none — not in target schema)* | — | Drop from the data model | N/A | Yes | Yes — confirm the fallback-icon UI pattern is no longer needed once `logo_url` quality improves |
| `employers` | `logo` | Employer | `logo_url` | Rename; replace auto-generated favicon URLs with an approved logo source per target model wording | No (value exists, but is a placeholder) | Partial | Yes |
| `employers` | `industry` | Employer | `industries` | Wrap single string in a one-element array; map to a controlled Industry vocabulary | No | Partial | Yes — decide whether industry lives on Employer, Opportunity, or both |
| `employers` | `industry` | Opportunity | `industries` | Same as above, at the opportunity level | No | Partial | Yes |
| `employers` | `industryLabel` | Opportunity | `industries` (secondary value) | Fold into the `industries` array as an additional/refined value, pending a controlled subcategory vocabulary | Present on only 7 of 38 records | No | Yes |
| `employers` | `type` | Opportunity | `opportunity_types` | Wrap single string in array; validate against a controlled vocabulary (current values: `Internship`, `Co-op`, `Fellowship`, `Job Shadow`, `Volunteer`, `Apprenticeship`) | No | Yes (wrap) / No (vocabulary) | Yes |
| `employers` | `grade` | Opportunity | `student_levels` | Deterministic map: `"Both"` → `["high_school","college"]`; `"College"` → `["college"]`; `"High School"` → `["high_school"]` | No | Yes | No |
| `employers` | `paid` | Opportunity | `compensation_type` | `true` → `paid`; `false` → `unpaid` as a default guess, then re-check individually since some `false`-flagged records' descriptions imply credit or stipend arrangements | `compensation_text` is entirely missing | Partial | Yes |
| `employers` | `lat` | Employer Location | `latitude` | Carry over as the initial location's coordinate; re-verify against a geocoded `address` (Section 6) since it was hand-entered, not geocoded | No | Yes (carry-over) / Partial (re-verify) | Yes |
| `employers` | `lng` | Employer Location | `longitude` | Same as `lat` | No | Yes / Partial | Yes |
| `employers` | `location` | Employer Location | `address` | Parse free text into a structured, validated address | Structured components (street/city/state/zip) are missing | Partial — well-formed addresses parse automatically; irregular ones (see Section 3 and 6) do not | Yes |
| `employers` | `description` | Employer | `description` | Human split of the single paragraph into an employer-level overview | Opportunity-level description does not exist separately today | No | Yes |
| `employers` | `description` | Opportunity | `description` | Human split of the same paragraph into opportunity-specific detail | Same as above | No | Yes |
| `employers` | `duration` | Opportunity | `seasonality` | Extract keywords (e.g., "Summer", "Semester", "Year-round") as a first pass | No | Partial | Yes |
| `employers` | `duration` | Opportunity | `starts_at` / `ends_at` | Convert explicit date ranges where stated; leave null where the text only describes a length (e.g., `"10 weeks"`) without calendar dates | Yes — exact calendar dates are not present for most records | No | Yes |
| `employers` | `deadline` | Opportunity | `application_open_at` / `application_close_at` | Parse structured dates out of free text (e.g., `"Applications open Nov 1, close Jan 31 each year"`); map vague phrasing (`"Rolling"`, `"Apply through your school"`) to `status: active` with a null close date rather than a fabricated one | Yes — roughly a third of records use vague, non-dated phrasing | Partial — `app.js`'s existing `deadlineSortKey()` regex can extract *some* dates as a first pass, but every value needs confirmation | Yes, all records |
| `employers` | `internshipUrl` | Opportunity | `application_url` | Direct copy/rename | No | Yes | Recommended, not required — spot-check reachability once (feeds Section 5) |
| `employers` | `requirements` | *(no target field exists)* | — | Pending product decision: fold into `Opportunity.description`, or propose a new field | Target schema has no home for this today | No | Yes |
| `employers` | `supplementals` | *(none — not in target schema)* | — | Do not migrate; confirm with product owner that essay-prompt data is intentionally dropped, consistent with "applications remain external" | N/A | Yes (exclude) | Yes — confirm the drop |
| `employers` | `programs[]` (each entry) | Opportunity | `title` | **Fan-out**: create one Opportunity row per array entry, referencing the deduplicated parent Employer | Per-program values for `type`/`grade`/`paid`/`deadline`/`duration` are not actually known — migration can only assume they match the parent record | Partial | Yes, for all 29 employers with more than one program |
| `employers` | `isFeatured` | Opportunity | `is_featured` | Direct copy onto each fanned-out Opportunity row for that employer | No | Yes | No — value already exists per-record; no selection rule, review date, or owner exists for *which* records are `true`, but the boolean itself carries over directly |

**Not present on `employers` at all, so not mappable from current data (see Section 5):** `Employer.slug`, `Employer.website_url`, `Employer.careers_url`, `Employer.status`, `Employer.last_verified_at`, `Employer.created_at`/`updated_at`; `Opportunity.work_mode`, `Opportunity.location_id`, `Opportunity.featured_until`, `Opportunity.source_id`, `Opportunity.source_last_seen_at`, `Opportunity.status`, `Opportunity.confidence_score`; `Employer Location.id`, `Employer Location.employer_id`, `Employer Location.label`, `Employer Location.is_opportunity_site`, `Employer Location.access_notes`, `Employer Location.status`.

**Update (`LIVE`):** `Opportunity.application_open_at`/`application_close_at`/`last_verified_at` are no longer entirely absent from current data. `employers` now carries `applicationOpenAt` (always `null`), `applicationCloseAt` (always `null`), and `dateVerificationStatus` (always `"unverified"`, the closest current-data proxy for `last_verified_at`/`status`), plus `applicationTiming` holding the audit's classification. These are a structured-date **foundation**, not populated migration values — every value is `null`/`"unverified"` on every current record, so the migration steps in Section 4 below ("Replacing text deadlines with structured dates") are unchanged and still required before any real timestamp is populated.

---

## 2. `industryColor` → *(no target entity)*

| Current dataset | Current field | Target entity | Target field | Required transformation | Missing data? | Automatable? | Human review required? |
|---|---|---|---|---|---|---|---|
| `industryColor` | object keys/values (e.g., `Healthcare: '#D32F2F'`) | *(none — styling utility, not a data entity)* | — | Retain as frontend/design-system configuration; optionally re-key to the new Industry vocabulary's identifiers instead of raw industry strings | N/A | N/A | Yes — decide whether color becomes a column on an Industry table or stays in frontend code |

---

## 3. `events` → Experience

| Current dataset | Current field | Target entity | Target field | Required transformation | Missing data? | Automatable? | Human review required? |
|---|---|---|---|---|---|---|---|
| `events` | `id` | Experience | `id` | Generate a new UUID; retain the legacy numeric `id` as a cross-reference so `rsvpData` (see Section 7) and any saved RSVPs can be remapped | Yes | Partial | Yes |
| `events` | `title` | Experience | `title` | Direct copy | No | Yes | No |
| `events` | `categories` | Experience | `categories` | Direct copy (already an array); map to a controlled vocabulary over time | No | Yes | Recommended, not required |
| `events` | `date` | Experience | `experience_type` | Determine `scheduled_event` vs. `recurring_space` from the text and the `recurring` flag together | No, but interpretation is required | No | Yes, for all 15 records |
| `events` | `date` | Experience | `starts_at` / `ends_at` | Parse explicit one-time dates (e.g., `"July 24–25, 2026 \| 7:30 PM"`) into structured timestamps | Yes — no structured value exists today | No | Yes |
| `events` | `date` | Experience | `recurrence_rule` | Convert recurring phrasing (e.g., `"First Wednesday of each month, 5–9 PM"`, `"Every Saturday, 10 AM–3 PM"`) into a structured recurrence rule | Yes | No | Yes |
| `events` | `location` | Experience | `location_name` | Split venue name out of the combined string (e.g., `"VyStar Ballpark, 301 A. Philip Randolph Blvd, Downtown"`) | Not split today | Partial | Yes |
| `events` | `location` | Experience | `address` | Split street address out of the same combined string | Not split today | Partial | Yes |
| `events` | *(none)* | Experience | `latitude` / `longitude` | Geocode the derived `address` (see Section 6) | Yes — no coordinates exist for any event today, which is why events never appear on the Employer Map | No | Yes |
| `events` | `price` | Experience | `price_text` | Direct copy/rename | No | Yes | No |
| `events` | `free` | Experience | `is_free` | Direct copy | No | Yes | No |
| `events` | `icon` | *(none — not in target schema)* | — | Drop | N/A | Yes | No |
| `events` | `color` | *(none — not in target schema)* | — | Drop (or retain as frontend styling keyed by category) | N/A | Yes | No |
| `events` | `description` | Experience | `description` | Direct copy | No | Yes | No |
| `events` | `link` | Experience | `external_url` | Rename | No | Yes | No |
| `events` | `recurring` | Experience | `experience_type` | Combined with `date` parsing above: `true` → contributes to `recurring_space`, `false` → contributes to `scheduled_event` | Feeds into the `date` row above | Partial | Yes |

**Not present on `events` at all, so not mappable from current data (see Section 5):** `transportation_notes`, `accessibility_notes`, `age_restrictions`, `source_id`, `last_verified_at`, `status`.

**Update (`LIVE`):** `events` now carries `experienceType` (`scheduled_event`, `recurring_space`, or `null` per the audit's split/evergreen flags), `startsAt`, `endsAt`, `recurrenceRule` (all `null`), and `dateVerificationStatus` (always `"unverified"`) as a structured-date foundation. This does not shortcut the parsing/splitting/geocoding work described in Section 3's table and Section 4 below — no date, time, or recurrence rule has actually been computed for any record.

---

## 4. `avatarColors` → *(no target entity)*

| Current dataset | Current field | Target entity | Target field | Required transformation | Missing data? | Automatable? | Human review required? |
|---|---|---|---|---|---|---|---|
| `avatarColors` | flat array of hex strings | *(none — styling utility, not a data entity)* | — | Retain as frontend configuration for avatar rendering | N/A | N/A | No |

---

## 5. `interns` → Profile

| Current dataset | Current field | Target entity | Target field | Required transformation | Missing data? | Automatable? | Human review required? |
|---|---|---|---|---|---|---|---|
| `interns` | `id` | Profile | `id` | Generate a new UUID; note the current `id` is never actually used as a join key in `app.js` today (RSVP/company matching is done by name string, not `id` — see `docs/data/current-data-dictionary.md`), so downstream joins must be rebuilt on the new key | Yes | Partial | Yes |
| `interns` | `name` | Profile | `display_name` | Direct copy | No | Yes | No |
| `interns` | `type` | Profile | `student_level` | Deterministic map: `"College"` → `college`; `"High School"` → `high_school` | No | Yes | No |
| `interns` | `type` | Profile | `is_minor` | Backfill `true` when `student_level = high_school` | Yes — no `is_minor` field exists today | Partial (mechanically simple) | Yes — this flag drives safety rules per `docs/governance/privacy-and-safety.md` and must not be auto-derived without policy sign-off |
| `interns` | `company` | Profile | `employer_id` | Resolve the free-text `company` string to the deduplicated Employer created in Section 1; string mismatches need manual resolution | Yes — the link is currently name-only, not guaranteed to resolve | Partial | Yes |
| `interns` | `email` | Profile | `email` | Copy value, but reclassify as private account data by default per `docs/governance/privacy-and-safety.md`; the current unconditional public display of this field (flagged in the data dictionary) must be fixed as part of migration, not carried forward | No value missing, but correct privacy handling is missing | Partial | Yes — mandatory |
| `interns` | `linkedin` | Profile | `linkedin_url` | Direct copy where present | Present on 15 of 18 records (nullable, not necessarily "missing") | Yes | No |
| `interns` | `school` | Profile | `school` | Direct copy | No | Yes | Recommended for minors — decide default visibility restriction |
| `interns` | `major` | Profile | `major_or_grade` | Rename/copy (already dual-purpose: holds either a college major or a grade string like `"11th Grade / Finance CTE"`) | No | Yes | No |
| `interns` | `interests` | Profile | `interests` | Direct copy | No | Yes | Optional — normalize to a controlled vocabulary |
| `interns` | `photo` | *(none — not in current target schema)* | — | Drop (all 18 current values are `null` anyway) | N/A | Yes | Yes, if photo upload becomes a real feature later — needs a storage/moderation plan first |

**Not present on `interns` at all, so not mappable from current data (see Section 5):** `user_id`, `visibility`, `guardian_consent_at` (consent timestamp), `moderation_status`, `other_contact_url`, `created_at`/`updated_at`/`deleted_at`.

---

## 6. `rsvpData` / `MY_NAME` → RSVP

| Current dataset | Current field | Target entity | Target field | Required transformation | Missing data? | Automatable? | Human review required? |
|---|---|---|---|---|---|---|---|
| `rsvpData` | object key (event `id`) | RSVP | `experience_id` | Resolve via the Experience ID crosswalk built in Section 3 | Depends on Section 3's crosswalk existing first | Partial | Yes |
| `rsvpData` | `Set` member (attendee name) | RSVP | `profile_id` | Resolve each name to a Profile via the Section-5 migration | Yes — name-based resolution, not ID-based | Partial | Yes |
| `rsvpData` | *(none)* | RSVP | `created_at` | No timestamp is tracked today; would need to default to the migration run date or be dropped | Yes | No | Yes |
| `data.js` | `MY_NAME` constant (`"You"`) | *(none)* | — | Not a data value — a placeholder demo label; do not migrate | N/A | Yes (exclude) | No |

**Recommendation:** exclude `rsvpData` from any real migration entirely. It resets on every page reload (it is not even persisted to `localStorage`), and `toggleRSVP()` (`app.js:127-139`) programmatically auto-seeds fabricated attendee names (`"Jordan Kim"`, `"Aaliyah Johnson"`, `"Simone Carter"`) into it as soon as any visitor RSVPs — these are demo filler, not real user actions, and must not be migrated as if they were genuine RSVPs. See Section 7.

---

## 7. Browser `localStorage` keys → Profile, Saved Opportunity

These are not declared in `data.js` — they are written and read by `app.js` directly, one browser at a time. There is no server-side copy to run a batch migration against.

| Current dataset | Current field | Target entity | Target field | Required transformation | Missing data? | Automatable? | Human review required? |
|---|---|---|---|---|---|---|---|
| `localStorage['workjax_profile']` | `.name`, `.type`, `.school`, `.major`, `.company`, `.interests`, `.linkedin` | Profile | Same mapping as the `interns` table above | Same field-by-field transformation as `interns`, but must run **client-side**, per browser, the next time that visitor opens the site with a real account — not as a centralized batch job | No `email`/`user_id` is collected by the current profile form at all | Partial (the import *code* is automatable; the *event* of running it is not — it only fires when that specific browser returns) | Yes — needs a UX flow ("import your saved profile") and a policy for browsers that never return (their data is simply never migrated) |
| `localStorage['workjax_saved']` | JSON array of legacy `employers[].id` values | Saved Opportunity | `SavedOpportunity(profile_id, opportunity_id, created_at)` | Resolve each legacy employer ID to the new Opportunity ID(s) created by the Section 1/2 fan-out, using the `external_id` cross-reference; requires the visitor to have (or create) an authenticated Profile first | No `created_at` timestamp exists client-side | Partial | Yes |
| `localStorage['workjax_my_linkedin']` | string (URL) | Profile | `linkedin_url` | None needed — per the data dictionary, this key is only ever *read* as a legacy fallback in `openProfileModal()` and is never written by current code; `workjax_profile.linkedin` is the authoritative value | N/A | Yes (exclude) | No |

---

## Dedicated Sections

### 1. Separating employer and opportunity records

Today, one `employers` record *is* one opportunity listing, so "separating" means: (a) deduplicating employer identity across records that are really the same organization, then (b) splitting the remaining fields into an Employer row (organization-level facts) and one-or-more Opportunity rows (listing-level facts).

Two concrete duplicates already exist in the current data and should drive the deduplication rule:

- **`id 23`** (`"Jacksonville Jaguars"`, location `"EverBank Stadium, 1 EverBank Stadium Drive, Jacksonville, FL"`, `paid: false`, programs `["Guest Experience Intern", "Marketing Intern", "Community Relations Intern", "Operations Intern"]`) and **`id 40`** (`"Jacksonville Jaguars"`, location `"1 TIAA Bank Field Dr, Jacksonville, FL 32202"`, `paid: false`, programs `["Marketing Internship", "Social Media Internship"]`) are the same employer at (functionally) the same stadium, entered twice under two different building-name eras, because the current model has no way to attach a second batch of programs to an existing employer record.
- **`id 3`** (`"JEA"`, `type: "Internship"`, location `"21 W Church St, Jacksonville, FL"`, `lat/lng 30.3275/-81.6622`) and **`id 31`** (`"JEA Skilled Craft Apprenticeship"`, `type: "Apprenticeship"`, identical location and identical `lat/lng`) are the same public utility, split into two employer records purely because the second offers a different `opportunity_type`.

**Migration approach:**
1. Group `employers` records by a normalized name (and, as a secondary signal, near-identical `lat`/`lng`) to surface candidate duplicates like the two pairs above.
2. For each group, a human confirms whether the records represent one employer or genuinely distinct organizations, and picks the canonical `name`/`logo`/`description`/`location` to carry onto the single resulting Employer row.
3. Every `programs[]` entry across all records in the confirmed group becomes its own Opportunity row referencing that one Employer.
4. Fields that are opportunity-specific (`type`, `grade`, `paid`, `duration`, `deadline`, `internshipUrl`, `requirements`, `industry`/`industryLabel`) move to the Opportunity rows; fields that are organization-specific (`name`, `logo`, `icon`, and the human-split portion of `description`) move to the Employer row.

This step cannot be safely automated end-to-end: name-similarity grouping can be automated as a first pass, but confirming "is this really the same employer" and re-splitting `description` requires human judgment (see the `employers.name` and `employers.description` rows in Section 1's table above).

### 2. Supporting multiple opportunities per employer

Today, an employer supports "multiple opportunities" only via the `programs[]` array, and every program under one employer is forced to share the parent record's `type`, `grade`, `paid`, `duration`, and `deadline` — even when that's implausible. For example, `id 13` ("Miller Electric Company") lists six programs (`"Construction Management Internship"`, `"Engineering Internship"`, `"IT Internship"`, `"Accounting Internship"`, `"Marketing Internship"`, `"Virtual Design & Construction Internship"`) that plausibly have different eligibility, deadlines, or durations in reality, but the data currently records only one `deadline` (`"Applications typically open in Spring, check mecojax.com"`) and one `duration` (`"12 weeks (Summer)"`) for all six.

**Migration approach:**
1. Fan out each `programs[]` string into its own Opportunity row, per the Section 1 table, initially inheriting the parent's `type`/`grade`/`paid`/`duration`/`deadline`/`industry` values as a starting placeholder.
2. Flag every fanned-out Opportunity with `status: review_required` (or an equivalent migration flag) so an operator knows these inherited values are unverified guesses, not confirmed per-program facts.
3. A human (ideally the employer or an ecosystem partner, per `docs/architecture/target-state.md`'s ingestion principles) reviews and corrects each Opportunity independently before it is trusted for filtering/search.

This affects 29 of the 38 current `employers` records (any record with more than one entry in `programs[]`).

### 3. Supporting multiple locations per employer

The current data has exactly one `location`/`lat`/`lng` per employer record, with no way to represent an employer operating at several sites. `id 7` (`"VyStar Credit Union"`) already demonstrates the problem directly: its `location` field is the placeholder string `"Multiple High School Campuses, Northeast FL"` — not a geocodable address at all — while the actual list of campuses (`"Bartram Trail, Clay, First Coast, Fleming Island, Fletcher, Mandarin, Ribault, Riverside, West Nassau, Yulee, and more"`) is buried inside the free-text `requirements` array instead of being structured location data.

**Migration approach:**
1. Create one Employer Location row per employer using the current `location`/`lat`/`lng` as the first (default) location, labeled generically (e.g., `"Primary"`) since `employers` has no `label` field today.
2. For employers whose `location` text or `requirements` text implies more than one site (VyStar's campus list is the clearest current example — no other record was found to have this pattern during this review), a human must manually extract each individual site into its own Employer Location row; this cannot be automated because the campus names are embedded in unstructured prose, not a list of addresses.
3. Until Section 6 geocoding is complete, newly split locations will need `latitude`/`longitude` populated for the first time — VyStar's campus locations have no coordinates anywhere in the current data to carry over.

### 4. Replacing text deadlines with structured dates

`employers.deadline` values fall into roughly three patterns today, each needing different handling:

- **Fully structured-in-text, parseable:** e.g., `id 1` (`"Applications open Nov 1, close Jan 31 each year"`), `id 28` (`"Applications open Dec 1, close Feb 15"`), `id 33` (`"Applications due Mar 20, 5 PM"`). These can plausibly be converted to `application_open_at`/`application_close_at` with a scripted first pass — `app.js`'s existing `deadlineSortKey()` (`app.js:490-501`) already contains a working month/day regex that could be reused as a starting point — but every extracted value still needs human confirmation of the year and recurrence behavior (e.g., "each year" implies the deadline recurs annually, which the target schema does not model as a repeating rule; each cycle needs its own dated row).
- **Explicitly rolling/undated:** e.g., `id 5` (`"Rolling"`), `id 16` (`"Rolling, sign up for build days anytime"`), `id 7` (`"Apply through your school"`). These should map to `status: active` with a null `application_close_at`, not a fabricated date. `deadlineSortKey()` already special-cases this by returning `10000` (sorts last) for unparseable strings, confirming the current code already treats these as fundamentally different from dated deadlines.
- **Vague/relative, not machine-parseable without a lookup:** e.g., `id 3` (`"Visit jea.com for current openings, deadlines vary"`), `id 9` (`"Rolling, check careers.ice.com for current openings"`). These require a human to either contact the employer for an actual date or explicitly mark the record `status: review_required`.

The same three-way split applies to `events.date` (see Section 3's table above): one-time events like `id 7` (`"July 24–25, 2026 \| 7:30 PM"`) are structurally similar to the first pattern, while recurring events like `id 6` (`"Every Saturday, 10 AM–3 PM"`) need a recurrence rule rather than a fixed date at all.

**No deadline or date field in the current dataset can drive automatic expiration as-is** — this is the same gap already identified in `docs/data/current-data-dictionary.md`'s "Fields needed for automatic expiration" section, restated here in migration terms: until this section's parsing/review work is done, `status: active` cannot be trusted to auto-flip to `expired`.

### 5. Adding source and verification fields

No record in `data.js` carries any provenance information today — there is no `source_id`, `source_url`, `source_type`, `last_verified_at`, `last_success_at`, or `confidence_score` anywhere in the dataset, and the target `Source` entity (`docs/data/data-model.md`) has no current-data counterpart at all.

The closest existing values are `employers.internshipUrl` and `events.link`, but these are **destination** URLs (where a user applies or gets more information), not **source** URLs (where WorkJax obtained or verified the listing) — the two must not be conflated when populating the Source entity.

**Migration approach:**
1. Create exactly one `Source` record with `source_type: manual`, `organization_name: "WorkJax prototype (original authoring)"`, and no `source_url`, to serve as the honest provenance for every record currently in `data.js`. This makes the current low-confidence, unverified status of the whole dataset explicit rather than silently implying automated verification that never happened.
2. Set every migrated Opportunity's and Experience's `source_id` to this one record, and leave `last_verified_at` null (or set it to the migration run date, clearly labeled as "migration date," not "content verified" date) until a real per-record verification pass occurs.
3. `internshipUrl`/`link` continue to populate `Opportunity.application_url`/`Experience.external_url` as already described in Sections 1 and 3 — they are not repurposed as source data.
4. Future, per-source `Source` records (with real `source_url`, `sync_frequency`, etc.) are only created once WorkJax begins ingesting from an actual employer feed or partner export, per `docs/operations/content-ingestion.md` — that is out of scope for this migration and is a separate `PROPOSED` capability.

### 6. Geocoding addresses

`employers.lat`/`lng` were hand-entered against `employers.location`, not produced by a geocoding provider (confirmed: no geocoding integration exists anywhere in `app.js`, `index.html`, or `data.js`). Before those coordinates can be trusted as `Employer Location.latitude`/`longitude` in the target model, the underlying `location` addresses should be geocoded and cross-checked against the hand-entered values to catch drift or error.

Several current `location` values will not geocode cleanly without manual correction first:

- `id 7` (`"Multiple High School Campuses, Northeast FL"`) — not a real address at all; see Section 3.
- `id 15` (`"14201 Pecan Park Rd, Jacksonville, FL 32218 (Jacksonville International Airport)"`) — trailing parenthetical may confuse a geocoder expecting a clean address string.
- `id 35` (`"Jacksonville, FL (US East Office)"`) — no street address, only a city and a parenthetical label.
- `id 37` (`"Downtown Jacksonville, FL"`) — a district name, not a specific street address.

`events.location` has no coordinates at all today (see Section 3's `events` table) and will need geocoding from scratch once the venue/address split described there is complete, so that Experience records can appear on the Employer Map for the first time.

**Migration approach:**
1. Run the well-formed `employers.location` strings (the majority of the 38 records) through a geocoding provider and compare results against the existing hand-entered `lat`/`lng`; large discrepancies get flagged for review rather than silently overwritten.
2. Manually resolve the four irregular addresses listed above (and any others surfaced during the run) to a real street address before geocoding, or explicitly mark them `status: review_required` if no single street address is applicable (e.g., VyStar's multi-campus case).
3. Repeat the same process for `events.location` once split into `location_name`/`address`, since no coordinates exist there today.

### 7. Migrating browser-only saves, RSVPs, and profiles

This category is structurally different from the rest of the migration: `workjax_profile`, `workjax_saved` (both `localStorage`), and `rsvpData` (in-page memory only) live **only inside each individual visitor's browser**. There is no server-side table to run a batch script against — a traditional "migrate all rows" job is not possible for this data.

**Migration approach:**
1. **Profiles (`workjax_profile`):** on first login after accounts exist, check the browser for this key; if present, offer the visitor an explicit "import your saved profile" step that pre-fills the new authenticated Profile with `.name`/`.type`/`.school`/`.major`/`.company`/`.interests`/`.linkedin`. Since the current form never collects `email`, that field must be collected fresh as part of account creation, not assumed from `localStorage`. Any browser that never returns after this feature ships simply never migrates its profile — this should be stated plainly to stakeholders as an accepted, unavoidable data loss for that segment of users, not a defect to "fix."
2. **Saved opportunities (`workjax_saved`):** the array holds legacy `employers[].id` values, which must first pass through the Section 1/2 employer/opportunity split so each legacy ID resolves to one or more new Opportunity IDs via the `external_id` cross-reference (Section 1's table). This import can only run once the visitor has (or creates) an authenticated Profile, for the same reason as above.
3. **RSVPs (`rsvpData`):** recommend **not** migrating this data at all. It already resets on every page reload (per `docs/architecture/current-state.md`, "RSVP behavior is temporary"), and `toggleRSVP()` (`app.js:127-139`) programmatically injects fabricated attendee names into it the first time any visitor RSVPs to certain events — that seeded data is demo filler, not a real signal of attendance, and treating it as migratable user data would misrepresent actual interest in an Experience. If a real RSVP feature launches, it should start from zero recorded RSVPs rather than attempting to carry forward anything from `rsvpData`.

---

## Change Log

| Date | Change | Author |
|---|---|---|
| 2026-07-13 | Initial migration map created from `data.js`, `app.js`, and `docs/data/data-model.md` | Claude (documentation task) |
| 2026-07-13 | Added `employers.isFeatured` → `Opportunity.is_featured` mapping; removed `is_featured` from the "not present" list now that the field exists in `data.js` | Claude (documentation task) |
| 2026-07-13 | Noted new structured-date foundation fields on `employers` and `events` (all `null`/`"unverified"`); clarified this is a schema foundation, not populated migration data | Claude (documentation task) |
