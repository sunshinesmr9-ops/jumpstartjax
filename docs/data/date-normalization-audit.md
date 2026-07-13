# Date Normalization Audit

**Status:** `LIVE` documentation — this is an analysis of the current prototype's actual text. All recommended structured values described below are `PROPOSED`; none exist in `data.js` today.
**Source file documented:** `data.js` (`employers` array, `events` array)
**Cross-referenced against:** `docs/data/current-data-dictionary.md`, `docs/data/data-model.md`, `docs/data/migration-map.md`, `docs/architecture/current-state.md`, `docs/features/opportunities.md`, `docs/features/experience-jax.md`
**Website code reviewed but not modified:** `data.js`, `app.js`, `index.html`, `styles.css`
**Audit date:** 2026-07-13

## Purpose

Before `application_open_at`, `application_close_at`, `starts_at`, `ends_at`, `recurrence_rule`, or any automatic-expiration logic is implemented (per `docs/architecture/target-state.md` and `docs/data/data-model.md`), every current deadline, duration, event date, and recurrence value in `data.js` needs to be reviewed record-by-record. This document is that review. It does not change any data or code — it is the input to a future, separately-approved migration.

## Implementation Status (`LIVE`)

The recommendations in this audit have since been carried into `data.js` and `app.js` as a structured-date **foundation**, with no values invented and no automatic expiration enabled:

- Every `employers` record now has `applicationTiming` (the `applicationTiming` column below, copied verbatim), `applicationOpenAt` (`null`), `applicationCloseAt` (`null`), and `dateVerificationStatus` (`"unverified"`).
- Every `events` record now has `experienceType` (the recommended value below where the audit clearly recommends `scheduled_event` or `recurring_space`; `null` where the audit flags a needed split or an evergreen/standing activity — see records 5, 7, 9, 10, 11, 13), `startsAt`/`endsAt`/`recurrenceRule` (`null`), and `dateVerificationStatus` (`"unverified"`). Cody Johnson Live '26 (id 7) and The Music of David Bowie (Symphonic) (id 14) were **not** given date values, consistent with this audit's finding that their source verification is still incomplete.
- `isOpportunityActive(record)` and `isEventActive(record)` now exist in `app.js` and are used when rendering homepage featured opportunities, opportunity search results, and Experience Jax events. Both only exclude a record when `dateVerificationStatus === "verified"` and the relevant close/end timestamp is in the past — so, consistent with this audit's conclusion that no record is verified enough for automatic expiration, every current record remains visible and no counts changed.
- This audit's underlying findings (missing years, employer duplicates, hidden deadlines, records needing a split, etc.) are unchanged and still require the human review and source verification described below before any real timestamp is populated.

## Method and Ground Rules

1. No year, month, day, time, or timezone is ever guessed. Where the source text does not state something, the recommended structured value is `null`.
2. All deadline/date text quoted below is copied verbatim from `data.js`, including punctuation and capitalization.
3. Vague seasonal language ("typically opens in Spring") is never converted into an invented exact date.
4. A recurring experience whose displayed "Next" occurrence date has passed is **not** treated as expired — that display hint going stale is a separate, flagged problem (see "Next-date staleness" below), not evidence the series itself has ended.
5. `America/New_York` is used as the *intended* timezone per WorkJax's Jacksonville focus, but it is only attached to a recommended value when a clock time is already present in the source text. No time is invented where none exists.

## Controlled Vocabularies Used Below

**Deadline classification** (employer records) — exactly one of:

| Value | Meaning |
|---|---|
| `fixed` | An exact month/day (and sometimes time) is stated for the opening and/or closing of the window. |
| `rolling` | The source text explicitly says the opportunity has no closing date (e.g. "Rolling," "anytime," "year-round"). |
| `seasonal` | Only a named season or an approximate month-range is given ("typically opens in Spring"), with no exact day. |
| `unknown` | No timing information exists at all beyond a link to check the employer's own site. |

**Recommended `applicationTiming` value** — a finer-grained tag for the same four buckets, to carry into a future structured field:

| Value | Maps to classification | Meaning |
|---|---|---|
| `fixed_dated` | `fixed` | Exact month/day is stated but not framed as annually repeating in the source text. |
| `annual_recurring` | `fixed` | Exact month/day is stated **and** the text explicitly says the window repeats "each year." |
| `seasonal_window` | `seasonal` | Named season/month-range only. |
| `rolling` | `rolling` | No close date exists. |
| `unknown` | `unknown` | No timing signal at all. |

