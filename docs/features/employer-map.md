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

## Browser Navigation

**Status:** `LIVE`, added 2026-07-14. See `docs/features/browser-navigation.md` for the full routing approach.

- Opening the Employer Map via top navigation, browser Back, browser Forward, or a direct `?view=map` reload all now converge on the same `showPage('map')` code path, which calls a new `ensureMapReady()` helper: an idempotent `initMap()` call followed by `mapInstance.invalidateSize()` once the section is visible, so Leaflet always renders at the correct size regardless of entry point.
- Clicking a marker popup's "View Programs →" button or a sidebar "View Programs →" link now calls `navigateToEmployer(id)` instead of rendering the detail page directly, so it creates a proper history entry; Back from the resulting detail page returns to the Employer Map with its marker layer and sidebar employer list intact.
- **Bug fix included in this change:** `mapInitialized` and `mapInstance` were referenced throughout `app.js` (`initMap()`, `focusEmployer()`) but were never declared with `let`/`var` anywhere in the file — a pre-existing defect (present before this change) that caused `initMap()` to throw a `ReferenceError` on its first call in non-strict script mode. Both are now declared once, immediately before `initMap()`. This does not change any map data, marker placement, or behavior described above — it only makes the existing, documented map-initialization guard actually work.
