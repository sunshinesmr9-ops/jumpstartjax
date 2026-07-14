# WCAG 2.2 AA Checklist

**Status:** `ASSESSMENT IN PROGRESS` — three items below (marked with real evidence and linked to `docs/accessibility/baseline-audit-2026-07-14.md`) have preliminary automated Lighthouse evidence, limited to the Home page only. Every other item remains `NOT ASSESSED`. This checklist is still a tracking structure, not a completed audit.

**Standard:** WCAG 2.2, Level AA (proposed WorkJax technical target — see `docs/operations/accessibility.md`)
**Formal operator:** `UNASSIGNED`
**Accessibility owner:** `UNASSIGNED`

Do not mark any requirement as passed or failed without documented testing evidence. Every item below is initialized as `NOT ASSESSED`, with `reviewer: UNASSIGNED` and `remediation owner: UNASSIGNED`, until a real test is performed and recorded.

Each item lists: requirement, related WCAG success criterion, applicability to WorkJax, test method, evidence, status, review date, reviewer, remediation owner.

## Global Structure

| Requirement | WCAG SC | Applicability | Test Method | Evidence | Status | Review Date | Reviewer | Remediation Owner |
|---|---|---|---|---|---|---|---|---|
| Semantic HTML and meaningful landmarks (header, nav, main, footer) | 1.3.1 | Site-wide | Manual code review, accessibility-tree inspection | Lighthouse mobile audit found no main landmark on Home (A11Y-003, preliminary) — see `docs/accessibility/baseline-audit-2026-07-14.md` | ASSESSMENT IN PROGRESS — MANUAL VERIFICATION REQUIRED | 2026-07-14 | UNASSIGNED | UNASSIGNED |
| Logical heading structure (no skipped levels, one H1 per page) | 1.3.1, 2.4.6 | Site-wide | Manual review, heading-outline tool | Lighthouse desktop + mobile audits found headings not in sequential order on Home (A11Y-002, preliminary) — see `docs/accessibility/baseline-audit-2026-07-14.md` | ASSESSMENT IN PROGRESS — MANUAL VERIFICATION REQUIRED | 2026-07-14 | UNASSIGNED | UNASSIGNED |
| Descriptive page titles | 2.4.2 | Every page/view | Manual review | — | NOT ASSESSED | — | UNASSIGNED | UNASSIGNED |
| Document and content language attributes | 3.1.1 | Site-wide | Manual code review | — | NOT ASSESSED | — | UNASSIGNED | UNASSIGNED |

## Navigation

| Requirement | WCAG SC | Applicability | Test Method | Evidence | Status | Review Date | Reviewer | Remediation Owner |
|---|---|---|---|---|---|---|---|---|
| Consistent navigation and component identification across pages | 3.2.3, 3.2.4 | Site-wide nav | Manual review across pages | — | NOT ASSESSED | — | UNASSIGNED | UNASSIGNED |
| Descriptive link and button text | 2.4.4, 2.4.9 | Site-wide | Manual review | — | NOT ASSESSED | — | UNASSIGNED | UNASSIGNED |
| Multiple ways to locate content (nav + search/filters) | 2.4.5 | Opportunities, Experience Jax | Manual review | — | NOT ASSESSED | — | UNASSIGNED | UNASSIGNED |

## Keyboard and Focus

| Requirement | WCAG SC | Applicability | Test Method | Evidence | Status | Review Date | Reviewer | Remediation Owner |
|---|---|---|---|---|---|---|---|---|
| Keyboard access to all interactive functionality | 2.1.1 | Site-wide | Manual keyboard-only walkthrough | — | NOT ASSESSED | — | UNASSIGNED | UNASSIGNED |
| No keyboard trap | 2.1.2 | Site-wide, especially modals | Manual keyboard-only walkthrough | — | NOT ASSESSED | — | UNASSIGNED | UNASSIGNED |
| Visible keyboard focus | 2.4.7, 2.4.11 | Site-wide | Manual keyboard walkthrough | — | NOT ASSESSED | — | UNASSIGNED | UNASSIGNED |
| Logical focus order | 2.4.3 | Site-wide | Manual keyboard walkthrough | — | NOT ASSESSED | — | UNASSIGNED | UNASSIGNED |
| Consistent, predictable help/control placement | 3.2.6 | Site-wide | Manual review | — | NOT ASSESSED | — | UNASSIGNED | UNASSIGNED |
| Dragging movements have a single-pointer alternative | 2.5.7 | Map interactions, if any | Manual review | — | NOT ASSESSED | — | UNASSIGNED | UNASSIGNED |
| Target size (minimum) | 2.5.8 | Site-wide interactive controls | Manual measurement | — | NOT ASSESSED | — | UNASSIGNED | UNASSIGNED |