**Standard caveats by bucket** (referenced from every row instead of repeating in each `Notes` cell):

- **`rolling` records:** No close date exists in the source text. Automatic expiration is *not applicable* — these should remain listed indefinitely, safe only to the extent the source is periodically re-verified (there is no re-verification mechanism today; see `docs/data/current-data-dictionary.md`, "Fields needed for source verification").
- **`seasonal` records:** Only an approximate season/month-range is named; there is no exact day to compute a close date from, so automatic expiration is not safe.
- **`unknown` records:** No timing information exists beyond a link to check the employer's own site; automatic expiration is not safe and nothing can be automated at all for these records without new source data.
- **`fixed` records:** A month/day pattern (and, for one record, a time) is stated, but **no record in the entire dataset states an explicit year** — see Key Risk 1 below. Automatic expiration is not safe until a year is confirmed against the live source.

A "No\*" in the Exact Opening/Closing Date columns below means: *month/day (and time, if given) is known, but the year is not stated anywhere in the record.*

---

## Part 1 — Employer / Opportunity Records (`employers`)

**Total records found: 38** (ids 1–10, 13–37, 39–41; ids 11, 12, and 38 do not exist in `data.js` — a pre-existing gap, not introduced by this audit).

| ID | Employer | Programs | Deadline text (verbatim) | Duration text (verbatim) | Classification | Explicit year? | Exact open date known? | Exact close date known? | Auto-expire safe now? | `applicationOpenAt` | `applicationCloseAt` | `applicationTiming` | Source verify needed? | Human review needed? | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Mayo Clinic Florida | Summer Research Fellowship; Clinical Shadowing Program | "Applications open Nov 1, close Jan 31 each year" | "10 weeks (late May – late July)" | fixed | No | No\* | No\* | No | null | null | annual_recurring | Yes | Yes | — |
| 2 | Fidelity Investments | Technology Co-op; Finance Analyst Track | "Applications open each Fall for the following summer" | "6 months (Co-op) or 10 weeks (Summer Internship)" | seasonal | No | No | No | No | null | null | seasonal_window | Yes | Yes | Two programs (Co-op vs. Summer Internship) plausibly have different real deadlines but share one field. |
| 3 | JEA | Engineering Intern; IT & Cybersecurity Intern | "Visit jea.com for current openings, deadlines vary" | "Summer (length varies by role)" | unknown | No | No | No | No | null | null | unknown | Yes | Yes | Same employer/address/coordinates as id 31 (JEA Skilled Craft Apprenticeship) — likely a duplicate employer record per `migration-map.md` §1; resolve identity before consolidating deadlines. |
| 4 | City of Jacksonville | Mayor's Civic Innovation Fellowship; Public Works Internship | "Rolling, visit jacksonville.gov for current postings" | "Summer (8–10 weeks, varies by department)" | rolling | No | N/A | No | Not applicable | null | null | rolling | Yes | Yes | — |
| 5 | Nemours Children's Health | Healthcare Explorer Program | "Rolling" | "2 weeks (Winter Break / Summer)" | rolling | No | N/A | No | Not applicable | null | null | rolling | Yes | Yes | — |
| 6 | CSX Transportation | Engineering Internship; Supply Chain & Logistics Intern | "Applications typically open September – October each year" | "10 weeks (May – July)" | seasonal | No | No | No | No | null | null | seasonal_window | Yes | Yes | — |
| 7 | VyStar Credit Union | Academy of Business High School Branch Program | "Apply through your school" | "School Year (ongoing)" | unknown | No | No | No | No | null | null | unknown | Yes | Yes | Deadline is fully delegated to each participating high school's own process; no employer-controlled date exists in this record. |
| 8 | UF Health Jacksonville | Clinical Research Intern; Public Health Fellow | "Visit ufhealthjax.org/careers for current openings" | "Summer (10–12 weeks, varies by program)" | unknown | No | No | No | No | null | null | unknown | Yes | Yes | — |
| 9 | Intercontinental Exchange (ICE) | Software Engineering Intern; Data Analytics Intern; Business Analyst Intern; Partner Success Intern | "Rolling, check careers.ice.com for current openings" | "10–11 weeks (Summer)" | rolling | No | N/A | No | Not applicable | null | null | rolling | Yes | Yes | 4 programs share one rolling deadline/duration. |
| 10 | JAXPORT | Port Operations Intern; Trade & Logistics Intern | "Check website for current openings" | "Summer" | unknown | No | No | No | No | null | null | unknown | Yes | Yes | — |
| 13 | Miller Electric Company | Construction Management Internship; Engineering Internship; IT Internship; Accounting Internship; Marketing Internship; Virtual Design & Construction Internship | "Applications typically open in Spring, check mecojax.com" | "12 weeks (Summer)" | seasonal | No | No | No | No | null | null | seasonal_window | Yes | Yes | Largest program fan-out in the dataset (6 programs share one deadline/duration) — strongest existing evidence per-program deadlines are needed (`migration-map.md` §2). |
| 14 | Jacksonville Transportation Authority (JTA) | Transportation Planning Intern; Finance & Administration Intern; Public Affairs Intern | "Applications typically open February – March each year" | "10 weeks (Summer)" | seasonal | No | No | No | No | null | null | seasonal_window | Yes | Yes | — |
| 15 | Jacksonville Aviation Authority (JAA) | Airport Operations Intern; Marketing & Communications Intern; Facilities Management Intern | "Check flyjacksonville.com for current openings" | "8 weeks (Summer)" | unknown | No | No | No | No | null | null | unknown | Yes | Yes | — |
| 16 | Jacksonville Urban League | Youth Employment Services (YES) Program; Summer Youth Internship Placement | "Applications open each Spring, check ul-jacksonville.iamempowered.com" | "6 weeks (Summer)" | seasonal | No | No | No | No | null | null | seasonal_window | Yes | Yes | — |
| 17 | Goodwill of North Florida | Mayor's Youth at Work Partnership (MYAWP) | "Applications typically open April – May each year" | "Summer (6–8 weeks)" | seasonal | No | No | No | No | null | null | seasonal_window | Yes | Yes | — |
| 18 | Jacksonville Youth Works | Workforce Training Program; Youth Internship Placement; Community Apprenticeship | "Rolling, visit jaxyouthworks.org" | "Varies by program" | rolling | No | N/A | No | Not applicable | null | null | rolling | Yes | Yes | `duration` itself already admits it "Varies by program" — direct evidence duration/deadline should be split per-program. |
| 19 | Fanatics | Software Engineering Intern; Data Analytics Intern; Merchandising Intern; Supply Chain Intern | "Applications open each Fall, check fanaticsinc.com/join-our-team" | "10 weeks (Summer)" | seasonal | No | No | No | No | null | null | seasonal_window | Yes | Yes | — |
| 20 | Crowley Maritime | Logistics & Supply Chain Intern; Engineering Intern; Finance Intern | "Applications typically open in Spring, check crowley.com" | "Summer (10–12 weeks)" | seasonal | No | No | No | No | null | null | seasonal_window | Yes | Yes | — |
| 21 | Baptist Health Jacksonville | Allied Health Scholars Program; CT Technologist Internship; Clinical Rotation Program | "Rolling, visit baptistjax.com/about-us/careers" | "Varies by program (4 months to 1 year)" | rolling | No | N/A | No | Not applicable | null | null | rolling | Yes | Yes | `duration` already admits it "Varies by program," same caveat as id 18. |
| 22 | WJCT Public Media | Broadcast Journalism Intern; Radio Production Intern; Digital Media & Content Intern | "Rolling, visit wjct.org for current openings" | "Semester-based (part-time, flexible)" | rolling | No | N/A | No | Not applicable | null | null | rolling | Yes | Yes | — |
| 23 | Jacksonville Jaguars | Guest Experience Intern; Marketing Intern; Community Relations Intern; Operations Intern | "Applications typically open Summer – Fall each year" | "Season-based or semester (varies)" | seasonal | No | No | No | No | null | null | seasonal_window | Yes | Yes | Same employer as id 40 (also "Jacksonville Jaguars," same stadium under a prior name) per `migration-map.md` §1 — likely duplicate. Resolve employer identity first; do not average the two deadline texts. |
| 24 | HabiJax (Habitat for Humanity Jacksonville) | Home Build Volunteer; ReStore Volunteer | "Rolling, sign up for build days anytime" | "Ongoing, flexible single days or recurring shifts" | rolling | No | N/A | No | Not applicable | null | null | rolling | Yes | Yes | Describes drop-in single-day sign-ups rather than a single seasonal window — whether `applicationCloseAt` even applies to this record is a product question. |
| 25 | Feeding Northeast Florida | Warehouse Sorting Volunteer; Mobile Pantry Volunteer | "Rolling, sign up for warehouse shifts online" | "Shifts as short as 2 hours, year-round" | rolling | No | N/A | No | Not applicable | null | null | rolling | Yes | Yes | Same drop-in-shift caveat as id 24. |
| 26 | Jacksonville Humane Society | Animal Care Volunteer; Adoption Events Volunteer | "Rolling, orientation sessions held monthly" | "Ongoing, weekly shift commitment preferred" | rolling | No | N/A | No | Not applicable | null | null | rolling | Yes | Yes | Text describes a recurring *orientation* cadence, not an application deadline — flag for a product decision on whether this field even represents a deadline here. |
| 27 | Electrical Training Alliance of Jacksonville (ETAJ) | Registered Electrical Apprenticeship | "Rolling, applications accepted year-round" | "4 years (on-the-job training + 2 nights/week classes)" | rolling | No | N/A | No | Not applicable | null | null | rolling | Yes | Yes | — |
| 28 | State Attorney's Office, 4th Judicial Circuit | Prosecutorial Internship | "Applications open Dec 1, close Feb 15" | "6-8 weeks (Summer)" | fixed | No | No\* | No\* | No | null | null | fixed_dated | Yes | Yes | Unlike id 1, does not say "each year" — a human must confirm whether this window truly recurs annually or is a stale one-time value, in addition to confirming the year. |
| 29 | Jacksonville Zoo and Gardens | ZooTeens! (year-round teen volunteer program); Interpretive Host Volunteer; Special Events Volunteer | "Rolling, orientation sessions held regularly" | "Ongoing, weekly shift commitment preferred" | rolling | No | N/A | No | Not applicable | null | null | rolling | Yes | Yes | **A real dated sub-deadline exists but is stored in the wrong field.** `requirements` (not `deadline`) contains: "ZooTeens! applications open Nov 1 and close Nov 25 each year" — a fixed, annually-recurring deadline for only 1 of the 3 programs on this record. Clearest existing case of a per-program deadline needing to move to the correct field before automation. |
| 30 | MOSH (Museum of Science & History) | Exhibit Floor Volunteer; Planetarium Volunteer | "Rolling" | "Ongoing, flexible shifts" | rolling | No | N/A | No | Not applicable | null | null | rolling | Yes | Yes | — |
| 31 | JEA Skilled Craft Apprenticeship | Meter Specialist Trainee; Substation Technician Apprentice | "Rolling, check jea.com/careers for current openings" | "Multi-year (varies by craft track)" | rolling | No | N/A | No | Not applicable | null | null | rolling | Yes | Yes | Same employer as id 3 — see note there. |
| 32 | Northeast Florida Builders Association Apprenticeship | Residential Construction Apprenticeship | "Rolling, applications accepted year-round" | "1-4 years depending on trade" | rolling | No | N/A | No | Not applicable | null | null | rolling | Yes | Yes | — |
| 33 | UNF Florida Data Science for Social Good (FL-DSSG) | FL-DSSG Summer Internship | "Applications due Mar 20, 5 PM" | "11 weeks (May 18 – Aug 7)" | fixed | No | N/A | No\* | No | null | null | fixed_dated | Yes | Yes | **Only employer record with a time component** ("5 PM"). No timezone stated in source text; `America/New_York` is the intended project convention once a year is confirmed, but this must be verified against UNF's own program page, not assumed. |
| 34 | The Haskell Company | Construction & Engineering Internship | "Rolling, check haskell.com/careers for current openings" | "Summer (10–12 weeks)" | rolling | No | N/A | No | Not applicable | null | null | rolling | Yes | Yes | — |
| 35 | RF-SMART | Product Strategy Internship; Summer Internship Program | "Rolling, check rfsmart.com/careers for current openings" | "Summer or Fall semester" | rolling | No | N/A | No | Not applicable | null | null | rolling | Yes | Yes | — |
| 36 | St. Johns Riverkeeper | River Cleanup Volunteer; Education & Outreach Volunteer | "Rolling, sign up for cleanups anytime" | "Ongoing, event-based and recurring roles" | rolling | No | N/A | No | Not applicable | null | null | rolling | Yes | Yes | — |
| 37 | Big Brothers Big Sisters of Northeast Florida | Community-Based Mentoring; School-Based Mentoring | "Rolling, enrollment year-round" | "Ongoing, 1-year minimum commitment preferred" | rolling | No | N/A | No | Not applicable | null | null | rolling | Yes | Yes | — |
| 39 | FIS Global | FIS University Summer Internship Program | "Rolling, check fisglobal.com/careers for current openings" | "10 weeks (June–August)" | rolling | No | N/A | No | Not applicable | null | null | rolling | Yes | Yes | — |
| 40 | Jacksonville Jaguars | Marketing Internship; Social Media Internship | "Rolling, check jaguars.com/careers for current openings" | "Semester-based (Fall/Spring/Summer)" | rolling | No | N/A | No | Not applicable | null | null | rolling | Yes | Yes | Same employer as id 23 — see note there. |
| 41 | Dun & Bradstreet | Data & Analytics Internship; Accounting Internship; ESG Internship | "Rolling, check dnb.com/careers for current openings" | "Summer, ~10–12 weeks" | rolling | No | N/A | No | Not applicable | null | null | rolling | Yes | Yes | — |

