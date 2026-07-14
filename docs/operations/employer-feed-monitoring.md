# Employer Feed Monitoring

**Status:** `LIVE` — the monitoring process itself (the registry, checker script, and GitHub Actions workflow) is real and runs on schedule. It does not publish anything to the WorkJax website. See `docs/integrations/employer-feed-registry.md` for the separate, browser-visible registry that actually powers the live UI feed (currently Dun & Bradstreet only).

**Files:** `monitoring/employer-feed-watch.json`, `scripts/check-employer-feeds.mjs`, `.github/workflows/employer-feed-watch.yml`

**Related:** `docs/integrations/ats-source-audit.md`, `docs/integrations/fanatics-greenhouse-validation.md`, `docs/integrations/employer-feed-registry.md`, `docs/integrations/dnb-lever-poc.md`, `docs/operations/content-ingestion.md`

## Why GitHub Actions

WorkJax has no server, database, or scheduled-job infrastructure today (`docs/architecture/current-state.md`). GitHub Actions provides a schedule trigger and a repository-scoped issue as a lightweight, no-new-infrastructure way to recheck a small number of public ATS feeds weekly, without adding a database, a Vercel Cron job, or any new hosted service. This mirrors the "daily scheduled sync" concept in `docs/architecture/target-state.md`, at a much narrower scope: two ATS providers, three sources, one issue, no ingestion into `data.js`.

## Registry structure (`monitoring/employer-feed-watch.json`)

A JSON file, separate from the browser-visible `live-opportunity-sources.js`. It is never loaded by `index.html` or `app.js`. Each entry under `sources` must contain:

| Field | Meaning |
|---|---|
| `sourceId` | Stable, unique identifier, e.g. `"lever:dnb"`, `"greenhouse:fanaticsinc"`. |
| `employerId` | The matching `id` in the `employers` array in `data.js`. |
| `employerName` | Human-readable label. |
| `provider` | `"lever"`, `"greenhouse"`, or `"icims_public_portal"`. |
| `status` | One of `live`, `watch`, `paused`, `manual_only`. |
| `endpoint` | The exact public ATS URL to fetch. Always `https://`. |
| `enabled` | Whether the checker fetches this source at all. |
| `locationKeywords` | Conservative location terms (e.g. `["Jacksonville", "Florida"]`) — the first entry is required, additional entries (or an `FL` boundary match, when `"Florida"` is present) are also required. |
| `studentKeywords` | Conservative student/early-talent terms matched as whole words against title, department, and description. |
| `lastManuallyVerifiedAt` | ISO date a human last confirmed the source configuration, or `null` if not yet reviewed. |
| `notes` | Free-text context, including links to the relevant documentation. |

Greenhouse entries also carry an informational `boardToken` field; the `endpoint` itself is always what the script fetches.

`icims_public_portal` entries point `endpoint` at a public, unauthenticated iCIMS job-search results page — the same page any career-site visitor can load in a browser. This is **not** the authenticated iCIMS customer/integration API (`api.icims.com`), which this project does not use and has no credentials for.

### Status values

