# Current-State Data Dictionary

**Status:** `LIVE` documentation of the current prototype's hard-coded data
**Source file documented:** `data.js`
**Cross-referenced against:** `app.js`, `index.html`, `docs/architecture/current-state.md`, `docs/data/data-model.md`
**Last reviewed:** 2026-07-13

## Purpose

This document is a field-by-field inventory of every dataset currently declared in `data.js`, how each field is actually consumed in `app.js`, and how each field maps to the `PROPOSED` target entities defined in [`docs/data/data-model.md`](data-model.md).

This is a **current-state** artifact. Nothing here is `PROPOSED` unless explicitly labeled. All values quoted as "example" are copied verbatim from `data.js`; nothing is invented.

---

## Dataset Summary

| Dataset | Purpose | Entity Represented |
|---|---|---|
| `employers` | Hard-coded list of employers offering opportunities | **More than one entity** — combines Employer, Opportunity, and Employer Location |
| `industryColor` | Style lookup: industry name → hex color | Not an entity — display/styling utility |
| `events` | Hard-coded Jacksonville events and recurring spaces (Experience Jax) | Experience (scheduled events and recurring spaces are not distinguished as separate types) |
| `avatarColors` | Style lookup: palette of hex colors for profile avatars | Not an entity — display/styling utility |
| `interns` | Hard-coded sample student profiles (Connect Jax) | Profile |
| `rsvpData` | Runtime, in-memory map of event ID → set of attendee names | RSVP (relationship between Profile and Experience) |

---

## 1. `employers`

**Purpose:** Powers Find Opportunities (listing, search, filter, sort, detail page) and the Employer Map. Each record currently represents one employer that offers one or more named programs.

**Used in `app.js`:** `renderHomeFeatured()`, `oppCardHTML()`, `renderOpportunities()`, `deadlineSortKey()`, `showDetail()`, `initMap()`, `focusEmployer()`, `getSearchMatches()`, `showSuggestions()`, `fillHomeCounts()`, and indirectly in `renderConnectJax()` via `companyColor()` (`app.js:180-183`), which looks up an employer by matching `intern.company` against `employer.name`.

**Entity represented:** **More than one entity.** This is the limitation documented in `docs/architecture/current-state.md` ("Employer and opportunity are combined"). A single `employers` record mixes:
- Employer-level fields (`name`, `icon`, `logo`, `location`, `lat`/`lng`, `description`)
- Opportunity-level fields (`industry`, `type`, `grade`, `paid`, `duration`, `deadline`, `internshipUrl`, `requirements`, `supplementals`, `programs`)
- Employer-Location fields (`lat`, `lng`, `location`) with no separate location record

### Field table