**Record-count check:** 38 rows above = 38 records in `data.js`'s `employers` array. Every id present in the source file (1–10, 13–37, 39–41) appears exactly once.

---

## Part 2 — Event Records (`events`)

**Total records found: 15** (ids 2–16; id 1 does not exist in `data.js` — a pre-existing gap).

| ID | Title | Date text (verbatim) | Recurring (current) | Recommended `experienceType` | Explicit year? | Exact start known? | Exact end known? | Multiple occurrences? | `startsAt` | `endsAt` | `recurrenceRule` | Auto-expire safe now? | Source verify needed? | Human review needed? | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 2 | First Wednesday Art Walk | "First Wednesday of each month, 5–9 PM \| Next: Aug 5" | true | recurring_space | No | No | No | Yes | null | null | Not yet formalized — text describes "first Wednesday, monthly, 5–9 PM"; needs a human-authored rule plus confirmed anchor/timezone | No | Yes | Yes | The "Next: Aug 5" hint will go stale once that date passes; must not be read as an expiration signal for the whole series — only the displayed hint needs periodic refreshing. |
| 3 | Cummer Museum, Free First Saturday | "First Saturday of each month, 11 AM–4 PM \| Next: Aug 1" | true | recurring_space | No | No | No | Yes | null | null | Not yet formalized — "first Saturday, monthly, 11 AM–4 PM" | No | Yes | Yes | Same "Next"-staleness caveat as id 2. |
| 4 | Cummer Museum, Free Third Tuesday Evening | "Third Tuesday of each month, 4–9 PM \| Next: Jul 15" | true | recurring_space | No | No | No | Yes | null | null | Not yet formalized — "third Tuesday, monthly, 4–9 PM" | No | Yes | Yes | Same "Next"-staleness caveat; this record's displayed "Next: Jul 15" is only two days out from this audit's date (2026-07-13), a concrete illustration of how quickly the hint needs refreshing. |
| 5 | Jacksonville Jumbo Shrimp Baseball | "Home games through Sept 20 \| Next homestand: Aug 11–16 vs. Syracuse" | true | Flagged for split — does not map cleanly to either value as a single record | No | No | No | Yes | null | null | Not applicable — a bounded season containing multiple discrete homestands, not a repeating rule | No | Yes | Yes | Recommend splitting into individual homestand/game `scheduled_event` records rather than one `recurring_space` covering "through Sept 20." |
| 6 | Riverside Arts Market | "Every Saturday, 10 AM–3 PM" | true | recurring_space | No | No | No | Yes | null | null | Not yet formalized — "weekly, Saturdays, 10 AM–3 PM" | Not applicable | Yes | Yes | No "Next" hint present, so no staleness risk from that pattern — but still no anchor date to compute anything from. |
| 7 | Cody Johnson Live '26 | "July 24–25, 2026 \| 7:30 PM" | false | scheduled_event, as two split records | Yes | Yes, per night (see Notes) | No | Yes | null (see Notes) | null | Not applicable | Yes, once split | Yes | Yes | **Recommend splitting into two `scheduled_event` rows**: July 24, 2026 7:30 PM and July 25, 2026 7:30 PM (America/New_York, since a time is given). No end time stated for either night. As a single record spanning two dates, `startsAt` cannot be assigned unambiguously until split. This is the most complete date information anywhere in the dataset. |
| 8 | Hemming Park Food Truck Thursdays | "Every Thursday, 11 AM–2 PM" | true | recurring_space | No | No | No | Yes | null | null | Not yet formalized — "weekly, Thursdays, 11 AM–2 PM" | Not applicable | Yes | Yes | — |
| 9 | Kayaking on the St. Johns River | "Year-round \| Dawn to Dusk" | true | recurring_space (imperfect fit — see Notes) | No | No | No | Not applicable — continuous availability, not discrete occurrences | null | null | Not applicable — "dawn to dusk" is descriptive, not a literal time, and there is no discrete cadence to formalize | Not applicable | Yes | Yes | An always-available activity/rental listing, not a series of scheduled occurrences. The current two-value `experience_type` enum may need a third category (e.g. `standing_activity`) to represent this — flagged as a `PROPOSED` schema question, not resolved here. |
| 10 | Jacksonville Beach | "Year-round \| Open daily" | true | recurring_space (imperfect fit — see Notes) | No | No | No | Not applicable | null | null | Not applicable | Not applicable | Yes | Yes | Same evergreen-listing mismatch as id 9. |
| 11 | Timucuan Ecological & Historic Preserve | "Year-round \| Dawn to Dusk" | true | recurring_space (imperfect fit — see Notes) | No | No | No | Not applicable | null | null | Not applicable | Not applicable | Yes | Yes | Same evergreen-listing mismatch as id 9. |
| 12 | Arts Market of St. Augustine | "1st Saturday of each month, 8:30 AM–12:30 PM \| Next: Aug 1" | true | recurring_space | No | No | No | Yes | null | null | Not yet formalized — "first Saturday, monthly, 8:30 AM–12:30 PM" | No | Yes | Yes | Same "Next"-staleness caveat as id 2/3/4. |
| 13 | Jax River Jams: Embracing the Culture of Duval | "Multiple dates, Summer 2026" | false | Flagged for split | Yes | No | No | Yes | null | null | Not applicable — a bounded festival, not a repeating series | No | Yes | Yes | Description states this is "a four-day...concert series," but `date` gives no specific dates at all despite naming the year. Recommend splitting into per-day `scheduled_event` rows once exact dates are confirmed. `link` points to a general news roundup (folioweekly.com), not the festival organizer's or Metropolitan Park's own page — the source itself needs upgrading before verification is meaningful. |
| 14 | The Music of David Bowie (Symphonic) | "August 8, 2026" | false | scheduled_event | Yes | Yes (date only, no time given) | No | No | 2026-08-08 (date only — no time is added since none is given) | null | Not applicable | Yes | Yes | Yes | Along with id 7 (once split), one of the two records in the dataset with enough information to support safe automatic expiration once its date has passed. |
| 15 | Friday Night Dance Party at the Pier | "Every Friday" | true | recurring_space | No | No | No | Yes | null | null | Not yet formalized — "weekly, Fridays" (no hours given at all, unlike every other weekly record) | Not applicable | Yes | Yes | Missing even a time-of-day range, which every other recurring event in this dataset provides — an additional, record-specific data gap. |
| 16 | Beaches Green Market | "Saturdays, 10 AM-2 PM" | true | recurring_space | No | No | No | Yes | null | null | Not yet formalized — "weekly, Saturdays, 10 AM–2 PM" | Not applicable | Yes | Yes | — |

