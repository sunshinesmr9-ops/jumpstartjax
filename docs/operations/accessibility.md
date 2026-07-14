# Accessibility Policy

**Status:** `PROPOSED` — a policy prepared for the eventual WorkJax operator. It is not yet formally adopted because no formal operator exists.

**Current WorkJax accessibility status:** `NOT ASSESSED`

**Formal WorkJax operator:** `UNASSIGNED`
**Product owner:** `UNASSIGNED`
**Accessibility owner:** `UNASSIGNED`
**Accessibility remediation owner:** `UNASSIGNED`
**Public accessibility feedback contact:** `NOT YET ESTABLISHED`
**Accessibility response timeline:** `NOT YET ESTABLISHED`
**Legal applicability review:** `PENDING OPERATOR DESIGNATION`

Repository technical custody (see `docs/README.md`) reflects who currently maintains the code and documentation. It does **not** make the current repository owner, current project contributors, the Civic Collaboration team, or Jacksonville Civic Council the legal or organizational operator of WorkJax, and none of them are assigned accessibility ownership, remediation ownership, or complaint-handling responsibility by this document. Those roles remain `UNASSIGNED` until a formal operator accepts them in writing.

## 1. Purpose and Scope

This policy defines how accessibility should be addressed across the WorkJax product lifecycle, for the eventual formally designated operator to adopt, adapt, and staff. It applies to content creation, interface design, frontend development, third-party integration review, testing, deployment, maintenance, feedback handling, and remediation.

This document does not certify that WorkJax is currently accessible. It establishes the target standard and process a future operator is expected to implement and document.

## 2. Legal and Technical Distinctions

* **WCAG** (Web Content Accessibility Guidelines) is a technical standard published by the W3C describing testable success criteria for web content.
* **The ADA** (Americans with Disabilities Act) is a U.S. civil-rights law. It is not itself a technical checklist, and meeting a technical standard is not automatically identical to legal compliance.
* WCAG 2.2 incorporates the applicable WCAG 2.1 success criteria, except for the obsolete Parsing criterion removed in WCAG 2.2.
* The U.S. Department of Justice's Title II rule specifically references **WCAG 2.1 Level AA** as the technical standard for covered state and local government web content and mobile applications.
* Whether ADA Title II, ADA Title III, Section 504, Section 508, contractual requirements, or procurement standards apply to WorkJax depends on the eventual operator, its partners, funders, contracts, and services. This document does not reach that legal conclusion. Legal applicability must be reviewed by the formally designated operator or qualified counsel: `PENDING OPERATOR DESIGNATION`.
* Passing an automated accessibility scan does not, by itself, establish WCAG conformance. Automated tools detect only a subset of possible issues.
* Existing accessible patterns in part of the site (for example, an accessible tab widget in one feature) do not establish conformance for the site as a whole.

## 3. Proposed Technical Standard

**WorkJax targets WCAG 2.2 Level AA** as its proposed design and engineering baseline for both existing and future features.

WorkJax must not be publicly described as compliant, fully accessible, or WCAG certified until a documented evaluation has been completed for a defined scope, per the status terminology in Section 8.

## 4. Policy Organized by the Four WCAG Principles

### 4.1 Perceivable

* Provide text alternatives for meaningful images; use empty `alt=""` for purely decorative images.
* Provide captions and transcripts for multimedia.
* Maintain sufficient text and non-text color contrast.
* Never communicate information through color alone.
* Support text resizing, browser zoom, and reflow at narrow viewport widths.
* Ensure custom controls, maps, and visual-only information have accessible alternatives or equivalent text.

### 4.2 Operable

* All interactive functionality must be reachable and operable by keyboard alone.
* Keyboard focus must be visible at all times.
* Focus order must be logical and must match visual/reading order.
* Modals must place focus appropriately on open, contain focus while open, support `Escape` to close, and return focus to the triggering control on close.
* Tabs, accordions, menus, filters, maps, and dialogs must be operable and understandable with a keyboard and assistive technology.
* Provide adequate touch-target sizing.
* Respect reduced-motion preferences where animation is present.
* Avoid flashing content that could trigger seizures.
* Maintain consistent navigation and consistent identification of repeated components.

### 4.3 Understandable

* Use semantic HTML and meaningful landmarks.
* Maintain a logical heading structure.
* Use descriptive page titles.
* Use descriptive link and button text (avoid "click here" / "read more" with no context).
* Provide programmatic form labels, accessible instructions, and accessible error messages.
* Make status messages available to assistive technologies (for example, via appropriate live-region techniques).
* Set correct document and content language attributes.
* Give custom controls correct names, roles, values, and states.

### 4.4 Robust

* Use markup that assistive technologies can reliably parse and interpret.
* Test with real devices, keyboards, and assistive technologies, not automated tools alone.
* Review third-party and embedded content (maps, embeds, external widgets) for the same standard.
* Review accessibility barriers on external employer and event destination sites where WorkJax links out, and document what happens when an external destination is inaccessible.

## 5. Lifecycle Requirements

