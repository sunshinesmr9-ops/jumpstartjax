# Monthly ATS Discovery

**Status:** `LIVE` — the discovery process itself (the candidate registry, checker script, and GitHub Actions workflow) is real and runs on schedule. It does not publish anything to the WorkJax website, and it does not add or modify any entry in `monitoring/employer-feed-watch.json` or `live-opportunity-sources.js`.

**Files:** `monitoring/ats-research-candidates.json`, `scripts/check-ats-sources.mjs`, `.github/workflows/monthly-ats-discovery.yml`

**Related:** `docs/integrations/ats-source-audit.md`, `docs/operations/employer-feed-monitoring.md`, `docs/operations/content-ingestion.md`

## Weekly monitoring vs. monthly discovery

These are two separate, independent processes that never modify each other's files:

| | Weekly Employer Feed Watch | Monthly ATS Discovery |
|---|---|---|
| Files | `monitoring/employer-feed-watch.json`, `scripts/check-employer-feeds.mjs`, `.github/workflows/employer-feed-watch.yml` | `monitoring/ats-research-candidates.json`, `scripts/check-ats-sources.mjs`, `.github/workflows/monthly-ats-discovery.yml` |
| What it checks | Feeds *already known* to exist (Dun & Bradstreet's Lever board, Fanatics' two Greenhouse boards) | Every current WorkJax employer's official careers page, looking for evidence of *which* platform (if any) it uses |
| What it fetches | A structured JSON postings API | An HTML careers page |
| What it looks for | New qualifying Jacksonville student/early-talent postings | Hostname/link evidence of a recognized ATS, a broken or redirected careers URL, or a platform change |
| Cadence | Weekly | Monthly (first Tuesday) |
| Issue maintained | "Employer Feed Watch Report" | "Monthly ATS Source Research" |
| Can it publish a feed? | No | No |

The monthly process is a discovery aid that feeds *into* future weekly-monitoring or live-feed decisions — it never edits those files itself.

## The candidate registry (`monitoring/ats-research-candidates.json`)

One entry per current `data.js` employer record (38 total). Each entry has:

| Field | Meaning |
|---|---|
| `employerId` | The matching `id` in the `employers` array in `data.js`. |
| `employerName` | Human-readable label. |
| `careersUrl` | The employer's official careers page URL the checker fetches. |
| `expectedPlatform` | The platform named in `docs/integrations/ats-source-audit.md`, or `null` if that audit marked the employer `NOT VERIFIED`. Never guessed. |
| `confidence` | `confirmed`, `likely`, `uncertain`, or `not_verified` — mirrors the audit's own confidence vocabulary. |
| `researchStatus` | `live`, `monitored`, `revalidate`, `investigate`, `manual_only`, or `paused` (see below). |
| `priority` | `high`, `medium`, or `low` — how urgently a human should look into this candidate. |
| `enabled` | Whether the monthly checker fetches this entry at all. |
| `canonicalEmployerKey` | Groups records that represent the same real-world organization or share a careers URL, so the checker fetches once per group. |
| `notes` | Free-text context, always citing the relevant line of `docs/integrations/ats-source-audit.md`. |

### `researchStatus` values

- `live` — an existing, browser-facing WorkJax integration exists (currently only Dun & Bradstreet).
- `monitored` — already `watch`-status in the weekly registry (currently Fanatics); the monthly check here only catches a careers-URL change, not content.
- `revalidate` — the audit identified a likely or unvalidated platform; the monthly check looks for confirming or contradicting evidence.
- `investigate` — the audit marked this employer `NOT VERIFIED`; `expectedPlatform` is always `null` here, by design — the registry validator (`scripts/check-ats-sources.mjs`) refuses to load a registry that assigns a platform to an `investigate` entry.
- `manual_only` — the audit confirmed no ATS exists (email, in-person, fax, or a university-run process). Defaults to `enabled: false`, but stays documented.
- `paused` — reserved for a future, intentional exclusion; not currently used.

### Duplicate employers and duplicate URLs

Two pairs of `data.js` records represent the same real organization: JEA (`id 3`) / JEA Skilled Craft Apprenticeship (`id 31`), and the two Jacksonville Jaguars records (`id 23` / `id 40`). Each keeps its own `employerId` and registry entry, but both members of a pair share one `canonicalEmployerKey` and an identical `careersUrl`. The checker groups candidates by `canonicalEmployerKey` first, and — as an independent safety net — also merges any groups that end up with the same *normalized* `careersUrl` (protocol + lowercased host + path, trailing slash ignored), so a future registry edit can't accidentally introduce a duplicate fetch. Every request is made exactly once per group; all associated `employerId`s and names are carried through into the report.

## What the checker can and cannot prove

`scripts/check-ats-sources.mjs` performs a single, read-only `GET` against each enabled candidate's `careersUrl`, following normal HTTP redirects, and records:

- the original URL
- the final URL after redirects
- the HTTP status
- the final hostname
- the time checked

It then inspects the returned HTML for **recognized ATS hostname/link patterns**: Lever, Greenhouse, SmartRecruiters, Workday, iCIMS, Taleo, Oracle Fusion Cloud Recruiting, TeamWork Online, SilkRoad, and NEOGOV/GovernmentJobs (exact hostname-suffix rules are documented as comments in the script).

Two evidence tiers:

- **Observed** — the final redirect target itself is on a recognized ATS domain, *or* a clean `href="https://..."` on the page points directly to one. This is the only tier the task allows to count as "the official page directly exposes the ATS URL."
- **Possible / manual review required** — the platform's domain string appears somewhere else in the raw HTML (a script tag, a JSON blob, unlinked text) but not as a direct link. This is deliberately never promoted to "observed" — matching platform names or JavaScript variable names to page appearance alone is not proof of anything.