**Record-count check:** 15 rows above = 15 records in `data.js`'s `events` array. Every id present in the source file (2–16) appears exactly once.

---

## Key Risks

1. **No employer deadline field contains an explicit year, anywhere, in any of the 38 records.** `applicationOpenAt`/`applicationCloseAt` must be `null` for every current record; nothing can be safely computed without new source verification.
2. **21 of 38 employers are `rolling`** with no close date — safe to keep listed only via periodic re-verification against the live source, never via computed expiration.
3. **5 records (`unknown` bucket)** give no timing signal at all beyond "check the employer's own site."
4. **Jacksonville Zoo (id 29)** hides a real, dated, program-specific deadline ("ZooTeens! ... Nov 1 ... Nov 25 each year") inside `requirements` instead of `deadline` — the clearest existing case of a per-program deadline needing correction, not just structuring.
5. **Two employer pairs are likely duplicate employers** (id 3 / id 31 "JEA"; id 23 / id 40 "Jacksonville Jaguars") — already flagged in `migration-map.md` §1. Deadline consolidation should not proceed per-employer until this dedup is resolved, or two different deadline texts risk being silently merged or averaged.
6. **Only 3 of 15 events carry an explicit year** (ids 7, 13, 14), and two of those still bundle multiple distinct dates into a single row (id 7's two concert nights; id 13's unspecified "Multiple dates, Summer 2026") rather than one row per occurrence.
7. **8 of 15 events are recurring with a baked-in "Next: `<date>`" hint** (ids 2, 3, 4, 12) that will go stale — this must never be read as an expiration signal for the underlying recurring series.
8. **3 events are "Year-round" continuously-available listings** (ids 9, 10, 11) that do not cleanly fit either `scheduled_event` or `recurring_space` — flagged as a likely gap in the two-value `experience_type` enum, to be resolved as a `PROPOSED` schema decision, not by this audit.
9. **Jumbo Shrimp Baseball (id 5)** mixes a season-long window with a specific next homestand in one record — recommend splitting into individual homestand/game `scheduled_event` records.
10. **No source or verification metadata exists anywhere** in the current dataset (already established in `current-data-dictionary.md`) — every employer and event record needs source verification before any date automation, with no exceptions.