## Images and Media

| Requirement | WCAG SC | Applicability | Test Method | Evidence | Status | Review Date | Reviewer | Remediation Owner |
|---|---|---|---|---|---|---|---|---|
| Text alternatives for meaningful images | 1.1.1 | Site-wide, including Community Event Platform daypart images | Manual code review, screen reader | — | NOT ASSESSED | — | UNASSIGNED | UNASSIGNED |
| Empty alt for decorative images | 1.1.1 | Site-wide | Manual code review | — | NOT ASSESSED | — | UNASSIGNED | UNASSIGNED |
| Captions and transcripts for multimedia | 1.2.2, 1.2.3 | Any future audio/video content | Manual review | — | NOT ASSESSED | — | UNASSIGNED | UNASSIGNED |

## Color and Visual Presentation

| Requirement | WCAG SC | Applicability | Test Method | Evidence | Status | Review Date | Reviewer | Remediation Owner |
|---|---|---|---|---|---|---|---|---|
| Text color contrast (4.5:1 normal, 3:1 large text) | 1.4.3 | Site-wide | Automated contrast tool, manual spot check | Lighthouse desktop + mobile audits found insufficient contrast on Home (A11Y-001, preliminary); affected elements and exact ratios not yet recorded — see `docs/accessibility/baseline-audit-2026-07-14.md` | ASSESSMENT IN PROGRESS — MANUAL VERIFICATION REQUIRED | 2026-07-14 | UNASSIGNED | UNASSIGNED |
| Non-text contrast (UI components, graphics) | 1.4.11 | Site-wide controls | Automated + manual contrast check | — | NOT ASSESSED | — | UNASSIGNED | UNASSIGNED |
| Information not conveyed by color alone | 1.4.1 | Filters, status indicators, daypart theming | Manual review | — | NOT ASSESSED | — | UNASSIGNED | UNASSIGNED |
| Text resize to 200% without loss of content/function | 1.4.4 | Site-wide | Manual browser zoom test | — | NOT ASSESSED | — | UNASSIGNED | UNASSIGNED |
| Reflow at 320px-equivalent width without two-dimensional scrolling | 1.4.10 | Site-wide | Manual viewport resize test | — | NOT ASSESSED | — | UNASSIGNED | UNASSIGNED |
| Reduced-motion support where animation is present | 2.3.3 (AAA, tracked as best practice) | Daypart theming, any transitions | Manual review with reduced-motion OS setting | — | NOT ASSESSED | — | UNASSIGNED | UNASSIGNED |
| No content flashes more than three times per second | 2.3.1 | Site-wide | Manual review | — | NOT ASSESSED | — | UNASSIGNED | UNASSIGNED |

## Forms and Errors

| Requirement | WCAG SC | Applicability | Test Method | Evidence | Status | Review Date | Reviewer | Remediation Owner |
|---|---|---|---|---|---|---|---|---|
| Programmatic form labels | 1.3.1, 4.1.2 | Profile-creation form, filters | Manual code review, screen reader | — | NOT ASSESSED | — | UNASSIGNED | UNASSIGNED |
| Accessible instructions | 3.3.2 | Profile-creation form | Manual review | — | NOT ASSESSED | — | UNASSIGNED | UNASSIGNED |
| Accessible error identification and description | 3.3.1, 3.3.3 | Profile-creation form | Manual review, screen reader | — | NOT ASSESSED | — | UNASSIGNED | UNASSIGNED |
| Redundant entry avoided | 3.3.7 | Multi-step forms, if any | Manual review | — | NOT ASSESSED | — | UNASSIGNED | UNASSIGNED |

## Dynamic Content

