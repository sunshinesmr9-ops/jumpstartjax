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
- [Connect Jax](features/connect-jax.md)

### Data

- [Target Data Model](data/data-model.md)
- [Current Data Dictionary](data/current-data-dictionary.md)
- [Migration Map](data/migration-map.md)

### Operations and Governance

- [Content Ingestion](operations/content-ingestion.md)
- [Privacy and Safety](governance/privacy-and-safety.md)
- [Open Governance Questions](governance/open-questions.md)

### Roadmap and Decisions

- [Implementation Roadmap](roadmap/implementation-roadmap.md)
- [ADR-001: Managed Backend and Automated Ingestion](decisions/ADR-001-managed-backend.md)

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

| Area | Current Owner | Long-Term Owner |
|---|---|---|
| Product documentation | Civic Collaboration team | TBD ecosystem operator |
| Source code | Serena Ray / current repository owner | TBD |
| Opportunity content | No formal owner | TBD |
| Event content | No formal owner | TBD |
| Student profile moderation | No formal owner | TBD |
| Infrastructure and deployment | Current repository/Vercel owner | TBD |
