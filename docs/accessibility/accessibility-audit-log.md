# Accessibility Audit Log

**Site accessibility status:** `ASSESSMENT IN PROGRESS`
**Formal operator:** `UNASSIGNED`
**Accessibility owner:** `UNASSIGNED`
**Reviewer:** `UNASSIGNED`

`ASSESSMENT IN PROGRESS` reflects the real Lighthouse evidence recorded below for the Home page only (see `docs/accessibility/baseline-audit-2026-07-14.md`). It does not mean a site-wide or WCAG 2.2 Level AA evaluation has been completed — most pages, states, and test types below remain unaudited.

## How to Use This Log

Each audit entry must record:

* Audit date
* Deployment or commit reviewed
* Pages and feature states reviewed
* WCAG version and level
* Reviewer
* Organizational accessibility owner (at time of audit)
* Tools used
* Manual tests performed
* Assistive technologies used
* Findings (one row per finding, with severity, affected feature, WCAG criterion, remediation owner, target date, resolution evidence, retest date, final status)
* Known exclusions (pages/features intentionally out of scope for that audit)

Do not mark a finding resolved without resolution evidence and a retest date. Do not change the site-wide accessibility status without a documented audit supporting the change.

## Pre-Audit Entry (historical)

This entry records the state of this log before any real audit had been performed. It is retained for history; it has been superseded by the audit entry below.

| Field | Value |
|---|---|
| Audit date | Not yet performed |
| Deployment or commit reviewed | N/A |
| Pages and feature states reviewed | N/A — no audit has occurred |
| WCAG version and level | WCAG 2.2 Level AA (proposed target; not yet evaluated against) |
| Reviewer | UNASSIGNED |
| Organizational accessibility owner | UNASSIGNED |
| Tools used | None |
| Manual tests performed | None |
| Assistive technologies used | None |
| Findings | None recorded |
| Known exclusions | Entire site is out of scope for this baseline entry — no assessment has occurred |
| Final status | NOT ASSESSED |

## Audit Entry — 2026-07-14 (Lighthouse Navigation Audit, Home Page Only)

| Field | Value |
|---|---|
| Audit date | 2026-07-14 |
| Deployment or commit reviewed | Current `main` at time of audit (specific commit not recorded) |
| Pages and feature states reviewed | Home page, default state only — desktop and mobile |
| WCAG version and level | WCAG 2.2 Level AA (proposed target; audit does not itself constitute a conformance evaluation) |
| Reviewer | UNASSIGNED |
| Organizational accessibility owner | UNASSIGNED |
| Tools used | Chrome Lighthouse (Navigation audit) |
| Manual tests performed | None |
| Assistive technologies used | None |
| Findings | See A11Y-001, A11Y-002, A11Y-003 below |
| Known exclusions | Find Opportunities, Employer Map, Third Spaces, Community Hub, and Employer Detail pages (Lighthouse Navigation mode reloads to Home and cannot audit these in-app states); all keyboard, screen-reader, zoom/reflow, and touch-target testing; specific contrast elements/ratios; specific heading text/levels |
| Final status | ASSESSMENT IN PROGRESS — Home-page automated evidence only, not site-wide, not a WCAG conformance determination |

Full detail: `docs/accessibility/baseline-audit-2026-07-14.md`.

## Findings Log

| Finding ID | Audit Date | Affected Feature | WCAG Criterion | Severity | Description | Remediation Owner | Target Date | Resolution Evidence | Retest Date | Final Status |
|---|---|---|---|---|---|---|---|---|---|---|
| A11Y-001 | 2026-07-14 | Home (desktop + mobile) | 1.4.3 Contrast (Minimum) (preliminary) | Medium | Background and foreground colors do not have a sufficient contrast ratio (Lighthouse finding; affected elements and exact ratios not yet recorded) | UNASSIGNED | — | — | — | OPEN — MANUAL VERIFICATION REQUIRED |
| A11Y-002 | 2026-07-14 | Home (desktop + mobile) | 1.3.1 Info and Relationships (preliminary) | Medium | Heading elements are not in sequentially descending order (Lighthouse finding; affected heading text/levels not yet recorded) | UNASSIGNED | — | — | — | OPEN — MANUAL VERIFICATION REQUIRED |
| A11Y-003 | 2026-07-14 | Home (mobile audit only) | 1.3.1 Info and Relationships; 2.4.1 Bypass Blocks (preliminary) | Medium | The document does not have a main landmark (Lighthouse finding; landmark inspection not yet performed) | UNASSIGNED | — | — | — | OPEN — MANUAL VERIFICATION REQUIRED |

No finding above is resolved. None has a remediation owner, target date, resolution evidence, or retest date yet — per this log's own rule, none may be marked resolved without that evidence.

## Change Log

| Date | Change | Author |
|---|---|---|
| 2026-07-14 | Recorded first real audit entry: Chrome Lighthouse Navigation audit of Home page (desktop 94, mobile 92); opened findings A11Y-001, A11Y-002, A11Y-003; site accessibility status changed from NOT ASSESSED to ASSESSMENT IN PROGRESS | WorkJax documentation |
| 2026-07-14 | Log structure created with baseline NOT ASSESSED entry; no audit performed | WorkJax documentation |