| Requirement | WCAG SC | Applicability | Test Method | Evidence | Status | Review Date | Reviewer | Remediation Owner |
|---|---|---|---|---|---|---|---|---|
| Status messages available to assistive technologies | 4.1.3 | Save/RSVP/"I'll Be There" confirmations | Screen-reader test | — | NOT ASSESSED | — | UNASSIGNED | UNASSIGNED |
| Filter/search result updates announced or discoverable | 4.1.3 | Opportunities search/filter | Screen-reader test | — | NOT ASSESSED | — | UNASSIGNED | UNASSIGNED |

## Modals and Overlays

| Requirement | WCAG SC | Applicability | Test Method | Evidence | Status | Review Date | Reviewer | Remediation Owner |
|---|---|---|---|---|---|---|---|---|
| Focus moves into modal on open | 2.4.3, 4.1.2 | Any modal/dialog in the site | Manual keyboard test | — | NOT ASSESSED | — | UNASSIGNED | UNASSIGNED |
| Focus is contained while modal is open | 2.1.2 | Any modal/dialog | Manual keyboard test | — | NOT ASSESSED | — | UNASSIGNED | UNASSIGNED |
| Escape closes the modal | 2.1.1 | Any modal/dialog | Manual keyboard test | — | NOT ASSESSED | — | UNASSIGNED | UNASSIGNED |
| Focus returns to the triggering control on close | 2.4.3 | Any modal/dialog | Manual keyboard test | — | NOT ASSESSED | — | UNASSIGNED | UNASSIGNED |

## Theme Controls and Expandable Content

*(Renamed 2026-07-14 from "Tabs and Accordions." The nested `role="tablist"`/`tab`/`tabpanel` pattern this section previously tracked was removed from Third Spaces on 2026-07-14 — see `docs/features/community-event-platform.md` §2 and §6. Third Spaces is now one continuous page; the rows below track its current native-button theme-preview controls instead.)*

| Requirement | WCAG SC | Applicability | Test Method | Evidence | Status | Review Date | Reviewer | Remediation Owner |
|---|---|---|---|---|---|---|---|---|
| Morning/Afternoon/Evening theme-preview buttons operable via native `<button>` keyboard activation (Enter/Space) | 2.1.1 | Third Spaces — Community Event Platform theme-preview controls | Manual keyboard test | — | NOT ASSESSED | — | UNASSIGNED | UNASSIGNED |
| Selected theme-preview button correctly exposes `aria-pressed` state | 4.1.2 | Third Spaces — Community Event Platform theme-preview controls | Manual code review, screen reader | — | NOT ASSESSED | — | UNASSIGNED | UNASSIGNED |
| Visible keyboard focus on theme-preview and "Use my current time" buttons | 2.4.7 | Third Spaces — Community Event Platform theme-preview controls | Manual keyboard test | — | NOT ASSESSED | — | UNASSIGNED | UNASSIGNED |
| Device-time theme status announced to assistive technology (`role="status"`) | 4.1.3 | Third Spaces — Community Event Platform theme-status text | Screen-reader test | — | NOT ASSESSED | — | UNASSIGNED | UNASSIGNED |
| "Use my current time" control restores automatic theme selection and is keyboard operable | 2.1.1, 4.1.2 | Third Spaces — Community Event Platform | Manual keyboard test | — | NOT ASSESSED | — | UNASSIGNED | UNASSIGNED |
| Expandable content using native `<details>`/`<summary>` is keyboard operable and exposes correct expanded/collapsed state | 4.1.2 | Employer detail — live-opportunity "Explore internship areas" sections | Manual keyboard test, screen reader | — | NOT ASSESSED | — | UNASSIGNED | UNASSIGNED |

*Note: `docs/features/community-event-platform.md` §8 and §13 describe the current theme-preview implementation (native buttons, `aria-pressed`, visible focus, `role="status"`) as a code-level implementation note, not a completed WCAG evaluation. Every row above remains `NOT ASSESSED` until a documented test is performed.*

## Tables and Lists

| Requirement | WCAG SC | Applicability | Test Method | Evidence | Status | Review Date | Reviewer | Remediation Owner |
|---|---|---|---|---|---|---|---|---|
| Lists marked up as lists; tables (if any) have headers | 1.3.1 | Opportunity/event listing structures | Manual code review | — | NOT ASSESSED | — | UNASSIGNED | UNASSIGNED |

## Maps and Visualizations

