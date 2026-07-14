# Community Event Platform

- **Current status:** `DEMO ONLY` prototype, shown as the first section of the `LIVE` Third Spaces page
- **Product owner:** TBD
- **Technical owner:** TBD
- **Content owner:** TBD
- **Last reviewed:** 2026-07-14
- **Related code:** `community-event-data.js`, `community-event-platform.js`, `index.html` (`#page-experience`), `styles.css` (`cep-` section)
- **Related data:** `window.COMMUNITY_EVENT_PLATFORM_DATA` (see [Data Structure](#data-structure) below)

## 1. Purpose

Community Event Platform is a prototype section shown first on the existing Third Spaces page. It adapts a separate public concept — a hospitality-first, SMS-oriented community app for Jacksonville — into a browser-only preview inside WorkJax, so the idea of "standing weekly traditions" can be explored alongside WorkJax's own curated Third Spaces content, without merging the two systems.

## 2. Relationship to the WorkJax Third Spaces Page

The Third Spaces page (`#page-experience`) is now a single continuous page, in this order:

1. The existing Third Spaces page introduction (unchanged).
2. **Community Event Platform** — the prototype described in this document, shown first.
3. A visual divider (`.cep-explore-transition`).
4. **Explore Jacksonville** — a heading and short introduction, followed directly underneath by the original, unchanged WorkJax Third Spaces experience: curated recurring-spot cards, the "ideas we're exploring" chips, and the scheduled-events grid with filters and demo RSVP. Nothing about this content's markup, data, or behavior changed — it was only un-wrapped from its former tab panel.

**As of 2026-07-14, the two sections are no longer presented as nested tabs.** A previous version of this page used an accessible tabs pattern (`role="tablist"`/`role="tab"`/`role="tabpanel"`) to switch between "Explore Jacksonville" and "Community Event Platform." That tab interface has been removed; both sections now render together on one continuous, scrollable page, with Community Event Platform first. An optional in-page link at the end of the Community Event Platform section ("Explore more Jacksonville spaces") points to `#explore-jacksonville` using normal anchor scrolling — no custom scroll animation was added.

The two sections remain functionally independent. Community Event Platform does not read from or write to the `events` array, `renderEvents()`, or the RSVP system that power Explore Jacksonville.

## 3. Source-Repository Attribution

- **Original repository:** [`espil77/3rd-Space`](https://github.com/espil77/3rd-Space) (public GitHub repository).
- **Original concept and assets:** the "Third Space" hospitality concept, its front-porch web copy ("Someone's already making plans for tonight.", the third-place explainer, the weekly schedule framing, "A peek at what's next," the closing line "The website is not the destination. Jacksonville is."), the weekly schedule in `content/traditions/weekly_schedule.md`, the time-of-day ("daypart") visual theming concept, and the three daypart reference images (`app/images/daypart-morning.png`, `daypart-midday.png`, `daypart-evening.png`) all originate from that repository's `app/index.html`, `app/script.js`, `app/styles.css`, and `content/traditions/weekly_schedule.md`.
- **Adaptation location in WorkJax:** `community-event-data.js`, `community-event-platform.js`, the `#cep-shell` markup in `index.html`, the `cep-` prefixed rules in `styles.css`, and the three copied images in `assets/community-event-platform/`.
- Being a public repository does not, by itself, grant a license to reuse its content or images. This adaptation is made for an internal prototype under the same product umbrella; before any real public launch, ownership and licensing of the concept, copy, and art should be explicitly confirmed with the source project.
- **Known limitation — asset licensing:** the three daypart images are reference art that the source repository's own code comments describe as supplied by its founder "for direction" and explicitly **not licensed for a public launch** ("needs a real commission or licensed source before shipping"). They have been copied into this repository as-is for prototype fidelity, per an explicit decision to proceed with a documented limitation rather than omit them. **Before any real public launch of this feature, these three images must be replaced with commissioned or properly licensed art**, or removed.

## 4. Public Content Imported or Adapted

Displayed in the WorkJax UI:

- The hero line, "Someone's already making plans for tonight."
- The "third place" explainer paragraph.
- The seven-day "This Week" schedule (all seven traditions from `content/traditions/weekly_schedule.md`), including the Sunday "anchor night" framing for Sunday Jazz.
- A "Today" indicator highlighting whichever tradition matches the visitor's local day.
- A "A peek at what's next" preview card driven by today's tradition.
- A demo-only "I'll Be There" interaction (see [Demo Attendance Behavior](#9-demo-attendance-behavior)).
- The closing line, "The website is not the destination. Jacksonville is."
- A visible verification notice and a labeled `PROPOSED` note about a possible future text-message concept.

## 5. Content Intentionally Not Displayed Publicly

The source repository's internal planning material is **not** reproduced on the public page. It is summarized here only:

- **Product/decision log** (`docs/00_PRODUCT.md`): the source project's v1 product is a two-beat SMS loop (a morning "tonight's plan" text and an afternoon "who's confirmed" text to YES-repliers), with no app and no chat. WorkJax's public page reflects only that a future opt-in text concept is being explored (see §11) — it does not reproduce the decision log, phone-number join flow, or internal reasoning.
- **SMS flow specification** (`docs/01_SMS_FLOWS.md`): join keyword, two daily message beats, inbound-message handling, cancellation flow, season-close/retention flow. None of this is built or exposed; summarized here for institutional context only.
- **Data rules** (`docs/02_DATA.md`): the source project's real design collects only phone number, first name, join date, and a same-day yes/no — nothing else, no attendance history, no exports. This minimal-collection principle is carried forward as the standard any future WorkJax SMS concept must meet (see §12).
- **Operations model** (`docs/03_OPERATIONS.md`): a single named "operator" verifies each tradition's accuracy once and handles rare cancellations; there is no per-night host role. This is why every tradition here defaults to `verificationStatus: "unverified"` — no such verification step has occurred in WorkJax.
- **Discovery-layer concept** (`docs/06_DISCOVERY_LAYER.md`): the source project explicitly considered, and declined to build, a broader citywide event aggregator/feed, to avoid becoming a content treadmill. WorkJax's Community Event Platform likewise stays to the same seven curated traditions — it is not a scraper or aggregator.
- **Design brief** (`docs/08_DESIGN_BRIEF.md`): the emotional arc ("uncertain → welcomed → comfortable → known → belonging") and non-negotiables (no gamification, no infinite feed, no bot-mediated interaction) informed the tone of the adapted copy and the deliberate absence of attendee counts or fabricated names.

## 6. Page Layout (Nested Tabs Removed 2026-07-14)

Community Event Platform is no longer presented in a nested tab alongside Explore Jacksonville. `index.html` previously wrapped both sections in a `role="tablist"` with two `role="tab"` buttons (`aria-selected`, roving `tabindex`) controlling two `role="tabpanel"` containers, and `community-event-platform.js` drove that pattern with `activateSubtab()`/`focusSubtab()`/`handleTabKeydown()`/`resetToDefaultSubtab()`. All of that markup and JavaScript has been removed. Community Event Platform now renders as a plain content section (`#cep-shell`) that is simply the first thing shown on the Third Spaces page; Explore Jacksonville renders directly beneath it as its own section (`#explore-jacksonville`) on the same continuous page. See §2 above for the full page order.

`community-event-platform.js`'s public interface is now minimal:

```js
window.CommunityEventPlatform = Object.freeze({ initialize });
```

`initialize()` only requires `#cep-shell` to exist in the DOM; it no longer depends on any tab elements. It is still called once, from `app.js`, when the visitor opens the Third Spaces page, and is idempotent (an internal `initialized` guard prevents duplicate timers or event listeners if it is ever called more than once).

## 7. Data Structure

`community-event-data.js` exposes a frozen (`Object.freeze`, applied to the top-level object, the traditions array, and each tradition record individually) global:

```js
window.COMMUNITY_EVENT_PLATFORM_DATA = {
  title: "Community Event Platform",
  tagline: "Someone's already making plans for tonight.",
  description: "...",
  footer: "The website is not the destination. Jacksonville is.",
  scheduleSource: "content/traditions/weekly_schedule.md (espil77/3rd-Space), adapted",
  lastReviewedAt: "2026-07-14",
  overallVerificationStatus: "unverified",
  traditions: [
    {
      id: "sunday-jazz",
      dayIndex: 0,            // 0=Sun..6=Sat, matches Date.getDay()
      dayLabel: "Sun",
      title: "Sunday Jazz",
      location: "Casbah Cafe",
      time: "starts 9:00pm",
      isAnchor: true,
      verificationStatus: "unverified",
      sourceNote: "Adapted from content/traditions/weekly_schedule.md (espil77/3rd-Space)…"
    }
    // …six more, one per day of the week
  ]
};
```

This dataset is **never merged into `data.js`'s `events` array**. It is read only by `community-event-platform.js`.

## 7a. Typography

**As of 2026-07-14, Community Event Platform uses Jumpstart Jax's existing site-wide typography tokens instead of its own font choices.** Previously, this section loaded and applied two source-specific display fonts (Playfair Display and Big Shoulders Display) adapted from the original `espil77/3rd-Space` prototype. Those two font families have been removed from every Community Event Platform selector and from the site's Google Fonts request (neither family is used anywhere else in Jumpstart Jax):

- **`var(--font-heading)` (Urbanist)** is now used for: the hero headline, section eyebrows and labels (including the theme-preview label), the "This Week" schedule title, day labels, tradition names, the Today/Anchor badges, the "I'll Be There" button, and the future-concept label — matching how Urbanist is used for headings everywhere else on the site.
- **`var(--font-body)` (Lora)** is now used for: `.cep-shell`'s base font (previously a hard-coded `'Lora', Georgia, serif` declaration), the verification notice, the theme-preview controls and status text, descriptions and explainer copy, location/time details, prototype and demo notes, the future-concept explanation, and the closing footer line — matching how Lora is used for body copy everywhere else on the site.
- The three daypart color themes (Morning, Afternoon/`midday`, Evening) are unchanged and remain visually distinct — only the font-family declarations changed, not colors, layout, spacing, or theme-switching behavior.
- This is a typography-consistency change, not a redesign: existing font sizes, weights (with one exception below), italics, line heights, letter spacing, and capitalization were preserved.
- One weight adjustment: the hero headline (`.cep-hero-line`) previously used `font-weight: 900`, a weight only available in the now-removed Playfair Display. Since the site's Urbanist request loads weights 700 and 800, this element now uses `font-weight: 800` — the heaviest Urbanist weight actually loaded — rather than declare a weight that doesn't exist in the loaded font.

## 8. Daypart Behavior and Theme-Preview Controls

Three time-of-day themes — Morning (5:00–10:59), Afternoon (11:00–16:59), Evening (all other hours) — are computed from the visitor's local device clock (`new Date().getHours()`), re-checked every 60 seconds. The `data-daypart` attribute is applied **only to `#cep-shell`**, never to `document.body`; every corresponding CSS custom property and rule is scoped under `.cep-shell[data-daypart="…"]`. No other page or component changes appearance when the daypart changes. The visible label for this theme is "Afternoon"; internally, the value, the CSS attribute, and the existing image filename all remain `midday` (no image was renamed).

**As of 2026-07-14, a public, accessible theme-preview control is included** (this reverses the earlier note in this document, which said the source project's developer-only preview toggle was intentionally omitted). Near the top of the section, before the hero, three native `<button>` controls — Morning, Afternoon, Evening — are grouped under `role="group" aria-label="Preview Community Event Platform theme"`, each with `aria-pressed="true"`/`"false"` reflecting the currently displayed theme. A smaller "Use my current time" button restores automatic behavior. A `role="status"` paragraph announces the active state in text (e.g., "Using Morning based on your device time." / "Previewing Afternoon.") to assistive technology.

**Automatic vs. manual state:**

- On page load, the module always computes and applies the visitor's current local-time theme first (automatic mode), marking the matching button as selected.
- Clicking Morning, Afternoon, or Evening immediately applies that theme, swaps the hero image, marks that button `aria-pressed="true"` (and visually distinguishes it with a checkmark and a heavier border — not color alone), and enters manual-preview mode.
- While in manual-preview mode, the 60-second automatic clock keeps running internally but does not overwrite the manually selected theme.
- Clicking "Use my current time" exits manual-preview mode, immediately recalculates the current local-time theme, updates the button/status text, and resumes normal automatic 60-second checking.
- The manual override is held only in an in-memory JavaScript variable for the current page load — it is **not** written to `localStorage`. A full page reload always re-initializes from the visitor's current local time.
- The automatic 60-second check only re-applies the theme (and only updates the status text) when the computed daypart has actually changed, so it does not repeatedly announce an unchanged theme to assistive technology.

## 9. Demo Attendance Behavior

The "I'll Be There" control on today's tradition is explicitly a prototype:

- Clicking it writes `{ traditionId, dayIndex, storedAt }` to `localStorage` under the WorkJax-prefixed key `workjax_cep_interest_v1`. Nothing is sent to a server; there is no server.
- It does not contact an organizer or venue, does not add the visitor to any shared or visible attendee list, does not claim other people can see the response, does not display any attendee names (real or fabricated), does not send an SMS, and does not require a profile.
- A visible note sits next to the control: "Prototype note: This response is stored only on this device. It does not notify the venue, organizer, or other users."
- After activating, the visitor sees "You marked yourself as interested on this device." and can click "Undo" to clear the local response.
- This is entirely separate from — and never combined with — the existing Explore Jacksonville RSVP data (`rsvpData` in `app.js`), which is also demo-only but modeled as a shared list of names.

## 10. Verification Limitations

- `overallVerificationStatus` and every individual tradition's `verificationStatus` are `"unverified"`. The source project's own schedule file marks its "Schedule verified" column as `TBD` for all seven traditions, so WorkJax carries the same status forward rather than inventing confirmation.
- A visible, non-alarming notice appears at the top of the panel: "Community platform prototype. Recurring traditions and times have not yet been independently verified by Jumpstart Jax. Confirm details with the venue before attending."
- No tradition is labeled "Verified," "Live," or equivalent, and none is described as officially hosted or run by WorkJax — each is presented as an already-existing, independently-run local event that this prototype merely lists.

## 11. SMS Concept as `PROPOSED`

A small, clearly labeled `PROPOSED` note explains that an opt-in text-message loop is being explored as a possible future concept, and that it is not active today — no phone number, SMS signup form, `sms:` link, phone-number collection, attendee-name sharing, SMS automation, or third-party messaging provider is implemented anywhere in this feature. No backend of any kind was added.

## 12. Privacy and Safety Implications

- No personal information is collected by this feature. The only client-side state it writes is the single local "I'll Be There" flag described in §9, scoped to the visitor's own browser.
- If a future SMS concept is ever built, the source material's data-minimization principles should carry forward as hard requirements: collect only phone number, first name, and join date; no attendance history; no export or resale of numbers; deletion on request (`STOP`); and a season-end retention/deletion policy. These are documented here as requirements for any future implementation, not as anything currently built.
- Per WorkJax's existing governance rules (`docs/governance/privacy-and-safety.md`), any future public/shared version of an attendance or messaging feature would need a named privacy and safeguarding owner, minor-safety review, and moderation plan before launch — none of which is in scope for this browser-only prototype.

## 13. Mobile and Accessibility Behavior

- Responsive: the hero image/panel pair stacks to a single column under 640px width; the theme-preview controls wrap onto additional lines and the shell padding adjusts under 520px, without introducing horizontal scrolling at narrow (~320px) widths.
- All interactive elements are native `<button>` elements (no fake links, no custom `<div>`-based controls, no custom select menu for theme choice), and the verification notice, demo note, future-concept note, and theme-status text are all rendered as visible text (not tooltip-only or icon-only).
- The theme-preview buttons use native keyboard activation (`Enter`/`Space` work automatically on `<button>` elements) and a visible `:focus-visible` outline; the currently selected theme is communicated through `aria-pressed`, a checkmark, and a heavier border — never through color alone.
- The theme-status text is exposed to assistive technology via `role="status"`.
- **This is a material interface change, and none of the above constitutes a completed accessibility evaluation.** Accessibility status for this feature remains `NOT ASSESSED`. Keyboard-execution, focus-order/visibility, color-contrast (in all three themes), 200%-zoom/reflow, screen-reader, and mobile touch-target testing have not been performed for this revised layout and remain required before any accessibility-verified claim can be made, per `docs/operations/accessibility.md`. The existing paused baseline accessibility audit (`docs/accessibility/baseline-audit-2026-07-14.md`) describes the previous nested-tab markup and was intentionally not updated as part of this change; its tab-specific findings (e.g. regarding `role="tablist"`/`role="tab"`) no longer describe the current markup and will need to be revisited in a future accessibility-focused pass.

## 14. Future Path to a Real Community Service

This prototype does not change WorkJax's target-state architecture. If a real, shared version of this concept is pursued, it would need (per `docs/architecture/target-state.md`'s existing principles): a named human operator to verify each tradition's accuracy, a decision on whether/how an SMS loop is built (with the data-minimization rules in §12), a moderation and privacy review before any shared or public attendance data is introduced, and an explicit decision on whether this content is ever merged with WorkJax's existing `events` data model — it is deliberately kept separate today.

## 15. Content Ownership and Maintenance Responsibility

Same as the rest of WorkJax's current-state documentation: no formal content owner is assigned today (see `docs/README.md`'s ownership table). Until an owner is named, changes to `community-event-data.js` should be made by hand, cross-checked against `content/traditions/weekly_schedule.md` in the source repository if that file changes.

## 16. How Schedule Verification Should Be Recorded

When a tradition's day/time/place is actually confirmed with the venue by a named WorkJax owner, update that record's `verificationStatus` to `"verified"` and update `sourceNote` to describe who verified it and when, rather than changing the default silently. Do not change `verificationStatus` based on the source repository alone — that repository's own schedule file has never marked any of these as verified either.

## Change Log

| Date | Change | Author |
|---|---|---|
| 2026-07-14 | Initial documentation; feature created | WorkJax engineering |
| 2026-07-14 | Restructured Third Spaces into one continuous page with Community Event Platform shown first; removed the nested Explore Jacksonville / Community Event Platform tab interface; added accessible Morning/Afternoon/Evening theme-preview controls and a "Use my current time" control; automatic local-time theme selection on initialize is preserved; accessibility status remains NOT ASSESSED | WorkJax engineering |
