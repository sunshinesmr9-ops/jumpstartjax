# Browser Navigation (History API Routing)

- **Current status:** `LIVE`
- **Product owner:** TBD
- **Technical owner:** TBD
- **Last reviewed:** 2026-07-14
- **Related code:** `app.js` (routing section, immediately after `showPage()`/`closeMobileNav()`), `index.html` (`onclick` handlers, `#detail-back-btn`)
- **Accessibility status:** `NOT ASSESSED` (see [Accessibility](#accessibility) below)

## 1. Purpose

Jumpstart Jax is a single static HTML document that swaps visible "page" sections with `showPage(pageId)`. Before this change, none of those switches touched browser history, so the Back button could not return a visitor to a previous view, and reloading never restored anything but Home. This feature adds lightweight, dependency-free routing on top of the existing rendering functions so Back and Forward behave the way visitors expect, without introducing a framework, a router package, or path-based routes.

## 2. Approach

Native browser History API only: `history.pushState()`, `history.replaceState()`, and the `popstate` event. No React, Vue, router package, or other dependency was added. `showPage(pageId)` and `showDetail(id)` remain exactly what they were — pure rendering functions with no history side effects. A new routing layer in `app.js` is solely responsible for reading and writing `history`/the URL and then calling those existing render functions:

| Function | Responsibility |
|---|---|
| `routeFromLocation()` | Parses `?view=`/`&employer=` from the URL, validates both, falls back to Home on anything invalid |
| `getCurrentRoute()` | Returns `history.state` if it's ours, else derives a route from the URL |
| `buildRouteUrl(route)` | Builds the URL for a route, preserving any unrelated query parameters already present |
| `saveScrollToCurrentEntry()` | `replaceState`s the *current* entry with the live scroll position (see [Scroll Restoration](#6-scroll-restoration)) |
| `pushRoute(route)` | Adds one new history entry with the app's state shape |
| `renderRoute(route, options)` | The single place that calls `showPage()` or `showDetail()`; used by every other function below |
| `navigateToPage(pageId)` | User-facing top-level navigation: saves scroll, pushes a route, renders, moves focus |
| `navigateToEmployer(employerId)` | User-facing employer navigation: same, plus records where the visitor came from |
| `goBackFromDetail()` | The in-page "← Back" button's handler (see [§5](#5-in-page-back-button)) |
| `handlePopState(event)` | The `popstate` listener — renders a route but **never** pushes a new one |
| `replaceInitialRoute()` | Runs once on load; establishes the starting history entry with `replaceState`, not `pushState` |

**Critical rule, enforced by construction:** `handlePopState()` and `replaceInitialRoute()` only ever call `renderRoute()`, and `renderRoute()` itself never calls `pushState`/`replaceState`. Only `navigateToPage()`, `navigateToEmployer()`, and `saveScrollToCurrentEntry()` touch history-writing APIs, and none of them run in response to `popstate`. This makes it structurally impossible for pressing Back to create another history entry or loop.

## 3. Supported Routes

Query-string routes on the same static document (no Vercel rewrite rules needed, no path segments):

| Route | Page |
|---|---|
| `?view=home` | Home |
| `?view=opportunities` | Find Opportunities |
| `?view=map` | Employer Map |
| `?view=experience` | Third Spaces |
| `?view=connect` | Community Hub |
| `?view=detail&employer=<id>` | Employer detail for the given stable numeric employer `id` |

Any other or missing `view` value falls back to `home`. Any unrelated query parameters already on the URL (e.g. a marketing `utm_source`) are preserved by `buildRouteUrl()`, which only ever adds/replaces its own `view`/`employer` keys.

### History state shape

```js
{
  app: 'jumpstart-jax',
  page: 'detail',
  employerId: 41,          // stable numeric id, or null
  originPage: 'opportunities', // which top-level page a detail view was opened from, or null
  scrollY: 340,             // last known scroll position for this entry
  navIndex: 3               // this app's own monotonically increasing history-depth counter
}
```

No employer records, API payloads, profile data, or other sensitive/bulky content is stored in history — only the employer's existing stable numeric `id`. `navIndex` is our own counter (not `history.length`, which could include pages outside Jumpstart Jax); it's what lets the in-page Back button decide whether a safe internal entry exists (see §5).

## 4. Direct Detail-Page Reload Behavior

Loading (or reloading) `?view=detail&employer=41` directly:

1. `replaceInitialRoute()` parses the query string.
2. Validates `view=detail` and that employer `41` actually exists in `employers`.
3. If valid, renders that employer's detail page and establishes it as the starting history entry via `history.replaceState()` (not `pushState()`, so no extra Back entry is created for a page that hasn't navigated anywhere yet).
4. If the employer id is missing, non-numeric, or doesn't match any employer, the route silently falls back to `home` and that fallback is what gets `replaceState`d — no error is thrown, no blank page, no console exception.

## 5. In-Page Back Button

The old "← Back to Opportunities" button is now labeled **"← Back"** and calls `goBackFromDetail()`:

1. If the current history entry is a Jumpstart Jax detail entry with `navIndex > 0` — proof it was reached via this app's own `pushState`, meaning a same-tab prior entry exists immediately behind it — it calls `history.back()`. The resulting `popstate` renders whatever page (Opportunities, Employer Map, Home, Third Spaces, Community Hub) the visitor actually came from.
2. Otherwise (the detail page was the very first thing loaded in the tab, e.g. a shared link or a new tab, so `navIndex === 0`), it calls `navigateToPage('opportunities')` instead — a safe, in-site fallback that never sends the visitor away from Jumpstart Jax. This intentionally does **not** rely on `history.length`, which could include pages outside the site.
3. The button's `aria-label` is updated on every detail render (`updateDetailBackButton()`) to name the actual origin — "Back to Home", "Back to Find Opportunities", "Back to Employer Map", "Back to Third Spaces", or "Back to Community Hub" — while its visible text stays the short, generic "Back".
4. It is a native `<button id="detail-back-btn">`; nothing about its keyboard operability or visible focus style changed.

## 6. Scroll Restoration

`history.scrollRestoration = 'manual'` is set once, disabling the browser's own (often-wrong-for-SPAs) automatic behavior.

- Before every deliberate navigation (`navigateToPage`/`navigateToEmployer`), the entry being left has its `scrollY` updated via `replaceState` immediately beforehand.
- In addition, a lightweight, debounced (`200ms`) `scroll` listener continuously keeps the *current* entry's saved `scrollY` fresh. This exists because the browser gives page code no opportunity to run immediately before a native Back/Forward transition — without it, returning to a page via the browser's own Back/Forward buttons (rather than an in-app link) could restore a stale or zero scroll position. With it, restoration is accurate regardless of how the visitor leaves a page.
- On `popstate`, after the target route renders, `window.scrollTo(0, route.scrollY)` restores the saved position.
- A **newly** selected top-level page or a **newly** opened employer detail always starts at the top — only Back/Forward restore a previous scroll position.

## 7. Preserved Opportunity Filters

Returning to Find Opportunities via Back does not call `clearAllFilters()` or reset any filter/search/sort control. The Opportunities page's DOM (checkboxes, search input, sort `<select>`, and the rendered results grid) is never torn down when navigating to a detail page — it's simply hidden — so its state is exactly as the visitor left it. No filter values were added to the URL in this change (out of scope per the design brief); the filters live only in the existing DOM/`localStorage` state they already used.

## 8. Map Restoration

A single change to `showPage()` — an added `if (pageId === 'map') ensureMapReady();` branch — makes map initialization/refresh work uniformly no matter how the Map page is reached: top navigation, browser Back, browser Forward, or a direct `?view=map` reload all call `showPage('map')` exactly once, and `ensureMapReady()` calls the existing idempotent `initMap()` and then `mapInstance.invalidateSize()` (deferred one tick so it runs after the section is actually visible) every time.

**Bug fix bundled with this work:** `mapInitialized` and `mapInstance` were used throughout `app.js` but were never declared anywhere with `let`/`var` — a pre-existing defect (confirmed present before this change, unrelated to routing) that made `initMap()` throw a `ReferenceError` on its very first call. Both are now declared immediately above `initMap()`. This was necessary for the map-routing requirement above to be satisfiable at all; it changes no map data, marker placement, popup content, or other map behavior.

## 9. Page-Title Updates

`updateDocumentTitle(route)` runs on every render:

| Route | Title |
|---|---|
| Home | `Home \| Jumpstart Jax` |
| Find Opportunities | `Find Opportunities \| Jumpstart Jax` |
| Employer detail | `[Employer name] \| Jumpstart Jax` |
| Employer Map | `Employer Map \| Jumpstart Jax` |
| Third Spaces | `Third Spaces \| Jumpstart Jax` |
| Community Hub | `Community Hub \| Jumpstart Jax` |

## 10. Focus Behavior

For a deliberate navigation (top nav, a Home card, an opportunity card, a search suggestion, a map marker/sidebar link, "View on Map"), focus moves to the destination page's existing `<h1>` (a temporary `tabindex="-1"` is added if it isn't already focusable), using `{ preventScroll: true }` so it never fights the scroll position already established. For `popstate` (Back/Forward) and the very first page load, focus is **not** moved — per accessibility guidance, Back/Forward should restore the previous view and scroll position without a disruptive, unexpected focus jump.

## 11. Known Limitations

- **Scroll restoration on repeated Back/Forward cycling is best-effort, not guaranteed pixel-perfect.** The continuous scroll listener (§6) is debounced at 200ms, so a very rapid navigation immediately after scrolling could occasionally restore a slightly stale position. This is a deliberate, disclosed trade-off, not a silent gap.
- **Filters are not encoded in the URL.** Two tabs/reloads on the exact same `?view=opportunities` URL can show different filter states if the visitor changed filters after loading, since filter state lives in the DOM/session, not the URL. This was explicitly out of scope for this change.
- **No accessibility conformance is claimed.** This is a material interface change. Keyboard, focus-order, screen-reader, and mobile testing of the new navigation controls have not been performed as part of this change. Accessibility status remains `NOT ASSESSED`, consistent with `docs/operations/accessibility.md`. The existing paused baseline accessibility audit was not updated as part of this work.
- **`navIndex` is per-tab, in-memory only.** It resets to 0 on a fresh load (by design, since `replaceInitialRoute()` always starts a new tab's counter at 0) and is not persisted, so it cannot distinguish "user reloaded this exact detail URL" from "browser restored this tab after being closed and reopened" — both are treated the same (safe fallback to Find Opportunities on in-page Back), which is the conservative, safe choice.

## 12. Testing Requirements

See the manual testing checklist delivered alongside this feature's implementation summary. At minimum, before considering this feature verified for a release, a reviewer should manually confirm: all required Back/Forward flows in the original request, direct-URL reload of a detail page, invalid-route fallback, scroll restoration in both directions, map re-initialization from all four entry points, filter/search/sort preservation, keyboard operability of the in-page Back button and all nav controls, and that the D&B/Miller live-feed endpoints are not called twice per detail render. None of this manual testing has been executed as part of this documentation-writing step — this section describes what must still be done, not what has been confirmed.

## Change Log

| Date | Change | Author |
|---|---|---|
| 2026-07-14 | Initial browser-navigation feature and documentation created | WorkJax engineering |
