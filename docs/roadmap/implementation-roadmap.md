# WorkJax Implementation Roadmap

**Status:** `PROPOSED`

## Roadmap Principle

Build in dependency order. Do not build public profiles or sophisticated automation before the data model, operator, and safety controls exist.

## Phase 0 — Establish the Source of Truth

**Goal:** Make the existing prototype understandable and transferable.

- Add repository README and `docs/`
- Document current and target state
- Separate live, demo-only, and proposed functionality
- Create feature and decision templates
- Inventory all opportunity and event sources
- Identify GitHub and Vercel account ownership
- Record unresolved governance questions

**Exit criteria:** A new technical or operating partner can understand the prototype without relying on the original team.

## Phase 1 — Normalize the Data Model

**Goal:** Stop treating employers as opportunities.

- Create separate Employer, Employer Location, Opportunity, Experience, and Profile schemas
- Convert deadlines and event times to structured fields
- Add source, status, and freshness fields
- Add an explicit featured flag and expiration
- Define controlled category vocabularies
- Create migration mapping from `data.js`

**Exit criteria:** The data model supports multiple opportunities and locations per employer.

## Phase 2 — Add Shared Backend Foundations

**Goal:** Replace device-only behavior with shared, secure services.

- Select managed database and authentication provider
- Add Vercel API functions
- Create development, preview, and production environments
- Add authorization rules
- Add audit logs
- Add admin roles
- Migrate static content into the database
- Preserve the current frontend while replacing static reads incrementally

**Exit criteria:** Public content loads from a shared database and administrative changes persist.

## Phase 3 — Operationalize Opportunities

**Goal:** Build the most valuable and defensible core product.

- Create source registry
- Build initial adapters for priority employers
- Add daily synchronization
- Add deduplication
- Add automatic closure and expiry
- Add broken-link monitoring
- Add review queue
- Implement real saved opportunities
- Add employer pages
- Display source and last-verified date

**Exit criteria:** Priority opportunity sources update with minimal manual entry and errors are visible to an operator.

## Phase 4 — Operationalize Map and Experience Jax

**Goal:** Connect ecosystem data spatially and socially.

- Separate employer and opportunity locations
- Add address validation and geocoding
- Add industry and distance filters
- Support hybrid and remote labels
- Ingest priority event feeds
- Add structured event expiration
- Reconfirm recurring experiences
- Add transportation, accessibility, cost, and age fields
- Add persistent user RSVPs only after accounts exist

**Exit criteria:** Locations and events remain current through documented processes.

## Phase 5 — Design Connect Jax Safely

**Goal:** Launch only after privacy, moderation, and ownership are ready.

- Confirm operator and safety owner
- Obtain legal and safeguarding review
- Decide adult-only versus restricted minor launch
- Create authentication and email verification
- Separate private account email from public contact details
- Add visibility and consent controls
- Add report, suspension, and deletion workflows
- Add human moderation queue
- Add AI-assisted flagging
- Pilot with a small verified group

**Exit criteria:** Profiles are shared safely, users control visibility, and reports have an accountable response process.

## Phase 6 — Pilot and Transfer

**Goal:** Prove value and hand the system to a sustainable operator.

- Define target population and geography
- Establish baseline metrics
- Pilot with selected schools, employers, and programs
- Track application clicks, saves, freshness, and usage
- Collect user and employer feedback
- Confirm operating budget
- Transfer domain, infrastructure, credentials, documentation, and decision rights
- Publish maintenance and incident procedures

**Exit criteria:** An ecosystem partner has formally accepted operational ownership.