- `live` — an existing, browser-facing WorkJax integration also exists for this employer (currently only Dun & Bradstreet's Lever feed).
- `watch` — technically reachable and monitored, but not connected to the WorkJax UI (currently both Fanatics Greenhouse boards).
- `paused` — temporarily excluded from fetching (set `enabled: false` alongside this).
- `manual_only` — no automated feed exists; present for documentation continuity only, never fetched.

### Initial sources

1. **Dun & Bradstreet** (`lever:dnb`, `status: live`) — rechecks the same public Lever board that already powers `api/dnb-lever-jobs.js`, independent of that endpoint.
2. **Fanatics Corporate** (`greenhouse:fanaticsinc`, `status: watch`) — per `docs/integrations/fanatics-greenhouse-validation.md`, confirmed reachable; decision is `HOLD` because no current posting qualifies.
3. **Fanatics Collectibles** (`greenhouse:fanaticscollectibles`, `status: watch`) — board token confirmed via `docs/integrations/ats-source-audit.md`; content not yet independently reviewed.
4. **Miller Electric Company** (`miller-electric-icims`, `status: watch`) — the first source using the `icims_public_portal` provider. Miller's own official internship page (`mecojax.com`) links directly to a public EMCOR iCIMS job search (`careers-emcorgroup.icims.com/jobs/search?searchKeyword=%23miller&ss=1`); this entry monitors only that public, unauthenticated page.

Fanatics Betting & Gaming was **not** added: no official Greenhouse board token for it is documented anywhere in this repository, and the task instructions are explicit that a token must never be guessed or invented.

## Weekly schedule

`workflow_dispatch` (manual) and a weekly `schedule` trigger, `cron: "17 13 * * 1"` — 9:17 AM America/New_York during Eastern Daylight Time. GitHub Actions `schedule` cron is always evaluated in UTC and does not shift for daylight saving time, so during Eastern Standard Time (roughly November–March) this actually fires around 8:17 AM local. This tradeoff was chosen deliberately (see the workflow file comment) to keep the schedule accurate during the internship-heavy spring/summer months.

## Manual-run process

From the repository's **Actions** tab, select **Employer Feed Watch** → **Run workflow** on the `main` branch. A manual run on `main` behaves exactly like the scheduled run: it checks all enabled sources and creates/updates the monitoring issue. A manual run from any other context (e.g. a fork, or a non-`main` ref) still runs the checker but — per the same `main`-branch gate as scheduled runs — will not touch the issue unless it is actually running against `main`.

## Filtering rules

- **Location:** conservative Jacksonville + Florida matching, applied to the posting's location field(s) — the same approach already used in `api/dnb-lever-jobs.js`.
- **Student relevance:** a whole-word match against the source's `studentKeywords` list, checked against title, department, and description text. A posting is never classified as student-relevant on the basis of a "college"/"university" mention alone — it must hit one of the explicit keywords (internship, intern, apprentice/apprenticeship, early talent, co-op/coop, graduate program).
- **No high-school inference:** the checker never emits, infers, or claims high-school eligibility for any posting, for any source.
- **Duplicate detection across boards:** because both Fanatics boards share the same `employerId`, a qualifying posting appearing on both boards with the same title and location is shown once in the "by employer" section, while each board's own job ID is still tracked individually for accurate new/removed detection.
- **iCIMS public-portal qualification (Miller Electric):** a record must explicitly identify Miller Electric Company (never a generic EMCOR mention or an unrelated EMCOR subsidiary), and must satisfy both of the following — not just one:
  - **Location evidence:** the visible listing explicitly includes Jacksonville, "Jacksonville, FL", or "US-FL-Jacksonville".
  - **Strong student evidence:** position type is Intern, category is Internship, the title explicitly contains intern/internship/co-op/apprentice/apprenticeship, or the listing explicitly states it is for a currently enrolled college/university student or early-career program participant. An ordinary full-time or "entry-level" listing never qualifies on its own, and high-school eligibility is never inferred.
  - Zero qualifying Miller records from an otherwise-healthy page is a normal, healthy result. Blocked, redirected off the iCIMS domain, or structurally unrecognizable portal HTML is reported as a source-health warning instead — never silently treated as zero jobs.

## Issue-report behavior

Exactly one open issue titled **"Employer Feed Watch Report"** is maintained. On every scheduled or manual `main`-branch run:

- If no open issue with that title exists, one is created.
- If it exists, its body is updated every run (so "Last checked" always reflects the latest run).
- A **comment** is added only when a new qualifying posting appears, a qualifying posting disappears, or a source's health flips between healthy and failing. A no-change run updates the body silently.

The issue body carries a hidden HTML-comment marker (`<!-- employer-feed-watch:state ... -->`) containing the previous run's per-source health and qualifying job IDs as JSON. This is the only state persisted between runs — there is no database and no committed state file. The marker is invisible in GitHub's rendered issue view but readable in the raw issue body.

Pull requests that touch `monitoring/**`, `scripts/check-employer-feeds.mjs`, or the workflow file itself run the checker and print the full report in the workflow logs, but never create or update the issue — this is enforced both by an explicit `ref == main` condition in the workflow and, independently, by GitHub's default read-only `GITHUB_TOKEN` for pull requests from forks.

## Source-health behavior

Each source is fetched independently, in sequence, with its own try/catch — one source's timeout, non-2xx response, or malformed body never prevents the others from being checked. A source is marked unhealthy for: a network error, a request that exceeds the 10-second timeout, a non-2xx HTTP status, a non-JSON response body, or a response whose top-level shape doesn't match what that provider is expected to return (a JSON array for Lever; an object with a `jobs` array for Greenhouse). For an `icims_public_portal` source specifically, a source is also marked unhealthy if the final URL (after redirects) leaves the allowed iCIMS career-portal hostname, or if the fetched HTML no longer structurally resembles an iCIMS page — both are reported as a warning for manual review, never silently interpreted as zero jobs. Zero qualifying postings from an otherwise-healthy source is a normal, valid result — never a failure.

The workflow itself only fails when: the registry file is missing, malformed, or fails schema validation; the script cannot run at all; or every enabled automated source fails in the same run.

## How to add another Lever source

1. Confirm the employer's Lever site slug from an official source and add an entry to `monitoring/employer-feed-watch.json` with `provider: "lever"`, `endpoint: "https://api.lever.co/v0/postings/<slug>?mode=json"`, appropriate `locationKeywords`/`studentKeywords`, and `lastManuallyVerifiedAt` set once you've manually checked the endpoint responds as expected.
2. Set `status` to `watch` (not `live`) until a human has reviewed real, current output and a separate decision is made about UI integration.
3. Open a pull request — the workflow will run the checker against the new entry and print the report in the logs before anything touches the monitoring issue.

## How to add another Greenhouse source

Same process as Lever, but with `provider: "greenhouse"`, `endpoint: "https://boards-api.greenhouse.io/v1/boards/<board-token>/jobs?content=true"`, and an optional informational `boardToken` field. Never guess a board token — only add one confirmed by an official, employer-named URL, the same evidentiary standard used in `docs/integrations/ats-source-audit.md`.

## How to add another iCIMS public-portal source

`icims_public_portal` is a **generic** adapter — it is driven entirely by the registry entry's `endpoint` and `locationKeywords`, not by any employer-specific code. To add another public iCIMS career-portal job search:

1. Confirm, from an official source, that the employer's own careers/internship page links directly to a specific public iCIMS job-search results URL (as Miller Electric's `mecojax.com` internship page links to `careers-emcorgroup.icims.com`). Never guess an iCIMS tenant hostname.
2. Add an entry with `provider: "icims_public_portal"` and `endpoint` set to that exact public search URL.
3. Set `status: "watch"` and `lastManuallyVerifiedAt` once a human has confirmed the endpoint loads as expected.
4. Open a pull request — the workflow will run the checker against the new entry and print the report in the logs before anything touches the monitoring issue.

