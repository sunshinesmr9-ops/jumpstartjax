# WorkJax Documentation Hub

## Purpose

This directory is the single source of truth for the WorkJax product and its technical and operational architecture.

It documents both:

1. **Current state** — what the prototype actually does today.
2. **Target state** — what must exist for WorkJax to operate as a sustainable public platform.

Proposed functionality must not be described as live functionality.

## Product Definition

WorkJax is intended to support the broader Northeast Florida workforce ecosystem by helping young people:

- Find experiential learning opportunities
- Understand where employers and opportunity sites are located
- Discover Jacksonville events and recurring community spaces
- Connect with other young people through external contact channels

WorkJax is not intended to process opportunity applications or provide direct messaging.

## Documentation Map

### Architecture

- [Current State](architecture/current-state.md)
- [Target State](architecture/target-state.md)
- [System Context](architecture/system-context.md)

### Features

- [Find Opportunities](features/opportunities.md)
- [Employer Map](features/employer-map.md)
- [Experience Jax](features/experience-jax.md)
- [Community Event Platform](features/community-event-platform.md)
- [Connect Jax](features/connect-jax.md)
- [Browser Navigation](features/browser-navigation.md)

### Data

- [Target Data Model](data/data-model.md)
- [Current Data Dictionary](data/current-data-dictionary.md)
- [Migration Map](data/migration-map.md)
- [Date Normalization Audit](data/date-normalization-audit.md)

### Integrations

- [API Evaluation](integrations/api-evaluation.md)
- [ATS Source Audit](integrations/ats-source-audit.md)
- [Fanatics Greenhouse Validation](integrations/fanatics-greenhouse-validation.md)
- [Employer Live-Opportunity Feed Registry](integrations/employer-feed-registry.md)
- [Dun & Bradstreet Lever Postings Proof of Concept](integrations/dnb-lever-poc.md)
- [Miller Electric Official Internship-Program Page](integrations/miller-internship-program.md)

### Operations and Governance

- [Content Ingestion](operations/content-ingestion.md)
- [Employer Feed Monitoring](operations/employer-feed-monitoring.md)
- [Monthly ATS Discovery](operations/monthly-ats-discovery.md)
- [Privacy and Safety](governance/privacy-and-safety.md)
- [Open Governance Questions](governance/open-questions.md)

### Accessibility

- [Accessibility Policy](operations/accessibility.md)
- [WCAG 2.2 AA Checklist](accessibility/wcag-2.2-aa-checklist.md)
- [Accessibility Audit Log](accessibility/accessibility-audit-log.md)
- [Baseline Accessibility Audit — 2026-07-14](accessibility/baseline-audit-2026-07-14.md) (Chrome Lighthouse Navigation audit, Home page only)
- [Manual Accessibility Test Protocol](accessibility/manual-test-protocol.md) (Minimum Prototype Review — not yet executed)
- [Accessibility Statement Draft](accessibility/accessibility-statement-draft.md) (internal draft only — not published)

WorkJax targets **WCAG 2.2 Level AA** as a proposed technical standard. The current site-wide accessibility status is **`ASSESSMENT IN PROGRESS`**: two real Chrome Lighthouse Navigation audits (desktop and mobile) of the Home page's default state were run 2026-07-14 (see the baseline audit above), turning up preliminary findings on color contrast, heading order, and (mobile only) a missing main landmark. This is Home-page automated evidence only — it is not a site-wide score, and it does not cover Find Opportunities, Employer Map, Third Spaces, Community Hub, or employer detail pages, since Lighthouse's Navigation mode reloads the site and lands on Home. No manual keyboard, screen-reader, zoom/reflow, or mobile touch-target testing has been performed yet (see the Manual Accessibility Test Protocol above). WorkJax must not be described as ADA compliant, fully accessible, or WCAG certified until a documented evaluation has been completed for a defined scope.

### Roadmap and Decisions

- [Implementation Roadmap](roadmap/implementation-roadmap.md)
- [ADR-001: Managed Backend and Automated Ingestion](decisions/ADR-001-managed-backend.md)
- [ADR-002: Ticketmaster Discovery API Event Proof of Concept](decisions/ADR-002-ticketmaster-event-poc.md)
- [ADR-003: Dun & Bradstreet Lever Postings Job Proof of Concept](decisions/ADR-003-dnb-lever-job-poc.md)

### Templates

- [Feature Documentation Template](templates/feature-template.md)

## Status Labels

Use these labels consistently:

| Label | Meaning |
|---|---|
| `LIVE` | Implemented and usable in the current deployed site |
| `DEMO ONLY` | Simulated locally and not shared across users |
| `PROPOSED` | Recommended target-state functionality |
| `TBD` | Requires a product, technical, legal, or governance decision |
| `DEPRECATED` | No longer intended for use |

## Documentation Ownership

Technical custody does not establish legal or organizational operation of the WorkJax service. The table below separates who currently maintains the prototype and its documentation (technical custody) from who is formally responsible for operating WorkJax (formal operational ownership). Historical contributor information is retained for accuracy; it does not assign legal, accessibility, or operational responsibility to those contributors.

### Technical Custody

| Area | Current Technical Custodian |
|---|---|
| Product documentation | Civic Collaboration team |
| Source code and repository | Serena Ray / current repository owner |
| Opportunity content | No formal owner |
| Event content | No formal owner |
| Student profile moderation | No formal owner |
| Infrastructure and deployment | Current repository/Vercel owner |

Serena Ray's and the current repository owner's technical custody reflects code and repository maintenance only. It does not make Serena Ray, the Civic Collaboration team, Jacksonville Civic Council, or any current contributor the legal operator of WorkJax, and none of them are assigned formal accessibility, remediation, or complaint-handling responsibility unless the repository documents that they have formally and explicitly accepted that role in writing.

### Formal Operational Ownership

| Role | Status |
|---|---|
| WorkJax operator | UNASSIGNED |
| Product owner | UNASSIGNED |
| Accessibility owner | UNASSIGNED |
| Accessibility remediation owner | UNASSIGNED |
| Long-term content owner | UNASSIGNED |

Jacksonville Civic Council must not be described as the WorkJax operator unless it formally accepts that role in writing. See `docs/operations/accessibility.md` and `docs/governance/open-questions.md` for the accessibility- and operator-related governance questions this raises.