| Field | Type | Example (from `data.js`) | Used / displayed | Target entity | Recommendation | Missing / ambiguous | Human review required |
|---|---|---|---|---|---|---|---|
| `id` | number | `1` | Primary key for lookups: `showDetail()`, `focusEmployer()`, `toggleSaveOpportunity()`, map markers, saved-opportunity `Set` (`app.js:659-662`) | Opportunity.id (and implicitly Employer.id, undifferentiated) | Split | Currently one ID serves both the employer and the "opportunity" (the whole record). IDs are non-contiguous (11, 12, and 38 do not exist in the 38 records present), suggesting past deletions with no audit trail. | Yes |
| `name` | string | `"Mayo Clinic Florida"` | Card/detail employer name, map popups/sidebar, search, and matched by exact string equality against `interns[].company` in `companyColor()` | Employer.name | Keep (move to Employer) | The Employer↔Profile relationship is joined by matching this free-text string against `interns.company`, not by ID. A rename or typo in either dataset silently breaks the join. | Yes |
| `icon` | string (Font Awesome class) | `"fa-solid fa-hospital"` | Fallback icon in `empIcon()`/`empLogo()` (`data.js:553-571`) when `logo` fails to load; used in cards, detail, map markers, search suggestions | Not present in target Employer schema | Replace | Target model has `logo_url` only; no fallback-icon field is defined. Decision needed on whether a fallback icon asset is a permanent UI need. | Yes |
| `logo` | string (URL) | `"https://www.google.com/s2/favicons?domain=mayoclinic.org&sz=256"` | `empLogo()` image `src` across cards, detail, map | Employer.`logo_url` | Rename | Values are auto-generated third-party favicon URLs, not an "approved logo source" as the target model specifies. | Yes |
| `industry` | string (single value) | `"Healthcare"` | Industry filter (`app.js:417-424`), `industryColor` lookup, search (`app.js:437`), detail "About" sentence (`app.js:565`), map marker color, home industry counts (`fillHomeCounts()`) | Employer.industries (target allows multiple) and/or Opportunity.industries | Split / move | Every record has exactly one industry; the target model allows an employer or opportunity to belong to multiple industries. No record currently uses more than one. | Yes |
| `industryLabel` | string (optional) | `"Engineering/Construction"` (id 13) | Overrides the industry tag text when present: `e.industryLabel \|\| e.industry` (`app.js:369`, `521`) | Not present in target schema | Replace | Present on only 7 of 38 records (13, 31, 32, 34, 39, 40, 41). Functions as an ad-hoc display override rather than a controlled subcategory vocabulary. | Yes |
| `type` | string | `"Internship"` | Type filter (`app.js:405-413`), tags on card/detail, "About" sentence, map popup | Opportunity.opportunity_types (target: array) | Move | Current values: `Internship`, `Co-op`, `Fellowship`, `Job Shadow`, `Volunteer`, `Apprenticeship`. One value per record; target model allows multiple types per opportunity. | Yes |
| `grade` | string enum | `"College"` | Student-level filter (`app.js:397-402`), tag text (`"HS + College"` when `Both`), detail sidebar, home counts (`count-hs`/`count-col`/`count-both`) | Opportunity.student_levels (target: array) | Move / rename | Values used: `College`, `High School`, `Both`. `"Both"` is a sentinel string rather than an actual two-value array. | Yes |
| `paid` | boolean | `true` | Compensation filter (`app.js:428-431`, `445-448`), tag `Paid`/`Unpaid`, detail sidebar Compensation row | Opportunity.compensation_type (target enum: paid, unpaid, credit, stipend, unknown) | Replace | A boolean cannot represent `credit`, `stipend`, or `unknown`. Several employer descriptions reference credit-bearing or unpaid arrangements in free text (e.g., Baptist Health) that the boolean does not capture. | Yes |
| `lat` / `lng` | number | `30.2645` / `-81.4423` | Map marker placement and `focusEmployer()` view centering | Employer Location.latitude / longitude | Move | Manually hand-entered, not generated by a geocoding service. See "Fields needed for geocoding" below. | Yes |
| `location` | string (free text) | `"4500 San Pablo Rd, Jacksonville, FL"` | Detail sidebar address, opportunity card city/state (parsed via `e.location.split(',').slice(1)...`, `app.js:375`), map sidebar card | Employer Location.address | Move / split | Not decomposed into street/city/state/zip. `oppCardHTML()` derives a partial address by splitting on commas, which is fragile against inconsistent formatting (one record embeds a parenthetical, e.g. id 15: `"...FL 32218 (Jacksonville International Airport)"`). | Yes |
| `description` | string (long text) | Mayo Clinic paragraph (`data.js:11`) | Detail page description (`app.js:526`) | Ambiguous — Employer.description or Opportunity.description both exist in the target model | Split | Content blends employer overview and opportunity-specific detail in one field; there is no way today to tell which sentences belong to the employer vs. the specific program. | Yes |
| `duration` | string (free text) | `"10 weeks (late May – late July)"` | Opportunity card meta, detail sidebar Duration row | No direct target field — closest is Opportunity.starts_at/ends_at + seasonality | Replace | Unstructured date field. Mixes length, season, and sometimes month ranges in one string. | Yes |
| `deadline` | string (free text) | `"Applications open Nov 1, close Jan 31 each year"` | Opportunity card, detail sidebar (styled), and parsed by `deadlineSortKey()` (`app.js:490-501`) with a regex to support "sort by deadline" | Opportunity.application_open_at / application_close_at (structured timestamps) | Replace | The primary unstructured date field in the dataset. `deadlineSortKey()`'s month/day regex is a workaround for the lack of structured dates and silently returns `10000` (sorts last) for any string it cannot parse, e.g. `"Rolling"` or `"Apply through your school"`. | Yes |
| `internshipUrl` | string (URL) | Mayo Clinic jobs link (`data.js:14`) | Detail sidebar "Apply Directly" link (`app.js:549-554`) | Opportunity.application_url | Rename | Present on all 38 records. | No |
| `requirements` | array of strings | `["GPA 3.0+", "Pre-med, biology, or related field", "U.S. citizen or permanent resident"]` | Detail page "Requirements" list (`app.js:530`) | No direct field in target Opportunity schema | Move / replace | Target model has no explicit `requirements` field; closest fit is folding into `description` or adding a new field. Needs a product decision. | Yes |
| `supplementals` | array of `{ q: string }` | Essay-prompt objects (`data.js:16-19`) | **Not rendered anywhere.** Confirmed absent from `app.js` and `index.html`. | Not present in target schema | Remove | Present on 11 of 38 records but never displayed to a user. Also arguably out of scope: WorkJax's stated rule is that "Applications must remain on official employer websites," so embedded essay prompts sit outside the platform's intended function. Every visitor's browser downloads this dead data today. | Yes |
| `programs` | array of strings | `["Summer Research Fellowship", "Clinical Shadowing Program"]` | Card title (`programs[0]`), detail `<h1>` and "Available Programs" list, map popup, search matching and suggestions, and used to compute the home-page "opportunity count" stat (`fillHomeCounts()` sums `programs.length` across all employers) | Opportunity.title (each entry should become its own Opportunity record) | Split | **This is the clearest evidence of the employer/opportunity combination problem.** 29 of 38 employer records list more than one program, yet every program under a given employer shares the same `type`, `grade`, `paid`, `duration`, and `deadline` — even though in reality distinct programs at the same employer plausibly differ on some of these. | Yes |