This adapter reads only public job-search result pages (following same-hostname pagination, capped at 5 pages) — it never reaches a login, candidate-profile, application-submission, or authenticated iCIMS API endpoint (`api.icims.com`), and it never submits a form or collects applicant information. Public iCIMS HTML is far less stable than Lever's or Greenhouse's structured JSON and can change layout without notice; a parsing failure or a redirect off the iCIMS domain is reported as a source-health warning, never interpreted as zero jobs.

## How to pause a source

Set `enabled: false` on the entry (and, for clarity, `status: "paused"`). A disabled source is skipped entirely by the checker — no fetch is made, and it is listed as skipped in the report rather than as failed.

## How to validate a source before connecting it to the user interface

Monitoring a source — even with `status: "watch"` and real qualifying postings appearing in the issue — is not, by itself, sufficient to add it to `live-opportunity-sources.js`. Before any UI integration:

1. Manually cross-check several qualifying postings against the raw upstream response to confirm no false positives or negatives, following the same rigor as `docs/integrations/dnb-lever-poc.md`'s manual testing checklist.
2. Build and document a dedicated, per-employer API endpoint (its own Vercel Function, following the pattern in `api/dnb-lever-jobs.js`) — the monitoring checker's normalization is for reporting only and is not reused as the browser-facing endpoint.
3. Document the new source's filtering rules and field mapping, following `docs/integrations/employer-feed-registry.md`'s "Adding a future source" checklist.
4. Only then add an `enabled: true` entry to `live-opportunity-sources.js`, with a human reviewing the change.

## Monitoring a source never automatically publishes it

Adding or watching a source in `monitoring/employer-feed-watch.json` has no effect on `data.js`, `live-opportunity-sources.js`, `app.js`, `index.html`, or any other website file. It only affects the contents of the "Employer Feed Watch Report" issue. A human must review a new source and separately add a reviewed, validated entry to `live-opportunity-sources.js` before it can ever appear on the WorkJax website — this monitoring process performs no part of that step automatically.

## What this monitoring process is not

- It is not a citywide job aggregator and does not claim complete coverage of Jacksonville employers — it reflects only the specific Lever and Greenhouse boards listed in the registry.
- It does not submit applications, create accounts, or collect applicant information — every request is a read-only GET against a public postings feed.
- It does not require a personal access token, a database, or an API key.

## Change Log

| Date | Change | Author |
|---|---|---|
| 2026-07-14 | Created the employer feed monitoring registry, checker script, and GitHub Actions workflow: rechecks Dun & Bradstreet's Lever board and Fanatics' two Greenhouse boards weekly, maintains one GitHub issue, and does not connect any new feed to the WorkJax UI | Claude (implementation task) |
| 2026-07-14 | Added a generic `icims_public_portal` provider adapter and the first source using it, Miller Electric Company (`miller-electric-icims`) — monitors only the public, unauthenticated EMCOR iCIMS job-search page Miller's own internship page links to; does not use the authenticated iCIMS API and does not add Miller to the WorkJax UI | Claude (implementation task) |
