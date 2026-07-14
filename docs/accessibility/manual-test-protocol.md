# Manual Accessibility Test Protocol — Minimum Prototype Review

**Status:** `NOT YET COMPLETED` — no test in this protocol has been executed. This document defines what still needs to be done; it is not a record of testing that has occurred.

**Formal operator:** `UNASSIGNED`
**Accessibility owner:** `UNASSIGNED`

## Purpose

This is a short, practical protocol for an initial manual pass over Jumpstart Jax, intended to complement the automated Lighthouse evidence in `docs/accessibility/baseline-audit-2026-07-14.md`. It is deliberately scoped as a **minimum** prototype review, not a complete screen-reader audit of every page. A fuller audit against `docs/accessibility/wcag-2.2-aa-checklist.md` remains a separate, larger effort.

Until every item below is executed and its actual result recorded, this protocol remains entirely `NOT YET COMPLETED`. No item may be marked complete without a recorded result, tester, and date.

## Minimum Prototype Review

### 1. Keyboard Navigation — `NOT YET COMPLETED`

| Test | Result |
|---|---|
| Tab and Shift+Tab through the main navigation | `NOT YET COMPLETED` |
| Open an employer detail (via keyboard) | `NOT YET COMPLETED` |
| Operate opportunity filters (via keyboard) | `NOT YET COMPLETED` |
| Operate the Third Spaces theme controls (via keyboard) | `NOT YET COMPLETED` |
| Open and close the profile dialog with the keyboard | `NOT YET COMPLETED` |

### 2. Zoom and Reflow — `NOT YET COMPLETED`

| Test | Result |
|---|---|
| 200% browser zoom — check for clipped text, overlapping controls, or horizontal scrolling | `NOT YET COMPLETED` |
| ~320px mobile width — check for clipped text, overlapping controls, or horizontal scrolling | `NOT YET COMPLETED` |

### 3. Focus — `NOT YET COMPLETED`

| Test | Result |
|---|---|
| Keyboard focus is visible at all times | `NOT YET COMPLETED` |
| Dialog (e.g. profile modal) focus returns to its opening button on close | `NOT YET COMPLETED` |
| Browser Back navigation does not lose focus unexpectedly | `NOT YET COMPLETED` |

### 4. Basic Screen-Reader Spot Check — `NOT YET COMPLETED`

| Element | Result |
|---|---|
| Page title | `NOT YET COMPLETED` |
| Navigation | `NOT YET COMPLETED` |
| Headings | `NOT YET COMPLETED` |
| Profile dialog | `NOT YET COMPLETED` |
| Dynamic results count | `NOT YET COMPLETED` |

## Out of Scope for This Review

This Minimum Prototype Review does not require, and should not be read as including:

* A complete screen-reader audit of every page or feature
* Every WCAG 2.2 Level AA success criterion (see `docs/accessibility/wcag-2.2-aa-checklist.md` for the full tracked list)
* Contrast measurement or ratio recording (tracked separately under finding A11Y-001 in `docs/accessibility/baseline-audit-2026-07-14.md`)
* Mobile touch-target measurement
* Testing with people with disabilities

## Recording Results

When this protocol is executed, replace each `NOT YET COMPLETED` with the actual result, the tester's name, and the date, and add corresponding entries to `docs/accessibility/accessibility-audit-log.md`. Do not mark any row complete without a recorded result.

## Change Log

| Date | Change | Author |
|---|---|---|
| 2026-07-14 | Initial Minimum Prototype Review protocol created; all items NOT YET COMPLETED | WorkJax documentation |