**What it cannot prove:** whether the ATS actually has a usable public read API, whether it currently has any Jacksonville-relevant or student-relevant postings, or whether the page it read is even still accurate by the time a human looks at it. It does not fetch, follow, or read any ATS-hosted page, application page, or job listing — it only reads the employer's own careers page HTML, once. It never collects applicant information and never scrapes or republishes job descriptions.

## How platform changes are detected

Each run's per-group result (health, final hostname, observed platforms) is compared against the previous run's snapshot, stored in a hidden marker (`<!-- monthly-ats-discovery:state ... -->`) inside the issue body — the same pattern `docs/operations/employer-feed-monitoring.md` uses, and the only state persisted between runs (no database, no committed state file). This surfaces:

- a careers URL that started failing (was healthy last run, isn't now)
- a careers URL whose final redirect hostname changed
- a newly observed platform that wasn't observed last run
- a previously observed platform that's no longer observed
- an observed platform that doesn't match the registry's `expectedPlatform`
- a `NOT VERIFIED` (`investigate`) employer whose page now exposes a recognized ATS link
- a newly observed Lever or Greenhouse board not already `live` or `monitored`

## How false positives are avoided

- Only a direct, absolute `href` to a recognized ATS domain, or a redirect landing on one, counts as "observed." Page text, JavaScript variable names, and unrelated mentions are capped at "possible / manual review required," per the task's explicit rule.
- Oracle Fusion Cloud Recruiting requires *both* an `oraclecloud.com` hostname *and* an `/hcmUI/CandidateExperience/` path, since Oracle Cloud hosts many unrelated products on the same domain.
- A blocked page, timeout, or non-2xx HTTP status is recorded as a warning, never as proof an employer lacks an ATS — the employer's `researchStatus` stays unchanged until a human reviews it.
- The registry validator refuses to load if any `investigate` (`NOT VERIFIED`) entry has a non-null `expectedPlatform` — a platform can never be silently guessed into the registry.

## Monthly schedule

`workflow_dispatch` (manual), a `schedule` trigger (`cron: "23 13 * * 2"`, every Tuesday 13:23 UTC — approximately 9:23 AM America/New_York during Eastern Daylight Time, approximately 8:23 AM America/New_York during Eastern Standard Time), and `pull_request` runs scoped to the four discovery files. GitHub Actions has no native "Nth weekday of month" schedule, so the workflow fires every Tuesday and a "Check first Tuesday" step gates the actual check/issue steps to only run when the UTC day-of-month is 1–7 (i.e., the first Tuesday). Non-first-Tuesday scheduled runs complete as a no-op.

## Manual-run instructions

From the repository's **Actions** tab, select **Monthly ATS Discovery** → **Run workflow** on the `main` branch. A manual run always executes the checker and, if run against `main`, creates or updates the research issue — the first-Tuesday date gate only applies to the `schedule` trigger, not to manual dispatch.

## Issue-report behavior

Exactly one open issue titled **"Monthly ATS Source Research"** is maintained, containing: last checked, total employers reviewed, healthy official careers pages, careers URLs that failed, careers URLs that redirected, existing platform observations, newly detected ATS evidence, employers whose observed platform changed, Lever/Greenhouse candidates requiring validation, NOT VERIFIED employers requiring manual research, manual-only employers, and recommended next actions.

- On every scheduled-on-main-and-first-Tuesday or manual-on-main run: if no open issue with that title exists, one is created; otherwise its body is updated every run.
- A **comment** is added only when a new ATS platform is detected, an observed platform changes, a careers URL redirect changes, a careers page changes between healthy and failing, or a new possible Lever/Greenhouse candidate appears. A no-change run updates the body silently.
- Pull requests touching the four discovery files run the checker and print the full report in the workflow logs, but never create or update the issue.

## How to validate a newly detected Lever or Greenhouse board

Finding a Lever or Greenhouse link here is only step one. Before anything is implemented:

1. Manually confirm the board token by visiting the discovered URL directly.
2. Run a small, local, throwaway, read-only script against the board's public Postings/Job Board API and manually cross-check several real postings, following the same rigor as `docs/integrations/dnb-lever-poc.md`'s manual testing checklist.
3. Document the finding (platform, board token, reachability, current Jacksonville/student-relevant content) in a dedicated integrations doc, the way `docs/integrations/fanatics-greenhouse-validation.md` documents Fanatics.
4. Only then consider adding a `watch`-status entry to `monitoring/employer-feed-watch.json`, with a human reviewing the change.

## How a source moves through the stages

```
research candidate (this registry, researchStatus: investigate/revalidate)
  → observed ATS (this checker found a hostname/link match)
  → technically validated source (a human manually confirmed real, current, relevant data)
  → weekly monitored source (an entry in monitoring/employer-feed-watch.json)
  → qualifying opportunity found (a real Jacksonville student/early-talent posting appears)
  → human review
  → live WorkJax feed (a reviewed entry in live-opportunity-sources.js)
```

**No employer is automatically published at any point in this chain.** Each arrow above requires a separate, human-driven action; this monthly process only ever produces the first step (an "observed" note in an internal issue).

## What this process is not

- It is not a citywide ATS census and does not claim complete coverage of Jacksonville employer platforms — it reflects only the 38 employers currently curated in `data.js`.
- It does not submit applications, create accounts, or access any application-submission endpoint.
- It does not collect applicant information or scrape/republish job descriptions.
- It does not require a personal access token, a database, or an API key.

## Change Log

| Date | Change | Author |
|---|---|---|
| 2026-07-14 | Created the monthly ATS discovery candidate registry, checker script, and GitHub Actions workflow: inspects all 38 current employers' official careers pages for ATS platform evidence, maintains one GitHub issue, and does not modify any monitored or live feed | Claude (implementation task) |