## Records Safe for Automatic Expiration Today

**None, as currently structured.** Two event records have enough date information to become safe once split into individual dated occurrences:

- **Event id 14** ("The Music of David Bowie (Symphonic)," August 8, 2026) — already a single, unambiguous, year-bearing date. Safe to auto-expire after that date passes, once a structured `starts_at` exists.
- **Event id 7** ("Cody Johnson Live '26," July 24–25, 2026, 7:30 PM) — safe to auto-expire only *after* being split into two separate dated `scheduled_event` rows (one per night); unsafe to expire as the current single bundled record.

No employer/opportunity record and no other event record has enough information (specifically, a confirmed year) to support automatic expiration today.

## Records Requiring Source Verification or Human Review

**All 38 employer records and all 15 event records** require both source verification and human review before any structured date field is populated or any automatic expiration is enabled — there is no exception in either dataset, because no record currently carries source/provenance metadata (`docs/data/current-data-dictionary.md`, "Fields needed for source verification"). Beyond that universal need, the following need review for reasons *specific to timing/date quality*, not just missing provenance:

- **Missing year (all 38 employers):** every record needs a human (or a verified source) to supply the year before any deadline can drive real expiration.
- **Employer dedup before date consolidation:** ids 3/31 (JEA) and 23/40 (Jacksonville Jaguars).
- **Deadline hidden in the wrong field:** id 29 (Jacksonville Zoo — ZooTeens! deadline is in `requirements`, not `deadline`).
- **Ambiguous recurrence:** id 28 (State Attorney's Office) states exact dates without "each year," unlike id 1 and id 29's ZooTeens! sub-deadline — a human must confirm whether it recurs annually.
- **Multi-program, single-deadline records** where the shared field may not reflect true per-program variation: ids 2, 9, 13, 14, 15, 18, 19, 20, 21, 22, 23, 29, 35, 40, 41 (any record with more than one `programs[]` entry).
- **Record needing a split into multiple discrete occurrences:** event ids 5, 7, 13.
- **Schema-fit questions (not resolvable by this audit):** event ids 9, 10, 11 (evergreen "Year-round" listings) and employer ids 24, 25, 26 (drop-in volunteer sign-ups where "deadline" may not be the right concept at all).

## Change Log

| Date | Change | Author |
|---|---|---|
| 2026-07-13 | Initial date-normalization audit created from `data.js`; no code or data files modified | Claude (documentation task) |
| 2026-07-13 | Added "Implementation Status" section: this audit's recommendations were carried into `data.js` (`applicationTiming`/`applicationOpenAt`/`applicationCloseAt`/`dateVerificationStatus` on `employers`; `experienceType`/`startsAt`/`endsAt`/`recurrenceRule`/`dateVerificationStatus` on `events`) and `app.js` (`isOpportunityActive`, `isEventActive`), with all structured date values `null` and all records `"unverified"` | Claude (documentation task) |