---

## 2. `industryColor` (and helpers `empIcon()`, `empLogo()`)

**Purpose:** Not a data entity — a display utility. Maps each of the 8 industry values used in `employers` to a hex color for tags, map markers, and Connect Jax company badges.

**Used in `app.js`:** `companyColor()` (`app.js:180-183`), map marker styling (`initMap()`), and directly inside `data.js`'s own `empIcon()`/`empLogo()` helpers (`data.js:553-571`), which those app.js render functions call.

**Entity represented:** None — presentation/styling data, not a product entity.

**Field table:** N/A (single hard-coded object literal, not a list of records). Keys: `Healthcare`, `Finance`, `Engineering`, `Government`, `Nonprofit`, `Technology`, `Logistics`, `Media` — this set matches the 8 distinct `industry` values actually present in `employers` today. **Recommendation:** if `industry` becomes a controlled vocabulary/relationship in the target Industry entity, this color map should move with it rather than remaining a standalone object keyed by string.

---

## 3. `events`

**Purpose:** Powers Experience Jax (event/experience directory and RSVPs).

**Used in `app.js`:** `filterEvents()`, `renderEvents()`, `toggleRSVP()`.

**Entity represented:** Experience. Per `docs/features/experience-jax.md`, "Scheduled Event" and "Recurring Space" must remain distinct types because their expiration/recurrence behavior differs — the current data does not model this distinction beyond a single boolean (`recurring`).

### Field table