| Requirement | WCAG SC | Applicability | Test Method | Evidence | Status | Review Date | Reviewer | Remediation Owner |
|---|---|---|---|---|---|---|---|---|
| Accessible alternative to map-only information (Employer Map) | 1.1.1, 1.3.1 | Employer Map (Leaflet) | Manual review, screen reader | — | NOT ASSESSED | — | UNASSIGNED | UNASSIGNED |
| Map controls operable by keyboard | 2.1.1 | Employer Map | Manual keyboard test | — | NOT ASSESSED | — | UNASSIGNED | UNASSIGNED |

## Responsive Behavior

| Requirement | WCAG SC | Applicability | Test Method | Evidence | Status | Review Date | Reviewer | Remediation Owner |
|---|---|---|---|---|---|---|---|---|
| Adequate touch-target sizing on mobile | 2.5.8 | Site-wide, mobile viewport | Manual measurement on device/emulator | — | NOT ASSESSED | — | UNASSIGNED | UNASSIGNED |
| Layout reflows correctly at narrow widths | 1.4.10 | Site-wide, mobile viewport | Manual device/emulator test | — | NOT ASSESSED | — | UNASSIGNED | UNASSIGNED |

## Third-Party Content

| Requirement | WCAG SC | Applicability | Test Method | Evidence | Status | Review Date | Reviewer | Remediation Owner |
|---|---|---|---|---|---|---|---|---|
| Review of accessibility barriers on external employer/event destination sites | Not a WCAG SC — WorkJax operational review | Outbound application/event links | Manual spot-check of linked destinations | — | NOT ASSESSED | — | UNASSIGNED | UNASSIGNED |
| Leaflet/map-tile third-party component reviewed for keyboard/AT support | 2.1.1, 4.1.2 | Employer Map | Manual review | — | NOT ASSESSED | — | UNASSIGNED | UNASSIGNED |

## Testing Evidence

| Requirement | WCAG SC | Applicability | Test Method | Evidence | Status | Review Date | Reviewer | Remediation Owner |
|---|---|---|---|---|---|---|---|---|
| Automated scan performed and recorded | Supports multiple SCs, not a substitute for manual testing | Home page only (not site-wide) | Chrome Lighthouse (Navigation audit) | Two runs recorded 2026-07-14: Home desktop (score 94), Home mobile (score 92) — see `docs/accessibility/baseline-audit-2026-07-14.md` | ASSESSMENT IN PROGRESS — Home page only, other pages/states not yet scanned | 2026-07-14 | UNASSIGNED | UNASSIGNED |
| Manual keyboard-only walkthrough performed and recorded | 2.1.1, 2.4.3, 2.4.7 | Site-wide | Manual | — | NOT ASSESSED | — | UNASSIGNED | UNASSIGNED |
| Screen-reader/accessibility-tree review performed and recorded | 4.1.2, 4.1.3 | Site-wide | Manual, screen reader (NVDA/VoiceOver/JAWS TBD) | — | NOT ASSESSED | — | UNASSIGNED | UNASSIGNED |
| Testing with people with disabilities (if feasible) | Best practice, not a single SC | Site-wide | Usability testing | — | NOT ASSESSED | — | UNASSIGNED | UNASSIGNED |

## Sources

Summarized from: W3C WCAG 2.2 Recommendation, W3C Understanding Conformance, W3C How to Meet WCAG (Quick Reference), and W3C Evaluating Web Accessibility Overview. Success-criterion numbers are cited for traceability; consult the official W3C Quick Reference for full normative text before conducting a real evaluation.

## Change Log

| Date | Change | Author |
|---|---|---|
| 2026-07-14 | Renamed "Tabs and Accordions" to "Theme Controls and Expandable Content" and replaced its outdated nested-tab/tablist/tabpanel/roving-tabindex rows (removed from Third Spaces 2026-07-14) with NOT ASSESSED rows for the current Morning/Afternoon/Evening theme-preview buttons, aria-pressed state, visible focus, role="status" announcement, "Use my current time" control, and native details/summary expandable content | WorkJax documentation |
| 2026-07-14 | Updated contrast, heading-structure, landmark, and automated-scan rows with preliminary Lighthouse Home-page evidence (A11Y-001, A11Y-002, A11Y-003); overall checklist status changed from NOT ASSESSED to ASSESSMENT IN PROGRESS; all other rows remain NOT ASSESSED | WorkJax documentation |
| 2026-07-14 | Initial checklist structure created; all items NOT ASSESSED | WorkJax documentation |
