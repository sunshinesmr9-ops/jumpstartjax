# Baseline Accessibility Audit — 2026-07-14

**Status:** `ASSESSMENT IN PROGRESS`
**Audit type:** Chrome Lighthouse Navigation audit (automated tool only)
**Scope:** Home page, default state only — desktop and mobile
**This is not a site-wide accessibility assessment and does not establish WCAG conformance.**

## Ownership Status

| Field | Value |
|---|---|
| Formal operator | `UNASSIGNED` |
| Product owner | `UNASSIGNED` |
| Accessibility owner | `UNASSIGNED` |
| Accessibility remediation owner | `UNASSIGNED` |
| Public accessibility feedback contact | `NOT YET ESTABLISHED` |
| Legal applicability review | `PENDING OPERATOR DESIGNATION` |

Repository technical custody does not establish legal or organizational ownership of Jumpstart Jax, and does not assign accessibility, remediation, or complaint-handling responsibility to any current contributor, the repository owner, or Jacksonville Civic Council. See `docs/README.md` and `docs/operations/accessibility.md`.

## 1. What This Audit Is, and Is Not

This document records the first real, tool-generated accessibility evidence collected for Jumpstart Jax: two Chrome Lighthouse Navigation-mode audits (desktop and mobile) of the Home page in its default state.

It is **not**:

* A site-wide accessibility score or evaluation
* A WCAG 2.2 Level AA conformance determination
* A substitute for manual keyboard, screen-reader, zoom/reflow, contrast, or touch-target testing
* Evidence about any page or state other than Home in its default, freshly loaded state

Automated tools such as Lighthouse detect only a subset of possible accessibility issues and cannot, by themselves, establish WCAG conformance (see `docs/operations/accessibility.md`, Section 2).

## 2. Evidence Collected

### Home — Desktop

* **Test type:** Chrome Lighthouse Navigation audit
* **Accessibility score:** 94

**Findings:**

1. Background and foreground colors do not have a sufficient contrast ratio.
2. Heading elements are not in sequentially descending order.

### Home — Mobile

* **Test type:** Chrome Lighthouse Navigation audit
* **Accessibility score:** 92

**Findings:**

1. Background and foreground colors do not have a sufficient contrast ratio.
2. Heading elements are not in sequentially descending order.
3. The document does not have a main landmark.

## 3. Evidence Limitations

* These findings apply only to the default Home page state — no other page or interaction state was audited.
* The scores above (94, 92) are Home-page Lighthouse scores, not site-wide accessibility scores. No overall Jumpstart Jax accessibility score exists.
* Jumpstart Jax is a single-page application (all routes render on one document via `app.js`'s history routing — see `docs/features/browser-navigation.md`).
* Lighthouse's Navigation mode reloads the site from scratch for each audit and lands on Home, so a Navigation-mode run cannot audit the Find Opportunities, Employer Map, Third Spaces, or Community Hub views as they actually render in the app.
* Find Opportunities, Employer Map, Third Spaces, and Community Hub have not yet received Lighthouse **Snapshot**-mode audits (the mode needed to audit those in-app states without a reload).
* The specific elements affected by the contrast finding, and their exact foreground/background colors and computed contrast ratios, have not yet been recorded.
* Keyboard-only navigation testing has not yet been performed.
* VoiceOver or other screen-reader testing has not yet been performed.
* Zoom (200%) and reflow (~320px width) testing has not yet been performed.
* Mobile touch-target sizing testing has not yet been performed.
* Automated tools cannot establish WCAG conformance on their own; a documented manual evaluation is still required before any conformance status may be claimed.

No results beyond what is recorded above have been collected. This document does not infer, estimate, or fill in untested pages, elements, or ratios.

## 4. Preliminary Findings

The WCAG success-criterion mappings below are preliminary — based on the general Lighthouse audit category, not a manual criterion-by-criterion review — and must be treated as provisional until a human reviewer manually verifies each one.

### A11Y-001 — Insufficient color contrast

| Field | Value |
|---|---|
| Page | Home |
| Evidence | Lighthouse desktop and mobile audits, 2026-07-14 |
| Likely WCAG criterion (preliminary) | 1.4.3 Contrast (Minimum) |
| Severity | Medium |
| Status | `OPEN — MANUAL VERIFICATION REQUIRED` |
| Remediation owner | `UNASSIGNED` |
| Needed next evidence | Affected elements, their foreground/background colors, measured contrast ratios, and the required ratio for each |

### A11Y-002 — Heading hierarchy is not sequential

| Field | Value |
|---|---|
| Page | Home |
| Evidence | Lighthouse desktop and mobile audits, 2026-07-14 |
| Likely WCAG criterion (preliminary) | 1.3.1 Info and Relationships |
| Severity | Medium |
| Status | `OPEN — MANUAL VERIFICATION REQUIRED` |
| Remediation owner | `UNASSIGNED` |
| Needed next evidence | Affected heading text and current heading levels |

### A11Y-003 — Main landmark not identified

| Field | Value |
|---|---|
| Page | Home (mobile audit only) |
| Evidence | Lighthouse mobile audit, 2026-07-14 |
| Likely WCAG criteria (preliminary) | 1.3.1 Info and Relationships; 2.4.1 Bypass Blocks |
| Severity | Medium |
| Status | `OPEN — MANUAL VERIFICATION REQUIRED` |
| Remediation owner | `UNASSIGNED` |
| Needed next evidence | Inspection of the rendered page's landmark structure |

These three findings are also recorded in `docs/accessibility/accessibility-audit-log.md` and reflected in `docs/accessibility/wcag-2.2-aa-checklist.md`. None is resolved; none has a remediation owner or target date yet.

## 5. Next Steps

* Execute `docs/accessibility/manual-test-protocol.md` (Minimum Prototype Review) — not yet completed.
* Record the specific elements, colors, and ratios needed to close out A11Y-001.
* Record the specific heading text/levels needed to close out A11Y-002.
* Inspect rendered landmarks to close out A11Y-003.
* Run Lighthouse Snapshot audits (or equivalent) against Find Opportunities, Employer Map, Third Spaces, and Community Hub in their actual rendered states.
* Assign a remediation owner once a formal operator exists (see `docs/operations/accessibility.md`, Section 9).

## Change Log

| Date | Change | Author |
|---|---|---|
| 2026-07-14 | Initial baseline audit created from two real Chrome Lighthouse Navigation audits (Home desktop + mobile); three preliminary findings opened | WorkJax documentation |