| Field | Type | Example | Used / displayed | Target entity | Recommendation | Missing / ambiguous | Human review required |
|---|---|---|---|---|---|---|---|
| `id` | number | `2` | Keys `rsvpData` (`rsvpData[e.id]`), DOM element ID, `toggleRSVP(e.id)` | Experience.id | Keep | None | No |
| `title` | string | `"First Wednesday Art Walk"` | Card title | Experience.title | Keep | None | No |
| `categories` | array of strings | `["Arts & Culture", "Food & Market"]` | Filter matching (`app.js:56-59`), tag display | Experience.categories | Keep | Already a controlled-ish array; no defined master category list exists outside the filter buttons in `index.html`. | Yes |
| `date` | string (free text) | `"First Wednesday of each month, 5–9 PM \| Next: Aug 5"` | Card meta row | Experience.starts_at / ends_at / recurrence_rule (structured) | Replace | **Unstructured date field.** Mixes a recurrence description and a "next occurrence" hint in one string with no machine-readable date. Cannot drive automatic expiration or sorting. | Yes |
| `location` | string (free text) | `"James Weldon Johnson Park & Downtown Corridors, Jacksonville"` | Card meta row | Experience.location_name / address | Split | Not decomposed into venue vs. address; no `latitude`/`longitude`, so events cannot appear on the Employer Map even though the target model gives Experience its own coordinates. | Yes |
| `price` | string (free text) | `"Free"`, `"From $10"` | Card footer price | Experience.price_text | Keep (rename) | None | No |
| `free` | boolean | `true` | Filter (`"Free"` chip), styling, tag | Experience.is_free | Keep | None | No |
| `icon` | string (Font Awesome class) | `"fa-solid fa-paintbrush"` | Tag icon | Not present in target Experience schema | Replace | Same fallback-icon pattern as `employers.icon`. | Yes |
| `color` | string (hex) | `"#6A1B9A"` | Card banner background, tag color | Not present in target Experience schema | Replace | Presentation-only; not part of the target data model. | No |
| `description` | string | Art Walk paragraph | Card description | Experience.description | Keep | None | No |
| `link` | string (URL) | `"https://www.visitjacksonville.com/events/downtown-first-wednesday-art-walk/"` | "Learn more" link | Experience.external_url | Rename | None | No |
| `recurring` | boolean | `true` | "Recurring" tag | Experience.experience_type (target enum: `scheduled_event`, `recurring_space`) | Replace | A boolean collapses the target model's two-value enum into one bit and loses the recurrence rule itself. | Yes |

**Not present on any `events` record but required by `docs/features/experience-jax.md`:** `transportation_notes`, `accessibility_notes`, `age_restrictions`, official source attribution, `last_verified_at`, `status`. See "Fields described in documentation but not implemented in code" below.

---

## 4. `avatarColors` (and helpers `avatarColor()`, `initials()`)

**Purpose:** Not a data entity — a display utility. A fixed palette of 10 hex colors; `avatarColor(name)` hashes a person's name to deterministically pick one for their avatar background in Connect Jax and event RSVP avatars.

**Used in `app.js`:** `renderConnectJax()` (`app.js:186`), `renderEvents()` (`app.js:78`).

**Entity represented:** None — presentation/styling data.

**Field table:** N/A (flat array of hex strings). No recommendation needed unless avatar styling is redesigned.

---

## 5. `interns`

**Purpose:** Sample/demo student profiles that populate the Connect Jax directory. Per `docs/features/connect-jax.md`, Connect Jax is currently `DEMO ONLY`.

**Used in `app.js`:** `renderConnectJax()` (`app.js:144-219`), and matched by name (not ID) inside `renderEvents()` to render RSVP avatars (`app.js:77`).

**Entity represented:** Profile.

### Field table

