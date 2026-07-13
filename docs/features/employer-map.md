# Employer Map

**Current status:** `LIVE` map using hard-coded coordinates  
**Target status:** `PROPOSED` data-driven opportunity-site map

## Purpose

Help students understand where experiential-learning opportunities are physically located and connect employer locations to current opportunities.

## Product Rules

- A pin represents an internship or experiential-learning site, not necessarily an employer headquarters.
- One employer may have multiple opportunity sites.
- Clicking a pin should open both employer information and current opportunities.
- Users should be able to filter by industry and distance.
- Addresses should be geocoded after validation.
- Remote roles should not receive physical pins.
- Hybrid roles may display a physical site with a hybrid badge.

## Target Data Flow

```mermaid
flowchart LR
    A[Validated employer address] --> B[Geocoding service]
    B --> C[Latitude and longitude]
    C --> D[Employer Location record]
    D --> E[Map pin]
    F[Opportunity] --> D
    E --> G[Employer and opportunity panel]
```

## Components

| Component | Purpose |
|---|---|
| Map | Displays opportunity sites |
| Location card | Shows employer, address, industry, and number of active opportunities |
| Industry filter | Limits visible locations |
| Distance filter | Uses a user-provided location or approved device location |
| Detail panel | Displays employer summary and all active opportunities at the selected site |
| External directions link | Opens a mapping provider |

## Privacy Rule

The map should never expose a student's home, school schedule, or precise live location. Device location should be optional and used only to calculate distance in the current session unless the user explicitly consents otherwise.
