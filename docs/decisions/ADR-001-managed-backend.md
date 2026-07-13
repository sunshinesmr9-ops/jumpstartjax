# ADR-001: Managed Backend and Automated Ingestion

- **Status:** Proposed
- **Date:** 2026-07-12
- **Decision owner:** TBD
- **Technical owner:** TBD

## Context

The current prototype is a static HTML/CSS/JavaScript site hosted on Vercel. All shared product content is hard-coded, while saves and created profiles exist only in the visitor's browser.

The target product requires:

- Shared opportunity and event data
- Automatic daily updates
- Automatic expiration
- User-owned profiles and saved opportunities
- Administrative review
- Source tracking
- Moderation and deletion workflows

## Proposed Decision

Retain Vercel as the web-hosting and serverless execution platform while adding a managed PostgreSQL database and authentication service.

Use server-side API functions for:

- Secure writes
- Administrative actions
- Source synchronization
- Geocoding
- Moderation actions
- Secrets and external API keys

Use a scheduled daily job to run the ingestion pipeline.

A likely implementation candidate is a managed PostgreSQL and authentication platform such as Supabase, but vendor selection remains open.

## Why This Direction

- Avoids operating a traditional server
- Supports incremental migration from the current static prototype
- Provides shared persistence
- Supports relational data needed by employers, opportunities, locations, profiles, saves, and RSVPs
- Allows authorization rules and auditability
- Fits the existing Vercel deployment model
- Supports scheduled ingestion

## Alternatives Considered

### Continue with hard-coded JavaScript

**Rejected for production.**

It cannot support reliable automatic updates, shared profiles, cross-device saves, moderation, or administrative workflows.

### Use a spreadsheet as the production database

**Possible for an early content pilot, but not preferred long term.**

It may reduce initial technical complexity but becomes difficult for relationships, authorization, moderation, audit logs, and profile data.

### Rewrite immediately in a large frontend framework

**Not required as the first step.**

The architecture problem is primarily shared data, operations, and governance. A framework rewrite should occur only if justified by maintainability and operator capacity.

### Require every employer to enter listings manually

**Rejected as the default.**

Employer feedback indicates that duplicate entry creates friction. Manual submission should be a fallback rather than the main data strategy.

## Consequences

### Positive

- Shared source of truth
- Automatic expiration and synchronization
- Real user ownership
- Better transferability
- Stronger data quality and auditability

### Negative

- Ongoing hosting and service costs
- Need for technical maintenance
- Need for security and privacy controls
- Need for human review
- Potential source breakage
- More complex deployment and environment management

## Open Questions

- Which partner will own the accounts and billing?
- Which managed database vendor will be selected?
- Who will maintain source adapters?
- What is the daily review requirement versus automatic publication threshold?
- Which profile features are allowed for minors?