| Field | Type | Example (from `data.js`) | Used / displayed | Target entity | Recommendation | Missing / ambiguous | Human review required |
|---|---|---|---|---|---|---|---|
| `id` | number | `1` | **Not used anywhere in `app.js`.** RSVP-to-profile matching is done by `interns.find(i => i.name === name)` (`app.js:77`), by name, not `id`. | Profile.id | Keep, and start using it | Two interns with the same display name would collide in `renderEvents()`'s RSVP avatar lookup today — the join key should be `id`, not `name`. | Yes |
| `name` | string | `"Aaliyah Johnson"` | Card name, search match, avatar initials/color, and the RSVP name-matching join described above | Profile.display_name | Rename | Used as a de facto foreign key in `renderEvents()` (see `id` row). | Yes |
| `type` | string enum | `"College"` | Type filter, distinguishes high-school vs. college students | Profile.student_level | Rename | Only two values appear (`College`, `High School`); target model adds a third (`other`). No `is_minor` flag exists even though `type: "High School"` implies a minor — see Privacy/Safety callout below. | Yes |
| `company` | string (free text) | `"UF Health Jacksonville"` | Card company badge, colored via `companyColor()` by matching this string against `employers.name` | Profile.employer_id (target: UUID relationship) | Replace | Free-text string matched by exact equality against `employers.name`, not a foreign key. A typo or employer rename silently breaks the badge color and the implied employer link. | Yes |
| `email` | string | `"aaliyah.j@ufhealth.edu"` | **Displayed directly and unconditionally in the Connect Jax card** (`app.js:203`, `intern.email` rendered in `.intern-email`) | Profile.email (target: "Private account/contact field by default") | Replace | **Privacy conflict:** every sample profile's email — including high-school students' school-issued addresses (e.g., `d.williams@student.duvalschools.org`) — is rendered publicly in the directory. This directly contradicts `docs/governance/privacy-and-safety.md` ("Prohibited public data: ... private contact details for minors") and `docs/features/connect-jax.md` ("The product should not publicly expose a required email address by default"). This applies to the current demo data as displayed, not real users, but the rendering pattern itself would need to change before real profiles launch. | Yes |
| `linkedin` | string (URL, optional) | `"https://www.linkedin.com/in/aaliyah-johnson"` | "View LinkedIn" button when present, "Private Profile" disabled state when absent (`app.js:207-216`) | Profile.linkedin_url | Keep | Present on 15 of 18 records; the 3 without it are all `type: "High School"` records, consistent with the documented recommendation to restrict external links for minors — though this is not enforced by any code rule, only by which sample rows happen to include it. | No |
| `school` | string | `"University of Florida"` | Card subtitle, search match | Profile.school | Keep | None | No |
| `major` | string | `"Nursing"` | Card subtitle (joined with `school`) | Profile.major_or_grade | Rename | For high-school records this field holds a grade/program string instead of an academic major (e.g., `"11th Grade / Finance CTE"`), which matches the target field's dual purpose (`major_or_grade`) but should be confirmed. | No |
| `interests` | array of strings | `["Healthcare", "Community Health", "Volleyball", "Photography"]` | Interest pills, search match | Profile.interests | Keep | No controlled vocabulary; free text per record. | Yes |
| `photo` | value | `null` on all 18 records | Conditionally renders an `<img>` if truthy, else falls back to initials avatar (`app.js:188-190`) | Not present in target Profile schema | Replace / add | Field exists in every record but is never populated — currently dead. No photo field exists in the target Profile schema either; if photo upload becomes a real feature, this needs a documented storage and moderation plan. | Yes |

**Not present on any `interns` record but required by `docs/features/connect-jax.md` and the target Profile schema:** `visibility`, consent timestamp, `moderation_status`, `is_minor`, `guardian_consent_at`, `other_contact_url`, `created_at`/`updated_at`/`deleted_at`. See "Fields described in documentation but not implemented in code" below.

---

## 6. `rsvpData` and `MY_NAME`

**Purpose:** `rsvpData` is a runtime, in-memory JavaScript object (`{}` initially, declared `data.js:950`) mapping an event ID to a `Set` of attendee names. `MY_NAME` (`data.js:951`) is the fallback display name (`"You"`) for the demo logged-in user when no profile has been created.

**Used in `app.js`:** `renderEvents()` reads it; `toggleRSVP()` (`app.js:127-139`) writes to it, including hard-coded logic that auto-seeds two demo names as "already going" the first time any user RSVPs to certain events (`eventId % 3 === 0` adds `"Jordan Kim"` and `"Aaliyah Johnson"`; `eventId % 3 === 1` adds `"Simone Carter"`).