| Stage | Requirement |
|---|---|
| Content creation | Write descriptive alt text, plain-language copy, and meaningful link/button text before publishing. |
| Interface design | Design with sufficient contrast, visible focus states, adequate touch targets, and non-color-only signaling from the start. |
| Frontend development | Use semantic HTML, correct ARIA only when needed, keyboard support, and logical focus management for every interactive component. |
| Third-party integration review | Evaluate any embedded widget, map, or external script against this policy before adoption; document known limitations. |
| Testing | Combine automated tools with manual keyboard, focus, zoom/reflow, contrast, and screen-reader/accessibility-tree testing before and after material changes. |
| Deployment | Do not deploy a materially changed interactive feature without the test record described in Section 7. |
| Maintenance | Re-test after significant content, layout, or interaction changes, not only at initial launch. |
| Feedback handling | Provide a way for users to report accessibility barriers once a formal operator and feedback contact exist (see Section 9). |
| Remediation | Track findings, severity, owner, and target date in the accessibility audit log until resolved. |

## 6. Required Coverage for New or Materially Changed Features

When applicable, a new or materially changed feature must address:

1. Semantic HTML and meaningful landmarks
2. Logical heading structure
3. Descriptive page titles
4. Text alternatives for meaningful images
5. Empty alt attributes for decorative images
6. Captions and transcripts for multimedia
7. Keyboard access to all interactive functionality
8. Visible keyboard focus
9. Logical focus order
10. Modal focus placement, containment, Escape behavior, and focus return
11. Accessible tabs, accordions, menus, filters, maps, and dialogs
12. Descriptive link and button text
13. Programmatic form labels
14. Accessible instructions and errors
15. Status messages available to assistive technologies
16. Sufficient text and non-text color contrast
17. Information not communicated through color alone
18. Text resizing and browser zoom
19. Reflow at narrow viewport widths
20. Adequate touch-target sizing
21. Reduced-motion support where animation is present
22. Protection from flashing content
23. Consistent navigation and component identification
24. Appropriate document and content language attributes
25. Correct names, roles, values, and states for custom controls
26. Accessible alternatives for maps and visual-only information
27. Review of accessibility barriers on external employer and event sites
28. Device, keyboard, and assistive-technology testing

Use `docs/accessibility/wcag-2.2-aa-checklist.md` to track applicability, evidence, and status for each item, and `docs/templates/feature-template.md` to record this at the feature level.

## 7. Required Release Rule

**A new or materially changed feature must not be described as accessibility verified merely because it passes an automated test.**

Before a feature is marked accessibility verified, document all of the following:

* Automated test results
* Keyboard test
* Focus-order and focus-visibility test
* Zoom and reflow test
* Color-contrast test
* Accessibility-tree or screen-reader review
* Mobile and touch-target review
* Known limitations
* Reviewer
* Review date

When no formal accessibility owner exists, the test record may identify the person who performed the review, but that reviewer must not be described as the organizational accessibility owner.

## 8. Status Terminology

Use only these statuses:

* `NOT ASSESSED`
* `ASSESSMENT IN PROGRESS`
* `REMEDIATION REQUIRED`
* `PARTIALLY CONFORMANT`
* `CONFORMANT FOR REVIEWED SCOPE`

Do not use `ADA COMPLIANT`, `FULLY ACCESSIBLE`, or `WCAG CERTIFIED`, unless quoting and clearly attributing an external source that uses that language.

`CONFORMANT FOR REVIEWED SCOPE` must always identify: pages and functionality reviewed, WCAG version, conformance level, review date, reviewer, testing methods, exclusions, and known limitations.

The current WorkJax accessibility status is `NOT ASSESSED`.

## 9. Ownership Prerequisites

Formal operator designation is required before WorkJax can establish:

* A public accessibility-feedback channel
* A guaranteed response timeline
* A formal complaint process
* A remediation service-level expectation
* A public organizational accessibility commitment
* A named accessibility owner
* A published accessibility statement identifying a responsible entity

These are launch-governance prerequisites. They are not responsibilities that automatically fall to the prototype's current repository owner or contributors.

The future operator may assign temporary responsibilities during a transition period, but any such assignment must be written, accepted, dated, and scoped — not implied by repository access or documentation authorship.

## 10. Feedback and Remediation (Future State)

Once a formal operator is designated, this policy expects the operator to publish:

* A feedback contact (currently `NOT YET ESTABLISHED`)
* A response timeline (currently `NOT YET ESTABLISHED`)
* A remediation process with tracked findings, severity, owner, and target date, recorded in `docs/accessibility/accessibility-audit-log.md`

## 11. Sources

Primary technical and legal sources:

* W3C Web Accessibility Initiative — WCAG 2 Overview
* W3C — WCAG 2.2 Recommendation
* W3C — Understanding Conformance
* W3C — How to Meet WCAG (Quick Reference)
* W3C — Evaluating Web Accessibility Overview
* W3C — Accessibility Evaluation Report Template
* W3C — Developing an Accessibility Statement
* U.S. Department of Justice — Guidance on Web Accessibility and the ADA
* U.S. Department of Justice — Title II Web and Mobile App Accessibility Rule

A legal-risk article supplied by a stakeholder may be retained as secondary context, but official W3C and DOJ materials remain the primary sources for this policy. This document does not offer a legal opinion about which law currently applies to WorkJax.

## Change Log

| Date | Change | Author |
|---|---|---|
| 2026-07-14 | Initial accessibility policy created for future operator adoption | WorkJax documentation |