**Entity represented:** RSVP (relationship between Profile and Experience).

**Status:** `DEMO ONLY`. This object is never persisted — it lives only in page memory and resets on reload, matching `docs/architecture/current-state.md`'s documented limitation ("RSVP behavior is temporary"). It is not stored in `localStorage` at all, unlike the profile and saved-opportunities data below.

**Field table:** N/A — not a record structure, a single keyed collection of name strings. **Recommendation:** replace with a real `RSVP` table (`profile_id`, `experience_id`, `created_at`) per the target data model; also remove the hard-coded demo-name auto-seeding logic, which is presentation filler rather than real data and would misrepresent actual attendance if left in place during any real launch.

---

## Browser-only data (not declared in `data.js`, but essential to this inventory)

Per the explicit instruction to identify browser-only profile, save, and RSVP data: the following exist only in the visitor's own browser, are never shared across devices or users, and are **not** present in `data.js` as hard-coded records — they are created and read entirely by `app.js` via `localStorage`.

| `localStorage` key | Written / read by | Shape | Notes |
|---|---|---|---|
| `workjax_profile` | `saveProfile()`, `getProfile()`, `removeProfile()` (`app.js:228-320`) | `{ name, type, school, major, company, interests: string[], linkedin }` | The user-created profile. Note it has **no `email` field at all** — the creation form (`openProfileModal()`, `app.js:251-290`) never collects one, which is inconsistent with the hard-coded `interns` records that all carry an email. Device-specific; not shared. Matches `docs/architecture/current-state.md` ("Profiles are not actually public or shared"). |
| `workjax_saved` | `toggleSaveOpportunity()` (`app.js:383-389`) | JSON array of `employers[].id` values | Saved-opportunity IDs. Device-specific. Matches "Saved opportunities: Stored only in the visitor's browser / `DEMO ONLY`" in `docs/architecture/current-state.md`. |
| `workjax_my_linkedin` | Read (legacy fallback) in `openProfileModal()` (`app.js:253`) | string (URL) | Appears to be a leftover key from a prior profile-storage format; current writes always go through `workjax_profile.linkedin` (`saveProfile()`), so this key is only ever read, never written, by the current code. Flag for cleanup decision. |

RSVP data (`rsvpData`, described above) is also browser-only, but lives in page memory rather than `localStorage`, so it does not even survive a page reload — a stricter form of "browser-only" than the profile/save data.

---

## Explicit Callouts

### Where employer and opportunity data are combined

The entire `employers` array. Every record couples Employer attributes (`name`, `logo`, `icon`, `location`, `lat`/`lng`, `description`) with Opportunity attributes (`industry`, `type`, `grade`, `paid`, `duration`, `deadline`, `internshipUrl`, `requirements`, `supplementals`) on one object. The `programs` array (see field table above) is the strongest evidence: 29 of 38 employers list multiple programs, but all programs under one employer are forced to share a single `type`, `grade`, `paid`, `duration`, and `deadline`, even though in reality they are likely to differ. This is the exact limitation already documented in `docs/architecture/current-state.md` ("Employer and opportunity are combined") and is the reason `docs/data/data-model.md` proposes separate `Employer` and `Opportunity` entities.

### Unstructured date fields

- `employers.deadline` (e.g., `"Applications open Nov 1, close Jan 31 each year"`, `"Rolling"`, `"Apply through your school"`) — parsed at runtime by a best-effort regex in `deadlineSortKey()` (`app.js:492-501`) for sort ordering only; cannot support automatic expiration.
- `employers.duration` (e.g., `"10 weeks (late May – late July)"`) — free text, not split into `starts_at`/`ends_at`.
- `events.date` (e.g., `"First Wednesday of each month, 5–9 PM \| Next: Aug 5"`) — mixes a recurrence description and a "next occurrence" hint in one string; not machine-readable.

### Fields needed for automatic expiration

None currently exist. `docs/architecture/current-state.md` already states this directly: "Deadline text is displayed, but listings do not automatically deactivate" and "Events do not automatically disappear based on a structured end date." To support the `PROPOSED` expiration logic in `docs/operations/content-ingestion.md`, the target model's `application_close_at`, `starts_at`/`ends_at` (Opportunity and Experience), and `status` fields would all need to be added — none are present on `employers` or `events` today.

### Fields needed for source verification

None currently exist on any dataset. There is no `source_id`, `source_url`, `source_type`, `last_verified_at`, `last_success_at`, or `confidence_score` anywhere in `data.js`. `employers.internshipUrl` and `events.link` point to an external destination (application page / event info page) but do not record where WorkJax itself got the record from or when it was last confirmed accurate. The entire `Source Registry` entity described in `docs/data/data-model.md` has no counterpart in the current data at all.

### Fields needed for geocoding

`employers.lat`/`employers.lng` are hand-entered numeric values, not generated from `employers.location` by a geocoding provider — there is no geocoding integration in the current prototype (confirmed: no such service is referenced in `app.js`, `index.html`, or `data.js`). `events` has no `lat`/`lng`/coordinates at all, which is why events never appear on the Employer Map even though the target `Experience` entity defines its own `latitude`/`longitude` fields.

### Browser-only profile, save, and RSVP data

Covered in full in the "Browser-only data" section above: `workjax_profile`, `workjax_saved` (both `localStorage`), and `rsvpData` (in-memory only, not even `localStorage`).

### Fields described in documentation but not implemented in code

Cross-referencing `docs/data/data-model.md` against every field actually present in `data.js`:

**Employer** — missing: `id` (UUID vs. current integer), `slug`, `website_url`, `careers_url`, `status`, `last_verified_at`, `created_at`, `updated_at`.

**Employer Location** — the entity does not exist at all as a separate structure. Missing: `id`, `employer_id`, `label`, structured `address`, `is_opportunity_site`, `access_notes`, `status`.

**Opportunity** — missing: `id` (UUID), `external_id`, `opportunity_types` as an array/relationship, `student_levels` as an array, `seasonality`, `work_mode`, `location_id`, `compensation_type` enum (only a `paid` boolean exists), `compensation_text`, `application_open_at`, `application_close_at`, `starts_at`, `ends_at`, `is_featured`, `featured_until`, `source_id`, `source_last_seen_at`, `last_verified_at`, `status`, `confidence_score`. Note: `docs/architecture/current-state.md` already flags "Featured opportunities are positional" — confirmed: `renderHomeFeatured()` (`app.js:343-348`) simply takes `employers.slice(0, 6)`, with no `is_featured` field anywhere.

**Experience** (`events`) — missing: `id` (UUID), `experience_type` enum, structured `starts_at`/`ends_at`, `recurrence_rule`, `location_name` vs. `address` split, `latitude`/`longitude`, `transportation_notes`, `accessibility_notes`, `age_restrictions`, `source_id`, `last_verified_at`, `status`.

**Profile** (`interns`) — missing: `id` as UUID / actual foreign key usage, `user_id`, `visibility`, `is_minor`, `guardian_consent_at`, `other_contact_url`, `moderation_status`, `created_at`, `updated_at`, `deleted_at`. (`email` and `employer_id`-style `company` exist but do not match the target's privacy handling or relationship structure — see field table above.)

**Source Registry** — the entire entity is absent; no source-tracking data of any kind exists in `data.js`.

**Supporting entities** (`Industry`, `SavedOpportunity`, `RSVP`, `Report`, `ModerationAction`, `AuditLog`, `SourceSyncRun`, `AdminUser`) — none exist as data structures. The closest approximations today are: `industryColor`'s object keys (informal Industry list), `workjax_saved` in `localStorage` (informal SavedOpportunity), and `rsvpData` in memory (informal RSVP). `Report`, `ModerationAction`, `AuditLog`, `SourceSyncRun`, and `AdminUser` have no equivalent anywhere in the current prototype.

---

## Change Log

| Date | Change | Author |
|---|---|---|
| 2026-07-13 | Initial data dictionary created from `data.js` and `app.js` | Claude (documentation task) |
